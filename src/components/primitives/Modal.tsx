"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "drawer" slides from the trailing edge (bottom sheet on small screens). */
  variant?: "drawer" | "dialog";
  children: ReactNode;
  /** Rendered in the header beside the close button. */
  headerExtra?: ReactNode;
}

/**
 * One implementation behind both the transparency drawer and every dialog, so
 * focus handling, Escape and focus restoration behave identically everywhere:
 *  - focus moves into the panel on open and returns to the trigger on close
 *  - Tab is trapped inside the panel
 *  - Escape closes
 *  - background scroll is locked while open
 */
export function Modal({ open, onClose, title, variant = "dialog", children, headerExtra }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      );
      if (nodes.length === 0) return;

      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown, true);

    // Focus the panel itself rather than its first control, so a screen reader
    // reads the panel title before its contents.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      // The trigger is often re-rendered away by the action the dialog took
      // (a report, a moderation decision). Focusing a detached node silently
      // drops focus to the body, which throws a keyboard user back to the top
      // of the page, so fall back to the main landmark instead.
      const trigger = restoreRef.current;
      if (trigger?.isConnected) trigger.focus();
      else document.getElementById("main")?.focus();
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={variant === "drawer" ? "drawer" : "dialog"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={variant === "drawer" ? "drawer-head" : "section-head"}>
          <h2 id={titleId} className="subtitle">
            {title}
          </h2>
          <div style={{ display: "flex", gap: "var(--s-2)", alignItems: "center" }}>
            {headerExtra}
            <button type="button" className="btn" data-variant="quiet" onClick={onClose}>
              Close
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
        <div className={variant === "drawer" ? "drawer-body" : undefined}>{children}</div>
      </div>
    </>
  );
}
