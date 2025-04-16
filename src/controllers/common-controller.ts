import express from "express";
import {
  CategoryListRes,
  CityListRes,
  GroupProductsListRes,
} from "../schemaValidations/response/common";
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
}
