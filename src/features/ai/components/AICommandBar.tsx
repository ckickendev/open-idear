/**
 * src/features/ai/components/AICommandBar.tsx
 *
 * Responsibility:
 *   The slash-command UI triggered from the Tiptap editor.
 *   Presents available AI actions when the user types "/" or selects text
 *   and clicks the AI button in the editor toolbar.
 *
 *   Actions surfaced:
 *   /improve  → calls useAIImprove with the selected text
 *   /write    → continues the article from cursor position
 *   /plan     → opens AIPlannerView
 *   /seo      → runs SEO analysis on the full draft
 *   /review   → runs ReviewerAgent and shows feedback panel
 *
 * Why it exists:
 *   The command bar is the single entry point for all AI editor actions.
 *   Keeping it as a dedicated component prevents AI logic from leaking
 *   into the Toolbar component or editor extension code.
 */
