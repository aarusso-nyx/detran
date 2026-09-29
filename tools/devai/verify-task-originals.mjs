import { createHash } from 'node:crypto';
import { readdir, readFile, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const taskFile = /^TASK-.*\.json$/u;
const round = /^R-[0-9]{4}$/u;
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expectedRolePaths = new Map([
  [
    'R-0003/TASK-0004',
    [
      'apps/dashboard/web/README.md',
      'docs/framework/arch/dashboard-build-pack.md',
      'docs/meta/knowledge-base/decision-closure-plan.md',
      'docs/meta/knowledge-base/backlog.md',
    ],
  ],
  [
    'R-0005/TASK-0009',
    [
      'backend/domains/ops/README.md',
      'docs/framework/arch/teat-build-pack.md',
      'docs/framework/blueprints/README.md',
      'docs/meta/knowledge-base/decision-closure-plan.md',
      'docs/meta/knowledge-base/backlog.md',
      'docs/framework/arch/teat-route-contract.md',
    ],
  ],
]);

const add = (errors, path, message) => errors.push(`${path}: ${message}`);

function rootArgument(argv) {
  if (argv.length !== 2 || argv[0] !== '--repo-root') {
    process.stderr.write(
      'usage: node tools/devai/verify-task-originals.mjs --repo-root <path>\n',
    );
    process.exit(2);
  }
  return resolve(argv[1]);
}

async function findTasks(repoRoot) {
  const root = join(repoRoot, 'work/rounds');
  if (!existsSync(root)) return [];
  const result = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    const directory = join(root, item.name, 'tasks');
    if (!item.isDirectory() || !round.test(item.name) || !existsSync(directory))
      continue;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isFile() && taskFile.test(entry.name))
        result.push(join(directory, entry.name));
    }
  }
  return result.toSorted();
}

async function stateContains(repoRoot, roundId, taskId) {
  const state = join(repoRoot, '.devai/state');
  for (const path of [
    join(state, 'backlog.jsonl'),
    join(state, 'tasks', `${taskId}.json`),
  ]) {
    if (!existsSync(path)) continue;
    const contents = await readFile(path, 'utf8');
    const values = [];
    try {
      values.push(JSON.parse(contents));
    } catch {
      for (const line of contents.split('\n')) {
        try {
          values.push(JSON.parse(line));
        } catch {
          /* non-JSON state text has no executable identity */
        }
      }
    }
    if (
      values.some((item) => item?.round_id === roundId && item?.id === taskId)
    )
      return true;
  }
  return false;
}

async function verifyRoleMatrix(repoRoot, linked, errors) {
  const path = join(
    repoRoot,
    'work/rounds/R-0020/contracts/CTG-0003-A3.4-role-matrix.json',
  );
  if (!existsSync(path)) return 0;
  let matrix;
  try {
    matrix = JSON.parse(await readFile(path, 'utf8'));
  } catch {
    add(errors, 'A3.4', 'matrix JSON invalid');
    return 0;
  }
  if (
    matrix.status !== 'applied' ||
    matrix.prospective_enforcement !== 'pending' ||
    matrix.historical_write_authority !== 'unclassified-at-write'
  ) {
    add(errors, 'A3.4', 'matrix status or historical authority invalid');
    return 0;
  }
  if (!Array.isArray(matrix.entries)) {
    add(errors, 'A3.4', 'matrix entries missing');
    return 0;
  }
  let verified = 0;
  for (const entry of matrix.entries) {
    const match =
      /^work\/rounds\/(R-[0-9]{4})\/tasks\/(TASK-[0-9]{4})\.json$/u.exec(
        entry.task_path ?? '',
      );
    if (!match || !expectedRolePaths.has(`${match[1]}/${match[2]}`)) {
      add(errors, 'A3.4', `matrix path invalid: ${entry.task_path}`);
      continue;
    }
    const [, roundId, taskId] = match;
    const label = `A3.4 ${roundId}/${taskId}`;
    const link = linked.find((item) => item.display === entry.task_path);
    if (!link) {
      add(errors, label, 'linked sidecar missing');
      continue;
    }
    if (entry.original_task_sha256 !== sha256(link.original))
      add(errors, label, 'original hash mismatch');
    if (
      entry.projected_discipline !== 'owner' ||
      link.task.discipline !== 'owner'
    )
      add(errors, label, 'projected discipline invalid');
    if (link.task.status !== 'completed' || link.raw.status !== 'completed')
      add(errors, label, 'completed status required');
    const expectedTags = [
      'authority-enforcement:pending',
      'historical-write-authority:unclassified-at-write',
      `historical-authority-discrepancy:${roundId}-${taskId}`,
    ];
    if (
      JSON.stringify(entry.required_tags) !== JSON.stringify(expectedTags) ||
      expectedTags.some(
        (tag) =>
          (link.task.tags ?? []).filter((value) => value === tag).length !== 1,
      )
    )
      add(errors, label, 'required tag absent, duplicate or changed');
    if (link.raw.discipline !== entry.historical_literals?.task_discipline)
      add(errors, label, 'historical literal discipline mismatch');
    if (
      entry.historical_policy_at_write?.apps_backend_grant_count !== 0 ||
      entry.historical_policy_at_write?.path !==
        '.devai/config/authority-policy.json' ||
      !/^[a-f0-9]{64}$/u.test(entry.historical_policy_at_write?.sha256 ?? '')
    )
      add(
        errors,
        label,
        'retrospective grant claim or historical policy invalid',
      );
    const expectedPaths = expectedRolePaths.get(`${roundId}/${taskId}`);
    if (
      JSON.stringify(entry.paths?.map((row) => row.path)) !==
      JSON.stringify(expectedPaths)
    )
      add(errors, label, 'path matrix mismatch');
    let prompt;
    try {
      prompt = await readFile(join(repoRoot, entry.prompt_path));
    } catch {
      prompt = null;
    }
    if (!prompt || sha256(prompt) !== entry.prompt_sha256)
      add(errors, label, 'prompt hash mismatch');
    if (
      prompt &&
      !prompt
        .toString('utf8')
        .includes(entry.historical_literals?.prompt_role ?? '')
    )
      add(errors, label, 'prompt literal mismatch');
    let evidence = null;
    if (roundId === 'R-0005') {
      try {
        evidence = await readFile(join(repoRoot, entry.evidence_path));
      } catch {
        /* recorded below */
      }
      if (!evidence || sha256(evidence) !== entry.evidence_sha256)
        add(errors, label, 'evidence receipt hash mismatch');
      let parsed;
      try {
        parsed = JSON.parse(evidence);
      } catch {
        parsed = null;
      }
      if (!parsed || parsed.role !== entry.historical_literals?.evidence_role)
        add(errors, label, 'evidence literal role mismatch');
      for (const row of entry.paths ?? []) {
        const artifact = parsed?.artifacts?.find(
          (item) => item.path === row.path,
        );
        if (
          !artifact ||
          artifact.sha256 !== row.receipt_artifact_sha256 ||
          row.historical_write_receipt !== entry.evidence_path
        )
          add(errors, label, `receipt mismatch for ${row.path}`);
      }
    } else if (
      entry.historical_literals?.evidence_role !== null ||
      entry.evidence_path
    )
      add(errors, label, 'historical literal evidence role mismatch');
    if (await stateContains(repoRoot, roundId, taskId))
      add(errors, label, 'store/backlog dispatch identity materialized');
    verified += 1;
  }
  return verified;
}

async function verifySpecial(repoRoot, linked, errors) {
  for (const link of linked) {
    const label = link.display;
    if (
      link.raw.status === 'completed_incomplete' &&
      link.task.status !== 'checkpoint'
    )
      add(
        errors,
        label,
        'S1 status completed_incomplete must project checkpoint',
      );
    const position = link.raw.coupled_pipeline_position;
    if (
      typeof position === 'string' &&
      !['architect', 'inspector', 'engineer'].includes(position) &&
      (link.task.tags ?? []).includes(`legacy-pipeline-position:${position}`) &&
      link.task.coupled_pipeline_position !== null
    )
      add(
        errors,
        label,
        'P1 pipeline position must be null, including auditor',
      );
    if (
      link.raw.upstream_task_id === 'TASK-0001+PREP-CTG1-DEPS+PREP-CTG1-MODEL'
    ) {
      const indexPath = join(
        repoRoot,
        'work/rounds/R-0007/tasks/_legacy-originals/prep-prerequisites.json',
      );
      let index;
      try {
        index = JSON.parse(await readFile(indexPath, 'utf8'));
      } catch {
        add(errors, label, 'U1 PREP index missing');
        continue;
      }
      if (
        link.task.upstream_task_id !== 'TASK-0001' ||
        index.original_task_sha256 !== sha256(link.original)
      )
        add(errors, label, 'U1 original upstream or hash mismatch');
      if (
        index.historical_dispatch_timestamp !== 'unknown' ||
        index.final_success_timestamp !== 'unknown'
      )
        add(errors, label, 'U1 historical timestamp must be unknown');
      for (const field of ['budget_path', 'plan_path', 'prompt_path']) {
        const path = index[field];
        if (
          typeof path !== 'string' ||
          !path.startsWith('work/rounds/R-0007/') ||
          path.includes('..')
        ) {
          add(errors, label, `U1 ${field} path escape`);
          continue;
        }
        try {
          if (
            sha256(await readFile(join(repoRoot, path))) !==
            index[field.replace('_path', '_sha256')]
          )
            add(errors, label, `U1 ${field} hash mismatch`);
        } catch {
          add(errors, label, `U1 ${field} missing`);
        }
      }
      try {
        const budget = JSON.parse(
          await readFile(join(repoRoot, index.budget_path)),
        );
        const expected = [5, 6, 10, 16, 17, 18, 19, 25, 26].map((at) => ({
          index: at,
          id: budget.entries[at].id,
          status: budget.entries[at].status,
        }));
        if (
          JSON.stringify(
            index.ledger_entries?.map((row) => ({
              index: row.index,
              id: row.id,
              status: row.status,
            })),
          ) !== JSON.stringify(expected)
        )
          add(errors, label, 'U1 budget ledger retry entries mismatch');
      } catch {
        add(errors, label, 'U1 budget ledger invalid');
      }
      const expectedPrep = [
        ['PREP-CTG1-DEPS', 16, 17, 'TASK-0002-C2'],
        ['PREP-CTG1-MODEL', 25, 26, 'TASK-0002-C3'],
      ];
      if (
        JSON.stringify(
          index.preparations?.map((row) => [
            row.prep_id,
            row.ledger_index,
            row.next_worker_index,
            row.next_worker_id,
          ]),
        ) !== JSON.stringify(expectedPrep)
      )
        add(errors, label, 'U1 PREP order mismatch');
    }
    if (
      link.raw.round_id === 'R-0006' &&
      link.raw.id === 'TASK-0003' &&
      Array.isArray(link.raw.iteration_trail) &&
      (link.task.tags ?? []).some((tag) =>
        tag.startsWith('legacy-escalation-index:'),
      )
    ) {
      const indexPath = join(
        repoRoot,
        'work/rounds/R-0006/tasks/_legacy-originals/TASK-0003-escalation.json',
      );
      let index;
      try {
        index = JSON.parse(await readFile(indexPath, 'utf8'));
      } catch {
        add(errors, label, 'T1 escalation index missing');
        continue;
      }
      if (
        link.task.iteration_count !== 2 ||
        link.task.max_iterations !== 2 ||
        index.iteration_count !== 2 ||
        index.max_iterations !== 2 ||
        index.worker_dispatches !== 2 ||
        index.trail_iteration_3_is_review_cycle_not_worker_dispatch !== true ||
        link.task.status !== 'escalated' ||
        index.task_status !== 'escalated'
      )
        add(errors, label, 'T1 iteration worker escalation facts mismatch');
      if (
        JSON.stringify(index.iteration_trail) !==
        JSON.stringify(link.raw.iteration_trail)
      )
        add(errors, label, 'T1 original review trail mismatch');
      for (const source of index.sources ?? []) {
        if (
          typeof source.path !== 'string' ||
          !source.path.startsWith('work/rounds/R-0006/') ||
          source.path.includes('..')
        ) {
          add(errors, label, 'T1 source path escape');
          continue;
        }
        try {
          if (
            sha256(await readFile(join(repoRoot, source.path))) !==
            source.sha256
          )
            add(errors, label, 'T1 source hash mismatch');
        } catch {
          add(errors, label, 'T1 source missing');
        }
      }
    }
  }
}

async function verifyD1(repoRoot, errors) {
  const path = join(
    repoRoot,
    'work/rounds/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json',
  );
  const exempt = new Set();
  if (!existsSync(path)) return exempt;
  let index;
  try {
    index = JSON.parse(await readFile(path, 'utf8'));
  } catch {
    add(errors, 'D1', 'snapshot index invalid');
    return exempt;
  }
  const spec = [
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
  if (
    index.round_id !== 'R-0007' ||
    index.decision !== 'D1' ||
    index.entries?.length !== 4
  ) {
    add(errors, 'D1', 'snapshot index identity/count invalid');
    return exempt;
  }
  for (let i = 0; i < spec.length; i += 1) {
    const [name, id, hash] = spec[i];
    const entry = index.entries[i];
    const sidecar = join(
      repoRoot,
      'work/rounds/R-0007/tasks/_legacy-originals',
      `${name}.json.raw`,
    );
    if (
      entry?.old_path !== `tasks/${name}.json` ||
      entry?.id !== id ||
      entry?.original_sha256 !== hash ||
      entry?.sidecar_path !== `tasks/_legacy-originals/${name}.json.raw` ||
      entry?.disposition !==
        (i === 0 ? 'canonical-move' : 'superseded-snapshot')
    ) {
      add(errors, 'D1', `snapshot index entry mismatch: ${name}`);
      continue;
    }
    try {
      if (sha256(await readFile(sidecar)) !== hash)
        add(errors, 'D1', `sidecar sha256 mismatch: ${name}`);
      else if (i > 0) exempt.add(sidecar);
    } catch {
      add(errors, 'D1', `sidecar missing: ${name}`);
    }
    if (existsSync(join(repoRoot, 'work/rounds/R-0007/tasks', `${name}.json`)))
      add(errors, 'D1', `direct snapshot remains: ${name}`);
    if (i > 0) {
      const posterior = join(
        repoRoot,
        'work/rounds/R-0007/tasks',
        `${id}.json`,
      );
      try {
        if (sha256(await readFile(posterior)) !== entry.posterior_sha256)
          add(errors, 'D1', `posterior hash mismatch: ${id}`);
      } catch {
        add(errors, 'D1', `posterior missing: ${id}`);
      }
    }
  }
  for (const [field, expected] of [
    [
      'plan_path',
      '1068ebf3a7e05d13f372f6dbcfb38616ba72df19c04227b03182a1a404cfc2d2',
    ],
    [
      'budget_path',
      '5bcabfb83fa83d44bf0a346b9ac5eb72cc2ef42722e89f4bdd4d678e7ed019a2',
    ],
  ]) {
    const source = index[field];
    if (
      typeof source !== 'string' ||
      !source.startsWith('work/rounds/R-0007/') ||
      source.includes('..') ||
      index[field.replace('_path', '_sha256')] !== expected
    ) {
      add(errors, 'D1', `${field} source invalid`);
      continue;
    }
    try {
      if (sha256(await readFile(join(repoRoot, source))) !== expected)
        add(errors, 'D1', `${field} hash mismatch`);
    } catch {
      add(errors, 'D1', `${field} missing`);
    }
  }
  return exempt;
}

async function main() {
  const repoRoot = rootArgument(process.argv.slice(2));
  const repoReal = await realpath(repoRoot);
  const errors = [];
  const linked = [];
  for (const path of await findTasks(repoRoot)) {
    const display = relative(repoRoot, path);
    let task;
    try {
      task = JSON.parse(await readFile(path, 'utf8'));
    } catch {
      add(errors, display, 'invalid TASK JSON');
      continue;
    }
    const tags = Array.isArray(task.tags) ? task.tags : [];
    const originals = tags.filter(
      (tag) => typeof tag === 'string' && tag.startsWith('legacy-original:'),
    );
    const hashes = tags.filter(
      (tag) => typeof tag === 'string' && tag.startsWith('legacy-sha256:'),
    );
    if (!originals.length && !hashes.length) continue;
    if (originals.length !== 1 || hashes.length !== 1) {
      add(errors, display, 'exactly one sidecar tag/hash pair is required');
      continue;
    }
    const sidecarPath = originals[0].slice('legacy-original:'.length);
    const expected = hashes[0].slice('legacy-sha256:'.length);
    if (!/^[a-f0-9]{64}$/u.test(expected)) {
      add(errors, display, 'legacy sha256 is invalid');
      continue;
    }
    if (
      sidecarPath.includes('..') ||
      sidecarPath.startsWith('/') ||
      !sidecarPath.startsWith('tasks/_legacy-originals/')
    ) {
      add(errors, display, 'sidecar path escapes permitted task directory');
      continue;
    }
    const sidecar = join(dirname(path), sidecarPath.slice('tasks/'.length));
    if (!existsSync(sidecar)) {
      add(errors, display, 'sidecar is missing');
      continue;
    }
    let resolved;
    try {
      resolved = await realpath(sidecar);
    } catch {
      add(errors, display, 'sidecar cannot be resolved');
      continue;
    }
    if (!resolved.startsWith(`${repoReal}/`)) {
      add(errors, display, 'sidecar path escapes repository');
      continue;
    }
    const original = await readFile(sidecar);
    if (sha256(original) !== expected) {
      add(errors, display, 'sidecar sha256 does not match tag');
      continue;
    }
    let raw;
    try {
      raw = JSON.parse(original);
    } catch {
      add(errors, display, 'sidecar raw JSON is invalid');
      continue;
    }
    const roundId = display.split('/')[2];
    if (raw.round_id !== roundId)
      add(errors, display, 'sidecar round_id does not match canonical round');
    linked.push({
      display,
      original,
      path,
      sidecar,
      sidecarPath,
      task,
      raw,
      expected,
    });
  }
  const d1Exempt = await verifyD1(repoRoot, errors);
  const roundsRoot = join(repoRoot, 'work/rounds');
  if (existsSync(roundsRoot))
    for (const item of await readdir(roundsRoot, { withFileTypes: true })) {
      const directory = join(roundsRoot, item.name, 'tasks/_legacy-originals');
      if (!item.isDirectory() || !existsSync(directory)) continue;
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (
          entry.isFile() &&
          entry.name.endsWith('.raw') &&
          !linked.some((link) => link.sidecar === path) &&
          !d1Exempt.has(path)
        )
          add(errors, relative(repoRoot, path), 'orphan sidecar');
      }
    }
  const migrationPath = join(
    repoRoot,
    'work/rounds/R-0020/reports/A3-migration-before-after.json',
  );
  let migrations = [];
  if (linked.length) {
    if (!existsSync(migrationPath))
      add(
        errors,
        'verify-task-originals',
        'migration before-after report is missing',
      );
    else
      try {
        const report = JSON.parse(await readFile(migrationPath, 'utf8'));
        migrations = Array.isArray(report.migrations) ? report.migrations : [];
      } catch {
        add(
          errors,
          'verify-task-originals',
          'migration before-after report is invalid',
        );
      }
  }
  for (const link of linked) {
    const canonical = await readFile(link.path);
    const migration = migrations.find(
      (item) =>
        item.round_id === link.task.round_id &&
        item.sidecar_path === link.sidecarPath &&
        item.canonical_path === `tasks/${link.display.split('/').at(-1)}`,
    );
    if (!migration) {
      add(
        errors,
        link.display,
        'migration before-after report has no matching entry',
      );
      continue;
    }
    if (
      migration.original_sha256 !== link.expected ||
      migration.original_bytes !== link.original.length ||
      migration.canonical_sha256 !== sha256(canonical) ||
      migration.canonical_bytes !== canonical.length
    )
      add(
        errors,
        link.display,
        'migration before-after hashes or sizes do not match',
      );
  }
  const aliases = [];
  if (existsSync(roundsRoot))
    for (const item of await readdir(roundsRoot, { withFileTypes: true })) {
      const path = join(
        roundsRoot,
        item.name,
        'tasks/_legacy-originals/aliases.json',
      );
      if (!existsSync(path)) continue;
      try {
        const data = JSON.parse(await readFile(path, 'utf8'));
        aliases.push(...(Array.isArray(data) ? data : []));
      } catch {
        add(errors, relative(repoRoot, path), 'invalid aliases JSON');
      }
    }
  const seenNewIds = new Set();
  for (const alias of aliases.filter((entry) => entry?.old_ctg !== undefined)) {
    if (
      !/^CTG-[0-9]{4,}$/u.test(alias.new_ctg ?? '') ||
      !alias.old_ctg ||
      !alias.task_path ||
      !/^[a-f0-9]{64}$/u.test(alias.original_sha256 ?? '')
    )
      add(errors, 'aliases.json', 'CTG alias entry invalid');
    else {
      const link = linked.find((item) => item.display === alias.task_path);
      if (
        !link ||
        link.raw.coupled_task_group !== alias.old_ctg ||
        link.task.coupled_task_group !== alias.new_ctg ||
        sha256(link.original) !== alias.original_sha256
      )
        add(
          errors,
          alias.task_path,
          'CTG alias does not match linked original',
        );
    }
  }
  for (const alias of aliases.filter((entry) => entry?.old_id !== undefined)) {
    if (!alias || seenNewIds.has(alias.new_id))
      add(errors, 'aliases.json', `alias collision for ${alias?.new_id}`);
    seenNewIds.add(alias?.new_id);
    const link = linked.find(
      (entry) =>
        entry.task.round_id === alias.round_id &&
        entry.sidecarPath === alias.sidecar_path &&
        entry.display.endsWith(`/${alias.canonical_path}`),
    );
    if (!link || link.task.id !== alias.new_id)
      add(
        errors,
        alias?.canonical_path ?? 'aliases.json',
        'alias does not match canonical TASK',
      );
    else if (link.raw.id !== alias.old_id)
      add(
        errors,
        alias.canonical_path,
        'alias does not match sidecar original ID',
      );
  }
  for (const link of linked) {
    const alias = aliases.find(
      (entry) =>
        entry.round_id === link.task.round_id &&
        entry.sidecar_path === link.sidecarPath &&
        entry.canonical_path === `tasks/${link.display.split('/').at(-1)}`,
    );
    if (!alias && link.raw.id !== link.task.id)
      add(
        errors,
        link.display,
        'sidecar original ID does not match canonical TASK',
      );
  }
  await verifySpecial(repoRoot, linked, errors);
  const roleCount = await verifyRoleMatrix(repoRoot, linked, errors);
  if (errors.length) {
    process.stderr.write(`${errors.toSorted().join('\n')}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `verify-task-originals: OK (${linked.length} linked task(s))\n`,
  );
  if (roleCount) process.stdout.write(`A3.4 R1: OK (${roleCount} projeções)\n`);
}
await main();
