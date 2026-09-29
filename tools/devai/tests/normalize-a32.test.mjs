import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const normalizer = join(repositoryRoot, 'tools/devai/normalize-tasks.mjs');
const archivalGuard = join(
  repositoryRoot,
  'tools/devai/verify-archival-pc-guard.mjs',
);

const ctgAliases = [
  ['R-0012', 'CTG-0002a', 'CTG-9001', 3],
  ['R-0012', 'CTG-0002b', 'CTG-9002', 1],
  ['R-0012', 'CTG-0002b-1', 'CTG-9003', 2],
  ['R-0012', 'CTG-0002b-2', 'CTG-9004', 3],
  ['R-0012', 'CTG-0002c', 'CTG-9005', 5],
  ['R-0013', 'CTG-0004a', 'CTG-9006', 4],
  ['R-0013', 'CTG-0004b', 'CTG-9007', 4],
  ['R-0014', 'CTG-0003a', 'CTG-9008', 3],
  ['R-0014', 'CTG-0003b', 'CTG-9009', 3],
  ['R-0014', 'CTG-0003c', 'CTG-9010', 3],
];

const ctgAliasTasks = new Map([
  ['CTG-9001', ['TASK-0001', 'TASK-0005', 'TASK-0006']],
  ['CTG-9002', ['TASK-0007']],
  ['CTG-9003', ['TASK-0008', 'TASK-0009']],
  ['CTG-9004', ['TASK-0014', 'TASK-0015', 'TASK-0016']],
  [
    'CTG-9005',
    ['TASK-0010', 'TASK-0011', 'TASK-0012', 'TASK-0013', 'TASK-0017'],
  ],
  ['CTG-9006', ['TASK-0010', 'TASK-0011', 'TASK-0012', 'TASK-0013']],
  ['CTG-9007', ['TASK-0014', 'TASK-0015', 'TASK-0016', 'TASK-0017']],
  ['CTG-9008', ['TASK-0019', 'TASK-0008', 'TASK-0009']],
  ['CTG-9009', ['TASK-0020', 'TASK-0015', 'TASK-0016']],
  ['CTG-9010', ['TASK-0021', 'TASK-0017', 'TASK-0018']],
]);

const editorialTitles = new Map([
  [
    'R-0008/TASK-0008',
    'Escrever testes de medidas, alcoolemia, velocidade por flag, SSE e integrações',
  ],
  [
    'R-0009/TASK-0005',
    'Declarar wiring M24 nos quatro blueprints e contrato CTG-0002 das rotas portal',
  ],
  [
    'R-0009/TASK-0006',
    'Codificar critérios C-0002-nn em testes de rotas, projeções, SSE e política portal',
  ],
  [
    'R-0009/TASK-0007',
    'Implementar PORTAL_RULES e rotas de identidade e pedidos até os testes passarem',
  ],
  [
    'R-0009/TASK-0008',
    'Implementar rotas de autuações, caixa, documentos, atendimento, SSE e projetores',
  ],
  [
    'R-0009/TASK-0009',
    'Escrever contratos de comando BP-PORTAL, schema de rascunho e clientes gerados',
  ],
  [
    'R-0014/TASK-0001',
    'Transcrever M10/OD-P46 no catálogo de parâmetros e build pack do portal',
  ],
  [
    'R-0014/TASK-0002',
    'Escrever testes da allowlist i18n e do scaffold de apps/portal/web',
  ],
  [
    'R-0014/TASK-0004',
    'Criar scaffold Angular do portal com shell, rotas, guardas e gates',
  ],
  [
    'R-0014/TASK-0006',
    'Transcrever catálogo i18n do portal: traduções, textos jurídicos, erros e rótulos',
  ],
  [
    'R-0014/TASK-0012',
    'Transcrever documentação de fechamento do portal e decisões associadas',
  ],
  [
    'R-0016/TASK-0008',
    'Escrever contrato CTG-0002 do console: rotas, guardas, componentes e critérios',
  ],
]);

const prospectivePc = [
  ['TASK-0004-S1', 'TASK-0083', 'gpt-5.6-terra', 'PC-cc41f39f237dccdd'],
  ['TASK-0004-S2', 'TASK-0084', 'gpt-5.6-terra', 'PC-cf0578539d9b03e6'],
  ['TASK-0004-S2-R1', 'TASK-0085', 'gpt-5.6-terra', 'PC-2151b3056f67043d'],
  ['TASK-0004-S3', 'TASK-0086', 'gpt-5.6-luna', 'PC-8ec9b108bf290ede'],
  ['TASK-0004-S4', 'TASK-0087', 'gpt-5.6-luna', 'PC-d0a290d9320c85b9'],
  ['TASK-0004-S5', 'TASK-0088', 'gpt-5.6-luna', 'PC-1d975bf1835e7f30'],
];

const retainedPc = [
  ['TASK-0078', 'claude-fable-5', 'PC-ctg2-final-review-fable5'],
  ['TASK-0079', 'gpt-5.6-terra', 'PC-ctg2-final-corrective'],
  ['TASK-0080', 'claude-fable-5', 'PC-ctg2-final-review-fable5-2'],
  ['TASK-0081', 'gpt-5.6-terra', 'PC-ctg2-final-etag-corrective'],
  ['TASK-0082', 'claude-fable-5', 'PC-ctg2-final-review-fable5-3'],
];

const originalPcTaskHashes = new Map([
  [
    'TASK-0004-S1',
    '084092c2b3e1cb342d12515e531a7ad84ef71c5023257b79077ff9d4d43e8320',
  ],
  [
    'TASK-0004-S2',
    'b93d22464a2900ad2c04d0f292aa174c18755031b806774d11122c5e6f6cd1f2',
  ],
  [
    'TASK-0004-S2-R1',
    '8c2a9478a5039a715ac4df73d9a97d9aefc37248054b87e6cda878c8dba86b68',
  ],
  [
    'TASK-0004-S3',
    '861af0dbe8228d83c3d1ad390ad687dcf50bd518ebfd0b0bdb9127e8f074ea72',
  ],
  [
    'TASK-0004-S4',
    '5f15df733e9c0861e2d43753cf118b197817e47bb65f70118a9e0819610a581e',
  ],
  [
    'TASK-0004-S5',
    '9266a11250dc38911b9ed42518ccda2a9952f8cc1d146f6586ab166ce5cd0867',
  ],
  [
    'TASK-0078',
    '3f9f88d34ee89d7df18d7e1284f02eca01f942dd8a6afe5a9049f7417522c243',
  ],
  [
    'TASK-0079',
    'd054ceb7788444724f2431799eeaff10ab85504f496c176e2ce96d313414f4bb',
  ],
  [
    'TASK-0080',
    'febebf4e60de886dd57343c6ec5779c3e0edb6aabe46e9ac5c2429669295c67a',
  ],
  [
    'TASK-0081',
    '4181f96d9062cb6840a81b953ae71f18b3115984944ed1cdcb83041fcdef8bdb',
  ],
  [
    'TASK-0082',
    'f09c3bde43bf87aaf89f8cf7d0d3abc4e2e6f5c55284be4a4179a5ce296886e1',
  ],
]);

async function originalPcTaskBytes(id) {
  const taskDirectory = join(repositoryRoot, 'work/rounds/R-0007/tasks');
  let bytes;
  try {
    bytes = await readFile(
      join(taskDirectory, '_legacy-originals', `${id}.json.raw`),
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    bytes = await readFile(join(taskDirectory, `${id}.json`));
  }
  assert.equal(digest(bytes), originalPcTaskHashes.get(id), id);
  return bytes;
}

const externalInvariantOccurrences = [
  ['R-0005/TASK-0002', 'INV-EVIDENCE-001'],
  ['R-0005/TASK-0002', 'INV-OFFLINE-001'],
  ['R-0005/TASK-0003', 'INV-EVIDENCE-001'],
  ['R-0005/TASK-0003', 'INV-OFFLINE-001'],
];

const executorNotePaths = [
  'R-0014/TASK-0010',
  'R-0014/TASK-0011',
  'R-0014/TASK-0012',
  'R-0014/TASK-0022',
];

const executionEvidencePaths = [
  ...Array.from(
    { length: 11 },
    (_, index) => `TASK-${String(index + 8).padStart(4, '0')}`,
  ),
  'TASK-0050',
  ...Array.from(
    { length: 19 },
    (_, index) => `TASK-${String(index + 64).padStart(4, '0')}`,
  ),
];

const closureReconciliationPaths = [
  'TASK-0006',
  'TASK-0007',
  'TASK-0008',
  'TASK-0046',
  'TASK-0048',
  'TASK-0050',
  'TASK-0057',
];

const archivalEvidencePaths = [
  ...new Set([
    ...executionEvidencePaths.filter(
      (id) => !retainedPc.some(([taskId]) => taskId === id),
    ),
    ...closureReconciliationPaths,
  ]),
];

const expectedPcCandidates = new Map([
  ...prospectivePc.map(([id, , , pc]) => [id, pc]),
  ['TASK-0078', 'PC-22b18cc1bd9af201'],
  ['TASK-0079', 'PC-cc3dc8e959e09510'],
  ['TASK-0080', 'PC-1766eb9f01d0bafa'],
  ['TASK-0081', 'PC-aedea88033f4eb98'],
  ['TASK-0082', 'PC-10b9b527af7d35af'],
]);

function task(overrides = {}) {
  return {
    schemaVersion: '2.0.0',
    id: 'TASK-0001',
    round_id: 'R-0003',
    status: 'queued',
    discipline: 'inspector',
    title: 'Fixture A3.2',
    target_modules: ['MOD-devai-tools-tests'],
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
      selection: { mode: 'exact', registry_id: 'gpt-5.6-terra' },
      prompt_composition_id: 'PC-0000000000000000',
      max_iterations: 1,
      capabilities: ['read'],
    },
    ...overrides,
  };
}

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function packageFields(bytes) {
  return new Map(
    bytes
      .toString('utf8')
      .trimEnd()
      .split('\n')
      .slice(1)
      .map((line) => line.split(/=(.*)/su).slice(0, 2)),
  );
}

function canonicalize(bytes) {
  return bytes
    .toString('utf8')
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/[ \t\n]+$/u, '');
}

function normalize(repoRoot) {
  return spawnSync(process.execPath, [normalizer, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

function verifyArchivalGuard(repoRoot) {
  return spawnSync(process.execPath, [archivalGuard, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

async function writeTask(repoRoot, round, name, value) {
  const path = join(repoRoot, 'work/rounds', round, 'tasks', `${name}.json`);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
  return path;
}

async function withFixture(callback) {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-a32-'));
  try {
    await callback(repoRoot);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
}

async function writePcGuardManifest(repoRoot, prompts, originals) {
  const originalSources = [
    ...prospectivePc.map(([taskId]) => {
      const source = prompts.get(taskId);
      return {
        task_id: taskId,
        kind: 'task-prompt',
        path: source.path.slice(repoRoot.length + 1),
        raw_sha256: digest(source.bytes),
        canonical_sha256: digest(canonicalize(source.bytes)),
      };
    }),
    ...retainedPc.map(([taskId]) => {
      const bytes = originals.get(taskId);
      return {
        task_id: taskId,
        kind: 'task-json-original',
        path: `work/rounds/R-0007/tasks/${taskId}.json`,
        raw_sha256: digest(bytes),
        canonical_sha256: digest(canonicalize(bytes)),
      };
    }),
  ];
  const manifest = {
    schemaVersion: '1.0.0',
    round_id: 'R-0007',
    status: 'pre-migration',
    canonicalization: 'utf8-bom-crlf-trailing-v1',
    expected_counts: {
      task_prompts: 6,
      task_json_originals: 5,
      archive_packages: 11,
      canonical_tasks: 11,
      sidecars: 11,
    },
    original_sources: originalSources,
  };
  const path = join(
    repoRoot,
    'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json',
  );
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  const backlog = join(repoRoot, '.devai/state/backlog.jsonl');
  await mkdir(join(backlog, '..'), { recursive: true });
  await writeFile(backlog, '');
  return path;
}

async function copyA31Allowlist(repoRoot) {
  const path = 'work/rounds/R-0020/contracts/CTG-0003-A3.1-none-allowlist.json';
  const destination = join(repoRoot, path);
  await mkdir(join(destination, '..'), { recursive: true });
  await writeFile(destination, await readFile(join(repositoryRoot, path)));
}

async function copyTrace(repoRoot) {
  const path = 'law/trace.json';
  const destination = join(repoRoot, path);
  await mkdir(join(destination, '..'), { recursive: true });
  await writeFile(destination, await readFile(join(repositoryRoot, path)));
}

async function copyR0007Plan(repoRoot) {
  const path = 'work/rounds/R-0007/plan.md';
  const destination = join(repoRoot, path);
  await mkdir(join(destination, '..'), { recursive: true });
  await writeFile(destination, await readFile(join(repositoryRoot, path)));
}

test('dado tabela CTG A3.2 quando normaliza representante então reserva aliases distintos sem colisão', async () => {
  await withFixture(async (repoRoot) => {
    assert.equal(ctgAliases.length, 10);
    assert.equal(
      ctgAliases.reduce(
        (total, entry) => total + ctgAliasTasks.get(entry[2]).length,
        0,
      ),
      31,
    );
    assert.equal(new Set(ctgAliases.map((entry) => entry[2])).size, 10);
    for (const [, , canonical, count] of ctgAliases)
      assert.equal(ctgAliasTasks.get(canonical).length, count);
    const path = await writeTask(
      repoRoot,
      'R-0012',
      'TASK-0001',
      task({ round_id: 'R-0012', coupled_task_group: 'CTG-0002a' }),
    );
    const before = await readFile(path);
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(await readFile(path));
    assert.equal(canonical.coupled_task_group, 'CTG-9001');
    assert.ok(canonical.tags.includes('legacy-ctg:CTG-0002a'));
    const aliases = JSON.parse(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0012/tasks/_legacy-originals/aliases.json',
        ),
      ),
    );
    assert.equal(aliases[0].original_sha256, digest(before));
  });
});

test('dado candidato CTG já reservado quando normaliza então rejeita colisão declarada sem mutação', async () => {
  await withFixture(async (repoRoot) => {
    const path = await writeTask(
      repoRoot,
      'R-0012',
      'TASK-0001',
      task({ round_id: 'R-0012', coupled_task_group: 'CTG-0002a' }),
    );
    const before = await readFile(path);
    await writeTask(
      repoRoot,
      'R-0013',
      'TASK-0001',
      task({ round_id: 'R-0013', coupled_task_group: 'CTG-9001' }),
    );
    const result = normalize(repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CTG-9001.*collision|collision.*CTG-9001/i);
    assert.deepEqual(await readFile(path), before);
  });
});

test('dado doze títulos A3.2 quando normaliza então aplica cada literal editorial sem truncamento', async () => {
  await withFixture(async (repoRoot) => {
    assert.equal(editorialTitles.size, 12);
    const [key, title] = editorialTitles.entries().next().value;
    const [round, id] = key.split('/');
    const path = await writeTask(
      repoRoot,
      round,
      id,
      task({
        id,
        round_id: round,
        title: `${'título legado '.repeat(20)}com ação e objeto preservados`,
      }),
    );
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(await readFile(path)).title, title);
  });
});

test('dado INV externo A3.2 quando normaliza então arquiva como ref sem alegar invariante local', async () => {
  await withFixture(async (repoRoot) => {
    assert.equal(externalInvariantOccurrences.length, 4);
    assert.deepEqual(
      new Set(externalInvariantOccurrences.map((entry) => entry[1])),
      new Set(['INV-EVIDENCE-001', 'INV-OFFLINE-001']),
    );
    const path = await writeTask(
      repoRoot,
      'R-0005',
      'TASK-0002',
      task({
        id: 'TASK-0002',
        round_id: 'R-0005',
        target_invariants: ['INV-EVIDENCE-001'],
      }),
    );
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(await readFile(path));
    assert.deepEqual(canonical.target_invariants, []);
    assert.ok(canonical.tags.includes('ref:INV-EVIDENCE-001'));
    assert.ok(!canonical.tags.includes('INV-EVIDENCE-001'));
  });
});

test('dado executor.note autorizado quando normaliza então remove só a nota e preserva contrato executor no sidecar', async () => {
  await withFixture(async (repoRoot) => {
    assert.deepEqual(executorNotePaths, [
      'R-0014/TASK-0010',
      'R-0014/TASK-0011',
      'R-0014/TASK-0012',
      'R-0014/TASK-0022',
    ]);
    const originalExecutor = {
      ...task().executor,
      note: 'AUTHORIZATION.md Amendment 2 / plano B3',
    };
    const path = await writeTask(
      repoRoot,
      'R-0014',
      'TASK-0010',
      task({ id: 'TASK-0010', round_id: 'R-0014', executor: originalExecutor }),
    );
    const before = await readFile(path);
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(await readFile(path));
    assert.equal(canonical.executor.note, undefined);
    assert.deepEqual(
      { ...canonical.executor, note: originalExecutor.note },
      originalExecutor,
    );
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0014/tasks/_legacy-originals/TASK-0010.json.raw',
        ),
      ),
      before,
    );
  });
});

test('dado EV e REC A3.2 quando normaliza então arquiva sete REC e trinta e um EV sem fabricar evidência', async () => {
  await withFixture(async (repoRoot) => {
    assert.equal(executionEvidencePaths.length, 31);
    assert.equal(closureReconciliationPaths.length, 7);
    assert.equal(archivalEvidencePaths.length, 31);
    const originals = new Map();
    for (const id of archivalEvidencePaths) {
      const path = await writeTask(
        repoRoot,
        'R-0007',
        id,
        task({
          id,
          round_id: 'R-0007',
          ...(executionEvidencePaths.includes(id)
            ? { execution_evidence: { outcome: `legacy ${id}` } }
            : {}),
          ...(closureReconciliationPaths.includes(id)
            ? { closure_reconciliation: { record: `legacy ${id}` } }
            : {}),
        }),
      );
      originals.set(id, await readFile(path));
    }
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const beforeAfter = JSON.parse(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0020/reports/A3-migration-before-after.json',
        ),
      ),
    );
    for (const id of archivalEvidencePaths) {
      const canonical = JSON.parse(
        await readFile(
          join(repoRoot, 'work/rounds/R-0007/tasks', `${id}.json`),
        ),
      );
      if (executionEvidencePaths.includes(id))
        assert.equal(canonical.execution_evidence, undefined);
      assert.equal(canonical.evidence_refs, undefined);
      if (closureReconciliationPaths.includes(id))
        assert.equal(canonical.closure_reconciliation, undefined);
      const sidecar = await readFile(
        join(
          repoRoot,
          'work/rounds/R-0007/tasks/_legacy-originals',
          `${id}.json.raw`,
        ),
      );
      assert.deepEqual(sidecar, originals.get(id));
      assert.ok(canonical.tags.includes(`legacy-sha256:${digest(sidecar)}`));
      const migration = beforeAfter.migrations.find(
        (entry) =>
          entry.round_id === 'R-0007' &&
          entry.canonical_path === `tasks/${id}.json`,
      );
      assert.equal(migration.original_sha256, digest(sidecar));
      assert.ok(
        migration.transformed_fields.includes(
          executionEvidencePaths.includes(id)
            ? 'execution_evidence'
            : 'closure_reconciliation',
        ),
      );
    }
  });
});

test('dado onze PCs A3.2 guardados quando normaliza então produz índice separado e projeções prospectivas fiéis', async () => {
  await withFixture(async (repoRoot) => {
    assert.equal(prospectivePc.length, 6);
    assert.equal(retainedPc.length, 5);
    assert.equal(new Set(prospectivePc.map((entry) => entry[1])).size, 6);
    const originals = new Map();
    const prompts = new Map();
    const bridges = new Map();
    for (const [id] of prospectivePc) {
      const path = join(repoRoot, 'work/rounds/R-0007/tasks', `${id}.json`);
      const bytes = await originalPcTaskBytes(id);
      await mkdir(join(path, '..'), { recursive: true });
      await writeFile(path, bytes);
      originals.set(id, bytes);
      const promptPath = join(
        repoRoot,
        'work/rounds/R-0007/prompts',
        `${id}.md`,
      );
      const prompt = await readFile(
        join(repositoryRoot, 'work/rounds/R-0007/prompts', `${id}.md`),
      );
      await mkdir(join(promptPath, '..'), { recursive: true });
      await writeFile(promptPath, prompt);
      prompts.set(id, { path: promptPath, bytes: prompt });
    }
    for (const [id] of retainedPc) {
      const path = join(repoRoot, 'work/rounds/R-0007/tasks', `${id}.json`);
      const bytes = await originalPcTaskBytes(id);
      await mkdir(join(path, '..'), { recursive: true });
      await writeFile(path, bytes);
      originals.set(id, bytes);
      const bridgeName = new Map([
        ['TASK-0078', 'ctg-0002-final.bridge.json'],
        ['TASK-0080', 'ctg-0002-final-2.bridge.json'],
        ['TASK-0082', 'ctg-0002-final-3.bridge.json'],
      ]).get(id);
      if (bridgeName) {
        const bridgePath = join(
          repoRoot,
          'work/rounds/R-0007/reviews/attempt-2',
          bridgeName,
        );
        const bridge = await readFile(
          join(
            repositoryRoot,
            'work/rounds/R-0007/reviews/attempt-2',
            bridgeName,
          ),
        );
        await mkdir(join(bridgePath, '..'), { recursive: true });
        await writeFile(bridgePath, bridge);
        bridges.set(id, { path: bridgePath, bytes: bridge });
      }
    }
    await copyA31Allowlist(repoRoot);
    await copyTrace(repoRoot);
    await copyR0007Plan(repoRoot);
    await writePcGuardManifest(repoRoot, prompts, originals);
    const preMigration = verifyArchivalGuard(repoRoot);
    assert.equal(preMigration.status, 0, preMigration.stderr);
    assert.match(preMigration.stdout, /pre-migration/);
    const result = normalize(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const index = JSON.parse(
      await readFile(
        join(repoRoot, 'work/rounds/R-0007/compositions-archive/index.json'),
      ),
    );
    assert.equal(index.entries.length, 11);
    for (const entry of index.entries) {
      assert.equal(entry.historical_equivalence, false);
      assert.equal(
        entry.original_task_sha256,
        digest(originals.get(entry.task_id)),
      );
      const packageBytes = await readFile(join(repoRoot, entry.path));
      assert.equal(entry.raw_sha256, digest(packageBytes));
      assert.equal(
        entry.prompt_composition_id,
        `PC-${entry.raw_sha256.slice(0, 16)}`,
      );
      assert.equal(
        entry.prompt_composition_id,
        expectedPcCandidates.get(entry.task_id),
      );
      assert.equal(
        packageFields(packageBytes).get('historical_equivalence'),
        'false',
      );
      if (prompts.has(entry.task_id)) {
        const prompt = prompts.get(entry.task_id);
        assert.equal(entry.source.kind, 'task-prompt');
        assert.equal(entry.source.sha256, digest(prompt.bytes));
        assert.equal(entry.source.path, prompt.path.slice(repoRoot.length + 1));
      } else {
        assert.equal(entry.source.kind, 'task-json');
        assert.equal(entry.source.sha256, digest(originals.get(entry.task_id)));
      }
      const bridge = bridges.get(entry.task_id);
      if (bridge) {
        assert.equal(entry.review_bridge.sha256, digest(bridge.bytes));
        assert.equal(
          entry.review_bridge.path,
          bridge.path.slice(repoRoot.length + 1),
        );
      } else assert.equal(entry.review_bridge, null);
      const canonical = JSON.parse(
        await readFile(
          join(
            repoRoot,
            'work/rounds/R-0007/tasks',
            `${entry.canonical_task_id}.json`,
          ),
        ),
      );
      assert.equal(
        canonical.prompt_composition_id,
        entry.prompt_composition_id,
      );
      assert.equal(
        canonical.executor.prompt_composition_id,
        entry.prompt_composition_id,
      );
      assert.ok(['completed', 'checkpoint'].includes(canonical.status));
      assert.ok(!['queued', 'ready', 'lock_denied'].includes(canonical.status));
      const historical = retainedPc.find(([id]) => id === entry.task_id);
      if (historical)
        assert.ok(
          canonical.tags.includes(`legacy-prompt-composition:${historical[2]}`),
        );
      const sidecar = await readFile(
        join(
          repoRoot,
          'work/rounds/R-0007/tasks/_legacy-originals',
          `${entry.task_id}.json.raw`,
        ),
      );
      assert.deepEqual(sidecar, originals.get(entry.task_id));
      assert.equal(entry.original_task_sha256, digest(sidecar));
    }
    for (const [legacy, canonical] of prospectivePc)
      assert.equal(
        index.entries.find((entry) => entry.task_id === legacy)
          .canonical_task_id,
        canonical,
      );
    const guard = verifyArchivalGuard(repoRoot);
    assert.equal(guard.status, 0, guard.stderr);
    assert.match(guard.stdout, /applied/);
  });
});

test('dado PCs arquivísticos sem manifesto A3.5 quando normaliza então falha sem escrita', async () => {
  await withFixture(async (repoRoot) => {
    const id = 'TASK-0004-S1';
    const path = join(repoRoot, 'work/rounds/R-0007/tasks', `${id}.json`);
    const source = await originalPcTaskBytes(id);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, source);
    const promptPath = join(repoRoot, 'work/rounds/R-0007/prompts', `${id}.md`);
    await mkdir(join(promptPath, '..'), { recursive: true });
    await writeFile(
      promptPath,
      await readFile(
        join(repositoryRoot, 'work/rounds/R-0007/prompts', `${id}.md`),
      ),
    );
    const before = await readFile(path);
    const promptBefore = await readFile(promptPath);
    await copyA31Allowlist(repoRoot);
    await copyTrace(repoRoot);
    const result = normalize(repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /A3\.5.*manifest|manifest.*A3\.5/i);
    assert.deepEqual(await readFile(path), before);
    assert.deepEqual(await readFile(promptPath), promptBefore);
    await assert.rejects(
      readFile(
        join(
          repoRoot,
          'work/rounds/R-0007/tasks/_legacy-originals/TASK-0004-S1.json.raw',
        ),
      ),
    );
    await assert.rejects(
      readFile(
        join(repoRoot, 'work/rounds/R-0007/compositions-archive/index.json'),
      ),
    );
  });
});

test('dado outra classe source_pending quando normaliza então preserva JSON integral e não deixa mutação parcial', async () => {
  await withFixture(async (repoRoot) => {
    const path = await writeTask(
      repoRoot,
      'R-0003',
      'TASK-0001',
      task({ coupled_task_group: 'CTG-0002a', db_isolation: 'none' }),
    );
    const before = await readFile(path);
    const result = normalize(repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /source_pending/);
    assert.deepEqual(await readFile(path), before);
  });
});
