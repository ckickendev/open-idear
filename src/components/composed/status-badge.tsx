import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        success:
          "border-success/20 bg-success/10 text-success dark:border-success/30 dark:bg-success/15",
        warning:
          "border-warning/20 bg-warning/10 text-warning dark:border-warning/30 dark:bg-warning/15",
        danger:
          "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15",
        info:
          "border-info/20 bg-info/10 text-info dark:border-info/30 dark:bg-info/15",
        neutral:
          "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Show a colored dot indicator before the text */
  dot?: boolean;
}

/**
 * StatusBadge — semantic status indicator with CVA variants.
 * Replaces the old admin/StatusBadge.tsx with proper theme-aware tokens.
 *
 * @example
 * ```tsx
 * <StatusBadge variant="success" dot>Active</StatusBadge>
 * <StatusBadge variant="danger">Blocked</StatusBadge>
 * <StatusBadge variant="warning">Pending</StatusBadge>
 * ```
 */
export function StatusBadge({
  variant,
  dot = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { statusBadgeVariants };
