import { z } from "zod";

export const CardResponse = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  imageId: z.number().int(),
  name: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  image: z.object({
    id: z.number().int(),
    publicUrl: z.string(),
  }),
});

export type CardResponseType = z.infer<typeof CardResponse>;

export const CardDetailResponse = CardResponse.extend({
  user: z.object({
    id: z.number().int(),
    email: z.string().email(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
});

export type CardDetailResponseType = z.infer<typeof CardDetailResponse>;

export const CardListResponse = z.object({
  data: z.array(CardResponse),
  message: z.string(),
});

export type CardListResponseType = z.infer<typeof CardListResponse>;
