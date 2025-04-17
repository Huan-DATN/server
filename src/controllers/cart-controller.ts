import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  AddItemToCartBodyType,
  UpdateCartItemBodyType,
} from "../schemaValidations/cart.schema";
import { CartRes } from "../schemaValidations/response/cart";
import CartService from "../services/cart-service";
import { BaseController } from "./abstractions/base-controller";

export default class CartController extends BaseController {
  public path = "/cart";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      checkLoggedInMiddleware,
      this.addItemToCart,
    );
    this.router.get(`${this.path}`, checkLoggedInMiddleware, this.getCart);
    this.router.put(
      `${this.path}/update/:cartItemId`,
      checkLoggedInMiddleware,
      this.updateCartItem,
    );
    this.router.delete(
      `${this.path}/:cartItemId`,
      checkLoggedInMiddleware,
      this.deleteCartItem,
    );
    this.router.delete(
      `${this.path}/shop/:shopId`,
      checkLoggedInMiddleware,
      this.deleteCartItemByShop,
    );
  }

  //#region Add item to cart
  addItemToCart = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const body = request.body as AddItemToCartBodyType;
      const userId = Number(request.headers.userId as string);
      await CartService.addItemToCart(userId, body);

      return response.json({
        message: "Thêm sản phẩm vào giỏ hàng thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region Get cart
  getCart = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const cart = await CartService.getCart(userId);

      return response.json(
        CartRes.parse({
          message: "Lấy giỏ hàng thành công",
          data: cart,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
  // #endregion

  // #region Update cart item
  updateCartItem = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const body = request.body as UpdateCartItemBodyType;
      const userId = Number(request.headers.userId as string);
      const cartItemId = Number(request.params.cartItemId as string);
      const cartItem = await CartService.updateCartItem(
        userId,
        cartItemId,
        body,
      );
      return response.json({
        message: "Cập nhật sản phẩm trong giỏ hàng thành công",
        data: cartItem,
      });
    } catch (error) {
      next(error);
    }
  };
  // #endregion

  // #region Delete cart item
  deleteCartItem = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const cartItemId = Number(request.params.cartItemId);
      const userId = Number(request.headers.userId as string);
      await CartService.deleteCartItem(userId, cartItemId);

      return response.json({
        message: "Xóa sản phẩm trong giỏ hàng thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  // #endregion
  // #region Delete cart item by shop
  deleteCartItemByShop = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const shopId = Number(request.params.shopId);
      const userId = Number(request.headers.userId as string);
      await CartService.deleteCartItemByShop(userId, shopId);

      return response.json({
        message: "Xóa sản phẩm trong giỏ hàng thành công",
      });
    } catch (error) {
      next(error);
    }
  };
}
