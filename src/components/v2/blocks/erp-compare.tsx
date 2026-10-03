import Image from "next/image";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import type { ErpCompareContent } from "@/lib/blocks/schemas/erp_compare";
import { rootProps, type BlockProps, type RenderContext } from "./context";
import { InlineLink, SectionHead, tn, tx } from "./parts";

const SIDES = {
  odoo: { band: "bg-odoo-tint", chip: "text-[#5E3E57]", logo: "h-[46px] lg:h-[58px]", gap: "gap-[22px]" },
  falcon: { band: "bg-[#EAF3FB]", chip: "text-brand-deep", logo: "h-[88px] lg:h-[112px]", gap: "gap-4" },
} as const;

function Card({ card, side, ctx }: { card: ErpCompareContent["odoo"]; side: keyof typeof SIDES; ctx: RenderContext }) {
  const s = SIDES[side];
  const chips = card.chips.filter((x) => tx(ctx, x) !== "").map((x) => tn(ctx, x));
  const points = card.points.filter((x) => tx(ctx, x) !== "").map((x) => tn(ctx, x));
  const body = tn(ctx, card.body);
  return (
    <article className="rounded-[26px] bg-[#EAEFF5] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.05)] sm:rounded-[32px] sm:p-2">
      <div className="h-full overflow-hidden rounded-[20px] bg-surface shadow-[0_1px_2px_rgba(11,26,51,0.05)] sm:rounded-[25px]">
        <div className={cn("flex min-h-[200px] flex-col items-center justify-center px-5 py-8 lg:h-[250px] lg:py-0", s.band, s.gap)}>
          {card.logo && (
            <Image
              src={card.logo}
              alt={tx(ctx, card.logoAlt) || tx(ctx, card.title)}
              width={400}
              height={140}
              className={cn("w-auto mix-blend-multiply", s.logo)}
            />
          )}
          {chips.length > 0 && (
            <ul className={cn("flex max-w-[420px] flex-wrap justify-center gap-2 text-[13px] font-semibold", s.chip)}>
              {chips.map((chip, i) => (
                <li key={i} className="rounded-full bg-surface px-3 py-1.5 leading-tight">
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6 sm:pt-[34px] sm:pe-9 sm:pb-9 sm:ps-9">
          <h3 className="text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] [overflow-wrap:anywhere] lg:text-[26px] rtl:font-bold rtl:leading-[1.4] rtl:tracking-normal">
            {tn(ctx, card.title)}
          </h3>
          {body && <p className="v2-copy text-base text-body lg:text-[17px]">{body}</p>}
          {points.length > 0 && (
            <ul className="v2-copy flex list-disc flex-col gap-2 ps-5 text-base text-body lg:text-[17px] lg:leading-normal">
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
          <InlineLink label={tn(ctx, card.link.label)} href={card.link.href} />
        </div>
      </div>
    </article>
  );
}

/** "Two ERPs. One honest recommendation.": Odoo and Falcon ERP side by side. */
export default function ErpCompareBlock({ content: c, ctx, place }: BlockProps<"erp_compare">) {
  return (
    <Section tone={place.tone} {...rootProps("erp_compare", place)}>
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tn(ctx, c.heading)} intro={tn(ctx, c.intro)} />
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          <Card card={c.odoo} side="odoo" ctx={ctx} />
          <Card card={c.falcon} side="falcon" ctx={ctx} />
        </div>
      </Container>
    </Section>
  );
}
