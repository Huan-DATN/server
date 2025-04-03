import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import { PaginationReq } from "../schemaValidations/common.schema";
import { SearchUsersBody } from "../schemaValidations/user.schema";
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
    this.router.get(
      `${this.path}/:id`,
      checkLoggedInMiddleware,
      this.getUserById,
    );
    this.router.put(
      `${this.path}/update/:id`,
      checkLoggedInMiddleware,
      this.updateUserById,
    );
    this.router.get(`${this.path}`, checkLoggedInMiddleware, this.getAllUsers);
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
  //#endregion

  // #region getUserById
  getUserById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const user = await UserService.getUserById(Number(id));

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

  // #region updateUserById
  updateUserById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const data = request.body;
      const updatedUser = await UserService.updateUserById(Number(id), data);

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

  // #region getAllUsers
  getAllUsers = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page, limit } = request.query;
      const users = await UserService.getAllUsers(
        PaginationReq.parse({
          page,
          limit,
        }),
        SearchUsersBody.parse(request.body),
      );

      return response.send({
        message: "Fetch data successfully",
        data: {
          ...users,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  // #region deleteUserById
  deleteUserById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { id } = request.params;
      await UserService.deleteUserById(Number(id));

      return response.send({
        message: "Delete user successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
