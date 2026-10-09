-- ============================================================
-- PetroAttendance TDF - Seed Data
-- Datos iniciales para demo y pruebas
-- ============================================================

-- ============================================================
-- ACCESS POINTS (Lectores Biométricos)
-- ============================================================

INSERT INTO access_points (code, name, worksite, device, ip_address, status) VALUES
('AP-01', 'Garita Principal Norte', 'San Sebastián', 'BioStar 2 Fingerprint #1', '192.168.10.11', 'ONLINE'),
('AP-02', 'Comedor / Hotelería', 'San Sebastián', 'BioStar 2 Fingerprint #2', '192.168.10.12', 'ONLINE'),
('AP-03', 'Taller Mecánico Central', 'San Sebastián', 'Suprema BioEntry W2 #3', '192.168.10.13', 'ONLINE'),
('AP-04', 'Plataforma de Perforación Rig 04', 'Costa Afuera TDF', 'ZK-Teco Ex-Proof #4', '192.168.20.15', 'ONLINE'),
('AP-05', 'Base Logística Río Grande', 'Base Río Grande', 'ZK-Teco iFace #5', '192.168.5.20', 'ONLINE');

-- ============================================================
-- NOTE: Profiles will be created automatically via auth trigger
-- The seed below is for AFTER users have been created via Supabase Auth
-- Run this after creating the demo users in the Auth dashboard
-- ============================================================

-- To create demo users, go to Supabase Auth Dashboard and create:
-- 1. federico@petroattendance.com (password: Demo2026!) -> EMPLOYEE
-- 2. carlos@petroattendance.com (password: Demo2026!) -> SUPERVISOR
-- 3. valeria@petroattendance.com (password: Demo2026!) -> HR
-- 4. marcelo@petroattendance.com (password: Demo2026!) -> ADMIN
-- 5. mariana@petroattendance.com (password: Demo2026!) -> EMPLOYEE

-- Then update the profiles with full data:
-- (Run this after users are created)

/*
-- Update Federico Gómez profile
UPDATE profiles SET
    legajo = '1001',
    name = 'Federico Gómez',
    dni = '32.456.789',
    company = 'Austral Drilling S.A.',
    area = 'Mantenimiento & Operaciones',
    sector = 'Mantenimiento',
    position = 'Técnico Mecánico Senior',
    category = 'Fuera de Convenio / UOCRA',
    manager_name = 'Roberto Sánchez',
    role = 'EMPLOYEE',
    regime = '14x14',
    shift = 'Turno Día (07:00 - 19:00)',
    schedule = '07:00 – 19:00',
    worksite = 'Yacimiento San Sebastián (TDF)',
    base = 'Río Grande',
    cost_center = 'CC-MANT-01',
    entry_date = '2021-03-15',
    phone = '+54 9 2964 45-8812'
WHERE email = 'federico@petroattendance.com';

-- Update Carlos López profile
UPDATE profiles SET
    legajo = '1002',
    name = 'Carlos López',
    dni = '28.111.222',
    company = 'Austral Drilling S.A.',
    sector = 'Mantenimiento',
    position = 'Supervisor de Turno',
    role = 'SUPERVISOR',
    cost_center = 'CC-MANT-01',
    worksite = 'Yacimiento San Sebastián (TDF)'
WHERE email = 'carlos@petroattendance.com';

-- Update Valeria Vignoli profile  
UPDATE profiles SET
    legajo = '2001',
    name = 'Lic. Valeria Vignoli',
    dni = '30.555.666',
    company = 'Austral Drilling S.A.',
    sector = 'Recursos Humanos',
    position = 'Responsable RRHH TDF',
    role = 'HR',
    cost_center = 'CC-RRHH-01',
    worksite = 'Base Río Grande (TDF)'
WHERE email = 'valeria@petroattendance.com';

-- Update Marcelo Torres profile
UPDATE profiles SET
    legajo = '3001',
    name = 'Ing. Marcelo Torres',
    dni = '26.333.444',
    company = 'Austral Drilling S.A.',
    sector = 'Sistemas & IT',
    position = 'Admin Sistemas',
    role = 'ADMIN',
    cost_center = 'CC-SIS-01',
    worksite = 'Base Río Grande (TDF)'
WHERE email = 'marcelo@petroattendance.com';

-- Update Mariana Ruarte profile
UPDATE profiles SET
    legajo = '1003',
    name = 'Mariana Ruarte',
    dni = '35.888.999',
    company = 'Patagonia Services',
    sector = 'Instrumentación',
    position = 'Ingeniera SCADA',
    role = 'EMPLOYEE',
    cost_center = 'CC-INSTR-02',
    worksite = 'Yacimiento San Sebastián (TDF)'
WHERE email = 'mariana@petroattendance.com';

-- Set supervisor relationships
UPDATE profiles SET supervisor_id = (SELECT id FROM profiles WHERE email = 'carlos@petroattendance.com')
WHERE email IN ('federico@petroattendance.com', 'mariana@petroattendance.com');
*/
