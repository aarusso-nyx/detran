-- Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367

-- Regenerable-only DDL for BP-INF-MEASURES-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.measure_type (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(60) not null,
  name varchar(160) not null,
  description text,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_measure_type primary key (id)
);
create unique index if not exists ux_inf_measure_type_code on inf.measure_type (tenant_id, code);
create index if not exists ix_measure_type_tenant_id on inf.measure_type (tenant_id);

create table if not exists inf.administrative_measure (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  measure_type_id uuid not null,
  ait_id uuid,
  crash_record_id uuid,
  approach_id uuid,
  agent_id uuid not null,
  shift_id uuid not null,
  device_id uuid not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  location_json jsonb,
  reason text not null,
  current_status varchar(60) default 'started' not null,
  notes text,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_administrative_measure primary key (id),
  constraint fk_inf_measure_type foreign key (measure_type_id) references inf.measure_type (id),
  constraint fk_inf_measure_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_measure_approach foreign key (approach_id) references ops.ops_approach (id)
);
create index if not exists ix_inf_measure_status on inf.administrative_measure (tenant_id, traffic_agency_id, current_status);
create index if not exists gist_inf_measure_location on inf.administrative_measure using gist (location_geom);
create index if not exists ix_administrative_measure_tenant_id on inf.administrative_measure (tenant_id);
create index if not exists ix_administrative_measure_traffic_agency_id on inf.administrative_measure (traffic_agency_id);
create index if not exists ix_administrative_measure_measure_type_id on inf.administrative_measure (measure_type_id);
create index if not exists ix_administrative_measure_ait_id on inf.administrative_measure (ait_id);
create index if not exists ix_administrative_measure_crash_record_id on inf.administrative_measure (crash_record_id);
create index if not exists ix_administrative_measure_approach_id on inf.administrative_measure (approach_id);
create index if not exists ix_administrative_measure_agent_id on inf.administrative_measure (agent_id);
create index if not exists ix_administrative_measure_shift_id on inf.administrative_measure (shift_id);
create index if not exists ix_administrative_measure_device_id on inf.administrative_measure (device_id);

create table if not exists inf.administrative_term (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  measure_id uuid not null,
  term_type varchar(80) not null,
  term_number varchar(80) not null,
  content_hash varchar(128) not null,
  file_evidence_id uuid,
  issued_at timestamptz not null,
  signed_by_person_id uuid,
  status varchar(60) default 'issued' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_administrative_term primary key (id),
  constraint fk_inf_term_measure foreign key (measure_id) references inf.administrative_measure (id),
  constraint fk_inf_term_evidence foreign key (file_evidence_id) references ops.evidence_evidence (id),
  constraint fk_inf_term_person foreign key (signed_by_person_id) references ops.snapshots_person (id)
);
create unique index if not exists ux_inf_administrative_term_number on inf.administrative_term (tenant_id, term_number);
create index if not exists ix_administrative_term_tenant_id on inf.administrative_term (tenant_id);
create index if not exists ix_administrative_term_measure_id on inf.administrative_term (measure_id);
create index if not exists ix_administrative_term_file_evidence_id on inf.administrative_term (file_evidence_id);
create index if not exists ix_administrative_term_signed_by_person_id on inf.administrative_term (signed_by_person_id);

create table if not exists inf.measure_retention (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  measure_id uuid not null,
  vehicle_snapshot_id uuid not null,
  retention_reason text not null,
  regularized_at timestamptz,
  released_at timestamptz,
  release_user_ref uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_measure_retention primary key (id),
  constraint fk_inf_retention_measure foreign key (measure_id) references inf.administrative_measure (id),
  constraint fk_inf_retention_vehicle foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id)
);
create index if not exists ix_measure_retention_tenant_id on inf.measure_retention (tenant_id);
create index if not exists ix_measure_retention_measure_id on inf.measure_retention (measure_id);
create index if not exists ix_measure_retention_vehicle_snapshot_id on inf.measure_retention (vehicle_snapshot_id);

create table if not exists inf.measure_removal (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  measure_id uuid not null,
  vehicle_snapshot_id uuid not null,
  tow_provider_id uuid,
  yard_id uuid,
  requested_at timestamptz,
  tow_arrived_at timestamptz,
  delivered_at timestamptz,
  destination_description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_measure_removal primary key (id),
  constraint fk_inf_removal_measure foreign key (measure_id) references inf.administrative_measure (id),
  constraint fk_inf_removal_vehicle foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id)
);
create index if not exists ix_measure_removal_tenant_id on inf.measure_removal (tenant_id);
create index if not exists ix_measure_removal_measure_id on inf.measure_removal (measure_id);
create index if not exists ix_measure_removal_vehicle_snapshot_id on inf.measure_removal (vehicle_snapshot_id);
create index if not exists ix_measure_removal_tow_provider_id on inf.measure_removal (tow_provider_id);
create index if not exists ix_measure_removal_yard_id on inf.measure_removal (yard_id);

create table if not exists inf.vehicle_inventory (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  measure_id uuid not null,
  vehicle_snapshot_id uuid not null,
  inventory_json jsonb not null,
  damage_description text,
  signed_by_person_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_vehicle_inventory primary key (id),
  constraint fk_inf_inventory_measure foreign key (measure_id) references inf.administrative_measure (id),
  constraint fk_inf_inventory_vehicle foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id),
  constraint fk_inf_inventory_person foreign key (signed_by_person_id) references ops.snapshots_person (id)
);
create index if not exists ix_vehicle_inventory_tenant_id on inf.vehicle_inventory (tenant_id);
create index if not exists ix_vehicle_inventory_measure_id on inf.vehicle_inventory (measure_id);
create index if not exists ix_vehicle_inventory_vehicle_snapshot_id on inf.vehicle_inventory (vehicle_snapshot_id);
create index if not exists ix_vehicle_inventory_signed_by_person_id on inf.vehicle_inventory (signed_by_person_id);

create table if not exists inf.tow_provider (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  name varchar(255) not null,
  document_number varchar(20),
  contact_json jsonb,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_tow_provider primary key (id)
);
create index if not exists ix_tow_provider_tenant_id on inf.tow_provider (tenant_id);
create index if not exists ix_tow_provider_traffic_agency_id on inf.tow_provider (traffic_agency_id);

create table if not exists inf.yard (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  name varchar(255) not null,
  address text,
  location_json jsonb,
  status varchar(40) default 'active' not null,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_yard primary key (id)
);
create index if not exists gist_inf_yard_location on inf.yard using gist (location_geom);
create index if not exists ix_yard_tenant_id on inf.yard (tenant_id);
create index if not exists ix_yard_traffic_agency_id on inf.yard (traffic_agency_id);

create table if not exists inf.measure_status_history (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  measure_id uuid not null,
  status varchar(60) not null,
  changed_at timestamptz default now() not null,
  user_ref uuid,
  reason text,
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_measure_status_history primary key (id),
  constraint fk_inf_measure_history foreign key (measure_id) references inf.administrative_measure (id)
);
create index if not exists ix_measure_status_history_tenant_id on inf.measure_status_history (tenant_id);
create index if not exists ix_measure_status_history_measure_id on inf.measure_status_history (measure_id);

select auth.create_rls_policy('inf', 'measure_type');

select auth.create_rls_policy('inf', 'administrative_measure');

select auth.create_rls_policy('inf', 'administrative_term');

select auth.create_rls_policy('inf', 'measure_retention');

select auth.create_rls_policy('inf', 'measure_removal');

select auth.create_rls_policy('inf', 'vehicle_inventory');

select auth.create_rls_policy('inf', 'tow_provider');

select auth.create_rls_policy('inf', 'yard');

select auth.create_rls_policy('inf', 'measure_status_history');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
