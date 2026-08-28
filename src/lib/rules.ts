import type { Database } from "./types";

/**
 * PUBLISHING RULES
 * ----------------
 * The rules Counterframe publishes in About, expressed as checks that run
 * against live data.
 *
 * The point is that a published rule the system does not enforce is worse than
 * no rule at all — it is the same overclaiming this platform exists to teach
 * people to notice. So each rule below computes its own compliance, the About
 * page renders the result, and `rules.test.ts` fails the build if the seeded
 * data breaks one. If a rule is ever unmet, the page says so rather than
 * quietly continuing to assert it.
 *
 * Rule 3 is deliberately different in kind. Counterframe does not do original
 * reporting, so it cannot promise anything about anonymous sourcing in the
 * articles it compares — it can only promise to record, consistently, what the
 * outlet did or did not disclose. The rule is written to say exactly that.
 */

export type RuleId =
  | "claims-evidenced"
  | "corrections-complete"
  | "anonymous-sources-recorded"
  | "sponsorship-declared";

export interface RuleCheck {
  id: RuleId;
  title: string;
  /** What the rule requires, in the words published to readers. */
  requires: string[];
  /** Who the rule binds. */
  binds: "counterframe" | "our-record-of-others";
  /** Where a reader can go to check it is being followed. */
  verifyHref: string;
  verifyLabel: string;
  met: boolean;
  /** Live summary, e.g. "3 of 3 corrections carry evidence". */
  summary: string;
  /** Specific records that break the rule, named so they can be found. */
  failures: string[];
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function checkPublishingRules(db: Database): RuleCheck[] {
  return [
    claimsEvidenced(db),
    correctionsComplete(db),
    anonymousSourcesRecorded(db),
    sponsorshipDeclared(db),
  ];
}

/** Rule 1 — every major claim carries source, evidence type, date, verification. */
function claimsEvidenced(db: Database): RuleCheck {
  const links = [
    ...db.articles.flatMap((a) => a.evidenceLinks.map((e) => ({ e, where: a.id }))),
    ...db.revisions.flatMap((r) => r.evidence.map((e) => ({ e, where: r.id }))),
  ];

  const failures: string[] = [];
  for (const { e, where } of links) {
    const missing: string[] = [];
    if (!e.url) missing.push("source");
    if (!e.kind) missing.push("evidence type");
    // `date: null` is a stated finding, not an omission — the field must exist.
    if (e.date === undefined) missing.push("date");
    if (!e.verification) missing.push("verification status");
    if (missing.length) failures.push(`${where} → ${e.id}: missing ${missing.join(", ")}`);
  }

  const dated = links.filter(({ e }) => e.date !== null).length;
  return {
    id: "claims-evidenced",
    title: "Every claim we attach evidence to shows its provenance",
    requires: [
      "The source, as a link you can follow",
      "The evidence type — primary document, dataset, report, or related coverage",
      "The date of the evidence, or an explicit statement that we could not establish it",
      "Our verification status for it",
    ],
    binds: "counterframe",
    verifyHref: "/issues/delhi-informal-settlements-g20-2023",
    verifyLabel: "Open a source record",
    met: failures.length === 0,
    summary: `${plural(links.length, "evidence link")} published, all four fields present on each. ${dated} carry an established date; the rest say so rather than leaving it blank.`,
    failures,
  };
}

/** Rule 2 — every correction shows original, corrected, reason, evidence, timestamp. */
function correctionsComplete(db: Database): RuleCheck {
  const corrections = db.revisions.filter((r) => r.entity === "correction");
  const failures: string[] = [];

  for (const c of corrections) {
    const missing: string[] = [];
    if (!c.changes.some((ch) => ch.before !== null)) missing.push("original claim");
    if (!c.changes.some((ch) => ch.after !== null)) missing.push("corrected claim");
    if (!c.reason?.trim()) missing.push("reason");
    if (c.evidence.length === 0) missing.push("evidence");
    if (!c.at) missing.push("timestamp");
    if (missing.length) failures.push(`${c.id}: missing ${missing.join(", ")}`);
  }

  return {
    id: "corrections-complete",
    title: "Every correction shows what it changed and what established the change",
    requires: [
      "The original claim, exactly as it was published",
      "The corrected claim",
      "The reason for the correction",
      "The evidence that established it",
      "The timestamp",
    ],
    binds: "counterframe",
    verifyHref: "/issues/delhi-informal-settlements-g20-2023/history",
    verifyLabel: "Read the corrections",
    met: failures.length === 0,
    summary:
      corrections.length === 0
        ? "No corrections have been published yet. When one is, it will carry all five."
        : `${plural(corrections.length, "correction")} published, each showing the original text, the replacement, a written reason, supporting evidence and a timestamp.`,
    failures,
  };
}

/** Rule 3 — every unnamed source in a compared article is recorded. */
function anonymousSourcesRecorded(db: Database): RuleCheck {
  const failures: string[] = [];
  for (const record of db.anonymousSources) {
    const missing: string[] = [];
    if (!record.descriptor?.trim()) missing.push("how the source appears in the text");
    if (record.reasonGiven === undefined) missing.push("whether a reason was given");
    if (!record.sourceKind) missing.push("what kind of source");
    if (!record.corroboration) missing.push("corroboration status");
    if (!record.note?.trim()) missing.push("our note");
    if (missing.length) failures.push(`${record.id}: missing ${missing.join(", ")}`);
    if (!db.articles.some((a) => a.id === record.articleId)) {
      failures.push(`${record.id}: refers to an article that does not exist`);
    }
  }

  const unexplained = db.anonymousSources.filter((r) => r.reasonGiven === null).length;
  return {
    id: "anonymous-sources-recorded",
    title: "Every unnamed source in a compared article is recorded",
    requires: [
      "How the source appears in the text, quoted exactly",
      "The reason the outlet gave for anonymity — or a statement that it gave none",
      "What kind of source the text establishes them to be",
      "Whether any identifiable source corroborates the claim",
    ],
    binds: "our-record-of-others",
    verifyHref: "/issues/delhi-informal-settlements-g20-2023",
    verifyLabel: "See it on a source record",
    met: failures.length === 0,
    summary: `${plural(db.anonymousSources.length, "unnamed source")} recorded across the compared articles. ${unexplained} of them were used without the outlet giving any reason for the anonymity.`,
    failures,
  };
}

/** Rule 4 — every sponsored relationship is declared, including their absence. */
function sponsorshipDeclared(db: Database): RuleCheck {
  const required = ["sponsorship", "advertising", "grant", "partnership"] as const;
  const failures: string[] = [];

  for (const kind of required) {
    const entry = db.sponsorship.find((d) => d.kind === kind);
    if (!entry) failures.push(`no standing declaration for ${kind}`);
    else if (!entry.statement.trim()) failures.push(`${kind}: declaration is blank`);
  }

  const active = db.sponsorship.filter((d) => d.present);
  return {
    id: "sponsorship-declared",
    title: "Every commercial relationship is declared, including having none",
    requires: [
      "Sponsorship, advertising, grants and partnerships each carry a standing declaration",
      "A declaration is published whether or not the relationship exists",
      "Any relationship that did exist would appear in the funding ledger and on every issue it touched",
    ],
    binds: "counterframe",
    verifyHref: "/transparency#funding",
    verifyLabel: "Open the funding ledger",
    met: failures.length === 0,
    summary:
      active.length === 0
        ? `All ${required.length} relationship types carry a standing declaration. None currently exists.`
        : `${plural(active.length, "active relationship")} declared. See the funding ledger for amounts and the issues affected.`,
    failures,
  };
}

/** True when every published rule is currently met by live data. */
export function rulesAllMet(db: Database): boolean {
  return checkPublishingRules(db).every((r) => r.met);
}
