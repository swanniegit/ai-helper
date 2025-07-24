'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const mobileButtonVariants = cva(
  // Base styles optimized for mobile touch
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl active:shadow-md",
        destructive: "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl active:shadow-md",
        outline: "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary: "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-sm hover:shadow-md active:shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        floating: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-2xl hover:shadow-xl active:shadow-lg rounded-full border-4 border-white/20",
        gamified: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl active:shadow-md border border-white/20"
      },
      size: {
        default: "h-12 px-6 py-3", // Larger for better touch targets
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base", // Extra large for primary actions
        icon: "h-12 w-12", // Larger icon buttons for mobile
        floating: "h-16 w-16 p-4", // Large floating action buttons
        full: "w-full h-14 px-6 py-4 text-base" // Full-width mobile buttons
      },
      touchSize: {
        default: "min-h-[44px] min-w-[44px]", // iOS minimum touch target
        large: "min-h-[56px] min-w-[56px]", // Material Design recommendation
        small: "min-h-[32px] min-w-[32px]" // For secondary actions
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      touchSize: "default"
    },
  }
);

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
  hapticFeedback?: boolean; // Enable haptic feedback on supported devices
  ripple?: boolean; // Material Design ripple effect
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, touchSize, asChild = false, hapticFeedback = true, ripple = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for supported devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10); // Short vibration
      }
      
      // Call original onClick
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size, touchSize, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
MobileButton.displayName = "MobileButton";

// Specialized mobile button components
export const FloatingActionButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, children, ...props }, ref) => (
    <MobileButton
      ref={ref}
      variant="floating"
      size="floating"
      touchSize="large"
      className={cn("fixed bottom-6 right-6 z-40 animate-bounceIn", className)}
      {...props}
    >
      {children}
    </MobileButton>
  )
);
FloatingActionButton.displayName = "FloatingActionButton";

export const MobileActionButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, ...props }, ref) => (
    <MobileButton
      ref={ref}
      size="full"
      touchSize="large"
      className={cn("", className)}
      {...props}
    />
  )
);
MobileActionButton.displayName = "MobileActionButton";

export const MobileIconButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, ...props }, ref) => (
    <MobileButton
      ref={ref}
      variant="ghost"
      size="icon"
      touchSize="default"
      className={cn("", className)}
      {...props}
    />
  )
);
MobileIconButton.displayName = "MobileIconButton";

export { mobileButtonVariants };