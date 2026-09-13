BEGIN;

-- Allow email to be optional (NULL) in users and staff_members tables
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE staff_members ALTER COLUMN email DROP NOT NULL;

-- Update email check constraint on users so NULL is explicitly allowed
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_check;
ALTER TABLE users ADD CONSTRAINT users_email_check CHECK (email IS NULL OR (email)::text = lower((email)::text));

COMMIT;
