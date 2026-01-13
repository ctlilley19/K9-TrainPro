import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';

// ============================================================================
// Class Name Utilities
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Date & Time Utilities
// ============================================================================

export function formatDate(date: Date | string, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getMinutesSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return differenceInMinutes(new Date(), d);
}

// ============================================================================
// Activity Timer Utilities
// ============================================================================

export type ActivityType =
  | 'kennel'
  | 'potty'
  | 'training'
  | 'play'
  | 'group_play'
  | 'feeding'
  | 'rest'
  | 'walk'
  | 'grooming'
  | 'medical';

export type TimerStatus = 'normal' | 'warning' | 'urgent';

export const activityConfig: Record<ActivityType, {
  label: string;
  maxMinutes: number;
  warningMinutes: number;
  color: string;
  bgColor: string;
  glowColor: string;
}> = {
  kennel: {
    label: 'Kennel',
    maxMinutes: 240, // 4 hours
    warningMinutes: 180, // 3 hours
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/15',
    glowColor: 'rgba(107, 114, 128, 0.4)',
  },
  potty: {
    label: 'Potty',
    maxMinutes: 30,
    warningMinutes: 20,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
  training: {
    label: 'Training',
    maxMinutes: 45,
    warningMinutes: 30,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  play: {
    label: 'Play',
    maxMinutes: 60,
    warningMinutes: 45,
    color: 'text-green-400',
    bgColor: 'bg-green-500/15',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  group_play: {
    label: 'Group Play',
    maxMinutes: 60,
    warningMinutes: 45,
    color: 'text-green-400',
    bgColor: 'bg-green-500/15',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  feeding: {
    label: 'Feeding',
    maxMinutes: 30,
    warningMinutes: 20,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  rest: {
    label: 'Rest',
    maxMinutes: 120,
    warningMinutes: 90,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  walk: {
    label: 'Walk',
    maxMinutes: 45,
    warningMinutes: 30,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  grooming: {
    label: 'Grooming',
    maxMinutes: 60,
    warningMinutes: 45,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/15',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  medical: {
    label: 'Medical',
    maxMinutes: 120,
    warningMinutes: 60,
    color: 'text-red-400',
    bgColor: 'bg-red-500/15',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
};

export function getTimerStatus(minutes: number, activityType: ActivityType): TimerStatus {
  const config = activityConfig[activityType];
  if (minutes >= config.maxMinutes) return 'urgent';
  if (minutes >= config.warningMinutes) return 'warning';
  return 'normal';
}

export function getTimerColor(status: TimerStatus): string {
  switch (status) {
    case 'urgent':
      return 'text-red-500 animate-pulse';
    case 'warning':
      return 'text-yellow-500';
    default:
      return 'text-gray-400';
  }
}

// ============================================================================
// Badge & Tier Utilities
// ============================================================================

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const tierConfig: Record<BadgeTier, {
  label: string;
  color: string;
  bgGradient: string;
  glowColor: string;
}> = {
  bronze: {
    label: 'Bronze',
    color: '#cd7f32',
    bgGradient: 'from-amber-700/20 to-amber-800/10',
    glowColor: 'rgba(205, 127, 50, 0.4)',
  },
  silver: {
    label: 'Silver',
    color: '#94a3b8',
    bgGradient: 'from-slate-400/20 to-slate-500/10',
    glowColor: 'rgba(148, 163, 184, 0.4)',
  },
  gold: {
    label: 'Gold',
    color: '#f59e0b',
    bgGradient: 'from-amber-500/20 to-amber-600/10',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  platinum: {
    label: 'Platinum',
    color: '#22d3ee',
    bgGradient: 'from-cyan-400/20 to-cyan-500/10',
    glowColor: 'rgba(6, 182, 212, 0.5)',
  },
  diamond: {
    label: 'Diamond',
    color: '#c084fc',
    bgGradient: 'from-purple-400/20 to-indigo-500/15',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
};

// ============================================================================
// String Utilities
// ============================================================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

// ============================================================================
// Number Utilities
// ============================================================================

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
