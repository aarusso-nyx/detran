-- Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6

-- Regenerable-only DDL for BP-INF-NOTIFICATION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.notice (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  infraction_id uuid not null,
  case_id uuid,
  kind varchar(20) not null,
  addressee_kind varchar(40) not null,
  addressee_ref uuid,
  channel varchar(20) not null,
  issued_at timestamptz not null,
  dispatched_at timestamptz,
  dispatched_on date,
  printed_deadline_on date,
  document_id uuid,
  status varchar(20) not null,
  supersedes_notice_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_notice primary key (id),
  constraint ck_inf_notice_kind check (kind in ('NA','NP','DECISAO','DILIGENCIA','EDITAL')),
  constraint ck_inf_notice_addressee_kind check (addressee_kind in ('proprietario','principal_condutor','condutor_identificado','possuidor_equiparado','embarcador','transportador')),
  constraint ck_inf_notice_channel check (channel in ('sne','postal','pessoal','edital','portal','balcao')),
  constraint ck_inf_notice_status check (status in ('solicitada','expedida','publicada','devolvida','falha','eficaz')),
  constraint ck_inf_notice_printed_deadline_required check (kind not in ('NA','NP') or status = 'solicitada' or printed_deadline_on is not null),
  constraint fk_inf_notice_infraction foreign key (infraction_id) references inf.infraction (id),
  constraint fk_inf_notice_addressee_kind foreign key (addressee_kind) references inf.infraction_subject_kind_ref (code),
  constraint fk_inf_notice_channel foreign key (channel) references inf.notification_channel_ref (code),
  constraint fk_inf_notice_supersedes foreign key (supersedes_notice_id) references inf.notice (id)
);
create index if not exists ix_inf_notice_infraction on inf.notice (tenant_id, infraction_id, kind, issued_at);
create index if not exists ix_inf_notice_status on inf.notice (tenant_id, status);
create index if not exists ix_notice_tenant_id on inf.notice (tenant_id);
create index if not exists ix_notice_infraction_id on inf.notice (infraction_id);
create index if not exists ix_notice_case_id on inf.notice (case_id);
create index if not exists ix_notice_document_id on inf.notice (document_id);
create index if not exists ix_notice_supersedes_notice_id on inf.notice (supersedes_notice_id);

create table if not exists inf.notice_acknowledgement (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  notice_id uuid not null,
  effective_on date not null,
  fictitious boolean not null,
  evidence_kind varchar(30) not null,
  evidence_ref text,
  registered_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_notice_acknowledgement primary key (id),
  constraint ck_inf_notice_acknowledgement_evidence_kind check (evidence_kind in ('ar_postal','recibo_sne','publicacao_edital','assinatura','registro_balcao')),
  constraint fk_inf_notice_acknowledgement_notice foreign key (notice_id) references inf.notice (id)
);
create unique index if not exists ux_inf_notice_acknowledgement_notice on inf.notice_acknowledgement (tenant_id, notice_id);
create index if not exists ix_notice_acknowledgement_tenant_id on inf.notice_acknowledgement (tenant_id);
create index if not exists ix_notice_acknowledgement_notice_id on inf.notice_acknowledgement (notice_id);

create table if not exists inf.notice_delivery_attempt (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  notice_id uuid not null,
  channel varchar(20) not null,
  attempted_at timestamptz not null,
  outcome varchar(20) not null,
  provider_ref text,
  error_code varchar(60),
  outbox_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_notice_delivery_attempt primary key (id),
  constraint ck_inf_notice_delivery_attempt_channel check (channel in ('sne','postal','pessoal','edital','portal','balcao')),
  constraint ck_inf_notice_delivery_attempt_outcome check (outcome in ('entregue','devolvida','falha')),
  constraint fk_inf_notice_delivery_attempt_notice foreign key (notice_id) references inf.notice (id),
  constraint fk_inf_notice_delivery_attempt_channel foreign key (channel) references inf.notification_channel_ref (code)
);
create index if not exists ix_inf_notice_delivery_attempt_notice on inf.notice_delivery_attempt (tenant_id, notice_id, attempted_at);
create index if not exists ix_notice_delivery_attempt_tenant_id on inf.notice_delivery_attempt (tenant_id);
create index if not exists ix_notice_delivery_attempt_notice_id on inf.notice_delivery_attempt (notice_id);
create index if not exists ix_notice_delivery_attempt_outbox_id on inf.notice_delivery_attempt (outbox_id);

select auth.create_rls_policy('inf', 'notice');

select auth.create_rls_policy('inf', 'notice_acknowledgement');

select auth.create_rls_policy('inf', 'notice_delivery_attempt');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
