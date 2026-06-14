/**
 * Fire a Google Ads conversion. Fire-and-forget and fully guarded — it must
 * NEVER throw or block the surrounding user flow (lead POST / redirect).
 * `sendTo` is the full "AW-XXXX/LABEL" string; a blank value is a no-op.
 */
export function fireAdsConversion(sendTo: string | undefined | null): void {
  try {
    if (!sendTo) return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", "conversion", { send_to: sendTo });
    }
  } catch {
    /* tracking failures must never affect the user */
  }
}

/** Build the send_to string from an Ads id + a conversion label. */
export function adsSendTo(adsId?: string, label?: string): string {
  return adsId && label ? `${adsId}/${label}` : "";
}
