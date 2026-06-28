/**
 * src/features/ai/hooks/useAIImprove.ts
 *
 * Responsibility:
 *   Feature hook for the inline editor "AI Improve" command.
 *
 *   API:
 *   const { improve, isRunning, result, cancel } = useAIImprove()
 *   improve({ selectedText, instruction, surroundingContext }) → void
 *     Calls aiApi.streamImprove(), delegates SSE reading to useAgentStream,
 *     and exposes result.improvedText when the stream completes.
 *
 * Why it exists:
 *   The editor's AI command bar imports this hook directly. The hook
 *   owns the feature-specific input shape and result extraction, while
 *   useAgentStream owns the generic streaming protocol. Neither knows
 *   about the other's concerns.
 */
