import type {
  FundingAllocation,
  FundingContribution,
  FundingExpense,
  FundingPriorityVote,
  FundingReceipt,
} from "../types";

/**
 * Simulated funding. No real payments, no payment processor, no card data.
 * Every figure below is fictional. What is real is the shape of the ledger:
 * amounts, dates and destinations are always public; identity never is unless
 * the contributor chooses it.
 *
 * `src/lib/funding.test.ts` asserts the ledger stays internally consistent:
 * spending never exceeds contributions, and issue spending never exceeds the
 * amount allocated to that issue.
 */

/** Planned monthly operating budget, published so contributors can see the target. */
export const MONTHLY_BUDGET_USD = 3_400;

export const contributions: FundingContribution[] = [
  { id: "fc-01", amount: 10_000, currency: "USD", at: "2025-11-04T10:00:00.000Z", anonymous: true, destination: "platform", note: "Founding contribution. Contributor declined attribution." },
  { id: "fc-02", amount: 7_500, currency: "USD", at: "2025-12-19T14:20:00.000Z", anonymous: false, contributorPseudonym: "Ledger", userId: "u-admin", destination: "platform" },
  { id: "fc-03", amount: 4_000, currency: "USD", at: "2026-01-22T09:15:00.000Z", anonymous: true, destination: "platform" },
  { id: "fc-04", amount: 2_500, currency: "USD", at: "2026-02-08T18:05:00.000Z", anonymous: false, contributorPseudonym: "Kestrel", userId: "u-contrib-1", destination: "platform", note: "Earmark requested for translation. Panel treats earmarks as advisory, not binding." },
  { id: "fc-05", amount: 1_800, currency: "USD", at: "2026-03-03T11:40:00.000Z", anonymous: false, contributorPseudonym: "Northline", userId: "u-contrib-2", destination: "issue", issueId: "iss-delhi-g20" },
  { id: "fc-06", amount: 1_500, currency: "USD", at: "2026-03-11T08:00:00.000Z", anonymous: true, destination: "issue", issueId: "iss-delhi-g20" },
  { id: "fc-07", amount: 1_200, currency: "USD", at: "2026-03-28T16:30:00.000Z", anonymous: false, contributorPseudonym: "Quiet Harbour", userId: "u-contrib-5", destination: "platform" },
  { id: "fc-08", amount: 900, currency: "USD", at: "2026-04-15T13:10:00.000Z", anonymous: true, destination: "platform" },
  { id: "fc-09", amount: 750, currency: "USD", at: "2026-04-30T20:45:00.000Z", anonymous: false, contributorPseudonym: "Sunehra", userId: "u-contrib-3", destination: "issue", issueId: "iss-delhi-g20", note: "From translation stipend, returned to the pool." },
  { id: "fc-10", amount: 600, currency: "USD", at: "2026-05-12T07:25:00.000Z", anonymous: true, destination: "platform" },
  { id: "fc-11", amount: 500, currency: "USD", at: "2026-05-27T15:00:00.000Z", anonymous: false, contributorPseudonym: "Basalt", userId: "u-contrib-4", destination: "platform" },
  { id: "fc-12", amount: 350, currency: "USD", at: "2026-06-09T12:00:00.000Z", anonymous: true, destination: "issue", issueId: "iss-delhi-g20" },
  { id: "fc-13", amount: 300, currency: "USD", at: "2026-06-24T09:30:00.000Z", anonymous: false, contributorPseudonym: "Tulsi", userId: "u-contrib-6", destination: "platform" },
  { id: "fc-14", amount: 250, currency: "USD", at: "2026-07-07T17:15:00.000Z", anonymous: true, destination: "platform" },
  { id: "fc-15", amount: 200, currency: "USD", at: "2026-07-21T10:50:00.000Z", anonymous: false, contributorPseudonym: "Halyard", userId: "u-mod", destination: "platform" },
  { id: "fc-16", amount: 150, currency: "USD", at: "2026-08-02T19:20:00.000Z", anonymous: true, destination: "platform" },
  { id: "fc-17", amount: 100, currency: "USD", at: "2026-08-13T08:05:00.000Z", anonymous: true, destination: "issue", issueId: "iss-delhi-g20" },
  { id: "fc-18", amount: 60, currency: "USD", at: "2026-08-24T21:35:00.000Z", anonymous: false, contributorPseudonym: "Meridian", userId: "u-reader", destination: "platform" },
];

export const allocations: FundingAllocation[] = [
  {
    id: "fa-delhi-1",
    issueId: "iss-delhi-g20",
    amount: 4_200,
    reason:
      "Hindi translation and first-language review, regional advisory time, accessibility review of the annotation layer, and source verification hours.",
    at: "2026-03-15T13:10:00.000Z",
    panelDecisionId: "pd-funding-delhi",
    revisionId: "rev-013",
  },
];

export const receipts: FundingReceipt[] = [
  { id: "fr-01", reference: "CF-2026-0031", issuedBy: "Independent translation contractor", at: "2026-04-04T00:00:00.000Z", evidenceNote: "Simulated record. In production this row would link to a stored invoice document." },
  { id: "fr-02", reference: "CF-2026-0038", issuedBy: "Regional advisory stipend", at: "2026-04-22T00:00:00.000Z", evidenceNote: "Simulated record. Stipend rates are published on the panel page." },
  { id: "fr-03", reference: "CF-2026-0044", issuedBy: "Accessibility review contractor", at: "2026-05-06T00:00:00.000Z", evidenceNote: "Simulated record. Scope: annotation layer, captions, reduced-motion equivalents." },
  { id: "fr-04", reference: "CF-2026-0052", issuedBy: "Source verification hours", at: "2026-05-19T00:00:00.000Z", evidenceNote: "Simulated record. Covers the re-verification that produced the May correction." },
  { id: "fr-05", reference: "CF-2026-0009", issuedBy: "Hosting and infrastructure", at: "2026-01-31T00:00:00.000Z", evidenceNote: "Simulated record. Annual hosting and domain costs." },
  { id: "fr-06", reference: "CF-2026-0017", issuedBy: "Moderation staffing", at: "2026-02-28T00:00:00.000Z", evidenceNote: "Simulated record. Part-time moderator hours, first quarter." },
  { id: "fr-07", reference: "CF-2026-0025", issuedBy: "Panel stipends", at: "2026-03-31T00:00:00.000Z", evidenceNote: "Simulated record. Core panel stipends, first quarter." },
  { id: "fr-08", reference: "CF-2026-0061", issuedBy: "Accessibility audit", at: "2026-06-15T00:00:00.000Z", evidenceNote: "Simulated record. Full-platform keyboard and screen-reader audit." },
  { id: "fr-09", reference: "CF-2026-0068", issuedBy: "Moderation staffing", at: "2026-07-31T00:00:00.000Z", evidenceNote: "Simulated record. Part-time moderator hours, second quarter." },
  { id: "fr-10", reference: "CF-2026-0074", issuedBy: "Panel stipends", at: "2026-08-15T00:00:00.000Z", evidenceNote: "Simulated record. Core panel stipends, second quarter." },
];

export const expenses: FundingExpense[] = [
  // Issue-scoped: must stay within the 4,200 allocated to the Delhi issue.
  { id: "fe-01", amount: 1_800, at: "2026-04-04T00:00:00.000Z", category: "translation", description: "Hindi translation of the issue framing and the Viewpoint A neutral summary, plus first-language review.", issueId: "iss-delhi-g20", receiptId: "fr-01", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-02", amount: 650, at: "2026-04-22T00:00:00.000Z", category: "panel-stipend", description: "Regional advisory time for Delhi NCR terminology and local context review.", issueId: "iss-delhi-g20", receiptId: "fr-02", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-03", amount: 400, at: "2026-05-06T00:00:00.000Z", category: "accessibility", description: "Accessibility review of the annotation layer for this issue.", issueId: "iss-delhi-g20", receiptId: "fr-03", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-04", amount: 300, at: "2026-05-19T00:00:00.000Z", category: "research", description: "Source re-verification hours following the reader report that produced the May correction.", issueId: "iss-delhi-g20", receiptId: "fr-04", approvedByDecisionId: "pd-funding-delhi" },
  // Platform-wide.
  { id: "fe-05", amount: 4_800, at: "2026-01-31T00:00:00.000Z", category: "infrastructure", description: "Hosting, domain and backup costs for the year.", receiptId: "fr-05", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-06", amount: 3_600, at: "2026-02-28T00:00:00.000Z", category: "moderation", description: "Part-time moderator hours, first quarter.", receiptId: "fr-06", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-07", amount: 5_200, at: "2026-03-31T00:00:00.000Z", category: "panel-stipend", description: "Core panel stipends, first quarter.", receiptId: "fr-07", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-08", amount: 1_200, at: "2026-06-15T00:00:00.000Z", category: "accessibility", description: "Full-platform keyboard and screen-reader audit.", receiptId: "fr-08", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-09", amount: 3_600, at: "2026-07-31T00:00:00.000Z", category: "moderation", description: "Part-time moderator hours, second quarter.", receiptId: "fr-09", approvedByDecisionId: "pd-funding-delhi" },
  { id: "fe-10", amount: 5_200, at: "2026-08-15T00:00:00.000Z", category: "panel-stipend", description: "Core panel stipends, second quarter.", receiptId: "fr-10", approvedByDecisionId: "pd-funding-delhi" },
];

export const fundingPriorityVotes: FundingPriorityVote[] = [
  { id: "fp-01", userId: "u-contrib-1", category: "translation", at: "2026-06-01T09:00:00.000Z" },
  { id: "fp-02", userId: "u-contrib-2", category: "research", at: "2026-06-01T10:00:00.000Z" },
  { id: "fp-03", userId: "u-contrib-3", category: "translation", at: "2026-06-02T08:00:00.000Z" },
  { id: "fp-04", userId: "u-contrib-4", category: "moderation", at: "2026-06-02T12:00:00.000Z" },
  { id: "fp-05", userId: "u-contrib-6", category: "translation", at: "2026-06-03T14:00:00.000Z" },
  { id: "fp-06", userId: "u-mod", category: "moderation", at: "2026-06-04T09:00:00.000Z" },
  { id: "fp-07", userId: "u-panel", category: "accessibility", at: "2026-06-04T11:00:00.000Z" },
  { id: "fp-08", userId: "u-contrib-5", category: "infrastructure", at: "2026-06-05T16:00:00.000Z" },
];
