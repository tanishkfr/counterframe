import type { ModerationCategory, ModerationPrediction } from "../types";

/**
 * MODERATION ADAPTER
 * ------------------
 * A provider interface, plus a deterministic local implementation that needs
 * no model service, no API key and no network. Swapping in a real open-source
 * classifier means implementing `ModerationProvider` and changing one line in
 * `activeProvider` — nothing else in the app knows which provider is running.
 *
 * Safety rules encoded here, not left to the UI:
 *  - The provider never removes content. The strongest thing it can do is set
 *    `autoHidden`, which puts the content into an "Under review" state that is
 *    visible to the author and explained on the public moderation record.
 *  - Auto-hiding requires a high confidence AND a category in
 *    `AUTO_HIDE_CATEGORIES`. Disagreement, anger and unpopular opinion are not
 *    in that list and cannot trigger it.
 *  - Every prediction records model name, version, per-category scores,
 *    confidence and timestamp, so a human reviewing it can see what the
 *    machine actually claimed.
 */

export interface ModerationInput {
  targetId: string;
  targetType: "take" | "reply";
  text: string;
  title?: string;
}

export interface ModerationProvider {
  readonly modelName: string;
  readonly modelVersion: string;
  classify(input: ModerationInput): Promise<ModerationPrediction>;
}

/** Only these categories may auto-hide pending human review. */
export const AUTO_HIDE_CATEGORIES: ModerationCategory[] = [
  "threat",
  "hate-speech",
  "targeted-abuse",
  "spam",
];

export const AUTO_HIDE_THRESHOLD = 0.85;

/**
 * Deterministic keyword-and-shape heuristic. It is intentionally crude, and
 * the demo shows it being wrong: the seeded appeal is upheld because this
 * classifier matched a keyword without regard to what the keyword was aimed
 * at. That failure is the point — it is why a human decision is required.
 */
const SIGNALS: Array<{ category: ModerationCategory; weight: number; pattern: RegExp }> = [
  { category: "threat", weight: 0.95, pattern: /\b(kill|hunt (?:you|them) down|burn (?:you|your) \w+)\b/i },
  { category: "hate-speech", weight: 0.9, pattern: /\b(subhuman|vermin|filth(?:y)? people)\b/i },
  { category: "targeted-abuse", weight: 0.8, pattern: /\b(you(?:'re| are) (?:an? )?(?:idiot|moron|fraud|liar))\b/i },
  { category: "harassment", weight: 0.7, pattern: /\b(shut up|nobody cares what you|stop posting)\b/i },
  { category: "harassment", weight: 0.55, pattern: /\b(hide the poor|screens tell you everything)\b/i },
  { category: "spam", weight: 0.94, pattern: /\b(link in bio|guaranteed returns|dm me|limited spots|act now|crypto signals)\b/i },
  { category: "spam", weight: 0.6, pattern: /(https?:\/\/\S+){4,}/i },
  { category: "off-topic", weight: 0.5, pattern: /\b(buy now|subscribe to my|follow me on)\b/i },
];

/** ALL-CAPS shouting nudges harassment slightly, but never on its own. */
function shoutingRatio(text: string): number {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 20) return 0;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length;
}

export class LocalHeuristicProvider implements ModerationProvider {
  readonly modelName = "counterframe-local-heuristic";
  readonly modelVersion = "0.3.0";

  async classify(input: ModerationInput): Promise<ModerationPrediction> {
    const haystack = `${input.title ?? ""}\n${input.text}`;
    const scores: Partial<Record<ModerationCategory, number>> = {};

    for (const signal of SIGNALS) {
      if (signal.pattern.test(haystack)) {
        const current = scores[signal.category] ?? 0;
        scores[signal.category] = Math.max(current, signal.weight);
      }
    }

    const shout = shoutingRatio(haystack);
    if (shout > 0.6) {
      scores.harassment = Math.min(0.6, (scores.harassment ?? 0) + 0.15);
    }

    const entries = Object.entries(scores) as Array<[ModerationCategory, number]>;
    const ranked = entries.sort((a, b) => b[1] - a[1]);
    const top = ranked[0];

    const topCategory: ModerationCategory = top ? top[0] : "none";
    const confidence = top ? top[1] : 0.97;
    if (!top) scores.none = 0.97;

    const autoHidden =
      AUTO_HIDE_CATEGORIES.includes(topCategory) && confidence >= AUTO_HIDE_THRESHOLD;

    return {
      id: `mp-${input.targetId}-${Date.now()}`,
      targetId: input.targetId,
      targetType: input.targetType,
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      scores,
      topCategory,
      confidence: Number(confidence.toFixed(2)),
      at: new Date().toISOString(),
      autoHidden,
    };
  }
}

/**
 * Swap this for a hosted open-source classifier by implementing
 * `ModerationProvider` and returning it here. Nothing else changes.
 */
export const activeProvider: ModerationProvider = new LocalHeuristicProvider();

export function describePrediction(prediction: ModerationPrediction): string {
  if (prediction.topCategory === "none") {
    return "No moderation category detected.";
  }
  const pct = Math.round(prediction.confidence * 100);
  return prediction.autoHidden
    ? `Scored ${pct}% for ${prediction.topCategory.replace("-", " ")} and hidden pending human review. A moderator must decide; the model cannot remove content.`
    : `Scored ${pct}% for ${prediction.topCategory.replace("-", " ")}. Queued for human review; no automatic action taken.`;
}
