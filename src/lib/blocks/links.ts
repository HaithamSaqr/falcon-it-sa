/**
 * Link and image path checks (no dependencies, client-safe). The block
 * schemas (fields.ts) and the renderers share them.
 */

const CONTROL_OR_SPACE = /[\u0000- \u007f\\]/;

/** Relative path ("/demo", "/ar/sectors?x=1") or https URL. No other scheme. */
export function isSafeLink(v: string): boolean {
  if (v.length === 0 || v.length > 500 || CONTROL_OR_SPACE.test(v)) return false;
  if (v.startsWith("/")) return !v.startsWith("//");
  return /^https:\/\/[^/]/.test(v);
}

/** "" (no image) or /images/..., /api/uploads/..., https://... */
export function isSafeImage(v: string): boolean {
  if (v === "") return true;
  if (v.length > 500 || CONTROL_OR_SPACE.test(v)) return false;
  if (v.split("/").includes("..")) return false;
  return (
    v.startsWith("/images/") || v.startsWith("/api/uploads/") || /^https:\/\/[^/]/.test(v)
  );
}
