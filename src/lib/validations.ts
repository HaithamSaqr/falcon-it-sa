import { z } from "zod/v4";

/**
 * Error messages of the demo and contact forms. The server schemas below use
 * the English defaults (the API contract); the forms build the same schemas
 * with the page language's messages (`validation` in messages/*.json), so the
 * rules live in one place and only the wording changes.
 */
export const FORM_MESSAGES_EN = {
  nameRequired: "Name is required",
  emailInvalid: "Invalid email address",
  businessEmail: "Please use a business email",
  phoneRequired: "Phone number is required",
  companyRequired: "Company name is required",
  jobTitleRequired: "Job title is required",
  countryRequired: "Country is required",
  companySizeRequired: "Company size is required",
  industryRequired: "Industry is required",
  consentRequired: "You must agree to the privacy policy",
  subjectRequired: "Subject is required",
  messageMin: "Message must be at least 10 characters",
};

export type FormMessages = typeof FORM_MESSAGES_EN;

export function makeDemoFormSchema(m: FormMessages = FORM_MESSAGES_EN) {
  return z.object({
    fullName: z.string().min(2, m.nameRequired),
    email: z
      .string()
      .email(m.emailInvalid)
      .refine((email) => !/(gmail|yahoo|hotmail|outlook)\./i.test(email), m.businessEmail),
    phone: z.string().min(8, m.phoneRequired),
    company: z.string().min(2, m.companyRequired),
    jobTitle: z.string().min(1, m.jobTitleRequired),
    country: z.string().min(1, m.countryRequired),
    companySize: z.string().min(1, m.companySizeRequired),
    industry: z.string().min(1, m.industryRequired),
    currentERP: z.string().optional(),
    message: z.string().optional(),
    consent: z.literal(true, { message: m.consentRequired }),
    newsletter: z.boolean().optional(),
  });
}

export function makeContactFormSchema(m: FormMessages = FORM_MESSAGES_EN) {
  return z.object({
    name: z.string().min(2, m.nameRequired),
    email: z.string().email(m.emailInvalid),
    phone: z.string().optional(),
    subject: z.string().min(2, m.subjectRequired),
    message: z.string().min(10, m.messageMin),
  });
}

/** Server-side schemas (API routes): English messages, unchanged contract. */
export const demoFormSchema = makeDemoFormSchema();
export const contactFormSchema = makeContactFormSchema();

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
