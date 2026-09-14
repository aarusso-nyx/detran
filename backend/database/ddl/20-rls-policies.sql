SELECT auth.create_rls_policy('tenancy', 'tenant_settings');
SELECT auth.create_rls_policy('auth', 'users');
SELECT auth.create_rls_policy('auth', 'roles');
SELECT auth.create_rls_policy('auth', 'memberships');
SELECT auth.create_rls_policy('auth', 'groups');
SELECT auth.create_rls_policy('auth', 'sessions');
SELECT auth.create_rls_policy('auth', 'sessions_default');
SELECT auth.create_rls_policy('auth', 'invitations');
SELECT auth.create_rls_policy('audit', 'events');
SELECT auth.create_rls_policy('audit', 'events_default');
SELECT auth.create_rls_policy('integration', 'outbox');
SELECT auth.create_rls_policy('integration', 'delivery_attempt');
SELECT auth.create_rls_policy('integration', 'inbox_receipt');
SELECT auth.create_rls_policy('integration', 'idempotency_keys');
SELECT auth.create_rls_policy('integration', 'rate_limit_windows');
SELECT auth.create_rls_policy('integration', 'professional_council_cache');
SELECT auth.create_rls_policy('storage', 'objects');

ALTER TABLE auth.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON auth.tenants;
CREATE POLICY tenant_isolation ON auth.tenants
  USING (id = auth.current_tenant())
  WITH CHECK (id = auth.current_tenant());

SELECT auth.install_tenant_triggers();

GRANT USAGE ON SCHEMA auth, tenancy, audit, storage, integration, inf, est, ch, ops TO role_app_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth, tenancy, storage, integration, inf, est, ch, ops TO role_app_backend;
REVOKE ALL ON TABLE audit.events FROM role_app_backend;
GRANT SELECT ON TABLE audit.events TO role_app_backend;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth, audit, storage, integration, inf, est, ch, ops TO role_app_backend;
REVOKE ALL ON FUNCTION auth.set_current_tenant(uuid) FROM PUBLIC, role_app_backend;
REVOKE ALL ON FUNCTION auth.create_rls_policy(text, text) FROM PUBLIC, role_app_backend;
REVOKE ALL ON FUNCTION auth.install_tenant_triggers() FROM PUBLIC, role_app_backend;
REVOKE ALL ON FUNCTION audit.write(uuid, uuid, text, text, text, uuid, jsonb, inet, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION audit.write(uuid, uuid, text, text, text, uuid, jsonb, inet, uuid, uuid) TO role_app_backend;
REVOKE ALL ON FUNCTION audit.verify_chain(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION audit.verify_chain(uuid) TO role_app_backend, role_auditor_min;
GRANT SELECT ON audit.v_audit_events_min TO role_auditor_min;
