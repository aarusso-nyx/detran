import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CHECK_MEMBERS = [
  'docs-governance',
  'overrides',
  'prompt-overlays',
  'schemas',
  'invariants',
  'glossary',
  'journeys',
  'trace',
  'sensor-integrity',
  'glob-guards',
  'invariant-strategies',
  'test-trace',
  'adrs',
  'forbidden-actions',
  'docs-links',
  'action-coverage',
  'action-effects',
  'cli-reference',
  'ci-economy',
  'dependencies',
  'pr-compliance',
  'mutation',
  'blueprint',
  'schema',
  'translation',
];

function parseArgs(argv) {
  const options = {
    against: null,
    final: false,
    outDir: null,
    repoRoot: scriptRoot,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--final') {
      options.final = true;
      continue;
    }
    if (
      value === '--out-dir' ||
      value === '--repo-root' ||
      value === '--against'
    ) {
      const target = argv[index + 1];
      if (!target || target.startsWith('--')) {
        throw new Error(`${value} requer um caminho`);
      }
      options[
        value === '--out-dir'
          ? 'outDir'
          : value === '--repo-root'
            ? 'repoRoot'
            : 'against'
      ] = resolve(target);
      index += 1;
      continue;
    }
    throw new Error(`argumento não suportado: ${value}`);
  }
  if (!options.outDir) {
    throw new Error('--out-dir é obrigatório');
  }
  if (options.final !== Boolean(options.against)) {
    throw new Error('--final requer --against e --against requer --final');
  }
  return options;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  return {
    exitCode: result.status ?? 1,
    stderr: result.stderr.trim(),
    stdout: result.stdout.trim(),
  };
}

function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    for (const line of output.split('\n').reverse()) {
      const candidate = line.trim();
      if (!candidate.startsWith('{')) continue;
      try {
        return JSON.parse(candidate);
      } catch {
        // Keep looking for the last complete JSON line.
      }
    }
    return null;
  }
}

function commandValue(raw) {
  return raw?.ok === true && raw?.result?.value ? raw.result.value : null;
}

function stableOutput(value, repoRoot) {
  if (typeof value === 'string') return value.replaceAll(repoRoot, '.');
  if (Array.isArray(value))
    return value.map((item) => stableOutput(item, repoRoot));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'generated_at')
        .map(([key, item]) => [key, stableOutput(item, repoRoot)]),
    );
  }
  return value;
}

function gitSnapshot(repoRoot) {
  const head = run('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], repoRoot);
  const status = run(
    'git',
    ['-C', repoRoot, 'status', '--porcelain=v1', '--untracked-files=all'],
    repoRoot,
  );
  if (head.exitCode !== 0 || status.exitCode !== 0) {
    return { headSha: null, status: null };
  }
  return { headSha: head.stdout, status: status.stdout };
}

function assertReadOnlyDevai(args) {
  const forbidden = args.filter(
    (argument) =>
      argument === '--write' ||
      argument === '--apply' ||
      argument === '--persist' ||
      argument === '--record',
  );
  if (forbidden.length > 0) {
    throw new Error(
      `invocação DEVAI com efeito recusada: ${forbidden.join(', ')}`,
    );
  }
  if (args[0] !== 'exec' || args[1] !== 'devai') {
    throw new Error(
      'somente invocações DEVAI explicitamente somente leitura são permitidas',
    );
  }
  const command = args.slice(2, 4).join(' ');
  if (
    ![
      'audit scorecard',
      'check --only',
      'round status',
      'evidence verify',
    ].includes(command)
  ) {
    throw new Error(`comando DEVAI fora da lista somente leitura: ${command}`);
  }
  if (command === 'audit scorecard' && !args.includes('--at')) {
    throw new Error(
      'audit scorecard sem HEAD explícito foi recusado antes da execução',
    );
  }
  if (command === 'evidence verify' && !args.includes('--scope')) {
    throw new Error('evidence verify requer escopo explícito');
  }
}

function runReadonlyDevai(args, repoRoot) {
  assertReadOnlyDevai(args);
  const before = gitSnapshot(repoRoot);
  const result = run('pnpm', args, repoRoot);
  const after = gitSnapshot(repoRoot);
  if (before.status !== after.status || before.headSha !== after.headSha) {
    throw new Error(
      'invocação DEVAI alterou o estado do repo-root e foi recusada',
    );
  }
  return result;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function walk(root, matcher) {
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const found = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(root, entry.name);
      if (entry.isDirectory()) return walk(path, matcher);
      return matcher(path) ? [path] : [];
    }),
  );
  return found.flat().sort();
}

function repoPath(repoRoot, path) {
  return relative(repoRoot, path).split(sep).join('/');
}

async function sourceEntries(repoRoot) {
  const fixed = [
    'law/schemas/task.schema.json',
    'record/proofs/chain.json',
    'node_modules/@aarusso-nyx/devai/dist/law/policy/check-suites.json',
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
  ];
  const measured = [
    ['.devai/state/sensor-readings', (path) => path.endsWith('.json')],
    ['record/proofs/work', (path) => path.endsWith('.jsonl')],
    [
      'record/proofs/compliance/closures',
      (path) => /\/PC-\d+\.json$/.test(path),
    ],
    [
      'work/rounds',
      (path) =>
        /\/tasks\/TASK-[^/]+\.json$/.test(path) ||
        /\/R-\d{4}\/(?:closure\.json|record\.md|close-state\.jsonl)$/.test(
          path,
        ),
    ],
  ];
  const paths = [
    ...fixed,
    ...(
      await Promise.all(
        measured.map(async ([directory, matcher]) =>
          (await walk(resolve(repoRoot, directory), matcher)).map((path) =>
            repoPath(repoRoot, path),
          ),
        ),
      )
    ).flat(),
  ];
  const entries = await Promise.all(
    paths.map(async (path) => {
      const absolute = resolve(repoRoot, path);
      if (!(await exists(absolute))) return null;
      return { path, sha256: sha256(await readFile(absolute)) };
    }),
  );
  return entries
    .filter(Boolean)
    .sort((left, right) => left.path.localeCompare(right.path));
}

function pending(reason, extra = {}) {
  return { ...extra, source_pending: reason };
}

function measureAnchorGate(repoRoot) {
  const before = gitSnapshot(repoRoot);
  const result = run(
    process.execPath,
    [
      resolve(scriptRoot, 'tools/devai/verify-proof-anchors.mjs'),
      '--repo-root',
      repoRoot,
    ],
    repoRoot,
  );
  const after = gitSnapshot(repoRoot);
  if (before.status !== after.status || before.headSha !== after.headSha) {
    throw new Error('verify-proof-anchors alterou o estado do repo-root');
  }

  const counters = Object.fromEntries(
    `${result.stdout}\n${result.stderr}`
      .split('\n')
      .map((line) => line.match(/^([^:]+):\s*(\d+)$/))
      .filter(Boolean)
      .map(([, name, value]) => [name, Number(value)]),
  );
  return {
    argv: ['node', 'tools/devai/verify-proof-anchors.mjs', '--repo-root', '.'],
    exit_code: result.exitCode,
    directly_anchored: counters['directly anchored'] ?? null,
    declared_orphans: counters['declared orphans'] ?? null,
    undeclared_orphans: counters['undeclared orphans'] ?? null,
    duplicate_anchors: counters['duplicate anchors'] ?? null,
    invalid_references: counters['invalid references'] ?? null,
    validation_errors: counters['validation errors'] ?? null,
  };
}

async function measureProofs(repoRoot) {
  const chainPath = resolve(repoRoot, 'record/proofs/chain.json');
  const proofPaths = await walk(
    resolve(repoRoot, 'record/proofs/work'),
    (path) => path.endsWith('.jsonl'),
  );
  if (!(await exists(chainPath))) {
    return pending('record/proofs/chain.json indisponível', {
      anchored: null,
      chain_head: null,
      chain_records: null,
      duplicate_anchors: [],
      jsonl_lines: null,
      lines: [],
      orphans: [],
    });
  }

  let chain;
  try {
    chain = await readJson(chainPath);
  } catch (error) {
    return pending(`chain.json inválido: ${error.message}`, {
      anchored: null,
      chain_head: null,
      chain_records: null,
      duplicate_anchors: [],
      jsonl_lines: null,
      lines: [],
      orphans: [],
    });
  }

  const anchors = new Map();
  for (const record of chain.records ?? []) {
    const notes = Array.isArray(record.notes) ? record.notes : [];
    const round = notes.find((note) => /^round_id=R-\d{4}$/.test(note));
    const sequence = notes.find((note) => /^proof_sequence=\d+$/.test(note));
    if (round && sequence) {
      const key = `${round.slice('round_id='.length)}:${sequence.slice('proof_sequence='.length)}`;
      anchors.set(key, [...(anchors.get(key) ?? []), record]);
    }
  }
  const duplicateAnchors = [...anchors.entries()]
    .filter(([, records]) => records.length > 1)
    .map(([key]) => key)
    .sort();
  const orphans = [];
  const linesMeasured = [];
  let jsonlLines = 0;
  for (const path of proofPaths) {
    const contents = await readFile(path, 'utf8');
    const lines = contents.split('\n');
    for (const [index, line] of lines.entries()) {
      if (index === lines.length - 1 && line.length === 0) continue;
      jsonlLines += 1;
      let value;
      try {
        value = JSON.parse(line);
      } catch {
        value = {};
      }
      const roundId =
        value.round_id ??
        repoPath(repoRoot, path).match(/R-\d{4}/)?.[0] ??
        null;
      const sequence = index + 1;
      const anchored = Boolean(
        roundId && anchors.has(`${roundId}:${sequence}`),
      );
      const measuredLine = {
        path: repoPath(repoRoot, path),
        sequence,
        round_id: roundId,
        sha256: sha256(line),
        anchored,
      };
      linesMeasured.push(measuredLine);
      if (!anchored) {
        orphans.push({
          path: measuredLine.path,
          sequence,
          sha256: measuredLine.sha256,
        });
      }
    }
  }
  const hasDevaiConfig = await exists(
    resolve(repoRoot, '.devai/config/project.json'),
  );
  let verification = pending(
    'verificador DEVAI indisponível sem configuração',
    {
      argv: [],
      exit_code: null,
      raw: null,
      valid: null,
    },
  );
  if (hasDevaiConfig) {
    const args = [
      'exec',
      'devai',
      'evidence',
      'verify',
      '--scope',
      'chain',
      '--repo-root',
      repoRoot,
      '--show-head',
      '--format',
      'json',
    ];
    const result = runReadonlyDevai(args, repoRoot);
    const raw =
      parseJsonOutput(result.stdout) ?? parseJsonOutput(result.stderr);
    verification = {
      argv: ['pnpm', ...args].map((arg) => (arg === repoRoot ? '.' : arg)),
      exit_code: result.exitCode,
      raw: stableOutput(
        raw ?? { stderr: result.stderr, stdout: result.stdout },
        repoRoot,
      ),
      valid: raw?.result?.value?.valid ?? null,
      source_pending: raw ? null : 'verificador não retornou JSON',
    };
  }
  return {
    anchor_gate: measureAnchorGate(repoRoot),
    anchored: jsonlLines - orphans.length,
    chain_head: chain.head ?? null,
    chain_records: Array.isArray(chain.records) ? chain.records.length : null,
    duplicate_anchors: duplicateAnchors,
    jsonl_lines: jsonlLines,
    lines: linesMeasured,
    orphans,
    verification,
    counts: {
      jsonl_lines: jsonlLines,
      anchored: jsonlLines - orphans.length,
      orphans: orphans.length,
      duplicate_anchors: duplicateAnchors.length,
      chain_records: Array.isArray(chain.records) ? chain.records.length : null,
      chain_valid: verification.valid,
    },
    source_pending: verification.source_pending,
  };
}

function pointer(path, key) {
  return `${path}/${String(key).replaceAll('~', '~0').replaceAll('/', '~1')}`;
}

function resolveReference(schema, reference) {
  if (!reference.startsWith('#/')) return null;
  return reference
    .slice(2)
    .split('/')
    .reduce(
      (value, part) =>
        value?.[part.replaceAll('~1', '/').replaceAll('~0', '~')],
      schema,
    );
}

function jsonTypeMatches(value, type) {
  if (type === 'array') return Array.isArray(value);
  if (type === 'null') return value === null;
  if (type === 'integer') return Number.isInteger(value);
  return typeof value === type;
}

function schemaErrors(schemaRoot, schema, value, path = '') {
  if (schema.$ref) {
    const resolved = resolveReference(schemaRoot, schema.$ref);
    return resolved
      ? schemaErrors(schemaRoot, resolved, value, path)
      : [{ field: path, keyword: '$ref' }];
  }
  const errors = [];
  const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (
    schema.type &&
    !allowedTypes.some((type) => jsonTypeMatches(value, type))
  ) {
    return [{ field: path, keyword: 'type' }];
  }
  if (
    'const' in schema &&
    JSON.stringify(value) !== JSON.stringify(schema.const)
  ) {
    errors.push({ field: path, keyword: 'const' });
  }
  if (
    schema.enum &&
    !schema.enum.some(
      (candidate) => JSON.stringify(candidate) === JSON.stringify(value),
    )
  ) {
    errors.push({ field: path, keyword: 'enum' });
  }
  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value))
      errors.push({ field: path, keyword: 'pattern' });
    if (schema.minLength && value.length < schema.minLength)
      errors.push({ field: path, keyword: 'minLength' });
    if (schema.maxLength && value.length > schema.maxLength)
      errors.push({ field: path, keyword: 'maxLength' });
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value)))
      errors.push({ field: path, keyword: 'format' });
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum)
      errors.push({ field: path, keyword: 'minimum' });
    if (schema.maximum !== undefined && value > schema.maximum)
      errors.push({ field: path, keyword: 'maximum' });
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems)
      errors.push({ field: path, keyword: 'minItems' });
    if (
      schema.uniqueItems &&
      new Set(value.map((item) => JSON.stringify(item))).size !== value.length
    )
      errors.push({ field: path, keyword: 'uniqueItems' });
    if (schema.items)
      value.forEach((item, index) =>
        errors.push(
          ...schemaErrors(schemaRoot, schema.items, item, pointer(path, index)),
        ),
      );
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!(required in value))
        errors.push({ field: pointer(path, required), keyword: 'required' });
    }
    for (const [key, item] of Object.entries(value)) {
      if (schema.properties?.[key])
        errors.push(
          ...schemaErrors(
            schemaRoot,
            schema.properties[key],
            item,
            pointer(path, key),
          ),
        );
      else if (schema.additionalProperties === false)
        errors.push({
          field: pointer(path, key),
          keyword: 'additionalProperties',
        });
    }
  }
  if (schema.allOf)
    for (const option of schema.allOf)
      errors.push(...schemaErrors(schemaRoot, option, value, path));
  if (
    schema.anyOf &&
    !schema.anyOf.some(
      (option) => schemaErrors(schemaRoot, option, value, path).length === 0,
    )
  )
    errors.push({ field: path, keyword: 'anyOf' });
  if (
    schema.oneOf &&
    schema.oneOf.filter(
      (option) => schemaErrors(schemaRoot, option, value, path).length === 0,
    ).length !== 1
  )
    errors.push({ field: path, keyword: 'oneOf' });
  if (
    schema.not &&
    schemaErrors(schemaRoot, schema.not, value, path).length === 0
  )
    errors.push({ field: path, keyword: 'not' });
  return errors;
}

async function measureTasks(repoRoot) {
  const schemaPath = resolve(repoRoot, 'law/schemas/task.schema.json');
  if (!(await exists(schemaPath))) {
    return pending('law/schemas/task.schema.json indisponível', {
      counts: { invalid: null, unreadable: null, valid: null },
      items: [],
    });
  }
  const schema = await readJson(schemaPath);
  const paths = await walk(resolve(repoRoot, 'work/rounds'), (path) =>
    /\/tasks\/TASK-[^/]+\.json$/.test(path),
  );
  const counts = { invalid: 0, unreadable: 0, valid: 0 };
  const items = [];
  for (const path of paths) {
    const item = { path: repoPath(repoRoot, path) };
    try {
      const errors = schemaErrors(
        schema,
        schema,
        JSON.parse(await readFile(path, 'utf8')),
      ).sort((left, right) =>
        `${left.field}:${left.keyword}`.localeCompare(
          `${right.field}:${right.keyword}`,
        ),
      );
      item.valid = errors.length === 0;
      if (errors.length > 0) item.errors = errors;
      counts[item.valid ? 'valid' : 'invalid'] += 1;
    } catch (error) {
      item.errors = [{ field: '', keyword: 'parse', message: error.message }];
      item.valid = false;
      item.unreadable = true;
      counts.unreadable += 1;
    }
    items.push(item);
  }
  return { counts, items, source_pending: null };
}

async function measureA3Transposition(repoRoot) {
  const artifactPaths = {
    aliases: 'work/rounds/R-0007/tasks/_legacy-originals/aliases.json',
    d1: 'work/rounds/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json',
    report: 'work/rounds/R-0020/reports/A3-migration-before-after.json',
  };
  const oldNames = [
    'TASK-0001-D1',
    'TASK-0002-D1',
    'TASK-0003-D1',
    'TASK-0004-D1',
    'TASK-0004-S1',
    'TASK-0004-S2',
    'TASK-0004-S2-R1',
    'TASK-0004-S3',
    'TASK-0004-S4',
    'TASK-0004-S5',
  ];
  const artifacts = {};
  for (const [name, path] of Object.entries(artifactPaths)) {
    try {
      const bytes = await readFile(resolve(repoRoot, path));
      artifacts[name] = {
        path,
        sha256: sha256(bytes),
        entries: JSON.parse(bytes),
      };
    } catch {
      artifacts[name] = {
        path,
        sha256: null,
        entries: null,
        error: 'leitura ou JSON inválido',
      };
    }
  }
  const sidecars = [];
  for (const name of oldNames) {
    const oldPath = `work/rounds/R-0007/tasks/${name}.json`;
    const sidecarPath = `work/rounds/R-0007/tasks/_legacy-originals/${name}.json.raw`;
    try {
      sidecars.push({
        old_path: oldPath,
        sidecar_path: sidecarPath,
        sha256: sha256(await readFile(resolve(repoRoot, sidecarPath))),
      });
    } catch {
      sidecars.push({
        old_path: oldPath,
        sidecar_path: sidecarPath,
        sha256: null,
        error: 'leitura falhou',
      });
    }
  }
  const result = run(
    process.execPath,
    [
      resolve(scriptRoot, 'tools/devai/verify-task-originals.mjs'),
      '--repo-root',
      repoRoot,
    ],
    repoRoot,
  );
  return {
    artifacts,
    sidecars,
    verifier: {
      argv: [
        'node',
        'tools/devai/verify-task-originals.mjs',
        '--repo-root',
        '.',
      ],
      exit_code: result.exitCode,
      stdout_sha256: sha256(result.stdout),
    },
  };
}

async function measureSensors(repoRoot) {
  const registryPath = resolve(
    repoRoot,
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
  );
  const presetsPath = resolve(
    repoRoot,
    'node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
  );
  if (!(await exists(registryPath)) || !(await exists(presetsPath))) {
    return pending('políticas de sensores indisponíveis', {
      counts: { persisted: null },
      presets: {},
      read_kind_count: null,
      readings: [],
      registry_count: null,
    });
  }
  const registry = await readJson(registryPath);
  const kinds = Array.isArray(registry)
    ? registry
    : (registry.entries ?? registry.kinds ?? []);
  const readKinds = kinds.filter((kind) => kind.effect === 'read');
  const effectCounts = {};
  for (const kind of kinds) {
    const effect = kind.effect ?? 'missing';
    effectCounts[effect] = (effectCounts[effect] ?? 0) + 1;
  }
  const readingPaths = await walk(
    resolve(repoRoot, '.devai/state/sensor-readings'),
    (path) => path.endsWith('.json'),
  );
  const readings = [];
  const errors = [];
  const byKind = {};
  const byStatus = {};
  for (const path of readingPaths) {
    try {
      const raw = await readJson(path);
      const kind = raw.sensor?.kind ?? raw.kind;
      const status = raw.status;
      const reference = raw.out_head ?? raw.integration_head ?? raw.ref;
      if (!kind || !status || !reference) {
        errors.push(
          `${repoPath(repoRoot, path)}: kind/status/reference ausente`,
        );
        continue;
      }
      readings.push({
        kind,
        path: repoPath(repoRoot, path),
        reference,
        status,
      });
      byKind[kind] = (byKind[kind] ?? 0) + 1;
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    } catch (error) {
      errors.push(`${repoPath(repoRoot, path)}: ${error.message}`);
    }
  }
  return {
    counts: {
      effects: effectCounts,
      persisted: errors.length ? null : readings.length,
      by_kind: Object.fromEntries(Object.entries(byKind).sort()),
      by_status: Object.fromEntries(Object.entries(byStatus).sort()),
    },
    kinds: kinds.map((kind) => ({
      id: kind.id ?? kind.kind ?? kind.name,
      effect: kind.effect ?? null,
    })),
    presets: await readJson(presetsPath),
    read_kind_count: readKinds.length,
    readings,
    registry_count: kinds.length,
    sense_run_spec_depth: pending(
      'ação sense run declara efeito remote-write em action-registry.json; kind spec_depth é read em sensor-registry.json, mas a ação não foi executada pelo medidor somente leitura',
      { result: null },
    ),
    source_pending: errors.length ? errors.join('; ') : null,
  };
}

function emptyChecks(reason) {
  return {
    members: CHECK_MEMBERS.map((id) =>
      pending(reason, { argv: [], exit_code: null, id, raw: {} }),
    ),
    suite_members: ['ledger-local', 'ledger-rc'],
    counts: {
      total: CHECK_MEMBERS.length,
      ok_true: null,
      ok_false: null,
      exit_codes: {},
      verdicts: {},
    },
    source_pending: reason,
  };
}

function measureChecks(repoRoot, hasDevaiConfig) {
  if (!hasDevaiConfig) {
    return emptyChecks(
      'execução DEVAI omitida em fonte de fixture ou sem configuração',
    );
  }
  const members = CHECK_MEMBERS.map((id) => {
    const args = [
      'exec',
      'devai',
      'check',
      '--only',
      id,
      '--repo-root',
      repoRoot,
      '--format',
      'json',
    ];
    if (id === 'docs-governance') args.push('--skip-publish-check');
    const result = runReadonlyDevai(args, repoRoot);
    const raw =
      parseJsonOutput(result.stdout) ?? parseJsonOutput(result.stderr);
    return {
      argv: ['pnpm', ...args].map((arg) => (arg === repoRoot ? '.' : arg)),
      exit_code: result.exitCode,
      id,
      raw: stableOutput(
        raw ?? { stderr: result.stderr, stdout: result.stdout },
        repoRoot,
      ),
      state: {
        command_ok: raw?.ok ?? null,
        verdict: raw?.result?.verdict ?? null,
        value_status: raw?.result?.value?.status ?? null,
        value_ok: raw?.result?.value?.ok ?? null,
        error_code: raw?.error?.code ?? null,
      },
      source_pending: !raw
        ? 'membro não retornou JSON reconhecível'
        : ['pr-compliance', 'blueprint', 'schema', 'translation'].includes(
              id,
            ) && raw.ok !== true
          ? `${id}: entrada obrigatória não fornecida nesta caracterização`
          : null,
    };
  });
  const exitCodes = {};
  const verdicts = {};
  for (const member of members) {
    const exit = String(member.exit_code);
    exitCodes[exit] = (exitCodes[exit] ?? 0) + 1;
    const verdict = member.raw?.result?.verdict ?? 'unavailable';
    verdicts[verdict] = (verdicts[verdict] ?? 0) + 1;
  }
  return {
    members,
    suite_members: ['ledger-local', 'ledger-rc'],
    counts: {
      total: members.length,
      ok_true: members.filter((member) => member.raw?.ok === true).length,
      ok_false: members.filter((member) => member.raw?.ok === false).length,
      exit_codes: Object.fromEntries(Object.entries(exitCodes).sort()),
      verdicts: Object.fromEntries(Object.entries(verdicts).sort()),
    },
    source_pending: members.some((member) => member.source_pending)
      ? 'um ou mais membros requerem entrada, ambiente ou formato disponível'
      : null,
  };
}

function measureScorecard(repoRoot, hasDevaiConfig) {
  const unknown = (reason) =>
    pending(reason, {
      cells: [],
      counts: { 'N/A': null, PASS: null, UNKNOWN: null },
      observations: {},
    });
  if (!hasDevaiConfig)
    return unknown('audit scorecard não executado sem configuração DEVAI');
  const head = gitSnapshot(repoRoot).headSha;
  if (!head) return unknown('HEAD Git indisponível para audit scorecard');
  const args = [
    'exec',
    'devai',
    'audit',
    'scorecard',
    '--repo-root',
    repoRoot,
    '--at',
    head,
    '--format',
    'json',
  ];
  const result = runReadonlyDevai(args, repoRoot);
  const raw = parseJsonOutput(result.stdout) ?? parseJsonOutput(result.stderr);
  const value = commandValue(raw);
  const cells = value?.cells;
  if (!Array.isArray(cells)) {
    return pending(
      'saída de audit scorecard não contém células reconhecíveis',
      {
        cells: [],
        counts: { 'N/A': null, PASS: null, UNKNOWN: null },
        observations: {
          argv: ['pnpm', ...args].map((arg) => (arg === repoRoot ? '.' : arg)),
          exit_code: result.exitCode,
          raw: stableOutput(raw, repoRoot),
        },
      },
    );
  }
  const ordered = [...cells].sort(
    (left, right) =>
      String(left.substrate).localeCompare(String(right.substrate)) ||
      String(left.property).localeCompare(String(right.property)),
  );
  const keys = ordered.map((cell) => `${cell.substrate}:${cell.property}`);
  const validGrid =
    ordered.length === 45 &&
    new Set(keys).size === 45 &&
    ordered.every(
      (cell) =>
        /^F[1-5]$/.test(cell.substrate) &&
        /^T[1-9]$/.test(cell.property) &&
        typeof cell.verdict === 'string',
    );
  const counts = {};
  for (const cell of ordered) {
    const state = cell.verdict;
    if (typeof state !== 'string') continue;
    counts[state] = (counts[state] ?? 0) + 1;
  }
  return {
    cells: ordered,
    counts,
    observations: {
      argv: ['pnpm', ...args].map((arg) => (arg === repoRoot ? '.' : arg)),
      exit_code: result.exitCode,
      integration_head: value.integration_head ?? null,
      thresholds_used: value.thresholds_used ?? null,
      substrate_aggregates: value.substrate_aggregates ?? null,
      invariant_rollups: value.invariant_rollups ?? null,
      overall: value.overall ?? null,
    },
    source_pending: validGrid
      ? null
      : 'audit scorecard não retornou a grade completa F1–F5 × T1–T9 com verdict',
  };
}

async function measureRounds(repoRoot, hasDevaiConfig) {
  const closureDirectory = resolve(
    repoRoot,
    'record/proofs/compliance/closures',
  );
  const proofClosures = new Map();
  for (const path of await walk(closureDirectory, (entry) =>
    /\/PC-\d+\.json$/.test(entry),
  )) {
    try {
      const closure = await readJson(path);
      if (!/^R-\d{4}$/.test(closure.round_id)) continue;
      proofClosures.set(closure.round_id, [
        ...(proofClosures.get(closure.round_id) ?? []),
        {
          id: closure.id ?? path.match(/PC-\d+/)?.[0],
          path: repoPath(repoRoot, path),
        },
      ]);
    } catch {
      // A closure artifact with invalid JSON is diagnosed on its round below.
    }
  }
  const items = [];
  for (let offset = 0; offset < 17; offset += 1) {
    const roundId = `R-${String(offset + 3).padStart(4, '0')}`;
    const roundPath = resolve(repoRoot, 'work/rounds', roundId);
    const item = {
      close_state_present: await exists(
        resolve(roundPath, 'close-state.jsonl'),
      ),
      criteria: null,
      gates: null,
      pc: null,
      pcs: proofClosures.get(roundId) ?? [],
      closure_present: await exists(resolve(roundPath, 'closure.json')),
      record_present: await exists(resolve(roundPath, 'record.md')),
      round_id: roundId,
      source_pending: null,
      state: null,
      references: {},
      status_raw: null,
    };
    const closurePath = resolve(roundPath, 'closure.json');
    if (item.closure_present) {
      try {
        const closure = await readJson(closurePath);
        item.gates = closure.gates ?? null;
        item.criteria = closure.validation_criteria ?? null;
        item.references.gates = repoPath(repoRoot, closurePath);
        item.references.criteria = repoPath(repoRoot, closurePath);
      } catch (error) {
        item.source_pending = `closure.json inválido: ${error.message}`;
      }
    }
    const recordPath = resolve(roundPath, 'record.md');
    if (item.record_present) {
      const record = await readFile(recordPath, 'utf8');
      const pc = record.match(/^phase_closure:\s*["']?(PC-\d+)/m)?.[1];
      if (pc) {
        item.pc = pc;
        item.references.pc = repoPath(repoRoot, recordPath);
      }
    }
    if (!item.pc && item.pcs.length > 0) {
      item.pc = item.pcs.at(-1).id;
      item.references.pc = item.pcs.at(-1).path;
    }
    if (!hasDevaiConfig) {
      item.source_pending ??=
        'round status DEVAI indisponível sem configuração';
      items.push(item);
      continue;
    }
    const args = [
      'exec',
      'devai',
      'round',
      'status',
      '--round',
      roundId,
      '--repo-root',
      repoRoot,
      '--format',
      'json',
    ];
    const result = runReadonlyDevai(args, repoRoot);
    const raw =
      parseJsonOutput(result.stdout) ?? parseJsonOutput(result.stderr);
    const value = commandValue(raw);
    item.status_raw = stableOutput(
      raw ?? { stderr: result.stderr, stdout: result.stdout },
      repoRoot,
    );
    item.state = value?.lifecycle?.location ?? value?.status ?? null;
    item.source_pending ??=
      value && result.exitCode === 0
        ? null
        : `round status recusado, falhou ou não retornou result.value${raw?.error?.context?.payload?.code ? `: ${raw.error.context.payload.code}` : ''}`;
    items.push(item);
  }
  return {
    counts: {
      closed: items.filter((item) => item.state === 'closed').length,
      total: items.length,
    },
    exceptions: ['R-0001', 'R-0002'],
    active_round: 'R-0020',
    items,
    source_pending: items.some((item) => item.source_pending)
      ? 'source_pending'
      : null,
  };
}

async function measureStaticAxes(repoRoot) {
  const hasDevaiConfig = await exists(
    resolve(repoRoot, '.devai/config/project.json'),
  );
  return {
    checks: measureChecks(repoRoot, hasDevaiConfig),
    mixed_commits: pending('source_pending', {
      counts: { mixed: null },
      items: [],
    }),
    pull_requests: pending(
      'fonte de corpos de PR não declarada nas fontes fechadas',
      {
        counts: { total: null, with_inv_compliance: null, with_papel: null },
        items: [],
      },
    ),
    rounds: await measureRounds(repoRoot, hasDevaiConfig),
    scorecard: measureScorecard(repoRoot, hasDevaiConfig),
  };
}

function markdown(baseline) {
  const axes = [
    ['checks', baseline.checks.members.length],
    ['scorecard', baseline.scorecard.cells.length],
    ['sensors', baseline.sensors.registry_count],
    ['rounds', baseline.rounds.items.length],
    ['proofs', baseline.proofs.jsonl_lines],
    ['tasks', baseline.tasks.items.length],
    ['pull_requests', baseline.pull_requests.items.length],
    ['mixed_commits', baseline.mixed_commits.items.length],
  ];
  const lines = [
    baseline.comparison
      ? '# Linha de base final DEVAI'
      : '# Linha de base DEVAI',
    '',
    `- Rodada: ${baseline.round_id}`,
    `- HEAD: ${baseline.head_sha ?? 'source_pending'}`,
    '',
    '## Fontes',
    '',
    ...(baseline.sources.length === 0
      ? ['source_pending']
      : baseline.sources.map(
          ({ path, sha256: digest }) => `- ${path}: ${digest}`,
        )),
    '',
    '| Eixo | Itens | source_pending |',
    '| --- | ---: | --- |',
    ...axes.map(
      ([axis, count]) =>
        `| ${axis} | ${count ?? 'source_pending'} | ${baseline[axis].source_pending ?? ''} |`,
    ),
    '',
    '## Contagens',
    '',
    ...axes.flatMap(([axis]) => [
      `${axis}:`,
      '',
      '```json',
      JSON.stringify(baseline[axis].counts ?? {}, null, 2),
      '```',
      '',
    ]),
    '## Diagnósticos source_pending',
    '',
    ...axes.flatMap(([axis]) =>
      baseline[axis].source_pending
        ? [`- ${axis}: ${baseline[axis].source_pending}`]
        : [],
    ),
    ...baseline.checks.members
      .filter((member) => member.source_pending)
      .map((member) => `- check ${member.id}: ${member.source_pending}`),
    ...baseline.rounds.items
      .filter((item) => item.source_pending)
      .map((item) => `- ${item.round_id}: ${item.source_pending}`),
    '',
    '## Órfãs de prova',
    '',
    ...(baseline.proofs.source_pending
      ? [`source_pending: ${baseline.proofs.source_pending}`]
      : baseline.proofs.orphans.length === 0
        ? ['Nenhuma.']
        : baseline.proofs.orphans.map(
            ({ path, sequence, sha256: digest }) =>
              `- ${path} #${sequence}: ${digest}`,
          )),
    '',
    '## Tarefas inválidas',
    '',
    ...(baseline.tasks.source_pending
      ? [`source_pending: ${baseline.tasks.source_pending}`]
      : baseline.tasks.items.filter((item) => !item.valid).length === 0
        ? ['Nenhuma.']
        : baseline.tasks.items
            .filter((item) => !item.valid)
            .map((item) => `- ${item.path}: ${JSON.stringify(item.errors)}`)),
    '',
    '## Commits mistos',
    '',
    baseline.mixed_commits.source_pending ?? 'Nenhum.',
    '',
    ...(baseline.comparison
      ? [
          '## Comparação com a abertura',
          '',
          `Veredito: ${baseline.comparison.verdict}`,
          '',
          ...Object.entries(baseline.comparison.axes).map(
            ([axis, result]) =>
              `- ${axis}: ${result.verdict}${result.reasons.length ? ` — ${result.reasons.join('; ')}` : ''}`,
          ),
          '',
        ]
      : []),
  ];
  return `${lines.join('\n')}\n`;
}

function compareBaseline(opening, final) {
  function validateA3Transposition(missing) {
    const expected = [
      [
        'TASK-0001-D1',
        'TASK-0019',
        '07fed96b53f3b69618621658a5f02ee16f556c1091ecbd97ab5188f8c5a79da3',
        '2e399b65df429e7b15c54bf101bb0836ab572a4aa4850115baa9bda5e4a4424a',
        'canonical-move',
      ],
      [
        'TASK-0002-D1',
        'TASK-0020',
        'e12b7024b1873bb62e26430b42c7191694840a593dd14a771feffe734b39971c',
        'ceefd7240511a269d4065a378870113eb9acd523e8658155fed127aa08b7f235',
        'superseded-snapshot',
      ],
      [
        'TASK-0003-D1',
        'TASK-0021',
        '78dec1456d50d88c9075bfe7e2e68cb92b36b765ebc95a31839bfb2fc16289a4',
        '1111e230f99b7e246e93efcdda3584007d3a869056dbb56d7d4f13e9bfc4d845',
        'superseded-snapshot',
      ],
      [
        'TASK-0004-D1',
        'TASK-0022',
        '550bf9088dc64d93541bb9c058574f67a3d7d017df1a8a562add87c617fba163',
        'dbc9ea42827844fb3dc6b5d4283ab6cca22d35931ed9915ccc28821b78391535',
        'superseded-snapshot',
      ],
      [
        'TASK-0004-S1',
        'TASK-0083',
        '084092c2b3e1cb342d12515e531a7ad84ef71c5023257b79077ff9d4d43e8320',
        '7eeb33c8ba0b5f5ef636dfec8899a8f68ab5ad065b7f6146786a04fbf0d1175a',
        'alias',
      ],
      [
        'TASK-0004-S2',
        'TASK-0084',
        'b93d22464a2900ad2c04d0f292aa174c18755031b806774d11122c5e6f6cd1f2',
        '641c2bfa56fba9b984d34f264a399b9277efa6a33f4bf87e1c383f67fef93192',
        'alias',
      ],
      [
        'TASK-0004-S2-R1',
        'TASK-0085',
        '8c2a9478a5039a715ac4df73d9a97d9aefc37248054b87e6cda878c8dba86b68',
        'd59c83167e2b26c4cde11495edea6d1a9ef1644853941f92492fcdf544d07a2b',
        'alias',
      ],
      [
        'TASK-0004-S3',
        'TASK-0086',
        '861af0dbe8228d83c3d1ad390ad687dcf50bd518ebfd0b0bdb9127e8f074ea72',
        '33a58305de7b3191685b8893fa63b35424d5c1a5e380ce9d7e39bc460d343629',
        'alias',
      ],
      [
        'TASK-0004-S4',
        'TASK-0087',
        '5f15df733e9c0861e2d43753cf118b197817e47bb65f70118a9e0819610a581e',
        'eead699a897c7aa1dac8fbfe7131b8cf425941f643ebdd5d3cf3787989175fe5',
        'alias',
      ],
      [
        'TASK-0004-S5',
        'TASK-0088',
        '9266a11250dc38911b9ed42518ccda2a9952f8cc1d146f6586ab166ce5cd0867',
        '6652ff87bb753fee81ceb047a7869ea34c53a11b0ca1f2607fcfa8e2a56bf6f8',
        'alias',
      ],
    ];
    const prefix = 'work/rounds/R-0007/';
    const expectedMissing = expected.map(
      ([oldId]) => `${prefix}tasks/${oldId}.json`,
    );
    if (
      missing.length !== expected.length ||
      missing.some((path) => !expectedMissing.includes(path))
    )
      return 'A3: conjunto de TASKs removidas difere dos dez caminhos autorizados';

    const receipt = final.tasks?.a3_transposition;
    if (
      !receipt ||
      !receipt.artifacts ||
      !Array.isArray(receipt.sidecars) ||
      !receipt.verifier
    )
      return 'A3: recibo ausente ou incompleto';
    const artifactExpected = {
      aliases: [
        'work/rounds/R-0007/tasks/_legacy-originals/aliases.json',
        '21abf670dc42767c69156e17fefd27e41703b788adf7f4dc07559c573efb009c',
      ],
      d1: [
        'work/rounds/R-0007/tasks/_legacy-originals/d1-superseded-snapshots.json',
        'fd60307218ac39d5777292bf724fc7be29d487f87f96f430e55235346b0095a2',
      ],
      report: [
        'work/rounds/R-0020/reports/A3-migration-before-after.json',
        '7518fe70f8314f97763dfe37307eb9dc1468806ef71e49d0bc8f4ffc36afc69d',
      ],
    };
    for (const [name, [path, digest]] of Object.entries(artifactExpected)) {
      const artifact = receipt.artifacts[name];
      if (
        artifact?.path !== path ||
        artifact?.sha256 !== digest ||
        !artifact.entries
      )
        return `A3: artefato congelado ${name} ausente ou divergente`;
    }
    const aliases = receipt.artifacts.aliases.entries;
    const d1 = receipt.artifacts.d1.entries;
    const report = receipt.artifacts.report.entries;
    if (
      !Array.isArray(aliases) ||
      aliases.length !== 6 ||
      !Array.isArray(d1?.entries) ||
      d1.entries.length !== 4 ||
      !Array.isArray(report?.migrations)
    )
      return 'A3: índices ou relatório malformados';
    const reportRows = report.migrations.filter(
      (row) =>
        row?.round_id === 'R-0007' &&
        expectedMissing.includes(`${prefix}${row.old_path}`),
    );
    if (reportRows.length !== 10 || receipt.sidecars.length !== 10)
      return 'A3: cardinalidade de migrações ou sidecars divergente';
    if (!Array.isArray(opening.sources) || !Array.isArray(final.sources))
      return 'A3: fontes ausentes ou malformadas';
    const openingSources = new Map(
      opening.sources.map((source) => [source.path, source.sha256]),
    );
    const finalSources = new Map(
      final.sources.map((source) => [source.path, source.sha256]),
    );
    const finalTasks = new Map(
      final.tasks.items.map((item) => [item.path, item]),
    );
    for (const [oldId, newId, oldHash, newHash, disposition] of expected) {
      const oldPath = `tasks/${oldId}.json`;
      const canonicalPath = `tasks/${newId}.json`;
      const sidecarPath = `tasks/_legacy-originals/${oldId}.json.raw`;
      const fullOld = `${prefix}${oldPath}`;
      const fullCanonical = `${prefix}${canonicalPath}`;
      const fullSidecar = `${prefix}${sidecarPath}`;
      const row = reportRows.filter((entry) => entry.old_path === oldPath);
      const sidecar = receipt.sidecars.filter(
        (entry) => entry?.old_path === fullOld,
      );
      if (
        row.length !== 1 ||
        sidecar.length !== 1 ||
        row[0].round_id !== 'R-0007' ||
        row[0].old_id !== (disposition === 'alias' ? oldId : newId) ||
        row[0].new_id !== newId ||
        row[0].canonical_path !== canonicalPath ||
        row[0].sidecar_path !== sidecarPath ||
        row[0].original_sha256 !== oldHash ||
        row[0].canonical_sha256 !== newHash ||
        row[0].schema_status !== 'pass'
      )
        return `A3: identidade ou hash do relatório divergente para ${oldId}`;
      if (
        sidecar[0].sidecar_path !== fullSidecar ||
        sidecar[0].sha256 !== oldHash ||
        openingSources.get(fullOld) !== oldHash ||
        finalSources.has(fullOld)
      )
        return `A3: origem ou sidecar divergente para ${oldId}`;
      if (
        finalSources.get(fullCanonical) !== newHash ||
        finalTasks.get(fullCanonical)?.valid !== true ||
        finalTasks.get(fullCanonical)?.unreadable === true
      )
        return `A3: destino canônico ausente, inválido ou divergente para ${oldId}`;
      if (disposition === 'alias') {
        const matches = aliases.filter((entry) => entry?.old_path === oldPath);
        if (
          matches.length !== 1 ||
          matches[0].round_id !== 'R-0007' ||
          matches[0].old_id !== oldId ||
          matches[0].new_id !== newId ||
          matches[0].canonical_path !== canonicalPath ||
          matches[0].sidecar_path !== sidecarPath ||
          matches[0].original_sha256 !== oldHash
        )
          return `A3: alias divergente para ${oldId}`;
      } else {
        const matches = d1.entries.filter(
          (entry) => entry?.old_path === oldPath,
        );
        if (
          matches.length !== 1 ||
          matches[0].round_id !== 'R-0007' ||
          matches[0].id !== newId ||
          matches[0].original_sha256 !== oldHash ||
          matches[0].sidecar_path !== sidecarPath ||
          matches[0].disposition !== disposition
        )
          return `A3: snapshot D1 divergente para ${oldId}`;
        if (
          disposition === 'superseded-snapshot' &&
          (matches[0].posterior_path !== canonicalPath ||
            matches[0].posterior_sha256 !== newHash ||
            openingSources.get(fullCanonical) !== newHash)
        )
          return `A3: posterior preexistente divergente para ${oldId}`;
      }
    }
    const verifier = receipt.verifier;
    if (
      JSON.stringify(verifier.argv) !==
        JSON.stringify([
          'node',
          'tools/devai/verify-task-originals.mjs',
          '--repo-root',
          '.',
        ]) ||
      verifier.exit_code !== 0 ||
      !/^[a-f0-9]{64}$/.test(verifier.stdout_sha256 ?? '')
    )
      return 'A3: verificador de originais ausente, negativo ou malformado';
    return null;
  }
  const axisNames = [
    'checks',
    'scorecard',
    'sensors',
    'rounds',
    'proofs',
    'tasks',
    'pull_requests',
    'mixed_commits',
  ];
  const axes = {};
  const failures = [];
  for (const axis of axisNames) {
    const before = opening[axis];
    const after = final[axis];
    const reasons = [];
    let persistedReadings = null;
    let pending =
      !before ||
      !after ||
      Boolean(before?.source_pending || after?.source_pending);
    const fail = (reason) => reasons.push(reason);
    if (!before || !after) {
      pending = true;
      reasons.push('eixo ausente em uma das medições');
    } else if (axis === 'checks') {
      const prior = new Map(before.members.map((item) => [item.id, item]));
      const current = new Map(after.members.map((item) => [item.id, item]));
      if (
        prior.size !== current.size ||
        [...prior.keys()].some((id) => !current.has(id))
      )
        fail('população de membros mudou');
      for (const [id, item] of prior) {
        const next = current.get(id);
        if (!next) continue;
        if (JSON.stringify(item.argv) !== JSON.stringify(next.argv))
          fail(`${id}: argv mudou`);
        if (item.raw?.ok === true && next.raw?.ok !== true)
          fail(`${id}: ok:true regrediu`);
      }
      const failuresBefore = before.members.filter(
        (item) => item.raw?.ok === false,
      ).length;
      const failuresAfter = after.members.filter(
        (item) => item.raw?.ok === false,
      ).length;
      if (failuresAfter > failuresBefore) fail('membros com falha aumentaram');
    } else if (axis === 'scorecard') {
      const current = new Map(
        after.cells.map((cell) => [`${cell.substrate}:${cell.property}`, cell]),
      );
      for (const cell of before.cells) {
        const key = `${cell.substrate}:${cell.property}`;
        if (cell.verdict === 'PASS' && current.get(key)?.verdict !== 'PASS')
          fail(`${key}: PASS regrediu`);
      }
      if (before.cells.length !== after.cells.length)
        fail('grade de células mudou');
    } else if (axis === 'sensors') {
      const persistedReasons = [];
      const current = new Map(after.readings.map((item) => [item.path, item]));
      for (const item of before.readings) {
        if (JSON.stringify(current.get(item.path)) !== JSON.stringify(item)) {
          const reason = `${item.path}: SensorReading removida ou alterada`;
          persistedReasons.push(reason);
          fail(reason);
        }
      }
      const readingsPending =
        before.counts.persisted === null || after.counts.persisted === null;
      if (readingsPending) pending = true;
      persistedReadings = {
        verdict: persistedReasons.length
          ? 'FAIL'
          : readingsPending
            ? 'REVIEW'
            : 'PASS',
        reasons: persistedReasons,
      };
      if (
        before.sense_run_spec_depth?.source_pending ||
        after.sense_run_spec_depth?.source_pending
      ) {
        pending = true;
        reasons.push(
          `fonte pendente: sense run spec_depth — ${before.sense_run_spec_depth?.source_pending ?? ''} ${after.sense_run_spec_depth?.source_pending ?? ''}`.trim(),
        );
      }
    } else if (axis === 'rounds') {
      const current = new Map(after.items.map((item) => [item.round_id, item]));
      for (const item of before.items) {
        const next = current.get(item.round_id);
        if (!next) {
          fail(`${item.round_id}: rodada ausente`);
          continue;
        }
        if (item.record_present && !next.record_present)
          fail(`${item.round_id}: record.md desapareceu`);
        if (item.close_state_present && !next.close_state_present)
          fail(`${item.round_id}: close-state desapareceu`);
        if (item.state === 'closed' && next.state !== 'closed')
          fail(`${item.round_id}: estado closed regrediu`);
        if (
          item.pc &&
          item.pc !== next.pc &&
          !next.pcs?.some((proof) => proof.id === item.pc)
        )
          fail(`${item.round_id}: PC anterior desapareceu`);
        if (item.gates && !next.gates)
          fail(`${item.round_id}: gates desapareceram`);
        if (item.criteria && !next.criteria)
          fail(`${item.round_id}: critérios desapareceram`);
      }
    } else if (axis === 'proofs') {
      const current = new Map(
        (after.lines ?? []).map((line) => [
          `${line.path}:${line.sequence}`,
          line,
        ]),
      );
      for (const line of before.lines ?? []) {
        const next = current.get(`${line.path}:${line.sequence}`);
        if (!next || next.sha256 !== line.sha256)
          fail(`${line.path} #${line.sequence}: prova removida ou reescrita`);
      }
      const priorKeys = new Set(
        (before.lines ?? []).map((line) => `${line.path}:${line.sequence}`),
      );
      const newOrphans = (after.lines ?? []).filter(
        (line) =>
          !priorKeys.has(`${line.path}:${line.sequence}`) && !line.anchored,
      );
      const a2Orphan = {
        path: 'record/proofs/work/generic/R-0021.jsonl',
        sequence: 2,
        sha256:
          'c562dfce81ec9ba08c4d3eae22547ad36adb99fbb76dc2632bb20e81fbbfb804',
      };
      const gate = after.anchor_gate;
      const gatePasses =
        gate?.exit_code === 0 &&
        gate.undeclared_orphans === 0 &&
        gate.duplicate_anchors === 0 &&
        gate.invalid_references === 0 &&
        gate.validation_errors === 0;
      const onlyA2 =
        newOrphans.length === 1 &&
        newOrphans[0].path === a2Orphan.path &&
        newOrphans[0].sequence === a2Orphan.sequence &&
        newOrphans[0].sha256 === a2Orphan.sha256;
      if (
        newOrphans.length > 0 &&
        !(onlyA2 && gatePasses && after.verification?.valid === true)
      ) {
        fail('nova linha órfã sem resolução A2 estrita');
      }
      if (after.duplicate_anchors.length > before.duplicate_anchors.length)
        fail('âncoras duplicadas aumentaram');
      if (
        before.verification?.valid !== true ||
        after.verification?.valid !== true
      )
        pending = true;
    } else if (axis === 'tasks') {
      const current = new Map(after.items.map((item) => [item.path, item]));
      const priorPaths = new Set(before.items.map((item) => item.path));
      const missing = [];
      let sameInvalid = 0;
      let sameUnreadable = 0;
      for (const item of before.items) {
        const next = current.get(item.path);
        if (!next) {
          missing.push(item.path);
          continue;
        }
        if (!next.valid && !next.unreadable) sameInvalid += 1;
        if (next.unreadable) sameUnreadable += 1;
      }
      if (
        sameInvalid > before.counts.invalid ||
        sameUnreadable > before.counts.unreadable
      )
        fail('TASKs inválidas ou ilegíveis aumentaram no mesmo conjunto');
      for (const item of after.items) {
        if (!priorPaths.has(item.path) && !item.valid)
          fail(`${item.path}: TASK nova inválida`);
      }
      if (missing.length > 0) {
        const problem = validateA3Transposition(missing);
        if (problem) fail(problem);
        else
          reasons.push(
            'aceito: dez identidades R-0007 transpostas com recibo A3 íntegro',
          );
      }
    } else if (axis === 'pull_requests') {
      const current = new Map(after.items.map((item) => [item.number, item]));
      for (const item of before.items) {
        const next = current.get(item.number);
        if (!next) {
          fail(`PR #${item.number}: desapareceu`);
          continue;
        }
        for (const trailer of ['inv_compliance', 'papel'])
          if (item[trailer] === true && next[trailer] !== true)
            fail(`PR #${item.number}: trailer ${trailer} desapareceu`);
      }
      pending ||= before.counts?.total === null || after.counts?.total === null;
    } else if (axis === 'mixed_commits') {
      const prior = new Set(before.items.map((item) => item.hash));
      for (const item of after.items) {
        if (!prior.has(item.hash) && item.mixed === true)
          fail(`${item.hash}: commit novo mistura F2/F3`);
      }
    }
    if (before?.source_pending || after?.source_pending)
      reasons.push(
        `fonte pendente: ${before?.source_pending ?? ''} ${after?.source_pending ?? ''}`.trim(),
      );
    const verdict = reasons.some(
      (reason) =>
        !reason.startsWith('fonte pendente:') && !reason.startsWith('aceito:'),
    )
      ? 'FAIL'
      : pending
        ? 'REVIEW'
        : 'PASS';
    axes[axis] = {
      verdict,
      reasons,
      ...(persistedReadings ? { persisted_readings: persistedReadings } : {}),
    };
    if (verdict === 'FAIL') failures.push({ axis, reasons });
  }
  return {
    against_head: opening.head_sha ?? null,
    axes,
    failures,
    verdict: failures.length
      ? 'FAIL'
      : Object.values(axes).some((axis) => axis.verdict === 'REVIEW')
        ? 'REVIEW'
        : 'PASS',
  };
}

async function main() {
  const { against, final, outDir, repoRoot } = parseArgs(process.argv.slice(2));
  const before = gitSnapshot(repoRoot);
  const outputRelative = relative(repoRoot, outDir);
  if (
    outputRelative === '' ||
    (outputRelative !== '..' && !outputRelative.startsWith(`..${sep}`))
  ) {
    throw new Error(
      '--out-dir deve ficar fora do repositório para preservar o estado Git',
    );
  }
  const [sources, proofs, tasks, sensors, staticAxes] = await Promise.all([
    sourceEntries(repoRoot),
    measureProofs(repoRoot),
    measureTasks(repoRoot),
    measureSensors(repoRoot),
    measureStaticAxes(repoRoot),
  ]);
  const baseline = {
    schema_version: '1.0.0',
    round_id: 'R-0020',
    head_sha: before.headSha,
    sources,
    checks: staticAxes.checks,
    scorecard: staticAxes.scorecard,
    sensors,
    rounds: staticAxes.rounds,
    proofs,
    tasks,
    pull_requests: staticAxes.pull_requests,
    mixed_commits: staticAxes.mixed_commits,
  };
  if (final) {
    const opening = await readJson(against);
    if (
      opening.schema_version !== baseline.schema_version ||
      opening.round_id !== baseline.round_id
    )
      throw new Error('--against não é uma baseline de abertura compatível');
    const finalPaths = new Set(baseline.tasks.items.map((item) => item.path));
    if (opening.tasks.items.some((item) => !finalPaths.has(item.path)))
      baseline.tasks.a3_transposition = await measureA3Transposition(repoRoot);
    baseline.comparison = compareBaseline(opening, baseline);
  }
  await mkdir(outDir, { recursive: true });
  const prettierOptions =
    (await prettier.resolveConfig(resolve(repoRoot, 'package.json'))) ?? {};
  await writeFile(
    resolve(outDir, final ? 'baseline-final.json' : 'baseline.json'),
    await prettier.format(`${JSON.stringify(baseline, null, 2)}\n`, {
      ...prettierOptions,
      parser: 'json',
    }),
  );
  await writeFile(
    resolve(outDir, final ? 'baseline-final.md' : 'baseline.md'),
    await prettier.format(markdown(baseline), {
      ...prettierOptions,
      parser: 'markdown',
    }),
  );
  const after = gitSnapshot(repoRoot);
  if (before.status !== after.status || before.headSha !== after.headSha) {
    throw new Error(
      'a medição recusou uma alteração no estado Git do repositório',
    );
  }
  if (baseline.comparison?.verdict === 'FAIL') {
    throw new Error('comparação final detectou regressão');
  }
}

main().catch((error) => {
  process.stderr.write(`baseline: ${error.message}\n`);
  process.exitCode = 1;
});
