import { z } from "zod";
import { InteractionType } from "@prisma/client";

export const createInteractionLogSchema = z.object({
  userId: z.number().int().positive(),
  tenantId: z.number().int().positive(),
  interactionType: z.nativeEnum(InteractionType),
  threadId: z.string().optional().nullable(),
  runId: z.string().optional().nullable(),
  userMessage: z.string().optional().nullable(),
  assistantResponse: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
  status: z.string().max(50).optional().nullable(),
  tokensUsed: z.number().int().optional().nullable(),
  responseTimeMs: z.number().int().optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

export const createAccessLogSchema = z.object({
  userId: z.number().int().positive(),
  tenantId: z.number().int().positive(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().optional().nullable(),
  loggedInAt: z.coerce.date(),
});

export const updateBotLogSchema = z.object({
  numberOfUpdates: z.number().int().min(0),
});

export type CreateInteractionLogInput = z.infer<typeof createInteractionLogSchema>;
export type CreateAccessLogInput = z.infer<typeof createAccessLogSchema>;
export type UpdateBotLogInput = z.infer<typeof updateBotLogSchema>;
