// Re-export all database types
export * from './database';

// ============================================================================
// Application Types
// ============================================================================

// Auth State
export interface AuthState {
  user: import('./database').User | null;
  facility: import('./database').Facility | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Training Board Column
export interface TrainingColumn {
  id: import('./database').ActivityType;
  title: string;
  dogs: TrainingBoardDog[];
}

// Dog on Training Board
export interface TrainingBoardDog {
  id: string;
  name: string;
  breed: string | null;
  photo_url: string | null;
  program_type: import('./database').ProgramType;
  current_activity: import('./database').ActivityType;
  activity_started_at: string;
  trainer_name: string | null;
  has_alerts: boolean;
  buddy_dog_name: string | null;
}

// Timer State
export interface TimerState {
  dogId: string;
  activityType: import('./database').ActivityType;
  startedAt: Date;
  elapsedMinutes: number;
  status: 'normal' | 'warning' | 'urgent';
}

// Badge Definition
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'skill_tier' | 'achievement' | 'milestone';
  tier?: import('./database').BadgeTier;
  icon: string;
  color: string;
  requirements?: string;
}

// Skill Progress
export interface SkillProgress {
  skillName: string;
  proficiency: import('./database').SkillProficiency;
  progress: number; // 0-100
  lastUpdated: string;
}

// Daily Report Summary
export interface DailyReportSummary {
  date: string;
  totalActivities: number;
  trainingMinutes: number;
  playMinutes: number;
  pottyCount: number;
  feedingCount: number;
  highlightPhoto: string | null;
  moodRating: number | null;
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  facilityName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DogFormData {
  name: string;
  breed: string;
  date_of_birth: string;
  weight: number | null;
  gender: 'male' | 'female' | null;
  color: string;
  medical_notes: string;
  behavior_notes: string;
  feeding_instructions: string;
  medications: string;
}

export interface ProgramFormData {
  dog_id: string;
  type: import('./database').ProgramType;
  name: string;
  start_date: string;
  end_date: string;
  assigned_trainer_id: string;
  goals: string[];
  notes: string;
}

export interface ActivityFormData {
  dog_id: string;
  type: import('./database').ActivityType;
  notes: string;
  buddy_dog_id: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export interface DogFilters {
  programType?: import('./database').ProgramType;
  trainerId?: string;
  isActive?: boolean;
  search?: string;
}

export interface ActivityFilters {
  dogId?: string;
  type?: import('./database').ActivityType;
  dateFrom?: string;
  dateTo?: string;
  trainerId?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}
