-- Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082

-- Regenerable-only DDL for BP-OPS-FIELD-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.ops_agent_profile (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  user_ref uuid not null,
  operational_unit_id uuid,
  registration_number varchar(60) not null,
  credential_number varchar(80),
  functional_status varchar(40) default 'active' not null,
  credential_valid_until date,
  trained_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_agent_profile primary key (id)
);
create unique index if not exists ux_ops_agent_profile_tenant_id_traffic_agency_id_registration_number on ops.ops_agent_profile (tenant_id, traffic_agency_id, registration_number);
create index if not exists ix_ops_agent_profile_tenant_id on ops.ops_agent_profile (tenant_id);
create index if not exists ix_ops_agent_profile_traffic_agency_id on ops.ops_agent_profile (traffic_agency_id);
create index if not exists ix_ops_agent_profile_operational_unit_id on ops.ops_agent_profile (operational_unit_id);

create table if not exists ops.ops_operational_device (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  hardware_identifier_hash varchar(128) not null,
  model varchar(120),
  manufacturer varchar(120),
  os_name varchar(40) not null,
  os_version varchar(80),
  status varchar(40) default 'authorized' not null,
  app_version varchar(80),
  last_seen_at timestamptz,
  last_location_json jsonb,
  tamper_flag boolean default false not null,
  last_location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_operational_device primary key (id)
);
create unique index if not exists ux_ops_operational_device_tenant_id_hardware_identifier_hash on ops.ops_operational_device (tenant_id, hardware_identifier_hash);
create index if not exists gist_ops_device_location on ops.ops_operational_device using gist (last_location_geom);
create index if not exists ix_ops_operational_device_tenant_id on ops.ops_operational_device (tenant_id);
create index if not exists ix_ops_operational_device_traffic_agency_id on ops.ops_operational_device (traffic_agency_id);

create table if not exists ops.ops_homologation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  homologation_number varchar(100) not null,
  scope text not null,
  issued_at date not null,
  valid_until date,
  document_uri text,
  status varchar(40) default 'active' not null,
  laudo_emitido_em date,
  laudo_valido_ate date,
  emissor_independente varchar(255),
  descricao_publicada_em date,
  descricao_publicacao_local text,
  senatran_notificado_em date,
  senatran_prazo_notificacao date,
  cancelled_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_homologation primary key (id)
);
create unique index if not exists ux_ops_homologation_tenant_id_traffic_agency_id_homologation_number on ops.ops_homologation (tenant_id, traffic_agency_id, homologation_number);
create index if not exists ix_ops_homologation_tenant_id on ops.ops_homologation (tenant_id);
create index if not exists ix_ops_homologation_traffic_agency_id on ops.ops_homologation (traffic_agency_id);

create table if not exists ops.ops_application_version (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  app_type varchar(40) not null,
  version varchar(80) not null,
  build_number varchar(80),
  status varchar(40) default 'allowed' not null,
  homologation_id uuid,
  altera_funcionalidade boolean default false not null,
  valid_from date not null,
  valid_to date,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_application_version primary key (id),
  constraint fk_ops_application_version_homologation foreign key (homologation_id) references ops.ops_homologation (id)
);
create unique index if not exists ux_ops_application_version_tenant_id_app_type_version on ops.ops_application_version (tenant_id, app_type, version);
create index if not exists ix_ops_application_version_tenant_id on ops.ops_application_version (tenant_id);
create index if not exists ix_ops_application_version_homologation_id on ops.ops_application_version (homologation_id);

create table if not exists ops.ops_device_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  device_id uuid not null,
  agent_id uuid,
  event_type varchar(80) not null,
  event_at timestamptz default now() not null,
  location_json jsonb,
  details_json jsonb,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_device_event primary key (id),
  constraint fk_ops_device_event_device foreign key (device_id) references ops.ops_operational_device (id),
  constraint fk_ops_device_event_agent foreign key (agent_id) references ops.ops_agent_profile (id)
);
create index if not exists ix_ops_device_event_tenant_id_device_id_event_at on ops.ops_device_event (tenant_id, device_id, event_at);
create index if not exists ix_ops_device_event_tenant_id on ops.ops_device_event (tenant_id);
create index if not exists ix_ops_device_event_device_id on ops.ops_device_event (device_id);
create index if not exists ix_ops_device_event_agent_id on ops.ops_device_event (agent_id);

create table if not exists ops.ops_operation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  name varchar(255) not null,
  operation_type varchar(80) not null,
  description text,
  planned_start_at timestamptz,
  planned_end_at timestamptz,
  status varchar(40) default 'planned' not null,
  objectives text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_operation primary key (id)
);
create index if not exists ix_ops_operation_tenant_id_traffic_agency_id_status on ops.ops_operation (tenant_id, traffic_agency_id, status);
create index if not exists ix_ops_operation_tenant_id on ops.ops_operation (tenant_id);
create index if not exists ix_ops_operation_traffic_agency_id on ops.ops_operation (traffic_agency_id);

create table if not exists ops.ops_team (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  operational_unit_id uuid,
  name varchar(120) not null,
  supervisor_agent_id uuid,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_team primary key (id),
  constraint fk_ops_team_supervisor_agent foreign key (supervisor_agent_id) references ops.ops_agent_profile (id)
);
create unique index if not exists ux_ops_team_tenant_id_traffic_agency_id_name on ops.ops_team (tenant_id, traffic_agency_id, name);
create index if not exists ix_ops_team_tenant_id on ops.ops_team (tenant_id);
create index if not exists ix_ops_team_traffic_agency_id on ops.ops_team (traffic_agency_id);
create index if not exists ix_ops_team_operational_unit_id on ops.ops_team (operational_unit_id);
create index if not exists ix_ops_team_supervisor_agent_id on ops.ops_team (supervisor_agent_id);

create table if not exists ops.ops_team_agent (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  team_id uuid not null,
  agent_id uuid not null,
  role varchar(60) not null,
  valid_from date not null,
  valid_to date,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_team_agent primary key (id),
  constraint fk_ops_team_agent_team foreign key (team_id) references ops.ops_team (id),
  constraint fk_ops_team_agent_agent foreign key (agent_id) references ops.ops_agent_profile (id)
);
create unique index if not exists ux_ops_team_agent_tenant_id_team_id_agent_id on ops.ops_team_agent (tenant_id, team_id, agent_id);
create index if not exists ix_ops_team_agent_tenant_id on ops.ops_team_agent (tenant_id);
create index if not exists ix_ops_team_agent_team_id on ops.ops_team_agent (team_id);
create index if not exists ix_ops_team_agent_agent_id on ops.ops_team_agent (agent_id);

create table if not exists ops.ops_patrol_vehicle (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  prefix varchar(60) not null,
  plate varchar(10) not null,
  vehicle_type varchar(60) not null,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_patrol_vehicle primary key (id)
);
create unique index if not exists ux_ops_patrol_vehicle_tenant_id_traffic_agency_id_prefix on ops.ops_patrol_vehicle (tenant_id, traffic_agency_id, prefix);
create index if not exists ix_ops_patrol_vehicle_tenant_id on ops.ops_patrol_vehicle (tenant_id);
create index if not exists ix_ops_patrol_vehicle_traffic_agency_id on ops.ops_patrol_vehicle (traffic_agency_id);

create table if not exists ops.ops_measurement_instrument (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  instrument_type varchar(40) not null,
  serial_number varchar(120) not null,
  brand varchar(120) not null,
  model varchar(120) not null,
  inmetro_model_approval varchar(120) not null,
  verification_certificate_number varchar(120),
  initial_verification_at date,
  last_verification_at date,
  verification_valid_until date,
  status varchar(40) default 'approved' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_measurement_instrument primary key (id)
);
create unique index if not exists ux_ops_measurement_instrument_tenant_id_instrument_type_serial_number on ops.ops_measurement_instrument (tenant_id, instrument_type, serial_number);
create index if not exists ix_ops_measurement_instrument_tenant_id_traffic_agency_id_status on ops.ops_measurement_instrument (tenant_id, traffic_agency_id, status);
create index if not exists ix_ops_measurement_instrument_tenant_id on ops.ops_measurement_instrument (tenant_id);
create index if not exists ix_ops_measurement_instrument_traffic_agency_id on ops.ops_measurement_instrument (traffic_agency_id);

create table if not exists ops.ops_shift (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  agent_id uuid not null,
  device_id uuid not null,
  operational_unit_id uuid,
  team_id uuid,
  patrol_vehicle_id uuid,
  operation_id uuid,
  started_at timestamptz not null,
  ended_at timestamptz,
  start_location_json jsonb,
  end_location_json jsonb,
  status varchar(40) default 'open' not null,
  offline_periods_count integer default 0 not null,
  start_location_geom geometry(Point,4674),
  end_location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_shift primary key (id),
  constraint fk_ops_shift_agent foreign key (agent_id) references ops.ops_agent_profile (id),
  constraint fk_ops_shift_device foreign key (device_id) references ops.ops_operational_device (id),
  constraint fk_ops_shift_team foreign key (team_id) references ops.ops_team (id),
  constraint fk_ops_shift_vehicle foreign key (patrol_vehicle_id) references ops.ops_patrol_vehicle (id),
  constraint fk_ops_shift_operation foreign key (operation_id) references ops.ops_operation (id)
);
create index if not exists ix_ops_shift_tenant_id_agent_id_started_at on ops.ops_shift (tenant_id, agent_id, started_at);
create index if not exists ix_ops_shift_tenant_id_status on ops.ops_shift (tenant_id, status);
create unique index if not exists ux_ops_shift_tenant_id_agent_id_open on ops.ops_shift (tenant_id, agent_id) where status = 'open';
create index if not exists ix_ops_shift_tenant_id on ops.ops_shift (tenant_id);
create index if not exists ix_ops_shift_traffic_agency_id on ops.ops_shift (traffic_agency_id);
create index if not exists ix_ops_shift_agent_id on ops.ops_shift (agent_id);
create index if not exists ix_ops_shift_device_id on ops.ops_shift (device_id);
create index if not exists ix_ops_shift_operational_unit_id on ops.ops_shift (operational_unit_id);
create index if not exists ix_ops_shift_team_id on ops.ops_shift (team_id);
create index if not exists ix_ops_shift_patrol_vehicle_id on ops.ops_shift (patrol_vehicle_id);
create index if not exists ix_ops_shift_operation_id on ops.ops_shift (operation_id);

create table if not exists ops.ops_approach (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  shift_id uuid not null,
  operation_id uuid,
  agent_id uuid not null,
  approached_at timestamptz not null,
  location_json jsonb,
  approach_type varchar(60) not null,
  result varchar(80) not null,
  notes text,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_approach primary key (id),
  constraint fk_ops_approach_shift foreign key (shift_id) references ops.ops_shift (id),
  constraint fk_ops_approach_operation foreign key (operation_id) references ops.ops_operation (id),
  constraint fk_ops_approach_agent foreign key (agent_id) references ops.ops_agent_profile (id)
);
create index if not exists ix_ops_approach_tenant_id_shift_id_approached_at on ops.ops_approach (tenant_id, shift_id, approached_at);
create index if not exists ix_ops_approach_tenant_id on ops.ops_approach (tenant_id);
create index if not exists ix_ops_approach_traffic_agency_id on ops.ops_approach (traffic_agency_id);
create index if not exists ix_ops_approach_shift_id on ops.ops_approach (shift_id);
create index if not exists ix_ops_approach_operation_id on ops.ops_approach (operation_id);
create index if not exists ix_ops_approach_agent_id on ops.ops_approach (agent_id);

create table if not exists ops.ops_session_handoff (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  shift_id uuid not null,
  from_agent_id uuid not null,
  to_agent_id uuid not null,
  handed_off_at timestamptz not null,
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ops_session_handoff primary key (id),
  constraint fk_ops_session_handoff_shift foreign key (shift_id) references ops.ops_shift (id),
  constraint fk_ops_session_handoff_from_agent foreign key (from_agent_id) references ops.ops_agent_profile (id),
  constraint fk_ops_session_handoff_to_agent foreign key (to_agent_id) references ops.ops_agent_profile (id)
);
create index if not exists ix_ops_session_handoff_tenant_id on ops.ops_session_handoff (tenant_id);
create index if not exists ix_ops_session_handoff_shift_id on ops.ops_session_handoff (shift_id);
create index if not exists ix_ops_session_handoff_from_agent_id on ops.ops_session_handoff (from_agent_id);
create index if not exists ix_ops_session_handoff_to_agent_id on ops.ops_session_handoff (to_agent_id);

select auth.create_rls_policy('ops', 'ops_agent_profile');

select auth.create_rls_policy('ops', 'ops_operational_device');

select auth.create_rls_policy('ops', 'ops_homologation');

select auth.create_rls_policy('ops', 'ops_application_version');

select auth.create_rls_policy('ops', 'ops_device_event');

select auth.create_rls_policy('ops', 'ops_operation');

select auth.create_rls_policy('ops', 'ops_team');

select auth.create_rls_policy('ops', 'ops_team_agent');

select auth.create_rls_policy('ops', 'ops_patrol_vehicle');

select auth.create_rls_policy('ops', 'ops_measurement_instrument');

select auth.create_rls_policy('ops', 'ops_shift');

select auth.create_rls_policy('ops', 'ops_approach');

select auth.create_rls_policy('ops', 'ops_session_handoff');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
