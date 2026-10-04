/**
 * Real Falcon ERP desktop screenshots for the home page, cropped from the
 * owner's captures into public/images/v2/screen-<name>.png.
 *
 *   node scripts/assets/falcon-screens.mjs ["<FALCON DESKTOP SCREENS folder>"]
 *
 * Source (read-only): E:\Abdulrehman\Falcon Company\recorses\FALCON DESKTOP SCREENS
 * (2560x1392 captures of the Arabic desktop app). Each crop keeps the
 * right-hand side, where the Arabic UI starts (side menu, first ribbon tab,
 * first columns), and is sized so the UI text stays readable at the size the
 * site shows it. Output is twice that display size (Next's optimizer serves
 * WebP from it).
 *
 * Privacy: the crops leave out everything personal in the captures. The
 * dashboard's left panel (employee names, requests, amounts per person) is
 * left of x=495 and the status bar (support phone numbers) is below y=1355;
 * both are outside every crop. Only business-generic figures remain (counts,
 * totals, chart-of-accounts names). Check any new crop for names and phone
 * numbers before adding it.
 */
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] ?? "E:/Abdulrehman/Falcon Company/recorses/FALCON DESKTOP SCREENS";
const OUT = path.join(process.cwd(), "public", "images", "v2");

const SCREENS = [
  {
    // Dashboard: title bar, HR ribbon, side menu and the KPI tiles (839 items sold, 9 employees, 565 items).
    // Home hero frame: 560x484 at xl, so 1120x968 out.
    file: "2025-11-07_23h18_10.png",
    out: "screen-dashboard.png",
    crop: { left: 1560, top: 0, width: 1000, height: 864 },
    size: { width: 1120, height: 968 },
  },
  {
    // Trial balance by main accounts (ميزان بالحسابات الرئيسية): filters and the account rows with debit/credit.
    // Departments frame: 580x560 at xl, so 1160x1120 out.
    file: "2025-11-07_23h23_02.png",
    out: "screen-trial-balance.png",
    crop: { left: 1440, top: 205, width: 1119, height: 1080 },
    size: { width: 1160, height: 1120 },
  },
];

for (const s of SCREENS) {
  const meta = await sharp(path.join(SRC, s.file)).metadata();
  const { left, top, width, height } = s.crop;
  if (left < 495 || top + height > 1355 || left + width > meta.width) {
    throw new Error(`${s.out}: crop reaches the personal-data areas or the image edge`);
  }
  await sharp(path.join(SRC, s.file))
    .extract(s.crop)
    .resize(s.size.width, s.size.height, { kernel: "lanczos3", fit: "fill" })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(OUT, s.out));
  console.log(`${s.out}  ${s.size.width}x${s.size.height}  from ${s.file}`);
}
