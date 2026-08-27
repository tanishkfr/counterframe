import type { Database, FundingCategory } from "./types";

export interface PlatformFunding {
  totalContributions: number;
  totalSpending: number;
  balance: number;
  contributorCount: number;
  namedTotal: number;
  anonymousTotal: number;
  byCategory: Array<{ category: FundingCategory; amount: number }>;
  transactionCount: number;
}

export interface IssueFunding {
  allocated: number;
  spent: number;
  remaining: number;
  directContributions: number;
  byCategory: Array<{ category: FundingCategory; amount: number }>;
  allocationCount: number;
  expenseCount: number;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function groupByCategory(
  rows: Array<{ category: FundingCategory; amount: number }>,
): Array<{ category: FundingCategory; amount: number }> {
  const map = new Map<FundingCategory, number>();
  for (const row of rows) map.set(row.category, (map.get(row.category) ?? 0) + row.amount);
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function platformFunding(db: Database): PlatformFunding {
  const totalContributions = sum(db.contributions.map((c) => c.amount));
  const totalSpending = sum(db.expenses.map((e) => e.amount));
  const named = db.contributions.filter((c) => !c.anonymous);
  const anonymous = db.contributions.filter((c) => c.anonymous);

  return {
    totalContributions,
    totalSpending,
    balance: totalContributions - totalSpending,
    // Anonymous contributions are counted but never attributed to a person.
    contributorCount: new Set(named.map((c) => c.contributorPseudonym)).size + anonymous.length,
    namedTotal: sum(named.map((c) => c.amount)),
    anonymousTotal: sum(anonymous.map((c) => c.amount)),
    byCategory: groupByCategory(db.expenses),
    transactionCount: db.contributions.length + db.expenses.length,
  };
}

export function issueFunding(db: Database, issueId: string): IssueFunding {
  const allocations = db.allocations.filter((a) => a.issueId === issueId);
  const expenses = db.expenses.filter((e) => e.issueId === issueId);
  const allocated = sum(allocations.map((a) => a.amount));
  const spent = sum(expenses.map((e) => e.amount));

  return {
    allocated,
    spent,
    remaining: allocated - spent,
    directContributions: sum(
      db.contributions.filter((c) => c.destination === "issue" && c.issueId === issueId).map((c) => c.amount),
    ),
    byCategory: groupByCategory(expenses),
    allocationCount: allocations.length,
    expenseCount: expenses.length,
  };
}

export interface LedgerConsistency {
  ok: boolean;
  problems: string[];
}

/**
 * Invariants the funding record must always satisfy. Surfaced in the admin
 * area rather than only asserted in tests, so a demo reset that broke the
 * ledger would be visible rather than silent.
 */
export function checkLedgerConsistency(db: Database): LedgerConsistency {
  const problems: string[] = [];
  const platform = platformFunding(db);

  if (platform.totalSpending > platform.totalContributions) {
    problems.push(
      `Total spending (${platform.totalSpending}) exceeds total contributions (${platform.totalContributions}).`,
    );
  }
  if (platform.namedTotal + platform.anonymousTotal !== platform.totalContributions) {
    problems.push("Named and anonymous contribution totals do not sum to total contributions.");
  }

  for (const issue of db.issues) {
    const f = issueFunding(db, issue.id);
    if (f.spent > f.allocated) {
      problems.push(`Issue "${issue.slug}" has spent ${f.spent} against an allocation of ${f.allocated}.`);
    }
  }

  for (const expense of db.expenses) {
    if (!db.receipts.some((r) => r.id === expense.receiptId)) {
      problems.push(`Expense ${expense.id} references a receipt that does not exist.`);
    }
  }

  return { ok: problems.length === 0, problems };
}

export function fundingPriorityTally(
  db: Database,
): Array<{ category: FundingCategory; votes: number }> {
  const map = new Map<FundingCategory, number>();
  for (const vote of db.fundingPriorityVotes) {
    map.set(vote.category, (map.get(vote.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, votes]) => ({ category, votes }))
    .sort((a, b) => b.votes - a.votes);
}
