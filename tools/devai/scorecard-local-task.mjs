// Existing suites, isolated fixture services, and real exit codes only.
import { spawnSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readdirSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const image =
  'postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5';
const container = `detran-scorecard-${process.pid}-${Date.now()}`;
const mode = process.argv[2];
if (!['migration', 'unit', 'integration', 'e2e', 'perf'].includes(mode))
  throw new Error('Unknown scorecard task');
const logDir = join(
  '.devai/local/rounds/R-0036/tasks',
  `${mode}-${Date.now()}-${process.pid}`,
);
mkdirSync(logDir, { recursive: true });
console.log(`SCORECARD_TASK_LOGS=${resolve(logDir)}`);
for (const stream of [process.stdout, process.stderr])
  stream.on('error', (error) => {
    if (error.code !== 'EPIPE') throw error;
  });
let step = 0;
let failed = false;
let interrupted, activeChild, killTimer;
const killGroup = (child, signal) => {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    /* already exited */
  }
};
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    interrupted = signal;
    killGroup(activeChild, signal);
    if (activeChild)
      killTimer = setTimeout(() => killGroup(activeChild, 'SIGKILL'), 3000);
  });
async function run(argv, env = process.env) {
  if (interrupted)
    throw new Error(`Fixture task interrupted by ${interrupted}`);
  const label = String(++step).padStart(2, '0');
  const stdoutPath = join(logDir, `${label}.stdout.log`);
  const stderrPath = join(logDir, `${label}.stderr.log`);
  for (const path of [stdoutPath, stderrPath])
    writeFileSync(path, '', { flag: 'wx', mode: 0o600 });
  const child = spawn(argv[0], argv.slice(1), {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  child.stdout.on('data', (chunk) => {
    appendFileSync(stdoutPath, chunk);
    process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    appendFileSync(stderrPath, chunk);
    process.stderr.write(chunk);
  });
  activeChild = child;
  const status = await new Promise((resolve) => {
    child.once('error', () => resolve(null));
    child.once('close', (code) => resolve(code));
  });
  writeFileSync(
    join(logDir, `${label}.json`),
    JSON.stringify(
      {
        argv,
        status,
        interrupted: interrupted ?? null,
        stdoutPath,
        stderrPath,
      },
      null,
      2,
    ) + '\n',
    { flag: 'wx', mode: 0o600 },
  );
  clearTimeout(killTimer);
  if (interrupted) killGroup(child, 'SIGKILL');
  activeChild = undefined;
  if (interrupted)
    throw new Error(`Fixture task interrupted by ${interrupted}`);
  if (status !== 0) failed = true;
  return status === 0;
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
  await run([
    'pnpm',
    'vitest',
    'run',
    '--config',
    'tests/config/local.coverage.config.ts',
    '--coverage.enabled=false',
  ]);
  process.exitCode = failed ? 1 : 0;
} else {
  let started = false,
    mock;
  const stopMock = async () => {
    if (mock && mock.exitCode === null && mock.signalCode === null) {
      mock.kill('SIGTERM');
      await new Promise((resolve) => mock.once('close', resolve));
    }
    mock = undefined;
  };
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
      if (interrupted)
        throw new Error(`Fixture task interrupted by ${interrupted}`);
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
    if (!(await run(['bash', 'backend/database/apply.sh', '--full'], env)))
      throw new Error('DDL failed');
    if (mode === 'migration') {
      await run(['bash', 'backend/database/apply.sh'], env);
      await run(['pnpm', 'backend:rls-smoke'], env);
      console.log(
        JSON.stringify({
          ddl_files: readdirSync('backend/database/ddl').filter((name) =>
            name.endsWith('.sql'),
          ).length,
          idempotent_reapplication: !failed,
        }),
      );
    } else {
      if (!(await run(['bash', 'backend/database/seed.sh'], env)))
        throw new Error('Seed failed');
      if (!(await run(['pnpm', 'backend:test:prepare-legacy'], env)))
        throw new Error('Legacy fixture failed');
      const mockEnv = {
        ...env,
        DB_NAME: 'senatran',
        DATABASE_URL: `${base}/senatran`,
      };
      if (!(await run(['pnpm', '--dir', 'senatran-mock', 'db:reset'], mockEnv)))
        throw new Error('Mock DDL failed');
      if (mode === 'integration') {
        await run(['pnpm', 'backend:test:integration'], env);
        await run(
          ['pnpm', '--filter', '@detran/senatran-adapter', 'test:integration'],
          env,
        );
        await run(
          ['pnpm', '--filter', 'senatran-mock', 'test:integration'],
          mockEnv,
        );
      } else {
        const mockPort = await new Promise((resolve, reject) => {
          const server = createServer();
          server.on('error', reject);
          server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
          });
        });
        const url = `http://127.0.0.1:${mockPort}`;
        const startMock = async () => {
          if (interrupted)
            throw new Error(`Fixture task interrupted by ${interrupted}`);
          mock = spawn(
            process.execPath,
            ['senatran-mock/dist/apps/api/src/main.js'],
            { env: { ...mockEnv, PORT: String(mockPort) }, stdio: 'ignore' },
          );
          let healthy = false;
          for (let i = 0; i < 60; i++) {
            if (interrupted)
              throw new Error(`Fixture task interrupted by ${interrupted}`);
            try {
              if ((await fetch(url + '/health')).ok) {
                healthy = true;
                break;
              }
            } catch {}
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          if (!healthy) throw new Error('Mock did not become healthy');
        };
        await startMock();
        const backendEnv = {
          ...env,
          SENATRAN_PROVIDER: 'mock',
          SENATRAN_MOCK_BASE_URL: url,
        };
        if (mode === 'perf') {
          await run(
            [
              'pnpm',
              '--filter',
              '@detran/app',
              'exec',
              'vitest',
              'run',
              '--config',
              'vitest.performance.config.ts',
            ],
            backendEnv,
          );
        } else {
          await run(['pnpm', 'backend:test:e2e'], backendEnv);
          await run(['pnpm', 'backend:test:upgrade'], backendEnv);
          // Each existing suite expects its own pristine synthetic service population.
          await stopMock();
          if (
            !(await run(
              ['pnpm', '--dir', 'senatran-mock', 'db:reset'],
              mockEnv,
            ))
          )
            throw new Error('Adapter fixture reset failed');
          await startMock();
          await run(
            ['pnpm', '--filter', '@detran/senatran-adapter', 'test:e2e'],
            {
              ...env,
              SENATRAN_MOCK_BASE_URL: url,
            },
          );
          await stopMock();
          if (
            !(await run(
              ['pnpm', '--dir', 'senatran-mock', 'db:reset'],
              mockEnv,
            ))
          )
            throw new Error('Mock suite fixture reset failed');
          await run(['pnpm', '--filter', 'senatran-mock', 'test:e2e'], mockEnv);
        }
      }
    }
  } finally {
    await stopMock();
    if (started) output(['docker', 'rm', '--force', container]);
  }
  process.exitCode = failed ? 1 : 0;
}
