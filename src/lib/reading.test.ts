import { describe, expect, it } from "vitest";

import {
  checkpointStatus,
  completionLabel,
  emptyProgress,
  hasCompletedAll,
  MAX_DWELL_MS,
  MIN_DWELL_MS,
  requiredDwellMs,
} from "./reading";
import type { ReadingProgress } from "./types";

describe("dwell requirement", () => {
  it("scales with word count but stays inside the demo-friendly bounds", () => {
    expect(requiredDwellMs({ wordCount: 10 })).toBe(MIN_DWELL_MS);
    expect(requiredDwellMs({ wordCount: 100_000 })).toBe(MAX_DWELL_MS);

    const mid = requiredDwellMs({ wordCount: 150 });
    expect(mid).toBeGreaterThanOrEqual(MIN_DWELL_MS);
    expect(mid).toBeLessThanOrEqual(MAX_DWELL_MS);
  });

  it("never asks for more than half a minute on any article", () => {
    for (const wordCount of [1, 50, 500, 5_000, 50_000]) {
      expect(requiredDwellMs({ wordCount })).toBeLessThanOrEqual(30_000);
    }
  });
});

describe("checkpoint gate", () => {
  const article = { wordCount: 600 };
  const required = requiredDwellMs(article);

  const progress = (patch: Partial<ReadingProgress>): ReadingProgress => ({
    ...emptyProgress("u", "a"),
    ...patch,
  });

  it("stays locked before the reader reaches the end", () => {
    const status = checkpointStatus(progress({ dwellMs: required * 3, reachedEnd: false }), article);
    expect(status.unlocked).toBe(false);
    expect(status.blockedReason).toMatch(/scroll to the end/i);
  });

  it("stays locked before the minimum time has elapsed", () => {
    const status = checkpointStatus(progress({ dwellMs: 1_000, reachedEnd: true }), article);
    expect(status.unlocked).toBe(false);
    expect(status.blockedReason).toMatch(/keep reading/i);
  });

  it("unlocks only when both conditions are met", () => {
    const status = checkpointStatus(progress({ dwellMs: required, reachedEnd: true }), article);
    expect(status.unlocked).toBe(true);
    expect(status.blockedReason).toBeNull();
    expect(status.remainingMs).toBe(0);
  });

  it("treats a reader with no progress record as locked", () => {
    const status = checkpointStatus(undefined, article);
    expect(status.unlocked).toBe(false);
    expect(status.dwellMs).toBe(0);
  });
});

describe("posting eligibility", () => {
  const completed = (userId: string, articleId: string): ReadingProgress => ({
    ...emptyProgress(userId, articleId),
    state: "completed",
  });

  it("requires every primary article, not just one", () => {
    const progress = [completed("u1", "a1")];
    expect(hasCompletedAll(["a1", "a2"], progress, "u1")).toBe(false);
    expect(hasCompletedAll(["a1"], progress, "u1")).toBe(true);
  });

  it("passes only when all primary articles are complete", () => {
    const progress = [completed("u1", "a1"), completed("u1", "a2")];
    expect(hasCompletedAll(["a1", "a2"], progress, "u1")).toBe(true);
  });

  it("does not let one reader's progress unlock another's posting", () => {
    const progress = [completed("u1", "a1"), completed("u1", "a2")];
    expect(hasCompletedAll(["a1", "a2"], progress, "u2")).toBe(false);
  });

  it("refuses signed-out readers", () => {
    const progress = [completed("u1", "a1"), completed("u1", "a2")];
    expect(hasCompletedAll(["a1", "a2"], progress, null)).toBe(false);
  });

  it("does not count in-progress reading as completion", () => {
    const progress: ReadingProgress[] = [
      { ...emptyProgress("u1", "a1"), state: "in-progress", furthestFraction: 0.99, dwellMs: 60_000 },
      completed("u1", "a2"),
    ];
    expect(hasCompletedAll(["a1", "a2"], progress, "u1")).toBe(false);
  });
});

describe("completion labelling", () => {
  it("describes sequence, never comprehension", () => {
    expect(completionLabel(true)).toBe("Completed before posting");
    expect(completionLabel(false)).toBe("Reading incomplete at time of posting");
    // Guard against a future edit that overclaims.
    expect(completionLabel(true).toLowerCase()).not.toMatch(/understood|understanding|comprehen/);
  });
});
