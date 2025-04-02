import express from "express";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  LoginBodyType,
  RegisterBodyType,
} from "../schemaValidations/auth.schema";
import * as AuthService from "../services/auth-service";
import { BaseController } from "./abstractions/base-controller";

export default class AuthController extends BaseController {
  public path = "/auth";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Bạn có thể thêm put, patch, delete sau.
    this.router.post(`${this.path}/login`, this.login);
    this.router.post(`${this.path}/register`, this.register);
    this.router.post(
      `${this.path}/slide-session`,
      checkLoggedInMiddleware,
      this.slideSession,
    );
    this.router.post(
      `${this.path}/logout`,
      checkLoggedInMiddleware,
      this.logout,
    );
  }

  //#region Login

  login = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    // Bạn có thể thêm xác thực ở đây
    try {
      const body = request.body as LoginBodyType;
      const { user, session } = await AuthService.validateLogin(body);
      return response.json({
        data: {
          token: session.token,
          expiresAt: session.expiresAt,
          user,
        },
        message: "Đăng nhập thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region Register
  register = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    // Bạn có thể thêm xác thực ở đây
    try {
      const body = request.body as RegisterBodyType;
      const { session, user } = await AuthService.registerService(body);
      return response.send({
        message: "Đăng ký thành công",
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region slideSessionToken
  /**
   * Tăng thời gian hết hạn của session token lên
   * @param sessionToken
   */

  slideSession = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      const session = await AuthService.slideSession(sessionToken!);

      return response.json({
        data: {
          token: session.token,
          expiresAt: session.expiresAt,
        },
        message: "Refresh session thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region Logout

  logout = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      await AuthService.logOut(sessionToken!);
      return response.json({
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
