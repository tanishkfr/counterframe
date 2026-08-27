import type { ArticleBlock, RevisableEntity, Revision, SourceArticle } from "./types";

/**
 * The single enforcement point for the platform's central promise: source text
 * and original source metadata cannot be edited through Counterframe, by
 * anyone, in any role.
 *
 * This is not a UI convention. Every mutation that touches an article passes
 * through `assertArticleMutationAllowed`, which throws rather than silently
 * dropping a disallowed change, so a bug surfaces instead of quietly rewriting
 * a source. `src/lib/immutability.test.ts` covers it.
 */

export const IMMUTABLE_ARTICLE_FIELDS = ["metadata", "blocks", "id", "issueId"] as const;

export const REVISABLE_ARTICLE_FIELDS = [
  "neutralSummary",
  "frameLabel",
  "topics",
  "editorialStatus",
  "rubric",
  "image",
  "evidenceLinks",
] as const;

export type RevisableArticleField = (typeof REVISABLE_ARTICLE_FIELDS)[number];

export class ImmutableSourceError extends Error {
  constructor(field: string) {
    super(
      `Refused to modify "${field}". Source text and original source metadata are immutable in Counterframe. ` +
        `Platform-authored material is revised instead, and the change is recorded as a Revision.`,
    );
    this.name = "ImmutableSourceError";
  }
}

export function assertArticleMutationAllowed(fields: string[]): void {
  for (const field of fields) {
    if ((IMMUTABLE_ARTICLE_FIELDS as readonly string[]).includes(field)) {
      throw new ImmutableSourceError(field);
    }
  }
}

/** Blocks a reader may see rendered as platform-authored, and which may be revised. */
export function isPlatformBlock(block: ArticleBlock): boolean {
  return block.kind === "platform-summary" || block.kind === "platform-note";
}

/** Blocks reproduced verbatim from the source. Never editable, never translated. */
export function isSourceBlock(block: ArticleBlock): boolean {
  return block.kind === "source-quote" || block.kind === "source-heading";
}

/**
 * Revisions may only target platform-authored entities. A revision naming a
 * source entity is a programming error, not a permissions question.
 */
const REVISABLE_ENTITIES: RevisableEntity[] = [
  "issue",
  "neutral-summary",
  "frame-label",
  "tags",
  "panel-note",
  "correction",
  "translation",
  "annotation",
  "funding-description",
];

export function assertRevisionTargetAllowed(revision: Pick<Revision, "entity">): void {
  if (!REVISABLE_ENTITIES.includes(revision.entity)) {
    throw new ImmutableSourceError(revision.entity);
  }
}

/** Applies a revision to an article, refusing anything that touches source material. */
export function applyArticleRevision(
  article: SourceArticle,
  patch: Partial<Pick<SourceArticle, RevisableArticleField>>,
): SourceArticle {
  assertArticleMutationAllowed(Object.keys(patch));
  return { ...article, ...patch };
}
