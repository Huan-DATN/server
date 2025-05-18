import { z } from "zod";

export const AdminDashboardSystemRes = z.object({
  data: z.object({
    users: z.object({
      totalShops: z.number(),
      totalBuyers: z.number(),
      totalAdmins: z.number(),
      totalUsers: z.number(),
    }),
    shops: z.object({
      total: z.number(),
      active: z.number(),
      inactive: z.number(),
    }),
    products: z.object({
      total: z.number(),
      active: z.number(),
      inactive: z.number(),
    }),
    orders: z.object({
      total: z.number(),
      byStatus: z.array(
        z.object({
          statusId: z.number(),
          statusName: z.string(),
          statusType: z.string(),
          count: z.number(),
        }),
      ),
    }),
    revenue: z.object({
      total: z.number(),
    }),
  }),
  message: z.string(),
});

export type AdminDashboardSystemResType = z.infer<
  typeof AdminDashboardSystemRes
>;
