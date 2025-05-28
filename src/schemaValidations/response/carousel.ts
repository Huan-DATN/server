import { z } from "zod";
import { CarouselItemSchema } from "../schema";

// Define the transformed carousel item format for the public API

export const CarouselListRes = z.object({
  data: z.array(CarouselItemSchema),
  meta: z
    .object({
      total: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
  message: z.string(),
});

export const CarouselRes = z.object({
  data: CarouselItemSchema,
  message: z.string(),
});
