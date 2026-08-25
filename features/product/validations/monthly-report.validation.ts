import { z } from "zod";

import { isReportMonthAllowed } from "../utils/monthly-report-range";

export const MonthlyReportRequestSchema = z
  .object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
  })
  .refine(({ year, month }) => isReportMonthAllowed(year, month), {
    message: "Selected month is outside the last 12 months.",
  });

export type MonthlyReportRequest = z.infer<typeof MonthlyReportRequestSchema>;
