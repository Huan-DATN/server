import jwt from "jsonwebtoken";
import ms from "ms";
import Config from "../config";
import { TokenType } from "../constants/type";
import { TokenPayload } from "../types/jwt.types";

export const signSessionToken = (
  payload: Pick<TokenPayload, "userId" | "role">,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(
    {
      ...payload,
      userId: payload.userId,
      role: payload.role,
      tokenType: TokenType.SessionToken,
    },
    Config.SESSION_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: ms(Config.SESSION_TOKEN_EXPIRES_IN as any),
      ...options,
    } as any,
  );
};

export const verifySessionToken = (token: string): TokenPayload => {
  return jwt.verify(token, Config.SESSION_TOKEN_SECRET) as TokenPayload;
};
