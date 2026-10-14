import { afterEach, describe, expect, it, vi } from "vitest";
import { parseThankYouType, thankYouPath } from "@/lib/thank-you";
import { fireAdsConversionThen } from "@/lib/gtag";

describe("thank-you type", () => {
  it("reads contact and demo, defaulting anything else to demo", () => {
    expect(parseThankYouType("contact")).toBe("contact");
    expect(parseThankYouType("demo")).toBe("demo");
    expect(parseThankYouType(undefined)).toBe("demo");
    expect(parseThankYouType("<script>")).toBe("demo");
    expect(parseThankYouType(["contact", "demo"])).toBe("contact");
  });

  it("builds the locale-free path the router localises", () => {
    expect(thankYouPath("demo")).toBe("/thank-you?type=demo");
    expect(thankYouPath("contact")).toBe("/thank-you?type=contact");
  });
});

describe("fireAdsConversionThen", () => {
  const w = globalThis as unknown as { window?: unknown };
  afterEach(() => {
    delete w.window;
    vi.useRealTimers();
  });

  it("goes on at once without gtag or without a label", () => {
    w.window = {};
    const next = vi.fn();
    fireAdsConversionThen("AW-1/abc", next);
    fireAdsConversionThen("", next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("waits for Google's callback and runs next exactly once", () => {
    vi.useFakeTimers();
    let callback: (() => void) | undefined;
    const gtag = vi.fn((_e: string, _n: string, p: { event_callback: () => void }) => {
      callback = p.event_callback;
    });
    w.window = { gtag };
    const next = vi.fn();
    fireAdsConversionThen("AW-1/abc", next, 1000);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", expect.objectContaining({ send_to: "AW-1/abc" }));
    expect(next).not.toHaveBeenCalled();
    callback?.();
    vi.advanceTimersByTime(1500);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("falls back to the timeout when Google never calls back", () => {
    vi.useFakeTimers();
    w.window = { gtag: vi.fn() };
    const next = vi.fn();
    fireAdsConversionThen("AW-1/abc", next, 800);
    vi.advanceTimersByTime(799);
    expect(next).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
