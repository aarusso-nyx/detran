// Runs `npm audit` and fails on any advisory at or above the threshold that is
// not covered by a reviewed, dated exception in security/audit-exceptions.json.
// An expired or malformed exception fails the gate too: exceptions are
// re-evaluated, never forgotten. Advisories without a fixed release can only
// pass this way. An audit that could not run (registry error, bad JSON,
// abnormal exit) fails closed.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('..', import.meta.url));
const levels = ['info', 'low', 'moderate', 'high', 'critical'];
const thresholdName = process.env.AUDIT_LEVEL ?? 'moderate';
const threshold = levels.indexOf(thresholdName);
if (threshold < 0) fail(`unknown AUDIT_LEVEL "${thresholdName}"`);

function fail(message) {
  console.error(`BLOCKED  ${message}`);
  process.exit(1);
}

// --- exceptions: every field validated before it can authorize anything ----
const exceptionsFile = new URL(
  '../security/audit-exceptions.json',
  import.meta.url,
);
const today = new Date().toISOString().slice(0, 10);
const isoDate = /^\d{4}-\d{2}-\d{2}$/u;
const ghsaId = /^GHSA(?:-[a-z0-9]{4}){3}$/u;

function isCalendarDate(value) {
  if (!isoDate.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

let exceptions;
try {
  ({ exceptions } = JSON.parse(await readFile(exceptionsFile, 'utf8')));
} catch (error) {
  fail(`cannot read audit-exceptions.json: ${error.message}`);
}
if (!Array.isArray(exceptions))
  fail('audit-exceptions.json: "exceptions" must be an array');

const active = new Map();
let failed = false;
for (const [index, exception] of exceptions.entries()) {
  const where = `audit-exceptions.json#${index}`;
  const problems = [];
  if (typeof exception?.id !== 'string' || !ghsaId.test(exception.id))
    problems.push('id must be a GHSA identifier');
  if (typeof exception?.package !== 'string' || exception.package.trim() === '')
    problems.push('package must be a non-empty string');
  if (typeof exception?.reason !== 'string' || exception.reason.trim() === '')
    problems.push('reason must be a non-empty string');
  if (
    typeof exception?.expires !== 'string' ||
    !isCalendarDate(exception.expires)
  )
    problems.push('expires must be a calendar date in YYYY-MM-DD');
  if (problems.length > 0) {
    failed = true;
    console.error(`BLOCKED  ${where}: ${problems.join('; ')}`);
    continue;
  }
  if (exception.expires < today) {
    failed = true;
    console.error(
      `EXPIRED  ${exception.id} ${exception.package} (${exception.expires}) — re-evaluate or remove it`,
    );
    continue;
  }
  if (active.has(exception.id)) {
    failed = true;
    console.error(`BLOCKED  ${where}: duplicate exception for ${exception.id}`);
    continue;
  }
  active.set(exception.id, exception);
}

// --- audit: fail closed on anything but a well-formed report ---------------
const audit = spawnSync('npm', ['audit', '--json'], {
  cwd: siteRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (audit.error) fail(`npm audit could not start: ${audit.error.message}`);
if (audit.signal) fail(`npm audit was killed by ${audit.signal}`);
// npm audit exits 0 with no findings and 1 with findings; anything else is
// an operational failure even when stdout carries JSON.
if (audit.status !== 0 && audit.status !== 1)
  fail(
    `npm audit exited ${audit.status}: ${(audit.stderr || '').trim().slice(-2000)}`,
  );

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  fail(
    `npm audit did not return JSON: ${(audit.stderr || audit.stdout || '').trim().slice(-2000)}`,
  );
}
if (report === null || typeof report !== 'object')
  fail('npm audit returned a non-object report');
if (report.error)
  fail(
    `npm audit reported an error: ${report.error.code ?? ''} ${report.error.summary ?? report.error.message ?? ''}`.trim(),
  );
if (
  report.vulnerabilities === null ||
  typeof report.vulnerabilities !== 'object' ||
  typeof report.metadata?.vulnerabilities?.total !== 'number'
)
  fail(
    'npm audit report is missing "vulnerabilities" or "metadata.vulnerabilities"',
  );
if ((audit.status === 1) !== report.metadata.vulnerabilities.total > 0)
  fail(
    `npm audit exit status ${audit.status} disagrees with ${report.metadata.vulnerabilities.total} reported vulnerabilities`,
  );

// --- evaluate -------------------------------------------------------------
const advisories = new Map();
for (const entry of Object.values(report.vulnerabilities)) {
  for (const via of entry.via ?? []) {
    if (via === null || typeof via !== 'object') continue;
    if (levels.indexOf(via.severity) < threshold) continue;
    const id = via.url?.split('/').pop() ?? String(via.source);
    const seen = advisories.get(id) ?? { ...via, id, paths: new Set() };
    seen.paths.add(`${entry.name}@${entry.range}`);
    advisories.set(id, seen);
  }
}

let allowed = 0;
for (const advisory of advisories.values()) {
  const exception = active.get(advisory.id);
  if (exception) {
    allowed += 1;
    console.log(
      `allowed  ${advisory.severity.padEnd(8)} ${advisory.id} ${advisory.name} ${advisory.range} — ${exception.reason} (until ${exception.expires})`,
    );
    continue;
  }
  failed = true;
  console.error(
    `BLOCKED  ${advisory.severity.padEnd(8)} ${advisory.id} ${advisory.name} ${advisory.range} via ${[...advisory.paths].join(', ')}: ${advisory.title}`,
  );
}
for (const id of active.keys()) {
  if (!advisories.has(id))
    console.log(`unused   exception ${id} no longer matches — remove it`);
}

console.log(
  `npm audit: ${report.metadata.vulnerabilities.total} flagged entries, ${advisories.size} distinct advisories at or above ${thresholdName}, ${allowed} allowed by exception`,
);
process.exit(failed ? 1 : 0);
