import { describe, expect, it } from "vitest";

import {
  applyArticleRevision,
  assertArticleMutationAllowed,
  assertRevisionTargetAllowed,
  ImmutableSourceError,
  isPlatformBlock,
  isSourceBlock,
} from "./immutability";
import { createSeedDatabase } from "./seed";

const db = createSeedDatabase();
const article = db.articles[0]!;

describe("source immutability", () => {
  it("refuses to mutate source text", () => {
    expect(() => assertArticleMutationAllowed(["blocks"])).toThrow(ImmutableSourceError);
  });

  it("refuses to mutate original source metadata", () => {
    expect(() => assertArticleMutationAllowed(["metadata"])).toThrow(ImmutableSourceError);
  });

  it("refuses to mutate identity fields", () => {
    expect(() => assertArticleMutationAllowed(["id"])).toThrow(ImmutableSourceError);
    expect(() => assertArticleMutationAllowed(["issueId"])).toThrow(ImmutableSourceError);
  });

  it("throws rather than silently dropping a disallowed change", () => {
    // The failure mode that matters: a caller must not be able to believe an
    // edit succeeded while the source quietly stayed the same.
    expect(() =>
      applyArticleRevision(article, { metadata: {} } as never),
    ).toThrow(ImmutableSourceError);
  });

  it("names the offending field in the error", () => {
    try {
      assertArticleMutationAllowed(["neutralSummary", "metadata"]);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("metadata");
      expect((error as Error).message).toMatch(/immutable/i);
    }
  });
});

describe("platform-authored material stays editable", () => {
  it("allows revising the neutral summary", () => {
    const next = applyArticleRevision(article, { neutralSummary: "Revised summary." });
    expect(next.neutralSummary).toBe("Revised summary.");
    // The source itself is carried through untouched.
    expect(next.blocks).toBe(article.blocks);
    expect(next.metadata).toBe(article.metadata);
  });

  it("allows revising tags, editorial status and the rubric", () => {
    expect(() =>
      assertArticleMutationAllowed(["topics", "editorialStatus", "rubric", "image"]),
    ).not.toThrow();
  });
});

describe("revision targets", () => {
  it("accepts every platform-authored entity", () => {
    for (const entity of [
      "issue",
      "neutral-summary",
      "frame-label",
      "tags",
      "panel-note",
      "correction",
      "translation",
      "annotation",
      "funding-description",
    ] as const) {
      expect(() => assertRevisionTargetAllowed({ entity })).not.toThrow();
    }
  });

  it("rejects a revision aimed at source material", () => {
    expect(() =>
      assertRevisionTargetAllowed({ entity: "source-text" as never }),
    ).toThrow(ImmutableSourceError);
  });

  it("has no seeded revision targeting source text or metadata", () => {
    for (const revision of db.revisions) {
      expect(() => assertRevisionTargetAllowed(revision)).not.toThrow();
      for (const change of revision.changes) {
        expect(["metadata", "blocks", "originalHeadline", "canonicalUrl", "outlet"]).not.toContain(
          change.field,
        );
      }
    }
  });
});

describe("block classification", () => {
  it("separates source text from platform text across every seeded article", () => {
    for (const record of db.articles) {
      for (const block of record.blocks) {
        expect(isSourceBlock(block) !== isPlatformBlock(block)).toBe(true);
      }
      // Every article must carry both, or the separation teaches nothing.
      expect(record.blocks.some(isSourceBlock)).toBe(true);
      expect(record.blocks.some(isPlatformBlock)).toBe(true);
    }
  });

  it("only attaches revision ids to platform blocks", () => {
    for (const record of db.articles) {
      for (const block of record.blocks) {
        if (block.revisionId) expect(isPlatformBlock(block)).toBe(true);
      }
    }
  });
});
