import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = path.join(root, 'docs/meta/pec-origin-superset.json');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) as {
  schemaVersion: string;
  origin: {
    repository: string;
    commit: string;
    packageCount: number;
    tableCount: number;
    specCount: number;
  };
  packages: Record<string, [string, string]>;
  tables: Record<string, [string, string]>;
  transferredArtifacts: Array<{
    origin: string;
    target: string;
    disposition: string;
    evidence: string;
  }>;
};

const failures: string[] = [];
const allowed = new Set(['ported', 'superseded']);
const expectedOrigin = 'cfa8af2ff5349708e686305c7eb0a60d6276f753';

if (ledger.schemaVersion !== '1.0.0')
  failures.push('unsupported ledger schema');
if (ledger.origin.repository !== 'aarusso-nyx/pec')
  failures.push('wrong origin repository');
if (ledger.origin.commit !== expectedOrigin)
  failures.push('wrong immutable origin commit');
if (ledger.origin.packageCount !== 32)
  failures.push('origin package directory count must be 32');
if (ledger.origin.tableCount !== 50)
  failures.push('origin table count must be 50');
if (ledger.origin.specCount !== 611)
  failures.push('origin spec count must be 611');

function verifyMap(
  label: string,
  entries: Record<string, [string, string]>,
  expected: number,
) {
  const rows = Object.entries(entries);
  if (rows.length !== expected)
    failures.push(`${label} ledger has ${rows.length}, expected ${expected}`);
  for (const [origin, [disposition, evidence]] of rows) {
    if (!origin.trim()) failures.push(`${label} has a blank origin key`);
    if (!allowed.has(disposition))
      failures.push(
        `${label} ${origin} has unresolved disposition ${disposition}`,
      );
    if (!evidence.trim() || !fs.existsSync(path.join(root, evidence))) {
      failures.push(`${label} ${origin} evidence does not exist: ${evidence}`);
    }
  }
}

verifyMap('package', ledger.packages, ledger.origin.packageCount);
if (Object.keys(ledger.tables).length !== ledger.origin.tableCount) {
  failures.push(
    `table ledger has ${Object.keys(ledger.tables).length}, expected ${ledger.origin.tableCount}`,
  );
}
for (const [origin, [target, evidence]] of Object.entries(ledger.tables)) {
  if (!origin.includes('.') || !target.trim())
    failures.push(`table ${origin} has no target`);
  if (!evidence.trim() || !fs.existsSync(path.join(root, evidence))) {
    failures.push(`table ${origin} evidence does not exist: ${evidence}`);
  }
}

const namespaceCounts = Object.keys(ledger.tables).reduce<
  Record<string, number>
>((counts, table) => {
  const namespace = table.split('.')[0] ?? '';
  counts[namespace] = (counts[namespace] ?? 0) + 1;
  return counts;
}, {});
for (const [namespace, count] of Object.entries({
  pec: 30,
  auth: 10,
  integration: 7,
  audit: 3,
})) {
  if (namespaceCounts[namespace] !== count) {
    failures.push(
      `${namespace} table count is ${namespaceCounts[namespace] ?? 0}, expected ${count}`,
    );
  }
}

if (ledger.transferredArtifacts.length !== 2)
  failures.push('expected PEC issue #11 and PR #35 dispositions');
for (const artifact of ledger.transferredArtifacts) {
  if (!allowed.has(artifact.disposition))
    failures.push(`${artifact.origin} is unresolved`);
  if (!fs.existsSync(path.join(root, artifact.evidence)))
    failures.push(`${artifact.origin} evidence is missing`);
}
if (
  !ledger.transferredArtifacts.some(
    ({ origin, target }) => origin.endsWith('#11') && target.endsWith('#25'),
  )
) {
  failures.push('PEC issue #11 is not transferred to DETRAN issue #25');
}
if (!ledger.transferredArtifacts.some(({ origin }) => origin.endsWith('#35'))) {
  failures.push('PEC PR #35 has no DETRAN disposition');
}

const workflowText = fs
  .readdirSync(path.join(root, '.github/workflows'))
  .filter((name) => /\.ya?ml$/u.test(name))
  .map((name) =>
    fs.readFileSync(path.join(root, '.github/workflows', name), 'utf8'),
  )
  .join('\n');
if (/actions\/upload-artifact@/u.test(workflowText)) {
  failures.push(
    'PEC PR #35 is not superseded: DETRAN still depends on actions/upload-artifact',
  );
}

if (failures.length) {
  console.error('PEC superset verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `verify-pec-superset: PASS (${Object.keys(ledger.packages).length} packages, ${Object.keys(ledger.tables).length} tables, ${ledger.origin.specCount} specs, ${ledger.transferredArtifacts.length} transferred artifacts)`,
  );
}
