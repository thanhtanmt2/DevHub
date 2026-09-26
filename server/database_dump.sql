--
-- PostgreSQL database dump
--

\restrict JtK1BZSeJw7jltV9J0uDqvQy2t67gpyMUec93RDypDpc7kfITEaKMpqys2ekUk2

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

ALTER TABLE IF EXISTS ONLY public.workspaces DROP CONSTRAINT IF EXISTS workspaces_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_project_job_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_workspace_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_submissions DROP CONSTRAINT IF EXISTS task_submissions_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_created_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_jobs DROP CONSTRAINT IF EXISTS project_jobs_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_job_skills DROP CONSTRAINT IF EXISTS project_job_skills_skill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_job_skills DROP CONSTRAINT IF EXISTS project_job_skills_project_job_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_applications DROP CONSTRAINT IF EXISTS project_applications_project_job_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_applications DROP CONSTRAINT IF EXISTS project_applications_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_information DROP CONSTRAINT IF EXISTS payment_information_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_posts DROP CONSTRAINT IF EXISTS job_posts_created_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_posts DROP CONSTRAINT IF EXISTS job_posts_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_post_skills DROP CONSTRAINT IF EXISTS job_post_skills_skill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_post_skills DROP CONSTRAINT IF EXISTS job_post_skills_job_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.experiences DROP CONSTRAINT IF EXISTS experiences_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_skills DROP CONSTRAINT IF EXISTS candidate_skills_skill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_skills DROP CONSTRAINT IF EXISTS candidate_skills_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_evaluations DROP CONSTRAINT IF EXISTS candidate_evaluations_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_cvs DROP CONSTRAINT IF EXISTS candidate_cvs_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_job_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_candidate_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_status_history DROP CONSTRAINT IF EXISTS application_status_history_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
DROP INDEX IF EXISTS public.activity_logs_user_id;
DROP INDEX IF EXISTS public.activity_logs_entity_type_entity_id;
DROP INDEX IF EXISTS public.activity_logs_created_at;
DROP INDEX IF EXISTS public.activity_logs_action;
ALTER TABLE IF EXISTS ONLY public.workspaces DROP CONSTRAINT IF EXISTS workspaces_project_id_key;
ALTER TABLE IF EXISTS ONLY public.workspaces DROP CONSTRAINT IF EXISTS workspaces_pkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.task_submissions DROP CONSTRAINT IF EXISTS task_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_task_id_workspace_member_id_key;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_pkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_pkey;
ALTER TABLE IF EXISTS ONLY public.sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_pkey;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_name_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.project_jobs DROP CONSTRAINT IF EXISTS project_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.project_job_skills DROP CONSTRAINT IF EXISTS project_job_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.project_applications DROP CONSTRAINT IF EXISTS project_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_information DROP CONSTRAINT IF EXISTS payment_information_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_information DROP CONSTRAINT IF EXISTS payment_information_candidate_profile_id_key;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.job_posts DROP CONSTRAINT IF EXISTS job_posts_pkey;
ALTER TABLE IF EXISTS ONLY public.job_post_skills DROP CONSTRAINT IF EXISTS job_post_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.experiences DROP CONSTRAINT IF EXISTS experiences_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_user_id_key;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_tax_code_key;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.candidate_skills DROP CONSTRAINT IF EXISTS candidate_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.candidate_evaluations DROP CONSTRAINT IF EXISTS candidate_evaluations_workspace_member_id_key;
ALTER TABLE IF EXISTS ONLY public.candidate_evaluations DROP CONSTRAINT IF EXISTS candidate_evaluations_pkey;
ALTER TABLE IF EXISTS ONLY public.candidate_cvs DROP CONSTRAINT IF EXISTS candidate_cvs_pkey;
ALTER TABLE IF EXISTS ONLY public.applications DROP CONSTRAINT IF EXISTS applications_pkey;
ALTER TABLE IF EXISTS ONLY public.application_status_history DROP CONSTRAINT IF EXISTS application_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
DROP TABLE IF EXISTS public.workspaces;
DROP TABLE IF EXISTS public.workspace_members;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.task_submissions;
DROP TABLE IF EXISTS public.task_comments;
DROP TABLE IF EXISTS public.task_assignees;
DROP TABLE IF EXISTS public.task_activities;
DROP TABLE IF EXISTS public.sub_tasks;
DROP TABLE IF EXISTS public.skills;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.project_jobs;
DROP TABLE IF EXISTS public.project_job_skills;
DROP TABLE IF EXISTS public.project_applications;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.payment_information;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.job_posts;
DROP TABLE IF EXISTS public.job_post_skills;
DROP TABLE IF EXISTS public.experiences;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public.candidate_skills;
DROP TABLE IF EXISTS public.candidate_profiles;
DROP TABLE IF EXISTS public.candidate_evaluations;
DROP TABLE IF EXISTS public.candidate_cvs;
DROP TABLE IF EXISTS public.applications;
DROP TABLE IF EXISTS public.application_status_history;
DROP TABLE IF EXISTS public.activity_logs;
DROP TYPE IF EXISTS public.enum_workspaces_status;
DROP TYPE IF EXISTS public.enum_workspace_members_status;
DROP TYPE IF EXISTS public.enum_workspace_members_role;
DROP TYPE IF EXISTS public.enum_users_status;
DROP TYPE IF EXISTS public.enum_tasks_status;
DROP TYPE IF EXISTS public.enum_tasks_review_status;
DROP TYPE IF EXISTS public.enum_tasks_priority;
DROP TYPE IF EXISTS public.enum_task_submissions_review_status;
DROP TYPE IF EXISTS public.enum_skills_status;
DROP TYPE IF EXISTS public.enum_projects_status;
DROP TYPE IF EXISTS public.enum_project_jobs_status;
DROP TYPE IF EXISTS public.enum_project_applications_status;
DROP TYPE IF EXISTS public.enum_payments_status;
DROP TYPE IF EXISTS public.enum_payment_information_status;
DROP TYPE IF EXISTS public.enum_notifications_type;
DROP TYPE IF EXISTS public.enum_job_posts_work_type;
DROP TYPE IF EXISTS public.enum_job_posts_status;
DROP TYPE IF EXISTS public.enum_job_posts_post_type;
DROP TYPE IF EXISTS public.enum_companies_verification_status;
DROP TYPE IF EXISTS public.enum_candidate_skills_level;
DROP TYPE IF EXISTS public.enum_applications_status;
DROP TYPE IF EXISTS public.enum_activity_logs_action;
--
-- Name: enum_activity_logs_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_activity_logs_action AS ENUM (
    'USER_REGISTER',
    'USER_LOGIN',
    'USER_LOGOUT',
    'PASSWORD_CHANGED',
    'USER_STATUS_CHANGED',
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_STATUS_CHANGED',
    'TASK_DELETED',
    'TASK_APPROVED',
    'TASK_REVISION_REQUESTED',
    'TASK_COMMENTED',
    'SUBTASK_ADDED',
    'SUBTASK_TOGGLED',
    'WORKSPACE_MEMBER_ADDED',
    'WORKSPACE_MEMBER_REMOVED',
    'WORKSPACE_MEMBER_ROLE_CHANGED',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'PROJECT_MANAGER_ASSIGNED',
    'PROJECT_CLOSED',
    'APPLICATION_SUBMITTED',
    'APPLICATION_STATUS_CHANGED',
    'INTERVIEW_SCHEDULED',
    'PAYMENT_CREATED',
    'PAYMENT_PROCESSED',
    'MEMBER_EVALUATED'
);


ALTER TYPE public.enum_activity_logs_action OWNER TO postgres;

--
-- Name: enum_applications_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_applications_status AS ENUM (
    'PENDING',
    'VIEWED',
    'INTERVIEW',
    'HIRED',
    'REJECTED'
);


ALTER TYPE public.enum_applications_status OWNER TO postgres;

--
-- Name: enum_candidate_skills_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_candidate_skills_level AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'EXPERT'
);


ALTER TYPE public.enum_candidate_skills_level OWNER TO postgres;

--
-- Name: enum_companies_verification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_companies_verification_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public.enum_companies_verification_status OWNER TO postgres;

--
-- Name: enum_job_posts_post_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_job_posts_post_type AS ENUM (
    'INTERNAL',
    'PARTNER'
);


ALTER TYPE public.enum_job_posts_post_type OWNER TO postgres;

--
-- Name: enum_job_posts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_job_posts_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'OPEN',
    'HIDDEN',
    'CLOSED'
);


ALTER TYPE public.enum_job_posts_status OWNER TO postgres;

--
-- Name: enum_job_posts_work_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_job_posts_work_type AS ENUM (
    'FREELANCE',
    'PART_TIME',
    'REMOTE',
    'FULL_TIME'
);


ALTER TYPE public.enum_job_posts_work_type OWNER TO postgres;

--
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'TASK_ASSIGNED',
    'TASK_STATUS_CHANGED',
    'TASK_APPROVED',
    'TASK_REVISION',
    'TASK_COMMENT',
    'TASK_DEADLINE_SOON',
    'MEMBER_ADDED',
    'MEMBER_ROLE_CHANGED',
    'PROJECT_UPDATE',
    'INTERVIEW_SCHEDULED',
    'APPLICATION_STATUS'
);


ALTER TYPE public.enum_notifications_type OWNER TO postgres;

--
-- Name: enum_payment_information_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payment_information_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_payment_information_status OWNER TO postgres;

--
-- Name: enum_payments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payments_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED'
);


ALTER TYPE public.enum_payments_status OWNER TO postgres;

--
-- Name: enum_project_applications_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_project_applications_status AS ENUM (
    'PENDING',
    'REVIEWING',
    'ACCEPTED',
    'REJECTED',
    'INTERVIEW'
);


ALTER TYPE public.enum_project_applications_status OWNER TO postgres;

--
-- Name: enum_project_jobs_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_project_jobs_status AS ENUM (
    'OPEN',
    'CLOSED'
);


ALTER TYPE public.enum_project_jobs_status OWNER TO postgres;

--
-- Name: enum_projects_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_projects_status AS ENUM (
    'PLANNING',
    'RECRUITING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.enum_projects_status OWNER TO postgres;

--
-- Name: enum_skills_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_skills_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_skills_status OWNER TO postgres;

--
-- Name: enum_task_submissions_review_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_task_submissions_review_status AS ENUM (
    'PENDING_REVIEW',
    'ACCEPTED',
    'REVISION_REQUIRED'
);


ALTER TYPE public.enum_task_submissions_review_status OWNER TO postgres;

--
-- Name: enum_tasks_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_priority AS ENUM (
    'URGENT',
    'HIGH',
    'MEDIUM',
    'LOW'
);


ALTER TYPE public.enum_tasks_priority OWNER TO postgres;

--
-- Name: enum_tasks_review_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_review_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REVISION_REQUIRED'
);


ALTER TYPE public.enum_tasks_review_status OWNER TO postgres;

--
-- Name: enum_tasks_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tasks_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public.enum_tasks_status OWNER TO postgres;

--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_status AS ENUM (
    'ACTIVE',
    'LOCKED',
    'INACTIVE'
);


ALTER TYPE public.enum_users_status OWNER TO postgres;

--
-- Name: enum_workspace_members_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_workspace_members_role AS ENUM (
    'MANAGER',
    'LEAD',
    'MEMBER',
    'VIEWER'
);


ALTER TYPE public.enum_workspace_members_role OWNER TO postgres;

--
-- Name: enum_workspace_members_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_workspace_members_status AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'REMOVED'
);


ALTER TYPE public.enum_workspace_members_status OWNER TO postgres;

--
-- Name: enum_workspaces_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_workspaces_status AS ENUM (
    'ACTIVE',
    'CLOSED',
    'ARCHIVED'
);


ALTER TYPE public.enum_workspaces_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id uuid NOT NULL,
    user_id uuid,
    user_name character varying(255),
    user_role character varying(50),
    action public.enum_activity_logs_action NOT NULL,
    entity_type character varying(50),
    entity_id uuid,
    entity_name character varying(500),
    old_value text,
    new_value text,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address character varying(50),
    user_agent character varying(500),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: application_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_status_history (
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    note text,
    changed_at timestamp with time zone
);


ALTER TABLE public.application_status_history OWNER TO postgres;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    job_post_id uuid NOT NULL,
    cover_letter text,
    cv_url character varying(500),
    status public.enum_applications_status DEFAULT 'PENDING'::public.enum_applications_status,
    applied_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: candidate_cvs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_cvs (
    id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.candidate_cvs OWNER TO postgres;

--
-- Name: candidate_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_evaluations (
    id uuid NOT NULL,
    workspace_member_id uuid NOT NULL,
    score numeric(4,2) NOT NULL,
    comment text,
    evaluated_at timestamp with time zone
);


ALTER TABLE public.candidate_evaluations OWNER TO postgres;

--
-- Name: candidate_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_profiles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    professional_title character varying(150),
    introduction text,
    phone character varying(20),
    address character varying(255),
    github_url character varying(500),
    portfolio_url character varying(500),
    avatar_url character varying(500),
    cv_url character varying(500),
    cv_name character varying(255),
    competency_score numeric(4,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.candidate_profiles OWNER TO postgres;

--
-- Name: candidate_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_skills (
    candidate_profile_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    level public.enum_candidate_skills_level DEFAULT 'BEGINNER'::public.enum_candidate_skills_level,
    years_of_experience numeric(4,1) DEFAULT 0
);


ALTER TABLE public.candidate_skills OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    tax_code character varying(20) NOT NULL,
    address character varying(255) NOT NULL,
    email character varying(255),
    website character varying(500),
    logo_url character varying(500),
    description text,
    verification_status public.enum_companies_verification_status DEFAULT 'PENDING'::public.enum_companies_verification_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: experiences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiences (
    id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    job_title character varying(150) NOT NULL,
    company_name character varying(200) NOT NULL,
    start_date date,
    end_date date,
    description text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.experiences OWNER TO postgres;

--
-- Name: job_post_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_post_skills (
    job_post_id uuid NOT NULL,
    skill_id uuid NOT NULL
);


ALTER TABLE public.job_post_skills OWNER TO postgres;

--
-- Name: job_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_posts (
    id uuid NOT NULL,
    created_by_user_id uuid NOT NULL,
    company_id uuid,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    post_type public.enum_job_posts_post_type NOT NULL,
    work_type public.enum_job_posts_work_type,
    location character varying(255),
    salary_min numeric(15,2),
    salary_max numeric(15,2),
    quantity integer DEFAULT 1,
    posted_at timestamp with time zone,
    deadline timestamp with time zone,
    status public.enum_job_posts_status DEFAULT 'DRAFT'::public.enum_job_posts_status,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.job_posts OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    type public.enum_notifications_type NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    link character varying(500),
    is_read boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: payment_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_information (
    id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    account_holder_name character varying(150) NOT NULL,
    bank_name character varying(150) NOT NULL,
    account_number character varying(50) NOT NULL,
    status public.enum_payment_information_status DEFAULT 'ACTIVE'::public.enum_payment_information_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payment_information OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    workspace_member_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_method character varying(30),
    transaction_code character varying(100),
    status public.enum_payments_status DEFAULT 'PENDING'::public.enum_payments_status,
    paid_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: project_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_applications (
    id uuid NOT NULL,
    project_job_id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    cover_letter text,
    cv_url character varying(500),
    status public.enum_project_applications_status DEFAULT 'PENDING'::public.enum_project_applications_status,
    interview_time timestamp with time zone,
    meet_url character varying(500),
    interview_note text,
    applied_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_applications OWNER TO postgres;

--
-- Name: project_job_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_job_skills (
    project_job_id uuid NOT NULL,
    skill_id uuid NOT NULL
);


ALTER TABLE public.project_job_skills OWNER TO postgres;

--
-- Name: project_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_jobs (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    budget numeric(15,2),
    quantity integer DEFAULT 1,
    deadline timestamp with time zone,
    status public.enum_project_jobs_status DEFAULT 'OPEN'::public.enum_project_jobs_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_jobs OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    budget numeric(15,2),
    start_date date,
    expected_end_date date,
    actual_end_date date,
    status public.enum_projects_status DEFAULT 'PLANNING'::public.enum_projects_status,
    completion_rate numeric(5,2) DEFAULT 0,
    created_by_user_id uuid,
    manager_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    status public.enum_skills_status DEFAULT 'ACTIVE'::public.enum_skills_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- Name: sub_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_tasks (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    is_done boolean DEFAULT false,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sub_tasks OWNER TO postgres;

--
-- Name: task_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_activities (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    workspace_member_id uuid,
    action character varying(100) NOT NULL,
    old_value text,
    new_value text,
    description character varying(500),
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.task_activities OWNER TO postgres;

--
-- Name: task_assignees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_assignees (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    workspace_member_id uuid NOT NULL
);


ALTER TABLE public.task_assignees OWNER TO postgres;

--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_comments (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    workspace_member_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.task_comments OWNER TO postgres;

--
-- Name: task_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_submissions (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    product_url character varying(500),
    attachment_url character varying(500),
    note text,
    version integer DEFAULT 1,
    review_status public.enum_task_submissions_review_status DEFAULT 'PENDING_REVIEW'::public.enum_task_submissions_review_status,
    submitted_at timestamp with time zone
);


ALTER TABLE public.task_submissions OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    priority public.enum_tasks_priority DEFAULT 'MEDIUM'::public.enum_tasks_priority,
    status public.enum_tasks_status DEFAULT 'TODO'::public.enum_tasks_status,
    labels character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    deadline timestamp with time zone,
    estimated_hours numeric(6,2),
    actual_hours numeric(6,2),
    completion_rate smallint DEFAULT 0,
    "position" integer DEFAULT 0,
    review_note text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_status public.enum_tasks_review_status DEFAULT 'PENDING'::public.enum_tasks_review_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    status public.enum_users_status DEFAULT 'INACTIVE'::public.enum_users_status,
    email_verified boolean DEFAULT false,
    email_verify_token character varying(255),
    reset_password_token character varying(255),
    reset_password_expires timestamp with time zone,
    refresh_token text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspace_members (
    id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    candidate_profile_id uuid NOT NULL,
    project_job_id uuid,
    role public.enum_workspace_members_role DEFAULT 'MEMBER'::public.enum_workspace_members_role,
    joined_at timestamp with time zone,
    status public.enum_workspace_members_status DEFAULT 'ACTIVE'::public.enum_workspace_members_status
);


ALTER TABLE public.workspace_members OWNER TO postgres;

--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspaces (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    status public.enum_workspaces_status DEFAULT 'ACTIVE'::public.enum_workspaces_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.workspaces OWNER TO postgres;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.activity_logs VALUES ('0326c599-bf70-46ee-8b8b-c6ba83f97582', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:35:04.88+07');
INSERT INTO public.activity_logs VALUES ('2b011a9f-16cd-4028-8dab-0e79b5dcb886', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:35:28.466+07');
INSERT INTO public.activity_logs VALUES ('48c26a9e-2314-4557-93f9-c944f2736628', NULL, 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_REGISTER', 'user', '96087a5f-26a7-4d0f-9962-1ca2a16fe787', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  (23110282@student.hcmute.edu.vn) đã đăng ký tài khoản mới với vai trò CANDIDATE', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:44:38.68+07');
INSERT INTO public.activity_logs VALUES ('89cabce3-ac80-434b-91e7-e42a63f28c31', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_REGISTER', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  (23110282@student.hcmute.edu.vn) đã đăng ký tài khoản mới với vai trò CANDIDATE', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:50:43.664+07');
INSERT INTO public.activity_logs VALUES ('05c41612-ad93-41b9-b585-8f4e9ae1a789', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGIN', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:55:23.098+07');
INSERT INTO public.activity_logs VALUES ('6573c554-39c7-4bb7-8154-8b96e6865d08', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGOUT', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:55:34.549+07');
INSERT INTO public.activity_logs VALUES ('2ed45ee1-c40a-4e6e-891b-40a717b580c9', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGIN', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:57:30.04+07');
INSERT INTO public.activity_logs VALUES ('b6ac8c60-93d6-4f9d-87e2-5f1e793acaac', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGOUT', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 17:57:46.271+07');
INSERT INTO public.activity_logs VALUES ('3304b7fe-a90d-4e80-b246-5ac1a8815746', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGIN', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', '2026-09-26 18:05:30.676+07');
INSERT INTO public.activity_logs VALUES ('368cee57-7590-45e9-beea-05bb21001462', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGOUT', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', '2026-09-26 18:05:38.733+07');
INSERT INTO public.activity_logs VALUES ('a76a5755-0284-4940-9d82-c570643b3439', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', 'CANDIDATE', 'USER_LOGOUT', 'user', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', 'Đào Minh Nhựt ', NULL, NULL, 'Đào Minh Nhựt  đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 18:35:25.24+07');


--
-- Data for Name: application_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.applications VALUES ('5d562f3d-64d8-414b-a102-38ad03b3f4ad', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '0e526c0e-86d8-4579-ba90-150c5d7b58f7', 'Tôi rất thích môi trường chuyên nghiệp tại FPT Software và mong muốn được cống hiến lâu dài.', NULL, 'VIEWED', '2026-09-26 17:32:17.255+07', '2026-09-26 17:32:17.255+07');


--
-- Data for Name: candidate_cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: candidate_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate_profiles VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Fullstack Web Developer', 'Đam mê lập trình web với React và Node.js, có 2 năm kinh nghiệm.', NULL, NULL, 'https://github.com/nguyenvandev', NULL, NULL, 'https://example.com/cvs/CV_Nguyen_Van_Dev_Fullstack.pdf', 'CV_Nguyen_Van_Dev_Fullstack.pdf', 8.50, '2026-09-26 17:32:17.237+07', '2026-09-26 17:32:17.237+07');
INSERT INTO public.candidate_profiles VALUES ('f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', '4e332674-295d-444c-a507-2d60b50f1be1', 'Frontend Developer', 'Chuyên gia React, UI/UX, thích viết code sạch.', NULL, NULL, 'https://github.com/lethicode', NULL, NULL, 'https://example.com/cvs/CV_Le_Thi_Code_React.pdf', 'CV_Le_Thi_Code_React.pdf', 9.00, '2026-09-26 17:32:17.237+07', '2026-09-26 17:32:17.237+07');
INSERT INTO public.candidate_profiles VALUES ('2c5056d1-7578-4c20-b657-483d737cc3c9', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, '2026-09-26 17:55:23.246+07', '2026-09-26 17:55:23.246+07');


--
-- Data for Name: candidate_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'd1009b02-93eb-4707-8468-62345af8c63a', 'ADVANCED', 2.0);
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'c68921a4-bd99-456e-9582-44e1f367028a', 'INTERMEDIATE', 1.5);
INSERT INTO public.candidate_skills VALUES ('f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'd1009b02-93eb-4707-8468-62345af8c63a', 'EXPERT', 3.0);


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies VALUES ('70ea000b-37fd-428f-b400-d22be6184df2', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'FPT Software', '0101248141', 'F-Town 3, Quận 9, TP.HCM', 'tuyendung@fpt.com', 'https://fptsoftware.com', NULL, 'Tập đoàn công nghệ hàng đầu Việt Nam', 'VERIFIED', '2026-09-26 17:32:17.232+07', '2026-09-26 17:32:17.232+07');


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: job_post_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.job_post_skills VALUES ('0e526c0e-86d8-4579-ba90-150c5d7b58f7', 'd1009b02-93eb-4707-8468-62345af8c63a');
INSERT INTO public.job_post_skills VALUES ('9146785e-fd1e-476c-a82d-3546251da74d', 'c68921a4-bd99-456e-9582-44e1f367028a');


--
-- Data for Name: job_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.job_posts VALUES ('0e526c0e-86d8-4579-ba90-150c5d7b58f7', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', '70ea000b-37fd-428f-b400-d22be6184df2', 'Senior React Developer (Toàn thời gian)', 'FPT Software tuyển dụng Senior React Developer tham gia dự án thương mại điện tử quốc tế. Cơ hội thăng tiến và chế độ đãi ngộ hấp dẫn.', 'PARTNER', 'FULL_TIME', 'TP. Hồ Chí Minh', 25000000.00, 40000000.00, 2, '2026-09-26 17:32:17.248+07', NULL, 'OPEN', 0, '2026-09-26 17:32:17.248+07', '2026-09-26 17:32:17.248+07');
INSERT INTO public.job_posts VALUES ('9146785e-fd1e-476c-a82d-3546251da74d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', '70ea000b-37fd-428f-b400-d22be6184df2', 'Backend Node.js Engineer (Remote)', 'Tuyển kỹ sư Backend thành thạo Node.js, Express, PostgreSQL. Làm việc từ xa linh hoạt, đánh giá theo hiệu quả công việc.', 'PARTNER', 'REMOTE', 'Toàn quốc', 20000000.00, 35000000.00, 3, '2026-09-26 17:32:17.248+07', NULL, 'OPEN', 0, '2026-09-26 17:32:17.248+07', '2026-09-26 17:32:17.248+07');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: payment_information; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payments VALUES ('e3974730-24e1-4d18-9978-d94634d754da', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 4000000.00, NULL, NULL, 'PAID', '2026-09-26 17:32:17.289+07', '2026-09-26 17:32:17.289+07');


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_applications VALUES ('00d5f656-85b1-4e4b-abcf-dd7f2c609f5f', '986306d2-ccda-42e3-bf64-d6f894ec68bb', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'Tôi có nhiều kinh nghiệm làm giao diện React Dashboard và cam kết hoàn thành đúng deadline.', NULL, 'ACCEPTED', NULL, NULL, NULL, '2026-09-26 17:32:17.268+07', '2026-09-26 17:32:17.268+07');
INSERT INTO public.project_applications VALUES ('08d927df-9d37-4554-8959-504f718dc0f2', 'ba2deb92-cee0-401d-b797-4d862a7d3e70', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Tôi thành thạo Node.js và PostgreSQL, tự tin làm tốt hệ thống này.', NULL, 'PENDING', NULL, NULL, NULL, '2026-09-26 17:32:17.268+07', '2026-09-26 17:32:17.268+07');


--
-- Data for Name: project_job_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_job_skills VALUES ('986306d2-ccda-42e3-bf64-d6f894ec68bb', 'd1009b02-93eb-4707-8468-62345af8c63a');
INSERT INTO public.project_job_skills VALUES ('ba2deb92-cee0-401d-b797-4d862a7d3e70', 'c68921a4-bd99-456e-9582-44e1f367028a');


--
-- Data for Name: project_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_jobs VALUES ('986306d2-ccda-42e3-bf64-d6f894ec68bb', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Frontend React Developer (Dự án Kho)', 'Xây dựng giao diện Dashboard, Kanban điều phối và bảng kê kho bằng React + Tailwind CSS. Thời gian dự kiến 1 tháng.', 12000000.00, 1, '2026-10-11 17:32:17.262+07', 'OPEN', '2026-09-26 17:32:17.262+07', '2026-09-26 17:32:17.262+07');
INSERT INTO public.project_jobs VALUES ('ba2deb92-cee0-401d-b797-4d862a7d3e70', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Backend Node.js & Database Developer (Dự án Kho)', 'Thiết kế cơ sở dữ liệu PostgreSQL và viết RESTful API quản lý hàng tồn, báo cáo doanh thu. Yêu cầu viết code sạch, chuẩn REST.', 18000000.00, 1, '2026-10-11 17:32:17.262+07', 'OPEN', '2026-09-26 17:32:17.262+07', '2026-09-26 17:32:17.262+07');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects VALUES ('5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Hệ thống Quản lý kho Logistics (DevHub Client)', 'Xây dựng toàn diện ứng dụng web quản lý nhập, xuất, tồn kho hàng hóa và tích hợp mã QR.', 30000000.00, '2026-09-26', '2026-11-10', NULL, 'RECRUITING', 35.00, 'db7c670f-1493-4391-8c34-722b0e3a487e', NULL, '2026-09-26 17:32:17.259+07', '2026-09-26 17:32:17.259+07');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles VALUES ('18402dd2-7b4e-4ed1-ab6b-f0567e78c172', 'ADMIN', 'System administrator with full access', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.roles VALUES ('61d4d66e-d6d6-4bde-a5fc-219449d4264f', 'CANDIDATE', 'Job seeker / Freelancer', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.roles VALUES ('36bdc4a5-ff47-49a1-beae-ef07418d862b', 'EMPLOYER', 'External hiring company', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.skills VALUES ('e09f2d9c-8aff-46c0-a5be-1ea3b84bd7d7', 'JavaScript', 'JavaScript skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('b01896aa-61aa-4788-bbbd-0978659a6555', 'TypeScript', 'TypeScript skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('d1009b02-93eb-4707-8468-62345af8c63a', 'React', 'React skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('a5588328-32fa-4df2-b675-c5a27eb6fcfe', 'Vue.js', 'Vue.js skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('94c14711-6783-4048-a43a-21a84bbbb24c', 'Angular', 'Angular skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('c68921a4-bd99-456e-9582-44e1f367028a', 'Node.js', 'Node.js skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('3d92719c-ec11-4fc3-a21f-b8f14243d2aa', 'Express.js', 'Express.js skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('fbbdb61f-e043-40dc-9689-e6a2822b16fd', 'NestJS', 'NestJS skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('8e148701-765b-4d4a-b873-d8b4a4c24b27', 'Python', 'Python skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('eb4a9bfc-b635-412e-860c-b1220a6c1aa5', 'Django', 'Django skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('f91422af-8a3b-4ed3-b64f-45dbadb323e3', 'Java', 'Java skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('84850e2a-78b7-4e07-92f9-8492c3e21b27', 'Spring Boot', 'Spring Boot skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('b91c9f62-09b2-4ed0-895a-34247db15e34', 'PHP', 'PHP skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('23910b94-0927-4c3e-91e9-1fddf729e68f', 'Laravel', 'Laravel skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('26e2cf38-7dcb-497c-9c95-0644d1ac87e8', 'Ruby on Rails', 'Ruby on Rails skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('52b9f0a7-6dcf-4baa-86fe-15d1e765ed12', 'PostgreSQL', 'PostgreSQL skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('215a36b5-d7ee-40ad-825f-c1a7a852b5d4', 'MySQL', 'MySQL skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('5417399f-e1e2-4434-a2d8-7c4a6a5552f5', 'MongoDB', 'MongoDB skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('30355d31-0742-4c73-9879-1f81297cdbfb', 'Redis', 'Redis skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('f7832dad-28de-4c0a-b576-c2589d07c90f', 'Docker', 'Docker skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('e7b70dd9-bbcf-4831-b064-90f3a8aa3a63', 'Kubernetes', 'Kubernetes skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('a57f615c-5778-47ea-9307-6cc2510d34f6', 'AWS', 'AWS skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('680b8ee1-708a-459d-a68b-91185aee9310', 'Azure', 'Azure skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('fe41cce7-2ced-49ca-8a9e-d283cbf17a26', 'GCP', 'GCP skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('58448363-6c20-4fc8-a15b-e8dc514fb065', 'Git', 'Git skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('6f493b31-b75c-41b6-acb2-ef3eb80722f0', 'CI/CD', 'CI/CD skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('8ec294db-d8db-4af6-8442-c9434223356a', 'GraphQL', 'GraphQL skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('400acb28-69ab-48f1-8d45-d51a9b408c61', 'REST API', 'REST API skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('b6dbabb9-e952-40b0-a17a-4f3d449c0af2', 'Figma', 'Figma skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('c730b201-a760-4628-a61e-60ed2b68c917', 'UI/UX Design', 'UI/UX Design skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');


--
-- Data for Name: sub_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: task_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.task_assignees VALUES ('cab2ac0c-46ff-4fc2-9504-fb5ada47d13e', 'da791a3f-2797-49e5-b109-fcc450cea6d1', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');
INSERT INTO public.task_assignees VALUES ('4661d680-2ba2-4a8c-810c-c5044683cdb1', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: task_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tasks VALUES ('da791a3f-2797-49e5-b109-fcc450cea6d1', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Thiết kế giao diện Dashboard kho', 'Tạo layout thống kê số lượng hàng nhập xuất tồn theo tuần.', 'MEDIUM', 'DONE', '{}', NULL, NULL, NULL, 100, 0, NULL, NULL, NULL, 'PENDING', '2026-09-26 17:32:17.278+07', '2026-09-26 17:32:17.278+07');
INSERT INTO public.tasks VALUES ('e8aa6cb6-fc74-441f-adc1-b18300d45426', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Tích hợp bảng quét mã vạch sản phẩm', 'Xây dựng component quét và nhập liệu tức thời.', 'MEDIUM', 'IN_PROGRESS', '{}', NULL, NULL, NULL, 60, 0, NULL, NULL, NULL, 'PENDING', '2026-09-26 17:32:17.278+07', '2026-09-26 17:32:17.278+07');
INSERT INTO public.tasks VALUES ('fb021814-8742-4569-bb9c-310db0f6ccbc', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Tối ưu Responsive trên máy tính bảng', 'Kiểm thử hiển thị trên màn hình iPad và tablet công nghiệp.', 'MEDIUM', 'TODO', '{}', NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, 'PENDING', '2026-09-26 17:32:17.278+07', '2026-09-26 17:32:17.278+07');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_roles VALUES ('db7c670f-1493-4391-8c34-722b0e3a487e', '18402dd2-7b4e-4ed1-ab6b-f0567e78c172');
INSERT INTO public.user_roles VALUES ('9c17353a-74e0-4f9c-af7e-616a4ea7da36', '36bdc4a5-ff47-49a1-beae-ef07418d862b');
INSERT INTO public.user_roles VALUES ('aa1af617-5227-4f42-a47b-7c4dd00250dd', '61d4d66e-d6d6-4bde-a5fc-219449d4264f');
INSERT INTO public.user_roles VALUES ('4e332674-295d-444c-a507-2d60b50f1be1', '61d4d66e-d6d6-4bde-a5fc-219449d4264f');
INSERT INTO public.user_roles VALUES ('f676e1a5-3807-4995-b14c-310100cd183a', '61d4d66e-d6d6-4bde-a5fc-219449d4264f');
INSERT INTO public.user_roles VALUES ('36fe63da-2f81-4530-96a7-4bd67ea88a2d', '61d4d66e-d6d6-4bde-a5fc-219449d4264f');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'employer@fpt.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Trần Nhà Tuyển Dụng', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-09-26 17:32:17.228+07');
INSERT INTO public.users VALUES ('aa1af617-5227-4f42-a47b-7c4dd00250dd', 'dev1@gmail.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Nguyễn Văn Dev', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-09-26 17:32:17.228+07');
INSERT INTO public.users VALUES ('4e332674-295d-444c-a507-2d60b50f1be1', 'dev2@gmail.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Lê Thị Code', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-09-26 17:32:17.228+07');
INSERT INTO public.users VALUES ('db7c670f-1493-4391-8c34-722b0e3a487e', 'admin@devhub.vn', '$2a$12$eH0DtaDA8561du8X4fItiu5aNrwHsaC8VpcvBtkFhePftmj2Y6Lju', 'DevHub Admin', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:16.774+07', '2026-09-26 17:35:28.457+07');
INSERT INTO public.users VALUES ('f676e1a5-3807-4995-b14c-310100cd183a', 'daominhnhut2017@gmail.com', '$2a$12$6TAJnajRVlI.3XN80IUe/.RnotRxg2br2s2v9/YdTh.m7m.xMbgxi', 'Đào Minh Nhựt ', 'INACTIVE', false, 'af1da30efe0e1866ae38ee0346af3448776668ce69266ec7a8d282407cb16ee5', NULL, NULL, NULL, '2026-09-26 17:37:03.079+07', '2026-09-26 17:37:03.079+07');
INSERT INTO public.users VALUES ('36fe63da-2f81-4530-96a7-4bd67ea88a2d', '23110282@student.hcmute.edu.vn', '$2a$12$8X7PXXymdwebWo2Z.FKfLOxdNcbjHMFeDS7.qoMrEHYxeS7LkWPDS', 'Đào Minh Nhựt ', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:50:39.239+07', '2026-09-26 18:35:25.232+07');


--
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workspace_members VALUES ('7143368a-c50f-4f6b-84a4-a4c8569f78ae', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', '986306d2-ccda-42e3-bf64-d6f894ec68bb', 'MEMBER', '2026-09-26 17:32:17.275+07', 'ACTIVE');


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workspaces VALUES ('5308bacc-baeb-4e27-a2ae-a7d777efdb66', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'WS - Logistics Dashboard', 'ACTIVE', '2026-09-26 17:32:17.271+07', '2026-09-26 17:32:17.271+07');


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: application_status_history application_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: candidate_cvs candidate_cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_cvs
    ADD CONSTRAINT candidate_cvs_pkey PRIMARY KEY (id);


--
-- Name: candidate_evaluations candidate_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_evaluations
    ADD CONSTRAINT candidate_evaluations_pkey PRIMARY KEY (id);


--
-- Name: candidate_evaluations candidate_evaluations_workspace_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_evaluations
    ADD CONSTRAINT candidate_evaluations_workspace_member_id_key UNIQUE (workspace_member_id);


--
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_key UNIQUE (user_id);


--
-- Name: candidate_skills candidate_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_pkey PRIMARY KEY (candidate_profile_id, skill_id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_tax_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_tax_code_key UNIQUE (tax_code);


--
-- Name: companies companies_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_user_id_key UNIQUE (user_id);


--
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- Name: job_post_skills job_post_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_post_skills
    ADD CONSTRAINT job_post_skills_pkey PRIMARY KEY (job_post_id, skill_id);


--
-- Name: job_posts job_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posts
    ADD CONSTRAINT job_posts_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payment_information payment_information_candidate_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_information
    ADD CONSTRAINT payment_information_candidate_profile_id_key UNIQUE (candidate_profile_id);


--
-- Name: payment_information payment_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_information
    ADD CONSTRAINT payment_information_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: project_applications project_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_applications
    ADD CONSTRAINT project_applications_pkey PRIMARY KEY (id);


--
-- Name: project_job_skills project_job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_job_skills
    ADD CONSTRAINT project_job_skills_pkey PRIMARY KEY (project_job_id, skill_id);


--
-- Name: project_jobs project_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_jobs
    ADD CONSTRAINT project_jobs_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: sub_tasks sub_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_tasks
    ADD CONSTRAINT sub_tasks_pkey PRIMARY KEY (id);


--
-- Name: task_activities task_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT task_activities_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_task_id_workspace_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_workspace_member_id_key UNIQUE (task_id, workspace_member_id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: task_submissions task_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_submissions
    ADD CONSTRAINT task_submissions_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_project_id_key UNIQUE (project_id);


--
-- Name: activity_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_action ON public.activity_logs USING btree (action);


--
-- Name: activity_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- Name: activity_logs_entity_type_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_entity_type_entity_id ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: activity_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: application_status_history application_status_history_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_job_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_post_id_fkey FOREIGN KEY (job_post_id) REFERENCES public.job_posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_cvs candidate_cvs_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_cvs
    ADD CONSTRAINT candidate_cvs_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_evaluations candidate_evaluations_workspace_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_evaluations
    ADD CONSTRAINT candidate_evaluations_workspace_member_id_fkey FOREIGN KEY (workspace_member_id) REFERENCES public.workspace_members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_profiles candidate_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_skills candidate_skills_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_skills candidate_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: companies companies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: experiences experiences_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_post_skills job_post_skills_job_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_post_skills
    ADD CONSTRAINT job_post_skills_job_post_id_fkey FOREIGN KEY (job_post_id) REFERENCES public.job_posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_post_skills job_post_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_post_skills
    ADD CONSTRAINT job_post_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_posts job_posts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posts
    ADD CONSTRAINT job_posts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_posts job_posts_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posts
    ADD CONSTRAINT job_posts_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_information payment_information_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_information
    ADD CONSTRAINT payment_information_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_workspace_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_workspace_member_id_fkey FOREIGN KEY (workspace_member_id) REFERENCES public.workspace_members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_applications project_applications_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_applications
    ADD CONSTRAINT project_applications_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_applications project_applications_project_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_applications
    ADD CONSTRAINT project_applications_project_job_id_fkey FOREIGN KEY (project_job_id) REFERENCES public.project_jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_job_skills project_job_skills_project_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_job_skills
    ADD CONSTRAINT project_job_skills_project_job_id_fkey FOREIGN KEY (project_job_id) REFERENCES public.project_jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_job_skills project_job_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_job_skills
    ADD CONSTRAINT project_job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_jobs project_jobs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_jobs
    ADD CONSTRAINT project_jobs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_tasks sub_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_tasks
    ADD CONSTRAINT sub_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_activities task_activities_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT task_activities_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_activities task_activities_workspace_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT task_activities_workspace_member_id_fkey FOREIGN KEY (workspace_member_id) REFERENCES public.workspace_members(id) ON UPDATE CASCADE;


--
-- Name: task_assignees task_assignees_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_assignees task_assignees_workspace_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_workspace_member_id_fkey FOREIGN KEY (workspace_member_id) REFERENCES public.workspace_members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_comments task_comments_workspace_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_workspace_member_id_fkey FOREIGN KEY (workspace_member_id) REFERENCES public.workspace_members(id) ON UPDATE CASCADE;


--
-- Name: task_submissions task_submissions_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_submissions
    ADD CONSTRAINT task_submissions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_candidate_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_candidate_profile_id_fkey FOREIGN KEY (candidate_profile_id) REFERENCES public.candidate_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_project_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_project_job_id_fkey FOREIGN KEY (project_job_id) REFERENCES public.project_jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspaces workspaces_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JtK1BZSeJw7jltV9J0uDqvQy2t67gpyMUec93RDypDpc7kfITEaKMpqys2ekUk2

