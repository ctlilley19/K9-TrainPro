'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate } from '@/lib/utils';
import { comparisonTemplates } from '@/services/supabase/comparisons';
import {
  GitCompare,
  ArrowLeft,
  Save,
  Upload,
  Image,
  Video,
  Play,
  X,
  CheckCircle,
  Calendar,
  Sparkles,
  Eye,
  Globe,
  Star,
} from 'lucide-react';

// Mock dogs
const mockDogs = [
  {
    id: 'a',
    name: 'Max',
    breed: 'German Shepherd',
    photo_url: null,
    family: 'Anderson Family',
  },
  {
    id: 'b',
    name: 'Bella',
    breed: 'Golden Retriever',
    photo_url: null,
    family: 'Anderson Family',
  },
  {
    id: 'c',
    name: 'Luna',
    breed: 'Border Collie',
    photo_url: null,
    family: 'Martinez Family',
  },
];

// Mock media library
const mockMediaLibrary = [
  { id: '1', type: 'video', url: '/video1.mp4', date: '2024-12-15', caption: 'Day 1 training' },
  { id: '2', type: 'video', url: '/video2.mp4', date: '2025-01-10', caption: 'Week 4 progress' },
  { id: '3', type: 'image', url: '/img1.jpg', date: '2024-12-15', caption: 'First day' },
  { id: '4', type: 'image', url: '/img2.jpg', date: '2025-01-10', caption: 'Graduation day' },
];

const skillLevels = [
  { value: 0, label: 'Not Started' },
  { value: 1, label: 'Introduced' },
  { value: 2, label: 'Learning' },
  { value: 3, label: 'Developing' },
  { value: 4, label: 'Proficient' },
  { value: 5, label: 'Mastered' },
];

export default function NewComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDog = searchParams.get('dog');

  const [selectedDog, setSelectedDog] = useState(preselectedDog || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState<'before' | 'after' | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill: '',
    before_media: null as { type: string; url: string } | null,
    after_media: null as { type: string; url: string } | null,
    before_date: '',
    after_date: '',
    before_skill_level: '',
    after_skill_level: '',
    before_caption: '',
    after_caption: '',
    is_public: false,
    is_featured: false,
  });

  const dog = mockDogs.find((d) => d.id === selectedDog);

  const handleTemplateSelect = (templateId: string) => {
    const template = comparisonTemplates.find((t) => t.id === templateId);
    if (template && dog) {
      setSelectedTemplate(templateId);
      setFormData((prev) => ({
        ...prev,
        title: template.title.replace('{dogName}', dog.name),
        description: template.description,
        skill: template.skill,
        before_caption: template.suggestedCaption.before,
        after_caption: template.suggestedCaption.after,
      }));
    }
  };

  const handleMediaSelect = (media: typeof mockMediaLibrary[0]) => {
    if (showMediaPicker === 'before') {
      setFormData((prev) => ({
        ...prev,
        before_media: { type: media.type, url: media.url },
        before_date: media.date,
      }));
    } else if (showMediaPicker === 'after') {
      setFormData((prev) => ({
        ...prev,
        after_media: { type: media.type, url: media.url },
        after_date: media.date,
      }));
    }
    setShowMediaPicker(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Creating comparison:', {
        dog: selectedDog,
        ...formData,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/comparisons');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    selectedDog &&
    formData.title &&
    formData.before_media &&
    formData.after_media;

  return (
    <div>
      <PageHeader
        title="Create Comparison"
        description="Build a before & after transformation showcase"
        breadcrumbs={[
          { label: 'Comparisons', href: '/comparisons' },
          { label: 'New Comparison' },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dog Selection */}
          <Card>
            <CardHeader title="Select Dog" />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mockDogs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDog(d.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      selectedDog === d.id
                        ? 'bg-brand-500/10 border-brand-500/50'
                        : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                    )}
                  >
                    <Avatar name={d.name} size="lg" />
                    <div className="text-center">
                      <p className="font-medium text-white">{d.name}</p>
                      <p className="text-xs text-surface-500">{d.breed}</p>
                    </div>
                    {selectedDog === d.id && (
                      <CheckCircle size={16} className="text-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          {selectedDog && (
            <Card>
              <CardHeader
                title="Quick Templates"
                action={
                  <span className="text-xs text-surface-500">
                    Optional - auto-fill details
                  </span>
                }
              />
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {comparisonTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template.id)}
                      className={cn(
                        'px-4 py-2 rounded-xl border transition-all',
                        selectedTemplate === template.id
                          ? 'bg-brand-500/10 border-brand-500/50 text-white'
                          : 'bg-surface-800/50 border-surface-700 hover:border-surface-600 text-surface-300'
                      )}
                    >
                      {template.skill}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Selection */}
          {selectedDog && (
            <Card>
              <CardHeader title="Select Media" />
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Before */}
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Before
                    </label>
                    {formData.before_media ? (
                      <div className="relative aspect-video rounded-xl bg-surface-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {formData.before_media.type === 'video' ? (
                            <Play size={40} className="text-surface-500" />
                          ) : (
                            <Image size={40} className="text-surface-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, before_media: null }))
                          }
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                        >
                          <X size={16} className="text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
                          <p className="text-xs text-white/80">
                            {formatDate(formData.before_date)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker('before')}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-surface-700 hover:border-brand-500/50 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <Upload size={24} className="text-surface-500" />
                        <span className="text-sm text-surface-400">
                          Select before media
                        </span>
                      </button>
                    )}
                    <Input
                      className="mt-3"
                      placeholder="Caption (e.g., Day 1 - Pulling on leash)"
                      value={formData.before_caption}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          before_caption: e.target.value,
                        }))
                      }
                    />
                    <Select
                      className="mt-3"
                      value={formData.before_skill_level}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          before_skill_level: e.target.value,
                        }))
                      }
                      options={skillLevels.map((l) => ({
                        value: l.value.toString(),
                        label: `Level ${l.value}: ${l.label}`,
                      }))}
                      placeholder="Skill level (optional)"
                    />
                  </div>

                  {/* After */}
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      After
                    </label>
                    {formData.after_media ? (
                      <div className="relative aspect-video rounded-xl bg-surface-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {formData.after_media.type === 'video' ? (
                            <Play size={40} className="text-surface-500" />
                          ) : (
                            <Image size={40} className="text-surface-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, after_media: null }))
                          }
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                        >
                          <X size={16} className="text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
                          <p className="text-xs text-white/80">
                            {formatDate(formData.after_date)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker('after')}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-surface-700 hover:border-brand-500/50 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <Upload size={24} className="text-surface-500" />
                        <span className="text-sm text-surface-400">
                          Select after media
                        </span>
                      </button>
                    )}
                    <Input
                      className="mt-3"
                      placeholder="Caption (e.g., Week 4 - Perfect heel)"
                      value={formData.after_caption}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          after_caption: e.target.value,
                        }))
                      }
                    />
                    <Select
                      className="mt-3"
                      value={formData.after_skill_level}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          after_skill_level: e.target.value,
                        }))
                      }
                      options={skillLevels.map((l) => ({
                        value: l.value.toString(),
                        label: `Level ${l.value}: ${l.label}`,
                      }))}
                      placeholder="Skill level (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          {selectedDog && (
            <Card>
              <CardHeader title="Details" />
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g., Max's Heel Transformation"
                  />
                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the transformation..."
                    className="min-h-[100px]"
                  />
                  <Input
                    label="Skill/Focus Area"
                    value={formData.skill}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, skill: e.target.value }))
                    }
                    placeholder="e.g., Heel, Recall, Reactivity"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visibility */}
          {selectedDog && (
            <Card>
              <CardHeader title="Visibility" />
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-surface-400" />
                      <div>
                        <p className="font-medium text-white">Make Public</p>
                        <p className="text-sm text-surface-500">
                          Allow sharing and display on showcase page
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_public: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded bg-surface-700 border-surface-600 text-brand-500 focus:ring-brand-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Star size={20} className="text-surface-400" />
                      <div>
                        <p className="font-medium text-white">Feature</p>
                        <p className="text-sm text-surface-500">
                          Highlight this comparison on your showcase
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded bg-surface-700 border-surface-600 text-brand-500 focus:ring-brand-500"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Preview" />
            <CardContent>
              {formData.before_media && formData.after_media ? (
                <div className="space-y-4">
                  {/* Side by Side Preview */}
                  <div className="aspect-video rounded-xl overflow-hidden bg-surface-800 grid grid-cols-2">
                    <div className="relative border-r border-surface-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {formData.before_media.type === 'video' ? (
                          <Play size={24} className="text-surface-500" />
                        ) : (
                          <Image size={24} className="text-surface-500" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                        <p className="text-xs text-white">Before</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {formData.after_media.type === 'video' ? (
                          <Play size={24} className="text-surface-500" />
                        ) : (
                          <Image size={24} className="text-surface-500" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                        <p className="text-xs text-white">After</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-white">
                      {formData.title || 'Untitled Comparison'}
                    </h3>
                    {formData.description && (
                      <p className="text-sm text-surface-400 mt-1">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2">
                    {formData.is_public && (
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                        Public
                      </span>
                    )}
                    {formData.is_featured && (
                      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitCompare size={32} className="mx-auto text-surface-600 mb-3" />
                  <p className="text-surface-400 text-sm">
                    Select before and after media to see preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Button
                variant="primary"
                className="w-full mb-3"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!canSubmit}
                leftIcon={<Save size={16} />}
              >
                Create Comparison
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.back()}
                leftIcon={<ArrowLeft size={16} />}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-surface-700">
              <h3 className="font-semibold text-white">
                Select {showMediaPicker === 'before' ? 'Before' : 'After'} Media
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowMediaPicker(null)}
              >
                <X size={18} />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                {mockMediaLibrary.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => handleMediaSelect(media)}
                    className="relative aspect-video rounded-xl bg-surface-800 overflow-hidden hover:ring-2 hover:ring-brand-500 transition-all"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      {media.type === 'video' ? (
                        <Play size={32} className="text-surface-500" />
                      ) : (
                        <Image size={32} className="text-surface-500" />
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded bg-black/50 text-white text-xs">
                        {media.type === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                      <p className="text-xs text-white">{media.caption}</p>
                      <p className="text-xs text-white/60">
                        {formatDate(media.date)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload new */}
              <div className="mt-4 pt-4 border-t border-surface-700">
                <Button variant="outline" className="w-full" leftIcon={<Upload size={16} />}>
                  Upload New Media
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
