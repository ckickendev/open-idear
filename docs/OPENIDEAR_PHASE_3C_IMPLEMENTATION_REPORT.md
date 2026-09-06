# OPENIDEAR — PHASE 3C: LEARNING MASTERY ENGINE IMPLEMENTATION REPORT

## 1. Executive Summary

Phase 3C completes the pedagogical intelligence loop for OpenIdear by introducing the **Learning Mastery Engine**. 

* **The Educational Evolution**:
  - Phase 2 & 2.5: AI understands creator lesson content.
  - Phase 3A: AI generates grounded assessments (Knowledge Checks) & chapters.
  - Phase 3B: AI acts as an interactive learning companion (Grounded Tutor).
  - **Phase 3C**: OpenIdear measures and understands what the learner actually understands at the granular **Learning Objective** level.
* **Deterministic & Explainable**: Mastery is computed from discrete `LearningEvidence` signals (quiz attempts, video progress, tutor discussions) rather than an unexplainable black-box score.
* **Mastery → Tutor Feedback Loop**: The AI Tutor incorporates current objective mastery levels into its prompt context, offering targeted explanations for developing concepts.
* **Readiness Decision**: **`READY_FOR_PHASE_4`** (All 17 automated unit tests passed, Next.js build compiled with 0 errors).

---

## 2. Repository Audit

Prior to implementation, the codebase was audited:
* `LessonIntelligence` provides canonical Bloom-aligned `learningObjectives[]`.
* `KnowledgeCheckAttempt` records question-level submission results.
* `TutorService` manages conversational learning history.
* `Enrollment` tracks lesson access and overall linear completion percentage.

---

## 3. Existing Architecture Reuse

* Reused `Enrollment` access control guards in `MasteryService`.
* Reused `COURSE_INTELLIGENCE_PROMPTS` and `providerRegistry` for AI Tutor context injection.
* Embedded mastery directly into the existing `WatchPage` layout without introducing separate frameworks.

---

## 4. Phase 3B Hardening Findings

* **Tutor Grounding Verification**: Confirmed that tutor references validate `timestampSeconds` and map to real transcript intervals.
* **Answer Key Isolation**: Verified that neither `correctOptionId` nor unsubmitted assessment data are ever sent into tutor context prompts.
* **IDOR & Session Integrity**: Verified that `tutor_sessions` and `learning_evidences` enforce `user === req.userInfo._id`.

---

## 5. Learning Evidence Architecture

Model: `models/learningEvidence.schema.js` (collection `learning_evidences`).

```typescript
interface LearningEvidence {
  _id: ObjectId;
  user: ObjectId;
  course: ObjectId;
  lesson: ObjectId;
  objective: string;
  type: "knowledge_check" | "tutor_interaction" | "lesson_completion" | "video_progress" | "re_attempt";
  signal: "positive" | "negative" | "neutral";
  strength: number; // 0.1 to 1.0
  sourceId?: ObjectId;
  metadata?: {
    score?: number;
    questionId?: string;
    attemptId?: ObjectId;
    tutorMessageId?: ObjectId;
    timestampSeconds?: number;
  };
  createdAt: Date;
}
```

---

## 6. Objective Mastery Architecture

Model: `models/objectiveMastery.schema.js` (collection `objective_masteries`).

```typescript
interface ObjectiveMastery {
  _id: ObjectId;
  user: ObjectId;
  course: ObjectId;
  lesson: ObjectId;
  objective: string;
  score: number; // 0 - 100
  level: "unknown" | "introduced" | "developing" | "proficient" | "mastered";
  evidenceCount: number;
  positiveEvidenceCount: number;
  negativeEvidenceCount: number;
  correctAttempts: number;
  incorrectAttempts: number;
  explanation: string[];
  lastEvidenceAt: Date;
}
```

---

## 7. Mastery Formula

Deterministic scoring algorithm:
$$\text{Score} = \text{clamp}\left(0, 100, \sum_{\text{ev}} \Delta(\text{ev})\right)$$

Where:
* **Lesson completion / video watched**: $+20 \times \text{strength}$ pts.
* **Positive Knowledge Check answer**: $+35 \times \text{strength}$ pts.
* **Negative Knowledge Check answer**: $-25 \times \text{strength}$ pts (min 0).
* **Positive Tutor reinforcement**: $+15 \times \text{strength}$ pts.

### Level Thresholds:
* $0 - 19$: `unknown` (Chưa bắt đầu)
* $20 - 49$: `introduced` (Đã tiếp cận)
* $50 - 74$: `developing` (Đang phát triển)
* $75 - 89$: `proficient` (Thành thạo)
* $90 - 100$: `mastered` (Làm chủ — **Requires $\ge 2$ positive signals**).

---

## 8. Knowledge Check Integration

* In `knowledgeCheckService.submitAttempt`, when a learner answers questions:
  - Each question mapped to an `objectiveReference` emits a `LearningEvidence` record.
  - Automatically triggers `masteryService.recalculateObjectiveMastery`.

---

## 9. Tutor Integration

* `buildTutorContext` queries `ObjectiveMastery` for the learner on the current lesson and appends:
  `"Năng lực hiện tại của người học: [Server Components: developing], [Client Hydration: proficient]"`
* Enables the AI Tutor to adapt pedagogical explanations specifically for developing objectives.

---

## 10. Lesson Mastery Aggregation

$$\text{Lesson Score} = \frac{1}{N} \sum_{i=1}^{N} \text{ObjectiveMastery}_i.\text{score}$$
$$\text{Lesson Level} = \text{computeLevel}(\text{Lesson Score}, \text{totalPositiveSignals})$$

---

## 11. Course Mastery Aggregation

$$\text{Course Score} = \frac{1}{M} \sum_{j=1}^{M} \text{ObjectiveMastery}_j.\text{score} \quad (\text{across all course objectives})$$

---

## 12. API Changes

| Method | Route | Access | Purpose |
| ------ | ----- | ------ | ------- |
| `GET` | `/learning/mastery/lesson/:lessonId` | Learner (`Auth`) | Retrieve objective-level mastery details with explanations |
| `GET` | `/learning/mastery/course/:courseId` | Learner (`Auth`) | Retrieve aggregated course mastery stats |
| `GET` | `/learning/evidence/lesson/:lessonId` | Learner (`Auth`) | Retrieve recent learning evidence signals |

---

## 13. Frontend Changes

* Added interfaces (`MasteryLevel`, `ObjectiveMastery`, `LessonMastery`, `CourseMastery`) in [course.types.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/series/types/course.types.ts).
* Added client methods in [course.api.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/series/api/course.api.ts).
* Enhanced [/learn/[lessonSlug]/page.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(marketing)/courses/[slug]/learn/[lessonSlug]/page.tsx) with:
  - **"Tiến độ Năng lực (Mastery)"** tab.
  - Circular/percentage gauge of lesson mastery.
  - Objective cards with score bars, level badges, and explainability bullet points.
  - 1-click **"Củng cố"** button that opens AI Tutor asking for targeted guidance on that objective.

---

## 14. Database Changes

1. **`models/learningEvidence.schema.js`** [NEW]: Collection `learning_evidences` with compound indexes on `{ user: 1, lesson: 1, createdAt: -1 }` and `{ user: 1, course: 1, objective: 1 }`.
2. **`models/objectiveMastery.schema.js`** [NEW]: Collection `objective_masteries` with unique index on `{ user: 1, lesson: 1, objective: 1 }` and `{ user: 1, course: 1 }`.

---

## 15. Security

* Strict authentication required on all `/learning/*` endpoints.
* IDOR protection: Learners can only query their own mastery records.

---

## 16. Privacy

* Evidence documents record educational outcomes (scores, objective text, timestamps) without storing personal credentials or payment details.

---

## 17. Performance

* Objective mastery is incrementally recalculated upon discrete evidence events rather than re-evaluating the full course graph on every request.

---

## 18. Tests

Created [tests/mastery.test.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/tests/mastery.test.js) covering:
1. Mastery Level Thresholds & Mastered Criteria.
2. Deterministic Evidence Scoring Calculation.
3. Human-Readable Explainability Generation.
4. Lesson & Course Mastery Aggregation.

---

## 19. Verification Results

```text
Backend Unit Tests:
$ node tests/courseIntelligence.hardening.test.js && node tests/knowledgeCheck.test.js && node tests/tutor.test.js && node tests/mastery.test.js
Result: 17/17 Tests Passed (Exit code 0 across all 4 suites)

Frontend TypeScript Check:
$ npx tsc --noEmit --skipLibCheck
Result: Passed (0 errors)

Next.js Production Build:
$ npm run build
Result: Passed (All 31 static and dynamic routes compiled successfully)

Backend Syntax Check:
$ node --check models/*.js services/*.js controllers/*.js index.js
Result: Passed (Exit code 0)
```

---

## 20. Remaining Risks

* For courses with over 100 lessons, course-level aggregation can be cached per learner with TTL in Phase 4.

---

## 21. Future Extension Points

* Instructor analytics dashboard displaying cohort mastery bottlenecks.
* Adaptive review recommendations based on developing objectives.

---

## 22. Final Readiness Decision

### **FINAL DECISION: `READY_FOR_PHASE_4`**

OpenIdear's AI Course Platform now possesses an end-to-end grounded educational intelligence pipeline: Creator Content $\rightarrow$ AI Intelligence $\rightarrow$ Interactive Chapters $\rightarrow$ AI Knowledge Checks $\rightarrow$ Grounded AI Tutor $\rightarrow$ Learning Mastery Engine.
