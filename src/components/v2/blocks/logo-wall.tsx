import Image from "next/image";
import { canOptimize } from "@/lib/image-src";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps, type RenderContext } from "./context";
import { InlineLink, SectionHead, tn, tx } from "./parts";

type Logo = RenderContext["clients"][number];

/** Below this many logos one copy of the strip is narrower than the page, so it stays a still row. */
export const MARQUEE_MIN_LOGOS = 12;

/** Seconds per logo for one full loop (about 40px a second): slow enough to read every name. */
const SECONDS_PER_LOGO = 4;

/**
 * Client logo strip: a quiet line and every client's logo in full colour
 * (clients table), drifting slowly in a CSS-only loop that pauses on hover and
 * keyboard focus and stands still, wrapped, under reduced motion. Tucks under
 * a hero. As the first block of a page (the clients page) it is the page
 * header: the heading is the H1 and every logo shows in a tiled wall.
 */
export default function LogoWallBlock({ content: c, ctx, place }: BlockProps<"logo_wall">) {
  const logos = ctx.clients.filter((l) => l.logo).slice(0, c.limit);
  const heading = tx(ctx, c.heading);
  if (logos.length === 0) return null;
  if (place.first) return <LogoWallPage content={c} ctx={ctx} place={place} logos={logos} />;
  const moving = logos.length >= MARQUEE_MIN_LOGOS;

  return (
    <Section
      tone={place.afterHero ? "page" : place.tone}
      className={place.afterHero ? "pt-0 pb-14 md:pt-0 md:pb-20 lg:pt-2 lg:pb-[88px]" : undefined}
      aria-label={heading}
      {...rootProps("logo_wall", place)}
    >
      <Container className="flex flex-col gap-4 lg:gap-[22px]">
        {heading && <h2 className="text-[13px] font-normal leading-normal tracking-normal text-muted lg:text-sm">{tn(ctx, c.heading)}</h2>}
        {tx(ctx, c.intro) && <p className="v2-copy text-[15px] text-body">{tn(ctx, c.intro)}</p>}
      </Container>
      {moving ? (
        <div
          className="v2-marquee mx-auto mt-6 max-w-[1440px] lg:mt-8"
          data-marquee=""
          tabIndex={0}
          role="group"
          aria-label={heading || undefined}
        >
          <div
            className="v2-marquee-track"
            style={{ "--marquee-duration": `${logos.length * SECONDS_PER_LOGO}s` } as CSSProperties}
          >
            <LogoList logos={logos} ctx={ctx} />
            <LogoList logos={logos} ctx={ctx} copy />
          </div>
        </div>
      ) : (
        <Container className="mt-6 lg:mt-8">
          <LogoList logos={logos} ctx={ctx} still />
        </Container>
      )}
      {tx(ctx, c.link.label) && c.link.href && (
        <Container className="mt-6">
          <InlineLink label={tn(ctx, c.link.label)} href={c.link.href} />
        </Container>
      )}
    </Section>
  );
}

/** One pass of the strip. The second (`copy`) pass makes the loop seamless and is hidden from assistive tech. */
function LogoList({ logos, ctx, copy = false, still = false }: { logos: Logo[]; ctx: RenderContext; copy?: boolean; still?: boolean }) {
  return (
    <ul
      className={cn("v2-marquee-list", still && "flex-wrap justify-center gap-y-6")}
      aria-hidden={copy || undefined}
      data-marquee-copy={copy ? "" : undefined}
    >
      {logos.map((l, i) => (
        <li key={`${l.logo}-${i}`} className="flex shrink-0 items-center px-5 lg:px-7">
          <Image
            src={l.logo}
            alt={copy ? "" : tx(ctx, l.name)}
            width={480}
            height={160}
            sizes="(min-width: 1024px) 120px, 96px"
            // Loaded up front at low priority: lazy images inside the clipped,
            // moving strip would only start loading as they drift into sight.
            loading="eager"
            fetchPriority="low"
            unoptimized={!canOptimize(l.logo)}
            className="v2-logo h-8 w-auto max-w-[160px] object-contain lg:h-10 lg:max-w-[200px]"
          />
        </li>
      ))}
    </ul>
  );
}

function LogoWallPage({ content: c, ctx, place, logos }: BlockProps<"logo_wall"> & { logos: Logo[] }) {
  return (
    <Section tone={place.tone} className="pt-10 md:pt-14 lg:pt-[72px]" {...rootProps("logo_wall", place)}>
      <Container className="flex flex-col gap-10 lg:gap-14">
        <SectionHead as="h1" heading={tn(ctx, c.heading)} intro={tx(ctx, c.intro) ? tn(ctx, c.intro) : undefined} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {logos.map((l, i) => (
            <li
              key={`${l.logo}-${i}`}
              className="flex h-[112px] items-center justify-center rounded-[20px] bg-surface px-4 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] md:h-[136px] md:px-6"
            >
              <Image
                src={l.logo}
                alt={tx(ctx, l.name)}
                width={480}
                height={160}
                sizes="(min-width: 768px) 192px, 168px"
                unoptimized={!canOptimize(l.logo)}
                className="v2-logo h-14 w-auto max-w-full object-contain md:h-16"
              />
            </li>
          ))}
        </ul>
        <InlineLink label={tn(ctx, c.link.label)} href={c.link.href} />
      </Container>
    </Section>
  );
}
