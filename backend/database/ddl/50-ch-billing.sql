-- Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53

-- Regenerable-only DDL for BP-CH-BILLING-001; request-path writes use role_app_backend.

create schema if not exists ch;

create table if not exists ch.federal_exam_public_price (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  exam_kind varchar(16) not null,
  amount_cents integer not null,
  effective_from date not null,
  effective_to date,
  ipca_reference_year integer not null,
  index_name varchar(16) default 'IPCA' not null,
  federal_source_reference text not null,
  published_at date not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_federal_exam_public_price primary key (id),
  constraint ck_ch_federal_exam_price_kind check (exam_kind in ('MEDICAL','PSYCH')),
  constraint ck_ch_federal_exam_price_amount check (amount_cents >= 0),
  constraint ck_ch_federal_exam_price_ipca check (index_name = 'IPCA' and ipca_reference_year >= 2026),
  constraint ck_ch_federal_exam_price_period check (effective_to is null or effective_to >= effective_from),
  constraint ck_ch_federal_exam_price_publication check (published_at <= effective_from)
);
create unique index if not exists ux_ch_federal_exam_price_start on ch.federal_exam_public_price (tenant_id, exam_kind, effective_from);
create index if not exists ix_ch_federal_exam_price_effective on ch.federal_exam_public_price (tenant_id, exam_kind, effective_from, effective_to);
create index if not exists ix_federal_exam_public_price_tenant_id on ch.federal_exam_public_price (tenant_id);

create table if not exists ch.billing_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  encounter_id uuid,
  telehealth_session_id uuid,
  federal_price_id uuid,
  item_kind varchar(24) not null,
  exam_kind varchar(16),
  source varchar(32) default 'PEC' not null,
  amount_cents integer not null,
  reference_number text,
  status varchar(24) default 'ISSUED' not null,
  payment_validated_at timestamptz,
  payload jsonb default '{}'::jsonb not null,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_billing_item primary key (id),
  constraint ck_ch_billing_item_kind check (item_kind in ('PROTOCOL','EXAM','TELEHEALTH','ADJUSTMENT')),
  constraint ck_ch_billing_item_status check (status in ('ISSUED','PAID','ATTESTED','DIVERGENT','CANCELLED')),
  constraint ck_ch_billing_item_amount check (amount_cents >= 0),
  constraint ck_ch_billing_item_subject check (encounter_id is not null or telehealth_session_id is not null),
  constraint ck_ch_billing_item_exam_price check ((item_kind = 'EXAM' and federal_price_id is not null and exam_kind in ('MEDICAL','PSYCH')) or (item_kind <> 'EXAM' and federal_price_id is null and exam_kind is null)),
  constraint fk_ch_billing_item_encounter foreign key (encounter_id) references ch.encounter (id),
  constraint fk_ch_billing_item_price foreign key (federal_price_id) references ch.federal_exam_public_price (id)
);
create index if not exists ix_ch_billing_item_encounter on ch.billing_item (tenant_id, encounter_id, status);
create index if not exists ix_ch_billing_item_reference on ch.billing_item (tenant_id, reference_number);
create index if not exists ix_billing_item_tenant_id on ch.billing_item (tenant_id);
create index if not exists ix_billing_item_encounter_id on ch.billing_item (encounter_id);
create index if not exists ix_billing_item_telehealth_session_id on ch.billing_item (telehealth_session_id);
create index if not exists ix_billing_item_federal_price_id on ch.billing_item (federal_price_id);

create table if not exists ch.billing_invoice (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  clinic_id uuid,
  reference_period varchar(7) not null,
  status varchar(24) default 'OPEN' not null,
  total_cents integer default 0 not null,
  payload jsonb default '{}'::jsonb not null,
  closed_at timestamptz,
  attested_at timestamptz,
  paid_at timestamptz,
  created_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_billing_invoice primary key (id),
  constraint ck_ch_billing_invoice_period check (reference_period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  constraint ck_ch_billing_invoice_status check (status in ('OPEN','CLOSED','ATTESTED','PAID','CANCELLED')),
  constraint ck_ch_billing_invoice_total check (total_cents >= 0),
  constraint fk_ch_billing_invoice_clinic foreign key (clinic_id) references ch.clinic (id)
);
create index if not exists ix_ch_billing_invoice_period on ch.billing_invoice (tenant_id, reference_period, status);
create index if not exists ix_billing_invoice_tenant_id on ch.billing_invoice (tenant_id);
create index if not exists ix_billing_invoice_clinic_id on ch.billing_invoice (clinic_id);

create table if not exists ch.billing_divergence (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  invoice_id uuid,
  item_id uuid,
  status varchar(16) default 'OPEN' not null,
  reason text not null,
  resolution text,
  payload jsonb default '{}'::jsonb not null,
  created_by uuid not null,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_billing_divergence primary key (id),
  constraint ck_ch_billing_divergence_status check (status in ('OPEN','RESOLVED','REJECTED')),
  constraint ck_ch_billing_divergence_subject check (invoice_id is not null or item_id is not null),
  constraint ck_ch_billing_divergence_resolution check (status = 'OPEN' or (resolution is not null and resolved_by is not null and resolved_at is not null)),
  constraint fk_ch_billing_divergence_invoice foreign key (invoice_id) references ch.billing_invoice (id),
  constraint fk_ch_billing_divergence_item foreign key (item_id) references ch.billing_item (id)
);
create index if not exists ix_ch_billing_divergence_status on ch.billing_divergence (tenant_id, status, created_at);
create index if not exists ix_billing_divergence_tenant_id on ch.billing_divergence (tenant_id);
create index if not exists ix_billing_divergence_invoice_id on ch.billing_divergence (invoice_id);
create index if not exists ix_billing_divergence_item_id on ch.billing_divergence (item_id);

create table if not exists ch.billing_invoice_item (
  tenant_id uuid not null,
  invoice_id uuid not null,
  item_id uuid not null,
  linked_by uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_billing_invoice_item primary key (tenant_id, invoice_id, item_id),
  constraint fk_ch_billing_invoice_item_invoice foreign key (invoice_id) references ch.billing_invoice (id),
  constraint fk_ch_billing_invoice_item_item foreign key (item_id) references ch.billing_item (id)
);
create unique index if not exists ux_ch_billing_invoice_item_once on ch.billing_invoice_item (tenant_id, item_id);
create index if not exists ix_billing_invoice_item_tenant_id on ch.billing_invoice_item (tenant_id);
create index if not exists ix_billing_invoice_item_invoice_id on ch.billing_invoice_item (invoice_id);
create index if not exists ix_billing_invoice_item_item_id on ch.billing_invoice_item (item_id);

select auth.create_rls_policy('ch', 'federal_exam_public_price');

select auth.create_rls_policy('ch', 'billing_item');

select auth.create_rls_policy('ch', 'billing_invoice');

select auth.create_rls_policy('ch', 'billing_divergence');

select auth.create_rls_policy('ch', 'billing_invoice_item');

select auth.install_tenant_triggers();

grant usage on schema ch to role_app_backend;

grant select, insert, update, delete on all tables in schema ch to role_app_backend;

grant usage, select on all sequences in schema ch to role_app_backend;
