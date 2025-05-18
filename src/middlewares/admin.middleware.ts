import express from "express";
import prismaClient from "../database/index";
import { ForbiddenError } from "../utils/errors";

export default async function checkAdminMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) {
  try {
    const sessionToken = request.headers.authorization?.split(" ")[1];

    if (!sessionToken) throw new ForbiddenError("Admin access required");
    const session_row = await prismaClient.session.findUnique({
      where: {
        token: sessionToken as string,
      },
      include: {
        user: true,
      },
    });
    if (!session_row) throw new ForbiddenError("Admin access required");

    const user = session_row.user;
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Admin access required");
    }

    request.headers.userId = user.id.toString();
    next();
  } catch (error) {
    next(error);
  }
}
