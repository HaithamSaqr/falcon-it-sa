"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useSettings } from "@/components/providers/settings-provider";
import Container from "@/components/ui/container";

/* ------------------------------------------------------------------ */
/*  Social icons (inline SVGs)                                         */
/* ------------------------------------------------------------------ */

const SOCIAL_ICONS: Record<
  string,
  { label: string; path: string; viewBox?: string }
> = {
  linkedin: {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  twitter: {
    label: "X (Twitter)",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  facebook: {
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  instagram: {
    label: "Instagram",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z",
  },
  youtube: {
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
};

function SocialLink({
  platform,
  href,
}: {
  platform: string;
  href: string;
}) {
  const icon = SOCIAL_ICONS[platform];
  if (!icon || !href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={icon.label}
      className="inline-flex size-9 items-center justify-center rounded-lg text-text-on-dark/60 transition-colors hover:bg-white/10 hover:text-primary-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-[18px]"
        aria-hidden="true"
      >
        <path d={icon.path} />
      </svg>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer column                                                      */
/* ------------------------------------------------------------------ */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-on-dark">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-text-on-dark/60 transition-colors hover:text-primary-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer (main)                                                      */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const t = useTranslations();
  const { company, social } = useSettings();

  const aboutLinks = [
    { label: t("footer.aboutUs"), href: "/about" },
    { label: t("footer.blog"), href: "/blog" },
    { label: t("footer.careers"), href: "/careers" },
    { label: t("footer.partners"), href: "/partners" },
  ];

  const supportLinks = [
    { label: t("footer.faq"), href: "/faq" },
    { label: t("footer.helpCenter"), href: "/help" },
    { label: t("footer.chatSupport"), href: "/contact" },
    { label: t("footer.webinars"), href: "/webinars" },
  ];

  const productItems = NAV_ITEMS.find((item) => item.key === "products");
  const productLinks =
    "children" in (productItems ?? {})
      ? (productItems as Extract<typeof productItems, { children: unknown }>)!.children.map(
          (child) => ({
            label: t(`nav.${child.key}`),
            href: child.href,
          }),
        )
      : [];

  return (
    <footer className="bg-dark">
      <Container className="py-16">
        {/* Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/falcon-logo.png"
                alt="Falcon Smart Solutions"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-on-dark/60">
              {t("footer.description")}
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              {/* Phone */}
              <a
                href={`tel:${company.phone.ksa}`}
                className="flex items-center gap-2 text-sm text-text-on-dark/60 transition-colors hover:text-primary-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-.65 1.548l-.344.258a.25.25 0 00-.075.196c.186 1.613 1.08 3.742 3.392 5.313a.237.237 0 00.208.023l.384-.129a1.5 1.5 0 011.577.376l2.27 2.27A1.5 1.5 0 0113.5 18h-1.09a3.5 3.5 0 01-3.24-2.17l-.1-.253a14.254 14.254 0 01-3.648-3.648l-.253-.1A3.5 3.5 0 013 8.591V3.5z"
                    clipRule="evenodd"
                  />
                </svg>
                {company.phone.ksa}
              </a>

              {/* Email */}
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 text-sm text-text-on-dark/60 transition-colors hover:text-primary-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                {company.email}
              </a>
            </div>

            {/* Social icons */}
            <div className="mt-6 flex gap-1">
              {Object.entries(social).map(([platform, href]) => (
                <SocialLink key={platform} platform={platform} href={href} />
              ))}
            </div>
          </div>

          {/* Column 2 — About */}
          <FooterColumn title={t("footer.aboutFalcon")} links={aboutLinks} />

          {/* Column 3 — Support */}
          <FooterColumn title={t("footer.supportHub")} links={supportLinks} />

          {/* Column 4 — Products */}
          <FooterColumn title={t("footer.products")} links={productLinks} />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-text-on-dark/40">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>

            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-xs text-text-on-dark/40 transition-colors hover:text-primary-400"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-xs text-text-on-dark/40 transition-colors hover:text-primary-400"
              >
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
