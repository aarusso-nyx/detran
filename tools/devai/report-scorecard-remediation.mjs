// Render captured native results and explicit assessment decisions; never score a cell.
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import {
  parseCommandDocument,
  unwrapCommandDocument,
} from './scorecard-output.mjs';
import { countBy, reconcileRegister } from './scorecard-register.mjs';

const [auditArg, assessmentArg, outputArg] = process.argv.slice(2);
if (!auditArg || !assessmentArg || !outputArg)
  throw new Error(
    'Usage: report-scorecard-remediation.mjs <captures> <assessments.json> <new-output>',
  );
const root = process.cwd(),
  audit = resolve(auditArg),
  output = resolve(outputArg);
if (existsSync(output))
  throw new Error(
    'Output must be a new directory; preserve previous assessments',
  );
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const normalized = (data) =>
  Array.isArray(data)
    ? data.map(normalized)
    : data && typeof data === 'object'
      ? Object.fromEntries(
          Object.keys(data)
            .sort()
            .map((key) => [key, normalized(data[key])]),
        )
      : data;
const value = (raw) => unwrapCommandDocument(parseCommandDocument(raw));
const context = read(join(audit, 'evaluation-context.json'));
const decisions = read(assessmentArg);
const scorecard = value(read(join(audit, 'evaluated-scorecard.json')));
const installed = read('node_modules/@aarusso-nyx/devai/package.json');
if (context.framework_version !== installed.version)
  throw new Error('Assessment must use the installed evaluated provider');
const registry = read(
  'node_modules/@aarusso-nyx/devai/dist/runtime/index/sensor-registry.json',
).entries;
const observations = new Map();
function add(reading, path, raw, measurement = true) {
  if (!reading?.id || !reading.sensor?.kind) return;
  const canonical = `.devai/state/sensor-readings/${reading.sensor.kind}/${reading.id}.json`;
  if (!existsSync(canonical))
    throw new Error(`Reading was not persisted: ${reading.id}`);
  const stored = read(canonical);
  if (
    JSON.stringify(normalized(stored)) !== JSON.stringify(normalized(reading))
  )
    throw new Error(`Capture differs from persisted reading: ${reading.id}`);
  const prior = observations.get(reading.id),
    capture = `raw/${basename(path)}`;
  observations.set(reading.id, {
    reading,
    capture: prior?.has_measurement_capture ? prior.capture : capture,
    captures: [...new Set([...(prior?.captures ?? []), capture])],
    has_measurement_capture:
      measurement || prior?.has_measurement_capture === true,
    execution_commands: [
      ...(prior?.execution_commands ?? []),
      ...(measurement ? [raw.argv] : []),
    ],
    canonical_path: canonical,
    canonical_sha256: hash(readFileSync(canonical)),
    capture_terminated:
      prior?.capture_terminated || Boolean(raw.timedOut || raw.signal),
  });
}
for (const name of readdirSync(audit).filter(
  (name) => name.endsWith('.json') && !/-reading-\d+\.json$/.test(name),
)) {
  const path = join(audit, name),
    raw = read(path),
    document = value(raw);
  for (const result of document?.results ?? []) {
    let reading;
    try {
      reading = JSON.parse(result.stdout);
    } catch (error) {
      if (error instanceof SyntaxError) continue;
      throw error;
    }
    add(reading, path, raw);
  }
  if (document?.reading) add(document.reading, path, raw, false);
}
const register = reconcileRegister({
  scorecard,
  commit: context.integration_head,
  registry,
  assessments: decisions.rows,
  observations,
});
const summary = {
  round: 'R-0036',
  integration_head: context.integration_head,
  framework_version: context.framework_version,
  applicable: register.length,
  not_applicable: 2,
  native_counts: countBy(scorecard.cells, 'verdict'),
  assessment_counts: countBy(register, 'evaluation_disposition'),
  supported_machine_verdicts: register.filter((row) =>
    ['PASS', 'REVIEW', 'FAIL'].includes(row.native_verdict),
  ).length,
  overall: scorecard.overall.verdict,
  readiness_established: false,
};
const baseline = decisions.baseline_register
  ? read(decisions.baseline_register)
  : undefined;
const comparison = baseline
  ? {
      baseline_register: decisions.baseline_register,
      baseline_native_applicable_counts: countBy(baseline, 'native_verdict'),
      baseline_assessment_counts: countBy(baseline, 'evaluation_disposition'),
      current_native_applicable_counts: countBy(register, 'native_verdict'),
      current_assessment_counts: summary.assessment_counts,
      cells: register.map((row) => ({
        cell: row.cell,
        before: baseline.find((old) => old.cell === row.cell),
        after: row,
      })),
    }
  : undefined;

mkdirSync(join(output, 'raw'), { recursive: true });
const write = (name, data) =>
  writeFileSync(join(output, name), JSON.stringify(data, null, 2) + '\n');
for (const file of readdirSync(audit))
  if (file.endsWith('.json'))
    copyFileSync(join(audit, file), join(output, 'raw', file));
copyFileSync(assessmentArg, join(output, 'assessment-decisions.json'));
write('scorecard.json', scorecard);
write('summary.json', summary);
write('evaluation-register.json', register);
if (comparison) write('baseline-comparison.json', comparison);
const table = register
  .map(
    (row) =>
      `| ${row.cell} | ${row.native_verdict} | ${row.evaluation_disposition} | ${row.follow_up_owner} |`,
  )
  .join('\n');
writeFileSync(
  join(output, 'assessment.md'),
  `# R-0036 scorecard remediation assessment\n\nEvaluated commit: \`${context.integration_head}\`. Published DEVAI ${context.framework_version}.\n\nNative results: ${JSON.stringify(summary.native_counts)}. Evidence sufficiency: ${JSON.stringify(summary.assessment_counts)}. There are ${summary.supported_machine_verdicts} supported machine verdicts; this is distinct from the measured-cell count. Readiness is not established. The two historical N/A coordinates are preserved.\n\n| Cell | Native verdict | Evidence sufficiency | Follow-up owner |\n| --- | --- | --- | --- |\n${table}\n\nThe JSON register retains each criterion, declared population, native evidence, limitation and next action. Native FAIL does not imply a collector defect, and command success does not establish readiness. See the separate remediation backlog for product findings.\n`,
);
const files = [];
function inventory(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) inventory(path);
    else
      files.push({
        path: relative(root, path),
        sha256: hash(readFileSync(path)),
      });
  }
}
inventory(output);
write('evidence-manifest.json', {
  schemaVersion: '1.0.0',
  evaluated_commit: context.integration_head,
  framework_version: context.framework_version,
  artifacts: files,
  canonical_readings: [
    ...new Map(
      register
        .flatMap((row) => row.evidence)
        .map((item) => [
          item.id,
          {
            id: item.id,
            path: item.canonical_path,
            sha256: item.canonical_sha256,
          },
        ]),
    ).values(),
  ],
});
console.log(JSON.stringify(summary));
