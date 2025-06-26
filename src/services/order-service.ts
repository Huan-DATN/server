import { StatusCodes } from "http-status-codes";
import { OrderStatusEnum } from "../constants/orderStatusEnum";
import prismaClient from "../database";
import { CreateOrderBodyType } from "../schemaValidations/request/create-order";
import { PlanOrderBodyType } from "../schemaValidations/request/plan-order";
import { CheckoutOrderResType } from "../schemaValidations/response/order";
import { NotFoundError, StatusError } from "../utils/errors";
import UserService from "./user-service";

const getStatus = async (status: OrderStatusEnum) => {
  // Logic to get order status by status type
  const orderStatus = await prismaClient.status.findFirst({
    where: {
      type: {
        equals: status,
      },
    },
  });

  if (!orderStatus) {
    throw new NotFoundError("Order status not found");
  }

  return orderStatus;
};

const getAllOrders = async (userId: number, { limit = 1, page = 10 }) => {
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    prismaClient.orderDetail.findMany({
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            shopId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        shop: {
          include: {
            image: true,
          },
        },
        OrderStatus: {
          include: {
            status: true,
          },
          orderBy: {
            statusId: "asc",
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    }),
    prismaClient.orderDetail.count({
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            shopId: userId,
          },
        ],
      },
    }),
  ]);

  return {
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: page,
  };
};

const getOrderById = async (orderId: number) => {
  // Logic to get order by ID
  const order = await prismaClient.orderDetail.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: true,
      shop: {
        include: {
          image: true,
        },
      },
      OrderStatus: {
        include: {
          status: true,
        },
        orderBy: {
          statusId: "asc",
        },
      },
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const comment = await prismaClient.rating.findFirst({
    where: {
      orderId: orderId,
    },
  });

  const payment = await prismaClient.payment.findUnique({
    where: {
      orderId: orderId,
    },
    include: {
      image: true,
    },
  });

  return {
    ...order,
    payment,
    isCommented: !!comment,
  };
};

const createOrder = async (
  userId: number,
  shopId: number,
  body: CreateOrderBodyType,
) => {
  const user = await UserService.getUserById(userId);

  if (user.address === null) {
    throw new NotFoundError("User address not found");
  }

  if (user.phone === null) {
    throw new NotFoundError("User phone number not found");
  }

  const items = await prismaClient.cartItem
    .findMany({
      where: {
        userId: userId,
        product: {
          userId: shopId,
        },
      },
      include: {
        product: true,
      },
    })
    .then((items) => {
      if (items.length == 0) {
        throw new StatusError({
          status: StatusCodes.BAD_REQUEST,
          message: "User cart is empty",
        });
      }

      return items;
    });

  // Logic to calculate total amount from items
  const totalAmount = items.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  // logic to update the product quantity
  await Promise.all(
    items.map(async (item) => {
      const product = await prismaClient.product.findUnique({
        where: {
          id: item.productId,
        },
      });
      if (!product) {
        throw new NotFoundError("Product not found");
      }
      if (product.quantity < item.quantity) {
        throw new StatusError({
          status: StatusCodes.BAD_REQUEST,
          message: `Product ${product.name} is out of stock`,
        });
      }
      await prismaClient.product.update({
        where: {
          id: item.productId,
        },
        data: {
          quantity: product.quantity - item.quantity,
        },
      });
    }),
  );

  // Logic to create an order
  const order = await prismaClient.orderDetail.create({
    data: {
      userId: userId,
      total: totalAmount,
      addressLine: user.address,
      phone: user.phone,
      shopId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      },
      paymentMethod: body.paymentMethod,
    },
    include: {
      items: {
        include: {
          product: {},
        },
      },
    },
  });

  await prismaClient.orderStatus.create({
    data: {
      orderId: order.id,
      statusId: (await getStatus(OrderStatusEnum.PENDING)).id,
    },
  });

  // Logic to delete items from the cart
  await prismaClient.cartItem.deleteMany({
    where: {
      userId: userId,
    },
  });

  return order;
};

//#region Checkout

const getCheckout = async (
  userId: number,
  shopId: number,
): Promise<CheckoutOrderResType["data"]> => {
  const cartItems = await prismaClient.cartItem.findMany({
    where: {
      userId,
      product: {
        userId: shopId,
      },
    },
    include: {
      product: {
        include: {
          images: true,
          user: {
            select: {
              id: true,
              shopName: true,
              phone: true,
              address: true,
            },
          },
        },
      },
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new StatusError({
      status: StatusCodes.BAD_REQUEST,
      message: "User cart is empty",
    });
  }

  const shop = await UserService.getUserById(shopId);
  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  return {
    shop,
    cartItems,
    totalPrice,
  };
};

//#region

// #region Create Plan
const createPlan = async (
  shopId: number,
  orderId: number,
  planOrder: PlanOrderBodyType,
) => {
  const order = await prismaClient.orderDetail.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.shopId !== shopId) {
    throw new StatusError({
      status: StatusCodes.FORBIDDEN,
      message: "You are not allowed to create a plan for this order",
    });
  }

  await Promise.all(
    planOrder.map(async (item) => {
      const status = await prismaClient.status.findUnique({
        where: {
          id: item.statusId,
        },
      });

      await prismaClient.orderStatus.create({
        data: {
          date: new Date(item.date), // Convert string to DateTime
          status: {
            connect: {
              id: item.statusId,
            },
          },
          orderDetail: {
            connect: {
              id: orderId,
            },
          },
          isActive:
            status?.type === OrderStatusEnum.CONFIRMED ||
            status?.type === OrderStatusEnum.PENDING,
        },
      });
    }),
  );
};

// #endregion
// #region Update Status
const updateStatus = async (orderId: number, statusId: number) => {
  await prismaClient.orderStatus.updateMany({
    where: {
      orderId,
      statusId,
    },
    data: {
      isActive: true,
    },
  });
};
// #endregion

//#region Complete Order
const completeOrder = async (orderId: number) => {
  const order = await prismaClient.orderDetail.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  await prismaClient.orderDetail.update({
    where: {
      id: orderId,
    },
    data: {
      isDone: true,
    },
  });

  await prismaClient.orderStatus.create({
    data: {
      date: new Date(),
      orderDetail: {
        connect: {
          id: orderId,
        },
      },
      status: {
        connect: {
          id: (await getStatus(OrderStatusEnum.DELIVERED)).id,
        },
      },
      isActive: true,
    },
  });
};
//#endregion

const OrderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  getCheckout,
  createPlan,
  updateStatus,
  completeOrder,
};

export default OrderService;
