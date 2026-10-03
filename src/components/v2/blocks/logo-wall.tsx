import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { InlineLink, tx } from "./parts";

/** Client logo strip: a quiet line and greyed logos (clients table). Tucks under a hero. */
export default function LogoWallBlock({ content: c, ctx, place }: BlockProps<"logo_wall">) {
  const logos = ctx.clients.filter((l) => l.logo).slice(0, c.limit);
  const heading = tx(ctx, c.heading);
  if (logos.length === 0) return null;
  const cols = Math.min(logos.length, 8);

  return (
    <Section
      tone={place.afterHero ? "page" : place.tone}
      className={place.afterHero ? "pt-0 pb-14 md:pt-0 md:pb-20 lg:pt-2 lg:pb-[88px]" : undefined}
      aria-label={heading}
      {...rootProps("logo_wall", place)}
    >
      <Container className="flex flex-col gap-4 lg:gap-[22px]">
        {heading && <h2 className="text-[13px] font-normal leading-normal tracking-normal text-muted lg:text-sm">{heading}</h2>}
        {tx(ctx, c.intro) && <p className="v2-copy text-[15px] text-body">{tx(ctx, c.intro)}</p>}
        <ul
          className="grid grid-cols-4 items-center gap-x-[18px] gap-y-6 md:gap-x-8 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] lg:gap-9"
          style={{ "--cols": cols } as CSSProperties}
        >
          {logos.map((l, i) => (
            <li key={`${l.logo}-${i}`} className={cn("flex justify-center", i >= 8 && "max-lg:hidden")}>
              <Image
                src={l.logo}
                alt={l.name}
                width={180}
                height={60}
                className="v2-logo h-[28px] w-full object-contain lg:h-[36px]"
              />
            </li>
          ))}
        </ul>
        <InlineLink label={tx(ctx, c.link.label)} href={c.link.href} className="mt-2" />
      </Container>
    </Section>
  );
}
