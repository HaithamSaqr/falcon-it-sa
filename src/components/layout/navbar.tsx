"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";
import LanguageToggle from "@/components/layout/language-toggle";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NavItem = (typeof NAV_ITEMS)[number];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Desktop dropdown for nav items with children */
function DesktopDropdown({
  item,
  t,
  pathname,
}: {
  item: Extract<NavItem, { children: readonly { key: string; href: string }[] }>;
  t: ReturnType<typeof useTranslations>;
  pathname: string;
}) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
          pathname.startsWith(item.href)
            ? "text-primary-500"
            : "text-text-primary hover:text-primary-500",
        )}
      >
        {t(`nav.${item.key}`)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4 transition-transform group-hover:rotate-180"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* Dropdown panel */}
      <div
        className={cn(
          "pointer-events-none invisible absolute start-0 top-full z-50 pt-2 opacity-0",
          "transition-all duration-200",
          "group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100",
        )}
      >
        <div className="min-w-[220px] rounded-2xl bg-white p-2 shadow-card">
          {item.children.map((child) => (
            <Link
              key={child.key}
              href={child.href}
              className={cn(
                "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                pathname === child.href
                  ? "bg-primary-50 text-primary-500"
                  : "text-text-primary hover:bg-primary-50 hover:text-primary-500",
              )}
            >
              {t(`nav.${child.key}`)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Single desktop nav link (no children) */
function DesktopNavLink({
  item,
  t,
  pathname,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
  pathname: string;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors",
        pathname === item.href
          ? "text-primary-500"
          : "text-text-primary hover:text-primary-500",
      )}
    >
      {t(`nav.${item.key}`)}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile menu                                                        */
/* ------------------------------------------------------------------ */

function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />

        {/* Panel */}
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 z-50 w-full max-w-sm bg-white shadow-xl",
            "flex flex-col",
            "focus:outline-none",
            isRTL ? "start-0" : "start-0",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-start",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-start",
            "duration-300",
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Dialog.Title className="sr-only">
            {t("nav.mobileMenu")}
          </Dialog.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <Link href="/" onClick={() => onOpenChange(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/falcon-logo.png"
                alt="Falcon Smart Solutions"
                className="h-10 w-auto"
              />
            </Link>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-text-secondary hover:bg-gray-100"
                aria-label={t("common.close")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-50 text-primary-500"
                        : "text-text-primary hover:bg-gray-50",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>

                  {/* Sub-items */}
                  {"children" in item &&
                    item.children.map((child) => (
                      <Link
                        key={child.key}
                        href={child.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "block rounded-xl py-2.5 ps-8 pe-4 text-sm font-medium transition-colors",
                          pathname === child.href
                            ? "text-primary-500"
                            : "text-text-secondary hover:text-primary-500",
                        )}
                      >
                        {t(`nav.${child.key}`)}
                      </Link>
                    ))}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="border-t px-4 py-4 space-y-3">
            <LanguageToggle className="w-full justify-center" />

            <Button variant="outline" href="/login" className="w-full">
              {t("nav.login")}
            </Button>

            <Button variant="cta" href="/demo" className="w-full">
              {t("nav.startTrial")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar (main)                                                      */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
        scrolled && "shadow-navbar",
      )}
    >
      <Container className="flex h-16 items-center justify-between lg:h-[72px]">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logos/falcon-logo.png"
            alt="Falcon Smart Solutions"
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        {/* Desktop navigation (center) */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {NAV_ITEMS.map((item) =>
            "children" in item ? (
              <DesktopDropdown
                key={item.key}
                item={item}
                t={t}
                pathname={pathname}
              />
            ) : (
              <DesktopNavLink
                key={item.key}
                item={item}
                t={t}
                pathname={pathname}
              />
            ),
          )}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <LanguageToggle />

          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary-500"
          >
            {t("nav.login")}
          </Link>

          <Button variant="cta" size="sm" href="/demo">
            {t("nav.startTrial")}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-text-primary hover:bg-gray-100 lg:hidden"
          aria-label={t("nav.openMenu")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile menu (Radix Dialog) */}
        <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
      </Container>
    </header>
  );
}
