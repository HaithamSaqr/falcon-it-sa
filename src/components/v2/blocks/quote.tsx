import Image from "next/image";
import { canOptimize } from "@/lib/image-src";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { tn, tx, withLang } from "./parts";

/** One real client quote in a quiet card, with the client logo beside it. */
export default function QuoteBlock({ content: c, ctx, place }: BlockProps<"quote">) {
  const text = tx(ctx, c.text);
  const name = tx(ctx, c.name);
  const role = tx(ctx, c.role);
  const company = tx(ctx, c.company);
  const by =
    role && company
      ? ctx.labels.quoteRole.replace("{role}", role).replace("{company}", company)
      : role || company;
  const [open, close] = ctx.locale === "ar" ? ["«", "»"] : ["“", "”"];
  const label = name || company || text.slice(0, 60);

  return (
    <Section tone={place.tone} aria-label={label} {...rootProps("quote", place)}>
      <Container>
        <figure
          className={cn(
            "grid items-center gap-8 rounded-[26px] p-7 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] sm:rounded-[32px] sm:p-10 lg:px-16 lg:py-14",
            place.tone === "surface" ? "bg-page" : "bg-surface",
            c.logo && "lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-16",
          )}
        >
          <div className="flex min-w-0 flex-col gap-[22px]">
            <blockquote className="text-2xl font-bold leading-[1.25] tracking-[-0.02em] [overflow-wrap:anywhere] lg:text-[34px] rtl:font-semibold rtl:leading-[1.65] rtl:tracking-normal rtl:lg:text-[28px]">
              {withLang(
                ctx,
                c.text,
                <>
                  {open}
                  {text}
                  {close}
                </>,
              )}
            </blockquote>
            {(name || by) && (
              <figcaption className="text-base text-body">
                {name && <span className="font-bold text-ink rtl:font-semibold">{tn(ctx, c.name)}</span>}
                {name && by && (ctx.locale === "ar" ? "، " : ", ")}
                {by}
              </figcaption>
            )}
          </div>
          {c.logo && (
            <div className="flex h-[72px] items-center justify-center rounded-2xl p-3 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.12)] max-lg:max-w-[200px]">
              <Image
                src={c.logo}
                alt={tx(ctx, c.logoAlt) || company}
                width={200}
                height={72}
                unoptimized={!canOptimize(c.logo)}
                className="h-full w-auto object-contain"
              />
            </div>
          )}
        </figure>
      </Container>
    </Section>
  );
}
