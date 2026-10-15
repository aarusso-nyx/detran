-- R-0022 CTG-0006 A.1: execute AFTER normal 20 RLS and normative 30, never lexically at 06.
-- No signed-byte trust or policy approval is manufactured by this schema.
DO $$
BEGIN
  IF current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'Signature storage requires origin constraint enforcement';
  END IF;
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='storage' AND c.relname='objects' AND c.relkind='r'
      AND c.relrowsecurity AND c.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'Signed storage requires existing ENABLE and FORCE RLS on storage.objects';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION storage.reject_signed_document_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
  RAISE EXCEPTION 'Signed document evidence is immutable';
END $$;
REVOKE ALL ON FUNCTION storage.reject_signed_document_mutation() FROM PUBLIC, role_app_backend;

DROP TRIGGER IF EXISTS signed_documents_immutable ON storage.objects;
CREATE TRIGGER signed_documents_immutable BEFORE UPDATE OR DELETE ON storage.objects
FOR EACH ROW WHEN (OLD.collection = 'signed-documents')
EXECUTE FUNCTION storage.reject_signed_document_mutation();
ALTER TABLE storage.objects ENABLE ALWAYS TRIGGER signed_documents_immutable;


CREATE UNIQUE INDEX IF NOT EXISTS ux_storage_objects_tenant_id_id ON storage.objects(tenant_id,id);
DO $$
DECLARE actual record; tenant_key smallint; identity_key smallint;
BEGIN
  SELECT attnum INTO tenant_key FROM pg_catalog.pg_attribute WHERE attrelid='storage.objects'::regclass AND attname='tenant_id' AND attnotnull AND NOT attisdropped;
  SELECT attnum INTO identity_key FROM pg_catalog.pg_attribute WHERE attrelid='storage.objects'::regclass AND attname='id' AND attnotnull AND NOT attisdropped;
  SELECT i.*,c.relowner,c.relkind,c.relam,c.relpersistence INTO actual FROM pg_catalog.pg_index i
    JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid WHERE c.oid='storage.ux_storage_objects_tenant_id_id'::regclass;
  IF tenant_key IS NULL OR identity_key IS NULL OR actual.indexrelid IS NULL OR
    actual.indrelid <> 'storage.objects'::regclass OR actual.relkind <> 'i' OR
    actual.relowner <> (SELECT oid FROM pg_catalog.pg_roles WHERE rolname='postgres') OR
    actual.relam <> (SELECT oid FROM pg_catalog.pg_am WHERE amname='btree') OR actual.relpersistence <> 'p' OR
    NOT actual.indisunique OR NOT actual.indisvalid OR NOT actual.indisready OR NOT actual.indislive OR NOT actual.indimmediate OR
    actual.indnullsnotdistinct OR actual.indnkeyatts <> 2 OR actual.indnatts <> 2 OR
    actual.indpred IS NOT NULL OR actual.indexprs IS NOT NULL OR
    ARRAY(SELECT unnest(actual.indkey)) IS DISTINCT FROM ARRAY[tenant_key,identity_key]::smallint[] OR
    EXISTS (SELECT FROM unnest(actual.indoption) v WHERE v <> 0) OR
    EXISTS (SELECT FROM unnest(actual.indcollation) v WHERE v <> 0) OR
    EXISTS (SELECT FROM unnest(actual.indclass) op JOIN pg_catalog.pg_opclass c ON c.oid=op WHERE c.opcname <> 'uuid_ops' OR c.opcnamespace <> 'pg_catalog'::regnamespace)
  THEN RAISE EXCEPTION 'Signature same-tenant parent index differs: storage.ux_storage_objects_tenant_id_id'; END IF;
END $$;

CREATE TABLE IF NOT EXISTS storage.signature_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id),
  document_id text NOT NULL,
  document_kind varchar(80) NOT NULL,
  signer_id text NOT NULL,
  original_object_id uuid NOT NULL REFERENCES storage.objects(id),
  signed_object_id uuid NOT NULL UNIQUE REFERENCES storage.objects(id),
  cms_signature bytea NOT NULL,
  cms_sha256 varchar(64) NOT NULL CHECK (cms_sha256 ~ '^[0-9a-f]{64}$'),
  original_document_sha256 varchar(64) NOT NULL CHECK (original_document_sha256 ~ '^[0-9a-f]{64}$'),
  signed_document_sha256 varchar(64) NOT NULL CHECK (signed_document_sha256 ~ '^[0-9a-f]{64}$'),
  signer_certificate_sha256 varchar(64) NOT NULL CHECK (signer_certificate_sha256 ~ '^[0-9a-f]{64}$'),
  signer_certificate_pem text NOT NULL,
  signature_policy_id uuid NOT NULL,
  trust_profile_revision text NOT NULL,
  verifier_kind varchar(20) NOT NULL CHECK (verifier_kind IN ('stynx-cms')),
  achieved_level varchar(20) NOT NULL CHECK (achieved_level IN ('ADVANCED','QUALIFIED')),
  pades_profile varchar(40) NOT NULL CHECK (pades_profile IN ('PAdES-B-T','PAdES-B-LT','PAdES-B-LTA')),
  revocation_source varchar(20) NOT NULL CHECK (revocation_source IN ('ocsp','crl')),
  signed_at timestamptz NOT NULL,
  tsa_at timestamptz NOT NULL,
  certificate_validated_at timestamptz NOT NULL,
  verification_ref text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS storage.signature_manifest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.tenants(id),
  kind text NOT NULL CHECK (kind IN ('session-minutes','batch-minutes')),
  aggregate_id text NOT NULL,
  document_id text NOT NULL,
  source_object_id uuid NOT NULL REFERENCES storage.objects(id),
  snapshot bytea NOT NULL,
  snapshot_sha256 varchar(64) NOT NULL CHECK (snapshot_sha256 ~ '^[0-9a-f]{64}$'),
  manifest_sha256 varchar(64) NOT NULL CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  signer_count integer NOT NULL CHECK (signer_count >= 0),
  manifest_json jsonb NOT NULL CHECK ((manifest_json->>'tenantId' = tenant_id::text) IS TRUE),
  idempotency_key text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK ((jsonb_typeof(manifest_json->'signers') = 'array') IS TRUE),
  CHECK ((jsonb_array_length(manifest_json->'signers') = signer_count) IS TRUE),
  UNIQUE (tenant_id,kind,aggregate_id,document_id,signer_count)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_signature_manifest_idempotency
  ON storage.signature_manifest(tenant_id,idempotency_key) WHERE idempotency_key IS NOT NULL;


DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_constraint WHERE conrelid='storage.signature_evidence'::regclass AND conname='signature_evidence_original_object_tenant_fk') THEN
    ALTER TABLE storage.signature_evidence ADD CONSTRAINT signature_evidence_original_object_tenant_fk
      FOREIGN KEY (tenant_id,original_object_id) REFERENCES storage.objects(tenant_id,id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_constraint WHERE conrelid='storage.signature_evidence'::regclass AND conname='signature_evidence_signed_object_tenant_fk') THEN
    ALTER TABLE storage.signature_evidence ADD CONSTRAINT signature_evidence_signed_object_tenant_fk
      FOREIGN KEY (tenant_id,signed_object_id) REFERENCES storage.objects(tenant_id,id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_constraint WHERE conrelid='storage.signature_manifest'::regclass AND conname='signature_manifest_source_object_tenant_fk') THEN
    ALTER TABLE storage.signature_manifest ADD CONSTRAINT signature_manifest_source_object_tenant_fk
      FOREIGN KEY (tenant_id,source_object_id) REFERENCES storage.objects(tenant_id,id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE;
  END IF;
END $$;

DO $$
DECLARE expected record; actual record; local_keys smallint[]; parent_keys smallint[];
BEGIN
  FOR expected IN SELECT * FROM (VALUES
    ('signature_evidence_original_object_tenant_fk','storage.signature_evidence','original_object_id','storage.objects','storage.ux_storage_objects_tenant_id_id'),
    ('signature_evidence_signed_object_tenant_fk','storage.signature_evidence','signed_object_id','storage.objects','storage.ux_storage_objects_tenant_id_id'),
    ('signature_manifest_source_object_tenant_fk','storage.signature_manifest','source_object_id','storage.objects','storage.ux_storage_objects_tenant_id_id')
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

SELECT auth.create_rls_policy('storage', 'signature_evidence');
SELECT auth.create_rls_policy('storage', 'signature_manifest');
SELECT auth.install_tenant_triggers();
DROP TRIGGER IF EXISTS signature_evidence_immutable ON storage.signature_evidence;
CREATE TRIGGER signature_evidence_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON storage.signature_evidence
FOR EACH STATEMENT EXECUTE FUNCTION storage.reject_signed_document_mutation();
ALTER TABLE storage.signature_evidence ENABLE ALWAYS TRIGGER signature_evidence_immutable;
DROP TRIGGER IF EXISTS signature_manifest_immutable ON storage.signature_manifest;
CREATE TRIGGER signature_manifest_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON storage.signature_manifest
FOR EACH STATEMENT EXECUTE FUNCTION storage.reject_signed_document_mutation();
ALTER TABLE storage.signature_manifest ENABLE ALWAYS TRIGGER signature_manifest_immutable;
GRANT USAGE ON SCHEMA storage TO role_app_backend;
REVOKE ALL ON storage.signature_evidence,storage.signature_manifest FROM PUBLIC,role_app_backend;
GRANT SELECT, INSERT ON storage.signature_evidence,storage.signature_manifest TO role_app_backend;
