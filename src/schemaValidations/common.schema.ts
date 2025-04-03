import z from "zod";

export const MessageRes = z
  .object({
    message: z.string(),
  })
  .strict();

export const PaginationReq = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export type PaginationReqType = z.TypeOf<typeof PaginationReq>;

export type MessageResType = z.TypeOf<typeof MessageRes>;
