import type {
  Appeal,
  AuditLog,
  CommunityTake,
  ModerationAction,
  ModerationFlag,
  ModerationPrediction,
  Reaction,
  ReadingCompletion,
  ReadingProgress,
  Reply,
  SavedIssue,
  StanceChange,
  StanceVote,
  User,
} from "../types";

const ISSUE = "iss-delhi-g20";
const BOTH = ["art-outlook-upgrade", "art-dte-evictions"];

const defaultPrivacy = {
  showInVoterLists: true,
  publicStanceHistory: false,
  publicReadingHistory: true,
  namedContributionsByDefault: true,
};

export const users: User[] = [
  {
    id: "u-reader",
    pseudonym: "Meridian",
    email: "reader@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-02-20T09:00:00.000Z",
    bio: "Reads slowly. Interested in how city governments describe their own work.",
    region: "South Asia",
    languages: ["en", "hi"],
    privacy: { ...defaultPrivacy },
  },
  {
    id: "u-mod",
    pseudonym: "Halyard",
    email: "moderator@counterframe.demo",
    roles: ["reader", "contributor", "moderator"],
    createdAt: "2026-01-11T09:00:00.000Z",
    bio: "Community moderator. Every action I take is on the public moderation record.",
    region: "Northern Europe",
    languages: ["en"],
    privacy: { ...defaultPrivacy, showInVoterLists: false },
  },
  {
    id: "u-panel",
    pseudonym: "Adaeze N.",
    email: "panel@counterframe.demo",
    roles: ["reader", "contributor", "panel"],
    createdAt: "2025-02-14T09:00:00.000Z",
    bio: "Chair of the editorial panel. Corrections and standards.",
    region: "West Africa",
    languages: ["en"],
    privacy: { ...defaultPrivacy, publicStanceHistory: true },
    panelMemberId: "pm-adaeze",
  },
  {
    id: "u-advisor",
    pseudonym: "Arjun B.",
    email: "advisor@counterframe.demo",
    roles: ["reader", "contributor", "panel"],
    createdAt: "2025-09-05T09:00:00.000Z",
    bio: "Regional advisor for Delhi NCR. Hindi and English.",
    region: "South Asia",
    languages: ["en", "hi"],
    privacy: { ...defaultPrivacy },
    panelMemberId: "pm-arjun",
  },
  {
    id: "u-admin",
    pseudonym: "Ledger",
    email: "admin@counterframe.demo",
    roles: ["reader", "contributor", "moderator", "panel", "admin"],
    createdAt: "2025-01-05T09:00:00.000Z",
    bio: "Platform administration. Records, roles, settings, audit.",
    region: "Global",
    languages: ["en"],
    privacy: { ...defaultPrivacy, showInVoterLists: false },
  },
  {
    id: "u-contrib-1",
    pseudonym: "Kestrel",
    email: "kestrel@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-03-04T09:00:00.000Z",
    bio: "Municipal budget nerd.",
    region: "Europe",
    languages: ["en"],
    privacy: { ...defaultPrivacy, publicStanceHistory: true },
  },
  {
    id: "u-contrib-2",
    pseudonym: "Northline",
    email: "northline@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-03-06T09:00:00.000Z",
    region: "North America",
    languages: ["en"],
    privacy: { ...defaultPrivacy, showInVoterLists: false },
  },
  {
    id: "u-contrib-3",
    pseudonym: "Sunehra",
    email: "sunehra@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-03-09T09:00:00.000Z",
    bio: "Translates between Hindi and English. Credited on the approved issue translation.",
    region: "South Asia",
    languages: ["hi", "en"],
    privacy: { ...defaultPrivacy },
  },
  {
    id: "u-contrib-4",
    pseudonym: "Basalt",
    email: "basalt@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-04-02T09:00:00.000Z",
    region: "Southern Africa",
    languages: ["en"],
    privacy: { ...defaultPrivacy },
  },
  {
    id: "u-contrib-5",
    pseudonym: "Quiet Harbour",
    email: "quietharbour@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-05-21T09:00:00.000Z",
    region: "East Asia",
    languages: ["en"],
    privacy: { ...defaultPrivacy, showInVoterLists: false },
  },
  {
    id: "u-contrib-6",
    pseudonym: "Tulsi",
    email: "tulsi@counterframe.demo",
    roles: ["reader", "contributor"],
    createdAt: "2026-06-14T09:00:00.000Z",
    region: "South Asia",
    languages: ["hi", "en"],
    privacy: { ...defaultPrivacy },
  },
];

/**
 * LOCAL DEMO CREDENTIALS ONLY.
 *
 * These are not secrets and are not password hashes. The local auth adapter
 * exists so the demo runs with no backend; `src/lib/auth.ts` is written so a
 * real provider can replace it without touching any consumer. Never commit a
 * real credential to this file.
 */
export const credentials: Record<string, string> = Object.fromEntries(
  users.map((u) => [u.email, "counterframe"]),
);

/* ------------------------------- reading -------------------------------- */

function completed(userId: string, articleId: string, at: string): ReadingProgress {
  return {
    userId,
    articleId,
    state: "completed",
    furthestFraction: 1,
    dwellMs: 96_000,
    reachedEnd: true,
    startedAt: at,
    lastSeenAt: at,
    completedAt: at,
    lastBlockId: undefined,
  };
}

export const readingProgress: ReadingProgress[] = [
  // The signed-in demo reader starts mid-way through Viewpoint A and has not
  // opened Viewpoint B, so the posting gate is demonstrable on a fresh install.
  {
    userId: "u-reader",
    articleId: "art-outlook-upgrade",
    state: "in-progress",
    furthestFraction: 0.42,
    dwellMs: 11_000,
    reachedEnd: false,
    startedAt: "2026-08-26T19:04:00.000Z",
    lastSeenAt: "2026-08-26T19:06:00.000Z",
    lastBlockId: "a-q1",
  },
  ...completedPair("u-contrib-1", "2026-03-12T10:00:00.000Z"),
  ...completedPair("u-contrib-2", "2026-03-14T14:00:00.000Z"),
  ...completedPair("u-contrib-3", "2026-03-20T08:30:00.000Z"),
  ...completedPair("u-contrib-4", "2026-04-05T17:45:00.000Z"),
  ...completedPair("u-contrib-6", "2026-06-16T11:15:00.000Z"),
  ...completedPair("u-panel", "2026-03-06T09:00:00.000Z"),
  ...completedPair("u-mod", "2026-03-10T09:00:00.000Z"),
  // Started Viewpoint B and stopped part-way; never opened Viewpoint A.
  {
    userId: "u-contrib-5",
    articleId: "art-dte-evictions",
    state: "in-progress",
    furthestFraction: 0.68,
    dwellMs: 22_000,
    reachedEnd: false,
    startedAt: "2026-05-22T20:10:00.000Z",
    lastSeenAt: "2026-05-22T20:12:00.000Z",
    lastBlockId: "b-q2",
  },
];

function completedPair(userId: string, at: string): ReadingProgress[] {
  return BOTH.map((articleId) => completed(userId, articleId, at));
}

export const completions: ReadingCompletion[] = readingProgress
  .filter((p) => p.state === "completed")
  .map((p) => ({
    userId: p.userId,
    articleId: p.articleId,
    completedAt: p.completedAt ?? p.lastSeenAt ?? "2026-03-12T10:00:00.000Z",
    dwellMsAtCompletion: p.dwellMs,
    requiredDwellMs: 30_000,
  }));

/* -------------------------------- stance -------------------------------- */

export const stanceVotes: StanceVote[] = [
  {
    id: "sv-1",
    issueId: ISSUE,
    userId: "u-contrib-1",
    stance: "criticises",
    reasoning:
      "The absence of any cost figure in the works reporting is what moved me. You cannot assess a programme you are not told the price of.",
    updatedAt: "2026-03-12T10:30:00.000Z",
    publicProfile: true,
  },
  {
    id: "sv-2",
    issueId: ISSUE,
    userId: "u-contrib-2",
    stance: "undecided",
    reasoning:
      "Both reports are describing real things. I do not think I can get from these two texts to a conclusion about intent, and I am suspicious of how much I want to.",
    updatedAt: "2026-03-14T15:00:00.000Z",
    publicProfile: false,
  },
  {
    id: "sv-3",
    issueId: ISSUE,
    userId: "u-contrib-3",
    stance: "criticises",
    reasoning: "I grew up near one of the areas mentioned. The vocabulary gap is not abstract to me.",
    updatedAt: "2026-03-20T09:00:00.000Z",
    publicProfile: true,
  },
  {
    id: "sv-4",
    issueId: ISSUE,
    userId: "u-contrib-4",
    stance: "criticises",
    updatedAt: "2026-04-05T18:00:00.000Z",
    publicProfile: true,
  },
  {
    id: "sv-5",
    issueId: ISSUE,
    userId: "u-contrib-6",
    stance: "supports",
    reasoning:
      "Delhi does host these summits and the roads did need work. I think the critical coverage skips over the fact that some of this was ordinary municipal maintenance that would have happened anyway.",
    updatedAt: "2026-06-16T12:00:00.000Z",
    publicProfile: true,
  },
  {
    id: "sv-6",
    issueId: ISSUE,
    userId: "u-panel",
    stance: "undecided",
    reasoning:
      "I chair the panel that published this pairing, so I hold my own view lightly and publish it for the same reason I ask others to.",
    updatedAt: "2026-03-06T10:00:00.000Z",
    publicProfile: true,
  },
  {
    id: "sv-7",
    issueId: ISSUE,
    userId: "u-mod",
    stance: "undecided",
    updatedAt: "2026-03-10T10:00:00.000Z",
    publicProfile: false,
  },
];

export const stanceChanges: StanceChange[] = [
  {
    id: "sc-1",
    issueId: ISSUE,
    userId: "u-contrib-1",
    from: null,
    to: "undecided",
    at: "2026-03-12T10:05:00.000Z",
  },
  {
    id: "sc-2",
    issueId: ISSUE,
    userId: "u-contrib-1",
    from: "undecided",
    to: "criticises",
    at: "2026-03-12T10:30:00.000Z",
    reasoning: "Changed after reading the official bulletin under Additional perspectives.",
  },
  { id: "sc-3", issueId: ISSUE, userId: "u-contrib-2", from: null, to: "undecided", at: "2026-03-14T15:00:00.000Z" },
  { id: "sc-4", issueId: ISSUE, userId: "u-contrib-3", from: null, to: "criticises", at: "2026-03-20T09:00:00.000Z" },
  { id: "sc-5", issueId: ISSUE, userId: "u-contrib-4", from: null, to: "criticises", at: "2026-04-05T18:00:00.000Z" },
  {
    id: "sc-6",
    issueId: ISSUE,
    userId: "u-contrib-6",
    from: null,
    to: "criticises",
    at: "2026-06-16T11:40:00.000Z",
  },
  {
    id: "sc-7",
    issueId: ISSUE,
    userId: "u-contrib-6",
    from: "criticises",
    to: "supports",
    at: "2026-06-16T12:00:00.000Z",
    reasoning:
      "Changed my mind after the reply thread pointed out that the road works predate the summit bid. I still think the demolitions are indefensible; I no longer think the works programme as a whole was staged for visitors.",
  },
  { id: "sc-8", issueId: ISSUE, userId: "u-panel", from: null, to: "undecided", at: "2026-03-06T10:00:00.000Z" },
  { id: "sc-9", issueId: ISSUE, userId: "u-mod", from: null, to: "undecided", at: "2026-03-10T10:00:00.000Z" },
];

/* ------------------------------ discussion ------------------------------ */

const snapshot = { articleIds: BOTH, allCompleted: true };

export const takes: CommunityTake[] = [
  {
    id: "t-1",
    issueId: ISSUE,
    userId: "u-contrib-1",
    title: "The missing number is the cost, not the casualty figure",
    body:
      "Most of the argument here is about how many people were displaced, and that number is genuinely contested. But there is a second number missing that nobody is fighting over, and it is easier to check: what the works cost.\n\nViewpoint A reports railings, street aesthetics and tulip bulbs, and gives no figure for any of it. The official bulletin under Additional perspectives gives counts of sculptures, fountains and saplings, and no cost either. Counts of objects are not a budget. If you wanted to argue that the programme was ordinary municipal maintenance, the cost per kilometre against previous years would be the evidence that settled it, in your favour or against.\n\nI am not claiming the money was misspent. I am claiming that neither the supportive coverage nor the critical coverage put a reader in a position to know, and that this is a choice both made.",
    stance: "criticises",
    createdAt: "2026-03-12T11:00:00.000Z",
    readingAtPublish: snapshot,
    evidence: [
      {
        id: "ev-t1-1",
        label: "New Delhi Municipal Council",
        url: "https://www.ndmc.gov.in/",
        kind: "primary-document",
        verification: "verified",
      },
    ],
    moderationState: "published",
    language: "en",
  },
  {
    id: "t-2",
    issueId: ISSUE,
    userId: "u-contrib-2",
    title: "Five months apart is doing more work than either frame",
    body:
      "The contrast rationale says the two reports were published five months apart and I think that disclosure deserves more weight than it gets in the layout.\n\nDecember 2022 is before most of the demolition activity described in the May 2023 piece. A wire report on railing installation could not have covered events that had not happened yet. That does not make the framing difference disappear — the choice to write about a road rather than the people beside it is still a choice — but it does mean the two texts are not straightforwardly contradicting each other, and I keep seeing people in this thread treat them as if they are.\n\nWhat I would want, and what the panel says it could not get, is a December 2022 critical piece and a May 2023 supportive one. Then the comparison would isolate framing instead of framing plus five months.",
    stance: "undecided",
    createdAt: "2026-03-14T16:20:00.000Z",
    readingAtPublish: snapshot,
    evidence: [],
    moderationState: "published",
    language: "en",
  },
  {
    id: "t-3",
    issueId: ISSUE,
    userId: "u-contrib-3",
    title: "सौंदर्यीकरण is not a translation problem, it is the whole argument",
    body:
      "I translated part of this issue into Hindi and the hardest word was 'beautification'. In Hindi, सौंदर्यीकरण is the term the municipal agencies use about themselves. It is the official register. It is not a neutral description that critics have twisted; it is the word the programme was given by the people running it.\n\nSo when Viewpoint B puts it in quotation marks, it is not attacking a neutral term. It is refusing an official one. And when Viewpoint A uses it without quotation marks, it is not being careless — it is using the programme's own name for itself, the way you would write 'Operation' before an operation's name.\n\nThe annotation on 'under the pretext of' is right that the quotation marks are an editorial act. I would add that leaving them off is equally one. Neither is the neutral default. There isn't one.",
    stance: "criticises",
    createdAt: "2026-03-20T10:15:00.000Z",
    readingAtPublish: snapshot,
    evidence: [],
    moderationState: "published",
    translationCredit: "Written in English and Hindi by the author.",
    language: "en",
  },
  {
    id: "t-4",
    issueId: ISSUE,
    userId: "u-contrib-4",
    title: "The screens tell you everything",
    body:
      "I have watched this happen in Johannesburg and I recognise the shape of it. Nobody with authority ever says 'hide the poor'. They say improve the streetscape, they say safety, they say conservation. The euphemism is not a cover story invented afterwards. It is the actual language the decision is made in, which is what makes it so hard to argue with.\n\nWhat I object to in Viewpoint A is not that it is lying. It is that it takes the programme's self-description and prints it as the description. That is a small, ordinary, daily failure and it is why this stuff works.",
    stance: "criticises",
    createdAt: "2026-04-05T19:00:00.000Z",
    readingAtPublish: snapshot,
    evidence: [],
    moderationState: "restored",
    moderationReason:
      "Temporarily hidden 2026-08-12 on an automated flag, restored 2026-08-14 after the appeal was upheld. The classifier matched on a keyword; the panel found the criticism was directed at a policy, not a person.",
    language: "en",
  },
  {
    id: "t-5",
    issueId: ISSUE,
    userId: "u-contrib-6",
    title: "Some of this road work was already scheduled",
    body:
      "I want to put a counterweight in here because this thread is one-sided and I do not think the sources support that.\n\nSardar Patel Marg railing replacement appears in municipal work programmes that predate the summit. The Viewpoint A report itself says old grills were installed earlier and are broken in places. That is maintenance. Attributing all of it to summit staging requires evidence that it was accelerated or expanded for the summit, and I have not seen anyone in this thread produce that evidence — including me.\n\nI hold the demolitions completely separately. Those are not maintenance and the due-process failures documented by HLRN are serious. My objection is to collapsing two different things into one story because one story is easier to be angry about.",
    stance: "supports",
    createdAt: "2026-06-16T12:30:00.000Z",
    readingAtPublish: snapshot,
    evidence: [
      {
        id: "ev-t5-1",
        label: "Housing and Land Rights Network",
        url: "https://hlrn.org.in/",
        kind: "report",
        verification: "verified",
      },
    ],
    moderationState: "published",
    language: "en",
  },
  {
    id: "t-6",
    issueId: ISSUE,
    userId: "u-contrib-5",
    title: "READ THIS BEFORE YOU VOTE — free crypto signals in bio",
    body:
      "Everyone is missing the real story here. DM me for the full breakdown and daily signals. Limited spots. Do not miss out on this opportunity, act now, link in bio, guaranteed returns.",
    stance: "undecided",
    createdAt: "2026-08-22T03:14:00.000Z",
    readingAtPublish: { articleIds: BOTH, allCompleted: false },
    evidence: [],
    moderationState: "temporarily-hidden",
    moderationReason:
      "Automatically hidden pending human review. Classifier scored 0.94 for spam. Awaiting a moderator decision.",
    language: "en",
  },
];

export const replies: Reply[] = [
  {
    id: "r-1",
    takeId: "t-1",
    issueId: ISSUE,
    userId: "u-contrib-6",
    body:
      "Agreed on the cost point, and I would go further: the Rs 1,084 crore figure that circulates for the whole preparation programme is not in either of these two sources. People are importing it from elsewhere and treating it as though these reports established it.",
    stance: "supports",
    createdAt: "2026-06-16T13:10:00.000Z",
    readingAtPublish: snapshot,
    moderationState: "published",
    language: "en",
  },
  {
    id: "r-2",
    takeId: "t-1",
    issueId: ISSUE,
    userId: "u-panel",
    body:
      "This is the report we wanted and did not get. The panel searched for a piece that put the works programme against a prior-year baseline and could not find one in either direction. That gap is recorded in the pairing decision.",
    stance: "undecided",
    createdAt: "2026-03-13T08:40:00.000Z",
    readingAtPublish: snapshot,
    moderationState: "published",
    language: "en",
  },
  {
    id: "r-3",
    takeId: "t-2",
    issueId: ISSUE,
    userId: "u-contrib-1",
    body:
      "Fair, and it changed how I read the pane. Though I would say the December piece still had the option of writing about who lives along that road, and did not take it. The date explains what it could not know. It does not explain what it chose not to look at.",
    stance: "criticises",
    createdAt: "2026-03-15T09:05:00.000Z",
    readingAtPublish: snapshot,
    moderationState: "published",
    language: "en",
  },
  {
    id: "r-4",
    takeId: "t-5",
    issueId: ISSUE,
    userId: "u-contrib-3",
    body:
      "I do not agree with your conclusion but the distinction between the road works and the demolitions is one I had collapsed, and I should not have. Adjusting how I argue this, not what I think about the demolitions.",
    stance: "criticises",
    createdAt: "2026-06-17T07:20:00.000Z",
    readingAtPublish: snapshot,
    moderationState: "published",
    language: "en",
  },
  {
    id: "r-5",
    takeId: "t-3",
    issueId: ISSUE,
    userId: "u-advisor",
    body:
      "As the reviewer who approved that translation: this is exactly the reasoning we recorded when we chose सौंदर्यीकरण over a softer rendering. Translating it as 'making the city look nice' would have removed the official register, and the official register is the thing being argued about.",
    stance: "undecided",
    createdAt: "2026-06-11T09:30:00.000Z",
    readingAtPublish: snapshot,
    moderationState: "published",
    language: "en",
  },
];

export const reactions: Reaction[] = [
  { id: "rx-1", targetId: "t-1", userId: "u-contrib-2", kind: "clear-evidence", at: "2026-03-13T09:00:00.000Z" },
  { id: "rx-2", targetId: "t-1", userId: "u-contrib-3", kind: "helpful-reasoning", at: "2026-03-13T10:00:00.000Z" },
  { id: "rx-3", targetId: "t-1", userId: "u-panel", kind: "important-context", at: "2026-03-13T11:00:00.000Z" },
  { id: "rx-4", targetId: "t-2", userId: "u-contrib-1", kind: "important-context", at: "2026-03-15T09:10:00.000Z" },
  { id: "rx-5", targetId: "t-2", userId: "u-mod", kind: "helpful-reasoning", at: "2026-03-15T12:00:00.000Z" },
  { id: "rx-6", targetId: "t-3", userId: "u-advisor", kind: "important-context", at: "2026-03-21T08:00:00.000Z" },
  { id: "rx-7", targetId: "t-3", userId: "u-contrib-1", kind: "helpful-reasoning", at: "2026-03-21T09:00:00.000Z" },
  { id: "rx-8", targetId: "t-3", userId: "u-contrib-6", kind: "clear-evidence", at: "2026-06-16T13:00:00.000Z" },
  { id: "rx-9", targetId: "t-5", userId: "u-contrib-2", kind: "important-context", at: "2026-06-17T08:00:00.000Z" },
  { id: "rx-10", targetId: "t-5", userId: "u-contrib-3", kind: "helpful-reasoning", at: "2026-06-17T08:10:00.000Z" },
  { id: "rx-11", targetId: "t-4", userId: "u-contrib-1", kind: "important-context", at: "2026-04-06T09:00:00.000Z" },
];

/* ------------------------------ moderation ------------------------------ */

export const predictions: ModerationPrediction[] = [
  {
    id: "mp-1",
    targetId: "t-4",
    targetType: "take",
    modelName: "counterframe-local-heuristic",
    modelVersion: "0.3.0",
    scores: { harassment: 0.71, "targeted-abuse": 0.44, none: 0.29 },
    topCategory: "harassment",
    confidence: 0.71,
    at: "2026-08-12T10:02:00.000Z",
    autoHidden: true,
  },
  {
    id: "mp-2",
    targetId: "t-6",
    targetType: "take",
    modelName: "counterframe-local-heuristic",
    modelVersion: "0.3.0",
    scores: { spam: 0.94, "off-topic": 0.62, none: 0.03 },
    topCategory: "spam",
    confidence: 0.94,
    at: "2026-08-22T03:14:10.000Z",
    autoHidden: true,
  },
  {
    id: "mp-3",
    targetId: "t-5",
    targetType: "take",
    modelName: "counterframe-local-heuristic",
    modelVersion: "0.3.0",
    scores: { none: 0.97 },
    topCategory: "none",
    confidence: 0.97,
    at: "2026-06-16T12:30:05.000Z",
    autoHidden: false,
  },
];

export const flags: ModerationFlag[] = [
  {
    id: "mf-1",
    targetId: "t-4",
    targetType: "take",
    reporterId: "u-contrib-6",
    reason: "harassment",
    note: "Reads as an attack on the journalist rather than on the reporting.",
    at: "2026-08-12T09:58:00.000Z",
    status: "resolved",
    predictionId: "mp-1",
    priority: "high",
  },
  {
    id: "mf-2",
    targetId: "t-6",
    targetType: "take",
    reporterId: "u-contrib-2",
    reason: "spam",
    at: "2026-08-22T06:40:00.000Z",
    status: "open",
    predictionId: "mp-2",
    priority: "high",
  },
  {
    id: "mf-3",
    targetId: "t-5",
    targetType: "take",
    reporterId: "u-contrib-4",
    reason: "off-topic",
    note: "I disagree with this strongly.",
    at: "2026-06-18T11:00:00.000Z",
    status: "open",
    predictionId: "mp-3",
    priority: "low",
  },
];

export const moderationActions: ModerationAction[] = [
  {
    id: "ma-1",
    targetId: "t-4",
    targetType: "take",
    moderatorId: "u-mod",
    kind: "temporarily-hide",
    reason:
      "Hidden pending review following a user report and a 0.71 harassment score. Hiding rather than removing, because on a first read the criticism appears directed at the reporting rather than at the journalist and I want a second opinion.",
    at: "2026-08-12T10:15:00.000Z",
    flagId: "mf-1",
    predictionId: "mp-1",
  },
  {
    id: "ma-2",
    targetId: "t-4",
    targetType: "take",
    moderatorId: "u-panel",
    kind: "restore",
    reason:
      "Restored on appeal. The panel found the criticism is directed at an institutional practice, not at a person. The classifier matched on a keyword without regard to its object, and that false positive has been logged for review of the keyword list.",
    at: "2026-08-14T16:05:00.000Z",
    flagId: "mf-1",
    predictionId: "mp-1",
  },
];

export const appeals: Appeal[] = [
  {
    id: "ap-1",
    actionId: "ma-1",
    targetId: "t-4",
    userId: "u-contrib-4",
    body:
      "I did not attack anyone. I criticised a pattern in how civic works get reported, and I said explicitly that I was not accusing the report of lying. If naming that pattern is harassment then the platform cannot host the discussion it says it wants.",
    at: "2026-08-12T18:30:00.000Z",
    status: "upheld",
    decisionNote:
      "Appeal upheld. Content restored, moderation record annotated, classifier false positive logged. Panel decision pd-appeal-1.",
    decidedAt: "2026-08-14T16:00:00.000Z",
    decidedBy: "u-panel",
  },
];

export const savedIssues: SavedIssue[] = [
  { userId: "u-reader", issueId: "iss-delhi-g20", at: "2026-08-26T19:00:00.000Z" },
  { userId: "u-contrib-1", issueId: "iss-delhi-g20", at: "2026-03-12T09:00:00.000Z" },
];

export const auditLog: AuditLog[] = [
  {
    id: "al-1",
    actorId: "u-panel",
    actorRole: "panel",
    action: "issue.publish",
    targetType: "issue",
    targetId: "iss-delhi-g20",
    at: "2026-03-02T11:30:00.000Z",
    detail: "Published after neutral rewording. Revision rev-001.",
  },
  {
    id: "al-2",
    actorId: "u-panel",
    actorRole: "panel",
    action: "article.frame-label",
    targetType: "article",
    targetId: "art-outlook-upgrade",
    at: "2026-03-09T09:35:00.000Z",
    detail: "Label 'supports' set. One recusal recorded (pm-ravi).",
  },
  {
    id: "al-3",
    actorId: "u-panel",
    actorRole: "panel",
    action: "article.correction",
    targetType: "article",
    targetId: "art-dte-evictions",
    at: "2026-05-18T14:30:00.000Z",
    detail: "Eviction figure reattributed to the HLRN report. Revision rev-005.",
  },
  {
    id: "al-4",
    actorId: "u-mod",
    actorRole: "moderator",
    action: "moderation.temporarily-hide",
    targetType: "take",
    targetId: "t-4",
    at: "2026-08-12T10:15:00.000Z",
    detail: "Hidden pending review on flag mf-1.",
  },
  {
    id: "al-5",
    actorId: "u-panel",
    actorRole: "panel",
    action: "moderation.restore",
    targetType: "take",
    targetId: "t-4",
    at: "2026-08-14T16:05:00.000Z",
    detail: "Restored on appeal ap-1. Panel decision pd-appeal-1.",
  },
  {
    id: "al-6",
    actorId: "u-admin",
    actorRole: "admin",
    action: "funding.revise-description",
    targetType: "allocation",
    targetId: "fa-delhi-1",
    at: "2026-03-16T09:00:00.000Z",
    detail: "Allocation description itemised. Revision rev-013.",
  },
  {
    id: "al-7",
    actorId: "u-advisor",
    actorRole: "panel",
    action: "translation.approve",
    targetType: "translation",
    targetId: "tr-issue-hi",
    at: "2026-06-11T08:50:00.000Z",
    detail: "Hindi issue framing approved; translator credited as Sunehra.",
  },
];
