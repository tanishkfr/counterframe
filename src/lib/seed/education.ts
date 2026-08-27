import type { EducationResource, EducationSuggestion } from "../types";

/**
 * Education material is the only content on Counterframe that is published by
 * the panel rather than compared. Community members may suggest topics; only
 * panel members approve and publish.
 *
 * Every lesson teaches a method of inspection. None concludes for the reader.
 */
export const education: EducationResource[] = [
  {
    id: "edu-euphemism",
    slug: "official-euphemism",
    kind: "explainer",
    title: "Reading euphemism in official language",
    standfirst:
      "Institutions rarely describe what they do in the words their critics would use. That is not usually a lie. Learning to hear the register is more useful than learning to distrust it.",
    body: `An institution describing its own work will almost always name that work in terms of its intended benefit rather than its immediate effect. A road programme becomes "improvement". A clearance becomes "beautification". A reduction in service becomes "consolidation".

It is tempting to treat this as deception, and sometimes it is. More often it is something duller and more consequential: the official name for a programme becomes the only available shorthand for it, and then the shorthand does the arguing.

**The test.** Take the phrase and ask two questions.

First: *what does this phrase describe when I state it as an action with an object?* "Beautification" describes doing something, to something, in some place. Say the sentence with the object restored. If the restored sentence is uncontroversial — planting tulips along a central reservation — then the euphemism was carrying no weight. If the restored sentence is contested — removing dwellings from land beside a road — then the euphemism was carrying the contest.

Second: *who chose the word?* If the outlet is using the programme's own name for itself, that is a reasonable reporting convention, the way you would use the name of a military operation. If the outlet is using a word the programme did not use, that is the outlet's framing choice and belongs to the outlet.

**The mirror.** The move has an opposite, and readers who dislike euphemism often miss it. Placing an official term inside quotation marks — "beautification drives" — is also an editorial act. It converts the programme's own name into an alleged name. Both choices are choices. Neither is the neutral default, because there is no neutral default.

**Where to practise.** On the Delhi G20 issue, the same word appears in three of the four source records: unquoted in Viewpoint A, quoted in Viewpoint B, and unquoted in the official bulletin, which is where it originates. Read the three occurrences in sequence and watch what the punctuation does.`,
    tacticCategories: ["framing", "loaded-language"],
    authorPanelMemberIds: ["pm-mireille"],
    publishedAt: "2026-04-02T10:30:00.000Z",
    updatedAt: "2026-04-02T10:30:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 4,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-omission",
    slug: "omission",
    kind: "guide",
    title: "How to notice what is not there",
    standfirst:
      "Omission is the hardest tactic to see, because nothing on the page points at it. The method is to read for the subject of the sentences.",
    body: `Every other framing device leaves a mark on the text. Omission does not. You cannot catch it by reading more carefully; you catch it by reading structurally.

**Read for the subject.** Go through a report and write down, for each sentence, what the grammatical subject is. In a civic-works report you will typically get: work, the council, the road, the department, bulbs, a senior official. In a displacement report you will get: residents, families, authorities, a demolition.

Neither list is wrong. But the list tells you what the text was built to be about, and therefore what could not have appeared in it without breaking its shape.

**Then ask what class of actor is absent.** Not "what fact was left out" — that leads nowhere, because infinitely many facts are left out of everything. Ask which *party with a stake* has no presence. In the Viewpoint A record on the Delhi issue, no resident of any affected area appears at any point. That is the omission worth naming.

**Apply the fairness test before you conclude anything.** Would this genre, at this length, on this date, normally contain the absent party? A December 2022 wire brief about railing installation would not ordinarily carry displacement reporting, and a critic who treats that absence as evidence of concealment is overreaching. The absence is still worth recording, because when you set that text beside one built around residents, the difference in who has standing is the entire lesson.

**A caution about your own reading.** Omission is the tactic readers most often over-detect, because it costs nothing to allege and cannot be disproved. Counterframe annotations mark where an absent party would belong. They do not assert that anyone decided to leave them out.`,
    tacticCategories: ["omission", "selective-context"],
    authorPanelMemberIds: ["pm-adaeze", "pm-nomvula"],
    publishedAt: "2026-04-09T09:00:00.000Z",
    updatedAt: "2026-05-20T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 4,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-loaded",
    slug: "loaded-language",
    kind: "explainer",
    title: "Evaluative words in the reporter's own voice",
    standfirst:
      "The question is never whether a word is emotive. It is whether the emotion is attributed to someone or supplied by the writer.",
    body: `"A disturbing trend of forced evictions." Every word there is doing ordinary work except one.

"Forced" is a legal and descriptive term with a definition you can check against. "Evictions" is a fact. "Trend" is a claim about frequency, which is checkable in principle. "Disturbing" is a judgement, and it is the writer's, offered to the reader without attribution and without a threshold.

**This is not automatically improper.** Some things warrant a judgement, and a report that refuses to make any is not neutral — it has simply moved its judgement into what it chooses to cover. The purpose of noticing evaluative language is not to disqualify it. It is to be able to separate two questions that feel like one: *do I accept the facts?* and *do I accept the evaluation?*

**Where to look.** Adjectives and adverbs attached to nouns that are already doing the descriptive work. Verbs of speech that grade the speaker: *admitted*, *claimed*, *revealed*, and *informed* all carry a verdict that *said* does not. Intensifiers with no referent: *deeply*, *widely*, *increasingly*.

**Practise the substitution.** Replace the evaluative word with the flattest available alternative and read the sentence again. If the meaning survives intact, the word was decoration. If the sentence suddenly requires you to make up your own mind, the word was doing the arguing.

Try it on the Delhi issue in both directions. Viewpoint B gives you "disturbing" and "pretext". The official bulletin gives you "informed". All three are the same move.`,
    tacticCategories: ["loaded-language", "emotional-appeal"],
    authorPanelMemberIds: ["pm-mireille"],
    publishedAt: "2026-04-16T09:00:00.000Z",
    updatedAt: "2026-04-16T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 3,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-statistics",
    slug: "misleading-statistics",
    kind: "guide",
    title: "Numbers that travel further than their scope",
    standfirst:
      "Most misleading statistics are not fabricated. They are accurate figures that lost their denominator somewhere in transit.",
    body: `A figure has a scope: what it counts, where, over what period, gathered how. A figure without its scope is not a smaller version of the truth. It is a different claim.

**The 7.4 lakh example.** The Housing and Land Rights Network reported approximately 740,000 people forcibly evicted across India during 2022 and 2023. That is a national figure covering two calendar years, assembled from documented cases in 23 states and four union territories.

In circulation, it routinely arrives attached to Delhi, or to the G20 summit, or to both. Neither is what it counts. The number is not wrong; the attachment is. Counterframe made this error itself in an early version of a neutral summary, corrected it in May 2026, and left the correction visible on the article record — you can read it in the History tab.

**Four questions to attach to any figure.**

1. *What is being counted, exactly?* People, or households, or incidents, or structures? These differ by an order of magnitude and are frequently swapped.
2. *Over what period?* Two-year totals reported as annual figures are the single most common distortion.
3. *Compared with what?* A number with no baseline cannot support "unprecedented", "record", or "most extensive".
4. *Who gathered it, and did they publish their method?*

**Give credit where the scope is stated.** The HLRN report says which states it covered, how the cases were gathered, and in which direction the true figure likely differs. That is not a weakness in the number. It is the property that makes it usable. Be more suspicious of the confident round figure with no method attached than of the hedged one that shows its working.

**Counts are not scale.** "20 sculptures and 11 fountains" is exact and tells you almost nothing. Precision reads as rigour and often substitutes for it.`,
    tacticCategories: ["statistic-without-context", "selective-context", "false-certainty"],
    authorPanelMemberIds: ["pm-tomas"],
    publishedAt: "2026-04-23T09:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 5,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-headline",
    slug: "headline-framing",
    kind: "explainer",
    title: "What headlines are for, and what they cost",
    standfirst:
      "A headline is written under constraints the body of the report does not have, often by someone who did not write the report.",
    body: `Headlines are frequently written by sub-editors rather than reporters, to a character count, to be legible out of context, and increasingly to survive being shared with nothing attached.

That set of pressures produces recognisable shapes.

**Momentum headlines** report a state of progress rather than an event: "in full swing", "gathers pace", "on track". They cannot be checked, because no specific claim is made. They leave an impression of completion that the body may not support.

**Attribution-stripped headlines** state a claim that the body attributes to someone. The body says an official said X; the headline says X.

**Quoted headlines** do the reverse, placing a term in quotation marks to signal doubt in a space too short to explain the doubt.

**The method.** Read the headline. Write down what you now believe. Read the body. Write down what it establishes. The gap between the two is the headline's cost, and it is worth measuring even when — especially when — you agree with the headline.

Both primary sources on the Delhi issue illustrate one of these shapes. "Upgradation Work In Full Swing" is a momentum headline. "Slum dwellers rendered homeless as city 'decks up' for summit" is a quoted headline, and 'decks up' is doing precisely the work described above.`,
    tacticCategories: ["headline-emphasis", "framing"],
    authorPanelMemberIds: ["pm-adaeze", "pm-pekka"],
    publishedAt: "2026-05-07T09:00:00.000Z",
    updatedAt: "2026-05-07T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 3,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-images",
    slug: "image-selection",
    kind: "case-study",
    title: "The picture is an argument too",
    standfirst:
      "Counterframe could not obtain the images published with any of the four sources on the Delhi issue. That failure turned out to be the lesson.",
    body: `This lesson was going to be a comparison of the photographs published alongside the four Delhi sources. It could not be written, because Counterframe holds no licence to reproduce any of them. That is worth saying plainly rather than working around.

**What we did instead, and why it is a compromise.** Three of the four records carry a freely licensed photograph from Wikimedia Commons, labelled as contextual and captioned to say so explicitly. The Viewpoint B record carries an image of a Delhi informal settlement taken in **January 2011** — twelve years before the events described, and not of any site the report covers.

That image is doing something. A dense settlement photographed from above reads as a condition rather than as an event. It does not show demolition; it shows the thing that was demolished, in a different place, in a different decade. A reader who skims will absorb it as evidence anyway.

We publish it with a caption that refuses that reading, and we have argued internally about whether even that is sufficient. Junko Arai abstained from the vote to publish this issue partly on these grounds, and her abstention is recorded on the decision.

**What to take from this.**

*Look at the caption before the photograph.* If a caption does not say when and where, assume the image is illustrative and treat it as an argument rather than as evidence.

*Notice the distance of the frame.* Aerial and wide shots make a subject into a condition. Eye-level shots make a subject into people. Neither is dishonest; they answer different questions.

*Notice who is looking.* A photograph taken from a road looking at a settlement, and one taken from inside a settlement looking out, describe the same place and take opposite positions on who the reader is.

*Ask whether the image could be from anywhere.* Stock and archive imagery on news pages is extremely common and frequently unlabelled. Counterframe labels every one of its images as contextual, which is why they look so heavily caveated.`,
    tacticCategories: ["image-selection", "selective-context"],
    authorPanelMemberIds: ["pm-junko"],
    publishedAt: "2026-05-14T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 4,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-source-eval",
    slug: "source-evaluation",
    kind: "guide",
    title: "Evaluating a source without scoring it",
    standfirst:
      "Counterframe does not give sources a credibility score. This is why, and this is what we do instead.",
    body: `A single number attached to an outlet — 7.2 out of 10, "medium credibility", a coloured dot — is the most popular form of source evaluation and the least useful. It compresses a dozen independent properties into one figure, hides which property produced it, and cannot be argued with. It also tends to become an identity: readers learn the score and stop reading the source.

**What we publish instead.** Ten criteria, each assessed separately, each with a written note explaining the verdict, all visible beside the article. A source can have a named author and no correction policy. It can have excellent primary-source access and no geographic context. Those are different situations and a score would erase the difference.

**The criteria, and what they actually tell you.**

*Named author* — accountability, not quality. Wire copy without a byline is normal, not suspect.

*Identifiable outlet* — whether there is a masthead to hold responsible.

*Publication date* — and, separately, whether updates are disclosed. An article silently updated a year later is a different object from the one first published.

*Evidence or citations* — whether claims are traceable to something you could check.

*News and opinion distinguished* — whether the piece signals which it is.

*Correction policy* — the single strongest routine indicator, and the one most often missing. An outlet that publishes its corrections publicly has accepted a cost.

*Directness* — is this reporting, or reporting on reporting?

*Primary-source access* — and to whom. Access to officials and access to residents are both access, and produce different reports.

*Geographic and cultural context* — whether the writer can hear what a phrase means locally.

*Affiliations* — including the publisher's own mission. State ownership is an affiliation. So is an advocacy mandate.

**Use them as a profile, not a total.** Two sources with the same number of criteria met can be useful for completely different things. That is the point.`,
    tacticCategories: ["appeal-to-authority", "unsupported-claim"],
    authorPanelMemberIds: ["pm-adaeze", "pm-hanan"],
    publishedAt: "2026-05-21T09:00:00.000Z",
    updatedAt: "2026-05-21T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 5,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-pairing-video",
    slug: "how-a-pairing-is-chosen",
    kind: "video",
    title: "How a pairing is chosen",
    standfirst:
      "A four-minute walkthrough of the panel's actual process for pairing two sources, including the cases where we decline to pair them at all.",
    body: `This explainer walks through the decision the panel makes before any issue is published: whether two sources genuinely contrast, or whether presenting them as opposed would manufacture a disagreement that is not there.

The full transcript is published below the player, and a static, motion-free version of the same material follows it. Nothing in the explainer is available only in the timed version.`,
    tacticCategories: ["framing"],
    authorPanelMemberIds: ["pm-pekka", "pm-carmen"],
    publishedAt: "2026-04-20T16:00:00.000Z",
    updatedAt: "2026-04-20T16:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-video",
    readingMinutes: 4,
    relatedIssueIds: ["iss-delhi-g20"],
    video: {
      posterSrc: "",
      posterAlt:
        "Title card reading 'How a pairing is chosen', with two overlapping rectangles representing two source panes.",
      durationSeconds: 96,
      captions: [
        { start: 0, end: 8, text: "Before an issue is published, the panel has to answer one question: do these two sources actually contrast?" },
        { start: 8, end: 18, text: "It sounds obvious. In practice it is the decision we get wrong most often, and it is the one with the most at stake." },
        { start: 18, end: 30, text: "The failure mode is not picking a bad source. It is picking two adequate sources and presenting them as opposed when they are not." },
        { start: 30, end: 42, text: "So we start by asking whether the two texts describe an overlapping set of events. If they do not, there is nothing to compare." },
        { start: 42, end: 54, text: "Then we ask who is given standing in each. Not who is quoted — who the text is about. That is usually where the contrast really lives." },
        { start: 54, end: 66, text: "Then the hardest test: would a reader learn something from both that they would not learn from either alone?" },
        { start: 66, end: 78, text: "If the answer is no, we label the pairing Converging, or Insufficient contrast, and we publish that label with our reasoning." },
        { start: 78, end: 88, text: "We have archived an entire issue on those grounds. It is still readable, with the explanation attached." },
        { start: 88, end: 96, text: "Declining to pair is not a failure of the process. Forcing a pairing would be." },
      ],
      transcript: `Before an issue is published, the panel has to answer one question: do these two sources actually contrast?

It sounds obvious. In practice it is the decision we get wrong most often, and it is the one with the most at stake. The failure mode is not picking a bad source — bad sources are easy to spot. It is picking two perfectly adequate sources and presenting them as opposed when they are not, because a two-pane layout implies opposition whether or not the texts support it.

So we start by asking whether the two texts describe an overlapping set of events. If they do not, there is nothing to compare, however different they sound.

Then we ask who is given standing in each. Not who is quoted — who the text is about. A report can quote a resident and still be about a road. That is usually where the contrast really lives, and it is invisible if you only read for claims.

Then the hardest test: would a reader learn something from reading both that they would not learn from either alone? If both texts produce the same understanding, the pairing adds a layout and no information.

If the answer to that last question is no, we label the pairing Converging, or Insufficient contrast, and we publish that label together with our reasoning. We have archived an entire issue on those grounds — the 2021 transit fare comparison — and it remains readable with the explanation attached.

Declining to pair is not a failure of the process. Forcing a pairing would be.`,
      reducedMotionSummary: `The panel applies four tests before publishing any pairing.

1. Do the two texts describe an overlapping set of events? If not, there is nothing to compare.
2. Who is given standing in each — not who is quoted, but who the text is about?
3. Would a reader learn something from both that they would not learn from either alone?
4. If not, the pairing is labelled Converging or Insufficient contrast, with published reasoning.

An issue that fails these tests is archived rather than published as a contrast. The 2021 transit fare issue is the worked example and remains readable.`,
    },
  },
  {
    id: "edu-governance",
    slug: "panel-and-funding",
    kind: "article",
    title: "Who decides, and who pays",
    standfirst:
      "Every editorial judgement on Counterframe has a name attached and a budget line behind it. Here is how both work.",
    body: `A platform that asks readers to inspect other people's editorial decisions has no standing unless its own are inspectable. This is what that means in practice.

**Who decides.** A core panel of ten, plus regional advisors appointed for specific linguistic and cultural context. Members are selected through open application against published criteria, serve fixed terms, and publish their affiliations and conflicts. The panel is deliberately not balanced between viewpoints — an even split between "sides" would itself be an editorial claim about what the sides are. It is balanced for diversity of expertise, region, language and lived experience.

**What the panel may and may not do.** It may label framing, approve pairings, publish corrections, approve translations, and publish Education material. It may not alter source text or original source metadata — those are immutable in the data model, not merely by convention. Every platform-authored change is recorded as a revision with a before-and-after value, an editor, a role, a reason and a timestamp.

**Recusal.** A member with a material interest recuses and the recusal is published beside the decision. On the Delhi issue, one member recused from both framing-label votes because of prior paid consulting for Indian state housing authorities. Another declared directly relevant lived experience and voted, with the declaration published. These are different situations and the panel treats them differently rather than applying a single rule.

**Who pays.** Community contributions only. Amounts, dates and destinations are always published. Identity never is, unless the contributor chooses it. The community votes on funding priorities; the panel executes the approved budget and publishes the ledger against it, including the remaining balance.

**Where this is fictional.** Counterframe is a classroom prototype. The panel members are invented, the contributions are simulated, and no money exists. The source material is real and verifiable. We say this here rather than in a footnote because a transparency platform that is coy about its own status has already failed its premise.`,
    tacticCategories: ["appeal-to-authority"],
    authorPanelMemberIds: ["pm-adaeze", "pm-eli"],
    publishedAt: "2026-06-04T09:00:00.000Z",
    updatedAt: "2026-08-14T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 5,
    relatedIssueIds: [],
  },
  {
    id: "edu-glossary-framing",
    slug: "glossary-framing",
    kind: "glossary",
    title: "Framing",
    standfirst: "Glossary entry.",
    body: "Framing is the selection of what a text is about, which determines what can appear in it. It operates before any individual word choice and is harder to see for that reason.",
    tacticCategories: ["framing"],
    authorPanelMemberIds: ["pm-mireille"],
    publishedAt: "2026-04-02T11:00:00.000Z",
    updatedAt: "2026-04-02T11:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 1,
    relatedIssueIds: [],
    glossaryTerm: {
      term: "Framing",
      definition:
        "The choice of subject and boundary in a text: what it is about, and therefore what is relevant to it. Two reports can share every fact and frame differently, and the framing will usually matter more to a reader's conclusion than any of the shared facts.",
      seeAlso: ["Omission", "Standing"],
    },
  },
  {
    id: "edu-glossary-standing",
    slug: "glossary-standing",
    kind: "glossary",
    title: "Standing",
    standfirst: "Glossary entry.",
    body: "Standing describes which parties a text treats as having a legitimate stake in the events it covers.",
    tacticCategories: ["omission"],
    authorPanelMemberIds: ["pm-nomvula"],
    publishedAt: "2026-04-09T11:00:00.000Z",
    updatedAt: "2026-04-09T11:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 1,
    relatedIssueIds: ["iss-delhi-g20"],
    glossaryTerm: {
      term: "Standing",
      definition:
        "Whose interests a text treats as relevant to the events it describes. A party can be mentioned without having standing, and can have standing without being quoted. Comparing which parties have standing in two reports of the same events is usually more revealing than comparing their claims.",
      seeAlso: ["Framing", "Omission"],
    },
  },
  {
    id: "edu-emotional",
    slug: "emotional-language",
    kind: "explainer",
    title: "Emotional appeal and when it is legitimate",
    standfirst:
      "The instruction to 'be objective' is usually an instruction to adopt somebody else's emotional register rather than none.",
    body: `An account of an eviction written without any emotional register is not a neutral account of an eviction. It is an account written in the register of the institution carrying it out, because that register has been naturalised as neutrality.

This is the most uncomfortable idea on this platform and it is worth stating carefully.

**Emotional appeal is a real tactic.** It can be used to bypass a reader's assessment entirely: an anecdote deployed so that a general claim goes unchecked, an image chosen to make a statistic feel established, a second-person address that implicates the reader in a conclusion they have not reached.

**And the absence of it is also a choice.** "Structures were removed from the site" and "families lost their homes" describe the same event. Neither is neutral. The first adopts the vocabulary of the operation; the second adopts the vocabulary of the people it happened to.

**So the test is not "is this emotive?"** The test is: *does the emotional register substitute for evidence, or accompany it?*

A report that describes a family's circumstances **and** documents the demolition notice, the timeline, and the rehousing offer has used emotion to make evidence legible. A report that describes the family and offers nothing checkable has used emotion instead of evidence. The prose can look identical.

**On this platform.** Counterframe annotates emotional appeal in both directions and does not treat the flatter text as the more trustworthy one. Where a source is flat, the rubric records what it gives you instead.`,
    tacticCategories: ["emotional-appeal", "loaded-language"],
    authorPanelMemberIds: ["pm-nomvula", "pm-mireille"],
    publishedAt: "2026-06-18T09:00:00.000Z",
    updatedAt: "2026-06-18T09:00:00.000Z",
    status: "published",
    panelDecisionId: "pd-education-euphemism",
    readingMinutes: 4,
    relatedIssueIds: ["iss-delhi-g20"],
  },
  {
    id: "edu-draft",
    slug: "comparative-summit-cases",
    kind: "case-study",
    title: "Cities preparing for international events: a comparative reading",
    standfirst:
      "Draft. Under panel review — not yet published, and visible here so readers can see what the review stage looks like.",
    body: `This case study compares coverage of urban preparation programmes across several cities that hosted large international events.

It is currently **under panel review**. Two of the proposed comparison cases rest on sources the panel has not been able to verify to the standard required for publication, and the draft asserts a pattern across cases that the verified material does not yet support. It will not be published until either the sources are verified or the claim is narrowed.

Counterframe shows drafts in this state rather than hiding them, because a platform that only shows finished material teaches that editorial work arrives finished.`,
    tacticCategories: ["framing", "generalisation"],
    authorPanelMemberIds: ["pm-fatima"],
    publishedAt: "2026-08-11T09:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
    status: "under-review",
    panelDecisionId: "",
    readingMinutes: 6,
    relatedIssueIds: ["iss-delhi-g20"],
  },
];

export const educationSuggestions: EducationSuggestion[] = [
  {
    id: "es-1",
    userId: "u-contrib-1",
    topic: "How to read a municipal budget line",
    rationale:
      "Half the arguments on the Delhi issue come down to money nobody can find. A short guide to where civic budget documents live and how the line items are structured would settle a lot of it.",
    at: "2026-06-20T10:00:00.000Z",
    status: "accepted",
    decisionNote: "Accepted for the autumn schedule. Assigned to Tomás Iriarte.",
  },
  {
    id: "es-2",
    userId: "u-contrib-4",
    topic: "A list of outlets that cannot be trusted",
    rationale: "It would save people time.",
    at: "2026-07-02T14:00:00.000Z",
    status: "declined",
    decisionNote:
      "Declined. Counterframe publishes criteria for evaluating a source, not verdicts on outlets. A list of this kind would replace the reader's judgement rather than equip it. 'Evaluating a source without scoring it' covers the underlying need.",
  },
  {
    id: "es-3",
    userId: "u-contrib-6",
    topic: "Reading translated coverage when you do not speak the original language",
    rationale:
      "I read a lot of Hindi and English coverage of the same events and the difference is not only translation, it is which stories get translated at all. I think that is a lesson.",
    at: "2026-08-15T09:00:00.000Z",
    status: "submitted",
  },
];
