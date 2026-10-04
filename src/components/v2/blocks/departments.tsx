import Image from "next/image";
import { canOptimize, isScreenshot, screenshotSize } from "@/lib/image-src";
import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import Icon from "@/components/v2/ui/icon";
import { rootProps, type BlockProps } from "./context";
import { SectionHead, tn, tx } from "./parts";

/**
 * "One system. Every department.": heading, intro and a two-column list of
 * departments, with an optional framed photo beside it (home). Without a
 * photo the list runs full width in up to four columns.
 */
export default function DepartmentsBlock({ content: c, ctx, place }: BlockProps<"departments">) {
  const items = c.items
    .filter((it) => tx(ctx, it.title) !== "")
    .map((it) => ({ icon: it.icon, title: tn(ctx, it.title), line: tn(ctx, it.line) }));
  const image = c.image ?? "";

  const list = (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:gap-y-[26px]",
        !image && "lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          {/* Fixed slot: an unknown icon name renders nothing but keeps the text aligned. */}
          <span className="mt-[3px] inline-flex size-5 shrink-0 text-brand">
            <Icon name={it.icon} size={20} />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="v2-title text-[17px] font-bold leading-snug tracking-normal lg:text-lg">{it.title}</span>
            {it.line && <span className="v2-copy text-[15px] text-body">{it.line}</span>}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <Section tone={place.tone} {...rootProps("departments", place)}>
      <Container
        className={cn(
          "grid gap-12",
          image && "items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-[72px]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-9">
          <SectionHead
            as={place.first ? "h1" : "h2"}
            heading={tn(ctx, c.heading)}
            intro={tn(ctx, c.intro)}
            introClassName="max-w-[520px]"
          />
          {list}
        </div>
        {image && (
          <div className="rounded-[26px] bg-ink/[0.035] p-1.5 shadow-[inset_0_0_0_1px_rgba(11,26,51,0.06)] sm:rounded-[32px] sm:p-2">
            <div
              className={cn(
                "overflow-hidden rounded-[20px] shadow-[0_40px_80px_-40px_rgba(12,60,120,0.45)] sm:rounded-[25px]",
                isScreenshot(image) ? "bg-surface" : "bg-[#16151F]",
              )}
            >
              {isScreenshot(image) ? (
                // A real product screen: whole, at its own aspect ratio.
                <Image
                  src={image}
                  alt={tx(ctx, c.imageAlt)}
                  width={screenshotSize(image)[0]}
                  height={screenshotSize(image)[1]}
                  sizes="(min-width: 1280px) 580px, (min-width: 1024px) 48vw, calc(100vw - 40px)"
                  unoptimized={!canOptimize(image)}
                  className="block h-auto w-full object-contain"
                />
              ) : (
                <Image
                  src={image}
                  alt={tx(ctx, c.imageAlt)}
                  width={1120}
                  height={1000}
                  sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, calc(100vw - 40px)"
                  unoptimized={!canOptimize(image)}
                  className="block h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px] xl:h-[560px]"
                />
              )}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
