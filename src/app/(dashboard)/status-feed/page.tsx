'use client';

import { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Clock,
  Dog,
  Home,
  Car,
  Utensils,
  Moon,
  Zap,
  Trophy,
  Stethoscope,
  Camera,
  Video,
  MessageCircle,
  Eye,
  EyeOff,
  Star,
  Trash2,
  RefreshCw,
  X,
  Heart,
} from 'lucide-react';
import { useFacilityStatusFeed, useStatusPresets, useCreateStatusUpdate, useDeleteStatusItem, useDogs } from '@/hooks';
import { QuickStatusUpdate } from '@/components/status';
import type { StatusFeedItem, StatusUpdateType, DogMood } from '@/types/database';

const updateTypeConfig: Record<StatusUpdateType, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  arrival: { icon: <Home size={16} />, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Arrival' },
  departure: { icon: <Car size={16} />, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Departure' },
  activity_start: { icon: <Zap size={16} />, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Activity Start' },
  activity_end: { icon: <Trophy size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Activity End' },
  meal: { icon: <Utensils size={16} />, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Meal' },
  potty: { icon: <Activity size={16} />, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Potty' },
  rest: { icon: <Moon size={16} />, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Rest' },
  play: { icon: <Dog size={16} />, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Play' },
  photo: { icon: <Camera size={16} />, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'Photo' },
  video: { icon: <Video size={16} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Video' },
  note: { icon: <MessageCircle size={16} />, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Note' },
  milestone: { icon: <Trophy size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Milestone' },
  health_check: { icon: <Stethoscope size={16} />, color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'Health Check' },
};

const moodEmojis: Record<DogMood, string> = {
  excited: '🤩',
  happy: '😊',
  calm: '😌',
  tired: '😴',
  anxious: '😰',
  playful: '🎾',
};

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function StatusFeedPage() {
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<StatusUpdateType | null>(null);
  const [showNewUpdateModal, setShowNewUpdateModal] = useState(false);
  const [selectedDogForUpdate, setSelectedDogForUpdate] = useState<{ id: string; name: string } | null>(null);

  const { data: dogs = [] } = useDogs();
  const { data: feedItems = [], isLoading, refetch, isRefetching } = useFacilityStatusFeed({
    dogId: selectedDog || undefined,
    updateType: selectedType || undefined,
    limit: 100,
  });

  const deleteStatus = useDeleteStatusItem();

  const handleDelete = async (item: StatusFeedItem) => {
    if (confirm('Delete this status update?')) {
      await deleteStatus.mutateAsync({ id: item.id, dogId: item.dog_id });
    }
  };

  const openUpdateModal = (dog: { id: string; name: string }) => {
    setSelectedDogForUpdate(dog);
    setShowNewUpdateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Feed</h1>
          <p className="text-gray-600 mt-1">
            Post updates for pet parents to see in real-time
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Post Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Post Update</h2>
        <p className="text-sm text-gray-600 mb-4">Select a dog to post a quick status update</p>
        <div className="flex flex-wrap gap-2">
          {dogs.slice(0, 10).map((dog) => (
            <button
              key={dog.id}
              onClick={() => openUpdateModal({ id: dog.id, name: dog.name })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {dog.photo_url ? (
                  <img src={dog.photo_url} alt={dog.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Dog size={16} className="text-primary" />
                )}
              </div>
              <span className="font-medium">{dog.name}</span>
              <Plus size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Dog Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Dog</label>
            <select
              value={selectedDog || ''}
              onChange={(e) => setSelectedDog(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Dogs</option>
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>{dog.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType((e.target.value as StatusUpdateType) || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Types</option>
              {Object.entries(updateTypeConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      ) : feedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Activity className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No status updates yet</h3>
          <p className="mt-2 text-gray-600">
            Post your first status update to keep pet parents informed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => {
            const config = updateTypeConfig[item.update_type];
            const dogInfo = dogs.find(d => d.id === item.dog_id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Dog Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {dogInfo?.photo_url ? (
                        <img src={dogInfo.photo_url} alt={dogInfo.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Dog className="text-primary" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{dogInfo?.name || 'Unknown Dog'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${config.bgColor} ${config.color}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        {item.is_highlighted && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Star size={12} />
                            Highlight
                          </span>
                        )}
                        {!item.is_visible_to_parents && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                            <EyeOff size={12} />
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {formatTimeAgo(item.created_at)}
                      </p>
                    </div>

                    {/* Mood & Energy */}
                    {(item.mood || item.energy_level) && (
                      <div className="text-right">
                        {item.mood && (
                          <span className="text-2xl">{moodEmojis[item.mood]}</span>
                        )}
                        {item.energy_level && (
                          <div className="flex gap-0.5 mt-1 justify-end">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-3 h-1.5 rounded-full ${
                                  level <= item.energy_level!
                                    ? 'bg-green-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Media Preview */}
                {item.media_url && (
                  <div className="px-4 pb-4">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-auto rounded-lg max-h-64 object-cover"
                      />
                    ) : item.media_type === 'video' ? (
                      <video
                        src={item.media_url}
                        controls
                        className="w-full rounded-lg max-h-64"
                      />
                    ) : null}
                  </div>
                )}

                {/* Visibility Notice */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    {item.is_visible_to_parents ? (
                      <>
                        <Eye size={14} />
                        Visible to pet parents
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        Hidden from pet parents
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Update Modal */}
      {showNewUpdateModal && selectedDogForUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <QuickStatusUpdate
              dogId={selectedDogForUpdate.id}
              dogName={selectedDogForUpdate.name}
              onClose={() => {
                setShowNewUpdateModal(false);
                setSelectedDogForUpdate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
