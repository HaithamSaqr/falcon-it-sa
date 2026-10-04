import Image from "next/image";
import { canOptimize } from "@/lib/image-src";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import Icon from "@/components/v2/ui/icon";
import {
  HeroSectorPills,
  HeroSectorSwitcher,
  HeroSubtitle,
  HeroTile,
  type HeroPillData,
  type HeroTileData,
} from "@/components/v2/islands/hero-sector-switcher";
import { rootProps, type BlockProps } from "./context";
import { Highlighted, PrimaryCta, SecondaryCta, tn, tx } from "./parts";

/** A brand logo as the card image (`/images/v2/logo-odoo.png`): shown whole on a tint, not cropped like a photo. */
const isLogo = (src: string) => /\/logo-[^/]+$/.test(src);
const LOGO_TINT = (src: string) => (/logo-odoo/.test(src) ? "bg-odoo-tint" : "bg-[#EAF3FB]");

/** Product screenshot on the floating card while no sector is picked (design element, not content). */
const MODULES_SHOT = "/images/v2/shot-apps-top.jpg";

/**
 * Page hero: H1, subtitle, optional "See it for" sector pills, CTAs, and a
 * framed photo with a floating card. Pills swap the subtitle and the card.
 */
export default function HeroBlock({ content: c, ctx, place }: BlockProps<"hero">) {
  const pills: HeroPillData[] = c.sectorPills
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => tx(ctx, p.label) !== "")
    .map(({ p, i }) => {
      const caption = tn(ctx, p.caption);
      return {
        id: `p${i}`,
        label: tn(ctx, p.label),
        subtitle: tn(ctx, p.subtitle),
        tile:
          caption || p.image
            ? { image: p.image, alt: tx(ctx, p.alt), caption, sub: ctx.labels.seeSetup, href: p.href }
            : null,
      };
    });

  const caption = tn(ctx, c.card.caption);
  // With sector pills the card previews the modules; otherwise it captions the photo.
  const fallback: HeroTileData | null = caption
    ? pills.length > 0
      ? { image: MODULES_SHOT, alt: ctx.labels.modulesAlt, caption, sub: ctx.labels.seeModules, href: ctx.anchors.includes("erp") ? "#erp" : "", position: "50% 20%" }
      : { image: "", alt: "", caption, sub: "", href: "" }
    : null;
  const hasPhoto = c.card.image !== "";

  return (
    <Section tone="page" className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-[72px] lg:pb-24" {...rootProps("hero", place)}>
      <HeroSectorSwitcher pills={pills}>
        <Container
          className={
            hasPhoto || fallback
              ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.27fr)] lg:gap-14"
              : "grid"
          }
        >
          <div className="flex min-w-0 flex-col gap-6 lg:gap-[30px]">
            <h1 className="v2-display animate-rise">
              <Highlighted ctx={ctx} value={c.title} />
            </h1>
            <div className="animate-rise rise-d1">
              <HeroSubtitle
                text={tn(ctx, c.subtitle)}
                className="v2-copy max-w-[540px] text-[17px] text-body lg:text-xl rtl:lg:leading-[1.9]"
              />
            </div>
            {pills.length > 0 && (
              <HeroSectorPills
                label={tn(ctx, c.sectorsLabel)}
                fallbackLabel={ctx.labels.sectors}
                className="animate-rise rise-d2"
              />
            )}
            <div className="animate-rise rise-d3 flex flex-wrap items-center gap-x-[26px] gap-y-4">
              <PrimaryCta ctx={ctx} label={tn(ctx, c.primaryCta.label)} href={c.primaryCta.href} />
              <SecondaryCta label={tn(ctx, c.secondaryCta.label)} href={c.secondaryCta.href} />
            </div>
          </div>

          {(hasPhoto || fallback) && (
            <div className="animate-rise rise-d4 relative pb-24 lg:h-[500px] lg:pb-0 xl:h-[560px]">
              {hasPhoto && (
                <div className="rounded-[26px] bg-ink/[0.035] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] sm:rounded-[30px] sm:p-2 lg:absolute lg:end-0 lg:top-0 lg:w-[87.5%]">
                  <div
                    className={cn(
                      "overflow-hidden rounded-[20px] shadow-[0_40px_80px_-40px_rgba(12,60,120,0.4)] sm:rounded-[22px]",
                      isLogo(c.card.image) ? LOGO_TINT(c.card.image) : "bg-surface",
                    )}
                  >
                    <Image
                      src={c.card.image}
                      alt={tx(ctx, c.card.alt)}
                      width={1120}
                      height={968}
                      sizes="(min-width: 1280px) 560px, (min-width: 1024px) 44vw, calc(100vw - 40px)"
                      unoptimized={!canOptimize(c.card.image)}
                      preload
                      className={cn(
                        "block h-[250px] w-full sm:h-[360px] lg:h-[430px] xl:h-[484px]",
                        isLogo(c.card.image)
                          ? "object-contain p-12 mix-blend-multiply sm:p-20 lg:p-24"
                          : "object-cover",
                      )}
                    />
                  </div>
                </div>
              )}
              <HeroTile
                fallback={fallback}
                arrow={<Icon name="ArrowUpRight" size={15} />}
                className={
                  hasPhoto
                    ? "absolute start-3 bottom-0 w-[min(230px,calc(100%-24px))] sm:start-6 sm:w-[270px] lg:start-0 lg:w-[290px]"
                    : "w-full max-w-[340px]"
                }
              />
            </div>
          )}
        </Container>
      </HeroSectorSwitcher>
    </Section>
  );
}
