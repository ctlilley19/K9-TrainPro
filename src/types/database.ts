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
        Insert: Omit<Badge, 'id' | 'created_at'>;
        Update: Partial<Omit<Badge, 'id'>>;
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Skill, 'id'>>;
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
