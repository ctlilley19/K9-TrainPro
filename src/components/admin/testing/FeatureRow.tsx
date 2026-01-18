'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CircleDashed,
  Save,
  Pencil,
  Trash2,
  History,
  X,
  Check,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { TestNoteStatus, TestNoteHistoryEntry } from '@/types/database';
import type { FeatureWithTestNote } from '@/services/test-notes';
import { updateHistoryEntry, deleteHistoryEntry } from '@/services/test-notes';

interface FeatureRowProps {
  feature: FeatureWithTestNote;
  onStatusChange: (featureId: string, status: TestNoteStatus) => void;
  onNotesChange: (featureId: string, notes: string) => void;
  onRefresh?: () => void;
}

const statusOptions: { value: TestNoteStatus; label: string; color: string }[] = [
  { value: 'not_tested', label: 'Not Tested', color: 'text-surface-400' },
  { value: 'testing', label: 'Testing', color: 'text-blue-400' },
  { value: 'passed', label: 'Passed', color: 'text-green-400' },
  { value: 'failed', label: 'Failed', color: 'text-red-400' },
  { value: 'blocked', label: 'Blocked', color: 'text-yellow-400' },
];

const statusIcons: Record<TestNoteStatus, React.ReactNode> = {
  not_tested: <CircleDashed size={16} className="text-surface-400" />,
  testing: <Clock size={16} className="text-blue-400" />,
  passed: <CheckCircle2 size={16} className="text-green-400" />,
  failed: <XCircle size={16} className="text-red-400" />,
  blocked: <AlertTriangle size={16} className="text-yellow-400" />,
};

const statusBadgeVariants: Record<TestNoteStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  not_tested: 'default',
  testing: 'info',
  passed: 'success',
  failed: 'danger',
  blocked: 'warning',
};

export function FeatureRow({ feature, onStatusChange, onNotesChange, onRefresh }: FeatureRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(feature.testNote?.notes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryNotes, setEditingHistoryNotes] = useState('');
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStatus = feature.testNote?.status || 'not_tested';
  const history = feature.testNote?.history || [];

  // Update local notes when feature changes
  useEffect(() => {
    setLocalNotes(feature.testNote?.notes || '');
    setHasUnsavedChanges(false);
  }, [feature.testNote?.notes]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value as TestNoteStatus;
      onStatusChange(feature.id, newStatus);
    },
    [feature.id, onStatusChange]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value;
      setLocalNotes(newNotes);
      setHasUnsavedChanges(true);

      // Debounce the save
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }

      notesTimeoutRef.current = setTimeout(() => {
        onNotesChange(feature.id, newNotes);
        setHasUnsavedChanges(false);
      }, 1000);
    },
    [feature.id, onNotesChange]
  );

  const saveNotes = useCallback(() => {
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    onNotesChange(feature.id, localNotes);
    setHasUnsavedChanges(false);
  }, [feature.id, localNotes, onNotesChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // History handlers
  const handleEditHistory = (entry: TestNoteHistoryEntry) => {
    setEditingHistoryId(entry.id);
    setEditingHistoryNotes(entry.notes);
  };

  const handleSaveHistoryEdit = () => {
    if (editingHistoryId) {
      updateHistoryEntry(feature.id, editingHistoryId, { notes: editingHistoryNotes });
      setEditingHistoryId(null);
      setEditingHistoryNotes('');
      onRefresh?.();
    }
  };

  const handleCancelHistoryEdit = () => {
    setEditingHistoryId(null);
    setEditingHistoryNotes('');
  };

  const handleDeleteHistory = (entryId: string) => {
    if (confirm('Delete this feedback entry?')) {
      deleteHistoryEntry(feature.id, entryId);
      onRefresh?.();
    }
  };

  return (
    <div className="border border-surface-700/50 rounded-lg overflow-hidden">
      {/* Main Row */}
      <div
        className={`flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-800 transition-colors cursor-pointer ${
          isExpanded ? 'border-b border-surface-700/50' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Icon */}
        <button className="text-surface-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Status Icon */}
        <div className="flex-shrink-0">{statusIcons[currentStatus]}</div>

        {/* Feature Name */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{feature.name}</p>
          <p className="text-xs text-surface-400 truncate">{feature.path}</p>
        </div>

        {/* Status Badge */}
        <StatusBadge variant={statusBadgeVariants[currentStatus]} size="sm">
          {statusOptions.find(s => s.value === currentStatus)?.label}
        </StatusBadge>

        {/* Last Tested */}
        <div className="hidden sm:block text-xs text-surface-500 w-28 text-right">
          {formatDate(feature.testNote?.tested_at || null)}
        </div>

        {/* Quick Link */}
        <a
          href={feature.path.replace('[id]', '1').replace('[code]', 'demo')}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-surface-400 hover:text-brand-400 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-surface-900/50 space-y-4">
          {/* Description */}
          {feature.description && (
            <p className="text-sm text-surface-300">{feature.description}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Status Select */}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">
                Status
              </label>
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                onClick={e => e.stopPropagation()}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tested By */}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">
                Tested By
              </label>
              <p className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-300 text-sm">
                {feature.testNote?.tested_by || 'Not set'}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-surface-400">Notes</label>
              {hasUnsavedChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    saveNotes();
                  }}
                  leftIcon={<Save size={14} />}
                  className="text-xs h-6"
                >
                  Save
                </Button>
              )}
            </div>
            <textarea
              value={localNotes}
              onChange={handleNotesChange}
              onClick={e => e.stopPropagation()}
              placeholder="Add testing notes..."
              rows={3}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white text-sm placeholder-surface-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Timestamps */}
          <div className="flex gap-6 text-xs text-surface-500">
            <span>Created: {formatDate(feature.testNote?.created_at || null)}</span>
            <span>Updated: {formatDate(feature.testNote?.updated_at || null)}</span>
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-700">
              <div className="flex items-center gap-2 mb-3">
                <History size={14} className="text-surface-400" />
                <span className="text-xs font-medium text-surface-400">Previous Feedback ({history.length})</span>
              </div>
              <div className="space-y-2">
                {[...history].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-surface-800/70 border border-surface-700/50"
                  >
                    {editingHistoryId === entry.id ? (
                      // Editing mode
                      <div className="space-y-2">
                        <textarea
                          value={editingHistoryNotes}
                          onChange={(e) => setEditingHistoryNotes(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleSaveHistoryEdit(); }}
                            leftIcon={<Check size={14} />}
                            className="h-7 text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancelHistoryEdit(); }}
                            leftIcon={<X size={14} />}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-surface-300 whitespace-pre-wrap">{entry.notes}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditHistory(entry); }}
                              className="p-1.5 text-surface-500 hover:text-brand-400 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteHistory(entry.id); }}
                              className="p-1.5 text-surface-500 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                          <StatusBadge variant={statusBadgeVariants[entry.status]} size="sm">
                            {statusOptions.find(s => s.value === entry.status)?.label}
                          </StatusBadge>
                          <span>Added: {formatDate(entry.created_at)}</span>
                          {entry.exported_at && (
                            <span className="text-green-500">Exported: {formatDate(entry.exported_at)}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
