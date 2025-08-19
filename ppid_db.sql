--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-19 08:46:07

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
-- TOC entry 5 (class 2615 OID 26196)
-- Name: public; Type: SCHEMA; Schema: -; Owner: sidogar_client_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO sidogar_client_user;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: sidogar_client_user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 26197)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO sidogar_client_user;

--
-- TOC entry 235 (class 1259 OID 26299)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    action text NOT NULL,
    details text,
    user_id text,
    user_role text,
    ip_address text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resource text
);


ALTER TABLE public.activity_logs OWNER TO sidogar_client_user;

--
-- TOC entry 234 (class 1259 OID 26298)
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 234
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- TOC entry 219 (class 1259 OID 26207)
-- Name: admin; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    email text NOT NULL,
    hashed_password text NOT NULL,
    nama text NOT NULL,
    role text DEFAULT 'ADMIN'::text,
    permissions text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin OWNER TO sidogar_client_user;

--
-- TOC entry 218 (class 1259 OID 26206)
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 218
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- TOC entry 229 (class 1259 OID 26264)
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.chat_sessions (
    id integer NOT NULL,
    request_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    ended_by text,
    ended_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat_sessions OWNER TO sidogar_client_user;

--
-- TOC entry 228 (class 1259 OID 26263)
-- Name: chat_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.chat_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_sessions_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 228
-- Name: chat_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.chat_sessions_id_seq OWNED BY public.chat_sessions.id;


--
-- TOC entry 233 (class 1259 OID 26286)
-- Name: informasi_publik; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.informasi_publik (
    id integer NOT NULL,
    judul text NOT NULL,
    klasifikasi text NOT NULL,
    ringkasan_isi_informasi text NOT NULL,
    file_attachments text,
    links text,
    tanggal_posting timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pejabat_penguasa_informasi text,
    status text DEFAULT 'draft'::text NOT NULL,
    thumbnail text,
    jadwal_publish timestamp(3) without time zone,
    images text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer
);


ALTER TABLE public.informasi_publik OWNER TO sidogar_client_user;

--
-- TOC entry 232 (class 1259 OID 26285)
-- Name: informasi_publik_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.informasi_publik_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.informasi_publik_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 232
-- Name: informasi_publik_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.informasi_publik_id_seq OWNED BY public.informasi_publik.id;


--
-- TOC entry 245 (class 1259 OID 26389)
-- Name: kategori; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.kategori (
    id integer NOT NULL,
    nama text NOT NULL,
    deskripsi text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.kategori OWNER TO sidogar_client_user;

--
-- TOC entry 244 (class 1259 OID 26388)
-- Name: kategori_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.kategori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategori_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 244
-- Name: kategori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.kategori_id_seq OWNED BY public.kategori.id;


--
-- TOC entry 231 (class 1259 OID 26275)
-- Name: kategori_informasi; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.kategori_informasi (
    id integer NOT NULL,
    nama text NOT NULL,
    slug text NOT NULL,
    deskripsi text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.kategori_informasi OWNER TO sidogar_client_user;

--
-- TOC entry 230 (class 1259 OID 26274)
-- Name: kategori_informasi_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.kategori_informasi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategori_informasi_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 230
-- Name: kategori_informasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.kategori_informasi_id_seq OWNED BY public.kategori_informasi.id;


--
-- TOC entry 237 (class 1259 OID 26309)
-- Name: keberatan; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.keberatan (
    id integer NOT NULL,
    permintaan_id integer NOT NULL,
    pemohon_id integer NOT NULL,
    judul text,
    alasan_keberatan text NOT NULL,
    status text DEFAULT 'Diajukan'::text NOT NULL,
    catatan_ppid text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_ppid_id integer
);


ALTER TABLE public.keberatan OWNER TO sidogar_client_user;

--
-- TOC entry 236 (class 1259 OID 26308)
-- Name: keberatan_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.keberatan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keberatan_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 236
-- Name: keberatan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.keberatan_id_seq OWNED BY public.keberatan.id;


--
-- TOC entry 243 (class 1259 OID 26378)
-- Name: keberatan_responses; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.keberatan_responses (
    id integer NOT NULL,
    keberatan_id integer NOT NULL,
    user_id text NOT NULL,
    user_role text NOT NULL,
    user_name text NOT NULL,
    message text NOT NULL,
    attachments text,
    message_type text DEFAULT 'text'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.keberatan_responses OWNER TO sidogar_client_user;

--
-- TOC entry 242 (class 1259 OID 26377)
-- Name: keberatan_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.keberatan_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keberatan_responses_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 242
-- Name: keberatan_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.keberatan_responses_id_seq OWNED BY public.keberatan_responses.id;


--
-- TOC entry 239 (class 1259 OID 26321)
-- Name: pages; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pages OWNER TO sidogar_client_user;

--
-- TOC entry 238 (class 1259 OID 26320)
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pages_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 238
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- TOC entry 221 (class 1259 OID 26218)
-- Name: pemohon; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.pemohon (
    id integer NOT NULL,
    email text NOT NULL,
    hashed_password text NOT NULL,
    nama text NOT NULL,
    nik text,
    no_telepon text,
    alamat text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pemohon OWNER TO sidogar_client_user;

--
-- TOC entry 220 (class 1259 OID 26217)
-- Name: pemohon_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.pemohon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pemohon_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 220
-- Name: pemohon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.pemohon_id_seq OWNED BY public.pemohon.id;


--
-- TOC entry 223 (class 1259 OID 26228)
-- Name: ppid; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.ppid (
    id integer NOT NULL,
    no_pegawai text NOT NULL,
    email text NOT NULL,
    hashed_password text NOT NULL,
    nama text NOT NULL,
    role text DEFAULT 'PPID_PELAKSANA'::text NOT NULL,
    permissions text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ppid OWNER TO sidogar_client_user;

--
-- TOC entry 247 (class 1259 OID 26836)
-- Name: ppid_chats; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.ppid_chats (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    subject text,
    message text NOT NULL,
    attachments text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ppid_chats OWNER TO sidogar_client_user;

--
-- TOC entry 246 (class 1259 OID 26835)
-- Name: ppid_chats_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.ppid_chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ppid_chats_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 246
-- Name: ppid_chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.ppid_chats_id_seq OWNED BY public.ppid_chats.id;


--
-- TOC entry 222 (class 1259 OID 26227)
-- Name: ppid_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.ppid_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ppid_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 222
-- Name: ppid_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.ppid_id_seq OWNED BY public.ppid.id;


--
-- TOC entry 227 (class 1259 OID 26253)
-- Name: request_responses; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.request_responses (
    id integer NOT NULL,
    request_id integer NOT NULL,
    user_id text NOT NULL,
    user_role text NOT NULL,
    user_name text NOT NULL,
    message text NOT NULL,
    attachments text,
    message_type text DEFAULT 'text'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.request_responses OWNER TO sidogar_client_user;

--
-- TOC entry 226 (class 1259 OID 26252)
-- Name: request_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.request_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_responses_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 226
-- Name: request_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.request_responses_id_seq OWNED BY public.request_responses.id;


--
-- TOC entry 225 (class 1259 OID 26239)
-- Name: requests; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.requests (
    id integer NOT NULL,
    pemohon_id integer NOT NULL,
    judul text,
    rincian_informasi text NOT NULL,
    tujuan_penggunaan text NOT NULL,
    cara_memperoleh_informasi text DEFAULT 'Email'::text NOT NULL,
    cara_mendapat_salinan text DEFAULT 'Email'::text NOT NULL,
    status text DEFAULT 'Diajukan'::text NOT NULL,
    catatan_ppid text,
    file_attachments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_ppid_id integer
);


ALTER TABLE public.requests OWNER TO sidogar_client_user;

--
-- TOC entry 224 (class 1259 OID 26238)
-- Name: requests_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requests_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 224
-- Name: requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.requests_id_seq OWNED BY public.requests.id;


--
-- TOC entry 241 (class 1259 OID 26333)
-- Name: settings; Type: TABLE; Schema: public; Owner: sidogar_client_user
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.settings OWNER TO sidogar_client_user;

--
-- TOC entry 240 (class 1259 OID 26332)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: sidogar_client_user
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO sidogar_client_user;

--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 240
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sidogar_client_user
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 4846 (class 2604 OID 26302)
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 26210)
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 26267)
-- Name: chat_sessions id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.chat_sessions ALTER COLUMN id SET DEFAULT nextval('public.chat_sessions_id_seq'::regclass);


--
-- TOC entry 4841 (class 2604 OID 26289)
-- Name: informasi_publik id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.informasi_publik ALTER COLUMN id SET DEFAULT nextval('public.informasi_publik_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 26392)
-- Name: kategori id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.kategori ALTER COLUMN id SET DEFAULT nextval('public.kategori_id_seq'::regclass);


--
-- TOC entry 4838 (class 2604 OID 26278)
-- Name: kategori_informasi id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.kategori_informasi ALTER COLUMN id SET DEFAULT nextval('public.kategori_informasi_id_seq'::regclass);


--
-- TOC entry 4848 (class 2604 OID 26312)
-- Name: keberatan id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan ALTER COLUMN id SET DEFAULT nextval('public.keberatan_id_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 26381)
-- Name: keberatan_responses id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan_responses ALTER COLUMN id SET DEFAULT nextval('public.keberatan_responses_id_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 26324)
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 26221)
-- Name: pemohon id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.pemohon ALTER COLUMN id SET DEFAULT nextval('public.pemohon_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 26231)
-- Name: ppid id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid ALTER COLUMN id SET DEFAULT nextval('public.ppid_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 26839)
-- Name: ppid_chats id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid_chats ALTER COLUMN id SET DEFAULT nextval('public.ppid_chats_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 26256)
-- Name: request_responses id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.request_responses ALTER COLUMN id SET DEFAULT nextval('public.request_responses_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 26242)
-- Name: requests id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.requests ALTER COLUMN id SET DEFAULT nextval('public.requests_id_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 26336)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 5065 (class 0 OID 26197)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4e822a2f-1a6f-48a8-8d52-295a77db0694	f30195c9464635d38c18539f733af90516b866c55b95d9f18b07b78498ceba88	2025-08-18 01:45:29.327791+07	20250817110605_init	\N	\N	2025-08-18 01:45:29.276237+07	1
c5c4024c-a988-4730-a912-d793e00fee64	3f3e241df51deb4bc30afc668bfe8ad97f6c5d77269bc5efaf7146fc48dfdd9e	2025-08-18 01:45:29.335589+07	20250817161745_add_keberatan_responses	\N	\N	2025-08-18 01:45:29.328106+07	1
baddbb6f-659c-40f5-aee1-2cedcc4e73cc	463949c86f949bcdff6b1460176e00c8eff4aad5c5eb143d1371a3bdd89a2255	2025-08-18 01:45:29.338149+07	20250817164146_add_ppid_assignment	\N	\N	2025-08-18 01:45:29.335915+07	1
756ca3fa-0c17-4ab9-8e2a-510366239cb9	a9162443dad9413c9dd0a2792a866ff9f3ca90a207294a56663623828fab2b64	2025-08-18 01:45:36.980675+07	20250817184536_add_missing_fields	\N	\N	2025-08-18 01:45:36.971756+07	1
\.


--
-- TOC entry 5083 (class 0 OID 26299)
-- Dependencies: 235
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.activity_logs (id, action, details, user_id, user_role, ip_address, user_agent, created_at, resource) FROM stdin;
1	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:23.66	\N
2	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:23.942	\N
3	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:26.321	\N
4	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:28.936	\N
5	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:30.175	\N
6	UPDATE_PERMISSIONS	Updated permissions for PPID user 1	1	ADMIN	::1	\N	2025-08-18 03:03:31.232	\N
\.


--
-- TOC entry 5067 (class 0 OID 26207)
-- Dependencies: 219
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.admin (id, email, hashed_password, nama, role, permissions, created_at) FROM stdin;
1	admin@garut.go.id	$2a$10$iJputqSa8PHFYiUiskcQkOG7HJj4Dn9YYEmEoRNfx/3Is5qnFVoKW	Administrator Sistem	ADMIN	\N	2025-08-17 18:46:40.462
\.


--
-- TOC entry 5077 (class 0 OID 26264)
-- Dependencies: 229
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.chat_sessions (id, request_id, is_active, ended_by, ended_at, created_at) FROM stdin;
\.


--
-- TOC entry 5081 (class 0 OID 26286)
-- Dependencies: 233
-- Data for Name: informasi_publik; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.informasi_publik (id, judul, klasifikasi, ringkasan_isi_informasi, file_attachments, links, tanggal_posting, pejabat_penguasa_informasi, status, thumbnail, jadwal_publish, images, created_at, updated_at, created_by) FROM stdin;
1	dddddddddd	dddddddddddd	dddddddddddddd	[{"name":"Application_of_Convolutional_Neural_Network_Method.pdf","url":"/uploads/1755456446161-Application_of_Convolutional_Neural_Network_Method.pdf","size":858680}]	[{"title":"ddddddddddd","url":"https://google.com"}]	2025-08-17 00:00:00	Administrator	published	\N	\N	["/uploads/images/1755456430521-christian-tenguan-RNiK93wcz-U-unsplash__1_.jpg"]	2025-08-17 18:47:26.186	2025-08-17 18:47:26.186	1
2	dddddddddddddd	dddddddddddd	ddddddddddddddddddddddd	\N	\N	2025-08-17 00:00:00	PPID Utama	published	\N	\N	["/uploads/images/1755456430521-christian-tenguan-RNiK93wcz-U-unsplash__1_.jpg"]	2025-08-17 18:47:55.387	2025-08-17 18:47:55.387	1
3	dddddddddddddddddd	dddddddddddd	dddddddddddddddddddddddddd	\N	\N	2025-08-17 00:00:00	PPID Utama	scheduled	\N	\N	["/uploads/images/1755456260364-christian-tenguan-RNiK93wcz-U-unsplash__1_.jpg"]	2025-08-17 18:49:33.109	2025-08-17 18:50:02.924	1
4	dddddddddddd	dddddddddddd	ddddddddddddddddd	\N	\N	2025-08-17 00:00:00	PPID Utama	published	\N	\N	["/uploads/images/1755456659050-j-schiemann-Z4Sxy1_3wdY-unsplash.jpg","/uploads/images/1755456663718-Digital_Sticker_IBM_Granite_Models_for_Software_Development.png"]	2025-08-17 18:51:07.391	2025-08-17 18:51:17.801	1
5	ddddddddddddddddddddddd	dddddddddddd	ddddddddddddd	[{"name":"Application_of_Convolutional_Neural_Network_Method.pdf","url":"/uploads/1755482098770-Application_of_Convolutional_Neural_Network_Method.pdf","size":858680}]	[{"title":"ddddddddddddd","url":"https://google.com"}]	2025-08-18 00:00:00	Administrator	published	\N	\N	["/uploads/images/1755482080377-christian-tenguan-RNiK93wcz-U-unsplash__1_.jpg"]	2025-08-18 01:54:58.799	2025-08-18 01:54:58.799	1
\.


--
-- TOC entry 5093 (class 0 OID 26389)
-- Dependencies: 245
-- Data for Name: kategori; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.kategori (id, nama, deskripsi, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5079 (class 0 OID 26275)
-- Dependencies: 231
-- Data for Name: kategori_informasi; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.kategori_informasi (id, nama, slug, deskripsi, created_at, updated_at) FROM stdin;
1	dddddddddddd	dddddddddddd		2025-08-17 18:47:03.392	2025-08-17 18:47:03.392
\.


--
-- TOC entry 5085 (class 0 OID 26309)
-- Dependencies: 237
-- Data for Name: keberatan; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.keberatan (id, permintaan_id, pemohon_id, judul, alasan_keberatan, status, catatan_ppid, created_at, updated_at, assigned_ppid_id) FROM stdin;
\.


--
-- TOC entry 5091 (class 0 OID 26378)
-- Dependencies: 243
-- Data for Name: keberatan_responses; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.keberatan_responses (id, keberatan_id, user_id, user_role, user_name, message, attachments, message_type, created_at) FROM stdin;
\.


--
-- TOC entry 5087 (class 0 OID 26321)
-- Dependencies: 239
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.pages (id, title, slug, content, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5069 (class 0 OID 26218)
-- Dependencies: 221
-- Data for Name: pemohon; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.pemohon (id, email, hashed_password, nama, nik, no_telepon, alamat, created_at) FROM stdin;
1	pemohon@example.com	$2a$10$iJputqSa8PHFYiUiskcQkOG7HJj4Dn9YYEmEoRNfx/3Is5qnFVoKW	Pemohon Test	3205012345678901	081234567890	Jl. Test No. 123, Garut	2025-08-17 18:46:40.469
\.


--
-- TOC entry 5071 (class 0 OID 26228)
-- Dependencies: 223
-- Data for Name: ppid; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.ppid (id, no_pegawai, email, hashed_password, nama, role, permissions, created_at) FROM stdin;
2	PPID002	ppid.pelaksana@garut.go.id	$2a$10$iJputqSa8PHFYiUiskcQkOG7HJj4Dn9YYEmEoRNfx/3Is5qnFVoKW	PPID Pelaksana Diskominfo	PPID_PELAKSANA	\N	2025-08-17 18:46:40.468
3	PPID003	atasan.ppid@garut.go.id	$2a$10$iJputqSa8PHFYiUiskcQkOG7HJj4Dn9YYEmEoRNfx/3Is5qnFVoKW	Atasan PPID Diskominfo	ATASAN_PPID	\N	2025-08-17 18:46:40.469
1	PPID001	ppid.utama@garut.go.id	$2a$10$iJputqSa8PHFYiUiskcQkOG7HJj4Dn9YYEmEoRNfx/3Is5qnFVoKW	PPID Utama Diskominfo	PPID_UTAMA	{"informasi":true,"kategori":true,"chat":true,"permohonan":true,"keberatan":true,"kelola_akun":true,"manajemen_role":true,"kelola_akses":true,"log_aktivitas":true,"pengaturan":true,"media":true,"profile":true}	2025-08-17 18:46:40.466
\.


--
-- TOC entry 5095 (class 0 OID 26836)
-- Dependencies: 247
-- Data for Name: ppid_chats; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.ppid_chats (id, sender_id, receiver_id, subject, message, attachments, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 5075 (class 0 OID 26253)
-- Dependencies: 227
-- Data for Name: request_responses; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.request_responses (id, request_id, user_id, user_role, user_name, message, attachments, message_type, created_at) FROM stdin;
1	7	1	ADMIN	PPID Officer	dddd	[]	text	2025-08-18 00:45:08.738
2	7	1	System	System	Chat telah diakhiri oleh admin.	[]	system	2025-08-18 00:45:15.323
3	10	1	ADMIN	PPID Officer	hhhhhhhh	[]	text	2025-08-18 01:28:37.763
4	10	1	ADMIN	PPID Officer	hhhhhhhh	[]	text	2025-08-18 02:03:54.539
5	10	1	ADMIN	PPID Officer	hhhhhhhhhh	[{"name":"christian-tenguan-RNiK93wcz-U-unsplash (1).jpg","url":"/uploads/images/1755482641894-christian-tenguan-RNiK93wcz-U-unsplash__1_.jpg","size":952303}]	text	2025-08-18 02:04:01.927
6	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:08:39.596
7	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:09:30.069
8	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:09:51.124
9	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:10:52.923
10	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:11:57.031
11	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:12:44.451
12	1	1	PEMOHON	Test User	Test message	\N	text	2025-08-18 03:13:08.963
\.


--
-- TOC entry 5073 (class 0 OID 26239)
-- Dependencies: 225
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.requests (id, pemohon_id, judul, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, status, catatan_ppid, file_attachments, created_at, updated_at, assigned_ppid_id) FROM stdin;
1	1	\N	Data anggaran pembangunan jalan tahun 2024	Penelitian akademik	Email	Email	Diajukan	\N	\N	2025-08-18 00:44:55.618	2025-08-18 00:44:55.618	\N
2	1	\N	Laporan keuangan daerah semester 1 tahun 2024	Monitoring transparansi	Mengambil Langsung	Mengambil Langsung	Diproses	\N	\N	2025-08-18 00:44:55.621	2025-08-18 00:44:55.621	\N
3	1	\N	Data jumlah penduduk per kecamatan	Analisis demografi	Email	Email	Selesai	\N	\N	2025-08-18 00:44:55.622	2025-08-18 00:44:55.622	\N
4	1	\N	Dokumen RPJMD Kabupaten Garut 2023-2028	Studi kebijakan publik	Email	Pos	Diajukan	\N	\N	2025-08-18 00:44:55.623	2025-08-18 00:44:55.623	\N
5	1	\N	Data realisasi PAD tahun 2023	Analisis ekonomi daerah	Mengambil Langsung	Email	Ditolak	\N	\N	2025-08-18 00:44:55.624	2025-08-18 00:44:55.624	\N
6	1	\N	Informasi tender proyek infrastruktur 2024	Monitoring pengadaan	Email	Email	Diproses	\N	\N	2025-08-18 00:44:55.624	2025-08-18 00:44:55.624	\N
8	1	\N	Laporan kinerja OPD tahun 2023	Evaluasi kinerja	Mengambil Langsung	Mengambil Langsung	Selesai	\N	\N	2025-08-18 00:44:55.626	2025-08-18 00:44:55.626	\N
9	1	\N	Data program bantuan sosial tahun 2024	Monitoring program sosial	Email	Email	Diajukan	\N	\N	2025-08-18 00:44:55.627	2025-08-18 00:44:55.627	\N
7	1	\N	Data kepegawaian ASN di lingkungan Pemkab Garut	Penelitian SDM	Email	Fax	Ditanggapi	\N	\N	2025-08-18 00:44:55.625	2025-08-18 00:45:15.323	\N
10	1	\N	Dokumen peraturan daerah terbaru	Studi hukum	Email	Pos	Ditanggapi	\N	\N	2025-08-18 00:44:55.627	2025-08-18 02:04:01.927	\N
\.


--
-- TOC entry 5089 (class 0 OID 26333)
-- Dependencies: 241
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: sidogar_client_user
--

COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
2	header	{"menuItems":[{"label":"Beranda","url":"/","hasDropdown":false,"dropdownItems":[]},{"label":"Profil","url":"/profil","hasDropdown":true,"dropdownItems":[{"label":"Tentang PPID","url":"/profil"},{"label":"Visi Misi","url":"/visi-misi"},{"label":"Struktur Organisasi","url":"/struktur"}]},{"label":"Informasi Publik","url":"/informasi","hasDropdown":false,"dropdownItems":[]},{"label":"Layanan","url":"/layanan","hasDropdown":true,"dropdownItems":[{"label":"Permohonan Informasi","url":"/permohonan"},{"label":"Keberatan","url":"/keberatan"}]}]}	2025-08-18 00:25:15.58	2025-08-18 02:17:17.701
3	footer	{"companyName":"PPID Kabupaten Garut","description":"PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.","address":"Jl. Pembangunan No. 1, Garut, Jawa Barat","phone":"(0262) 123456","email":"ppid@garutkab.go.id","socialMedia":{"facebook":"","twitter":"","instagram":"","youtube":""},"quickLinks":[{"label":"Beranda","url":"/"},{"label":"Profil PPID","url":"/profil"},{"label":"DIP","url":"/dip"},{"label":"Kontak","url":"/kontak"}],"copyrightText":"PPID Kabupaten Garut. Semua hak dilindungi.","showAddress":true,"showContact":true,"showSocialMedia":true}	2025-08-18 00:25:15.581	2025-08-18 02:17:17.72
4	hero	{"title":"Selamat Datang di PPID Kabupaten Garut","subtitle":"Pejabat Pengelola Informasi dan Dokumentasi","description":"Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.","backgroundImage":"","ctaText":"Ajukan Permohonan","ctaUrl":"/permohonan","isCarousel":false,"autoSlide":true,"slideInterval":4000,"slides":[]}	2025-08-18 00:25:15.582	2025-08-18 02:17:17.739
1	general	{"namaInstansi":"PPID Diskominfo Kabupaten Garut","logo":"/logo-garut.svg","email":"ppid@garutkab.go.id","telepon":"(0262) 123456","alamat":"Jl. Pembangunan No. 1, Garut, Jawa Barat","websiteTitle":"PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik","websiteDescription":"Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008."}	2025-08-18 00:25:15.342	2025-08-18 02:17:17.684
\.


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 234
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 6, true);


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 218
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.admin_id_seq', 1, true);


--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 228
-- Name: chat_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.chat_sessions_id_seq', 1, false);


--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 232
-- Name: informasi_publik_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.informasi_publik_id_seq', 5, true);


--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 244
-- Name: kategori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.kategori_id_seq', 1, false);


--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 230
-- Name: kategori_informasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.kategori_informasi_id_seq', 1, true);


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 236
-- Name: keberatan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.keberatan_id_seq', 1, false);


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 242
-- Name: keberatan_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.keberatan_responses_id_seq', 1, false);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 238
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.pages_id_seq', 1, false);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 220
-- Name: pemohon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.pemohon_id_seq', 1, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 246
-- Name: ppid_chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.ppid_chats_id_seq', 1, false);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 222
-- Name: ppid_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.ppid_id_seq', 3, true);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 226
-- Name: request_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.request_responses_id_seq', 12, true);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 224
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.requests_id_seq', 10, true);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 240
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sidogar_client_user
--

SELECT pg_catalog.setval('public.settings_id_seq', 40, true);


--
-- TOC entry 4869 (class 2606 OID 26205)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 26307)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 26216)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 26273)
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 26297)
-- Name: informasi_publik informasi_publik_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.informasi_publik
    ADD CONSTRAINT informasi_publik_pkey PRIMARY KEY (id);


--
-- TOC entry 4889 (class 2606 OID 26284)
-- Name: kategori_informasi kategori_informasi_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.kategori_informasi
    ADD CONSTRAINT kategori_informasi_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 26398)
-- Name: kategori kategori_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.kategori
    ADD CONSTRAINT kategori_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 26319)
-- Name: keberatan keberatan_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan
    ADD CONSTRAINT keberatan_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 26387)
-- Name: keberatan_responses keberatan_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan_responses
    ADD CONSTRAINT keberatan_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 26331)
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 26226)
-- Name: pemohon pemohon_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.pemohon
    ADD CONSTRAINT pemohon_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 26845)
-- Name: ppid_chats ppid_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid_chats
    ADD CONSTRAINT ppid_chats_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 26237)
-- Name: ppid ppid_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid
    ADD CONSTRAINT ppid_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 26262)
-- Name: request_responses request_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.request_responses
    ADD CONSTRAINT request_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 26251)
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 26342)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 1259 OID 26343)
-- Name: admin_email_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX admin_email_key ON public.admin USING btree (email);


--
-- TOC entry 4886 (class 1259 OID 26347)
-- Name: chat_sessions_request_id_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX chat_sessions_request_id_key ON public.chat_sessions USING btree (request_id);


--
-- TOC entry 4887 (class 1259 OID 26348)
-- Name: kategori_informasi_nama_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX kategori_informasi_nama_key ON public.kategori_informasi USING btree (nama);


--
-- TOC entry 4890 (class 1259 OID 26349)
-- Name: kategori_informasi_slug_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX kategori_informasi_slug_key ON public.kategori_informasi USING btree (slug);


--
-- TOC entry 4905 (class 1259 OID 26399)
-- Name: kategori_nama_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX kategori_nama_key ON public.kategori USING btree (nama);


--
-- TOC entry 4899 (class 1259 OID 26350)
-- Name: pages_slug_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);


--
-- TOC entry 4873 (class 1259 OID 26344)
-- Name: pemohon_email_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX pemohon_email_key ON public.pemohon USING btree (email);


--
-- TOC entry 4876 (class 1259 OID 26346)
-- Name: ppid_email_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX ppid_email_key ON public.ppid USING btree (email);


--
-- TOC entry 4877 (class 1259 OID 26345)
-- Name: ppid_no_pegawai_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX ppid_no_pegawai_key ON public.ppid USING btree (no_pegawai);


--
-- TOC entry 4900 (class 1259 OID 26351)
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: sidogar_client_user
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- TOC entry 4913 (class 2606 OID 26362)
-- Name: chat_sessions chat_sessions_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4914 (class 2606 OID 26851)
-- Name: keberatan keberatan_assigned_ppid_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan
    ADD CONSTRAINT keberatan_assigned_ppid_id_fkey FOREIGN KEY (assigned_ppid_id) REFERENCES public.ppid(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4915 (class 2606 OID 26372)
-- Name: keberatan keberatan_pemohon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan
    ADD CONSTRAINT keberatan_pemohon_id_fkey FOREIGN KEY (pemohon_id) REFERENCES public.pemohon(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4916 (class 2606 OID 26367)
-- Name: keberatan keberatan_permintaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan
    ADD CONSTRAINT keberatan_permintaan_id_fkey FOREIGN KEY (permintaan_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4917 (class 2606 OID 26400)
-- Name: keberatan_responses keberatan_responses_keberatan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.keberatan_responses
    ADD CONSTRAINT keberatan_responses_keberatan_id_fkey FOREIGN KEY (keberatan_id) REFERENCES public.keberatan(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4918 (class 2606 OID 26861)
-- Name: ppid_chats ppid_chats_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid_chats
    ADD CONSTRAINT ppid_chats_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.ppid(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4919 (class 2606 OID 26856)
-- Name: ppid_chats ppid_chats_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.ppid_chats
    ADD CONSTRAINT ppid_chats_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.ppid(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4912 (class 2606 OID 26357)
-- Name: request_responses request_responses_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.request_responses
    ADD CONSTRAINT request_responses_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4910 (class 2606 OID 26846)
-- Name: requests requests_assigned_ppid_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_assigned_ppid_id_fkey FOREIGN KEY (assigned_ppid_id) REFERENCES public.ppid(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4911 (class 2606 OID 26352)
-- Name: requests requests_pemohon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sidogar_client_user
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pemohon_id_fkey FOREIGN KEY (pemohon_id) REFERENCES public.pemohon(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: sidogar_client_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-08-19 08:46:07

--
-- PostgreSQL database dump complete
--

