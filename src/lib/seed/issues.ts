import type { Issue, IssueProposal, Revision } from "../types";

export const issues: Issue[] = [
  {
    id: "iss-delhi-g20",
    slug: "delhi-informal-settlements-g20-2023",
    title:
      "What happened to Delhi's informal settlements during preparations for the 2023 G20 Summit?",
    summary:
      "Between late 2022 and September 2023, municipal and central agencies carried out an extensive programme of works across central Delhi ahead of the G20 leaders' summit. Coverage of that programme divides on a single question: what the works were for. Some reporting describes civic upgrading, planting and street improvement along the routes visiting delegations would use. Other reporting describes demolition and displacement of informal settlements, and treats the improvement vocabulary as a description that conceals what was happening to the people living there. Both bodies of reporting describe real, documented activity. This issue places two of them side by side so readers can see where the accounts overlap, where they diverge, and what each one was built to make visible.",
    status: "active",
    countries: ["India"],
    region: "South Asia",
    topics: ["Urban policy", "Housing", "Displacement", "G20", "Media framing"],
    eventStart: "2022-12-01",
    eventEnd: "2023-09-10",
    createdAt: "2026-03-02T11:30:00.000Z",
    updatedAt: "2026-08-14T16:10:00.000Z",
    viewpointA: { articleIds: ["art-outlook-upgrade"], label: "Viewpoint A" },
    viewpointB: { articleIds: ["art-dte-evictions"], label: "Viewpoint B" },
    additionalPerspectiveIds: ["art-air-preparation", "art-wire-hlrn"],
    contrastRationale:
      "These two reports describe an overlapping programme in the same city, and differ in who is treated as its subject. In Viewpoint A the subject is the built environment — roads, railings, planting — and the works are explained by reference to what an arriving visitor will see. In Viewpoint B the subject is the residents of informal settlements, and the same improvement vocabulary appears inside quotation marks as a claim to be doubted. Required disclosure: the two reports were published roughly five months apart (23 December 2022 and 11 May 2023) and their scopes overlap without being identical. A reader should not mistake a difference of date and scope for a direct factual disagreement. The panel considered and rejected 'Insufficient contrast': the divergence is in standing and framing, not manufactured by selection.",
    contrastVerdict: "mixed",
    heroArticleId: "art-outlook-upgrade",
    proposalId: "prop-delhi",
  },
  {
    id: "iss-flood-warning",
    slug: "flood-warning-timelines-under-review",
    title:
      "How were official flood-warning timelines described after the 2024 Rhine valley floods?",
    summary:
      "A proposed comparison of coverage of official warning timelines. Currently under panel review: two of the three candidate sources are behind paywalls that prevent excerpting under the platform's source policy, and no reviewed translation of the German-language primary source exists yet. The issue is visible in this state deliberately, so that readers can see what an issue looks like before it is published.",
    status: "under-review",
    countries: ["Germany", "Switzerland"],
    region: "Europe",
    topics: ["Disaster response", "Official communication", "Media framing"],
    eventStart: "2024-05-01",
    eventEnd: "2024-07-31",
    createdAt: "2026-07-19T09:00:00.000Z",
    updatedAt: "2026-08-02T11:00:00.000Z",
    viewpointA: { articleIds: [], label: "Viewpoint A" },
    viewpointB: { articleIds: [], label: "Viewpoint B" },
    additionalPerspectiveIds: [],
    contrastRationale:
      "Not yet established. The panel cannot assess contrast until at least two excerptable sources are secured.",
    contrastVerdict: "unclear",
  },
  {
    id: "iss-transit-fares",
    slug: "transit-fare-increase-coverage-2021",
    title: "How was the 2021 metropolitan transit fare increase reported?",
    summary:
      "An archived issue, kept as a worked example of a pairing that did not hold up. The panel opened it in 2026 and closed it after concluding that the two candidate sources converged rather than contrasted: both reported the same figures, both quoted the transit authority and both quoted riders. Because the pairing never published, no source records were licensed or retained, so there are no articles to read here. What is preserved is the decision and the reasoning behind it, in the History tab. That is the point of the example: the platform declined to manufacture an opposition, and says so rather than quietly dropping the issue.",
    status: "archived",
    countries: ["Canada"],
    region: "North America",
    topics: ["Transport", "Public finance", "Media framing"],
    eventStart: "2021-01-01",
    eventEnd: "2021-06-30",
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-06-30T14:00:00.000Z",
    viewpointA: { articleIds: [], label: "Viewpoint A" },
    viewpointB: { articleIds: [], label: "Viewpoint B" },
    additionalPerspectiveIds: [],
    contrastRationale:
      "The panel labelled this pairing 'Converging'. The two candidate reports agreed on figures, sourcing and framing. Rather than present agreement as disagreement, the issue was archived with this explanation attached and the sources were never taken up. The decision record remains open to correction through the ordinary revision process, as every archived issue does.",
    contrastVerdict: "converging",
  },
];

export const proposals: IssueProposal[] = [
  {
    id: "prop-delhi",
    userId: "u-reader",
    question: "How Delhi covered up its slums for the G20 summit",
    rationale:
      "I was in Delhi in August 2023 and watched barriers go up along roads I use every day. Indian and international coverage of the same weeks reads like two different cities. I think people would learn a lot from seeing those accounts next to each other rather than one at a time.",
    suggestedSources: [
      "https://www.downtoearth.org.in/governance/g20-and-delhi-slum-dwellers-rendered-homeless-as-city-decks-up-for-summit-89252",
      "https://www.outlookindia.com/national/upgradation-work-in-full-swing-ahead-of-g20-summit-in-delhi-news-247740",
      "https://www.newsonair.gov.in/the-preparation-for-g20-summit-in-new-delhi-on-9th-and-10th-of-next-month-in-full-swing",
    ],
    region: "South Asia",
    countries: ["India"],
    topic: "Urban policy",
    dateRangeStart: "2022-12-01",
    dateRangeEnd: "2023-09-30",
    supportingEvidence:
      "The Housing and Land Rights Network publishes an annual forced-evictions report covering this period.",
    affiliationDisclosure:
      "No affiliation with any party to this issue. I live in Delhi and use the affected roads, which I am disclosing as a relevant personal connection.",
    status: "published",
    submittedAt: "2026-02-24T18:40:00.000Z",
    decisionId: "pd-proposal-delhi",
    neutralRewrite:
      "What happened to Delhi's informal settlements during preparations for the 2023 G20 Summit?",
    publishedIssueId: "iss-delhi-g20",
  },
  {
    id: "prop-rejected",
    userId: "u-contrib-2",
    question: "Which national broadcaster is the most dishonest about urban policy?",
    rationale:
      "State broadcasters keep reporting demolitions as improvements and it should be called out.",
    suggestedSources: ["Various state broadcasters"],
    region: "Global",
    countries: [],
    topic: "Media accountability",
    dateRangeStart: "2020-01-01",
    dateRangeEnd: "2026-01-01",
    affiliationDisclosure: "None.",
    status: "rejected",
    submittedAt: "2026-07-01T08:10:00.000Z",
    decisionId: "pd-proposal-rejected",
  },
  {
    id: "prop-pending",
    userId: "u-contrib-1",
    question:
      "How was the cost of the 2025 municipal stadium refurbishment reported in local and national coverage?",
    rationale:
      "Local coverage gave a figure roughly double the one in national coverage, and neither explained the difference. It is a small case but it teaches how the same budget line can be described two ways depending on what is counted.",
    suggestedSources: [
      "Local weekly coverage, March 2025",
      "National business daily coverage, March 2025",
    ],
    region: "Europe",
    countries: ["Portugal"],
    topic: "Public finance",
    dateRangeStart: "2025-01-01",
    dateRangeEnd: "2025-12-31",
    affiliationDisclosure: "None.",
    status: "under-review",
    submittedAt: "2026-08-19T13:25:00.000Z",
  },
  {
    id: "prop-returned",
    userId: "u-contrib-3",
    question: "Was the 2026 water restriction announcement misleading?",
    rationale: "The announcement felt misleading to a lot of people I know.",
    suggestedSources: ["The announcement itself"],
    region: "Oceania",
    countries: ["Australia"],
    topic: "Environment",
    dateRangeStart: "2026-01-01",
    dateRangeEnd: "2026-06-01",
    affiliationDisclosure: "None.",
    status: "returned-for-clarification",
    submittedAt: "2026-08-05T07:00:00.000Z",
    neutralRewrite: "How was the 2026 water restriction announcement reported?",
    decisionId: undefined,
  },
];

/**
 * Revisions cover platform-authored material only. No revision targets source
 * text or original source metadata — see `src/lib/immutability.ts`, which is
 * the single enforcement point, and its test.
 */
export const revisions: Revision[] = [
  {
    id: "rev-001",
    entity: "issue",
    entityId: "iss-delhi-g20",
    issueId: "iss-delhi-g20",
    summary: "Issue published following panel approval of the neutrally reworded question.",
    changes: [
      {
        field: "title",
        before: "How Delhi covered up its slums for the G20 summit",
        after:
          "What happened to Delhi's informal settlements during preparations for the 2023 G20 Summit?",
      },
      { field: "status", before: null, after: "active" },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "The proposer's wording asserted concealment as established fact. The published question must not presuppose its own answer.",
    at: "2026-03-02T11:30:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-proposal-delhi",
  },
  {
    id: "rev-002",
    entity: "neutral-summary",
    entityId: "art-outlook-upgrade",
    issueId: "iss-delhi-g20",
    articleId: "art-outlook-upgrade",
    summary: "First publication of the neutral summary for Viewpoint A.",
    changes: [
      {
        field: "neutralSummary",
        before: null,
        after:
          "Press Trust of India wire copy on preparatory civic and horticultural work along central Delhi's airport approach ahead of the 2023 G20 summit, sourced to municipal officials.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Required before the article can be shown in a comparison pane.",
    at: "2026-03-05T10:00:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-003",
    entity: "panel-note",
    entityId: "a-n1",
    issueId: "iss-delhi-g20",
    articleId: "art-outlook-upgrade",
    summary: "Softened the 'what this report does not contain' note after internal objection.",
    changes: [
      {
        field: "text",
        before:
          "What this report does not contain: any reference to demolition, clearance, eviction or resettlement; any resident of an affected area; any figure for people displaced; any cost.",
        after:
          "What this report does not contain: any reference to demolition, clearance, eviction or resettlement; any resident of an affected area; any figure for people displaced; any cost. Absence is not proof of concealment — a December 2022 civic-works wire story would not normally carry those things. It is recorded here so that readers comparing the two panes can see what each text was built to cover.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "Eli Brandt objected that the original note read as an accusation against the journalist. The panel agreed the caveat was necessary and that the note as written invited the inference we tell readers to avoid.",
    at: "2026-03-07T15:20:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-004",
    entity: "frame-label",
    entityId: "art-outlook-upgrade",
    issueId: "iss-delhi-g20",
    articleId: "art-outlook-upgrade",
    summary: "Framing label set to 'Supports' with published rationale.",
    changes: [
      { field: "label", before: null, after: "supports" },
      { field: "rationale", before: null, after: "See panel decision pd-frame-a." },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Panel vote concluded 9 March 2026, with one recusal recorded.",
    at: "2026-03-09T09:35:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-frame-a",
  },
  {
    id: "rev-005",
    entity: "correction",
    entityId: "b-n1",
    issueId: "iss-delhi-g20",
    articleId: "art-dte-evictions",
    summary: "Correction: eviction figure reattributed from the Down To Earth report to the HLRN report.",
    changes: [
      {
        field: "neutralSummary",
        before:
          "A signed Down To Earth report on demolitions and displacement affecting Delhi's informal settlements ahead of the 2023 G20 summit, which reports that approximately 2.8 lakh people were evicted in Delhi.",
        after:
          "A signed Down To Earth report on demolitions and displacement affecting Delhi's informal settlements in the run-up to the 2023 G20 summit, which treats the official justifications for the clearances as contested.",
      },
      { field: "editorialStatus", before: "published", after: "corrected" },
      { field: "correctionNote", before: null, after: "Correction note appended to the article record." },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "A reader report established that the Delhi figure originates in the Housing and Land Rights Network report, not in this article. Our summary conflated the two sources.",
    at: "2026-05-18T14:30:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-correction-1",
  },
  {
    id: "rev-006",
    entity: "neutral-summary",
    entityId: "art-dte-evictions",
    issueId: "iss-delhi-g20",
    articleId: "art-dte-evictions",
    summary: "First publication of the neutral summary for Viewpoint B.",
    changes: [
      {
        field: "neutralSummary",
        before: null,
        after: "First published version of the Viewpoint B neutral summary.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Required before the article can be shown in a comparison pane.",
    at: "2026-03-05T10:20:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-007",
    entity: "frame-label",
    entityId: "art-dte-evictions",
    issueId: "iss-delhi-g20",
    articleId: "art-dte-evictions",
    summary: "Framing label set to 'Criticises' with published rationale.",
    changes: [
      { field: "label", before: null, after: "criticises" },
      { field: "rationale", before: null, after: "See panel decision pd-frame-b." },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Panel vote concluded 9 March 2026, with one recusal recorded.",
    at: "2026-03-09T10:20:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-frame-b",
  },
  {
    id: "rev-008",
    entity: "neutral-summary",
    entityId: "art-air-preparation",
    issueId: "iss-delhi-g20",
    articleId: "art-air-preparation",
    summary: "Official perspective added with a state-ownership disclosure.",
    changes: [
      { field: "neutralSummary", before: null, after: "First published version." },
      {
        field: "disclosure",
        before: null,
        after: "State broadcaster ownership recorded on the source record and in the rubric.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Primary-source perspective required for the issue to be publishable.",
    at: "2026-03-08T09:00:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-009",
    entity: "neutral-summary",
    entityId: "art-wire-hlrn",
    issueId: "iss-delhi-g20",
    articleId: "art-wire-hlrn",
    summary: "Civil-society perspective added.",
    changes: [{ field: "neutralSummary", before: null, after: "First published version." }],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "Civil-society perspective required for the issue to be publishable.",
    at: "2026-03-08T09:30:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-010",
    entity: "panel-note",
    entityId: "d-n1",
    issueId: "iss-delhi-g20",
    articleId: "art-wire-hlrn",
    summary: "Scope caution added to the HLRN record after the May correction.",
    changes: [
      {
        field: "text",
        before: null,
        after:
          "Scope caution: the 7.4 lakh figure is national and covers two calendar years. It is not a Delhi figure and it is not a G20 figure.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "The same conflation that caused the May correction is common in circulation. Recording the scope on the source record should reduce it recurring.",
    at: "2026-05-18T15:00:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-correction-1",
  },
  {
    id: "rev-011",
    entity: "annotation",
    entityId: "ann-a1",
    issueId: "iss-delhi-g20",
    articleId: "art-outlook-upgrade",
    summary: "Headline annotation reworded to remove an implied accusation.",
    changes: [
      {
        field: "explanation",
        before:
          "The headline claims progress without evidence, leaving readers with a false impression of completion.",
        after:
          "The headline reports momentum rather than an event. 'In full swing' tells the reader that work is proceeding well without stating what has been completed, by when, or at what cost.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "'False impression' asserts intent we cannot establish. The annotation should describe the construction, not attribute a motive.",
    at: "2026-04-14T11:00:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-012",
    entity: "annotation",
    entityId: "ann-b2",
    issueId: "iss-delhi-g20",
    articleId: "art-dte-evictions",
    summary: "Added the mirror comparison to the 'pretext' annotation.",
    changes: [
      {
        field: "explanation",
        before: "'Pretext' converts a stated reason into an alleged reason.",
        after:
          "'Pretext' converts a stated reason into an alleged reason. ... it is the exact mirror of the annotated choice in Viewpoint A, where a stated purpose is reported as a fact.",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason:
      "Readers were finding the Viewpoint B annotations harsher than the Viewpoint A ones. Making the symmetry explicit addresses that without softening either.",
    at: "2026-04-14T11:20:00.000Z",
    approval: "approved",
  },
  {
    id: "rev-013",
    entity: "funding-description",
    entityId: "fa-delhi-1",
    issueId: "iss-delhi-g20",
    summary: "Funding allocation description clarified to name the specific line items.",
    changes: [
      {
        field: "reason",
        before: "Editorial costs for the Delhi issue.",
        after:
          "Hindi translation and first-language review, regional advisory time, accessibility review of the annotation layer, and source verification hours.",
      },
    ],
    editorId: "u-admin",
    editorRole: "admin",
    reason: "'Editorial costs' is not a description a contributor can check anything against.",
    at: "2026-03-16T09:00:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-funding-delhi",
  },
  {
    id: "rev-014",
    entity: "translation",
    entityId: "tr-issue-hi",
    issueId: "iss-delhi-g20",
    summary: "Hindi translation of the issue framing approved and published.",
    changes: [
      { field: "status", before: "user-submitted", after: "panel-approved" },
      { field: "translatorCredit", before: null, after: "Sunehra" },
    ],
    editorId: "u-advisor",
    editorRole: "panel",
    reason: "First-language review completed by the Delhi NCR regional advisor.",
    at: "2026-06-11T08:50:00.000Z",
    approval: "approved",
    panelDecisionId: "pd-translation-hi",
  },
  {
    id: "rev-015",
    entity: "tags",
    entityId: "iss-delhi-g20",
    issueId: "iss-delhi-g20",
    summary: "Added 'Media framing' to the issue topic tags.",
    changes: [
      {
        field: "topics",
        before: "Urban policy, Housing, Displacement, G20",
        after: "Urban policy, Housing, Displacement, G20, Media framing",
      },
    ],
    editorId: "u-panel",
    editorRole: "panel",
    reason: "The issue is used as a teaching case in the Education hub and was not discoverable under that tag.",
    at: "2026-08-14T16:10:00.000Z",
    approval: "approved",
  },
];
