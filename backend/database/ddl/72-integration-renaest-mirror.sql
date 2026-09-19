-- Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0 sha256:101ecde2758bd6092f78463c18aa9048dc08acfb0893cd998dacadb3b06f5956

-- Regenerable-only DDL for BP-INTEGRATION-RENAEST-MIRROR-001; request-path writes use role_app_backend.

create schema if not exists integration;

create table if not exists integration.renaest_mirror (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_id uuid not null,
  protocol varchar(160),
  national_status varchar(60),
  rectifications_json jsonb default '[]'::jsonb not null,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_renaest_mirror primary key (id),
  constraint ck_integration_renaest_mirror_status check (national_status is null or national_status in ('RECEBIDO','EM_ANALISE','CONSOLIDADO','REJEITADO')),
  constraint ck_integration_renaest_mirror_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_integration_renaest_mirror_crash on integration.renaest_mirror (tenant_id, crash_id);
create index if not exists ix_integration_renaest_mirror_status on integration.renaest_mirror (tenant_id, national_status);
create index if not exists ix_integration_renaest_mirror_protocol on integration.renaest_mirror (tenant_id, protocol);
create index if not exists ix_renaest_mirror_tenant_id on integration.renaest_mirror (tenant_id);
create index if not exists ix_renaest_mirror_crash_id on integration.renaest_mirror (crash_id);
create index if not exists ix_renaest_mirror_last_event_id on integration.renaest_mirror (last_event_id);

create table if not exists integration.renaest_mirror_applied_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  projection_name varchar(80) not null,
  event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  applied_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_renaest_mirror_applied_event primary key (id),
  constraint ck_integration_renaest_mirror_applied_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_integration_renaest_mirror_applied_event on integration.renaest_mirror_applied_event (tenant_id, projection_name, event_id);
create index if not exists ix_integration_renaest_mirror_replay on integration.renaest_mirror_applied_event (tenant_id, projection_name, applied_at);
create index if not exists ix_renaest_mirror_applied_event_tenant_id on integration.renaest_mirror_applied_event (tenant_id);
create index if not exists ix_renaest_mirror_applied_event_event_id on integration.renaest_mirror_applied_event (event_id);

select auth.create_rls_policy('integration', 'renaest_mirror');

select auth.create_rls_policy('integration', 'renaest_mirror_applied_event');

select auth.install_tenant_triggers();

grant usage on schema integration to role_app_backend;

grant select, insert, update, delete on all tables in schema integration to role_app_backend;

grant usage, select on all sequences in schema integration to role_app_backend;
