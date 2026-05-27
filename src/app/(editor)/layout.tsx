/**
 * Editor layout — minimal chrome for content creation.
 * No Header/Footer. The editor page renders its own EditorHeader.
 * Uses editor-bg token for the background.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-editor-bg">
      {children}
    </div>
  );
}
