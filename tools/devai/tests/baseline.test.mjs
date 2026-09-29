import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
import { runInNewContext } from 'node:vm';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const baseline = resolve(repositoryRoot, 'tools/devai/baseline.mjs');
const verifier = resolve(
  repositoryRoot,
  'tools/devai/verify-task-originals.mjs',
);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

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

async function runBaseline(root, outDir, extraArgs = [], env = process.env) {
  return spawnSync(
    process.execPath,
    [baseline, '--repo-root', root, '--out-dir', outDir, ...extraArgs],
    { cwd: repositoryRoot, encoding: 'utf8', env },
  );
}

async function comparator() {
  const source = await readFile(baseline, 'utf8');
  const start = source.indexOf('function compareBaseline(');
  const end = source.indexOf('\nasync function main()', start);
  assert.ok(start >= 0 && end > start, 'compareBaseline source is present');
  return runInNewContext(`(${source.slice(start, end)})`);
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

async function a2ComparisonFixture() {
  const opening = JSON.parse(
    await readFile(
      resolve(repositoryRoot, 'work/rounds/R-0020/baseline.json'),
      'utf8',
    ),
  );
  const final = structuredClone(opening);
  const orphan = {
    path: 'record/proofs/work/generic/R-0021.jsonl',
    sequence: 2,
    sha256: 'c562dfce81ec9ba08c4d3eae22547ad36adb99fbb76dc2632bb20e81fbbfb804',
  };
  assert.equal(opening.proofs.orphans.length, 52);
  assert.equal(opening.proofs.verification.valid, true);
  final.proofs.lines.push({ ...orphan, round_id: 'R-0021', anchored: false });
  final.proofs.orphans.push(orphan);
  final.proofs.jsonl_lines += 1;
  final.proofs.counts.jsonl_lines += 1;
  final.proofs.counts.orphans += 1;
  final.proofs.anchor_gate = {
    exit_code: 0,
    directly_anchored: 67,
    declared_orphans: 53,
    undeclared_orphans: 0,
    duplicate_anchors: 0,
    invalid_references: 0,
    validation_errors: 0,
  };
  return { compare: await comparator(), final, opening };
}

test('dada somente a órfã A2 e gate estrito limpo quando compara proofs então aceita a linha nova', async () => {
  const { compare, final, opening } = await a2ComparisonFixture();
  const result = compare(opening, final);
  assert.equal(result.axes.proofs.verdict, 'PASS');
  assert.ok(!result.failures.some(({ axis }) => axis === 'proofs'));
});

for (const [name, change] of [
  ['gate ausente', (final) => delete final.proofs.anchor_gate],
  ['gate com falha', (final) => (final.proofs.anchor_gate.exit_code = 1)],
  [
    'órfã não declarada pelo gate',
    (final) => (final.proofs.anchor_gate.undeclared_orphans = 1),
  ],
  [
    'âncora duplicada no gate',
    (final) => (final.proofs.anchor_gate.duplicate_anchors = 1),
  ],
  [
    'referência inválida no gate',
    (final) => (final.proofs.anchor_gate.invalid_references = 1),
  ],
  [
    'erro de validação no gate',
    (final) => (final.proofs.anchor_gate.validation_errors = 1),
  ],
  ['cadeia inválida', (final) => (final.proofs.verification.valid = false)],
  [
    'hash A2 diferente',
    (final) => {
      final.proofs.lines.at(-1).sha256 = '0'.repeat(64);
      final.proofs.orphans.at(-1).sha256 = '0'.repeat(64);
    },
  ],
  [
    'outra órfã nova',
    (final) => {
      final.proofs.lines.push({
        path: 'record/proofs/work/generic/R-0020.jsonl',
        sequence: 4,
        sha256: '0'.repeat(64),
        round_id: 'R-0020',
        anchored: false,
      });
    },
  ],
]) {
  test(`dada A2 com ${name} quando compara proofs então falha`, async () => {
    const { compare, final, opening } = await a2ComparisonFixture();
    change(final);
    const result = compare(opening, final);
    assert.equal(result.axes.proofs.verdict, 'FAIL');
    assert.ok(result.failures.some(({ axis }) => axis === 'proofs'));
  });
}

const a3OldPaths = [
  'tasks/TASK-0001-D1.json',
  'tasks/TASK-0002-D1.json',
  'tasks/TASK-0003-D1.json',
  'tasks/TASK-0004-D1.json',
  'tasks/TASK-0004-S1.json',
  'tasks/TASK-0004-S2.json',
  'tasks/TASK-0004-S2-R1.json',
  'tasks/TASK-0004-S3.json',
  'tasks/TASK-0004-S4.json',
  'tasks/TASK-0004-S5.json',
];
const a3VerifierArgv = [
  'node',
  'tools/devai/verify-task-originals.mjs',
  '--repo-root',
  '.',
];
const a3ArtifactPaths = {
  aliases: 'work/rounds/R-0007/tasks/_legacy-originals/aliases.json',
  d1: 'work/rounds/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json',
  report: 'work/rounds/R-0020/reports/A3-migration-before-after.json',
};
const a3FrozenDigests = {
  aliases: '21abf670dc42767c69156e17fefd27e41703b788adf7f4dc07559c573efb009c',
  d1: 'fd60307218ac39d5777292bf724fc7be29d487f87f96f430e55235346b0095a2',
  report: '7518fe70f8314f97763dfe37307eb9dc1468806ef71e49d0bc8f4ffc36afc69d',
};

async function a3Artifacts() {
  const loaded = await Promise.all(
    Object.entries(a3ArtifactPaths).map(async ([name, path]) => {
      const bytes = await readFile(resolve(repositoryRoot, path));
      return [
        name,
        { entries: JSON.parse(bytes), path, sha256: sha256(bytes) },
      ];
    }),
  );
  const artifacts = Object.fromEntries(loaded);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(artifacts).map(([name, artifact]) => [
        name,
        artifact.sha256,
      ]),
    ),
    a3FrozenDigests,
  );
  return artifacts;
}

async function a3ComparisonFixture() {
  const opening = JSON.parse(
    await readFile(
      resolve(repositoryRoot, 'work/rounds/R-0020/baseline.json'),
      'utf8',
    ),
  );
  const artifacts = await a3Artifacts();
  const migrations = artifacts.report.entries.migrations.filter(
    (migration) =>
      migration.round_id === 'R-0007' &&
      a3OldPaths.includes(migration.old_path),
  );
  assert.equal(migrations.length, a3OldPaths.length);
  const oldPaths = new Set(
    a3OldPaths.map((path) => `work/rounds/R-0007/${path}`),
  );
  const final = structuredClone(opening);
  final.sources = final.sources.filter(({ path }) => !oldPaths.has(path));
  final.tasks.items = final.tasks.items.filter(
    ({ path }) => !oldPaths.has(path),
  );
  for (const migration of migrations) {
    const canonicalPath = `work/rounds/${migration.round_id}/${migration.canonical_path}`;
    final.sources = final.sources.filter(({ path }) => path !== canonicalPath);
    final.sources.push({
      path: canonicalPath,
      sha256: migration.canonical_sha256,
    });
    final.tasks.items = final.tasks.items.filter(
      ({ path }) => path !== canonicalPath,
    );
    final.tasks.items.push({ path: canonicalPath, valid: true });
  }
  final.sources.sort((left, right) => left.path.localeCompare(right.path));
  final.tasks.items.sort((left, right) => left.path.localeCompare(right.path));
  final.tasks.a3_transposition = {
    artifacts,
    sidecars: migrations.map((migration) => ({
      old_path: `work/rounds/${migration.round_id}/${migration.old_path}`,
      sha256: migration.original_sha256,
      sidecar_path: `work/rounds/${migration.round_id}/${migration.sidecar_path}`,
    })),
    verifier: {
      argv: a3VerifierArgv,
      exit_code: 0,
      stdout_sha256: 'a'.repeat(64),
    },
  };
  return { compare: await comparator(), final, migrations, opening };
}

test('dados os dez caminhos A3 e recibo íntegro quando compara TASKs então aceita somente a transposição autorizada', async () => {
  const { compare, final, opening } = await a3ComparisonFixture();

  assertA3Accepted(compare, opening, final);
});

function assertA3Accepted(compare, opening, final) {
  const result = compare(opening, final);
  assert.equal(result.axes.tasks.verdict, 'PASS');
  assert.ok(!result.failures.some(({ axis }) => axis === 'tasks'));
}

for (const [name, change] of [
  [
    'hash da abertura divergente',
    (final, migrations, opening) => {
      const migration = migrations[0];
      const path = `work/rounds/${migration.round_id}/${migration.old_path}`;
      opening.sources.find((source) => source.path === path).sha256 =
        '0'.repeat(64);
    },
  ],
  [
    'hash de abertura do posterior D1 divergente',
    (final, migrations, opening) => {
      const source = opening.sources.find(
        ({ path }) => path === 'work/rounds/R-0007/tasks/TASK-0020.json',
      );
      assert.ok(source, 'fonte de abertura TASK-0020 existe');
      source.sha256 = '0'.repeat(64);
    },
  ],
  [
    'subconjunto de nove caminhos',
    (final, migrations) => {
      const migration = migrations.at(-1);
      const oldPath = `work/rounds/${migration.round_id}/${migration.old_path}`;
      final.sources.push({
        path: oldPath,
        sha256: migration.original_sha256,
      });
      final.tasks.items.push({ path: oldPath, valid: true });
    },
  ],
  [
    'décimo primeiro caminho',
    (final) => {
      const extra = 'work/rounds/R-0007/tasks/TASK-0001.json';
      final.sources = final.sources.filter(({ path }) => path !== extra);
      final.tasks.items = final.tasks.items.filter(
        ({ path }) => path !== extra,
      );
    },
  ],
  [
    'hash do sidecar divergente',
    (final) =>
      (final.tasks.a3_transposition.sidecars[0].sha256 = '0'.repeat(64)),
  ],
  [
    'sidecar ausente no recibo',
    (final) => final.tasks.a3_transposition.sidecars.pop(),
  ],
  [
    'leitura de sidecar falha no recibo',
    (final) =>
      (final.tasks.a3_transposition.sidecars[0] = {
        old_path: final.tasks.a3_transposition.sidecars[0].old_path,
        sidecar_path: final.tasks.a3_transposition.sidecars[0].sidecar_path,
        sha256: null,
        error: 'leitura falhou',
      }),
  ],
  [
    'artefato congelado divergente',
    (final) =>
      (final.tasks.a3_transposition.artifacts.report.sha256 = '0'.repeat(64)),
  ],
  [
    'mapeamento analisado de alias divergente',
    (final) =>
      (final.tasks.a3_transposition.artifacts.aliases.entries[0].new_id =
        'TASK-9999'),
  ],
  [
    'mapeamento analisado D1 divergente',
    (final) =>
      (final.tasks.a3_transposition.artifacts.d1.entries.entries[0].id =
        'TASK-9999'),
  ],
  [
    'leitura ou JSON do índice D1 falha no recibo',
    (final) =>
      (final.tasks.a3_transposition.artifacts.d1 = {
        path: final.tasks.a3_transposition.artifacts.d1.path,
        sha256: null,
        entries: null,
        error: 'leitura ou JSON inválido',
      }),
  ],
  [
    'hash posterior D1 divergente',
    (final) => {
      const entry =
        final.tasks.a3_transposition.artifacts.d1.entries.entries.find(
          ({ disposition }) => disposition === 'superseded-snapshot',
        );
      entry.posterior_sha256 = '0'.repeat(64);
    },
  ],
  [
    'destino canônico inválido',
    (final, migrations) => {
      const migration = migrations[0];
      const path = `work/rounds/${migration.round_id}/${migration.canonical_path}`;
      final.tasks.items.find((item) => item.path === path).valid = false;
    },
  ],
  [
    'destino canônico ausente',
    (final, migrations) => {
      const migration = migrations[0];
      const path = `work/rounds/${migration.round_id}/${migration.canonical_path}`;
      final.tasks.items = final.tasks.items.filter(
        (item) => item.path !== path,
      );
    },
  ],
  [
    'verificador negativo',
    (final) => (final.tasks.a3_transposition.verifier.exit_code = 1),
  ],
  [
    'argv do verificador divergente',
    (final) =>
      (final.tasks.a3_transposition.verifier.argv = [
        'node',
        'tools/devai/verify-task-originals.mjs',
        '--repo-root',
        '..',
      ]),
  ],
  [
    'hash da fonte canônica final divergente',
    (final, migrations) => {
      const migration = migrations[0];
      const path = `work/rounds/${migration.round_id}/${migration.canonical_path}`;
      final.sources.find((source) => source.path === path).sha256 = '0'.repeat(
        64,
      );
    },
  ],
  ['recibo ausente', (final) => delete final.tasks.a3_transposition],
]) {
  test(`dada transposição A3 com ${name} quando compara TASKs então falha`, async () => {
    const { compare, final, migrations, opening } = await a3ComparisonFixture();
    assertA3Accepted(compare, opening, final);
    change(final, migrations, opening);

    const result = compare(opening, final);

    assert.equal(result.axes.tasks.verdict, 'FAIL');
    assert.ok(result.failures.some(({ axis }) => axis === 'tasks'));
  });
}

async function writeA3MeasurementFixture(root) {
  const { report } = await a3Artifacts();
  const migrations = report.entries.migrations.filter(
    (migration) =>
      migration.round_id === 'R-0007' &&
      a3OldPaths.includes(migration.old_path),
  );
  for (const path of Object.values(a3ArtifactPaths)) {
    const destination = resolve(root, path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(repositoryRoot, path), destination);
  }
  for (const migration of migrations) {
    const sourceRoot = resolve(
      repositoryRoot,
      'work/rounds',
      migration.round_id,
    );
    const fixtureRoot = resolve(root, 'work/rounds', migration.round_id);
    const sidecar = resolve(sourceRoot, migration.sidecar_path);
    const oldTask = resolve(fixtureRoot, migration.old_path);
    const canonicalTask = resolve(fixtureRoot, migration.canonical_path);
    await mkdir(dirname(oldTask), { recursive: true });
    await Promise.all([
      copyFile(sidecar, oldTask),
      copyFile(resolve(sourceRoot, migration.canonical_path), canonicalTask),
      copyFile(sidecar, resolve(fixtureRoot, migration.sidecar_path)),
    ]);
  }
  return migrations;
}

test('dada fixture A3 sem cópia local do verificador quando mede fechamento então grava recibo normalizado com hashes reais', async () => {
  await withFixture(async ({ outDir, root }) => {
    const migrations = await writeA3MeasurementFixture(root);
    assert.equal(migrations.length, a3OldPaths.length);
    await assert.rejects(
      readFile(resolve(root, 'tools/devai/verify-task-originals.mjs'), 'utf8'),
    );
    const opening = await runBaseline(root, outDir);
    assert.equal(opening.status, 0, opening.stderr);
    await Promise.all(
      migrations.map((migration) =>
        rm(
          resolve(root, 'work/rounds', migration.round_id, migration.old_path),
        ),
      ),
    );
    const finalOutDir = await mkdtemp(
      resolve(tmpdir(), 'detran-baseline-a3-final-output-'),
    );
    try {
      await runBaseline(root, finalOutDir, [
        '--final',
        '--against',
        resolve(outDir, 'baseline.json'),
      ]);
      const final = JSON.parse(
        await readFile(resolve(finalOutDir, 'baseline-final.json'), 'utf8'),
      );
      const expected = spawnSync(
        process.execPath,
        [verifier, '--repo-root', root],
        { cwd: root, encoding: 'utf8' },
      );
      assert.deepEqual(final.tasks.a3_transposition.verifier, {
        argv: a3VerifierArgv,
        exit_code: expected.status ?? 1,
        stdout_sha256: sha256(expected.stdout.trim()),
      });
      if ((expected.status ?? 1) !== 0)
        assert.equal(final.comparison.axes.tasks.verdict, 'FAIL');
      for (const [name, path] of Object.entries(a3ArtifactPaths)) {
        const bytes = await readFile(resolve(root, path));
        assert.equal(final.tasks.a3_transposition.artifacts[name].path, path);
        assert.equal(
          final.tasks.a3_transposition.artifacts[name].sha256,
          sha256(bytes),
        );
        assert.deepEqual(
          final.tasks.a3_transposition.artifacts[name].entries,
          JSON.parse(bytes),
        );
      }
      for (const migration of migrations) {
        const sidecar = resolve(
          root,
          'work/rounds',
          migration.round_id,
          migration.sidecar_path,
        );
        const measured = final.tasks.a3_transposition.sidecars.find(
          ({ old_path }) =>
            old_path ===
            `work/rounds/${migration.round_id}/${migration.old_path}`,
        );
        assert.deepEqual(measured, {
          old_path: `work/rounds/${migration.round_id}/${migration.old_path}`,
          sha256: sha256(await readFile(sidecar)),
          sidecar_path: `work/rounds/${migration.round_id}/${migration.sidecar_path}`,
        });
      }
    } finally {
      await rm(finalOutDir, { force: true, recursive: true });
    }
  });
});
