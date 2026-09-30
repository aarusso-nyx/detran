// Gate: SQL parametrizado cujos parâmetros o PostgreSQL consegue tipar.
//
// O `pg` envia os parâmetros sem tipo (OID 0) no protocolo estendido; o
// PostgreSQL deduz o tipo de cada `$n` pelo contexto. Quando um `$n` só aparece
// em contexto que não determina tipo (`jsonb_build_object(…, $n)`,
// `'literal' || $n`, `case when $n = 'X'` cujo tipo colide com o da coluna…),
// o comando é recusado ao preparar (`could not determine data type of
// parameter $n` / `inconsistent types deduced for parameter $n`) e a transação
// inteira faz rollback. Testes unitários com transação dublê não enxergam isso.
//
// Este gate lê `tools/sql-param-types.manifest.json` (arquivo, método e um
// trecho que identifica o comando), extrai o texto SQL literal do código-fonte
// (sem valores) e faz `PREPARE` dele contra o banco de teste, sob
// `role_app_backend`, dentro de transação com `rollback`. Qualquer falha de
// preparo reprova o gate.
//
// Banco: `DETRAN_TEST_DATABASE_URL` (obrigatória; sem fallback). Não faz parte
// de `pnpm check` (que roda sem banco); roda em `backend:test:integration`.
import fs from 'node:fs';
import path from 'node:path';

import pg from 'pg';
import ts from 'typescript';

interface ManifestEntry {
  file: string;
  method: string;
  contains: string;
  reason: string;
}

interface Manifest {
  role: string;
  commands: ManifestEntry[];
}

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'tools/sql-param-types.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
if (!connectionString) {
  console.error(
    'verify:sql-param-types: DETRAN_TEST_DATABASE_URL is required (no fallback).',
  );
  process.exit(1);
}
if (!/^[a-z_][a-z0-9_]*$/.test(manifest.role)) {
  console.error(`verify:sql-param-types: invalid role ${manifest.role}`);
  process.exit(1);
}

function extractSql(entry: ManifestEntry): string {
  const absolute = path.join(repoRoot, entry.file);
  const text = fs.readFileSync(absolute, 'utf8');
  const source = ts.createSourceFile(
    absolute,
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const bodies: ts.Node[] = [];
  const findMethod = (node: ts.Node): void => {
    if (
      (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === entry.method &&
      node.body
    ) {
      bodies.push(node.body);
    }
    ts.forEachChild(node, findMethod);
  };
  findMethod(source);
  if (bodies.length !== 1) {
    throw new Error(
      `${entry.file}: expected one method ${entry.method}, found ${bodies.length}`,
    );
  }
  const matches: string[] = [];
  const dynamic: string[] = [];
  const findSql = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text.includes(entry.contains)) matches.push(node.text);
    } else if (ts.isTemplateExpression(node)) {
      if (node.getText(source).includes(entry.contains))
        dynamic.push(node.getText(source));
    }
    ts.forEachChild(node, findSql);
  };
  findSql(bodies[0]!);
  if (dynamic.length) {
    throw new Error(
      `${entry.file}#${entry.method}: command "${entry.contains}" is an interpolated template; only literal SQL is supported`,
    );
  }
  if (matches.length !== 1) {
    throw new Error(
      `${entry.file}#${entry.method}: expected one SQL literal containing "${entry.contains}", found ${matches.length}`,
    );
  }
  return matches[0]!;
}

const client = new pg.Client({ connectionString });
await client.connect();
const failures: string[] = [];
try {
  for (const [index, entry] of manifest.commands.entries()) {
    const label = `${entry.file}#${entry.method} (${entry.contains})`;
    let sql: string;
    try {
      sql = extractSql(entry);
    } catch (error) {
      failures.push(`${label}: ${(error as Error).message}`);
      continue;
    }
    await client.query('begin');
    try {
      await client.query(`set local role ${manifest.role}`);
      await client.query(`prepare sql_param_types_${index} as ${sql}`);
      console.log(`ok   ${label}`);
    } catch (error) {
      failures.push(`${label}: ${(error as Error).message}`);
      console.log(`FAIL ${label}: ${(error as Error).message}`);
    } finally {
      await client.query('rollback');
    }
  }
} finally {
  await client.end();
}

if (failures.length) {
  console.error(
    `verify:sql-param-types: ${failures.length} of ${manifest.commands.length} command(s) failed to prepare:`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `verify:sql-param-types: ${manifest.commands.length} command(s) prepared under ${manifest.role}.`,
);
