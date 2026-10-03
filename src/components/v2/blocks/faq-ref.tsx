import Container from "@/components/v2/ui/container";
import Section from "@/components/v2/ui/section";
import JsonLd from "@/components/v2/json-ld";
import Accordion from "@/components/v2/islands/accordion";
import { faqLd } from "@/lib/seo";
import { rootProps, type BlockProps } from "./context";
import { tx } from "./parts";

/**
 * Page questions. Desktop: heading beside the open list of answers (sector
 * mockup). Phones: an accordion with the first question open (mobile mockup).
 * Also emits FAQPage JSON-LD.
 */
export default function FaqRefBlock({ content: c, ctx, place }: BlockProps<"faq_ref">) {
  const heading = tx(ctx, c.heading);
  const items = c.items
    .map((it) => ({ question: tx(ctx, it.question), answer: tx(ctx, it.answer) }))
    .filter((it) => it.question !== "");
  const H = place.first ? "h1" : "h2";

  return (
    <Section tone={place.tone} {...rootProps("faq_ref", place)}>
      {items.length > 0 && <JsonLd data={faqLd(items.filter((it) => it.answer !== ""))} />}
      <Container className="grid items-start gap-3 lg:grid-cols-2 lg:gap-16 xl:gap-[72px]">
        <H className="v2-h2 mb-3 lg:mb-0">{heading}</H>
        <ul className="hidden flex-col gap-[30px] lg:flex">
          {items.map((it, i) => (
            <li key={i} className="flex flex-col gap-2">
              <h3 className="text-[19px] font-bold leading-snug [overflow-wrap:anywhere] rtl:font-semibold">{it.question}</h3>
              {it.answer && <p className="v2-copy text-base text-body">{it.answer}</p>}
            </li>
          ))}
        </ul>
        <Accordion items={items} className="lg:hidden" />
      </Container>
    </Section>
  );
}
