import fs from 'node:fs';
import path from 'node:path';

/**
 * Tabelas com `tenant_id` isentas de `auth.create_rls_policy` POR DESENHO
 * (docs/framework/arch/portal-route-contract.md §11: `platform.public_hostname`
 * e `platform.tenant_brand_profile` → `portal.public_hostname` e
 * `portal.brand_profile`, "sem RLS, por desenho"; plan R-0009 M11): o Host é
 * resolvido antes de existir contexto de tenant e a marca é pública, lida sem
 * sessão. DDL manuscrito `backend/database/ddl/19-portal-platform.sql`. Nada
 * mais é isento — toda outra tabela com `tenant_id` continua exigindo a política.
 */
const RLS_EXEMPT_BY_DESIGN: ReadonlySet<string> = new Set([
  'portal.public_hostname',
  'portal.brand_profile',
]);

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
const missing = [...tenantTables]
  .filter((table) => !covered.has(table) && !RLS_EXEMPT_BY_DESIGN.has(table))
  .sort();
if (missing.length > 0) {
  console.error('RLS DDL coverage violations:');
  missing.forEach((table) =>
    console.error(`- ${table}: no auth.create_rls_policy signal`),
  );
  process.exitCode = 1;
} else {
  const exempt = [...tenantTables].filter((table) =>
    RLS_EXEMPT_BY_DESIGN.has(table),
  );
  console.log(
    `check-rls-ddl: OK (${tenantTables.size - exempt.length} tenant tables covered, ${exempt.length} exempt by design: ${exempt.sort().join(', ')})`,
  );
}
