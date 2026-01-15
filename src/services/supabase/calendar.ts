// Calendar Service Layer for K9 ProTrain
// Handles Board & Train stays, appointments, and schedule management

import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_FACILITY_ID } from '@/lib/demo-config';
import type {
  BoardTrainStay,
  BoardTrainStayWithDetails,
  CalendarAppointment,
  CalendarAppointmentWithDetails,
  CalendarBlock,
  TrainingScheduleTemplate,
  StayDailyLog,
  CalendarEvent,
  StayStatus,
  AppointmentType,
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

const DEMO_STAYS: BoardTrainStayWithDetails[] = [
  {
    id: 'stay-1',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-1',
    program_id: 'prog-1',
    check_in_date: formatDate(addDays(today, -5)),
    check_out_date: formatDate(addDays(today, 9)),
    actual_check_in: addDays(today, -5).toISOString(),
    actual_check_out: null,
    status: 'checked_in',
    kennel_number: 'K-101',
    special_instructions: 'Max prefers his bed in the corner. Loves belly rubs after training.',
    dietary_notes: 'Blue Buffalo kibble, 2 cups AM, 2 cups PM',
    medical_notes: 'Completed heartworm prevention on Day 1',
    daily_rate: 85,
    total_cost: 1190,
    deposit_amount: 300,
    deposit_paid: true,
    created_at: addDays(today, -14).toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: {
      id: 'dog-1',
      family_id: 'family-1',
      name: 'Max',
      breed: 'Golden Retriever',
      date_of_birth: '2022-03-15',
      weight: 75,
      gender: 'male',
      color: 'Golden',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
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
      goals: ['Basic obedience', 'Leash manners', 'Recall'],
      notes: null,
      before_photo_url: null,
      after_photo_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    family: {
      id: 'family-1',
      facility_id: DEMO_FACILITY_ID,
      primary_contact_id: 'user-1',
      name: 'Johnson Family',
      address: '123 Oak Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '(512) 555-1234',
      email: 'johnson@example.com',
      emergency_contact_name: 'Sarah Johnson',
      emergency_contact_phone: '(512) 555-5678',
      vet_name: 'Austin Pet Hospital',
      vet_phone: '(512) 555-9999',
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    daily_logs: [],
    appointments: [],
  },
  {
    id: 'stay-2',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-2',
    program_id: 'prog-2',
    check_in_date: formatDate(addDays(today, -3)),
    check_out_date: formatDate(addDays(today, 4)),
    actual_check_in: addDays(today, -3).toISOString(),
    actual_check_out: null,
    status: 'checked_in',
    kennel_number: 'K-102',
    special_instructions: 'Bella needs a slow introduction to other dogs.',
    dietary_notes: 'Grain-free food only',
    medical_notes: null,
    daily_rate: 85,
    total_cost: 595,
    deposit_amount: 200,
    deposit_paid: true,
    created_at: addDays(today, -10).toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: {
      id: 'dog-2',
      family_id: 'family-2',
      name: 'Bella',
      breed: 'German Shepherd',
      date_of_birth: '2021-08-20',
      weight: 65,
      gender: 'female',
      color: 'Black and Tan',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
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
      goals: ['Impulse control', 'Greeting behavior'],
      notes: null,
      before_photo_url: null,
      after_photo_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    family: {
      id: 'family-2',
      facility_id: DEMO_FACILITY_ID,
      primary_contact_id: 'user-2',
      name: 'Smith Family',
      address: '456 Maple Ave',
      city: 'Austin',
      state: 'TX',
      zip: '78702',
      phone: '(512) 555-2345',
      email: 'smith@example.com',
      emergency_contact_name: 'John Smith',
      emergency_contact_phone: '(512) 555-6789',
      vet_name: null,
      vet_phone: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    daily_logs: [],
    appointments: [],
  },
  {
    id: 'stay-3',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-3',
    program_id: null,
    check_in_date: formatDate(addDays(today, 2)),
    check_out_date: formatDate(addDays(today, 16)),
    actual_check_in: null,
    actual_check_out: null,
    status: 'scheduled',
    kennel_number: 'K-103',
    special_instructions: null,
    dietary_notes: null,
    medical_notes: null,
    daily_rate: 85,
    total_cost: 1190,
    deposit_amount: 300,
    deposit_paid: false,
    created_at: addDays(today, -7).toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: {
      id: 'dog-3',
      family_id: 'family-3',
      name: 'Charlie',
      breed: 'Labrador Retriever',
      date_of_birth: '2023-01-10',
      weight: 55,
      gender: 'male',
      color: 'Chocolate',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    program: null,
    family: {
      id: 'family-3',
      facility_id: DEMO_FACILITY_ID,
      primary_contact_id: 'user-3',
      name: 'Williams Family',
      address: '789 Pine St',
      city: 'Austin',
      state: 'TX',
      zip: '78703',
      phone: '(512) 555-3456',
      email: 'williams@example.com',
      emergency_contact_name: null,
      emergency_contact_phone: null,
      vet_name: null,
      vet_phone: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    daily_logs: [],
    appointments: [],
  },
];

const DEMO_APPOINTMENTS: CalendarAppointmentWithDetails[] = [
  {
    id: 'appt-1',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-1',
    family_id: 'family-1',
    stay_id: 'stay-1',
    trainer_id: 'demo-user',
    title: 'Morning Training - Max',
    description: 'Basic obedience and leash work',
    appointment_type: 'training',
    start_time: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
    all_day: false,
    recurrence: 'daily',
    recurrence_end_date: formatDate(addDays(today, 9)),
    parent_appointment_id: null,
    location: 'Training Yard A',
    is_confirmed: true,
    is_completed: false,
    is_cancelled: false,
    cancellation_reason: null,
    reminder_sent: false,
    notify_parent: true,
    color: '#3B82F6',
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: DEMO_STAYS[0].dog,
    family: DEMO_STAYS[0].family,
    stay: null,
    trainer: null,
  },
  {
    id: 'appt-2',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-2',
    family_id: 'family-2',
    stay_id: 'stay-2',
    trainer_id: 'demo-user',
    title: 'Impulse Control Session - Bella',
    description: 'Working on waiting at doors and not jumping',
    appointment_type: 'training',
    start_time: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
    all_day: false,
    recurrence: 'daily',
    recurrence_end_date: formatDate(addDays(today, 4)),
    parent_appointment_id: null,
    location: 'Indoor Training Room',
    is_confirmed: true,
    is_completed: false,
    is_cancelled: false,
    cancellation_reason: null,
    reminder_sent: false,
    notify_parent: true,
    color: '#10B981',
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: DEMO_STAYS[1].dog,
    family: DEMO_STAYS[1].family,
    stay: null,
    trainer: null,
  },
  {
    id: 'appt-3',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-4',
    family_id: 'family-4',
    stay_id: null,
    trainer_id: 'demo-user',
    title: 'Private Lesson - Luna',
    description: 'Loose leash walking',
    appointment_type: 'training',
    start_time: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(15, 0, 0, 0)).toISOString(),
    all_day: false,
    recurrence: 'weekly',
    recurrence_end_date: formatDate(addDays(today, 28)),
    parent_appointment_id: null,
    location: 'Training Yard B',
    is_confirmed: true,
    is_completed: false,
    is_cancelled: false,
    cancellation_reason: null,
    reminder_sent: true,
    notify_parent: true,
    color: '#8B5CF6',
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: {
      id: 'dog-4',
      family_id: 'family-4',
      name: 'Luna',
      breed: 'Border Collie',
      date_of_birth: '2022-06-15',
      weight: 45,
      gender: 'female',
      color: 'Black and White',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    family: {
      id: 'family-4',
      facility_id: DEMO_FACILITY_ID,
      primary_contact_id: 'user-4',
      name: 'Davis Family',
      address: '321 Elm St',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
      phone: '(512) 555-4567',
      email: 'davis@example.com',
      emergency_contact_name: null,
      emergency_contact_phone: null,
      vet_name: null,
      vet_phone: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    stay: null,
    trainer: null,
  },
  {
    id: 'appt-4',
    facility_id: DEMO_FACILITY_ID,
    dog_id: 'dog-3',
    family_id: 'family-3',
    stay_id: 'stay-3',
    trainer_id: null,
    title: 'Check-in - Charlie',
    description: 'New client intake and kennel assignment',
    appointment_type: 'dropoff',
    start_time: new Date(addDays(today, 2).setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(addDays(today, 2).setHours(9, 30, 0, 0)).toISOString(),
    all_day: false,
    recurrence: 'none',
    recurrence_end_date: null,
    parent_appointment_id: null,
    location: 'Front Office',
    is_confirmed: false,
    is_completed: false,
    is_cancelled: false,
    cancellation_reason: null,
    reminder_sent: false,
    notify_parent: true,
    color: '#F59E0B',
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
    dog: DEMO_STAYS[2].dog,
    family: DEMO_STAYS[2].family,
    stay: null,
    trainer: null,
  },
];

const DEMO_BLOCKS: CalendarBlock[] = [
  {
    id: 'block-1',
    facility_id: DEMO_FACILITY_ID,
    trainer_id: null,
    title: 'Staff Meeting',
    description: 'Weekly team meeting',
    start_time: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
    end_time: new Date(today.setHours(8, 30, 0, 0)).toISOString(),
    all_day: false,
    recurrence: 'weekly',
    recurrence_end_date: null,
    is_facility_closure: false,
    is_trainer_unavailable: false,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'block-2',
    facility_id: DEMO_FACILITY_ID,
    trainer_id: null,
    title: 'Closed - Holiday',
    description: 'Facility closed for holiday',
    start_time: addDays(today, 14).toISOString(),
    end_time: addDays(today, 14).toISOString(),
    all_day: true,
    recurrence: 'none',
    recurrence_end_date: null,
    is_facility_closure: true,
    is_trainer_unavailable: false,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
];

const DEMO_SCHEDULE_TEMPLATES: TrainingScheduleTemplate[] = [
  {
    id: 'template-1',
    facility_id: DEMO_FACILITY_ID,
    name: 'Morning Training Block',
    description: 'Standard morning training session',
    day_of_week: null,
    start_time: '09:00:00',
    duration_minutes: 60,
    default_appointment_type: 'training',
    default_trainer_id: null,
    default_location: 'Training Yard A',
    default_color: '#3B82F6',
    is_active: true,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'template-2',
    facility_id: DEMO_FACILITY_ID,
    name: 'Afternoon Training Block',
    description: 'Standard afternoon training session',
    day_of_week: null,
    start_time: '14:00:00',
    duration_minutes: 60,
    default_appointment_type: 'training',
    default_trainer_id: null,
    default_location: 'Training Yard B',
    default_color: '#10B981',
    is_active: true,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
  {
    id: 'template-3',
    facility_id: DEMO_FACILITY_ID,
    name: 'Evaluation Appointment',
    description: 'New client evaluation',
    day_of_week: null,
    start_time: '10:00:00',
    duration_minutes: 90,
    default_appointment_type: 'evaluation',
    default_trainer_id: null,
    default_location: 'Indoor Training Room',
    default_color: '#8B5CF6',
    is_active: true,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    created_by: 'demo-user',
  },
];

const DEMO_DAILY_LOGS: StayDailyLog[] = [
  {
    id: 'log-1',
    stay_id: 'stay-1',
    log_date: formatDate(addDays(today, -1)),
    mood: 'Happy and playful',
    appetite: 'Excellent',
    energy_level: 'High',
    morning_potty: true,
    morning_potty_time: addDays(today, -1).toISOString(),
    afternoon_potty: true,
    afternoon_potty_time: addDays(today, -1).toISOString(),
    evening_potty: true,
    evening_potty_time: addDays(today, -1).toISOString(),
    breakfast_eaten: true,
    lunch_eaten: null,
    dinner_eaten: true,
    training_notes: 'Great progress on sit-stay. Holding for 30 seconds now!',
    notes: 'Max had a wonderful day. Played well with Bella during group time.',
    photos: [],
    videos: [],
    created_at: addDays(today, -1).toISOString(),
    updated_at: addDays(today, -1).toISOString(),
    logged_by: 'demo-user',
  },
  {
    id: 'log-2',
    stay_id: 'stay-2',
    log_date: formatDate(addDays(today, -1)),
    mood: 'Calm and focused',
    appetite: 'Good',
    energy_level: 'Medium',
    morning_potty: true,
    morning_potty_time: addDays(today, -1).toISOString(),
    afternoon_potty: true,
    afternoon_potty_time: addDays(today, -1).toISOString(),
    evening_potty: true,
    evening_potty_time: addDays(today, -1).toISOString(),
    breakfast_eaten: true,
    lunch_eaten: null,
    dinner_eaten: true,
    training_notes: 'Working on door manners. Shows improvement with "wait" command.',
    notes: 'Bella was a bit hesitant during morning introduction but warmed up by afternoon.',
    photos: [],
    videos: [],
    created_at: addDays(today, -1).toISOString(),
    updated_at: addDays(today, -1).toISOString(),
    logged_by: 'demo-user',
  },
];

// ============================================================================
// Board & Train Stays Service
// ============================================================================

export const staysService = {
  async getAll(facilityId: string): Promise<BoardTrainStayWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_STAYS;
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        family:dogs(family:families(*))
      `)
      .eq('facility_id', facilityId)
      .order('check_in_date', { ascending: true });

    if (error) throw error;
    return data as BoardTrainStayWithDetails[];
  },

  async getById(id: string): Promise<BoardTrainStayWithDetails | null> {
    if (isDemoMode()) {
      return DEMO_STAYS.find(s => s.id === id) || null;
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        family:dogs(family:families(*)),
        daily_logs:stay_daily_logs(*),
        appointments:calendar_appointments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BoardTrainStayWithDetails;
  },

  async getActive(facilityId: string): Promise<BoardTrainStayWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_STAYS.filter(s => s.status === 'checked_in');
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        family:dogs(family:families(*))
      `)
      .eq('facility_id', facilityId)
      .eq('status', 'checked_in')
      .order('check_in_date', { ascending: true });

    if (error) throw error;
    return data as BoardTrainStayWithDetails[];
  },

  async getUpcoming(facilityId: string): Promise<BoardTrainStayWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_STAYS.filter(s => s.status === 'scheduled');
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        family:dogs(family:families(*))
      `)
      .eq('facility_id', facilityId)
      .eq('status', 'scheduled')
      .gte('check_in_date', new Date().toISOString().split('T')[0])
      .order('check_in_date', { ascending: true });

    if (error) throw error;
    return data as BoardTrainStayWithDetails[];
  },

  async getByDateRange(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<BoardTrainStayWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_STAYS.filter(s => {
        const checkIn = new Date(s.check_in_date);
        const checkOut = new Date(s.check_out_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return (checkIn <= end && checkOut >= start);
      });
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .select(`
        *,
        dog:dogs(*),
        program:programs(*),
        family:dogs(family:families(*))
      `)
      .eq('facility_id', facilityId)
      .lte('check_in_date', endDate)
      .gte('check_out_date', startDate)
      .order('check_in_date', { ascending: true });

    if (error) throw error;
    return data as BoardTrainStayWithDetails[];
  },

  async create(stay: Omit<BoardTrainStay, 'id' | 'created_at' | 'updated_at'>): Promise<BoardTrainStay> {
    if (isDemoMode()) {
      const newStay: BoardTrainStay = {
        ...stay,
        id: `stay-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newStay;
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .insert(stay)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BoardTrainStay>): Promise<BoardTrainStay> {
    if (isDemoMode()) {
      const stay = DEMO_STAYS.find(s => s.id === id);
      if (!stay) throw new Error('Stay not found');
      return { ...stay, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('board_train_stays')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkIn(id: string): Promise<BoardTrainStay> {
    return this.update(id, {
      status: 'checked_in',
      actual_check_in: new Date().toISOString(),
    });
  },

  async checkOut(id: string): Promise<BoardTrainStay> {
    return this.update(id, {
      status: 'checked_out',
      actual_check_out: new Date().toISOString(),
    });
  },

  async cancel(id: string): Promise<BoardTrainStay> {
    return this.update(id, {
      status: 'cancelled',
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('board_train_stays')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Calendar Appointments Service
// ============================================================================

export const appointmentsService = {
  async getAll(facilityId: string): Promise<CalendarAppointmentWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_APPOINTMENTS;
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('facility_id', facilityId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as CalendarAppointmentWithDetails[];
  },

  async getById(id: string): Promise<CalendarAppointmentWithDetails | null> {
    if (isDemoMode()) {
      return DEMO_APPOINTMENTS.find(a => a.id === id) || null;
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CalendarAppointmentWithDetails;
  },

  async getByDateRange(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAppointmentWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_APPOINTMENTS.filter(a => {
        const start = new Date(a.start_time);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        return start >= rangeStart && start <= rangeEnd;
      });
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('facility_id', facilityId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as CalendarAppointmentWithDetails[];
  },

  async getByDog(dogId: string): Promise<CalendarAppointmentWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_APPOINTMENTS.filter(a => a.dog_id === dogId);
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('dog_id', dogId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as CalendarAppointmentWithDetails[];
  },

  async getByTrainer(trainerId: string): Promise<CalendarAppointmentWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_APPOINTMENTS.filter(a => a.trainer_id === trainerId);
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('trainer_id', trainerId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as CalendarAppointmentWithDetails[];
  },

  async getUpcoming(
    facilityId: string,
    limit: number = 10
  ): Promise<CalendarAppointmentWithDetails[]> {
    if (isDemoMode()) {
      const now = new Date();
      return DEMO_APPOINTMENTS
        .filter(a => new Date(a.start_time) >= now && !a.is_cancelled)
        .slice(0, limit);
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .select(`
        *,
        dog:dogs(*),
        family:families(*),
        stay:board_train_stays(*),
        trainer:users(*)
      `)
      .eq('facility_id', facilityId)
      .gte('start_time', new Date().toISOString())
      .eq('is_cancelled', false)
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as CalendarAppointmentWithDetails[];
  },

  async create(
    appointment: Omit<CalendarAppointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CalendarAppointment> {
    if (isDemoMode()) {
      const newAppointment: CalendarAppointment = {
        ...appointment,
        id: `appt-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newAppointment;
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CalendarAppointment>
  ): Promise<CalendarAppointment> {
    if (isDemoMode()) {
      const appt = DEMO_APPOINTMENTS.find(a => a.id === id);
      if (!appt) throw new Error('Appointment not found');
      return { ...appt, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('calendar_appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async confirm(id: string): Promise<CalendarAppointment> {
    return this.update(id, { is_confirmed: true });
  },

  async complete(id: string): Promise<CalendarAppointment> {
    return this.update(id, { is_completed: true });
  },

  async cancel(id: string, reason?: string): Promise<CalendarAppointment> {
    return this.update(id, {
      is_cancelled: true,
      cancellation_reason: reason || null,
    });
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('calendar_appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Calendar Blocks Service
// ============================================================================

export const blocksService = {
  async getAll(facilityId: string): Promise<CalendarBlock[]> {
    if (isDemoMode()) {
      return DEMO_BLOCKS;
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
      .select('*')
      .eq('facility_id', facilityId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getByDateRange(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarBlock[]> {
    if (isDemoMode()) {
      return DEMO_BLOCKS.filter(b => {
        const start = new Date(b.start_time);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        return start >= rangeStart && start <= rangeEnd;
      });
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
      .select('*')
      .eq('facility_id', facilityId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(
    block: Omit<CalendarBlock, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CalendarBlock> {
    if (isDemoMode()) {
      const newBlock: CalendarBlock = {
        ...block,
        id: `block-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newBlock;
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert(block)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<CalendarBlock>): Promise<CalendarBlock> {
    if (isDemoMode()) {
      const block = DEMO_BLOCKS.find(b => b.id === id);
      if (!block) throw new Error('Block not found');
      return { ...block, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
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

    const { error } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Schedule Templates Service
// ============================================================================

export const scheduleTemplatesService = {
  async getAll(facilityId: string): Promise<TrainingScheduleTemplate[]> {
    if (isDemoMode()) {
      return DEMO_SCHEDULE_TEMPLATES;
    }

    const { data, error } = await supabase
      .from('training_schedule_templates')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(
    template: Omit<TrainingScheduleTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TrainingScheduleTemplate> {
    if (isDemoMode()) {
      const newTemplate: TrainingScheduleTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newTemplate;
    }

    const { data, error } = await supabase
      .from('training_schedule_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<TrainingScheduleTemplate>
  ): Promise<TrainingScheduleTemplate> {
    if (isDemoMode()) {
      const template = DEMO_SCHEDULE_TEMPLATES.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return { ...template, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('training_schedule_templates')
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

    const { error } = await supabase
      .from('training_schedule_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================================================
// Stay Daily Logs Service
// ============================================================================

export const dailyLogsService = {
  async getByStay(stayId: string): Promise<StayDailyLog[]> {
    if (isDemoMode()) {
      return DEMO_DAILY_LOGS.filter(l => l.stay_id === stayId);
    }

    const { data, error } = await supabase
      .from('stay_daily_logs')
      .select('*')
      .eq('stay_id', stayId)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByDate(stayId: string, date: string): Promise<StayDailyLog | null> {
    if (isDemoMode()) {
      return DEMO_DAILY_LOGS.find(l => l.stay_id === stayId && l.log_date === date) || null;
    }

    const { data, error } = await supabase
      .from('stay_daily_logs')
      .select('*')
      .eq('stay_id', stayId)
      .eq('log_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(
    log: Omit<StayDailyLog, 'id' | 'created_at' | 'updated_at'>
  ): Promise<StayDailyLog> {
    if (isDemoMode()) {
      const newLog: StayDailyLog = {
        ...log,
        id: `log-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newLog;
    }

    const { data, error } = await supabase
      .from('stay_daily_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<StayDailyLog>): Promise<StayDailyLog> {
    if (isDemoMode()) {
      const log = DEMO_DAILY_LOGS.find(l => l.id === id);
      if (!log) throw new Error('Log not found');
      return { ...log, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('stay_daily_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(
    log: Omit<StayDailyLog, 'id' | 'created_at' | 'updated_at'>
  ): Promise<StayDailyLog> {
    if (isDemoMode()) {
      const existing = DEMO_DAILY_LOGS.find(
        l => l.stay_id === log.stay_id && l.log_date === log.log_date
      );
      if (existing) {
        return { ...existing, ...log, updated_at: new Date().toISOString() };
      }
      return this.create(log);
    }

    const { data, error } = await supabase
      .from('stay_daily_logs')
      .upsert(log, {
        onConflict: 'stay_id,log_date',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// Combined Calendar Service
// ============================================================================

export const calendarService = {
  stays: staysService,
  appointments: appointmentsService,
  blocks: blocksService,
  templates: scheduleTemplatesService,
  dailyLogs: dailyLogsService,

  async getCalendarEvents(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    const [stays, appointments, blocks] = await Promise.all([
      staysService.getByDateRange(facilityId, startDate, endDate),
      appointmentsService.getByDateRange(facilityId, startDate, endDate),
      blocksService.getByDateRange(facilityId, startDate, endDate),
    ]);

    const events: CalendarEvent[] = [];

    // Convert stays to events
    stays.forEach(stay => {
      events.push({
        id: stay.id,
        title: `${stay.dog.name} - Board & Train`,
        start: new Date(stay.check_in_date),
        end: new Date(stay.check_out_date),
        allDay: true,
        color: stay.status === 'checked_in' ? '#10B981' : '#F59E0B',
        type: 'stay',
        data: stay,
      });
    });

    // Convert appointments to events
    appointments.forEach(appt => {
      if (!appt.is_cancelled) {
        events.push({
          id: appt.id,
          title: appt.title,
          start: new Date(appt.start_time),
          end: new Date(appt.end_time),
          allDay: appt.all_day,
          color: appt.color,
          type: 'appointment',
          data: appt,
        });
      }
    });

    // Convert blocks to events
    blocks.forEach(block => {
      events.push({
        id: block.id,
        title: block.title,
        start: new Date(block.start_time),
        end: new Date(block.end_time),
        allDay: block.all_day,
        color: block.is_facility_closure ? '#EF4444' : '#6B7280',
        type: 'block',
        data: block,
      });
    });

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  },
};
