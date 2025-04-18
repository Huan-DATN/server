import { z } from "zod";
import { ImageSchema } from "../schema";

export const ImageRes = z.object({
  data: ImageSchema,
  message: z.string(),
});

export type ImageResType = z.TypeOf<typeof ImageRes>;
