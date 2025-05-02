import { z } from "zod";
import { CartItemSchema, OrderDetailSchema, UserSchema } from "../schema";

export const CheckoutOrderRes = z.object({
  message: z.string(),
  data: z.object({
    shop: UserSchema,
    cartItems: z.array(CartItemSchema),
    totalPrice: z.number(),
  }),
});

export type CheckoutOrderResType = z.infer<typeof CheckoutOrderRes>;

export const OrderListRes = z.object({
  message: z.string(),
  data: z.array(OrderDetailSchema),
  meta: z.object({
    totalPages: z.number(),
    totalItems: z.number(),
  }),
});

export type OrderListResType = z.infer<typeof OrderListRes>;
