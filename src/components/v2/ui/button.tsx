import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Icon from "./icon";

export type ButtonVariant = "primary" | "ghost" | "link";
export type ButtonSize = "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Trailing arrow. Defaults to on for `primary`, off for `ghost` and `link`. */
  withArrow?: boolean;
  className?: string;
  /** The label. A button with an empty label renders nothing. */
  children?: ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type NativeButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = AnchorProps | NativeButtonProps;

const BASE =
  "v2-press group inline-flex items-center font-bold no-underline outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";

const VARIANTS: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    md: "h-[46px] gap-2.5 rounded-full bg-brand ps-5 pe-1.5 text-[15px] text-white hover:bg-brand-deep",
    lg: "h-[58px] gap-3 rounded-full bg-brand ps-[26px] pe-2 text-[17px] text-white hover:bg-brand-deep",
  },
  ghost: {
    md: "h-[46px] gap-2 rounded-full bg-surface px-5 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.12)] hover:bg-sky",
    lg: "h-[58px] gap-2 rounded-full bg-surface px-[26px] text-[17px] font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(11,26,51,0.12)] hover:bg-sky",
  },
  link: {
    md: "gap-1.5 text-[15px] font-semibold text-brand hover:text-ink",
    lg: "gap-2 text-[17px] font-semibold text-brand hover:text-ink",
  },
};

const CIRCLE: Record<ButtonSize, string> = {
  md: "size-[34px]",
  lg: "size-[42px]",
};

function isEmptyLabel(children: ReactNode): boolean {
  if (children === null || children === undefined || typeof children === "boolean") return true;
  if (typeof children === "string") return children.trim() === "";
  if (Array.isArray(children)) return children.every(isEmptyLabel);
  return false;
}

/** Internal (`/path`) links go through the locale-aware Link; everything else is a plain anchor. */
function isInternal(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Pill CTA. Primary has the brand fill with a nested arrow circle. */
export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    withArrow = variant === "primary",
    className,
    children,
    ...rest
  } = props;

  if (isEmptyLabel(children)) return null;

  const classes = cn(BASE, VARIANTS[variant][size], className);
  const iconSize = size === "lg" ? 18 : 16;

  const content = (
    <>
      <span>{children}</span>
      {withArrow &&
        (variant === "primary" ? (
          <span
            className={cn(
              "v2-icon-nudge inline-flex shrink-0 items-center justify-center rounded-full bg-white/15",
              CIRCLE[size],
            )}
          >
            <Icon name="ArrowUpRight" size={iconSize} />
          </span>
        ) : (
          <Icon name="ArrowUpRight" size={iconSize} className="v2-icon-nudge shrink-0" />
        ))}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as Omit<AnchorProps, keyof CommonProps>;
    if (isInternal(href)) {
      return (
        <Link href={href} className={classes} {...anchorRest}>
          {content}
        </Link>
      );
    }
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as Omit<NativeButtonProps, keyof CommonProps>;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
