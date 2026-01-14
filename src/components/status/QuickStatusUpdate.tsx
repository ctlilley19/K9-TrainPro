'use client';

import { useState } from 'react';
import {
  Send,
  Camera,
  X,
  Home,
  Car,
  Utensils,
  Moon,
  Zap,
  Trophy,
  Stethoscope,
  Activity,
  Dog,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { useStatusPresets, useCreateStatusUpdate, useCreateStatusFromPreset } from '@/hooks';
import type { StatusUpdateType, DogMood } from '@/types/database';

const presetIcons: Record<string, React.ReactNode> = {
  arrival: <Home size={20} />,
  departure: <Car size={20} />,
  meal: <Utensils size={20} />,
  potty: <Activity size={20} />,
  rest: <Moon size={20} />,
  play: <Dog size={20} />,
  activity_start: <Zap size={20} />,
  activity_end: <Trophy size={20} />,
  health_check: <Stethoscope size={20} />,
};

const moodOptions: { value: DogMood; emoji: string; label: string }[] = [
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'playful', emoji: '🎾', label: 'Playful' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
];

interface QuickStatusUpdateProps {
  dogId: string;
  dogName: string;
  onClose?: () => void;
  compact?: boolean;
}

export function QuickStatusUpdate({ dogId, dogName, onClose, compact = false }: QuickStatusUpdateProps) {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedType, setSelectedType] = useState<StatusUpdateType>('note');
  const [selectedMood, setSelectedMood] = useState<DogMood | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: presets = [] } = useStatusPresets();
  const createStatusUpdate = useCreateStatusUpdate();
  const createFromPreset = useCreateStatusFromPreset();

  const handlePresetClick = async (presetId: string) => {
    setIsSubmitting(true);
    try {
      await createFromPreset.mutateAsync({ presetId, dogId });
      onClose?.();
    } catch (error) {
      console.error('Failed to create status update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createStatusUpdate.mutateAsync({
        dog_id: dogId,
        update_type: selectedType,
        title: customTitle,
        description: customDescription || undefined,
        mood: selectedMood || undefined,
        energy_level: energyLevel,
      });
      setCustomTitle('');
      setCustomDescription('');
      setSelectedMood(null);
      onClose?.();
    } catch (error) {
      console.error('Failed to create status update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Update for {dogName}</h3>
        <div className="grid grid-cols-3 gap-2">
          {presets.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-xs text-gray-600 text-center">{preset.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Post Status Update for {dogName}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode('presets')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'presets'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Presets
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'custom'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Custom Update
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {mode === 'presets' ? (
          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <span className="text-3xl">{preset.icon}</span>
                <span className="font-medium text-gray-900 text-sm text-center">{preset.title}</span>
                {preset.description && (
                  <span className="text-xs text-gray-500 text-center line-clamp-2">{preset.description}</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Update Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'note' as StatusUpdateType, label: 'Note' },
                  { value: 'photo' as StatusUpdateType, label: 'Photo' },
                  { value: 'milestone' as StatusUpdateType, label: 'Milestone' },
                  { value: 'play' as StatusUpdateType, label: 'Play' },
                  { value: 'rest' as StatusUpdateType, label: 'Rest' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Great training session!"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                placeholder="Add more details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Mood</label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedMood === mood.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level: {energyLevel}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCustomSubmit}
              disabled={!customTitle.trim() || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
              {isSubmitting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
