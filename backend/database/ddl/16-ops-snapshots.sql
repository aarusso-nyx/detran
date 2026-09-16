-- Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734

-- Regenerable-only DDL for BP-OPS-SNAPSHOTS-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.snapshots_person (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  person_type varchar(40) not null,
  name varchar(255),
  cpf varchar(11),
  cnpj varchar(14),
  birth_date date,
  mother_name varchar(255),
  source varchar(60) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_snapshots_person primary key (id)
);
create index if not exists ix_snapshots_person_tenant_id_cpf on ops.snapshots_person (tenant_id, cpf);
create index if not exists ix_snapshots_person_tenant_id_cnpj on ops.snapshots_person (tenant_id, cnpj);
create index if not exists ix_snapshots_person_tenant_id on ops.snapshots_person (tenant_id);

create table if not exists ops.snapshots_person_document (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  person_id uuid not null,
  document_type varchar(40) not null,
  document_number varchar(80) not null,
  issuing_uf varchar(2),
  valid_until date,
  license_category varchar(20),
  status varchar(60),
  source varchar(60) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_snapshots_person_document primary key (id),
  constraint fk_ops_person_document_person foreign key (person_id) references ops.snapshots_person (id)
);
create index if not exists ix_snapshots_person_document_tenant_id_document_type_document_number on ops.snapshots_person_document (tenant_id, document_type, document_number);
create index if not exists ix_snapshots_person_document_tenant_id on ops.snapshots_person_document (tenant_id);
create index if not exists ix_snapshots_person_document_person_id on ops.snapshots_person_document (person_id);

create table if not exists ops.snapshots_vehicle (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  plate varchar(10) not null,
  renavam varchar(20),
  chassis varchar(40),
  uf varchar(2),
  municipality_code varchar(20),
  make_model varchar(255),
  species varchar(80),
  category varchar(80),
  color varchar(60),
  source varchar(60) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_snapshots_vehicle primary key (id)
);
create index if not exists ix_snapshots_vehicle_tenant_id_plate on ops.snapshots_vehicle (tenant_id, plate);
create index if not exists ix_snapshots_vehicle_tenant_id on ops.snapshots_vehicle (tenant_id);

create table if not exists ops.snapshots_external_query (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  user_ref uuid not null,
  agent_id uuid,
  device_id uuid,
  external_system_id uuid not null,
  query_type varchar(80) not null,
  parameters_hash varchar(128) not null,
  purpose varchar(80) not null,
  queried_at timestamptz default now() not null,
  status varchar(40) not null,
  protocol varchar(120),
  result_summary text,
  result_snapshot_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_snapshots_external_query primary key (id)
);
create index if not exists ix_snapshots_external_query_tenant_id_purpose_queried_at on ops.snapshots_external_query (tenant_id, purpose, queried_at);
create index if not exists ix_snapshots_external_query_tenant_id_parameters_hash on ops.snapshots_external_query (tenant_id, parameters_hash);
create index if not exists ix_snapshots_external_query_tenant_id on ops.snapshots_external_query (tenant_id);
create index if not exists ix_snapshots_external_query_traffic_agency_id on ops.snapshots_external_query (traffic_agency_id);
create index if not exists ix_snapshots_external_query_agent_id on ops.snapshots_external_query (agent_id);
create index if not exists ix_snapshots_external_query_device_id on ops.snapshots_external_query (device_id);
create index if not exists ix_snapshots_external_query_external_system_id on ops.snapshots_external_query (external_system_id);

create table if not exists ops.snapshots_vehicle_snapshot (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  vehicle_id uuid,
  plate_snapshot varchar(10) not null,
  renavam_snapshot varchar(20),
  make_model_snapshot varchar(255),
  species_snapshot varchar(80),
  category_snapshot varchar(80),
  color_snapshot varchar(60),
  data_source varchar(80) not null,
  external_query_id uuid,
  divergence_recorded boolean default false not null,
  payload_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_snapshots_vehicle_snapshot primary key (id),
  constraint fk_ops_vehicle_snapshot_vehicle foreign key (vehicle_id) references ops.snapshots_vehicle (id),
  constraint fk_ops_vehicle_snapshot_external_query foreign key (external_query_id) references ops.snapshots_external_query (id)
);
create index if not exists ix_snapshots_vehicle_snapshot_tenant_id_plate_snapshot on ops.snapshots_vehicle_snapshot (tenant_id, plate_snapshot);
create index if not exists ix_snapshots_vehicle_snapshot_tenant_id on ops.snapshots_vehicle_snapshot (tenant_id);
create index if not exists ix_snapshots_vehicle_snapshot_vehicle_id on ops.snapshots_vehicle_snapshot (vehicle_id);
create index if not exists ix_snapshots_vehicle_snapshot_external_query_id on ops.snapshots_vehicle_snapshot (external_query_id);

select auth.create_rls_policy('ops', 'snapshots_person');

select auth.create_rls_policy('ops', 'snapshots_person_document');

select auth.create_rls_policy('ops', 'snapshots_vehicle');

select auth.create_rls_policy('ops', 'snapshots_external_query');

select auth.create_rls_policy('ops', 'snapshots_vehicle_snapshot');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
