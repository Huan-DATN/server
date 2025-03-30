import { addMilliseconds } from "date-fns";
import express from "express";
import ms from "ms";
import envConfig from "../config";
import { PrismaErrorCode } from "../constants/error-reference";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import {
  LoginBodyType,
  RegisterBodyType,
} from "../schemaValidations/auth.schema";
import { comparePassword, hashPassword } from "../utils/crypto";
import { EntityError, isPrismaClientKnownRequestError } from "../utils/errors";
import { signSessionToken } from "../utils/jwt";
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
  validateLogin = async (body: LoginBodyType) => {
    // Bạn có thể thêm xác thực ở đây
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new EntityError([
        { field: "email", message: "Email chưa được đăng kí" },
      ]);
    }
    if (!user.isActive) {
      throw new EntityError([
        { field: "email", message: "Tài khoản đã bị khoá" },
      ]);
    }
    const isPasswordMatch = await comparePassword(body.password, user.password);
    if (!isPasswordMatch) {
      throw new EntityError([
        { field: "password", message: "Email hoặc Mật khầu không khớp" },
      ]);
    }
    const sessionToken = signSessionToken({
      userId: user.id,
    });
    const expiresAt = addMilliseconds(
      new Date(),
      ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
    );

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });
    return {
      user,
      session,
    };
  };

  login = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    // Bạn có thể thêm xác thực ở đây
    try {
      const body = request.body as LoginBodyType;
      const { user, session } = await this.validateLogin(body);
      return response.json({
        data: {
          token: session.token,
          expiresAt: session.expiresAt,
          user: {
            id: user.id,
            name: user.firstName,
            email: user.email,
          },
        },
        message: "Đăng nhập thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion

  //#region Register

  registerService = async (body: RegisterBodyType) => {
    try {
      const hashedPassword = await hashPassword(body.password);
      const user = await this.prisma.user.create({
        data: {
          lastName: body.lastName,
          firstName: body.firstName,
          email: body.email,
          password: hashedPassword,
        },
      });

      const sessionToken = signSessionToken({
        userId: user.id,
      });
      const expiresAt = addMilliseconds(
        new Date(),
        ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
      );
      const session = await this.prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
        },
      });
      return {
        user,
        session,
      };
    } catch (error: any) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.UniqueConstraintViolation) {
          throw new EntityError([
            { field: "email", message: "Email đã tồn tại" },
          ]);
        }
      }
      throw error;
    }
  };

  register = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    // Bạn có thể thêm xác thực ở đây
    try {
      const body = request.body as RegisterBodyType;
      const { session, user } = await this.registerService(body);
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
  slideSessionService = async (sessionToken: string) => {
    const expiresAt = addMilliseconds(
      new Date(),
      ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
    );
    const session = await this.prisma.session.update({
      where: {
        token: sessionToken,
      },
      data: {
        expiresAt,
      },
    });
    return session;
  };

  slideSession = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      const session = await this.slideSessionService(sessionToken!);

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
  logoutService = async (sessionToken: string) => {
    await this.prisma.session.delete({
      where: {
        token: sessionToken,
      },
    });
  };
  logout = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const sessionToken = request.headers.authorization?.split(" ")[1];
      await this.logoutService(sessionToken!);
      return response.json({
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
