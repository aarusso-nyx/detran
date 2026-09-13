-- Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c

-- Regenerable-only DDL for BP-CH-CLINICAL-CONTROLS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.clinical_control_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  medical_exam_id uuid,
  psychological_exam_id uuid,
  control_kind varchar(32) not null,
  status varchar(16) default 'RECORDED' not null,
  payload jsonb default '{}'::jsonb not null,
  recorded_by uuid not null,
  recorded_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_clinical_control_event primary key (id),
  constraint ck_ch_clinical_control_kind check (control_kind in ('OPHTHALMOLOGY','SLEEP','DEVOLUTIVE','SATISFACTION','INTERN_DOUBLE_VALIDATION')),
  constraint ck_ch_clinical_control_status check (status = 'RECORDED'),
  constraint ck_ch_clinical_control_exam check (num_nonnulls(medical_exam_id, psychological_exam_id) <= 1),
  constraint fk_ch_clinical_control_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_clinical_control_medical_exam foreign key (medical_exam_id) references ch.medical_exam (id),
  constraint fk_ch_clinical_control_psych_exam foreign key (psychological_exam_id) references ch.psychological_exam (id)
);
create index if not exists ix_ch_clinical_control_encounter on ch.clinical_control_event (tenant_id, encounter_id, control_kind, recorded_at);
create index if not exists ix_clinical_control_event_tenant_id on ch.clinical_control_event (tenant_id);
create index if not exists ix_clinical_control_event_encounter_id on ch.clinical_control_event (encounter_id);
create index if not exists ix_clinical_control_event_medical_exam_id on ch.clinical_control_event (medical_exam_id);
create index if not exists ix_clinical_control_event_psychological_exam_id on ch.clinical_control_event (psychological_exam_id);

select auth.create_rls_policy('ch', 'clinical_control_event');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
