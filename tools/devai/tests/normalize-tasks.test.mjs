import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const normalizer = join(repositoryRoot, 'tools/devai/normalize-tasks.mjs');
const originalsVerifier = join(
  repositoryRoot,
  'tools/devai/verify-task-originals.mjs',
);

function validTask(overrides = {}) {
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
    ...overrides,
  };
}

function normalize(repoRoot) {
  return spawnSync(process.execPath, [normalizer, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

function verifyTaskOriginals(repoRoot) {
  return spawnSync(
    process.execPath,
    [originalsVerifier, '--repo-root', repoRoot],
    {
      encoding: 'utf8',
    },
  );
}

async function writeTask(repoRoot, task) {
  return writeTaskAt(repoRoot, 'R-0003', 'TASK-0001.json', task);
}

async function writeTaskAt(repoRoot, roundId, fileName, task) {
  const taskDirectory = join(repoRoot, 'work/rounds', roundId, 'tasks');
  await mkdir(taskDirectory, { recursive: true });
  const taskPath = join(taskDirectory, fileName);
  await writeFile(taskPath, `${JSON.stringify(task, null, 2)}\n`);
  return taskPath;
}

async function writeA31Allowlist(repoRoot, path, originalBytes) {
  const contractDirectory = join(repoRoot, 'work/rounds/R-0020/contracts');
  await mkdir(contractDirectory, { recursive: true });
  const entries = [
    {
      path,
      original_sha256: createHash('sha256').update(originalBytes).digest('hex'),
    },
  ];
  const canonicalDigest = createHash('sha256')
    .update(
      entries
        .toSorted((left, right) => left.path.localeCompare(right.path))
        .map((entry) => `${entry.path}\t${entry.original_sha256}\n`)
        .join(''),
    )
    .digest('hex');
  await writeFile(
    join(contractDirectory, 'CTG-0003-A3.1-none-allowlist.json'),
    `${JSON.stringify(
      {
        schemaVersion: '1.0.0',
        round_id: 'R-0020',
        decision: 'A3.1',
        authorization_path:
          'work/rounds/R-0020/AUTHORIZATION-A3.1-2026-09-28.md',
        proposal_sha256:
          '7bde51521e01a6654dbf0da6e67083a802f735313351f268a720050f29c80db5',
        canonical_digest_sha256: canonicalDigest,
        entries,
      },
      null,
      2,
    )}\n`,
  );
}

async function writeHistoricalTask(repoRoot, roundId, taskId) {
  const relativePath = `work/rounds/${roundId}/tasks/${taskId}.json`;
  const original = await historicalTaskBytes(roundId, taskId);
  const destination = join(repoRoot, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, original);
  return { destination, original };
}

async function historicalTaskBytes(roundId, taskId) {
  const direct = join(
    repositoryRoot,
    `work/rounds/${roundId}/tasks/${taskId}.json`,
  );
  const sidecar = join(
    repositoryRoot,
    `work/rounds/${roundId}/tasks/_legacy-originals/${taskId}.json.raw`,
  );
  try {
    const original = await readFile(sidecar);
    const canonical = JSON.parse(await readFile(direct));
    assert.ok(
      canonical.tags.includes(
        `legacy-sha256:${createHash('sha256').update(original).digest('hex')}`,
      ),
      `${roundId}/${taskId} sidecar hash must match canonical link`,
    );
    return original;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return readFile(direct);
  }
}

async function readMigrationReport(repoRoot) {
  return JSON.parse(
    await readFile(
      join(
        repoRoot,
        'work/rounds/R-0020/reports/A3-migration-before-after.json',
      ),
      'utf8',
    ),
  );
}

const archivalTrailTasks = [
  ['R-0003', 'TASK-0001'],
  ['R-0003', 'TASK-0002'],
  ['R-0003', 'TASK-0003'],
  ['R-0006', 'TASK-0001'],
  ['R-0006', 'TASK-0008'],
  ['R-0006', 'TASK-0012'],
  ['R-0006', 'TASK-0014'],
  ['R-0009', 'TASK-0003'],
  ['R-0009', 'TASK-0006'],
];

test('dado nove iteration_trail legados da tabela quando normalizados então arquiva arrays integrais sem inventar started_at ou verdict', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-trails-'));

  try {
    const originals = [];
    for (const [roundId, taskId] of archivalTrailTasks) {
      const historical = JSON.parse(await historicalTaskBytes(roundId, taskId));
      assert.ok(Array.isArray(historical.iteration_trail));
      const taskPath = await writeTaskAt(
        repoRoot,
        roundId,
        `${taskId}.json`,
        validTask({
          id: taskId,
          round_id: roundId,
          iteration_trail: historical.iteration_trail,
        }),
      );
      originals.push({
        roundId,
        taskId,
        taskPath,
        original: await readFile(taskPath),
        trail: historical.iteration_trail,
      });
    }

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    for (const { roundId, taskId, taskPath, original, trail } of originals) {
      const canonical = JSON.parse(await readFile(taskPath, 'utf8'));
      assert.equal(Object.hasOwn(canonical, 'iteration_trail'), false);
      assert.equal(Object.hasOwn(canonical, 'started_at'), false);
      assert.equal(Object.hasOwn(canonical, 'verdict'), false);
      const sidecar = await readFile(
        join(
          repoRoot,
          `work/rounds/${roundId}/tasks/_legacy-originals/${taskId}.json.raw`,
        ),
      );
      assert.deepEqual(sidecar, original);
      assert.deepEqual(JSON.parse(sidecar).iteration_trail, trail);
    }
    const report = await readMigrationReport(repoRoot);
    for (const { roundId, taskId, trail } of originals) {
      const entry = report.migrations.find(
        (migration) =>
          migration.round_id === roundId && migration.old_id === taskId,
      );
      assert.ok(entry, `${roundId}/${taskId} absent from before/after`);
      assert.ok(entry.sidecar_only_fields.includes('iteration_trail'));
      assert.deepEqual(
        entry.field_sources.find((field) => field.field === 'iteration_trail')
          ?.historical_value,
        trail,
      );
      assert.equal(
        entry.field_sources.find((field) => field.field === 'iteration_trail')
          ?.canonical_value,
        null,
      );
    }
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado iteration_trail já válido em R-0003 TASK-0001 quando normalizado então preserva bytes sem arquivamento', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-normalize-trail-valid-'),
  );
  const trail = [
    {
      iteration: 1,
      started_at: '2026-09-28T00:00:00.000Z',
      verdict: 'PASS',
    },
  ];

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0001.json',
      validTask({ iteration_trail: trail }),
    );
    const before = await readFile(taskPath);

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readFile(taskPath), before);
    assert.deepEqual(
      JSON.parse(await readFile(taskPath)).iteration_trail,
      trail,
    );
    await assert.rejects(
      readFile(
        join(
          repoRoot,
          'work/rounds/R-0003/tasks/_legacy-originals/TASK-0001.json.raw',
        ),
      ),
      { code: 'ENOENT' },
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado R-0006 TASK-0003 escalada sem índice T1 quando normalizada então preserva caso especial pendente', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-trail-t1-'));

  try {
    const { destination, original } = await writeHistoricalTask(
      repoRoot,
      'R-0006',
      'TASK-0003',
    );

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /T1|escalation/i);
    assert.deepEqual(await readFile(destination), original);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado iteration_trail legado fora dos nove caminhos autorizados quando normalizado então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-trail-'));

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0011',
      'TASK-0001.json',
      validTask({
        round_id: 'R-0011',
        iteration_trail: [{ iteration: 2, reason: 'legado sem fonte A3' }],
      }),
    );
    const before = await readFile(taskPath);

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /source_pending/);
    assert.match(result.stderr, /iteration_trail/);
    assert.deepEqual(await readFile(taskPath), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

for (const roundId of ['R-0012', 'R-0016']) {
  test(`dado ${roundId} TASK-0001 com upstream vazio e hash histórico quando normalizada então projeta null e preserva literal`, async () => {
    const repoRoot = await mkdtemp(
      join(tmpdir(), 'detran-normalize-upstream-'),
    );
    const path = `work/rounds/${roundId}/tasks/TASK-0001.json`;

    try {
      const { destination, original } = await writeHistoricalTask(
        repoRoot,
        roundId,
        'TASK-0001',
      );
      const allowed = JSON.parse(
        await readFile(
          join(
            repositoryRoot,
            'work/rounds/R-0020/contracts/CTG-0003-A3.1-none-allowlist.json',
          ),
          'utf8',
        ),
      );
      assert.equal(
        allowed.entries.find((entry) => entry.path === path)?.original_sha256,
        createHash('sha256').update(original).digest('hex'),
      );
      await writeA31Allowlist(repoRoot, path, original);

      const result = normalize(repoRoot);

      assert.equal(result.status, 0, result.stderr);
      const canonical = JSON.parse(await readFile(destination, 'utf8'));
      assert.equal(canonical.upstream_task_id, null);
      assert.ok(canonical.tags.includes('legacy-upstream-empty'));
      const sidecar = await readFile(
        join(
          repoRoot,
          `work/rounds/${roundId}/tasks/_legacy-originals/TASK-0001.json.raw`,
        ),
      );
      assert.deepEqual(sidecar, original);
      assert.equal(JSON.parse(sidecar).upstream_task_id, '');
      const report = await readMigrationReport(repoRoot);
      const entry = report.migrations.find(
        (migration) => migration.round_id === roundId,
      );
      assert.equal(
        entry.field_sources.find((field) => field.field === 'upstream_task_id')
          ?.historical_value,
        '',
      );
      assert.equal(
        entry.field_sources.find((field) => field.field === 'upstream_task_id')
          ?.canonical_value,
        null,
      );
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
}

for (const [roundId, label] of [
  ['R-0011', 'arquivo alheio'],
  ['R-0012', 'hash alheio no path autorizado'],
]) {
  test(`dado upstream vazio em ${label} quando normalizado então falha sem projetar null`, async () => {
    const repoRoot = await mkdtemp(
      join(tmpdir(), 'detran-normalize-upstream-'),
    );
    try {
      const taskPath = await writeTaskAt(
        repoRoot,
        roundId,
        'TASK-0001.json',
        validTask({ round_id: roundId, upstream_task_id: '' }),
      );
      const before = await readFile(taskPath);

      const result = normalize(repoRoot);

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /upstream_task_id|source_pending/i);
      assert.deepEqual(await readFile(taskPath), before);
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });
}

test('dado tarefa válida quando normalizada duas vezes então preserva executor, composição e bytes', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const task = validTask({ tags: ['ref:WF-RAIT-001'] });
    const taskPath = await writeTask(repoRoot, task);

    const first = normalize(repoRoot);
    assert.equal(first.status, 0, first.stderr);
    const afterFirstRun = await readFile(taskPath, 'utf8');

    const second = normalize(repoRoot);
    assert.equal(second.status, 0, second.stderr);
    const afterSecondRun = await readFile(taskPath, 'utf8');

    assert.equal(afterSecondRun, afterFirstRun);
    assert.match(afterSecondRun, /TASK-0001/);
    assert.match(afterSecondRun, /ref:WF-RAIT-001/);
    const normalized = JSON.parse(afterSecondRun);
    assert.deepEqual(normalized.executor, task.executor);
    assert.equal(normalized.prompt_composition_id, task.prompt_composition_id);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado ref não INV em target_invariants quando normalizada então move a ref para tags sem perdê-la', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const taskPath = await writeTask(
      repoRoot,
      validTask({ target_invariants: ['WF-RAIT-001'], tags: ['round:R-0003'] }),
    );
    const originalBytes = await readFile(taskPath);

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    const normalized = JSON.parse(await readFile(taskPath, 'utf8'));
    assert.deepEqual(normalized.target_invariants, []);
    assert.ok(normalized.tags.includes('round:R-0003'));
    assert.ok(normalized.tags.includes('ref:WF-RAIT-001'));
    assert.ok(
      normalized.tags.includes(
        'legacy-original:tasks/_legacy-originals/TASK-0001.json.raw',
      ),
    );
    assert.ok(
      normalized.tags.includes(
        `legacy-sha256:${createHash('sha256').update(originalBytes).digest('hex')}`,
      ),
    );
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0003/tasks/_legacy-originals/TASK-0001.json.raw',
        ),
      ),
      originalBytes,
    );
    const report = JSON.parse(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0020/reports/A3-migration-before-after.json',
        ),
        'utf8',
      ),
    );
    assert.ok(
      report.migrations.some(
        (entry) =>
          entry.round_id === 'R-0003' &&
          entry.old_path === 'tasks/TASK-0001.json' &&
          entry.canonical_path === 'tasks/TASK-0001.json' &&
          entry.original_sha256 ===
            createHash('sha256').update(originalBytes).digest('hex'),
      ),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado db_isolation legado sem fonte quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const taskPath = await writeTask(
      repoRoot,
      validTask({ db_isolation: 'legacy' }),
    );
    const before = await readFile(taskPath, 'utf8');

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0001\.json/);
    assert.match(result.stderr, /source_pending/);
    assert.equal(await readFile(taskPath, 'utf8'), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado coupled_task_group inválido sem prova quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const taskPath = await writeTask(
      repoRoot,
      validTask({ coupled_task_group: 'legacy-group' }),
    );
    const before = await readFile(taskPath, 'utf8');

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0001\.json/);
    assert.match(result.stderr, /source_pending/);
    assert.equal(await readFile(taskPath, 'utf8'), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado propriedade adicional com bytes estáveis quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const taskPath = await writeTask(
      repoRoot,
      validTask({ execution_evidence: 'EV-0001' }),
    );
    const before = await readFile(taskPath, 'utf8');

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0001\.json/);
    assert.match(result.stderr, /source_pending/);
    assert.equal(await readFile(taskPath, 'utf8'), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado TASK allowlist com none quando normalizada então projeta database e preserva fato histórico no sidecar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const path = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({ id: 'TASK-0002', db_isolation: 'none' }),
    );
    const originalBytes = await readFile(taskPath);
    await writeA31Allowlist(repoRoot, path, originalBytes);

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(await readFile(taskPath, 'utf8'));
    assert.equal(canonical.db_isolation, 'database');
    assert.ok(canonical.tags.includes('legacy-db-isolation:none'));
    assert.ok(canonical.tags.includes('legacy-db-policy:prospective-database'));
    assert.ok(
      canonical.tags.includes(
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
      ),
    );
    assert.ok(
      canonical.tags.includes(
        `legacy-sha256:${createHash('sha256').update(originalBytes).digest('hex')}`,
      ),
    );
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0003/tasks/_legacy-originals/TASK-0002.json.raw',
        ),
      ),
      originalBytes,
    );

    const afterFirstRun = await readFile(taskPath);
    const second = normalize(repoRoot);
    assert.equal(second.status, 0, second.stderr);
    assert.deepEqual(await readFile(taskPath), afterFirstRun);
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          'work/rounds/R-0003/tasks/_legacy-originals/TASK-0002.json.raw',
        ),
      ),
      originalBytes,
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado hash allowlist divergente quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const path = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({ id: 'TASK-0002', db_isolation: 'none' }),
    );
    const before = await readFile(taskPath);
    await writeA31Allowlist(repoRoot, path, Buffer.from('different original'));

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /allowlist|sha256|hash/i);
    assert.match(result.stderr, /source_pending/);
    assert.deepEqual(await readFile(taskPath), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado sidecar corrompido quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const path = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({ id: 'TASK-0002', db_isolation: 'none' }),
    );
    const before = await readFile(taskPath);
    await writeA31Allowlist(repoRoot, path, before);
    const sidecarDirectory = join(
      repoRoot,
      'work/rounds/R-0003/tasks/_legacy-originals',
    );
    await mkdir(sidecarDirectory, { recursive: true });
    await writeFile(join(sidecarDirectory, 'TASK-0002.json.raw'), 'corrupted');

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /sidecar|sha256|hash/i);
    assert.match(result.stderr, /source_pending/);
    assert.deepEqual(await readFile(taskPath), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado TASK fora da allowlist quando normalizada então relata source_pending sem mutar', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0003.json',
      validTask({ id: 'TASK-0003', db_isolation: 'none' }),
    );
    const before = await readFile(taskPath);
    await writeA31Allowlist(
      repoRoot,
      'work/rounds/R-0003/tasks/TASK-0002.json',
      Buffer.from('another original'),
    );

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0003\.json/);
    assert.match(result.stderr, /allowlist/i);
    assert.match(result.stderr, /source_pending/);
    assert.deepEqual(await readFile(taskPath), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado TASK allowlisted com classe A3.2 pendente quando normalizada então não aplica projeção parcial', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const path = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({
        id: 'TASK-0002',
        db_isolation: 'none',
        coupled_task_group: 'CTG-0001a',
      }),
    );
    const before = await readFile(taskPath);
    await writeA31Allowlist(repoRoot, path, before);

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /source_pending/);
    assert.match(result.stderr, /coupled_task_group|A3\.2/i);
    assert.deepEqual(await readFile(taskPath), before);
    await assert.rejects(
      readFile(
        join(
          repoRoot,
          'work/rounds/R-0003/tasks/_legacy-originals/TASK-0002.json.raw',
        ),
      ),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado allowlist correta mas literal diferente de none quando normalizada então não aplica A3.1', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const path = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const taskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({ id: 'TASK-0002', db_isolation: 'cluster' }),
    );
    const before = await readFile(taskPath);
    await writeA31Allowlist(repoRoot, path, before);

    const result = normalize(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /none|allowlist|A3\.1/i);
    assert.match(result.stderr, /source_pending/);
    assert.deepEqual(await readFile(taskPath), before);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado lote com sidecar persistido e outra TASK pendente quando normalizada então não deixa substituição sem original', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const allowedPath = 'work/rounds/R-0003/tasks/TASK-0002.json';

  try {
    const allowedTaskPath = await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0002.json',
      validTask({ id: 'TASK-0002', db_isolation: 'none' }),
    );
    const allowedBefore = await readFile(allowedTaskPath);
    await writeTaskAt(
      repoRoot,
      'R-0003',
      'TASK-0003.json',
      validTask({ id: 'TASK-0003', db_isolation: 'legacy' }),
    );
    await writeA31Allowlist(repoRoot, allowedPath, allowedBefore);

    const result = normalize(repoRoot);
    const allowedAfter = await readFile(allowedTaskPath);

    assert.notEqual(result.status, 0);
    if (!allowedAfter.equals(allowedBefore)) {
      assert.deepEqual(
        await readFile(
          join(
            repoRoot,
            'work/rounds/R-0003/tasks/_legacy-originals/TASK-0002.json.raw',
          ),
        ),
        allowedBefore,
      );
    }
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado estado parcial canônico sem relatório quando normalizada então retoma sem reescrever bytes', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-tasks-'));
  const rawBytes = Buffer.from(
    `${JSON.stringify(validTask({ db_isolation: 'none' }), null, 2)}\n`,
  );

  try {
    const taskPath = await writeTask(
      repoRoot,
      validTask({
        db_isolation: 'database',
        tags: [
          'legacy-original:tasks/_legacy-originals/TASK-0001.json.raw',
          `legacy-sha256:${createHash('sha256').update(rawBytes).digest('hex')}`,
        ],
      }),
    );
    const sidecarPath = join(
      repoRoot,
      'work/rounds/R-0003/tasks/_legacy-originals/TASK-0001.json.raw',
    );
    await mkdir(join(sidecarPath, '..'), { recursive: true });
    await writeFile(sidecarPath, rawBytes);
    const canonicalBefore = await readFile(taskPath);
    const sidecarBefore = await readFile(sidecarPath);

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readFile(taskPath), canonicalBefore);
    assert.deepEqual(await readFile(sidecarPath), sidecarBefore);
    await readFile(
      join(
        repoRoot,
        'work/rounds/R-0020/reports/A3-migration-before-after.json',
      ),
      'utf8',
    );
    const verification = verifyTaskOriginals(repoRoot);
    assert.equal(verification.status, 0, verification.stderr);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

async function writeA34NormalizationFixture(repoRoot) {
  const definitions = [
    {
      roundId: 'R-0003',
      taskId: 'TASK-0004',
      historicalDiscipline: 'owner-delegated',
      promptRole: 'Owner (delegado)',
      evidenceRole: null,
      paths: [
        'apps/dashboard/web/README.md',
        'docs/framework/arch/dashboard-build-pack.md',
        'docs/meta/knowledge-base/decision-closure-plan.md',
        'docs/meta/knowledge-base/backlog.md',
      ],
    },
    {
      roundId: 'R-0005',
      taskId: 'TASK-0009',
      historicalDiscipline: 'transcriber',
      promptRole: 'Owner delegado',
      evidenceRole: 'engineer',
      paths: [
        'backend/domains/ops/README.md',
        'docs/framework/arch/teat-build-pack.md',
        'docs/framework/blueprints/README.md',
        'docs/meta/knowledge-base/decision-closure-plan.md',
        'docs/meta/knowledge-base/backlog.md',
        'docs/framework/arch/teat-route-contract.md',
      ],
    },
  ];
  const entries = [];
  for (const definition of definitions) {
    const { roundId, taskId, historicalDiscipline, promptRole, evidenceRole } =
      definition;
    const task = validTask({
      id: taskId,
      round_id: roundId,
      status: 'completed',
      discipline: historicalDiscipline,
      target_substrates: ['F2'],
    });
    const taskPath = await writeTaskAt(
      repoRoot,
      roundId,
      `${taskId}.json`,
      task,
    );
    const original = await readFile(taskPath);
    const promptPath = `work/rounds/${roundId}/prompts/${taskId}.md`;
    const prompt = `Papel constitucional: ${promptRole}.\n`;
    await mkdir(dirname(join(repoRoot, promptPath)), { recursive: true });
    await writeFile(join(repoRoot, promptPath), prompt);
    const paths = [];
    for (const path of definition.paths) {
      const receipt = Buffer.from(`${roundId}/${taskId}/${path}\n`);
      await mkdir(dirname(join(repoRoot, path)), { recursive: true });
      await writeFile(join(repoRoot, path), receipt);
      paths.push({
        path,
        prospective_class: path.startsWith('docs/') ? 'F1' : 'F2',
        prospective_role: path.startsWith('docs/') ? 'architect' : 'engineer',
        basis: path.startsWith('docs/')
          ? 'constitution-art-6-docs'
          : 'Owner Q6: local implementation README',
        historical_write_receipt:
          roundId === 'R-0005'
            ? 'work/rounds/R-0005/evidence-TASK-0009.json'
            : createHash('sha256')
                .update('synthetic R-0003 historical commit')
                .digest('hex')
                .slice(0, 40),
        receipt_kind:
          roundId === 'R-0005'
            ? 'task-evidence-artifact'
            : 'git-commit-postimage',
        receipt_artifact_sha256: createHash('sha256')
          .update(receipt)
          .digest('hex'),
      });
    }
    let evidencePath;
    let evidence;
    if (evidenceRole) {
      evidencePath = 'work/rounds/R-0005/evidence-TASK-0009.json';
      evidence = Buffer.from(
        `${JSON.stringify(
          {
            role: evidenceRole,
            artifacts: paths.map((path) => ({
              path: path.path,
              sha256: path.receipt_artifact_sha256,
            })),
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(join(repoRoot, evidencePath), evidence);
    }
    entries.push({
      task_path: `work/rounds/${roundId}/tasks/${taskId}.json`,
      original_task_sha256: createHash('sha256').update(original).digest('hex'),
      projected_discipline: 'owner',
      required_tags: [
        'authority-enforcement:pending',
        'historical-write-authority:unclassified-at-write',
        `historical-authority-discrepancy:${roundId}-${taskId}`,
      ],
      historical_literals: {
        task_discipline: historicalDiscipline,
        prompt_role: promptRole,
        evidence_role: evidenceRole,
      },
      prompt_path: promptPath,
      prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
      ...(evidencePath
        ? {
            evidence_path: evidencePath,
            evidence_sha256: createHash('sha256')
              .update(evidence)
              .digest('hex'),
          }
        : {}),
      paths,
    });
  }
  const policyPath = '.devai/config/authority-policy.json';
  const policy = Buffer.from('{"authority":[]}\n');
  await mkdir(dirname(join(repoRoot, policyPath)), { recursive: true });
  await writeFile(join(repoRoot, policyPath), policy);
  const policySha256 = createHash('sha256').update(policy).digest('hex');
  for (const entry of entries)
    entry.historical_policy_at_write = {
      git_commit: createHash('sha256')
        .update(`synthetic ${entry.task_path} historical policy commit`)
        .digest('hex')
        .slice(0, 40),
      path: policyPath,
      sha256: policySha256,
      apps_backend_grant_count: 0,
    };
  const contracts = join(repoRoot, 'work/rounds/R-0020/contracts');
  await mkdir(contracts, { recursive: true });
  await writeFile(
    join(contracts, 'CTG-0003-A3.4-role-matrix.json'),
    `${JSON.stringify(
      {
        schemaVersion: '1.0.0',
        round_id: 'R-0020',
        status: 'applied',
        prospective_decision:
          'work/rounds/R-0020/AUTHORIZATION-A3.3-PATHS-2026-09-28.md',
        prospective_enforcement: 'pending',
        historical_write_authority: 'unclassified-at-write',
        entries,
      },
      null,
      2,
    )}\n`,
  );
}

test('dado matriz R1 aplicada quando normaliza as duas TASKs concluídas então projeta owner sem tocar policy, despacho ou raízes protegidas', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-a34-'));
  const protectedFiles = [
    'apps/dashboard/web/README.md',
    'backend/domains/ops/README.md',
    'docs/framework/arch/dashboard-build-pack.md',
    'law/constitution.md',
    '.devai/config/authority-policy.json',
    '.devai/state/backlog.jsonl',
  ];
  try {
    await writeA34NormalizationFixture(repoRoot);
    for (const path of ['law/constitution.md', '.devai/state/backlog.jsonl']) {
      await mkdir(dirname(join(repoRoot, path)), { recursive: true });
      await writeFile(join(repoRoot, path), `protected ${path}\n`);
    }
    const before = await Promise.all(
      protectedFiles.map((path) => readFile(join(repoRoot, path))),
    );

    const result = normalize(repoRoot);

    assert.equal(result.status, 0, result.stderr);
    for (const [index, path] of protectedFiles.entries())
      assert.deepEqual(await readFile(join(repoRoot, path)), before[index]);
    for (const [roundId, taskId] of [
      ['R-0003', 'TASK-0004'],
      ['R-0005', 'TASK-0009'],
    ]) {
      const task = JSON.parse(
        await readFile(
          join(repoRoot, 'work/rounds', roundId, 'tasks', `${taskId}.json`),
          'utf8',
        ),
      );
      assert.equal(task.discipline, 'owner');
      assert.deepEqual(
        task.tags.filter(
          (tag) =>
            tag.startsWith('historical-') || tag.startsWith('authority-'),
        ),
        [
          'authority-enforcement:pending',
          'historical-write-authority:unclassified-at-write',
          `historical-authority-discrepancy:${roundId}-${taskId}`,
        ],
      );
    }
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
