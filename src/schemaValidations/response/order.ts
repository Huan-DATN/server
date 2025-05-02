import { z } from "zod";
import { CartItemSchema, UserSchema } from "../schema";

export const CheckoutOrderRes = z.object({
  message: z.string(),
  data: z.object({
    shop: UserSchema,
    cartItems: z.array(CartItemSchema),
    totalPrice: z.number(),
  }),
});

export type CheckoutOrderResType = z.infer<typeof CheckoutOrderRes>;
