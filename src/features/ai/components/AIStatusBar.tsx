/**
 * src/features/ai/components/AIStatusBar.tsx
 *
 * Responsibility:
 *   A passive status indicator shown in the editor footer while any
 *   AI feature is running.
 *
 *   Displays:
 *   - Current agent/stage name ("Reviewing your draft…")
 *   - Animated progress indicator (spinner or pulse)
 *   - Token count accumulated so far (for user awareness of cost)
 *   - Cancel button (calls useAgentStream().cancel())
 *
 *   Reads from: aiStore (status, currentStage, tokenUsage, runningFeature)
 *   Writes to: aiStore via cancel action
 *
 * Why it exists:
 *   Agent runs can take 10–60 seconds. Users need feedback that the
 *   system is working and the ability to cancel. A dedicated status bar
 *   is cleaner than embedding run state into the toolbar or editor canvas.
 */
