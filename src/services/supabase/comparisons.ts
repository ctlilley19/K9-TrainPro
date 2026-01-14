import { supabase } from '@/lib/supabase';

// Comparison types
export interface Comparison {
  id: string;
  dog_id: string;
  facility_id: string;
  title: string;
  description?: string;
  skill_id?: string;
  before_media: ComparisonMedia;
  after_media: ComparisonMedia;
  before_date: string;
  after_date: string;
  before_skill_level?: number;
  after_skill_level?: number;
  is_public: boolean;
  is_featured: boolean;
  views_count: number;
  created_by: string;
  created_at: string;
}

export interface ComparisonMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  duration?: number; // for videos, in seconds
  caption?: string;
}

// Comparison templates for common skills
export const comparisonTemplates = [
  {
    id: 'heel',
    skill: 'Heel',
    title: '{dogName}\'s Heel Transformation',
    description: 'Watch the amazing progress in loose leash walking!',
    suggestedCaption: {
      before: 'Day 1 - Pulling on leash',
      after: 'Now - Perfect heel position',
    },
  },
  {
    id: 'recall',
    skill: 'Recall',
    title: '{dogName}\'s Recall Journey',
    description: 'From ignoring calls to coming every time!',
    suggestedCaption: {
      before: 'Before - Distracted and unresponsive',
      after: 'After - Immediate recall with distractions',
    },
  },
  {
    id: 'reactivity',
    skill: 'Reactivity',
    title: '{dogName}\'s Reactivity Progress',
    description: 'Managing reactivity through focused training',
    suggestedCaption: {
      before: 'Before - Reactive to other dogs',
      after: 'After - Calm and focused',
    },
  },
  {
    id: 'place',
    skill: 'Place',
    title: '{dogName} Masters Place Command',
    description: 'Learning to settle on command',
    suggestedCaption: {
      before: 'Before - Unable to settle',
      after: 'After - Extended place with distractions',
    },
  },
  {
    id: 'overall',
    skill: 'Overall Transformation',
    title: '{dogName}\'s Training Journey',
    description: 'See the complete transformation!',
    suggestedCaption: {
      before: 'Day 1 of training',
      after: 'Graduation day!',
    },
  },
];

// Comparisons service
export const comparisonsService = {
  // Get all comparisons for a dog
  async getByDog(dogId: string) {
    const { data, error } = await supabase
      .from('comparisons')
      .select('*')
      .eq('dog_id', dogId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all comparisons for a facility
  async getByFacility(facilityId: string, options?: {
    featured?: boolean;
    public?: boolean;
  }) {
    let query = supabase
      .from('comparisons')
      .select(`
        *,
        dog:dogs(id, name, breed, photo_url),
        creator:profiles(first_name, last_name)
      `)
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (options?.featured) {
      query = query.eq('is_featured', true);
    }
    if (options?.public) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get a single comparison
  async getById(id: string) {
    const { data, error } = await supabase
      .from('comparisons')
      .select(`
        *,
        dog:dogs(id, name, breed, photo_url, family:families(id, name)),
        creator:profiles(first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new comparison
  async create(comparison: Omit<Comparison, 'id' | 'created_at' | 'views_count'>) {
    const { data, error } = await supabase
      .from('comparisons')
      .insert({
        ...comparison,
        views_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a comparison
  async update(id: string, updates: Partial<Comparison>) {
    const { data, error } = await supabase
      .from('comparisons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a comparison
  async delete(id: string) {
    const { error } = await supabase
      .from('comparisons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Increment view count
  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_comparison_views', {
      comparison_id: id,
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const { data } = await supabase
        .from('comparisons')
        .select('views_count')
        .eq('id', id)
        .single();

      if (data) {
        await supabase
          .from('comparisons')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id);
      }
    }
  },

  // Get public comparisons for marketing/showcase
  async getPublicShowcase(facilityId: string, limit = 6) {
    const { data, error } = await supabase
      .from('comparisons')
      .select(`
        *,
        dog:dogs(id, name, breed)
      `)
      .eq('facility_id', facilityId)
      .eq('is_public', true)
      .order('is_featured', { ascending: false })
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Generate shareable link
  generateShareLink(comparisonId: string, facilitySlug: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/showcase/${facilitySlug}/compare/${comparisonId}`;
  },
};

// Auto-generate comparison from program start/end media
export async function generateProgramComparison(
  dogId: string,
  programId: string,
  facilityId: string,
  createdBy: string
) {
  // In production, this would:
  // 1. Fetch first and last media from the program
  // 2. Get skill assessments from start and end
  // 3. Create an automatic comparison

  console.log('Generating program comparison:', {
    dogId,
    programId,
    facilityId,
    createdBy,
  });

  return null;
}
