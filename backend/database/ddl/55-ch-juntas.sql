-- Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2

-- Regenerable-only DDL for BP-CH-JUNTAS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.junta_case (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  applicant_patient_id uuid not null,
  track varchar(16) not null,
  reason_code varchar(48) not null,
  reason_detail text,
  result_known_at timestamptz not null,
  requested_at timestamptz not null,
  request_deadline_at timestamptz not null,
  status varchar(32) default 'SUBMITTED' not null,
  submitted_by uuid not null,
  finalized_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_junta_case primary key (id),
  constraint ck_ch_junta_case_track check (track in ('MEDICAL','PSYCH')),
  constraint ck_ch_junta_case_reason check (reason_code in ('RESULT_DISAGREEMENT','PERMANENT_INAPTITUDE','CLINICAL_DIVERGENCE','OTHER_DOCUMENTED')),
  constraint ck_ch_junta_case_status check (status in ('SUBMITTED','UNDER_REVIEW','AWAITING_COMPLEMENT','DECIDED','APPEALED','FINAL_DECIDED')),
  constraint ck_ch_junta_case_deadline check (request_deadline_at = result_known_at + interval '30 days' and requested_at <= request_deadline_at),
  constraint fk_ch_junta_case_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_junta_case_applicant foreign key (applicant_patient_id) references ch.patient (id)
);
create index if not exists ix_ch_junta_case_encounter on ch.junta_case (tenant_id, encounter_id, status);
create index if not exists ix_ch_junta_case_applicant on ch.junta_case (tenant_id, applicant_patient_id, requested_at);
create index if not exists ix_junta_case_tenant_id on ch.junta_case (tenant_id);
create index if not exists ix_junta_case_encounter_id on ch.junta_case (encounter_id);
create index if not exists ix_junta_case_applicant_patient_id on ch.junta_case (applicant_patient_id);

create table if not exists ch.junta_board (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  instance varchar(16) not null,
  designated_by varchar(16) not null,
  designated_at timestamptz not null,
  designation_deadline_rule varchar(32),
  designation_deadline_at timestamptz,
  decision_deadline_at timestamptz,
  status varchar(16) default 'DESIGNATED' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_junta_board primary key (id),
  constraint ck_ch_junta_board_instance check (instance in ('SECOND','SPECIAL')),
  constraint ck_ch_junta_board_designator check ((instance = 'SECOND' and designated_by = 'DETRAN') or (instance = 'SPECIAL' and designated_by = 'CETRAN')),
  constraint ck_ch_junta_board_deadlines check ((instance = 'SECOND' and designation_deadline_rule = '15_BUSINESS_DAYS' and decision_deadline_at = designated_at + interval '30 days') or (instance = 'SPECIAL' and designation_deadline_rule is null and designation_deadline_at is null and decision_deadline_at is null)),
  constraint ck_ch_junta_board_status check (status in ('DESIGNATED','DECIDED')),
  constraint fk_ch_junta_board_case foreign key (case_id) references ch.junta_case (id)
);
create unique index if not exists ux_ch_junta_board_instance on ch.junta_board (tenant_id, case_id, instance);
create index if not exists ix_junta_board_tenant_id on ch.junta_board (tenant_id);
create index if not exists ix_junta_board_case_id on ch.junta_board (case_id);

create table if not exists ch.junta_board_member (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  board_id uuid not null,
  professional_id uuid not null,
  role varchar(16) default 'MEMBER' not null,
  specialist boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_junta_board_member primary key (id),
  constraint ck_ch_junta_member_role check (role in ('CHAIR','MEMBER')),
  constraint fk_ch_junta_member_board foreign key (board_id) references ch.junta_board (id),
  constraint fk_ch_junta_member_professional foreign key (professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_junta_board_member on ch.junta_board_member (tenant_id, board_id, professional_id);
create index if not exists ix_junta_board_member_tenant_id on ch.junta_board_member (tenant_id);
create index if not exists ix_junta_board_member_board_id on ch.junta_board_member (board_id);
create index if not exists ix_junta_board_member_professional_id on ch.junta_board_member (professional_id);

create table if not exists ch.junta_decision (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  board_id uuid not null,
  outcome varchar(32) not null,
  rationale text not null,
  content_sha256 varchar(64) not null,
  storage_document_id uuid not null,
  artifact_sha256 varchar(64) not null,
  signature_level varchar(24) not null,
  signature_format varchar(24) not null,
  signed_at timestamptz not null,
  tsa_time timestamptz not null,
  certificate_validation_source varchar(8) not null,
  certificate_validation_status varchar(16) not null,
  certificate_validated_at timestamptz not null,
  decided_at timestamptz not null,
  recorded_by uuid not null,
  administrative_exhausted boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_junta_decision primary key (id),
  constraint ck_ch_junta_decision_outcome check (outcome in ('REVERSED','UPHELD','COMPLEMENT_REQUIRED')),
  constraint ck_ch_junta_decision_signature check (content_sha256 ~ '^[0-9a-f]{64}$' and artifact_sha256 ~ '^[0-9a-f]{64}$' and signature_format = 'PAdES-TSA' and signature_level in ('ADVANCED','QUALIFIED') and certificate_validation_source in ('OCSP','CRL') and certificate_validation_status = 'GOOD'),
  constraint fk_ch_junta_decision_case foreign key (case_id) references ch.junta_case (id),
  constraint fk_ch_junta_decision_board foreign key (board_id) references ch.junta_board (id)
);
create index if not exists ix_ch_junta_decision_board on ch.junta_decision (tenant_id, board_id, decided_at);
create index if not exists ix_junta_decision_tenant_id on ch.junta_decision (tenant_id);
create index if not exists ix_junta_decision_case_id on ch.junta_decision (case_id);
create index if not exists ix_junta_decision_board_id on ch.junta_decision (board_id);
create index if not exists ix_junta_decision_storage_document_id on ch.junta_decision (storage_document_id);

create table if not exists ch.junta_appeal (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  source_decision_id uuid not null,
  applicant_patient_id uuid not null,
  result_known_at timestamptz not null,
  filed_at timestamptz not null,
  filing_deadline_at timestamptz not null,
  forwarded_at timestamptz,
  forwarding_deadline_rule varchar(32) default '20_BUSINESS_DAYS' not null,
  forwarding_deadline_at timestamptz,
  status varchar(16) default 'FILED' not null,
  filed_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_junta_appeal primary key (id),
  constraint ck_ch_junta_appeal_deadlines check (filing_deadline_at = result_known_at + interval '30 days' and filed_at <= filing_deadline_at and forwarding_deadline_rule = '20_BUSINESS_DAYS'),
  constraint ck_ch_junta_appeal_status check (status in ('FILED','FORWARDED','DESIGNATED','DECIDED')),
  constraint fk_ch_junta_appeal_case foreign key (case_id) references ch.junta_case (id),
  constraint fk_ch_junta_appeal_decision foreign key (source_decision_id) references ch.junta_decision (id),
  constraint fk_ch_junta_appeal_applicant foreign key (applicant_patient_id) references ch.patient (id)
);
create unique index if not exists ux_ch_junta_appeal_decision on ch.junta_appeal (tenant_id, source_decision_id);
create index if not exists ix_ch_junta_appeal_status on ch.junta_appeal (tenant_id, status, forwarding_deadline_at);
create index if not exists ix_junta_appeal_tenant_id on ch.junta_appeal (tenant_id);
create index if not exists ix_junta_appeal_case_id on ch.junta_appeal (case_id);
create index if not exists ix_junta_appeal_source_decision_id on ch.junta_appeal (source_decision_id);
create index if not exists ix_junta_appeal_applicant_patient_id on ch.junta_appeal (applicant_patient_id);

select auth.create_rls_policy('ch', 'junta_case');

select auth.create_rls_policy('ch', 'junta_board');

select auth.create_rls_policy('ch', 'junta_board_member');

select auth.create_rls_policy('ch', 'junta_decision');

select auth.create_rls_policy('ch', 'junta_appeal');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
