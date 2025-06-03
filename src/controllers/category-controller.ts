import express from "express";
import checkAdminMiddleware from "../middlewares/admin.middleware";
import { getCategoriesSchema } from "../schemaValidations/request/category.schema";
import * as categoryService from "../services/category-service";
import { BaseController } from "./abstractions/base-controller";

export default class ProductCategoryController extends BaseController {
  public path = "/category";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Public routes
    this.router.get(`${this.path}`, this.getAll);
    this.router.get(`${this.path}/:id`, this.getOne);

    // Admin routes
    this.router.post(`${this.path}`, checkAdminMiddleware, this.create);
    this.router.put(`${this.path}/:id`, checkAdminMiddleware, this.update);
    this.router.delete(`${this.path}/:id`, checkAdminMiddleware, this.delete);
  }

  /**
   * Get all categories with optional filtering, searching, and pagination
   * @route GET /category
   */
  getAll = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const queryParams = getCategoriesSchema.safeParse(request.query);

      console.log(queryParams.data);

      const result = await categoryService.getAllCategories(queryParams.data);

      return response.json({
        message: "Categories retrieved successfully",
        data: result.categories,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single category by ID
   * @route GET /category/:id
   */
  getOne = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const categoryId = parseInt(id);

      const category = await categoryService.getCategoryById(categoryId);

      return response.json({
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new category (Admin only)
   * @route POST /category
   */
  create = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { name, isActive } = request.body;

      const category = await categoryService.createCategory({
        name,
        isActive,
      });

      return response.status(201).json({
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a category (Admin only)
   * @route PUT /category/:id
   */
  update = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const categoryId = parseInt(id);
      const { name, isActive } = request.body;

      const updatedCategory = await categoryService.updateCategory(categoryId, {
        name,
        isActive,
      });

      return response.json({
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a category (Admin only)
   * @route DELETE /category/:id
   */
  delete = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const categoryId = parseInt(id);

      await categoryService.deleteCategory(categoryId);

      return response.json({
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
