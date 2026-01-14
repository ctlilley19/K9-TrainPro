'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, getTimerStatus, activityConfig, type ActivityType } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ActivityTimer, TimerProgressBar } from './ActivityTimer';
import {
  Camera,
  MessageSquare,
  MoreVertical,
  GripVertical,
  ExternalLink,
  Clock,
  X,
} from 'lucide-react';

export interface ActivityDog {
  id: string;
  name: string;
  breed: string;
  photo_url: string | null;
  startedAt: Date;
  trainer: string;
  activityId?: string;
  programId?: string;
  notes?: string;
}

interface ActivityCardProps {
  dog: ActivityDog;
  activityType: ActivityType;
  isDragging?: boolean;
  onAddPhoto?: () => void;
  onAddNote?: (note: string) => void;
  onEndActivity?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any;
}

export function ActivityCard({
  dog,
  activityType,
  isDragging = false,
  onAddPhoto,
  onAddNote,
  onEndActivity,
  dragHandleProps,
}: ActivityCardProps) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const elapsedMinutes = Math.floor((Date.now() - dog.startedAt.getTime()) / 60000);
  const status = getTimerStatus(elapsedMinutes, activityType);

  const handleNoteSubmit = () => {
    if (note.trim() && onAddNote) {
      onAddNote(note.trim());
      setNote('');
      setShowNoteModal(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'p-3 rounded-xl bg-surface-800/80 border transition-all duration-200 group',
          'hover:border-surface-600 hover:shadow-lg',
          isDragging && 'shadow-xl scale-105 border-brand-500/50 bg-surface-800',
          status === 'urgent'
            ? 'border-red-500/50 shadow-red-500/10'
            : status === 'warning'
            ? 'border-yellow-500/50 shadow-yellow-500/10'
            : 'border-surface-700'
        )}
      >
        {/* Header with drag handle */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-surface-600 hover:text-surface-400 transition-colors"
            >
              <GripVertical size={16} />
            </div>
            <Avatar src={dog.photo_url} name={dog.name} size="sm" />
            <div>
              <Link
                href={`/dogs/${dog.id}`}
                className="font-medium text-white text-sm hover:text-brand-400 transition-colors"
              >
                {dog.name}
              </Link>
              <p className="text-xs text-surface-500">{dog.breed}</p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={14} />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-surface-800 border border-surface-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                  <Link
                    href={`/dogs/${dog.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-surface-700 hover:text-white"
                  >
                    <ExternalLink size={14} />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEndActivity?.();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:bg-surface-700 hover:text-white w-full text-left"
                  >
                    <Clock size={14} />
                    End Activity
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-3">
          <ActivityTimer startedAt={dog.startedAt} activityType={activityType} size="sm" />
        </div>

        {/* Progress Bar */}
        <TimerProgressBar
          startedAt={dog.startedAt}
          activityType={activityType}
          className="mb-3"
        />

        {/* Notes Preview */}
        {dog.notes && (
          <div className="mb-3 px-2 py-1.5 bg-surface-900/50 rounded-lg">
            <p className="text-xs text-surface-400 line-clamp-2">{dog.notes}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Take photo"
            onClick={onAddPhoto}
          >
            <Camera size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Add note"
            onClick={() => setShowNoteModal(true)}
          >
            <MessageSquare size={14} />
          </Button>
          <span className="ml-auto text-xs text-surface-500">{dog.trainer}</span>
        </div>
      </div>

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title={`Add Note for ${dog.name}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleNoteSubmit}>
              Save Note
            </Button>
          </>
        }
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter activity note..."
          className="w-full h-32 bg-surface-800 border border-surface-700 rounded-lg p-3 text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none resize-none"
          autoFocus
        />
      </Modal>
    </>
  );
}

// Compact version for lists
interface ActivityCardCompactProps {
  dog: ActivityDog;
  activityType: ActivityType;
  onClick?: () => void;
}

export function ActivityCardCompact({
  dog,
  activityType,
  onClick,
}: ActivityCardCompactProps) {
  const elapsedMinutes = Math.floor((Date.now() - dog.startedAt.getTime()) / 60000);
  const status = getTimerStatus(elapsedMinutes, activityType);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg transition-all',
        'hover:bg-surface-800',
        status === 'urgent'
          ? 'bg-red-500/10'
          : status === 'warning'
          ? 'bg-yellow-500/10'
          : 'bg-surface-800/50'
      )}
    >
      <Avatar src={dog.photo_url} name={dog.name} size="sm" />
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{dog.name}</p>
        <p className="text-xs text-surface-500">{dog.breed}</p>
      </div>
      <ActivityTimer startedAt={dog.startedAt} activityType={activityType} size="sm" />
    </button>
  );
}
