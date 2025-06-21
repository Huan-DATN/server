import { z } from "zod";

export const CreatePaymentSchema = z.object({
  orderId: z.number().int().positive(),
  imageId: z.number().int().positive(),
  amount: z.number().positive(),
});

export type CreatePaymentType = z.infer<typeof CreatePaymentSchema>;

export const PaymentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type PaymentParamType = z.infer<typeof PaymentParamSchema>;

export const OrderPaymentParamSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

export type OrderPaymentParamType = z.infer<typeof OrderPaymentParamSchema>;

export const PaymentPaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type PaymentPaginationType = z.infer<typeof PaymentPaginationSchema>;
