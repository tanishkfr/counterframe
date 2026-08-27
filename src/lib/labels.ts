import type {
  ContentModerationState,
  EducationKind,
  FrameLabel,
  FundingCategory,
  ModerationActionKind,
  ModerationCategory,
  ProposalStatus,
  ReactionKind,
  ReadingState,
  RevisableEntity,
  Role,
  RubricVerdict,
  SourceType,
  Stance,
  TacticCategory,
  TranslationStatus,
} from "./types";

/**
 * Every user-visible label lives here so wording stays consistent and neutral.
 * No label implies correctness, truth, or a winning side.
 */

export const STANCE_LABEL: Record<Stance, string> = {
  supports: "Supports the action or framing",
  criticises: "Criticises the action or framing",
  undecided: "Undecided or mixed",
};

export const STANCE_SHORT: Record<Stance, string> = {
  supports: "Supports",
  criticises: "Criticises",
  undecided: "Undecided",
};

/** Non-colour glyph so stance is never communicated by hue alone. */
export const STANCE_MARK: Record<Stance, string> = {
  supports: "+",
  criticises: "−",
  undecided: "~",
};

export const FRAME_LABEL: Record<FrameLabel, string> = {
  supports: "Supports",
  criticises: "Criticises",
  mixed: "Mixed",
  unclear: "Unclear",
  converging: "Converging",
  "insufficient-contrast": "Insufficient contrast",
};

export const FRAME_DESCRIPTION: Record<FrameLabel, string> = {
  supports:
    "The reporting predominantly presents the action, or the official account of it, without substantive challenge.",
  criticises:
    "The reporting predominantly foregrounds harms, omissions, or contested consequences of the action.",
  mixed: "The reporting carries both supportive and critical framing in comparable measure.",
  unclear: "The panel could not establish a dominant frame from the available text.",
  converging:
    "The sources agree substantially. They are presented together rather than in opposition.",
  "insufficient-contrast":
    "The sources are too similar to form a meaningful comparison. The pairing is published with this caveat rather than forced into opposition.",
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  "news-report": "News report",
  opinion: "Opinion",
  analysis: "Analysis",
  "government-statement": "Government statement",
  "state-broadcaster": "State broadcaster",
  "ngo-report": "NGO report",
  academic: "Academic",
  "wire-service": "Wire service",
};

export const READING_STATE_LABEL: Record<ReadingState, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

export const ROLE_LABEL: Record<Role, string> = {
  reader: "Reader",
  contributor: "Contributor",
  moderator: "Moderator",
  panel: "Panel member",
  admin: "Administrator",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  reader: "Browse issues, read articles, inspect sources, decisions, and funding.",
  contributor:
    "Everything a reader can do, plus voting, takes, replies, proposals, translations, and contributions.",
  moderator: "Review flagged content, act on it with a recorded reason, and process appeals.",
  panel: "Review proposals, label framing, approve translations, and publish Education material.",
  admin: "Manage users, records, settings, audit logs, and demo data.",
};

export const TACTIC_LABEL: Record<TacticCategory, string> = {
  "loaded-language": "Loaded language",
  "emotional-appeal": "Emotional appeal",
  omission: "Omission",
  "selective-context": "Selective context",
  framing: "Framing",
  "unsupported-claim": "Unsupported claim",
  "appeal-to-authority": "Appeal to authority",
  "false-certainty": "False certainty",
  generalisation: "Generalisation",
  "image-selection": "Image selection",
  "headline-emphasis": "Headline emphasis",
  "statistic-without-context": "Statistic without context",
};

export const REACTION_LABEL: Record<ReactionKind, string> = {
  "helpful-reasoning": "Helpful reasoning",
  "clear-evidence": "Clear evidence",
  "important-context": "Important context",
};

export const MODERATION_STATE_LABEL: Record<ContentModerationState, string> = {
  published: "Published",
  "under-review": "Under review",
  "temporarily-hidden": "Temporarily hidden",
  removed: "Removed",
  restored: "Restored",
  "edits-requested": "Edits requested",
};

export const MODERATION_ACTION_LABEL: Record<ModerationActionKind, string> = {
  approve: "Approve",
  "temporarily-hide": "Temporarily hide",
  remove: "Remove",
  restore: "Restore",
  "request-edits": "Request edits",
  "mark-safe": "Mark as safe",
  escalate: "Escalate",
};

export const MODERATION_CATEGORY_LABEL: Record<ModerationCategory, string> = {
  harassment: "Harassment",
  "hate-speech": "Hate speech",
  threat: "Threat",
  "targeted-abuse": "Targeted abuse",
  spam: "Spam",
  "off-topic": "Off topic",
  none: "No category detected",
};

export const FUNDING_CATEGORY_LABEL: Record<FundingCategory, string> = {
  translation: "Translation",
  "source-licensing": "Source licensing",
  "panel-stipend": "Panel stipend",
  moderation: "Moderation",
  infrastructure: "Infrastructure",
  accessibility: "Accessibility",
  research: "Research",
};

export const TRANSLATION_STATUS_LABEL: Record<TranslationStatus, string> = {
  original: "Original",
  "machine-draft": "Machine-assisted draft",
  "user-submitted": "User-submitted",
  "human-reviewed": "Human-reviewed",
  "panel-approved": "Panel-approved",
};

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  published: "Published",
  "returned-for-clarification": "Returned for clarification",
  rejected: "Rejected",
  merged: "Merged",
};

export const REVISION_ENTITY_LABEL: Record<RevisableEntity, string> = {
  issue: "Issue record",
  "neutral-summary": "Neutral summary",
  "frame-label": "Framing label",
  tags: "Topic tags",
  "panel-note": "Panel note",
  correction: "Correction",
  translation: "Translation",
  annotation: "Annotation",
  "funding-description": "Funding description",
};

export const RUBRIC_VERDICT_LABEL: Record<RubricVerdict, string> = {
  yes: "Met",
  no: "Not met",
  partial: "Partially met",
  unknown: "Not established",
};

/** Non-colour glyph for rubric verdicts. */
export const RUBRIC_VERDICT_MARK: Record<RubricVerdict, string> = {
  yes: "✓",
  no: "✕",
  partial: "–",
  unknown: "?",
};

export const EDUCATION_KIND_LABEL: Record<EducationKind, string> = {
  article: "Article",
  explainer: "Explainer",
  glossary: "Glossary",
  video: "Video",
  "case-study": "Case study",
  guide: "Guide",
};
