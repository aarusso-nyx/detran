import fs from 'node:fs';
import path from 'node:path';

import {
  DETRAN_ROLES,
  RAIT_ROLES,
  DASHBOARD_ROLES,
} from '../backend/domains/shared/src/roles.ts';

// The canonical role catalogue lives in three places that must agree:
// roles.ts (runtime), 05-role-catalog.sql (database seed) and
// shared/actors.md (product documentation of the RAIT family).
const root = process.cwd();
const ddl = fs.readFileSync(
  path.join(root, 'backend', 'database', 'ddl', '05-role-catalog.sql'),
  'utf8',
);
const actors = fs.readFileSync(
  path.join(root, 'docs', 'framework', 'product', 'shared', 'actors.md'),
  'utf8',
);

const seeded = new Set<string>();
const insertBlock = ddl.slice(ddl.indexOf('INSERT INTO auth.role_catalog'));
for (const match of insertBlock.matchAll(
  /^\s*\('([^']+)',\s*'(pec|teat|rait|dashboard|citizen)'/gm,
)) {
  seeded.add(match[1] ?? '');
}
const runtime = new Set<string>(DETRAN_ROLES);
const problems: string[] = [];
for (const key of runtime)
  if (!seeded.has(key))
    problems.push(
      `- ${key}: in roles.ts but not seeded in 05-role-catalog.sql`,
    );
for (const key of seeded)
  if (!runtime.has(key))
    problems.push(
      `- ${key}: seeded in 05-role-catalog.sql but absent from roles.ts`,
    );
for (const key of RAIT_ROLES)
  if (!actors.includes(`\`${key}\``))
    problems.push(`- ${key}: RAIT role not documented in shared/actors.md`);
for (const key of DASHBOARD_ROLES)
  if (!actors.includes(`\`${key}\``))
    problems.push(
      `- ${key}: DASHBOARD role not documented in shared/actors.md`,
    );

if (problems.length > 0) {
  console.error('check-role-catalog: role catalogue drift');
  problems.forEach((line) => console.error(line));
  process.exitCode = 1;
} else {
  console.log(
    `check-role-catalog: OK (${runtime.size} roles, ${RAIT_ROLES.length} RAIT, ${DASHBOARD_ROLES.length} dashboard)`,
  );
}
