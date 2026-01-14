// Business Mode Configuration Service
// Manages facility configuration and feature flags

import { supabase, isDemo, getDemoFacilityId } from './client';
import type {
  FacilityConfig,
  FeaturePreset,
  FeatureFlags,
  BusinessMode,
} from '@/types/database';

// ============================================================================
// Demo Data
// ============================================================================

const demoFacilityConfig: FacilityConfig = {
  id: 'config-demo-1',
  facility_id: getDemoFacilityId(),
  business_mode: 'facility',
  business_name: 'Paws & Progress Training Center',
  tagline: 'Where Every Dog Becomes Their Best Self',
  logo_url: null,
  primary_color: '#2563eb',
  secondary_color: '#059669',
  contact_email: 'hello@pawsprogress.com',
  contact_phone: '(555) 123-4567',
  website_url: 'https://pawsprogress.com',
  address_line1: '123 Training Lane',
  address_line2: null,
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94102',
  country: 'US',
  timezone: 'America/Los_Angeles',
  enable_pet_parent_portal: true,
  enable_homework_system: true,
  enable_messaging: true,
  enable_daily_reports: true,
  enable_video_library: true,
  enable_progress_tracking: true,
  enable_before_after_comparisons: true,
  enable_badges: true,
  enable_certificates: true,
  enable_boarding: true,
  enable_daycare: true,
  enable_grooming: false,
  enable_training_board: true,
  enable_live_status_feed: true,
  enable_kennel_tracking: true,
  enable_activity_timer: true,
  enable_multi_trainer: true,
  enable_calendar_scheduling: true,
  max_dogs_per_trainer: 6,
  max_kennel_time_minutes: 240,
  default_potty_interval_minutes: 120,
  business_hours_start: '07:00',
  business_hours_end: '19:00',
  operating_days: [1, 2, 3, 4, 5],
  send_arrival_notifications: true,
  send_departure_notifications: true,
  send_activity_notifications: true,
  send_report_notifications: true,
  daily_report_time: '17:00',
  currency: 'USD',
  enable_online_booking: false,
  enable_online_payments: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoFeaturePresets: FeaturePreset[] = [
  {
    id: 'preset-1',
    name: 'Family Training - Standard',
    description: 'Perfect for independent trainers working with individual families',
    business_mode: 'family_training',
    features: {
      enable_pet_parent_portal: true,
      enable_homework_system: true,
      enable_messaging: true,
      enable_daily_reports: true,
      enable_video_library: true,
      enable_progress_tracking: true,
      enable_before_after_comparisons: true,
      enable_badges: true,
      enable_certificates: true,
      enable_boarding: false,
      enable_daycare: false,
      enable_grooming: false,
      enable_training_board: false,
      enable_live_status_feed: false,
      enable_kennel_tracking: false,
      enable_activity_timer: false,
      enable_multi_trainer: false,
      enable_calendar_scheduling: true,
    },
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'preset-2',
    name: 'Board & Train Facility',
    description: 'Full-featured board and train facility with all capabilities',
    business_mode: 'facility',
    features: {
      enable_pet_parent_portal: true,
      enable_homework_system: true,
      enable_messaging: true,
      enable_daily_reports: true,
      enable_video_library: true,
      enable_progress_tracking: true,
      enable_before_after_comparisons: true,
      enable_badges: true,
      enable_certificates: true,
      enable_boarding: true,
      enable_daycare: true,
      enable_grooming: true,
      enable_training_board: true,
      enable_live_status_feed: true,
      enable_kennel_tracking: true,
      enable_activity_timer: true,
      enable_multi_trainer: true,
      enable_calendar_scheduling: true,
    },
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'preset-3',
    name: 'Daycare Only',
    description: 'For facilities focused on daycare services',
    business_mode: 'facility',
    features: {
      enable_pet_parent_portal: true,
      enable_homework_system: false,
      enable_messaging: true,
      enable_daily_reports: true,
      enable_video_library: false,
      enable_progress_tracking: false,
      enable_before_after_comparisons: false,
      enable_badges: false,
      enable_certificates: false,
      enable_boarding: false,
      enable_daycare: true,
      enable_grooming: false,
      enable_training_board: true,
      enable_live_status_feed: true,
      enable_kennel_tracking: true,
      enable_activity_timer: true,
      enable_multi_trainer: true,
      enable_calendar_scheduling: true,
    },
    is_default: false,
    created_at: new Date().toISOString(),
  },
];

// ============================================================================
// Configuration Service
// ============================================================================

export const facilityConfigService = {
  // Get facility configuration
  async getConfig(facilityId: string): Promise<FacilityConfig> {
    if (isDemo()) {
      return demoFacilityConfig;
    }

    const { data, error } = await supabase
      .from('facility_config')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update facility configuration
  async updateConfig(
    facilityId: string,
    data: Partial<Omit<FacilityConfig, 'id' | 'facility_id' | 'created_at' | 'updated_at'>>
  ): Promise<FacilityConfig> {
    if (isDemo()) {
      Object.assign(demoFacilityConfig, data, { updated_at: new Date().toISOString() });
      return demoFacilityConfig;
    }

    const { data: result, error } = await supabase
      .from('facility_config')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('facility_id', facilityId)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Switch business mode
  async switchBusinessMode(
    facilityId: string,
    mode: BusinessMode,
    applyPreset?: string
  ): Promise<FacilityConfig> {
    if (isDemo()) {
      demoFacilityConfig.business_mode = mode;

      // Apply preset features if specified
      if (applyPreset) {
        const preset = demoFeaturePresets.find(p => p.id === applyPreset);
        if (preset) {
          Object.keys(preset.features).forEach(key => {
            (demoFacilityConfig as any)[key] = preset.features[key];
          });
        }
      }

      demoFacilityConfig.updated_at = new Date().toISOString();
      return demoFacilityConfig;
    }

    // Get preset features if specified
    let presetFeatures: Record<string, boolean> = {};
    if (applyPreset) {
      const { data: preset } = await supabase
        .from('feature_presets')
        .select('features')
        .eq('id', applyPreset)
        .single();

      if (preset) {
        presetFeatures = preset.features;
      }
    }

    const { data, error } = await supabase
      .from('facility_config')
      .update({
        business_mode: mode,
        ...presetFeatures,
        updated_at: new Date().toISOString(),
      })
      .eq('facility_id', facilityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get feature presets
  async getPresets(mode?: BusinessMode): Promise<FeaturePreset[]> {
    if (isDemo()) {
      if (mode) {
        return demoFeaturePresets.filter(p => p.business_mode === mode);
      }
      return demoFeaturePresets;
    }

    let query = supabase.from('feature_presets').select('*');

    if (mode) {
      query = query.eq('business_mode', mode);
    }

    const { data, error } = await query.order('is_default', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Apply a preset to the facility
  async applyPreset(facilityId: string, presetId: string): Promise<FacilityConfig> {
    if (isDemo()) {
      const preset = demoFeaturePresets.find(p => p.id === presetId);
      if (!preset) throw new Error('Preset not found');

      demoFacilityConfig.business_mode = preset.business_mode;
      Object.keys(preset.features).forEach(key => {
        (demoFacilityConfig as any)[key] = preset.features[key];
      });
      demoFacilityConfig.updated_at = new Date().toISOString();
      return demoFacilityConfig;
    }

    // Get preset
    const { data: preset, error: presetError } = await supabase
      .from('feature_presets')
      .select('*')
      .eq('id', presetId)
      .single();

    if (presetError) throw presetError;

    // Update config with preset
    const { data, error } = await supabase
      .from('facility_config')
      .update({
        business_mode: preset.business_mode,
        ...preset.features,
        updated_at: new Date().toISOString(),
      })
      .eq('facility_id', facilityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle a specific feature
  async toggleFeature(
    facilityId: string,
    feature: string,
    enabled: boolean
  ): Promise<FacilityConfig> {
    if (isDemo()) {
      (demoFacilityConfig as any)[feature] = enabled;
      demoFacilityConfig.updated_at = new Date().toISOString();
      return demoFacilityConfig;
    }

    const { data, error } = await supabase
      .from('facility_config')
      .update({
        [feature]: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('facility_id', facilityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// Feature Flags Helper
// ============================================================================

export function configToFeatureFlags(config: FacilityConfig): FeatureFlags {
  return {
    petParentPortal: config.enable_pet_parent_portal,
    homeworkSystem: config.enable_homework_system,
    messaging: config.enable_messaging,
    dailyReports: config.enable_daily_reports,
    videoLibrary: config.enable_video_library,
    progressTracking: config.enable_progress_tracking,
    beforeAfterComparisons: config.enable_before_after_comparisons,
    badges: config.enable_badges,
    certificates: config.enable_certificates,
    boarding: config.enable_boarding,
    daycare: config.enable_daycare,
    grooming: config.enable_grooming,
    trainingBoard: config.enable_training_board,
    liveStatusFeed: config.enable_live_status_feed,
    kennelTracking: config.enable_kennel_tracking,
    activityTimer: config.enable_activity_timer,
    multiTrainer: config.enable_multi_trainer,
    calendarScheduling: config.enable_calendar_scheduling,
  };
}

// Default feature flags for when config is not available
export const defaultFeatureFlags: FeatureFlags = {
  petParentPortal: true,
  homeworkSystem: true,
  messaging: true,
  dailyReports: true,
  videoLibrary: true,
  progressTracking: true,
  beforeAfterComparisons: true,
  badges: true,
  certificates: true,
  boarding: false,
  daycare: false,
  grooming: false,
  trainingBoard: false,
  liveStatusFeed: false,
  kennelTracking: false,
  activityTimer: false,
  multiTrainer: false,
  calendarScheduling: true,
};
