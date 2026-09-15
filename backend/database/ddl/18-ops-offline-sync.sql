-- Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d

-- Regenerable-only DDL for BP-OPS-OFFLINE-SYNC-001; request-path writes use role_app_backend.

create schema if not exists ops;

create table if not exists ops.ait_numbering_range (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  series varchar(40) not null,
  start_number bigint not null,
  end_number bigint not null,
  next_number bigint not null,
  status varchar(40) default 'active' not null,
  usage_mode varchar(40) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_ait_numbering_range primary key (id),
  constraint ck_ops_ait_numbering_range_bounds check (start_number <= end_number and next_number between start_number and end_number)
);
create unique index if not exists ux_ait_numbering_range_tenant_id_traffic_agency_id_series on ops.ait_numbering_range (tenant_id, traffic_agency_id, series);
create index if not exists ix_ait_numbering_range_tenant_id on ops.ait_numbering_range (tenant_id);
create index if not exists ix_ait_numbering_range_traffic_agency_id on ops.ait_numbering_range (traffic_agency_id);

create table if not exists ops.numbering_reservation (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  range_id uuid not null,
  traffic_agency_id uuid not null,
  agent_id uuid not null,
  device_id uuid not null,
  shift_id uuid,
  idempotency_key varchar(160),
  start_number bigint not null,
  end_number bigint not null,
  reserved_at timestamptz default now() not null,
  valid_until timestamptz not null,
  status varchar(40) default 'reserved' not null,
  reconciliation_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_numbering_reservation primary key (id),
  constraint fk_ops_numbering_reservation_range foreign key (range_id) references ops.ait_numbering_range (id)
);
create index if not exists ix_numbering_reservation_tenant_id_agent_id_device_id_status on ops.numbering_reservation (tenant_id, agent_id, device_id, status);
create unique index if not exists ux_numbering_reservation_tenant_id_idempotency_key on ops.numbering_reservation (tenant_id, idempotency_key) where idempotency_key is not null;
create index if not exists ix_numbering_reservation_tenant_id on ops.numbering_reservation (tenant_id);
create index if not exists ix_numbering_reservation_range_id on ops.numbering_reservation (range_id);
create index if not exists ix_numbering_reservation_traffic_agency_id on ops.numbering_reservation (traffic_agency_id);
create index if not exists ix_numbering_reservation_agent_id on ops.numbering_reservation (agent_id);
create index if not exists ix_numbering_reservation_device_id on ops.numbering_reservation (device_id);
create index if not exists ix_numbering_reservation_shift_id on ops.numbering_reservation (shift_id);

create table if not exists ops.numbering_consumption (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  reservation_id uuid not null,
  range_id uuid not null,
  number bigint not null,
  local_entity_id uuid,
  idempotency_key varchar(160),
  server_entity_id uuid,
  finalized_at timestamptz,
  reconciled_at timestamptz default now() not null,
  status varchar(40) default 'applied' not null,
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_numbering_consumption primary key (id),
  constraint fk_ops_numbering_consumption_reservation foreign key (reservation_id) references ops.numbering_reservation (id),
  constraint fk_ops_numbering_consumption_range foreign key (range_id) references ops.ait_numbering_range (id)
);
create unique index if not exists ux_numbering_consumption_tenant_id_range_id_number on ops.numbering_consumption (tenant_id, range_id, number);
create unique index if not exists ux_numbering_consumption_tenant_id_local_entity_id on ops.numbering_consumption (tenant_id, local_entity_id);
create unique index if not exists ux_numbering_consumption_tenant_id_idempotency_key on ops.numbering_consumption (tenant_id, idempotency_key);
create index if not exists ix_numbering_consumption_tenant_id on ops.numbering_consumption (tenant_id);
create index if not exists ix_numbering_consumption_reservation_id on ops.numbering_consumption (reservation_id);
create index if not exists ix_numbering_consumption_range_id on ops.numbering_consumption (range_id);
create index if not exists ix_numbering_consumption_local_entity_id on ops.numbering_consumption (local_entity_id);
create index if not exists ix_numbering_consumption_server_entity_id on ops.numbering_consumption (server_entity_id);

create table if not exists ops.sync_batch (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  agent_id uuid not null,
  device_id uuid not null,
  device_batch_id varchar(160) not null,
  batch_sequence bigint,
  submitted_at timestamptz default now() not null,
  accepted_items integer default 0 not null,
  receipts_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_sync_batch primary key (id),
  constraint ck_ops_sync_batch_sequence_positive check (batch_sequence is null or batch_sequence >= 1),
  constraint ck_ops_sync_batch_accepted_items_non_negative check (accepted_items >= 0)
);
create unique index if not exists ux_sync_batch_tenant_id_device_id_device_batch_id on ops.sync_batch (tenant_id, device_id, device_batch_id);
create unique index if not exists ux_sync_batch_tenant_id_device_id_batch_sequence on ops.sync_batch (tenant_id, device_id, batch_sequence);
create index if not exists ix_sync_batch_tenant_id on ops.sync_batch (tenant_id);
create index if not exists ix_sync_batch_traffic_agency_id on ops.sync_batch (traffic_agency_id);
create index if not exists ix_sync_batch_agent_id on ops.sync_batch (agent_id);
create index if not exists ix_sync_batch_device_id on ops.sync_batch (device_id);
create index if not exists ix_sync_batch_device_batch_id on ops.sync_batch (device_batch_id);

create table if not exists ops.sync_queue_item (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  traffic_agency_id uuid not null,
  device_id uuid not null,
  agent_id uuid not null,
  entity_type varchar(60) not null,
  local_entity_id uuid not null,
  server_entity_id uuid,
  status varchar(40) default 'pending' not null,
  attempts integer default 0 not null,
  created_locally_at timestamptz not null,
  sent_at timestamptz,
  received_at timestamptz,
  idempotency_key varchar(160) not null,
  payload_hash varchar(128) not null,
  payload_json jsonb not null,
  error_code varchar(80),
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_sync_queue_item primary key (id)
);
create index if not exists ix_sync_queue_item_tenant_id_device_id_status on ops.sync_queue_item (tenant_id, device_id, status);
create unique index if not exists ux_sync_queue_item_tenant_id_idempotency_key on ops.sync_queue_item (tenant_id, idempotency_key);
create index if not exists ix_sync_queue_item_tenant_id on ops.sync_queue_item (tenant_id);
create index if not exists ix_sync_queue_item_traffic_agency_id on ops.sync_queue_item (traffic_agency_id);
create index if not exists ix_sync_queue_item_device_id on ops.sync_queue_item (device_id);
create index if not exists ix_sync_queue_item_agent_id on ops.sync_queue_item (agent_id);
create index if not exists ix_sync_queue_item_local_entity_id on ops.sync_queue_item (local_entity_id);
create index if not exists ix_sync_queue_item_server_entity_id on ops.sync_queue_item (server_entity_id);

create table if not exists ops.sync_receipt (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  sync_queue_item_id uuid not null,
  idempotency_key varchar(160) not null,
  entity_type varchar(60) not null,
  local_entity_id uuid not null,
  server_entity_id uuid,
  accepted_hash varchar(128) not null,
  status varchar(40) not null,
  reason_code varchar(80),
  applied_at timestamptz,
  details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_sync_receipt primary key (id),
  constraint fk_ops_sync_receipt_queue_item foreign key (sync_queue_item_id) references ops.sync_queue_item (id)
);
create unique index if not exists ux_sync_receipt_tenant_id_idempotency_key on ops.sync_receipt (tenant_id, idempotency_key);
create unique index if not exists ux_sync_receipt_tenant_id_sync_queue_item_id on ops.sync_receipt (tenant_id, sync_queue_item_id);
create index if not exists ix_sync_receipt_tenant_id on ops.sync_receipt (tenant_id);
create index if not exists ix_sync_receipt_sync_queue_item_id on ops.sync_receipt (sync_queue_item_id);
create index if not exists ix_sync_receipt_local_entity_id on ops.sync_receipt (local_entity_id);
create index if not exists ix_sync_receipt_server_entity_id on ops.sync_receipt (server_entity_id);

create table if not exists ops.sync_conflict (
  id uuid default gen_random_uuid() not null,
  tenant_id uuid not null,
  sync_queue_item_id uuid not null,
  conflict_type varchar(80) not null,
  reason_code varchar(80) default 'SYNC_CONFLICT' not null,
  safe_message varchar(240) default 'Divergência de negócio requer análise.' not null,
  correlation_id varchar(120) default gen_random_uuid()::text not null,
  local_hash varchar(128),
  server_hash varchar(128),
  retryable boolean default false not null,
  allowed_resolution_actions jsonb default '[]'::jsonb not null,
  description text not null,
  status varchar(40) default 'open' not null,
  resolved_by_user_ref uuid,
  resolved_at timestamptz,
  resolution_action text,
  resolution_details_json jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz,
  constraint pk_sync_conflict primary key (id),
  constraint fk_ops_sync_conflict_queue_item foreign key (sync_queue_item_id) references ops.sync_queue_item (id)
);
create index if not exists ix_sync_conflict_tenant_id_status on ops.sync_conflict (tenant_id, status);
create index if not exists ix_sync_conflict_tenant_id on ops.sync_conflict (tenant_id);
create index if not exists ix_sync_conflict_sync_queue_item_id on ops.sync_conflict (sync_queue_item_id);
create index if not exists ix_sync_conflict_correlation_id on ops.sync_conflict (correlation_id);

select auth.create_rls_policy('ops', 'ait_numbering_range');

select auth.create_rls_policy('ops', 'numbering_reservation');

select auth.create_rls_policy('ops', 'numbering_consumption');

select auth.create_rls_policy('ops', 'sync_batch');

select auth.create_rls_policy('ops', 'sync_queue_item');

select auth.create_rls_policy('ops', 'sync_receipt');

select auth.create_rls_policy('ops', 'sync_conflict');

select auth.install_tenant_triggers();

grant usage on schema ops to role_app_backend;

grant select, insert, update, delete on all tables in schema ops to role_app_backend;

grant usage, select on all sequences in schema ops to role_app_backend;
