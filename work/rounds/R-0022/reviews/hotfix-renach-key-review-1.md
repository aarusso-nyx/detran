# Delivery-review — hotfix da chave de processo RENACH única por tenant (fora da R-0022)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-a1c35b6d45e5cb991` (branch
> `fix/renach-process-key-tenant-unique`, empilhada sobre o #169). Responda **apenas** com o JSON.

Decisões do Owner (R-0022 `AUTHORIZATION.md` Adenda B10, 2026-09-29): OD-HF-B9-001 = (a) chave RENACH
única por tenant; OD-HF-B9-002 = (a) manter o protocolo do fechamento de turno e alinhar o catálogo para
`received`. Mudança: BP-CH-ENCOUNTERS-001 1.2.1 troca `ux_ch_encounter_renach_process (tenant_id,
patient_id, renach_process_key)` por `ux_ch_encounter_renach_process_key (tenant_id, renach_process_key)
where renach_process_key is not null` (DDL 42, OpenAPI e clientes regenerados; demais gerados só hash);
pré-checagem manuscrita `backend/database/ddl/19-ch-encounter-renach-key.sql` (faixa 1x, antes do 42;
lista duplicatas entre pacientes e aborta; sem duplicatas, remove o índice antigo), registrada em
`apply.sh` e no README; serviço traduz só essa constraint para o 409 existente; docs: catálogo TEAT e
registro de ODs. Prova: corrida com duas sessões `role_app_backend` em clone (vermelha: dois titulares;
verde: 409 e um titular) + caso sequencial + prova da pré-checagem. Resultados: app unit 137,
integração 23, `ch-clinical-reports`/`ch-encounters` unit, `blueprints:check`, `contracts:check`,
`rls-smoke`, `verify:rls-ddl`, `typecheck`, `verify:decorators`, `pec-parity`, `docs:kb:check`,
`format:check`. Pendência declarada: documentos de produto (APP-PEC, UC-PEC-001, glossário) ainda
dizem (tenant, paciente, chave) — são do Owner.

Rubrica: (1) índice e pré-checagem corretos (nomes, ordem de aplicação, idempotência do `apply.sh`,
remoção do índice antigo só sem duplicatas); (2) tradução de erro restrita; (3) prova suficiente e no
CI; (4) DDL manuscrita na faixa permitida (CODESTYLE) e sem edição à mão de gerado; (5) docs coerentes
com as decisões.

## Diff (sem clientes gerados e sem `race-harness.ts`)

```diff
diff --git a/backend/app/src/pec-renach-process.service.ts b/backend/app/src/pec-renach-process.service.ts
index d6406e79..847a1f77 100644
--- a/backend/app/src/pec-renach-process.service.ts
+++ b/backend/app/src/pec-renach-process.service.ts
@@ -183,7 +183,7 @@ export class PecRenachProcessService {
       command,
       eligibility,
     ).catch((error: unknown) => {
-      if (isPostgresUniqueViolation(error)) {
+      if (isRenachProcessKeyViolation(error)) {
         throw new ConflictException(
           'RENACH process key is already linked to another encounter',
         );
@@ -230,6 +230,10 @@ export class PecRenachProcessService {
         );
       }

+      // Mensagem de negócio para o caso sequencial. Não é a garantia: duas
+      // transações paralelas não se veem aqui; quem serializa é o índice único
+      // parcial ux_ch_encounter_renach_process_key (tenant_id, chave), cuja
+      // violação bindProcess traduz para o mesmo 409 (OD-HF-B9-001 = (a)).
       const conflict = await tx.query<{ id: string }>(
         `select id from ch.encounter
           where renach_process_key = $1 and id <> $2
@@ -333,11 +337,15 @@ function requiredTracks(
   return psychologicalRequired ? ['MEDICAL', 'PSYCH'] : ['MEDICAL'];
 }

-function isPostgresUniqueViolation(error: unknown): boolean {
-  return (
-    typeof error === 'object' &&
-    error !== null &&
-    'code' in error &&
-    (error as { code?: unknown }).code === '23505'
-  );
+/** Índice único parcial `(tenant_id, renach_process_key)` de
+ * BP-CH-ENCOUNTERS-001: a chave RENACH é única por tenant (OD-HF-B9-001 = (a)). */
+const RENACH_PROCESS_KEY_INDEX = 'ux_ch_encounter_renach_process_key';
+
+function isRenachProcessKeyViolation(error: unknown): boolean {
+  if (typeof error !== 'object' || error === null) return false;
+  const { code, constraint } = error as {
+    code?: unknown;
+    constraint?: unknown;
+  };
+  return code === '23505' && constraint === RENACH_PROCESS_KEY_INDEX;
 }
diff --git a/backend/app/src/pec-renach-process.spec.ts b/backend/app/src/pec-renach-process.spec.ts
index 388d366e..fb5f1a46 100644
--- a/backend/app/src/pec-renach-process.spec.ts
+++ b/backend/app/src/pec-renach-process.spec.ts
@@ -175,4 +175,39 @@ describe('PecRenachProcessService', () => {
     ).rejects.toBeInstanceOf(ConflictException);
     expect(query).toHaveBeenCalledTimes(3);
   });
+
+  function bindingRejectedBy(error: object) {
+    const query = vi
+      .fn()
+      .mockResolvedValueOnce({ rows: [source] })
+      .mockResolvedValueOnce({ rows: [source] })
+      .mockResolvedValueOnce({ rows: [] })
+      .mockRejectedValueOnce(error);
+    const openProcess = vi.fn().mockResolvedValue({
+      renachNumber: 'RN123',
+      processType: 'RENEWAL',
+      openingResult: 'OPENED',
+    });
+    const getExamEligibility = vi.fn().mockResolvedValue(eligibility);
+    return subject(query, { openProcess, getExamEligibility }).openAndBind(
+      'encounter-1',
+      { processType: 'RENEWAL' },
+    );
+  }
+
+  it('OD-HF-B9-001 translates the tenant-wide key index violation into the existing 409', async () => {
+    const binding = bindingRejectedBy({
+      code: '23505',
+      constraint: 'ux_ch_encounter_renach_process_key',
+    });
+    await expect(binding).rejects.toBeInstanceOf(ConflictException);
+    await expect(binding).rejects.toThrow(
+      'RENACH process key is already linked to another encounter',
+    );
+  });
+
+  it('OD-HF-B9-001 does not relabel another unique violation as a key conflict', async () => {
+    const error = { code: '23505', constraint: 'pk_encounter' };
+    await expect(bindingRejectedBy(error)).rejects.toBe(error);
+  });
 });
diff --git a/backend/app/tests/integration/pec-renach-process-key-race.integration.spec.ts b/backend/app/tests/integration/pec-renach-process-key-race.integration.spec.ts
new file mode 100644
index 00000000..d09a4aa6
--- /dev/null
+++ b/backend/app/tests/integration/pec-renach-process-key-race.integration.spec.ts
@@ -0,0 +1,258 @@
+// Prova de concorrência da chave de processo RENACH (hotfix fora da R-0022,
+// Adenda B10, OD-HF-B9-001 = (a): a chave é única por tenant — um processo
+// RENACH pertence a um só paciente). Dois pacientes diferentes, a mesma chave
+// devolvida pelo RENACH: T1 vincula a chave ao atendimento do paciente A e
+// fica aberta; T2 vincula a mesma chave ao atendimento do paciente B; T1
+// commita. Só um vínculo pode persistir e o outro recebe o 409 que o serviço
+// já devolve para "chave ligada a outro atendimento". O RENACH é porta
+// externa e fica como dublê (processo e elegibilidade fixos).
+import { randomUUID } from 'node:crypto';
+import { readFileSync } from 'node:fs';
+import { ConflictException } from '@nestjs/common';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import { PecRenachProcessService } from '../../src/pec-renach-process.service.js';
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
+const actorA = randomUUID();
+const actorB = randomUUID();
+const clinicId = randomUUID();
+const patientA = randomUUID();
+const patientB = randomUUID();
+
+/** O dublê do RENACH devolve sempre a mesma chave, para qualquer CPF. */
+function renach(processKey: string) {
+  return {
+    openProcess: async () => ({
+      renachNumber: processKey,
+      processType: 'RENEWAL',
+      openingResult: 'OPENED',
+    }),
+    getExamEligibility: async () => ({
+      renachNumber: processKey,
+      processType: 'RENEWAL',
+      medicalEligible: true,
+      psychologicalRequired: false,
+      reasons: [],
+    }),
+  };
+}
+
+/** `openAndBind` abre duas transações (leitura do atendimento, vínculo); só a
+ * segunda — a que checa e grava a chave — fica aberta. */
+function bind(
+  session: RaceSession,
+  actorId: string,
+  encounterId: string,
+  processKey: string,
+  hold?: () => Promise<void>,
+) {
+  let calls = 0;
+  const plain = session.database(tenantId, actorId);
+  const held = session.database(tenantId, actorId, hold);
+  const database = {
+    tx: <T>(work: (tx: never) => Promise<T>) =>
+      ((calls += 1) === 2 && hold ? held : plain).tx(
+        work as never,
+      ) as Promise<T>,
+  };
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId, requestId: randomUUID() }),
+  };
+  return new PecRenachProcessService(
+    database as never,
+    requestContext as never,
+    renach(processKey) as never,
+  ).openAndBind(encounterId, {
+    processType: 'RENEWAL',
+    currentCategory: 'B',
+  });
+}
+
+async function newEncounter(patientId: string): Promise<string> {
+  const encounterId = randomUUID();
+  await owner.query(
+    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
+     values ($1, $2, $3, $4, 'OPEN')`,
+    [encounterId, tenantId, clinicId, patientId],
+  );
+  return encounterId;
+}
+
+async function holders(processKey: string) {
+  const result = await owner.query<{ patient_id: string }>(
+    `select patient_id from ch.encounter
+      where tenant_id = $1 and renach_process_key = $2
+      order by patient_id`,
+    [tenantId, processKey],
+  );
+  return result.rows.map((row) => row.patient_id);
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
+    [tenantId, `renach-key-race-${tenantId.slice(0, 8)}`, 'RENACH key race'],
+  );
+  for (const userId of [actorA, actorB]) {
+    await owner.query(
+      `insert into auth.users (id, tenant_id, email, display_name)
+       values ($1, $2, $3, 'RENACH key race')`,
+      [userId, tenantId, `${userId}@detran.invalid`],
+    );
+  }
+  await owner.query(
+    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
+     values ($1, $2, 'RENACH-RACE', '00000000000191', 'Clínica prova', 'R1')`,
+    [clinicId, tenantId],
+  );
+  await owner.query(
+    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
+     values ($1, $2, $4, '00000000191', 'Paciente A'),
+            ($3, $2, $4, '00000000272', 'Paciente B')`,
+    [patientA, tenantId, patientB, clinicId],
+  );
+  first = await RaceSession.open(clone.url, 'renach-key-race-t1');
+  second = await RaceSession.open(clone.url, 'renach-key-race-t2');
+});
+
+afterAll(async () => {
+  try {
+    await Promise.all(
+      [first, second, owner]
+        .filter(Boolean)
+        .map((client) => client.end().catch(() => undefined)),
+    );
+  } finally {
+    await clone?.drop();
+  }
+});
+
+describe('chave de processo RENACH única por tenant (OD-HF-B9-001 = a)', () => {
+  it('dado dois pacientes e a mesma chave quando vinculam em paralelo então só um grava e o outro recebe 409', async () => {
+    const processKey = `RN-RACE-${randomUUID().slice(0, 8)}`;
+    const encounterA = await newEncounter(patientA);
+    const encounterB = await newEncounter(patientB);
+
+    const outcome = await interleave({
+      observer: owner,
+      second,
+      runFirst: (hold) => bind(first, actorA, encounterA, processKey, hold),
+      runSecond: () => bind(second, actorB, encounterB, processKey),
+    });
+
+    expect(
+      {
+        first: summarize(outcome.first),
+        second: summarize(outcome.second),
+        holders: await holders(processKey),
+      },
+      'dois pacientes com a mesma chave RENACH gravaram em paralelo',
+    ).toEqual({
+      first: { status: 'fulfilled' },
+      second: {
+        status: 'rejected',
+        code: undefined,
+        httpStatus: 409,
+        message: 'RENACH process key is already linked to another encounter',
+      },
+      holders: [patientA],
+    });
+    expect(outcome.secondWhileFirstOpen).toBe('blocked');
+    expect(
+      outcome.second.status === 'rejected' && outcome.second.reason,
+    ).toBeInstanceOf(ConflictException);
+  });
+
+  it('dado a chave já gravada para um paciente quando outro paciente vincula depois do commit então é recusado com 409', async () => {
+    const processKey = `RN-SEQ-${randomUUID().slice(0, 8)}`;
+    const encounterA = await newEncounter(patientA);
+    const encounterB = await newEncounter(patientB);
+
+    await expect(
+      bind(first, actorA, encounterA, processKey),
+    ).resolves.toMatchObject({
+      status: 'OPENED',
+      renachProcessKey: processKey,
+    });
+    const late = bind(second, actorB, encounterB, processKey);
+    await expect(late).rejects.toBeInstanceOf(ConflictException);
+    await expect(late).rejects.toThrow(
+      'RENACH process key is already linked to another encounter',
+    );
+    expect(await holders(processKey)).toEqual([patientA]);
+  });
+});
+
+const ddl = (name: string) =>
+  readFileSync(
+    new URL(`../../../database/ddl/${name}`, import.meta.url),
+    'utf8',
+  );
+
+describe('pré-checagem manuscrita 19-ch-encounter-renach-key.sql', () => {
+  it('dado banco legado com a mesma chave em dois pacientes quando reaplica a DDL então recusa listando a chave e, resolvida a duplicata, cria o índice e retira o anterior', async () => {
+    const processKey = `RN-LEGACY-${randomUUID().slice(0, 8)}`;
+    // Banco legado: sem o índice novo, com o anterior (tenant, paciente, chave).
+    await owner.query('drop index ch.ux_ch_encounter_renach_process_key');
+    await owner.query(
+      `create unique index ux_ch_encounter_renach_process
+         on ch.encounter (tenant_id, patient_id, renach_process_key)
+         where renach_process_key is not null`,
+    );
+    const legacy: string[] = [];
+    for (const patientId of [patientA, patientB]) {
+      const encounterId = await newEncounter(patientId);
+      legacy.push(encounterId);
+      await owner.query(
+        `update ch.encounter
+            set renach_process_key = $2, renach_process_type = 'RENEWAL',
+                exam_eligible = true, eligibility_checked_at = now()
+          where id = $1`,
+        [encounterId, processKey],
+      );
+    }
+
+    await expect(
+      owner.query(ddl('19-ch-encounter-renach-key.sql')),
+    ).rejects.toThrow(
+      `renach_process_key=${processKey} atendimentos=2 pacientes=2`,
+    );
+
+    await owner.query(
+      `update ch.encounter
+          set renach_process_key = null, renach_process_type = null,
+              exam_eligible = null, eligibility_checked_at = null
+        where id = $1`,
+      [legacy[1]],
+    );
+    await owner.query(ddl('19-ch-encounter-renach-key.sql'));
+    await owner.query(ddl('42-ch-encounters.sql'));
+    const indexes = await owner.query<{ indexname: string }>(
+      `select indexname from pg_indexes
+        where schemaname = 'ch' and tablename = 'encounter'
+          and indexname like 'ux_ch_encounter_renach_process%'`,
+    );
+    expect(indexes.rows.map((row) => row.indexname)).toEqual([
+      'ux_ch_encounter_renach_process_key',
+    ]);
+  });
+});
diff --git a/backend/database/apply.sh b/backend/database/apply.sh
index 3263a12d..6c2af3d9 100755
--- a/backend/database/apply.sh
+++ b/backend/database/apply.sh
@@ -48,7 +48,7 @@ const fs = require('node:fs');
 const path = require('node:path');
 const dir = process.argv[1];
 const full = process.argv[2] === '1';
-const ordinary = ["00-extensions.sql","01-schemas.sql","02-auth.sql","03-audit.sql","04-integration-storage.sql","05-role-catalog.sql","10-postgis-functions.sql","11-auth-functions.sql","12-audit-functions.sql","13-ops-agency.sql","13-ops-field-operations.sql","14-inf-lifecycle-vocabulary.sql","15-ops-parameter.sql","16-ops-snapshots.sql","17-ops-evidence.sql","18-ops-offline-sync.sql","19-dashboard-lifecycle-vocabulary.sql","19-est-lifecycle-vocabulary.sql","19-portal-platform.sql","20-rls-policies.sql","21-ops-provisioning.sql","30-inf-normative.sql","30-ops-example.sql","31-inf-ait.sql","32-inf-measures.sql","33-inf-alcohol.sql","34-inf-rait-case.sql","35-inf-rait-worklist.sql","36-inf-rait-session.sql","37-inf-speed.sql","38-inf-infraction.sql","39-inf-rait-org.sql","40-ch-clinical-network.sql","41-ch-patients.sql","42-ch-encounters.sql","43-ch-exams.sql","44-ch-reports.sql","45-ch-biometrics.sql","46-ch-scheduling.sql","47-ch-restrictions.sql","48-ch-retention.sql","49-ch-process-blocks.sql","50-ch-telehealth.sql","51-ch-billing.sql","52-ch-clinical-controls.sql","53-ch-inconsistencies.sql","54-ch-operational-controls.sql","55-ch-juntas.sql","56-ch-toxicology.sql","57-inf-collection.sql","58-inf-rait-integration.sql","59-inf-notification.sql","60-portal-complaints.sql","61-portal-identity.sql","62-portal-requests.sql","63-portal-inbox.sql","64-portal-citizen-service.sql","65-portal-projections.sql","70-est-crash.sql","71-dashboard-crashes.sql","72-integration-renaest-mirror.sql","75-boat-renaest-job.sql","80-dashboard.sql"];
+const ordinary = ["00-extensions.sql","01-schemas.sql","02-auth.sql","03-audit.sql","04-integration-storage.sql","05-role-catalog.sql","10-postgis-functions.sql","11-auth-functions.sql","12-audit-functions.sql","13-ops-agency.sql","13-ops-field-operations.sql","14-inf-lifecycle-vocabulary.sql","15-ops-parameter.sql","16-ops-snapshots.sql","17-ops-evidence.sql","18-ops-offline-sync.sql","19-ch-encounter-renach-key.sql","19-dashboard-lifecycle-vocabulary.sql","19-est-lifecycle-vocabulary.sql","19-portal-platform.sql","20-rls-policies.sql","21-ops-provisioning.sql","30-inf-normative.sql","30-ops-example.sql","31-inf-ait.sql","32-inf-measures.sql","33-inf-alcohol.sql","34-inf-rait-case.sql","35-inf-rait-worklist.sql","36-inf-rait-session.sql","37-inf-speed.sql","38-inf-infraction.sql","39-inf-rait-org.sql","40-ch-clinical-network.sql","41-ch-patients.sql","42-ch-encounters.sql","43-ch-exams.sql","44-ch-reports.sql","45-ch-biometrics.sql","46-ch-scheduling.sql","47-ch-restrictions.sql","48-ch-retention.sql","49-ch-process-blocks.sql","50-ch-telehealth.sql","51-ch-billing.sql","52-ch-clinical-controls.sql","53-ch-inconsistencies.sql","54-ch-operational-controls.sql","55-ch-juntas.sql","56-ch-toxicology.sql","57-inf-collection.sql","58-inf-rait-integration.sql","59-inf-notification.sql","60-portal-complaints.sql","61-portal-identity.sql","62-portal-requests.sql","63-portal-inbox.sql","64-portal-citizen-service.sql","65-portal-projections.sql","70-est-crash.sql","71-dashboard-crashes.sql","72-integration-renaest-mirror.sql","75-boat-renaest-job.sql","80-dashboard.sql"];
 const manual = ['19-rait-priority-pre.sql','19-rait-priority-enforce.sql','19-rait-priority-verify.sql'];
 const expected = [...ordinary,...manual].sort();
 const present = fs.readdirSync(path.join(dir,'ddl')).filter(n=>n.endsWith('.sql')).sort();
diff --git a/backend/database/ddl/19-ch-encounter-renach-key.sql b/backend/database/ddl/19-ch-encounter-renach-key.sql
new file mode 100644
index 00000000..9207fd7d
--- /dev/null
+++ b/backend/database/ddl/19-ch-encounter-renach-key.sql
@@ -0,0 +1,37 @@
+-- 19-ch-encounter-renach-key.sql — pré-checagem da chave de processo RENACH única por tenant
+-- (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
+-- Fonte: OD-HF-B9-001 = (a), decidida pelo Owner em 2026-09-29 (R-0022 AUTHORIZATION.md Adenda B10):
+-- um processo RENACH pertence a um só paciente, logo ch.encounter.renach_process_key é única por
+-- tenant. BP-CH-ENCOUNTERS-001 v1.2.1 declara o índice único parcial
+-- ux_ch_encounter_renach_process_key (tenant_id, renach_process_key) where renach_process_key is not
+-- null, criado por 42-ch-encounters.sql. O gerador desta base não emite pré-checagem de índice único;
+-- este bloco roda antes do 42 (ordem lexical de apply.sh) e só detecta: qual vínculo manter é decisão
+-- da operação, nunca da DDL (procedimento em backend/database/ddl/README.md, "Duplicatas da chave de
+-- processo RENACH"). Idempotente: sem a tabela (banco novo) ou com o índice já presente não varre nada.
+DO $renach_key$
+DECLARE
+  duplicates text;
+BEGIN
+  IF to_regclass('ch.encounter') IS NOT NULL
+     AND to_regclass('ch.ux_ch_encounter_renach_process_key') IS NULL THEN
+    SELECT string_agg(
+             format('tenant_id=%s renach_process_key=%s atendimentos=%s pacientes=%s',
+                    tenant_id, renach_process_key, total, patients),
+             '; ' ORDER BY tenant_id, renach_process_key)
+      INTO duplicates
+      FROM (SELECT tenant_id, renach_process_key, count(*) AS total,
+                   count(DISTINCT patient_id) AS patients
+              FROM ch.encounter
+             WHERE renach_process_key IS NOT NULL
+             GROUP BY tenant_id, renach_process_key
+            HAVING count(*) > 1) duplicate;
+    IF duplicates IS NOT NULL THEN
+      RAISE EXCEPTION 'Indice unico ch.ux_ch_encounter_renach_process_key nao pode ser criado: chaves RENACH duplicadas em ch.encounter (renach_process_key is not null): %. Resolva-as pelo procedimento "Duplicatas da chave de processo RENACH" de backend/database/ddl/README.md e reaplique a DDL.', duplicates;
+    END IF;
+  END IF;
+END $renach_key$;
+
+-- O índice anterior ux_ch_encounter_renach_process (tenant_id, patient_id, renach_process_key) fica
+-- implicado pelo novo (toda violação dele viola o novo) e saiu do blueprint; sem duplicatas, retira-se
+-- dos bancos existentes para não manter dois índices únicos sobre a mesma chave.
+DROP INDEX IF EXISTS ch.ux_ch_encounter_renach_process;
diff --git a/backend/database/ddl/42-ch-encounters.sql b/backend/database/ddl/42-ch-encounters.sql
index 0f4f60bf..90e6510f 100644
--- a/backend/database/ddl/42-ch-encounters.sql
+++ b/backend/database/ddl/42-ch-encounters.sql
@@ -1,4 +1,4 @@
--- Generated from BP-CH-ENCOUNTERS-001 v1.2.0 sha256:91731d0164806f1b137025d46dbb65f5fc8ac203fbc84cf8c9affcf81be9a4b5
+-- Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92

 -- Regenerable-only DDL for BP-CH-ENCOUNTERS-001; request-path writes use role_app_backend.

@@ -67,7 +67,7 @@ create table if not exists ch.encounter (
 );
 create index if not exists ix_ch_encounter_status on ch.encounter (tenant_id, status);
 create index if not exists ix_ch_encounter_patient on ch.encounter (tenant_id, patient_id);
-create unique index if not exists ux_ch_encounter_renach_process on ch.encounter (tenant_id, patient_id, renach_process_key) where renach_process_key is not null;
+create unique index if not exists ux_ch_encounter_renach_process_key on ch.encounter (tenant_id, renach_process_key) where renach_process_key is not null;
 create index if not exists ix_encounter_tenant_id on ch.encounter (tenant_id);
 create index if not exists ix_encounter_clinic_id on ch.encounter (clinic_id);
 create index if not exists ix_encounter_patient_id on ch.encounter (patient_id);
diff --git a/backend/database/ddl/README.md b/backend/database/ddl/README.md
index 6c7a19a8..7cea9e19 100644
--- a/backend/database/ddl/README.md
+++ b/backend/database/ddl/README.md
@@ -26,60 +26,63 @@ Applied by `../apply.sh` in one `psql --single-transaction` run: every `*.sql` f
 14. `16-ops-snapshots.sql` — Generated from BP-OPS-SNAPSHOTS-001 v1.1.0
 15. `17-ops-evidence.sql` — Generated from BP-OPS-EVIDENCE-001 v1.1.0
 16. `18-ops-offline-sync.sql` — Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0
-17. `19-dashboard-lifecycle-vocabulary.sql` — Vocabulário do DASHBOARD para o estado próprio de BP-DASH-MONITOR-001 (WF-DASH-001 ciclo do alerta, WF-DASH-002 calendário de deveres periódicos, WF-DASH-003 frescor; RN-DASH-142 classificação; RN-DASH-170 camadas; dashboard-route-contract.md §2/§3; parameter-catalogue.md §DASHBOARD; plan R-0011 M3 e M7; adendas A4 e A7; contrato work/rounds/R-0011/contracts/CTG-0001.md §3).
-18. `19-est-lifecycle-vocabulary.sql` — Vocabulário do BOAT para o agregado est.crash (WF-BOAT-001, WF-BOAT-003; H.42, H.43 e H.45).
-19. `19-portal-platform.sql` — 19-portal-platform.sql — plataforma do Portal (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
-20. `21-ops-provisioning.sql` — Generated from BP-OPS-PROVISIONING-001 v1.0.3
-21. `30-inf-normative.sql` — Generated from BP-INF-NORMATIVE-001 v1.1.0
-22. `30-ops-example.sql` — Generated from BP-OPS-EXAMPLE-001 v1.0.0
-23. `31-inf-ait.sql` — Generated from BP-INF-AIT-001 v1.2.0
-24. `32-inf-measures.sql` — Generated from BP-INF-MEASURES-001 v1.2.0
-25. `33-inf-alcohol.sql` — Generated from BP-INF-ALCOHOL-001 v1.2.0
-26. `19-rait-priority-pre.sql` — CTG-0001-C4-OD V3.
-27. `34-inf-rait-case.sql` — Generated from BP-INF-RAIT-CASE-001 v1.1.7
-28. `35-inf-rait-worklist.sql` — Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1
-29. `36-inf-rait-session.sql` — Generated from BP-INF-RAIT-SESSION-001 v1.2.2
-30. `37-inf-speed.sql` — Generated from BP-INF-SPEED-001 v1.1.0
-31. `38-inf-infraction.sql` — Generated from BP-INF-INFRACTION-001 v1.1.2
-32. `39-inf-rait-org.sql` — Generated from BP-INF-RAIT-ORG-001 v1.0.1
-33. `40-ch-clinical-network.sql` — Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1
-34. `41-ch-patients.sql` — Generated from BP-CH-PATIENTS-001 v1.1.0
-35. `42-ch-encounters.sql` — Generated from BP-CH-ENCOUNTERS-001 v1.2.0
-36. `43-ch-exams.sql` — Generated from BP-CH-EXAMS-001 v1.1.0
-37. `44-ch-reports.sql` — Generated from BP-CH-REPORTS-001 v1.3.0
-38. `45-ch-biometrics.sql` — Generated from BP-CH-BIOMETRICS-001 v1.1.0
-39. `46-ch-scheduling.sql` — Generated from BP-CH-SCHEDULING-001 v1.0.0
-40. `47-ch-restrictions.sql` — Generated from BP-CH-RESTRICTIONS-001 v1.0.0
-41. `48-ch-retention.sql` — Generated from BP-CH-RETENTION-001 v1.0.0
-42. `49-ch-process-blocks.sql` — Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0
-43. `50-ch-telehealth.sql` — Generated from BP-CH-TELEHEALTH-001 v1.0.0
-44. `51-ch-billing.sql` — Generated from BP-CH-BILLING-001 v1.0.0
-45. `52-ch-clinical-controls.sql` — Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0
-46. `53-ch-inconsistencies.sql` — Generated from BP-CH-INCONSISTENCIES-001 v1.0.0
-47. `54-ch-operational-controls.sql` — Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0
-48. `55-ch-juntas.sql` — Generated from BP-CH-JUNTAS-001 v1.0.0
-49. `56-ch-toxicology.sql` — Generated from BP-CH-TOXICOLOGY-001 v1.0.0
-50. `57-inf-collection.sql` — Generated from BP-INF-COLLECTION-001 v1.0.2
-51. `58-inf-rait-integration.sql` — Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1
-52. `59-inf-notification.sql` — Generated from BP-INF-NOTIFICATION-001 v1.1.1
-53. `60-portal-complaints.sql` — Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0
-54. `61-portal-identity.sql` — Generated from BP-PORTAL-IDENTITY-001 v1.0.2
-55. `62-portal-requests.sql` — Generated from BP-PORTAL-REQUESTS-001 v1.0.2
-56. `63-portal-inbox.sql` — Generated from BP-PORTAL-INBOX-001 v1.0.2
-57. `64-portal-citizen-service.sql` — Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1
-58. `65-portal-projections.sql` — Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2
-59. `70-est-crash.sql` — Generated from BP-EST-CRASH-001 v1.0.0
-60. `71-dashboard-crashes.sql` — Generated from BP-DASHBOARD-CRASHES-001 v1.0.0
-61. `72-integration-renaest-mirror.sql` — Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0
-62. `75-boat-renaest-job.sql` — `jobs` control substrate for the BOAT RENAEST
+17. `19-ch-encounter-renach-key.sql` — pré-checagem manuscrita (faixa 1x) do índice único parcial
+    `ux_ch_encounter_renach_process_key` de BP-CH-ENCOUNTERS-001 v1.2.1 (chave RENACH única por
+    tenant, OD-HF-B9-001 = (a)) e retirada do índice anterior `ux_ch_encounter_renach_process`.
+18. `19-dashboard-lifecycle-vocabulary.sql` — Vocabulário do DASHBOARD para o estado próprio de BP-DASH-MONITOR-001 (WF-DASH-001 ciclo do alerta, WF-DASH-002 calendário de deveres periódicos, WF-DASH-003 frescor; RN-DASH-142 classificação; RN-DASH-170 camadas; dashboard-route-contract.md §2/§3; parameter-catalogue.md §DASHBOARD; plan R-0011 M3 e M7; adendas A4 e A7; contrato work/rounds/R-0011/contracts/CTG-0001.md §3).
+19. `19-est-lifecycle-vocabulary.sql` — Vocabulário do BOAT para o agregado est.crash (WF-BOAT-001, WF-BOAT-003; H.42, H.43 e H.45).
+20. `19-portal-platform.sql` — 19-portal-platform.sql — plataforma do Portal (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
+21. `21-ops-provisioning.sql` — Generated from BP-OPS-PROVISIONING-001 v1.0.3
+22. `30-inf-normative.sql` — Generated from BP-INF-NORMATIVE-001 v1.1.0
+23. `30-ops-example.sql` — Generated from BP-OPS-EXAMPLE-001 v1.0.0
+24. `31-inf-ait.sql` — Generated from BP-INF-AIT-001 v1.2.0
+25. `32-inf-measures.sql` — Generated from BP-INF-MEASURES-001 v1.2.0
+26. `33-inf-alcohol.sql` — Generated from BP-INF-ALCOHOL-001 v1.2.0
+27. `19-rait-priority-pre.sql` — CTG-0001-C4-OD V3.
+28. `34-inf-rait-case.sql` — Generated from BP-INF-RAIT-CASE-001 v1.1.7
+29. `35-inf-rait-worklist.sql` — Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1
+30. `36-inf-rait-session.sql` — Generated from BP-INF-RAIT-SESSION-001 v1.2.2
+31. `37-inf-speed.sql` — Generated from BP-INF-SPEED-001 v1.1.0
+32. `38-inf-infraction.sql` — Generated from BP-INF-INFRACTION-001 v1.1.2
+33. `39-inf-rait-org.sql` — Generated from BP-INF-RAIT-ORG-001 v1.0.1
+34. `40-ch-clinical-network.sql` — Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1
+35. `41-ch-patients.sql` — Generated from BP-CH-PATIENTS-001 v1.1.0
+36. `42-ch-encounters.sql` — Generated from BP-CH-ENCOUNTERS-001 v1.2.1
+37. `43-ch-exams.sql` — Generated from BP-CH-EXAMS-001 v1.1.0
+38. `44-ch-reports.sql` — Generated from BP-CH-REPORTS-001 v1.3.0
+39. `45-ch-biometrics.sql` — Generated from BP-CH-BIOMETRICS-001 v1.1.0
+40. `46-ch-scheduling.sql` — Generated from BP-CH-SCHEDULING-001 v1.0.0
+41. `47-ch-restrictions.sql` — Generated from BP-CH-RESTRICTIONS-001 v1.0.0
+42. `48-ch-retention.sql` — Generated from BP-CH-RETENTION-001 v1.0.0
+43. `49-ch-process-blocks.sql` — Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0
+44. `50-ch-telehealth.sql` — Generated from BP-CH-TELEHEALTH-001 v1.0.0
+45. `51-ch-billing.sql` — Generated from BP-CH-BILLING-001 v1.0.0
+46. `52-ch-clinical-controls.sql` — Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0
+47. `53-ch-inconsistencies.sql` — Generated from BP-CH-INCONSISTENCIES-001 v1.0.0
+48. `54-ch-operational-controls.sql` — Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0
+49. `55-ch-juntas.sql` — Generated from BP-CH-JUNTAS-001 v1.0.0
+50. `56-ch-toxicology.sql` — Generated from BP-CH-TOXICOLOGY-001 v1.0.0
+51. `57-inf-collection.sql` — Generated from BP-INF-COLLECTION-001 v1.0.2
+52. `58-inf-rait-integration.sql` — Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1
+53. `59-inf-notification.sql` — Generated from BP-INF-NOTIFICATION-001 v1.1.1
+54. `60-portal-complaints.sql` — Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0
+55. `61-portal-identity.sql` — Generated from BP-PORTAL-IDENTITY-001 v1.0.2
+56. `62-portal-requests.sql` — Generated from BP-PORTAL-REQUESTS-001 v1.0.2
+57. `63-portal-inbox.sql` — Generated from BP-PORTAL-INBOX-001 v1.0.2
+58. `64-portal-citizen-service.sql` — Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1
+59. `65-portal-projections.sql` — Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2
+60. `70-est-crash.sql` — Generated from BP-EST-CRASH-001 v1.0.0
+61. `71-dashboard-crashes.sql` — Generated from BP-DASHBOARD-CRASHES-001 v1.0.0
+62. `72-integration-renaest-mirror.sql` — Generated from BP-INTEGRATION-RENAEST-MIRROR-001 v1.0.0
+63. `75-boat-renaest-job.sql` — `jobs` control substrate for the BOAT RENAEST
     monthly executor: audited per-tenant technical identities, restricted active
     tenant discovery, execution ledger and forced RLS. It grants no administrative
     access to BOAT domain data.
-63. `80-dashboard.sql` — Generated from BP-DASH-MONITOR-001 v1.1.0
-64. `20-rls-policies.sql` — forced RLS, trigger installation and least-privilege
+64. `80-dashboard.sql` — Generated from BP-DASH-MONITOR-001 v1.1.0
+65. `20-rls-policies.sql` — forced RLS, trigger installation and least-privilege
     grants.
-65. `19-rait-priority-enforce.sql` — CTG-0001-C4-OD V3.
-66. `19-rait-priority-verify.sql` — CTG-0001-C4-OD V3.
+66. `19-rait-priority-enforce.sql` — CTG-0001-C4-OD V3.
+67. `19-rait-priority-verify.sql` — CTG-0001-C4-OD V3.

 Application notes (`../apply.sh`):

@@ -89,3 +92,17 @@ Application notes (`../apply.sh`):
 `auth.tenants` is the canonical DETRAN tenant table. `tenancy.tenants` is a
 simple, automatically updatable compatibility view exposing the columns used by
 `@stynx-nyx/tenancy`; this prevents a second tenant source of truth.
+
+## Duplicatas da chave de processo RENACH
+
+`19-ch-encounter-renach-key.sql` recusa a aplicação quando `ch.encounter` tem a mesma
+`renach_process_key` em mais de um atendimento do mesmo tenant e o índice
+`ch.ux_ch_encounter_renach_process_key` ainda não existe; a mensagem lista, por chave, o tenant,
+o número de atendimentos e o de pacientes distintos. A DDL não escolhe qual vínculo manter:
+
+1. Para cada chave listada, identifique no RENACH o paciente titular do processo.
+2. O índice cobre atendimentos em qualquer `status` (inclusive `CANCELLED`): só resolve retirar a
+   chave dos atendimentos que não são do titular. Como fazê-lo (qual atendimento, com que registro
+   e se o processo correto é reaberto) é decisão da operação, nunca da DDL; a retirada limpa
+   `renach_process_key` e `renach_process_type` juntos (`ck_ch_encounter_renach_process_pair`).
+3. Reaplique a DDL; o bloco não varre a tabela quando o índice já existe.
diff --git a/docs/framework/arch/teat-error-catalog.md b/docs/framework/arch/teat-error-catalog.md
index 6712817e..c7497f9d 100644
--- a/docs/framework/arch/teat-error-catalog.md
+++ b/docs/framework/arch/teat-error-catalog.md
@@ -40,20 +40,20 @@ de origem para manter compatibilidade com o cliente móvel já validado.

 ## 2. Bootstrap, sessão, dispositivo e turno

-| Código                                                                               | Status                                     | Quando                                                             | `context`                      | UI                                                  |
-| ------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------ | --------------------------------------------------- |
-| `TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH`                                               | 403                                        | tenant/principal/dispositivo não conferem                          | —                              | `device-blocked`                                    |
-| `TEAT.SESSION_NOT_EXCLUSIVE`                                                         | 409                                        | sessão do agente ativa em outro dispositivo                        | `otherDeviceId`, `since`       | `device-handoff` (D-01) ou aguardar                 |
-| `TEAT.DEVICE_NOT_AUTHORIZED` · `TEAT.DEVICE_BLOCKED` · `TEAT.DEVICE_TAMPER_DETECTED` | 403                                        | postura do dispositivo                                             | `deviceId`, `status`           | `device-blocked`                                    |
-| `TEAT.DEVICE_NOT_HOMOLOGATED` · `TEAT.APP_VERSION_NOT_ALLOWED`                       | 403                                        | homologação/versão fora de validade ([RN-TEAT-003], [RN-TEAT-117]) | `homologationId`, `appVersion` | `device-blocked` com orientação                     |
-| `TEAT.PROTOCOL_VERSION_UNSUPPORTED`                                                  | 426                                        | `protocol_version` antiga                                          | `supported[]`                  | atualizar app                                       |
-| `TEAT.AGENT_NOT_ACTIVE` · `TEAT.AGENT_NOT_IN_UNIT` · `TEAT.AGENT_CREDENTIAL_EXPIRED` | 403                                        | perfil funcional                                                   | `agentId`                      | bloqueio com orientação                             |
-| `TEAT.SHIFT_ALREADY_OPEN`                                                            | 409                                        | turno aberto no mesmo ou em outro dispositivo                      | `shiftId`, `deviceId`          | retomar turno / handoff                             |
-| `TEAT.SHIFT_NOT_OPEN`                                                                | 409                                        | ato legal sem turno                                                | —                              | `open-shift`                                        |
-| `TEAT.SHIFT_CLOSE_PENDING_QUEUE`                                                     | 422                                        | fechar turno com itens `pending`                                   | `pendingCount`                 | sincronizar antes (ou fechar com pendência marcada) |
-| `TEAT.NORMATIVE_PACKAGE_MISSING` · `…_HASH_MISMATCH`                                 | 422                                        | pacote ausente ou adulterado ([RN-TEAT-003])                       | `packageId`, `manifestHash`    | reinstalar pacote                                   |
-| `TEAT.NORMATIVE_PACKAGE_EXPIRED`                                                     | aviso (`readiness.warnings[]`), nunca erro | pacote vencido em campo sem conectividade (steering E.29)          | `packageId`, `validUntil`      | banner persistente; o ato registra o pacote usado   |
-| `TEAT.OFFLINE_GRANT_EXPIRED` · `…_REVOKED` · `…_LIMIT_REACHED`                       | 403                                        | provisionamento offline (WP-T5)                                    | `grantId`, `limit`             | reconciliar/renovar                                 |
+| Código                                                                               | Status                                     | Quando                                                                                                                         | `context`                      | UI                                                                               |
+| ------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------- |
+| `TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH`                                               | 403                                        | tenant/principal/dispositivo não conferem                                                                                      | —                              | `device-blocked`                                                                 |
+| `TEAT.SESSION_NOT_EXCLUSIVE`                                                         | 409                                        | sessão do agente ativa em outro dispositivo                                                                                    | `otherDeviceId`, `since`       | `device-handoff` (D-01) ou aguardar                                              |
+| `TEAT.DEVICE_NOT_AUTHORIZED` · `TEAT.DEVICE_BLOCKED` · `TEAT.DEVICE_TAMPER_DETECTED` | 403                                        | postura do dispositivo                                                                                                         | `deviceId`, `status`           | `device-blocked`                                                                 |
+| `TEAT.DEVICE_NOT_HOMOLOGATED` · `TEAT.APP_VERSION_NOT_ALLOWED`                       | 403                                        | homologação/versão fora de validade ([RN-TEAT-003], [RN-TEAT-117])                                                             | `homologationId`, `appVersion` | `device-blocked` com orientação                                                  |
+| `TEAT.PROTOCOL_VERSION_UNSUPPORTED`                                                  | 426                                        | `protocol_version` antiga                                                                                                      | `supported[]`                  | atualizar app                                                                    |
+| `TEAT.AGENT_NOT_ACTIVE` · `TEAT.AGENT_NOT_IN_UNIT` · `TEAT.AGENT_CREDENTIAL_EXPIRED` | 403                                        | perfil funcional                                                                                                               | `agentId`                      | bloqueio com orientação                                                          |
+| `TEAT.SHIFT_ALREADY_OPEN`                                                            | 409                                        | turno aberto no mesmo ou em outro dispositivo                                                                                  | `shiftId`, `deviceId`          | retomar turno / handoff                                                          |
+| `TEAT.SHIFT_NOT_OPEN`                                                                | 409                                        | ato legal sem turno                                                                                                            | —                              | `open-shift`                                                                     |
+| `TEAT.SHIFT_CLOSE_PENDING_QUEUE`                                                     | 422                                        | fechar turno, sem `reason`, com itens `received` do dispositivo criados entre `started_at` e `ended_at` (CTG-0002 R-0008 §5.5) | `pendingCount`                 | sincronizar antes (ou fechar com `reason`: a pendência vai para `TURNO_FECHADO`) |
+| `TEAT.NORMATIVE_PACKAGE_MISSING` · `…_HASH_MISMATCH`                                 | 422                                        | pacote ausente ou adulterado ([RN-TEAT-003])                                                                                   | `packageId`, `manifestHash`    | reinstalar pacote                                                                |
+| `TEAT.NORMATIVE_PACKAGE_EXPIRED`                                                     | aviso (`readiness.warnings[]`), nunca erro | pacote vencido em campo sem conectividade (steering E.29)                                                                      | `packageId`, `validUntil`      | banner persistente; o ato registra o pacote usado                                |
+| `TEAT.OFFLINE_GRANT_EXPIRED` · `…_REVOKED` · `…_LIMIT_REACHED`                       | 403                                        | provisionamento offline (WP-T5)                                                                                                | `grantId`, `limit`             | reconciliar/renovar                                                              |

 ## 3. AIT — ciclo de vida, conteúdo e correção

diff --git a/docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json b/docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json
index 8e8aa622..7c968c17 100644
--- a/docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json
+++ b/docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Encounters",
     "namespace": "ch",
-    "version": "1.2.0",
+    "version": "1.2.1",
     "ddlFile": "42-ch-encounters.sql",
     "dependencies": {
       "@detran/ch-clinical-network": "workspace:*",
@@ -35,7 +35,7 @@
       }
     ],
     "owners": ["detran-ch"],
-    "description": "Agendamentos e atendimentos clinicos do PEC. O ciclo de vida implementa WF-PEC-001 e torna CANCELLED alcancavel com motivo auditavel."
+    "description": "Agendamentos e atendimentos clinicos do PEC. O ciclo de vida implementa WF-PEC-001 e torna CANCELLED alcancavel com motivo auditavel. A chave de processo RENACH e unica por tenant (um processo RENACH pertence a um so paciente; OD-HF-B9-001 = (a), Owner 2026-09-29): indice unico parcial ux_ch_encounter_renach_process_key, com pre-checagem de duplicatas no DDL manuscrito 19-ch-encounter-renach-key.sql."
   },
   "database": {
     "entities": [
@@ -300,8 +300,8 @@
             "columns": ["tenant_id", "patient_id"]
           },
           {
-            "name": "ux_ch_encounter_renach_process",
-            "columns": ["tenant_id", "patient_id", "renach_process_key"],
+            "name": "ux_ch_encounter_renach_process_key",
+            "columns": ["tenant_id", "renach_process_key"],
             "unique": true,
             "where": "renach_process_key is not null"
           }
diff --git a/docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json b/docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json
index 6afcf6dd..3f412ca7 100644
--- a/docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json
+++ b/docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json
@@ -2,8 +2,8 @@
   "openapi": "3.1.0",
   "info": {
     "title": "Encounters — BP-CH-ENCOUNTERS-001",
-    "version": "1.2.0",
-    "description": "Agendamentos e atendimentos clinicos do PEC. O ciclo de vida implementa WF-PEC-001 e torna CANCELLED alcancavel com motivo auditavel.",
+    "version": "1.2.1",
+    "description": "Agendamentos e atendimentos clinicos do PEC. O ciclo de vida implementa WF-PEC-001 e torna CANCELLED alcancavel com motivo auditavel. A chave de processo RENACH e unica por tenant (um processo RENACH pertence a um so paciente; OD-HF-B9-001 = (a), Owner 2026-09-29): indice unico parcial ux_ch_encounter_renach_process_key, com pre-checagem de duplicatas no DDL manuscrito 19-ch-encounter-renach-key.sql.",
     "x-blueprint": "BP-CH-ENCOUNTERS-001",
     "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
   },
diff --git a/docs/meta/knowledge-base/open-decisions-rait.md b/docs/meta/knowledge-base/open-decisions-rait.md
index 67d23f30..8edda60f 100644
--- a/docs/meta/knowledge-base/open-decisions-rait.md
+++ b/docs/meta/knowledge-base/open-decisions-rait.md
@@ -433,9 +433,10 @@ decide apenas se a nova ADR a mantém ou a emenda por supersessão.

 ## Hotfix B9 — corridas "checa e depois grava" (2026-09-29)

-Registro do Engineer no hotfix fora da R-0022 (Adenda B9). Um item ficou parado porque a
-correção depende de uma regra de produto sem fonte única.
+Registro do Engineer no hotfix fora da R-0022 (Adenda B9). Os itens dependiam de regra de produto
+sem fonte única; o Owner decidiu ambos na Adenda B10 (2026-09-29).

-| ID           | Questão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Estado / premissa até decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Decisor | Afeta                                                                                                    |
-| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
-| OD-HF-B9-001 | **Unicidade da `renach_process_key`**: única por tenant (um processo RENACH liga um só atendimento, de qualquer paciente) ou única por (tenant, paciente, chave)? O código (`backend/app/src/pec-renach-process.service.ts`) rejeita a chave ligada a atendimento de **outro paciente**, mas a checagem roda sem bloqueio e o índice `ux_ch_encounter_renach_process` inclui `patient_id`: dois vínculos paralelos de pacientes diferentes gravam a mesma chave (prova vermelha no relatório do hotfix). | Pendente; nada alterado. Fontes divergentes: [APP-PEC] §`renach_process_key`, [UC-PEC-001] passo 3 e AC-PEC-001-2 e o glossário de domínio dizem (tenant, paciente, chave); `law/glossary/GE-028.json` diz "chave única" sem escopo; o código aplica unicidade por tenant de forma não atômica. Decidido "por tenant" → índice único parcial `(tenant_id, renach_process_key)` no BP-CH-ENCOUNTERS-001 (Architect) com 23505 → 409 atual. Decidido "por paciente" → retirar do código a checagem entre pacientes. | Owner   | `BP-CH-ENCOUNTERS-001`, `42-ch-encounters.sql`, `pec-renach-process.service.ts`, [UC-PEC-001], [APP-PEC] |
+| ID           | Questão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Estado / premissa até decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Decisor | Afeta                                                                                                    |
+| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
+| OD-HF-B9-001 | **Unicidade da `renach_process_key`**: única por tenant (um processo RENACH liga um só atendimento, de qualquer paciente) ou única por (tenant, paciente, chave)? O código (`backend/app/src/pec-renach-process.service.ts`) rejeita a chave ligada a atendimento de **outro paciente**, mas a checagem roda sem bloqueio e o índice `ux_ch_encounter_renach_process` inclui `patient_id`: dois vínculos paralelos de pacientes diferentes gravam a mesma chave (prova vermelha no relatório do hotfix). | **Decidida pelo Owner em 2026-09-29: (a)** (R-0022 Adenda B10) — a chave é única por tenant: um processo RENACH pertence a um só paciente. Aplicada no hotfix `fix/renach-process-key-tenant-unique`: BP-CH-ENCOUNTERS-001 v1.2.1 troca `ux_ch_encounter_renach_process` (com `patient_id`) pelo índice único parcial `ux_ch_encounter_renach_process_key` `(tenant_id, renach_process_key) where renach_process_key is not null`; pré-checagem de duplicatas no DDL manuscrito `19-ch-encounter-renach-key.sql` (o gerador desta base não tem `precheck`); 23505 → 409 existente; a checagem do serviço fica como mensagem de negócio. Prova: `backend/app/tests/integration/pec-renach-process-key-race.integration.spec.ts`. Resta ao Owner alinhar [APP-PEC], [UC-PEC-001] e o glossário de domínio, que ainda dizem (tenant, paciente, chave). | Owner   | `BP-CH-ENCOUNTERS-001`, `42-ch-encounters.sql`, `pec-renach-process.service.ts`, [UC-PEC-001], [APP-PEC] |
+| OD-HF-B9-002 | **Gate de motivo no fechamento de turno**: o catálogo `docs/framework/arch/teat-error-catalog.md` descrevia `TEAT.SHIFT_CLOSE_PENDING_QUEUE` como "itens `pending`", enquanto o contrato (CTG-0002 R-0008 §5.5) e `close-shift.command.ts` contam itens `received` do dispositivo no intervalo do turno. Mudar o protocolo ou alinhar o catálogo?                                                                                                                                                        | **Decidida pelo Owner em 2026-09-29: (a)** (R-0022 Adenda B10) — manter o protocolo do fechamento de turno e alinhar o catálogo ao contrato e ao código (`received`). Catálogo alinhado no hotfix `fix/renach-process-key-tenant-unique`; código e contrato inalterados.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Owner   | `teat-error-catalog.md`, `close-shift.command.ts`, CTG-0002 R-0008 §5.5                                  |
```

```json
{
  "mode": "delivery-review",
  "scope": "hotfix-renach-process-key-tenant-unique",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "…",
      "line": 1,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
