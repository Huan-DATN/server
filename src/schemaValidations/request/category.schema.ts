import { z } from "zod";

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  isActive: z.boolean().optional().default(true),
});

// Schema for updating a category
export const updateCategorySchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid category ID").transform(Number),
  body: z.object({
    name: z
      .string()
      .min(1, "Category name is required")
      .max(100, "Category name must be less than 100 characters")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// Schema for deleting a category
export const deleteCategorySchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid category ID").transform(Number),
});

// Schema for query parameters when getting categories
export const getCategoriesSchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
  limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
  name: z.string().optional().default(""),
  isActive: z.boolean().optional(),
  sortBy: z
    .enum(["name", "isActive", "createdAt", "updatedAt"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryRequest = z.infer<typeof deleteCategorySchema>;
export type GetCategoriesRequest = z.infer<typeof getCategoriesSchema>;
