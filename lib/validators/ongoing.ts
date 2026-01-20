import { z } from "zod";

export const createOnGoingSchema = z.object({
  processId: z.string().uuid(),
  onGoingDate: z.coerce.date(),
  onGoingUnit: z.string().min(1, "Unit is required"),
  onGoingDescription: z.string().min(1, "Description is required"),
});

export const updateOnGoingSchema = z.object({
  onGoingDate: z.coerce.date().optional(),
  onGoingUnit: z.string().min(1).optional(),
  onGoingDescription: z.string().min(1).optional(),
});

export type CreateOnGoingInput = z.infer<typeof createOnGoingSchema>;
export type UpdateOnGoingInput = z.infer<typeof updateOnGoingSchema>;
