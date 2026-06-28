/**
 * src/features/ai/hooks/useAIChat.ts
 *
 * Responsibility:
 *   Hook managing the full lifecycle of an AI Chat session.
 *
 *   API:
 *   const { messages, send, isTyping, clearSession } = useAIChat(postId?)
 *   send(messageText) → void
 *     Appends the user message to messages[], opens SSE to /api/ai/chat,
 *     streams the assistant's response token-by-token into the last
 *     message, then marks it complete when the stream ends.
 *
 *   State:
 *   messages: ChatMessage[]     — full conversation history for display
 *   isTyping: boolean           — true while assistant is streaming
 *   sessionId: string | null    — current session ID (for backend continuity)
 *
 * Why it exists:
 *   Chat is stateful across multiple turns and manages its own message array
 *   locally — it does not use the global aiStore (which is designed for
 *   single-run agents). Chat's state is local to the AIChat component
 *   and managed entirely by this hook.
 */
