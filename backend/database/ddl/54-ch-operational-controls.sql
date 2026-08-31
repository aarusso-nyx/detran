-- Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da

-- Regenerable-only DDL for BP-CH-OPERATIONAL-CONTROLS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.operational_record (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  record_kind varchar(32) not null,
  subject_type varchar(80) not null,
  subject_id uuid,
  clinic_id uuid,
  status varchar(80) not null,
  payload jsonb default '{}'::jsonb not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_operational_record primary key (id),
  constraint ck_ch_operational_record_kind check (record_kind in ('CLINIC_INSPECTION','CREDENTIALING_STATUS','SANCTION','CLINIC_LOCATION','DASHBOARD_SNAPSHOT','BACKUP_DRILL','SUPPORT_TICKET','RELEASE_WINDOW')),
  constraint ck_ch_operational_subject check (subject_type ~ '^[A-Z][A-Z0-9_]{1,79}$'),
  constraint ck_ch_operational_status check (status ~ '^[A-Z][A-Z0-9_]{1,79}$'),
  constraint ck_ch_operational_location_clinic check (record_kind <> 'CLINIC_LOCATION' or clinic_id is not null),
  constraint fk_ch_operational_record_clinic foreign key (clinic_id) references ch.clinic (id)
);
create index if not exists ix_ch_operational_record_kind on ch.operational_record (tenant_id, record_kind, status, created_at);
create index if not exists ix_operational_record_tenant_id on ch.operational_record (tenant_id);
create index if not exists ix_operational_record_subject_id on ch.operational_record (subject_id);
create index if not exists ix_operational_record_clinic_id on ch.operational_record (clinic_id);

select auth.create_rls_policy('ch', 'operational_record');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
