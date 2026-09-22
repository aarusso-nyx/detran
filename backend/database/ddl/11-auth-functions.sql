CREATE OR REPLACE FUNCTION auth.current_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('app.tenant_id', true), ''),
    nullif(current_setting('app.current_tenant', true), ''),
    nullif(current_setting('auth.current_tenant', true), ''),
    nullif(current_setting('stynx.current_tenant', true), '')
  )::uuid
$$;

CREATE OR REPLACE FUNCTION auth.set_current_tenant(p_tenant uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth
AS $$
BEGIN
  PERFORM set_config('app.tenant_id', coalesce(p_tenant::text, ''), true);
END
$$;

CREATE OR REPLACE FUNCTION auth.enforce_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected uuid := auth.current_tenant();
BEGIN
  IF expected IS NULL THEN
    IF current_setting('app.role', true) = 'owner' THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Tenant context is required' USING errcode = '42501';
  END IF;
  IF NEW.tenant_id IS NULL THEN NEW.tenant_id := expected; END IF;
  IF NEW.tenant_id <> expected THEN
    RAISE EXCEPTION 'Tenant mismatch (expected % got %)', expected, NEW.tenant_id
      USING errcode = '42501';
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION auth.create_rls_policy(p_schema text, p_table text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  full_name text := format('%I.%I', p_schema, p_table);
BEGIN
  IF to_regclass(full_name) IS NULL THEN RETURN; END IF;
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', full_name);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', full_name);
  EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %s', full_name);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %s USING (tenant_id = auth.current_tenant()) WITH CHECK (tenant_id = auth.current_tenant())',
    full_name
  );
END
$$;

CREATE OR REPLACE FUNCTION auth.install_tenant_triggers()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT
      column_info.table_schema,
      column_info.table_name,
      tenant_column.attnum AS tenant_attnum,
      tenant_trigger.oid AS trigger_oid,
      tenant_trigger.tgfoid AS trigger_function,
      tenant_trigger.tgtype AS trigger_type,
      tenant_trigger.tgenabled AS trigger_enabled,
      tenant_trigger.tgnargs AS trigger_arguments,
      tenant_trigger.tgattr::smallint[] AS trigger_columns,
      tenant_trigger.tgqual AS trigger_when
    FROM information_schema.columns column_info
    JOIN information_schema.tables table_info
      ON table_info.table_schema = column_info.table_schema
     AND table_info.table_name = column_info.table_name
    JOIN pg_namespace table_namespace
      ON table_namespace.nspname = column_info.table_schema
    JOIN pg_class tenant_table
      ON tenant_table.relnamespace = table_namespace.oid
     AND tenant_table.relname = column_info.table_name
    JOIN pg_attribute tenant_column
      ON tenant_column.attrelid = tenant_table.oid
     AND tenant_column.attname = 'tenant_id'
     AND NOT tenant_column.attisdropped
    LEFT JOIN pg_trigger tenant_trigger
      ON tenant_trigger.tgrelid = tenant_table.oid
     AND tenant_trigger.tgname = 'enforce_tenant_id'
     AND NOT tenant_trigger.tgisinternal
    WHERE column_info.column_name = 'tenant_id'
      AND table_info.table_type = 'BASE TABLE'
      AND column_info.table_schema IN ('auth', 'audit', 'storage', 'integration', 'inf', 'est', 'ch', 'ops', 'portal')
      AND NOT EXISTS (
        SELECT 1
        FROM pg_inherits inheritance
        WHERE inheritance.inhrelid = format('%I.%I', column_info.table_schema, column_info.table_name)::regclass
      )
  LOOP
    IF item.trigger_oid IS NULL THEN
      EXECUTE format(
        'CREATE TRIGGER enforce_tenant_id BEFORE INSERT OR UPDATE OF tenant_id ON %I.%I FOR EACH ROW EXECUTE FUNCTION auth.enforce_tenant_id()',
        item.table_schema,
        item.table_name
      );
    ELSIF item.trigger_function <> 'auth.enforce_tenant_id()'::regprocedure::oid
       OR item.trigger_type <> 23
       OR item.trigger_enabled <> 'O'
       OR item.trigger_arguments <> 0
       OR cardinality(item.trigger_columns) <> 1
       OR NOT item.tenant_attnum = ANY(item.trigger_columns)
       OR item.trigger_when IS NOT NULL THEN
      RAISE EXCEPTION 'Existing enforce_tenant_id trigger differs on %.%',
        item.table_schema,
        item.table_name;
    END IF;
  END LOOP;
END
$$;
