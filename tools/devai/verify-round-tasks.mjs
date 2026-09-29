import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';

const taskFilePattern = /^TASK-.*\.json$/u;
const roundPattern = /^R-([0-9]{4})$/u;
const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function usage() {
  process.stderr.write(
    'usage: node tools/devai/verify-round-tasks.mjs --repo-root <path>\n',
  );
}

function parseArguments(argv) {
  if (argv.length !== 2 || argv[0] !== '--repo-root') {
    usage();
    process.exit(2);
  }

  return resolve(argv[1]);
}

async function taskPaths(repoRoot) {
  const roundsRoot = join(repoRoot, 'work/rounds');
  if (!existsSync(roundsRoot)) return [];

  const rounds = await readdir(roundsRoot, { withFileTypes: true });
  const paths = [];
  for (const round of rounds) {
    const match = roundPattern.exec(round.name);
    if (!round.isDirectory() || !match) continue;

    const roundNumber = Number(match[1]);
    if (roundNumber < 3 || roundNumber > 20) continue;

    const directory = join(roundsRoot, round.name, 'tasks');
    if (!existsSync(directory)) continue;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && taskFilePattern.test(entry.name)) {
        paths.push(join(directory, entry.name));
      }
    }
  }

  return paths.sort();
}

function validate(schemaPath, taskPath) {
  return new Promise((resolveValidation) => {
    const child = spawn(
      'pnpm',
      [
        '--dir',
        scriptRoot,
        'exec',
        'devai',
        'check',
        '--only',
        'schema',
        '--repo-root',
        scriptRoot,
        '--schema',
        schemaPath,
        '--instance',
        taskPath,
        '--format',
        'human',
      ],
      { cwd: scriptRoot },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      resolveValidation({
        status: 1,
        stdout,
        stderr: `${stderr}${error.message}`,
      });
    });
    child.on('close', (status) => {
      resolveValidation({ status, stdout, stderr });
    });
  });
}

async function main() {
  const repoRoot = parseArguments(process.argv.slice(2));
  const schemaPath = join(repoRoot, 'law/schemas/task.schema.json');
  if (!existsSync(schemaPath)) {
    process.stderr.write('verify-round-tasks: schema is missing\n');
    process.exitCode = 1;
    return;
  }

  const paths = await taskPaths(repoRoot);
  if (paths.length === 0) {
    process.stderr.write('verify-round-tasks: no TASK files found\n');
    process.exitCode = 1;
    return;
  }

  const validations = new Array(paths.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(8, paths.length) },
    async () => {
      while (nextIndex < paths.length) {
        const index = nextIndex;
        nextIndex += 1;
        validations[index] = await validate(schemaPath, paths[index]);
      }
    },
  );
  await Promise.all(workers);

  const failures = validations.flatMap((result, index) =>
    result.status === 0
      ? []
      : [
          `${relative(repoRoot, paths[index])}: schema validation failed\n${result.stdout}${result.stderr}`,
        ],
  );

  const identities = new Map();
  for (let index = 0; index < paths.length; index += 1) {
    if (validations[index].status !== 0) continue;
    const displayPath = relative(repoRoot, paths[index]);
    try {
      const task = JSON.parse(await readFile(paths[index], 'utf8'));
      const basename = paths[index]
        .split('/')
        .at(-1)
        .replace(/\.json$/u, '');
      if (basename !== task.id)
        failures.push(
          `${displayPath}: TASK basename does not match id ${task.id}`,
        );
      const owner = displayPath.split('/')[2];
      if (task.round_id !== owner)
        failures.push(
          `${displayPath}: round_id does not match owning round ${owner}`,
        );
      const key = `${task.round_id}\u0000${task.id}`;
      const existing = identities.get(key);
      if (existing) {
        failures.push(
          `duplicate TASK identity (${task.round_id}, ${task.id}): ${existing} and ${displayPath}`,
        );
      } else {
        identities.set(key, displayPath);
      }
    } catch {
      failures.push(`${displayPath}: TASK cannot be parsed for identity check`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`${failures.join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`verify-round-tasks: OK (${paths.length} task(s))\n`);
}

await main();
