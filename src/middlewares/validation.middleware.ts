import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { EntityError } from "../utils/errors";

// Generic validation middleware
export const validateRequest = <T extends z.ZodTypeAny>(
  schema: T,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errorDetails = result.error.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        }));

        throw new EntityError(errorDetails);
      }

      // Update the request with the validated and transformed data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
