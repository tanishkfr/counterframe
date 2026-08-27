"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Badge,
  EmptyState,
  ModerationBadge,
  Notice,
  Paragraphs,
  StanceBadge,
} from "@/components/primitives";
import { Modal } from "@/components/primitives/Modal";
import { can } from "@/lib/auth";
import { formatDateTime, hostname } from "@/lib/format";
import { MODERATION_CATEGORY_LABEL, REACTION_LABEL, STANCE_LABEL, STANCE_SHORT } from "@/lib/labels";
import { completionLabel, hasCompletedAll } from "@/lib/reading";
import {
  isPubliclyVisible,
  primaryArticleIds,
  reactionsFor,
  repliesFor,
  sortTakes,
  userById,
  type TakeSort,
} from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type {
  CommunityTake,
  EvidenceLink,
  Issue,
  ModerationCategory,
  ReactionKind,
  Reply,
  Stance,
} from "@/lib/types";

const REACTIONS: ReactionKind[] = ["helpful-reasoning", "clear-evidence", "important-context"];
const MIN_TAKE_BODY = 220;
const MIN_REPLY_BODY = 80;

export function Discussion({ issue }: { issue: Issue }) {
  const { db, user, hydrated } = useStore();
  const [sort, setSort] = useState<TakeSort>("most-reasoned");
  const [stanceFilter, setStanceFilter] = useState<Stance | "all">("all");

  const articleIds = primaryArticleIds(issue);
  const eligible = hasCompletedAll(articleIds, db.readingProgress, user?.id ?? null);

  const takes = useMemo(() => {
    const forIssue = db.takes.filter(
      (t) =>
        t.issueId === issue.id &&
        (isPubliclyVisible(t.moderationState) ||
          t.moderationState === "temporarily-hidden" ||
          t.userId === user?.id),
    );
    const filtered =
      stanceFilter === "all" ? forIssue : forIssue.filter((t) => t.stance === stanceFilter);
    return sortTakes(db, filtered, sort);
  }, [db, issue.id, sort, stanceFilter, user?.id]);

  return (
    <section aria-labelledby="discussion-heading" style={{ marginBlockStart: "var(--s-7)" }}>
      <div className="section-head">
        <h2 id="discussion-heading">Community discussion</h2>
        <p className="meta">{takes.length} published takes</p>
      </div>

      <Notice>
        Takes and replies require completing both primary articles first. Counterframe records that
        you reached the end of each article and spent a minimum time with it — it does not, and
        cannot, verify that you understood them.
      </Notice>

      {hydrated && (
        <TakeComposer issue={issue} eligible={eligible} articleIds={articleIds} />
      )}

      <div className="filter-bar" style={{ marginBlockStart: "var(--s-5)" }}>
        <div className="field">
          <label className="field-label" htmlFor="take-sort">
            Sort
          </label>
          <select
            id="take-sort"
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value as TakeSort)}
          >
            <option value="most-reasoned">Most reasoned</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="field">
          <span className="field-label" id="stance-filter-label">
            Filter by stance
          </span>
          <div className="chip-row" role="group" aria-labelledby="stance-filter-label">
            {(["all", "supports", "criticises", "undecided"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={stanceFilter === value}
                onClick={() => setStanceFilter(value)}
              >
                {value === "all" ? "All" : STANCE_SHORT[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {takes.length === 0 ? (
        <div style={{ marginBlockStart: "var(--s-5)" }}>
          <EmptyState title="No takes match this filter">
            {stanceFilter === "all"
              ? "Nobody has published a take on this issue yet. The first one sets the tone."
              : `Nobody with the "${STANCE_SHORT[stanceFilter as Stance]}" stance has published a take yet.`}
          </EmptyState>
        </div>
      ) : (
        <ul className="take-list">
          {takes.map((take) => (
            <TakeCard key={take.id} take={take} issue={issue} eligible={eligible} articleIds={articleIds} />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------- composer ------------------------------- */

function TakeComposer({
  issue,
  eligible,
  articleIds,
}: {
  issue: Issue;
  eligible: boolean;
  articleIds: string[];
}) {
  const { db, user, publishTake } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stance, setStance] = useState<Stance | "">("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div style={{ marginBlockStart: "var(--s-5)" }}>
        <Notice tone="brass">
          <strong>You need an account to take part.</strong>{" "}
          <Link href="/auth/login">Sign in</Link> or{" "}
          <Link href="/auth/signup">create one</Link>. Reading everything on this page stays open to
          everyone.
        </Notice>
      </div>
    );
  }

  if (!can(user, "publish-take")) {
    return (
      <div style={{ marginBlockStart: "var(--s-5)" }}>
        <Notice>Your account has reader access. Contributor rights are needed to publish.</Notice>
      </div>
    );
  }

  if (!eligible) {
    const done = articleIds.filter((id) =>
      db.readingProgress.some(
        (p) => p.userId === user.id && p.articleId === id && p.state === "completed",
      ),
    ).length;
    return (
      <div style={{ marginBlockStart: "var(--s-5)" }}>
        <Notice tone="brass">
          <strong>Not eligible to post yet.</strong> You have completed {done} of{" "}
          {articleIds.length} primary articles. Read to the end of both, meet the minimum reading
          time, and mark each as read at its checkpoint. The checkpoint is at the bottom of each
          article pane.
        </Notice>
      </div>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 8) next.title = "Give your take a title of at least 8 characters.";
    if (!stance) next.stance = "Select the stance this take argues from.";
    if (body.trim().length < MIN_TAKE_BODY) {
      next.body = `Reasoning must be at least ${MIN_TAKE_BODY} characters. You have ${body.trim().length}.`;
    }
    if (evidenceUrl && !/^https?:\/\//.test(evidenceUrl)) {
      next.evidence = "Evidence links must start with http:// or https://";
    }
    if (!confirmed) next.confirmed = "Confirm that you have read both primary articles.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const evidence: EvidenceLink[] = evidenceUrl
      ? [
          {
            id: `ev-${Date.now()}`,
            label: evidenceLabel.trim() || hostname(evidenceUrl),
            url: evidenceUrl.trim(),
            kind: "related-coverage",
            verification: "needs-verification",
          },
        ]
      : [];
    try {
      await publishTake({
        issueId: issue.id,
        title: title.trim(),
        body: body.trim(),
        stance: stance as Stance,
        evidence,
        articleIds,
        allCompleted: true,
      });
      setTitle("");
      setBody("");
      setStance("");
      setEvidenceLabel("");
      setEvidenceUrl("");
      setConfirmed(false);
      setErrors({});
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginBlockStart: "var(--s-5)" }}>
      {!open ? (
        <button type="button" className="btn" data-variant="primary" onClick={() => setOpen(true)}>
          Publish a take
        </button>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          style={{ border: "1px solid var(--rule-strong)", padding: "var(--s-5)" }}
          aria-labelledby="composer-heading"
        >
          <h3 id="composer-heading" className="subtitle">
            Publish a take
          </h3>
          <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
            A take is a claim with reasoning attached. Reactions on this platform describe the
            quality of an argument, not agreement with it, so a take that is well argued and
            unpopular will still surface.
          </p>

          <div className="field" style={{ marginBlockStart: "var(--s-5)" }}>
            <label className="field-label" htmlFor="take-title">
              Title or concise claim
            </label>
            <input
              id="take-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "take-title-error" : undefined}
            />
            {errors.title && (
              <p className="field-error" id="take-title-error">
                {errors.title}
              </p>
            )}
          </div>

          <fieldset className="field" style={{ border: 0, padding: 0 }}>
            <legend className="field-label">Your stance</legend>
            <div className="chip-row">
              {(["supports", "criticises", "undecided"] as Stance[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="chip"
                  aria-pressed={stance === value}
                  onClick={() => setStance(value)}
                >
                  {STANCE_LABEL[value]}
                </button>
              ))}
            </div>
            {errors.stance && <p className="field-error">{errors.stance}</p>}
          </fieldset>

          <div className="field">
            <label className="field-label" htmlFor="take-body">
              Reasoning
              <span className="field-hint">
                At least {MIN_TAKE_BODY} characters. Point at passages, dates or figures where you
                can.
              </span>
            </label>
            <textarea
              id="take-body"
              className="textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={Boolean(errors.body)}
              aria-describedby="take-body-count"
            />
            <p className="field-hint" id="take-body-count">
              {body.trim().length} / {MIN_TAKE_BODY} characters
            </p>
            {errors.body && <p className="field-error">{errors.body}</p>}
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="field-label" htmlFor="take-ev-label">
                Evidence link label <span className="field-hint">Optional</span>
              </label>
              <input
                id="take-ev-label"
                className="input"
                value={evidenceLabel}
                onChange={(e) => setEvidenceLabel(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="take-ev-url">
                Evidence URL <span className="field-hint">Optional</span>
              </label>
              <input
                id="take-ev-url"
                className="input"
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                aria-invalid={Boolean(errors.evidence)}
              />
              {errors.evidence && <p className="field-error">{errors.evidence}</p>}
            </div>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              aria-invalid={Boolean(errors.confirmed)}
            />
            <span>
              I have read both primary articles in full.
              <span className="field-hint">
                Your completion record is attached to this take and stays visible on it.
              </span>
            </span>
          </label>
          {errors.confirmed && <p className="field-error">{errors.confirmed}</p>}

          <div className="btn-row" style={{ marginBlockStart: "var(--s-4)" }}>
            <button type="submit" className="btn" data-variant="primary" disabled={busy}>
              {busy ? "Publishing…" : "Publish take"}
            </button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* -------------------------------- takes --------------------------------- */

function TakeCard({
  take,
  issue,
  eligible,
  articleIds,
}: {
  take: CommunityTake;
  issue: Issue;
  eligible: boolean;
  articleIds: string[];
}) {
  const { db, user, toggleReaction } = useStore();
  const author = userById(db, take.userId);
  const replies = repliesFor(db, take.id);
  const reactions = reactionsFor(db, take.id);
  const [replying, setReplying] = useState(false);

  const currentStance = db.stanceVotes.find(
    (v) => v.issueId === take.issueId && v.userId === take.userId,
  )?.stance;

  const hiddenFromPublic = !isPubliclyVisible(take.moderationState);
  const ownContent = take.userId === user?.id;

  if (hiddenFromPublic && !ownContent) {
    return (
      <li className="take">
        <div className="hidden-content">
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
            <ModerationBadge state={take.moderationState} />
            <span>A take by {author?.pseudonym ?? "a member"} is not currently visible.</span>
          </div>
          <p style={{ marginBlockStart: "var(--s-2)" }}>{take.moderationReason}</p>
          <p style={{ marginBlockStart: "var(--s-2)" }}>
            <Link href="/transparency#moderation">See the public moderation record →</Link>
          </p>
        </div>
      </li>
    );
  }

  return (
    <li className="take" id={take.id}>
      <div className="take-head">
        <Link href={`/profile/${encodeURIComponent(author?.pseudonym ?? "")}`}>
          <strong>{author?.pseudonym ?? "Unknown"}</strong>
        </Link>
        {currentStance && <StanceBadge stance={currentStance} />}
        <Badge tone={take.readingAtPublish.allCompleted ? "olive" : "brass"} mark={take.readingAtPublish.allCompleted ? "●" : "◐"}>
          {completionLabel(take.readingAtPublish.allCompleted)}
        </Badge>
        <span className="meta">{formatDateTime(take.createdAt)}</span>
        <ModerationBadge state={take.moderationState} />
      </div>

      {hiddenFromPublic && ownContent && (
        <div style={{ marginBlockEnd: "var(--s-4)" }}>
          <Notice tone="rust">
            <strong>Only you can see this.</strong> {take.moderationReason}{" "}
            <Link href="/my-reading#appeals">Appeal this decision →</Link>
          </Notice>
        </div>
      )}

      <h3 className="take-title">{take.title}</h3>
      <Paragraphs text={take.body} className="take-body" />

      {take.evidence.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginBlockStart: "var(--s-4)", display: "grid", gap: "var(--s-2)" }}>
          {take.evidence.map((link) => (
            <li key={link.id} className="meta">
              <span className="eyebrow" style={{ marginInlineEnd: "var(--s-2)" }}>
                Evidence
              </span>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>{" "}
              <span style={{ color: "var(--ink-faint)" }}>({hostname(link.url)})</span>{" "}
              {link.verification === "needs-verification" && (
                <Badge tone="brass" mark="?">
                  Unverified by Counterframe
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}

      {take.translationCredit && (
        <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
          Translation credit: {take.translationCredit}
        </p>
      )}

      <div className="take-foot">
        {REACTIONS.map((kind) => {
          const count = reactions.filter((r) => r.kind === kind).length;
          const mine = reactions.some((r) => r.kind === kind && r.userId === user?.id);
          return (
            <button
              key={kind}
              type="button"
              className="reaction-btn"
              aria-pressed={mine}
              disabled={!user}
              onClick={() => toggleReaction(take.id, kind)}
              title={user ? undefined : "Sign in to react"}
            >
              {REACTION_LABEL[kind]}
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
            </button>
          );
        })}

        <button
          type="button"
          className="btn"
          data-variant="quiet"
          onClick={() => setReplying((v) => !v)}
          aria-expanded={replying}
        >
          Reply
        </button>

        <ReportButton targetId={take.id} targetType="take" />
      </div>

      {replies.length > 0 && (
        <ul className="reply-list">
          {replies.map((reply) => (
            <ReplyRow key={reply.id} reply={reply} />
          ))}
        </ul>
      )}

      {replying && (
        <ReplyComposer
          take={take}
          issue={issue}
          eligible={eligible}
          articleIds={articleIds}
          onDone={() => setReplying(false)}
        />
      )}
    </li>
  );
}

function ReplyRow({ reply }: { reply: Reply }) {
  const { db, user } = useStore();
  const author = userById(db, reply.userId);
  const visible = isPubliclyVisible(reply.moderationState);

  if (!visible && reply.userId !== user?.id) {
    return (
      <li className="reply">
        <div className="hidden-content">
          <ModerationBadge state={reply.moderationState} /> A reply is not currently visible.
          {reply.moderationReason && <p style={{ marginBlockStart: "var(--s-2)" }}>{reply.moderationReason}</p>}
        </div>
      </li>
    );
  }

  return (
    <li className="reply" id={reply.id}>
      <div className="take-head" style={{ marginBlockEnd: "var(--s-2)" }}>
        <Link href={`/profile/${encodeURIComponent(author?.pseudonym ?? "")}`}>
          <strong>{author?.pseudonym ?? "Unknown"}</strong>
        </Link>
        <StanceBadge stance={reply.stance} />
        <Badge tone={reply.readingAtPublish.allCompleted ? "olive" : "brass"} mark={reply.readingAtPublish.allCompleted ? "●" : "◐"}>
          {completionLabel(reply.readingAtPublish.allCompleted)}
        </Badge>
        <span className="meta">{formatDateTime(reply.createdAt)}</span>
        <ModerationBadge state={reply.moderationState} />
      </div>
      <Paragraphs text={reply.body} className="take-body" />
      <div className="take-foot">
        <ReportButton targetId={reply.id} targetType="reply" />
      </div>
    </li>
  );
}

function ReplyComposer({
  take,
  issue,
  eligible,
  articleIds,
  onDone,
}: {
  take: CommunityTake;
  issue: Issue;
  eligible: boolean;
  articleIds: string[];
  onDone: () => void;
}) {
  const { user, publishReply } = useStore();
  const [body, setBody] = useState("");
  const [stance, setStance] = useState<Stance | "">("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div style={{ marginBlockStart: "var(--s-4)" }}>
        <Notice>
          <Link href="/auth/login">Sign in</Link> to reply.
        </Notice>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div style={{ marginBlockStart: "var(--s-4)" }}>
        <Notice tone="brass">
          Replies require completing both primary articles. The checkpoint is at the bottom of each
          article pane.
        </Notice>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (body.trim().length < MIN_REPLY_BODY) {
      setError(`A reply needs at least ${MIN_REPLY_BODY} characters of reasoning.`);
      return;
    }
    if (!stance) {
      setError("Select the stance you are replying from.");
      return;
    }
    setBusy(true);
    try {
      await publishReply({
        takeId: take.id,
        issueId: issue.id,
        body: body.trim(),
        stance: stance as Stance,
        articleIds,
        allCompleted: true,
      });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{ marginBlockStart: "var(--s-4)", marginInlineStart: "var(--s-4)" }}
    >
      <div className="field">
        <label className="field-label" htmlFor={`reply-${take.id}`}>
          Your reply
          <span className="field-hint">
            One level of replies only — this thread does not nest further.
          </span>
        </label>
        <textarea
          id={`reply-${take.id}`}
          className="textarea"
          style={{ minHeight: "6rem" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </div>

      <fieldset style={{ border: 0, padding: 0, marginBlockStart: "var(--s-3)" }}>
        <legend className="field-label">Your stance</legend>
        <div className="chip-row">
          {(["supports", "criticises", "undecided"] as Stance[]).map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={stance === value}
              onClick={() => setStance(value)}
            >
              {STANCE_SHORT[value]}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="field-error">{error}</p>}

      <div className="btn-row" style={{ marginBlockStart: "var(--s-3)" }}>
        <button type="submit" className="btn" data-variant="primary" disabled={busy}>
          {busy ? "Posting…" : "Post reply"}
        </button>
        <button type="button" className="btn" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ------------------------------- reporting ------------------------------ */

const REPORT_REASONS: ModerationCategory[] = [
  "harassment",
  "hate-speech",
  "threat",
  "targeted-abuse",
  "spam",
  "off-topic",
];

export function ReportButton({
  targetId,
  targetType,
}: {
  targetId: string;
  targetType: "take" | "reply";
}) {
  const { user, reportContent } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ModerationCategory>("harassment");
  const [note, setNote] = useState("");

  return (
    <>
      <button
        type="button"
        className="btn"
        data-variant="quiet"
        onClick={() => setOpen(true)}
        disabled={!user}
        title={user ? undefined : "Sign in to report"}
      >
        Report
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Report this content">
        <p className="meta">
          Reports go to a human moderator. The classifier can prioritise a report and can hide
          content pending review, but it cannot remove anything on its own. Every decision is
          published on the moderation record with its reason.
        </p>

        <div className="field" style={{ marginBlockStart: "var(--s-4)" }}>
          <label className="field-label" htmlFor="report-reason">
            Reason
          </label>
          <select
            id="report-reason"
            className="select"
            value={reason}
            onChange={(e) => setReason(e.target.value as ModerationCategory)}
          >
            {REPORT_REASONS.map((value) => (
              <option key={value} value={value}>
                {MODERATION_CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="report-note">
            What should the moderator know? <span className="field-hint">Optional</span>
          </label>
          <textarea
            id="report-note"
            className="textarea"
            style={{ minHeight: "5rem" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Notice tone="brass">
          Disagreeing with a take is not a reportable reason. Reports used that way are recorded and
          dismissed, and the dismissal is public.
        </Notice>

        <div className="btn-row" style={{ marginBlockStart: "var(--s-4)" }}>
          <button
            type="button"
            className="btn"
            data-variant="primary"
            onClick={() => {
              reportContent(targetId, targetType, reason, note.trim());
              setNote("");
              setOpen(false);
            }}
          >
            Submit report
          </button>
          <button type="button" className="btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
