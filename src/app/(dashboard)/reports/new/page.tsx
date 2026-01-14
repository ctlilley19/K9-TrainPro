'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate } from '@/lib/utils';
import { useActiveStays, useGenerateReport, useUpdateDailyReport, useSendReport } from '@/hooks';
import {
  generateReport,
  reportTemplates,
  applyTemplate,
} from '@/services/reportGenerator';
import {
  Save,
  Send,
  ArrowLeft,
  Dog,
  Star,
  TrendingUp,
  Heart,
  Utensils,
  Moon,
  Home,
  Target,
  Droplets,
  Plus,
  X,
  CheckCircle,
  Sparkles,
  Zap,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Mock dogs with today's activities
const mockDogsWithActivities = [
  {
    id: 'a',
    name: 'Max',
    breed: 'German Shepherd',
    family: 'Anderson Family',
    photo_url: null,
    programName: '4-Week Board & Train',
    programDay: 18,
    totalProgramDays: 28,
    activities: [
      { id: '1', type: 'kennel' as const, start_time: '07:00', duration: 60 },
      { id: '2', type: 'potty' as const, start_time: '08:00', duration: 10, notes: 'Normal' },
      { id: '3', type: 'feeding' as const, start_time: '08:15', duration: 15, notes: 'Ate all food' },
      { id: '4', type: 'training' as const, start_time: '09:00', duration: 45, notes: 'Great focus on heel work. Breakthrough with recall under distraction!', skills_worked: ['Heel', 'Recall', 'Stay'] },
      { id: '5', type: 'rest' as const, start_time: '10:00', duration: 60 },
      { id: '6', type: 'play' as const, start_time: '11:00', duration: 30, notes: 'Yard play - good energy' },
      { id: '7', type: 'training' as const, start_time: '14:00', duration: 30, notes: 'Place command practice', skills_worked: ['Place', 'Stay'] },
      { id: '8', type: 'feeding' as const, start_time: '17:00', duration: 15, notes: 'Finished all food' },
    ],
    skillAssessments: [
      { skill_id: 'heel', skill_name: 'Heel', level: 4, previous_level: 3 },
      { skill_id: 'recall', skill_name: 'Recall', level: 4, previous_level: 3 },
      { skill_id: 'stay', skill_name: 'Stay', level: 5, previous_level: 4 },
      { skill_id: 'place', skill_name: 'Place', level: 4 },
    ],
  },
  {
    id: 'b',
    name: 'Bella',
    breed: 'Golden Retriever',
    family: 'Anderson Family',
    photo_url: null,
    programName: 'Basic Obedience',
    programDay: 5,
    totalProgramDays: 8,
    activities: [
      { id: '1', type: 'kennel' as const, start_time: '07:00', duration: 60 },
      { id: '2', type: 'potty' as const, start_time: '08:00', duration: 10 },
      { id: '3', type: 'feeding' as const, start_time: '08:15', duration: 15, notes: 'Ate most food' },
      { id: '4', type: 'training' as const, start_time: '10:00', duration: 30, notes: 'Working on sit-stay duration', skills_worked: ['Sit', 'Stay'] },
      { id: '5', type: 'play' as const, start_time: '11:30', duration: 45 },
    ],
    skillAssessments: [
      { skill_id: 'sit', skill_name: 'Sit', level: 4 },
      { skill_id: 'stay', skill_name: 'Stay', level: 3, previous_level: 2 },
    ],
  },
];

const moodOptions = [
  { value: 'excellent', label: 'Excellent - Happy & Engaged' },
  { value: 'good', label: 'Good - Normal behavior' },
  { value: 'fair', label: 'Fair - Slightly off' },
  { value: 'poor', label: 'Poor - Needs attention' },
];

const appetiteOptions = [
  { value: 'excellent', label: 'Excellent - Ate everything' },
  { value: 'good', label: 'Good - Ate most food' },
  { value: 'fair', label: 'Fair - Ate some food' },
  { value: 'poor', label: 'Poor - Barely ate' },
];

const pottyOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'soft', label: 'Soft stool' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'accident', label: 'Had accident' },
];

const activityIcons: Record<string, React.ReactNode> = {
  kennel: <Home size={14} />,
  potty: <Droplets size={14} />,
  feeding: <Utensils size={14} />,
  training: <Target size={14} />,
  play: <Heart size={14} />,
  rest: <Moon size={14} />,
};

const templateOptions = [
  { key: 'excellent_day', label: 'Excellent Day', icon: '⭐' },
  { key: 'good_day', label: 'Good Day', icon: '👍' },
  { key: 'challenging_day', label: 'Challenging Day', icon: '💪' },
  { key: 'first_day', label: 'First Day', icon: '🎉' },
  { key: 'graduation_ready', label: 'Graduation Ready', icon: '🎓' },
];

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDog = searchParams.get('dog');

  // Fetch active stays from the database
  const { data: activeStays, isLoading, error } = useActiveStays();
  const generateReportMutation = useGenerateReport();
  const updateReportMutation = useUpdateDailyReport();
  const sendReportMutation = useSendReport();

  const [selectedDog, setSelectedDog] = useState(preselectedDog || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    summary: '',
    mood: 'good',
    energy_level: 'normal',
    appetite: 'good',
    potty: 'normal',
    highlights: [''],
    areas_to_improve: [''],
    tomorrow_focus: '',
    private_notes: '',
  });

  // Transform active stays to dogs with activities format
  const dogsWithActivities = useMemo(() => {
    if (!activeStays || activeStays.length === 0) {
      // Fall back to mock data for demo mode
      return mockDogsWithActivities;
    }

    return activeStays.map((stay) => {
      // Calculate program duration from dates
      const startDate = new Date(stay.check_in_date);
      const endDate = stay.check_out_date ? new Date(stay.check_out_date) : new Date();
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 28;
      const currentDay = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: stay.dog_id,
        name: stay.dog?.name || 'Unknown Dog',
        breed: stay.dog?.breed || 'Unknown Breed',
        family: stay.family?.name || 'Unknown Family',
        photo_url: stay.dog?.photo_url || null,
        programName: stay.program?.name || 'Board & Train',
        programDay: currentDay,
        totalProgramDays: totalDays,
        activities: [] as typeof mockDogsWithActivities[0]['activities'],
        skillAssessments: [] as typeof mockDogsWithActivities[0]['skillAssessments'],
      };
    });
  }, [activeStays]);

  const dog = dogsWithActivities.find((d) => d.id === selectedDog);

  // Auto-generate report from activities
  const handleAutoGenerate = async () => {
    if (!dog) return;

    setIsGenerating(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const generated = generateReport(
        dog.activities,
        dog.skillAssessments,
        {
          name: dog.name,
          breed: dog.breed,
          programName: dog.programName,
          programDay: dog.programDay,
          totalProgramDays: dog.totalProgramDays,
        }
      );

      setFormData({
        summary: generated.summary,
        mood: generated.mood,
        energy_level: generated.energy_level,
        appetite: generated.appetite,
        potty: generated.potty,
        highlights: generated.highlights.length > 0 ? generated.highlights : [''],
        areas_to_improve: generated.areas_to_improve.length > 0 ? generated.areas_to_improve : [''],
        tomorrow_focus: generated.tomorrow_focus,
        private_notes: '',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply a template
  const handleApplyTemplate = (templateKey: keyof typeof reportTemplates) => {
    if (!dog) return;

    const template = applyTemplate(templateKey, dog.name);

    setFormData((prev) => ({
      ...prev,
      summary: template.summary || prev.summary,
      highlights: template.highlights || prev.highlights,
      areas_to_improve: template.areas_to_improve || prev.areas_to_improve,
      tomorrow_focus: template.tomorrow_focus || prev.tomorrow_focus,
    }));

    setShowTemplates(false);
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => (i === index ? value : h)),
    }));
  };

  const addAreaToImprove = () => {
    setFormData((prev) => ({
      ...prev,
      areas_to_improve: [...prev.areas_to_improve, ''],
    }));
  };

  const removeAreaToImprove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areas_to_improve: prev.areas_to_improve.filter((_, i) => i !== index),
    }));
  };

  const updateAreaToImprove = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      areas_to_improve: prev.areas_to_improve.map((a, i) => (i === index ? value : a)),
    }));
  };

  const getMoodRating = (mood: string): number => {
    switch (mood) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'fair': return 3;
      case 'poor': return 2;
      default: return 4;
    }
  };

  const getEnergyRating = (energy: string): number => {
    switch (energy) {
      case 'high': return 5;
      case 'normal': return 3;
      case 'low': return 1;
      default: return 3;
    }
  };

  const getAppetiteRating = (appetite: string): number => {
    switch (appetite) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'fair': return 3;
      case 'poor': return 2;
      default: return 4;
    }
  };

  const handleSaveDraft = async () => {
    if (!dog) return;

    setIsSubmitting(true);
    try {
      // First generate the report
      const stay = activeStays?.find(s => s.dog_id === dog.id);
      const programId = stay?.program_id || null;
      const today = new Date().toISOString().split('T')[0];

      const newReport = await generateReportMutation.mutateAsync({
        dogId: dog.id,
        programId,
        date: today,
      });

      // Then update it with the form data
      if (newReport?.id) {
        await updateReportMutation.mutateAsync({
          id: newReport.id,
          data: {
            auto_summary: formData.summary,
            mood_rating: getMoodRating(formData.mood),
            energy_level: getEnergyRating(formData.energy_level),
            appetite_rating: getAppetiteRating(formData.appetite),
            highlights: formData.highlights.filter(h => h.trim() !== ''),
            trainer_notes: formData.private_notes,
            status: 'draft',
          },
        });
      }

      router.push('/reports');
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReport = async () => {
    if (!dog) return;

    setIsSending(true);
    try {
      // First generate the report
      const stay = activeStays?.find(s => s.dog_id === dog.id);
      const programId = stay?.program_id || null;
      const today = new Date().toISOString().split('T')[0];

      const newReport = await generateReportMutation.mutateAsync({
        dogId: dog.id,
        programId,
        date: today,
      });

      // Then update it with the form data and send
      if (newReport?.id) {
        await updateReportMutation.mutateAsync({
          id: newReport.id,
          data: {
            auto_summary: formData.summary,
            mood_rating: getMoodRating(formData.mood),
            energy_level: getEnergyRating(formData.energy_level),
            appetite_rating: getAppetiteRating(formData.appetite),
            highlights: formData.highlights.filter(h => h.trim() !== ''),
            trainer_notes: formData.private_notes,
          },
        });

        // Send the report
        await sendReportMutation.mutateAsync(newReport.id);
      }

      router.push('/reports');
    } catch (err) {
      console.error('Failed to send report:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Calculate training stats
  const trainingMinutes = dog?.activities
    .filter((a) => a.type === 'training')
    .reduce((sum, a) => sum + a.duration, 0) || 0;

  const skillsPracticed = new Set<string>();
  dog?.activities.forEach((a) => {
    a.skills_worked?.forEach((s) => skillsPracticed.add(s));
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading dogs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Failed to load dogs</h2>
          <p className="text-surface-400 max-w-md">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Create Daily Report"
        description={formatDate(new Date().toISOString(), 'EEEE, MMMM d, yyyy')}
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: 'New Report' },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Dog Selection & Activity Summary */}
        <div className="space-y-6">
          {/* Dog Selection */}
          <Card>
            <CardHeader title="Select Dog" />
            <CardContent>
              <div className="space-y-2">
                {dogsWithActivities.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDog(d.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                      selectedDog === d.id
                        ? 'bg-brand-500/10 border-brand-500/50'
                        : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                    )}
                  >
                    <Avatar name={d.name} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{d.name}</p>
                      <p className="text-sm text-surface-500">{d.family}</p>
                    </div>
                    {selectedDog === d.id && (
                      <CheckCircle size={20} className="text-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          {dog && (
            <Card>
              <CardHeader title="Today's Activities" />
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dog.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/50"
                    >
                      <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center text-surface-400">
                        {activityIcons[activity.type]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white capitalize">
                          {activity.type}
                        </p>
                        {activity.notes && (
                          <p className="text-xs text-surface-500 line-clamp-1">
                            {activity.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-400">{activity.start_time}</p>
                        <p className="text-xs text-surface-500">{activity.duration}m</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Training Stats */}
                <div className="mt-4 pt-4 border-t border-surface-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-400">Training Time</span>
                    <span className="text-white font-medium">{trainingMinutes} minutes</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(skillsPracticed).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded bg-brand-500/10 text-brand-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Program Progress */}
                <div className="mt-4 pt-4 border-t border-surface-700">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-surface-400">{dog.programName}</span>
                    <span className="text-white">
                      Day {dog.programDay}/{dog.totalProgramDays}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{
                        width: `${(dog.programDay / dog.totalProgramDays) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Templates */}
          {dog && (
            <Card>
              <CardHeader
                title="Quick Templates"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    {showTemplates ? 'Hide' : 'Show'}
                  </Button>
                }
              />
              {showTemplates && (
                <CardContent>
                  <div className="space-y-2">
                    {templateOptions.map((template) => (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() =>
                          handleApplyTemplate(template.key as keyof typeof reportTemplates)
                        }
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all text-left"
                      >
                        <span className="text-xl">{template.icon}</span>
                        <span className="text-white">{template.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Report Form */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedDog ? (
            <Card className="text-center py-12">
              <Dog size={48} className="mx-auto text-surface-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Dog</h3>
              <p className="text-surface-400">
                Choose a dog from the left to create their daily report
              </p>
            </Card>
          ) : (
            <>
              {/* Auto Generate Banner */}
              <Card className="border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-purple-500/10">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Auto-Generate Report</h3>
                        <p className="text-sm text-surface-400">
                          Create a report from today's {dog?.activities.length} activities
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleAutoGenerate}
                      isLoading={isGenerating}
                      leftIcon={<Zap size={16} />}
                    >
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader title="Report Summary" />
                <CardContent>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    label="Daily Summary"
                    placeholder="How did the training session go today? What did you work on?"
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              {/* Status & Health */}
              <Card>
                <CardHeader title="Status & Health" />
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      value={formData.mood}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, mood: e.target.value }))
                      }
                      label="Mood"
                      options={moodOptions}
                    />
                    <Select
                      value={formData.appetite}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, appetite: e.target.value }))
                      }
                      label="Appetite"
                      options={appetiteOptions}
                    />
                    <Select
                      value={formData.potty}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, potty: e.target.value }))
                      }
                      label="Potty"
                      options={pottyOptions}
                    />
                    <Select
                      value={formData.energy_level}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, energy_level: e.target.value }))
                      }
                      label="Energy Level"
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'high', label: 'High' },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Highlights */}
              <Card>
                <CardHeader
                  title="Today's Highlights"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus size={14} />}
                      onClick={addHighlight}
                    >
                      Add
                    </Button>
                  }
                />
                <CardContent>
                  <div className="space-y-3">
                    {formData.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 mt-2">
                          <Star size={16} className="text-yellow-400" />
                        </div>
                        <Input
                          value={highlight}
                          onChange={(e) => updateHighlight(idx, e.target.value)}
                          placeholder="What went well today?"
                          className="flex-1"
                        />
                        {formData.highlights.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeHighlight(idx)}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas to Improve */}
              <Card>
                <CardHeader
                  title="Areas to Continue Working On"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus size={14} />}
                      onClick={addAreaToImprove}
                    >
                      Add
                    </Button>
                  }
                />
                <CardContent>
                  <div className="space-y-3">
                    {formData.areas_to_improve.map((area, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 mt-2">
                          <TrendingUp size={16} className="text-blue-400" />
                        </div>
                        <Input
                          value={area}
                          onChange={(e) => updateAreaToImprove(idx, e.target.value)}
                          placeholder="What needs more work?"
                          className="flex-1"
                        />
                        {formData.areas_to_improve.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeAreaToImprove(idx)}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tomorrow's Focus */}
              <Card>
                <CardHeader title="Tomorrow's Focus" />
                <CardContent>
                  <Textarea
                    value={formData.tomorrow_focus}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tomorrow_focus: e.target.value }))
                    }
                    placeholder="What will you focus on in tomorrow's training?"
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>

              {/* Private Notes */}
              <Card>
                <CardHeader
                  title="Private Notes"
                  action={
                    <span className="text-xs text-surface-500">Not shared with pet parent</span>
                  }
                />
                <CardContent>
                  <Textarea
                    value={formData.private_notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, private_notes: e.target.value }))
                    }
                    placeholder="Internal notes for staff only..."
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  leftIcon={<ArrowLeft size={16} />}
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    isLoading={isSubmitting}
                    leftIcon={<Save size={16} />}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendReport}
                    isLoading={isSending}
                    leftIcon={<Send size={16} />}
                  >
                    Send to Family
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
