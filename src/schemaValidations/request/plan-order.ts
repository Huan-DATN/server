import { z } from "zod";

export const PlanOrderBody = z.array(
  z.object({
    date: z.coerce.date({
      required_error: "Ngày là bắt buộc",
      invalid_type_error: "Ngày không hợp lệ",
    }),
    statusId: z.number(),
  }),
);

export type PlanOrderBodyType = z.infer<typeof PlanOrderBody>;
