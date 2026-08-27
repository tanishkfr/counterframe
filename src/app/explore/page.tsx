import { Suspense } from "react";

import { ExploreView } from "./ExploreView";

export const metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="shell page">
          <p className="meta">Loading issues…</p>
        </div>
      }
    >
      <ExploreView />
    </Suspense>
  );
}
