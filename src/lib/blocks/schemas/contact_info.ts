import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { b } from "../fields";

/** Which site settings and branches the contact page shows. */
export const contactInfoSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  show: z.object({
    phone: z.boolean(),
    whatsapp: z.boolean(),
    email: z.boolean(),
    address: z.boolean(),
    hours: z.boolean(),
    branches: z.boolean(),
    social: z.boolean(),
  }),
});

export type ContactInfoContent = z.infer<typeof contactInfoSchema>;

export const contactInfoDefaults = (): ContactInfoContent => ({
  heading: b("Contact us", "تواصل معنا"),
  intro: b(""),
  show: {
    phone: true,
    whatsapp: true,
    email: true,
    address: true,
    hours: true,
    branches: true,
    social: false,
  },
});
