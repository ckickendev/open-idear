"use client";
import { ENV } from "@/api/const";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import { courseApi } from "@/features/series/api/course.api";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle,
  Lock,
  Play,
  FileText,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  RotateCw,
  Award,
  Check,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Compass,
  ArrowRight,
  Target,
  TrendingUp,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Stream } from "@cloudflare/stream-react";
import { toast } from "sonner";
import {
  KnowledgeCheck,
  KnowledgeCheckQuestion,
  KnowledgeCheckAttemptResult,
  SuggestedChapter,
  TutorSession,
  TutorMessage,
  TutorReference,
  LessonMastery,
  ObjectiveMastery,
  MasteryLevel,
} from "@/features/series/types/course.types";

type Lesson = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  summary?: string;
  learningObjectives?: string[];
  keyPoints?: string[];
  concepts?: string[];
  keywords?: string[];
  suggestedVideoChapters?: SuggestedChapter[];
  suggestedChapters?: SuggestedChapter[];
  type: "video" | "file" | "text";
  isFreePreview: boolean;
  order: number;
  media?: { url: string; type: string; uid?: string; cloudflareId?: string; version?: number };
};

type Chapter = {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type Course = {
  _id: string;
  title: string;
  slug: string;
  chapters: Chapter[];
};

type LearnerTab = "overview" | "chapters" | "quiz" | "mastery" | "tutor" | "qa" | "notes";

const WatchPage = () => {
  const { slug, lessonSlug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<LearnerTab>("overview");

  // Video Chapter playback tracking
  const [currentTime, setCurrentTime] = useState(0);
  const streamRef = useRef<any>(null);

  // Knowledge Check Learner State
  const [quizData, setQuizData] = useState<{
    _id: string;
    version: number;
    totalQuestions: number;
    questions: KnowledgeCheckQuestion[];
  } | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<KnowledgeCheckAttemptResult | null>(null);

  // AI Learning Companion (Tutor) State
  const [tutorSession, setTutorSession] = useState<TutorSession | null>(null);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [sendingTutor, setSendingTutor] = useState(false);
  const [tutorInput, setTutorInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Learning Mastery State
  const [lessonMastery, setLessonMastery] = useState<LessonMastery | null>(null);
  const [loadingMastery, setLoadingMastery] = useState(false);

  const changeLoad = loadingStore((state) => state.changeLoad);
  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        changeLoad();
        const response = await courseApi.getCourseBySlug(slug as string);
        const courseData = (response.data as any)?.data || (response as any)?.data;
        if (!courseData) {
          router.push(`/courses/${slug}`);
          return;
        }
        setCourse(courseData);

        const lessons =
          courseData.chapters?.flatMap((ch: Chapter) => ch.lessons || []) || [];
        setAllLessons(lessons);

        const lesson =
          lessons.find((l: Lesson) => l.slug === lessonSlug) || lessons[0];
        setCurrentLesson(lesson);

        if (lesson && courseData.chapters) {
          const parentChapter = courseData.chapters.find((ch: Chapter) =>
            ch.lessons?.some((l: Lesson) => l._id === lesson._id),
          );
          if (parentChapter) {
            setExpandedChapters([parentChapter._id]);
          }
        }

        if (!lessonSlug && lessons[0]) {
          router.replace(`/courses/${slug}/learn/${lessons[0].slug}`);
        }

        if (currentUser?._id && courseData._id) {
          const enrollRes = await courseApi.checkEnrollment(courseData._id);
          if (enrollRes.success) {
            const data = (enrollRes.data as any)?.data;
            setIsEnrolled(data?.enrolled || false);
            if (data?.enrollment) {
              setCompletedLessons(data.enrollment.completedLessons || []);
              setProgress(data.enrollment.progress || 0);
            }
          }
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error(error);
        router.push(`/courses/${slug}`);
      } finally {
        changeLoad();
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, lessonSlug, currentUser?._id]);

  // Load Knowledge Check, Tutor Session & Mastery when lesson changes
  useEffect(() => {
    if (currentLesson?._id) {
      loadLearnerQuiz(currentLesson._id);
      loadTutor(currentLesson._id);
      loadMastery(currentLesson._id);
      setSelectedAnswers({});
      setQuizResult(null);
    }
  }, [currentLesson?._id]);

  useEffect(() => {
    if (activeTab === "tutor") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [tutorMessages, activeTab]);

  const loadLearnerQuiz = async (lessonId: string) => {
    setLoadingQuiz(true);
    try {
      const res = await courseApi.getLearnerKnowledgeCheck(lessonId);
      if (res.success && res.data?.data) {
        setQuizData((res.data as any).data);
      } else {
        setQuizData(null);
      }
    } catch {
      setQuizData(null);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const loadMastery = async (lessonId: string) => {
    if (!currentUser?._id) return;
    setLoadingMastery(true);
    try {
      const res = await courseApi.getLessonMastery(lessonId);
      if (res.success && res.data?.data) {
        setLessonMastery((res.data as any).data);
      }
    } catch {
      setLessonMastery(null);
    } finally {
      setLoadingMastery(false);
    }
  };

  const loadTutor = async (lessonId: string) => {
    if (!currentUser?._id) return;
    setLoadingTutor(true);
    try {
      const sessionRes = await courseApi.getTutorSession(lessonId);
      if (sessionRes.success && sessionRes.data?.data) {
        const session: TutorSession = (sessionRes.data as any).data;
        setTutorSession(session);

        const msgRes = await courseApi.getTutorMessages(lessonId, session._id);
        if (msgRes.success && msgRes.data?.data) {
          setTutorMessages((msgRes.data as any).data);
        }
      }
    } catch {
      setTutorSession(null);
      setTutorMessages([]);
    } finally {
      setLoadingTutor(false);
    }
  };

  const handleSendTutorMessage = async (customMessage?: string, includeTimestamp = false) => {
    const messageToSend = (customMessage || tutorInput).trim();
    if (!messageToSend || !currentLesson?._id) return;
    if (!currentUser?._id) {
      toast.error("Vui lòng đăng nhập để sử dụng Trợ lý Học tập AI");
      return;
    }

    setTutorInput("");
    setSendingTutor(true);

    // Optimistic user message
    const tempUserMsg: TutorMessage = {
      _id: `temp_${Date.now()}`,
      session: tutorSession?._id || "",
      user: String(currentUser._id),
      lesson: currentLesson._id,
      role: "user",
      content: messageToSend,
      createdAt: new Date().toISOString(),
    };
    setTutorMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await courseApi.sendTutorMessage(currentLesson._id, {
        message: messageToSend,
        sessionId: tutorSession?._id,
        timestampSeconds: includeTimestamp ? currentTime : undefined,
      });

      if (res.success && res.data?.data) {
        const { assistantMessage, session } = (res.data as any).data;
        setTutorMessages((prev) => [...prev.filter((m) => m._id !== tempUserMsg._id), tempUserMsg, assistantMessage]);
        if (session) setTutorSession(session);
        // Refresh mastery
        if (currentLesson?._id) loadMastery(currentLesson._id);
      } else {
        throw new Error(res.message || "Failed to get tutor response");
      }
    } catch (err: any) {
      toast.error(err.message || "Trợ lý AI tạm thời không phản hồi");
    } finally {
      setSendingTutor(false);
    }
  };

  const handleAskAboutObjective = (objectiveText: string) => {
    setActiveTab("tutor");
    handleSendTutorMessage(`Hãy giải thích chi tiết và cho ví dụ về mục tiêu học tập: "${objectiveText}"`);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (quizResult) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson?._id || !quizData) return;
    if (Object.keys(selectedAnswers).length < quizData.questions.length) {
      toast.error("Vui lòng trả lời đầy đủ tất cả câu hỏi trước khi nộp bài!");
      return;
    }

    setSubmittingQuiz(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await courseApi.submitKnowledgeCheckAttempt(currentLesson._id, formattedAnswers);
      if (res.success && res.data?.data) {
        const result: KnowledgeCheckAttemptResult = (res.data as any).data;
        setQuizResult(result);
        if (result.passed) {
          toast.success(`🎉 Chúc mừng! Bạn đã đạt ${result.score}% điểm kiểm tra!`);
        } else {
          toast.info(`Bạn đạt ${result.score}%. Hãy xem lại giải thích hoặc hỏi Trợ lý AI nhé!`);
        }
        // Refresh mastery after quiz attempt
        if (currentLesson?._id) loadMastery(currentLesson._id);
      } else {
        throw new Error(res.message || "Failed to submit attempt");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể nộp bài kiểm tra");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  // Video Chapter Seek Handling
  const handleSeekChapter = (seconds: number) => {
    if (streamRef.current) {
      try {
        if (typeof streamRef.current.currentTime === "number") {
          streamRef.current.currentTime = seconds;
        } else if (streamRef.current.seek) {
          streamRef.current.seek(seconds);
        }
      } catch (e) {
        console.log("Seek error:", e);
      }
    }
    toast.info(`Đang chuyển tới ${Math.floor(seconds / 60)}:${(Math.floor(seconds % 60)).toString().padStart(2, "0")}`);
  };

  const videoChapters =
    currentLesson?.suggestedVideoChapters || currentLesson?.suggestedChapters || [];

  const getActiveChapterIndex = () => {
    if (videoChapters.length === 0) return -1;
    let active = 0;
    for (let i = 0; i < videoChapters.length; i++) {
      if (currentTime >= videoChapters[i].seconds) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  };

  const activeChapterIndex = getActiveChapterIndex();

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!course?._id || !isEnrolled) return;
    try {
      const res = await courseApi.completeLesson(course._id, lessonId);
      if (res.success) {
        const data = (res.data as any)?.data;
        setCompletedLessons(data?.completedLessons || []);
        setProgress(data?.progress || 0);
        // Refresh mastery
        loadMastery(lessonId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const goToLesson = (lesson: Lesson) => {
    if (!isEnrolled && !lesson.isFreePreview) {
      toast.error("Vui lòng đăng ký khóa học để học bài này");
      return;
    }
    router.push(`/courses/${slug}/learn/${lesson.slug}`);
  };

  const goToNext = () => {
    if (nextLesson) goToLesson(nextLesson);
  };

  const goToPrev = () => {
    if (prevLesson) goToLesson(prevLesson);
  };

  const getMasteryBadge = (level: MasteryLevel) => {
    switch (level) {
      case "mastered":
        return { label: "Làm chủ", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: "🌟" };
      case "proficient":
        return { label: "Thành thạo", color: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30", icon: "🟢" };
      case "developing":
        return { label: "Đang phát triển", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: "🟡" };
      case "introduced":
        return { label: "Đã tiếp cận", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: "🔵" };
      default:
        return { label: "Chưa bắt đầu", color: "bg-muted text-muted-foreground border-border", icon: "⚪" };
    }
  };

  if (!course || !currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Đang tải bài học...
      </div>
    );
  }

  const isLocked = !isEnrolled && !currentLesson.isFreePreview;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/courses/${slug}`)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Khóa học</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Bar */}
          {isEnrolled && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {progress}%
              </span>
            </div>
          )}

          {/* Quick AI Tutor Trigger */}
          <button
            type="button"
            onClick={() => setActiveTab("tutor")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Trợ lý AI</span>
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Nội dung khóa học"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto bg-background flex flex-col">
          {/* Player Container */}
          <div className="w-full bg-black aspect-video flex-shrink-0 relative overflow-hidden">
            {isLocked ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
                <Lock size={48} className="text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Bài học này bị khóa</h2>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Đăng ký khóa học ngay hôm nay để truy cập toàn bộ video và tài liệu bài giảng.
                </p>
                <button
                  onClick={() => router.push(`/checkout?courseId=${course._id}`)}
                  className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg cursor-pointer"
                >
                  Đăng ký khóa học
                </button>
              </div>
            ) : (
              <>
                {currentLesson.type === "video" &&
                  (currentLesson.media?.url || currentLesson.media?.cloudflareId) && (
                    <div className="absolute inset-0 [&>iframe]:!w-full [&>iframe]:!h-full">
                      <Stream
                        src={currentLesson.media?.cloudflareId || currentLesson.media?.url || ""}
                        controls
                        autoplay
                        width="100%"
                        height="100%"
                        streamRef={streamRef}
                        onTimeUpdate={(e: any) => {
                          if (e?.target?.currentTime) {
                            setCurrentTime(e.target.currentTime);
                          }
                        }}
                        onEnded={() => {
                          handleLessonComplete(currentLesson._id);
                          goToNext();
                        }}
                      />
                    </div>
                  )}
                {currentLesson.type === "text" && (
                  <div className="w-full h-full bg-background p-12 overflow-auto">
                    <h2 className="text-3xl font-bold mb-6">{currentLesson.title}</h2>
                    <div
                      className="prose max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  </div>
                )}
                {currentLesson.type === "file" && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-background text-white p-8">
                    <FileText size={64} className="text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                    <p className="text-muted-foreground mb-6">
                      Tài liệu đính kèm:{" "}
                      {currentLesson.media?.url?.split("/").pop() || "Tài liệu"}
                    </p>
                    <a
                      href={currentLesson.media?.url}
                      download
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg font-bold"
                    >
                      <Download size={20} /> Tải xuống tài liệu
                    </a>
                  </div>
                )}
              </>
            )}

            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute right-0 top-6 bg-background/80 backdrop-blur-md text-foreground p-2 rounded-l-md hover:bg-background transition-all z-20 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
            )}
          </div>

          {/* Interactive Pacing Timeline Bar (Chapters) */}
          {videoChapters.length > 0 && (
            <div className="bg-card/90 border-b border-border px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-muted-foreground flex items-center gap-1 flex-shrink-0">
                <Clock size={13} /> Chapters:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {videoChapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSeekChapter(ch.seconds)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                      activeChapterIndex === idx
                        ? "bg-primary text-primary-foreground shadow-sm scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{ch.timestamp}</span>
                    <span className="truncate max-w-[140px]">{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="p-6 max-w-5xl mx-auto w-full flex-1">
            <div className="flex border-b border-border mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-5 py-3 font-bold text-sm transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === "overview"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Tổng quan
              </button>
              {videoChapters.length > 0 && (
                <button
                  onClick={() => setActiveTab("chapters")}
                  className={`px-5 py-3 font-bold text-sm transition-colors cursor-pointer border-b-2 flex-shrink-0 flex items-center gap-1.5 ${
                    activeTab === "chapters"
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock size={14} />
                  Mục lục Video ({videoChapters.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-5 py-3 font-bold text-sm transition-colors cursor-pointer border-b-2 flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === "quiz"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <HelpCircle size={14} />
                Kiểm tra kiến thức {quizData ? `(${quizData.questions.length})` : ""}
              </button>
              <button
                onClick={() => setActiveTab("mastery")}
                className={`px-5 py-3 font-bold text-sm transition-colors cursor-pointer border-b-2 flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === "mastery"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target size={14} className="text-emerald-500" />
                Tiến độ Năng lực {lessonMastery ? `(${lessonMastery.overallScore}%)` : ""}
              </button>
              <button
                onClick={() => setActiveTab("tutor")}
                className={`px-5 py-3 font-bold text-sm transition-colors cursor-pointer border-b-2 flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === "tutor"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles size={14} className="text-indigo-500" />
                Trợ lý AI Learning
              </button>
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-3">{currentLesson.title}</h1>
                  <div className="text-foreground/80 leading-relaxed text-sm max-w-3xl">
                    {currentLesson.summary || currentLesson.description || "Không có mô tả cho bài học này."}
                  </div>
                </div>

                {/* Learning Objectives */}
                {currentLesson.learningObjectives && currentLesson.learningObjectives.length > 0 && (
                  <div className="bg-muted/40 border border-border rounded-xl p-5 max-w-3xl">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">
                        🎯
                      </span>
                      Mục tiêu bài học
                    </h3>
                    <ul className="space-y-2">
                      {currentLesson.learningObjectives.map((obj: string, i: number) => (
                        <li key={i} className="text-xs text-foreground/90 flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Takeaways */}
                {currentLesson.keyPoints && currentLesson.keyPoints.length > 0 && (
                  <div className="bg-muted/40 border border-border rounded-xl p-5 max-w-3xl">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs">
                        💡
                      </span>
                      Điểm trọng tâm cần ghi nhớ
                    </h3>
                    <ul className="space-y-2">
                      {currentLesson.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="text-xs text-foreground/90 flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concepts & Keywords */}
                {((currentLesson.concepts && currentLesson.concepts.length > 0) ||
                  (currentLesson.keywords && currentLesson.keywords.length > 0)) && (
                  <div className="max-w-3xl pt-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Khái niệm & Từ khóa
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentLesson.concepts?.map((concept: string, i: number) => (
                        <span
                          key={`c-${i}`}
                          className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium border border-indigo-200 dark:border-indigo-800"
                        >
                          {concept}
                        </span>
                      ))}
                      {currentLesson.keywords?.map((kw: string, i: number) => (
                        <span
                          key={`k-${i}`}
                          className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Video Chapters ── */}
            {activeTab === "chapters" && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-sm font-bold text-foreground">
                  Mục lục phân đoạn bài giảng:
                </h3>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {videoChapters.map((ch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSeekChapter(ch.seconds)}
                      className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        activeChapterIndex === idx
                          ? "bg-primary/10 text-primary font-bold"
                          : "bg-card/40 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-primary/10 text-primary font-bold">
                          {ch.timestamp}
                        </span>
                        <div>
                          <p className="text-xs text-foreground font-semibold">{ch.title}</p>
                          {ch.summary && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{ch.summary}</p>
                          )}
                        </div>
                      </div>
                      <Play size={14} className="text-muted-foreground opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Knowledge Check ── */}
            {activeTab === "quiz" && (
              <div className="max-w-3xl space-y-6">
                {loadingQuiz ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Đang tải bài kiểm tra kiến thức…
                  </div>
                ) : !quizData ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl">
                    <HelpCircle size={32} className="mx-auto text-muted-foreground mb-2 opacity-60" />
                    <p className="text-xs text-muted-foreground">
                      Bài học này chưa có câu hỏi kiểm tra kiến thức được phê duyệt.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Quiz Result Banner */}
                    {quizResult && (
                      <div
                        className={`p-5 rounded-xl border flex items-center justify-between gap-4 ${
                          quizResult.passed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Award size={28} className={quizResult.passed ? "text-emerald-600" : "text-amber-600"} />
                          <div>
                            <h4 className="text-sm font-bold">
                              {quizResult.passed ? "Đạt yêu cầu xuất sắc!" : "Chưa đạt điểm tối đa"}
                            </h4>
                            <p className="text-xs opacity-90">
                              Kết quả: <strong>{quizResult.correctCount} / {quizResult.totalQuestions}</strong> câu đúng ({quizResult.score}%)
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRetryQuiz}
                          className="px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                        >
                          <RotateCw size={12} />
                          Làm lại
                        </button>
                      </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-5">
                      {quizData.questions.map((q, qIdx) => {
                        const resultForQ = quizResult?.results.find((r) => r.questionId === q.id);
                        return (
                          <div
                            key={q.id}
                            className={`p-5 rounded-xl border transition-all ${
                              resultForQ
                                ? resultForQ.isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/30"
                                  : "bg-red-500/5 border-red-500/30"
                                : "bg-card border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                                Câu {qIdx + 1}
                              </span>
                              {resultForQ && (
                                <span
                                  className={`text-xs font-bold flex items-center gap-1 ${
                                    resultForQ.isCorrect ? "text-emerald-600" : "text-red-500"
                                  }`}
                                >
                                  {resultForQ.isCorrect ? (
                                    <>
                                      <Check size={14} /> Chính xác
                                    </>
                                  ) : (
                                    <>
                                      <X size={14} /> Chưa đúng
                                    </>
                                  )}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-bold text-foreground mb-4 leading-snug">
                              {q.question}
                            </p>

                            {/* Options */}
                            <div className="space-y-2">
                              {q.options.map((opt) => {
                                const isSelected = selectedAnswers[q.id] === opt.id;
                                const isCorrectAnswer = resultForQ?.correctOptionId === opt.id;

                                return (
                                  <label
                                    key={opt.id}
                                    onClick={() => handleSelectOption(q.id, opt.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                      resultForQ
                                        ? isCorrectAnswer
                                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold"
                                          : isSelected
                                          ? "bg-red-500/15 border-red-500 text-red-950 dark:text-red-200"
                                          : "bg-background/40 border-border text-muted-foreground opacity-60"
                                        : isSelected
                                        ? "bg-primary/10 border-primary text-foreground font-semibold"
                                        : "bg-background/60 border-border text-foreground hover:bg-muted/60"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`quiz_q_${q.id}`}
                                      checked={isSelected}
                                      onChange={() => handleSelectOption(q.id, opt.id)}
                                      disabled={Boolean(quizResult)}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="flex-1">{opt.text}</span>
                                  </label>
                                );
                              })}
                            </div>

                            {/* Explanation (shown after submission) */}
                            {resultForQ && (
                              <div className="mt-4 pt-3 border-t border-border/80 text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg">
                                <span className="font-bold text-primary block mb-1">
                                  💡 Giải thích chi tiết:
                                </span>
                                {resultForQ.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!quizResult && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={submittingQuiz || Object.keys(selectedAnswers).length === 0}
                          className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {submittingQuiz ? "Đang chấm bài…" : "Nộp bài kiểm tra"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Learning Mastery Engine ── */}
            {activeTab === "mastery" && (
              <div className="max-w-3xl space-y-6">
                {loadingMastery ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" />
                    Đang tính toán ma trận năng lực bài học…
                  </div>
                ) : !lessonMastery ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl">
                    <Target size={32} className="mx-auto text-muted-foreground mb-2 opacity-60" />
                    <p className="text-xs text-muted-foreground">
                      Chưa có dữ liệu năng lực được ghi nhận cho bài học này.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Mastery Card */}
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-base font-bold text-foreground">
                            Độ Thấu Hiểu Bài Học
                          </h3>
                          {(() => {
                            const badge = getMasteryBadge(lessonMastery.overallLevel);
                            return (
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                                {badge.icon} {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground max-w-md">
                          Mô hình đánh giá năng lực dựa trên bằng chứng hoàn thành video, kết quả kiểm tra trắc nghiệm và thảo luận cùng Trợ lý AI.
                        </p>
                      </div>

                      {/* Circular-style Progress Score */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-3xl font-extrabold text-foreground tracking-tight">
                            {lessonMastery.overallScore}%
                          </span>
                          <span className="text-[11px] block text-muted-foreground font-semibold">
                            {lessonMastery.totalObjectives} Mục tiêu
                          </span>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                          <TrendingUp size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Objectives Breakdown List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Chi tiết từng mục tiêu năng lực
                      </h4>

                      {lessonMastery.objectives.map((obj, idx) => {
                        const badge = getMasteryBadge(obj.level);
                        return (
                          <div
                            key={idx}
                            className="p-5 bg-card border border-border rounded-2xl space-y-4 shadow-sm hover:border-border/80 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-muted text-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h5 className="text-xs font-bold text-foreground leading-snug">
                                    {obj.objective}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                      {badge.icon} {badge.label}
                                    </span>
                                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                                      Điểm năng lực: {obj.score}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAskAboutObjective(obj.objective)}
                                className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 border border-primary/20"
                                title="Hỏi Trợ lý AI về mục tiêu này"
                              >
                                <Sparkles size={12} />
                                <span>Củng cố</span>
                              </button>
                            </div>

                            {/* Score Meter */}
                            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  obj.score >= 90
                                    ? "bg-emerald-500"
                                    : obj.score >= 75
                                    ? "bg-indigo-500"
                                    : obj.score >= 50
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.max(5, obj.score)}%` }}
                              />
                            </div>

                            {/* Explainability Bullets */}
                            {obj.explanation && obj.explanation.length > 0 && (
                              <div className="bg-muted/30 border border-border/60 rounded-xl p-3 space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                  Bằng chứng học tập:
                                </span>
                                {obj.explanation.map((exp, eIdx) => (
                                  <p key={eIdx} className="text-[11px] text-foreground/80 leading-relaxed">
                                    {exp}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: AI Learning Companion (Tutor) ── */}
            {activeTab === "tutor" && (
              <div className="max-w-3xl flex flex-col h-[600px] border border-border bg-card rounded-2xl overflow-hidden shadow-lg">
                {/* Tutor Header */}
                <div className="p-4 border-b border-border bg-card/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        Trợ lý Học tập Thông minh OpenIdear
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Được neo trực tiếp vào học liệu bài học & ma trận năng lực
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Grounded AI
                  </span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                  {loadingTutor ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      <Loader2 size={24} className="animate-spin text-primary mr-2" /> Đang tải lịch sử trợ lý...
                    </div>
                  ) : tutorMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <Bot size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">
                        Chào bạn! Tôi có thể giúp gì cho bài học này?
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mb-5">
                        Đặt bất kỳ câu hỏi nào về khái niệm, ví dụ hoặc giải thích nội dung trong video.
                      </p>

                      {/* Quick Prompts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                        <button
                          type="button"
                          onClick={() => handleSendTutorMessage("Giải thích đơn giản hơn nội dung cốt lõi của bài học này")}
                          className="p-2.5 text-left text-xs bg-card hover:bg-card/80 border border-border rounded-xl transition-all font-medium text-foreground hover:border-primary/50 cursor-pointer shadow-sm flex items-center gap-2"
                        >
                          <span>💡</span>
                          <span className="truncate">Giải thích đơn giản hơn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendTutorMessage("Cho tôi một ví dụ thực tế liên quan đến bài học này")}
                          className="p-2.5 text-left text-xs bg-card hover:bg-card/80 border border-border rounded-xl transition-all font-medium text-foreground hover:border-primary/50 cursor-pointer shadow-sm flex items-center gap-2"
                        >
                          <span>🔍</span>
                          <span className="truncate">Cho ví dụ thực tế</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendTutorMessage(`Giải thích nội dung đoạn video tôi đang xem tại phút ${Math.floor(currentTime / 60)}:${(Math.floor(currentTime % 60)).toString().padStart(2, "0")}`, true)}
                          className="p-2.5 text-left text-xs bg-card hover:bg-card/80 border border-border rounded-xl transition-all font-medium text-foreground hover:border-primary/50 cursor-pointer shadow-sm flex items-center gap-2"
                        >
                          <span>⏱️</span>
                          <span className="truncate">Giải thích đoạn video vừa xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendTutorMessage("Các điểm lưu ý và lỗi phổ biến khi thực hành bài này là gì?")}
                          className="p-2.5 text-left text-xs bg-card hover:bg-card/80 border border-border rounded-xl transition-all font-medium text-foreground hover:border-primary/50 cursor-pointer shadow-sm flex items-center gap-2"
                        >
                          <span>🎯</span>
                          <span className="truncate">Các lỗi phổ biến cần tránh</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    tutorMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={14} />
                          </div>
                        )}

                        <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                                : `bg-card border ${
                                    msg.grounded === false
                                      ? "border-amber-500/40 text-foreground"
                                      : "border-border text-foreground"
                                  } rounded-tl-none shadow-sm`
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          {/* Grounding References */}
                          {msg.references && msg.references.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.references.map((ref, rIdx) => (
                                <button
                                  key={rIdx}
                                  type="button"
                                  onClick={() => {
                                    if (typeof ref.timestampSeconds === "number") {
                                      handleSeekChapter(ref.timestampSeconds);
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    typeof ref.timestampSeconds === "number"
                                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                      : "bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  {typeof ref.timestampSeconds === "number" && <Play size={9} />}
                                  {ref.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Suggested Follow-Ups */}
                          {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.suggestedFollowUps.map((fUp, fIdx) => (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleSendTutorMessage(fUp)}
                                  className="text-[11px] text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-lg border border-border transition-colors cursor-pointer text-left"
                                >
                                  ↳ {fUp}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {msg.role === "user" && (
                          <div className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                            <UserIcon size={14} />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {sendingTutor && (
                    <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="animate-spin" />
                      </div>
                      <div className="p-3 bg-card border border-border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin text-primary" />
                        <span>Trợ lý đang suy nghĩ và tra cứu học liệu…</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendTutorMessage();
                  }}
                  className="p-3 border-t border-border bg-card flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Hỏi trợ lý về bài học này…"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    disabled={sendingTutor}
                    className="flex-1 bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={sendingTutor || !tutorInput.trim()}
                    className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer flex-shrink-0 shadow"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Fixed Footer Navigation */}
          <footer className="bg-background border-t p-3 flex items-center justify-between shadow-sm sticky bottom-0">
            <button
              onClick={goToPrev}
              disabled={!prevLesson}
              className={`flex items-center gap-1 font-bold px-4 py-2 border rounded-xl hover:bg-muted transition-colors cursor-pointer ${
                !prevLesson
                  ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
                  : "border-border text-foreground"
              }`}
            >
              <ChevronLeft size={18} /> Bài trước
            </button>
            <button
              onClick={goToNext}
              disabled={!nextLesson}
              className={`flex items-center gap-1 font-bold px-6 py-2 rounded-xl transition-colors cursor-pointer ${
                !nextLesson
                  ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              }`}
            >
              Bài tiếp theo <ChevronRight size={18} />
            </button>
          </footer>
        </main>
      </div>

      {/* Curriculum Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-[360px]" : "w-0"
        } border-l flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden bg-background shadow-xl z-20`}
      >
        <div className="p-4 border-b flex items-center justify-between text-foreground flex-shrink-0">
          <span className="font-bold text-base">Nội dung khóa học</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.chapters?.map((chapter, chapterIdx) => {
            const chapterCompletedCount =
              chapter.lessons?.filter((l) => completedLessons.includes(l._id))
                .length || 0;

            return (
              <div key={chapter._id} className="border-b border-border">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter._id)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted transition-colors text-left cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-xs">
                      Phần {chapterIdx + 1}: {chapter.title}
                    </h3>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {chapterCompletedCount} / {chapter.lessons?.length || 0} bài học
                    </div>
                  </div>
                  {expandedChapters.includes(chapter._id) ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </button>

                {/* Lessons in Chapter */}
                {expandedChapters.includes(chapter._id) && (
                  <div className="divide-y divide-border/40">
                    {chapter.lessons?.map((lesson) => {
                      const isCurrent = lesson._id === currentLesson._id;
                      const isCompleted = completedLessons.includes(lesson._id);
                      const isLessonLocked = !isEnrolled && !lesson.isFreePreview;

                      return (
                        <button
                          key={lesson._id}
                          onClick={() => goToLesson(lesson)}
                          className={`w-full flex items-center gap-3 p-3.5 text-left text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle size={15} className="text-emerald-500" />
                            ) : isLessonLocked ? (
                              <Lock size={14} className="text-muted-foreground" />
                            ) : (
                              <Play size={14} className={isCurrent ? "text-primary" : "text-muted-foreground"} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="truncate">{lesson.title}</p>
                          </div>

                          {lesson.isFreePreview && !isEnrolled && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                              Học thử
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
