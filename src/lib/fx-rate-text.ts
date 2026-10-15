/** Client-safe formatting for the Egypt price line (no fetch here). */
/** USD amount times the rate, rounded to whole pounds with thousands separators ("475", "1,110"). */
export function usdToEgpText(usd: string, rate: number | null): string {
  const n = Number(String(usd).replace(/,/g, ""));
  if (!rate || !Number.isFinite(n) || n <= 0) return "";
  return Math.round(n * rate).toLocaleString("en-US");
}
