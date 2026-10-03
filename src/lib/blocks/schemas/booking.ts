import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { ctaSchema, b, demoCta } from "../fields";

/** The committed brand-blue block, used once per page. */
export const bookingSchema = z.object({
  heading: biRequiredSchema,
  body: biSchema,
  cta: ctaSchema,
  noteTitle: biSchema,
  note: biSchema,
});

export type BookingContent = z.infer<typeof bookingSchema>;

export const bookingDefaults = (): BookingContent => ({
  heading: b("See your own workflow running in the ERP.", "شاهد دورتك تعمل داخل النظام."),
  body: b(""),
  cta: demoCta(),
  noteTitle: b(""),
  note: b(""),
});
