import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseOdooStandardYearly, usableEgyptUsdPrice } from "@/lib/odoo-pricing-parse";
import { isProxyUrl } from "@/lib/odoo-pricing";

// Trimmed copies of odoo.com/pricing as served on 2026-10-15 to an Egyptian and a German IP.
const fixture = (name: string) => readFileSync(path.join(__dirname, "..", "fixtures", name), "utf8");

describe("reading Odoo's regional Standard price", () => {
  it("takes the regular yearly Standard price from an Egypt page, not the first-year discount", () => {
    const p = parseOdooStandardYearly(fixture("odoo-pricing-eg.html"));
    expect(p).toEqual({ country: "EG", currency: "US$", amount: "8.95" });
    expect(usableEgyptUsdPrice(p)).toBe("8.95");
  });

  it("refuses a page Odoo served to another country", () => {
    const p = parseOdooStandardYearly(fixture("odoo-pricing-de.html"));
    expect(p?.country).toBe("DE");
    expect(p?.amount).toBe("24.90");
    expect(usableEgyptUsdPrice(p)).toBeNull();
  });

  it("returns null when the layout no longer has the price", () => {
    expect(parseOdooStandardYearly('<html>"geoip_country_code": "EG"</html>')).toBeNull();
    expect(parseOdooStandardYearly("")).toBeNull();
  });
});

describe("proxy URL", () => {
  it("needs an http(s) scheme, a host and a port", () => {
    expect(isProxyUrl("http://user:pass@eg.proxy.example:8000")).toBe(true);
    expect(isProxyUrl("https://eg.proxy.example:8443")).toBe(true);
    expect(isProxyUrl("eg.proxy.example:8000")).toBe(false);
    expect(isProxyUrl("http://eg.proxy.example")).toBe(false);
    expect(isProxyUrl("socks5://eg.proxy.example:1080")).toBe(false);
  });
});
