-- Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e

-- Regenerable-only DDL for BP-CH-INCONSISTENCIES-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.inconsistency (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid,
  source_system varchar(80) not null,
  severity varchar(16) not null,
  status varchar(16) default 'DETECTED' not null,
  detection_reason varchar(500) not null,
  detection_payload jsonb default '{}'::jsonb not null,
  correction jsonb default '{}'::jsonb not null,
  resolution_note text,
  notified_at timestamptz,
  corrected_at timestamptz,
  reprocessed_at timestamptz,
  closed_at timestamptz,
  due_at timestamptz not null,
  created_by uuid not null,
  updated_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_inconsistency primary key (id),
  constraint ck_ch_inconsistency_source check (source_system ~ '^[A-Z][A-Z0-9_]{1,79}$'),
  constraint ck_ch_inconsistency_severity check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  constraint ck_ch_inconsistency_status check (status in ('DETECTED','NOTIFIED','CORRECTED','REPROCESSED','CLOSED')),
  constraint ck_ch_inconsistency_timestamps check ((status = 'DETECTED') or (status = 'NOTIFIED' and notified_at is not null) or (status = 'CORRECTED' and notified_at is not null and corrected_at is not null) or (status = 'REPROCESSED' and notified_at is not null and corrected_at is not null and reprocessed_at is not null) or (status = 'CLOSED' and notified_at is not null and corrected_at is not null and reprocessed_at is not null and closed_at is not null)),
  constraint fk_ch_inconsistency_encounter foreign key (encounter_id) references ch.encounter (id)
);
create index if not exists ix_ch_inconsistency_status on ch.inconsistency (tenant_id, status, due_at);
create index if not exists ix_inconsistency_tenant_id on ch.inconsistency (tenant_id);
create index if not exists ix_inconsistency_encounter_id on ch.inconsistency (encounter_id);

select auth.create_rls_policy('ch', 'inconsistency');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
