import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The locale-aware Link needs a request context; a plain anchor stands in for it.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a data-locale-link="" href={href} {...rest}>
      {children}
    </a>
  ),
}));

let mockLocale = "en";
vi.mock("next-intl/server", () => ({ getLocale: async () => mockLocale }));

import BiText, { biText } from "@/components/v2/ui/bi-text";
import Bezel from "@/components/v2/ui/bezel";
import Button from "@/components/v2/ui/button";
import Container from "@/components/v2/ui/container";
import Icon, { isDirectionalIcon } from "@/components/v2/ui/icon";
import Section from "@/components/v2/ui/section";

const html = (node: React.ReactNode) => renderToStaticMarkup(<>{node}</>);

describe("Icon", () => {
  it("renders a Phosphor Light svg for a known name", () => {
    const out = html(<Icon name="Buildings" />);
    expect(out).toMatch(/^<svg/);
    expect(out).toContain('aria-hidden="true"');
    // Light weight of ArrowUpRight uses the 6px stroke path from the mockup.
    expect(html(<Icon name="ArrowUpRight" />)).toContain("M198,64V168a6,6,0,0,1-12,0V78.48");
  });

  it("renders nothing for unknown, empty or hostile names and never throws", () => {
    for (const name of ["", "NotARealIcon", "__proto__", "constructor", "IconContext", "default", "  ", "x y z"]) {
      expect(html(<Icon name={name} />)).toBe("");
    }
    expect(html(<Icon name={undefined as unknown as string} />)).toBe("");
  });

  it("accepts kebab-case and the Icon suffix", () => {
    expect(html(<Icon name="arrow-up-right" />)).toMatch(/^<svg/);
    expect(html(<Icon name="BuildingsIcon" />)).toMatch(/^<svg/);
  });

  it("flips directional icons with a CSS rtl class and leaves others alone", () => {
    expect(html(<Icon name="ArrowUpRight" />)).toContain("rtl:-scale-x-100");
    expect(html(<Icon name="CaretRight" />)).toContain("rtl:-scale-x-100");
    expect(html(<Icon name="Buildings" />)).not.toContain("rtl:-scale-x-100");
    expect(html(<Icon name="ArrowClockwise" />)).not.toContain("rtl:-scale-x-100");
    expect(isDirectionalIcon("ArrowsInSimple")).toBe(false);
  });

  it("exposes an accessible name when a label is given", () => {
    const out = html(<Icon name="Buildings" label="Buildings" />);
    expect(out).toContain('aria-label="Buildings"');
    expect(out).not.toContain("aria-hidden");
  });
});

describe("BiText", () => {
  it("renders the request locale value", async () => {
    mockLocale = "ar";
    expect(html(await BiText({ value: { en: "Hello", ar: "مرحبا" } }))).toBe("مرحبا");
    mockLocale = "en";
    expect(html(await BiText({ value: { en: "Hello", ar: "مرحبا" } }))).toBe("Hello");
  });

  it("falls back to the other language when the locale side is empty", async () => {
    mockLocale = "ar";
    expect(html(await BiText({ value: { en: "Hello", ar: "  " } }))).toBe("Hello");
  });

  it("renders nothing when both sides are empty or the value is missing", async () => {
    mockLocale = "en";
    expect(await BiText({ value: { en: "", ar: "" } })).toBeNull();
    expect(await BiText({ value: undefined })).toBeNull();
  });

  it("wraps the text when an element is requested", async () => {
    mockLocale = "en";
    const out = html(await BiText({ value: { en: "Hi", ar: "" }, as: "h2", className: "x" }));
    expect(out).toBe('<h2 class="x">Hi</h2>');
  });

  it("biText is a plain locale helper", () => {
    expect(biText({ en: "a", ar: "ب" }, "ar")).toBe("ب");
    expect(biText({ en: "a", ar: "" }, "ar")).toBe("a");
    expect(biText(null, "en")).toBe("");
  });
});

describe("Button", () => {
  it("renders internal hrefs through the locale-aware Link", () => {
    const out = html(<Button href="/demo">Book a demo</Button>);
    expect(out).toContain("data-locale-link");
    expect(out).toContain('href="/demo"');
    expect(out).toContain("Book a demo");
  });

  it("renders https hrefs as a plain anchor that opens safely", () => {
    const out = html(<Button href="https://odoo.com">Odoo</Button>);
    expect(out).not.toContain("data-locale-link");
    expect(out).toContain('href="https://odoo.com"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("renders anchors, mailto and protocol-relative hrefs as plain anchors", () => {
    for (const href of ["#book", "mailto:a@b.sa", "tel:+966", "//evil.test/x"]) {
      expect(html(<Button href={href}>Go</Button>)).not.toContain("data-locale-link");
    }
  });

  it("primary has the nested arrow circle by default; ghost and link do not", () => {
    const primary = html(<Button href="/demo">Book</Button>);
    expect(primary).toContain("bg-brand");
    expect(primary).toContain("rounded-full bg-white/15");
    expect(primary).toContain("<svg");
    expect(html(<Button href="/demo" variant="ghost">Book</Button>)).not.toContain("<svg");
    expect(html(<Button href="/demo" variant="link">Book</Button>)).not.toContain("<svg");
  });

  it("withArrow toggles the arrow on every variant", () => {
    expect(html(<Button href="/demo" withArrow={false}>Book</Button>)).not.toContain("<svg");
    expect(html(<Button href="/demo" variant="link" withArrow>Book</Button>)).toContain("<svg");
    expect(html(<Button href="/demo" variant="ghost" withArrow>Book</Button>)).toContain("<svg");
  });

  it("never renders with an empty label", () => {
    expect(html(<Button href="/demo">{""}</Button>)).toBe("");
    expect(html(<Button href="/demo">{"   "}</Button>)).toBe("");
    expect(html(<Button href="/demo">{null}</Button>)).toBe("");
    expect(html(<Button href="/demo" />)).toBe("");
    expect(html(<Button>{undefined}</Button>)).toBe("");
  });

  it("renders a native button when there is no href", () => {
    const out = html(<Button type="submit">Send</Button>);
    expect(out).toMatch(/^<button/);
    expect(out).toContain('type="submit"');
  });
});

describe("Bezel, Section and Container", () => {
  it("Bezel uses an 8px shell and an inner radius 7px smaller", () => {
    const big = html(<Bezel>x</Bezel>);
    expect(big).toContain("p-2");
    expect(big).toContain("rounded-[32px]");
    expect(big).toContain("rounded-[25px]");
    const small = html(<Bezel radius={26}>x</Bezel>);
    expect(small).toContain("rounded-[26px]");
    expect(small).toContain("rounded-[19px]");
  });

  it("Section maps tone to a background and carries the anchor id", () => {
    expect(html(<Section id="book" tone="brand">x</Section>)).toMatch(/id="book"[^>]*bg-brand|bg-brand[^>]*id="book"/);
    expect(html(<Section>x</Section>)).toContain("bg-page");
    expect(html(<Section tone="surface">x</Section>)).toContain("bg-surface");
  });

  it("Container caps at 1440 with 20px mobile and 120px desktop padding", () => {
    const out = html(<Container>x</Container>);
    expect(out).toContain("max-w-[1440px]");
    expect(out).toContain("px-5");
    expect(out).toContain("xl:px-[120px]");
  });
});
