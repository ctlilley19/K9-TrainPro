'use client';

import { cn } from '@/lib/utils';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AchievementColor = 'green' | 'blue' | 'purple' | 'yellow' | 'pink' | 'orange' | 'cyan' | 'red';
export type ActivityColor = 'gray' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'sky' | 'pink' | 'red';

// Tier badge styling classes
const tierStyles: Record<BadgeTier, { gradient: string; glow: string; stroke: string }> = {
  bronze: {
    gradient: 'from-orange-700/20 to-orange-600/10',
    glow: 'shadow-[0_0_20px_rgba(205,127,50,0.4)]',
    stroke: '#cd7f32',
  },
  silver: {
    gradient: 'from-slate-400/20 to-slate-300/10',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    stroke: '#94a3b8',
  },
  gold: {
    gradient: 'from-amber-500/20 to-amber-400/10',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    stroke: '#f59e0b',
  },
  platinum: {
    gradient: 'from-cyan-400/20 to-cyan-300/10',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    stroke: '#22d3ee',
  },
  diamond: {
    gradient: 'from-purple-500/20 to-indigo-400/15',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    stroke: '#c084fc',
  },
};

const achievementStyles: Record<AchievementColor, { gradient: string; glow: string; stroke: string }> = {
  green: {
    gradient: 'from-green-500/20 to-green-400/10',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
    stroke: '#4ade80',
  },
  blue: {
    gradient: 'from-blue-500/20 to-blue-400/10',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    stroke: '#60a5fa',
  },
  purple: {
    gradient: 'from-violet-500/20 to-violet-400/10',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    stroke: '#a78bfa',
  },
  yellow: {
    gradient: 'from-yellow-500/20 to-yellow-400/10',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    stroke: '#facc15',
  },
  pink: {
    gradient: 'from-pink-500/20 to-pink-400/10',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    stroke: '#f472b6',
  },
  orange: {
    gradient: 'from-orange-500/20 to-orange-400/10',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.5)]',
    stroke: '#fb923c',
  },
  cyan: {
    gradient: 'from-cyan-500/20 to-cyan-400/10',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    stroke: '#22d3ee',
  },
  red: {
    gradient: 'from-red-500/20 to-red-400/10',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    stroke: '#f87171',
  },
};

interface BadgeCardProps {
  tier?: BadgeTier;
  achievementColor?: AchievementColor;
  title: string;
  description: string;
  icon: React.ReactNode;
  locked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function BadgeCard({
  tier,
  achievementColor,
  title,
  description,
  icon,
  locked = false,
  size = 'md',
  onClick,
}: BadgeCardProps) {
  const style = tier ? tierStyles[tier] : achievementColor ? achievementStyles[achievementColor] : achievementStyles.blue;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-7',
  };

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-[72px] h-[72px]',
    lg: 'w-20 h-20',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center rounded-2xl',
        'bg-gradient-to-br from-surface-800/90 to-surface-900/95',
        'border border-white/[0.06] transition-all duration-300',
        'hover:translate-y-[-4px] hover:border-white/10',
        locked && 'opacity-35 grayscale pointer-events-none',
        tier === 'diamond' && !locked && 'animate-diamond-border',
        onClick && 'cursor-pointer',
        sizeClasses[size]
      )}
      style={{
        boxShadow: locked ? 'none' : `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px -5px ${style.stroke}33`,
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl opacity-60"
        style={{
          background: `linear-gradient(90deg, ${style.stroke}, ${style.stroke}99, ${style.stroke})`,
        }}
      />

      {/* Badge Icon */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center mb-4',
          `bg-gradient-to-br ${style.gradient}`,
          !locked && style.glow,
          tier === 'diamond' && !locked && 'animate-pulse-glow',
          iconSizeClasses[size]
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Sparkle for gold/diamond */}
        {(tier === 'gold' || tier === 'diamond') && !locked && (
          <span
            className="absolute top-1 right-1 text-[10px] animate-sparkle"
            style={{ color: style.stroke, textShadow: `0 0 6px ${style.stroke}` }}
          >
            ✦
          </span>
        )}

        <span style={{ filter: `drop-shadow(0 0 4px ${style.stroke})` }}>{icon}</span>
      </div>

      <h3 className="text-[15px] font-semibold text-slate-100 text-center mb-1">{title}</h3>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </div>
  );
}

// Activity icon component for training board
interface ActivityIconProps {
  color: ActivityColor;
  icon: React.ReactNode;
  label: string;
  size?: 'sm' | 'md';
}

const activityStyles: Record<ActivityColor, { bg: string; glow: string; stroke: string }> = {
  gray: { bg: 'from-gray-500/15 to-gray-500/8', glow: 'rgba(107,114,128,0.3)', stroke: '#9ca3af' },
  blue: { bg: 'from-blue-500/15 to-blue-500/8', glow: 'rgba(59,130,246,0.4)', stroke: '#60a5fa' },
  green: { bg: 'from-green-500/15 to-green-500/8', glow: 'rgba(34,197,94,0.4)', stroke: '#4ade80' },
  yellow: { bg: 'from-yellow-500/15 to-yellow-500/8', glow: 'rgba(234,179,8,0.4)', stroke: '#facc15' },
  orange: { bg: 'from-orange-500/15 to-orange-500/8', glow: 'rgba(249,115,22,0.4)', stroke: '#fb923c' },
  purple: { bg: 'from-violet-500/15 to-violet-500/8', glow: 'rgba(139,92,246,0.4)', stroke: '#a78bfa' },
  sky: { bg: 'from-sky-500/15 to-sky-500/8', glow: 'rgba(56,189,248,0.4)', stroke: '#38bdf8' },
  pink: { bg: 'from-pink-500/15 to-pink-500/8', glow: 'rgba(236,72,153,0.4)', stroke: '#f472b6' },
  red: { bg: 'from-red-500/15 to-red-500/8', glow: 'rgba(239,68,68,0.4)', stroke: '#f87171' },
};

export function ActivityIcon({ color, icon, label, size = 'md' }: ActivityIconProps) {
  const style = activityStyles[color];

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'rounded-xl flex items-center justify-center transition-all duration-200',
          `bg-gradient-to-br ${style.bg}`,
          size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
        )}
        style={{ boxShadow: `0 0 15px ${style.glow}` }}
      >
        <span style={{ filter: `drop-shadow(0 0 3px ${style.glow})` }}>{icon}</span>
      </div>
      <span className="text-[11px] font-medium text-gray-400 text-center mt-2">{label}</span>
    </div>
  );
}

// Tier indicator dots
interface TierDotsProps {
  availableTiers: BadgeTier[];
  earnedTiers?: BadgeTier[];
  size?: 'sm' | 'md';
}

export function TierDots({ availableTiers, earnedTiers = [], size = 'md' }: TierDotsProps) {
  const allTiers: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const dotSize = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <div className="flex gap-1.5">
      {allTiers.map((tier) => {
        const isAvailable = availableTiers.includes(tier);
        const isEarned = earnedTiers.includes(tier);
        const style = tierStyles[tier];

        return (
          <div
            key={tier}
            className={cn(
              'rounded-full flex items-center justify-center',
              dotSize,
              isAvailable && isEarned
                ? `bg-gradient-to-br ${style.gradient}`
                : 'bg-surface-700'
            )}
            style={isAvailable && isEarned ? { boxShadow: `0 0 8px ${style.stroke}66` } : {}}
            title={`${tier}${isEarned ? ' (earned)' : isAvailable ? '' : ' (not available)'}`}
          >
            {isAvailable ? (
              isEarned ? (
                <svg
                  width={iconSize}
                  height={iconSize}
                  viewBox="0 0 24 24"
                  fill={style.stroke}
                >
                  <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                </svg>
              ) : (
                <svg
                  width={iconSize}
                  height={iconSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="2"
                >
                  <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                </svg>
              )
            ) : (
              <svg
                width={iconSize - 2}
                height={iconSize - 2}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
              >
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
