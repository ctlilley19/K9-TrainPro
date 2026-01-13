'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glow';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-md',
  secondary:
    'bg-surface-700 text-white hover:bg-surface-600 active:bg-surface-500 border border-surface-600',
  outline:
    'border border-surface-600 text-surface-300 hover:bg-surface-800 hover:text-white hover:border-surface-500',
  ghost:
    'text-surface-400 hover:text-white hover:bg-surface-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success:
    'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
  glow:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-glow-amber hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]',
};

const sizeStyles: Record<string, string> = {
  xs: 'h-7 px-2 text-xs rounded',
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-surface-900',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
