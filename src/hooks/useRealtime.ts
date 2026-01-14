'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Generic realtime subscription hook
interface UseRealtimeOptions<T extends TableName> {
  table: T;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  enabled?: boolean;
}

interface UseRealtimeReturn<T> {
  data: T | null;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | null;
  isConnected: boolean;
  error: Error | null;
}

export function useRealtime<T extends TableName>(
  options: UseRealtimeOptions<T>
): UseRealtimeReturn<Tables[T]['Row']> {
  const { table, filter, event = '*', schema = 'public', enabled = true } = options;

  const [data, setData] = useState<Tables[T]['Row'] | null>(null);
  const [eventType, setEventType] = useState<'INSERT' | 'UPDATE' | 'DELETE' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || isDemoMode()) {
      return;
    }

    const channelName = `${table}-${filter || 'all'}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        } as any,
        (payload: RealtimePostgresChangesPayload<Tables[T]['Row']>) => {
          setData(payload.new as Tables[T]['Row']);
          setEventType(payload.eventType);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          if (status === 'CHANNEL_ERROR') {
            setError(new Error('Realtime connection error'));
          }
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [table, filter, event, schema, enabled]);

  return {
    data,
    event: eventType,
    isConnected,
    error,
  };
}

// Hook for subscribing to activities in real-time
interface UseRealtimeActivitiesOptions {
  facilityId?: string;
  dogId?: string;
  enabled?: boolean;
}

interface Activity {
  id: string;
  dog_id: string;
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  logged_by: string;
}

export function useRealtimeActivities(options: UseRealtimeActivitiesOptions = {}) {
  const { facilityId, dogId, enabled = true } = options;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || isDemoMode()) {
      return;
    }

    let filter: string | undefined;
    if (dogId) {
      filter = `dog_id=eq.${dogId}`;
    }

    const channelName = `activities-${facilityId || 'all'}-${dogId || 'all'}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setActivities((prev) => {
            switch (eventType) {
              case 'INSERT':
                return [...prev, newRecord as Activity];
              case 'UPDATE':
                return prev.map((a) =>
                  a.id === (newRecord as Activity).id ? (newRecord as Activity) : a
                );
              case 'DELETE':
                return prev.filter((a) => a.id !== (oldRecord as Activity).id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [facilityId, dogId, enabled]);

  return {
    activities,
    isConnected,
  };
}

// Hook for real-time presence (who's online)
interface PresenceState {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  online_at: string;
}

export function useRealtimePresence(facilityId: string, enabled = true) {
  const [presences, setPresences] = useState<PresenceState[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const trackPresence = useCallback(
    (userData: Omit<PresenceState, 'online_at'>) => {
      if (channelRef.current && !isDemoMode()) {
        channelRef.current.track({
          ...userData,
          online_at: new Date().toISOString(),
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled || isDemoMode() || !facilityId) {
      return;
    }

    const channel = supabase.channel(`presence-${facilityId}`, {
      config: {
        presence: {
          key: facilityId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const allPresences: PresenceState[] = [];

        for (const key in state) {
          allPresences.push(...state[key]);
        }

        setPresences(allPresences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [facilityId, enabled]);

  return {
    presences,
    isConnected,
    trackPresence,
  };
}

// Hook for real-time training board updates
interface BoardDog {
  id: string;
  name: string;
  breed: string;
  photo_url: string | null;
  current_activity: string | null;
  activity_started_at: string | null;
  trainer_name: string | null;
}

export function useRealtimeTrainingBoard(facilityId: string, enabled = true) {
  const [dogs, setDogs] = useState<BoardDog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled || isDemoMode() || !facilityId) {
      // In demo mode, return mock data
      if (isDemoMode()) {
        setDogs([
          {
            id: '1',
            name: 'Max',
            breed: 'German Shepherd',
            photo_url: null,
            current_activity: 'kennel',
            activity_started_at: new Date(Date.now() - 45 * 60000).toISOString(),
            trainer_name: 'John',
          },
          {
            id: '2',
            name: 'Bella',
            breed: 'Golden Retriever',
            photo_url: null,
            current_activity: 'training',
            activity_started_at: new Date(Date.now() - 20 * 60000).toISOString(),
            trainer_name: 'Sarah',
          },
        ]);
        setIsConnected(true);
      }
      return;
    }

    // Subscribe to both dogs and activities tables
    const dogsChannel = supabase
      .channel(`training-board-dogs-${facilityId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'dogs',
        },
        () => {
          // Refetch board data when dogs change
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    const activitiesChannel = supabase
      .channel(`training-board-activities-${facilityId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        () => {
          // Refetch board data when activities change
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      dogsChannel.unsubscribe();
      activitiesChannel.unsubscribe();
    };
  }, [facilityId, enabled]);

  return {
    dogs,
    isConnected,
    lastUpdate,
  };
}

// Hook for real-time notifications
interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  dog_id?: string;
  dog_name?: string;
  created_at: string;
  read: boolean;
}

export function useRealtimeNotifications(userId: string, enabled = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled || isDemoMode() || !userId) {
      return;
    }

    // In a real app, subscribe to a notifications table
    // For now, we'll just set up the infrastructure

    return () => {
      // Cleanup
    };
  }, [userId, enabled]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
}

// Custom hook for broadcast messages (facility-wide announcements)
export function useRealtimeBroadcast(facilityId: string, enabled = true) {
  const [messages, setMessages] = useState<{ id: string; message: string; sender: string; timestamp: string }[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const broadcast = useCallback((message: string, sender: string) => {
    if (channelRef.current && !isDemoMode()) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'announcement',
        payload: {
          id: crypto.randomUUID(),
          message,
          sender,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled || isDemoMode() || !facilityId) {
      return;
    }

    const channel = supabase
      .channel(`broadcast-${facilityId}`)
      .on('broadcast', { event: 'announcement' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [facilityId, enabled]);

  return {
    messages,
    broadcast,
  };
}
