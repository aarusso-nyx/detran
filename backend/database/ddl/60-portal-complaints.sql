-- Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c

-- Regenerable-only DDL for BP-PORTAL-COMPLAINTS-001; request-path writes use role_app_backend.

create schema if not exists portal;

create table if not exists portal.complaint (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  protocol varchar(80) not null,
  complainant_name varchar(255),
  contact varchar(255),
  category varchar(80) not null,
  status varchar(16) default 'OPEN' not null,
  description text not null,
  payload jsonb default '{}'::jsonb not null,
  assigned_to uuid,
  closed_by uuid,
  closed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_complaint primary key (id),
  constraint ck_portal_complaint_status check (status in ('OPEN','TRIAGED','IN_REVIEW','CLOSED','REJECTED')),
  constraint ck_portal_complaint_closed check ((status not in ('CLOSED','REJECTED') and closed_by is null and closed_at is null) or (status in ('CLOSED','REJECTED') and closed_by is not null and closed_at is not null))
);
create unique index if not exists ux_portal_complaint_protocol on portal.complaint (tenant_id, protocol);
create index if not exists ix_portal_complaint_status on portal.complaint (tenant_id, status, created_at);
create index if not exists ix_complaint_tenant_id on portal.complaint (tenant_id);

select auth.create_rls_policy('portal', 'complaint');

select auth.install_tenant_triggers();

grant usage on schema portal to role_app_backend;

grant select, insert, update, delete on all tables in schema portal to role_app_backend;

grant usage, select on all sequences in schema portal to role_app_backend;
