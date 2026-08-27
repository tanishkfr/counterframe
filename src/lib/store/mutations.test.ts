import { describe, expect, it } from "vitest";

import { createSeedDatabase } from "../seed";
import type { Clock } from "./mutations";
import {
  applyModerationAction,
  castStance,
  completeReading,
  mergeReadingProgress,
  toggleReaction,
} from "./mutations";

const fresh = () => createSeedDatabase();

let counter = 0;
const clock: Clock = {
  now: "2026-09-01T12:00:00.000Z",
  id: (prefix) => `${prefix}-test-${++counter}`,
};

const later: Clock = { ...clock, now: "2026-09-02T12:00:00.000Z" };

const progressFor = (db: ReturnType<typeof fresh>, userId: string, articleId: string) =>
  db.readingProgress.find((p) => p.userId === userId && p.articleId === articleId);

/* ------------------------------- reading -------------------------------- */

describe("reading progress is monotonic", () => {
  const USER = "u-reader";
  const ART = "art-outlook-upgrade";

  it("never lets scrolling back up undo progress", () => {
    let db = fresh();
    db = mergeReadingProgress(db, USER, ART, { furthestFraction: 0.9 }, clock);
    expect(progressFor(db, USER, ART)!.furthestFraction).toBeCloseTo(0.9);

    // The reader scrolls back to the top.
    db = mergeReadingProgress(db, USER, ART, { furthestFraction: 0.05 }, clock);
    expect(progressFor(db, USER, ART)!.furthestFraction).toBeCloseTo(0.9);
  });

  it("latches reachedEnd once set", () => {
    let db = fresh();
    db = mergeReadingProgress(db, USER, ART, { reachedEnd: true }, clock);
    db = mergeReadingProgress(db, USER, ART, { reachedEnd: false }, clock);
    expect(progressFor(db, USER, ART)!.reachedEnd).toBe(true);
  });

  it("accumulates dwell rather than replacing it", () => {
    let db = fresh();
    const before = progressFor(db, USER, ART)!.dwellMs;
    db = mergeReadingProgress(db, USER, ART, { dwellMs: 1000 }, clock);
    db = mergeReadingProgress(db, USER, ART, { dwellMs: 1000 }, clock);
    expect(progressFor(db, USER, ART)!.dwellMs).toBe(before + 2000);
  });

  it("creates a row for an article the reader has never opened", () => {
    let db = fresh();
    expect(progressFor(db, USER, "art-air-preparation")).toBeUndefined();
    db = mergeReadingProgress(db, USER, "art-air-preparation", { dwellMs: 500 }, clock);
    const row = progressFor(db, USER, "art-air-preparation")!;
    expect(row.state).toBe("in-progress");
    expect(row.startedAt).toBe(clock.now);
  });

  it("does not touch another reader's progress", () => {
    const before = fresh();
    const other = progressFor(before, "u-contrib-1", "art-outlook-upgrade");
    const db = mergeReadingProgress(before, USER, ART, { dwellMs: 5000 }, clock);
    expect(progressFor(db, "u-contrib-1", "art-outlook-upgrade")).toEqual(other);
  });

  it("keeps exactly one row per reader and article", () => {
    let db = fresh();
    for (let i = 0; i < 5; i += 1) {
      db = mergeReadingProgress(db, USER, ART, { dwellMs: 100 }, clock);
    }
    expect(db.readingProgress.filter((p) => p.userId === USER && p.articleId === ART)).toHaveLength(1);
  });
});

describe("completing an article", () => {
  const USER = "u-reader";
  const ART = "art-outlook-upgrade";

  it("writes a completion carrying the dwell actually achieved", () => {
    let db = fresh();
    db = mergeReadingProgress(db, USER, ART, { dwellMs: 31_000, reachedEnd: true }, clock);
    const dwell = progressFor(db, USER, ART)!.dwellMs;

    db = completeReading(db, USER, ART, 30_000, clock);

    const row = progressFor(db, USER, ART)!;
    expect(row.state).toBe("completed");
    expect(row.furthestFraction).toBe(1);
    expect(row.completedAt).toBe(clock.now);

    const completion = db.completions.find((c) => c.userId === USER && c.articleId === ART)!;
    expect(completion.dwellMsAtCompletion).toBe(dwell);
    expect(completion.requiredDwellMs).toBe(30_000);
  });

  it("refuses to complete an article with no progress row", () => {
    const db = fresh();
    const next = completeReading(db, "u-contrib-5", "art-outlook-upgrade", 30_000, clock);
    expect(next).toBe(db);
  });

  it("does not duplicate a completion when run twice", () => {
    let db = fresh();
    db = mergeReadingProgress(db, USER, ART, { reachedEnd: true }, clock);
    db = completeReading(db, USER, ART, 30_000, clock);
    db = completeReading(db, USER, ART, 30_000, later);
    expect(db.completions.filter((c) => c.userId === USER && c.articleId === ART)).toHaveLength(1);
  });
});

/* -------------------------------- stance -------------------------------- */

describe("stance", () => {
  const ISSUE = "iss-delhi-g20";
  const USER = "u-reader";

  const votesFor = (db: ReturnType<typeof fresh>) =>
    db.stanceVotes.filter((v) => v.issueId === ISSUE && v.userId === USER);

  it("enforces one current vote per account per issue", () => {
    let db = fresh();
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: true }, clock);
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "criticises", publicProfile: true }, later);
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "undecided", publicProfile: true }, later);

    expect(votesFor(db)).toHaveLength(1);
    expect(votesFor(db)[0]!.stance).toBe("undecided");
  });

  it("keeps the same vote id across changes", () => {
    let db = fresh();
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: true }, clock);
    const first = votesFor(db)[0]!.id;
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "criticises", publicProfile: true }, later);
    expect(votesFor(db)[0]!.id).toBe(first);
  });

  it("appends every change to the timeline, losing none", () => {
    let db = fresh();
    const before = db.stanceChanges.filter((c) => c.userId === USER && c.issueId === ISSUE).length;

    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: true }, clock);
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "criticises", publicProfile: true }, later);

    const changes = db.stanceChanges.filter((c) => c.userId === USER && c.issueId === ISSUE);
    expect(changes).toHaveLength(before + 2);
    expect(changes.at(-2)!.from).toBeNull();
    expect(changes.at(-2)!.to).toBe("supports");
    expect(changes.at(-1)!.from).toBe("supports");
    expect(changes.at(-1)!.to).toBe("criticises");
  });

  it("records the privacy choice per vote, not per account", () => {
    let db = fresh();
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: false }, clock);
    expect(votesFor(db)[0]!.publicProfile).toBe(false);
    db = castStance(db, { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: true }, later);
    expect(votesFor(db)[0]!.publicProfile).toBe(true);
  });

  it("does not disturb other people's votes on the same issue", () => {
    const before = fresh();
    const others = before.stanceVotes.filter((v) => v.userId !== USER).length;
    const db = castStance(
      before,
      { issueId: ISSUE, userId: USER, stance: "supports", publicProfile: true },
      clock,
    );
    expect(db.stanceVotes.filter((v) => v.userId !== USER)).toHaveLength(others);
  });

  it("drops empty reasoning rather than storing a blank string", () => {
    const db = castStance(
      fresh(),
      { issueId: ISSUE, userId: USER, stance: "supports", reasoning: "", publicProfile: true },
      clock,
    );
    expect(votesFor(db)[0]!.reasoning).toBeUndefined();
  });
});

/* ------------------------------- reactions ------------------------------ */

describe("reactions toggle", () => {
  it("adds then withdraws the same reaction", () => {
    let db = fresh();
    const before = db.reactions.length;

    db = toggleReaction(db, "t-1", "u-reader", "clear-evidence", clock);
    expect(db.reactions).toHaveLength(before + 1);

    db = toggleReaction(db, "t-1", "u-reader", "clear-evidence", clock);
    expect(db.reactions).toHaveLength(before);
  });

  it("treats different kinds independently", () => {
    let db = fresh();
    db = toggleReaction(db, "t-1", "u-reader", "clear-evidence", clock);
    db = toggleReaction(db, "t-1", "u-reader", "important-context", clock);
    const mine = db.reactions.filter((r) => r.targetId === "t-1" && r.userId === "u-reader");
    expect(mine).toHaveLength(2);
  });
});

/* ------------------------------ moderation ------------------------------ */

describe("moderation decisions", () => {
  const MOD = "u-mod";

  it("changes state, records the reason, and writes an audit line together", () => {
    const before = fresh();
    const db = applyModerationAction(
      before,
      {
        targetId: "t-6",
        targetType: "take",
        kind: "remove",
        reason: "Removed as commercial spam with no relationship to the issue.",
        moderatorId: MOD,
      },
      clock,
    );

    expect(db.takes.find((t) => t.id === "t-6")!.moderationState).toBe("removed");
    expect(db.moderationActions).toHaveLength(before.moderationActions.length + 1);
    expect(db.auditLog).toHaveLength(before.auditLog.length + 1);

    const action = db.moderationActions.at(-1)!;
    expect(action.reason).toContain("commercial spam");
    expect(action.moderatorId).toBe(MOD);
    expect(db.auditLog.at(-1)!.action).toBe("moderation.remove");
  });

  it("maps each action kind to the right content state", () => {
    const cases = [
      ["approve", "published"],
      ["mark-safe", "published"],
      ["temporarily-hide", "temporarily-hidden"],
      ["remove", "removed"],
      ["restore", "restored"],
      ["request-edits", "edits-requested"],
      ["escalate", "under-review"],
    ] as const;

    for (const [kind, expected] of cases) {
      const db = applyModerationAction(
        fresh(),
        { targetId: "t-1", targetType: "take", kind, reason: "x".repeat(30), moderatorId: MOD },
        clock,
      );
      expect(db.takes.find((t) => t.id === "t-1")!.moderationState, kind).toBe(expected);
    }
  });

  it("resolves the open flag when a decision is reached", () => {
    const db = applyModerationAction(
      fresh(),
      { targetId: "t-6", targetType: "take", kind: "remove", reason: "x".repeat(30), moderatorId: MOD },
      clock,
    );
    expect(db.flags.filter((f) => f.targetId === "t-6").every((f) => f.status === "resolved")).toBe(true);
  });

  it("leaves the flag open when escalating, because that asks rather than settles", () => {
    const before = fresh();
    const openBefore = before.flags.filter((f) => f.targetId === "t-6" && f.status === "open").length;
    expect(openBefore).toBeGreaterThan(0);

    const db = applyModerationAction(
      before,
      { targetId: "t-6", targetType: "take", kind: "escalate", reason: "x".repeat(30), moderatorId: MOD },
      clock,
    );
    expect(db.flags.filter((f) => f.targetId === "t-6" && f.status === "open")).toHaveLength(openBefore);
  });

  it("acts on replies as well as takes, without touching the other collection", () => {
    const before = fresh();
    const db = applyModerationAction(
      before,
      { targetId: "r-1", targetType: "reply", kind: "temporarily-hide", reason: "x".repeat(30), moderatorId: MOD },
      clock,
    );
    expect(db.replies.find((r) => r.id === "r-1")!.moderationState).toBe("temporarily-hidden");
    expect(db.takes).toEqual(before.takes);
  });

  it("links the action to the prediction that flagged the content", () => {
    const db = applyModerationAction(
      fresh(),
      { targetId: "t-6", targetType: "take", kind: "remove", reason: "x".repeat(30), moderatorId: MOD },
      clock,
    );
    expect(db.moderationActions.at(-1)!.predictionId).toBe("mp-2");
  });
});

/* ------------------------------ immutability ---------------------------- */

describe("every mutation leaves source records alone", () => {
  it("never alters articles", () => {
    const before = fresh();
    let db = mergeReadingProgress(before, "u-reader", "art-outlook-upgrade", { dwellMs: 1 }, clock);
    db = castStance(db, { issueId: "iss-delhi-g20", userId: "u-reader", stance: "supports", publicProfile: true }, clock);
    db = toggleReaction(db, "t-1", "u-reader", "clear-evidence", clock);
    db = applyModerationAction(
      db,
      { targetId: "t-1", targetType: "take", kind: "approve", reason: "x".repeat(30), moderatorId: "u-mod" },
      clock,
    );
    expect(db.articles).toEqual(before.articles);
    expect(db.issues).toEqual(before.issues);
    expect(db.revisions).toEqual(before.revisions);
  });

  it("does not mutate the input database in place", () => {
    const before = fresh();
    const snapshot = structuredClone(before);
    castStance(before, { issueId: "iss-delhi-g20", userId: "u-reader", stance: "supports", publicProfile: true }, clock);
    mergeReadingProgress(before, "u-reader", "art-outlook-upgrade", { dwellMs: 999 }, clock);
    expect(before).toEqual(snapshot);
  });
});
