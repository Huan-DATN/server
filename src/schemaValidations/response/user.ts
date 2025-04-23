import { z } from "zod";

export const ShopsListRes = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      shopName: z.string(),
      address: z.string(),
      productsTotal: z.number(),
      image: z
        .object({
          id: z.number().int(),
          publicUrl: z.string(),
        })
        .nullable(),
    }),
  ),
  meta: z.object({
    total: z.number(),
    totalPages: z.number(),
  }),
  message: z.string(),
});

export type ShopsListResType = z.TypeOf<typeof ShopsListRes>;
