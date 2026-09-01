-- Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5

-- Regenerable-only DDL for BP-CH-REPORTS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.report (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  kind varchar(16) not null,
  source_exam_id uuid not null,
  content_sha256 varchar(64) not null,
  storage_document_id uuid not null,
  artifact_sha256 varchar(64) not null,
  signer_professional_id uuid not null,
  signer_name varchar(255) not null,
  signer_council varchar(120) not null,
  signature_level varchar(24) not null,
  signature_format varchar(24) not null,
  signed_at timestamptz not null,
  tsa_time timestamptz not null,
  certificate_validation_source varchar(8) not null,
  certificate_validation_status varchar(16) not null,
  certificate_validated_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_report primary key (id),
  constraint ck_ch_report_kind check (kind in ('MEDICAL','PSYCH')),
  constraint ck_ch_report_signature_format check (signature_format = 'PAdES-TSA'),
  constraint ck_ch_report_signature_level check (signature_level in ('ADVANCED','QUALIFIED')),
  constraint ck_ch_report_validation_source check (certificate_validation_source in ('OCSP','CRL')),
  constraint ck_ch_report_validation_status check (certificate_validation_status = 'GOOD'),
  constraint ck_ch_report_hashes check (content_sha256 ~ '^[0-9a-f]{64}$' and artifact_sha256 ~ '^[0-9a-f]{64}$'),
  constraint fk_ch_report_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_report_professional foreign key (signer_professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_report_encounter_kind on ch.report (tenant_id, encounter_id, kind);
create unique index if not exists ux_ch_report_storage_document on ch.report (tenant_id, storage_document_id);
create index if not exists ix_report_tenant_id on ch.report (tenant_id);
create index if not exists ix_report_encounter_id on ch.report (encounter_id);
create index if not exists ix_report_source_exam_id on ch.report (source_exam_id);
create index if not exists ix_report_storage_document_id on ch.report (storage_document_id);
create index if not exists ix_report_signer_professional_id on ch.report (signer_professional_id);

create table if not exists ch.report_addendum (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  report_id uuid not null,
  reason text not null,
  content jsonb not null,
  content_sha256 varchar(64) not null,
  status varchar(16) default 'REQUESTED' not null,
  requested_by uuid not null,
  approved_by uuid,
  approved_at timestamptz,
  storage_document_id uuid,
  artifact_sha256 varchar(64),
  signed_at timestamptz,
  tsa_time timestamptz,
  certificate_validation_source varchar(8),
  certificate_validation_status varchar(16),
  certificate_validated_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_report_addendum primary key (id),
  constraint ck_ch_report_addendum_status check (status in ('REQUESTED','APPROVED','SIGNED','REJECTED')),
  constraint ck_ch_report_addendum_approval check (status = 'REQUESTED' or (approved_by is not null and approved_at is not null and approved_by <> requested_by)),
  constraint ck_ch_report_addendum_signature check (status <> 'SIGNED' or (storage_document_id is not null and artifact_sha256 is not null and signed_at is not null and tsa_time is not null and certificate_validation_source in ('OCSP','CRL') and certificate_validation_status = 'GOOD')),
  constraint fk_ch_report_addendum_report foreign key (report_id) references ch.report (id)
);
create index if not exists ix_ch_report_addendum_report on ch.report_addendum (tenant_id, report_id, status);
create index if not exists ix_report_addendum_tenant_id on ch.report_addendum (tenant_id);
create index if not exists ix_report_addendum_report_id on ch.report_addendum (report_id);
create index if not exists ix_report_addendum_storage_document_id on ch.report_addendum (storage_document_id);

create table if not exists ch.report_addendum_approval (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  report_addendum_id uuid not null,
  approval_role varchar(24) not null,
  approved_by uuid not null,
  approved_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_report_addendum_approval primary key (id),
  constraint ck_ch_report_addendum_approval_role check (approval_role in ('SUPERVISOR','ADMIN_CLINICA')),
  constraint fk_ch_report_addendum_approval_addendum foreign key (report_addendum_id) references ch.report_addendum (id)
);
create unique index if not exists ux_ch_report_addendum_approval_role on ch.report_addendum_approval (tenant_id, report_addendum_id, approval_role);
create unique index if not exists ux_ch_report_addendum_approval_actor on ch.report_addendum_approval (tenant_id, report_addendum_id, approved_by);
create index if not exists ix_report_addendum_approval_tenant_id on ch.report_addendum_approval (tenant_id);
create index if not exists ix_report_addendum_approval_report_addendum_id on ch.report_addendum_approval (report_addendum_id);

create table if not exists ch.registration_block_notice (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  report_id uuid not null,
  source_addendum_id uuid,
  encounter_id uuid not null,
  professional_id uuid not null,
  track varchar(16) not null,
  result varchar(32) not null,
  legal_result_label varchar(80) not null,
  inaptitude_until date,
  recipients jsonb default '["MEDICAL_SECTOR","PSYCHOLOGICAL_SECTOR"]'::jsonb not null,
  channel varchar(32) default 'INTERNAL_CASE_INBOX' not null,
  status varchar(16) default 'DELIVERED' not null,
  delivered_at timestamptz default now() not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_registration_block_notice primary key (id),
  constraint ck_ch_registration_block_track check (track in ('MEDICAL','PSYCH')),
  constraint ck_ch_registration_block_result check (result in ('INAPTO_TEMPORARIO','INAPTO')),
  constraint ck_ch_registration_block_result_label check ((result = 'INAPTO_TEMPORARIO' and legal_result_label = 'Inapto temporário') or (result = 'INAPTO' and legal_result_label = 'Inapto')),
  constraint ck_ch_registration_block_deadline check ((result = 'INAPTO_TEMPORARIO' and inaptitude_until is not null) or (result = 'INAPTO' and inaptitude_until is null)),
  constraint ck_ch_registration_block_delivery check (status = 'DELIVERED' and channel = 'INTERNAL_CASE_INBOX' and recipients = '["MEDICAL_SECTOR", "PSYCHOLOGICAL_SECTOR"]'::jsonb),
  constraint fk_ch_registration_block_report foreign key (report_id) references ch.report (id),
  constraint fk_ch_registration_block_addendum foreign key (source_addendum_id) references ch.report_addendum (id),
  constraint fk_ch_registration_block_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_registration_block_professional foreign key (professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_registration_block_report on ch.registration_block_notice (tenant_id, report_id) where source_addendum_id is null;
create unique index if not exists ux_ch_registration_block_addendum on ch.registration_block_notice (tenant_id, source_addendum_id) where source_addendum_id is not null;
create index if not exists ix_ch_registration_block_inbox on ch.registration_block_notice (tenant_id, status, delivered_at);
create index if not exists ix_registration_block_notice_tenant_id on ch.registration_block_notice (tenant_id);
create index if not exists ix_registration_block_notice_report_id on ch.registration_block_notice (report_id);
create index if not exists ix_registration_block_notice_source_addendum_id on ch.registration_block_notice (source_addendum_id);
create index if not exists ix_registration_block_notice_encounter_id on ch.registration_block_notice (encounter_id);
create index if not exists ix_registration_block_notice_professional_id on ch.registration_block_notice (professional_id);

create table if not exists ch.feedback_request (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  report_id uuid not null,
  encounter_id uuid not null,
  patient_id uuid not null,
  professional_id uuid not null,
  requested_by uuid not null,
  legal_result_label varchar(80) not null,
  status varchar(16) default 'REQUESTED' not null,
  requested_at timestamptz default now() not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  completion_summary text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_feedback_request primary key (id),
  constraint ck_ch_feedback_status check (status in ('REQUESTED','SCHEDULED','COMPLETED','CANCELLED')),
  constraint ck_ch_feedback_schedule check (status = 'REQUESTED' or scheduled_at is not null),
  constraint ck_ch_feedback_completion check (status <> 'COMPLETED' or (completed_at is not null and completion_summary is not null and length(trim(completion_summary)) > 0)),
  constraint fk_ch_feedback_report foreign key (report_id) references ch.report (id),
  constraint fk_ch_feedback_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_feedback_patient foreign key (patient_id) references ch.patient (id),
  constraint fk_ch_feedback_professional foreign key (professional_id) references ch.professional (id),
  constraint fk_ch_feedback_requester foreign key (requested_by) references auth.users (id)
);
create unique index if not exists ux_ch_feedback_request_active on ch.feedback_request (tenant_id, report_id) where status in ('REQUESTED','SCHEDULED');
create index if not exists ix_ch_feedback_professional on ch.feedback_request (tenant_id, professional_id, status);
create index if not exists ix_feedback_request_tenant_id on ch.feedback_request (tenant_id);
create index if not exists ix_feedback_request_report_id on ch.feedback_request (report_id);
create index if not exists ix_feedback_request_encounter_id on ch.feedback_request (encounter_id);
create index if not exists ix_feedback_request_patient_id on ch.feedback_request (patient_id);
create index if not exists ix_feedback_request_professional_id on ch.feedback_request (professional_id);

create table if not exists ch.episode_export (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  content_sha256 varchar(64) not null,
  storage_document_id uuid not null,
  artifact_sha256 varchar(64) not null,
  signer_professional_id uuid not null,
  signer_name varchar(255) not null,
  signer_council varchar(120) not null,
  signature_level varchar(24) not null,
  signature_format varchar(24) not null,
  signed_at timestamptz not null,
  tsa_time timestamptz not null,
  certificate_validation_source varchar(8) not null,
  certificate_validation_status varchar(16) not null,
  certificate_validated_at timestamptz not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_episode_export primary key (id),
  constraint ck_ch_episode_export_signature_format check (signature_format = 'PAdES-TSA'),
  constraint ck_ch_episode_export_signature_level check (signature_level in ('ADVANCED','QUALIFIED')),
  constraint ck_ch_episode_export_validation_source check (certificate_validation_source in ('OCSP','CRL')),
  constraint ck_ch_episode_export_validation_status check (certificate_validation_status = 'GOOD'),
  constraint ck_ch_episode_export_hashes check (content_sha256 ~ '^[0-9a-f]{64}$' and artifact_sha256 ~ '^[0-9a-f]{64}$'),
  constraint fk_ch_episode_export_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_episode_export_professional foreign key (signer_professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_episode_export_encounter on ch.episode_export (tenant_id, encounter_id);
create unique index if not exists ux_ch_episode_export_storage_document on ch.episode_export (tenant_id, storage_document_id);
create index if not exists ix_episode_export_tenant_id on ch.episode_export (tenant_id);
create index if not exists ix_episode_export_encounter_id on ch.episode_export (encounter_id);
create index if not exists ix_episode_export_storage_document_id on ch.episode_export (storage_document_id);
create index if not exists ix_episode_export_signer_professional_id on ch.episode_export (signer_professional_id);

create table if not exists ch.clinical_document (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid,
  patient_id uuid not null,
  kind varchar(64) not null,
  storage_document_id uuid not null,
  content_type varchar(160) not null,
  sha256 varchar(64) not null,
  size_bytes bigint not null,
  uploaded_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_clinical_document primary key (id),
  constraint ck_ch_clinical_document_hash check (sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_ch_clinical_document_size check (size_bytes >= 0),
  constraint fk_ch_clinical_document_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_clinical_document_patient foreign key (patient_id) references ch.patient (id)
);
create index if not exists ix_ch_clinical_document_encounter on ch.clinical_document (tenant_id, encounter_id);
create unique index if not exists ux_ch_clinical_document_storage on ch.clinical_document (tenant_id, storage_document_id);
create index if not exists ix_clinical_document_tenant_id on ch.clinical_document (tenant_id);
create index if not exists ix_clinical_document_encounter_id on ch.clinical_document (encounter_id);
create index if not exists ix_clinical_document_patient_id on ch.clinical_document (patient_id);
create index if not exists ix_clinical_document_storage_document_id on ch.clinical_document (storage_document_id);

select auth.create_rls_policy('ch', 'report');

select auth.create_rls_policy('ch', 'report_addendum');

select auth.create_rls_policy('ch', 'report_addendum_approval');

select auth.create_rls_policy('ch', 'registration_block_notice');

select auth.create_rls_policy('ch', 'feedback_request');

select auth.create_rls_policy('ch', 'episode_export');

select auth.create_rls_policy('ch', 'clinical_document');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
