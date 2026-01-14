// Video Library Service Layer for K9 TrainPro

import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_FACILITY_ID } from '@/lib/demo-config';
import type {
  TrainingVideo,
  TrainingVideoWithDetails,
  VideoFolder,
  VideoFolderWithVideos,
  VideoPlaylist,
  VideoPlaylistWithVideos,
  VideoShare,
  VideoCategory,
  VideoVisibility,
} from '@/types/database';

// ============================================================================
// Demo Data
// ============================================================================

const DEMO_VIDEOS: TrainingVideoWithDetails[] = [
  {
    id: 'video-1',
    facility_id: DEMO_FACILITY_ID,
    title: 'Basic Sit Command',
    description: 'Step-by-step guide to teaching your dog the sit command using positive reinforcement.',
    category: 'obedience',
    tags: ['sit', 'beginner', 'obedience'],
    video_url: 'https://example.com/videos/sit-command.mp4',
    thumbnail_url: null,
    duration_seconds: 180,
    file_size_bytes: 25000000,
    visibility: 'trainers',
    is_featured: true,
    view_count: 45,
    folder_id: 'folder-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uploaded_by: 'demo-user',
    folder: null,
    uploader: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'video-2',
    facility_id: DEMO_FACILITY_ID,
    title: 'Loose Leash Walking',
    description: 'How to teach your dog to walk nicely on a leash without pulling.',
    category: 'leash',
    tags: ['leash', 'walking', 'intermediate'],
    video_url: 'https://example.com/videos/leash-walking.mp4',
    thumbnail_url: null,
    duration_seconds: 420,
    file_size_bytes: 55000000,
    visibility: 'clients',
    is_featured: true,
    view_count: 120,
    folder_id: 'folder-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uploaded_by: 'demo-user',
    folder: null,
    uploader: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'video-3',
    facility_id: DEMO_FACILITY_ID,
    title: 'Recall Training Basics',
    description: 'Foundation training for a reliable recall command.',
    category: 'recall',
    tags: ['recall', 'come', 'safety'],
    video_url: 'https://example.com/videos/recall-basics.mp4',
    thumbnail_url: null,
    duration_seconds: 300,
    file_size_bytes: 40000000,
    visibility: 'trainers',
    is_featured: false,
    view_count: 32,
    folder_id: 'folder-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uploaded_by: 'demo-user',
    folder: null,
    uploader: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'video-4',
    facility_id: DEMO_FACILITY_ID,
    title: 'Puppy Socialization Guide',
    description: 'Important tips for socializing your puppy during the critical period.',
    category: 'puppy',
    tags: ['puppy', 'socialization', 'early-learning'],
    video_url: 'https://example.com/videos/puppy-socialization.mp4',
    thumbnail_url: null,
    duration_seconds: 540,
    file_size_bytes: 70000000,
    visibility: 'clients',
    is_featured: false,
    view_count: 89,
    folder_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uploaded_by: 'demo-user',
    folder: null,
    uploader: { name: 'Sarah Johnson', avatar_url: null },
  },
];

const DEMO_FOLDERS: VideoFolder[] = [
  {
    id: 'folder-1',
    facility_id: DEMO_FACILITY_ID,
    parent_id: null,
    name: 'Obedience Training',
    description: 'Basic and advanced obedience commands',
    color: '#3B82F6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'folder-2',
    facility_id: DEMO_FACILITY_ID,
    parent_id: null,
    name: 'Leash Skills',
    description: 'Leash walking and management',
    color: '#10B981',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'folder-3',
    facility_id: DEMO_FACILITY_ID,
    parent_id: null,
    name: 'Behavior Modification',
    description: 'Addressing common behavior issues',
    color: '#F59E0B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-user',
  },
];

const DEMO_PLAYLISTS: VideoPlaylistWithVideos[] = [
  {
    id: 'playlist-1',
    facility_id: DEMO_FACILITY_ID,
    name: 'New Puppy Essentials',
    description: 'Everything you need to get started with your new puppy',
    visibility: 'clients',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-user',
    videos: [DEMO_VIDEOS[0], DEMO_VIDEOS[3]],
  },
  {
    id: 'playlist-2',
    facility_id: DEMO_FACILITY_ID,
    name: 'Board & Train Week 1',
    description: 'Videos for the first week of board and train',
    visibility: 'trainers',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'demo-user',
    videos: [DEMO_VIDEOS[0], DEMO_VIDEOS[1], DEMO_VIDEOS[2]],
  },
];

// ============================================================================
// Videos Service
// ============================================================================

export const videosService = {
  async getAll(
    facilityId: string,
    options?: {
      category?: VideoCategory;
      folderId?: string | null;
      visibility?: VideoVisibility;
      search?: string;
    }
  ): Promise<TrainingVideoWithDetails[]> {
    if (isDemoMode()) {
      let videos = [...DEMO_VIDEOS];
      if (options?.category) {
        videos = videos.filter(v => v.category === options.category);
      }
      if (options?.folderId !== undefined) {
        videos = videos.filter(v => v.folder_id === options.folderId);
      }
      if (options?.visibility) {
        videos = videos.filter(v => v.visibility === options.visibility);
      }
      if (options?.search) {
        const search = options.search.toLowerCase();
        videos = videos.filter(v =>
          v.title.toLowerCase().includes(search) ||
          v.description?.toLowerCase().includes(search) ||
          v.tags.some(t => t.toLowerCase().includes(search))
        );
      }
      return videos;
    }

    let query = supabase
      .from('training_videos')
      .select('*, folder:video_folders(*), uploader:users(name, avatar_url)')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.folderId !== undefined) {
      query = options.folderId === null
        ? query.is('folder_id', null)
        : query.eq('folder_id', options.folderId);
    }
    if (options?.visibility) {
      query = query.eq('visibility', options.visibility);
    }
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TrainingVideoWithDetails[];
  },

  async getById(id: string): Promise<TrainingVideoWithDetails | null> {
    if (isDemoMode()) {
      return DEMO_VIDEOS.find(v => v.id === id) || null;
    }

    const { data, error } = await supabase
      .from('training_videos')
      .select('*, folder:video_folders(*), uploader:users(name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as TrainingVideoWithDetails;
  },

  async getFeatured(facilityId: string): Promise<TrainingVideoWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_VIDEOS.filter(v => v.is_featured);
    }

    const { data, error } = await supabase
      .from('training_videos')
      .select('*, folder:video_folders(*), uploader:users(name, avatar_url)')
      .eq('facility_id', facilityId)
      .eq('is_featured', true)
      .order('view_count', { ascending: false });

    if (error) throw error;
    return data as TrainingVideoWithDetails[];
  },

  async create(video: Omit<TrainingVideo, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<TrainingVideo> {
    if (isDemoMode()) {
      const newVideo: TrainingVideo = {
        ...video,
        id: `video-${Date.now()}`,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newVideo;
    }

    const { data, error } = await supabase
      .from('training_videos')
      .insert({ ...video, view_count: 0 })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<TrainingVideo>): Promise<TrainingVideo> {
    if (isDemoMode()) {
      const video = DEMO_VIDEOS.find(v => v.id === id);
      if (!video) throw new Error('Video not found');
      return { ...video, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('training_videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementViewCount(id: string): Promise<void> {
    if (isDemoMode()) return;

    await supabase.rpc('increment_video_view_count', { video_id: id });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('training_videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Folders Service
// ============================================================================

export const videoFoldersService = {
  async getAll(facilityId: string): Promise<VideoFolder[]> {
    if (isDemoMode()) {
      return DEMO_FOLDERS;
    }

    const { data, error } = await supabase
      .from('video_folders')
      .select('*')
      .eq('facility_id', facilityId)
      .order('name');

    if (error) throw error;
    return data;
  },

  async create(folder: Omit<VideoFolder, 'id' | 'created_at' | 'updated_at'>): Promise<VideoFolder> {
    if (isDemoMode()) {
      const newFolder: VideoFolder = {
        ...folder,
        id: `folder-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newFolder;
    }

    const { data, error } = await supabase
      .from('video_folders')
      .insert(folder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<VideoFolder>): Promise<VideoFolder> {
    if (isDemoMode()) {
      const folder = DEMO_FOLDERS.find(f => f.id === id);
      if (!folder) throw new Error('Folder not found');
      return { ...folder, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('video_folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('video_folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Playlists Service
// ============================================================================

export const playlistsService = {
  async getAll(facilityId: string): Promise<VideoPlaylistWithVideos[]> {
    if (isDemoMode()) {
      return DEMO_PLAYLISTS;
    }

    const { data, error } = await supabase
      .from('video_playlists')
      .select('*, videos:playlist_videos(video:training_videos(*))')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((p: any) => ({
      ...p,
      videos: p.videos.map((pv: any) => pv.video),
    })) as VideoPlaylistWithVideos[];
  },

  async getById(id: string): Promise<VideoPlaylistWithVideos | null> {
    if (isDemoMode()) {
      return DEMO_PLAYLISTS.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('video_playlists')
      .select('*, videos:playlist_videos(video:training_videos(*), position)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      videos: data.videos
        .sort((a: any, b: any) => a.position - b.position)
        .map((pv: any) => pv.video),
    } as VideoPlaylistWithVideos;
  },

  async create(playlist: Omit<VideoPlaylist, 'id' | 'created_at' | 'updated_at'>): Promise<VideoPlaylist> {
    if (isDemoMode()) {
      const newPlaylist: VideoPlaylist = {
        ...playlist,
        id: `playlist-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newPlaylist;
    }

    const { data, error } = await supabase
      .from('video_playlists')
      .insert(playlist)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addVideo(playlistId: string, videoId: string, position: number): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('playlist_videos')
      .insert({ playlist_id: playlistId, video_id: videoId, position });

    if (error) throw error;
  },

  async removeVideo(playlistId: string, videoId: string): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('playlist_videos')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('video_playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Video Shares Service
// ============================================================================

export const videoSharesService = {
  async shareVideo(
    videoId: string,
    options: {
      familyId?: string;
      dogId?: string;
      sharedBy: string;
      message?: string;
    }
  ): Promise<VideoShare> {
    if (isDemoMode()) {
      const newShare: VideoShare = {
        id: `share-${Date.now()}`,
        video_id: videoId,
        family_id: options.familyId || null,
        dog_id: options.dogId || null,
        shared_by: options.sharedBy,
        message: options.message || null,
        viewed_at: null,
        created_at: new Date().toISOString(),
      };
      return newShare;
    }

    const { data, error } = await supabase
      .from('video_shares')
      .insert({
        video_id: videoId,
        family_id: options.familyId,
        dog_id: options.dogId,
        shared_by: options.sharedBy,
        message: options.message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSharedWithFamily(familyId: string): Promise<TrainingVideoWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_VIDEOS.filter(v => v.visibility === 'clients').slice(0, 2);
    }

    const { data, error } = await supabase
      .from('video_shares')
      .select('video:training_videos(*, folder:video_folders(*), uploader:users(name, avatar_url))')
      .eq('family_id', familyId);

    if (error) throw error;
    return data.map((s: any) => s.video) as TrainingVideoWithDetails[];
  },

  async markAsViewed(shareId: string): Promise<void> {
    if (isDemoMode()) return;

    await supabase
      .from('video_shares')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', shareId);
  },
};

// ============================================================================
// Combined Video Library Service
// ============================================================================

export const videoLibraryService = {
  videos: videosService,
  folders: videoFoldersService,
  playlists: playlistsService,
  shares: videoSharesService,

  async getLibraryStats(facilityId: string): Promise<{
    totalVideos: number;
    totalViews: number;
    categories: { category: VideoCategory; count: number }[];
  }> {
    if (isDemoMode()) {
      const categories: { category: VideoCategory; count: number }[] = [
        { category: 'obedience', count: 2 },
        { category: 'leash', count: 1 },
        { category: 'recall', count: 1 },
        { category: 'puppy', count: 1 },
      ];
      return {
        totalVideos: DEMO_VIDEOS.length,
        totalViews: DEMO_VIDEOS.reduce((sum, v) => sum + v.view_count, 0),
        categories,
      };
    }

    const videos = await videosService.getAll(facilityId);
    const categoryMap = new Map<VideoCategory, number>();
    let totalViews = 0;

    videos.forEach(v => {
      categoryMap.set(v.category, (categoryMap.get(v.category) || 0) + 1);
      totalViews += v.view_count;
    });

    return {
      totalVideos: videos.length,
      totalViews,
      categories: Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count })),
    };
  },
};
