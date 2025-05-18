import express from "express";
import {
  CategoryListRes,
  CityListRes,
  GroupProductsListRes,
  StatusListRes,
} from "../schemaValidations/response/common";
import { ProductListRes } from "../schemaValidations/response/product";
import { BaseController } from "./abstractions/base-controller";
export default class CommonController extends BaseController {
  public path = "/common";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/cities`, this.getAllCities);
    this.router.get(`${this.path}/group-products`, this.getAllGroupProducts);
    this.router.get(`${this.path}/categories`, this.getAllCategories);
    this.router.get(`${this.path}/status`, this.getAllStatus);
    this.router.get(`${this.path}/products/newest`, this.getNewestProducts);
  }

  getAllCities = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return response.send(
        CityListRes.parse({
          data: cities,
          message: "Cities fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getAllGroupProducts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const groupProducts = await this.prisma.groupProduct.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return response.json(
        GroupProductsListRes.parse({
          data: groupProducts,
          message: "Group products fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return response.send(
        CategoryListRes.parse({
          data: categories,
          message: "Categories fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getAllStatus = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const status = await this.prisma.status.findMany({});
      return response.send(
        StatusListRes.parse({
          data: status,
          message: "Status fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getNewestProducts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const { take } = request.query;
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: take ? parseInt(take as string) : 8,
        include: {
          images: true,
          user: true,
        },
      });
      return response.send(
        ProductListRes.parse({
          data: products,

          message: "Newest products fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
