-- Generated from BP-CH-TELEHEALTH-001 v1.0.0 sha256:1702fef12182de18153031eed0b113c29e2eaa1406ccd4477fea59340ea96206

-- Regenerable-only DDL for BP-CH-TELEHEALTH-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.telehealth_session (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  professional_id uuid not null,
  appointment_id uuid,
  provider varchar(64) not null,
  external_session_id varchar(255) not null,
  lfd_required boolean default true not null,
  lfd_passed boolean default false not null,
  status varchar(16) default 'STARTED' not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  conclusion jsonb default '{}'::jsonb not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_telehealth_session primary key (id),
  constraint ck_ch_telehealth_provider check (provider ~ '^[A-Z][A-Z0-9_]{1,63}$'),
  constraint ck_ch_telehealth_external_id check (external_session_id !~ '[/?#]' and length(trim(external_session_id)) > 0),
  constraint ck_ch_telehealth_status check (status in ('STARTED','COMPLETED','CANCELLED')),
  constraint ck_ch_telehealth_completion check (status <> 'COMPLETED' or (completed_at is not null and lfd_passed)),
  constraint fk_ch_telehealth_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_telehealth_professional foreign key (professional_id) references ch.professional (id),
  constraint fk_ch_telehealth_appointment foreign key (appointment_id) references ch.appointment (id)
);
create unique index if not exists ux_ch_telehealth_external on ch.telehealth_session (tenant_id, provider, external_session_id);
create index if not exists ix_ch_telehealth_encounter on ch.telehealth_session (tenant_id, encounter_id, status);
create index if not exists ix_telehealth_session_tenant_id on ch.telehealth_session (tenant_id);
create index if not exists ix_telehealth_session_encounter_id on ch.telehealth_session (encounter_id);
create index if not exists ix_telehealth_session_professional_id on ch.telehealth_session (professional_id);
create index if not exists ix_telehealth_session_appointment_id on ch.telehealth_session (appointment_id);
create index if not exists ix_telehealth_session_external_session_id on ch.telehealth_session (external_session_id);

select auth.create_rls_policy('ch', 'telehealth_session');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
