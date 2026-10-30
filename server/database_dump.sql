--
-- PostgreSQL database dump
--

\restrict KzeFxcsSL3wRSRF1Yup8Vecg23cYIYU7hzay9ZqVl8FsSaw9gZMawFQTTa72Bk3

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
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_comments DROP CONSTRAINT IF EXISTS task_comments_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_attachments DROP CONSTRAINT IF EXISTS task_attachments_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_workspace_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
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
ALTER TABLE IF EXISTS ONLY public.experiences DROP CONSTRAINT IF EXISTS experiences_parent_id_fkey;
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
DROP INDEX IF EXISTS public.uq_workspace_members_workspace_candidate;
DROP INDEX IF EXISTS public.uq_project_applications_candidate_job;
DROP INDEX IF EXISTS public.uq_payments_workspace_member;
DROP INDEX IF EXISTS public.uq_applications_candidate_job;
DROP INDEX IF EXISTS public.idx_task_attachments_task;
DROP INDEX IF EXISTS public.idx_refresh_tokens_user;
DROP INDEX IF EXISTS public.idx_experiences_parent;
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
ALTER TABLE IF EXISTS ONLY public.task_attachments DROP CONSTRAINT IF EXISTS task_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_task_id_workspace_member_id_key;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_pkey;
ALTER TABLE IF EXISTS ONLY public.task_activities DROP CONSTRAINT IF EXISTS task_activities_pkey;
ALTER TABLE IF EXISTS ONLY public.sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_pkey;
ALTER TABLE IF EXISTS ONLY public.skills DROP CONSTRAINT IF EXISTS skills_name_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
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
ALTER TABLE IF EXISTS ONLY public.internal_projects DROP CONSTRAINT IF EXISTS internal_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.internal_projects DROP CONSTRAINT IF EXISTS internal_projects_job_post_id_key;
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
DROP TABLE IF EXISTS public.task_attachments;
DROP TABLE IF EXISTS public.task_assignees;
DROP TABLE IF EXISTS public.task_activities;
DROP TABLE IF EXISTS public.sub_tasks;
DROP TABLE IF EXISTS public.skills;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.refresh_tokens;
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
DROP TABLE IF EXISTS public.internal_projects;
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
DROP TYPE IF EXISTS public.enum_internal_projects_status;
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
-- Name: enum_internal_projects_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_internal_projects_status AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.enum_internal_projects_status OWNER TO postgres;

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
    years_of_experience numeric(4,1) DEFAULT 0,
    source character varying(10) DEFAULT 'MANUAL'::character varying NOT NULL
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
    updated_at timestamp with time zone NOT NULL,
    company_email_verified boolean DEFAULT false NOT NULL,
    company_email_token character varying(10),
    company_email_token_expires timestamp with time zone
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
    updated_at timestamp with time zone NOT NULL,
    type character varying(10) DEFAULT 'COMPANY'::character varying NOT NULL,
    parent_id uuid,
    tasks jsonb DEFAULT '[]'::jsonb NOT NULL,
    technologies jsonb DEFAULT '[]'::jsonb NOT NULL,
    link_url character varying(500)
);


ALTER TABLE public.experiences OWNER TO postgres;

--
-- Name: internal_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_projects (
    id uuid NOT NULL,
    job_post_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    budget numeric(15,2),
    start_date date,
    expected_end_date date,
    actual_end_date date,
    status public.enum_internal_projects_status DEFAULT 'PLANNING'::public.enum_internal_projects_status,
    completion_rate numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.internal_projects OWNER TO postgres;

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
    updated_at timestamp with time zone NOT NULL,
    requirements text,
    benefits text,
    experience character varying(20),
    position_level character varying(20),
    work_address character varying(500),
    working_time character varying(255)
);


ALTER TABLE public.job_posts OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    type character varying(40) NOT NULL,
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
    updated_at timestamp with time zone NOT NULL,
    requirements text,
    benefits text,
    experience character varying(20)
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
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(64) NOT NULL,
    user_agent character varying(255),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

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
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_attachments (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    kind character varying(10) DEFAULT 'FILE'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    url character varying(1000) NOT NULL,
    size integer,
    uploaded_by_user_id uuid,
    uploaded_by_name character varying(150),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.task_attachments OWNER TO postgres;

--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_comments (
    id uuid NOT NULL,
    task_id uuid NOT NULL,
    workspace_member_id uuid,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id uuid
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
    updated_at timestamp with time zone NOT NULL,
    avatar_url character varying(500),
    email_verify_expires timestamp with time zone
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
INSERT INTO public.activity_logs VALUES ('01256d35-b4d8-42bd-a9dd-4d5abe4cbf7d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 15:51:54.759+07');
INSERT INTO public.activity_logs VALUES ('d6b5a76b-6307-4c05-a687-f104b149a286', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-28 16:24:37.636+07');
INSERT INTO public.activity_logs VALUES ('dba8cb54-159b-4ddd-aa25-33a3a219a8b9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 22:38:31.947+07');
INSERT INTO public.activity_logs VALUES ('42db588b-2f0d-49c4-82ca-9130165222cb', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:53:22.207+07');
INSERT INTO public.activity_logs VALUES ('d7637c41-35fd-4eff-988a-6ff5f202ad91', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:53:58.977+07');
INSERT INTO public.activity_logs VALUES ('79974496-cd74-4bce-9f77-5ac6bc5f4ae9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 10:54:42.643+07');
INSERT INTO public.activity_logs VALUES ('306b2c9e-014f-4a87-ba45-2e1a1a60478e', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'CANDIDATE', 'USER_LOGOUT', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:08:14.998+07');
INSERT INTO public.activity_logs VALUES ('41e7d094-c4d1-4842-8897-2b0de863df62', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:09:12.464+07');
INSERT INTO public.activity_logs VALUES ('e8272c57-af4d-4cc3-9d0b-2b446ec2134e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:42:18.033+07');
INSERT INTO public.activity_logs VALUES ('d293cfc5-b188-41ab-b035-887d5c8a8222', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 11:42:21.863+07');
INSERT INTO public.activity_logs VALUES ('52b67a7b-0619-4130-aec0-37e9a06fecdf', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 21:15:35.339+07');
INSERT INTO public.activity_logs VALUES ('cde5c0ca-5c03-44fd-b3f6-4599312b76a8', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 21:15:58.441+07');
INSERT INTO public.activity_logs VALUES ('84253f39-7f68-414b-aa93-cfed1013537f', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 21:16:26.091+07');
INSERT INTO public.activity_logs VALUES ('a8023a0a-e029-420c-8b0b-b0e52723cb78', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'CANDIDATE', 'USER_LOGOUT', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-01 21:35:34.118+07');
INSERT INTO public.activity_logs VALUES ('50e7dc54-e1bb-481e-a20c-3bec6490e4da', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:41:08.86+07');
INSERT INTO public.activity_logs VALUES ('6be832e1-f887-4d09-b3af-a6f36e7a7f61', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:42:45.944+07');
INSERT INTO public.activity_logs VALUES ('2cf52b23-0913-40da-bfb8-fef6defd264b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:43:25.512+07');
INSERT INTO public.activity_logs VALUES ('b70a40bc-f0ea-45c6-baad-724e826b5c79', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'PROJECT_CREATED', 'project', 'e47fd610-d01a-49f2-896b-cabb3d671439', 'bbb', NULL, NULL, 'Tạo dự án mới "bbb"', '{"workspace_id": "36d73a0e-a9da-4a95-8796-5b5660b41ba6"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:56:55.491+07');
INSERT INTO public.activity_logs VALUES ('a4838180-980f-4d46-b91f-b3fdab5ce354', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:58:07.62+07');
INSERT INTO public.activity_logs VALUES ('be1af335-e318-4ad3-90f1-9ce1ea3e736a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:58:16.025+07');
INSERT INTO public.activity_logs VALUES ('c09bd591-a94c-426a-bc65-278c2efb57b4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:59:05.2+07');
INSERT INTO public.activity_logs VALUES ('16f08e22-b4e0-45d4-8b43-a582187307c7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 21:59:20.251+07');
INSERT INTO public.activity_logs VALUES ('7578a389-b890-44ae-8509-b79568187a59', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:03:04.01+07');
INSERT INTO public.activity_logs VALUES ('583c2b1e-bab0-4d2d-ba7e-7568392bc2fe', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:03:15.576+07');
INSERT INTO public.activity_logs VALUES ('23b4ec9f-88c1-43f4-9e1d-0cf55cbdbe85', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:04:55.398+07');
INSERT INTO public.activity_logs VALUES ('57f47381-2810-4cd7-bb40-42d3921dcc09', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:05:12.615+07');
INSERT INTO public.activity_logs VALUES ('9938e1d8-944c-4f88-a32a-38d6c314fb82', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:11:13.269+07');
INSERT INTO public.activity_logs VALUES ('f9b0ed91-4a36-4cd5-a7a8-d0a8cf6ad4b4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:11:25.601+07');
INSERT INTO public.activity_logs VALUES ('36eec96d-6609-4e97-850e-fc33b4782b92', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:12:00.399+07');
INSERT INTO public.activity_logs VALUES ('3cdf49be-64f3-4f84-a355-068ff7dbb82a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:12:13.584+07');
INSERT INTO public.activity_logs VALUES ('37da499f-fd1b-4a58-9ce6-825a288ace70', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'PROJECT_CREATED', 'project', '984eb3bb-3c69-4db3-8b7c-a184b14d4f76', 'Kiểm thử phần mềm ', NULL, NULL, 'Tạo dự án mới "Kiểm thử phần mềm "', '{"workspace_id": "681f19d2-32f7-4280-9698-2db0eaa0a031"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:12:58.829+07');
INSERT INTO public.activity_logs VALUES ('d2c29ce4-1d47-4f22-a14f-88d83c608a8a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:13:57.341+07');
INSERT INTO public.activity_logs VALUES ('074b27f7-3ca9-4c49-b743-b07689244e31', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:14:09.28+07');
INSERT INTO public.activity_logs VALUES ('891873c4-bbd4-4487-b686-9f3329cd0de7', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'APPLICATION_SUBMITTED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'Ứng tuyển vị trí tester intern ', NULL, NULL, 'Đã nộp đơn ứng tuyển cho vị trí "tester intern "', '{"project_id": "984eb3bb-3c69-4db3-8b7c-a184b14d4f76", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:15:03.36+07');
INSERT INTO public.activity_logs VALUES ('62612f49-0b54-4e8f-82bb-292ba263535b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:15:57.166+07');
INSERT INTO public.activity_logs VALUES ('37d02179-4b59-436c-bd1d-db0decb55854', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:16:13.31+07');
INSERT INTO public.activity_logs VALUES ('5a2e7431-aa66-473e-afe0-c427949484b4', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'REVIEWING', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: REVIEWING', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:19:56.192+07');
INSERT INTO public.activity_logs VALUES ('e1bcaa66-6188-4fd4-b92d-8f129f772359', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:31:49.999+07');
INSERT INTO public.activity_logs VALUES ('3fa65e53-bff5-4ca2-b899-4b1a659c905e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'INTERVIEW', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:01.535+07');
INSERT INTO public.activity_logs VALUES ('47176197-047e-4456-acaa-96eb91190c6b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'ACCEPTED', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: ACCEPTED', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:05.156+07');
INSERT INTO public.activity_logs VALUES ('d1d27c37-0eb2-46c6-a804-42246123df8d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'REVIEWING', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: REVIEWING', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:14.351+07');
INSERT INTO public.activity_logs VALUES ('150fa1b8-2256-4746-a53b-a68a1431949f', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'INTERVIEW', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:12.27+07');
INSERT INTO public.activity_logs VALUES ('10a55a94-5427-403c-9f98-8b185e4cacd9', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:22.874+07');
INSERT INTO public.activity_logs VALUES ('34e71197-0f03-4267-9047-d9c4f5c5dde2', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-06 22:20:33.393+07');
INSERT INTO public.activity_logs VALUES ('671af181-016b-42af-bb28-baab6c53ed75', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:15:47.393+07');
INSERT INTO public.activity_logs VALUES ('c71e7c47-3d43-4f34-a4e0-8e8376fb7d91', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:17:07.395+07');
INSERT INTO public.activity_logs VALUES ('cb21b189-de8c-4c13-9fc1-d5492f5da036', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:17:19.331+07');
INSERT INTO public.activity_logs VALUES ('774226dc-74c4-41a4-932d-003d7dfc6fac', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:26:17.455+07');
INSERT INTO public.activity_logs VALUES ('a007547c-e27d-4bce-b9cc-516fac88399a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:26:42.428+07');
INSERT INTO public.activity_logs VALUES ('b4529345-21eb-48cb-862b-bc9aac32348e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, 'INTERVIEW', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:28:55.968+07');
INSERT INTO public.activity_logs VALUES ('c5114d43-8f5e-49a5-9c41-cf2f5c888efd', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'INTERVIEW_SCHEDULED', 'project_application', '9c73909a-fad5-4841-ab87-7c319bcae70a', 'tester intern ', NULL, NULL, 'Đã xếp lịch phỏng vấn cho Nguyễn Văn Dev lúc 09:35 Thứ Bảy, 10 tháng 10, 2026', '{"project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:36:06.856+07');
INSERT INTO public.activity_logs VALUES ('cfef76ff-f738-4b2d-b40a-ba8530a2db1b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:36:22.855+07');
INSERT INTO public.activity_logs VALUES ('8562f536-d776-4084-a1f4-c51cca37c030', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-08 21:36:32.278+07');
INSERT INTO public.activity_logs VALUES ('ff8bfc6d-4ff2-4539-bd29-a65675ce8766', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 20:49:21.705+07');
INSERT INTO public.activity_logs VALUES ('053a3a8d-6d82-4df6-9c69-56018bb5301e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:03:24.516+07');
INSERT INTO public.activity_logs VALUES ('47c25abf-83ec-4b65-a1f0-e6dac0701b4a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:03:44.123+07');
INSERT INTO public.activity_logs VALUES ('3d3113bf-45eb-44c5-ada0-75584c8e272b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:07:17.726+07');
INSERT INTO public.activity_logs VALUES ('a39049b6-096c-4541-913e-382e1df65a5a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:07:28.682+07');
INSERT INTO public.activity_logs VALUES ('5c523e93-c0e2-4b15-9e8b-92449c2fc41e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:12:12.703+07');
INSERT INTO public.activity_logs VALUES ('4214c99d-eea7-44d5-8a70-173df65ecdb0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 21:12:25.051+07');
INSERT INTO public.activity_logs VALUES ('df4afd40-a5db-4d62-941e-113f1f9197e6', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:23:06.595+07');
INSERT INTO public.activity_logs VALUES ('60af1342-fe92-4228-9839-0e2615816f52', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:24:56.628+07');
INSERT INTO public.activity_logs VALUES ('2faf149a-4dc9-4583-82af-c5facc66b86f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:25:24.242+07');
INSERT INTO public.activity_logs VALUES ('dbe1d2b7-123d-4bc0-a3d7-5e0b06a1ac12', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:26:26.442+07');
INSERT INTO public.activity_logs VALUES ('39b25788-7adf-4bb6-a826-6f4948b24690', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-09 22:26:40.557+07');
INSERT INTO public.activity_logs VALUES ('a9644fc4-239c-45f4-b6b8-43057ecf3f7c', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:32:07.786+07');
INSERT INTO public.activity_logs VALUES ('4bd08e33-be33-4d08-b765-73dbdd68d2a5', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:46:57.067+07');
INSERT INTO public.activity_logs VALUES ('5d43f160-cb30-4d60-9f76-7c5a671c2e77', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:47:46.483+07');
INSERT INTO public.activity_logs VALUES ('7c50b7e1-82f2-4371-bb44-47fb45a35d24', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '00d5f656-85b1-4e4b-abcf-dd7f2c609f5f', 'Frontend React Developer (Dự án Kho)', NULL, 'REJECTED', 'Đơn ứng tuyển của Lê Thị Code đã chuyển sang trạng thái: REJECTED', '{"user_id": "4e332674-295d-444c-a507-2d60b50f1be1", "project_job_id": "986306d2-ccda-42e3-bf64-d6f894ec68bb"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:48:06.799+07');
INSERT INTO public.activity_logs VALUES ('71ec07ac-b512-4d0b-813c-aa54bc5bfb95', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '00d5f656-85b1-4e4b-abcf-dd7f2c609f5f', 'Frontend React Developer (Dự án Kho)', NULL, 'ACCEPTED', 'Đơn ứng tuyển của Lê Thị Code đã chuyển sang trạng thái: ACCEPTED', '{"user_id": "4e332674-295d-444c-a507-2d60b50f1be1", "project_job_id": "986306d2-ccda-42e3-bf64-d6f894ec68bb"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:48:18.723+07');
INSERT INTO public.activity_logs VALUES ('b1736085-f5c9-4464-ad9c-f769d55d7894', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'APPLICATION_STATUS_CHANGED', 'project_application', '08d927df-9d37-4554-8959-504f718dc0f2', 'Backend Node.js & Database Developer (Dự án Kho)', NULL, 'ACCEPTED', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: ACCEPTED', '{"user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "ba2deb92-cee0-401d-b797-4d862a7d3e70"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 18:48:43.298+07');
INSERT INTO public.activity_logs VALUES ('66baabde-4889-4e3f-961d-5ab57a058886', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_CREATED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', NULL, NULL, 'Tạo task "Thiết kế màn hình login " trong workspace', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:07:41.875+07');
INSERT INTO public.activity_logs VALUES ('c10b5608-23f0-460e-b5e5-9bcb07f1a5f2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:10:29.933+07');
INSERT INTO public.activity_logs VALUES ('7f210689-7286-4f2e-a107-09daaad621d2', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:10:40.563+07');
INSERT INTO public.activity_logs VALUES ('d7f82d80-7fec-4c96-88a5-0eeef3df646f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:22:23.671+07');
INSERT INTO public.activity_logs VALUES ('c1a93ab8-120b-43fa-8c10-afde008835b0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:22:37.559+07');
INSERT INTO public.activity_logs VALUES ('c82a60e4-b5a5-44fb-b58b-520442d9cd52', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: TODO → IN_PROGRESS', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:29:57.934+07');
INSERT INTO public.activity_logs VALUES ('fab0240e-bf29-4ed9-98df-b07a4a21084d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: IN_PROGRESS → TODO', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:30:01.863+07');
INSERT INTO public.activity_logs VALUES ('4bd1f988-b0d3-417a-8ba5-891ba19da436', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: TODO → IN_PROGRESS', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:33:55.237+07');
INSERT INTO public.activity_logs VALUES ('3bd76f00-2e6f-4ba8-a10b-537ef5e91698', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: IN_PROGRESS → TODO', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:33:57.44+07');
INSERT INTO public.activity_logs VALUES ('88e25b76-52f7-4d77-bcf0-2ca37fa42239', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', 'IN_PROGRESS', 'REVIEW', 'Chuyển trạng thái: IN_PROGRESS → REVIEW', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:59:04.382+07');
INSERT INTO public.activity_logs VALUES ('52c6f7ae-bd13-45ba-8fc4-de63ee34d086', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', 'REVIEW', 'IN_PROGRESS', 'Chuyển trạng thái: REVIEW → IN_PROGRESS', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:59:08.941+07');
INSERT INTO public.activity_logs VALUES ('9e97d0c8-9901-4c14-88d0-902bbde4addb', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', 'IN_PROGRESS', 'REVIEW', 'Chuyển trạng thái: IN_PROGRESS → REVIEW', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 19:59:11.032+07');
INSERT INTO public.activity_logs VALUES ('193daea8-6fe1-4aa0-87ec-2180af64098b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', 'REVIEW', 'IN_PROGRESS', 'Chuyển trạng thái: REVIEW → IN_PROGRESS', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:03:45.811+07');
INSERT INTO public.activity_logs VALUES ('d3ce132b-5442-4226-8f23-c55fbe354e68', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', 'IN_PROGRESS', 'REVIEW', 'Chuyển trạng thái: Đang làm → Chờ duyệt (task "Tích hợp bảng quét mã vạch sản phẩm")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:39:29.649+07');
INSERT INTO public.activity_logs VALUES ('15d14940-fcc2-4eb2-a364-ec9785549750', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGOUT', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:19:03.634+07');
INSERT INTO public.activity_logs VALUES ('775a9eaf-f19f-4f83-ac92-d4bce5310804', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_APPROVED', 'task', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', 'Tích hợp bảng quét mã vạch sản phẩm', NULL, NULL, 'Task "Tích hợp bảng quét mã vạch sản phẩm" đã được duyệt ✅: tốt', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:39:59.621+07');
INSERT INTO public.activity_logs VALUES ('1edabfd0-7790-46e4-bbe1-db0877780ef8', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm (task "Thiết kế màn hình login ")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:41:44.405+07');
INSERT INTO public.activity_logs VALUES ('b032b51b-a483-4b15-afe7-b702c71131d2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: Đang làm → Cần làm (task "Thiết kế màn hình login ")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:42:32.028+07');
INSERT INTO public.activity_logs VALUES ('128721e0-e779-45d3-85da-7ed82ce6db4e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm (task "Thiết kế màn hình login ")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:42:35.608+07');
INSERT INTO public.activity_logs VALUES ('aa63bcaf-8d6d-4c79-ac73-5602663c9cca', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:52:04.626+07');
INSERT INTO public.activity_logs VALUES ('7ef9ecf0-cd2c-4bd7-8c3d-1f7d478d8e89', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:52:12.722+07');
INSERT INTO public.activity_logs VALUES ('3af345cc-96be-4699-ab62-b56f087a744c', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:53:30.719+07');
INSERT INTO public.activity_logs VALUES ('b0ac3428-e222-4cb2-9f7a-939c81bbea5c', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 20:53:36.758+07');
INSERT INTO public.activity_logs VALUES ('fc0a676e-9d15-4ac9-a1ff-ee468f3f0841', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_UPDATED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', '0%', '100%', 'Cập nhật tiến độ: 0% → 100% (task "Thiết kế màn hình login ")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', '2026-10-10 21:19:18.522+07');
INSERT INTO public.activity_logs VALUES ('872a28db-3bec-4166-a25b-dceb7c6c1741', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 18:18:40.334+07');
INSERT INTO public.activity_logs VALUES ('72f77967-ae46-4866-bd00-f062c4687a76', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 18:20:00.391+07');
INSERT INTO public.activity_logs VALUES ('8d07ccf0-b90e-486b-8bea-2afcd45693be', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 18:20:23.667+07');
INSERT INTO public.activity_logs VALUES ('4fd16318-4e73-4a75-95a0-a4c26ea0164b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_CREATED', 'task', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'DW-1431: Test Login', NULL, NULL, 'Tạo task "DW-1431: Test Login" trong workspace', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 18:54:42.245+07');
INSERT INTO public.activity_logs VALUES ('e04ffd60-42e1-4e35-a74a-257286ae2742', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:11:41.702+07');
INSERT INTO public.activity_logs VALUES ('9e8fb81d-5f8b-41b0-a5aa-61ba68f97903', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:11:58.402+07');
INSERT INTO public.activity_logs VALUES ('417441e4-bc14-49e2-b995-7ea17916605a', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGOUT', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:13:17.45+07');
INSERT INTO public.activity_logs VALUES ('d84a36c2-d94a-434d-83ee-05a3e56a5e37', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:13:41.195+07');
INSERT INTO public.activity_logs VALUES ('5447819c-f30f-4a12-b9b4-8be19d6bedae', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_UPDATED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', NULL, NULL, 'Cập nhật người thực hiện (task "Tối ưu Responsive trên máy tính bảng")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:14:06.217+07');
INSERT INTO public.activity_logs VALUES ('557f4bc5-e758-45ee-961c-f6d2a60ab17a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_UPDATED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', NULL, '2026-10-30', 'Đổi deadline thành 2026-10-30 (task "Tối ưu Responsive trên máy tính bảng")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:15:37.984+07');
INSERT INTO public.activity_logs VALUES ('7b73a747-4ba1-48e6-91b7-db34bb9dfb99', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:15:54.71+07');
INSERT INTO public.activity_logs VALUES ('43fc9753-a40c-4af2-8051-2974115e181e', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:16:10.867+07');
INSERT INTO public.activity_logs VALUES ('f6fe5284-50a9-4e22-8b77-1c6f198eabb9', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', 'IN_PROGRESS', 'REVIEW', 'Nộp sản phẩm lần 1, chuyển trạng thái: Đang làm → Chờ duyệt (task "Thiết kế màn hình login ")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:18:05.044+07');
INSERT INTO public.activity_logs VALUES ('faf68d12-dace-4587-bf6b-08d80838b28b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:19:19.223+07');
INSERT INTO public.activity_logs VALUES ('4aa60adc-44ca-4758-84d0-5a9de3c28de7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_COMMENTED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', NULL, NULL, 'Bình luận mới trong task "Thiết kế màn hình login ": "ok"', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:19:31.846+07');
INSERT INTO public.activity_logs VALUES ('dec036f7-0c0c-4d26-9667-4a296cd24865', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_APPROVED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', NULL, NULL, 'Task "Thiết kế màn hình login " đã được duyệt ✅: ok', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:20:09.477+07');
INSERT INTO public.activity_logs VALUES ('46a135e7-4ad1-4186-9ba2-b6dfd4fb5a84', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:20:52.507+07');
INSERT INTO public.activity_logs VALUES ('bc0268bf-63e0-404d-8016-1f7dc8ea84b7', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:21:16.577+07');
INSERT INTO public.activity_logs VALUES ('2a9ae5f8-ca6f-45d6-a67c-18637ec3ddcc', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm (task "Tối ưu Responsive trên máy tính bảng")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:21:30.893+07');
INSERT INTO public.activity_logs VALUES ('43e23726-1c0f-4228-a49b-edccbdf6ca00', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', 'IN_PROGRESS', 'REVIEW', 'Nộp sản phẩm lần 1, chuyển trạng thái: Đang làm → Chờ duyệt (task "Tối ưu Responsive trên máy tính bảng")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:22:24.077+07');
INSERT INTO public.activity_logs VALUES ('f3cfac24-a808-41b4-bfa3-261c72da5ab0', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_COMMENTED', 'task', 'be7df978-8cac-4793-99b4-bc0638db5a99', 'Thiết kế màn hình login ', NULL, NULL, 'Bình luận mới trong task "Thiết kế màn hình login ": "dạ"', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:22:37.291+07');
INSERT INTO public.activity_logs VALUES ('dfe62d89-7097-4fdc-af6b-2a46f6335385', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGOUT', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:23:05.719+07');
INSERT INTO public.activity_logs VALUES ('f4088208-e9c4-4d13-ba3c-86dbfdbd5175', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:23:36.356+07');
INSERT INTO public.activity_logs VALUES ('d9fdb8ca-f5a6-400f-9d2f-cce47373126f', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'TASK_REVISION_REQUESTED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', NULL, NULL, 'Yêu cầu chỉnh sửa task "Tối ưu Responsive trên máy tính bảng": chưa ổn, đang lỗi khi tối ưu', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:27:38.443+07');
INSERT INTO public.activity_logs VALUES ('d8c7cda6-381b-4c3b-bfd7-73a5d65d3528', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:28:20.653+07');
INSERT INTO public.activity_logs VALUES ('92330eac-5fc1-4b67-8cfc-beabbc17079f', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:28:30.921+07');
INSERT INTO public.activity_logs VALUES ('b3f622bc-c123-4474-9b5d-2e60c5c503c8', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'TASK_UPDATED', 'task', 'fb021814-8742-4569-bb9c-310db0f6ccbc', 'Tối ưu Responsive trên máy tính bảng', '90%', '70%', 'Cập nhật tiến độ: 90% → 70% (task "Tối ưu Responsive trên máy tính bảng")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-16 20:29:11.921+07');
INSERT INTO public.activity_logs VALUES ('a92c978b-4e77-443f-8b7c-d6ab2b2e0739', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-20 18:33:27.612+07');
INSERT INTO public.activity_logs VALUES ('6a1347eb-08b0-48b8-8b13-0999b6180229', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-20 18:35:42.688+07');
INSERT INTO public.activity_logs VALUES ('32f38850-1766-4145-9934-a2141f5dbad4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-20 18:44:42.693+07');
INSERT INTO public.activity_logs VALUES ('692d1119-2272-4b50-aa03-0f47c4c7eaf0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'curl/8.10.1', '2026-10-22 19:23:38.518+07');
INSERT INTO public.activity_logs VALUES ('9151d270-5ee0-444f-838d-66d73c405b75', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:23:55.553+07');
INSERT INTO public.activity_logs VALUES ('ef10f6f0-a55a-46d6-905f-233ce8fd6460', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:24:24.249+07');
INSERT INTO public.activity_logs VALUES ('6529b838-b7dc-46b1-bd22-217222bfcb60', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:26:17.994+07');
INSERT INTO public.activity_logs VALUES ('89fc8c72-d40d-43e7-a638-06804754f8c0', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:26:32.318+07');
INSERT INTO public.activity_logs VALUES ('0b5ca37d-2afa-469b-bc5d-6836b61931be', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:26:41.013+07');
INSERT INTO public.activity_logs VALUES ('d8cc55bb-ce13-42c4-b331-f35f68063c74', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:27:02.867+07');
INSERT INTO public.activity_logs VALUES ('1b7dfdd5-3aa7-4f9d-bc09-68b98351e6a4', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:27:48.207+07');
INSERT INTO public.activity_logs VALUES ('c88f0cb3-fa8e-48f8-b11e-4c998597e1fc', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:28:01.922+07');
INSERT INTO public.activity_logs VALUES ('ba5e8ccf-ecd7-446c-9cb0-e138ed36eef3', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'CANDIDATE', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:29:02.745+07');
INSERT INTO public.activity_logs VALUES ('0df2c29a-8a09-462d-909c-cbd55d40e8a7', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:29:28.121+07');
INSERT INTO public.activity_logs VALUES ('76cd3729-c4fe-45b5-8e8e-3a2f889bc9af', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:30:04.274+07');
INSERT INTO public.activity_logs VALUES ('8cfd3bda-07ab-41ae-812b-0cf133134ae9', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:32:52.207+07');
INSERT INTO public.activity_logs VALUES ('bd0fd18e-0d3e-4649-93d4-758822aacbc1', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:35:13.239+07');
INSERT INTO public.activity_logs VALUES ('f34cb609-b90b-48e7-b954-c63ed873da7e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:35:22.249+07');
INSERT INTO public.activity_logs VALUES ('78617754-3dd1-4be7-8ed8-f54ae204edda', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:35:32.526+07');
INSERT INTO public.activity_logs VALUES ('d3a0ccb8-4fd9-4138-be26-e1b22f28df57', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:35:41.966+07');
INSERT INTO public.activity_logs VALUES ('ebdbc3f8-5c01-4f94-8933-a61469980c8d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:35:57.137+07');
INSERT INTO public.activity_logs VALUES ('9e00f998-8335-4b1e-b153-ee1b8a8d8d86', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:37:00.677+07');
INSERT INTO public.activity_logs VALUES ('ce441121-fe82-49c7-9543-c5613fbfe873', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:38:39.016+07');
INSERT INTO public.activity_logs VALUES ('8d4c5892-d146-4a00-a742-206f0fb97bdf', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:39:38.541+07');
INSERT INTO public.activity_logs VALUES ('74ba16ea-adb2-40fb-b614-6f975c549b53', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:42:10.928+07');
INSERT INTO public.activity_logs VALUES ('957f23bf-09ef-435d-8284-408e2dc6e0c1', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:46:36.738+07');
INSERT INTO public.activity_logs VALUES ('8671f4cf-4601-4184-98d6-a09f6cbdaaf1', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:50:25.452+07');
INSERT INTO public.activity_logs VALUES ('9ee0378b-e0cd-41e3-a4c9-624355131c13', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:50:39.68+07');
INSERT INTO public.activity_logs VALUES ('dfe4f5ac-321e-42e5-ab8a-7c548329003b', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:50:47.966+07');
INSERT INTO public.activity_logs VALUES ('cf95cd48-fd77-4c4d-a954-475610f7da4d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:50:56.996+07');
INSERT INTO public.activity_logs VALUES ('4341904b-40f1-4612-829e-450ba23f0978', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:51:06.095+07');
INSERT INTO public.activity_logs VALUES ('febdc6e5-d143-4c40-9900-0ce9a3255a5d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:51:10.697+07');
INSERT INTO public.activity_logs VALUES ('77131a94-2c24-47e3-9e2f-f377f4491c51', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:05.631+07');
INSERT INTO public.activity_logs VALUES ('28143373-faf6-43d6-925e-f4fb054665f2', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:19.775+07');
INSERT INTO public.activity_logs VALUES ('31e0690b-0aa3-446c-90d0-702d56e1197d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:28.834+07');
INSERT INTO public.activity_logs VALUES ('6b879d1f-4ec8-4269-b5a0-d31dceb3a281', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:37.831+07');
INSERT INTO public.activity_logs VALUES ('d8aa9c68-6fc7-4523-80ca-84613b4f1876', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:46.269+07');
INSERT INTO public.activity_logs VALUES ('93bd39ec-be40-4288-a1b9-d6c44da93014', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:53:51.16+07');
INSERT INTO public.activity_logs VALUES ('6d51bcb3-4636-42f9-a3ed-bbec7df1fb37', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:54:15.14+07');
INSERT INTO public.activity_logs VALUES ('6444f984-5e34-4f1e-a902-78ec260c1909', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:54:19.755+07');
INSERT INTO public.activity_logs VALUES ('76fe5768-5fdd-4fb3-9ea3-58575ba80e86', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:54:24.071+07');
INSERT INTO public.activity_logs VALUES ('89d332c9-fa77-46b8-92ce-b57c8013877b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:54:29.58+07');
INSERT INTO public.activity_logs VALUES ('adbba732-1612-49aa-b5d7-b488fa1c8b4c', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:54:41.667+07');
INSERT INTO public.activity_logs VALUES ('6f174d3c-ce31-4bb5-8681-0488d9f90c6a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:55:04.923+07');
INSERT INTO public.activity_logs VALUES ('35dc4494-2bb2-4726-82c3-ede63885f27e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:55:10.715+07');
INSERT INTO public.activity_logs VALUES ('de702b87-101b-44a9-b023-d208a734df1b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:55:15.55+07');
INSERT INTO public.activity_logs VALUES ('cd31bd75-c6ca-4c60-9edb-163ae895e23c', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 19:55:21.393+07');
INSERT INTO public.activity_logs VALUES ('c567df23-11bf-48e2-8427-3122e06751b7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 19:55:51.033+07');
INSERT INTO public.activity_logs VALUES ('0ed7bb47-9fba-4ca7-aedc-652d202a0790', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:11:19.05+07');
INSERT INTO public.activity_logs VALUES ('fe2f330e-8cfe-4341-a059-2aeaff2c5a16', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:11:44.412+07');
INSERT INTO public.activity_logs VALUES ('b43fe578-98d3-4c9b-9a07-001ce9cb5287', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:11:55.204+07');
INSERT INTO public.activity_logs VALUES ('1b407715-8c5a-4533-978d-9d8d364ef81c', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:13:19.007+07');
INSERT INTO public.activity_logs VALUES ('9401fad4-bbbb-49a0-96ce-1c0ebc0b8cd4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:13:34.592+07');
INSERT INTO public.activity_logs VALUES ('96abeba4-86c4-4c50-81e5-bf0ce45674ad', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:13:42.977+07');
INSERT INTO public.activity_logs VALUES ('5078d3e9-abb4-4012-a89c-879e53e44101', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:13:59.278+07');
INSERT INTO public.activity_logs VALUES ('7ae4adf3-389a-4fd9-af96-00dcfff8bc2a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:16:13.3+07');
INSERT INTO public.activity_logs VALUES ('dd102688-769b-41e8-bb56-80403350181b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'curl/8.10.1', '2026-10-22 20:19:44.564+07');
INSERT INTO public.activity_logs VALUES ('09655eb1-f90c-4bfd-a38e-4d27663a764f', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:24:07.919+07');
INSERT INTO public.activity_logs VALUES ('6bc8a519-ca67-41fb-9d9e-0025d3c107b0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:24:17.074+07');
INSERT INTO public.activity_logs VALUES ('d2d4f7fd-6991-4153-b3f9-ef1229bf1b3b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:26:15.642+07');
INSERT INTO public.activity_logs VALUES ('410fce24-9d1f-4896-a922-64292321cd0b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:26:41.208+07');
INSERT INTO public.activity_logs VALUES ('48fe5826-c81c-4c4c-b40c-d49318e45733', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:26:52.312+07');
INSERT INTO public.activity_logs VALUES ('311d284c-e951-4bcd-9db5-8db882763ded', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:27:03.633+07');
INSERT INTO public.activity_logs VALUES ('bd847921-2880-43bf-9e87-b91ec28ee8e0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:27:12.711+07');
INSERT INTO public.activity_logs VALUES ('a33a02a5-4d5b-4bba-9054-c3ef9f971924', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:28:05.257+07');
INSERT INTO public.activity_logs VALUES ('608be6a4-2378-4e61-9170-d7657f478e91', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:28:17.376+07');
INSERT INTO public.activity_logs VALUES ('4dcae2ca-1738-4f8a-9540-af940c3a5cc0', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:28:23.563+07');
INSERT INTO public.activity_logs VALUES ('9e92114f-5564-48b1-9f9d-df1b12e4cda2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:29:28.229+07');
INSERT INTO public.activity_logs VALUES ('0493fa59-6df5-4d87-8a60-32f740d1ad61', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:29:48.293+07');
INSERT INTO public.activity_logs VALUES ('8b88d513-3ea7-4fa5-ada5-5816d3be3d8b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:30:13.819+07');
INSERT INTO public.activity_logs VALUES ('4d8882f8-8ade-4366-a379-a74b8693cb4c', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:30:25.129+07');
INSERT INTO public.activity_logs VALUES ('a721ee42-0584-439c-91c8-34755bd69293', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:30:37.128+07');
INSERT INTO public.activity_logs VALUES ('48e74677-8779-4c0c-a09a-25f67c0c0017', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:30:52.403+07');
INSERT INTO public.activity_logs VALUES ('1ded9844-290c-48b9-9fad-d9b8561b2c6c', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:31:00.73+07');
INSERT INTO public.activity_logs VALUES ('3d4f886c-7ebd-486d-b39f-5d1daaa019c4', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:31:10.148+07');
INSERT INTO public.activity_logs VALUES ('8134bd4b-05b2-4e42-9dcc-846d055743b1', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:31:18.852+07');
INSERT INTO public.activity_logs VALUES ('382fc440-85f1-4f82-aaef-facdb99bbaf4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 20:31:23.5+07');
INSERT INTO public.activity_logs VALUES ('4d7263db-1b65-4051-ba55-31ecd9eeb05b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:39:01.565+07');
INSERT INTO public.activity_logs VALUES ('ccaca233-2537-41b3-8669-8cb7acc044c7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:40:53.597+07');
INSERT INTO public.activity_logs VALUES ('8f443f2f-d8b1-4e2b-ae7a-8a90ccf54ec4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:41:10.287+07');
INSERT INTO public.activity_logs VALUES ('ef0dd559-8547-4fba-9405-2b4a63aabf5e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:43:29.839+07');
INSERT INTO public.activity_logs VALUES ('468cb917-a254-4e83-a6b7-d51b33f84b03', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:43:47.403+07');
INSERT INTO public.activity_logs VALUES ('49130d04-0a2f-47c9-a80a-db94db267c48', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:46:13.69+07');
INSERT INTO public.activity_logs VALUES ('59f27357-82dd-4487-8c03-5a13c1fa96e1', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 20:46:25.735+07');
INSERT INTO public.activity_logs VALUES ('9a416f9e-8c9d-4b8c-9de2-3e7f5aebd7ef', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 22:40:25.481+07');
INSERT INTO public.activity_logs VALUES ('d786ca89-afc4-48b7-9973-14040e4fa116', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 22:46:55.279+07');
INSERT INTO public.activity_logs VALUES ('be672a5c-25ca-4e10-8a02-ae4aa93aee35', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:48:21.514+07');
INSERT INTO public.activity_logs VALUES ('989a930c-c114-4321-af94-5db40c5afed5', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:48:26.651+07');
INSERT INTO public.activity_logs VALUES ('51c26d06-926a-4509-bf38-e5e72dbb1ffb', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:48:30.631+07');
INSERT INTO public.activity_logs VALUES ('867f13ad-f939-4fbe-8fbc-b38c0cd499bd', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 22:51:37.485+07');
INSERT INTO public.activity_logs VALUES ('736d727d-f93b-4ba9-95dc-ff93ae9ebca0', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 22:52:39.159+07');
INSERT INTO public.activity_logs VALUES ('acc7bf0d-b0a7-484a-9e03-fc4be3d74c63', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:52:42.33+07');
INSERT INTO public.activity_logs VALUES ('87cade88-3225-4a35-8a64-2f21938495e4', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 22:52:57.288+07');
INSERT INTO public.activity_logs VALUES ('74a58f76-aa12-4661-8ad3-fb657a57204f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:52:59.391+07');
INSERT INTO public.activity_logs VALUES ('dec25a91-321b-41dd-853f-e42431c651fa', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:53:06.352+07');
INSERT INTO public.activity_logs VALUES ('a669ece2-da6b-467a-b7d1-2337751ee993', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:54:16.22+07');
INSERT INTO public.activity_logs VALUES ('6a87cfa4-ec5a-4cf1-8015-35acf690f9be', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:54:42.235+07');
INSERT INTO public.activity_logs VALUES ('e6f0084e-7c1e-41ab-8e51-6dd39370ebec', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:54:53.662+07');
INSERT INTO public.activity_logs VALUES ('6488a612-a312-471b-8214-eb42a009d480', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:55:05.853+07');
INSERT INTO public.activity_logs VALUES ('77efa4b4-7528-450c-accf-036e9eea54cc', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:55:15.152+07');
INSERT INTO public.activity_logs VALUES ('f0dfec81-c206-4a16-bc5f-c5a47cc5dec5', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:55:27.731+07');
INSERT INTO public.activity_logs VALUES ('03ddd150-1a34-4f8a-a2aa-e65fdb7395ac', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:55:39.954+07');
INSERT INTO public.activity_logs VALUES ('1a2a8169-bbbc-43ae-b67f-b9412814cb87', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:55:46.043+07');
INSERT INTO public.activity_logs VALUES ('d7e6ad8c-a641-438d-822d-22a27438a8db', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:56:41.852+07');
INSERT INTO public.activity_logs VALUES ('ceeb7eb1-0025-4916-936d-d902c6abadac', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:56:57.101+07');
INSERT INTO public.activity_logs VALUES ('9aefbf11-0df8-480c-80c0-44ca1f59d65c', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:57:06.149+07');
INSERT INTO public.activity_logs VALUES ('57423655-da93-4ea4-88ee-633ade33ffcb', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:57:15.69+07');
INSERT INTO public.activity_logs VALUES ('445d41d4-ee53-4f5c-8513-c7423481b0bd', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:57:24.244+07');
INSERT INTO public.activity_logs VALUES ('a635a0e7-477f-4545-9a0e-010a9c4764f6', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:57:29.101+07');
INSERT INTO public.activity_logs VALUES ('318e4723-09bd-47cb-b7ec-31d7b2cf30b2', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 22:57:56.366+07');
INSERT INTO public.activity_logs VALUES ('982aa870-ba97-4903-97f4-81942b8e7a79', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:06:50.14+07');
INSERT INTO public.activity_logs VALUES ('280abf40-b620-4cf5-9358-b578d0c4bf68', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:06:53.787+07');
INSERT INTO public.activity_logs VALUES ('9f533454-2e8f-4c87-8c80-3540b45e1636', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:06:57.467+07');
INSERT INTO public.activity_logs VALUES ('014c2a61-5f6d-4edd-8b72-38a16f2facc2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:09:11.672+07');
INSERT INTO public.activity_logs VALUES ('329c64ae-627f-4a78-90c2-39efae293044', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:09:15.27+07');
INSERT INTO public.activity_logs VALUES ('7b930056-0fd4-46ce-ab9a-7df83b2d0167', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:09:18.789+07');
INSERT INTO public.activity_logs VALUES ('33e24ac6-1953-4bc8-8c6d-a90a327e23ec', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:10:25.482+07');
INSERT INTO public.activity_logs VALUES ('74f88013-0815-4aad-944e-3de6ed8c0e3d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:10:51.846+07');
INSERT INTO public.activity_logs VALUES ('e72724c9-dbde-482c-a997-f8990e3727ff', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:03.65+07');
INSERT INTO public.activity_logs VALUES ('29d0d178-4176-4536-9b78-c0d32062c21f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:11:10.886+07');
INSERT INTO public.activity_logs VALUES ('8acb452e-9f65-4fc0-9599-7409090f86f1', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:15.397+07');
INSERT INTO public.activity_logs VALUES ('277e91d8-3611-4ed6-b0a7-7008ae2bfe9d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:00:08.54+07');
INSERT INTO public.activity_logs VALUES ('ec6dea65-9758-4819-be8c-898c29893598', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:25.381+07');
INSERT INTO public.activity_logs VALUES ('f6ebd7ee-4d37-4537-adfe-0a4a253b4618', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:11:27.995+07');
INSERT INTO public.activity_logs VALUES ('b36345e7-e64e-4318-937d-dc6740a8855c', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:38.229+07');
INSERT INTO public.activity_logs VALUES ('4b1ed548-41ed-404c-bb1b-e66329a09a68', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:11:46.215+07');
INSERT INTO public.activity_logs VALUES ('bfbd1e3d-16b3-4878-9082-4c993fc844d9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:51.342+07');
INSERT INTO public.activity_logs VALUES ('794e2550-9903-4622-96f0-4b6278d771dc', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:11:57.633+07');
INSERT INTO public.activity_logs VALUES ('65f26998-fca8-4a85-bb42-273dcc3f4873', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:16:51.064+07');
INSERT INTO public.activity_logs VALUES ('cd001fcd-2995-4fd9-a875-8a795685f8da', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:16:55.274+07');
INSERT INTO public.activity_logs VALUES ('985a76e7-05bd-4522-9f79-70f7d7136c08', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:16:59.201+07');
INSERT INTO public.activity_logs VALUES ('d84492be-8607-4ba0-8eeb-7e402f2584d9', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:17:22.28+07');
INSERT INTO public.activity_logs VALUES ('a11855b0-fa34-447d-a2d9-5355e6f97830', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:17:48.069+07');
INSERT INTO public.activity_logs VALUES ('b6a53752-dfee-43f9-8e37-1290ab05dcf4', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:17:51.746+07');
INSERT INTO public.activity_logs VALUES ('37ef2b20-57ce-4446-9d8b-52929e0956ed', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:17:59.426+07');
INSERT INTO public.activity_logs VALUES ('dcc0c368-09a0-45b7-b4cd-056289214c87', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:18:10.533+07');
INSERT INTO public.activity_logs VALUES ('d6d02cc3-e73b-4548-82fb-55f739edf63b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:18:19.897+07');
INSERT INTO public.activity_logs VALUES ('150d4782-45bd-4841-a6a6-0c0c24f34bd6', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:22:24.974+07');
INSERT INTO public.activity_logs VALUES ('c3657d01-687f-4f79-9691-5b7a9031ca28', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:23:30.731+07');
INSERT INTO public.activity_logs VALUES ('341cd998-e5f2-4abc-a293-bf15a61c9580', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:25:57.764+07');
INSERT INTO public.activity_logs VALUES ('c61d6aca-0fa5-476d-b539-fba30e448500', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:29:36.963+07');
INSERT INTO public.activity_logs VALUES ('272c2390-485a-430f-982b-bef23aed6e22', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:29:40.963+07');
INSERT INTO public.activity_logs VALUES ('8a490beb-e7a2-434d-b7a6-aa6d54328b93', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:29:44.838+07');
INSERT INTO public.activity_logs VALUES ('9bfdfe10-9d3e-407c-b3de-ba358273538d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:14.645+07');
INSERT INTO public.activity_logs VALUES ('75cb0c88-3861-48c1-9dc6-4392f70c5630', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:17.353+07');
INSERT INTO public.activity_logs VALUES ('10c3b2c3-143b-4b19-95b8-dc58c1c4d8d9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:21.43+07');
INSERT INTO public.activity_logs VALUES ('d5b846fb-73b7-4f38-b36d-328a391d08c3', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:36.295+07');
INSERT INTO public.activity_logs VALUES ('7c4aa125-b7a0-4ebe-ad8c-a34f9998c827', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:39.04+07');
INSERT INTO public.activity_logs VALUES ('b59a76af-eeb5-4a39-a88a-262356b53197', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:31:42.813+07');
INSERT INTO public.activity_logs VALUES ('11ac6583-dbb0-4b91-92ad-866fe8266115', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:35:29.267+07');
INSERT INTO public.activity_logs VALUES ('b2b1ea4e-90e9-4a7e-909a-2bd30cfdee86', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:37:28.229+07');
INSERT INTO public.activity_logs VALUES ('73d96251-3f87-4232-ae68-83cdc2a51eee', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:38:28.402+07');
INSERT INTO public.activity_logs VALUES ('0bfc5911-3c9c-43c2-baa1-1f03d5f4a821', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:40:04.452+07');
INSERT INTO public.activity_logs VALUES ('293e154d-ef30-4cb5-b012-30e1095a4f46', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:41:18.949+07');
INSERT INTO public.activity_logs VALUES ('e4deca6c-ef37-4127-be79-393bc7abceb5', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:44:01.066+07');
INSERT INTO public.activity_logs VALUES ('e66269b1-f965-4e91-bae4-c8cceae0c4ef', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:44:45.689+07');
INSERT INTO public.activity_logs VALUES ('e09ba7c8-34a1-476f-8411-8eb8a95a265d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:46:22.858+07');
INSERT INTO public.activity_logs VALUES ('b4b7ae86-8679-49f8-8b19-6b20b7cef179', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:47:54.58+07');
INSERT INTO public.activity_logs VALUES ('f5004a5c-f4da-4f02-892f-074697c68b59', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:47:57.697+07');
INSERT INTO public.activity_logs VALUES ('2dc278c9-a218-47a6-903e-1a7076fbda6d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', '2026-10-22 23:48:02.063+07');
INSERT INTO public.activity_logs VALUES ('3aa53600-578b-4452-acd6-a98fe97c3bf0', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:48:54.074+07');
INSERT INTO public.activity_logs VALUES ('129f61d0-f66f-42ca-820c-8eddf7208508', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:49:20.177+07');
INSERT INTO public.activity_logs VALUES ('237e8afe-8312-4504-815f-c1d9ce63fc2e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:49:36.426+07');
INSERT INTO public.activity_logs VALUES ('e42f3226-5b77-4955-af63-4f7ea445fa7c', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-22 23:50:01.075+07');
INSERT INTO public.activity_logs VALUES ('3d0ec4a8-851b-4b2a-8add-131d6fd55ec4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:01:05.511+07');
INSERT INTO public.activity_logs VALUES ('51420246-49f1-47c9-a57f-630ce5bb4d9d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:01:52.108+07');
INSERT INTO public.activity_logs VALUES ('71b5ef9b-d3a3-441c-a066-6214f9d9e2ae', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:02:09.212+07');
INSERT INTO public.activity_logs VALUES ('16dcf7e8-8aa8-4062-8956-b1de49479bf4', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:02:35.29+07');
INSERT INTO public.activity_logs VALUES ('a434a9bc-6f48-4401-bc6e-366afd460757', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:02:45.186+07');
INSERT INTO public.activity_logs VALUES ('92586066-d66a-4b8c-8bde-2fe38828a25b', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGOUT', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:03:12.565+07');
INSERT INTO public.activity_logs VALUES ('40463c5c-7579-43d3-acc2-242de4520b50', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:23:08.99+07');
INSERT INTO public.activity_logs VALUES ('4eb06aab-90ee-4d96-99a3-109cc76d623b', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:23:12.704+07');
INSERT INTO public.activity_logs VALUES ('cf3ba7a8-8b38-4479-ab76-0b16c64564a9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:24:30.969+07');
INSERT INTO public.activity_logs VALUES ('cdc2df38-3233-49fb-901d-c57ab1ea1a9d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:24:34.655+07');
INSERT INTO public.activity_logs VALUES ('f5ed40ba-2807-483d-b714-072451450916', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:24:49.168+07');
INSERT INTO public.activity_logs VALUES ('619e5b34-681f-4065-9894-e7e531a65a8d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:25:13.479+07');
INSERT INTO public.activity_logs VALUES ('d6702cd8-2114-404b-a733-ecfa2be221b0', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:25:24.01+07');
INSERT INTO public.activity_logs VALUES ('dea24eb8-06c6-4096-8b41-559bbd0b7ff7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:25:34.227+07');
INSERT INTO public.activity_logs VALUES ('9fe66414-5f65-429a-9d75-c56e7fafb800', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:25:42.747+07');
INSERT INTO public.activity_logs VALUES ('8f80ca64-7372-4487-a5d4-85e0bef164fd', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 16:26:12.189+07');
INSERT INTO public.activity_logs VALUES ('43c9833a-9292-45db-84e9-41de15bb87a3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 16:26:12.469+07');
INSERT INTO public.activity_logs VALUES ('508a79b8-7c98-49fb-94ba-fe4d5df92a56', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:33:56.639+07');
INSERT INTO public.activity_logs VALUES ('8e60bb37-2135-429a-a0f8-d2a1d0bf1159', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:33:56.691+07');
INSERT INTO public.activity_logs VALUES ('0cbfdfd8-ba5b-484b-a78b-bb64608f1814', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:34:00.837+07');
INSERT INTO public.activity_logs VALUES ('8b9431bd-471c-46c5-83f7-14802d1951b3', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:34:16.065+07');
INSERT INTO public.activity_logs VALUES ('b043e214-3fb0-402f-9b98-156848df1419', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:34:42.054+07');
INSERT INTO public.activity_logs VALUES ('94e3b140-ef3e-4aee-a73f-d170802c3903', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 16:34:53.814+07');
INSERT INTO public.activity_logs VALUES ('4725c3ec-9c75-47c6-97a6-1d0ecb6b51ae', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 16:36:00.479+07');
INSERT INTO public.activity_logs VALUES ('ea33b6cc-4a39-43b0-ae67-1925d145a13e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:21:12.926+07');
INSERT INTO public.activity_logs VALUES ('68d81a9c-3f3d-4741-babc-8d9b6caa9679', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:24:21.273+07');
INSERT INTO public.activity_logs VALUES ('030ef463-c504-4159-9d07-3e152606a724', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:24:24.721+07');
INSERT INTO public.activity_logs VALUES ('81b0230a-b9a2-4a73-9631-133dcac534ee', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:07.128+07');
INSERT INTO public.activity_logs VALUES ('238befa0-b215-47c4-8b72-79cbae6f76a3', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:11.25+07');
INSERT INTO public.activity_logs VALUES ('f48a1458-cf85-4ec3-b5e7-ed98d4073fa2', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:15.312+07');
INSERT INTO public.activity_logs VALUES ('fec365da-5712-4550-94cf-a8936f54749d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:19.479+07');
INSERT INTO public.activity_logs VALUES ('adff97ee-1272-4831-b2fb-e71a806aabf8', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:53:48.477+07');
INSERT INTO public.activity_logs VALUES ('cb9a1a2c-a018-49c8-b5e7-1f49bafa88b9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:23.583+07');
INSERT INTO public.activity_logs VALUES ('0f422eb2-0cf1-4dd3-89d9-7aa6904bc358', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:27.642+07');
INSERT INTO public.activity_logs VALUES ('17ae0416-0c7a-47ab-b302-90b7b2fc3e59', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:31.752+07');
INSERT INTO public.activity_logs VALUES ('00ea0663-ea87-4ac5-9861-d811580505ff', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:35.951+07');
INSERT INTO public.activity_logs VALUES ('862214bc-1cf1-4da0-a85f-9142b54d6ffc', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:25:40.094+07');
INSERT INTO public.activity_logs VALUES ('83371593-d7f9-43a1-8949-6f476d579d5a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:30:13.728+07');
INSERT INTO public.activity_logs VALUES ('0d15d07d-1ff6-449e-b403-0e7d6881a64f', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:30:26.317+07');
INSERT INTO public.activity_logs VALUES ('a137687b-6943-49ff-b340-ddc94c4bd814', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:30:39.046+07');
INSERT INTO public.activity_logs VALUES ('b4316845-0aec-4c73-b64f-5b8068ed4b21', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:31:23.197+07');
INSERT INTO public.activity_logs VALUES ('6a41ac27-ab4a-4427-8e37-f728a9b35c3d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:31:49.633+07');
INSERT INTO public.activity_logs VALUES ('7deb21a0-5b4b-4060-8814-f5bf9223895d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:01.292+07');
INSERT INTO public.activity_logs VALUES ('332fa7de-f123-4a70-b95b-23f71b005bf8', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:13.33+07');
INSERT INTO public.activity_logs VALUES ('8049f625-460a-4192-b9da-fc47309998b4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:18.039+07');
INSERT INTO public.activity_logs VALUES ('264b2d43-9825-4769-8cc7-69e8b1985c23', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:22.055+07');
INSERT INTO public.activity_logs VALUES ('d39a99a6-2964-4812-8b80-50402a189ff3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:26.087+07');
INSERT INTO public.activity_logs VALUES ('c1c67741-19c5-4302-839f-c72bb5c888b3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:30.151+07');
INSERT INTO public.activity_logs VALUES ('7d3e3126-f454-409f-a504-14bbeaddc205', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:34.134+07');
INSERT INTO public.activity_logs VALUES ('b572750a-0fb1-4c09-8591-539b682bbeb8', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:38.319+07');
INSERT INTO public.activity_logs VALUES ('7e84190e-f103-48c1-a587-357078e6711d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:42.424+07');
INSERT INTO public.activity_logs VALUES ('a9d0515d-f98f-4417-8a87-93ee41da207d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:32:46.637+07');
INSERT INTO public.activity_logs VALUES ('22b1efa4-da06-4788-9747-c69a5d2f8944', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:35:21.398+07');
INSERT INTO public.activity_logs VALUES ('64dcd935-970d-45b4-8cf2-92d27a89bee7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:36:07.293+07');
INSERT INTO public.activity_logs VALUES ('0365977d-9de8-4372-b084-86f50635e609', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:36:33.82+07');
INSERT INTO public.activity_logs VALUES ('a56d4435-b005-4eda-9c8a-c976871cc375', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:36:45.62+07');
INSERT INTO public.activity_logs VALUES ('9ca04c57-5bd5-4488-89ba-ea83b9749691', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:36:46.207+07');
INSERT INTO public.activity_logs VALUES ('a24a62f8-0600-4d7a-9a47-40af4b6173db', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:36:56.831+07');
INSERT INTO public.activity_logs VALUES ('a60f979b-450d-42d0-bf1d-6df123ea17f3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:37:09.959+07');
INSERT INTO public.activity_logs VALUES ('5f69b05e-8878-464d-b327-71d74935b861', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:37:22.919+07');
INSERT INTO public.activity_logs VALUES ('101520d1-8fcd-4e70-ac06-45598328c45e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'curl/8.10.1', '2026-10-23 20:38:00.07+07');
INSERT INTO public.activity_logs VALUES ('d8c75194-6296-4180-b10a-44e92ea98f97', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:38:19.474+07');
INSERT INTO public.activity_logs VALUES ('d03b4155-d769-4071-a10f-752dcda10cc3', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:38:33.378+07');
INSERT INTO public.activity_logs VALUES ('ca42b1d6-c4d4-436b-b259-df89657b83ba', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:38:45.417+07');
INSERT INTO public.activity_logs VALUES ('667a24a1-aa3c-443e-8dfa-2df51f12bc44', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:38:58.477+07');
INSERT INTO public.activity_logs VALUES ('be6572b2-2a5c-4f40-8197-7c876b42fc0f', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:39:11.034+07');
INSERT INTO public.activity_logs VALUES ('8890fb19-5347-4342-9277-48826a149707', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'DW-1431: Test Login', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm (task "DW-1431: Test Login")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:43:08.273+07');
INSERT INTO public.activity_logs VALUES ('113ec427-11fb-465c-b03d-33052a94e915', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'DW-1431: Test Login', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: Đang làm → Cần làm (task "DW-1431: Test Login")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:43:12.277+07');
INSERT INTO public.activity_logs VALUES ('989f14e5-f0f2-4b16-8bd9-545bfc94e1f7', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'DW-1431: Test Login', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm (task "DW-1431: Test Login")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:43:13.812+07');
INSERT INTO public.activity_logs VALUES ('130679ed-1bc2-4293-9fba-fc4b23931bea', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:49:27.143+07');
INSERT INTO public.activity_logs VALUES ('109360de-a171-4f39-9f66-f51b81b5799c', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:49:32.832+07');
INSERT INTO public.activity_logs VALUES ('8524bb1b-a777-4573-b8ff-ba40731c09f5', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:50:10.012+07');
INSERT INTO public.activity_logs VALUES ('2b7bb89c-980d-4a49-a715-4b6ebc0a7457', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:50:14.148+07');
INSERT INTO public.activity_logs VALUES ('c6539043-2c63-4bec-93b2-1f9c3256cbd7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:50:29.185+07');
INSERT INTO public.activity_logs VALUES ('97784aa1-016c-4b84-941e-c37b939d248d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:50:54.655+07');
INSERT INTO public.activity_logs VALUES ('6cf27322-0c12-491d-9cd1-14336cc17ad3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:51:06.878+07');
INSERT INTO public.activity_logs VALUES ('b45ebbe8-1d52-4edd-8fb9-1e3836b6ebfd', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:55:14.541+07');
INSERT INTO public.activity_logs VALUES ('09c62608-a77d-4daf-8d93-18fb5121bc67', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 20:55:20.168+07');
INSERT INTO public.activity_logs VALUES ('2b25c2d1-4aa5-4e70-817b-82008151f713', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 20:56:41.798+07');
INSERT INTO public.activity_logs VALUES ('c519dd3b-d5ec-4149-85a6-8b3e27699193', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:00:42.149+07');
INSERT INTO public.activity_logs VALUES ('8cbf7735-0948-4831-884e-4b93eadf5929', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:00:57.212+07');
INSERT INTO public.activity_logs VALUES ('77c150ae-0a85-49bf-a424-fef2f0b44dd2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:13:26.887+07');
INSERT INTO public.activity_logs VALUES ('8752caa6-ea9a-400a-b6ab-f7a19ffc8bb1', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:13:41.334+07');
INSERT INTO public.activity_logs VALUES ('cb997f6c-e516-4b4e-88b5-1ef4689263c3', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:16:57.128+07');
INSERT INTO public.activity_logs VALUES ('7ad378b1-1228-4430-85be-e11d4d54ed2a', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 21:17:16.263+07');
INSERT INTO public.activity_logs VALUES ('38b22ee1-356b-491f-89cb-8094bf089518', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:22:33.971+07');
INSERT INTO public.activity_logs VALUES ('3b33bf9d-8263-4ed6-b63f-c49d90c3b90f', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:29:13.598+07');
INSERT INTO public.activity_logs VALUES ('21a8aea2-d7ae-441f-875d-193b56ce778d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGOUT', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:37:10.489+07');
INSERT INTO public.activity_logs VALUES ('080d51c7-55fd-4813-b5c3-c71ad64f233d', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 21:37:20.574+07');
INSERT INTO public.activity_logs VALUES ('c20c030e-8e7d-4c5a-a145-dd04b7c2fbd5', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 21:43:56.298+07');
INSERT INTO public.activity_logs VALUES ('ffa8a630-4ce2-4564-8a80-6a4432a14a9a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:44:20.801+07');
INSERT INTO public.activity_logs VALUES ('2e3f1d7c-e598-4dce-831e-ac91ea07d52f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:44:45.351+07');
INSERT INTO public.activity_logs VALUES ('dd1eb2c5-5e62-40ec-b3ea-1d46378967d5', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:44:56.135+07');
INSERT INTO public.activity_logs VALUES ('519bb223-c5a5-4c42-afd1-298e0cedd609', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:07.406+07');
INSERT INTO public.activity_logs VALUES ('4cf013fd-5eec-4b7e-9bcf-bea929441352', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGOUT', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 18:56:01.132+07');
INSERT INTO public.activity_logs VALUES ('bb404b9a-cc94-4cf0-9c82-0f278f60b311', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 18:56:20.935+07');
INSERT INTO public.activity_logs VALUES ('e90e665c-147b-4861-9c80-d0ca78a6918a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:11.728+07');
INSERT INTO public.activity_logs VALUES ('770429fc-b765-4f55-a422-1952e3894a5a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:18.161+07');
INSERT INTO public.activity_logs VALUES ('c352dfac-0453-4a76-b723-268509e5f92d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:22.414+07');
INSERT INTO public.activity_logs VALUES ('ffea3328-da04-45af-b80d-04e4c9d7c24a', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:26.681+07');
INSERT INTO public.activity_logs VALUES ('46b6b0fa-9c3a-407c-82fe-bf86c72482f6', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:31.002+07');
INSERT INTO public.activity_logs VALUES ('649349b6-3fa7-441d-9687-87708e562dc2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:34.971+07');
INSERT INTO public.activity_logs VALUES ('760de288-f4c4-4c5e-a116-7d454d47e7b2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:39.44+07');
INSERT INTO public.activity_logs VALUES ('323a4548-4566-494f-8364-94d37f08fe9d', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 21:45:44.185+07');
INSERT INTO public.activity_logs VALUES ('b4735a8d-35f6-4eb1-b45d-e284e5288bd9', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 23:13:22.778+07');
INSERT INTO public.activity_logs VALUES ('84e02b9b-56eb-4a3a-ba83-e6f8118f71b3', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:34:10.866+07');
INSERT INTO public.activity_logs VALUES ('d8b955d3-cf44-4403-b843-6b8e5373b05e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:35:03.487+07');
INSERT INTO public.activity_logs VALUES ('8e1c743f-8a1b-44a6-89f5-5eb9bd09e054', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:35:14.816+07');
INSERT INTO public.activity_logs VALUES ('872238fa-05cf-4fdd-871e-a92aee14ee62', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:35:49.066+07');
INSERT INTO public.activity_logs VALUES ('338cf687-8173-4b45-9ba8-e580114390ad', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:36:13.455+07');
INSERT INTO public.activity_logs VALUES ('6d74fc2a-7329-4525-8463-bd2527993609', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:36:23.802+07');
INSERT INTO public.activity_logs VALUES ('7fa824e9-39ec-4ff0-bd37-69f54faa4cb2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:36:34.25+07');
INSERT INTO public.activity_logs VALUES ('fc8b9eab-ca19-4c87-86bd-1b0e21beffc7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:36:43.672+07');
INSERT INTO public.activity_logs VALUES ('daefd55b-4ee6-4eb1-b458-15fee9238dd2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:37:12.152+07');
INSERT INTO public.activity_logs VALUES ('b0296113-24fa-47b1-870b-9b03eafac9c7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:37:36.733+07');
INSERT INTO public.activity_logs VALUES ('61a85898-11a1-4d4f-b974-f942d2e7d1b7', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:37:49.623+07');
INSERT INTO public.activity_logs VALUES ('98747a22-7c9a-4411-a477-141bd510a37b', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 23:47:45.106+07');
INSERT INTO public.activity_logs VALUES ('7b2d5c0f-b419-4a87-aad3-a251b06517f0', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 23:47:45.629+07');
INSERT INTO public.activity_logs VALUES ('7ca91926-8ba8-4f83-838c-07e92e457e41', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 23:47:46.139+07');
INSERT INTO public.activity_logs VALUES ('7c41ec9b-c0b5-467f-a09c-26f89450cdd7', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:48:16.975+07');
INSERT INTO public.activity_logs VALUES ('092c525d-047a-4d26-996f-eda24fbf7338', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-23 23:48:38.108+07');
INSERT INTO public.activity_logs VALUES ('29fad874-7f46-459e-8163-d209dbef94dd', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:48:40.586+07');
INSERT INTO public.activity_logs VALUES ('80421fbf-bbec-4bb5-98d4-560a7c215a36', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:48:58.964+07');
INSERT INTO public.activity_logs VALUES ('777c3fac-848c-4b8a-815c-20394171ee38', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:49:37.999+07');
INSERT INTO public.activity_logs VALUES ('33f23742-6dcc-460e-8e5a-e825971d2104', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:50:03.807+07');
INSERT INTO public.activity_logs VALUES ('addd7fc2-5e3c-4e7e-aa1d-571f427bcc11', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:50:15.005+07');
INSERT INTO public.activity_logs VALUES ('be33b5a9-4053-4ad8-b98d-7d6cbed834ce', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:50:26.306+07');
INSERT INTO public.activity_logs VALUES ('0ec1f471-fa81-4a82-a320-2477f5d36aa8', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-23 23:50:35.453+07');
INSERT INTO public.activity_logs VALUES ('fc3db50f-fbf2-4310-b2c4-99f674998c9b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-23 23:52:49.933+07');
INSERT INTO public.activity_logs VALUES ('5083fc32-d3d0-48dc-8a85-509effbed035', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:30:29.196+07');
INSERT INTO public.activity_logs VALUES ('89653bc3-f570-4991-be42-8f387fc4a444', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:30:53.793+07');
INSERT INTO public.activity_logs VALUES ('f5fa8662-e847-4610-8849-d62d2a46cbd9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:31:04.856+07');
INSERT INTO public.activity_logs VALUES ('ef06d398-85aa-4365-a338-d49a0538e058', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:31:42.513+07');
INSERT INTO public.activity_logs VALUES ('c696f961-1c71-4d8c-9208-f360026bcb03', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:31:46.698+07');
INSERT INTO public.activity_logs VALUES ('675c2d21-42a5-43e8-ba94-80501966b852', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 16:47:36.153+07');
INSERT INTO public.activity_logs VALUES ('9c36997b-bc6d-4851-8120-9142d8edffe4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 16:48:58.687+07');
INSERT INTO public.activity_logs VALUES ('d5b95b5f-949b-4a8c-86b2-215d6f9efc16', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 16:49:16.096+07');
INSERT INTO public.activity_logs VALUES ('18ed7248-e74f-49bc-ba25-c628afb3113d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-24 16:54:04.867+07');
INSERT INTO public.activity_logs VALUES ('5f83c812-1c5e-4021-9c75-550a0fb69782', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:57:07.362+07');
INSERT INTO public.activity_logs VALUES ('ba9f59cf-bc45-44ba-95b7-405b3d445f03', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:58:00.967+07');
INSERT INTO public.activity_logs VALUES ('83fc3ef9-1670-4a73-858e-8ee5da3209ac', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:58:16.614+07');
INSERT INTO public.activity_logs VALUES ('be46a50a-524e-401f-8fe6-3594ec8294d4', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:58:53.844+07');
INSERT INTO public.activity_logs VALUES ('68372928-861b-4033-9686-a8dbc66d7258', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 16:59:14.393+07');
INSERT INTO public.activity_logs VALUES ('25aa5bf3-c1d1-4c68-bd91-57fb160e469e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:00:24.236+07');
INSERT INTO public.activity_logs VALUES ('b6caa9a3-ce69-4a64-9d6c-57d861494747', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:00:50.035+07');
INSERT INTO public.activity_logs VALUES ('fa1b5407-628f-467f-8056-27b9b3e31742', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:01:01.595+07');
INSERT INTO public.activity_logs VALUES ('7552f5e3-4353-4c57-805b-8b80e19a2bad', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 17:04:27.422+07');
INSERT INTO public.activity_logs VALUES ('d74232bb-9525-498c-b74c-ca70580e6319', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 17:04:37.533+07');
INSERT INTO public.activity_logs VALUES ('565c6ab6-ba87-437d-b24e-ca75734cc554', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 17:05:00.792+07');
INSERT INTO public.activity_logs VALUES ('d4b4267f-041a-40f0-9526-e81f5cabc85b', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-24 17:10:59.985+07');
INSERT INTO public.activity_logs VALUES ('da0f9d53-45e1-44a8-818f-2a282ace95c9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:13:21.174+07');
INSERT INTO public.activity_logs VALUES ('443a77bf-f61a-403d-9234-c836ba062bea', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:13:44.414+07');
INSERT INTO public.activity_logs VALUES ('0b89fd9f-1637-4cf7-ba4a-fddb97f923c4', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:14:45.464+07');
INSERT INTO public.activity_logs VALUES ('b723e333-4279-4663-9e82-51db4b89c341', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:15:10.546+07');
INSERT INTO public.activity_logs VALUES ('0678efa3-db08-4fd9-a038-67dd0f11510c', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-24 17:15:33.196+07');
INSERT INTO public.activity_logs VALUES ('9e7d8a10-6dd1-42dd-9e45-aec3feee83f6', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:15:49.183+07');
INSERT INTO public.activity_logs VALUES ('fd96c0cc-91f7-4ffb-b3b7-837fef06b65b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:16:13.824+07');
INSERT INTO public.activity_logs VALUES ('434ca1ea-c906-45d0-94ae-4f8c11db7634', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:16:25.592+07');
INSERT INTO public.activity_logs VALUES ('a3efe0fb-5e0e-4fff-8d37-73ae2c838175', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:16:45.169+07');
INSERT INTO public.activity_logs VALUES ('8b2b5603-4d2f-4791-bb46-81dcdc8686e1', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:17:05.593+07');
INSERT INTO public.activity_logs VALUES ('fa8244e5-7ad1-4d30-85a4-4d4621c39e62', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'node', '2026-10-24 17:17:21.724+07');
INSERT INTO public.activity_logs VALUES ('e933e871-271c-4c80-97dd-eabbb7bf9953', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:17:32.504+07');
INSERT INTO public.activity_logs VALUES ('787676e1-a521-409c-ad1f-2dfbd2744e05', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:17:53.16+07');
INSERT INTO public.activity_logs VALUES ('0ee488e4-5f14-450b-bd4a-4a72b14e7b32', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-24 17:20:33.304+07');
INSERT INTO public.activity_logs VALUES ('06256b3a-b04f-43ba-a4f5-c5dc5fb191b7', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:25:11.725+07');
INSERT INTO public.activity_logs VALUES ('9d098799-8938-452c-b68e-1ed63950bc33', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:25:34.921+07');
INSERT INTO public.activity_logs VALUES ('9d01321e-da57-4bf8-87a6-d61680dcda29', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:25:53.006+07');
INSERT INTO public.activity_logs VALUES ('8b6dd20f-2149-4e62-add4-e25e1693f812', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:26:16.005+07');
INSERT INTO public.activity_logs VALUES ('e77a07e5-46a4-475b-9c90-4a847c3d5077', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:26:30.515+07');
INSERT INTO public.activity_logs VALUES ('0facabc1-b6fa-4333-9d0e-5aeb56642ef9', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:26:54.434+07');
INSERT INTO public.activity_logs VALUES ('95094c4d-f020-438e-ab44-ea7039124781', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:27:28.09+07');
INSERT INTO public.activity_logs VALUES ('8b456b3f-68ec-4798-b720-16e63932238a', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:27:51.829+07');
INSERT INTO public.activity_logs VALUES ('95bf4cf5-ad08-4841-b8bb-ecbe8305822e', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:31:12.308+07');
INSERT INTO public.activity_logs VALUES ('3a2e797f-2b9a-4675-aae2-251a7c33cc54', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-10-24 17:31:36.289+07');
INSERT INTO public.activity_logs VALUES ('d4acef4d-bd18-4ec1-8c9b-7705e793cad8', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:24:58.536+07');
INSERT INTO public.activity_logs VALUES ('dcef30c3-1355-40d1-9637-a607d008e781', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:25:25.817+07');
INSERT INTO public.activity_logs VALUES ('97ab3a48-c5e5-4a96-9302-692339cec636', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:25:41.559+07');
INSERT INTO public.activity_logs VALUES ('0aacac54-db1e-4e0d-b1d3-7379cf3d6225', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGOUT', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:25:58.313+07');
INSERT INTO public.activity_logs VALUES ('7b76114c-fe98-40ff-9dbf-f51c1bc44bac', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGIN', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:26:09.329+07');
INSERT INTO public.activity_logs VALUES ('e44e84ab-3d7f-404e-92ea-267535af95e6', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:28:11.885+07');
INSERT INTO public.activity_logs VALUES ('1771f7ff-e512-474d-aacf-46e5b7acf23a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:29:25.842+07');
INSERT INTO public.activity_logs VALUES ('f1327664-5238-419f-b739-cb7dce61243a', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:30:29.535+07');
INSERT INTO public.activity_logs VALUES ('3b12af07-c3fc-4729-b7dc-87f56abf57e7', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '2026-10-25 11:30:40.783+07');
INSERT INTO public.activity_logs VALUES ('5d307322-e854-4a02-b085-d073c7bbe6bc', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 18:45:50.149+07');
INSERT INTO public.activity_logs VALUES ('77f4c454-0cff-4737-af10-98ff8d7b4911', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGOUT', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 18:47:39.567+07');
INSERT INTO public.activity_logs VALUES ('c30e5109-a990-4ffd-be59-54725306d8ec', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 18:47:54.964+07');
INSERT INTO public.activity_logs VALUES ('5699272a-1d75-4df2-9d09-27041838a9db', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 19:57:19.375+07');
INSERT INTO public.activity_logs VALUES ('e870b7cf-1b6b-491c-87a1-50c57add6682', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '0286dbc7-1d27-4f89-9cd4-a37259b0c193', 'Thanh toán 2.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 2.000 VND cho Nguyễn Văn Dev (WS - Kiểm thử phần mềm )', '{"workspace_id": "681f19d2-32f7-4280-9698-2db0eaa0a031", "workspace_member_id": "0efad0be-7734-4d6d-8a03-8f4194dd133f"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 22:53:18.567+07');
INSERT INTO public.activity_logs VALUES ('b3c65655-dbde-4d1a-8393-2001389a99b5', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', 'bb5f6261-7270-454b-922d-4da3b0f5fc53', 'Thanh toán 12.000.000đ cho Lê Thị Code', NULL, NULL, 'Tạo yêu cầu thanh toán 12.000.000 VND cho Lê Thị Code (WS - Logistics Dashboard)', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "7143368a-c50f-4f6b-84a4-a4c8569f78ae"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 22:54:07.503+07');
INSERT INTO public.activity_logs VALUES ('cd5761ef-b4ed-4428-adc8-1b5cb9edf14c', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGIN', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 22:55:37.914+07');
INSERT INTO public.activity_logs VALUES ('f0de159d-4648-4c8a-8051-6a820ce3f7b5', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', 'bb5f6261-7270-454b-922d-4da3b0f5fc53', 'Thanh toán 12.000.000đ cho Lê Thị Code', NULL, 'PROCESSING', 'Cập nhật trạng thái thanh toán của Lê Thị Code thành PROCESSING', '{"workspace_member_id": "7143368a-c50f-4f6b-84a4-a4c8569f78ae"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:00:55.33+07');
INSERT INTO public.activity_logs VALUES ('2185163d-a2f4-485d-b874-e707f9737842', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', 'bb5f6261-7270-454b-922d-4da3b0f5fc53', 'Thanh toán 12.000.000đ cho Lê Thị Code', NULL, 'FAILED', 'Cập nhật trạng thái thanh toán của Lê Thị Code thành FAILED', '{"workspace_member_id": "7143368a-c50f-4f6b-84a4-a4c8569f78ae"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:00:58.986+07');
INSERT INTO public.activity_logs VALUES ('43a288ca-b9d3-4785-b471-c1cf15c8f39e', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '866aab87-ab20-42d5-9456-786e9d223dfd', 'Thanh toán 18.000.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 18.000.000 VND cho Nguyễn Văn Dev (WS - Logistics Dashboard)', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "b10c0e2f-c1df-4be6-bca7-35532929ee24"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:05:59.739+07');
INSERT INTO public.activity_logs VALUES ('63a5e883-8ef8-4f6e-86b4-43bfa9f0e44a', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', 'CANDIDATE', 'USER_LOGOUT', 'user', '4e332674-295d-444c-a507-2d60b50f1be1', 'Lê Thị Code', NULL, NULL, 'Lê Thị Code đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:14:21.741+07');
INSERT INTO public.activity_logs VALUES ('82e972c3-ca4d-4551-84bb-16e1660d55b4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'USER_LOGIN', 'user', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', NULL, NULL, 'Nguyễn Văn Dev đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:14:31.543+07');
INSERT INTO public.activity_logs VALUES ('5dffd42f-0df5-4e8d-aa60-16c51c8d8c33', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '47707465-9dfe-4af3-a789-23abb8f6573b', 'Thanh toán 2.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 2.000 VND cho Nguyễn Văn Dev (WS - Kiểm thử phần mềm )', '{"workspace_id": "681f19d2-32f7-4280-9698-2db0eaa0a031", "workspace_member_id": "0efad0be-7734-4d6d-8a03-8f4194dd133f"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-29 23:15:45.647+07');
INSERT INTO public.activity_logs VALUES ('37d2fb56-67d7-4bad-8c3d-5279e7e6c693', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '866aab87-ab20-42d5-9456-786e9d223dfd', 'Hủy yêu cầu thanh toán của Nguyễn Văn Dev', NULL, NULL, 'Đã hủy yêu cầu thanh toán 18.000.000đ của Nguyễn Văn Dev', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 15:08:58.653+07');
INSERT INTO public.activity_logs VALUES ('6feebf4c-010d-46bc-8201-348daf4951c8', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '0286dbc7-1d27-4f89-9cd4-a37259b0c193', 'Thanh toán 2.000đ cho Nguyễn Văn Dev', NULL, 'PROCESSING', 'Cập nhật trạng thái thanh toán của Nguyễn Văn Dev thành PROCESSING', '{"workspace_member_id": "0efad0be-7734-4d6d-8a03-8f4194dd133f"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 15:09:22.695+07');
INSERT INTO public.activity_logs VALUES ('c3755db5-43b8-49e7-a8d3-f86a3777ac0a', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '0286dbc7-1d27-4f89-9cd4-a37259b0c193', 'Thanh toán 2.000đ cho Nguyễn Văn Dev', NULL, 'PAID', 'Cập nhật trạng thái thanh toán của Nguyễn Văn Dev thành PAID (Mã GD: jguvt)', '{"workspace_member_id": "0efad0be-7734-4d6d-8a03-8f4194dd133f"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 15:09:43.227+07');
INSERT INTO public.activity_logs VALUES ('26634c25-79bc-401e-a635-d52af3c0d6ff', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '0636f15a-3028-4e8c-bc04-2cb7f524a2e0', 'Thanh toán 18.000.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 18.000.000 VND cho Nguyễn Văn Dev (Hệ thống Quản lý kho Logistics (DevHub Client))', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "b10c0e2f-c1df-4be6-bca7-35532929ee24"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:02:28.606+07');
INSERT INTO public.activity_logs VALUES ('ac60fdbe-42a2-48a5-b8ca-1bc35f4294a2', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '0636f15a-3028-4e8c-bc04-2cb7f524a2e0', 'Hủy yêu cầu thanh toán của Nguyễn Văn Dev', NULL, NULL, 'Đã hủy yêu cầu thanh toán 18.000.000đ của Nguyễn Văn Dev', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:04:01.735+07');
INSERT INTO public.activity_logs VALUES ('255a1fca-cbfc-4f13-82a6-c754f2f4fffe', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '30dcb470-3381-49ab-9029-738d1ca93876', 'Thanh toán 18.000.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 18.000.000 VND cho Nguyễn Văn Dev (Hệ thống Quản lý kho Logistics (DevHub Client))', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "b10c0e2f-c1df-4be6-bca7-35532929ee24"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:04:06.896+07');
INSERT INTO public.activity_logs VALUES ('4e8d0c81-ff86-4643-a6fc-a90d0d620004', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '30dcb470-3381-49ab-9029-738d1ca93876', 'Hủy yêu cầu thanh toán của Nguyễn Văn Dev', NULL, NULL, 'Đã hủy yêu cầu thanh toán 18.000.000đ của Nguyễn Văn Dev', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:04:35.468+07');
INSERT INTO public.activity_logs VALUES ('adf40c35-b2db-4499-8246-a25fdd1ce3ca', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '2d8ea097-4828-43a4-8565-dd0f63a9c3e4', 'Thanh toán 2.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 2.000 VND cho Nguyễn Văn Dev (Hệ thống Quản lý kho Logistics (DevHub Client))', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "b10c0e2f-c1df-4be6-bca7-35532929ee24"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:04:48.722+07');
INSERT INTO public.activity_logs VALUES ('d98d405e-cd02-49fa-a5ca-1da9c0d3e236', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_PROCESSED', 'payment', '2d8ea097-4828-43a4-8565-dd0f63a9c3e4', 'Hủy yêu cầu thanh toán của Nguyễn Văn Dev', NULL, NULL, 'Đã hủy yêu cầu thanh toán 2.000đ của Nguyễn Văn Dev', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:05:37.862+07');
INSERT INTO public.activity_logs VALUES ('14d8515e-9efa-4991-84b2-0541ad52a421', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'PAYMENT_CREATED', 'payment', '43088efd-1732-49f6-9fd5-e66e783e269d', 'Thanh toán 18.000.000đ cho Nguyễn Văn Dev', NULL, NULL, 'Tạo yêu cầu thanh toán 18.000.000 VND cho Nguyễn Văn Dev (Hệ thống Quản lý kho Logistics (DevHub Client))', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66", "workspace_member_id": "b10c0e2f-c1df-4be6-bca7-35532929ee24"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:05:47.707+07');
INSERT INTO public.activity_logs VALUES ('a4d3c337-9a61-4208-b63b-eebd0d0a4b16', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Nguyễn Văn Dev', 'CANDIDATE', 'TASK_STATUS_CHANGED', 'task', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'DW-1431: Test Login', 'IN_PROGRESS', 'REVIEW', 'Nộp sản phẩm lần 1, chuyển trạng thái: Đang làm → Chờ duyệt (task "DW-1431: Test Login")', '{"workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 19:48:36.964+07');
INSERT INTO public.activity_logs VALUES ('1ba71844-f18e-4b9d-a418-d96e09829c02', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', 'ADMIN', 'USER_LOGOUT', 'user', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'DevHub Admin', NULL, NULL, 'DevHub Admin đã đăng xuất', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 22:07:06.617+07');
INSERT INTO public.activity_logs VALUES ('8db5b6ea-3d4f-423c-b715-bb3effd63b25', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', 'EMPLOYER', 'USER_LOGIN', 'user', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'Trần Nhà Tuyển Dụng', NULL, NULL, 'Trần Nhà Tuyển Dụng đã đăng nhập vào hệ thống', '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '2026-10-30 22:07:41.035+07');


--
-- Data for Name: application_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.application_status_history VALUES ('7baf28f6-cb8f-4735-b153-19ac7e28b192', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'PENDING', 'Hồ sơ vừa được nộp', '2026-10-23 20:45:11.324+07');
INSERT INTO public.application_status_history VALUES ('f291ef7d-aa23-489f-be58-e4db735629b7', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'INTERVIEW', NULL, '2026-10-23 21:32:12.967+07');
INSERT INTO public.application_status_history VALUES ('4b687d56-3977-4f49-a7fe-2ae840ac4c52', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'VIEWED', NULL, '2026-10-23 21:34:51.379+07');
INSERT INTO public.application_status_history VALUES ('84f0214a-d596-42ac-a765-c55b5d303080', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'INTERVIEW', NULL, '2026-10-23 21:35:03.506+07');
INSERT INTO public.application_status_history VALUES ('3d2893d3-a2af-451b-b009-45a41324f46f', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'HIRED', NULL, '2026-10-23 21:35:16.649+07');
INSERT INTO public.application_status_history VALUES ('723231fa-23f2-4166-9434-287545569920', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'REJECTED', NULL, '2026-10-23 21:35:27.977+07');
INSERT INTO public.application_status_history VALUES ('6d6072ae-66d0-418b-a17a-3943cc5c1a1d', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'VIEWED', NULL, '2026-10-24 17:03:36.135+07');
INSERT INTO public.application_status_history VALUES ('682da749-3396-4459-ae61-bc0ba3bae9b7', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'INTERVIEW', NULL, '2026-10-30 22:18:04.818+07');
INSERT INTO public.application_status_history VALUES ('c27a0f27-7425-4423-8fdb-dc10bb106f17', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'REJECTED', NULL, '2026-10-30 22:20:38.834+07');
INSERT INTO public.application_status_history VALUES ('32c28ec6-582f-40f9-a54b-fb6ae30790dd', '66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'HIRED', NULL, '2026-10-30 22:21:43.147+07');


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.applications VALUES ('5d562f3d-64d8-414b-a102-38ad03b3f4ad', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '0e526c0e-86d8-4579-ba90-150c5d7b58f7', 'Tôi rất thích môi trường chuyên nghiệp tại FPT Software và mong muốn được cống hiến lâu dài.', NULL, 'VIEWED', '2026-09-26 17:32:17.255+07', '2026-09-26 17:32:17.255+07');
INSERT INTO public.applications VALUES ('66c1e7a9-fc34-4867-a2e6-2daa651bdff2', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '9146785e-fd1e-476c-a82d-3546251da74d', 'helo ', '/uploads/cvs/CV_Software_Tester_Intern_DaoMinhNhut-1791299067388-161565902.pdf', 'HIRED', '2026-10-23 20:45:11.32+07', '2026-10-30 22:21:43.132+07');


--
-- Data for Name: candidate_cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate_cvs VALUES ('fcd04d9d-ae15-4285-84ae-c42c9c51a503', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'CV_Le_Thi_Code_React.pdf', 'https://example.com/cvs/CV_Le_Thi_Code_React.pdf', 'CV_Le_Thi_Code_React.pdf', NULL, false, '2026-10-22 19:37:01.411+07', '2026-10-29 22:56:50.276+07');
INSERT INTO public.candidate_cvs VALUES ('e9293bc5-36dc-4593-ba3e-85935db0b861', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'CV-internship_full_stack_Developer-Le_Thanh_Tan', '/uploads/cvs/CV-internship_full_stack_Developer-Le_Thanh_Tan-1793289410257-997249093.pdf', 'CV-internship_full_stack_Developer-Le_Thanh_Tan.pdf', 126218, true, '2026-10-29 22:56:50.281+07', '2026-10-29 22:56:50.281+07');
INSERT INTO public.candidate_cvs VALUES ('ed691ebb-ef5e-4816-be10-147f5589ea53', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'CV tester intern', '/uploads/cvs/CV_Software_Tester_Intern_DaoMinhNhut-1790586398555-46155785.pdf', 'CV_Software_Tester_Intern_DaoMinhNhut.pdf', 158570, false, '2026-09-28 16:06:38.591+07', '2026-10-30 19:22:05.621+07');
INSERT INTO public.candidate_cvs VALUES ('fa4e3cc1-1bd8-4e0d-9c55-7cca33eed904', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'CV_Software_Tester_Intern_DaoMinhNhut', '/uploads/cvs/CV_Software_Tester_Intern_DaoMinhNhut-1791299067388-161565902.pdf', 'CV_Software_Tester_Intern_DaoMinhNhut.pdf', 158570, false, '2026-10-06 22:04:27.418+07', '2026-10-30 19:22:05.621+07');
INSERT INTO public.candidate_cvs VALUES ('9248a1bd-35a2-401b-aac5-b7ca8dfc6a56', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'CV-internship_full_stack_Developer-Le_Thanh_Tan', '/uploads/cvs/CV-internship_full_stack_Developer-Le_Thanh_Tan-1793359714946-53709929.pdf', 'CV-internship_full_stack_Developer-Le_Thanh_Tan.pdf', 126218, false, '2026-10-30 18:28:34.979+07', '2026-10-30 19:22:05.621+07');
INSERT INTO public.candidate_cvs VALUES ('9d0c000c-2367-4640-8af4-ded95f8fa42d', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'CV-internship_full_stack_Developer-Le_Thanh_Tan', '/uploads/cvs/CV-internship_full_stack_Developer-Le_Thanh_Tan-1793362925595-507647246.pdf', 'CV-internship_full_stack_Developer-Le_Thanh_Tan.pdf', 76889, true, '2026-10-30 19:22:05.627+07', '2026-10-30 19:22:05.627+07');


--
-- Data for Name: candidate_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate_profiles VALUES ('2c5056d1-7578-4c20-b657-483d737cc3c9', '36fe63da-2f81-4530-96a7-4bd67ea88a2d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, '2026-09-26 17:55:23.246+07', '2026-09-26 17:55:23.246+07');
INSERT INTO public.candidate_profiles VALUES ('f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', '4e332674-295d-444c-a507-2d60b50f1be1', 'Frontend Developer', 'Chuyên gia React, UI/UX, thích viết code sạch.', NULL, NULL, 'https://github.com/lethicode', NULL, NULL, '/uploads/cvs/CV-internship_full_stack_Developer-Le_Thanh_Tan-1793289410257-997249093.pdf', 'CV-internship_full_stack_Developer-Le_Thanh_Tan', 9.00, '2026-09-26 17:32:17.237+07', '2026-10-29 22:56:50.279+07');
INSERT INTO public.candidate_profiles VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'Internship fullstack Developer', 'Final-year Software Engineering student with a strong foundation in Full-Stack Web Development (Spring Boot, Node.js, ReactJS) and Mobile Development (Android/Kotlin). Experienced in integrating AI services into production-grade applications. Seeking a Full-Stack Developer Internship position to contribute to scalable corporate software projects and further refine development skills.', '0372688572', 'Kha Van Can, Thu Duc, HCM', 'https://github.com/thanhtanmt', '', NULL, '/uploads/cvs/CV-internship_full_stack_Developer-Le_Thanh_Tan-1793362925595-507647246.pdf', 'CV-internship_full_stack_Developer-Le_Thanh_Tan', 8.50, '2026-09-26 17:32:17.237+07', '2026-10-30 21:24:03.251+07');


--
-- Data for Name: candidate_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'c68921a4-bd99-456e-9582-44e1f367028a', 'INTERMEDIATE', 1.5, 'MANUAL');
INSERT INTO public.candidate_skills VALUES ('f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'd1009b02-93eb-4707-8468-62345af8c63a', 'EXPERT', 3.0, 'MANUAL');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'b6dbabb9-e952-40b0-a17a-4f3d449c0af2', 'ADVANCED', 1.0, 'MANUAL');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'd1009b02-93eb-4707-8468-62345af8c63a', 'INTERMEDIATE', 1.0, 'MANUAL');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'e09f2d9c-8aff-46c0-a5be-1ea3b84bd7d7', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'b01896aa-61aa-4788-bbbd-0978659a6555', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '3d92719c-ec11-4fc3-a21f-b8f14243d2aa', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '8e148701-765b-4d4a-b873-d8b4a4c24b27', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'f91422af-8a3b-4ed3-b64f-45dbadb323e3', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '84850e2a-78b7-4e07-92f9-8492c3e21b27', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '215a36b5-d7ee-40ad-825f-c1a7a852b5d4', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '5417399f-e1e2-4434-a2d8-7c4a6a5552f5', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'f7832dad-28de-4c0a-b576-c2589d07c90f', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '58448363-6c20-4fc8-a15b-e8dc514fb065', 'BEGINNER', 0.0, 'CV');
INSERT INTO public.candidate_skills VALUES ('d2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '400acb28-69ab-48f1-8d45-d51a9b408c61', 'BEGINNER', 0.0, 'CV');


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.companies VALUES ('70ea000b-37fd-428f-b400-d22be6184df2', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'FPT Software', '0101248141', 'F-Town 3, Quận 9, TP.HCM', 'tuyendung@fpt.com', 'https://fptsoftware.com', '/uploads/images/img-1792765262952-195781710.jpg', 'Tập đoàn công nghệ hàng đầu Việt Nam', 'VERIFIED', '2026-09-26 17:32:17.232+07', '2026-10-29 20:36:49.226+07', false, NULL, NULL);


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.experiences VALUES ('798a0f19-c23a-4766-9c69-98a26e2dd9df', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Tester Intern ', 'FPT Softwave', '2026-01-01', NULL, 'Thực hiện kiểm thử web, thiết kế testcase, phối hợp vs team phát triển ', '2026-09-28 16:34:16.942+07', '2026-09-28 16:34:54.429+07', 'COMPANY', NULL, '[]', '[]', NULL);
INSERT INTO public.experiences VALUES ('42cce94e-3d3f-47ae-a718-37ade348794b', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Developer', 'Website shop bán quần áo', '2025-12-01', '2025-12-01', 'Xây dựng ứng dụng web bán quần áo trực tuyến với 4 vai trò (Admin, Seller, Shipper, User). Tích hợp đầy đủ luồng mua hàng (giỏ hàng, thanh toán, theo dõi đơn), quản lý sản phẩm có biến thể (size, màu sắc) và đăng nhập qua Google OAuth2.', '2026-10-30 18:29:57.137+07', '2026-10-30 18:29:57.137+07', 'PERSONAL', NULL, '["Xây dựng ứng dụng web bán quần áo trực tuyến với 4 vai trò (Admin, Seller, Shipper, User).", "Tích hợp đầy đủ luồng mua hàng (giỏ hàng, thanh toán, theo dõi đơn), quản lý sản phẩm có biến thể (size, màu sắc) và đăng nhập qua Google OAuth2.", "Triển khai kiến trúc MVC, lưu trữ ảnh Cloudinary và bảo mật hệ thống toàn diện với Spring Security."]', '["Java 17", "Spring Boot 3", "Spring Data JPA", "Spring Security", "Thymeleaf", "SQL Server", "Cloudinary", "Google OAuth2"]', 'https://github.com/thanhtanmt/doanLtw');
INSERT INTO public.experiences VALUES ('f81014a1-2b5b-4c18-b331-931c0bcb9217', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Developer', 'Website Quản lý nhân sự IT', '2026-03-01', '2026-06-01', 'Nền tảng quản trị nhân sự toàn diện hỗ trợ phân quyền đa vai trò (Admin, HR, Manager, Kế toán). Tự động hóa chấm công, tính lương và số hóa quy trình tuyển dụng.', '2026-10-30 18:29:57.149+07', '2026-10-30 18:29:57.149+07', 'PERSONAL', NULL, '["Xây dựng nền tảng quản trị nhân sự toàn diện hỗ trợ phân quyền đa vai trò (Admin, HR, Manager, Kế toán), tự động hóa chấm công, tính lương và số hóa quy trình tuyển dụng.", "Tích hợp AI (Google Gemini API) để tự động đọc, trích xuất dữ liệu CV và xây dựng HR Chatbot.", "Phát triển tính năng chấm công bằng công nghệ nhận diện khuôn mặt (face-api.js)."]', '["ReactJS", "Redux", "TailwindCSS", "Node.js", "Express", "MySQL", "Sequelize ORM", "Google Gemini API", "face-api.js"]', 'https://github.com/minhnhutZzz/WebsiteQuanLyNhanSuIT');
INSERT INTO public.experiences VALUES ('e2447aa9-42c8-4286-8bb0-add324d71568', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Developer', 'Ứng dụng học tiếng anh', '2026-03-01', '2026-06-01', NULL, '2026-10-30 18:29:57.15+07', '2026-10-30 18:29:57.15+07', 'PERSONAL', NULL, '["Xây dựng ứng dụng Android học tiếng Anh theo chuẩn kiến trúc MVVM và Clean Architecture, kết hợp Backend Node.js.", "Ứng dụng thuật toán lặp lại ngắt quãng (Spaced Repetition - SM-2) để tối ưu việc ghi nhớ từ vựng, hỗ trợ học offline và tự động đồng bộ (sync) dữ liệu khi có mạng.", "Tích hợp Google Gemini AI để tự động sinh từ vựng theo chủ đề, cùng hệ thống nhắc nhở thông minh (Background Workers) và theo dõi tiến độ học tập chi tiết (Streak, Accuracy)."]', '["Android", "Kotlin", "Jetpack Compose", "Hilt", "Room", "Retrofit", "Node.js", "MySQL", "Google Generative AI", "SM-2 Algorithm"]', 'https://github.com/thanhtanmt2/English-learning-app');
INSERT INTO public.experiences VALUES ('e59d6c79-9b6e-451b-90e9-c867cf985afb', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Developer', 'tool & extenision autofill google form', '2026-08-01', '2026-08-01', NULL, '2026-10-30 18:29:57.153+07', '2026-10-30 18:29:57.153+07', 'PERSONAL', NULL, '["Xây dựng công cụ web tự động điền Google Form thông qua trình duyệt Chromium thật (headful browser), kiến trúc Client–Server với Express backend và WebSocket realtime.", "Ứng dụng thuật toán Levenshtein Distance để tự động khớp câu hỏi với câu trả lời mà không cần tên chính xác 100%, hỗ trợ 8 loại câu hỏi (text, radio, checkbox, dropdown, linear scale, date/time, file upload) và form nhiều trang.", "Thiết kế cơ chế Pause/Resume (Human-in-the-loop) — tự động tạm dừng khi gặp lỗi (CAPTCHA, validation) để người dùng can thiệp thủ công, kết hợp Live Preview (WebSocket screenshot streaming) và hệ thống quản lý Chrome Profile riêng biệt, tự động xử lý orphaned processes và stale lock files."]', '["Node.js", "Express.js", "Puppeteer (Chromium Headful)", "WebSocket", "HTML/CSS/JavaScript", "REST API", "Levenshtein Distance Algorithm"]', 'https://github.com/thanhtanmt/autofill-gg-form');
INSERT INTO public.experiences VALUES ('527e90ba-2c56-4ca4-8432-f3e8178ec1a7', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'hehe', 'hehe', '2026-01-01', NULL, 'hehe', '2026-10-30 18:40:39.6+07', '2026-10-30 18:40:39.6+07', 'PROJECT', '798a0f19-c23a-4766-9c69-98a26e2dd9df', '["hehe"]', '["hehe"]', 'https://hehe.com');
INSERT INTO public.experiences VALUES ('78af4520-7fda-4482-a45d-01a4a6026ee3', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Backend Developer & Frontend Developer', 'E-Commerce Clothing Website', '2025-12-01', '2025-12-01', 'Team Project', '2026-10-30 19:23:21.929+07', '2026-10-30 19:23:21.929+07', 'PERSONAL', NULL, '["Developed a full-stack e-commerce web app supporting 4 roles (Admin, Seller, Shipper, Customer) with complete purchase, cart, and order tracking workflows.", "Implemented variant product management (size, color), Google OAuth2 authentication, Spring Security authorization, and Cloudinary cloud storage."]', '["Java 17", "Spring Boot 3", "Spring Data JPA", "Spring Security", "Thymeleaf", "SQL Server", "Cloudinary API", "Google OAuth2"]', 'https://github.com/thanhtanmt/doanLtw');
INSERT INTO public.experiences VALUES ('a0d0aa11-41c4-4b71-8292-4cc2035c6559', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Backend Developer', 'IT Human Resource Management System', '2026-03-01', '2026-06-01', 'Team Project', '2026-10-30 19:23:21.933+07', '2026-10-30 19:23:21.933+07', 'PERSONAL', NULL, '["Built a comprehensive multi-role HR platform automating time tracking, payroll calculation, and digitized recruitment workflows.", "Integrated Google Gemini AI for automated CV data parsing and HR Chatbot, along with facial recognition (face-api.js) for attendance tracking."]', '["ReactJS", "Redux", "Tailwind CSS", "Node.js", "Express.js", "MySQL", "Sequelize ORM", "Google Gemini API", "Face-api.js"]', 'https://github.com/thanhtanmt2/IT-Human-Resource-Management-System');
INSERT INTO public.experiences VALUES ('5a0f746b-2c45-40aa-bf1f-5fac1c9618b8', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Frontend Developer & Chatbot Developer', 'AI-Powered English Learning Mobile App', '2026-03-01', '2026-06-01', 'Team Project', '2026-10-30 19:23:21.936+07', '2026-10-30 19:23:21.936+07', 'PERSONAL', NULL, '["Developed a mobile application using MVVM and Clean Architecture with Spaced Repetition (SM-2) for vocabulary retention and offline data sync.", "Integrated Google Gemini AI for dynamic topic vocabulary generation, intelligent background study reminders, and progress tracking (Streak, Accuracy)."]', '["Android (Kotlin", "Jetpack Compose", "Hilt", "Room", "Retrofit)", "Node.js", "MySQL", "Google Generative AI", "SM-2 Algorithm"]', 'https://github.com/thanhtanmt2/English-learning-app');
INSERT INTO public.experiences VALUES ('325c82d4-5599-4f5a-8174-9984882ac7f5', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Developer', 'Automated Google Form Filling Tool', '2026-08-01', '2026-08-01', 'Personal Project', '2026-10-30 19:23:21.939+07', '2026-10-30 19:23:21.939+07', 'PERSONAL', NULL, '["Built a web tool utilizing Puppeteer and WebSockets for real-time automated Google Form filling across 8 question types and multi-page forms.", "Applied Levenshtein Distance for fuzzy question-answer matching and engineered a Human-in-the-Loop mechanism to pause on CAPTCHA/validation errors."]', '["Node.js", "Express.js", "Puppeteer (Headful Chromium)", "WebSockets", "REST API", "Levenshtein Distance Algorithm"]', 'https://github.com/thanhtanmt/autofill-gg-form');
INSERT INTO public.experiences VALUES ('71537612-f152-49db-b575-4b12d6502eea', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'dddđ', 'ddddd', '2023-01-30', NULL, 'jeje', '2026-10-30 21:34:42.97+07', '2026-10-30 21:34:42.97+07', 'PERSONAL', NULL, '["jejej"]', '["jeje"]', 'https://hehe.com');


--
-- Data for Name: internal_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.internal_projects VALUES ('ad390df8-7a23-43b8-8bb1-e429adc855a2', 'c2dde144-6a41-4472-9e1a-34156fe34968', 'Hệ thống Quản lý kho Logistics', 'Xây dựng dashboard và API quản lý nhập xuất tồn.', 15000000.00, '2026-09-20', '2026-10-20', NULL, 'IN_PROGRESS', 35.00, '2026-09-20 22:55:27.607+07', '2026-09-20 22:55:27.607+07');


--
-- Data for Name: job_post_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.job_post_skills VALUES ('9146785e-fd1e-476c-a82d-3546251da74d', 'c68921a4-bd99-456e-9582-44e1f367028a');
INSERT INTO public.job_post_skills VALUES ('0e526c0e-86d8-4579-ba90-150c5d7b58f7', 'd1009b02-93eb-4707-8468-62345af8c63a');


--
-- Data for Name: job_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.job_posts VALUES ('0e526c0e-86d8-4579-ba90-150c5d7b58f7', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', '70ea000b-37fd-428f-b400-d22be6184df2', 'Senior React Developer (Toàn thời gian)', 'FPT Software tuyển dụng Senior React Developer tham gia dự án thương mại điện tử quốc tế. Cơ hội thăng tiến và chế độ đãi ngộ hấp dẫn.', 'PARTNER', 'FULL_TIME', 'TP. Hồ Chí Minh', 25000000.00, 40000000.00, 2, '2026-09-26 17:32:17.248+07', NULL, 'CLOSED', 4, '2026-09-26 17:32:17.248+07', '2026-10-30 22:24:39.884+07', '- Tối thiểu 4 năm kinh nghiệm phát triển web với ReactJS/TypeScript
- Thành thạo Redux/React Query, Tailwind CSS hoặc Styled-components
- Có kinh nghiệm tối ưu hiệu năng, viết unit test (Jest, React Testing Library)
- Hiểu quy trình CI/CD, làm việc tốt với Git
- Có khả năng review code và hướng dẫn thành viên mới', '- Lương tháng 13, thưởng dự án và thưởng hiệu suất theo quý
- Bảo hiểm sức khỏe cao cấp cho bản thân và người thân
- Du lịch công ty hằng năm, team building hằng quý
- Ngân sách đào tạo, chứng chỉ quốc tế lên tới 20 triệu/năm
- Môi trường làm việc quốc tế, cơ hội onsite', 'Y2_5', 'SENIOR', 'F-Town 3, Quận 9, TP. Hồ Chí Minh', 'Thứ 2 – Thứ 6 (8h30 – 17h30), linh hoạt giờ vào');
INSERT INTO public.job_posts VALUES ('9146785e-fd1e-476c-a82d-3546251da74d', '9c17353a-74e0-4f9c-af7e-616a4ea7da36', '70ea000b-37fd-428f-b400-d22be6184df2', 'Backend Node.js Engineer (Remote)', 'Tuyển kỹ sư Backend thành thạo Node.js, Express, PostgreSQL. Làm việc từ xa linh hoạt, đánh giá theo hiệu quả công việc.', 'PARTNER', 'REMOTE', 'Toàn quốc', 20000000.00, 35000000.00, 3, '2026-09-26 17:32:17.248+07', NULL, 'CLOSED', 17, '2026-09-26 17:32:17.248+07', '2026-10-30 22:27:02.894+07', '- Từ 2 năm kinh nghiệm với Node.js (Express/NestJS)
- Thành thạo PostgreSQL, thiết kế RESTful API
- Biết Docker, Redis; ưu tiên có kinh nghiệm AWS
- Có tư duy bảo mật và tối ưu truy vấn
- Giao tiếp tốt, chủ động trong công việc từ xa', '- Làm việc 100% từ xa, giờ giấc linh hoạt
- Hỗ trợ thiết bị và chi phí internet hằng tháng
- Thưởng dự án, xét tăng lương 2 lần/năm
- Bảo hiểm đầy đủ theo quy định, nghỉ phép 14 ngày/năm
- Cơ hội tham gia các dự án quốc tế', 'Y2_5', 'MIDDLE', NULL, 'Linh hoạt, trùng ít nhất 4 giờ với team (9h – 17h)');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notifications VALUES ('10e092f7-9fe9-4f51-9c9a-87e2d73989cb', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: REVIEWING', NULL, true, '{"log_id": "d1d27c37-0eb2-46c6-a804-42246123df8d", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-06 22:20:14.355+07');
INSERT INTO public.notifications VALUES ('ee28ae8a-17f6-4208-9916-eafedfc85119', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', NULL, true, '{"log_id": "150fa1b8-2256-4746-a53b-a68a1431949f", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-06 22:20:12.273+07');
INSERT INTO public.notifications VALUES ('9bdf354f-2f3f-4c7b-9bd3-1143833d8dc4', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: ACCEPTED', NULL, true, '{"log_id": "47176197-047e-4456-acaa-96eb91190c6b", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-06 22:20:05.159+07');
INSERT INTO public.notifications VALUES ('1819d71f-3c32-40d1-b986-f2ea21e3fa70', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', NULL, true, '{"log_id": "3fa65e53-bff5-4ca2-b899-4b1a659c905e", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-06 22:20:01.538+07');
INSERT INTO public.notifications VALUES ('6a9d50a1-bd76-4bea-be7f-1fca8e01e41f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: INTERVIEW', NULL, true, '{"log_id": "b4529345-21eb-48cb-862b-bc9aac32348e", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-08 21:28:55.973+07');
INSERT INTO public.notifications VALUES ('051df94c-079b-4ecb-90d5-d6ccfe75168e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: REVIEWING', NULL, true, '{"log_id": "5a2e7431-aa66-473e-afe0-c427949484b4", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "9be0af8c-d476-4b05-bb2a-6826b130d8bd"}', '2026-10-06 22:19:56.196+07');
INSERT INTO public.notifications VALUES ('ac80e695-6c4e-499f-b914-52a32577db3e', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Nguyễn Văn Dev đã chuyển sang trạng thái: ACCEPTED', NULL, true, '{"log_id": "b1736085-f5c9-4464-ad9c-f769d55d7894", "user_id": "aa1af617-5227-4f42-a47b-7c4dd00250dd", "project_job_id": "ba2deb92-cee0-401d-b797-4d862a7d3e70"}', '2026-10-10 18:48:43.302+07');
INSERT INTO public.notifications VALUES ('4fb9dd39-fee1-44ee-8199-6f2d8680d191', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'TASK_STATUS_CHANGED', '⏳ Task chờ duyệt', 'Task "Thiết kế màn hình login " đã được nộp sản phẩm (lần 1) và đang chờ duyệt', '/admin/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=be7df978-8cac-4793-99b4-bc0638db5a99', true, '{"task_id": "be7df978-8cac-4793-99b4-bc0638db5a99", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:18:05.051+07');
INSERT INTO public.notifications VALUES ('6a84b72e-ae06-4d52-bd03-d1d20295aa4a', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_APPROVED', '✅ Task được duyệt', 'Task "Thiết kế màn hình login " đã được duyệt ✅: ok', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=be7df978-8cac-4793-99b4-bc0638db5a99', true, '{"log_id": "dec036f7-0c0c-4d26-9667-4a296cd24865", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:20:09.48+07');
INSERT INTO public.notifications VALUES ('cef2e5ad-f207-49b4-bfa0-33aa74ac2680', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_COMMENT', '💬 Bình luận mới trong task', 'DevHub Admin đã bình luận trong task "Thiết kế màn hình login ":
"ok"', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=be7df978-8cac-4793-99b4-bc0638db5a99', true, '{"task_id": "be7df978-8cac-4793-99b4-bc0638db5a99", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:19:31.855+07');
INSERT INTO public.notifications VALUES ('3df99ea7-7001-4b9b-9449-d4bfb48cc68e', '4e332674-295d-444c-a507-2d60b50f1be1', 'PROJECT_UPDATE', '✏️ Task được cập nhật', 'DevHub Admin đã cập nhật task "Tối ưu Responsive trên máy tính bảng":
• Đổi deadline thành 2026-10-30', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=fb021814-8742-4569-bb9c-310db0f6ccbc', true, '{"task_id": "fb021814-8742-4569-bb9c-310db0f6ccbc", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:15:37.99+07');
INSERT INTO public.notifications VALUES ('15f5eb13-e623-42d8-9313-27a714e07fbe', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'TASK_STATUS_CHANGED', '⏳ Task chờ duyệt', 'Task "Tối ưu Responsive trên máy tính bảng" đã được nộp sản phẩm (lần 1) và đang chờ duyệt', '/admin/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=fb021814-8742-4569-bb9c-310db0f6ccbc', true, '{"task_id": "fb021814-8742-4569-bb9c-310db0f6ccbc", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:22:24.083+07');
INSERT INTO public.notifications VALUES ('453054a8-938d-40cb-a1c1-c50586f676cb', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'TASK_COMMENT', '💬 Bình luận mới trong task', 'Lê Thị Code đã bình luận trong task "Thiết kế màn hình login ":
"dạ"', '/admin/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=be7df978-8cac-4793-99b4-bc0638db5a99', true, '{"task_id": "be7df978-8cac-4793-99b4-bc0638db5a99", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:22:37.301+07');
INSERT INTO public.notifications VALUES ('380f7896-ca5d-4cd1-b500-bc48da29ecca', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'TASK_ASSIGNED', '📌 Bạn được giao task mới', 'Task: "DW-1431: Test Login" đã được giao cho bạn', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', true, '{"task_id": "1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 18:54:42.239+07');
INSERT INTO public.notifications VALUES ('e2ed4570-a209-44f5-bbd9-0072c49134ac', '4e332674-295d-444c-a507-2d60b50f1be1', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Lê Thị Code đã chuyển sang trạng thái: REJECTED', NULL, true, '{"log_id": "7c50b7e1-82f2-4371-bb44-47fb45a35d24", "user_id": "4e332674-295d-444c-a507-2d60b50f1be1", "project_job_id": "986306d2-ccda-42e3-bf64-d6f894ec68bb"}', '2026-10-10 18:48:06.806+07');
INSERT INTO public.notifications VALUES ('3e51a108-d773-46cc-be5a-60fe5d182576', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_REVISION', '↩️ Task yêu cầu chỉnh sửa', 'Yêu cầu chỉnh sửa task "Tối ưu Responsive trên máy tính bảng": chưa ổn, đang lỗi khi tối ưu', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=fb021814-8742-4569-bb9c-310db0f6ccbc', true, '{"log_id": "d9fdb8ca-f5a6-400f-9d2f-cce47373126f", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:27:38.446+07');
INSERT INTO public.notifications VALUES ('f2ba70c7-97b0-4d65-a404-bf5fb83ea47a', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_ASSIGNED', '📌 Bạn được giao task mới', 'DevHub Admin đã giao cho bạn task "Tối ưu Responsive trên máy tính bảng".
Ưu tiên: Bình thường', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=fb021814-8742-4569-bb9c-310db0f6ccbc', true, '{"task_id": "fb021814-8742-4569-bb9c-310db0f6ccbc", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-16 20:14:06.224+07');
INSERT INTO public.notifications VALUES ('261cd1b7-75ea-41fc-aa4a-c2b46db82fec', '4e332674-295d-444c-a507-2d60b50f1be1', 'APPLICATION_STATUS', '📋 Đơn ứng tuyển cập nhật', 'Đơn ứng tuyển của Lê Thị Code đã chuyển sang trạng thái: ACCEPTED', NULL, true, '{"log_id": "71ec07ac-b512-4d0b-813c-aa54bc5bfb95", "user_id": "4e332674-295d-444c-a507-2d60b50f1be1", "project_job_id": "986306d2-ccda-42e3-bf64-d6f894ec68bb"}', '2026-10-10 18:48:18.728+07');
INSERT INTO public.notifications VALUES ('edb0795e-f752-4459-810f-41925bd4f790', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_ASSIGNED', '📌 Bạn được giao task mới', 'Task: "Thiết kế màn hình login " đã được giao cho bạn', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66', true, '{"task_id": "be7df978-8cac-4793-99b4-bc0638db5a99", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-10 19:07:41.863+07');
INSERT INTO public.notifications VALUES ('5e6fc94b-9c6b-4b62-892c-737ca5b5351d', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_ASSIGNED', '📌 Task mới được tạo', 'Tạo task "Thiết kế màn hình login " trong workspace', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66', true, '{"log_id": "66baabde-4889-4e3f-961d-5ab57a058886", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-10 19:07:41.882+07');
INSERT INTO public.notifications VALUES ('098a6346-7b23-476f-85d5-8a8e2292ed02', '4e332674-295d-444c-a507-2d60b50f1be1', 'TASK_APPROVED', '✅ Task được duyệt', 'Task "Tích hợp bảng quét mã vạch sản phẩm" đã được duyệt ✅: tốt', '/candidate/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66', true, '{"log_id": "775a9eaf-f19f-4f83-ac92-d4bce5310804", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-10 20:39:59.632+07');
INSERT INTO public.notifications VALUES ('6ec16cea-751e-4696-98ce-3d86c3e68f50', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', 'Hồ sơ của bạn đã được xem', 'FPT Software đã xem hồ sơ ứng tuyển vị trí "Backend Node.js Engineer (Remote)" của bạn.', '/candidate/applications', false, '{"status": "VIEWED", "application_id": "66c1e7a9-fc34-4867-a2e6-2daa651bdff2"}', '2026-10-24 17:03:36.139+07');
INSERT INTO public.notifications VALUES ('f994c5b2-a349-4a12-a026-81abb2ec5105', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 2.000đ cho bạn tại WS - Kiểm thử phần mềm . Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "0286dbc7-1d27-4f89-9cd4-a37259b0c193"}', '2026-10-29 22:53:18.571+07');
INSERT INTO public.notifications VALUES ('51bb4c57-2448-4cb5-8180-b344141dbcb5', '4e332674-295d-444c-a507-2d60b50f1be1', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 12.000.000đ cho bạn tại WS - Logistics Dashboard. Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "bb5f6261-7270-454b-922d-4da3b0f5fc53"}', '2026-10-29 22:54:07.506+07');
INSERT INTO public.notifications VALUES ('62e83aa0-5dcb-4d1b-9329-7ef2bf8a7b3a', '4e332674-295d-444c-a507-2d60b50f1be1', 'PAYMENT_UPDATE', 'Khoản thanh toán đang được xử lý', 'Khoản thanh toán 12.000.000đ của bạn (WS - Logistics Dashboard) đang được xử lý.', '/candidate/profile?tab=payment', false, '{"status": "PROCESSING", "payment_id": "bb5f6261-7270-454b-922d-4da3b0f5fc53"}', '2026-10-29 23:00:55.333+07');
INSERT INTO public.notifications VALUES ('0fb44dbf-1a99-4363-a5a2-b3c8e7a0262c', '4e332674-295d-444c-a507-2d60b50f1be1', 'PAYMENT_UPDATE', 'Thanh toán không thành công', 'Khoản thanh toán 12.000.000đ của bạn (WS - Logistics Dashboard) chưa thanh toán được, vui lòng kiểm tra lại thông tin tài khoản ngân hàng trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"status": "FAILED", "payment_id": "bb5f6261-7270-454b-922d-4da3b0f5fc53"}', '2026-10-29 23:00:58.992+07');
INSERT INTO public.notifications VALUES ('2a613216-2978-45c1-b6da-f1675180ff59', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 18.000.000đ cho bạn tại WS - Logistics Dashboard. Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "866aab87-ab20-42d5-9456-786e9d223dfd"}', '2026-10-29 23:05:59.742+07');
INSERT INTO public.notifications VALUES ('27229f81-6355-472b-9715-259561eb9474', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 2.000đ cho bạn tại WS - Kiểm thử phần mềm . Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "47707465-9dfe-4af3-a789-23abb8f6573b"}', '2026-10-29 23:15:45.649+07');
INSERT INTO public.notifications VALUES ('c193c183-9c21-4574-934d-072c05916030', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Khoản thanh toán đang được xử lý', 'Khoản thanh toán 2.000đ của bạn (Kiểm thử phần mềm ) đang được xử lý.', '/candidate/profile?tab=payment', false, '{"status": "PROCESSING", "payment_id": "0286dbc7-1d27-4f89-9cd4-a37259b0c193"}', '2026-10-30 15:09:22.698+07');
INSERT INTO public.notifications VALUES ('ab86c09b-73df-460d-b1e4-df97c57747a2', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Bạn đã được thanh toán thù lao', 'Khoản thanh toán 2.000đ của bạn (Kiểm thử phần mềm ) đã được chuyển khoản thành công. Mã giao dịch: jguvt.', '/candidate/profile?tab=payment', true, '{"status": "PAID", "payment_id": "0286dbc7-1d27-4f89-9cd4-a37259b0c193"}', '2026-10-30 15:09:43.23+07');
INSERT INTO public.notifications VALUES ('5294303c-202c-4c8f-9778-57d0435427e3', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 18.000.000đ cho bạn tại dự án "Hệ thống Quản lý kho Logistics (DevHub Client)". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "0636f15a-3028-4e8c-bc04-2cb7f524a2e0"}', '2026-10-30 19:02:28.617+07');
INSERT INTO public.notifications VALUES ('4b5a04df-23dd-4951-8b2f-1ac19af6ed37', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 18.000.000đ cho bạn tại dự án "Hệ thống Quản lý kho Logistics (DevHub Client)". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "30dcb470-3381-49ab-9029-738d1ca93876"}', '2026-10-30 19:04:06.901+07');
INSERT INTO public.notifications VALUES ('22f5801c-3099-424a-a48e-2256fdf2bcf7', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 2.000đ cho bạn tại dự án "Hệ thống Quản lý kho Logistics (DevHub Client)". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "2d8ea097-4828-43a4-8565-dd0f63a9c3e4"}', '2026-10-30 19:04:48.725+07');
INSERT INTO public.notifications VALUES ('c4fec617-1796-4279-8d32-6eda2a6aed73', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'PAYMENT_UPDATE', 'Có khoản thanh toán mới cho bạn', 'Admin vừa tạo khoản thanh toán 18.000.000đ cho bạn tại dự án "Hệ thống Quản lý kho Logistics (DevHub Client)". Hãy kiểm tra thông tin nhận tiền trong hồ sơ.', '/candidate/profile?tab=payment', false, '{"payment_id": "43088efd-1732-49f6-9fd5-e66e783e269d"}', '2026-10-30 19:05:47.711+07');
INSERT INTO public.notifications VALUES ('677b399b-425e-427e-9c23-d8a4e203f306', 'db7c670f-1493-4391-8c34-722b0e3a487e', 'TASK_STATUS_CHANGED', '⏳ Task chờ duyệt', 'Task "DW-1431: Test Login" đã được nộp sản phẩm (lần 1) và đang chờ duyệt', '/admin/workspaces/5308bacc-baeb-4e27-a2ae-a7d777efdb66?task=1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', false, '{"task_id": "1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4", "workspace_id": "5308bacc-baeb-4e27-a2ae-a7d777efdb66"}', '2026-10-30 19:48:36.971+07');
INSERT INTO public.notifications VALUES ('9b5f2f0a-80c5-4cac-a516-7b427f96662b', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', 'Bạn được mời phỏng vấn', 'FPT Software mời bạn vào vòng phỏng vấn cho vị trí "Backend Node.js Engineer (Remote)". Hãy chú ý email và điện thoại để nhận lịch.', '/candidate/applications', false, '{"status": "INTERVIEW", "application_id": "66c1e7a9-fc34-4867-a2e6-2daa651bdff2"}', '2026-10-30 22:18:04.823+07');
INSERT INTO public.notifications VALUES ('a6d9db0d-90f6-4ffd-b7a9-f3b2dd02480c', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', 'Kết quả ứng tuyển', 'FPT Software chưa thể tiếp nhận hồ sơ vị trí "Backend Node.js Engineer (Remote)" của bạn lần này. Cảm ơn bạn đã quan tâm, hãy tiếp tục ứng tuyển các vị trí khác.', '/candidate/applications', false, '{"status": "REJECTED", "application_id": "66c1e7a9-fc34-4867-a2e6-2daa651bdff2"}', '2026-10-30 22:20:38.836+07');
INSERT INTO public.notifications VALUES ('f94dfb92-ce2d-484c-849a-c13a0bca4b6f', 'aa1af617-5227-4f42-a47b-7c4dd00250dd', 'APPLICATION_STATUS', 'Chúc mừng, bạn đã trúng tuyển!', 'FPT Software đã nhận bạn vào vị trí "Backend Node.js Engineer (Remote)". Bộ phận nhân sự sẽ sớm liên hệ để trao đổi chi tiết.', '/candidate/applications', true, '{"status": "HIRED", "application_id": "66c1e7a9-fc34-4867-a2e6-2daa651bdff2"}', '2026-10-30 22:21:43.159+07');


--
-- Data for Name: payment_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payment_information VALUES ('0317517e-2b21-45c9-89d0-8118a71cffb5', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'LE THANH TAN', 'BIDV', '5820179540', 'ACTIVE', '2026-10-29 22:52:26.728+07', '2026-10-29 22:52:26.728+07');
INSERT INTO public.payment_information VALUES ('8399b9a3-fc5f-4f69-866c-34632eb40c20', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'LE THANH TAN', 'BIDV', '5820179540', 'ACTIVE', '2026-09-28 16:32:38.141+07', '2026-10-30 19:39:58.142+07');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payments VALUES ('e3974730-24e1-4d18-9978-d94634d754da', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 4000000.00, NULL, NULL, 'PAID', '2026-09-26 17:32:17.289+07', '2026-09-26 17:32:17.289+07');
INSERT INTO public.payments VALUES ('0286dbc7-1d27-4f89-9cd4-a37259b0c193', '0efad0be-7734-4d6d-8a03-8f4194dd133f', 2000.00, 'VIETQR', 'jguvt', 'PAID', '2026-10-30 15:09:43.186+07', '2026-10-29 22:53:18.549+07');
INSERT INTO public.payments VALUES ('43088efd-1732-49f6-9fd5-e66e783e269d', 'b10c0e2f-c1df-4be6-bca7-35532929ee24', 18000000.00, 'VIETQR', NULL, 'PENDING', NULL, '2026-10-30 19:05:47.693+07');


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_applications VALUES ('9c73909a-fad5-4841-ab87-7c319bcae70a', '9be0af8c-d476-4b05-bb2a-6826b130d8bd', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'có kinh nghiệm kiểm thử ', '/uploads/cvs/CV_Software_Tester_Intern_DaoMinhNhut-1790586398555-46155785.pdf', 'INTERVIEW', '2026-10-10 09:35:00+07', 'https://meet.google.com/byj-geof-stk', 'đến trước 30 phút ', '2026-10-06 22:15:03.354+07', '2026-10-08 21:36:02.376+07');
INSERT INTO public.project_applications VALUES ('00d5f656-85b1-4e4b-abcf-dd7f2c609f5f', '986306d2-ccda-42e3-bf64-d6f894ec68bb', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', 'Tôi có nhiều kinh nghiệm làm giao diện React Dashboard và cam kết hoàn thành đúng deadline.', NULL, 'ACCEPTED', NULL, NULL, NULL, '2026-09-26 17:32:17.268+07', '2026-10-10 18:48:18.706+07');
INSERT INTO public.project_applications VALUES ('08d927df-9d37-4554-8959-504f718dc0f2', 'ba2deb92-cee0-401d-b797-4d862a7d3e70', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'Tôi thành thạo Node.js và PostgreSQL, tự tin làm tốt hệ thống này.', NULL, 'ACCEPTED', NULL, NULL, NULL, '2026-09-26 17:32:17.268+07', '2026-10-10 18:48:43.278+07');


--
-- Data for Name: project_job_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_job_skills VALUES ('ba2deb92-cee0-401d-b797-4d862a7d3e70', 'c68921a4-bd99-456e-9582-44e1f367028a');
INSERT INTO public.project_job_skills VALUES ('986306d2-ccda-42e3-bf64-d6f894ec68bb', 'd1009b02-93eb-4707-8468-62345af8c63a');
INSERT INTO public.project_job_skills VALUES ('9be0af8c-d476-4b05-bb2a-6826b130d8bd', 'c68921a4-bd99-456e-9582-44e1f367028a');
INSERT INTO public.project_job_skills VALUES ('9be0af8c-d476-4b05-bb2a-6826b130d8bd', 'b6dbabb9-e952-40b0-a17a-4f3d449c0af2');


--
-- Data for Name: project_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.project_jobs VALUES ('ba2deb92-cee0-401d-b797-4d862a7d3e70', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Backend Node.js & Database Developer (Dự án Kho)', 'Thiết kế cơ sở dữ liệu PostgreSQL và viết RESTful API quản lý hàng tồn, báo cáo doanh thu. Yêu cầu viết code sạch, chuẩn REST.', 18000000.00, 1, '2026-11-01 23:59:59+07', 'OPEN', '2026-09-26 17:32:17.262+07', '2026-10-23 16:36:27.405+07', '- Thành thạo Node.js (Express) và PostgreSQL
- Biết thiết kế cơ sở dữ liệu quan hệ, viết truy vấn tối ưu
- Hiểu xác thực JWT và phân quyền theo vai trò
- Viết code sạch, tuân thủ chuẩn REST', '- Thù lao thanh toán ngay sau khi nghiệm thu
- Được đánh giá năng lực và cộng điểm vào hồ sơ DevHub
- Hỗ trợ kỹ thuật từ đội ngũ quản lý dự án', 'Y1_2');
INSERT INTO public.project_jobs VALUES ('986306d2-ccda-42e3-bf64-d6f894ec68bb', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Frontend React Developer (Dự án Kho)', 'Xây dựng giao diện Dashboard, Kanban điều phối và bảng kê kho bằng React + Tailwind CSS. Thời gian dự kiến 1 tháng.', 12000000.00, 1, '2026-11-01 23:59:59+07', 'OPEN', '2026-09-26 17:32:17.262+07', '2026-10-23 16:36:45.467+07', '- Thành thạo ReactJS, Tailwind CSS, gọi API bằng Axios/React Query
- Biết dựng giao diện Dashboard, bảng dữ liệu và biểu đồ
- Có khả năng làm việc theo task trên bảng Kanban
- Cam kết hoàn thành đúng hạn', '- Thù lao thanh toán ngay sau khi nghiệm thu từng task
- Được đánh giá năng lực và cộng điểm vào hồ sơ DevHub
- Làm việc trực tiếp trong Workspace với quản lý dự án
- Có cơ hội ký tiếp các dự án dài hạn', 'UNDER_1');
INSERT INTO public.project_jobs VALUES ('9be0af8c-d476-4b05-bb2a-6826b130d8bd', '984eb3bb-3c69-4db3-8b7c-a184b14d4f76', 'tester intern ', 'tiếng anh tốt, có kiến thức nền tảng về kiểm thử phần mềm ', 2000.00, 2, '2026-11-01 23:59:59+07', 'OPEN', '2026-10-06 22:13:43.191+07', '2026-10-23 16:37:03.052+07', '- Sinh viên năm 3 trở lên chuyên ngành CNTT hoặc tương đương
- Hiểu quy trình kiểm thử phần mềm cơ bản, biết viết test case
- Đọc hiểu tài liệu tiếng Anh tốt
- Cẩn thận, chủ động và có tinh thần học hỏi', '- Được hướng dẫn quy trình kiểm thử thực tế
- Có xác nhận kinh nghiệm và đánh giá năng lực sau dự án
- Thời gian linh hoạt phù hợp lịch học', 'NONE');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects VALUES ('984eb3bb-3c69-4db3-8b7c-a184b14d4f76', 'Kiểm thử phần mềm ', 'dự án tiến hành kiểm thử website quản lý nhân sự IT ', 30000.00, '2026-10-06', '2026-10-28', NULL, 'RECRUITING', 0.00, 'db7c670f-1493-4391-8c34-722b0e3a487e', NULL, '2026-10-06 22:12:58.817+07', '2026-10-06 22:12:58.817+07');
INSERT INTO public.projects VALUES ('5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'Hệ thống Quản lý kho Logistics (DevHub Client)', 'Xây dựng toàn diện ứng dụng web quản lý nhập, xuất, tồn kho hàng hóa và tích hợp mã QR.', 30000000.00, '2026-09-26', '2026-11-10', NULL, 'RECRUITING', 60.00, 'db7c670f-1493-4391-8c34-722b0e3a487e', NULL, '2026-09-26 17:32:17.259+07', '2026-10-23 23:43:48.881+07');


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
INSERT INTO public.skills VALUES ('680b8ee1-708a-459d-a68b-91185aee9310', 'Azure', 'Azure skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('fe41cce7-2ced-49ca-8a9e-d283cbf17a26', 'GCP', 'GCP skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('58448363-6c20-4fc8-a15b-e8dc514fb065', 'Git', 'Git skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('6f493b31-b75c-41b6-acb2-ef3eb80722f0', 'CI/CD', 'CI/CD skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('8ec294db-d8db-4af6-8442-c9434223356a', 'GraphQL', 'GraphQL skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('400acb28-69ab-48f1-8d45-d51a9b408c61', 'REST API', 'REST API skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('b6dbabb9-e952-40b0-a17a-4f3d449c0af2', 'Figma', 'Figma skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('c730b201-a760-4628-a61e-60ed2b68c917', 'UI/UX Design', 'UI/UX Design skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-09-26 17:32:16.314+07');
INSERT INTO public.skills VALUES ('a57f615c-5778-47ea-9307-6cc2510d34f6', 'AWS', 'AWS skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-10-01 11:27:22.853+07');
INSERT INTO public.skills VALUES ('94c14711-6783-4048-a43a-21a84bbbb24c', 'Angular', 'Angular skill', 'ACTIVE', '2026-09-26 17:32:16.314+07', '2026-10-01 11:40:18.963+07');


--
-- Data for Name: sub_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.sub_tasks VALUES ('99d17dbe-e377-4f78-846a-fa5a5bf93b95', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', '1. Viết Testcase', true, 0, '2026-10-16 18:54:42.229+07', '2026-10-30 19:48:09.8+07');
INSERT INTO public.sub_tasks VALUES ('912359f8-835c-4bc4-ac06-5fbeb26b06ea', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', '2. Test màn hình login', true, 1, '2026-10-16 18:54:42.229+07', '2026-10-30 19:48:10.85+07');


--
-- Data for Name: task_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.task_activities VALUES ('0b868db6-84a5-45f5-add1-0d5949fdfd79', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'TASK_CREATED', NULL, NULL, 'Tạo task: Thiết kế màn hình login ', '2026-10-10 19:07:41.854+07');
INSERT INTO public.task_activities VALUES ('39bdac55-4e33-4d23-b0c6-55a37cf88e51', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', NULL, 'STATUS_CHANGED', 'IN_PROGRESS', 'REVIEW', 'Chuyển trạng thái: Đang làm → Chờ duyệt', '2026-10-10 20:39:29.639+07');
INSERT INTO public.task_activities VALUES ('7c9fda5f-0668-436e-9ba1-e9af3be6a783', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', NULL, 'TASK_APPROVED', NULL, NULL, 'Nghiệm thu: duyệt hoàn thành — "tốt"', '2026-10-10 20:39:59.603+07');
INSERT INTO public.task_activities VALUES ('f55f4bb6-f6cf-4e74-869c-6a94ed9b08e9', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'STATUS_CHANGED', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm', '2026-10-10 20:41:44.399+07');
INSERT INTO public.task_activities VALUES ('a9a31bd2-566a-4f01-a1f7-1b068196ddbc', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'STATUS_CHANGED', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: Đang làm → Cần làm', '2026-10-10 20:42:32.022+07');
INSERT INTO public.task_activities VALUES ('f39bcef4-678b-496d-910b-bd0613821253', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'STATUS_CHANGED', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm', '2026-10-10 20:42:35.602+07');
INSERT INTO public.task_activities VALUES ('78e3489a-12fb-4627-b4f9-a97b11dd1279', 'be7df978-8cac-4793-99b4-bc0638db5a99', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'PROGRESS', '0%', '100%', 'Cập nhật tiến độ: 0% → 100%', '2026-10-10 21:19:18.514+07');
INSERT INTO public.task_activities VALUES ('8ae23189-da9f-4efb-be6d-ef2af00bbf9b', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', NULL, 'TASK_CREATED', NULL, NULL, 'Tạo task "DW-1431: Test Login"', '2026-10-16 18:54:42.233+07');
INSERT INTO public.task_activities VALUES ('704c652b-bf99-4bf1-99ca-7ca93b266443', 'fb021814-8742-4569-bb9c-310db0f6ccbc', NULL, 'ASSIGNED', NULL, NULL, 'Cập nhật người thực hiện', '2026-10-16 20:14:06.213+07');
INSERT INTO public.task_activities VALUES ('996fbc04-5876-403f-a8e6-7f6600955090', 'fb021814-8742-4569-bb9c-310db0f6ccbc', NULL, 'UPDATED', NULL, '2026-10-30', 'Đổi deadline thành 2026-10-30', '2026-10-16 20:15:37.98+07');
INSERT INTO public.task_activities VALUES ('6e7888c7-b532-4fca-94a0-dc779099f957', 'be7df978-8cac-4793-99b4-bc0638db5a99', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'SUBMITTED', NULL, '1', 'Nộp sản phẩm lần 1 và gửi duyệt', '2026-10-16 20:18:05.039+07');
INSERT INTO public.task_activities VALUES ('1b9b2ecb-a2ac-4178-a816-10af50bb8393', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'TASK_APPROVED', NULL, NULL, 'Nghiệm thu: duyệt hoàn thành — "ok"', '2026-10-16 20:20:09.469+07');
INSERT INTO public.task_activities VALUES ('225e4b6b-3f65-4e54-9701-1c88cd06c0a8', 'fb021814-8742-4569-bb9c-310db0f6ccbc', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'STATUS_CHANGED', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm', '2026-10-16 20:21:30.889+07');
INSERT INTO public.task_activities VALUES ('24fa04e7-ed89-4cc8-ba56-20a510e5a4b5', 'fb021814-8742-4569-bb9c-310db0f6ccbc', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'SUBMITTED', NULL, '1', 'Nộp sản phẩm lần 1 và gửi duyệt', '2026-10-16 20:22:24.074+07');
INSERT INTO public.task_activities VALUES ('9db64681-79a6-41bb-90dc-70e174fe38fa', 'fb021814-8742-4569-bb9c-310db0f6ccbc', NULL, 'TASK_REVISION', NULL, NULL, 'Yêu cầu chỉnh sửa: "chưa ổn, đang lỗi khi tối ưu"', '2026-10-16 20:27:38.433+07');
INSERT INTO public.task_activities VALUES ('e4a84e17-1c72-406f-91ff-8dbf49785a11', 'fb021814-8742-4569-bb9c-310db0f6ccbc', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'PROGRESS', '90%', '70%', 'Cập nhật tiến độ: 90% → 70%', '2026-10-16 20:29:11.917+07');
INSERT INTO public.task_activities VALUES ('5a2e3120-f827-481f-b63b-5a0be8e6381a', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'b10c0e2f-c1df-4be6-bca7-35532929ee24', 'STATUS_CHANGED', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm', '2026-10-23 20:43:08.268+07');
INSERT INTO public.task_activities VALUES ('814398ba-3af5-4a2f-8d6b-c04c9aa2e174', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'b10c0e2f-c1df-4be6-bca7-35532929ee24', 'STATUS_CHANGED', 'IN_PROGRESS', 'TODO', 'Chuyển trạng thái: Đang làm → Cần làm', '2026-10-23 20:43:12.272+07');
INSERT INTO public.task_activities VALUES ('054f18e3-fb34-4917-a366-c84bede5c2fc', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'b10c0e2f-c1df-4be6-bca7-35532929ee24', 'STATUS_CHANGED', 'TODO', 'IN_PROGRESS', 'Chuyển trạng thái: Cần làm → Đang làm', '2026-10-23 20:43:13.807+07');
INSERT INTO public.task_activities VALUES ('bb3352c9-0de3-4d6a-a26e-9d0c20266c85', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'b10c0e2f-c1df-4be6-bca7-35532929ee24', 'SUBMITTED', NULL, '1', 'Nộp sản phẩm lần 1 và gửi duyệt', '2026-10-30 19:48:36.961+07');


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.task_assignees VALUES ('cab2ac0c-46ff-4fc2-9504-fb5ada47d13e', 'da791a3f-2797-49e5-b109-fcc450cea6d1', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');
INSERT INTO public.task_assignees VALUES ('4661d680-2ba2-4a8c-810c-c5044683cdb1', 'e8aa6cb6-fc74-441f-adc1-b18300d45426', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');
INSERT INTO public.task_assignees VALUES ('6b25345c-6e38-438f-92db-d29a1cfbed8b', 'be7df978-8cac-4793-99b4-bc0638db5a99', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');
INSERT INTO public.task_assignees VALUES ('70f1f1a3-2f62-4203-93a2-8b4c3ed1ca84', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'b10c0e2f-c1df-4be6-bca7-35532929ee24');
INSERT INTO public.task_assignees VALUES ('47f42a86-c2b8-4ed7-beaa-b1a3ad375999', 'fb021814-8742-4569-bb9c-310db0f6ccbc', '7143368a-c50f-4f6b-84a4-a4c8569f78ae');


--
-- Data for Name: task_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.task_comments VALUES ('41fd1cbc-234b-4c1b-81be-6e0aa8bb01c3', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, 'ok', '2026-10-16 20:19:31.841+07', '2026-10-16 20:19:31.841+07', 'db7c670f-1493-4391-8c34-722b0e3a487e');
INSERT INTO public.task_comments VALUES ('08532024-9a82-4649-a3df-0f03cc58d90b', 'be7df978-8cac-4793-99b4-bc0638db5a99', '7143368a-c50f-4f6b-84a4-a4c8569f78ae', 'dạ', '2026-10-16 20:22:37.286+07', '2026-10-16 20:22:37.286+07', '4e332674-295d-444c-a507-2d60b50f1be1');


--
-- Data for Name: task_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.task_submissions VALUES ('79bcfea8-f986-4a50-b6e5-6177f1c7f484', 'be7df978-8cac-4793-99b4-bc0638db5a99', NULL, '/uploads/tasks/Bao_cao_tuan_6-1792156677651-79192182.docx?name=B%C3%A1o%20c%C3%A1o%20tu%E1%BA%A7n%206.docx', 'em đã làm xong', 1, 'ACCEPTED', '2026-10-16 20:18:05.025+07');
INSERT INTO public.task_submissions VALUES ('cb00693c-6f9b-48ea-b98c-2010d1658cea', 'fb021814-8742-4569-bb9c-310db0f6ccbc', NULL, '/uploads/tasks/TC_Tieng_Anh_12-1792156941747-925798414.xlsx?name=TC_Ti%E1%BA%BFng%20Anh%2012.xlsx', NULL, 1, 'REVISION_REQUIRED', '2026-10-16 20:22:24.063+07');
INSERT INTO public.task_submissions VALUES ('703dc1f6-59c2-4d6a-bd76-119dd43c6b6c', '1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', 'https://hehe.com', NULL, NULL, 1, 'PENDING_REVIEW', '2026-10-30 19:48:36.952+07');


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tasks VALUES ('da791a3f-2797-49e5-b109-fcc450cea6d1', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Thiết kế giao diện Dashboard kho', 'Tạo layout thống kê số lượng hàng nhập xuất tồn theo tuần.', 'MEDIUM', 'DONE', '{}', NULL, NULL, NULL, 100, 0, NULL, NULL, NULL, 'PENDING', '2026-09-26 17:32:17.278+07', '2026-09-26 17:32:17.278+07');
INSERT INTO public.tasks VALUES ('e8aa6cb6-fc74-441f-adc1-b18300d45426', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Tích hợp bảng quét mã vạch sản phẩm', 'Xây dựng component quét và nhập liệu tức thời.', 'MEDIUM', 'DONE', '{}', NULL, NULL, NULL, 100, 1, 'tốt', NULL, '2026-10-10 20:39:59.587+07', 'APPROVED', '2026-09-26 17:32:17.278+07', '2026-10-10 20:39:59.597+07');
INSERT INTO public.tasks VALUES ('be7df978-8cac-4793-99b4-bc0638db5a99', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Thiết kế màn hình login ', 'Thiết kế màn hình login đơn giản, dễ sử dụng', 'HIGH', 'DONE', '{Frontend,Backend,Design}', '2026-10-15 07:00:00+07', 2.00, NULL, 100, 2, 'ok', NULL, '2026-10-16 20:20:09.456+07', 'APPROVED', '2026-10-10 19:07:41.814+07', '2026-10-16 20:20:09.459+07');
INSERT INTO public.tasks VALUES ('fb021814-8742-4569-bb9c-310db0f6ccbc', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'Tối ưu Responsive trên máy tính bảng', 'Kiểm thử hiển thị trên màn hình iPad và tablet công nghiệp.', 'MEDIUM', 'IN_PROGRESS', '{Feature}', '2026-10-30 07:00:00+07', NULL, NULL, 70, 0, 'chưa ổn, đang lỗi khi tối ưu', NULL, '2026-10-16 20:27:38.416+07', 'REVISION_REQUIRED', '2026-09-26 17:32:17.278+07', '2026-10-23 23:48:56.834+07');
INSERT INTO public.tasks VALUES ('1a7acb0e-c2c0-4571-9eb1-9bb16ed60da4', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'DW-1431: Test Login', 'Viết Testcase và tiến hành kiểm thử màn hình login ', 'HIGH', 'REVIEW', '{Testing}', '2026-10-24 07:00:00+07', NULL, NULL, 0, 0, NULL, NULL, NULL, 'PENDING', '2026-10-16 18:54:42.218+07', '2026-10-30 19:48:36.959+07');


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

INSERT INTO public.users VALUES ('36fe63da-2f81-4530-96a7-4bd67ea88a2d', '23110282@student.hcmute.edu.vn', '$2a$12$8X7PXXymdwebWo2Z.FKfLOxdNcbjHMFeDS7.qoMrEHYxeS7LkWPDS', 'Đào Minh Nhựt ', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:50:39.239+07', '2026-10-09 21:15:25.801+07', NULL, NULL);
INSERT INTO public.users VALUES ('4e332674-295d-444c-a507-2d60b50f1be1', 'dev2@gmail.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Lê Thị Code', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-10-29 19:44:56.726+07', NULL, NULL);
INSERT INTO public.users VALUES ('db7c670f-1493-4391-8c34-722b0e3a487e', 'admin@devhub.vn', '$2a$12$eH0DtaDA8561du8X4fItiu5aNrwHsaC8VpcvBtkFhePftmj2Y6Lju', 'DevHub Admin', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:16.774+07', '2026-10-29 19:57:19.369+07', NULL, NULL);
INSERT INTO public.users VALUES ('f676e1a5-3807-4995-b14c-310100cd183a', 'daominhnhut2017@gmail.com', '$2a$12$6TAJnajRVlI.3XN80IUe/.RnotRxg2br2s2v9/YdTh.m7m.xMbgxi', 'Đào Minh Nhựt ', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:37:03.079+07', '2026-10-06 21:47:39.897+07', NULL, NULL);
INSERT INTO public.users VALUES ('9c17353a-74e0-4f9c-af7e-616a4ea7da36', 'employer@fpt.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Trần Nhà Tuyển Dụng', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-10-29 20:46:11.105+07', '/uploads/images/img-1792765262952-195781710.jpg', NULL);
INSERT INTO public.users VALUES ('aa1af617-5227-4f42-a47b-7c4dd00250dd', 'dev1@gmail.com', '$2a$12$dbttXWm6g2VzIWvIyNqSFe2BmBAhERQtl/QegGEikCiZ/IMVyZ132', 'Nguyễn Văn Dev', 'ACTIVE', true, NULL, NULL, NULL, NULL, '2026-09-26 17:32:17.228+07', '2026-10-30 21:24:03.243+07', NULL, NULL);


--
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workspace_members VALUES ('7143368a-c50f-4f6b-84a4-a4c8569f78ae', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'f37c66fb-d3cc-4aad-a7e3-6ae8b88dafa8', '986306d2-ccda-42e3-bf64-d6f894ec68bb', 'MEMBER', '2026-09-26 17:32:17.275+07', 'ACTIVE');
INSERT INTO public.workspace_members VALUES ('0efad0be-7734-4d6d-8a03-8f4194dd133f', '681f19d2-32f7-4280-9698-2db0eaa0a031', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', '9be0af8c-d476-4b05-bb2a-6826b130d8bd', 'MEMBER', '2026-10-06 22:20:05.147+07', 'ACTIVE');
INSERT INTO public.workspace_members VALUES ('b10c0e2f-c1df-4be6-bca7-35532929ee24', '5308bacc-baeb-4e27-a2ae-a7d777efdb66', 'd2acdae6-3cbe-4d92-825e-a9a0bb84cf8f', 'ba2deb92-cee0-401d-b797-4d862a7d3e70', 'MEMBER', '2026-10-10 18:48:43.286+07', 'ACTIVE');


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workspaces VALUES ('5308bacc-baeb-4e27-a2ae-a7d777efdb66', '5a67fe4f-871b-4303-bcbf-ea3d7a0d6718', 'WS - Logistics Dashboard', 'ACTIVE', '2026-09-26 17:32:17.271+07', '2026-09-26 17:32:17.271+07');
INSERT INTO public.workspaces VALUES ('681f19d2-32f7-4280-9698-2db0eaa0a031', '984eb3bb-3c69-4db3-8b7c-a184b14d4f76', 'WS - Kiểm thử phần mềm ', 'ACTIVE', '2026-10-06 22:12:58.823+07', '2026-10-06 22:12:58.823+07');


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
-- Name: internal_projects internal_projects_job_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_projects
    ADD CONSTRAINT internal_projects_job_post_id_key UNIQUE (job_post_id);


--
-- Name: internal_projects internal_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_projects
    ADD CONSTRAINT internal_projects_pkey PRIMARY KEY (id);


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
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


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
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


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
-- Name: idx_experiences_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_experiences_parent ON public.experiences USING btree (parent_id);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_task_attachments_task; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_attachments_task ON public.task_attachments USING btree (task_id);


--
-- Name: uq_applications_candidate_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_applications_candidate_job ON public.applications USING btree (candidate_profile_id, job_post_id);


--
-- Name: uq_payments_workspace_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_payments_workspace_member ON public.payments USING btree (workspace_member_id);


--
-- Name: uq_project_applications_candidate_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_project_applications_candidate_job ON public.project_applications USING btree (candidate_profile_id, project_job_id);


--
-- Name: uq_workspace_members_workspace_candidate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_workspace_members_workspace_candidate ON public.workspace_members USING btree (workspace_id, candidate_profile_id);


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
-- Name: experiences experiences_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.experiences(id) ON DELETE CASCADE;


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
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: task_attachments task_attachments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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

\unrestrict KzeFxcsSL3wRSRF1Yup8Vecg23cYIYU7hzay9ZqVl8FsSaw9gZMawFQTTa72Bk3

