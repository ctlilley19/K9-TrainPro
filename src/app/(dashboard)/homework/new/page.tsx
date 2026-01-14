'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  useHomeworkTemplates,
  useHomeworkTemplate,
  useCreateHomeworkAssignment,
  useCreateHomeworkFromTemplate,
  useDogsWithPrograms,
} from '@/hooks';
import type { HomeworkDifficulty } from '@/types/database';
import {
  ArrowLeft,
  FileText,
  Video,
  Clock,
  Calendar,
  Dog,
  Search,
  Check,
  Sparkles,
  Save,
} from 'lucide-react';

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'bg-green-500/20 text-green-400' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400' },
  advanced: { label: 'Advanced', color: 'bg-red-500/20 text-red-400' },
};

function NewHomeworkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [step, setStep] = useState<'select-dog' | 'select-template' | 'customize'>('select-dog');
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateId);
  const [dogSearch, setDogSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    video_url: '',
    difficulty: 'beginner' as HomeworkDifficulty,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    custom_notes: '',
    repetitions_required: 1,
  });

  const { data: dogs, isLoading: dogsLoading } = useDogsWithPrograms();
  const { data: templates } = useHomeworkTemplates({ isActive: true });
  const { data: selectedTemplate } = useHomeworkTemplate(selectedTemplateId || undefined);

  const createAssignment = useCreateHomeworkAssignment();
  const createFromTemplate = useCreateHomeworkFromTemplate();

  // Filter dogs with active programs
  const activeDogs = dogs?.filter((dog) => dog.activeProgram);
  const filteredDogs = activeDogs?.filter((dog) =>
    dog.name.toLowerCase().includes(dogSearch.toLowerCase()) ||
    dog.family?.name?.toLowerCase().includes(dogSearch.toLowerCase())
  );

  const filteredTemplates = templates?.filter((template) =>
    template.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.description?.toLowerCase().includes(templateSearch.toLowerCase())
  );

  // Load template data when selected
  useEffect(() => {
    if (selectedTemplate) {
      setFormData((prev) => ({
        ...prev,
        title: selectedTemplate.title,
        description: selectedTemplate.description || '',
        instructions: selectedTemplate.instructions,
        video_url: selectedTemplate.video_url || '',
        difficulty: selectedTemplate.difficulty,
      }));
    }
  }, [selectedTemplate]);

  // Start at step 2 if template is pre-selected
  useEffect(() => {
    if (templateId) {
      setStep('select-dog');
    }
  }, [templateId]);

  const handleSubmit = async () => {
    if (!selectedDogId) return;

    try {
      const selectedDog = activeDogs?.find((d) => d.id === selectedDogId);
      const programId = selectedDog?.activeProgram?.id;

      if (selectedTemplateId) {
        await createFromTemplate.mutateAsync({
          templateId: selectedTemplateId,
          dogId: selectedDogId,
          dueDate: formData.due_date,
          programId,
          customNotes: formData.custom_notes || undefined,
        });
      } else {
        await createAssignment.mutateAsync({
          dog_id: selectedDogId,
          program_id: programId,
          title: formData.title,
          description: formData.description || undefined,
          instructions: formData.instructions,
          video_url: formData.video_url || undefined,
          difficulty: formData.difficulty,
          due_date: formData.due_date,
          custom_notes: formData.custom_notes || undefined,
          repetitions_required: formData.repetitions_required,
        });
      }
      router.push('/homework');
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Homework Assignment"
        description="Assign homework to a pet parent"
        breadcrumb={
          <Link href="/homework" className="flex items-center gap-2 text-surface-400 hover:text-white">
            <ArrowLeft size={16} />
            Back to Homework
          </Link>
        }
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { id: 'select-dog', label: 'Select Dog' },
          { id: 'select-template', label: 'Choose Template' },
          { id: 'customize', label: 'Customize' },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                step === s.id
                  ? 'bg-brand-500 text-white'
                  : ['select-dog'].includes(step) && i > 0
                  ? 'bg-surface-800 text-surface-500'
                  : step === 'select-template' && i > 1
                  ? 'bg-surface-800 text-surface-500'
                  : 'bg-green-500 text-white'
              )}
            >
              {i + 1}
            </div>
            <span className="ml-2 text-sm text-surface-400 hidden sm:inline">{s.label}</span>
            {i < 2 && <div className="w-12 h-px bg-surface-700 mx-3" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Dog */}
      {step === 'select-dog' && (
        <Card>
          <CardHeader
            title="Select Dog"
            icon={<Dog className="text-brand-400" />}
          />
          <CardContent>
            <Input
              placeholder="Search dogs..."
              value={dogSearch}
              onChange={(e) => setDogSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              className="mb-4"
            />

            {dogsLoading ? (
              <div className="text-center py-8 text-surface-500">Loading dogs...</div>
            ) : filteredDogs && filteredDogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDogs.map((dog) => (
                  <button
                    key={dog.id}
                    onClick={() => setSelectedDogId(dog.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                      selectedDogId === dog.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-transparent bg-surface-800/50 hover:bg-surface-800'
                    )}
                  >
                    <Avatar name={dog.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{dog.name}</p>
                      <p className="text-sm text-surface-400 truncate">
                        {dog.breed} • {dog.family?.name}
                      </p>
                      {dog.activeProgram && (
                        <p className="text-xs text-green-400 mt-1">
                          {dog.activeProgram.name}
                        </p>
                      )}
                    </div>
                    {selectedDogId === dog.id && (
                      <Check size={20} className="text-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dog size={48} className="mx-auto text-surface-600 mb-4" />
                <p className="text-surface-500">No dogs with active programs found</p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                onClick={() => setStep('select-template')}
                disabled={!selectedDogId}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Template */}
      {step === 'select-template' && (
        <Card>
          <CardHeader
            title="Choose a Template (Optional)"
            icon={<FileText className="text-brand-400" />}
          />
          <CardContent>
            <Input
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              className="mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Custom option */}
              <button
                onClick={() => {
                  setSelectedTemplateId(null);
                  setFormData({
                    ...formData,
                    title: '',
                    description: '',
                    instructions: '',
                    video_url: '',
                    difficulty: 'beginner',
                  });
                }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  !selectedTemplateId
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-transparent bg-surface-800/50 hover:bg-surface-800'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center">
                  <Sparkles size={24} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Custom Assignment</p>
                  <p className="text-sm text-surface-400">Create from scratch</p>
                </div>
                {!selectedTemplateId && <Check size={20} className="text-brand-400" />}
              </button>

              {/* Templates */}
              {filteredTemplates?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    selectedTemplateId === template.id
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-transparent bg-surface-800/50 hover:bg-surface-800'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center">
                    <FileText size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{template.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          difficultyConfig[template.difficulty]?.color
                        )}
                      >
                        {difficultyConfig[template.difficulty]?.label}
                      </span>
                      {template.estimated_duration_minutes && (
                        <span className="text-xs text-surface-500 flex items-center gap-1">
                          <Clock size={10} />
                          {template.estimated_duration_minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplateId === template.id && (
                    <Check size={20} className="text-brand-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep('select-dog')}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setStep('customize')}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Customize */}
      {step === 'customize' && (
        <Card>
          <CardHeader
            title="Customize Assignment"
            icon={<Sparkles className="text-brand-400" />}
          />
          <CardContent>
            <div className="space-y-4">
              {/* Selected dog preview */}
              <div className="p-4 rounded-xl bg-surface-800/50 flex items-center gap-3">
                <Avatar name={activeDogs?.find((d) => d.id === selectedDogId)?.name || ''} size="md" />
                <div>
                  <p className="font-medium text-white">
                    {activeDogs?.find((d) => d.id === selectedDogId)?.name}
                  </p>
                  <p className="text-sm text-surface-400">
                    {activeDogs?.find((d) => d.id === selectedDogId)?.family?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Basic Sit Practice"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={!!selectedTemplateId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    leftIcon={<Calendar size={16} />}
                  />
                </div>
              </div>

              {!selectedTemplateId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">
                      Instructions <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[120px] resize-y"
                      placeholder="Step-by-step instructions..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">
                        Difficulty
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData({ ...formData, difficulty: e.target.value as HomeworkDifficulty })
                        }
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">
                        Video URL (optional)
                      </label>
                      <Input
                        placeholder="https://youtube.com/..."
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        leftIcon={<Video size={16} />}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Custom Notes for this Assignment
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[80px] resize-y"
                  placeholder="Special notes for this dog/family..."
                  value={formData.custom_notes}
                  onChange={(e) => setFormData({ ...formData, custom_notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep('select-template')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  !selectedDogId ||
                  (!selectedTemplateId && (!formData.title || !formData.instructions)) ||
                  createAssignment.isPending ||
                  createFromTemplate.isPending
                }
                leftIcon={<Save size={16} />}
              >
                Create Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewHomeworkPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-surface-500">Loading...</div>}>
      <NewHomeworkContent />
    </Suspense>
  );
}
