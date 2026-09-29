import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const verifier = join(repositoryRoot, 'tools/devai/verify-round-tasks.mjs');

function verify(repoRoot) {
  return spawnSync(process.execPath, [verifier, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

function validTask() {
  return {
    schemaVersion: '2.0.0',
    id: 'TASK-0001',
    round_id: 'R-0003',
    status: 'queued',
    discipline: 'inspector',
    title: 'Testar tarefas',
    target_modules: ['MOD-devai'],
    target_substrates: ['F1'],
    created_at: '2026-09-28T00:00:00.000Z',
    db_isolation: 'database',
    iteration_count: 0,
    prompt_composition_id: 'PC-0000000000000000',
    executor: {
      kind: 'agent',
      runtime: 'codex',
      model: 'gpt-5.6-terra',
      effort: 'medium',
      selection: { mode: 'exact', registry_id: 'codex-gpt-5.6-terra' },
      prompt_composition_id: 'PC-0000000000000000',
      max_iterations: 1,
      capabilities: ['read'],
    },
  };
}

async function writeFixture(repoRoot, tasks) {
  const taskDirectory = join(repoRoot, 'work/rounds/R-0003/tasks');
  await mkdir(taskDirectory, { recursive: true });
  await mkdir(join(repoRoot, 'law/schemas'), { recursive: true });
  await writeFile(
    join(repoRoot, 'law/schemas/task.schema.json'),
    await readFile(join(repositoryRoot, 'law/schemas/task.schema.json')),
  );
  await Promise.all(
    tasks.map(([name, task]) =>
      writeFile(
        join(taskDirectory, name),
        `${JSON.stringify(task, null, 2)}\n`,
      ),
    ),
  );
}

test('dado duas tarefas 2.0.0 válidas quando o gate verifica a rodada então aceita ambas', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-round-tasks-'));

  try {
    await writeFixture(repoRoot, [
      ['TASK-0001.json', validTask()],
      ['TASK-0002.json', { ...validTask(), id: 'TASK-0002' }],
    ]);

    const result = verify(repoRoot);

    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado dois arquivos válidos com mesmo round_id e id quando o gate verifica a rodada então falha por duplicata', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-round-tasks-'));

  try {
    await writeFixture(repoRoot, [
      ['TASK-0001.json', validTask()],
      ['TASK-0002.json', validTask()],
    ]);

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /duplicate|duplicad/iu);
    assert.match(result.stderr, /R-0003/u);
    assert.match(result.stderr, /TASK-0001/u);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado tarefa com schemaVersion inválido quando o gate verifica a rodada então falha e identifica o arquivo', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-round-tasks-'));

  try {
    await writeFixture(repoRoot, [
      ['TASK-0001.json', { ...validTask(), schemaVersion: '1.0.0' }],
    ]);

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0001\.json/);
    assert.match(result.stderr, /schema/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado tarefa inválida em R-0020 quando o gate verifica as rodadas então identifica o arquivo', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-round-tasks-'));

  try {
    await writeFixture(repoRoot, [['TASK-0001.json', validTask()]]);
    const taskDirectory = join(repoRoot, 'work/rounds/R-0020/tasks');
    await mkdir(taskDirectory, { recursive: true });
    await writeFile(
      join(taskDirectory, 'TASK-0020.json'),
      `${JSON.stringify({ ...validTask(), id: 'TASK-0020', schemaVersion: '1.0.0' }, null, 2)}\n`,
    );

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0020\.json/);
    assert.match(result.stderr, /schema/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
