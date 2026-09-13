-- Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0 sha256:4e56ae0c6ab4db581d4cd4f3b88014f634c022cc45f8f991a54976b7da46feab

-- Regenerable-only DDL for BP-CH-PROCESS-BLOCKS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.process_block (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  block_kind varchar(64) not null,
  source_system varchar(64) default 'PEC' not null,
  message text,
  active boolean default true not null,
  created_by uuid not null,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_process_block primary key (id),
  constraint ck_ch_process_block_kind check (block_kind ~ '^[A-Z][A-Z0-9_]{1,63}$'),
  constraint ck_ch_process_block_resolution check ((active and resolved_by is null and resolved_at is null) or (not active and resolved_by is not null and resolved_at is not null)),
  constraint fk_ch_process_block_encounter foreign key (encounter_id) references ch.encounter (id)
);
create unique index if not exists ux_ch_process_block_active_source on ch.process_block (tenant_id, encounter_id, block_kind, source_system) where active;
create index if not exists ix_ch_process_block_encounter on ch.process_block (tenant_id, encounter_id, active);
create index if not exists ix_process_block_tenant_id on ch.process_block (tenant_id);
create index if not exists ix_process_block_encounter_id on ch.process_block (encounter_id);

select auth.create_rls_policy('ch', 'process_block');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
