// Live Status Feed Service
// Provides real-time status updates for pet parents

import { supabase, isDemo, getDemoFacilityId } from './client';
import type {
  StatusFeedItem,
  StatusFeedItemWithDetails,
  FeedItemReaction,
  FeedItemComment,
  FeedItemCommentWithUser,
  StatusPreset,
  StatusUpdateType,
  DogMood,
} from '@/types/database';

// ============================================================================
// Demo Data
// ============================================================================

const demoStatusFeedItems: StatusFeedItem[] = [
  {
    id: 'feed-1',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'arrival',
    title: 'Max has arrived!',
    description: 'Max arrived at the facility this morning, excited and ready for training!',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'excited',
    energy_level: 5,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-2',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'activity_start',
    title: 'Obedience training session started',
    description: 'Working on sit, stay, and recall commands',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'happy',
    energy_level: 4,
    activity_id: 'demo-activity-1',
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-3',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'photo',
    title: 'Training time!',
    description: 'Max is doing amazing with his recall training today!',
    media_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    media_type: 'image',
    thumbnail_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    mood: 'happy',
    energy_level: 4,
    activity_id: 'demo-activity-1',
    is_visible_to_parents: true,
    is_highlighted: true,
    created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-4',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'activity_end',
    title: 'Obedience training completed!',
    description: 'Great session! Max showed excellent progress on his recall.',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'happy',
    energy_level: 3,
    activity_id: 'demo-activity-1',
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-5',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'meal',
    title: 'Lunch time!',
    description: 'Max enjoyed his lunch and ate everything.',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'happy',
    energy_level: 3,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-6',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'rest',
    title: 'Nap time',
    description: 'Max is resting after a productive morning.',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'calm',
    energy_level: 2,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-7',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-1',
    created_by: 'demo-user-1',
    update_type: 'play',
    title: 'Playtime with friends!',
    description: 'Max is having fun during supervised group play.',
    media_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    media_type: 'image',
    thumbnail_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    mood: 'playful',
    energy_level: 5,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: true,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  // Bella's feed
  {
    id: 'feed-8',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-2',
    created_by: 'demo-user-1',
    update_type: 'arrival',
    title: 'Bella has arrived!',
    description: 'Bella is here for her day training session.',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'happy',
    energy_level: 4,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'feed-9',
    facility_id: getDemoFacilityId(),
    dog_id: 'demo-dog-2',
    created_by: 'demo-user-1',
    update_type: 'milestone',
    title: 'Bella mastered "Stay"!',
    description: 'Big milestone today - Bella successfully held a 30-second stay! 🎉',
    media_url: null,
    media_type: null,
    thumbnail_url: null,
    mood: 'excited',
    energy_level: 4,
    activity_id: null,
    is_visible_to_parents: true,
    is_highlighted: true,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const demoReactions: FeedItemReaction[] = [
  {
    id: 'reaction-1',
    feed_item_id: 'feed-3',
    user_id: 'demo-parent-1',
    reaction: '❤️',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'reaction-2',
    feed_item_id: 'feed-7',
    user_id: 'demo-parent-1',
    reaction: '🎉',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'reaction-3',
    feed_item_id: 'feed-9',
    user_id: 'demo-parent-2',
    reaction: '🎉',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const demoComments: FeedItemCommentWithUser[] = [
  {
    id: 'comment-1',
    feed_item_id: 'feed-3',
    user_id: 'demo-parent-1',
    content: 'He looks so happy! Thank you for sharing!',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'comment-2',
    feed_item_id: 'feed-9',
    user_id: 'demo-parent-2',
    content: 'Amazing! We\'ve been working so hard on this at home too!',
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    user: { name: 'Michael Chen', avatar_url: null },
  },
];

const demoPresets: StatusPreset[] = [
  { id: 'preset-1', facility_id: null, update_type: 'arrival', title: 'Arrived safely!', description: 'Your pup has arrived and is ready for a great day!', icon: '🏠', is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'preset-2', facility_id: null, update_type: 'departure', title: 'Heading home!', description: 'Time to go home! Had an amazing day!', icon: '🚗', is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'preset-3', facility_id: null, update_type: 'meal', title: 'Meal time!', description: 'Enjoying a delicious meal', icon: '🍽️', is_active: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'preset-4', facility_id: null, update_type: 'potty', title: 'Potty break', description: 'Successfully went potty outside', icon: '✅', is_active: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: 'preset-5', facility_id: null, update_type: 'rest', title: 'Nap time', description: 'Taking a well-deserved rest', icon: '😴', is_active: true, sort_order: 5, created_at: new Date().toISOString() },
  { id: 'preset-6', facility_id: null, update_type: 'play', title: 'Play time!', description: 'Having a blast playing!', icon: '🎾', is_active: true, sort_order: 6, created_at: new Date().toISOString() },
  { id: 'preset-7', facility_id: null, update_type: 'activity_start', title: 'Training session starting', description: 'Beginning a training session', icon: '🎯', is_active: true, sort_order: 7, created_at: new Date().toISOString() },
  { id: 'preset-8', facility_id: null, update_type: 'activity_end', title: 'Training complete!', description: 'Finished training session successfully', icon: '🏆', is_active: true, sort_order: 8, created_at: new Date().toISOString() },
  { id: 'preset-9', facility_id: null, update_type: 'health_check', title: 'Health check', description: 'Routine health check completed', icon: '💊', is_active: true, sort_order: 9, created_at: new Date().toISOString() },
];

// ============================================================================
// Status Feed Service
// ============================================================================

export const statusFeedService = {
  // Get feed items for a dog
  async getDogFeed(
    dogId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<StatusFeedItem[]> {
    if (isDemo()) {
      const items = demoStatusFeedItems
        .filter(item => item.dog_id === dogId && item.is_visible_to_parents)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const start = options?.offset || 0;
      const end = start + (options?.limit || 50);
      return items.slice(start, end);
    }

    let query = supabase
      .from('status_feed_items')
      .select('*')
      .eq('dog_id', dogId)
      .eq('is_visible_to_parents', true)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get feed with details (including reactions and comments)
  async getDogFeedWithDetails(
    dogId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<StatusFeedItemWithDetails[]> {
    if (isDemo()) {
      const items = demoStatusFeedItems
        .filter(item => item.dog_id === dogId && item.is_visible_to_parents)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const start = options?.offset || 0;
      const end = start + (options?.limit || 50);

      return items.slice(start, end).map(item => ({
        ...item,
        dog: {
          id: dogId,
          family_id: 'demo-family-1',
          name: dogId === 'demo-dog-1' ? 'Max' : 'Bella',
          breed: dogId === 'demo-dog-1' ? 'Golden Retriever' : 'Labrador',
          date_of_birth: '2022-03-15',
          weight: 65,
          gender: 'male' as const,
          color: 'Golden',
          photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
          microchip_id: null,
          medical_notes: null,
          behavior_notes: null,
          feeding_instructions: null,
          medications: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        created_by_user: { name: 'John Trainer', avatar_url: null },
        reactions: demoReactions.filter(r => r.feed_item_id === item.id),
        comments: demoComments.filter(c => c.feed_item_id === item.id),
      }));
    }

    const { data, error } = await supabase
      .from('status_feed_items')
      .select(`
        *,
        dog:dogs(*),
        created_by_user:users!created_by(name, avatar_url),
        reactions:feed_item_reactions(*),
        comments:feed_item_comments(*, user:users(name, avatar_url))
      `)
      .eq('dog_id', dogId)
      .eq('is_visible_to_parents', true)
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50);

    if (error) throw error;
    return data || [];
  },

  // Get facility feed (for trainers)
  async getFacilityFeed(
    facilityId: string,
    options?: { limit?: number; dogId?: string; updateType?: StatusUpdateType }
  ): Promise<StatusFeedItem[]> {
    if (isDemo()) {
      let items = demoStatusFeedItems
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (options?.dogId) {
        items = items.filter(item => item.dog_id === options.dogId);
      }
      if (options?.updateType) {
        items = items.filter(item => item.update_type === options.updateType);
      }

      return items.slice(0, options?.limit || 50);
    }

    let query = supabase
      .from('status_feed_items')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (options?.dogId) {
      query = query.eq('dog_id', options.dogId);
    }
    if (options?.updateType) {
      query = query.eq('update_type', options.updateType);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Create a status update
  async createStatusUpdate(data: {
    dog_id: string;
    update_type: StatusUpdateType;
    title: string;
    description?: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    thumbnail_url?: string;
    mood?: DogMood;
    energy_level?: number;
    activity_id?: string;
    is_visible_to_parents?: boolean;
    is_highlighted?: boolean;
  }): Promise<StatusFeedItem> {
    if (isDemo()) {
      const newItem: StatusFeedItem = {
        id: `feed-${Date.now()}`,
        facility_id: getDemoFacilityId(),
        dog_id: data.dog_id,
        created_by: 'demo-user-1',
        update_type: data.update_type,
        title: data.title,
        description: data.description || null,
        media_url: data.media_url || null,
        media_type: data.media_type || null,
        thumbnail_url: data.thumbnail_url || null,
        mood: data.mood || null,
        energy_level: data.energy_level || null,
        activity_id: data.activity_id || null,
        is_visible_to_parents: data.is_visible_to_parents ?? true,
        is_highlighted: data.is_highlighted ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoStatusFeedItems.unshift(newItem);
      return newItem;
    }

    const { data: result, error } = await supabase
      .from('status_feed_items')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Create quick update from preset
  async createFromPreset(
    presetId: string,
    dogId: string,
    customDescription?: string
  ): Promise<StatusFeedItem> {
    const preset = demoPresets.find(p => p.id === presetId);
    if (!preset) throw new Error('Preset not found');

    return this.createStatusUpdate({
      dog_id: dogId,
      update_type: preset.update_type,
      title: preset.title,
      description: customDescription || preset.description || undefined,
    });
  },

  // Update status item
  async updateStatusItem(
    id: string,
    data: Partial<Omit<StatusFeedItem, 'id' | 'created_at'>>
  ): Promise<StatusFeedItem> {
    if (isDemo()) {
      const index = demoStatusFeedItems.findIndex(item => item.id === id);
      if (index === -1) throw new Error('Feed item not found');
      demoStatusFeedItems[index] = {
        ...demoStatusFeedItems[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return demoStatusFeedItems[index];
    }

    const { data: result, error } = await supabase
      .from('status_feed_items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Delete status item
  async deleteStatusItem(id: string): Promise<void> {
    if (isDemo()) {
      const index = demoStatusFeedItems.findIndex(item => item.id === id);
      if (index !== -1) {
        demoStatusFeedItems.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('status_feed_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get presets
  async getPresets(): Promise<StatusPreset[]> {
    if (isDemo()) {
      return demoPresets.filter(p => p.is_active);
    }

    const { data, error } = await supabase
      .from('status_presets')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// Feed Reactions Service
// ============================================================================

export const feedReactionsService = {
  // Add reaction
  async addReaction(feedItemId: string, reaction: string): Promise<FeedItemReaction> {
    if (isDemo()) {
      const newReaction: FeedItemReaction = {
        id: `reaction-${Date.now()}`,
        feed_item_id: feedItemId,
        user_id: 'demo-parent-1',
        reaction,
        created_at: new Date().toISOString(),
      };
      demoReactions.push(newReaction);
      return newReaction;
    }

    const { data, error } = await supabase
      .from('feed_item_reactions')
      .insert({ feed_item_id: feedItemId, reaction })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove reaction
  async removeReaction(feedItemId: string, reaction: string): Promise<void> {
    if (isDemo()) {
      const index = demoReactions.findIndex(
        r => r.feed_item_id === feedItemId && r.reaction === reaction
      );
      if (index !== -1) {
        demoReactions.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('feed_item_reactions')
      .delete()
      .eq('feed_item_id', feedItemId)
      .eq('reaction', reaction);

    if (error) throw error;
  },

  // Get reactions for an item
  async getReactions(feedItemId: string): Promise<FeedItemReaction[]> {
    if (isDemo()) {
      return demoReactions.filter(r => r.feed_item_id === feedItemId);
    }

    const { data, error } = await supabase
      .from('feed_item_reactions')
      .select('*')
      .eq('feed_item_id', feedItemId);

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// Feed Comments Service
// ============================================================================

export const feedCommentsService = {
  // Add comment
  async addComment(feedItemId: string, content: string): Promise<FeedItemComment> {
    if (isDemo()) {
      const newComment: FeedItemComment = {
        id: `comment-${Date.now()}`,
        feed_item_id: feedItemId,
        user_id: 'demo-parent-1',
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newComment;
    }

    const { data, error } = await supabase
      .from('feed_item_comments')
      .insert({ feed_item_id: feedItemId, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update comment
  async updateComment(id: string, content: string): Promise<FeedItemComment> {
    if (isDemo()) {
      const comment = demoComments.find(c => c.id === id);
      if (!comment) throw new Error('Comment not found');
      comment.content = content;
      comment.updated_at = new Date().toISOString();
      return comment;
    }

    const { data, error } = await supabase
      .from('feed_item_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    if (isDemo()) {
      const index = demoComments.findIndex(c => c.id === id);
      if (index !== -1) {
        demoComments.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('feed_item_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get comments for an item
  async getComments(feedItemId: string): Promise<FeedItemCommentWithUser[]> {
    if (isDemo()) {
      return demoComments.filter(c => c.feed_item_id === feedItemId);
    }

    const { data, error } = await supabase
      .from('feed_item_comments')
      .select('*, user:users(name, avatar_url)')
      .eq('feed_item_id', feedItemId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },
};
