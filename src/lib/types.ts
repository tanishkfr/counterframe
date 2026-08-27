/**
 * Counterframe domain model.
 *
 * Two hard rules are encoded here:
 *  1. Source text and original source metadata are IMMUTABLE. They live on
 *     `SourceArticle` and are never the target of a `Revision`.
 *  2. Everything Counterframe itself writes (summaries, frame labels, tags,
 *     annotations, corrections, translations, funding descriptions) is
 *     versioned through `Revision` and attributable to a person and a role.
 */

/* ------------------------------- identity ------------------------------- */

export type Role = "reader" | "contributor" | "moderator" | "panel" | "admin";

export const ROLE_ORDER: Role[] = ["reader", "contributor", "moderator", "panel", "admin"];

export interface PrivacySettings {
  /** Appear by pseudonym in public voter lists. Aggregate count always counts. */
  showInVoterLists: boolean;
  /** Publish the full stance-change timeline on the public profile. */
  publicStanceHistory: boolean;
  /** Publish reading completion on the public profile. */
  publicReadingHistory: boolean;
  /** Attach pseudonym to funding contributions by default. */
  namedContributionsByDefault: boolean;
}

export interface User {
  id: string;
  /** Public handle. Real names are never required. */
  pseudonym: string;
  /** Login identifier for the local demo auth layer. */
  email: string;
  roles: Role[];
  createdAt: string;
  bio?: string;
  region?: string;
  languages: LanguageCode[];
  privacy: PrivacySettings;
  /** Panel members link to their public panel profile. */
  panelMemberId?: string;
}

export interface Session {
  userId: string;
  issuedAt: string;
  expiresAt: string;
}

/* ------------------------------- language ------------------------------- */

export type LanguageCode = "en" | "hi";

export type TranslationStatus =
  | "original"
  | "machine-draft"
  | "user-submitted"
  | "human-reviewed"
  | "panel-approved";

/* -------------------------------- issues -------------------------------- */

export type IssueStatus = "active" | "under-review" | "archived";

export interface Issue {
  id: string;
  slug: string;
  /** Deliberately neutral phrasing. Changing it requires a Revision. */
  title: string;
  /** One-paragraph neutral framing of what is in dispute. Platform-authored. */
  summary: string;
  status: IssueStatus;
  countries: string[];
  region: string;
  topics: string[];
  /** Window the coverage refers to, not the window the issue was published. */
  eventStart: string;
  eventEnd: string;
  createdAt: string;
  updatedAt: string;
  /** Exactly two primary panes. Everything else is an additional perspective. */
  viewpointA: { articleIds: string[]; label: string };
  viewpointB: { articleIds: string[]; label: string };
  additionalPerspectiveIds: string[];
  /** Panel's written justification that A and B genuinely contrast. */
  contrastRationale: string;
  contrastVerdict: FrameLabel;
  heroArticleId?: string;
  proposalId?: string;
}

/* ------------------------------- sources -------------------------------- */

export type SourceType =
  | "news-report"
  | "opinion"
  | "analysis"
  | "government-statement"
  | "state-broadcaster"
  | "ngo-report"
  | "academic"
  | "wire-service";

export type FrameLabel =
  | "supports"
  | "criticises"
  | "mixed"
  | "unclear"
  | "converging"
  | "insufficient-contrast";

export type VerificationState = "verified" | "needs-verification" | "unavailable";

/** A single verifiable fact about a source, carrying its own verification state. */
export interface VerifiedField<T> {
  value: T | null;
  state: VerificationState;
  /** How the value was checked, e.g. "Fetched from canonical URL 2026-08-27". */
  note?: string;
}

export interface SourceMetadata {
  outlet: string;
  outletCountry: string;
  /** null with state "unavailable" for wire copy carrying no named journalist. */
  author: VerifiedField<string>;
  authorLocation: VerifiedField<string>;
  publishedAt: VerifiedField<string>;
  updatedAt: VerifiedField<string>;
  sourceType: SourceType;
  canonicalUrl: string;
  originalHeadline: string;
  language: LanguageCode;
  correctionPolicyUrl: VerifiedField<string>;
}

/** The rubric replaces a single opaque "credibility score". */
export type RubricVerdict = "yes" | "no" | "partial" | "unknown";

export type RubricKey =
  | "named-author"
  | "identifiable-outlet"
  | "publication-date"
  | "evidence-cited"
  | "news-opinion-separation"
  | "correction-policy"
  | "directness"
  | "primary-source-access"
  | "geographic-context"
  | "affiliations";

export interface RubricCriterion {
  key: RubricKey;
  label: string;
  verdict: RubricVerdict;
  /** Why the panel reached this verdict. Required, so no bare verdicts ship. */
  note: string;
}

/**
 * A block of article body. `kind` is load-bearing in the UI: quoted blocks are
 * rendered as immutable source text, platform blocks are visibly separated.
 */
export type ArticleBlockKind =
  | "source-quote"
  | "platform-summary"
  | "platform-note"
  | "source-heading";

export interface ArticleBlock {
  id: string;
  kind: ArticleBlockKind;
  text: string;
  /** Present on platform blocks only; points at the Revision that last changed it. */
  revisionId?: string;
}

export interface ArticleImage {
  src: string;
  alt: string;
  credit: string;
  licence: string;
  licenceUrl: string;
  sourceUrl: string;
  /**
   * True when the image is NOT the image the outlet published. Rendered as an
   * explicit caveat so readers never mistake context for evidence.
   */
  contextualOnly: boolean;
  caption: string;
}

export interface EvidenceLink {
  id: string;
  label: string;
  url: string;
  kind: "primary-document" | "dataset" | "report" | "related-coverage";
  verification: VerificationState;
}

export interface SourceFrameLabel {
  label: FrameLabel;
  /** Required written reasoning. A label with no reasoning must not publish. */
  rationale: string;
  decidedBy: string[];
  panelDecisionId: string;
  decidedAt: string;
  revisionId: string;
}

export interface SourceArticle {
  id: string;
  issueId: string;
  /** IMMUTABLE. Never revised; corrections are appended as platform notes. */
  metadata: SourceMetadata;
  /** IMMUTABLE ordered body. Only `platform-*` blocks may be revised. */
  blocks: ArticleBlock[];
  /** Platform-authored, versioned. */
  neutralSummary: string;
  frameLabel: SourceFrameLabel;
  topics: string[];
  image: ArticleImage | null;
  evidenceLinks: EvidenceLink[];
  editorialStatus: "published" | "under-review" | "archived" | "corrected";
  rubric: RubricCriterion[];
  /** Words across readable blocks; drives the dwell-time requirement. */
  wordCount: number;
  revisionIds: string[];
}

/* ------------------------------- reading -------------------------------- */

export type ReadingState = "not-started" | "in-progress" | "completed";

export interface ReadingProgress {
  userId: string;
  articleId: string;
  state: ReadingState;
  /** 0-1. Deepest scroll position reached, not current position. */
  furthestFraction: number;
  /** Milliseconds of foreground dwell time on this article. */
  dwellMs: number;
  reachedEnd: boolean;
  startedAt?: string;
  lastSeenAt?: string;
  completedAt?: string;
  /** Restores the reader to where they stopped. */
  lastBlockId?: string;
}

export interface ReadingCompletion {
  userId: string;
  articleId: string;
  completedAt: string;
  dwellMsAtCompletion: number;
  requiredDwellMs: number;
}

/* -------------------------------- stance -------------------------------- */

export type Stance = "supports" | "criticises" | "undecided";

export interface StanceVote {
  id: string;
  issueId: string;
  userId: string;
  stance: Stance;
  reasoning?: string;
  updatedAt: string;
  /** Per-vote override of the profile default. */
  publicProfile: boolean;
}

export interface StanceChange {
  id: string;
  issueId: string;
  userId: string;
  from: Stance | null;
  to: Stance;
  at: string;
  reasoning?: string;
}

/* ------------------------------ community ------------------------------- */

export type ReactionKind = "helpful-reasoning" | "clear-evidence" | "important-context";

export interface Reaction {
  id: string;
  targetId: string;
  userId: string;
  kind: ReactionKind;
  at: string;
}

export type ContentModerationState =
  | "published"
  | "under-review"
  | "temporarily-hidden"
  | "removed"
  | "restored"
  | "edits-requested";

export interface ReadingSnapshot {
  articleIds: string[];
  allCompleted: boolean;
}

export interface CommunityTake {
  id: string;
  issueId: string;
  userId: string;
  title: string;
  body: string;
  stance: Stance;
  createdAt: string;
  editedAt?: string;
  /** Snapshot at publish time: proves the gate was satisfied, and stays true. */
  readingAtPublish: ReadingSnapshot;
  evidence: EvidenceLink[];
  moderationState: ContentModerationState;
  moderationReason?: string;
  translationCredit?: string;
  language: LanguageCode;
}

export interface Reply {
  id: string;
  takeId: string;
  issueId: string;
  userId: string;
  body: string;
  stance: Stance;
  createdAt: string;
  readingAtPublish: ReadingSnapshot;
  moderationState: ContentModerationState;
  moderationReason?: string;
  language: LanguageCode;
}

/* ------------------------------ annotations ----------------------------- */

export type TacticCategory =
  | "loaded-language"
  | "emotional-appeal"
  | "omission"
  | "selective-context"
  | "framing"
  | "unsupported-claim"
  | "appeal-to-authority"
  | "false-certainty"
  | "generalisation"
  | "image-selection"
  | "headline-emphasis"
  | "statistic-without-context";

export interface Annotation {
  id: string;
  articleId: string;
  blockId: string;
  /** Verbatim substring of the block, used to anchor the highlight. */
  anchorText: string;
  category: TacticCategory;
  explanation: string;
  evidence: string;
  authorId: string;
  authorRole: Role;
  createdAt: string;
  revisionIds: string[];
  /** Contextual link into the Education hub. */
  educationSlug?: string;
}

/* -------------------------------- panel --------------------------------- */

export interface PanelMember {
  id: string;
  name: string;
  kind: "core" | "regional-advisor";
  role: string;
  region: string;
  country: string;
  background: string;
  expertise: string[];
  languages: string[];
  selectedAt: string;
  termEndsAt: string;
  affiliations: string[];
  conflicts: string[];
  userId?: string;
}

export type PanelDecisionKind =
  | "issue-proposal"
  | "frame-label"
  | "pairing"
  | "translation"
  | "correction"
  | "funding-allocation"
  | "education-publication"
  | "appeal";

export interface PanelVote {
  memberId: string;
  vote: "approve" | "reject" | "abstain" | "recuse";
  reasoning: string;
  /** Set when `vote` is "recuse". */
  conflictNote?: string;
}

export interface PanelDecision {
  id: string;
  kind: PanelDecisionKind;
  question: string;
  criteria: string[];
  votes: PanelVote[];
  outcome: "approved" | "rejected" | "returned-for-clarification" | "merged";
  summary: string;
  dissent?: string;
  decidedAt: string;
  relatedIssueId?: string;
  relatedArticleId?: string;
  relatedRevisionId?: string;
  relatedProposalId?: string;
}

/* ------------------------------ proposals ------------------------------- */

export type ProposalStatus =
  | "submitted"
  | "under-review"
  | "published"
  | "returned-for-clarification"
  | "rejected"
  | "merged";

export interface IssueProposal {
  id: string;
  userId: string;
  question: string;
  rationale: string;
  suggestedSources: string[];
  region: string;
  countries: string[];
  topic: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  supportingEvidence?: string;
  affiliationDisclosure: string;
  status: ProposalStatus;
  submittedAt: string;
  decisionId?: string;
  /** Panel's neutral rewrite, shown beside the original wording. */
  neutralRewrite?: string;
  mergedIntoIssueId?: string;
  publishedIssueId?: string;
}

/* ------------------------------- revisions ------------------------------ */

export type RevisableEntity =
  | "issue"
  | "neutral-summary"
  | "frame-label"
  | "tags"
  | "panel-note"
  | "correction"
  | "translation"
  | "annotation"
  | "funding-description";

export interface RevisionChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface Revision {
  id: string;
  entity: RevisableEntity;
  entityId: string;
  issueId?: string;
  articleId?: string;
  summary: string;
  changes: RevisionChange[];
  editorId: string;
  editorRole: Role;
  reason: string;
  at: string;
  approval: "approved" | "pending" | "auto";
  panelDecisionId?: string;
}

/* -------------------------------- funding ------------------------------- */

export type FundingCategory =
  | "translation"
  | "source-licensing"
  | "panel-stipend"
  | "moderation"
  | "infrastructure"
  | "accessibility"
  | "research";

export interface FundingContribution {
  id: string;
  amount: number;
  currency: "USD";
  at: string;
  anonymous: boolean;
  /** Present only when `anonymous` is false. */
  contributorPseudonym?: string;
  userId?: string;
  destination: "platform" | "issue";
  issueId?: string;
  note?: string;
}

export interface FundingAllocation {
  id: string;
  issueId: string;
  amount: number;
  reason: string;
  at: string;
  panelDecisionId: string;
  revisionId?: string;
}

export interface FundingExpense {
  id: string;
  amount: number;
  at: string;
  category: FundingCategory;
  description: string;
  issueId?: string;
  receiptId: string;
  approvedByDecisionId: string;
}

export interface FundingReceipt {
  id: string;
  reference: string;
  issuedBy: string;
  at: string;
  /** Description of the evidence held; this demo holds no real documents. */
  evidenceNote: string;
}

export interface FundingPriorityVote {
  id: string;
  userId: string;
  category: FundingCategory;
  at: string;
}

/* ------------------------------ translation ----------------------------- */

export interface Translation {
  id: string;
  targetType: "article" | "issue" | "education" | "take";
  targetId: string;
  language: LanguageCode;
  status: TranslationStatus;
  /** Keyed by block id for articles; a "body"/"title" key elsewhere. */
  content: Record<string, string>;
  submittedBy?: string;
  submittedAt: string;
  translatorCredit?: string;
  reviewId?: string;
  revisionIds: string[];
}

export interface TranslationReview {
  id: string;
  translationId: string;
  reviewerId: string;
  outcome: "approved" | "returned" | "rejected";
  notes: string;
  at: string;
  panelDecisionId?: string;
}

/* ------------------------------ moderation ------------------------------ */

export type ModerationCategory =
  | "harassment"
  | "hate-speech"
  | "threat"
  | "targeted-abuse"
  | "spam"
  | "off-topic"
  | "none";

export interface ModerationPrediction {
  id: string;
  targetId: string;
  targetType: "take" | "reply";
  modelName: string;
  modelVersion: string;
  /** 0-1 per detected category. Never used alone to remove content. */
  scores: Partial<Record<ModerationCategory, number>>;
  topCategory: ModerationCategory;
  confidence: number;
  at: string;
  /** Set when the adapter auto-hid the content pending human review. */
  autoHidden: boolean;
}

export interface ModerationFlag {
  id: string;
  targetId: string;
  targetType: "take" | "reply";
  reporterId: string;
  reason: ModerationCategory;
  note?: string;
  at: string;
  status: "open" | "resolved";
  predictionId?: string;
  priority: "low" | "medium" | "high";
}

export type ModerationActionKind =
  | "approve"
  | "temporarily-hide"
  | "remove"
  | "restore"
  | "request-edits"
  | "mark-safe"
  | "escalate";

export interface ModerationAction {
  id: string;
  targetId: string;
  targetType: "take" | "reply";
  moderatorId: string;
  kind: ModerationActionKind;
  reason: string;
  at: string;
  flagId?: string;
  predictionId?: string;
}

export interface Appeal {
  id: string;
  actionId: string;
  targetId: string;
  userId: string;
  body: string;
  at: string;
  status: "submitted" | "under-review" | "upheld" | "overturned";
  decisionNote?: string;
  decidedAt: string | null;
  decidedBy?: string;
}

/* ------------------------------- education ------------------------------ */

export type EducationKind =
  | "article"
  | "explainer"
  | "glossary"
  | "video"
  | "case-study"
  | "guide";

export interface VideoCaptionCue {
  start: number;
  end: number;
  text: string;
}

export interface EducationVideo {
  posterSrc: string;
  posterAlt: string;
  durationSeconds: number;
  captions: VideoCaptionCue[];
  transcript: string;
  /** Static, motion-free equivalent of the video's content. */
  reducedMotionSummary: string;
}

export interface EducationResource {
  id: string;
  slug: string;
  kind: EducationKind;
  title: string;
  standfirst: string;
  body: string;
  tacticCategories: TacticCategory[];
  authorPanelMemberIds: string[];
  publishedAt: string;
  updatedAt: string;
  status: "published" | "under-review" | "archived";
  panelDecisionId: string;
  readingMinutes: number;
  video?: EducationVideo;
  glossaryTerm?: { term: string; definition: string; seeAlso: string[] };
  relatedIssueIds: string[];
}

export interface EducationSuggestion {
  id: string;
  userId: string;
  topic: string;
  rationale: string;
  at: string;
  status: "submitted" | "accepted" | "declined";
  decisionNote?: string;
}

/* -------------------------------- system -------------------------------- */

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  targetType: string;
  targetId: string;
  at: string;
  detail: string;
}

export type IssueSort = "recently-updated" | "most-debated" | "most-read";

export interface SearchFilter {
  query: string;
  topics: string[];
  countries: string[];
  regions: string[];
  statuses: IssueStatus[];
  sourceTypes: SourceType[];
  hasAdditionalPerspectives: boolean;
  sort: IssueSort;
}

export interface SavedIssue {
  userId: string;
  issueId: string;
  at: string;
}

/* ----------------------------- the database ----------------------------- */

export interface Database {
  users: User[];
  /** Local demo auth only. Never real passwords, never secrets. */
  credentials: Record<string, string>;
  issues: Issue[];
  articles: SourceArticle[];
  annotations: Annotation[];
  readingProgress: ReadingProgress[];
  completions: ReadingCompletion[];
  stanceVotes: StanceVote[];
  stanceChanges: StanceChange[];
  takes: CommunityTake[];
  replies: Reply[];
  reactions: Reaction[];
  panelMembers: PanelMember[];
  panelDecisions: PanelDecision[];
  proposals: IssueProposal[];
  revisions: Revision[];
  contributions: FundingContribution[];
  allocations: FundingAllocation[];
  expenses: FundingExpense[];
  receipts: FundingReceipt[];
  fundingPriorityVotes: FundingPriorityVote[];
  translations: Translation[];
  translationReviews: TranslationReview[];
  predictions: ModerationPrediction[];
  flags: ModerationFlag[];
  moderationActions: ModerationAction[];
  appeals: Appeal[];
  education: EducationResource[];
  educationSuggestions: EducationSuggestion[];
  auditLog: AuditLog[];
  savedIssues: SavedIssue[];
}
