import type { Database } from "../types";
import { annotations, articles } from "./articles";
import * as community from "./community";
import { education, educationSuggestions } from "./education";
import * as funding from "./funding";
import { issues, proposals, revisions } from "./issues";
import { panelDecisions, panelMembers } from "./panel";
import { translationReviews, translations } from "./translations";

/** A fresh, deep copy of the seeded database. Never hand out the module state. */
export function createSeedDatabase(): Database {
  const db: Database = {
    users: community.users,
    credentials: community.credentials,
    issues,
    articles,
    annotations,
    readingProgress: community.readingProgress,
    completions: community.completions,
    stanceVotes: community.stanceVotes,
    stanceChanges: community.stanceChanges,
    takes: community.takes,
    replies: community.replies,
    reactions: community.reactions,
    panelMembers,
    panelDecisions,
    proposals,
    revisions,
    contributions: funding.contributions,
    allocations: funding.allocations,
    expenses: funding.expenses,
    receipts: funding.receipts,
    fundingPriorityVotes: funding.fundingPriorityVotes,
    translations,
    translationReviews,
    predictions: community.predictions,
    flags: community.flags,
    moderationActions: community.moderationActions,
    appeals: community.appeals,
    education,
    educationSuggestions,
    auditLog: community.auditLog,
    savedIssues: community.savedIssues,
  };
  return structuredClone(db);
}

export { MONTHLY_BUDGET_USD } from "./funding";
