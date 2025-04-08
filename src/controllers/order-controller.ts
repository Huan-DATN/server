import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
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
    this.router.post(`${this.path}`, checkLoggedInMiddleware, this.createOrder);
    this.router.put(`${this.path}/:id`, this.updateOrder);
  }

  public async getAllOrders(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const userId = Number(request.headers.userId);
      // Logic to get all orders
      const orders = await OrderService.getAllOrders(userId);

      return response.json({
        message: "Get all orders successfully",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getOrderById(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const orderId = Number(request.params.id);
      // Logic to get order by ID
      const order = await OrderService.getOrderById(orderId);

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

      // Logic to create an order
      const order = await OrderService.createOrder(userId);

      return response.json({
        message: "Create order successfully",
        data: order,
      });
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
}
