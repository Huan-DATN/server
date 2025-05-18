import z from "zod";
import { UserSchema } from "./schema";

export const UserRes = z
  .object({
    data: UserSchema,
    message: z.string(),
  })
  .strict();

export type UserResType = z.TypeOf<typeof UserRes>;

export const UpdateMeBody = z
  .object({
    phone: z
      .string()
      .min(10, { message: "Số điện thoại phải có ít nhất 10 ký tự." })
      .max(15, { message: "Số điện thoại không được vượt quá 15 ký tự." })
      .optional(),
    firstName: z
      .string()
      .min(2, { message: "Tên phải có ít nhất 2 ký tự." })
      .max(256, { message: "Tên không được vượt quá 256 ký tự." })
      .optional(),
    lastName: z
      .string()
      .min(2, { message: "Họ phải có ít nhất 2 ký tự." })
      .max(256, { message: "Họ không được vượt quá 256 ký tự." })
      .optional(),
    address: z
      .string()
      .min(2, { message: "Địa chỉ phải có ít nhất 2 ký tự." })
      .max(256, { message: "Địa chỉ không được vượt quá 256 ký tự." })
      .optional(),
    shopName: z
      .string()
      .min(2, { message: "Tên cửa hàng phải có ít nhất 2 ký tự." })
      .max(256, { message: "Tên cửa hàng không được vượt quá 256 ký tự." })
      .optional(),
    image: z
      .object({
        id: z.number().int(),
        publicUrl: z.string(),
      })
      .optional()
      .nullable(),
  })
  .strict();

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>;

export const UpdatePasswordBody = z.object({
  oldPassword: z.string().min(6).max(256),
  newPassword: z.string().min(6).max(256),
});

export const SearchUserQuery = z.object({
  id: z.coerce.number().int().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  role: z.enum(["SELLER", "BUYER", "ADMIN"]).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type SearchUserQueryType = z.TypeOf<typeof SearchUserQuery>;

export type UpdatePasswordBodyType = z.TypeOf<typeof UpdatePasswordBody>;
