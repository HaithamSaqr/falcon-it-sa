import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { imageSchema, optionalCtaSchema, checkOptionalCta, b, noCta } from "../fields";

/** One side of the Odoo vs Falcon ERP comparison. */
const erpCardSchema = z.object({
  logo: imageSchema,
  logoAlt: biSchema,
  title: biRequiredSchema,
  body: biSchema,
  chips: z.array(biSchema).max(16),
  points: z.array(biSchema).max(12),
  link: optionalCtaSchema,
});

export const erpCompareSchema = z
  .object({
    heading: biRequiredSchema,
    intro: biSchema,
    odoo: erpCardSchema,
    falcon: erpCardSchema,
  })
  .superRefine((v, ctx) => {
    checkOptionalCta(v.odoo.link, ["odoo", "link"], ctx);
    checkOptionalCta(v.falcon.link, ["falcon", "link"], ctx);
  });

export type ErpCompareContent = z.infer<typeof erpCompareSchema>;

const card = (en: string): ErpCompareContent["odoo"] => ({
  logo: "",
  logoAlt: b(""),
  title: b(en),
  body: b(""),
  chips: [],
  points: [],
  link: noCta(),
});

export const erpCompareDefaults = (): ErpCompareContent => ({
  heading: b("Two ERPs. One honest recommendation.", "نظامان. توصية صريحة واحدة."),
  intro: b(""),
  odoo: card("Odoo"),
  falcon: card("Falcon ERP"),
});
