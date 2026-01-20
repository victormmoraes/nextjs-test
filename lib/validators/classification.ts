import { z } from "zod";

export const createClassificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  abbreviation: z.string().min(1, "Abbreviation is required").max(50),
  category: z.string().min(1, "Category is required").max(100),
  subCategory: z.string().min(1, "Sub-category is required").max(100),
});

export const updateClassificationSchema = createClassificationSchema.partial();

export type CreateClassificationInput = z.infer<typeof createClassificationSchema>;
export type UpdateClassificationInput = z.infer<typeof updateClassificationSchema>;
