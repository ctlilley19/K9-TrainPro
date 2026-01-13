'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Spinner
// ============================================================================

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'brand' | 'white';
}

const spinnerSizes: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

const spinnerColors: Record<string, string> = {
  default: 'text-surface-400',
  brand: 'text-brand-500',
  white: 'text-white',
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <Loader2
          size={spinnerSizes[size]}
          className={cn('animate-spin', spinnerColors[color])}
        />
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// ============================================================================
// Skeleton
// ============================================================================

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'rectangular',
      width,
      height,
      animation = 'pulse',
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<string, string> = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const animationStyles: Record<string, string> = {
      pulse: 'animate-pulse',
      shimmer: 'animate-shimmer bg-gradient-to-r from-surface-700 via-surface-600 to-surface-700 bg-[length:200%_100%]',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface-700',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={{
          width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
          height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================================================
// Loading Overlay
// ============================================================================

export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, isLoading, message, children, ...props }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-900/80 backdrop-blur-sm rounded-lg z-10">
          <Spinner size="lg" color="brand" />
          {message && (
            <p className="mt-3 text-sm text-surface-300">{message}</p>
          )}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// ============================================================================
// Full Page Loading
// ============================================================================

export interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-950 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-surface-700" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-surface-300 text-sm">{message}</p>
      </div>
    </div>
  );
}
