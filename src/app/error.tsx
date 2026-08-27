"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced rather than swallowed: a transparency platform that hides its
    // own failures is not one.
    console.error("Counterframe render error:", error);
  }, [error]);

  return (
    <div className="shell page" style={{ maxWidth: "40rem" }}>
      <p className="eyebrow">Something failed</p>
      <h1 className="title" style={{ marginBlockStart: "var(--s-3)" }}>
        This page could not be rendered
      </h1>
      <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
        Your reading progress, stances and drafts are stored in this browser and are unaffected.
      </p>

      <div className="notice" data-tone="rust" style={{ marginBlockStart: "var(--s-5)" }}>
        <strong>{error.name}:</strong> {error.message}
        {error.digest && (
          <p style={{ marginBlockStart: "var(--s-2)" }}>Reference: {error.digest}</p>
        )}
      </div>

      <div className="btn-row" style={{ marginBlockStart: "var(--s-5)" }}>
        <button type="button" className="btn" data-variant="primary" onClick={reset}>
          Try again
        </button>
        <Link href="/explore" className="btn">
          Back to issues
        </Link>
      </div>
    </div>
  );
}
