import type { PanelDecision, PanelMember } from "../types";

/**
 * The editorial panel is FICTIONAL. Counterframe is a classroom prototype and
 * has no real governing body. Every person below is invented; the sources they
 * are shown deliberating over are real and verifiable.
 *
 * Composition principle: diversity of expertise, region, language and lived
 * experience. Deliberately NOT split evenly between viewpoints - an artificial
 * left/right balance would be its own editorial claim.
 */
export const panelMembers: PanelMember[] = [
  {
    id: "pm-adaeze",
    name: "Adaeze Nwosu",
    kind: "core",
    role: "Chair, core panel",
    region: "West Africa",
    country: "Nigeria",
    background:
      "Twenty-two years in newsroom standards and corrections work, latterly as readers' editor at a Lagos daily. Writes on retraction practice in low-trust media markets.",
    expertise: ["Corrections policy", "Newsroom standards", "Reader complaints"],
    languages: ["English", "Igbo", "French"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["Visiting fellow, Centre for Media Accountability (unpaid)"],
    conflicts: ["None declared for the Delhi G20 issue."],
    userId: "u-panel",
  },
  {
    id: "pm-ravi",
    name: "Ravi Deshmukh",
    kind: "core",
    role: "Core panel member",
    region: "South Asia",
    country: "India",
    background:
      "Urban planner. Fifteen years on municipal resettlement policy in Maharashtra and Gujarat, including three state-commissioned rehabilitation audits.",
    expertise: ["Urban planning", "Resettlement policy", "Municipal finance"],
    languages: ["Marathi", "Hindi", "English"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["Consultant, two Indian state housing boards (2019-2023)"],
    conflicts: [
      "Has previously accepted paid consulting work from Indian state housing authorities. Recused from the framing-label vote on the Delhi G20 issue.",
    ],
  },
  {
    id: "pm-mireille",
    name: "Mireille Sarr",
    kind: "core",
    role: "Core panel member",
    region: "Europe",
    country: "France",
    background:
      "Linguist specialising in political discourse. Runs a research group on euphemism and administrative language in state communication.",
    expertise: ["Discourse analysis", "Euphemism", "Translation review"],
    languages: ["French", "Wolof", "English"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["Université de Lille (salaried)"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
  {
    id: "pm-tomas",
    name: "Tomás Iriarte",
    kind: "core",
    role: "Core panel member",
    region: "South America",
    country: "Argentina",
    background:
      "Data journalist. Built the eviction-tracking database used by three Buenos Aires housing coalitions. Teaches statistical literacy to reporters.",
    expertise: ["Data verification", "Statistical claims", "Public records"],
    languages: ["Spanish", "English", "Portuguese"],
    selectedAt: "2025-06-01",
    termEndsAt: "2027-06-01",
    affiliations: ["Freelance; occasional contracts with civic-tech nonprofits"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
  {
    id: "pm-hanan",
    name: "Hanan Al-Mutairi",
    kind: "core",
    role: "Core panel member",
    region: "Middle East",
    country: "Kuwait",
    background:
      "Human rights lawyer. Litigates housing and eviction cases; has represented residents in three summit-related clearance disputes.",
    expertise: ["Housing law", "Due process", "Evidence standards"],
    languages: ["Arabic", "English"],
    selectedAt: "2025-06-01",
    termEndsAt: "2027-06-01",
    affiliations: ["Partner, small public-interest law practice"],
    conflicts: [
      "Litigates eviction cases, which is a professional interest in this subject area. Disclosed; voted rather than recused, with the disclosure published beside the vote.",
    ],
  },
  {
    id: "pm-junko",
    name: "Junko Arai",
    kind: "core",
    role: "Core panel member",
    region: "East Asia",
    country: "Japan",
    background:
      "Photo editor. Twelve years selecting and captioning wire imagery; writes on how crop and caption choices change the reading of a scene.",
    expertise: ["Image selection", "Captioning", "Visual evidence"],
    languages: ["Japanese", "English"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["None currently"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
  {
    id: "pm-eli",
    name: "Eli Brandt",
    kind: "core",
    role: "Core panel member",
    region: "North America",
    country: "Canada",
    background:
      "Former municipal press officer, now teaches public communication. Brings the institutional side: how official statements are drafted and what they omit by design.",
    expertise: ["Government communication", "Press releases", "Official framing"],
    languages: ["English", "French"],
    selectedAt: "2025-06-01",
    termEndsAt: "2027-06-01",
    affiliations: ["Adjunct lecturer (salaried)"],
    conflicts: ["Former government communications employee. Disclosed; no recusal required."],
  },
  {
    id: "pm-nomvula",
    name: "Nomvula Khoza",
    kind: "core",
    role: "Core panel member",
    region: "Southern Africa",
    country: "South Africa",
    background:
      "Community organiser in Johannesburg informal settlements. Was herself relocated twice under city upgrading programmes. Sits as a lived-experience member.",
    expertise: ["Lived experience of relocation", "Community consultation"],
    languages: ["isiZulu", "English", "Sesotho"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["Volunteer coordinator, tenants' association"],
    conflicts: [
      "Directly affected by settlement relocation. Declared as relevant lived experience rather than a disqualifying conflict; the panel publishes this alongside her votes.",
    ],
  },
  {
    id: "pm-pekka",
    name: "Pekka Virtanen",
    kind: "core",
    role: "Core panel member",
    region: "Northern Europe",
    country: "Finland",
    background:
      "Media-literacy curriculum designer. Built the framing module used in Finnish upper-secondary civics teaching.",
    expertise: ["Media literacy pedagogy", "Curriculum design", "Assessment"],
    languages: ["Finnish", "Swedish", "English"],
    selectedAt: "2025-02-14",
    termEndsAt: "2027-02-14",
    affiliations: ["National Board of Education working group (unpaid)"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
  {
    id: "pm-carmen",
    name: "Carmen Delgado",
    kind: "core",
    role: "Core panel member",
    region: "Caribbean",
    country: "Dominican Republic",
    background:
      "Accessibility engineer and disability-rights advocate. Reviews every Education release for captioning, transcript quality and reduced-motion equivalents.",
    expertise: ["Accessibility", "Captioning standards", "Plain language"],
    languages: ["Spanish", "English"],
    selectedAt: "2025-06-01",
    termEndsAt: "2027-06-01",
    affiliations: ["None currently"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
  {
    id: "pm-arjun",
    name: "Arjun Balakrishnan",
    kind: "regional-advisor",
    role: "Regional advisor, Delhi NCR",
    region: "South Asia",
    country: "India",
    background:
      "Hindi-English translator and long-time Delhi resident. Advises on local terminology, the jhuggi-jhopri vocabulary, and what Delhi readers hear in phrases like 'beautification'.",
    expertise: ["Hindi translation", "Local terminology", "Delhi civic context"],
    languages: ["Hindi", "English", "Punjabi"],
    selectedAt: "2025-09-05",
    termEndsAt: "2026-09-05",
    affiliations: ["Freelance translator"],
    conflicts: ["None declared for the Delhi G20 issue."],
    userId: "u-advisor",
  },
  {
    id: "pm-fatima",
    name: "Fatima Zahra Ouazzani",
    kind: "regional-advisor",
    role: "Regional advisor, North Africa",
    region: "North Africa",
    country: "Morocco",
    background:
      "Reports on urban redevelopment ahead of international events. Advises on comparative cases where cities prepared for large summits or tournaments.",
    expertise: ["Comparative urban cases", "Event-driven redevelopment"],
    languages: ["Arabic", "French", "English"],
    selectedAt: "2025-09-05",
    termEndsAt: "2026-09-05",
    affiliations: ["Staff reporter, regional weekly"],
    conflicts: ["None declared for the Delhi G20 issue."],
  },
];

export const panelDecisions: PanelDecision[] = [
  {
    id: "pd-proposal-delhi",
    kind: "issue-proposal",
    question:
      "Should Counterframe publish an issue on the treatment of Delhi's informal settlements during preparations for the 2023 G20 Summit?",
    criteria: [
      "The question can be phrased without presupposing a conclusion.",
      "At least two substantive, independently published journalistic sources exist with genuinely different frames.",
      "At least one primary or official source is available.",
      "The subject is of public interest and is teachable as a framing case.",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning:
          "The proposer's original wording asserted a cover-up. Rewritten neutrally, the question is publishable and the source base is strong.",
      },
      {
        memberId: "pm-ravi",
        vote: "approve",
        reasoning:
          "Municipal preparation and displacement are both documented. The pairing teaches how the same programme is described as improvement or as removal.",
      },
      {
        memberId: "pm-hanan",
        vote: "approve",
        reasoning:
          "Due-process questions are well documented by a named advocacy organisation, which gives the critical frame verifiable grounding.",
      },
      {
        memberId: "pm-eli",
        vote: "approve",
        reasoning:
          "The official material is publicly available and attributable, so readers can inspect the institutional framing directly.",
      },
      {
        memberId: "pm-nomvula",
        vote: "approve",
        reasoning:
          "Readers who have lived through relocation will recognise the vocabulary gap. That gap is the lesson.",
      },
      {
        memberId: "pm-pekka",
        vote: "approve",
        reasoning: "Strong teaching case for euphemism and for statistics presented without denominators.",
      },
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning:
          "The word 'beautification' does a great deal of work in this coverage. That alone justifies publication.",
      },
      {
        memberId: "pm-junko",
        vote: "abstain",
        reasoning:
          "I support publication but cannot assess the image record, because none of the four selected sources supplied reusable imagery.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning:
          "Eviction figures are attributable to a named report with a stated methodology and stated limits. Usable.",
      },
      {
        memberId: "pm-carmen",
        vote: "approve",
        reasoning: "Conditional on Hindi review being funded before publication, which the budget provides for.",
      },
    ],
    outcome: "approved",
    summary:
      "Published as an active issue after neutral rewording. The proposer's phrasing was replaced because it asserted concealment as established fact.",
    dissent:
      "Junko Arai abstained: the panel is publishing a visual-framing case study without any of the sources' own imagery, which she considers a real limitation on what the issue can teach about image selection.",
    decidedAt: "2026-03-02T11:00:00.000Z",
    relatedIssueId: "iss-delhi-g20",
    relatedProposalId: "prop-delhi",
  },
  {
    id: "pd-frame-a",
    kind: "frame-label",
    question:
      "What framing label applies to the Outlook India / PTI report on upgrade work ahead of the G20 summit?",
    criteria: [
      "Does the report foreground the stated purpose of the works?",
      "Are affected residents quoted or otherwise represented?",
      "Are contested consequences acknowledged?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning:
          "'Supports' is right. The piece reports official plans in officials' own terms and contains no counterparty.",
      },
      {
        memberId: "pm-eli",
        vote: "approve",
        reasoning:
          "This is routine civic-works wire copy. 'Supports' should not be read as an accusation - it is a description of whose account structures the story.",
      },
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning: "The improvement vocabulary is the outlet's own, not attributed. That settles it.",
      },
      {
        memberId: "pm-ravi",
        vote: "recuse",
        reasoning: "Recused.",
        conflictNote:
          "Paid consulting for Indian state housing authorities between 2019 and 2023 overlaps this subject matter.",
      },
      {
        memberId: "pm-nomvula",
        vote: "approve",
        reasoning: "Nobody who lives on the affected land appears anywhere in the text.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning: "No figures are contextualised, but none are contested either. 'Supports' is the accurate label.",
      },
    ],
    outcome: "approved",
    summary:
      "Labelled 'Supports'. The label describes whose account organises the reporting. It is not a judgement of accuracy or of the journalist.",
    decidedAt: "2026-03-09T09:30:00.000Z",
    relatedIssueId: "iss-delhi-g20",
    relatedArticleId: "art-outlook-upgrade",
  },
  {
    id: "pd-frame-b",
    kind: "frame-label",
    question: "What framing label applies to the Down To Earth report on evictions ahead of the summit?",
    criteria: [
      "Does the report foreground harms or contested consequences?",
      "Is the official justification represented at all?",
      "Are claims sourced to identifiable evidence?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning:
          "'Criticises' is accurate. The official rationale appears, but in scare quotes and as a claim to be doubted.",
      },
      {
        memberId: "pm-hanan",
        vote: "approve",
        reasoning: "Due-process framing is explicit from the opening sentence.",
      },
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning:
          "The word 'pretext' is the pivot. It converts the official reason into an alleged reason.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning:
          "Claims are attributable, though the piece leans on activist estimates without publishing their method.",
      },
      {
        memberId: "pm-nomvula",
        vote: "approve",
        reasoning: "Residents are present in this text in a way they are not in the paired report.",
      },
      {
        memberId: "pm-ravi",
        vote: "recuse",
        reasoning: "Recused.",
        conflictNote: "Same consulting conflict as the paired decision.",
      },
    ],
    outcome: "approved",
    summary:
      "Labelled 'Criticises'. As with the paired label, this describes the organising account, not the truth of the reporting.",
    decidedAt: "2026-03-09T10:15:00.000Z",
    relatedIssueId: "iss-delhi-g20",
    relatedArticleId: "art-dte-evictions",
  },
  {
    id: "pd-pairing",
    kind: "pairing",
    question:
      "Do the Outlook India / PTI and Down To Earth reports contrast sufficiently to be published as Viewpoint A and Viewpoint B?",
    criteria: [
      "Do the two texts describe an overlapping set of events?",
      "Do they differ in which actors are given standing?",
      "Would a reader learn something from reading both that they would not learn from either alone?",
      "Is the pairing free of a manufactured opposition?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning:
          "Genuine contrast. Same programme, different subject: in one the city is the subject, in the other its residents are.",
      },
      {
        memberId: "pm-pekka",
        vote: "approve",
        reasoning: "Teachable without prompting. Students find the gap themselves.",
      },
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning:
          "Note the date gap: December 2022 against May 2023. The pairing must state this, or readers will misread a sequence as a disagreement.",
      },
      {
        memberId: "pm-junko",
        vote: "approve",
        reasoning: "Approved with the caveat that neither source supplies usable imagery.",
      },
      {
        memberId: "pm-hanan",
        vote: "approve",
        reasoning: "Sufficient contrast, and neither is an outlier in its own tradition of coverage.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning: "Approved. The differing scope must be disclosed in the rationale.",
      },
    ],
    outcome: "approved",
    summary:
      "Published as a contrasting pairing, with a required disclosure that the two reports were published roughly five months apart and describe overlapping but not identical scopes.",
    dissent:
      "No dissent, but Mireille Sarr's condition was made binding: the contrast rationale must state the date and scope gap.",
    decidedAt: "2026-03-09T11:00:00.000Z",
    relatedIssueId: "iss-delhi-g20",
  },
  {
    id: "pd-correction-1",
    kind: "correction",
    question:
      "Should the neutral summary of the Down To Earth report be corrected for attributing an eviction figure to the wrong body?",
    criteria: [
      "Was the original summary inaccurate?",
      "Does the correction change the meaning for a reader?",
      "Is the corrected attribution verifiable?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning: "Straightforward correction. Publish it visibly, not quietly.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning:
          "The 2.8 lakh Delhi figure comes from the Housing and Land Rights Network report, not from the Down To Earth piece. Our summary conflated the two.",
      },
      {
        memberId: "pm-hanan",
        vote: "approve",
        reasoning: "Material to a reader assessing what each source actually established.",
      },
    ],
    outcome: "approved",
    summary:
      "Correction published. The Delhi eviction figure was reattributed from the Down To Earth report to the Housing and Land Rights Network report, and a correction note was appended to the article record.",
    decidedAt: "2026-05-18T14:20:00.000Z",
    relatedIssueId: "iss-delhi-g20",
    relatedArticleId: "art-dte-evictions",
    relatedRevisionId: "rev-005",
  },
  {
    id: "pd-translation-hi",
    kind: "translation",
    question:
      "Should the Hindi translation of the Viewpoint A neutral summary and issue framing be approved for publication?",
    criteria: [
      "Does the translation preserve the neutrality of the original?",
      "Are contested terms handled consistently?",
      "Has a first-language reviewer checked it?",
    ],
    votes: [
      {
        memberId: "pm-arjun",
        vote: "approve",
        reasoning:
          "Reviewed line by line. 'Beautification' is rendered as सौंदर्यीकरण, which carries the same official register in Hindi and is the term Delhi agencies themselves use.",
      },
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning: "Register is preserved. No softening in either direction.",
      },
      {
        memberId: "pm-carmen",
        vote: "approve",
        reasoning: "Language metadata and font fallbacks confirmed before approval.",
      },
    ],
    outcome: "approved",
    summary:
      "Hindi translation approved and published with translator credit. The Hindi rendering of the Viewpoint B summary remains in review.",
    decidedAt: "2026-06-11T08:45:00.000Z",
    relatedIssueId: "iss-delhi-g20",
  },
  {
    id: "pd-funding-delhi",
    kind: "funding-allocation",
    question: "Should USD 4,200 be allocated to the Delhi G20 issue?",
    criteria: [
      "Is the requested work necessary to publish the issue responsibly?",
      "Is the amount proportionate to community funding available?",
      "Is every line item receiptable?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning: "Proportionate. Translation and regional review are the bulk of it, which is right.",
      },
      {
        memberId: "pm-carmen",
        vote: "approve",
        reasoning: "Accessibility review is funded rather than volunteered. That matters.",
      },
      {
        memberId: "pm-tomas",
        vote: "approve",
        reasoning: "Line items are receiptable and the ledger will show the remainder.",
      },
      {
        memberId: "pm-ravi",
        vote: "abstain",
        reasoning: "Abstained given the standing conflict on this issue.",
      },
    ],
    outcome: "approved",
    summary:
      "USD 4,200 allocated to the Delhi G20 issue for Hindi translation, regional advisory review, accessibility review, and source verification time.",
    decidedAt: "2026-03-15T13:00:00.000Z",
    relatedIssueId: "iss-delhi-g20",
  },
  {
    id: "pd-education-euphemism",
    kind: "education-publication",
    question: "Should 'Reading euphemism in official language' be published as Education material?",
    criteria: [
      "Is the lesson accurate and free of partisan framing?",
      "Does it teach a method rather than a conclusion?",
      "Are its examples verifiable?",
    ],
    votes: [
      {
        memberId: "pm-mireille",
        vote: "approve",
        reasoning: "Authored it. Examples are drawn from published, linkable material only.",
      },
      { memberId: "pm-pekka", vote: "approve", reasoning: "Classroom-ready and method-first." },
      { memberId: "pm-carmen", vote: "approve", reasoning: "Plain-language pass completed." },
      { memberId: "pm-adaeze", vote: "approve", reasoning: "No conclusion is smuggled in. Publish." },
    ],
    outcome: "approved",
    summary: "Published to the Education hub and linked from the framing annotations on this issue.",
    decidedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "pd-education-video",
    kind: "education-publication",
    question: "Should the video explainer 'How a pairing is chosen' be published?",
    criteria: [
      "Are captions and a full transcript available?",
      "Is there a motion-free equivalent?",
      "Does it describe the actual process rather than an idealised one?",
    ],
    votes: [
      {
        memberId: "pm-carmen",
        vote: "approve",
        reasoning: "Captions timed and reviewed; transcript complete; static equivalent published alongside.",
      },
      {
        memberId: "pm-pekka",
        vote: "approve",
        reasoning: "Accurately describes the process, including the cases where we decline to pair.",
      },
      { memberId: "pm-adaeze", vote: "approve", reasoning: "Approved." },
    ],
    outcome: "approved",
    summary: "Published with captions, transcript and a reduced-motion static summary.",
    decidedAt: "2026-04-20T15:30:00.000Z",
  },
  {
    id: "pd-proposal-rejected",
    kind: "issue-proposal",
    question:
      "Should Counterframe publish an issue asking which national broadcaster is the most dishonest about urban policy?",
    criteria: [
      "Can the question be phrased without presupposing a conclusion?",
      "Is it answerable from source comparison rather than from opinion?",
    ],
    votes: [
      {
        memberId: "pm-adaeze",
        vote: "reject",
        reasoning:
          "The question cannot be rewritten neutrally without becoming a different question. It asks for a verdict on outlets, which is not what this platform does.",
      },
      {
        memberId: "pm-pekka",
        vote: "reject",
        reasoning: "Invites ranking rather than inspection.",
      },
      {
        memberId: "pm-mireille",
        vote: "reject",
        reasoning: "Rejected, with an invitation to resubmit as a specific event comparison.",
      },
    ],
    outcome: "rejected",
    summary:
      "Rejected. Counterframe compares coverage of specific events; it does not rank outlets by honesty. The proposer was invited to resubmit around a specific policy decision.",
    decidedAt: "2026-07-08T12:00:00.000Z",
    relatedProposalId: "prop-rejected",
  },
  {
    id: "pd-appeal-1",
    kind: "appeal",
    question: "Should the temporary hiding of take 'The screens tell you everything' be upheld?",
    criteria: [
      "Did the content meet the stated threshold for the action taken?",
      "Was the moderator's reason adequate and recorded?",
      "Does the appeal raise a fact the moderator did not have?",
    ],
    votes: [
      {
        memberId: "pm-hanan",
        vote: "approve",
        reasoning:
          "Overturn. The flagged phrase is directed at a policy, not a person. The classifier scored it on a keyword and the moderator followed the score too readily.",
      },
      {
        memberId: "pm-adaeze",
        vote: "approve",
        reasoning: "Overturn and restore. Record the classifier's error publicly.",
      },
      {
        memberId: "pm-nomvula",
        vote: "approve",
        reasoning: "Overturn. Anger at a policy is not abuse of a person.",
      },
    ],
    outcome: "approved",
    summary:
      "Appeal upheld. The take was restored, the moderation record annotated, and the classifier's false positive logged for review of the keyword list.",
    decidedAt: "2026-08-14T16:00:00.000Z",
    relatedIssueId: "iss-delhi-g20",
  },
];
