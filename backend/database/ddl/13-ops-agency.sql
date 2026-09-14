-- Generated from BP-OPS-AGENCY-001 v1.0.0 sha256:afec0eee717d2c38412377687b43b37d2bc04ae65291d2f8a69cd1c15189af7f

-- Regenerable-only DDL for BP-OPS-AGENCY-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.agency_unit (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  name varchar(255) not null,
  external_code varchar(80),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_agency_unit primary key (id)
);
create unique index if not exists ux_ops_agency_unit_scope_id on ops.agency_unit (tenant_id, traffic_agency_id, id);
create unique index if not exists ux_ops_agency_unit_name on ops.agency_unit (tenant_id, traffic_agency_id, name);
create unique index if not exists ux_ops_agency_unit_external_code on ops.agency_unit (tenant_id, traffic_agency_id, external_code) where external_code is not null;
create index if not exists ix_agency_unit_tenant_id on ops.agency_unit (tenant_id);
create index if not exists ix_agency_unit_traffic_agency_id on ops.agency_unit (traffic_agency_id);

create table if not exists ops.agency_jurisdiction (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  name varchar(255) not null,
  external_code varchar(80),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_agency_jurisdiction primary key (id)
);
create unique index if not exists ux_ops_agency_jurisdiction_scope_id on ops.agency_jurisdiction (tenant_id, traffic_agency_id, id);
create unique index if not exists ux_ops_agency_jurisdiction_name on ops.agency_jurisdiction (tenant_id, traffic_agency_id, name);
create unique index if not exists ux_ops_agency_jurisdiction_external_code on ops.agency_jurisdiction (tenant_id, traffic_agency_id, external_code) where external_code is not null;
create index if not exists ix_agency_jurisdiction_tenant_id on ops.agency_jurisdiction (tenant_id);
create index if not exists ix_agency_jurisdiction_traffic_agency_id on ops.agency_jurisdiction (traffic_agency_id);

create table if not exists ops.agency_competence (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  agency_unit_id uuid not null,
  agency_jurisdiction_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_agency_competence primary key (id),
  constraint fk_ops_agency_competence_unit_scope foreign key (tenant_id, traffic_agency_id, agency_unit_id) references ops.agency_unit (tenant_id, traffic_agency_id, id),
  constraint fk_ops_agency_competence_jurisdiction_scope foreign key (tenant_id, traffic_agency_id, agency_jurisdiction_id) references ops.agency_jurisdiction (tenant_id, traffic_agency_id, id)
);
create unique index if not exists ux_ops_agency_competence_scope on ops.agency_competence (tenant_id, traffic_agency_id, agency_unit_id, agency_jurisdiction_id);
create index if not exists ix_ops_agency_competence_jurisdiction on ops.agency_competence (tenant_id, traffic_agency_id, agency_jurisdiction_id);
create index if not exists ix_agency_competence_tenant_id on ops.agency_competence (tenant_id);
create index if not exists ix_agency_competence_traffic_agency_id on ops.agency_competence (traffic_agency_id);
create index if not exists ix_agency_competence_agency_unit_id on ops.agency_competence (agency_unit_id);
create index if not exists ix_agency_competence_agency_jurisdiction_id on ops.agency_competence (agency_jurisdiction_id);

select auth.create_rls_policy('ops', 'agency_unit');

select auth.create_rls_policy('ops', 'agency_jurisdiction');

select auth.create_rls_policy('ops', 'agency_competence');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
