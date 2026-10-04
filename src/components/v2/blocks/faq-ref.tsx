import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import JsonLd from "@/components/v2/json-ld";
import Accordion from "@/components/v2/islands/accordion";
import { faqLd } from "@/lib/seo";
import { rootProps, type BlockProps } from "./context";
import { tn, tx } from "./parts";

/**
 * Page questions. Desktop: heading beside the open list of answers (sector
 * mockup). Phones: an accordion with the first answered question open (mobile
 * mockup). Also emits FAQPage JSON-LD for the answered questions.
 */
export default function FaqRefBlock({ content: c, ctx, place }: BlockProps<"faq_ref">) {
  const items = c.items.filter((it) => tx(ctx, it.question).trim() !== "");
  const answered = items.filter((it) => tx(ctx, it.answer).trim() !== "");
  const H = place.first ? "h1" : "h2";

  return (
    <Section tone={place.tone} {...rootProps("faq_ref", place)}>
      {answered.length > 0 && (
        <JsonLd data={faqLd(answered.map((it) => ({ question: tx(ctx, it.question), answer: tx(ctx, it.answer) })))} />
      )}
      <Container className="grid items-start gap-3 lg:grid-cols-2 lg:gap-16 xl:gap-[72px]">
        <H className="v2-h2 mb-3 lg:mb-0">{tn(ctx, c.heading)}</H>
        <ul className="hidden flex-col gap-[30px] lg:flex">
          {items.map((it, i) => (
            <li key={i} className="flex flex-col gap-2">
              <h3 className="text-[19px] font-bold leading-snug [overflow-wrap:anywhere] rtl:font-semibold">
                {tn(ctx, it.question)}
              </h3>
              {tx(ctx, it.answer) && <p className="v2-copy text-base text-body">{tn(ctx, it.answer)}</p>}
            </li>
          ))}
        </ul>
        <Accordion
          items={items.map((it) => ({ question: tn(ctx, it.question), answer: tn(ctx, it.answer) }))}
          className="lg:hidden"
        />
      </Container>
    </Section>
  );
}
