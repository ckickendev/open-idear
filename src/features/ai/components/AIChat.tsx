/**
 * src/features/ai/components/AIChat.tsx
 *
 * Responsibility:
 *   Floating chat panel that lets authors converse with the AI
 *   in the context of their current article.
 *
 *   Uses: useAIChat(postId) hook
 *   Renders: message history, typing indicator, input field
 *
 *   The panel is post-aware — the backend receives the postId so the
 *   model can reference the article being worked on when answering.
 *
 * Why it exists:
 *   Chat is a self-contained UI feature with its own session state,
 *   message rendering, and input handling. Isolating it from the editor
 *   layout means it can be toggled without affecting the writing canvas.
 */
