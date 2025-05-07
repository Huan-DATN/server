import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import { PaginationReq } from "../schemaValidations/common.schema";
import { SearchProductQuery } from "../schemaValidations/product.schema";
import {
  ProductListRes,
  ProductRes,
} from "../schemaValidations/response/product";
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
    this.router.get(
      `${this.path}/me`,
      checkLoggedInMiddleware,
      this.getProductsByShop,
    );
    this.router.get(`${this.path}/:id`, this.getProductById);
    this.router.get(`${this.path}/shop/:id`, this.getProductsShop);
    this.router.post(
      `${this.path}/`,
      checkLoggedInMiddleware,
      this.createProduct,
    );
    this.router.put(`${this.path}/:id`, this.updateProductById);
    this.router.patch(`${this.path}/:id`, this.updateProductActive);
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
            total: data.totalProducts,
            totalPages: data.totalPages,
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
      return response.status(200).json(
        ProductRes.parse({
          data,
          message: "Product fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  // #region Shop Products
  getProductsShop = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const { page, limit } = request.query;
      console.log({ page, limit });

      const data = await ProductService.getProductsShop(
        Number(id),
        PaginationReq.parse({
          page,
          limit,
        }),
        true,
      );

      return response.status(200).json(
        ProductListRes.parse({
          data: data.products,
          meta: {
            total: data.totalProducts,
            totalPages: data.totalPages,
          },
          message: "Products fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
  // #endregion

  // #region get Products by user
  getProductsByShop = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const shopId = Number(request.headers.userId);
      const { page, limit } = request.query;

      const data = await ProductService.getProductsShop(
        Number(shopId),
        PaginationReq.parse({
          page,
          limit,
        }),
        false,
      );

      return response.status(200).json(
        ProductListRes.parse({
          data: data.products,
          meta: {
            total: data.totalProducts,
            totalPages: data.totalPages,
          },
          message: "Products fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
  // #endregion
  // #region create Product
  createProduct = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const shopId = Number(request.headers.userId);
      const data = await ProductService.createProduct(shopId, request.body);

      return response.status(201).json(
        ProductRes.parse({
          data,
          message: "Product created successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
  // #endregion

  // #region update Product
  updateProductById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const data = await ProductService.updateProductById(
        Number(id),
        request.body,
      );

      return response.status(200).json(
        ProductRes.parse({
          data,
          message: "Product updated successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  // #region toggle Product status
  updateProductActive = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const { isActive } = request.body;
      const data = await ProductService.updateProductActive(
        Number(id),
        isActive,
      );

      return response.status(200).json(
        ProductRes.parse({
          data,
          message: "Product status updated successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
