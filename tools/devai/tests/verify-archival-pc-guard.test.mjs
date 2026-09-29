import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../../..');
const verifier = join(
  repositoryRoot,
  'tools/devai/verify-archival-pc-guard.mjs',
);

const sources = [
  ['TASK-0004-S1', 'task-prompt'],
  ['TASK-0004-S2', 'task-prompt'],
  ['TASK-0004-S2-R1', 'task-prompt'],
  ['TASK-0004-S3', 'task-prompt'],
  ['TASK-0004-S4', 'task-prompt'],
  ['TASK-0004-S5', 'task-prompt'],
  ['TASK-0078', 'task-json-original'],
  ['TASK-0079', 'task-json-original'],
  ['TASK-0080', 'task-json-original'],
  ['TASK-0081', 'task-json-original'],
  ['TASK-0082', 'task-json-original'],
];

const originalTaskHashes = new Map([
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

async function readOriginalTaskBytes(id) {
  const tasks = join(repositoryRoot, 'work/rounds/R-0007/tasks');
  let bytes;
  try {
    bytes = await readFile(join(tasks, '_legacy-originals', `${id}.json.raw`));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    bytes = await readFile(join(tasks, `${id}.json`));
  }
  assert.equal(digest(bytes), originalTaskHashes.get(id), id);
  return bytes;
}

const auditorBridges = new Map([
  [
    'TASK-0078',
    {
      path: 'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final.bridge.json',
      sha256:
        'dc07c7541f65173c338da45846b1d358843c2b2b29e86563e2312a2626954583',
    },
  ],
  [
    'TASK-0080',
    {
      path: 'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-2.bridge.json',
      sha256:
        'c6e3fd82236f71bad5345a6b86800ac28f24013320d01a2937a5f2ff8477c90d',
    },
  ],
  [
    'TASK-0082',
    {
      path: 'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-3.bridge.json',
      sha256:
        'bff8f502cf0baf954537ecb8d95c1f9978b2d0c75ebc3515fd9d36acade24980',
    },
  ],
]);

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalize(value) {
  return value
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/[ \t\n]+$/u, '');
}

function sourcePath(taskId, kind) {
  return kind === 'task-prompt'
    ? `work/rounds/R-0007/prompts/${taskId}.md`
    : `work/rounds/R-0007/tasks/${taskId}.json`;
}

function run(repoRoot) {
  return spawnSync(process.execPath, [verifier, '--repo-root', repoRoot], {
    encoding: 'utf8',
  });
}

async function applyFixture(repoRoot, manifest) {
  const packageEntries = [];
  const canonicalTasks = [];
  const sidecars = [];
  const aliases = [];

  for (const [index, source] of manifest.original_sources.entries()) {
    const originalTaskBytes = await readOriginalTaskBytes(source.task_id);
    const originalTask = JSON.parse(originalTaskBytes);
    const canonicalId = index < 6 ? `TASK-00${83 + index}` : source.task_id;
    const originalTaskPath = `work/rounds/R-0007/tasks/${source.task_id}.json`;
    const sidecarPath = `work/rounds/R-0007/tasks/_legacy-originals/${source.task_id}.json.raw`;
    const packagePath = `work/rounds/R-0007/compositions-archive/${source.task_id}.txt`;
    const bridge = auditorBridges.get(source.task_id);
    if (bridge) {
      const bridgeBytes = await readFile(join(repositoryRoot, bridge.path));
      assert.equal(digest(bridgeBytes), bridge.sha256);
      await mkdir(join(repoRoot, bridge.path, '..'), { recursive: true });
      await writeFile(join(repoRoot, bridge.path), bridgeBytes);
    }
    const selection =
      index < 6
        ? {
            mode: 'exact',
            registry_id: index < 3 ? 'gpt-5.6-terra' : 'gpt-5.6-luna',
          }
        : originalTask.executor.selection;
    const historicalPc =
      originalTask.prompt_composition_id ??
      originalTask.executor.prompt_composition_id ??
      'NONE';
    const packageBytes = Buffer.from(
      [
        'det-archival-composition-v1',
        'round_id=R-0007',
        `task_id=${source.task_id}`,
        `original_task_sha256=${digest(originalTaskBytes)}`,
        `source_kind=${source.kind === 'task-json-original' ? 'task-json' : source.kind}`,
        `source_path=${source.path}`,
        `source_sha256=${source.raw_sha256}`,
        'selection_mode=exact',
        `selection_registry_id=${selection.registry_id}`,
        `historical_pc=${historicalPc}`,
        `review_bridge_path=${bridge?.path ?? 'NONE'}`,
        `review_bridge_sha256=${bridge?.sha256 ?? 'NONE'}`,
        'historical_equivalence=false',
        '',
      ].join('\n'),
    );
    const packageHash = digest(packageBytes);
    const promptCompositionId = `PC-${packageHash.slice(0, 16)}`;
    const sidecar = join(repoRoot, sidecarPath);
    await mkdir(join(sidecar, '..'), { recursive: true });
    await writeFile(sidecar, originalTaskBytes);
    await mkdir(join(repoRoot, packagePath, '..'), { recursive: true });
    await writeFile(join(repoRoot, packagePath), packageBytes);

    if (source.kind === 'task-json-original') {
      source.resolved_path = sidecarPath;
    }
    const taskPath = `work/rounds/R-0007/tasks/${canonicalId}.json`;
    const task = {
      schemaVersion: '2.0.0',
      id: canonicalId,
      round_id: 'R-0007',
      status: 'completed',
      prompt_composition_id: promptCompositionId,
      tags: [
        `legacy-original:${sidecarPath.replace('work/rounds/R-0007/', '')}`,
        `legacy-sha256:${digest(originalTaskBytes)}`,
        'archival-pc-provenance:reconstructed-v1',
        'archival-pc-not-historical',
        `archival-pc-package:${packagePath}`,
        ...(index < 6
          ? ['legacy-selection:absent', 'archival-selection:prospective-exact']
          : [`legacy-prompt-composition:${historicalPc}`]),
      ],
      executor: {
        kind: 'agent',
        selection,
        prompt_composition_id: promptCompositionId,
      },
    };
    await mkdir(join(repoRoot, taskPath, '..'), { recursive: true });
    await writeFile(
      join(repoRoot, taskPath),
      `${JSON.stringify(task, null, 2)}\n`,
    );
    const taskBytes = await readFile(join(repoRoot, taskPath));
    const packageEntry = {
      round_id: 'R-0007',
      task_id: source.task_id,
      canonical_task_id: canonicalId,
      path: packagePath,
      raw_sha256: packageHash,
      canonical_sha256: digest(canonicalize(packageBytes)),
      prompt_composition_id: promptCompositionId,
      original_task_path: originalTaskPath,
      original_task_sha256: digest(originalTaskBytes),
      source: {
        kind: source.kind === 'task-json-original' ? 'task-json' : source.kind,
        path: source.path,
        sha256: source.raw_sha256,
      },
      selection,
      historical_pc: historicalPc,
      review_bridge: bridge ?? null,
      authorization: {
        path: 'work/rounds/R-0020/AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md',
        decision: '2B',
      },
      provenance: 'archival-reconstruction',
      historical_equivalence: false,
    };
    packageEntries.push(packageEntry);
    canonicalTasks.push({
      task_id: source.task_id,
      canonical_id: canonicalId,
      path: taskPath,
      raw_sha256: digest(taskBytes),
      canonical_sha256: digest(canonicalize(taskBytes)),
      prompt_composition_id: promptCompositionId,
    });
    sidecars.push({
      task_id: source.task_id,
      path: sidecarPath,
      raw_sha256: digest(originalTaskBytes),
      canonical_sha256: digest(canonicalize(originalTaskBytes)),
    });
    if (index < 6) {
      aliases.push({
        round_id: 'R-0007',
        old_id: source.task_id,
        new_id: canonicalId,
        old_path: originalTaskPath.replace('work/rounds/R-0007/', ''),
        canonical_path: taskPath.replace('work/rounds/R-0007/', ''),
        sidecar_path: sidecarPath.replace('work/rounds/R-0007/', ''),
        original_sha256: digest(originalTaskBytes),
      });
    }
  }

  const aliasesPath = 'work/rounds/R-0007/tasks/_legacy-originals/aliases.json';
  await writeFile(
    join(repoRoot, aliasesPath),
    `${JSON.stringify(aliases, null, 2)}\n`,
  );

  const indexPath = 'work/rounds/R-0007/compositions-archive/index.json';
  const indexBytes = Buffer.from(
    `${JSON.stringify(
      {
        schemaVersion: '1.0.0',
        round_id: 'R-0007',
        authorization: {
          path: 'work/rounds/R-0020/AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md',
          decision: '2B',
        },
        provenance: 'archival-reconstruction',
        aliases_path: aliasesPath,
        entries: packageEntries,
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(join(repoRoot, indexPath), indexBytes);
  manifest.archive_packages = packageEntries;
  manifest.canonical_tasks = canonicalTasks;
  manifest.sidecars = sidecars;
  manifest.archive_index = { path: indexPath, sha256: digest(indexBytes) };
}

async function writeFixture({ status = 'pre-migration' } = {}) {
  const repoRoot = await mkdtemp(join(tmpdir(), 'detran-archival-pc-guard-'));
  const originalSources = [];

  for (const [taskId, kind] of sources) {
    const path = sourcePath(taskId, kind);
    const bytes =
      kind === 'task-json-original'
        ? await readOriginalTaskBytes(taskId)
        : await readFile(join(repositoryRoot, path));
    await mkdir(join(repoRoot, path, '..'), { recursive: true });
    await writeFile(join(repoRoot, path), bytes);
    originalSources.push({
      task_id: taskId,
      kind,
      path,
      raw_sha256: digest(bytes),
      canonical_sha256: digest(canonicalize(bytes)),
    });
  }

  const manifest = {
    schemaVersion: '1.0.0',
    round_id: 'R-0007',
    status,
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
  const manifestPath = join(
    repoRoot,
    'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json',
  );
  await mkdir(join(manifestPath, '..'), { recursive: true });
  if (status === 'applied') {
    await applyFixture(repoRoot, manifest);
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { repoRoot, manifest, manifestPath, originalSources };
}

async function withFixture(options, callback) {
  const fixture = await writeFixture(options);
  try {
    await callback(fixture);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
}

test('dado manifesto pré-migração íntegro quando verifica guarda então aceita', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const result = run(repoRoot);
    assert.equal(result.status, 0, result.stderr);
  });
});

test('dado manifesto applied íntegro quando verifica guarda então aceita', async () => {
  await withFixture({ status: 'applied' }, async ({ repoRoot }) => {
    const result = run(repoRoot);
    assert.equal(result.status, 0, result.stderr);
  });
});

test('dado fixture applied quando confere A3.2 então preserva sidecars, tags e bridges', async () => {
  await withFixture({ status: 'applied' }, async ({ repoRoot, manifest }) => {
    const archiveIndex = JSON.parse(
      await readFile(join(repoRoot, manifest.archive_index.path)),
    );
    assert.equal(archiveIndex.round_id, 'R-0007');
    assert.equal(archiveIndex.provenance, 'archival-reconstruction');
    assert.equal(archiveIndex.authorization.decision, '2B');
    assert.equal(archiveIndex.entries.length, 11);
    const aliases = JSON.parse(
      await readFile(join(repoRoot, archiveIndex.aliases_path)),
    );
    assert.equal(aliases.length, 6);
    const promptSources = manifest.original_sources.filter(
      (source) => source.kind === 'task-prompt',
    );
    for (const source of promptSources) {
      const sidecar = manifest.sidecars.find(
        (entry) => entry.task_id === source.task_id,
      );
      const canonical = manifest.canonical_tasks.find(
        (entry) => entry.task_id === source.task_id,
      );
      assert.ok(sidecar);
      assert.ok(canonical);
      assert.notEqual(sidecar.path, source.path);
      assert.deepEqual(
        await readFile(join(repoRoot, sidecar.path)),
        await readOriginalTaskBytes(source.task_id),
      );
      const task = JSON.parse(await readFile(join(repoRoot, canonical.path)));
      assert.ok(task.tags.includes('legacy-selection:absent'));
      assert.ok(task.tags.includes('archival-selection:prospective-exact'));
      assert.equal(
        task.prompt_composition_id,
        task.executor.prompt_composition_id,
      );
      assert.equal(task.executor.selection.mode, 'exact');
    }
    for (const [taskId, bridge] of auditorBridges) {
      const archive = manifest.archive_packages.find(
        (entry) => entry.task_id === taskId,
      );
      assert.ok(archive);
      assert.equal(
        digest(await readFile(join(repoRoot, bridge.path))),
        bridge.sha256,
      );
      assert.match(
        await readFile(join(repoRoot, archive.path), 'utf8'),
        new RegExp(`review_bridge_sha256=${bridge.sha256}`),
      );
    }
    for (const source of manifest.original_sources.filter(
      (entry) => entry.kind === 'task-json-original',
    )) {
      const archive = manifest.archive_packages.find(
        (entry) => entry.task_id === source.task_id,
      );
      assert.ok(archive);
      assert.match(
        await readFile(join(repoRoot, archive.path), 'utf8'),
        /^source_kind=task-json$/m,
      );
    }
    for (const entry of archiveIndex.entries) {
      const source = manifest.original_sources.find(
        (candidate) => candidate.task_id === entry.task_id,
      );
      const canonical = manifest.canonical_tasks.find(
        (candidate) => candidate.task_id === entry.task_id,
      );
      const sidecar = manifest.sidecars.find(
        (candidate) => candidate.task_id === entry.task_id,
      );
      assert.ok(source);
      assert.ok(canonical);
      assert.ok(sidecar);
      assert.equal(
        sidecar.path,
        `work/rounds/R-0007/tasks/_legacy-originals/${entry.task_id}.json.raw`,
      );
      assert.equal(entry.canonical_task_id, canonical.canonical_id);
      assert.equal(entry.original_task_sha256, sidecar.raw_sha256);
      assert.equal(entry.source.path, source.path);
      assert.equal(entry.source.sha256, source.raw_sha256);
      assert.equal(entry.provenance, 'archival-reconstruction');
      assert.equal(entry.historical_equivalence, false);
      assert.match(entry.prompt_composition_id, /^PC-[a-f0-9]{16}$/);
      assert.equal(
        entry.raw_sha256,
        digest(await readFile(join(repoRoot, entry.path))),
      );
      assert.equal(
        entry.prompt_composition_id,
        `PC-${entry.raw_sha256.slice(0, 16)}`,
      );
      const task = JSON.parse(await readFile(join(repoRoot, canonical.path)));
      assert.ok(task.tags.includes('archival-pc-provenance:reconstructed-v1'));
      assert.ok(task.tags.includes('archival-pc-not-historical'));
      assert.ok(task.tags.includes(`archival-pc-package:${entry.path}`));
      assert.equal(task.prompt_composition_id, entry.prompt_composition_id);
      assert.equal(
        task.executor.prompt_composition_id,
        entry.prompt_composition_id,
      );
    }
  });
});

test('dado variantes canônicas de fonte quando calcula hash então preserva digest', () => {
  const canonical = Buffer.from('Papel: Inspector\nTarefa: TASK-0004-S1');
  const variants = [
    canonical,
    Buffer.from('Papel: Inspector\r\nTarefa: TASK-0004-S1\r\n'),
    Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      canonical,
      Buffer.from('\n'),
    ]),
    Buffer.from('Papel: Inspector  \nTarefa: TASK-0004-S1\n\n'),
  ];
  for (const variant of variants) {
    assert.equal(
      digest(canonicalize(variant)),
      digest(canonicalize(canonical)),
    );
  }
});

test('dado manifesto ausente quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot, manifestPath }) => {
    await rm(manifestPath);
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /manifest|ARCHIVAL_PC_GUARD_INTEGRITY/i);
  });
});

test('dado status desconhecido quando verifica guarda então falha fechada', async () => {
  await withFixture({ status: 'interrupted' }, async ({ repoRoot }) => {
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /status|integrity/i);
  });
});

test('dado fonte com hash divergente quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot, originalSources }) => {
    await writeFile(join(repoRoot, originalSources[0].path), 'altered\n');
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /TASK-0004-S1|sha256|hash/i);
  });
});

test('dado pacote antecipado em pré-migração quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const packages = join(repoRoot, 'work/rounds/R-0007/compositions-archive');
    await mkdir(packages, { recursive: true });
    await writeFile(join(packages, 'TASK-0004-S1.txt'), 'partial\n');
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /compositions-archive|pre-migration/i);
  });
});

test('dado store R-0007 quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const store = join(repoRoot, '.devai/state/tasks/TASK-0004-S1.json');
    await mkdir(join(store, '..'), { recursive: true });
    await writeFile(store, '{"round_id":"R-0007"}\n');
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /store|R-0007|state/i);
  });
});

test('dado G0 ausente ou vazio quando verifica guarda então aceita', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const state = join(repoRoot, '.devai/state');
    await mkdir(join(state, 'tasks'), { recursive: true });
    await writeFile(join(state, 'backlog.jsonl'), '');
    const result = run(repoRoot);
    assert.equal(result.status, 0, result.stderr);
  });
});

test('dado G0 malformado quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const backlog = join(repoRoot, '.devai/state/backlog.jsonl');
    await mkdir(join(backlog, '..'), { recursive: true });
    await writeFile(backlog, '{not-json}\n');
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /backlog|malformed|json|state/i);
  });
});

test('dado backlog R-0007 quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const backlog = join(repoRoot, '.devai/state/backlog.jsonl');
    await mkdir(join(backlog, '..'), { recursive: true });
    await writeFile(backlog, '{"round_id":"R-0007"}\n');
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /backlog|R-0007|state/i);
  });
});

test('dado fonte simbólica quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot, originalSources }) => {
    const path = join(repoRoot, originalSources[0].path);
    const outside = join(repoRoot, 'outside.md');
    await writeFile(outside, 'Papel: Inspector\nTarefa: TASK-0004-S1\n');
    await rm(path);
    await symlink(outside, path);
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /symlink|link|escape|path/i);
  });
});

test('dado disco aplicado e manifesto regressivo quando verifica guarda então falha fechada', async () => {
  await withFixture({}, async ({ repoRoot }) => {
    const packages = join(repoRoot, 'work/rounds/R-0007/compositions-archive');
    await mkdir(packages, { recursive: true });
    await writeFile(
      join(packages, 'TASK-0004-S1.txt'),
      'det-archival-composition-v1\n',
    );
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /pre-migration|regress|compositions-archive/i);
  });
});

test('dado manifesto applied sem índice quando verifica guarda então falha fechada', async () => {
  await withFixture({ status: 'applied' }, async ({ repoRoot, manifest }) => {
    await rm(join(repoRoot, manifest.archive_index.path));
    const result = run(repoRoot);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /index|applied|integrity/i);
  });
});

test('dado uso inválido quando verifica guarda então retorna 2', () => {
  const result = spawnSync(process.execPath, [verifier], { encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
});
