// Database Types for K9 TrainPro
// These types mirror the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// Core Enums
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'trainer' | 'pet_parent';
export type ProgramType = 'board_train' | 'day_train' | 'private_lesson' | 'group_class';
export type ProgramStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type ActivityType =
  | 'kennel'
  | 'potty'
  | 'training'
  | 'play'
  | 'group_play'
  | 'feeding'
  | 'rest'
  | 'walk'
  | 'grooming'
  | 'medical';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type SkillProficiency = 'learning' | 'practicing' | 'mastered';
export type MediaType = 'photo' | 'video';
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

// Homework System Types
export type HomeworkStatus = 'draft' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
export type SubmissionStatus = 'pending' | 'submitted' | 'approved' | 'needs_revision';
export type HomeworkDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Calendar System Types
export type StayStatus = 'scheduled' | 'checked_in' | 'checked_out' | 'cancelled';
export type AppointmentType = 'training' | 'evaluation' | 'pickup' | 'dropoff' | 'grooming' | 'vet' | 'other';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

// Daily Report System Types
export type ReportStatus = 'draft' | 'ready' | 'sent' | 'opened';

// Video Library Types
export type VideoVisibility = 'private' | 'trainers' | 'clients' | 'public';
export type VideoCategory = 'obedience' | 'behavior' | 'agility' | 'tricks' | 'puppy' | 'leash' | 'recall' | 'socialization' | 'other';

// ============================================================================
// Database Tables
// ============================================================================

export interface Database {
  public: {
    Tables: {
      facilities: {
        Row: Facility;
        Insert: Omit<Facility, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Facility, 'id'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      families: {
        Row: Family;
        Insert: Omit<Family, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Family, 'id'>>;
      };
      dogs: {
        Row: Dog;
        Insert: Omit<Dog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Dog, 'id'>>;
      };
      programs: {
        Row: Program;
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Program, 'id'>>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'created_at'>;
        Update: Partial<Omit<Activity, 'id'>>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, 'id' | 'created_at'>;
        Update: Partial<Omit<Media, 'id'>>;
      };
      daily_reports: {
        Row: DailyReport;
        Insert: Omit<DailyReport, 'id' | 'created_at'>;
        Update: Partial<Omit<DailyReport, 'id'>>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Badge, 'id'>>;
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Skill, 'id'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at'>;
        Update: Partial<Omit<Booking, 'id'>>;
      };
      availability_settings: {
        Row: AvailabilitySettings;
        Insert: Omit<AvailabilitySettings, 'id'>;
        Update: Partial<Omit<AvailabilitySettings, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
      skill_assessments: {
        Row: SkillAssessment;
        Insert: Omit<SkillAssessment, 'id'>;
        Update: Partial<Omit<SkillAssessment, 'id'>>;
      };
      certificates: {
        Row: Certificate;
        Insert: Omit<Certificate, 'id' | 'created_at'>;
        Update: Partial<Omit<Certificate, 'id'>>;
      };
      comparisons: {
        Row: Comparison;
        Insert: Omit<Comparison, 'id' | 'created_at'>;
        Update: Partial<Omit<Comparison, 'id'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      vaccinations: {
        Row: Vaccination;
        Insert: Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vaccination, 'id'>>;
      };
      health_conditions: {
        Row: HealthCondition;
        Insert: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthCondition, 'id'>>;
      };
      medications: {
        Row: Medication;
        Insert: Omit<Medication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Medication, 'id'>>;
      };
      incidents: {
        Row: Incident;
        Insert: Omit<Incident, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Incident, 'id'>>;
      };
      homework_templates: {
        Row: HomeworkTemplate;
        Insert: Omit<HomeworkTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>;
        Update: Partial<Omit<HomeworkTemplate, 'id'>>;
      };
      homework_assignments: {
        Row: HomeworkAssignment;
        Insert: Omit<HomeworkAssignment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HomeworkAssignment, 'id'>>;
      };
      homework_submissions: {
        Row: HomeworkSubmission;
        Insert: Omit<HomeworkSubmission, 'id' | 'created_at'>;
        Update: Partial<Omit<HomeworkSubmission, 'id'>>;
      };
    };
  };
}

// ============================================================================
// Table Types
// ============================================================================

export interface Facility {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  settings: FacilitySettings | null;
  created_at: string;
  updated_at: string;
}

export interface FacilitySettings {
  kennel_max_minutes?: number;
  potty_interval_minutes?: number;
  daily_report_time?: string; // HH:MM format
  enable_realtime_updates?: boolean;
  enable_photo_sharing?: boolean;
  branding_primary_color?: string;
}

export interface User {
  id: string;
  auth_id: string;
  facility_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  facility_id: string;
  primary_contact_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dog {
  id: string;
  family_id: string;
  name: string;
  breed: string | null;
  date_of_birth: string | null;
  weight: number | null;
  gender: 'male' | 'female' | null;
  color: string | null;
  photo_url: string | null;
  microchip_id: string | null;
  medical_notes: string | null;
  behavior_notes: string | null;
  feeding_instructions: string | null;
  medications: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  dog_id: string;
  facility_id: string;
  type: ProgramType;
  name: string;
  start_date: string;
  end_date: string | null;
  status: ProgramStatus;
  assigned_trainer_id: string | null;
  goals: string[] | null;
  notes: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  program_id: string;
  dog_id: string;
  type: ActivityType;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  trainer_id: string;
  notes: string | null;
  buddy_dog_id: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  activity_id: string | null;
  dog_id: string;
  program_id: string | null;
  type: MediaType;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  uploaded_by: string;
  is_highlight: boolean;
  file_size: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DailyReport {
  id: string;
  program_id: string;
  dog_id: string;
  date: string;
  auto_summary: string | null;
  trainer_notes: string | null;
  highlight_photos: string[] | null;
  mood_rating: number | null; // 1-5 scale
  energy_level: number | null; // 1-5 scale
  appetite_rating: number | null; // 1-5 scale
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  dog_id: string;
  badge_type: string;
  tier: BadgeTier | null;
  earned_at: string;
  awarded_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  dog_id: string;
  program_id: string | null;
  skill_name: string;
  proficiency: SkillProficiency;
  before_video_url: string | null;
  after_video_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type BookingType = 'consultation' | 'evaluation' | 'training' | 'board_train' | 'day_train';
export type BookingSource = 'website' | 'phone' | 'referral' | 'walk_in';

export interface Booking {
  id: string;
  facility_id: string;
  family_id: string | null;
  program_id: string | null;
  status: BookingStatus;
  type: BookingType;
  date: string;
  start_time: string;
  end_time: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  dog_name: string;
  dog_breed: string | null;
  dog_age: string | null;
  notes: string | null;
  goals: string | null;
  source: BookingSource | null;
  created_at: string;
}

export interface AvailabilitySettings {
  id: string;
  facility_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_bookings_per_slot: number;
  enabled: boolean;
}

// Messaging System Types
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'system';
export type MessageSenderType = 'trainer' | 'parent' | 'system';

export interface Conversation {
  id: string;
  facility_id: string;
  family_id: string;
  dog_id: string | null;
  title: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  is_archived: boolean;
  is_pinned: boolean;
  trainer_unread_count: number;
  parent_unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  message_type: MessageType;
  content: string;
  media_url: string | null;
  media_thumbnail_url: string | null;
  media_filename: string | null;
  media_size_bytes: number | null;
  read_by_trainer: boolean;
  read_by_parent: boolean;
  read_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  facility_id: string;
  title: string;
  content: string;
  category: string | null;
  usage_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessment {
  id: string;
  dog_id: string;
  skill_id: string;
  level: number;
  notes: string | null;
  trainer_id: string;
  facility_id: string;
  assessed_at: string;
}

export type CertificateTemplate =
  | 'basic_obedience'
  | 'advanced_obedience'
  | 'board_and_train'
  | 'puppy_foundation'
  | 'behavior_modification'
  | 'canine_good_citizen';

export interface Certificate {
  id: string;
  dog_id: string;
  facility_id: string;
  template: CertificateTemplate;
  custom_title: string | null;
  custom_description: string | null;
  issued_date: string;
  trainer_id: string;
  program_id: string | null;
  skills_mastered: string[] | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface ComparisonMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  duration?: number;
  caption?: string;
}

export interface Comparison {
  id: string;
  dog_id: string;
  facility_id: string;
  title: string;
  description: string | null;
  skill_id: string | null;
  before_media: ComparisonMedia;
  after_media: ComparisonMedia;
  before_date: string;
  after_date: string;
  before_skill_level: number | null;
  after_skill_level: number | null;
  is_public: boolean;
  is_featured: boolean;
  views_count: number;
  created_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type VaccinationType =
  | 'rabies'
  | 'dhpp'
  | 'bordetella'
  | 'leptospirosis'
  | 'canine_influenza'
  | 'lyme'
  | 'other';

export interface Vaccination {
  id: string;
  dog_id: string;
  type: VaccinationType;
  name: string;
  date_administered: string;
  expiration_date: string;
  administered_by: string;
  lot_number: string | null;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ConditionSeverity = 'mild' | 'moderate' | 'severe';
export type ConditionStatus = 'active' | 'managed' | 'resolved';

export interface HealthCondition {
  id: string;
  dog_id: string;
  name: string;
  description: string | null;
  severity: ConditionSeverity;
  status: ConditionStatus;
  diagnosed_date: string | null;
  diagnosed_by: string | null;
  treatment_plan: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicationFrequency = 'once' | 'daily' | 'twice_daily' | 'weekly' | 'as_needed';

export interface Medication {
  id: string;
  dog_id: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  start_date: string;
  end_date: string | null;
  prescribing_vet: string | null;
  purpose: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType =
  | 'bite'
  | 'fight'
  | 'escape'
  | 'injury'
  | 'illness'
  | 'property_damage'
  | 'behavioral'
  | 'near_miss'
  | 'other';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  facility_id: string;
  dog_id: string;
  reported_by: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  incident_date: string;
  incident_time: string;
  witnesses: string[] | null;
  other_dogs_involved: string[] | null;
  injuries_reported: boolean;
  injury_details: string | null;
  actions_taken: string | null;
  follow_up_required: boolean;
  follow_up_notes: string | null;
  parent_notified: boolean;
  parent_notified_at: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Homework System Types
// ============================================================================

export interface HomeworkTemplate {
  id: string;
  facility_id: string;
  created_by: string;
  title: string;
  description: string | null;
  instructions: string;
  video_url: string | null;
  difficulty: HomeworkDifficulty;
  estimated_duration_minutes: number | null;
  skill_focus: string[] | null;
  tips: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface HomeworkAssignment {
  id: string;
  facility_id: string;
  template_id: string | null;
  dog_id: string;
  program_id: string | null;
  assigned_by: string;
  title: string;
  description: string | null;
  instructions: string;
  video_url: string | null;
  difficulty: HomeworkDifficulty;
  assigned_at: string;
  due_date: string;
  status: HomeworkStatus;
  completed_at: string | null;
  custom_notes: string | null;
  repetitions_required: number | null;
  created_at: string;
  updated_at: string;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  submitted_by: string;
  notes: string | null;
  video_url: string | null;
  photo_urls: string[] | null;
  status: SubmissionStatus;
  trainer_feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rating: number | null;
  created_at: string;
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

export interface DogWithFamily extends Dog {
  family: Family;
}

export interface DogWithProgram extends Dog {
  family: Family;
  active_program: Program | null;
}

export interface ProgramWithDog extends Program {
  dog: DogWithFamily;
  trainer: User | null;
}

export interface ActivityWithDetails extends Activity {
  dog: Dog;
  trainer: User;
  buddy_dog: Dog | null;
  media: Media[];
}

export interface DailyReportWithDetails extends DailyReport {
  dog: Dog;
  program: Program;
  activities: Activity[];
}

// Homework Extended Types
export interface HomeworkTemplateWithCreator extends HomeworkTemplate {
  creator: User;
}

export interface HomeworkAssignmentWithDetails extends HomeworkAssignment {
  dog: Dog;
  template: HomeworkTemplate | null;
  assigned_by_user: User;
  program: Program | null;
  submissions: HomeworkSubmission[];
}

export interface HomeworkSubmissionWithDetails extends HomeworkSubmission {
  assignment: HomeworkAssignment;
  submitted_by_user: User;
  reviewed_by_user: User | null;
}

// Messaging Extended Types
export interface ConversationWithDetails extends Conversation {
  family: Family;
  dog: Dog | null;
  messages: Message[];
}

export interface MessageWithSender extends Message {
  sender: User;
  reply_to: Message | null;
  reactions: MessageReaction[];
}

// ============================================================================
// Calendar System Types
// ============================================================================

export interface BoardTrainStay {
  id: string;
  facility_id: string;
  dog_id: string;
  program_id: string | null;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  status: StayStatus;
  kennel_number: string | null;
  special_instructions: string | null;
  dietary_notes: string | null;
  medical_notes: string | null;
  daily_rate: number | null;
  total_cost: number | null;
  deposit_amount: number | null;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CalendarAppointment {
  id: string;
  facility_id: string;
  dog_id: string | null;
  family_id: string | null;
  stay_id: string | null;
  trainer_id: string | null;
  title: string;
  description: string | null;
  appointment_type: AppointmentType;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence: RecurrencePattern;
  recurrence_end_date: string | null;
  parent_appointment_id: string | null;
  location: string | null;
  is_confirmed: boolean;
  is_completed: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  reminder_sent: boolean;
  notify_parent: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CalendarBlock {
  id: string;
  facility_id: string;
  trainer_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence: RecurrencePattern;
  recurrence_end_date: string | null;
  is_facility_closure: boolean;
  is_trainer_unavailable: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TrainingScheduleTemplate {
  id: string;
  facility_id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  start_time: string;
  duration_minutes: number;
  default_appointment_type: AppointmentType;
  default_trainer_id: string | null;
  default_location: string | null;
  default_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface StayDailyLog {
  id: string;
  stay_id: string;
  log_date: string;
  mood: string | null;
  appetite: string | null;
  energy_level: string | null;
  morning_potty: boolean;
  morning_potty_time: string | null;
  afternoon_potty: boolean;
  afternoon_potty_time: string | null;
  evening_potty: boolean;
  evening_potty_time: string | null;
  breakfast_eaten: boolean | null;
  lunch_eaten: boolean | null;
  dinner_eaten: boolean | null;
  training_notes: string | null;
  notes: string | null;
  photos: string[];
  videos: string[];
  created_at: string;
  updated_at: string;
  logged_by: string | null;
}

// Calendar Extended Types
export interface BoardTrainStayWithDetails extends BoardTrainStay {
  dog: Dog;
  program: Program | null;
  family: Family;
  daily_logs: StayDailyLog[];
  appointments: CalendarAppointment[];
}

export interface CalendarAppointmentWithDetails extends CalendarAppointment {
  dog: Dog | null;
  family: Family | null;
  stay: BoardTrainStay | null;
  trainer: User | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  type: 'stay' | 'appointment' | 'block';
  data: BoardTrainStay | CalendarAppointment | CalendarBlock;
}

// ============================================================================
// Daily Report System Types
// ============================================================================

export interface DailyReportFull {
  id: string;
  facility_id: string;
  dog_id: string;
  program_id: string | null;
  report_date: string;
  status: ReportStatus;
  auto_summary: string | null;
  trainer_notes: string | null;
  highlights: string[] | null;
  mood_rating: number | null;
  energy_level: number | null;
  appetite_rating: number | null;
  training_focus_rating: number | null;
  sociability_rating: number | null;
  activities_summary: ActivitySummary[];
  skills_practiced: string[] | null;
  highlight_photos: string[] | null;
  highlight_videos: string[] | null;
  badge_earned_id: string | null;
  sent_at: string | null;
  sent_by: string | null;
  opened_at: string | null;
  email_sent: boolean;
  push_sent: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ActivitySummary {
  type: string;
  duration_minutes: number;
  count: number;
  notes?: string;
}

export interface ReportTemplate {
  id: string;
  facility_id: string;
  name: string;
  description: string | null;
  summary_template: string | null;
  default_highlights: string[] | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ReportPreferences {
  id: string;
  family_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  daily_reports: boolean;
  weekly_summary: boolean;
  milestone_alerts: boolean;
  preferred_delivery_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  commenter_type: 'parent' | 'trainer';
  created_at: string;
  updated_at: string;
}

export interface ReportReaction {
  id: string;
  report_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

// Daily Report Extended Types
export interface DailyReportWithDetails extends DailyReportFull {
  dog: Dog;
  program: Program | null;
  badge_earned: Badge | null;
  comments: ReportComment[];
  reactions: ReportReaction[];
}

export interface ReportCommentWithUser extends ReportComment {
  user: { name: string; avatar_url: string | null };
}

// ============================================================================
// Video Library Types
// ============================================================================

export interface TrainingVideo {
  id: string;
  facility_id: string;
  title: string;
  description: string | null;
  category: VideoCategory;
  tags: string[];
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  visibility: VideoVisibility;
  is_featured: boolean;
  view_count: number;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

export interface VideoFolder {
  id: string;
  facility_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface VideoShare {
  id: string;
  video_id: string;
  family_id: string | null;
  dog_id: string | null;
  shared_by: string | null;
  message: string | null;
  viewed_at: string | null;
  created_at: string;
}

export interface VideoPlaylist {
  id: string;
  facility_id: string;
  name: string;
  description: string | null;
  visibility: VideoVisibility;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PlaylistVideo {
  id: string;
  playlist_id: string;
  video_id: string;
  position: number;
  created_at: string;
}

// Video Extended Types
export interface TrainingVideoWithDetails extends TrainingVideo {
  folder: VideoFolder | null;
  uploader: { name: string; avatar_url: string | null } | null;
}

export interface VideoFolderWithVideos extends VideoFolder {
  videos: TrainingVideo[];
  subfolders: VideoFolder[];
}

export interface VideoPlaylistWithVideos extends VideoPlaylist {
  videos: TrainingVideo[];
}

// ============================================================================
// Live Status Feed Types
// ============================================================================

export type StatusUpdateType =
  | 'arrival'
  | 'departure'
  | 'activity_start'
  | 'activity_end'
  | 'meal'
  | 'potty'
  | 'rest'
  | 'play'
  | 'photo'
  | 'video'
  | 'note'
  | 'milestone'
  | 'health_check';

export type DogMood = 'excited' | 'happy' | 'calm' | 'tired' | 'anxious' | 'playful';

export interface StatusFeedItem {
  id: string;
  facility_id: string | null;
  dog_id: string;
  created_by: string | null;
  update_type: StatusUpdateType;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  thumbnail_url: string | null;
  mood: DogMood | null;
  energy_level: number | null;
  activity_id: string | null;
  is_visible_to_parents: boolean;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedItemReaction {
  id: string;
  feed_item_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface FeedItemComment {
  id: string;
  feed_item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface StatusPreset {
  id: string;
  facility_id: string | null;
  update_type: StatusUpdateType;
  title: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// Live Status Feed Extended Types
export interface StatusFeedItemWithDetails extends StatusFeedItem {
  dog: Dog;
  created_by_user: { name: string; avatar_url: string | null } | null;
  reactions: FeedItemReaction[];
  comments: FeedItemCommentWithUser[];
}

export interface FeedItemCommentWithUser extends FeedItemComment {
  user: { name: string; avatar_url: string | null };
}

// ============================================================================
// Business Mode Configuration Types
// ============================================================================

export type BusinessMode = 'family_training' | 'facility';

export interface FacilityConfig {
  id: string;
  facility_id: string;

  // Core mode
  business_mode: BusinessMode;

  // Branding
  business_name: string | null;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;

  // Contact Info
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  timezone: string;

  // Feature Flags - Family Training Mode
  enable_pet_parent_portal: boolean;
  enable_homework_system: boolean;
  enable_messaging: boolean;
  enable_daily_reports: boolean;
  enable_video_library: boolean;
  enable_progress_tracking: boolean;
  enable_before_after_comparisons: boolean;
  enable_badges: boolean;
  enable_certificates: boolean;

  // Feature Flags - Facility Mode
  enable_boarding: boolean;
  enable_daycare: boolean;
  enable_grooming: boolean;
  enable_training_board: boolean;
  enable_live_status_feed: boolean;
  enable_kennel_tracking: boolean;
  enable_activity_timer: boolean;
  enable_multi_trainer: boolean;
  enable_calendar_scheduling: boolean;

  // Operational Settings
  max_dogs_per_trainer: number;
  max_kennel_time_minutes: number;
  default_potty_interval_minutes: number;
  business_hours_start: string;
  business_hours_end: string;
  operating_days: number[];

  // Notification Preferences
  send_arrival_notifications: boolean;
  send_departure_notifications: boolean;
  send_activity_notifications: boolean;
  send_report_notifications: boolean;
  daily_report_time: string;

  // Billing
  currency: string;
  enable_online_booking: boolean;
  enable_online_payments: boolean;

  created_at: string;
  updated_at: string;
}

export interface FeaturePreset {
  id: string;
  name: string;
  description: string | null;
  business_mode: BusinessMode;
  features: Record<string, boolean>;
  is_default: boolean;
  created_at: string;
}

// Feature flags interface for easy access
export interface FeatureFlags {
  petParentPortal: boolean;
  homeworkSystem: boolean;
  messaging: boolean;
  dailyReports: boolean;
  videoLibrary: boolean;
  progressTracking: boolean;
  beforeAfterComparisons: boolean;
  badges: boolean;
  certificates: boolean;
  boarding: boolean;
  daycare: boolean;
  grooming: boolean;
  trainingBoard: boolean;
  liveStatusFeed: boolean;
  kennelTracking: boolean;
  activityTimer: boolean;
  multiTrainer: boolean;
  calendarScheduling: boolean;
}
