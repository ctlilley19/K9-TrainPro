import { supabase, isDemoMode } from './client';
import type {
  Conversation,
  Message,
  MessageTemplate,
  MessageType,
  MessageSenderType,
  ConversationWithDetails,
  MessageWithSender,
} from '@/types/database';

// ============================================================================
// Mock Data for Demo Mode
// ============================================================================

const mockConversations: ConversationWithDetails[] = [
  {
    id: 'conv-1',
    facility_id: 'facility-1',
    family_id: 'family-1',
    dog_id: 'dog-1',
    title: 'Max Training Updates',
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    last_message_preview: 'Great session today! Max is making excellent progress.',
    is_archived: false,
    is_pinned: true,
    trainer_unread_count: 0,
    parent_unread_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    family: {
      id: 'family-1',
      facility_id: 'facility-1',
      primary_contact_id: 'user-parent-1',
      name: 'Anderson Family',
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'CA',
      zip: '90210',
      phone: '(555) 123-4567',
      email: 'anderson@email.com',
      emergency_contact_name: 'Jane Anderson',
      emergency_contact_phone: '(555) 123-4568',
      vet_name: 'Happy Paws Vet',
      vet_phone: '(555) 987-6543',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    dog: {
      id: 'dog-1',
      family_id: 'family-1',
      name: 'Max',
      breed: 'Golden Retriever',
      date_of_birth: '2022-03-15',
      weight: 65,
      gender: 'male',
      color: 'Golden',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    messages: [],
  },
  {
    id: 'conv-2',
    facility_id: 'facility-1',
    family_id: 'family-2',
    dog_id: 'dog-2',
    title: 'Luna Board & Train',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_message_preview: 'Here are some photos from today!',
    is_archived: false,
    is_pinned: false,
    trainer_unread_count: 2,
    parent_unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    family: {
      id: 'family-2',
      facility_id: 'facility-1',
      primary_contact_id: 'user-parent-2',
      name: 'Johnson Family',
      address: '456 Maple Ave',
      city: 'Springfield',
      state: 'CA',
      zip: '90210',
      phone: '(555) 234-5678',
      email: 'johnson@email.com',
      emergency_contact_name: null,
      emergency_contact_phone: null,
      vet_name: null,
      vet_phone: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    dog: {
      id: 'dog-2',
      family_id: 'family-2',
      name: 'Luna',
      breed: 'German Shepherd',
      date_of_birth: '2023-01-10',
      weight: 55,
      gender: 'female',
      color: 'Black & Tan',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    messages: [],
  },
  {
    id: 'conv-3',
    facility_id: 'facility-1',
    family_id: 'family-3',
    dog_id: 'dog-3',
    title: 'Bella Progress',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_message_preview: 'Thank you so much for the update!',
    is_archived: false,
    is_pinned: false,
    trainer_unread_count: 0,
    parent_unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    family: {
      id: 'family-3',
      facility_id: 'facility-1',
      primary_contact_id: 'user-parent-3',
      name: 'Williams Family',
      address: '789 Pine Road',
      city: 'Springfield',
      state: 'CA',
      zip: '90210',
      phone: '(555) 345-6789',
      email: 'williams@email.com',
      emergency_contact_name: null,
      emergency_contact_phone: null,
      vet_name: null,
      vet_phone: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    dog: {
      id: 'dog-3',
      family_id: 'family-3',
      name: 'Bella',
      breed: 'Labrador Retriever',
      date_of_birth: '2021-06-20',
      weight: 70,
      gender: 'female',
      color: 'Chocolate',
      photo_url: null,
      microchip_id: null,
      medical_notes: null,
      behavior_notes: null,
      feeding_instructions: null,
      medications: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    messages: [],
  },
];

const mockMessages: MessageWithSender[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'trainer-1',
    sender_type: 'trainer',
    message_type: 'text',
    content: 'Hi! Just wanted to let you know Max had an amazing first day. He settled in quickly and was eager to learn.',
    media_url: null,
    media_thumbnail_url: null,
    media_filename: null,
    media_size_bytes: null,
    read_by_trainer: true,
    read_by_parent: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    is_edited: false,
    edited_at: null,
    is_deleted: false,
    deleted_at: null,
    reply_to_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    sender: {
      id: 'trainer-1',
      auth_id: 'auth-trainer-1',
      facility_id: 'facility-1',
      email: 'trainer@k9trainpro.com',
      name: 'Sarah Mitchell',
      role: 'trainer',
      avatar_url: null,
      phone: '(555) 111-2222',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    reply_to: null,
    reactions: [],
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'user-parent-1',
    sender_type: 'parent',
    message_type: 'text',
    content: 'That\'s wonderful to hear! We were a bit worried about how he would adjust. Thank you for the update!',
    media_url: null,
    media_thumbnail_url: null,
    media_filename: null,
    media_size_bytes: null,
    read_by_trainer: true,
    read_by_parent: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    is_edited: false,
    edited_at: null,
    is_deleted: false,
    deleted_at: null,
    reply_to_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    sender: {
      id: 'user-parent-1',
      auth_id: 'auth-parent-1',
      facility_id: 'facility-1',
      email: 'anderson@email.com',
      name: 'John Anderson',
      role: 'pet_parent',
      avatar_url: null,
      phone: '(555) 123-4567',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    reply_to: null,
    reactions: [{ id: 'reaction-1', message_id: 'msg-2', user_id: 'trainer-1', reaction: '❤️', created_at: new Date().toISOString() }],
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    sender_id: 'trainer-1',
    sender_type: 'trainer',
    message_type: 'text',
    content: 'Great session today! Max is making excellent progress with his sit-stay command. We extended the duration to 30 seconds!',
    media_url: null,
    media_thumbnail_url: null,
    media_filename: null,
    media_size_bytes: null,
    read_by_trainer: true,
    read_by_parent: false,
    read_at: null,
    is_edited: false,
    edited_at: null,
    is_deleted: false,
    deleted_at: null,
    reply_to_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sender: {
      id: 'trainer-1',
      auth_id: 'auth-trainer-1',
      facility_id: 'facility-1',
      email: 'trainer@k9trainpro.com',
      name: 'Sarah Mitchell',
      role: 'trainer',
      avatar_url: null,
      phone: '(555) 111-2222',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    reply_to: null,
    reactions: [],
  },
];

const mockMessageTemplates: MessageTemplate[] = [
  {
    id: 'template-1',
    facility_id: 'facility-1',
    title: 'Welcome Message',
    content: 'Welcome to our training family! We\'re excited to work with you and your pup. Feel free to reach out anytime with questions.',
    category: 'greeting',
    usage_count: 15,
    is_active: true,
    created_by: 'trainer-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-2',
    facility_id: 'facility-1',
    title: 'Great Progress Update',
    content: 'Your dog did amazing today! We worked on new skills and made great progress. Keep up the practice at home!',
    category: 'update',
    usage_count: 25,
    is_active: true,
    created_by: 'trainer-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-3',
    facility_id: 'facility-1',
    title: 'Session Reminder',
    content: 'Just a friendly reminder about your upcoming session tomorrow. Looking forward to seeing you!',
    category: 'reminder',
    usage_count: 10,
    is_active: true,
    created_by: 'trainer-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-4',
    facility_id: 'facility-1',
    title: 'Badge Celebration',
    content: 'Congratulations! Your pup just earned a new badge! This is a big milestone. 🎉',
    category: 'celebration',
    usage_count: 8,
    is_active: true,
    created_by: 'trainer-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Demo mode data storage
let demoMessages = [...mockMessages];
let demoConversations = [...mockConversations];

// ============================================================================
// Conversations Service
// ============================================================================

export const conversationsService = {
  // Get all conversations for facility (trainer view)
  async getAll(options?: {
    isArchived?: boolean;
    isPinned?: boolean;
    search?: string;
  }): Promise<ConversationWithDetails[]> {
    if (isDemoMode) {
      let filtered = [...demoConversations];
      if (options?.isArchived !== undefined) {
        filtered = filtered.filter((c) => c.is_archived === options.isArchived);
      }
      if (options?.isPinned !== undefined) {
        filtered = filtered.filter((c) => c.is_pinned === options.isPinned);
      }
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.family.name.toLowerCase().includes(searchLower) ||
            c.dog?.name.toLowerCase().includes(searchLower) ||
            c.last_message_preview?.toLowerCase().includes(searchLower)
        );
      }
      return filtered.sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    }

    let query = supabase
      .from('conversations')
      .select(`
        *,
        family:families(*),
        dog:dogs(*)
      `)
      .order('last_message_at', { ascending: false });

    if (options?.isArchived !== undefined) {
      query = query.eq('is_archived', options.isArchived);
    }
    if (options?.isPinned !== undefined) {
      query = query.eq('is_pinned', options.isPinned);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ConversationWithDetails[];
  },

  // Get conversations for pet parent (family view)
  async getForFamily(familyId: string): Promise<ConversationWithDetails[]> {
    if (isDemoMode) {
      return demoConversations
        .filter((c) => c.family_id === familyId && !c.is_archived)
        .sort(
          (a, b) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        family:families(*),
        dog:dogs(*)
      `)
      .eq('family_id', familyId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data as ConversationWithDetails[];
  },

  // Get single conversation with messages
  async getById(id: string): Promise<ConversationWithDetails | null> {
    if (isDemoMode) {
      const conv = demoConversations.find((c) => c.id === id);
      if (!conv) return null;
      const messages = demoMessages.filter((m) => m.conversation_id === id);
      return { ...conv, messages };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        family:families(*),
        dog:dogs(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ConversationWithDetails;
  },

  // Create new conversation
  async create(data: {
    facility_id: string;
    family_id: string;
    dog_id?: string;
    title?: string;
  }): Promise<Conversation> {
    if (isDemoMode) {
      const newConv: ConversationWithDetails = {
        id: `conv-${Date.now()}`,
        facility_id: data.facility_id,
        family_id: data.family_id,
        dog_id: data.dog_id || null,
        title: data.title || null,
        last_message_at: new Date().toISOString(),
        last_message_preview: null,
        is_archived: false,
        is_pinned: false,
        trainer_unread_count: 0,
        parent_unread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        family: demoConversations[0]?.family || {} as any,
        dog: null,
        messages: [],
      };
      demoConversations.unshift(newConv);
      return newConv;
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return conv;
  },

  // Update conversation (archive, pin, etc.)
  async update(
    id: string,
    data: Partial<Pick<Conversation, 'is_archived' | 'is_pinned' | 'title'>>
  ): Promise<Conversation> {
    if (isDemoMode) {
      const index = demoConversations.findIndex((c) => c.id === id);
      if (index !== -1) {
        demoConversations[index] = {
          ...demoConversations[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return demoConversations[index];
      }
      throw new Error('Conversation not found');
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return conv;
  },

  // Get unread counts for trainer dashboard
  async getUnreadCount(): Promise<number> {
    if (isDemoMode) {
      return demoConversations.reduce((sum, c) => sum + c.trainer_unread_count, 0);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('trainer_unread_count')
      .eq('is_archived', false);

    if (error) throw error;
    return data.reduce((sum, c) => sum + c.trainer_unread_count, 0);
  },

  // Get unread counts for pet parent
  async getUnreadCountForFamily(familyId: string): Promise<number> {
    if (isDemoMode) {
      return demoConversations
        .filter((c) => c.family_id === familyId)
        .reduce((sum, c) => sum + c.parent_unread_count, 0);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('parent_unread_count')
      .eq('family_id', familyId)
      .eq('is_archived', false);

    if (error) throw error;
    return data.reduce((sum, c) => sum + c.parent_unread_count, 0);
  },
};

// ============================================================================
// Messages Service
// ============================================================================

export const messagesService = {
  // Get messages for a conversation
  async getForConversation(
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<MessageWithSender[]> {
    if (isDemoMode) {
      let messages = demoMessages
        .filter((m) => m.conversation_id === conversationId && !m.is_deleted)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (options?.offset) {
        messages = messages.slice(options.offset);
      }
      if (options?.limit) {
        messages = messages.slice(0, options.limit);
      }
      return messages;
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users(*),
        reply_to:messages(*),
        reactions:message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as MessageWithSender[];
  },

  // Send a message
  async send(data: {
    conversation_id: string;
    sender_id: string;
    sender_type: MessageSenderType;
    content: string;
    message_type?: MessageType;
    media_url?: string;
    reply_to_id?: string;
  }): Promise<Message> {
    if (isDemoMode) {
      const newMessage: MessageWithSender = {
        id: `msg-${Date.now()}`,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        message_type: data.message_type || 'text',
        content: data.content,
        media_url: data.media_url || null,
        media_thumbnail_url: null,
        media_filename: null,
        media_size_bytes: null,
        read_by_trainer: data.sender_type === 'trainer',
        read_by_parent: data.sender_type === 'parent',
        read_at: null,
        is_edited: false,
        edited_at: null,
        is_deleted: false,
        deleted_at: null,
        reply_to_id: data.reply_to_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: data.sender_id,
          auth_id: 'auth-' + data.sender_id,
          facility_id: 'facility-1',
          email: data.sender_type === 'trainer' ? 'trainer@k9trainpro.com' : 'parent@email.com',
          name: data.sender_type === 'trainer' ? 'Sarah Mitchell' : 'John Anderson',
          role: data.sender_type === 'trainer' ? 'trainer' : 'pet_parent',
          avatar_url: null,
          phone: null,
          is_active: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        reply_to: null,
        reactions: [],
      };
      demoMessages.push(newMessage);

      // Update conversation
      const convIndex = demoConversations.findIndex((c) => c.id === data.conversation_id);
      if (convIndex !== -1) {
        demoConversations[convIndex] = {
          ...demoConversations[convIndex],
          last_message_at: newMessage.created_at,
          last_message_preview: newMessage.content.substring(0, 100),
          trainer_unread_count:
            data.sender_type === 'parent'
              ? demoConversations[convIndex].trainer_unread_count + 1
              : demoConversations[convIndex].trainer_unread_count,
          parent_unread_count:
            data.sender_type === 'trainer'
              ? demoConversations[convIndex].parent_unread_count + 1
              : demoConversations[convIndex].parent_unread_count,
        };
      }

      return newMessage;
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        content: data.content,
        message_type: data.message_type || 'text',
        media_url: data.media_url,
        reply_to_id: data.reply_to_id,
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  },

  // Mark messages as read
  async markAsRead(
    conversationId: string,
    readerType: 'trainer' | 'parent'
  ): Promise<void> {
    if (isDemoMode) {
      demoMessages = demoMessages.map((m) => {
        if (m.conversation_id === conversationId) {
          return {
            ...m,
            read_by_trainer: readerType === 'trainer' ? true : m.read_by_trainer,
            read_by_parent: readerType === 'parent' ? true : m.read_by_parent,
            read_at: new Date().toISOString(),
          };
        }
        return m;
      });

      // Reset unread count on conversation
      const convIndex = demoConversations.findIndex((c) => c.id === conversationId);
      if (convIndex !== -1) {
        demoConversations[convIndex] = {
          ...demoConversations[convIndex],
          trainer_unread_count: readerType === 'trainer' ? 0 : demoConversations[convIndex].trainer_unread_count,
          parent_unread_count: readerType === 'parent' ? 0 : demoConversations[convIndex].parent_unread_count,
        };
      }
      return;
    }

    const updateField = readerType === 'trainer' ? 'read_by_trainer' : 'read_by_parent';

    const { error } = await supabase
      .from('messages')
      .update({ [updateField]: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq(updateField, false);

    if (error) throw error;
  },

  // Edit a message
  async edit(id: string, content: string): Promise<Message> {
    if (isDemoMode) {
      const index = demoMessages.findIndex((m) => m.id === id);
      if (index !== -1) {
        demoMessages[index] = {
          ...demoMessages[index],
          content,
          is_edited: true,
          edited_at: new Date().toISOString(),
        };
        return demoMessages[index];
      }
      throw new Error('Message not found');
    }

    const { data, error } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a message (soft delete)
  async delete(id: string): Promise<void> {
    if (isDemoMode) {
      const index = demoMessages.findIndex((m) => m.id === id);
      if (index !== -1) {
        demoMessages[index] = {
          ...demoMessages[index],
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        };
      }
      return;
    }

    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Add reaction to message
  async addReaction(messageId: string, userId: string, reaction: string): Promise<void> {
    if (isDemoMode) {
      const msgIndex = demoMessages.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        const existingReaction = demoMessages[msgIndex].reactions.find(
          (r) => r.user_id === userId && r.reaction === reaction
        );
        if (!existingReaction) {
          demoMessages[msgIndex].reactions.push({
            id: `reaction-${Date.now()}`,
            message_id: messageId,
            user_id: userId,
            reaction,
            created_at: new Date().toISOString(),
          });
        }
      }
      return;
    }

    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: userId,
      reaction,
    });

    if (error && error.code !== '23505') throw error; // Ignore duplicate
  },

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string, reaction: string): Promise<void> {
    if (isDemoMode) {
      const msgIndex = demoMessages.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        demoMessages[msgIndex].reactions = demoMessages[msgIndex].reactions.filter(
          (r) => !(r.user_id === userId && r.reaction === reaction)
        );
      }
      return;
    }

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction', reaction);

    if (error) throw error;
  },
};

// ============================================================================
// Message Templates Service
// ============================================================================

export const messageTemplatesService = {
  async getAll(options?: { category?: string; isActive?: boolean }): Promise<MessageTemplate[]> {
    if (isDemoMode) {
      let templates = [...mockMessageTemplates];
      if (options?.category) {
        templates = templates.filter((t) => t.category === options.category);
      }
      if (options?.isActive !== undefined) {
        templates = templates.filter((t) => t.is_active === options.isActive);
      }
      return templates.sort((a, b) => b.usage_count - a.usage_count);
    }

    let query = supabase.from('message_templates').select('*');

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(data: {
    facility_id: string;
    title: string;
    content: string;
    category?: string;
    created_by?: string;
  }): Promise<MessageTemplate> {
    if (isDemoMode) {
      const newTemplate: MessageTemplate = {
        id: `template-${Date.now()}`,
        facility_id: data.facility_id,
        title: data.title,
        content: data.content,
        category: data.category || null,
        usage_count: 0,
        is_active: true,
        created_by: data.created_by || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockMessageTemplates.push(newTemplate);
      return newTemplate;
    }

    const { data: template, error } = await supabase
      .from('message_templates')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  async update(
    id: string,
    data: Partial<Pick<MessageTemplate, 'title' | 'content' | 'category' | 'is_active'>>
  ): Promise<MessageTemplate> {
    if (isDemoMode) {
      const index = mockMessageTemplates.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockMessageTemplates[index] = {
          ...mockMessageTemplates[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return mockMessageTemplates[index];
      }
      throw new Error('Template not found');
    }

    const { data: template, error } = await supabase
      .from('message_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) {
      const index = mockMessageTemplates.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockMessageTemplates.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase.from('message_templates').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementUsage(id: string): Promise<void> {
    if (isDemoMode) {
      const index = mockMessageTemplates.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockMessageTemplates[index].usage_count++;
      }
      return;
    }

    const { error } = await supabase.rpc('increment_template_usage', { template_id: id });
    if (error) throw error;
  },
};

// ============================================================================
// Combined Messaging Service
// ============================================================================

export const messagingService = {
  conversations: conversationsService,
  messages: messagesService,
  templates: messageTemplatesService,
};
