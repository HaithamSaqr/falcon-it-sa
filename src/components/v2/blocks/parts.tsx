import type { ElementType, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { pickBi, pickBiLang, type Bi } from "@/lib/blocks/bi";
import { boldRuns, splitHighlight } from "@/lib/blocks/text";
import { demoHref } from "@/lib/blocks/cta";
import { isExternalHref, isLocaleRoute } from "@/lib/href";
import { cn } from "@/lib/utils";
import Button, { ButtonContent, buttonClasses, type ButtonSize } from "@/components/v2/ui/button";
import Icon from "@/components/v2/ui/icon";
import { RoleCtaLink } from "@/components/v2/islands/role-provider";
import type { RenderContext } from "./context";

/** Locale side of a bilingual value, falling back to the other language, never undefined. */
export function tx(ctx: RenderContext, v: Bi | null | undefined): string {
  return pickBi(v, ctx.locale);
}

/** Marks text shown in the other language with its own `lang` and `dir` (bidi-isolated). */
export function Lang({ lang, children }: { lang: "en" | "ar"; children: ReactNode }) {
  return (
    <span lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      {children}
    </span>
  );
}

/**
 * Display node for a bilingual value: the locale text, or the other
 * language's text wrapped in <Lang> when the locale side is blank. null when both are empty.
 */
export function tn(ctx: RenderContext, v: Bi | null | undefined): ReactNode {
  const r = pickBiLang(v, ctx.locale);
  if (!r.text) return null;
  return r.fallback ? <Lang lang={r.lang}>{r.text}</Lang> : r.text;
}

/**
 * Wraps already-built content for a bilingual value in <Lang> when that value
 * is shown in the other language. Inline, so the block keeps the page's alignment.
 */
export function withLang(ctx: RenderContext, v: Bi | null | undefined, node: ReactNode): ReactNode {
  const r = pickBiLang(v, ctx.locale);
  return r.fallback ? <Lang lang={r.lang}>{node}</Lang> : node;
}

/** Headline with its closing clause in brand blue (hero H1s). */
export function Highlighted({ ctx, value }: { ctx: RenderContext; value: Bi | null | undefined }) {
  const r = pickBiLang(value, ctx.locale);
  const [lead, accent] = splitHighlight(r.text);
  const body = !accent ? (
    <>{lead}</>
  ) : (
    <>
      {lead}
      <span className={cn("text-brand", accent.length <= 24 && "sm:whitespace-nowrap")}>{accent}</span>
    </>
  );
  return r.fallback ? <Lang lang={r.lang}>{body}</Lang> : body;
}

/** Admin text with `**bold**` runs; everything else is plain (escaped) text. */
export function RichLine({ text }: { text: string }) {
  return (
    <>
      {boldRuns(text).map((r, i) =>
        r.bold ? (
          <strong key={i} className="font-bold text-ink rtl:font-semibold">
            {r.text}
          </strong>
        ) : (
          <span key={i}>{r.text}</span>
        ),
      )}
    </>
  );
}

type SectionHeadProps = {
  heading: ReactNode;
  intro?: ReactNode;
  /** h1 for the first block on a page, h2 otherwise. */
  as?: ElementType;
  className?: string;
  headingClassName?: string;
  introClassName?: string;
  children?: ReactNode;
};

/** Section heading and its intro line (mockup: 52px heading, 19px intro, 14px apart). */
export function SectionHead({
  heading,
  intro,
  as: H = "h2",
  className,
  headingClassName,
  introClassName,
  children,
}: SectionHeadProps) {
  return (
    <div className={cn("flex max-w-[760px] flex-col gap-3.5", className)}>
      <H className={cn("v2-h2", headingClassName)}>{heading}</H>
      {intro && <p className={cn("v2-copy text-[15px] text-body md:text-[17px] lg:text-[19px]", introClassName)}>{intro}</p>}
      {children}
    </div>
  );
}

/** Brand check mark used in point lists. */
export function Check({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 text-brand", className)} style={{ width: size, height: size }}>
      <Icon name="Check" size={size} />
    </span>
  );
}

/** Round arrow badge at the end of a card. */
export function ArrowBadge({ size = 40, tone = "sky" }: { size?: 34 | 40 | 46; tone?: "sky" | "brand" }) {
  const icon = size === 46 ? 18 : size === 34 ? 15 : 16;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "v2-icon-nudge inline-flex shrink-0 items-center justify-center rounded-full",
        tone === "sky" ? "bg-sky text-brand" : "bg-brand text-white",
      )}
      style={{ width: size, height: size }}
    >
      <Icon name="ArrowUpRight" size={icon} />
    </span>
  );
}

/** Link that is a locale route, an in-page anchor or an external URL. */
export function SmartLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  if (isLocaleRoute(href)) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Primary "Book a demo" style CTA. `/demo` (or no link) goes to the configured
 * demo url; on sector pages it carries `?sector=&role=` and follows the role switcher.
 */
export function PrimaryCta({
  ctx,
  label,
  href,
  size = "lg",
  className,
}: {
  ctx: RenderContext;
  label: ReactNode;
  href: string;
  size?: ButtonSize;
  className?: string;
}) {
  if (label === null || label === undefined || label === "") return null;
  const target = demoHref(href, ctx.demoUrl);
  const isDemo = target === ctx.demoUrl;
  if (isDemo && ctx.sector) {
    return (
      <RoleCtaLink base={ctx.demoUrl} sector={ctx.sector.id} className={buttonClasses("primary", size, className)}>
        <ButtonContent size={size}>{label}</ButtonContent>
      </RoleCtaLink>
    );
  }
  return (
    <Button href={target} size={size} className={className}>
      {label}
    </Button>
  );
}

/**
 * Secondary hero CTA: WhatsApp links get the WhatsApp glyph (home mockup),
 * everything else is an underlined text link (sector mockup).
 */
export function SecondaryCta({ label, href, className }: { label: ReactNode; href: string; className?: string }) {
  if (!label || !href) return null;
  const whatsapp = /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href);
  if (whatsapp) {
    return (
      <SmartLink
        href={href}
        className={cn(
          "inline-flex items-center gap-2 rounded-full text-base font-semibold text-ink no-underline outline-brand transition-colors duration-200 hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-3 rtl:font-medium",
          className,
        )}
      >
        <Icon name="WhatsappLogo" size={22} />
        <span>{label}</span>
      </SmartLink>
    );
  }
  return (
    <SmartLink
      href={href}
      className={cn(
        "text-base font-medium text-ink underline decoration-[#9FB6CF] underline-offset-8 outline-brand transition-colors duration-200 hover:text-brand focus-visible:outline-3 focus-visible:outline-offset-3",
        className,
      )}
    >
      {label}
    </SmartLink>
  );
}

/** Inline text link in brand blue (section links such as "How we set it up"). */
export function InlineLink({ label, href, className }: { label: ReactNode; href: string; className?: string }) {
  if (!label || !href) return null;
  return (
    <SmartLink
      href={href}
      className={cn(
        "self-start rounded text-base font-bold text-brand no-underline outline-brand transition-colors duration-200 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 rtl:font-semibold",
        className,
      )}
    >
      {label}
    </SmartLink>
  );
}
