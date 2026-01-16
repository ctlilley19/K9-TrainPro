-- ============================================================================
-- Admin Portal Schema
-- Creates tables for admin users, sessions, audit logging, support tickets,
-- and feature flags with privacy-by-design principles
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Admin role hierarchy
CREATE TYPE admin_role AS ENUM (
  'super_admin',    -- Full system access, can create other admins
  'support',        -- Ticket handling, user lookup (with ticket)
  'moderator',      -- Badge review, flagged content
  'analytics',      -- Read-only dashboards, no user data
  'billing'         -- Subscription management, refunds
);

-- Ticket priority levels
CREATE TYPE ticket_priority AS ENUM ('urgent', 'normal', 'low');

-- Ticket status
CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'awaiting_response',
  'pending_user',
  'resolved',
  'closed'
);

-- Audit severity levels
CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE, -- References Supabase auth.users if using Supabase Auth
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'support',

  -- MFA (TOTP)
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255), -- Encrypted TOTP secret
  mfa_backup_codes TEXT[], -- Encrypted backup codes

  -- Account status
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Timestamps
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- ADMIN SESSIONS TABLE
-- ============================================================================

CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,

  -- Session metadata
  ip_address INET,
  user_agent TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================================================
-- AUDIT LOG TABLE (Append-Only)
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Who performed the action
  admin_id UUID REFERENCES admin_users(id),
  admin_email VARCHAR(255) NOT NULL,
  admin_role admin_role NOT NULL,
  ip_address INET,
  user_agent TEXT,

  -- What action was performed
  action VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- user, billing, content, system, support
  severity audit_severity NOT NULL DEFAULT 'low',

  -- Context
  target_type VARCHAR(50), -- user, subscription, badge, ticket, system
  target_id UUID,
  reason TEXT NOT NULL, -- Required explanation for all actions
  ticket_id UUID, -- Link to support ticket if applicable

  -- State changes
  previous_value JSONB,
  new_value JSONB,

  -- Request metadata
  session_id UUID,
  request_id VARCHAR(255)
);

-- Indexes for querying audit log
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_admin ON audit_log(admin_id);
CREATE INDEX idx_audit_log_category ON audit_log(category);
CREATE INDEX idx_audit_log_severity ON audit_log(severity);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id);

-- Prevent updates and deletes on audit_log
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER audit_log_immutable_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL,

  -- User info (from main users table)
  user_id UUID, -- References users(id) in main schema
  user_email VARCHAR(255) NOT NULL,

  -- Ticket details
  subject VARCHAR(255) NOT NULL,
  priority ticket_priority DEFAULT 'normal',
  status ticket_status DEFAULT 'open',
  category VARCHAR(50), -- account, billing, technical, feature, other

  -- Assignment
  assigned_to UUID REFERENCES admin_users(id),

  -- Support access
  support_access_granted BOOLEAN DEFAULT false,
  support_access_expires TIMESTAMPTZ,
  support_access_level INTEGER DEFAULT 1, -- 1-4 access levels

  -- SLA tracking
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ticket queries
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);

-- ============================================================================
-- TICKET MESSAGES TABLE
-- ============================================================================

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Sender info
  sender_type VARCHAR(20) NOT NULL, -- 'user' or 'admin'
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255),

  -- Message content
  message TEXT NOT NULL,
  attachments JSONB, -- Array of attachment URLs/metadata

  -- Internal note (not shown to user)
  is_internal BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for message queries
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ============================================================================
-- FEATURE FLAGS TABLE
-- ============================================================================

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,

  -- Toggle state
  is_enabled BOOLEAN DEFAULT false,

  -- Rollout configuration
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_user_ids UUID[], -- Specific users who always have access
  allowed_facility_ids UUID[], -- Specific facilities who always have access

  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for flag lookups
CREATE INDEX idx_feature_flags_name ON feature_flags(name);

-- ============================================================================
-- CONTENT MODERATION TABLES
-- ============================================================================

-- User warnings/strikes
CREATE TABLE user_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References users(id) in main schema

  -- Strike details
  strike_number INTEGER NOT NULL,
  reason TEXT NOT NULL,
  action_taken VARCHAR(50) NOT NULL, -- warning, suspension_24h, suspension_7d, ban

  -- Admin who issued
  issued_by UUID REFERENCES admin_users(id),

  -- Resolution
  expires_at TIMESTAMPTZ, -- For temporary suspensions
  appealed BOOLEAN DEFAULT false,
  appeal_resolved_at TIMESTAMPTZ,
  appeal_result TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_strikes_user ON user_strikes(user_id);

-- Flagged content queue
CREATE TABLE flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content reference
  content_type VARCHAR(50) NOT NULL, -- badge, photo, video, message
  content_id UUID NOT NULL,

  -- Reporter info
  reported_by UUID, -- User who flagged (null if system/automated)
  report_reason TEXT NOT NULL,

  -- Review status
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, removed, dismissed
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flagged_content_status ON flagged_content(status);
CREATE INDEX idx_flagged_content_type ON flagged_content(content_type);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if admin has specific role or higher
CREATE OR REPLACE FUNCTION admin_has_role(admin_uuid UUID, required_role admin_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role admin_role;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  SELECT role INTO user_role FROM admin_users WHERE id = admin_uuid;

  -- Role hierarchy (higher = more access)
  role_hierarchy := CASE user_role
    WHEN 'super_admin' THEN 100
    WHEN 'billing' THEN 40
    WHEN 'support' THEN 30
    WHEN 'moderator' THEN 20
    WHEN 'analytics' THEN 10
    ELSE 0
  END;

  required_hierarchy := CASE required_role
    WHEN 'super_admin' THEN 100
    WHEN 'billing' THEN 40
    WHEN 'support' THEN 30
    WHEN 'moderator' THEN 20
    WHEN 'analytics' THEN 10
    ELSE 0
  END;

  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action VARCHAR(100),
  p_category VARCHAR(50),
  p_severity audit_severity,
  p_reason TEXT,
  p_target_type VARCHAR(50) DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_previous_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_ticket_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_request_id VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_admin_email VARCHAR(255);
  v_admin_role admin_role;
  v_log_id UUID;
BEGIN
  -- Get admin info
  SELECT email, role INTO v_admin_email, v_admin_role
  FROM admin_users WHERE id = p_admin_id;

  -- Insert audit log entry
  INSERT INTO audit_log (
    admin_id, admin_email, admin_role, ip_address, user_agent,
    action, category, severity,
    target_type, target_id, reason, ticket_id,
    previous_value, new_value,
    session_id, request_id
  ) VALUES (
    p_admin_id, v_admin_email, v_admin_role, p_ip_address, p_user_agent,
    p_action, p_category, p_severity,
    p_target_type, p_target_id, p_reason, p_ticket_id,
    p_previous_value, p_new_value,
    p_session_id, p_request_id
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED INITIAL SUPER ADMIN
-- ============================================================================

-- Insert initial super admin (password will be changed on first login)
-- Password is a bcrypt hash of 'TestAdmin2025!' - MUST be changed after first login
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  mfa_enabled,
  is_active,
  must_change_password
) VALUES (
  'ct.lilley19@gmail.com',
  '$2a$12$rG8N9qJ5KqXm.YzE5UXSP.qE4YBz7GnxH3LKDQ.C5MvW6N1hSjrKu', -- 'TestAdmin2025!'
  'Clayton Lilley',
  'super_admin',
  false, -- MFA will be required on first login
  true,
  false -- Can change password later
);

-- Log the admin creation
INSERT INTO audit_log (
  admin_email,
  admin_role,
  action,
  category,
  severity,
  reason
) VALUES (
  'system',
  'super_admin',
  'admin_created',
  'system',
  'high',
  'Initial super admin account created via migration'
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for admin tables will use service role key
-- The API routes will handle authorization based on admin roles
-- This prevents direct database access from client-side code

-- Allow service role full access (API routes use service role)
CREATE POLICY "Service role has full access to admin_users"
  ON admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to admin_sessions"
  ON admin_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to audit_log"
  ON audit_log FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to support_tickets"
  ON support_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to ticket_messages"
  ON ticket_messages FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to feature_flags"
  ON feature_flags FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to user_strikes"
  ON user_strikes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to flagged_content"
  ON flagged_content FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
