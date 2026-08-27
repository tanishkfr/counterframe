import type { Translation, TranslationReview } from "../types";

/**
 * TRANSLATION POLICY
 * ------------------
 * Counterframe translates the material it wrote: issue framing, neutral
 * summaries, panel notes and Education lessons. It does NOT translate quoted
 * source text.
 *
 * Two reasons, both published to readers in the language switcher:
 *  1. The original source text must remain unchanged, and a translation of a
 *     quotation is a new text that the outlet did not publish.
 *  2. Counterframe holds no republication rights over these excerpts and will
 *     not create derivative versions of them.
 *
 * In Hindi, quoted passages therefore stay in their original language with a
 * labelled note, and the surrounding platform text is Hindi.
 */
export const translations: Translation[] = [
  {
    id: "tr-issue-hi",
    targetType: "issue",
    targetId: "iss-delhi-g20",
    language: "hi",
    status: "panel-approved",
    content: {
      title:
        "2023 G20 शिखर सम्मेलन की तैयारियों के दौरान दिल्ली की अनौपचारिक बस्तियों के साथ क्या हुआ?",
      summary:
        "दिसंबर 2022 से सितंबर 2023 के बीच, G20 नेताओं के शिखर सम्मेलन से पहले नगरपालिका और केंद्रीय एजेंसियों ने मध्य दिल्ली में व्यापक निर्माण और सौंदर्यीकरण कार्य किए। इस कार्यक्रम की कवरेज एक ही प्रश्न पर विभाजित है: यह कार्य किसलिए था? कुछ रिपोर्टिंग इसे सड़क सुधार, पौधारोपण और नागरिक बुनियादी ढांचे के उन्नयन के रूप में प्रस्तुत करती है, विशेष रूप से उन मार्गों पर जिनका उपयोग आने वाले प्रतिनिधिमंडल करते। अन्य रिपोर्टिंग अनौपचारिक बस्तियों के विध्वंस और विस्थापन का वर्णन करती है, और सुधार की शब्दावली को एक ऐसा विवरण मानती है जो वहाँ रहने वाले लोगों के साथ जो हो रहा था उसे ढक देता है। दोनों प्रकार की रिपोर्टिंग वास्तविक, प्रलेखित गतिविधि का वर्णन करती है। यह मुद्दा उनमें से दो को साथ-साथ रखता है ताकि पाठक स्वयं देख सकें कि विवरण कहाँ मिलते हैं, कहाँ अलग होते हैं, और प्रत्येक को क्या दिखाने के लिए बनाया गया था।",
      contrastRationale:
        "ये दोनों रिपोर्टें एक ही शहर में एक ही कार्यक्रम का वर्णन करती हैं, लेकिन इस बात में भिन्न हैं कि उसका विषय किसे माना गया है। दृष्टिकोण A में विषय निर्मित परिवेश है — सड़कें, रेलिंग, पौधारोपण। दृष्टिकोण B में विषय अनौपचारिक बस्तियों के निवासी हैं, और वही सुधार-शब्दावली उद्धरण चिह्नों के भीतर एक संदिग्ध दावे के रूप में प्रकट होती है। आवश्यक प्रकटीकरण: ये दोनों रिपोर्टें लगभग पाँच महीने के अंतराल पर प्रकाशित हुईं (23 दिसंबर 2022 और 11 मई 2023) और इनका दायरा पूरी तरह समान नहीं है।",
    },
    submittedBy: "u-contrib-3",
    submittedAt: "2026-05-30T12:00:00.000Z",
    translatorCredit: "Sunehra",
    reviewId: "trv-1",
    revisionIds: ["rev-014"],
  },
  {
    id: "tr-article-a-hi",
    targetType: "article",
    targetId: "art-outlook-upgrade",
    language: "hi",
    status: "panel-approved",
    content: {
      neutralSummary:
        "प्रेस ट्रस्ट ऑफ इंडिया की वायर कॉपी, जो 2023 G20 शिखर सम्मेलन से पहले मध्य दिल्ली के हवाई अड्डा मार्ग पर नागरिक और उद्यान-संबंधी कार्यों पर आधारित है, और जिसके स्रोत नगरपालिका अधिकारी हैं।",
      "a-s1":
        "प्रेस ट्रस्ट ऑफ इंडिया द्वारा वितरित और आउटलुक इंडिया में प्रकाशित एक वायर रिपोर्ट, जो सितंबर 2023 के शिखर सम्मेलन से लगभग नौ महीने पहले मध्य दिल्ली में तैयारी के नागरिक कार्यों का वर्णन करती है। रिपोर्ट पूरी तरह इस बात के इर्द-गिर्द संगठित है कि नगरपालिका एजेंसियाँ निर्मित परिवेश के साथ क्या करने का इरादा रखती हैं: रेलिंग, हवाई अड्डे के मार्ग पर सड़क की सज्जा, और पौधारोपण। इसमें नामित वक्ता एक वरिष्ठ अधिकारी और नई दिल्ली नगरपालिका परिषद के एक सदस्य हैं। किसी निवासी, किसी आवास संस्था, या कार्यक्रम के किसी आलोचक का उल्लेख नहीं है।",
      "a-s2":
        "जिस मार्ग का वर्णन किया गया है वह वही है जिससे अधिकांश आने वाले प्रतिनिधिमंडल इंदिरा गांधी अंतर्राष्ट्रीय हवाई अड्डे से लुटियंस दिल्ली पहुँचते। रिपोर्ट इसी तथ्य को संगठनकारी मानती है: कार्य की व्याख्या इस संदर्भ में की गई है कि आने वाला आगंतुक क्या देखेगा। नागरिक-कार्य रिपोर्टिंग के लिए यह एक सामान्य संरचना है, और इसे पहचानना पत्रकार पर कोई आरोप नहीं है। यह केवल वह ढाँचा है जिस पर कहानी बनी है, और यही तय करता है कि क्या प्रासंगिक माना जाएगा।",
      "a-s3":
        "शेष रिपोर्ट इसी शैली में जारी रहती है, जिसमें परिषद, लोक निर्माण विभाग और राष्ट्रीय राजमार्ग प्राधिकरण के बीच मार्ग के विभिन्न हिस्सों पर क्षेत्राधिकार के बँटवारे को शामिल किया गया है। लागत नहीं दी गई है। समय-सीमाएँ प्रतिबद्धता के बजाय इरादे के रूप में दी गई हैं। जिस भूमि पर कार्य हो रहा है उसका वर्णन सड़क के नाम से किया गया है, न कि इससे कि उसके किनारे कौन रहता है।",
      "a-n1":
        "इस रिपोर्ट में क्या नहीं है: विध्वंस, हटाने, बेदखली या पुनर्वास का कोई उल्लेख; किसी प्रभावित क्षेत्र का कोई निवासी; विस्थापित लोगों का कोई आँकड़ा; कोई लागत। अनुपस्थिति छिपाने का प्रमाण नहीं है — दिसंबर 2022 की एक नागरिक-कार्य वायर रिपोर्ट में सामान्यतः ये चीज़ें होती भी नहीं। इसे यहाँ इसलिए दर्ज किया गया है ताकि दोनों पक्षों की तुलना करने वाले पाठक देख सकें कि प्रत्येक पाठ किसे शामिल करने के लिए बनाया गया था।",
    },
    submittedBy: "u-contrib-3",
    submittedAt: "2026-05-30T12:10:00.000Z",
    translatorCredit: "Sunehra",
    reviewId: "trv-1",
    revisionIds: ["rev-014"],
  },
  {
    id: "tr-article-b-hi",
    targetType: "article",
    targetId: "art-dte-evictions",
    language: "hi",
    status: "user-submitted",
    content: {
      neutralSummary:
        "डाउन टू अर्थ की एक हस्ताक्षरित रिपोर्ट, जो 2023 G20 शिखर सम्मेलन से पहले दिल्ली की अनौपचारिक बस्तियों को प्रभावित करने वाले विध्वंस और विस्थापन पर आधारित है, और जो इन कार्रवाइयों के आधिकारिक औचित्य को विवादित मानती है।",
      "b-s1":
        "डाउन टू अर्थ में प्रकाशित एक हस्ताक्षरित रिपोर्ट। यह पत्रिका विज्ञान एवं पर्यावरण केंद्र द्वारा प्रकाशित की जाती है। आउटलुक इंडिया की वायर रिपोर्ट के लगभग पाँच महीने बाद और शिखर सम्मेलन से चार महीने पहले लिखी गई यह रिपोर्ट उसी व्यापक तैयारी कार्यक्रम को कवर करती है, लेकिन इसका विषय निर्मित परिवेश नहीं बल्कि अनौपचारिक बस्तियों के निवासी हैं।",
    },
    submittedBy: "u-contrib-6",
    submittedAt: "2026-08-20T15:30:00.000Z",
    revisionIds: [],
  },
  {
    id: "tr-education-euphemism-hi",
    targetType: "education",
    targetId: "edu-euphemism",
    language: "hi",
    status: "machine-draft",
    content: {
      title: "आधिकारिक भाषा में शिष्टोक्ति को पढ़ना",
      standfirst:
        "संस्थाएँ शायद ही कभी अपने कार्यों का वर्णन उन शब्दों में करती हैं जिनका प्रयोग उनके आलोचक करेंगे। यह आमतौर पर झूठ नहीं होता।",
    },
    submittedAt: "2026-07-14T09:00:00.000Z",
    revisionIds: [],
  },
];

export const translationReviews: TranslationReview[] = [
  {
    id: "trv-1",
    translationId: "tr-issue-hi",
    reviewerId: "u-advisor",
    outcome: "approved",
    notes:
      "Reviewed line by line against the English. 'Beautification' is rendered as सौंदर्यीकरण, which carries the same official register in Hindi and is the term Delhi agencies use for themselves. Softening it would have removed the thing being argued about. One change requested and made: an early draft rendered 'informal settlements' as झुग्गी-झोपड़ी throughout, which is the colloquial term and carries a charge the English does not; changed to अनौपचारिक बस्तियाँ.",
    at: "2026-06-11T08:45:00.000Z",
    panelDecisionId: "pd-translation-hi",
  },
];
