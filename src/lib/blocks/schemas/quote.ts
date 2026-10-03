import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { imageSchema, b } from "../fields";

/** Ships disabled until a real, approved client quote is entered. */
export const quoteSchema = z.object({
  text: biRequiredSchema,
  name: biSchema,
  role: biSchema,
  company: biSchema,
  logo: imageSchema,
  logoAlt: biSchema,
});

export type QuoteContent = z.infer<typeof quoteSchema>;

export const quoteDefaults = (): QuoteContent => ({
  text: b("Enter a real, approved client quote."),
  name: b(""),
  role: b(""),
  company: b(""),
  logo: "",
  logoAlt: b(""),
});
