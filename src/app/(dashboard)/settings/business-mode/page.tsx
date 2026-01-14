'use client';

import { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Check,
  ChevronRight,
  Home,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  Award,
  BookOpen,
  Activity,
  Clock,
  Dog,
  Scissors,
  Bed,
  Bell,
  Palette,
  Save,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  useFacilityConfig,
  useUpdateFacilityConfig,
  useSwitchBusinessMode,
  useFeaturePresets,
  useApplyPreset,
  useToggleFeature,
} from '@/hooks';
import type { BusinessMode, FacilityConfig, FeaturePreset } from '@/types/database';

const businessModeInfo = {
  family_training: {
    title: 'Family Training Mode',
    description: 'Perfect for independent trainers working with individual families on a 1:1 basis.',
    icon: <Users size={24} />,
    features: [
      'Pet Parent Portal',
      'Homework System',
      'Progress Tracking',
      'Before/After Comparisons',
      'Badges & Certificates',
      'Video Library',
    ],
  },
  facility: {
    title: 'Facility Mode',
    description: 'Designed for board & train facilities, daycares, and training centers managing multiple dogs.',
    icon: <Building2 size={24} />,
    features: [
      'Training Board (Kanban)',
      'Activity Timer',
      'Kennel Tracking',
      'Live Status Feed',
      'Calendar Scheduling',
      'Multi-Trainer Support',
    ],
  },
};

const featureCategories = [
  {
    title: 'Pet Parent Communication',
    features: [
      { key: 'enable_pet_parent_portal', label: 'Pet Parent Portal', icon: <Home size={18} />, description: 'Allow pet parents to view updates and track progress' },
      { key: 'enable_messaging', label: 'Messaging System', icon: <MessageSquare size={18} />, description: 'In-app messaging between trainers and pet parents' },
      { key: 'enable_daily_reports', label: 'Daily Reports', icon: <FileText size={18} />, description: 'Automated daily reports sent to pet parents' },
      { key: 'enable_live_status_feed', label: 'Live Status Feed', icon: <Activity size={18} />, description: 'Real-time updates about dog activities' },
    ],
  },
  {
    title: 'Training & Progress',
    features: [
      { key: 'enable_homework_system', label: 'Homework System', icon: <BookOpen size={18} />, description: 'Assign and track homework for pet parents' },
      { key: 'enable_progress_tracking', label: 'Progress Tracking', icon: <Activity size={18} />, description: 'Track skill development over time' },
      { key: 'enable_before_after_comparisons', label: 'Before/After Comparisons', icon: <Video size={18} />, description: 'Side-by-side progress videos' },
      { key: 'enable_video_library', label: 'Video Library', icon: <Video size={18} />, description: 'Training video resources for staff and clients' },
    ],
  },
  {
    title: 'Achievements',
    features: [
      { key: 'enable_badges', label: 'Badges', icon: <Award size={18} />, description: 'Award badges for accomplishments' },
      { key: 'enable_certificates', label: 'Certificates', icon: <Award size={18} />, description: 'Generate completion certificates' },
    ],
  },
  {
    title: 'Facility Operations',
    features: [
      { key: 'enable_boarding', label: 'Boarding Services', icon: <Bed size={18} />, description: 'Board & train management' },
      { key: 'enable_daycare', label: 'Daycare Services', icon: <Dog size={18} />, description: 'Daycare check-in/out management' },
      { key: 'enable_grooming', label: 'Grooming Services', icon: <Scissors size={18} />, description: 'Grooming appointment scheduling' },
      { key: 'enable_training_board', label: 'Training Board', icon: <Activity size={18} />, description: 'Kanban-style daily management' },
      { key: 'enable_kennel_tracking', label: 'Kennel Tracking', icon: <Clock size={18} />, description: 'Monitor kennel time limits' },
      { key: 'enable_activity_timer', label: 'Activity Timer', icon: <Clock size={18} />, description: 'Time activities automatically' },
    ],
  },
  {
    title: 'Management',
    features: [
      { key: 'enable_multi_trainer', label: 'Multi-Trainer Support', icon: <Users size={18} />, description: 'Manage multiple trainers and assignments' },
      { key: 'enable_calendar_scheduling', label: 'Calendar Scheduling', icon: <Calendar size={18} />, description: 'Appointment and schedule management' },
    ],
  },
];

export default function BusinessModeSettingsPage() {
  const { data: config, isLoading } = useFacilityConfig();
  const { data: presets = [] } = useFeaturePresets();
  const updateConfig = useUpdateFacilityConfig();
  const switchMode = useSwitchBusinessMode();
  const applyPreset = useApplyPreset();
  const toggleFeature = useToggleFeature();

  const [activeTab, setActiveTab] = useState<'mode' | 'features' | 'branding' | 'notifications'>('mode');
  const [pendingMode, setPendingMode] = useState<BusinessMode | null>(null);
  const [showModeConfirm, setShowModeConfirm] = useState(false);

  if (isLoading || !config) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const handleModeChange = (mode: BusinessMode) => {
    if (mode === config.business_mode) return;
    setPendingMode(mode);
    setShowModeConfirm(true);
  };

  const confirmModeChange = async (presetId?: string) => {
    if (!pendingMode) return;
    await switchMode.mutateAsync({ mode: pendingMode, applyPreset: presetId });
    setShowModeConfirm(false);
    setPendingMode(null);
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    await toggleFeature.mutateAsync({ feature, enabled });
  };

  const handleApplyPreset = async (presetId: string) => {
    if (confirm('Apply this preset? This will update all feature settings.')) {
      await applyPreset.mutateAsync(presetId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Configuration</h1>
          <p className="text-gray-600 mt-1">
            Configure your business mode and feature settings
          </p>
        </div>
      </div>

      {/* Current Mode Banner */}
      <div className={`rounded-xl p-6 ${config.business_mode === 'family_training' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'} border`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${config.business_mode === 'family_training' ? 'bg-blue-100' : 'bg-purple-100'}`}>
            {config.business_mode === 'family_training' ? <Users size={24} className="text-blue-600" /> : <Building2 size={24} className="text-purple-600" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {businessModeInfo[config.business_mode].title}
            </h2>
            <p className="text-gray-600">
              {businessModeInfo[config.business_mode].description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {[
              { id: 'mode', label: 'Business Mode', icon: <Settings size={18} /> },
              { id: 'features', label: 'Features', icon: <Activity size={18} /> },
              { id: 'branding', label: 'Branding', icon: <Palette size={18} /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Business Mode Tab */}
          {activeTab === 'mode' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['family_training', 'facility'] as BusinessMode[]).map((mode) => {
                  const info = businessModeInfo[mode];
                  const isActive = config.business_mode === mode;

                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-gray-100'}`}>
                          {info.icon}
                        </div>
                        {isActive && (
                          <div className="p-1 bg-primary rounded-full">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-4">{info.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{info.description}</p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Key Features</p>
                        <ul className="space-y-1">
                          {info.features.map((feature) => (
                            <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                              <Check size={14} className="text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Presets Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Configuration Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{preset.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          preset.business_mode === 'family_training'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {preset.business_mode === 'family_training' ? 'Family' : 'Facility'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApplyPreset(preset.id)}
                        className="mt-4 w-full px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        Apply Preset
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-8">
              {featureCategories.map((category) => (
                <div key={category.title}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.title}</h3>
                  <div className="space-y-3">
                    {category.features.map((feature) => {
                      const isEnabled = (config as any)[feature.key];

                      return (
                        <div
                          key={feature.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              {feature.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{feature.label}</p>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => handleToggleFeature(feature.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={config.business_name || ''}
                    onChange={(e) => updateConfig.mutate({ business_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={config.tagline || ''}
                    onChange={(e) => updateConfig.mutate({ tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Your business tagline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateConfig.mutate({ primary_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => updateConfig.mutate({ primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => updateConfig.mutate({ secondary_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.secondary_color}
                      onChange={(e) => updateConfig.mutate({ secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={config.contact_email || ''}
                  onChange={(e) => updateConfig.mutate({ contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={config.contact_phone || ''}
                  onChange={(e) => updateConfig.mutate({ contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={config.website_url || ''}
                  onChange={(e) => updateConfig.mutate({ website_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                {[
                  { key: 'send_arrival_notifications', label: 'Arrival Notifications', description: 'Notify parents when their dog arrives' },
                  { key: 'send_departure_notifications', label: 'Departure Notifications', description: 'Notify parents when their dog is ready for pickup' },
                  { key: 'send_activity_notifications', label: 'Activity Notifications', description: 'Send updates about training sessions' },
                  { key: 'send_report_notifications', label: 'Report Notifications', description: 'Notify parents when daily reports are ready' },
                ].map((setting) => {
                  const isEnabled = (config as any)[setting.key];

                  return (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => updateConfig.mutate({ [setting.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Report Time
                </label>
                <input
                  type="time"
                  value={config.daily_report_time}
                  onChange={(e) => updateConfig.mutate({ daily_report_time: e.target.value })}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Daily reports will be sent to pet parents at this time
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Change Confirmation Modal */}
      {showModeConfirm && pendingMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold">Change Business Mode?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Switching to <strong>{businessModeInfo[pendingMode].title}</strong> will adjust your available features. You can customize individual features after switching.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Would you like to apply a default preset for this mode?
            </p>

            {/* Preset Options */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => confirmModeChange()}
                className="w-full px-4 py-2 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Keep Current Features</p>
                <p className="text-sm text-gray-500">Only change the mode, keep existing feature settings</p>
              </button>
              {presets
                .filter(p => p.business_mode === pendingMode && p.is_default)
                .map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => confirmModeChange(preset.id)}
                    className="w-full px-4 py-2 text-left rounded-lg border border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <p className="font-medium text-primary">Apply {preset.name}</p>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                  </button>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModeConfirm(false);
                  setPendingMode(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
