CREATE TABLE IF NOT EXISTS integration.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  topic text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  dispatched_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT ck_integration_outbox_status
    CHECK (status IN ('pending', 'processing', 'acked', 'error')),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS ix_integration_outbox_due
  ON integration.outbox (tenant_id, status, available_at, created_at);

CREATE TABLE IF NOT EXISTS integration.delivery_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  outbox_id uuid NOT NULL REFERENCES integration.outbox(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  status text NOT NULL CHECK (status IN ('sent', 'acked', 'error')),
  provider_code text,
  provider_message text,
  provider_protocol text,
  request_sha256 varchar(64) NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  response_sha256 varchar(64),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, outbox_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS ix_integration_delivery_attempt_outbox
  ON integration.delivery_attempt (tenant_id, outbox_id, attempt_number);

CREATE TABLE IF NOT EXISTS integration.inbox_receipt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  event_id text NOT NULL,
  payload_sha256 varchar(64) NOT NULL CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processed', 'error')),
  error_details text,
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, provider, event_id)
);

CREATE INDEX IF NOT EXISTS ix_integration_inbox_receipt_status
  ON integration.inbox_receipt (tenant_id, status, received_at);

CREATE TABLE IF NOT EXISTS integration.professional_council_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  council_type varchar(8) NOT NULL CHECK (council_type IN ('CRM', 'CRP')),
  council_number varchar(80) NOT NULL,
  council_state varchar(2) NOT NULL CHECK (council_state ~ '^[A-Z]{2}$'),
  professional_name varchar(255),
  status varchar(16) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  provider_checked_at timestamptz NOT NULL,
  response_sha256 varchar(64) NOT NULL CHECK (response_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, council_type, council_number, council_state)
);

CREATE INDEX IF NOT EXISTS ix_integration_professional_council_status
  ON integration.professional_council_cache
  (tenant_id, council_type, status, provider_checked_at);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  collection text NOT NULL,
  object_key text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  checksum_sha256 text NOT NULL,
  classification text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (tenant_id, object_key)
);
