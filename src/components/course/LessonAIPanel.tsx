"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  FileText,
  Target,
  Key,
  Clock,
  Check,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  HelpCircle,
  Award,
} from "lucide-react";
import { courseApi } from "@/features/series/api/course.api";
import {
  Lesson,
  LessonIntelligence,
  SuggestedChapter,
  KnowledgeCheck,
  KnowledgeCheckQuestion,
} from "@/features/series/types/course.types";

interface LessonAIPanelProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onLessonUpdated: (updatedData: Partial<Lesson>) => void;
}

type TabType = "summary" | "objectives" | "concepts" | "chapters" | "transcript" | "knowledge_check";

export default function LessonAIPanel({
  lesson,
  isOpen,
  onClose,
  onLessonUpdated,
}: LessonAIPanelProps) {
  const [intelligence, setIntelligence] = useState<LessonIntelligence | null>(null);
  const [knowledgeCheck, setKnowledgeCheck] = useState<KnowledgeCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [acceptingQuiz, setAcceptingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // Editable suggestion draft state
  const [draftSummary, setDraftSummary] = useState({ short: "", detailed: "" });
  const [draftKeyPoints, setDraftKeyPoints] = useState<string[]>([]);
  const [draftObjectives, setDraftObjectives] = useState<string[]>([]);
  const [draftConcepts, setDraftConcepts] = useState<string[]>([]);
  const [draftKeywords, setDraftKeywords] = useState<string[]>([]);
  const [draftChapters, setDraftChapters] = useState<SuggestedChapter[]>([]);
  const [draftQuizQuestions, setDraftQuizQuestions] = useState<KnowledgeCheckQuestion[]>([]);

  // Input states
  const [newPoint, setNewPoint] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterTime, setNewChapterTime] = useState("00:00");

  // Load intelligence & knowledge check on open
  useEffect(() => {
    if (isOpen && lesson?._id) {
      loadData();
    }
  }, [isOpen, lesson?._id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intelRes, quizRes] = await Promise.allSettled([
        courseApi.getLessonIntelligence(lesson._id),
        courseApi.getKnowledgeCheck(lesson._id),
      ]);

      if (intelRes.status === "fulfilled" && intelRes.value.success && intelRes.value.data?.data) {
        const data: LessonIntelligence = (intelRes.value.data as any).data;
        setIntelligence(data);
        populateDraft(data);
      } else {
        setIntelligence(null);
      }

      if (quizRes.status === "fulfilled" && quizRes.value.success && quizRes.value.data?.data) {
        const qData: KnowledgeCheck = (quizRes.value.data as any).data;
        setKnowledgeCheck(qData);
        setDraftQuizQuestions(qData.questions || []);
      } else {
        setKnowledgeCheck(null);
        setDraftQuizQuestions([]);
      }
    } catch {
      setIntelligence(null);
      setKnowledgeCheck(null);
    } finally {
      setLoading(false);
    }
  };

  const populateDraft = (data: LessonIntelligence) => {
    setDraftSummary({
      short: data.summary?.short || "",
      detailed: data.summary?.detailed || "",
    });
    setDraftKeyPoints(data.keyPoints || []);
    setDraftObjectives(data.learningObjectives || []);
    setDraftConcepts(data.concepts || []);
    setDraftKeywords(data.keywords || []);
    setDraftChapters(data.suggestedVideoChapters || data.suggestedChapters || []);
  };

  const handleGenerateIntelligence = async (force = false) => {
    setProcessing(true);
    try {
      toast.info(force ? "Regenerating AI intelligence…" : "Analyzing lesson video…");
      const res = await courseApi.analyzeLesson(lesson._id, { force });
      if (res.success && res.data?.data) {
        const data: LessonIntelligence = (res.data as any).data;
        setIntelligence(data);
        populateDraft(data);
        toast.success("✨ AI Course Intelligence generated!");
      } else {
        throw new Error(res.message || "Analysis failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze lesson");
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptIntelligence = async () => {
    if (!intelligence || intelligence.status !== "completed") {
      toast.error("Cannot accept incomplete AI analysis");
      return;
    }
    if (intelligence.isStale) {
      toast.error("Cannot accept stale AI analysis. Please click Regenerate first.");
      return;
    }

    setAccepting(true);
    try {
      const payload = {
        summary: draftSummary,
        keyPoints: draftKeyPoints,
        learningObjectives: draftObjectives,
        concepts: draftConcepts,
        keywords: draftKeywords,
        suggestedVideoChapters: draftChapters,
        suggestedChapters: draftChapters,
      };

      const res = await courseApi.acceptLessonIntelligence(lesson._id, payload);
      if (res.success) {
        toast.success("✅ AI Intelligence approved and saved to Lesson!");
        onLessonUpdated({
          description: draftSummary.short || lesson.description,
          summary: draftSummary.detailed || draftSummary.short,
          keyPoints: draftKeyPoints,
          learningObjectives: draftObjectives,
          concepts: draftConcepts,
          keywords: draftKeywords,
          suggestedVideoChapters: draftChapters,
          suggestedChapters: draftChapters,
          aiIntelligence: (res.data as any)?.data?.lesson?.aiIntelligence || {
            intelligenceId: intelligence._id,
            acceptedVersion: intelligence.version,
            acceptedAt: new Date().toISOString(),
          },
        });
        setIntelligence({ ...intelligence, acceptedAt: new Date().toISOString() });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save AI content");
    } finally {
      setAccepting(false);
    }
  };

  // ── Knowledge Check Actions ──
  const handleGenerateKnowledgeCheck = async (force = false) => {
    setGeneratingQuiz(true);
    try {
      toast.info(force ? "Regenerating Knowledge Check…" : "Generating AI Knowledge Check…");
      const res = await courseApi.generateKnowledgeCheck(lesson._id, { force, count: 4 });
      if (res.success && res.data?.data) {
        const data: KnowledgeCheck = (res.data as any).data;
        setKnowledgeCheck(data);
        setDraftQuizQuestions(data.questions || []);
        toast.success("✨ 4 Knowledge Check questions generated!");
      } else {
        throw new Error(res.message || "Failed to generate quiz");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate Knowledge Check");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleUpdateQuestion = (qIndex: number, field: keyof KnowledgeCheckQuestion, value: any) => {
    const updated = [...draftQuizQuestions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setDraftQuizQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...draftQuizQuestions];
    const opts = [...updated[qIndex].options];
    opts[optIndex] = { ...opts[optIndex], text };
    updated[qIndex] = { ...updated[qIndex], options: opts };
    setDraftQuizQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newQ: KnowledgeCheckQuestion = {
      id: `q_${draftQuizQuestions.length + 1}`,
      question: "Câu hỏi mới?",
      options: [
        { id: "opt_1", text: "Phương án A" },
        { id: "opt_2", text: "Phương án B" },
        { id: "opt_3", text: "Phương án C" },
        { id: "opt_4", text: "Phương án D" },
      ],
      correctOptionId: "opt_1",
      explanation: "Giải thích đáp án chính xác.",
      cognitiveLevel: "understand",
    };
    setDraftQuizQuestions([...draftQuizQuestions, newQ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setDraftQuizQuestions(draftQuizQuestions.filter((_, idx) => idx !== qIndex));
  };

  const handleAcceptKnowledgeCheck = async () => {
    if (!knowledgeCheck) return;
    if (knowledgeCheck.isStale) {
      toast.error("Knowledge Check is stale. Please regenerate for the latest lesson content.");
      return;
    }

    setAcceptingQuiz(true);
    try {
      // Save any draft edits first
      await courseApi.updateKnowledgeCheck(lesson._id, knowledgeCheck._id, {
        questions: draftQuizQuestions,
      });

      const res = await courseApi.acceptKnowledgeCheck(lesson._id, knowledgeCheck._id);
      if (res.success) {
        toast.success("✅ Knowledge Check accepted & published for learners!");
        setKnowledgeCheck({
          ...knowledgeCheck,
          status: "accepted",
          acceptedAt: new Date().toISOString(),
          questions: draftQuizQuestions,
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to accept Knowledge Check");
    } finally {
      setAcceptingQuiz(false);
    }
  };

  // ── Chapter Marker Helpers ──
  const parseTimestampToSeconds = (ts: string): number => {
    const parts = ts.split(":").map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    return 0;
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const seconds = parseTimestampToSeconds(newChapterTime);
    const updated = [
      ...draftChapters,
      { timestamp: newChapterTime, seconds, title: newChapterTitle.trim() },
    ].sort((a, b) => a.seconds - b.seconds);
    setDraftChapters(updated);
    setNewChapterTitle("");
    setNewChapterTime("00:00");
  };

  const handleRemoveChapter = (idx: number) => {
    setDraftChapters(draftChapters.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-2xl h-full flex flex-col shadow-2xl border-l border-border overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">
                AI Intelligence — {lesson.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Automated learning insights, video chapters & knowledge checks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {intelligence && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  intelligence.isStale
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : intelligence.status === "completed"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {intelligence.isStale
                  ? "Stale Video"
                  : intelligence.status === "completed"
                  ? `v${intelligence.version} Ready`
                  : "Processing"}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Staleness Alert Banner ── */}
        {intelligence?.isStale && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="flex-shrink-0 text-amber-600" />
              <span>
                <strong>Video modified:</strong> Analysis was generated for an older video version.
              </span>
            </div>
            <button
              onClick={() => handleGenerateIntelligence(true)}
              disabled={processing}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-md font-semibold text-[11px] hover:bg-amber-700 transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <RotateCw size={11} className={processing ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
        )}

        {/* ── Main Body ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading AI learning intelligence…</p>
            </div>
          ) : !intelligence ? (
            /* ── Empty State ── */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                AI Instructional Intelligence
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                OpenIdear analyzes your video discourse to extract structured summaries,
                Bloom-aligned learning objectives, domain concepts, video chapter timestamps, and
                assessments.
              </p>

              <button
                type="button"
                onClick={() => handleGenerateIntelligence(false)}
                disabled={processing}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing Lesson Content…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate AI Intelligence
                  </>
                )}
              </button>
            </div>
          ) : processing ? (
            /* ── Processing State ── */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <Loader2 size={36} className="animate-spin text-primary mb-4" />
              <h3 className="text-sm font-bold text-foreground mb-1">
                Processing Lesson Intelligence…
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Transcribing audio discourse, extracting Bloom-aligned objectives, structuring
                concepts, and computing pacing markers.
              </p>
            </div>
          ) : (
            /* ── Intelligence Review Workspace ── */
            <div className="p-6 space-y-6">
              {/* ── Tab Navigation ── */}
              <div className="flex gap-1 p-1 bg-muted/60 rounded-xl border border-border overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "summary"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={13} />
                  Summary & Notes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("objectives")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "objectives"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Target size={13} />
                  Objectives ({draftObjectives.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("concepts")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "concepts"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Key size={13} />
                  Concepts & Tags
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chapters")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "chapters"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock size={13} />
                  Video Chapters ({draftChapters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("knowledge_check")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "knowledge_check"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HelpCircle size={13} />
                  Knowledge Check {knowledgeCheck ? `(${draftQuizQuestions.length})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transcript")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    activeTab === "transcript"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen size={13} />
                  Transcript
                </button>
              </div>

              {/* ── Tab: Summary & Notes ── */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Short Lesson Summary (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={draftSummary.short}
                      onChange={(e) =>
                        setDraftSummary({ ...draftSummary, short: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Detailed Curriculum Overview
                    </label>
                    <textarea
                      rows={4}
                      value={draftSummary.detailed}
                      onChange={(e) =>
                        setDraftSummary({ ...draftSummary, detailed: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Key Points & Takeaways ({draftKeyPoints.length})
                    </label>
                    <div className="space-y-2">
                      {draftKeyPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border"
                        >
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const updated = [...draftKeyPoints];
                              updated[idx] = e.target.value;
                              setDraftKeyPoints(updated);
                            }}
                            className="flex-1 bg-transparent text-xs text-foreground outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraftKeyPoints(draftKeyPoints.filter((_, i) => i !== idx))
                            }
                            className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add new takeaway point…"
                        value={newPoint}
                        onChange={(e) => setNewPoint(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newPoint.trim()) {
                            setDraftKeyPoints([...draftKeyPoints, newPoint.trim()]);
                            setNewPoint("");
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPoint.trim()) {
                            setDraftKeyPoints([...draftKeyPoints, newPoint.trim()]);
                            setNewPoint("");
                          }
                        }}
                        className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Learning Objectives ── */}
              {activeTab === "objectives" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Actionable, Bloom&apos;s Taxonomy-aligned learning outcomes:
                  </p>
                  <div className="space-y-2">
                    {draftObjectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border"
                      >
                        <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const updated = [...draftObjectives];
                            updated[idx] = e.target.value;
                            setDraftObjectives(updated);
                          }}
                          className="flex-1 bg-transparent text-xs text-foreground outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftObjectives(draftObjectives.filter((_, i) => i !== idx))
                          }
                          className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add learning objective (e.g. Giải thích được nguyên lý…)"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newObjective.trim()) {
                          setDraftObjectives([...draftObjectives, newObjective.trim()]);
                          setNewObjective("");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newObjective.trim()) {
                          setDraftObjectives([...draftObjectives, newObjective.trim()]);
                          setNewObjective("");
                        }
                      }}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tab: Concepts & Keywords ── */}
              {activeTab === "concepts" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Core Concepts ({draftConcepts.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {draftConcepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-medium"
                        >
                          {concept}
                          <button
                            onClick={() =>
                              setDraftConcepts(draftConcepts.filter((_, i) => i !== idx))
                            }
                            className="hover:text-destructive cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add new concept…"
                        value={newConcept}
                        onChange={(e) => setNewConcept(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newConcept.trim()) {
                            setDraftConcepts([...draftConcepts, newConcept.trim()]);
                            setNewConcept("");
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newConcept.trim()) {
                            setDraftConcepts([...draftConcepts, newConcept.trim()]);
                            setNewConcept("");
                          }
                        }}
                        className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Keywords & Topic Tags ({draftKeywords.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {draftKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground border border-border rounded-lg text-xs"
                        >
                          #{kw}
                          <button
                            onClick={() =>
                              setDraftKeywords(draftKeywords.filter((_, i) => i !== idx))
                            }
                            className="hover:text-destructive cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add keyword…"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newKeyword.trim()) {
                            setDraftKeywords([...draftKeywords, newKeyword.trim()]);
                            setNewKeyword("");
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newKeyword.trim()) {
                            setDraftKeywords([...draftKeywords, newKeyword.trim()]);
                            setNewKeyword("");
                          }
                        }}
                        className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Video Chapters (Interactive Markers) ── */}
              {activeTab === "chapters" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Video chapter markers allow learners to jump directly to key pacing points:
                  </p>
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {draftChapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between gap-3 bg-card/40 hover:bg-card/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="text"
                            value={ch.timestamp}
                            onChange={(e) => {
                              const updated = [...draftChapters];
                              updated[idx] = {
                                ...updated[idx],
                                timestamp: e.target.value,
                                seconds: parseTimestampToSeconds(e.target.value),
                              };
                              setDraftChapters(updated);
                            }}
                            className="w-16 font-mono text-xs px-2 py-1 rounded bg-primary/10 text-primary font-bold border border-primary/20 text-center"
                          />
                          <input
                            type="text"
                            value={ch.title}
                            onChange={(e) => {
                              const updated = [...draftChapters];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setDraftChapters(updated);
                            }}
                            className="flex-1 text-xs font-bold text-foreground bg-transparent outline-none border-b border-transparent focus:border-border"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 p-3 bg-card rounded-xl border border-border">
                    <input
                      type="text"
                      placeholder="00:00"
                      value={newChapterTime}
                      onChange={(e) => setNewChapterTime(e.target.value)}
                      className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-center"
                    />
                    <input
                      type="text"
                      placeholder="Chapter title…"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddChapter}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Add Chapter
                    </button>
                  </div>
                </div>
              )}

              {/* ── Tab: Knowledge Check ── */}
              {activeTab === "knowledge_check" && (
                <div className="space-y-4">
                  {!knowledgeCheck || draftQuizQuestions.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl">
                      <HelpCircle size={32} className="mx-auto text-primary mb-2 opacity-80" />
                      <h4 className="text-xs font-bold text-foreground mb-1">
                        No Knowledge Check generated yet
                      </h4>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mb-4">
                        Generate 3-5 assessment questions grounded strictly in the approved lesson
                        transcript and learning objectives.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGenerateKnowledgeCheck(false)}
                        disabled={generatingQuiz}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow cursor-pointer disabled:opacity-50"
                      >
                        {generatingQuiz ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Sparkles size={13} />
                        )}
                        Generate 4 Questions
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            knowledgeCheck.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {knowledgeCheck.status === "accepted"
                            ? `Accepted (v${knowledgeCheck.version})`
                            : `Draft v${knowledgeCheck.version}`}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateKnowledgeCheck(true)}
                            disabled={generatingQuiz}
                            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <RotateCw size={11} className={generatingQuiz ? "animate-spin" : ""} />
                            Regenerate
                          </button>
                        </div>
                      </div>

                      {/* Question Cards */}
                      <div className="space-y-4">
                        {draftQuizQuestions.map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-4 bg-card border border-border rounded-xl space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                                Question {qIdx + 1} ({q.cognitiveLevel || "understand"})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIdx)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) =>
                                handleUpdateQuestion(qIdx, "question", e.target.value)
                              }
                              className="w-full text-xs font-bold text-foreground bg-background px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary"
                            />

                            {/* Options */}
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => (
                                <div key={opt.id || optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct_${qIdx}`}
                                    checked={q.correctOptionId === opt.id}
                                    onChange={() =>
                                      handleUpdateQuestion(qIdx, "correctOptionId", opt.id)
                                    }
                                    className="cursor-pointer text-primary focus:ring-primary"
                                  />
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) =>
                                      handleUpdateOption(qIdx, optIdx, e.target.value)
                                    }
                                    className="flex-1 text-xs bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/80 outline-none"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            <div>
                              <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                                Explanation & Pedagogical Rationale
                              </label>
                              <textarea
                                rows={2}
                                value={q.explanation || ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(qIdx, "explanation", e.target.value)
                                }
                                className="w-full text-[11px] text-muted-foreground bg-background/50 px-2.5 py-1.5 rounded-lg border border-border outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                        >
                          <Plus size={13} />
                          Add Question
                        </button>

                        <button
                          type="button"
                          onClick={handleAcceptKnowledgeCheck}
                          disabled={acceptingQuiz || draftQuizQuestions.length === 0}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow cursor-pointer disabled:opacity-50"
                        >
                          {acceptingQuiz ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Accept & Publish Knowledge Check
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Transcript ── */}
              {activeTab === "transcript" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Provider: {intelligence.transcript?.provider || "Cloudflare"}</span>
                    <span>
                      {intelligence.transcript?.segments?.length || 0} timestamped segments
                    </span>
                  </div>

                  <div className="divide-y divide-border border border-border rounded-xl max-h-96 overflow-y-auto p-1 bg-card/30">
                    {(intelligence.transcript?.segments || []).map((seg, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2.5 text-xs p-2 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground/80 py-0.5">
                          {Math.floor(seg.start / 60)}:
                          {Math.floor(seg.start % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                        <p className="text-foreground/90 flex-1 leading-relaxed">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky Action Bar (Creator in Control) ── */}
        {intelligence && intelligence.status === "completed" && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleGenerateIntelligence(true)}
              disabled={processing || accepting}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCw size={13} className={processing ? "animate-spin" : ""} />
              Regenerate (v{intelligence.version + 1})
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptIntelligence}
                disabled={processing || accepting || intelligence.isStale}
                title={
                  intelligence.isStale
                    ? "Cannot accept stale analysis. Please regenerate first."
                    : "Accept suggestions into canonical lesson"
                }
                className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer ${
                  intelligence.isStale
                    ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                }`}
              >
                {accepting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {intelligence.isStale
                  ? "Analysis Stale (Regenerate)"
                  : "Accept Suggestions to Lesson"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
