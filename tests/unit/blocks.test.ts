import { describe, expect, it } from "vitest";
import { pickBi, biSchema, biRequiredSchema, isBiSchema } from "@/lib/blocks/bi";
import {
  linkSchema,
  optionalLinkSchema,
  imageSchema,
  iconSchema,
  roleIdSchema,
  fieldKind,
} from "@/lib/blocks/fields";
import { BLOCKS, parseBlock } from "@/lib/blocks/registry";
import { BLOCK_TYPES } from "@/lib/blocks/types";
import { validFixtures, rejections, clone } from "./fixtures/blocks";

const bi = (en: string, ar = "") => ({ en, ar });

const validHero = {
  title: bi("One ERP for your whole company.", "نظام واحد لشركتك كلها."),
  subtitle: bi("Accounting, inventory and sales in one system.", ""),
  primaryCta: { label: bi("Book a demo", "احجز عرضًا تجريبيًا"), href: "/demo" },
  secondaryCta: { label: bi("Talk on WhatsApp"), href: "https://wa.me/966500000000" },
  sectorsLabel: bi("See it for", "شاهده لقطاع"),
  card: { image: "/images/v2/hero-laptop.jpg", alt: bi("Laptop"), caption: bi("Falcon ERP") },
  sectorPills: [
    {
      label: bi("Real estate", "العقارات"),
      subtitle: bi("For developers and brokers."),
      image: "/api/uploads/re.jpg",
      alt: bi(""),
      caption: bi("Units and instalments"),
      href: "/sectors/real-estate",
    },
  ],
};

const roles = [
  { id: "dev", label: bi("Developer", "مطوّر") },
  { id: "con", label: bi("Contractor", "مقاول") },
];

const validLifecycle = {
  heading: bi("From land to keys, one number."),
  intro: bi(""),
  yourRoleLabel: bi("Your role"),
  roles,
  stages: [
    {
      title: bi("Land and feasibility"),
      description: bi("Know before the first riyal."),
      modules: bi("Assets, budgets"),
      roles: ["dev"],
    },
    {
      title: bi("Execution"),
      description: bi("Every certificate against work done."),
      modules: bi("Certificates, stores"),
      roles: ["dev", "con"],
    },
  ],
  summary: {
    dev: { headline: bi("Every morning: spent, sold, collected."), points: [bi("Cost per unit")] },
  },
};

describe("pickBi", () => {
  it("returns the locale value", () => {
    expect(pickBi({ en: "A", ar: "ب" }, "ar")).toBe("ب");
    expect(pickBi({ en: "A", ar: "ب" }, "en")).toBe("A");
  });
  it("falls back to the other locale when empty", () => {
    expect(pickBi({ en: "A", ar: "" }, "ar")).toBe("A");
    expect(pickBi({ en: "", ar: "ب" }, "en")).toBe("ب");
  });
  it("returns an empty string when both are empty or missing", () => {
    expect(pickBi({ en: "", ar: "" }, "en")).toBe("");
    expect(pickBi(undefined, "ar")).toBe("");
  });
});

describe("shared fields", () => {
  it("biSchema allows empty values but caps length at 2000", () => {
    expect(biSchema.safeParse(bi("", "")).success).toBe(true);
    expect(biSchema.safeParse(bi("x".repeat(2000))).success).toBe(true);
    expect(biSchema.safeParse(bi("x".repeat(2001))).success).toBe(false);
    expect(biSchema.safeParse({ en: "only en" }).success).toBe(false);
  });
  it("biRequiredSchema needs one non-blank side", () => {
    expect(biRequiredSchema.safeParse(bi("", "")).success).toBe(false);
    expect(biRequiredSchema.safeParse(bi("  ", "")).success).toBe(false);
    expect(biRequiredSchema.safeParse(bi("", "ب")).success).toBe(true);
  });
  it("links accept relative paths and https only", () => {
    for (const ok of ["/demo", "/demo?sector=real-estate&role=dev", "/ar/sectors", "https://wa.me/966500000000"]) {
      expect(linkSchema.safeParse(ok).success, ok).toBe(true);
    }
    for (const bad of [
      "javascript:alert(1)",
      " javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,x",
      "http://example.com",
      "//evil.example.com",
      "/\\evil.example.com",
      "mailto:a@b.co",
      "demo",
      "",
      "/de mo",
    ]) {
      expect(linkSchema.safeParse(bad).success, bad).toBe(false);
    }
    expect(optionalLinkSchema.safeParse("").success).toBe(true);
    expect(optionalLinkSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });
  it("images accept /images/, /api/uploads/ and https only (or empty)", () => {
    for (const ok of ["", "/images/v2/a.jpg", "/api/uploads/x.png", "https://cdn.example.com/a.png"]) {
      expect(imageSchema.safeParse(ok).success, ok).toBe(true);
    }
    for (const bad of [
      "javascript:alert(1)",
      "/other/a.jpg",
      "images/a.jpg",
      "/images/../secret",
      "http://x.com/a.png",
      "data:image/png;base64,AA",
    ]) {
      expect(imageSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
  it("icons are identifier strings", () => {
    expect(iconSchema.safeParse("Calculator").success).toBe(true);
    expect(iconSchema.safeParse("").success).toBe(false);
    expect(iconSchema.safeParse("two words").success).toBe(false);
    expect(iconSchema.safeParse("<svg>").success).toBe(false);
  });
  it("role ids are short lowercase slugs", () => {
    expect(roleIdSchema.safeParse("dev").success).toBe(true);
    expect(roleIdSchema.safeParse("Dev").success).toBe(false);
    expect(roleIdSchema.safeParse("").success).toBe(false);
    expect(roleIdSchema.safeParse("x".repeat(30)).success).toBe(false);
  });
  it("fieldKind lets the admin form recognise special fields", () => {
    expect(fieldKind(biSchema)).toBe("bi");
    expect(fieldKind(biRequiredSchema)).toBe("bi");
    expect(fieldKind(linkSchema)).toBe("link");
    expect(fieldKind(optionalLinkSchema)).toBe("link");
    expect(fieldKind(imageSchema)).toBe("image");
    expect(fieldKind(iconSchema)).toBe("icon");
    expect(fieldKind(roleIdSchema)).toBe("roleId");
    expect(isBiSchema(biSchema)).toBe(true);
  });
});

describe("parseBlock", () => {
  it("accepts a valid hero", () => {
    const r = parseBlock("hero", validHero);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.block.type).toBe("hero");
  });
  it("rejects a hero whose title is a plain string and names the field", () => {
    const r = parseBlock("hero", { ...validHero, title: "x" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("title");
  });
  it("rejects a hero whose title is blank in both locales", () => {
    const r = parseBlock("hero", { ...validHero, title: bi("", "") });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("title");
  });
  it("rejects unknown block types and non-object content", () => {
    expect(parseBlock("nope", {}).ok).toBe(false);
    expect(parseBlock("hero", null).ok).toBe(false);
    expect(parseBlock("hero", "x").ok).toBe(false);
    expect(parseBlock("__proto__", {}).ok).toBe(false);
  });
  it("rejects a javascript: link anywhere in the content with its path", () => {
    const r = parseBlock("hero", {
      ...validHero,
      primaryCta: { ...validHero.primaryCta, href: "javascript:alert(1)" },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("primaryCta.href");
  });
  it("rejects a bad image path", () => {
    const r = parseBlock("hero", { ...validHero, card: { ...validHero.card, image: "javascript:alert(1)" } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("card.image");
  });
  it("rejects a secondary CTA that has a label but no link", () => {
    const r = parseBlock("hero", { ...validHero, secondaryCta: { label: bi("Talk"), href: "" } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("secondaryCta");
  });
  it("fills block metadata when given", () => {
    const r = parseBlock("hero", validHero, { id: "b1", page: "home", sortOrder: 3, enabled: false });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.block).toMatchObject({ id: "b1", page: "home", type: "hero", sortOrder: 3, enabled: false });
    }
  });
});

describe("role-aware blocks", () => {
  it("accepts a valid lifecycle", () => {
    const r = parseBlock("lifecycle", validLifecycle);
    expect(r.ok, r.ok ? "" : r.error).toBe(true);
  });
  it("fails when a stage lists a role id missing from roles", () => {
    const bad = {
      ...validLifecycle,
      stages: [{ ...validLifecycle.stages[0], roles: ["dev", "ghost"] }],
    };
    const r = parseBlock("lifecycle", bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("stages.0.roles.1");
      expect(r.error).toContain("ghost");
    }
  });
  it("fails when summary is keyed by an undeclared role", () => {
    const r = parseBlock("lifecycle", {
      ...validLifecycle,
      summary: { ghost: { headline: bi("x"), points: [] } },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("summary.ghost");
  });
  it("fails on duplicate role ids", () => {
    const r = parseBlock("lifecycle", { ...validLifecycle, roles: [roles[0], roles[0]] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("roles.1");
  });
  it("fails on a malformed role id key", () => {
    const r = parseBlock("lifecycle", {
      ...validLifecycle,
      summary: { "Not A Slug": { headline: bi("x"), points: [] } },
    });
    expect(r.ok).toBe(false);
  });
  it("sector_hero needs a promise for every declared role", () => {
    const base = {
      roles,
      rolePrompt: bi("I am"),
      promise: {
        dev: { title: bi("Know the profit of every unit."), subtitle: bi("") },
        con: { title: bi("Certificates on time."), subtitle: bi("") },
      },
      photo: "/images/v2/real-estate.jpg",
      photoAlt: bi(""),
      trustLine: bi(""),
      primaryCta: { label: bi("Book a demo"), href: "/demo" },
      secondaryCta: { label: bi(""), href: "" },
    };
    const ok = parseBlock("sector_hero", base);
    expect(ok.ok, ok.ok ? "" : ok.error).toBe(true);
    const missing = parseBlock("sector_hero", { ...base, promise: { dev: base.promise.dev } });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error).toContain("promise.con");
    const orphan = parseBlock("sector_hero", { ...base, promise: { ...base.promise, ghost: base.promise.dev } });
    expect(orphan.ok).toBe(false);
    if (!orphan.ok) expect(orphan.error).toContain("promise.ghost");
  });
  it("role_pains rejects pains keyed by an undeclared role", () => {
    const r = parseBlock("role_pains", {
      heading: bi("Sound familiar?"),
      intro: bi(""),
      roles,
      pains: { ghost: { headline: bi("x"), items: [] } },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("pains.ghost");
  });
});

describe("registry", () => {
  it("has one entry per block type", () => {
    expect(Object.keys(BLOCKS).sort()).toEqual([...BLOCK_TYPES].sort());
    expect(BLOCK_TYPES).toHaveLength(18);
  });
  it.each([...BLOCK_TYPES])("%s: defaults() parse, have a label, and return fresh objects", (type) => {
    const entry = BLOCKS[type];
    const content = entry.defaults();
    const r = parseBlock(type, content);
    expect(r.ok, r.ok ? "" : r.error).toBe(true);
    expect(pickBi(entry.label, "en")).not.toBe("");
    expect(pickBi(entry.label, "ar")).not.toBe("");
    expect(entry.defaults()).not.toBe(content);
    expect(entry.defaults()).toEqual(content);
  });
  it("defaults contain no dash punctuation", () => {
    for (const type of BLOCK_TYPES) {
      expect(JSON.stringify(BLOCKS[type].defaults())).not.toMatch(/[–—]/);
    }
  });
  it("every block schema is a plain object schema (walkable)", () => {
    for (const type of BLOCK_TYPES) {
      const s = BLOCKS[type].schema as unknown as { def: { type: string }; shape?: object };
      expect(s.def.type).toBe("object");
      expect(s.shape).toBeTruthy();
    }
  });
});

describe("populated fixtures", () => {
  it.each([...BLOCK_TYPES])("%s: populated fixture parses and round-trips", (type) => {
    const r = parseBlock(type, clone(validFixtures[type]));
    expect(r.ok, r.ok ? "" : r.error).toBe(true);
    if (r.ok) expect(r.block.content).toEqual(validFixtures[type]);
  });
  it("every block type has at least one rejection case", () => {
    for (const type of BLOCK_TYPES) {
      expect(rejections.some((x) => x.type === type), type).toBe(true);
    }
  });
  it.each(rejections.map((x) => [x.type, x.name, x] as const))("%s rejects: %s", (_t, _n, rej) => {
    const r = parseBlock(rej.type, rej.make(clone(validFixtures[rej.type])));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(rej.path);
  });
});

describe("required CTA labels", () => {
  it("rejects a blank primary CTA label in hero, sector_hero, booking and sector_grid", () => {
    const blank = { en: "", ar: "" };
    const cases: [string, unknown][] = [
      ["hero", { ...validFixtures.hero, primaryCta: { ...validFixtures.hero.primaryCta, label: blank } }],
      ["sector_hero", { ...validFixtures.sector_hero, primaryCta: { ...validFixtures.sector_hero.primaryCta, label: blank } }],
      ["booking", { ...validFixtures.booking, cta: { ...validFixtures.booking.cta, label: blank } }],
      ["sector_grid", { ...validFixtures.sector_grid, otherCard: { ...validFixtures.sector_grid.otherCard, ctaLabel: blank } }],
    ];
    for (const [type, content] of cases) {
      expect(parseBlock(type, content).ok, type).toBe(false);
    }
  });
  it("still lets the optional secondary CTA be empty", () => {
    expect(parseBlock("hero", { ...validFixtures.hero, secondaryCta: { label: bi(""), href: "" } }).ok).toBe(true);
  });
});

describe("role ids that collide with Object.prototype names", () => {
  const protoRoles = [{ id: "constructor", label: bi("Owner") }];
  const heroBase = clone(validFixtures.sector_hero);
  it("sector_hero fails when the promise for role 'constructor' is missing", () => {
    const r = parseBlock("sector_hero", { ...heroBase, roles: protoRoles, promise: {} });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("promise.constructor");
  });
  it("sector_hero accepts an own 'constructor' promise", () => {
    const promise = JSON.parse('{"constructor":{"title":{"en":"Hi","ar":""},"subtitle":{"en":"","ar":""}}}');
    const r = parseBlock("sector_hero", { ...heroBase, roles: protoRoles, promise });
    expect(r.ok, r.ok ? "" : r.error).toBe(true);
  });
});
