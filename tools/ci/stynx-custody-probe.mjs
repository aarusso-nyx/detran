// A private, job-owned companion for the original rolled-back custody probe.
// It is started before the application database creates cluster-global roles.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = fs.realpathSync(process.argv[2] ?? '.');
const action = process.argv[3];
const owner = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
const initializer = `set -eu\n[ "$(id -u)" = 999 ]\n[ ! -e /var/lib/postgresql/18/docker/PG_VERSION ]\nmkdir -p /var/lib/postgresql/18/docker\n/usr/lib/postgresql/18/bin/initdb --pgdata=/var/lib/postgresql/18/docker --username=postgres --encoding=UTF8 --locale=C.UTF-8 --auth-local=trust --auth-host=trust\nexec /usr/lib/postgresql/18/bin/postgres -D /var/lib/postgresql/18/docker -c listen_addresses='*' -c port=5432 -c unix_socket_directories=/var/run/postgresql\n`;
const tmpfs = {
  '/var/lib/postgresql': 'rw,uid=999,gid=999,mode=0700',
  '/var/run/postgresql': 'rw,uid=999,gid=999,mode=0700',
  '/tmp': 'rw,uid=999,gid=999,mode=0700',
};
const required = (condition, detail) => {
  if (!condition) throw new Error(`STYNX_CUSTODY_COMPANION_REFUSED:${detail}`);
};
const sha = (bytes) =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const bind = (relative) => {
  const absolute = path.join(root, relative);
  required(fs.realpathSync(absolute) === absolute, 'source-link');
  const bytes = fs.readFileSync(absolute);
  return { path: relative, bytes: bytes.length, sha256: sha(bytes) };
};
const run = (args, ok = true) => {
  const result = spawnSync('/usr/bin/docker', args, {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 32 * 1024 * 1024,
    env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
    shell: false,
  });
  if (ok)
    required(
      !result.error && !result.signal && result.status === 0,
      `docker:${args[0]}:${result.stderr ?? result.error?.message}`,
    );
  return result;
};
const writeExclusive = (file, value) => {
  const fd = fs.openSync(file, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, value);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
};
const snapshotSource =
  'backend/app/tests/integration/r22-stynx-161-forward-custody.integration.spec.ts';
const source = fs.readFileSync(path.join(root, snapshotSource), 'utf8');
const capture = source.match(
  /const captureSql = `([\s\S]*?)`;\n\ntype Snapshot/u,
);
required(
  capture?.[1]?.startsWith(
    'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;',
  ) && capture[1].endsWith('ROLLBACK;'),
  'capture-source',
);
const fixedSources = [
  snapshotSource,
  'tools/ci/stynx-custody-probe.mjs',
  'backend/database/ddl/19-stynx-offline-custody.sql',
  'backend/database/ddl/19-stynx-storage-ledger.sql',
];
try {
  required(
    process.argv.length === 4 && ['start', 'cleanup'].includes(action),
    'argv',
  );
  required(
    process.platform === 'linux' &&
      process.arch === 'x64' &&
      process.env.GITHUB_ACTIONS === 'true' &&
      process.env.GITHUB_JOB === 'backend-kernel-full' &&
      /^\d+-\d+$/u.test(owner) &&
      process.env.GITHUB_WORKSPACE === root &&
      fs.realpathSync(process.env.RUNNER_TEMP) === process.env.RUNNER_TEMP &&
      typeof process.env.GITHUB_ENV === 'string' &&
      path.isAbsolute(process.env.GITHUB_ENV),
    'job-owner',
  );
  const job = path.join(
    process.env.RUNNER_TEMP,
    `detran-stynx-postgis-${owner}`,
  );
  const record = JSON.parse(
    fs.readFileSync(path.join(job, 'job-image.json'), 'utf8'),
  );
  required(
    record.owner === owner && /^sha256:[0-9a-f]{64}$/u.test(record.imageId),
    'image-owner',
  );
  const name = `detran-stynx-custody-${owner}`;
  const label = 'detran.stynx.native-ci-owner';
  const contextDir = path.join(
    root,
    'scratch/r22-adoption-161/live-custody-probe',
  );
  const contextPath = path.join(contextDir, 'context.json');
  if (action === 'cleanup') {
    const inspected = run(['container', 'inspect', name], false);
    if (inspected.status === 0) {
      const actual = JSON.parse(inspected.stdout)[0];
      required(
        actual.Name === '/' + name &&
          actual.Image === record.imageId &&
          actual.Config.Labels?.[label] === owner &&
          actual.Config.User === '999:999',
        'cleanup-owner',
      );
      required(fs.existsSync(contextPath), 'quarantine-no-context');
      const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
      required(
        context.server?.containerId === actual.Id &&
          context.owner === owner &&
          context.outputDirectory === path.join(contextDir, 'runs'),
        'cleanup-context',
      );
      const runs = fs.existsSync(context.outputDirectory)
        ? fs
            .readdirSync(context.outputDirectory)
            .filter((x) => /^inspector-run-[A-Za-z0-9]+$/u.test(x))
        : [];
      required(runs.length === 1, 'quarantine-run-count');
      const closure = JSON.parse(
        fs.readFileSync(
          path.join(context.outputDirectory, runs[0], 'closed.json'),
          'utf8',
        ),
      );
      required(
        closure.kind === 'STYNX_CUSTODY_LIVE_ROLLBACK_CLOSED' &&
          closure.owner === owner &&
          closure.containerId === actual.Id &&
          closure.entryExitEqual === true &&
          closure.witnessCount === 38 &&
          closure.fkCount === 8 &&
          closure.riCount === 32 &&
          JSON.stringify(closure.sourceAfter) ===
            JSON.stringify(
              Object.fromEntries(
                context.sources.map((s) => [s.path, s.sha256]),
              ),
            ),
        'quarantine-not-closed',
      );
      run(['rm', '--force', actual.Id]);
    } else
      required(
        inspected.status === 1 &&
          /No such (?:object|container)/u.test(inspected.stderr),
        'cleanup-inspect',
      );
  } else {
    required(!fs.existsSync(contextPath), 'context-exists');
    required(!fs.existsSync(contextDir), 'probe-directory-exists');
    required(
      run(['container', 'inspect', name], false).status === 1,
      'container-exists',
    );
    const id = run([
      'run',
      '--detach',
      '--platform',
      'linux/amd64',
      '--name',
      name,
      '--label',
      `${label}=${owner}`,
      '--user',
      '999:999',
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
      '--read-only',
      '--tmpfs',
      '/var/lib/postgresql:rw,uid=999,gid=999,mode=0700',
      '--tmpfs',
      '/var/run/postgresql:rw,uid=999,gid=999,mode=0700',
      '--tmpfs',
      '/tmp:rw,uid=999,gid=999,mode=0700',
      '--shm-size',
      '256m',
      '--memory',
      '2g',
      '--cpus',
      '2',
      '--publish',
      '127.0.0.1:5433:5432',
      '--entrypoint',
      '/bin/sh',
      record.imageId,
      '-ec',
      initializer,
    ]).stdout.trim();
    required(/^[0-9a-f]{64}$/u.test(id), 'container-id');
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (
        run(
          [
            'exec',
            id,
            '/usr/lib/postgresql/18/bin/pg_isready',
            '-U',
            'postgres',
            '-d',
            'postgres',
          ],
          false,
        ).status === 0
      ) {
        ready = true;
        break;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
    required(ready, 'readiness');
    const actual = JSON.parse(run(['container', 'inspect', id]).stdout)[0];
    required(
      actual.Id === id &&
        actual.Image === record.imageId &&
        actual.Config.Image === record.imageId &&
        actual.Name === '/' + name &&
        actual.Config.User === '999:999' &&
        actual.Config.Labels?.[label] === owner &&
        JSON.stringify(actual.Config.Entrypoint) ===
          JSON.stringify(['/bin/sh']) &&
        JSON.stringify(actual.Config.Cmd) ===
          JSON.stringify(['-ec', initializer]) &&
        actual.HostConfig.ReadonlyRootfs === true &&
        JSON.stringify(actual.HostConfig.CapDrop) === JSON.stringify(['ALL']) &&
        (actual.HostConfig.CapAdd === null ||
          JSON.stringify(actual.HostConfig.CapAdd) === '[]') &&
        actual.HostConfig.Privileged === false &&
        actual.HostConfig.SecurityOpt?.length === 1 &&
        ['no-new-privileges', 'no-new-privileges:true'].includes(
          actual.HostConfig.SecurityOpt[0],
        ) &&
        actual.HostConfig.Memory === 2 * 1024 * 1024 * 1024 &&
        actual.HostConfig.NanoCpus === 2 * 1000000000 &&
        actual.HostConfig.ShmSize === 256 * 1024 * 1024 &&
        actual.HostConfig.Tmpfs &&
        Object.keys(actual.HostConfig.Tmpfs).length ===
          Object.keys(tmpfs).length &&
        Object.entries(tmpfs).every(
          ([destination, options]) =>
            Object.hasOwn(actual.HostConfig.Tmpfs, destination) &&
            actual.HostConfig.Tmpfs[destination] === options,
        ) &&
        [null, 0].includes(actual.HostConfig.Binds?.length ?? null) &&
        [null, 0].includes(actual.HostConfig.Mounts?.length ?? null) &&
        actual.Mounts.length === 3 &&
        actual.Mounts.every(
          (m) => m.Type === 'tmpfs' && Object.hasOwn(tmpfs, m.Destination),
        ) &&
        new Set(actual.Mounts.map((m) => m.Destination)).size === 3 &&
        Object.keys(actual.Config.Volumes ?? {}).every((p) =>
          Object.hasOwn(tmpfs, p),
        ) &&
        JSON.stringify(actual.HostConfig.PortBindings) ===
          JSON.stringify({
            '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '5433' }],
          }) &&
        JSON.stringify(actual.NetworkSettings.Ports) ===
          JSON.stringify({
            '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '5433' }],
          }),
      'precreate-container-controls',
    );
    const binaryLines = fs
      .readFileSync(
        path.join(
          root,
          'tools/stynx-storage/consumer-fixtures/postgis-runtime/core-binaries.sha256',
        ),
        'utf8',
      )
      .trim()
      .split('\n');
    required(binaryLines.length === 4, 'four-binaries');
    const binaries = binaryLines.map((line) => {
      const match = line.match(
        /^([0-9a-f]{64})  (\/usr\/lib\/postgresql\/18\/bin\/(?:postgres|psql|pg_ctl|initdb))$/u,
      );
      required(match, 'binary-line');
      return { path: match[2], sha256: `sha256:${match[1]}` };
    });
    required(
      run([
        'exec',
        id,
        '/usr/bin/sha256sum',
        ...binaries.map((b) => b.path),
      ]).stdout.trim() === binaryLines.join('\n'),
      'precreate-actual-binaries',
    );
    // CREATE DATABASE cannot run inside a transaction block.
    const created = run([
      'exec',
      id,
      '/usr/lib/postgresql/18/bin/psql',
      '-X',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-At',
      '-c',
      'CREATE DATABASE detran_r22_161_negative OWNER postgres;',
    ]).stdout;
    required(created.trim() === 'CREATE DATABASE', 'subject-create');
    // The full capture is performed below with stdin, so it is not read from a caller field.
    const entryRun = spawnSync(
      '/usr/bin/docker',
      [
        'exec',
        '-i',
        id,
        '/usr/lib/postgresql/18/bin/psql',
        '-X',
        '-v',
        'ON_ERROR_STOP=1',
        '-h',
        '127.0.0.1',
        '-U',
        'postgres',
        '-d',
        'detran_r22_161_negative',
        '-qAt',
      ],
      {
        input: capture[1],
        encoding: 'utf8',
        timeout: 120000,
        maxBuffer: 32 * 1024 * 1024,
        env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
        shell: false,
      },
    );
    required(
      entryRun.status === 0 && !entryRun.signal && !entryRun.error,
      'entry-capture',
    );
    const entry = JSON.parse(entryRun.stdout.trim());
    required(
      entry.identity.database === 'detran_r22_161_negative' &&
        entry.identity.owner === 'postgres' &&
        entry.identity.serverVersionNum === '180002' &&
        entry.identity.port === '5432' &&
        entry.identity.readOnly === 'on' &&
        entry.identity.dataDirectory === '/var/lib/postgresql/18/docker' &&
        entry.schemas.map((s) => s.name).join(',') === 'public' &&
        entry.relations.length === 0 &&
        entry.functions === 0 &&
        entry.types === 0 &&
        entry.extensions.join(',') === 'plpgsql' &&
        entry.roles
          .filter((r) => !r.name.startsWith('pg_'))
          .map((r) => r.name)
          .join(',') === 'postgres' &&
        entry.otherClientSessions === 0,
      'pristine-entry',
    );
    fs.mkdirSync(contextDir, { recursive: true, mode: 0o700 });
    const context = {
      formatVersion: 1,
      kind: 'stynx-custody-rollback-live-context',
      owner,
      authority: {
        kind: 'native-ci-job-owned',
        runId: process.env.GITHUB_RUN_ID,
        attempt: process.env.GITHUB_RUN_ATTEMPT,
        job: process.env.GITHUB_JOB,
      },
      repository: { root, gitHubWorkspace: process.env.GITHUB_WORKSPACE },
      sources: fixedSources.map(bind),
      toolchain: {
        node: process.execPath,
        nodeSha256: sha(fs.readFileSync(process.execPath)),
        docker: '/usr/bin/docker',
        dockerSha256: sha(fs.readFileSync('/usr/bin/docker')),
        binaries,
      },
      server: {
        containerId: id,
        name,
        imageId: record.imageId,
        label,
        port: '5433',
        dataDirectory: entry.identity.dataDirectory,
        systemIdentifier: entry.identity.systemIdentifier,
        pid: entry.identity.pidfile.split('\n')[0],
      },
      runner: { command: '/usr/bin/docker', user: '999:999' },
      subject: {
        database: entry.identity.database,
        oid: entry.identity.oid,
        owner: entry.identity.owner,
      },
      entryCapture: entry,
      outputDirectory: path.join(contextDir, 'runs'),
    };
    const bytes = Buffer.from(JSON.stringify(context, null, 2) + '\n');
    writeExclusive(contextPath, bytes);
    fs.appendFileSync(
      process.env.GITHUB_ENV,
      `DETRAN_STYNX_CUSTODY_PROBE_CONTEXT_SHA=${sha(bytes)}\n`,
    );
  }
} catch (error) {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
}
