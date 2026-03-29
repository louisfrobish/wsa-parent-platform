import { z } from "zod";

export const adminClassStatusValues = ["draft", "published", "full", "cancelled", "completed"] as const;

export const adminClassFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  class_type: z.string().trim().min(2).max(80),
  date: z.string().trim().min(1),
  start_time: z.string().trim().min(1),
  end_time: z.string().trim().min(1),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  age_min: z.coerce.number().int().min(0).max(18),
  age_max: z.coerce.number().int().min(0).max(18),
  price_cents: z.coerce.number().int().min(0),
  max_capacity: z.coerce.number().int().min(1).max(500),
  spots_remaining: z.coerce.number().int().min(0).max(500),
  what_to_bring: z.string().trim().max(1000).optional().or(z.literal("")),
  weather_note: z.string().trim().max(1000).optional().or(z.literal("")),
  internal_notes: z.string().trim().max(2000).optional().or(z.literal("")),
  waiver_required: z.boolean(),
  status: z.enum(adminClassStatusValues)
}).superRefine((value, ctx) => {
  if (value.age_max < value.age_min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum age must be greater than or equal to minimum age.",
      path: ["age_max"]
    });
  }

  if (value.spots_remaining > value.max_capacity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Spots remaining cannot exceed max capacity.",
      path: ["spots_remaining"]
    });
  }
});

export const adminBookingActionSchema = z.object({
  action: z.enum(["mark_attended", "mark_no_show", "cancel_booking", "mark_refunded"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  parentRating: z.coerce.number().int().min(1).max(5).optional()
});
