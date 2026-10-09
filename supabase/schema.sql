-- ============================================================
-- PetroAttendance TDF - Supabase Schema
-- Sistema Integral de Control de Asistencia y Jornadas
-- Operación Oil & Gas - Tierra del Fuego
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'SUPERVISOR', 'HR', 'ADMIN');
CREATE TYPE event_type AS ENUM ('INGRESO', 'EGRESO');
CREATE TYPE device_status AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE');
CREATE TYPE overtime_status AS ENUM ('PENDIENTE SUPERVISOR', 'APROBADA', 'RECHAZADA', 'VALIDADA');
CREATE TYPE standby_type AS ENUM ('GUARDIA PASIVA', 'GUARDIA ACTIVA', 'GUARDIA DE EMERGENCIA');
CREATE TYPE standby_status AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'CUMPLIDA', 'CANCELADA');
CREATE TYPE correction_status AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
CREATE TYPE ticket_status AS ENUM ('ABIERTO', 'EN ANÁLISIS', 'RESUELTO', 'CERRADO');
CREATE TYPE preliq_status AS ENUM ('EN CONSTRUCCIÓN', 'VALIDADO', 'REQUIERE ATENCIÓN', 'CERRADO');

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    legajo TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dni TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT 'Austral Drilling S.A.',
    area TEXT DEFAULT 'Mantenimiento & Operaciones',
    sector TEXT NOT NULL,
    position TEXT NOT NULL,
    category TEXT DEFAULT 'Fuera de Convenio / UOCRA',
    supervisor_id UUID REFERENCES profiles(id),
    manager_name TEXT,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    regime TEXT DEFAULT '14x14',
    shift TEXT DEFAULT 'Turno Día (07:00 - 19:00)',
    schedule TEXT DEFAULT '07:00 – 19:00',
    worksite TEXT DEFAULT 'Yacimiento San Sebastián (TDF)',
    base TEXT DEFAULT 'Río Grande',
    cost_center TEXT,
    entry_date DATE,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ACCESS POINTS (Lectores Biométricos)
-- ============================================================

CREATE TABLE access_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- AP-01, AP-02, etc.
    name TEXT NOT NULL,
    worksite TEXT NOT NULL,
    device TEXT NOT NULL,
    ip_address TEXT,
    status device_status DEFAULT 'ONLINE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. BIOMETRIC EVENTS (Fichadas)
-- ============================================================

CREATE TABLE biometric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- EV-901, etc.
    employee_id UUID NOT NULL REFERENCES profiles(id),
    access_point_id UUID NOT NULL REFERENCES access_points(id),
    timestamp TIMESTAMPTZ NOT NULL,
    type event_type NOT NULL,
    original_timestamp TIMESTAMPTZ NOT NULL,
    received_timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'PROCESADO',
    worksite TEXT,
    shift TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. OVERTIME REQUESTS (Solicitudes de Horas Extra)
-- ============================================================

CREATE TABLE overtime_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- OT-501, etc.
    employee_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL,
    normal_hours TEXT DEFAULT '07:00 – 19:00',
    extra_hours TEXT NOT NULL,
    reason TEXT NOT NULL,
    cost_center TEXT,
    project TEXT,
    supervisor_id UUID REFERENCES profiles(id),
    status overtime_status DEFAULT 'PENDIENTE SUPERVISOR',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. STANDBY DUTIES (Guardias)
-- ============================================================

CREATE TABLE standby_duties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- SB-301, etc.
    employee_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type standby_type NOT NULL,
    sector TEXT,
    supervisor_id UUID REFERENCES profiles(id),
    cost_center TEXT,
    project TEXT,
    status standby_status DEFAULT 'PROGRAMADA',
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. CORRECTIONS (Correcciones de Fichada)
-- ============================================================

CREATE TABLE corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- COR-201, etc.
    employee_id UUID NOT NULL REFERENCES profiles(id),
    correction_type TEXT NOT NULL,
    original_record TEXT NOT NULL,
    requested_change TEXT NOT NULL,
    reason TEXT NOT NULL,
    status correction_status DEFAULT 'PENDIENTE',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. HR TICKETS
-- ============================================================

CREATE TABLE hr_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- RRHH-2026-00187, etc.
    employee_id UUID NOT NULL REFERENCES profiles(id),
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    status ticket_status DEFAULT 'ABIERTO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TICKET MESSAGES
-- ============================================================

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES hr_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. PRELIQUIDATIONS
-- ============================================================

CREATE TABLE preliquidations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES profiles(id),
    period TEXT NOT NULL, -- "Octubre 2026"
    programmed_days INT DEFAULT 0,
    worked_days INT DEFAULT 0,
    normal_hours DECIMAL(6,2) DEFAULT 0,
    approved_ot DECIMAL(6,2) DEFAULT 0,
    pending_ot DECIMAL(6,2) DEFAULT 0,
    standby_count INT DEFAULT 0,
    holidays INT DEFAULT 0,
    absences INT DEFAULT 0,
    status preliq_status DEFAULT 'EN CONSTRUCCIÓN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, period)
);

-- ============================================================
-- 10. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- AUD-991, etc.
    user_id UUID REFERENCES profiles(id),
    user_name TEXT,
    role user_role,
    action TEXT NOT NULL,
    detail TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_supervisor ON profiles(supervisor_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_biometric_employee ON biometric_events(employee_id);
CREATE INDEX idx_biometric_timestamp ON biometric_events(timestamp DESC);
CREATE INDEX idx_overtime_employee ON overtime_requests(employee_id);
CREATE INDEX idx_overtime_supervisor ON overtime_requests(supervisor_id);
CREATE INDEX idx_overtime_status ON overtime_requests(status);
CREATE INDEX idx_standby_employee ON standby_duties(employee_id);
CREATE INDEX idx_corrections_employee ON corrections(employee_id);
CREATE INDEX idx_tickets_employee ON hr_tickets(employee_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE standby_duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE preliquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_points ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's profile
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Supervisors can view their team"
    ON profiles FOR SELECT
    USING (
        supervisor_id = get_my_profile_id()
        OR get_my_role() IN ('HR', 'ADMIN')
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all profiles"
    ON profiles FOR ALL
    USING (get_my_role() = 'ADMIN');

-- ACCESS POINTS policies (readable by all authenticated)
CREATE POLICY "Authenticated users can view access points"
    ON access_points FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage access points"
    ON access_points FOR ALL
    USING (get_my_role() = 'ADMIN');

-- BIOMETRIC EVENTS policies
CREATE POLICY "Users can view own events"
    ON biometric_events FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "Supervisors can view team events"
    ON biometric_events FOR SELECT
    USING (
        employee_id IN (SELECT id FROM profiles WHERE supervisor_id = get_my_profile_id())
        OR get_my_role() IN ('HR', 'ADMIN')
    );

CREATE POLICY "System can insert events"
    ON biometric_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- OVERTIME REQUESTS policies
CREATE POLICY "Users can view own overtime"
    ON overtime_requests FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "Supervisors can view team overtime"
    ON overtime_requests FOR SELECT
    USING (
        supervisor_id = get_my_profile_id()
        OR get_my_role() IN ('HR', 'ADMIN')
    );

CREATE POLICY "Users can create overtime requests"
    ON overtime_requests FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "Supervisors can update team overtime"
    ON overtime_requests FOR UPDATE
    USING (
        supervisor_id = get_my_profile_id()
        OR get_my_role() IN ('HR', 'ADMIN')
    );

-- STANDBY DUTIES policies
CREATE POLICY "Users can view own standby"
    ON standby_duties FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "Supervisors can manage team standby"
    ON standby_duties FOR ALL
    USING (
        supervisor_id = get_my_profile_id()
        OR get_my_role() IN ('HR', 'ADMIN')
    );

-- CORRECTIONS policies
CREATE POLICY "Users can view own corrections"
    ON corrections FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "Users can create corrections"
    ON corrections FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "Supervisors can manage corrections"
    ON corrections FOR ALL
    USING (
        employee_id IN (SELECT id FROM profiles WHERE supervisor_id = get_my_profile_id())
        OR get_my_role() IN ('HR', 'ADMIN')
    );

-- HR TICKETS policies
CREATE POLICY "Users can view own tickets"
    ON hr_tickets FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "Users can create tickets"
    ON hr_tickets FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = get_my_profile_id());

CREATE POLICY "HR can manage all tickets"
    ON hr_tickets FOR ALL
    USING (get_my_role() IN ('HR', 'ADMIN'));

-- TICKET MESSAGES policies
CREATE POLICY "Ticket participants can view messages"
    ON ticket_messages FOR SELECT
    USING (
        ticket_id IN (SELECT id FROM hr_tickets WHERE employee_id = get_my_profile_id())
        OR get_my_role() IN ('HR', 'ADMIN')
    );

CREATE POLICY "Authenticated can send messages"
    ON ticket_messages FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = get_my_profile_id());

-- PRELIQUIDATIONS policies
CREATE POLICY "Users can view own preliquidation"
    ON preliquidations FOR SELECT
    USING (employee_id = get_my_profile_id());

CREATE POLICY "HR can manage preliquidations"
    ON preliquidations FOR ALL
    USING (get_my_role() IN ('HR', 'ADMIN'));

-- AUDIT LOGS policies
CREATE POLICY "Admin can view audit logs"
    ON audit_logs FOR SELECT
    USING (get_my_role() IN ('HR', 'ADMIN'));

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, legajo, name, dni, sector, position, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'legajo', 'PENDING'),
        COALESCE(NEW.raw_user_meta_data->>'name', 'Nuevo Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'dni', '00.000.000'),
        COALESCE(NEW.raw_user_meta_data->>'sector', 'Sin asignar'),
        COALESCE(NEW.raw_user_meta_data->>'position', 'Sin asignar'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER overtime_updated_at BEFORE UPDATE ON overtime_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON hr_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER preliq_updated_at BEFORE UPDATE ON preliquidations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
