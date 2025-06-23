import express from "express";
import checkAdminMiddleware from "../middlewares/admin.middleware";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validation.middleware";
import {
  DailyStatisticsQuerySchema,
  DailyStatisticsQueryType,
  DateRangeSchema,
  MonthlyStatisticsQuerySchema,
  MonthlyStatisticsQueryType,
} from "../schemaValidations/statistic.schema";
import StatisticService from "../services/statistic-service";
import { BaseController } from "./abstractions/base-controller";

export default class StatisticController extends BaseController {
  public path = "/statistic";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(
      `${this.path}/order`,
      checkLoggedInMiddleware,
      validateRequest(DateRangeSchema, "query"),
      this.getOrderStatistic,
    );
    this.router.get(
      `${this.path}/monthly`,
      checkLoggedInMiddleware,
      validateRequest(MonthlyStatisticsQuerySchema, "query"),
      this.getMonthlyStatistics,
    );
    this.router.get(
      `${this.path}/daily`,
      checkLoggedInMiddleware,
      validateRequest(DailyStatisticsQuerySchema, "query"),
      this.getDailyStatisticsForMonth,
    );
    this.router.get(
      `${this.path}/dashboard`,
      checkLoggedInMiddleware,
      this.getDashboardCardStats,
    );
    this.router.get(
      `${this.path}/admin/daily`,
      checkAdminMiddleware,
      validateRequest(DailyStatisticsQuerySchema, "query"),
      this.getAdminDailyStatisticsForMonth,
    );
    this.router.get(
      `${this.path}/admin/dashboard`,
      checkAdminMiddleware,
      this.getAdminDashboardStats,
    );
    this.router.get(
      `${this.path}/admin/monthly`,
      checkAdminMiddleware,
      validateRequest(MonthlyStatisticsQuerySchema, "query"),
      this.getAdminMonthlyStatistics,
    );
    this.router.get(
      `${this.path}/admin/store`,
      checkAdminMiddleware,
      this.getAdminStoreStats,
    );
    this.router.get(
      `${this.path}/admin/user/monthly`,
      checkAdminMiddleware,
      this.getAdminUserMonthlyStatistics,
    );
  }

  getOrderStatistic = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { startDate, endDate } = request.query;
      const orderStatistic = await StatisticService.getOrderStatistic(
        startDate as string,
        endDate as string,
      );
      return response.status(200).json({
        message: "Order statistic fetched successfully",
        data: orderStatistic,
      });
    } catch (error) {
      next(error);
    }
  };

  getMonthlyStatistics = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      // After validation middleware has run, the query has been validated and transformed
      const query = request.query as unknown as MonthlyStatisticsQueryType;
      const monthlyStats = await StatisticService.getMonthlyStatistics(
        query.year,
      );

      return response.status(200).json({
        message: "Monthly statistics fetched successfully",
        data: monthlyStats,
      });
    } catch (error) {
      next(error);
    }
  };

  getDailyStatisticsForMonth = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const shopId = Number(request.headers.userId);
      // After validation middleware has run, the query has been validated and transformed
      const query = request.query as unknown as DailyStatisticsQueryType;

      const dailyStats = await StatisticService.getDailyStatisticsForMonth(
        shopId,
        {
          month: query.month,
          year: query.year,
        },
      );

      return response.status(200).json({
        message: "Daily statistics fetched successfully",
        data: dailyStats,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminDailyStatisticsForMonth = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      // After validation middleware has run, the query has been validated and transformed
      const query = request.query as unknown as DailyStatisticsQueryType;

      const dailyStats = await StatisticService.getAdminDailyStatisticsForMonth(
        {
          month: query.month,
          year: query.year,
        },
      );

      return response.status(200).json({
        message: "Admin daily statistics fetched successfully",
        data: dailyStats,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminDashboardStats = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const stats = await StatisticService.getAdminDashboardStats();

      return response.status(200).json({
        message: "Admin dashboard statistics fetched successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminMonthlyStatistics = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      // After validation middleware has run, the query has been validated and transformed
      const query = request.query as unknown as MonthlyStatisticsQueryType;
      const monthlyStats = await StatisticService.getAdminMonthlyStatistics(
        query.year,
      );

      return response.status(200).json({
        message: "Admin monthly statistics fetched successfully",
        data: monthlyStats,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminStoreStats = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const stats = await StatisticService.getAdminStoreStats();

      return response.status(200).json({
        message: "Admin store statistics fetched successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboardCardStats = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const shopId = Number(request.headers.userId);
      const stats = await StatisticService.getDashboardCardStats(shopId);

      // Format the response to match the frontend card structure
      const formattedStats = {
        totalRevenue: {
          value: `${stats.totalRevenue.toLocaleString("vi-VN")} ₫`,
        },
        completedOrders: {
          value: stats.completedOrders.toString(),
        },
        shippingOrders: {
          value: stats.shippingOrders.toString(),
        },
        cancelledOrders: {
          value: stats.cancelledOrders.toString(),
        },
      };

      return response.status(200).json({
        message: "Dashboard statistics fetched successfully",
        data: formattedStats,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminUserMonthlyStatistics = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const query = request.query as unknown as MonthlyStatisticsQueryType;
      const monthlyStats = await StatisticService.getAdminUserMonthlyStatistics(
        query.year,
      );

      return response.status(200).json({
        message: "Admin user monthly statistics fetched successfully",
        data: monthlyStats,
      });
    } catch (error) {
      next(error);
    }
  };
}
