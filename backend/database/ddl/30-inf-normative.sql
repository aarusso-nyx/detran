-- Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c

-- Regenerable-only DDL for BP-INF-NORMATIVE-001; request-path writes use role_app_backend.

create schema if not exists inf;

create table if not exists inf.normative_catalog (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid,
  name varchar(255) not null,
  catalog_type varchar(60) not null,
  version varchar(80) not null,
  published_at date,
  valid_from date not null,
  valid_to date,
  status varchar(40) default 'draft' not null,
  normative_source text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_catalog primary key (id)
);
create unique index if not exists ux_inf_normative_catalog_name_version on inf.normative_catalog (tenant_id, name, version);
create index if not exists ix_normative_catalog_tenant_id on inf.normative_catalog (tenant_id);
create index if not exists ix_normative_catalog_traffic_agency_id on inf.normative_catalog (traffic_agency_id);

create table if not exists inf.normative_framing (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  catalog_id uuid not null,
  framing_code varchar(40) not null,
  article varchar(80),
  clause varchar(80),
  description text not null,
  severity varchar(40),
  penalty text,
  administrative_measure_summary text,
  allows_no_approach boolean default false not null,
  requires_observation boolean default false not null,
  requires_equipment boolean default false not null,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_framing primary key (id),
  constraint fk_inf_framing_catalog foreign key (catalog_id) references inf.normative_catalog (id)
);
create unique index if not exists ux_inf_normative_framing_code on inf.normative_framing (tenant_id, catalog_id, framing_code);
create index if not exists ix_normative_framing_tenant_id on inf.normative_framing (tenant_id);
create index if not exists ix_normative_framing_catalog_id on inf.normative_framing (catalog_id);

create table if not exists inf.normative_validation_rule (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  catalog_id uuid not null,
  framing_id uuid,
  rule_code varchar(80) not null,
  description text not null,
  rule_type varchar(60) not null,
  expression_json jsonb,
  user_message text,
  severity varchar(40) not null,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_validation_rule primary key (id),
  constraint fk_inf_rule_catalog foreign key (catalog_id) references inf.normative_catalog (id),
  constraint fk_inf_rule_framing foreign key (framing_id) references inf.normative_framing (id)
);
create unique index if not exists ux_inf_normative_rule_code on inf.normative_validation_rule (tenant_id, rule_code);
create index if not exists ix_normative_validation_rule_tenant_id on inf.normative_validation_rule (tenant_id);
create index if not exists ix_normative_validation_rule_catalog_id on inf.normative_validation_rule (catalog_id);
create index if not exists ix_normative_validation_rule_framing_id on inf.normative_validation_rule (framing_id);

create table if not exists inf.normative_agency_parameter (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  key varchar(120) not null,
  value_json jsonb not null,
  value_type varchar(40) not null,
  valid_from date not null,
  valid_to date,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_agency_parameter primary key (id)
);
create unique index if not exists ux_inf_normative_agency_parameter on inf.normative_agency_parameter (tenant_id, traffic_agency_id, key, valid_from);
create index if not exists ix_normative_agency_parameter_tenant_id on inf.normative_agency_parameter (tenant_id);
create index if not exists ix_normative_agency_parameter_traffic_agency_id on inf.normative_agency_parameter (traffic_agency_id);

create table if not exists inf.normative_document_template (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  document_type varchar(80) not null,
  name varchar(255) not null,
  version varchar(80) not null,
  template_body text not null,
  valid_from date not null,
  status varchar(40) default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_document_template primary key (id)
);
create unique index if not exists ux_inf_normative_document_template on inf.normative_document_template (tenant_id, traffic_agency_id, document_type, version);
create index if not exists ix_normative_document_template_tenant_id on inf.normative_document_template (tenant_id);
create index if not exists ix_normative_document_template_traffic_agency_id on inf.normative_document_template (traffic_agency_id);

create table if not exists inf.normative_mobile_package (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  catalog_id uuid not null,
  package_version varchar(80) not null,
  manifest_hash varchar(128) not null,
  package_uri text not null,
  published_at timestamptz,
  valid_until date,
  status varchar(40) default 'draft' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_normative_mobile_package primary key (id),
  constraint fk_inf_mobile_package_catalog foreign key (catalog_id) references inf.normative_catalog (id)
);
create unique index if not exists ux_inf_normative_mobile_package on inf.normative_mobile_package (tenant_id, traffic_agency_id, package_version);
create index if not exists ix_normative_mobile_package_tenant_id on inf.normative_mobile_package (tenant_id);
create index if not exists ix_normative_mobile_package_traffic_agency_id on inf.normative_mobile_package (traffic_agency_id);
create index if not exists ix_normative_mobile_package_catalog_id on inf.normative_mobile_package (catalog_id);

select auth.create_rls_policy('inf', 'normative_catalog');

select auth.create_rls_policy('inf', 'normative_framing');

select auth.create_rls_policy('inf', 'normative_validation_rule');

select auth.create_rls_policy('inf', 'normative_agency_parameter');

select auth.create_rls_policy('inf', 'normative_document_template');

select auth.create_rls_policy('inf', 'normative_mobile_package');

select auth.install_tenant_triggers();

grant usage on schema inf to role_app_backend;

grant select, insert, update, delete on all tables in schema inf to role_app_backend;

grant usage, select on all sequences in schema inf to role_app_backend;
