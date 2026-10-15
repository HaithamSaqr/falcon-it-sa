/**
 * Reads Odoo's regional Standard plan price (billed yearly, the regular price
 * Odoo labels `prices['yearly_standard']`, not the 12-month first-order
 * discount shown beside it) from the odoo.com/pricing HTML. Odoo prices by the
 * requester's IP, so the page is fetched through a proxy in Egypt; the page
 * itself says which country it saw (`geoip_country_code`). Pure, no I/O.
 */
export interface OdooRegionalPrice {
  country: string;
  /** "US$", "E£", ... as printed by Odoo. */
  currency: string;
  amount: string;
}

const COUNTRY_RE = /"geoip_country_code":\s*"([A-Z]{2})"/;
const STANDARD_YEARLY_RE =
  /data-oe-expression="prices\[(?:&#39;|')yearly_standard(?:&#39;|')\]"[^>]*>([^<]*)<span class="oe_currency_value">([\d.,]+)<\/span>/;

export function parseOdooStandardYearly(html: string): OdooRegionalPrice | null {
  const country = COUNTRY_RE.exec(html)?.[1] ?? "";
  const m = STANDARD_YEARLY_RE.exec(html);
  if (!country || !m) return null;
  const currency = m[1].replace(/&nbsp;| |\s|�/g, "").trim();
  const amount = m[2].replace(/,/g, "");
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(amount)) return null;
  return { country, currency, amount };
}

/** Only an Egypt page priced in US dollars is usable as the Odoo USD price. */
export function usableEgyptUsdPrice(p: OdooRegionalPrice | null): string | null {
  return p && p.country === "EG" && p.currency === "US$" ? p.amount : null;
}
