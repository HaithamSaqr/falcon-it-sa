/**
 * Task 13: the browser only receives the message namespaces client components
 * read, and none of that text breaks the copy rules (no em or en dash, no
 * Egypt, no "undefined").
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";
import { CLIENT_NAMESPACES, clientMessages } from "@/i18n/client-messages";
import { mentionsEgypt } from "@/lib/public-chrome";

const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

describe("clientMessages", () => {
  it("keeps only the namespaces client components use", () => {
    expect([...CLIENT_NAMESPACES].sort()).toEqual(["chrome", "common", "contact", "demo", "validation"]);
    const picked = clientMessages(en);
    expect(Object.keys(picked).sort()).toEqual([...CLIENT_NAMESPACES].sort());
    expect(picked.demo).toBe(en.demo);
    expect(picked).not.toHaveProperty("desktopPage");
    expect(picked).not.toHaveProperty("blocks");
  });

  it("tolerates a missing namespace", () => {
    expect(clientMessages({ chrome: { a: "b" } })).toEqual({ chrome: { a: "b" } });
  });

  it.each([
    ["en", en],
    ["ar", ar],
  ] as const)("%s client text follows the copy rules", (_, messages) => {
    for (const s of strings(clientMessages(messages))) {
      expect(s, s).not.toMatch(/[–—]/);
      expect(s, s).not.toMatch(/undefined|NaN|\[object/);
      expect(mentionsEgypt(s), s).toBe(false);
    }
  });
});

/** Every .ts/.tsx file under src that starts with the "use client" directive. */
function clientFiles(dir = path.join(process.cwd(), "src")): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return clientFiles(p);
    if (!/\.tsx?$/.test(e.name)) return [];
    return /^\s*["']use client["']/.test(fs.readFileSync(p, "utf8")) ? [p] : [];
  });
}

/** Namespaces a client file reads: useTranslations("ns.x") and, for useTranslations(), the first segment of t("ns.key"). */
function namespacesIn(source: string): string[] {
  const out = new Set<string>();
  for (const m of source.matchAll(/useTranslations\(\s*["'`]([\w.]+)["'`]\s*\)/g)) out.add(m[1].split(".")[0]);
  for (const m of source.matchAll(/(?:const|let)\s+(\w+)\s*=\s*useTranslations\(\s*\)/g)) {
    const fn = m[1];
    const call = new RegExp(String.raw`\b${fn}(?:\.(?:rich|raw|markup|has))?\(\s*["'` + "`" + String.raw`]([\w.]+)`, "g");
    for (const k of source.matchAll(call)) {
      out.add(k[1].split(".")[0]);
    }
  }
  return [...out];
}

describe("client components and CLIENT_NAMESPACES", () => {
  it("finds the client files that translate (sanity check of the scanner)", () => {
    const used = clientFiles().flatMap((f) => namespacesIn(fs.readFileSync(f, "utf8")));
    expect(new Set(used)).toEqual(new Set(["chrome", "common", "contact", "demo", "validation"]));
  });

  it("every namespace a client file reads is sent to the browser", () => {
    const missing: string[] = [];
    for (const file of clientFiles()) {
      for (const ns of namespacesIn(fs.readFileSync(file, "utf8"))) {
        if (!(CLIENT_NAMESPACES as readonly string[]).includes(ns)) missing.push(`${path.relative(process.cwd(), file)}: ${ns}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("the scanner reads both forms", () => {
    expect(namespacesIn(`const t = useTranslations("demo"); t("x");`)).toEqual(["demo"]);
    expect(namespacesIn(`const t = useTranslations(); t("common.a"); t.rich("blog.b")`).sort()).toEqual(["blog", "common"]);
  });
});
