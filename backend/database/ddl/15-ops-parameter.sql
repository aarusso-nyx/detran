-- Generated from BP-OPS-PARAMETER-001 v1.0.0 sha256:3259251ebb1dfaccd776e889a446ca45db209b824d7760cc132d20c015e3e39e

-- Regenerable-only DDL for BP-OPS-PARAMETER-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.parameter (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid,
  scope text not null,
  surface text not null,
  key varchar(120) not null,
  value_json jsonb not null,
  value_type text not null,
  status text not null,
  source_pending boolean not null,
  legal_readonly boolean not null,
  decision_ref varchar(40) not null,
  legal_basis text,
  reason text not null,
  version int not null,
  effective_from date not null,
  effective_to date,
  changed_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_parameter primary key (id),
  constraint ck_parameter_scope check (scope in ('tenant', 'agency', 'surface')),
  constraint ck_parameter_surface check (surface in ('rait', 'teat', 'portal', 'est', 'dashboard', 'shared')),
  constraint ck_parameter_status check (status in ('vigente', 'a_confirmar', 'proposta')),
  constraint ck_parameter_version_positive check (version > 0),
  constraint ck_parameter_effective_range check (effective_to is null or effective_to >= effective_from)
);
create unique index if not exists ux_parameter_tenant_agency_surface_key_effective_from on ops.parameter (tenant_id, coalesce(traffic_agency_id, '00000000-0000-0000-0000-000000000000'::uuid), surface, key, effective_from);
create index if not exists ix_parameter_tenant_id on ops.parameter (tenant_id);
create index if not exists ix_parameter_traffic_agency_id on ops.parameter (traffic_agency_id);

select auth.create_rls_policy('ops', 'parameter');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
