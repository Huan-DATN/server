import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import UserService from "../services/user-service";
import { EntityError } from "../utils/errors";
import { BaseController } from "./abstractions/base-controller";
export default class UserController extends BaseController {
  public path = "/user";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Bạn có thể thêm put, patch, delete sau.
    this.router.get(`${this.path}/me`, checkLoggedInMiddleware, this.getMe);
    this.router.put(
      `${this.path}/update/me`,
      checkLoggedInMiddleware,
      this.updateMe,
    );
    this.router.put(
      `${this.path}/update/password`,
      checkLoggedInMiddleware,
      this.updatePassword,
    );
  }

  //#region me
  getMe = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      if (!sessionToken) {
        throw new EntityError([
          {
            field: "sessionToken",
            message: "Session Token is invalid",
          },
        ]);
      }

      const user = await UserService.getMe(sessionToken);

      return response.send({
        message: "Fetch data successfully",
        data: {
          ...user,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region updateMe
  updateMe = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      if (!sessionToken) {
        throw new EntityError([
          {
            field: "sessionToken",
            message: "Session Token is invalid",
          },
        ]);
      }

      const data = request.body;
      const updatedUser = await UserService.updateMe(sessionToken, data);

      return response.send({
        message: "Update data successfully",
        data: {
          ...updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region updatePassword
  updatePassword = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      if (!sessionToken) {
        throw new EntityError([
          {
            field: "sessionToken",
            message: "Session Token is invalid",
          },
        ]);
      }

      const { oldPassword, newPassword } = request.body;
      await UserService.updatePassword(sessionToken, {
        oldPassword,
        newPassword,
      });

      return response.send({
        message: "Update password successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
