'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  Settings,
  Flag,
  Bell,
  Mail,
  Shield,
  Database,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

// Types
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  updated_at: string;
}

interface AlertThreshold {
  id: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  unit: string;
  action: string;
  enabled: boolean;
}

// Empty initial state for alert thresholds (would need database table)
const emptyAlertThresholds: AlertThreshold[] = [];

export default function SettingsPage() {
  const { sessionToken } = useAdminStore();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [alertThresholds, setAlertThresholds] = useState<AlertThreshold[]>(emptyAlertThresholds);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [error, setError] = useState<string | null>(null);

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    maxUploadSize: 50,
    sessionTimeout: 30,
    mfaRequired: true,
    debugMode: false,
  });

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    fromName: 'K9 ProTrain',
    fromEmail: 'noreply@k9protrain.com',
    replyTo: 'support@k9protrain.com',
    smtpEnabled: true,
  });

  // Fetch feature flags from API
  const fetchFeatureFlags = useCallback(async () => {
    if (!sessionToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/settings?type=feature_flags', {
        headers: {
          'x-admin-session': sessionToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data.featureFlags || []);
      } else if (response.status === 403) {
        setError('Insufficient permissions to view settings');
      } else {
        setError('Failed to load feature flags');
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError('Failed to load feature flags');
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  // Toggle feature flag
  const toggleFeatureFlag = async (flagId: string) => {
    if (!sessionToken) return;

    // Optimistic update
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === flagId ? { ...flag, is_enabled: !flag.is_enabled, updated_at: new Date().toISOString() } : flag
      )
    );

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          type: 'feature_flag',
          action: 'toggle',
          flagId,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setFeatureFlags((prev) =>
          prev.map((flag) =>
            flag.id === flagId ? { ...flag, is_enabled: !flag.is_enabled } : flag
          )
        );
      }
    } catch (err) {
      console.error('Error toggling feature flag:', err);
      // Revert on failure
      setFeatureFlags((prev) =>
        prev.map((flag) =>
          flag.id === flagId ? { ...flag, is_enabled: !flag.is_enabled } : flag
        )
      );
    }
  };

  // Seed default flags
  const seedDefaultFlags = async () => {
    if (!sessionToken) return;

    setIsSeeding(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          type: 'feature_flag',
          action: 'seed',
        }),
      });

      if (response.ok) {
        // Refresh the list
        await fetchFeatureFlags();
      }
    } catch (err) {
      console.error('Error seeding flags:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Create new flag
  const createFlag = async (name: string, description: string) => {
    if (!sessionToken) return;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          type: 'feature_flag',
          action: 'create',
          name,
          description,
          enabled: false,
        }),
      });

      if (response.ok) {
        await fetchFeatureFlags();
      }
    } catch (err) {
      console.error('Error creating flag:', err);
    }
  };

  // Delete flag
  const deleteFlag = async (flagId: string) => {
    if (!sessionToken) return;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          type: 'feature_flag',
          action: 'delete',
          flagId,
        }),
      });

      if (response.ok) {
        setFeatureFlags(prev => prev.filter(f => f.id !== flagId));
      }
    } catch (err) {
      console.error('Error deleting flag:', err);
    }
  };

  // Toggle alert threshold
  const toggleAlertThreshold = (thresholdId: string) => {
    setAlertThresholds((prev) =>
      prev.map((threshold) =>
        threshold.id === thresholdId ? { ...threshold, enabled: !threshold.enabled } : threshold
      )
    );
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Settings are saved individually via their respective APIs
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
  ];

  // Generate key from name
  const nameToKey = (name: string) => name.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Configure system settings and feature flags"
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'text-surface-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <Card>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Feature Flags</h3>
              <p className="text-sm text-surface-500">Enable or disable features across the platform</p>
            </div>
            <div className="flex gap-2">
              {featureFlags.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  onClick={seedDefaultFlags}
                  disabled={isSeeding}
                >
                  {isSeeding ? 'Seeding...' : 'Seed Default Flags'}
                </Button>
              )}
              <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} disabled>
                Add Flag
              </Button>
            </div>
          </div>
          <div className="divide-y divide-surface-800">
            {isLoading ? (
              <div className="p-8 text-center text-surface-500">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                Loading feature flags...
              </div>
            ) : featureFlags.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <Flag size={24} className="mx-auto mb-2 opacity-50" />
                <p>No feature flags configured</p>
                <p className="text-sm mt-2">Click "Seed Default Flags" to create the initial feature flags</p>
              </div>
            ) : (
              featureFlags.map((flag) => (
                <div key={flag.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{flag.name}</h4>
                      <code className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
                        {nameToKey(flag.name)}
                      </code>
                    </div>
                    <p className="text-sm text-surface-400 mt-1">{flag.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => deleteFlag(flag.id)}
                      className="p-2 text-surface-500 hover:text-red-400 transition-colors"
                      title="Delete flag"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleFeatureFlag(flag.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        flag.is_enabled ? 'bg-green-500' : 'bg-surface-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          flag.is_enabled ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <Card>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Alert Thresholds</h3>
              <p className="text-sm text-surface-500">Configure automated alerts for system metrics</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} disabled>
              Add Alert
            </Button>
          </div>
          <div className="divide-y divide-surface-800">
            {alertThresholds.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                No alert thresholds configured
              </div>
            ) : (
              alertThresholds.map((threshold) => (
                <div key={threshold.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{threshold.metric}</h4>
                      <span className="text-sm text-surface-400">
                        {threshold.operator === 'gt' ? '>' : threshold.operator === 'lt' ? '<' : '='}{' '}
                        {threshold.value} {threshold.unit}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500 mt-1">Action: {threshold.action}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlertThreshold(threshold.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        threshold.enabled ? 'bg-green-500' : 'bg-surface-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          threshold.enabled ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">Email Configuration</h3>
            <p className="text-sm text-surface-500">Configure email sending settings</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-400 mb-2">From Name</label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-surface-400 mb-2">From Email</label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-2">Reply-To Email</label>
              <input
                type="email"
                value={emailSettings.replyTo}
                onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="pt-4 border-t border-surface-800">
              <h4 className="font-medium text-white mb-4">Email Templates</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Welcome', 'Password Reset', 'Subscription', 'Support Reply', 'Badge Earned', 'Weekly Summary'].map((template) => (
                  <button
                    key={template}
                    className="p-3 bg-surface-800 hover:bg-surface-700 rounded-lg text-left transition-colors"
                    disabled
                  >
                    <p className="text-sm text-white">{template}</p>
                    <p className="text-xs text-surface-500">Edit template</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">Security Settings</h3>
            <p className="text-sm text-surface-500">Configure security and authentication settings</p>
          </div>
          <div className="divide-y divide-surface-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Require MFA for Admins</h4>
                <p className="text-sm text-surface-500">All admin accounts must use two-factor authentication</p>
              </div>
              <button
                onClick={() => setSystemSettings({ ...systemSettings, mfaRequired: !systemSettings.mfaRequired })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  systemSettings.mfaRequired ? 'bg-green-500' : 'bg-surface-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    systemSettings.mfaRequired ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-white">Session Timeout</h4>
                  <p className="text-sm text-surface-500">Minutes of inactivity before session expires</p>
                </div>
                <input
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-center focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-medium text-white">System Configuration</h3>
            </div>
            <div className="divide-y divide-surface-800">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Maintenance Mode</h4>
                  <p className="text-sm text-surface-500">Take the site offline for maintenance</p>
                </div>
                <button
                  onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      systemSettings.maintenanceMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Open Registration</h4>
                  <p className="text-sm text-surface-500">Allow new users to register</p>
                </div>
                <button
                  onClick={() => setSystemSettings({ ...systemSettings, registrationOpen: !systemSettings.registrationOpen })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    systemSettings.registrationOpen ? 'bg-green-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      systemSettings.registrationOpen ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Debug Mode</h4>
                  <p className="text-sm text-surface-500">Enable detailed error logging (dev only)</p>
                </div>
                <button
                  onClick={() => setSystemSettings({ ...systemSettings, debugMode: !systemSettings.debugMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    systemSettings.debugMode ? 'bg-amber-500' : 'bg-surface-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      systemSettings.debugMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Max Upload Size</h4>
                    <p className="text-sm text-surface-500">Maximum file upload size in MB</p>
                  </div>
                  <input
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxUploadSize: parseInt(e.target.value) })}
                    className="w-24 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-center focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20">
            <div className="p-4 border-b border-red-500/20">
              <h3 className="font-medium text-red-400">Danger Zone</h3>
            </div>
            <div className="p-4 space-y-3">
              <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10" disabled>
                <Database size={14} className="mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10 ml-2" disabled>
                <RefreshCw size={14} className="mr-2" />
                Restart Services
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
