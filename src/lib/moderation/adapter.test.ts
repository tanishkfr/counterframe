import { describe, expect, it } from "vitest";

import {
  AUTO_HIDE_CATEGORIES,
  AUTO_HIDE_THRESHOLD,
  describePrediction,
  LocalHeuristicProvider,
} from "./adapter";

const provider = new LocalHeuristicProvider();

const classify = (text: string, title?: string) =>
  provider.classify({ targetId: "t-test", targetType: "take", text, title });

describe("local moderation provider", () => {
  it("records model name, version, scores and a timestamp on every prediction", async () => {
    const p = await classify("An ordinary, reasoned comment about municipal budget lines.");
    expect(p.modelName).toBe("counterframe-local-heuristic");
    expect(p.modelVersion).toBe("0.3.0");
    expect(p.scores).toBeTypeOf("object");
    expect(Number.isNaN(Date.parse(p.at))).toBe(false);
    expect(p.confidence).toBeGreaterThan(0);
  });

  it("leaves ordinary disagreement alone", async () => {
    const p = await classify(
      "I think this reading is wrong. The December date means the report could not have covered events from the following May, and treating that as concealment is an overreach.",
    );
    expect(p.topCategory).toBe("none");
    expect(p.autoHidden).toBe(false);
  });

  it("does not auto-hide strong criticism of a policy", async () => {
    const p = await classify(
      "This programme was indefensible and the officials responsible should be ashamed of what they signed off.",
    );
    expect(p.autoHidden).toBe(false);
  });

  it("flags spam with high confidence and hides it pending review", async () => {
    const p = await classify(
      "DM me for the full breakdown and daily signals. Limited spots. Guaranteed returns, link in bio.",
    );
    expect(p.topCategory).toBe("spam");
    expect(p.confidence).toBeGreaterThanOrEqual(AUTO_HIDE_THRESHOLD);
    expect(p.autoHidden).toBe(true);
  });

  it("is deterministic for the same input", async () => {
    const a = await classify("Nobody cares what you think about this.");
    const b = await classify("Nobody cares what you think about this.");
    expect(a.topCategory).toBe(b.topCategory);
    expect(a.confidence).toBe(b.confidence);
    expect(a.scores).toEqual(b.scores);
  });
});

describe("safety invariants", () => {
  it("never auto-hides a category outside the permitted list", async () => {
    // Matches a harassment pattern, which is deliberately NOT auto-hideable.
    const p = await classify("Shut up, this has been explained already.");
    expect(p.topCategory).toBe("harassment");
    expect(AUTO_HIDE_CATEGORIES).not.toContain("harassment");
    expect(p.autoHidden).toBe(false);
  });

  it("never auto-hides below the confidence threshold", async () => {
    const samples = [
      "buy now, subscribe to my channel",
      "A perfectly normal contribution with evidence links.",
      "This is the third time this argument has come up.",
    ];
    for (const text of samples) {
      const p = await classify(text);
      if (p.confidence < AUTO_HIDE_THRESHOLD) expect(p.autoHidden).toBe(false);
    }
  });

  it("has no code path that removes content", async () => {
    // The prediction shape carries only `autoHidden`. There is deliberately no
    // "autoRemoved" field, so removal cannot be expressed by the model at all.
    const p = await classify("kill them all");
    expect(Object.keys(p)).not.toContain("autoRemoved");
    expect(Object.keys(p)).not.toContain("removed");
  });

  it("describes an auto-hide as reversible and pending a human decision", async () => {
    const p = await classify("Limited spots, act now, guaranteed returns, link in bio.");
    const description = describePrediction(p);
    expect(description).toMatch(/pending human review/i);
    expect(description).toMatch(/cannot remove content/i);
  });

  it("says plainly when nothing was detected", async () => {
    const p = await classify("A calm, sourced point about the date gap between the two reports.");
    expect(describePrediction(p)).toBe("No moderation category detected.");
  });
});

describe("shouting", () => {
  it("nudges but never on its own reaches the auto-hide threshold", async () => {
    const p = await classify("READ THIS BEFORE YOU VOTE, EVERYONE IS MISSING THE REAL STORY HERE");
    expect(p.autoHidden).toBe(false);
    expect(p.confidence).toBeLessThan(AUTO_HIDE_THRESHOLD);
  });
});
