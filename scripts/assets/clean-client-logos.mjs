/**
 * Cleans the owner's client logo folder into public/images/v2/clients/<slug>.png.
 *
 *   node scripts/assets/clean-client-logos.mjs ["<source folder>"]
 *
 * Source (read-only): E:\Abdulrehman\Falcon Company\recorses\CLINTS COMPANY Logos
 * (46 files, all approved for display). Every logo is:
 *   1. rasterised (SVGs at high density) and given an alpha channel;
 *   2. cleaned by its `mode`:
 *        clear-white  plain white / near-white background becomes transparent
 *                     (soft ramp, low-saturation pixels only, so light brand colours stay)
 *        white-ink    a white logo made for dark backgrounds: neutral light pixels are
 *                     recoloured to the site ink (#0B1A33), greys keep their relative tone
 *        matte        a one-colour light logo on a solid dark box: the box is dropped and
 *                     the mark is re-inked from its luminance
 *        solid        the background is part of the design: kept, only white margins trimmed
 *   3. trimmed to its visible pixels;
 *   4. scaled onto a transparent canvas 160px tall (width = logo width, max 480) with a
 *      height that shrinks as the logo gets wider (square marks ~150px, a 3:1 wordmark
 *      ~100px, a 6:1 wordmark ~75px), so every logo reads with the same visual weight
 *      when the site shows them all at one CSS height.
 * Duplicates of one company keep the cleaner file (see SKIP). The slugs are the
 * ones src/lib/db/client-logos.ts points at.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] ?? "E:/Abdulrehman/Falcon Company/recorses/CLINTS COMPANY Logos";
const OUT = path.join(process.cwd(), "public", "images", "v2", "clients");

const CANVAS_H = 160;
const MAX_W = 480;
const INK = [0x0b, 0x1a, 0x33];
const SLATE = [0xa3, 0xab, 0xb8]; // what black becomes in white-ink mode (keeps tonal steps)

/**
 * file -> slug, mode, optional optical `scale` (1 = formula) and `inset`
 * ([x, y] fraction cut from each side before cleaning, to drop a stray frame).
 */
const LOGOS = [
  { file: "AL-AEN DEVOLPMENTS.png", slug: "al-ameen", mode: "clear-white" },
  { file: "ALDOUR DEVOLPMENTS.png", slug: "aldour", mode: "clear-white" },
  { file: "ALMADA CONSTRUCTION.png", slug: "almada", mode: "white-ink" },
  { file: "Automation Electric.jpeg", slug: "automation-electric", mode: "clear-white" },
  { file: "BENCHMARK.png", slug: "benchmark", mode: "clear-white" },
  { file: "Business Capital.png", slug: "business-capital", mode: "clear-white" },
  { file: "CILIA COSMATICS KSA.jpeg", slug: "celia-cosmetics", mode: "clear-white" },
  { file: "CITY ELECTRIC.jpg", slug: "city-electric", mode: "clear-white" },
  { file: "Capital Safety Company.png", slug: "capital-safety", mode: "clear-white" },
  { file: "DAR ELKHEBRA.jpg", slug: "dar-elkhebra", mode: "solid" },
  { file: "DIAMOND HOME.jpg", slug: "diamond-home", mode: "clear-white", scale: 1.1 },
  { file: "DIAR DEVOLPMENTS.webp", slug: "diar", mode: "clear-white" },
  { file: "Dite Fitness.png", slug: "diet-fitness", mode: "clear-white" },
  { file: "ELITE CONSTRUTION.png", slug: "elite-construction", mode: "white-ink" },
  { file: "ESKAN Construction.jpg", slug: "eskan", mode: "matte" },
  { file: "Echo Art.png", slug: "echo-art", mode: "clear-white" },
  { file: "Ethad.png", slug: "etehad", mode: "clear-white" },
  { file: "Food-x healthy food.png", slug: "foodx", mode: "clear-white" },
  { file: "GEODESY.png", slug: "geodesy", mode: "clear-white" },
  { file: "GLOBAL CONVEYAR TECHNOLOGY (2).png", slug: "global-conveyor-technology", mode: "clear-white" },
  { file: "HABIB TRADING CO.png", slug: "habib-trading", mode: "white-ink" },
  { file: "HADDAD GROUP.svg", slug: "haddad-group", mode: "white-ink" },
  { file: "INSPIRE CONSTRUCTION.jpg", slug: "inspire", mode: "clear-white", scale: 1.15 },
  { file: "KAMCOO.webp", slug: "kamco", mode: "white-ink" },
  { file: "LA VERDE DEVOLPMENTS.png", slug: "la-verde", mode: "white-ink" },
  { file: "LOZOOM KSA MEDICAL DEVICES.jpeg", slug: "lozom-medical", mode: "matte", inset: [0.15, 0.3] },
  { file: "Lozom.png", slug: "lozom", mode: "clear-white" },
  { file: "MAHARA.png", slug: "mahara", mode: "clear-white" },
  { file: "MARINO KITCHEN EQUIPMENT.webp", slug: "marino", mode: "clear-white" },
  { file: "MAUNTAIN.jpg", slug: "mountain", mode: "matte" },
  { file: "Modern Arch Vision.png", slug: "modern-arch-vision", mode: "clear-white" },
  { file: "NAGHIMARINE.svg", slug: "naghi-marine", mode: "white-ink" },
  { file: "NAMA CHEM.jpg", slug: "nama-chem", mode: "solid", scale: 0.8 },
  { file: "NGD DEVOLPMENTS.png", slug: "ngd", mode: "clear-white", scale: 0.85 },
  { file: "PURECHEM.jpg", slug: "purechem", mode: "clear-white" },
  { file: "Points Event.jpg", slug: "points-event", mode: "matte" },
  { file: "RESIDENTS GOV PAKESTAN.png", slug: "krso", mode: "clear-white" },
  { file: "ROYAL STEEL.jpg", slug: "royal-steel", mode: "clear-white" },
  { file: "SAUDI EMAR DEVOLPMENTS AND CONSTRUTION.webp", slug: "saudi-emar", mode: "white-ink" },
  { file: "Smart Care.png", slug: "smart-care", mode: "clear-white" },
  { file: "T.E.C Construction KSA.jpeg", slug: "tec", mode: "clear-white", scale: 1.15 },
  { file: "TAQNYAT TELECOME.svg", slug: "taqnyat", mode: "clear-white" },
  { file: "Tamimi-Logo-s.png", slug: "al-tamimi", mode: "clear-white" },
  { file: "ZAMIL GROUP.webp", slug: "zamil", mode: "clear-white" },
  { file: "talween.png", slug: "talween", mode: "clear-white" },
];

/** Files not processed, with the reason. */
const SKIP = {
  "GLOBAL CONVEYAR TECHNOLOGY.png": "duplicate of GLOBAL CONVEYAR TECHNOLOGY (2).png (that one is the clean transparent wordmark)",
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

async function load(file, inset) {
  const full = path.join(SRC, file);
  let img = sharp(full);
  if (/\.svg$/i.test(file)) {
    const meta = await img.metadata();
    const density = Math.min(1200, Math.max(72, Math.round((72 * 1600) / (meta.width || 800))));
    img = sharp(full, { density });
  }
  if (inset) {
    const meta = await img.metadata();
    const dx = Math.round(meta.width * inset[0]), dy = Math.round(meta.height * inset[1]);
    img = sharp(await img.extract({ left: dx, top: dy, width: meta.width - 2 * dx, height: meta.height - 2 * dy }).toBuffer());
  }
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Near-white, low-saturation pixels fade to transparent (ramp 228..250 on the darkest channel). */
function clearWhite(px) {
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    if (mx - mn > 30) continue;
    const keep = clamp01((250 - mn) / 22);
    d[i + 3] = Math.round(d[i + 3] * keep);
  }
}

/** Neutral pixels are re-toned: white -> ink, black -> slate (tonal order inverted). */
function whiteInk(px) {
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    if (mx - mn > 40) continue; // a brand colour: leave it
    const t = (r + g + b) / 765; // 1 = white
    for (let k = 0; k < 3; k++) d[i + k] = Math.round(SLATE[k] + (INK[k] - SLATE[k]) * t);
  }
}

/** Solid dark box (colour sampled at the corners) dropped; light mark re-inked from luminance. */
function matte(px) {
  const { data: d, width: w, height: h } = px;
  const lum = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4].map(lum).sort((a, b) => a - b);
  const bg = (corners[1] + corners[2]) / 2;
  const top = 235;
  for (let i = 0; i < d.length; i += 4) {
    const a = clamp01((lum(i) - bg - 12) / (top - bg - 12));
    d[i] = INK[0];
    d[i + 1] = INK[1];
    d[i + 2] = INK[2];
    d[i + 3] = Math.round(255 * a);
  }
}

/** White margins around a solid logo become transparent; the solid box itself is kept. */
function solid(px) {
  const { data: d, width: w, height: h } = px;
  const isWhite = (i) => Math.min(d[i], d[i + 1], d[i + 2]) >= 235;
  // flood from the edges through white only
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !isWhite(p * 4)) continue;
    seen[p] = 1;
    d[p * 4 + 3] = 0;
    const x = p % w, y = (p - x) / w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
}

/** Bounding box of pixels with alpha above a small threshold. */
function bbox(px, min = 12) {
  const { data: d, width: w, height: h } = px;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("logo is empty after cleaning");
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/** Content height on the 160px canvas for a logo of aspect `r` (width / height). */
function opticalHeight(r, scale = 1) {
  let h = 150 * Math.pow(r, -0.4) * scale;
  h = Math.min(h, CANVAS_H);
  if (h * r > MAX_W) h = MAX_W / r;
  return h;
}

async function processLogo({ file, slug, mode, scale = 1, inset }) {
  const px = await load(file, inset);
  if (mode === "clear-white") clearWhite(px);
  else if (mode === "white-ink") whiteInk(px);
  else if (mode === "matte") matte(px);
  else if (mode === "solid") solid(px);
  else throw new Error(`unknown mode ${mode}`);

  const box = bbox(px);
  const cropped = await sharp(px.data, { raw: { width: px.width, height: px.height, channels: 4 } })
    .extract(box)
    .png()
    .toBuffer();

  const r = box.width / box.height;
  const h = Math.round(opticalHeight(r, scale));
  const w = Math.max(1, Math.round(h * r));
  const resized = await sharp(cropped).resize(w, h, { kernel: "lanczos3", fit: "fill" }).png().toBuffer();
  const top = Math.floor((CANVAS_H - h) / 2);
  const out = path.join(OUT, `${slug}.png`);
  await sharp({ create: { width: w, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: 0, top }])
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 95 })
    .toFile(out);
  return { slug, width: w, height: CANVAS_H };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const present = fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
  const known = new Set([...LOGOS.map((l) => l.file), ...Object.keys(SKIP)]);
  const unknown = present.filter((f) => !known.has(f));
  if (unknown.length) throw new Error(`Not mapped in LOGOS or SKIP: ${unknown.join(", ")}`);
  for (const logo of LOGOS) {
    const m = await processLogo(logo);
    console.log(`${m.slug.padEnd(28)} ${String(m.width).padStart(4)}x${m.height}  ${logo.mode}`);
  }
  for (const [f, why] of Object.entries(SKIP)) console.log(`skipped ${f}: ${why}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
