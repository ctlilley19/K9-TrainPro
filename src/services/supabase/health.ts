// Health Records and Vaccination Tracking Service
// Manages vaccinations, medications, vet info, and health conditions

import { supabase } from './client';

// Vaccination types
export type VaccinationType =
  | 'rabies'
  | 'dhpp'
  | 'bordetella'
  | 'leptospirosis'
  | 'canine_influenza'
  | 'lyme'
  | 'other';

// Vaccination status
export type VaccinationStatus = 'current' | 'due_soon' | 'overdue' | 'not_required';

// Vaccination interface
export interface Vaccination {
  id: string;
  dog_id: string;
  type: VaccinationType;
  name: string;
  date_administered: string;
  expiration_date: string;
  administered_by: string; // Vet name/clinic
  lot_number?: string;
  notes?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

// Health condition types
export type ConditionSeverity = 'mild' | 'moderate' | 'severe';
export type ConditionStatus = 'active' | 'managed' | 'resolved';

// Health condition interface
export interface HealthCondition {
  id: string;
  dog_id: string;
  name: string;
  description?: string;
  severity: ConditionSeverity;
  status: ConditionStatus;
  diagnosed_date?: string;
  diagnosed_by?: string;
  treatment_plan?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Medication interface
export interface Medication {
  id: string;
  dog_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribing_vet?: string;
  reason?: string;
  instructions?: string;
  refills_remaining?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Vet/Veterinarian interface
export interface Veterinarian {
  id: string;
  dog_id: string;
  clinic_name: string;
  vet_name?: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  emergency_contact: boolean;
  notes?: string;
  created_at: string;
}

// Allergy interface
export interface Allergy {
  id: string;
  dog_id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction_type: string;
  treatment?: string;
  notes?: string;
  created_at: string;
}

// Weight record interface
export interface WeightRecord {
  id: string;
  dog_id: string;
  weight: number;
  unit: 'lbs' | 'kg';
  recorded_date: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
}

// Vaccination configurations
export const vaccinationConfig: Record<VaccinationType, {
  name: string;
  description: string;
  typicalDuration: number; // months
  required: boolean;
}> = {
  rabies: {
    name: 'Rabies',
    description: 'Required by law - protects against rabies virus',
    typicalDuration: 36, // 3 years after initial
    required: true,
  },
  dhpp: {
    name: 'DHPP/DAPP',
    description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',
    typicalDuration: 36,
    required: true,
  },
  bordetella: {
    name: 'Bordetella',
    description: 'Kennel cough - required for boarding/daycare',
    typicalDuration: 12,
    required: true,
  },
  leptospirosis: {
    name: 'Leptospirosis',
    description: 'Bacterial infection from contaminated water',
    typicalDuration: 12,
    required: false,
  },
  canine_influenza: {
    name: 'Canine Influenza',
    description: 'Dog flu - H3N2 and H3N8 strains',
    typicalDuration: 12,
    required: false,
  },
  lyme: {
    name: 'Lyme Disease',
    description: 'Tick-borne bacterial infection',
    typicalDuration: 12,
    required: false,
  },
  other: {
    name: 'Other',
    description: 'Other vaccinations',
    typicalDuration: 12,
    required: false,
  },
};

// Health service
export const healthService = {
  // Get vaccination status for a dog
  getVaccinationStatus(vaccination: Vaccination): VaccinationStatus {
    const today = new Date();
    const expiration = new Date(vaccination.expiration_date);
    const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) return 'overdue';
    if (daysUntilExpiration <= 30) return 'due_soon';
    return 'current';
  },

  // Get color for vaccination status
  getStatusColor(status: VaccinationStatus) {
    switch (status) {
      case 'current': return { color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'due_soon': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'overdue': return { color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'not_required': return { color: 'text-surface-400', bg: 'bg-surface-700' };
    }
  },

  // Calculate days until expiration
  getDaysUntilExpiration(expirationDate: string): number {
    const today = new Date();
    const expiration = new Date(expirationDate);
    return Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  },

  // Add vaccination record
  async addVaccination(data: {
    dog_id: string;
    type: VaccinationType;
    name: string;
    date_administered: string;
    expiration_date: string;
    administered_by: string;
    lot_number?: string;
    notes?: string;
    document_url?: string;
  }) {
    console.log('Adding vaccination:', data);

    // In production, this would save to Supabase
    return {
      ...data,
      id: `vax_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Get vaccinations for a dog
  async getVaccinations(dogId: string) {
    console.log('Getting vaccinations for dog:', dogId);

    // In production, this would query Supabase
    return [];
  },

  // Add health condition
  async addCondition(data: {
    dog_id: string;
    name: string;
    description?: string;
    severity: ConditionSeverity;
    status: ConditionStatus;
    diagnosed_date?: string;
    diagnosed_by?: string;
    treatment_plan?: string;
    notes?: string;
  }) {
    console.log('Adding health condition:', data);

    return {
      ...data,
      id: `cond_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Get conditions for a dog
  async getConditions(dogId: string) {
    console.log('Getting conditions for dog:', dogId);
    return [];
  },

  // Add medication
  async addMedication(data: {
    dog_id: string;
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    prescribing_vet?: string;
    reason?: string;
    instructions?: string;
    refills_remaining?: number;
  }) {
    console.log('Adding medication:', data);

    return {
      ...data,
      id: `med_${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Get medications for a dog
  async getMedications(dogId: string, activeOnly: boolean = true) {
    console.log('Getting medications for dog:', dogId);
    return [];
  },

  // Add allergy
  async addAllergy(data: {
    dog_id: string;
    allergen: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction_type: string;
    treatment?: string;
    notes?: string;
  }) {
    console.log('Adding allergy:', data);

    return {
      ...data,
      id: `allergy_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  // Get allergies for a dog
  async getAllergies(dogId: string) {
    console.log('Getting allergies for dog:', dogId);
    return [];
  },

  // Add weight record
  async addWeightRecord(data: {
    dog_id: string;
    weight: number;
    unit: 'lbs' | 'kg';
    recorded_by: string;
    notes?: string;
  }) {
    console.log('Adding weight record:', data);

    return {
      ...data,
      id: `weight_${Date.now()}`,
      recorded_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
  },

  // Get weight history for a dog
  async getWeightHistory(dogId: string) {
    console.log('Getting weight history for dog:', dogId);
    return [];
  },

  // Add veterinarian
  async addVeterinarian(data: {
    dog_id: string;
    clinic_name: string;
    vet_name?: string;
    phone: string;
    email?: string;
    address?: string;
    is_primary: boolean;
    emergency_contact: boolean;
    notes?: string;
  }) {
    console.log('Adding veterinarian:', data);

    return {
      ...data,
      id: `vet_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  // Get vets for a dog
  async getVeterinarians(dogId: string) {
    console.log('Getting vets for dog:', dogId);
    return [];
  },

  // Upload health document
  async uploadDocument(dogId: string, file: File, category: 'vaccination' | 'medical' | 'other') {
    console.log('Uploading health document:', { dogId, fileName: file.name, category });

    // In production, this would upload to Supabase Storage
    return {
      url: `/documents/${dogId}/${file.name}`,
    };
  },

  // Get health summary for a dog
  async getHealthSummary(dogId: string) {
    console.log('Getting health summary for dog:', dogId);

    return {
      vaccinations_current: 0,
      vaccinations_due_soon: 0,
      vaccinations_overdue: 0,
      active_conditions: 0,
      active_medications: 0,
      allergies_count: 0,
      last_weight: null as WeightRecord | null,
      primary_vet: null as Veterinarian | null,
    };
  },

  // Check all dogs for vaccination reminders
  async getUpcomingVaccinationReminders(facilityId: string, daysAhead: number = 30) {
    console.log('Getting vaccination reminders:', { facilityId, daysAhead });

    // In production, this would query all dogs with vaccinations expiring soon
    return [];
  },
};

// Common allergens
export const commonAllergens = [
  'Chicken',
  'Beef',
  'Dairy',
  'Wheat',
  'Soy',
  'Corn',
  'Eggs',
  'Fish',
  'Pork',
  'Lamb',
  'Flea bites',
  'Dust mites',
  'Pollen',
  'Mold',
  'Grass',
];

// Common medications
export const commonMedications = [
  'Apoquel (Oclacitinib)',
  'Bravecto',
  'Carprofen (Rimadyl)',
  'Gabapentin',
  'Heartgard',
  'Metacam (Meloxicam)',
  'Nexgard',
  'Prednisone',
  'Simparica',
  'Trazodone',
];

// Medication frequencies
export const medicationFrequencies = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'Weekly',
  'Monthly',
  'As needed',
];
