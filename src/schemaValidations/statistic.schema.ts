import { z } from "zod";

// Base date range schema
export const DateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Schema for monthly statistics query
export const MonthlyStatisticsQuerySchema = z.object({
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

// Schema for daily statistics query
export const DailyStatisticsQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : new Date().getMonth())),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : new Date().getFullYear())),
});

// Types for the schemas
export type DateRangeType = z.infer<typeof DateRangeSchema>;
export type MonthlyStatisticsQueryType = z.infer<
  typeof MonthlyStatisticsQuerySchema
>;
export type DailyStatisticsQueryType = z.infer<
  typeof DailyStatisticsQuerySchema
>;
