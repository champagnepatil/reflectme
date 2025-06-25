import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  gradient?: string
  glow?: boolean
  pulse?: boolean
  bounce?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    icon,
    rightIcon,
    gradient,
    glow = false,
    pulse = false,
    bounce = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : motion.button
    
    const buttonClasses = cn(
      buttonVariants({ variant, size }),
      gradient && `bg-gradient-to-r ${gradient}`,
      glow && "hover-glow",
      pulse && "animate-pulse",
      bounce && "animate-bounce",
      "relative overflow-hidden group",
      className
    )

    const motionProps = {
      whileHover: { 
        scale: disabled || loading ? 1 : 1.02,
        y: disabled || loading ? 0 : -1
      },
      whileTap: { 
        scale: disabled || loading ? 1 : 0.98,
        y: disabled || loading ? 0 : 0
      },
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      },
      // Shimmer effect on hover
      ...(variant === 'default' && !disabled && !loading && {
        style: {
          background: gradient || undefined
        }
      })
    }

    const content = (
      <>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-current/10 rounded-md"
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        {/* Button content */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0 : 1 }}
          className="flex items-center justify-center gap-2 relative z-10"
        >
          {icon && (
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              {icon}
            </motion.span>
          )}
          
          <span>{loading && loadingText ? loadingText : children}</span>
          
          {rightIcon && (
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              {rightIcon}
            </motion.span>
          )}
        </motion.div>
      </>
    )

    if (asChild) {
      return (
        <Slot
          className={buttonClasses}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <Comp
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
