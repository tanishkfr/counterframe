"use client";

import Link from "next/link";

import { AdditionalPerspectives } from "@/components/issue/AdditionalPerspectives";
import { ComparisonWorkspace } from "@/components/issue/ComparisonWorkspace";
import {
  ContrastRationale,
  IssueChrome,
  IssueNotFound,
  useIssue,
} from "@/components/issue/IssueChrome";
import { StanceControl } from "@/components/issue/StanceControl";
import { TransparencyRail } from "@/components/issue/TransparencyRail";

export function IssueView({ slug }: { slug: string }) {
  const issue = useIssue(slug);
  if (!issue) return <IssueNotFound slug={slug} />;

  return (
    <IssueChrome issue={issue}>
      <div className="workspace" style={{ marginBlockStart: "var(--s-5)" }}>
        <div>
          {/* The comparison leads. The panel's reasoning about the pairing sits
              inside the same frame, directly under the two sides it judges. */}
          <ComparisonWorkspace issue={issue} footer={<ContrastRationale issue={issue} />} />

          <StanceControl issue={issue} />

          <AdditionalPerspectives issue={issue} />

          <p style={{ marginBlockStart: "var(--s-7)" }}>
            <Link href={`/issues/${issue.slug}/community`} className="btn" data-variant="primary">
              Go to the discussion →
            </Link>
          </p>
        </div>

        <TransparencyRail issue={issue} />
      </div>
    </IssueChrome>
  );
}
