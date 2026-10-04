"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import NavLink from "@/components/layout/nav-link";

interface SectorsMenuProps {
  href: string;
  /** Trigger content (label and caret, rendered on the server). */
  label: ReactNode;
  /** The dropdown panel content (a list of links). */
  children: ReactNode;
  linkClassName: string;
  activeClassName: string;
}

const PANEL_ID = "nav-sectors-menu";
const noopSubscribe = () => () => {};

/**
 * Desktop sectors dropdown. Opens on hover and when keyboard focus enters it,
 * closes on Escape (focus returns to the trigger) and when focus or the
 * pointer leaves. ArrowDown on the trigger opens it and focuses the first
 * sector. Before hydration the CSS fallback in globals.css (hover and
 * focus-within) keeps it usable.
 */
export default function SectorsMenu({ href, label, children, linkClassName, activeClassName }: SectorsMenuProps) {
  const [open, setOpen] = useState(false);
  // False in the server HTML and during hydration, true once React runs here.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const rootRef = useRef<HTMLLIElement>(null);
  const focusFirst = useRef(false);

  useEffect(() => {
    if (open && focusFirst.current) {
      focusFirst.current = false;
      rootRef.current?.querySelector<HTMLAnchorElement>(`#${PANEL_ID} a`)?.focus();
    }
  }, [open]);

  const trigger = () => rootRef.current?.querySelector<HTMLAnchorElement>("a[aria-haspopup]") ?? null;

  function onFocus(e: FocusEvent<HTMLLIElement>) {
    // Open when focus arrives from outside; moving back to the trigger after Escape does not reopen.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(true);
  }

  function onBlur(e: FocusEvent<HTMLLIElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLLIElement>) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      trigger()?.focus();
    } else if (e.key === "ArrowDown" && e.target === trigger()) {
      e.preventDefault();
      if (open) {
        rootRef.current?.querySelector<HTMLAnchorElement>(`#${PANEL_ID} a`)?.focus();
      } else {
        focusFirst.current = true;
        setOpen(true);
      }
    }
  }

  return (
    <li
      ref={rootRef}
      className="nav-sectors group/sectors relative"
      data-ready={ready ? "" : undefined}
      data-open={open ? "" : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(`#${PANEL_ID} a`)) setOpen(false);
      }}
    >
      <NavLink
        href={href}
        className={linkClassName}
        activeClassName={activeClassName}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={PANEL_ID}
      >
        {label}
      </NavLink>
      <div id={PANEL_ID} className="nav-sectors-panel absolute -start-5 top-full pt-4">
        {children}
      </div>
    </li>
  );
}
