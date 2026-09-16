-- Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c

-- Regenerable-only DDL for BP-PORTAL-IDENTITY-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.subject (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  cpf_hash varchar(64) not null,
  name text not null,
  govbr_level_observed varchar(20),
  assurance_level_observed varchar(20) not null,
  observed_at timestamptz not null,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_subject primary key (id),
  constraint ck_portal_subject_cpf_hash check (cpf_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_portal_subject_govbr_level_observed check (govbr_level_observed is null or govbr_level_observed in ('bronze','prata','ouro','qualificada')),
  constraint ck_portal_subject_assurance_level_observed check (assurance_level_observed in ('simples','avancada','qualificada'))
);
create unique index if not exists ux_portal_subject_cpf_hash on portal.subject (tenant_id, cpf_hash);
create index if not exists ix_subject_tenant_id on portal.subject (tenant_id);

create table if not exists portal.representation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  representative_subject_id uuid not null,
  represented_cpf_hash varchar(64) not null,
  represented_name text not null,
  instrument_document_id uuid not null,
  scope varchar(10) not null,
  valid_until date,
  state varchar(40) not null,
  refusal_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_representation primary key (id),
  constraint ck_portal_representation_represented_cpf_hash check (represented_cpf_hash ~ '^[0-9a-f]{64}$'),
  constraint ck_portal_representation_scope check (scope in ('ait','all')),
  constraint ck_portal_representation_state check (state in ('PROCURACAO_APRESENTADA','PROCURACAO_VALIDADA','PROCURACAO_RECUSADA')),
  constraint fk_portal_representation_representative foreign key (representative_subject_id) references portal.subject (id)
);
create index if not exists ix_portal_representation_representative on portal.representation (tenant_id, representative_subject_id, state);
create index if not exists ix_portal_representation_represented on portal.representation (tenant_id, represented_cpf_hash, state);
create index if not exists ix_representation_tenant_id on portal.representation (tenant_id);
create index if not exists ix_representation_representative_subject_id on portal.representation (representative_subject_id);
create index if not exists ix_representation_instrument_document_id on portal.representation (instrument_document_id);

create table if not exists portal.act_level_policy (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  act_key varchar(60) not null,
  minimum_assurance varchar(20) not null,
  legal_basis text not null,
  decision_ref varchar(40),
  enabled boolean not null,
  effective_from date not null,
  effective_to date,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_act_level_policy primary key (id),
  constraint ck_portal_act_level_policy_minimum_assurance check (minimum_assurance in ('none','simples','avancada','qualificada')),
  constraint ck_portal_act_level_policy_effective_range check (effective_to is null or effective_to >= effective_from)
);
create unique index if not exists ux_portal_act_level_policy_act_key_effective_from on portal.act_level_policy (tenant_id, act_key, effective_from);
create index if not exists ix_act_level_policy_tenant_id on portal.act_level_policy (tenant_id);

create table if not exists portal.entitlement (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_id uuid not null,
  target_kind varchar(20) not null,
  target_id uuid not null,
  relation varchar(20) not null,
  origin varchar(20) not null,
  valid_from date not null,
  valid_until date,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_entitlement primary key (id),
  constraint ck_portal_entitlement_target_kind check (target_kind in ('ait','case','vehicle','license','crash','exam')),
  constraint ck_portal_entitlement_relation check (relation in ('owner','driver','representative','interested_party')),
  constraint ck_portal_entitlement_origin check (origin in ('renavam','renach','infraction','representation','manual')),
  constraint fk_portal_entitlement_subject foreign key (subject_id) references portal.subject (id)
);
create unique index if not exists ux_portal_entitlement_subject_target_relation on portal.entitlement (tenant_id, subject_id, target_kind, target_id, relation);
create index if not exists ix_portal_entitlement_target on portal.entitlement (tenant_id, target_kind, target_id);
create index if not exists ix_entitlement_tenant_id on portal.entitlement (tenant_id);
create index if not exists ix_entitlement_subject_id on portal.entitlement (subject_id);
create index if not exists ix_entitlement_target_id on portal.entitlement (target_id);

select auth.create_rls_policy('portal', 'subject');

select auth.create_rls_policy('portal', 'representation');

select auth.create_rls_policy('portal', 'act_level_policy');

select auth.create_rls_policy('portal', 'entitlement');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
