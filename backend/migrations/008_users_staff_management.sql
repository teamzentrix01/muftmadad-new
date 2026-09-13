BEGIN;

-- 1. Add role, post, department, and status to users table if not already present
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(50) DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS post varchar(150) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department varchar(150) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'active';

-- Update existing admins to role 'admin'
UPDATE users SET role = 'admin' WHERE isadmin = true AND (role IS NULL OR role = 'patient');

-- 2. Create staff_members table to hold detailed staff records
CREATE TABLE IF NOT EXISTS staff_members (
    id serial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    name varchar(150) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(30) NOT NULL,
    post varchar(150) DEFAULT '-',
    department varchar(150) DEFAULT '-',
    status varchar(50) DEFAULT 'pending',
    notes text DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON staff_members(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Backfill existing staff from lab_memberships if any
INSERT INTO staff_members (user_id, name, email, phone, post, department, status, created_at, updated_at)
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.phone,
    CASE 
        WHEN lm.laboratory_id IS NOT NULL THEN 'Lab Technician'
        WHEN lm.collector_id IS NOT NULL THEN 'Sample Collector'
        ELSE 'Staff Member'
    END,
    CASE 
        WHEN lm.laboratory_id IS NOT NULL THEN 'Laboratory'
        WHEN lm.collector_id IS NOT NULL THEN 'Sample Collection'
        ELSE 'General'
    END,
    'active',
    u.created_at,
    now()
FROM users u
JOIN lab_memberships lm ON lm.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Also update their role in users table
UPDATE users u
SET role = 'staff'
FROM lab_memberships lm
WHERE lm.user_id = u.id AND u.isadmin = false;

-- 4. Backfill existing staff from care_memberships if any
INSERT INTO staff_members (user_id, name, email, phone, post, department, status, created_at, updated_at)
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.phone,
    'Hospital Staff',
    'Hospital Care',
    'active',
    u.created_at,
    now()
FROM users u
JOIN care_memberships cm ON cm.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

UPDATE users u
SET role = 'staff'
FROM care_memberships cm
WHERE cm.user_id = u.id AND u.isadmin = false;

COMMIT;
