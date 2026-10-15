// Runs `npm audit` and fails on any advisory at or above the threshold that is
// not covered by a reviewed, dated exception in security/audit-exceptions.json.
// An expired exception fails the gate too: exceptions are re-evaluated, never
// forgotten. Advisories without a fixed release can only pass this way.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('..', import.meta.url));
const levels = ['info', 'low', 'moderate', 'high', 'critical'];
const threshold = levels.indexOf(process.env.AUDIT_LEVEL ?? 'moderate');

const exceptionsFile = new URL(
  '../security/audit-exceptions.json',
  import.meta.url,
);
const { exceptions } = JSON.parse(await readFile(exceptionsFile, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const audit = spawnSync('npm', ['audit', '--json'], {
  cwd: siteRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (!audit.stdout) {
  console.error(audit.stderr || 'npm audit produced no output');
  process.exit(audit.status || 1);
}
const report = JSON.parse(audit.stdout);

const advisories = new Map();
for (const entry of Object.values(report.vulnerabilities ?? {})) {
  for (const via of entry.via ?? []) {
    if (typeof via !== 'object') continue;
    if (levels.indexOf(via.severity) < threshold) continue;
    const id = via.url?.split('/').pop() ?? String(via.source);
    const seen = advisories.get(id) ?? { ...via, id, paths: new Set() };
    seen.paths.add(`${entry.name}@${entry.range}`);
    advisories.set(id, seen);
  }
}

let failed = false;
for (const exception of exceptions) {
  if (exception.expires < today) {
    failed = true;
    console.error(
      `EXPIRED exception ${exception.id} (${exception.expires}): ${exception.package} — re-evaluate or remove it`,
    );
  }
}
const active = new Map(
  exceptions.filter((e) => e.expires >= today).map((e) => [e.id, e]),
);

for (const advisory of advisories.values()) {
  const exception = active.get(advisory.id);
  if (exception) {
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

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `npm audit: ${counts.total ?? 0} flagged entries, ${advisories.size} distinct advisories at or above ${levels[threshold]}, ${advisories.size - [...advisories.keys()].filter((id) => !active.has(id)).length} allowed by exception`,
);
process.exit(failed ? 1 : 0);
