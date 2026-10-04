import { cn } from "@/lib/utils";
import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import { rootProps, type BlockProps } from "./context";
import { Check, InlineLink, SectionHead, tn, tx } from "./parts";

/** "An ERP is only as good as its setup.": the argument on one side, problem and fix rows on the other. */
export default function SetupListBlock({ content: c, ctx, place }: BlockProps<"setup_list">) {
  const points = c.points
    .filter((p) => tx(ctx, p.problem) !== "")
    .map((p) => ({ problem: tn(ctx, p.problem), fix: tn(ctx, p.fix) }));

  return (
    <Section tone={place.tone} className="lg:py-[120px]" {...rootProps("setup_list", place)}>
      <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <SectionHead
          as={place.first ? "h1" : "h2"}
          heading={tn(ctx, c.heading)}
          intro={tn(ctx, c.intro)}
          className="gap-[22px]"
          introClassName="max-w-[460px] lg:leading-[1.6]"
        >
          <InlineLink label={tn(ctx, c.link.label)} href={c.link.href} />
        </SectionHead>
        <ul className="flex min-w-0 flex-col">
          {points.map((p, i) => (
            <li
              key={i}
              className={cn(
                "grid grid-cols-[36px_minmax(0,1fr)] gap-2 lg:grid-cols-[48px_minmax(0,1fr)]",
                i === 0 ? "pb-6 lg:pb-[30px]" : "py-6 shadow-[inset_0_1px_0_rgba(11,26,51,0.08)] lg:py-[30px]",
                i === points.length - 1 && i !== 0 && "pb-0 lg:pb-0",
              )}
            >
              <Check size={26} />
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-lg font-bold leading-snug [overflow-wrap:anywhere] lg:text-xl rtl:font-semibold">
                  {p.problem}
                </span>
                {p.fix && <span className="v2-copy text-[15px] text-body lg:text-[17px] lg:leading-[1.6]">{p.fix}</span>}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
