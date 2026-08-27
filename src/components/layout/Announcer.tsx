"use client";

import { useStore } from "@/lib/store/AppStore";

/**
 * Single polite live region for state changes that do not move focus:
 * stance recorded, article completed, moderation action taken, and so on.
 */
export function Announcer() {
  const { announcement } = useStore();
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
