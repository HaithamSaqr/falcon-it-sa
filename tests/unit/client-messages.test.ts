/**
 * Task 13: the browser only receives the message namespaces client components
 * read, and none of that text breaks the copy rules (no em or en dash, no
 * Egypt, no "undefined").
 */
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
