import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  RatingListRes,
  RatingRes,
  RatingSummaryRes,
} from "../schemaValidations/response/rating";
import RatingService from "../services/rating-service";
import { BaseController } from "./abstractions/base-controller";

export default class RatingController extends BaseController {
  public path = "/rating";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkLoggedInMiddleware,
      this.getAllRatings,
    );
    this.router.put(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.updateRatingById,
    );
    this.router.delete(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.deleteRatingById,
    );

    this.router.get(
      `${this.path}/product/:id/`,
      checkLoggedInMiddleware,
      this.getRatingByProductId,
    );
    this.router.get(
      `${this.path}/product/:id/summary/`,
      this.getRatingSummaryById,
    );
    this.router.post(
      `${this.path}/product/:orderId/:productId/`,
      checkLoggedInMiddleware,
      this.createRating,
    );
  }

  getRatingSummaryById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const productId = Number(request.params.id);

      const ratingSummary = await RatingService.getRatingSummaryById(productId);

      return response.send(
        RatingSummaryRes.parse({
          message: "Fetch data successfully",
          data: {
            rating: ratingSummary.rating,
            totalRatings: ratingSummary.totalRatings,
            stars: ratingSummary.stars,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  getAllRatings = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const ratings = await RatingService.getAllRatings();

      return response.send(
        RatingRes.parse({
          message: "Fetch data successfully",
          data: ratings,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  createRating = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const ratingData = request.body;
      const userId = Number(request.headers.userId);
      const productId = Number(request.params.productId);
      const orderId = Number(request.params.orderId);

      const newRating = await RatingService.createRating(
        userId,
        orderId,
        productId,
        ratingData,
      );

      return response.send(
        RatingRes.parse({
          message: "Create rating successfully",
          data: newRating,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  updateRatingById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const ratingId = Number(request.params.id);
      const ratingData = request.body;

      const updatedRating = await RatingService.updateRatingById(
        ratingId,
        ratingData,
      );

      return response.send(
        RatingRes.parse({
          message: "Update rating successfully",
          data: updatedRating,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  deleteRatingById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const ratingId = Number(request.params.id);

      await RatingService.deleteRatingById(ratingId);

      return response.send({
        message: "Delete rating successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRatingByProductId = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const productId = Number(request.params.id);
      const { page, limit } = request.query;

      const rating = await RatingService.getRatingByProductId(productId, {
        page: Number(page) || 1,
        limit: Number(limit) || 6,
      });
      console.log(rating);
      return response.send(
        RatingListRes.parse({
          message: "Fetch data successfully",
          data: rating.data,
          meta: {
            totalPages: rating.totalPages,
            total: rating.totalRatings,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
