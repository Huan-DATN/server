import { addMilliseconds } from "date-fns";
import express from "express";
import ms from "ms";
import envConfig from "../config";
import { PrismaErrorCode } from "../constants/error-reference";
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
  }

  //#region Login
  validateLogin = async (body: LoginBodyType) => {
    // Bạn có thể thêm xác thực ở đây
    const account = await this.prisma.account.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!account) {
      throw new EntityError([
        { field: "email", message: "Not found any Account with this email" },
      ]);
    }
    const isPasswordMatch = await comparePassword(
      body.password,
      account.password,
    );
    if (!isPasswordMatch) {
      throw new EntityError([
        { field: "password", message: "Email or Password Not Match" },
      ]);
    }
    const sessionToken = signSessionToken({
      userId: account.id,
    });
    const expiresAt = addMilliseconds(
      new Date(),
      ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
    );

    const session = await this.prisma.session.create({
      data: {
        accountId: account.id,
        token: sessionToken,
        expiresAt,
      },
    });
    return {
      account,
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
      const { account, session } = await this.validateLogin(body);
      console.log(body);
      return response.json({
        data: {
          token: session.token,
          expiresAt: session.expiresAt,
          account: {
            id: account.id,
            name: account.name,
            email: account.email,
          },
        },
        message: "Login successfully",
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
      const account = await this.prisma.account.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
        },
      });

      const sessionToken = signSessionToken({
        userId: account.id,
      });
      const expiresAt = addMilliseconds(
        new Date(),
        ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
      );
      const session = await this.prisma.session.create({
        data: {
          accountId: account.id,
          token: sessionToken,
          expiresAt,
        },
      });
      return {
        account,
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
      const { session, account } = await this.registerService(body);
      return response.send({
        message: "Đăng ký thành công",
        data: {
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
          account,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
