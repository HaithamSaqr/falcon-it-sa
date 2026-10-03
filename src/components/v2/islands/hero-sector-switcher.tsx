"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { isLocaleRoute } from "@/lib/href";
import { cn } from "@/lib/utils";
import PillGroup from "./pills";

/** The small card that floats over the hero photo. */
export type HeroTileData = {
  image: string;
  alt: string;
  caption: ReactNode;
  /** Second line ("See how we set it up"). */
  sub: string;
  /** "" means the tile is not a link. */
  href: string;
  /** CSS object-position for the photo. */
  position?: string;
};

export type HeroPillData = {
  id: string;
  label: ReactNode;
  /** null keeps the hero subtitle. */
  subtitle: ReactNode;
  tile: HeroTileData | null;
};

type HeroState = { pills: HeroPillData[]; selected: HeroPillData | null; changed: boolean; select: (id: string | null) => void };

const HeroContext = createContext<HeroState | null>(null);

/**
 * "See it for" sector pills on the home hero. No pill is selected at first;
 * picking one swaps the subtitle and the floating card, picking it again
 * clears it. The H1 never changes. Wraps the hero so the subtitle, pills and
 * card (in different columns) share one state.
 */
export function HeroSectorSwitcher({ pills, children }: { pills: HeroPillData[]; children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const selected = pills.find((p) => p.id === selectedId) ?? null;
  const value: HeroState = {
    pills,
    selected,
    changed,
    select: (id) => {
      setSelectedId(id);
      setChanged(true);
    },
  };
  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

export function HeroSectorPills({
  label,
  fallbackLabel,
  className,
}: {
  label: ReactNode;
  fallbackLabel: string;
  className?: string;
}) {
  const ctx = useContext(HeroContext);
  if (!ctx || ctx.pills.length === 0) return null;
  return (
    <PillGroup
      label={label}
      fallbackLabel={fallbackLabel}
      options={ctx.pills.map((p) => ({ id: p.id, label: p.label }))}
      value={ctx.selected?.id ?? null}
      onChange={ctx.select}
      allowClear
      className={className}
    />
  );
}

export function HeroSubtitle({ text, className }: { text: ReactNode; className?: string }) {
  const ctx = useContext(HeroContext);
  const shown = ctx?.selected?.subtitle || text;
  if (!shown) return null;
  return (
    <p key={ctx?.selected?.id ?? "base"} className={cn(className, ctx?.changed && "animate-swap")}>
      {shown}
    </p>
  );
}

type HeroTileProps = {
  /** The card while no pill is selected (null: no card). */
  fallback: HeroTileData | null;
  /** Server-rendered arrow icon. */
  arrow: ReactNode;
  className?: string;
};

export function HeroTile({ fallback, arrow, className }: HeroTileProps) {
  const ctx = useContext(HeroContext);
  const tile = ctx?.selected ? ctx.selected.tile : fallback;
  if (!tile || (!tile.caption && !tile.image)) return null;

  const body = (
    <span
      key={ctx?.selected?.id ?? "base"}
      className={cn("block overflow-hidden rounded-[20px] bg-surface", ctx?.changed && "animate-settle")}
    >
      {tile.image && (
        <span className="block h-[108px] overflow-hidden bg-[#16151F] sm:h-[150px] lg:h-[190px]">
          <Image
            src={tile.image}
            alt={tile.alt}
            width={580}
            height={380}
            className="v2-zoom block h-full w-full object-cover"
            style={tile.position ? { objectPosition: tile.position } : undefined}
          />
        </span>
      )}
      {tile.caption && (
        <span className="flex items-center gap-2.5 pt-3 pe-3 pb-3.5 ps-4 lg:pt-3.5 lg:pe-3.5 lg:pb-4">
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="text-[15px] font-bold leading-snug [overflow-wrap:anywhere] lg:text-base">{tile.caption}</span>
            {tile.sub && tile.href && <span className="text-[13px] leading-snug text-muted">{tile.sub}</span>}
          </span>
          {tile.href && (
            <span className="v2-icon-nudge inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-sky text-brand">
              {arrow}
            </span>
          )}
        </span>
      )}
    </span>
  );

  const shell = cn(
    "block rounded-[26px] bg-white/70 p-[7px] text-ink no-underline backdrop-blur-[12px]",
    "shadow-[inset_0_0_0_1px_rgba(11,26,51,0.07),0_30px_60px_-30px_rgba(12,60,120,0.45)]",
    className,
  );

  if (!tile.href) {
    return (
      <div data-hero-tile className={shell}>
        {body}
      </div>
    );
  }
  const linkClass = cn(shell, "group v2-lift outline-brand focus-visible:outline-3 focus-visible:outline-offset-3");
  return isLocaleRoute(tile.href) ? (
    <Link data-hero-tile href={tile.href} className={linkClass}>
      {body}
    </Link>
  ) : (
    <a data-hero-tile href={tile.href} className={linkClass}>
      {body}
    </a>
  );
}
