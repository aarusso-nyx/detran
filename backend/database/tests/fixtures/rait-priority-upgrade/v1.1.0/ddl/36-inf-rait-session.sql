-- Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01

-- Regenerable-only DDL for BP-INF-RAIT-SESSION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_session (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  judging_body varchar(10) not null,
  state varchar(30) default 'FORMANDO_PAUTA' not null,
  scheduled_for timestamptz,
  agenda_closed_at timestamptz,
  convened_at timestamptz,
  opened_at timestamptz,
  closed_at timestamptz,
  quorum_required integer not null,
  quorum_observed integer,
  chair_member_id uuid,
  adjourned_reason varchar(60),
  extraordinary boolean default false not null,
  short_notice_ack_by uuid,
  modality varchar(20) default 'presencial' not null,
  short_notice_ack boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_session primary key (id),
  constraint ck_inf_rait_session_body check (judging_body in ('jari','cetran')),
  constraint ck_inf_rait_session_state check (state in ('FORMANDO_PAUTA','PAUTA_FECHADA','CONVOCACAO_ENVIADA','SESSAO_ABERTA','SESSAO_ADIADA','RELATORIA_LIDA','SUSTENTACAO_ORAL','VOTACAO','DESEMPATE_PRESIDENTE','DECISAO_PROCLAMADA','ATA_LAVRADA','ATA_ASSINADA')),
  constraint ck_inf_rait_session_quorum_positive check (quorum_required > 0),
  constraint ck_inf_rait_session_open_needs_quorum check (opened_at is null or (quorum_observed is not null and quorum_observed >= quorum_required)),
  constraint ck_inf_rait_session_adjourned_reason check (state <> 'SESSAO_ADIADA' or adjourned_reason is not null),
  constraint ck_inf_rait_session_modality check (modality in ('presencial','virtual','hibrida')),
  constraint ck_inf_rait_session_short_notice_ack check (short_notice_ack_by is null or short_notice_ack)
);
create index if not exists ix_inf_rait_session_body_state on inf.rait_session (tenant_id, judging_body, state);
create index if not exists ix_rait_session_tenant_id on inf.rait_session (tenant_id);
create index if not exists ix_rait_session_chair_member_id on inf.rait_session (chair_member_id);

create table if not exists inf.rait_agenda_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  case_id uuid not null,
  position integer not null,
  priority boolean default false not null,
  rapporteur_member_id uuid not null,
  opinion_summary text,
  opinion_analysis text,
  opinion_vote varchar(20),
  opinion_registered_at timestamptz,
  read_at timestamptz,
  proclaimed_at timestamptz,
  outcome varchar(20),
  withdrawn boolean default false not null,
  withdrawn_reason varchar(40),
  view_requested_by uuid,
  view_due_on date,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_agenda_item primary key (id),
  constraint ck_inf_rait_agenda_item_opinion_vote check (opinion_vote is null or opinion_vote in ('provimento','nao_provimento','nao_conhecimento')),
  constraint ck_inf_rait_agenda_item_outcome check (outcome is null or outcome in ('provido','negado','nao_conhecido')),
  constraint ck_inf_rait_agenda_item_opinion_complete check (opinion_registered_at is null or (opinion_summary is not null and opinion_analysis is not null and opinion_vote is not null)),
  constraint ck_inf_rait_agenda_item_withdrawn_reason check (withdrawn = false or withdrawn_reason is not null),
  constraint ck_inf_rait_agenda_item_view_complete check ((view_requested_by is null and view_due_on is null) or (view_requested_by is not null and view_due_on is not null)),
  constraint fk_inf_rait_agenda_item_session foreign key (session_id) references inf.rait_session (id),
  constraint fk_inf_rait_agenda_item_case foreign key (case_id) references inf.rait_case (id),
  constraint fk_inf_rait_agenda_item_rapporteur foreign key (rapporteur_member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_agenda_item_case on inf.rait_agenda_item (tenant_id, session_id, case_id);
create unique index if not exists ux_inf_rait_agenda_item_position on inf.rait_agenda_item (tenant_id, session_id, position);
create index if not exists ix_rait_agenda_item_tenant_id on inf.rait_agenda_item (tenant_id);
create index if not exists ix_rait_agenda_item_session_id on inf.rait_agenda_item (session_id);
create index if not exists ix_rait_agenda_item_case_id on inf.rait_agenda_item (case_id);
create index if not exists ix_rait_agenda_item_rapporteur_member_id on inf.rait_agenda_item (rapporteur_member_id);

create table if not exists inf.rait_attendance (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  member_id uuid not null,
  present boolean default false not null,
  is_chair boolean default false not null,
  is_chair_substitute boolean default false not null,
  arrived_at timestamptz,
  left_at timestamptz,
  absence_justified boolean,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_attendance primary key (id),
  constraint fk_inf_rait_attendance_session foreign key (session_id) references inf.rait_session (id),
  constraint fk_inf_rait_attendance_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_attendance on inf.rait_attendance (tenant_id, session_id, member_id);
create index if not exists ix_rait_attendance_tenant_id on inf.rait_attendance (tenant_id);
create index if not exists ix_rait_attendance_session_id on inf.rait_attendance (session_id);
create index if not exists ix_rait_attendance_member_id on inf.rait_attendance (member_id);

create table if not exists inf.rait_vote (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  agenda_item_id uuid not null,
  member_id uuid not null,
  vote varchar(20) not null,
  casting_vote boolean default false not null,
  cast_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_vote primary key (id),
  constraint ck_inf_rait_vote_value check (vote in ('provimento','nao_provimento','nao_conhecimento','abstencao')),
  constraint fk_inf_rait_vote_item foreign key (agenda_item_id) references inf.rait_agenda_item (id),
  constraint fk_inf_rait_vote_member foreign key (member_id) references inf.rait_pool_member (id)
);
create unique index if not exists ux_inf_rait_vote_member on inf.rait_vote (tenant_id, agenda_item_id, member_id);
create index if not exists ix_rait_vote_tenant_id on inf.rait_vote (tenant_id);
create index if not exists ix_rait_vote_agenda_item_id on inf.rait_vote (agenda_item_id);
create index if not exists ix_rait_vote_member_id on inf.rait_vote (member_id);

create table if not exists inf.rait_oral_argument (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  agenda_item_id uuid not null,
  requested_by_party_id uuid,
  requested_at timestamptz default now() not null,
  granted boolean,
  denial_basis varchar(120),
  held_at timestamptz,
  duration_minutes integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_oral_argument primary key (id),
  constraint fk_inf_rait_oral_argument_item foreign key (agenda_item_id) references inf.rait_agenda_item (id)
);
create unique index if not exists ux_inf_rait_oral_argument_item on inf.rait_oral_argument (tenant_id, agenda_item_id);
create index if not exists ix_rait_oral_argument_tenant_id on inf.rait_oral_argument (tenant_id);
create index if not exists ix_rait_oral_argument_agenda_item_id on inf.rait_oral_argument (agenda_item_id);
create index if not exists ix_rait_oral_argument_requested_by_party_id on inf.rait_oral_argument (requested_by_party_id);

create table if not exists inf.rait_minutes (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  session_id uuid not null,
  content jsonb not null,
  generated_at timestamptz default now() not null,
  signed_at timestamptz,
  signed_by uuid,
  signature_kind varchar(20),
  signature_ref text,
  document_hash varchar(128),
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_minutes primary key (id),
  constraint ck_inf_rait_minutes_signature_kind check (signature_kind is null or signature_kind = 'PAdES-TSA'),
  constraint ck_inf_rait_minutes_signed_complete check (signed_at is null or (signed_by is not null and signature_kind is not null and signature_ref is not null)),
  constraint ck_inf_rait_minutes_published_needs_signature check (published_at is null or signed_at is not null),
  constraint fk_inf_rait_minutes_session foreign key (session_id) references inf.rait_session (id)
);
create unique index if not exists ux_inf_rait_minutes_session on inf.rait_minutes (tenant_id, session_id);
create index if not exists ix_rait_minutes_tenant_id on inf.rait_minutes (tenant_id);
create index if not exists ix_rait_minutes_session_id on inf.rait_minutes (session_id);

select auth.create_rls_policy('inf', 'rait_session');

select auth.create_rls_policy('inf', 'rait_agenda_item');

select auth.create_rls_policy('inf', 'rait_attendance');

select auth.create_rls_policy('inf', 'rait_vote');

select auth.create_rls_policy('inf', 'rait_oral_argument');

select auth.create_rls_policy('inf', 'rait_minutes');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
