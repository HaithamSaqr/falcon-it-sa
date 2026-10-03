import Image from "next/image";
import { cn } from "@/lib/utils";
import { demoHref } from "@/lib/blocks/cta";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { ArrowBadge, SectionHead, SmartLink, tx } from "./parts";

// Static class names so Tailwind sees them: the closing card fills the rest of its row.
const FILL_SPAN: Record<number, string> = { 4: "lg:col-span-4", 8: "lg:col-span-8", 12: "lg:col-span-12" };
const FILL_SPAN_MD: Record<number, string> = { 6: "sm:col-span-1", 12: "sm:col-span-2" };

const CARD =
  "group v2-lift flex flex-col bg-surface text-ink no-underline shadow-[0_0_0_1px_rgba(11,26,51,0.05)] outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";

/** Equal sector cards (photo cards, then text-only cards) and the "Don't see your sector?" card. */
export default function SectorGridBlock({ content: c, ctx, place }: BlockProps<"sector_grid">) {
  const cards = c.cards
    .map((card) => ({ ...card, title: tx(ctx, card.title), line: tx(ctx, card.line), alt: tx(ctx, card.imageAlt) }))
    .filter((card) => card.title !== "");
  const other = {
    title: tx(ctx, c.otherCard.title),
    line: tx(ctx, c.otherCard.line),
    cta: tx(ctx, c.otherCard.ctaLabel),
    href: demoHref(c.otherCard.href, ctx.demoUrl),
  };
  // Every card spans 4 of 12 columns on desktop (2 of 2 columns below).
  const usedLg = (cards.length * 4) % 12;
  const fillLg = usedLg === 0 ? 12 : 12 - usedLg;
  const fillMd = cards.length % 2 === 0 ? 12 : 6;

  return (
    <Section tone={place.tone} {...rootProps("sector_grid", place)}>
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tx(ctx, c.heading)} intro={tx(ctx, c.intro)} className="max-w-[700px]" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {cards.map((card, i) => (
            <li key={i} className="flex lg:col-span-4">
              {card.image ? (
                <SmartLink href={card.href} className={cn(CARD, "w-full overflow-hidden rounded-[22px] lg:rounded-[26px]")}>
                  <span className="block h-[200px] overflow-hidden bg-ink lg:h-[250px]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      width={800}
                      height={600}
                      className="v2-zoom block h-full w-full object-cover"
                    />
                  </span>
                  <span className="flex grow items-end gap-3.5 pt-5 pe-5 pb-[22px] ps-[22px] lg:pt-[22px] lg:pe-[22px] lg:pb-6 lg:ps-6">
                    <span className="flex min-w-0 grow flex-col gap-1.5">
                      <span className="v2-title text-[19px] leading-tight lg:text-[21px]">{card.title}</span>
                      {card.line && <span className="v2-copy text-[15px] text-body">{card.line}</span>}
                    </span>
                    <ArrowBadge size={40} />
                  </span>
                </SmartLink>
              ) : (
                <SmartLink href={card.href} className={cn(CARD, "w-full gap-1.5 rounded-[22px] p-[26px]")}>
                  <span className="v2-title text-[19px] leading-tight lg:text-xl">{card.title}</span>
                  {card.line && <span className="v2-copy text-[15px] text-body">{card.line}</span>}
                </SmartLink>
              )}
            </li>
          ))}
          {other.title && (
            <li className={cn("flex", FILL_SPAN_MD[fillMd], FILL_SPAN[fillLg])}>
              <SmartLink
                href={other.href}
                className="group v2-lift flex w-full items-center gap-6 rounded-[22px] bg-sky py-6 pe-6 ps-6 text-ink no-underline outline-brand focus-visible:outline-3 focus-visible:outline-offset-3 lg:py-[26px] lg:pe-[26px] lg:ps-8"
              >
                <span className="flex min-w-0 grow flex-col gap-1.5">
                  <span className="v2-title text-xl leading-tight lg:text-[22px]">{other.title}</span>
                  {other.line && <span className="v2-copy text-[15px] text-body lg:text-base">{other.line}</span>}
                  {other.cta && <span className="sr-only">{other.cta}</span>}
                </span>
                <ArrowBadge size={46} tone="brand" />
              </SmartLink>
            </li>
          )}
        </ul>
      </Container>
    </Section>
  );
}
