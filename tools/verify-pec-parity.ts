import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const useCaseDirectory = path.join(
  root,
  'docs/framework/product/domains/ch/pec/use-cases',
);
const blockerPath = path.join(root, 'docs/meta/pec-parity-blockers.json');
const dispositionPath = path.join(
  root,
  'docs/meta/pec-origin-test-disposition.csv',
);
const acceptancePattern = /AC-PEC-\d{3}-\d+/g;

function filesBelow(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target);
    return entry.isFile() ? [target] : [];
  });
}

function idsIn(files: string[]): Set<string> {
  return new Set(
    files.flatMap(
      (file) => fs.readFileSync(file, 'utf8').match(acceptancePattern) ?? [],
    ),
  );
}

const accepted = idsIn(
  fs
    .readdirSync(useCaseDirectory)
    .filter((name) => /^UC-PEC-\d{3}\.md$/.test(name))
    .map((name) => path.join(useCaseDirectory, name)),
);
const tested = idsIn(
  [path.join(root, 'backend'), path.join(root, 'packages')]
    .flatMap(filesBelow)
    .filter((file) => /\.spec\.ts$/.test(file)),
);
const blockers = JSON.parse(fs.readFileSync(blockerPath, 'utf8')) as {
  verdict: string;
  acceptanceBlockers: Array<{ id: string; authority: string; reason: string }>;
  nonAcceptanceBlockers: Array<{
    id: string;
    authority: string;
    reason: string;
  }>;
};
const blocked = new Set(blockers.acceptanceBlockers.map(({ id }) => id));
const failures: string[] = [];

if (accepted.size !== 76)
  failures.push(`expected 76 acceptance criteria, found ${accepted.size}`);
for (const id of accepted) {
  const coverage = Number(tested.has(id)) + Number(blocked.has(id));
  if (coverage !== 1)
    failures.push(`${id} must be exactly one of tested or blocked`);
}
for (const id of [...tested, ...blocked]) {
  if (!accepted.has(id))
    failures.push(`${id} is not present in the reviewed use cases`);
}
for (const blocker of blockers.acceptanceBlockers) {
  if (!blocker.authority.trim() || !blocker.reason.trim()) {
    failures.push(`${blocker.id} lacks authority or reason`);
  }
}
if (blocked.size !== blockers.acceptanceBlockers.length) {
  failures.push('acceptance blocker IDs must be unique');
}
if (
  blockers.acceptanceBlockers.length + blockers.nonAcceptanceBlockers.length >
    0 &&
  blockers.verdict !== 'NOT_READY'
) {
  failures.push('a blocker ledger with entries must have verdict NOT_READY');
}
for (const blocker of blockers.nonAcceptanceBlockers) {
  if (
    !blocker.id.trim() ||
    !blocker.authority.trim() ||
    !blocker.reason.trim()
  ) {
    failures.push('non-acceptance blocker lacks id, authority or reason');
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value);
  if (quoted) throw new Error('unterminated quoted CSV field');
  return values;
}

const dispositionLines = fs
  .readFileSync(dispositionPath, 'utf8')
  .trimEnd()
  .split('\n');
if (dispositionLines.length !== 612) {
  failures.push(
    `expected CSV header plus 611 origin specs, found ${dispositionLines.length}`,
  );
}
if (
  dispositionLines[0] !== 'origin_path,kind,disposition,target_evidence,reason'
) {
  failures.push('origin test disposition header is invalid');
}
const dispositionRows = dispositionLines.slice(1).map((line, index) => {
  try {
    return parseCsvLine(line);
  } catch (error) {
    failures.push(`origin test disposition row ${index + 2}: ${String(error)}`);
    return [];
  }
});
const originPaths = dispositionRows.map((row) => row[0]);
if (new Set(originPaths).size !== originPaths.length) {
  failures.push('origin test disposition contains duplicate paths');
}
const allowedKinds = new Set([
  'behavioral',
  'generated-wrapper',
  'placeholder',
]);
const allowedDispositions = new Set([
  'blocked',
  'deferred',
  'ported',
  'superseded',
]);
dispositionRows.forEach((row, index) => {
  if (row.length !== 5 || row.some((value) => !value?.trim())) {
    failures.push(
      `origin test disposition row ${index + 2} must contain five non-empty fields`,
    );
    return;
  }
  if (!allowedKinds.has(row[1] as string)) {
    failures.push(`origin test disposition row ${index + 2} has invalid kind`);
  }
  if (!allowedDispositions.has(row[2] as string)) {
    failures.push(
      `origin test disposition row ${index + 2} has invalid disposition`,
    );
  }
});

const unresolvedBehavioral = dispositionRows.filter(
  (row) =>
    row[1] === 'behavioral' && (row[2] === 'blocked' || row[2] === 'deferred'),
);
const hasLedgerBlockers =
  blockers.acceptanceBlockers.length > 0 ||
  blockers.nonAcceptanceBlockers.length > 0;
if (
  (hasLedgerBlockers || unresolvedBehavioral.length > 0) &&
  blockers.verdict !== 'NOT_READY'
) {
  failures.push(
    'acceptance/non-acceptance blockers or unresolved behavioral origin specs require NOT_READY',
  );
}
if (
  !hasLedgerBlockers &&
  unresolvedBehavioral.length === 0 &&
  blockers.verdict !== 'READY'
) {
  failures.push('a fully closed parity ledger must have verdict READY');
}

if (failures.length) {
  console.error('PEC parity verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `verify-pec-parity: ACCOUNTED / ${blockers.verdict} (${tested.size}/${accepted.size} tested, ${blocked.size}/${accepted.size} blocked, ${unresolvedBehavioral.length} behavioral origin specs deferred/blocked, 611 origin specs dispositioned)`,
  );
}
