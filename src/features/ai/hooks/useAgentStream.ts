/**
 * src/features/ai/hooks/useAgentStream.ts
 *
 * Responsibility:
 *   The core streaming hook — the single place that reads SSE events from
 *   the backend and translates them into aiStore updates.
 *
 *   API:
 *   const { start, cancel } = useAgentStream()
 *   start(url, body, feature) → void
 *     Opens an SSE connection, parses each AgentChunk event, and calls
 *     the appropriate aiStore action (appendChunk, completeRun, failRun).
 *
 *   cancel() → void
 *     Closes the SSE connection and calls aiStore.reset().
 *
 * Why it exists:
 *   Every AI feature that streams (improve, write, article generation, chat)
 *   needs the same SSE read loop, error handling, and abort mechanism.
 *   Defining it once here means feature-specific hooks (useAIImprove,
 *   useAIPlanner) are thin wrappers that only supply the URL and input.
 */
