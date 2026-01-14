'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate } from '@/lib/utils';
import { useDailyReport, useUpdateDailyReport, useSendReport } from '@/hooks';
import {
  Save,
  Send,
  ArrowLeft,
  Dog,
  Star,
  TrendingUp,
  Heart,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const { data: report, isLoading, error } = useDailyReport(reportId);
  const updateReport = useUpdateDailyReport();
  const sendReport = useSendReport();

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  // Populate form with existing data when report loads
  useEffect(() => {
    if (report) {
      const energyLevel = report.energy_level;
      const energyString = energyLevel && energyLevel >= 4 ? 'high' :
                          energyLevel && energyLevel >= 2 ? 'normal' : 'low';
      const appetiteRating = report.appetite_rating;
      const appetiteString = appetiteRating && appetiteRating >= 4 ? 'excellent' :
                            appetiteRating && appetiteRating >= 3 ? 'good' :
                            appetiteRating && appetiteRating >= 2 ? 'fair' : 'poor';

      setFormData({
        summary: report.auto_summary || '',
        mood: report.mood_rating && report.mood_rating >= 4 ? 'excellent' :
              report.mood_rating && report.mood_rating >= 3 ? 'good' :
              report.mood_rating && report.mood_rating >= 2 ? 'fair' : 'poor',
        energy_level: energyString,
        appetite: appetiteString,
        potty: 'normal',
        highlights: report.highlights && report.highlights.length > 0 ? report.highlights : [''],
        areas_to_improve: [''],
        tomorrow_focus: '',
        private_notes: report.trainer_notes || '',
      });
    }
  }, [report]);

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

  const handleSave = async () => {
    if (!report) return;

    setIsSaving(true);
    try {
      await updateReport.mutateAsync({
        id: reportId,
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
      router.push('/reports');
    } catch (err) {
      console.error('Failed to save report:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (!report) return;

    setIsSending(true);
    try {
      // First update the report
      await updateReport.mutateAsync({
        id: reportId,
        data: {
          auto_summary: formData.summary,
          mood_rating: getMoodRating(formData.mood),
          energy_level: getEnergyRating(formData.energy_level),
          appetite_rating: getAppetiteRating(formData.appetite),
          highlights: formData.highlights.filter(h => h.trim() !== ''),
          trainer_notes: formData.private_notes,
        },
      });
      // Then send it
      await sendReport.mutateAsync(reportId);
      router.push('/reports');
    } catch (err) {
      console.error('Failed to send report:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Report not found</h2>
          <p className="text-surface-400 max-w-md">
            {error instanceof Error ? error.message : 'Unable to load the report'}
          </p>
          <Button variant="primary" onClick={() => router.push('/reports')}>
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Report"
        description={`${report.dog?.name} - ${formatDate(report.report_date, 'EEEE, MMMM d, yyyy')}`}
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: 'Edit Report' },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Dog Info */}
        <div className="space-y-6">
          {/* Dog Card */}
          <Card>
            <CardHeader title="Dog Info" />
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar name={report.dog?.name || ''} size="lg" />
                <div>
                  <p className="font-semibold text-white text-lg">{report.dog?.name}</p>
                  <p className="text-surface-400">{report.dog?.breed}</p>
                  <p className="text-sm text-surface-500">{report.program?.name || 'Training Program'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Status */}
          <Card>
            <CardHeader title="Report Details" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Status</span>
                  <span className={cn(
                    "font-medium capitalize",
                    report.status === 'draft' && 'text-yellow-400',
                    report.status === 'ready' && 'text-blue-400',
                    report.status === 'sent' && 'text-green-400',
                    report.status === 'opened' && 'text-green-400',
                  )}>
                    {report.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Report Date</span>
                  <span className="text-white">{formatDate(report.report_date)}</span>
                </div>
                {report.created_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Created</span>
                    <span className="text-white">{formatDate(report.created_at, 'MMM d, h:mm a')}</span>
                  </div>
                )}
                {report.sent_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Sent</span>
                    <span className="text-white">{formatDate(report.sent_at, 'MMM d, h:mm a')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2 space-y-6">
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
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save size={16} />}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAndSend}
                isLoading={isSending}
                leftIcon={<Send size={16} />}
              >
                Save & Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
