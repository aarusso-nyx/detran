-- Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062

-- Regenerable-only DDL for BP-CH-TOXICOLOGY-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.periodic_toxicology_result (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  source_event_id varchar(160) not null,
  payload_sha256 varchar(64) not null,
  patient_id uuid not null,
  driver_cpf varchar(11) not null,
  category varchar(1) not null,
  result varchar(16) not null,
  collected_at timestamptz not null,
  valid_until timestamptz not null,
  occurred_at timestamptz not null,
  laboratory_code varchar(80) not null,
  source_reference varchar(160) not null,
  driver_alert_status varchar(24) not null,
  received_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_periodic_toxicology_result primary key (id),
  constraint ck_ch_toxicology_hash check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_ch_toxicology_cpf check (driver_cpf ~ '^[0-9]{11}$'),
  constraint ck_ch_toxicology_category check (category in ('C','D','E')),
  constraint ck_ch_toxicology_result check (result in ('POSITIVE','NEGATIVE')),
  constraint ck_ch_toxicology_validity check (valid_until = collected_at + interval '90 days' and occurred_at >= collected_at),
  constraint ck_ch_toxicology_alert_status check (driver_alert_status in ('SENT','SCHEDULED','NOT_REQUIRED')),
  constraint fk_ch_toxicology_patient foreign key (patient_id) references ch.patient (id)
);
create unique index if not exists ux_ch_toxicology_source_event on ch.periodic_toxicology_result (tenant_id, source_event_id);
create index if not exists ix_ch_toxicology_patient on ch.periodic_toxicology_result (tenant_id, patient_id, occurred_at);
create index if not exists ix_periodic_toxicology_result_tenant_id on ch.periodic_toxicology_result (tenant_id);
create index if not exists ix_periodic_toxicology_result_source_event_id on ch.periodic_toxicology_result (source_event_id);
create index if not exists ix_periodic_toxicology_result_patient_id on ch.periodic_toxicology_result (patient_id);

create table if not exists ch.toxicology_suspension (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  patient_id uuid not null,
  source_positive_result_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status varchar(16) default 'ACTIVE' not null,
  released_by_result_id uuid,
  released_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_toxicology_suspension primary key (id),
  constraint ck_ch_toxicology_suspension_period check (ends_at = starts_at + interval '3 months'),
  constraint ck_ch_toxicology_suspension_status check (status in ('ACTIVE','RELEASED','EXPIRED')),
  constraint ck_ch_toxicology_suspension_release check ((status = 'ACTIVE' and released_by_result_id is null and released_at is null) or (status = 'RELEASED' and released_by_result_id is not null and released_at is not null) or (status = 'EXPIRED' and released_by_result_id is null and released_at is not null)),
  constraint fk_ch_toxicology_suspension_patient foreign key (patient_id) references ch.patient (id),
  constraint fk_ch_toxicology_suspension_positive foreign key (source_positive_result_id) references ch.periodic_toxicology_result (id),
  constraint fk_ch_toxicology_suspension_release foreign key (released_by_result_id) references ch.periodic_toxicology_result (id)
);
create unique index if not exists ux_ch_toxicology_active_suspension on ch.toxicology_suspension (tenant_id, patient_id) where status = 'ACTIVE';
create index if not exists ix_ch_toxicology_suspension_patient on ch.toxicology_suspension (tenant_id, patient_id, starts_at);
create index if not exists ix_toxicology_suspension_tenant_id on ch.toxicology_suspension (tenant_id);
create index if not exists ix_toxicology_suspension_patient_id on ch.toxicology_suspension (patient_id);
create index if not exists ix_toxicology_suspension_source_positive_result_id on ch.toxicology_suspension (source_positive_result_id);
create index if not exists ix_toxicology_suspension_released_by_result_id on ch.toxicology_suspension (released_by_result_id);

select auth.create_rls_policy('ch', 'periodic_toxicology_result');

select auth.create_rls_policy('ch', 'toxicology_suspension');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
