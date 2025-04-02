import { addMilliseconds } from "date-fns";
import ms from "ms";
import envConfig from "../config";
import { PrismaErrorCode } from "../constants/error-reference";
import prismaClient from "../database";
import {
  LoginBodyType,
  RegisterBodyType,
} from "../schemaValidations/auth.schema";
import { comparePassword, hashPassword } from "../utils/crypto";
import { EntityError, isPrismaClientKnownRequestError } from "../utils/errors";
import { signSessionToken } from "../utils/jwt";

const registerService = async (body: RegisterBodyType) => {
  try {
    const hashedPassword = await hashPassword(body.password);
    const user = await prismaClient.user.create({
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
    const session = await prismaClient.session.create({
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

const validateLogin = async (body: LoginBodyType) => {
  // Bạn có thể thêm xác thực ở đây
  const user = await prismaClient.user.findUnique({
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

  const session = await prismaClient.session.create({
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

const slideSession = async (sessionToken: string) => {
  const expiresAt = addMilliseconds(
    new Date(),
    ms(envConfig.SESSION_TOKEN_EXPIRES_IN as any) as any,
  );
  const session = await prismaClient.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt,
    },
  });
  return session;
};

const logOut = async (sessionToken: string) => {
  await prismaClient.session.delete({
    where: {
      token: sessionToken,
    },
  });
};

export { logOut, registerService, slideSession, validateLogin };
