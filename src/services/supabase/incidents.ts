// Incident Reporting and Tracking Service
// Manages safety incidents, behavioral issues, and medical events

import { supabase } from '@/lib/supabase';

// Incident severity levels
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

// Incident types
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

// Incident status
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

// Incident interface
export interface Incident {
  id: string;
  facility_id: string;
  dog_id: string;
  dog?: {
    id: string;
    name: string;
    breed: string;
    photo_url?: string;
  };
  reported_by: string;
  reporter?: {
    id: string;
    full_name: string;
  };
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  incident_date: string;
  incident_time: string;
  witnesses?: string[];
  other_dogs_involved?: string[];
  injuries_reported: boolean;
  injury_details?: string;
  medical_attention_required: boolean;
  medical_details?: string;
  parent_notified: boolean;
  parent_notified_at?: string;
  parent_notified_by?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

// Incident note for tracking updates
export interface IncidentNote {
  id: string;
  incident_id: string;
  author_id: string;
  author?: {
    id: string;
    full_name: string;
  };
  content: string;
  created_at: string;
}

// Incident type configurations
export const incidentTypes: Record<IncidentType, { label: string; icon: string; defaultSeverity: IncidentSeverity }> = {
  bite: { label: 'Bite Incident', icon: '🦷', defaultSeverity: 'high' },
  fight: { label: 'Dog Fight', icon: '⚔️', defaultSeverity: 'high' },
  escape: { label: 'Escape Attempt', icon: '🏃', defaultSeverity: 'medium' },
  injury: { label: 'Injury', icon: '🩹', defaultSeverity: 'medium' },
  illness: { label: 'Illness/Health Issue', icon: '🤒', defaultSeverity: 'medium' },
  property_damage: { label: 'Property Damage', icon: '💥', defaultSeverity: 'low' },
  behavioral: { label: 'Behavioral Concern', icon: '⚠️', defaultSeverity: 'low' },
  near_miss: { label: 'Near Miss', icon: '😰', defaultSeverity: 'low' },
  other: { label: 'Other', icon: '📋', defaultSeverity: 'low' },
};

// Severity configurations
export const severityConfig: Record<IncidentSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  medium: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  critical: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

// Status configurations
export const statusConfig: Record<IncidentStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'error' },
  investigating: { label: 'Investigating', color: 'warning' },
  resolved: { label: 'Resolved', color: 'success' },
  closed: { label: 'Closed', color: 'surface' },
};

// Incident service
export const incidentService = {
  // Create a new incident report
  async createIncident(data: {
    facility_id: string;
    dog_id: string;
    reported_by: string;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    incident_time: string;
    witnesses?: string[];
    other_dogs_involved?: string[];
    injuries_reported: boolean;
    injury_details?: string;
    medical_attention_required: boolean;
    medical_details?: string;
    photos?: string[];
  }) {
    const incident = {
      ...data,
      status: 'open' as IncidentStatus,
      parent_notified: false,
      follow_up_required: data.severity === 'high' || data.severity === 'critical',
    };

    console.log('Creating incident:', incident);

    // In production, this would save to Supabase
    // const { data: result, error } = await supabase
    //   .from('incidents')
    //   .insert(incident)
    //   .select()
    //   .single();

    return {
      ...incident,
      id: `inc_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Get incidents for a facility
  async getIncidents(facilityId: string, filters?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    type?: IncidentType;
    dogId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    console.log('Getting incidents:', { facilityId, filters });

    // In production, this would query Supabase with filters
    // let query = supabase
    //   .from('incidents')
    //   .select(`
    //     *,
    //     dog:dogs(id, name, breed, photo_url),
    //     reporter:profiles(id, full_name)
    //   `)
    //   .eq('facility_id', facilityId)
    //   .order('incident_date', { ascending: false });

    return [];
  },

  // Get a single incident by ID
  async getIncident(incidentId: string) {
    console.log('Getting incident:', incidentId);

    // In production, this would query Supabase
    return null;
  },

  // Update incident status
  async updateStatus(incidentId: string, status: IncidentStatus, notes?: string, resolvedBy?: string) {
    const updates: Partial<Incident> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = resolvedBy;
      if (notes) {
        updates.resolution_notes = notes;
      }
    }

    console.log('Updating incident status:', { incidentId, status, notes });

    // In production, this would update Supabase
    return { success: true };
  },

  // Add a note to an incident
  async addNote(incidentId: string, authorId: string, content: string) {
    const note = {
      incident_id: incidentId,
      author_id: authorId,
      content,
    };

    console.log('Adding incident note:', note);

    // In production, this would insert to Supabase
    return {
      ...note,
      id: `note_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  },

  // Get notes for an incident
  async getNotes(incidentId: string) {
    console.log('Getting incident notes:', incidentId);

    // In production, this would query Supabase
    return [];
  },

  // Mark parent as notified
  async markParentNotified(incidentId: string, notifiedBy: string) {
    console.log('Marking parent notified:', { incidentId, notifiedBy });

    // In production, this would update Supabase
    return {
      parent_notified: true,
      parent_notified_at: new Date().toISOString(),
      parent_notified_by: notifiedBy,
    };
  },

  // Upload incident photos
  async uploadPhotos(incidentId: string, files: File[]) {
    console.log('Uploading incident photos:', { incidentId, count: files.length });

    // In production, this would upload to Supabase Storage
    // const urls = await Promise.all(
    //   files.map(async (file) => {
    //     const fileName = `incidents/${incidentId}/${Date.now()}_${file.name}`;
    //     const { data, error } = await supabase.storage
    //       .from('incident-photos')
    //       .upload(fileName, file);
    //     return supabase.storage.from('incident-photos').getPublicUrl(fileName).data.publicUrl;
    //   })
    // );

    return { urls: [] };
  },

  // Get incident statistics
  async getStats(facilityId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    console.log('Getting incident stats:', { facilityId, period });

    // In production, this would aggregate data from Supabase
    return {
      total: 0,
      open: 0,
      resolved: 0,
      by_type: {} as Record<IncidentType, number>,
      by_severity: {} as Record<IncidentSeverity, number>,
      trend: 0, // percentage change from previous period
    };
  },

  // Generate incident report
  generateIncidentNumber(facilityPrefix: string = 'INC') {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${facilityPrefix}-${year}${month}-${random}`;
  },
};

// Location presets for quick selection
export const locationPresets = [
  'Training Yard',
  'Play Area',
  'Kennel Block A',
  'Kennel Block B',
  'Grooming Area',
  'Reception',
  'Feeding Station',
  'Walking Path',
  'Parking Lot',
  'Other',
];

// Common witnesses for quick selection (would come from staff in production)
export const getStaffList = () => [
  { id: 'staff_1', name: 'Sarah Johnson' },
  { id: 'staff_2', name: 'Mike Chen' },
  { id: 'staff_3', name: 'Emily Rodriguez' },
];
