'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  useHomeworkAssignment,
  useHomeworkSubmissions,
  useApproveHomeworkSubmission,
  useReviewHomeworkSubmission,
  useCompleteHomeworkAssignment,
  useDeleteHomeworkAssignment,
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
  User,
  ExternalLink,
  Trash2,
  Edit2,
  Image,
  X,
} from 'lucide-react';

const statusConfig = {
  assigned: { label: 'Assigned', color: 'blue', icon: FileText },
  in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'red', icon: AlertCircle },
};

const submissionStatusConfig = {
  pending: { label: 'Pending', color: 'gray' },
  submitted: { label: 'Submitted', color: 'blue' },
  approved: { label: 'Approved', color: 'green' },
  needs_revision: { label: 'Needs Revision', color: 'yellow' },
};

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const { data: assignment, isLoading } = useHomeworkAssignment(assignmentId);
  const { data: submissions } = useHomeworkSubmissions(assignmentId);
  const approveSubmission = useApproveHomeworkSubmission();
  const reviewSubmission = useReviewHomeworkSubmission();
  const completeAssignment = useCompleteHomeworkAssignment();
  const deleteAssignment = useDeleteHomeworkAssignment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-500">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText size={48} className="text-surface-600 mb-4" />
        <p className="text-surface-500">Assignment not found</p>
        <Link href="/homework">
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

  const openReviewModal = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setFeedback('');
    setRating(0);
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmissionId) return;
    try {
      await approveSubmission.mutateAsync({
        id: selectedSubmissionId,
        feedback: feedback || undefined,
        rating: rating || undefined,
      });
      setReviewModalOpen(false);
    } catch (error) {
      console.error('Failed to approve submission:', error);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedSubmissionId || !feedback) return;
    try {
      await reviewSubmission.mutateAsync({
        id: selectedSubmissionId,
        feedback,
        status: 'needs_revision',
      });
      setReviewModalOpen(false);
    } catch (error) {
      console.error('Failed to request revision:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeAssignment.mutateAsync(assignmentId);
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment.mutateAsync(assignmentId);
        router.push('/homework');
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={assignment.title}
        description={`Assigned to ${assignment.dog?.name || 'Unknown'}`}
        breadcrumbs={[
          { label: 'Homework', href: '/homework' },
          { label: assignment.title }
        ]}
        action={
          <div className="flex gap-2">
            {assignment.status !== 'completed' && (
              <Button
                variant="secondary"
                onClick={handleComplete}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Mark Complete
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="text-red-400 hover:bg-red-500/10"
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><FileText className="text-brand-400" size={18} />Assignment Details</span>} />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
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
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      difficultyColors[assignment.difficulty as keyof typeof difficultyColors]
                    )}
                  >
                    {assignment.difficulty}
                  </span>
                </div>

                {assignment.description && (
                  <p className="text-surface-300">{assignment.description}</p>
                )}

                <div className="pt-4 border-t border-white/[0.06]">
                  <h4 className="font-medium text-white mb-3">Instructions</h4>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-surface-300 font-sans bg-surface-800/50 rounded-xl p-4">
                      {assignment.instructions}
                    </pre>
                  </div>
                </div>

                {assignment.custom_notes && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <h4 className="font-medium text-white mb-2">Custom Notes</h4>
                    <p className="text-surface-400 text-sm">{assignment.custom_notes}</p>
                  </div>
                )}

                {assignment.video_url && (
                  <div className="pt-4 border-t border-white/[0.06]">
                    <a
                      href={assignment.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      <Video size={16} />
                      Watch Demo Video
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submissions */}
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><MessageSquare className="text-purple-400" size={18} />Submissions</span>}
            />
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => {
                    const subConfig = submissionStatusConfig[submission.status as keyof typeof submissionStatusConfig];
                    return (
                      <div
                        key={submission.id}
                        className="p-4 rounded-xl bg-surface-800/50 border border-white/[0.06]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={
                                (submission as { submitted_by_user?: { name?: string } }).submitted_by_user?.name || 'Pet Parent'
                              }
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-white">
                                {(submission as { submitted_by_user?: { name?: string } }).submitted_by_user?.name || 'Pet Parent'}
                              </p>
                              <p className="text-xs text-surface-500">
                                {new Date(submission.created_at).toLocaleString()}
                              </p>
                            </div>
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

                        <div className="flex items-center gap-3 mb-3">
                          {submission.video_url && (
                            <a
                              href={submission.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-surface-300 hover:text-white text-sm"
                            >
                              <Play size={14} />
                              View Video
                            </a>
                          )}
                          {submission.photo_urls && submission.photo_urls.length > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-surface-300 text-sm">
                              <Image size={14} />
                              {submission.photo_urls.length} Photo{submission.photo_urls.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {submission.trainer_feedback && (
                          <div className="p-3 rounded-lg bg-surface-900/50 mb-3">
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

                        {submission.status === 'submitted' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openReviewModal(submission.id)}
                            leftIcon={<CheckCircle2 size={14} />}
                          >
                            Review Submission
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-surface-600 mb-3" />
                  <p className="text-surface-500">No submissions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dog Info */}
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Dog className="text-brand-400" size={18} />Dog</span>} />
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar name={assignment.dog?.name || ''} size="lg" />
                <div>
                  <p className="font-semibold text-white">{assignment.dog?.name}</p>
                  <p className="text-sm text-surface-400">
                    {(assignment.dog as { family?: { name?: string } })?.family?.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card>
            <CardHeader title="Details" />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-sm">Due Date</span>
                  <span className={cn('text-sm font-medium', isOverdue ? 'text-red-400' : 'text-white')}>
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-sm">Assigned</span>
                  <span className="text-sm text-white">
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-sm">Trainer</span>
                  <span className="text-sm text-white">
                    {assignment.assigned_by_user?.name || 'Unknown'}
                  </span>
                </div>
                {assignment.repetitions_required && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-400 text-sm">Repetitions</span>
                    <span className="text-sm text-white">{assignment.repetitions_required}x</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
        <ModalHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Review Submission</h2>
            <button
              onClick={() => setReviewModalOpen(false)}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Rating (optional)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-surface-600 hover:text-surface-400'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Feedback
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[100px] resize-y"
                placeholder="Write feedback for the pet parent..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleRequestRevision}
            disabled={!feedback}
            className="text-yellow-400"
          >
            Request Revision
          </Button>
          <Button variant="primary" onClick={handleApprove} leftIcon={<CheckCircle2 size={16} />}>
            Approve
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
