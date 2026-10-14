import { describe, expect, it } from "vitest";
import { MAX_PROFILE_BYTES, isPdf, profileUploadError } from "@/lib/company-profile";

const pdf = (extra = 0) => new Uint8Array(Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(extra)]));

describe("company profile upload checks", () => {
  it("accepts a real PDF with a .pdf name, any case", () => {
    expect(isPdf(pdf())).toBe(true);
    expect(profileUploadError("Profile.PDF", pdf())).toBeNull();
  });

  it("refuses other extensions, empty files and files that only claim to be PDFs", () => {
    expect(profileUploadError("profile.docx", pdf())).toMatch(/must be a PDF/);
    expect(profileUploadError("profile.pdf", new Uint8Array())).toMatch(/empty/);
    expect(profileUploadError("profile.pdf", new Uint8Array(Buffer.from("<html>hello</html>")))).toMatch(/not a valid PDF/);
  });

  it("refuses files over the 25MB limit", () => {
    expect(profileUploadError("profile.pdf", pdf(MAX_PROFILE_BYTES))).toMatch(/too large/);
  });
});
