import { notFound } from "next/navigation";

/**
 * Any path inside a locale that no route matches: show the localized 404
 * (../not-found.tsx) with a 404 status, instead of the root fallback.
 */
export default function UnknownLocalePath() {
  notFound();
}
