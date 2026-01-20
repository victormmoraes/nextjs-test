import { z } from "zod";

export const createSummarySchema = z.object({
  processId: z.string().uuid(),
  summaryData: z.record(z.string(), z.unknown()),
  lastSummarizedAt: z.coerce.date().optional().nullable(),
});

export const updateSummarySchema = z.object({
  summaryData: z.record(z.string(), z.unknown()).optional(),
  lastSummarizedAt: z.coerce.date().optional().nullable(),
});

export type CreateSummaryInput = z.infer<typeof createSummarySchema>;
export type UpdateSummaryInput = z.infer<typeof updateSummarySchema>;
