-- B8 candidate only: no apply inventory or execution authority follows from this file.
-- Original stynx_storage_installations DDL/rows remain unchanged.
DO $custody_owner$
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
    OR current_setting('row_security') <> 'on'
    OR current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'STYNX custody creation requires real owner and ordinary semantics';
  END IF;
END $custody_owner$;

CREATE TABLE integration.stynx_offline_baseline_custody (
  baseline_id text PRIMARY KEY CHECK (baseline_id ~ '^sha256:[0-9a-f]{64}$'),
  package text NOT NULL CHECK (package = '@stynx-nyx/offline-sync'),
  prior_package_version text NOT NULL CHECK (prior_package_version = '1.6.0'),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  subject_digest text NOT NULL CHECK (subject_digest ~ '^sha256:[0-9a-f]{64}$'),
  fresh_receipt_digest text NOT NULL CHECK (fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  covered_prefix_length integer NOT NULL CHECK (covered_prefix_length = 8),
  last_covered_source text NOT NULL
    CHECK (last_covered_source = 'packages/offline-sync/migrations/0008_import_receipts.sql'),
  projected_prefix_digest text NOT NULL CHECK (projected_prefix_digest ~ '^sha256:[0-9a-f]{64}$'),
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  admitted_by name NOT NULL DEFAULT CURRENT_USER CHECK (admitted_by = 'postgres'::name),
  admitted_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(admitted_at)),
  CONSTRAINT stynx_offline_baseline_fresh_fk FOREIGN KEY (package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_baseline_identity_uq
    UNIQUE (subject_digest, package, fresh_receipt_digest, target_publication_digest),
  CONSTRAINT stynx_offline_baseline_chain_uq
    UNIQUE (baseline_id, package, binding_digest, covered_prefix_length),
  CONSTRAINT stynx_offline_baseline_release_uq
    UNIQUE (baseline_id, package, binding_digest, target_publication_digest)
);

CREATE TABLE integration.stynx_offline_forward_receipts (
  receipt_id text PRIMARY KEY CHECK (receipt_id ~ '^sha256:[0-9a-f]{64}$'),
  baseline_id text NOT NULL,
  package text NOT NULL CHECK (package = '@stynx-nyx/offline-sync'),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  ordinal integer NOT NULL CHECK (ordinal >= 9),
  source_path text NOT NULL CHECK (length(source_path) > 0),
  raw_source_digest text NOT NULL CHECK (raw_source_digest ~ '^sha256:[0-9a-f]{64}$'),
  bound_sql_digest text NOT NULL CHECK (bound_sql_digest ~ '^sha256:[0-9a-f]{64}$'),
  predecessor_baseline_id text,
  predecessor_receipt_id text,
  predecessor_ordinal integer NOT NULL,
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  executed_by name NOT NULL DEFAULT CURRENT_USER CHECK (executed_by = 'postgres'::name),
  executed_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(executed_at)),
  CONSTRAINT stynx_offline_forward_release_fk
    FOREIGN KEY (baseline_id, package, binding_digest, target_publication_digest)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id, package, binding_digest, target_publication_digest) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_forward_ordinal_uq UNIQUE (baseline_id, ordinal),
  CONSTRAINT stynx_offline_forward_package_ordinal_uq UNIQUE (package, ordinal),
  CONSTRAINT stynx_offline_forward_source_uq UNIQUE (baseline_id, source_path),
  CONSTRAINT stynx_offline_forward_chain_uq
    UNIQUE (receipt_id, baseline_id, package, binding_digest, ordinal),
  CONSTRAINT stynx_offline_forward_predecessor_ck CHECK (
    (ordinal = 9 AND predecessor_baseline_id IS NOT NULL
      AND predecessor_baseline_id = baseline_id
      AND predecessor_receipt_id IS NULL AND predecessor_ordinal = 8)
    OR (ordinal > 9 AND predecessor_baseline_id IS NULL
      AND predecessor_receipt_id IS NOT NULL AND predecessor_ordinal = ordinal - 1)
  ),
  CONSTRAINT stynx_offline_forward_baseline_predecessor_fk
    FOREIGN KEY (predecessor_baseline_id, package, binding_digest, predecessor_ordinal)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id, package, binding_digest, covered_prefix_length) ON DELETE RESTRICT,
  CONSTRAINT stynx_offline_forward_receipt_predecessor_fk
    FOREIGN KEY (predecessor_receipt_id, baseline_id, package, binding_digest, predecessor_ordinal)
    REFERENCES integration.stynx_offline_forward_receipts
      (receipt_id, baseline_id, package, binding_digest, ordinal) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX stynx_offline_forward_baseline_successor_uq
  ON integration.stynx_offline_forward_receipts(predecessor_baseline_id)
  WHERE predecessor_baseline_id IS NOT NULL;
CREATE UNIQUE INDEX stynx_offline_forward_receipt_successor_uq
  ON integration.stynx_offline_forward_receipts(predecessor_receipt_id)
  WHERE predecessor_receipt_id IS NOT NULL;

CREATE FUNCTION integration.stynx_offline_custody_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $guard$
BEGIN
  RAISE EXCEPTION 'Offline custody and forward receipts are immutable';
END;
$guard$;
CREATE TRIGGER stynx_offline_baseline_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_offline_baseline_custody
  FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_offline_custody_immutable();
CREATE TRIGGER stynx_offline_forward_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_offline_forward_receipts
  FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_offline_custody_immutable();
ALTER TABLE integration.stynx_offline_baseline_custody
  ENABLE ALWAYS TRIGGER stynx_offline_baseline_immutable;
ALTER TABLE integration.stynx_offline_forward_receipts
  ENABLE ALWAYS TRIGGER stynx_offline_forward_immutable;
ALTER TABLE integration.stynx_offline_baseline_custody OWNER TO postgres;
ALTER TABLE integration.stynx_offline_forward_receipts OWNER TO postgres;
ALTER FUNCTION integration.stynx_offline_custody_immutable() OWNER TO postgres;
ALTER TABLE integration.stynx_offline_baseline_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_baseline_custody FORCE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_forward_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_offline_forward_receipts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON integration.stynx_offline_baseline_custody,
  integration.stynx_offline_forward_receipts FROM PUBLIC, role_app_backend, role_auditor_min;
REVOKE ALL ON FUNCTION integration.stynx_offline_custody_immutable()
  FROM PUBLIC, role_app_backend, role_auditor_min;

CREATE TABLE integration.stynx_storage_target_admissions (
  admission_id text PRIMARY KEY CHECK (admission_id ~ '^sha256:[0-9a-f]{64}$'),
  mode text NOT NULL CHECK (mode IN ('fresh-1.6.1','upgrade-fresh-1.6.0')),
  target_package_version text NOT NULL CHECK (target_package_version = '1.6.1'),
  fresh_package_version text NOT NULL CHECK (fresh_package_version IN ('1.6.0','1.6.1')),
  subject_digest text NOT NULL CHECK (subject_digest ~ '^sha256:[0-9a-f]{64}$'),
  target_publication_digest text NOT NULL CHECK (target_publication_digest ~ '^sha256:[0-9a-f]{64}$'),
  binding_digest text NOT NULL CHECK (binding_digest ~ '^sha256:[0-9a-f]{64}$'),
  outbox_package text NOT NULL CHECK (outbox_package = '@stynx-nyx/outbox'),
  offline_package text NOT NULL CHECK (offline_package = '@stynx-nyx/offline-sync'),
  outbox_fresh_receipt_digest text NOT NULL CHECK (outbox_fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  offline_fresh_receipt_digest text NOT NULL CHECK (offline_fresh_receipt_digest ~ '^sha256:[0-9a-f]{64}$'),
  offline_baseline_id text,
  offline_forward_receipt_id text,
  offline_last_ordinal integer,
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  admitted_by name NOT NULL DEFAULT CURRENT_USER CHECK (admitted_by = 'postgres'::name),
  admitted_at timestamptz NOT NULL DEFAULT transaction_timestamp() CHECK (isfinite(admitted_at)),
  CONSTRAINT stynx_target_version_uq UNIQUE (target_package_version),
  CONSTRAINT stynx_target_outbox_fresh_fk FOREIGN KEY (outbox_package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_offline_fresh_fk FOREIGN KEY (offline_package)
    REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_mode_ck CHECK (
    (mode = 'fresh-1.6.1' AND fresh_package_version = '1.6.1'
      AND offline_baseline_id IS NULL AND offline_forward_receipt_id IS NULL
      AND offline_last_ordinal IS NULL)
    OR
    (mode = 'upgrade-fresh-1.6.0' AND fresh_package_version = '1.6.0'
      AND offline_baseline_id IS NOT NULL AND offline_forward_receipt_id IS NOT NULL
      AND offline_last_ordinal IS NOT NULL AND offline_last_ordinal = 9)
  ),
  CONSTRAINT stynx_target_baseline_fk
    FOREIGN KEY (offline_baseline_id,offline_package,binding_digest,target_publication_digest)
    REFERENCES integration.stynx_offline_baseline_custody
      (baseline_id,package,binding_digest,target_publication_digest) ON DELETE RESTRICT,
  CONSTRAINT stynx_target_head_fk
    FOREIGN KEY (offline_forward_receipt_id,offline_baseline_id,offline_package,binding_digest,offline_last_ordinal)
    REFERENCES integration.stynx_offline_forward_receipts
      (receipt_id,baseline_id,package,binding_digest,ordinal) ON DELETE RESTRICT
);

CREATE FUNCTION integration.stynx_storage_target_admissions_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $guard$
BEGIN
  RAISE EXCEPTION 'STYNX target storage admission evidence is immutable';
END;
$guard$;
CREATE TRIGGER stynx_storage_target_admissions_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON integration.stynx_storage_target_admissions
  FOR EACH STATEMENT EXECUTE FUNCTION integration.stynx_storage_target_admissions_immutable();
ALTER TABLE integration.stynx_storage_target_admissions
  ENABLE ALWAYS TRIGGER stynx_storage_target_admissions_immutable;
ALTER TABLE integration.stynx_storage_target_admissions OWNER TO postgres;
ALTER FUNCTION integration.stynx_storage_target_admissions_immutable() OWNER TO postgres;
ALTER TABLE integration.stynx_storage_target_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration.stynx_storage_target_admissions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE integration.stynx_storage_target_admissions FROM PUBLIC, role_app_backend, role_auditor_min;
REVOKE ALL ON FUNCTION integration.stynx_storage_target_admissions_immutable() FROM PUBLIC, role_app_backend, role_auditor_min;

-- Reusable candidate catalogue assertion. Main-runner integration and live proof
-- are separate lanes. The assertion observes; it never repairs an object.
DO $custody_catalog$
DECLARE
  expected jsonb := '[
  {
    "table": "stynx_offline_baseline_custody",
    "columns": [
      [
        "baseline_id",
        "text",
        true,
        null
      ],
      [
        "package",
        "text",
        true,
        null
      ],
      [
        "prior_package_version",
        "text",
        true,
        null
      ],
      [
        "target_package_version",
        "text",
        true,
        null
      ],
      [
        "subject_digest",
        "text",
        true,
        null
      ],
      [
        "fresh_receipt_digest",
        "text",
        true,
        null
      ],
      [
        "target_publication_digest",
        "text",
        true,
        null
      ],
      [
        "binding_digest",
        "text",
        true,
        null
      ],
      [
        "covered_prefix_length",
        "integer",
        true,
        null
      ],
      [
        "last_covered_source",
        "text",
        true,
        null
      ],
      [
        "projected_prefix_digest",
        "text",
        true,
        null
      ],
      [
        "document",
        "jsonb",
        true,
        null
      ],
      [
        "admitted_by",
        "name",
        true,
        "CURRENT_USER"
      ],
      [
        "admitted_at",
        "timestamp with time zone",
        true,
        "transaction_timestamp()"
      ]
    ],
    "constraints": [
      [
        "stynx_offline_baseline_chain_uq",
        "u",
        "UNIQUE (baseline_id, package, binding_digest, covered_prefix_length)"
      ],
      [
        "stynx_offline_baseline_custody_admitted_at_check",
        "c",
        "CHECK (isfinite(admitted_at))"
      ],
      [
        "stynx_offline_baseline_custody_admitted_by_check",
        "c",
        "CHECK ((admitted_by = ''postgres''::name))"
      ],
      [
        "stynx_offline_baseline_custody_baseline_id_check",
        "c",
        "CHECK ((baseline_id ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_custody_binding_digest_check",
        "c",
        "CHECK ((binding_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_custody_covered_prefix_length_check",
        "c",
        "CHECK ((covered_prefix_length = 8))"
      ],
      [
        "stynx_offline_baseline_custody_document_check",
        "c",
        "CHECK ((jsonb_typeof(document) = ''object''::text))"
      ],
      [
        "stynx_offline_baseline_custody_fresh_receipt_digest_check",
        "c",
        "CHECK ((fresh_receipt_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_custody_last_covered_source_check",
        "c",
        "CHECK ((last_covered_source = ''packages/offline-sync/migrations/0008_import_receipts.sql''::text))"
      ],
      [
        "stynx_offline_baseline_custody_package_check",
        "c",
        "CHECK ((package = ''@stynx-nyx/offline-sync''::text))"
      ],
      [
        "stynx_offline_baseline_custody_pkey",
        "p",
        "PRIMARY KEY (baseline_id)"
      ],
      [
        "stynx_offline_baseline_custody_prior_package_version_check",
        "c",
        "CHECK ((prior_package_version = ''1.6.0''::text))"
      ],
      [
        "stynx_offline_baseline_custody_projected_prefix_digest_check",
        "c",
        "CHECK ((projected_prefix_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_custody_subject_digest_check",
        "c",
        "CHECK ((subject_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_custody_target_package_version_check",
        "c",
        "CHECK ((target_package_version = ''1.6.1''::text))"
      ],
      [
        "stynx_offline_baseline_custody_target_publication_digest_check",
        "c",
        "CHECK ((target_publication_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_baseline_fresh_fk",
        "f",
        "FOREIGN KEY (package) REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT"
      ],
      [
        "stynx_offline_baseline_identity_uq",
        "u",
        "UNIQUE (subject_digest, package, fresh_receipt_digest, target_publication_digest)"
      ],
      [
        "stynx_offline_baseline_release_uq",
        "u",
        "UNIQUE (baseline_id, package, binding_digest, target_publication_digest)"
      ]
    ],
    "indexes": [
      [
        "stynx_offline_baseline_chain_uq",
        "CREATE UNIQUE INDEX stynx_offline_baseline_chain_uq ON integration.stynx_offline_baseline_custody USING btree (baseline_id, package, binding_digest, covered_prefix_length)"
      ],
      [
        "stynx_offline_baseline_custody_pkey",
        "CREATE UNIQUE INDEX stynx_offline_baseline_custody_pkey ON integration.stynx_offline_baseline_custody USING btree (baseline_id)"
      ],
      [
        "stynx_offline_baseline_identity_uq",
        "CREATE UNIQUE INDEX stynx_offline_baseline_identity_uq ON integration.stynx_offline_baseline_custody USING btree (subject_digest, package, fresh_receipt_digest, target_publication_digest)"
      ],
      [
        "stynx_offline_baseline_release_uq",
        "CREATE UNIQUE INDEX stynx_offline_baseline_release_uq ON integration.stynx_offline_baseline_custody USING btree (baseline_id, package, binding_digest, target_publication_digest)"
      ]
    ]
  },
  {
    "table": "stynx_offline_forward_receipts",
    "columns": [
      [
        "receipt_id",
        "text",
        true,
        null
      ],
      [
        "baseline_id",
        "text",
        true,
        null
      ],
      [
        "package",
        "text",
        true,
        null
      ],
      [
        "target_package_version",
        "text",
        true,
        null
      ],
      [
        "target_publication_digest",
        "text",
        true,
        null
      ],
      [
        "binding_digest",
        "text",
        true,
        null
      ],
      [
        "ordinal",
        "integer",
        true,
        null
      ],
      [
        "source_path",
        "text",
        true,
        null
      ],
      [
        "raw_source_digest",
        "text",
        true,
        null
      ],
      [
        "bound_sql_digest",
        "text",
        true,
        null
      ],
      [
        "predecessor_baseline_id",
        "text",
        false,
        null
      ],
      [
        "predecessor_receipt_id",
        "text",
        false,
        null
      ],
      [
        "predecessor_ordinal",
        "integer",
        true,
        null
      ],
      [
        "document",
        "jsonb",
        true,
        null
      ],
      [
        "executed_by",
        "name",
        true,
        "CURRENT_USER"
      ],
      [
        "executed_at",
        "timestamp with time zone",
        true,
        "transaction_timestamp()"
      ]
    ],
    "constraints": [
      [
        "stynx_offline_forward_baseline_predecessor_fk",
        "f",
        "FOREIGN KEY (predecessor_baseline_id, package, binding_digest, predecessor_ordinal) REFERENCES integration.stynx_offline_baseline_custody(baseline_id, package, binding_digest, covered_prefix_length) ON DELETE RESTRICT"
      ],
      [
        "stynx_offline_forward_chain_uq",
        "u",
        "UNIQUE (receipt_id, baseline_id, package, binding_digest, ordinal)"
      ],
      [
        "stynx_offline_forward_ordinal_uq",
        "u",
        "UNIQUE (baseline_id, ordinal)"
      ],
      [
        "stynx_offline_forward_package_ordinal_uq",
        "u",
        "UNIQUE (package, ordinal)"
      ],
      [
        "stynx_offline_forward_predecessor_ck",
        "c",
        "CHECK ((((ordinal = 9) AND (predecessor_baseline_id IS NOT NULL) AND (predecessor_baseline_id = baseline_id) AND (predecessor_receipt_id IS NULL) AND (predecessor_ordinal = 8)) OR ((ordinal > 9) AND (predecessor_baseline_id IS NULL) AND (predecessor_receipt_id IS NOT NULL) AND (predecessor_ordinal = (ordinal - 1)))))"
      ],
      [
        "stynx_offline_forward_receipt_predecessor_fk",
        "f",
        "FOREIGN KEY (predecessor_receipt_id, baseline_id, package, binding_digest, predecessor_ordinal) REFERENCES integration.stynx_offline_forward_receipts(receipt_id, baseline_id, package, binding_digest, ordinal) ON DELETE RESTRICT"
      ],
      [
        "stynx_offline_forward_receipts_binding_digest_check",
        "c",
        "CHECK ((binding_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_forward_receipts_bound_sql_digest_check",
        "c",
        "CHECK ((bound_sql_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_forward_receipts_document_check",
        "c",
        "CHECK ((jsonb_typeof(document) = ''object''::text))"
      ],
      [
        "stynx_offline_forward_receipts_executed_at_check",
        "c",
        "CHECK (isfinite(executed_at))"
      ],
      [
        "stynx_offline_forward_receipts_executed_by_check",
        "c",
        "CHECK ((executed_by = ''postgres''::name))"
      ],
      [
        "stynx_offline_forward_receipts_ordinal_check",
        "c",
        "CHECK ((ordinal >= 9))"
      ],
      [
        "stynx_offline_forward_receipts_package_check",
        "c",
        "CHECK ((package = ''@stynx-nyx/offline-sync''::text))"
      ],
      [
        "stynx_offline_forward_receipts_pkey",
        "p",
        "PRIMARY KEY (receipt_id)"
      ],
      [
        "stynx_offline_forward_receipts_raw_source_digest_check",
        "c",
        "CHECK ((raw_source_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_forward_receipts_receipt_id_check",
        "c",
        "CHECK ((receipt_id ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_forward_receipts_source_path_check",
        "c",
        "CHECK ((length(source_path) > 0))"
      ],
      [
        "stynx_offline_forward_receipts_target_package_version_check",
        "c",
        "CHECK ((target_package_version = ''1.6.1''::text))"
      ],
      [
        "stynx_offline_forward_receipts_target_publication_digest_check",
        "c",
        "CHECK ((target_publication_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_offline_forward_release_fk",
        "f",
        "FOREIGN KEY (baseline_id, package, binding_digest, target_publication_digest) REFERENCES integration.stynx_offline_baseline_custody(baseline_id, package, binding_digest, target_publication_digest) ON DELETE RESTRICT"
      ],
      [
        "stynx_offline_forward_source_uq",
        "u",
        "UNIQUE (baseline_id, source_path)"
      ]
    ],
    "indexes": [
      [
        "stynx_offline_forward_baseline_successor_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_baseline_successor_uq ON integration.stynx_offline_forward_receipts USING btree (predecessor_baseline_id) WHERE (predecessor_baseline_id IS NOT NULL)"
      ],
      [
        "stynx_offline_forward_chain_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_chain_uq ON integration.stynx_offline_forward_receipts USING btree (receipt_id, baseline_id, package, binding_digest, ordinal)"
      ],
      [
        "stynx_offline_forward_ordinal_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_ordinal_uq ON integration.stynx_offline_forward_receipts USING btree (baseline_id, ordinal)"
      ],
      [
        "stynx_offline_forward_package_ordinal_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_package_ordinal_uq ON integration.stynx_offline_forward_receipts USING btree (package, ordinal)"
      ],
      [
        "stynx_offline_forward_receipt_successor_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_receipt_successor_uq ON integration.stynx_offline_forward_receipts USING btree (predecessor_receipt_id) WHERE (predecessor_receipt_id IS NOT NULL)"
      ],
      [
        "stynx_offline_forward_receipts_pkey",
        "CREATE UNIQUE INDEX stynx_offline_forward_receipts_pkey ON integration.stynx_offline_forward_receipts USING btree (receipt_id)"
      ],
      [
        "stynx_offline_forward_source_uq",
        "CREATE UNIQUE INDEX stynx_offline_forward_source_uq ON integration.stynx_offline_forward_receipts USING btree (baseline_id, source_path)"
      ]
    ]
  },
  {
    "table": "stynx_storage_target_admissions",
    "columns": [
      [
        "admission_id",
        "text",
        true,
        null
      ],
      [
        "mode",
        "text",
        true,
        null
      ],
      [
        "target_package_version",
        "text",
        true,
        null
      ],
      [
        "fresh_package_version",
        "text",
        true,
        null
      ],
      [
        "subject_digest",
        "text",
        true,
        null
      ],
      [
        "target_publication_digest",
        "text",
        true,
        null
      ],
      [
        "binding_digest",
        "text",
        true,
        null
      ],
      [
        "outbox_package",
        "text",
        true,
        null
      ],
      [
        "offline_package",
        "text",
        true,
        null
      ],
      [
        "outbox_fresh_receipt_digest",
        "text",
        true,
        null
      ],
      [
        "offline_fresh_receipt_digest",
        "text",
        true,
        null
      ],
      [
        "offline_baseline_id",
        "text",
        false,
        null
      ],
      [
        "offline_forward_receipt_id",
        "text",
        false,
        null
      ],
      [
        "offline_last_ordinal",
        "integer",
        false,
        null
      ],
      [
        "document",
        "jsonb",
        true,
        null
      ],
      [
        "admitted_by",
        "name",
        true,
        "CURRENT_USER"
      ],
      [
        "admitted_at",
        "timestamp with time zone",
        true,
        "transaction_timestamp()"
      ]
    ],
    "constraints": [
      [
        "stynx_storage_target_admissi_offline_fresh_receipt_digest_check",
        "c",
        "CHECK ((offline_fresh_receipt_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_storage_target_admissio_outbox_fresh_receipt_digest_check",
        "c",
        "CHECK ((outbox_fresh_receipt_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_storage_target_admissions_admission_id_check",
        "c",
        "CHECK ((admission_id ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_storage_target_admissions_admitted_at_check",
        "c",
        "CHECK (isfinite(admitted_at))"
      ],
      [
        "stynx_storage_target_admissions_admitted_by_check",
        "c",
        "CHECK ((admitted_by = ''postgres''::name))"
      ],
      [
        "stynx_storage_target_admissions_binding_digest_check",
        "c",
        "CHECK ((binding_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_storage_target_admissions_document_check",
        "c",
        "CHECK ((jsonb_typeof(document) = ''object''::text))"
      ],
      [
        "stynx_storage_target_admissions_fresh_package_version_check",
        "c",
        "CHECK ((fresh_package_version = ANY (ARRAY[''1.6.0''::text, ''1.6.1''::text])))"
      ],
      [
        "stynx_storage_target_admissions_mode_check",
        "c",
        "CHECK ((mode = ANY (ARRAY[''fresh-1.6.1''::text, ''upgrade-fresh-1.6.0''::text])))"
      ],
      [
        "stynx_storage_target_admissions_offline_package_check",
        "c",
        "CHECK ((offline_package = ''@stynx-nyx/offline-sync''::text))"
      ],
      [
        "stynx_storage_target_admissions_outbox_package_check",
        "c",
        "CHECK ((outbox_package = ''@stynx-nyx/outbox''::text))"
      ],
      [
        "stynx_storage_target_admissions_pkey",
        "p",
        "PRIMARY KEY (admission_id)"
      ],
      [
        "stynx_storage_target_admissions_subject_digest_check",
        "c",
        "CHECK ((subject_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_storage_target_admissions_target_package_version_check",
        "c",
        "CHECK ((target_package_version = ''1.6.1''::text))"
      ],
      [
        "stynx_storage_target_admissions_target_publication_digest_check",
        "c",
        "CHECK ((target_publication_digest ~ ''^sha256:[0-9a-f]{64}$''::text))"
      ],
      [
        "stynx_target_baseline_fk",
        "f",
        "FOREIGN KEY (offline_baseline_id, offline_package, binding_digest, target_publication_digest) REFERENCES integration.stynx_offline_baseline_custody(baseline_id, package, binding_digest, target_publication_digest) ON DELETE RESTRICT"
      ],
      [
        "stynx_target_head_fk",
        "f",
        "FOREIGN KEY (offline_forward_receipt_id, offline_baseline_id, offline_package, binding_digest, offline_last_ordinal) REFERENCES integration.stynx_offline_forward_receipts(receipt_id, baseline_id, package, binding_digest, ordinal) ON DELETE RESTRICT"
      ],
      [
        "stynx_target_mode_ck",
        "c",
        "CHECK ((((mode = ''fresh-1.6.1''::text) AND (fresh_package_version = ''1.6.1''::text) AND (offline_baseline_id IS NULL) AND (offline_forward_receipt_id IS NULL) AND (offline_last_ordinal IS NULL)) OR ((mode = ''upgrade-fresh-1.6.0''::text) AND (fresh_package_version = ''1.6.0''::text) AND (offline_baseline_id IS NOT NULL) AND (offline_forward_receipt_id IS NOT NULL) AND (offline_last_ordinal IS NOT NULL) AND (offline_last_ordinal = 9))))"
      ],
      [
        "stynx_target_offline_fresh_fk",
        "f",
        "FOREIGN KEY (offline_package) REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT"
      ],
      [
        "stynx_target_outbox_fresh_fk",
        "f",
        "FOREIGN KEY (outbox_package) REFERENCES integration.stynx_storage_installations(package) ON DELETE RESTRICT"
      ],
      [
        "stynx_target_version_uq",
        "u",
        "UNIQUE (target_package_version)"
      ]
    ],
    "indexes": [
      [
        "stynx_storage_target_admissions_pkey",
        "CREATE UNIQUE INDEX stynx_storage_target_admissions_pkey ON integration.stynx_storage_target_admissions USING btree (admission_id)"
      ],
      [
        "stynx_target_version_uq",
        "CREATE UNIQUE INDEX stynx_target_version_uq ON integration.stynx_storage_target_admissions USING btree (target_package_version)"
      ]
    ]
  }
]'::jsonb;
  entry jsonb; table_oid oid; function_oid oid; function_name text; trigger_name text;
  column_expected jsonb; constraint_expected jsonb; index_expected jsonb;
  body_expected text; not_null_expected bigint; protected_oids oid[]; ri_divergent boolean;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
    OR current_setting('row_security') <> 'on'
    OR current_setting('session_replication_role') <> 'origin'
    OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname=current_user AND rolsuper) THEN
    RAISE EXCEPTION 'STYNX custody requires real owner and ordinary RLS/trigger semantics';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_namespace WHERE nspname='integration' AND nspowner='postgres'::regrole)
    OR EXISTS (SELECT FROM pg_default_acl d,LATERAL aclexplode(d.defaclacl) a
      WHERE d.defaclnamespace IN (0,'integration'::regnamespace) AND a.grantee<>'postgres'::regrole)
    OR EXISTS (SELECT FROM pg_roles r WHERE NOT r.rolsuper AND
      r.oid<>'postgres'::regrole AND
      (has_schema_privilege(r.oid,'integration','CREATE') OR pg_has_role(r.oid,'postgres','MEMBER'))) THEN
    RAISE EXCEPTION 'STYNX custody schema/defaults/reachable roles differ';
  END IF;
  -- NOINHERIT does not remove a principal's SET ROLE authority. Inspect only
  -- actual principals' closures, not unrelated predefined capability roles.
  IF EXISTS (SELECT FROM pg_roles principal WHERE NOT principal.rolsuper
      AND principal.oid<>'postgres'::regrole
      AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
      AND EXISTS (SELECT FROM pg_roles reachable
        WHERE (reachable.oid=principal.oid OR pg_has_role(principal.oid,reachable.oid,'SET'))
          AND (reachable.rolsuper OR reachable.rolbypassrls OR reachable.rolcreaterole
            OR reachable.rolcreatedb OR reachable.rolreplication
            OR has_schema_privilege(reachable.oid,'integration','CREATE')))) THEN
    RAISE EXCEPTION 'STYNX custody principal reachable authority differs';
  END IF;
  FOR entry IN SELECT value FROM jsonb_array_elements(expected) LOOP
    table_oid := to_regclass('integration.'||(entry->>'table'));
    IF table_oid IS NULL THEN RAISE EXCEPTION 'STYNX custody relation missing'; END IF;
    IF NOT EXISTS (SELECT FROM pg_class WHERE oid=table_oid AND relowner='postgres'::regrole
      AND relkind='r' AND relpersistence='p' AND relrowsecurity AND relforcerowsecurity
      AND NOT relispartition AND NOT relhasrules AND reloptions IS NULL AND relreplident='d'
      AND relam=(SELECT oid FROM pg_am WHERE amname='heap') AND reltablespace=0)
      OR EXISTS (SELECT FROM pg_policy WHERE polrelid=table_oid)
      OR EXISTS (SELECT FROM pg_rewrite WHERE ev_class=table_oid)
      OR EXISTS (SELECT FROM pg_inherits WHERE inhrelid=table_oid OR inhparent=table_oid)
      OR EXISTS (SELECT FROM pg_depend WHERE classid='pg_class'::regclass AND objid=table_oid AND deptype='e')
      OR obj_description(table_oid,'pg_class') IS NOT NULL
      OR EXISTS (SELECT FROM pg_seclabel WHERE classoid='pg_class'::regclass AND objoid=table_oid) THEN
      RAISE EXCEPTION 'STYNX custody relation options/protection differ';
    END IF;
    column_expected := entry->'columns';
    IF (SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attnum)
        FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=table_oid AND a.attnum>0)
        IS DISTINCT FROM column_expected
      OR EXISTS (SELECT FROM pg_attribute a JOIN pg_type ty ON ty.oid=a.atttypid WHERE a.attrelid=table_oid AND a.attnum>0 AND (
        a.attisdropped OR a.attgenerated<>'' OR a.attidentity<>'' OR a.attacl IS NOT NULL
        OR a.attcollation<>ty.typcollation OR a.attstorage<>ty.typstorage OR a.attcompression<>''
        OR a.attndims<>0 OR a.attoptions IS NOT NULL OR a.attfdwoptions IS NOT NULL
        OR a.atthasmissing OR a.attmissingval IS NOT NULL OR NOT a.attislocal OR a.attinhcount<>0)) THEN
      RAISE EXCEPTION 'STYNX custody columns/defaults/collations differ';
    END IF;
    constraint_expected := entry->'constraints';
    IF (SELECT jsonb_agg(jsonb_build_array(conname,contype,pg_get_constraintdef(oid)) ORDER BY conname)
        FROM pg_constraint WHERE conrelid=table_oid AND contype<>'n') IS DISTINCT FROM constraint_expected
      OR EXISTS (SELECT FROM pg_constraint c WHERE conrelid=table_oid AND (
        NOT convalidated OR NOT conislocal OR coninhcount<>0 OR conparentid<>0
        OR condeferrable OR condeferred
        OR connoinherit IS DISTINCT FROM (contype IN ('p','u','f'))
        OR coalesce((to_jsonb(c)->>'conenforced')::boolean,true) IS NOT TRUE)) THEN
      RAISE EXCEPTION 'STYNX custody exact constraint inventory/enforcement differs';
    END IF;
    SELECT count(*) INTO not_null_expected FROM pg_attribute WHERE attrelid=table_oid AND attnum>0 AND attnotnull;
    IF (SELECT count(*) FROM pg_constraint WHERE conrelid=table_oid AND contype='n') <>
        (CASE WHEN current_setting('server_version_num')::integer>=180000 THEN not_null_expected ELSE 0 END)
      OR EXISTS (SELECT FROM pg_constraint c WHERE conrelid=table_oid AND contype='n' AND (
        cardinality(conkey)<>1 OR NOT EXISTS (SELECT FROM pg_attribute a WHERE a.attrelid=table_oid AND a.attnum=c.conkey[1] AND a.attnotnull
          AND pg_get_constraintdef(c.oid)='NOT NULL '||quote_ident(a.attname))))
      OR EXISTS (SELECT FROM pg_constraint WHERE conrelid=table_oid AND contype='n' GROUP BY conkey HAVING count(*)<>1) THEN
      RAISE EXCEPTION 'STYNX custody version-aware NOT NULL inventory differs';
    END IF;
    index_expected := entry->'indexes';
    IF (SELECT jsonb_agg(jsonb_build_array(c.relname,pg_get_indexdef(i.indexrelid)) ORDER BY c.relname)
        FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE i.indrelid=table_oid) IS DISTINCT FROM index_expected
      OR EXISTS (SELECT FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE i.indrelid=table_oid AND (
        NOT i.indisunique OR NOT i.indisvalid OR NOT i.indisready OR NOT i.indislive OR NOT i.indimmediate
        OR i.indisclustered OR i.indisreplident OR i.indnullsnotdistinct OR i.indexprs IS NOT NULL
        OR c.relowner<>'postgres'::regrole OR c.relkind<>'i' OR c.relpersistence<>'p'
        OR c.reloptions IS NOT NULL OR c.reltablespace<>0 OR c.relam<>(SELECT oid FROM pg_am WHERE amname='btree'))) THEN
      RAISE EXCEPTION 'STYNX custody exact index inventory differs';
    END IF;
    IF EXISTS (SELECT FROM pg_class c,LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid=table_oid AND a.grantee<>'postgres'::regrole)
      OR EXISTS (SELECT FROM pg_roles principal WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
        AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
        AND EXISTS (SELECT FROM pg_roles reachable
          WHERE (reachable.oid=principal.oid OR pg_has_role(principal.oid,reachable.oid,'SET'))
            AND has_table_privilege(reachable.oid,table_oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'))) THEN
      RAISE EXCEPTION 'STYNX custody effective ACL differs';
    END IF;
    IF entry->>'table'='stynx_storage_target_admissions' THEN
      function_name := 'stynx_storage_target_admissions_immutable'; trigger_name := function_name;
      body_expected := E'\nBEGIN\n  RAISE EXCEPTION ''STYNX target storage admission evidence is immutable'';\nEND;\n';
    ELSE
      function_name := 'stynx_offline_custody_immutable';
      trigger_name := CASE WHEN entry->>'table'='stynx_offline_baseline_custody' THEN 'stynx_offline_baseline_immutable' ELSE 'stynx_offline_forward_immutable' END;
      body_expected := E'\nBEGIN\n  RAISE EXCEPTION ''Offline custody and forward receipts are immutable'';\nEND;\n';
    END IF;
    function_oid := to_regprocedure('integration.'||function_name||'()');
    IF function_oid IS NULL OR NOT EXISTS (SELECT FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid=function_oid
      AND p.proowner='postgres'::regrole AND p.prorettype='trigger'::regtype AND p.pronargs=0 AND p.prokind='f' AND l.lanname='plpgsql'
      AND NOT p.proretset AND p.provariadic=0 AND p.prosupport=0 AND p.probin IS NULL
      AND NOT p.prosecdef AND NOT p.proleakproof AND NOT p.proisstrict AND p.provolatile='v' AND p.proparallel='u'
      AND p.proconfig=ARRAY['search_path=pg_catalog'] AND p.prosrc=body_expected)
      OR (SELECT count(*) FROM pg_proc WHERE pronamespace='integration'::regnamespace AND proname=function_name)<>1
      OR EXISTS (SELECT FROM pg_proc p,LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE p.oid=function_oid AND a.grantee<>'postgres'::regrole)
      OR EXISTS (SELECT FROM pg_roles principal WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
        AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
        AND EXISTS (SELECT FROM pg_roles reachable
          WHERE (reachable.oid=principal.oid OR pg_has_role(principal.oid,reachable.oid,'SET'))
            AND has_function_privilege(reachable.oid,function_oid,'EXECUTE')))
      OR obj_description(function_oid,'pg_proc') IS NOT NULL
      OR EXISTS (SELECT FROM pg_depend WHERE classid='pg_proc'::regclass AND objid=function_oid AND deptype='e')
      OR EXISTS (SELECT FROM pg_seclabel WHERE classoid='pg_proc'::regclass AND objoid=function_oid) THEN
      RAISE EXCEPTION 'STYNX custody immutable function differs';
    END IF;
    IF (SELECT count(*) FROM pg_trigger WHERE tgrelid=table_oid AND NOT tgisinternal)<>1
      OR NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid=table_oid AND tgname=trigger_name AND NOT tgisinternal
        AND tgfoid=function_oid AND tgtype=58 AND tgenabled='A' AND tgconstraint=0 AND tgqual IS NULL AND tgnargs=0
        AND tgattr=''::int2vector AND tgargs=''::bytea AND tgparentid=0 AND tgconstrrelid=0 AND tgconstrindid=0
        AND NOT tgdeferrable AND NOT tginitdeferred AND tgoldtable IS NULL AND tgnewtable IS NULL)
 THEN
      RAISE EXCEPTION 'STYNX custody statement/RI trigger inventory differs';
    END IF;
  END LOOP;

  -- Match four exact trigger rows for EACH admitted foreign key, including
  -- self-references. The tuple keeps the child/parent side and event distinct.
  protected_oids := ARRAY[
    'integration.stynx_offline_baseline_custody'::regclass,
    'integration.stynx_offline_forward_receipts'::regclass,
    'integration.stynx_storage_target_admissions'::regclass
  ]::oid[];
  IF EXISTS (SELECT FROM pg_constraint WHERE contype='f' AND confrelid=ANY(protected_oids)
      AND NOT conrelid=ANY(protected_oids)) THEN
    RAISE EXCEPTION 'STYNX custody has an unadmitted incoming foreign key';
  END IF;
  WITH admitted_fks AS (
    SELECT c.* FROM pg_constraint c WHERE c.contype='f' AND c.conrelid=ANY(protected_oids)
  ), expected_ri AS (
    SELECT c.oid AS constraint_oid,c.conindid AS index_oid,
      e.relation_oid,e.opposite_relation_oid,e.event_type,
      to_regprocedure(format('pg_catalog.%I()',e.function_name))::oid AS function_oid
    FROM admitted_fks c CROSS JOIN LATERAL (VALUES
      (c.conrelid,c.confrelid,5,'RI_FKey_check_ins'),
      (c.conrelid,c.confrelid,17,'RI_FKey_check_upd'),
      (c.confrelid,c.conrelid,9,'RI_FKey_restrict_del'),
      (c.confrelid,c.conrelid,17,'RI_FKey_noaction_upd')
    ) e(relation_oid,opposite_relation_oid,event_type,function_name)
  ), actual_ri AS (
    SELECT t.tgconstraint AS constraint_oid,t.tgconstrindid AS index_oid,
      t.tgrelid AS relation_oid,t.tgconstrrelid AS opposite_relation_oid,
      t.tgtype::integer AS event_type,t.tgfoid AS function_oid
    FROM admitted_fks c JOIN pg_trigger t ON t.tgconstraint=c.oid
  )
  SELECT EXISTS (
    (SELECT * FROM expected_ri EXCEPT ALL SELECT * FROM actual_ri)
    UNION ALL
    (SELECT * FROM actual_ri EXCEPT ALL SELECT * FROM expected_ri)
  ) INTO ri_divergent;
  IF ri_divergent OR EXISTS (
    SELECT FROM pg_trigger t JOIN pg_constraint c ON t.tgconstraint=c.oid
    WHERE c.contype='f' AND c.conrelid=ANY(protected_oids) AND (
      t.tgconstrindid IS DISTINCT FROM c.conindid OR NOT t.tgisinternal
      OR t.tgenabled<>'O' OR t.tgdeferrable OR t.tginitdeferred
      OR t.tgqual IS NOT NULL OR t.tgnargs<>0 OR t.tgattr<>''::int2vector
      OR t.tgargs<>''::bytea OR t.tgparentid<>0
      OR t.tgoldtable IS NOT NULL OR t.tgnewtable IS NOT NULL
    )
  ) OR EXISTS (
    SELECT FROM pg_trigger t WHERE t.tgrelid=ANY(protected_oids) AND t.tgisinternal
      AND NOT EXISTS (SELECT FROM pg_constraint c WHERE c.oid=t.tgconstraint
        AND c.contype='f' AND c.conrelid=ANY(protected_oids))
  ) THEN
    RAISE EXCEPTION 'STYNX custody exact per-FK RI pairing/metadata differs';
  END IF;
END $custody_catalog$;
