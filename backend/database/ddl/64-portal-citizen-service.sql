-- Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029

-- Regenerable-only DDL for BP-PORTAL-CITIZEN-SERVICE-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.manifestation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  state varchar(40) not null,
  kind varchar(20) not null,
  confidential boolean not null,
  anonymous boolean not null,
  subject_id uuid,
  text text not null,
  protocol varchar(40) not null,
  received_at timestamptz not null,
  agency_due_on date not null,
  info_due_on date,
  decision_text text,
  decided_at timestamptz,
  acknowledged_at timestamptz,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_manifestation primary key (id),
  constraint ck_portal_manifestation_state check (state in ('MANIFESTACAO_REGISTRADA','COMPROVANTE_EMITIDO','EM_ANALISE','INFORMACAO_SOLICITADA_AO_AGENTE','DECISAO_FINAL_ELABORADA','CIENCIA_AO_USUARIO','ENCERRADA','AVALIACAO_OFERECIDA','AVALIADA')),
  constraint ck_portal_manifestation_kind check (kind in ('reclamacao','denuncia','sugestao','elogio','solicitacao')),
  constraint ck_portal_manifestation_anonymous_subject check (not anonymous or subject_id is null),
  constraint fk_portal_manifestation_subject foreign key (subject_id) references portal.subject (id)
);
create unique index if not exists ux_portal_manifestation_protocol on portal.manifestation (tenant_id, protocol);
create index if not exists ix_portal_manifestation_subject_state on portal.manifestation (tenant_id, subject_id, state);
create index if not exists ix_portal_manifestation_state_due on portal.manifestation (tenant_id, state, agency_due_on);
create index if not exists ix_manifestation_tenant_id on portal.manifestation (tenant_id);
create index if not exists ix_manifestation_subject_id on portal.manifestation (subject_id);

create table if not exists portal.manifestation_extension (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  manifestation_id uuid not null,
  timer varchar(20) not null,
  justification text not null,
  extended_on date not null,
  new_due_on date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_manifestation_extension primary key (id),
  constraint ck_portal_manifestation_extension_timer check (timer in ('T-OUV-RESPOSTA','T-OUV-INFO')),
  constraint fk_portal_manifestation_extension_manifestation foreign key (manifestation_id) references portal.manifestation (id),
  constraint fk_portal_manifestation_extension_timer foreign key (timer) references inf.infraction_timer_ref (code)
);
create unique index if not exists ux_portal_manifestation_extension_timer on portal.manifestation_extension (tenant_id, manifestation_id, timer);
create index if not exists ix_manifestation_extension_tenant_id on portal.manifestation_extension (tenant_id);
create index if not exists ix_manifestation_extension_manifestation_id on portal.manifestation_extension (manifestation_id);

create table if not exists portal.service_catalog (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  service_key varchar(60) not null,
  route text not null,
  category varchar(60) not null,
  title text not null,
  summary text not null,
  requirements_json jsonb not null,
  delivery_channel text not null,
  legal_deadline text not null,
  cost text not null,
  accessibility_note text not null,
  responsible_party text not null,
  normative_reference text not null,
  availability varchar(30) not null,
  unavailable_reason text,
  alternative_channel_note text,
  minimum_assurance varchar(20) not null,
  version integer default 1 not null,
  effective_from date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_service_catalog primary key (id),
  constraint ck_portal_service_catalog_availability check (availability in ('available','partially_available','unavailable')),
  constraint ck_portal_service_catalog_unavailable_reason check (availability <> 'unavailable' or unavailable_reason is not null),
  constraint ck_portal_service_catalog_minimum_assurance check (minimum_assurance in ('none','simples','avancada','qualificada'))
);
create unique index if not exists ux_portal_service_catalog_service_key on portal.service_catalog (tenant_id, service_key);
create index if not exists ix_portal_service_catalog_availability on portal.service_catalog (tenant_id, availability, category);
create index if not exists ix_service_catalog_tenant_id on portal.service_catalog (tenant_id);

select auth.create_rls_policy('portal', 'manifestation');

select auth.create_rls_policy('portal', 'manifestation_extension');

select auth.create_rls_policy('portal', 'service_catalog');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
