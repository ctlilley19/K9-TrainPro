'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TestTube2,
  Download,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CircleDashed,
  FileJson,
  FileSpreadsheet,
  FolderOpen,
  X,
  Bot,
} from 'lucide-react';
import { TestingStats } from '@/components/admin/testing/TestingStats';
import { FeatureRow } from '@/components/admin/testing/FeatureRow';
import {
  getFeaturesWithTestNotes,
  getTestStatusCounts,
  upsertTestNote,
  exportTestReport,
  exportTestReportAsCSV,
  clearAllTestNotes,
  type FeatureWithTestNote,
  type TestStatusCounts,
} from '@/services/test-notes';
import { getAllCategories } from '@/lib/testing/features-registry';
import type { TestNoteStatus } from '@/types/database';

type StatusFilter = TestNoteStatus | 'all';

export default function TestingPortalPage() {
  const [features, setFeatures] = useState<FeatureWithTestNote[]>([]);
  const [counts, setCounts] = useState<TestStatusCounts>({
    total: 0,
    not_tested: 0,
    testing: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const categories = useMemo(() => getAllCategories(), []);

  // Load data on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = useCallback(() => {
    setIsLoading(true);
    const featuresData = getFeaturesWithTestNotes();
    const countsData = getTestStatusCounts();
    setFeatures(featuresData);
    setCounts(countsData);
    // Expand all categories by default
    setExpandedCategories(new Set(getAllCategories()));
    setIsLoading(false);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((featureId: string, status: TestNoteStatus) => {
    upsertTestNote(featureId, { status, tested_by: 'Admin' });
    // Reload data
    setFeatures(getFeaturesWithTestNotes());
    setCounts(getTestStatusCounts());
  }, []);

  // Handle notes change
  const handleNotesChange = useCallback((featureId: string, notes: string) => {
    upsertTestNote(featureId, { notes });
    // Don't reload all data for notes, just update locally
    setFeatures(prev =>
      prev.map(f =>
        f.id === featureId
          ? {
              ...f,
              testNote: f.testNote
                ? { ...f.testNote, notes }
                : null,
            }
          : f
      )
    );
  }, []);

  // Filter features
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      // Status filter
      if (statusFilter !== 'all') {
        const featureStatus = f.testNote?.status || 'not_tested';
        if (featureStatus !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && f.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          f.name.toLowerCase().includes(query) ||
          f.path.toLowerCase().includes(query) ||
          f.category.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [features, statusFilter, categoryFilter, searchQuery]);

  // Group filtered features by category
  const groupedFeatures = useMemo(() => {
    const grouped: Record<string, FeatureWithTestNote[]> = {};
    for (const feature of filteredFeatures) {
      if (!grouped[feature.category]) {
        grouped[feature.category] = [];
      }
      grouped[feature.category].push(feature);
    }
    return grouped;
  }, [filteredFeatures]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Expand/collapse all
  const expandAll = () => setExpandedCategories(new Set(categories));
  const collapseAll = () => setExpandedCategories(new Set());

  // Export handlers
  const handleExportJSON = () => {
    const report = exportTestReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    const csv = exportTestReportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export for Claude Code - commits to GitHub or downloads
  const handleExportForClaude = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const report = exportTestReport();
      const response = await fetch('/api/admin/testing/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const contentType = response.headers.get('content-type');

      // Check if it's a JSON response (GitHub commit succeeded)
      if (contentType?.includes('application/json')) {
        const result = await response.json();
        if (result.method === 'github') {
          alert('Feedback committed to GitHub!\n\nRun `git pull` in your project, then tell Claude Code:\n"Read feedback/TESTING-FEEDBACK-LATEST.md and fix the issues"');
          return;
        }
      }

      // Fallback: Download the markdown file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TESTING-FEEDBACK-LATEST.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Feedback downloaded!\n\nSave this file to your project\'s feedback/ folder, then tell Claude Code:\n"Read feedback/TESTING-FEEDBACK-LATEST.md and fix the issues"');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export feedback. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset all tests
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all test results? This cannot be undone.')) {
      clearAllTestNotes();
      loadData();
    }
  };

  const statusFilterOptions: { value: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Statuses', icon: <Filter size={14} /> },
    { value: 'not_tested', label: 'Not Tested', icon: <CircleDashed size={14} /> },
    { value: 'testing', label: 'Testing', icon: <Clock size={14} /> },
    { value: 'passed', label: 'Passed', icon: <CheckCircle2 size={14} /> },
    { value: 'failed', label: 'Failed', icon: <XCircle size={14} /> },
    { value: 'blocked', label: 'Blocked', icon: <AlertTriangle size={14} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Testing Portal"
        description="QA testing tracker for all features across K9 ProTrain"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={loadData}>
              Refresh
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={14} />}
                rightIcon={<ChevronDown size={14} />}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-10">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-surface-700 transition-colors rounded-t-lg border-b border-surface-600"
                    onClick={handleExportForClaude}
                    disabled={isExporting}
                  >
                    <Bot size={16} className="text-brand-400" />
                    {isExporting ? 'Exporting...' : 'Export for Claude Code'}
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-surface-700 transition-colors"
                    onClick={handleExportJSON}
                  >
                    <FileJson size={16} className="text-blue-400" />
                    Export as JSON
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-surface-700 transition-colors rounded-b-lg"
                    onClick={handleExportCSV}
                  >
                    <FileSpreadsheet size={16} className="text-green-400" />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={handleResetAll}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Reset All
            </Button>
          </div>
        }
      />

      {/* Stats Section */}
      <div className="mb-6">
        <TestingStats counts={counts} />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {statusFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:w-56">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Expand/Collapse Buttons */}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>
                Collapse
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-700">
              <span className="text-xs text-surface-400">Filters:</span>
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-700 rounded text-xs text-surface-300">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-700 rounded text-xs text-surface-300">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-700 rounded text-xs text-surface-300">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                className="text-xs text-brand-400 hover:text-brand-300"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">
          Showing {filteredFeatures.length} of {features.length} features
        </p>
      </div>

      {/* Features List by Category */}
      <div className="space-y-4">
        {Object.entries(groupedFeatures).length === 0 ? (
          <Card className="p-8 text-center">
            <TestTube2 size={48} className="mx-auto mb-3 text-surface-500" />
            <p className="text-surface-400">No features match your filters</p>
          </Card>
        ) : (
          Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <Card key={category} padding="none">
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-800/50 transition-colors rounded-t-xl"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} className="text-brand-400" />
                  <span className="font-semibold text-white">{category}</span>
                  <span className="text-sm text-surface-400">({categoryFeatures.length})</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-surface-400 transition-transform ${
                    expandedCategories.has(category) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Category Features */}
              {expandedCategories.has(category) && (
                <div className="border-t border-surface-700/50 p-3 space-y-2">
                  {categoryFeatures.map(feature => (
                    <FeatureRow
                      key={feature.id}
                      feature={feature}
                      onStatusChange={handleStatusChange}
                      onNotesChange={handleNotesChange}
                    />
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
