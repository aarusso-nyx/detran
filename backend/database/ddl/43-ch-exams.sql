-- Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9

-- Regenerable-only DDL for BP-CH-EXAMS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.psych_instrument (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(80) not null,
  name varchar(255) not null,
  version varchar(80) not null,
  satepsi_status varchar(24) not null,
  valid_from date not null,
  valid_to date,
  source_reference text not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_psych_instrument primary key (id),
  constraint ck_ch_psych_instrument_status check (satepsi_status in ('FAVORABLE','UNFAVORABLE','SUSPENDED')),
  constraint ck_ch_psych_instrument_period check (valid_to is null or valid_to >= valid_from)
);
create unique index if not exists ux_ch_psych_instrument_version on ch.psych_instrument (tenant_id, code, version);
create index if not exists ix_psych_instrument_tenant_id on ch.psych_instrument (tenant_id);

create table if not exists ch.medical_exam (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  professional_id uuid not null,
  performed_at timestamptz default now() not null,
  statutory_valid_until date not null,
  valid_until date not null,
  inaptitude_until date,
  validity_reduction_reason text,
  data jsonb not null,
  result varchar(32) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_medical_exam primary key (id),
  constraint ck_ch_medical_exam_result check (result in ('APTO','APTO_COM_RESTRICOES','INAPTO_TEMPORARIO','INAPTO')),
  constraint ck_ch_medical_exam_validity check (valid_until <= statutory_valid_until and (valid_until = statutory_valid_until or (validity_reduction_reason is not null and length(trim(validity_reduction_reason)) > 0))),
  constraint ck_ch_medical_exam_inaptitude_period check ((result = 'INAPTO_TEMPORARIO' and inaptitude_until is not null and inaptitude_until > performed_at::date) or (result <> 'INAPTO_TEMPORARIO' and inaptitude_until is null)),
  constraint fk_ch_medical_exam_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_medical_exam_professional foreign key (professional_id) references ch.professional (id)
);
create unique index if not exists ux_ch_medical_exam_encounter on ch.medical_exam (tenant_id, encounter_id);
create index if not exists ix_medical_exam_tenant_id on ch.medical_exam (tenant_id);
create index if not exists ix_medical_exam_encounter_id on ch.medical_exam (encounter_id);
create index if not exists ix_medical_exam_professional_id on ch.medical_exam (professional_id);

create table if not exists ch.psychological_exam (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  professional_id uuid not null,
  instrument_id uuid not null,
  performed_at timestamptz default now() not null,
  valid_until date,
  inaptitude_until date,
  validity_reduction_reason text,
  data jsonb not null,
  result varchar(32) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_psychological_exam primary key (id),
  constraint ck_ch_psychological_exam_result check (result in ('APTO','INAPTO_TEMPORARIO','INAPTO')),
  constraint ck_ch_psychological_exam_reduced_validity check (valid_until is null or (validity_reduction_reason is not null and length(trim(validity_reduction_reason)) > 0)),
  constraint ck_ch_psychological_exam_inaptitude_period check ((result = 'INAPTO_TEMPORARIO' and inaptitude_until is not null and inaptitude_until > performed_at::date) or (result <> 'INAPTO_TEMPORARIO' and inaptitude_until is null)),
  constraint fk_ch_psychological_exam_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_psychological_exam_professional foreign key (professional_id) references ch.professional (id),
  constraint fk_ch_psychological_exam_instrument foreign key (instrument_id) references ch.psych_instrument (id)
);
create unique index if not exists ux_ch_psychological_exam_encounter on ch.psychological_exam (tenant_id, encounter_id);
create index if not exists ix_psychological_exam_tenant_id on ch.psychological_exam (tenant_id);
create index if not exists ix_psychological_exam_encounter_id on ch.psychological_exam (encounter_id);
create index if not exists ix_psychological_exam_professional_id on ch.psychological_exam (professional_id);
create index if not exists ix_psychological_exam_instrument_id on ch.psychological_exam (instrument_id);

select auth.create_rls_policy('ch', 'psych_instrument');

select auth.create_rls_policy('ch', 'medical_exam');

select auth.create_rls_policy('ch', 'psychological_exam');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
