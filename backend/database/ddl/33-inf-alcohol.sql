-- Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec

-- Regenerable-only DDL for BP-INF-ALCOHOL-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.alcohol_procedure (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  ait_id uuid,
  measure_id uuid,
  approach_id uuid,
  agent_id uuid not null,
  shift_id uuid not null,
  driver_person_id uuid,
  procedure_at timestamptz not null,
  location_json jsonb,
  procedure_type varchar(60) not null,
  outcome varchar(80) not null,
  status varchar(40) default 'draft' not null,
  notes text,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_procedure primary key (id),
  constraint fk_inf_alcohol_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_alcohol_measure foreign key (measure_id) references inf.administrative_measure (id),
  constraint fk_inf_alcohol_approach foreign key (approach_id) references ops.ops_approach (id),
  constraint fk_inf_alcohol_person foreign key (driver_person_id) references ops.snapshots_person (id)
);
create index if not exists ix_inf_alcohol_procedure_at on inf.alcohol_procedure (tenant_id, traffic_agency_id, procedure_at);
create index if not exists gist_inf_alcohol_location on inf.alcohol_procedure using gist (location_geom);
create index if not exists ix_alcohol_procedure_tenant_id on inf.alcohol_procedure (tenant_id);
create index if not exists ix_alcohol_procedure_traffic_agency_id on inf.alcohol_procedure (traffic_agency_id);
create index if not exists ix_alcohol_procedure_ait_id on inf.alcohol_procedure (ait_id);
create index if not exists ix_alcohol_procedure_measure_id on inf.alcohol_procedure (measure_id);
create index if not exists ix_alcohol_procedure_approach_id on inf.alcohol_procedure (approach_id);
create index if not exists ix_alcohol_procedure_agent_id on inf.alcohol_procedure (agent_id);
create index if not exists ix_alcohol_procedure_shift_id on inf.alcohol_procedure (shift_id);
create index if not exists ix_alcohol_procedure_driver_person_id on inf.alcohol_procedure (driver_person_id);

create table if not exists inf.alcohol_breathalyzer (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  serial_number varchar(120) not null,
  model varchar(120),
  manufacturer varchar(120),
  last_calibration_at date,
  calibration_valid_until date,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_breathalyzer primary key (id)
);
create unique index if not exists ux_inf_breathalyzer_serial on inf.alcohol_breathalyzer (tenant_id, serial_number);
create index if not exists ix_alcohol_breathalyzer_tenant_id on inf.alcohol_breathalyzer (tenant_id);
create index if not exists ix_alcohol_breathalyzer_traffic_agency_id on inf.alcohol_breathalyzer (traffic_agency_id);

create table if not exists inf.alcohol_test (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  procedure_id uuid not null,
  breathalyzer_id uuid,
  test_number varchar(80),
  tested_at timestamptz not null,
  result_mg_l numeric(8,3),
  counterproof boolean default false not null,
  result_image_evidence_id uuid,
  status varchar(40) default 'recorded' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_test primary key (id),
  constraint fk_inf_alcohol_test_procedure foreign key (procedure_id) references inf.alcohol_procedure (id),
  constraint fk_inf_alcohol_test_device foreign key (breathalyzer_id) references inf.alcohol_breathalyzer (id),
  constraint fk_inf_alcohol_test_evidence foreign key (result_image_evidence_id) references ops.evidence_evidence (id)
);
create index if not exists ix_alcohol_test_tenant_id on inf.alcohol_test (tenant_id);
create index if not exists ix_alcohol_test_procedure_id on inf.alcohol_test (procedure_id);
create index if not exists ix_alcohol_test_breathalyzer_id on inf.alcohol_test (breathalyzer_id);
create index if not exists ix_alcohol_test_result_image_evidence_id on inf.alcohol_test (result_image_evidence_id);

create table if not exists inf.alcohol_refusal (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  procedure_id uuid not null,
  refused_at timestamptz not null,
  refusal_description text not null,
  witness_person_id uuid,
  evidence_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_refusal primary key (id),
  constraint fk_inf_alcohol_refusal_procedure foreign key (procedure_id) references inf.alcohol_procedure (id),
  constraint fk_inf_alcohol_refusal_person foreign key (witness_person_id) references ops.snapshots_person (id),
  constraint fk_inf_alcohol_refusal_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create index if not exists ix_alcohol_refusal_tenant_id on inf.alcohol_refusal (tenant_id);
create index if not exists ix_alcohol_refusal_procedure_id on inf.alcohol_refusal (procedure_id);
create index if not exists ix_alcohol_refusal_witness_person_id on inf.alcohol_refusal (witness_person_id);
create index if not exists ix_alcohol_refusal_evidence_id on inf.alcohol_refusal (evidence_id);

create table if not exists inf.alcohol_psychomotor_sign (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  procedure_id uuid not null,
  sign_code varchar(80) not null,
  description text not null,
  observed boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_psychomotor_sign primary key (id),
  constraint fk_inf_alcohol_sign_procedure foreign key (procedure_id) references inf.alcohol_procedure (id)
);
create index if not exists ix_alcohol_psychomotor_sign_tenant_id on inf.alcohol_psychomotor_sign (tenant_id);
create index if not exists ix_alcohol_psychomotor_sign_procedure_id on inf.alcohol_psychomotor_sign (procedure_id);

create table if not exists inf.alcohol_forwarding (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  procedure_id uuid not null,
  forwarding_type varchar(80) not null,
  destination varchar(255) not null,
  forwarded_at timestamptz not null,
  protocol varchar(120),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_alcohol_forwarding primary key (id),
  constraint fk_inf_alcohol_forwarding_procedure foreign key (procedure_id) references inf.alcohol_procedure (id)
);
create index if not exists ix_alcohol_forwarding_tenant_id on inf.alcohol_forwarding (tenant_id);
create index if not exists ix_alcohol_forwarding_procedure_id on inf.alcohol_forwarding (procedure_id);

select auth.create_rls_policy('inf', 'alcohol_procedure');

select auth.create_rls_policy('inf', 'alcohol_breathalyzer');

select auth.create_rls_policy('inf', 'alcohol_test');

select auth.create_rls_policy('inf', 'alcohol_refusal');

select auth.create_rls_policy('inf', 'alcohol_psychomotor_sign');

select auth.create_rls_policy('inf', 'alcohol_forwarding');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
