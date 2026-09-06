/**
 * OpenIdear Course Domain Types v1
 * Canonical type contracts for Course Platform.
 */

export type CourseStatus = "draft" | "published" | "archived";

export type LessonType =
  | "video"
  | "text"
  | "file"
  | "quiz"
  | "assignment"
  | "article";

export interface MediaAsset {
  _id: string;
  url: string;
  type: "image" | "video" | "audio" | "file";
  cloudflareId?: string;
  duration?: number;
  thumbnail?: string;
  status?: "uploaded" | "processing" | "ready" | "failed";
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface LessonTranscript {
  status: "pending" | "processing" | "ready" | "failed";
  language: string;
  text: string;
  segments: TranscriptSegment[];
  provider: string;
  generatedAt: string;
}

export interface SuggestedChapter {
  timestamp: string;
  seconds: number;
  title: string;
  summary?: string;
}

export interface LessonIntelligence {
  _id: string;
  lesson: string;
  course: string;
  sourceMedia?: MediaAsset | string | null;
  sourceMediaVersion?: number;
  sourceMediaFingerprint?: string;
  inputFingerprint?: string;
  version: number;
  status: "queued" | "processing" | "completed" | "failed";
  error?: string | null;
  errorCode?: string | null;
  capabilityStatuses?: {
    transcript?: "pending" | "processing" | "completed" | "failed";
    summary?: "pending" | "processing" | "completed" | "failed";
    keyPoints?: "pending" | "processing" | "completed" | "failed";
    learningObjectives?: "pending" | "processing" | "completed" | "failed";
    concepts?: "pending" | "processing" | "completed" | "failed";
    keywords?: "pending" | "processing" | "completed" | "failed";
    videoChapters?: "pending" | "processing" | "completed" | "failed";
  };
  transcript?: LessonTranscript;
  summary?: {
    short: string;
    detailed: string;
  };
  keyPoints?: string[];
  learningObjectives?: string[];
  concepts?: string[];
  keywords?: string[];
  suggestedVideoChapters?: SuggestedChapter[];
  suggestedChapters?: SuggestedChapter[];
  model?: string;
  promptVersion?: string;
  acceptedAt?: string | null;
  acceptedFields?: string[];
  isStale?: boolean;
  generatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonAIProvenance {
  intelligenceId?: string;
  acceptedVersion?: number;
  acceptedAt?: string | null;
  acceptedBy?: string | null;
  model?: string;
  promptVersion?: string;
  sourceMediaVersion?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  summary?: string;
  learningObjectives?: string[];
  keyPoints?: string[];
  concepts?: string[];
  keywords?: string[];
  suggestedVideoChapters?: SuggestedChapter[];
  suggestedChapters?: SuggestedChapter[];
  aiIntelligence?: LessonAIProvenance | string | null;
  type: LessonType;
  isFreePreview: boolean;
  order: number;
  chapter?: string;
  media?: MediaAsset | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  _id: string;
  title: string;
  order: number;
  course?: string;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeCheckOption {
  id: string;
  text: string;
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: KnowledgeCheckOption[];
  correctOptionId?: string; // Only present in creator view, stripped in learner view
  explanation?: string;     // Only present in creator view or after attempt submission
  objectiveReference?: string;
  cognitiveLevel?: "remember" | "understand" | "apply" | "analyze";
}

export interface KnowledgeCheck {
  _id: string;
  lesson: string;
  course: string;
  version: number;
  status: "draft" | "ready" | "accepted" | "stale" | "failed";
  sourceIntelligenceVersion: number;
  sourceMediaVersion: number;
  questions: KnowledgeCheckQuestion[];
  model?: string;
  promptVersion?: string;
  isStale?: boolean;
  acceptedAt?: string | null;
  acceptedBy?: string | null;
  createdBy?: string | null;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeCheckAttemptResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface TutorReference {
  type: "transcript" | "objective" | "concept" | "summary" | "knowledge_check";
  timestampSeconds?: number | null;
  label: string;
}

export interface TutorMessage {
  _id: string;
  session: string;
  user: string;
  lesson: string;
  role: "user" | "assistant";
  content: string;
  grounded?: boolean;
  confidence?: "high" | "medium" | "low";
  references?: TutorReference[];
  suggestedFollowUps?: string[];
  createdAt: string;
}

export interface TutorSession {
  _id: string;
  user: string;
  course: string;
  lesson: string;
  status: "active" | "closed";
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MasteryLevel = "unknown" | "introduced" | "developing" | "proficient" | "mastered";

export interface ObjectiveMastery {
  _id?: string;
  objective: string;
  score: number;
  level: MasteryLevel;
  evidenceCount: number;
  positiveEvidenceCount: number;
  negativeEvidenceCount: number;
  correctAttempts?: number;
  incorrectAttempts?: number;
  explanation: string[];
  lastEvidenceAt?: string | null;
}

export interface LessonMastery {
  lessonId: string;
  lessonTitle: string;
  overallScore: number;
  overallLevel: MasteryLevel;
  totalObjectives: number;
  objectives: ObjectiveMastery[];
}

export interface CourseMastery {
  courseId: string;
  courseTitle: string;
  courseScore: number;
  courseLevel: MasteryLevel;
  totalObjectives: number;
  masteredCount: number;
  proficientCount: number;
  developingCount: number;
  introducedCount: number;
  lessons: LessonMastery[];
}

export interface InstructorProfile {
  _id?: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: { _id?: string; url: string } | null;
  category?: { _id: string; name: string; slug: string } | null;
  topics?: { _id: string; name: string; slug: string }[];
  instructor: InstructorProfile;
  price: number;
  discountPrice?: number;
  status: CourseStatus;
  studentsCount?: number;
  averageRating?: number;
  ratingCount?: number;
  chapters: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

export type EnrollmentStatus = "active" | "completed" | "refunded" | "archived";

export interface Enrollment {
  _id: string;
  user: string;
  course: Course;
  progress: number;
  completedLessons: string[];
  lastLesson?: string | null;
  lastAccessedAt?: string;
  completedAt?: string | null;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface LessonProgressResponse {
  completedLessons: string[];
  progress: number;
  totalLessons: number;
  completedCount: number;
  status: string;
}
