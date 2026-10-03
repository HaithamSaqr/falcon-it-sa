"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Classes added when the link matches the current page (or a page below it). */
  activeClassName?: string;
  onClick?: () => void;
};

/** True when `pathname` is `href` or a page below it (`/sectors` matches `/sectors/retail`). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Locale-aware nav link that marks the current page with `aria-current`. */
export default function NavLink({ href, children, className, activeClassName, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={pathname === href ? "page" : undefined}
      className={cn(className, active && activeClassName)}
    >
      {children}
    </Link>
  );
}
