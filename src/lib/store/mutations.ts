import { nextState } from "../reading";
import type {
  AuditLog,
  ContentModerationState,
  Database,
  ModerationActionKind,
  ReactionKind,
  ReadingProgress,
  Stance,
} from "../types";

/**
 * Pure state transitions.
 *
 * These are the rules the platform's integrity claims actually rest on — one
 * current vote per account per issue, a stance timeline that never loses an
 * entry, reading progress that only ever moves forward, moderation that always
 * writes a reason and an audit line. They live here rather than inline in the
 * React store so they can be tested directly, without a DOM and without
 * rendering anything.
 *
 * Every function takes the whole database and returns a new one. Ids and
 * timestamps are injected rather than generated, so tests are deterministic.
 */

export interface Clock {
  now: string;
  id: (prefix: string) => string;
}

/* ------------------------------- reading -------------------------------- */

/**
 * Merges a progress update.
 *
 * Progress is monotonic on purpose: `furthestFraction` records the deepest
 * point reached, not the current scroll position, so scrolling back up can
 * never undo it, and `reachedEnd` latches once set. Dwell accumulates.
 */
export function mergeReadingProgress(
  db: Database,
  userId: string,
  articleId: string,
  patch: Partial<ReadingProgress>,
  clock: Pick<Clock, "now">,
): Database {
  const existing = db.readingProgress.find(
    (p) => p.userId === userId && p.articleId === articleId,
  );

  const base: ReadingProgress = existing ?? {
    userId,
    articleId,
    state: "not-started",
    furthestFraction: 0,
    dwellMs: 0,
    reachedEnd: false,
    startedAt: clock.now,
  };

  const merged: ReadingProgress = {
    ...base,
    ...patch,
    furthestFraction: Math.max(base.furthestFraction, patch.furthestFraction ?? 0),
    dwellMs: base.dwellMs + (patch.dwellMs ?? 0),
    reachedEnd: base.reachedEnd || Boolean(patch.reachedEnd),
    lastSeenAt: clock.now,
  };
  merged.state = nextState(merged);

  return {
    ...db,
    readingProgress: [
      ...db.readingProgress.filter(
        (p) => !(p.userId === userId && p.articleId === articleId),
      ),
      merged,
    ],
  };
}

/**
 * Marks an article complete and writes the completion record.
 *
 * A reader with no progress row cannot complete anything — the checkpoint is
 * unreachable in that state, and this refuses it at the data layer too.
 */
export function completeReading(
  db: Database,
  userId: string,
  articleId: string,
  requiredDwellMs: number,
  clock: Pick<Clock, "now">,
): Database {
  const progress = db.readingProgress.find(
    (p) => p.userId === userId && p.articleId === articleId,
  );
  if (!progress) return db;

  const completed: ReadingProgress = {
    ...progress,
    state: "completed",
    completedAt: clock.now,
    furthestFraction: 1,
    reachedEnd: true,
  };

  return {
    ...db,
    readingProgress: db.readingProgress.map((p) =>
      p.userId === userId && p.articleId === articleId ? completed : p,
    ),
    completions: [
      ...db.completions.filter((c) => !(c.userId === userId && c.articleId === articleId)),
      {
        userId,
        articleId,
        completedAt: clock.now,
        dwellMsAtCompletion: progress.dwellMs,
        requiredDwellMs,
      },
    ],
  };
}

/* -------------------------------- stance -------------------------------- */

/**
 * Records or changes a stance.
 *
 * Exactly one current vote per account per issue: an existing vote is replaced
 * in place, keeping its id. The change itself is always appended to the
 * timeline, so the history of someone changing their mind is never lost even
 * though only the current position is shown.
 */
export function castStance(
  db: Database,
  input: {
    issueId: string;
    userId: string;
    stance: Stance;
    reasoning?: string;
    publicProfile: boolean;
  },
  clock: Clock,
): Database {
  const existing = db.stanceVotes.find(
    (v) => v.issueId === input.issueId && v.userId === input.userId,
  );

  return {
    ...db,
    stanceVotes: [
      ...db.stanceVotes.filter(
        (v) => !(v.issueId === input.issueId && v.userId === input.userId),
      ),
      {
        id: existing?.id ?? clock.id("sv"),
        issueId: input.issueId,
        userId: input.userId,
        stance: input.stance,
        reasoning: input.reasoning || undefined,
        updatedAt: clock.now,
        publicProfile: input.publicProfile,
      },
    ],
    stanceChanges: [
      ...db.stanceChanges,
      {
        id: clock.id("sc"),
        issueId: input.issueId,
        userId: input.userId,
        from: existing?.stance ?? null,
        to: input.stance,
        at: clock.now,
        reasoning: input.reasoning || undefined,
      },
    ],
  };
}

/* ------------------------------ discussion ------------------------------ */

/** Reactions are a toggle: reacting again with the same kind withdraws it. */
export function toggleReaction(
  db: Database,
  targetId: string,
  userId: string,
  kind: ReactionKind,
  clock: Clock,
): Database {
  const existing = db.reactions.find(
    (r) => r.targetId === targetId && r.userId === userId && r.kind === kind,
  );
  if (existing) {
    return { ...db, reactions: db.reactions.filter((r) => r.id !== existing.id) };
  }
  return {
    ...db,
    reactions: [
      ...db.reactions,
      { id: clock.id("rx"), targetId, userId, kind, at: clock.now },
    ],
  };
}

/* ------------------------------ moderation ------------------------------ */

export const MODERATION_RESULT: Partial<
  Record<ModerationActionKind, ContentModerationState>
> = {
  approve: "published",
  "mark-safe": "published",
  "temporarily-hide": "temporarily-hidden",
  remove: "removed",
  restore: "restored",
  "request-edits": "edits-requested",
  escalate: "under-review",
};

/**
 * Applies a moderation decision.
 *
 * Three things always happen together and must not drift apart: the content
 * changes state, an action carrying the moderator's written reason is
 * recorded, and an audit line is written. Escalation deliberately leaves flags
 * open, because escalating is asking for another opinion rather than settling
 * the report.
 */
export function applyModerationAction(
  db: Database,
  input: {
    targetId: string;
    targetType: "take" | "reply";
    kind: ModerationActionKind;
    reason: string;
    moderatorId: string;
  },
  clock: Clock,
): Database {
  const resultState = MODERATION_RESULT[input.kind];
  const flagId = db.flags.find((f) => f.targetId === input.targetId && f.status === "open")?.id;
  const predictionId = db.predictions.find((p) => p.targetId === input.targetId)?.id;

  const audit: AuditLog = {
    id: clock.id("al"),
    actorId: input.moderatorId,
    actorRole: "moderator",
    action: `moderation.${input.kind}`,
    targetType: input.targetType,
    targetId: input.targetId,
    at: clock.now,
    detail: input.reason,
  };

  return {
    ...db,
    takes:
      input.targetType === "take"
        ? db.takes.map((t) =>
            t.id === input.targetId && resultState
              ? { ...t, moderationState: resultState, moderationReason: input.reason }
              : t,
          )
        : db.takes,
    replies:
      input.targetType === "reply"
        ? db.replies.map((r) =>
            r.id === input.targetId && resultState
              ? { ...r, moderationState: resultState, moderationReason: input.reason }
              : r,
          )
        : db.replies,
    moderationActions: [
      ...db.moderationActions,
      {
        id: clock.id("ma"),
        targetId: input.targetId,
        targetType: input.targetType,
        moderatorId: input.moderatorId,
        kind: input.kind,
        reason: input.reason,
        at: clock.now,
        flagId,
        predictionId,
      },
    ],
    flags: db.flags.map((f) =>
      f.targetId === input.targetId && input.kind !== "escalate"
        ? { ...f, status: "resolved" as const }
        : f,
    ),
    auditLog: [...db.auditLog, audit],
  };
}
