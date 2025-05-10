import { z } from "zod";
import { RatingSchema } from "../schema";

export const RatingRes = z.object({
  data: RatingSchema,
  message: z.string(),
});

export const RatingListRes = z.object({
  data: z.array(RatingSchema),
  meta: z.object({
    total: z.number(),
    totalPages: z.number(),
  }),
  message: z.string(),
});

export const RatingSummaryRes = z.object({
  data: z.object({
    rating: z.number(),
    totalRatings: z.number(),
    stars: z.array(z.number()),
  }),
  message: z.string(),
});
