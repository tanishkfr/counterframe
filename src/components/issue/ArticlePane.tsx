"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Badge, FrameBadge, Notice, ProgressBar, ReadingBadge } from "@/components/primitives";
import { formatDuration, hostname } from "@/lib/format";
import { translate } from "@/lib/i18n";
import { checkpointStatus, emptyProgress, END_THRESHOLD, requiredDwellMs } from "@/lib/reading";
import { annotationsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store/AppStore";
import type { Annotation, SourceArticle } from "@/lib/types";

import { AnnotatedHeadline, ArticleBody, HeadlineAnnotations } from "./ArticleBody";
import { SourceInspector, SourceMetaBar } from "./SourceMeta";

interface Props {
  side: "a" | "b";
  article: SourceArticle;
  viewpointLabel: string;
  /** Other eligible sources for this side, offered as a compact switcher. */
  alternatives: SourceArticle[];
  onSelectAlternative: (articleId: string) => void;
  focused: boolean;
  onToggleFocus: () => void;
  active: boolean;
  onActivate: () => void;
  showAnnotations: boolean;
  scrollRef?: (node: HTMLDivElement | null) => void;
  onScrollFraction?: (fraction: number) => void;
  hidden?: boolean;
}

export function ArticlePane({
  side,
  article,
  viewpointLabel,
  alternatives,
  onSelectAlternative,
  focused,
  onToggleFocus,
  active,
  onActivate,
  showAnnotations,
  scrollRef,
  onScrollFraction,
  hidden,
}: Props) {
  const { db, user, prefs, recordReading, completeArticle, hydrated } = useStore();
  const language = prefs.language;
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const [resumeOffered, setResumeOffered] = useState(false);

  const annotations: Annotation[] = useMemo(
    () => annotationsFor(db, article.id),
    [db, article.id],
  );

  const progress = useMemo(
    () =>
      db.readingProgress.find((p) => p.userId === user?.id && p.articleId === article.id) ??
      emptyProgress(user?.id ?? "anon", article.id),
    [db.readingProgress, user?.id, article.id],
  );

  // Annotations anchored to the headline block, which the header renders.
  const headingBlockId = article.blocks.find((b) => b.kind === "source-heading")?.id;
  const headlineAnnotations = annotations.filter((a) => a.blockId === headingBlockId);

  const status = checkpointStatus(progress, article);
  const requiredMs = requiredDwellMs(article);

  const translated = useMemo(() => {
    if (language === "en") return null;
    const approved = db.translations.find(
      (tr) =>
        tr.targetType === "article" &&
        tr.targetId === article.id &&
        tr.language === language &&
        tr.status === "panel-approved",
    );
    return approved?.content ?? null;
  }, [db.translations, article.id, language]);

  /* ------------------------------ dwell ------------------------------- */

  // Dwell accrues only while this pane is the active one and the tab is in
  // the foreground. It is time with the article open and attended to, and the
  // checkpoint says exactly that rather than claiming comprehension.
  useEffect(() => {
    if (!user || !active || hidden || progress.state === "completed") return;
    let cancelled = false;
    const tick = setInterval(() => {
      if (cancelled || document.visibilityState !== "visible") return;
      // The pane must actually be on screen. Next.js keeps a hidden copy of a
      // route tree around during navigation, and without this check both
      // copies would tick, doubling the recorded reading time.
      const node = containerRef.current;
      if (!node || node.offsetParent === null) return;
      recordReading(article.id, { dwellMs: 1000 });
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [user, active, hidden, article.id, progress.state, recordReading]);

  /* ----------------------------- scrolling ---------------------------- */

  /**
   * Records position only. Deliberately does NOT change the active pane: it
   * runs once on mount for every pane, and if it activated, the two panes
   * would fight on every render and the last one mounted would always win.
   */
  const measure = useCallback(() => {
    const node = containerRef.current;
    if (!node || node.offsetParent === null) return;
    const scrollable = node.scrollHeight - node.clientHeight;
    // A pane shorter than its container is fully read as soon as it is opened.
    const fraction = scrollable <= 8 ? 1 : Math.min(1, node.scrollTop / scrollable);
    onScrollFraction?.(fraction);
    if (!user) return;
    recordReading(article.id, {
      furthestFraction: fraction,
      reachedEnd: fraction >= END_THRESHOLD,
    });
  }, [article.id, user, recordReading, onScrollFraction]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    // A real scroll event is the clearest signal of attention, so only that
    // moves the active side. Without it, dwell would never accrue for a pane
    // the reader scrolls by keyboard or trackpad but never points at.
    const onScroll = () => {
      onActivate();
      measure();
    };
    // Fire once so a short article registers as reachable immediately.
    measure();
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [measure, onActivate]);

  // Offer to resume rather than jumping without warning.
  useEffect(() => {
    if (!hydrated || !user) return;
    if (progress.lastBlockId && progress.state === "in-progress") setResumeOffered(true);
    // Only on first mount for this article.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, article.id]);

  const resume = () => {
    const target = progress.lastBlockId
      ? document.getElementById(`block-${progress.lastBlockId}`)
      : null;
    target?.scrollIntoView({ block: "start" });
    setResumeOffered(false);
  };

  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    scrollRef?.(node);
  };

  const jumpTargets = article.blocks.filter((b) => b.kind !== "source-heading");

  return (
    <section
      className="pane"
      data-side={side}
      data-active={active}
      hidden={hidden}
      aria-labelledby={headingId}
      onPointerEnter={onActivate}
      onFocusCapture={onActivate}
    >
      {/* Column header: names the side and carries its labels, so the two
          columns are symmetrical and comparable before you read a word. */}
      <div className="pane-banner">
        <span className="pane-banner-label">{viewpointLabel}</span>
        <div className="pane-banner-marks">
          {hydrated && user && progress.state !== "completed" && (
            <span className="pane-timing" data-counting={active}>
              {active ? "Timing" : "Paused"}
            </span>
          )}
          <FrameBadge label={article.frameLabel.label} />
          {hydrated && user && <ReadingBadge state={progress.state} />}
          {article.editorialStatus === "corrected" && <Badge tone="brass">Corrected</Badge>}
        </div>
      </div>

      <div className="pane-head">
        <h2 className="article-headline" id={headingId}>
          <AnnotatedHeadline
            text={article.metadata.originalHeadline}
            annotations={headlineAnnotations}
            showAnnotations={showAnnotations}
          />
        </h2>

        {showAnnotations && <HeadlineAnnotations annotations={headlineAnnotations} />}

        <SourceMetaBar article={article} />

        <div className="pane-actions">
          {/* The domain is transparency, not a label. Keeping it out of the
              button keeps the control compact and still announces where the
              link goes to a screen reader. */}
          <a
            className="btn"
            href={article.metadata.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("issue.openOriginal")}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">
              — opens {hostname(article.metadata.canonicalUrl)} in a new tab
            </span>
          </a>
          <SourceInspector article={article} />
          <button
            type="button"
            className="btn"
            onClick={onToggleFocus}
            aria-pressed={focused}
          >
            {focused ? t("issue.exitFocus") : t("issue.focus")}
          </button>
        </div>

        {alternatives.length > 0 && (
          <div style={{ marginBlockStart: "var(--s-3)" }}>
            <label className="meta" htmlFor={`${headingId}-alt`}>
              {t("issue.sourceSwitcher")}
            </label>
            <select
              id={`${headingId}-alt`}
              className="section-jump"
              value={article.id}
              onChange={(e) => onSelectAlternative(e.target.value)}
              style={{ marginInlineStart: "var(--s-2)" }}
            >
              {[article, ...alternatives].map((option) => (
                <option key={option.id} value={option.id}>
                  {option.metadata.outlet} — {option.metadata.originalHeadline.slice(0, 48)}…
                </option>
              ))}
            </select>
          </div>
        )}

        {hydrated && user && (
          <div className="reading-strip">
            <span>{t("reading.progress")}</span>
            <ProgressBar value={progress.furthestFraction} label={`${t("reading.progress")}: ${article.metadata.outlet}`} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.round(progress.furthestFraction * 100)}%
            </span>
          </div>
        )}

        {jumpTargets.length > 2 && (
          <div style={{ marginBlockStart: "var(--s-2)" }}>
            <label className="sr-only" htmlFor={`${headingId}-jump`}>
              Jump to a section of this article
            </label>
            <select
              id={`${headingId}-jump`}
              className="section-jump"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                document
                  .getElementById(`block-${e.target.value}`)
                  ?.scrollIntoView({ block: "start" });
              }}
            >
              <option value="">Jump to section…</option>
              {jumpTargets.map((block, index) => (
                <option key={block.id} value={block.id}>
                  {index + 1}. {block.text.slice(0, 46)}…
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {resumeOffered && (
        <div style={{ marginBlockEnd: "var(--s-4)" }}>
          <Notice tone="brass">
            You stopped part-way through this article.{" "}
            <button type="button" className="btn" data-variant="link" onClick={resume}>
              Resume where you left off
            </button>{" "}
            or{" "}
            <button
              type="button"
              className="btn"
              data-variant="link"
              onClick={() => setResumeOffered(false)}
            >
              start from the top
            </button>
            .
          </Notice>
        </div>
      )}

      <div className="pane-scroll" ref={setRefs} tabIndex={0} aria-labelledby={headingId}>
        <ArticleImage article={article} />

        <ArticleBody
          article={article}
          annotations={annotations}
          showAnnotations={showAnnotations}
          language={language}
          translated={translated}
          onBlockVisible={(blockId) => {
            if (user) recordReading(article.id, { lastBlockId: blockId });
          }}
        />

        <Checkpoint
          articleId={article.id}
          outlet={article.metadata.outlet}
          unlocked={status.unlocked}
          completed={progress.state === "completed"}
          blockedReason={status.blockedReason}
          dwellMs={status.dwellMs}
          requiredMs={requiredMs}
          wordCount={article.wordCount}
          active={active}
          signedIn={Boolean(user)}
          hydrated={hydrated}
          onComplete={() => completeArticle(article.id, requiredMs)}
        />
      </div>
    </section>
  );
}

function ArticleImage({ article }: { article: SourceArticle }) {
  if (!article.image) {
    return (
      <div className="image-missing" role="note">
        <p>
          <strong style={{ color: "var(--ink-muted)" }}>No image on this record.</strong>
        </p>
        <p style={{ marginBlockStart: "var(--s-2)" }}>
          Counterframe holds no licence to reproduce the image published with this report, and does
          not substitute an unrelated stock photograph to fill the space.
        </p>
      </div>
    );
  }

  return (
    <figure className="article-figure">
      <Image
        src={article.image.src}
        alt={article.image.alt}
        width={1280}
        height={860}
        sizes="(max-width: 62rem) 100vw, 40vw"
      />
      <figcaption>
        {article.image.contextualOnly && (
          <>
            <strong style={{ color: "var(--ink-muted)" }}>Contextual image.</strong>{" "}
          </>
        )}
        {article.image.caption}{" "}
        <span style={{ display: "block", marginBlockStart: "var(--s-1)" }}>
          {article.image.credit} ·{" "}
          <a href={article.image.licenceUrl} target="_blank" rel="noopener noreferrer">
            {article.image.licence}
          </a>{" "}
          ·{" "}
          <a href={article.image.sourceUrl} target="_blank" rel="noopener noreferrer">
            File record
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

function Checkpoint({
  articleId,
  outlet,
  unlocked,
  completed,
  blockedReason,
  dwellMs,
  requiredMs,
  wordCount,
  active,
  signedIn,
  hydrated,
  onComplete,
}: {
  articleId: string;
  outlet: string;
  unlocked: boolean;
  completed: boolean;
  blockedReason: string | null;
  dwellMs: number;
  requiredMs: number;
  wordCount: number;
  active: boolean;
  signedIn: boolean;
  hydrated: boolean;
  onComplete: () => void;
}) {
  if (!hydrated) return null;

  if (!signedIn) {
    return (
      <div className="checkpoint" id={`checkpoint-${articleId}`}>
        <p className="eyebrow">Reading checkpoint</p>
        <p style={{ marginBlockStart: "var(--s-2)" }}>
          Reading is open to everyone. <Link href="/auth/login">Sign in</Link> to record your
          progress and to take part in the discussion.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="checkpoint" data-unlocked="true" id={`checkpoint-${articleId}`}>
        <p className="eyebrow">Reading checkpoint</p>
        <p className="subtitle" style={{ marginBlock: "var(--s-2)" }}>
          Completed
        </p>
        <p className="meta">
          You reached the end of the {outlet} article and spent at least{" "}
          {formatDuration(requiredMs)} with it open. Counterframe records that you read it. It does
          not, and cannot, record whether you understood it.
        </p>
      </div>
    );
  }

  return (
    <div className="checkpoint" data-unlocked={unlocked} id={`checkpoint-${articleId}`}>
      <p className="eyebrow">Reading checkpoint</p>
      <p className="subtitle" style={{ marginBlock: "var(--s-2)" }}>
        {unlocked ? "Ready to mark as read" : "Not yet available"}
      </p>

      <dl className="definition-list" style={{ marginBlockEnd: "var(--s-3)" }}>
        <dt>Article length</dt>
        <dd>{wordCount} words</dd>
        <dt>Minimum time</dt>
        <dd>
          {formatDuration(requiredMs)} — calculated from the word count at a deliberately generous
          500 words per minute, capped at 30 seconds so a classroom demonstration stays workable
        </dd>
        <dt>Your time so far</dt>
        <dd style={{ fontVariantNumeric: "tabular-nums" }}>{formatDuration(dwellMs)}</dd>
      </dl>

      {blockedReason ? (
        <p className="meta" role="status">
          {blockedReason}
        </p>
      ) : null}

      {!unlocked && (
        <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
          {active
            ? "Time is counting for this article while it is the one you are reading."
            : "Time is not counting here — it is counting for the other article. Scroll or click this one to move it over."}
        </p>
      )}

      <button
        type="button"
        className="btn"
        data-variant="primary"
        disabled={!unlocked}
        onClick={onComplete}
        style={{ marginBlockStart: "var(--s-3)" }}
      >
        Mark as read
      </button>
    </div>
  );
}
