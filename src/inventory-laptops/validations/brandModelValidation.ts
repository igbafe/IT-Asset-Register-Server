import { z } from "zod";

export const brandModelSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").trim(),
  models: z
    .array(z.string().min(1, "Model name cannot be empty"))
    .min(1, "At least one model is required"),
});

export const addModelSchema = z.object({
  model: z.string().min(1, "Model name is required").trim(),
});
