import type { ReadingProgress, ReadingState, SourceArticle } from "./types";

/**
 * READING VERIFICATION
 * --------------------
 * Counterframe cannot prove that anyone understood an article, and does not
 * claim to. What it can observe is that a reader reached the end of the text
 * and spent a minimum amount of time with it in the foreground. That is the
 * whole claim, and the UI states it in those words.
 *
 * The dwell requirement is deliberately generous for classroom use. The rate
 * below is roughly twice a typical reading speed, and the ceiling caps any
 * single article at half a minute, so a demonstration of both panes takes
 * about a minute rather than five. The exact numbers are shown to the reader
 * rather than hidden, because a gate whose rule is secret is a dark pattern.
 */

/** Words per minute assumed by the dwell calculation. Demo-friendly, not typical. */
export const DEMO_WORDS_PER_MINUTE = 500;
export const MIN_DWELL_MS = 10_000;
export const MAX_DWELL_MS = 30_000;

/** Fraction of the article that must have been scrolled past to count as "reached the end". */
export const END_THRESHOLD = 0.97;

export function requiredDwellMs(article: Pick<SourceArticle, "wordCount">): number {
  const raw = (article.wordCount / DEMO_WORDS_PER_MINUTE) * 60_000;
  return Math.round(Math.min(MAX_DWELL_MS, Math.max(MIN_DWELL_MS, raw)));
}

export function emptyProgress(userId: string, articleId: string): ReadingProgress {
  return {
    userId,
    articleId,
    state: "not-started",
    furthestFraction: 0,
    dwellMs: 0,
    reachedEnd: false,
  };
}

export interface CheckpointStatus {
  /** True once the reader may open the completion checkpoint. */
  unlocked: boolean;
  reachedEnd: boolean;
  dwellMs: number;
  requiredMs: number;
  remainingMs: number;
  /** Plain-language explanation of what is still outstanding. */
  blockedReason: string | null;
}

export function checkpointStatus(
  progress: ReadingProgress | undefined,
  article: Pick<SourceArticle, "wordCount">,
): CheckpointStatus {
  const requiredMs = requiredDwellMs(article);
  const dwellMs = progress?.dwellMs ?? 0;
  const reachedEnd = progress?.reachedEnd ?? false;
  const remainingMs = Math.max(0, requiredMs - dwellMs);

  let blockedReason: string | null = null;
  if (!reachedEnd && remainingMs > 0) {
    blockedReason = "Scroll to the end of the article, and keep reading for a little longer.";
  } else if (!reachedEnd) {
    blockedReason = "Scroll to the end of the article.";
  } else if (remainingMs > 0) {
    blockedReason = `Keep reading for another ${Math.ceil(remainingMs / 1000)} seconds.`;
  }

  return {
    unlocked: reachedEnd && remainingMs === 0,
    reachedEnd,
    dwellMs,
    requiredMs,
    remainingMs,
    blockedReason,
  };
}

export function nextState(progress: ReadingProgress): ReadingState {
  if (progress.completedAt) return "completed";
  if (progress.furthestFraction > 0 || progress.dwellMs > 0) return "in-progress";
  return "not-started";
}

/** True only when every listed article has a completion record for this user. */
export function hasCompletedAll(
  articleIds: string[],
  progress: ReadingProgress[],
  userId: string | null,
): boolean {
  if (!userId || articleIds.length === 0) return false;
  return articleIds.every((articleId) =>
    progress.some(
      (p) => p.userId === userId && p.articleId === articleId && p.state === "completed",
    ),
  );
}

/**
 * The label shown beside a published take. "Completed before posting" is a
 * statement about sequence, not about comprehension.
 */
export function completionLabel(allCompleted: boolean): string {
  return allCompleted ? "Completed before posting" : "Reading incomplete at time of posting";
}
