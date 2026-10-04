/**
 * Task 11: sector and role attribution on demo leads.
 *
 * The attribution suite needs no database and always runs. The route suite
 * runs only under `npm run test:db` (PG* from .env.test) against a local
 * `_test` database, inside its own scratch schema (PGOPTIONS search_path),
 * dropped before and after, so the e2e `public` schema is never touched.
 *
 * Nothing in the route is stubbed: only the install check is pointed at the
 * test database (the app normally reads it from data/db-config.json). Odoo,
 * the calendar and email are switched off the way production switches them
 * off (integrations row, no RESEND_API_KEY / ODOO_* env), and every outbound
 * HTTP path (fetch, http.request, https.request) is watched.
 */
import http from "node:http";
import https from "node:https";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";

const SCHEMA = "t11_demo_lead";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const canUseDb =
  !!process.env.PGDATABASE &&
  process.env.PGDATABASE.endsWith("_test") &&
  LOCAL_HOSTS.has(process.env.PGHOST ?? "");

// Before any app module loads: no Odoo or Resend credentials in the env, and
// every pool this process opens works inside the scratch schema.
vi.hoisted(() => {
  for (const k of ["ODOO_URL", "ODOO_DB", "ODOO_USERNAME", "ODOO_PASSWORD", "ODOO_API_KEY", "RESEND_API_KEY"]) {
    delete process.env[k];
  }
  process.env.PGOPTIONS = "-c search_path=t11_demo_lead";
});

vi.mock("@/lib/db/config", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/db/config")>();
  const conn = () => ({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE ?? "",
    user: process.env.PGUSER ?? "",
    password: process.env.PGPASSWORD ?? "",
    ssl: false,
  });
  return {
    ...orig,
    isInstalledSync: () => true,
    isInstalled: async () => true,
    getConnection: async () => conn(),
    readDbConfig: async () => ({ installed: true, db: conn() }),
  };
});

import {
  DEMO_SECTOR_OPTIONS,
  industryForSector,
  parseLeadAttribution,
} from "@/lib/lead-attribution";
import { V2_SECTORS } from "@/lib/blocks/seed/sectors";
import {
  FORM_MESSAGES_EN,
  contactFormSchema,
  demoFormSchema,
  makeContactFormSchema,
  makeDemoFormSchema,
} from "@/lib/validations";
import enMessages from "../../messages/en.json";
import arMessages from "../../messages/ar.json";

describe("parseLeadAttribution", () => {
  it("keeps a known sector slug and a short role slug", () => {
    expect(parseLeadAttribution({ sector: "retail", role: "owner" })).toEqual({ sector: "retail", role: "owner" });
    expect(parseLeadAttribution({ sector: "professional-services", role: "pm" })).toEqual({
      sector: "professional-services",
      role: "pm",
    });
  });

  it("accepts every v2 sector", () => {
    for (const s of V2_SECTORS) expect(parseLeadAttribution({ sector: s.slug })).toEqual({ sector: s.slug });
  });

  it("drops unknown sectors, retired slugs and anything that is not a short lowercase slug", () => {
    expect(parseLeadAttribution({ sector: "RetailBasic", role: "owner" })).toEqual({ role: "owner" });
    expect(parseLeadAttribution({ sector: "Retail" })).toEqual({});
    expect(parseLeadAttribution({ sector: "healthcare" })).toEqual({});
    expect(parseLeadAttribution({ sector: "__proto__" })).toEqual({});
    expect(parseLeadAttribution({ role: "Owner" })).toEqual({});
    expect(parseLeadAttribution({ role: "owner; drop table leads" })).toEqual({});
    expect(parseLeadAttribution({ role: "<script>" })).toEqual({});
    expect(parseLeadAttribution({ role: "a".repeat(25) })).toEqual({});
    expect(parseLeadAttribution({ role: "a".repeat(24) })).toEqual({ role: "a".repeat(24) });
  });

  it("treats empty, missing and non-string values as absent", () => {
    expect(parseLeadAttribution({ sector: "", role: "" })).toEqual({});
    expect(parseLeadAttribution({ sector: "  retail  " })).toEqual({ sector: "retail" });
    expect(parseLeadAttribution({ sector: ["retail"], role: { id: "owner" } })).toEqual({});
    expect(parseLeadAttribution({ sector: 7, role: true })).toEqual({});
    expect(parseLeadAttribution(null)).toEqual({});
    expect(parseLeadAttribution("sector=retail")).toEqual({});
    expect(parseLeadAttribution(undefined)).toEqual({});
  });
});

describe("demo form sector options", () => {
  it("offers the seven v2 sectors (in order), the other pre-v2 industries, then Other", () => {
    expect(DEMO_SECTOR_OPTIONS.map((o) => o.sector)).toEqual([...V2_SECTORS.map((s) => s.slug), null, null, null, null]);
    expect(DEMO_SECTOR_OPTIONS.slice(V2_SECTORS.length).map((o) => o.value)).toEqual([
      "indConstruction",
      "indHealthcare",
      "indEducation",
      "indOther",
    ]);
    expect(DEMO_SECTOR_OPTIONS.at(-1)?.label).toEqual({ en: "Other", ar: "أخرى" });
    // Values are unique form values; labels come from the sector names.
    const values = DEMO_SECTOR_OPTIONS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
    for (const s of V2_SECTORS) {
      const o = DEMO_SECTOR_OPTIONS.find((x) => x.sector === s.slug)!;
      expect(o.label).toEqual(s.name);
    }
  });

  it("maps a v2 sector slug to its form value and anything else to none", () => {
    expect(industryForSector("retail")).toBe("indRetail");
    expect(industryForSector("real-estate")).toBe("indRealEstate");
    expect(industryForSector("trading")).toBe("indTrading");
    expect(industryForSector("hospitality")).toBe("indHospitality");
    expect(industryForSector("manufacturing")).toBe("indManufacturing");
    expect(industryForSector("logistics")).toBe("indLogistics");
    expect(industryForSector("professional-services")).toBe("indServices");
    for (const bad of ["", "RetailBasic", "healthcare", undefined, null]) expect(industryForSector(bad)).toBe("");
  });

  it("keeps every pre-v2 form value so Odoo, the admin and old leads read the same", () => {
    const PRE_V2 = [
      "indRetail",
      "indManufacturing",
      "indConstruction",
      "indRealEstate",
      "indHospitality",
      "indHealthcare",
      "indEducation",
      "indLogistics",
      "indTrading",
      "indOther",
    ];
    for (const v of PRE_V2) {
      expect(DEMO_SECTOR_OPTIONS.some((o) => o.value === v), v).toBe(true);
    }
  });
});

describe("form validation messages", () => {
  const issues = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
    Object.fromEntries((r.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));

  it("keeps the API schemas' English messages (server contract unchanged)", () => {
    const demo = issues(
      demoFormSchema.safeParse({ fullName: "", email: "a@gmail.com", phone: "", company: "", jobTitle: "", country: "", companySize: "", industry: "", consent: false }),
    );
    expect(demo).toEqual({
      fullName: "Name is required",
      email: "Please use a business email",
      phone: "Phone number is required",
      company: "Company name is required",
      jobTitle: "Job title is required",
      country: "Country is required",
      companySize: "Company size is required",
      industry: "Industry is required",
      consent: "You must agree to the privacy policy",
    });
    expect(issues(contactFormSchema.safeParse({ name: "", email: "x", subject: "", message: "short" }))).toEqual({
      name: "Name is required",
      email: "Invalid email address",
      subject: "Subject is required",
      message: "Message must be at least 10 characters",
    });
  });

  it("ships the same keys in English (equal to the API messages) and Arabic", () => {
    expect(enMessages.validation).toEqual(FORM_MESSAGES_EN);
    expect(Object.keys(arMessages.validation).sort()).toEqual(Object.keys(FORM_MESSAGES_EN).sort());
    for (const v of Object.values(arMessages.validation)) expect(v).toMatch(/[؀-ۿ]/);
  });

  it("builds the same rules with Arabic wording for the /ar forms", () => {
    const m = arMessages.validation as typeof FORM_MESSAGES_EN;
    const demo = issues(makeDemoFormSchema(m).safeParse({ fullName: "", email: "x@company.sa", phone: "12345678", company: "Co", jobTitle: "jobCeo", country: "countrySaudi", companySize: "1-10", industry: "indRetail", consent: true }));
    expect(demo).toEqual({ fullName: "الاسم مطلوب" });
    const contact = issues(makeContactFormSchema(m).safeParse({ name: "Ali", email: "bad", subject: "Hi", message: "long enough message" }));
    expect(contact).toEqual({ email: "البريد الإلكتروني غير صحيح" });
  });
});

describe.skipIf(!canUseDb)("POST /api/leads/demo with integrations off", () => {
  let pool: Pool;
  let POST: typeof import("@/app/api/leads/demo/route").POST;
  let NextRequestCtor: typeof import("next/server").NextRequest;

  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const httpSpy = vi.spyOn(http, "request");
  const httpsSpy = vi.spyOn(https, "request");
  const warnSpy = vi.spyOn(console, "warn");
  const logSpy = vi.spyOn(console, "log");

  const FORM = {
    fullName: "Test Lead",
    phone: "0500000000",
    company: "Attribution Test Co",
    jobTitle: "jobCeo",
    country: "countrySaudi",
    companySize: "11-50",
    industry: "indRetail",
    currentERP: "",
    message: "",
    consent: true,
    newsletter: false,
    // A slot is picked, so a disabled calendar is what keeps Odoo out of it.
    preferredDateTime: "2026-10-12T10:00:00",
  };

  async function post(body: Record<string, unknown>, ip: string) {
    const req = new NextRequestCtor("http://localhost:3100/api/leads/demo", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
        referer: "http://localhost:3100/demo?sector=retail&role=owner",
      },
    });
    return POST(req);
  }

  async function leadFor(email: string) {
    const r = await pool.query(`SELECT type, data FROM leads WHERE data->>'email' = $1`, [email]);
    return r.rows;
  }

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 2,
    });
    await pool.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await pool.query(`CREATE SCHEMA ${SCHEMA}`);

    const ds = await import("@/lib/data-store");
    // Fresh schema: the app migrates it on first use.
    const ig = await ds.getIntegrations();
    // Odoo has credentials but is switched off; calendar and email are off.
    await ds.updateIntegrations({
      ...ig,
      odoo: { ...ig.odoo, enabled: false, url: "https://odoo.invalid", db: "x", username: "x", apiKey: "secret" },
      calendar: { ...ig.calendar, enabled: false },
      email: { ...ig.email, enabled: false },
    });
    const after = await ds.getIntegrations();
    expect(after.odoo.enabled).toBe(false);
    expect(after.calendar.enabled).toBe(false);

    ({ POST } = await import("@/app/api/leads/demo/route"));
    ({ NextRequest: NextRequestCtor } = await import("next/server"));
  }, 60_000);

  afterAll(async () => {
    await pool?.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await pool?.end();
    const { resetPool } = await import("@/lib/db/pool");
    await resetPool();
    delete process.env.PGOPTIONS;
    vi.restoreAllMocks();
  });

  it("stores sector and role in the lead data and calls no outside service", async () => {
    fetchSpy.mockClear();
    httpSpy.mockClear();
    httpsSpy.mockClear();
    warnSpy.mockClear();
    logSpy.mockClear();

    const email = "lead-attribution@example.com";
    const res = await post({ ...FORM, email, sector: "retail", role: "owner" }, "10.11.0.1");
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const rows = await leadFor(email);
    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("demo");
    expect(rows[0].data.sector).toBe("retail");
    expect(rows[0].data.role).toBe("owner");
    // The other fields are stored as before.
    expect(rows[0].data).toMatchObject({
      fullName: FORM.fullName,
      email,
      company: FORM.company,
      industry: "indRetail",
      consent: true,
      locale: "en",
    });

    // Odoo switched off in settings is observable: the client skips the record.
    expect(warnSpy.mock.calls.some((c) => String(c[0]).includes("[Odoo] Not configured"))).toBe(true);
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes("[Email] Not configured"))).toBe(true);
    // And nothing left the process: no fetch, no raw http(s) request (XML-RPC).
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(httpSpy).not.toHaveBeenCalled();
    expect(httpsSpy).not.toHaveBeenCalled();
  });

  it("ignores an unknown sector and a malformed role but still stores the lead", async () => {
    fetchSpy.mockClear();
    const email = "lead-bad-attribution@example.com";
    const res = await post({ ...FORM, email, sector: "RetailBasic", role: "Owner'; DROP TABLE leads;--" }, "10.11.0.2");
    expect(res.status).toBe(200);
    const rows = await leadFor(email);
    expect(rows).toHaveLength(1);
    expect("sector" in rows[0].data).toBe(false);
    expect("role" in rows[0].data).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps working without attribution (old clients, direct /demo visits)", async () => {
    const email = "lead-no-attribution@example.com";
    const res = await post({ ...FORM, email }, "10.11.0.3");
    expect(res.status).toBe(200);
    const rows = await leadFor(email);
    expect(rows).toHaveLength(1);
    expect("sector" in rows[0].data).toBe(false);
    expect("role" in rows[0].data).toBe(false);
  });

  it("still rejects an invalid form with 422 and stores nothing", async () => {
    const email = "lead-invalid@example.com";
    const res = await post({ ...FORM, email, consent: false, sector: "retail" }, "10.11.0.4");
    expect(res.status).toBe(422);
    expect(await leadFor(email)).toHaveLength(0);
  });
});
