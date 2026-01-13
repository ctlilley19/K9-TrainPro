'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

const sizeStyles: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const iconSizes: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', showBorder = false, ...props }, ref) => {
    const hasImage = !!src;
    const initials = name ? getInitials(name) : '';
    const bgColor = name ? getColorFromName(name) : 'bg-surface-600';

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center',
          'transition-transform duration-200 hover:scale-105',
          sizeStyles[size],
          showBorder && 'ring-2 ring-surface-700 ring-offset-2 ring-offset-surface-900',
          !hasImage && bgColor,
          className
        )}
        {...props}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span className="font-semibold text-white">{initials}</span>
        ) : (
          <User size={iconSizes[size]} className="text-surface-400" />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group (for showing multiple avatars)
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ src?: string | null; name?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, avatars, max = 4, size = 'sm', ...props }, ref) => {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={index}
            src={avatar.src}
            name={avatar.name}
            size={size}
            showBorder
          />
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              'rounded-full flex items-center justify-center bg-surface-600 text-surface-300 font-medium',
              'ring-2 ring-surface-700 ring-offset-2 ring-offset-surface-900',
              sizeStyles[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
