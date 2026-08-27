-- Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107

-- Regenerable-only DDL for BP-INF-RAIT-CASE-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_case (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  origin_case_id uuid,
  protocol_number varchar(40) not null,
  instance varchar(20) not null,
  circuit integer not null,
  state varchar(40) default 'PROTOCOLADO' not null,
  intake_channel varchar(30) not null,
  protocolled_at timestamptz not null,
  admitted_at timestamptz,
  judge_body_received_at timestamptz,
  cetran_received_at timestamptz,
  remitted_at timestamptz,
  decided_at timestamptz,
  communicated_at timestamptz,
  closed_at timestamptz,
  suspensive_effect boolean default false not null,
  archived boolean default false not null,
  non_admission_reason varchar(40),
  withdrawal_document_id uuid,
  last_movement_at timestamptz default now() not null,
  pending_completion boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_case primary key (id),
  constraint ck_inf_rait_case_state check (state in ('PROTOCOLADO','TRIAGEM_ADMISSIBILIDADE','NAO_CONHECIDO','ADMITIDO','AGUARDANDO_REMESSA_JARI','DISTRIBUIDO','EM_INSTRUCAO','DILIGENCIA','PRONTO_P_DECISAO','DECIDIDO_AUTORIDADE','PAUTADO','JULGADO_SESSAO','COMUNICADO','TRANSITADO','REMETIDO_2A_INSTANCIA','ENCERRADO_DESISTENCIA')),
  constraint ck_inf_rait_case_instance check (instance in ('defesa_previa','jari','cetran')),
  constraint ck_inf_rait_case_circuit check (circuit in (1, 2)),
  constraint ck_inf_rait_case_circuit_matches_instance check ((instance = 'defesa_previa' and circuit = 1) or (instance in ('jari','cetran') and circuit = 2)),
  constraint ck_inf_rait_case_archived_only_untimely check (archived = false or non_admission_reason = 'intempestivo'),
  constraint ck_inf_rait_case_non_admission_reason check (non_admission_reason is null or non_admission_reason in ('intempestivo','ilegitimo','sem_assinatura','pedido_incompativel')),
  constraint ck_inf_rait_case_remessa_state_only_jari check (state <> 'AGUARDANDO_REMESSA_JARI' or instance = 'jari'),
  constraint ck_inf_rait_case_cetran_is_final check (instance <> 'cetran' or state <> 'REMETIDO_2A_INSTANCIA'),
  constraint ck_inf_rait_case_cetran_receipt_scope check (cetran_received_at is null or instance = 'cetran'),
  constraint fk_inf_rait_case_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_rait_case_origin foreign key (origin_case_id) references inf.rait_case (id)
);
create unique index if not exists ux_inf_rait_case_protocol on inf.rait_case (tenant_id, protocol_number);
create index if not exists ix_inf_rait_case_state on inf.rait_case (tenant_id, instance, state);
create index if not exists ix_inf_rait_case_movement on inf.rait_case (tenant_id, last_movement_at);
create index if not exists ix_inf_rait_case_cetran_received on inf.rait_case (tenant_id, cetran_received_at);
create index if not exists ix_rait_case_tenant_id on inf.rait_case (tenant_id);
create index if not exists ix_rait_case_ait_id on inf.rait_case (ait_id);
create index if not exists ix_rait_case_origin_case_id on inf.rait_case (origin_case_id);
create index if not exists ix_rait_case_withdrawal_document_id on inf.rait_case (withdrawal_document_id);

create table if not exists inf.rait_party (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  role varchar(30) not null,
  legitimacy_basis varchar(40),
  person_name varchar(200) not null,
  document_number varchar(30) not null,
  contact_email varchar(200),
  representation_kind varchar(60),
  representation_verified boolean default false not null,
  representation_document_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_party primary key (id),
  constraint ck_inf_rait_party_role check (role in ('requerente','procurador','autoridade')),
  constraint ck_inf_rait_party_legitimacy check (legitimacy_basis is null or legitimacy_basis in ('proprietario','condutor','embarcador','transportador','possuidor_equiparado','principal_condutor')),
  constraint ck_inf_rait_party_representation_kind check (representation_kind is null or representation_kind in ('procuracao_publica','particular_firma_autenticidade')),
  constraint fk_inf_rait_party_case foreign key (case_id) references inf.rait_case (id)
);
create index if not exists ix_inf_rait_party_case on inf.rait_party (tenant_id, case_id, role);
create index if not exists ix_rait_party_tenant_id on inf.rait_party (tenant_id);
create index if not exists ix_rait_party_case_id on inf.rait_party (case_id);
create index if not exists ix_rait_party_representation_document_id on inf.rait_party (representation_document_id);

create table if not exists inf.rait_document (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  kind varchar(60) not null,
  origin varchar(20) not null,
  storage_key text not null,
  filename varchar(255) not null,
  content_hash varchar(128) not null,
  digitised_from_paper boolean default false not null,
  attached_at timestamptz default now() not null,
  attached_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_document primary key (id),
  constraint ck_inf_rait_document_origin check (origin in ('requerente','oficio')),
  constraint fk_inf_rait_document_case foreign key (case_id) references inf.rait_case (id)
);
create index if not exists ix_inf_rait_document_case on inf.rait_document (tenant_id, case_id, kind);
create index if not exists ix_rait_document_tenant_id on inf.rait_document (tenant_id);
create index if not exists ix_rait_document_case_id on inf.rait_document (case_id);

create table if not exists inf.rait_admissibility (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  criterion varchar(30) not null,
  verdict boolean not null,
  reason text,
  evaluated_at timestamptz default now() not null,
  evaluated_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_admissibility primary key (id),
  constraint ck_inf_rait_admissibility_criterion check (criterion in ('tempestividade','legitimidade','assinatura','pedido_compativel')),
  constraint fk_inf_rait_admissibility_case foreign key (case_id) references inf.rait_case (id)
);
create unique index if not exists ux_inf_rait_admissibility_criterion on inf.rait_admissibility (tenant_id, case_id, criterion);
create index if not exists ix_rait_admissibility_tenant_id on inf.rait_admissibility (tenant_id);
create index if not exists ix_rait_admissibility_case_id on inf.rait_admissibility (case_id);

create table if not exists inf.rait_deadline (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  timer_code varchar(20) not null,
  start_basis varchar(60) not null,
  started_on date not null,
  raw_due_on date not null,
  due_on date not null,
  business_days boolean default false not null,
  extension_count integer default 0 not null,
  satisfied_at timestamptz,
  suspended_by_act_id uuid,
  legal_basis varchar(160) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_deadline primary key (id),
  constraint ck_inf_rait_deadline_timer check (timer_code in ('T-REM10','T-DIL','T-R2','T-JUL-24M','T-PAR-3A','T-DEC','T-VOTO','T-CONV')),
  constraint ck_inf_rait_deadline_due_not_before_start check (due_on >= started_on),
  constraint ck_inf_rait_deadline_rounding_forward check (due_on >= raw_due_on),
  constraint fk_inf_rait_deadline_case foreign key (case_id) references inf.rait_case (id)
);
create unique index if not exists ux_inf_rait_deadline_case_timer on inf.rait_deadline (tenant_id, case_id, timer_code);
create index if not exists ix_inf_rait_deadline_due on inf.rait_deadline (tenant_id, due_on) where satisfied_at is null;
create index if not exists ix_rait_deadline_tenant_id on inf.rait_deadline (tenant_id);
create index if not exists ix_rait_deadline_case_id on inf.rait_deadline (case_id);
create index if not exists ix_rait_deadline_suspended_by_act_id on inf.rait_deadline (suspended_by_act_id);

create table if not exists inf.rait_inquiry (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  addressee varchar(20) not null,
  subject text not null,
  requested_at timestamptz default now() not null,
  requested_by uuid not null,
  due_on date not null,
  extension_count integer default 0 not null,
  answered_at timestamptz,
  outcome varchar(20),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_inquiry primary key (id),
  constraint ck_inf_rait_inquiry_addressee check (addressee in ('requerente','orgao_autuador')),
  constraint ck_inf_rait_inquiry_outcome check (outcome is null or outcome in ('respondida','expirada')),
  constraint ck_inf_rait_inquiry_single_extension check (extension_count <= 1),
  constraint fk_inf_rait_inquiry_case foreign key (case_id) references inf.rait_case (id)
);
create index if not exists ix_inf_rait_inquiry_open on inf.rait_inquiry (tenant_id, due_on) where answered_at is null;
create index if not exists ix_rait_inquiry_tenant_id on inf.rait_inquiry (tenant_id);
create index if not exists ix_rait_inquiry_case_id on inf.rait_inquiry (case_id);

create table if not exists inf.rait_decision (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  circuit integer not null,
  decision_kind varchar(30) not null,
  grounds text not null,
  decided_by uuid not null,
  decided_at timestamptz default now() not null,
  session_id uuid,
  signature_kind varchar(20),
  signature_ref text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_decision primary key (id),
  constraint ck_inf_rait_decision_kind check (decision_kind in ('acolhida','indeferida','provido','negado','nao_conhecido')),
  constraint ck_inf_rait_decision_grounds_present check (length(btrim(grounds)) > 0),
  constraint ck_inf_rait_decision_signature_kind check (signature_kind is null or signature_kind = 'PAdES-TSA'),
  constraint fk_inf_rait_decision_case foreign key (case_id) references inf.rait_case (id)
);
create unique index if not exists ux_inf_rait_decision_case on inf.rait_decision (tenant_id, case_id);
create index if not exists ix_rait_decision_tenant_id on inf.rait_decision (tenant_id);
create index if not exists ix_rait_decision_case_id on inf.rait_decision (case_id);
create index if not exists ix_rait_decision_session_id on inf.rait_decision (session_id);

create table if not exists inf.rait_communication (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  decision_id uuid,
  channel varchar(30) not null,
  sent_at timestamptz default now() not null,
  effective_on date,
  next_deadline_on date,
  authority_appeal_notice boolean default false not null,
  enclosed_document_ids jsonb,
  content_ref text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_communication primary key (id),
  constraint ck_inf_rait_communication_channel check (channel in ('sne','postal','pessoal','edital','portal','balcao')),
  constraint fk_inf_rait_communication_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_communication_decision foreign key (decision_id) references inf.rait_decision (id)
);
create index if not exists ix_inf_rait_communication_case on inf.rait_communication (tenant_id, case_id);
create index if not exists ix_rait_communication_tenant_id on inf.rait_communication (tenant_id);
create index if not exists ix_rait_communication_case_id on inf.rait_communication (case_id);
create index if not exists ix_rait_communication_decision_id on inf.rait_communication (decision_id);

create table if not exists inf.rait_case_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  case_id uuid not null,
  event_type varchar(60) not null,
  from_state varchar(40),
  to_state varchar(40),
  occurred_at timestamptz default now() not null,
  actor_id uuid,
  payload jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_case_event primary key (id),
  constraint fk_inf_rait_case_event_case foreign key (case_id) references inf.rait_case (id)
);
create index if not exists ix_inf_rait_case_event_case on inf.rait_case_event (tenant_id, case_id, occurred_at);
create index if not exists ix_rait_case_event_tenant_id on inf.rait_case_event (tenant_id);
create index if not exists ix_rait_case_event_case_id on inf.rait_case_event (case_id);
create index if not exists ix_rait_case_event_actor_id on inf.rait_case_event (actor_id);

select auth.create_rls_policy('inf', 'rait_case');

select auth.create_rls_policy('inf', 'rait_party');

select auth.create_rls_policy('inf', 'rait_document');

select auth.create_rls_policy('inf', 'rait_admissibility');

select auth.create_rls_policy('inf', 'rait_deadline');

select auth.create_rls_policy('inf', 'rait_inquiry');

select auth.create_rls_policy('inf', 'rait_decision');

select auth.create_rls_policy('inf', 'rait_communication');

select auth.create_rls_policy('inf', 'rait_case_event');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
