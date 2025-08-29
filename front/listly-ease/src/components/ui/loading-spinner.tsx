import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      variant: {
        default: "border-primary/20 border-r-transparent",
        gaming: "border-primary/30 border-r-primary animate-lightning-pulse",
        electric: "border-primary/40 border-r-primary animate-waitrush-glow",
      },
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      variant: "gaming",
      size: "md",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const LoadingSpinner = ({
  className,
  variant,
  size,
  label = "Loading...",
  ...props
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <div
        className={cn(spinnerVariants({ variant, size }))}
        role="status"
        aria-label={label}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export { LoadingSpinner, spinnerVariants }