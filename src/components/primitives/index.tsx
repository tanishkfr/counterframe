"use client";

import { useId, useState, type ReactNode } from "react";

import {
  FRAME_LABEL,
  MODERATION_STATE_LABEL,
  READING_STATE_LABEL,
  RUBRIC_VERDICT_LABEL,
  RUBRIC_VERDICT_MARK,
  STANCE_MARK,
  STANCE_SHORT,
} from "@/lib/labels";
import type {
  ContentModerationState,
  FrameLabel,
  ReadingState,
  RubricVerdict,
  Stance,
} from "@/lib/types";

type Tone = "neutral" | "rust" | "olive" | "brass" | "ink";

export function Badge({
  children,
  tone = "neutral",
  mark,
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  /** A short glyph so meaning never depends on colour alone. */
  mark?: string;
  title?: string;
}) {
  return (
    <span className="badge" data-tone={tone === "neutral" ? undefined : tone} title={title}>
      {mark && (
        <span className="badge-mark" aria-hidden="true">
          {mark}
        </span>
      )}
      {children}
    </span>
  );
}

/* Frame labels are editorial descriptions, never verdicts on accuracy. */
const FRAME_TONE: Record<FrameLabel, Tone> = {
  supports: "olive",
  criticises: "rust",
  mixed: "brass",
  unclear: "neutral",
  converging: "neutral",
  "insufficient-contrast": "neutral",
};

const FRAME_MARK: Record<FrameLabel, string> = {
  supports: "+",
  criticises: "−",
  mixed: "±",
  unclear: "?",
  converging: "=",
  "insufficient-contrast": "≈",
};

export function FrameBadge({ label }: { label: FrameLabel }) {
  return (
    <Badge tone={FRAME_TONE[label]} mark={FRAME_MARK[label]} title="Panel framing label">
      {FRAME_LABEL[label]}
    </Badge>
  );
}

export function StanceBadge({ stance }: { stance: Stance }) {
  const tone: Record<Stance, Tone> = {
    supports: "olive",
    criticises: "rust",
    undecided: "neutral",
  };
  return (
    <Badge tone={tone[stance]} mark={STANCE_MARK[stance]}>
      {STANCE_SHORT[stance]}
    </Badge>
  );
}

export function ReadingBadge({ state }: { state: ReadingState }) {
  const mark: Record<ReadingState, string> = {
    "not-started": "○",
    "in-progress": "◐",
    completed: "●",
  };
  return (
    <Badge tone={state === "completed" ? "olive" : "neutral"} mark={mark[state]}>
      {READING_STATE_LABEL[state]}
    </Badge>
  );
}

export function ModerationBadge({ state }: { state: ContentModerationState }) {
  if (state === "published") return null;
  const tone: Record<ContentModerationState, Tone> = {
    published: "neutral",
    "under-review": "brass",
    "temporarily-hidden": "rust",
    removed: "rust",
    restored: "olive",
    "edits-requested": "brass",
  };
  return <Badge tone={tone[state]}>{MODERATION_STATE_LABEL[state]}</Badge>;
}

export function RubricMark({ verdict }: { verdict: RubricVerdict }) {
  const tone: Record<RubricVerdict, string> = {
    yes: "var(--olive)",
    no: "var(--rust)",
    partial: "var(--brass)",
    unknown: "var(--ink-faint)",
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.4em" }}>
      <span
        aria-hidden="true"
        className="badge-mark"
        style={{ color: tone[verdict], fontSize: "0.9em" }}
      >
        {RUBRIC_VERDICT_MARK[verdict]}
      </span>
      <span>{RUBRIC_VERDICT_LABEL[verdict]}</span>
    </span>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      <p>{children}</p>
      {action && <div style={{ marginBlockStart: "var(--s-4)" }}>{action}</div>}
    </div>
  );
}

export function Notice({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="notice" data-tone={tone === "neutral" ? undefined : tone}>
      {children}
    </div>
  );
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  count,
}: {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div>
      <button
        type="button"
        className="disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span>{summary}</span>
        {typeof count === "number" && (
          <span className="meta" style={{ marginInlineStart: "auto" }}>
            {count}
          </span>
        )}
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  id,
}: {
  /** 0-1. */
  value: number;
  label: string;
  id?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      id={id}
      className="progress-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      aria-valuetext={`${pct}% read`}
    >
      <div className="progress-fill" style={{ transform: `scaleX(${pct / 100})`, width: "100%" }} />
    </div>
  );
}

export function StatBlock({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat-block">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/** Renders paragraphs from a plain-text body with blank-line separation. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n{2,}/).map((para, index) => (
        <p key={index}>{renderInline(para)}</p>
      ))}
    </div>
  );
}

/** Minimal inline formatting: **bold** and *italic*. No HTML is ever injected. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}
