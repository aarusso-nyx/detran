-- Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4

-- Regenerable-only DDL for BP-OPS-EVIDENCE-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.evidence_evidence (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  evidence_type varchar(60) not null,
  origin varchar(60) not null,
  storage_uri text not null,
  mime_type varchar(120) not null,
  size_bytes bigint not null,
  hash_algorithm varchar(40) not null,
  hash_value varchar(128) not null,
  captured_by_user_ref uuid,
  agent_id uuid,
  device_id uuid,
  captured_at timestamptz not null,
  location_json jsonb,
  status varchar(60) default 'pending_upload' not null,
  metadata_json jsonb,
  location_geom geometry(Point,4674),
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_evidence primary key (id),
  constraint ck_ops_evidence_status check (status in ('pending_upload', 'uploaded', 'validated', 'linked', 'packaged', 'archived', 'rejected', 'quarantined', 'superseded'))
);
create unique index if not exists ux_evidence_evidence_tenant_id_hash_value on ops.evidence_evidence (tenant_id, hash_value);
create index if not exists ix_evidence_evidence_tenant_id_captured_at on ops.evidence_evidence (tenant_id, captured_at);
create index if not exists gist_ops_evidence_location on ops.evidence_evidence using gist (location_geom);
create index if not exists ix_evidence_evidence_tenant_id on ops.evidence_evidence (tenant_id);
create index if not exists ix_evidence_evidence_traffic_agency_id on ops.evidence_evidence (traffic_agency_id);
create index if not exists ix_evidence_evidence_agent_id on ops.evidence_evidence (agent_id);
create index if not exists ix_evidence_evidence_device_id on ops.evidence_evidence (device_id);

create table if not exists ops.evidence_link (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  evidence_id uuid not null,
  entity_type varchar(60) not null,
  entity_id uuid not null,
  role varchar(80) not null,
  mandatory boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_link primary key (id),
  constraint fk_ops_evidence_link_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create index if not exists ix_evidence_link_tenant_id_entity_type_entity_id on ops.evidence_link (tenant_id, entity_type, entity_id);
create index if not exists ix_evidence_link_tenant_id on ops.evidence_link (tenant_id);
create index if not exists ix_evidence_link_evidence_id on ops.evidence_link (evidence_id);
create index if not exists ix_evidence_link_entity_id on ops.evidence_link (entity_id);

create table if not exists ops.evidence_custody_event (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  evidence_id uuid not null,
  event_type varchar(80) not null,
  event_at timestamptz default now() not null,
  user_ref uuid,
  system_name varchar(80),
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_custody_event primary key (id),
  constraint fk_ops_custody_event_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create index if not exists ix_evidence_custody_event_tenant_id_evidence_id_event_at on ops.evidence_custody_event (tenant_id, evidence_id, event_at);
create index if not exists ix_evidence_custody_event_tenant_id on ops.evidence_custody_event (tenant_id);
create index if not exists ix_evidence_custody_event_evidence_id on ops.evidence_custody_event (evidence_id);

create table if not exists ops.evidence_probative_package (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  entity_type varchar(60) not null,
  entity_id uuid not null,
  generated_by_user_ref uuid not null,
  generated_at timestamptz default now() not null,
  manifest_hash varchar(128) not null,
  package_uri text not null,
  purpose varchar(80) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_probative_package primary key (id)
);
create index if not exists ix_evidence_probative_package_tenant_id_entity_type_entity_id on ops.evidence_probative_package (tenant_id, entity_type, entity_id);
create index if not exists ix_evidence_probative_package_tenant_id on ops.evidence_probative_package (tenant_id);
create index if not exists ix_evidence_probative_package_traffic_agency_id on ops.evidence_probative_package (traffic_agency_id);
create index if not exists ix_evidence_probative_package_entity_id on ops.evidence_probative_package (entity_id);

create table if not exists ops.evidence_probative_package_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  package_id uuid not null,
  item_type varchar(60) not null,
  evidence_id uuid,
  entity_type varchar(60),
  entity_id uuid,
  item_hash varchar(128) not null,
  sequence integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_probative_package_item primary key (id),
  constraint fk_ops_package_item_package foreign key (package_id) references ops.evidence_probative_package (id),
  constraint fk_ops_package_item_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create unique index if not exists ux_evidence_probative_package_item_tenant_id_package_id_sequence on ops.evidence_probative_package_item (tenant_id, package_id, sequence);
create index if not exists ix_evidence_probative_package_item_tenant_id on ops.evidence_probative_package_item (tenant_id);
create index if not exists ix_evidence_probative_package_item_package_id on ops.evidence_probative_package_item (package_id);
create index if not exists ix_evidence_probative_package_item_evidence_id on ops.evidence_probative_package_item (evidence_id);
create index if not exists ix_evidence_probative_package_item_entity_id on ops.evidence_probative_package_item (entity_id);

create table if not exists ops.evidence_access_request (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  evidence_id uuid not null,
  requester_name varchar(160) not null,
  requester_role varchar(40) not null,
  investigation_ref varchar(160) not null,
  purpose text not null,
  legal_basis text,
  status varchar(20) default 'requested' not null,
  delivery_media_ref text,
  decided_by_user_ref uuid,
  delivered_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_evidence_access_request primary key (id),
  constraint ck_ops_evidence_access_requester_role check (requester_role in ('magistrado', 'ministerio-publico', 'defensoria-publica', 'autoridade-policial', 'autoridade-administrativa')),
  constraint ck_ops_evidence_access_status check (status in ('requested', 'approved', 'denied', 'delivered')),
  constraint ck_ops_evidence_access_delivered_complete check (status <> 'delivered' or (delivery_media_ref is not null and delivered_at is not null)),
  constraint fk_ops_evidence_access_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create index if not exists ix_evidence_access_request_tenant_id_evidence_id on ops.evidence_access_request (tenant_id, evidence_id);
create index if not exists ix_evidence_access_request_tenant_id_status on ops.evidence_access_request (tenant_id, status);
create index if not exists ix_evidence_access_request_tenant_id on ops.evidence_access_request (tenant_id);
create index if not exists ix_evidence_access_request_evidence_id on ops.evidence_access_request (evidence_id);

create table if not exists ops.storage_intent (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  evidence_id uuid not null,
  idempotency_key varchar(160) not null,
  local_evidence_id uuid not null,
  object_key text not null,
  expires_at timestamptz not null,
  accepted_hash varchar(128),
  status varchar(40) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_storage_intent primary key (id),
  constraint fk_ops_storage_intent_evidence foreign key (evidence_id) references ops.evidence_evidence (id)
);
create unique index if not exists ux_storage_intent_tenant_id_idempotency_key on ops.storage_intent (tenant_id, idempotency_key);
create unique index if not exists ux_storage_intent_tenant_id_local_evidence_id on ops.storage_intent (tenant_id, local_evidence_id);
create index if not exists ix_storage_intent_tenant_id on ops.storage_intent (tenant_id);
create index if not exists ix_storage_intent_evidence_id on ops.storage_intent (evidence_id);
create index if not exists ix_storage_intent_local_evidence_id on ops.storage_intent (local_evidence_id);

select auth.create_rls_policy('ops', 'evidence_evidence');

select auth.create_rls_policy('ops', 'evidence_link');

select auth.create_rls_policy('ops', 'evidence_custody_event');

select auth.create_rls_policy('ops', 'evidence_probative_package');

select auth.create_rls_policy('ops', 'evidence_probative_package_item');

select auth.create_rls_policy('ops', 'evidence_access_request');

select auth.create_rls_policy('ops', 'storage_intent');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
