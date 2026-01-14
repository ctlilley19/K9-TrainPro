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

export type ConversationStatus = 'active' | 'archived';

export interface Conversation {
  id: string;
  facility_id: string;
  family_id: string;
  dog_id: string | null;
  subject: string | null;
  status: ConversationStatus;
  last_message_at: string;
  created_at: string;
}

export type MessageSenderType = 'staff' | 'parent';

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  attachments: MessageAttachment[] | null;
  read_at: string | null;
  created_at: string;
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
