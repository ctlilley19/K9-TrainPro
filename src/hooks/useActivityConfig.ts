'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFacility } from '@/stores/authStore';
import { ICON_REGISTRY } from '@/components/activities/IconBuilder';
import type { ActivityType } from '@/types/database';

interface ActivityConfig {
  code: string;
  label: string;
  iconName: string;
  color: string;
  bgColor?: string;
  glowColor?: string;
  maxMinutes: number;
  warningMinutes: number;
  showInQuickLog: boolean;
  isCustom: boolean;
  customTypeId?: string;
}

interface UseActivityConfigReturn {
  activityConfigs: ActivityConfig[];
  configMap: Map<string, ActivityConfig>;
  isLoading: boolean;
  getConfig: (typeCode: string) => ActivityConfig | undefined;
  getIcon: (typeCode: string) => React.ComponentType<{ size?: number; className?: string }> | null;
  getColor: (typeCode: string) => string;
  getQuickLogActivities: () => ActivityConfig[];
  refetch: () => Promise<void>;
}

// Default configs (fallback when API fails)
const DEFAULT_CONFIGS: ActivityConfig[] = [
  { code: 'kennel', label: 'Kennel', iconName: 'Home', color: '#9ca3af', maxMinutes: 240, warningMinutes: 180, showInQuickLog: true, isCustom: false },
  { code: 'potty', label: 'Potty', iconName: 'Droplets', color: '#facc15', maxMinutes: 30, warningMinutes: 20, showInQuickLog: true, isCustom: false },
  { code: 'training', label: 'Training', iconName: 'GraduationCap', color: '#60a5fa', maxMinutes: 45, warningMinutes: 30, showInQuickLog: true, isCustom: false },
  { code: 'play', label: 'Play', iconName: 'Gamepad2', color: '#4ade80', maxMinutes: 60, warningMinutes: 45, showInQuickLog: true, isCustom: false },
  { code: 'group_play', label: 'Group Play', iconName: 'Gamepad2', color: '#4ade80', maxMinutes: 60, warningMinutes: 45, showInQuickLog: true, isCustom: false },
  { code: 'feeding', label: 'Feeding', iconName: 'UtensilsCrossed', color: '#a78bfa', maxMinutes: 30, warningMinutes: 20, showInQuickLog: true, isCustom: false },
  { code: 'rest', label: 'Rest', iconName: 'Moon', color: '#38bdf8', maxMinutes: 120, warningMinutes: 90, showInQuickLog: true, isCustom: false },
  { code: 'walk', label: 'Walk', iconName: 'Dog', color: '#fb923c', maxMinutes: 45, warningMinutes: 30, showInQuickLog: true, isCustom: false },
  { code: 'grooming', label: 'Grooming', iconName: 'Sparkles', color: '#f472b6', maxMinutes: 60, warningMinutes: 45, showInQuickLog: true, isCustom: false },
  { code: 'medical', label: 'Medical', iconName: 'Stethoscope', color: '#f87171', maxMinutes: 120, warningMinutes: 60, showInQuickLog: true, isCustom: false },
];

export function useActivityConfig(): UseActivityConfigReturn {
  const facility = useFacility();
  const [activityConfigs, setActivityConfigs] = useState<ActivityConfig[]>(DEFAULT_CONFIGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = async () => {
    if (!facility?.id) {
      setActivityConfigs(DEFAULT_CONFIGS);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/activities/custom?facilityId=${facility.id}`);
      const data = await response.json();

      if (data.activityTypes && data.activityTypes.length > 0) {
        setActivityConfigs(data.activityTypes);
      } else {
        setActivityConfigs(DEFAULT_CONFIGS);
      }
    } catch (error) {
      console.error('Error fetching activity configs:', error);
      setActivityConfigs(DEFAULT_CONFIGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [facility?.id]);

  const configMap = useMemo(() => {
    return new Map(activityConfigs.map((config) => [config.code, config]));
  }, [activityConfigs]);

  const getConfig = (typeCode: string): ActivityConfig | undefined => {
    return configMap.get(typeCode);
  };

  const getIcon = (typeCode: string) => {
    const config = configMap.get(typeCode);
    if (!config) return null;
    return ICON_REGISTRY[config.iconName]?.icon || null;
  };

  const getColor = (typeCode: string): string => {
    const config = configMap.get(typeCode);
    return config?.color || '#6366f1';
  };

  const getQuickLogActivities = (): ActivityConfig[] => {
    return activityConfigs.filter((config) => config.showInQuickLog);
  };

  return {
    activityConfigs,
    configMap,
    isLoading,
    getConfig,
    getIcon,
    getColor,
    getQuickLogActivities,
    refetch: fetchConfigs,
  };
}

// Helper to get timer status based on activity config
export function getTimerStatusFromConfig(
  minutes: number,
  config: ActivityConfig
): 'normal' | 'warning' | 'urgent' {
  if (minutes >= config.maxMinutes) return 'urgent';
  if (minutes >= config.warningMinutes) return 'warning';
  return 'normal';
}
