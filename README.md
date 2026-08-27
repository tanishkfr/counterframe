# Counterframe

A media-literacy platform that places contrasting coverage of the same events side by side, and
publishes every editorial, moderation and funding decision behind that pairing.

Counterframe does not tell you which account is right. It shows you what each one was built to make
visible, who decided that, and what it cost.

**This is a classroom prototype.** The four source articles are real and verifiable. The editorial
panel, the community accounts and every funding figure are fictional, and no payment is ever taken.
That distinction is stated in the product itself, not only here.

---

## Running it

Requires Node 20+ and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit`, strict |
| `pnpm lint` | ESLint (flat config, via the ESLint CLI) |
| `pnpm test` | Vitest unit tests |

No API keys, no backend and no network access are needed after `pnpm install`. All state lives in
the browser's `localStorage`; the administrator page has a **Reset demo data** control that restores
the seeded state exactly.

---

## Demo accounts

Password for every account: `counterframe`

| Role | Email | Pseudonym | Notes |
| --- | --- | --- | --- |
| Reader / contributor | `reader@counterframe.demo` | Meridian | **Start here.** Seeded part-way through Viewpoint A and having never opened Viewpoint B, so the posting gate is demonstrable on a fresh install. |
| Moderator | `moderator@counterframe.demo` | Halyard | Both articles already completed. Has the moderation queue. |
| Panel member | `panel@counterframe.demo` | Adaeze N. | Chair of the editorial panel. Has the panel queue. |
| Administrator | `admin@counterframe.demo` | Ledger | Every role, plus role management, audit log and demo reset. |

The sign-in page lists these with a one-click fill button.

These are **not secrets**. There is no backend: `src/lib/auth.ts` is a local adapter that stores a
pseudonym and a demo password string in your own browser. Nothing is hashed, because pretending to
hash would be worse than being clear that this is not security. Never put a real password here.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Statement of purpose and the current issue |
| `/explore` | Issue feed with search and filters |
| `/issues/[slug]` | **The comparison workspace** — two panes, stance control, additional perspectives, transparency rail |
| `/issues/[slug]/community` | Discussion for that issue |
| `/issues/[slug]/history` | Corrections, revisions with before/after diffs, panel decisions |
| `/issues/[slug]/funding` | Issue budget, allocations, spending, receipts, contribution form |
| `/education` | Education hub, glossary, topic suggestions |
| `/education/[slug]` | Lesson, including the accessible timed explainer |
| `/community` | Cross-issue discussion feed and discussion norms |
| `/transparency` | Panel, edits, decisions, funding, proposal archive, translations, moderation record |
| `/my-reading` | Saved issues, progress, stances, takes, appeals, translations, contributions |
| `/profile/[username]` | Public profile, honouring that member's privacy settings |
| `/propose` | Issue proposal form |
| `/settings` | Appearance, language, motion, privacy, roles |
| `/panel` | Panel queue — proposals, translation review, appeals (panel only) |
| `/moderation` | Review queue with model predictions (moderator only) |
| `/admin` | Roles, ledger integrity, audit log, demo reset (admin only) |
| `/about` | What this is, source policy, what is fictional |
| `/auth/login`, `/auth/signup` | Local demo auth |

Deep links work for issues, history entries (`#rev-005`), panel decisions (`#pd-frame-a`),
discussion takes (`#t-1`), transparency sections (`#funding`) and Education lessons.

---

## The seeded issue and its sources

> **What happened to Delhi's informal settlements during preparations for the 2023 G20 Summit?**

All four records describe real, published articles. Outlet, author, date, source type and canonical
URL were each checked against the canonical URL on 2026-08-27. Anything that could not be
established is marked **needs verification** or **unavailable** in the interface rather than filled
in.

| Frame | Outlet | Author | Published |
| --- | --- | --- | --- |
| Viewpoint A — *Supports* | Outlook India (PTI wire) | No named author | 23 Dec 2022 |
| Viewpoint B — *Criticises* | Down To Earth | Anuj Behal | 11 May 2023 |
| Additional — official | News On AIR (Akashvani, Prasar Bharati) | Newsroom | 29 Aug 2023 |
| Additional — civil society | The Wire, on the HLRN forced-evictions report | Omar Rashid | 7 Mar 2024 |

**Article bodies are not full source text.** See [PRODUCT-DECISIONS.md](./PRODUCT-DECISIONS.md) for
why, and for how the platform separates quoted source text from Counterframe's own writing.

---

## What is enforced, not merely styled

- **Source immutability.** `src/lib/immutability.ts` is the single enforcement point. Attempting to
  mutate `metadata` or `blocks` throws `ImmutableSourceError` rather than silently dropping the
  change. No role has a tool to edit source text — including the administrator.
- **The posting gate.** `src/lib/reading.ts` unlocks a checkpoint only when the reader has reached
  the end *and* met a minimum dwell time. Dwell accrues only for the pane the reader is actually
  attending to, and only while the tab is in the foreground.
- **Moderation limits.** `src/lib/moderation/adapter.ts` can hide content pending human review, and
  only for a category in `AUTO_HIDE_CATEGORIES` at ≥85% confidence. There is no field on the
  prediction type that could express removal.
- **Ledger consistency.** `checkLedgerConsistency` is asserted in tests *and* surfaced live on the
  admin page, so a broken ledger is visible rather than silent.

---

## Verification

Run at the final commit:

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Clean |
| `pnpm lint` | Clean |
| `pnpm test` | 62 tests across 5 files, all passing |
| `pnpm build` | Clean, 18 pages prerendered |

Manually verified in the browser (see PRODUCT-DECISIONS for the bugs this found and fixed):

- Full acceptance path: sign in → read both articles → checkpoint unlocks → record stance → publish
  take → reply → report → moderate → appeal.
- Reading gate refuses to unlock without both scroll-to-end and dwell time; dwell does not accrue
  while the tab is hidden.
- The comparison renders as one framed object with symmetrical column banners and the panel's
  contrast verdict centred on the divider (measured landing exactly in the gutter, zero text
  collisions).
- Focus mode expands to ~78% with the other article intact as a summary rail; the verdict marker
  correctly withdraws, since nothing is being compared side by side.
- Annotation layer, including headline annotations, with keyboard-reachable inline anchors.
- English ⇄ Hindi, including the approved translation and the "source text is not translated" note.
- Dark mode: **zero** WCAG AA contrast failures on the issue, transparency and education pages, in
  both themes, measured against each element's own computed background.
- Mobile at 375px: no horizontal page overflow anywhere; wide tables scroll inside their own
  containers; viewpoint switcher and transparency bottom sheet work.
- Heading hierarchy has no skipped levels; no positive `tabindex`; no unlabelled controls; no
  images without `alt`.
- Demo reset restores the seeded state exactly.

---

## Structure

```
src/
  app/            routes (thin server pages delegating to client views)
  components/
    layout/       masthead, footer, theme, language, live region
    primitives/   badges, modal, disclosure, progress, empty states
    issue/        comparison workspace, panes, annotations, stance, rail
    community/    discussion, composer, replies, reporting
    transparency/ revision timeline, panel decisions, funding ledgers
    education/    accessible timed explainer
  lib/
    types.ts      the whole domain model
    seed/         real source records, fictional panel, community, funding
    store/        localStorage persistence + React context
    reading.ts    dwell calculation and the posting gate
    immutability.ts  source-text enforcement
    moderation/   provider interface + local deterministic classifier
    funding.ts    ledger maths and consistency invariants
```

Data and UI are kept separate. `auth`, `moderation` and `store/persistence` are each written as
adapters so a real provider can replace them without touching a single consumer.

---

## Known limitations

- **No real backend.** Everything is per-browser. Two people cannot see each other's takes.
- **Excerpt-based article bodies.** Explained in PRODUCT-DECISIONS.
- **The Education video is a timed text explainer, not a video file.** Also explained there — it was
  a deliberate choice not to fabricate footage.
- **Interface Hindi is partial.** Navigation, the comparison workspace and the stance control are
  translated; deeper administrative pages fall back to English. The fallback is visible rather than
  disguised.
- **Search covers metadata, not article bodies**, because most records hold excerpts rather than
  full text and full-text search would imply a completeness the content model does not have.

---

## Licence

Source code is MIT (see [LICENSE](./LICENSE)).

The MIT licence covers the code only. The three photographs in `public/media/` keep their own
Creative Commons / GODL-India licences and are credited in the interface, and the short quoted
excerpts from four published news articles remain the copyright of their publishers — reproduced
under fair dealing for criticism and education, attributed with canonical links. Details are in the
LICENSE file.
