-- CTG-0001-C4-OD V3. Last file of the same transaction; no success before COMMIT.
DO $verify$
DECLARE relation text; r record; f record; expected_name text;
BEGIN
  IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Unexpected DDL owner'; END IF;
  IF NOT has_database_privilege('role_rait_priority_writer',current_database(),'TEMP') THEN
    RAISE EXCEPTION 'Priority writer needs database TEMP privilege';
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname='role_rait_priority_writer'
    AND (rolcanlogin OR rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication))
    OR EXISTS (SELECT FROM pg_auth_members WHERE roleid='role_rait_priority_writer'::regrole
      OR member='role_rait_priority_writer'::regrole) THEN
    RAISE EXCEPTION 'Priority writer role is unsafe';
  END IF;
  FOREACH relation IN ARRAY ARRAY['rait_case','rait_document','rait_priority_assessment','rait_priority_basis'] LOOP
    SELECT * INTO STRICT r FROM pg_class WHERE oid=to_regclass('inf.'||relation);
    IF NOT r.relrowsecurity OR NOT r.relforcerowsecurity OR r.relowner <> 'postgres'::regrole
      OR r.relkind <> 'r' THEN RAISE EXCEPTION 'RLS/owner/shape mismatch: %',relation; END IF;
    IF NOT EXISTS (SELECT FROM pg_policy WHERE polrelid=r.oid AND polname='tenant_isolation'
      AND polcmd='*' AND polqual IS NOT NULL AND polwithcheck IS NOT NULL)
      OR NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid=r.oid AND tgname='enforce_tenant_id' AND tgenabled='O') THEN
      RAISE EXCEPTION 'Tenant policy/trigger missing: %',relation;
    END IF;
    IF relation IN ('rait_priority_assessment','rait_priority_basis') THEN
      IF NOT has_table_privilege('role_app_backend',r.oid,'SELECT')
        OR has_table_privilege('role_app_backend',r.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
        OR NOT has_table_privilege('role_rait_priority_writer',r.oid,'INSERT')
        OR has_table_privilege('role_rait_priority_writer',r.oid,'UPDATE,DELETE,TRUNCATE,TRIGGER')
        OR EXISTS (SELECT FROM aclexplode(coalesce(r.relacl,acldefault('r',r.relowner))) a
          WHERE a.grantee NOT IN (r.relowner,'role_rait_priority_writer'::regrole)
            AND a.privilege_type <> 'SELECT') THEN
        RAISE EXCEPTION 'Priority write privileges are not restricted: %',relation;
      END IF;
      FOREACH expected_name IN ARRAY ARRAY['rait_priority_immutable','rait_priority_no_truncate','rait_priority_complete'] LOOP
        IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid=r.oid AND tgname=expected_name AND tgenabled='O'
          AND (expected_name<>'rait_priority_complete' OR (tgdeferrable AND tginitdeferred))) THEN
          RAISE EXCEPTION 'Missing history protection %.%',relation,expected_name;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  FOREACH expected_name IN ARRAY ARRAY['rait_priority_case_guard','rait_priority_mark_insert','rait_priority_case_complete'] LOOP
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid='inf.rait_case'::regclass AND tgname=expected_name
      AND tgenabled='O' AND (expected_name<>'rait_priority_case_complete' OR (tgdeferrable AND tginitdeferred))) THEN
      RAISE EXCEPTION 'Missing case protection %',expected_name;
    END IF;
  END LOOP;
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid='inf.rait_document'::regclass
    AND tgname='rait_priority_document_guard' AND tgenabled='O') THEN RAISE EXCEPTION 'Missing document protection'; END IF;
  FOR f IN SELECT p.*, p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='inf' AND p.proname IN ('rait_record_initial_priority','rait_priority_mark_insert',
      'rait_priority_document_guard','rait_priority_consistency') LOOP
    IF NOT f.prosecdef OR f.proowner <> 'role_rait_priority_writer'::regrole
      OR f.proconfig IS DISTINCT FROM ARRAY['search_path=pg_catalog, inf']::text[]
      OR EXISTS (SELECT FROM aclexplode(coalesce(f.proacl,acldefault('f',f.proowner))) a
        WHERE a.grantee=0 AND a.privilege_type='EXECUTE') THEN
      RAISE EXCEPTION 'Unsafe priority function %',f.signature;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='inf' AND p.proname='rait_record_initial_priority') <> 1
    OR NOT has_function_privilege('role_app_backend','inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'Initial writer function absent, overloaded or inaccessible';
  END IF;
  IF EXISTS (SELECT FROM pg_constraint WHERE conrelid IN ('inf.rait_priority_assessment'::regclass,
    'inf.rait_priority_basis'::regclass) AND NOT convalidated) THEN RAISE EXCEPTION 'Unvalidated priority constraint'; END IF;
  FOREACH expected_name IN ARRAY ARRAY['ux_inf_rait_case_tenant_id','ux_inf_rait_document_case_id',
    'ux_inf_rait_priority_assessment_revision','ux_inf_rait_priority_assessment_case_id','ux_inf_rait_priority_basis_evidence'] LOOP
    IF NOT EXISTS (SELECT FROM pg_index WHERE indexrelid=to_regclass('inf.'||expected_name)
      AND indisunique AND indisvalid AND indisready) THEN RAISE EXCEPTION 'Missing valid unique index %',expected_name; END IF;
  END LOOP;
END
$verify$;
