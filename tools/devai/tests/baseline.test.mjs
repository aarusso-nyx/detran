import assert from 'node:assert/strict';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const baseline = resolve(repositoryRoot, 'tools/devai/baseline.mjs');

const validTask = {
  schemaVersion: '2.0.0',
  id: 'TASK-0001',
  round_id: 'R-0005',
  status: 'ready',
  discipline: 'inspector',
  title: 'Tarefa de fixture válida',
  target_modules: ['MOD-fixture'],
  target_substrates: ['F2'],
  created_at: '2026-09-27T00:00:00.000Z',
  db_isolation: 'database',
  iteration_count: 0,
  executor: {
    kind: 'agent',
    runtime: 'codex',
    model: 'fixture',
    effort: 'medium',
    selection: { mode: 'exact', registry_id: 'fixture' },
    prompt_composition_id: 'PC-0000000000000000',
    max_iterations: 1,
    capabilities: ['test'],
  },
};

async function writeFixture(root) {
  const schemaPath = resolve(root, 'law/schemas/task.schema.json');
  const proofsPath = resolve(root, 'record/proofs/work/generic/R-0005.jsonl');
  const sensorRegistryPath = resolve(
    root,
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
  );
  const sensePresetsPath = resolve(
    root,
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
  );
  const passingReadingPath = resolve(
    root,
    '.devai/state/sensor-readings/spec_depth/SR-1111111111111111.json',
  );
  const failingReadingPath = resolve(
    root,
    '.devai/state/sensor-readings/type_check/SR-2222222222222222.json',
  );
  const validTaskPath = resolve(
    root,
    'work/rounds/R-0005/tasks/TASK-0001.json',
  );
  const invalidTaskPath = resolve(
    root,
    'work/rounds/R-0005/tasks/TASK-0002.json',
  );

  await Promise.all(
    [
      schemaPath,
      proofsPath,
      sensorRegistryPath,
      sensePresetsPath,
      passingReadingPath,
      failingReadingPath,
      validTaskPath,
    ].map((path) => mkdir(dirname(path), { recursive: true })),
  );

  await Promise.all([
    copyFile(
      resolve(repositoryRoot, 'law/schemas/task.schema.json'),
      schemaPath,
    ),
    copyFile(
      resolve(
        repositoryRoot,
        'node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
      ),
      sensorRegistryPath,
    ),
    copyFile(
      resolve(
        repositoryRoot,
        'node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
      ),
      sensePresetsPath,
    ),
    writeFile(
      proofsPath,
      `${JSON.stringify({ round_id: 'R-0005', sequence: 1 })}\n${JSON.stringify({ round_id: 'R-0005', sequence: 2 })}\n`,
    ),
    writeFile(validTaskPath, `${JSON.stringify(validTask)}\n`),
    writeFile(
      invalidTaskPath,
      `${JSON.stringify({ ...validTask, id: 'not-a-task' })}\n`,
    ),
    writeFile(
      passingReadingPath,
      `${JSON.stringify({
        schemaVersion: '1.0.0',
        id: 'SR-1111111111111111',
        sensor: { name: 'spec depth', kind: 'spec_depth' },
        timestamp: '2026-09-27T00:00:00.000Z',
        status: 'pass',
        deterministic: true,
        command: 'pnpm exec devai sense run spec_depth',
        command_hash: '1'.repeat(64),
        out_head: 'fixture-opening-head',
      })}\n`,
    ),
    writeFile(
      failingReadingPath,
      `${JSON.stringify({
        schemaVersion: '1.0.0',
        id: 'SR-2222222222222222',
        sensor: { name: 'type check', kind: 'type_check' },
        timestamp: '2026-09-27T00:00:00.000Z',
        status: 'fail',
        deterministic: true,
        command: 'pnpm exec devai sense run type_check',
        command_hash: '2'.repeat(64),
        out_head: 'fixture-opening-head',
      })}\n`,
    ),
  ]);

  await writeFile(
    resolve(root, 'record/proofs/chain.json'),
    `${JSON.stringify({
      head: 'fixture',
      records: [
        {
          notes: ['round_id=R-0005', 'proof_sequence=1'],
        },
      ],
    })}\n`,
  );
}

async function runBaseline(root, outDir, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [baseline, '--repo-root', root, '--out-dir', outDir, ...extraArgs],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
}

async function withFixture(callback) {
  const root = await mkdtemp(resolve(tmpdir(), 'detran-baseline-fixture-'));
  const outDir = await mkdtemp(resolve(tmpdir(), 'detran-baseline-output-'));

  try {
    await writeFixture(root);
    return await callback({ outDir, root });
  } finally {
    await Promise.all([
      rm(root, { force: true, recursive: true }),
      rm(outDir, { force: true, recursive: true }),
    ]);
  }
}

async function measureFixtureBaseline() {
  return withFixture(async ({ outDir, root }) => {
    const result = await runBaseline(root, outDir);
    assert.equal(
      result.status,
      0,
      `baseline failed:\n${result.stdout}\n${result.stderr}`,
    );
    return {
      json: JSON.parse(
        await readFile(resolve(outDir, 'baseline.json'), 'utf8'),
      ),
      markdown: await readFile(resolve(outDir, 'baseline.md'), 'utf8'),
    };
  });
}

const fixtureBaseline = measureFixtureBaseline();

test('dada uma fixture com linha de prova sem âncora quando mede a linha de base então a órfã traz caminho sequência e sha256', async () => {
  const { json: baselineJson } = await fixtureBaseline;

  assert.equal(baselineJson.proofs.orphans.length, 1);
  assert.equal(
    baselineJson.proofs.orphans[0].path,
    'record/proofs/work/generic/R-0005.jsonl',
  );
  assert.equal(baselineJson.proofs.orphans[0].sequence, 2);
  assert.match(baselineJson.proofs.orphans[0].sha256, /^[a-f0-9]{64}$/);
});

test('dada uma fixture com linha de prova declarada quando mede a linha de base então ela conta como âncora e não como órfã', async () => {
  const { json: baselineJson } = await fixtureBaseline;

  assert.equal(baselineJson.proofs.anchored, 1);
  assert.equal(baselineJson.proofs.jsonl_lines, 2);
  assert.equal(
    baselineJson.proofs.jsonl_lines,
    baselineJson.proofs.anchored + baselineJson.proofs.orphans.length,
  );
});

test('dada uma fixture com TASK válida e inválida quando mede a linha de base então preserva classificações e erros reproduzíveis', async () => {
  const { json: baselineJson } = await fixtureBaseline;
  const { counts, items } = baselineJson.tasks;

  assert.deepEqual(counts, { invalid: 1, unreadable: 0, valid: 1 });
  assert.ok(
    items.some(({ path, valid }) => path.endsWith('TASK-0001.json') && valid),
  );
  assert.ok(
    items.some(
      ({ errors, path, valid }) =>
        path.endsWith('TASK-0002.json') &&
        valid === false &&
        errors.some(
          ({ field, keyword }) =>
            typeof field === 'string' && typeof keyword === 'string',
        ),
    ),
  );
});

test('dada uma fixture sem fonte canônica F2/F3 quando mede commits mistos então não inventa total nem classificação', async () => {
  const { json: baselineJson } = await fixtureBaseline;

  assert.equal(baselineJson.mixed_commits.source_pending, 'source_pending');
  assert.equal(baselineJson.mixed_commits.counts.mixed, null);
  assert.deepEqual(baselineJson.mixed_commits.items, []);
});

test('dadas SensorReadings persistidas por kind quando mede a linha de base então conta estado e referência sem promover resultado não persistido', async () => {
  const { json: baselineJson } = await fixtureBaseline;

  assert.equal(baselineJson.sensors.counts.persisted, 2);
  assert.deepEqual(baselineJson.sensors.counts.by_kind, {
    spec_depth: 1,
    type_check: 1,
  });
  assert.deepEqual(baselineJson.sensors.counts.by_status, {
    fail: 1,
    pass: 1,
  });
  assert.deepEqual(baselineJson.sensors.readings, [
    {
      kind: 'spec_depth',
      path: '.devai/state/sensor-readings/spec_depth/SR-1111111111111111.json',
      reference: 'fixture-opening-head',
      status: 'pass',
    },
    {
      kind: 'type_check',
      path: '.devai/state/sensor-readings/type_check/SR-2222222222222222.json',
      reference: 'fixture-opening-head',
      status: 'fail',
    },
  ]);
});

test('dada uma fixture com linhas ancorada e órfã quando mede a linha de base então proofs.lines preserva chave e hash de todas as linhas', async () => {
  const { json: baselineJson } = await fixtureBaseline;

  assert.equal(baselineJson.proofs.lines.length, 2);
  assert.deepEqual(
    baselineJson.proofs.lines.map(({ anchored, path, round_id, sequence }) => ({
      anchored,
      path,
      round_id,
      sequence,
    })),
    [
      {
        anchored: true,
        path: 'record/proofs/work/generic/R-0005.jsonl',
        round_id: 'R-0005',
        sequence: 1,
      },
      {
        anchored: false,
        path: 'record/proofs/work/generic/R-0005.jsonl',
        round_id: 'R-0005',
        sequence: 2,
      },
    ],
  );
  for (const line of baselineJson.proofs.lines) {
    assert.match(line.sha256, /^[a-f0-9]{64}$/);
  }
});

test('dada uma fixture com checks, provas e rodada pendentes quando renderiza Markdown então expõe contagens e o diagnóstico da rodada', async () => {
  const { markdown } = await fixtureBaseline;

  assert.match(markdown, /checks:[\s\S]*"total": 25/);
  assert.match(markdown, /proofs:[\s\S]*"anchored": 1/);
  assert.match(markdown, /proofs:[\s\S]*"jsonl_lines": 2/);
  assert.match(
    markdown,
    /R-0005[\s\S]*round status DEVAI indisponível sem configuração/,
  );
});

test('dada uma linha de base sem regressões quando mede o fechamento então grava baseline-final e compara os oito eixos', async () => {
  await withFixture(async ({ outDir, root }) => {
    const opening = await runBaseline(root, outDir);
    assert.equal(opening.status, 0, opening.stderr);

    const finalOutDir = await mkdtemp(
      resolve(tmpdir(), 'detran-baseline-final-output-'),
    );
    try {
      const result = await runBaseline(root, finalOutDir, [
        '--final',
        '--against',
        resolve(outDir, 'baseline.json'),
      ]);

      assert.equal(result.status, 0, result.stderr);
      const finalJson = JSON.parse(
        await readFile(resolve(finalOutDir, 'baseline-final.json'), 'utf8'),
      );
      await readFile(resolve(finalOutDir, 'baseline-final.md'), 'utf8');
      assert.deepEqual(Object.keys(finalJson.comparison.axes), [
        'checks',
        'scorecard',
        'sensors',
        'rounds',
        'proofs',
        'tasks',
        'pull_requests',
        'mixed_commits',
      ]);
      assert.equal(
        finalJson.comparison.axes.sensors.persisted_readings.verdict,
        'PASS',
      );
      assert.equal(finalJson.comparison.axes.sensors.verdict, 'REVIEW');
      assert.equal(finalJson.comparison.verdict, 'REVIEW');
      assert.equal(
        typeof finalJson.sensors.sense_run_spec_depth.source_pending,
        'string',
      );
      assert.ok(
        finalJson.sensors.sense_run_spec_depth.source_pending.length > 0,
      );
    } finally {
      await rm(finalOutDir, { force: true, recursive: true });
    }
  });
});

test('dada uma SensorReading de abertura removida quando mede o fechamento então escreve baseline-final e falha a regressão de sensores', async () => {
  await withFixture(async ({ outDir, root }) => {
    const opening = await runBaseline(root, outDir);
    assert.equal(opening.status, 0, opening.stderr);
    await rm(
      resolve(
        root,
        '.devai/state/sensor-readings/spec_depth/SR-1111111111111111.json',
      ),
    );

    const finalOutDir = await mkdtemp(
      resolve(tmpdir(), 'detran-baseline-final-output-'),
    );
    try {
      const result = await runBaseline(root, finalOutDir, [
        '--final',
        '--against',
        resolve(outDir, 'baseline.json'),
      ]);

      assert.notEqual(result.status, 0, 'regressão de sensor deve falhar');
      const finalJson = JSON.parse(
        await readFile(resolve(finalOutDir, 'baseline-final.json'), 'utf8'),
      );
      await readFile(resolve(finalOutDir, 'baseline-final.md'), 'utf8');
      assert.equal(finalJson.comparison.axes.sensors.verdict, 'FAIL');
      assert.ok(
        finalJson.comparison.failures.some(({ axis }) => axis === 'sensors'),
      );
    } finally {
      await rm(finalOutDir, { force: true, recursive: true });
    }
  });
});
