import { getSectors } from "@/lib/data-store";
import SectorsGrid from "./sectors-grid";

/** Server wrapper: reads sectors and shows the first 6 (featured first) on the home page. */
export default async function SectorsHome() {
  const all = await getSectors(true);
  // Featured sectors float to the front, then by sort order.
  const sorted = [...all].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const top = sorted.slice(0, 6);
  return <SectorsGrid sectors={top} hasMore={all.length > 6} />;
}
