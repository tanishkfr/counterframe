import { describe, expect, it } from "vitest";

import { createSeedDatabase } from "./index";

const db = createSeedDatabase();

describe("annotation anchoring", () => {
  /**
   * The load-bearing invariant of the annotation layer: an anchor must be a
   * verbatim substring of the block it points at. If this ever fails, the
   * highlight silently detaches and the reader sees commentary attached to
   * nothing — or, worse, to the wrong sentence.
   */
  it("anchors every annotation to verbatim text in its block", () => {
    for (const annotation of db.annotations) {
      const article = db.articles.find((a) => a.id === annotation.articleId);
      expect(article, `article ${annotation.articleId} missing`).toBeDefined();

      const block = article!.blocks.find((b) => b.id === annotation.blockId);
      expect(block, `block ${annotation.blockId} missing on ${annotation.articleId}`).toBeDefined();

      expect(
        block!.text.includes(annotation.anchorText),
        `anchor "${annotation.anchorText}" not found verbatim in block ${annotation.blockId}`,
      ).toBe(true);
    }
  });

  it("only anchors annotations to source text, never to platform-authored text", () => {
    for (const annotation of db.annotations) {
      const article = db.articles.find((a) => a.id === annotation.articleId)!;
      const block = article.blocks.find((b) => b.id === annotation.blockId)!;
      expect(["source-quote", "source-heading"]).toContain(block.kind);
    }
  });

  it("gives every annotation an explanation and evidence", () => {
    for (const annotation of db.annotations) {
      expect(annotation.explanation.length).toBeGreaterThan(40);
      expect(annotation.evidence.length).toBeGreaterThan(10);
    }
  });

  it("points every education link at a lesson that exists", () => {
    const slugs = new Set(db.education.map((e) => e.slug));
    for (const annotation of db.annotations) {
      if (annotation.educationSlug) {
        expect(slugs.has(annotation.educationSlug), annotation.educationSlug).toBe(true);
      }
    }
  });
});

describe("source records", () => {
  it("never leaves a metadata field silently blank", () => {
    for (const article of db.articles) {
      const fields = [
        article.metadata.author,
        article.metadata.authorLocation,
        article.metadata.publishedAt,
        article.metadata.updatedAt,
        article.metadata.correctionPolicyUrl,
      ];
      for (const field of fields) {
        // A null value must always be explained by a non-"verified" state.
        if (field.value === null) {
          expect(field.state).not.toBe("verified");
        }
        // Anything unestablished must carry a note saying so.
        if (field.state !== "verified") {
          expect(field.note, `${article.id} missing note`).toBeTruthy();
        }
      }
    }
  });

  it("gives every framing label written reasoning and a panel decision", () => {
    for (const article of db.articles) {
      expect(article.frameLabel.rationale.length).toBeGreaterThan(80);
      expect(article.frameLabel.panelDecisionId).toBeTruthy();
      expect(
        db.panelDecisions.some((d) => d.id === article.frameLabel.panelDecisionId),
        `decision ${article.frameLabel.panelDecisionId} missing`,
      ).toBe(true);
    }
  });

  it("gives every rubric criterion a written note", () => {
    for (const article of db.articles) {
      expect(article.rubric.length).toBe(10);
      for (const criterion of article.rubric) {
        expect(criterion.note.length, `${article.id}/${criterion.key}`).toBeGreaterThan(10);
      }
    }
  });

  it("labels every image that is not the outlet's own as contextual", () => {
    for (const article of db.articles) {
      if (!article.image) continue;
      expect(article.image.alt.length).toBeGreaterThan(20);
      expect(article.image.credit).toBeTruthy();
      expect(article.image.licence).toBeTruthy();
      if (article.image.contextualOnly) {
        expect(article.image.caption.toLowerCase()).toContain("contextual image only");
      }
    }
  });
});

describe("referential integrity", () => {
  it("resolves every article referenced by an issue", () => {
    const ids = new Set(db.articles.map((a) => a.id));
    for (const issue of db.issues) {
      for (const id of [
        ...issue.viewpointA.articleIds,
        ...issue.viewpointB.articleIds,
        ...issue.additionalPerspectiveIds,
      ]) {
        expect(ids.has(id), `${issue.slug} references missing article ${id}`).toBe(true);
      }
    }
  });

  it("resolves every revision referenced by an article", () => {
    const ids = new Set(db.revisions.map((r) => r.id));
    for (const article of db.articles) {
      for (const id of article.revisionIds) {
        expect(ids.has(id), `${article.id} references missing revision ${id}`).toBe(true);
      }
    }
  });

  it("resolves every user referenced by a take, reply or vote", () => {
    const ids = new Set(db.users.map((u) => u.id));
    for (const take of db.takes) expect(ids.has(take.userId), take.id).toBe(true);
    for (const reply of db.replies) expect(ids.has(reply.userId), reply.id).toBe(true);
    for (const vote of db.stanceVotes) expect(ids.has(vote.userId), vote.id).toBe(true);
  });

  it("resolves every panel member referenced by a decision vote", () => {
    const ids = new Set(db.panelMembers.map((m) => m.id));
    for (const decision of db.panelDecisions) {
      for (const vote of decision.votes) {
        expect(ids.has(vote.memberId), `${decision.id} references ${vote.memberId}`).toBe(true);
      }
    }
  });

  it("attaches a conflict note to every recusal", () => {
    for (const decision of db.panelDecisions) {
      for (const vote of decision.votes) {
        if (vote.vote === "recuse") {
          expect(vote.conflictNote, `${decision.id}/${vote.memberId}`).toBeTruthy();
        }
      }
    }
  });
});

describe("demo coverage", () => {
  it("seeds the full range of statuses a reviewer needs to see", () => {
    expect(db.issues.map((i) => i.status)).toEqual(
      expect.arrayContaining(["active", "under-review", "archived"]),
    );
    expect(db.articles.map((a) => a.editorialStatus)).toContain("corrected");
    expect(db.takes.map((t) => t.moderationState)).toEqual(
      expect.arrayContaining(["published", "temporarily-hidden", "restored"]),
    );
    expect(db.proposals.map((p) => p.status)).toEqual(
      expect.arrayContaining(["published", "rejected", "under-review", "returned-for-clarification"]),
    );
    expect(db.translations.map((t) => t.status)).toEqual(
      expect.arrayContaining(["panel-approved", "user-submitted", "machine-draft"]),
    );
    expect(db.readingProgress.map((p) => p.state)).toEqual(
      expect.arrayContaining(["in-progress", "completed"]),
    );
    expect(db.appeals.length).toBeGreaterThan(0);
    expect(db.flags.length).toBeGreaterThan(0);
    expect(db.revisions.some((r) => r.entity === "correction")).toBe(true);
    expect(db.education.some((e) => e.video)).toBe(true);
    expect(db.education.some((e) => e.status === "under-review")).toBe(true);
    // One record deliberately carries no image, to exercise that state honestly.
    expect(db.articles.some((a) => a.image === null)).toBe(true);
  });

  it("gives the panel genuine regional and professional spread", () => {
    const regions = new Set(db.panelMembers.map((m) => m.region));
    expect(db.panelMembers.length).toBeGreaterThanOrEqual(10);
    expect(regions.size).toBeGreaterThanOrEqual(8);
    expect(db.panelMembers.some((m) => m.kind === "regional-advisor")).toBe(true);
  });

  it("ships an accessible video record with captions and a transcript", () => {
    const video = db.education.find((e) => e.video)?.video;
    expect(video).toBeDefined();
    expect(video!.captions.length).toBeGreaterThan(5);
    expect(video!.transcript.length).toBeGreaterThan(400);
    expect(video!.reducedMotionSummary.length).toBeGreaterThan(100);
    // Captions must be ordered and non-overlapping, or playback jumps.
    for (let i = 1; i < video!.captions.length; i += 1) {
      expect(video!.captions[i]!.start).toBeGreaterThanOrEqual(video!.captions[i - 1]!.end);
    }
  });
});
