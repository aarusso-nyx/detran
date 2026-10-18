// Existing suites, isolated fixture services, and real exit codes only.
import { spawnSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readdirSync } from 'node:fs';

const image =
  'postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5';
const container = `detran-scorecard-${process.pid}-${Date.now()}`;
const mode = process.argv[2];
if (!['migration', 'unit', 'integration', 'e2e'].includes(mode))
  throw new Error('Unknown scorecard task');
let failed = false;
function run(argv, env = process.env) {
  const result = spawnSync(argv[0], argv.slice(1), {
    env,
    stdio: 'inherit',
    timeout: 900_000,
  });
  if (result.status !== 0) failed = true;
  return result.status === 0;
}
function output(argv) {
  const result = spawnSync(argv[0], argv.slice(1), {
    encoding: 'utf8',
    timeout: 60_000,
  });
  if (result.status !== 0)
    throw new Error(
      `Fixture command failed: ${argv[0]} ${argv[1]}: ${result.stderr}`,
    );
  return (
    argv[1] === 'logs' ? result.stdout + result.stderr : result.stdout
  ).trim();
}
if (mode === 'unit') {
  for (const argv of [
    ['pnpm', 'backend:test:unit'],
    [
      'pnpm',
      '--filter',
      '@detran/ch-juntas',
      '--filter',
      '@detran/ops-core',
      '--filter',
      '@detran/senatran-adapter',
      '--filter',
      'senatran-mock',
      '--no-bail',
      'run',
      'test:unit',
    ],
    [
      'pnpm',
      '--filter',
      './apps/**',
      '--filter',
      '@detran/ui',
      '--workspace-concurrency=1',
      '--no-bail',
      'run',
      'test',
    ],
  ])
    run(argv);
  process.exitCode = failed ? 1 : 0;
} else {
  let started = false,
    mock;
  try {
    output(['docker', 'image', 'inspect', image]);
    output([
      'docker',
      'run',
      '--detach',
      '--rm',
      '--name',
      container,
      '--platform',
      'linux/amd64',
      '--env',
      'POSTGRES_DB=detran_r7_ctg1_a2',
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
    for (let i = 0; i < 90; i++) {
      const logs = output(['docker', 'logs', container]);
      if (
        logs.includes('PostgreSQL init process complete; ready for start up.')
      ) {
        const probe = spawnSync('docker', [
          'exec',
          container,
          'pg_isready',
          '-U',
          'postgres',
        ]);
        if (probe.status === 0) {
          ready = true;
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!ready) throw new Error('Disposable database did not become ready');
    const port = /:(\d+)$/.exec(
      output(['docker', 'port', container, '5432/tcp']),
    )?.[1];
    if (!port) throw new Error('No isolated database port');
    const base = `postgresql://postgres:postgres@127.0.0.1:${port}`;
    const env = {
      ...process.env,
      DB_HOST: '127.0.0.1',
      DB_PORT: port,
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'detran_r7_ctg1_a2',
      DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
      DETRAN_TEST_DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
      STYNX_OWNER_DATABASE_URL: `${base}/detran_r7_ctg1_a2`,
      STYNX_APP_DATABASE_URL: `${base}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend`,
      STYNX_READER_DATABASE_URL: `${base}/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend`,
      DETRAN_PRIORITY_BASELINE_ADMIN_DATABASE_URL: `${base}/postgres`,
      DETRAN_SEED_ADMIN_DATABASE_URL: `${base}/postgres`,
      DETRAN_SEED_SCRATCH_DATABASE_URL: `${base}/detran_r7_ctg1_a2_seed_profiles`,
      DETRAN_RUNTIME_PROFILE: 'test',
      DEVAI_DB_TESTS: '1',
      DETRAN_PRIORITY_UPGRADE_TEST_AUTHORIZED: '1',
      DETRAN_PRIORITY_UPGRADE_BASELINE_AUTHORIZED: '1',
      DETRAN_PRIORITY_UPGRADE_BASELINE_RESET_AUTHORIZED: '1',
      DETRAN_PRIORITY_UPGRADE_RESTORE_AUTHORIZED: '1',
      DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED: '1',
    };
    if (!run(['bash', 'backend/database/apply.sh', '--full'], env))
      throw new Error('DDL failed');
    if (mode === 'migration') {
      run(['bash', 'backend/database/apply.sh'], env);
      run(['pnpm', 'backend:rls-smoke'], env);
      console.log(
        JSON.stringify({
          ddl_files: readdirSync('backend/database/ddl').filter((name) =>
            name.endsWith('.sql'),
          ).length,
          idempotent_reapplication: !failed,
        }),
      );
    } else {
      if (!run(['bash', 'backend/database/seed.sh'], env))
        throw new Error('Seed failed');
      if (!run(['pnpm', 'backend:test:prepare-legacy'], env))
        throw new Error('Legacy fixture failed');
      const mockEnv = {
        ...env,
        DB_NAME: 'senatran',
        DATABASE_URL: `${base}/senatran`,
      };
      if (!run(['pnpm', '--dir', 'senatran-mock', 'db:reset'], mockEnv))
        throw new Error('Mock DDL failed');
      if (mode === 'integration') {
        run(['pnpm', 'backend:test:integration'], env);
        run(
          ['pnpm', '--filter', '@detran/senatran-adapter', 'test:integration'],
          env,
        );
        run(['pnpm', '--filter', 'senatran-mock', 'test:integration'], mockEnv);
      } else {
        const mockPort = await new Promise((resolve, reject) => {
          const server = createServer();
          server.on('error', reject);
          server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
          });
        });
        mock = spawn(
          process.execPath,
          ['senatran-mock/dist/apps/api/src/main.js'],
          { env: { ...mockEnv, PORT: String(mockPort) }, stdio: 'ignore' },
        );
        const url = `http://127.0.0.1:${mockPort}`;
        let healthy = false;
        for (let i = 0; i < 60; i++) {
          try {
            if ((await fetch(url + '/health')).ok) {
              healthy = true;
              break;
            }
          } catch {}
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!healthy) throw new Error('Mock did not become healthy');
        const backendEnv = {
          ...env,
          SENATRAN_PROVIDER: 'mock',
          SENATRAN_MOCK_BASE_URL: url,
        };
        run(['pnpm', 'backend:test:e2e'], backendEnv);
        run(['pnpm', 'backend:test:upgrade'], backendEnv);
        run(['pnpm', '--filter', '@detran/senatran-adapter', 'test:e2e'], {
          ...env,
          SENATRAN_MOCK_BASE_URL: url,
        });
        run(['pnpm', '--filter', 'senatran-mock', 'test:e2e'], mockEnv);
      }
    }
  } finally {
    if (mock && mock.exitCode === null && mock.signalCode === null) {
      mock.kill('SIGTERM');
      await new Promise((resolve) => mock.once('close', resolve));
    }
    if (started) output(['docker', 'rm', '--force', container]);
  }
  process.exitCode = failed ? 1 : 0;
}
