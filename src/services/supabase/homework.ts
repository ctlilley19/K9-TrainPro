import { supabase, isDemoMode } from '@/lib/supabase';
import type {
  HomeworkTemplate,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeworkAssignmentWithDetails,
  HomeworkDifficulty,
  HomeworkStatus,
  SubmissionStatus,
} from '@/types/database';

// ============================================================================
// Types for Input Data
// ============================================================================

export interface CreateTemplateData {
  facility_id: string;
  created_by: string;
  title: string;
  description?: string;
  instructions: string;
  video_url?: string;
  difficulty?: HomeworkDifficulty;
  estimated_duration_minutes?: number;
  skill_focus?: string[];
  tips?: string;
}

export interface UpdateTemplateData extends Partial<Omit<CreateTemplateData, 'facility_id' | 'created_by'>> {
  is_active?: boolean;
}

export interface CreateAssignmentData {
  facility_id: string;
  template_id?: string;
  dog_id: string;
  program_id?: string;
  assigned_by: string;
  title: string;
  description?: string;
  instructions: string;
  video_url?: string;
  difficulty?: HomeworkDifficulty;
  due_date: string;
  custom_notes?: string;
  repetitions_required?: number;
}

export interface UpdateAssignmentData extends Partial<Omit<CreateAssignmentData, 'facility_id' | 'assigned_by'>> {
  status?: HomeworkStatus;
}

export interface CreateSubmissionData {
  assignment_id: string;
  submitted_by: string;
  notes?: string;
  video_url?: string;
  photo_urls?: string[];
}

export interface UpdateSubmissionData {
  status?: SubmissionStatus;
  trainer_feedback?: string;
  reviewed_by?: string;
  rating?: number;
}

export interface AssignmentFilters {
  dogId?: string;
  programId?: string;
  status?: HomeworkStatus;
  dueFrom?: string;
  dueTo?: string;
  assignedBy?: string;
}

export interface TemplateFilters {
  difficulty?: HomeworkDifficulty;
  isActive?: boolean;
  search?: string;
  skillFocus?: string;
}

// ============================================================================
// Homework Templates Service
// ============================================================================

export const homeworkTemplatesService = {
  /**
   * Get all templates for a facility
   */
  async getAll(facilityId: string, filters?: TemplateFilters): Promise<HomeworkTemplate[]> {
    if (isDemoMode()) {
      return mockTemplates.filter((t) => t.facility_id === facilityId);
    }

    let query = supabase
      .from('homework_templates')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get active templates for a facility
   */
  async getActive(facilityId: string): Promise<HomeworkTemplate[]> {
    return this.getAll(facilityId, { isActive: true });
  },

  /**
   * Get a single template by ID
   */
  async getById(id: string): Promise<HomeworkTemplate | null> {
    if (isDemoMode()) {
      return mockTemplates.find((t) => t.id === id) || null;
    }

    const { data, error } = await supabase
      .from('homework_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Create a new template
   */
  async create(data: CreateTemplateData): Promise<HomeworkTemplate> {
    if (isDemoMode()) {
      const newTemplate: HomeworkTemplate = {
        id: crypto.randomUUID(),
        facility_id: data.facility_id,
        created_by: data.created_by,
        title: data.title,
        description: data.description || null,
        instructions: data.instructions,
        video_url: data.video_url || null,
        difficulty: data.difficulty || 'beginner',
        estimated_duration_minutes: data.estimated_duration_minutes || null,
        skill_focus: data.skill_focus || null,
        tips: data.tips || null,
        is_active: true,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    }

    const { data: template, error } = await supabase
      .from('homework_templates')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  /**
   * Update a template
   */
  async update(id: string, data: UpdateTemplateData): Promise<HomeworkTemplate> {
    if (isDemoMode()) {
      const template = mockTemplates.find((t) => t.id === id);
      if (template) {
        Object.assign(template, data, { updated_at: new Date().toISOString() });
      }
      return template!;
    }

    const { data: template, error } = await supabase
      .from('homework_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  /**
   * Delete (soft delete by deactivating) a template
   */
  async deactivate(id: string): Promise<HomeworkTemplate> {
    return this.update(id, { is_active: false });
  },

  /**
   * Permanently delete a template
   */
  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      const index = mockTemplates.findIndex((t) => t.id === id);
      if (index > -1) mockTemplates.splice(index, 1);
      return;
    }

    const { error } = await supabase.from('homework_templates').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================================
// Homework Assignments Service
// ============================================================================

export const homeworkAssignmentsService = {
  /**
   * Get all assignments for a facility
   */
  async getAll(facilityId: string, filters?: AssignmentFilters): Promise<HomeworkAssignmentWithDetails[]> {
    if (isDemoMode()) {
      let assignments = mockAssignments.filter((a) => a.facility_id === facilityId);
      if (filters?.dogId) {
        assignments = assignments.filter((a) => a.dog_id === filters.dogId);
      }
      if (filters?.status) {
        assignments = assignments.filter((a) => a.status === filters.status);
      }
      return assignments as HomeworkAssignmentWithDetails[];
    }

    let query = supabase
      .from('homework_assignments')
      .select(`
        *,
        dog:dogs(id, name, photo_url, family:families(id, name)),
        template:homework_templates(id, title, difficulty),
        assigned_by_user:users!assigned_by(id, name, avatar_url),
        program:programs(id, name, type),
        submissions:homework_submissions(*)
      `)
      .eq('facility_id', facilityId)
      .order('due_date', { ascending: true });

    if (filters?.dogId) {
      query = query.eq('dog_id', filters.dogId);
    }

    if (filters?.programId) {
      query = query.eq('program_id', filters.programId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dueFrom) {
      query = query.gte('due_date', filters.dueFrom);
    }

    if (filters?.dueTo) {
      query = query.lte('due_date', filters.dueTo);
    }

    if (filters?.assignedBy) {
      query = query.eq('assigned_by', filters.assignedBy);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as HomeworkAssignmentWithDetails[];
  },

  /**
   * Get pending (not completed) assignments for a facility
   */
  async getPending(facilityId: string): Promise<HomeworkAssignmentWithDetails[]> {
    return this.getAll(facilityId, { status: 'assigned' });
  },

  /**
   * Get assignments for a specific dog
   */
  async getByDog(dogId: string): Promise<HomeworkAssignmentWithDetails[]> {
    if (isDemoMode()) {
      return mockAssignments.filter((a) => a.dog_id === dogId) as HomeworkAssignmentWithDetails[];
    }

    const { data, error } = await supabase
      .from('homework_assignments')
      .select(`
        *,
        dog:dogs(id, name, photo_url, family:families(id, name)),
        template:homework_templates(id, title, difficulty),
        assigned_by_user:users!assigned_by(id, name, avatar_url),
        program:programs(id, name, type),
        submissions:homework_submissions(*)
      `)
      .eq('dog_id', dogId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as HomeworkAssignmentWithDetails[];
  },

  /**
   * Get a single assignment by ID
   */
  async getById(id: string): Promise<HomeworkAssignmentWithDetails | null> {
    if (isDemoMode()) {
      return (mockAssignments.find((a) => a.id === id) as HomeworkAssignmentWithDetails) || null;
    }

    const { data, error } = await supabase
      .from('homework_assignments')
      .select(`
        *,
        dog:dogs(id, name, photo_url, family:families(id, name)),
        template:homework_templates(*),
        assigned_by_user:users!assigned_by(id, name, avatar_url),
        program:programs(id, name, type),
        submissions:homework_submissions(*, submitted_by_user:users!submitted_by(id, name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as HomeworkAssignmentWithDetails;
  },

  /**
   * Create a new assignment
   */
  async create(data: CreateAssignmentData): Promise<HomeworkAssignment> {
    if (isDemoMode()) {
      const newAssignment: HomeworkAssignment = {
        id: crypto.randomUUID(),
        facility_id: data.facility_id,
        template_id: data.template_id || null,
        dog_id: data.dog_id,
        program_id: data.program_id || null,
        assigned_by: data.assigned_by,
        title: data.title,
        description: data.description || null,
        instructions: data.instructions,
        video_url: data.video_url || null,
        difficulty: data.difficulty || 'beginner',
        assigned_at: new Date().toISOString(),
        due_date: data.due_date,
        status: 'assigned',
        completed_at: null,
        custom_notes: data.custom_notes || null,
        repetitions_required: data.repetitions_required || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockAssignments.push(newAssignment);
      return newAssignment;
    }

    const { data: assignment, error } = await supabase
      .from('homework_assignments')
      .insert({
        ...data,
        status: 'assigned',
      })
      .select()
      .single();

    if (error) throw error;
    return assignment;
  },

  /**
   * Create assignment from template
   */
  async createFromTemplate(
    templateId: string,
    dogId: string,
    dueDate: string,
    assignedBy: string,
    facilityId: string,
    programId?: string,
    customNotes?: string
  ): Promise<HomeworkAssignment> {
    const template = await homeworkTemplatesService.getById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return this.create({
      facility_id: facilityId,
      template_id: templateId,
      dog_id: dogId,
      program_id: programId,
      assigned_by: assignedBy,
      title: template.title,
      description: template.description || undefined,
      instructions: template.instructions,
      video_url: template.video_url || undefined,
      difficulty: template.difficulty,
      due_date: dueDate,
      custom_notes: customNotes,
    });
  },

  /**
   * Update an assignment
   */
  async update(id: string, data: UpdateAssignmentData): Promise<HomeworkAssignment> {
    if (isDemoMode()) {
      const assignment = mockAssignments.find((a) => a.id === id);
      if (assignment) {
        Object.assign(assignment, data, { updated_at: new Date().toISOString() });
        if (data.status === 'completed' && !assignment.completed_at) {
          assignment.completed_at = new Date().toISOString();
        }
      }
      return assignment!;
    }

    const updateData: Partial<HomeworkAssignment> = { ...data };
    if (data.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: assignment, error } = await supabase
      .from('homework_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return assignment;
  },

  /**
   * Mark assignment as in progress
   */
  async startProgress(id: string): Promise<HomeworkAssignment> {
    return this.update(id, { status: 'in_progress' });
  },

  /**
   * Mark assignment as completed
   */
  async complete(id: string): Promise<HomeworkAssignment> {
    return this.update(id, { status: 'completed' });
  },

  /**
   * Delete an assignment
   */
  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      const index = mockAssignments.findIndex((a) => a.id === id);
      if (index > -1) mockAssignments.splice(index, 1);
      return;
    }

    const { error } = await supabase.from('homework_assignments').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Get overdue assignments
   */
  async getOverdue(facilityId: string): Promise<HomeworkAssignmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];

    if (isDemoMode()) {
      return mockAssignments.filter(
        (a) =>
          a.facility_id === facilityId &&
          a.status !== 'completed' &&
          a.due_date < today
      ) as HomeworkAssignmentWithDetails[];
    }

    const { data, error } = await supabase
      .from('homework_assignments')
      .select(`
        *,
        dog:dogs(id, name, photo_url, family:families(id, name)),
        template:homework_templates(id, title),
        assigned_by_user:users!assigned_by(id, name)
      `)
      .eq('facility_id', facilityId)
      .neq('status', 'completed')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as HomeworkAssignmentWithDetails[];
  },
};

// ============================================================================
// Homework Submissions Service
// ============================================================================

export const homeworkSubmissionsService = {
  /**
   * Get all submissions for an assignment
   */
  async getByAssignment(assignmentId: string): Promise<HomeworkSubmission[]> {
    if (isDemoMode()) {
      return mockSubmissions.filter((s) => s.assignment_id === assignmentId);
    }

    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        submitted_by_user:users!submitted_by(id, name, avatar_url),
        reviewed_by_user:users!reviewed_by(id, name)
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get pending submissions that need review
   */
  async getPendingReview(facilityId: string): Promise<HomeworkSubmission[]> {
    if (isDemoMode()) {
      return mockSubmissions.filter((s) => s.status === 'submitted');
    }

    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        submitted_by_user:users!submitted_by(id, name),
        assignment:homework_assignments!inner(
          id, title, facility_id, dog_id,
          dog:dogs(id, name)
        )
      `)
      .eq('status', 'submitted')
      .eq('assignment.facility_id', facilityId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single submission by ID
   */
  async getById(id: string): Promise<HomeworkSubmission | null> {
    if (isDemoMode()) {
      return mockSubmissions.find((s) => s.id === id) || null;
    }

    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        submitted_by_user:users!submitted_by(id, name, avatar_url),
        reviewed_by_user:users!reviewed_by(id, name),
        assignment:homework_assignments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Create a new submission
   */
  async create(data: CreateSubmissionData): Promise<HomeworkSubmission> {
    if (isDemoMode()) {
      const newSubmission: HomeworkSubmission = {
        id: crypto.randomUUID(),
        assignment_id: data.assignment_id,
        submitted_by: data.submitted_by,
        notes: data.notes || null,
        video_url: data.video_url || null,
        photo_urls: data.photo_urls || null,
        status: 'submitted',
        trainer_feedback: null,
        reviewed_by: null,
        reviewed_at: null,
        rating: null,
        created_at: new Date().toISOString(),
      };
      mockSubmissions.push(newSubmission);

      // Update assignment status to in_progress
      const assignment = mockAssignments.find((a) => a.id === data.assignment_id);
      if (assignment && assignment.status === 'assigned') {
        assignment.status = 'in_progress';
      }

      return newSubmission;
    }

    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .insert({
        ...data,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) throw error;

    // Update assignment status to in_progress if it was just assigned
    await supabase
      .from('homework_assignments')
      .update({ status: 'in_progress' })
      .eq('id', data.assignment_id)
      .eq('status', 'assigned');

    return submission;
  },

  /**
   * Add trainer feedback/review
   */
  async review(
    id: string,
    feedback: string,
    status: SubmissionStatus,
    reviewedBy: string,
    rating?: number
  ): Promise<HomeworkSubmission> {
    if (isDemoMode()) {
      const submission = mockSubmissions.find((s) => s.id === id);
      if (submission) {
        submission.trainer_feedback = feedback;
        submission.status = status;
        submission.reviewed_by = reviewedBy;
        submission.reviewed_at = new Date().toISOString();
        if (rating) submission.rating = rating;
      }
      return submission!;
    }

    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .update({
        trainer_feedback: feedback,
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        rating,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return submission;
  },

  /**
   * Approve a submission
   */
  async approve(id: string, reviewedBy: string, feedback?: string, rating?: number): Promise<HomeworkSubmission> {
    return this.review(id, feedback || 'Great work!', 'approved', reviewedBy, rating);
  },

  /**
   * Request revision on a submission
   */
  async requestRevision(id: string, reviewedBy: string, feedback: string): Promise<HomeworkSubmission> {
    return this.review(id, feedback, 'needs_revision', reviewedBy);
  },

  /**
   * Delete a submission
   */
  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      const index = mockSubmissions.findIndex((s) => s.id === id);
      if (index > -1) mockSubmissions.splice(index, 1);
      return;
    }

    const { error } = await supabase.from('homework_submissions').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================================
// Combined Homework Service
// ============================================================================

export const homeworkService = {
  templates: homeworkTemplatesService,
  assignments: homeworkAssignmentsService,
  submissions: homeworkSubmissionsService,

  /**
   * Get homework dashboard stats for a facility
   */
  async getDashboardStats(facilityId: string): Promise<{
    totalAssignments: number;
    pendingAssignments: number;
    overdueAssignments: number;
    completedThisWeek: number;
    pendingReviews: number;
    averageCompletionRate: number;
  }> {
    if (isDemoMode()) {
      const assignments = mockAssignments.filter((a) => a.facility_id === facilityId);
      const pending = assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress');
      const today = new Date().toISOString().split('T')[0];
      const overdue = assignments.filter((a) => a.status !== 'completed' && a.due_date < today);
      const completed = assignments.filter((a) => a.status === 'completed');
      const pendingReviews = mockSubmissions.filter((s) => s.status === 'submitted');

      return {
        totalAssignments: assignments.length,
        pendingAssignments: pending.length,
        overdueAssignments: overdue.length,
        completedThisWeek: completed.length,
        pendingReviews: pendingReviews.length,
        averageCompletionRate: assignments.length > 0 ? (completed.length / assignments.length) * 100 : 0,
      };
    }

    // For real data, we'd use aggregation queries
    const [assignments, submissions] = await Promise.all([
      this.assignments.getAll(facilityId),
      this.submissions.getPendingReview(facilityId),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const pending = assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress');
    const overdue = assignments.filter((a) => a.status !== 'completed' && a.due_date < today);
    const completedThisWeek = assignments.filter(
      (a) => a.status === 'completed' && a.completed_at && a.completed_at >= weekAgo
    );
    const completed = assignments.filter((a) => a.status === 'completed');

    return {
      totalAssignments: assignments.length,
      pendingAssignments: pending.length,
      overdueAssignments: overdue.length,
      completedThisWeek: completedThisWeek.length,
      pendingReviews: submissions.length,
      averageCompletionRate: assignments.length > 0 ? (completed.length / assignments.length) * 100 : 0,
    };
  },
};

// ============================================================================
// Mock Data for Demo Mode
// ============================================================================

const mockTemplates: HomeworkTemplate[] = [
  {
    id: 'template-1',
    facility_id: '11111111-1111-1111-1111-111111111111',
    created_by: '22222222-2222-2222-2222-222222222222',
    title: 'Basic Sit Practice',
    description: 'Daily sit command practice routine',
    instructions:
      '1. Start in a quiet room with minimal distractions\n2. Hold a treat above your dog\'s nose\n3. Say "Sit" clearly once\n4. Wait for your dog to sit, then immediately reward\n5. Repeat 10 times per session',
    video_url: 'https://example.com/sit-demo.mp4',
    difficulty: 'beginner',
    estimated_duration_minutes: 10,
    skill_focus: ['sit', 'focus', 'impulse control'],
    tips: 'Keep sessions short and fun! End on a positive note.',
    is_active: true,
    usage_count: 15,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'template-2',
    facility_id: '11111111-1111-1111-1111-111111111111',
    created_by: '22222222-2222-2222-2222-222222222222',
    title: 'Recall Foundation',
    description: 'Building a reliable recall command',
    instructions:
      '1. Start in a fenced area or on a long line\n2. Let your dog wander a few feet away\n3. Say their name followed by "Come!"\n4. Reward enthusiastically when they return\n5. Never call them for something they dislike',
    video_url: null,
    difficulty: 'intermediate',
    estimated_duration_minutes: 15,
    skill_focus: ['recall', 'focus'],
    tips: 'Make coming to you the best thing that happens all day!',
    is_active: true,
    usage_count: 8,
    created_at: '2025-01-05T14:00:00Z',
    updated_at: '2025-01-05T14:00:00Z',
  },
];

const mockAssignments: HomeworkAssignment[] = [
  {
    id: 'assignment-1',
    facility_id: '11111111-1111-1111-1111-111111111111',
    template_id: 'template-1',
    dog_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    program_id: 'program-1',
    assigned_by: '22222222-2222-2222-2222-222222222222',
    title: 'Basic Sit Practice',
    description: 'Daily sit command practice routine',
    instructions: '1. Start in a quiet room...',
    video_url: 'https://example.com/sit-demo.mp4',
    difficulty: 'beginner',
    assigned_at: '2025-01-10T09:00:00Z',
    due_date: '2025-01-17',
    status: 'in_progress',
    completed_at: null,
    custom_notes: 'Focus on duration - Max can sit but breaks quickly',
    repetitions_required: 3,
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-12T15:00:00Z',
  },
  {
    id: 'assignment-2',
    facility_id: '11111111-1111-1111-1111-111111111111',
    template_id: null,
    dog_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    program_id: 'program-2',
    assigned_by: '22222222-2222-2222-2222-222222222222',
    title: 'Leash Walking Practice',
    description: 'Practice loose leash walking around the neighborhood',
    instructions: 'Walk for 15 minutes, rewarding every few steps of loose leash.',
    video_url: null,
    difficulty: 'intermediate',
    assigned_at: '2025-01-11T10:00:00Z',
    due_date: '2025-01-18',
    status: 'assigned',
    completed_at: null,
    custom_notes: null,
    repetitions_required: 5,
    created_at: '2025-01-11T10:00:00Z',
    updated_at: '2025-01-11T10:00:00Z',
  },
];

const mockSubmissions: HomeworkSubmission[] = [
  {
    id: 'submission-1',
    assignment_id: 'assignment-1',
    submitted_by: '33333333-3333-3333-3333-333333333333',
    notes: 'Max did great today! He held the sit for 10 seconds.',
    video_url: 'https://example.com/max-sit-practice.mp4',
    photo_urls: null,
    status: 'approved',
    trainer_feedback: 'Excellent progress! Try increasing duration to 15 seconds next.',
    reviewed_by: '22222222-2222-2222-2222-222222222222',
    reviewed_at: '2025-01-12T16:00:00Z',
    rating: 4,
    created_at: '2025-01-12T14:00:00Z',
  },
];

export default homeworkService;
