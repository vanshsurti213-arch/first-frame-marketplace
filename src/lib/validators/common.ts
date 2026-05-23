// ============================================================
// Firstframe V1 — Zod Validation Schemas (Common)
// ============================================================

import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[+]?[\d\s-]{10,15}$/, "Please enter a valid phone number");

export const urlSchema = z
  .string()
  .url("Please enter a valid URL");

export const driveUrlSchema = z
  .string()
  .min(1, "Drive link is required")
  .url("Please enter a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname === "drive.google.com" || parsed.hostname === "docs.google.com";
      } catch {
        return false;
      }
    },
    "Please enter a valid Google Drive link"
  );

export const nonEmptyString = z.string().min(1, "This field is required");
