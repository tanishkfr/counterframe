"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

import { Badge, Disclosure } from "@/components/primitives";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABEL, TACTIC_LABEL } from "@/lib/labels";
import { isSourceBlock } from "@/lib/immutability";
import { translate } from "@/lib/i18n";
import { useStore } from "@/lib/store/AppStore";
import type { Annotation, ArticleBlock, LanguageCode, SourceArticle } from "@/lib/types";

interface Props {
  article: SourceArticle;
  annotations: Annotation[];
  showAnnotations: boolean;
  language: LanguageCode;
  /** Hindi renderings of platform blocks, keyed by block id. */
  translated: Record<string, string> | null;
  onBlockVisible?: (blockId: string) => void;
}

const BLOCK_LABEL: Record<ArticleBlock["kind"], string | null> = {
  "source-heading": null,
  "source-quote": "Source text — reproduced verbatim",
  "platform-summary": "Counterframe summary — not source text",
  "platform-note": "Counterframe note",
};

/**
 * The headline is rendered by the pane header rather than the body, so its
 * annotations need their own entry point. Headline framing is one of the most
 * common tactics, and leaving it unannotatable would have quietly dropped a
 * whole category from the layer.
 */
export function AnnotatedHeadline({
  text,
  annotations,
  showAnnotations,
}: {
  text: string;
  annotations: Annotation[];
  showAnnotations: boolean;
}) {
  if (annotations.length === 0 || !showAnnotations) return <>{text}</>;
  return <AnnotatedText text={text} annotations={annotations} active />;
}

export function HeadlineAnnotations({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return null;
  return (
    <>
      {annotations.map((annotation) => (
        <AnnotationCard key={annotation.id} annotation={annotation} revealed />
      ))}
    </>
  );
}

export function ArticleBody({
  article,
  annotations,
  showAnnotations,
  language,
  translated,
  onBlockVisible,
}: Props) {
  // The headline is rendered by the pane header, so it is skipped here.
  const blocks = article.blocks.filter((b) => b.kind !== "source-heading");

  return (
    <div className="article-body">
      {blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          annotations={annotations.filter((a) => a.blockId === block.id)}
          showAnnotations={showAnnotations}
          language={language}
          translatedText={translated?.[block.id]}
          onVisible={onBlockVisible}
        />
      ))}
    </div>
  );
}

function Block({
  block,
  annotations,
  showAnnotations,
  language,
  translatedText,
  onVisible,
}: {
  block: ArticleBlock;
  annotations: Annotation[];
  showAnnotations: boolean;
  language: LanguageCode;
  translatedText: string | undefined;
  onVisible?: (blockId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const { prefs } = useStore();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            onVisible?.(block.id);
          }
        }
      },
      { rootMargin: "-15% 0px -35% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [block.id, onVisible]);

  const isSource = isSourceBlock(block);
  const label = BLOCK_LABEL[block.kind];

  // Source quotations are never translated. Platform text is, where an
  // approved translation exists.
  const text = isSource ? block.text : (translatedText ?? block.text);
  const showsUntranslatedSource = isSource && language !== "en";

  const className =
    block.kind === "source-quote"
      ? "block-source"
      : block.kind === "platform-note"
        ? "block-note"
        : "block-platform";

  return (
    <div ref={ref} id={`block-${block.id}`} data-block-kind={block.kind}>
      {label && (
        <span className="block-label">
          {label}
          {block.revisionId && (
            <>
              {" · "}
              <Link href={`?revision=${block.revisionId}`} scroll={false} style={{ color: "inherit" }}>
                {block.revisionId}
              </Link>
            </>
          )}
        </span>
      )}

      <div className={className} lang={isSource ? "en" : language}>
        <p>
          {annotations.length > 0 ? (
            <AnnotatedText text={text} annotations={annotations} active={showAnnotations} />
          ) : (
            text
          )}
        </p>
      </div>

      {showsUntranslatedSource && (
        <p className="meta" style={{ marginBlockStart: "var(--s-2)" }}>
          {translate(language, "lang.sourceUntranslated")}
        </p>
      )}

      {showAnnotations &&
        annotations.map((annotation) => (
          <AnnotationCard
            key={annotation.id}
            annotation={annotation}
            revealed={revealed || prefs.reduceMotion === "always"}
          />
        ))}
    </div>
  );
}

/**
 * Wraps each annotation's anchor text in an inline button. Anchors are exact
 * substrings of the block (enforced by `seed.test.ts`), so no text is altered,
 * reordered or lost — the original string is reassembled from the pieces.
 */
function AnnotatedText({
  text,
  annotations,
  active,
}: {
  text: string;
  annotations: Annotation[];
  active: boolean;
}): ReactNode {
  if (!active) return text;

  const ranges = annotations
    .map((annotation) => ({ annotation, start: text.indexOf(annotation.anchorText) }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const { annotation, start } of ranges) {
    // Skip anchors that overlap one already rendered.
    if (start < cursor) continue;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <button
        key={annotation.id}
        type="button"
        className="annotated"
        aria-describedby={`annotation-${annotation.id}`}
        onClick={() => {
          document
            .getElementById(`annotation-${annotation.id}`)
            ?.scrollIntoView({ block: "nearest" });
        }}
      >
        {annotation.anchorText}
        <span className="sr-only">
          {" "}
          — annotated: {TACTIC_LABEL[annotation.category]}
        </span>
      </button>,
    );
    cursor = start + annotation.anchorText.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function AnnotationCard({
  annotation,
  revealed,
}: {
  annotation: Annotation;
  revealed: boolean;
}) {
  return (
    <aside
      id={`annotation-${annotation.id}`}
      className="annotation-card"
      data-revealed={revealed}
      aria-label={`Annotation: ${TACTIC_LABEL[annotation.category]}`}
    >
      <h3>
        <Badge tone="brass">{TACTIC_LABEL[annotation.category]}</Badge>
        <span style={{ fontWeight: 400, color: "var(--ink-muted)" }}>
          on “{annotation.anchorText}”
        </span>
      </h3>
      <p>{annotation.explanation}</p>

      {annotation.educationSlug && (
        <p style={{ marginBlockStart: "var(--s-3)" }}>
          <Link href={`/education/${annotation.educationSlug}`}>
            Learn how to spot this →
          </Link>
        </p>
      )}

      {/* Provenance is what makes an annotation checkable, so it stays — but
          it is reference material, not the point, and eleven expanded copies
          of it buried the explanations they belong to. */}
      <div style={{ marginBlockStart: "var(--s-2)" }}>
        <Disclosure summary="Evidence and provenance">
          <dl>
            <dt>Evidence</dt>
            <dd>{annotation.evidence}</dd>
            <dt>Author</dt>
            <dd>
              {ROLE_LABEL[annotation.authorRole]} · {formatDateTime(annotation.createdAt)}
            </dd>
            <dt>Revisions</dt>
            <dd>
              {annotation.revisionIds.length === 0
                ? "None since first publication"
                : annotation.revisionIds.join(", ")}
            </dd>
          </dl>
        </Disclosure>
      </div>
    </aside>
  );
}
