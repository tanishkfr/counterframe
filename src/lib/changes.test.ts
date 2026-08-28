import { describe, expect, it } from "vitest";

import {
  buildChangeFeed,
  groupChangesByMonth,
  recentDevelopments,
  summariseChanges,
} from "./changes";
import { createSeedDatabase } from "./seed";

const db = createSeedDatabase();
const feed = buildChangeFeed(db);

describe("the change feed", () => {
  it("draws on every part of the record, not just revisions", () => {
    const kinds = new Set(feed.map((e) => e.kind));
    for (const kind of ["correction", "revision", "decision", "moderation", "funding"]) {
      expect(kinds.has(kind as never), kind).toBe(true);
    }
  });

  it("is ordered newest first", () => {
    const dates = feed.map((e) => e.at);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it("gives every event a title, a detail and a valid timestamp", () => {
    for (const event of feed) {
      expect(event.title.length).toBeGreaterThan(3);
      expect(event.detail.length).toBeGreaterThan(3);
      expect(Number.isNaN(Date.parse(event.at))).toBe(false);
    }
  });

  it("uses ids that are unique, so nothing collapses in the digest", () => {
    const ids = feed.map((e) => `${e.kind}:${e.id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ranking separates developments from housekeeping", () => {
  it("treats corrections as major", () => {
    const corrections = feed.filter((e) => e.kind === "correction");
    expect(corrections.length).toBeGreaterThan(0);
    expect(corrections.every((e) => e.significance === "major")).toBe(true);
  });

  it("treats an upheld appeal as major, because the platform got it wrong", () => {
    const upheld = feed.find((e) => e.kind === "appeal" && /upheld/i.test(e.title));
    expect(upheld).toBeDefined();
    expect(upheld!.significance).toBe("major");
  });

  it("treats tag edits and funding lines as minor", () => {
    const tags = feed.find((e) => e.id === "rev-015");
    expect(tags?.significance).toBe("minor");
    expect(feed.filter((e) => e.kind === "funding").every((e) => e.significance === "minor")).toBe(
      true,
    );
  });

  it("keeps majors a genuine minority, or the ranking is doing no work", () => {
    const { major, total } = summariseChanges(feed);
    expect(major).toBeGreaterThan(0);
    expect(major).toBeLessThan(total);
  });
});

describe("nothing is silently dropped", () => {
  it("keeps every event when grouped", () => {
    const months = groupChangesByMonth(feed);
    const regrouped = months.reduce((n, m) => n + m.major.length + m.minor.length, 0);
    expect(regrouped).toBe(feed.length);
  });

  it("orders months newest first and never emits an empty month", () => {
    const months = groupChangesByMonth(feed);
    expect(months.length).toBeGreaterThan(1);
    expect([...months].sort((a, b) => b.period.localeCompare(a.period))).toEqual(months);
    for (const month of months) {
      expect(month.major.length + month.minor.length).toBeGreaterThan(0);
    }
  });

  it("produces fewer groups than events, or the grouping buys nothing", () => {
    // Grouping by day gave 34 headings for 49 events, which made the digest
    // longer than the archive it compresses.
    const months = groupChangesByMonth(feed);
    expect(months.length).toBeLessThan(feed.length / 3);
  });

  it("counts what it collapses", () => {
    const summary = summariseChanges(feed);
    expect(summary.major + summary.minor).toBe(summary.total);
    expect(summary.months).toBe(groupChangesByMonth(feed).length);
    expect(summary.latestAt).toBe(feed[0]!.at);
  });
});

describe("hidden and removed content stays out of the feed", () => {
  it("omits takes that moderation has hidden or removed", () => {
    const hidden = db.takes.filter(
      (t) => t.moderationState === "temporarily-hidden" || t.moderationState === "removed",
    );
    expect(hidden.length).toBeGreaterThan(0);
    for (const take of hidden) {
      expect(feed.some((e) => e.kind === "discussion" && e.id === take.id)).toBe(false);
    }
  });

  it("omits translations that the panel has not approved", () => {
    const pending = db.translations.filter((t) => t.status !== "panel-approved");
    expect(pending.length).toBeGreaterThan(0);
    for (const t of pending) {
      expect(feed.some((e) => e.kind === "translation" && e.id === t.id)).toBe(false);
    }
  });

  it("omits proposals still awaiting a decision", () => {
    const open = db.proposals.filter(
      (p) => p.status === "submitted" || p.status === "under-review",
    );
    expect(open.length).toBeGreaterThan(0);
    for (const p of open) {
      expect(feed.some((e) => e.kind === "proposal" && e.id === p.id)).toBe(false);
    }
  });
});

describe("the home-page digest", () => {
  it("returns only developments, newest first, within the limit", () => {
    const recent = recentDevelopments(db, 4);
    expect(recent.length).toBeLessThanOrEqual(4);
    expect(recent.every((e) => e.significance === "major")).toBe(true);
    const dates = recent.map((e) => e.at);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it("points each development somewhere a reader can check it", () => {
    for (const event of recentDevelopments(db, 6)) {
      expect(event.href, event.title).toBeTruthy();
      expect(event.href!.startsWith("/")).toBe(true);
    }
  });
});
