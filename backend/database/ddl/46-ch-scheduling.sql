-- Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513

-- Regenerable-only DDL for BP-CH-SCHEDULING-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.professional_schedule (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  professional_id uuid not null,
  clinic_id uuid not null,
  weekday smallint not null,
  start_time time not null,
  end_time time not null,
  valid_from date not null,
  valid_to date,
  is_active boolean default true not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_professional_schedule primary key (id),
  constraint ck_ch_professional_schedule_weekday check (weekday between 0 and 6),
  constraint ck_ch_professional_schedule_time check (start_time < end_time),
  constraint ck_ch_professional_schedule_period check (valid_to is null or valid_to >= valid_from),
  constraint fk_ch_professional_schedule_professional foreign key (professional_id) references ch.professional (id),
  constraint fk_ch_professional_schedule_clinic foreign key (clinic_id) references ch.clinic (id)
);
create index if not exists ix_ch_professional_schedule_lookup on ch.professional_schedule (tenant_id, clinic_id, weekday, is_active);
create index if not exists ix_professional_schedule_tenant_id on ch.professional_schedule (tenant_id);
create index if not exists ix_professional_schedule_professional_id on ch.professional_schedule (professional_id);
create index if not exists ix_professional_schedule_clinic_id on ch.professional_schedule (clinic_id);

create table if not exists ch.appointment_assignment_draw (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  appointment_id uuid not null,
  track varchar(16) not null,
  region_code varchar(40) not null,
  requested_at timestamptz not null,
  seed_hex varchar(64) not null,
  considered_pool jsonb not null,
  selected_clinic_id uuid not null,
  selected_professional_id uuid not null,
  reroll_of uuid,
  reroll_reason text,
  superseded_at timestamptz,
  drawn_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_appointment_assignment_draw primary key (id),
  constraint ck_ch_appointment_assignment_track check (track in ('MEDICAL','PSYCH')),
  constraint ck_ch_appointment_assignment_seed check (seed_hex ~ '^[0-9a-f]{64}$'),
  constraint ck_ch_appointment_assignment_reroll check (reroll_of is null or (reroll_reason is not null and length(trim(reroll_reason)) > 0)),
  constraint fk_ch_appointment_assignment_appointment foreign key (appointment_id) references ch.appointment (id),
  constraint fk_ch_appointment_assignment_clinic foreign key (selected_clinic_id) references ch.clinic (id),
  constraint fk_ch_appointment_assignment_professional foreign key (selected_professional_id) references ch.professional (id),
  constraint fk_ch_appointment_assignment_reroll foreign key (reroll_of) references ch.appointment_assignment_draw (id)
);
create unique index if not exists ux_ch_appointment_assignment_track on ch.appointment_assignment_draw (tenant_id, appointment_id, track) where superseded_at is null;
create index if not exists ix_ch_appointment_assignment_professional on ch.appointment_assignment_draw (tenant_id, selected_professional_id, created_at);
create index if not exists ix_appointment_assignment_draw_tenant_id on ch.appointment_assignment_draw (tenant_id);
create index if not exists ix_appointment_assignment_draw_appointment_id on ch.appointment_assignment_draw (appointment_id);
create index if not exists ix_appointment_assignment_draw_selected_clinic_id on ch.appointment_assignment_draw (selected_clinic_id);
create index if not exists ix_appointment_assignment_draw_selected_professional_id on ch.appointment_assignment_draw (selected_professional_id);

select auth.create_rls_policy('ch', 'professional_schedule');

select auth.create_rls_policy('ch', 'appointment_assignment_draw');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
