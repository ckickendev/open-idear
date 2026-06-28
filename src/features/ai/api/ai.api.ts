/**
 * src/features/ai/api/ai.api.ts
 *
 * Responsibility:
 *   All HTTP calls to the backend AI endpoints, grouped as a typed client.
 *
 *   Methods:
 *   streamArticle(input)      → EventSource  — article.pipeline SSE
 *   streamImprove(input)      → EventSource  — improve.pipeline SSE
 *   streamWrite(input)        → EventSource  — WriterAgent standalone SSE
 *   runSEO(input)             → Promise      — SEOAgent (JSON, not streamed)
 *   runPlanner(input)         → Promise      — PlannerAgent (JSON)
 *   runReviewer(input)        → Promise      — ReviewerAgent (JSON)
 *   sendChatMessage(input)    → EventSource  — AI Chat SSE
 *
 * Why it exists:
 *   All SSE connection setup, header configuration, and error handling
 *   lives here — never in hooks or components. Hooks call this API client
 *   and translate the raw SSE stream into store updates.
 */
