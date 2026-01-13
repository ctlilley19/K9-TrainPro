'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { BadgeTier } from '@/types/database';

// ============================================================================
// Status Badge (for general status indicators)
// ============================================================================

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

const statusVariants: Record<string, string> = {
  default: 'bg-surface-700 text-surface-300',
  success: 'bg-green-500/15 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
};

const statusSizes: Record<string, string> = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

const dotColors: Record<string, string> = {
  default: 'bg-surface-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant = 'default', size = 'sm', dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
          statusVariants[variant],
          statusSizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
        )}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// ============================================================================
// Tier Badge (for skill progression badges)
// ============================================================================

export interface TierBadgeProps extends HTMLAttributes<HTMLDivElement> {
  tier: BadgeTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const tierStyles: Record<BadgeTier, {
  bg: string;
  border: string;
  text: string;
  glow: string;
}> = {
  bronze: {
    bg: 'bg-gradient-to-b from-amber-700/20 to-amber-800/10',
    border: 'border-amber-600/30',
    text: 'text-amber-500',
    glow: '',
  },
  silver: {
    bg: 'bg-gradient-to-b from-slate-400/20 to-slate-500/10',
    border: 'border-slate-400/30',
    text: 'text-slate-300',
    glow: '',
  },
  gold: {
    bg: 'bg-gradient-to-b from-amber-500/20 to-amber-600/10',
    border: 'border-amber-400/40',
    text: 'text-amber-400',
    glow: 'shadow-glow-amber',
  },
  platinum: {
    bg: 'bg-gradient-to-b from-cyan-400/20 to-cyan-500/10',
    border: 'border-cyan-400/40',
    text: 'text-cyan-400',
    glow: 'shadow-glow-cyan',
  },
  diamond: {
    bg: 'bg-gradient-to-b from-purple-400/20 to-indigo-500/15',
    border: 'border-purple-400/50',
    text: 'text-purple-400',
    glow: 'shadow-glow-purple animate-pulse-glow',
  },
};

const tierLabels: Record<BadgeTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

const tierSizes: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
};

export const TierBadge = forwardRef<HTMLDivElement, TierBadgeProps>(
  ({ className, tier, size = 'md', showLabel = false, animated = true, children, ...props }, ref) => {
    const styles = tierStyles[tier];

    return (
      <div ref={ref} className={cn('flex flex-col items-center gap-1', className)} {...props}>
        <div
          className={cn(
            'rounded-full flex items-center justify-center border-2',
            styles.bg,
            styles.border,
            styles.text,
            animated && styles.glow,
            tierSizes[size],
            'transition-all duration-300 hover:scale-105'
          )}
        >
          {children}
        </div>
        {showLabel && (
          <span className={cn('text-xs font-medium', styles.text)}>
            {tierLabels[tier]}
          </span>
        )}
      </div>
    );
  }
);

TierBadge.displayName = 'TierBadge';

// ============================================================================
// Activity Badge (for activity type indicators)
// ============================================================================

export interface ActivityBadgeProps extends HTMLAttributes<HTMLDivElement> {
  activity: 'kennel' | 'potty' | 'training' | 'play' | 'group_play' | 'feeding' | 'rest' | 'walk' | 'grooming' | 'medical';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const activityStyles: Record<string, {
  bg: string;
  text: string;
  label: string;
}> = {
  kennel: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Kennel' },
  potty: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Potty' },
  training: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Training' },
  play: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Play' },
  group_play: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Group Play' },
  feeding: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Feeding' },
  rest: { bg: 'bg-sky-500/15', text: 'text-sky-400', label: 'Rest' },
  walk: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'Walk' },
  grooming: { bg: 'bg-pink-500/15', text: 'text-pink-400', label: 'Grooming' },
  medical: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Medical' },
};

const activitySizes: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const ActivityBadge = forwardRef<HTMLDivElement, ActivityBadgeProps>(
  ({ className, activity, size = 'md', showLabel = false, children, ...props }, ref) => {
    const styles = activityStyles[activity];

    return (
      <div ref={ref} className={cn('flex flex-col items-center gap-1', className)} {...props}>
        <div
          className={cn(
            'rounded-xl flex items-center justify-center',
            styles.bg,
            styles.text,
            activitySizes[size],
            'transition-all duration-200 hover:scale-105'
          )}
        >
          {children}
        </div>
        {showLabel && (
          <span className="text-[11px] font-medium text-surface-400">
            {styles.label}
          </span>
        )}
      </div>
    );
  }
);

ActivityBadge.displayName = 'ActivityBadge';
