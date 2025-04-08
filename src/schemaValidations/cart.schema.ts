import { z } from "zod";

export const AddItemToCartBody = z
  .object({
    productId: z.number().min(1),
    quantity: z.number().min(1),
  })
  .strict();

export type AddItemToCartBodyType = z.TypeOf<typeof AddItemToCartBody>;

export const UpdateCartItemBody = z
  .object({
    quantity: z.number().min(1),
  })
  .strict();

export type UpdateCartItemBodyType = z.TypeOf<typeof UpdateCartItemBody>;
