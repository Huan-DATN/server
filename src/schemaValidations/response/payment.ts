import { z } from "zod";

export const PaymentResponse = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  imageId: z.number().int(),
  orderId: z.number().int(),
  amount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.number().int(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  image: z.object({
    id: z.number().int(),
    url: z.string().url(),
    publicId: z.string(),
  }),
  order: z.object({
    id: z.number().int(),
    total: z.number(),
    addressLine: z.string(),
    phone: z.string(),
  }),
});

export type PaymentResponseType = z.infer<typeof PaymentResponse>;

export const PaymentListResponse = z.object({
  data: z.array(PaymentResponse),
  pagination: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export type PaymentListResponseType = z.infer<typeof PaymentListResponse>;
