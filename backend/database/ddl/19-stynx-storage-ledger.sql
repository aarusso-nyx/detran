-- D-160.8: fresh-only consumer installation evidence. The installer validates
-- an existing ledger instead of reapplying this file or repairing its catalog.
CREATE TABLE integration.stynx_storage_installations (
  package text NOT NULL,
  identity jsonb NOT NULL,
  installed_by name NOT NULL DEFAULT CURRENT_USER,
  installed_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT stynx_storage_installations_pkey PRIMARY KEY (package),
  CONSTRAINT stynx_storage_installations_identity CHECK (
    jsonb_typeof(identity) = 'object' AND identity->>'package' = package
  ),
  CONSTRAINT stynx_storage_installations_owner CHECK (installed_by = 'postgres'::name)
);
ALTER TABLE integration.stynx_storage_installations OWNER TO postgres;
ALTER TABLE integration.stynx_storage_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_storage_installations FORCE ROW LEVEL SECURITY;

CREATE FUNCTION integration.stynx_storage_installations_immutable()
RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog
AS $ledger$
BEGIN
  RAISE EXCEPTION 'STYNX storage installation evidence is immutable';
END
$ledger$;
ALTER FUNCTION integration.stynx_storage_installations_immutable() OWNER TO postgres;
REVOKE ALL ON FUNCTION integration.stynx_storage_installations_immutable() FROM PUBLIC, role_app_backend, role_auditor_min;
CREATE TRIGGER stynx_storage_installations_immutable
BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_storage_installations
FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_storage_installations_immutable();
ALTER TABLE integration.stynx_storage_installations ENABLE ALWAYS TRIGGER stynx_storage_installations_immutable;
REVOKE ALL ON TABLE integration.stynx_storage_installations FROM PUBLIC, role_app_backend, role_auditor_min;
