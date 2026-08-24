CREATE OR REPLACE FUNCTION audit.compute_hash(
  p_prev_hash bytea,
  p_tenant uuid,
  p_occurred_at timestamptz,
  p_action text,
  p_entity text,
  p_details jsonb
)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT digest(
    coalesce(p_prev_hash, '\x'::bytea)
    || uuid_send(p_tenant)
    || int8send((extract(epoch FROM p_occurred_at) * 1000000)::bigint)
    || convert_to(p_action, 'UTF8')
    || convert_to(p_entity, 'UTF8')
    || convert_to(coalesce(p_details, '{}'::jsonb)::text, 'UTF8'),
    'sha256'
  )
$$;

CREATE OR REPLACE FUNCTION audit.write(
  p_tenant uuid,
  p_actor uuid,
  p_role text,
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip inet DEFAULT NULL,
  p_station uuid DEFAULT NULL,
  p_correlation uuid DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, audit, auth, public
AS $$
DECLARE
  tenant uuid := coalesce(p_tenant, auth.current_tenant());
  occurred timestamptz := clock_timestamp();
  previous bytea;
  current_hash bytea;
  inserted_id bigint;
BEGIN
  IF tenant IS NULL THEN
    RAISE EXCEPTION 'Audit tenant context is required' USING errcode = '42501';
  END IF;
  IF auth.current_tenant() IS DISTINCT FROM tenant THEN
    RAISE EXCEPTION 'Audit tenant mismatch' USING errcode = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(tenant::text, 0));
  SELECT self_hash INTO previous
  FROM audit.events
  WHERE tenant_id = tenant
  ORDER BY occurred_at DESC, event_id DESC
  LIMIT 1;

  current_hash := audit.compute_hash(previous, tenant, occurred, p_action, p_entity, p_details);
  INSERT INTO audit.events (
    tenant_id, occurred_at, correlation_id, actor_id, actor_role, ip_address,
    station_id, action, entity, entity_id, details, prev_hash, self_hash
  ) VALUES (
    tenant, occurred, coalesce(p_correlation, gen_random_uuid()), p_actor, p_role, p_ip,
    p_station, p_action, p_entity, p_entity_id, coalesce(p_details, '{}'::jsonb),
    previous, current_hash
  ) RETURNING event_id INTO inserted_id;
  RETURN inserted_id;
END
$$;

CREATE OR REPLACE FUNCTION audit.verify_chain(p_tenant uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  WITH ordered AS (
    SELECT
      event_id,
      occurred_at,
      action,
      entity,
      details,
      prev_hash,
      self_hash,
      lag(self_hash) OVER (ORDER BY occurred_at, event_id) AS expected_previous
    FROM audit.events
    WHERE tenant_id = p_tenant
  )
  SELECT coalesce(bool_and(
    prev_hash IS NOT DISTINCT FROM expected_previous
    AND self_hash = audit.compute_hash(prev_hash, p_tenant, occurred_at, action, entity, details)
  ), true)
  FROM ordered
$$;

CREATE OR REPLACE FUNCTION audit.prevent_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit.events is append-only' USING errcode = '42501';
END
$$;

DROP TRIGGER IF EXISTS audit_events_prevent_mutation ON audit.events;
CREATE TRIGGER audit_events_prevent_mutation
  BEFORE UPDATE OR DELETE ON audit.events
  FOR EACH ROW EXECUTE FUNCTION audit.prevent_mutation();
