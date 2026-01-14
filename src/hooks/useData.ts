'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService, type CreateActivityData, type ActivityFilters } from '@/services/supabase/activities';
import { dogsService } from '@/services/supabase/dogs';
import { programsService } from '@/services/supabase/programs';
import { familiesService } from '@/services/supabase/families';
import { badgesService } from '@/services/supabase/badges';
import { useFacility, useUser } from '@/stores/authStore';
import { isDemoMode } from '@/lib/supabase';
import type { ActivityType, Dog, Program, Family, Badge, ActivityWithDetails } from '@/types/database';

// ============================================================================
// DEMO DATA
// ============================================================================

const demoDogs: Dog[] = [
  {
    id: '1',
    family_id: 'fam-1',
    name: 'Max',
    breed: 'German Shepherd',
    date_of_birth: '2022-03-15',
    weight: 75,
    gender: 'male',
    color: 'Black and Tan',
    photo_url: null,
    microchip_id: '123456789',
    medical_notes: 'Up to date on all vaccinations',
    behavior_notes: 'Good with other dogs, mild separation anxiety',
    feeding_instructions: '2 cups twice daily',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    family_id: 'fam-1',
    name: 'Rocky',
    breed: 'Rottweiler',
    date_of_birth: '2021-08-20',
    weight: 95,
    gender: 'male',
    color: 'Black',
    photo_url: null,
    microchip_id: '987654321',
    medical_notes: 'Allergic to chicken',
    behavior_notes: 'Strong puller on leash, needs work on impulse control',
    feeding_instructions: '3 cups twice daily, no chicken',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    family_id: 'fam-2',
    name: 'Bella',
    breed: 'Golden Retriever',
    date_of_birth: '2023-01-10',
    weight: 55,
    gender: 'female',
    color: 'Golden',
    photo_url: null,
    microchip_id: null,
    medical_notes: null,
    behavior_notes: 'Very friendly, easily distracted',
    feeding_instructions: '1.5 cups twice daily',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    family_id: 'fam-2',
    name: 'Luna',
    breed: 'Border Collie',
    date_of_birth: '2022-06-05',
    weight: 40,
    gender: 'female',
    color: 'Black and White',
    photo_url: null,
    microchip_id: '555666777',
    medical_notes: null,
    behavior_notes: 'Very high energy, needs lots of mental stimulation',
    feeding_instructions: '2 cups twice daily',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    family_id: 'fam-3',
    name: 'Charlie',
    breed: 'Labrador',
    date_of_birth: '2022-11-25',
    weight: 70,
    gender: 'male',
    color: 'Chocolate',
    photo_url: null,
    microchip_id: null,
    medical_notes: 'Hip dysplasia - limited jumping',
    behavior_notes: 'Food motivated, great for training',
    feeding_instructions: '2 cups twice daily',
    medications: 'Joint supplement daily',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    family_id: 'fam-3',
    name: 'Daisy',
    breed: 'Beagle',
    date_of_birth: '2023-04-12',
    weight: 25,
    gender: 'female',
    color: 'Tricolor',
    photo_url: null,
    microchip_id: null,
    medical_notes: null,
    behavior_notes: 'Strong nose, gets distracted by scents',
    feeding_instructions: '1 cup twice daily',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    family_id: 'fam-4',
    name: 'Cooper',
    breed: 'Husky',
    date_of_birth: '2021-12-01',
    weight: 55,
    gender: 'male',
    color: 'Gray and White',
    photo_url: null,
    microchip_id: '111222333',
    medical_notes: null,
    behavior_notes: 'Vocal, high prey drive, needs secure fencing',
    feeding_instructions: '2.5 cups twice daily',
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoPrograms: Program[] = [
  {
    id: 'prog-1',
    dog_id: '1',
    facility_id: 'demo-facility-id',
    type: 'board_train',
    name: '2-Week Board & Train',
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Loose leash walking', 'Recall', 'Place command'],
    notes: 'Focus on separation anxiety',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-2',
    dog_id: '2',
    facility_id: 'demo-facility-id',
    type: 'board_train',
    name: '3-Week Board & Train',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Impulse control', 'Heel', 'Down-stay'],
    notes: 'Strong puller, needs consistent corrections',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-3',
    dog_id: '3',
    facility_id: 'demo-facility-id',
    type: 'day_train',
    name: 'Day Training Program',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Basic obedience', 'Focus work'],
    notes: null,
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-4',
    dog_id: '4',
    facility_id: 'demo-facility-id',
    type: 'board_train',
    name: '2-Week Board & Train',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Agility foundation', 'Off-leash recall', 'Tricks'],
    notes: 'Very smart, learns quickly',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-5',
    dog_id: '5',
    facility_id: 'demo-facility-id',
    type: 'board_train',
    name: '2-Week Board & Train',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Polite greetings', 'Leave it', 'Recall'],
    notes: 'Limited jumping due to hip dysplasia',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-6',
    dog_id: '6',
    facility_id: 'demo-facility-id',
    type: 'day_train',
    name: 'Puppy Foundation',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Potty training', 'Crate training', 'Name recognition'],
    notes: 'Young pup, lots of energy',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prog-7',
    dog_id: '7',
    facility_id: 'demo-facility-id',
    type: 'board_train',
    name: '3-Week Board & Train',
    start_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    assigned_trainer_id: 'demo-user-id',
    goals: ['Recall work', 'Quiet command', 'Impulse control'],
    notes: 'Very vocal, working on quiet command',
    before_photo_url: null,
    after_photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoFamilies: Family[] = [
  {
    id: 'fam-1',
    facility_id: 'demo-facility-id',
    primary_contact_id: 'parent-1',
    name: 'Johnson Family',
    address: '123 Oak Street',
    city: 'La Plata',
    state: 'MD',
    zip: '20646',
    phone: '(301) 555-1234',
    email: 'johnson@email.com',
    emergency_contact_name: 'Sarah Johnson',
    emergency_contact_phone: '(301) 555-5678',
    vet_name: 'Dr. Smith',
    vet_phone: '(301) 555-9999',
    notes: 'Preferred pickup time: 5pm',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fam-2',
    facility_id: 'demo-facility-id',
    primary_contact_id: 'parent-2',
    name: 'Martinez Family',
    address: '456 Maple Ave',
    city: 'Waldorf',
    state: 'MD',
    zip: '20602',
    phone: '(240) 555-2345',
    email: 'martinez@email.com',
    emergency_contact_name: 'Carlos Martinez',
    emergency_contact_phone: '(240) 555-6789',
    vet_name: 'Dr. Williams',
    vet_phone: '(240) 555-8888',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fam-3',
    facility_id: 'demo-facility-id',
    primary_contact_id: 'parent-3',
    name: 'Thompson Family',
    address: '789 Pine Road',
    city: 'Brandywine',
    state: 'MD',
    zip: '20613',
    phone: '(301) 555-3456',
    email: 'thompson@email.com',
    emergency_contact_name: 'Mike Thompson',
    emergency_contact_phone: '(301) 555-7890',
    vet_name: 'Dr. Brown',
    vet_phone: '(301) 555-7777',
    notes: 'Charlie has special dietary needs',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fam-4',
    facility_id: 'demo-facility-id',
    primary_contact_id: 'parent-4',
    name: 'Wilson Family',
    address: '321 Cedar Lane',
    city: 'Clinton',
    state: 'MD',
    zip: '20735',
    phone: '(240) 555-4567',
    email: 'wilson@email.com',
    emergency_contact_name: 'Jennifer Wilson',
    emergency_contact_phone: '(240) 555-8901',
    vet_name: 'Dr. Davis',
    vet_phone: '(240) 555-6666',
    notes: 'Cooper is an escape artist - use extra caution',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Demo activities for training board
function getDemoActivities(): Record<ActivityType, Array<{
  id: string;
  dogId: string;
  dogName: string;
  dogBreed: string;
  photoUrl: string | null;
  startedAt: Date;
  trainer: string;
  programId: string;
  notes?: string;
}>> {
  return {
    kennel: [
      {
        id: 'act-1',
        dogId: '1',
        dogName: 'Max',
        dogBreed: 'German Shepherd',
        photoUrl: null,
        startedAt: new Date(Date.now() - 45 * 60000),
        trainer: 'John',
        programId: 'prog-1',
      },
      {
        id: 'act-2',
        dogId: '2',
        dogName: 'Rocky',
        dogBreed: 'Rottweiler',
        photoUrl: null,
        startedAt: new Date(Date.now() - 180 * 60000),
        trainer: 'Sarah',
        programId: 'prog-2',
      },
    ],
    potty: [
      {
        id: 'act-3',
        dogId: '3',
        dogName: 'Bella',
        dogBreed: 'Golden Retriever',
        photoUrl: null,
        startedAt: new Date(Date.now() - 5 * 60000),
        trainer: 'John',
        programId: 'prog-3',
      },
    ],
    training: [
      {
        id: 'act-4',
        dogId: '4',
        dogName: 'Luna',
        dogBreed: 'Border Collie',
        photoUrl: null,
        startedAt: new Date(Date.now() - 20 * 60000),
        trainer: 'Sarah',
        programId: 'prog-4',
      },
      {
        id: 'act-5',
        dogId: '5',
        dogName: 'Charlie',
        dogBreed: 'Labrador',
        photoUrl: null,
        startedAt: new Date(Date.now() - 15 * 60000),
        trainer: 'Mike',
        programId: 'prog-5',
      },
    ],
    play: [
      {
        id: 'act-6',
        dogId: '6',
        dogName: 'Daisy',
        dogBreed: 'Beagle',
        photoUrl: null,
        startedAt: new Date(Date.now() - 25 * 60000),
        trainer: 'John',
        programId: 'prog-6',
      },
    ],
    group_play: [],
    feeding: [],
    rest: [
      {
        id: 'act-7',
        dogId: '7',
        dogName: 'Cooper',
        dogBreed: 'Husky',
        photoUrl: null,
        startedAt: new Date(Date.now() - 60 * 60000),
        trainer: 'Sarah',
        programId: 'prog-7',
      },
    ],
    walk: [],
    grooming: [],
    medical: [],
  };
}

// ============================================================================
// DOGS HOOKS
// ============================================================================

export function useDogs() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['dogs', facility?.id],
    queryFn: async () => {
      if (isDemoMode() || !facility?.id) {
        return demoDogs;
      }
      return dogsService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useDog(dogId: string | undefined) {
  return useQuery({
    queryKey: ['dogs', dogId],
    queryFn: async () => {
      if (isDemoMode() || !dogId) {
        return demoDogs.find((d) => d.id === dogId) || null;
      }
      return dogsService.getById(dogId);
    },
    enabled: !!dogId,
  });
}

interface CreateDogInput {
  family_id: string;
  name: string;
  breed?: string;
  date_of_birth?: string;
  weight?: number;
  gender?: 'male' | 'female';
  color?: string;
  medical_notes?: string;
  behavior_notes?: string;
  feeding_instructions?: string;
  medications?: string;
}

interface UpdateDogInput {
  name?: string;
  breed?: string;
  date_of_birth?: string;
  weight?: number;
  gender?: 'male' | 'female';
  color?: string;
  medical_notes?: string;
  behavior_notes?: string;
  feeding_instructions?: string;
  medications?: string;
  photo_url?: string;
  is_active?: boolean;
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (data: CreateDogInput) => {
      if (isDemoMode()) {
        const newDog: Dog = {
          ...data,
          id: crypto.randomUUID(),
          breed: data.breed || null,
          date_of_birth: data.date_of_birth || null,
          weight: data.weight || null,
          gender: data.gender || null,
          color: data.color || null,
          photo_url: null,
          microchip_id: null,
          medical_notes: data.medical_notes || null,
          behavior_notes: data.behavior_notes || null,
          feeding_instructions: data.feeding_instructions || null,
          medications: data.medications || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        demoDogs.push(newDog);
        return newDog;
      }
      return dogsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs', facility?.id] });
    },
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDogInput }) => {
      if (isDemoMode()) {
        const index = demoDogs.findIndex((d) => d.id === id);
        if (index !== -1) {
          demoDogs[index] = { ...demoDogs[index], ...data, updated_at: new Date().toISOString() };
          return demoDogs[index];
        }
        throw new Error('Dog not found');
      }
      return dogsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['dogs', id] });
    },
  });
}

// ============================================================================
// PROGRAMS HOOKS
// ============================================================================

export function usePrograms(filters?: { status?: 'scheduled' | 'active' | 'completed' | 'cancelled'; dogId?: string }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['programs', facility?.id, filters],
    queryFn: async () => {
      if (isDemoMode() || !facility?.id) {
        let filtered = demoPrograms;
        if (filters?.status) {
          filtered = filtered.filter((p) => p.status === filters.status);
        }
        if (filters?.dogId) {
          filtered = filtered.filter((p) => p.dog_id === filters.dogId);
        }
        return filtered;
      }
      return programsService.getAll(facility.id, filters);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useActivePrograms() {
  return usePrograms({ status: 'active' });
}

export function useProgram(programId: string | undefined) {
  return useQuery({
    queryKey: ['programs', programId],
    queryFn: async () => {
      if (isDemoMode() || !programId) {
        return demoPrograms.find((p) => p.id === programId) || null;
      }
      return programsService.getById(programId);
    },
    enabled: !!programId,
  });
}

// ============================================================================
// FAMILIES HOOKS
// ============================================================================

export function useFamilies() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['families', facility?.id],
    queryFn: async () => {
      if (isDemoMode() || !facility?.id) {
        return demoFamilies;
      }
      return familiesService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useFamily(familyId: string | undefined) {
  return useQuery({
    queryKey: ['families', familyId],
    queryFn: async () => {
      if (isDemoMode() || !familyId) {
        return demoFamilies.find((f) => f.id === familyId) || null;
      }
      return familiesService.getById(familyId);
    },
    enabled: !!familyId,
  });
}

// ============================================================================
// ACTIVITIES HOOKS (Training Board)
// ============================================================================

export interface TrainingBoardDog {
  id: string;
  dogId: string;
  dogName: string;
  dogBreed: string;
  photoUrl: string | null;
  startedAt: Date;
  trainer: string;
  programId: string;
  notes?: string;
}

export function useTrainingBoard() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['training-board', facility?.id],
    queryFn: async (): Promise<Record<ActivityType, TrainingBoardDog[]>> => {
      if (isDemoMode() || !facility?.id) {
        return getDemoActivities();
      }

      // Fetch current activities and transform to board format
      const activities = await activitiesService.getCurrentActivities(facility.id);

      const board: Record<ActivityType, TrainingBoardDog[]> = {
        kennel: [],
        potty: [],
        training: [],
        play: [],
        group_play: [],
        feeding: [],
        rest: [],
        walk: [],
        grooming: [],
        medical: [],
      };

      for (const activity of activities) {
        board[activity.type].push({
          id: activity.id,
          dogId: activity.dog_id,
          dogName: activity.dog?.name || 'Unknown',
          dogBreed: activity.dog?.breed || 'Unknown',
          photoUrl: activity.dog?.photo_url || null,
          startedAt: new Date(activity.started_at),
          trainer: activity.trainer?.name || 'Unknown',
          programId: activity.program_id,
          notes: activity.notes || undefined,
        });
      }

      return board;
    },
    enabled: !!facility?.id || isDemoMode(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useStartActivity() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: CreateActivityData) => {
      if (isDemoMode()) {
        return {
          id: crypto.randomUUID(),
          ...data,
          started_at: new Date().toISOString(),
          ended_at: null,
          duration_minutes: null,
          created_at: new Date().toISOString(),
        };
      }
      return activitiesService.start(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-board'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useEndActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, notes }: { activityId: string; notes?: string }) => {
      if (isDemoMode()) {
        return {
          id: activityId,
          ended_at: new Date().toISOString(),
          notes,
        };
      }
      return activitiesService.end(activityId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-board'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useQuickLog() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      dogId,
      programId,
      type,
      durationMinutes,
      notes,
    }: {
      dogId: string;
      programId: string;
      type: ActivityType;
      durationMinutes: number;
      notes?: string;
    }) => {
      if (isDemoMode() || !user?.id) {
        return {
          id: crypto.randomUUID(),
          dog_id: dogId,
          program_id: programId,
          type,
          trainer_id: user?.id || 'demo-user',
          duration_minutes: durationMinutes,
          notes,
          started_at: new Date(Date.now() - durationMinutes * 60000).toISOString(),
          ended_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
      }
      return activitiesService.quickLog(dogId, programId, type, user.id, durationMinutes, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-board'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

// ============================================================================
// BADGES HOOKS
// ============================================================================

export function useDogBadges(dogId: string | undefined) {
  return useQuery({
    queryKey: ['badges', dogId],
    queryFn: async () => {
      if (isDemoMode() || !dogId) {
        // Return demo badges
        return [
          {
            id: 'badge-1',
            dog_id: dogId!,
            badge_type: 'star_pupil',
            tier: 'gold' as const,
            earned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            awarded_by: 'demo-user-id',
            notes: 'Excellent progress!',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'badge-2',
            dog_id: dogId!,
            badge_type: 'recall_pro',
            tier: 'silver' as const,
            earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            awarded_by: 'demo-user-id',
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }
      return badgesService.getByDog(dogId);
    },
    enabled: !!dogId,
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      dogId,
      badgeType,
      tier,
      notes,
    }: {
      dogId: string;
      badgeType: string;
      tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
      notes?: string;
    }) => {
      if (isDemoMode() || !user?.id) {
        return {
          id: crypto.randomUUID(),
          dog_id: dogId,
          badge_type: badgeType,
          tier: tier,
          earned_at: new Date().toISOString(),
          awarded_by: user?.id || 'demo-user',
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return badgesService.award(dogId, badgeType, tier, user.id, notes);
    },
    onSuccess: (_, { dogId }) => {
      queryClient.invalidateQueries({ queryKey: ['badges', dogId] });
    },
  });
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useDashboardStats() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['dashboard-stats', facility?.id],
    queryFn: async () => {
      if (isDemoMode() || !facility?.id) {
        return {
          totalDogs: demoDogs.length,
          activePrograms: demoPrograms.filter((p) => p.status === 'active').length,
          totalFamilies: demoFamilies.length,
          badgesAwarded: 15,
          trainingHours: 124,
          monthlyRevenue: 28500,
        };
      }
      // In production, fetch from analytics service
      const [dogs, programs, families] = await Promise.all([
        dogsService.getAll(facility.id),
        programsService.getAll(facility.id, { status: 'active' }),
        familiesService.getAll(facility.id),
      ]);

      return {
        totalDogs: dogs.length,
        activePrograms: programs.length,
        totalFamilies: families.length,
        badgesAwarded: 0, // Would need badges service
        trainingHours: 0, // Would need activities service calculation
        monthlyRevenue: 0, // Would need billing service
      };
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

// ============================================================================
// REPORTS HOOKS (Demo data - no backend service yet)
// ============================================================================

interface DemoReport {
  id: string;
  dog_id: string;
  dog_name: string;
  dog_breed: string;
  dog_photo_url: string | null;
  family_id: string;
  family_name: string;
  family_email: string;
  date: string;
  status: 'draft' | 'sent';
  trainer_name: string;
  created_at: string;
  sent_at: string | null;
  summary?: string;
  highlights?: string[];
}

function getDemoReports(): DemoReport[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'report-1',
      dog_id: '1',
      dog_name: 'Max',
      dog_breed: 'German Shepherd',
      dog_photo_url: null,
      family_id: 'fam-1',
      family_name: 'Johnson Family',
      family_email: 'johnson@email.com',
      date: today,
      status: 'draft',
      trainer_name: 'Sarah Johnson',
      created_at: new Date().toISOString(),
      sent_at: null,
      summary: 'Max had a great training session today focusing on recall.',
    },
    {
      id: 'report-2',
      dog_id: '2',
      dog_name: 'Rocky',
      dog_breed: 'Rottweiler',
      dog_photo_url: null,
      family_id: 'fam-1',
      family_name: 'Johnson Family',
      family_email: 'johnson@email.com',
      date: today,
      status: 'draft',
      trainer_name: 'John Smith',
      created_at: new Date().toISOString(),
      sent_at: null,
    },
    {
      id: 'report-3',
      dog_id: '1',
      dog_name: 'Max',
      dog_breed: 'German Shepherd',
      dog_photo_url: null,
      family_id: 'fam-1',
      family_name: 'Johnson Family',
      family_email: 'johnson@email.com',
      date: yesterday,
      status: 'sent',
      trainer_name: 'Sarah Johnson',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      summary: 'Excellent progress on leash walking.',
      highlights: ['Improved heel position', 'Good impulse control'],
    },
    {
      id: 'report-4',
      dog_id: '3',
      dog_name: 'Bella',
      dog_breed: 'Golden Retriever',
      dog_photo_url: null,
      family_id: 'fam-2',
      family_name: 'Martinez Family',
      family_email: 'martinez@email.com',
      date: yesterday,
      status: 'sent',
      trainer_name: 'Sarah Johnson',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      summary: 'Bella is making great strides with focus work.',
    },
    {
      id: 'report-5',
      dog_id: '4',
      dog_name: 'Luna',
      dog_breed: 'Border Collie',
      dog_photo_url: null,
      family_id: 'fam-2',
      family_name: 'Martinez Family',
      family_email: 'martinez@email.com',
      date: yesterday,
      status: 'sent',
      trainer_name: 'Mike Davis',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
      summary: 'Agility foundation training went very well.',
    },
  ];
}

export function useReports(filters?: { status?: 'draft' | 'sent'; date?: string }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['reports', facility?.id, filters],
    queryFn: async () => {
      // Always return demo data for now
      let reports = getDemoReports();

      if (filters?.status) {
        reports = reports.filter((r) => r.status === filters.status);
      }
      if (filters?.date) {
        reports = reports.filter((r) => r.date === filters.date);
      }

      return reports;
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useDogsNeedingReports() {
  const { data: dogs } = useDogs();
  const { data: reports } = useReports();
  const { data: programs } = useActivePrograms();

  const today = new Date().toISOString().split('T')[0];

  // Find dogs with active programs that don't have a report today
  const dogsNeedingReports = dogs?.filter((dog) => {
    const hasActiveProgram = programs?.some((p) => p.dog_id === dog.id);
    const hasReportToday = reports?.some((r) => r.dog_id === dog.id && r.date === today);
    return hasActiveProgram && !hasReportToday;
  }) || [];

  return { data: dogsNeedingReports };
}

// ============================================================================
// COMBINED DOG WITH PROGRAM
// ============================================================================

export function useDogsWithPrograms() {
  const facility = useFacility();
  const queryClient = useQueryClient();

  const { data: dogs, isLoading: dogsLoading, error: dogsError, refetch: refetchDogs } = useDogs();
  const { data: programs, isLoading: programsLoading, error: programsError, refetch: refetchPrograms } = useActivePrograms();
  const { data: families, isLoading: familiesLoading, error: familiesError, refetch: refetchFamilies } = useFamilies();

  const dogsWithDetails = dogs?.map((dog) => {
    const activeProgram = programs?.find((p) => p.dog_id === dog.id);
    const family = families?.find((f) => f.id === dog.family_id);
    return {
      ...dog,
      activeProgram: activeProgram || null,
      family: family || null,
    };
  });

  const refetch = () => {
    refetchDogs();
    refetchPrograms();
    refetchFamilies();
  };

  return {
    data: dogsWithDetails,
    isLoading: dogsLoading || programsLoading || familiesLoading,
    error: dogsError || programsError || familiesError,
    refetch,
  };
}

// ============================================================================
// PET PARENT PORTAL HOOKS
// ============================================================================

// Demo data for pet parent portal
const demoPetParentFamily = {
  id: 'fam-1',
  name: 'Anderson Family',
};

const demoPetParentDogs = [
  {
    id: 'a',
    name: 'Max',
    breed: 'German Shepherd',
    age: '2 years',
    photo_url: null,
    weight: 75,
    gender: 'male' as const,
    family_id: 'fam-1',
    program: {
      id: 'prog-a',
      name: '3-Week Board & Train',
      type: 'board_train',
      status: 'active',
      start_date: '2025-01-06',
      end_date: '2025-01-27',
      progress: 45,
      days_remaining: 12,
      trainer: 'Sarah Johnson',
    },
    today_activities: [
      { type: 'training', duration: 45, time: '9:00 AM' },
      { type: 'play', duration: 30, time: '11:00 AM' },
      { type: 'feeding', duration: 15, time: '12:00 PM' },
    ],
    stats: {
      badges_earned: 3,
      skills_learned: 5,
      training_hours: 12,
      days_in_program: 7,
    },
    recent_badges: [
      { id: '1', name: 'Sit Master', tier: 'gold', earned_at: '2025-01-10' },
      { id: '2', name: 'Leash Walking', tier: 'silver', earned_at: '2025-01-08' },
    ],
    skills: [
      { name: 'Sit', level: 4 },
      { name: 'Stay', level: 3 },
      { name: 'Come', level: 2 },
      { name: 'Down', level: 3 },
      { name: 'Heel', level: 2 },
    ],
  },
  {
    id: 'b',
    name: 'Bella',
    breed: 'Golden Retriever',
    age: '1 year',
    photo_url: null,
    weight: 55,
    gender: 'female' as const,
    family_id: 'fam-1',
    program: {
      id: 'prog-b',
      name: 'Puppy Foundations',
      type: 'day_train',
      status: 'active',
      start_date: '2025-01-06',
      end_date: '2025-02-14',
      progress: 25,
      days_remaining: 30,
      trainer: 'John Smith',
    },
    today_activities: [
      { type: 'training', duration: 30, time: '10:00 AM' },
      { type: 'play', duration: 45, time: '2:00 PM' },
    ],
    stats: {
      badges_earned: 1,
      skills_learned: 2,
      training_hours: 4,
      days_in_program: 7,
    },
    recent_badges: [
      { id: '3', name: 'First Steps', tier: 'bronze', earned_at: '2025-01-07' },
    ],
    skills: [
      { name: 'Sit', level: 2 },
      { name: 'Name Recognition', level: 3 },
    ],
  },
];

const demoPetParentReports = [
  {
    id: '1',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-12',
    trainer: 'Sarah Johnson',
    summary: 'Great progress on leash walking! Max showed excellent focus during training sessions.',
    highlights: [
      'Mastered heel command at 90% accuracy',
      'Reduced leash pulling by 50%',
      'Successfully completed first off-leash recall',
    ],
    mood: 'Happy & Energetic',
    appetite: 'Good',
    has_photos: true,
    photo_count: 4,
    training_minutes: 45,
    skills_practiced: ['Heel', 'Recall', 'Stay'],
    badge_earned: null,
  },
  {
    id: '2',
    dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    date: '2025-01-12',
    trainer: 'John Smith',
    summary: 'Bella is making steady progress with basic commands. Working on building focus.',
    highlights: [
      'Improved sit-stay duration to 30 seconds',
      'Good socialization during group play',
    ],
    mood: 'Playful',
    appetite: 'Good',
    has_photos: true,
    photo_count: 2,
    training_minutes: 30,
    skills_practiced: ['Sit', 'Stay', 'Name Recognition'],
    badge_earned: null,
  },
  {
    id: '3',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-11',
    trainer: 'Sarah Johnson',
    summary: 'Focused on recall training today. Max is showing great improvement.',
    highlights: [
      'Recall success rate improved to 80%',
      'Good impulse control exercises',
    ],
    mood: 'Focused',
    appetite: 'Good',
    has_photos: true,
    photo_count: 3,
    training_minutes: 50,
    skills_practiced: ['Recall', 'Wait', 'Leave It'],
    badge_earned: null,
  },
  {
    id: '4',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-10',
    trainer: 'Sarah Johnson',
    summary: 'Max earned his Sit Master badge today! Excellent training session.',
    highlights: [
      'Earned Sit Master badge (Gold)',
      'Sit command at 95% accuracy',
      'Duration hold improved to 2 minutes',
    ],
    mood: 'Excellent',
    appetite: 'Good',
    has_photos: true,
    photo_count: 5,
    training_minutes: 60,
    skills_practiced: ['Sit', 'Down', 'Place'],
    badge_earned: { name: 'Sit Master', tier: 'gold' },
  },
];

const demoPetParentPhotos = [
  { id: '1', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Training session - heel work', date: '2025-01-12', is_highlight: true, activity_type: 'training' },
  { id: '2', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Recall practice at 30ft', date: '2025-01-12', is_highlight: true, activity_type: 'training' },
  { id: '3', url: null, dog: { id: 'b', name: 'Bella' }, caption: 'Learning sit command', date: '2025-01-12', is_highlight: false, activity_type: 'training' },
  { id: '4', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Play time in the yard', date: '2025-01-11', is_highlight: false, activity_type: 'play' },
  { id: '5', url: null, dog: { id: 'b', name: 'Bella' }, caption: 'Group socialization', date: '2025-01-11', is_highlight: true, activity_type: 'play' },
  { id: '6', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Earned Sit Master badge!', date: '2025-01-10', is_highlight: true, activity_type: 'achievement' },
  { id: '7', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Good boy resting', date: '2025-01-10', is_highlight: false, activity_type: 'rest' },
  { id: '8', url: null, dog: { id: 'b', name: 'Bella' }, caption: 'First week completed!', date: '2025-01-10', is_highlight: true, activity_type: 'achievement' },
  { id: '9', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Leash walking practice', date: '2025-01-09', is_highlight: false, activity_type: 'training' },
  { id: '10', url: null, dog: { id: 'b', name: 'Bella' }, caption: 'Meeting new friends', date: '2025-01-09', is_highlight: false, activity_type: 'play' },
  { id: '11', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Morning training session', date: '2025-01-08', is_highlight: false, activity_type: 'training' },
  { id: '12', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Arrival day!', date: '2025-01-06', is_highlight: true, activity_type: 'milestone' },
];

const demoPetParentVideos = [
  { id: 'v1', url: null, dog: { id: 'a', name: 'Max' }, caption: 'Heel training session', date: '2025-01-12', duration: '0:45' },
  { id: 'v2', url: null, dog: { id: 'a', name: 'Max' }, caption: 'First recall success', date: '2025-01-11', duration: '0:30' },
];

const demoPetParentAchievements = {
  dogs: demoPetParentDogs.map(dog => ({
    id: dog.id,
    name: dog.name,
    photo_url: dog.photo_url,
    badges: dog.recent_badges.map(badge => ({
      ...badge,
      icon: badge.name.includes('Sit') ? 'star' : badge.name.includes('Leash') ? 'target' : badge.name.includes('First') ? 'heart' : 'trophy',
      description: `Achieved ${badge.name} certification`,
      category: badge.name.includes('Leash') ? 'leash' : badge.name.includes('First') ? 'milestone' : 'obedience',
    })),
    total_badges: dog.stats.badges_earned,
    next_badge: dog.id === 'a'
      ? { name: 'Recall Master', tier: 'gold', progress: 70, description: 'Master recall command at 50ft distance' }
      : { name: 'Sit Star', tier: 'silver', progress: 45, description: 'Master sit command with 80% accuracy' },
  })),
  stats: {
    total_badges: demoPetParentDogs.reduce((sum, d) => sum + d.stats.badges_earned, 0),
    gold_badges: 1,
    silver_badges: 1,
    bronze_badges: 2,
    categories_unlocked: 3,
  },
  available_badges: [
    { name: 'Sit Master', tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], description: 'Master the sit command', category: 'obedience' },
    { name: 'Stay Champion', tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], description: 'Master the stay command', category: 'obedience' },
    { name: 'Recall Master', tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], description: 'Master the recall command', category: 'obedience' },
    { name: 'Leash Walking Pro', tiers: ['bronze', 'silver', 'gold'], description: 'Demonstrate excellent leash manners', category: 'leash' },
    { name: 'Social Butterfly', tiers: ['bronze', 'silver', 'gold'], description: 'Excel in socialization with other dogs', category: 'social' },
    { name: 'Calm & Collected', tiers: ['bronze', 'silver', 'gold'], description: 'Show excellent impulse control', category: 'behavior' },
  ],
};

// Get current user's family
export function usePetParentFamily() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-family', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        return demoPetParentFamily;
      }
      // In production, fetch family where primary_contact_id = user.id
      const families = await familiesService.getAll(user.id);
      return families.find(f => f.primary_contact_id === user.id) || null;
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

// Get dogs for the current pet parent's family
export function usePetParentDogs() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-dogs', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        return demoPetParentDogs;
      }
      // In production, fetch family first, then dogs for that family
      // This would need a service method to get dogs by family_id
      return demoPetParentDogs;
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

// Get dashboard data for pet parent
export function usePetParentDashboard() {
  const { data: family } = usePetParentFamily();
  const { data: dogs, isLoading: dogsLoading } = usePetParentDogs();
  const { data: reports } = usePetParentReports();
  const { data: gallery } = usePetParentGallery();

  const recentReports = reports?.slice(0, 3) || [];
  const recentPhotos = gallery?.photos?.slice(0, 4) || [];

  const upcoming = [
    { type: 'graduation', dog_name: dogs?.[0]?.name || 'Max', date: '2025-01-27', title: 'Graduation Day!' },
    { type: 'report', dog_name: dogs?.[0]?.name || 'Max', date: '2025-01-13', title: 'Weekly Progress Report' },
  ];

  return {
    data: family && dogs ? {
      family,
      dogs,
      recent_reports: recentReports,
      recent_photos: recentPhotos,
      upcoming,
    } : null,
    isLoading: dogsLoading,
  };
}

// Get reports for pet parent's dogs
export function usePetParentReports() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-reports', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        return demoPetParentReports;
      }
      // In production, fetch reports for family's dogs
      return demoPetParentReports;
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

// Get gallery (photos & videos) for pet parent's dogs
export function usePetParentGallery() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-gallery', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        return {
          photos: demoPetParentPhotos,
          videos: demoPetParentVideos,
        };
      }
      // In production, fetch media for family's dogs
      return {
        photos: demoPetParentPhotos,
        videos: demoPetParentVideos,
      };
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

// Get achievements/badges for pet parent's dogs
export function usePetParentAchievements() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-achievements', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        return demoPetParentAchievements;
      }
      // In production, fetch badges for family's dogs
      return demoPetParentAchievements;
    },
    enabled: !!user?.id || isDemoMode(),
  });
}
