import { z } from "zod";
import { CartItemSchema } from "../schema";

export const CartRes = z.object({
  data: z.array(
    z.object({
      shop: z.object({
        id: z.number().int(),
        shopName: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
      }),
      cartItems: z.array(CartItemSchema),
      totalPrice: z.number(),
    }),
  ),
  message: z.string(),
});

export type CartResType = z.TypeOf<typeof CartRes>;
