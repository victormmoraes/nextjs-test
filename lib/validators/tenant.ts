import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  tenantLogo: z.string().url().optional().nullable(),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
