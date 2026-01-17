'use server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Audit event categories
export type AuditCategory =
  | 'authentication'
  | 'user_management'
  | 'badge_moderation'
  | 'support'
  | 'billing'
  | 'content_moderation'
  | 'system'
  | 'settings';

// Audit severity levels
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// Audit event types
export type AuditEventType =
  // Authentication events
  | 'admin_login'
  | 'admin_logout'
  | 'admin_login_failed'
  | 'mfa_setup'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'password_changed'
  | 'session_expired'
  // User management events
  | 'user_search'
  | 'user_view'
  | 'user_update'
  | 'user_suspend'
  | 'user_unsuspend'
  | 'user_delete'
  | 'admin_created'
  | 'admin_updated'
  | 'admin_deactivated'
  // Badge moderation events
  | 'badge_approved'
  | 'badge_rejected'
  | 'badge_featured'
  | 'badge_unfeatured'
  | 'badge_changes_requested'
  // Support events
  | 'ticket_created'
  | 'ticket_assigned'
  | 'ticket_responded'
  | 'ticket_escalated'
  | 'ticket_resolved'
  | 'ticket_closed'
  // Billing events
  | 'subscription_modified'
  | 'refund_issued'
  | 'payment_retry'
  | 'discount_applied'
  | 'promo_created'
  // Content moderation events
  | 'content_flagged'
  | 'content_removed'
  | 'content_restored'
  | 'user_warned'
  | 'strike_issued'
  // System events
  | 'feature_flag_toggled'
  | 'maintenance_scheduled'
  | 'system_config_changed'
  | 'data_export_requested';

// Audit log entry interface
export interface AuditLogEntry {
  id: string;
  admin_id: string;
  category: AuditCategory;
  event_type: AuditEventType;
  severity: AuditSeverity;
  target_type?: string;
  target_id?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Input for creating audit log
interface CreateAuditLogInput {
  adminId: string;
  category: AuditCategory;
  eventType: AuditEventType;
  severity: AuditSeverity;
  targetType?: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Create an audit log entry
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLogEntry | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('audit_log')
      .insert({
        admin_id: input.adminId,
        category: input.category,
        event_type: input.eventType,
        severity: input.severity,
        target_type: input.targetType,
        target_id: input.targetId,
        description: input.description,
        metadata: input.metadata,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
}

// Convenience functions for common audit events

export async function logAuthEvent(
  adminId: string,
  eventType: 'admin_login' | 'admin_logout' | 'admin_login_failed' | 'mfa_setup' | 'mfa_verified' | 'mfa_failed' | 'password_changed' | 'session_expired',
  description: string,
  options?: {
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    admin_login: 'low',
    admin_logout: 'low',
    admin_login_failed: 'medium',
    mfa_setup: 'medium',
    mfa_verified: 'low',
    mfa_failed: 'high',
    password_changed: 'medium',
    session_expired: 'low',
  };

  await createAuditLog({
    adminId,
    category: 'authentication',
    eventType,
    severity: severityMap[eventType] || 'low',
    description,
    ...options,
  });
}

export async function logUserEvent(
  adminId: string,
  eventType: 'user_search' | 'user_view' | 'user_update' | 'user_suspend' | 'user_unsuspend' | 'user_delete' | 'admin_created' | 'admin_updated' | 'admin_deactivated',
  targetId: string,
  description: string,
  reason?: string,
  options?: {
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    user_search: 'low',
    user_view: 'low',
    user_update: 'medium',
    user_suspend: 'high',
    user_unsuspend: 'medium',
    user_delete: 'critical',
    admin_created: 'high',
    admin_updated: 'medium',
    admin_deactivated: 'high',
  };

  await createAuditLog({
    adminId,
    category: 'user_management',
    eventType,
    severity: severityMap[eventType] || 'medium',
    targetType: eventType.startsWith('admin') ? 'admin' : 'user',
    targetId,
    description,
    metadata: {
      ...options?.metadata,
      reason,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });
}

export async function logBadgeEvent(
  adminId: string,
  eventType: 'badge_approved' | 'badge_rejected' | 'badge_featured' | 'badge_unfeatured' | 'badge_changes_requested',
  badgeId: string,
  description: string,
  options?: {
    reason?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    badge_approved: 'low',
    badge_rejected: 'medium',
    badge_featured: 'low',
    badge_unfeatured: 'low',
    badge_changes_requested: 'low',
  };

  await createAuditLog({
    adminId,
    category: 'badge_moderation',
    eventType,
    severity: severityMap[eventType] || 'low',
    targetType: 'badge',
    targetId: badgeId,
    description,
    metadata: {
      ...options?.metadata,
      reason: options?.reason,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });
}

export async function logSupportEvent(
  adminId: string,
  eventType: 'ticket_created' | 'ticket_assigned' | 'ticket_responded' | 'ticket_escalated' | 'ticket_resolved' | 'ticket_closed',
  ticketId: string,
  description: string,
  options?: {
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    ticket_created: 'low',
    ticket_assigned: 'low',
    ticket_responded: 'low',
    ticket_escalated: 'medium',
    ticket_resolved: 'low',
    ticket_closed: 'low',
  };

  await createAuditLog({
    adminId,
    category: 'support',
    eventType,
    severity: severityMap[eventType] || 'low',
    targetType: 'ticket',
    targetId: ticketId,
    description,
    ...options,
  });
}

export async function logBillingEvent(
  adminId: string,
  eventType: 'subscription_modified' | 'refund_issued' | 'payment_retry' | 'discount_applied' | 'promo_created',
  targetId: string,
  description: string,
  options?: {
    amount?: number;
    reason?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    subscription_modified: 'medium',
    refund_issued: 'high',
    payment_retry: 'low',
    discount_applied: 'medium',
    promo_created: 'medium',
  };

  await createAuditLog({
    adminId,
    category: 'billing',
    eventType,
    severity: severityMap[eventType] || 'medium',
    targetType: 'subscription',
    targetId,
    description,
    metadata: {
      ...options?.metadata,
      amount: options?.amount,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });
}

export async function logModerationEvent(
  adminId: string,
  eventType: 'content_flagged' | 'content_removed' | 'content_restored' | 'user_warned' | 'strike_issued',
  targetType: 'post' | 'comment' | 'user' | 'profile',
  targetId: string,
  description: string,
  options?: {
    reason?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    content_flagged: 'low',
    content_removed: 'medium',
    content_restored: 'medium',
    user_warned: 'medium',
    strike_issued: 'high',
  };

  await createAuditLog({
    adminId,
    category: 'content_moderation',
    eventType,
    severity: severityMap[eventType] || 'medium',
    targetType,
    targetId,
    description,
    metadata: {
      ...options?.metadata,
      reason: options?.reason,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });
}

export async function logSystemEvent(
  adminId: string,
  eventType: 'feature_flag_toggled' | 'maintenance_scheduled' | 'system_config_changed' | 'data_export_requested',
  description: string,
  options?: {
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const severityMap: Record<string, AuditSeverity> = {
    feature_flag_toggled: 'medium',
    maintenance_scheduled: 'high',
    system_config_changed: 'high',
    data_export_requested: 'medium',
  };

  await createAuditLog({
    adminId,
    category: 'system',
    eventType,
    severity: severityMap[eventType] || 'medium',
    targetType: options?.targetType,
    targetId: options?.targetId,
    description,
    metadata: options?.metadata,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });
}

// Query audit logs with filtering
interface AuditLogQuery {
  adminId?: string;
  category?: AuditCategory;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface AuditLogResult {
  logs: AuditLogEntry[];
  total: number;
}

export async function queryAuditLogs(query: AuditLogQuery): Promise<AuditLogResult> {
  try {
    let queryBuilder = getSupabaseAdmin()
      .from('audit_log')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query.adminId) {
      queryBuilder = queryBuilder.eq('admin_id', query.adminId);
    }
    if (query.category) {
      queryBuilder = queryBuilder.eq('category', query.category);
    }
    if (query.eventType) {
      queryBuilder = queryBuilder.eq('event_type', query.eventType);
    }
    if (query.severity) {
      queryBuilder = queryBuilder.eq('severity', query.severity);
    }
    if (query.targetType) {
      queryBuilder = queryBuilder.eq('target_type', query.targetType);
    }
    if (query.targetId) {
      queryBuilder = queryBuilder.eq('target_id', query.targetId);
    }
    if (query.startDate) {
      queryBuilder = queryBuilder.gte('created_at', query.startDate);
    }
    if (query.endDate) {
      queryBuilder = queryBuilder.lte('created_at', query.endDate);
    }

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error querying audit logs:', error);
      return { logs: [], total: 0 };
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error querying audit logs:', error);
    return { logs: [], total: 0 };
  }
}

// Get audit log statistics
interface AuditStats {
  totalLogs: number;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  recentCritical: number;
}

export async function getAuditStats(days: number = 7): Promise<AuditStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Get total count
    const { count: totalLogs } = await getSupabaseAdmin()
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get counts by category
    const { data: categoryData } = await getSupabaseAdmin()
      .from('audit_log')
      .select('category')
      .gte('created_at', startDate.toISOString());

    const byCategory = (categoryData || []).reduce((acc, log) => {
      acc[log.category as AuditCategory] = (acc[log.category as AuditCategory] || 0) + 1;
      return acc;
    }, {} as Record<AuditCategory, number>);

    // Get counts by severity
    const { data: severityData } = await getSupabaseAdmin()
      .from('audit_log')
      .select('severity')
      .gte('created_at', startDate.toISOString());

    const bySeverity = (severityData || []).reduce((acc, log) => {
      acc[log.severity as AuditSeverity] = (acc[log.severity as AuditSeverity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);

    // Get recent critical events
    const { count: recentCritical } = await getSupabaseAdmin()
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .gte('created_at', startDate.toISOString());

    return {
      totalLogs: totalLogs || 0,
      byCategory,
      bySeverity,
      recentCritical: recentCritical || 0,
    };
  } catch (error) {
    console.error('Error getting audit stats:', error);
    return {
      totalLogs: 0,
      byCategory: {} as Record<AuditCategory, number>,
      bySeverity: {} as Record<AuditSeverity, number>,
      recentCritical: 0,
    };
  }
}

// Export audit logs as JSON
export async function exportAuditLogs(query: AuditLogQuery): Promise<string> {
  const { logs } = await queryAuditLogs({ ...query, limit: 10000 });
  return JSON.stringify(logs, null, 2);
}
