import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Gradient variants — replacements for ButtonCustom.tsx
        "gradient-primary":
          "text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus-visible:ring-blue-300 dark:focus-visible:ring-blue-800 shadow-xs",
        "gradient-accent":
          "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus-visible:ring-cyan-300 dark:focus-visible:ring-cyan-800 shadow-xs",
        "gradient-success":
          "text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus-visible:ring-green-200 dark:focus-visible:ring-green-800 shadow-xs",
        "gradient-danger":
          "text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus-visible:ring-pink-200 dark:focus-visible:ring-pink-800 shadow-xs",
        "gradient-cta":
          "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800 shadow-xs",
        "gradient-subtle":
          "text-foreground bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 hover:bg-gradient-to-bl focus-visible:ring-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:text-foreground shadow-xs",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
