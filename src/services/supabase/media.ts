import { supabase } from '@/lib/supabase';
import type { Media, MediaType } from '@/types/database';

export interface UploadMediaData {
  dog_id: string;
  program_id?: string;
  activity_id?: string;
  type: MediaType;
  caption?: string;
  uploaded_by: string;
  is_highlight?: boolean;
}

export interface MediaFilters {
  dogId?: string;
  programId?: string;
  activityId?: string;
  type?: MediaType;
  isHighlight?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface MediaUploadOptions {
  bucket?: 'media' | 'logos' | 'avatars' | 'documents';
  path?: string;
  folder?: string;
  cacheControl?: string;
}

export const mediaService = {
  /**
   * Simple file upload that returns URL (for avatars, logos, etc.)
   */
  async uploadFile(file: File, options?: MediaUploadOptions): Promise<string> {
    const bucket = options?.bucket || 'media';
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const folder = options?.folder || 'uploads';
    const path = options?.path || `${folder}/${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  },

  /**
   * Get media with filters
   */
  async getAll(filters?: MediaFilters): Promise<Media[]> {
    let query = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.dogId) {
      query = query.eq('dog_id', filters.dogId);
    }

    if (filters?.programId) {
      query = query.eq('program_id', filters.programId);
    }

    if (filters?.activityId) {
      query = query.eq('activity_id', filters.activityId);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.isHighlight !== undefined) {
      query = query.eq('is_highlight', filters.isHighlight);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Get highlight photos for a dog (for daily reports)
   */
  async getHighlights(dogId: string, date?: string): Promise<Media[]> {
    let query = supabase
      .from('media')
      .select('*')
      .eq('dog_id', dogId)
      .eq('is_highlight', true)
      .order('created_at', { ascending: false });

    if (date) {
      query = query
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Get a single media item by ID
   */
  async getById(id: string): Promise<Media | null> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Upload a file and create media record
   */
  async upload(file: File, data: UploadMediaData): Promise<Media> {
    // Generate file path
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const fileName = `${data.dog_id}/${timestamp}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    // Create media record
    const { data: media, error: dbError } = await supabase
      .from('media')
      .insert({
        ...data,
        url: urlData.publicUrl,
        file_size: file.size,
        metadata: {
          original_name: file.name,
          content_type: file.type,
        },
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return media;
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], data: Omit<UploadMediaData, 'type'>): Promise<Media[]> {
    const uploadPromises = files.map((file) => {
      const type: MediaType = file.type.startsWith('video/') ? 'video' : 'photo';
      return this.upload(file, { ...data, type });
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Toggle highlight status
   */
  async toggleHighlight(id: string): Promise<Media> {
    // Get current status
    const { data: current } = await supabase
      .from('media')
      .select('is_highlight')
      .eq('id', id)
      .single();

    // Toggle
    const { data: media, error } = await supabase
      .from('media')
      .update({ is_highlight: !current?.is_highlight })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return media;
  },

  /**
   * Update caption
   */
  async updateCaption(id: string, caption: string): Promise<Media> {
    const { data: media, error } = await supabase
      .from('media')
      .update({ caption })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return media;
  },

  /**
   * Delete media
   */
  async delete(id: string): Promise<void> {
    // Get the media record to find the file path
    const { data: media } = await supabase
      .from('media')
      .select('url')
      .eq('id', id)
      .single();

    if (media?.url) {
      // Extract path from URL
      const urlParts = media.url.split('/media/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // Delete from storage
        await supabase.storage.from('media').remove([filePath]);
      }
    }

    // Delete record
    const { error } = await supabase.from('media').delete().eq('id', id);

    if (error) throw error;
  },
};
