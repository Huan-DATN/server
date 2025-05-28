import express from "express";
import checkAdminMiddleware from "../middlewares/admin.middleware";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import { PaginationReq } from "../schemaValidations/common.schema";
import { ShopsListRes } from "../schemaValidations/response/user";
import { SearchUserQuery, UserRes } from "../schemaValidations/user.schema";
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
    this.router.get(`${this.path}/shops`, this.getShops);
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
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.put(`${this.path}/:id`, this.updateUserById);
    this.router.get(`${this.path}`, checkAdminMiddleware, this.getAllUsers);
  }

  //#region me
  getMe = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);

      const user = await UserService.getMe(userId);

      return response.send(
        UserRes.parse({
          message: "Fetch data successfully",
          data: user,
        }),
      );
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
      const data = request.body;
      const userId = Number(request.headers.userId as string);
      const updatedUser = await UserService.updateMe(userId, data);

      return response.send({
        message: "Cập nhật thông tin thành công",
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
      const { role, isActive, id, email, name } = request.query;

      const { users, totalPages, totalUsers } = await UserService.getAllUsers(
        PaginationReq.parse({
          page,
          limit,
        }),
        SearchUserQuery.parse({
          role: role as string,
          isActive: isActive !== undefined ? isActive === "true" : undefined,
          id: id as string,
          email: email as string,
          name: name as string,
        }),
      );

      return response.send({
        message: "Fetch data successfully",
        data: users,
        meta: {
          totalPages,
          total: totalUsers,
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

  //#region getShops
  getShops = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { page, limit } = request.query;
      const isActive = Boolean(request.query.isActive ?? true);
      const { formattedShops, totalPages, totalShops } =
        await UserService.getShops(
          PaginationReq.parse({
            page,
            limit,
          }),
          isActive,
        );

      return response.send(
        ShopsListRes.parse({
          message: "Fetch data successfully",
          data: formattedShops,
          meta: {
            total: totalShops,
            totalPages: totalPages,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
