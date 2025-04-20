import { z } from "zod";

export const CreateProductBody = z.object({
  name: z.string().min(1, { message: "Tên là bắt buộc" }),
  description: z.string().min(1, { message: "Mô tả là bắt buộc" }),
  price: z.number().min(0, { message: "Giá phải lớn hơn 0" }),
  cityId: z.number().min(1, { message: "ID thành phố là bắt buộc" }),
  groupProductId: z
    .number()
    .min(1, { message: "ID nhóm sản phẩm là bắt buộc" }),
  categories: z
    .array(z.number())
    .nonempty({ message: "Cần ít nhất một danh mục" }),
  star: z
    .number()
    .min(0)
    .max(5, { message: "Đánh giá sao phải từ 0 đến 5" })
    .optional(),
  quantity: z.number().min(1, { message: "Số lượng phải lớn hơn 0" }),
  isActive: z.boolean().optional(),
  images: z.array(z.number()).nonempty({ message: "Cần ít nhất một ảnh" }),
});

export type CreateProductBodyType = z.infer<typeof CreateProductBody>;
