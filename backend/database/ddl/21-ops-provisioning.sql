-- Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35

-- Regenerable-only DDL for BP-OPS-PROVISIONING-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.device_key (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  device_id uuid not null,
  key_fingerprint varchar(256) not null,
  public_key text not null,
  attestation_evidence_json jsonb not null,
  key_algorithm varchar(80) default 'source_pending' not null,
  wire_format varchar(80) default 'source_pending' not null,
  status varchar(40) default 'registered' not null,
  version bigint default 1 not null,
  registered_at timestamptz default now() not null,
  revoked_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_device_key primary key (id)
);
create unique index if not exists ux_device_key_tenant_id_device_id_key_fingerprint on ops.device_key (tenant_id, device_id, key_fingerprint);
create index if not exists ix_device_key_tenant_id_device_id_status on ops.device_key (tenant_id, device_id, status);
create index if not exists ix_device_key_tenant_id on ops.device_key (tenant_id);
create index if not exists ix_device_key_device_id on ops.device_key (device_id);

create table if not exists ops.offline_authorization_grant (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  device_id uuid not null,
  device_key_fingerprint varchar(256) not null,
  authorized_agents_json jsonb not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  maximum_offline_seconds integer not null,
  maximum_acts integer not null,
  revocation_epoch bigint not null,
  policy_version varchar(160) not null,
  normative_package_id uuid not null,
  numbering_reservation_ids_json jsonb not null,
  issued_at timestamptz default now() not null,
  issued_by_subject varchar(256) not null,
  key_id varchar(256) not null,
  schema_version varchar(40) default '1.0' not null,
  manifest_digest varchar(128) not null,
  status varchar(40) default 'issued' not null,
  version bigint default 1 not null,
  revoked_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_offline_authorization_grant primary key (id),
  constraint ck_ops_offline_authorization_grant_validity check (valid_from < valid_until),
  constraint ck_ops_offline_authorization_grant_limits check (maximum_offline_seconds > 0 and maximum_acts > 0 and revocation_epoch >= 0)
);
create index if not exists ix_offline_authorization_grant_tenant_id_device_id_status on ops.offline_authorization_grant (tenant_id, device_id, status);
create unique index if not exists ux_offline_authorization_grant_tenant_id_manifest_digest on ops.offline_authorization_grant (tenant_id, manifest_digest);
create index if not exists ix_offline_authorization_grant_tenant_id on ops.offline_authorization_grant (tenant_id);
create index if not exists ix_offline_authorization_grant_traffic_agency_id on ops.offline_authorization_grant (traffic_agency_id);
create index if not exists ix_offline_authorization_grant_device_id on ops.offline_authorization_grant (device_id);
create index if not exists ix_offline_authorization_grant_normative_package_id on ops.offline_authorization_grant (normative_package_id);
create index if not exists ix_offline_authorization_grant_key_id on ops.offline_authorization_grant (key_id);

create table if not exists ops.provisioning_package (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  grant_id uuid not null,
  device_id uuid not null,
  schema_version varchar(40) default '1.0' not null,
  manifest_digest varchar(128) not null,
  artifact_digests_json jsonb not null,
  trust_chain_json jsonb not null,
  normative_package_id uuid not null,
  numbering_policy_json jsonb not null,
  envelope_uri text not null,
  signature_key_id varchar(256) not null,
  signature_algorithm varchar(80) default 'source_pending' not null,
  envelope_algorithm varchar(80) default 'source_pending' not null,
  wire_format varchar(80) default 'source_pending' not null,
  status varchar(40) default 'issued' not null,
  version bigint default 1 not null,
  issued_at timestamptz default now() not null,
  expires_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_provisioning_package primary key (id)
);
create unique index if not exists ux_provisioning_package_tenant_id_grant_id on ops.provisioning_package (tenant_id, grant_id);
create index if not exists ix_provisioning_package_tenant_id_device_id_status on ops.provisioning_package (tenant_id, device_id, status);
create unique index if not exists ux_provisioning_package_tenant_id_manifest_digest on ops.provisioning_package (tenant_id, manifest_digest);
create index if not exists ix_provisioning_package_tenant_id on ops.provisioning_package (tenant_id);
create index if not exists ix_provisioning_package_grant_id on ops.provisioning_package (grant_id);
create index if not exists ix_provisioning_package_device_id on ops.provisioning_package (device_id);
create index if not exists ix_provisioning_package_normative_package_id on ops.provisioning_package (normative_package_id);
create index if not exists ix_provisioning_package_signature_key_id on ops.provisioning_package (signature_key_id);

create table if not exists ops.provisioning_receipt (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  package_id uuid not null,
  grant_id uuid not null,
  device_id uuid not null,
  receipt_type varchar(40) not null,
  idempotency_key varchar(160) not null,
  manifest_digest varchar(128) not null,
  device_attestation_json jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_provisioning_receipt primary key (id)
);
create unique index if not exists ux_provisioning_receipt_tenant_id_package_id_device_id_receipt_type on ops.provisioning_receipt (tenant_id, package_id, device_id, receipt_type);
create unique index if not exists ux_provisioning_receipt_tenant_id_idempotency_key on ops.provisioning_receipt (tenant_id, idempotency_key);
create index if not exists ix_provisioning_receipt_tenant_id on ops.provisioning_receipt (tenant_id);
create index if not exists ix_provisioning_receipt_package_id on ops.provisioning_receipt (package_id);
create index if not exists ix_provisioning_receipt_grant_id on ops.provisioning_receipt (grant_id);
create index if not exists ix_provisioning_receipt_device_id on ops.provisioning_receipt (device_id);

create table if not exists ops.device_revocation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  device_id uuid not null,
  grant_id uuid,
  revocation_epoch bigint not null,
  reason_code varchar(80) not null,
  decision_by_subject varchar(256) not null,
  decided_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_device_revocation primary key (id),
  constraint ck_ops_device_revocation_epoch check (revocation_epoch >= 0)
);
create unique index if not exists ux_device_revocation_tenant_id_device_id_revocation_epoch on ops.device_revocation (tenant_id, device_id, revocation_epoch);
create index if not exists ix_device_revocation_tenant_id_grant_id on ops.device_revocation (tenant_id, grant_id);
create index if not exists ix_device_revocation_tenant_id on ops.device_revocation (tenant_id);
create index if not exists ix_device_revocation_device_id on ops.device_revocation (device_id);
create index if not exists ix_device_revocation_grant_id on ops.device_revocation (grant_id);

create table if not exists ops.provisioning_command_idempotency (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  command_name varchar(120) not null,
  idempotency_key varchar(160) not null,
  request_digest varchar(128) not null,
  response_body_json jsonb not null,
  response_etag varchar(512) not null,
  completed_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_provisioning_command_idempotency primary key (id)
);
create unique index if not exists ux_provisioning_command_idempotency_tenant_id_command_name_idempotency_key on ops.provisioning_command_idempotency (tenant_id, command_name, idempotency_key);
create index if not exists ix_provisioning_command_idempotency_tenant_id on ops.provisioning_command_idempotency (tenant_id);

create table if not exists ops.provisioning_reconciliation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  grant_id uuid not null,
  device_id uuid not null,
  reconciliation_digest varchar(128) not null,
  accepted_act_count integer default 0 not null,
  rejected_act_count integer default 0 not null,
  unresolved_act_count integer default 0 not null,
  reconciled_by_subject varchar(256) not null,
  reconciled_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_provisioning_reconciliation primary key (id),
  constraint ck_ops_provisioning_reconciliation_counts check (accepted_act_count >= 0 and rejected_act_count >= 0 and unresolved_act_count >= 0)
);
create unique index if not exists ux_provisioning_reconciliation_tenant_id_grant_id_reconciliation_digest on ops.provisioning_reconciliation (tenant_id, grant_id, reconciliation_digest);
create index if not exists ix_provisioning_reconciliation_tenant_id_grant_id_reconciled_at on ops.provisioning_reconciliation (tenant_id, grant_id, reconciled_at);
create index if not exists ix_provisioning_reconciliation_tenant_id on ops.provisioning_reconciliation (tenant_id);
create index if not exists ix_provisioning_reconciliation_grant_id on ops.provisioning_reconciliation (grant_id);
create index if not exists ix_provisioning_reconciliation_device_id on ops.provisioning_reconciliation (device_id);

create table if not exists ops.provisioning_grant_reservation_binding (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  grant_id uuid not null,
  reservation_id uuid not null,
  traffic_agency_id uuid not null,
  device_id uuid not null,
  authorized_agent_id uuid not null,
  bound_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_provisioning_grant_reservation_binding primary key (id)
);
create unique index if not exists ux_provisioning_grant_reservation_binding_tenant_id_grant_id_reservation_id on ops.provisioning_grant_reservation_binding (tenant_id, grant_id, reservation_id);
create unique index if not exists ux_provisioning_grant_reservation_binding_tenant_id_reservation_id on ops.provisioning_grant_reservation_binding (tenant_id, reservation_id);
create index if not exists ix_provisioning_grant_reservation_binding_tenant_id_grant_id_authorized_agent_id on ops.provisioning_grant_reservation_binding (tenant_id, grant_id, authorized_agent_id);
create index if not exists ix_provisioning_grant_reservation_binding_tenant_id on ops.provisioning_grant_reservation_binding (tenant_id);
create index if not exists ix_provisioning_grant_reservation_binding_grant_id on ops.provisioning_grant_reservation_binding (grant_id);
create index if not exists ix_provisioning_grant_reservation_binding_reservation_id on ops.provisioning_grant_reservation_binding (reservation_id);
create index if not exists ix_provisioning_grant_reservation_binding_traffic_agency_id on ops.provisioning_grant_reservation_binding (traffic_agency_id);
create index if not exists ix_provisioning_grant_reservation_binding_device_id on ops.provisioning_grant_reservation_binding (device_id);
create index if not exists ix_provisioning_grant_reservation_binding_authorized_agent_id on ops.provisioning_grant_reservation_binding (authorized_agent_id);

select auth.create_rls_policy('ops', 'device_key');

select auth.create_rls_policy('ops', 'offline_authorization_grant');

select auth.create_rls_policy('ops', 'provisioning_package');

select auth.create_rls_policy('ops', 'provisioning_receipt');

select auth.create_rls_policy('ops', 'device_revocation');

select auth.create_rls_policy('ops', 'provisioning_command_idempotency');

select auth.create_rls_policy('ops', 'provisioning_reconciliation');

select auth.create_rls_policy('ops', 'provisioning_grant_reservation_binding');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

revoke update, delete on table ops.provisioning_receipt from role_app_backend;

revoke update, delete on table ops.device_revocation from role_app_backend;

revoke update, delete on table ops.provisioning_reconciliation from role_app_backend;

revoke update, delete on table ops.provisioning_grant_reservation_binding from role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
