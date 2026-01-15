-- PIN Authentication System Migration
-- Implements PIN-based quick authentication with session timeouts

-- Add PIN fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_salt TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_set_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;

-- Session tracking for tiered authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_full_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_pin_verify TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_device_id TEXT;

-- User Sessions table for multi-device support
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Device identification
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,

  -- Session state
  auth_level TEXT NOT NULL DEFAULT 'full', -- 'full', 'pin', 'expired'
  last_full_login TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_pin_verify TIMESTAMPTZ,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Security
  ip_address INET,
  is_trusted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id, device_id)
);

-- PIN verification attempts log (for security monitoring)
CREATE TABLE IF NOT EXISTS pin_attempts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT,
  ip_address INET,
  success BOOLEAN NOT NULL,
  attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON user_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pin_attempts_user ON pin_attempts_log(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_attempts_recent ON pin_attempts_log(user_id, attempt_at DESC);

-- RLS Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_attempts_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Users can manage their own sessions
CREATE POLICY "Users can manage own sessions"
  ON user_sessions FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- PIN attempts are write-only for security (users can't view their attempts)
CREATE POLICY "System can log PIN attempts"
  ON pin_attempts_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can view PIN attempt logs
CREATE POLICY "Admins can view PIN attempts"
  ON pin_attempts_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Function to hash PIN with salt
CREATE OR REPLACE FUNCTION hash_pin(pin TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(pin || salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify PIN
CREATE OR REPLACE FUNCTION verify_pin(user_uuid UUID, pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
  stored_salt TEXT;
  computed_hash TEXT;
  attempts INTEGER;
  locked_until TIMESTAMPTZ;
BEGIN
  -- Get user's PIN data
  SELECT pin_hash, pin_salt, pin_attempts, pin_locked_until
  INTO stored_hash, stored_salt, attempts, locked_until
  FROM users
  WHERE id = user_uuid;

  -- Check if account is locked
  IF locked_until IS NOT NULL AND locked_until > NOW() THEN
    RETURN FALSE;
  END IF;

  -- No PIN set
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Compute hash and compare
  computed_hash := hash_pin(pin, stored_salt);

  IF computed_hash = stored_hash THEN
    -- Success: reset attempts
    UPDATE users
    SET pin_attempts = 0,
        pin_locked_until = NULL,
        last_pin_verify = NOW()
    WHERE id = user_uuid;

    RETURN TRUE;
  ELSE
    -- Failure: increment attempts
    UPDATE users
    SET pin_attempts = COALESCE(pin_attempts, 0) + 1,
        -- Lock after 5 failed attempts for 15 minutes
        pin_locked_until = CASE
          WHEN COALESCE(pin_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
          ELSE NULL
        END
    WHERE id = user_uuid;

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set/update PIN
CREATE OR REPLACE FUNCTION set_user_pin(user_uuid UUID, new_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  new_salt TEXT;
  new_hash TEXT;
BEGIN
  -- Validate PIN format (4-6 digits)
  IF new_pin !~ '^[0-9]{4,6}$' THEN
    RETURN FALSE;
  END IF;

  -- Generate random salt
  new_salt := encode(gen_random_bytes(16), 'hex');

  -- Hash the PIN
  new_hash := hash_pin(new_pin, new_salt);

  -- Store the PIN
  UPDATE users
  SET pin_hash = new_hash,
      pin_salt = new_salt,
      pin_set_at = NOW(),
      pin_attempts = 0,
      pin_locked_until = NULL
  WHERE id = user_uuid;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check required auth level based on session age
CREATE OR REPLACE FUNCTION get_required_auth_level(user_uuid UUID, device TEXT)
RETURNS TEXT AS $$
DECLARE
  session_record RECORD;
  days_since_full_login INTEGER;
  days_since_pin_verify INTEGER;
BEGIN
  -- Get session for this device
  SELECT * INTO session_record
  FROM user_sessions
  WHERE user_id = user_uuid
    AND device_id = device
    AND is_active = true;

  -- No session = need full login
  IF NOT FOUND THEN
    RETURN 'full';
  END IF;

  -- Calculate days since activities
  days_since_full_login := EXTRACT(DAY FROM NOW() - session_record.last_full_login);
  days_since_pin_verify := CASE
    WHEN session_record.last_pin_verify IS NULL THEN days_since_full_login
    ELSE EXTRACT(DAY FROM NOW() - session_record.last_pin_verify)
  END;

  -- 90+ days = full re-authentication required
  IF days_since_full_login >= 90 THEN
    RETURN 'full';
  END IF;

  -- 30+ days since last PIN verify = PIN required
  IF days_since_pin_verify >= 30 THEN
    RETURN 'pin';
  END IF;

  -- Within window = no additional auth needed
  RETURN 'none';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session on full login
CREATE OR REPLACE FUNCTION update_session_full_login(
  user_uuid UUID,
  device TEXT,
  device_info JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO user_sessions (
    user_id,
    device_id,
    device_name,
    device_type,
    browser,
    os,
    auth_level,
    last_full_login,
    last_pin_verify,
    last_activity,
    ip_address
  ) VALUES (
    user_uuid,
    device,
    device_info->>'device_name',
    device_info->>'device_type',
    device_info->>'browser',
    device_info->>'os',
    'full',
    NOW(),
    NOW(),
    NOW(),
    (device_info->>'ip_address')::INET
  )
  ON CONFLICT (user_id, device_id)
  DO UPDATE SET
    auth_level = 'full',
    last_full_login = NOW(),
    last_pin_verify = NOW(),
    last_activity = NOW(),
    device_name = COALESCE(EXCLUDED.device_name, user_sessions.device_name),
    device_type = COALESCE(EXCLUDED.device_type, user_sessions.device_type),
    browser = COALESCE(EXCLUDED.browser, user_sessions.browser),
    os = COALESCE(EXCLUDED.os, user_sessions.os),
    is_active = true
  RETURNING id INTO session_id;

  -- Update user's last full login
  UPDATE users
  SET last_full_login = NOW(),
      current_device_id = device
  WHERE id = user_uuid;

  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session on PIN verify
CREATE OR REPLACE FUNCTION update_session_pin_verify(user_uuid UUID, device TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET last_pin_verify = NOW(),
      last_activity = NOW(),
      auth_level = 'pin'
  WHERE user_id = user_uuid
    AND device_id = device
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET last_pin_verify = NOW()
  WHERE id = user_uuid;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate all sessions (for security events)
CREATE OR REPLACE FUNCTION invalidate_all_sessions(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE user_sessions
  SET is_active = false,
      auth_level = 'expired'
  WHERE user_id = user_uuid
    AND is_active = true;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old sessions (can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  DELETE FROM user_sessions
  WHERE last_activity < NOW() - INTERVAL '90 days'
    OR (is_active = false AND created_at < NOW() - INTERVAL '30 days');

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
