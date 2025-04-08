import { StatusCodes } from "http-status-codes";
import prismaClient from "../database";
import { NotFoundError, StatusError } from "../utils/errors";
import UserService from "./user-service";

enum OrderStatusType {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

const getStatus = async (status: OrderStatusType) => {
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

const getAllOrders = async (userId: number) => {
  // Logic to get all orders for a specific user
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      userId: userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return orders;
};

const getOrderById = async (orderId: number) => {
  // Logic to get order by ID
  const order = await prismaClient.orderDetail.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return order;
};

const createOrder = async (userId: number) => {
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
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  await prismaClient.orderStatus.create({
    data: {
      orderId: order.id,
      statusId: (await getStatus(OrderStatusType.PENDING)).id,
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

const OrderService = {
  getAllOrders,
  getOrderById,
  createOrder,
};

export default OrderService;
