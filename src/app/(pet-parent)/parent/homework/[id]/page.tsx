'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  usePetParentHomeworkDetail,
  useCreateHomeworkSubmission,
} from '@/hooks';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dog,
  Video,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  FileText,
  ExternalLink,
  Upload,
  Send,
  Image,
  X,
} from 'lucide-react';

const statusConfig = {
  assigned: { label: 'Pending', color: 'blue', icon: FileText },
  in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'red', icon: AlertCircle },
};

const submissionStatusConfig = {
  pending: { label: 'Pending Review', color: 'gray' },
  submitted: { label: 'Submitted', color: 'blue' },
  approved: { label: 'Approved', color: 'green' },
  needs_revision: { label: 'Needs Revision', color: 'yellow' },
};

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default function PetParentHomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignment, isLoading, refetch } = usePetParentHomeworkDetail(assignmentId);
  const createSubmission = useCreateHomeworkSubmission();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-500">Loading homework...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText size={48} className="text-surface-600 mb-4" />
        <p className="text-surface-500">Homework not found</p>
        <Link href="/parent/homework">
          <Button variant="secondary" className="mt-4">
            Back to Homework
          </Button>
        </Link>
      </div>
    );
  }

  const isOverdue = assignment.status !== 'completed' && new Date(assignment.due_date) < new Date();
  const config = isOverdue
    ? statusConfig.overdue
    : statusConfig[assignment.status as keyof typeof statusConfig] || statusConfig.assigned;
  const StatusIcon = config.icon;

  const handleSubmit = async () => {
    if (!notes && !videoUrl) return;

    setIsSubmitting(true);
    try {
      await createSubmission.mutateAsync({
        assignment_id: assignmentId,
        notes: notes || undefined,
        video_url: videoUrl || undefined,
      });
      setNotes('');
      setVideoUrl('');
      setShowSubmissionForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to submit homework:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasApprovedSubmission = assignment.submissions?.some(
    (s: { status: string }) => s.status === 'approved'
  );
  const needsRevision = assignment.submissions?.some(
    (s: { status: string }) => s.status === 'needs_revision'
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <Link
          href="/parent/homework"
          className="inline-flex items-center gap-2 text-surface-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Back to Homework
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
            <p className="text-surface-400 mt-1">Assigned by your trainer</p>
          </div>
          <span
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              config.color === 'blue'
                ? 'bg-blue-500/20 text-blue-400'
                : config.color === 'yellow'
                ? 'bg-yellow-500/20 text-yellow-400'
                : config.color === 'green'
                ? 'bg-green-500/20 text-green-400'
                : config.color === 'red'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-surface-700 text-surface-400'
            )}
          >
            <StatusIcon size={14} />
            {isOverdue ? 'Overdue' : config.label}
          </span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-surface-800/50">
          <CardContent className="p-3 text-center">
            <Dog size={18} className="mx-auto text-brand-400 mb-1" />
            <p className="text-xs text-surface-500">Dog</p>
            <p className="text-sm font-medium text-white">{assignment.dog?.name}</p>
          </CardContent>
        </Card>
        <Card className={cn('bg-surface-800/50', isOverdue && 'border-red-500/30')}>
          <CardContent className="p-3 text-center">
            <Calendar size={18} className={cn('mx-auto mb-1', isOverdue ? 'text-red-400' : 'text-surface-400')} />
            <p className="text-xs text-surface-500">Due Date</p>
            <p className={cn('text-sm font-medium', isOverdue ? 'text-red-400' : 'text-white')}>
              {new Date(assignment.due_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-800/50">
          <CardContent className="p-3 text-center">
            <span
              className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1',
                difficultyColors[assignment.difficulty as keyof typeof difficultyColors]
              )}
            >
              {assignment.difficulty}
            </span>
            <p className="text-xs text-surface-500">Difficulty</p>
          </CardContent>
        </Card>
      </div>

      {/* Needs Revision Alert */}
      {needsRevision && !hasApprovedSubmission && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Revision Requested</p>
                <p className="text-sm text-surface-300 mt-1">
                  Your trainer has requested changes to your submission. Please review the feedback and try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Alert */}
      {hasApprovedSubmission && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-400">Great Work!</p>
                <p className="text-sm text-surface-300 mt-1">
                  Your trainer has approved this homework. Keep up the excellent training!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><FileText className="text-brand-400" size={18} />Instructions</span>} />
        <CardContent>
          <div className="space-y-4">
            {assignment.description && (
              <p className="text-surface-300">{assignment.description}</p>
            )}
            <div className="whitespace-pre-wrap text-surface-300 bg-surface-800/50 rounded-xl p-4">
              {assignment.instructions}
            </div>

            {assignment.tips && (
              <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
                <p className="text-xs font-medium text-brand-400 mb-1">Trainer Tips</p>
                <p className="text-sm text-surface-300">{assignment.tips}</p>
              </div>
            )}

            {assignment.custom_notes && (
              <div className="p-3 rounded-lg bg-surface-800/50">
                <p className="text-xs font-medium text-surface-400 mb-1">Notes from Trainer</p>
                <p className="text-sm text-surface-300">{assignment.custom_notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Video */}
      {assignment.video_url && (
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Video className="text-blue-400" size={18} />Demo Video</span>} />
          <CardContent>
            <a
              href={assignment.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Play size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Watch Demo Video</p>
                <p className="text-sm text-surface-400">See how to do this exercise correctly</p>
              </div>
              <ExternalLink size={18} className="text-blue-400" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Submissions */}
      <Card>
        <CardHeader
          title="My Submissions"
          icon={<MessageSquare className="text-purple-400" />}
          action={
            !hasApprovedSubmission && assignment.status !== 'completed' && !showSubmissionForm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSubmissionForm(true)}
                leftIcon={<Upload size={14} />}
              >
                Submit Progress
              </Button>
            )
          }
        />
        <CardContent>
          {/* Submission Form */}
          {showSubmissionForm && (
            <div className="mb-6 p-4 rounded-xl bg-surface-800/50 border border-brand-500/30">
              <h4 className="font-medium text-white mb-4">Submit Your Progress</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">
                    Video URL (optional)
                  </label>
                  <Input
                    placeholder="https://youtube.com/watch?v=... or drive link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    leftIcon={<Video size={16} />}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Record yourself practicing and share the link
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">
                    Notes <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[100px] resize-y"
                    placeholder="How did the practice go? Any questions or challenges?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSubmissionForm(false);
                      setNotes('');
                      setVideoUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!notes || isSubmitting}
                    leftIcon={<Send size={16} />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Submissions List */}
          {assignment.submissions && assignment.submissions.length > 0 ? (
            <div className="space-y-4">
              {assignment.submissions.map((submission) => {
                const subConfig = submissionStatusConfig[submission.status as keyof typeof submissionStatusConfig];
                return (
                  <div
                    key={submission.id}
                    className="p-4 rounded-xl bg-surface-800/50 border border-white/[0.06]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-surface-500">
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          subConfig?.color === 'blue'
                            ? 'bg-blue-500/20 text-blue-400'
                            : subConfig?.color === 'green'
                            ? 'bg-green-500/20 text-green-400'
                            : subConfig?.color === 'yellow'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-surface-700 text-surface-400'
                        )}
                      >
                        {subConfig?.label}
                      </span>
                    </div>

                    {submission.notes && (
                      <p className="text-surface-300 mb-3">{submission.notes}</p>
                    )}

                    {submission.video_url && (
                      <a
                        href={submission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-surface-300 hover:text-white text-sm mb-3"
                      >
                        <Play size={14} />
                        View My Video
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {submission.trainer_feedback && (
                      <div className="mt-3 p-3 rounded-lg bg-surface-900/50 border-l-2 border-brand-500">
                        <p className="text-xs text-surface-500 mb-1">Trainer Feedback</p>
                        <p className="text-sm text-surface-300">{submission.trainer_feedback}</p>
                        {submission.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= submission.rating!
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-surface-600'
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !showSubmissionForm ? (
            <div className="text-center py-8">
              <Upload size={32} className="mx-auto text-surface-600 mb-3" />
              <p className="text-surface-500 mb-2">No submissions yet</p>
              <p className="text-sm text-surface-600 mb-4">
                Practice the exercise and submit your progress
              </p>
              {!hasApprovedSubmission && assignment.status !== 'completed' && (
                <Button
                  variant="secondary"
                  onClick={() => setShowSubmissionForm(true)}
                  leftIcon={<Upload size={16} />}
                >
                  Submit Progress
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Fixed Bottom Action */}
      {!hasApprovedSubmission && assignment.status !== 'completed' && !showSubmissionForm && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface-950 to-transparent">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setShowSubmissionForm(true)}
            leftIcon={<Upload size={18} />}
          >
            Submit My Progress
          </Button>
        </div>
      )}
    </div>
  );
}
