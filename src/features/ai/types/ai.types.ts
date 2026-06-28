/**
 * src/features/ai/types/ai.types.ts
 *
 * Responsibility:
 *   All shared TypeScript types for the frontend AI feature.
 *
 *   AgentRequest    — generic input shape for starting any agent
 *   AgentChunk      — mirrors the backend AgentChunk — wire format from SSE:
 *                     { type, step, data?, text?, usage?, error? }
 *   PipelineEvent   — wraps AgentChunk with stage metadata (from SSE stream)
 *   AgentRunStatus  — "idle" | "running" | "done" | "error"
 *   ChatMessage     — { role, content, timestamp }
 *   AIFeature       — union of all feature names: "improve" | "plan" | "write" | ...
 *
 * Why it exists:
 *   Hooks, components, and the store all reference these types.
 *   Centralizing them prevents type drift between the SSE parser in the
 *   hook and the state shape in the store.
 */
