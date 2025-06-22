import { z } from "zod";

export const UpdateUserSchema = z.object({
  imageId: z.number().int().positive().optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  password: z.string().min(1, "Password is required").optional(),
  shopName: z.string().min(1, "Shop name is required").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  shopName: z.string().min(1, "Shop name is required"),
  imageId: z.number().int().positive().optional().nullable(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]),
  isActive: z.boolean().default(true),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;
