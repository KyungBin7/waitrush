import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-button-premium hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-button-premium hover:-translate-y-0.5",
        outline:
          "border border-border bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:shadow-card-premium hover:-translate-y-0.5",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        glass: "glass text-foreground hover:-translate-y-1 hover:shadow-glass active:translate-y-0",
        hero: "bg-gradient-primary text-primary-foreground px-8 py-4 text-lg font-semibold rounded-2xl hover:shadow-xl hover:-translate-y-1 animate-glow",
        waitrush: "btn-waitrush animate-lightning-pulse hover:animate-waitrush-glow active:animate-lightning-strike"
      },
      size: {
        default: "touch-friendly-md px-4 py-2",
        sm: "touch-friendly-sm rounded-lg px-3",
        lg: "touch-friendly-lg rounded-xl px-8 text-base",
        xl: "h-12 sm:h-14 rounded-2xl px-10 text-lg",
        icon: "touch-friendly w-11 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
