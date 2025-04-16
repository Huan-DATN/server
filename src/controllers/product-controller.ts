import express from "express";
import { PaginationReq } from "../schemaValidations/common.schema";
import { SearchProductQuery } from "../schemaValidations/product.schema";
import { ProductListRes } from "../schemaValidations/response/product";
import ProductService from "../services/product-service";
import { BaseController } from "./abstractions/base-controller";
export default class ProductController extends BaseController {
  public path = "/products";

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
      const { name, groupProductId, cityId } = request.query;

      const data = await ProductService.getAllProducts(
        PaginationReq.parse({
          page,
          limit,
        }),
        SearchProductQuery.parse({
          ...request.query,
          groupProductId,
          cityId,
        }),
      );

      return response.status(200).json(
        ProductListRes.parse({
          data: data.products,
          meta: {
            total: data.totalPages,
            totalPages: data.totalProducts,
          },
          message: "Products fetched successfully",
        }),
      );
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
