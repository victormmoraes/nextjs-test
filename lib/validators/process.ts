import { z } from "zod";

export const createProcessSchema = z.object({
  processNumber: z.string().min(1, "Process number is required"),
  classificationId: z.number().int().positive(),
  tenantId: z.number().int().positive().optional().nullable(),
  generationDate: z.coerce.date(),
  lastUpdateDate: z.coerce.date(),
  interestedParties: z.array(z.string()).default([]),
  pdfUrl: z.string().url("Invalid PDF URL"),
  isFavorite: z.boolean().default(false),
});

export const updateProcessSchema = z.object({
  processNumber: z.string().min(1).optional(),
  classificationId: z.number().int().positive().optional(),
  generationDate: z.coerce.date().optional(),
  lastUpdateDate: z.coerce.date().optional(),
  interestedParties: z.array(z.string()).optional(),
  pdfUrl: z.string().url().optional(),
  isFavorite: z.boolean().optional(),
});

export const addInterestedPartySchema = z.object({
  party: z.string().min(1, "Party name is required"),
});

export type CreateProcessInput = z.infer<typeof createProcessSchema>;
export type UpdateProcessInput = z.infer<typeof updateProcessSchema>;
export type AddInterestedPartyInput = z.infer<typeof addInterestedPartySchema>;
