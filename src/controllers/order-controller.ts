import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import { MessageRes } from "../schemaValidations/common.schema";
import { PlanOrderBodyType } from "../schemaValidations/request/plan-order";
import {
  CheckoutOrderRes,
  OrderListRes,
} from "../schemaValidations/response/order";
import OrderService from "../services/order-service";
import { BaseController } from "./abstractions/base-controller";

export default class OrderController extends BaseController {
  private path = "/order";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(`${this.path}`, checkLoggedInMiddleware, this.getAllOrders);
    this.router.get(`${this.path}/:id`, this.getOrderById);
    this.router.get(
      `${this.path}/:shopId/checkout`,
      checkLoggedInMiddleware,
      this.getCheckout,
    );
    this.router.post(
      `${this.path}/:shopId`,
      checkLoggedInMiddleware,
      this.createOrder,
    );
    this.router.put(`${this.path}/:id`, this.updateOrder);
    this.router.post(
      `${this.path}/:orderId/plan`,
      checkLoggedInMiddleware,
      this.createPlan,
    );
    this.router.put(
      `${this.path}/:id/status`,
      checkLoggedInMiddleware,
      this.updateStatus,
    );
    this.router.put(
      `${this.path}/:id/complete`,
      checkLoggedInMiddleware,
      this.completeOrder,
    );
  }

  //#region Order
  public async getAllOrders(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const userId = Number(request.headers.userId);
      // Logic to get all orders
      const { page, limit } = request.query;
      const { orders, currentPage, totalPages, totalOrders } =
        await OrderService.getAllOrders(userId, {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
        });

      return response.json(
        OrderListRes.parse({
          message: "Get all orders successfully",
          data: orders,
          meta: {
            totalPages,
            totalItems: totalOrders,
            currentPage,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  }
  //#endregion

  public async getOrderById(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const orderId = Number(request.params.id);
      // Logic to get order by ID
      const order = await OrderService.getOrderById(orderId);

      console.log(order);

      return response.json({
        message: "Get order by ID successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createOrder(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const userId = Number(request.headers.userId);
      const shopId = Number(request.params.shopId);

      // Logic to create an order
      const order = await OrderService.createOrder(userId, shopId);

      return response.json(
        MessageRes.parse({
          message: "Create order successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  public async updateOrder(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const orderId = Number(request.params.id);
      const orderStatus = request.body.status;

      // Logic to update an order
      // const updatedOrder = await OrderService.updateOrder(orderId, orderStatus);

      return response.json({
        message: "Update order successfully",
        // data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  // #region Checkout
  public async getCheckout(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const userId = Number(request.headers.userId);
      const shopId = Number(request.params.shopId);

      // Logic to get checkout
      const data = await OrderService.getCheckout(userId, shopId);

      return response.json(
        CheckoutOrderRes.parse({
          message: "Get checkout successfully",
          data,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  //#region make plan
  public async createPlan(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const shopId = Number(request.headers.userId);
      const orderId = Number(request.params.orderId);

      const body = request.body as PlanOrderBodyType;

      await OrderService.createPlan(shopId, orderId, body);

      return response.json(
        MessageRes.parse({
          message: "Create plan successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  }
  //#endregion

  // #region update status
  public async updateStatus(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const orderId = Number(request.params.id);
      const { statusId } = request.body;

      // Logic to update order status
      await OrderService.updateStatus(orderId, statusId);

      return response.json({
        message: "Update order status successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  //#endregion

  // #region complete order
  public async completeOrder(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const orderId = Number(request.params.id);

      // Logic to complete order
      await OrderService.completeOrder(orderId);

      return response.json({
        message: "Complete order successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  //#endregion
}
