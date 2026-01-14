'use client';

import { useState } from 'react';
import {
  Activity,
  Heart,
  MessageCircle,
  Clock,
  Dog,
  Home,
  Car,
  Utensils,
  Moon,
  Zap,
  Camera,
  Video,
  Trophy,
  Stethoscope,
  RefreshCw,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Smile,
} from 'lucide-react';
import { usePetParentStatusFeed, usePetParentDogs, useAddFeedReaction, useRemoveFeedReaction, useAddFeedComment } from '@/hooks';
import type { StatusFeedItemWithDetails, StatusUpdateType, DogMood } from '@/types/database';

const updateTypeConfig: Record<StatusUpdateType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  arrival: { icon: <Home size={16} />, color: 'text-green-600', bgColor: 'bg-green-100' },
  departure: { icon: <Car size={16} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  activity_start: { icon: <Zap size={16} />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  activity_end: { icon: <Trophy size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  meal: { icon: <Utensils size={16} />, color: 'text-red-600', bgColor: 'bg-red-100' },
  potty: { icon: <Activity size={16} />, color: 'text-green-600', bgColor: 'bg-green-100' },
  rest: { icon: <Moon size={16} />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  play: { icon: <Dog size={16} />, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  photo: { icon: <Camera size={16} />, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  video: { icon: <Video size={16} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  note: { icon: <MessageCircle size={16} />, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  milestone: { icon: <Trophy size={16} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  health_check: { icon: <Stethoscope size={16} />, color: 'text-teal-600', bgColor: 'bg-teal-100' },
};

const moodEmojis: Record<DogMood, string> = {
  excited: '🤩',
  happy: '😊',
  calm: '😌',
  tired: '😴',
  anxious: '😰',
  playful: '🎾',
};

const moodLabels: Record<DogMood, string> = {
  excited: 'Excited',
  happy: 'Happy',
  calm: 'Calm',
  tired: 'Tired',
  anxious: 'Anxious',
  playful: 'Playful',
};

const reactionOptions = ['❤️', '🎉', '👍', '😍', '🥰', '🙌'];

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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeedItem({
  item,
  onReact,
  onComment,
}: {
  item: StatusFeedItemWithDetails;
  onReact: (reaction: string) => void;
  onComment: (content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const config = updateTypeConfig[item.update_type];

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Dog Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {item.dog.photo_url ? (
              <img src={item.dog.photo_url} alt={item.dog.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Dog className="text-primary" size={24} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{item.dog.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${config.bgColor} ${config.color}`}>
                {config.icon}
                {item.update_type.replace('_', ' ')}
              </span>
              {item.is_highlighted && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
                  Highlight
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
              <Clock size={12} />
              {formatTimeAgo(item.created_at)}
              {item.created_by_user && (
                <span className="text-gray-400">
                  {' '}
                  by {item.created_by_user.name}
                </span>
              )}
            </p>
          </div>

          {/* Mood */}
          {item.mood && (
            <div className="text-right">
              <span className="text-2xl">{moodEmojis[item.mood]}</span>
              <p className="text-xs text-gray-500">{moodLabels[item.mood]}</p>
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div className="mt-3">
          <h3 className="font-medium text-gray-900">{item.title}</h3>
          {item.description && (
            <p className="text-gray-600 mt-1">{item.description}</p>
          )}
        </div>

        {/* Energy Level */}
        {item.energy_level && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Energy:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-5 h-2 rounded-full ${
                    level <= item.energy_level!
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      {item.media_url && (
        <div className="px-4 pb-4">
          {item.media_type === 'image' ? (
            <img
              src={item.media_url}
              alt={item.title}
              className="w-full h-auto rounded-lg max-h-96 object-cover"
            />
          ) : item.media_type === 'video' ? (
            <video
              src={item.media_url}
              controls
              className="w-full rounded-lg max-h-96"
            />
          ) : null}
        </div>
      )}

      {/* Reactions Display */}
      {item.reactions && item.reactions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(
              item.reactions.reduce((acc, r) => {
                acc[r.reaction] = (acc[r.reaction] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([reaction, count]) => (
              <span
                key={reaction}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm"
              >
                {reaction} {count > 1 && count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Heart size={18} />
            <span className="text-sm">React</span>
          </button>

          {/* Reactions Picker */}
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex items-center gap-1">
              {reactionOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowReactions(false);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-xl transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm">
            Comment
            {item.comments && item.comments.length > 0 && ` (${item.comments.length})`}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Existing Comments */}
          {item.comments && item.comments.length > 0 && (
            <div className="py-3 space-y-3">
              {item.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Smile size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(comment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PetParentFeedPage() {
  const { data: dogs = [] } = usePetParentDogs();
  const dogIds = dogs.map((d) => d.id);
  const { data: feedItems = [], isLoading, refetch, isRefetching } = usePetParentStatusFeed(dogIds);

  const addReaction = useAddFeedReaction();
  const removeReaction = useRemoveFeedReaction();
  const addComment = useAddFeedComment();

  const handleReact = (feedItemId: string, reaction: string) => {
    addReaction.mutate({ feedItemId, reaction });
  };

  const handleComment = (feedItemId: string, content: string) => {
    addComment.mutate({ feedItemId, content });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Feed</h1>
          <p className="text-gray-600 mt-1">
            Real-time updates about your pup's day
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

      {/* Dog Filter (if multiple dogs) */}
      {dogs.length > 1 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium whitespace-nowrap">
            All Dogs
          </button>
          {dogs.map((dog) => (
            <button
              key={dog.id}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {dog.name}
            </button>
          ))}
        </div>
      )}

      {/* Feed Items */}
      {feedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Activity className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No updates yet</h3>
          <p className="mt-2 text-gray-600">
            Updates about your dog's activities will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <FeedItem
              key={item.id}
              item={item}
              onReact={(reaction) => handleReact(item.id, reaction)}
              onComment={(content) => handleComment(item.id, content)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {feedItems.length >= 50 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
