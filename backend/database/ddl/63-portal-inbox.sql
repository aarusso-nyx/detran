-- Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da

-- Regenerable-only DDL for BP-PORTAL-INBOX-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.inbox_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_id uuid not null,
  kind varchar(20) not null,
  action_required boolean default false not null,
  source varchar(20) not null,
  source_event_id uuid not null,
  subject_line text not null,
  summary text not null,
  ait_id uuid,
  request_id uuid,
  available_on date not null,
  read_on date,
  fictitious_acknowledgement_on date,
  deadline_due_on date,
  deadline_owned_by varchar(20),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_inbox_item primary key (id),
  constraint ck_portal_inbox_item_kind check (kind in ('SNE','PROCESSO','OUVIDORIA','SISTEMA')),
  constraint ck_portal_inbox_item_source check (source in ('sne','portal')),
  constraint ck_portal_inbox_item_fictitious_only_sne check (source = 'sne' or fictitious_acknowledgement_on is null),
  constraint ck_portal_inbox_item_deadline_owned_by check (deadline_owned_by is null or deadline_owned_by in ('citizen','agency')),
  constraint fk_portal_inbox_item_subject foreign key (subject_id) references portal.subject (id),
  constraint fk_portal_inbox_item_request foreign key (request_id) references portal.request (id)
);
create unique index if not exists ux_portal_inbox_item_source_event on portal.inbox_item (tenant_id, source_event_id);
create index if not exists ix_portal_inbox_item_subject_available on portal.inbox_item (tenant_id, subject_id, available_on);
create index if not exists ix_inbox_item_tenant_id on portal.inbox_item (tenant_id);
create index if not exists ix_inbox_item_subject_id on portal.inbox_item (subject_id);
create index if not exists ix_inbox_item_source_event_id on portal.inbox_item (source_event_id);
create index if not exists ix_inbox_item_ait_id on portal.inbox_item (ait_id);
create index if not exists ix_inbox_item_request_id on portal.inbox_item (request_id);

create table if not exists portal.acknowledgement_evidence (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  inbox_item_id uuid not null,
  displayed_sha256 varchar(64) not null,
  acknowledged_at timestamptz not null,
  signature_ref text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_acknowledgement_evidence primary key (id),
  constraint ck_portal_acknowledgement_evidence_displayed_sha256 check (displayed_sha256 ~ '^[0-9a-f]{64}$'),
  constraint fk_portal_acknowledgement_evidence_item foreign key (inbox_item_id) references portal.inbox_item (id)
);
create unique index if not exists ux_portal_acknowledgement_evidence_item on portal.acknowledgement_evidence (tenant_id, inbox_item_id);
create index if not exists ix_acknowledgement_evidence_tenant_id on portal.acknowledgement_evidence (tenant_id);
create index if not exists ix_acknowledgement_evidence_inbox_item_id on portal.acknowledgement_evidence (inbox_item_id);

create table if not exists portal.sne_enrollment (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_id uuid not null,
  state varchar(20) not null,
  channel varchar(20),
  email text,
  phone varchar(20),
  consent_text_version varchar(40),
  effects_ack jsonb,
  since timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_sne_enrollment primary key (id),
  constraint ck_portal_sne_enrollment_state check (state in ('NAO_ADERIDO_SNE','ADERIDO_SNE')),
  constraint ck_portal_sne_enrollment_since_when_enrolled check (state <> 'ADERIDO_SNE' or since is not null),
  constraint ck_portal_sne_enrollment_channel check (channel is null or channel in ('push','email','sne')),
  constraint fk_portal_sne_enrollment_subject foreign key (subject_id) references portal.subject (id)
);
create unique index if not exists ux_portal_sne_enrollment_subject on portal.sne_enrollment (tenant_id, subject_id);
create index if not exists ix_sne_enrollment_tenant_id on portal.sne_enrollment (tenant_id);
create index if not exists ix_sne_enrollment_subject_id on portal.sne_enrollment (subject_id);

create table if not exists portal.push_subscription (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  subject_id uuid not null,
  endpoint text not null,
  keys_json jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_push_subscription primary key (id),
  constraint fk_portal_push_subscription_subject foreign key (subject_id) references portal.subject (id)
);
create unique index if not exists ux_portal_push_subscription_endpoint on portal.push_subscription (tenant_id, endpoint);
create index if not exists ix_push_subscription_tenant_id on portal.push_subscription (tenant_id);
create index if not exists ix_push_subscription_subject_id on portal.push_subscription (subject_id);

select auth.create_rls_policy('portal', 'inbox_item');

select auth.create_rls_policy('portal', 'acknowledgement_evidence');

select auth.create_rls_policy('portal', 'sne_enrollment');

select auth.create_rls_policy('portal', 'push_subscription');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
