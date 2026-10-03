import { createElement } from "react";
import * as Phosphor from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react/dist/lib/types";
import { cn } from "@/lib/utils";

// Directional glyphs mirror under RTL via CSS (`rtl:` variant), never via a JS
// locale check. Rotation arrows keep their sense, so they are excluded.
const DIRECTIONAL = /^(Arrow(?!s)|Caret|SignIn|SignOut)/;
const KEEP_SENSE = /Clockwise|CounterClockwise/;

// Non-icon exports of the package.
const NOT_ICONS = new Set(["IconBase", "IconContext", "SSRBase", "default"]);

/** Accepts `ArrowUpRight`, `ArrowUpRightIcon` or `arrow-up-right`. */
function normalise(name: string): string {
  const trimmed = name.trim();
  if (/[-_\s]/.test(trimmed)) {
    return trimmed
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }
  return trimmed;
}

function resolve(name: string): PhosphorIcon | null {
  const key = normalise(name);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(key) || NOT_ICONS.has(key)) return null;
  const found = (Phosphor as unknown as Record<string, unknown>)[key];
  if (!found || (typeof found !== "object" && typeof found !== "function")) return null;
  return found as PhosphorIcon;
}

/** True when the icon mirrors in right-to-left layouts. */
export function isDirectionalIcon(name: string): boolean {
  const key = normalise(name).replace(/Icon$/, "");
  return DIRECTIONAL.test(key) && !KEEP_SENSE.test(key);
}

type IconProps = {
  /** Phosphor icon name. Unknown names render nothing and never throw. */
  name: string;
  /** CSS size of the glyph; defaults to 1em. */
  size?: number | string;
  className?: string;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
};

/** Phosphor Light icon, server-component safe. */
export default function Icon({ name, size, className, label }: IconProps) {
  if (typeof name !== "string") return null;
  const Glyph = resolve(name);
  if (!Glyph) return null;
  // Glyphs are module-level constants from the package; createElement keeps the
  // lookup-by-name pattern from being read as a component created during render.
  return createElement(Glyph, {
    weight: "light",
    size,
    className: cn(isDirectionalIcon(name) && "rtl:-scale-x-100", className),
    ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true }),
  });
}
