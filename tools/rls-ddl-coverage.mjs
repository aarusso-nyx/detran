import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// D-160.7: fixed consumer bindings; local metadata never supplies authority.
const binding = {
  ownerRole: 'postgres',
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
};
const specs = [
  ['@stynx-nyx/outbox', 'renderOutboxStorage', 'outbox', '19-stynx-outbox.sql'],
  [
    '@stynx-nyx/offline-sync',
    'renderOfflineStorage',
    'offline',
    '19-stynx-offline.sql',
  ],
];
// Host resolution and public branding precede tenant context, by design (R-0009 M11).
// docs/framework/arch/portal-route-contract.md section 11; no schema-wide exemption.
const exemptions = new Set([
  JSON.stringify(['portal', 'public_hostname']),
  JSON.stringify(['portal', 'brand_profile']),
]);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
// D-160.10: exact Architect-reviewed DO bodies at campaign9af768; never autosync.
const reviewedDoBodies = new Set([
  '10ffe8528fcc2d8b4cf225342a9ae0dd9ca31e96cdcc794d24cdd5899d53b1c4',
  '4a838a9d03e3cbea8e131853d2c94e2a92fa2fd6d236eac04e9f715d039d9bf3',
  '513b32af0db309e4a8942070aec55c6ad40a1957c09ed7342c8c60f1085a5b1d',
  'df4ab58ebe63768aa8b50457036e7d5a20ebb6f5cc1804eedb2843759a062496',
  'd8dd099d335dd66713fe647a26d29d4b7db29a91704fdc62eb2350f622a043d9',
  '4723c84ba54e516ff42b3c3aa112522853780f0d57346c6b488bf5ada772d6dd',
]);
// D-160.14: full original CREATE statement and body, never filename/name alone.
const reviewedStoredBodies = new Map([
  [
    '81a0969747442e9b9be35325e9fb21939badebf3fb8280cdfb44857fea1c2076',
    '43d1c5fcdc6577fbb8a7900d09f3823848264d47151ea18f5bf3916af35af1c2',
  ],
  [
    'b147e07428543aa2e083c9a5e7c4af888bc661149cbad0e2c329ec1fe30984c2',
    '68c11a65a8c6087adef4b11b0ce91716ab3bd432e0080e20266363b13341ed4a',
  ],
]);
const key = (schema, table) => JSON.stringify([schema, table]);
const display = (identity) => JSON.parse(identity).join('.');
const fail = (file, message) => {
  throw new Error(`${file}: ${message}`);
};
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fail(file, 'JSON missing, unreadable or malformed');
  }
};

/** SQL lexical inventory, not a general SQL parser. Bodies/literals cannot signal coverage. */
function tokens(sql, file, approvedArtifact = false) {
  const out = [];
  let i = 0;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) {
      i++;
      continue;
    }
    const start = i;
    if (/^[uU]&"/.test(sql.slice(i)))
      fail(file, 'Unicode escaped identifiers require explicit classification');
    if (/^[uU]&'/.test(sql.slice(i))) {
      if (!approvedArtifact) fail(file, 'unreviewed Unicode escaped literal');
      i += 2;
    }
    if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i + 2);
      i = end < 0 ? sql.length : end + 1;
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
      if (depth) fail(file, 'unterminated block comment');
      continue;
    }
    const escaped = /[eE]/.test(sql[i]) && sql[i + 1] === "'";
    if (sql[i] === '"' || sql[i] === "'" || escaped) {
      if (escaped) i++;
      const quote = sql[i++];
      let value = '';
      let closed = false;
      while (i < sql.length) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) {
            value += quote;
            i += 2;
          } else {
            i++;
            closed = true;
            break;
          }
        } else if (escaped && sql[i] === '\\') {
          value += sql.slice(i, i + 2);
          i += 2;
        } else value += sql[i++];
      }
      if (!closed)
        fail(file, `unterminated ${quote === '"' ? 'identifier' : 'literal'}`);
      out.push({
        kind: quote === '"' ? 'id' : 'string',
        value,
        escaped,
        quoted: quote === '"',
        start,
        end: i,
      });
      continue;
    }
    if (sql[i] === '$') {
      const delimiter = sql.slice(i).match(/^\$(?:[a-zA-Z_][\w]*)?\$/)?.[0];
      if (delimiter) {
        const end = sql.indexOf(delimiter, i + delimiter.length);
        if (end < 0) fail(file, 'unterminated dollar body');
        out.push({
          kind: 'body',
          value: sql.slice(i + delimiter.length, end),
          start,
          end: end + delimiter.length,
        });
        i = end + delimiter.length;
        continue;
      }
    }
    const word = sql
      .slice(i)
      .match(/^[a-zA-Z_\u0080-\uffff][\w$\u0080-\uffff]*/)?.[0];
    if (word) {
      i += word.length;
      out.push({ kind: 'id', value: word.toLowerCase(), start, end: i });
    } else out.push({ kind: 'symbol', value: sql[i++], start, end: i });
  }
  return out;
}

function qualified(list, start, file) {
  const a = list[start],
    dot = list[start + 1],
    b = list[start + 2];
  if (
    a?.kind !== 'id' ||
    dot?.value !== '.' ||
    b?.kind !== 'id' ||
    list[start + 3]?.value === '.'
  )
    fail(file, 'ambiguous or unqualified table identity');
  return { identity: key(a.value, b.value), next: start + 3 };
}

function inventory(list, file, approvedArtifact = false) {
  const tables = new Map();
  const helpers = new Set();
  const partitions = new Map();
  const tenantAdditions = new Set();
  const statements = [];
  let statement = [];
  for (const token of list) {
    if (token.value === ';' && token.kind === 'symbol') {
      statement.statementEnd = token.end;
      statements.push(statement);
      statement = [];
    } else statement.push(token);
  }
  if (statement.length) statements.push(statement);
  for (const s of statements) {
    const at = (n, value) =>
      s[n]?.kind !== 'string' && s[n]?.kind !== 'body' && s[n]?.value === value;
    const exactHelper =
      s.length === 9 &&
      at(0, 'select') &&
      at(1, 'auth') &&
      at(2, '.') &&
      at(3, 'create_rls_policy') &&
      at(4, '(') &&
      s[5]?.kind === 'string' &&
      !s[5].escaped &&
      at(6, ',') &&
      s[7]?.kind === 'string' &&
      !s[7].escaped &&
      at(8, ')');
    for (let n = 0; n < s.length; n++) {
      if (
        at(n, 'auth') &&
        at(n + 1, '.') &&
        at(n + 2, 'create_rls_policy') &&
        at(n + 3, '(') &&
        !at(n - 1, 'function') &&
        !exactHelper
      )
        fail(
          file,
          'helper invocation requires an unconditional SELECT with ordinary exact literals',
        );
    }
    if (at(0, 'alter') && at(1, 'table')) {
      let n = 2;
      if (at(n, 'if') && at(n + 1, 'exists')) n += 2;
      if (at(n, 'only')) n++;
      const altered = qualified(s, n, file);
      for (n = altered.next; n < s.length; n++) {
        if (at(n, 'rename'))
          fail(
            file,
            `${display(altered.identity)}: table/column rename requires explicit classification`,
          );
        if (!at(n, 'add')) continue;
        let column = n + 1;
        if (at(column, 'column')) column++;
        if (
          at(column, 'if') &&
          at(column + 1, 'not') &&
          at(column + 2, 'exists')
        )
          column += 3;
        if (s[column]?.kind === 'id' && s[column].value === 'tenant_id')
          tenantAdditions.add(altered.identity);
      }
    }
    let t = 1;
    if (
      at(0, 'create') &&
      (at(t, 'temporary') || at(t, 'temp') || at(t, 'unlogged'))
    )
      t++;
    if (at(0, 'create') && at(t, 'table')) {
      t++;
      if (at(t, 'if') && at(t + 1, 'not') && at(t + 2, 'exists')) t += 3;
      const parsed = qualified(s, t, file);
      t = parsed.next;
      if (at(t, 'partition') && at(t + 1, 'of')) {
        const parent = qualified(s, t + 2, file);
        if (tables.has(parsed.identity))
          fail(
            file,
            `${display(parsed.identity)}: duplicate partition declaration`,
          );
        partitions.set(parsed.identity, parent.identity);
        tables.set(parsed.identity, false);
        continue;
      }
      if (!at(t, '('))
        fail(
          file,
          `${display(parsed.identity)}: unsupported CREATE TABLE shape`,
        );
      let depth = 1;
      let columnStart = true;
      let tenant = false;
      t++;
      for (; t < s.length && depth; t++) {
        const token = s[t];
        if (
          depth === 1 &&
          columnStart &&
          token.kind === 'id' &&
          token.value === 'like'
        )
          fail(
            file,
            `${display(parsed.identity)}: LIKE columns cannot be classified`,
          );
        if (
          depth === 1 &&
          columnStart &&
          token.kind === 'id' &&
          token.value === 'tenant_id'
        )
          tenant = true;
        if (depth === 1) columnStart = false;
        if (token.kind === 'symbol') {
          if (token.value === '(') depth++;
          if (token.value === ')') depth--;
          if (token.value === ',' && depth === 1) columnStart = true;
        }
      }
      if (depth)
        fail(file, `${display(parsed.identity)}: truncated table declaration`);
      if (s.slice(t).some((v) => v.kind === 'id' && v.value === 'inherits'))
        fail(
          file,
          `${display(parsed.identity)}: inherited columns require explicit classification`,
        );
      if (tables.has(parsed.identity))
        fail(file, `${display(parsed.identity)}: duplicate table declaration`);
      tables.set(parsed.identity, tenant);
    }
    // Only an unconditional top-level SELECT invokes the existing helper at DDL application.
    if (
      s.length === 9 &&
      at(0, 'select') &&
      at(1, 'auth') &&
      at(2, '.') &&
      at(3, 'create_rls_policy') &&
      at(4, '(') &&
      s[5]?.kind === 'string' &&
      at(6, ',') &&
      s[7]?.kind === 'string' &&
      at(8, ')')
    )
      helpers.add(key(s[5].value, s[7].value));
    // DO executes immediately. Refuse hidden table creation, including EXECUTE text.
    if (at(0, 'do')) {
      const registeredBody = s.find((v) => v.kind === 'body');
      const normalWrapper =
        (s.length === 2 && s[1] === registeredBody) ||
        (s.length === 4 &&
          ((s[1] === registeredBody && at(2, 'language') && at(3, 'plpgsql')) ||
            (at(1, 'language') &&
              at(2, 'plpgsql') &&
              s[3] === registeredBody)));
      if (
        registeredBody &&
        reviewedDoBodies.has(digest(registeredBody.value))
      ) {
        if (!normalWrapper)
          fail(file, 'reviewed DO body has an unapproved wrapper/language');
        continue;
      }
      if (approvedArtifact) continue;
      for (const body of s.filter(
        (v) => v.kind === 'body' || v.kind === 'string',
      )) {
        const inner = tokens(body.value, file);
        if (
          inner.some(
            (v, n) =>
              v.kind === 'id' &&
              v.value === 'auth' &&
              inner[n + 1]?.value === '.' &&
              inner[n + 2]?.value === 'create_rls_policy',
          )
        )
          fail(
            file,
            'procedural helper invocation cannot confer static coverage',
          );
        refuseRoleEscalation(file, inner, true);
        refuseAmbientConfiguration(file, inner);
        if (inner.some((v) => v.kind === 'id' && v.value === 'execute'))
          fail(
            file,
            'dynamic DO body differs from the exact reviewed capability registry',
          );
        for (let n = 0; n < inner.length; n++) {
          if (
            inner[n]?.kind !== 'id' ||
            inner[n].value !== 'alter' ||
            inner[n + 1]?.value !== 'table'
          )
            continue;
          const table = qualified(inner, n + 2, file);
          if (
            inner[table.next]?.value !== 'add' ||
            inner[table.next + 1]?.value !== 'constraint'
          )
            fail(
              file,
              'unreviewed DO table mutation requires explicit classification',
            );
        }
        const text = inner.map((v) => v.value).join(' ');
        const literals = inner
          .filter((v) => v.kind === 'string')
          .map((v) => v.value)
          .join(' ');
        for (let n = 0; n < inner.length; n++) {
          if (inner[n].kind !== 'id' || inner[n].value !== 'execute') continue;
          const end = inner.findIndex(
            (v, index) => index > n && v.kind === 'symbol' && v.value === ';',
          );
          const command = inner.slice(n + 1, end < 0 ? inner.length : end);
          if (
            command.some(
              (v, index) =>
                v.value === '|' && command[index + 1]?.value === '|',
            )
          )
            fail(file, 'concatenated dynamic SQL cannot be classified');
          if (
            command[0]?.kind !== 'string' &&
            !(command[0]?.value === 'format' && command[2]?.kind === 'string')
          )
            fail(file, 'opaque dynamic SQL cannot be classified');
        }
        if (
          [text, literals].some((v) =>
            /\bcreate\s+(?:(?:temp(?:orary)?|unlogged)\s+)?table\b/i.test(v),
          )
        )
          fail(file, 'dynamic table DDL cannot be classified');
      }
    }
  }
  return { tables, helpers, statements, partitions, tenantAdditions };
}

export function loadInstalledStorageArtifacts(root) {
  const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
  const pin = 'tools/stynx-version.json';
  if (readJson(path.join(root, pin)).version !== '1.6.1')
    fail(pin, 'requires exact STYNX 1.6.1');
  const app = path.join(root, 'backend/app/package.json');
  fs.readFileSync(app); // createRequire alone does not require its anchor to exist.
  fs.statSync(path.join(root, 'backend/app/node_modules'));
  const requireApp = createRequire(app);
  const entries = [];
  const approved = new Map();
  for (const [name, renderName, schema, filename] of specs) {
    const target = `backend/database/ddl/${filename}`;
    const entrypoint = requireApp.resolve(name);
    const packageLink = fs.realpathSync(
      path.join(root, 'backend/app/node_modules', ...name.split('/')),
    );
    if (!fs.realpathSync(entrypoint).startsWith(`${packageLink}${path.sep}`))
      fail(target, 'package resolution escaped consumer installation');
    const artifact = requireApp(name)[renderName](binding);
    if (
      artifact.packageVersion !== '1.6.1' ||
      !isDeepStrictEqual(artifact.binding, binding)
    )
      fail(target, 'installed version/binding mismatch');
    const sql = `-- Generated by tools/generate-stynx-storage.mjs from installed ${name}@1.6.1.\n-- D-161: fresh-target storage projection; existing receipts and history remain immutable.\n${artifact.objectsSql}\n${artifact.roleBindingsSql}`;
    if (read(target) !== sql)
      fail(target, 'differs from exact installed renderer');
    entries.push({
      package: name,
      packageVersion: artifact.packageVersion,
      contractVersion: artifact.contractVersion,
      entrypointSha256: digest(fs.readFileSync(entrypoint)),
      binding: artifact.binding,
      target,
      sha256: digest(sql),
      objectsSha256: digest(artifact.objectsSql),
      roleBindingsSha256: digest(artifact.roleBindingsSql),
      manifest: artifact.manifest,
    });
    approved.set(filename, { schema, artifact, metadata: entries.at(-1) });
  }
  const metadata = 'backend/database/stynx-storage.json';
  if (
    !isDeepStrictEqual(readJson(path.join(root, metadata)), {
      version: 1,
      stynxVersion: '1.6.1',
      artifacts: entries,
    })
  )
    fail(metadata, 'differs from installed artifact metadata');
  const projectionPath = path.posix.join(
    'tools/stynx-storage/fixtures/publication-161/historical',
    'scratch',
    'r22-adoption-161',
    'package-admission',
    'projection',
    'public-storage-projection.json.raw',
  );
  const projectionBytes = fs.readFileSync(path.join(root, projectionPath));
  if (
    digest(projectionBytes) !==
    '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388'
  )
    fail(projectionPath, 'independent published projection identity differs');
  const orderedArtifact = requireApp(
    '@stynx-nyx/offline-sync',
  ).renderOfflineStorageMigrations(binding);
  const publishedProjection = JSON.parse(projectionBytes);
  for (const filename of ['19-stynx-outbox.sql', '19-stynx-offline.sql']) {
    const installed = approved.get(filename);
    if (
      !isDeepStrictEqual(
        installed.artifact,
        publishedProjection[installed.schema],
      )
    )
      fail(projectionPath, 'installed whole public storage artifact differs');
  }
  const expectedOrdered = publishedProjection.offlineMigrations;
  if (
    orderedArtifact.packageVersion !== '1.6.1' ||
    !isDeepStrictEqual(orderedArtifact.binding, binding) ||
    orderedArtifact.migrations.length !== 9 ||
    !isDeepStrictEqual(orderedArtifact, expectedOrdered) ||
    orderedArtifact.migrations.some(
      (migration) => digest(migration.sql) !== migration.sqlSha256,
    )
  )
    fail(projectionPath, 'installed ordered migration artifact differs');
  approved.get('19-stynx-offline.sql').orderedArtifact = orderedArtifact;
  return approved;
}

function packageTables(file, schema, artifact, tables) {
  const catalog = artifact.manifest.catalog;
  const expected = new Set();
  const relations = new Set();
  const fence =
    "(tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)";
  const actorFence =
    "((tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid) AND (actor_id = (NULLIF(current_setting('app.actor_id'::text, true), ''::text))::uuid))";
  for (const item of catalog.filter((v) => v.kind === 'relation'))
    relations.add(key(schema, item.name));
  for (const column of catalog.filter(
    (v) => v.kind === 'column' && v.name.endsWith('.tenant_id'),
  )) {
    const table = column.name.slice(0, -'.tenant_id'.length);
    const identity = key(schema, table);
    const relation = catalog.find(
      (v) => v.kind === 'relation' && v.name === table,
    );
    if (
      !relation?.value.rls ||
      !relation.value.forceRls ||
      relation.value.owner !== binding.ownerRole ||
      relation.value.kind !== 'r'
    )
      fail(
        file,
        `${display(identity)}: installed relation lacks owner/ENABLE/FORCE RLS proof`,
      );
    const policies = catalog.filter(
      (v) => v.kind === 'policy' && v.name.startsWith(`${table}.`),
    );
    if (policies.length !== 1)
      fail(
        file,
        `${display(identity)}: isolation policy inventory is not closed`,
      );
    const policy = policies[0].value;
    if (
      policy.using !== fence ||
      policy.check !==
        (schema === 'outbox' && table === 'event_retirements'
          ? actorFence
          : fence) ||
      policy.command !== '*' ||
      policy.permissive !== true ||
      !(
        isDeepStrictEqual(policy.roles, ['PUBLIC']) ||
        isDeepStrictEqual(policy.roles, [binding.appRole])
      )
    )
      fail(
        file,
        `${display(identity)}: installed policy lacks exact tenant/actor/context/role proof`,
      );
    if (tables.get(identity) !== true)
      fail(
        file,
        `${display(identity)}: catalog tenant table absent from SQL inventory`,
      );
    expected.add(identity);
  }
  for (const [identity, tenant] of tables) {
    if (!relations.has(identity) || (tenant && !expected.has(identity)))
      fail(file, `${display(identity)}: table outside installed catalog`);
  }
  return expected;
}

function refuseRoleEscalation(file, statement, procedural = false) {
  const ids = statement.filter((v) => v.kind === 'id').map((v) => v.value);
  const protectedRoles = new Set([
    'postgres',
    'role_app_backend',
    'role_auditor_min',
  ]);
  const capabilities = new Set([
    'superuser',
    'bypassrls',
    'createrole',
    'createdb',
    'replication',
    'inherit',
    'login',
  ]);
  const starts = (a, b) => ids[0] === a && ids[1] === b;
  if (procedural === 'stored') {
    for (let i = 0; i < statement.length; i++) {
      const token = statement[i];
      if (token.kind !== 'id') continue;
      if (
        ['create', 'alter'].includes(token.value) &&
        ['role', 'user', 'group', 'default'].includes(statement[i + 1]?.value)
      )
        fail(file, 'unreviewed stored role or privilege capability');
      if (['grant', 'revoke'].includes(token.value)) {
        const end = statement.findIndex(
          (v, n) => n > i && v.kind === 'symbol' && v.value === ';',
        );
        const command = statement.slice(i, end < 0 ? statement.length : end);
        if (
          !command.some((v) => v.kind === 'id' && !v.quoted && v.value === 'on')
        )
          fail(file, 'unproved stored role membership');
      }
    }
    return;
  }
  if (procedural) {
    if (
      ids.some(
        (v, i) =>
          (['create', 'alter'].includes(v) &&
            ['role', 'user', 'group'].includes(ids[i + 1])) ||
          v === 'grant' ||
          v === 'revoke',
      )
    )
      fail(file, 'unreviewed procedural role or privilege capability');
    return;
  }
  if (
    ids[0] === 'grant' &&
    !statement.some((v) => v.kind === 'id' && !v.quoted && v.value === 'on') &&
    ids.some((v) => protectedRoles.has(v))
  )
    fail(file, 'unproved protected role membership');
  if (
    (starts('alter', 'role') ||
      starts('alter', 'user') ||
      starts('alter', 'group')) &&
    (ids.some((v) => protectedRoles.has(v)) ||
      ids.some((v) => capabilities.has(v)))
  )
    fail(file, 'role capability mutation is not admitted');
  if (
    (starts('create', 'role') ||
      starts('create', 'user') ||
      starts('create', 'group')) &&
    (ids.some((v) => capabilities.has(v) || protectedRoles.has(v)) ||
      (starts('create', 'user') && !ids.includes('nologin')))
  )
    fail(file, 'unreviewed role creation/capability');
  if (
    ids[0] === 'set' &&
    (ids.includes('role') || ids.includes('authorization'))
  )
    fail(file, 'ambient role/authorization switch is not admitted');
  if (
    starts('alter', 'default') &&
    ids.includes('privileges') &&
    ids.some((v) => protectedRoles.has(v) || v === 'public')
  )
    fail(file, 'protected default privilege mutation is not admitted');
}

function refuseAmbientConfiguration(file, statement) {
  for (let i = 0; i < statement.length; i++) {
    if (
      statement[i].kind === 'id' &&
      statement[i].value === 'set' &&
      statement[i - 1]?.value !== 'update'
    ) {
      let name = i + 1;
      if (['local', 'session'].includes(statement[name]?.value)) name++;
      if (['role', 'authorization'].includes(statement[name]?.value))
        fail(file, 'ambient role/authorization switch is not admitted');
      if (['search_path', 'schema'].includes(statement[name]?.value)) {
        const end = statement.findIndex(
          (v, n) => n > name && v.kind === 'symbol' && v.value === ';',
        );
        const value = statement.slice(
          name + 1,
          end < 0 ? statement.length : end,
        );
        if (
          value.some(
            (v) =>
              ['outbox', 'offline'].includes(v.value) ||
              (v.kind === 'string' && /\b(?:outbox|offline)\b/i.test(v.value)),
          )
        )
          fail(
            file,
            'foreign search_path selects protected outbox/offline schema',
          );
      }
    }
    if (
      statement[i].kind !== 'id' ||
      statement[i].value !== 'set_config' ||
      statement[i + 1]?.value !== '('
    )
      continue;
    const name = statement[i + 2];
    if (
      name?.kind !== 'string' ||
      name.escaped ||
      statement[i + 3]?.kind !== 'symbol' ||
      statement[i + 3]?.value !== ',' ||
      ['search_path', 'role', 'session_authorization'].includes(
        name.value.toLowerCase(),
      )
    )
      fail(file, 'unreviewed ambient configuration function call');
  }
}

function refuseUnknownStoredBody(file, statement, source) {
  let at = 1;
  if (statement[at]?.value === 'or' && statement[at + 1]?.value === 'replace')
    at += 2;
  if (
    statement[0]?.value !== 'create' ||
    !['function', 'procedure'].includes(statement[at]?.value)
  )
    return;
  const definition = source.slice(
    statement[0].start,
    statement.statementEnd ?? statement.at(-1).end,
  );
  const bodies = statement.filter(
    (v, i) =>
      statement[i - 1]?.value === 'as' && ['body', 'string'].includes(v.kind),
  );
  const language = statement.findIndex(
    (v) => v.kind === 'id' && v.value === 'language',
  );
  if (
    bodies.length !== 1 ||
    bodies[0].kind !== 'body' ||
    !['sql', 'plpgsql'].includes(statement[language + 1]?.value)
  )
    fail(
      file,
      'stored body language/representation requires explicit classification',
    );
  const body = bodies[0];
  const expected = reviewedStoredBodies.get(digest(definition));
  if (expected && digest(body.value) === expected) return;
  const name = qualified(statement, at + 1, file).identity;
  if (
    [
      key('auth', 'create_rls_policy'),
      key('auth', 'install_tenant_triggers'),
    ].includes(name)
  )
    fail(
      file,
      'reviewed helper definition differs from exact stored capability registry',
    );
  const inner = tokens(body.value, file);
  refuseRoleEscalation(file, inner, 'stored');
  refuseAmbientConfiguration(file, inner);
  for (let i = 0; i < inner.length; i++) {
    if (inner[i].kind !== 'id') continue;
    if (inner[i].value === 'execute')
      fail(
        file,
        'dynamic stored body differs from exact reviewed capability registry',
      );
    if (
      inner[i].value === 'do' &&
      ['body', 'string'].includes(inner[i + 1]?.kind)
    )
      fail(file, 'nested procedural body requires explicit classification');
    if (
      ['create', 'alter', 'drop', 'truncate'].includes(inner[i].value) &&
      ['table', 'schema', 'policy', 'function', 'procedure'].includes(
        inner[i + 1]?.value,
      )
    )
      fail(
        file,
        'unreviewed stored DDL mutation requires explicit classification',
      );
    if (
      inner[i].value === 'auth' &&
      inner[i + 1]?.value === '.' &&
      inner[i + 2]?.value === 'create_rls_policy'
    )
      fail(file, 'stored helper invocation cannot confer static coverage');
  }
}

function refuseForeignProtection(file, statements, source) {
  const schemas = new Set(['outbox', 'offline']);
  const refers = (list) =>
    list.some(
      (v, i) =>
        v.kind === 'id' && schemas.has(v.value) && list[i + 1]?.value === '.',
    );
  for (const statement of statements) {
    refuseRoleEscalation(file, statement);
    refuseAmbientConfiguration(file, statement);
    refuseUnknownStoredBody(file, statement, source);
    if (
      statement[0]?.value === 'set' &&
      statement.some(
        (v) => v.kind === 'id' && ['search_path', 'schema'].includes(v.value),
      ) &&
      statement.some(
        (v) =>
          schemas.has(v.value) ||
          (v.kind === 'string' && /\b(?:outbox|offline)\b/i.test(v.value)),
      )
    )
      fail(file, 'foreign search_path selects protected outbox/offline schema');
    if (
      statement[0]?.value === 'select' &&
      statement.some(
        (v) => v.kind === 'id' && v.value === 'create_rls_policy',
      ) &&
      statement[5]?.kind === 'string' &&
      schemas.has(statement[5].value)
    )
      fail(
        file,
        'foreign helper invocation touches protected outbox/offline policies',
      );
    if (
      ![
        'create',
        'alter',
        'drop',
        'grant',
        'revoke',
        'truncate',
        'comment',
        'security',
        'do',
      ].includes(statement[0]?.value)
    )
      continue;
    if (refers(statement))
      fail(file, 'foreign DDL touches protected outbox/offline objects');
    // Bodies cannot conceal a security mutation or supply helper coverage.
    for (const body of statement.filter(
      (v) =>
        v.kind === 'body' ||
        (statement[0]?.value === 'do' && v.kind === 'string'),
    )) {
      const inner = tokens(body.value, file);
      if (
        refers(inner) ||
        inner.some(
          (v) =>
            v.kind === 'string' &&
            (/\b(?:outbox|offline)\s*\./i.test(v.value) ||
              schemas.has(v.value)),
        )
      )
        fail(file, 'foreign body touches protected outbox/offline objects');
    }
    if (
      statement.some(
        (v, i) =>
          v.value === 'schema' &&
          statement
            .slice(i + 1)
            .some((w) => w.kind === 'id' && schemas.has(w.value)),
      )
    )
      fail(file, 'foreign DDL touches protected schema');
  }
}

export function checkRlsDdl(root) {
  if (!fs.statSync(root).isDirectory())
    fail(root, 'repository root is not a directory');
  const approved = loadInstalledStorageArtifacts(root);
  const directory = path.join(root, 'backend/database/ddl');
  const ordinary = new Map();
  const allTables = new Map();
  const partitions = new Map();
  const tenantAdditions = new Map();
  const helpers = new Set();
  const packageCovered = new Set();
  for (const filename of fs
    .readdirSync(directory)
    .filter((v) => v.endsWith('.sql'))
    .sort()) {
    const file = `backend/database/ddl/${filename}`;
    const installed = approved.get(filename);
    const source = fs.readFileSync(path.join(directory, filename), 'utf8');
    const parsed = inventory(
      tokens(source, file, Boolean(installed)),
      file,
      Boolean(installed),
    );
    if (installed) {
      const expected = packageTables(
        file,
        installed.schema,
        installed.artifact,
        parsed.tables,
      );
      for (const identity of expected) packageCovered.add(identity);
    } else {
      refuseForeignProtection(file, parsed.statements, source);
      for (const [identity, tenant] of parsed.tables) {
        if (allTables.has(identity))
          fail(
            file,
            `${display(identity)}: duplicate declaration across DDL files`,
          );
        allTables.set(identity, { tenant, file });
        if (tenant) ordinary.set(identity, file);
      }
      for (const [identity, parent] of parsed.partitions)
        partitions.set(identity, parent);
      for (const identity of parsed.tenantAdditions)
        tenantAdditions.set(identity, file);
      for (const identity of parsed.helpers) helpers.add(identity);
    }
  }
  for (const [identity, file] of tenantAdditions) {
    const table = allTables.get(identity);
    if (!table)
      fail(
        file,
        `${display(identity)}: ALTER tenant column target is not inventoried`,
      );
    table.tenant = true;
    ordinary.set(identity, file);
  }
  const resolvePartition = (
    identity,
    visited = new Set(),
    sourceFile = directory,
  ) => {
    const table = allTables.get(identity);
    if (!table || visited.has(identity))
      fail(
        sourceFile,
        `${display(identity)}: unknown or cyclic partition parent`,
      );
    const parent = partitions.get(identity);
    if (!parent) return table.tenant;
    visited.add(identity);
    const tenant = resolvePartition(parent, visited, table.file);
    if (tenant) ordinary.set(identity, table.file);
    return tenant;
  };
  for (const identity of partitions.keys()) resolvePartition(identity);
  let helper = 0,
    exempt = 0;
  for (const [identity, file] of ordinary) {
    if (exemptions.has(identity)) exempt++;
    else if (helpers.has(identity)) helper++;
    else
      fail(
        file,
        `${display(identity)}: no effective auth.create_rls_policy signal`,
      );
  }
  return { helper, package: packageCovered.size, exempt };
}
