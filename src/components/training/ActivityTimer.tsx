'use client';

import { useState, useEffect } from 'react';
import { cn, formatDuration, getTimerStatus, activityConfig, type ActivityType } from '@/lib/utils';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface ActivityTimerProps {
  startedAt: Date;
  activityType: ActivityType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ActivityTimer({
  startedAt,
  activityType,
  size = 'md',
  showLabel = false,
  className,
}: ActivityTimerProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(() =>
    Math.floor((Date.now() - startedAt.getTime()) / 60000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - startedAt.getTime()) / 60000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const status = getTimerStatus(elapsedMinutes, activityType);
  const config = activityConfig[activityType];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-2.5 py-1.5 text-sm gap-2',
    lg: 'px-3 py-2 text-base gap-2.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const StatusIcon = status === 'urgent' ? AlertCircle : status === 'warning' ? AlertTriangle : Clock;

  return (
    <div
      className={cn(
        'flex items-center rounded-lg font-medium transition-all duration-300',
        sizeClasses[size],
        status === 'urgent'
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : status === 'warning'
          ? 'bg-yellow-500/20 text-yellow-400'
          : cn(config.bgColor, config.color),
        className
      )}
    >
      <StatusIcon
        size={iconSizes[size]}
        className={cn(
          status === 'urgent' && 'animate-bounce',
          status === 'warning' && 'animate-pulse'
        )}
      />
      <span>{formatDuration(elapsedMinutes)}</span>
      {showLabel && (
        <span className="text-surface-400 font-normal ml-1">
          in {config.label.toLowerCase()}
        </span>
      )}
    </div>
  );
}

interface TimerProgressBarProps {
  startedAt: Date;
  activityType: ActivityType;
  className?: string;
}

export function TimerProgressBar({
  startedAt,
  activityType,
  className,
}: TimerProgressBarProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(() =>
    Math.floor((Date.now() - startedAt.getTime()) / 60000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - startedAt.getTime()) / 60000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const config = activityConfig[activityType];
  const status = getTimerStatus(elapsedMinutes, activityType);

  // Calculate progress percentage (max at urgent threshold)
  const maxTime = config.maxMinutes;
  const progress = Math.min((elapsedMinutes / maxTime) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            status === 'urgent'
              ? 'bg-red-500'
              : status === 'warning'
              ? 'bg-yellow-500'
              : 'bg-brand-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-surface-500">
        <span>{formatDuration(elapsedMinutes)}</span>
        <span>
          {status === 'normal' && `${config.warningMinutes}m warning`}
          {status === 'warning' && `${config.maxMinutes - elapsedMinutes}m left`}
          {status === 'urgent' && 'Over time!'}
        </span>
      </div>
    </div>
  );
}
