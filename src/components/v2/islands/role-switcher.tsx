"use client";

import type { ReactNode } from "react";
import PillGroup, { type PillOption } from "./pills";
import { useRole } from "./role-provider";

type RoleSwitcherProps = {
  /** "Your role" / "دورك", shown beside the pills (above them on phones). */
  label: ReactNode;
  /** Accessible name when the visible label is empty. */
  fallbackLabel?: string;
  roles: PillOption[];
  className?: string;
};

/** Role pills for a sector page. Always one role selected (the first by default). */
export default function RoleSwitcher({ label, fallbackLabel, roles, className }: RoleSwitcherProps) {
  const ctx = useRole();
  if (!ctx) return null;
  return (
    <PillGroup
      label={label}
      fallbackLabel={fallbackLabel}
      options={roles}
      value={ctx.role}
      onChange={(id) => id && ctx.setRole(id)}
      size="lg"
      stackOnPhone
      className={className}
    />
  );
}
