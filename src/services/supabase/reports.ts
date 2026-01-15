// Daily Reports Service Layer for K9 ProTrain
// Handles daily report generation, management, and delivery

import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_FACILITY_ID } from '@/lib/demo-config';
import type {
  DailyReportFull,
  DailyReportWithDetails,
  ReportTemplate,
  ReportPreferences,
  ReportComment,
  ReportReaction,
  ReportStatus,
  ActivitySummary,
  Dog,
  Program,
} from '@/types/database';

// ============================================================================
// Demo Data
// ============================================================================

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const DEMO_DOGS: Partial<Dog>[] = [
  { id: 'dog-1', name: 'Max', breed: 'Golden Retriever', photo_url: null },
  { id: 'dog-2', name: 'Bella', breed: 'German Shepherd', photo_url: null },
  { id: 'dog-3', name: 'Charlie', breed: 'Labrador Retriever', photo_url: null },
];

const DEMO_REPORTS: DailyReportWithDetails[] = [
  {
    id: 'report-1',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-1',
    program_id: 'prog-1',
    report_date: formatDate(today),
    status: 'draft',
    auto_summary: 'Max had an excellent training day! He showed great focus during obedience drills and made significant progress with his recall command.',
    trainer_notes: 'Focused on recall and heel commands today. Max is responding well to positive reinforcement.',
    highlights: ['Achieved 90% recall success rate', 'Excellent heel position', 'Good impulse control'],
    mood_rating: 5,
    energy_level: 4,
    appetite_rating: 5,
    training_focus_rating: 4,
    sociability_rating: 5,
    activities_summary: [
      { type: 'training', duration_minutes: 45, count: 2, notes: 'Obedience and recall work' },
      { type: 'play', duration_minutes: 30, count: 1, notes: 'Group play with Bella' },
      { type: 'potty', duration_minutes: 15, count: 4 },
      { type: 'rest', duration_minutes: 60, count: 2 },
    ],
    skills_practiced: ['Recall', 'Heel', 'Sit-Stay', 'Down-Stay'],
    highlight_photos: [],
    highlight_videos: [],
    badge_earned_id: null,
    sent_at: null,
    sent_by: null,
    opened_at: null,
    email_sent: false,
    push_sent: false,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: DEMO_DOGS[0] as Dog,
    program: {
      id: 'prog-1',
      dog_id: 'dog-1',
      facility_id: DEMO_FACILITY_ID,
      type: 'board_train',
      name: '2-Week Board & Train',
      start_date: formatDate(addDays(today, -5)),
      end_date: formatDate(addDays(today, 9)),
      status: 'active',
      assigned_trainer_id: 'demo-user',
      goals: ['Recall', 'Heel', 'Basic obedience'],
      notes: null,
      before_photo_url: null,
      after_photo_url: null,
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
    },
    badge_earned: null,
    comments: [],
    reactions: [],
  },
  {
    id: 'report-2',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-2',
    program_id: 'prog-2',
    report_date: formatDate(today),
    status: 'ready',
    auto_summary: 'Bella had a good day focusing on impulse control exercises. She is making steady progress with door manners.',
    trainer_notes: 'Worked on wait command at doors and thresholds. Bella is improving but still needs consistency.',
    highlights: ['Improved door manners', 'Good focus during training', 'Calm during group time'],
    mood_rating: 4,
    energy_level: 3,
    appetite_rating: 4,
    training_focus_rating: 4,
    sociability_rating: 4,
    activities_summary: [
      { type: 'training', duration_minutes: 40, count: 2, notes: 'Impulse control and door manners' },
      { type: 'play', duration_minutes: 25, count: 1 },
      { type: 'potty', duration_minutes: 12, count: 4 },
      { type: 'rest', duration_minutes: 90, count: 2 },
    ],
    skills_practiced: ['Wait', 'Door Manners', 'Impulse Control'],
    highlight_photos: [],
    highlight_videos: [],
    badge_earned_id: null,
    sent_at: null,
    sent_by: null,
    opened_at: null,
    email_sent: false,
    push_sent: false,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: DEMO_DOGS[1] as Dog,
    program: {
      id: 'prog-2',
      dog_id: 'dog-2',
      facility_id: DEMO_FACILITY_ID,
      type: 'board_train',
      name: '1-Week Intensive',
      start_date: formatDate(addDays(today, -3)),
      end_date: formatDate(addDays(today, 4)),
      status: 'active',
      assigned_trainer_id: 'demo-user',
      goals: ['Impulse control', 'Door manners'],
      notes: null,
      before_photo_url: null,
      after_photo_url: null,
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
    },
    badge_earned: null,
    comments: [],
    reactions: [],
  },
  {
    id: 'report-3',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-1',
    program_id: 'prog-1',
    report_date: formatDate(addDays(today, -1)),
    status: 'sent',
    auto_summary: 'Max had a wonderful day! Great progress on leash walking and achieved his Heel Hero badge.',
    trainer_notes: 'Excellent leash work today. Max earned his Heel Hero badge!',
    highlights: ['Earned Heel Hero badge!', 'Zero pulling on leash', 'Perfect heel position'],
    mood_rating: 5,
    energy_level: 5,
    appetite_rating: 5,
    training_focus_rating: 5,
    sociability_rating: 5,
    activities_summary: [
      { type: 'training', duration_minutes: 50, count: 2 },
      { type: 'walk', duration_minutes: 30, count: 1 },
      { type: 'play', duration_minutes: 25, count: 1 },
      { type: 'potty', duration_minutes: 15, count: 4 },
    ],
    skills_practiced: ['Heel', 'Loose Leash Walking', 'Sit'],
    highlight_photos: [],
    highlight_videos: [],
    badge_earned_id: 'badge-1',
    sent_at: addDays(today, -1).toISOString(),
    sent_by: 'demo-user',
    opened_at: addDays(today, -1).toISOString(),
    email_sent: true,
    push_sent: true,
    created_at: addDays(today, -1).toISOString(),
    updated_at: addDays(today, -1).toISOString(),
    created_by: 'demo-user',
    dog: DEMO_DOGS[0] as Dog,
    program: null,
    badge_earned: {
      id: 'badge-1',
      dog_id: 'dog-1',
      badge_type: 'heel_hero',
      tier: 'gold',
      earned_at: addDays(today, -1).toISOString(),
      awarded_by: 'demo-user',
      notes: 'Excellent leash manners',
      created_at: addDays(today, -1).toISOString(),
      updated_at: addDays(today, -1).toISOString(),
    },
    comments: [
      {
        id: 'comment-1',
        report_id: 'report-3',
        user_id: 'parent-1',
        content: 'So proud of Max! He is doing amazing!',
        commenter_type: 'parent',
        created_at: addDays(today, -1).toISOString(),
        updated_at: addDays(today, -1).toISOString(),
      },
    ],
    reactions: [
      { id: 'reaction-1', report_id: 'report-3', user_id: 'parent-1', reaction: '❤️', created_at: addDays(today, -1).toISOString() },
      { id: 'reaction-2', report_id: 'report-3', user_id: 'parent-2', reaction: '🎉', created_at: addDays(today, -1).toISOString() },
    ],
  },
];

const DEMO_TEMPLATES: ReportTemplate[] = [
  {
    id: 'template-1',
    facility_id: DEMO_FACILITY_ID,
    name: 'Standard Daily Report',
    description: 'Default template for daily training reports',
    summary_template: '{dog_name} had a {mood_description} day today! {activity_summary}',
    default_highlights: [],
    is_default: true,
    is_active: true,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'template-2',
    facility_id: DEMO_FACILITY_ID,
    name: 'Badge Achievement Report',
    description: 'Template for days when a badge is earned',
    summary_template: 'Congratulations! {dog_name} earned a new badge today: {badge_name}!',
    default_highlights: ['Badge earned!'],
    is_default: false,
    is_active: true,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateAutoSummary(
  dogName: string,
  moodRating: number,
  energyLevel: number,
  activities: ActivitySummary[],
  skillsPracticed: string[]
): string {
  let summary = `${dogName} `;

  // Mood description
  if (moodRating >= 4) {
    summary += 'had an excellent day! ';
  } else if (moodRating >= 3) {
    summary += 'had a good day. ';
  } else if (moodRating >= 2) {
    summary += 'had a decent day. ';
  } else {
    summary += 'had a challenging day. ';
  }

  // Energy description
  if (energyLevel >= 4) {
    summary += 'Energy levels were high throughout the day. ';
  } else if (energyLevel >= 3) {
    summary += 'Energy was steady and balanced. ';
  } else {
    summary += 'Energy was a bit lower than usual. ';
  }

  // Training activities
  const trainingActivities = activities.filter(a => a.type === 'training');
  if (trainingActivities.length > 0) {
    const totalTrainingMinutes = trainingActivities.reduce((sum, a) => sum + a.duration_minutes, 0);
    summary += `Completed ${totalTrainingMinutes} minutes of training. `;
  }

  // Skills
  if (skillsPracticed && skillsPracticed.length > 0) {
    if (skillsPracticed.length === 1) {
      summary += `Worked on ${skillsPracticed[0]}.`;
    } else {
      summary += `Practiced ${skillsPracticed.slice(0, -1).join(', ')} and ${skillsPracticed[skillsPracticed.length - 1]}.`;
    }
  }

  return summary;
}

// ============================================================================
// Daily Reports Service
// ============================================================================

export const dailyReportsService = {
  async getAll(
    facilityId: string,
    options?: {
      status?: ReportStatus;
      dogId?: string;
      date?: string;
      dateRange?: { start: string; end: string };
    }
  ): Promise<DailyReportWithDetails[]> {
    if (isDemoMode()) {
      let reports = [...DEMO_REPORTS];

      if (options?.status) {
        reports = reports.filter(r => r.status === options.status);
      }
      if (options?.dogId) {
        reports = reports.filter(r => r.dog_id === options.dogId);
      }
      if (options?.date) {
        reports = reports.filter(r => r.report_date === options.date);
      }
      if (options?.dateRange) {
        reports = reports.filter(r =>
          r.report_date >= options.dateRange!.start &&
          r.report_date <= options.dateRange!.end
        );
      }

      return reports;
    }

    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        badge_earned:badges(*),
        comments:report_comments(*),
        reactions:report_reactions(*)
      `)
      .eq('facility_id', facilityId)
      .order('report_date', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.dogId) {
      query = query.eq('dog_id', options.dogId);
    }
    if (options?.date) {
      query = query.eq('report_date', options.date);
    }
    if (options?.dateRange) {
      query = query.gte('report_date', options.dateRange.start).lte('report_date', options.dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as DailyReportWithDetails[];
  },

  async getById(id: string): Promise<DailyReportWithDetails | null> {
    if (isDemoMode()) {
      return DEMO_REPORTS.find(r => r.id === id) || null;
    }

    const { data, error } = await supabase
      .from('daily_reports')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        badge_earned:badges(*),
        comments:report_comments(*),
        reactions:report_reactions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DailyReportWithDetails;
  },

  async getByDogAndDate(dogId: string, date: string): Promise<DailyReportWithDetails | null> {
    if (isDemoMode()) {
      return DEMO_REPORTS.find(r => r.dog_id === dogId && r.report_date === date) || null;
    }

    const { data, error } = await supabase
      .from('daily_reports')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        badge_earned:badges(*),
        comments:report_comments(*),
        reactions:report_reactions(*)
      `)
      .eq('dog_id', dogId)
      .eq('report_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DailyReportWithDetails | null;
  },

  async getDrafts(facilityId: string): Promise<DailyReportWithDetails[]> {
    return this.getAll(facilityId, { status: 'draft' });
  },

  async getReady(facilityId: string): Promise<DailyReportWithDetails[]> {
    return this.getAll(facilityId, { status: 'ready' });
  },

  async getSent(facilityId: string): Promise<DailyReportWithDetails[]> {
    return this.getAll(facilityId, { status: 'sent' });
  },

  async getTodaysReports(facilityId: string): Promise<DailyReportWithDetails[]> {
    return this.getAll(facilityId, { date: formatDate(new Date()) });
  },

  async create(
    report: Omit<DailyReportFull, 'id' | 'created_at' | 'updated_at'>
  ): Promise<DailyReportFull> {
    if (isDemoMode()) {
      const newReport: DailyReportFull = {
        ...report,
        id: `report-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newReport;
    }

    const { data, error } = await supabase
      .from('daily_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<DailyReportFull>
  ): Promise<DailyReportFull> {
    if (isDemoMode()) {
      const report = DEMO_REPORTS.find(r => r.id === id);
      if (!report) throw new Error('Report not found');
      return { ...report, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('daily_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async generateReport(
    facilityId: string,
    dogId: string,
    programId: string | null,
    date: string,
    userId: string
  ): Promise<DailyReportFull> {
    // Check if report already exists
    const existing = await this.getByDogAndDate(dogId, date);
    if (existing) {
      return existing;
    }

    // In production, we would fetch activities for the dog on this date
    // and generate the summary automatically
    const activitiesSummary: ActivitySummary[] = [
      { type: 'training', duration_minutes: 45, count: 2 },
      { type: 'play', duration_minutes: 30, count: 1 },
      { type: 'potty', duration_minutes: 15, count: 4 },
      { type: 'rest', duration_minutes: 60, count: 2 },
    ];

    const skillsPracticed = ['Sit', 'Stay', 'Heel'];

    // Generate auto summary
    const autoSummary = generateAutoSummary(
      'Your dog', // In production, fetch dog name
      4, // Default mood rating
      4, // Default energy level
      activitiesSummary,
      skillsPracticed
    );

    const newReport: Omit<DailyReportFull, 'id' | 'created_at' | 'updated_at'> = {
      facility_id: facilityId,
      dog_id: dogId,
      program_id: programId,
      report_date: date,
      status: 'draft',
      auto_summary: autoSummary,
      trainer_notes: null,
      highlights: null,
      mood_rating: 4,
      energy_level: 4,
      appetite_rating: 4,
      training_focus_rating: null,
      sociability_rating: null,
      activities_summary: activitiesSummary,
      skills_practiced: skillsPracticed,
      highlight_photos: null,
      highlight_videos: null,
      badge_earned_id: null,
      sent_at: null,
      sent_by: null,
      opened_at: null,
      email_sent: false,
      push_sent: false,
      created_by: userId,
    };

    return this.create(newReport);
  },

  async markAsReady(id: string): Promise<DailyReportFull> {
    return this.update(id, { status: 'ready' });
  },

  async sendReport(id: string, userId: string): Promise<DailyReportFull> {
    // In production, this would:
    // 1. Send email via Resend
    // 2. Send push notification
    // 3. Update the report status

    const updates: Partial<DailyReportFull> = {
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_by: userId,
      email_sent: true, // Mocked for demo
      push_sent: true, // Mocked for demo
    };

    return this.update(id, updates);
  },

  async markAsOpened(id: string): Promise<DailyReportFull> {
    return this.update(id, {
      status: 'opened',
      opened_at: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bulkSend(ids: string[], userId: string): Promise<DailyReportFull[]> {
    const results = await Promise.all(
      ids.map(id => this.sendReport(id, userId))
    );
    return results;
  },

  async regenerateSummary(id: string): Promise<DailyReportFull> {
    const report = await this.getById(id);
    if (!report) throw new Error('Report not found');

    const newSummary = generateAutoSummary(
      report.dog?.name || 'Your dog',
      report.mood_rating || 4,
      report.energy_level || 4,
      report.activities_summary,
      report.skills_practiced || []
    );

    return this.update(id, { auto_summary: newSummary });
  },
};

// ============================================================================
// Report Templates Service
// ============================================================================

export const reportTemplatesService = {
  async getAll(facilityId: string): Promise<ReportTemplate[]> {
    if (isDemoMode()) {
      return DEMO_TEMPLATES;
    }

    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDefault(facilityId: string): Promise<ReportTemplate | null> {
    if (isDemoMode()) {
      return DEMO_TEMPLATES.find(t => t.is_default) || null;
    }

    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(
    template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ReportTemplate> {
    if (isDemoMode()) {
      const newTemplate: ReportTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newTemplate;
    }

    const { data, error } = await supabase
      .from('report_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    if (isDemoMode()) {
      const template = DEMO_TEMPLATES.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return { ...template, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    // Soft delete - just mark as inactive
    await supabase
      .from('report_templates')
      .update({ is_active: false })
      .eq('id', id);
  },
};

// ============================================================================
// Report Comments Service
// ============================================================================

export const reportCommentsService = {
  async getByReport(reportId: string): Promise<ReportComment[]> {
    if (isDemoMode()) {
      const report = DEMO_REPORTS.find(r => r.id === reportId);
      return report?.comments || [];
    }

    const { data, error } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(comment: {
    report_id: string;
    user_id: string;
    content: string;
    commenter_type: 'parent' | 'trainer';
  }): Promise<ReportComment> {
    if (isDemoMode()) {
      const newComment: ReportComment = {
        id: `comment-${Date.now()}`,
        ...comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newComment;
    }

    const { data, error } = await supabase
      .from('report_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, content: string): Promise<ReportComment> {
    if (isDemoMode()) {
      return {
        id,
        report_id: 'report-1',
        user_id: 'user-1',
        content,
        commenter_type: 'trainer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('report_comments')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('report_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Report Reactions Service
// ============================================================================

export const reportReactionsService = {
  async getByReport(reportId: string): Promise<ReportReaction[]> {
    if (isDemoMode()) {
      const report = DEMO_REPORTS.find(r => r.id === reportId);
      return report?.reactions || [];
    }

    const { data, error } = await supabase
      .from('report_reactions')
      .select('*')
      .eq('report_id', reportId);

    if (error) throw error;
    return data;
  },

  async add(reportId: string, userId: string, reaction: string): Promise<ReportReaction> {
    if (isDemoMode()) {
      const newReaction: ReportReaction = {
        id: `reaction-${Date.now()}`,
        report_id: reportId,
        user_id: userId,
        reaction,
        created_at: new Date().toISOString(),
      };
      return newReaction;
    }

    const { data, error } = await supabase
      .from('report_reactions')
      .insert({ report_id: reportId, user_id: userId, reaction })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(reportId: string, userId: string, reaction: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('report_reactions')
      .delete()
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .eq('reaction', reaction);

    if (error) throw error;
  },
};

// ============================================================================
// Combined Reports Service
// ============================================================================

export const reportsService = {
  reports: dailyReportsService,
  templates: reportTemplatesService,
  comments: reportCommentsService,
  reactions: reportReactionsService,

  async getReportStats(facilityId: string): Promise<{
    totalToday: number;
    drafts: number;
    ready: number;
    sent: number;
    avgMoodRating: number;
  }> {
    if (isDemoMode()) {
      const todaysReports = DEMO_REPORTS.filter(r => r.report_date === formatDate(new Date()));
      const drafts = todaysReports.filter(r => r.status === 'draft').length;
      const ready = todaysReports.filter(r => r.status === 'ready').length;
      const sent = DEMO_REPORTS.filter(r => r.status === 'sent').length;
      const avgMood = todaysReports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / (todaysReports.length || 1);

      return {
        totalToday: todaysReports.length,
        drafts,
        ready,
        sent,
        avgMoodRating: Math.round(avgMood * 10) / 10,
      };
    }

    const todayReports = await dailyReportsService.getTodaysReports(facilityId);
    const allReports = await dailyReportsService.getAll(facilityId);

    const drafts = todayReports.filter(r => r.status === 'draft').length;
    const ready = todayReports.filter(r => r.status === 'ready').length;
    const sent = allReports.filter(r => r.status === 'sent').length;
    const avgMood = todayReports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / (todayReports.length || 1);

    return {
      totalToday: todayReports.length,
      drafts,
      ready,
      sent,
      avgMoodRating: Math.round(avgMood * 10) / 10,
    };
  },
};
