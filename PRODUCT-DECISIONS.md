# Product decisions

Where this build departs from the brief, or made a judgement the brief left open, and why.

---

## 1. Article bodies are excerpts plus labelled platform text, not full source text

**The brief allowed either.** It asked for full source text "when appropriate", and permitted
excerpt-based content otherwise, provided nothing is invented.

**What was built.** Every article record carries:

- **Short verbatim excerpts** (`source-quote`), reproduced exactly, never editable, never
  translated, and rendered with a rust rule and a label reading *Source text — reproduced verbatim*.
- **Counterframe-authored summary and notes** (`platform-summary`, `platform-note`), versioned, and
  rendered in a different typeface, colour and weight under a label reading *Counterframe summary —
  not source text*.

**Why.** Counterframe is a classroom prototype and holds no republication rights over these four
articles. Committing their full text to a repository is a copyright problem regardless of framing.

**Why it turned out better than the alternative.** The separation is not a compromise around the
constraint — it *is* the product's central claim, made visible on every screen. A reader can see
exactly where the outlet stops and Counterframe starts, which is the discipline the whole platform
is trying to teach. The block model (`ArticleBlockKind`) encodes it, `isSourceBlock` /
`isPlatformBlock` enforce it, and a test asserts every article contains both.

---

## 2. Images are contextual and one record deliberately has none

None of the four outlets licenses its imagery for reuse. Three records carry freely licensed
Wikimedia Commons photographs, each flagged `contextualOnly` and captioned with an explicit refusal
of the evidentiary reading — the Viewpoint B image is captioned as being from **January 2011**,
twelve years before the events, and not of any site the report covers.

The fourth record, The Wire, has `image: null` and renders a missing-image state that says
Counterframe holds no licence and *will not substitute an unrelated stock photograph to fill the
space*.

This is dramatised rather than hidden: panel member Junko Arai abstains from the publication vote
partly on these grounds, and the Education case study `image-selection` is written about the
failure. A limitation that is inspectable teaches more than a limitation that is papered over.

---

## 3. The Education "video" is a timed text explainer, not a video file

**The brief asked for videos with captions, transcripts, keyboard controls, poster images and
reduced-motion alternatives.**

Counterframe holds no video asset. The options were to fabricate one — stock footage, a synthesised
voice, an AI-generated presenter — or to build the thing honestly.

`ExplainerPlayer` is a real transport: play/pause, a seekable scrubber with `aria-valuetext`,
keyboard control (Space/K, arrows, Home/End), a rendered title card as the poster, captions driven
by an actual timed cue track in a polite live region, the complete transcript, a clickable cue
table, and a static motion-free version published below. Every requirement is satisfied by
something functional rather than decorative — and nothing is available *only* in the timed playback.

The component carries a comment explaining this, because the reasoning is the point.

---

## 4. Counterframe does not translate quoted source text

Switching the interface to Hindi translates issue framing, neutral summaries, panel notes and
Education material. Quoted source passages stay in the original with a labelled note.

Two reasons, both shown to the reader in the language switcher:

1. A translation of a quotation is a new text the outlet did not publish. Presenting it as the
   source would contradict the immutability promise.
2. Counterframe holds no rights to make derivative versions of these excerpts.

The Hindi translation of the issue framing is panel-approved and credited to a translator. The
Viewpoint B article translation ships as `user-submitted` so the review queue is demonstrable, and
one Education translation ships as `machine-draft` so the "not shown to readers" state is real.

---

## 5. Focus mode does not animate `grid-template-columns`

**The brief asked for a "smooth shared-layout expansion" preserving spatial continuity.** The first
implementation transitioned `grid-template-columns` from `1fr 1fr` to `1fr 13rem`.

Browser testing found this genuinely broken: with *any* non-zero transition duration — including the
0.00001s that `prefers-reduced-motion` produces — Chrome pinned the computed value at the start
until an unrelated style recalculation occurred. The pane visibly failed to expand. Changing both
endpoints to `fr` units did not fix it.

Focus mode now resizes the tracks directly (3.5fr : 1fr, so the focused article gets ~78%), and
spatial continuity is carried by the collapsed rail's own entrance — opacity and a small translate,
properties that are cheap to composite and safe to interrupt. This also lands where the brief
pointed: *avoid animating layout properties; prefer opacity, transform, filter*.

---

## 6. Dwell time accrues for one pane at a time

Both articles are open simultaneously, so counting dwell for both would let a reader satisfy the
gate for an article they never looked at.

Dwell accrues only for the **active** pane — set by a genuine scroll, pointer entry or focus — and
only while the tab is in the foreground and the pane is actually on screen. Two bugs were found and
fixed here during browser testing:

- The initial measurement call also activated the pane, so on every render both panes claimed
  activity and whichever mounted last always won. Measurement and activation are now separate.
- A hidden duplicate tree (React's streaming placeholder) matched the same selectors, so the timer
  now checks `offsetParent` before counting. This also correctly stops dwell on the hidden pane in
  the mobile stacked layout.

The reading rate is deliberately generous — 500 wpm, capped at 30 seconds per article — and the
exact numbers, including the formula, are printed at the checkpoint. A gate whose rule is secret is
a dark pattern.

---

## 7. Framing labels describe standing, not accuracy

`Supports` and `Criticises` are the brief's vocabulary, and they read like verdicts. Every surface
that renders a label therefore also renders the panel's written rationale, and each rationale states
in its own words that the label describes *whose account organises the reporting* and is not a
finding about accuracy or about the journalist.

The panel decisions dramatise the same point: a member argues explicitly that "'Supports' should not
be read as an accusation".

The pairing carries a **binding disclosure** — that the two reports were published five months apart
with overlapping but non-identical scopes — because the panel made that a condition of publication.
Without it a reader would mistake a difference of date for a factual disagreement.

---

## 8. A "Converging" issue is seeded, and a proposal is publicly rejected

The brief said never to force two sources into opposition. That is easy to claim and hard to
demonstrate, so the seed data contains the demonstration:

- An **archived** issue labelled `converging`, closed because the two sources agreed, kept readable
  with the reasoning attached.
- An **under-review** issue that cannot be published because its sources are paywalled and
  untranslated.
- A **publicly rejected** proposal ("which national broadcaster is the most dishonest") with the
  panel's reasoning that Counterframe compares events and does not rank outlets.
- A **correction** where Counterframe itself misattributed a statistic, published visibly on the
  affected article rather than folded quietly into a timeline.

---

## 9. Reactions, not likes; and no visible score

The three reactions describe an argument — helpful reasoning, clear evidence, important context —
never agreement. "Most reasoned" sorting weights those plus attached evidence and reply count, but
**no score is shown to users**, so the ranking cannot become the thing people optimise.

---

## 10. Stance history is kept in full, published only by opt-in

Every stance change is recorded and always visible to the person themselves in *My reading*.
Publishing that timeline on a public profile is off by default, with the reason stated in the
settings copy: a public record of someone changing their mind can be used against them.

Similarly, hiding your pseudonym from voter lists never removes your vote from any total. Both the
control and the surrounding copy say so.

---

## 11. Layout choices

- **Additional perspectives sit below the comparison, expandable in place.** Four simultaneous full
  articles would be unreadable and would blur what the two-pane contrast is for.
- **Panes scroll independently by default**, each in its own container, because that is what makes a
  comparison a comparison. Synchronised scrolling is opt-in and matches *proportion*, not pixels,
  since the articles differ in length.
- **The transparency rail is persistent on desktop and a sticky bottom sheet on mobile**, both
  opening the same three-section drawer. It is a product feature, not an admin afterthought.
- **The home page is an editorial statement, not a marketing hero** — no gradient, no illustration,
  no signup funnel. The current issue is the second thing on the page.
- **The wordmark is two offset rectangles**, one filled and one open: two views of the same subject.
  No megaphone, globe or newspaper.

---

## 11a. The comparison is a framed object, and it owns the page

The two panes originally sat as bare grid columns bleeding into the page, which
made them read as *a section of* the screen rather than *the subject of* it.

They are now a single framed object: a bordered container on a raised surface,
with its own top bar, symmetrical column banners naming each side, and a footer.
The panel's reasoning about the pairing moved inside that footer — directly
under the two sides it judges, rather than floating above them as preamble.

**The divider marker is the panel's contrast verdict, not a "versus" badge.**
A versus marker would contradict the platform's stated position: the verdict can
read *Converging* or *Insufficient contrast* as easily as *Mixed*, and the panel
decisions explicitly reject manufacturing opposition. It is `aria-hidden`,
because the same verdict is stated in words with its reasoning in the footer
below. It hides in focus mode and on narrow screens, where there is no divider
to sit on and nothing is being compared side by side.

To let the frame sit high on the page, the issue header was cut from **634px to
288px**: the title measure widened to hold a long question to two lines, the
region/country and topic rows merged into one taxonomy row, and the long framing
paragraph clamped to two lines with an accessible expander rather than truncated
and lost. The pane reading surfaces grew from a `100vh - 15rem` cap to a clamped
`22rem–44rem`, so both columns stay balanced and substantial at any viewport.

## 11b. Shape carries meaning: pills are pressable, squares are not

The original brief listed "excessive pill-shaped controls" among the things to
avoid. That was overridden on request, so rather than simply rounding
everything, the radius was turned into a semantic system:

| Token | Value | Used for |
| --- | --- | --- |
| `--radius-pill` | `999px` | Buttons, chips, reaction toggles, segmented controls, the skip link |
| `--radius-field` | `8px` | Inputs, textareas, selects, stance options |
| `--radius-surface` | `3px` | Badges, the divider verdict, containers |

The payoff is comprehension, not decoration: **round means you can press it,
square means it is a surface or a label.** Badges deliberately stayed
square-cornered for exactly this reason — they are information, and rounding
them would have made them indistinguishable from the buttons beside them.

## 11c. The source byline stopped being five identical badges

Every article header rendered outlet, source type, country, date and author as
five visually identical badges. Nothing stood out, so nothing was legible at a
glance and a badge signalled nothing.

It is now a byline: the outlet carries the emphasis, the established facts read
as plain separated metadata, and **only something that needs attention becomes a
badge** — an unestablished date, an absent author. A badge in that row now means
"check this", which is a signal it could not carry when everything was one.

Two related trims: the canonical-link button no longer carries the domain inside
it (it was 259px wide, a third of the pane), moving it to a screen-reader hint
that names the destination; and the repeated block labels keep their explicit
wording — separating source text from Counterframe's own writing is the central
promise — but stopped shouting in letterspaced uppercase.

## 11d. Reducing density without deleting substance

Feedback was that the platform reads as text-heavy. It is a reading platform,
so the answer was not to cut content — it was to stop content arriving all at
once. Measured first, then fixed the two worst offenders:

| Page | Before | After |
| --- | --- | --- |
| Transparency | **24.4 screens**, 3,418 words in one scroll | 5.3 screens, one section at a time |
| Issue page | 4.9 screens, stance block 623px | 4.6 screens, stance block 363px |
| Explore | first result 731px down, below the fold | 564px, **above the fold** |

- **Transparency is sectioned.** Panel, edits, decisions, funding, proposals,
  translations and moderation are now switched rather than stacked. Records are
  deep-linked from all over the app (`#pd-frame-a` from a framing label,
  `#rev-005` from an article), so the hash is resolved back to its containing
  section by id prefix — and `hashchange` is handled as well as mount, because
  following a hash link while already on the page does not remount the
  component and would otherwise leave the reader staring at the wrong section.
- **Annotation provenance folds away.** Evidence, author and revision history
  are what make an annotation checkable, so they stay — but eleven expanded
  copies buried the explanations they belonged to. The explanation and the
  Education link stay open; the rest is one click.
- **Explore filters collapse.** Seven chip groups pushed the actual results
  below the fold. The control carries the active-filter count so nothing is
  hidden silently.
- **The stance form appears when it becomes relevant.** The reasoning field and
  privacy choice mean nothing until a stance is picked.
- Long paragraphs (the panel's contrast reasoning, the issue framing) clamp to
  two lines with an expander rather than being cut.

One bug this surfaced: **the `hidden` attribute only sets `display: none` at
user-agent weight**, so any class setting `display` silently defeats it. The
collapsed filters were fully visible despite `hidden` being set. Fourteen
places in the app rely on that attribute, so `[hidden] { display: none
!important }` is now a base rule.

## 12. Accessibility fixes made during browser verification

These were found by measuring, not by inspection:

| Issue | Fix |
| --- | --- |
| `--ink-faint` was 3.74:1 in light mode, 4.21:1 in dark — below WCAG AA for the small text it is used on | Darkened to `#6e6659` (light), lightened to `#948b78` (dark) |
| `--brass` on `--brass-soft` was 4.23:1 | Darkened to `#7a5f1c` |
| Annotation cards used `<h4>` directly under an `<h2>`, skipping a level | Changed to `<h3>` |
| Panel translation and appeal rows reused one `id` each, so labels bound to the wrong control when several rendered | Unique `fieldId` per row |
| Closing a dialog focused a detached trigger, silently dropping focus to the body and throwing keyboard users to the top of the page | Falls back to the `main` landmark when the trigger is gone |
| Headline annotations existed in the data but never rendered, because the headline lives in the pane header rather than the body | Added `AnnotatedHeadline` / `HeadlineAnnotations` |
| `/favicon.ico` 404'd on every page load | Added `app/icon.svg` using the split-frame wordmark |
| Metadata separators used `--rule-strong`, a border colour, as text — 1.76:1 | Moved to `--ink-faint`; the same bug existed on the pre-existing `.dot-sep` |

Final measured result: zero WCAG AA contrast failures on the issue, transparency and education
pages, in both themes, checked against each element's own computed background.

---

## 13. Stack

Next.js 15 App Router, React 19, TypeScript in strict mode with `noUncheckedIndexedAccess`.

**Three runtime dependencies: `next`, `react`, `react-dom`.** No CSS framework, no state library, no
animation library, no component library.

- **Hand-authored CSS with design tokens** rather than Tailwind. The visual target is an edited
  magazine crossed with a public archive; that is a typography-and-rules problem, and a token file
  expresses "warm limestone, three restrained accents, thin deliberate dividers" far more directly
  than utility classes strung across markup.
- **React Context over `localStorage`** rather than a state library. The data is one object; a
  library would add a dependency and a vocabulary without removing any work.
- **CSS transitions and keyframes** rather than an animation library. Every motion in the product is
  opacity, transform or filter, all of which CSS handles natively, and all of which honour
  `prefers-reduced-motion` through a single block.

Server components are kept thin — each route delegates to a client view — because the entire data
layer is browser-local by design. That is the honest architecture for a demo with no backend, and it
keeps the seam where a real API would slot in obvious.
