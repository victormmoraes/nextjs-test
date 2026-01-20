import { z } from "zod";

export const createProtocolSchema = z.object({
  processId: z.string().uuid(),
  protocolNumber: z.string().min(1, "Protocol number is required"),
  protocolType: z.string().min(1, "Protocol type is required"),
  protocolUnit: z.string().min(1, "Protocol unit is required"),
  protocolCreatedAt: z.coerce.date(),
  protocolIncludedAt: z.coerce.date(),
});

export const updateProtocolSchema = z.object({
  protocolNumber: z.string().min(1).optional(),
  protocolType: z.string().min(1).optional(),
  protocolUnit: z.string().min(1).optional(),
  protocolCreatedAt: z.coerce.date().optional(),
  protocolIncludedAt: z.coerce.date().optional(),
});

export type CreateProtocolInput = z.infer<typeof createProtocolSchema>;
export type UpdateProtocolInput = z.infer<typeof updateProtocolSchema>;
