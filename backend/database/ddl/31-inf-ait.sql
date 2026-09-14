-- Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77

-- Regenerable-only DDL for BP-INF-AIT-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.ait_ait (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  executing_agency_id uuid,
  ait_number varchar(80) not null,
  series varchar(40) default '' not null,
  agent_id uuid not null,
  shift_id uuid not null,
  operation_id uuid,
  device_id uuid not null,
  framing_id uuid not null,
  catalog_id uuid not null,
  infraction_at timestamptz not null,
  issued_at timestamptz not null,
  issuance_mode varchar(40) not null,
  constatation_type varchar(80) not null,
  had_approach boolean default false not null,
  no_approach_reason text,
  location_description text not null,
  location_json jsonb,
  gps_accuracy_m numeric(8,2),
  municipality_code varchar(20),
  uf varchar(2) not null,
  road varchar(40),
  km numeric(8,2),
  direction varchar(60),
  mandatory_observation text,
  complementary_observation text,
  current_status varchar(60) default 'draft' not null,
  content_hash varchar(128),
  system_signature_ref text,
  receipt_protocol varchar(120),
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_ait primary key (id),
  constraint ck_inf_ait_issue_after_infraction check (issued_at >= infraction_at),
  constraint fk_inf_ait_catalog foreign key (catalog_id) references inf.normative_catalog (id),
  constraint fk_inf_ait_framing foreign key (framing_id) references inf.normative_framing (id)
);
create unique index if not exists ux_inf_ait_number on inf.ait_ait (tenant_id, traffic_agency_id, series, ait_number);
create unique index if not exists ux_inf_ait_receipt_protocol on inf.ait_ait (tenant_id, receipt_protocol) where receipt_protocol is not null;
create index if not exists ix_inf_ait_status on inf.ait_ait (tenant_id, current_status);
create index if not exists gist_inf_ait_location on inf.ait_ait using gist (location_geom);
create index if not exists ix_ait_ait_tenant_id on inf.ait_ait (tenant_id);
create index if not exists ix_ait_ait_traffic_agency_id on inf.ait_ait (traffic_agency_id);
create index if not exists ix_ait_ait_executing_agency_id on inf.ait_ait (executing_agency_id);
create index if not exists ix_ait_ait_agent_id on inf.ait_ait (agent_id);
create index if not exists ix_ait_ait_shift_id on inf.ait_ait (shift_id);
create index if not exists ix_ait_ait_operation_id on inf.ait_ait (operation_id);
create index if not exists ix_ait_ait_device_id on inf.ait_ait (device_id);
create index if not exists ix_ait_ait_framing_id on inf.ait_ait (framing_id);
create index if not exists ix_ait_ait_catalog_id on inf.ait_ait (catalog_id);

create table if not exists inf.ait_vehicle (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  vehicle_snapshot_id uuid not null,
  role varchar(60) not null,
  visually_confirmed_by_agent boolean default false not null,
  observed_divergence text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_vehicle primary key (id),
  constraint fk_inf_ait_vehicle_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_ait_vehicle_snapshot foreign key (vehicle_snapshot_id) references ops.snapshots_vehicle (id)
);
create index if not exists ix_inf_ait_vehicle on inf.ait_vehicle (tenant_id, ait_id);
create index if not exists ix_ait_vehicle_tenant_id on inf.ait_vehicle (tenant_id);
create index if not exists ix_ait_vehicle_ait_id on inf.ait_vehicle (ait_id);
create index if not exists ix_ait_vehicle_vehicle_snapshot_id on inf.ait_vehicle (vehicle_snapshot_id);

create table if not exists inf.ait_person (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  person_id uuid not null,
  role varchar(60) not null,
  identified_by varchar(80) not null,
  external_query_id uuid,
  signed boolean default false not null,
  refused_signature boolean default false not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_person primary key (id),
  constraint fk_inf_ait_person_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_ait_person_snapshot foreign key (person_id) references ops.snapshots_person (id),
  constraint fk_inf_ait_person_query foreign key (external_query_id) references ops.snapshots_external_query (id)
);
create index if not exists ix_inf_ait_person on inf.ait_person (tenant_id, ait_id, role);
create index if not exists ix_ait_person_tenant_id on inf.ait_person (tenant_id);
create index if not exists ix_ait_person_ait_id on inf.ait_person (ait_id);
create index if not exists ix_ait_person_person_id on inf.ait_person (person_id);
create index if not exists ix_ait_person_external_query_id on inf.ait_person (external_query_id);

create table if not exists inf.ait_status_history (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  status varchar(60) not null,
  changed_at timestamptz default now() not null,
  user_ref uuid,
  system_name varchar(80),
  reason text,
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_status_history primary key (id),
  constraint fk_inf_ait_history_ait foreign key (ait_id) references inf.ait_ait (id)
);
create index if not exists ix_inf_ait_history on inf.ait_status_history (tenant_id, ait_id, changed_at);
create index if not exists ix_ait_status_history_tenant_id on inf.ait_status_history (tenant_id);
create index if not exists ix_ait_status_history_ait_id on inf.ait_status_history (ait_id);

create table if not exists inf.ait_correction (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  operator_user_ref uuid not null,
  correction_type varchar(80) not null,
  changed_field varchar(120),
  previous_value text,
  new_value text,
  justification text not null,
  corrected_at timestamptz default now() not null,
  approved_by_user_ref uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_correction primary key (id),
  constraint fk_inf_ait_correction_ait foreign key (ait_id) references inf.ait_ait (id)
);
create index if not exists ix_inf_ait_correction on inf.ait_correction (tenant_id, ait_id, corrected_at);
create index if not exists ix_ait_correction_tenant_id on inf.ait_correction (tenant_id);
create index if not exists ix_ait_correction_ait_id on inf.ait_correction (ait_id);

create table if not exists inf.ait_signature (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  person_id uuid,
  signature_type varchar(60) not null,
  signature_evidence_id uuid,
  signed_at timestamptz default now() not null,
  location_json jsonb,
  refusal_or_impossibility_reason text,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_signature primary key (id),
  constraint fk_inf_ait_signature_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_ait_signature_person foreign key (person_id) references ops.snapshots_person (id),
  constraint fk_inf_ait_signature_evidence foreign key (signature_evidence_id) references ops.evidence_evidence (id)
);
create index if not exists gist_inf_ait_signature_location on inf.ait_signature using gist (location_geom);
create index if not exists ix_ait_signature_tenant_id on inf.ait_signature (tenant_id);
create index if not exists ix_ait_signature_ait_id on inf.ait_signature (ait_id);
create index if not exists ix_ait_signature_person_id on inf.ait_signature (person_id);
create index if not exists ix_ait_signature_signature_evidence_id on inf.ait_signature (signature_evidence_id);

create table if not exists inf.ait_print_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  event_type varchar(60) not null,
  event_at timestamptz default now() not null,
  device_id uuid,
  printer_identifier varchar(120),
  receipt_hash varchar(128),
  failure_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_print_event primary key (id),
  constraint fk_inf_ait_print_ait foreign key (ait_id) references inf.ait_ait (id)
);
create index if not exists ix_ait_print_event_tenant_id on inf.ait_print_event (tenant_id);
create index if not exists ix_ait_print_event_ait_id on inf.ait_print_event (ait_id);
create index if not exists ix_ait_print_event_device_id on inf.ait_print_event (device_id);

select auth.create_rls_policy('inf', 'ait_ait');

select auth.create_rls_policy('inf', 'ait_vehicle');

select auth.create_rls_policy('inf', 'ait_person');

select auth.create_rls_policy('inf', 'ait_status_history');

select auth.create_rls_policy('inf', 'ait_correction');

select auth.create_rls_policy('inf', 'ait_signature');

select auth.create_rls_policy('inf', 'ait_print_event');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
