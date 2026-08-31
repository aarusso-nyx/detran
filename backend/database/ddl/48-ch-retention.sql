-- Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78

-- Regenerable-only DDL for BP-CH-RETENTION-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.retention_case (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  patient_id uuid not null,
  custodian varchar(24) not null,
  last_record_at timestamptz not null,
  eligible_after date not null,
  preservation_status varchar(32) not null,
  status varchar(32) not null,
  block_reasons jsonb not null,
  assessed_by uuid not null,
  assessed_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_retention_case primary key (id),
  constraint ck_ch_retention_case_custodian check (custodian = 'PLATFORM'),
  constraint ck_ch_retention_case_preservation check (preservation_status in ('PAdES_LTA_REQUIRED','PAdES_LTA_READY')),
  constraint ck_ch_retention_case_status check (status in ('RETAINED','LEGAL_REVIEW','ELIGIBLE_BLOCKED')),
  constraint ck_ch_retention_case_period check (eligible_after >= (last_record_at::date + interval '20 years')::date),
  constraint fk_ch_retention_case_patient foreign key (patient_id) references ch.patient (id)
);
create unique index if not exists ux_ch_retention_case_patient on ch.retention_case (tenant_id, patient_id);
create index if not exists ix_ch_retention_case_eligibility on ch.retention_case (tenant_id, status, eligible_after);
create index if not exists ix_retention_case_tenant_id on ch.retention_case (tenant_id);
create index if not exists ix_retention_case_patient_id on ch.retention_case (patient_id);

create table if not exists ch.retention_hold (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  retention_case_id uuid not null,
  reason text not null,
  status varchar(16) not null,
  imposed_by uuid not null,
  released_by uuid,
  released_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_retention_hold primary key (id),
  constraint ck_ch_retention_hold_status check (status in ('ACTIVE','RELEASED')),
  constraint ck_ch_retention_hold_release check (status <> 'RELEASED' or (released_by is not null and released_at is not null)),
  constraint fk_ch_retention_hold_case foreign key (retention_case_id) references ch.retention_case (id)
);
create index if not exists ix_ch_retention_hold_case on ch.retention_hold (tenant_id, retention_case_id, status);
create index if not exists ix_retention_hold_tenant_id on ch.retention_hold (tenant_id);
create index if not exists ix_retention_hold_retention_case_id on ch.retention_hold (retention_case_id);

create table if not exists ch.retention_disposition (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  retention_case_id uuid not null,
  destination varchar(16) not null,
  status varchar(24) not null,
  justification text not null,
  proposed_by uuid not null,
  proposed_at timestamptz not null,
  return_offered_at timestamptz not null,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_retention_disposition primary key (id),
  constraint ck_ch_retention_disposition_destination check (destination in ('RETURN','EXTEND','DELETE')),
  constraint ck_ch_retention_disposition_status check (status in ('PROPOSED','DPO_REVIEWED','BLOCKED')),
  constraint ck_ch_retention_disposition_return_first check (return_offered_at <= proposed_at),
  constraint ck_ch_retention_disposition_review check (status = 'PROPOSED' or (reviewed_by is not null and reviewed_at is not null)),
  constraint fk_ch_retention_disposition_case foreign key (retention_case_id) references ch.retention_case (id)
);
create index if not exists ix_ch_retention_disposition_case on ch.retention_disposition (tenant_id, retention_case_id, status);
create index if not exists ix_retention_disposition_tenant_id on ch.retention_disposition (tenant_id);
create index if not exists ix_retention_disposition_retention_case_id on ch.retention_disposition (retention_case_id);

select auth.create_rls_policy('ch', 'retention_case');

select auth.create_rls_policy('ch', 'retention_hold');

select auth.create_rls_policy('ch', 'retention_disposition');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
