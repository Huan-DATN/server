import express from "express";
import { StatusCodes } from "http-status-codes";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  CardParamSchema,
  CreateCardSchema,
  CreateCardType,
  UpdateCardSchema,
  UpdateCardType,
} from "../schemaValidations/request/card";
import {
  CardDetailResponse,
  CardListResponse,
  CardResponse,
} from "../schemaValidations/response/card";
import CardService from "../services/card-service";
import { BaseController } from "./abstractions/base-controller";

export default class CardController extends BaseController {
  public path = "/cards";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}`, checkLoggedInMiddleware, this.createCard);

    this.router.get(
      `${this.path}/me`,
      checkLoggedInMiddleware,
      this.getUserCards,
    );

    this.router.get(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.getCardById,
    );

    this.router.put(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.updateCard,
    );

    this.router.delete(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.deleteCard,
    );
  }

  private createCard = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const body = CreateCardSchema.parse(request.body) as CreateCardType;

      const card = await CardService.createCard(
        userId,
        body.imageId,
        body.name,
        body.accountNumber,
        body.bankName,
      );

      return response.status(StatusCodes.CREATED).json({
        data: CardResponse.parse(card),
        message: "Card created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's cards
   */
  private getUserCards = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const cards = await CardService.getUserCards(userId);

      return response.status(StatusCodes.OK).json(
        CardListResponse.parse({
          data: cards,
          message: "Cards retrieved successfully",
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get card by ID
   */
  private getCardById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = CardParamSchema.parse(request.params);
      const userId = Number(request.headers.userId as string);
      const isAdmin = request.headers.role === "ADMIN";

      const card = await CardService.getCardById(id);

      // Only allow users to view their own cards unless they're an admin
      if (card.userId !== userId && !isAdmin) {
        return response.status(StatusCodes.FORBIDDEN).json({
          message: "You are not authorized to view this card",
        });
      }

      return response.status(StatusCodes.OK).json({
        data: CardDetailResponse.parse(card),
        message: "Card retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update card
   */
  private updateCard = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = CardParamSchema.parse(request.params);
      const userId = Number(request.headers.userId as string);
      const body = UpdateCardSchema.parse(request.body) as UpdateCardType;

      const updatedCard = await CardService.updateCard(id, userId, body);

      return response.status(StatusCodes.OK).json({
        data: CardResponse.parse(updatedCard),
        message: "Card updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete card
   */
  private deleteCard = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = CardParamSchema.parse(request.params);
      const userId = Number(request.headers.userId as string);

      await CardService.deleteCard(id, userId);

      return response.status(StatusCodes.OK).json({
        message: "Card deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
