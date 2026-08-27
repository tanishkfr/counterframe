"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, EmptyState, ModerationBadge, Notice, StatBlock } from "@/components/primitives";
import { can } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import {
  MODERATION_ACTION_LABEL,
  MODERATION_CATEGORY_LABEL,
} from "@/lib/labels";
import {
  AUTO_HIDE_CATEGORIES,
  AUTO_HIDE_THRESHOLD,
  describePrediction,
} from "@/lib/moderation/adapter";
import { moderationQueue, userById, type QueueItem } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { ModerationActionKind } from "@/lib/types";

const ACTIONS: ModerationActionKind[] = [
  "approve",
  "mark-safe",
  "request-edits",
  "temporarily-hide",
  "restore",
  "escalate",
  "remove",
];

export function ModerationView() {
  const { db, user, hydrated, moderate } = useStore();

  if (!hydrated) {
    return (
      <div className="shell page">
        <p className="meta">Loading the moderation queue…</p>
      </div>
    );
  }

  if (!user || !can(user, "moderate")) {
    return (
      <div className="shell page">
        <EmptyState
          title="Moderation tools require moderator access"
          action={
            <Link href="/transparency#moderation" className="btn" data-variant="primary">
              See the public moderation record
            </Link>
          }
        >
          Every moderation action and its reason is published. The tools that take those actions are
          restricted. Sign in as the demo moderator account to see them.
        </EmptyState>
      </div>
    );
  }

  const queue = moderationQueue(db);
  const openFlags = db.flags.filter((f) => f.status === "open");

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Moderation</p>
        <h1 className="display">Review queue</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Every action here is recorded with your name, a reason you write, and a timestamp, and
          appears immediately on the public moderation record.
        </p>
      </header>

      <Notice tone="brass">
        <strong>The classifier does not remove content.</strong> It can prioritise a report, suggest
        a category, and hide content pending human review — and only when the top category is one of{" "}
        {AUTO_HIDE_CATEGORIES.join(", ")} at {Math.round(AUTO_HIDE_THRESHOLD * 100)}% confidence or
        above. Disagreement, anger and unpopular opinion cannot trigger it. Permanent removal is
        always a human decision, and it is appealable.
      </Notice>

      <div className="grid-3" style={{ marginBlock: "var(--s-6) var(--s-7)" }}>
        <StatBlock value={queue.length} label="Items in queue" />
        <StatBlock value={openFlags.length} label="Open reports" />
        <StatBlock
          value={db.takes.filter((t) => t.moderationState === "temporarily-hidden").length}
          label="Currently hidden"
        />
        <StatBlock
          value={db.appeals.filter((a) => a.status === "submitted").length}
          label="Appeals pending panel"
        />
      </div>

      {queue.length === 0 ? (
        <EmptyState title="The queue is empty">
          Nothing is flagged and nothing is awaiting review. Past actions stay on the{" "}
          <Link href="/transparency#moderation">public record</Link>.
        </EmptyState>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {queue.map((item) => (
            <QueueRow
              key={item.targetId}
              item={item}
              onAct={(kind, reason) => moderate(item.targetId, item.targetType, kind, reason)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QueueRow({
  item,
  onAct,
}: {
  item: QueueItem;
  onAct: (kind: ModerationActionKind, reason: string) => void;
}) {
  const { db } = useStore();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const act = (kind: ModerationActionKind) => {
    if (reason.trim().length < 25) {
      setError("Every action needs at least 25 characters of reason. It is published.");
      return;
    }
    onAct(kind, reason.trim());
    setReason("");
    setError("");
  };

  const issue = db.issues.find((i) => i.id === item.issueId);

  return (
    <li style={{ borderBlockStart: "1px solid var(--rule)", paddingBlock: "var(--s-5)" }}>
      <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
        <Badge tone="ink">{item.targetType}</Badge>
        <ModerationBadge state={item.state} />
        <span className="meta">{item.authorPseudonym}</span>
        <span className="meta dot-sep">{formatDateTime(item.createdAt)}</span>
        {issue && (
          <Link href={`/issues/${issue.slug}/community#${item.targetId}`} className="meta">
            In context →
          </Link>
        )}
      </div>

      <h3 className="subtitle" style={{ marginBlockStart: "var(--s-3)" }}>
        {item.title}
      </h3>
      <p
        style={{
          marginBlockStart: "var(--s-3)",
          maxWidth: "62ch",
          fontFamily: "var(--font-serif)",
          background: "var(--surface-sunken)",
          padding: "var(--s-3) var(--s-4)",
          borderInlineStart: "2px solid var(--rule-strong)",
        }}
      >
        {item.body}
      </p>

      {item.prediction && (
        <div
          style={{
            marginBlockStart: "var(--s-4)",
            border: "1px solid var(--rule)",
            padding: "var(--s-3) var(--s-4)",
          }}
        >
          <p className="eyebrow">Model prediction</p>
          <dl className="definition-list" style={{ marginBlockStart: "var(--s-3)" }}>
            <dt>Model</dt>
            <dd>
              {item.prediction.modelName} {item.prediction.modelVersion}
            </dd>
            <dt>Top category</dt>
            <dd>{MODERATION_CATEGORY_LABEL[item.prediction.topCategory]}</dd>
            <dt>Confidence</dt>
            <dd style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.round(item.prediction.confidence * 100)}%
            </dd>
            <dt>All scores</dt>
            <dd>
              {Object.entries(item.prediction.scores)
                .map(([category, score]) => `${category} ${Math.round((score ?? 0) * 100)}%`)
                .join(" · ")}
            </dd>
            <dt>Automatic action</dt>
            <dd>{item.prediction.autoHidden ? "Hidden pending review" : "None"}</dd>
            <dt>Recorded</dt>
            <dd>{formatDateTime(item.prediction.at)}</dd>
          </dl>
          <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
            {describePrediction(item.prediction)}
          </p>
        </div>
      )}

      {item.flags.length > 0 && (
        <div style={{ marginBlockStart: "var(--s-4)" }}>
          <p className="eyebrow">Reports</p>
          <ul style={{ listStyle: "none", padding: 0, marginBlockStart: "var(--s-2)" }}>
            {item.flags.map((flag) => (
              <li key={flag.id} className="meta" style={{ paddingBlock: "var(--s-1)" }}>
                <Badge tone={flag.status === "open" ? "rust" : "neutral"}>{flag.status}</Badge>{" "}
                {MODERATION_CATEGORY_LABEL[flag.reason]} · {userById(db, flag.reporterId)?.pseudonym}{" "}
                · {formatDateTime(flag.at)}
                {flag.note && <> — &ldquo;{flag.note}&rdquo;</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="field" style={{ marginBlockStart: "var(--s-4)", maxWidth: "42rem" }}>
        <label className="field-label" htmlFor={`reason-${item.targetId}`}>
          Reason for your decision
          <span className="field-hint">
            Published verbatim on the moderation record and shown to the author.
          </span>
        </label>
        <textarea
          id={`reason-${item.targetId}`}
          className="textarea"
          style={{ minHeight: "5rem" }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>

      <div className="btn-row" style={{ marginBlockStart: "var(--s-3)" }}>
        {ACTIONS.map((kind) => (
          <button
            key={kind}
            type="button"
            className="btn"
            data-variant={kind === "approve" ? "primary" : undefined}
            onClick={() => act(kind)}
          >
            {MODERATION_ACTION_LABEL[kind]}
          </button>
        ))}
      </div>
    </li>
  );
}
