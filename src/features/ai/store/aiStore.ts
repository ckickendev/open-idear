/**
 * src/features/ai/store/aiStore.ts
 *
 * Responsibility:
 *   Zustand store managing all cross-component AI state.
 *
 *   State shape:
 *   runningFeature: AIFeature | null    — which AI feature is active
 *   status: AgentRunStatus             — idle / running / done / error
 *   currentStage: string | null        — for pipeline runs: stage name
 *   streamText: string                 — accumulated text chunks so far
 *   result: unknown | null             — final structured output
 *   error: string | null
 *   tokenUsage: TokenUsage | null      — cumulative tokens for the run
 *
 *   Actions:
 *   startRun(feature)                  — set running state, clear previous
 *   appendChunk(chunk: AgentChunk)     — accumulate stream text or set result
 *   completeRun(result)                — transition to done, set final data
 *   failRun(error)                     — transition to error
 *   reset()                            — clear all state
 *
 * Why it exists:
 *   Multiple components need to observe AI run state simultaneously:
 *   AIStatusBar (progress), the editor (stream text insertion), and
 *   AICommandBar (disable state). A Zustand store is the right layer
 *   for shared ephemeral UI state. It does not persist to localStorage.
 */
