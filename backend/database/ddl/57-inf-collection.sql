-- Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f

-- Regenerable-only DDL for BP-INF-COLLECTION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.collection_document (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  tier varchar(40) not null,
  amount numeric(12,2) not null,
  barcode varchar(60),
  pix_reference varchar(140),
  valid_until date not null,
  issued_for_state varchar(40) not null,
  status varchar(20) default 'emitido' not null,
  issued_at timestamptz default now() not null,
  issued_by uuid,
  document_id uuid,
  supersedes_document_id uuid,
  invalidated_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_collection_document primary key (id),
  constraint ck_inf_collection_document_tier check (tier in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')),
  constraint ck_inf_collection_document_issued_for_state check (issued_for_state in ('AIT_LAVRADO','NOTIFICADO_AUTUACAO','DEFESA_EM_JULGAMENTO','PENALIDADE_A_APLICAR','NOTIFICADO_PENALIDADE','RECURSO_1A_INSTANCIA','AGUARDANDO_RECURSO_2A','RECURSO_2A_INSTANCIA','INSTANCIA_ENCERRADA','ARQUIVADO','CANCELADO_POS_INTEGRACAO','AIT_CANCELADO','EXTINTO_DECADENCIA','EXTINTO_PRESCRICAO','CANCELADO_DEFINITIVO')),
  constraint ck_inf_collection_document_status check (status in ('emitido','pago','vencido','invalidado')),
  constraint ck_inf_collection_document_amount_positive check (amount > 0),
  constraint ck_inf_collection_document_reference_required check (barcode is not null or pix_reference is not null),
  constraint ck_inf_collection_document_invalidated_complete check (status <> 'invalidado' or invalidated_at is not null),
  constraint fk_inf_collection_document_infraction foreign key (infraction_id) references inf.infraction (id),
  constraint fk_inf_collection_document_tier foreign key (tier) references inf.infraction_payment_tier_ref (code),
  constraint fk_inf_collection_document_state foreign key (issued_for_state) references inf.infraction_state_ref (code),
  constraint fk_inf_collection_document_supersedes foreign key (supersedes_document_id) references inf.collection_document (id)
);
create unique index if not exists ux_inf_collection_document_active on inf.collection_document (tenant_id, infraction_id) where status = 'emitido';
create unique index if not exists ux_inf_collection_document_barcode on inf.collection_document (tenant_id, barcode) where barcode is not null;
create index if not exists ix_inf_collection_document_due on inf.collection_document (tenant_id, valid_until) where status = 'emitido';
create index if not exists ix_collection_document_tenant_id on inf.collection_document (tenant_id);
create index if not exists ix_collection_document_infraction_id on inf.collection_document (infraction_id);
create index if not exists ix_collection_document_document_id on inf.collection_document (document_id);
create index if not exists ix_collection_document_supersedes_document_id on inf.collection_document (supersedes_document_id);

create table if not exists inf.payment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  document_id uuid,
  bank_reference varchar(80) not null,
  paid_on date not null,
  amount numeric(12,2) not null,
  tier_applied varchar(40),
  received_at timestamptz default now() not null,
  matched_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_payment primary key (id),
  constraint ck_inf_payment_tier_applied check (tier_applied is null or tier_applied in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')),
  constraint ck_inf_payment_amount_positive check (amount > 0),
  constraint ck_inf_payment_match_needs_document check (matched_at is null or document_id is not null),
  constraint ck_inf_payment_tier_needs_match check (tier_applied is null or matched_at is not null),
  constraint ck_inf_payment_reversal_needs_match check (reversed_at is null or matched_at is not null),
  constraint fk_inf_payment_document foreign key (document_id) references inf.collection_document (id),
  constraint fk_inf_payment_tier foreign key (tier_applied) references inf.infraction_payment_tier_ref (code)
);
create unique index if not exists ux_inf_payment_bank_reference on inf.payment (tenant_id, bank_reference);
create index if not exists ix_inf_payment_unmatched on inf.payment (tenant_id, received_at) where matched_at is null;
create index if not exists ix_payment_tenant_id on inf.payment (tenant_id);
create index if not exists ix_payment_document_id on inf.payment (document_id);

create table if not exists inf.refund_order (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  payment_id uuid not null,
  reason varchar(30) not null,
  base_amount numeric(12,2) not null,
  index_key varchar(40) not null,
  updated_amount numeric(12,2),
  bank_data_status varchar(20) default 'pendente' not null,
  status varchar(20) default 'aberta' not null,
  opened_at timestamptz default now() not null,
  ordered_at timestamptz,
  paid_at timestamptz,
  document_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_refund_order primary key (id),
  constraint ck_inf_refund_order_reason check (reason in ('decisao_favoravel','extincao','pagamento_duplicado','pagamento_a_maior')),
  constraint ck_inf_refund_order_bank_data_status check (bank_data_status in ('pendente','informado')),
  constraint ck_inf_refund_order_status check (status in ('aberta','ordenada','paga')),
  constraint ck_inf_refund_order_base_amount_positive check (base_amount > 0),
  constraint ck_inf_refund_order_order_needs_bank_data check (status = 'aberta' or bank_data_status = 'informado'),
  constraint ck_inf_refund_order_ordered_complete check (status = 'aberta' or ordered_at is not null),
  constraint ck_inf_refund_order_paid_complete check (status <> 'paga' or paid_at is not null),
  constraint fk_inf_refund_order_infraction foreign key (infraction_id) references inf.infraction (id),
  constraint fk_inf_refund_order_payment foreign key (payment_id) references inf.payment (id)
);
create unique index if not exists ux_inf_refund_order_payment on inf.refund_order (tenant_id, payment_id);
create index if not exists ix_inf_refund_order_status on inf.refund_order (tenant_id, status, opened_at);
create index if not exists ix_refund_order_tenant_id on inf.refund_order (tenant_id);
create index if not exists ix_refund_order_infraction_id on inf.refund_order (infraction_id);
create index if not exists ix_refund_order_payment_id on inf.refund_order (payment_id);
create index if not exists ix_refund_order_document_id on inf.refund_order (document_id);

create table if not exists inf.debt_handoff (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  fazenda_reference varchar(80),
  dossier_document_id uuid,
  status varchar(20) default 'preparado' not null,
  prepared_at timestamptz default now() not null,
  sent_at timestamptz,
  acknowledged_at timestamptz,
  cancel_reason varchar(30),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_debt_handoff primary key (id),
  constraint ck_inf_debt_handoff_status check (status in ('preparado','enviado','reconhecido','cancelado')),
  constraint ck_inf_debt_handoff_cancel_reason check (cancel_reason is null or cancel_reason in ('pagamento')),
  constraint ck_inf_debt_handoff_sent_complete check (status in ('preparado','cancelado') or sent_at is not null),
  constraint ck_inf_debt_handoff_ack_complete check (status <> 'reconhecido' or (acknowledged_at is not null and fazenda_reference is not null)),
  constraint ck_inf_debt_handoff_ack_after_sent check (acknowledged_at is null or sent_at is not null),
  constraint ck_inf_debt_handoff_cancel_complete check (status <> 'cancelado' or cancel_reason is not null),
  constraint fk_inf_debt_handoff_infraction foreign key (infraction_id) references inf.infraction (id)
);
create unique index if not exists ux_inf_debt_handoff_active on inf.debt_handoff (tenant_id, infraction_id) where status <> 'cancelado';
create index if not exists ix_inf_debt_handoff_status on inf.debt_handoff (tenant_id, status, prepared_at);
create index if not exists ix_debt_handoff_tenant_id on inf.debt_handoff (tenant_id);
create index if not exists ix_debt_handoff_infraction_id on inf.debt_handoff (infraction_id);
create index if not exists ix_debt_handoff_dossier_document_id on inf.debt_handoff (dossier_document_id);

select auth.create_rls_policy('inf', 'collection_document');

select auth.create_rls_policy('inf', 'payment');

select auth.create_rls_policy('inf', 'refund_order');

select auth.create_rls_policy('inf', 'debt_handoff');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
