import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const verifier = join(repositoryRoot, 'tools/devai/verify-task-originals.mjs');

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function canonicalTask(overrides = {}) {
  return {
    schemaVersion: '2.0.0',
    id: 'TASK-0002',
    round_id: 'R-0003',
    status: 'queued',
    discipline: 'inspector',
    title: 'Testar vínculo arquivístico',
    target_modules: ['MOD-devai'],
    target_substrates: ['F1'],
    created_at: '2026-09-28T00:00:00.000Z',
    db_isolation: 'database',
    iteration_count: 0,
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

function verify(repoRoot) {
  return spawnSync(process.execPath, [verifier, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

async function writeLinkedTask(
  repoRoot,
  { rawBytes, tags, task = canonicalTask(), writeMigrationReport = true },
) {
  const tasksDirectory = join(repoRoot, 'work/rounds/R-0003/tasks');
  const sidecarDirectory = join(tasksDirectory, '_legacy-originals');
  await mkdir(sidecarDirectory, { recursive: true });
  await writeFile(join(sidecarDirectory, 'TASK-0002.json.raw'), rawBytes);
  await writeFile(
    join(tasksDirectory, 'TASK-0002.json'),
    `${JSON.stringify({ ...task, tags }, null, 2)}\n`,
  );
  if (writeMigrationReport) {
    const canonicalPath = join(tasksDirectory, 'TASK-0002.json');
    const canonicalBytes = await readFile(canonicalPath);
    const reportsDirectory = join(repoRoot, 'work/rounds/R-0020/reports');
    await mkdir(reportsDirectory, { recursive: true });
    await writeFile(
      join(reportsDirectory, 'A3-migration-before-after.json'),
      `${JSON.stringify(
        {
          schemaVersion: '1.0.0',
          migrations: [
            {
              round_id: 'R-0003',
              old_id: 'TASK-0002',
              new_id: task.id,
              old_path: 'tasks/TASK-0002.json',
              canonical_path: 'tasks/TASK-0002.json',
              sidecar_path: 'tasks/_legacy-originals/TASK-0002.json.raw',
              original_sha256: sha256(rawBytes),
              original_bytes: rawBytes.length,
              canonical_sha256: sha256(canonicalBytes),
              canonical_bytes: canonicalBytes.length,
              transformed_fields: ['db_isolation'],
              decision: 'A3.1',
              schema_status: 'pass',
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
  }
}

test('dado sidecar e tags coerentes quando verifica originais então aceita o vínculo', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from(
    '{"id":"TASK-0002","round_id":"R-0003","db_isolation":"none"}\n',
  );

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
    });

    const result = verify(repoRoot);

    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado vínculo sem relatório antes depois quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0002"}\n');

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
      writeMigrationReport: false,
    });

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /report|before.after|migration/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado bytes de sidecar corrompidos quando verifica originais então falha com o caminho', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const expectedBytes = Buffer.from('{"id":"TASK-0002"}\n');

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes: Buffer.from('corrupted'),
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(expectedBytes)}`,
      ],
    });

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /sha256|hash/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado caminho de sidecar que escapa do repositório quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0002"}\n');

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:../../outside.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
    });

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /escape|outside|path/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado alias divergente quando verifica originais então falha com o arquivo canônico', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0004-S1","round_id":"R-0007"}\n');
  const tasksDirectory = join(repoRoot, 'work/rounds/R-0007/tasks');
  const sidecarDirectory = join(tasksDirectory, '_legacy-originals');

  try {
    await mkdir(sidecarDirectory, { recursive: true });
    await writeFile(join(sidecarDirectory, 'TASK-0004-S1.json.raw'), rawBytes);
    await writeFile(
      join(tasksDirectory, 'TASK-0083.json'),
      `${JSON.stringify(
        canonicalTask({
          id: 'TASK-0083',
          round_id: 'R-0007',
          tags: [
            'legacy-original:tasks/_legacy-originals/TASK-0004-S1.json.raw',
            `legacy-sha256:${sha256(rawBytes)}`,
          ],
        }),
        null,
        2,
      )}\n`,
    );
    await writeFile(
      join(sidecarDirectory, 'aliases.json'),
      `${JSON.stringify(
        [
          {
            round_id: 'R-0007',
            old_id: 'TASK-0004-S1',
            new_id: 'TASK-0084',
            old_path: 'tasks/TASK-0004-S1.json',
            canonical_path: 'tasks/TASK-0083.json',
            sidecar_path: 'tasks/_legacy-originals/TASK-0004-S1.json.raw',
            original_sha256: sha256(rawBytes),
          },
        ],
        null,
        2,
      )}\n`,
    );

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0083\.json/);
    assert.match(result.stderr, /alias/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado sidecar ausente e par de tags duplicado quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0002"}\n');
  const sidecarPath = join(
    repoRoot,
    'work/rounds/R-0003/tasks/_legacy-originals/TASK-0002.json.raw',
  );

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
    });
    await rm(sidecarPath);

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /sidecar|tag|pair/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado sidecar órfão quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );

  try {
    const sidecarDirectory = join(
      repoRoot,
      'work/rounds/R-0003/tasks/_legacy-originals',
    );
    await mkdir(sidecarDirectory, { recursive: true });
    await writeFile(join(sidecarDirectory, 'TASK-0002.json.raw'), 'orphan');

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /orphan|sidecar/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado dois aliases para o mesmo ID quando verifica originais então rejeita a colisão', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const tasksDirectory = join(repoRoot, 'work/rounds/R-0007/tasks');
  const sidecarDirectory = join(tasksDirectory, '_legacy-originals');

  try {
    await mkdir(sidecarDirectory, { recursive: true });
    await writeFile(
      join(sidecarDirectory, 'aliases.json'),
      `${JSON.stringify(
        [
          { old_id: 'TASK-0004-S1', new_id: 'TASK-0083' },
          { old_id: 'TASK-0004-S2', new_id: 'TASK-0083' },
        ],
        null,
        2,
      )}\n`,
    );

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /alias|collision|TASK-0083/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado ID ou round_id original divergente sem alias quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0003","round_id":"R-0004"}\n');

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
    });

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json/);
    assert.match(result.stderr, /id|round_id|identity/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test('dado relatório com outra rodada e caminho relativo igual quando verifica originais então falha fechada', async () => {
  const repoRoot = await mkdtemp(
    join(tmpdir(), 'detran-verify-task-originals-'),
  );
  const rawBytes = Buffer.from('{"id":"TASK-0002","round_id":"R-0003"}\n');
  const reportPath = join(
    repoRoot,
    'work/rounds/R-0020/reports/A3-migration-before-after.json',
  );

  try {
    await writeLinkedTask(repoRoot, {
      rawBytes,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0002.json.raw',
        `legacy-sha256:${sha256(rawBytes)}`,
      ],
    });
    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    report.migrations[0].round_id = 'R-0004';
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    const result = verify(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /TASK-0002\.json|A3-migration-before-after/);
    assert.match(result.stderr, /round_id|round|report/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

const a34Cases = [
  {
    roundId: 'R-0003',
    taskId: 'TASK-0004',
    discipline: 'owner-delegated',
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
    discipline: 'transcriber',
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

function a34Tags({ roundId, taskId }) {
  return [
    'authority-enforcement:pending',
    'historical-write-authority:unclassified-at-write',
    `historical-authority-discrepancy:${roundId}-${taskId}`,
  ];
}

async function writeA34Fixture(repoRoot, mutate = () => {}) {
  const entries = [];
  const migrations = [];
  for (const definition of a34Cases) {
    const tasks = join(repoRoot, 'work/rounds', definition.roundId, 'tasks');
    const originals = join(tasks, '_legacy-originals');
    const raw = Buffer.from(
      `${JSON.stringify(
        canonicalTask({
          id: definition.taskId,
          round_id: definition.roundId,
          status: 'completed',
          discipline: definition.discipline,
          target_substrates: ['F2'],
        }),
        null,
        2,
      )}\n`,
    );
    const sidecarPath = `tasks/_legacy-originals/${definition.taskId}.json.raw`;
    await mkdir(originals, { recursive: true });
    await writeFile(join(originals, `${definition.taskId}.json.raw`), raw);
    const promptPath = `work/rounds/${definition.roundId}/prompts/${definition.taskId}.md`;
    const prompt = `Papel constitucional: ${definition.promptRole}.\n`;
    await mkdir(join(repoRoot, 'work/rounds', definition.roundId, 'prompts'), {
      recursive: true,
    });
    await writeFile(join(repoRoot, promptPath), prompt);
    const pathEntries = [];
    for (const path of definition.paths) {
      const contents = `${definition.roundId}/${definition.taskId}/${path}\n`;
      await mkdir(dirname(join(repoRoot, path)), { recursive: true });
      await writeFile(join(repoRoot, path), contents);
      pathEntries.push({
        path,
        prospective_class: path.startsWith('docs/') ? 'F1' : 'F2',
        prospective_role: path.startsWith('docs/') ? 'architect' : 'engineer',
        basis: path.startsWith('docs/')
          ? 'constitution-art-6-docs'
          : 'Owner Q6: local implementation README',
        historical_write_receipt:
          definition.roundId === 'R-0005'
            ? 'work/rounds/R-0005/evidence-TASK-0009.json'
            : sha256(Buffer.from('synthetic R-0003 historical commit')).slice(
                0,
                40,
              ),
        receipt_kind:
          definition.roundId === 'R-0005'
            ? 'task-evidence-artifact'
            : 'git-commit-postimage',
        receipt_artifact_sha256: sha256(Buffer.from(contents)),
      });
    }
    let evidencePath;
    let evidenceBytes;
    if (definition.evidenceRole) {
      evidencePath = 'work/rounds/R-0005/evidence-TASK-0009.json';
      evidenceBytes = Buffer.from(
        `${JSON.stringify(
          {
            role: definition.evidenceRole,
            artifacts: pathEntries.map((entry) => ({
              path: entry.path,
              sha256: entry.receipt_artifact_sha256,
            })),
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(join(repoRoot, evidencePath), evidenceBytes);
    }
    const canonical = canonicalTask({
      id: definition.taskId,
      round_id: definition.roundId,
      status: 'completed',
      discipline: 'owner',
      target_substrates: ['F2'],
      tags: [
        ...a34Tags(definition),
        `legacy-original:${sidecarPath}`,
        `legacy-sha256:${sha256(raw)}`,
      ],
    });
    const canonicalBytes = Buffer.from(
      `${JSON.stringify(canonical, null, 2)}\n`,
    );
    await writeFile(join(tasks, `${definition.taskId}.json`), canonicalBytes);
    entries.push({
      task_path: `work/rounds/${definition.roundId}/tasks/${definition.taskId}.json`,
      original_task_sha256: sha256(raw),
      projected_discipline: 'owner',
      required_tags: a34Tags(definition),
      historical_literals: {
        task_discipline: definition.discipline,
        prompt_role: definition.promptRole,
        evidence_role: definition.evidenceRole,
      },
      prompt_path: promptPath,
      prompt_sha256: sha256(Buffer.from(prompt)),
      ...(evidencePath
        ? {
            evidence_path: evidencePath,
            evidence_sha256: sha256(evidenceBytes),
          }
        : {}),
      paths: pathEntries,
    });
    migrations.push({
      round_id: definition.roundId,
      old_id: definition.taskId,
      new_id: definition.taskId,
      old_path: `tasks/${definition.taskId}.json`,
      canonical_path: `tasks/${definition.taskId}.json`,
      sidecar_path: sidecarPath,
      original_sha256: sha256(raw),
      original_bytes: raw.length,
      canonical_sha256: sha256(canonicalBytes),
      canonical_bytes: canonicalBytes.length,
    });
  }
  const policyPath = '.devai/config/authority-policy.json';
  const policy = Buffer.from('{"authority":[]}\n');
  await mkdir(dirname(join(repoRoot, policyPath)), { recursive: true });
  await writeFile(join(repoRoot, policyPath), policy);
  const policySha256 = sha256(policy);
  for (const entry of entries)
    entry.historical_policy_at_write = {
      git_commit: sha256(
        Buffer.from(`synthetic ${entry.task_path} historical policy commit`),
      ).slice(0, 40),
      path: policyPath,
      sha256: policySha256,
      apps_backend_grant_count: 0,
    };
  const matrixPath = join(
    repoRoot,
    'work/rounds/R-0020/contracts/CTG-0003-A3.4-role-matrix.json',
  );
  await mkdir(dirname(matrixPath), { recursive: true });
  const matrix = {
    schemaVersion: '1.0.0',
    round_id: 'R-0020',
    status: 'applied',
    prospective_decision:
      'work/rounds/R-0020/AUTHORIZATION-A3.3-PATHS-2026-09-28.md',
    prospective_enforcement: 'pending',
    historical_write_authority: 'unclassified-at-write',
    entries,
  };
  mutate({ matrix, entries, repoRoot });
  await writeFile(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`);
  const reports = join(repoRoot, 'work/rounds/R-0020/reports');
  await mkdir(reports, { recursive: true });
  await writeFile(
    join(reports, 'A3-migration-before-after.json'),
    `${JSON.stringify({ schemaVersion: '1.0.0', migrations }, null, 2)}\n`,
  );
}

async function refreshA34Migration(repoRoot) {
  const reportPath = join(
    repoRoot,
    'work/rounds/R-0020/reports/A3-migration-before-after.json',
  );
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  for (const migration of report.migrations) {
    const canonical = await readFile(
      join(
        repoRoot,
        'work/rounds',
        migration.round_id,
        migration.canonical_path,
      ),
    );
    migration.canonical_sha256 = sha256(canonical);
    migration.canonical_bytes = canonical.length;
  }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

test('dado duas projeções R1 íntegras quando verifica originais então confirma a matriz aplicada e os vínculos concretos', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
  try {
    await writeA34Fixture(repoRoot);
    const result = verify(repoRoot);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /A3\.4 R1: OK \(2 projeções\)/);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

for (const status of ['candidate-not-applied', 'unknown'])
  test(`dado matriz A3.4 em ${status} quando verifica originais então recusa o estado`, async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
    try {
      await writeA34Fixture(repoRoot, ({ matrix }) => {
        matrix.status = status;
      });
      const result = verify(repoRoot);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /A3\.4.*status|status.*A3\.4/i);
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

for (const tagIndex of [0, 1, 2])
  test(`dado tag R1 ${tagIndex + 1} ausente, duplicada ou trocada quando verifica originais então acusa a tag concreta`, async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
    try {
      await writeA34Fixture(repoRoot);
      const taskPath = join(
        repoRoot,
        'work/rounds/R-0003/tasks/TASK-0004.json',
      );
      const canonical = JSON.parse(await readFile(taskPath, 'utf8'));
      const expected = a34Tags(a34Cases[0])[tagIndex];
      for (const tags of [
        canonical.tags.filter((tag) => tag !== expected),
        [...canonical.tags, expected],
        canonical.tags.map((tag) =>
          tag === expected ? `${expected}:swapped` : tag,
        ),
      ]) {
        await writeFile(
          taskPath,
          `${JSON.stringify({ ...canonical, tags }, null, 2)}\n`,
        );
        await refreshA34Migration(repoRoot);
        const result = verify(repoRoot);
        assert.notEqual(result.status, 0);
        assert.match(
          result.stderr,
          /A3\.4.*TASK-0004.*tag|tag.*TASK-0004.*A3\.4/i,
        );
      }
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

test('dado projeção R1 não concluída quando verifica originais então acusa status da TASK', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
  try {
    await writeA34Fixture(repoRoot);
    const taskPath = join(repoRoot, 'work/rounds/R-0005/tasks/TASK-0009.json');
    const task = JSON.parse(await readFile(taskPath, 'utf8'));
    await writeFile(
      taskPath,
      `${JSON.stringify({ ...task, status: 'queued' }, null, 2)}\n`,
    );
    await refreshA34Migration(repoRoot);
    const result = verify(repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /A3\.4.*TASK-0009.*completed|completed.*TASK-0009.*A3\.4/i,
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

for (const mutation of ['hash', 'path', 'receipt', 'literal'])
  test(`dado ${mutation} A3.4 divergente quando verifica originais então acusa ${mutation}`, async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
    try {
      await writeA34Fixture(repoRoot, ({ entries }) => {
        const entry = entries[1];
        if (mutation === 'hash') entry.original_task_sha256 = '0'.repeat(64);
        if (mutation === 'path')
          entry.paths[0].path = 'backend/incorrect/README.md';
        if (mutation === 'receipt')
          entry.paths[0].receipt_artifact_sha256 = '0'.repeat(64);
        if (mutation === 'literal')
          entry.historical_literals.evidence_role = 'owner';
      });
      const result = verify(repoRoot);
      assert.notEqual(result.status, 0);
      assert.match(
        result.stderr,
        new RegExp(`TASK-0009.*${mutation}|${mutation}.*TASK-0009`, 'i'),
      );
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

for (const location of ['tasks', 'backlog'])
  for (const definition of a34Cases)
    test(`dado identidade ${definition.roundId}/${definition.taskId} materializada em ${location} quando verifica originais então recusa despacho`, async () => {
      const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
      try {
        await writeA34Fixture(repoRoot);
        const state = join(repoRoot, '.devai/state');
        await mkdir(location === 'tasks' ? join(state, 'tasks') : state, {
          recursive: true,
        });
        await writeFile(
          location === 'tasks'
            ? join(state, 'tasks', `${definition.taskId}.json`)
            : join(state, 'backlog.jsonl'),
          `${JSON.stringify({ round_id: definition.roundId, id: definition.taskId })}\n`,
        );
        const result = verify(repoRoot);
        assert.notEqual(result.status, 0);
        assert.match(
          result.stderr,
          new RegExp(
            `${definition.roundId}.*${definition.taskId}|${definition.taskId}.*${definition.roundId}`,
          ),
        );
        assert.match(
          result.stderr,
          /A3\.4.*store|A3\.4.*backlog|A3\.4.*dispatch|A3\.4.*materializ/i,
        );
      } finally {
        await rm(repoRoot, { recursive: true, force: true });
      }
    });

for (const corruption of ['missing', 'corrupted'])
  test(`dado sidecar A3 ${corruption} quando verifica originais então acusa o sidecar`, async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
    try {
      await writeA34Fixture(repoRoot);
      const sidecar = join(
        repoRoot,
        'work/rounds/R-0003/tasks/_legacy-originals/TASK-0004.json.raw',
      );
      if (corruption === 'missing') await rm(sidecar);
      else await writeFile(sidecar, 'corrupted');
      const result = verify(repoRoot);
      assert.notEqual(result.status, 0);
      assert.match(
        result.stderr,
        /A3\.4.*TASK-0004.*sidecar|sidecar.*TASK-0004.*A3\.4/i,
      );
    } finally {
      await rm(repoRoot, { recursive: true, force: true });
    }
  });

test('dado matriz que alega grant retrospectivo quando verifica originais então recusa a alegação', async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-verify-a34-'));
  try {
    await writeA34Fixture(repoRoot, ({ matrix, entries }) => {
      matrix.historical_write_authority = 'granted-retrospectively';
      entries[0].paths[0].historical_grant = 'engineer/F2';
    });
    const result = verify(repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /retro|grant|historical.*authorit/i);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
