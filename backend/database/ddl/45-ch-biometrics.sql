-- Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939

-- Regenerable-only DDL for BP-CH-BIOMETRICS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.biometric_reference (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  patient_id uuid not null,
  kind varchar(24) not null,
  provider_code varchar(80) not null,
  provider_reference text not null,
  storage_document_id uuid not null,
  sha256 varchar(64) not null,
  quality_score numeric(5,2),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_biometric_reference primary key (id),
  constraint ck_ch_biometric_reference_kind check (kind in ('FACE','FINGERPRINT','SIGNATURE')),
  constraint ck_ch_biometric_reference_hash check (sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_ch_biometric_reference_quality check (quality_score is null or (quality_score >= 0 and quality_score <= 100)),
  constraint fk_ch_biometric_reference_patient foreign key (patient_id) references ch.patient (id)
);
create unique index if not exists ux_ch_biometric_reference_kind on ch.biometric_reference (tenant_id, patient_id, kind);
create index if not exists ix_biometric_reference_tenant_id on ch.biometric_reference (tenant_id);
create index if not exists ix_biometric_reference_patient_id on ch.biometric_reference (patient_id);
create index if not exists ix_biometric_reference_storage_document_id on ch.biometric_reference (storage_document_id);

create table if not exists ch.biometric_finger_condition (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  patient_id uuid not null,
  finger_code varchar(8) not null,
  condition varchar(24) not null,
  reason text,
  recorded_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_biometric_finger_condition primary key (id),
  constraint ck_ch_biometric_finger_code check (finger_code in ('LT','LI','LM','LR','LL','RT','RI','RM','RR','RL')),
  constraint ck_ch_biometric_finger_condition check (condition in ('AVAILABLE','TEMP_UNAVAILABLE','PERMANENT_ABSENT')),
  constraint ck_ch_biometric_finger_reason check (condition = 'AVAILABLE' or (reason is not null and length(trim(reason)) > 0)),
  constraint fk_ch_biometric_finger_patient foreign key (patient_id) references ch.patient (id)
);
create unique index if not exists ux_ch_biometric_finger_condition on ch.biometric_finger_condition (tenant_id, patient_id, finger_code);
create index if not exists ix_biometric_finger_condition_tenant_id on ch.biometric_finger_condition (tenant_id);
create index if not exists ix_biometric_finger_condition_patient_id on ch.biometric_finger_condition (patient_id);

create table if not exists ch.biometric_check (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  appointment_id uuid,
  encounter_id uuid,
  clinic_id uuid not null,
  station_id uuid not null,
  subject_patient_id uuid,
  subject_professional_id uuid,
  performed_at timestamptz default now() not null,
  kind varchar(16) not null,
  modality varchar(24) not null,
  score numeric(5,2),
  lfd_score numeric(5,2),
  passed boolean not null,
  evidence_document_id uuid not null,
  evidence_sha256 varchar(64) not null,
  reason text,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_biometric_check primary key (id),
  constraint ck_ch_biometric_check_kind check (kind in ('CHECKIN','MEDICAL','PSYCH')),
  constraint ck_ch_biometric_check_modality check (modality in ('FINGERPRINT','FACE')),
  constraint ck_ch_biometric_check_scope check ((kind = 'CHECKIN' and appointment_id is not null and encounter_id is null and subject_patient_id is not null and subject_professional_id is null) or (kind in ('MEDICAL','PSYCH') and encounter_id is not null and appointment_id is null and ((subject_patient_id is not null)::integer + (subject_professional_id is not null)::integer) = 1)),
  constraint ck_ch_biometric_check_hash check (evidence_sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_ch_biometric_check_scores check ((score is null or (score >= 0 and score <= 100)) and (lfd_score is null or (lfd_score >= 0 and lfd_score <= 100))),
  constraint fk_ch_biometric_check_appointment foreign key (appointment_id) references ch.appointment (id),
  constraint fk_ch_biometric_check_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_biometric_check_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_biometric_check_station foreign key (station_id) references ch.biometric_station (id),
  constraint fk_ch_biometric_check_patient foreign key (subject_patient_id) references ch.patient (id),
  constraint fk_ch_biometric_check_professional foreign key (subject_professional_id) references ch.professional (id)
);
create index if not exists ix_ch_biometric_check_appointment on ch.biometric_check (tenant_id, appointment_id, kind, performed_at);
create index if not exists ix_ch_biometric_check_encounter on ch.biometric_check (tenant_id, encounter_id, kind, performed_at);
create index if not exists ix_biometric_check_tenant_id on ch.biometric_check (tenant_id);
create index if not exists ix_biometric_check_appointment_id on ch.biometric_check (appointment_id);
create index if not exists ix_biometric_check_encounter_id on ch.biometric_check (encounter_id);
create index if not exists ix_biometric_check_clinic_id on ch.biometric_check (clinic_id);
create index if not exists ix_biometric_check_station_id on ch.biometric_check (station_id);
create index if not exists ix_biometric_check_subject_patient_id on ch.biometric_check (subject_patient_id);
create index if not exists ix_biometric_check_subject_professional_id on ch.biometric_check (subject_professional_id);
create index if not exists ix_biometric_check_evidence_document_id on ch.biometric_check (evidence_document_id);

create table if not exists ch.biometric_exception (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  appointment_id uuid,
  encounter_id uuid,
  clinic_id uuid not null,
  station_id uuid not null,
  biometric_check_id uuid not null,
  scope varchar(24) not null,
  requested_by uuid not null,
  reason text not null,
  justification text,
  attachment_document_ids jsonb default '[]'::jsonb not null,
  status varchar(16) default 'REQUESTED' not null,
  approved_by uuid,
  approved_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_biometric_exception primary key (id),
  constraint ck_ch_biometric_exception_scope check (scope in ('CHECKIN','MEDICAL','PSYCH') and ((appointment_id is not null)::integer + (encounter_id is not null)::integer) = 1),
  constraint ck_ch_biometric_exception_status check (status in ('REQUESTED','APPROVED','REJECTED','EXPIRED','CANCELLED')),
  constraint ck_ch_biometric_exception_approval check (status not in ('APPROVED','REJECTED') or (approved_by is not null and approved_at is not null and approved_by <> requested_by)),
  constraint ck_ch_biometric_exception_expiry check (expires_at > created_at),
  constraint fk_ch_biometric_exception_appointment foreign key (appointment_id) references ch.appointment (id),
  constraint fk_ch_biometric_exception_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_biometric_exception_clinic foreign key (clinic_id) references ch.clinic (id),
  constraint fk_ch_biometric_exception_station foreign key (station_id) references ch.biometric_station (id),
  constraint fk_ch_biometric_exception_check foreign key (biometric_check_id) references ch.biometric_check (id)
);
create index if not exists ix_ch_biometric_exception_status on ch.biometric_exception (tenant_id, status, expires_at);
create index if not exists ix_ch_biometric_exception_encounter on ch.biometric_exception (tenant_id, encounter_id);
create index if not exists ix_biometric_exception_tenant_id on ch.biometric_exception (tenant_id);
create index if not exists ix_biometric_exception_appointment_id on ch.biometric_exception (appointment_id);
create index if not exists ix_biometric_exception_encounter_id on ch.biometric_exception (encounter_id);
create index if not exists ix_biometric_exception_clinic_id on ch.biometric_exception (clinic_id);
create index if not exists ix_biometric_exception_station_id on ch.biometric_exception (station_id);
create index if not exists ix_biometric_exception_biometric_check_id on ch.biometric_exception (biometric_check_id);

select auth.create_rls_policy('ch', 'biometric_reference');

select auth.create_rls_policy('ch', 'biometric_finger_condition');

select auth.create_rls_policy('ch', 'biometric_check');

select auth.create_rls_policy('ch', 'biometric_exception');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
