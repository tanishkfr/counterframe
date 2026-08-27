import { describe, expect, it } from "vitest";

import { checkLedgerConsistency, issueFunding, platformFunding } from "./funding";
import { createSeedDatabase } from "./seed";
import type { Database } from "./types";

const db = createSeedDatabase();

describe("seeded ledger", () => {
  it("is internally consistent", () => {
    const result = checkLedgerConsistency(db);
    expect(result.problems).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("balances contributions against spending", () => {
    const f = platformFunding(db);
    expect(f.balance).toBe(f.totalContributions - f.totalSpending);
    expect(f.balance).toBeGreaterThan(0);
  });

  it("splits named and anonymous totals without losing money", () => {
    const f = platformFunding(db);
    expect(f.namedTotal + f.anonymousTotal).toBe(f.totalContributions);
  });

  it("keeps issue spending inside its allocation", () => {
    for (const issue of db.issues) {
      const f = issueFunding(db, issue.id);
      expect(f.spent, issue.slug).toBeLessThanOrEqual(f.allocated);
      expect(f.remaining).toBe(f.allocated - f.spent);
    }
  });

  it("backs every expense with a receipt that exists", () => {
    const ids = new Set(db.receipts.map((r) => r.id));
    for (const expense of db.expenses) {
      expect(ids.has(expense.receiptId), expense.id).toBe(true);
    }
  });

  it("backs every expense and allocation with a panel decision that exists", () => {
    const ids = new Set(db.panelDecisions.map((d) => d.id));
    for (const expense of db.expenses) {
      expect(ids.has(expense.approvedByDecisionId), expense.id).toBe(true);
    }
    for (const allocation of db.allocations) {
      expect(ids.has(allocation.panelDecisionId), allocation.id).toBe(true);
    }
  });

  it("never attaches an identity to an anonymous contribution", () => {
    for (const contribution of db.contributions) {
      if (contribution.anonymous) {
        expect(contribution.contributorPseudonym).toBeUndefined();
        expect(contribution.userId).toBeUndefined();
      } else {
        expect(contribution.contributorPseudonym).toBeTruthy();
      }
    }
  });

  it("publishes an amount, a date and a destination for every contribution", () => {
    for (const contribution of db.contributions) {
      expect(contribution.amount).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(contribution.at))).toBe(false);
      expect(["platform", "issue"]).toContain(contribution.destination);
      if (contribution.destination === "issue") expect(contribution.issueId).toBeTruthy();
    }
  });
});

describe("consistency checks actually catch problems", () => {
  const corrupt = (patch: Partial<Database>): Database => ({ ...createSeedDatabase(), ...patch });

  it("catches overspending against contributions", () => {
    const broken = corrupt({ contributions: [] });
    const result = checkLedgerConsistency(broken);
    expect(result.ok).toBe(false);
    expect(result.problems.join(" ")).toMatch(/exceeds total contributions/);
  });

  it("catches an issue spending beyond its allocation", () => {
    const broken = corrupt({ allocations: [] });
    const result = checkLedgerConsistency(broken);
    expect(result.ok).toBe(false);
    expect(result.problems.join(" ")).toMatch(/against an allocation of 0/);
  });

  it("catches an expense whose receipt has vanished", () => {
    const broken = corrupt({ receipts: [] });
    const result = checkLedgerConsistency(broken);
    expect(result.ok).toBe(false);
    expect(result.problems.join(" ")).toMatch(/receipt that does not exist/);
  });
});
