import { z } from "zod";

export const CreateCardSchema = z.object({
  imageId: z.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
});

export type CreateCardType = z.infer<typeof CreateCardSchema>;

export const UpdateCardSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  accountNumber: z.string().min(1, "Account number is required").optional(),
  bankName: z.string().min(1, "Bank name is required").optional(),
  imageId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCardType = z.infer<typeof UpdateCardSchema>;

export const CardParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CardParamType = z.infer<typeof CardParamSchema>;
