/**
 * src/features/ai/hooks/useAIPlanner.ts
 *
 * Responsibility:
 *   Feature hook for the article planner feature.
 *
 *   API:
 *   const { plan, isRunning, outline, cancel } = useAIPlanner()
 *   plan({ topic, targetAudience, format }) → void
 *     Calls aiApi.runPlanner() (non-streaming, returns JSON outline),
 *     writes the result to the local state, and makes it available
 *     to AIPlannerView for rendering.
 *
 * Why it exists:
 *   Planning is not streamed — it returns a single structured JSON
 *   document. This hook handles the async fetch + loading state without
 *   needing the SSE machinery of useAgentStream.
 */
