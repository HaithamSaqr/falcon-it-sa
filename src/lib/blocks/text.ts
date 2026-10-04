/**
 * Pure text helpers for the block renderers (client-safe, no React).
 */

const CLAUSE_BREAK = /[.,،:;!?؟]\s+/g;

/**
 * Splits a headline into [lead, highlight] for the brand-blue accent in hero
 * H1s. The highlight is the clause after the last internal break
 * ("Claims on time. | Margin you can see from site.") or, for a single clause,
 * its closing words ("One ERP for your | whole company."). Titles of fewer
 * than four words are not split. Deterministic, so admin text needs no markup.
 */
export function splitHighlight(title: string): [string, string] {
  const t = (title ?? "").trim();
  if (t === "") return ["", ""];

  let cut = -1;
  for (const m of t.matchAll(CLAUSE_BREAK)) {
    const end = (m.index ?? 0) + m[0].length;
    if (end < t.length) cut = end;
  }
  if (cut > 0) return [t.slice(0, cut), t.slice(cut)];

  const words = t.split(/\s+/);
  const n = words.length;
  if (n < 4) return [t, ""];
  const k = Math.min(Math.max(n - 4, 2), Math.ceil(n / 2));
  return [`${words.slice(0, n - k).join(" ")} `, words.slice(n - k).join(" ")];
}

export type TextRun = { bold: boolean; text: string };

/**
 * Splits admin text on `**bold**` markers. Only that one syntax is understood;
 * everything else stays literal text (React escapes it when rendered).
 */
export function boldRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of (text ?? "").matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) runs.push({ bold: false, text: text.slice(last, i) });
    runs.push({ bold: true, text: m[1] });
    last = i + m[0].length;
  }
  if (last < (text ?? "").length) runs.push({ bold: false, text: text.slice(last) });
  return runs;
}
