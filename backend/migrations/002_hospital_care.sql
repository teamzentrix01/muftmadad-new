BEGIN;

-- Existing administrator accounts retain their role; new signups are patients.
ALTER TABLE users ALTER COLUMN isadmin SET DEFAULT false;

CREATE TABLE IF NOT EXISTS care_memberships (
    id serial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id),
    hospital_id integer NOT NULL REFERENCES hospitals(id),
    UNIQUE (user_id, hospital_id)
);

CREATE TABLE IF NOT EXISTS care_concerns (
    id serial PRIMARY KEY,
    keyword varchar(120) NOT NULL UNIQUE,
    speciality_id integer NOT NULL REFERENCES specialities(id)
);

CREATE TABLE IF NOT EXISTS care_packages (
    id serial PRIMARY KEY,
    hospital_id integer NOT NULL REFERENCES hospitals(id),
    treatment_id bigint NOT NULL REFERENCES treatments(id),
    title varchar(200) NOT NULL,
    min_price numeric(12,2) NOT NULL CHECK (min_price >= 0),
    max_price numeric(12,2) NOT NULL CHECK (max_price >= min_price),
    inclusions text[] NOT NULL DEFAULT '{}',
    exclusions text[] NOT NULL DEFAULT '{}',
    valid_until date NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_slots (
    id serial PRIMARY KEY,
    doctor_id integer NOT NULL REFERENCES doctors(id),
    hospital_id integer NOT NULL REFERENCES hospitals(id),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
    capacity integer NOT NULL DEFAULT 1 CHECK (capacity BETWEEN 1 AND 50),
    is_active boolean NOT NULL DEFAULT true,
    UNIQUE (doctor_id, starts_at)
);

CREATE TABLE IF NOT EXISTS care_appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id bigint NOT NULL REFERENCES users(id),
    slot_id integer NOT NULL REFERENCES care_slots(id),
    package_id integer REFERENCES care_packages(id),
    patient_name varchar(100) NOT NULL,
    patient_phone varchar(20) NOT NULL,
    requirement text NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed','consulted','diagnostics','treatment','follow_up','completed','cancelled','no_show')),
    price_snapshot jsonb NOT NULL DEFAULT '{}',
    request_key uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, request_key)
);
CREATE INDEX IF NOT EXISTS care_appointments_slot_idx ON care_appointments(slot_id);
CREATE INDEX IF NOT EXISTS care_appointments_user_idx ON care_appointments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS care_events (
    id bigserial PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES care_appointments(id),
    actor_id bigint NOT NULL REFERENCES users(id),
    status varchar(30) NOT NULL,
    note text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_assistance (
    id serial PRIMARY KEY,
    appointment_id uuid NOT NULL UNIQUE REFERENCES care_appointments(id),
    reason text NOT NULL,
    requested_amount numeric(12,2) NOT NULL CHECK (requested_amount > 0),
    status varchar(30) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted','under_review','needs_information','approved','declined')),
    decision_note text NOT NULL DEFAULT '',
    decided_by bigint REFERENCES users(id),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_followups (
    id serial PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES care_appointments(id),
    due_at timestamptz NOT NULL,
    note text NOT NULL,
    completed_at timestamptz,
    created_by bigint NOT NULL REFERENCES users(id)
);

COMMIT;
