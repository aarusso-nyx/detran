-- Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e

-- Regenerable-only DDL for BP-INF-SPEED-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.speed_meter (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  model varchar(120) not null,
  serial_number varchar(80) not null,
  agency_identifier varchar(80) not null,
  meter_type varchar(20) default 'movel_acoplado' not null,
  inmetro_model_approval varchar(80) not null,
  has_ocr boolean default true not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_speed_meter primary key (id),
  constraint ck_inf_speed_meter_type_in_scope check (meter_type = 'movel_acoplado'),
  constraint ck_inf_speed_meter_ocr_required check (has_ocr = true)
);
create unique index if not exists ux_inf_speed_meter_serial on inf.speed_meter (tenant_id, serial_number);
create index if not exists ix_speed_meter_tenant_id on inf.speed_meter (tenant_id);

create table if not exists inf.speed_meter_certificate (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  meter_id uuid not null,
  kind varchar(20) not null,
  certificate_number varchar(80) not null,
  issuer varchar(120) not null,
  issued_on date not null,
  valid_until date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_speed_meter_certificate primary key (id),
  constraint ck_inf_speed_certificate_kind check (kind in ('inicial','periodica')),
  constraint ck_inf_speed_certificate_validity_order check (valid_until >= issued_on),
  constraint fk_inf_speed_certificate_meter foreign key (meter_id) references inf.speed_meter (id)
);
create unique index if not exists ux_inf_speed_certificate on inf.speed_meter_certificate (tenant_id, meter_id, kind, certificate_number);
create index if not exists ix_inf_speed_certificate_validity on inf.speed_meter_certificate (tenant_id, meter_id, valid_until);
create index if not exists ix_speed_meter_certificate_tenant_id on inf.speed_meter_certificate (tenant_id);
create index if not exists ix_speed_meter_certificate_meter_id on inf.speed_meter_certificate (meter_id);

create table if not exists inf.speed_measurement (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid,
  meter_id uuid not null,
  certificate_id uuid not null,
  measured_kmh numeric(6,2) not null,
  max_error_kmh numeric(6,2) not null,
  considered_kmh numeric(6,2) not null,
  road_limit_kmh numeric(6,2) not null,
  measured_at timestamptz not null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  plate_image_evidence_id uuid,
  ocr_plate_proposed varchar(16),
  plate_validated_by_agent boolean default false not null,
  agent_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_speed_measurement primary key (id),
  constraint ck_inf_speed_measurement_considered_is_derived check (considered_kmh = measured_kmh - max_error_kmh),
  constraint ck_inf_speed_measurement_error_not_negative check (max_error_kmh >= 0),
  constraint ck_inf_speed_measurement_ait_requires_plate_image check (ait_id is null or plate_image_evidence_id is not null),
  constraint ck_inf_speed_measurement_ait_requires_validated_plate check (ait_id is null or plate_validated_by_agent = true),
  constraint ck_inf_speed_measurement_ait_requires_excess check (ait_id is null or considered_kmh > road_limit_kmh),
  constraint fk_inf_speed_measurement_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_speed_measurement_meter foreign key (meter_id) references inf.speed_meter (id),
  constraint fk_inf_speed_measurement_certificate foreign key (certificate_id) references inf.speed_meter_certificate (id)
);
create index if not exists ix_inf_speed_measurement_ait on inf.speed_measurement (tenant_id, ait_id);
create index if not exists ix_inf_speed_measurement_meter on inf.speed_measurement (tenant_id, meter_id, measured_at);
create index if not exists ix_speed_measurement_tenant_id on inf.speed_measurement (tenant_id);
create index if not exists ix_speed_measurement_ait_id on inf.speed_measurement (ait_id);
create index if not exists ix_speed_measurement_meter_id on inf.speed_measurement (meter_id);
create index if not exists ix_speed_measurement_certificate_id on inf.speed_measurement (certificate_id);
create index if not exists ix_speed_measurement_plate_image_evidence_id on inf.speed_measurement (plate_image_evidence_id);
create index if not exists ix_speed_measurement_agent_id on inf.speed_measurement (agent_id);

select auth.create_rls_policy('inf', 'speed_meter');

select auth.create_rls_policy('inf', 'speed_meter_certificate');

select auth.create_rls_policy('inf', 'speed_measurement');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
