BEGIN;

ALTER TABLE public.specialities ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.cities (
    id serial PRIMARY KEY,
    name_en varchar(100) NOT NULL,
    name_hi varchar(100) NOT NULL,
    slug varchar(150) NOT NULL UNIQUE,
    display_order integer NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
