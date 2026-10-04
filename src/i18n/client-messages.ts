/**
 * Message namespaces read by client components (useTranslations in a
 * "use client" file). Only these reach the browser through
 * NextIntlClientProvider; server components read the full set.
 *
 * chrome: mobile bar, WhatsApp pill. common: WhatsApp greeting.
 * contact / demo / validation: the lead forms.
 */
export const CLIENT_NAMESPACES = ["chrome", "common", "contact", "demo", "validation"] as const;

type Messages = Record<string, unknown>;

/** The client namespaces of `messages` (missing ones are left out). */
export function clientMessages<M extends Messages>(messages: M): Partial<M> {
  const out: Partial<M> = {};
  for (const ns of CLIENT_NAMESPACES) {
    if (Object.hasOwn(messages, ns)) out[ns as keyof M] = messages[ns as keyof M];
  }
  return out;
}
