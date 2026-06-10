import { z } from "zod/v4";

export const demoFormSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => !/(gmail|yahoo|hotmail|outlook)\./i.test(email),
      "Please use a business email"
    ),
  phone: z.string().min(8, "Phone number is required"),
  company: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  country: z.string().min(1, "Country is required"),
  companySize: z.string().min(1, "Company size is required"),
  industry: z.string().min(1, "Industry is required"),
  currentERP: z.string().optional(),
  message: z.string().optional(),
  consent: z.literal(true, { message: "You must agree to the privacy policy" }),
  newsletter: z.boolean().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const sectorLeadSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  users: z
    .number({ message: "Number of users is required" })
    .int()
    .min(1, "At least 1 user")
    .max(100000, "Too many users"),
});

export type DemoFormData = z.infer<typeof demoFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type SectorLeadData = z.infer<typeof sectorLeadSchema>;
