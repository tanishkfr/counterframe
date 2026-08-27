"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { localAuthProvider, sessionUser, type AuthResult, type SignUpInput } from "../auth";
import { activeProvider } from "../moderation/adapter";
import { createSeedDatabase } from "../seed";
import type {
  Appeal,
  AuditLog,
  CommunityTake,
  Database,
  EvidenceLink,
  FundingCategory,
  IssueProposal,
  LanguageCode,
  ModerationActionKind,
  ModerationCategory,
  PrivacySettings,
  ReactionKind,
  ReadingProgress,
  Reply,
  Role,
  Session,
  Stance,
  Translation,
  User,
} from "../types";
import { nextState } from "../reading";
import {
  clearAll,
  defaultPreferences,
  isSessionValid,
  loadDatabase,
  loadPreferences,
  loadSession,
  savePreferences,
  saveDatabase,
  saveSession,
  type Preferences,
} from "./persistence";

interface StoreValue {
  db: Database;
  session: Session | null;
  user: User | null;
  /** False until localStorage has been read. User-specific UI waits for this. */
  hydrated: boolean;
  prefs: Preferences;
  setPrefs: (patch: Partial<Preferences>) => void;

  /** Screen-reader announcement for state changes that have no visual focus move. */
  announce: (message: string) => void;
  announcement: string;

  signIn: (email: string, password: string) => AuthResult;
  signUp: (input: SignUpInput) => AuthResult;
  signOut: () => void;

  recordReading: (articleId: string, patch: Partial<ReadingProgress>) => void;
  completeArticle: (articleId: string, requiredDwellMs: number) => void;

  setStance: (issueId: string, stance: Stance, reasoning: string, publicProfile: boolean) => void;

  publishTake: (input: {
    issueId: string;
    title: string;
    body: string;
    stance: Stance;
    evidence: EvidenceLink[];
    articleIds: string[];
    allCompleted: boolean;
  }) => Promise<string>;
  publishReply: (input: {
    takeId: string;
    issueId: string;
    body: string;
    stance: Stance;
    articleIds: string[];
    allCompleted: boolean;
  }) => Promise<string>;
  toggleReaction: (targetId: string, kind: ReactionKind) => void;
  reportContent: (
    targetId: string,
    targetType: "take" | "reply",
    reason: ModerationCategory,
    note: string,
  ) => void;

  moderate: (
    targetId: string,
    targetType: "take" | "reply",
    kind: ModerationActionKind,
    reason: string,
  ) => void;
  submitAppeal: (actionId: string, targetId: string, body: string) => void;
  decideAppeal: (appealId: string, outcome: "upheld" | "overturned", note: string) => void;

  submitProposal: (input: Omit<IssueProposal, "id" | "userId" | "status" | "submittedAt">) => void;
  decideProposal: (
    proposalId: string,
    status: IssueProposal["status"],
    note: string,
    neutralRewrite?: string,
  ) => void;

  submitTranslation: (input: {
    targetType: Translation["targetType"];
    targetId: string;
    language: LanguageCode;
    content: Record<string, string>;
  }) => void;
  reviewTranslation: (
    translationId: string,
    outcome: "approved" | "returned" | "rejected",
    notes: string,
  ) => void;

  contribute: (input: {
    amount: number;
    anonymous: boolean;
    destination: "platform" | "issue";
    issueId?: string;
    note?: string;
  }) => void;
  voteFundingPriority: (category: FundingCategory) => void;

  suggestEducationTopic: (topic: string, rationale: string) => void;

  toggleSavedIssue: (issueId: string) => void;
  updatePrivacy: (patch: Partial<PrivacySettings>) => void;
  updateProfile: (patch: Pick<User, "bio" | "region">) => void;

  setUserRoles: (userId: string, roles: Role[]) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // Server and first client render both use the seed, so hydration matches.
  const [db, setDb] = useState<Database>(() => createSeedDatabase());
  const [session, setSession] = useState<Session | null>(null);
  const [prefs, setPrefsState] = useState<Preferences>(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadDatabase();
    if (stored) setDb(stored);
    const storedSession = loadSession();
    setSession(isSessionValid(storedSession, Date.now()) ? storedSession : null);
    setPrefsState(loadPreferences());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDatabase(db);
  }, [db, hydrated]);

  useEffect(() => {
    if (hydrated) savePreferences(prefs);
  }, [prefs, hydrated]);

  const user = useMemo(() => sessionUser(db, session), [db, session]);

  const announce = useCallback((message: string) => {
    if (announceTimer.current) clearTimeout(announceTimer.current);
    // Clear first so repeating the same message is still announced.
    setAnnouncement("");
    announceTimer.current = setTimeout(() => setAnnouncement(message), 60);
  }, []);

  const setPrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefsState((p) => ({ ...p, ...patch }));
  }, []);

  const audit = useCallback(
    (entry: Omit<AuditLog, "id" | "at">): AuditLog => ({
      ...entry,
      id: id("al"),
      at: new Date().toISOString(),
    }),
    [],
  );

  /* ------------------------------- auth -------------------------------- */

  const signIn = useCallback(
    (email: string, password: string): AuthResult => {
      const result = localAuthProvider.signIn(db, email, password);
      if (result.ok) {
        setSession(result.session);
        saveSession(result.session);
        announce("Signed in.");
      }
      return result;
    },
    [db, announce],
  );

  const signUp = useCallback(
    (input: SignUpInput): AuthResult => {
      const result = localAuthProvider.signUp(db, input);
      if (result.ok) {
        setDb(result.db);
        setSession(result.session);
        saveSession(result.session);
        announce("Account created and signed in.");
      }
      return result;
    },
    [db, announce],
  );

  const signOut = useCallback(() => {
    setSession(null);
    saveSession(null);
    announce("Signed out.");
  }, [announce]);

  /* ------------------------------ reading ------------------------------ */

  const recordReading = useCallback(
    (articleId: string, patch: Partial<ReadingProgress>) => {
      if (!user) return;
      setDb((prev) => {
        const existing = prev.readingProgress.find(
          (p) => p.userId === user.id && p.articleId === articleId,
        );
        const base: ReadingProgress = existing ?? {
          userId: user.id,
          articleId,
          state: "not-started",
          furthestFraction: 0,
          dwellMs: 0,
          reachedEnd: false,
          startedAt: new Date().toISOString(),
        };
        const merged: ReadingProgress = {
          ...base,
          ...patch,
          // Progress is monotonic: it records the furthest point reached, not
          // the current scroll position, so scrolling back never undoes it.
          furthestFraction: Math.max(base.furthestFraction, patch.furthestFraction ?? 0),
          dwellMs: base.dwellMs + (patch.dwellMs ?? 0),
          reachedEnd: base.reachedEnd || Boolean(patch.reachedEnd),
          lastSeenAt: new Date().toISOString(),
        };
        merged.state = nextState(merged);
        return {
          ...prev,
          readingProgress: [
            ...prev.readingProgress.filter(
              (p) => !(p.userId === user.id && p.articleId === articleId),
            ),
            merged,
          ],
        };
      });
    },
    [user],
  );

  const completeArticle = useCallback(
    (articleId: string, requiredDwellMs: number) => {
      if (!user) return;
      const now = new Date().toISOString();
      setDb((prev) => {
        const progress = prev.readingProgress.find(
          (p) => p.userId === user.id && p.articleId === articleId,
        );
        if (!progress) return prev;
        const completed: ReadingProgress = {
          ...progress,
          state: "completed",
          completedAt: now,
          furthestFraction: 1,
          reachedEnd: true,
        };
        return {
          ...prev,
          readingProgress: prev.readingProgress.map((p) =>
            p.userId === user.id && p.articleId === articleId ? completed : p,
          ),
          completions: [
            ...prev.completions.filter(
              (c) => !(c.userId === user.id && c.articleId === articleId),
            ),
            {
              userId: user.id,
              articleId,
              completedAt: now,
              dwellMsAtCompletion: progress.dwellMs,
              requiredDwellMs,
            },
          ],
        };
      });
      announce("Article marked as read.");
    },
    [user, announce],
  );

  /* ------------------------------- stance ------------------------------ */

  const setStance = useCallback(
    (issueId: string, stance: Stance, reasoning: string, publicProfile: boolean) => {
      if (!user) return;
      const now = new Date().toISOString();
      setDb((prev) => {
        const existing = prev.stanceVotes.find(
          (v) => v.issueId === issueId && v.userId === user.id,
        );
        const change = {
          id: id("sc"),
          issueId,
          userId: user.id,
          from: existing?.stance ?? null,
          to: stance,
          at: now,
          reasoning: reasoning || undefined,
        };
        const vote = {
          id: existing?.id ?? id("sv"),
          issueId,
          userId: user.id,
          stance,
          reasoning: reasoning || undefined,
          updatedAt: now,
          publicProfile,
        };
        return {
          ...prev,
          // One current vote per account per issue.
          stanceVotes: [
            ...prev.stanceVotes.filter((v) => !(v.issueId === issueId && v.userId === user.id)),
            vote,
          ],
          stanceChanges: [...prev.stanceChanges, change],
        };
      });
      announce("Your stance was recorded. You can change it at any time.");
    },
    [user, announce],
  );

  /* ----------------------------- discussion ---------------------------- */

  const publishTake = useCallback<StoreValue["publishTake"]>(
    async (input) => {
      if (!user) throw new Error("Not signed in.");
      const takeId = id("t");
      const prediction = await activeProvider.classify({
        targetId: takeId,
        targetType: "take",
        text: input.body,
        title: input.title,
      });
      const take: CommunityTake = {
        id: takeId,
        issueId: input.issueId,
        userId: user.id,
        title: input.title,
        body: input.body,
        stance: input.stance,
        createdAt: new Date().toISOString(),
        readingAtPublish: { articleIds: input.articleIds, allCompleted: input.allCompleted },
        evidence: input.evidence,
        moderationState: prediction.autoHidden ? "temporarily-hidden" : "published",
        moderationReason: prediction.autoHidden
          ? `Automatically hidden pending human review. Classifier ${prediction.modelName} ${prediction.modelVersion} scored ${Math.round(prediction.confidence * 100)}% for ${prediction.topCategory}. No content is removed automatically.`
          : undefined,
        language: "en",
      };
      setDb((prev) => ({
        ...prev,
        takes: [...prev.takes, take],
        predictions: [...prev.predictions, prediction],
        auditLog: [
          ...prev.auditLog,
          audit({
            actorId: user.id,
            actorRole: "contributor",
            action: "take.publish",
            targetType: "take",
            targetId: takeId,
            detail: prediction.autoHidden
              ? "Published and auto-hidden pending review."
              : "Published.",
          }),
        ],
      }));
      announce(
        prediction.autoHidden
          ? "Your take was submitted and is under review before it appears publicly."
          : "Your take was published.",
      );
      return takeId;
    },
    [user, announce, audit],
  );

  const publishReply = useCallback<StoreValue["publishReply"]>(
    async (input) => {
      if (!user) throw new Error("Not signed in.");
      const replyId = id("r");
      const prediction = await activeProvider.classify({
        targetId: replyId,
        targetType: "reply",
        text: input.body,
      });
      const reply: Reply = {
        id: replyId,
        takeId: input.takeId,
        issueId: input.issueId,
        userId: user.id,
        body: input.body,
        stance: input.stance,
        createdAt: new Date().toISOString(),
        readingAtPublish: { articleIds: input.articleIds, allCompleted: input.allCompleted },
        moderationState: prediction.autoHidden ? "temporarily-hidden" : "published",
        moderationReason: prediction.autoHidden
          ? "Automatically hidden pending human review."
          : undefined,
        language: "en",
      };
      setDb((prev) => ({
        ...prev,
        replies: [...prev.replies, reply],
        predictions: [...prev.predictions, prediction],
      }));
      announce(prediction.autoHidden ? "Your reply is under review." : "Your reply was published.");
      return replyId;
    },
    [user, announce],
  );

  const toggleReaction = useCallback(
    (targetId: string, kind: ReactionKind) => {
      if (!user) return;
      setDb((prev) => {
        const existing = prev.reactions.find(
          (r) => r.targetId === targetId && r.userId === user.id && r.kind === kind,
        );
        if (existing) {
          return { ...prev, reactions: prev.reactions.filter((r) => r.id !== existing.id) };
        }
        return {
          ...prev,
          reactions: [
            ...prev.reactions,
            { id: id("rx"), targetId, userId: user.id, kind, at: new Date().toISOString() },
          ],
        };
      });
    },
    [user],
  );

  const reportContent = useCallback(
    (
      targetId: string,
      targetType: "take" | "reply",
      reason: ModerationCategory,
      note: string,
    ) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        flags: [
          ...prev.flags,
          {
            id: id("mf"),
            targetId,
            targetType,
            reporterId: user.id,
            reason,
            note: note || undefined,
            at: new Date().toISOString(),
            status: "open",
            predictionId: prev.predictions.find((p) => p.targetId === targetId)?.id,
            priority: reason === "threat" || reason === "hate-speech" ? "high" : "medium",
          },
        ],
      }));
      announce("Report submitted. A moderator will review it and the decision will be recorded publicly.");
    },
    [user, announce],
  );

  /* ----------------------------- moderation ---------------------------- */

  const moderate = useCallback(
    (
      targetId: string,
      targetType: "take" | "reply",
      kind: ModerationActionKind,
      reason: string,
    ) => {
      if (!user) return;
      const now = new Date().toISOString();
      const stateFor: Partial<Record<ModerationActionKind, CommunityTake["moderationState"]>> = {
        approve: "published",
        "mark-safe": "published",
        "temporarily-hide": "temporarily-hidden",
        remove: "removed",
        restore: "restored",
        "request-edits": "edits-requested",
        escalate: "under-review",
      };
      const nextModerationState = stateFor[kind];

      setDb((prev) => ({
        ...prev,
        takes:
          targetType === "take"
            ? prev.takes.map((t) =>
                t.id === targetId && nextModerationState
                  ? { ...t, moderationState: nextModerationState, moderationReason: reason }
                  : t,
              )
            : prev.takes,
        replies:
          targetType === "reply"
            ? prev.replies.map((r) =>
                r.id === targetId && nextModerationState
                  ? { ...r, moderationState: nextModerationState, moderationReason: reason }
                  : r,
              )
            : prev.replies,
        moderationActions: [
          ...prev.moderationActions,
          {
            id: id("ma"),
            targetId,
            targetType,
            moderatorId: user.id,
            kind,
            reason,
            at: now,
            flagId: prev.flags.find((f) => f.targetId === targetId && f.status === "open")?.id,
            predictionId: prev.predictions.find((p) => p.targetId === targetId)?.id,
          },
        ],
        flags: prev.flags.map((f) =>
          f.targetId === targetId && kind !== "escalate" ? { ...f, status: "resolved" } : f,
        ),
        auditLog: [
          ...prev.auditLog,
          audit({
            actorId: user.id,
            actorRole: "moderator",
            action: `moderation.${kind}`,
            targetType,
            targetId,
            detail: reason,
          }),
        ],
      }));
      announce(`Moderation action recorded: ${kind.replace(/-/g, " ")}.`);
    },
    [user, announce, audit],
  );

  const submitAppeal = useCallback(
    (actionId: string, targetId: string, body: string) => {
      if (!user) return;
      const appeal: Appeal = {
        id: id("ap"),
        actionId,
        targetId,
        userId: user.id,
        body,
        at: new Date().toISOString(),
        status: "submitted",
        decidedAt: null,
      };
      setDb((prev) => ({ ...prev, appeals: [...prev.appeals, appeal] }));
      announce("Appeal submitted. The panel reviews appeals, not the moderator who acted.");
    },
    [user, announce],
  );

  const decideAppeal = useCallback(
    (appealId: string, outcome: "upheld" | "overturned", note: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      setDb((prev) => {
        const appeal = prev.appeals.find((a) => a.id === appealId);
        const restore = outcome === "upheld" && appeal;
        return {
          ...prev,
          appeals: prev.appeals.map((a) =>
            a.id === appealId
              ? { ...a, status: outcome, decisionNote: note, decidedAt: now, decidedBy: user.id }
              : a,
          ),
          takes: restore
            ? prev.takes.map((t) =>
                t.id === appeal.targetId
                  ? { ...t, moderationState: "restored", moderationReason: note }
                  : t,
              )
            : prev.takes,
          auditLog: [
            ...prev.auditLog,
            audit({
              actorId: user.id,
              actorRole: "panel",
              action: `appeal.${outcome}`,
              targetType: "appeal",
              targetId: appealId,
              detail: note,
            }),
          ],
        };
      });
      announce(`Appeal ${outcome}.`);
    },
    [user, announce, audit],
  );

  /* ------------------------------ proposals ---------------------------- */

  const submitProposal = useCallback<StoreValue["submitProposal"]>(
    (input) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        proposals: [
          ...prev.proposals,
          { ...input, id: id("prop"), userId: user.id, status: "submitted", submittedAt: new Date().toISOString() },
        ],
      }));
      announce("Proposal submitted. Every proposal receives a published panel decision.");
    },
    [user, announce],
  );

  const decideProposal = useCallback<StoreValue["decideProposal"]>(
    (proposalId, status, note, neutralRewrite) => {
      if (!user) return;
      const decisionId = id("pd");
      setDb((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId ? { ...p, status, decisionId, neutralRewrite: neutralRewrite ?? p.neutralRewrite } : p,
        ),
        panelDecisions: [
          ...prev.panelDecisions,
          {
            id: decisionId,
            kind: "issue-proposal",
            question: prev.proposals.find((p) => p.id === proposalId)?.question ?? "",
            criteria: [
              "The question can be phrased without presupposing a conclusion.",
              "At least two substantive sources exist with genuinely different frames.",
            ],
            votes: [
              {
                memberId: user.panelMemberId ?? "pm-adaeze",
                vote: status === "rejected" ? "reject" : "approve",
                reasoning: note,
              },
            ],
            outcome:
              status === "rejected"
                ? "rejected"
                : status === "returned-for-clarification"
                  ? "returned-for-clarification"
                  : status === "merged"
                    ? "merged"
                    : "approved",
            summary: note,
            decidedAt: new Date().toISOString(),
            relatedProposalId: proposalId,
          },
        ],
      }));
      announce("Decision recorded and published to the proposal archive.");
    },
    [user, announce],
  );

  /* ---------------------------- translations --------------------------- */

  const submitTranslation = useCallback<StoreValue["submitTranslation"]>(
    (input) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        translations: [
          ...prev.translations,
          {
            id: id("tr"),
            targetType: input.targetType,
            targetId: input.targetId,
            language: input.language,
            status: "user-submitted",
            content: input.content,
            submittedBy: user.id,
            submittedAt: new Date().toISOString(),
            revisionIds: [],
          },
        ],
      }));
      announce("Translation submitted for panel review. Approved translations are credited to the translator.");
    },
    [user, announce],
  );

  const reviewTranslation = useCallback<StoreValue["reviewTranslation"]>(
    (translationId, outcome, notes) => {
      if (!user) return;
      const now = new Date().toISOString();
      const reviewId = id("trv");
      setDb((prev) => {
        const translation = prev.translations.find((t) => t.id === translationId);
        const submitter = translation ? prev.users.find((u) => u.id === translation.submittedBy) : undefined;
        return {
          ...prev,
          translations: prev.translations.map((t) =>
            t.id === translationId
              ? {
                  ...t,
                  status: outcome === "approved" ? "panel-approved" : t.status,
                  reviewId,
                  translatorCredit: outcome === "approved" ? submitter?.pseudonym : t.translatorCredit,
                }
              : t,
          ),
          translationReviews: [
            ...prev.translationReviews,
            { id: reviewId, translationId, reviewerId: user.id, outcome, notes, at: now },
          ],
        };
      });
      announce(`Translation ${outcome}.`);
    },
    [user, announce],
  );

  /* ------------------------------- funding ----------------------------- */

  const contribute = useCallback<StoreValue["contribute"]>(
    (input) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        contributions: [
          ...prev.contributions,
          {
            id: id("fc"),
            amount: input.amount,
            currency: "USD",
            at: new Date().toISOString(),
            anonymous: input.anonymous,
            contributorPseudonym: input.anonymous ? undefined : user.pseudonym,
            userId: input.anonymous ? undefined : user.id,
            destination: input.destination,
            issueId: input.issueId,
            note: input.note,
          },
        ],
      }));
      announce("Simulated contribution recorded in the public ledger. No payment was taken.");
    },
    [user, announce],
  );

  const voteFundingPriority = useCallback(
    (category: FundingCategory) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        fundingPriorityVotes: [
          ...prev.fundingPriorityVotes.filter((v) => v.userId !== user.id),
          { id: id("fp"), userId: user.id, category, at: new Date().toISOString() },
        ],
      }));
      announce("Funding priority recorded.");
    },
    [user, announce],
  );

  const suggestEducationTopic = useCallback(
    (topic: string, rationale: string) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        educationSuggestions: [
          ...prev.educationSuggestions,
          {
            id: id("es"),
            userId: user.id,
            topic,
            rationale,
            at: new Date().toISOString(),
            status: "submitted",
          },
        ],
      }));
      announce("Suggestion submitted. Only panel members can approve and publish Education material.");
    },
    [user, announce],
  );

  /* ------------------------------ account ------------------------------ */

  const toggleSavedIssue = useCallback(
    (issueId: string) => {
      if (!user) return;
      setDb((prev) => {
        const exists = prev.savedIssues.some((s) => s.userId === user.id && s.issueId === issueId);
        return {
          ...prev,
          savedIssues: exists
            ? prev.savedIssues.filter((s) => !(s.userId === user.id && s.issueId === issueId))
            : [...prev.savedIssues, { userId: user.id, issueId, at: new Date().toISOString() }],
        };
      });
    },
    [user],
  );

  const updatePrivacy = useCallback(
    (patch: Partial<PrivacySettings>) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === user.id ? { ...u, privacy: { ...u.privacy, ...patch } } : u,
        ),
      }));
      announce("Privacy settings saved.");
    },
    [user, announce],
  );

  const updateProfile = useCallback(
    (patch: Pick<User, "bio" | "region">) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === user.id ? { ...u, ...patch } : u)),
      }));
      announce("Profile saved.");
    },
    [user, announce],
  );

  const setUserRoles = useCallback(
    (userId: string, roles: Role[]) => {
      if (!user) return;
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, roles } : u)),
        auditLog: [
          ...prev.auditLog,
          audit({
            actorId: user.id,
            actorRole: "admin",
            action: "user.set-roles",
            targetType: "user",
            targetId: userId,
            detail: `Roles set to: ${roles.join(", ")}`,
          }),
        ],
      }));
      announce("Roles updated.");
    },
    [user, announce, audit],
  );

  const resetDemoData = useCallback(() => {
    clearAll();
    setDb(createSeedDatabase());
    setSession(null);
    announce("Demo data reset to the seeded state. You have been signed out.");
  }, [announce]);

  const value = useMemo<StoreValue>(
    () => ({
      db,
      session,
      user,
      hydrated,
      prefs,
      setPrefs,
      announce,
      announcement,
      signIn,
      signUp,
      signOut,
      recordReading,
      completeArticle,
      setStance,
      publishTake,
      publishReply,
      toggleReaction,
      reportContent,
      moderate,
      submitAppeal,
      decideAppeal,
      submitProposal,
      decideProposal,
      submitTranslation,
      reviewTranslation,
      contribute,
      voteFundingPriority,
      suggestEducationTopic,
      toggleSavedIssue,
      updatePrivacy,
      updateProfile,
      setUserRoles,
      resetDemoData,
    }),
    [
      db, session, user, hydrated, prefs, setPrefs, announce, announcement, signIn, signUp,
      signOut, recordReading, completeArticle, setStance, publishTake, publishReply,
      toggleReaction, reportContent, moderate, submitAppeal, decideAppeal, submitProposal,
      decideProposal, submitTranslation, reviewTranslation, contribute, voteFundingPriority,
      suggestEducationTopic, toggleSavedIssue, updatePrivacy, updateProfile, setUserRoles,
      resetDemoData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider.");
  return ctx;
}
