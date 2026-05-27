import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";

/**
 * Composed provider tree for the entire application.
 * Mounted once in the root layout.
 *
 * Order matters:
 * 1. ThemeProvider — must wrap everything for CSS variable resolution
 * 2. Toaster — global toast notifications (replaces AlertStore + Toast + Notification)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "font-sans",
        }}
      />
    </ThemeProvider>
  );
}
