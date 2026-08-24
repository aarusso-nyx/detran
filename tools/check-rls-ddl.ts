import fs from 'node:fs';
import path from 'node:path';

const ddlDirectory = path.join(process.cwd(), 'backend', 'database', 'ddl');
const files = fs
  .readdirSync(ddlDirectory)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => fs.readFileSync(path.join(ddlDirectory, name), 'utf8'));
const sql = files.join('\n');
const tenantTables = new Set<string>();
const createTable =
  /create\s+table\s+if\s+not\s+exists\s+([\w.]+)\s*\(([\s\S]*?)\);/gi;
let match: RegExpExecArray | null;
while ((match = createTable.exec(sql))) {
  if (/\btenant_id\b/i.test(match[2] ?? ''))
    tenantTables.add((match[1] ?? '').toLowerCase());
}
const covered = new Set<string>();
const helper = /auth\.create_rls_policy\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/gi;
while ((match = helper.exec(sql)))
  covered.add(`${match[1]}.${match[2]}`.toLowerCase());
const missing = [...tenantTables].filter((table) => !covered.has(table)).sort();
if (missing.length > 0) {
  console.error('RLS DDL coverage violations:');
  missing.forEach((table) =>
    console.error(`- ${table}: no auth.create_rls_policy signal`),
  );
  process.exitCode = 1;
} else {
  console.log(`check-rls-ddl: OK (${tenantTables.size} tenant tables covered)`);
}
