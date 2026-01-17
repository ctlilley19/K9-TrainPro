'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconBuilder, ICON_REGISTRY } from '@/components/activities/IconBuilder';
import { useFacility, useUser } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Save,
  X,
  Star,
} from 'lucide-react';

interface ActivityType {
  id?: string;
  code: string;
  label: string;
  description?: string;
  iconName: string;
  color: string;
  bgColor?: string;
  glowColor?: string;
  maxMinutes: number;
  warningMinutes: number;
  sortOrder: number;
  showInQuickLog: boolean;
  isCustom: boolean;
  isBuiltIn: boolean;
  allowNotes?: boolean;
  allowBuddy?: boolean;
  trackLocation?: boolean;
}

type ViewMode = 'list' | 'create' | 'edit' | 'customize';

export default function ActivitiesSettingsPage() {
  const facility = useFacility();
  const user = useUser();
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    description: '',
    iconName: 'Star',
    color: '#6366f1',
    maxMinutes: 60,
    warningMinutes: 45,
    showInQuickLog: true,
    allowNotes: true,
    allowBuddy: false,
  });

  useEffect(() => {
    if (facility?.id) {
      fetchActivityTypes();
    }
  }, [facility?.id]);

  async function fetchActivityTypes() {
    if (!facility?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/activities/custom?facilityId=${facility.id}`);
      const data = await response.json();

      if (data.activityTypes) {
        setActivityTypes(data.activityTypes);
      }
    } catch (error) {
      console.error('Error fetching activity types:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateNew() {
    setFormData({
      code: '',
      label: '',
      description: '',
      iconName: 'Star',
      color: '#6366f1',
      maxMinutes: 60,
      warningMinutes: 45,
      showInQuickLog: true,
      allowNotes: true,
      allowBuddy: false,
    });
    setViewMode('create');
  }

  function handleEdit(activity: ActivityType) {
    setEditingActivity(activity);
    setFormData({
      code: activity.code,
      label: activity.label,
      description: activity.description || '',
      iconName: activity.iconName,
      color: activity.color,
      maxMinutes: activity.maxMinutes,
      warningMinutes: activity.warningMinutes,
      showInQuickLog: activity.showInQuickLog,
      allowNotes: activity.allowNotes ?? true,
      allowBuddy: activity.allowBuddy ?? false,
    });
    setViewMode(activity.isCustom ? 'edit' : 'customize');
  }

  async function handleSaveCustomActivity() {
    if (!facility?.id || !user?.id) return;

    setActionLoading('save');
    try {
      const method = viewMode === 'edit' ? 'PATCH' : 'POST';
      const url =
        viewMode === 'edit'
          ? `/api/activities/custom/${editingActivity?.id}`
          : '/api/activities/custom';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          userId: user.id,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchActivityTypes();
        setViewMode('list');
        setEditingActivity(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveOverride() {
    if (!facility?.id || !editingActivity) return;

    setActionLoading('save');
    try {
      const response = await fetch('/api/activities/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          activityType: editingActivity.code,
          customLabel: formData.label !== editingActivity.label ? formData.label : null,
          customIcon: formData.iconName !== editingActivity.iconName ? formData.iconName : null,
          customColor: formData.color !== editingActivity.color ? formData.color : null,
          customMaxMinutes: formData.maxMinutes !== editingActivity.maxMinutes ? formData.maxMinutes : null,
          customWarningMinutes: formData.warningMinutes !== editingActivity.warningMinutes ? formData.warningMinutes : null,
          showInQuickLog: formData.showInQuickLog,
        }),
      });

      if (response.ok) {
        await fetchActivityTypes();
        setViewMode('list');
        setEditingActivity(null);
      }
    } catch (error) {
      console.error('Error saving override:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetOverride(activityCode: string) {
    if (!facility?.id) return;
    if (!confirm('Reset this activity to default settings?')) return;

    setActionLoading(activityCode);
    try {
      await fetch(
        `/api/activities/overrides?facilityId=${facility.id}&activityType=${activityCode}`,
        { method: 'DELETE' }
      );
      await fetchActivityTypes();
    } catch (error) {
      console.error('Error resetting override:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteCustom(activityId: string) {
    if (!confirm('Delete this custom activity? This cannot be undone.')) return;

    setActionLoading(activityId);
    try {
      const response = await fetch(`/api/activities/custom/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchActivityTypes();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    } finally {
      setActionLoading(null);
    }
  }

  function handleIconSave(iconName: string, color: string, maxMinutes?: number, warningMinutes?: number) {
    setFormData((prev) => ({
      ...prev,
      iconName,
      color,
      maxMinutes: maxMinutes ?? prev.maxMinutes,
      warningMinutes: warningMinutes ?? prev.warningMinutes,
    }));
  }

  // Helper to render icon
  function renderIcon(iconName: string, color: string, size = 20) {
    const IconComponent = ICON_REGISTRY[iconName]?.icon;
    if (!IconComponent) return <Star size={size} style={{ color }} />;
    return <IconComponent size={size} style={{ color }} />;
  }

  // Create/Edit Form View
  if (viewMode === 'create' || viewMode === 'edit' || viewMode === 'customize') {
    const isCustomize = viewMode === 'customize';
    const title = viewMode === 'create'
      ? 'Create Custom Activity'
      : viewMode === 'edit'
      ? 'Edit Custom Activity'
      : `Customize "${editingActivity?.label}"`;

    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setViewMode('list');
              setEditingActivity(null);
            }}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Activities
          </Button>
        </div>

        <PageHeader title={title} />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Activity Details" />
              <CardContent>
                <div className="space-y-4">
                  {!isCustomize && (
                    <Input
                      label="Code (unique identifier)"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                        }))
                      }
                      placeholder="e.g., agility_training"
                      disabled={viewMode === 'edit'}
                      hint="Lowercase with underscores, cannot be changed later"
                    />
                  )}

                  <Input
                    label="Display Name"
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Agility Training"
                  />

                  {!isCustomize && (
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Brief description of this activity..."
                        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Timer Settings" />
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Max Duration (minutes)"
                      type="number"
                      value={formData.maxMinutes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxMinutes: parseInt(e.target.value) || 60,
                        }))
                      }
                      min={1}
                      max={480}
                    />
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                      <AlertTriangle size={12} />
                      <span>Timer turns red</span>
                    </div>
                  </div>
                  <div>
                    <Input
                      label="Warning Duration (minutes)"
                      type="number"
                      value={formData.warningMinutes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          warningMinutes: parseInt(e.target.value) || 45,
                        }))
                      }
                      min={1}
                      max={formData.maxMinutes - 1}
                    />
                    <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                      <Clock size={12} />
                      <span>Timer turns yellow</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isCustomize && (
              <Card>
                <CardHeader title="Options" />
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showInQuickLog}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showInQuickLog: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-brand-500"
                      />
                      <span className="text-sm text-surface-300">Show in Quick Log menu</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowNotes}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, allowNotes: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-brand-500"
                      />
                      <span className="text-sm text-surface-300">Allow notes on this activity</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowBuddy}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, allowBuddy: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-brand-500"
                      />
                      <span className="text-sm text-surface-300">Allow buddy pairing</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Icon Builder */}
          <div>
            <Card>
              <CardHeader title="Icon & Color" />
              <CardContent>
                <IconBuilder
                  initialIcon={formData.iconName}
                  initialColor={formData.color}
                  onSave={handleIconSave}
                  onCancel={() => {}}
                  showTimerConfig={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setViewMode('list');
              setEditingActivity(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={isCustomize ? handleSaveOverride : handleSaveCustomActivity}
            isLoading={actionLoading === 'save'}
            leftIcon={<Save size={16} />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div>
      <PageHeader
        title="Activity Types"
        description="Customize activity icons and create custom activity types"
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Activities' }]}
        action={
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleCreateNew}>
            New Activity
          </Button>
        }
      />

      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Built-in Activities */}
          <Card>
            <CardHeader
              title="Built-in Activities"
              description="Customize icons and colors for default activity types"
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activityTypes
                  .filter((a) => a.isBuiltIn)
                  .map((activity) => (
                    <div
                      key={activity.code}
                      className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl hover:bg-surface-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: activity.color + '30' }}
                        >
                          {renderIcon(activity.iconName, activity.color)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{activity.label}</p>
                          <p className="text-xs text-surface-500">
                            {activity.maxMinutes} min max • {activity.warningMinutes} min warning
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!activity.showInQuickLog && (
                          <span title="Hidden from Quick Log">
                            <EyeOff size={14} className="text-surface-500" />
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          leftIcon={<Edit2 size={14} />}
                        >
                          Customize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetOverride(activity.code)}
                          isLoading={actionLoading === activity.code}
                          leftIcon={<RotateCcw size={14} />}
                          title="Reset to default"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Activities */}
          <Card>
            <CardHeader
              title="Custom Activities"
              description="Your facility's custom activity types"
            />
            <CardContent>
              {activityTypes.filter((a) => a.isCustom).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activityTypes
                    .filter((a) => a.isCustom)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl hover:bg-surface-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: activity.color + '30' }}
                          >
                            {renderIcon(activity.iconName, activity.color)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{activity.label}</p>
                              <span className="px-1.5 py-0.5 bg-brand-500/20 text-brand-400 text-[10px] rounded">
                                Custom
                              </span>
                            </div>
                            <p className="text-xs text-surface-500">
                              {activity.maxMinutes} min max • {activity.code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(activity)}
                            leftIcon={<Edit2 size={14} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustom(activity.id!)}
                            isLoading={actionLoading === activity.id}
                            leftIcon={<Trash2 size={14} />}
                            className="text-red-400 hover:text-red-300"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star size={32} className="mx-auto text-surface-600 mb-2" />
                  <p className="text-surface-400 mb-4">No custom activities yet</p>
                  <Button variant="outline" size="sm" onClick={handleCreateNew} leftIcon={<Plus size={14} />}>
                    Create Your First
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
