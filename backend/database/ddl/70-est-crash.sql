-- Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513

-- Regenerable-only DDL for BP-EST-CRASH-001; request-path writes use role_app_backend.

create schema if not exists est;

create table if not exists est.crash_record (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  crash_type varchar(120) not null,
  severity varchar(60) not null,
  state varchar(60) default 'RASCUNHO' not null,
  national_status varchar(60),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null,
  location_description text not null,
  location_json jsonb,
  location_reference varchar(255),
  municipality_code varchar(20) not null,
  uf varchar(2) not null,
  road varchar(160),
  km varchar(40),
  direction varchar(120),
  road_condition varchar(120) not null,
  weather_condition varchar(120) not null,
  lighting_condition varchar(120) not null,
  signage_condition varchar(120) not null,
  dynamics_description text,
  shift_id uuid,
  device_id varchar(120),
  operation_id uuid,
  source_system varchar(80),
  source_local_id varchar(120),
  source_idempotency_key varchar(160),
  source_payload_hash varchar(128),
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_record primary key (id),
  constraint ck_est_crash_record_local_state check (state in ('RASCUNHO', 'EM_ATENDIMENTO', 'REGISTRADO', 'PENDENTE_COMPLEMENTO', 'VALIDADO', 'FECHADO', 'INTEGRADO', 'ARQUIVADO', 'CANCELADO')),
  constraint ck_est_crash_record_national_status check (national_status is null or national_status in ('RECEBIDO', 'EM_ANALISE', 'CONSOLIDADO', 'REJEITADO')),
  constraint ck_est_crash_record_occurred_before_recorded check (occurred_at <= recorded_at),
  constraint ck_est_crash_record_closed_severity check (state <> 'FECHADO' or est.crash_severity_matches_victims(id, severity)),
  constraint fk_est_crash_record_state foreign key (state) references est.crash_state_ref (code),
  constraint fk_est_crash_record_national_status foreign key (national_status) references est.crash_state_ref (code),
  constraint fk_est_crash_record_severity foreign key (severity) references est.crash_severity_ref (code)
);
create index if not exists ix_est_crash_record_tenant_occurred on est.crash_record (tenant_id, occurred_at);
create index if not exists ix_est_crash_record_tenant_state on est.crash_record (tenant_id, state);
create unique index if not exists ux_est_crash_record_source_local on est.crash_record (tenant_id, source_system, source_local_id) where source_system is not null and source_local_id is not null;
create unique index if not exists ux_est_crash_record_natural_key on est.crash_record (tenant_id, uf, municipality_code, occurred_at, traffic_agency_id);
create index if not exists ix_crash_record_tenant_id on est.crash_record (tenant_id);
create index if not exists ix_crash_record_traffic_agency_id on est.crash_record (traffic_agency_id);
create index if not exists ix_crash_record_shift_id on est.crash_record (shift_id);
create index if not exists ix_crash_record_device_id on est.crash_record (device_id);
create index if not exists ix_crash_record_operation_id on est.crash_record (operation_id);
create index if not exists ix_crash_record_source_local_id on est.crash_record (source_local_id);

create table if not exists est.crash_vehicle (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  vehicle_snapshot_id uuid,
  plate varchar(20),
  role varchar(60) not null,
  sequence integer not null,
  apparent_damage text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_vehicle primary key (id),
  constraint fk_est_crash_vehicle_record foreign key (crash_record_id) references est.crash_record (id)
);
create unique index if not exists ux_est_crash_vehicle_sequence on est.crash_vehicle (tenant_id, crash_record_id, sequence);
create index if not exists ix_crash_vehicle_tenant_id on est.crash_vehicle (tenant_id);
create index if not exists ix_crash_vehicle_crash_record_id on est.crash_vehicle (crash_record_id);
create index if not exists ix_crash_vehicle_vehicle_snapshot_id on est.crash_vehicle (vehicle_snapshot_id);

create table if not exists est.crash_person (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  person_id uuid,
  name varchar(160),
  document_number varchar(60),
  document_source varchar(80),
  crash_vehicle_id uuid,
  role varchar(40) not null,
  used_seatbelt_or_helmet boolean,
  refused_data boolean default false not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_person primary key (id),
  constraint ck_est_crash_person_role check (role in ('condutor', 'passageiro', 'pedestre', 'ciclista')),
  constraint fk_est_crash_person_record foreign key (crash_record_id) references est.crash_record (id),
  constraint fk_est_crash_person_vehicle foreign key (crash_vehicle_id) references est.crash_vehicle (id)
);
create index if not exists ix_crash_person_tenant_id on est.crash_person (tenant_id);
create index if not exists ix_crash_person_crash_record_id on est.crash_person (crash_record_id);
create index if not exists ix_crash_person_person_id on est.crash_person (person_id);
create index if not exists ix_crash_person_crash_vehicle_id on est.crash_person (crash_vehicle_id);

create table if not exists est.crash_victim (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  crash_person_id uuid not null,
  severity varchar(60) not null,
  death_at_scene boolean,
  medical_care boolean,
  hospital_destination varchar(255),
  death_at timestamptz,
  health_notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_victim primary key (id),
  constraint ck_est_crash_victim_death_consistency check (death_at is null or death_at_scene is true or medical_care is true),
  constraint fk_est_crash_victim_record foreign key (crash_record_id) references est.crash_record (id),
  constraint fk_est_crash_victim_person foreign key (crash_person_id) references est.crash_person (id),
  constraint fk_est_crash_victim_severity foreign key (severity) references est.crash_severity_ref (code)
);
create index if not exists ix_crash_victim_tenant_id on est.crash_victim (tenant_id);
create index if not exists ix_crash_victim_crash_record_id on est.crash_victim (crash_record_id);
create index if not exists ix_crash_victim_crash_person_id on est.crash_victim (crash_person_id);

create table if not exists est.crash_scene_duty (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  regime varchar(20) not null,
  duty_code varchar(20) not null,
  crash_person_id uuid,
  crash_vehicle_id uuid,
  complied boolean not null,
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_scene_duty primary key (id),
  constraint ck_est_crash_scene_duty_regime check (regime in ('art176', 'art177', 'art178')),
  constraint fk_est_crash_scene_duty_record foreign key (crash_record_id) references est.crash_record (id),
  constraint fk_est_crash_scene_duty_code foreign key (duty_code) references est.scene_duty_ref (code),
  constraint fk_est_crash_scene_duty_person foreign key (crash_person_id) references est.crash_person (id),
  constraint fk_est_crash_scene_duty_vehicle foreign key (crash_vehicle_id) references est.crash_vehicle (id)
);
create index if not exists ix_crash_scene_duty_tenant_id on est.crash_scene_duty (tenant_id);
create index if not exists ix_crash_scene_duty_crash_record_id on est.crash_scene_duty (crash_record_id);
create index if not exists ix_crash_scene_duty_crash_person_id on est.crash_scene_duty (crash_person_id);
create index if not exists ix_crash_scene_duty_crash_vehicle_id on est.crash_scene_duty (crash_vehicle_id);

create table if not exists est.crash_damage (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  asset_kind varchar(60) not null,
  description text not null,
  responsible_identified boolean,
  notify_road_owner boolean,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_damage primary key (id),
  constraint fk_est_crash_damage_record foreign key (crash_record_id) references est.crash_record (id),
  constraint fk_est_crash_damage_asset_kind foreign key (asset_kind) references est.damage_asset_kind_ref (code)
);
create index if not exists ix_crash_damage_tenant_id on est.crash_damage (tenant_id);
create index if not exists ix_crash_damage_crash_record_id on est.crash_damage (crash_record_id);

create table if not exists est.crash_witness (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  name varchar(160) not null,
  contact varchar(160),
  refused boolean default false not null,
  statement_summary text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_witness primary key (id),
  constraint fk_est_crash_witness_record foreign key (crash_record_id) references est.crash_record (id)
);
create index if not exists ix_crash_witness_tenant_id on est.crash_witness (tenant_id);
create index if not exists ix_crash_witness_crash_record_id on est.crash_witness (crash_record_id);

create table if not exists est.crash_sketch (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  sketch_type varchar(20) not null,
  evidence_id uuid,
  drawing_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_sketch primary key (id),
  constraint ck_est_crash_sketch_type check (sketch_type in ('desenho', 'anexo', 'mapa')),
  constraint fk_est_crash_sketch_record foreign key (crash_record_id) references est.crash_record (id)
);
create index if not exists ix_crash_sketch_tenant_id on est.crash_sketch (tenant_id);
create index if not exists ix_crash_sketch_crash_record_id on est.crash_sketch (crash_record_id);
create index if not exists ix_crash_sketch_evidence_id on est.crash_sketch (evidence_id);

create table if not exists est.crash_link (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  kind varchar(20) not null,
  target_id uuid not null,
  target_number varchar(120),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_link primary key (id),
  constraint ck_est_crash_link_kind check (kind in ('ait', 'measure')),
  constraint fk_est_crash_link_record foreign key (crash_record_id) references est.crash_record (id)
);
create unique index if not exists ux_est_crash_link_target on est.crash_link (tenant_id, crash_record_id, kind, target_id);
create index if not exists ix_crash_link_tenant_id on est.crash_link (tenant_id);
create index if not exists ix_crash_link_crash_record_id on est.crash_link (crash_record_id);
create index if not exists ix_crash_link_target_id on est.crash_link (target_id);

create table if not exists est.crash_renaest_submission (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid not null,
  protocol varchar(120),
  national_status varchar(60) not null,
  layout_version varchar(80),
  submitted_at timestamptz,
  rectification_kind varchar(20),
  rectification_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_renaest_submission primary key (id),
  constraint ck_est_crash_renaest_submission_national_status check (national_status in ('RECEBIDO', 'EM_ANALISE', 'CONSOLIDADO', 'REJEITADO')),
  constraint ck_est_crash_renaest_submission_rectification_kind check (rectification_kind is null or rectification_kind in ('complement', 'correction')),
  constraint fk_est_crash_renaest_submission_record foreign key (crash_record_id) references est.crash_record (id),
  constraint fk_est_crash_renaest_submission_state foreign key (national_status) references est.crash_state_ref (code)
);
create unique index if not exists ux_est_crash_renaest_protocol on est.crash_renaest_submission (tenant_id, protocol) where protocol is not null;
create index if not exists ix_crash_renaest_submission_tenant_id on est.crash_renaest_submission (tenant_id);
create index if not exists ix_crash_renaest_submission_crash_record_id on est.crash_renaest_submission (crash_record_id);

create table if not exists est.crash_subject_request (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  crash_record_id uuid,
  kind varchar(20) not null,
  subject_cpf varchar(20) not null,
  purpose text not null,
  status varchar(60) default 'REGISTRADO' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_crash_subject_request primary key (id),
  constraint ck_est_crash_subject_request_kind check (kind in ('acesso', 'correcao', 'eliminacao')),
  constraint fk_est_crash_subject_request_record foreign key (crash_record_id) references est.crash_record (id)
);
create index if not exists ix_crash_subject_request_tenant_id on est.crash_subject_request (tenant_id);
create index if not exists ix_crash_subject_request_crash_record_id on est.crash_subject_request (crash_record_id);

select auth.create_rls_policy('est', 'crash_record');

select auth.create_rls_policy('est', 'crash_vehicle');

select auth.create_rls_policy('est', 'crash_person');

select auth.create_rls_policy('est', 'crash_victim');

select auth.create_rls_policy('est', 'crash_scene_duty');

select auth.create_rls_policy('est', 'crash_damage');

select auth.create_rls_policy('est', 'crash_witness');

select auth.create_rls_policy('est', 'crash_sketch');

select auth.create_rls_policy('est', 'crash_link');

select auth.create_rls_policy('est', 'crash_renaest_submission');

select auth.create_rls_policy('est', 'crash_subject_request');

select auth.install_tenant_triggers();

grant usage on schema est to role_app_backend;

grant select, insert, update, delete on all tables in schema est to role_app_backend;

grant usage, select on all sequences in schema est to role_app_backend;
