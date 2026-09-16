-- Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380

-- Regenerable-only DDL for BP-PORTAL-PROJECTIONS-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.infraction_view (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  subject_cpf_hash varchar(64) not null,
  ait_number varchar(40) not null,
  plate varchar(10) not null,
  occurred_at timestamptz not null,
  framing_label text not null,
  amount numeric(12,2),
  situation varchar(30) not null,
  deadlines_json jsonb not null,
  points_status varchar(20) not null,
  actions_json jsonb not null,
  notices_json jsonb not null,
  payment_json jsonb,
  last_event_id uuid not null,
  last_event_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_infraction_view primary key (id),
  constraint ck_portal_infraction_view_situation check (situation in ('aguardando_defesa','em_defesa','penalidade_aplicada','em_recurso','encerrada','cancelada','arquivada')),
  constraint ck_portal_infraction_view_points_status check (points_status in ('em_disputa','definitivo','none'))
);
create unique index if not exists ux_portal_infraction_view_ait on portal.infraction_view (tenant_id, ait_id);
create index if not exists ix_portal_infraction_view_subject on portal.infraction_view (tenant_id, subject_cpf_hash, situation);
create index if not exists ix_infraction_view_tenant_id on portal.infraction_view (tenant_id);
create index if not exists ix_infraction_view_ait_id on portal.infraction_view (ait_id);
create index if not exists ix_infraction_view_last_event_id on portal.infraction_view (last_event_id);

create table if not exists portal.process_timeline (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  request_id uuid,
  case_id uuid not null,
  entries_json jsonb not null,
  deadlines_json jsonb not null,
  decision_json jsonb,
  last_event_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_process_timeline primary key (id)
);
create unique index if not exists ux_portal_process_timeline_case on portal.process_timeline (tenant_id, case_id);
create index if not exists ix_process_timeline_tenant_id on portal.process_timeline (tenant_id);
create index if not exists ix_process_timeline_request_id on portal.process_timeline (request_id);
create index if not exists ix_process_timeline_case_id on portal.process_timeline (case_id);
create index if not exists ix_process_timeline_last_event_id on portal.process_timeline (last_event_id);

create table if not exists portal.points_view (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_cpf_hash varchar(64) not null,
  definitive_points integer not null,
  disputed_points integer not null,
  by_vehicle_json jsonb not null,
  last_12_months_json jsonb not null,
  last_event_id uuid,
  cached_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_points_view primary key (id),
  constraint ck_portal_points_view_points_non_negative check (definitive_points >= 0 and disputed_points >= 0)
);
create unique index if not exists ux_portal_points_view_subject on portal.points_view (tenant_id, subject_cpf_hash);
create index if not exists ix_points_view_tenant_id on portal.points_view (tenant_id);
create index if not exists ix_points_view_last_event_id on portal.points_view (last_event_id);

create table if not exists portal.crash_view (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_id uuid not null,
  subject_cpf_hash varchar(64) not null,
  state_label text not null,
  summary_json jsonb not null,
  third_party_fields_suppressed boolean not null,
  last_event_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_view primary key (id)
);
create unique index if not exists ux_portal_crash_view_crash on portal.crash_view (tenant_id, crash_id);
create index if not exists ix_portal_crash_view_subject on portal.crash_view (tenant_id, subject_cpf_hash);
create index if not exists ix_crash_view_tenant_id on portal.crash_view (tenant_id);
create index if not exists ix_crash_view_crash_id on portal.crash_view (crash_id);
create index if not exists ix_crash_view_last_event_id on portal.crash_view (last_event_id);

create table if not exists portal.exam_view (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  exam_id uuid not null,
  subject_cpf_hash varchar(64) not null,
  legal_label text not null,
  valid_until date,
  board_due_on date,
  last_event_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_exam_view primary key (id)
);
create unique index if not exists ux_portal_exam_view_exam on portal.exam_view (tenant_id, exam_id);
create index if not exists ix_portal_exam_view_subject on portal.exam_view (tenant_id, subject_cpf_hash);
create index if not exists ix_exam_view_tenant_id on portal.exam_view (tenant_id);
create index if not exists ix_exam_view_exam_id on portal.exam_view (exam_id);
create index if not exists ix_exam_view_last_event_id on portal.exam_view (last_event_id);

create table if not exists portal.projection_applied_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  event_id uuid not null,
  projection varchar(40) not null,
  applied_at timestamptz not null,
  last_error text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_projection_applied_event primary key (id)
);
create unique index if not exists ux_portal_projection_applied_event_event_projection on portal.projection_applied_event (tenant_id, event_id, projection);
create index if not exists ix_projection_applied_event_tenant_id on portal.projection_applied_event (tenant_id);
create index if not exists ix_projection_applied_event_event_id on portal.projection_applied_event (event_id);

create table if not exists portal.national_read_cache (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_id uuid not null,
  kind varchar(20) not null,
  target_id uuid,
  payload_json jsonb not null,
  cached_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_national_read_cache primary key (id),
  constraint ck_portal_national_read_cache_kind check (kind in ('cnh','vehicles','clearance'))
);
create unique index if not exists ux_portal_national_read_cache_subject_kind_target on portal.national_read_cache (tenant_id, subject_id, kind, coalesce(target_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists ix_national_read_cache_tenant_id on portal.national_read_cache (tenant_id);
create index if not exists ix_national_read_cache_subject_id on portal.national_read_cache (subject_id);
create index if not exists ix_national_read_cache_target_id on portal.national_read_cache (target_id);

select auth.create_rls_policy('portal', 'infraction_view');

select auth.create_rls_policy('portal', 'process_timeline');

select auth.create_rls_policy('portal', 'points_view');

select auth.create_rls_policy('portal', 'crash_view');

select auth.create_rls_policy('portal', 'exam_view');

select auth.create_rls_policy('portal', 'projection_applied_event');

select auth.create_rls_policy('portal', 'national_read_cache');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
