import { StatusCodes } from "http-status-codes";
import prismaClient from "../database";
import {
  AddItemToCartBodyType,
  UpdateCartItemBodyType,
} from "../schemaValidations/cart.schema";
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

const getCart = async (userId: number) => {
  const cartItems = await prismaClient.cartItem.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new NotFoundError("Giỏ hàng trống");
  }

  return cartItems;
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

const CartService = {
  addItemToCart,
  getCart,
  deleteCartItem,
  updateCartItem,
};
export default CartService;
