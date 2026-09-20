CREATE SCHEMA IF NOT EXISTS jobs;

CREATE TABLE IF NOT EXISTS jobs.boat_renaest_identity (
  tenant_id uuid PRIMARY KEY REFERENCES auth.tenants (id) ON DELETE CASCADE,
  actor_id uuid NOT NULL,
  state text NOT NULL DEFAULT 'active'
    CHECK (state IN ('active', 'revoked')),
  provisioned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  provisioned_by uuid NOT NULL REFERENCES auth.users (id),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users (id),
  revocation_reason text,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (tenant_id, actor_id)
    REFERENCES auth.memberships (tenant_id, user_id),
  CHECK (
    (state = 'active' AND revoked_at IS NULL AND revoked_by IS NULL
      AND revocation_reason IS NULL)
    OR (state = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS jobs.boat_renaest_identity_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants (id) ON DELETE CASCADE,
  actor_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('provisioned', 'revoked')),
  performed_by uuid NOT NULL REFERENCES auth.users (id),
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (tenant_id, actor_id)
    REFERENCES auth.memberships (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS jobs.boat_renaest_execution (
  tenant_id uuid NOT NULL REFERENCES auth.tenants (id) ON DELETE CASCADE,
  calendar_month date NOT NULL,
  actor_id uuid NOT NULL,
  request_id text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  failure_code text,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, calendar_month),
  FOREIGN KEY (tenant_id, actor_id)
    REFERENCES auth.memberships (tenant_id, user_id),
  CHECK (calendar_month = date_trunc('month', calendar_month)::date),
  CHECK (
    (status = 'processing' AND completed_at IS NULL AND failure_code IS NULL)
    OR (status = 'completed' AND completed_at IS NOT NULL AND failure_code IS NULL)
    OR (status = 'failed' AND completed_at IS NOT NULL AND failure_code IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_jobs_boat_renaest_execution_due
  ON jobs.boat_renaest_execution (calendar_month, status);

CREATE OR REPLACE FUNCTION jobs.require_active_membership(
  p_tenant_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth, jobs
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM auth.memberships AS membership
      JOIN auth.users AS app_user ON app_user.id = membership.user_id
     WHERE membership.tenant_id = p_tenant_id
       AND membership.user_id = p_user_id
       AND membership.is_active = true
       AND app_user.is_active = true
  ) THEN
    RAISE EXCEPTION 'active membership required for BOAT RENAEST identity';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION jobs.provision_boat_renaest_identity(
  p_tenant_id uuid,
  p_actor_id uuid,
  p_provisioned_by uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth, jobs
AS $$
BEGIN
  PERFORM jobs.require_active_membership(p_tenant_id, p_actor_id);
  PERFORM jobs.require_active_membership(p_tenant_id, p_provisioned_by);

  INSERT INTO jobs.boat_renaest_identity (
    tenant_id,
    actor_id,
    state,
    provisioned_by,
    updated_at
  )
  VALUES (
    p_tenant_id,
    p_actor_id,
    'active',
    p_provisioned_by,
    clock_timestamp()
  )
  ON CONFLICT (tenant_id) DO UPDATE
    SET actor_id = EXCLUDED.actor_id,
        state = 'active',
        provisioned_at = clock_timestamp(),
        provisioned_by = EXCLUDED.provisioned_by,
        revoked_at = NULL,
        revoked_by = NULL,
        revocation_reason = NULL,
        updated_at = clock_timestamp();

  INSERT INTO jobs.boat_renaest_identity_event (
    tenant_id,
    actor_id,
    action,
    performed_by
  )
  VALUES (p_tenant_id, p_actor_id, 'provisioned', p_provisioned_by);
END;
$$;

CREATE OR REPLACE FUNCTION jobs.revoke_boat_renaest_identity(
  p_tenant_id uuid,
  p_revoked_by uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth, jobs
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  PERFORM jobs.require_active_membership(p_tenant_id, p_revoked_by);

  UPDATE jobs.boat_renaest_identity
     SET state = 'revoked',
         revoked_at = clock_timestamp(),
         revoked_by = p_revoked_by,
         revocation_reason = p_reason,
         updated_at = clock_timestamp()
   WHERE tenant_id = p_tenant_id
     AND state = 'active'
  RETURNING actor_id INTO v_actor_id;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'active BOAT RENAEST identity not found for tenant';
  END IF;

  INSERT INTO jobs.boat_renaest_identity_event (
    tenant_id,
    actor_id,
    action,
    performed_by,
    reason
  )
  VALUES (p_tenant_id, v_actor_id, 'revoked', p_revoked_by, p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION jobs.discover_active_boat_renaest_tenants()
RETURNS TABLE (tenant_id uuid, actor_id uuid, timezone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, auth, jobs
AS $$
  SELECT tenant.id, identity.actor_id, tenant.timezone
    FROM auth.tenants AS tenant
    JOIN jobs.boat_renaest_identity AS identity
      ON identity.tenant_id = tenant.id
    JOIN auth.memberships AS membership
      ON membership.tenant_id = identity.tenant_id
     AND membership.user_id = identity.actor_id
    JOIN auth.users AS app_user ON app_user.id = membership.user_id
   WHERE tenant.state = 'active'
     AND tenant.is_active = true
     AND identity.state = 'active'
     AND membership.is_active = true
     AND app_user.is_active = true
   ORDER BY tenant.id;
$$;

ALTER TABLE jobs.boat_renaest_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs.boat_renaest_identity FORCE ROW LEVEL SECURITY;
ALTER TABLE jobs.boat_renaest_identity_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs.boat_renaest_identity_event FORCE ROW LEVEL SECURITY;
ALTER TABLE jobs.boat_renaest_execution ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs.boat_renaest_execution FORCE ROW LEVEL SECURITY;

SELECT auth.create_rls_policy('jobs', 'boat_renaest_identity');
SELECT auth.create_rls_policy('jobs', 'boat_renaest_identity_event');
SELECT auth.create_rls_policy('jobs', 'boat_renaest_execution');
SELECT auth.install_tenant_triggers();

GRANT USAGE ON SCHEMA jobs TO role_app_backend;
REVOKE ALL ON TABLE jobs.boat_renaest_identity FROM role_app_backend;
REVOKE ALL ON TABLE jobs.boat_renaest_identity_event FROM role_app_backend;
GRANT SELECT, INSERT, UPDATE ON TABLE jobs.boat_renaest_execution TO role_app_backend;
REVOKE ALL ON FUNCTION jobs.require_active_membership(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION jobs.provision_boat_renaest_identity(uuid, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION jobs.revoke_boat_renaest_identity(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION jobs.discover_active_boat_renaest_tenants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION jobs.discover_active_boat_renaest_tenants() TO role_app_backend;
