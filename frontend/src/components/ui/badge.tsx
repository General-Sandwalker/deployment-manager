import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive" | "outline" | "premium";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-[var(--cosmic-accent)] hover:bg-[var(--cosmic-accent)]/80 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    destructive: "bg-red-500 hover:bg-red-600 text-white",
    outline: "text-[var(--text-primary)] border border-[var(--cosmic-accent)]",
    premium: "bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)] text-white",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }