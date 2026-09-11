--
-- PostgreSQL database dump
--

\restrict O44v8szkvHwAuF70bgeIIHazfeX9W0ZDI9rRgnd5V8GNUPip0YsYDbtFdrpS8cT

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-08 13:58:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 239 (class 1255 OID 16666)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16667)
-- Name: blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    subtitle text,
    slug character varying(500) NOT NULL,
    tag character varying(100),
    author character varying(200),
    publish_date character varying(50),
    read_time character varying(50),
    bg_image text,
    overlay_opacity numeric(3,2) DEFAULT 0.6,
    align character varying(20) DEFAULT 'text-center'::character varying,
    text_color character varying(30) DEFAULT 'text-white'::character varying,
    blocks jsonb DEFAULT '[]'::jsonb,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.blogs OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16684)
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blogs_id_seq OWNER TO postgres;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 220
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- TOC entry 221 (class 1259 OID 16685)
-- Name: doctor_hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_hospitals (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    hospital_id integer NOT NULL,
    role character varying(100),
    department character varying(100),
    joining_date date,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.doctor_hospitals OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16693)
-- Name: doctor_hospitals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_hospitals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_hospitals_id_seq OWNER TO postgres;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 222
-- Name: doctor_hospitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_hospitals_id_seq OWNED BY public.doctor_hospitals.id;


--
-- TOC entry 223 (class 1259 OID 16694)
-- Name: doctor_specialities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_specialities (
    id integer NOT NULL,
    doctor_id integer NOT NULL,
    speciality_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.doctor_specialities OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16701)
-- Name: doctor_specialities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_specialities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_specialities_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 224
-- Name: doctor_specialities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_specialities_id_seq OWNED BY public.doctor_specialities.id;


--
-- TOC entry 225 (class 1259 OID 16702)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    photo character varying(500),
    phone character varying(20),
    degrees text[] NOT NULL,
    specialities text[] NOT NULL,
    experience_in_years integer NOT NULL,
    registration_number character varying(50),
    city character varying(100),
    state character varying(100),
    country character varying(100) DEFAULT 'india'::character varying,
    address text,
    location point,
    overview text,
    serving_in_hospitals jsonb,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    availability_schedule jsonb,
    consultation_fee numeric(10,2),
    languages_spoken text[],
    awards_and_recognitions text[],
    publications text[],
    average_rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    total_patients_treated integer DEFAULT 0,
    slug character varying(150),
    meta_title character varying(200),
    meta_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT doctors_average_rating_check CHECK (((average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric))),
    CONSTRAINT doctors_email_check CHECK (((email)::text = lower((email)::text))),
    CONSTRAINT doctors_experience_in_years_check CHECK ((experience_in_years >= 0))
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16728)
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 226
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- TOC entry 227 (class 1259 OID 16729)
-- Name: hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitals (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    photo character varying(500),
    slug character varying(200),
    phone character varying(20),
    email character varying(255),
    address text NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100),
    pincode character varying(10),
    country character varying(100) DEFAULT 'India'::character varying,
    location point,
    about text,
    opening_hours jsonb,
    timing_display character varying(100),
    certifications text[],
    total_doctors integer DEFAULT 0,
    total_specialities integer DEFAULT 0,
    rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    meta_title character varying(200),
    meta_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    available_treatments text[],
    available_services text[],
    available_specialities text[],
    gallery_images text[] DEFAULT '{}'::text[],
    CONSTRAINT hospitals_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


ALTER TABLE public.hospitals OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16753)
-- Name: hospitals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hospitals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hospitals_id_seq OWNER TO postgres;

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 228
-- Name: hospitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hospitals_id_seq OWNED BY public.hospitals.id;


--
-- TOC entry 229 (class 1259 OID 16754)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    treatment character varying(255) NOT NULL,
    rating smallint NOT NULL,
    city character varying(200) NOT NULL,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16771)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 230
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 231 (class 1259 OID 16772)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(200),
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16782)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 232
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 233 (class 1259 OID 16783)
-- Name: specialities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialities (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(100),
    description text,
    icon character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    faqs jsonb,
    name_en character varying(100),
    name_hi character varying(100),
    image character varying(500),
    description_en text,
    description_hi text,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.specialities OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16794)
-- Name: specialities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specialities_id_seq OWNER TO postgres;

--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 234
-- Name: specialities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialities_id_seq OWNED BY public.specialities.id;


--
-- TOC entry 235 (class 1259 OID 16795)
-- Name: treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatments (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    specialty_id bigint,
    treatment_image text,
    png_logo text,
    overview_description text,
    key_benefits text[],
    who_gets_description text,
    ideal_candidates text[],
    not_suitable_for text[],
    causes_description text,
    causes_list jsonb,
    symptoms_description text,
    symptoms_list jsonb,
    diagnosis_description text,
    diagnosis_steps jsonb,
    treatment_procedure_description text,
    pre_operative_steps text[],
    surgical_procedure_steps text[],
    post_operative_steps text[],
    cost_description text,
    cost_ranges jsonb,
    cost_factors text[],
    ayushman_covered boolean DEFAULT false,
    ayushman_description text,
    ayushman_benefits text[],
    ayushman_eligibility text[],
    ayushman_claim_steps text[],
    surgery_duration character varying(100),
    hospital_stay character varying(100),
    recovery_time character varying(100),
    success_rate character varying(50),
    faqs jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    comes_in character varying(200) NOT NULL
);


ALTER TABLE public.treatments OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16809)
-- Name: treatments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treatments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treatments_id_seq OWNER TO postgres;

--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 236
-- Name: treatments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treatments_id_seq OWNED BY public.treatments.id;


--
-- TOC entry 237 (class 1259 OID 16810)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    hash_password text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    isadmin boolean DEFAULT true,
    CONSTRAINT users_email_check CHECK (((email)::text = lower((email)::text)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16825)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 238
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4902 (class 2604 OID 16826)
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 16827)
-- Name: doctor_hospitals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_hospitals ALTER COLUMN id SET DEFAULT nextval('public.doctor_hospitals_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 16828)
-- Name: doctor_specialities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_specialities ALTER COLUMN id SET DEFAULT nextval('public.doctor_specialities_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16829)
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 16830)
-- Name: hospitals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals ALTER COLUMN id SET DEFAULT nextval('public.hospitals_id_seq'::regclass);


--
-- TOC entry 4938 (class 2604 OID 16831)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 16832)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4946 (class 2604 OID 16833)
-- Name: specialities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities ALTER COLUMN id SET DEFAULT nextval('public.specialities_id_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 16834)
-- Name: treatments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments ALTER COLUMN id SET DEFAULT nextval('public.treatments_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 16835)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4968 (class 2606 OID 16853)
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 16855)
-- Name: blogs blogs_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_slug_key UNIQUE (slug);


--
-- TOC entry 4972 (class 2606 OID 16857)
-- Name: blogs blogs_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_uuid_key UNIQUE (uuid);


--
-- TOC entry 4974 (class 2606 OID 16859)
-- Name: doctor_hospitals doctor_hospitals_doctor_id_hospital_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_hospitals
    ADD CONSTRAINT doctor_hospitals_doctor_id_hospital_id_key UNIQUE (doctor_id, hospital_id);


--
-- TOC entry 4976 (class 2606 OID 16861)
-- Name: doctor_hospitals doctor_hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_hospitals
    ADD CONSTRAINT doctor_hospitals_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16863)
-- Name: doctor_specialities doctor_specialities_doctor_id_speciality_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_specialities
    ADD CONSTRAINT doctor_specialities_doctor_id_speciality_id_key UNIQUE (doctor_id, speciality_id);


--
-- TOC entry 4980 (class 2606 OID 16865)
-- Name: doctor_specialities doctor_specialities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_specialities
    ADD CONSTRAINT doctor_specialities_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 2606 OID 16867)
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- TOC entry 4984 (class 2606 OID 16869)
-- Name: doctors doctors_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_phone_key UNIQUE (phone);


--
-- TOC entry 4986 (class 2606 OID 16871)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 16873)
-- Name: doctors doctors_registration_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_registration_number_key UNIQUE (registration_number);


--
-- TOC entry 4990 (class 2606 OID 16875)
-- Name: doctors doctors_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_slug_key UNIQUE (slug);


--
-- TOC entry 4992 (class 2606 OID 16877)
-- Name: doctors doctors_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_uuid_key UNIQUE (uuid);


--
-- TOC entry 4994 (class 2606 OID 16879)
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 16881)
-- Name: hospitals hospitals_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_slug_key UNIQUE (slug);


--
-- TOC entry 4998 (class 2606 OID 16883)
-- Name: hospitals hospitals_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_uuid_key UNIQUE (uuid);


--
-- TOC entry 5000 (class 2606 OID 16885)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 16887)
-- Name: reviews reviews_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_uuid_key UNIQUE (uuid);


--
-- TOC entry 5004 (class 2606 OID 16889)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 16891)
-- Name: services services_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_slug_key UNIQUE (slug);


--
-- TOC entry 5008 (class 2606 OID 16893)
-- Name: services services_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_uuid_key UNIQUE (uuid);


--
-- TOC entry 5010 (class 2606 OID 16895)
-- Name: specialities specialities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities
    ADD CONSTRAINT specialities_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 16897)
-- Name: specialities specialities_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities
    ADD CONSTRAINT specialities_slug_key UNIQUE (slug);


--
-- TOC entry 5014 (class 2606 OID 16899)
-- Name: specialities specialities_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities
    ADD CONSTRAINT specialities_uuid_key UNIQUE (uuid);


--
-- TOC entry 5016 (class 2606 OID 16901)
-- Name: treatments treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 16903)
-- Name: treatments treatments_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_slug_key UNIQUE (slug);


--
-- TOC entry 5020 (class 2606 OID 16905)
-- Name: treatments treatments_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_uuid_key UNIQUE (uuid);


--
-- TOC entry 5022 (class 2606 OID 16907)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5024 (class 2606 OID 16909)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 5026 (class 2606 OID 16911)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2620 OID 16912)
-- Name: doctors update_doctors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5032 (class 2620 OID 16913)
-- Name: hospitals update_hospitals_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5033 (class 2620 OID 16914)
-- Name: treatments update_treatments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5027 (class 2606 OID 16915)
-- Name: doctor_hospitals doctor_hospitals_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_hospitals
    ADD CONSTRAINT doctor_hospitals_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 16920)
-- Name: doctor_hospitals doctor_hospitals_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_hospitals
    ADD CONSTRAINT doctor_hospitals_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 16925)
-- Name: doctor_specialities doctor_specialities_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_specialities
    ADD CONSTRAINT doctor_specialities_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 16930)
-- Name: doctor_specialities doctor_specialities_speciality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_specialities
    ADD CONSTRAINT doctor_specialities_speciality_id_fkey FOREIGN KEY (speciality_id) REFERENCES public.specialities(id) ON DELETE CASCADE;


-- Completed on 2026-04-08 13:58:36

--
-- PostgreSQL database dump complete
--

\unrestrict O44v8szkvHwAuF70bgeIIHazfeX9W0ZDI9rRgnd5V8GNUPip0YsYDbtFdrpS8cT


-- Compatibility additions required by the current application.
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

