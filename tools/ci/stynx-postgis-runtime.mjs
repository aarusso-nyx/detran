// NOT_ADMISSION: complete finite runtime source draft, no build/start is released.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const packetPath =
  'tools/stynx-storage/consumer-fixtures/postgis-runtime/runtime-inputs.json';
const packetSha =
  'a4bfb76172a01d0f2242c38fccbb27aeaf6b208d3382673066c80683078d7065';
// Exact fixed initializer is reviewed as source; no Docker init-script scanning.
const initializer = `set -eu
[ "$(id -u)" = 999 ]
[ ! -e /var/lib/postgresql/18/docker/PG_VERSION ]
mkdir -p /var/lib/postgresql/18/docker
/usr/lib/postgresql/18/bin/initdb --pgdata=/var/lib/postgresql/18/docker --username=postgres --encoding=UTF8 --locale=C.UTF-8 --auth-local=trust --auth-host=trust
exec /usr/lib/postgresql/18/bin/postgres -D /var/lib/postgresql/18/docker -c listen_addresses='*' -c port=5432 -c unix_socket_directories=/var/run/postgresql
`;
const base =
  'postgres@sha256:d32327f755bcd7d850eddf4880835c93d2294a2de1989e7123f5866ff0072f96';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const requireFact = (c, m) => {
  if (!c) throw new Error('NATIVE_STYNX_PG_REFUSED:' + m);
};
function safeFile(relative) {
  requireFact(
    typeof relative === 'string' &&
      !path.isAbsolute(relative) &&
      !relative.includes('\\') &&
      relative.split('/').every((p) => p !== '' && p !== '.' && p !== '..'),
    'path',
  );
  let p = root;
  for (const part of relative.split('/')) {
    p = path.join(p, part);
    requireFact(!fs.lstatSync(p).isSymbolicLink(), 'path-link');
  }
  requireFact(fs.lstatSync(p).isFile(), 'regular');
  return p;
}
function bound(record) {
  const b = fs.readFileSync(safeFile(record.path));
  requireFact(
    b.length === record.bytes && 'sha256:' + hash(b) === record.sha256,
    'input-byte-identity',
  );
  return b;
}
function identity() {
  requireFact(
    process.platform === 'linux' &&
      process.arch === 'x64' &&
      os.machine() === 'x86_64',
    'native-host',
  );
  requireFact(
    process.env.GITHUB_ACTIONS === 'true' &&
      process.env.GITHUB_JOB === 'backend-kernel-full' &&
      /^\d+$/u.test(process.env.GITHUB_RUN_ID ?? '') &&
      /^\d+$/u.test(process.env.GITHUB_RUN_ATTEMPT ?? ''),
    'job-owner',
  );
  requireFact(
    !Object.entries(process.env).some(
      ([k, v]) =>
        v &&
        /^(?:NODE_AUTH_TOKEN|NODE_OPTIONS|NODE_PATH|NODE_PG_FORCE_NATIVE|DYLD_.*|LD_.*|QEMU_.*)$/u.test(
          k,
        ),
    ),
    'ambient-or-secret',
  );
  const owner = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
  const temporary = fs.realpathSync(process.env.RUNNER_TEMP);
  const directory = path.join(temporary, 'detran-stynx-postgis-' + owner);
  const name = 'detran-stynx-pg18-' + owner;
  return {
    owner,
    directory,
    name,
    label: 'detran.stynx.native-ci-owner',
    tag: 'detran-stynx-postgis:' + owner,
  };
}
function packet() {
  const bytes = fs.readFileSync(safeFile(packetPath));
  requireFact(hash(bytes) === packetSha, 'packet');
  const p = JSON.parse(bytes);
  requireFact(
    p.formatVersion === 1 &&
      p.kind === 'reviewed-postgis-runtime-ci-inputs' &&
      p.baseImage === base &&
      p.platform === 'linux/amd64' &&
      p.postgresVersion === '18.2' &&
      p.archiveCount === 83 &&
      p.archiveBytes === 49306764 &&
      p.archives.length === 83,
    'packet-schema',
  );
  const destinations = new Set();
  let size = 0;
  for (const a of p.archives) {
    const u = new URL(a.url);
    requireFact(
      u.protocol === 'https:' &&
        ['apt.postgresql.org', 'deb.debian.org'].includes(u.hostname) &&
        u.port === '' &&
        u.username === '' &&
        u.password === '' &&
        u.search === '' &&
        u.hash === '' &&
        /^debs\/[A-Za-z0-9_.+%-]+[.]deb$/u.test(a.destination) &&
        !destinations.has(a.destination) &&
        Number.isSafeInteger(a.bytes) &&
        a.bytes > 0 &&
        /^sha256:[0-9a-f]{64}$/u.test(a.sha256),
      'archive-descriptor',
    );
    destinations.add(a.destination);
    size += a.bytes;
  }
  requireFact(size === p.archiveBytes, 'archive-total');
  for (const input of p.inputs) bound(input);
  return { packet: p };
}
function output(job, name, value) {
  requireFact(/^[a-z0-9-]+[.](?:json|log)$/u.test(name), 'output-name');
  const full = path.join(job.directory, name);
  const b = Buffer.isBuffer(value)
    ? value
    : Buffer.from(
        typeof value === 'string'
          ? value
          : JSON.stringify(value, null, 2) + '\n',
      );
  const fd = fs.openSync(full, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, b);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return { path: full, bytes: b.length, sha256: 'sha256:' + hash(b) };
}
function docker(job, phase, args) {
  requireFact(/^[a-z0-9-]+$/u.test(phase), 'phase-name');
  const result = spawnSync('/usr/bin/docker', args, {
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
    timeout: 20 * 60 * 1000,
    env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
    shell: false,
  });
  const stdout = output(
      job,
      phase + '-stdout.log',
      result.stdout ?? Buffer.alloc(0),
    ),
    stderr = output(
      job,
      phase + '-stderr.log',
      result.stderr ?? Buffer.alloc(0),
    );
  output(job, phase + '-completion.json', {
    argv: ['/usr/bin/docker', ...args],
    status: result.status,
    signal: result.signal,
    error: result.error?.code ?? null,
    stdout,
    stderr,
  });
  requireFact(
    !result.error && !result.signal && result.status === 0,
    'docker-' + phase,
  );
  return result.stdout.toString('utf8');
}
function inspectIfPresent(job, phase, kind, name) {
  const args = [kind, 'inspect', name];
  const result = spawnSync('/usr/bin/docker', args, {
    encoding: null,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 30000,
    env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? '' },
    shell: false,
  });
  const stdout = output(
    job,
    phase + '-stdout.log',
    result.stdout ?? Buffer.alloc(0),
  );
  const stderr = output(
    job,
    phase + '-stderr.log',
    result.stderr ?? Buffer.alloc(0),
  );
  output(job, phase + '-completion.json', {
    argv: ['/usr/bin/docker', ...args],
    status: result.status,
    signal: result.signal,
    error: result.error?.code ?? null,
    stdout,
    stderr,
  });
  requireFact(!result.error && !result.signal, 'cleanup-inspect-process');
  if (result.status === 0) return JSON.parse(result.stdout.toString('utf8'))[0];
  const message = result.stderr.toString('utf8');
  requireFact(
    result.status === 1 &&
      (kind === 'container'
        ? message.includes('No such object: ' + name) ||
          message.includes('No such container: ' + name)
        : message.includes('No such image: ' + name)),
    'cleanup-inspect-unexpected-error',
  );
  return null;
}
async function download(job, a) {
  const response = await fetch(a.url, {
    redirect: 'error',
    signal: AbortSignal.timeout(120000),
    headers: { 'User-Agent': 'detran-fixed-postgis-ci/1' },
  });
  requireFact(
    response.status === 200 && response.url === a.url,
    'download-status',
  );
  const contentLength = response.headers.get('content-length');
  requireFact(
    contentLength === null || Number(contentLength) === a.bytes,
    'download-length',
  );
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    requireFact(size <= a.bytes, 'download-overflow');
    chunks.push(chunk);
  }
  const b = Buffer.concat(chunks);
  requireFact(
    size === a.bytes && 'sha256:' + hash(b) === a.sha256,
    'archive-integrity',
  );
  const fd = fs.openSync(
    path.join(job.directory, 'context', a.destination),
    'wx',
    0o600,
  );
  try {
    fs.writeFileSync(fd, b);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return {
    name: a.name,
    url: a.url,
    bytes: size,
    sha256: a.sha256,
    destination: a.destination,
  };
}
function loadJob(job) {
  const record = JSON.parse(
    fs.readFileSync(path.join(job.directory, 'job-image.json'), 'utf8'),
  );
  requireFact(
    record.owner === job.owner &&
      record.name === job.name &&
      record.packetSha256 === packetSha &&
      /^sha256:[0-9a-f]{64}$/u.test(record.imageId),
    'job-image',
  );
  return record;
}
function imageProof(job, imageId, input, phase) {
  const image = JSON.parse(
    docker(job, phase + '-image-inspect', ['image', 'inspect', imageId]),
  )[0];
  requireFact(
    image.Id === imageId &&
      image.Architecture === 'amd64' &&
      image.Os === 'linux' &&
      image.Config.User === '999:999' &&
      image.Config.Labels[job.label] === job.owner,
    'derived-image-control',
  );
  const lines = fs
    .readFileSync(
      safeFile(
        'tools/stynx-storage/consumer-fixtures/postgis-runtime/core-binaries.sha256',
      ),
      'utf8',
    )
    .trim()
    .split('\n');
  const paths = lines.map(
    (line) =>
      line.match(
        /^[a-f0-9]{64}  (\/usr\/lib\/postgresql\/18\/bin\/(?:postgres|psql|pg_ctl|initdb))$/u,
      )?.[1],
  );
  requireFact(
    paths.length === 4 && new Set(paths).size === 4 && paths.every(Boolean),
    'four-binaries',
  );
  const run = [
    'run',
    '--rm',
    '--platform',
    'linux/amd64',
    '--network',
    'none',
    '--read-only',
    '--user',
    '999:999',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
  ];
  requireFact(
    docker(job, phase + '-four-pg-binaries', [
      ...run,
      '--entrypoint',
      '/usr/bin/sha256sum',
      imageId,
      ...paths,
    ]).trim() === lines.join('\n'),
    'four-pg-byte-identity',
  );
  const payload = JSON.parse(
    fs.readFileSync(
      safeFile(
        'tools/stynx-storage/consumer-fixtures/postgis-runtime/postgis-extension-payload.json',
      ),
      'utf8',
    ),
  );
  requireFact(payload.length === 33, 'critical-payload-population');
  const expected = payload.map((p) => p.sha256 + '  /' + p.path).join('\n');
  requireFact(
    docker(job, phase + '-critical-extension-bytes', [
      ...run,
      '--entrypoint',
      '/usr/bin/sha256sum',
      imageId,
      ...payload.map((p) => '/' + p.path),
    ]).trim() === expected,
    'critical-extension-identity',
  );
  const historical = JSON.parse(
    fs.readFileSync(
      safeFile(
        'tools/stynx-storage/consumer-fixtures/postgis-runtime/historical-derived-runtime-custody.json',
      ),
      'utf8',
    ),
  );
  const rawPolicy = docker(job, phase + '-inherited-dpkg-policy', [
    ...run,
    '--entrypoint',
    '/bin/cat',
    base,
    '/etc/dpkg/dpkg.cfg.d/docker',
  ]);
  const actualRules = rawPolicy
    .split('\n')
    .filter((line) => /^(?:path-exclude|path-include)=/u.test(line))
    .map((line) => {
      const split = line.indexOf('=');
      return [line.slice(5, split), line.slice(split + 1)];
    });
  requireFact(
    JSON.stringify(actualRules) ===
      JSON.stringify(historical.actualInheritedRules) &&
      historical.omittedFiles.length === 254,
    'inherited-base-policy-drift',
  );
  const inventory = JSON.parse(
    fs.readFileSync(
      safeFile(
        'tools/stynx-storage/consumer-fixtures/postgis-runtime/deb-payload-inventory.json',
      ),
      'utf8',
    ),
  );
  const allRegular = inventory.packages.flatMap((pkg) =>
    pkg.data
      .filter((entry) => entry.type === 'file')
      .map((entry) => ({
        path: '/' + entry.path.replace(/^\//u, ''),
        sha256: entry.sha256,
      })),
  );
  const omitted = new Set(historical.omittedFiles);
  const installed = allRegular
    .filter((entry) => !omitted.has(entry.path))
    .sort((left, right) => left.path.localeCompare(right.path));
  requireFact(
    allRegular.length === 861 &&
      installed.length === 607 &&
      new Set(allRegular.map((entry) => entry.path)).size === 861 &&
      omitted.size === 254 &&
      [...omitted].every((name) =>
        allRegular.some((entry) => entry.path === name),
      ),
    'reviewed-payload-population',
  );
  const actualInstalled = docker(job, phase + '-installed-payload-bytes', [
    ...run,
    '--entrypoint',
    '/usr/bin/sha256sum',
    imageId,
    ...installed.map((entry) => entry.path),
  ])
    .trim()
    .split('\n');
  requireFact(
    actualInstalled.length === installed.length &&
      actualInstalled.every(
        (line, index) =>
          line === installed[index].sha256 + '  ' + installed[index].path,
      ),
    'actual-installed-payload-bytes',
  );
  const loaders = docker(job, phase + '-postgis-transitive-loader', [
    ...run,
    '--entrypoint',
    '/usr/bin/ldd',
    imageId,
    '/usr/lib/postgresql/18/lib/postgis-3.so',
  ]);
  requireFact(!/not found/u.test(loaders), 'postgis-loader-missing');
  const libraryPaths = [
    ...loaders.matchAll(
      /=>\s+(\/[^\s]+)\s+\(0x[0-9a-f]+\)|^\s*(\/[^\s]+)\s+\(0x[0-9a-f]+\)/gmu,
    ),
  ]
    .map((match) => match[1] ?? match[2])
    .filter((name) => name !== '/lib64/ld-linux-x86-64.so.2')
    .sort();
  requireFact(
    libraryPaths.length > 0 &&
      new Set(libraryPaths).size === libraryPaths.length &&
      libraryPaths.every((name) => /^\/(?:lib|usr\/lib)\//u.test(name)),
    'transitive-library-paths',
  );
  const libraryLines = docker(job, phase + '-transitive-library-bytes', [
    ...run,
    '--entrypoint',
    '/usr/bin/sha256sum',
    imageId,
    ...libraryPaths,
  ])
    .trim()
    .split('\n');
  const libraries = libraryLines.map((line, index) => {
    const match = line.match(/^([a-f0-9]{64})  (\/[^\n]+)$/u);
    requireFact(match?.[2] === libraryPaths[index], 'transitive-library-hash');
    return { path: match[2], sha256: 'sha256:' + match[1] };
  });
  requireFact(
    libraries.length === libraryPaths.length,
    'transitive-library-count',
  );
  const historicalLibraries = historical.actualTransitiveLibraries
    .map((entry) => ({ path: entry.path, sha256: 'sha256:' + entry.sha256 }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  requireFact(
    libraries.length === 49 &&
      isDeepStrictEqual(libraries, historicalLibraries),
    'transitive-library-provenance',
  );
  output(job, phase + '-derived-image-proof.json', {
    imageId,
    owner: job.owner,
    architecture: image.Architecture,
    os: image.Os,
    user: image.Config.User,
    fourBinaries: lines,
    criticalFiles: 33,
    rawArchiveRegularFiles: 861,
    actualInstalledArchiveRegularFiles: 607,
    inheritedExcludedFiles: 254,
    inheritedDpkgRules: actualRules,
    initializerSourceSha256: 'sha256:' + hash(Buffer.from(initializer)),
    transitiveLoader: loaders,
    transitiveLibraries: libraries,
    nativeExtensionAbiTested: false,
  });
}
async function prepare(job, input) {
  requireFact(!fs.existsSync(job.directory), 'fresh-job-context');
  fs.mkdirSync(job.directory, { mode: 0o700 });
  fs.mkdirSync(path.join(job.directory, 'context'), { mode: 0o700 });
  fs.mkdirSync(path.join(job.directory, 'context/debs'), { mode: 0o700 });
  output(job, 'owner-intent.json', {
    owner: job.owner,
    name: job.name,
    label: job.label,
    tag: job.tag,
    packetSha256: packetSha,
    intendedBuild: true,
  });
  for (const n of ['Dockerfile', 'debs.sha256', 'core-binaries.sha256'])
    fs.copyFileSync(
      safeFile('tools/stynx-storage/consumer-fixtures/postgis-runtime/' + n),
      path.join(job.directory, 'context', n),
      fs.constants.COPYFILE_EXCL,
    );
  const archives = [];
  for (const a of input.packet.archives) archives.push(await download(job, a));
  output(job, 'actual-archive-inputs.json', {
    packetSha256: packetSha,
    archives,
  });
  docker(job, 'base-pull', ['pull', '--platform', 'linux/amd64', base]);
  const iid = path.join(job.directory, 'derived-image-id');
  docker(job, 'offline-build', [
    'build',
    '--platform',
    'linux/amd64',
    '--network',
    'none',
    '--pull=false',
    '--label',
    job.label + '=' + job.owner,
    '--iidfile',
    iid,
    '--file',
    path.join(job.directory, 'context/Dockerfile'),
    '--tag',
    job.tag,
    path.join(job.directory, 'context'),
  ]);
  const imageId = fs.readFileSync(iid, 'utf8').trim();
  requireFact(/^sha256:[0-9a-f]{64}$/u.test(imageId), 'image-id');
  output(job, 'job-image.json', {
    owner: job.owner,
    name: job.name,
    imageId,
    packetSha256: packetSha,
  });
  imageProof(job, imageId, input, 'prepare');
}
function ownedContainer(job, id, phase) {
  const actual = JSON.parse(
    docker(job, phase + '-container-inspect', ['container', 'inspect', id]),
  )[0];
  requireFact(
    actual.Id === id &&
      actual.Name === '/' + job.name &&
      actual.Config.Labels[job.label] === job.owner &&
      actual.Config.User === '999:999',
    'container-owner',
  );
  return actual;
}
const identitySql =
  "SELECT json_build_object('serverVersionNum',current_setting('server_version_num'),'clusterSystemIdentifier',(SELECT system_identifier::text FROM pg_control_system()),'databaseName',current_database(),'databaseOid',(SELECT oid::text FROM pg_database WHERE datname=current_database()),'databaseOwner',(SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database()),'sessionUser',session_user,'currentUser',current_user,'dataDirectory',current_setting('data_directory'),'serverPort',current_setting('port'),'listenAddresses',current_setting('listen_addresses'),'postmasterPidfile',pg_read_file('postmaster.pid'),'otherClients',(SELECT count(*) FROM pg_stat_activity WHERE pid<>pg_backend_pid() AND backend_type='client backend')));";
function serverIdentity(job, id, database, phase) {
  const facts = JSON.parse(
    docker(job, phase, [
      'exec',
      id,
      '/usr/lib/postgresql/18/bin/psql',
      '-X',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
      '-d',
      database,
      '-At',
      '-c',
      identitySql,
    ]),
  );
  const lines = facts.postmasterPidfile?.split('\n');
  requireFact(
    facts.serverVersionNum === '180002' &&
      /^\d{10,20}$/u.test(facts.clusterSystemIdentifier) &&
      facts.databaseName === database &&
      /^\d+$/u.test(facts.databaseOid) &&
      facts.databaseOwner === 'postgres' &&
      facts.sessionUser === 'postgres' &&
      facts.currentUser === 'postgres' &&
      facts.dataDirectory === '/var/lib/postgresql/18/docker' &&
      facts.serverPort === '5432' &&
      facts.listenAddresses === '*' &&
      facts.otherClients === 0 &&
      lines?.[0] === '1' &&
      lines?.[1] === '/var/lib/postgresql/18/docker' &&
      lines?.[3] === '5432',
    'actual-owned-server-identity',
  );
  return facts;
}
function start(job, input) {
  const record = loadJob(job);
  imageProof(job, record.imageId, input, 'start');
  const id = docker(job, 'owned-server-start', [
    'run',
    '--detach',
    '--platform',
    'linux/amd64',
    '--name',
    job.name,
    '--label',
    job.label + '=' + job.owner,
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
    '127.0.0.1:5432:5432',
    '--entrypoint',
    '/bin/sh',
    record.imageId,
    '-ec',
    initializer,
  ]).trim();
  requireFact(/^[0-9a-f]{64}$/u.test(id), 'container-id');
  output(job, 'job-container.json', {
    owner: job.owner,
    name: job.name,
    id,
    imageId: record.imageId,
  });
  const actual = ownedContainer(job, id, 'start');
  const tmpfs = {
    '/var/lib/postgresql': 'rw,uid=999,gid=999,mode=0700',
    '/var/run/postgresql': 'rw,uid=999,gid=999,mode=0700',
    '/tmp': 'rw,uid=999,gid=999,mode=0700',
  };
  const expectedPorts = {
    '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '5432' }],
  };
  requireFact(
    actual.Image === record.imageId &&
      actual.Config.Image === record.imageId &&
      JSON.stringify(actual.Config.Entrypoint) ===
        JSON.stringify(['/bin/sh']) &&
      JSON.stringify(actual.Config.Cmd) ===
        JSON.stringify(['-ec', initializer]) &&
      actual.HostConfig.ReadonlyRootfs &&
      JSON.stringify(actual.HostConfig.CapDrop) === JSON.stringify(['ALL']) &&
      (actual.HostConfig.CapAdd === null ||
        isDeepStrictEqual(actual.HostConfig.CapAdd, [])) &&
      actual.HostConfig.Privileged === false &&
      actual.HostConfig.SecurityOpt?.length === 1 &&
      ['no-new-privileges', 'no-new-privileges:true'].includes(
        actual.HostConfig.SecurityOpt[0],
      ) &&
      actual.HostConfig.Memory === 2 * 1024 * 1024 * 1024 &&
      actual.HostConfig.NanoCpus === 2 * 1000000000 &&
      actual.HostConfig.ShmSize === 256 * 1024 * 1024 &&
      isDeepStrictEqual(actual.HostConfig.Tmpfs, tmpfs) &&
      [null, 0].includes(actual.HostConfig.Binds?.length ?? null) &&
      [null, 0].includes(actual.HostConfig.Mounts?.length ?? null) &&
      actual.Mounts.every(
        (mount) =>
          mount.Type === 'tmpfs' && Object.hasOwn(tmpfs, mount.Destination),
      ) &&
      new Set(actual.Mounts.map((mount) => mount.Destination)).size ===
        actual.Mounts.length &&
      JSON.stringify(actual.HostConfig.PortBindings) ===
        JSON.stringify(expectedPorts) &&
      JSON.stringify(actual.NetworkSettings.Ports) ===
        JSON.stringify(expectedPorts) &&
      Object.keys(actual.Config.ExposedPorts ?? {}).every(
        (port) => port === '5432/tcp',
      ),
    'container-controls',
  );
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = spawnSync(
      '/usr/bin/docker',
      [
        'exec',
        id,
        '/usr/lib/postgresql/18/bin/pg_isready',
        '-U',
        'postgres',
        '-d',
        'postgres',
      ],
      {
        encoding: 'utf8',
        timeout: 10000,
        env: { PATH: '/usr/bin:/bin' },
        shell: false,
      },
    );
    if (!result.error && !result.signal && result.status === 0) {
      ready = true;
      break;
    }
    awaitablePause(1000);
  }
  requireFact(ready, 'readiness');
  const beforeCreate = serverIdentity(
    job,
    id,
    'postgres',
    'initialized-server-identity-before-create',
  );
  const subjectBeforeCreate = docker(job, 'subject-absence-before-create', [
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
    "SELECT 1 FROM pg_database WHERE datname='detran_r7_ctg1_a2';",
  ]).trim();
  output(job, 'server-identity-before-create.json', {
    owner: job.owner,
    containerId: id,
    facts: beforeCreate,
    targetDoesNotExist: subjectBeforeCreate === '',
  });
  requireFact(subjectBeforeCreate === '', 'subject-already-exists');
  const creation = docker(job, 'owned-application-subject-create', [
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
    'CREATE DATABASE detran_r7_ctg1_a2 OWNER postgres;',
  ]);
  requireFact(creation.trim() === 'CREATE DATABASE', 'fixed-subject-creation');
  const facts = serverIdentity(
    job,
    id,
    'detran_r7_ctg1_a2',
    'initialized-server-identity-after-create',
  );
  requireFact(
    facts.clusterSystemIdentifier === beforeCreate.clusterSystemIdentifier &&
      facts.postmasterPidfile === beforeCreate.postmasterPidfile &&
      facts.databaseOid !== beforeCreate.databaseOid,
    'subject-server-inverse',
  );
  output(job, 'actual-server-identity.json', {
    native: true,
    containerId: id,
    owner: job.owner,
    facts,
  });
  const smoke =
    "BEGIN; CREATE EXTENSION postgis SCHEMA public; SELECT postgis_lib_version(),ST_Area(ST_GeomFromText('POLYGON((0 0,0 1,1 1,1 0,0 0))')); ROLLBACK; SELECT count(*) FROM pg_extension WHERE extname='postgis';";
  const result = docker(job, 'postgis-native-abi-rollback', [
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
    smoke,
  ]);
  requireFact(
    result.includes('3.6.4|1') && result.trim().endsWith('0'),
    'actual-postgis-abi-rollback',
  );
  output(job, 'native-postgis-abi.json', {
    containerId: id,
    serverVersion: '180002',
    postgisVersion: '3.6.4',
    observed: result,
    applicationSubjectTouched: false,
  });
}
function awaitablePause(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function cleanup(job) {
  if (!fs.existsSync(job.directory)) return;
  const intentPath = path.join(job.directory, 'owner-intent.json');
  requireFact(fs.existsSync(intentPath), 'cleanup-owner-intent-absent');
  const intent = JSON.parse(fs.readFileSync(intentPath, 'utf8'));
  requireFact(
    intent.owner === job.owner &&
      intent.name === job.name &&
      intent.label === job.label &&
      intent.tag === job.tag &&
      intent.packetSha256 === packetSha,
    'cleanup-intent-drift',
  );
  const errors = [];
  let containerRemoved = false,
    imageRemoved = false;
  const attempt = (phase, action) => {
    try {
      return action();
    } catch (error) {
      errors.push({ phase, message: error.message });
      return null;
    }
  };
  // Exact deterministic names are also checked when a crash preceded the
  // post-spawn record. Never enumerate or prune foreign resources.
  const container = attempt('container-inspect', () =>
    inspectIfPresent(job, 'cleanup-container-inspect', 'container', job.name),
  );
  const owned =
    container &&
    attempt('container-owner', () => {
      const prepared = loadJob(job);
      requireFact(
        container.Name === '/' + job.name &&
          container.Config.Labels?.[job.label] === job.owner &&
          container.Config.User === '999:999' &&
          container.Image === prepared.imageId &&
          container.Config.Image === prepared.imageId &&
          /^[a-f0-9]{64}$/u.test(container.Id),
        'cleanup-container-owner',
      );
      const recordPath = path.join(job.directory, 'job-container.json');
      if (fs.existsSync(recordPath)) {
        const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
        requireFact(
          record.id === container.Id &&
            record.owner === job.owner &&
            record.name === job.name &&
            record.imageId === prepared.imageId,
          'cleanup-container-record-drift',
        );
      }
      return container;
    });
  if (owned) {
    attempt('container-logs', () =>
      docker(job, 'owned-server-logs', ['logs', container.Id]),
    );
    containerRemoved =
      attempt('container-remove', () => {
        docker(job, 'owned-server-remove', ['rm', '--force', container.Id]);
        return true;
      }) === true;
  }
  const image = attempt('image-inspect', () =>
    inspectIfPresent(job, 'cleanup-image-inspect', 'image', job.tag),
  );
  const ownedImage =
    image &&
    attempt('image-owner', () => {
      requireFact(
        /^sha256:[a-f0-9]{64}$/u.test(image.Id) &&
          image.Config.Labels?.[job.label] === job.owner &&
          Array.isArray(image.RepoTags) &&
          image.RepoTags.includes(job.tag),
        'cleanup-image-owner',
      );
      const recordPath = path.join(job.directory, 'job-image.json');
      if (fs.existsSync(recordPath)) {
        const record = loadJob(job);
        requireFact(record.imageId === image.Id, 'cleanup-image-record-drift');
      }
      return image;
    });
  if (ownedImage) {
    imageRemoved =
      attempt('image-remove', () => {
        docker(job, 'owned-image-remove', ['image', 'rm', image.Id]);
        return true;
      }) === true;
  }
  output(job, 'cleanup-observation.json', {
    owner: job.owner,
    containerFound: Boolean(container),
    containerRemoved,
    imageFound: Boolean(image),
    imageRemoved,
    errors,
    foreignObjectsRemoved: false,
    retainedEvidence: true,
  });
  requireFact(errors.length === 0, 'cleanup-errors');
}
try {
  requireFact(
    process.argv.length === 4 &&
      path.resolve(process.argv[2]) === root &&
      ['prepare', 'start', 'cleanup'].includes(process.argv[3]),
    'fixed-private-cli',
  );
  const job = identity();
  if (process.argv[3] === 'cleanup') cleanup(job);
  else {
    const inputs = packet();
    if (process.argv[3] === 'prepare') await prepare(job, inputs);
    else start(job, inputs);
  }
} catch (error) {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
}
