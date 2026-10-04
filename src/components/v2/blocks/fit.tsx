import Image from "next/image";
import { canOptimize } from "@/lib/image-src";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import type { FitContent } from "@/lib/blocks/schemas/fit";
import { rootProps, type BlockProps, type RenderContext } from "./context";
import { SectionHead, tn, tx } from "./parts";

// The two systems' official logos (brand marks, not editable copy); the option name is the alt text.
const LOGOS = {
  odoo: { src: "/images/v2/logo-odoo.png", width: 621, height: 196, className: "my-1 h-8 lg:my-3 lg:h-10" },
  falcon: { src: "/images/v2/logo-falcon-erp.png", width: 432, height: 433, className: "h-14 lg:h-16" },
} as const;

function Option({ option, side, ctx }: { option: FitContent["odoo"]; side: keyof typeof LOGOS; ctx: RenderContext }) {
  const logo = LOGOS[side];
  const when = tn(ctx, option.when);
  const points = option.points.filter((p) => tx(ctx, p) !== "").map((p) => tn(ctx, p));
  return (
    <article className="rounded-[26px] bg-[#EDF0F4] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.05)] sm:rounded-[32px] sm:p-2">
      <div className="flex h-full flex-col gap-4 rounded-[20px] bg-surface p-6 sm:rounded-[25px] lg:gap-5 lg:px-[38px] lg:py-9">
        <Image
          src={logo.src}
          alt={tx(ctx, option.name)}
          width={logo.width}
          height={logo.height}
          unoptimized={!canOptimize(logo.src)}
          className={cn("w-auto self-start mix-blend-multiply", logo.className)}
        />
        {when && (
          <h3 className="text-[21px] font-bold leading-[1.2] tracking-[-0.015em] [overflow-wrap:anywhere] lg:text-2xl rtl:font-semibold rtl:leading-[1.45] rtl:tracking-normal rtl:lg:text-[25px]">
            {when}
          </h3>
        )}
        {points.length > 0 && (
          <ul className="v2-copy flex list-disc flex-col gap-2.5 ps-5 text-base text-body lg:text-[17px] rtl:leading-[1.75]">
            {points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** "Odoo or Falcon? We will tell you plainly.": when each system fits this sector. */
export default function FitBlock({ content: c, ctx, place }: BlockProps<"fit">) {
  const closing = tn(ctx, c.closing);
  return (
    <Section tone={place.tone} {...rootProps("fit", place)}>
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHead as={place.first ? "h1" : "h2"} heading={tn(ctx, c.heading)} intro={tn(ctx, c.intro)} className="max-w-[800px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          <Option option={c.odoo} side="odoo" ctx={ctx} />
          <Option option={c.falcon} side="falcon" ctx={ctx} />
        </div>
        {closing && <p className="v2-copy max-w-[760px] text-[17px] text-body">{closing}</p>}
      </Container>
    </Section>
  );
}
