'use client';

import { useState } from 'react';
import {
  Video,
  Plus,
  Search,
  Filter,
  FolderPlus,
  Play,
  Share2,
  Edit,
  Trash2,
  Clock,
  Eye,
  Star,
  Folder,
  List,
  Grid,
  ChevronRight,
  Upload,
  Link,
  X,
  Check,
  Users,
  Lock,
  Globe,
} from 'lucide-react';
import {
  useTrainingVideos,
  useTrainingVideo,
  useFeaturedVideos,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
  useVideoFolders,
  useCreateVideoFolder,
  useVideoPlaylists,
  useVideoPlaylist,
  useShareVideo,
  useVideoLibraryStats,
} from '@/hooks';
import type {
  TrainingVideo,
  VideoFolder,
  VideoPlaylist,
  VideoVisibility,
  VideoCategory,
} from '@/types/database';

const categoryLabels: Record<VideoCategory, string> = {
  obedience: 'Obedience',
  behavior: 'Behavior',
  agility: 'Agility',
  tricks: 'Tricks',
  puppy: 'Puppy Training',
  leash: 'Leash Training',
  recall: 'Recall',
  socialization: 'Socialization',
  other: 'Other',
};

const categoryColors: Record<VideoCategory, string> = {
  obedience: 'bg-blue-100 text-blue-700',
  behavior: 'bg-purple-100 text-purple-700',
  agility: 'bg-green-100 text-green-700',
  tricks: 'bg-yellow-100 text-yellow-700',
  puppy: 'bg-pink-100 text-pink-700',
  leash: 'bg-orange-100 text-orange-700',
  recall: 'bg-cyan-100 text-cyan-700',
  socialization: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
};

const visibilityIcons: Record<VideoVisibility, React.ReactNode> = {
  private: <Lock size={14} />,
  trainers: <Users size={14} />,
  clients: <Users size={14} />,
  public: <Globe size={14} />,
};

const visibilityLabels: Record<VideoVisibility, string> = {
  private: 'Private',
  trainers: 'Trainers Only',
  clients: 'Shared with Clients',
  public: 'Public',
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const { data: videos = [], isLoading: videosLoading } = useTrainingVideos({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    folderId: selectedFolder || undefined,
    search: searchQuery || undefined,
  });
  const { data: featuredVideos = [] } = useFeaturedVideos();
  const { data: folders = [] } = useVideoFolders();
  const { data: playlists = [] } = useVideoPlaylists();
  const { data: stats } = useVideoLibraryStats();

  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const createFolder = useCreateVideoFolder();
  const shareVideo = useShareVideo();

  const handlePlayVideo = (video: TrainingVideo) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleShareVideo = (video: TrainingVideo) => {
    setSelectedVideo(video);
    setShowShareModal(true);
  };

  const handleDeleteVideo = async (video: TrainingVideo) => {
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      await deleteVideo.mutateAsync(video.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
          <p className="text-gray-600 mt-1">
            Training videos, tutorials, and resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderPlus size={20} />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalVideos || 0}</p>
              <p className="text-sm text-gray-600">Total Videos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{0}</p>
              <p className="text-sm text-gray-600">Shared with Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{featuredVideos?.length || 0}</p>
              <p className="text-sm text-gray-600">Featured Videos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Folders */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedFolder === null
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Video size={18} />
                <span>All Videos</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Folder size={18} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>

            {playlists.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-900 mt-6 mb-3">Playlists</h3>
                <div className="space-y-1">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <List size={18} />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as VideoCategory | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Videos */}
          {featuredVideos.length > 0 && !selectedFolder && selectedCategory === 'all' && !searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredVideos.slice(0, 3).map((video) => (
                  <div
                    key={video.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 overflow-hidden group cursor-pointer"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Video className="text-gray-400" size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-3 bg-white rounded-full">
                          <Play className="text-primary" size={24} />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      </div>
                      {video.duration_seconds && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[video.category]}`}>
                          {categoryLabels[video.category]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Grid/List */}
          {videosLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Video className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No videos found</h3>
              <p className="mt-2 text-gray-600">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first training video to get started'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                <span>Add Video</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                >
                  <div
                    className="aspect-video bg-gray-200 relative cursor-pointer"
                    onClick={() => handlePlayVideo(video)}
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Video className="text-gray-400" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-3 bg-white rounded-full">
                        <Play className="text-primary" size={24} />
                      </div>
                    </div>
                    {video.duration_seconds && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                        {formatDuration(video.duration_seconds)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[video.category]}`}>
                        {categoryLabels[video.category]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {visibilityIcons[video.visibility]}
                        {visibilityLabels[video.visibility]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {video.view_count}
                        </span>
                        <span>{formatDate(video.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleShareVideo(video)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Video</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Duration</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Views</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Visibility</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => handlePlayVideo(video)}
                          >
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="text-gray-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{video.title}</p>
                            <p className="text-sm text-gray-500 truncate">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[video.category]}`}>
                          {categoryLabels[video.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDuration(video.duration_seconds)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{video.view_count}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          {visibilityIcons[video.visibility]}
                          {visibilityLabels[video.visibility]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                            title="Play"
                          >
                            <Play size={16} />
                          </button>
                          <button
                            onClick={() => handleShareVideo(video)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                            title="Share"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{selectedVideo.title}</h3>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {selectedVideo.video_url ? (
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video URL not available</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-gray-600">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[selectedVideo.category]}`}>
                  {categoryLabels[selectedVideo.category]}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {selectedVideo.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatDuration(selectedVideo.duration_seconds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Add Video</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await createVideo.mutateAsync({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  video_url: formData.get('video_url') as string,
                  thumbnail_url: formData.get('thumbnail_url') as string || null,
                  category: formData.get('category') as VideoCategory,
                  visibility: formData.get('visibility') as VideoVisibility,
                  folder_id: selectedFolder,
                  duration_seconds: parseInt(formData.get('duration') as string) || null,
                  is_featured: false,
                  tags: [],
                  file_size_bytes: null,
                });
                setShowUploadModal(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL *
                </label>
                <input
                  name="video_url"
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  name="thumbnail_url"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="180"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility *
                </label>
                <select
                  name="visibility"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {Object.entries(visibilityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVideo.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createVideo.isPending ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Create Folder</h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await createFolder.mutateAsync({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || null,
                  color: '#6366f1',
                  parent_id: null,
                });
                setShowFolderModal(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name *
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Basic Commands"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Folder description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createFolder.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createFolder.isPending ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Video Modal */}
      {showShareModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Share Video</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Share "{selectedVideo.title}" with a family
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">
                  Select a family from your client list to share this video with them.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  (Family selection coming soon)
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
