import type { AnonymousSourceDisclosure, SponsorshipDisclosure } from "../types";

/**
 * ANONYMOUS SOURCES
 * -----------------
 * Counterframe does not do original reporting, so this is not a promise about
 * our own sourcing. It is an observation about someone else's, recorded
 * consistently instead of being left to whichever annotation happened to
 * mention it.
 *
 * We cannot make an outlet justify an unnamed source. We can record, for every
 * compared article, whether it did — and a reader can then weigh that against
 * everything else on the source record. A blank `reasonGiven` is the finding,
 * not a gap in ours.
 */
export const anonymousSources: AnonymousSourceDisclosure[] = [
  {
    id: "anon-outlook-1",
    articleId: "art-outlook-upgrade",
    descriptor: "a senior official said on Friday",
    reasonGiven: null,
    sourceKind: "government-or-official",
    corroboration: "single-source",
    note: "The entire factual basis of the report — that work has started, and why — rests on this one unnamed person. No reason for withholding the name is given, which is unremarkable for routine civic-works wire copy and is exactly why it is worth recording: the reader cannot assess who is speaking, what they are responsible for, or what interest they have in the account. The one named speaker in the piece, NDMC Member Kuljeet Singh Chahal, is quoted on a separate matter (tulip procurement) and does not corroborate this claim.",
    recordedBy: "pm-adaeze",
    recordedAt: "2026-03-11T09:10:00.000Z",
  },
  {
    id: "anon-dte-1",
    articleId: "art-dte-evictions",
    descriptor: "estimates attributed to housing rights organisations and activists",
    reasonGiven: null,
    sourceKind: "civil-society",
    corroboration: "not-established",
    note: "Where the report gives scale, it draws on unnamed housing rights organisations and activists rather than on a named body, and does not publish the method behind the estimates. The Housing and Land Rights Network publishes figures for this period under its own name, but the report does not cite it, so we cannot treat that as corroboration of what this piece specifically claims.",
    recordedBy: "pm-tomas",
    recordedAt: "2026-03-11T09:40:00.000Z",
  },
];

/**
 * SPONSORSHIP
 * -----------
 * Published whether or not a relationship exists. "We have no sponsors" only
 * means something when it is stated in the same place a sponsor would have to
 * be declared — otherwise silence and absence look identical.
 */
export const sponsorship: SponsorshipDisclosure[] = [
  {
    id: "spon-1",
    kind: "sponsorship",
    present: false,
    statement:
      "Counterframe has no sponsors. No organisation pays for coverage, placement, or favourable treatment of an issue. If that ever changed, the sponsor, the amount, the period and the issues touched would appear in the funding ledger alongside every community contribution, and any issue they related to would carry the disclosure on the issue page itself.",
    reviewedAt: "2026-08-28T09:00:00.000Z",
  },
  {
    id: "spon-2",
    kind: "advertising",
    present: false,
    statement:
      "Counterframe carries no advertising and has no advertising relationships. There are no ad slots in the interface, no trackers, and nothing on any page is placed because someone paid for it.",
    reviewedAt: "2026-08-28T09:00:00.000Z",
  },
  {
    id: "spon-3",
    kind: "grant",
    present: false,
    statement:
      "Counterframe holds no grants. Funding is community contributions only, and the full ledger — amounts, dates and destinations — is public. Contributor identity is published only where the contributor chose to attach it.",
    reviewedAt: "2026-08-28T09:00:00.000Z",
  },
  {
    id: "spon-4",
    kind: "partnership",
    present: false,
    statement:
      "Counterframe has no commercial or editorial partnerships with any outlet whose work it compares. Individual panel members' affiliations are a separate matter and are published on each member's record, with recusals shown beside the decisions they affected.",
    reviewedAt: "2026-08-28T09:00:00.000Z",
  },
];
