"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "ghost" | "link" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--cosmic-highlight)] text-white hover:bg-[var(--cosmic-highlight-dark)]": variant === "default",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "border border-[var(--cosmic-accent)] text-[var(--text-primary)] hover:bg-[var(--cosmic-light)]": variant === "outline",
            "text-[var(--text-primary)] hover:bg-[var(--cosmic-light)] hover:text-[var(--text-primary)]": variant === "ghost",
            "text-[var(--cosmic-highlight)] underline-offset-4 hover:underline": variant === "link",
            "bg-[var(--cosmic-light)] text-[var(--text-primary)] hover:bg-[var(--cosmic-light)]/80": variant === "secondary",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }