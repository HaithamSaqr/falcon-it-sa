"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import LanguageToggle from "@/components/layout/language-toggle";
import NavLink from "@/components/layout/nav-link";
import { usePathname } from "@/i18n/navigation";

export type MenuLink = { href: string; label: string };

type MobileMenuProps = {
  /** Primary links (Sectors first, then the rest). */
  links: MenuLink[];
  /** Sector links listed under the Sectors entry. */
  sectors: MenuLink[];
  /** Server-rendered logo link and primary CTA (kept out of the client bundle's icon set). */
  logo: ReactNode;
  cta: ReactNode;
  labels: { open: string; close: string; title: string };
};

const ROUND_BUTTON =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EEF2F7] text-ink transition-colors duration-200 hover:bg-sky outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";

/** Phone and tablet menu: a sheet in the island style, focus trapped by Radix Dialog. */
export default function MobileMenu({ links, sectors, logo, cta, labels }: MobileMenuProps) {
  const pathname = usePathname();
  // Remember the page the sheet was opened on: navigating anywhere closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);
  // Any link inside the sheet (including the same page) closes it.
  const closeOnLink = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) close();
  };
  const [first, ...rest] = links;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpenedOn(next ? pathname : null)}>
      <Dialog.Trigger asChild>
        <button type="button" aria-label={labels.open} className={ROUND_BUTTON}>
          <ListIcon size={20} weight="light" aria-hidden />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="v2-overlay fixed inset-0 z-[60] bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          onClick={closeOnLink}
          className="v2-sheet fixed inset-x-3 top-3 z-[60] flex max-h-[calc(100dvh-24px)] flex-col overflow-y-auto rounded-[28px] bg-surface p-1.5 text-ink shadow-[0_0_0_1px_rgba(11,26,51,0.06),0_30px_60px_-30px_rgba(12,60,120,0.45)] focus:outline-none"
        >
          <Dialog.Title className="sr-only">{labels.title}</Dialog.Title>

          <div className="flex h-14 shrink-0 items-center justify-between ps-2.5">
            {logo}
            <Dialog.Close asChild>
              <button type="button" aria-label={labels.close} className={ROUND_BUTTON}>
                <XIcon size={20} weight="light" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label={labels.title} className="px-2.5 pb-2 pt-3">
            {first && (
              <>
                <NavLink
                  href={first.href}
                  className="flex min-h-12 items-center text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink no-underline"
                  activeClassName="text-brand"
                >
                  {first.label}
                </NavLink>
                <ul className="mb-3 mt-1 grid gap-0.5 border-s border-ink/10 ps-4">
                  {sectors.map((s) => (
                    <li key={s.href}>
                      <NavLink
                        href={s.href}
                              className="flex min-h-11 items-center text-[15px] leading-snug text-body no-underline hover:text-brand"
                        activeClassName="font-semibold text-brand"
                      >
                        {s.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <ul className="grid">
              {rest.map((l) => (
                <li key={l.href} className="shadow-[inset_0_1px_0_rgba(11,26,51,0.08)]">
                  <NavLink
                    href={l.href}
                      className="flex min-h-14 items-center text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink no-underline"
                    activeClassName="text-brand"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-2 rounded-[22px] bg-page p-2">
            <LanguageToggle className="min-h-11 justify-center rounded-full" />
            <div className="grid [&>*]:w-full [&>*]:justify-between">
              {cta}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
