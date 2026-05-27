import { cn } from "@/lib/utils";
import { FileX } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display — defaults to FileX */
  icon?: React.ElementType;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button or link */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState — reusable empty/no-data pattern.
 * Replaces various inline empty state implementations across admin components.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No courses found"
 *   description="Try adjusting your search or create a new course."
 *   action={<Button>Create Course</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
