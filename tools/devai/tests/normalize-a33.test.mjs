import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const normalizer = join(repositoryRoot, 'tools/devai/normalize-tasks.mjs');
const roundVerifier = join(
  repositoryRoot,
  'tools/devai/verify-round-tasks.mjs',
);
const originalsVerifier = join(
  repositoryRoot,
  'tools/devai/verify-task-originals.mjs',
);
const rounds = 'work/rounds';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const d1 = [
  [
    'TASK-0001-D1',
    'TASK-0019',
    '07fed96b53f3b69618621658a5f02ee16f556c1091ecbd97ab5188f8c5a79da3',
  ],
  [
    'TASK-0002-D1',
    'TASK-0020',
    'e12b7024b1873bb62e26430b42c7191694840a593dd14a771feffe734b39971c',
  ],
  [
    'TASK-0003-D1',
    'TASK-0021',
    '78dec1456d50d88c9075bfe7e2e68cb92b36b765ebc95a31839bfb2fc16289a4',
  ],
  [
    'TASK-0004-D1',
    'TASK-0022',
    '550bf9088dc64d93541bb9c058574f67a3d7d017df1a8a562add87c617fba163',
  ],
];

const ledger = [
  [5, 'TASK-0002', 'completed'],
  [6, 'TASK-0002-RETRY-1', 'completed'],
  [10, 'TASK-0002-ESCALATION-1', 'completed'],
  [16, 'PREP-CTG1-DEPS', 'completed'],
  [17, 'TASK-0002-C2', 'completed-incomplete'],
  [18, 'TASK-0002-C2-RETRY-1', 'completed-incomplete'],
  [19, 'TASK-0002-C2-ESCALATION-1', 'completed-incomplete'],
  [25, 'PREP-CTG1-MODEL', 'completed'],
  [26, 'TASK-0002-C3', 'completed'],
];

function task(overrides = {}) {
  return {
    schemaVersion: '2.0.0',
    id: 'TASK-0001',
    round_id: 'R-0007',
    status: 'completed',
    discipline: 'engineer',
    title: 'Fixture A3.3',
    target_modules: ['MOD-devai-tools-tests'],
    target_substrates: ['F3'],
    created_at: '2026-09-15T20:00:00.000Z',
    db_isolation: 'database',
    iteration_count: 0,
    max_iterations: 2,
    coupled_task_group: 'CTG-0001',
    coupled_pipeline_position: 'engineer',
    upstream_task_id: null,
    executor: {
      kind: 'agent',
      runtime: 'codex-cli',
      model: 'gpt-5.6-terra',
      effort: 'medium',
      selection: { mode: 'exact', registry_id: 'gpt-5.6-terra' },
      prompt_composition_id: 'PC-0000000000000000',
      max_iterations: 2,
      capabilities: ['read'],
    },
    prompt_composition_id: 'PC-0000000000000000',
    ...overrides,
  };
}

function run(file, repoRoot) {
  return spawnSync(process.execPath, [file, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

async function withFixture(callback) {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-normalize-a33-'));
  try {
    await callback(repoRoot);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
}

async function put(repoRoot, relativePath, bytes) {
  const path = join(repoRoot, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  return path;
}

async function putTask(repoRoot, roundId, basename, value) {
  return put(
    repoRoot,
    `${rounds}/${roundId}/tasks/${basename}.json`,
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

async function copySource(repoRoot, relativePath, expectedHash) {
  const bytes = await historicalSourceBytes(relativePath, expectedHash);
  if (expectedHash) assert.equal(sha256(bytes), expectedHash, relativePath);
  await put(repoRoot, relativePath, bytes);
  return bytes;
}

async function historicalSourceBytes(relativePath, expectedHash) {
  const taskMatch =
    /^work\/rounds\/(R-[0-9]{4})\/tasks\/(TASK-[^/]+)\.json$/u.exec(
      relativePath,
    );
  let bytes;
  if (taskMatch) {
    try {
      bytes = await readFile(
        join(
          repositoryRoot,
          `${rounds}/${taskMatch[1]}/tasks/_legacy-originals/${taskMatch[2]}.json.raw`,
        ),
      );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  bytes ??= await readFile(join(repositoryRoot, relativePath));
  if (expectedHash) assert.equal(sha256(bytes), expectedHash, relativePath);
  return bytes;
}

function linkedTags(canonical, originalPath, originalBytes) {
  assert.ok(canonical.tags.includes(`legacy-original:${originalPath}`));
  assert.ok(canonical.tags.includes(`legacy-sha256:${sha256(originalBytes)}`));
}

async function migration(repoRoot) {
  return JSON.parse(
    await readFile(
      join(repoRoot, `${rounds}/R-0020/reports/A3-migration-before-after.json`),
      'utf8',
    ),
  );
}

async function linkedFixture(repoRoot, { roundId, id, raw, canonical }) {
  const rawBytes = Buffer.isBuffer(raw)
    ? raw
    : Buffer.from(`${JSON.stringify(raw, null, 2)}\n`);
  const sidecar = `tasks/_legacy-originals/${id}.json.raw`;
  await put(repoRoot, `${rounds}/${roundId}/${sidecar}`, rawBytes);
  const taskPath = await putTask(repoRoot, roundId, id, {
    ...canonical,
    tags: [
      ...(canonical.tags ?? []),
      `legacy-original:${sidecar}`,
      `legacy-sha256:${sha256(rawBytes)}`,
    ],
  });
  const canonicalBytes = await readFile(taskPath);
  await put(
    repoRoot,
    `${rounds}/R-0020/reports/A3-migration-before-after.json`,
    `${JSON.stringify(
      {
        schemaVersion: '1.0.0',
        migrations: [
          {
            round_id: roundId,
            old_id: id,
            new_id: id,
            old_path: `tasks/${id}.json`,
            canonical_path: `tasks/${id}.json`,
            sidecar_path: sidecar,
            original_sha256: sha256(rawBytes),
            original_bytes: rawBytes.length,
            canonical_sha256: sha256(canonicalBytes),
            canonical_bytes: canonicalBytes.length,
            transformed_fields: [],
            schema_status: 'pass',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  return rawBytes;
}

async function writeU1Index(
  repoRoot,
  originalBytes,
  mutate = (index) => index,
) {
  const budgetPath = `${rounds}/R-0007/budget.json`;
  const planPath = `${rounds}/R-0007/plan.md`;
  const promptPath = `${rounds}/R-0007/prompts/TASK-0002.md`;
  const budget = await copySource(
    repoRoot,
    budgetPath,
    '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
  );
  const plan = await copySource(
    repoRoot,
    planPath,
    '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
  );
  const prompt = await copySource(
    repoRoot,
    promptPath,
    '12be7876c39ec63068b60a8dbaf9c4b374afc57f82b76651a527d6c211eec15c',
  );
  const index = {
    schemaVersion: '1.0.0',
    round_id: 'R-0007',
    task_id_literal: 'TASK-0002',
    task_id_canonical: 'TASK-0002',
    original_task_sha256: sha256(originalBytes),
    original_upstream_literal: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
    ordering_basis: 'budget-entry-order',
    budget_path: budgetPath,
    budget_sha256: sha256(budget),
    plan_path: planPath,
    plan_sha256: sha256(plan),
    prompt_path: promptPath,
    prompt_sha256: sha256(prompt),
    ledger_entries: ledger.map(([indexValue, id, status]) => ({
      index: indexValue,
      id,
      status,
    })),
    task_0001_reopening: 'plan-only; no budget entry',
    historical_dispatch_timestamp: 'unknown',
    final_success_timestamp: 'unknown',
    preparations: [
      {
        prep_id: 'PREP-CTG1-DEPS',
        ledger_index: 16,
        next_worker_index: 17,
        next_worker_id: 'TASK-0002-C2',
      },
      {
        prep_id: 'PREP-CTG1-MODEL',
        ledger_index: 25,
        next_worker_index: 26,
        next_worker_id: 'TASK-0002-C3',
      },
    ],
  };
  await put(
    repoRoot,
    `${rounds}/R-0007/tasks/_legacy-originals/prep-prerequisites.json`,
    `${JSON.stringify(mutate(index), null, 2)}\n`,
  );
}

async function putT1PostA3Fixture(repoRoot) {
  const original = await historicalSourceBytes(
    `${rounds}/R-0006/tasks/TASK-0003.json`,
    'ee8fba71002cb436d35b37ef533621ca037f12093f33a9b0194dae788060b0a0',
  );
  assert.equal(
    sha256(original),
    'ee8fba71002cb436d35b37ef533621ca037f12093f33a9b0194dae788060b0a0',
  );
  await put(
    repoRoot,
    `${rounds}/R-0006/tasks/_legacy-originals/TASK-0003.json.raw`,
    original,
  );
  await putTask(
    repoRoot,
    'R-0006',
    'TASK-0003',
    task({
      id: 'TASK-0003',
      round_id: 'R-0006',
      status: 'escalated',
      iteration_count: 2,
      max_iterations: 2,
      iteration_trail: JSON.parse(original).iteration_trail,
      tags: [
        'legacy-original:tasks/_legacy-originals/TASK-0003.json.raw',
        `legacy-sha256:${sha256(original)}`,
      ],
    }),
  );
  return original;
}

async function writeT1Index(
  repoRoot,
  originalBytes,
  mutate = (index) => index,
) {
  const sources = [
    [
      `${rounds}/R-0006/plan.md`,
      'aa03e2e01fb060ed37cc0425503e671b1ad3d5bb005e7adcb5b1e644342ddb60',
    ],
    [
      `${rounds}/R-0006/budget.json`,
      'c28ca54c69bf861e6646cc135693a8eb3a099877494d674cda9f6ee364208e5d',
    ],
    [
      `${rounds}/R-0006/reviews/delivery-review-CTG-0001.md`,
      'b835a177d4e3b2a19106c0b31eee2519536e51c7e2cb5fb4085a00bfae693ffd',
    ],
    [
      `${rounds}/R-0006/reviews/delivery-review-CTG-0001-2.md`,
      '913389a30cbdcbfefb573038f04d5b2b8b55cecdb7cfd26ef3699771de720e3d',
    ],
    [
      `${rounds}/R-0006/reviews/delivery-review-CTG-0001-3.md`,
      '95691f5488363fcfe2fc094212bf3ecd4485f4c0cfcb55792906519a1e8abf1d',
    ],
    [
      `${rounds}/R-0006/reviews/delivery-review-CTG-0001-4.md`,
      '93f29b22825163b24b836678fd82a2d60f43898ca3f78a75e1562b2770c5fbbf',
    ],
  ];
  for (const [path, hash] of sources) await copySource(repoRoot, path, hash);
  const index = {
    schemaVersion: '1.0.0',
    round_id: 'R-0006',
    task_id: 'TASK-0003',
    original_task_sha256: sha256(originalBytes),
    sidecar_path: 'tasks/_legacy-originals/TASK-0003.json.raw',
    iteration_count: 2,
    max_iterations: 2,
    iteration_trail: JSON.parse(originalBytes).iteration_trail,
    trail_iteration_3_is_review_cycle_not_worker_dispatch: true,
    worker_dispatches: 2,
    sources: sources.map(([path, hash]) => ({ path, sha256: hash })),
    review_3_status: 'FAIL',
    review_4_status: 'PASS',
    task_status: 'escalated',
  };
  await put(
    repoRoot,
    `${rounds}/R-0006/tasks/_legacy-originals/TASK-0003-escalation.json`,
    `${JSON.stringify(mutate(index), null, 2)}\n`,
  );
}

function directRuntimeCycles(tasks) {
  const position = { inspector: 0, architect: 1, engineer: 2 };
  const byId = new Map(tasks.map((entry) => [entry.id, entry]));
  return tasks
    .filter((entry) => {
      const upstream = byId.get(entry.upstream_task_id);
      return (
        upstream &&
        entry.coupled_task_group === upstream.coupled_task_group &&
        position[upstream.coupled_pipeline_position] >
          position[entry.coupled_pipeline_position]
      );
    })
    .map((entry) => `${entry.upstream_task_id}↔${entry.id}`)
    .toSorted();
}

test('dado quatro D1 quando normaliza então move 0019 e arquiva três snapshots sem criar IDs', async () => {
  await withFixture(async (repoRoot) => {
    const originals = new Map();
    for (const [name, , hash] of d1) {
      const path = `${rounds}/R-0007/tasks/${name}.json`;
      originals.set(name, await copySource(repoRoot, path, hash));
    }
    for (const [id, hash] of [
      [
        'TASK-0020',
        'ceefd7240511a269d4065a378870113eb9acd523e8658155fed127aa08b7f235',
      ],
      [
        'TASK-0021',
        '1111e230f99b7e246e93efcdda3584007d3a869056dbb56d7d4f13e9bfc4d845',
      ],
      [
        'TASK-0022',
        'dbc9ea42827844fb3dc6b5d4283ab6cca22d35931ed9915ccc28821b78391535',
      ],
    ])
      await copySource(repoRoot, `${rounds}/R-0007/tasks/${id}.json`, hash);
    await copySource(
      repoRoot,
      `${rounds}/R-0007/plan.md`,
      '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
    );
    await copySource(
      repoRoot,
      `${rounds}/R-0007/budget.json`,
      '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
    );

    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const direct = (await readdir(join(repoRoot, `${rounds}/R-0007/tasks`)))
      .filter((name) => /^TASK-.*\.json$/u.test(name))
      .toSorted();
    assert.deepEqual(direct, [
      'TASK-0019.json',
      'TASK-0020.json',
      'TASK-0021.json',
      'TASK-0022.json',
    ]);
    const index = JSON.parse(
      await readFile(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json`,
        ),
      ),
    );
    const indexText = JSON.stringify(index);
    for (const [name, id, hash] of d1) {
      const sidecar = `${rounds}/R-0007/tasks/_legacy-originals/${name}.json.raw`;
      assert.deepEqual(
        await readFile(join(repoRoot, sidecar)),
        originals.get(name),
      );
      assert.ok(
        indexText.includes(name) &&
          indexText.includes(id) &&
          indexText.includes(hash),
      );
    }
    const moved = JSON.parse(
      await readFile(join(repoRoot, `${rounds}/R-0007/tasks/TASK-0019.json`)),
    );
    assert.equal(moved.id, 'TASK-0019');
    linkedTags(
      moved,
      'tasks/_legacy-originals/TASK-0001-D1.json.raw',
      originals.get('TASK-0001-D1'),
    );
    assert.match(indexText, /superseded-snapshot/u);
    assert.match(indexText, /canonical-move/u);
    assert.match(
      indexText,
      /1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2/u,
    );
    assert.match(
      indexText,
      /5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2/u,
    );
    assert.match(indexText, /TASK-0020-D1\.md/u);
    assert.match(indexText, /absent|missing|ausente/iu);
    assert.equal(
      existsSync(join(repoRoot, `${rounds}/R-0007/reports/TASK-0020-D1.md`)),
      false,
    );
    assert.equal(run(originalsVerifier, repoRoot).status, 0);
    const first = await readFile(
      join(
        repoRoot,
        `${rounds}/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json`,
      ),
    );
    assert.equal(run(normalizer, repoRoot).status, 0);
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json`,
        ),
      ),
      first,
    );
  });
});

test('dado D1 com snapshot divergente quando normaliza então rejeita hash e preserva todos os originais', async () => {
  await withFixture(async (repoRoot) => {
    const path = await putTask(
      repoRoot,
      'R-0007',
      'TASK-0002-D1',
      task({ id: 'TASK-0020', status: 'queued' }),
    );
    const before = await readFile(path);
    await putTask(repoRoot, 'R-0007', 'TASK-0020', task({ id: 'TASK-0020' }));
    await copySource(
      repoRoot,
      `${rounds}/R-0007/plan.md`,
      '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
    );
    await copySource(
      repoRoot,
      `${rounds}/R-0007/budget.json`,
      '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
    );
    const result = run(normalizer, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /D1.*(?:sha256|hash)|(?:sha256|hash).*D1/iu);
    assert.deepEqual(await readFile(path), before);
    assert.equal(
      existsSync(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/TASK-0002-D1.json.raw`,
        ),
      ),
      false,
    );
  });
});

test('dado dois basenames para o mesmo ID quando verifica round TASKs então rejeita antes de D1', async () => {
  await withFixture(async (repoRoot) => {
    await copySource(repoRoot, 'law/schemas/task.schema.json');
    await putTask(repoRoot, 'R-0007', 'TASK-0019', task({ id: 'TASK-0019' }));
    await putTask(
      repoRoot,
      'R-0007',
      'TASK-0001-D1',
      task({ id: 'TASK-0019' }),
    );
    const result = run(roundVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /duplicate TASK identity.*R-0007.*TASK-0019/iu);
  });
});

test('dado S2 e S3 incompletas quando normaliza então conserva checkpoint arquivístico e sucessoras', async () => {
  await withFixture(async (repoRoot) => {
    // Fixture at the post-A3 alias boundary: S2/S3 already have canonical
    // basenames, while their original bytes and alias identity remain linked.
    const paths = [
      ['TASK-0004-S2', 'TASK-0084', ['TASK-0085']],
      ['TASK-0004-S3', 'TASK-0086', ['TASK-0087', 'TASK-0088']],
    ];
    const originals = new Map();
    for (const [oldId, id] of paths) {
      const original = await historicalSourceBytes(
        `${rounds}/R-0007/tasks/${oldId}.json`,
        oldId === 'TASK-0004-S2'
          ? 'b93d22464a2900ad2c04d0f292aa174c18755031b806774d11122c5e6f6cd1f2'
          : '861af0dbe8228d83c3d1ad390ad687dcf50bd518ebfd0b0bdb9127e8f074ea72',
      );
      originals.set(id, original);
      await put(
        repoRoot,
        `${rounds}/R-0007/tasks/_legacy-originals/${oldId}.json.raw`,
        original,
      );
      await putTask(
        repoRoot,
        'R-0007',
        id,
        task({
          id,
          status: 'completed_incomplete',
          tags: [
            `legacy-original:tasks/_legacy-originals/${oldId}.json.raw`,
            `legacy-sha256:${sha256(original)}`,
            `legacy-task-id:${oldId}`,
          ],
        }),
      );
    }
    await put(
      repoRoot,
      `${rounds}/R-0007/tasks/_legacy-originals/aliases.json`,
      `${JSON.stringify(
        paths.map(([oldId, id]) => ({
          old_id: oldId,
          new_id: id,
          canonical_path: `tasks/${id}.json`,
          sidecar_path: `tasks/_legacy-originals/${oldId}.json.raw`,
        })),
        null,
        2,
      )}\n`,
    );
    for (const [id, upstream] of [
      ['TASK-0085', 'TASK-0084'],
      ['TASK-0087', 'TASK-0086'],
      ['TASK-0088', 'TASK-0087'],
    ])
      await putTask(
        repoRoot,
        'R-0007',
        id,
        task({ id, upstream_task_id: upstream }),
      );
    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    for (let i = 0; i < paths.length; i += 1) {
      const [oldId, id, successors] = paths[i];
      const canonical = JSON.parse(
        await readFile(join(repoRoot, `${rounds}/R-0007/tasks/${id}.json`)),
      );
      assert.equal(canonical.status, 'checkpoint');
      assert.notEqual(canonical.status, 'completed');
      assert.ok(canonical.tags.includes('legacy-status:completed_incomplete'));
      linkedTags(
        canonical,
        `tasks/_legacy-originals/${oldId}.json.raw`,
        originals.get(id),
      );
      assert.deepEqual(
        await readFile(
          join(
            repoRoot,
            `${rounds}/R-0007/tasks/_legacy-originals/${oldId}.json.raw`,
          ),
        ),
        originals.get(id),
      );
      for (const successor of successors)
        assert.ok(
          JSON.stringify(await migration(repoRoot)).includes(successor),
        );
    }
  });
});

test('dado S2 incompleta com outra classe pendente quando normaliza então não muda o arquivo inteiro', async () => {
  await withFixture(async (repoRoot) => {
    const path = await putTask(
      repoRoot,
      'R-0007',
      'TASK-0084',
      task({
        id: 'TASK-0084',
        status: 'completed_incomplete',
        discipline: 'transcriber',
      }),
    );
    const before = await readFile(path);
    const result = run(normalizer, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /discipline|ROLE/iu);
    assert.deepEqual(await readFile(path), before);
    assert.equal(
      existsSync(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/TASK-0084.json.raw`,
        ),
      ),
      false,
    );
  });
});

test('dado dez posições literais quando normaliza então usa null e mantém disciplina e upstream', async () => {
  await withFixture(async (repoRoot) => {
    const positions = [
      ['TASK-0004', 'architect-integration', 'architect'],
      ['TASK-0083', 'corrective-inspector', 'inspector'],
      ['TASK-0084', 'corrective-engineer', 'engineer'],
      ['TASK-0085', 'corrective-engineer-retry', 'engineer'],
      ['TASK-0086', 'corrective-engineer-wiring', 'engineer'],
      ['TASK-0087', 'corrective-engineer-provider-target', 'engineer'],
      ['TASK-0088', 'corrective-architect-provider-wiring', 'architect'],
      ['TASK-0078', 'auditor', 'auditor'],
      ['TASK-0080', 'auditor', 'auditor'],
      ['TASK-0082', 'auditor', 'auditor'],
    ];
    const before = new Map();
    for (const [id, position, discipline] of positions)
      before.set(
        id,
        await readFile(
          await putTask(
            repoRoot,
            'R-0007',
            id,
            task({ id, discipline, coupled_pipeline_position: position }),
          ),
        ),
      );
    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    for (const [id, position, discipline] of positions) {
      const canonical = JSON.parse(
        await readFile(join(repoRoot, `${rounds}/R-0007/tasks/${id}.json`)),
      );
      assert.equal(canonical.coupled_pipeline_position, null);
      assert.equal(canonical.discipline, discipline);
      assert.equal(canonical.upstream_task_id, null);
      assert.ok(
        canonical.tags.includes(`legacy-pipeline-position:${position}`),
      );
      linkedTags(
        canonical,
        `tasks/_legacy-originals/${id}.json.raw`,
        before.get(id),
      );
      assert.deepEqual(
        await readFile(
          join(
            repoRoot,
            `${rounds}/R-0007/tasks/_legacy-originals/${id}.json.raw`,
          ),
        ),
        before.get(id),
      );
    }
  });
});

test('dado ciclo runtime preexistente quando projeta P1 então upstream segue DAG sem ciclo novo', async () => {
  await withFixture(async (repoRoot) => {
    await putTask(
      repoRoot,
      'R-0007',
      'TASK-0001',
      task({ id: 'TASK-0001', coupled_pipeline_position: 'architect' }),
    );
    await putTask(
      repoRoot,
      'R-0007',
      'TASK-0002',
      task({
        id: 'TASK-0002',
        discipline: 'inspector',
        coupled_pipeline_position: 'inspector',
        upstream_task_id: 'TASK-0001',
      }),
    );
    await putTask(
      repoRoot,
      'R-0007',
      'TASK-0083',
      task({
        id: 'TASK-0083',
        discipline: 'inspector',
        coupled_pipeline_position: 'corrective-inspector',
        upstream_task_id: 'TASK-0002',
      }),
    );
    const originalTasks = await Promise.all(
      ['TASK-0001', 'TASK-0002', 'TASK-0083'].map(async (id) =>
        JSON.parse(
          await readFile(join(repoRoot, `${rounds}/R-0007/tasks/${id}.json`)),
        ),
      ),
    );
    assert.deepEqual(directRuntimeCycles(originalTasks), [
      'TASK-0001↔TASK-0002',
    ]);
    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const tasks = await Promise.all(
      ['TASK-0001', 'TASK-0002', 'TASK-0083'].map(async (id) =>
        JSON.parse(
          await readFile(join(repoRoot, `${rounds}/R-0007/tasks/${id}.json`)),
        ),
      ),
    );
    const byId = new Map(tasks.map((entry) => [entry.id, entry]));
    assert.deepEqual(
      tasks.map((entry) => [entry.id, entry.upstream_task_id]),
      [
        ['TASK-0001', null],
        ['TASK-0002', 'TASK-0001'],
        ['TASK-0083', 'TASK-0002'],
      ],
    );
    for (const entry of tasks) {
      const seen = new Set();
      let cursor = entry;
      while (cursor?.upstream_task_id) {
        assert.ok(
          !seen.has(cursor.id),
          `new explicit upstream cycle at ${cursor.id}`,
        );
        seen.add(cursor.id);
        cursor = byId.get(cursor.upstream_task_id);
      }
    }
    assert.equal(byId.get('TASK-0083').coupled_pipeline_position, null);
    assert.equal(byId.get('TASK-0001').coupled_pipeline_position, 'architect');
    assert.equal(byId.get('TASK-0002').coupled_pipeline_position, 'inspector');
    assert.deepEqual(directRuntimeCycles(tasks), ['TASK-0001↔TASK-0002']);
  });
});

test('dado PREP U1 quando normaliza então preserva todas as linhas do ledger sem horário inventado', async () => {
  await withFixture(async (repoRoot) => {
    // The TASK fixture is canonical in every other field; only U1 remains.
    const taskPath = await putTask(
      repoRoot,
      'R-0007',
      'TASK-0002',
      task({
        id: 'TASK-0002',
        upstream_task_id: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
      }),
    );
    const original = await readFile(taskPath);
    await copySource(
      repoRoot,
      `${rounds}/R-0007/budget.json`,
      '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
    );
    await copySource(
      repoRoot,
      `${rounds}/R-0007/plan.md`,
      '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
    );
    await copySource(
      repoRoot,
      `${rounds}/R-0007/prompts/TASK-0002.md`,
      '12be7876c39ec63068b60a8dbaf9c4b374afc57f82b76651a527d6c211eec15c',
    );
    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(
      await readFile(join(repoRoot, `${rounds}/R-0007/tasks/TASK-0002.json`)),
    );
    assert.equal(canonical.upstream_task_id, 'TASK-0001');
    assert.ok(
      canonical.tags.includes(
        'legacy-prep-index:tasks/_legacy-originals/prep-prerequisites.json',
      ),
    );
    linkedTags(
      canonical,
      'tasks/_legacy-originals/TASK-0002.json.raw',
      original,
    );
    const index = JSON.parse(
      await readFile(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/prep-prerequisites.json`,
        ),
      ),
    );
    assert.equal(index.ordering_basis, 'budget-entry-order');
    assert.equal(
      index.budget_sha256,
      '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
    );
    assert.equal(
      index.plan_sha256,
      '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
    );
    assert.equal(
      index.prompt_sha256,
      '12be7876c39ec63068b60a8dbaf9c4b374afc57f82b76651a527d6c211eec15c',
    );
    assert.equal(index.historical_dispatch_timestamp, 'unknown');
    assert.equal(index.final_success_timestamp, 'unknown');
    assert.match(JSON.stringify(index.task_0001_reopening), /plan-only/u);
    const entries = index.ledger_entries;
    assert.deepEqual(
      entries.map((entry) => [entry.index, entry.id, entry.status]),
      ledger,
    );
    assert.deepEqual(
      index.preparations.map((entry) => [
        entry.prep_id,
        entry.ledger_index,
        entry.next_worker_index,
        entry.next_worker_id,
      ]),
      [
        ['PREP-CTG1-DEPS', 16, 17, 'TASK-0002-C2'],
        ['PREP-CTG1-MODEL', 25, 26, 'TASK-0002-C3'],
      ],
    );
    assert.equal(JSON.stringify(index).includes('TASK-0002-DISPATCH'), false);
    assert.deepEqual(
      await readFile(
        join(
          repoRoot,
          `${rounds}/R-0007/tasks/_legacy-originals/TASK-0002.json.raw`,
        ),
      ),
      original,
    );
  });
});

test('dado PREP com budget alterado quando normaliza então falha sem alegar precedência temporal', async () => {
  await withFixture(async (repoRoot) => {
    const taskPath = await putTask(
      repoRoot,
      'R-0007',
      'TASK-0002',
      task({
        id: 'TASK-0002',
        upstream_task_id: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
      }),
    );
    const original = await readFile(taskPath);
    await put(repoRoot, `${rounds}/R-0007/budget.json`, '{"entries":[]}\n');
    const result = run(normalizer, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /budget.*(?:sha256|hash)|(?:sha256|hash).*budget/iu,
    );
    assert.deepEqual(
      await readFile(join(repoRoot, `${rounds}/R-0007/tasks/TASK-0002.json`)),
      original,
    );
  });
});

test('dado T1 escalated quando normaliza então indexa reviews sem terceiro worker nem PASS retroativo', async () => {
  await withFixture(async (repoRoot) => {
    // All prior A3 field repairs are represented; TRAIL is the sole gap.
    const original = await putT1PostA3Fixture(repoRoot);
    for (const [path, hash] of [
      [
        `${rounds}/R-0006/plan.md`,
        'aa03e2e01fb060ed37cc0425503e671b1ad3d5bb005e7adcb5b1e644342ddb60',
      ],
      [
        `${rounds}/R-0006/budget.json`,
        'c28ca54c69bf861e6646cc135693a8eb3a099877494d674cda9f6ee364208e5d',
      ],
      [
        `${rounds}/R-0006/reviews/delivery-review-CTG-0001.md`,
        'b835a177d4e3b2a19106c0b31eee2519536e51c7e2cb5fb4085a00bfae693ffd',
      ],
      [
        `${rounds}/R-0006/reviews/delivery-review-CTG-0001-2.md`,
        '913389a30cbdcbfefb573038f04d5b2b8b55cecdb7cfd26ef3699771de720e3d',
      ],
      [
        `${rounds}/R-0006/reviews/delivery-review-CTG-0001-3.md`,
        '95691f5488363fcfe2fc094212bf3ecd4485f4c0cfcb55792906519a1e8abf1d',
      ],
      [
        `${rounds}/R-0006/reviews/delivery-review-CTG-0001-4.md`,
        '93f29b22825163b24b836678fd82a2d60f43898ca3f78a75e1562b2770c5fbbf',
      ],
    ])
      await copySource(repoRoot, path, hash);
    const result = run(normalizer, repoRoot);
    assert.equal(result.status, 0, result.stderr);
    const canonical = JSON.parse(
      await readFile(join(repoRoot, `${rounds}/R-0006/tasks/TASK-0003.json`)),
    );
    assert.equal(canonical.status, 'escalated');
    assert.equal(canonical.iteration_count, 2);
    assert.equal(canonical.max_iterations, 2);
    assert.equal(Object.hasOwn(canonical, 'iteration_trail'), false);
    assert.ok(
      canonical.tags.includes(
        'legacy-escalation-index:tasks/_legacy-originals/TASK-0003-escalation.json',
      ),
    );
    linkedTags(
      canonical,
      'tasks/_legacy-originals/TASK-0003.json.raw',
      original,
    );
    const index = JSON.parse(
      await readFile(
        join(
          repoRoot,
          `${rounds}/R-0006/tasks/_legacy-originals/TASK-0003-escalation.json`,
        ),
      ),
    );
    const raw = JSON.parse(original);
    assert.deepEqual(index.iteration_trail, raw.iteration_trail);
    assert.equal(index.iteration_count, 2);
    assert.equal(index.max_iterations, 2);
    assert.equal(
      index.trail_iteration_3_is_review_cycle_not_worker_dispatch,
      true,
    );
    const text = JSON.stringify(index);
    for (const hash of [
      'aa03e2e01fb060ed37cc0425503e671b1ad3d5bb005e7adcb5b1e644342ddb60',
      'c28ca54c69bf861e6646cc135693a8eb3a099877494d674cda9f6ee364208e5d',
      'b835a177d4e3b2a19106c0b31eee2519536e51c7e2cb5fb4085a00bfae693ffd',
      '913389a30cbdcbfefb573038f04d5b2b8b55cecdb7cfd26ef3699771de720e3d',
      '95691f5488363fcfe2fc094212bf3ecd4485f4c0cfcb55792906519a1e8abf1d',
      '93f29b22825163b24b836678fd82a2d60f43898ca3f78a75e1562b2770c5fbbf',
    ])
      assert.ok(text.includes(hash));
    assert.match(text, /delivery-review-CTG-0001-4\.md/u);
    assert.equal(canonical.status, 'escalated');
  });
});

test('dado T1 com revisão hash divergente quando normaliza então falha sem alterar TASK', async () => {
  await withFixture(async (repoRoot) => {
    await putT1PostA3Fixture(repoRoot);
    const original = await readFile(
      join(repoRoot, `${rounds}/R-0006/tasks/TASK-0003.json`),
    );
    await put(
      repoRoot,
      `${rounds}/R-0006/reviews/delivery-review-CTG-0001-2.md`,
      'tampered review\n',
    );
    const result = run(normalizer, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /review.*(?:sha256|hash)|(?:sha256|hash).*review/iu,
    );
    assert.deepEqual(
      await readFile(join(repoRoot, `${rounds}/R-0006/tasks/TASK-0003.json`)),
      original,
    );
  });
});

test('dado S1 cujo sidecar diz incompleta quando verificador vê completed então rejeita PASS inventado', async () => {
  await withFixture(async (repoRoot) => {
    const raw = task({ id: 'TASK-0084', status: 'completed_incomplete' });
    await linkedFixture(repoRoot, {
      roundId: 'R-0007',
      id: 'TASK-0084',
      raw,
      canonical: task({
        id: 'TASK-0084',
        status: 'completed',
        tags: ['legacy-status:completed_incomplete'],
      }),
    });
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /status|completed_incomplete|checkpoint/iu);
  });
});

test('dado P1 com posição inventada quando verifica sidecar então rejeita reclassificação de Auditor', async () => {
  await withFixture(async (repoRoot) => {
    const raw = task({
      id: 'TASK-0078',
      discipline: 'auditor',
      coupled_pipeline_position: 'auditor',
    });
    await linkedFixture(repoRoot, {
      roundId: 'R-0007',
      id: 'TASK-0078',
      raw,
      canonical: task({
        id: 'TASK-0078',
        discipline: 'auditor',
        coupled_pipeline_position: 'inspector',
        tags: ['legacy-pipeline-position:auditor'],
      }),
    });
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /position|auditor|P1/iu);
  });
});

test('dado U1 com retry omitido quando verifica índice então rejeita perda da ordem documental', async () => {
  await withFixture(async (repoRoot) => {
    const raw = task({
      id: 'TASK-0002',
      upstream_task_id: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
    });
    const originalBytes = await linkedFixture(repoRoot, {
      roundId: 'R-0007',
      id: 'TASK-0002',
      raw,
      canonical: task({
        id: 'TASK-0002',
        upstream_task_id: 'TASK-0001',
        tags: [
          'legacy-prep-index:tasks/_legacy-originals/prep-prerequisites.json',
        ],
      }),
    });
    await writeU1Index(repoRoot, originalBytes, (index) => ({
      ...index,
      ledger_entries: index.ledger_entries.filter(
        (entry) => entry.index !== 18,
      ),
    }));
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /retry|ledger|budget|18/iu);
  });
});

test('dado U1 com caminho externo quando verifica índice então rejeita fonte fora do repositório', async () => {
  await withFixture(async (repoRoot) => {
    const raw = task({
      id: 'TASK-0002',
      upstream_task_id: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
    });
    const originalBytes = await linkedFixture(repoRoot, {
      roundId: 'R-0007',
      id: 'TASK-0002',
      raw,
      canonical: task({
        id: 'TASK-0002',
        upstream_task_id: 'TASK-0001',
        tags: [
          'legacy-prep-index:tasks/_legacy-originals/prep-prerequisites.json',
        ],
      }),
    });
    await writeU1Index(repoRoot, originalBytes, (index) => ({
      ...index,
      budget_path: '../../outside.json',
    }));
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /path|escape|outside|U1/iu);
  });
});

test('dado U1 com horário fabricado quando verifica índice então rejeita precedência temporal inventada', async () => {
  await withFixture(async (repoRoot) => {
    const raw = task({
      id: 'TASK-0002',
      upstream_task_id: 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL',
    });
    const originalBytes = await linkedFixture(repoRoot, {
      roundId: 'R-0007',
      id: 'TASK-0002',
      raw,
      canonical: task({
        id: 'TASK-0002',
        upstream_task_id: 'TASK-0001',
        tags: [
          'legacy-prep-index:tasks/_legacy-originals/prep-prerequisites.json',
        ],
      }),
    });
    await writeU1Index(repoRoot, originalBytes, (index) => ({
      ...index,
      historical_dispatch_timestamp: '2026-09-15T19:00:00Z',
      final_success_timestamp: '2026-09-15T18:00:00Z',
    }));
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /timestamp|unknown|temporal|U1/iu);
  });
});

test('dado T1 com terceiro worker inventado quando verifica índice então preserva limite 2', async () => {
  await withFixture(async (repoRoot) => {
    const raw = await historicalSourceBytes(
      `${rounds}/R-0006/tasks/TASK-0003.json`,
      'ee8fba71002cb436d35b37ef533621ca037f12093f33a9b0194dae788060b0a0',
    );
    const originalBytes = await linkedFixture(repoRoot, {
      roundId: 'R-0006',
      id: 'TASK-0003',
      raw,
      canonical: task({
        id: 'TASK-0003',
        round_id: 'R-0006',
        status: 'escalated',
        iteration_count: 3,
        max_iterations: 3,
        tags: [
          'legacy-escalation-index:tasks/_legacy-originals/TASK-0003-escalation.json',
        ],
      }),
    });
    await writeT1Index(repoRoot, originalBytes, (index) => ({
      ...index,
      iteration_count: 3,
      max_iterations: 3,
      worker_dispatches: 3,
    }));
    const result = run(originalsVerifier, repoRoot);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /iteration|worker|T1|escalat/iu);
  });
});

test('dado normalizador arquivístico quando inspeciona fonte então não invoca despacho nem escreve estado runtime', async () => {
  const sources = await Promise.all(
    [normalizer, originalsVerifier].map((path) => readFile(path, 'utf8')),
  );
  for (const source of sources) {
    assert.doesNotMatch(
      source,
      /materializeRoundQueueTask|runRoundTasks|startRoundTask|worker\.sh|round\s+task|round\s+run/iu,
    );
    assert.doesNotMatch(
      source,
      /(?:writeFile|rename|mkdir|atomic)\s*\([^)]*(?:\.devai\/|record\/)/su,
    );
  }
});
