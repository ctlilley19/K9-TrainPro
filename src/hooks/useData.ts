'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService, type CreateActivityData, type ActivityFilters } from '@/services/supabase/activities';
import { dogsService } from '@/services/supabase/dogs';
import { programsService } from '@/services/supabase/programs';
import { familiesService } from '@/services/supabase/families';
import { badgesService } from '@/services/supabase/badges';
import {
  statusFeedService,
  feedReactionsService,
  feedCommentsService,
} from '@/services/supabase/feed';
import {
  facilityConfigService,
  configToFeatureFlags,
} from '@/services/supabase/config';
import { useFacility, useUser } from '@/stores/authStore';
import { isDemoMode } from '@/lib/supabase';
import type {
  ActivityType,
  Dog,
  Program,
  Family,
  Badge,
  ActivityWithDetails,
  ProgramWithDog,
  DogWithFamily,
  User,
  StatusFeedItem,
  StatusUpdateType,
  DogMood,
  FacilityConfig,
  BusinessMode,
  FeatureFlags,
} from '@/types/database';

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

// Helper to enrich programs with dog data
function enrichProgramsWithDogs(programs: Program[]): ProgramWithDog[] {
  const demoTrainer: User = {
    id: 'demo-user-id',
    auth_id: 'demo-auth-id',
    facility_id: 'demo-facility-id',
    email: 'trainer@demo.com',
    name: 'Sarah Johnson',
    role: 'trainer',
    avatar_url: null,
    phone: '(555) 123-4567',
    is_active: true,
    last_login_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const unknownFamily: Family = {
    id: 'unknown',
    facility_id: 'demo-facility-id',
    primary_contact_id: 'unknown',
    name: 'Unknown Family',
    address: null,
    city: null,
    state: null,
    zip: null,
    phone: null,
    email: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    vet_name: null,
    vet_phone: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const unknownDog: DogWithFamily = {
    id: 'unknown',
    family_id: 'unknown',
    name: 'Unknown Dog',
    breed: 'Unknown',
    date_of_birth: '',
    weight: 0,
    gender: 'male',
    color: '',
    photo_url: null,
    microchip_id: null,
    medical_notes: null,
    behavior_notes: null,
    feeding_instructions: null,
    medications: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    family: unknownFamily,
  };

  return programs.map((program) => {
    const dog = demoDogs.find((d) => d.id === program.dog_id);
    const family = dog ? demoFamilies.find((f) => f.id === dog.family_id) : null;

    const dogWithFamily: DogWithFamily = dog ? {
      ...dog,
      family: family || unknownFamily,
    } : unknownDog;

    return {
      ...program,
      dog: dogWithFamily,
      trainer: program.assigned_trainer_id ? demoTrainer : null,
    };
  });
}

export function usePrograms(filters?: { status?: 'scheduled' | 'active' | 'completed' | 'cancelled'; dogId?: string }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['programs', facility?.id, filters],
    queryFn: async (): Promise<ProgramWithDog[]> => {
      if (isDemoMode() || !facility?.id) {
        let filtered = demoPrograms;
        if (filters?.status) {
          filtered = filtered.filter((p) => p.status === filters.status);
        }
        if (filters?.dogId) {
          filtered = filtered.filter((p) => p.dog_id === filters.dogId);
        }
        return enrichProgramsWithDogs(filtered);
      }
      return programsService.getAll(facility.id, filters) as Promise<ProgramWithDog[]>;
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

interface CreateFamilyInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  vet_name?: string;
  vet_phone?: string;
  notes?: string;
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (data: CreateFamilyInput) => {
      if (isDemoMode()) {
        const newFamily: Family = {
          id: crypto.randomUUID(),
          facility_id: 'demo-facility-id',
          primary_contact_id: null,
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
          vet_name: data.vet_name || null,
          vet_phone: data.vet_phone || null,
          vet_address: null,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        demoFamilies.push(newFamily);
        return newFamily;
      }
      if (!facility?.id) throw new Error('No facility ID');
      return familiesService.create({ ...data, facility_id: facility.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families', facility?.id] });
    },
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
      // Don't invalidate in demo mode - let optimistic updates persist
      if (!isDemoMode()) {
        queryClient.invalidateQueries({ queryKey: ['training-board'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
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
      // Don't invalidate in demo mode - let optimistic updates persist
      if (!isDemoMode()) {
        queryClient.invalidateQueries({ queryKey: ['training-board'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
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
      // Don't invalidate in demo mode - let optimistic updates persist
      if (!isDemoMode()) {
        queryClient.invalidateQueries({ queryKey: ['training-board'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
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

// ============================================================================
// HOMEWORK HOOKS
// ============================================================================

import {
  homeworkService,
  homeworkTemplatesService,
  homeworkAssignmentsService,
  homeworkSubmissionsService,
  type CreateTemplateData,
  type UpdateTemplateData,
  type CreateAssignmentData,
  type UpdateAssignmentData,
  type CreateSubmissionData,
  type TemplateFilters,
  type AssignmentFilters,
} from '@/services/supabase/homework';
import type {
  HomeworkTemplate,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeworkAssignmentWithDetails,
  SubmissionStatus,
} from '@/types/database';

// --- Template Hooks ---

export function useHomeworkTemplates(filters?: TemplateFilters) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['homework-templates', facility?.id, filters],
    queryFn: async () => {
      if (!facility?.id) return [];
      return homeworkTemplatesService.getAll(facility.id, filters);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useHomeworkTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['homework-templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      return homeworkTemplatesService.getById(templateId);
    },
    enabled: !!templateId,
  });
}

export function useCreateHomeworkTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: Omit<CreateTemplateData, 'facility_id' | 'created_by'>) => {
      if (!facility?.id || !user?.id) throw new Error('Not authenticated');
      return homeworkTemplatesService.create({
        ...data,
        facility_id: facility.id,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-templates', facility?.id] });
    },
  });
}

export function useUpdateHomeworkTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateData }) => {
      return homeworkTemplatesService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['homework-templates', facility?.id] });
      queryClient.invalidateQueries({ queryKey: ['homework-templates', id] });
    },
  });
}

export function useDeleteHomeworkTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (id: string) => {
      return homeworkTemplatesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-templates', facility?.id] });
    },
  });
}

// --- Assignment Hooks ---

export function useHomeworkAssignments(filters?: AssignmentFilters) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['homework-assignments', facility?.id, filters],
    queryFn: async () => {
      if (!facility?.id) return [];
      return homeworkAssignmentsService.getAll(facility.id, filters);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useHomeworkAssignment(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['homework-assignments', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      return homeworkAssignmentsService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });
}

export function useDogHomework(dogId: string | undefined) {
  return useQuery({
    queryKey: ['homework-assignments', 'dog', dogId],
    queryFn: async () => {
      if (!dogId) return [];
      return homeworkAssignmentsService.getByDog(dogId);
    },
    enabled: !!dogId,
  });
}

export function useOverdueHomework() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['homework-assignments', 'overdue', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return homeworkAssignmentsService.getOverdue(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateHomeworkAssignment() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: Omit<CreateAssignmentData, 'facility_id' | 'assigned_by'>) => {
      if (!facility?.id || !user?.id) throw new Error('Not authenticated');
      return homeworkAssignmentsService.create({
        ...data,
        facility_id: facility.id,
        assigned_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useCreateHomeworkFromTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      templateId,
      dogId,
      dueDate,
      programId,
      customNotes,
    }: {
      templateId: string;
      dogId: string;
      dueDate: string;
      programId?: string;
      customNotes?: string;
    }) => {
      if (!facility?.id || !user?.id) throw new Error('Not authenticated');
      return homeworkAssignmentsService.createFromTemplate(
        templateId,
        dogId,
        dueDate,
        user.id,
        facility.id,
        programId,
        customNotes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-templates'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useUpdateHomeworkAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssignmentData }) => {
      return homeworkAssignmentsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useCompleteHomeworkAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return homeworkAssignmentsService.complete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useDeleteHomeworkAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return homeworkAssignmentsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

// --- Submission Hooks ---

export function useHomeworkSubmissions(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['homework-submissions', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];
      return homeworkSubmissionsService.getByAssignment(assignmentId);
    },
    enabled: !!assignmentId,
  });
}

export function usePendingHomeworkReviews() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['homework-submissions', 'pending', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return homeworkSubmissionsService.getPendingReview(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateHomeworkSubmission() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: Omit<CreateSubmissionData, 'submitted_by'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      return homeworkSubmissionsService.create({
        ...data,
        submitted_by: user.id,
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['homework-submissions', data.assignment_id] });
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useReviewHomeworkSubmission() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      id,
      feedback,
      status,
      rating,
    }: {
      id: string;
      feedback: string;
      status: SubmissionStatus;
      rating?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return homeworkSubmissionsService.review(id, feedback, status, user.id, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

export function useApproveHomeworkSubmission() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      id,
      feedback,
      rating,
    }: {
      id: string;
      feedback?: string;
      rating?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return homeworkSubmissionsService.approve(id, user.id, feedback, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['homework-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['homework-stats'] });
    },
  });
}

// --- Stats Hook ---

export function useHomeworkDashboardStats() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['homework-stats', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return null;
      return homeworkService.getDashboardStats(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

// --- Pet Parent Homework Hooks ---

export function usePetParentHomework() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-homework', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        // Return demo homework data for pet parent
        return [
          {
            id: 'hw-1',
            title: 'Basic Sit Practice',
            description: 'Practice sit command with your dog daily',
            instructions: 'Follow the video demonstration to practice sit with your dog for 10 minutes.',
            dog: { id: 'a', name: 'Max', breed: 'German Shepherd' },
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'assigned',
            difficulty: 'beginner',
            video_url: 'https://example.com/sit-demo.mp4',
            assigned_by: { name: 'Sarah Johnson' },
            submissions: [],
          },
          {
            id: 'hw-2',
            title: 'Leash Walking Practice',
            description: 'Work on loose leash walking',
            instructions: 'Walk for 15 minutes focusing on keeping the leash loose.',
            dog: { id: 'a', name: 'Max', breed: 'German Shepherd' },
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'in_progress',
            difficulty: 'intermediate',
            video_url: null,
            assigned_by: { name: 'Sarah Johnson' },
            submissions: [
              {
                id: 'sub-1',
                notes: 'We practiced today, Max did great!',
                status: 'approved',
                trainer_feedback: 'Excellent work! Keep it up.',
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
          },
          {
            id: 'hw-3',
            title: 'Recall Foundation',
            description: 'Build a reliable recall',
            instructions: 'Practice recall in a fenced area or on a long line.',
            dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever' },
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'assigned',
            difficulty: 'beginner',
            video_url: null,
            assigned_by: { name: 'John Smith' },
            submissions: [],
          },
        ];
      }
      // In production, fetch homework for parent's dogs
      return [];
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

export function usePetParentHomeworkDetail(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['pet-parent-homework', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null;
      if (isDemoMode()) {
        // Return demo detail
        return {
          id: assignmentId,
          title: 'Basic Sit Practice',
          description: 'Practice sit command with your dog daily',
          instructions: '1. Start in a quiet room\n2. Hold treat above nose\n3. Say "Sit" once\n4. Reward immediately when they sit\n5. Repeat 10 times',
          tips: 'Keep sessions short and fun! Always end on a positive note.',
          dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'assigned',
          difficulty: 'beginner',
          video_url: 'https://example.com/sit-demo.mp4',
          assigned_by: { name: 'Sarah Johnson', avatar_url: null },
          assigned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          custom_notes: 'Focus on duration - Max can sit but breaks quickly after a few seconds.',
          repetitions_required: 3,
          submissions: [],
        };
      }
      return homeworkAssignmentsService.getById(assignmentId);
    },
    enabled: !!assignmentId,
  });
}

// ============================================================================
// MESSAGING HOOKS
// ============================================================================

import {
  conversationsService,
  messagesService,
  messageTemplatesService,
} from '@/services/supabase/messaging';
import type {
  Conversation,
  Message,
  MessageTemplate,
  ConversationWithDetails,
  MessageWithSender,
  MessageSenderType,
  MessageType,
} from '@/types/database';

// --- Conversations Hooks ---

export function useConversations(options?: {
  isArchived?: boolean;
  isPinned?: boolean;
  search?: string;
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['conversations', facility?.id, options],
    queryFn: async () => {
      return conversationsService.getAll(options);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function usePetParentConversations() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-conversations', user?.id],
    queryFn: async () => {
      // In demo mode or production, use family ID
      // For demo, assume family-1
      return conversationsService.getForFamily('family-1');
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      return conversationsService.getById(conversationId);
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (data: {
      family_id: string;
      dog_id?: string;
      title?: string;
    }) => {
      if (!facility?.id) throw new Error('No facility');
      return conversationsService.create({
        facility_id: facility.id,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Conversation, 'is_archived' | 'is_pinned' | 'title'>>;
    }) => {
      return conversationsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', id] });
    },
  });
}

export function useUnreadMessageCount() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['messages', 'unread-count', facility?.id],
    queryFn: async () => {
      return conversationsService.getUnreadCount();
    },
    enabled: !!facility?.id || isDemoMode(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function usePetParentUnreadCount() {
  const user = useUser();

  return useQuery({
    queryKey: ['messages', 'unread-count-parent', user?.id],
    queryFn: async () => {
      // For demo, assume family-1
      return conversationsService.getUnreadCountForFamily('family-1');
    },
    enabled: !!user?.id || isDemoMode(),
    refetchInterval: 30000,
  });
}

// --- Messages Hooks ---

export function useMessages(
  conversationId: string | undefined,
  options?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: ['messages', conversationId, options],
    queryFn: async () => {
      if (!conversationId) return [];
      return messagesService.getForConversation(conversationId, options);
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: {
      conversation_id: string;
      content: string;
      sender_type: MessageSenderType;
      message_type?: MessageType;
      media_url?: string;
      reply_to_id?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagesService.send({
        ...data,
        sender_id: user.id,
      });
    },
    onSuccess: (_, { conversation_id }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      readerType,
    }: {
      conversationId: string;
      readerType: 'trainer' | 'parent';
    }) => {
      return messagesService.markAsRead(conversationId, readerType);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return messagesService.edit(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return messagesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      messageId,
      reaction,
    }: {
      messageId: string;
      reaction: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagesService.addReaction(messageId, user.id, reaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      messageId,
      reaction,
    }: {
      messageId: string;
      reaction: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return messagesService.removeReaction(messageId, user.id, reaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// --- Message Templates Hooks ---

export function useMessageTemplates(options?: { category?: string; isActive?: boolean }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['message-templates', facility?.id, options],
    queryFn: async () => {
      return messageTemplatesService.getAll(options);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category?: string;
    }) => {
      if (!facility?.id) throw new Error('No facility');
      return messageTemplatesService.create({
        facility_id: facility.id,
        created_by: user?.id,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
  });
}

export function useUpdateMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<MessageTemplate, 'title' | 'content' | 'category' | 'is_active'>>;
    }) => {
      return messageTemplatesService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return messageTemplatesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
  });
}

// ============================================================================
// CALENDAR HOOKS
// ============================================================================

import {
  calendarService,
  staysService,
  appointmentsService,
  blocksService,
  scheduleTemplatesService,
  dailyLogsService,
} from '@/services/supabase/calendar';
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

// --- Board & Train Stays Hooks ---

export function useBoardTrainStays(options?: {
  status?: StayStatus;
  dateRange?: { start: string; end: string };
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['board-train-stays', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      if (options?.dateRange) {
        return staysService.getByDateRange(
          facility.id,
          options.dateRange.start,
          options.dateRange.end
        );
      }
      return staysService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useActiveStays() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['board-train-stays', 'active', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return staysService.getActive(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useUpcomingStays() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['board-train-stays', 'upcoming', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return staysService.getUpcoming(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useBoardTrainStay(stayId: string | undefined) {
  return useQuery({
    queryKey: ['board-train-stays', stayId],
    queryFn: async () => {
      if (!stayId) return null;
      return staysService.getById(stayId);
    },
    enabled: !!stayId,
  });
}

export function useCreateStay() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<BoardTrainStay, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return staysService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BoardTrainStay>;
    }) => {
      return staysService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['board-train-stays', id] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useCheckInStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stayId: string) => {
      return staysService.checkIn(stayId);
    },
    onSuccess: (_, stayId) => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['board-train-stays', stayId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useCheckOutStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stayId: string) => {
      return staysService.checkOut(stayId);
    },
    onSuccess: (_, stayId) => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['board-train-stays', stayId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useCancelStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stayId: string) => {
      return staysService.cancel(stayId);
    },
    onSuccess: (_, stayId) => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['board-train-stays', stayId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stayId: string) => {
      return staysService.delete(stayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-train-stays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// --- Calendar Appointments Hooks ---

export function useCalendarAppointments(options?: {
  dateRange?: { start: string; end: string };
  dogId?: string;
  trainerId?: string;
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['calendar-appointments', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      if (options?.dateRange) {
        return appointmentsService.getByDateRange(
          facility.id,
          options.dateRange.start,
          options.dateRange.end
        );
      }
      if (options?.dogId) {
        return appointmentsService.getByDog(options.dogId);
      }
      if (options?.trainerId) {
        return appointmentsService.getByTrainer(options.trainerId);
      }
      return appointmentsService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useUpcomingAppointments(limit?: number) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['calendar-appointments', 'upcoming', facility?.id, limit],
    queryFn: async () => {
      if (!facility?.id) return [];
      return appointmentsService.getUpcoming(facility.id, limit);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCalendarAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ['calendar-appointments', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      return appointmentsService.getById(appointmentId);
    },
    enabled: !!appointmentId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<CalendarAppointment, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return appointmentsService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CalendarAppointment>;
    }) => {
      return appointmentsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments', id] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return appointmentsService.confirm(appointmentId);
    },
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments', appointmentId] });
    },
  });
}

export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return appointmentsService.complete(appointmentId);
    },
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments', appointmentId] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      reason,
    }: {
      appointmentId: string;
      reason?: string;
    }) => {
      return appointmentsService.cancel(appointmentId, reason);
    },
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      return appointmentsService.delete(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// --- Calendar Blocks Hooks ---

export function useCalendarBlocks(options?: {
  dateRange?: { start: string; end: string };
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['calendar-blocks', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      if (options?.dateRange) {
        return blocksService.getByDateRange(
          facility.id,
          options.dateRange.start,
          options.dateRange.end
        );
      }
      return blocksService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<CalendarBlock, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return blocksService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CalendarBlock>;
    }) => {
      return blocksService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string) => {
      return blocksService.delete(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// --- Schedule Templates Hooks ---

export function useScheduleTemplates() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['schedule-templates', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return scheduleTemplatesService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateScheduleTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<TrainingScheduleTemplate, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return scheduleTemplatesService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
    },
  });
}

export function useUpdateScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TrainingScheduleTemplate>;
    }) => {
      return scheduleTemplatesService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
    },
  });
}

export function useDeleteScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      return scheduleTemplatesService.delete(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-templates'] });
    },
  });
}

// --- Stay Daily Logs Hooks ---

export function useStayDailyLogs(stayId: string | undefined) {
  return useQuery({
    queryKey: ['stay-daily-logs', stayId],
    queryFn: async () => {
      if (!stayId) return [];
      return dailyLogsService.getByStay(stayId);
    },
    enabled: !!stayId,
  });
}

export function useStayDailyLog(stayId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['stay-daily-logs', stayId, date],
    queryFn: async () => {
      if (!stayId || !date) return null;
      return dailyLogsService.getByDate(stayId, date);
    },
    enabled: !!stayId && !!date,
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<StayDailyLog, 'id' | 'created_at' | 'updated_at' | 'logged_by'>
    ) => {
      return dailyLogsService.create({
        ...data,
        logged_by: user?.id || null,
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['stay-daily-logs', data.stay_id] });
    },
  });
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      stayId,
      data,
    }: {
      id: string;
      stayId: string;
      data: Partial<StayDailyLog>;
    }) => {
      return dailyLogsService.update(id, data);
    },
    onSuccess: (_, { stayId }) => {
      queryClient.invalidateQueries({ queryKey: ['stay-daily-logs', stayId] });
    },
  });
}

export function useUpsertDailyLog() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<StayDailyLog, 'id' | 'created_at' | 'updated_at' | 'logged_by'>
    ) => {
      return dailyLogsService.upsert({
        ...data,
        logged_by: user?.id || null,
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['stay-daily-logs', data.stay_id] });
    },
  });
}

// --- Combined Calendar Events Hook ---

export function useCalendarEvents(dateRange: { start: string; end: string }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['calendar-events', facility?.id, dateRange],
    queryFn: async () => {
      if (!facility?.id) return [];
      return calendarService.getCalendarEvents(
        facility.id,
        dateRange.start,
        dateRange.end
      );
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

// --- Pet Parent Calendar Hooks ---

export function usePetParentStays() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-stays', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        // Return demo stays for pet parent view
        return [
          {
            id: 'stay-demo-1',
            dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
            check_in_date: '2025-01-06',
            check_out_date: '2025-01-27',
            status: 'checked_in',
            kennel_number: 'K-101',
            program: { name: '3-Week Board & Train' },
            days_remaining: 12,
            daily_logs: [],
          },
        ];
      }
      // In production, fetch stays for family's dogs
      return [];
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

export function usePetParentAppointments() {
  const user = useUser();

  return useQuery({
    queryKey: ['pet-parent-appointments', user?.id],
    queryFn: async () => {
      if (isDemoMode() || !user?.id) {
        // Return demo appointments for pet parent
        return [
          {
            id: 'appt-demo-1',
            title: 'Training Session',
            dog: { id: 'a', name: 'Max' },
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            appointment_type: 'training',
            trainer: { name: 'Sarah Johnson' },
            location: 'Training Yard A',
          },
          {
            id: 'appt-demo-2',
            title: 'Pick Up - Max',
            dog: { id: 'a', name: 'Max' },
            start_time: new Date('2025-01-27T16:00:00').toISOString(),
            end_time: new Date('2025-01-27T16:30:00').toISOString(),
            appointment_type: 'pickup',
            trainer: null,
            location: 'Front Office',
          },
        ];
      }
      // In production, fetch appointments for family's dogs
      return [];
    },
    enabled: !!user?.id || isDemoMode(),
  });
}

// ============================================================================
// DAILY REPORTS HOOKS
// ============================================================================

import {
  dailyReportsService,
  reportTemplatesService,
  reportCommentsService,
  reportReactionsService,
  reportsService,
} from '@/services/supabase/reports';
import type {
  DailyReportFull,
  DailyReportWithDetails,
  ReportTemplate,
  ReportComment,
  ReportStatus,
} from '@/types/database';

// --- Daily Reports Hooks ---

export function useDailyReports(options?: {
  status?: ReportStatus;
  dogId?: string;
  date?: string;
  dateRange?: { start: string; end: string };
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['daily-reports', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      return dailyReportsService.getAll(facility.id, options);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useTodaysReports() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['daily-reports', 'today', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return dailyReportsService.getTodaysReports(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useDraftReports() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['daily-reports', 'drafts', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return dailyReportsService.getDrafts(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useReadyReports() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['daily-reports', 'ready', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return dailyReportsService.getReady(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useDailyReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ['daily-reports', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      return dailyReportsService.getById(reportId);
    },
    enabled: !!reportId,
  });
}

export function useDogReport(dogId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['daily-reports', 'dog', dogId, date],
    queryFn: async () => {
      if (!dogId || !date) return null;
      return dailyReportsService.getByDogAndDate(dogId, date);
    },
    enabled: !!dogId && !!date,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      dogId,
      programId,
      date,
    }: {
      dogId: string;
      programId: string | null;
      date: string;
    }) => {
      if (!facility?.id || !user?.id) throw new Error('Not authenticated');
      return dailyReportsService.generateReport(
        facility.id,
        dogId,
        programId,
        date,
        user.id
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    },
  });
}

export function useUpdateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DailyReportFull>;
    }) => {
      return dailyReportsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', id] });
    },
  });
}

export function useMarkReportReady() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      return dailyReportsService.markAsReady(reportId);
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

export function useSendReport() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      return dailyReportsService.sendReport(reportId, user.id);
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

export function useBulkSendReports() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (reportIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      return dailyReportsService.bulkSend(reportIds, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    },
  });
}

export function useRegenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      return dailyReportsService.regenerateSummary(reportId);
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      return dailyReportsService.delete(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    },
  });
}

// --- Report Stats Hook ---

export function useReportStats() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['report-stats', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return null;
      return reportsService.getReportStats(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

// --- Report Templates Hooks ---

export function useReportTemplates() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['report-templates', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return reportTemplatesService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useDefaultReportTemplate() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['report-templates', 'default', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return null;
      return reportTemplatesService.getDefault(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return reportTemplatesService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ReportTemplate>;
    }) => {
      return reportTemplatesService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      return reportTemplatesService.delete(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

// --- Report Comments Hooks ---

export function useReportComments(reportId: string | undefined) {
  return useQuery({
    queryKey: ['report-comments', reportId],
    queryFn: async () => {
      if (!reportId) return [];
      return reportCommentsService.getByReport(reportId);
    },
    enabled: !!reportId,
  });
}

export function useAddReportComment() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      reportId,
      content,
      commenterType,
    }: {
      reportId: string;
      content: string;
      commenterType: 'parent' | 'trainer';
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return reportCommentsService.create({
        report_id: reportId,
        user_id: user.id,
        content,
        commenter_type: commenterType,
      });
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report-comments', reportId] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

export function useUpdateReportComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reportId,
      content,
    }: {
      id: string;
      reportId: string;
      content: string;
    }) => {
      return reportCommentsService.update(id, content);
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report-comments', reportId] });
    },
  });
}

export function useDeleteReportComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reportId,
    }: {
      id: string;
      reportId: string;
    }) => {
      return reportCommentsService.delete(id);
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report-comments', reportId] });
    },
  });
}

// --- Report Reactions Hooks ---

export function useReportReactions(reportId: string | undefined) {
  return useQuery({
    queryKey: ['report-reactions', reportId],
    queryFn: async () => {
      if (!reportId) return [];
      return reportReactionsService.getByReport(reportId);
    },
    enabled: !!reportId,
  });
}

export function useAddReportReaction() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      reportId,
      reaction,
    }: {
      reportId: string;
      reaction: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return reportReactionsService.add(reportId, user.id, reaction);
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report-reactions', reportId] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

export function useRemoveReportReaction() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      reportId,
      reaction,
    }: {
      reportId: string;
      reaction: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return reportReactionsService.remove(reportId, user.id, reaction);
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['report-reactions', reportId] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports', reportId] });
    },
  });
}

// ============================================================================
// VIDEO LIBRARY HOOKS
// ============================================================================

import {
  videosService,
  videoFoldersService,
  playlistsService,
  videoSharesService,
  videoLibraryService,
} from '@/services/supabase/videos';
import type {
  TrainingVideo,
  TrainingVideoWithDetails,
  VideoFolder,
  VideoPlaylist,
  VideoCategory,
  VideoVisibility,
} from '@/types/database';

export function useTrainingVideos(options?: {
  category?: VideoCategory;
  folderId?: string | null;
  visibility?: VideoVisibility;
  search?: string;
}) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['training-videos', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      return videosService.getAll(facility.id, options);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useTrainingVideo(videoId: string | undefined) {
  return useQuery({
    queryKey: ['training-videos', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      return videosService.getById(videoId);
    },
    enabled: !!videoId,
  });
}

export function useFeaturedVideos() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['training-videos', 'featured', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return videosService.getFeatured(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<TrainingVideo, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'facility_id' | 'uploaded_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return videosService.create({
        ...data,
        facility_id: facility.id,
        uploaded_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-videos'] });
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TrainingVideo>;
    }) => {
      return videosService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['training-videos'] });
      queryClient.invalidateQueries({ queryKey: ['training-videos', id] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      return videosService.delete(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-videos'] });
      queryClient.invalidateQueries({ queryKey: ['video-stats'] });
    },
  });
}

export function useVideoFolders() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['video-folders', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return videoFoldersService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateVideoFolder() {
  const queryClient = useQueryClient();
  const facility = useFacility();
  const user = useUser();

  return useMutation({
    mutationFn: async (
      data: Omit<VideoFolder, 'id' | 'created_at' | 'updated_at' | 'facility_id' | 'created_by'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return videoFoldersService.create({
        ...data,
        facility_id: facility.id,
        created_by: user?.id || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-folders'] });
    },
  });
}

export function useVideoPlaylists() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['video-playlists', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return playlistsService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useVideoPlaylist(playlistId: string | undefined) {
  return useQuery({
    queryKey: ['video-playlists', playlistId],
    queryFn: async () => {
      if (!playlistId) return null;
      return playlistsService.getById(playlistId);
    },
    enabled: !!playlistId,
  });
}

export function useShareVideo() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      videoId,
      familyId,
      dogId,
      message,
    }: {
      videoId: string;
      familyId?: string;
      dogId?: string;
      message?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return videoSharesService.shareVideo(videoId, {
        familyId,
        dogId,
        sharedBy: user.id,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-shares'] });
    },
  });
}

export function useVideoLibraryStats() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['video-stats', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return null;
      return videoLibraryService.getLibraryStats(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

// ============================================================================
// LIVE STATUS FEED HOOKS
// ============================================================================

// --- Status Feed Hooks ---

export function useDogStatusFeed(dogId: string | undefined, options?: { limit?: number }) {
  return useQuery({
    queryKey: ['status-feed', dogId, options],
    queryFn: async () => {
      if (!dogId) return [];
      return statusFeedService.getDogFeedWithDetails(dogId, options);
    },
    enabled: !!dogId,
    refetchInterval: 30000, // Refetch every 30 seconds for near-real-time updates
  });
}

export function useFacilityStatusFeed(options?: { dogId?: string; updateType?: StatusUpdateType; limit?: number }) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['facility-feed', facility?.id, options],
    queryFn: async () => {
      if (!facility?.id) return [];
      return statusFeedService.getFacilityFeed(facility.id, options);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useStatusPresets() {
  return useQuery({
    queryKey: ['status-presets'],
    queryFn: () => statusFeedService.getPresets(),
  });
}

export function useCreateStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      dog_id: string;
      update_type: StatusUpdateType;
      title: string;
      description?: string;
      media_url?: string;
      media_type?: 'image' | 'video';
      thumbnail_url?: string;
      mood?: DogMood;
      energy_level?: number;
      activity_id?: string;
      is_visible_to_parents?: boolean;
      is_highlighted?: boolean;
    }) => {
      return statusFeedService.createStatusUpdate(data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['status-feed', data.dog_id] });
      queryClient.invalidateQueries({ queryKey: ['facility-feed'] });
    },
  });
}

export function useCreateStatusFromPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      presetId,
      dogId,
      customDescription,
    }: {
      presetId: string;
      dogId: string;
      customDescription?: string;
    }) => {
      return statusFeedService.createFromPreset(presetId, dogId, customDescription);
    },
    onSuccess: (_, { dogId }) => {
      queryClient.invalidateQueries({ queryKey: ['status-feed', dogId] });
      queryClient.invalidateQueries({ queryKey: ['facility-feed'] });
    },
  });
}

export function useUpdateStatusItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dogId,
      data,
    }: {
      id: string;
      dogId: string;
      data: Partial<Omit<StatusFeedItem, 'id' | 'created_at'>>;
    }) => {
      return statusFeedService.updateStatusItem(id, data);
    },
    onSuccess: (_, { dogId }) => {
      queryClient.invalidateQueries({ queryKey: ['status-feed', dogId] });
      queryClient.invalidateQueries({ queryKey: ['facility-feed'] });
    },
  });
}

export function useDeleteStatusItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dogId }: { id: string; dogId: string }) => {
      return statusFeedService.deleteStatusItem(id);
    },
    onSuccess: (_, { dogId }) => {
      queryClient.invalidateQueries({ queryKey: ['status-feed', dogId] });
      queryClient.invalidateQueries({ queryKey: ['facility-feed'] });
    },
  });
}

// --- Feed Reaction Hooks ---

export function useAddFeedReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedItemId,
      reaction,
    }: {
      feedItemId: string;
      reaction: string;
    }) => {
      return feedReactionsService.addReaction(feedItemId, reaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-feed'] });
    },
  });
}

export function useRemoveFeedReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedItemId,
      reaction,
    }: {
      feedItemId: string;
      reaction: string;
    }) => {
      return feedReactionsService.removeReaction(feedItemId, reaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-feed'] });
    },
  });
}

// --- Feed Comment Hooks ---

export function useAddFeedComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedItemId,
      content,
    }: {
      feedItemId: string;
      content: string;
    }) => {
      return feedCommentsService.addComment(feedItemId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-feed'] });
    },
  });
}

export function useUpdateFeedComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: string;
      content: string;
    }) => {
      return feedCommentsService.updateComment(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-feed'] });
    },
  });
}

export function useDeleteFeedComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return feedCommentsService.deleteComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-feed'] });
    },
  });
}

// --- Pet Parent Status Feed Hook (for pet parent portal) ---

export function usePetParentStatusFeed(dogIds?: string[]) {
  return useQuery({
    queryKey: ['pet-parent-feed', dogIds],
    queryFn: async () => {
      if (!dogIds || dogIds.length === 0) return [];

      // Fetch feed for all dogs and combine
      const feeds = await Promise.all(
        dogIds.map(dogId => statusFeedService.getDogFeedWithDetails(dogId, { limit: 20 }))
      );

      // Flatten and sort by created_at
      return feeds
        .flat()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);
    },
    enabled: !!dogIds && dogIds.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// ============================================================================
// BUSINESS MODE CONFIGURATION HOOKS
// ============================================================================

export function useFacilityConfig() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['facility-config', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return null;
      return facilityConfigService.getConfig(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useFeatureFlags(): FeatureFlags | null {
  const { data: config } = useFacilityConfig();
  if (!config) return null;
  return configToFeatureFlags(config);
}

export function useUpdateFacilityConfig() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (
      data: Partial<Omit<FacilityConfig, 'id' | 'facility_id' | 'created_at' | 'updated_at'>>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return facilityConfigService.updateConfig(facility.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-config'] });
    },
  });
}

export function useSwitchBusinessMode() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async ({
      mode,
      applyPreset,
    }: {
      mode: BusinessMode;
      applyPreset?: string;
    }) => {
      if (!facility?.id) throw new Error('No facility');
      return facilityConfigService.switchBusinessMode(facility.id, mode, applyPreset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-config'] });
    },
  });
}

export function useFeaturePresets(mode?: BusinessMode) {
  return useQuery({
    queryKey: ['feature-presets', mode],
    queryFn: () => facilityConfigService.getPresets(mode),
  });
}

export function useApplyPreset() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (presetId: string) => {
      if (!facility?.id) throw new Error('No facility');
      return facilityConfigService.applyPreset(facility.id, presetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-config'] });
    },
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async ({
      feature,
      enabled,
    }: {
      feature: string;
      enabled: boolean;
    }) => {
      if (!facility?.id) throw new Error('No facility');
      return facilityConfigService.toggleFeature(facility.id, feature, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-config'] });
    },
  });
}

// ============================================================================
// KENNEL MANAGEMENT HOOKS
// ============================================================================

import {
  kennelService,
  kennelAssignmentService,
  kennelActivityService,
} from '@/services/supabase/kennels';
import type {
  Kennel,
  KennelWithAssignment,
  KennelAssignment,
  KennelActivityLog,
  KennelStatus,
  KennelSize,
} from '@/types/database';

// --- Kennel Hooks ---

export function useKennels() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['kennels', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return kennelService.getAll(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useKennel(kennelId: string | undefined) {
  return useQuery({
    queryKey: ['kennels', kennelId],
    queryFn: async () => {
      if (!kennelId) return null;
      return kennelService.getById(kennelId);
    },
    enabled: !!kennelId,
  });
}

export function useAvailableKennels(size?: KennelSize) {
  const facility = useFacility();

  return useQuery({
    queryKey: ['kennels', 'available', facility?.id, size],
    queryFn: async () => {
      if (!facility?.id) return [];
      return kennelService.getAvailable(facility.id, size);
    },
    enabled: !!facility?.id || isDemoMode(),
  });
}

export function useCreateKennel() {
  const queryClient = useQueryClient();
  const facility = useFacility();

  return useMutation({
    mutationFn: async (
      data: Omit<Kennel, 'id' | 'created_at' | 'updated_at' | 'facility_id'>
    ) => {
      if (!facility?.id) throw new Error('No facility');
      return kennelService.create({
        ...data,
        facility_id: facility.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
    },
  });
}

export function useUpdateKennel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Kennel>;
    }) => {
      return kennelService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
      queryClient.invalidateQueries({ queryKey: ['kennels', id] });
    },
  });
}

export function useUpdateKennelStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: KennelStatus;
    }) => {
      return kennelService.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
    },
  });
}

export function useDeleteKennel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kennelId: string) => {
      return kennelService.delete(kennelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
    },
  });
}

// --- Kennel QR Scan Hook ---

export function useKennelQRScan(kennelId: string | undefined) {
  return useQuery({
    queryKey: ['kennel-qr-scan', kennelId],
    queryFn: async () => {
      if (!kennelId) return null;
      return kennelService.getQRScanData(kennelId);
    },
    enabled: !!kennelId,
  });
}

// --- Kennel Assignment Hooks ---

export function useAssignDogToKennel() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      kennelId,
      dogId,
      stayId,
      notes,
    }: {
      kennelId: string;
      dogId: string;
      stayId?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return kennelAssignmentService.assign(kennelId, dogId, user.id, stayId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
      queryClient.invalidateQueries({ queryKey: ['kennel-assignments'] });
    },
  });
}

export function useReleaseDogFromKennel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      return kennelAssignmentService.release(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kennels'] });
      queryClient.invalidateQueries({ queryKey: ['kennel-assignments'] });
    },
  });
}

export function useDogKennelAssignment(dogId: string | undefined) {
  return useQuery({
    queryKey: ['kennel-assignments', 'dog', dogId],
    queryFn: async () => {
      if (!dogId) return null;
      return kennelAssignmentService.getByDog(dogId);
    },
    enabled: !!dogId,
  });
}

export function useKennelHistory(kennelId: string | undefined) {
  return useQuery({
    queryKey: ['kennel-assignments', 'history', kennelId],
    queryFn: async () => {
      if (!kennelId) return [];
      return kennelAssignmentService.getKennelHistory(kennelId);
    },
    enabled: !!kennelId,
  });
}

// --- Kennel Activity Hooks ---

export function useLogKennelActivity() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async ({
      kennelId,
      activityType,
      notes,
      dogId,
      assignmentId,
    }: {
      kennelId: string;
      activityType: string;
      notes?: string;
      dogId?: string;
      assignmentId?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return kennelActivityService.log(kennelId, activityType, user.id, notes, dogId, assignmentId);
    },
    onSuccess: (_, { kennelId }) => {
      queryClient.invalidateQueries({ queryKey: ['kennel-activity', kennelId] });
      queryClient.invalidateQueries({ queryKey: ['kennel-qr-scan', kennelId] });
    },
  });
}

export function useKennelActivityLogs(kennelId: string | undefined) {
  return useQuery({
    queryKey: ['kennel-activity', kennelId],
    queryFn: async () => {
      if (!kennelId) return [];
      return kennelActivityService.getByKennel(kennelId);
    },
    enabled: !!kennelId,
  });
}

export function useDogKennelActivityLogs(dogId: string | undefined) {
  return useQuery({
    queryKey: ['kennel-activity', 'dog', dogId],
    queryFn: async () => {
      if (!dogId) return [];
      return kennelActivityService.getByDog(dogId);
    },
    enabled: !!dogId,
  });
}

export function useTodayKennelActivityLogs() {
  const facility = useFacility();

  return useQuery({
    queryKey: ['kennel-activity', 'today', facility?.id],
    queryFn: async () => {
      if (!facility?.id) return [];
      return kennelActivityService.getTodayLogs(facility.id);
    },
    enabled: !!facility?.id || isDemoMode(),
    refetchInterval: 60000, // Refresh every minute
  });
}
