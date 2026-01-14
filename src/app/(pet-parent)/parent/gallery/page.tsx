'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { usePetParentGallery } from '@/hooks';
import {
  Image,
  Download,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Dog,
  Play,
  Loader2,
} from 'lucide-react';

type FilterType = 'all' | 'photos' | 'videos' | 'highlights';
type DogFilter = 'all' | string;

export default function PetParentGalleryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    url: string | null;
    dog: { id: string; name: string };
    caption: string;
    date: string;
    is_highlight: boolean;
    activity_type: string;
  } | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dogFilter, setDogFilter] = useState<DogFilter>('all');

  const { data: gallery, isLoading } = usePetParentGallery();

  const photos = gallery?.photos || [];
  const videos = gallery?.videos || [];

  const dogs = useMemo(() => {
    return Array.from(new Map(photos.map((p) => [p.dog.id, p.dog])).values());
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesDog = dogFilter === 'all' || photo.dog.id === dogFilter;
      const matchesType =
        filterType === 'all' ||
        filterType === 'photos' ||
        (filterType === 'highlights' && photo.is_highlight);
      return matchesDog && matchesType;
    });
  }, [photos, dogFilter, filterType]);

  const groupedPhotos = useMemo(() => {
    return filteredPhotos.reduce((acc, photo) => {
      const date = photo.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(photo);
      return acc;
    }, {} as Record<string, typeof filteredPhotos>);
  }, [filteredPhotos]);

  const currentIndex = selectedPhoto
    ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Photo Gallery</h1>
          <p className="text-surface-400">
            {filteredPhotos.length} photos from your dogs' training journey
          </p>
        </div>
        <Button variant="outline" leftIcon={<Download size={16} />}>
          Download All
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'photos', 'videos', 'highlights'] as FilterType[]).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type === 'highlights' && <Heart size={14} className="mr-1" />}
                {type}
              </Button>
            ))}
          </div>

          {/* Dog Filter */}
          <select
            value={dogFilter}
            onChange={(e) => setDogFilter(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Dogs</option>
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Videos Section */}
      {(filterType === 'all' || filterType === 'videos') && videos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play size={20} className="text-brand-400" />
            Videos ({videos.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="aspect-video rounded-xl bg-surface-800 overflow-hidden relative group cursor-pointer"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-2 group-hover:bg-brand-500/40 transition-colors">
                    <Play size={24} className="text-brand-400 ml-1" />
                  </div>
                  <p className="text-sm text-white">{video.caption}</p>
                  <p className="text-xs text-surface-500">{video.duration}</p>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                  {video.dog.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos by Date */}
      {filterType !== 'videos' && (
        <div className="space-y-8">
          {Object.entries(groupedPhotos)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, datePhotos]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-surface-500" />
                  {formatDate(date, 'EEEE, MMMM d, yyyy')}
                  <span className="text-sm font-normal text-surface-500">
                    ({datePhotos.length} photos)
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {datePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="aspect-square rounded-xl bg-surface-800 overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-brand-500/50 transition-all"
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800 p-3">
                          <Dog size={32} className="text-surface-600 mb-2" />
                          <p className="text-xs text-surface-500 text-center line-clamp-2">
                            {photo.caption}
                          </p>
                        </div>
                      )}

                      {/* Highlight Badge */}
                      {photo.is_highlight && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500/80 flex items-center justify-center">
                          <Heart size={12} className="text-white fill-white" />
                        </div>
                      )}

                      {/* Dog Name Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                        {photo.dog.name}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Image size={24} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && filterType !== 'videos' && (
        <Card className="text-center py-12">
          <Image size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No photos found</h3>
          <p className="text-surface-400">
            {dogFilter !== 'all' || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Photos from training will appear here'}
          </p>
        </Card>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Next Button */}
          {currentIndex < filteredPhotos.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Photo */}
          <div className="max-w-4xl max-h-[80vh] mx-4">
            {selectedPhoto.url ? (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-[70vh] rounded-xl"
              />
            ) : (
              <div className="w-96 h-96 bg-surface-800 rounded-xl flex flex-col items-center justify-center">
                <Dog size={64} className="text-surface-600 mb-4" />
                <p className="text-surface-400">Image placeholder</p>
              </div>
            )}

            {/* Caption */}
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{selectedPhoto.caption}</p>
              <p className="text-sm text-surface-500">
                {selectedPhoto.dog.name} • {formatDate(selectedPhoto.date)}
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-surface-500 text-sm">
            {currentIndex + 1} of {filteredPhotos.length}
          </div>

          {/* Actions */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="ghost" size="sm" leftIcon={<Heart size={14} />}>
              Favorite
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
