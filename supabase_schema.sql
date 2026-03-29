-- Supabase Schema for SkillSwap (Unified Student Model)
-- To be executed in the Supabase SQL Editor
-- NO senior/junior roles — any student can teach AND learn.

-- 1. Create enum types (using exception handling to simulate IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE skill_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create users table (NO role column, year is optional)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    year INTEGER,
    semester INTEGER,
    attendance_percentage INTEGER DEFAULT 0,
    bio TEXT DEFAULT '',
    exp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar TEXT
);

-- MIGRATION: Add new columns / drop old columns on existing tables
-- (These are safe to run even on fresh databases — they use IF EXISTS / IF NOT EXISTS)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- 3. Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level skill_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create certificates table (with verification_status)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    certificate_name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_year INTEGER NOT NULL,
    verification_status verification_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MIGRATION: If certificates table already exists with old 'verified' boolean column
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'PENDING';
ALTER TABLE certificates DROP COLUMN IF EXISTS verified;

-- 5. Create sessions table (requester_id / provider_id instead of junior/senior)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    goal TEXT,
    status session_status DEFAULT 'REQUESTED',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MIGRATION: If sessions table already exists with old junior_id/senior_id columns
-- Rename them to requester_id/provider_id
DO $$ BEGIN
    ALTER TABLE sessions RENAME COLUMN junior_id TO requester_id;
EXCEPTION WHEN undefined_column THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE sessions RENAME COLUMN senior_id TO provider_id;
EXCEPTION WHEN undefined_column THEN null;
END $$;

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 7. Add basic RLS policies (Allow all for rapid prototyping)
DO $$ BEGIN
    CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read access for all skills" ON skills FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable insert for all skills" ON skills FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable update for all skills" ON skills FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read access for all certificates" ON certificates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable insert for all certificates" ON certificates FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable update for all certificates" ON certificates FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read access for all sessions" ON sessions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable insert for all sessions" ON sessions FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE POLICY "Enable update for all sessions" ON sessions FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 8. Enable Realtime subscriptions for sessions
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- 9. Login function (simplified — no password check for prototyping)
CREATE OR REPLACE FUNCTION login_user(p_roll_no TEXT, p_password TEXT)
RETURNS JSON AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user FROM users WHERE roll_no = p_roll_no;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Invalid credentials. Roll number not found.');
    END IF;
    
    RETURN json_build_object('success', true, 'user', row_to_json(v_user));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 10. MOCK DATA FOR TESTING
-- ============================================================

INSERT INTO users (id, roll_no, name, branch, year, semester, attendance_percentage, bio, exp, avatar)
VALUES
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '2023CS101', 'Alex Johnson', 'Computer Science', 2, 3, 85, 'Passionate about full-stack development and machine learning.', 350, 'https://api.dicebear.com/7.x/avataaars/svg?seed=2023CS101'),
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '2021EE505', 'Sam Miller', 'Electrical Eng.', 4, 7, 92, 'Love teaching circuit design and embedded systems.', 2500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=2021EE505'),
    ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '2022ME301', 'Priya Sharma', 'Mechanical Eng.', 3, 5, 78, 'CAD enthusiast. Happy to help with SolidWorks and AutoCAD.', 800, 'https://api.dicebear.com/7.x/avataaars/svg?seed=2022ME301'),
    ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', '2024IT102', 'Ravi Kumar', 'Information Tech.', 1, 1, 95, 'Fresher eager to learn web development and data science.', 50, 'https://api.dicebear.com/7.x/avataaars/svg?seed=2024IT102')
ON CONFLICT (roll_no) DO NOTHING;

-- Give students skills
INSERT INTO skills (user_id, skill_name, skill_level)
VALUES 
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'React & Next.js', 'ADVANCED'),
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Python', 'INTERMEDIATE'),
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Circuit Design', 'ADVANCED'),
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Embedded Systems (ARM)', 'ADVANCED'),
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'MATLAB', 'INTERMEDIATE'),
    ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'SolidWorks', 'ADVANCED'),
    ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'AutoCAD', 'INTERMEDIATE')
ON CONFLICT DO NOTHING;

-- Add mock certificates with different verification statuses
INSERT INTO certificates (user_id, file_url, certificate_name, issuer, issue_year, verification_status)
VALUES
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://example.com/cert1.pdf', 'Meta Front-End Developer', 'Coursera / Meta', 2024, 'VERIFIED'),
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://example.com/cert2.pdf', 'ARM Cortex-M Specialist', 'ARM Education', 2023, 'VERIFIED'),
    ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://example.com/cert3.pdf', 'CSWA - SolidWorks Associate', 'Dassault Systèmes', 2024, 'PENDING')
ON CONFLICT DO NOTHING;

-- Add a mock completed session
INSERT INTO sessions (requester_id, provider_id, topic, goal, status, scheduled_at)
VALUES
    ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'React Hooks & State Management', 'Understand useEffect and custom hooks', 'COMPLETED', NOW() - INTERVAL '3 days'),
    ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Introduction to SolidWorks', 'Create first 3D assembly', 'REQUESTED', NOW() + INTERVAL '2 days')
ON CONFLICT DO NOTHING;
