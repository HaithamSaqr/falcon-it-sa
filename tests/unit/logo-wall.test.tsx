import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import LogoWallBlock, { MARQUEE_MIN_LOGOS } from "@/components/v2/blocks/logo-wall";
import type { Placement, RenderContext } from "@/components/v2/blocks/context";
import { logoWallDefaults } from "@/lib/blocks/schemas/logo_wall";
import { V2_CLIENT_LOGOS } from "@/lib/blocks/seed/clients";
import { CLIENT_LOGOS, DEFAULT_LOGO_SIZE, clientLogoPath, clientLogoSize } from "@/lib/db/client-logos";
import { CLIENT_LOGO_SIZES } from "@/lib/db/client-logo-sizes";
import sharp from "sharp";

const place = (over: Partial<Placement> = {}): Placement => ({ tone: "page", first: false, afterHero: true, ownRoleSwitcher: false, ...over });

function ctx(locale: "en" | "ar", clients = V2_CLIENT_LOGOS): RenderContext {
  return { locale, demoUrl: "/demo", roleAware: false, clients, anchors: [], labels: {} as RenderContext["labels"] };
}

function render(locale: "en" | "ar", opts: { clients?: RenderContext["clients"]; limit?: number; place?: Partial<Placement> } = {}) {
  const content = { ...logoWallDefaults(), ...(opts.limit ? { limit: opts.limit } : {}) };
  return renderToStaticMarkup(<LogoWallBlock content={content} ctx={ctx(locale, opts.clients)} place={place(opts.place)} />);
}

/** The <ul> lists in rendered markup (they never nest here). */
const lists = (html: string): string[] => html.match(/<ul[^>]*>[^]*?<\/ul>/g) ?? [];
const alts = (html = ""): string[] => [...html.matchAll(/<img[^>]*?alt="([^"]*)"/g)].map((m) => m[1]);
const imgs = (html = ""): number => html.match(/<img /g)?.length ?? 0;

describe("bundled client logos", () => {
  it("are the full cleaned set", () => {
    expect(V2_CLIENT_LOGOS.length).toBe(CLIENT_LOGOS.length);
    expect(V2_CLIENT_LOGOS.length).toBeGreaterThanOrEqual(45);
    for (const l of V2_CLIENT_LOGOS) {
      expect(l.logo).toMatch(/^\/images\/v2\/clients\/[a-z0-9-]+\.png$/);
      expect(l.name.en).not.toBe("");
      expect(l.name.ar).not.toBe("");
    }
  });
});

describe("client logo sizes", () => {
  it("every clients logo has its real pixel size recorded", async () => {
    expect(Object.keys(CLIENT_LOGO_SIZES).sort()).toEqual(CLIENT_LOGOS.map((c) => c.slug).sort());
    for (const c of CLIENT_LOGOS) {
      const meta = await sharp(path.join(process.cwd(), "public", clientLogoPath(c.slug))).metadata();
      expect([meta.width, meta.height], c.slug).toEqual([...CLIENT_LOGO_SIZES[c.slug]]);
      expect(clientLogoSize(clientLogoPath(c.slug))).toEqual(CLIENT_LOGO_SIZES[c.slug]);
    }
  });

  it("falls back to the canvas box for logos it does not know (admin uploads)", () => {
    expect(clientLogoSize("/api/uploads/abc.png")).toEqual(DEFAULT_LOGO_SIZE);
    expect(clientLogoSize("/images/v2/clients/not-there.png")).toEqual(DEFAULT_LOGO_SIZE);
  });

  it("renders every strip and wall logo with its real width and height", () => {
    for (const out of [render("en"), render("en", { place: { first: true, afterHero: false }, limit: 60 })]) {
      const tags = out.match(/<img [^>]*>/g) ?? [];
      expect(tags.length).toBeGreaterThan(0);
      for (const tag of tags) {
        const src = decodeURIComponent(/url=([^&"]+)/.exec(tag)?.[1] ?? /src="([^"]+)"/.exec(tag)![1]);
        const [w, h] = clientLogoSize(src);
        expect(tag, src).toContain(`width="${w}"`);
        expect(tag, src).toContain(`height="${h}"`);
      }
    }
  });
});

describe("logo strip (marquee)", () => {
  it("shows every logo once for readers and once more, hidden, for the seamless loop", () => {
    const out = render("en");
    expect(out).toContain("data-marquee=\"\"");
    expect(out).toMatch(/data-marquee=""[^>]*tabindex="0"|tabindex="0"[^>]*data-marquee=""/);
    const [first, copy, ...rest] = lists(out);
    expect(rest).toEqual([]);
    expect(first).toBeDefined();
    expect(first).not.toContain("aria-hidden");
    expect(copy).toMatch(/^<ul[^>]*aria-hidden="true"/);
    expect(alts(first)).toEqual(V2_CLIENT_LOGOS.map((l) => l.name.en));
    expect(imgs(copy)).toBe(V2_CLIENT_LOGOS.length);
    expect(alts(copy).every((a) => a === "")).toBe(true);
  });

  it("uses the Arabic names on Arabic pages", () => {
    const [first] = lists(render("ar"));
    expect(alts(first)).toEqual(V2_CLIENT_LOGOS.map((l) => l.name.ar));
  });

  it("slows the loop with the number of logos", () => {
    expect(render("en")).toContain(`--marquee-duration:${V2_CLIENT_LOGOS.length * 4}s`);
  });

  it("keeps the block limit", () => {
    const [first, copy] = lists(render("en", { limit: 20 }));
    expect(imgs(first)).toBe(20);
    expect(imgs(copy)).toBe(20);
  });

  it("stays a still, wrapped row when there are too few logos to loop", () => {
    const out = render("en", { clients: V2_CLIENT_LOGOS.slice(0, MARQUEE_MIN_LOGOS - 1) });
    expect(out).not.toContain("data-marquee");
    expect(out).not.toContain("aria-hidden");
    expect(imgs(out)).toBe(MARQUEE_MIN_LOGOS - 1);
    expect(out).toContain("flex-wrap");
  });

  it("shows logos in full colour, sized by height", () => {
    const img = render("en").match(/<img[^>]*>/)![0];
    expect(img).toMatch(/class="v2-logo h-8 w-auto[^"]*lg:h-10/);
  });
});

describe("clients page wall", () => {
  it("is a grid of every logo with an H1 and no marquee", () => {
    const out = render("en", { place: { first: true, afterHero: false }, limit: 60 });
    expect(out).toMatch(new RegExp(`<h1[^>]*>${logoWallDefaults().heading.en}</h1>`));
    expect(out).not.toContain("data-marquee");
    expect(imgs(out)).toBe(V2_CLIENT_LOGOS.length);
    expect(out).toContain("md:h-16");
  });
});

describe("logo CSS", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");

  it("no longer greys or fades the logos", () => {
    const rule = css.match(/\.v2-logo\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule).not.toMatch(/grayscale|opacity/);
  });

  it("drifts the other way on Arabic pages", () => {
    expect(css).toMatch(/\[dir="rtl"\]\s*\.v2-marquee-track\s*\{\s*animation-name:\s*v2-marquee-rtl;/);
    expect(css).toMatch(/@keyframes v2-marquee\s*\{\s*to\s*\{\s*transform:\s*translateX\(-50%\)/);
    expect(css).toMatch(/@keyframes v2-marquee-rtl\s*\{\s*to\s*\{\s*transform:\s*translateX\(50%\)/);
  });

  it("pauses on hover and focus, and stands still under reduced motion", () => {
    expect(css).toMatch(/\.v2-marquee:hover \.v2-marquee-track,\s*\.v2-marquee:focus-within \.v2-marquee-track\s*\{\s*animation-play-state:\s*paused/);
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.v2-marquee-track\s*\{\s*animation:\s*none !important;/);
    expect(reduced).toMatch(/\.v2-marquee \[data-marquee-copy\]\s*\{\s*display:\s*none;/);
    expect(reduced).toMatch(/flex-wrap:\s*wrap/);
  });
});
