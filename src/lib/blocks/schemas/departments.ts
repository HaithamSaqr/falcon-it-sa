import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { iconSchema, imageSchema, b } from "../fields";

const departmentSchema = z.object({
  icon: iconSchema,
  title: biRequiredSchema,
  line: biSchema,
});

export const departmentsSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  items: z.array(departmentSchema).max(16),
  /** Optional photo beside the list (home). Missing or "" means a full-width list. */
  image: imageSchema.optional(),
  imageAlt: biSchema.optional(),
});

export type DepartmentsContent = z.infer<typeof departmentsSchema>;

export const departmentsDefaults = (): DepartmentsContent => ({
  heading: b("One system. Every department.", "نظام واحد. كل الأقسام."),
  intro: b(""),
  items: [{ icon: "Calculator", title: b("Accounting and e-invoicing"), line: b("") }],
});
