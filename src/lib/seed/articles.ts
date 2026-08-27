import type { Annotation, ArticleBlock, RubricCriterion, SourceArticle } from "../types";

/**
 * SOURCE PROVENANCE
 * -----------------
 * All four records below describe real, published articles. Outlet, author,
 * date, source type and canonical URL were each checked against the canonical
 * URL on 2026-08-27 and are marked "verified"; anything that could not be
 * established is marked "needs-verification" or "unavailable" rather than
 * filled in.
 *
 * Article bodies are NOT full source text. Counterframe is a classroom
 * prototype and does not hold republication rights, so each record carries:
 *   - short attributed verbatim excerpts (`source-quote`), reproduced exactly
 *     and never editable through the platform, and
 *   - Counterframe-authored neutral summary and notes (`platform-*`), which
 *     are versioned and always rendered as visibly separate from source text.
 *
 * Annotations anchor only to `source-quote` and `source-heading` text.
 */

const ISSUE = "iss-delhi-g20";

/** Counts words in the blocks a reader actually reads. */
function countWords(blocks: ArticleBlock[]): number {
  return blocks
    .filter((b) => b.kind !== "platform-note")
    .reduce((total, b) => total + b.text.trim().split(/\s+/).length, 0);
}

function rubric(entries: Array<[RubricCriterion["key"], RubricCriterion["verdict"], string]>): RubricCriterion[] {
  const labels: Record<RubricCriterion["key"], string> = {
    "named-author": "Named author",
    "identifiable-outlet": "Identifiable outlet",
    "publication-date": "Publication date",
    "evidence-cited": "Evidence or citations",
    "news-opinion-separation": "News and opinion distinguished",
    "correction-policy": "Correction policy",
    directness: "Directness of reporting",
    "primary-source-access": "Primary-source access",
    "geographic-context": "Geographic and cultural context",
    affiliations: "Conflicts or relevant affiliations",
  };
  return entries.map(([key, verdict, note]) => ({ key, label: labels[key], verdict, note }));
}

/* ══════════════════ Viewpoint A — Outlook India / PTI ══════════════════ */

const outlookBlocks: ArticleBlock[] = [
  {
    id: "a-h",
    kind: "source-heading",
    text: "Upgradation Work In Full Swing Ahead Of G20 Summit In Delhi",
  },
  {
    id: "a-s1",
    kind: "platform-summary",
    text:
      "A wire report distributed by Press Trust of India and carried by Outlook India, describing preparatory civic work in central Delhi roughly nine months before the September 2023 summit. The report is organised entirely around what municipal agencies say they intend to do to the built environment: railings, street aesthetics along the airport approach, and horticultural planting. Its named speakers are a senior official and a member of the New Delhi Municipal Council. No resident, no housing body and no critic of the programme appears in the text.",
    revisionId: "rev-002",
  },
  {
    id: "a-q1",
    kind: "source-quote",
    text:
      "Work has started on installing new grill along the roadside of the Sardar Patel Marg to improve the aesthetic look of the main street located on way from the Delhi airport to the heart of the city which is slated to host the G20 summit next year, a senior official said on Friday.",
  },
  {
    id: "a-s2",
    kind: "platform-summary",
    text:
      "The stretch described is the route most visiting delegations would travel from Indira Gandhi International Airport into Lutyens' Delhi. The report treats that route as the organising fact: work is explained by reference to what an arriving visitor will see. This is a common and unremarkable structure for civic-works reporting, and noticing it is not an accusation against the journalist. It is simply the frame the story is built on, and it determines what counts as relevant.",
    revisionId: "rev-002",
  },
  {
    id: "a-q2",
    kind: "source-quote",
    text:
      "NDMC Member Kuljeet Singh Chahal also said that the New Delhi Municipal Council has procured stocks of bulbs of tulips, which will be used for horticultural decoration of the city.",
  },
  {
    id: "a-s3",
    kind: "platform-summary",
    text:
      "The remainder of the report continues in this register, covering the jurisdictional split between the Council, the Public Works Department and the National Highways Authority over different segments of the approach road. Costs are not given. Timelines are given as intentions rather than commitments. The land on which the works occur is described by road name, not by who lives beside it.",
    revisionId: "rev-002",
  },
  {
    id: "a-n1",
    kind: "platform-note",
    text:
      "What this report does not contain: any reference to demolition, clearance, eviction or resettlement; any resident of an affected area; any figure for people displaced; any cost. Absence is not proof of concealment — a December 2022 civic-works wire story would not normally carry those things. It is recorded here so that readers comparing the two panes can see what each text was built to cover.",
    revisionId: "rev-003",
  },
];

const outlookArticle: SourceArticle = {
  id: "art-outlook-upgrade",
  issueId: ISSUE,
  metadata: {
    outlet: "Outlook India",
    outletCountry: "India",
    author: {
      value: null,
      state: "unavailable",
      note: "Carried under a PTI wire byline with no named journalist. Not treated as a failure of the outlet; recorded as unavailable rather than guessed.",
    },
    authorLocation: {
      value: "New Delhi, India",
      state: "needs-verification",
      note: "Inferred from the dateline context. Not stated explicitly in the text, so not treated as verified.",
    },
    publishedAt: { value: "2022-12-23", state: "verified", note: "Stated on the canonical page." },
    updatedAt: {
      value: "2024-01-18",
      state: "verified",
      note: "Page records a later update. The nature of the update is not disclosed by the outlet.",
    },
    sourceType: "wire-service",
    canonicalUrl:
      "https://www.outlookindia.com/national/upgradation-work-in-full-swing-ahead-of-g20-summit-in-delhi-news-247740",
    originalHeadline: "Upgradation Work In Full Swing Ahead Of G20 Summit In Delhi",
    language: "en",
    correctionPolicyUrl: {
      value: null,
      state: "needs-verification",
      note: "No corrections policy located at a stable URL during verification. Recorded as unverified, not as absent.",
    },
  },
  blocks: outlookBlocks,
  neutralSummary:
    "Press Trust of India wire copy on preparatory civic and horticultural work along central Delhi's airport approach ahead of the 2023 G20 summit, sourced to municipal officials.",
  frameLabel: {
    label: "supports",
    rationale:
      "The report is structured by the account of the agencies carrying out the work. Their stated purpose — improving how the city looks to arriving visitors — is reported in the outlet's own voice rather than attributed as a claim, and no party who might contest it is represented. 'Supports' describes whose account organises the story. It is not a finding that the report is inaccurate, nor a criticism of the journalist.",
    decidedBy: ["pm-adaeze", "pm-eli", "pm-mireille", "pm-nomvula", "pm-tomas"],
    panelDecisionId: "pd-frame-a",
    decidedAt: "2026-03-09T09:30:00.000Z",
    revisionId: "rev-004",
  },
  topics: ["Urban policy", "G20", "Municipal works", "Delhi"],
  image: {
    src: "/media/viewpoint-a-bharat-mandapam.jpg",
    alt: "Bharat Mandapam, the G20 summit convention centre at Pragati Maidan in New Delhi, illuminated at night.",
    credit: "DesiBoy101, via Wikimedia Commons",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bharat_Mandapam_illuminated.jpg",
    contextualOnly: true,
    caption:
      "Bharat Mandapam, the summit venue at Pragati Maidan, illuminated at night. Contextual image only — this is not the photograph published with the report, and it does not depict the works the report describes.",
  },
  evidenceLinks: [
    {
      id: "ev-a-1",
      label: "New Delhi Municipal Council",
      url: "https://www.ndmc.gov.in/",
      kind: "primary-document",
      verification: "verified",
    },
  ],
  editorialStatus: "published",
  rubric: rubric([
    ["named-author", "no", "Wire copy carried under a PTI agency byline. No individual journalist is identified."],
    ["identifiable-outlet", "yes", "Outlook India is an established, identifiable publication with a masthead."],
    ["publication-date", "yes", "Published 23 December 2022; the page also records an update on 18 January 2024."],
    ["evidence-cited", "partial", "Statements are attributed to named and unnamed officials. No documents, budgets or datasets are linked."],
    ["news-opinion-separation", "yes", "Presented and structured as a news report, not as commentary."],
    ["correction-policy", "unknown", "No corrections policy was located at a stable URL during verification."],
    ["directness", "yes", "Reports statements made directly to the agency, not aggregated from other coverage."],
    ["primary-source-access", "partial", "Direct access to municipal officials; no access to residents or to underlying documents."],
    ["geographic-context", "partial", "Local jurisdictional detail is precise. Social context of the affected areas is absent."],
    ["affiliations", "unknown", "No affiliation or funding disclosure accompanies wire copy of this kind."],
  ]),
  wordCount: countWords(outlookBlocks),
  revisionIds: ["rev-002", "rev-003", "rev-004"],
};

/* ═════════════════ Viewpoint B — Down To Earth ═════════════════ */

const dteBlocks: ArticleBlock[] = [
  {
    id: "b-h",
    kind: "source-heading",
    text: "G20 and Delhi: Slum dwellers rendered homeless as city 'decks up' for summit",
  },
  {
    id: "b-s1",
    kind: "platform-summary",
    text:
      "A signed report in Down To Earth, an Indian environment and development magazine published by the Centre for Science and Environment. Written roughly five months after the Outlook India wire report and four months before the summit itself, it covers the same broad programme of preparation, but takes residents of informal settlements as its subject rather than the built environment. Its central move is to place the official justifications in quotation marks and treat them as claims requiring scrutiny.",
    revisionId: "rev-006",
  },
  {
    id: "b-q1",
    kind: "source-quote",
    text:
      "As the date for the G20 summit to be held in India approaches, the capital city of Delhi has been subjected to a disturbing trend of forced evictions by state authorities.",
  },
  {
    id: "b-q2",
    kind: "source-quote",
    text:
      'Several informal settlements and shelters for the homeless have been erased or threatened with demolition under the pretext of "clearing encroachments", "beautification drives" and "conservation of the Yamuna floodplains", among other reasons.',
  },
  {
    id: "b-s2",
    kind: "platform-summary",
    text:
      "The three phrases the report places in quotation marks are the same categories under which municipal agencies describe their own work. Setting them in quotation marks is an editorial act: it signals to the reader that the stated reason and the operative reason may differ. A reader comparing the two panes will find the identical vocabulary of improvement in both, used without quotation marks on one side and inside them on the other.",
    revisionId: "rev-006",
  },
  {
    id: "b-q3",
    kind: "source-quote",
    text:
      "The Indian government's efforts to improve Delhi's appearance for the upcoming G20 summit have had a profound impact on the lives of slum dwellers in the city, with many expressing anger and frustration as the government carries out what is arguably the most extensive anti-encroachment campaign in recent years.",
  },
  {
    id: "b-s3",
    kind: "platform-summary",
    text:
      "The report goes on to describe specific settlements affected and the position of residents facing demolition without, in the account given, an offered alternative. It notes that the summit was to be held at Pragati Maidan in September. Where it gives scale, it draws on estimates from housing rights organisations and activists rather than on official figures, and it does not publish the method behind those estimates.",
    revisionId: "rev-006",
  },
  {
    id: "b-n1",
    kind: "platform-note",
    text:
      "CORRECTION, 18 May 2026 — An earlier version of this Counterframe summary attributed a figure of approximately 2.8 lakh people evicted in Delhi to this report. That figure comes from the Housing and Land Rights Network's 'Forced Evictions in India 2022 and 2023', which is listed under Additional perspectives, and not from this article. The attribution has been corrected. Panel decision pd-correction-1; revision rev-005.",
    revisionId: "rev-005",
  },
];

const dteArticle: SourceArticle = {
  id: "art-dte-evictions",
  issueId: ISSUE,
  metadata: {
    outlet: "Down To Earth",
    outletCountry: "India",
    author: { value: "Anuj Behal", state: "verified", note: "Byline on the canonical page." },
    authorLocation: {
      value: null,
      state: "unavailable",
      note: "No author location published. Not inferred.",
    },
    publishedAt: { value: "2023-05-11", state: "verified", note: "Stated on the canonical page." },
    updatedAt: { value: null, state: "unavailable", note: "No update timestamp published." },
    sourceType: "news-report",
    canonicalUrl:
      "https://www.downtoearth.org.in/governance/g20-and-delhi-slum-dwellers-rendered-homeless-as-city-decks-up-for-summit-89252",
    originalHeadline:
      "G20 and Delhi: Slum dwellers rendered homeless as city 'decks up' for summit",
    language: "en",
    correctionPolicyUrl: {
      value: null,
      state: "needs-verification",
      note: "Publisher operates an editorial contact route; no dedicated corrections policy URL confirmed.",
    },
  },
  blocks: dteBlocks,
  neutralSummary:
    "A signed Down To Earth report on demolitions and displacement affecting Delhi's informal settlements in the run-up to the 2023 G20 summit, which treats the official justifications for the clearances as contested.",
  frameLabel: {
    label: "criticises",
    rationale:
      "The report foregrounds harms to residents and treats official justifications as claims rather than as explanations, most visibly by placing them in quotation marks and by the word 'pretext'. Residents are given standing that the paired report does not give them. As with the paired label, 'Criticises' describes the organising account and is not a finding about accuracy.",
    decidedBy: ["pm-adaeze", "pm-hanan", "pm-mireille", "pm-tomas", "pm-nomvula"],
    panelDecisionId: "pd-frame-b",
    decidedAt: "2026-03-09T10:15:00.000Z",
    revisionId: "rev-007",
  },
  topics: ["Housing", "Displacement", "G20", "Delhi", "Human rights"],
  image: {
    src: "/media/viewpoint-b-delhi-settlement.jpg",
    alt: "A dense low-rise informal settlement in Delhi photographed from above, with tarpaulin and corrugated-metal roofs.",
    credit: "Sistak, via Wikimedia Commons",
    licence: "CC BY-SA 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Delhi_India_Slum_January_2011.jpg",
    contextualOnly: true,
    caption:
      "An informal settlement in Delhi, photographed in January 2011. Contextual image only — it was taken twelve years before the events described, is not the photograph published with the report, and does not show any of the sites the report covers.",
  },
  evidenceLinks: [
    {
      id: "ev-b-1",
      label: "Housing and Land Rights Network",
      url: "https://hlrn.org.in/",
      kind: "report",
      verification: "verified",
    },
    {
      id: "ev-b-2",
      label: "Down To Earth is published by the Centre for Science and Environment",
      url: "https://www.cseindia.org/",
      kind: "related-coverage",
      verification: "verified",
    },
  ],
  editorialStatus: "corrected",
  rubric: rubric([
    ["named-author", "yes", "Bylined to Anuj Behal."],
    ["identifiable-outlet", "yes", "Down To Earth, published by the Centre for Science and Environment."],
    ["publication-date", "yes", "Published 11 May 2023."],
    ["evidence-cited", "partial", "Cites housing rights organisations and activist estimates. The method behind the estimates is not published in the article."],
    ["news-opinion-separation", "partial", "Presented as reporting, but carries evaluative language ('disturbing', 'pretext') in the reporter's own voice."],
    ["correction-policy", "unknown", "No dedicated corrections policy URL confirmed during verification."],
    ["directness", "yes", "Reports on conditions in Delhi from an India-based publication."],
    ["primary-source-access", "partial", "Access to affected residents and advocacy organisations; official responses are not represented."],
    ["geographic-context", "yes", "Strong local context, including named localities and the floodplain conservation framing."],
    ["affiliations", "partial", "Publisher's own environmental advocacy mission is public and relevant. No individual disclosure is published."],
  ]),
  wordCount: countWords(dteBlocks),
  revisionIds: ["rev-005", "rev-006", "rev-007"],
};

/* ═══════════ Additional perspective — official / state broadcaster ═══════════ */

const airBlocks: ArticleBlock[] = [
  {
    id: "c-h",
    kind: "source-heading",
    text:
      "The preparation for G20 summit in New Delhi on 9th and 10th of next month in full swing",
  },
  {
    id: "c-s1",
    kind: "platform-summary",
    text:
      "A bulletin from News On AIR, the news service of Akashvani (All India Radio), which is part of the state broadcaster Prasar Bharati. Included as a primary-source record of how the preparation programme was described institutionally, eleven days before the summit. Read it as an institutional account rather than as independent verification of it.",
    revisionId: "rev-008",
  },
  {
    id: "c-q1",
    kind: "source-quote",
    text:
      "The preparation for G20 summit in New Delhi on 9th and 10th of the next month is in full swing. The New Delhi Municipal Council (NDMC) has been also working on various projects for beautification of the national capital since last year. As a part of the beautification projects, NDMC has set up 20 sculptures and 11 fountains at prominent locations of the city.",
  },
  {
    id: "c-q2",
    kind: "source-quote",
    text:
      'Talking to Akashvani News, NDMC Vice-President Satish Upadhyay informed that "over 80 thousand potted plants, 43 thousand saplings and three grown plants have been planted." To commemorate the summit, a heritage park is also being set up in Central Delhi.',
  },
  {
    id: "c-s2",
    kind: "platform-summary",
    text:
      "The bulletin is short and consists almost entirely of counts: sculptures, fountains, plants, saplings. Each is a real, checkable quantity. None is placed against a denominator — a budget, a comparison year, an area covered, or a population served — so the figures convey activity without conveying scale. This is the register in which institutional communication typically reports progress, and recognising it is a transferable reading skill.",
    revisionId: "rev-008",
  },
];

const airArticle: SourceArticle = {
  id: "art-air-preparation",
  issueId: ISSUE,
  metadata: {
    outlet: "News On AIR (Akashvani News, Prasar Bharati)",
    outletCountry: "India",
    author: {
      value: null,
      state: "unavailable",
      note: "Published under the newsroom's own name with no individual byline.",
    },
    authorLocation: { value: "New Delhi, India", state: "verified", note: "New Delhi newsroom bulletin." },
    publishedAt: { value: "2023-08-29", state: "verified", note: "Timestamped 29 August 2023 on the canonical page." },
    updatedAt: { value: null, state: "unavailable", note: "No update timestamp published." },
    sourceType: "state-broadcaster",
    canonicalUrl:
      "https://www.newsonair.gov.in/the-preparation-for-g20-summit-in-new-delhi-on-9th-and-10th-of-next-month-in-full-swing",
    originalHeadline:
      "The preparation for G20 summit in New Delhi on 9th and 10th of next month in full swing",
    language: "en",
    correctionPolicyUrl: { value: null, state: "needs-verification", note: "Not located during verification." },
  },
  blocks: airBlocks,
  neutralSummary:
    "A state broadcaster bulletin listing New Delhi Municipal Council beautification works completed ahead of the summit, quoting the Council's vice-president.",
  frameLabel: {
    label: "supports",
    rationale:
      "An institutional account published by a state broadcaster. It is included as a primary source for how the programme was officially described, not as independent corroboration. The label reflects its origin and structure, both of which are disclosed on the record.",
    decidedBy: ["pm-eli", "pm-adaeze"],
    panelDecisionId: "pd-pairing",
    decidedAt: "2026-03-09T11:00:00.000Z",
    revisionId: "rev-008",
  },
  topics: ["Official statement", "G20", "Municipal works", "Delhi"],
  image: {
    src: "/media/official-bharat-mandapam-evening.jpg",
    alt: "Bharat Mandapam at Pragati Maidan, New Delhi, lit in the evening shortly before the September 2023 G20 summit.",
    credit: "Photo Division, Press Information Bureau, Ministry of Information and Broadcasting, Government of India, via Wikimedia Commons",
    licence: "GODL-India",
    licenceUrl: "https://data.gov.in/government-open-data-license-india",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bharat_Mandapam_Evening_View.jpg",
    contextualOnly: true,
    caption:
      "Bharat Mandapam ahead of the September 2023 summit, released by the Press Information Bureau. Contextual image only — it is a government-issued photograph and not the image published with this bulletin.",
  },
  evidenceLinks: [
    {
      id: "ev-c-1",
      label: "Prasar Bharati, India's public service broadcaster",
      url: "https://prasarbharati.gov.in/",
      kind: "primary-document",
      verification: "verified",
    },
  ],
  editorialStatus: "published",
  rubric: rubric([
    ["named-author", "no", "No individual byline. Published under the newsroom's name."],
    ["identifiable-outlet", "yes", "News On AIR, the news service of Akashvani, part of Prasar Bharati."],
    ["publication-date", "yes", "29 August 2023."],
    ["evidence-cited", "partial", "Quantities are stated and attributed to the Council. No underlying records are linked."],
    ["news-opinion-separation", "yes", "Presented as a news bulletin."],
    ["correction-policy", "unknown", "Not located during verification."],
    ["directness", "yes", "Direct interview with the Council's vice-president."],
    ["primary-source-access", "yes", "Direct access to the officials responsible for the works."],
    ["geographic-context", "partial", "Precise on Council jurisdiction; silent on the wider city."],
    ["affiliations", "yes", "State ownership is a material affiliation and is disclosed publicly and on this record."],
  ]),
  wordCount: countWords(airBlocks),
  revisionIds: ["rev-008"],
};

/* ═════════ Additional perspective — civil society / human rights ═════════ */

const wireBlocks: ArticleBlock[] = [
  {
    id: "d-h",
    kind: "source-heading",
    text:
      "'7.4 Lakh People Evicted, 1.53 Lakh Homes Demolished by Govt in the Last Two Years': Report",
  },
  {
    id: "d-s1",
    kind: "platform-summary",
    text:
      "A report in The Wire on 'Forced Evictions in India 2022 and 2023', published by the Housing and Land Rights Network, an advocacy organisation. It is included as a civil-society perspective and as the source of the national eviction figures that circulate widely in coverage of this issue. It was published in March 2024, six months after the summit, and covers India as a whole rather than Delhi alone.",
    revisionId: "rev-009",
  },
  {
    id: "d-q1",
    kind: "source-quote",
    text:
      "Around 7.4 lakh people were forcefully evicted from their homes across rural and urban India by state authorities – at local, state and central levels – in 2022 and 2023, a new report says.",
  },
  {
    id: "d-q2",
    kind: "source-quote",
    text:
      "Since the figures only reflect cases documented by HLRN through primary and secondary data collection in 23 states and four union territories, it estimates that the actual number of persons evicted or displaced across India in this period is likely to be much higher.",
  },
  {
    id: "d-s2",
    kind: "platform-summary",
    text:
      "The second passage is worth reading closely for reasons that have nothing to do with which side it supports. The organisation states the boundary of its own data — which states were covered, how the cases were gathered, and in which direction the figure is likely to be wrong. A reader can therefore judge what the number does and does not establish. Many figures quoted in coverage of this issue, from all directions, do not come with that boundary attached.",
    revisionId: "rev-009",
  },
  {
    id: "d-n1",
    kind: "platform-note",
    text:
      "Scope caution: the 7.4 lakh figure is national and covers two calendar years. It is not a Delhi figure and it is not a G20 figure. Coverage sometimes transfers it to Delhi or to the summit. Counterframe records it here at its stated scope, and does not restate the organisation's Delhi-specific or summit-specific figures, which we have not independently verified against the source report.",
    revisionId: "rev-010",
  },
];

const wireArticle: SourceArticle = {
  id: "art-wire-hlrn",
  issueId: ISSUE,
  metadata: {
    outlet: "The Wire",
    outletCountry: "India",
    author: { value: "Omar Rashid", state: "verified", note: "Byline on the canonical page." },
    authorLocation: { value: null, state: "unavailable", note: "No author location published." },
    publishedAt: { value: "2024-03-07", state: "verified", note: "Stated on the canonical page." },
    updatedAt: { value: null, state: "unavailable", note: "No update timestamp published." },
    sourceType: "ngo-report",
    canonicalUrl:
      "https://m.thewire.in/article/government/7-4-lakh-people-evicted-1-53-lakh-homes-demolished-by-govt-in-the-last-two-years-report",
    originalHeadline:
      "'7.4 Lakh People Evicted, 1.53 Lakh Homes Demolished by Govt in the Last Two Years': Report",
    language: "en",
    correctionPolicyUrl: { value: null, state: "needs-verification", note: "Not located at a stable URL." },
  },
  blocks: wireBlocks,
  neutralSummary:
    "The Wire's report on the Housing and Land Rights Network's national survey of forced evictions in 2022 and 2023, including the organisation's own statement of the limits of its data.",
  frameLabel: {
    label: "criticises",
    rationale:
      "Reports the findings of an advocacy organisation whose position on forced eviction is public. Labelled 'Criticises' on the same basis as the other records: it describes whose account organises the piece. Its methodological transparency is noted separately in the rubric and is a point in its favour.",
    decidedBy: ["pm-hanan", "pm-tomas"],
    panelDecisionId: "pd-pairing",
    decidedAt: "2026-03-09T11:00:00.000Z",
    revisionId: "rev-009",
  },
  topics: ["Housing", "Human rights", "Data", "India"],
  /** Deliberately null: exercises the missing-image state honestly. */
  image: null,
  evidenceLinks: [
    {
      id: "ev-d-1",
      label: "Housing and Land Rights Network — 'Forced Evictions in India 2022 and 2023'",
      url: "https://hlrn.org.in/documents/Press_Release_Forced_Evictions_2022_2023.pdf",
      kind: "report",
      verification: "needs-verification",
    },
  ],
  editorialStatus: "published",
  rubric: rubric([
    ["named-author", "yes", "Bylined to Omar Rashid."],
    ["identifiable-outlet", "yes", "The Wire, an Indian independent news publication."],
    ["publication-date", "yes", "7 March 2024."],
    ["evidence-cited", "yes", "Cites a named report and quotes it directly, including its stated methodological limits."],
    ["news-opinion-separation", "yes", "Reports the findings of a third party rather than advancing its own argument."],
    ["correction-policy", "unknown", "Not located at a stable URL during verification."],
    ["directness", "partial", "Reports on a document rather than on events directly observed."],
    ["primary-source-access", "yes", "Works from the report itself and quotes it."],
    ["geographic-context", "partial", "National in scope; Delhi-specific context is limited."],
    ["affiliations", "yes", "The source organisation's advocacy position is stated plainly in the article."],
  ]),
  wordCount: countWords(wireBlocks),
  revisionIds: ["rev-009", "rev-010"],
};

export const articles: SourceArticle[] = [outlookArticle, dteArticle, airArticle, wireArticle];

/* ═══════════════════════════ annotations ═══════════════════════════ */

/**
 * Every `anchorText` below is a verbatim substring of the referenced block.
 * `src/lib/seed/seed.test.ts` fails the build if that ever stops being true,
 * which is what keeps annotations from silently detaching from source text.
 */
export const annotations: Annotation[] = [
  {
    id: "ann-a1",
    articleId: "art-outlook-upgrade",
    blockId: "a-h",
    anchorText: "In Full Swing",
    category: "headline-emphasis",
    explanation:
      "The headline reports momentum rather than an event. 'In full swing' tells the reader that work is proceeding well without stating what has been completed, by when, or at what cost. Momentum framing is common in civic-works coverage and is not in itself misleading, but it leaves a reader with an impression of progress that the body of the report does not quantify.",
    evidence:
      "The report contains no completion figures, no budget and no timeline commitments — only stated intentions and work said to have started.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:00:00.000Z",
    revisionIds: ["rev-011"],
    educationSlug: "headline-framing",
  },
  {
    id: "ann-a2",
    articleId: "art-outlook-upgrade",
    blockId: "a-q1",
    anchorText: "to improve the aesthetic look",
    category: "framing",
    explanation:
      "The purpose of the work is stated in the outlet's own voice, not attributed to the officials who supplied it. Compare 'to improve the aesthetic look' with 'which officials said would improve the aesthetic look'. The first presents the purpose as a fact about the work; the second presents it as a claim about the work. That one grammatical choice decides whether a reader has anything to weigh.",
    evidence:
      "Attribution in the sentence ('a senior official said on Friday') attaches to the fact that work started, not to the stated purpose.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:05:00.000Z",
    revisionIds: [],
    educationSlug: "official-euphemism",
  },
  {
    id: "ann-a3",
    articleId: "art-outlook-upgrade",
    blockId: "a-q1",
    anchorText: "a senior official said on Friday",
    category: "appeal-to-authority",
    explanation:
      "The single sourcing basis for the report is an unnamed official. An unnamed source is not automatically improper — officials brief on routine works without attribution constantly. It does mean the reader cannot assess who is speaking, what they are responsible for, or what interest they have in the account, and there is no second party in the text against whom to check it.",
    evidence: "No second source, and no document, appears anywhere in the report.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:10:00.000Z",
    revisionIds: [],
    educationSlug: "source-evaluation",
  },
  {
    id: "ann-a4",
    articleId: "art-outlook-upgrade",
    blockId: "a-q2",
    anchorText: "horticultural decoration of the city",
    category: "omission",
    explanation:
      "The subject of every sentence in this report is the city's surface: railings, streets, planting. The people living on and beside the land being worked on are not present as a subject at any point. Omission annotations mark where an absent party would belong, not a claim that the absence was deliberate. Reporting on tulip procurement has no obligation to cover displacement. Reading the two panes together shows how much the choice of subject decides.",
    evidence:
      "The paired Down To Earth report covers overlapping ground in the same city and same programme with residents as its subject.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:15:00.000Z",
    revisionIds: [],
    educationSlug: "omission",
  },
  {
    id: "ann-b1",
    articleId: "art-dte-evictions",
    blockId: "b-q1",
    anchorText: "a disturbing trend",
    category: "loaded-language",
    explanation:
      "An evaluative judgement placed in the reporter's own voice rather than attributed to anyone. The reader is told how to feel about the evictions before being told what the evictions consisted of. This can be entirely warranted, and Counterframe takes no position on whether it is here. It is marked because a reader should be able to see where description ends and evaluation begins.",
    evidence:
      "'Disturbing' is not attributed to a source and is not defined by any threshold stated in the report.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:20:00.000Z",
    revisionIds: [],
    educationSlug: "loaded-language",
  },
  {
    id: "ann-b2",
    articleId: "art-dte-evictions",
    blockId: "b-q2",
    anchorText: "under the pretext of",
    category: "framing",
    explanation:
      "'Pretext' converts a stated reason into an alleged reason. The sentence would report the same events if it read 'for the stated reasons of', but it would leave the reader to judge them. This is the single most consequential word in the passage, and it is the exact mirror of the annotated choice in Viewpoint A, where a stated purpose is reported as a fact.",
    evidence:
      "The three reasons quoted are the same categories under which municipal agencies describe the works in the paired report and in the official bulletin.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:25:00.000Z",
    revisionIds: ["rev-012"],
    educationSlug: "official-euphemism",
  },
  {
    id: "ann-b3",
    articleId: "art-dte-evictions",
    blockId: "b-q3",
    anchorText: "arguably the most extensive anti-encroachment campaign in recent years",
    category: "unsupported-claim",
    explanation:
      "A superlative with a hedge attached. 'Arguably' concedes that the claim is not established, while the superlative leaves the impression that it is. No comparison period is given, no earlier campaign is named, and no figure is offered against which 'most extensive' could be assessed.",
    evidence:
      "The report gives no comparative figures for previous campaigns and cites no source for the ranking.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:30:00.000Z",
    revisionIds: [],
    educationSlug: "misleading-statistics",
  },
  {
    id: "ann-b4",
    articleId: "art-dte-evictions",
    blockId: "b-q3",
    anchorText: "many expressing anger and frustration",
    category: "generalisation",
    explanation:
      "'Many' is unquantified. It could describe a handful of people the reporter spoke to or a documented majority, and the reader cannot tell which. Where a report elsewhere relies on activist estimates without publishing their method, an unquantified 'many' compounds the difficulty of establishing scale.",
    evidence: "No count, sample, or survey is referenced in support of the characterisation.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-11T09:35:00.000Z",
    revisionIds: [],
    educationSlug: "misleading-statistics",
  },
  {
    id: "ann-c1",
    articleId: "art-air-preparation",
    blockId: "c-q1",
    anchorText: "20 sculptures and 11 fountains",
    category: "statistic-without-context",
    explanation:
      "Precise counts with no denominator. Twenty sculptures across what area, at what cost, compared with what previous year? Exact numbers read as rigour, and often substitute for it. The figures here are almost certainly accurate; the point is that accuracy and informativeness are different properties.",
    evidence:
      "The bulletin gives no budget, no area, no comparison period and no population served.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-12T10:00:00.000Z",
    revisionIds: [],
    educationSlug: "misleading-statistics",
  },
  {
    id: "ann-c2",
    articleId: "art-air-preparation",
    blockId: "c-q2",
    anchorText: "NDMC Vice-President Satish Upadhyay informed",
    category: "appeal-to-authority",
    explanation:
      "The verb 'informed' treats the official's statement as the transmission of established fact rather than as a claim by an interested party. Compare 'said' or 'stated'. On a state broadcaster reporting on a state body, that choice of verb is worth noticing.",
    evidence:
      "The speaker is an office-holder of the body whose work is being described, quoted by the state broadcaster.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-12T10:05:00.000Z",
    revisionIds: [],
    educationSlug: "source-evaluation",
  },
  {
    id: "ann-d1",
    articleId: "art-wire-hlrn",
    blockId: "d-q1",
    anchorText: "Around 7.4 lakh people",
    category: "selective-context",
    explanation:
      "This is a national figure covering two calendar years. In circulation it is frequently attached to Delhi, or to the summit, or to both. Neither is what the number measures. The annotation is not a criticism of this report, which states the scope plainly in the same sentence — it marks a figure that loses its scope as it travels.",
    evidence:
      "The scope is stated in the sentence itself: 'across rural and urban India ... in 2022 and 2023'.",
    authorId: "u-panel",
    authorRole: "panel",
    createdAt: "2026-03-12T10:10:00.000Z",
    revisionIds: [],
    educationSlug: "misleading-statistics",
  },
];
