import z from "zod";

export const CreateProductBody = z.object({
  name: z.string().min(1).max(256),
  price: z.number().positive(),
  description: z.string().max(10000),
  image: z.string().url(),
});

export type CreateProductBodyType = z.TypeOf<typeof CreateProductBody>;

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  quantity: z.number(),
  price: z.number(),
  image: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number(),
});

export const ProductRes = z.object({
  data: ProductSchema,
  message: z.string(),
});

export type ProductSchemaType = z.TypeOf<typeof ProductSchema>;

export type ProductResType = z.TypeOf<typeof ProductRes>;

export const ProductListRes = z.object({
  data: z.array(ProductSchema),
  message: z.string(),
});

export type ProductListResType = z.TypeOf<typeof ProductListRes>;

export const SearchProductQuery = z
  .object({
    name: z.string().optional(),
    categoryIds: z.array(z.number()).optional(),
    priceIds: z.array(z.number()).optional(),
  })
  .passthrough();
export type SearchProductQueryType = z.infer<typeof SearchProductQuery>;

export const UpdateProductBody = CreateProductBody;
export type UpdateProductBodyType = CreateProductBodyType;
export const ProductParams = z.object({
  id: z.coerce.number(),
});
export type ProductParamsType = z.TypeOf<typeof ProductParams>;
