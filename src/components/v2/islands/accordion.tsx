"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

export type AccordionItem = { question: string; answer: string };

type AccordionProps = {
  items: AccordionItem[];
  /** Index open on first render (the mobile mockup opens the first question). */
  defaultOpen?: number;
  className?: string;
};

/** Phone FAQ: one question open at a time, the whole row is the trigger. */
export default function Accordion({ items, defaultOpen = 0, className }: AccordionProps) {
  if (items.length === 0) return null;
  const first = items[defaultOpen] ? `q${defaultOpen}` : undefined;
  return (
    <RadixAccordion.Root type="single" collapsible defaultValue={first} className={className}>
      {items.map((item, i) => (
        <RadixAccordion.Item
          key={i}
          value={`q${i}`}
          className="shadow-[inset_0_-1px_0_rgba(11,26,51,0.1)]"
        >
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
          {item.answer && (
            <RadixAccordion.Content className="v2-accordion-content">
              <p className="v2-copy pb-[18px] text-[15px] text-body">{item.answer}</p>
            </RadixAccordion.Content>
          )}
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
