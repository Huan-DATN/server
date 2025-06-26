import axios from "axios";
import express from "express";
import envConfig from "../config";
import checkAdminMiddleware from "../middlewares/admin.middleware";
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
      `${this.path}/admin`,
      checkAdminMiddleware,
      this.getProductsAdmin,
    );
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
    this.router.get(`${this.path}/recommend/:id`, this.getProductsRecommend);
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
      const { sortBy, sortOrder } = request.query;
      const { isActive } = request.query;
      const { minPrice, maxPrice } = request.query;

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
        {
          sortBy: (sortBy as string) || "createdAt",
          sortOrder: (sortOrder as string) || "desc",
        },
        {
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
        isActive !== undefined ? isActive === "true" : undefined,
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
      const { name, sortBy, sortOrder } = request.query;

      const data = await ProductService.getProductsShop(
        Number(id),
        PaginationReq.parse({
          page,
          limit,
        }),
        true,
        {
          name: name as string,
        },
        {
          sortBy: (sortBy as string) || "createdAt",
          sortOrder: (sortOrder as string) || "desc",
        },
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
      const { name } = request.query;
      const { sortBy, sortOrder } = request.query;
      const { isActive } = request.query;

      const data = await ProductService.getProductsShop(
        Number(shopId),
        PaginationReq.parse({
          page,
          limit,
        }),
        isActive !== undefined ? isActive === "true" : undefined,
        {
          name: name as string,
        },
        {
          sortBy: (sortBy as string) || "createdAt",
          sortOrder: (sortOrder as string) || "desc",
        },
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

      const res = await axios.post(
        `${envConfig.RECOMMENDATION_URL}/api/refresh`,
      );

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

      const res = await axios.post(
        `${envConfig.RECOMMENDATION_URL}/api/refresh`,
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

  getProductsAdmin = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page, limit } = request.query;
      const { name, groupProductId, cityId } = request.query;
      const { sortBy, sortOrder } = request.query;
      const { isActive } = request.query;
      const { minPrice, maxPrice } = request.query;

      const data = await ProductService.getAllProducts(
        PaginationReq.parse({
          page,
          limit,
        }),
        {
          name: name as string,
        },
        {
          sortBy: (sortBy as string) || "createdAt",
          sortOrder: (sortOrder as string) || "desc",
        },
        {
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
        isActive !== undefined ? isActive === "true" : undefined,
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

  getProductsRecommend = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const { limit } = request.query;

      const res = await axios.get(
        `${envConfig.RECOMMENDATION_URL}/api/recommend?product_id=${id}&num=${limit}`,
      );

      const { data } = res.data;

      const products = await Promise.all(
        data.map(
          async (product: any) =>
            await ProductService.getProductById(product.id),
        ),
      );

      return response.status(200).json(
        ProductListRes.parse({
          data: products,
          message: "Products fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
