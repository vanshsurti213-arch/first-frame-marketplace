// ============================================================
// Firstframe V2 — Admin Form Validators
// ============================================================

import { z } from "zod";
import { emailSchema, phoneSchema, nonEmptyString } from "./common";
import { NICHE_OPTIONS } from "@/lib/constants";

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const creatorFormSchema = z.object({
  name: nonEmptyString.min(2, "Name must be at least 2 characters"),
  niche: z.enum(NICHE_OPTIONS, {
    message: "Please select a niche",
  }),
  city: nonEmptyString.min(2, "City must be at least 2 characters"),
  email: emailSchema,
  phone: phoneSchema,
  instagram_handle: nonEmptyString.min(1, "Instagram handle is required"),
  default_address: z.string().optional(),
});

export type CreatorFormValues = z.infer<typeof creatorFormSchema>;

export const accessCodeFormSchema = z.object({
  brand_email: emailSchema,
  brand_company_name: nonEmptyString.min(2, "Company name must be at least 2 characters"),
  expires_at: z.string().optional(),
});

export type AccessCodeFormValues = z.infer<typeof accessCodeFormSchema>;

export const approveInviteSchema = z.object({
  agreed_rate: z.coerce.number().min(0, "Rate must be a positive number"),
  brand_rate: z.coerce.number().min(0, "Rate must be a positive number"),
});

export type ApproveInviteValues = z.infer<typeof approveInviteSchema>;

export const dispatchSchema = z.object({
  tracking_link: z.string().url("Please enter a valid tracking URL").optional().or(z.literal("")),
});

export type DispatchValues = z.infer<typeof dispatchSchema>;
