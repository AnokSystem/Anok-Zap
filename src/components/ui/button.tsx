
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-light/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "gradient-primary text-white shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 font-medium",
        secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 font-medium",
        outline: "border border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800/50 hover:border-purple-light/50 shadow-sm",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50 font-medium",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        warning: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
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
