// R-0036: capture native DEVAI observations without synthesizing verdicts.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import {
  parseCommandDocument,
  unwrapCommandDocument,
} from './scorecard-output.mjs';

const root = process.cwd();
const round = 'R-0036';
const session = process.env.DETRAN_SCORECARD_SESSION;
if (session && !/^[a-z0-9][a-z0-9-]*$/.test(session))
  throw new Error('Invalid scorecard session name');
const audit = join(root, '.devai/local/rounds', round, 'audit', session ?? '');
const source = JSON.parse(
  readFileSync('law/policy/scorecard-sensor-inputs.json'),
);
const packageRoot = resolve('node_modules/@aarusso-nyx/devai');
// DEVAI bundles its runtime dependencies; use pnpm's installed shared AJV 8.
const requirePackage = createRequire(
  resolve('node_modules/.pnpm/node_modules/ajv/package.json'),
);
const Ajv = requirePackage('./dist/2020.js').default;
const validate = new Ajv({ strict: false }).compile(
  JSON.parse(
    readFileSync(
      join(packageRoot, 'dist/runtime/index/schemas/sensor-inputs.schema.json'),
    ),
  ),
);
if (!validate(source)) throw new Error(JSON.stringify(validate.errors));
mkdirSync(audit, { recursive: true });

function save(name, value) {
  writeFileSync(join(audit, name), JSON.stringify(value, null, 2) + '\n', {
    flag: 'wx',
  });
}

async function capture(label, argv, timeoutMs = 1_200_000) {
  if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Invalid capture label');
  if (existsSync(join(audit, `${label}.json`)))
    throw new Error(`Capture already exists: ${label}; choose a new label`);
  const started = new Date().toISOString();
  console.log(`START ${label}`);
  const result = await new Promise((done) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: root,
      env: process.env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '',
      timedOut = false,
      forceTimer;
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGTERM');
        forceTimer = setTimeout(() => {
          try {
            process.kill(-child.pid, 'SIGKILL');
          } catch {
            /* already exited */
          }
        }, 5000);
      } catch {
        /* already exited */
      }
    }, timeoutMs);
    child.on('error', (error) => {
      stderr += String(error);
    });
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
      done({ exitCode, signal, timedOut, stdout, stderr });
    });
  });
  const outcome = {
    argv,
    started_at: started,
    finished_at: new Date().toISOString(),
    ...result,
  };
  save(`${label}.json`, outcome);
  console.log(
    `END ${label}: exit=${result.exitCode} timeout=${result.timedOut}`,
  );
  return {
    ...outcome,
    value: unwrapCommandDocument(parseCommandDocument(result)),
  };
}

const cli = (...args) => ['pnpm', 'exec', 'devai', ...args];
const mode = process.argv[2];
if (mode === 'capture') {
  await capture(process.argv[3], process.argv.slice(4));
} else if (mode === 'first') {
  await capture(
    process.argv[3] ?? 'sweep-first',
    cli(
      'sense',
      'run',
      '--preset',
      'sweep',
      '--round',
      round,
      '--repo-root',
      '.',
      '--format',
      'json',
    ),
  );
} else if (mode === 'sensor') {
  const kind = process.argv[3];
  const role = process.argv[4];
  const inputs = source.inputs[kind] ?? {};
  if (kind === 'migration_check' && !inputs.taskId) {
    if (
      !process.env.DETRAN_SCORECARD_DATABASE_URL?.startsWith(
        'postgresql://postgres:postgres@127.0.0.1:',
      )
    ) {
      throw new Error('A disposable loopback database is required');
    }
    inputs.databaseUrl = process.env.DETRAN_SCORECARD_DATABASE_URL;
  }
  await capture(
    process.argv[5] ?? `sensor-${kind}`,
    cli(
      'sense',
      'run',
      kind,
      '--repo-root',
      '.',
      '--input',
      JSON.stringify(inputs),
      '--as-role',
      role,
      '--write',
      '--format',
      'json',
    ),
  );
} else if (mode === 'record') {
  const labels = process.argv.slice(3);
  for (const label of labels) {
    const raw = JSON.parse(readFileSync(join(audit, `${label}.json`)));
    const value = unwrapCommandDocument(parseCommandDocument(raw));
    for (const [index, result] of (value?.results ?? []).entries()) {
      let reading;
      try {
        reading = JSON.parse(result.stdout);
      } catch {
        continue;
      }
      if (!reading?.sensor?.kind || !reading.id) continue;
      const name = `${label}-reading-${index}.json`;
      save(name, reading);
      await capture(
        `${label}-record-${index}`,
        cli(
          'sense',
          'record',
          '--repo-root',
          '.',
          '--input',
          join(audit, name),
          '--as-role',
          'inspector',
          '--write',
          '--format',
          'json',
        ),
        60_000,
      );
    }
  }
} else if (mode === 'second') {
  await capture(
    'sweep-second',
    cli(
      'sense',
      'run',
      '--preset',
      'sweep',
      '--round',
      round,
      '--pass',
      'second',
      '--repo-root',
      '.',
      '--format',
      'json',
    ),
  );
} else if (mode === 'hash') {
  for (const path of process.argv.slice(3))
    console.log(
      path,
      createHash('sha256').update(readFileSync(path)).digest('hex'),
    );
} else {
  throw new Error('Use capture, first, sensor, record, second, or hash');
}
