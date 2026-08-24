CREATE TABLE IF NOT EXISTS audit.events (
  event_id bigint GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  correlation_id uuid,
  actor_id uuid,
  actor_role text,
  ip_address inet,
  station_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  prev_hash bytea,
  self_hash bytea NOT NULL,
  CONSTRAINT pk_audit_events PRIMARY KEY (occurred_at, event_id)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE IF NOT EXISTS audit.events_default PARTITION OF audit.events DEFAULT;
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_time ON audit.events (tenant_id, occurred_at, event_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit.events (tenant_id, entity, entity_id);

CREATE OR REPLACE VIEW audit.v_audit_events_min AS
SELECT event_id, tenant_id, occurred_at, actor_id, actor_role, action, entity, entity_id
FROM audit.events;

REVOKE ALL ON TABLE audit.events FROM PUBLIC;
