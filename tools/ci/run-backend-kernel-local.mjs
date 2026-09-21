import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import process from 'node:process';

const image =
  'postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5';
const container = `detran-local-rc-${process.pid}-${Date.now()}`;
const expectedEnvironment = {
  DEVAI_DB_TESTS: '1',
  DETRAN_RC_CONTAINER_RUNTIME: 'docker',
  DETRAN_RC_POSTGIS_IMAGE: image,
  DETRAN_RC_POSTGRES_MAJOR: '16',
  DETRAN_RC_POSTGIS_VERSION: '3.4',
};

function exec(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function assertExactCandidate() {
  const status = exec('git', [
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
  ]);
  if (status !== '')
    throw new Error('BLOCKED: local RC requires a clean worktree');
  const head = exec('git', ['rev-parse', 'HEAD']);
  let upstream;
  try {
    upstream = exec('git', ['rev-parse', '@{upstream}']);
  } catch {
    throw new Error('BLOCKED: local RC requires a published upstream branch');
  }
  if (head !== upstream)
    throw new Error('BLOCKED: local RC HEAD must equal the published upstream');
  const branch = exec('git', ['branch', '--show-current']);
  if (branch === '')
    throw new Error('BLOCKED: local RC requires a named published branch');
  const published = exec('git', [
    'ls-remote',
    '--heads',
    'origin',
    `refs/heads/${branch}`,
  ]).split(/\s/u)[0];
  if (published !== head)
    throw new Error(
      'BLOCKED: local RC HEAD is not the current remote branch head',
    );
}

function freePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) =>
        error ? reject(error) : resolvePromise(String(port)),
      );
    });
  });
}

assertExactCandidate();
for (const [key, value] of Object.entries(expectedEnvironment)) {
  if (process.env[key] !== value)
    throw new Error(`BLOCKED: protected environment mismatch for ${key}`);
}
exec('docker', ['info']);
const mockPort = await freePort();
const transcript = join(
  process.env.TMPDIR ?? '/tmp',
  `detran-local-rc-${process.pid}.log`,
);
let started = false;
try {
  exec('docker', [
    'run',
    '--detach',
    '--rm',
    '--name',
    container,
    '--platform',
    'linux/amd64',
    '--env',
    'POSTGRES_DB=detran',
    '--env',
    'POSTGRES_USER=postgres',
    '--env',
    'POSTGRES_PASSWORD=postgres',
    '--publish',
    '127.0.0.1::5432',
    image,
  ]);
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const probe = spawnSync(
      'docker',
      ['exec', container, 'pg_isready', '-U', 'postgres', '-d', 'detran'],
      { stdio: 'ignore' },
    );
    if (probe.status === 0) {
      ready = true;
      break;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
  }
  if (!ready)
    throw new Error('BLOCKED: disposable PostGIS did not become ready');
  const mapping = exec('docker', ['port', container, '5432/tcp']);
  const port = /:(\d+)$/u.exec(mapping)?.[1];
  if (!port)
    throw new Error(`BLOCKED: cannot determine PostGIS port: ${mapping}`);

  const base = `postgresql://postgres:postgres@127.0.0.1:${port}`;
  const env = {
    ...process.env,
    DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
    DETRAN_TEST_DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
    STYNX_OWNER_DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
    STYNX_APP_DATABASE_URL: `${base}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend`,
    STYNX_READER_DATABASE_URL: `${base}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend`,
    DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL: `${base}/postgres`,
    DETRAN_SEED_ADMIN_DATABASE_URL: `${base}/postgres`,
    DETRAN_SEED_SCRATCH_DATABASE_URL: `${base}/detran_r7_ctg1_a2_seed_profiles`,
    DETRAN_RUNTIME_PROFILE: 'test',
    DETRAN_PRIORITY_UPGRADE_TEST_AUTHORIZED: '1',
    DETRAN_PRIORITY_UPGRADE_BASELINE_AUTHORIZED: '1',
    DETRAN_PRIORITY_UPGRADE_BASELINE_RESET_AUTHORIZED: '1',
    DETRAN_PRIORITY_UPGRADE_RESTORE_AUTHORIZED: '1',
    DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED: '1',
    DB_HOST: '127.0.0.1',
    DB_PORT: port,
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres',
    DB_NAME: 'detran_r7_ctg1_a2',
    SENATRAN_MOCK_PORT: mockPort,
  };
  const result = spawnSync(
    'bash',
    [
      '-o',
      'pipefail',
      '-c',
      'bash tools/ci/run-backend-kernel.sh 2>&1 | tee "$1"',
      'detran-local-rc',
      transcript,
    ],
    { env, stdio: 'inherit' },
  );
  if (result.status !== 0)
    throw new Error(
      `BLOCKED: backend-kernel exited ${result.status ?? result.signal}`,
    );
  const plainTranscript = readFileSync(transcript, 'utf8').replace(
    /\u001b\[[0-9;]*m/gu,
    '',
  );
  if (!/Tests\s+[1-9][0-9]*\s+passed/u.test(plainTranscript))
    throw new Error('BLOCKED: backend-kernel reported no passing tests');
} finally {
  if (started) {
    spawnSync('docker', ['rm', '--force', container], { stdio: 'ignore' });
    const remaining = spawnSync('docker', ['inspect', container], {
      stdio: 'ignore',
    });
    if (remaining.status === 0)
      throw new Error('BLOCKED: disposable PostGIS cleanup was incomplete');
  }
}
