import { describe, expect, it } from "vitest";

import { checkPublishingRules, rulesAllMet } from "./rules";
import { createSeedDatabase } from "./seed";
import type { Database } from "./types";

const db = createSeedDatabase();
const ruleById = (d: Database, id: string) => checkPublishingRules(d).find((r) => r.id === id)!;

describe("the published rules are met by live data", () => {
  /*
   * This is the load-bearing test. Publishing a rule the platform breaks is the
   * exact overclaim Counterframe teaches people to notice, so the build fails
   * rather than shipping a page that asserts a rule it does not keep.
   */
  it("meets every rule it publishes", () => {
    const failing = checkPublishingRules(db).filter((r) => !r.met);
    expect(failing.flatMap((r) => r.failures)).toEqual([]);
    expect(rulesAllMet(db)).toBe(true);
  });

  it("publishes four rules, each with requirements and somewhere to verify them", () => {
    const rules = checkPublishingRules(db);
    expect(rules).toHaveLength(4);
    for (const rule of rules) {
      expect(rule.requires.length).toBeGreaterThan(2);
      expect(rule.verifyHref).toMatch(/^\//);
      expect(rule.verifyLabel.length).toBeGreaterThan(4);
      expect(rule.summary.length).toBeGreaterThan(20);
    }
  });

  it("marks rule 3 as binding our record of others, not our own reporting", () => {
    // Counterframe does no original reporting, so it must not appear to
    // promise something about anonymous sourcing it has no power over.
    expect(ruleById(db, "anonymous-sources-recorded").binds).toBe("our-record-of-others");
    for (const id of ["claims-evidenced", "corrections-complete", "sponsorship-declared"]) {
      expect(ruleById(db, id).binds).toBe("counterframe");
    }
  });
});

describe("rule 1 — claims carry source, type, date and verification", () => {
  it("gives every evidence link all four fields", () => {
    const links = [
      ...db.articles.flatMap((a) => a.evidenceLinks),
      ...db.revisions.flatMap((r) => r.evidence),
    ];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.url).toBeTruthy();
      expect(link.kind).toBeTruthy();
      expect(link.verification).toBeTruthy();
      // null is a stated finding; undefined would be a missing field.
      expect(link.date === null || typeof link.date === "string").toBe(true);
    }
  });

  it("fails when an evidence link has no date field at all", () => {
    const broken: Database = {
      ...createSeedDatabase(),
      articles: createSeedDatabase().articles.map((a, i) =>
        i === 0
          ? {
              ...a,
              evidenceLinks: a.evidenceLinks.map((e) => {
                const { date: _date, ...rest } = e;
                return rest as typeof e;
              }),
            }
          : a,
      ),
    };
    expect(ruleById(broken, "claims-evidenced").met).toBe(false);
  });
});

describe("rule 2 — corrections are complete", () => {
  it("gives every correction all five parts", () => {
    const corrections = db.revisions.filter((r) => r.entity === "correction");
    expect(corrections.length).toBeGreaterThan(0);
    for (const c of corrections) {
      expect(c.changes.some((ch) => ch.before !== null)).toBe(true);
      expect(c.changes.some((ch) => ch.after !== null)).toBe(true);
      expect(c.reason.trim().length).toBeGreaterThan(20);
      expect(c.evidence.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(c.at))).toBe(false);
    }
  });

  it("fails a correction published without evidence", () => {
    const base = createSeedDatabase();
    const broken: Database = {
      ...base,
      revisions: base.revisions.map((r) =>
        r.entity === "correction" ? { ...r, evidence: [] } : r,
      ),
    };
    const rule = ruleById(broken, "corrections-complete");
    expect(rule.met).toBe(false);
    expect(rule.failures.join(" ")).toContain("evidence");
  });

  it("fails a correction that cannot show the original claim", () => {
    const base = createSeedDatabase();
    const broken: Database = {
      ...base,
      revisions: base.revisions.map((r) =>
        r.entity === "correction"
          ? { ...r, changes: r.changes.map((c) => ({ ...c, before: null })) }
          : r,
      ),
    };
    expect(ruleById(broken, "corrections-complete").failures.join(" ")).toContain("original claim");
  });
});

describe("rule 3 — unnamed sources are recorded", () => {
  it("records each one against a real article, with all four disclosures", () => {
    expect(db.anonymousSources.length).toBeGreaterThan(0);
    for (const record of db.anonymousSources) {
      expect(db.articles.some((a) => a.id === record.articleId)).toBe(true);
      expect(record.descriptor.trim().length).toBeGreaterThan(3);
      expect(record.reasonGiven === null || record.reasonGiven.length > 0).toBe(true);
      expect(record.sourceKind).toBeTruthy();
      expect(record.corroboration).toBeTruthy();
      expect(record.note.trim().length).toBeGreaterThan(40);
    }
  });

  it("treats a missing reason as a recorded finding, not an omission", () => {
    // The Outlook wire report names nobody and explains nothing. That absence
    // is the observation, so it must survive as `null` rather than be dropped.
    const outlook = db.anonymousSources.find((r) => r.articleId === "art-outlook-upgrade")!;
    expect(outlook.reasonGiven).toBeNull();
    expect(outlook.corroboration).toBe("single-source");
  });

  it("fails when a record points at an article that does not exist", () => {
    const base = createSeedDatabase();
    const broken: Database = {
      ...base,
      anonymousSources: base.anonymousSources.map((r) => ({ ...r, articleId: "art-nope" })),
    };
    expect(ruleById(broken, "anonymous-sources-recorded").met).toBe(false);
  });
});

describe("rule 4 — commercial relationships are declared", () => {
  it("carries a standing declaration for all four relationship types", () => {
    for (const kind of ["sponsorship", "advertising", "grant", "partnership"]) {
      const entry = db.sponsorship.find((d) => d.kind === kind);
      expect(entry, kind).toBeDefined();
      expect(entry!.statement.length).toBeGreaterThan(60);
    }
  });

  it("states the absence explicitly rather than staying silent", () => {
    // "We have no sponsors" only means something when it is published where a
    // sponsor would have to be declared.
    expect(db.sponsorship.every((d) => d.present === false)).toBe(true);
    expect(ruleById(db, "sponsorship-declared").summary).toMatch(/none currently exists/i);
  });

  it("fails when a relationship type has no declaration at all", () => {
    const base = createSeedDatabase();
    const broken: Database = {
      ...base,
      sponsorship: base.sponsorship.filter((d) => d.kind !== "sponsorship"),
    };
    const rule = ruleById(broken, "sponsorship-declared");
    expect(rule.met).toBe(false);
    expect(rule.failures.join(" ")).toContain("sponsorship");
  });
});
