"use client";

import { Discussion } from "@/components/community/Discussion";
import { IssueChrome, IssueNotFound, useIssue } from "@/components/issue/IssueChrome";
import { StanceControl } from "@/components/issue/StanceControl";

export function View({ slug }: { slug: string }) {
  const issue = useIssue(slug);
  if (!issue) return <IssueNotFound slug={slug} />;

  return (
    <IssueChrome issue={issue}>
      <div style={{ maxWidth: "58rem" }}>
        <StanceControl issue={issue} />
        <Discussion issue={issue} />
      </div>
    </IssueChrome>
  );
}
