// Test Notes Service
// Uses localStorage for persistence (can be migrated to Supabase later)

import type { TestNote, TestNoteStatus, FeatureDefinition, TestNoteHistoryEntry } from '@/types/database';
import { FEATURES } from '@/lib/testing/features-registry';

const STORAGE_KEY = 'k9_protrain_test_notes';

// Generate a unique ID
function generateId(): string {
  return `tn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp in ISO format
function now(): string {
  return new Date().toISOString();
}

// Get all test notes from localStorage
export function getTestNotes(): TestNote[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    console.error('Failed to parse test notes from localStorage');
    return [];
  }
}

// Save all test notes to localStorage
function saveTestNotes(notes: TestNote[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save test notes to localStorage:', error);
  }
}

// Get a single test note by feature ID
export function getTestNoteByFeatureId(featureId: string): TestNote | null {
  const notes = getTestNotes();
  return notes.find(n => n.feature_id === featureId) || null;
}

// Create or update a test note
export function upsertTestNote(
  featureId: string,
  updates: Partial<Pick<TestNote, 'status' | 'notes' | 'tested_by'>>
): TestNote {
  const notes = getTestNotes();
  const existingIndex = notes.findIndex(n => n.feature_id === featureId);
  const feature = FEATURES.find(f => f.id === featureId);

  if (!feature) {
    throw new Error(`Feature not found: ${featureId}`);
  }

  const timestamp = now();

  if (existingIndex >= 0) {
    // Update existing note
    const existing = notes[existingIndex];
    const updated: TestNote = {
      ...existing,
      ...updates,
      updated_at: timestamp,
      // Update tested_at only if status changed to something other than 'not_tested'
      tested_at: updates.status && updates.status !== 'not_tested' ? timestamp : existing.tested_at,
    };
    notes[existingIndex] = updated;
    saveTestNotes(notes);
    return updated;
  } else {
    // Create new note
    const newNote: TestNote = {
      id: generateId(),
      feature_id: featureId,
      page_path: feature.path,
      feature_name: feature.name,
      category: feature.category,
      status: updates.status || 'not_tested',
      notes: updates.notes || null,
      tested_by: updates.tested_by || null,
      tested_at: updates.status && updates.status !== 'not_tested' ? timestamp : null,
      created_at: timestamp,
      updated_at: timestamp,
    };
    notes.push(newNote);
    saveTestNotes(notes);
    return newNote;
  }
}

// Delete a test note
export function deleteTestNote(id: string): boolean {
  const notes = getTestNotes();
  const index = notes.findIndex(n => n.id === id);

  if (index >= 0) {
    notes.splice(index, 1);
    saveTestNotes(notes);
    return true;
  }

  return false;
}

// Reset a test note to "not tested"
export function resetTestNote(featureId: string): TestNote | null {
  return upsertTestNote(featureId, {
    status: 'not_tested',
    notes: null,
    tested_by: null,
  });
}

// Get test status counts
export interface TestStatusCounts {
  total: number;
  not_tested: number;
  testing: number;
  passed: number;
  failed: number;
  blocked: number;
}

export function getTestStatusCounts(): TestStatusCounts {
  const notes = getTestNotes();
  const totalFeatures = FEATURES.length;

  const counts: TestStatusCounts = {
    total: totalFeatures,
    not_tested: totalFeatures,
    testing: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
  };

  for (const note of notes) {
    if (note.status !== 'not_tested') {
      counts.not_tested--;
    }
    if (note.status === 'testing') counts.testing++;
    if (note.status === 'passed') counts.passed++;
    if (note.status === 'failed') counts.failed++;
    if (note.status === 'blocked') counts.blocked++;
  }

  return counts;
}

// Get all features with their test notes merged
export interface FeatureWithTestNote extends FeatureDefinition {
  testNote: TestNote | null;
}

export function getFeaturesWithTestNotes(): FeatureWithTestNote[] {
  const notes = getTestNotes();
  const notesByFeatureId = new Map(notes.map(n => [n.feature_id, n]));

  return FEATURES.map(feature => ({
    ...feature,
    testNote: notesByFeatureId.get(feature.id) || null,
  }));
}

// Get features by status
export function getFeaturesByStatus(status: TestNoteStatus): FeatureWithTestNote[] {
  const features = getFeaturesWithTestNotes();

  if (status === 'not_tested') {
    return features.filter(f => !f.testNote || f.testNote.status === 'not_tested');
  }

  return features.filter(f => f.testNote?.status === status);
}

// Export test report as JSON
export interface TestReport {
  generated_at: string;
  summary: TestStatusCounts;
  features: Array<{
    id: string;
    name: string;
    path: string;
    category: string;
    status: TestNoteStatus;
    notes: string | null;
    tested_by: string | null;
    tested_at: string | null;
    // Enhanced location context for Claude Code
    tab?: string;
    section?: string;
    component?: string;
    file?: string;
    description?: string;
  }>;
}

export function exportTestReport(): TestReport {
  const features = getFeaturesWithTestNotes();
  const counts = getTestStatusCounts();

  return {
    generated_at: now(),
    summary: counts,
    features: features.map(f => ({
      id: f.id,
      name: f.name,
      path: f.path,
      category: f.category,
      status: f.testNote?.status || 'not_tested',
      notes: f.testNote?.notes || null,
      tested_by: f.testNote?.tested_by || null,
      tested_at: f.testNote?.tested_at || null,
      // Include enhanced context
      tab: f.tab,
      section: f.section,
      component: f.component,
      file: f.file,
      description: f.description,
    })),
  };
}

// Export test report as CSV
export function exportTestReportAsCSV(): string {
  const features = getFeaturesWithTestNotes();

  const headers = ['ID', 'Name', 'Path', 'Category', 'Status', 'Notes', 'Tested By', 'Tested At'];
  const rows = features.map(f => [
    f.id,
    f.name,
    f.path,
    f.category,
    f.testNote?.status || 'not_tested',
    f.testNote?.notes || '',
    f.testNote?.tested_by || '',
    f.testNote?.tested_at || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

// Bulk update test notes
export function bulkUpdateStatus(
  featureIds: string[],
  status: TestNoteStatus,
  testedBy?: string
): void {
  for (const featureId of featureIds) {
    upsertTestNote(featureId, { status, tested_by: testedBy });
  }
}

// Clear all test notes (reset everything)
export function clearAllTestNotes(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Archive current notes to history (called when exporting to Claude)
export function archiveNotesToHistory(): void {
  const notes = getTestNotes();
  const timestamp = now();

  for (const note of notes) {
    // Only archive notes that have content
    if (note.notes && note.notes.trim()) {
      const historyEntry: TestNoteHistoryEntry = {
        id: generateId(),
        notes: note.notes,
        status: note.status,
        created_at: note.updated_at || note.created_at,
        exported_at: timestamp,
      };

      // Add to history array
      if (!note.history) {
        note.history = [];
      }

      // Don't duplicate if the notes haven't changed since last archive
      const lastEntry = note.history[note.history.length - 1];
      if (!lastEntry || lastEntry.notes !== note.notes) {
        note.history.push(historyEntry);
      }
    }
  }

  saveTestNotes(notes);
}

// Update a specific history entry
export function updateHistoryEntry(
  featureId: string,
  historyEntryId: string,
  updates: Partial<Pick<TestNoteHistoryEntry, 'notes' | 'status'>>
): TestNote | null {
  const notes = getTestNotes();
  const noteIndex = notes.findIndex(n => n.feature_id === featureId);

  if (noteIndex < 0) return null;

  const note = notes[noteIndex];
  if (!note.history) return null;

  const historyIndex = note.history.findIndex(h => h.id === historyEntryId);
  if (historyIndex < 0) return null;

  // Update the history entry
  note.history[historyIndex] = {
    ...note.history[historyIndex],
    ...updates,
  };
  note.updated_at = now();

  notes[noteIndex] = note;
  saveTestNotes(notes);

  return note;
}

// Delete a history entry
export function deleteHistoryEntry(featureId: string, historyEntryId: string): boolean {
  const notes = getTestNotes();
  const noteIndex = notes.findIndex(n => n.feature_id === featureId);

  if (noteIndex < 0) return false;

  const note = notes[noteIndex];
  if (!note.history) return false;

  const historyIndex = note.history.findIndex(h => h.id === historyEntryId);
  if (historyIndex < 0) return false;

  note.history.splice(historyIndex, 1);
  note.updated_at = now();

  notes[noteIndex] = note;
  saveTestNotes(notes);

  return true;
}
