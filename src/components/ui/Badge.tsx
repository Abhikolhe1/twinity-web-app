import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-full)] border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[var(--transition)] focus-visible:border-[var(--color-border-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-glow)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error)]/25 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-accent)] text-[var(--color-accent-text)] [a]:hover:bg-[var(--color-accent-hover)]",
        secondary:
          "bg-[var(--color-surface-2)] text-[var(--color-text)] [a]:hover:bg-[var(--color-surface-3)]",
        destructive:
          "bg-[var(--color-error)]/15 text-[var(--color-error)] focus-visible:ring-[var(--color-error)]/20 [a]:hover:bg-[var(--color-error)]/25",
        outline:
          "border-[var(--color-border)] text-[var(--color-text)] [a]:hover:bg-[var(--color-surface-3)] [a]:hover:text-[var(--color-text-secondary)]",
        ghost:
          "hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-secondary)]",
        link: "text-[var(--color-text-accent)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
