import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
  unlink,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import * as prettier from 'prettier';
import { verifyGuard } from './assert-archival-prompt-not-dispatchable.mjs';

const taskFile = /^TASK-.*\.json$/u;
const taskId = /^TASK-[0-9]{4,}$/u;
const round = /^R-([0-9]{4})$/u;
const ctg = /^CTG-[0-9]{4,}$/u;
const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const allowlistFile =
  'work/rounds/R-0020/contracts/CTG-0003-A3.1-none-allowlist.json';
const reportFile = 'work/rounds/R-0020/reports/A3-migration-before-after.json';
const taskProperties = new Set([
  'schemaVersion',
  'id',
  'round_id',
  'status',
  'discipline',
  'discipline_specialization',
  'title',
  'description',
  'lifecycle',
  'acceptance_commands',
  'coupled_task_group',
  'coupled_pipeline_position',
  'upstream_task_id',
  'target_substrates',
  'target_modules',
  'target_invariants',
  'db_isolation',
  'iteration_count',
  'max_iterations',
  'created_at',
  'spawned_at',
  'completed_at',
  'branch',
  'worktree_id',
  'prompt_composition_id',
  'executor',
  'intent_diff',
  'actual_diff',
  'iteration_trail',
  'priority',
  'tags',
]);

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const jsonFormatOptions =
  (await prettier.resolveConfig(join(scriptRoot, 'package.json'))) ?? {};

async function formattedJson(value) {
  return Buffer.from(
    await prettier.format(JSON.stringify(value), {
      ...jsonFormatOptions,
      parser: 'json',
    }),
  );
}
const generalTrailPaths = new Set([
  'work/rounds/R-0003/tasks/TASK-0001.json',
  'work/rounds/R-0003/tasks/TASK-0002.json',
  'work/rounds/R-0003/tasks/TASK-0003.json',
  'work/rounds/R-0006/tasks/TASK-0001.json',
  'work/rounds/R-0006/tasks/TASK-0008.json',
  'work/rounds/R-0006/tasks/TASK-0012.json',
  'work/rounds/R-0006/tasks/TASK-0014.json',
  'work/rounds/R-0009/tasks/TASK-0003.json',
  'work/rounds/R-0009/tasks/TASK-0006.json',
]);
const emptyUpstreamPaths = new Set([
  'work/rounds/R-0012/tasks/TASK-0001.json',
  'work/rounds/R-0016/tasks/TASK-0001.json',
]);
function trailNeedsArchival(trail) {
  return (
    !Array.isArray(trail) ||
    trail.some(
      (entry) =>
        !entry ||
        typeof entry !== 'object' ||
        Array.isArray(entry) ||
        !Object.hasOwn(entry, 'started_at') ||
        !Object.hasOwn(entry, 'verdict') ||
        Object.keys(entry).some(
          (key) =>
            ![
              'iteration',
              'started_at',
              'ended_at',
              'verdict',
              'hard_gate_failures',
              'soft_gate_failures',
              'evidence_refs',
            ].includes(key),
        ),
    )
  );
}
const ctgAliases = new Map([
  ['R-0012/CTG-0002a', 'CTG-9001'],
  ['R-0012/CTG-0002b', 'CTG-9002'],
  ['R-0012/CTG-0002b-1', 'CTG-9003'],
  ['R-0012/CTG-0002b-2', 'CTG-9004'],
  ['R-0012/CTG-0002c', 'CTG-9005'],
  ['R-0013/CTG-0004a', 'CTG-9006'],
  ['R-0013/CTG-0004b', 'CTG-9007'],
  ['R-0014/CTG-0003a', 'CTG-9008'],
  ['R-0014/CTG-0003b', 'CTG-9009'],
  ['R-0014/CTG-0003c', 'CTG-9010'],
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
const externalInvariants = new Set(['INV-EVIDENCE-001', 'INV-OFFLINE-001']);
const externalInvariantTasks = new Set([
  'R-0005/TASK-0002',
  'R-0005/TASK-0003',
]);
const executorNoteTasks = new Set([
  'R-0014/TASK-0010',
  'R-0014/TASK-0011',
  'R-0014/TASK-0012',
  'R-0014/TASK-0022',
]);
const pcAliases = new Map([
  ['TASK-0004-S1', 'TASK-0083'],
  ['TASK-0004-S2', 'TASK-0084'],
  ['TASK-0004-S2-R1', 'TASK-0085'],
  ['TASK-0004-S3', 'TASK-0086'],
  ['TASK-0004-S4', 'TASK-0087'],
  ['TASK-0004-S5', 'TASK-0088'],
]);
const archivalPcIds = new Set([
  ...pcAliases.keys(),
  'TASK-0078',
  'TASK-0079',
  'TASK-0080',
  'TASK-0081',
  'TASK-0082',
]);
const bridgePaths = new Map([
  [
    'TASK-0078',
    'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final.bridge.json',
  ],
  [
    'TASK-0080',
    'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-2.bridge.json',
  ],
  [
    'TASK-0082',
    'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-3.bridge.json',
  ],
]);

const canonicalize = (bytes) =>
  bytes
    .toString('utf8')
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/u, ''))
    .join('\n')
    .replace(/[ \t\n]+$/u, '');
const ledgerIndices = [5, 6, 10, 16, 17, 18, 19, 25, 26];
const u1Sources = new Map([
  [
    'work/rounds/R-0007/budget.json',
    '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
  ],
  [
    'work/rounds/R-0007/plan.md',
    '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
  ],
  [
    'work/rounds/R-0007/prompts/TASK-0002.md',
    '12be7876c39ec63068b60a8dbaf9c4b374afc57f82b76651a527d6c211eec15c',
  ],
]);
const t1Sources = new Map([
  [
    'work/rounds/R-0006/plan.md',
    'aa03e2e01fb060ed37cc0425503e671b1ad3d5bb005e7adcb5b1e644342ddb60',
  ],
  [
    'work/rounds/R-0006/budget.json',
    'c28ca54c69bf861e6646cc135693a8eb3a099877494d674cda9f6ee364208e5d',
  ],
  [
    'work/rounds/R-0006/reviews/delivery-review-CTG-0001.md',
    'b835a177d4e3b2a19106c0b31eee2519536e51c7e2cb5fb4085a00bfae693ffd',
  ],
  [
    'work/rounds/R-0006/reviews/delivery-review-CTG-0001-2.md',
    '913389a30cbdcbfefb573038f04d5b2b8b55cecdb7cfd26ef3699771de720e3d',
  ],
  [
    'work/rounds/R-0006/reviews/delivery-review-CTG-0001-3.md',
    '95691f5488363fcfe2fc094212bf3ecd4485f4c0cfcb55792906519a1e8abf1d',
  ],
  [
    'work/rounds/R-0006/reviews/delivery-review-CTG-0001-4.md',
    '93f29b22825163b24b836678fd82a2d60f43898ca3f78a75e1562b2770c5fbbf',
  ],
]);
const d1Rows = new Map([
  [
    'TASK-0001-D1',
    [
      'TASK-0019',
      '07fed96b53f3b69618621658a5f02ee16f556c1091ecbd97ab5188f8c5a79da3',
    ],
  ],
  [
    'TASK-0002-D1',
    [
      'TASK-0020',
      'e12b7024b1873bb62e26430b42c7191694840a593dd14a771feffe734b39971c',
    ],
  ],
  [
    'TASK-0003-D1',
    [
      'TASK-0021',
      '78dec1456d50d88c9075bfe7e2e68cb92b36b765ebc95a31839bfb2fc16289a4',
    ],
  ],
  [
    'TASK-0004-D1',
    [
      'TASK-0022',
      '550bf9088dc64d93541bb9c058574f67a3d7d017df1a8a562add87c617fba163',
    ],
  ],
]);
const pending = (path, field, reason) =>
  `${path}: source_pending ${field}: ${reason}`;

function argumentsRoot(argv) {
  if (argv.length !== 2 || argv[0] !== '--repo-root') {
    process.stderr.write(
      'usage: node tools/devai/normalize-tasks.mjs --repo-root <path>\n',
    );
    process.exit(2);
  }
  return resolve(argv[1]);
}

async function taskPaths(repoRoot) {
  const roundsRoot = join(repoRoot, 'work/rounds');
  if (!existsSync(roundsRoot)) return [];
  const paths = [];
  for (const entry of await readdir(roundsRoot, { withFileTypes: true })) {
    const match = round.exec(entry.name);
    if (
      !entry.isDirectory() ||
      !match ||
      Number(match[1]) < 3 ||
      Number(match[1]) > 20
    )
      continue;
    const directory = join(roundsRoot, entry.name, 'tasks');
    if (!existsSync(directory)) continue;
    for (const task of await readdir(directory, { withFileTypes: true })) {
      if (task.isFile() && taskFile.test(task.name))
        paths.push(join(directory, task.name));
    }
  }
  return paths.toSorted();
}

async function allowlist(repoRoot) {
  const path = join(repoRoot, allowlistFile);
  if (!existsSync(path)) return new Map();
  try {
    const data = JSON.parse(await readFile(path, 'utf8'));
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const canonical = entries
      .toSorted((a, b) => a.path.localeCompare(b.path))
      .map((entry) => `${entry.path}\t${entry.original_sha256}\n`)
      .join('');
    if (
      data.decision !== 'A3.1' ||
      sha256(canonical) !== data.canonical_digest_sha256 ||
      entries.some(
        (entry) =>
          !entry ||
          typeof entry.path !== 'string' ||
          !/^[a-f0-9]{64}$/u.test(entry.original_sha256 ?? ''),
      )
    )
      throw new Error('invalid allowlist');
    if (new Set(entries.map((entry) => entry.path)).size !== entries.length)
      throw new Error('duplicate allowlist path');
    return new Map(entries.map((entry) => [entry.path, entry.original_sha256]));
  } catch (error) {
    throw new Error(`source_pending A3.1 allowlist: ${error.message}`);
  }
}

async function roleMatrix(repoRoot) {
  const path = join(
    repoRoot,
    'work/rounds/R-0020/contracts/CTG-0003-A3.4-role-matrix.json',
  );
  if (!existsSync(path)) return new Map();
  const matrix = JSON.parse(await readFile(path, 'utf8'));
  if (
    matrix.status !== 'applied' ||
    matrix.prospective_enforcement !== 'pending' ||
    matrix.historical_write_authority !== 'unclassified-at-write' ||
    !Array.isArray(matrix.entries) ||
    matrix.entries.length !== 2
  )
    throw new Error('source_pending A3.4 status or provenance');
  const result = new Map();
  for (const entry of matrix.entries) {
    if (
      ![
        'work/rounds/R-0003/tasks/TASK-0004.json',
        'work/rounds/R-0005/tasks/TASK-0009.json',
      ].includes(entry.task_path) ||
      entry.projected_discipline !== 'owner' ||
      !Array.isArray(entry.required_tags) ||
      entry.required_tags.length !== 3 ||
      entry.required_tags[0] !== 'authority-enforcement:pending' ||
      entry.required_tags[1] !==
        'historical-write-authority:unclassified-at-write' ||
      entry.required_tags[2] !==
        `historical-authority-discrepancy:${entry.task_path.split('/')[2]}-${entry.task_path.split('/').at(-1).replace('.json', '')}`
    )
      throw new Error(`source_pending A3.4 ROLE matrix: ${entry.task_path}`);
    if (
      sha256(await readFile(join(repoRoot, entry.prompt_path))) !==
      entry.prompt_sha256
    )
      throw new Error(`source_pending A3.4 prompt hash: ${entry.task_path}`);
    if (
      entry.evidence_path &&
      sha256(await readFile(join(repoRoot, entry.evidence_path))) !==
        entry.evidence_sha256
    )
      throw new Error(`source_pending A3.4 receipt hash: ${entry.task_path}`);
    const expectedPaths = entry.task_path.includes('/R-0003/')
      ? [
          'apps/dashboard/web/README.md',
          'docs/framework/arch/dashboard-build-pack.md',
          'docs/meta/knowledge-base/decision-closure-plan.md',
          'docs/meta/knowledge-base/backlog.md',
        ]
      : [
          'backend/domains/ops/README.md',
          'docs/framework/arch/teat-build-pack.md',
          'docs/framework/blueprints/README.md',
          'docs/meta/knowledge-base/decision-closure-plan.md',
          'docs/meta/knowledge-base/backlog.md',
          'docs/framework/arch/teat-route-contract.md',
        ];
    if (
      JSON.stringify(entry.paths?.map((row) => row.path)) !==
        JSON.stringify(expectedPaths) ||
      entry.paths.some(
        (row) =>
          !/^[a-f0-9]{64}$/u.test(row.receipt_artifact_sha256 ?? '') ||
          row.prospective_class !==
            (row.path.startsWith('docs/') ? 'F1' : 'F2') ||
          row.prospective_role !==
            (row.path.startsWith('docs/') ? 'architect' : 'engineer'),
      )
    )
      throw new Error(`source_pending A3.4 paths/receipt: ${entry.task_path}`);
    const prompt = await readFile(join(repoRoot, entry.prompt_path), 'utf8');
    if (!prompt.includes(entry.historical_literals?.prompt_role ?? ''))
      throw new Error(`source_pending A3.4 prompt literal: ${entry.task_path}`);
    if (entry.task_path.includes('/R-0005/')) {
      const evidence = JSON.parse(
        await readFile(join(repoRoot, entry.evidence_path), 'utf8'),
      );
      if (
        evidence.role !== entry.historical_literals?.evidence_role ||
        entry.paths.some(
          (row) =>
            !evidence.artifacts?.some(
              (item) =>
                item.path === row.path &&
                item.sha256 === row.receipt_artifact_sha256,
            ),
        )
      )
        throw new Error(
          `source_pending A3.4 evidence receipt/literal: ${entry.task_path}`,
        );
    } else if (
      entry.historical_literals?.evidence_role !== null ||
      entry.evidence_path
    )
      throw new Error(
        `source_pending A3.4 evidence literal: ${entry.task_path}`,
      );
    if (entry.historical_policy_at_write?.apps_backend_grant_count !== 0)
      throw new Error(
        `source_pending A3.4 retrospective grant: ${entry.task_path}`,
      );
    result.set(entry.task_path, entry);
  }
  return result;
}

async function stateIdentityPresent(repoRoot, roundId, taskId) {
  const state = join(repoRoot, '.devai/state');
  const files = [join(state, 'backlog.jsonl')];
  const tasks = join(state, 'tasks');
  if (existsSync(tasks))
    for (const name of await readdir(tasks))
      if (name.endsWith('.json')) files.push(join(tasks, name));
  for (const file of files) {
    if (!existsSync(file)) continue;
    const content = await readFile(file, 'utf8');
    const values = [];
    try {
      values.push(JSON.parse(content));
    } catch {
      for (const line of content.split('\n')) {
        try {
          values.push(JSON.parse(line));
        } catch {
          /* non-JSON state text has no task identity */
        }
      }
    }
    if (
      values.some(
        (item) => item?.round_id === roundId && (!taskId || item.id === taskId),
      )
    )
      return true;
  }
  return false;
}

async function sourceHashes(repoRoot, sources, label) {
  for (const [path, expected] of sources) {
    let actual;
    try {
      actual = sha256(await readFile(join(repoRoot, path)));
    } catch {
      actual = 'missing';
    }
    if (actual !== expected)
      throw new Error(`source_pending ${label} ${path} sha256 mismatch`);
  }
}

async function specialIndex(repoRoot, kind, task, original) {
  if (kind === 'U1') {
    await sourceHashes(repoRoot, u1Sources, 'U1 budget/plan/prompt');
    const entries = JSON.parse(
      await readFile(join(repoRoot, 'work/rounds/R-0007/budget.json')),
    ).entries;
    const selected = ledgerIndices.map((index) => ({
      index,
      id: entries[index]?.id,
      status: entries[index]?.status,
      class:
        index === 5
          ? 'initial'
          : [6, 18].includes(index)
            ? 'retry'
            : [10, 19].includes(index)
              ? 'escalation'
              : [16, 25].includes(index)
                ? 'prep'
                : 'corrective',
    }));
    if (selected.some((row) => !row.id || !row.status))
      throw new Error('source_pending U1 budget ledger');
    return {
      path: 'work/rounds/R-0007/tasks/_legacy-originals/prep-prerequisites.json',
      value: {
        schemaVersion: '1.0.0',
        round_id: 'R-0007',
        task_id_literal: 'TASK-0002',
        task_id_canonical: 'TASK-0002',
        original_task_sha256: sha256(original),
        original_upstream_literal: task.upstream_task_id,
        ordering_basis: 'budget-entry-order',
        budget_path: 'work/rounds/R-0007/budget.json',
        budget_sha256: u1Sources.get('work/rounds/R-0007/budget.json'),
        plan_path: 'work/rounds/R-0007/plan.md',
        plan_sha256: u1Sources.get('work/rounds/R-0007/plan.md'),
        prompt_path: 'work/rounds/R-0007/prompts/TASK-0002.md',
        prompt_sha256: u1Sources.get('work/rounds/R-0007/prompts/TASK-0002.md'),
        ledger_entries: selected,
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
      },
    };
  }
  await sourceHashes(repoRoot, t1Sources, 'T1 review');
  return {
    path: 'work/rounds/R-0006/tasks/_legacy-originals/TASK-0003-escalation.json',
    value: {
      schemaVersion: '1.0.0',
      round_id: 'R-0006',
      task_id: 'TASK-0003',
      original_task_sha256: sha256(original),
      sidecar_path: 'tasks/_legacy-originals/TASK-0003.json.raw',
      iteration_count: task.iteration_count,
      max_iterations: task.max_iterations,
      iteration_trail: task.iteration_trail,
      trail_iteration_3_is_review_cycle_not_worker_dispatch: true,
      worker_dispatches: 2,
      sources: [...t1Sources].map(([path, hash]) => ({ path, sha256: hash })),
      review_3_status: 'FAIL',
      review_4_status: 'PASS',
      task_status: 'escalated',
    },
  };
}

const expectedArchivalPc = new Map([
  ['TASK-0004-S1', 'PC-cc41f39f237dccdd'],
  ['TASK-0004-S2', 'PC-cf0578539d9b03e6'],
  ['TASK-0004-S2-R1', 'PC-2151b3056f67043d'],
  ['TASK-0004-S3', 'PC-8ec9b108bf290ede'],
  ['TASK-0004-S4', 'PC-d0a290d9320c85b9'],
  ['TASK-0004-S5', 'PC-1d975bf1835e7f30'],
  ['TASK-0078', 'PC-22b18cc1bd9af201'],
  ['TASK-0079', 'PC-cc3dc8e959e09510'],
  ['TASK-0080', 'PC-1766eb9f01d0bafa'],
  ['TASK-0081', 'PC-aedea88033f4eb98'],
  ['TASK-0082', 'PC-10b9b527af7d35af'],
]);
const expectedBridges = new Map([
  [
    'TASK-0078',
    'dc07c7541f65173c338da45846b1d358843c2b2b29e86563e2312a2626954583',
  ],
  [
    'TASK-0080',
    'c6e3fd82236f71bad5345a6b86800ac28f24013320d01a2937a5f2ff8477c90d',
  ],
  [
    'TASK-0082',
    'bff8f502cf0baf954537ecb8d95c1f9978b2d0c75ebc3515fd9d36acade24980',
  ],
]);
const authorizationPath =
  'work/rounds/R-0020/AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md';
const archiveRoot = 'work/rounds/R-0007/compositions-archive';
const aliasPath = 'work/rounds/R-0007/tasks/_legacy-originals/aliases.json';

async function buildPcBundle(repoRoot, paths) {
  const pendingPc = [];
  for (const path of paths) {
    const name = path
      .split('/')
      .at(-1)
      .replace(/\.json$/u, '');
    if (!path.includes('/R-0007/tasks/') || !archivalPcIds.has(name)) continue;
    const task = JSON.parse(await readFile(path));
    if (
      !/^PC-[a-f0-9]{16}$/u.test(task.executor?.prompt_composition_id ?? '') ||
      !task.executor?.selection ||
      !/^TASK-[0-9]{4,}$/u.test(task.id ?? '')
    )
      pendingPc.push(path);
  }
  if (!pendingPc.length) return null;
  const manifestPath =
    'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json';
  if (!existsSync(join(repoRoot, manifestPath)))
    throw new Error('source_pending A3.5 manifest missing');
  const manifest = await verifyGuard(repoRoot);
  if (manifest.status !== 'pre-migration')
    throw new Error('source_pending A3.5 manifest must be pre-migration');
  if (pendingPc.length !== 11 || manifest.original_sources.length !== 11)
    throw new Error(
      'source_pending A3.5 eleven PC-B originals required as one lot',
    );
  const bundle = new Map();
  const packages = [];
  const aliases = [];
  const pcs = new Set();
  for (const [index, source] of manifest.original_sources.entries()) {
    const id = source.task_id;
    const originalPath = `work/rounds/R-0007/tasks/${id}.json`;
    const original = await readFile(join(repoRoot, originalPath));
    const task = JSON.parse(original);
    if (task.id !== id || task.round_id !== 'R-0007')
      throw new Error(`source_pending A3.5 original identity: ${id}`);
    const canonicalId = pcAliases.get(id) ?? id;
    if (
      canonicalId !== id &&
      existsSync(join(repoRoot, `work/rounds/R-0007/tasks/${canonicalId}.json`))
    )
      throw new Error(`source_pending A3 alias collision: ${canonicalId}`);
    const selection =
      index < 6
        ? {
            mode: 'exact',
            registry_id: index < 3 ? 'gpt-5.6-terra' : 'gpt-5.6-luna',
          }
        : task.executor?.selection;
    if (selection?.mode !== 'exact' || !selection.registry_id)
      throw new Error(`source_pending PC-B selection: ${id}`);
    const historicalPc =
      task.prompt_composition_id ??
      task.executor?.prompt_composition_id ??
      'NONE';
    const bridgePath = bridgePaths.get(id) ?? 'NONE';
    const bridgeHash = expectedBridges.get(id) ?? 'NONE';
    if (
      bridgePath !== 'NONE' &&
      sha256(await readFile(join(repoRoot, bridgePath))) !== bridgeHash
    )
      throw new Error(`source_pending PC-B review bridge sha256: ${id}`);
    const sourceKind =
      source.kind === 'task-json-original' ? 'task-json' : source.kind;
    const packagePath = `${archiveRoot}/${id}.txt`;
    const packageBytes = Buffer.from(
      [
        'det-archival-composition-v1',
        'round_id=R-0007',
        `task_id=${id}`,
        `original_task_sha256=${sha256(original)}`,
        `source_kind=${sourceKind}`,
        `source_path=${source.path}`,
        `source_sha256=${source.raw_sha256}`,
        'selection_mode=exact',
        `selection_registry_id=${selection.registry_id}`,
        `historical_pc=${historicalPc}`,
        `review_bridge_path=${bridgePath}`,
        `review_bridge_sha256=${bridgeHash}`,
        'historical_equivalence=false',
        '',
      ].join('\n'),
    );
    const hash = sha256(packageBytes);
    const pc = `PC-${hash.slice(0, 16)}`;
    if (pc !== expectedArchivalPc.get(id) || pcs.has(pc))
      throw new Error(`source_pending PC-B candidate collision/hash: ${id}`);
    pcs.add(pc);
    const tags = [
      'archival-pc-provenance:reconstructed-v1',
      'archival-pc-not-historical',
      `archival-pc-package:${packagePath}`,
      ...(index < 6
        ? ['legacy-selection:absent', 'archival-selection:prospective-exact']
        : [`legacy-prompt-composition:${historicalPc}`]),
    ];
    const bridge =
      bridgePath === 'NONE' ? null : { path: bridgePath, sha256: bridgeHash };
    const entry = {
      round_id: 'R-0007',
      task_id: id,
      canonical_task_id: canonicalId,
      path: packagePath,
      raw_sha256: hash,
      canonical_sha256: sha256(canonicalize(packageBytes)),
      prompt_composition_id: pc,
      original_task_path: originalPath,
      original_task_sha256: sha256(original),
      source: {
        kind: sourceKind,
        path: source.path,
        sha256: source.raw_sha256,
      },
      selection,
      historical_pc: historicalPc,
      review_bridge: bridge,
      authorization: { path: authorizationPath, decision: '2B' },
      provenance: 'archival-reconstruction',
      historical_equivalence: false,
    };
    bundle.set(id, {
      canonicalId,
      pc,
      selection,
      tags,
      packageBytes,
      entry,
      original,
      source,
    });
    packages.push(entry);
    if (index < 6)
      aliases.push({
        round_id: 'R-0007',
        old_id: id,
        new_id: canonicalId,
        old_path: `tasks/${id}.json`,
        canonical_path: `tasks/${canonicalId}.json`,
        sidecar_path: `tasks/_legacy-originals/${id}.json.raw`,
        original_sha256: sha256(original),
      });
  }
  return { bundle, packages, aliases, manifest, manifestPath };
}

async function buildD1(repoRoot, paths) {
  const selected = paths.filter((path) =>
    /\/R-0007\/tasks\/TASK-000[1-4]-D1\.json$/u.test(path),
  );
  if (!selected.length) return null;
  const originals = new Map();
  for (const path of selected) {
    const name = path
      .split('/')
      .at(-1)
      .replace(/\.json$/u, '');
    const spec = d1Rows.get(name);
    const bytes = await readFile(path);
    if (!spec || sha256(bytes) !== spec[1])
      throw new Error(`source_pending D1 sha256 mismatch: ${name}`);
    const task = JSON.parse(bytes);
    if (task.id !== spec[0] || task.round_id !== 'R-0007')
      throw new Error(`source_pending D1 identity: ${name}`);
    originals.set(name, { path, bytes, task });
  }
  if (selected.length !== 4)
    throw new Error('source_pending D1 requires all four snapshots');
  await sourceHashes(
    repoRoot,
    new Map(
      [...u1Sources].filter(
        ([path]) => path.endsWith('budget.json') || path.endsWith('plan.md'),
      ),
    ),
    'D1 plan/budget',
  );
  const posterior = new Map([
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
  ]);
  for (const [id, hash] of posterior) {
    const path = `work/rounds/R-0007/tasks/${id}.json`;
    if (sha256(await readFile(join(repoRoot, path))) !== hash)
      throw new Error(`source_pending D1 posterior sha256 mismatch: ${id}`);
  }
  const entries = [...d1Rows].map(([name, [id, hash]], index) => {
    const task = originals.get(name).task;
    return {
      round_id: 'R-0007',
      old_path: `tasks/${name}.json`,
      id,
      original_sha256: hash,
      sidecar_path: `tasks/_legacy-originals/${name}.json.raw`,
      literal_status: task.status,
      literal_pc:
        task.prompt_composition_id ??
        task.executor?.prompt_composition_id ??
        null,
      iteration_count: task.iteration_count,
      max_iterations: task.max_iterations,
      disposition: index === 0 ? 'canonical-move' : 'superseded-snapshot',
      ...(index
        ? {
            posterior_path: `tasks/${id}.json`,
            posterior_sha256: posterior.get(id),
            ledger_indices: [37, 39, 40, 41, 42],
          }
        : {}),
    };
  });
  const index = {
    schemaVersion: '1.0.0',
    round_id: 'R-0007',
    decision: 'D1',
    plan_path: 'work/rounds/R-0007/plan.md',
    plan_sha256: u1Sources.get('work/rounds/R-0007/plan.md'),
    budget_path: 'work/rounds/R-0007/budget.json',
    budget_sha256: u1Sources.get('work/rounds/R-0007/budget.json'),
    missing_report:
      'work/rounds/R-0007/reports/TASK-0020-D1.md absent in local corpus',
    entries,
  };
  return { originals, index };
}

async function invariants(repoRoot) {
  try {
    const trace = JSON.parse(
      await readFile(join(repoRoot, 'law/trace.json'), 'utf8'),
    );
    return new Set(
      (trace.invariants ?? [])
        .map((entry) => entry?.id)
        .filter((id) => typeof id === 'string'),
    );
  } catch {
    return null;
  }
}

function plan({
  task,
  original,
  displayPath,
  knownInvariants,
  allowed,
  roleEntry,
  pcBundle,
  alreadyLinked,
  current,
  existingRawPath,
}) {
  const issues = [];
  if (!task || typeof task !== 'object' || Array.isArray(task))
    return { issues: [pending(displayPath, 'document', 'object required')] };
  if (task.schemaVersion !== '2.0.0')
    issues.push(pending(displayPath, 'schemaVersion', '2.0.0 is required'));
  const filename = displayPath.split('/').at(-1);
  const archivalAlias =
    displayPath.startsWith('work/rounds/R-0007/tasks/') &&
    pcAliases.has(task.id) &&
    filename === `${task.id}.json`;
  if (!taskId.test(task.id ?? '') && !archivalAlias)
    issues.push(
      pending(displayPath, 'id', 'canonical TASK id is not evidenced'),
    );
  if (task.round_id !== displayPath.split('/')[2])
    issues.push(
      pending(displayPath, 'round_id', 'owner round is not evidenced'),
    );
  const key = `${task.round_id}/${task.id}`;
  const canonical = structuredClone(task);
  const tags = Array.isArray(canonical.tags) ? [...canonical.tags] : [];
  const transformed = [];
  const addTag = (tag) => {
    if (!tags.includes(tag)) tags.push(tag);
  };
  for (const property of Object.keys(task)) {
    if (taskProperties.has(property)) continue;
    if (
      ['execution_evidence', 'closure_reconciliation'].includes(property) &&
      task.round_id === 'R-0007'
    ) {
      delete canonical[property];
      transformed.push(property);
    } else
      issues.push(
        pending(
          displayPath,
          property,
          'additional property requires an A3 source',
        ),
      );
  }
  if (canonical.executor?.note !== undefined) {
    if (executorNoteTasks.has(key)) {
      delete canonical.executor.note;
      transformed.push('executor.note');
    } else
      issues.push(
        pending(displayPath, 'executor.note', 'EX-NOTE source is required'),
      );
  }
  if (typeof canonical.title === 'string' && canonical.title.length > 200) {
    const editorial = editorialTitles.get(key);
    if (editorial) {
      canonical.title = editorial;
      transformed.push('title');
    } else
      issues.push(
        pending(displayPath, 'title', 'TITLE editorial source is required'),
      );
  }
  if (archivalAlias) {
    canonical.id = pcAliases.get(task.id);
    transformed.push('id');
  }
  if (displayPath === 'work/rounds/R-0007/tasks/TASK-0001-D1.json') {
    addTag('legacy-basename:TASK-0001-D1');
    transformed.push('filename');
  }
  if (
    roleEntry &&
    !['owner', 'architect', 'inspector', 'engineer', 'auditor'].includes(
      canonical.discipline,
    )
  ) {
    if (task.status !== 'completed')
      issues.push(pending(displayPath, 'ROLE', 'A3.4 requires completed'));
    else if (
      roleEntry.original_task_sha256 !== sha256(original) ||
      roleEntry.historical_literals?.task_discipline !== task.discipline
    )
      issues.push(
        pending(displayPath, 'ROLE', 'A3.4 original hash or literal differs'),
      );
    else {
      canonical.discipline = 'owner';
      addTag(`legacy-discipline:${task.discipline}`);
      addTag('archival-role-projection:owner-delegated');
      for (const tag of roleEntry.required_tags) addTag(tag);
      transformed.push('discipline');
    }
  } else if (
    !['owner', 'architect', 'inspector', 'engineer', 'auditor'].includes(
      canonical.discipline,
    )
  )
    issues.push(pending(displayPath, 'discipline', 'ROLE source is required'));
  if (canonical.status === 'completed_incomplete') {
    if (
      task.round_id === 'R-0007' &&
      ['TASK-0004-S2', 'TASK-0004-S3', 'TASK-0084', 'TASK-0086'].includes(
        task.id,
      )
    ) {
      canonical.status = 'checkpoint';
      addTag('legacy-status:completed_incomplete');
      transformed.push('status');
    } else issues.push(pending(displayPath, 'status', 'S1 source is required'));
  }
  if (
    task.round_id === 'R-0007' &&
    typeof canonical.coupled_pipeline_position === 'string' &&
    !['architect', 'inspector', 'engineer'].includes(
      canonical.coupled_pipeline_position,
    )
  ) {
    if (
      [
        'TASK-0004',
        ...pcAliases.keys(),
        ...pcAliases.values(),
        'TASK-0078',
        'TASK-0080',
        'TASK-0082',
      ].includes(task.id)
    ) {
      addTag(`legacy-pipeline-position:${canonical.coupled_pipeline_position}`);
      canonical.coupled_pipeline_position = null;
      transformed.push('coupled_pipeline_position');
    } else
      issues.push(
        pending(
          displayPath,
          'coupled_pipeline_position',
          'P1 source is required',
        ),
      );
  }
  if (
    typeof canonical.upstream_task_id === 'string' &&
    pcAliases.has(canonical.upstream_task_id)
  ) {
    canonical.upstream_task_id = pcAliases.get(canonical.upstream_task_id);
    transformed.push('upstream_task_id');
  }
  if (canonical.upstream_task_id === '') {
    if (
      task.round_id === 'R-0007' &&
      ['TASK-0002', 'TASK-0003'].includes(task.id)
    ) {
      canonical.upstream_task_id = null;
      transformed.push('upstream_task_id');
    } else if (
      emptyUpstreamPaths.has(displayPath) &&
      allowed.get(displayPath) === sha256(original)
    ) {
      canonical.upstream_task_id = null;
      addTag('legacy-upstream-empty');
      transformed.push('upstream_task_id');
    } else
      issues.push(
        pending(
          displayPath,
          'upstream_task_id',
          'empty predecessor requires an authorized path and original hash',
        ),
      );
  }
  if (
    typeof canonical.coupled_task_group === 'string' &&
    !ctg.test(canonical.coupled_task_group)
  ) {
    const alias = ctgAliases.get(
      `${task.round_id}/${canonical.coupled_task_group}`,
    );
    if (alias) {
      addTag(`legacy-ctg:${canonical.coupled_task_group}`);
      canonical.coupled_task_group = alias;
      transformed.push('coupled_task_group');
    } else
      issues.push(
        pending(displayPath, 'coupled_task_group', 'A3.2 source is required'),
      );
  }
  if (!Array.isArray(task.target_invariants ?? []))
    issues.push(pending(displayPath, 'target_invariants', 'array is required'));
  const retained = [];
  for (const token of canonical.target_invariants ?? []) {
    if (typeof token !== 'string')
      issues.push(
        pending(displayPath, 'target_invariants', 'token is not a string'),
      );
    else if (!token.startsWith('INV-')) {
      if (!tags.includes(`ref:${token}`)) tags.push(`ref:${token}`);
      transformed.push('target_invariants');
    } else if (!knownInvariants || !knownInvariants.has(token)) {
      if (externalInvariants.has(token) && externalInvariantTasks.has(key)) {
        addTag(`ref:${token}`);
        transformed.push('target_invariants');
      } else
        issues.push(
          pending(
            displayPath,
            'target_invariants',
            `${token} is not confirmed by law/trace.json`,
          ),
        );
    } else retained.push(token);
  }
  if (
    canonical.target_invariants !== undefined &&
    JSON.stringify(retained) !== JSON.stringify(canonical.target_invariants)
  )
    canonical.target_invariants = retained;
  const listedHash = allowed.get(displayPath);
  if (canonical.db_isolation === 'none') {
    if (!listedHash)
      issues.push(
        pending(
          displayPath,
          'db_isolation',
          'A3.1 allowlist does not contain this TASK',
        ),
      );
    else if (listedHash !== sha256(original))
      issues.push(
        pending(
          displayPath,
          'db_isolation',
          'A3.1 allowlist sha256 does not match original bytes',
        ),
      );
    else {
      canonical.db_isolation = 'database';
      for (const tag of [
        'legacy-db-isolation:none',
        'legacy-db-policy:prospective-database',
      ])
        if (!tags.includes(tag)) tags.push(tag);
      transformed.push('db_isolation');
    }
  } else if (
    task.round_id === 'R-0007' &&
    ['TASK-0079', 'TASK-0081'].includes(task.id) &&
    canonical.db_isolation === 'detran_r7_ctg1_a2'
  ) {
    canonical.db_isolation = 'database';
    addTag('legacy-db-isolation:detran_r7_ctg1_a2');
    transformed.push('db_isolation');
  } else if (!['database', 'cluster'].includes(canonical.db_isolation))
    issues.push(
      pending(
        displayPath,
        'db_isolation',
        'effective isolation is not evidenced for conversion',
      ),
    );
  else if (!alreadyLinked && listedHash === sha256(original))
    issues.push(
      pending(
        displayPath,
        'db_isolation',
        'A3.1 allowlisted original must contain literal none',
      ),
    );
  if (
    task.round_id === 'R-0007' &&
    task.id === 'TASK-0002' &&
    canonical.upstream_task_id === 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL'
  ) {
    canonical.upstream_task_id = 'TASK-0001';
    addTag('legacy-prep-index:tasks/_legacy-originals/prep-prerequisites.json');
    transformed.push('upstream_task_id');
  }
  if (
    generalTrailPaths.has(displayPath) &&
    Array.isArray(canonical.iteration_trail) &&
    trailNeedsArchival(canonical.iteration_trail)
  ) {
    delete canonical.iteration_trail;
    transformed.push('iteration_trail');
  }
  if (
    task.round_id === 'R-0006' &&
    task.id === 'TASK-0003' &&
    Array.isArray(canonical.iteration_trail) &&
    canonical.iteration_trail.some((entry) => entry && !entry.started_at)
  ) {
    if (
      canonical.status !== 'escalated' ||
      canonical.iteration_count !== 2 ||
      canonical.max_iterations !== 2
    )
      issues.push(pending(displayPath, 'T1', 'escalation facts differ'));
    else {
      delete canonical.iteration_trail;
      addTag(
        'legacy-escalation-index:tasks/_legacy-originals/TASK-0003-escalation.json',
      );
      transformed.push('iteration_trail');
    }
  }
  if (
    canonical.iteration_trail !== undefined &&
    trailNeedsArchival(canonical.iteration_trail)
  )
    issues.push(
      pending(
        displayPath,
        'iteration_trail',
        'legacy trail requires an authorized A3 destination',
      ),
    );
  if (pcBundle?.has(task.id)) {
    const entry = pcBundle.get(task.id);
    canonical.id = entry.canonicalId;
    canonical.prompt_composition_id = entry.pc;
    canonical.executor.prompt_composition_id = entry.pc;
    canonical.executor.selection = entry.selection;
    for (const tag of entry.tags) addTag(tag);
    transformed.push('prompt_composition_id', 'executor.prompt_composition_id');
  }
  if (issues.length) return { issues };
  if (tags.length) canonical.tags = [...new Set(tags)];
  if (JSON.stringify(canonical) === JSON.stringify(task)) return { issues: [] };
  const rawPath =
    existingRawPath ??
    `tasks/_legacy-originals/${displayPath.split('/').at(-1)}.raw`;
  canonical.tags = [
    ...new Set([
      ...(canonical.tags ?? []),
      `legacy-original:${rawPath}`,
      `legacy-sha256:${sha256(original)}`,
    ]),
  ];
  return {
    issues: [],
    change: {
      canonical,
      displayPath,
      original,
      current,
      rawPath,
      task,
      canonicalPath: `work/rounds/${task.round_id}/tasks/${canonical.id}.json`,
      transformed: [...new Set(transformed)],
    },
  };
}

function provenance(field, change) {
  if (field === 'db_isolation')
    return change.old.db_isolation === 'none'
      ? { decision: 'A3.1', source: allowlistFile }
      : { decision: 'A3', source: 'work/rounds/R-0007/plan.md' };
  if (field === 'discipline')
    return {
      decision: 'A3.4-P2',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.4-role-matrix.json',
    };
  if (field === 'id')
    return {
      decision: 'A3',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.md',
    };
  if (field === 'target_invariants')
    return {
      decision: 'A3/1A',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
    };
  if (
    [
      'coupled_task_group',
      'title',
      'execution_evidence',
      'closure_reconciliation',
    ].includes(field)
  )
    return {
      decision: '1A',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
    };
  if (field === 'executor')
    return archivalPcIds.has(change.old.id)
      ? {
          decision: '2B',
          source:
            'work/rounds/R-0020/contracts/CTG-0003-A3.2-expc-reconstruction.md',
        }
      : {
          decision: '1A EX-NOTE',
          source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
        };
  if (field === 'prompt_composition_id')
    return {
      decision: '2B',
      source:
        'work/rounds/R-0020/contracts/CTG-0003-A3.2-expc-reconstruction.md',
    };
  if (
    field === 'iteration_trail' &&
    generalTrailPaths.has(
      change.displayPath ??
        `work/rounds/${change.canonical.round_id}/tasks/${change.canonical.id}.json`,
    )
  )
    return {
      decision: 'A3.2 EV-DEST=A',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
    };
  if (
    field === 'upstream_task_id' &&
    change.old.upstream_task_id === '' &&
    emptyUpstreamPaths.has(
      `work/rounds/${change.canonical.round_id}/tasks/${change.canonical.id}.json`,
    )
  )
    return {
      decision: 'A3.2 UP-empty',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
    };
  if (
    [
      'status',
      'coupled_pipeline_position',
      'upstream_task_id',
      'iteration_trail',
    ].includes(field)
  )
    return {
      decision: field === 'upstream_task_id' ? '4A U1/A3' : '3A/4A',
      source: 'work/rounds/R-0020/contracts/CTG-0003-A3.3-gap-proposal.md',
    };
  return {
    decision: 'A3',
    source: 'work/rounds/R-0020/contracts/CTG-0003-A3.md',
  };
}

async function schemaValid(schema, output) {
  const directory = await mkdtemp(join(tmpdir(), 'detran-normalize-task-'));
  try {
    const instance = join(directory, 'TASK.json');
    const schemaCopy = join(directory, 'law/schemas/task.schema.json');
    await mkdir(dirname(schemaCopy), { recursive: true });
    await writeFile(schemaCopy, await readFile(schema));
    await writeFile(instance, output);
    const result = spawnSync(
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
        schemaCopy,
        '--instance',
        instance,
        '--format',
        'human',
      ],
      { cwd: scriptRoot, encoding: 'utf8' },
    );
    return result.status === 0;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function atomic(path, contents) {
  const temporary = `${path}.normalize-${process.pid}.tmp`;
  await writeFile(temporary, contents, { flag: 'wx' });
  await rename(temporary, path);
}

async function main() {
  const repoRoot = argumentsRoot(process.argv.slice(2));
  let allowed;
  try {
    allowed = await allowlist(repoRoot);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
    return;
  }
  const knownInvariants = await invariants(repoRoot);
  let roles;
  try {
    roles = await roleMatrix(repoRoot);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
    return;
  }
  const issues = [];
  const changes = [];
  const paths = await taskPaths(repoRoot);
  let pcContext;
  let d1Context;
  try {
    pcContext = await buildPcBundle(repoRoot, paths);
    d1Context = await buildD1(repoRoot, paths);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
    return;
  }
  const reservedCtgs = new Set(ctgAliases.values());
  for (const path of paths) {
    try {
      const task = JSON.parse(await readFile(path));
      if (reservedCtgs.has(task.coupled_task_group)) {
        const original = (task.tags ?? []).find(
          (tag) => typeof tag === 'string' && tag.startsWith('legacy-ctg:'),
        );
        const expected =
          original &&
          ctgAliases.get(
            `${task.round_id}/${original.slice('legacy-ctg:'.length)}`,
          );
        if (expected !== task.coupled_task_group)
          issues.push(
            pending(
              relative(repoRoot, path),
              'coupled_task_group',
              `${task.coupled_task_group} collision with reserved A3.2 alias`,
            ),
          );
      }
    } catch {
      /* parsing is reported per task below */
    }
  }
  for (const path of paths) {
    const displayPath = relative(repoRoot, path);
    if (d1Context && /\/TASK-000[2-4]-D1\.json$/u.test(displayPath)) continue;
    try {
      const current = await readFile(path);
      const task = JSON.parse(current);
      const originalTag = (task.tags ?? []).find(
        (tag) => typeof tag === 'string' && tag.startsWith('legacy-original:'),
      );
      let original = current;
      if (originalTag) {
        const rawPath = originalTag.slice('legacy-original:'.length);
        if (
          !rawPath.startsWith('tasks/_legacy-originals/') ||
          rawPath.includes('..')
        )
          throw new Error('invalid linked sidecar path');
        original = await readFile(
          join(dirname(path), rawPath.slice('tasks/'.length)),
        );
      }
      const roleEntry = roles.get(displayPath);
      if (roleEntry && task.discipline === 'owner') {
        if (
          task.status !== 'completed' ||
          roleEntry.original_task_sha256 !== sha256(original) ||
          roleEntry.required_tags.some(
            (tag) =>
              (task.tags ?? []).filter((value) => value === tag).length !== 1,
          )
        )
          issues.push(
            pending(
              displayPath,
              'ROLE',
              'A3.4 canonical status, original hash or required tags differ',
            ),
          );
      }
      const result = plan({
        task,
        original,
        current,
        alreadyLinked: Boolean(originalTag),
        existingRawPath: originalTag?.slice('legacy-original:'.length),
        roleEntry,
        pcBundle: pcContext?.bundle,
        displayPath,
        knownInvariants,
        allowed,
      });
      issues.push(...result.issues);
      if (result.change) changes.push({ ...result.change, path });
    } catch {
      issues.push(pending(displayPath, 'document', 'valid JSON is required'));
    }
  }
  if (
    changes.some((change) => change.task.round_id === 'R-0007') &&
    (await stateIdentityPresent(repoRoot, 'R-0007'))
  )
    issues.push('source_pending G0 R-0007 identity in store/backlog');
  for (const entry of roles.values()) {
    const match =
      /^work\/rounds\/(R-[0-9]{4})\/tasks\/(TASK-[0-9]{4})\.json$/u.exec(
        entry.task_path,
      );
    if (match && (await stateIdentityPresent(repoRoot, match[1], match[2])))
      issues.push(
        pending(entry.task_path, 'ROLE', 'A3.4 identity in store/backlog'),
      );
  }
  const repositorySchema = join(repoRoot, 'law/schemas/task.schema.json');
  const schema = existsSync(repositorySchema)
    ? repositorySchema
    : join(scriptRoot, 'law/schemas/task.schema.json');
  const auxiliary = [];
  for (const change of changes) {
    if (
      change.task.round_id === 'R-0007' &&
      change.task.id === 'TASK-0002' &&
      change.task.upstream_task_id ===
        'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL'
    ) {
      try {
        auxiliary.push(
          await specialIndex(repoRoot, 'U1', change.task, change.original),
        );
      } catch (error) {
        issues.push(pending(change.displayPath, 'U1', error.message));
      }
    }
    if (
      change.task.round_id === 'R-0007' &&
      ['TASK-0079', 'TASK-0081'].includes(change.task.id) &&
      change.task.db_isolation === 'detran_r7_ctg1_a2'
    ) {
      try {
        await sourceHashes(
          repoRoot,
          new Map([
            [
              'work/rounds/R-0007/plan.md',
              u1Sources.get('work/rounds/R-0007/plan.md'),
            ],
          ]),
          'A3 database plan',
        );
      } catch (error) {
        issues.push(pending(change.displayPath, 'db_isolation', error.message));
      }
    }
    if (
      change.task.round_id === 'R-0006' &&
      change.task.id === 'TASK-0003' &&
      change.transformed.includes('iteration_trail')
    ) {
      try {
        auxiliary.push(
          await specialIndex(repoRoot, 'T1', change.task, change.original),
        );
      } catch (error) {
        issues.push(pending(change.displayPath, 'T1', error.message));
      }
    }
    change.output = await formattedJson(change.canonical);
    if (!(await schemaValid(schema, change.output)))
      issues.push(
        pending(
          change.displayPath,
          'schema',
          'normalized candidate does not satisfy the canonical schema',
        ),
      );
    const sidecar = join(
      dirname(change.path),
      '_legacy-originals',
      change.rawPath.split('/').at(-1),
    );
    if (
      existsSync(sidecar) &&
      !(await readFile(sidecar)).equals(change.original)
    )
      issues.push(
        pending(
          change.displayPath,
          'sidecar',
          'existing sidecar sha256 does not match original bytes',
        ),
      );
  }
  if (pcContext && !issues.length) {
    const changesById = new Map(
      changes.map((change) => [change.task.id, change]),
    );
    if ([...pcContext.bundle.keys()].some((id) => !changesById.has(id)))
      issues.push(
        'source_pending A3.5 all eleven canonical TASK candidates are required',
      );
    else {
      pcContext.index = {
        schemaVersion: '1.0.0',
        round_id: 'R-0007',
        authorization: { path: authorizationPath, decision: '2B' },
        provenance: 'archival-reconstruction',
        aliases_path: aliasPath,
        entries: pcContext.packages,
      };
      pcContext.indexBytes = await formattedJson(pcContext.index);
      pcContext.appliedManifest = structuredClone(pcContext.manifest);
      pcContext.appliedManifest.status = 'applied';
      pcContext.appliedManifest.original_sources =
        pcContext.appliedManifest.original_sources.map((source) =>
          source.kind === 'task-json-original'
            ? {
                ...source,
                resolved_path: `work/rounds/R-0007/tasks/_legacy-originals/${source.task_id}.json.raw`,
              }
            : source,
        );
      pcContext.appliedManifest.archive_packages = pcContext.packages;
      pcContext.appliedManifest.canonical_tasks = [...pcContext.bundle].map(
        ([id, entry]) => {
          const change = changesById.get(id);
          return {
            task_id: id,
            canonical_id: entry.canonicalId,
            path: `work/rounds/R-0007/tasks/${entry.canonicalId}.json`,
            raw_sha256: sha256(change.output),
            canonical_sha256: sha256(canonicalize(change.output)),
            prompt_composition_id: entry.pc,
          };
        },
      );
      pcContext.appliedManifest.sidecars = [...pcContext.bundle].map(
        ([id, entry]) => ({
          task_id: id,
          path: `work/rounds/R-0007/tasks/_legacy-originals/${id}.json.raw`,
          raw_sha256: sha256(entry.original),
          canonical_sha256: sha256(canonicalize(entry.original)),
        }),
      );
      pcContext.appliedManifest.archive_index = {
        path: `${archiveRoot}/index.json`,
        sha256: sha256(pcContext.indexBytes),
      };
    }
  }
  if (!issues.length) {
    const candidate = new Map();
    for (const path of paths) {
      const display = relative(repoRoot, path);
      if (d1Context && /\/TASK-000[1-4]-D1\.json$/u.test(display)) continue;
      const task = JSON.parse(await readFile(path));
      if (task.round_id === 'R-0007') candidate.set(task.id, task);
    }
    for (const change of changes)
      if (change.task.round_id === 'R-0007') {
        candidate.delete(change.task.id);
        candidate.set(change.canonical.id, change.canonical);
      }
    for (const item of candidate.values()) {
      const visited = new Set();
      let cursor = item;
      while (
        cursor?.upstream_task_id &&
        candidate.has(cursor.upstream_task_id)
      ) {
        if (visited.has(cursor.id)) {
          issues.push(
            pending(`R-0007/${item.id}`, 'C1', 'explicit upstream cycle'),
          );
          break;
        }
        visited.add(cursor.id);
        cursor = candidate.get(cursor.upstream_task_id);
      }
    }
  }
  if (issues.length) {
    process.stderr.write(`${issues.toSorted().join('\n')}\n`);
    process.exitCode = 1;
    return;
  }
  if (d1Context) {
    const dir = join(repoRoot, 'work/rounds/R-0007/tasks/_legacy-originals');
    await mkdir(dir, { recursive: true });
    for (const [name, entry] of d1Context.originals) {
      const sidecar = join(dir, `${name}.json.raw`);
      if (!existsSync(sidecar))
        await writeFile(sidecar, entry.bytes, { flag: 'wx' });
      else if (!(await readFile(sidecar)).equals(entry.bytes))
        throw new Error(`D1 sidecar mismatch: ${name}`);
    }
    await atomic(
      join(dir, 'd1-superseded-snapshots.json'),
      await formattedJson(d1Context.index),
    );
  }
  for (const change of changes) {
    const sidecar = join(
      dirname(change.path),
      '_legacy-originals',
      change.rawPath.split('/').at(-1),
    );
    await mkdir(dirname(sidecar), { recursive: true });
    if (!existsSync(sidecar))
      await writeFile(sidecar, change.original, { flag: 'wx' });
    if (!(await readFile(sidecar)).equals(change.original))
      throw new Error(`${change.displayPath}: sidecar verification failed`);
    if (!(await readFile(change.path)).equals(change.current))
      throw new Error(`${change.displayPath}: source changed after preflight`);
    for (const item of auxiliary.filter((item) =>
      item.path.includes(`/R-${change.task.round_id.split('-')[1]}/`),
    )) {
      const output = await formattedJson(item.value);
      const destination = join(repoRoot, item.path);
      if (!existsSync(destination)) await atomic(destination, output);
      else if (!(await readFile(destination)).equals(output))
        throw new Error(`${item.path}: source_pending index bytes differ`);
    }
    const destination = join(repoRoot, change.canonicalPath);
    if (destination !== change.path && existsSync(destination))
      throw new Error(`${change.displayPath}: canonical collision`);
    await atomic(destination, change.output);
    if (destination !== change.path) await unlink(change.path);
  }
  if (d1Context) {
    for (const [name, entry] of d1Context.originals)
      if (name !== 'TASK-0001-D1') await unlink(entry.path);
  }
  if (pcContext) {
    await mkdir(join(repoRoot, archiveRoot), { recursive: true });
    for (const [id, entry] of pcContext.bundle) {
      const destination = join(repoRoot, archiveRoot, `${id}.txt`);
      if (!existsSync(destination))
        await writeFile(destination, entry.packageBytes, { flag: 'wx' });
      else if (!(await readFile(destination)).equals(entry.packageBytes))
        throw new Error(`PC-B package bytes changed: ${id}`);
    }
    await atomic(
      join(repoRoot, aliasPath),
      await formattedJson(pcContext.aliases),
    );
    await atomic(
      join(repoRoot, archiveRoot, 'index.json'),
      pcContext.indexBytes,
    );
    await atomic(
      join(repoRoot, pcContext.manifestPath),
      await formattedJson(pcContext.appliedManifest),
    );
    await verifyGuard(repoRoot);
  }
  const linked = [];
  for (const path of await taskPaths(repoRoot)) {
    const canonical = JSON.parse(await readFile(path, 'utf8'));
    const originalTag = (canonical.tags ?? []).find((tag) =>
      tag.startsWith('legacy-original:'),
    );
    const hashTag = (canonical.tags ?? []).find((tag) =>
      tag.startsWith('legacy-sha256:'),
    );
    if (!originalTag || !hashTag) continue;
    const rawPath = originalTag.slice('legacy-original:'.length);
    const original = await readFile(
      join(dirname(path), rawPath.slice('tasks/'.length)),
    );
    const old = JSON.parse(original);
    const canonicalBytes = await readFile(path);
    const transformed = [
      ...new Set(
        [...Object.keys(old), ...Object.keys(canonical)].filter(
          (field) =>
            JSON.stringify(old[field]) !== JSON.stringify(canonical[field]) &&
            field !== 'tags',
        ),
      ),
    ];
    linked.push({
      path,
      canonical,
      canonicalBytes,
      old,
      original,
      rawPath,
      transformed,
    });
  }
  if (linked.length) {
    const migrations = linked
      .map((change) => {
        const fields = change.transformed.map((field) => ({
          field,
          ...provenance(field, change),
          historical_value: change.old[field] ?? null,
          canonical_value: change.canonical[field] ?? null,
        }));
        return {
          round_id: change.canonical.round_id,
          old_id: change.old.id,
          new_id: change.canonical.id,
          old_path: `tasks/${change.rawPath
            .split('/')
            .at(-1)
            .replace(/\.raw$/u, '')}`,
          canonical_path: `tasks/${change.path.split('/').at(-1)}`,
          sidecar_path: change.rawPath,
          original_sha256: sha256(change.original),
          original_bytes: change.original.length,
          canonical_sha256: sha256(change.canonicalBytes),
          canonical_bytes: change.canonicalBytes.length,
          transformed_fields: change.transformed,
          ...(change.old.id === 'TASK-0004-S2'
            ? { successors: ['TASK-0085'] }
            : {}),
          ...(change.old.id === 'TASK-0004-S3'
            ? { successors: ['TASK-0087', 'TASK-0088'] }
            : {}),
          field_sources: fields,
          sidecar_only_fields: change.transformed.filter(
            (field) => !Object.hasOwn(change.canonical, field),
          ),
          decision:
            [...new Set(fields.map((field) => field.decision))].join('+') ||
            'A3',
          schema_status: 'pass',
        };
      })
      .map((change) => ({
        ...change,
      }))
      .toSorted((a, b) =>
        `${a.round_id}/${a.old_path}`.localeCompare(
          `${b.round_id}/${b.old_path}`,
        ),
      );
    const d1IndexPath = join(
      repoRoot,
      'work/rounds/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json',
    );
    if (existsSync(d1IndexPath)) {
      const d1Index = JSON.parse(await readFile(d1IndexPath, 'utf8'));
      for (const row of d1Index.entries.slice(1)) {
        const original = await readFile(
          join(repoRoot, 'work/rounds/R-0007', row.sidecar_path),
        );
        const canonicalPath = `work/rounds/R-0007/tasks/${row.id}.json`;
        const canonical = await readFile(join(repoRoot, canonicalPath));
        migrations.push({
          round_id: 'R-0007',
          old_id: row.id,
          new_id: row.id,
          old_path: row.old_path,
          canonical_path: `tasks/${row.id}.json`,
          sidecar_path: row.sidecar_path,
          original_sha256: sha256(original),
          original_bytes: original.length,
          canonical_sha256: sha256(canonical),
          canonical_bytes: canonical.length,
          transformed_fields: ['disposition'],
          disposition: 'superseded-snapshot',
          historical_status: row.literal_status,
          field_sources: [
            {
              field: 'disposition',
              decision: '3A D1',
              source:
                'work/rounds/R-0020/contracts/CTG-0003-A3.3-gap-proposal.md',
            },
          ],
          schema_status: 'pass',
        });
      }
      migrations.sort((a, b) =>
        `${a.round_id}/${a.old_path}`.localeCompare(
          `${b.round_id}/${b.old_path}`,
        ),
      );
    }
    const byRound = new Map();
    for (const change of linked) {
      const oldGroup = change.old.coupled_task_group;
      const newGroup = change.canonical.coupled_task_group;
      if (
        oldGroup === newGroup ||
        !ctgAliases.has(`${change.canonical.round_id}/${oldGroup}`)
      )
        continue;
      const rows = byRound.get(change.canonical.round_id) ?? [];
      rows.push({
        round_id: change.canonical.round_id,
        old_ctg: oldGroup,
        new_ctg: newGroup,
        task_path: change.path.slice(repoRoot.length + 1),
        original_sha256: sha256(change.original),
        source: 'work/rounds/R-0020/contracts/CTG-0003-A3.2-proposal.md',
        decision: '1A',
      });
      byRound.set(change.canonical.round_id, rows);
    }
    for (const [roundId, rows] of byRound) {
      const aliasesPath = join(
        repoRoot,
        'work/rounds',
        roundId,
        'tasks/_legacy-originals/aliases.json',
      );
      if (existsSync(aliasesPath) && roundId === 'R-0007') continue;
      await atomic(
        aliasesPath,
        await formattedJson(
          rows.toSorted((a, b) => a.old_ctg.localeCompare(b.old_ctg)),
        ),
      );
    }
    const report = join(repoRoot, reportFile);
    await mkdir(dirname(report), { recursive: true });
    await atomic(
      report,
      await formattedJson({ schemaVersion: '1.0.0', migrations }),
    );
  }
  process.stdout.write(
    `normalize-tasks: OK (${changes.length} changed task(s))\n`,
  );
}
await main();
