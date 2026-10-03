/**
 * Primary CTA links (client-safe). Block CTAs that point at `/demo` (the seed
 * default) or carry no link go to the admin-set demo url, so one setting
 * (`site_settings.demo_url`) moves every "Book a demo" button.
 */

export function demoHref(href: string | null | undefined, demoUrl: string): string {
  return !href || href === "/demo" ? demoUrl : href;
}

/** `demoUrl?sector=<slug>&role=<role>`, keeping any existing query and hash. */
export function sectorDemoHref(demoUrl: string, sector: string, role?: string): string {
  const hashAt = demoUrl.indexOf("#");
  const base = hashAt === -1 ? demoUrl : demoUrl.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : demoUrl.slice(hashAt);
  const params = new URLSearchParams({ sector });
  if (role) params.set("role", role);
  return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}${hash}`;
}
