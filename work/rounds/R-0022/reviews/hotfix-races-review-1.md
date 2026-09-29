# Delivery-review — hotfix de corridas "checa e depois grava" (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-adf590fcc0c00ecc6` (branch
> `fix/check-then-write-races`, base `origin/main`). Responda **apenas** com o JSON do §Saída.

Política permanente do Owner (R-0022 `AUTHORIZATION.md` Adenda B9). Defeitos (varredura em READ
COMMITTED) corrigidos: versões duplicadas de `ops.parameter` (advisory lock por série); alertas
duplicados do DASHBOARD entre instâncias (advisory lock por tenant+indicador+objeto); checagens de estado
sem bloqueio em medidas, alcoolemia e AIT (`for update` no agregado pai); billing (lock por atendimento
em pagamento e criação de item — inclui uma variante insegura achada pelo worker); laudos MEDICAL‖PSYCH
(`for no key update` no atendimento). Parado para o Owner: chave RENACH entre pacientes (fontes
contraditórias; OD-HF-B9-001 aberta no registro). Provas: 7 specs de integração (12 testes) com
duas conexões `role_app_backend`, intercalação com commit real em banco clone descartável
(`race-harness.ts` copiado em cada pacote — omitido do diff abaixo, mas presente na worktree); vermelhas
antes, verdes depois. Um teste unitário existente de laudos mudou de índice (mesmo conteúdo, + checagem
da nova trava). `ch-billing test:integration` incluído em `backend:test:integration`. Resultados: unit e
integração dos pacotes, e2e do app 1684 verdes, `rls-smoke`, `verify:rls-ddl`, `typecheck`,
`verify:decorators`, `pec-parity`, `docs:kb:check`, `format:check`.

Rubrica: (1) cada trava tem o escopo exato do invariante, ordem consistente, sem deadlock novo
relevante (atenção: sweeper do DASHBOARD com várias travas por transação; `for no key update` × FKs);
(2) nenhuma mudança de rota, status, envelope ou código; mensagens 409/412 existentes; (3) provas
determinísticas e seguras no CI (banco clone por `CREATE DATABASE … TEMPLATE`; exclusividade do
template; todos os tiers envolvidos estão em `backend:test:integration`?); (4) a mudança no teste
unitário existente é legítima; (5) o registro de OD-HF-B9-001 e o item parado estão corretos; (6)
duplicação de `race-harness.ts` em 7 pacotes — aceitável num hotfix?

## Diff (origin/main...HEAD, sem os `race-harness.ts`)

```diff
diff --git a/backend/domains/ch/billing/src/billing-lifecycle.service.ts b/backend/domains/ch/billing/src/billing-lifecycle.service.ts
index 4045e28f..65d82098 100644
--- a/backend/domains/ch/billing/src/billing-lifecycle.service.ts
+++ b/backend/domains/ch/billing/src/billing-lifecycle.service.ts
@@ -166,6 +166,14 @@ export class BillingLifecycleService {
       const item = result.rows[0];
       if (!item) throw new Error('Billing item insert returned no row');
       if (item.encounter_id) {
+        // Mesma trava de `validatePayment`: o pagamento do último item não
+        // resolve o FINANCIAL sem ver este item novo, e este insert vê a
+        // resolução já commitada (o índice parcial é só dos ativos).
+        await tx.query(
+          `select pg_advisory_xact_lock(hashtextextended(
+             auth.current_tenant()::text || ':billing-encounter:' || $1, 0))`,
+          [item.encounter_id],
+        );
         await tx.query(
           `insert into ch.process_block
             (encounter_id, block_kind, source_system, message, active, created_by)
@@ -218,6 +226,14 @@ export class BillingLifecycleService {
         [itemId, referenceNumber.trim()],
       );
       if (item.encounter_id) {
+        // Pagamentos do mesmo atendimento em série: o `not exists` abaixo
+        // roda num snapshot novo depois da espera e vê os itens que a outra
+        // transação acabou de pagar (senão o FINANCIAL fica ativo).
+        await tx.query(
+          `select pg_advisory_xact_lock(hashtextextended(
+             auth.current_tenant()::text || ':billing-encounter:' || $1, 0))`,
+          [item.encounter_id],
+        );
         await tx.query(
           `update ch.process_block block
               set active = false, resolved_by = $2, resolved_at = now(), updated_at = now()
diff --git a/backend/domains/ch/billing/tests/integration/billing-payment-race.integration.spec.ts b/backend/domains/ch/billing/tests/integration/billing-payment-race.integration.spec.ts
new file mode 100644
index 00000000..c6efcf95
--- /dev/null
+++ b/backend/domains/ch/billing/tests/integration/billing-payment-race.integration.spec.ts
@@ -0,0 +1,160 @@
+// Prova de concorrência de `validatePayment` (hotfix B9, defeito 5): o
+// bloqueio FINANCIAL do atendimento só sai quando nenhum outro item está
+// pendente, mas cada transação checa os outros itens no próprio snapshot.
+// Dois itens pagos ao mesmo tempo: T1 paga e fica aberta; T2 paga; T1
+// commita. Com os dois itens pagos, o bloqueio FINANCIAL não pode ficar ativo.
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import { BillingLifecycleService } from '../../src/billing-lifecycle.service.js';
+import { BillingItemRepository } from '../../src/repositories/billing-item.repository.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+const tenantId = randomUUID();
+const actorId = randomUUID();
+const clinicId = randomUUID();
+const patientId = randomUUID();
+
+function billing(session: RaceSession, hold?: () => Promise<void>) {
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+  return new BillingLifecycleService(
+    new BillingItemRepository(
+      session.database(tenantId, actorId, hold) as never,
+      requestContext as never,
+    ),
+    requestContext as never,
+  );
+}
+
+/** Atendimento com `items` itens ISSUED e o bloqueio FINANCIAL ativo. */
+async function seedEncounter(items: number) {
+  const encounterId = randomUUID();
+  await owner.query(
+    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
+     values ($1, $2, $3, $4, 'IN_PROGRESS')`,
+    [encounterId, tenantId, clinicId, patientId],
+  );
+  const itemIds: string[] = [];
+  for (let index = 0; index < items; index += 1) {
+    const itemId = randomUUID();
+    itemIds.push(itemId);
+    await owner.query(
+      `insert into ch.billing_item
+         (id, tenant_id, encounter_id, item_kind, amount_cents, created_by)
+       values ($1, $2, $3, 'PROTOCOL', 100, $4)`,
+      [itemId, tenantId, encounterId, actorId],
+    );
+  }
+  await owner.query(
+    `insert into ch.process_block
+       (tenant_id, encounter_id, block_kind, source_system, message, active,
+        created_by)
+     values ($1, $2, 'FINANCIAL', 'BILLING', 'Financial validation pending',
+             true, $3)`,
+    [tenantId, encounterId, actorId],
+  );
+  return { encounterId, itemIds };
+}
+
+async function activeFinancialBlocks(encounterId: string): Promise<number> {
+  const active = await owner.query<{ count: number }>(
+    `select count(*)::int as count from ch.process_block
+      where encounter_id = $1 and block_kind = 'FINANCIAL' and active`,
+    [encounterId],
+  );
+  return active.rows[0]!.count;
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  // Fixtures (owner, só no clone).
+  await owner.query(`select set_config('app.role', 'owner', false)`);
+  await owner.query(
+    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
+    [tenantId, `billing-race-${tenantId.slice(0, 8)}`, 'Billing race'],
+  );
+  await owner.query(
+    `insert into auth.users (id, tenant_id, email, display_name)
+     values ($1, $2, $3, 'Billing race')`,
+    [actorId, tenantId, `${actorId}@detran.invalid`],
+  );
+  await owner.query(
+    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
+     values ($1, $2, 'BILL-RACE', '00000000000191', 'Clínica prova', 'R1')`,
+    [clinicId, tenantId],
+  );
+  await owner.query(
+    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
+     values ($1, $2, $3, '00000000191', 'Paciente prova')`,
+    [patientId, tenantId, clinicId],
+  );
+  first = await RaceSession.open(clone.url, 'race-billing-t1');
+  second = await RaceSession.open(clone.url, 'race-billing-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('faturamento: pagamento concorrente dos itens do atendimento', () => {
+  it('dado dois itens ISSUED com bloqueio FINANCIAL quando os dois são pagos em paralelo então o bloqueio FINANCIAL é resolvido', async () => {
+    const { encounterId, itemIds } = await seedEncounter(2);
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) =>
+        billing(first, hold).validatePayment(itemIds[0]!, 'PAY-A', 100),
+      runSecond: () =>
+        billing(second).validatePayment(itemIds[1]!, 'PAY-B', 100),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      outcome.second.status,
+      JSON.stringify(summarize(outcome.second)),
+    ).toBe('fulfilled');
+    expect(await activeFinancialBlocks(encounterId)).toBe(0);
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+
+  it('dado um item ISSUED com bloqueio FINANCIAL quando um item novo é criado enquanto o último é pago então o bloqueio FINANCIAL continua ativo', async () => {
+    const { encounterId, itemIds } = await seedEncounter(1);
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) =>
+        billing(first, hold).createItem({
+          encounterId,
+          itemKind: 'PROTOCOL',
+          amountCents: 100,
+        }),
+      runSecond: () =>
+        billing(second).validatePayment(itemIds[0]!, 'PAY-LAST', 100),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      outcome.second.status,
+      JSON.stringify(summarize(outcome.second)),
+    ).toBe('fulfilled');
+    expect(await activeFinancialBlocks(encounterId)).toBe(1);
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts b/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
index 9fdbae8f..b2d27ffe 100644
--- a/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
+++ b/backend/domains/ch/clinical-reports/src/report-lifecycle.service.ts
@@ -417,6 +417,15 @@ export class ReportLifecycleService {
     tx: SqlTransaction,
     encounterId: string,
   ): Promise<void> {
+    // Trava a linha antes de recalcular: o `update` seguinte roda num
+    // snapshot novo e vê o laudo da outra trilha commitado durante a espera
+    // (no mesmo statement, a reavaliação do READ COMMITTED não reexecuta os
+    // subselects). `no key update` não conflita com a `key share` das FKs
+    // que os inserts de laudo já tomaram.
+    await tx.query(
+      'select id from ch.encounter where id = $1 for no key update',
+      [encounterId],
+    );
     await tx.query(
       `update ch.encounter encounter
           set status = case
diff --git a/backend/domains/ch/clinical-reports/tests/integration/report-signature-race.integration.spec.ts b/backend/domains/ch/clinical-reports/tests/integration/report-signature-race.integration.spec.ts
new file mode 100644
index 00000000..1db2b252
--- /dev/null
+++ b/backend/domains/ch/clinical-reports/tests/integration/report-signature-race.integration.spec.ts
@@ -0,0 +1,211 @@
+// Prova de concorrência de `refreshEncounterSignatureStatus` (hotfix B9,
+// defeito 5): laudos MEDICAL e PSYCH assinados juntos. T1 assina o MEDICAL e
+// fica aberta; T2 assina o PSYCH; T1 commita. Com os dois laudos gravados, o
+// atendimento tem de terminar SIGNED, não READY_FOR_SIGNATURE. A assinatura
+// PAdES é serviço HTTP externo e fica como dublê (recibo fixo).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import type { ClinicalArtifactReceipt } from '../../src/pades-signing.http-adapter.js';
+import { ReportLifecycleService } from '../../src/report-lifecycle.service.js';
+import { ReportRepository } from '../../src/repositories/report.repository.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+const tenantId = randomUUID();
+const medicalActor = randomUUID();
+const psychActor = randomUUID();
+const clinicId = randomUUID();
+const patientId = randomUUID();
+const encounterId = randomUUID();
+const medicalProfessional = randomUUID();
+const psychProfessional = randomUUID();
+const instrumentId = randomUUID();
+const stationId = randomUUID();
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
+/** `create` abre três transações (preflight, laudo existente, gravação); só
+ * a terceira — a que grava o laudo e o status — fica aberta. */
+function sign(
+  session: RaceSession,
+  actorId: string,
+  kind: 'MEDICAL' | 'PSYCH',
+  hold?: () => Promise<void>,
+) {
+  let calls = 0;
+  const plain = session.database(tenantId, actorId);
+  const held = session.database(tenantId, actorId, hold);
+  const database = {
+    tx: <T>(work: (tx: never) => Promise<T>) =>
+      ((calls += 1) === 3 && hold ? held : plain).tx(
+        work as never,
+      ) as Promise<T>,
+  };
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+  return new ReportLifecycleService(
+    new ReportRepository(database as never, requestContext as never),
+    requestContext as never,
+    { renderAndSign: async () => receipt() } as never,
+  ).create({ encounterId, kind, templateVersion: 'race-1' });
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  // Fixtures (owner, só no clone).
+  await owner.query(`select set_config('app.role', 'owner', false)`);
+  await owner.query(
+    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
+    [tenantId, `report-race-${tenantId.slice(0, 8)}`, 'Report race'],
+  );
+  for (const userId of [medicalActor, psychActor]) {
+    await owner.query(
+      `insert into auth.users (id, tenant_id, email, display_name)
+       values ($1, $2, $3, 'Report race')`,
+      [userId, tenantId, `${userId}@detran.invalid`],
+    );
+  }
+  await owner.query(
+    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
+     values ($1, $2, 'REPORT-RACE', '00000000000191', 'Clínica prova', 'R1')`,
+    [clinicId, tenantId],
+  );
+  await owner.query(
+    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
+     values ($1, $2, $3, '00000000191', 'Paciente prova')`,
+    [patientId, tenantId, clinicId],
+  );
+  await owner.query(
+    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
+     values ($1, $2, $3, $4, 'IN_PROGRESS')`,
+    [encounterId, tenantId, clinicId, patientId],
+  );
+  await owner.query(
+    `insert into ch.professional
+       (id, tenant_id, clinic_id, user_id, person_name, professional_kind,
+        council_type, council_number, council_state)
+     values ($1, $2, $3, $4, 'Médica prova', 'MEDICO', 'CRM', '12345', 'AM'),
+            ($5, $2, $3, $6, 'Psicóloga prova', 'PSICOLOGO', 'CRP', '54321', 'AM')`,
+    [
+      medicalProfessional,
+      tenantId,
+      clinicId,
+      medicalActor,
+      psychProfessional,
+      psychActor,
+    ],
+  );
+  await owner.query(
+    `insert into ch.medical_exam
+       (tenant_id, encounter_id, professional_id, statutory_valid_until,
+        valid_until, data, result)
+     values ($1, $2, $3, current_date + 365, current_date + 365,
+             '{}'::jsonb, 'APTO')`,
+    [tenantId, encounterId, medicalProfessional],
+  );
+  await owner.query(
+    `insert into ch.psych_instrument
+       (id, tenant_id, code, name, version, satepsi_status, valid_from,
+        source_reference)
+     values ($1, $2, 'RACE', 'Instrumento prova', '1', 'FAVORABLE',
+             '2026-01-01', 'SATEPSI prova')`,
+    [instrumentId, tenantId],
+  );
+  await owner.query(
+    `insert into ch.psychological_exam
+       (tenant_id, encounter_id, professional_id, instrument_id, data, result)
+     values ($1, $2, $3, $4, '{}'::jsonb, 'APTO')`,
+    [tenantId, encounterId, psychProfessional, instrumentId],
+  );
+  await owner.query(
+    `insert into ch.biometric_station
+       (id, tenant_id, clinic_id, name, fingerprint_hash, provider_code,
+        device_certificate_fingerprint)
+     values ($1, $2, $3, 'Estação prova', 'f', 'P', 'd')`,
+    [stationId, tenantId, clinicId],
+  );
+  for (const [kind, professionalId, actorId] of [
+    ['MEDICAL', medicalProfessional, medicalActor],
+    ['PSYCH', psychProfessional, psychActor],
+  ] as const) {
+    await owner.query(
+      `insert into ch.biometric_check
+         (tenant_id, encounter_id, clinic_id, station_id,
+          subject_professional_id, kind, modality, passed,
+          evidence_document_id, evidence_sha256, created_by)
+       values ($1, $2, $3, $4, $5, $6, 'FINGERPRINT', true, $7, $8, $9)`,
+      [
+        tenantId,
+        encounterId,
+        clinicId,
+        stationId,
+        professionalId,
+        kind,
+        randomUUID(),
+        'c'.repeat(64),
+        actorId,
+      ],
+    );
+  }
+  first = await RaceSession.open(clone.url, 'race-report-t1');
+  second = await RaceSession.open(clone.url, 'race-report-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('laudos: assinatura concorrente das duas trilhas', () => {
+  it('dado atendimento com exame médico e psicológico quando os dois laudos são assinados em paralelo então o atendimento fica SIGNED', async () => {
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => sign(first, medicalActor, 'MEDICAL', hold),
+      runSecond: () => sign(second, psychActor, 'PSYCH'),
+    });
+    expect(outcome.first.status, JSON.stringify(summarize(outcome.first))).toBe(
+      'fulfilled',
+    );
+    expect(
+      outcome.second.status,
+      JSON.stringify(summarize(outcome.second)),
+    ).toBe('fulfilled');
+    const encounter = await owner.query<{ status: string }>(
+      'select status from ch.encounter where id = $1',
+      [encounterId],
+    );
+    expect(encounter.rows[0]!.status).toBe('SIGNED');
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts b/backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts
index e3fc1dfe..e1fb5668 100644
--- a/backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts
+++ b/backend/domains/ch/clinical-reports/tests/unit/report-lifecycle.service.spec.ts
@@ -170,7 +170,10 @@ describe('ReportLifecycleService', () => {
     );
     expect(query.mock.calls[3]?.[0]).toContain('integration.outbox');
     expect(query.mock.calls[3]?.[1]).toEqual(['report-1', 'MEDICAL']);
-    const statusSql = query.mock.calls[4]?.[0] as string;
+    // Hotfix B9: a linha do atendimento é travada antes do recálculo.
+    expect(query.mock.calls[4]?.[0]).toContain('for no key update');
+    expect(query.mock.calls[4]?.[1]).toEqual(['encounter-1']);
+    const statusSql = query.mock.calls[5]?.[0] as string;
     expect(statusSql).toContain('not exists');
     expect(statusSql).toContain("else 'READY_FOR_SIGNATURE'");
     expect(statusSql).not.toContain("set status = 'SIGNED'");
diff --git a/backend/domains/dashboard/monitor/src/handwritten/cycle/alert.service.ts b/backend/domains/dashboard/monitor/src/handwritten/cycle/alert.service.ts
index cfb6ad12..9596b2cb 100644
--- a/backend/domains/dashboard/monitor/src/handwritten/cycle/alert.service.ts
+++ b/backend/domains/dashboard/monitor/src/handwritten/cycle/alert.service.ts
@@ -387,6 +387,14 @@ export class DashboardAlertService {
       return { kind: 'ignored', reason: 'disconnected' };
 
     // (2) dedupe por chave (tenant, indicator_code, object_kind, object_ref)
+    // — serializado entre instâncias do sweeper/runner: sem a trava, duas
+    // transações leem "sem alerta aberto" e ambas inserem.
+    await query(
+      tx,
+      `select pg_advisory_xact_lock(hashtextextended(
+         'dashboard.alert:' || $1 || ':' || $2 || ':' || $3 || ':' || $4, 0))`,
+      [ctx.tenantId, cell.indicatorCode, cell.objectKind, cell.objectRef],
+    );
     const transitions = await loadAlertTransitions(tx);
     const latest = await this.latestAlertForKey(tx, ctx.tenantId, cell);
     const open =
diff --git a/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts b/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts
new file mode 100644
index 00000000..f6b64b73
--- /dev/null
+++ b/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts
@@ -0,0 +1,120 @@
+// Prova de concorrência do detector (hotfix B9, defeito 2): o sweeper roda
+// por instância, sem trava entre instâncias. Duas "instâncias" = duas
+// conexões `role_app_backend` rodando `DashboardAlertService.detect` sobre o
+// mesmo indicador/objeto. T1 detecta e fica aberta; T2 começa; T1 commita.
+// O dedupe por chave (tenant, indicator_code, object_kind, object_ref, §6.2)
+// exige um único alerta aberto — T2 tem de ver o alerta de T1.
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import type { DetectionCell } from '../../src/handwritten/cycle/index.js';
+import { FIXTURE_TENANT_ID, USERS } from '../fixtures/cycle-fixtures.js';
+import {
+  buildCycle,
+  ctxFor,
+  type CycleDb,
+  type CycleServices,
+} from '../support/cycle-harness.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+const NOW = new Date('2026-09-21T12:00:00.000Z');
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+let services: CycleServices;
+
+function cell(objectRef: string): DetectionCell {
+  return {
+    projection: 'dashboard.prescription_risk',
+    indicatorCode: 'IND-DASH-101',
+    sourceApp: 'rait',
+    objectKind: 'case',
+    objectRef,
+    objectLayer: 'N2',
+    level: 'N1',
+    governingClock: 'A',
+    ceilingOn: '2027-03-09',
+    nextMilestoneAt: new Date('2026-12-09T12:00:00.000Z'),
+    occurredAt: NOW,
+  };
+}
+
+function detect(
+  session: RaceSession,
+  objectRef: string,
+  hold?: () => Promise<void>,
+) {
+  return session
+    .database(FIXTURE_TENANT_ID, USERS.integrationOperator, hold)
+    .tx((tx) =>
+      services.alerts.detect(
+        tx as never,
+        cell(objectRef),
+        ctxFor('system', NOW),
+      ),
+    );
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  await owner.query(`select set_config('app.role', 'owner', false)`);
+  // Fixture (owner, só no clone): indicador conectado, como o detector
+  // integration faz com `forceConnected`.
+  await owner.query(
+    `update dashboard.indicator set connected = true
+      where tenant_id = $1 and code = 'IND-DASH-101'`,
+    [FIXTURE_TENANT_ID],
+  );
+  services = buildCycle({ client: owner } as unknown as CycleDb, '2026-09-21');
+  first = await RaceSession.open(clone.url, 'race-detector-t1');
+  second = await RaceSession.open(clone.url, 'race-detector-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('detector em duas instâncias (checa e depois grava)', () => {
+  it('dado célula N1 sem alerta quando duas instâncias rodam detect concorrentes então só um alerta é criado para a chave', async () => {
+    const objectRef = randomUUID();
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => detect(first, objectRef, hold),
+      runSecond: () => detect(second, objectRef),
+    });
+    expect(outcome.first).toMatchObject({
+      status: 'fulfilled',
+      value: { kind: 'detected' },
+    });
+    const alerts = await owner.query<{ id: string }>(
+      `select id from dashboard.alert
+        where tenant_id = $1 and indicator_code = 'IND-DASH-101'
+          and object_kind = 'case' and object_ref = $2`,
+      [FIXTURE_TENANT_ID, objectRef],
+    );
+    expect(alerts.rows).toHaveLength(1);
+    expect(
+      outcome.second,
+      JSON.stringify(summarize(outcome.second)),
+    ).toMatchObject({
+      status: 'fulfilled',
+      value: { kind: 'ignored', reason: 'open_alert' },
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/inf/ait/src/ait-lifecycle.service.ts b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
index 8aa3efb4..3e764624 100644
--- a/backend/domains/inf/ait/src/ait-lifecycle.service.ts
+++ b/backend/domains/inf/ait/src/ait-lifecycle.service.ts
@@ -618,7 +618,7 @@ export class AitLifecycleService {
   accept(id: string, actorId?: string): Promise<Ait> {
     // TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake.
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.repositories.ait.findOne(id, tx);
+      const ait = await this.findAitForUpdate(id, tx);
       this.assertNotConcurrencyPending(ait);
       this.assertAllowed(ait, ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'], 'accept');
       const accepted = await this.transition(
@@ -694,7 +694,7 @@ export class AitLifecycleService {
         ? actorIdOrLegacyFlag
         : legacyActorId;
     return this.repositories.ait.transaction(async (tx) => {
-      const ait = await this.repositories.ait.findOne(id, tx);
+      const ait = await this.findAitForUpdate(id, tx);
       this.assertNotConcurrencyPending(ait);
       this.assertAllowed(
         ait,
@@ -903,7 +903,7 @@ export class AitLifecycleService {
 
       let ait: Ait | undefined;
       if (dto.targetAitId) {
-        ait = await this.repositories.ait.findOne(dto.targetAitId, tx);
+        ait = await this.findAitForUpdate(dto.targetAitId, tx);
         // §13 item 7: the alleged origin must match the AIT's real state.
         if (dto.originStatus !== ait.current_status) {
           throw new DetranError('TEAT.AIT_STATE_INVALID', {
@@ -984,7 +984,7 @@ export class AitLifecycleService {
     actorId?: string,
   ): Promise<{ id: string; status: string; version: number }> {
     return this.repositories.ait.transaction(async (tx) => {
-      const request = await this.getCancelRequestRow(id, tx);
+      const request = await this.getCancelRequestRow(id, tx, true);
       if (request.status === 'approved' || request.status === 'denied') {
         throw new DetranError('TEAT.AIT_CANCEL_ALREADY_DECIDED', {
           status: 409,
@@ -1034,7 +1034,7 @@ export class AitLifecycleService {
     options: DecideCancelRequestOptions = {},
   ): Promise<DecideCancelRequestResult> {
     return this.repositories.ait.transaction(async (tx) => {
-      const request = await this.getCancelRequestRow(id, tx);
+      const request = await this.getCancelRequestRow(id, tx, true);
 
       // §13 item 3: a `decision_body` that disagrees with the stored
       // `addressed_to` is rejected before any effect, independent of the
@@ -1099,7 +1099,7 @@ export class AitLifecycleService {
 
       let ait: Ait | undefined;
       if (request.ait_id) {
-        ait = await this.repositories.ait.findOne(request.ait_id, tx);
+        ait = await this.findAitForUpdate(request.ait_id, tx);
         // §13 item 4: with `ait_id` present, the AIT must still be in the
         // state the request put it in (draft never moved it; post_final did).
         const allowed: AitStatus[] =
@@ -1297,11 +1297,25 @@ export class AitLifecycleService {
     tx: Transaction,
     command: string,
   ): Promise<Ait> {
-    const ait = await this.repositories.ait.findOne(id, tx);
+    const ait = await this.findAitForUpdate(id, tx);
     this.assertAllowed(ait, allowed, command);
     return ait;
   }
 
+  /** Leitura do AIT para comando: `for update` antes da checagem de estado,
+   * para que a transição e o filho gravados depois dela não repitam a de
+   * uma transação concorrente (READ COMMITTED). */
+  private async findAitForUpdate(id: string, tx: Transaction): Promise<Ait> {
+    const queryable = asQueryable(tx);
+    if (queryable) {
+      await queryable.query(
+        'select id from inf.ait_ait where id = $1 for update',
+        [id],
+      );
+    }
+    return this.repositories.ait.findOne(id, tx);
+  }
+
   private assertAllowed(ait: Ait, allowed: AitStatus[], command: string): void {
     if (!allowed.includes(ait.current_status as AitStatus)) {
       throw new DetranError('TEAT.AIT_STATE_INVALID', {
@@ -1510,7 +1524,17 @@ export class AitLifecycleService {
   private async getCancelRequestRow(
     id: string,
     tx: Transaction,
+    forUpdate = false,
   ): Promise<AitCancelRequestRow> {
+    // `review`/`decide`: a linha fica bloqueada até o fim do comando, para
+    // que duas decisões concorrentes não passem ambas por `requested`.
+    const lockable = forUpdate ? asQueryable(tx) : undefined;
+    if (lockable) {
+      await lockable.query(
+        'select id from inf.ait_cancel_request where id = $1 for update',
+        [id],
+      );
+    }
     if (this.collaborators.cancelRequests) {
       return this.collaborators.cancelRequests.findOne(id, tx);
     }
diff --git a/backend/domains/inf/ait/tests/integration/ait-race.integration.spec.ts b/backend/domains/inf/ait/tests/integration/ait-race.integration.spec.ts
new file mode 100644
index 00000000..6ca5205a
--- /dev/null
+++ b/backend/domains/inf/ait/tests/integration/ait-race.integration.spec.ts
@@ -0,0 +1,252 @@
+// Prova de concorrência do ciclo de vida do AIT (hotfix B9, defeito 4):
+// `requestCancel` (`createCancelRequest`), as transições por `requireStatus`
+// e a decisão de cancelamento leem o estado com select simples e depois
+// gravam filho + novo estado. T1 conclui e fica aberta; T2 começa; T1
+// commita; T2 tem de ver o estado de T1 (409), nunca repetir a transição.
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+import {
+  MobileNormativePackageRepository,
+  NormativeCatalogRepository,
+  NormativeFramingRepository,
+  NormativeLifecycleService,
+} from '@detran/inf-normative';
+
+import { AitLifecycleService } from '../../src/ait-lifecycle.service.js';
+import { AitCorrectionRepository } from '../../src/repositories/ait-correction.repository.js';
+import { AitPersonRepository } from '../../src/repositories/ait-person.repository.js';
+import { AitPrintEventRepository } from '../../src/repositories/ait-print-event.repository.js';
+import { AitSignatureRepository } from '../../src/repositories/ait-signature.repository.js';
+import { AitStatusHistoryRepository } from '../../src/repositories/ait-status-history.repository.js';
+import { AitVehicleRepository } from '../../src/repositories/ait-vehicle.repository.js';
+import { AitRepository } from '../../src/repositories/ait.repository.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+let tenantId: string;
+let actorId: string;
+let normative: NormativeLifecycleService;
+let catalogId: string;
+let framingId: string;
+
+function context() {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+function lifecycle(session: RaceSession, hold?: () => Promise<void>) {
+  const db = session.database(tenantId, actorId, hold);
+  const ctx = context();
+  return new AitLifecycleService(
+    {
+      ait: new AitRepository(db as never, ctx as never),
+      vehicles: new AitVehicleRepository(db as never, ctx as never),
+      people: new AitPersonRepository(db as never, ctx as never),
+      history: new AitStatusHistoryRepository(db as never, ctx as never),
+      corrections: new AitCorrectionRepository(db as never, ctx as never),
+      signatures: new AitSignatureRepository(db as never, ctx as never),
+      printEvents: new AitPrintEventRepository(db as never, ctx as never),
+    },
+    normative,
+  );
+}
+
+async function finalizedAit(): Promise<string> {
+  const service = lifecycle(first);
+  const draft = await service.createDraft({
+    traffic_agency_id: tenantId,
+    ait_number: randomUUID().replace(/\D/g, '').slice(0, 6).padEnd(6, '0'),
+    series: randomUUID().slice(0, 4),
+    agent_id: randomUUID(),
+    shift_id: randomUUID(),
+    device_id: randomUUID(),
+    framing_id: framingId,
+    catalog_id: catalogId,
+    infraction_at: '2026-09-10T10:00:00.000Z',
+    issued_at: '2026-09-10T10:01:00.000Z',
+    issuance_mode: 'online',
+    constatation_type: 'approach',
+    location_description: 'Av. Brasil',
+    uf: 'AM',
+  } as never);
+  await service.finalize(draft.id, actorId);
+  return draft.id;
+}
+
+function requestPostFinalCancel(
+  session: RaceSession,
+  aitId: string,
+  hold?: () => Promise<void>,
+) {
+  return lifecycle(session, hold).createCancelRequest({
+    entityType: 'ait-cancel-posfinal-request',
+    trafficAgencyId: tenantId,
+    idempotencyKey: randomUUID(),
+    targetLocalActId: `local-${aitId}`,
+    targetAitId: aitId,
+    originStatus: 'FINALIZADO_LOCAL',
+    justification: 'prova de concorrência',
+    requestedBy: actorId,
+  });
+}
+
+async function countOf(sql: string, value: string): Promise<number> {
+  const result = await owner.query<{ count: number }>(sql, [value]);
+  return result.rows[0]!.count;
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  tenantId = randomUUID();
+  actorId = randomUUID();
+  // Fixture (owner, só no clone): tenant e ator isolados.
+  await owner.query(`select set_config('app.role', 'owner', false)`);
+  await owner.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [tenantId, `ait-race-${tenantId.slice(0, 8)}`, 'AIT race'],
+  );
+  await owner.query(
+    `insert into auth.users (id, tenant_id, email, display_name)
+     values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  first = await RaceSession.open(clone.url, 'race-ait-t1');
+  second = await RaceSession.open(clone.url, 'race-ait-t2');
+  const db = first.database(tenantId, actorId);
+  const ctx = context();
+  const catalogs = new NormativeCatalogRepository(db as never, ctx as never);
+  const framings = new NormativeFramingRepository(db as never, ctx as never);
+  const packages = new MobileNormativePackageRepository(
+    db as never,
+    ctx as never,
+  );
+  normative = new NormativeLifecycleService(catalogs, framings, packages);
+  const catalog = await catalogs.create({
+    traffic_agency_id: tenantId,
+    name: 'CTB',
+    catalog_type: 'traffic-code',
+    version: '2026.race',
+    valid_from: '2026-01-01',
+    status: 'active',
+  } as never);
+  const framing = await framings.create({
+    catalog_id: catalog.id,
+    framing_code: '74550',
+    approach_class: 'caso_2',
+    description: 'Infraction framing',
+    status: 'active',
+  } as never);
+  catalogId = catalog.id;
+  framingId = framing.id;
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('AIT: checa estado e depois grava', () => {
+  it('dado AIT FINALIZADO_LOCAL quando dois pedidos de cancelamento pós-final concorrem então só um pedido é gravado e o outro recebe 409', async () => {
+    const aitId = await finalizedAit();
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => requestPostFinalCancel(first, aitId, hold),
+      runSecond: () => requestPostFinalCancel(second, aitId),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      await countOf(
+        `select count(*)::int as count from inf.ait_cancel_request
+          where ait_id = $1`,
+        aitId,
+      ),
+    ).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.AIT_STATE_INVALID',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+
+  it('dado AIT FINALIZADO_LOCAL quando duas transições queue-transmission concorrem então só uma transição é gravada e o outro recebe 409', async () => {
+    const aitId = await finalizedAit();
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) =>
+        lifecycle(first, hold).queueTransmission(aitId, actorId),
+      runSecond: () => lifecycle(second).queueTransmission(aitId, actorId),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      await countOf(
+        `select count(*)::int as count from inf.ait_status_history
+          where ait_id = $1 and status = 'ENFILEIRADO'`,
+        aitId,
+      ),
+    ).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.AIT_STATE_INVALID',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+
+  it('dado pedido de cancelamento requested quando duas decisões concorrem então só uma decisão é gravada e a outra recebe 409', async () => {
+    const request = await lifecycle(first).createCancelRequest({
+      entityType: 'ait-cancel-request',
+      trafficAgencyId: tenantId,
+      idempotencyKey: randomUUID(),
+      targetLocalActId: `local-${randomUUID()}`,
+      originStatus: 'RASCUNHO_OFFLINE',
+      justification: 'prova de concorrência',
+      requestedBy: actorId,
+    });
+    const decide = (session: RaceSession, hold?: () => Promise<void>) =>
+      lifecycle(session, hold).decideCancelRequest(
+        request.id,
+        'approve',
+        'deferido',
+        actorId,
+      );
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => decide(first, hold),
+      runSecond: () => decide(second),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      await countOf(
+        `select count(*)::int as count from inf.ait_cancel_request_event
+          where cancel_request_id = $1 and event_type = 'approved'`,
+        request.id,
+      ),
+    ).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts b/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts
index 3b6968c8..5ed03b3e 100644
--- a/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts
@@ -134,6 +134,29 @@ export async function findRow(
   return result.rows[0];
 }
 
+/**
+ * Leitura do procedimento pai com `for update`: a checagem de estado e a
+ * escrita que dela depende ficam na mesma linha bloqueada (sem ela, dois
+ * comandos concorrentes em READ COMMITTED passam na mesma checagem).
+ */
+export async function lockRow(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+  id: string,
+): Promise<AlcoholRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function' || typeof store?.findOne === 'function')
+    return findRow(deps, tx, table, id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${ALCOHOL_TABLES[table]} where id = $1 for update`,
+    [id],
+  );
+  return result.rows[0];
+}
+
 export async function findRowsWhere(
   deps: AlcoholDeps,
   tx: unknown,
diff --git a/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts
index fcfe8990..5dfbda46 100644
--- a/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts
@@ -3,7 +3,7 @@ import { DetranError } from '@detran/shared';
 
 import {
   assertAlcoholAllowed,
-  findRow,
+  lockRow,
   findRowsWhere,
   inTenantTransaction,
   numberOf,
@@ -43,7 +43,7 @@ export class CloseProcedureCommand {
     input: CloseAlcoholProcedureInput = {},
   ): Promise<Record<string, unknown>> {
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       const currentState = assertAlcoholAllowed(
         procedure,
diff --git a/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts
index 9e9f167b..285f9a2e 100644
--- a/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts
@@ -5,7 +5,7 @@ import { DetranError } from '@detran/shared';
 
 import {
   assertAlcoholAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   patchRow,
@@ -65,7 +65,7 @@ export class ForwardProcedureCommand {
       });
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       const currentState = assertAlcoholAllowed(
         procedure,
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts
index ec510f8b..47f6ec85 100644
--- a/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts
@@ -6,7 +6,7 @@ import { alcoholRefusalRegisteredEvent } from './events.js';
 import {
   appendEvent,
   assertAlcoholAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   patchRow,
@@ -50,7 +50,7 @@ export class RecordRefusalCommand {
       });
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-refusal');
 
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts
index 84e4dac2..09b1ab30 100644
--- a/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts
@@ -4,7 +4,7 @@ import { DetranError } from '@detran/shared';
 
 import {
   assertAlcoholAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   patchRow,
@@ -65,7 +65,7 @@ export class RecordSignsCommand {
       });
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       const currentState = assertAlcoholAllowed(
         procedure,
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
index 75e14195..5fb2e601 100644
--- a/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
@@ -8,6 +8,7 @@ import {
   appendEvent,
   assertAlcoholAllowed,
   findRow,
+  lockRow,
   findRowsWhere,
   inTenantTransaction,
   insertRow,
@@ -57,7 +58,7 @@ export class RecordTestCommand {
     const testedAt = input.tested_at ?? scope.occurredAt;
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-test');
 
diff --git a/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts
index c422f8ce..e3279e71 100644
--- a/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts
+++ b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts
@@ -1,7 +1,7 @@
 // CTG-0004 §5.1 (R-0008, TASK-0009) — `POST procedures/{id}/start`.
 import {
   assertAlcoholAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   patchRow,
   scopeOf,
@@ -28,7 +28,7 @@ export class StartProcedureCommand {
   ): Promise<Record<string, unknown>> {
     scopeOf(this.deps);
     return inTenantTransaction(this.deps, async (tx) => {
-      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
       if (!procedure) throw tenantMismatch({ procedureId });
       assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'start');
 
diff --git a/backend/domains/inf/alcohol/tests/integration/alcohol-race.integration.spec.ts b/backend/domains/inf/alcohol/tests/integration/alcohol-race.integration.spec.ts
new file mode 100644
index 00000000..1767883a
--- /dev/null
+++ b/backend/domains/inf/alcohol/tests/integration/alcohol-race.integration.spec.ts
@@ -0,0 +1,99 @@
+// Prova de concorrência dos comandos de alcoolemia (hotfix B9, defeito 4):
+// o estado do procedimento é lido com select simples e depois se grava o
+// filho e o novo estado. T1 conclui e fica aberta; T2 começa; T1 commita;
+// T2 tem de ver o estado de T1 (409 `TEAT.ALCOHOL_STATE_INVALID`).
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  RecordRefusalCommand,
+  type AlcoholDeps,
+} from '../../src/handwritten/index.js';
+import { FIXTURES, seedTriagemProcedure } from './harness.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+
+function deps(session: RaceSession, hold?: () => Promise<void>): AlcoholDeps {
+  return {
+    database: session.database(
+      FIXTURES.tenantId,
+      FIXTURES.actorId,
+      hold,
+    ) as never,
+    requestContext: {
+      hasActiveContext: () => true,
+      snapshot: () =>
+        ({ tenantId: FIXTURES.tenantId, actorId: FIXTURES.actorId }) as never,
+    },
+    repositories: {},
+    outbox: { append: async () => ({ id: 'ignored' }) } as never,
+    clock: { now: () => new Date().toISOString() },
+  };
+}
+
+function refuse(
+  session: RaceSession,
+  procedureId: string,
+  hold?: () => Promise<void>,
+) {
+  return new RecordRefusalCommand(deps(session, hold)).execute(procedureId, {
+    kind: 'refusal',
+    refusal_description: 'prova de concorrência',
+  });
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  first = await RaceSession.open(clone.url, 'race-alcohol-t1');
+  second = await RaceSession.open(clone.url, 'race-alcohol-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('procedimento de alcoolemia: checa estado e depois grava', () => {
+  it('dado procedimento TRIAGEM quando duas recusas concorrem então só uma recusa é gravada', async () => {
+    const { procedureId } = await seedTriagemProcedure(
+      owner,
+      FIXTURES.tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => refuse(first, procedureId, hold),
+      runSecond: () => refuse(second, procedureId),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    const refusals = await owner.query<{ count: number }>(
+      `select count(*)::int as count from inf.alcohol_refusal
+        where procedure_id = $1`,
+      [procedureId],
+    );
+    expect(refusals.rows[0]!.count).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.ALCOHOL_STATE_INVALID',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts
index b42e6073..d9ce328c 100644
--- a/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts
@@ -5,7 +5,7 @@
 // contract §6) e responde sempre 409 `TEAT.MEASURE_STATE_INVALID` com
 // `allowed: []` — nenhum estado admite `cancel`. `source_pending` (OD-T37).
 import {
-  findRow,
+  lockRow,
   inTenantTransaction,
   measureStateInvalid,
   stringOf,
@@ -24,7 +24,7 @@ export class CancelMeasureCommand {
 
   async execute(measureId: string, _input: CancelMeasureInput): Promise<never> {
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       const currentState = stringOf(measure.current_status);
       throw measureStateInvalid(measureId, currentState, [], 'cancel');
diff --git a/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts
index 2537e530..de5a7ce4 100644
--- a/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts
@@ -3,7 +3,7 @@ import { measureConcludedEvent } from './events.js';
 import {
   appendEvent,
   assertMeasureAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   patchRow,
   recordHistory,
@@ -32,7 +32,7 @@ export class ConcludeMeasureCommand {
   ): Promise<Record<string, unknown>> {
     const scope = scopeOf(this.deps);
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       const currentState = assertMeasureAllowed(
         measure,
diff --git a/backend/domains/inf/measures/src/handwritten/issue-term.command.ts b/backend/domains/inf/measures/src/handwritten/issue-term.command.ts
index dd2b6a23..7054e458 100644
--- a/backend/domains/inf/measures/src/handwritten/issue-term.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/issue-term.command.ts
@@ -9,7 +9,7 @@ import { TERM_REMOVAL_REQUIRED_KEYS, missingKeys } from './term-content.js';
 import {
   appendEvent,
   assertMeasureAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   recordHistory,
@@ -89,7 +89,7 @@ export class IssueTermCommand {
     }
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       const currentState = assertMeasureAllowed(
         measure,
diff --git a/backend/domains/inf/measures/src/handwritten/measure-runtime.ts b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
index 6a35d8a4..b94a9fb6 100644
--- a/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
+++ b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
@@ -168,6 +168,29 @@ export async function findRow(
   return result.rows[0];
 }
 
+/**
+ * Leitura do agregado pai com `for update`: a checagem de estado e a escrita
+ * que dela depende ficam na mesma linha bloqueada (sem ela, dois comandos
+ * concorrentes em READ COMMITTED passam na mesma checagem).
+ */
+export async function lockRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  id: string,
+): Promise<MeasureRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function' || typeof store?.findOne === 'function')
+    return findRow(deps, tx, table, id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${MEASURE_TABLES[table]} where id = $1 for update`,
+    [id],
+  );
+  return result.rows[0];
+}
+
 export async function findRowsWhere(
   deps: MeasureDeps,
   tx: unknown,
diff --git a/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts b/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts
index 5cef16a9..2d65a6fc 100644
--- a/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts
@@ -5,7 +5,7 @@ import { DetranError } from '@detran/shared';
 import { INVENTORY_REQUIRED_KEYS, missingKeys } from './term-content.js';
 import {
   assertMeasureAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   recordHistory,
@@ -51,7 +51,7 @@ export class RecordInventoryCommand {
       });
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       const currentState = assertMeasureAllowed(
         measure,
diff --git a/backend/domains/inf/measures/src/handwritten/record-removal.command.ts b/backend/domains/inf/measures/src/handwritten/record-removal.command.ts
index 9d87ab29..af665789 100644
--- a/backend/domains/inf/measures/src/handwritten/record-removal.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/record-removal.command.ts
@@ -5,6 +5,7 @@ import { DetranError } from '@detran/shared';
 import {
   assertMeasureAllowed,
   findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   patchRow,
@@ -68,7 +69,7 @@ export class RecordRemovalCommand {
     }
 
     return inTenantTransaction(this.deps, async (tx) => {
-      let measure = await findRow(this.deps, tx, 'measures', measureId);
+      let measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       let currentState = assertMeasureAllowed(
         measure,
diff --git a/backend/domains/inf/measures/src/handwritten/record-retention.command.ts b/backend/domains/inf/measures/src/handwritten/record-retention.command.ts
index 26c43527..4703a9fe 100644
--- a/backend/domains/inf/measures/src/handwritten/record-retention.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/record-retention.command.ts
@@ -4,7 +4,7 @@ import { DetranError } from '@detran/shared';
 
 import {
   assertMeasureAllowed,
-  findRow,
+  lockRow,
   inTenantTransaction,
   insertRow,
   recordHistory,
@@ -58,7 +58,7 @@ export class RecordRetentionCommand {
     }
 
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       assertMeasureAllowed(measure, measureId, ALLOWED, 'register-retention');
 
diff --git a/backend/domains/inf/measures/src/handwritten/release-retention.command.ts b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
index aa059ab7..8e8f2522 100644
--- a/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
@@ -19,6 +19,7 @@ import { measureConcludedEvent, measureReleasedEvent } from './events.js';
 import {
   appendEvent,
   findRow,
+  lockRow,
   inTenantTransaction,
   measureStateInvalid,
   patchRow,
@@ -59,7 +60,7 @@ export class ReleaseRetentionCommand {
       const retention = await findRow(this.deps, tx, 'retentions', retentionId);
       if (!retention) throw tenantMismatch({ retentionId });
       const measureId = stringOf(retention.measure_id);
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
 
       const currentState = stringOf(measure.current_status);
diff --git a/backend/domains/inf/measures/src/handwritten/start-measure.command.ts b/backend/domains/inf/measures/src/handwritten/start-measure.command.ts
index 9165b0b9..b7964cab 100644
--- a/backend/domains/inf/measures/src/handwritten/start-measure.command.ts
+++ b/backend/domains/inf/measures/src/handwritten/start-measure.command.ts
@@ -9,6 +9,7 @@ import {
   appendEvent,
   assertMeasureAllowed,
   findRow,
+  lockRow,
   inTenantTransaction,
   patchRow,
   recordHistory,
@@ -41,7 +42,7 @@ export class StartMeasureCommand {
   ): Promise<StartMeasureResult> {
     const scope = scopeOf(this.deps);
     return inTenantTransaction(this.deps, async (tx) => {
-      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      const measure = await lockRow(this.deps, tx, 'measures', measureId);
       if (!measure) throw tenantMismatch({ measureId });
       const currentState = assertMeasureAllowed(
         measure,
diff --git a/backend/domains/inf/measures/tests/integration/measure-race.integration.spec.ts b/backend/domains/inf/measures/tests/integration/measure-race.integration.spec.ts
new file mode 100644
index 00000000..a33c86fc
--- /dev/null
+++ b/backend/domains/inf/measures/tests/integration/measure-race.integration.spec.ts
@@ -0,0 +1,140 @@
+// Prova de concorrência dos comandos de medida (hotfix B9, defeito 4): o
+// estado da medida é lido e depois se grava o filho e/ou o novo estado. Sem
+// bloqueio na leitura do pai, dois comandos concorrentes passam na mesma
+// checagem de estado. T1 conclui e fica aberta; T2 começa; T1 commita; T2
+// tem de ver o estado de T1 (409 `TEAT.MEASURE_STATE_INVALID`).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  RecordRetentionCommand,
+  ReleaseRetentionCommand,
+  type MeasureDeps,
+} from '../../src/handwritten/index.js';
+import { FIXTURES, seedMeasureWithRetention } from './harness.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+
+function deps(session: RaceSession, hold?: () => Promise<void>): MeasureDeps {
+  return {
+    database: session.database(
+      FIXTURES.tenantId,
+      FIXTURES.actorId,
+      hold,
+    ) as never,
+    requestContext: {
+      hasActiveContext: () => true,
+      snapshot: () =>
+        ({ tenantId: FIXTURES.tenantId, actorId: FIXTURES.actorId }) as never,
+    },
+    repositories: {},
+    deadlines: {
+      computeMeasureDue: async (_code, startOn) => ({
+        rawDueOn: startOn,
+        dueOn: startOn,
+      }),
+    },
+    featureFlags: { isEnabled: () => false },
+    outbox: { append: async () => ({ id: randomUUID() }) } as never,
+    clock: { now: () => new Date().toISOString() },
+  };
+}
+
+async function seed() {
+  return seedMeasureWithRetention(
+    owner,
+    FIXTURES.tenantId,
+    FIXTURES.agencyId,
+    FIXTURES.actorId,
+    FIXTURES.shiftId,
+    FIXTURES.deviceId,
+    FIXTURES.vehicleSnapshotId,
+    { currentStatus: 'RETIDO' },
+  );
+}
+
+async function countOf(table: string, measureId: string, extra = '') {
+  const result = await owner.query<{ count: number }>(
+    `select count(*)::int as count from ${table}
+      where measure_id = $1 ${extra}`,
+    [measureId],
+  );
+  return result.rows[0]!.count;
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  first = await RaceSession.open(clone.url, 'race-measure-t1');
+  second = await RaceSession.open(clone.url, 'race-measure-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('medida administrativa: checa estado e depois grava', () => {
+  it('dado medida RETIDO quando release e register-retention concorrem então a retenção nova não é gravada sobre a medida já liberada', async () => {
+    const { measureId, retentionId } = await seed();
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) =>
+        new ReleaseRetentionCommand(deps(first, hold)).execute(retentionId),
+      runSecond: () =>
+        new RecordRetentionCommand(deps(second)).execute(measureId, {
+          vehicle_snapshot_id: FIXTURES.vehicleSnapshotId,
+          retention_reason: 'prova de concorrência',
+        }),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(await countOf('inf.measure_retention', measureId)).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.MEASURE_STATE_INVALID',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+
+  it('dado medida RETIDO quando dois release concorrem então só uma transição LIBERADO_LOCAL é gravada', async () => {
+    const { measureId, retentionId } = await seed();
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) =>
+        new ReleaseRetentionCommand(deps(first, hold)).execute(retentionId),
+      runSecond: () =>
+        new ReleaseRetentionCommand(deps(second)).execute(retentionId),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(
+      await countOf(
+        'inf.measure_status_history',
+        measureId,
+        `and status = 'LIBERADO_LOCAL'`,
+      ),
+    ).toBe(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'TEAT.MEASURE_STATE_INVALID',
+      httpStatus: 409,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/backend/domains/ops/parameter/src/handwritten/parameter.service.ts b/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
index 0b667d96..fa4e0a62 100644
--- a/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
+++ b/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
@@ -273,6 +273,15 @@ export class OpsParameterService {
         throw new OpsParameterError('RAIT.PARAMETER_LEGAL_READONLY', 422, {
           key,
         });
+      // Serializa os PUT da mesma série (tenant+chave+superfície+escopo+
+      // órgão): sem linha anterior não há o que `for update` bloquear, e o
+      // `limit 1` sob READ COMMITTED relê a versão antiga depois da espera.
+      await queryTx.query(
+        `select pg_advisory_xact_lock(hashtextextended(
+           'ops.parameter:' || current_setting('app.tenant_id') || ':' || $1
+             || ':' || $2 || ':' || $3 || ':' || coalesce($4::text, ''), 0))`,
+        [key, surface, targetScope, targetAgency],
+      );
       const currentResult = await queryTx.query(
         `select * from ops.parameter
           where tenant_id = current_setting('app.tenant_id')::uuid
diff --git a/backend/domains/ops/parameter/tests/integration/parameter-put-race.integration.spec.ts b/backend/domains/ops/parameter/tests/integration/parameter-put-race.integration.spec.ts
new file mode 100644
index 00000000..a1dce531
--- /dev/null
+++ b/backend/domains/ops/parameter/tests/integration/parameter-put-race.integration.spec.ts
@@ -0,0 +1,136 @@
+// Prova de concorrência de `OpsParameterService.put` (hotfix B9, defeito 1):
+// dois `PUT` com o mesmo `If-Match` sobre a mesma chave/superfície/escopo/
+// órgão nunca podem gravar a mesma versão duas vezes. T1 conclui e fica
+// aberta; T2 começa; T1 commita; T2 tem de terminar em 412
+// `RAIT.VERSION_CONFLICT` (serialização equivalente), nunca em sucesso.
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  NullParameterCache,
+  OpsParameterService,
+  SqlParameterOutbox,
+  type ParameterClock,
+} from '../../src/handwritten/parameter.service.js';
+import {
+  RaceSession,
+  cloneDatabase,
+  interleave,
+  summarize,
+  type RaceDatabase,
+} from './race-harness.js';
+
+const TODAY = '2026-09-29';
+const clock: ParameterClock = {
+  today: () => TODAY,
+  now: () => `${TODAY}T12:00:00.000Z`,
+};
+
+let clone: RaceDatabase;
+let owner: pg.Client;
+let first: RaceSession;
+let second: RaceSession;
+let tenantId: string;
+const actorId = '00000000-0000-4000-8000-0000b0000016';
+
+function service(session: RaceSession, hold?: () => Promise<void>) {
+  return new OpsParameterService(
+    session.database(tenantId, actorId, hold) as never,
+    {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId, actorId }),
+    } as never,
+    clock,
+    new NullParameterCache(),
+    new SqlParameterOutbox(),
+  );
+}
+
+function put(
+  session: RaceSession,
+  key: string,
+  ifMatch: string,
+  effectiveFrom: string,
+  hold?: () => Promise<void>,
+) {
+  return service(session, hold).put(
+    key,
+    {
+      value: { value: effectiveFrom },
+      valueType: 'string',
+      reason: 'prova de concorrência',
+      decisionRef: 'OD-001',
+      effectiveFrom,
+    },
+    { ifMatch, idempotencyKey: randomUUID() },
+  );
+}
+
+async function versionsOf(key: string) {
+  const rows = await owner.query<{ version: number; effective_from: string }>(
+    `select version, to_char(effective_from, 'YYYY-MM-DD') as effective_from
+       from ops.parameter where tenant_id = $1 and key = $2
+      order by version, effective_from`,
+    [tenantId, key],
+  );
+  return rows.rows;
+}
+
+beforeAll(async () => {
+  clone = await cloneDatabase();
+  owner = new pg.Client({ connectionString: clone.url });
+  await owner.connect();
+  const tenant = await owner.query<{ id: string }>(
+    'select id from auth.tenants order by id limit 1',
+  );
+  tenantId = tenant.rows[0]!.id;
+  first = await RaceSession.open(clone.url, 'race-parameter-t1');
+  second = await RaceSession.open(clone.url, 'race-parameter-t2');
+}, 60_000);
+
+afterAll(async () => {
+  await first?.end();
+  await second?.end();
+  await owner?.end();
+  await clone?.drop();
+}, 60_000);
+
+describe('ops.parameter PUT concorrente (checa e depois grava)', () => {
+  it('dado chave sem versão quando dois PUT If-Match 0 concorrem então só uma versão 1 é gravada e o outro recebe 412', async () => {
+    const key = `rait.race_${randomUUID().slice(0, 8)}`;
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => put(first, key, '0', '2026-10-01', hold),
+      runSecond: () => put(second, key, '0', '2026-11-01'),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect(await versionsOf(key)).toHaveLength(1);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'RAIT.VERSION_CONFLICT',
+      httpStatus: 412,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+
+  it('dado chave na versão 1 quando dois PUT If-Match 1 concorrem então só uma versão 2 é gravada e o outro recebe 412', async () => {
+    const key = `rait.race_${randomUUID().slice(0, 8)}`;
+    await put(first, key, '0', '2026-10-01');
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => put(first, key, '1', '2026-11-01', hold),
+      runSecond: () => put(second, key, '1', '2026-12-01'),
+    });
+    expect(outcome.first.status).toBe('fulfilled');
+    expect((await versionsOf(key)).map((row) => row.version)).toEqual([1, 2]);
+    expect(summarize(outcome.second)).toMatchObject({
+      status: 'rejected',
+      code: 'RAIT.VERSION_CONFLICT',
+      httpStatus: 412,
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+  });
+});
diff --git a/docs/meta/knowledge-base/open-decisions-rait.md b/docs/meta/knowledge-base/open-decisions-rait.md
index 27139545..67d23f30 100644
--- a/docs/meta/knowledge-base/open-decisions-rait.md
+++ b/docs/meta/knowledge-base/open-decisions-rait.md
@@ -430,3 +430,12 @@ decide apenas se a nova ADR a mantém ou a emenda por supersessão.
 | OD-R20-006 | ADR-0022 aceita: manter ou emendar por supersessão?                                        | Pendente; o aceite da ADR-0022 por OD-R18-002 não é reaberto.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Owner   | `work/rounds/R-0020/plan.md`                             |
 | OD-R20-007 | Normalização arquivística de 143 TASKs legadas incompatíveis com `task.schema.json` 2.0.0. | **Decidida parcialmente: A3, A3.1 e A3.2/A3.3 questões 1A–6, Owner 2026-09-28.** Sidecars imutáveis, seis IDs R-0007, A3.1 prospectiva para 54 `none`, dez aliases CTG, doze títulos, referências externas e campos extras em arquivo, onze PCs arquivísticos com guarda, G0/D1/S1/C1/P1, U1/T1 e ROLE=R1 arquivístico. A questão 6 aprova matriz prospectiva para `apps/` e `backend/`, **ainda sem fiscalização materializada** no DEVAI 1.5.6. A3.4 recebeu PASS de revisão cruzada no ciclo 3; o Owner decidiu especificamente **P2**, restrita à projeção arquivística das duas TASKs concluídas R-0003/TASK-0004 e R-0005/TASK-0009, com tags de enforcement pendente e autoridade histórica não classificada; aplicação depende de revisão cruzada do contrato/prompt revisados e testes Inspector. A política prospectiva continua sem materialização. Schema, gate e selos não foram dispensados. | Owner   | `work/rounds/R-0020/AUTHORIZATION-A3.4-P2-2026-09-28.md` |
 | A1         | Piso de PASS e membros obrigatórios aplicáveis.                                            | Pendente da medição CTG-0001; nenhuma meta é presumida nem reduzida.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Owner   | `work/rounds/R-0020/plan.md`                             |
+
+## Hotfix B9 — corridas "checa e depois grava" (2026-09-29)
+
+Registro do Engineer no hotfix fora da R-0022 (Adenda B9). Um item ficou parado porque a
+correção depende de uma regra de produto sem fonte única.
+
+| ID           | Questão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Estado / premissa até decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Decisor | Afeta                                                                                                    |
+| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
+| OD-HF-B9-001 | **Unicidade da `renach_process_key`**: única por tenant (um processo RENACH liga um só atendimento, de qualquer paciente) ou única por (tenant, paciente, chave)? O código (`backend/app/src/pec-renach-process.service.ts`) rejeita a chave ligada a atendimento de **outro paciente**, mas a checagem roda sem bloqueio e o índice `ux_ch_encounter_renach_process` inclui `patient_id`: dois vínculos paralelos de pacientes diferentes gravam a mesma chave (prova vermelha no relatório do hotfix). | Pendente; nada alterado. Fontes divergentes: [APP-PEC] §`renach_process_key`, [UC-PEC-001] passo 3 e AC-PEC-001-2 e o glossário de domínio dizem (tenant, paciente, chave); `law/glossary/GE-028.json` diz "chave única" sem escopo; o código aplica unicidade por tenant de forma não atômica. Decidido "por tenant" → índice único parcial `(tenant_id, renach_process_key)` no BP-CH-ENCOUNTERS-001 (Architect) com 23505 → 409 atual. Decidido "por paciente" → retirar do código a checagem entre pacientes. | Owner   | `BP-CH-ENCOUNTERS-001`, `42-ch-encounters.sql`, `pec-renach-process.service.ts`, [UC-PEC-001], [APP-PEC] |
diff --git a/package.json b/package.json
index 148e46d8..069af01b 100644
--- a/package.json
+++ b/package.json
@@ -47,7 +47,7 @@
     "test:stack": "node --test tools/stack/*.test.mjs",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
     "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/est-crash test:unit && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/ops-provisioning test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit && pnpm --filter @detran/portal-identity test:unit && pnpm --filter @detran/portal-requests test:unit && pnpm --filter @detran/portal-inbox test:unit && pnpm --filter @detran/portal-citizen-service test:unit && pnpm --filter @detran/portal-projections test:unit && pnpm --filter @detran/dashboard-monitor test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/ch-clinical-reports test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/ch-clinical-reports test:integration && pnpm --filter @detran/ch-billing test:integration && pnpm --filter @detran/est-crash test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/ops-provisioning test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-case test:integration --exclude '**/rait-priority-upgrade.integration.spec.ts' --passWithNoTests=false && pnpm --filter @detran/inf-rait-worklist test:integration && pnpm --filter @detran/inf-rait-session test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/dashboard-monitor test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/ops-provisioning test:e2e && pnpm --filter @detran/inf-ait test:e2e && pnpm --filter @detran/portal-identity test:e2e && pnpm --filter @detran/portal-requests test:e2e && pnpm --filter @detran/portal-inbox test:e2e && pnpm --filter @detran/portal-citizen-service test:e2e && pnpm --filter @detran/portal-projections test:e2e && pnpm --filter @detran/dashboard-monitor test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
```

```json
{"mode":"delivery-review","scope":"hotfix-check-then-write-races","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}
```
