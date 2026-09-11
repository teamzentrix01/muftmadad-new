BEGIN;
ALTER TABLE doctors ALTER COLUMN photo TYPE text;
ALTER TABLE hospitals ALTER COLUMN photo TYPE text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS currently_serving text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sitting_plan text[] DEFAULT '{}';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS certificate_files jsonb DEFAULT '[]';
COMMIT;
