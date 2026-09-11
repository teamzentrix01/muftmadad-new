CREATE TABLE lab_laboratories (
 id bigserial PRIMARY KEY, name text NOT NULL, phone text NOT NULL, address text NOT NULL,
 is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE lab_areas (
 id bigserial PRIMARY KEY, name text NOT NULL, pincode text NOT NULL,
 collection_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK(collection_fee>=0), is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE lab_tests (
 id bigserial PRIMARY KEY, name text NOT NULL, kind text NOT NULL CHECK(kind IN ('test','package')),
 price numeric(12,2) NOT NULL CHECK(price>=0), sample_type text NOT NULL,
 preparation text NOT NULL DEFAULT '', includes text NOT NULL DEFAULT '',
 turnaround_hours integer NOT NULL CHECK(turnaround_hours>0), is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE lab_collectors (
 id bigserial PRIMARY KEY, name text NOT NULL, phone text NOT NULL,
 area_id bigint NOT NULL REFERENCES lab_areas(id), is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE lab_memberships (
 user_id bigint PRIMARY KEY REFERENCES users(id),
 laboratory_id bigint REFERENCES lab_laboratories(id), collector_id bigint REFERENCES lab_collectors(id),
 CHECK((laboratory_id IS NOT NULL)::integer + (collector_id IS NOT NULL)::integer = 1)
);
CREATE TABLE lab_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id bigint NOT NULL REFERENCES users(id),
 request_key uuid NOT NULL, patient_name text NOT NULL, phone text NOT NULL, address text NOT NULL,
 area_id bigint NOT NULL REFERENCES lab_areas(id), collection_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','assigned','collected','received','processing','report_ready','cancelled')),
 collector_id bigint REFERENCES lab_collectors(id), laboratory_id bigint REFERENCES lab_laboratories(id),
 barcode text UNIQUE NOT NULL DEFAULT ('LAB-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
 total numeric(12,2) NOT NULL CHECK(total>=0), collection_fee numeric(12,2) NOT NULL CHECK(collection_fee>=0),
 paid_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(paid_amount>=0 AND paid_amount<=total),
 collector_due numeric(12,2) NOT NULL DEFAULT 0 CHECK(collector_due>=0),
 lab_due numeric(12,2) NOT NULL DEFAULT 0 CHECK(lab_due>=0 AND lab_due+collector_due<=total),
 collector_settled boolean NOT NULL DEFAULT false, lab_settled boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,request_key)
);
CREATE TABLE lab_booking_items (
 booking_id uuid NOT NULL REFERENCES lab_bookings(id), test_id bigint NOT NULL REFERENCES lab_tests(id),
 name text NOT NULL, price numeric(12,2) NOT NULL CHECK(price>=0), PRIMARY KEY(booking_id,test_id)
);
CREATE TABLE lab_events (
 id bigserial PRIMARY KEY, booking_id uuid NOT NULL REFERENCES lab_bookings(id),
 actor_id bigint NOT NULL REFERENCES users(id), status text NOT NULL, note text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE lab_reports (
 booking_id uuid PRIMARY KEY REFERENCES lab_bookings(id), filename text NOT NULL,
 content bytea NOT NULL, uploaded_by bigint NOT NULL REFERENCES users(id), uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lab_bookings_user ON lab_bookings(user_id,created_at DESC);
CREATE INDEX lab_bookings_collector ON lab_bookings(collector_id,status);
CREATE INDEX lab_bookings_laboratory ON lab_bookings(laboratory_id,status);
CREATE INDEX lab_events_booking ON lab_events(booking_id,id);
