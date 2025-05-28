import express from "express";
import { z } from "zod";
import checkAdminMiddleware from "../middlewares/admin.middleware";
import {
  CarouselListRes,
  CarouselRes,
} from "../schemaValidations/response/carousel";
import { CarouselService } from "../services/carousel.service";
import { BaseController } from "./abstractions/base-controller";

// Define schema for carousel items
const CarouselItemSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  imageId: z.number().int(),
  linkUrl: z.string(),
  order: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Define request schema
const CreateCarouselItemSchema = z.object({
  title: z.string(),
  imageId: z.number().int(),
  linkUrl: z.string(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const UpdateCarouselItemSchema = z.object({
  title: z.string().optional(),
  imageId: z.number().int().optional(),
  linkUrl: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const ToggleStatusSchema = z.object({
  isActive: z.boolean(),
});

// Define response types
type CarouselItem = z.infer<typeof CarouselItemSchema>;
type CreateCarouselItemRequest = z.infer<typeof CreateCarouselItemSchema>;
type UpdateCarouselItemRequest = z.infer<typeof UpdateCarouselItemSchema>;

export default class CarouselController extends BaseController {
  public path = "/carousels";
  private carouselService = new CarouselService();

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Public route to get active carousel items
    this.router.get(`${this.path}`, this.getCarouselItems);

    // Admin routes for managing carousel items
    this.router.get(
      `${this.path}/admin`,
      checkAdminMiddleware,
      this.getCarouselItemsAdmin,
    );
    this.router.post(
      `${this.path}`,
      checkAdminMiddleware,
      this.createCarouselItem,
    );
    this.router.put(
      `${this.path}/:id`,
      checkAdminMiddleware,
      this.updateCarouselItem,
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAdminMiddleware,
      this.deleteCarouselItem,
    );
    this.router.patch(
      `${this.path}/:id/status`,
      checkAdminMiddleware,
      this.toggleCarouselItemStatus,
    );
  }

  // Get active carousel items for public use
  getCarouselItems = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { limit = 5 } = request.query;

      const data = await this.carouselService.getActiveCarouselItems(
        Number(limit),
      );

      return response.status(200).json(
        CarouselListRes.parse({
          data,
          message: "Carousel items fetched successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  // Admin endpoint to get all carousel items (active and inactive)
  getCarouselItemsAdmin = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page = 1, limit = 10 } = request.query;

      const { items, totalCount, totalPages } =
        await this.carouselService.getAllCarouselItems(
          Number(page),
          Number(limit),
        );

      return response.status(200).json({
        data: items,
        meta: {
          total: totalCount,
          totalPages,
        },
        message: "Carousel items fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new carousel item
  createCarouselItem = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const validatedData = CreateCarouselItemSchema.parse(request.body);

      const carouselItem = await this.carouselService.createCarouselItem(
        validatedData,
      );

      return response.status(201).json(
        CarouselRes.parse({
          data: carouselItem,
          message: "Carousel item created successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  // Update carousel item
  updateCarouselItem = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const validatedData = UpdateCarouselItemSchema.parse(request.body);

      const updatedItem = await this.carouselService.updateCarouselItem(
        Number(id),
        validatedData,
      );

      return response.status(200).json(
        CarouselRes.parse({
          data: updatedItem,
          message: "Carousel item updated successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  // Delete carousel item
  deleteCarouselItem = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;

      await this.carouselService.deleteCarouselItem(Number(id));

      return response.status(200).json({
        message: "Carousel item deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Toggle carousel item status (active/inactive)
  toggleCarouselItemStatus = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const validatedData = ToggleStatusSchema.parse(request.body);
      const { isActive } = validatedData;

      const updatedItem = await this.carouselService.toggleCarouselItemStatus(
        Number(id),
        isActive,
      );

      return response.status(200).json(
        CarouselRes.parse({
          data: updatedItem,
          message: "Carousel item status updated successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
