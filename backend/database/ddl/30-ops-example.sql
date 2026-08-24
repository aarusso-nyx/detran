-- Generated from BP-OPS-EXAMPLE-001 v1.0.0 sha256:a70ca6e407f469de7c4926ee3eea5364795e84c1934982d0662dcaf70341cb29

-- Regenerable-only DDL for BP-OPS-EXAMPLE-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.example_record (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  label varchar(80) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_example_record primary key (id)
);
create index if not exists ix_example_record_tenant_id on ops.example_record (tenant_id);

select auth.create_rls_policy('ops', 'example_record');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
