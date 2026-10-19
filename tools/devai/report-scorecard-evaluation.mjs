// Render an assessment of captured observations; never write a native verdict.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import {
  parseCommandDocument,
  unwrapCommandDocument,
} from './scorecard-output.mjs';

const audit = '.devai/local/rounds/R-0036/audit';
const output = process.argv[2] ?? join(audit, 'rendered');
if (output === audit)
  throw new Error('Reports must not overwrite raw captures');
mkdirSync(output, { recursive: true });
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const write = (name, value) =>
  writeFileSync(join(output, name), JSON.stringify(value, null, 2) + '\n');
const context = read(join(audit, 'evaluation-context.json'));
const source = read('law/policy/scorecard-sensor-inputs.json');
const registry = read(
  'node_modules/@aarusso-nyx/devai/dist/runtime/index/sensor-registry.json',
).entries;
const captureNames = readdirSync(audit).filter(
  (name) => name.endsWith('.json') && !/-reading-\d+\.json$/.test(name),
);
const captures = captureNames.map((name) => ({
  path: join(audit, name),
  raw: read(join(audit, name)),
}));
const valueOf = (raw) => unwrapCommandDocument(parseCommandDocument(raw));
const scorecard = valueOf(read(join(audit, 'evaluated-scorecard.json')));
const baseline = valueOf(read(join(audit, 'baseline-scorecard.json')));
if (scorecard.integration_head !== context.integration_head)
  throw new Error('Scorecard candidate mismatch');
const keys = scorecard.cells.map(
  (cell) => `${cell.substrate}:${cell.property}`,
);
if (keys.length !== 45 || new Set(keys).size !== 45)
  throw new Error('Expected 45 unique cells');
if (
  scorecard.cells
    .filter((cell) => cell.verdict === 'N/A')
    .map((cell) => `${cell.substrate}:${cell.property}`)
    .sort()
    .join(',') !== 'F1:T1,F4:T5'
)
  throw new Error('N/A ledger changed');

const observations = new Map();
for (const capture of captures) {
  for (const result of valueOf(capture.raw)?.results ?? []) {
    let reading;
    try {
      reading = JSON.parse(result.stdout);
    } catch {
      continue;
    }
    if (!reading?.id || !reading.sensor) continue;
    observations.set(reading.id, {
      reading,
      capture: join(output, 'raw', relative(audit, capture.path)),
    });
  }
}

// These are assessment limitations, independent of the unchanged native verdicts.
const blocked = {
  'F2:T1':
    'PLANT_COVERAGE_NO_INVENTORY: the required canonical inventory body is unavailable.',
  'F2:T4':
    'The migration adapter hard-codes db/migrations; DETRAN uses its ordered backend/database/apply.sh. Disposable DDL succeeded separately.',
  'F2:T5':
    'Root ESLint invocation exited 2 because no root eslint.config exists; zero parsed errors does not establish lint quality.',
  'F2:T6':
    'The security sensor could not obtain a supported dependency audit result.',
  'F2:T7':
    'No existing performance suite is configured; no workload or target was invented.',
  'F2:T8':
    'The native root tsc invocation printed help because there is no root tsconfig. The actual workspace typecheck passed separately.',
  'F3:T1':
    'All three configured suite commands were refused with AUTHORITY_HOST_PROCESS_ADAPTER_REQUIRED; supplemental test results are not native readings.',
  'F3:T2':
    'No full RC coverage report/producer. Empty exclusions are schema-valid but rejected by the adapter; compatible-input retry retained the producer failure.',
  'F4:T1':
    'API inventory found 1151 endpoints, but routes/data model bodies are empty or absent. Combined coverage is incomplete.',
  'F4:T2':
    'Routes and data model inputs are unavailable, preventing inventory-depth assessment.',
  'F4:T6':
    'RBAC and data handling measurements lack the required data model input.',
};
const partial = {
  'F1:T4':
    'Reverse alignment scanned 108 conventional source files; this does not cover backend/apps monorepo source roots.',
  'F1:T6':
    'Security specification checks use conventional security/migration paths that do not match the complete DETRAN layout.',
  'F1:T7':
    'No normalized performance targets were found; conventional code-root discovery does not establish completeness of domain specifications.',
  'F1:T8':
    'No normalized error-semantics targets were found; engineering must map existing domain error contracts before declaring their absence.',
  'F2:T2':
    'Only 108 conventional source files were counted, including generated clients; authored plant coverage is incomplete.',
  'F2:T3':
    'Only seven conventional directories were scanned; backend/apps boundaries need a monorepo-aware adapter.',
  'F3:T3':
    'The sensor scanned only four packages, not the full workspace test population.',
  'F4:T4':
    'Adherence flags conventional-layout orphans; triage against domain-first ADR-0001 before treating them as product defects.',
  'F4:T7':
    'Timing covers seven inventory attempts, including missing-input observations; it is not a complete successful inventory benchmark.',
  'F4:T9':
    'Regeneration produced dependency/coverage bodies, but retained missing API/routes prerequisites; complete inventory regeneration remains unproven.',
  'F5:T7':
    'CI timing is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch; preserve the declared push/main population limitation.',
  'F5:T8':
    'CI flakiness is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch.',
  'F5:T9':
    'CI success rate is measured, but DEVAI reports HARNESS_POPULATION_UNVERIFIED for baseBranch; this is historical CI, not candidate CI.',
};
const ownerFor = (cell) =>
  cell.substrate === 'F3'
    ? 'Inspector'
    : cell.substrate === 'F2'
      ? 'Engineer'
      : 'Architect';
const remediation = existsSync(join(audit, 'remediation-backlog.json'))
  ? read(join(audit, 'remediation-backlog.json')).map((capture) => ({
      request: capture.request,
      ...valueOf(capture),
    }))
  : [];
const remediationGroups = {
  'command-adapters': ['F2:T4', 'F2:T5', 'F2:T8', 'F3:T1'],
  'monorepo-population': [
    'F1:T4',
    'F1:T6',
    'F1:T7',
    'F1:T8',
    'F2:T2',
    'F2:T3',
    'F3:T3',
    'F4:T4',
  ],
  inventory: ['F2:T1', 'F4:T1', 'F4:T2', 'F4:T6', 'F4:T7', 'F4:T9'],
  coverage: ['F3:T2'],
  'security-audit': ['F2:T6'],
  'performance-targets': ['F1:T7', 'F1:T8', 'F2:T7', 'F3:T7'],
  'harness-findings': ['F5:T3', 'F5:T4', 'F5:T5'],
  'ci-population': ['F5:T7', 'F5:T8', 'F5:T9'],
  'test-observations': ['F3:T1', 'F3:T8'],
};
const register = scorecard.cells
  .filter((cell) => cell.verdict !== 'N/A')
  .map((cell) => {
    const coordinate = `${cell.substrate}:${cell.property}`;
    const sensors = registry.filter((entry) =>
      entry.cells?.some(
        (binding) =>
          binding.substrate === cell.substrate &&
          binding.property === cell.property,
      ),
    );
    const readings = (cell.sensor_readings ?? []).map((id) =>
      observations.get(id),
    );
    if (readings.some((entry) => !entry))
      throw new Error(`Missing observation for ${coordinate}`);
    const disposition = blocked[coordinate]
      ? 'blocked'
      : partial[coordinate]
        ? 'partial'
        : 'measured';
    return {
      cell: coordinate,
      registered_sensors: sensors.map((entry) => entry.kind),
      criteria:
        'Installed DEVAI 2.2.0 observed sensor rules; native threshold provenance is retained (the scorecard reports defaults). The bound threshold file is fingerprinted and unchanged, without claiming every sensor consumes it.',
      input_population: {
        declaration_source: 'law/policy/scorecard-sensor-inputs.json',
        declared_inputs: Object.fromEntries(
          sensors
            .filter((entry) => source.inputs[entry.kind])
            .map((entry) => [entry.kind, source.inputs[entry.kind]]),
        ),
        inventory: 'work/rounds/R-0036/inputs/population.json',
        discovery_scope:
          disposition === 'measured'
            ? 'Native sensor predicate and observed population; pattern-based checks do not prove runtime behavior.'
            : (blocked[coordinate] ?? partial[coordinate]),
      },
      execution_commands: sensors.flatMap((entry) =>
        captures.flatMap((capture) => {
          const v = valueOf(capture.raw);
          return (v?.results ?? []).some(
            (result) => result.command === `devai sense run ${entry.kind}`,
          )
            ? [capture.raw.argv]
            : [];
        }),
      ),
      native_verdict: cell.verdict,
      evaluation_disposition: disposition,
      evidence: readings.map((entry) => ({
        id: entry.reading.id,
        capture: entry.capture,
        canonical_path: `.devai/state/sensor-readings/${entry.reading.sensor.kind}/${entry.reading.id}.json`,
        status: entry.reading.status,
        command: entry.reading.command,
        findings: entry.reading.findings ?? [],
        metrics: entry.reading.metrics ?? {},
      })),
      limitations:
        blocked[coordinate] ??
        partial[coordinate] ??
        'This evaluates the named sensor predicate only; it is not a production-readiness certification.',
      follow_up_owner: ownerFor(cell),
      remediation_refs: remediation
        .filter((item) => remediationGroups[item.request]?.includes(coordinate))
        .map((item) => item.id),
      next_action:
        disposition !== 'measured'
          ? 'Resolve the stated measurement gap in a separate governed task, then rerun this cell on the resulting exact commit.'
          : cell.verdict === 'PASS'
            ? 'Retain as baseline; rerun after relevant changes.'
            : 'Triage the native findings without weakening criteria; implement any remediation in a separate governed task.',
    };
  });
if (
  register.length !== 43 ||
  new Set(register.map((entry) => entry.cell)).size !== 43
)
  throw new Error('Expected 43 register rows');
const counts = (items, field) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[field]]: (result[item[field]] ?? 0) + 1,
    }),
    {},
  );
const summary = {
  round: 'R-0036',
  integration_head: context.integration_head,
  baseline_head: baseline.integration_head,
  native_counts: counts(scorecard.cells, 'verdict'),
  assessment_counts: counts(register, 'evaluation_disposition'),
  applicable: 43,
  native_conclusive_cells: register.filter((entry) =>
    ['PASS', 'REVIEW', 'FAIL'].includes(entry.native_verdict),
  ).length,
  overall: scorecard.overall.verdict,
  readiness_established: false,
  checks: captures
    .filter(
      (capture) =>
        Array.isArray(capture.raw.argv) &&
        !/-record-\d+\.json$/.test(capture.path),
    )
    .map((capture) => ({
      path: join(output, 'raw', relative(audit, capture.path)),
      argv: capture.raw.argv,
      exit_code: capture.raw.exitCode,
      timed_out: capture.raw.timedOut ?? false,
    })),
  note: 'Native verdicts are preserved even when caused by measurement infrastructure. Assessment dispositions separately identify blocked or partial populations. Supplemental suite success never becomes a fabricated SensorReading.',
};
write('final-scorecard.json', scorecard);
write('evaluation-register.json', {
  schemaVersion: '1.0.0',
  round: 'R-0036',
  integration_head: context.integration_head,
  items: register,
});
write('baseline-comparison.json', {
  baseline_counts: counts(baseline.cells, 'verdict'),
  ...summary,
});
write('remediation-backlog.json', { round: 'R-0036', items: remediation });
const table = register
  .map(
    (row) =>
      `| ${row.cell} | ${row.native_verdict} | ${row.evaluation_disposition} | ${row.follow_up_owner} | ${row.limitations.replaceAll('|', '/')} |`,
  )
  .join('\n');
writeFileSync(
  join(output, 'assessment.md'),
  `# R-0036 scorecard evaluation\n\nEvaluated commit: \`${context.integration_head}\`. DEVAI 2.2.0.\n\nAll 43 applicable cells have a disposition; the original two N/A cells are preserved. Native results: ${JSON.stringify(summary.native_counts)}. Assessment: ${JSON.stringify(summary.assessment_counts)}. Overall native verdict: **${summary.overall}**. Readiness is not established.\n\nThere are ${summary.native_conclusive_cells} conclusive native cell verdicts. Only ${summary.assessment_counts.measured ?? 0} cells have sufficient evidence for their stated sensor predicate; blocked and partial cells are counted separately. The detailed JSON register includes commands, criteria, populations, findings, metrics, and canonical evidence paths.\n\nThe workspace contains 63 child packages plus the root. The initial 64-manifest inventory also contains the nested SENATRAN documentation site, which is outside the pnpm workspace; it is not silently included in build/test claims. The 750 test-file inventory includes tooling fixtures and does not claim all files execute in a suite.\n\nThe installed CLI cannot bind the sensor-input declaration through a registered init action. Inputs were supplied explicitly, without hand-writing protected configuration. The sweep's original authority refusal, empty-exclusions adapter error, missing coverage producer, suite adapter refusals, and unsuccessful measurements are retained. Machine error envelopes emitted on stderr are decoded without changing their failure status.\n\n| Cell | Native verdict | Assessment | Follow-up owner | Limitation |\n| --- | --- | --- | --- | --- |\n${table}\n\n## Runtime evidence\n\nSee baseline-comparison.json for every captured execution and its exit status. Disposable DDL, seed and RLS smoke succeeded. Native build and supplemental workspace typecheck succeeded. Backend unit tests and omitted unit suites succeeded. The parallel frontend run encountered six test timeouts; targeted reruns passed without changing assertions or timeouts. These are retained as environmental failures, not classified as established product regressions.\n\nThe assessed application sources are unchanged from the baseline. Parser/capture tooling repairs after the measurement commit do not change native readings; this report remains tied to the evaluated commit and does not claim that a later delivery commit has been evaluated. CI metrics concern the declared historical push/main population rather than a candidate CI run.\n\nNo product defect, missing domain target, or readiness claim is ratified by this assessment. Remediation items are separate backlog findings.\n`,
);

const runtimeLabels = [
  'sensor-build',
  'workspace-typecheck',
  'backend-unit',
  'omitted-unit-suites',
  'frontend-tests',
  'frontend-timeout-recheck',
  'dashboard-timeout-recheck',
  'database-reset',
  'database-seed',
  'rls-smoke',
  'backend-integration',
  'backend-e2e',
  'backend-upgrade',
  'mock-integration',
  'mock-e2e',
  'adapter-integration',
  'adapter-e2e',
  'affected-checks',
  'affected-law-tests',
  'affected-law-corpus',
  'affected-state-index',
  'affected-rounds-index',
  'evaluation-tool-tests',
  'final-doctor',
  'final-chain-before-assessment',
  'final-format',
  'delivery-format-recheck',
];
const runtimeTable = runtimeLabels
  .map((label) => {
    const capture = captures.find(
      (entry) => entry.path === join(audit, `${label}.json`),
    );
    return `| ${label} | ${capture ? capture.raw.exitCode : 'not captured'} |`;
  })
  .join('\n');
writeFileSync(
  join(output, 'assessment.md'),
  `\n## Validation and execution outcomes\n\n| Execution | Exit code |\n| --- | --- |\n${runtimeTable}\n\nThe full formatting check reports only the unrelated ignored local file .claude/settings.local.json (mtime 2026-10-17, before this evaluation). It was not edited. Formatting of delivery files passed after correcting the capture-tool check invocation. Native scorecard threshold provenance is defaults; the bound threshold file is unchanged and fingerprinted, which does not establish that each sensor consumed it.\n`,
  { flag: 'a' },
);
writeFileSync(
  join(output, 'assessment.md'),
  '\nExisting suite scripts sometimes exit zero with no test files: suite-results.json in raw/ records those populations explicitly. Backend E2E and upgrade commands passed, but empty package suites do not establish test coverage. See [the detailed register](evaluation-register.json), [remediation tasks](remediation-backlog.md), and [the evidence manifest](evidence-manifest.json).\n',
  { flag: 'a' },
);
writeFileSync(
  join(output, 'remediation-backlog.md'),
  '# R-0036 remediation backlog\n\n' +
    remediation
      .map((item) => `## ${item.id} — ${item.title}\n\n${item.body}\n`)
      .join('\n'),
);
if (output !== audit) {
  const rawDir = join(output, 'raw');
  mkdirSync(rawDir, { recursive: true });
  for (const name of readdirSync(audit).filter(
    (name) =>
      name.endsWith('.json') &&
      ![
        'final-scorecard.json',
        'evaluation-register.json',
        'baseline-comparison.json',
        'evidence-manifest.json',
        'remediation-backlog.json',
      ].includes(name),
  ))
    copyFileSync(join(audit, name), join(rawDir, name));
}
const artifacts = [];
function walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) walk(path);
    else if (name.name !== 'evidence-manifest.json')
      artifacts.push({
        path,
        sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
      });
  }
}
walk(output);
const chain = read('record/proofs/chain.json');
const bound = chain.records
  .filter(
    (record) => record.context?.git?.head_sha === context.integration_head,
  )
  .flatMap((record) =>
    (record.artifacts ?? [])
      .filter((artifact) => artifact.kind === 'sensor-reading')
      .map((artifact) => ({ sequence: record.sequence, ...artifact })),
  );
for (const artifact of bound) {
  if (!existsSync(artifact.path))
    throw new Error(`Missing recorded reading: ${artifact.path}`);
  if (
    createHash('sha256').update(readFileSync(artifact.path)).digest('hex') !==
    artifact.sha256
  )
    throw new Error(`Recorded digest mismatch: ${artifact.path}`);
}
write('evidence-manifest.json', {
  schemaVersion: '1.0.0',
  round: 'R-0036',
  integration_head: context.integration_head,
  context,
  artifacts,
  recorded_readings: bound,
});
console.log(JSON.stringify(summary, null, 2));
