import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function createStorageDdlPlan(root, full) {
  if (typeof root !== 'string' || !root || typeof full !== 'boolean')
    throw new Error('Closed root/boolean DDL plan required');
  root = path.resolve(root);
  const legacy = createLegacyApplyPlan(
    path.join(root, 'backend/database'),
    full,
  );
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
  const rolePreflight =
    "IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_app_backend') AND NOT EXISTS(" +
    validAppRole +
    ") THEN RAISE EXCEPTION 'Existing application role incompatible'; END IF; IF EXISTS(SELECT FROM pg_roles WHERE rolname='role_auditor_min') AND NOT EXISTS(" +
    validAuditorRole +
    ") THEN RAISE EXCEPTION 'Existing auditor role incompatible'; END IF; ";
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
