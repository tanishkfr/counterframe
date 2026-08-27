"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { Badge, FrameBadge, ReadingBadge } from "@/components/primitives";
import { FRAME_LABEL } from "@/lib/labels";
import { translate } from "@/lib/i18n";
import { emptyProgress } from "@/lib/reading";
import { articlesFor } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Issue, SourceArticle } from "@/lib/types";

import { ArticlePane } from "./ArticlePane";

type Side = "a" | "b";

export function ComparisonWorkspace({
  issue,
  footer,
}: {
  issue: Issue;
  /** Rendered inside the frame, directly under the two panes. */
  footer?: ReactNode;
}) {
  const { db, user, prefs, setPrefs, announce } = useStore();
  const t = (key: Parameters<typeof translate>[1]) => translate(prefs.language, key);

  const poolA = articlesFor(db, issue.viewpointA.articleIds);
  const poolB = articlesFor(db, issue.viewpointB.articleIds);

  const [selectedA, setSelectedA] = useState(poolA[0]?.id ?? "");
  const [selectedB, setSelectedB] = useState(poolB[0]?.id ?? "");
  const [focus, setFocus] = useState<Side | null>(null);
  const [activeSide, setActiveSide] = useState<Side>("a");
  const [mobileSide, setMobileSide] = useState<Side>("a");

  const scrollA = useRef<HTMLDivElement | null>(null);
  const scrollB = useRef<HTMLDivElement | null>(null);
  const syncing = useRef(false);

  const articleA = poolA.find((a) => a.id === selectedA) ?? poolA[0];
  const articleB = poolB.find((a) => a.id === selectedB) ?? poolB[0];

  // Stable identities: the panes attach scroll listeners keyed on these, and
  // fresh arrows on every render would detach and reattach them constantly.
  const activateA = useCallback(() => setActiveSide("a"), []);
  const activateB = useCallback(() => setActiveSide("b"), []);
  const setScrollA = useCallback((node: HTMLDivElement | null) => {
    scrollA.current = node;
  }, []);
  const setScrollB = useCallback((node: HTMLDivElement | null) => {
    scrollB.current = node;
  }, []);

  /**
   * Synchronised scrolling maps proportional position, not pixels: the two
   * articles are different lengths, so pixel-matching would drift immediately.
   * The `syncing` guard stops the two panes echoing each other.
   */
  const syncScroll = useCallback(
    (from: Side, fraction: number) => {
      if (!prefs.syncScroll || syncing.current) return;
      const target = from === "a" ? scrollB.current : scrollA.current;
      if (!target) return;
      syncing.current = true;
      target.scrollTop = fraction * (target.scrollHeight - target.clientHeight);
      requestAnimationFrame(() => {
        syncing.current = false;
      });
    },
    [prefs.syncScroll],
  );

  const scrollFractionA = useCallback((f: number) => syncScroll("a", f), [syncScroll]);
  const scrollFractionB = useCallback((f: number) => syncScroll("b", f), [syncScroll]);

  // An issue with no published pairing still renders as the same framed
  // object, so the shape of the page does not change depending on whether the
  // panel managed to secure sources — and the reasoning still has a home.
  if (!articleA || !articleB) {
    return (
      <section className="comparison" aria-labelledby="comparison-heading">
        <div className="comparison-bar">
          <h2 id="comparison-heading" className="eyebrow" style={{ color: "var(--ink)" }}>
            The comparison
          </h2>
        </div>
        <div style={{ padding: "var(--s-6) var(--s-5)" }}>
          <div className="empty">
            <p className="empty-title">No comparison is published for this issue yet</p>
            <p>
              The panel has not been able to secure two sources that meet the source policy. The
              issue record, its status and the reasoning are still readable in the History tab.
            </p>
          </div>
        </div>
        {footer && <div className="comparison-foot">{footer}</div>}
      </section>
    );
  }

  const toggleFocus = (side: Side) => {
    const next = focus === side ? null : side;
    setFocus(next);
    announce(
      next
        ? `Focused ${next === "a" ? issue.viewpointA.label : issue.viewpointB.label}. The other article stays available as a summary rail.`
        : "Comparison restored. Both articles are shown side by side.",
    );
  };

  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <div className="comparison-bar">
        <h2 id="comparison-heading" className="eyebrow" style={{ color: "var(--ink)" }}>
          The comparison
        </h2>

        <div className="workspace-toolbar">
          <div className="toggle-row">
          <label className="switch">
            <input
              type="checkbox"
              checked={prefs.showAnnotations}
              onChange={(e) => {
                setPrefs({ showAnnotations: e.target.checked });
                announce(
                  e.target.checked
                    ? "Media-tactic annotations shown."
                    : "Media-tactic annotations hidden.",
                );
              }}
            />
            {t("issue.annotations")}
          </label>

          <label className="switch">
            <input
              type="checkbox"
              checked={prefs.syncScroll}
              onChange={(e) => {
                setPrefs({ syncScroll: e.target.checked });
                announce(
                  e.target.checked
                    ? "Synchronised scrolling on. Panes scroll together by proportion."
                    : "Synchronised scrolling off. Each pane scrolls independently.",
                );
              }}
            />
            {t("issue.syncScroll")}
          </label>
        </div>

          {focus && (
            <button type="button" className="btn" onClick={() => toggleFocus(focus)}>
              {t("issue.restore")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile: a segmented switcher instead of two squeezed columns. */}
      <div className="pane-switcher">
        <div
          className="segmented"
          role="group"
          aria-label="Choose which viewpoint to read"
        >
          <button
            type="button"
            aria-pressed={mobileSide === "a"}
            onClick={() => setMobileSide("a")}
          >
            {issue.viewpointA.label}
          </button>
          <button
            type="button"
            aria-pressed={mobileSide === "b"}
            onClick={() => setMobileSide("b")}
          >
            {issue.viewpointB.label}
          </button>
        </div>
        <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
          {mobileSide === "a" ? articleA.metadata.outlet : articleB.metadata.outlet} ·{" "}
          {mobileSide === "a"
            ? articleB.metadata.outlet
            : articleA.metadata.outlet}{" "}
          is one tap away.
        </p>
      </div>

      <div className="compare" data-focus={focus ?? undefined} data-mobile-side={mobileSide}>
        {focus === "b" ? (
          <CollapsedRail
            side="a"
            article={articleA}
            label={issue.viewpointA.label}
            onRestore={() => toggleFocus("b")}
          />
        ) : (
          <ArticlePane
            side="a"
            article={articleA}
            viewpointLabel={issue.viewpointA.label}
            alternatives={poolA.filter((a) => a.id !== articleA.id)}
            onSelectAlternative={setSelectedA}
            focused={focus === "a"}
            onToggleFocus={() => toggleFocus("a")}
            active={activeSide === "a"}
            onActivate={activateA}
            showAnnotations={prefs.showAnnotations}
            scrollRef={setScrollA}
            onScrollFraction={scrollFractionA}
          />
        )}

        {focus === "a" ? (
          <CollapsedRail
            side="b"
            article={articleB}
            label={issue.viewpointB.label}
            onRestore={() => toggleFocus("a")}
          />
        ) : (
          <ArticlePane
            side="b"
            article={articleB}
            viewpointLabel={issue.viewpointB.label}
            alternatives={poolB.filter((a) => a.id !== articleB.id)}
            onSelectAlternative={setSelectedB}
            focused={focus === "b"}
            onToggleFocus={() => toggleFocus("b")}
            active={activeSide === "b"}
            onActivate={activateB}
            showAnnotations={prefs.showAnnotations}
            scrollRef={setScrollB}
            onScrollFraction={scrollFractionB}
          />
        )}

        {/* The panel's verdict on the pairing, sitting between the two sides.
            Marked decorative: the same verdict is stated in words in the
            footer below, where a screen reader gets it with its reasoning. */}
        <div className="compare-verdict" aria-hidden="true">
          {FRAME_LABEL[issue.contrastVerdict]}
        </div>
      </div>

      {(footer || user) && (
        <div className="comparison-foot">
          {footer}
          {user && <ReadingSummary issue={issue} />}
        </div>
      )}
    </section>
  );
}

/**
 * The collapsed side in focus mode. It keeps title, source, framing label and
 * completion status visible, so the comparison context is never lost.
 */
function CollapsedRail({
  side,
  article,
  label,
  onRestore,
}: {
  side: Side;
  article: SourceArticle;
  label: string;
  onRestore: () => void;
}) {
  const { db, user, hydrated } = useStore();
  const progress =
    db.readingProgress.find((p) => p.userId === user?.id && p.articleId === article.id) ??
    emptyProgress(user?.id ?? "anon", article.id);

  return (
    <aside className="pane-collapsed" data-side={side} aria-label={`${label}, collapsed`}>
      <Badge tone="ink">{label}</Badge>
      <h3>{article.metadata.originalHeadline}</h3>
      <p className="meta">{article.metadata.outlet}</p>
      <div style={{ display: "grid", gap: "var(--s-2)", marginBlockStart: "var(--s-3)" }}>
        <FrameBadge label={article.frameLabel.label} />
        {hydrated && user && <ReadingBadge state={progress.state} />}
      </div>
      <button
        type="button"
        className="btn"
        onClick={onRestore}
        style={{ marginBlockStart: "var(--s-4)", width: "100%" }}
      >
        Restore comparison
      </button>
    </aside>
  );
}

function ReadingSummary({ issue }: { issue: Issue }) {
  const { db, user } = useStore();
  const ids = [issue.viewpointA.articleIds[0], issue.viewpointB.articleIds[0]].filter(
    (id): id is string => Boolean(id),
  );
  const done = ids.filter((id) =>
    db.readingProgress.some(
      (p) => p.userId === user?.id && p.articleId === id && p.state === "completed",
    ),
  ).length;

  return (
    <p className="meta" style={{ marginBlockStart: "var(--s-5)" }} role="status">
      You have completed {done} of {ids.length} primary articles for this issue.{" "}
      {done < ids.length
        ? "Both are required before you can publish a take or reply."
        : "You can now take part in the discussion."}
    </p>
  );
}
