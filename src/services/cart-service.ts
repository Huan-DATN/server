import { StatusCodes } from "http-status-codes";
import prismaClient from "../database";
import {
  AddItemToCartBodyType,
  UpdateCartItemBodyType,
} from "../schemaValidations/cart.schema";
import { CartResType } from "../schemaValidations/response/cart";
import { NotFoundError, StatusError } from "../utils/errors";

const addItemToCart = async (userId: number, body: AddItemToCartBodyType) => {
  const item = await prismaClient.product.findUnique({
    where: {
      id: body.productId,
    },
  });

  if (!item) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  if (item.quantity < body.quantity) {
    throw new StatusError({
      message: "Số lượng sản phẩm không đủ",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  // Simulate adding item to cart
  const existingItem = await prismaClient.cartItem.findFirst({
    where: {
      userId,
      productId: body.productId,
    },
  });

  if (existingItem) {
    // Update quantity if item already exists in cart
    return await prismaClient.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + body.quantity,
      },
    });
  } else {
    // Create new cart item
    return await prismaClient.cartItem.create({
      data: {
        userId,
        productId: body.productId,
        quantity: body.quantity,
      },
    });
  }
};

const getCart = async (userId: number): Promise<CartResType["data"]> => {
  const cartItems = await prismaClient.cartItem.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
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
    return [];
  }

  const groupedCartItems = cartItems.reduce((acc, item) => {
    const shopId = item.product.userId;
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: {
          id: shopId,
          shopName: item.product.user.shopName,
          phone: item.product.user.phone,
          address: item.product.user.address,
        },
        cartItems: [],
        totalPrice: 0,
      };
    }
    acc[shopId].cartItems.push(item);
    acc[shopId].totalPrice =
      (acc[shopId].totalPrice || 0) + item.product.price * item.quantity;
    return acc;
  }, {} as Record<number, { shop: any; cartItems: typeof cartItems; totalPrice: number }>);

  return Object.values(groupedCartItems);
};

const deleteCartItem = async (userId: number, cartItemId: number) => {
  const cartItem = await prismaClient.cartItem.findUnique({
    where: {
      id: cartItemId,
    },
    include: {
      product: true,
    },
  });
  if (!cartItem) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }
  if (cartItem.userId !== userId) {
    throw new StatusError({
      message: "Bạn không có quyền xóa sản phẩm này",
      status: StatusCodes.FORBIDDEN,
    });
  }

  await prismaClient.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });
  return cartItem;
};

const updateCartItem = async (
  userId: number,
  cartItemId: number,
  body: UpdateCartItemBodyType,
) => {
  const cartItem = await prismaClient.cartItem.findUnique({
    where: {
      id: cartItemId,
    },
    include: {
      product: true,
    },
  });
  if (!cartItem) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }
  if (cartItem.userId !== userId) {
    throw new StatusError({
      message: "Bạn không có quyền sửa sản phẩm này",
      status: StatusCodes.FORBIDDEN,
    });
  }

  const item = await prismaClient.product.findUnique({
    where: {
      id: cartItem.productId,
    },
  });
  if (!item) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }
  if (item.quantity < body.quantity) {
    throw new StatusError({
      message: "Số lượng sản phẩm không đủ",
      status: StatusCodes.BAD_REQUEST,
    });
  }

  await prismaClient.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity: body.quantity,
    },
  });
  return cartItem;
};

const deleteCartItemByShop = async (userId: number, shopId: number) => {
  const cartItems = await prismaClient.cartItem.findMany({
    where: {
      userId,
      product: {
        userId: shopId,
      },
    },
  });
  if (!cartItems || cartItems.length === 0) {
    throw new NotFoundError("Không có sản phẩm nào trong giỏ hàng");
  }

  await prismaClient.cartItem.deleteMany({
    where: {
      userId,
      product: {
        userId: shopId,
      },
    },
  });
};

const CartService = {
  addItemToCart,
  getCart,
  deleteCartItem,
  updateCartItem,
  deleteCartItemByShop,
};
export default CartService;
