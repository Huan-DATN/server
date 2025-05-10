import { z } from "zod";
import { CategorySchema, CitySchema, GroupProductSchema, StatusSchema } from "../schema";

export const GroupProductsListRes = z.object({
  data: z.array(GroupProductSchema),
  message: z.string(),
});

export type GroupProductsListResType = z.TypeOf<typeof GroupProductsListRes>;

export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
  message: z.string(),
});
export type CategoryListResType = z.TypeOf<typeof CategoryListRes>;

export const CityListRes = z.object({
  data: z.array(CitySchema),
  message: z.string(),
});

export type CityListResType = z.TypeOf<typeof CityListRes>;

export const StatusListRes = z.object({
  data: z.array(StatusSchema),
  message: z.string(),
});

export type StatusListResType = z.TypeOf<typeof StatusListRes>;
