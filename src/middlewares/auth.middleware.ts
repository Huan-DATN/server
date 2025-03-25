import express from "express";
import prismaClient from "../database/index";
import { AuthError } from "../utils/errors";

export default async function checkLoggedInMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) {
  try {
    const sessionToken = request.headers.authorization?.split(" ")[1];

    if (!sessionToken) throw new AuthError("Không nhận được session token");
    const session_row = await prismaClient.session.findUnique({
      where: {
        token: sessionToken as string,
      },
      include: {
        account: true,
      },
    });
    if (!session_row) throw new AuthError("Session Token không tồn tại");
    next();
  } catch (error) {
    next(error);
  }
}
