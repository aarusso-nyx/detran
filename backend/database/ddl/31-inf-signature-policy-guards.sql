-- R-0022 CTG-0006 A.2/C04: late fixed stage after normal RLS and signed storage 06.
-- No normative trust values are seeded. Repeat these final privileges after every broad generated grant.
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='inf' AND c.relkind IN ('r','p') AND c.relname LIKE '%\_ref' ESCAPE '\'
      AND (c.relrowsecurity OR c.relforcerowsecurity OR EXISTS (
        SELECT FROM pg_catalog.pg_attribute a WHERE a.attrelid=c.oid AND a.attname='tenant_id' AND a.attnum>0 AND NOT a.attisdropped
      ))
  ) THEN RAISE EXCEPTION 'National reference pattern differs; signature floor admission stopped'; END IF;
END $$;
ALTER TABLE inf.signature_policy ALTER COLUMN traffic_agency_id DROP NOT NULL;
DROP INDEX IF EXISTS inf.ux_inf_signature_policy_document_kind;
CREATE UNIQUE INDEX IF NOT EXISTS ux_inf_signature_policy_revision
  ON inf.signature_policy(tenant_id,traffic_agency_id,document_kind,revision) NULLS NOT DISTINCT;


CREATE UNIQUE INDEX IF NOT EXISTS ux_inf_signature_policy_tenant_id_id ON inf.signature_policy(tenant_id,id);
DO $$
DECLARE actual record; tenant_key smallint; identity_key smallint;
BEGIN
  SELECT attnum INTO tenant_key FROM pg_catalog.pg_attribute WHERE attrelid='inf.signature_policy'::regclass AND attname='tenant_id' AND attnotnull AND NOT attisdropped;
  SELECT attnum INTO identity_key FROM pg_catalog.pg_attribute WHERE attrelid='inf.signature_policy'::regclass AND attname='id' AND attnotnull AND NOT attisdropped;
  SELECT i.*,c.relowner,c.relkind,c.relam,c.relpersistence INTO actual FROM pg_catalog.pg_index i
    JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid WHERE c.oid='inf.ux_inf_signature_policy_tenant_id_id'::regclass;
  IF tenant_key IS NULL OR identity_key IS NULL OR actual.indexrelid IS NULL OR
    actual.indrelid <> 'inf.signature_policy'::regclass OR actual.relkind <> 'i' OR
    actual.relowner <> (SELECT oid FROM pg_catalog.pg_roles WHERE rolname='postgres') OR
    actual.relam <> (SELECT oid FROM pg_catalog.pg_am WHERE amname='btree') OR actual.relpersistence <> 'p' OR
    NOT actual.indisunique OR NOT actual.indisvalid OR NOT actual.indisready OR NOT actual.indislive OR NOT actual.indimmediate OR
    actual.indnullsnotdistinct OR actual.indnkeyatts <> 2 OR actual.indnatts <> 2 OR
    actual.indpred IS NOT NULL OR actual.indexprs IS NOT NULL OR
    ARRAY(SELECT unnest(actual.indkey)) IS DISTINCT FROM ARRAY[tenant_key,identity_key]::smallint[] OR
    EXISTS (SELECT FROM unnest(actual.indoption) v WHERE v <> 0) OR
    EXISTS (SELECT FROM unnest(actual.indcollation) v WHERE v <> 0) OR
    EXISTS (SELECT FROM unnest(actual.indclass) op JOIN pg_catalog.pg_opclass c ON c.oid=op WHERE c.opcname <> 'uuid_ops' OR c.opcnamespace <> 'pg_catalog'::regnamespace)
  THEN RAISE EXCEPTION 'Signature same-tenant parent index differs: inf.ux_inf_signature_policy_tenant_id_id'; END IF;
END $$;

CREATE TABLE IF NOT EXISTS inf.signature_policy_floor_ref (
  document_kind varchar(80) PRIMARY KEY,
  minimum_signature_level varchar(20) CHECK (minimum_signature_level IN ('ADVANCED','QUALIFIED')),
  pades_level varchar(40) CHECK (pades_level IN ('NONE','PAdES-B-LT')),
  tsa_required boolean,
  require_lta boolean,
  revocation varchar(20) CHECK (revocation IN ('ocsp','crl','ocsp-or-crl')),
  at_time varchar(30) CHECK (at_time IN ('signing-time','trusted-timestamp')),
  accepted_policies text[],
  trust_anchors_pem text[],
  source_ref text NOT NULL,
  approved_by text,
  approved_at timestamptz
);
CREATE OR REPLACE FUNCTION inf.reject_active_signature_policy_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
  IF OLD.status = 'active' THEN RAISE EXCEPTION 'Active signature policy revisions are immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION inf.reject_active_signature_policy_mutation() FROM PUBLIC,role_app_backend;
DROP TRIGGER IF EXISTS signature_policy_active_immutable ON inf.signature_policy;
CREATE TRIGGER signature_policy_active_immutable BEFORE UPDATE OR DELETE ON inf.signature_policy
FOR EACH ROW EXECUTE FUNCTION inf.reject_active_signature_policy_mutation();
ALTER TABLE inf.signature_policy ENABLE ALWAYS TRIGGER signature_policy_active_immutable;
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_constraint WHERE conrelid='storage.signature_evidence'::regclass AND conname='signature_evidence_policy_fk') THEN
    ALTER TABLE storage.signature_evidence ADD CONSTRAINT signature_evidence_policy_fk
      FOREIGN KEY (signature_policy_id) REFERENCES inf.signature_policy(id);
  END IF;
END $$;


DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_constraint WHERE conrelid='storage.signature_evidence'::regclass AND conname='signature_evidence_policy_tenant_fk') THEN
    ALTER TABLE storage.signature_evidence ADD CONSTRAINT signature_evidence_policy_tenant_fk
      FOREIGN KEY (tenant_id,signature_policy_id) REFERENCES inf.signature_policy(tenant_id,id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE;
  END IF;
END $$;

DO $$
DECLARE expected record; actual record; local_keys smallint[]; parent_keys smallint[];
BEGIN
  FOR expected IN SELECT * FROM (VALUES
    ('signature_evidence_policy_tenant_fk','storage.signature_evidence','signature_policy_id','inf.signature_policy','inf.ux_inf_signature_policy_tenant_id_id')
  ) AS definitions(constraint_name,child_table,identity_column,parent_table,parent_index)
  LOOP
    SELECT ARRAY[a.attnum,b.attnum] INTO local_keys FROM pg_catalog.pg_attribute a,pg_catalog.pg_attribute b
      WHERE a.attrelid=expected.child_table::regclass AND a.attname='tenant_id' AND a.attnotnull AND NOT a.attisdropped
        AND b.attrelid=a.attrelid AND b.attname=expected.identity_column AND b.attnotnull AND NOT b.attisdropped;
    SELECT ARRAY[a.attnum,b.attnum] INTO parent_keys FROM pg_catalog.pg_attribute a,pg_catalog.pg_attribute b
      WHERE a.attrelid=expected.parent_table::regclass AND a.attname='tenant_id' AND a.attnotnull AND NOT a.attisdropped
        AND b.attrelid=a.attrelid AND b.attname='id' AND b.attnotnull AND NOT b.attisdropped;
    SELECT * INTO actual FROM pg_catalog.pg_constraint WHERE conrelid=expected.child_table::regclass AND conname=expected.constraint_name;
    IF local_keys IS NULL OR parent_keys IS NULL OR actual.oid IS NULL OR actual.contype <> 'f' OR
      actual.conrelid <> expected.child_table::regclass OR actual.confrelid <> expected.parent_table::regclass OR
      actual.conkey IS DISTINCT FROM local_keys OR actual.confkey IS DISTINCT FROM parent_keys OR
      actual.conindid <> expected.parent_index::regclass OR NOT actual.convalidated OR NOT actual.conenforced OR
      actual.condeferrable OR actual.condeferred OR actual.confmatchtype <> 's' OR actual.confupdtype <> 'a' OR actual.confdeltype <> 'a'
    THEN RAISE EXCEPTION 'Signature same-tenant foreign key differs: %',expected.constraint_name; END IF;
  END LOOP;
END $$;

-- A validated FK is not enforcement evidence when one of its internal RI triggers is disabled.
DO $$
DECLARE ri_divergent boolean;
BEGIN
  IF current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'Signature foreign keys require origin constraint enforcement';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_constraint c WHERE
    (c.conrelid,c.conname) IN (
      ('storage.signature_evidence'::regclass,'signature_evidence_original_object_tenant_fk'),
      ('storage.signature_evidence'::regclass,'signature_evidence_signed_object_tenant_fk'),
      ('storage.signature_manifest'::regclass,'signature_manifest_source_object_tenant_fk'),
      ('storage.signature_evidence'::regclass,'signature_evidence_policy_tenant_fk')
    ) AND c.contype='f') <> 4
  THEN RAISE EXCEPTION 'Signature tenant foreign key inventory differs'; END IF;
  WITH admitted_fks AS (
    SELECT c.* FROM pg_catalog.pg_constraint c WHERE
      (c.conrelid,c.conname) IN (
        ('storage.signature_evidence'::regclass,'signature_evidence_original_object_tenant_fk'),
        ('storage.signature_evidence'::regclass,'signature_evidence_signed_object_tenant_fk'),
        ('storage.signature_manifest'::regclass,'signature_manifest_source_object_tenant_fk'),
        ('storage.signature_evidence'::regclass,'signature_evidence_policy_tenant_fk')
      ) AND c.contype='f'
  ), expected_ri AS (
    SELECT c.oid AS constraint_oid,c.conindid AS index_oid,
      e.relation_oid,e.opposite_relation_oid,e.event_type,
      to_regprocedure(format('pg_catalog.%I()',e.function_name))::oid AS function_oid
    FROM admitted_fks c CROSS JOIN LATERAL (VALUES
      (c.conrelid,c.confrelid,5,'RI_FKey_check_ins'),
      (c.conrelid,c.confrelid,17,'RI_FKey_check_upd'),
      (c.confrelid,c.conrelid,9,'RI_FKey_noaction_del'),
      (c.confrelid,c.conrelid,17,'RI_FKey_noaction_upd')
    ) e(relation_oid,opposite_relation_oid,event_type,function_name)
  ), actual_ri AS (
    SELECT t.tgconstraint AS constraint_oid,t.tgconstrindid AS index_oid,
      t.tgrelid AS relation_oid,t.tgconstrrelid AS opposite_relation_oid,
      t.tgtype::integer AS event_type,t.tgfoid AS function_oid
    FROM admitted_fks c JOIN pg_catalog.pg_trigger t ON t.tgconstraint=c.oid
  )
  SELECT EXISTS (
    (SELECT * FROM expected_ri EXCEPT ALL SELECT * FROM actual_ri)
    UNION ALL
    (SELECT * FROM actual_ri EXCEPT ALL SELECT * FROM expected_ri)
  ) INTO ri_divergent;
  IF ri_divergent OR EXISTS (
    SELECT FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_constraint c ON c.oid=t.tgconstraint
      WHERE (c.conrelid,c.conname) IN (
        ('storage.signature_evidence'::regclass,'signature_evidence_original_object_tenant_fk'),
        ('storage.signature_evidence'::regclass,'signature_evidence_signed_object_tenant_fk'),
        ('storage.signature_manifest'::regclass,'signature_manifest_source_object_tenant_fk'),
        ('storage.signature_evidence'::regclass,'signature_evidence_policy_tenant_fk')
      ) AND (
        NOT t.tgisinternal OR t.tgenabled <> 'O' OR t.tgdeferrable OR t.tginitdeferred OR
        t.tgconstrindid IS DISTINCT FROM c.conindid OR t.tgqual IS NOT NULL OR
        t.tgnargs <> 0 OR t.tgattr <> ''::int2vector OR t.tgargs <> ''::bytea OR t.tgparentid <> 0 OR
        t.tgoldtable IS NOT NULL OR t.tgnewtable IS NOT NULL
      )
  ) THEN RAISE EXCEPTION 'Signature exact RI trigger pairing/enforcement differs'; END IF;
END $$;

-- Final ACL maintenance: table grants override column revokes, so remove them first.
REVOKE ALL ON inf.signature_policy_floor_ref FROM PUBLIC,role_app_backend;
GRANT SELECT ON inf.signature_policy_floor_ref TO role_app_backend;
REVOKE INSERT,UPDATE ON inf.signature_policy FROM PUBLIC,role_app_backend;
GRANT INSERT (traffic_agency_id,document_kind,required_signers_json,pades_level,tsa_required,pdfa_required,govbr_level,
  valid_from,valid_to,minimum_signature_level,require_lta,revocation,at_time,accepted_policies,trust_anchors_pem,source_ref)
  ON inf.signature_policy TO role_app_backend;
GRANT UPDATE (traffic_agency_id,document_kind,required_signers_json,pades_level,tsa_required,pdfa_required,govbr_level,
  valid_from,valid_to,minimum_signature_level,require_lta,revocation,at_time,accepted_policies,trust_anchors_pem,source_ref,updated_at)
  ON inf.signature_policy TO role_app_backend;
REVOKE ALL ON storage.signature_evidence,storage.signature_manifest FROM PUBLIC,role_app_backend;
GRANT SELECT,INSERT ON storage.signature_evidence,storage.signature_manifest TO role_app_backend;
REVOKE ALL ON FUNCTION storage.reject_signed_document_mutation(),inf.reject_active_signature_policy_mutation() FROM PUBLIC,role_app_backend;

DO $$
DECLARE candidate record; protected_column text; expected record; actual_function record; function_definition text;
BEGIN
  FOR expected IN SELECT * FROM (VALUES
    ('storage','reject_signed_document_mutation',E'\nBEGIN\n  RAISE EXCEPTION ''Signed document evidence is immutable'';\nEND '),
    ('inf','reject_active_signature_policy_mutation',E'\nBEGIN\n  IF OLD.status = ''active'' THEN RAISE EXCEPTION ''Active signature policy revisions are immutable''; END IF;\n  IF TG_OP = ''DELETE'' THEN RETURN OLD; END IF;\n  RETURN NEW;\nEND ')
  ) AS definitions(schema_name,function_name,source_body)
  LOOP
    SELECT p.* INTO actual_function FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname=expected.schema_name AND p.proname=expected.function_name AND p.pronargs=0;
    function_definition := pg_catalog.pg_get_functiondef(actual_function.oid);
    IF actual_function.oid IS NULL OR actual_function.proowner <> (SELECT oid FROM pg_catalog.pg_roles WHERE rolname='postgres') OR
      actual_function.prosecdef OR actual_function.proleakproof OR actual_function.proretset OR actual_function.proisstrict OR
      actual_function.prokind <> 'f' OR actual_function.provolatile <> 'v' OR actual_function.prorettype <> 'pg_catalog.trigger'::regtype OR
      actual_function.prolang <> (SELECT oid FROM pg_catalog.pg_language WHERE lanname='plpgsql') OR
      actual_function.proconfig IS DISTINCT FROM ARRAY['search_path=pg_catalog, public']::text[] OR
      actual_function.prosrc IS DISTINCT FROM expected.source_body OR function_definition IS NULL OR
      function_definition NOT LIKE 'CREATE OR REPLACE FUNCTION ' || expected.schema_name || '.' || expected.function_name || '()%'
    THEN RAISE EXCEPTION 'Signature immutable function owner/body/catalog differs'; END IF;
    IF (SELECT count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname=expected.schema_name AND p.proname=expected.function_name) <> 1
    THEN RAISE EXCEPTION 'Signature immutable function overload differs'; END IF;
  END LOOP;
  -- Include SET-reachable NOINHERIT roles as well as effective inherited/PUBLIC ACLs.
  FOR candidate IN SELECT r.* FROM pg_catalog.pg_roles r
    WHERE r.rolname='role_app_backend' OR pg_catalog.pg_has_role('role_app_backend',r.oid,'SET')
  LOOP
    IF candidate.rolsuper OR candidate.rolbypassrls OR candidate.rolcreaterole OR candidate.rolcreatedb OR candidate.rolreplication OR
      pg_catalog.has_schema_privilege(candidate.oid,'storage','CREATE') OR pg_catalog.has_schema_privilege(candidate.oid,'inf','CREATE') OR
      pg_catalog.has_table_privilege(candidate.oid,'inf.signature_policy_floor_ref','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') OR
      pg_catalog.has_table_privilege(candidate.oid,'storage.signature_evidence','UPDATE,DELETE,TRUNCATE,TRIGGER') OR
      pg_catalog.has_table_privilege(candidate.oid,'storage.signature_manifest','UPDATE,DELETE,TRUNCATE,TRIGGER') OR
      pg_catalog.has_any_column_privilege(candidate.oid,'inf.signature_policy_floor_ref','INSERT,UPDATE') OR
      pg_catalog.has_any_column_privilege(candidate.oid,'storage.signature_evidence','UPDATE') OR
      pg_catalog.has_any_column_privilege(candidate.oid,'storage.signature_manifest','UPDATE') OR
      pg_catalog.has_function_privilege(candidate.oid,'storage.reject_signed_document_mutation()','EXECUTE') OR
      pg_catalog.has_function_privilege(candidate.oid,'inf.reject_active_signature_policy_mutation()','EXECUTE') OR
      EXISTS (SELECT FROM pg_catalog.pg_proc WHERE oid IN ('storage.reject_signed_document_mutation()'::regprocedure,
        'inf.reject_active_signature_policy_mutation()'::regprocedure) AND proowner=candidate.oid) OR
      EXISTS (SELECT FROM pg_catalog.pg_class WHERE oid IN ('inf.signature_policy'::regclass,'inf.signature_policy_floor_ref'::regclass,
        'storage.signature_evidence'::regclass,'storage.signature_manifest'::regclass) AND relowner=candidate.oid)
    THEN RAISE EXCEPTION 'Application reachable role has signature mutation authority'; END IF;
    FOREACH protected_column IN ARRAY ARRAY['status','revision','approved_by','approved_at','id','tenant_id','created_at']
    LOOP
      IF pg_catalog.has_column_privilege(candidate.oid,'inf.signature_policy',protected_column,'INSERT,UPDATE')
      THEN RAISE EXCEPTION 'Application reachable role can set protected signature policy fields'; END IF;
    END LOOP;
  END LOOP;
END $$;
