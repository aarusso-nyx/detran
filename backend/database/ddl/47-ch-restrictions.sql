-- Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf

-- Regenerable-only DDL for BP-CH-RESTRICTIONS-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.restriction_code (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  code varchar(32) not null,
  legal_label varchar(255) not null,
  annex_version varchar(80) not null,
  source_reference text not null,
  effective_from date not null,
  effective_to date,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_restriction_code primary key (id),
  constraint ck_ch_restriction_code_period check (effective_to is null or effective_to >= effective_from)
);
create unique index if not exists ux_ch_restriction_code_version on ch.restriction_code (tenant_id, code, annex_version);
create index if not exists ix_restriction_code_tenant_id on ch.restriction_code (tenant_id);

create table if not exists ch.encounter_restriction (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid not null,
  report_id uuid,
  restriction_code_id uuid not null,
  prescribed_by uuid not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_encounter_restriction primary key (id),
  constraint fk_ch_encounter_restriction_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_encounter_restriction_report foreign key (report_id) references ch.report (id),
  constraint fk_ch_encounter_restriction_code foreign key (restriction_code_id) references ch.restriction_code (id),
  constraint fk_ch_encounter_restriction_professional foreign key (prescribed_by) references ch.professional (id)
);
create unique index if not exists ux_ch_encounter_restriction on ch.encounter_restriction (tenant_id, encounter_id, restriction_code_id);
create index if not exists ix_encounter_restriction_tenant_id on ch.encounter_restriction (tenant_id);
create index if not exists ix_encounter_restriction_encounter_id on ch.encounter_restriction (encounter_id);
create index if not exists ix_encounter_restriction_report_id on ch.encounter_restriction (report_id);
create index if not exists ix_encounter_restriction_restriction_code_id on ch.encounter_restriction (restriction_code_id);

select auth.create_rls_policy('ch', 'restriction_code');

select auth.create_rls_policy('ch', 'encounter_restriction');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
