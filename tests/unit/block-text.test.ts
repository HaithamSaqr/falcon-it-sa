import { describe, expect, it } from "vitest";
import { boldRuns, splitHighlight } from "@/lib/blocks/text";
import { demoHref, sectorDemoHref } from "@/lib/blocks/cta";

describe("splitHighlight", () => {
  it("highlights the clause after the last internal break", () => {
    expect(splitHighlight("Claims on time. Margin you can see from site.")).toEqual([
      "Claims on time. ",
      "Margin you can see from site.",
    ]);
    expect(splitHighlight("مستخلصك في موعده، وهامشك أمامك.")).toEqual(["مستخلصك في موعده، ", "وهامشك أمامك."]);
  });

  it("highlights the closing words of a single clause", () => {
    expect(splitHighlight("One ERP for your whole company.")).toEqual(["One ERP for your ", "whole company."]);
    expect(splitHighlight("Know every unit's profit before you sell it.")).toEqual([
      "Know every unit's profit ",
      "before you sell it.",
    ]);
    expect(splitHighlight("اعرف ربح كل وحدة قبل أن تبيعها.")).toEqual(["اعرف ربح كل وحدة ", "قبل أن تبيعها."]);
  });

  it("leaves very short titles alone", () => {
    expect(splitHighlight("Contact us")).toEqual(["Contact us", ""]);
    expect(splitHighlight("")).toEqual(["", ""]);
  });
});

describe("boldRuns", () => {
  it("splits **bold** runs and keeps everything else as text", () => {
    expect(boldRuns("**Use.** The site <b>is</b> lawful.")).toEqual([
      { bold: true, text: "Use." },
      { bold: false, text: " The site <b>is</b> lawful." },
    ]);
  });

  it("leaves an unmatched marker as text", () => {
    expect(boldRuns("a ** b")).toEqual([{ bold: false, text: "a ** b" }]);
  });
});

describe("demo links", () => {
  it("sends /demo and empty hrefs to the configured demo url", () => {
    expect(demoHref("/demo", "/book")).toBe("/book");
    expect(demoHref("", "/demo")).toBe("/demo");
    expect(demoHref("/contact", "/demo")).toBe("/contact");
  });

  it("adds sector and role, before any hash, with the right separator", () => {
    expect(sectorDemoHref("/demo", "real-estate", "dev")).toBe("/demo?sector=real-estate&role=dev");
    expect(sectorDemoHref("/demo?x=1", "retail")).toBe("/demo?x=1&sector=retail");
    expect(sectorDemoHref("https://cal.example/a#top", "retail", "owner")).toBe(
      "https://cal.example/a?sector=retail&role=owner#top",
    );
  });
});
