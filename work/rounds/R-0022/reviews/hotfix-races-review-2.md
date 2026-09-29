# Delivery-review — hotfix de corridas, ciclo 2 (restrito ao achado do ciclo 1)

> Reviewer da família oposta (Codex Sol 6, nível grande). Papel: **Auditor** (Art. 18), somente leitura
> na worktree `/Users/aarusso/Development/detran/.claude/worktrees/agent-adf590fcc0c00ecc6`. Responda
> **apenas** com o JSON.

Avalie só a correção do achado `high` do ciclo 1
(`/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9/work/rounds/R-0022/reviews/hotfix-races-review-1.json`)
e o texto novo: trava `dashboard.sweeper:<tenant>` no início de toda transação do `step()` do
`DashboardClockSweeper`, antes de qualquer trava de alerta; prova nova com duas instâncias A→B × B→A
pelo `runTenant` real (vermelha: `40P01`; verde: nenhum deadlock, nenhum passo abortado, um alerta por
chave). O worker declara que só o sweeper (passos 1, 2 e 4) chega às travas de alerta e que os
comandos de usuário não tomam a trava de tenant. Resultados: `dashboard-monitor` unit 231, integração
432, `typecheck`, `format:check`.

```diff
diff --git a/backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts b/backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts
index 3e2f4e62..b5b365a1 100644
--- a/backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts
+++ b/backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts
@@ -193,7 +193,19 @@ export class DashboardClockSweeper implements OnModuleInit, OnModuleDestroy {
     work: (tx: CycleSqlTransaction) => Promise<void>,
   ): Promise<void> {
     try {
-      await this.deps.database.tx(work);
+      await this.deps.database.tx(async (tx) => {
+        // Primeira trava de toda transação do sweeper: serializa os passos
+        // do mesmo tenant entre instâncias. Os passos 1 e 4 tomam várias
+        // travas de alerta em ordens independentes (timers por `due_at`,
+        // células por tabela); sem esta trava, A→B × B→A = deadlock.
+        await query(
+          tx,
+          `select pg_advisory_xact_lock(hashtextextended(
+             'dashboard.sweeper:' || $1, 0))`,
+          [report.tenantId],
+        );
+        await work(tx);
+      });
     } catch {
       report.skipped += 1;
     }
diff --git a/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts b/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts
index f6b64b73..1b6a41bb 100644
--- a/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts
+++ b/backend/domains/dashboard/monitor/tests/integration/detector-race.integration.spec.ts
@@ -8,17 +8,26 @@ import { randomUUID } from 'node:crypto';
 import pg from 'pg';
 import { afterAll, beforeAll, describe, expect, it } from 'vitest';
 
-import type { DetectionCell } from '../../src/handwritten/cycle/index.js';
+import {
+  DashboardClockSweeper,
+  type DashboardAlertService,
+  type DashboardDutyService,
+  type DashboardSweepReport,
+  type DetectionCell,
+} from '../../src/handwritten/cycle/index.js';
 import { FIXTURE_TENANT_ID, USERS } from '../fixtures/cycle-fixtures.js';
 import {
+  InMemorySweepDiscovery,
   buildCycle,
   ctxFor,
+  sweepTarget,
   type CycleDb,
   type CycleServices,
 } from '../support/cycle-harness.js';
 import {
   RaceSession,
   cloneDatabase,
+  deferred,
   interleave,
   summarize,
   type RaceDatabase,
@@ -117,4 +126,100 @@ describe('detector em duas instâncias (checa e depois grava)', () => {
     });
     expect(outcome.secondWhileFirstOpen).toBe('blocked');
   });
+
+  it('dado duas chaves quando duas instâncias do sweeper as detectam em ordem inversa (A→B × B→A) então nenhum passo aborta por deadlock e cada chave tem um alerta', async () => {
+    const refA = randomUUID();
+    const refB = randomUUID();
+    const target = sweepTarget(FIXTURE_TENANT_ID);
+    const errors: string[] = [];
+    const firstCellDone = [deferred(), deferred()];
+    const proceed = [deferred(), deferred()];
+
+    /** Instância do sweeper com os serviços reais; só a ordem das células do
+     * passo 4 é fixada (a do passo 1 segue os timers, a do passo 4 as
+     * tabelas — ordens independentes) e há um ponto de parada entre a
+     * primeira e a segunda chave, dentro da mesma transação. */
+    function instance(index: 0 | 1, session: RaceSession, order: string[]) {
+      const base = session.database(
+        FIXTURE_TENANT_ID,
+        USERS.integrationOperator,
+      );
+      const database = {
+        tx: async <T>(work: (tx: never) => Promise<T>): Promise<T> => {
+          try {
+            return await base.tx(work as never);
+          } catch (error) {
+            errors.push(String((error as { code?: unknown }).code));
+            throw error;
+          }
+        },
+      };
+      let detected = 0;
+      const alerts = Object.create(services.alerts) as DashboardAlertService;
+      alerts.fallbackCells = async () => order.map((ref) => cell(ref));
+      alerts.detect = async (tx, detection, ctx) => {
+        const result = await services.alerts.detect(tx, detection, ctx);
+        detected += 1;
+        if (detected === 1) {
+          firstCellDone[index]!.resolve();
+          await proceed[index]!.promise;
+        }
+        return result;
+      };
+      const duties = Object.create(services.duties) as DashboardDutyService;
+      duties.fallbackCells = async () => [];
+      return new DashboardClockSweeper({
+        clock: services.clock,
+        calendar: services.calendar,
+        discovery: new InMemorySweepDiscovery([target]),
+        database,
+        requestContext: { run: (_context, work) => work() },
+        timers: services.timers,
+        alerts,
+        duties,
+        freshness: services.freshness,
+        intervalMs: 0,
+      }).runTenant(target, NOW);
+    }
+
+    const runA: Promise<DashboardSweepReport> = instance(0, first, [
+      refA,
+      refB,
+    ]);
+    await firstCellDone[0]!.promise;
+    const runB: Promise<DashboardSweepReport> = instance(1, second, [
+      refB,
+      refA,
+    ]);
+    // T2 ou chega à primeira chave (sem serialização) ou bloqueia antes.
+    let secondState: 'holding' | 'blocked' | undefined;
+    void firstCellDone[1]!.promise.then(() => {
+      secondState ??= 'holding';
+    });
+    for (let probe = 0; probe < 400 && !secondState; probe += 1) {
+      const activity = await owner.query<{ wait_event_type: string | null }>(
+        'select wait_event_type from pg_stat_activity where pid = $1',
+        [second.pid],
+      );
+      if (activity.rows[0]?.wait_event_type === 'Lock') secondState = 'blocked';
+      else await new Promise((done) => setTimeout(done, 25));
+    }
+    expect(secondState).toBeDefined();
+    proceed[0]!.resolve();
+    proceed[1]!.resolve();
+    const reports = await Promise.all([runA, runB]);
+
+    expect(errors).not.toContain('40P01');
+    expect(reports.map((report) => report.skipped)).toEqual([0, 0]);
+    for (const objectRef of [refA, refB]) {
+      const alerts = await owner.query<{ id: string }>(
+        `select id from dashboard.alert
+          where tenant_id = $1 and indicator_code = 'IND-DASH-101'
+            and object_kind = 'case' and object_ref = $2`,
+        [FIXTURE_TENANT_ID, objectRef],
+      );
+      expect(alerts.rows).toHaveLength(1);
+    }
+    expect(secondState).toBe('blocked');
+  }, 60_000);
 });
```

```json
{"mode":"delivery-review","scope":"hotfix-check-then-write-races","cycle":2,"verdict":"PASS | REVIEW | FAIL","resolved":[1],"findings":[],"notes":["…"]}
```
