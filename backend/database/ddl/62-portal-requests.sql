-- Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904

-- Regenerable-only DDL for BP-PORTAL-REQUESTS-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.request (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  state varchar(40) not null,
  service_key varchar(60) not null,
  subject_id uuid not null,
  target_kind varchar(20) not null,
  target_id uuid,
  channel varchar(20) default 'portal' not null,
  delegation_domain varchar(20),
  delegation_command varchar(80),
  delegation_external_id text,
  delegation_status varchar(20) not null,
  delegation_error text,
  minimum_assurance varchar(20) not null,
  version integer default 1 not null,
  withdrawn_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_request primary key (id),
  constraint ck_portal_request_state check (state in ('IDENTIFICADO','SERVICO_SELECIONADO','ELEGIBILIDADE_VERIFICADA','INELEGIVEL','PEDIDO_EM_COMPOSICAO','AGUARDANDO_NIVEL_ASSINATURA','AGUARDANDO_PAGAMENTO','PROTOCOLADO','EM_ANDAMENTO_NO_ORGAO','RESULTADO_DISPONIVEL','AVALIACAO_OFERECIDA','CONCLUIDO','DESISTIDO')),
  constraint ck_portal_request_target_kind check (target_kind in ('ait','case','vehicle','exam','crash','none')),
  constraint ck_portal_request_target_id_required check ((target_kind = 'none' and target_id is null) or (target_kind <> 'none' and target_id is not null)),
  constraint ck_portal_request_channel check (channel in ('portal')),
  constraint ck_portal_request_delegation_status check (delegation_status in ('pending','delegated','failed','not_applicable')),
  constraint ck_portal_request_minimum_assurance check (minimum_assurance in ('none','simples','avancada','qualificada')),
  constraint fk_portal_request_subject foreign key (subject_id) references portal.subject (id)
);
create index if not exists ix_portal_request_subject_state on portal.request (tenant_id, subject_id, state);
create index if not exists ix_portal_request_service_key on portal.request (tenant_id, service_key, state);
create index if not exists ix_portal_request_target on portal.request (tenant_id, target_kind, target_id);
create index if not exists ix_request_tenant_id on portal.request (tenant_id);
create index if not exists ix_request_subject_id on portal.request (subject_id);
create index if not exists ix_request_target_id on portal.request (target_id);
create index if not exists ix_request_delegation_external_id on portal.request (delegation_external_id);

create table if not exists portal.request_draft (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  request_id uuid not null,
  version integer not null,
  payload_json jsonb not null,
  saved_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_request_draft primary key (id),
  constraint ck_portal_request_draft_version_positive check (version > 0),
  constraint fk_portal_request_draft_request foreign key (request_id) references portal.request (id)
);
create unique index if not exists ux_portal_request_draft_request_version on portal.request_draft (tenant_id, request_id, version);
create index if not exists ix_request_draft_tenant_id on portal.request_draft (tenant_id);
create index if not exists ix_request_draft_request_id on portal.request_draft (request_id);

create table if not exists portal.request_attachment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  request_id uuid not null,
  filename text not null,
  mime_type varchar(120) not null,
  size_bytes bigint not null,
  sha256 varchar(64) not null,
  upload_state varchar(20) default 'intended' not null,
  storage_ref text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_request_attachment primary key (id),
  constraint ck_portal_request_attachment_sha256 check (sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_portal_request_attachment_size_bytes check (size_bytes >= 0),
  constraint ck_portal_request_attachment_upload_state check (upload_state in ('intended','completed','rejected')),
  constraint fk_portal_request_attachment_request foreign key (request_id) references portal.request (id)
);
create index if not exists ix_portal_request_attachment_request on portal.request_attachment (tenant_id, request_id, upload_state);
create index if not exists ix_request_attachment_tenant_id on portal.request_attachment (tenant_id);
create index if not exists ix_request_attachment_request_id on portal.request_attachment (request_id);

create table if not exists portal.protocol (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  request_id uuid not null,
  number varchar(40) not null,
  issued_at timestamptz not null,
  channel varchar(20) default 'portal' not null,
  receipt_hash varchar(64) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_protocol primary key (id),
  constraint ck_portal_protocol_channel check (channel in ('portal')),
  constraint ck_portal_protocol_receipt_hash check (receipt_hash ~ '^[0-9a-f]{64}$'),
  constraint fk_portal_protocol_request foreign key (request_id) references portal.request (id)
);
create unique index if not exists ux_portal_protocol_number on portal.protocol (tenant_id, number);
create unique index if not exists ux_portal_protocol_request on portal.protocol (tenant_id, request_id);
create index if not exists ix_protocol_tenant_id on portal.protocol (tenant_id);
create index if not exists ix_protocol_request_id on portal.protocol (request_id);

create table if not exists portal.consequence_ack (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  request_id uuid not null,
  kind varchar(20) not null,
  text_version varchar(40) not null,
  accepted_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_consequence_ack primary key (id),
  constraint ck_portal_consequence_ack_kind check (kind in ('desistencia','renuncia_40','indicacao','sne')),
  constraint fk_portal_consequence_ack_request foreign key (request_id) references portal.request (id)
);
create index if not exists ix_portal_consequence_ack_request on portal.consequence_ack (tenant_id, request_id, kind);
create index if not exists ix_consequence_ack_tenant_id on portal.consequence_ack (tenant_id);
create index if not exists ix_consequence_ack_request_id on portal.consequence_ack (request_id);

create table if not exists portal.evaluation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_kind varchar(20) not null,
  subject_id uuid not null,
  scores_json jsonb not null,
  comment text,
  submitted_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evaluation primary key (id),
  constraint ck_portal_evaluation_subject_kind check (subject_kind in ('request','manifestation'))
);
create unique index if not exists ux_portal_evaluation_subject on portal.evaluation (tenant_id, subject_kind, subject_id);
create index if not exists ix_evaluation_tenant_id on portal.evaluation (tenant_id);
create index if not exists ix_evaluation_subject_id on portal.evaluation (subject_id);

create table if not exists portal.idempotency_record (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  key text not null,
  subject_id uuid,
  route text not null,
  body_sha256 varchar(64) not null,
  response_json jsonb not null,
  status integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_idempotency_record primary key (id),
  constraint ck_portal_idempotency_record_body_sha256 check (body_sha256 ~ '^[0-9a-f]{64}$'),
  constraint ck_portal_idempotency_record_status check (status between 100 and 599),
  constraint fk_portal_idempotency_record_subject foreign key (subject_id) references portal.subject (id)
);
create unique index if not exists ux_portal_idempotency_record_key on portal.idempotency_record (tenant_id, key);
create index if not exists ix_idempotency_record_tenant_id on portal.idempotency_record (tenant_id);
create index if not exists ix_idempotency_record_subject_id on portal.idempotency_record (subject_id);

select auth.create_rls_policy('portal', 'request');

select auth.create_rls_policy('portal', 'request_draft');

select auth.create_rls_policy('portal', 'request_attachment');

select auth.create_rls_policy('portal', 'protocol');

select auth.create_rls_policy('portal', 'consequence_ack');

select auth.create_rls_policy('portal', 'evaluation');

select auth.create_rls_policy('portal', 'idempotency_record');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
