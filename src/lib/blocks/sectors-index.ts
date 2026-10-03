/**
 * Blocks for the `/sectors` index. The page has no stored blocks: the grid is
 * built from the enabled sectors (name, one-line promise, photo, link), so a
 * sector turned on or off in admin appears or disappears here, followed by
 * the closing booking block.
 */
import type { Sector } from "@/types/admin";
import { b, demoCta, isSafeImage } from "./fields";
import { V2_SECTORS } from "./seed/sectors";
import type { Block } from "./types";

const INDEX_PAGE = "sectors";

/** Alt text: the v2 description while the photo is still the shipped one, else the sector name. */
function photoAlt(s: Sector) {
  const v2 = V2_SECTORS.find((v) => v.slug === s.id);
  return v2 && v2.photo === s.photo ? v2.photoAlt : s.name;
}

export function sectorsIndexBlocks(sectors: Sector[]): Block[] {
  const ordered = [...sectors].sort((a, c) => a.sortOrder - c.sortOrder);
  return [
    {
      id: "sectors-grid",
      page: INDEX_PAGE,
      type: "sector_grid",
      sortOrder: 0,
      enabled: true,
      content: {
        heading: b("Sectors we serve", "القطاعات التي نخدمها"),
        intro: b(
          "Pick yours to see the problems we solve and how the system is configured for them.",
          "اختر قطاعك لترى المشكلات التي نحلّها، وكيف نضبط النظام لها.",
        ),
        cards: ordered.map((s) => {
          const image = s.photo && isSafeImage(s.photo) ? s.photo : "";
          return {
            title: s.name,
            line: s.shortPromise ?? b(""),
            image,
            imageAlt: image ? photoAlt(s) : b(""),
            href: `/sectors/${s.id}`,
          };
        }),
        otherCard: {
          title: b("Don't see your sector?", "لا ترى قطاعك؟"),
          line: b(
            "Tell us how your business runs. We'll show you the ERP set up for it.",
            "أخبرنا كيف يسير عملك، وسنريك النظام مضبوطًا عليه.",
          ),
          ctaLabel: demoCta().label,
          href: "/demo",
        },
      },
    },
    {
      id: "sectors-booking",
      page: INDEX_PAGE,
      type: "booking",
      sortOrder: 1,
      enabled: true,
      content: {
        heading: b("See your own workflow running in the ERP.", "شاهد دورتك تعمل داخل النظام."),
        body: b(
          "In one session, a senior implementer shows you the ERP on your processes, then sends a written recommendation: which system, what scope, how long.",
          "في جلسة واحدة، يعرض لك مستشار تطبيق خبير النظام على إجراءاتك، ثم يرسل لك توصية مكتوبة: أي نظام، أي نطاق، وكم من الوقت.",
        ),
        cta: demoCta(),
        noteTitle: b(""),
        note: b(""),
      },
    },
  ];
}
