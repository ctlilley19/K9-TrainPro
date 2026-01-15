// Kennel Management Service Layer for K9 ProTrain
// Handles kennel CRUD, assignments, activity logging, and QR code functionality

import { supabase } from '@/lib/supabase';
import { isDemoMode, DEMO_FACILITY_ID } from '@/lib/demo-config';
import type {
  Kennel,
  KennelWithAssignment,
  KennelAssignment,
  KennelAssignmentWithDog,
  KennelActivityLog,
  KennelActivityLogWithDetails,
  KennelQRScanData,
  KennelStatus,
  KennelSize,
  KennelActivityType,
  Dog,
  BoardTrainStay,
  Family,
} from '@/types/database';

// ============================================================================
// Demo Data
// ============================================================================

const DEMO_KENNELS: KennelWithAssignment[] = [
  {
    id: 'kennel-1',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-101',
    location: 'Building A - Ground Floor',
    size: 'large',
    status: 'occupied',
    features: ['outdoor_access', 'climate_controlled', 'camera'],
    notes: 'Premium kennel with private yard access',
    qr_code_url: null,
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: {
      id: 'assign-1',
      kennel_id: 'kennel-1',
      dog_id: 'dog-1',
      stay_id: 'stay-1',
      assigned_by: 'demo-user',
      assigned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      released_at: null,
      notes: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
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
        feeding_instructions: 'Blue Buffalo, 2 cups AM/PM',
        medications: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      stay: null,
      assigned_by_user: { name: 'Sarah Johnson', avatar_url: null },
    },
  },
  {
    id: 'kennel-2',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-102',
    location: 'Building A - Ground Floor',
    size: 'large',
    status: 'occupied',
    features: ['outdoor_access', 'climate_controlled'],
    notes: null,
    qr_code_url: null,
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: {
      id: 'assign-2',
      kennel_id: 'kennel-2',
      dog_id: 'dog-2',
      stay_id: 'stay-2',
      assigned_by: 'demo-user',
      assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      released_at: null,
      notes: 'Keep away from kennel K-105 (Rocky has dog reactivity)',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      dog: {
        id: 'dog-2',
        family_id: 'family-2',
        name: 'Bella',
        breed: 'German Shepherd',
        date_of_birth: '2021-08-20',
        weight: 70,
        gender: 'female',
        color: 'Black and Tan',
        photo_url: null,
        microchip_id: null,
        medical_notes: 'Hip dysplasia - avoid excessive jumping',
        behavior_notes: null,
        feeding_instructions: null,
        medications: 'Joint supplement daily',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      stay: null,
      assigned_by_user: { name: 'Sarah Johnson', avatar_url: null },
    },
  },
  {
    id: 'kennel-3',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-103',
    location: 'Building A - Ground Floor',
    size: 'medium',
    status: 'available',
    features: ['climate_controlled'],
    notes: null,
    qr_code_url: null,
    display_order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: null,
  },
  {
    id: 'kennel-4',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-104',
    location: 'Building A - Ground Floor',
    size: 'medium',
    status: 'cleaning',
    features: ['climate_controlled'],
    notes: 'Deep clean scheduled',
    qr_code_url: null,
    display_order: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: null,
  },
  {
    id: 'kennel-5',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-105',
    location: 'Building A - Ground Floor',
    size: 'extra_large',
    status: 'occupied',
    features: ['outdoor_access', 'climate_controlled', 'camera', 'elevated_bed'],
    notes: 'Extra large kennel for big breeds',
    qr_code_url: null,
    display_order: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: {
      id: 'assign-3',
      kennel_id: 'kennel-5',
      dog_id: 'dog-3',
      stay_id: null,
      assigned_by: 'demo-user',
      assigned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      released_at: null,
      notes: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      dog: {
        id: 'dog-3',
        family_id: 'family-3',
        name: 'Rocky',
        breed: 'Great Dane',
        date_of_birth: '2020-11-05',
        weight: 140,
        gender: 'male',
        color: 'Fawn',
        photo_url: null,
        microchip_id: null,
        medical_notes: null,
        behavior_notes: 'Dog reactive - needs slow introductions',
        feeding_instructions: 'Elevated feeder required',
        medications: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      stay: null,
      assigned_by_user: { name: 'Mike Wilson', avatar_url: null },
    },
  },
  {
    id: 'kennel-6',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-106',
    location: 'Building B - Puppy Wing',
    size: 'small',
    status: 'occupied',
    features: ['climate_controlled', 'camera', 'puppy_safe'],
    notes: 'Puppy-proofed kennel',
    qr_code_url: null,
    display_order: 6,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: {
      id: 'assign-4',
      kennel_id: 'kennel-6',
      dog_id: 'dog-4',
      stay_id: null,
      assigned_by: 'demo-user',
      assigned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      released_at: null,
      notes: null,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      dog: {
        id: 'dog-4',
        family_id: 'family-4',
        name: 'Daisy',
        breed: 'Beagle',
        date_of_birth: '2024-06-10',
        weight: 15,
        gender: 'female',
        color: 'Tri-color',
        photo_url: null,
        microchip_id: null,
        medical_notes: null,
        behavior_notes: 'Puppy in training - potty every 2 hours',
        feeding_instructions: 'Puppy formula, small portions 3x daily',
        medications: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      stay: null,
      assigned_by_user: { name: 'Sarah Johnson', avatar_url: null },
    },
  },
  {
    id: 'kennel-7',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-107',
    location: 'Building B - Puppy Wing',
    size: 'small',
    status: 'available',
    features: ['climate_controlled', 'puppy_safe'],
    notes: null,
    qr_code_url: null,
    display_order: 7,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: null,
  },
  {
    id: 'kennel-8',
    facility_id: DEMO_FACILITY_ID,
    name: 'K-108',
    location: 'Building B - Puppy Wing',
    size: 'small',
    status: 'maintenance',
    features: ['climate_controlled'],
    notes: 'Door latch being repaired',
    qr_code_url: null,
    display_order: 8,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    current_assignment: null,
  },
];

const DEMO_ACTIVITY_LOGS: KennelActivityLogWithDetails[] = [
  {
    id: 'log-1',
    kennel_id: 'kennel-1',
    assignment_id: 'assign-1',
    dog_id: 'dog-1',
    user_id: 'demo-user',
    activity_type: 'feeding',
    notes: 'Ate all breakfast',
    scanned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    kennel: DEMO_KENNELS[0],
    dog: DEMO_KENNELS[0].current_assignment?.dog || null,
    user: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'log-2',
    kennel_id: 'kennel-1',
    assignment_id: 'assign-1',
    dog_id: 'dog-1',
    user_id: 'demo-user',
    activity_type: 'potty_break',
    notes: 'Successful potty - #1 and #2',
    scanned_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    kennel: DEMO_KENNELS[0],
    dog: DEMO_KENNELS[0].current_assignment?.dog || null,
    user: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 'log-3',
    kennel_id: 'kennel-1',
    assignment_id: 'assign-1',
    dog_id: 'dog-1',
    user_id: 'demo-user',
    activity_type: 'check',
    notes: 'Resting comfortably',
    scanned_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    kennel: DEMO_KENNELS[0],
    dog: DEMO_KENNELS[0].current_assignment?.dog || null,
    user: { name: 'Mike Wilson', avatar_url: null },
  },
];

const QUICK_ACTIONS: KennelActivityType[] = [
  'feeding',
  'potty_break',
  'water_refill',
  'check',
  'medication',
  'enrichment',
  'cleaning',
  'note',
];

// ============================================================================
// Kennel Service
// ============================================================================

export const kennelService = {
  // Get all kennels for a facility
  async getAll(facilityId: string): Promise<KennelWithAssignment[]> {
    if (isDemoMode()) {
      return DEMO_KENNELS;
    }

    const { data, error } = await supabase
      .from('kennels')
      .select(`
        *,
        current_assignment:kennel_assignments!inner(
          *,
          dog:dogs(*),
          stay:board_train_stays(*),
          assigned_by_user:users!assigned_by(name, avatar_url)
        )
      `)
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .is('kennel_assignments.released_at', null)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  // Get kennel by ID
  async getById(kennelId: string): Promise<KennelWithAssignment | null> {
    if (isDemoMode()) {
      return DEMO_KENNELS.find((k) => k.id === kennelId) || null;
    }

    const { data, error } = await supabase
      .from('kennels')
      .select(`
        *,
        current_assignment:kennel_assignments(
          *,
          dog:dogs(*),
          stay:board_train_stays(*),
          assigned_by_user:users!assigned_by(name, avatar_url)
        )
      `)
      .eq('id', kennelId)
      .is('kennel_assignments.released_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new kennel
  async create(kennel: Omit<Kennel, 'id' | 'created_at' | 'updated_at'>): Promise<Kennel> {
    if (isDemoMode()) {
      return {
        ...kennel,
        id: `kennel-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('kennels')
      .insert(kennel)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a kennel
  async update(kennelId: string, updates: Partial<Kennel>): Promise<Kennel> {
    if (isDemoMode()) {
      const kennel = DEMO_KENNELS.find((k) => k.id === kennelId);
      if (!kennel) throw new Error('Kennel not found');
      return { ...kennel, ...updates, updated_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('kennels')
      .update(updates)
      .eq('id', kennelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update kennel status
  async updateStatus(kennelId: string, status: KennelStatus): Promise<Kennel> {
    return this.update(kennelId, { status });
  },

  // Delete a kennel (soft delete by setting is_active to false)
  async delete(kennelId: string): Promise<void> {
    if (isDemoMode()) return;

    const { error } = await supabase
      .from('kennels')
      .update({ is_active: false })
      .eq('id', kennelId);

    if (error) throw error;
  },

  // Get available kennels
  async getAvailable(facilityId: string, size?: KennelSize): Promise<Kennel[]> {
    if (isDemoMode()) {
      return DEMO_KENNELS.filter(
        (k) => k.status === 'available' && (!size || k.size === size)
      );
    }

    let query = supabase
      .from('kennels')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'available')
      .eq('is_active', true);

    if (size) {
      query = query.eq('size', size);
    }

    const { data, error } = await query.order('display_order');
    if (error) throw error;
    return data || [];
  },

  // Get QR scan data for a kennel
  async getQRScanData(kennelId: string): Promise<KennelQRScanData | null> {
    if (isDemoMode()) {
      const kennel = DEMO_KENNELS.find((k) => k.id === kennelId);
      if (!kennel) return null;

      const recentLogs = DEMO_ACTIVITY_LOGS.filter((l) => l.kennel_id === kennelId).slice(0, 5);

      return {
        kennel,
        current_dog: kennel.current_assignment?.dog || null,
        current_stay: kennel.current_assignment?.stay || null,
        family: null,
        recent_activities: recentLogs,
        quick_actions: QUICK_ACTIONS,
      };
    }

    const kennel = await this.getById(kennelId);
    if (!kennel) return null;

    const logs = await kennelActivityService.getByKennel(kennelId, 5);

    return {
      kennel,
      current_dog: kennel.current_assignment?.dog || null,
      current_stay: kennel.current_assignment?.stay || null,
      family: null, // Would fetch from dog's family
      recent_activities: logs,
      quick_actions: QUICK_ACTIONS,
    };
  },
};

// ============================================================================
// Kennel Assignment Service
// ============================================================================

export const kennelAssignmentService = {
  // Assign a dog to a kennel
  async assign(
    kennelId: string,
    dogId: string,
    assignedBy: string,
    stayId?: string,
    notes?: string
  ): Promise<KennelAssignment> {
    if (isDemoMode()) {
      return {
        id: `assign-${Date.now()}`,
        kennel_id: kennelId,
        dog_id: dogId,
        stay_id: stayId || null,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
        released_at: null,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('kennel_assignments')
      .insert({
        kennel_id: kennelId,
        dog_id: dogId,
        stay_id: stayId,
        assigned_by: assignedBy,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Release a dog from a kennel
  async release(assignmentId: string): Promise<KennelAssignment> {
    if (isDemoMode()) {
      const assignment = DEMO_KENNELS
        .flatMap((k) => k.current_assignment ? [k.current_assignment] : [])
        .find((a) => a.id === assignmentId);

      if (!assignment) throw new Error('Assignment not found');
      return {
        ...assignment,
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('kennel_assignments')
      .update({ released_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get active assignment for a dog
  async getByDog(dogId: string): Promise<KennelAssignmentWithDog | null> {
    if (isDemoMode()) {
      const kennel = DEMO_KENNELS.find((k) => k.current_assignment?.dog_id === dogId);
      return kennel?.current_assignment || null;
    }

    const { data, error } = await supabase
      .from('kennel_assignments')
      .select(`
        *,
        dog:dogs(*),
        stay:board_train_stays(*),
        assigned_by_user:users!assigned_by(name, avatar_url)
      `)
      .eq('dog_id', dogId)
      .is('released_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Get assignment history for a kennel
  async getKennelHistory(kennelId: string, limit = 20): Promise<KennelAssignmentWithDog[]> {
    if (isDemoMode()) {
      return [];
    }

    const { data, error } = await supabase
      .from('kennel_assignments')
      .select(`
        *,
        dog:dogs(*),
        stay:board_train_stays(*),
        assigned_by_user:users!assigned_by(name, avatar_url)
      `)
      .eq('kennel_id', kennelId)
      .order('assigned_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// Kennel Activity Service
// ============================================================================

export const kennelActivityService = {
  // Log an activity for a kennel (via QR scan)
  async log(
    kennelId: string,
    activityType: string,
    userId: string,
    notes?: string,
    dogId?: string,
    assignmentId?: string
  ): Promise<KennelActivityLog> {
    if (isDemoMode()) {
      return {
        id: `log-${Date.now()}`,
        kennel_id: kennelId,
        assignment_id: assignmentId || null,
        dog_id: dogId || null,
        user_id: userId,
        activity_type: activityType,
        notes: notes || null,
        scanned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('kennel_activity_logs')
      .insert({
        kennel_id: kennelId,
        assignment_id: assignmentId,
        dog_id: dogId,
        user_id: userId,
        activity_type: activityType,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get activity logs for a kennel
  async getByKennel(kennelId: string, limit = 50): Promise<KennelActivityLog[]> {
    if (isDemoMode()) {
      return DEMO_ACTIVITY_LOGS.filter((l) => l.kennel_id === kennelId).slice(0, limit);
    }

    const { data, error } = await supabase
      .from('kennel_activity_logs')
      .select('*')
      .eq('kennel_id', kennelId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get activity logs for a dog
  async getByDog(dogId: string, limit = 50): Promise<KennelActivityLogWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_ACTIVITY_LOGS.filter((l) => l.dog_id === dogId).slice(0, limit);
    }

    const { data, error } = await supabase
      .from('kennel_activity_logs')
      .select(`
        *,
        kennel:kennels(*),
        user:users(name, avatar_url)
      `)
      .eq('dog_id', dogId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get all activity logs for today
  async getTodayLogs(facilityId: string): Promise<KennelActivityLogWithDetails[]> {
    if (isDemoMode()) {
      return DEMO_ACTIVITY_LOGS;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('kennel_activity_logs')
      .select(`
        *,
        kennel:kennels!inner(*),
        dog:dogs(*),
        user:users(name, avatar_url)
      `)
      .eq('kennel.facility_id', facilityId)
      .gte('scanned_at', today.toISOString())
      .order('scanned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// ============================================================================
// QR Code Utilities
// ============================================================================

export const kennelQRUtils = {
  // Generate QR code URL for a kennel
  generateQRUrl(kennelId: string, baseUrl: string): string {
    return `${baseUrl}/kennel/${kennelId}`;
  },

  // Parse kennel ID from QR URL
  parseKennelId(url: string): string | null {
    const match = url.match(/\/kennel\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  },
};
