-- Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.0 sha256:ddd770d620f969774d0560bb02a8ebae3a43c42b4340a4092a1a7828963820a5

-- Regenerable-only DDL for BP-INF-RAIT-INTEGRATION-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.rait_reconciliation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  system varchar(10) not null,
  window_from date not null,
  window_to date not null,
  requested_by uuid not null,
  requested_at timestamptz default now() not null,
  status varchar(20) default 'solicitada' not null,
  divergences_count integer default 0 not null,
  report_document_id uuid,
  resolved_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_rait_reconciliation primary key (id),
  constraint ck_inf_rait_reconciliation_system check (system in ('renainf','renach','sne')),
  constraint ck_inf_rait_reconciliation_status check (status in ('solicitada','conciliada','escalada')),
  constraint ck_inf_rait_reconciliation_window_order check (window_to >= window_from),
  constraint ck_inf_rait_reconciliation_divergences_non_negative check (divergences_count >= 0),
  constraint ck_inf_rait_reconciliation_resolved_complete check (status = 'solicitada' or resolved_at is not null),
  constraint ck_inf_rait_reconciliation_report_required check (status <> 'conciliada' or divergences_count = 0 or report_document_id is not null)
);
create unique index if not exists ux_inf_rait_reconciliation_window on inf.rait_reconciliation (tenant_id, system, window_from, window_to);
create index if not exists ix_inf_rait_reconciliation_status on inf.rait_reconciliation (tenant_id, status, requested_at);
create index if not exists ix_rait_reconciliation_tenant_id on inf.rait_reconciliation (tenant_id);
create index if not exists ix_rait_reconciliation_report_document_id on inf.rait_reconciliation (report_document_id);

select auth.create_rls_policy('inf', 'rait_reconciliation');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
