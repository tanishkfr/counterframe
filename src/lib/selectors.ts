import type {
  Annotation,
  CommunityTake,
  Database,
  Issue,
  IssueSort,
  Reaction,
  Reply,
  SearchFilter,
  SourceArticle,
  Stance,
  User,
} from "./types";

/* ------------------------------- lookups -------------------------------- */

export const byId = <T extends { id: string }>(rows: T[], id: string | undefined) =>
  id ? rows.find((r) => r.id === id) : undefined;

export const issueBySlug = (db: Database, slug: string) => db.issues.find((i) => i.slug === slug);

export const articlesFor = (db: Database, ids: string[]): SourceArticle[] =>
  ids.map((id) => db.articles.find((a) => a.id === id)).filter((a): a is SourceArticle => Boolean(a));

export const userById = (db: Database, id: string | undefined): User | undefined =>
  id ? db.users.find((u) => u.id === id) : undefined;

export const userByPseudonym = (db: Database, pseudonym: string): User | undefined =>
  db.users.find((u) => u.pseudonym.toLowerCase() === pseudonym.toLowerCase());

export const annotationsFor = (db: Database, articleId: string): Annotation[] =>
  db.annotations.filter((a) => a.articleId === articleId);

/** The two articles a reader must complete before posting on an issue. */
export const primaryArticleIds = (issue: Issue): string[] => {
  const a = issue.viewpointA.articleIds[0];
  const b = issue.viewpointB.articleIds[0];
  return [a, b].filter((id): id is string => Boolean(id));
};

/* -------------------------------- stance -------------------------------- */

export interface StanceDistribution {
  counts: Record<Stance, number>;
  total: number;
  fractions: Record<Stance, number>;
}

export function stanceDistribution(db: Database, issueId: string): StanceDistribution {
  const votes = db.stanceVotes.filter((v) => v.issueId === issueId);
  const counts: Record<Stance, number> = { supports: 0, criticises: 0, undecided: 0 };
  for (const v of votes) counts[v.stance] += 1;
  const total = votes.length;
  const fractions: Record<Stance, number> = {
    supports: total ? counts.supports / total : 0,
    criticises: total ? counts.criticises / total : 0,
    undecided: total ? counts.undecided / total : 0,
  };
  return { counts, total, fractions };
}

/** Voters who chose to appear publicly. Everyone else still counts in the total. */
export function publicVoters(db: Database, issueId: string) {
  return db.stanceVotes
    .filter((v) => v.issueId === issueId && v.publicProfile)
    .map((v) => ({ vote: v, user: userById(db, v.userId) }))
    .filter((row): row is { vote: (typeof db.stanceVotes)[number]; user: User } => Boolean(row.user))
    .sort((a, b) => b.vote.updatedAt.localeCompare(a.vote.updatedAt));
}

export const currentVote = (db: Database, issueId: string, userId: string | null) =>
  userId ? db.stanceVotes.find((v) => v.issueId === issueId && v.userId === userId) : undefined;

/* ------------------------------ discussion ------------------------------ */

/** Content the public may see. Removed and hidden content is never rendered as text. */
export const isPubliclyVisible = (state: CommunityTake["moderationState"]) =>
  state === "published" || state === "restored" || state === "edits-requested";

export const reactionsFor = (db: Database, targetId: string): Reaction[] =>
  db.reactions.filter((r) => r.targetId === targetId);

export const repliesFor = (db: Database, takeId: string): Reply[] =>
  db.replies.filter((r) => r.takeId === takeId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export type TakeSort = "newest" | "most-reasoned";

/**
 * "Most reasoned" deliberately weights reactions that describe quality of
 * argument, and includes reply count as a weaker signal of engagement. There
 * is no like count, and no score is shown to users as a number.
 */
export function sortTakes(db: Database, takes: CommunityTake[], sort: TakeSort): CommunityTake[] {
  const copy = [...takes];
  if (sort === "newest") {
    return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const score = (t: CommunityTake) => {
    const rx = reactionsFor(db, t.id);
    const weighted =
      rx.filter((r) => r.kind === "clear-evidence").length * 3 +
      rx.filter((r) => r.kind === "helpful-reasoning").length * 3 +
      rx.filter((r) => r.kind === "important-context").length * 2;
    const evidence = t.evidence.length * 2;
    const replies = repliesFor(db, t.id).length;
    return weighted + evidence + replies;
  };
  return copy.sort((a, b) => score(b) - score(a) || b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------- discovery ------------------------------ */

export const emptyFilter: SearchFilter = {
  query: "",
  topics: [],
  countries: [],
  regions: [],
  statuses: [],
  sourceTypes: [],
  hasAdditionalPerspectives: false,
  sort: "recently-updated",
};

function issueHaystack(db: Database, issue: Issue): string {
  const articleIds = [
    ...issue.viewpointA.articleIds,
    ...issue.viewpointB.articleIds,
    ...issue.additionalPerspectiveIds,
  ];
  const articles = articlesFor(db, articleIds);
  return [
    issue.title,
    issue.summary,
    issue.region,
    ...issue.countries,
    ...issue.topics,
    ...articles.map((a) => a.metadata.originalHeadline),
    ...articles.map((a) => a.metadata.outlet),
    ...articles.map((a) => a.metadata.author.value ?? ""),
  ]
    .join(" ")
    .toLowerCase();
}

export function issueArticleCount(issue: Issue): number {
  return (
    issue.viewpointA.articleIds.length +
    issue.viewpointB.articleIds.length +
    issue.additionalPerspectiveIds.length
  );
}

export function readCount(db: Database, issue: Issue): number {
  const ids = new Set([
    ...issue.viewpointA.articleIds,
    ...issue.viewpointB.articleIds,
    ...issue.additionalPerspectiveIds,
  ]);
  return new Set(
    db.completions.filter((c) => ids.has(c.articleId)).map((c) => `${c.userId}`),
  ).size;
}

export function debateCount(db: Database, issue: Issue): number {
  return (
    db.takes.filter((t) => t.issueId === issue.id && isPubliclyVisible(t.moderationState)).length +
    db.replies.filter((r) => r.issueId === issue.id && isPubliclyVisible(r.moderationState)).length
  );
}

function sortIssues(db: Database, issues: Issue[], sort: IssueSort): Issue[] {
  const copy = [...issues];
  switch (sort) {
    case "most-debated":
      return copy.sort((a, b) => debateCount(db, b) - debateCount(db, a));
    case "most-read":
      return copy.sort((a, b) => readCount(db, b) - readCount(db, a));
    default:
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export function filterIssues(db: Database, filter: SearchFilter): Issue[] {
  const q = filter.query.trim().toLowerCase();
  const matched = db.issues.filter((issue) => {
    if (q && !issueHaystack(db, issue).includes(q)) return false;
    if (filter.statuses.length && !filter.statuses.includes(issue.status)) return false;
    if (filter.topics.length && !filter.topics.some((t) => issue.topics.includes(t))) return false;
    if (filter.countries.length && !filter.countries.some((c) => issue.countries.includes(c))) return false;
    if (filter.regions.length && !filter.regions.includes(issue.region)) return false;
    if (filter.hasAdditionalPerspectives && issue.additionalPerspectiveIds.length === 0) return false;
    if (filter.sourceTypes.length) {
      const all = articlesFor(db, [
        ...issue.viewpointA.articleIds,
        ...issue.viewpointB.articleIds,
        ...issue.additionalPerspectiveIds,
      ]);
      if (!all.some((a) => filter.sourceTypes.includes(a.metadata.sourceType))) return false;
    }
    return true;
  });
  return sortIssues(db, matched, filter.sort);
}

export function facetValues(db: Database) {
  const topics = new Set<string>();
  const countries = new Set<string>();
  const regions = new Set<string>();
  for (const issue of db.issues) {
    issue.topics.forEach((t) => topics.add(t));
    issue.countries.forEach((c) => countries.add(c));
    regions.add(issue.region);
  }
  return {
    topics: [...topics].sort(),
    countries: [...countries].sort(),
    regions: [...regions].sort(),
  };
}

/* ---------------------------- transparency ------------------------------ */

export function issueRevisions(db: Database, issueId: string) {
  return db.revisions
    .filter((r) => r.issueId === issueId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function issueDecisions(db: Database, issueId: string) {
  return db.panelDecisions
    .filter((d) => d.relatedIssueId === issueId)
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
}

export function issueFundingActivity(db: Database, issueId: string) {
  const rows = [
    ...db.contributions
      .filter((c) => c.destination === "issue" && c.issueId === issueId)
      .map((c) => ({ kind: "contribution" as const, at: c.at, row: c })),
    ...db.allocations
      .filter((a) => a.issueId === issueId)
      .map((a) => ({ kind: "allocation" as const, at: a.at, row: a })),
    ...db.expenses
      .filter((e) => e.issueId === issueId)
      .map((e) => ({ kind: "expense" as const, at: e.at, row: e })),
  ];
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

/* -------------------------------- panel --------------------------------- */

export const panelMemberById = (db: Database, id: string | undefined) =>
  id ? db.panelMembers.find((m) => m.id === id) : undefined;

export const openProposals = (db: Database) =>
  db.proposals
    .filter((p) => p.status === "submitted" || p.status === "under-review")
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

export const pendingTranslations = (db: Database) =>
  db.translations.filter((t) => t.status === "user-submitted" || t.status === "machine-draft");

/* ------------------------------ moderation ------------------------------ */

export interface QueueItem {
  targetId: string;
  targetType: "take" | "reply";
  title: string;
  body: string;
  authorPseudonym: string;
  issueId: string;
  state: CommunityTake["moderationState"];
  flags: Database["flags"];
  prediction: Database["predictions"][number] | undefined;
  createdAt: string;
}

export function moderationQueue(db: Database): QueueItem[] {
  const targets = new Set<string>();
  for (const f of db.flags) targets.add(f.targetId);
  for (const p of db.predictions) if (p.topCategory !== "none") targets.add(p.targetId);
  for (const t of db.takes) if (t.moderationState === "temporarily-hidden") targets.add(t.id);

  const items: QueueItem[] = [];
  for (const id of targets) {
    const take = db.takes.find((t) => t.id === id);
    const reply = db.replies.find((r) => r.id === id);
    const flags = db.flags.filter((f) => f.targetId === id);
    const prediction = db.predictions
      .filter((p) => p.targetId === id)
      .sort((a, b) => b.at.localeCompare(a.at))[0];

    if (take) {
      items.push({
        targetId: take.id,
        targetType: "take",
        title: take.title,
        body: take.body,
        authorPseudonym: userById(db, take.userId)?.pseudonym ?? "Unknown",
        issueId: take.issueId,
        state: take.moderationState,
        flags,
        prediction,
        createdAt: take.createdAt,
      });
    } else if (reply) {
      items.push({
        targetId: reply.id,
        targetType: "reply",
        title: "Reply",
        body: reply.body,
        authorPseudonym: userById(db, reply.userId)?.pseudonym ?? "Unknown",
        issueId: reply.issueId,
        state: reply.moderationState,
        flags,
        prediction,
        createdAt: reply.createdAt,
      });
    }
  }

  const weight = (i: QueueItem) =>
    (i.state === "temporarily-hidden" ? 1000 : 0) +
    i.flags.filter((f) => f.status === "open").length * 10 +
    (i.prediction ? i.prediction.confidence * 10 : 0);

  return items.sort((a, b) => weight(b) - weight(a) || b.createdAt.localeCompare(a.createdAt));
}
