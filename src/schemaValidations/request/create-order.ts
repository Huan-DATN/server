import { z } from "zod";

export const CreateOrderBody = z.object({
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH"]),
});

export type CreateOrderBodyType = z.infer<typeof CreateOrderBody>;
