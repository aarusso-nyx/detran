# Delivery-review — hotfix dos escritores de outbox clínicos (fora da R-0022; achado por R-0022 TASK-0014)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-ae6481d8224e44e92` (branch
> `fix/clinical-report-outbox-param-types`, base `origin/main`). Responda **apenas** com o JSON do §Saída.

Owner autorizou hotfix em PR próprio contra `main` (2026-09-29). Defeito, confirmado no PostgreSQL:
`INSERT into integration.outbox` de `ReportLifecycleService.create`, `persistSignedAddendum` e da
decisão de junta usa parâmetros sem tipo em `jsonb_build_object`/concatenação; o `pg` envia sem tipo e
`PREPARE` falha com `could not determine data type of parameter $1`, derrubando a transação inteira
(laudo, adendo, decisão de junta). Correção: tipar os parâmetros (`::text`, `::boolean`), sem mudar
colunas, valores, chaves nem contrato.

Rubrica: (1) a correção cobre todos os escritores defeituosos nos três arquivos inspecionados e não
muda o payload observável (tipos JSON: ids como string, `administrativeExhausted` booleano, `kind`,
`outcome`); (2) o teste de regressão prova o defeito (vermelho em `main`) e a correção com banco real,
sob `role_app_backend`, owner só em fixtures, com limpeza correta e isolamento A/B; (3) risco de
regressão em consumidores do payload (projeções, despacho RENACH); (4) nenhum arquivo gerado editado,
nenhum teste existente alterado; (5) outros escritores com o mesmo padrão no repositório que mereçam
registro (não é exigido corrigir aqui).

Relatório do worker: novo spec 4/4 (vermelho antes: 0/4); `ch-clinical-reports` unit 34/34;
`ch-juntas` 12/12; `backend:rls-smoke` OK; `typecheck` OK; `verify:pec-parity` 76/76; `format:check`
OK; `PREPARE` do comando exato dos três escritores falha antes e passa depois. Limite declarado: o
caminho público não exercita o `on conflict … do nothing`; juntas sem spec com banco.

## Diff (origin/main...HEAD)

```diff
diff --git a/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts b/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
index 1d24a4ee..9fdbae8f 100644
--- a/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
+++ b/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
@@ -187,9 +187,9 @@ export class ReportLifecycleService {
         `insert into integration.outbox
           (topic, aggregate_type, aggregate_id, payload,
            idempotency_key, status, available_at)
-         values ('ch.renach.exam-result', 'ch.report', $1,
-                 jsonb_build_object('reportId', $1, 'kind', $2),
-                 'ch.report:' || $1, 'pending', now())
+         values ('ch.renach.exam-result', 'ch.report', $1::text,
+                 jsonb_build_object('reportId', $1::text, 'kind', $2::text),
+                 'ch.report:' || $1::text, 'pending', now())
          on conflict (tenant_id, idempotency_key) do nothing`,
         [report.id, input.kind],
       );
@@ -498,9 +498,10 @@ export class ReportLifecycleService {
           `insert into integration.outbox
             (topic, aggregate_type, aggregate_id, payload,
              idempotency_key, status, available_at)
-           values ('ch.renach.exam-result', 'ch.report_addendum', $1,
-                   jsonb_build_object('reportId', $2, 'addendumId', $1, 'kind', $3),
-                   'ch.report-addendum:' || $1, 'pending', now())
+           values ('ch.renach.exam-result', 'ch.report_addendum', $1::text,
+                   jsonb_build_object('reportId', $2::text, 'addendumId', $1::text,
+                                      'kind', $3::text),
+                   'ch.report-addendum:' || $1::text, 'pending', now())
            on conflict (tenant_id, idempotency_key) do nothing`,
           [addendum.id, addendum.report_id, source.report_kind],
         );
diff --git a/backend/domains/ch/clinical-reports/tests/integration/report-outbox-writer.integration.spec.ts b/backend/domains/ch/clinical-reports/tests/integration/report-outbox-writer.integration.spec.ts
new file mode 100644
index 00000000..485ce5ca
--- /dev/null
+++ b/backend/domains/ch/clinical-reports/tests/integration/report-outbox-writer.integration.spec.ts
@@ -0,0 +1,310 @@
+// Hotfix (fora da rodada R-0022, Owner 2026-09-29, OD-R22-42): regressão do
+// escritor da outbox clínica. `ReportLifecycleService.create` e o caminho do
+// adendo (`signAddendum` → `persistSignedAddendum`) gravam em
+// `integration.outbox` com parâmetros usados dentro de `jsonb_build_object` e
+// de concatenação; sem tipo explícito o PostgreSQL recusa o comando no
+// protocolo estendido (`could not determine data type of parameter $1`). Os
+// testes unitários usam transação dublê e não pegam o defeito; aqui o SQL do
+// produto roda contra o PostgreSQL real, sob `role_app_backend` com
+// `app.tenant_id`/`app.actor_id` na transação, via `ReportRepository` real
+// (`withTenantContext`). O owner só prepara e limpa fixtures. A assinatura
+// PAdES é serviço HTTP externo e fica como dublê (recibo fixo).
+//
+// Banco: `DETRAN_TEST_DATABASE_URL` (slot descartável da rodada).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import type { ClinicalArtifactReceipt } from '../../src/pades-signing.http-adapter.js';
+import { ReportLifecycleService } from '../../src/report-lifecycle.service.js';
+import { ReportRepository } from '../../src/repositories/report.repository.js';
+
+const { Client } = pg;
+const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
+const tenantA = randomUUID();
+const tenantB = randomUUID();
+const actorA = randomUUID();
+const actorB = randomUUID();
+const requesterA = randomUUID();
+const approverA = randomUUID();
+const clinicId = randomUUID();
+const patientId = randomUUID();
+const encounterId = randomUUID();
+const professionalId = randomUUID();
+const stationId = randomUUID();
+const owner = new Client({ connectionString });
+const app = new Client({ connectionString });
+
+interface OutboxRow {
+  tenant_id: string;
+  topic: string;
+  aggregate_type: string;
+  aggregate_id: string;
+  payload: Record<string, unknown>;
+  idempotency_key: string;
+  status: string;
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  actorId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await app.query('begin');
+  try {
+    await app.query('set local role role_app_backend');
+    await app.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
+    await app.query("select set_config('app.actor_id', $1, true)", [actorId]);
+    const result = await work();
+    await app.query('commit');
+    return result;
+  } catch (error) {
+    await app.query('rollback');
+    throw error;
+  }
+}
+
+function receipt(): ClinicalArtifactReceipt {
+  return {
+    contentSha256: '',
+    storageDocumentId: randomUUID(),
+    artifactSha256: 'b'.repeat(64),
+    signatureLevel: 'QUALIFIED',
+    signatureFormat: 'PAdES-TSA',
+    signedAt: '2026-09-29T12:00:00.000Z',
+    tsaTime: '2026-09-29T12:00:01.000Z',
+    certificateValidationSource: 'OCSP',
+    certificateValidationStatus: 'GOOD',
+    certificateValidatedAt: '2026-09-29T12:00:02.000Z',
+  } as ClinicalArtifactReceipt;
+}
+
+function lifecycle(tenantId: string, actorId: string): ReportLifecycleService {
+  const database = {
+    tx: <T>(work: (transaction: unknown) => Promise<T>) =>
+      asTenant(tenantId, actorId, () => work({ query: app.query.bind(app) })),
+  };
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+  const repository = new ReportRepository(
+    database as never,
+    requestContext as never,
+  );
+  const signing = { renderAndSign: async () => receipt() };
+  return new ReportLifecycleService(
+    repository,
+    requestContext as never,
+    signing as never,
+  );
+}
+
+function outboxOf(aggregateId: string): Promise<OutboxRow[]> {
+  return owner
+    .query<OutboxRow>(
+      `select tenant_id, topic, aggregate_type, aggregate_id, payload,
+              idempotency_key, status
+         from integration.outbox where aggregate_id = $1`,
+      [aggregateId],
+    )
+    .then((result) => result.rows);
+}
+
+async function cleanup(): Promise<void> {
+  const tenants = [tenantA, tenantB];
+  for (const table of [
+    'integration.outbox',
+    'ch.registration_block_notice',
+    'ch.report_addendum',
+    'ch.report',
+    'ch.biometric_check',
+    'ch.medical_exam',
+    'ch.encounter',
+    'ch.professional',
+    'ch.biometric_station',
+    'ch.patient',
+    'ch.clinic',
+    'auth.users',
+  ]) {
+    await owner.query(
+      `delete from ${table} where tenant_id = any($1::uuid[])`,
+      [tenants],
+    );
+  }
+  await owner.query('delete from auth.tenants where id = any($1::uuid[])', [
+    tenants,
+  ]);
+}
+
+beforeAll(async () => {
+  if (!connectionString)
+    throw new Error('DETRAN_TEST_DATABASE_URL is required');
+  await Promise.all([owner.connect(), app.connect()]);
+  await owner.query("select set_config('app.role', 'owner', false)");
+  for (const tenantId of [tenantA, tenantB]) {
+    await owner.query(
+      'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
+      [tenantId, `ch-outbox-${tenantId}`, `CH outbox ${tenantId}`],
+    );
+  }
+  for (const [userId, tenantId] of [
+    [actorA, tenantA],
+    [requesterA, tenantA],
+    [approverA, tenantA],
+    [actorB, tenantB],
+  ] as const) {
+    await owner.query(
+      "insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'CH outbox actor')",
+      [userId, tenantId, `${userId}@detran.invalid`],
+    );
+  }
+  await owner.query(
+    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
+     values ($1, $2, 'CH-OUTBOX', '00000000000191', 'Clínica outbox', 'R1')`,
+    [clinicId, tenantA],
+  );
+  await owner.query(
+    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
+     values ($1, $2, $3, '00000000191', 'Paciente outbox')`,
+    [patientId, tenantA, clinicId],
+  );
+  await owner.query(
+    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
+     values ($1, $2, $3, $4, 'IN_PROGRESS')`,
+    [encounterId, tenantA, clinicId, patientId],
+  );
+  await owner.query(
+    `insert into ch.professional
+       (id, tenant_id, clinic_id, user_id, person_name, professional_kind,
+        council_type, council_number, council_state)
+     values ($1, $2, $3, $4, 'Médica outbox', 'MEDICO', 'CRM', '12345', 'SP')`,
+    [professionalId, tenantA, clinicId, actorA],
+  );
+  await owner.query(
+    `insert into ch.medical_exam
+       (tenant_id, encounter_id, professional_id, statutory_valid_until,
+        valid_until, data, result)
+     values ($1, $2, $3, current_date + 365, current_date + 365,
+             '{}'::jsonb, 'APTO')`,
+    [tenantA, encounterId, professionalId],
+  );
+  await owner.query(
+    `insert into ch.biometric_station
+       (id, tenant_id, clinic_id, name, fingerprint_hash, provider_code,
+        device_certificate_fingerprint)
+     values ($1, $2, $3, 'Estação outbox', 'f', 'P', 'd')`,
+    [stationId, tenantA, clinicId],
+  );
+  await owner.query(
+    `insert into ch.biometric_check
+       (tenant_id, encounter_id, clinic_id, station_id,
+        subject_professional_id, kind, modality, passed,
+        evidence_document_id, evidence_sha256, created_by)
+     values ($1, $2, $3, $4, $5, 'MEDICAL', 'FINGERPRINT', true,
+             $6, $7, $8)`,
+    [
+      tenantA,
+      encounterId,
+      clinicId,
+      stationId,
+      professionalId,
+      randomUUID(),
+      'c'.repeat(64),
+      actorA,
+    ],
+  );
+});
+
+afterAll(async () => {
+  try {
+    await cleanup();
+  } finally {
+    await Promise.all([owner.end(), app.end()]);
+  }
+});
+
+describe('Hotfix OD-R22-42 — escritor clínico da outbox RENACH no PostgreSQL real', () => {
+  let reportId = '';
+
+  it('dado laudo assinável quando create sob role_app_backend então grava exatamente um ch.renach.exam-result no tenant da transação', async () => {
+    const report = await lifecycle(tenantA, actorA).create({
+      encounterId,
+      kind: 'MEDICAL',
+      templateVersion: 'hotfix-outbox-1',
+    });
+    reportId = report.id;
+
+    expect(await outboxOf(reportId)).toEqual([
+      {
+        tenant_id: tenantA,
+        topic: 'ch.renach.exam-result',
+        aggregate_type: 'ch.report',
+        aggregate_id: reportId,
+        payload: { reportId, kind: 'MEDICAL' },
+        idempotency_key: `ch.report:${reportId}`,
+        status: 'pending',
+      },
+    ]);
+  });
+
+  it('dado laudo já emitido quando create é repetido então devolve o mesmo laudo e não duplica o item da outbox', async () => {
+    const again = await lifecycle(tenantA, actorA).create({
+      encounterId,
+      kind: 'MEDICAL',
+      templateVersion: 'hotfix-outbox-1',
+    });
+
+    expect(again.id).toBe(reportId);
+    expect(await outboxOf(reportId)).toHaveLength(1);
+  });
+
+  it('dado adendo aprovado com resultado quando signAddendum então grava um ch.renach.exam-result do adendo e a repetição não duplica', async () => {
+    const addendumId = randomUUID();
+    await owner.query(
+      `insert into ch.report_addendum
+         (id, tenant_id, report_id, reason, content, content_sha256, status,
+          requested_by, approved_by, approved_at)
+       values ($1, $2, $3, 'Retificação', '{"result":"APTO"}'::jsonb, $4,
+               'APPROVED', $5, $6, now())`,
+      [addendumId, tenantA, reportId, 'd'.repeat(64), requesterA, approverA],
+    );
+    const service = lifecycle(tenantA, actorA);
+
+    const signed = await service.signAddendum(addendumId);
+    expect(signed.status).toBe('SIGNED');
+    await expect(service.signAddendum(addendumId)).rejects.toThrow(
+      'Addendum is not approved',
+    );
+
+    expect(await outboxOf(addendumId)).toEqual([
+      {
+        tenant_id: tenantA,
+        topic: 'ch.renach.exam-result',
+        aggregate_type: 'ch.report_addendum',
+        aggregate_id: addendumId,
+        payload: { reportId, addendumId, kind: 'MEDICAL' },
+        idempotency_key: `ch.report-addendum:${addendumId}`,
+        status: 'pending',
+      },
+    ]);
+  });
+
+  it('dado itens gravados no tenant A quando o caminho app do tenant B consulta então não os alcança', async () => {
+    const foreign = await asTenant(tenantB, actorB, () =>
+      app.query(
+        "select id from integration.outbox where topic = 'ch.renach.exam-result' and aggregate_id = $1",
+        [reportId],
+      ),
+    );
+    expect(foreign.rows).toEqual([]);
+
+    const own = await asTenant(tenantA, actorA, () =>
+      app.query(
+        "select id from integration.outbox where topic = 'ch.renach.exam-result' and aggregate_id = $1",
+        [reportId],
+      ),
+    );
+    expect(own.rows).toHaveLength(1);
+  });
+});
diff --git a/backend/domains/ch/juntas/src/junta-lifecycle.service.ts b/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
index a5357086..81978ff7 100644
--- a/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
+++ b/backend/domains/ch/juntas/src/junta-lifecycle.service.ts
@@ -419,19 +419,20 @@ export class JuntaLifecycleService {
       await tx.query(
         `insert into integration.outbox
           (topic, aggregate_type, aggregate_id, payload, idempotency_key, status, available_at)
-         values ('ch.renach.junta-decision', 'ch.junta_decision', $1,
-                 jsonb_build_object('decisionId', $1, 'caseId', $2, 'outcome', $3,
-                                    'administrativeExhausted', $4,
+         values ('ch.renach.junta-decision', 'ch.junta_decision', $1::text,
+                 jsonb_build_object('decisionId', $1::text, 'caseId', $2::text,
+                                    'outcome', $3::text,
+                                    'administrativeExhausted', $4::boolean,
                                     'remainingAppeal',
                                     case
-                                      when $5 = 'SECOND' and $3 = 'UPHELD'
+                                      when $5::text = 'SECOND' and $3::text = 'UPHELD'
                                       then jsonb_build_object(
                                         'instance', 'SPECIAL',
                                         'designatingAuthority', 'CETRAN',
                                         'filingDeadlineRule', '30_CALENDAR_DAYS')
                                       else null
                                     end),
-                 'ch.junta-decision:' || $1, 'pending', now())`,
+                 'ch.junta-decision:' || $1::text, 'pending', now())`,
         [
           decision.id,
           board.case_id,
```

## Saída (JSON, e nada mais)

```json
{"mode":"delivery-review","scope":"hotfix-clinical-outbox-param-types","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}
```
