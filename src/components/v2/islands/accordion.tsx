"use client";

import type { ReactNode } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

/** Server-rendered question and answer (null answer: a plain row, no trigger). */
export type AccordionItem = { question: ReactNode; answer: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

const ROW = "shadow-[inset_0_-1px_0_rgba(11,26,51,0.1)]";

const hasContent = (n: ReactNode) => n !== null && n !== undefined && n !== false && n !== "";

/** Phone FAQ: one question open at a time (the first answered one at first), the whole row is the trigger. */
export default function Accordion({ items, className }: AccordionProps) {
  if (items.length === 0) return null;
  const firstAnswered = items.findIndex((it) => hasContent(it.answer));
  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      defaultValue={firstAnswered >= 0 ? `q${firstAnswered}` : undefined}
      className={className}
    >
      {items.map((item, i) => {
        if (!hasContent(item.answer)) {
          // Nothing to expand: a plain row, not a button.
          return (
            <h3 key={i} className={`${ROW} py-4 text-base font-bold text-ink [overflow-wrap:anywhere] rtl:font-semibold`}>
              {item.question}
            </h3>
          );
        }
        return (
          <RadixAccordion.Item key={i} value={`q${i}`} className={ROW}>
            <RadixAccordion.Header asChild>
              <h3>
                <RadixAccordion.Trigger className="group flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-3 py-3.5 text-start text-base font-bold text-ink outline-brand focus-visible:outline-3 focus-visible:outline-offset-3 rtl:font-semibold">
                  <span className="[overflow-wrap:anywhere]">{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-sky text-brand"
                  >
                    <PlusIcon size={16} weight="bold" className="group-data-[state=open]:hidden" />
                    <MinusIcon size={16} weight="bold" className="hidden group-data-[state=open]:block" />
                  </span>
                </RadixAccordion.Trigger>
              </h3>
            </RadixAccordion.Header>
            <RadixAccordion.Content className="v2-accordion-content">
              <p className="v2-copy pb-[18px] text-[15px] text-body">{item.answer}</p>
            </RadixAccordion.Content>
          </RadixAccordion.Item>
        );
      })}
    </RadixAccordion.Root>
  );
}
