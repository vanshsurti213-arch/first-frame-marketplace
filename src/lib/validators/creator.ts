// ============================================================
// Firstframe V1 — Creator Form Validators
// ============================================================

import { z } from "zod";
import { driveUrlSchema, nonEmptyString } from "./common";

export const shippingAddressSchema = z.object({
  address: nonEmptyString.min(10, "Please enter your full shipping address"),
});

export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;

export const contentSubmissionSchema = z.object({
  driveLink: driveUrlSchema,
});

export type ContentSubmissionValues = z.infer<typeof contentSubmissionSchema>;

export const preferenceSchema = z.object({
  selectedVariantId: nonEmptyString,
});

export type PreferenceValues = z.infer<typeof preferenceSchema>;
