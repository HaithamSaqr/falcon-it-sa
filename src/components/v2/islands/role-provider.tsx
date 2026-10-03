"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { isExternalHref, isLocaleRoute } from "@/lib/href";
import { sectorDemoHref } from "@/lib/blocks/cta";
import { cn } from "@/lib/utils";

/**
 * Shared role state for a sector page: the hero promise, the lit lifecycle
 * stages, the role summary, the pains and the booking link all follow it.
 * Server blocks render every role's content; these islands only choose what
 * shows, so the HTML is complete for the default role without JavaScript.
 */
export type RoleState = {
  role: string;
  setRole: (id: string) => void;
  /** True once the visitor has picked a role (drives the swap animations). */
  changed: boolean;
};

const RoleContext = createContext<RoleState | null>(null);

export function useRole(): RoleState | null {
  return useContext(RoleContext);
}

type RoleProviderProps = {
  /** Declared role ids, in order. */
  roles: string[];
  /** Starting role (e.g. from `?role=`); ignored unless declared. Defaults to the first role. */
  initial?: string;
  children: ReactNode;
};

export function RoleProvider({ roles, initial, children }: RoleProviderProps) {
  const first = initial && roles.includes(initial) ? initial : (roles[0] ?? "");
  const [role, setRoleState] = useState(first);
  const [changed, setChanged] = useState(false);
  const value = useMemo<RoleState>(
    () => ({
      role,
      changed,
      setRole: (id: string) => {
        if (!roles.includes(id)) return;
        setRoleState(id);
        setChanged(true);
      },
    }),
    [role, changed, roles],
  );
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

type RoleViewProps = {
  /** Role ids this content belongs to. */
  ids: string[];
  children: ReactNode;
  className?: string;
  /** Classes while the first role is still showing (the page entrance). */
  enterClassName?: string;
};

/** Renders its children only while the active role is one of `ids`; swaps in after a change. */
export function RoleView({ ids, children, className, enterClassName }: RoleViewProps) {
  const ctx = useRole();
  if (!ctx || !ids.includes(ctx.role)) return null;
  return <div className={cn(className, ctx.changed ? "animate-swap" : enterClassName)}>{children}</div>;
}

type RoleStageProps = {
  /** 1-based stage number, exposed as `data-stage`. */
  index: number;
  /** Role ids for which this stage is lit. */
  roles: string[];
  className?: string;
  children: ReactNode;
};

/** A lifecycle stage: `data-lit` follows the active role (styles live in globals.css `.v2-stage`). */
export function RoleStage({ index, roles, className, children }: RoleStageProps) {
  const ctx = useRole();
  const lit = ctx ? roles.includes(ctx.role) : true;
  return (
    <li data-stage={index} data-lit={lit} data-changed={ctx?.changed ?? false} className={className}>
      {children}
    </li>
  );
}

type RoleCtaLinkProps = {
  /** Demo url from site settings. */
  base: string;
  /** Sector slug added as `?sector=`. */
  sector: string;
  className?: string;
  /** Server-rendered label and arrow. */
  children: ReactNode;
};

/** The booking and hero CTA on sector pages: `${demoUrl}?sector=<slug>&role=<active role>`. */
export function RoleCtaLink({ base, sector, className, children }: RoleCtaLinkProps) {
  const ctx = useRole();
  const href = sectorDemoHref(base, sector, ctx?.role || undefined);
  if (isLocaleRoute(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
