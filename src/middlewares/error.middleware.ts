import { NextFunction, Request, Response } from "express";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  AuthError,
  EntityError,
  ForbiddenError,
  StatusError,
} from "../utils/errors";

const isEntityError = (error: any): error is EntityError => {
  if (error instanceof EntityError) {
    return true;
  }
  return false;
};

const isAuthError = (error: any): error is AuthError => {
  if (error instanceof AuthError) {
    return true;
  }
  return false;
};

const isForbiddenError = (error: any): error is ForbiddenError => {
  if (error instanceof ForbiddenError) {
    return true;
  }
  return false;
};

const isStatusError = (error: any): error is StatusError => {
  if (error instanceof StatusError) {
    return true;
  }
  return false;
};

export default function errorMiddleware(
  error:
    | EntityError
    | AuthError
    | ForbiddenError
    | PrismaClientKnownRequestError,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (isEntityError(error)) {
    return response.status(error.status).send({
      message: "Lỗi xảy ra khi xác thực dữ liệu...",
      errors: error.fields,
      statusCode: error.status,
    });
  } else if (isForbiddenError(error)) {
    return response.status(error.status).send({
      message: error.message,
      statusCode: error.status,
    });
  } else if (isAuthError(error)) {
    return response
      .cookie("sessionToken", "", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(error.status)
      .send({
        message: error.message,
        statusCode: error.status,
      });
  } else if (isStatusError(error)) {
    return response.status(error.status).send({
      message: error.message,
      statusCode: error.status,
    });
  } else {
    const statusCode = (error as any).statusCode || 400;
    return response.status(statusCode).send({
      message: error.message,
      error,
      statusCode,
    });
  }
}
