import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required").max(50).toUpperCase(),
});

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
