import { REVISION_ENTITY_LABEL } from "./labels";
import type { Database } from "./types";

/**
 * WHAT CHANGED
 * ------------
 * A buffer against the change log.
 *
 * The transparency record already holds everything — revisions, panel
 * decisions, corrections, moderation actions, appeals, translations, funding.
 * That completeness is the point, and it is also the problem: an archive that
 * records everything equally tells you nothing about what mattered.
 *
 * So this ranks. A correction, an appeal that overturned a moderator, an issue
 * changing status — those are developments. A tag edit and a funding line are
 * housekeeping. Majors are listed; minors are counted and collapsed. Nothing
 * is dropped, because a digest that quietly discards events would be a worse
 * failure here than a long page.
 */

export type ChangeKind =
  | "correction"
  | "revision"
  | "decision"
  | "moderation"
  | "appeal"
  | "translation"
  | "funding"
  | "proposal"
  | "discussion";

export type Significance = "major" | "minor";

export interface ChangeEvent {
  id: string;
  at: string;
  kind: ChangeKind;
  significance: Significance;
  title: string;
  detail: string;
  href?: string;
  issueId?: string;
}

export interface ChangePeriod {
  /** ISO year-month, e.g. "2026-08". */
  period: string;
  major: ChangeEvent[];
  minor: ChangeEvent[];
}

/** Revisions that only touch housekeeping are not developments. */
const MINOR_ENTITIES = new Set(["tags", "funding-description"]);

export function buildChangeFeed(db: Database): ChangeEvent[] {
  const slugFor = (issueId?: string) => db.issues.find((i) => i.id === issueId)?.slug;
  const events: ChangeEvent[] = [];

  for (const r of db.revisions) {
    const isCorrection = r.entity === "correction";
    const slug = slugFor(r.issueId);
    events.push({
      id: r.id,
      at: r.at,
      kind: isCorrection ? "correction" : "revision",
      significance: isCorrection ? "major" : MINOR_ENTITIES.has(r.entity) ? "minor" : "major",
      title: isCorrection ? "Correction published" : REVISION_ENTITY_LABEL[r.entity],
      detail: r.summary,
      href: slug ? `/issues/${slug}/history#${r.id}` : `/transparency#${r.id}`,
      issueId: r.issueId,
    });
  }

  for (const d of db.panelDecisions) {
    const slug = slugFor(d.relatedIssueId);
    events.push({
      id: d.id,
      at: d.decidedAt,
      kind: "decision",
      significance: "major",
      title: `Panel decision — ${d.outcome.replace(/-/g, " ")}`,
      detail: d.question,
      href: slug ? `/issues/${slug}/history#${d.id}` : `/transparency#${d.id}`,
      issueId: d.relatedIssueId,
    });
  }

  for (const a of db.moderationActions) {
    events.push({
      id: a.id,
      at: a.at,
      kind: "moderation",
      significance: a.kind === "remove" || a.kind === "restore" ? "major" : "minor",
      title: `Content ${a.kind.replace(/-/g, " ")}`,
      detail: a.reason,
      href: "/transparency#moderation",
    });
  }

  for (const a of db.appeals) {
    if (!a.decidedAt) continue;
    events.push({
      id: a.id,
      at: a.decidedAt,
      kind: "appeal",
      // An upheld appeal means the platform got it wrong. That is always news.
      significance: a.status === "upheld" ? "major" : "minor",
      title: `Appeal ${a.status}`,
      detail: a.decisionNote ?? a.body,
      href: "/transparency#moderation",
    });
  }

  for (const t of db.translations) {
    if (t.status !== "panel-approved") continue;
    events.push({
      id: t.id,
      at: t.submittedAt,
      kind: "translation",
      significance: "minor",
      title: "Translation approved",
      detail: `${t.targetType} ${t.targetId} in ${t.language === "hi" ? "Hindi" : "English"}${
        t.translatorCredit ? `, credited to ${t.translatorCredit}` : ""
      }.`,
      href: "/transparency#translations",
    });
  }

  for (const p of db.proposals) {
    if (p.status === "submitted" || p.status === "under-review") continue;
    events.push({
      id: p.id,
      at: p.submittedAt,
      kind: "proposal",
      significance: p.status === "published" ? "major" : "minor",
      title: `Proposal ${p.status.replace(/-/g, " ")}`,
      detail: p.neutralRewrite ?? p.question,
      href: `/transparency#${p.id}`,
    });
  }

  for (const e of db.expenses) {
    events.push({
      id: e.id,
      at: e.at,
      kind: "funding",
      significance: "minor",
      title: "Spending recorded",
      detail: e.description,
      href: "/transparency#funding",
      issueId: e.issueId,
    });
  }

  for (const t of db.takes) {
    if (t.moderationState === "removed" || t.moderationState === "temporarily-hidden") continue;
    const slug = slugFor(t.issueId);
    events.push({
      id: t.id,
      at: t.createdAt,
      kind: "discussion",
      significance: "minor",
      title: "Take published",
      detail: t.title,
      href: slug ? `/issues/${slug}/community#${t.id}` : undefined,
      issueId: t.issueId,
    });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Groups the feed by month, newest first, majors before minors.
 *
 * Month rather than day on purpose. Activity here is sparse — most days carry
 * a single event — so a heading per day produces more headings than content
 * and makes the digest longer than the archive it was meant to compress. Each
 * row still carries its own date, so nothing about the chronology is lost.
 */
export function groupChangesByMonth(events: ChangeEvent[]): ChangePeriod[] {
  const months = new Map<string, ChangePeriod>();

  for (const event of events) {
    const period = event.at.slice(0, 7);
    let bucket = months.get(period);
    if (!bucket) {
      bucket = { period, major: [], minor: [] };
      months.set(period, bucket);
    }
    if (event.significance === "major") bucket.major.push(event);
    else bucket.minor.push(event);
  }

  return [...months.values()].sort((a, b) => b.period.localeCompare(a.period));
}

/** The most recent developments, for the compact view on the home page. */
export function recentDevelopments(db: Database, limit = 4): ChangeEvent[] {
  return buildChangeFeed(db)
    .filter((e) => e.significance === "major")
    .slice(0, limit);
}

export interface ChangeSummary {
  total: number;
  major: number;
  minor: number;
  days: number;
  months: number;
  latestAt: string | null;
}

export function summariseChanges(events: ChangeEvent[]): ChangeSummary {
  return {
    total: events.length,
    major: events.filter((e) => e.significance === "major").length,
    minor: events.filter((e) => e.significance === "minor").length,
    days: new Set(events.map((e) => e.at.slice(0, 10))).size,
    months: new Set(events.map((e) => e.at.slice(0, 7))).size,
    latestAt: events[0]?.at ?? null,
  };
}
