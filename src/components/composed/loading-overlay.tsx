"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loadingOverlayVariants = cva(
  "z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      mode: {
        fullscreen: "fixed inset-0 bg-background/80",
        inline: "absolute inset-0 bg-background/70 rounded-[inherit]",
      },
    },
    defaultVariants: {
      mode: "inline",
    },
  }
);

interface LoadingOverlayProps
  extends VariantProps<typeof loadingOverlayVariants> {
  /** Whether the loading overlay is visible */
  isLoading: boolean;
  /** Optional message to display below the spinner */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LoadingOverlay — replaces the old LoadingComponent.
 * Uses CVA for fullscreen vs inline modes.
 * Theme-aware with semantic tokens.
 *
 * @example
 * ```tsx
 * // Fullscreen overlay
 * <LoadingOverlay isLoading={isLoading} mode="fullscreen" />
 *
 * // Inline overlay (within a relative container)
 * <div className="relative">
 *   <LoadingOverlay isLoading={isLoading} />
 *   <TableContent />
 * </div>
 * ```
 */
export function LoadingOverlay({
  isLoading,
  mode,
  message,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(loadingOverlayVariants({ mode }), className)}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className="size-12 rounded-full border-[3px] border-muted border-t-primary animate-spin" />
        {/* Pulse center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="size-4 rounded-full bg-primary/60 animate-pulse blur-[2px]" />
        </div>
        {/* Message */}
        {message && (
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
