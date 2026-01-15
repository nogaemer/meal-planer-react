/**
 * Skeleton loader component for displaying loading placeholders.
 */
import { cn } from "@/lib/utils"

/**
 * Animated skeleton placeholder for loading states.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
