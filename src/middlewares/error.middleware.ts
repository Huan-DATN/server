import { NextFunction, Request, Response } from "express";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
  AuthError,
  EntityError,
  ForbiddenError,
  StatusError,
} from "../utils/errors";

const isEntityError = (error: any): error is EntityError => {
  return error.status === 422;
};

const isAuthError = (error: any): error is AuthError => {
  return error.status === 401;
};

const isForbiddenError = (error: any): error is ForbiddenError => {
  return error.status === 403;
};

const isStatusError = (error: any): error is StatusError => {
  return error.status !== 400;
};

const isNotFoundError = (error: any): error is StatusError => {
  return error.status === 404;
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
  console.log(error);
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
  } else if (isNotFoundError(error)) {
    return response.status(error.status).send({
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
