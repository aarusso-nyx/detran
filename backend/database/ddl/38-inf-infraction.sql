-- Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd

-- Regenerable-only DDL for BP-INF-INFRACTION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.infraction (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  ait_id uuid not null,
  state varchar(40) default 'AIT_LAVRADO' not null,
  substate varchar(40),
  subject_kind varchar(40) default 'proprietario' not null,
  suspensive_effect boolean default false not null,
  paid boolean default false not null,
  payment_tier varchar(40) default 'nenhum' not null,
  points_registered boolean default false not null,
  closure_motive varchar(40),
  risk_flag varchar(30) default 'SEM_RISCO' not null,
  committed_on date not null,
  flagrant boolean not null,
  known_on date,
  state_changed_at timestamptz not null,
  last_transition_id smallint,
  version integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_infraction primary key (id),
  constraint ck_inf_infraction_state check (state in ('AIT_LAVRADO','NOTIFICADO_AUTUACAO','DEFESA_EM_JULGAMENTO','PENALIDADE_A_APLICAR','NOTIFICADO_PENALIDADE','RECURSO_1A_INSTANCIA','AGUARDANDO_RECURSO_2A','RECURSO_2A_INSTANCIA','INSTANCIA_ENCERRADA','ARQUIVADO','CANCELADO_POS_INTEGRACAO','AIT_CANCELADO','EXTINTO_DECADENCIA','EXTINTO_PRESCRICAO','CANCELADO_DEFINITIVO')),
  constraint ck_inf_infraction_substate check (substate is null or substate in ('PRAZO_DEFESA_ABERTO','INDICACAO_EM_PROCESSAMENTO','EM_ADMISSIBILIDADE_1A','EM_REMESSA_JARI','EM_JULGAMENTO_JARI','PROVIDO_1A','NEGADO_1A','EM_ADMISSIBILIDADE_2A','EM_JULGAMENTO_CETRAN','PENDENTE_PAGAMENTO','QUITADA','EM_COBRANCA')),
  constraint ck_inf_infraction_subject_kind check (subject_kind in ('proprietario','principal_condutor','condutor_identificado','possuidor_equiparado','embarcador','transportador')),
  constraint ck_inf_infraction_payment_tier check (payment_tier in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')),
  constraint ck_inf_infraction_closure_motive check (closure_motive is null or closure_motive in ('nao_interposicao_1a','nao_interposicao_2a','julgamento_2a','reconhecimento','desistencia','nao_conhecimento_intempestivo','na_nao_expedida','insubsistente')),
  constraint ck_inf_infraction_risk_flag check (risk_flag in ('SEM_RISCO','ALERTA_N1','ALERTA_N2','ALERTA_N3','CRITICO','PRESCRITO_OPERACIONAL')),
  constraint ck_inf_infraction_suspensive_effect_instance check (suspensive_effect = false or state in ('RECURSO_1A_INSTANCIA','RECURSO_2A_INSTANCIA')),
  constraint ck_inf_infraction_points_only_closed check (points_registered = false or state = 'INSTANCIA_ENCERRADA'),
  constraint ck_inf_infraction_closure_motive_state check (closure_motive is null or state in ('INSTANCIA_ENCERRADA','ARQUIVADO')),
  constraint fk_inf_infraction_ait foreign key (ait_id) references inf.ait_ait (id),
  constraint fk_inf_infraction_state foreign key (state) references inf.infraction_state_ref (code),
  constraint fk_inf_infraction_substate foreign key (substate) references inf.infraction_substate_ref (code),
  constraint fk_inf_infraction_subject_kind foreign key (subject_kind) references inf.infraction_subject_kind_ref (code),
  constraint fk_inf_infraction_payment_tier foreign key (payment_tier) references inf.infraction_payment_tier_ref (code),
  constraint fk_inf_infraction_closure_motive foreign key (closure_motive) references inf.infraction_closure_motive_ref (code),
  constraint fk_inf_infraction_last_transition foreign key (last_transition_id) references inf.infraction_transition_ref (id)
);
create unique index if not exists ux_inf_infraction_ait on inf.infraction (tenant_id, ait_id);
create index if not exists ix_inf_infraction_state on inf.infraction (tenant_id, state, substate);
create index if not exists ix_inf_infraction_risk_flag on inf.infraction (tenant_id, risk_flag);
create index if not exists ix_infraction_tenant_id on inf.infraction (tenant_id);
create index if not exists ix_infraction_ait_id on inf.infraction (ait_id);
create index if not exists ix_infraction_last_transition_id on inf.infraction (last_transition_id);

create table if not exists inf.infraction_timer (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  timer_code varchar(20) not null,
  instance varchar(20),
  start_basis text not null,
  started_on date not null,
  raw_due_on date not null,
  due_on date not null,
  ceiling_on date,
  business_days boolean default false not null,
  status varchar(20) not null,
  satisfied_at timestamptz,
  expired_at timestamptz,
  cancel_reason text,
  suspended_by_act_id uuid,
  suspended_days integer default 0 not null,
  extension_count integer default 0 not null,
  legal_basis text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_infraction_timer primary key (id),
  constraint ck_inf_infraction_timer_code check (timer_code in ('T-NA','T-SNE-CIENCIA','T-DEF','T-IND','T-NA-IND','T-DEC','T-NP-VENC','T-REM10','T-JUL-24M','T-DIL','T-R2','T-PAR-3A','T-PRESC-5A','T-VOTO','T-CONV','T-ASS','T-CLAIM','SLA-30')),
  constraint ck_inf_infraction_timer_instance check (instance is null or instance in ('jari','cetran')),
  constraint ck_inf_infraction_timer_status check (status in ('armado','satisfeito','cancelado','vencido')),
  constraint ck_inf_infraction_timer_rounding_forward check (due_on >= raw_due_on),
  constraint ck_inf_infraction_timer_due_not_before_start check (due_on >= started_on),
  constraint ck_inf_infraction_timer_single_extension check (extension_count <= 1),
  constraint fk_inf_infraction_timer_infraction foreign key (infraction_id) references inf.infraction (id),
  constraint fk_inf_infraction_timer_code foreign key (timer_code) references inf.infraction_timer_ref (code)
);
create unique index if not exists ux_inf_infraction_timer_arm on inf.infraction_timer (tenant_id, infraction_id, timer_code, started_on);
create index if not exists ix_inf_infraction_timer_due on inf.infraction_timer (tenant_id, due_on) where status = 'armado';
create index if not exists ix_infraction_timer_tenant_id on inf.infraction_timer (tenant_id);
create index if not exists ix_infraction_timer_infraction_id on inf.infraction_timer (infraction_id);
create index if not exists ix_infraction_timer_suspended_by_act_id on inf.infraction_timer (suspended_by_act_id);

create table if not exists inf.infraction_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  transition_id smallint,
  rule_ref smallint,
  from_state varchar(40),
  to_state varchar(40),
  from_substate varchar(40),
  to_substate varchar(40),
  trigger_kind varchar(10) not null,
  trigger_code varchar(120) not null,
  event_code varchar(60) not null,
  occurred_at timestamptz not null,
  actor_id uuid,
  actor_kind varchar(10) not null,
  payload jsonb not null,
  outbox_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_infraction_event primary key (id),
  constraint ck_inf_infraction_event_trigger_kind check (trigger_kind in ('evento','timer','ato','sistema')),
  constraint ck_inf_infraction_event_actor_kind check (actor_kind in ('user','system')),
  constraint ck_inf_infraction_event_code check (event_code in ('INFRACAO_ESTADO_ALTERADO','PENALIDADE_DEFINITIVA','RESTITUICAO_DEVIDA','TIMER_VENCIDO','RISCO_PRESCRICAO_ALTERADO')),
  constraint fk_inf_infraction_event_infraction foreign key (infraction_id) references inf.infraction (id),
  constraint fk_inf_infraction_event_transition foreign key (transition_id) references inf.infraction_transition_ref (id),
  constraint fk_inf_infraction_event_from_state foreign key (from_state) references inf.infraction_state_ref (code),
  constraint fk_inf_infraction_event_to_state foreign key (to_state) references inf.infraction_state_ref (code),
  constraint fk_inf_infraction_event_code foreign key (event_code) references inf.infraction_event_ref (code)
);
create index if not exists ix_inf_infraction_event_infraction on inf.infraction_event (tenant_id, infraction_id, occurred_at);
create index if not exists ix_infraction_event_tenant_id on inf.infraction_event (tenant_id);
create index if not exists ix_infraction_event_infraction_id on inf.infraction_event (infraction_id);
create index if not exists ix_infraction_event_transition_id on inf.infraction_event (transition_id);
create index if not exists ix_infraction_event_actor_id on inf.infraction_event (actor_id);
create index if not exists ix_infraction_event_outbox_id on inf.infraction_event (outbox_id);

select auth.create_rls_policy('inf', 'infraction');

select auth.create_rls_policy('inf', 'infraction_timer');

select auth.create_rls_policy('inf', 'infraction_event');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
