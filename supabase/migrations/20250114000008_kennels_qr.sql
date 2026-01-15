-- Kennels and QR Code System
-- Allows facilities to manage kennels and assign dogs during training stays

-- Kennel status enum
CREATE TYPE kennel_status AS ENUM ('available', 'occupied', 'cleaning', 'maintenance', 'reserved');

-- Kennel size enum
CREATE TYPE kennel_size AS ENUM ('small', 'medium', 'large', 'extra_large');

-- Kennels table
CREATE TABLE kennels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    size kennel_size NOT NULL DEFAULT 'medium',
    status kennel_status NOT NULL DEFAULT 'available',
    features TEXT[], -- e.g., ['outdoor_access', 'climate_controlled', 'camera']
    notes TEXT,
    qr_code_url TEXT, -- Generated URL for QR code
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, name)
);

-- Kennel assignments table - tracks which dog is in which kennel
CREATE TABLE kennel_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kennel_id UUID NOT NULL REFERENCES kennels(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES board_train_stays(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kennel activity log - track activities via QR scan
CREATE TABLE kennel_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kennel_id UUID NOT NULL REFERENCES kennels(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES kennel_assignments(id) ON DELETE SET NULL,
    dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'feeding', 'potty_break', 'medication', 'check', 'cleaning', etc.
    notes TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_kennels_facility ON kennels(facility_id);
CREATE INDEX idx_kennels_status ON kennels(facility_id, status);
CREATE INDEX idx_kennel_assignments_kennel ON kennel_assignments(kennel_id);
CREATE INDEX idx_kennel_assignments_dog ON kennel_assignments(dog_id);
CREATE INDEX idx_kennel_assignments_active ON kennel_assignments(kennel_id) WHERE released_at IS NULL;
CREATE INDEX idx_kennel_activity_logs_kennel ON kennel_activity_logs(kennel_id);
CREATE INDEX idx_kennel_activity_logs_dog ON kennel_activity_logs(dog_id);

-- Trigger for updated_at
CREATE TRIGGER update_kennels_updated_at
    BEFORE UPDATE ON kennels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kennel_assignments_updated_at
    BEFORE UPDATE ON kennel_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update kennel status when assignment changes
CREATE OR REPLACE FUNCTION update_kennel_status_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Mark kennel as occupied when dog is assigned
        UPDATE kennels SET status = 'occupied' WHERE id = NEW.kennel_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.released_at IS NOT NULL AND OLD.released_at IS NULL THEN
        -- Mark kennel for cleaning when dog is released
        UPDATE kennels SET status = 'cleaning' WHERE id = NEW.kennel_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kennel_assignment_status_trigger
    AFTER INSERT OR UPDATE ON kennel_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_kennel_status_on_assignment();

-- RLS Policies
ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE kennel_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kennel_activity_logs ENABLE ROW LEVEL SECURITY;

-- Kennels policies
CREATE POLICY "Users can view kennels in their facility"
    ON kennels FOR SELECT
    USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Owners and admins can manage kennels"
    ON kennels FOR ALL
    USING (
        facility_id IN (
            SELECT facility_id FROM users
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Kennel assignments policies
CREATE POLICY "Users can view kennel assignments in their facility"
    ON kennel_assignments FOR SELECT
    USING (
        kennel_id IN (
            SELECT k.id FROM kennels k
            JOIN users u ON u.facility_id = k.facility_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Trainers can manage kennel assignments"
    ON kennel_assignments FOR ALL
    USING (
        kennel_id IN (
            SELECT k.id FROM kennels k
            JOIN users u ON u.facility_id = k.facility_id
            WHERE u.id = auth.uid() AND u.role IN ('owner', 'admin', 'trainer')
        )
    );

-- Kennel activity logs policies
CREATE POLICY "Users can view kennel activity logs in their facility"
    ON kennel_activity_logs FOR SELECT
    USING (
        kennel_id IN (
            SELECT k.id FROM kennels k
            JOIN users u ON u.facility_id = k.facility_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Trainers can log kennel activities"
    ON kennel_activity_logs FOR INSERT
    WITH CHECK (
        kennel_id IN (
            SELECT k.id FROM kennels k
            JOIN users u ON u.facility_id = k.facility_id
            WHERE u.id = auth.uid() AND u.role IN ('owner', 'admin', 'trainer')
        )
    );

-- Public access for QR code scans (with token verification in app)
CREATE POLICY "Public can view kennel for QR scan"
    ON kennels FOR SELECT
    USING (true);

CREATE POLICY "Public can view active kennel assignment for QR scan"
    ON kennel_assignments FOR SELECT
    USING (released_at IS NULL);
