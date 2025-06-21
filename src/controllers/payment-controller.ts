import express from "express";
import { StatusCodes } from "http-status-codes";
import checkAdminMiddleware from "../middlewares/admin.middleware";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  CreatePaymentSchema,
  CreatePaymentType,
  OrderPaymentParamSchema,
  PaymentPaginationSchema,
  PaymentParamSchema,
} from "../schemaValidations/request/payment";
import {
  PaymentListResponse,
  PaymentResponse,
} from "../schemaValidations/response/payment";
import PaymentService from "../services/payment-service";
import { BaseController } from "./abstractions/base-controller";

export default class PaymentController extends BaseController {
  public path = "/payments";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Create a new payment (requires authentication)
    this.router.post(
      `${this.path}`,
      checkLoggedInMiddleware,
      this.createPayment,
    );

    // Get payment by ID (requires authentication)
    this.router.get(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.getPaymentById,
    );

    // Get payment by order ID (requires authentication)
    this.router.get(
      `${this.path}/order/:orderId`,
      checkLoggedInMiddleware,
      this.getPaymentByOrderId,
    );

    // Get all payments (admin only)
    this.router.get(
      `${this.path}`,
      checkLoggedInMiddleware,
      checkAdminMiddleware,
      this.getAllPayments,
    );

    // Get payments by user ID (requires authentication)
    this.router.get(
      `${this.path}/user/me`,
      checkLoggedInMiddleware,
      this.getUserPayments,
    );
  }

  /**
   * Create a new payment
   */
  private createPayment = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const body = CreatePaymentSchema.parse(request.body) as CreatePaymentType;

      const payment = await PaymentService.createPayment(
        userId,
        body.orderId,
        body.imageId,
        body.amount,
      );

      return response.status(StatusCodes.CREATED).json({
        data: payment,
        message: "Payment created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment by ID
   */
  private getPaymentById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = PaymentParamSchema.parse(request.params);
      const userId = Number(request.headers.userId as string);
      const isAdmin = request.headers.role === "ADMIN";

      const payment = await PaymentService.getPaymentById(id);

      // Only allow users to view their  own payments unless they're an admin
      if (payment.userId !== userId && !isAdmin) {
        return response.status(StatusCodes.FORBIDDEN).json({
          message: "You are not authorized to view this payment",
        });
      }

      return response.status(StatusCodes.OK).json({
        data: PaymentResponse.parse(payment),
        message: "Payment retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment by order ID
   */
  private getPaymentByOrderId = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { orderId } = OrderPaymentParamSchema.parse(req.params);
      const userId = req.user?.id as number;
      const isAdmin = req.user?.role === "ADMIN";

      const payment = await PaymentService.getPaymentByOrderId(orderId);

      // Only allow users to view their own payments unless they're an admin
      if (payment.userId !== userId && !isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "You are not authorized to view this payment",
        });
      }

      return res.status(StatusCodes.OK).json({
        data: PaymentResponse.parse(payment),
        message: "Payment retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all payments (admin only)
   */
  private getAllPayments = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page, limit } = PaymentPaginationSchema.parse(req.query);
      const payments = await PaymentService.getAllPayments(page, limit);

      return res.status(StatusCodes.OK).json({
        data: PaymentListResponse.parse(payments).data,
        pagination: payments.pagination,
        message: "Payments retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payments by user ID
   */
  private getUserPayments = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = req.user?.id as number;
      const { page, limit } = PaymentPaginationSchema.parse(req.query);

      const payments = await PaymentService.getPaymentsByUserId(
        userId,
        page,
        limit,
      );

      return res.status(StatusCodes.OK).json({
        data: PaymentListResponse.parse(payments).data,
        pagination: payments.pagination,
        message: "Payments retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
