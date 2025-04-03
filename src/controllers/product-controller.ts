import express from "express";
import { PaginationReq } from "../schemaValidations/common.schema";
import { SearchProductQuery } from "../schemaValidations/product.schema";
import ProductService from "../services/product-service";
import { BaseController } from "./abstractions/base-controller";
export default class ProductController extends BaseController {
  public path = "/product";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}`, this.getAllProducts);
    this.router.get(`${this.path}/:id`, this.getProductById);
    // this.router.post(`${this.path}`, this.createProduct);
    // this.router.put(`${this.path}/:id`, this.updateProductById);
    // this.router.delete(`${this.path}/:id`, this.deleteProductById);
  }
  //   }

  getAllProducts = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page, limit } = request.query;
      const { name, categoryIds } = request.query;

      let categoryIdsArray: number[] | undefined = undefined;

      if (!categoryIds || categoryIds.length === 0) {
        categoryIdsArray = undefined;
      } else {
        categoryIdsArray = Array.isArray(categoryIds)
          ? categoryIds.map((id) => Number(id))
          : (categoryIds as string)
              .split(",")
              .map((id) => Number(id) as number);
      }

      const data = await ProductService.getAllProducts(
        PaginationReq.parse({
          page,
          limit,
        }),
        SearchProductQuery.parse({
          ...request.query,
          categoryIds: categoryIdsArray,
        }),
      );

      return response.status(200).json({
        data,
        message: "Products fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const data = await ProductService.getProductById(Number(id));
      return response.status(200).json({
        data,
        message: "Product fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
