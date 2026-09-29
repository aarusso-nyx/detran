# Delivery-review — hotfix de parâmetros SQL sem tipo, com varredura (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a818898ed2fcc39de` (branch
> `fix/untyped-sql-parameters-sweep`, base `origin/main`). Responda **apenas** com o JSON do §Saída.

Autorização: política permanente do Owner (R-0022 `AUTHORIZATION.md` Adenda B9, 2026-09-29): defeito
de produto em `main` → hotfix em PR próprio com varredura do repositório. Relatório do worker:
varredura por AST de 375 arquivos (`backend/**/src`, `packages/**/src`), 1.277 comandos com `$n`;
`PREPARE` de todos os estáticos e de 21 instâncias das variantes interpoladas sob `role_app_backend`;
5 defeitos confirmados (telehealth `conclude`, junta `designate` e `decide`, retenção `propose`,
ouvidoria `transition`: "could not determine data type" ou "inconsistent types deduced"); os 3
escritores de outbox do PR #162 ficaram fora. Prova: gate `verify:sql-param-types`
(`tools/check-sql-param-types.ts` + manifesto), primeiro passo de `backend:test:integration` no CI com
banco; 5/5 falham antes, 5/5 preparam depois. Um teste unitário existente
(`complaint-lifecycle.service.spec.ts`) fixava o texto do SQL com defeito e passou a fixar o texto
tipado. Resultados: testes unitários dos 4 pacotes verdes, `rls-smoke`, `typecheck`, `pec-parity`,
`verify:decorators`, `format:check`.

Rubrica: (1) cada cast usa o tipo real da coluna/contrato e não muda valor, payload ou semântica
(ex.: `case when $2::varchar = 'SECOND'`, `then $5::uuid`); (2) o gate é correto, fail-closed (sem
fallback de banco, recusa template interpolado/ambíguo) e roda no CI com banco; não entra no `check`
sem banco; (3) a mudança no teste existente é legítima (fixava o defeito) e não enfraquece asserção;
(4) a varredura é crível e completa para a classe declarada; (5) nada gerado editado; nada fora do
escopo.

## Diff (origin/main...HEAD)

```diff
diff --git a/backend/domains/ch/juntas/src/junta-lifecycle.service.ts b/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
index a5357086..60daf908 100644
--- a/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
+++ b/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
@@ -235,7 +235,7 @@ export class JuntaLifecycleService {
           (case_id, instance, designated_by, designated_at,
            designation_deadline_rule, designation_deadline_at, decision_deadline_at)
          values ($1, $2, $3, $4, $5, $6,
-                 case when $2 = 'SECOND' then $4::timestamptz + interval '30 days' else null end)
+                 case when $2::varchar = 'SECOND' then $4::timestamptz + interval '30 days' else null end)
          returning *`,
         [
           caseId,
@@ -404,7 +404,7 @@ export class JuntaLifecycleService {
       await tx.query(
         `update ch.junta_case
             set status = $2,
-                finalized_at = case when $2 in ('DECIDED','FINAL_DECIDED') then now() else null end,
+                finalized_at = case when $2::varchar in ('DECIDED','FINAL_DECIDED') then now() else null end,
                 updated_at = now()
           where id = $1`,
         [board.case_id, nextStatus],
diff --git a/backend/domains/ch/retention/src/retention-lifecycle.service.ts b/backend/domains/ch/retention/src/retention-lifecycle.service.ts
index 16d24aad..7fd6c04d 100644
--- a/backend/domains/ch/retention/src/retention-lifecycle.service.ts
+++ b/backend/domains/ch/retention/src/retention-lifecycle.service.ts
@@ -246,8 +246,8 @@ export class RetentionLifecycleService {
           (retention_case_id, destination, status, justification,
            proposed_by, proposed_at, return_offered_at, reviewed_by, reviewed_at)
          values ($1, $2, $3, $4, $5, now(), now(),
-                 case when $3 = 'BLOCKED' then $5 else null end,
-                 case when $3 = 'BLOCKED' then now() else null end)
+                 case when $3::varchar = 'BLOCKED' then $5::uuid else null end,
+                 case when $3::varchar = 'BLOCKED' then now() else null end)
          returning *`,
         [
           retentionCaseId,
diff --git a/backend/domains/ch/telehealth/src/telehealth-lifecycle.service.ts b/backend/domains/ch/telehealth/src/telehealth-lifecycle.service.ts
index 79921ac0..292ea0a7 100644
--- a/backend/domains/ch/telehealth/src/telehealth-lifecycle.service.ts
+++ b/backend/domains/ch/telehealth/src/telehealth-lifecycle.service.ts
@@ -124,7 +124,7 @@ export class TelehealthLifecycleService {
             (encounter_id, telehealth_session_id, item_kind, source,
              amount_cents, status, payload, created_by)
            values ($1, $2, 'TELEHEALTH', 'TELEHEALTH', 0, 'ISSUED',
-                   jsonb_build_object('sessionId', $2), $3)`,
+                   jsonb_build_object('sessionId', $2::uuid), $3)`,
           [session.encounter_id, session.id, actorId],
         );
         await tx.query(
diff --git a/backend/domains/portal/complaints/src/complaint-lifecycle.service.ts b/backend/domains/portal/complaints/src/complaint-lifecycle.service.ts
index a9bbcd08..891c7a68 100644
--- a/backend/domains/portal/complaints/src/complaint-lifecycle.service.ts
+++ b/backend/domains/portal/complaints/src/complaint-lifecycle.service.ts
@@ -88,8 +88,8 @@ export class ComplaintLifecycleService {
         `update portal.complaint
             set status = $2,
                 assigned_to = coalesce($3, assigned_to),
-                closed_by = case when $2 in ('CLOSED','REJECTED') then $4 else null end,
-                closed_at = case when $2 in ('CLOSED','REJECTED') then now() else null end,
+                closed_by = case when $2::varchar in ('CLOSED','REJECTED') then $4::uuid else null end,
+                closed_at = case when $2::varchar in ('CLOSED','REJECTED') then now() else null end,
                 payload = payload || $5::jsonb,
                 updated_at = now()
           where id = $1
diff --git a/backend/domains/portal/complaints/tests/unit/complaint-lifecycle.service.spec.ts b/backend/domains/portal/complaints/tests/unit/complaint-lifecycle.service.spec.ts
index e736d337..db7313f6 100644
--- a/backend/domains/portal/complaints/tests/unit/complaint-lifecycle.service.spec.ts
+++ b/backend/domains/portal/complaints/tests/unit/complaint-lifecycle.service.spec.ts
@@ -72,7 +72,7 @@ describe('ComplaintLifecycleService', () => {
       }),
     ).resolves.toEqual(closed);
     expect(query.mock.calls[0]?.[0]).toContain(
-      "case when $2 in ('CLOSED','REJECTED') then $4",
+      "case when $2::varchar in ('CLOSED','REJECTED') then $4::uuid",
     );
     expect(query.mock.calls[0]?.[1]).toEqual([
       'complaint-1',
diff --git a/package.json b/package.json
index 6fd48461..30112e02 100644
--- a/package.json
+++ b/package.json
@@ -29,6 +29,7 @@
     "verify:senatran-contracts": "pnpm --filter @detran/senatran-adapter contracts:check",
     "verify:pec-parity": "tsx tools/verify-pec-parity.ts",
     "verify:pec-superset": "tsx tools/verify-pec-superset.ts",
+    "verify:sql-param-types": "tsx tools/check-sql-param-types.ts",
     "verify:orchestra-bridge": "bash tools/orchestra/bridge.test.sh && bash tools/orchestra/worker.test.sh",
     "backend:db:apply": "bash backend/database/apply.sh",
     "backend:db:reset": "bash backend/database/apply.sh --full",
@@ -47,7 +48,7 @@
     "test:stack": "node --test tools/stack/*.test.mjs",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
     "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/est-crash test:unit && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/ops-provisioning test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit && pnpm --filter @detran/portal-identity test:unit && pnpm --filter @detran/portal-requests test:unit && pnpm --filter @detran/portal-inbox test:unit && pnpm --filter @detran/portal-citizen-service test:unit && pnpm --filter @detran/portal-projections test:unit && pnpm --filter @detran/dashboard-monitor test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
+    "backend:test:integration": "pnpm verify:sql-param-types && pnpm --filter @detran/app test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/ops-provisioning test:e2e && pnpm --filter @detran/inf-ait test:e2e && pnpm --filter @detran/portal-identity test:e2e && pnpm --filter @detran/portal-requests test:e2e && pnpm --filter @detran/portal-inbox test:e2e && pnpm --filter @detran/portal-citizen-service test:e2e && pnpm --filter @detran/portal-projections test:e2e && pnpm --filter @detran/dashboard-monitor test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
diff --git a/tools/README.md b/tools/README.md
index 365025bf..2037cc1c 100644
--- a/tools/README.md
+++ b/tools/README.md
@@ -15,6 +15,12 @@ Checks with their own entry below (the complete gate chain is the `check` script
 - `check-rls-ddl.ts` — static policy coverage for tables carrying `tenant_id`.
 - `check-rls-smoke.ts` — live cross-tenant denial, automatic tenant assignment
   and audit-chain persistence against the `detran` database.
+- `check-sql-param-types.ts` — `PREPARE` (under `role_app_backend`, rolled back)
+  of every SQL command listed in `sql-param-types.manifest.json`, extracted
+  literally from the service source; fails on `could not determine data type`
+  / `inconsistent types deduced` (untyped `pg` parameters). Needs
+  `DETRAN_TEST_DATABASE_URL` (no fallback), so it runs first in
+  `backend:test:integration`, not in `check`.
 - `verify-senatran-boundary.ts` — scans runtime source for direct national base
   URLs, SENATRAN auth headers and provider hosts outside
   `packages/senatran-adapter` (ADR-0003/ADR-0008).
@@ -51,6 +57,7 @@ Scripts of the root `package.json` that call `tools/`:
 | `stack:health`                | `bash tools/detran-stack.sh health`                                                                                                                                                      |
 | `test:stack`                  | `node --test tools/stack/*.test.mjs`                                                                                                                                                     |
 | `backend:rls-smoke`           | `tsx tools/check-rls-smoke.ts`                                                                                                                                                           |
+| `verify:sql-param-types`      | `tsx tools/check-sql-param-types.ts`                                                                                                                                                     |
 | `ci:backend-full`             | `bash tools/ci/run-backend-kernel.sh`                                                                                                                                                    |
 | `ci:backend-kernel:local`     | `node tools/ci/run-backend-kernel-local.mjs`                                                                                                                                             |
 | `devai:rc:prepare`            | `node tools/ci/prepare-local-rc.mjs`                                                                                                                                                     |
diff --git a/tools/check-sql-param-types.ts b/tools/check-sql-param-types.ts
new file mode 100644
index 00000000..b5d7f047
--- /dev/null
+++ b/tools/check-sql-param-types.ts
@@ -0,0 +1,143 @@
+// Gate: SQL parametrizado cujos parâmetros o PostgreSQL consegue tipar.
+//
+// O `pg` envia os parâmetros sem tipo (OID 0) no protocolo estendido; o
+// PostgreSQL deduz o tipo de cada `$n` pelo contexto. Quando um `$n` só aparece
+// em contexto que não determina tipo (`jsonb_build_object(…, $n)`,
+// `'literal' || $n`, `case when $n = 'X'` cujo tipo colide com o da coluna…),
+// o comando é recusado ao preparar (`could not determine data type of
+// parameter $n` / `inconsistent types deduced for parameter $n`) e a transação
+// inteira faz rollback. Testes unitários com transação dublê não enxergam isso.
+//
+// Este gate lê `tools/sql-param-types.manifest.json` (arquivo, método e um
+// trecho que identifica o comando), extrai o texto SQL literal do código-fonte
+// (sem valores) e faz `PREPARE` dele contra o banco de teste, sob
+// `role_app_backend`, dentro de transação com `rollback`. Qualquer falha de
+// preparo reprova o gate.
+//
+// Banco: `DETRAN_TEST_DATABASE_URL` (obrigatória; sem fallback). Não faz parte
+// de `pnpm check` (que roda sem banco); roda em `backend:test:integration`.
+import fs from 'node:fs';
+import path from 'node:path';
+
+import pg from 'pg';
+import ts from 'typescript';
+
+interface ManifestEntry {
+  file: string;
+  method: string;
+  contains: string;
+  reason: string;
+}
+
+interface Manifest {
+  role: string;
+  commands: ManifestEntry[];
+}
+
+const repoRoot = process.cwd();
+const manifestPath = path.join(repoRoot, 'tools/sql-param-types.manifest.json');
+const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
+const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
+if (!connectionString) {
+  console.error(
+    'verify:sql-param-types: DETRAN_TEST_DATABASE_URL is required (no fallback).',
+  );
+  process.exit(1);
+}
+if (!/^[a-z_][a-z0-9_]*$/.test(manifest.role)) {
+  console.error(`verify:sql-param-types: invalid role ${manifest.role}`);
+  process.exit(1);
+}
+
+function extractSql(entry: ManifestEntry): string {
+  const absolute = path.join(repoRoot, entry.file);
+  const text = fs.readFileSync(absolute, 'utf8');
+  const source = ts.createSourceFile(
+    absolute,
+    text,
+    ts.ScriptTarget.Latest,
+    true,
+  );
+  const bodies: ts.Node[] = [];
+  const findMethod = (node: ts.Node): void => {
+    if (
+      (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) &&
+      node.name &&
+      ts.isIdentifier(node.name) &&
+      node.name.text === entry.method &&
+      node.body
+    ) {
+      bodies.push(node.body);
+    }
+    ts.forEachChild(node, findMethod);
+  };
+  findMethod(source);
+  if (bodies.length !== 1) {
+    throw new Error(
+      `${entry.file}: expected one method ${entry.method}, found ${bodies.length}`,
+    );
+  }
+  const matches: string[] = [];
+  const dynamic: string[] = [];
+  const findSql = (node: ts.Node): void => {
+    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
+      if (node.text.includes(entry.contains)) matches.push(node.text);
+    } else if (ts.isTemplateExpression(node)) {
+      if (node.getText(source).includes(entry.contains))
+        dynamic.push(node.getText(source));
+    }
+    ts.forEachChild(node, findSql);
+  };
+  findSql(bodies[0]!);
+  if (dynamic.length) {
+    throw new Error(
+      `${entry.file}#${entry.method}: command "${entry.contains}" is an interpolated template; only literal SQL is supported`,
+    );
+  }
+  if (matches.length !== 1) {
+    throw new Error(
+      `${entry.file}#${entry.method}: expected one SQL literal containing "${entry.contains}", found ${matches.length}`,
+    );
+  }
+  return matches[0]!;
+}
+
+const client = new pg.Client({ connectionString });
+await client.connect();
+const failures: string[] = [];
+try {
+  for (const [index, entry] of manifest.commands.entries()) {
+    const label = `${entry.file}#${entry.method} (${entry.contains})`;
+    let sql: string;
+    try {
+      sql = extractSql(entry);
+    } catch (error) {
+      failures.push(`${label}: ${(error as Error).message}`);
+      continue;
+    }
+    await client.query('begin');
+    try {
+      await client.query(`set local role ${manifest.role}`);
+      await client.query(`prepare sql_param_types_${index} as ${sql}`);
+      console.log(`ok   ${label}`);
+    } catch (error) {
+      failures.push(`${label}: ${(error as Error).message}`);
+      console.log(`FAIL ${label}: ${(error as Error).message}`);
+    } finally {
+      await client.query('rollback');
+    }
+  }
+} finally {
+  await client.end();
+}
+
+if (failures.length) {
+  console.error(
+    `verify:sql-param-types: ${failures.length} of ${manifest.commands.length} command(s) failed to prepare:`,
+  );
+  for (const failure of failures) console.error(`- ${failure}`);
+  process.exit(1);
+}
+console.log(
+  `verify:sql-param-types: ${manifest.commands.length} command(s) prepared under ${manifest.role}.`,
+);
diff --git a/tools/sql-param-types.manifest.json b/tools/sql-param-types.manifest.json
new file mode 100644
index 00000000..52cce3dd
--- /dev/null
+++ b/tools/sql-param-types.manifest.json
@@ -0,0 +1,35 @@
+{
+  "role": "role_app_backend",
+  "commands": [
+    {
+      "file": "backend/domains/ch/telehealth/src/telehealth-lifecycle.service.ts",
+      "method": "conclude",
+      "contains": "insert into ch.billing_item",
+      "reason": "$2 dentro de jsonb_build_object (could not determine data type)"
+    },
+    {
+      "file": "backend/domains/ch/juntas/src/junta-lifecycle.service.ts",
+      "method": "designate",
+      "contains": "designation_deadline_rule, designation_deadline_at",
+      "reason": "$2 em case when $2 = 'SECOND' colide com a coluna varchar instance (inconsistent types deduced)"
+    },
+    {
+      "file": "backend/domains/ch/juntas/src/junta-lifecycle.service.ts",
+      "method": "decide",
+      "contains": "update ch.junta_case",
+      "reason": "$2 em case when $2 in (...) colide com a coluna varchar status (inconsistent types deduced)"
+    },
+    {
+      "file": "backend/domains/ch/retention/src/retention-lifecycle.service.ts",
+      "method": "propose",
+      "contains": "insert into ch.retention_disposition",
+      "reason": "$3/$5 em case when $3 = 'BLOCKED' then $5 colidem com as colunas varchar status e uuid proposed_by (inconsistent types deduced)"
+    },
+    {
+      "file": "backend/domains/portal/complaints/src/complaint-lifecycle.service.ts",
+      "method": "transition",
+      "contains": "update portal.complaint",
+      "reason": "$2/$4 em case when $2 in (...) then $4 colidem com as colunas varchar status e uuid closed_by (inconsistent types deduced)"
+    }
+  ]
+}
```

```json
{"mode":"delivery-review","scope":"hotfix-untyped-sql-parameters-sweep","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}
```
