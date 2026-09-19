-- Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241

-- Regenerable-only DDL for BP-DASHBOARD-CRASHES-001; request-path writes use role_app_backend.

create schema if not exists dashboard;

create table if not exists dashboard.crash_aggregate (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  period_start date not null,
  municipality_code varchar(20) not null,
  severity varchar(60) not null,
  crash_count integer default 0 not null,
  last_event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_aggregate primary key (id),
  constraint ck_dashboard_crash_aggregate_count_non_negative check (crash_count >= 0),
  constraint ck_dashboard_crash_aggregate_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_crash_aggregate_cell on dashboard.crash_aggregate (tenant_id, period_start, municipality_code, severity);
create index if not exists ix_dashboard_crash_aggregate_period on dashboard.crash_aggregate (tenant_id, period_start, severity);
create index if not exists ix_crash_aggregate_tenant_id on dashboard.crash_aggregate (tenant_id);
create index if not exists ix_crash_aggregate_last_event_id on dashboard.crash_aggregate (last_event_id);

create table if not exists dashboard.crash_projection_applied_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  projection_name varchar(80) not null,
  event_id uuid not null,
  event_schema_version integer not null,
  aggregate_version integer not null,
  applied_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_projection_applied_event primary key (id),
  constraint ck_dashboard_crash_projection_versions_positive check (event_schema_version > 0 and aggregate_version > 0)
);
create unique index if not exists ux_dashboard_crash_projection_applied_event on dashboard.crash_projection_applied_event (tenant_id, projection_name, event_id);
create index if not exists ix_dashboard_crash_projection_replay on dashboard.crash_projection_applied_event (tenant_id, projection_name, applied_at);
create index if not exists ix_crash_projection_applied_event_tenant_id on dashboard.crash_projection_applied_event (tenant_id);
create index if not exists ix_crash_projection_applied_event_event_id on dashboard.crash_projection_applied_event (event_id);

select auth.create_rls_policy('dashboard', 'crash_aggregate');

select auth.create_rls_policy('dashboard', 'crash_projection_applied_event');

select auth.install_tenant_triggers();

grant usage on schema dashboard to role_app_backend;

grant select, insert, update, delete on all tables in schema dashboard to role_app_backend;

grant usage, select on all sequences in schema dashboard to role_app_backend;
