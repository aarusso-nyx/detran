import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { loadInstalledStorageArtifacts } from './rls-ddl-coverage.mjs';
import {
  createStorageTargetPlan,
  parseStorageCustodyDocument,
} from './stynx-storage-forward.mjs';

const ledger = 'integration.stynx_storage_installations';
const ledgerFunction = `${ledger}_immutable`;
const digest = (value) => createHash('sha256').update(value).digest('hex');
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const immutableBody =
  "\nBEGIN\n  RAISE EXCEPTION 'STYNX storage installation evidence is immutable';\nEND\n";

/** No database, ambient SQL input, alternate binding, package path or bypass. */
export function createStorageInstallPlan(root) {
  const artifacts = loadInstalledStorageArtifacts(path.resolve(root));
  return {
    version: 1,
    packages: ['19-stynx-outbox.sql', '19-stynx-offline.sql'].map((file) => {
      const { metadata, artifact } = artifacts.get(file);
      return {
        metadata,
        objectsSql: artifact.objectsSql,
        roleBindingsSql: artifact.roleBindingsSql,
      };
    }),
  };
}

function isAdmittedInstallerExecutor(value) {
  return value === '/root' || value === '/root/engineer_outbox_160';
}

function identity(item) {
  return {
    ...item.metadata,
    sourceManifestSha256: sourceManifestSha256(item.metadata.manifest),
  };
}

/** UTF-8 JSON: recursively sort object keys lexically; preserve array order. */
export function sourceManifestSha256(manifest) {
  const ordered = (value) => {
    if (Array.isArray(value)) return value.map(ordered);
    if (value !== null && typeof value === 'object')
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, ordered(value[key])]),
      );
    return value;
  };
  return digest(JSON.stringify(ordered(manifest)));
}

const ownerAssertionSql = `DO $owner_assert$ BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
    OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname=current_user AND rolsuper)
    OR current_setting('session_replication_role') <> 'origin'
    OR current_setting('row_security') <> 'on' THEN
    RAISE EXCEPTION 'STYNX installation requires real postgres owner and ordinary RLS/trigger semantics';
  END IF;
  IF EXISTS (SELECT FROM pg_roles r WHERE r.rolname IN ('role_app_backend','role_auditor_min') AND (
    r.rolsuper OR r.rolbypassrls OR r.rolcanlogin OR r.rolinherit OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication
    OR EXISTS (SELECT FROM pg_roles privileged WHERE
      (privileged.rolsuper OR privileged.rolbypassrls OR privileged.rolcreaterole OR privileged.rolcreatedb OR privileged.rolreplication
       OR privileged.rolname IN ('pg_read_all_data','pg_write_all_data','pg_read_server_files','pg_write_server_files','pg_execute_server_program'))
      AND pg_has_role(r.oid,privileged.oid,'MEMBER'))
  )) THEN
    RAISE EXCEPTION 'STYNX operational role flags or reachable privileged membership are unsafe';
  END IF;
END $owner_assert$;`;

const pristineSchemasSql = `SELECT EXISTS (SELECT FROM pg_namespace n WHERE n.nspname IN ('outbox','offline') AND (
  n.nspowner <> 'postgres'::regrole
  OR EXISTS (SELECT FROM pg_depend d WHERE d.refclassid='pg_namespace'::regclass AND d.refobjid=n.oid)
  OR EXISTS (SELECT FROM pg_depend d WHERE d.classid='pg_namespace'::regclass AND d.objid=n.oid AND d.deptype='e')
  OR obj_description(n.oid,'pg_namespace') IS NOT NULL
  OR EXISTS (SELECT FROM pg_seclabel s WHERE s.classoid='pg_namespace'::regclass AND s.objoid=n.oid)
  OR EXISTS (SELECT FROM aclexplode(coalesce(n.nspacl,acldefault('n',n.nspowner))) a WHERE a.grantee<>'postgres'::regrole)
)) AS divergent`;

// These assertions run before an existing ledger is used, and again after final
// DDL20 revocations. No assertion changes the object it examines.
export const ledgerAssertionSql = `DO $ledger_assert$
DECLARE t oid := to_regclass('${ledger}'); f oid := to_regprocedure('${ledgerFunction}()');
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
     OR NOT EXISTS (SELECT FROM pg_roles WHERE rolname = current_user AND rolsuper)
     OR current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'STYNX installation requires real postgres owner and ordinary trigger semantics';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_namespace WHERE nspname = 'integration' AND nspowner = 'postgres'::regrole)
     OR EXISTS (SELECT FROM pg_roles WHERE rolname IN ('role_app_backend','role_auditor_min')
       AND (rolsuper OR rolbypassrls OR pg_has_role(oid, 'postgres'::regrole, 'MEMBER')
         OR has_schema_privilege(oid, 'integration', 'CREATE')))
     OR EXISTS (SELECT FROM pg_default_acl d, LATERAL aclexplode(d.defaclacl) a
       WHERE d.defaclrole = 'postgres'::regrole
         AND d.defaclnamespace IN (0, 'integration'::regnamespace)
         AND d.defaclobjtype IN ('r','f') AND a.grantee <> 'postgres'::regrole) THEN
    RAISE EXCEPTION 'STYNX ledger schema, membership or defaults are unsafe';
  END IF;
  IF t IS NULL OR f IS NULL THEN RAISE EXCEPTION 'STYNX ledger catalog is incomplete'; END IF;
  IF NOT EXISTS (SELECT FROM pg_class WHERE oid=t AND relowner='postgres'::regrole
      AND relkind='r' AND relpersistence='p' AND relrowsecurity AND relforcerowsecurity
      AND NOT relispartition AND NOT relhasrules AND reloptions IS NULL AND relreplident='d'
      AND relam=(SELECT oid FROM pg_am WHERE amname='heap') AND reltablespace=0)
     OR EXISTS (SELECT FROM pg_policy WHERE polrelid=t)
     OR EXISTS (SELECT FROM pg_inherits WHERE inhrelid=t OR inhparent=t)
     OR EXISTS (SELECT FROM pg_attribute a JOIN pg_type ty ON ty.oid=a.atttypid WHERE a.attrelid=t AND a.attnum>0 AND (
       a.attisdropped OR a.attgenerated<>'' OR a.attidentity<>'' OR a.attacl IS NOT NULL
       OR a.attcollation<>ty.typcollation OR a.attstorage<>ty.typstorage OR a.attcompression<>''
       OR a.attndims<>0 OR a.attoptions IS NOT NULL OR a.attfdwoptions IS NOT NULL
       OR a.atthasmissing OR a.attmissingval IS NOT NULL OR NOT a.attislocal OR a.attinhcount<>0))
     OR (SELECT jsonb_agg(jsonb_build_array(a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull,pg_get_expr(d.adbin,d.adrelid)) ORDER BY a.attnum)
       FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=t AND a.attnum>0)
       IS DISTINCT FROM '[ ["package","text",true,null], ["identity","jsonb",true,null], ["installed_by","name",true,"CURRENT_USER"], ["installed_at","timestamp with time zone",true,"transaction_timestamp()"] ]'::jsonb
     OR (SELECT count(*) FROM pg_constraint WHERE conrelid=t AND contype<>'n') <> 3
     -- PostgreSQL 18 catalogs column NOT NULL as four additional constraints.
     -- Admit that exact representation, without accepting arbitrary extras.
     OR coalesce((SELECT jsonb_agg(jsonb_build_array(conname,conkey,pg_get_constraintdef(oid),convalidated,condeferrable,connoinherit) ORDER BY conkey[1])
       FROM pg_constraint WHERE conrelid=t AND contype='n'),'[]'::jsonb) IS DISTINCT FROM
       (CASE WHEN current_setting('server_version_num')::integer>=180000 THEN
         '[["stynx_storage_installations_package_not_null",[1],"NOT NULL package",true,false,false],
           ["stynx_storage_installations_identity_not_null",[2],"NOT NULL identity",true,false,false],
           ["stynx_storage_installations_installed_by_not_null",[3],"NOT NULL installed_by",true,false,false],
           ["stynx_storage_installations_installed_at_not_null",[4],"NOT NULL installed_at",true,false,false]]'::jsonb
       ELSE '[]'::jsonb END)
     OR EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND (NOT conislocal OR coninhcount<>0 OR conparentid<>0 OR condeferred))
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_pkey' AND contype='p' AND convalidated AND NOT condeferrable AND conkey=ARRAY[1]::smallint[])
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_identity' AND contype='c' AND convalidated AND NOT connoinherit
       AND pg_get_constraintdef(oid)='CHECK (((jsonb_typeof(identity) = ''object''::text) AND ((identity ->> ''package''::text) = package)))')
     OR NOT EXISTS (SELECT FROM pg_constraint WHERE conrelid=t AND conname='stynx_storage_installations_owner' AND contype='c' AND convalidated AND NOT connoinherit
       AND pg_get_constraintdef(oid)='CHECK ((installed_by = ''postgres''::name))')
     OR (SELECT count(*) FROM pg_index WHERE indrelid=t) <> 1
     OR NOT EXISTS (SELECT FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE i.indrelid=t
       AND i.indisprimary AND i.indisunique AND i.indisvalid AND i.indisready AND i.indislive AND i.indimmediate
       AND NOT i.indisclustered AND NOT i.indisreplident AND NOT i.indnullsnotdistinct
       AND i.indnatts=1 AND i.indnkeyatts=1 AND i.indkey='1'::int2vector AND i.indoption='0'::int2vector
       AND i.indcollation[0]=(SELECT attcollation FROM pg_attribute WHERE attrelid=t AND attnum=1)
       AND i.indclass[0]=(SELECT o.oid FROM pg_opclass o JOIN pg_am a ON a.oid=o.opcmethod
         WHERE o.opcnamespace='pg_catalog'::regnamespace AND o.opcname='text_ops' AND a.amname='btree')
       AND c.relowner='postgres'::regrole AND c.relkind='i' AND c.relpersistence='p' AND c.reloptions IS NULL
       AND c.relam=(SELECT oid FROM pg_am WHERE amname='btree') AND c.reltablespace=0
       AND i.indpred IS NULL AND i.indexprs IS NULL)
     OR EXISTS (SELECT FROM pg_class c,LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid=t AND a.grantee<>'postgres'::regrole)
     OR EXISTS (SELECT FROM pg_roles principal JOIN pg_roles reachable
       ON principal.oid=reachable.oid OR pg_has_role(principal.oid,reachable.oid,'SET')
       WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
         AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
         AND (reachable.rolsuper OR reachable.rolbypassrls OR reachable.rolcreaterole
           OR reachable.rolcreatedb OR reachable.rolreplication
           OR has_table_privilege(reachable.oid,t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
           OR has_schema_privilege(reachable.oid,'integration','CREATE'))) THEN
    RAISE EXCEPTION 'STYNX ledger definition, RLS or privileges differ';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid=f AND p.proowner='postgres'::regrole
      AND p.prorettype='trigger'::regtype AND p.pronargs=0 AND p.prokind='f' AND l.lanname='plpgsql'
      AND NOT p.proretset AND p.provariadic=0 AND p.prosupport=0 AND p.probin IS NULL
      AND NOT p.prosecdef AND NOT p.proleakproof AND NOT p.proisstrict AND p.provolatile='v' AND p.proparallel='u'
      AND p.proconfig=ARRAY['search_path=pg_catalog'] AND p.prosrc=${literal(immutableBody)})
     OR EXISTS (SELECT FROM pg_proc p,LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE p.oid=f AND a.grantee<>'postgres'::regrole)
     OR (SELECT count(*) FROM pg_proc WHERE pronamespace='integration'::regnamespace AND proname='stynx_storage_installations_immutable')<>1
     OR EXISTS (SELECT FROM pg_roles principal JOIN pg_roles reachable
       ON principal.oid=reachable.oid OR pg_has_role(principal.oid,reachable.oid,'SET')
       WHERE NOT principal.rolsuper AND principal.oid<>'postgres'::regrole
         AND (principal.rolcanlogin OR principal.rolname IN ('role_app_backend','role_auditor_min'))
         AND has_function_privilege(reachable.oid,f,'EXECUTE'))
     OR (SELECT count(*) FROM pg_trigger WHERE tgrelid=t AND NOT tgisinternal) <> 1
     OR NOT EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgname='stynx_storage_installations_immutable'
       AND tgfoid=f AND tgtype=58 AND tgenabled='A' AND NOT tgisinternal AND tgconstraint=0
       AND tgqual IS NULL AND tgnargs=0 AND tgattr=''::int2vector AND tgargs=''::bytea
       AND tgparentid=0 AND tgconstrrelid=0 AND tgconstrindid=0 AND NOT tgdeferrable AND NOT tginitdeferred
       AND tgoldtable IS NULL AND tgnewtable IS NULL) THEN
    RAISE EXCEPTION 'STYNX ledger immutability guard differs';
  END IF;
  -- Only the three declared custody FKs may add parent-side RI triggers.
  -- No custody means no incoming FK/RI at all; partial custody is refused.
  IF to_regclass('integration.stynx_offline_baseline_custody') IS NULL
     AND to_regclass('integration.stynx_offline_forward_receipts') IS NULL
     AND to_regclass('integration.stynx_storage_target_admissions') IS NULL THEN
    IF EXISTS (SELECT FROM pg_constraint WHERE contype='f' AND confrelid=t)
       OR EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgisinternal) THEN
      RAISE EXCEPTION 'STYNX ledger has undeclared incoming RI';
    END IF;
  ELSE
    IF to_regclass('integration.stynx_offline_baseline_custody') IS NULL
       OR to_regclass('integration.stynx_offline_forward_receipts') IS NULL
       OR to_regclass('integration.stynx_storage_target_admissions') IS NULL
       OR (SELECT count(*) FROM pg_constraint WHERE contype='f' AND confrelid=t)<>3
       OR (SELECT count(*) FROM pg_trigger WHERE tgrelid=t AND tgisinternal)<>6 THEN
      RAISE EXCEPTION 'STYNX ledger custody RI inventory differs';
    END IF;
    IF EXISTS (
      WITH expected_fk(child,name,column_name) AS (VALUES
        ('integration.stynx_offline_baseline_custody'::regclass,'stynx_offline_baseline_fresh_fk','package'),
        ('integration.stynx_storage_target_admissions'::regclass,'stynx_target_outbox_fresh_fk','outbox_package'),
        ('integration.stynx_storage_target_admissions'::regclass,'stynx_target_offline_fresh_fk','offline_package'))
      SELECT FROM expected_fk e LEFT JOIN pg_constraint c
        ON c.conrelid=e.child AND c.conname=e.name
      WHERE c.oid IS NULL OR c.contype<>'f' OR c.confrelid<>t
        OR c.conkey IS DISTINCT FROM ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid=e.child AND attname=e.column_name)]::smallint[]
        OR c.confkey IS DISTINCT FROM ARRAY[1]::smallint[]
        OR c.conindid<>(SELECT indexrelid FROM pg_index WHERE indrelid=t AND indisprimary)
        OR c.confupdtype<>'a' OR c.confdeltype<>'r' OR c.confmatchtype<>'s'
        OR NOT c.convalidated OR c.condeferrable OR c.condeferred
        OR NOT c.conislocal OR c.coninhcount<>0 OR c.conparentid<>0
    ) THEN RAISE EXCEPTION 'STYNX ledger declared FK definition differs'; END IF;
    IF EXISTS (
      WITH expected AS (
        SELECT c.oid AS constraint_id,c.conrelid AS opposite,c.conindid AS index_id,
          v.event_type,v.function_id
        FROM pg_constraint c CROSS JOIN LATERAL (VALUES
          (9,'pg_catalog."RI_FKey_restrict_del"()'::regprocedure::oid),
          (17,'pg_catalog."RI_FKey_noaction_upd"()'::regprocedure::oid)) v(event_type,function_id)
        WHERE c.contype='f' AND c.confrelid=t),
      actual AS (SELECT tgconstraint AS constraint_id,tgconstrrelid AS opposite,
        tgconstrindid AS index_id,tgtype::integer AS event_type,tgfoid AS function_id
        FROM pg_trigger WHERE tgrelid=t AND tgisinternal),
      difference AS ((SELECT * FROM expected EXCEPT ALL SELECT * FROM actual)
        UNION ALL (SELECT * FROM actual EXCEPT ALL SELECT * FROM expected))
      SELECT FROM difference
    ) OR EXISTS (SELECT FROM pg_trigger WHERE tgrelid=t AND tgisinternal AND (
      tgenabled<>'O' OR tgparentid<>0 OR tgqual IS NOT NULL OR tgnargs<>0
      OR tgattr<>''::int2vector OR tgargs<>''::bytea OR tgdeferrable OR tginitdeferred
      OR tgoldtable IS NOT NULL OR tgnewtable IS NOT NULL)) THEN
      RAISE EXCEPTION 'STYNX ledger exact parent RI multiset differs';
    END IF;
  END IF;
END $ledger_assert$;`;

/** Admission is read-only, under the wrapper's maintenance exclusion. */
export async function inspectStorageInstallation(client, plan) {
  await client.query(ownerAssertionSql);
  const existence =
    await client.query(`SELECT to_regclass('${ledger}') IS NOT NULL AS present,
    to_regprocedure('${ledgerFunction}()') IS NOT NULL AS guard_present`);
  const { present, guard_present: guardPresent } = existence.rows[0];
  let rows = [];
  if (present) {
    await client.query(ledgerAssertionSql);
    rows = (
      await client.query(
        `SELECT package, identity, installed_by, installed_at FROM ${ledger} ORDER BY package`,
      )
    ).rows;
  } else if (guardPresent) throw new Error('STYNX ledger catalog is partial');
  if (rows.length === 2) {
    const expected = plan.packages
      .map(identity)
      .sort((a, b) => a.package.localeCompare(b.package));
    if (
      !rows.every(
        (row, i) =>
          row.package === expected[i].package &&
          row.installed_by === 'postgres' &&
          row.installed_at &&
          isDeepStrictEqual(row.identity, expected[i]),
      )
    )
      throw new Error('STYNX ledger version, binding or identity differs');
    return 'repeat';
  }
  if (rows.length)
    throw new Error('STYNX ledger package group is partial or unexpected');
  const schemas = await client.query(pristineSchemasSql);
  if (schemas.rows[0].divergent)
    throw new Error('STYNX unreceipted storage schema is not pristine');
  return 'fresh';
}

export async function verifyInstalledStorage(client, root, plan) {
  const requireApp = createRequire(
    path.join(path.resolve(root), 'backend/app/package.json'),
  );
  const reports = [];
  for (const item of plan.packages) {
    const api = requireApp(item.metadata.package);
    const verify =
      item.metadata.package === '@stynx-nyx/outbox'
        ? api.verifyOutboxStorage
        : api.verifyOfflineStorage;
    const report = await verify(client, item.metadata.binding);
    reports.push(report);
    if (
      report.supported !== true ||
      !Array.isArray(report.checks) ||
      report.checks.some((check) => check.status !== 'pass')
    )
      throw new Error(
        `STYNX public verification STOP: ${item.metadata.package}: ${JSON.stringify(report)}`,
      );
  }
  return reports;
}

/** Fixed, quoted transport of complete public SQL texts to the psql transaction. */
export function createStorageExecutionSql(root) {
  const plan = createStorageInstallPlan(root);
  const ledgerSql = fs.readFileSync(
    path.join(root, 'backend/database/ddl/19-stynx-storage-ledger.sql'),
    'utf8',
  );
  const expected = plan.packages.map(
    (item) => literal(JSON.stringify(identity(item))) + '::jsonb',
  );
  return `${ownerAssertionSql}
DO $storage_install$
DECLARE present boolean := to_regclass('${ledger}') IS NOT NULL;
  fresh boolean := true; divergent boolean; total bigint;
BEGIN
  IF present THEN
    EXECUTE ${literal(ledgerAssertionSql)};
    SELECT count(*) INTO total FROM ${ledger};
    IF total=2 THEN
      IF NOT EXISTS (SELECT FROM ${ledger} WHERE package=${literal(plan.packages[0].metadata.package)} AND identity=${expected[0]} AND installed_by='postgres' AND installed_at<=transaction_timestamp())
        OR NOT EXISTS (SELECT FROM ${ledger} WHERE package=${literal(plan.packages[1].metadata.package)} AND identity=${expected[1]} AND installed_by='postgres' AND installed_at<=transaction_timestamp()) THEN
        RAISE EXCEPTION 'STYNX ledger version, binding or identity differs';
      END IF;
      fresh := false;
    ELSIF total<>0 THEN RAISE EXCEPTION 'STYNX ledger package group is partial or unexpected';
    END IF;
  ELSIF to_regprocedure('${ledgerFunction}()') IS NOT NULL THEN
    RAISE EXCEPTION 'STYNX ledger catalog is partial';
  END IF;
  IF fresh THEN
    ${pristineSchemasSql.replace(' AS divergent', ' INTO divergent')};
    IF divergent THEN RAISE EXCEPTION 'STYNX unreceipted storage schema is not pristine'; END IF;
    IF NOT present THEN EXECUTE ${literal(ledgerSql)}; END IF;
    EXECUTE ${literal(ledgerAssertionSql)};
    ${plan.packages
      .map(
        (item, i) => `EXECUTE ${literal(item.objectsSql)};
    EXECUTE ${literal(item.roleBindingsSql)};
    INSERT INTO ${ledger}(package,identity) VALUES (${literal(item.metadata.package)},${expected[i]});`,
      )
      .join('\n    ')}
  ELSE
    ${plan.packages.map((item) => `EXECUTE ${literal(item.roleBindingsSql)};`).join('\n    ')}
  END IF;
END $storage_install$;`;
}

// DDL20's broad grants are deliberately revoked only after DDL20. This does not
// provide a repair path: the original catalog was already admitted read-only.
export const ledgerFinalPrivilegesSql = `REVOKE ALL ON TABLE ${ledger} FROM PUBLIC, role_app_backend, role_auditor_min;`;

function connectionSettings(full) {
  const env = process.env;
  if (
    ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'].some(
      (key) => !Object.hasOwn(env, key) || !env[key],
    )
  )
    throw new Error(
      'STYNX runner requires explicit DB_HOST/DB_PORT/DB_USER/DB_NAME fields from apply',
    );
  const settings = {
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? '5432'),
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_NAME ?? 'detran',
    options: '-c row_security=on -c search_path=pg_catalog,public',
    // pg otherwise reads PGSSLMODE despite the explicitly selected DB fields.
    ssl: false,
    client_encoding: 'UTF8',
  };
  if (
    !Number.isInteger(settings.port) ||
    settings.port < 1 ||
    settings.port > 65535 ||
    !/^\d+$/.test(env.DB_PORT ?? '5432') ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(settings.database) ||
    settings.user !== 'postgres' ||
    !settings.host ||
    /[\0\r\n]/.test(settings.host) ||
    /[\0\r\n]/.test(settings.password)
  )
    throw new Error(
      'STYNX installer requires explicit valid DB connection fields and real postgres login',
    );
  if (full) {
    const authorization = {
      detran_r7_ctg1_a2: 'DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED',
      detran_r13: 'DETRAN_R13_FULL_AUTHORIZED',
      detran_local_stack: 'DETRAN_LOCAL_STACK_FULL_AUTHORIZED',
      detran_r22_161_full: 'DETRAN_R22_STYNX_161_FULL_AUTHORIZED',
    }[settings.database];
    if (!authorization || env[authorization] !== '1')
      throw new Error(
        '--full requires existing explicit disposable database authorization',
      );
  }
  return settings;
}

// Runtime activation is detached from source authorship. F1 must bind the actual
// generation-03 discovery, reviewed source/input report and exclusive install lease.
// Neither caller options nor a recomputed local manifest can supply this seal.
const storageRunnerActivation = {
  discovery: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/admitted-inputs.json',
    sha256:
      'sha256:9381436615594db9f059cf966203cd9ab21b40157aecf965acc263fd32ea138b',
  },
  reviewedCandidate: {
    path: 'scratch/r22-adoption-161/node-installer-source-candidate-05/reviewed-candidate.json',
    sha256:
      'sha256:cf5a763fbbfa17e695079baab514062f3639aac22290f0675b82d38e47bc2a92',
  },
  lease: {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/installer-package-upgrade-exclusive-lease.json',
    sha256:
      'sha256:119aaecd647af97d35e2d54d085c207aa6dc94f26c25d716b9ad449127cfedfb',
  },
};
const discoveryPath =
  'scratch/r22-adoption-161/db-rehearsal/cluster-02/generation-03/admitted-inputs.json';
const priorOutboxArtifact = {
  path: 'scratch/r22-adoption-160/baseline-preparation/outbox-prior-artifact.json',
  sha256:
    'sha256:b9934860ed96ba96342ce158eb3033d99eb548fd833688a828344173d8b61aef',
};
const custodyRelations = [
  'integration.stynx_offline_baseline_custody',
  'integration.stynx_offline_forward_receipts',
  'integration.stynx_storage_target_admissions',
];
const canonicalJson = (value) =>
  Array.isArray(value)
    ? `[${value.map(canonicalJson).join(',')}]`
    : value !== null && typeof value === 'object'
      ? `{${Object.keys(value)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
          .join(',')}}`
      : JSON.stringify(value);
const recordDigest = (value) => `sha256:${digest(canonicalJson(value))}`;
const plainRef = (value) => ({ path: value.path, sha256: value.sha256 });
function requireFact(condition, message) {
  if (!condition) throw new Error(`STYNX installation STOP: ${message}`);
}
function readFixedReference(root, ref) {
  requireFact(
    ref &&
      typeof ref.path === 'string' &&
      /^sha256:[a-f0-9]{64}$/u.test(ref.sha256),
    'unsealed input reference',
  );
  requireFact(
    !/[\\:\0]/u.test(ref.path) &&
      ref.path
        .split('/')
        .every((part) => part && part !== '.' && part !== '..'),
    'input path escape',
  );
  let current = root;
  for (const part of ref.path.split('/')) {
    current = path.join(current, part);
    requireFact(!fs.lstatSync(current).isSymbolicLink(), 'input symlink');
  }
  requireFact(
    fs.lstatSync(current).isFile() && fs.realpathSync(current) === current,
    'input is not an internal regular file',
  );
  const bytes = fs.readFileSync(current);
  requireFact(
    `sha256:${digest(bytes)}` === ref.sha256,
    'input bytes differ: ' + ref.path,
  );
  if (Object.hasOwn(ref, 'bytes'))
    requireFact(
      Number.isSafeInteger(ref.bytes) && ref.bytes === bytes.length,
      'input byte count differs: ' + ref.path,
    );
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
function readRunnerAdmission(root, settings) {
  requireFact(
    storageRunnerActivation !== null,
    'actual generation-03 runner activation/lease is not sealed',
  );
  const seal = storageRunnerActivation;
  requireFact(
    seal.discovery.path === discoveryPath,
    'unexpected discovery selector',
  );
  const externalRef = {
    path: path.dirname(discoveryPath) + '/installer-execution-activation.json',
    sha256: process.env.DETRAN_STYNX_STORAGE_EXECUTION_SHA,
  };
  const activation = JSON.parse(readFixedReference(root, externalRef));
  requireFact(
    isDeepStrictEqual(
      Object.keys(activation).sort(),
      [
        'formatVersion',
        'kind',
        'status',
        'source',
        'admittedInputs',
        'reviewedCandidate',
        'lease',
      ].sort(),
    ) &&
      activation.formatVersion === 1 &&
      activation.kind === 'reviewed-stynx-storage-execution-activation' &&
      activation.status === 'ACTIVE',
    'external execution activation differs',
  );
  requireFact(
    isDeepStrictEqual(
      plainRef(activation.admittedInputs),
      plainRef(seal.discovery),
    ) &&
      isDeepStrictEqual(
        plainRef(activation.reviewedCandidate),
        plainRef(seal.reviewedCandidate),
      ) &&
      isDeepStrictEqual(plainRef(activation.lease), plainRef(seal.lease)),
    'execution refs are not consumer-sealed',
  );
  requireFact(
    activation.source.path === 'tools/stynx-storage-install.mjs' &&
      activation.source.sha256 ===
        'sha256:' + digest(fs.readFileSync(fileURLToPath(import.meta.url))),
    'actual post-constant runner source differs',
  );
  const discovery = JSON.parse(readFixedReference(root, seal.discovery));
  requireFact(
    isDeepStrictEqual(
      Object.keys(discovery).sort(),
      [
        'formatVersion',
        'subjectManifest',
        'creationReview',
        'publication',
        'projection',
        'priorRuntime',
        'baselineInputs',
      ].sort(),
    ) && discovery.formatVersion === 1,
    'discovery schema differs',
  );
  const g03 = JSON.parse(readFixedReference(root, discovery.subjectManifest));
  readFixedReference(root, discovery.creationReview);
  const reviewedCandidate = JSON.parse(
    readFixedReference(root, seal.reviewedCandidate),
  );
  const lease = JSON.parse(readFixedReference(root, seal.lease));
  requireFact(
    lease.status === 'ACTIVE' &&
      lease.holder === 'Engineer' &&
      lease.issuer === '/root' &&
      isAdmittedInstallerExecutor(lease.grantee),
    'exclusive install lease unavailable',
  );
  const roster = {
    detran_r22_161_g03_upgrade: '18767',
    detran_r22_161_fresh: '16387',
    detran_r22_161_negative: '16388',
    detran_r22_161_full: '16389',
  };
  requireFact(
    Object.hasOwn(roster, settings.database),
    'subject is outside the fixed installer roster',
  );
  const original02Ref = {
    path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/subject-manifest.json',
    sha256:
      'sha256:9a55a7457574612ec63c1deeb7f34c82095155e08f833acb89765ce7f629ecc4',
  };
  const manifest =
    settings.database === 'detran_r22_161_g03_upgrade'
      ? g03
      : JSON.parse(readFixedReference(root, original02Ref));
  if (settings.database !== 'detran_r22_161_g03_upgrade')
    readFixedReference(root, {
      path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/inspector-creation-readback/INSPECTOR-CREATION-READBACK.md',
      sha256:
        'sha256:a83e1be0e199393d5c245d7b673294e6118ccbd8a9d7404ee2a6fcf437ed956b',
    });
  const subjects = manifest.subjects.filter(
    (subject) => subject.databaseName === settings.database,
  );
  requireFact(
    subjects.length === 1 &&
      subjects[0].databaseOid === roster[settings.database],
    'subject is not uniquely admitted by actual creation',
  );
  const subject = subjects[0];
  requireFact(
    subject.owner === 'postgres' &&
      ((settings.database === 'detran_r22_161_full' && lease.fullRecreation) ||
        lease.subjects.some((entry) => isDeepStrictEqual(entry, subject))),
    'lease/creation subject disagreement',
  );
  requireFact(
    settings.host === manifest.endpoint.host &&
      settings.port === manifest.endpoint.port &&
      isDeepStrictEqual(lease.endpoint, manifest.endpoint),
    'connection differs from leased endpoint',
  );
  requireFact(
    fs.realpathSync(process.execPath) === process.execPath,
    'Node executable is indirect',
  );
  for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_PG_FORCE_NATIVE'])
    requireFact(!process.env[key], 'ambient loader/native state: ' + key);
  requireFact(
    !process.execArgv.some((arg) =>
      /(?:require|loader|import|inspect)/u.test(arg),
    ),
    'Node preload/loader option',
  );
  requireFact(
    discovery.baselineInputs.length === 1 &&
      discovery.baselineInputs[0].databaseName ===
        'detran_r22_161_g03_upgrade' &&
      discovery.baselineInputs[0].databaseOid === '18767',
    'fixed baseline roster differs',
  );
  const baseline =
    settings.database === 'detran_r22_161_g03_upgrade'
      ? discovery.baselineInputs[0]
      : null;
  const inputs = {
    publication: plainRef(discovery.publication),
    projection: plainRef(discovery.projection),
    priorRuntime: plainRef(discovery.priorRuntime),
    baseline: baseline ? plainRef(baseline.baseline) : null,
    baselineReview: baseline ? plainRef(baseline.baselineReview) : null,
  };
  // Only the concrete F1-sealed generation-03 pair is admitted by the pure helper.
  const targetPlan = createStorageTargetPlan(root, inputs);
  const baselineDocument = baseline
    ? parseStorageCustodyDocument(
        readFixedReference(root, baseline.baseline),
        'baseline',
      ).document
    : null;
  const roleGraph = JSON.parse(
    readFixedReference(root, {
      path:
        path.dirname(discoveryPath) +
        '/reference-proof/role-graph-finally.json',
      sha256:
        'sha256:0942cd8e843962c5a40ff2f3d56d999fae430ff580b6ed3107b111785e650797',
    }),
  );
  const admission = {
    root,
    reviewedCandidate,
    activation: { ...seal, externalRef },
    discovery,
    manifest,
    lease,
    subject: structuredClone(subject),
    inputs,
    targetPlan,
    baseline: baselineDocument,
    roleGraph,
  };
  if (settings.database === 'detran_r22_161_full' && lease.fullRecreation)
    admission.subject = validateFullRepeatIdentity(
      admission,
      lease,
      reviewedCandidate,
    );
  return admission;
}

const fixedReviewedInputPaths = [
  'backend/database/apply.sh',
  'tools/stynx-storage-forward.mjs',
  'tools/stynx-storage-prior-verifier.mjs',
  'tools/stynx-storage-runtime-guard.mjs',
  'tools/rls-ddl-coverage.mjs',
  'tools/stynx-version.json',
  'backend/database/stynx-storage.json',
  'backend/app/package.json',
  'package.json',
  'pnpm-lock.yaml',
  'scratch/r22-adoption-161/workspace-runtime-final/installed-capture.json',
  'scratch/r22-adoption-161/workspace-runtime-final/static-module-graph.json',
  'scratch/r22-adoption-161/workspace-storage-renderers/inputs.json',
  path.dirname(discoveryPath) + '/installer-runtime-inputs.json',
  discoveryPath,
];
function closedKeys(value, keys, label) {
  requireFact(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      isDeepStrictEqual(Object.keys(value).sort(), [...keys].sort()),
    label + ' schema differs',
  );
}
function validateReviewedCandidate(root, admission, execution) {
  const candidate = admission.reviewedCandidate;
  closedKeys(
    candidate,
    ['formatVersion', 'kind', 'sourceBeforeLease', 'inputs', 'reviews'],
    'reviewed candidate',
  );
  requireFact(
    candidate.formatVersion === 1 &&
      candidate.kind === 'reviewed-stynx-storage-candidate',
    'reviewed candidate kind differs',
  );
  closedKeys(
    candidate.sourceBeforeLease,
    ['path', 'bytes', 'sha256'],
    'reviewed null-seal source',
  );
  const nullSource = readFixedReference(root, candidate.sourceBeforeLease);
  requireFact(
    candidate.sourceBeforeLease.path !== 'tools/stynx-storage-install.mjs' &&
      nullSource.includes('const storageRunnerActivation = null;'),
    'pre-lease source is not an immutable null-seal copy',
  );
  const currentSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const restored = currentSource.replace(
    /const storageRunnerActivation = [\s\S]*?;(?=\nconst discoveryPath)/u,
    'const storageRunnerActivation = null;',
  );
  requireFact(
    restored === nullSource,
    'final source does not invert exactly to reviewed null-seal source',
  );
  closedKeys(
    candidate.reviews,
    ['inspector', 'independent'],
    'candidate reviews',
  );
  for (const [key, actor] of [
    ['inspector', '/root/inspector_adoption_160'],
    ['independent', '/root/architect_adoption_160'],
  ]) {
    const review = candidate.reviews[key];
    closedKeys(review, ['actor', 'report'], 'candidate reviewer');
    requireFact(review.actor === actor, 'candidate review actor differs');
    closedKeys(
      review.report,
      ['path', 'bytes', 'sha256'],
      'candidate report ref',
    );
    readFixedReference(root, review.report);
  }
  const sqlPaths = [...execution.files.keys()].map(
    (name) => 'backend/database/ddl/' + name,
  );
  requireFact(
    sqlPaths.length === 73,
    'reviewed SQL inventory is not the closed73',
  );
  const required = [
    ...new Set([
      ...sqlPaths,
      ...fixedReviewedInputPaths,
      ...(admission.fullChainRefs ?? []).map((ref) => ref.path),
    ]),
  ].sort();
  requireFact(
    Array.isArray(candidate.inputs) &&
      candidate.inputs.length === required.length,
    'candidate input count differs',
  );
  const seen = new Set();
  for (const ref of candidate.inputs) {
    closedKeys(ref, ['path', 'bytes', 'sha256'], 'candidate input ref');
    requireFact(!seen.has(ref.path), 'duplicate candidate input');
    seen.add(ref.path);
    readFixedReference(root, ref);
  }
  requireFact(
    isDeepStrictEqual(
      candidate.inputs.map((ref) => ref.path),
      required,
    ),
    'candidate missing/extra/unsorted fixed inputs',
  );
  for (const file of execution.files.values()) {
    const ref = candidate.inputs.find(
      (ref) => ref.path === 'backend/database/ddl/' + file.name,
    );
    requireFact(
      ref &&
        ref.sha256 === 'sha256:' + file.sha256 &&
        Buffer.byteLength(file.sql) === ref.bytes,
      'loaded SQL differs from sealed candidate',
    );
  }
  for (const ref of admission.fullChainRefs ?? [])
    requireFact(
      candidate.inputs.some((input) => isDeepStrictEqual(input, ref)),
      'reviewed recreation chain differs',
    );
  rehashReviewedInputs(root, candidate);
  return candidate;
}
function rehashReviewedInputs(root, reviewedCandidate) {
  for (const ref of reviewedCandidate.inputs) readFixedReference(root, ref);
  readFixedReference(root, reviewedCandidate.sourceBeforeLease);
  for (const review of Object.values(reviewedCandidate.reviews))
    readFixedReference(root, review.report);
}
function validateFullRepeatIdentity(admission, lease, reviewedCandidate) {
  requireFact(
    admission.subject.databaseName === 'detran_r22_161_full' &&
      lease.fullRecreation,
    'full recreation provenance absent',
  );
  const refs = [],
    seen = new Set(),
    identities = new Map();
  const collect = (ref) => {
    closedKeys(ref, ['path', 'bytes', 'sha256'], 'full transitive B3 ref');
    const existing = identities.get(ref.path);
    requireFact(
      !existing || isDeepStrictEqual(existing, ref),
      'conflicting full-chain path identity',
    );
    readFixedReference(admission.root, ref);
    if (!existing) {
      identities.set(ref.path, ref);
      refs.push(ref);
    }
  };
  const readChain = (ref, expectedReplacement) => {
    closedKeys(ref, ['path', 'bytes', 'sha256'], 'full recreation ref');
    requireFact(
      !seen.has(ref.path) &&
        ref.path.startsWith(
          path.dirname(discoveryPath) +
            '/installer-custody/detran_r22_161_full/attempt-',
        ) &&
        ref.path.endsWith('/full-recreation.json'),
      'full chain path/cycle differs',
    );
    seen.add(ref.path);
    collect(ref);
    requireFact(
      reviewedCandidate.inputs.some((input) => isDeepStrictEqual(input, ref)),
      'lease.fullRecreation not in reviewedCandidate.inputs',
    );
    const record = JSON.parse(readFixedReference(admission.root, ref));
    closedKeys(
      record,
      [
        'formatVersion',
        'kind',
        'originalSubject',
        'replacementSubject',
        'originalSubjectManifest',
        'predecessor',
        'authorization',
        'observations',
        'cluster',
      ],
      'full recreation',
    );
    requireFact(
      record.formatVersion === 1 &&
        record.kind === 'stynx-storage-full-recreation',
      'full recreation kind differs',
    );
    const originalSubject = record.originalSubject,
      replacementSubject = record.replacementSubject;
    requireFact(
      originalSubject.databaseName === 'detran_r22_161_full' &&
        replacementSubject.databaseName === originalSubject.databaseName &&
        replacementSubject.owner === 'postgres' &&
        originalSubject.owner === 'postgres' &&
        replacementSubject.clusterSystemIdentifier === '7696293464811719840' &&
        originalSubject.clusterSystemIdentifier ===
          replacementSubject.clusterSystemIdentifier &&
        /^[1-9][0-9]*$/u.test(replacementSubject.databaseOid) &&
        replacementSubject.databaseOid !== originalSubject.databaseOid &&
        isDeepStrictEqual(replacementSubject, expectedReplacement),
      'full replacement subject differs',
    );
    requireFact(
      record.cluster.dataDirectory === admission.manifest.dataDirectory &&
        isDeepStrictEqual(
          record.cluster.endpoint,
          admission.manifest.endpoint,
        ) &&
        record.cluster.systemIdentifier ===
          replacementSubject.clusterSystemIdentifier &&
        isDeepStrictEqual(
          record.cluster.postmaster,
          admission.manifest.postmaster,
        ),
      'full cluster provenance differs',
    );
    closedKeys(
      record.authorization,
      ['activation', 'lease', 'reviewedCandidate'],
      'full authorization',
    );
    for (const authority of [
      ...Object.values(record.authorization),
      record.originalSubjectManifest,
    ]) {
      closedKeys(authority, ['path', 'bytes', 'sha256'], 'full authority ref');
      collect(authority);
    }
    const priorCandidate = JSON.parse(
      readFixedReference(
        admission.root,
        record.authorization.reviewedCandidate,
      ),
    );
    closedKeys(
      priorCandidate,
      ['formatVersion', 'kind', 'sourceBeforeLease', 'inputs', 'reviews'],
      'full predecessor reviewed candidate',
    );
    requireFact(
      priorCandidate.formatVersion === 1 &&
        priorCandidate.kind === 'reviewed-stynx-storage-candidate',
      'full predecessor candidate kind differs',
    );
    collect(priorCandidate.sourceBeforeLease);
    requireFact(
      readFixedReference(
        admission.root,
        priorCandidate.sourceBeforeLease,
      ).includes('const storageRunnerActivation = null;'),
      'full predecessor null-seal source differs',
    );
    closedKeys(
      priorCandidate.reviews,
      ['inspector', 'independent'],
      'full predecessor reviews',
    );
    for (const [key, actor] of [
      ['inspector', '/root/inspector_adoption_160'],
      ['independent', '/root/architect_adoption_160'],
    ]) {
      const review = priorCandidate.reviews[key];
      closedKeys(review, ['actor', 'report'], 'full predecessor reviewer');
      requireFact(
        review.actor === actor,
        'full predecessor review actor differs',
      );
      collect(review.report);
    }
    requireFact(
      Array.isArray(priorCandidate.inputs),
      'full predecessor input inventory absent',
    );
    const priorPaths = priorCandidate.inputs.map((ref) => ref.path);
    requireFact(
      new Set(priorPaths).size === priorPaths.length &&
        isDeepStrictEqual(priorPaths, [...priorPaths].sort()),
      'full predecessor inputs duplicate/unsorted',
    );
    for (const input of priorCandidate.inputs) collect(input);
    const priorActivation = JSON.parse(
      readFixedReference(admission.root, record.authorization.activation),
    );
    const priorLease = JSON.parse(
      readFixedReference(admission.root, record.authorization.lease),
    );
    requireFact(
      priorActivation.status === 'ACTIVE' &&
        priorActivation.lease.sha256 === record.authorization.lease.sha256 &&
        priorActivation.reviewedCandidate.sha256 ===
          record.authorization.reviewedCandidate.sha256 &&
        priorLease.status === 'ACTIVE' &&
        priorLease.full === true &&
        priorLease.subjects.some((s) => isDeepStrictEqual(s, originalSubject)),
      'full predecessor authorization differs',
    );
    const observations = record.observations;
    requireFact(
      observations.drop.command === 'DROP DATABASE "detran_r22_161_full"' &&
        observations.create.command ===
          'CREATE DATABASE "detran_r22_161_full" OWNER postgres' &&
        observations.drop.result.command === 'DROP' &&
        observations.create.result.command === 'CREATE' &&
        observations.after.databaseOid === replacementSubject.databaseOid,
      'full actual lifecycle observations differ',
    );
    if (record.predecessor) readChain(record.predecessor, originalSubject);
    else
      requireFact(
        originalSubject.databaseOid === '16389' &&
          record.originalSubjectManifest.path ===
            'scratch/r22-adoption-161/db-rehearsal/cluster-02/subject-manifest.json' &&
          record.originalSubjectManifest.sha256 ===
            'sha256:9a55a7457574612ec63c1deeb7f34c82095155e08f833acb89765ce7f629ecc4',
        'full original anchor differs',
      );
    return replacementSubject;
  };
  requireFact(
    lease.subjects.length === 1,
    'full repeat lease subject cardinality differs',
  );
  const result = readChain(lease.fullRecreation, lease.subjects[0]);
  admission.fullChainRefs = refs;
  return structuredClone(result);
}

function classifyApprovedRunnerRoleGraph(actual, prior) {
  const names = [
    'roles',
    'memberships',
    'roleSettings',
    'effective-role-closure',
  ];
  const valid = (graph) =>
    graph !== null &&
    typeof graph === 'object' &&
    !Array.isArray(graph) &&
    Object.keys(graph).sort().join(',') === [...names].sort().join(',') &&
    names.every((key) => Array.isArray(graph[key]));
  requireFact(valid(prior) && valid(actual), 'malformed complete role graph');
  for (const graph of [prior, actual]) {
    const roleNames = new Set(),
      oids = new Set();
    for (const row of graph.roles) {
      requireFact(
        row !== null &&
          typeof row === 'object' &&
          !Array.isArray(row) &&
          typeof row.rolname === 'string' &&
          row.rolname.length > 0 &&
          typeof row.oid === 'string' &&
          /^[1-9][0-9]*$/u.test(row.oid) &&
          Number(row.oid) <= 4294967295 &&
          !roleNames.has(row.rolname) &&
          !oids.has(row.oid),
        'malformed or duplicate role identity',
      );
      roleNames.add(row.rolname);
      oids.add(row.oid);
    }
  }
  requireFact(
    !prior.roles.some((row) => row.rolname === 'role_rait_priority_writer'),
    'historical prior role graph unexpectedly contains writer',
  );
  if (isDeepStrictEqual(actual, prior))
    return {
      profile: 'prior-exact',
      graph: structuredClone(actual),
      writerRoleOid: null,
    };
  const writer = actual.roles.filter(
    (row) => row.rolname === 'role_rait_priority_writer',
  );
  requireFact(
    writer.length === 1 && actual.roles.length === prior.roles.length + 1,
    'only one approved priority writer role may be added',
  );
  const expected = {
    oid: writer[0].oid,
    rolname: 'role_rait_priority_writer',
    rolsuper: false,
    rolinherit: true,
    rolcreaterole: false,
    rolcreatedb: false,
    rolcanlogin: false,
    rolreplication: false,
    rolbypassrls: false,
    rolconnlimit: -1,
    rolvaliduntil: null,
  };
  requireFact(
    Object.keys(writer[0]).sort().join(',') ===
      Object.keys(expected).sort().join(',') &&
      Object.entries(expected).every(
        ([key, value]) => writer[0][key] === value,
      ),
    'priority writer flags or closed fields differ',
  );
  requireFact(
    isDeepStrictEqual(
      actual.roles.filter((row) => row !== writer[0]),
      prior.roles,
    ) &&
      names
        .filter((key) => key !== 'roles')
        .every((key) => isDeepStrictEqual(actual[key], prior[key])),
    'complete existing role graph differs; no role repair allowed',
  );
  return {
    profile: 'prior-plus-priority-writer',
    graph: structuredClone(actual),
    writerRoleOid: writer[0].oid,
  };
}
function classifyStorageExecutionLane(lease, subject, state, full) {
  const object = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  requireFact(
    object(lease) &&
      object(subject) &&
      object(state) &&
      typeof full === 'boolean',
    'malformed execution lane facts',
  );
  requireFact(
    (lease.executionLane === 'package-only-g03' ||
      lease.executionLane === 'full-consumer') &&
      lease.full === full &&
      Array.isArray(lease.subjects) &&
      lease.subjects.length === 1 &&
      isDeepStrictEqual(lease.subjects[0], subject),
    'sealed execution lane or sole subject differs',
  );
  requireFact(
    subject.clusterSystemIdentifier === '7696293464811719840' &&
      subject.owner === 'postgres' &&
      typeof subject.databaseOid === 'string' &&
      /^[1-9][0-9]*$/u.test(subject.databaseOid) &&
      Number(subject.databaseOid) <= 4294967295,
    'actual lane subject identity differs',
  );
  if (lease.executionLane === 'package-only-g03') {
    requireFact(
      !full &&
        subject.databaseName === 'detran_r22_161_g03_upgrade' &&
        subject.databaseOid === '18767',
      'package lane requires actual g03 upgrade subject',
    );
    requireFact(
      (state.mode === 'upgrade-fresh-1.6.0' && state.group == null) ||
        (state.mode === 'repeat-1.6.1' &&
          object(state.group) &&
          state.group.mode === 'upgrade-fresh-1.6.0'),
      'package lane state or actual upgrade group differs',
    );
  } else {
    requireFact(
      (!full &&
        subject.databaseName === 'detran_r22_161_fresh' &&
        subject.databaseOid === '16387') ||
        (full && subject.databaseName === 'detran_r22_161_full'),
      'full consumer requires admitted fresh or full subject',
    );
    requireFact(
      (state.mode === 'fresh-1.6.1' && state.group == null) ||
        (state.mode === 'repeat-1.6.1' &&
          object(state.group) &&
          state.group.mode === 'fresh-1.6.1'),
      'full consumer state or actual fresh group differs',
    );
  }
  return lease.executionLane;
}
// Actual current-subject writer privilege observation; never mutates its subject.
const writerFootprintSql = `WITH writer AS (
  SELECT oid FROM pg_catalog.pg_roles WHERE rolname='role_rait_priority_writer'
), expected_tables(schema_name,table_name,privilege_type) AS (VALUES
  ('inf','rait_case','SELECT'),('inf','rait_document','SELECT'),
  ('inf','rait_pool','SELECT'),('inf','rait_pool_member','SELECT'),
  ('inf','ait_ait','SELECT'),('auth','tenants','SELECT'),('ops','parameter','SELECT'),
  ('inf','rait_priority_assessment','SELECT'),('inf','rait_priority_assessment','INSERT'),
  ('inf','rait_priority_basis','SELECT'),('inf','rait_priority_basis','INSERT')
), expected_functions(signature) AS (VALUES
  ('inf.rait_priority_mark_insert()'),('inf.rait_priority_document_guard()'),
  ('inf.rait_priority_consistency()'),
  ('inf.rait_record_initial_priority(uuid,uuid,timestamptz,jsonb)')
), table_grants AS (
  SELECT n.nspname AS schema_name,c.relname AS table_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN writer w CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
  WHERE a.grantee=w.oid AND c.relowner<>w.oid
), column_grants AS (
  SELECT n.nspname AS schema_name,c.relname AS table_name,t.attname AS column_name,
    a.privilege_type,a.is_grantable,pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_catalog.pg_attribute t ON t.attrelid=c.oid AND t.attnum>0 AND NOT t.attisdropped
  CROSS JOIN writer w CROSS JOIN LATERAL pg_catalog.aclexplode(t.attacl) a
  WHERE a.grantee=w.oid
), function_grants AS (
  SELECT p.oid::pg_catalog.regprocedure::text AS signature,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_proc p CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) a
  WHERE a.grantee=w.oid AND p.proowner<>w.oid
), schema_grants AS (
  SELECT n.nspname AS schema_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_namespace n CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(n.nspacl) a WHERE a.grantee=w.oid
), database_grants AS (
  SELECT d.datname AS database_name,a.privilege_type,a.is_grantable,
    pg_catalog.pg_get_userbyid(a.grantor) AS grantor
  FROM pg_catalog.pg_database d CROSS JOIN writer w
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.datacl) a WHERE a.grantee=w.oid
), owned_functions AS (
  SELECT p.oid::pg_catalog.regprocedure::text AS signature,p.oid::text AS oid,
    p.prosecdef,p.proconfig
  FROM pg_catalog.pg_proc p JOIN writer w ON p.proowner=w.oid
), expected_table_rows AS (
  SELECT e.* FROM expected_tables e
), expected_schema_rows(schema_name,privilege_type) AS (VALUES
  ('inf','USAGE'),('auth','USAGE'),('ops','USAGE')
), minimal_issues(reason) AS (
  SELECT 'writer-has-other-role-reachability' WHERE EXISTS (
    SELECT FROM writer w JOIN pg_catalog.pg_roles r ON r.oid<>w.oid
    WHERE pg_catalog.pg_has_role(w.oid,r.oid,'SET') OR pg_catalog.pg_has_role(w.oid,r.oid,'USAGE') OR pg_catalog.pg_has_role(w.oid,r.oid,'MEMBER'))
  UNION ALL SELECT 'writer-membership' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_auth_members a CROSS JOIN writer w WHERE a.roleid=w.oid OR a.member=w.oid)
  UNION ALL SELECT 'writer-database-create' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_database d CROSS JOIN writer w WHERE pg_catalog.has_database_privilege(w.oid,d.oid,'CREATE'))
  UNION ALL SELECT 'writer-user-schema-create' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_namespace n CROSS JOIN writer w
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema' AND pg_catalog.has_schema_privilege(w.oid,n.oid,'CREATE'))
  UNION ALL SELECT 'writer-owns-persistent-relation-or-schema' WHERE EXISTS (
    SELECT FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace JOIN writer w ON c.relowner=w.oid
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'
    UNION ALL SELECT FROM pg_catalog.pg_namespace n JOIN writer w ON n.nspowner=w.oid
    WHERE pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema')
  UNION ALL SELECT 'writer-grant-option-or-grantor' WHERE EXISTS (
    SELECT FROM table_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM column_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM function_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM schema_grants WHERE is_grantable OR grantor<>'postgres'
    UNION ALL SELECT FROM database_grants WHERE is_grantable OR grantor<>'postgres')
  UNION ALL SELECT 'writer-database-acl' WHERE EXISTS (
    SELECT FROM database_grants WHERE privilege_type<>'TEMPORARY' OR database_name NOT IN ('detran_r22_161_fresh','detran_r22_161_full'))
), full_only_issues(reason) AS (
  SELECT 'writer-table-grants' WHERE EXISTS (
    (SELECT schema_name,table_name,privilege_type FROM table_grants EXCEPT SELECT * FROM expected_table_rows)
    UNION ALL (SELECT * FROM expected_table_rows EXCEPT SELECT schema_name,table_name,privilege_type FROM table_grants))
  UNION ALL SELECT 'writer-column-grants' WHERE EXISTS (
    (SELECT schema_name,table_name,column_name,privilege_type FROM column_grants EXCEPT SELECT 'inf','rait_case','legal_priority','UPDATE')
    UNION ALL (SELECT 'inf','rait_case','legal_priority','UPDATE' EXCEPT SELECT schema_name,table_name,column_name,privilege_type FROM column_grants))
  UNION ALL SELECT 'writer-function-grants' WHERE EXISTS (
    (SELECT signature,privilege_type FROM function_grants EXCEPT SELECT 'auth.current_tenant()','EXECUTE')
    UNION ALL (SELECT 'auth.current_tenant()','EXECUTE' EXCEPT SELECT signature,privilege_type FROM function_grants))
  UNION ALL SELECT 'writer-schema-grants' WHERE EXISTS (
    (SELECT schema_name,privilege_type FROM schema_grants EXCEPT SELECT * FROM expected_schema_rows)
    UNION ALL (SELECT * FROM expected_schema_rows EXCEPT SELECT schema_name,privilege_type FROM schema_grants))
  UNION ALL SELECT 'writer-current-subject-temporary' WHERE pg_catalog.current_database() IN ('detran_r22_161_fresh','detran_r22_161_full') AND EXISTS(SELECT FROM writer)
    AND (NOT EXISTS(SELECT FROM database_grants WHERE database_name=pg_catalog.current_database() AND privilege_type='TEMPORARY')
      OR NOT pg_catalog.has_database_privilege((SELECT oid FROM writer),pg_catalog.current_database(),'TEMPORARY'))
  UNION ALL SELECT 'writer-owned-functions' WHERE EXISTS (
    (SELECT signature FROM owned_functions EXCEPT SELECT pg_catalog.to_regprocedure(signature)::text FROM expected_functions)
    UNION ALL (SELECT pg_catalog.to_regprocedure(signature)::text FROM expected_functions EXCEPT SELECT signature FROM owned_functions))
    OR (SELECT count(*) FROM owned_functions)<>4
    OR EXISTS(SELECT FROM owned_functions WHERE NOT prosecdef)
  UNION ALL SELECT 'writer-declared-effective-rights' WHERE EXISTS (
    SELECT FROM expected_tables e CROSS JOIN writer w
    WHERE pg_catalog.to_regclass(pg_catalog.format('%I.%I',e.schema_name,e.table_name)) IS NULL
      OR NOT pg_catalog.has_table_privilege(w.oid,pg_catalog.to_regclass(pg_catalog.format('%I.%I',e.schema_name,e.table_name)),e.privilege_type))
    OR EXISTS(SELECT FROM writer w WHERE NOT COALESCE(pg_catalog.has_column_privilege(
      w.oid,pg_catalog.to_regclass('inf.rait_case'),
      (SELECT a.attnum FROM pg_catalog.pg_attribute a WHERE a.attrelid=pg_catalog.to_regclass('inf.rait_case') AND a.attname='legal_priority' AND a.attnum>0 AND NOT a.attisdropped),
      'UPDATE'),false))

), empty_only_issues(reason) AS (
  SELECT 'writer-current-subject-nonempty-footprint' WHERE EXISTS(SELECT FROM table_grants)
    OR EXISTS(SELECT FROM column_grants) OR EXISTS(SELECT FROM function_grants)
    OR EXISTS(SELECT FROM schema_grants) OR EXISTS(SELECT FROM owned_functions)
    OR EXISTS(SELECT FROM database_grants WHERE database_name=pg_catalog.current_database())
), public_relation_defaults AS (
  -- These PUBLIC rights are independent of the new role. Record separately;
  -- never substitute them for any declared writer grant or allow CREATE.
  SELECT c.oid::text AS oid,n.nspname,c.relname,a.privilege_type,a.is_grantable,
    EXISTS(SELECT FROM pg_catalog.pg_depend d WHERE d.classid='pg_catalog.pg_class'::pg_catalog.regclass AND d.objid=c.oid AND d.deptype='e') AS extension_owned
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
  WHERE a.grantee=0 AND pg_catalog.left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'
)
SELECT pg_catalog.jsonb_build_object(
  'writerRoleOid',(SELECT oid::text FROM writer),
  'subjectFootprint',CASE WHEN NOT EXISTS(SELECT FROM writer) THEN 'role-absent'
    WHEN NOT EXISTS(SELECT FROM minimal_issues) AND NOT EXISTS(SELECT FROM empty_only_issues) THEN 'empty-subject-footprint'
    WHEN NOT EXISTS(SELECT FROM minimal_issues) AND NOT EXISTS(SELECT FROM full_only_issues) THEN 'full-consumer-footprint'
    ELSE 'invalid' END,
  'minimalViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM minimal_issues) ELSE '[]'::jsonb END,
  'emptyViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM (SELECT * FROM minimal_issues UNION ALL SELECT * FROM empty_only_issues) a) ELSE '[]'::jsonb END,
  'fullViolations',CASE WHEN EXISTS(SELECT FROM writer) THEN (SELECT COALESCE(pg_catalog.jsonb_agg(reason ORDER BY reason),'[]'::jsonb) FROM (SELECT * FROM minimal_issues UNION ALL SELECT * FROM full_only_issues) a) ELSE '[]'::jsonb END,
  'directTableGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,table_name,privilege_type),'[]'::jsonb) FROM table_grants a),
  'directColumnGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,table_name,column_name,privilege_type),'[]'::jsonb) FROM column_grants a),
  'directFunctionGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY signature,privilege_type),'[]'::jsonb) FROM function_grants a),
  'directSchemaGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY schema_name,privilege_type),'[]'::jsonb) FROM schema_grants a),
  'directDatabaseGrants',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY database_name,privilege_type),'[]'::jsonb) FROM database_grants a),
  'ownedFunctions',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY signature),'[]'::jsonb) FROM owned_functions a),
  'publicRelationDefaults',(SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY nspname,relname,privilege_type),'[]'::jsonb) FROM public_relation_defaults a)
) AS profile;`;
async function readWriterFootprint(client) {
  return (await client.query(writerFootprintSql)).rows[0].profile;
}
async function readRunnerRoleGraph(client) {
  const actual = (
    await client.query(`SELECT jsonb_build_object(
      'roles',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY rolname),'[]') FROM (SELECT oid::text,rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text FROM pg_roles) a),
      'memberships',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY roleid,member),'[]') FROM pg_auth_members a),
      'effective-role-closure',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY principal,reachable),'[]') FROM (SELECT p.rolname AS principal,r.rolname AS reachable,pg_has_role(p.oid,r.oid,'SET') AS can_set,pg_has_role(p.oid,r.oid,'USAGE') AS inherits,pg_has_role(p.oid,r.oid,'MEMBER') AS member,r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,r.rolreplication,has_database_privilege(r.oid,current_database(),'CREATE') AS database_create,has_schema_privilege(r.oid,'public','CREATE') AS public_create FROM pg_roles p CROSS JOIN pg_roles r WHERE p.rolname IN ('role_app_backend','role_auditor_min','role_r22_161_app') AND (p.oid=r.oid OR pg_has_role(p.oid,r.oid,'SET') OR pg_has_role(p.oid,r.oid,'USAGE') OR pg_has_role(p.oid,r.oid,'MEMBER'))) a),
      'roleSettings',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY setdatabase,setrole),'[]') FROM pg_db_role_setting a WHERE setdatabase=0 OR setdatabase=(SELECT oid FROM pg_database WHERE datname=current_database()))) AS graph`)
  ).rows[0].graph;
  return actual;
}
async function assertRunnerRoles(client, admission, expected = null) {
  await client.query('BEGIN READ ONLY');
  try {
    await client.query(utcContextSql);
    const actual = await readRunnerRoleGraph(client);
    const classified = classifyApprovedRunnerRoleGraph(
      actual,
      admission.roleGraph,
    );
    if (expected !== null)
      requireFact(
        isDeepStrictEqual(actual, expected),
        'actual role graph differs from retained target candidate',
      );
    await client.query('ROLLBACK');
    return classified;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
// The prior child is a fixed selected-method verifier, never an SDK/service
// launcher or current-workspace fallback. Its source SHA is sealed after review.
const priorVerifierSourceSha256 =
  '271bffecb4f1e8f0631f8adc4a1b2894c48966dc54be925c1415288a577d668d';
async function verifyPriorReadOnly(root, admission, settings, retained) {
  requireFact(
    settings.database === 'detran_r22_161_g03_upgrade' &&
      admission.subject.databaseOid === '18767',
    'prior verifier is restricted to actual pre-upgrade18767',
  );
  const closureRef = {
    path: 'scratch/r22-adoption-161/prior-runtime/closure-manifest.json',
    sha256:
      'sha256:55454077278d8c60ac6abcb8b829fcc8bbcaa88efe09e1a2f0e07eb26f879f5d',
  };
  const closure = JSON.parse(readFixedReference(root, closureRef));
  const executable = closure.node.realpath;
  requireFact(
    fs.realpathSync(executable) === executable &&
      digest(fs.readFileSync(executable)) === closure.node.sha256,
    'prior Node executable differs',
  );
  const script = path.join(root, 'tools/stynx-storage-prior-verifier.mjs');
  requireFact(
    priorVerifierSourceSha256 !== null &&
      digest(fs.readFileSync(script)) === priorVerifierSourceSha256,
    'prior verifier source is not sealed',
  );
  const output = path.relative(
    root,
    path.join(retained.directory, 'prior-verifier-report.json'),
  );
  const request = retained.write('prior-verifier-request.json', {
    formatVersion: 1,
    kind: 'prior-public-verifier-request',
    phase: 'prior160-before-upgrade',
    attemptId: retained.attemptId,
    activation: admission.activation.externalRef,
    admittedInputs: plainRef(admission.activation.discovery),
    subject: admission.subject,
    endpoint: { host: settings.host, port: settings.port },
    output,
  });
  const emptyPassword = path.join(
    root,
    'scratch/r22-adoption-161/db-rehearsal/cluster-02/inspector-empty-password-file',
  );
  requireFact(
    fs.lstatSync(emptyPassword).isFile() &&
      !fs.lstatSync(emptyPassword).isSymbolicLink() &&
      fs.readFileSync(emptyPassword).length === 0,
    'fixed empty password file differs',
  );
  const environment = {
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    TZ: 'UTC',
    PGCLIENTENCODING: 'UTF8',
    PGPASSFILE: emptyPassword,
    DETRAN_STYNX_PRIOR_VERIFIER_REQUEST_SHA: request.sha256,
    DETRAN_STYNX_STORAGE_EXECUTION_SHA: admission.activation.externalRef.sha256,
  };
  const stdout = fs.openSync(
    path.join(retained.directory, 'reports/prior-verifier.stdout.log'),
    'wx',
    0o600,
  );
  const stderr = fs.openSync(
    path.join(retained.directory, 'reports/prior-verifier.stderr.log'),
    'wx',
    0o600,
  );
  let child;
  try {
    child = spawn(executable, [script, root, retained.attemptId], {
      cwd: root,
      env: environment,
      stdio: ['ignore', stdout, stderr],
      shell: false,
    });
    let spawnError = null;
    const completion = new Promise((resolve) => {
      child.once('error', (error) => {
        spawnError = error.message;
      });
      child.once('close', (code, signal) =>
        resolve({ code, signal, spawnError }),
      );
    });
    const stop = () => child.kill('SIGTERM');
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'])
      process.on(signal, stop);
    try {
      const result = await completion;
      retained.write('reports/prior-child-completion.json', result);
      const actualReport = path.join(root, output);
      if (fs.existsSync(actualReport)) {
        const bytes = fs.readFileSync(actualReport);
        retained.files.push({
          path: output,
          bytes: bytes.length,
          sha256: 'sha256:' + digest(bytes),
        });
      }
      requireFact(
        result.code === 0 && !result.signal && !result.spawnError,
        'prior read-only verifier child STOP',
      );
    } finally {
      for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'])
        process.removeListener(signal, stop);
    }
  } finally {
    fs.fsyncSync(stdout);
    fs.fsyncSync(stderr);
    fs.closeSync(stdout);
    fs.closeSync(stderr);
    for (const name of [
      'reports/prior-verifier.stdout.log',
      'reports/prior-verifier.stderr.log',
    ]) {
      const file = path.join(retained.directory, name),
        bytes = fs.readFileSync(file);
      retained.files.push({
        path: path.relative(root, file),
        bytes: bytes.length,
        sha256: 'sha256:' + digest(bytes),
      });
    }
  }
  createStorageTargetPlan(root, admission.inputs); // Rehash corpus after the child.
  const bytes = fs.readFileSync(path.join(root, output));
  const report = JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(bytes),
  );
  requireFact(
    report.disposition === 'verified-read-only' &&
      report.clientsClosed === true &&
      report.rolledBack === true &&
      isDeepStrictEqual(report.subject, admission.subject),
    'prior verifier cleanup/report facts differ',
  );
  requireFact(
    report.reports.length === 2 &&
      report.reports.every(
        (report) =>
          report.supported === true &&
          report.packageVersion === '1.6.0' &&
          Array.isArray(report.checks) &&
          report.checks.every((check) => check.status === 'pass'),
      ),
    'prior public verifier FAIL/UNKNOWN/unsupported',
  );
  return report;
}
function createRunRetention(root, admission, settings) {
  const parent = path.join(
    root,
    path.dirname(discoveryPath),
    'installer-custody',
    settings.database,
  );
  let current = root;
  for (const part of path.relative(root, parent).split(path.sep)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) fs.mkdirSync(current, { mode: 0o700 });
    requireFact(
      fs.lstatSync(current).isDirectory() &&
        !fs.lstatSync(current).isSymbolicLink(),
      'retention directory escape',
    );
  }
  const attemptId = randomUUID();
  const directory = path.join(parent, 'attempt-' + attemptId);
  fs.mkdirSync(directory, { mode: 0o700 });
  fs.mkdirSync(path.join(directory, 'candidate'), { mode: 0o700 });
  fs.mkdirSync(path.join(directory, 'reports'), { mode: 0o700 });
  const files = [];
  const write = (name, value, raw = false) => {
    requireFact(
      /^(?:candidate\/|reports\/)?[a-z0-9-]+[.]json$/u.test(name),
      'unknown retention filename',
    );
    const bytes = Buffer.from(raw ? value : canonicalJson(value) + '\n');
    const file = path.join(directory, name);
    const fd = fs.openSync(
      file,
      fs.constants.O_WRONLY |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_NOFOLLOW,
      0o600,
    );
    try {
      fs.writeFileSync(fd, bytes);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    const parentFd = fs.openSync(path.dirname(file), fs.constants.O_RDONLY);
    try {
      fs.fsyncSync(parentFd);
    } finally {
      fs.closeSync(parentFd);
    }
    const ref = {
      path: path.relative(root, file),
      sha256: `sha256:${digest(bytes)}`,
    };
    files.push({ ...ref, bytes: bytes.length });
    return ref;
  };
  return { directory, attemptId, files, write, admission };
}
async function readSubjectFacts(client, admission, maintenance = false) {
  const result =
    await client.query(`SELECT (SELECT system_identifier::text FROM pg_control_system()) AS "clusterSystemIdentifier",
    d.oid::text AS "databaseOid",d.datname AS "databaseName",pg_get_userbyid(d.datdba) AS owner,
    current_user AS "currentUser",session_user AS "sessionUser",current_setting('data_directory') AS "dataDirectory",
    current_setting('port') AS port,current_setting('listen_addresses') AS "listenAddresses",
    current_setting('unix_socket_directories') AS "unixSockets",current_setting('server_version_num') AS "serverVersionNum",
    pg_read_file('postmaster.pid') AS pidfile,transaction_timestamp()::text AS "atSql",
    to_char(transaction_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "atUtc"
    FROM pg_database d WHERE d.datname=current_database()`);
  requireFact(result.rows.length === 1, 'actual subject identity missing');
  const facts = result.rows[0],
    expected = admission.manifest;
  requireFact(
    facts.clusterSystemIdentifier ===
      admission.subject.clusterSystemIdentifier &&
      facts.owner === 'postgres' &&
      facts.currentUser === 'postgres' &&
      facts.sessionUser === 'postgres',
    'actual cluster/owner/context differs',
  );
  requireFact(
    facts.dataDirectory === expected.dataDirectory &&
      facts.port === String(expected.endpoint.port) &&
      facts.listenAddresses === '127.0.0.1' &&
      facts.unixSockets === '' &&
      facts.serverVersionNum === '180002' &&
      digest(facts.pidfile) === expected.postmaster.pidfileSha256,
    'actual server/process differs',
  );
  if (maintenance)
    requireFact(
      facts.databaseName === 'postgres',
      'maintenance database differs',
    );
  else
    requireFact(
      facts.databaseName === admission.subject.databaseName &&
        facts.databaseOid === admission.subject.databaseOid,
      'actual subject OID/name differs',
    );
  return facts;
}
async function readStorageSnapshot(client) {
  const catalog = (
    await client.query(`SELECT jsonb_build_object('schemas',
    (SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY n.nspname),'[]'::jsonb) FROM pg_namespace n WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'relations',(SELECT coalesce(jsonb_agg((to_jsonb(c)-'relpages'-'reltuples'-'relallvisible'-'relallfrozen'-'relfrozenxid'-'relminmxid') ORDER BY c.oid),'[]'::jsonb) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'constraints',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.oid),'[]'::jsonb) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'triggers',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.oid),'[]'::jsonb) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'functions',(SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.oid),'[]'::jsonb) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'attributes',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.attrelid,a.attnum),'[]'::jsonb) FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'defaults',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.oid),'[]'::jsonb) FROM pg_attrdef a JOIN pg_class c ON c.oid=a.adrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'indexes',(SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.indexrelid),'[]'::jsonb) FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'),
    'default_acl',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.oid),'[]'::jsonb) FROM pg_default_acl a),
    'event_triggers',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.oid),'[]'::jsonb) FROM pg_event_trigger t),
    'extensions',(SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.oid),'[]'::jsonb) FROM pg_extension e),
    'policies',(SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.oid),'[]'::jsonb) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema'))::text AS catalog`)
  ).rows[0].catalog;
  const relations = (
    await client.query(
      `SELECT n.nspname,c.relname,c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema' AND c.relkind IN ('r','p','S') ORDER BY n.nspname,c.relname`,
    )
  ).rows;
  const records = [];
  const identifier = (value) => '"' + value.replaceAll('"', '""') + '"';
  for (const relation of relations) {
    const name =
      identifier(relation.nspname) + '.' + identifier(relation.relname);
    const rows = (
      await client.query(
        relation.relkind === 'S'
          ? `SELECT to_jsonb(s)::text AS row FROM (SELECT last_value,log_cnt,is_called FROM ${name}) s`
          : `SELECT to_jsonb(t)::text AS row FROM ${name} t`,
      )
    ).rows
      .map((row) => row.row)
      .sort();
    records.push({
      relation: relation.nspname + '.' + relation.relname,
      kind: relation.relkind,
      rows,
    });
  }
  const roleGraph = await readRunnerRoleGraph(client);
  const writerFootprint = await readWriterFootprint(client);
  return { catalog, records, roleGraph, writerFootprint };
}
const utcContextSql = `SET LOCAL TIME ZONE 'UTC'; SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public; SET LOCAL standard_conforming_strings=on`;
function custodyAssertion(root) {
  const sql = readFixedReference(root, {
    path: 'backend/database/ddl/19-stynx-offline-custody.sql',
    sha256:
      'sha256:930916f329a42b7b13b7d982cb22334a8af3f6bc423b18e49679bc4a3c035115',
  });
  const marker = 'DO $custody_catalog$';
  requireFact(
    sql.indexOf(marker) === sql.lastIndexOf(marker) && sql.includes(marker),
    'custody assertion boundary differs',
  );
  return { sql, assertion: sql.slice(sql.indexOf(marker)) };
}
async function readFreshRows(client) {
  return (
    await client.query(`SELECT package,identity::text AS identity_sql_text,installed_by::text AS installed_by,
    installed_at::text AS installed_at_sql,to_char(installed_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS installed_at_utc
    FROM ${ledger} ORDER BY package`)
  ).rows.map(({ identity_sql_text, ...row }) => ({
    ...row,
    identity: JSON.parse(identity_sql_text),
  }));
}
const custodyFinalPrivilegesSql = `REVOKE ALL ON integration.stynx_offline_baseline_custody,integration.stynx_offline_forward_receipts,integration.stynx_storage_target_admissions FROM PUBLIC,role_app_backend,role_auditor_min;
REVOKE ALL ON FUNCTION integration.stynx_offline_custody_immutable(),integration.stynx_storage_target_admissions_immutable() FROM PUBLIC,role_app_backend,role_auditor_min;`;

function baselineColumns(document) {
  return {
    baseline_id: document.recordSha256,
    package: '@stynx-nyx/offline-sync',
    prior_package_version: '1.6.0',
    target_package_version: '1.6.1',
    subject_digest: recordDigest(document.subject),
    fresh_receipt_digest: document.freshReceipt.rowDigest,
    target_publication_digest: recordDigest(document.targetPublication),
    binding_digest: recordDigest(document.projectedPrefix.binding),
    covered_prefix_length: 8,
    last_covered_source: document.coveredSources[7].sourcePath,
    projected_prefix_digest: document.projectedPrefix.digest,
  };
}
function forwardColumns(document) {
  return {
    receipt_id: document.recordSha256,
    baseline_id: document.baselineId,
    package: document.package,
    target_package_version: document.targetPackageVersion,
    target_publication_digest: document.targetPublicationDigest,
    binding_digest: document.bindingDigest,
    ordinal: document.ordinal,
    source_path: document.source.path,
    raw_source_digest: 'sha256:' + document.source.sha256,
    bound_sql_digest: 'sha256:' + document.boundSqlSha256,
    predecessor_baseline_id: document.predecessor.baselineId,
    predecessor_receipt_id: null,
    predecessor_ordinal: 8,
  };
}
function groupColumns(document) {
  return {
    admission_id: document.recordSha256,
    mode: document.mode,
    target_package_version: '1.6.1',
    fresh_package_version: document.mode === 'fresh-1.6.1' ? '1.6.1' : '1.6.0',
    subject_digest: recordDigest(document.subject),
    target_publication_digest: recordDigest(document.targetPublication),
    binding_digest: document.bindingDigest,
    outbox_package: '@stynx-nyx/outbox',
    offline_package: '@stynx-nyx/offline-sync',
    outbox_fresh_receipt_digest: document.freshReceipts.outbox.rowDigest,
    offline_fresh_receipt_digest: document.freshReceipts.offline.rowDigest,
    offline_baseline_id:
      document.mode === 'fresh-1.6.1' ? null : document.offline.baselineId,
    offline_forward_receipt_id:
      document.mode === 'fresh-1.6.1'
        ? null
        : document.offline.forwardReceiptId,
    offline_last_ordinal: document.mode === 'fresh-1.6.1' ? null : 9,
  };
}
function custodyProjection(kind) {
  const by = kind === 'forward' ? 'executed' : 'admitted';
  return `(to_jsonb(t)-'document'-'${by}_at'-'${by}_by')::text AS columns,
    document::text AS document_text,${by}_by::text AS by,${by}_at::text AS at_sql,
    to_char(${by}_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS at_utc`;
}
function decodeCustodyRow(kind, row) {
  const parsed = parseStorageCustodyDocument(row.document_text, kind);
  const document = parsed.document;
  const expected = {
    baseline: baselineColumns,
    forward: forwardColumns,
    group: groupColumns,
  }[kind](document);
  requireFact(
    isDeepStrictEqual(JSON.parse(row.columns), expected),
    'total custody column/document equality differs: ' + kind,
  );
  requireFact(
    row.by === 'postgres' &&
      /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d{1,6})?\+00$/u.test(row.at_sql),
    'custody actual actor/time invalid',
  );
  const normalized = row.at_sql.replace(' ', 'T').slice(0, -3).split('.');
  requireFact(
    normalized[0] + '.' + (normalized[1] ?? '').padEnd(6, '0') + 'Z' ===
      row.at_utc,
    'custody SQL time representations differ',
  );
  if (kind !== 'baseline')
    requireFact(
      document[kind === 'forward' ? 'execution' : 'admission'].by === row.by &&
        document[kind === 'forward' ? 'execution' : 'admission'].atUtc ===
          row.at_utc,
      'custody document/SQL actor/time differs',
    );
  return { document, by: row.by, atSql: row.at_sql, atUtc: row.at_utc };
}
async function custodyRows(client, kind) {
  const relation = {
    baseline: custodyRelations[0],
    forward: custodyRelations[1],
    group: custodyRelations[2],
  }[kind];
  const result = await client.query(
    `SELECT ${custodyProjection(kind)} FROM ${relation} t`,
  );
  return result.rows.map((row) => decodeCustodyRow(kind, row));
}
function verifyDocumentRefs(root, document) {
  // Public source descriptors and opaque original identity are not custody refs.
  // Traverse only the closed B8 reference fields, never shape-match arbitrary JSON.
  const refs = [];
  const publication = document.targetPublication;
  if (publication)
    refs.push(
      publication.verification,
      publication.packageAdmission,
      publication.projection,
    );
  if (document.formatVersion === 'detran-stynx-offline-fresh-baseline/1') {
    refs.push(
      document.freshReceipt.assertion,
      ...Object.values(document.freshReceipt.group).map((e) => e.rowArtifact),
    );
    refs.push(
      ...['entrypoint', 'declaration', 'artifact', 'runtimeClosure'].map(
        (k) => document.priorPackage[k],
      ),
    );
    refs.push(
      document.projectedPrefix.implementation.entrypoint,
      ...document.projectedPrefix.migrations.map((m) => m.boundSqlArtifact),
    );
    refs.push(
      ...['record', 'expectedCatalog', 'actualCatalog', 'rowInvariants'].map(
        (k) => document.priorState[k],
      ),
      ...document.priorState.verifierReports.map((r) => r.report),
    );
    for (const reference of [
      document.equivalence.referenceA,
      document.equivalence.referenceB,
    ])
      refs.push(
        reference.installation,
        reference.priorVerifierBefore,
        reference.priorVerifierAfter,
      );
    refs.push(
      document.equivalence.report,
      document.equivalence.comparator,
      ...document.equivalence.rawSnapshots,
      ...Object.values(document.review).map((r) => r.report),
    );
  } else if (
    document.formatVersion === 'detran-stynx-offline-forward-receipt/1'
  )
    refs.push(document.evidence.boundSqlArtifact);
  else {
    refs.push(
      ...Object.values(document.freshReceipts).map((r) => r.rowArtifact),
    );
    if (document.mode === 'fresh-1.6.1')
      refs.push(document.outbox.artifact, document.offline.artifact);
    else
      refs.push(
        document.outbox.priorArtifact,
        document.outbox.targetArtifact,
        document.outbox.equivalence,
        document.offline.targetArtifact,
        document.offline.orderedArtifact,
      );
    refs.push(...Object.values(document.evidence).filter((r) => r !== null));
  }
  refs.forEach((ref) => readFixedReference(root, ref));
}
async function assertPristineTarget(client) {
  const row = await client
    .query(
      `SELECT
    (SELECT count(*)::integer FROM pg_namespace WHERE left(nspname,3)<>'pg_' AND nspname<>'information_schema' AND (nspname<>'public' OR pg_get_userbyid(nspowner)<>'pg_database_owner' OR nspacl::text IS DISTINCT FROM '{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner}' OR obj_description(oid,'pg_namespace') IS DISTINCT FROM 'standard public schema')) AS schemas,
    (SELECT count(*)::integer FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS relations,
    (SELECT count(*)::integer FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS functions,
    (SELECT count(*)::integer FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE left(n.nspname,3)<>'pg_' AND n.nspname<>'information_schema') AS types,
    (SELECT count(*)::integer FROM pg_event_trigger) AS event_triggers,
    (SELECT count(*)::integer FROM pg_publication) AS publications,
    (SELECT count(*)::integer FROM pg_subscription) AS subscriptions,
    (SELECT count(*)::integer FROM pg_foreign_server) AS foreign_servers,
    (SELECT count(*)::integer FROM pg_foreign_data_wrapper) AS foreign_wrappers,
    (SELECT count(*)::integer FROM pg_extension WHERE extname<>'plpgsql') AS extensions,
    (SELECT count(*)::integer FROM pg_default_acl) AS default_acl,
    (SELECT count(*)::integer FROM pg_db_role_setting WHERE setdatabase=(SELECT oid FROM pg_database WHERE datname=current_database())) AS database_role_settings,
    (SELECT count(*)::integer FROM pg_seclabel) AS labels`,
    )
    .then((result) => result.rows[0]);
  requireFact(
    Object.values(row).every((value) => value === 0),
    'fresh target contains unreceipted user objects, rolesettings or extensions',
  );
}

async function inspectTargetStorage(client, root, plan, admission, custody) {
  await client.query(ownerAssertionSql);
  const relations = [ledger, ...custodyRelations];
  const existence = (
    await client.query(`SELECT ${relations.map((name, i) => `to_regclass('${name}') IS NOT NULL AS r${i}`).join(',')},
    to_regprocedure('${ledgerFunction}()') IS NOT NULL AS guard,
    EXISTS(SELECT FROM pg_namespace WHERE nspname IN ('outbox','offline')) AS storage_schema,
    to_regprocedure('integration.stynx_offline_custody_immutable()') IS NOT NULL AS custody_guard,
    to_regprocedure('integration.stynx_storage_target_admissions_immutable()') IS NOT NULL AS group_guard`)
  ).rows[0];
  if (!existence.r0) {
    requireFact(
      !existence.guard &&
        !existence.storage_schema &&
        !existence.custody_guard &&
        !existence.group_guard &&
        !existence.r1 &&
        !existence.r2 &&
        !existence.r3,
      'partial/unreceipted storage is not pristine',
    );
    await assertPristineTarget(client);
    return { mode: 'fresh-1.6.1', freshRows: [], group: null };
  }
  await client.query(ledgerAssertionSql);
  const freshRows = await readFreshRows(client);
  requireFact(
    freshRows.length === 2 &&
      freshRows.every(
        (row) =>
          row.installed_by === 'postgres' &&
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/u.test(
            row.installed_at_utc,
          ),
      ),
    'fresh receipt count/actor/time differs',
  );
  const byPackage = new Map(freshRows.map((row) => [row.package, row]));
  requireFact(
    byPackage.size === 2 &&
      byPackage.has('@stynx-nyx/outbox') &&
      byPackage.has('@stynx-nyx/offline-sync'),
    'fresh package group differs',
  );
  const versions = new Set(freshRows.map((row) => row.identity.packageVersion));
  requireFact(versions.size === 1, 'mixed fresh receipt versions');
  const version = [...versions][0];
  requireFact(
    ['1.6.0', '1.6.1'].includes(version),
    'unsupported fresh version',
  );
  if (version === '1.6.1')
    for (const item of plan.packages)
      requireFact(
        isDeepStrictEqual(
          byPackage.get(item.metadata.package).identity,
          identity(item),
        ),
        'target fresh artifact identity differs',
      );
  else {
    requireFact(
      admission.baseline !== null && admission.targetPlan.baseline !== null,
      'reviewed actual original160 baseline unavailable',
    );
    requireFact(
      isDeepStrictEqual(admission.baseline.subject, admission.subject),
      'baseline subject differs',
    );
    const prior = JSON.parse(readFixedReference(root, priorOutboxArtifact)),
      target = plan.packages.find(
        (p) => p.metadata.package === '@stynx-nyx/outbox',
      );
    requireFact(
      prior.objectsSql === target.objectsSql &&
        prior.roleBindingsSql === target.roleBindingsSql &&
        isDeepStrictEqual(
          prior.manifest.catalog,
          target.metadata.manifest.catalog,
        ),
      'outbox no-storage-change claim differs from actual public artifacts',
    );
    const originalOutbox = byPackage.get('@stynx-nyx/outbox').identity;
    requireFact(
      originalOutbox.objectsSha256 === digest(prior.objectsSql) &&
        originalOutbox.roleBindingsSha256 === digest(prior.roleBindingsSql) &&
        originalOutbox.sourceManifestSha256 ===
          sourceManifestSha256(prior.manifest),
      'original outbox whole-artifact metadata differs',
    );
    for (const [key, name] of [
      ['outbox', 'outbox'],
      ['offline', 'offline-sync'],
    ])
      requireFact(
        recordDigest(byPackage.get('@stynx-nyx/' + name)) ===
          admission.baseline.freshReceipt.group[key].rowDigest,
        'original160 full row differs from reviewed baseline',
      );
  }
  const any =
    existence.r1 ||
    existence.r2 ||
    existence.r3 ||
    existence.custody_guard ||
    existence.group_guard;
  if (!any) {
    requireFact(
      version === '1.6.0',
      'unreceipted target161 storage cannot be adopted',
    );
    return { mode: 'upgrade-fresh-1.6.0', freshRows, group: null };
  }
  requireFact(
    existence.r1 &&
      existence.r2 &&
      existence.r3 &&
      existence.custody_guard &&
      existence.group_guard,
    'partial custody catalog',
  );
  await client.query(custody.assertion);
  const baselines = await custodyRows(client, 'baseline'),
    forwards = await custodyRows(client, 'forward'),
    groups = await custodyRows(client, 'group');
  requireFact(groups.length === 1, 'target admission cardinality differs');
  const group = groups[0].document;
  requireFact(
    isDeepStrictEqual(group.subject, admission.subject) &&
      isDeepStrictEqual(
        group.targetPublication,
        admission.targetPlan.targetPublication,
      ) &&
      group.bindingDigest === admission.targetPlan.bindingDigest,
    'group subject/publication/binding differs',
  );
  verifyDocumentRefs(root, group);
  for (const [key, name] of [
    ['outbox', 'outbox'],
    ['offline', 'offline-sync'],
  ]) {
    const row = byPackage.get('@stynx-nyx/' + name),
      entry = group.freshReceipts[key];
    requireFact(
      entry.rowDigest === recordDigest(row) && entry.version === version,
      'group original row digest/version differs',
    );
    const artifact = JSON.parse(readFixedReference(root, entry.rowArtifact));
    requireFact(
      Array.isArray(artifact.rows) &&
        artifact.rows.filter((r) => r.package === row.package).length === 1 &&
        isDeepStrictEqual(
          artifact.rows.find((r) => r.package === row.package),
          row,
        ),
      'retained original row artifact differs',
    );
  }
  if (version === '1.6.1') {
    requireFact(
      group.mode === 'fresh-1.6.1' &&
        baselines.length === 0 &&
        forwards.length === 0,
      'fresh target custody cardinality/branch differs',
    );
    requireFact(
      isDeepStrictEqual(
        group.outbox.artifact,
        admission.targetPlan.artifacts.outbox.ref,
      ) &&
        isDeepStrictEqual(
          group.offline.artifact,
          admission.targetPlan.artifacts.offline.ref,
        ),
      'fresh artifact ref differs',
    );
  } else {
    requireFact(
      group.mode === 'upgrade-fresh-1.6.0' &&
        baselines.length === 1 &&
        forwards.length === 1,
      'upgrade target custody cardinality/branch differs',
    );
    const baseline = baselines[0].document,
      forward = forwards[0].document;
    requireFact(
      isDeepStrictEqual(group.outbox.priorArtifact, priorOutboxArtifact) &&
        isDeepStrictEqual(
          group.outbox.targetArtifact,
          admission.targetPlan.artifacts.outbox.ref,
        ) &&
        isDeepStrictEqual(
          group.outbox.equivalence,
          baseline.equivalence.report,
        ) &&
        isDeepStrictEqual(
          group.offline.targetArtifact,
          admission.targetPlan.artifacts.offline.ref,
        ) &&
        isDeepStrictEqual(
          group.offline.orderedArtifact,
          admission.targetPlan.artifacts.ordered.ref,
        ),
      'upgrade outbox equivalence/target artifact refs differ',
    );
    requireFact(
      isDeepStrictEqual(baseline, admission.baseline),
      'stored baseline differs from actual sealed record',
    );
    requireFact(
      forward.baselineId === baseline.recordSha256 &&
        group.offline.baselineId === baseline.recordSha256 &&
        group.offline.forwardReceiptId === forward.recordSha256 &&
        forward.targetPublicationDigest ===
          admission.targetPlan.targetPublicationDigest &&
        isDeepStrictEqual(forward.subject, admission.subject),
      'forward/group head or publication differs',
    );
    requireFact(
      baselines[0].atUtc === forwards[0].atUtc &&
        forwards[0].atUtc === groups[0].atUtc,
      'first upgrade admission transaction times differ',
    );
    for (const d of [baseline, forward]) verifyDocumentRefs(root, d);
  }
  return { mode: 'repeat-1.6.1', freshRows, group, baselines, forwards };
}
async function insertCustodyRow(client, kind, document, facts) {
  const parsed = parseStorageCustodyDocument(canonicalJson(document), kind);
  const columns = {
    baseline: baselineColumns,
    forward: forwardColumns,
    group: groupColumns,
  }[kind](parsed.document);
  const relation = {
    baseline: custodyRelations[0],
    forward: custodyRelations[1],
    group: custodyRelations[2],
  }[kind];
  // Column names are fixed consumer declarations; actor/time columns are omitted.
  // Defaults and RETURNING, never stale caller overrides, establish those facts.
  const names = Object.keys(columns);
  const result = await client.query(
    `INSERT INTO ${relation} AS t (${names.join(',')},document) VALUES(${names.map((_, i) => '$' + (i + 1)).join(',')},$${names.length + 1}::jsonb) RETURNING ${custodyProjection(kind)}`,
    [...Object.values(columns), parsed.canonicalJson],
  );
  requireFact(
    result.rows.length === 1,
    'custody INSERT RETURNING cardinality differs',
  );
  const row = decodeCustodyRow(kind, result.rows[0]);
  requireFact(
    isDeepStrictEqual(row.document, document) &&
      row.by === facts.currentUser &&
      row.atSql === facts.atSql &&
      row.atUtc === facts.atUtc,
    'inserted default/RETURNING full custody differs',
  );
  return row;
}
async function insertBaseline(client, admission, facts, retained) {
  const document = admission.baseline;
  retained.write(
    'candidate/baseline.json',
    parseStorageCustodyDocument(canonicalJson(document), 'baseline')
      .canonicalJson,
    true,
  );
  const row = await insertCustodyRow(client, 'baseline', document, facts);
  retained.write('baseline-row-returning.json', {
    baselineId: document.recordSha256,
    admittedBy: row.by,
    admittedAtSql: row.atSql,
    admittedAtUtc: row.atUtc,
  });
}
function signCustody(document, kind) {
  document.recordSha256 = recordDigest(document);
  return parseStorageCustodyDocument(canonicalJson(document), kind).document;
}
async function insertForward(
  client,
  admission,
  facts,
  retained,
  executionPlan,
  migration,
) {
  const baseline = admission.baseline;
  const forward = signCustody(
    {
      formatVersion: 'detran-stynx-offline-forward-receipt/1',
      kind: 'forward-migration-executed',
      subject: admission.subject,
      package: '@stynx-nyx/offline-sync',
      baselineId: baseline.recordSha256,
      targetPackageVersion: '1.6.1',
      targetPublicationDigest: admission.targetPlan.targetPublicationDigest,
      binding: admission.targetPlan.binding,
      bindingDigest: admission.targetPlan.bindingDigest,
      ordinal: 9,
      source: migration.source,
      boundSqlSha256: migration.sqlSha256,
      predecessor: {
        kind: 'baseline',
        baselineId: baseline.recordSha256,
        coveredPrefixLength: 8,
      },
      execution: { by: facts.currentUser, atUtc: facts.atUtc },
      evidence: {
        priorStateRecordDigest: baseline.priorState.record.sha256,
        executionPlanDigest: executionPlan.sha256,
        reviewedCandidateDigest: admission.activation.reviewedCandidate.sha256,
        boundSqlArtifact: admission.targetPlan.artifacts.ordered.ref,
      },
    },
    'forward',
  );
  retained.write(
    'forward-candidate.json',
    parseStorageCustodyDocument(canonicalJson(forward), 'forward')
      .canonicalJson,
    true,
  );
  await insertCustodyRow(client, 'forward', forward, facts);
  return { forward };
}
async function insertTargetGroup(
  client,
  admission,
  mode,
  facts,
  rows,
  retained,
  executionPlan,
  candidate,
) {
  const plan = admission.targetPlan,
    baseline = admission.baseline;
  const rowArtifact = retained.write('candidate/fresh-rows.json', { rows });
  const fresh = mode === 'fresh-1.6.1';
  const outbox = fresh
    ? { mode: 'fresh-artifact', artifact: plan.artifacts.outbox.ref }
    : {
        mode: 'no-storage-change',
        priorArtifact: priorOutboxArtifact,
        targetArtifact: plan.artifacts.outbox.ref,
        equivalence: baseline.equivalence.report,
      };
  const offline = fresh
    ? {
        mode: 'fresh-artifact',
        artifact: plan.artifacts.offline.ref,
        coveredSources: plan.artifacts.ordered.migrations.map((m) => ({
          ordinal: m.ordinal,
          sourcePath: m.sourcePath,
          rawSha256: m.rawSqlSha256,
        })),
        migrationExecution: 'none',
      }
    : {
        mode: 'forward',
        baselineId: baseline.recordSha256,
        forwardReceiptId: candidate.forward.recordSha256,
        lastOrdinal: 9,
        targetArtifact: plan.artifacts.offline.ref,
        orderedArtifact: plan.artifacts.ordered.ref,
      };
  const group = signCustody(
    {
      formatVersion: 'detran-stynx-storage-target-group/1',
      kind: 'target-group-admission',
      mode,
      subject: admission.subject,
      targetPackageVersion: '1.6.1',
      targetPublication: plan.targetPublication,
      binding: plan.binding,
      bindingDigest: plan.bindingDigest,
      freshReceipts: Object.fromEntries(
        [
          ['outbox', 'outbox'],
          ['offline', 'offline-sync'],
        ].map(([key, name]) => [
          key,
          {
            package: '@stynx-nyx/' + name,
            version: fresh ? '1.6.1' : '1.6.0',
            rowDigest: recordDigest(
              rows.find((r) => r.package === '@stynx-nyx/' + name),
            ),
            rowArtifact,
          },
        ]),
      ),
      outbox,
      offline,
      admission: { by: facts.currentUser, atUtc: facts.atUtc },
      evidence: {
        priorState: fresh ? null : baseline.priorState.record,
        equivalence: fresh ? null : baseline.equivalence.report,
        executionPlan,
        reviewedCandidate: admission.activation.reviewedCandidate,
      },
    },
    'group',
  );
  retained.write(
    'group-candidate.json',
    parseStorageCustodyDocument(canonicalJson(group), 'group').canonicalJson,
    true,
  );
  await insertCustodyRow(client, 'group', group, facts);
  return { ...candidate, group };
}

/** Fixed B8 Node-owned transaction. No public SQL/path/binding/approval selector. */
export async function runStorageInstall(root, options = { full: false }) {
  const descriptors = options && Object.getOwnPropertyDescriptors(options);
  if (
    !descriptors ||
    Reflect.ownKeys(descriptors).length !== 1 ||
    !Object.hasOwn(descriptors, 'full') ||
    !Object.hasOwn(descriptors.full, 'value') ||
    typeof descriptors.full.value !== 'boolean'
  )
    throw new Error('STYNX runner accepts only the closed boolean full option');
  requireFact(
    typeof root === 'string' && root.length > 0,
    'repository root required',
  );
  root = path.resolve(root);
  const full = descriptors.full.value;
  const settings = connectionSettings(full);
  const admission = readRunnerAdmission(root, settings);
  const execution = createNodeStorageExecutionPlan(
    root,
    full,
    admission.lease.executionLane,
  );
  const reviewedCandidate = validateReviewedCandidate(
    root,
    admission,
    execution,
  );
  await import(
    pathToFileURL(path.join(root, 'tools/stynx-storage-runtime-guard.mjs'))
  );
  const runtimeGuard =
    globalThis[Symbol.for('detran.stynx.storage.runtime.guard')];
  requireFact(
    runtimeGuard && typeof runtimeGuard.clean === 'function',
    'reviewed installed-runtime guard absent',
  );
  runtimeGuard.clean();
  const plan = createStorageInstallPlan(root);
  const custody = custodyAssertion(root);
  const retained = createRunRetention(root, admission, settings);
  const requireRoot = createRequire(path.join(root, 'package.json'));
  const { Client } = requireRoot('pg');
  const maintenance = new Client({ ...settings, database: 'postgres' });
  let target = null,
    locked = false,
    began = false,
    commitAttempted = false,
    committed = false,
    interrupted = null,
    entry = null,
    candidate = null,
    entryRoleProfile = null,
    candidateRoleProfile = null;
  const cleanupErrors = [];
  let outcome = null,
    mainError = null,
    maintenanceClosed = false,
    destructiveAttempted = false,
    bridgeAcquired = false,
    maintenanceEndPromise = null;
  const checkSignal = () => {
    runtimeGuard.clean();
    requireFact(!interrupted, 'received ' + interrupted);
  };
  // A signal during COMMIT cannot establish rollback. The catch path performs
  // a new locked readback; the maintenance lock is never released by this hook.
  const endMaintenance = () => {
    if (!maintenanceEndPromise)
      maintenanceEndPromise = maintenance.end().then(() => {
        maintenanceClosed = true;
      });
    return maintenanceEndPromise;
  };
  const onSignal = (signal) => {
    interrupted = signal;
    if (!bridgeAcquired)
      void endMaintenance().catch((error) => cleanupErrors.push(error.message));
    if (target)
      void target.end().catch((error) => cleanupErrors.push(error.message));
  };
  const handlers = ['SIGINT', 'SIGTERM', 'SIGHUP'].map((signal) => {
    const fn = () => onSignal(signal);
    process.on(signal, fn);
    return [signal, fn];
  });
  const closeTarget = async () => {
    const client = target;
    if (client) {
      await client.end();
      if (target === client) target = null;
    }
  };
  const readBack = async () => {
    await closeTarget();
    target = new Client(settings);
    await target.connect();
    try {
      await target.query('BEGIN READ ONLY');
      await target.query(utcContextSql);
      const facts = await readSubjectFacts(target, admission);
      const snapshot = await readStorageSnapshot(target);
      let state = null,
        admissionError = null;
      try {
        state = await inspectTargetStorage(
          target,
          root,
          plan,
          admission,
          custody,
        );
      } catch (error) {
        admissionError = error.message;
      }
      await target.query('COMMIT');
      return { facts, snapshot, state, admissionError };
    } finally {
      await closeTarget();
    }
  };
  const verifyReadOnly = async (post) => {
    checkSignal();
    target = new Client(settings);
    await target.connect();
    try {
      await target.query('BEGIN READ ONLY');
      await target.query(utcContextSql);
      await readSubjectFacts(target, admission);
      const state = await inspectTargetStorage(
        target,
        root,
        plan,
        admission,
        custody,
      );
      if (post)
        requireFact(state.mode === 'repeat-1.6.1', 'committed group absent');
      let reports = [];
      if (state.mode === 'repeat-1.6.1')
        reports = await verifyInstalledStorage(target, root, plan);
      await target.query('COMMIT');
      await closeTarget();
      if (state.mode === 'upgrade-fresh-1.6.0')
        reports = await verifyPriorReadOnly(
          root,
          admission,
          settings,
          retained,
        );
      return { state, reports };
    } finally {
      await closeTarget();
    }
  };
  try {
    checkSignal();
    await maintenance.connect();
    checkSignal();
    await maintenance.query("SET TIME ZONE 'UTC'");
    await maintenance.query(ownerAssertionSql);
    await readSubjectFacts(maintenance, admission, true);
    checkSignal();
    await maintenance.query('SELECT pg_advisory_lock(7007,1600)');
    bridgeAcquired = true;
    locked = true;
    checkSignal();
    entryRoleProfile = await assertRunnerRoles(maintenance, admission);
    let pre = await verifyReadOnly(false);
    const executionLane = classifyStorageExecutionLane(
      admission.lease,
      admission.subject,
      pre.state,
      full,
    );
    if (full) {
      requireFact(
        settings.database === 'detran_r22_161_full' &&
          admission.lease.full === true &&
          admission.lease.subjects.length === 1 &&
          isDeepStrictEqual(admission.lease.subjects[0], admission.subject),
        'actual full-only lease absent',
      );
      requireFact(
        ['fresh-1.6.1', 'repeat-1.6.1'].includes(pre.state.mode),
        'full refuses unknown or partial predecessor',
      );
      const originalSubject = structuredClone(admission.subject);
      const before = await readSubjectFacts(maintenance, admission, true);
      const activationCopy = retained.write(
        'reports/full-activation.json',
        readFixedReference(root, admission.activation.externalRef),
        true,
      );
      const leaseCopy = retained.write(
        'reports/full-lease.json',
        readFixedReference(root, admission.activation.lease),
        true,
      );
      const reviewCopy = retained.write(
        'reports/full-reviewed-candidate.json',
        readFixedReference(root, admission.activation.reviewedCandidate),
        true,
      );
      const b3 = (ref) => ({
        ...ref,
        bytes: fs.statSync(path.join(root, ref.path)).size,
      });
      const commandResult = (result) => ({
        command: result.command,
        rowCount: result.rowCount,
        rows: result.rows,
      });
      checkSignal();
      const dropCommand = 'DROP DATABASE "detran_r22_161_full"';
      destructiveAttempted = true;
      const drop = await maintenance.query(dropCommand);
      const afterDrop = await readSubjectFacts(maintenance, admission, true);
      retained.write('reports/full-drop-observation.json', {
        command: dropCommand,
        result: commandResult(drop),
        before,
        after: afterDrop,
      });
      checkSignal();
      const createCommand =
        'CREATE DATABASE "detran_r22_161_full" OWNER postgres';
      const create = await maintenance.query(createCommand);
      const after = await readSubjectFacts(maintenance, admission, true);
      const replacement = (
        await maintenance.query(
          'SELECT datname AS "databaseName",oid::text AS "databaseOid",pg_get_userbyid(datdba) AS owner,(SELECT system_identifier::text FROM pg_control_system()) AS "clusterSystemIdentifier" FROM pg_database WHERE datname=\'detran_r22_161_full\'',
        )
      ).rows;
      requireFact(
        replacement.length === 1 &&
          replacement[0].databaseOid !== originalSubject.databaseOid &&
          replacement[0].owner === 'postgres' &&
          replacement[0].clusterSystemIdentifier ===
            originalSubject.clusterSystemIdentifier,
        'actual full replacement is not a new admitted owner database',
      );
      const replacementSubject = replacement[0];
      const originalSubjectManifest = {
        path: 'scratch/r22-adoption-161/db-rehearsal/cluster-02/subject-manifest.json',
        sha256:
          'sha256:9a55a7457574612ec63c1deeb7f34c82095155e08f833acb89765ce7f629ecc4',
      };
      readFixedReference(root, originalSubjectManifest);
      retained.write('full-recreation.json', {
        formatVersion: 1,
        kind: 'stynx-storage-full-recreation',
        originalSubject,
        replacementSubject,
        originalSubjectManifest: b3(originalSubjectManifest),
        predecessor: admission.lease.fullRecreation ?? null,
        authorization: {
          activation: b3(activationCopy),
          lease: b3(leaseCopy),
          reviewedCandidate: b3(reviewCopy),
        },
        observations: {
          before,
          drop: {
            command: dropCommand,
            result: commandResult(drop),
            after: afterDrop,
          },
          create: { command: createCommand, result: commandResult(create) },
          after: { ...after, ...replacementSubject },
        },
        cluster: {
          systemIdentifier: originalSubject.clusterSystemIdentifier,
          endpoint: admission.manifest.endpoint,
          dataDirectory: admission.manifest.dataDirectory,
          postmaster: admission.manifest.postmaster,
        },
      });
      admission.subject = structuredClone(replacementSubject);
      pre = await verifyReadOnly(false);
      requireFact(
        pre.state.mode === 'fresh-1.6.1',
        'new full target not pristine',
      );
    }
    retained.write('reports/pre-verifiers.json', pre);
    checkSignal();
    target = new Client(settings);
    await target.connect();
    await target.query('BEGIN');
    began = true;
    await target.query('SELECT pg_advisory_xact_lock(7007,1)');
    await target.query(utcContextSql);
    await target.query(ownerAssertionSql);
    const facts = await readSubjectFacts(target, admission);
    entry = await readStorageSnapshot(target);
    requireFact(
      entry.writerFootprint.minimalViolations.length === 0 &&
        [
          'role-absent',
          'empty-subject-footprint',
          'full-consumer-footprint',
        ].includes(entry.writerFootprint.subjectFootprint),
      'entry writer footprint has unauthorized privileges',
    );
    retained.write('entry-state.json', entry);
    retained.write('transaction-facts.json', facts);
    const state = await inspectTargetStorage(
      target,
      root,
      plan,
      admission,
      custody,
    );
    requireFact(
      state.mode === pre.state.mode,
      'state changed between read-only admission and locked main transaction',
    );
    const executionPlan = retained.write('execution-plan.json', {
      mode: state.mode,
      subject: admission.subject,
      targetPlan: admission.targetPlan,
      steps: execution.steps.map(({ name, sha256, kind }) => ({
        name,
        sha256,
        kind,
      })),
      executionLane,
      legacyComparisons: executionLane === 'full-consumer' ? 11 : 0,
      reviewedCandidate: admission.activation.reviewedCandidate,
    });
    await target.query(execution.preflight);
    let originalRows = state.freshRows;
    for (const step of execution.steps) {
      checkSignal();
      if (step.kind === 'storage') {
        await target.query('SET LOCAL search_path=pg_catalog,public');
        if (state.mode === 'fresh-1.6.1') {
          await target.query(
            readFixedReference(root, {
              path: 'backend/database/ddl/19-stynx-storage-ledger.sql',
              sha256:
                'sha256:01303a5c66172f47721ca51f08d8c1c178685a76766785cd1c0fd028c5930b3a',
            }),
          );
          for (const item of plan.packages) {
            await target.query(item.objectsSql);
            await target.query(item.roleBindingsSql);
            await target.query(
              `INSERT INTO ${ledger}(package,identity) VALUES($1,$2::jsonb)`,
              [item.metadata.package, canonicalJson(identity(item))],
            );
          }
          await target.query(
            'SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public',
          );
          await target.query(custody.sql);
        } else if (state.mode === 'upgrade-fresh-1.6.0') {
          requireFact(
            admission.targetPlan.baseline !== null &&
              admission.baseline !== null,
            'actual baseline activation absent',
          );
          await target.query(custody.sql);
          await insertBaseline(target, admission, facts, retained);
          const ordered = loadInstalledStorageArtifacts(root).get(
            '19-stynx-offline.sql',
          ).orderedArtifact;
          const migration = ordered.migrations[8];
          requireFact(
            ordered.migrations.length === 9 &&
              migration.sqlSha256 ===
                admission.targetPlan.artifacts.ordered.migrations[8]
                  .boundSqlSha256,
            'sole suffix9 identity differs',
          );
          await target.query(migration.sql);
          candidate = await insertForward(
            target,
            admission,
            facts,
            retained,
            executionPlan,
            migration,
          );
          for (const item of plan.packages)
            await target.query(item.roleBindingsSql);
        } else
          for (const item of plan.packages)
            await target.query(item.roleBindingsSql);
        await target.query(
          'SET LOCAL row_security=on; SET LOCAL search_path=public,pg_catalog',
        );
      } else await target.query(step.sql);
    }
    await target.query(ledgerFinalPrivilegesSql);
    await target.query(custodyFinalPrivilegesSql);
    await target.query(ownerAssertionSql);
    await target.query(ledgerAssertionSql);
    await target.query(custody.assertion);
    const rows = await readFreshRows(target);
    if (state.mode !== 'fresh-1.6.1')
      requireFact(
        isDeepStrictEqual(rows, originalRows),
        'immutable original fresh rows changed',
      );
    else
      requireFact(
        rows.every(
          (row) =>
            row.installed_by === facts.currentUser &&
            row.installed_at_sql === facts.atSql &&
            row.installed_at_utc === facts.atUtc,
        ),
        'actual fresh SQL defaults differ from main transaction facts',
      );
    if (state.mode !== 'repeat-1.6.1')
      candidate = await insertTargetGroup(
        target,
        admission,
        state.mode,
        facts,
        rows,
        retained,
        executionPlan,
        candidate,
      );
    const finalState = await inspectTargetStorage(
      target,
      root,
      plan,
      admission,
      custody,
    );
    requireFact(
      finalState.mode === 'repeat-1.6.1',
      'final target group not admitted',
    );
    const beforeCommit = await readStorageSnapshot(target);
    if (state.mode !== 'fresh-1.6.1')
      for (const original of entry.records.filter(
        (row) => row.kind === 'S' || /^(outbox|offline)[.]/u.test(row.relation),
      ))
        requireFact(
          isDeepStrictEqual(
            beforeCommit.records.find(
              (row) => row.relation === original.relation,
            ),
            original,
          ),
          'existing package history or sequence changed: ' + original.relation,
        );
    candidateRoleProfile = classifyApprovedRunnerRoleGraph(
      beforeCommit.roleGraph,
      admission.roleGraph,
    );
    if (executionLane === 'package-only-g03') {
      requireFact(
        isDeepStrictEqual(beforeCommit.writerFootprint, entry.writerFootprint),
        'package lane changed actual writer footprint',
      );
      requireFact(
        isDeepStrictEqual(candidateRoleProfile.graph, entryRoleProfile.graph),
        'package lane changed actual entry role graph',
      );
    } else {
      requireFact(
        beforeCommit.writerFootprint.subjectFootprint ===
          'full-consumer-footprint' &&
          beforeCommit.writerFootprint.minimalViolations.length === 0 &&
          beforeCommit.writerFootprint.fullViolations.length === 0,
        'full consumer writer footprint differs',
      );
      requireFact(
        candidateRoleProfile.profile === 'prior-plus-priority-writer',
        'normal consumer DDL did not establish approved priority writer',
      );
    }
    if (entryRoleProfile.profile === 'prior-plus-priority-writer')
      requireFact(
        isDeepStrictEqual(candidateRoleProfile.graph, entryRoleProfile.graph),
        'existing priority writer OID or graph changed',
      );
    retained.write('role-graph-before-commit.json', {
      provenance: 'actual target transaction before COMMIT',
      subject: admission.subject,
      transactionFacts: facts,
      ...candidateRoleProfile,
      writerFootprint: beforeCommit.writerFootprint,
    });
    const manifest = retained.write('candidate/manifest.json', {
      mode: state.mode,
      baseline: admission.baseline?.recordSha256 ?? null,
      forward: candidate?.forward?.recordSha256 ?? null,
      group: finalState.group.recordSha256,
      files: [...retained.files],
      candidateBeforeCommit: true,
    });
    // All candidate bytes and their directory entries are fsynced before COMMIT.
    rehashReviewedInputs(root, reviewedCandidate);
    runtimeGuard.rehash();
    checkSignal();
    commitAttempted = true;
    await target.query('COMMIT');
    committed = true;
    began = false;
    await closeTarget();
    checkSignal();
    const post = await verifyReadOnly(true);
    retained.write('postcommit-verifiers.json', post);
    const actual = await readBack();
    retained.write('postcommit-locked-readback.json', actual);
    requireFact(
      isDeepStrictEqual(actual.snapshot, beforeCommit),
      'postcommit catalog/data/sequence differs from candidate',
    );
    await assertRunnerRoles(maintenance, admission, candidateRoleProfile.graph);
    if (executionLane === 'full-consumer')
      requireFact(
        actual.snapshot.writerFootprint.subjectFootprint ===
          'full-consumer-footprint' &&
          actual.snapshot.writerFootprint.fullViolations.length === 0,
        'postcommit full writer footprint differs',
      );
    retained.write('commit-observation.json', {
      disposition: 'committed-verified',
      manifest,
      group: actual.state.group.recordSha256,
      subject: admission.subject,
    });
    outcome = {
      disposition: 'committed-verified',
      manifest,
      subject: admission.subject,
    };
  } catch (error) {
    let disposition = committed
      ? 'postcommit-stop'
      : commitAttempted
        ? 'commit-unknown'
        : destructiveAttempted
          ? 'full-lifecycle-stop'
          : 'rolled-back';
    let rollbackConfirmed = !began,
      readback = null;
    if (began && !commitAttempted && target) {
      try {
        await target.query('ROLLBACK');
        rollbackConfirmed = true;
        began = false;
      } catch (failure) {
        cleanupErrors.push(failure.message);
      }
    }
    try {
      if (locked) {
        readback = await readBack();
        retained.write('recovery-locked-readback.json', readback);
      }
      if (!commitAttempted && entry)
        requireFact(
          rollbackConfirmed && isDeepStrictEqual(readback.snapshot, entry),
          'rollback state/sequence proof differs',
        );
    } catch (failure) {
      cleanupErrors.push(failure.message);
    }
    outcome = {
      disposition,
      message: error.message,
      rollbackConfirmed,
      recreationRollbackClaimed: false,
      destructiveAttempted,
      subject: admission.subject,
    };
    mainError = error;
  } finally {
    try {
      await closeTarget();
    } catch (error) {
      cleanupErrors.push(error.message);
    }
    try {
      if (locked) {
        const unlock = await maintenance.query(
          'SELECT pg_advisory_unlock(7007,1600) AS unlocked',
        );
        requireFact(
          unlock.rows[0].unlocked === true,
          'maintenance unlock was not confirmed',
        );
        locked = false;
      }
    } catch (error) {
      cleanupErrors.push(error.message);
    } finally {
      try {
        await endMaintenance();
      } catch (error) {
        cleanupErrors.push(error.message);
      }
      for (const [signal, handler] of handlers)
        process.removeListener(signal, handler);
    }
  }
  try {
    runtimeGuard.clean();
    runtimeGuard.rehash();
  } catch (error) {
    cleanupErrors.push(error.message);
  }
  retained.write(
    'reports/runtime-guard-observation.json',
    runtimeGuard.observation(),
  );
  try {
    runtimeGuard.finish();
  } catch (error) {
    cleanupErrors.push(error.message);
  }
  retained.write('reports/cleanup-observation.json', {
    targetClosed: target === null,
    maintenanceClosed,
    interrupted,
    bridgeAcquired,
    lockReleased: !locked,
    cleanupErrors,
  });
  if (interrupted) {
    if (!mainError)
      mainError = new Error('STYNX installation interrupted: ' + interrupted);
    outcome = {
      ...outcome,
      interrupted,
      disposition: committed
        ? 'postcommit-stop'
        : commitAttempted
          ? 'commit-unknown'
          : destructiveAttempted
            ? 'full-lifecycle-stop'
            : 'rolled-back',
    };
  }
  if (cleanupErrors.length && outcome?.disposition === 'committed-verified')
    outcome.disposition = 'postcommit-stop';
  retained.write('disposition.json', { ...outcome, cleanupErrors });
  if (mainError || cleanupErrors.length) {
    console.error(
      `stynx-storage-install: ${outcome?.disposition}; STOP; no replay or compensating repair`,
    );
    throw mainError ?? new Error('STYNX installer cleanup STOP');
  }
  console.log(`apply.sh: done (full=${full ? 1 : 0} db=${settings.database})`);
}

function createNodeStorageExecutionPlan(root, full, executionLane) {
  const legacy = createLegacyApplyPlan(
    path.join(root, 'backend/database'),
    full,
  );
  requireFact(
    executionLane === 'package-only-g03' || executionLane === 'full-consumer',
    'unknown reviewed execution lane',
  );
  if (executionLane === 'package-only-g03')
    return {
      preflight: ownerAssertionSql,
      steps: [
        {
          name: '19-stynx-offline.sql',
          kind: 'storage',
          sha256: legacy.files.get('19-stynx-offline.sql').sha256,
        },
      ],
      files: legacy.files,
    };
  const steps = [];
  const skipped = new Set([
    '19-rait-priority-pre.sql',
    '19-rait-priority-enforce.sql',
    '19-rait-priority-verify.sql',
    '19-stynx-outbox.sql',
    '19-stynx-storage-ledger.sql',
    '19-stynx-offline-custody.sql',
    '20-rls-policies.sql',
    '06-storage-signed-documents.sql',
    '31-inf-signature-policy-guards.sql',
  ]);
  const append = (name) =>
    steps.push({ ...legacy.files.get(name), kind: 'sql' });
  for (const name of [...legacy.names].sort()) {
    if (skipped.has(name)) continue;
    if (name === '34-inf-rait-case.sql') append('19-rait-priority-pre.sql');
    if (name === '19-stynx-offline.sql')
      steps.push({
        name,
        kind: 'storage',
        sha256: legacy.files.get(name).sha256,
      });
    else append(name);
  }
  for (const name of [
    '20-rls-policies.sql',
    '21-ops-provisioning.sql',
    '19-rait-priority-enforce.sql',
    '19-rait-priority-verify.sql',
    '06-storage-signed-documents.sql',
    '31-inf-signature-policy-guards.sql',
  ])
    append(name);
  return { preflight: legacy.sql, steps, files: legacy.files };
}

// Preserved closed inventory, lexer and eleven canonical preflight comparisons.
function createLegacyApplyPlan(dir, full) {
  const ordinary = [
    '00-extensions.sql',
    '01-schemas.sql',
    '02-auth.sql',
    '03-audit.sql',
    '04-integration-storage.sql',
    '05-role-catalog.sql',
    '06-storage-signed-documents.sql',
    '10-postgis-functions.sql',
    '11-auth-functions.sql',
    '12-audit-functions.sql',
    '13-ops-agency.sql',
    '13-ops-field-operations.sql',
    '14-inf-lifecycle-vocabulary.sql',
    '15-ops-parameter.sql',
    '16-ops-snapshots.sql',
    '17-ops-evidence.sql',
    '18-ops-offline-sync.sql',
    '19-ch-encounter-renach-key.sql',
    '19-dashboard-lifecycle-vocabulary.sql',
    '19-est-lifecycle-vocabulary.sql',
    '19-portal-platform.sql',
    '19-stynx-offline.sql',
    '19-stynx-offline-custody.sql',
    '19-stynx-outbox.sql',
    '19-stynx-storage-ledger.sql',
    '20-rls-policies.sql',
    '21-ops-provisioning.sql',
    '30-inf-normative.sql',
    '30-ops-example.sql',
    '31-inf-ait.sql',
    '31-inf-signature-policy-guards.sql',
    '32-inf-measures.sql',
    '33-inf-alcohol.sql',
    '34-inf-rait-case.sql',
    '35-inf-rait-worklist.sql',
    '36-inf-rait-session.sql',
    '37-inf-speed.sql',
    '38-inf-infraction.sql',
    '39-inf-rait-org.sql',
    '40-ch-clinical-network.sql',
    '41-ch-patients.sql',
    '42-ch-encounters.sql',
    '43-ch-exams.sql',
    '44-ch-reports.sql',
    '45-ch-biometrics.sql',
    '46-ch-scheduling.sql',
    '47-ch-restrictions.sql',
    '48-ch-retention.sql',
    '49-ch-process-blocks.sql',
    '50-ch-telehealth.sql',
    '51-ch-billing.sql',
    '52-ch-clinical-controls.sql',
    '53-ch-inconsistencies.sql',
    '54-ch-operational-controls.sql',
    '55-ch-juntas.sql',
    '56-ch-toxicology.sql',
    '57-inf-collection.sql',
    '58-inf-rait-integration.sql',
    '59-inf-notification.sql',
    '60-portal-complaints.sql',
    '61-portal-identity.sql',
    '62-portal-requests.sql',
    '63-portal-inbox.sql',
    '64-portal-citizen-service.sql',
    '65-portal-projections.sql',
    '70-est-crash.sql',
    '71-dashboard-crashes.sql',
    '72-integration-renaest-mirror.sql',
    '75-boat-renaest-job.sql',
    '80-dashboard.sql',
  ];
  const manual = [
    '19-rait-priority-pre.sql',
    '19-rait-priority-enforce.sql',
    '19-rait-priority-verify.sql',
  ];
  const expected = [...ordinary, ...manual].sort();
  const present = fs
    .readdirSync(path.join(dir, 'ddl'))
    .filter((n) => n.endsWith('.sql'))
    .sort();
  if (JSON.stringify(present) !== JSON.stringify(expected))
    throw new Error('Unknown, missing or duplicate DDL inventory');
  for (const name of expected)
    if (!fs.lstatSync(path.join(dir, 'ddl', name)).isFile())
      throw new Error('DDL must be a regular file: ' + name);
  function statements(sql) {
    let out = [],
      text = '',
      i = 0;
    while (i < sql.length) {
      if (sql.startsWith('--', i)) {
        const j = sql.indexOf('\n', i);
        i = j < 0 ? sql.length : j;
        text += ' ';
        continue;
      }
      if (sql.startsWith('/*', i)) {
        let depth = 1;
        i += 2;
        while (i < sql.length && depth) {
          if (sql.startsWith('/*', i)) {
            depth++;
            i += 2;
          } else if (sql.startsWith('*/', i)) {
            depth--;
            i += 2;
          } else i++;
        }
        if (depth) throw new Error('Unclosed SQL comment');
        text += ' ';
        continue;
      }
      if (sql[i] === "'" || sql[i] === '"') {
        const q = sql[i];
        let piece = q;
        i++;
        let closed = false;
        while (i < sql.length) {
          const c = sql[i++];
          piece += c;
          if (c === q) {
            if (sql[i] === q) {
              piece += sql[i++];
            } else {
              closed = true;
              break;
            }
          }
        }
        if (!closed) throw new Error('Unclosed SQL literal');
        text += piece;
        continue;
      }
      const tag = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/);
      if (tag) {
        const end = sql.indexOf(tag[0], i + tag[0].length);
        if (end < 0) throw new Error('Unclosed dollar body');
        text += sql.slice(i, end + tag[0].length);
        i = end + tag[0].length;
        continue;
      }
      if (sql[i] === '\\')
        throw new Error('psql meta commands/includes are forbidden');
      if (sql[i] === ';') {
        if (text.trim()) out.push(text.trim());
        text = '';
        i++;
        continue;
      }
      text += sql[i++];
    }
    if (text.trim()) out.push(text.trim());
    return out;
  }
  const parsed = new Map();
  const files = new Map();
  for (const name of expected) {
    const bytes = fs.readFileSync(path.join(dir, 'ddl', name));
    const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    files.set(name, { name, sql: source, sha256: digest(bytes) });
    const list = statements(source);
    parsed.set(name, list);
    for (const s of list) {
      if (
        /^(?:BEGIN|START\s+TRANSACTION|COMMIT|END|ROLLBACK|ABORT|VACUUM|CHECKPOINT|DISCARD|COPY|PREPARE\s+TRANSACTION)\b/i.test(
          s,
        ) ||
        /^(?:CREATE|DROP)\s+(?:DATABASE|TABLESPACE)\b/i.test(s) ||
        /^ALTER\s+SYSTEM\b/i.test(s) ||
        /^(?:CREATE|DROP|REINDEX)\s+(?:UNIQUE\s+)?INDEX\s+CONCURRENTLY\b/i.test(
          s,
        ) ||
        /^REINDEX\b[\s\S]*\bCONCURRENTLY\b/i.test(s)
      )
        throw new Error(
          'Non-transactional or transaction-control statement in ' + name,
        );
    }
  }
  // Compare canonical values before DDL05/14. Never restore/mask a legacy write.
  const checks = [];
  for (const name of [
    '05-role-catalog.sql',
    '14-inf-lifecycle-vocabulary.sql',
  ]) {
    for (const s of parsed
      .get(name)
      .filter((s) => /^INSERT\s+INTO\b/i.test(s))) {
      const m = s.match(
        /^INSERT\s+INTO\s+([a-z_]+\.[a-z_]+)\s*\(([^)]+)\)\s*VALUES\s+([\s\S]+?)\s+ON\s+CONFLICT\s*\(([^)]+)\)/i,
      );
      if (!m)
        throw new Error('Unrecognized canonical catalog INSERT in ' + name);
      const [, table, columns, values, key] = m;
      if (!/^[a-z_]+$/.test(key.trim()))
        throw new Error('Unsupported catalog identity');
      const cols = columns.split(',').map((c) => c.trim());
      if (cols.some((c) => !/^[a-z_]+$/.test(c)))
        throw new Error('Invalid canonical column');
      const comparison = cols
        .map((c) => 't.' + c + '::text IS DISTINCT FROM e.' + c + '::text')
        .join(' OR ');
      const query =
        'WITH e(' +
        columns +
        ') AS (VALUES ' +
        values +
        ') SELECT EXISTS(SELECT FROM e LEFT JOIN ' +
        table +
        ' t ON t.' +
        key.trim() +
        '::text=e.' +
        key.trim() +
        '::text WHERE t.' +
        key.trim() +
        ' IS NULL OR ' +
        comparison +
        ')';
      checks.push(
        "IF to_regclass('" +
          table +
          "') IS NOT NULL THEN EXECUTE 'LOCK TABLE " +
          table +
          " IN ACCESS EXCLUSIVE MODE'; EXECUTE " +
          quote(query) +
          " INTO divergent; IF divergent THEN RAISE EXCEPTION 'Canonical legacy catalog differs: " +
          table +
          "'; END IF; END IF;",
      );
    }
  }
  if (checks.length !== 11)
    throw new Error('Expected eleven canonical catalog INSERT sources');
  function quote(s) {
    return "'" + s.replaceAll("'", "''") + "'";
  }
  const validAppRole =
    "SELECT FROM pg_roles WHERE rolname='role_app_backend' AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcanlogin";
  const validAuditorRole =
    "SELECT FROM pg_roles WHERE rolname='role_auditor_min' AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcanlogin";
  const rolePreflight = full
    ? "IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_app_backend') AND NOT EXISTS(" +
      validAppRole +
      ") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_auditor_min') AND NOT EXISTS(" +
      validAuditorRole +
      ") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; "
    : 'IF NOT EXISTS(' +
      validAppRole +
      ') OR NOT EXISTS(' +
      validAuditorRole +
      ") THEN RAISE EXCEPTION 'Existing operational roles required; global creation not authorized'; END IF; ";
  return {
    names: ordinary,
    files,
    sql:
      'SET LOCAL ROLE postgres; SET LOCAL search_path = pg_catalog, public; DO $preflight$ DECLARE r record; divergent boolean; BEGIN ' +
      rolePreflight +
      "IF EXISTS (SELECT FROM pg_catalog.pg_extension e JOIN pg_catalog.pg_namespace n ON n.oid=e.extnamespace WHERE e.extname IN ('pgcrypto','uuid-ossp','citext','postgis') AND n.nspname <> 'public') THEN RAISE EXCEPTION 'Existing extension namespace differs; relocation is not authorized'; END IF; " +
      "FOR r IN SELECT n.nspname,c.relname,c.relowner FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops') AND c.relkind IN ('r','p') ORDER BY n.nspname,c.relname LOOP IF r.relowner <> 'postgres'::regrole THEN RAISE EXCEPTION 'Unsupported legacy owner %.%',r.nspname,r.relname; END IF; END LOOP; " +
      checks.join(' ') +
      ' END $preflight$;',
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (process.argv.length !== 3)
      throw new Error(
        'Usage: node tools/stynx-storage-install.mjs <repository-root>',
      );
    console.log(JSON.stringify(createStorageInstallPlan(process.argv[2])));
  } catch (error) {
    console.error(`stynx-storage-install: ${error.message}`);
    process.exitCode = 1;
  }
}
