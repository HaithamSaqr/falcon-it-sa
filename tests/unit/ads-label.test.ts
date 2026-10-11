import { describe, expect, it } from "vitest";
import { extractAdsLabel, isValidAdsId } from "@/lib/ads-label";

describe("extractAdsLabel", () => {
  it("extracts the label from a full AW-id/label string", () => {
    expect(extractAdsLabel("AW-123456789/AbC123xYz")).toBe("AbC123xYz");
  });

  it("extracts the label from the whole event snippet", () => {
    const snippet = `<script>
  gtag('event', 'conversion', {'send_to': 'AW-123456789/AbC_12-xYz'});
</script>`;
    expect(extractAdsLabel(snippet)).toBe("AbC_12-xYz");
  });

  it("handles surrounding quotes and whitespace", () => {
    expect(extractAdsLabel(`  'AW-9/abc'  `)).toBe("abc");
  });

  it("returns null for a bare label or empty input", () => {
    expect(extractAdsLabel("AbC123xYz")).toBeNull();
    expect(extractAdsLabel("")).toBeNull();
    expect(extractAdsLabel("AW-123456789")).toBeNull();
  });
});

describe("isValidAdsId", () => {
  it("accepts AW- followed by digits only", () => {
    expect(isValidAdsId("AW-123456789")).toBe(true);
    expect(isValidAdsId(" AW-1 ")).toBe(true);
  });

  it("rejects other shapes", () => {
    expect(isValidAdsId("AW-XXXXXXXXXX")).toBe(false);
    expect(isValidAdsId("123456789")).toBe(false);
    expect(isValidAdsId("AW-123/abc")).toBe(false);
    expect(isValidAdsId("")).toBe(false);
  });
});
