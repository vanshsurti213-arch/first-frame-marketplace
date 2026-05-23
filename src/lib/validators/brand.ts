// ============================================================
// Firstframe V1 — Brand Form Validators
// ============================================================

import { z } from "zod";
import { nonEmptyString } from "./common";

export const brandLoginSchema = z.object({
  companyName: nonEmptyString.min(2, "Company name must be at least 2 characters"),
  accessCode: nonEmptyString.min(4, "Access code must be at least 4 characters"),
});

export type BrandLoginValues = z.infer<typeof brandLoginSchema>;

export const productFormSchema = z.object({
  name: nonEmptyString.min(2, "Product name must be at least 2 characters"),
  product_url: nonEmptyString.url("Must be a valid URL"),
  variants: z
    .array(
      z.object({
        id: z.string(),
        label: nonEmptyString.min(1, "Variant label is required"),
      })
    )
    .min(1, "At least one variant is required"),
  assigned_creator_ids: z
    .array(z.string())
    .min(1, "At least one creator must be assigned"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const scriptFormSchema = z.object({
  script_content: nonEmptyString.min(10, "Script must be at least 10 characters"),
  brief_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sop_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ScriptFormValues = z.infer<typeof scriptFormSchema>;

export const revisionFeedbackSchema = z.object({
  feedback: nonEmptyString.min(10, "Please provide detailed feedback (at least 10 characters)"),
});

export type RevisionFeedbackValues = z.infer<typeof revisionFeedbackSchema>;

export const inviteCreatorSchema = z.object({
  brand_rate: z.coerce.number().min(0, "Rate must be a positive number"),
  ad_rights_duration: z.string().min(1, "Please specify ad rights duration"),
});

export type InviteCreatorValues = z.infer<typeof inviteCreatorSchema>;
