import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  lstatSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// Live, source-bound, job-owned companion. No SDK, apply.sh or fallback DB.
const root = realpathSync(
  fileURLToPath(new URL('../../../../', import.meta.url)),
);
const contextPath = path.join(
  root,
  'scratch/r22-adoption-161/live-custody-probe/context.json',
);
const ddlPath = 'backend/database/ddl/19-stynx-offline-custody.sql';
const ledgerPath = 'backend/database/ddl/19-stynx-storage-ledger.sql';
const initializer = `set -eu\n[ "$(id -u)" = 999 ]\n[ ! -e /var/lib/postgresql/18/docker/PG_VERSION ]\nmkdir -p /var/lib/postgresql/18/docker\n/usr/lib/postgresql/18/bin/initdb --pgdata=/var/lib/postgresql/18/docker --username=postgres --encoding=UTF8 --locale=C.UTF-8 --auth-local=trust --auth-host=trust\nexec /usr/lib/postgresql/18/bin/postgres -D /var/lib/postgresql/18/docker -c listen_addresses='*' -c port=5432 -c unix_socket_directories=/var/run/postgresql\n`;
const tmpfs = {
  '/var/lib/postgresql': 'rw,uid=999,gid=999,mode=0700',
  '/var/run/postgresql': 'rw,uid=999,gid=999,mode=0700',
  '/tmp': 'rw,uid=999,gid=999,mode=0700',
};
const hash = (b: string | Buffer) =>
  'sha256:' + createHash('sha256').update(b).digest('hex');
type BoundFile = { path: string; bytes: number; sha256: string };
type ProbeContext = {
  formatVersion: number;
  kind: string;
  owner: string;
  authority: { kind: string; runId: string; attempt: string; job: string };
  repository: { root: string; gitHubWorkspace: string };
  sources: BoundFile[];
  toolchain: {
    node: string;
    nodeSha256: string;
    docker: string;
    dockerSha256: string;
    binaries: { path: string; sha256: string }[];
  };
  server: {
    containerId: string;
    name: string;
    imageId: string;
    label: string;
    port: string;
    dataDirectory: string;
    systemIdentifier: string;
    pid: string;
  };
  runner: { command: string; user: string };
  subject: { database: string; oid: string; owner: string };
  entryCapture: Snapshot;
  outputDirectory: string;
};
function exactKeys(value: object, names: string[]) {
  expect(Object.keys(value).sort()).toEqual(names.sort());
}
function loadContext(): ProbeContext {
  const expected = process.env.DETRAN_STYNX_CUSTODY_PROBE_CONTEXT_SHA;
  if (!expected || !/^sha256:[0-9a-f]{64}$/u.test(expected))
    throw new Error('STYNX_CUSTODY_PROBE_REFUSED:context-sha');
  if (!existsSync(contextPath))
    throw new Error('STYNX_CUSTODY_PROBE_REFUSED:context-absent');
  expect(lstatSync(contextPath).isFile()).toBe(true);
  const bytes = readFileSync(contextPath);
  expect(hash(bytes)).toBe(expected);
  const context = JSON.parse(bytes.toString('utf8')) as ProbeContext;
  exactKeys(context, [
    'formatVersion',
    'kind',
    'owner',
    'authority',
    'repository',
    'sources',
    'toolchain',
    'server',
    'runner',
    'subject',
    'entryCapture',
    'outputDirectory',
  ]);
  expect(context.formatVersion).toBe(1);
  expect(context.kind).toBe('stynx-custody-rollback-live-context');
  expect(context.authority).toEqual({
    kind: 'native-ci-job-owned',
    runId: process.env.GITHUB_RUN_ID,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
    job: 'backend-kernel-full',
  });
  expect(context.owner).toBe(
    `${context.authority.runId}-${context.authority.attempt}`,
  );
  expect(context.repository).toEqual({ root, gitHubWorkspace: root });
  expect(context.outputDirectory).toBe(
    path.join(root, 'scratch/r22-adoption-161/live-custody-probe/runs'),
  );
  expect(context.sources.map((x) => x.path)).toEqual([
    'backend/app/tests/integration/r22-stynx-161-forward-custody.integration.spec.ts',
    'tools/ci/stynx-custody-probe.mjs',
    ddlPath,
    ledgerPath,
  ]);
  for (const item of context.sources) {
    exactKeys(item, ['path', 'bytes', 'sha256']);
    const file = path.join(root, item.path);
    expect(realpathSync(file)).toBe(file);
    const actual = readFileSync(file);
    expect({ bytes: actual.length, sha256: hash(actual) }).toEqual({
      bytes: item.bytes,
      sha256: item.sha256,
    });
  }
  expect(context.toolchain.node).toBe(process.execPath);
  expect(hash(readFileSync(process.execPath))).toBe(
    context.toolchain.nodeSha256,
  );
  expect(context.toolchain.docker).toBe('/usr/bin/docker');
  expect(hash(readFileSync('/usr/bin/docker'))).toBe(
    context.toolchain.dockerSha256,
  );
  expect(context.toolchain.binaries).toHaveLength(4);
  expect(context.server).toMatchObject({
    name: `detran-stynx-custody-${context.owner}`,
    label: 'detran.stynx.native-ci-owner',
    port: '5433',
    dataDirectory: '/var/lib/postgresql/18/docker',
  });
  expect(context.runner).toEqual({
    command: '/usr/bin/docker',
    user: '999:999',
  });
  expect(context.subject).toMatchObject({
    database: 'detran_r22_161_negative',
    owner: 'postgres',
  });
  exactKeys(context.authority, ['kind', 'runId', 'attempt', 'job']);
  exactKeys(context.repository, ['root', 'gitHubWorkspace']);
  exactKeys(context.toolchain, [
    'node',
    'nodeSha256',
    'docker',
    'dockerSha256',
    'binaries',
  ]);
  exactKeys(context.server, [
    'containerId',
    'name',
    'imageId',
    'label',
    'port',
    'dataDirectory',
    'systemIdentifier',
    'pid',
  ]);
  exactKeys(context.runner, ['command', 'user']);
  exactKeys(context.subject, ['database', 'oid', 'owner']);
  expect(context.server.containerId).toMatch(/^[0-9a-f]{64}$/u);
  expect(context.server.imageId).toMatch(/^sha256:[0-9a-f]{64}$/u);
  expect(context.server.systemIdentifier).toMatch(/^\d{10,20}$/u);
  expect(context.subject.oid).toMatch(/^\d+$/u);
  const inspected = spawnSync(
    '/usr/bin/docker',
    ['container', 'inspect', context.server.containerId],
    {
      encoding: 'utf8',
      env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
      maxBuffer: 8 * 1024 * 1024,
      timeout: 30000,
    },
  );
  expect(inspected.status, inspected.stderr).toBe(0);
  const actual = JSON.parse(inspected.stdout)[0];
  expect(actual.Id).toBe(context.server.containerId);
  expect(actual.Name).toBe('/' + context.server.name);
  expect(actual.Image).toBe(context.server.imageId);
  expect(actual.Config.Image).toBe(context.server.imageId);
  expect(actual.Config.User).toBe(context.runner.user);
  expect(actual.Config.Labels[context.server.label]).toBe(context.owner);
  expect(actual.Config.Entrypoint).toEqual(['/bin/sh']);
  expect(actual.Config.Cmd).toEqual(['-ec', initializer]);
  expect(actual.HostConfig.ReadonlyRootfs).toBe(true);
  expect(actual.HostConfig.CapDrop).toEqual(['ALL']);
  expect(
    actual.HostConfig.CapAdd === null ||
      JSON.stringify(actual.HostConfig.CapAdd) === '[]',
  ).toBe(true);
  expect(actual.HostConfig.Privileged).toBe(false);
  expect(actual.HostConfig.SecurityOpt).toHaveLength(1);
  expect(['no-new-privileges', 'no-new-privileges:true']).toContain(
    actual.HostConfig.SecurityOpt[0],
  );
  expect(actual.HostConfig.Memory).toBe(2 * 1024 * 1024 * 1024);
  expect(actual.HostConfig.NanoCpus).toBe(2 * 1000000000);
  expect(actual.HostConfig.ShmSize).toBe(256 * 1024 * 1024);
  expect(actual.HostConfig.Tmpfs).toEqual(tmpfs);
  expect(actual.HostConfig.Binds?.length ?? 0).toBe(0);
  expect(actual.HostConfig.Mounts?.length ?? 0).toBe(0);
  expect(actual.Mounts).toHaveLength(3);
  expect(
    actual.Mounts.every(
      (m: { Type: string; Destination: string }) =>
        m.Type === 'tmpfs' && Object.hasOwn(tmpfs, m.Destination),
    ),
  ).toBe(true);
  expect(
    new Set(actual.Mounts.map((m: { Destination: string }) => m.Destination))
      .size,
  ).toBe(3);
  expect(
    Object.keys(actual.Config.Volumes ?? {}).every((p) =>
      Object.hasOwn(tmpfs, p),
    ),
  ).toBe(true);
  expect(actual.HostConfig.PortBindings).toEqual({
    '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: context.server.port }],
  });
  expect(actual.NetworkSettings.Ports['5432/tcp']).toEqual([
    { HostIp: '127.0.0.1', HostPort: context.server.port },
  ]);
  const binaryLines = readFileSync(
    path.join(
      root,
      'tools/stynx-storage/consumer-fixtures/postgis-runtime/core-binaries.sha256',
    ),
    'utf8',
  )
    .trim()
    .split('\n');
  expect(
    context.toolchain.binaries.map(
      (item) => `${item.sha256.slice(7)}  ${item.path}`,
    ),
  ).toEqual(binaryLines);
  const binaries = spawnSync(
    '/usr/bin/docker',
    [
      'exec',
      context.server.containerId,
      '/usr/bin/sha256sum',
      ...context.toolchain.binaries.map((item) => item.path),
    ],
    {
      encoding: 'utf8',
      env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
      maxBuffer: 8 * 1024 * 1024,
      timeout: 30000,
    },
  );
  expect(binaries.status, binaries.stderr).toBe(0);
  expect(binaries.stdout.trim().split('\n')).toEqual(binaryLines);
  return context;
}
const literal = (s: string) => "'" + s.replaceAll("'", "''") + "'";
const tables = [
  'stynx_offline_baseline_custody',
  'stynx_offline_forward_receipts',
  'stynx_storage_target_admissions',
];
const functions = [
  'stynx_offline_custody_immutable',
  'stynx_storage_target_admissions_immutable',
];
const captureSql = `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL TimeZone='UTC'; SET LOCAL row_security=on;
SELECT jsonb_build_object(
 'identity',jsonb_build_object('database',current_database(),'oid',d.oid::text,'owner',pg_get_userbyid(d.datdba),
 'systemIdentifier',(SELECT system_identifier::text FROM pg_control_system()),'dataDirectory',current_setting('data_directory'),
 'address',inet_server_addr()::text,'port',current_setting('port'),'serverVersion',current_setting('server_version'),'serverVersionNum',current_setting('server_version_num'),
 'sessionUser',session_user,'currentUser',current_user,'readOnly',current_setting('transaction_read_only'),
 'isolation',current_setting('transaction_isolation'),'timezone',current_setting('TimeZone'),'rowSecurity',current_setting('row_security'),
 'replicationRole',current_setting('session_replication_role'),'unixSockets',current_setting('unix_socket_directories'),
 'pidfile',pg_read_file('postmaster.pid')),
 'schemas',(SELECT jsonb_agg(jsonb_build_object('name',nspname,'owner',pg_get_userbyid(nspowner),'acl',nspacl::text) ORDER BY nspname COLLATE "C") FROM pg_namespace WHERE nspname!~'^pg_' AND nspname<>'information_schema'),
 'relations',(SELECT coalesce(jsonb_agg(n.nspname||'.'||c.relname ORDER BY n.nspname,c.relname),'[]') FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname!~'^pg_' AND n.nspname<>'information_schema'),
 'functions',(SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname!~'^pg_' AND n.nspname<>'information_schema'),
 'types',(SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname!~'^pg_' AND n.nspname<>'information_schema'),
 'extensions',(SELECT jsonb_agg(extname ORDER BY extname) FROM pg_extension),'eventTriggers',(SELECT count(*) FROM pg_event_trigger),
 'defaults',(SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY oid),'[]') FROM pg_default_acl a),
 'roles',(SELECT jsonb_agg(jsonb_build_object('oid',oid::text,'name',rolname,'super',rolsuper,'inherit',rolinherit,'createRole',rolcreaterole,'createDb',rolcreatedb,'login',rolcanlogin,'replication',rolreplication,'bypassRls',rolbypassrls,'connectionLimit',rolconnlimit,'validUntil',rolvaliduntil::text,'config',rolconfig) ORDER BY rolname) FROM pg_roles),
 'memberships',(SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY roleid,member,grantor),'[]') FROM pg_auth_members m),
 'otherClientSessions',(SELECT count(*) FROM pg_stat_activity WHERE backend_type='client backend' AND pid<>pg_backend_pid())
) FROM pg_database d WHERE datname=current_database(); ROLLBACK;`;

type Snapshot = {
  identity: Record<string, string>;
  schemas: { name: string }[];
  relations: string[];
  functions: number;
  types: number;
  extensions: string[];
  eventTriggers: number;
  defaults: unknown[];
  roles: { name: string; oid: string }[];
  memberships: { roleid: number; member: number; grantor: number }[];
  otherClientSessions: number;
};

it('proves custody creation/security negatives only inside a rolled-back leased transaction', () => {
  const context = loadContext();
  const sourceBefore = Object.fromEntries(
    context.sources.map((item) => [item.path, item.sha256]),
  );
  mkdirSync(context.outputDirectory, { recursive: true, mode: 0o700 });
  const run = mkdtempSync(path.join(context.outputDirectory, 'inspector-run-'));
  function execute(name: string, sql: string) {
    writeFileSync(path.join(run, name + '.sql'), sql);
    const result = spawnSync(
      context.runner.command,
      [
        'exec',
        '-i',
        context.server.containerId,
        '/usr/lib/postgresql/18/bin/psql',
        '-X',
        '-v',
        'ON_ERROR_STOP=1',
        '-h',
        '127.0.0.1',
        '-U',
        'postgres',
        '-d',
        context.subject.database,
        '-qAt',
      ],
      {
        input: sql,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
        env: {
          PATH: '/usr/bin:/bin',
          HOME: process.env.HOME ?? '',
        },
      },
    );
    writeFileSync(path.join(run, name + '.stdout'), result.stdout ?? '');
    writeFileSync(path.join(run, name + '.stderr'), result.stderr ?? '');
    writeFileSync(
      path.join(run, name + '.status.json'),
      JSON.stringify(
        {
          status: result.status,
          signal: result.signal,
          error: result.error?.message,
          sqlSha256: hash(sql),
        },
        null,
        2,
      ),
    );
    return result;
  }
  function capture(name: string) {
    const result = execute(name, captureSql);
    expect(result.status, result.stderr).toBe(0);
    const snapshot = JSON.parse(result.stdout.trim()) as Snapshot;
    expect(snapshot.identity).toMatchObject({
      database: context.subject.database,
      oid: context.subject.oid,
      owner: context.subject.owner,
      systemIdentifier: context.server.systemIdentifier,
      dataDirectory: context.server.dataDirectory,
      address: '127.0.0.1/32',
      port: '5432',
      serverVersionNum: '180002',
      sessionUser: 'postgres',
      currentUser: 'postgres',
      readOnly: 'on',
      isolation: 'repeatable read',
      timezone: 'UTC',
      rowSecurity: 'on',
      replicationRole: 'origin',
    });
    expect(snapshot.identity.pidfile.split('\n')[0]).toBe(context.server.pid);
    expect(snapshot.schemas.map((x) => x.name)).toEqual(['public']);
    expect(snapshot.relations).toEqual([]);
    expect(snapshot.functions).toBe(0);
    expect(snapshot.types).toBe(0);
    expect(snapshot.extensions).toEqual(['plpgsql']);
    expect(snapshot.eventTriggers).toBe(0);
    expect(snapshot.defaults).toEqual([]);
    expect(
      snapshot.roles
        .filter((x) => !x.name.startsWith('pg_'))
        .map((x) => x.name),
    ).toEqual(['postgres']);
    for (const member of snapshot.memberships) {
      for (const oid of [member.roleid, member.member])
        expect(snapshot.roles.find((x) => x.oid === String(oid))?.name).toMatch(
          /^pg_/u,
        );
      expect(
        snapshot.roles.find((x) => x.oid === String(member.grantor))?.name,
      ).toBe('postgres');
    }
    expect(snapshot.otherClientSessions).toBe(0);
    return snapshot;
  }
  const before = capture('entry-readonly');
  expect(before).toEqual(context.entryCapture);
  const ddl = readFileSync(path.join(root, ddlPath), 'utf8');
  const matches = [
    ...ddl.matchAll(/DO \$custody_catalog\$[\s\S]*?END \$custody_catalog\$;/gu),
  ];
  expect(matches).toHaveLength(1);
  const assertion = matches[0][0]; // Exact original bytes, never a test replacement.
  writeFileSync(path.join(run, 'exact-catalog-assertion.sql'), assertion);
  const expectedCases: string[] = [];
  function pass(name: string) {
    expectedCases.push(name);
    return `\\echo PASS|${name}\n`;
  }
  function failure(
    name: string,
    statement: string,
    state: string,
    message?: string,
  ) {
    const messageCheck = message
      ? `IF SQLERRM<>${literal(message)} THEN RAISE; END IF;`
      : '';
    return (
      `DO $probe$ BEGIN BEGIN EXECUTE ${literal(statement)}; RAISE EXCEPTION 'Probe operation unexpectedly succeeded' USING ERRCODE='XX000'; EXCEPTION WHEN SQLSTATE '${state}' THEN ${messageCheck} END; END $probe$;\n` +
      pass(name)
    );
  }
  let sql =
    `BEGIN; SET LOCAL TimeZone='UTC'; SET LOCAL row_security=on; SET LOCAL search_path=pg_catalog,public;
SELECT pg_advisory_xact_lock(7007,1);
DO $identity$ BEGIN IF current_database()<>${literal(context.subject.database)} OR (SELECT oid::text FROM pg_database WHERE datname=current_database())<>${literal(context.subject.oid)} OR (SELECT system_identifier::text FROM pg_control_system())<>${literal(context.server.systemIdentifier)} OR session_user<>'postgres' OR current_user<>'postgres' OR current_setting('port')<>'5432' OR current_setting('data_directory')<>${literal(context.server.dataDirectory)} THEN RAISE EXCEPTION 'Probe subject drift'; END IF; END $identity$;
CREATE ROLE role_app_backend NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION;
CREATE ROLE role_auditor_min NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION;
CREATE SCHEMA integration AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA integration TO role_app_backend,role_auditor_min;
` +
    readFileSync(path.join(root, ledgerPath), 'utf8') +
    '\n' +
    ddl +
    '\n' +
    pass('exact-candidate-create-and-catalogue');
  sql += `SELECT 'CATALOG|'||jsonb_build_object(
 'columns',(SELECT jsonb_agg(jsonb_build_object('table',c.relname,'column',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notnull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) ORDER BY c.relname,a.attnum) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum WHERE n.nspname='integration'),
 'constraints',(SELECT jsonb_agg(jsonb_build_object('oid',c.oid::text,'table',c.conrelid::regclass::text,'name',c.conname,'type',c.contype,'definition',pg_get_constraintdef(c.oid),'validated',c.convalidated,'noinherit',c.connoinherit,'key',c.conkey,'parentKey',c.confkey) ORDER BY c.conrelid,c.conname) FROM pg_constraint c WHERE c.connamespace='integration'::regnamespace),
 'fks',(SELECT jsonb_agg(jsonb_build_object('oid',oid::text,'child',conrelid::text,'parent',confrelid::text,'index',conindid::text,'name',conname) ORDER BY oid) FROM pg_constraint WHERE contype='f' AND connamespace='integration'::regnamespace),
 'ri',(SELECT jsonb_agg(jsonb_build_object('constraint',t.tgconstraint::text,'relation',t.tgrelid::text,'opposite',t.tgconstrrelid::text,'index',t.tgconstrindid::text,'type',t.tgtype,'function',p.proname,'namespace',n.nspname,'internal',t.tgisinternal,'enabled',t.tgenabled,'deferrable',t.tgdeferrable) ORDER BY t.oid) FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid JOIN pg_namespace n ON n.oid=p.pronamespace WHERE t.tgisinternal AND t.tgconstraint IN (SELECT oid FROM pg_constraint WHERE contype='f' AND connamespace='integration'::regnamespace)),
 'policies',(SELECT count(*) FROM pg_policy WHERE polrelid IN (SELECT oid FROM pg_class WHERE relnamespace='integration'::regnamespace)),
 'relations',(SELECT jsonb_agg(jsonb_build_object('name',relname,'owner',pg_get_userbyid(relowner),'rls',relrowsecurity,'force',relforcerowsecurity,'acl',relacl::text) ORDER BY relname) FROM pg_class WHERE relnamespace='integration'::regnamespace AND relkind='r'),
 'functions',(SELECT jsonb_agg(jsonb_build_object('name',proname,'owner',pg_get_userbyid(proowner),'definer',prosecdef,'config',proconfig,'body',prosrc,'acl',proacl::text) ORDER BY proname) FROM pg_proc WHERE pronamespace='integration'::regnamespace)
)::text;\n`;
  for (const mode of ['origin', 'replica']) {
    sql += `SET LOCAL session_replication_role=${mode};\n`;
    for (const name of tables)
      for (const op of ['UPDATE', 'DELETE', 'TRUNCATE']) {
        const command =
          op === 'UPDATE'
            ? `UPDATE integration.${name} SET document=document`
            : `${op}${op === 'DELETE' ? ' FROM' : ''} integration.${name}${op === 'TRUNCATE' ? ' CASCADE' : ''}`;
        sql += failure(
          `immutable-${mode}-${name}-${op.toLowerCase()}`,
          command,
          'P0001',
          name === 'stynx_storage_target_admissions'
            ? 'STYNX target storage admission evidence is immutable'
            : 'Offline custody and forward receipts are immutable',
        );
      }
  }
  sql += 'SET LOCAL session_replication_role=origin;\n';
  for (const role of ['role_app_backend', 'role_auditor_min']) {
    sql += `SET LOCAL ROLE ${role};\n`;
    for (const name of tables)
      sql += failure(
        `denied-${role}-${name}`,
        `SELECT * FROM integration.${name}`,
        '42501',
      );
    for (const name of functions) {
      sql +=
        `DO $priv$ BEGIN IF has_function_privilege(current_user,'integration.${name}()','EXECUTE') THEN RAISE EXCEPTION 'Unexpected function privilege'; END IF; END $priv$;\n` +
        pass(`denied-${role}-${name}`);
    }
    sql += 'RESET ROLE;\n';
  }
  function tamper(name: string, changes: string) {
    return `SAVEPOINT negative_case;\n${changes}\n\\set ON_ERROR_STOP off\n${assertion}\n\\set caught_state :SQLSTATE\n\\set caught_error :ERROR\n\\set ON_ERROR_STOP on\nROLLBACK TO SAVEPOINT negative_case;\nSELECT :'caught_error'::boolean AND :'caught_state'='P0001' AS caught_expected \\gset\n\\if :caught_expected\n${pass(name)}\\else\nROLLBACK;\n\\quit 4\n\\endif\nRELEASE SAVEPOINT negative_case;\n${assertion}\n`;
  }
  sql += tamper(
    'literal-whitespace-tamper',
    `ALTER TABLE integration.stynx_offline_baseline_custody DROP CONSTRAINT stynx_offline_baseline_custody_package_check; ALTER TABLE integration.stynx_offline_baseline_custody ADD CONSTRAINT stynx_offline_baseline_custody_package_check CHECK(package='@stynx-nyx/offline- sync');`,
  );
  sql += tamper(
    'nologin-set-parent-schema-create',
    `CREATE ROLE r22_probe_parent NOLOGIN NOINHERIT; CREATE ROLE r22_probe_login LOGIN NOINHERIT; GRANT r22_probe_parent TO r22_probe_login WITH INHERIT FALSE, SET TRUE; GRANT CREATE ON SCHEMA integration TO r22_probe_parent; DO $closure$ BEGIN IF has_schema_privilege('r22_probe_login','integration','CREATE') OR NOT pg_has_role('r22_probe_login','r22_probe_parent','SET') THEN RAISE EXCEPTION 'Invalid NOINHERIT fixture'; END IF; END $closure$;`,
  );
  sql += tamper(
    'set-intrinsic-read-all-parent',
    `CREATE ROLE r22_probe_login LOGIN NOINHERIT; GRANT pg_read_all_data TO r22_probe_login WITH INHERIT FALSE, SET TRUE;`,
  );
  sql += tamper(
    'set-privileged-super-parent',
    `CREATE ROLE r22_probe_parent NOLOGIN SUPERUSER; CREATE ROLE r22_probe_login LOGIN NOINHERIT; GRANT r22_probe_parent TO r22_probe_login WITH INHERIT FALSE, SET TRUE;`,
  );
  sql += tamper(
    'force-rls-disabled',
    `ALTER TABLE integration.stynx_offline_forward_receipts NO FORCE ROW LEVEL SECURITY;`,
  );
  sql += tamper(
    'immutable-trigger-not-always',
    `ALTER TABLE integration.stynx_offline_forward_receipts ENABLE TRIGGER stynx_offline_forward_immutable;`,
  );
  sql += tamper(
    'unknown-check-constraint',
    `ALTER TABLE integration.stynx_offline_forward_receipts ADD CONSTRAINT r22_unexpected CHECK(true);`,
  );
  sql += tamper(
    'disabled-ri-trigger',
    `SELECT format('ALTER TABLE %s DISABLE TRIGGER %I',tgrelid::regclass,tgname) FROM pg_trigger WHERE tgisinternal AND tgrelid='integration.stynx_offline_forward_receipts'::regclass ORDER BY oid LIMIT 1 \\gexec`,
  );
  sql +=
    `SELECT 'ROWS|'||jsonb_build_object('ledger',(SELECT count(*) FROM integration.stynx_storage_installations),'baseline',(SELECT count(*) FROM integration.stynx_offline_baseline_custody),'forward',(SELECT count(*) FROM integration.stynx_offline_forward_receipts),'group',(SELECT count(*) FROM integration.stynx_storage_target_admissions))::text;\nROLLBACK;\n` +
    pass('outer-rollback');
  let result: ReturnType<typeof execute> | undefined;
  let after: Snapshot | undefined;
  try {
    result = execute('probe', sql);
  } finally {
    after = capture('exit-readonly');
  }
  const same = JSON.stringify(before) === JSON.stringify(after);
  const sourceAfter = Object.fromEntries(
    context.sources.map((item) => [
      item.path,
      hash(readFileSync(path.join(root, item.path))),
    ]),
  );
  writeFileSync(
    path.join(run, 'result.json'),
    JSON.stringify(
      {
        kind: 'ROLLBACK_ONLY_LIVE_CI',
        candidateSha256: sourceBefore[ddlPath],
        sourceBefore,
        sourceAfter,
        status: result?.status,
        rawEntryExitEqual: same,
        actualWitnesses: result?.stdout
          .split('\n')
          .filter((x) => x.startsWith('PASS|'))
          .map((x) => x.slice(5)),
        expectedWitnesses: expectedCases,
        disposition: same
          ? 'PRISTINE_ROLLBACK_OBSERVED; JOB_OWNED_COMPANION'
          : 'QUARANTINE_NO_REPAIR',
      },
      null,
      2,
    ),
  );
  expect(same, 'Unexpected residue: quarantine, no cleanup').toBe(true);
  expect(sourceAfter).toEqual(sourceBefore);
  loadContext();
  expect(result?.status, result?.stderr).toBe(0);
  const markers = result!.stdout
    .split('\n')
    .filter((x) => x.startsWith('PASS|'))
    .map((x) => x.slice(5));
  expect(markers).toEqual(expectedCases);
  const catalog = JSON.parse(
    result!.stdout
      .split('\n')
      .find((x) => x.startsWith('CATALOG|'))!
      .slice(8),
  );
  expect(catalog.fks).toHaveLength(8);
  const actualRi = catalog.ri.map((x: Record<string, unknown>) => {
    expect(x.namespace).toBe('pg_catalog');
    expect(x.internal).toBe(true);
    expect(x.enabled).toBe('O');
    expect(x.deferrable).toBe(false);
    return [x.constraint, x.index, x.relation, x.opposite, x.type, x.function];
  });
  const expectedRi = catalog.fks.flatMap((x: Record<string, string>) => [
    [x.oid, x.index, x.child, x.parent, 5, 'RI_FKey_check_ins'],
    [x.oid, x.index, x.child, x.parent, 17, 'RI_FKey_check_upd'],
    [x.oid, x.index, x.parent, x.child, 9, 'RI_FKey_restrict_del'],
    [x.oid, x.index, x.parent, x.child, 17, 'RI_FKey_noaction_upd'],
  ]);
  expect(actualRi.map((x: unknown) => JSON.stringify(x)).sort()).toEqual(
    expectedRi.map((x: unknown) => JSON.stringify(x)).sort(),
  );
  expect(catalog.policies).toBe(0);
  expect(
    JSON.parse(
      result!.stdout
        .split('\n')
        .find((x) => x.startsWith('ROWS|'))!
        .slice(5),
    ),
  ).toEqual({ ledger: 0, baseline: 0, forward: 0, group: 0 });
  writeFileSync(
    path.join(run, 'closed.json'),
    JSON.stringify(
      {
        kind: 'STYNX_CUSTODY_LIVE_ROLLBACK_CLOSED',
        owner: context.owner,
        containerId: context.server.containerId,
        entryExitEqual: same,
        witnessCount: markers.length,
        fkCount: catalog.fks.length,
        riCount: actualRi.length,
        sourceAfter,
      },
      null,
      2,
    ),
  );
}, 120_000);
