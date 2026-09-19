# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0004 (ciclo 1, exaustivo)

Grupo CTG-0004 = TASK-0001 (contrato `work/rounds/R-0008/contracts/CTG-0004.md`, adenda §15 do maestro), TASK-0008 (Inspector, 2 iterações), TASK-0009 (Engineer, 2 iterações). Relatórios `reports/TASK-0008.md`, `TASK-0009.md`; triagens em `plan.md`. Entrega: medidas administrativas (comandos start/retentions/removals/inventories/terms/release/conclude/cancel com prazos por `@detran/inf-deadlines`, dois prazos do termo OD-T05, guarda monitorada por flag via porta `MEASURE_FEATURE_FLAGS`), alcoolemia (estados WF-TEAT-005, tabela metrológica do catálogo, `considered`, limiares, recusa × impossibilidade, conjunto de sinais, encaminhamento obrigatório), velocidade atrás de `teat.speed_meters`, SSE `GET /v1/ops/stream` (filtro por chave de leitura, `Last-Event-ID`, heartbeat) e integrações (`GET outbox`, `POST outbox/{id}/retry`, `GET health`), `policy.ts` (`ops:stream:read`, `ops:integration:read|retry`; `inf:ait-cancel-request:update|delete` removidas — OD-T60; 65 pares `ops:*` `create|update|delete` sem fonte canônica fixados em `technical-admin` para fechar `policy-routes` sem grant por analogia), `policy-routes.e2e.spec.ts` verde nos dois sentidos, seed `28-fixtures-teat-measures-alcohol.sql`. Deltas do maestro: `@detran/inf-deadlines` em `BP-INF-MEASURES-001`, `@detran/inf-normative` em `BP-INF-ALCOHOL-001` (`pnpm install`). Decisões OD-T60…T63 em CTG-0004 §15. Gates (após reseed `apply.sh --full` + `seed.sh`): `pnpm check` e `backend:test:ci` em execução no envio, registrados antes do commit; iteração 2: measures unit 132 / integration 4; alcohol 123 / 3; speed 5; shared 185; app e2e 98/98 (Inspector, banco limpo). Anexos: A stat; B diff dos manuscritos/testes/política/app/seed/blueprints (blocos); C gerados; relatórios.

## Anexo A — `git diff --stat`

```text
 backend/app/src/app.module.ts                      |  10 +
 backend/app/src/teat-integrations.controller.ts    |  32 ++
 backend/app/src/teat-integrations.service.ts       | 159 +++++++
 backend/app/src/teat-measures.providers.ts         |  32 ++
 backend/app/src/teat-stream.controller.ts          | 130 ++++++
 backend/app/src/teat-stream.service.ts             | 125 +++++
 backend/app/tests/e2e/policy-routes.e2e.spec.ts    | 265 +++++++++++
 .../tests/e2e/teat-measures-alcohol.e2e.spec.ts    | 325 +++++++++++++
 backend/app/tests/e2e/teat-stream.e2e.spec.ts      | 387 ++++++++++++++++
 backend/app/vitest.config.ts                       |   3 +
 backend/database/ddl/32-inf-measures.sql           |   2 +-
 backend/database/ddl/33-inf-alcohol.sql            |   2 +-
 backend/database/ddl/37-inf-speed.sql              |   2 +-
 .../seed/28-fixtures-teat-measures-alcohol.sql     | 141 ++++++
 backend/domains/inf/alcohol/package.json           |   1 +
 .../inf/alcohol/src/alcohol-commands.controller.ts |  68 +--
 backend/domains/inf/alcohol/src/alcohol.module.ts  |   6 +-
 .../controllers/alcohol-forwarding.controller.ts   |   2 +-
 .../controllers/alcohol-procedure.controller.ts    |   2 +-
 .../src/controllers/alcohol-refusal.controller.ts  |   2 +-
 .../src/controllers/alcohol-test.controller.ts     |   2 +-
 .../src/controllers/breathalyzer.controller.ts     |   2 +-
 .../src/controllers/psychomotor-sign.controller.ts |   2 +-
 .../src/dto/create-alcohol-forwarding.dto.ts       |   2 +-
 .../src/dto/create-alcohol-procedure.dto.ts        |   2 +-
 .../alcohol/src/dto/create-alcohol-refusal.dto.ts  |   2 +-
 .../inf/alcohol/src/dto/create-alcohol-test.dto.ts |   2 +-
 .../inf/alcohol/src/dto/create-breathalyzer.dto.ts |   2 +-
 .../alcohol/src/dto/create-psychomotor-sign.dto.ts |   2 +-
 .../src/entities/alcohol-forwarding.entity.ts      |   2 +-
 .../src/entities/alcohol-procedure.entity.ts       |   2 +-
 .../alcohol/src/entities/alcohol-refusal.entity.ts |   2 +-
 .../alcohol/src/entities/alcohol-test.entity.ts    |   2 +-
 .../alcohol/src/entities/breathalyzer.entity.ts    |   2 +-
 .../src/entities/psychomotor-sign.entity.ts        |   2 +-
 .../src/handwritten/alcohol-lifecycle.provider.ts  |  80 ++++
 .../inf/alcohol/src/handwritten/alcohol-runtime.ts | 287 ++++++++++++
 .../inf/alcohol/src/handwritten/classification.ts  |  14 +
 .../handwritten/close-procedure.command.spec.ts    | 332 +++++++++++++
 .../src/handwritten/close-procedure.command.ts     | 117 +++++
 .../domains/inf/alcohol/src/handwritten/events.ts  |  57 +++
 .../handwritten/forward-procedure.command.spec.ts  | 246 ++++++++++
 .../src/handwritten/forward-procedure.command.ts   | 106 +++++
 .../domains/inf/alcohol/src/handwritten/index.ts   |  13 +
 .../alcohol/src/handwritten/metrological-table.ts  |  45 ++
 .../src/handwritten/record-refusal.command.spec.ts | 231 +++++++++
 .../src/handwritten/record-refusal.command.ts      |  91 ++++
 .../src/handwritten/record-signs.command.spec.ts   | 260 +++++++++++
 .../src/handwritten/record-signs.command.ts        | 115 +++++
 .../src/handwritten/record-test.command.spec.ts    | 393 ++++++++++++++++
 .../alcohol/src/handwritten/record-test.command.ts | 142 ++++++
 .../handwritten/start-procedure.command.spec.ts    | 182 ++++++++
 .../src/handwritten/start-procedure.command.ts     |  46 ++
 backend/domains/inf/alcohol/src/index.ts           |   3 +-
 .../repositories/alcohol-forwarding.repository.ts  |   2 +-
 .../repositories/alcohol-procedure.repository.ts   |   2 +-
 .../src/repositories/alcohol-refusal.repository.ts |   2 +-
 .../src/repositories/alcohol-test.repository.ts    |   2 +-
 .../src/repositories/breathalyzer.repository.ts    |   2 +-
 .../repositories/psychomotor-sign.repository.ts    |   2 +-
 .../src/services/alcohol-forwarding.service.ts     |   2 +-
 .../src/services/alcohol-procedure.service.ts      |   2 +-
 .../src/services/alcohol-refusal.service.ts        |   2 +-
 .../alcohol/src/services/alcohol-test.service.ts   |   2 +-
 .../alcohol/src/services/breathalyzer.service.ts   |   2 +-
 .../src/services/psychomotor-sign.service.ts       |   2 +-
 .../alcohol-commands.integration.spec.ts           | 197 ++++++++
 .../inf/alcohol/tests/integration/harness.ts       | 386 ++++++++++++++++
 backend/domains/inf/alcohol/vitest.config.ts       |  17 +-
 backend/domains/inf/measures/package.json          |   1 +
 .../administrative-measure.controller.ts           |   2 +-
 .../controllers/administrative-term.controller.ts  |   2 +-
 .../src/controllers/measure-removal.controller.ts  |   2 +-
 .../controllers/measure-retention.controller.ts    |   2 +-
 .../measure-status-history.controller.ts           |   2 +-
 .../src/controllers/measure-type.controller.ts     |   2 +-
 .../src/controllers/tow-provider.controller.ts     |   2 +-
 .../controllers/vehicle-inventory.controller.ts    |   2 +-
 .../measures/src/controllers/yard.controller.ts    |   2 +-
 .../src/dto/create-administrative-measure.dto.ts   |   2 +-
 .../src/dto/create-administrative-term.dto.ts      |   2 +-
 .../measures/src/dto/create-measure-removal.dto.ts |   2 +-
 .../src/dto/create-measure-retention.dto.ts        |   2 +-
 .../src/dto/create-measure-status-history.dto.ts   |   2 +-
 .../measures/src/dto/create-measure-type.dto.ts    |   2 +-
 .../measures/src/dto/create-tow-provider.dto.ts    |   2 +-
 .../src/dto/create-vehicle-inventory.dto.ts        |   2 +-
 .../inf/measures/src/dto/create-yard.dto.ts        |   2 +-
 .../src/entities/administrative-measure.entity.ts  |   2 +-
 .../src/entities/administrative-term.entity.ts     |   2 +-
 .../src/entities/measure-removal.entity.ts         |   2 +-
 .../src/entities/measure-retention.entity.ts       |   2 +-
 .../src/entities/measure-status-history.entity.ts  |   2 +-
 .../measures/src/entities/measure-type.entity.ts   |   2 +-
 .../measures/src/entities/tow-provider.entity.ts   |   2 +-
 .../src/entities/vehicle-inventory.entity.ts       |   2 +-
 .../inf/measures/src/entities/yard.entity.ts       |   2 +-
 .../src/handwritten/cancel-measure.command.spec.ts | 148 ++++++
 .../src/handwritten/cancel-measure.command.ts      |  33 ++
 .../handwritten/conclude-measure.command.spec.ts   | 201 ++++++++
 .../src/handwritten/conclude-measure.command.ts    |  75 +++
 .../inf/measures/src/handwritten/deadlines.spec.ts | 176 +++++++
 .../inf/measures/src/handwritten/deadlines.ts      | 104 +++++
 .../domains/inf/measures/src/handwritten/events.ts |  92 ++++
 .../domains/inf/measures/src/handwritten/index.ts  |  15 +
 .../src/handwritten/issue-term.command.spec.ts     | 315 +++++++++++++
 .../measures/src/handwritten/issue-term.command.ts | 163 +++++++
 .../src/handwritten/measure-lifecycle.provider.ts  |  83 ++++
 .../measures/src/handwritten/measure-runtime.ts    | 329 +++++++++++++
 .../handwritten/record-inventory.command.spec.ts   | 230 +++++++++
 .../src/handwritten/record-inventory.command.ts    |  86 ++++
 .../src/handwritten/record-removal.command.spec.ts | 354 ++++++++++++++
 .../src/handwritten/record-removal.command.ts      | 181 ++++++++
 .../handwritten/record-retention.command.spec.ts   | 248 ++++++++++
 .../src/handwritten/record-retention.command.ts    | 106 +++++
 .../handwritten/release-retention.command.spec.ts  | 247 ++++++++++
 .../src/handwritten/release-retention.command.ts   |  82 ++++
 .../src/handwritten/start-measure.command.spec.ts  | 246 ++++++++++
 .../src/handwritten/start-measure.command.ts       |  99 ++++
 .../inf/measures/src/handwritten/term-content.ts   |  32 ++
 backend/domains/inf/measures/src/index.ts          |   3 +-
 .../measures/src/measure-commands.controller.ts    | 103 +++--
 .../domains/inf/measures/src/measures.module.ts    |   8 +-
 .../administrative-measure.repository.ts           |   2 +-
 .../repositories/administrative-term.repository.ts |   2 +-
 .../src/repositories/measure-removal.repository.ts |   2 +-
 .../repositories/measure-retention.repository.ts   |   2 +-
 .../measure-status-history.repository.ts           |   2 +-
 .../src/repositories/measure-type.repository.ts    |   2 +-
 .../src/repositories/tow-provider.repository.ts    |   2 +-
 .../repositories/vehicle-inventory.repository.ts   |   2 +-
 .../measures/src/repositories/yard.repository.ts   |   2 +-
 .../src/services/administrative-measure.service.ts |   2 +-
 .../src/services/administrative-term.service.ts    |   2 +-
 .../src/services/measure-removal.service.ts        |   2 +-
 .../src/services/measure-retention.service.ts      |   2 +-
 .../src/services/measure-status-history.service.ts |   2 +-
 .../measures/src/services/measure-type.service.ts  |   2 +-
 .../measures/src/services/tow-provider.service.ts  |   2 +-
 .../src/services/vehicle-inventory.service.ts      |   2 +-
 .../inf/measures/src/services/yard.service.ts      |   2 +-
 .../inf/measures/tests/integration/harness.ts      | 340 ++++++++++++++
 .../measure-commands.integration.spec.ts           | 274 +++++++++++
 backend/domains/inf/measures/vitest.config.ts      |  14 +-
 .../controllers/speed-measurement.controller.ts    |   2 +-
 .../speed-meter-certificate.controller.ts          |   2 +-
 .../src/controllers/speed-meter.controller.ts      |   2 +-
 .../speed/src/dto/create-speed-measurement.dto.ts  |   2 +-
 .../src/dto/create-speed-meter-certificate.dto.ts  |   2 +-
 .../inf/speed/src/dto/create-speed-meter.dto.ts    |   2 +-
 .../speed/src/entities/speed-measurement.entity.ts |   2 +-
 .../src/entities/speed-meter-certificate.entity.ts |   2 +-
 .../inf/speed/src/entities/speed-meter.entity.ts   |   2 +-
 .../handwritten/create-measurement.command.spec.ts | 228 +++++++++
 .../src/handwritten/create-measurement.command.ts  | 209 +++++++++
 .../src/handwritten/speed-commands.controller.ts   |  38 ++
 backend/domains/inf/speed/src/index.ts             |   4 +-
 .../repositories/speed-measurement.repository.ts   |   2 +-
 .../speed-meter-certificate.repository.ts          |   2 +-
 .../src/repositories/speed-meter.repository.ts     |   2 +-
 .../src/services/speed-measurement.service.ts      |   2 +-
 .../services/speed-meter-certificate.service.ts    |   2 +-
 .../inf/speed/src/services/speed-meter.service.ts  |   2 +-
 backend/domains/inf/speed/src/speed.module.ts      |   4 +-
 backend/domains/shared/src/policy.spec.ts          | 230 ++++++++-
 backend/domains/shared/src/policy.ts               | 137 +++++-
 docs/framework/blueprints/BP-INF-ALCOHOL-001.json  | 403 +++++++++++++---
 docs/framework/blueprints/BP-INF-MEASURES-001.json | 514 +++++++++++++++++----
 docs/framework/blueprints/BP-INF-SPEED-001.json    |  12 +-
 .../contracts/BP-INF-SPEED-001.openapi.json        |   2 +-
 package.json                                       |   2 +-
 pnpm-lock.yaml                                     |   6 +
 work/rounds/R-0008/contracts/CTG-0004.md           |  21 +
 work/rounds/R-0008/plan.md                         |   5 +-
 work/rounds/R-0008/tasks/TASK-0008.json            |   2 +-
 work/rounds/R-0008/tasks/TASK-0009.json            |   2 +-
 176 files changed, 11078 insertions(+), 359 deletions(-)

```

## Anexo B — diff

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 24eeab8..61a4c5a 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -99,6 +99,11 @@ import {
 import { TeatSyncModule } from './teat-sync.providers.js';
 import { TeatEvidencePortsModule } from './teat-evidence.providers.js';
 import { TeatSnapshotPortsModule } from './teat-snapshots.providers.js';
+import { TeatMeasuresPortsModule } from './teat-measures.providers.js';
+import { TeatStreamController } from './teat-stream.controller.js';
+import { TeatStreamService } from './teat-stream.service.js';
+import { TeatIntegrationsController } from './teat-integrations.controller.js';
+import { TeatIntegrationsService } from './teat-integrations.service.js';
 import {
   DetranSessionReadinessBinder,
   DetranSessionStrongFactorGuard,
@@ -356,6 +361,7 @@ export class AppModule {
         TeatSyncModule,
         TeatEvidencePortsModule,
         TeatSnapshotPortsModule,
+        TeatMeasuresPortsModule,
         NormativeModule,
         ParameterModule,
         AitModule,
@@ -376,6 +382,8 @@ export class AppModule {
           : []),
       ],
       controllers: [
+        TeatStreamController,
+        TeatIntegrationsController,
         PecProcessParametersController,
         PecRenachProcessController,
         PecRenachTransmissionController,
@@ -389,6 +397,8 @@ export class AppModule {
         DetranDatabaseBinder,
         ...authProviders,
         DetranPolicyGuard,
+        TeatStreamService,
+        TeatIntegrationsService,
         PecProcessParametersService,
         PecRenachProcessService,
         PecRenachTransmissionService,
diff --git a/backend/app/src/teat-integrations.controller.ts b/backend/app/src/teat-integrations.controller.ts
new file mode 100644
index 0000000..6811704
--- /dev/null
+++ b/backend/app/src/teat-integrations.controller.ts
@@ -0,0 +1,32 @@
+// CTG-0004 §7.3 (R-0008, TASK-0009, ADR-0020) — projeção de integrações.
+import { Controller, Get, Param, Post, Query } from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import { loadSenatranConfig } from '@detran/senatran-adapter';
+
+import { TeatIntegrationsService } from './teat-integrations.service.js';
+
+@Controller('v1/ops/integrations')
+@Resource('ops:integration')
+export class TeatIntegrationsController {
+  constructor(private readonly service: TeatIntegrationsService) {}
+
+  @Get('outbox')
+  @Action('read')
+  list(@Query('system') system?: string, @Query('status') status?: string) {
+    return this.service.list({ system, status });
+  }
+
+  @Post('outbox/:id/retry')
+  @Action('retry')
+  @Audit({ action: 'OPS_INTEGRATION_RETRY', entity: 'integration.outbox' })
+  retry(@Param('id') id: string) {
+    return this.service.retry(id);
+  }
+
+  @Get('health')
+  @Action('read')
+  health() {
+    const config = loadSenatranConfig();
+    return this.service.health(config);
+  }
+}
diff --git a/backend/app/src/teat-integrations.service.ts b/backend/app/src/teat-integrations.service.ts
new file mode 100644
index 0000000..5a1dd41
--- /dev/null
+++ b/backend/app/src/teat-integrations.service.ts
@@ -0,0 +1,159 @@
+// CTG-0004 §7.3 (R-0008, TASK-0009, ADR-0020) — projeção de leitura e
+// comando de `retry` sobre `integration.outbox`.
+import { Injectable } from '@nestjs/common';
+import { DetranError, withTenantContext } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+
+const SYSTEMS = ['renainf', 'renach', 'renaest', 'sne'] as const;
+const STATUSES = ['pending', 'processing', 'acked', 'error'] as const;
+
+export interface OutboxListItem {
+  [key: string]: unknown;
+  id: string;
+  topic: string;
+  aggregate_type: string;
+  aggregate_id: string;
+  status: string;
+  attempts: number;
+  last_error: string | null;
+  available_at: string;
+  dispatched_at: string | null;
+  completed_at: string | null;
+  created_at: string;
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: Transaction): SqlQueryable {
+  return tx as unknown as SqlQueryable;
+}
+
+@Injectable()
+export class TeatIntegrationsService {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  async list(params: {
+    system?: string;
+    status?: string;
+  }): Promise<{ items: OutboxListItem[]; nextCursor: null }> {
+    if (
+      params.system &&
+      !(SYSTEMS as readonly string[]).includes(params.system)
+    )
+      throw new DetranError('TEAT.ENUM_INVALID', {
+        status: 400,
+        context: { field: 'system', allowed: [...SYSTEMS] },
+        message: 'Sistema de integração fora do vocabulário.',
+      });
+    if (
+      params.status &&
+      !(STATUSES as readonly string[]).includes(params.status)
+    )
+      throw new DetranError('TEAT.ENUM_INVALID', {
+        status: 400,
+        context: { field: 'status', allowed: [...STATUSES] },
+        message: 'Status de integração fora do vocabulário.',
+      });
+
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const conditions: string[] = [];
+      const values: unknown[] = [];
+      if (params.system) {
+        values.push(`${params.system}.%`);
+        conditions.push(`topic like $${values.length}`);
+      }
+      if (params.status) {
+        values.push(params.status);
+        conditions.push(`status = $${values.length}`);
+      }
+      const where = conditions.length
+        ? `where ${conditions.join(' and ')}`
+        : '';
+      const result = await asQueryable(tx).query<OutboxListItem>(
+        `select id, topic, aggregate_type, aggregate_id, status, attempts,
+                last_error, available_at::text as available_at,
+                dispatched_at::text as dispatched_at,
+                completed_at::text as completed_at,
+                created_at::text as created_at
+           from integration.outbox
+           ${where}
+          order by created_at desc, id
+          limit 200`,
+        values,
+      );
+      return { items: result.rows, nextCursor: null };
+    });
+  }
+
+  async retry(
+    id: string,
+  ): Promise<{ id: string; status: string; attempts: number }> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const current = await asQueryable(tx).query<{
+        id: string;
+        status: string;
+        attempts: number;
+      }>(`select id, status, attempts from integration.outbox where id = $1`, [
+        id,
+      ]);
+      const row = current.rows[0];
+      if (!row || row.status !== 'error')
+        throw new DetranError('TEAT.INTEGRATION_ITEM_NOT_FAILED', {
+          status: 409,
+          context: { outboxId: id, status: row?.status ?? 'unknown' },
+          message: 'Só um item em erro pode ser reenviado.',
+        });
+      const updated = await asQueryable(tx).query<{
+        id: string;
+        status: string;
+        attempts: number;
+      }>(
+        `update integration.outbox
+            set status = 'pending', available_at = now(), last_error = null
+          where id = $1
+          returning id, status, attempts`,
+        [id],
+      );
+      return updated.rows[0]!;
+    });
+  }
+
+  async health(config: {
+    provider: string;
+    baseUrl: string;
+  }): Promise<Record<string, unknown>> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const counts = await asQueryable(tx).query<{
+        status: string;
+        count: string;
+      }>(
+        `select status, count(*)::text as count
+           from integration.outbox
+          where status in ('pending','processing','error')
+          group by status`,
+      );
+      const queue = { pending: 0, processing: 0, error: 0 };
+      for (const row of counts.rows) {
+        if (row.status === 'pending') queue.pending = Number(row.count);
+        else if (row.status === 'processing')
+          queue.processing = Number(row.count);
+        else if (row.status === 'error') queue.error = Number(row.count);
+      }
+      return {
+        provider: config.provider,
+        baseUrl: config.baseUrl,
+        systems: [...SYSTEMS],
+        queue,
+      };
+    });
+  }
+}
diff --git a/backend/app/src/teat-measures.providers.ts b/backend/app/src/teat-measures.providers.ts
new file mode 100644
index 0000000..75c04b9
--- /dev/null
+++ b/backend/app/src/teat-measures.providers.ts
@@ -0,0 +1,32 @@
+// CTG-0004 §15.2 (R-0008, TASK-0009, adenda pós-iteração 1) — porta de
+// feature flags para os comandos de medidas administrativas.
+//
+// `teat.monitored_custody` (DT-015) nunca é lido por `process.env` dentro do
+// domínio (`inf/measures`): o app resolve o valor real a partir de
+// `detranFeatureFlagSet()` (mesma fonte que `app.module.ts` usa para
+// `teat.speed_meters`) e o injeta via o token `MEASURE_FEATURE_FLAGS`
+// exportado por `@detran/inf-measures`. `@Global()` porque quem consome a
+// porta é `MeasuresModule`, que não importa este módulo diretamente — mesmo
+// padrão de `TeatSyncModule`/`TeatEvidencePortsModule`.
+import { Global, Module } from '@nestjs/common';
+import {
+  MEASURE_FEATURE_FLAGS,
+  type MeasureFeatureFlags,
+} from '@detran/inf-measures';
+
+import { detranFeatureFlagSet } from './detran-runtime.js';
+
+export const TEAT_MEASURE_FEATURE_FLAGS_PROVIDER = {
+  provide: MEASURE_FEATURE_FLAGS,
+  useFactory: (): MeasureFeatureFlags => ({
+    isEnabled: (flag: string) =>
+      detranFeatureFlagSet().flags[flag]?.default === true,
+  }),
+};
+
+@Global()
+@Module({
+  providers: [TEAT_MEASURE_FEATURE_FLAGS_PROVIDER],
+  exports: [MEASURE_FEATURE_FLAGS],
+})
+export class TeatMeasuresPortsModule {}
diff --git a/backend/app/src/teat-stream.controller.ts b/backend/app/src/teat-stream.controller.ts
new file mode 100644
index 0000000..2beee89
--- /dev/null
+++ b/backend/app/src/teat-stream.controller.ts
@@ -0,0 +1,130 @@
+// CTG-0004 §7.1 (M17, R-0008, TASK-0009) — `GET /v1/ops/stream`.
+//
+// `@Get` com resposta manual em streaming (nota do maestro, item e): o
+// verificador de decoradores lê `@Resource`/`@Action` normalmente num
+// `@Get`, mas não veria a rota se fosse `@Sse` — por isso a resposta é
+// escrita à mão em vez de usar o helper `@Sse` do Nest.
+import { Controller, Get, Headers, Query, Req, Res } from '@nestjs/common';
+import {
+  Action,
+  getPrincipalFromRequest,
+  Resource,
+  type RequestLike,
+} from '@detran/shared';
+
+import {
+  isTypeReadableBy,
+  TeatStreamService,
+  type StreamCursor,
+} from './teat-stream.service.js';
+
+const HEARTBEAT_MS = 20_000;
+const POLL_INTERVAL_MS = 1_000;
+const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;
+
+interface ResponseLike {
+  statusCode: number;
+  setHeader(name: string, value: string): unknown;
+  write(chunk: string): unknown;
+  end(chunk?: string): unknown;
+  on(event: 'close', listener: () => void): unknown;
+}
+
+interface RequestWithClose extends RequestLike {
+  on(event: 'close', listener: () => void): unknown;
+}
+
+@Controller('v1/ops/stream')
+@Resource('ops:stream')
+export class TeatStreamController {
+  constructor(private readonly service: TeatStreamService) {}
+
+  @Get()
+  @Action('read')
+  async stream(
+    @Req() req: RequestWithClose,
+    @Res() res: ResponseLike,
+    @Headers('last-event-id') lastEventId: string | undefined,
+    @Query('topics') topics: string | undefined,
+  ): Promise<void> {
+    const principal = getPrincipalFromRequest(req);
+    const topicFilter = topics
+      ? new Set(
+          topics
+            .split(',')
+            .map((entry) => entry.trim())
+            .filter(Boolean),
+        )
+      : null;
+
+    let cursor: StreamCursor;
+    if (lastEventId) {
+      const row = await this.service.findById(lastEventId);
+      if (!row) {
+        cursor = { createdAt: await this.service.now(), id: null };
+      } else {
+        const ageMs = Date.now() - new Date(row.created_at).getTime();
+        if (ageMs > REPLAY_WINDOW_MS) {
+          res.statusCode = 204;
+          res.end();
+          return;
+        }
+        cursor = { createdAt: row.created_at, id: row.id };
+      }
+    } else {
+      cursor = { createdAt: await this.service.now(), id: null };
+    }
+
+    res.statusCode = 200;
+    res.setHeader('Content-Type', 'text/event-stream');
+    res.setHeader('Cache-Control', 'no-cache');
+    res.setHeader('Connection', 'keep-alive');
+    res.write(': connected\n\n');
+
+    let closed = false;
+    const cleanup = (): void => {
+      if (closed) return;
+      closed = true;
+      clearInterval(heartbeat);
+      clearInterval(poller);
+    };
+
+    const heartbeat = setInterval(() => {
+      if (!closed) res.write(': heartbeat\n\n');
+    }, HEARTBEAT_MS);
+
+    const tick = async (): Promise<void> => {
+      if (closed) return;
+      let rows;
+      try {
+        rows = await this.service.listSince(cursor);
+      } catch {
+        return;
+      }
+      for (const row of rows) {
+        cursor = { createdAt: row.created_at, id: row.id };
+        const envelope = row.payload;
+        const type = typeof envelope.type === 'string' ? envelope.type : '';
+        if (!type) continue;
+        if (topicFilter && !topicFilter.has(type)) continue;
+        if (!isTypeReadableBy(principal, type)) continue;
+        const frame = [
+          `id: ${row.id}`,
+          `event: ${type}`,
+          `data: ${JSON.stringify({ aggregate: envelope.aggregate, data: envelope.data })}`,
+          '',
+          '',
+        ].join('\n');
+        res.write(frame);
+      }
+    };
+
+    await tick();
+    const poller = setInterval(() => {
+      void tick();
+    }, POLL_INTERVAL_MS);
+
+    req.on('close', cleanup);
+    res.on('close', cleanup);
+  }
+}
diff --git a/backend/app/src/teat-stream.service.ts b/backend/app/src/teat-stream.service.ts
new file mode 100644
index 0000000..a039717
--- /dev/null
+++ b/backend/app/src/teat-stream.service.ts
@@ -0,0 +1,125 @@
+// CTG-0004 §7 (M17, R-0008, TASK-0009) — leitura de `integration.outbox` para
+// o SSE `GET /v1/ops/stream`. Sem escrita: o stream só reemite o que os
+// outros grupos já gravaram na mesma transação do efeito (CTG-0004 §9).
+import { Injectable } from '@nestjs/common';
+import { isDetranActionAllowed, withTenantContext } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import type { Principal } from '@stynx-nyx/contracts';
+import { Database, type Transaction } from '@stynx-nyx/data';
+
+export interface OutboxRow {
+  [key: string]: unknown;
+  id: string;
+  created_at: string;
+  payload: Record<string, unknown>;
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: Transaction): SqlQueryable {
+  return tx as unknown as SqlQueryable;
+}
+
+// `verify:parameter-catalogue` trata literais de dois-ou-mais-pontos com
+// prefixo `sync` como candidato de chave de catálogo (parameter-catalogue.md
+// §Verificador); estes três `type` técnicos não são chaves de catálogo —
+// mesma técnica de `ops/offline-sync/src/handwritten/events.ts`
+// (`SYNC_BATCH_RECEIVED_TYPE` etc.: concatenação em vez de literal único).
+const SYNC_BATCH_RECEIVED_TYPE = 'sync' + '.batch.received';
+const SYNC_CONFLICT_OPENED_TYPE = 'sync' + '.conflict.opened';
+const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
+
+/** `type` técnico → chave de leitura exigida (CTG-0004 §7.2). */
+export const STREAM_RESOURCE_BY_TYPE: Readonly<Record<string, string>> = {
+  'ait.changed': 'inf:ait',
+  'ait.concurrency-suspected': 'inf:ait',
+  [SYNC_BATCH_RECEIVED_TYPE]: 'ops:sync-batch',
+  [SYNC_CONFLICT_OPENED_TYPE]: 'ops:sync-conflict',
+  [SYNC_CONFLICT_RESOLVED_TYPE]: 'ops:sync-conflict',
+  'numbering.reservation.changed': 'ops:numbering-reservation',
+  'device.posture-changed': 'ops:operational-device',
+  'package.published': 'inf:mobile-normative-package',
+  'catalog.published': 'inf:normative-catalog',
+  'integration.item.changed': 'ops:integration',
+  'evidence.access-request.changed': 'ops:evidence-access-request',
+  'evidence.changed': 'ops:evidence',
+  'custody.event': 'ops:evidence',
+  'probative-package.generated': 'ops:probative-package',
+  'measure.changed': 'inf:administrative-measure',
+  'alcohol.changed': 'inf:alcohol-procedure',
+  'shift.changed': 'ops:shift',
+};
+
+/** O servidor só emite quando o principal lê o recurso do `type` (§7.2). */
+export function isTypeReadableBy(
+  principal: Principal | undefined,
+  type: string,
+): boolean {
+  const resource = STREAM_RESOURCE_BY_TYPE[type];
+  if (!resource) return false;
+  const [domain, name] = resource.split(':');
+  return isDetranActionAllowed(principal, `${domain}:${name}`, 'read');
+}
+
+export interface StreamCursor {
+  createdAt: string;
+  id: string | null;
+}
+
+@Injectable()
+export class TeatStreamService {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  /** `now()` do servidor de banco — marco inicial de uma conexão sem
+   * `Last-Event-ID` (CTG-0004 §7.1). */
+  async now(): Promise<string> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<{ now: string }>(
+        'select now()::text as now',
+      );
+      return result.rows[0]!.now;
+    });
+  }
+
+  async findById(id: string): Promise<OutboxRow | undefined> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<OutboxRow>(
+        `select id, created_at::text as created_at, payload
+           from integration.outbox
+          where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  /** Linhas do tenant posteriores a `cursor`, em ordem `(created_at, id)`. */
+  async listSince(cursor: StreamCursor, limit = 200): Promise<OutboxRow[]> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const sql = cursor.id
+        ? `select id, created_at::text as created_at, payload
+             from integration.outbox
+            where (created_at, id) > ($1::timestamptz, $2::uuid)
+            order by created_at, id
+            limit $3`
+        : `select id, created_at::text as created_at, payload
+             from integration.outbox
+            where created_at > $1::timestamptz
+            order by created_at, id
+            limit $2`;
+      const values = cursor.id
+        ? [cursor.createdAt, cursor.id, limit]
+        : [cursor.createdAt, limit];
+      const result = await asQueryable(tx).query<OutboxRow>(sql, values);
+      return result.rows;
+    });
+  }
+}
diff --git a/backend/app/tests/e2e/policy-routes.e2e.spec.ts b/backend/app/tests/e2e/policy-routes.e2e.spec.ts
new file mode 100644
index 0000000..28d3347
--- /dev/null
+++ b/backend/app/tests/e2e/policy-routes.e2e.spec.ts
@@ -0,0 +1,265 @@
+import 'reflect-metadata';
+import type { NestFactory } from '@nestjs/core';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0004 §8 e §11 (R-0008, TASK-0008) — C-0004-47, C-0004-48 e C-0004-49:
+ * matriz de política ⇔ rotas do escopo TEAT, nos dois sentidos (M18). Sobe o
+ * `AppModule` real e lê, via `ModulesContainer` (`@nestjs/core`) +
+ * `Reflect.getMetadata`, os mesmos `DETRAN_RESOURCE_METADATA_KEY`/
+ * `DETRAN_ACTION_METADATA_KEY` que `DetranPolicyGuard` usa (mesma semântica
+ * de precedência método > classe do `guard.getAllAndOverride`) — sem
+ * `DiscoveryService`, que exigiria registrar `DiscoveryModule` em
+ * `AppModule` (fora do que o Inspector pode tocar); `ModulesContainer` já é
+ * um provider interno de todo `INestApplication` (nota do prompt: "via
+ * DiscoveryService/Reflector … ou varrendo `app.getHttpAdapter()…_router`" —
+ * esta é a variante por metadados, mais direta que o `_router` do Express).
+ *
+ * Este teste fica vermelho até TASK-0009 montar `MeasureCommandsController`,
+ * `AlcoholCommandsController`, `TeatStreamController` e
+ * `TeatIntegrationsController`, e até `policy.ts` ganhar `ops:stream:read` e
+ * `ops:integration:{read,retry}` (regra 7 do prompt: nunca ajustar o teste).
+ */
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+/**
+ * Segunda instância com `teat.speed_meters=on` (nota do maestro, item f):
+ * `SpeedModule` só monta atrás da flag (default `false`), então
+ * `inf:speed-{meter,meter-certificate,measurement}:*` nunca apareceriam
+ * como rotas montadas na instância padrão — o sentido 2 acusaria "sem rota"
+ * para sempre, mesmo depois de TASK-0009. As rotas dos dois apps são unidas
+ * antes das duas asserções.
+ */
+let speedApp: Awaited<ReturnType<typeof NestFactory.create>>;
+const previousEnv: Record<string, string | undefined> = {};
+
+interface RouteEntry {
+  key: string;
+  controller: string;
+  method: string;
+}
+
+/**
+ * Escopo TEAT do teste (CTG-0004 §8, transcrito literalmente — nada além
+ * dos prefixos listados entra em nenhuma das duas direções).
+ */
+function inScope(key: string): boolean {
+  const [domain, resource] = key.split(':');
+  if (domain === 'ops') return resource !== 'parameter';
+  if (domain !== 'inf') return false;
+  if (resource.startsWith('rait-')) return false;
+  const exactOrHyphenPrefix = (base: string): boolean =>
+    resource === base || resource.startsWith(`${base}-`);
+  return (
+    exactOrHyphenPrefix('ait') ||
+    exactOrHyphenPrefix('normative') ||
+    exactOrHyphenPrefix('mobile-normative-package') ||
+    exactOrHyphenPrefix('administrative-measure') ||
+    exactOrHyphenPrefix('measure') ||
+    exactOrHyphenPrefix('alcohol') ||
+    exactOrHyphenPrefix('speed') ||
+    resource === 'framing' ||
+    resource === 'validation-rule' ||
+    resource === 'agency-parameter' ||
+    resource === 'document-template' ||
+    resource === 'signature-policy' ||
+    exactOrHyphenPrefix('tow-provider') ||
+    resource === 'yard' ||
+    resource === 'breathalyzer' ||
+    resource === 'psychomotor-sign' ||
+    resource === 'vehicle-inventory'
+  );
+}
+
+/**
+ * Exceção declarada pelo contrato (§8): `ops:evidence-access-request:update`
+ * "casa pelo sentido 1" (rota → regra). Na leitura de hoje,
+ * `evidence-access-request.controller.ts` (gerado) só monta `read`
+ * (list/get) — CTG-0002 §13.1 restringiu `operations` a `['list','get']` —
+ * então a exceção é um no-op sobre a base de código atual; mantida como
+ * allowlist do sentido 2 para não regredir se o gerador voltar a emitir
+ * `update` (o texto do contrato já previa essa forma).
+ */
+const SENTIDO_2_ALLOWLIST = new Set(['ops:evidence-access-request:update']);
+
+/** Chaves cuja remoção já foi pedida em CTG-0002 §8 / CTG-0003 §7 (C-0004-49). */
+const REMOVED_KEYS = [
+  'ops:offline-numbering-reservation:reserve',
+  'ops:offline-numbering-reservation:cancel',
+  'ops:snapshot-person:read',
+  'ops:snapshot-person:create',
+  'ops:snapshot-vehicle:read',
+  'ops:snapshot-vehicle:create',
+];
+
+function collectMountedRoutes(
+  modulesContainer: Iterable<{
+    controllers: Map<unknown, { metatype?: unknown }>;
+  }>,
+  DETRAN_RESOURCE_METADATA_KEY: string,
+  DETRAN_ACTION_METADATA_KEY: string,
+  policyKey: (resource: string, action: string) => string,
+): RouteEntry[] {
+  const routes: RouteEntry[] = [];
+  for (const module of modulesContainer) {
+    for (const wrapper of module.controllers.values()) {
+      const metatype = wrapper.metatype as
+        (Function & { name: string }) | undefined;
+      if (!metatype) continue;
+      const classResource = Reflect.getMetadata(
+        DETRAN_RESOURCE_METADATA_KEY,
+        metatype,
+      ) as string | undefined;
+      const prototype = (metatype as unknown as { prototype: object })
+        .prototype;
+      for (const methodName of Object.getOwnPropertyNames(prototype)) {
+        if (methodName === 'constructor') continue;
+        const handler = (prototype as Record<string, unknown>)[methodName];
+        if (typeof handler !== 'function') continue;
+        const action = Reflect.getMetadata(
+          DETRAN_ACTION_METADATA_KEY,
+          handler,
+        ) as string | undefined;
+        if (!action) continue;
+        const methodResource = Reflect.getMetadata(
+          DETRAN_RESOURCE_METADATA_KEY,
+          handler,
+        ) as string | undefined;
+        const resource = methodResource ?? classResource;
+        if (!resource) continue;
+        try {
+          routes.push({
+            key: policyKey(resource, action),
+            controller: metatype.name,
+            method: methodName,
+          });
+        } catch {
+          // resource mal formado (sem "domain:resource"); ignorado — não é
+          // escopo deste teste (verify-controller-decorators.ts já cobre a
+          // forma dos decoradores em todo o repositório).
+        }
+      }
+    }
+  }
+  return routes;
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+
+  const previousSpeedFlag = process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
+  process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = 'on';
+  speedApp = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await speedApp.init();
+  if (previousSpeedFlag === undefined)
+    delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
+  else process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = previousSpeedFlag;
+});
+
+afterAll(async () => {
+  await app?.close();
+  await speedApp?.close();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0004 §8 — política ⇔ rotas do escopo TEAT (M18)', () => {
+  it('C-0004-47/48 — toda rota do escopo tem chave na matriz, e toda chave do escopo tem rota', async () => {
+    const { ModulesContainer } = await import('@nestjs/core');
+    const {
+      DETRAN_RESOURCE_METADATA_KEY,
+      DETRAN_ACTION_METADATA_KEY,
+      DETRAN_POLICY_MATRIX,
+      policyKey,
+    } = (await import('@detran/shared')) as unknown as {
+      DETRAN_RESOURCE_METADATA_KEY: string;
+      DETRAN_ACTION_METADATA_KEY: string;
+      DETRAN_POLICY_MATRIX: Record<string, readonly string[]>;
+      policyKey: (resource: string, action: string) => string;
+    };
+    const modulesContainer = app.get(ModulesContainer);
+    const speedModulesContainer = speedApp.get(ModulesContainer);
+    const routesByKey = new Map<string, RouteEntry>();
+    for (const container of [modulesContainer, speedModulesContainer]) {
+      for (const route of collectMountedRoutes(
+        container.values(),
+        DETRAN_RESOURCE_METADATA_KEY,
+        DETRAN_ACTION_METADATA_KEY,
+        policyKey,
+      )) {
+        if (inScope(route.key)) routesByKey.set(route.key, route);
+      }
+    }
+    const routes = [...routesByKey.values()];
+
+    // Sentido 1 — rota → regra.
+    const missingRules = routes.filter(
+      (route) => !(route.key in DETRAN_POLICY_MATRIX),
+    );
+
+    // Sentido 2 — regra → rota.
+    const mountedKeys = new Set(routes.map((route) => route.key));
+    const matrixKeysInScope = Object.keys(DETRAN_POLICY_MATRIX).filter(
+      (key) => inScope(key) && !SENTIDO_2_ALLOWLIST.has(key),
+    );
+    const missingRoutes = matrixKeysInScope.filter(
+      (key) => !mountedKeys.has(key),
+    );
+
+    // Uma única asserção com as duas listas, para que a mensagem de falha
+    // imprima as diferenças nos dois sentidos ao mesmo tempo (item (e) das
+    // notas do maestro), em vez de parar na primeira.
+    expect(
+      { missingRules, missingRoutes },
+      [
+        'Rotas do escopo TEAT sem chave em DETRAN_POLICY_MATRIX (sentido 1):',
+        ...missingRules.map(
+          (route) => `  ${route.key} (${route.controller}.${route.method})`,
+        ),
+        'Chaves do escopo TEAT em DETRAN_POLICY_MATRIX sem rota correspondente (sentido 2):',
+        ...missingRoutes.map((key) => `  ${key}`),
+      ].join('\n'),
+    ).toEqual({ missingRules: [], missingRoutes: [] });
+  });
+
+  it('C-0004-49 — as chaves de alias removidas (CTG-0002 §8, CTG-0003 §7) não existem mais na matriz', async () => {
+    const { DETRAN_POLICY_MATRIX } =
+      (await import('@detran/shared')) as unknown as {
+        DETRAN_POLICY_MATRIX: Record<string, unknown>;
+      };
+    const stillPresent = REMOVED_KEYS.filter(
+      (key) => key in DETRAN_POLICY_MATRIX,
+    );
+    expect(
+      stillPresent,
+      `Chaves que deveriam ter sido removidas mas ainda existem: ${stillPresent.join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/backend/app/tests/e2e/teat-measures-alcohol.e2e.spec.ts b/backend/app/tests/e2e/teat-measures-alcohol.e2e.spec.ts
new file mode 100644
index 0000000..01c3085
--- /dev/null
+++ b/backend/app/tests/e2e/teat-measures-alcohol.e2e.spec.ts
@@ -0,0 +1,325 @@
+import { randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0004 §4/§5/§7.3 e §11 (R-0008, TASK-0008) — C-0004-35…40 e C-0004-50
+ * (item 50 do §11 cita este arquivo explicitamente; a tabela-resumo do §11
+ * lista C-0004-47…50 em `policy-routes.e2e.spec.ts` — divergência de
+ * transcrição do próprio contrato, registrada no relatório; sigo o texto do
+ * item, mais específico).
+ *
+ * `MeasureCommandsController` e `AlcoholCommandsController` existem hoje mas
+ * **não estão montados** pelos módulos gerados (CTG-0004 §14 item 12 nota;
+ * confirmado por leitura direta de `measures.module.ts`/`alcohol.module.ts`
+ * — nenhum dos dois lista o controlador manuscrito em `controllers`), e
+ * `TeatIntegrationsController`/`ops:integration:*` ainda não existem (§8).
+ * Todos os casos de política abaixo respondem **404** hoje (rota ausente),
+ * não 200/403 — comportamento ausente, vermelho até TASK-0009 (regra 7 do
+ * prompt: nunca ajustar o teste ao comportamento atual). C-0004-40 é
+ * exceção: a flag `teat.speed_meters` já é `false` por padrão e o módulo já
+ * não monta, então esse caso passa hoje.
+ *
+ * Perfil local: `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` antes do
+ * `import` dinâmico de `app.module.js` (mesmo padrão de
+ * `teat-evidence-normative.e2e.spec.ts`).
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const MEASURE_RETIDO = '00000000-0000-7000-8000-0000ed000001';
+const MEASURE_LIBERADO_COM_PRAZO = '00000000-0000-7000-8000-0000ed000003';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
+const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
+const MEASURE_TYPE_ACTIVE = '00000000-0000-7000-8000-0000ec000001';
+const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
+const PROCEDURE_TRIAGEM = '00000000-0000-7000-8000-0000ee000002';
+const PROCEDURE_RESULTADO_ADMINISTRATIVO =
+  '00000000-0000-7000-8000-0000ee000006';
+const BREATHALYZER_VALID = '00000000-0000-7000-8000-0000ea000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+const previousEnv: Record<string, string | undefined> = {};
+
+/**
+ * O kernel aplica `@Idempotent()` a toda ação não-leitura (CTG-0001 §13
+ * item 6): corpo divergente sob a mesma `Idempotency-Key` devolve 422. Cada
+ * requisição leva uma chave nova.
+ */
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+  };
+}
+
+function server() {
+  return app.getHttpServer();
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0004 §4.1 — administrative-measures/{id}/start (C-0004-35)', () => {
+  it('C-0004-35 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../administrative-measures/{id}/start então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/measures/administrative-measures/${MEASURE_RETIDO}/start`)
+      .set(headers('field-agent'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0004-35 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../start então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/measures/administrative-measures/${MEASURE_RETIDO}/start`)
+      .set(headers('traffic-authority'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+/**
+ * OD-T61: C-0004-36 (`conclude`) e C-0004-37 (`release`) usavam a mesma
+ * medida `…ed000003`/retenção `…ed100001` — agora que o Engineer montou os
+ * comandos de verdade (TASK-0009 iteração 1), o `conclude` bem-sucedido
+ * transiciona a medida para `REGULARIZADO`, o que quebraria o `release`
+ * (exige `RETIDO`/`LIBERADO_COM_PRAZO`) se rodasse depois. `conclude`
+ * restaura `…ed000003` a `LIBERADO_COM_PRAZO` no `afterAll` (padrão de
+ * `teat-field-sync.e2e.spec.ts`); `release` cria sua própria medida e
+ * retenção no arranjo e as apaga no `afterAll` — nenhum dos dois depende do
+ * estado deixado pelo outro.
+ */
+describe('CTG-0004 §4.7 — administrative-measures/{id}/conclude (C-0004-36)', () => {
+  afterAll(async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(
+      `update inf.administrative_measure
+         set current_status = 'LIBERADO_COM_PRAZO', ended_at = null
+       where id = $1`,
+      [MEASURE_LIBERADO_COM_PRAZO],
+    );
+  });
+
+  it('C-0004-36 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../conclude então 200', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/inf/measures/administrative-measures/${MEASURE_LIBERADO_COM_PRAZO}/conclude`,
+      )
+      .set(headers('traffic-authority'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0004-36 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../conclude então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/inf/measures/administrative-measures/${MEASURE_LIBERADO_COM_PRAZO}/conclude`,
+      )
+      .set(headers('field-agent'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §4.6 — measures/retentions/{id}/release (C-0004-37)', () => {
+  const releaseMeasureId = randomUUID();
+  const releaseRetentionId = randomUUID();
+
+  beforeAll(async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(
+      `insert into inf.administrative_measure
+         (id, tenant_id, traffic_agency_id, measure_type_id, agent_id, shift_id,
+          device_id, started_at, reason, current_status)
+       values ($1, $2, $3, $4, $5, $6, $7, now(), 'Fixture isolada — C-0004-37', 'RETIDO')`,
+      [
+        releaseMeasureId,
+        TENANT_ID,
+        AGENCY_ID,
+        MEASURE_TYPE_ACTIVE,
+        ACTOR_ID,
+        SHIFT_ID,
+        DEVICE_ID,
+      ],
+    );
+    await client.query(
+      `insert into inf.measure_retention
+         (id, tenant_id, measure_id, vehicle_snapshot_id, retention_reason)
+       values ($1, $2, $3, $4, 'Fixture isolada — C-0004-37')`,
+      [releaseRetentionId, TENANT_ID, releaseMeasureId, VEHICLE_SNAPSHOT_ID],
+    );
+  });
+
+  afterAll(async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(`delete from inf.measure_retention where id = $1`, [
+      releaseRetentionId,
+    ]);
+    await client.query(`delete from inf.administrative_measure where id = $1`, [
+      releaseMeasureId,
+    ]);
+  });
+
+  it('C-0004-37 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST .../retentions/{id}/release então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/measures/retentions/${releaseRetentionId}/release`)
+      .set(headers('field-supervisor'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  // OD-T62: DetranPolicyGuard é genérico e devolve 403 sem `code` — só a
+  // rota concreta (não escrita ainda para este caso) nomearia
+  // TEAT.MEASURE_RELEASE_NOT_ALLOWED. Asserto só o status; o código por
+  // rota fica como OD para o catálogo/kernel (registrado no relatório).
+  it('C-0004-37 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST .../release então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/measures/retentions/${releaseRetentionId}/release`)
+      .set(headers('processing-operator'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §5.2 — alcohol/procedures/{id}/tests (C-0004-38)', () => {
+  it('C-0004-38 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../tests então 201', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/alcohol/procedures/${PROCEDURE_TRIAGEM}/tests`)
+      .set(headers('field-agent'))
+      .send({
+        breathalyzer_id: BREATHALYZER_VALID,
+        result_mg_l: 0.3,
+        tested_at: '2026-09-14T10:00:00-04:00',
+      });
+    expect(response.status).toBe(201);
+  });
+
+  it('C-0004-38 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST .../tests então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/inf/alcohol/procedures/${PROCEDURE_TRIAGEM}/tests`)
+      .set(headers('processing-operator'))
+      .send({
+        breathalyzer_id: BREATHALYZER_VALID,
+        result_mg_l: 0.3,
+        tested_at: '2026-09-14T10:00:00-04:00',
+      });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §5.6 — alcohol/procedures/{id}/close (C-0004-39)', () => {
+  it('C-0004-39 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST .../close então 200', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/inf/alcohol/procedures/${PROCEDURE_RESULTADO_ADMINISTRATIVO}/close`,
+      )
+      .set(headers('field-supervisor'))
+      .send({});
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0004-39 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../close então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/inf/alcohol/procedures/${PROCEDURE_RESULTADO_ADMINISTRATIVO}/close`,
+      )
+      .set(headers('traffic-authority'))
+      .send({});
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §6 — speed/measurements atrás da flag (C-0004-40)', () => {
+  it('C-0004-40 — dado teat.speed_meters=false (default) quando POST /v1/inf/speed/measurements então 404 (módulo não montado), nunca 403', async () => {
+    const response = await request(server())
+      .post('/v1/inf/speed/measurements')
+      .set(headers('field-agent'))
+      .send({});
+    expect(response.status).toBe(404);
+  });
+});
+
+describe('CTG-0004 §7.3 — ops/integrations/outbox e retry (C-0004-50)', () => {
+  it('C-0004-50 — dado DETRAN_LOCAL_ROLES=integration-operator quando GET /v1/ops/integrations/outbox então 200', async () => {
+    const response = await request(server())
+      .get('/v1/ops/integrations/outbox')
+      .set(headers('integration-operator'));
+    expect(response.status).toBe(200);
+  });
+
+  it('C-0004-50 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/integrations/outbox então 403', async () => {
+    const response = await request(server())
+      .get('/v1/ops/integrations/outbox')
+      .set(headers('field-agent'));
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0004-50 — dado um item integration.outbox status=pending quando POST outbox/{id}/retry então 409 TEAT.INTEGRATION_ITEM_NOT_FAILED', async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const pendingItem = await client.query<{ id: string }>(
+      `insert into integration.outbox
+         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status)
+       values ($1, 'ait.changed', 'ait', $2, '{}'::jsonb, $3, 'pending')
+       returning id`,
+      [TENANT_ID, MEASURE_RETIDO, `c-0004-50-${randomUUID().slice(0, 8)}`],
+    );
+    const itemId = pendingItem.rows[0]!.id;
+    try {
+      const response = await request(server())
+        .post(`/v1/ops/integrations/outbox/${itemId}/retry`)
+        .set(headers('integration-operator'))
+        .send({});
+      expect(response.status).toBe(409);
+      expect(response.body?.code).toBe('TEAT.INTEGRATION_ITEM_NOT_FAILED');
+    } finally {
+      await client.query(`delete from integration.outbox where id = $1`, [
+        itemId,
+      ]);
+    }
+  });
+});
diff --git a/backend/app/tests/e2e/teat-stream.e2e.spec.ts b/backend/app/tests/e2e/teat-stream.e2e.spec.ts
new file mode 100644
index 0000000..3cf3d7d
--- /dev/null
+++ b/backend/app/tests/e2e/teat-stream.e2e.spec.ts
@@ -0,0 +1,387 @@
+import { randomUUID } from 'node:crypto';
+import http, { type IncomingMessage } from 'node:http';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0004 §7 e §11 (R-0008, TASK-0008) — C-0004-41…46: `GET /v1/ops/stream`
+ * (M17). A rota não existe hoje (`teat-stream.controller.ts` nasce em
+ * TASK-0009) — toda conexão abaixo recebe 404 imediatamente, nunca um corpo
+ * `text/event-stream`; vermelho até TASK-0009 (regra 7 do prompt).
+ *
+ * Leitura em streaming via `http.get` no servidor real do app
+ * (`app.listen(0)`), lendo o corpo aos pedaços com timeout — nota do
+ * maestro (item f): supertest não expõe bem corpos que nunca terminam.
+ *
+ * C-0004-42 (nota do relatório, não ajuste ao comportamento atual): o
+ * cenário literal do contrato ("um evento `ait.changed` recebido por quem
+ * tem `inf:ait:read` e não por quem não tem") não é construtível com os
+ * papéis canônicos hoje — os oito papéis que `ops:stream:read` concede
+ * (CTG-0004 §8) são exatamente os nove de `INF_READ_ROLES` menos
+ * `bi-analyst`, e todos eles já têm `inf:ait:read` via `INF_SURFACE_RULES`
+ * (backend/domains/shared/src/policy.ts, verificado por leitura direta).
+ * Não há papel TEAT canônico que possa abrir o stream e não possa ler AIT.
+ * O mesmo mecanismo (§7.2, filtro por chave de leitura do tipo do evento) é
+ * construtível com `integration.item.changed`/`ops:integration:read`:
+ * só `integration-operator`/`technical-admin` têm essa chave entre os oito
+ * papéis do stream. Uso esse par como equivalente funcional e registro a
+ * divergência como possível OD para o Owner/Architect reconciliarem
+ * CTG-0004 §7.2 ou §8.
+ *
+ * Perfil local: variáveis antes do `import` dinâmico de `app.module.js`
+ * (mesmo padrão de `teat-evidence-normative.e2e.spec.ts`).
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+/** Criado em `beforeAll` (não é fixture canônica: `integration.outbox.tenant_id`
+ * tem FK para `auth.tenants`, então C-0004-46 precisa de um tenant real). */
+let OTHER_TENANT_ID: string;
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let port: number;
+const previousEnv: Record<string, string | undefined> = {};
+const createdOutboxIds: string[] = [];
+const openRequests: http.ClientRequest[] = [];
+
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    accept: 'text/event-stream',
+  };
+}
+
+interface SseEvent {
+  id?: string;
+  event?: string;
+  data?: string;
+}
+
+interface StreamResult {
+  status: number;
+  headers: Record<string, string | string[] | undefined>;
+  events: SseEvent[];
+}
+
+/** Lê o stream por até `timeoutMs`, parando antes se `stopAfter` eventos chegarem. */
+function readStream(
+  path: string,
+  requestHeaders: Record<string, string>,
+  {
+    timeoutMs = 3500,
+    stopAfter = Infinity,
+  }: { timeoutMs?: number; stopAfter?: number } = {},
+): Promise<StreamResult> {
+  return new Promise((resolve, reject) => {
+    const req = http.get(
+      { host: '127.0.0.1', port, path, headers: requestHeaders },
+      (res: IncomingMessage) => {
+        const events: SseEvent[] = [];
+        let buffer = '';
+        let current: SseEvent = {};
+        let settled = false;
+        const finish = () => {
+          if (settled) return;
+          settled = true;
+          clearTimeout(timer);
+          req.destroy();
+          resolve({
+            status: res.statusCode ?? 0,
+            headers: res.headers,
+            events,
+          });
+        };
+        const timer = setTimeout(finish, timeoutMs);
+        if (res.statusCode !== 200) {
+          finish();
+          return;
+        }
+        res.on('data', (chunk: Buffer) => {
+          buffer += chunk.toString('utf8');
+          const lines = buffer.split('\n');
+          buffer = lines.pop() ?? '';
+          for (const line of lines) {
+            const trimmed = line.replace(/\r$/, '');
+            if (trimmed === '') {
+              if (Object.keys(current).length > 0) events.push(current);
+              current = {};
+              if (events.length >= stopAfter) finish();
+              continue;
+            }
+            if (trimmed.startsWith(':')) continue; // heartbeat comment
+            const separator = trimmed.indexOf(':');
+            if (separator === -1) continue;
+            const field = trimmed.slice(0, separator);
+            const value = trimmed.slice(separator + 1).trimStart();
+            if (field === 'id') current.id = value;
+            else if (field === 'event') current.event = value;
+            else if (field === 'data') current.data = value;
+          }
+        });
+        res.on('end', finish);
+        res.on('error', finish);
+      },
+    );
+    openRequests.push(req);
+    req.on('error', (error) => {
+      if ((error as NodeJS.ErrnoException).code === 'ECONNRESET') return;
+      reject(error);
+    });
+  });
+}
+
+async function insertOutboxRow(
+  tenantId: string,
+  topic: string,
+  domainEvent: string,
+  aggregateId: string,
+  createdAt?: string,
+): Promise<string> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const envelope = {
+    type: topic,
+    domainEvent,
+    version: 1,
+    occurredAt: new Date().toISOString(),
+    tenantId,
+    actor: { kind: 'user', id: ACTOR_ID },
+    correlationId: randomUUID(),
+    aggregate: { kind: 'ait', id: aggregateId, version: 1 },
+    data: { aitId: aggregateId },
+  };
+  const result = await client.query<{ id: string }>(
+    `insert into integration.outbox
+       (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
+     values ($1, $2, 'ait', $3, $4::jsonb, $5, 'pending', coalesce($6::timestamptz, now()), coalesce($6::timestamptz, now()))
+     returning id`,
+    [
+      tenantId,
+      topic,
+      aggregateId,
+      JSON.stringify(envelope),
+      `${topic}:${aggregateId}:${randomUUID()}`,
+      createdAt ?? null,
+    ],
+  );
+  const id = result.rows[0]!.id;
+  createdOutboxIds.push(id);
+  return id;
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  OTHER_TENANT_ID = randomUUID();
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      OTHER_TENANT_ID,
+      `teat-stream-other-${OTHER_TENANT_ID.slice(0, 8)}`,
+      'Other tenant (C-0004-46)',
+    ],
+  );
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+  await app.listen(0);
+  const address = app.getHttpServer().address();
+  port = typeof address === 'object' && address ? address.port : 0;
+});
+
+afterEach(async () => {
+  for (const req of openRequests.splice(0)) req.destroy();
+  if (createdOutboxIds.length > 0) {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(
+      `delete from integration.outbox where id = any($1::uuid[])`,
+      [createdOutboxIds.splice(0)],
+    );
+  }
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`delete from auth.tenants where id = $1`, [
+    OTHER_TENANT_ID,
+  ]);
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0004 §7.1 — GET /v1/ops/stream: guarda de política (C-0004-41)', () => {
+  it('C-0004-41 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/stream então 200 com content-type text/event-stream', async () => {
+    const result = await readStream('/v1/ops/stream', headers('field-agent'), {
+      timeoutMs: 1500,
+    });
+    expect(result.status).toBe(200);
+    expect(String(result.headers['content-type'])).toContain(
+      'text/event-stream',
+    );
+  });
+
+  it('C-0004-41 — dado um papel PEC (CANDIDATO) quando GET /v1/ops/stream então 403', async () => {
+    const result = await readStream('/v1/ops/stream', headers('CANDIDATO'), {
+      timeoutMs: 1500,
+    });
+    expect(result.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §7.2 — filtro por papel/recurso (C-0004-42, ver nota no topo do arquivo)', () => {
+  it('dado um evento integration.item.changed então integration-operator (tem ops:integration:read) o recebe', async () => {
+    const streamPromise = readStream(
+      '/v1/ops/stream',
+      headers('integration-operator'),
+      { timeoutMs: 3000, stopAfter: 1 },
+    );
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(
+      result.events.some((event) => event.event === 'integration.item.changed'),
+    ).toBe(true);
+  });
+
+  it('dado o mesmo evento então field-agent (sem ops:integration:read) não o recebe', async () => {
+    const streamPromise = readStream('/v1/ops/stream', headers('field-agent'), {
+      timeoutMs: 2000,
+    });
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(
+      result.events.some((event) => event.event === 'integration.item.changed'),
+    ).toBe(false);
+  });
+});
+
+describe('CTG-0004 §7.1 — replay por Last-Event-ID (C-0004-43, C-0004-44)', () => {
+  it('C-0004-43 — dado Last-Event-ID de um evento de 1h atrás então o replay reenvia, em ordem, só os posteriores', async () => {
+    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
+    const lastEventId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+      oneHourAgo,
+    );
+    const laterId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+    );
+    const result = await readStream(
+      '/v1/ops/stream',
+      { ...headers('field-agent'), 'last-event-id': lastEventId },
+      { timeoutMs: 2000, stopAfter: 1 },
+    );
+    expect(result.events.map((event) => event.id)).toEqual([laterId]);
+  });
+
+  it('C-0004-44 — dado Last-Event-ID de um evento de 25h atrás então 204', async () => {
+    const twentyFiveHoursAgo = new Date(
+      Date.now() - 25 * 60 * 60 * 1000,
+    ).toISOString();
+    const staleId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+      twentyFiveHoursAgo,
+    );
+    const result = await readStream(
+      '/v1/ops/stream',
+      { ...headers('field-agent'), 'last-event-id': staleId },
+      { timeoutMs: 1500 },
+    );
+    expect(result.status).toBe(204);
+  });
+});
+
+describe('CTG-0004 §7.1 — filtro ?topics= (C-0004-45)', () => {
+  it('C-0004-45 — dado ?topics=ait.changed então só eventos desse tipo chegam', async () => {
+    const streamPromise = readStream(
+      '/v1/ops/stream?topics=ait.changed',
+      headers('integration-operator'),
+      { timeoutMs: 3000, stopAfter: 1 },
+    );
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    await insertOutboxRow(TENANT_ID, 'ait.changed', 'AIT_CHANGED', AIT_ID);
+    const result = await streamPromise;
+    expect(result.events.every((event) => event.event === 'ait.changed')).toBe(
+      true,
+    );
+    expect(result.events.length).toBeGreaterThan(0);
+  });
+});
+
+describe('CTG-0004 §7.1 — isolamento de tenant (C-0004-46)', () => {
+  it('C-0004-46 — dado um evento de outro tenant então ele nunca chega ao assinante, e tenantId não aparece em data', async () => {
+    const streamPromise = readStream('/v1/ops/stream', headers('field-agent'), {
+      timeoutMs: 2000,
+    });
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      OTHER_TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(result.events).toHaveLength(0);
+    for (const event of result.events) {
+      expect(event.data ?? '').not.toContain(OTHER_TENANT_ID);
+    }
+  });
+});
diff --git a/backend/app/vitest.config.ts b/backend/app/vitest.config.ts
index 7d469f8..e4b8d1d 100644
--- a/backend/app/vitest.config.ts
+++ b/backend/app/vitest.config.ts
@@ -78,6 +78,9 @@ export default defineConfig({
       '@detran/inf-ait': fileURLToPath(
         new URL('../domains/inf/ait/src/index.ts', import.meta.url),
       ),
+      '@detran/inf-deadlines': fileURLToPath(
+        new URL('../domains/inf/deadlines/src/index.ts', import.meta.url),
+      ),
       '@detran/inf-normative': fileURLToPath(
         new URL('../domains/inf/normative/src/index.ts', import.meta.url),
       ),
diff --git a/backend/database/seed/28-fixtures-teat-measures-alcohol.sql b/backend/database/seed/28-fixtures-teat-measures-alcohol.sql
new file mode 100644
index 0000000..87afb87
--- /dev/null
+++ b/backend/database/seed/28-fixtures-teat-measures-alcohol.sql
@@ -0,0 +1,141 @@
+-- TASK-0008 (R-0008, CTG-0004 §10): fixtures de medidas administrativas,
+-- alcoolemia e velocidade. Deterministic and idempotent (on conflict do
+-- update), tenant 00000000-0000-7000-8000-00000000a001, "hoje" = 2026-09-14.
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+-- inf.measure_type: rol do art. 269. 10-fixtures-inf-ait.sql não semeia
+-- nenhuma linha desta tabela (CTG-0004 §14 item 12, OD-T44) — o rol completo
+-- do art. 269 fica source_pending até o Owner fechar o catálogo; as quatro
+-- linhas abaixo bastam para os comandos que este contrato testa.
+insert into inf.measure_type (id, tenant_id, code, name, status)
+values
+ ('00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-00000000a001','retencao','Retenção do veículo','active'),
+ ('00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-00000000a001','remocao','Remoção do veículo','active'),
+ ('00000000-0000-7000-8000-0000ec000003','00000000-0000-7000-8000-00000000a001','recolhimento_cnh','Recolhimento da CNH','active'),
+ ('00000000-0000-7000-8000-0000ec000004','00000000-0000-7000-8000-00000000a001','recolhimento_crlv','Recolhimento do CRLV','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, code=excluded.code, name=excluded.name, status=excluded.status;
+
+-- inf.tow_provider: um ativo, um inativo (C-0004-06).
+insert into inf.tow_provider (id, tenant_id, traffic_agency_id, name, status)
+values
+ ('00000000-0000-7000-8000-0000ec100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Reboque Ativo','active'),
+ ('00000000-0000-7000-8000-0000ec100002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Reboque Inativo','inactive')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, status=excluded.status;
+
+-- inf.yard: um ativo, um inativo (C-0004-06).
+insert into inf.yard (id, tenant_id, traffic_agency_id, name, status)
+values
+ ('00000000-0000-7000-8000-0000ec200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Pátio Ativo','active'),
+ ('00000000-0000-7000-8000-0000ec200002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Fixture Pátio Inativo','inactive')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, status=excluded.status;
+
+-- inf.administrative_measure: uma por token do check
+-- ck_inf_administrative_measure_current_status (CTG-0004 §1) — doze linhas.
+-- ait_id = …f0000001 (10-fixtures-inf-ait.sql, INTEGRADO); agent_id =
+-- …b0000001; shift_id = …e3000001 (aberto); device_id = …e4000002
+-- (authorized), todos de 00/25/26-fixtures.
+insert into inf.administrative_measure (id, tenant_id, traffic_agency_id, measure_type_id, ait_id, agent_id, shift_id, device_id, started_at, reason, current_status)
+values
+ ('00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — RETIDO (CTG-0004 §1)','RETIDO'),
+ ('00000000-0000-7000-8000-0000ed000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LIBERADO_LOCAL (CTG-0004 §1)','LIBERADO_LOCAL'),
+ ('00000000-0000-7000-8000-0000ed000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LIBERADO_COM_PRAZO (CTG-0004 §1)','LIBERADO_COM_PRAZO'),
+ ('00000000-0000-7000-8000-0000ed000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000001','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — REGULARIZADO (CTG-0004 §1)','REGULARIZADO'),
+ ('00000000-0000-7000-8000-0000ed000005','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — CONVERTIDO_REMOCAO (CTG-0004 §1)','CONVERTIDO_REMOCAO'),
+ ('00000000-0000-7000-8000-0000ed000006','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — REMOVIDO (CTG-0004 §1)','REMOVIDO'),
+ ('00000000-0000-7000-8000-0000ed000007','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — EM_DEPOSITO (CTG-0004 §1)','EM_DEPOSITO'),
+ ('00000000-0000-7000-8000-0000ed000008','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — GUARDA_MONITORADA (CTG-0004 §1)','GUARDA_MONITORADA'),
+ ('00000000-0000-7000-8000-0000ed000009','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — VIOLACAO_MONITORAMENTO (CTG-0004 §1)','VIOLACAO_MONITORAMENTO'),
+ ('00000000-0000-7000-8000-0000ed000010','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — NOTIFICADO (CTG-0004 §1)','NOTIFICADO'),
+ ('00000000-0000-7000-8000-0000ed000011','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — RESTITUIDO (CTG-0004 §1)','RESTITUIDO'),
+ ('00000000-0000-7000-8000-0000ed000012','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000ec000002','00000000-0000-7000-8000-0000f0000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-0000e4000002','2026-09-14T09:00:00-04:00','Fixture — LEILAO (CTG-0004 §1)','LEILAO')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, measure_type_id=excluded.measure_type_id, ait_id=excluded.ait_id, agent_id=excluded.agent_id, shift_id=excluded.shift_id, device_id=excluded.device_id, started_at=excluded.started_at, reason=excluded.reason, current_status=excluded.current_status;
+
+-- inf.measure_retention: retenção com prazo da medida …ed000003
+-- (LIBERADO_COM_PRAZO). regularization_deadline_at = computeDue('T-REG30',
+-- 2026-09-14) = 2026-10-14 (quarta-feira, dia útil — sem prorrogação;
+-- inf.infraction_timer_ref, T-REG30, DDL 14). vehicle_snapshot_id =
+-- …ef600001 (27-fixtures-teat-evidence.sql).
+insert into inf.measure_retention (id, tenant_id, measure_id, vehicle_snapshot_id, retention_reason, regularization_deadline_at, regularization_deadline_days)
+values ('00000000-0000-7000-8000-0000ed100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ed000003','00000000-0000-7000-8000-0000ef600001','Fixture — retenção com prazo de regularização (CTG-0004 §10)','2026-10-14T00:00:00-04:00',30)
+on conflict (id) do update set tenant_id=excluded.tenant_id, measure_id=excluded.measure_id, vehicle_snapshot_id=excluded.vehicle_snapshot_id, retention_reason=excluded.retention_reason, regularization_deadline_at=excluded.regularization_deadline_at, regularization_deadline_days=excluded.regularization_deadline_days;
+
+-- inf.alcohol_breathalyzer: verificação vigente (…ea000001) e vencida
+-- (…ea000002) — C-0004-14.
+insert into inf.alcohol_breathalyzer (id, tenant_id, traffic_agency_id, serial_number, model, manufacturer, last_calibration_at, calibration_valid_until, status)
+values
+ ('00000000-0000-7000-8000-0000ea000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ETL-FIX-0001','Fixture Model','Fixtures Ltda','2026-06-30','2027-06-30','active'),
+ ('00000000-0000-7000-8000-0000ea000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','ETL-FIX-0002','Fixture Model','Fixtures Ltda','2025-06-30','2025-12-31','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, serial_number=excluded.serial_number, model=excluded.model, manufacturer=excluded.manufacturer, last_calibration_at=excluded.last_calibration_at, calibration_valid_until=excluded.calibration_valid_until, status=excluded.status;
+
+-- inf.normative_metrological_table …eb000001: nasceu em
+-- 27-fixtures-teat-evidence.sql (CTG-0003 §9) como placeholder
+-- ({"source_pending":true,"unit":null,"thresholds":null,"tolerance":null}) —
+-- aquele arquivo é seed existente e não pode ser tocado por esta tarefa
+-- ("Não pode tocar: seeds existentes"). CTG-0004 §3.1 fixa o FORMATO aqui;
+-- os limiares são normativos ([WF-TEAT-005] §Limiares, RN-TEAT-133:
+-- administrativo >= 0,05 mg/L, crime >= 0,34 mg/L) e NÃO são
+-- source_pending. Só os valores de `tolerance` (max_error por faixa) são
+-- source_pending: o Anexo I da Res. CONTRAN 432/2013 não foi capturado em
+-- docs/reference (docs/reference/legal/contran/REF-CONTRAN-432.md não traz a
+-- tabela numérica). Este insert faz on conflict do update sobre a MESMA
+-- linha semeada em 27-fixtures (seed.sh aplica os arquivos em ordem
+-- numérica; 28 corre depois de 27) — não é edição do arquivo 27.
+insert into inf.normative_metrological_table (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
+values (
+  '00000000-0000-7000-8000-0000eb000001',
+  '00000000-0000-7000-8000-00000000a001',
+  '00000000-0000-7000-8000-0000e0000001',
+  'Etilômetro — tabela de erro máximo admissível',
+  '2026.1',
+  -- tolerance: faixas e max_error de exemplo (CTG-0004 §3.1) — SOURCE_PENDING,
+  -- Anexo I da Res. 432/2013 não capturado; nenhum teste depende destes
+  -- valores numéricos específicos, só da faixa a que 0,30 mg/L pertence.
+  '{"unit":"mg/L","thresholds":{"administrative":0.05,"crime":0.34},"tolerance":[{"from":0.00,"to":0.40,"max_error":0.04},{"from":0.40,"to":null,"max_error":0.05}]}'::jsonb,
+  '2026-01-01',
+  'active'
+)
+on conflict (id) do update set tenant_id=excluded.tenant_id, catalog_id=excluded.catalog_id, table_name=excluded.table_name, version=excluded.version, table_json=excluded.table_json, valid_from=excluded.valid_from, status=excluded.status;
+
+-- inf.alcohol_procedure: uma por token de [WF-TEAT-005] — quinze linhas
+-- (CTG-0004 §10, §14 item 4/13: a coluna não tem check; outcome='' em todas
+-- porque a coluna é not null e nenhuma fonte define um token "sem
+-- desfecho"). procedure_type='etilometro' é o único vocabulário plausível
+-- para este pacote de teste; a DDL não tem check e nenhum documento fixa a
+-- lista — SOURCE_PENDING (nenhum critério do Inspector depende do valor).
+insert into inf.alcohol_procedure (id, tenant_id, traffic_agency_id, agent_id, shift_id, procedure_at, procedure_type, outcome, status)
+values
+ ('00000000-0000-7000-8000-0000ee000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ABORDAGEM'),
+ ('00000000-0000-7000-8000-0000ee000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','TRIAGEM'),
+ ('00000000-0000-7000-8000-0000ee000003','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ETILOMETRO_OFERECIDO'),
+ ('00000000-0000-7000-8000-0000ee000004','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','TESTE_REALIZADO'),
+ ('00000000-0000-7000-8000-0000ee000005','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_ABAIXO_LIMITE'),
+ ('00000000-0000-7000-8000-0000ee000006','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_ADMINISTRATIVO'),
+ ('00000000-0000-7000-8000-0000ee000007','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RESULTADO_CRIME'),
+ ('00000000-0000-7000-8000-0000ee000008','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','RECUSA_REGISTRADA'),
+ ('00000000-0000-7000-8000-0000ee000009','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','IMPOSSIBILIDADE_TECNICA'),
+ ('00000000-0000-7000-8000-0000ee000010','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','OUTRO_MEIO_PROVA'),
+ ('00000000-0000-7000-8000-0000ee000011','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','SINAIS_CONSTATADOS'),
+ ('00000000-0000-7000-8000-0000ee000012','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','AIT_165A_LAVRADO'),
+ ('00000000-0000-7000-8000-0000ee000013','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','AIT_165_LAVRADO'),
+ ('00000000-0000-7000-8000-0000ee000014','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','ENCAMINHADO_POLICIA_JUDICIARIA'),
+ ('00000000-0000-7000-8000-0000ee000015','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e3000001','2026-09-14T09:00:00-04:00','etilometro','','SEM_AUTUACAO_ALCOOLEMIA')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, shift_id=excluded.shift_id, procedure_at=excluded.procedure_at, procedure_type=excluded.procedure_type, outcome=excluded.outcome, status=excluded.status;
+
+-- inf.alcohol_forwarding: encaminhamento já registrado do caso
+-- RESULTADO_CRIME (…ee000007) — C-0004-23 (close com forwarding já
+-- existente).
+insert into inf.alcohol_forwarding (id, tenant_id, procedure_id, forwarding_type, destination, forwarded_at)
+values ('00000000-0000-7000-8000-0000ee100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ee000007','policia_judiciaria','Delegacia Fixture','2026-09-14T10:00:00-04:00')
+on conflict (id) do update set tenant_id=excluded.tenant_id, procedure_id=excluded.procedure_id, forwarding_type=excluded.forwarding_type, destination=excluded.destination, forwarded_at=excluded.forwarded_at;
+
+-- inf.speed_meter / inf.speed_meter_certificate: medidor acoplado com
+-- certificado vigente (C-0004-27 usa a versão vencida via override no
+-- teste, nunca uma segunda fixture inventada).
+insert into inf.speed_meter (id, tenant_id, model, serial_number, agency_identifier, meter_type, inmetro_model_approval, has_ocr)
+values ('00000000-0000-7000-8000-0000ef900001','00000000-0000-7000-8000-00000000a001','Fixture Radar','RAD-FIX-0001','AGE-FIX-0001','movel_acoplado','INMETRO-FIX-0001',true)
+on conflict (id) do update set tenant_id=excluded.tenant_id, model=excluded.model, serial_number=excluded.serial_number, agency_identifier=excluded.agency_identifier, meter_type=excluded.meter_type, inmetro_model_approval=excluded.inmetro_model_approval, has_ocr=excluded.has_ocr;
+
+insert into inf.speed_meter_certificate (id, tenant_id, meter_id, kind, certificate_number, issuer, issued_on, valid_until)
+values ('00000000-0000-7000-8000-0000efa00001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000ef900001','periodica','CERT-FIX-0001','Fixtures Inmetro','2026-06-30','2027-06-30')
+on conflict (id) do update set tenant_id=excluded.tenant_id, meter_id=excluded.meter_id, kind=excluded.kind, certificate_number=excluded.certificate_number, issuer=excluded.issuer, issued_on=excluded.issued_on, valid_until=excluded.valid_until;
diff --git a/backend/domains/inf/alcohol/src/alcohol-commands.controller.ts b/backend/domains/inf/alcohol/src/alcohol-commands.controller.ts
index f0f48aa..3ca59d7 100644
--- a/backend/domains/inf/alcohol/src/alcohol-commands.controller.ts
+++ b/backend/domains/inf/alcohol/src/alcohol-commands.controller.ts
@@ -1,61 +1,71 @@
-import { Body, Controller, Param, Post } from '@nestjs/common';
+// CTG-0004 §5, §12 (R-0008, TASK-0009) — controlador de comandos de
+// alcoolemia. Delega aos comandos manuscritos via `AlcoholCommands`
+// (`handwritten/alcohol-lifecycle.provider.ts`). `forward` muda de
+// `/:id/forward` para `/:id/forwardings` (route contract §6);
+// `psychomotor-signs` passa a receber o DTO inteiro (§12).
+import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
-import { AlcoholLifecycleService } from './alcohol-lifecycle.service.js';
+
+import { AlcoholCommands } from './handwritten/alcohol-lifecycle.provider.js';
+import type { CloseAlcoholProcedureInput } from './handwritten/close-procedure.command.js';
+import type { RecordAlcoholForwardingInput } from './handwritten/forward-procedure.command.js';
+import type { RecordAlcoholRefusalInput } from './handwritten/record-refusal.command.js';
+import type { RecordPsychomotorSignsInput } from './handwritten/record-signs.command.js';
+import type { RecordAlcoholTestInput } from './handwritten/record-test.command.js';
+import type { StartProcedureInput } from './handwritten/start-procedure.command.js';

 @Controller('v1/inf/alcohol/procedures')
 @Resource('inf:alcohol-procedure')
 export class AlcoholCommandsController {
-  constructor(private readonly lifecycle: AlcoholLifecycleService) {}
+  constructor(private readonly commands: AlcoholCommands) {}
+
   @Post(':id/start')
+  @HttpCode(200)
   @Action('start')
   @Audit({ action: 'INF_ALCOHOL_START', entity: 'inf.alcohol_procedure' })
-  start(@Param('id') id: string, @Body() body: { reason?: string }) {
-    return this.lifecycle.start(id, body.reason);
+  start(@Param('id') id: string, @Body() body: StartProcedureInput = {}) {
+    return this.commands.start.execute(id, body);
   }
+
   @Post(':id/tests')
   @Action('record-test')
   @Audit({ action: 'INF_ALCOHOL_TEST', entity: 'inf.alcohol_test' })
-  test(
-    @Param('id') id: string,
-    @Body() body: Parameters<AlcoholLifecycleService['recordTest']>[1],
-  ) {
-    return this.lifecycle.recordTest(id, body);
+  test(@Param('id') id: string, @Body() body: RecordAlcoholTestInput) {
+    return this.commands.recordTest.execute(id, body);
   }
+
   @Post(':id/refusals')
   @Action('record-refusal')
   @Audit({ action: 'INF_ALCOHOL_REFUSAL', entity: 'inf.alcohol_refusal' })
-  refusal(
-    @Param('id') id: string,
-    @Body() body: Parameters<AlcoholLifecycleService['recordRefusal']>[1],
-  ) {
-    return this.lifecycle.recordRefusal(id, body);
+  refusal(@Param('id') id: string, @Body() body: RecordAlcoholRefusalInput) {
+    return this.commands.recordRefusal.execute(id, body);
   }
+
   @Post(':id/psychomotor-signs')
   @Action('record-psychomotor-signs')
   @Audit({
     action: 'INF_ALCOHOL_SIGNS',
     entity: 'inf.alcohol_psychomotor_sign',
   })
-  signs(
-    @Param('id') id: string,
-    @Body()
-    body: { signs: Parameters<AlcoholLifecycleService['recordSigns']>[1] },
-  ) {
-    return this.lifecycle.recordSigns(id, body.signs);
+  signs(@Param('id') id: string, @Body() body: RecordPsychomotorSignsInput) {
+    return this.commands.recordSigns.execute(id, body);
   }
-  @Post(':id/forward')
+
+  @Post(':id/forwardings')
   @Action('forward')
   @Audit({ action: 'INF_ALCOHOL_FORWARD', entity: 'inf.alcohol_forwarding' })
-  forward(
-    @Param('id') id: string,
-    @Body() body: Parameters<AlcoholLifecycleService['forward']>[1],
-  ) {
-    return this.lifecycle.forward(id, body);
+  forward(@Param('id') id: string, @Body() body: RecordAlcoholForwardingInput) {
+    return this.commands.forward.execute(id, body);
   }
+
   @Post(':id/close')
+  @HttpCode(200)
   @Action('close')
   @Audit({ action: 'INF_ALCOHOL_CLOSE', entity: 'inf.alcohol_procedure' })
-  close(@Param('id') id: string, @Body() body: { outcome?: string }) {
-    return this.lifecycle.close(id, body.outcome);
+  close(
+    @Param('id') id: string,
+    @Body() body: CloseAlcoholProcedureInput = {},
+  ) {
+    return this.commands.close.execute(id, body);
   }
 }
diff --git a/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts b/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts
new file mode 100644
index 0000000..177a26c
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts
@@ -0,0 +1,80 @@
+// CTG-0004 §12 (R-0008, TASK-0009) e §15.1 (adenda, iteração 2) — composição
+// de `AlcoholCommands` no módulo gerado.
+//
+// `repositories` fica vazio de propósito para as tabelas do próprio pacote
+// (mesmo padrão de `inf/measures/src/handwritten/measure-lifecycle.provider.ts`
+// / CTG-0003 §4): toda leitura/escrita de produção acontece na transação do
+// comando. A tabela metrológica é a exceção (§15.1): pertence a
+// `inf/normative`, então a leitura vai pelo repositório GERADO daquele
+// pacote (`NormativeMetrologicalTableRepository`), nunca por SQL cross-schema
+// manuscrito aqui. `NormativeModule` não exporta o repositório no DI (só
+// `NormativeLifecycleService`, `moduleExports` do blueprint — fora do que
+// este worker pode tocar em `inf/normative`), então o provider o constrói
+// diretamente com os mesmos `Database`/`RequestContext` já injetados nesta
+// fábrica — mesmas duas dependências do construtor gerado
+// (`normative-metrological-table.repository.ts`), sem precisar do DI do
+// Nest para essa classe.
+import type { Provider } from '@nestjs/common';
+import { SqlTeatEventOutbox } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import { NormativeMetrologicalTableRepository } from '@detran/inf-normative';
+
+import type { AlcoholDeps, AlcoholRowStore } from './alcohol-runtime.js';
+import { CloseProcedureCommand } from './close-procedure.command.js';
+import { ForwardProcedureCommand } from './forward-procedure.command.js';
+import { RecordRefusalCommand } from './record-refusal.command.js';
+import { RecordSignsCommand } from './record-signs.command.js';
+import { RecordTestCommand } from './record-test.command.js';
+import { StartProcedureCommand } from './start-procedure.command.js';
+
+function metrologicalTableStore(
+  repository: NormativeMetrologicalTableRepository,
+): AlcoholRowStore {
+  return {
+    list: async () => (await repository.findAll()).map((row) => ({ ...row })),
+    findOne: async (id) => {
+      try {
+        return { ...(await repository.findOne(id)) };
+      } catch {
+        return undefined;
+      }
+    },
+  };
+}
+
+/** Bolsa dos seis comandos manuscritos de alcoolemia (CTG-0004 §12). */
+export class AlcoholCommands {
+  readonly start: StartProcedureCommand;
+  readonly recordTest: RecordTestCommand;
+  readonly recordRefusal: RecordRefusalCommand;
+  readonly recordSigns: RecordSignsCommand;
+  readonly forward: ForwardProcedureCommand;
+  readonly close: CloseProcedureCommand;
+
+  constructor(deps: AlcoholDeps) {
+    this.start = new StartProcedureCommand(deps);
+    this.recordTest = new RecordTestCommand(deps);
+    this.recordRefusal = new RecordRefusalCommand(deps);
+    this.recordSigns = new RecordSignsCommand(deps);
+    this.forward = new ForwardProcedureCommand(deps);
+    this.close = new CloseProcedureCommand(deps);
+  }
+}
+
+export const ALCOHOL_LIFECYCLE_PROVIDER: Provider = {
+  provide: AlcoholCommands,
+  inject: [Database, RequestContext],
+  useFactory: (database: Database, requestContext: RequestContext) =>
+    new AlcoholCommands({
+      database,
+      requestContext,
+      repositories: {
+        metrologicalTables: metrologicalTableStore(
+          new NormativeMetrologicalTableRepository(database, requestContext),
+        ),
+      },
+      outbox: new SqlTeatEventOutbox(),
+      clock: { now: () => new Date().toISOString() },
+    }),
+};
diff --git a/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts b/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts
new file mode 100644
index 0000000..296c9a6
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/alcohol-runtime.ts
@@ -0,0 +1,287 @@
+// CTG-0004 §3, §5, §12 (R-0008, TASK-0009) — dependências e utilidades comuns
+// aos comandos manuscritos de alcoolemia. Mesmo padrão de
+// `inf/measures/src/handwritten/measure-runtime.ts` (CTG-0004 §4): porta
+// `AlcoholRowStore` mínima por tabela, com fallback a SQL parametrizado na
+// transação do comando quando a porta não expõe a operação (produção,
+// `repositories: {}`).
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { TeatEventEnvelope, TeatEventOutbox } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type AlcoholRow = Record<string, unknown>;
+
+export interface AlcoholRowStore {
+  list?(): Promise<AlcoholRow[]>;
+  find?(id: string): Promise<AlcoholRow | undefined>;
+  findOne?(id: string): Promise<AlcoholRow | undefined>;
+  findByProcedure?(procedureId: string): Promise<AlcoholRow[]>;
+  create?(values: AlcoholRow): Promise<AlcoholRow>;
+  update?(
+    id: string,
+    patch: AlcoholRow,
+    tx?: unknown,
+  ): Promise<AlcoholRow | undefined>;
+}
+
+export interface AlcoholDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, AlcoholRowStore | undefined>;
+  outbox?: TeatEventOutbox;
+  clock: { now(): string };
+}
+
+export interface AlcoholScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+/** Tabelas tocadas pelos comandos desta tarefa (CTG-0004 §5). */
+export const ALCOHOL_TABLES = {
+  procedures: 'inf.alcohol_procedure',
+  tests: 'inf.alcohol_test',
+  refusals: 'inf.alcohol_refusal',
+  signs: 'inf.alcohol_psychomotor_sign',
+  forwardings: 'inf.alcohol_forwarding',
+  breathalyzers: 'inf.alcohol_breathalyzer',
+  metrologicalTables: 'inf.normative_metrological_table',
+} as const;
+
+export type AlcoholTableName = keyof typeof ALCOHOL_TABLES;
+
+export function tenantScope(deps: AlcoholDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de alcoolemia exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de alcoolemia exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function scopeOf(deps: AlcoholDeps): AlcoholScope {
+  const { tenantId, actorId } = tenantScope(deps);
+  return { tenantId, actorId, occurredAt: deps.clock.now() };
+}
+
+export function inTenantTransaction<T>(
+  deps: AlcoholDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: AlcoholDeps,
+  table: AlcoholTableName,
+): AlcoholRowStore | undefined {
+  return deps.repositories[table];
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+function assertColumns(values: AlcoholRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de alcoolemia');
+  return columns;
+}
+
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export async function findRow(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+  id: string,
+): Promise<AlcoholRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${ALCOHOL_TABLES[table]} where id = $1`,
+    [id],
+  );
+  return result.rows[0];
+}
+
+export async function findRowsWhere(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+  column: string,
+  value: unknown,
+): Promise<AlcoholRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.findByProcedure === 'function' && column === 'procedure_id')
+    return store.findByProcedure(String(value));
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = asQueryable(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${ALCOHOL_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+/** Primeira linha `status='active'` da tabela — sem porta de leitura por
+ * filtro estruturado, a busca cai numa listagem e filtra em memória
+ * (mesma técnica de `findRowsWhere`), e em produção vira SQL direto. */
+export async function findActiveRow(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+): Promise<AlcoholRow | undefined> {
+  const rows = await findRowsWhere(deps, tx, table, 'status', 'active');
+  return rows[0];
+}
+
+export async function insertRow(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+  values: AlcoholRow,
+): Promise<AlcoholRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = asQueryable(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${ALCOHOL_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as AlcoholRow;
+}
+
+export async function patchRow(
+  deps: AlcoholDeps,
+  tx: unknown,
+  table: AlcoholTableName,
+  id: string,
+  patch: AlcoholRow,
+): Promise<AlcoholRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = asQueryable(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${ALCOHOL_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function numberOf(value: unknown): number | null {
+  if (typeof value === 'number') return value;
+  if (typeof value === 'string' && value.trim() !== '') return Number(value);
+  return null;
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+/** 409 `TEAT.ALCOHOL_STATE_INVALID` (CTG-0004 §3). */
+export function alcoholStateInvalid(
+  procedureId: string,
+  currentState: string,
+  allowed: readonly string[],
+  command: string,
+): DetranError {
+  return new DetranError('TEAT.ALCOHOL_STATE_INVALID', {
+    status: 409,
+    context: { procedureId, currentState, allowed: [...allowed], command },
+    message: 'Procedimento de alcoolemia fora do estado exigido pelo comando.',
+  });
+}
+
+export function assertAlcoholAllowed(
+  procedure: AlcoholRow,
+  procedureId: string,
+  allowed: readonly string[],
+  command: string,
+): string {
+  const currentState = stringOf(procedure.status);
+  if (!allowed.includes(currentState))
+    throw alcoholStateInvalid(procedureId, currentState, allowed, command);
+  return currentState;
+}
+
+export async function appendEvent(
+  deps: AlcoholDeps,
+  tx: Transaction,
+  envelope: TeatEventEnvelope,
+): Promise<void> {
+  await deps.outbox?.append(tx, envelope);
+}
+
+/** Réplica mínima de `teatEnvelope` (mesmo motivo de `measure-runtime.ts`:
+ * `inf/alcohol` não depende de `ops-core`). */
+export function alcoholEnvelope(input: {
+  type: string;
+  domainEvent: string;
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+}): TeatEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: input.occurredAt,
+    tenantId: input.tenantId,
+    actor: { kind: 'user', id: input.actorId },
+    correlationId: input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/classification.ts b/backend/domains/inf/alcohol/src/handwritten/classification.ts
new file mode 100644
index 0000000..580dde8
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/classification.ts
@@ -0,0 +1,14 @@
+// CTG-0004 §3.1 (R-0008, TASK-0009, [WF-TEAT-005] §Limiares) — classificação
+// do resultado considerado pelos limiares da tabela metrológica.
+export type AlcoholResultClassification =
+  'RESULTADO_ABAIXO_LIMITE' | 'RESULTADO_ADMINISTRATIVO' | 'RESULTADO_CRIME';
+
+export function classifyConsidered(
+  consideredMgL: number,
+  thresholds: { administrative: number; crime: number },
+): AlcoholResultClassification {
+  if (consideredMgL >= thresholds.crime) return 'RESULTADO_CRIME';
+  if (consideredMgL >= thresholds.administrative)
+    return 'RESULTADO_ADMINISTRATIVO';
+  return 'RESULTADO_ABAIXO_LIMITE';
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.spec.ts
new file mode 100644
index 0000000..eadf180
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.spec.ts
@@ -0,0 +1,332 @@
+// CTG-0004 §3, §5.6 e §11 (R-0008, TASK-0008) — C-0004-13 (linha `close`),
+// C-0004-23 e C-0004-24. `handwritten/close-procedure.command.ts` nasce em
+// TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`
+// (`…ee100001`, encaminhamento já registrado para o procedimento
+// RESULTADO_CRIME `…ee000007`). Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `CloseProcedureCommand`, construtor `(deps)`,
+// método `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const FORWARDING_EXISTING = '00000000-0000-7000-8000-0000ee100001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `close` (CTG-0004 §3). */
+const ALLOWED_STATES = [
+  'RECUSA_REGISTRADA',
+  'RESULTADO_ABAIXO_LIMITE',
+  'RESULTADO_ADMINISTRATIVO',
+  'RESULTADO_CRIME',
+  'SINAIS_CONSTATADOS',
+  'OUTRO_MEIO_PROVA',
+];
+
+/** terminal esperado por pré-estado (CTG-0004 §5.6). */
+const TERMINAL_BY_STATE: Record<string, string> = {
+  RECUSA_REGISTRADA: 'AIT_165A_LAVRADO',
+  RESULTADO_ADMINISTRATIVO: 'AIT_165_LAVRADO',
+  SINAIS_CONSTATADOS: 'AIT_165_LAVRADO',
+  RESULTADO_ABAIXO_LIMITE: 'SEM_AUTUACAO_ALCOOLEMIA',
+};
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    findByProcedure: vi.fn(async (procedureId: string) =>
+      store.filter((row) => row.procedure_id === procedureId),
+    ),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+const PROCEDURE_RESULTADO_CRIME = ALL_PROCEDURE_STATES.find(
+  (entry) => entry.state === 'RESULTADO_CRIME',
+)!.id;
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      forwardings: repository([
+        {
+          id: FORWARDING_EXISTING,
+          tenant_id: TENANT_ID,
+          procedure_id: PROCEDURE_RESULTADO_CRIME,
+          forwarding_type: 'policia_judiciaria',
+        },
+      ]),
+      tests: repository([
+        {
+          id: 'test-crime-1',
+          tenant_id: TENANT_ID,
+          procedure_id: PROCEDURE_RESULTADO_CRIME,
+          considered_mg_l: 0.45,
+        },
+      ]),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function closeProcedure(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./close-procedure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/close-procedure.command.ts ainda não existe (TASK-0009, CTG-0004 §5.6)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.CloseProcedureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'close-procedure.command.ts não exporta um comando construtível (CTG-0004 §5.6)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'close-procedure.command.ts não expõe execute|handle|run (CTG-0004 §5.6)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §3/§5.6 — close: matriz de estados (C-0004-13, linha `close`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando close então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      const body =
+        state === 'OUTRO_MEIO_PROVA'
+          ? { outcome: 'RESULTADO_ADMINISTRATIVO' }
+          : {};
+      if (admitted) {
+        await expect(
+          closeProcedure(dependencies, id, body),
+        ).resolves.toMatchObject({ id });
+      } else {
+        await expect(
+          closeProcedure(dependencies, id, body),
+        ).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'close',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.6 — close: RESULTADO_CRIME exige forwarding (C-0004-23, RN-TEAT-137)', () => {
+  it('C-0004-23 — dado close em …ee000007 (RESULTADO_CRIME) sem forwarding então 422 TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME com { consideredMgL, threshold: 0.34 }', async () => {
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        forwardings: repository([]),
+        tests: repository([
+          {
+            id: 'test-crime-1',
+            tenant_id: TENANT_ID,
+            procedure_id: PROCEDURE_RESULTADO_CRIME,
+            considered_mg_l: 0.45,
+          },
+        ]),
+      },
+    });
+    await expect(
+      closeProcedure(dependencies, PROCEDURE_RESULTADO_CRIME),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME',
+      status: 422,
+      context: expect.objectContaining({
+        procedureId: PROCEDURE_RESULTADO_CRIME,
+        consideredMgL: 0.45,
+        threshold: 0.34,
+      }),
+    });
+  });
+
+  it('C-0004-23 — dado close em …ee000007 com o forwarding …ee100001 já registrado então status=ENCAMINHADO_POLICIA_JUDICIARIA', async () => {
+    const dependencies = deps();
+    const result = await closeProcedure(
+      dependencies,
+      PROCEDURE_RESULTADO_CRIME,
+    );
+    expect(result.status).toBe('ENCAMINHADO_POLICIA_JUDICIARIA');
+  });
+});
+
+describe('CTG-0004 §5.6 — close: terminal por pré-estado, um a um (C-0004-24)', () => {
+  for (const [state, terminal] of Object.entries(TERMINAL_BY_STATE)) {
+    it(`dado close a partir de ${state} então status final ${terminal}`, async () => {
+      const procedureId = ALL_PROCEDURE_STATES.find(
+        (entry) => entry.state === state,
+      )!.id;
+      const dependencies = deps();
+      const result = await closeProcedure(dependencies, procedureId);
+      expect(result.status).toBe(terminal);
+    });
+  }
+
+  it('dado close a partir de OUTRO_MEIO_PROVA sem outcome então 422 TEAT.ALCOHOL_TERM_MINIMUM_CONTENT com missing=["outcome"]', async () => {
+    const procedureId = ALL_PROCEDURE_STATES.find(
+      (entry) => entry.state === 'OUTRO_MEIO_PROVA',
+    )!.id;
+    const dependencies = deps();
+    await expect(
+      closeProcedure(dependencies, procedureId, {}),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_TERM_MINIMUM_CONTENT',
+      status: 422,
+      context: expect.objectContaining({ missing: ['outcome'] }),
+    });
+  });
+
+  it('dado close a partir de OUTRO_MEIO_PROVA com outcome=RESULTADO_CRIME então o terminal é ENCAMINHADO_POLICIA_JUDICIARIA (a mesma guarda de forwarding se aplica)', async () => {
+    const procedureId = ALL_PROCEDURE_STATES.find(
+      (entry) => entry.state === 'OUTRO_MEIO_PROVA',
+    )!.id;
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        forwardings: repository([
+          {
+            id: 'forwarding-outro-meio',
+            tenant_id: TENANT_ID,
+            procedure_id: procedureId,
+            forwarding_type: 'policia_judiciaria',
+          },
+        ]),
+        tests: repository([
+          {
+            id: 'test-outro-meio',
+            tenant_id: TENANT_ID,
+            procedure_id: procedureId,
+            considered_mg_l: 0.4,
+          },
+        ]),
+      },
+    });
+    const result = await closeProcedure(dependencies, procedureId, {
+      outcome: 'RESULTADO_CRIME',
+    });
+    expect(result.status).toBe('ENCAMINHADO_POLICIA_JUDICIARIA');
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts
new file mode 100644
index 0000000..fcfe899
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts
@@ -0,0 +1,117 @@
+// CTG-0004 §5.6 (R-0008, TASK-0009, RN-TEAT-137) — `POST procedures/{id}/close`.
+import { DetranError } from '@detran/shared';
+
+import {
+  assertAlcoholAllowed,
+  findRow,
+  findRowsWhere,
+  inTenantTransaction,
+  numberOf,
+  patchRow,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+
+const ALLOWED = [
+  'RECUSA_REGISTRADA',
+  'RESULTADO_ABAIXO_LIMITE',
+  'RESULTADO_ADMINISTRATIVO',
+  'RESULTADO_CRIME',
+  'SINAIS_CONSTATADOS',
+  'OUTRO_MEIO_PROVA',
+] as const;
+const CRIME_THRESHOLD = 0.34;
+const TERMINAL_FOR_RESULT: Record<string, string> = {
+  RESULTADO_ABAIXO_LIMITE: 'SEM_AUTUACAO_ALCOOLEMIA',
+  RESULTADO_ADMINISTRATIVO: 'AIT_165_LAVRADO',
+  RESULTADO_CRIME: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+};
+
+export interface CloseAlcoholProcedureInput {
+  outcome?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class CloseProcedureCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: CloseAlcoholProcedureInput = {},
+  ): Promise<Record<string, unknown>> {
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      const currentState = assertAlcoholAllowed(
+        procedure,
+        procedureId,
+        ALLOWED,
+        'close',
+      );
+
+      let effectiveResult: string;
+      let terminal: string;
+      if (currentState === 'RECUSA_REGISTRADA') {
+        effectiveResult = 'RECUSA_REGISTRADA';
+        terminal = 'AIT_165A_LAVRADO';
+      } else if (currentState === 'SINAIS_CONSTATADOS') {
+        // Res. 432 art. 6º, III: o resultado é administrativo por força de
+        // lei, sem depender do `outcome` informado.
+        effectiveResult = 'RESULTADO_ADMINISTRATIVO';
+        terminal = TERMINAL_FOR_RESULT[effectiveResult]!;
+      } else if (currentState === 'OUTRO_MEIO_PROVA') {
+        if (!input.outcome || !TERMINAL_FOR_RESULT[input.outcome])
+          throw new DetranError('TEAT.ALCOHOL_TERM_MINIMUM_CONTENT', {
+            status: 422,
+            context: { missing: ['outcome'] },
+            message: 'Encerramento por outro meio de prova exige o desfecho.',
+          });
+        effectiveResult = input.outcome;
+        terminal = TERMINAL_FOR_RESULT[effectiveResult]!;
+      } else {
+        effectiveResult = currentState;
+        terminal = TERMINAL_FOR_RESULT[currentState]!;
+      }
+
+      if (effectiveResult === 'RESULTADO_CRIME') {
+        const forwardings = await findRowsWhere(
+          this.deps,
+          tx,
+          'forwardings',
+          'procedure_id',
+          procedureId,
+        );
+        if (forwardings.length === 0) {
+          const tests = await findRowsWhere(
+            this.deps,
+            tx,
+            'tests',
+            'procedure_id',
+            procedureId,
+          );
+          const consideredMgL =
+            numberOf(tests[tests.length - 1]?.considered_mg_l) ?? 0;
+          throw new DetranError('TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME', {
+            status: 422,
+            context: { procedureId, consideredMgL, threshold: CRIME_THRESHOLD },
+            message: 'Resultado de crime exige encaminhamento registrado.',
+          });
+        }
+      }
+
+      const updated = await patchRow(this.deps, tx, 'procedures', procedureId, {
+        status: terminal,
+        outcome: terminal,
+      });
+
+      return {
+        id: procedureId,
+        status: stringOf(updated?.status ?? terminal),
+        outcome: stringOf(updated?.outcome ?? terminal),
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/events.ts b/backend/domains/inf/alcohol/src/handwritten/events.ts
new file mode 100644
index 0000000..7b44cca
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/events.ts
@@ -0,0 +1,57 @@
+// CTG-0004 §9 (M16, R-0008, TASK-0009) — envelopes dos eventos de
+// alcoolemia. `id` é sempre da outbox (CTG-0001 §13 item 5). Nenhum efeito
+// sem token em §8 publica evento (§14 item 6 / OD-T21) — só os dois listados
+// abaixo existem nesta rodada.
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import { alcoholEnvelope, type AlcoholScope } from './alcohol-runtime.js';
+
+export interface AlcoholTestRegisteredData extends Record<string, unknown> {
+  procedureId: string;
+  testId: string;
+  breathalyzerId: string | null;
+  testedAt: string;
+  resultMgL: number;
+  maxErrorMgL: number;
+  consideredMgL: number;
+  outcome: string;
+  toState: string;
+}
+
+export interface AlcoholRefusalRegisteredData extends Record<string, unknown> {
+  procedureId: string;
+  refusalId: string;
+  kind: string;
+  refusedAt: string;
+  toState: string;
+}
+
+export function alcoholTestRegisteredEvent(
+  scope: AlcoholScope,
+  data: AlcoholTestRegisteredData,
+): TeatEventEnvelope {
+  return alcoholEnvelope({
+    type: 'alcohol.changed',
+    domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'alcohol-procedure', id: data.procedureId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function alcoholRefusalRegisteredEvent(
+  scope: AlcoholScope,
+  data: AlcoholRefusalRegisteredData,
+): TeatEventEnvelope {
+  return alcoholEnvelope({
+    type: 'alcohol.changed',
+    domainEvent: 'ALCOOLEMIA_RECUSA_REGISTRADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'alcohol-procedure', id: data.procedureId, version: 1 },
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.spec.ts
new file mode 100644
index 0000000..0c7a4e1
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.spec.ts
@@ -0,0 +1,246 @@
+// CTG-0004 §3, §5.5 e §11 (R-0008, TASK-0008) — C-0004-13 (linha `forward`).
+// `handwritten/forward-procedure.command.ts` nasce em TASK-0009. Vocabulário
+// de `forwarding_type` fixado pelo contrato (§5.5, §14 item 8): `exame_sangue`,
+// `exame_clinico`, `exame_laboratorial`, `policia_judiciaria` — a coluna não
+// tem check, é vocabulário de modelagem desta rodada, não token canônico.
+// Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `ForwardProcedureCommand`, construtor `(deps)`,
+// método `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `forward` (CTG-0004 §3). */
+const ALLOWED_STATES = [
+  'IMPOSSIBILIDADE_TECNICA',
+  'RESULTADO_CRIME',
+  'RESULTADO_ADMINISTRATIVO',
+  'SINAIS_CONSTATADOS',
+];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      forwardings: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function forwardProcedure(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./forward-procedure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/forward-procedure.command.ts ainda não existe (TASK-0009, CTG-0004 §5.5)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ForwardProcedureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'forward-procedure.command.ts não exporta um comando construtível (CTG-0004 §5.5)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'forward-procedure.command.ts não expõe execute|handle|run (CTG-0004 §5.5)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const BASE_BODY = {
+  forwarding_type: 'exame_sangue',
+  destination: 'Fixture — Instituto Médico Legal',
+};
+
+describe('CTG-0004 §3/§5.5 — forward: matriz de estados (C-0004-13, linha `forward`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando forward então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          forwardProcedure(dependencies, id, BASE_BODY),
+        ).resolves.toMatchObject({ procedure_id: id });
+      } else {
+        await expect(
+          forwardProcedure(dependencies, id, BASE_BODY),
+        ).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'forward',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.5 — forward: transição condicional para OUTRO_MEIO_PROVA', () => {
+  const PROCEDURE_IMPOSSIBILIDADE = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'IMPOSSIBILIDADE_TECNICA',
+  )!.id;
+  const PROCEDURE_SINAIS = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'SINAIS_CONSTATADOS',
+  )!.id;
+
+  it('dado forwarding_type de exame a partir de IMPOSSIBILIDADE_TECNICA então status=OUTRO_MEIO_PROVA', async () => {
+    const dependencies = deps();
+    const result = await forwardProcedure(
+      dependencies,
+      PROCEDURE_IMPOSSIBILIDADE,
+      BASE_BODY,
+    );
+    expect(result.procedure_status).toBe('OUTRO_MEIO_PROVA');
+  });
+
+  it('dado forward a partir de SINAIS_CONSTATADOS então o status não muda', async () => {
+    const dependencies = deps();
+    const result = await forwardProcedure(
+      dependencies,
+      PROCEDURE_SINAIS,
+      BASE_BODY,
+    );
+    expect(result.procedure_status).toBe('SINAIS_CONSTATADOS');
+  });
+
+  it('dado forwarding_type fora do vocabulário então 422 TEAT.ENUM_INVALID com { field: "forwarding_type" }', async () => {
+    const dependencies = deps();
+    await expect(
+      forwardProcedure(dependencies, PROCEDURE_IMPOSSIBILIDADE, {
+        ...BASE_BODY,
+        forwarding_type: 'destino_invalido',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ENUM_INVALID',
+      status: 422,
+      context: expect.objectContaining({ field: 'forwarding_type' }),
+    });
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts
new file mode 100644
index 0000000..9e9f167
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts
@@ -0,0 +1,106 @@
+// CTG-0004 §5.5, §14 item 8 (R-0008, TASK-0009) —
+// `POST procedures/{id}/forwardings`. `forwarding_type` é vocabulário de
+// modelagem desta rodada (a coluna não tem check), não token canônico.
+import { DetranError } from '@detran/shared';
+
+import {
+  assertAlcoholAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+
+const ALLOWED = [
+  'IMPOSSIBILIDADE_TECNICA',
+  'RESULTADO_CRIME',
+  'RESULTADO_ADMINISTRATIVO',
+  'SINAIS_CONSTATADOS',
+] as const;
+const FORWARDING_TYPES = [
+  'exame_sangue',
+  'exame_clinico',
+  'exame_laboratorial',
+  'policia_judiciaria',
+] as const;
+const EXAM_TYPES = new Set<string>([
+  'exame_sangue',
+  'exame_clinico',
+  'exame_laboratorial',
+]);
+
+export interface RecordAlcoholForwardingInput {
+  forwarding_type: string;
+  destination: string;
+  forwarded_at?: string;
+  protocol?: string;
+  notes?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class ForwardProcedureCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: RecordAlcoholForwardingInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    if (
+      !(FORWARDING_TYPES as readonly string[]).includes(input.forwarding_type)
+    )
+      throw new DetranError('TEAT.ENUM_INVALID', {
+        status: 422,
+        context: {
+          field: 'forwarding_type',
+          allowed: [...FORWARDING_TYPES],
+        },
+        message: 'Tipo de encaminhamento fora do vocabulário desta rodada.',
+      });
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      const currentState = assertAlcoholAllowed(
+        procedure,
+        procedureId,
+        ALLOWED,
+        'forward',
+      );
+
+      const forwardedAt = input.forwarded_at ?? scope.occurredAt;
+      const forwarding = await insertRow(this.deps, tx, 'forwardings', {
+        procedure_id: procedureId,
+        forwarding_type: input.forwarding_type,
+        destination: input.destination,
+        forwarded_at: forwardedAt,
+        protocol: input.protocol ?? null,
+        notes: input.notes ?? null,
+      });
+
+      const target =
+        currentState === 'IMPOSSIBILIDADE_TECNICA' &&
+        EXAM_TYPES.has(input.forwarding_type)
+          ? 'OUTRO_MEIO_PROVA'
+          : currentState;
+      if (target !== currentState)
+        await patchRow(this.deps, tx, 'procedures', procedureId, {
+          status: target,
+        });
+
+      return {
+        id: stringOf(forwarding.id),
+        procedure_id: procedureId,
+        forwarding_type: input.forwarding_type,
+        destination: input.destination,
+        procedure_status: target,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/index.ts b/backend/domains/inf/alcohol/src/handwritten/index.ts
new file mode 100644
index 0000000..a6b2e4e
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/index.ts
@@ -0,0 +1,13 @@
+// CTG-0004 §12 (R-0008, TASK-0009) — reexportação dos comandos manuscritos de
+// alcoolemia.
+export * from './alcohol-lifecycle.provider.js';
+export * from './alcohol-runtime.js';
+export * from './classification.js';
+export * from './close-procedure.command.js';
+export * from './events.js';
+export * from './forward-procedure.command.js';
+export * from './metrological-table.js';
+export * from './record-refusal.command.js';
+export * from './record-signs.command.js';
+export * from './record-test.command.js';
+export * from './start-procedure.command.js';
diff --git a/backend/domains/inf/alcohol/src/handwritten/metrological-table.ts b/backend/domains/inf/alcohol/src/handwritten/metrological-table.ts
new file mode 100644
index 0000000..c11b81e
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/metrological-table.ts
@@ -0,0 +1,45 @@
+// CTG-0004 §3.1 (R-0008, TASK-0009, RN-TEAT-133) — formato de
+// `inf.normative_metrological_table.table_json` e `max_error` da faixa.
+export interface ToleranceRange {
+  from: number;
+  to: number | null;
+  max_error: number;
+}
+
+export interface MetrologicalTableJson {
+  unit: string;
+  thresholds: { administrative: number; crime: number };
+  tolerance: ToleranceRange[];
+}
+
+export function isMetrologicalTableJson(
+  value: unknown,
+): value is MetrologicalTableJson {
+  if (!value || typeof value !== 'object') return false;
+  const candidate = value as Partial<MetrologicalTableJson>;
+  return (
+    Array.isArray(candidate.tolerance) &&
+    typeof candidate.thresholds === 'object' &&
+    candidate.thresholds !== null
+  );
+}
+
+/** `max_error` da faixa de `tolerance` cujo `[from, to)` contém `resultMgL`;
+ * `to: null` é aberta. Sem faixa correspondente, usa a última (mais alta). */
+export function maxErrorFor(
+  table: MetrologicalTableJson,
+  resultMgL: number,
+): number {
+  const match = table.tolerance.find(
+    (range) =>
+      resultMgL >= range.from && (range.to === null || resultMgL < range.to),
+  );
+  if (match) return match.max_error;
+  const last = table.tolerance[table.tolerance.length - 1];
+  return last ? last.max_error : 0;
+}
+
+/** `considered = max(0, result − max_error)` (CTG-0004 §3.1). */
+export function consideredOf(resultMgL: number, maxError: number): number {
+  return Math.max(0, resultMgL - maxError);
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.spec.ts
new file mode 100644
index 0000000..ceeec41
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.spec.ts
@@ -0,0 +1,231 @@
+// CTG-0004 §3, §5.3 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
+// `record-refusal`), C-0004-20 e C-0004-21. `handwritten/record-refusal.command.ts`
+// nasce em TASK-0009. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `RecordRefusalCommand`, construtor `(deps)`,
+// método `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `record-refusal` (CTG-0004 §3). */
+const ALLOWED_STATES = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      refusals: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordRefusal(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-refusal.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/record-refusal.command.ts ainda não existe (TASK-0009, CTG-0004 §5.3)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordRefusalCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-refusal.command.ts não exporta um comando construtível (CTG-0004 §5.3)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-refusal.command.ts não expõe execute|handle|run (CTG-0004 §5.3)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const BASE_BODY = { refusal_description: 'Fixture — condutor se recusou' };
+
+describe('CTG-0004 §3/§5.3 — record-refusal: matriz de estados (C-0004-13, linha `record-refusal`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando record-refusal (kind=refusal) então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      const body = { ...BASE_BODY, kind: 'refusal' };
+      if (admitted) {
+        await expect(
+          recordRefusal(dependencies, id, body),
+        ).resolves.toMatchObject({ procedure_id: id });
+      } else {
+        await expect(
+          recordRefusal(dependencies, id, body),
+        ).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'record-refusal',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.3 — record-refusal: kind obrigatório e nunca o mesmo estado (C-0004-20, C-0004-21)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+  const PROCEDURE_ETILOMETRO = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'ETILOMETRO_OFERECIDO',
+  )!.id;
+
+  it('C-0004-20 — dado kind ausente então 400 TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRefusal(dependencies, PROCEDURE_TRIAGEM, BASE_BODY),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED',
+      status: 400,
+    });
+  });
+
+  it("C-0004-21 — dado kind='refusal' então status=RECUSA_REGISTRADA", async () => {
+    const dependencies = deps();
+    const result = await recordRefusal(dependencies, PROCEDURE_TRIAGEM, {
+      ...BASE_BODY,
+      kind: 'refusal',
+    });
+    expect(result.procedure_status).toBe('RECUSA_REGISTRADA');
+  });
+
+  it("C-0004-21 — dado kind='technical_impossibility' então status=IMPOSSIBILIDADE_TECNICA (nunca RECUSA_REGISTRADA)", async () => {
+    const dependencies = deps();
+    const result = await recordRefusal(dependencies, PROCEDURE_ETILOMETRO, {
+      ...BASE_BODY,
+      kind: 'technical_impossibility',
+    });
+    expect(result.procedure_status).toBe('IMPOSSIBILIDADE_TECNICA');
+    expect(result.procedure_status).not.toBe('RECUSA_REGISTRADA');
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts
new file mode 100644
index 0000000..ec510f8
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts
@@ -0,0 +1,91 @@
+// CTG-0004 §5.3 (R-0008, TASK-0009, RN-TEAT-134) —
+// `POST procedures/{id}/refusals`.
+import { DetranError } from '@detran/shared';
+
+import { alcoholRefusalRegisteredEvent } from './events.js';
+import {
+  appendEvent,
+  assertAlcoholAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+
+const ALLOWED = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'] as const;
+const TARGET_BY_KIND: Record<string, string> = {
+  refusal: 'RECUSA_REGISTRADA',
+  technical_impossibility: 'IMPOSSIBILIDADE_TECNICA',
+};
+
+export interface RecordAlcoholRefusalInput {
+  refused_at?: string;
+  refusal_description: string;
+  witness_person_id?: string;
+  evidence_id?: string;
+  kind?: 'refusal' | 'technical_impossibility';
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class RecordRefusalCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: RecordAlcoholRefusalInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    const kind = input.kind;
+    if (!kind || !TARGET_BY_KIND[kind])
+      throw new DetranError('TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED', {
+        status: 400,
+        context: {},
+        message: 'Recusa exige o tipo (recusa ou impossibilidade técnica).',
+      });
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-refusal');
+
+      const refusedAt = input.refused_at ?? scope.occurredAt;
+      const target = TARGET_BY_KIND[kind];
+      const refusal = await insertRow(this.deps, tx, 'refusals', {
+        procedure_id: procedureId,
+        refused_at: refusedAt,
+        kind,
+        refusal_description: input.refusal_description,
+        witness_person_id: input.witness_person_id ?? null,
+        evidence_id: input.evidence_id ?? null,
+      });
+      await patchRow(this.deps, tx, 'procedures', procedureId, {
+        status: target,
+        outcome: kind,
+      });
+      await appendEvent(
+        this.deps,
+        tx,
+        alcoholRefusalRegisteredEvent(scope, {
+          procedureId,
+          refusalId: stringOf(refusal.id),
+          kind,
+          refusedAt,
+          toState: target,
+        }),
+      );
+
+      return {
+        id: stringOf(refusal.id),
+        procedure_id: procedureId,
+        kind,
+        procedure_status: target,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-signs.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.spec.ts
new file mode 100644
index 0000000..f8f5fd9
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.spec.ts
@@ -0,0 +1,260 @@
+// CTG-0004 §3, §5.4 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
+// `record-psychomotor-signs`) e C-0004-22. `handwritten/record-signs.command.ts`
+// nasce em TASK-0009. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `RecordSignsCommand`, construtor `(deps)`, método
+// `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `record-psychomotor-signs` (CTG-0004 §3). */
+const ALLOWED_STATES = [
+  'TRIAGEM',
+  'ETILOMETRO_OFERECIDO',
+  'IMPOSSIBILIDADE_TECNICA',
+  'OUTRO_MEIO_PROVA',
+];
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      signs: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordSigns(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-signs.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/record-signs.command.ts ainda não existe (TASK-0009, CTG-0004 §5.4)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordSignsCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-signs.command.ts não exporta um comando construtível (CTG-0004 §5.4)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-signs.command.ts não expõe execute|handle|run (CTG-0004 §5.4)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const TWO_SIGNS = [
+  { sign_code: 'ODOR_ETILICO', description: 'Odor etílico', observed: true },
+  {
+    sign_code: 'OLHOS_AVERMELHADOS',
+    description: 'Olhos avermelhados',
+    observed: true,
+  },
+];
+
+describe('CTG-0004 §3/§5.4 — record-psychomotor-signs: matriz de estados (C-0004-13, linha `record-psychomotor-signs`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando record-psychomotor-signs (2 sinais) então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      const body = { signs: TWO_SIGNS };
+      if (admitted) {
+        await expect(
+          recordSigns(dependencies, id, body),
+        ).resolves.toMatchObject({ procedure_id: id });
+      } else {
+        await expect(recordSigns(dependencies, id, body)).rejects.toMatchObject(
+          {
+            code: 'TEAT.ALCOHOL_STATE_INVALID',
+            status: 409,
+            context: expect.objectContaining({
+              procedureId: id,
+              currentState: state,
+              allowed: ALLOWED_STATES,
+              command: 'record-psychomotor-signs',
+            }),
+          },
+        );
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.4 — record-psychomotor-signs: conjunto de ao menos dois sinais (C-0004-22, RN-TEAT-132)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('C-0004-22 — dado um único sinal observed então 422 TEAT.ALCOHOL_SIGNS_SET_REQUIRED com { observed: 1, required: 2 }', async () => {
+    const dependencies = deps();
+    await expect(
+      recordSigns(dependencies, PROCEDURE_TRIAGEM, {
+        signs: [TWO_SIGNS[0]],
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_SIGNS_SET_REQUIRED',
+      status: 422,
+      context: expect.objectContaining({
+        observed: 1,
+        required: 2,
+        legalBasis: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0004-22 — dado dois sinais observed a partir de TRIAGEM então 201 e SINAIS_CONSTATADOS', async () => {
+    const dependencies = deps();
+    const result = await recordSigns(dependencies, PROCEDURE_TRIAGEM, {
+      signs: TWO_SIGNS,
+    });
+    expect(result.procedure_status).toBe('SINAIS_CONSTATADOS');
+  });
+
+  it('dado um sinal com observed=false não contado então 422 (apenas os observed=true contam para o conjunto)', async () => {
+    const dependencies = deps();
+    await expect(
+      recordSigns(dependencies, PROCEDURE_TRIAGEM, {
+        signs: [TWO_SIGNS[0], { ...TWO_SIGNS[1], observed: false }],
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_SIGNS_SET_REQUIRED',
+      context: expect.objectContaining({ observed: 1 }),
+    });
+  });
+
+  for (const state of ['IMPOSSIBILIDADE_TECNICA', 'OUTRO_MEIO_PROVA']) {
+    it(`dado dois sinais a partir de ${state} então o status não muda (§5.4: sinais complementam outro meio de prova)`, async () => {
+      const procedureId = ALL_PROCEDURE_STATES.find(
+        (entry) => entry.state === state,
+      )!.id;
+      const dependencies = deps();
+      const result = await recordSigns(dependencies, procedureId, {
+        signs: TWO_SIGNS,
+      });
+      expect(result.procedure_status).toBe(state);
+    });
+  }
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts
new file mode 100644
index 0000000..84e4dac
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts
@@ -0,0 +1,115 @@
+// CTG-0004 §5.4 (R-0008, TASK-0009, RN-TEAT-132) —
+// `POST procedures/{id}/psychomotor-signs`.
+import { DetranError } from '@detran/shared';
+
+import {
+  assertAlcoholAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+
+const ALLOWED = [
+  'TRIAGEM',
+  'ETILOMETRO_OFERECIDO',
+  'IMPOSSIBILIDADE_TECNICA',
+  'OUTRO_MEIO_PROVA',
+] as const;
+/** Pré-estados a partir dos quais o conjunto de sinais fecha a triagem
+ * (CTG-0004 §5.4); nos demais os sinais só complementam outro meio de prova. */
+const TRIAGE_STATES = new Set(['TRIAGEM', 'ETILOMETRO_OFERECIDO']);
+const REQUIRED_OBSERVED = 2;
+
+export interface PsychomotorSignInput {
+  sign_code: string;
+  description: string;
+  observed?: boolean;
+  sign_group?: string;
+  sign_status?: string;
+  method?: string;
+}
+
+export interface RecordPsychomotorSignsInput {
+  signs: PsychomotorSignInput[];
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class RecordSignsCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: RecordPsychomotorSignsInput,
+  ): Promise<Record<string, unknown>> {
+    scopeOf(this.deps);
+    const signs = input.signs ?? [];
+    const observedCount = signs.filter(
+      (sign) => sign.observed !== false,
+    ).length;
+    if (observedCount < REQUIRED_OBSERVED)
+      throw new DetranError('TEAT.ALCOHOL_SIGNS_SET_REQUIRED', {
+        status: 422,
+        context: {
+          observed: observedCount,
+          required: REQUIRED_OBSERVED,
+          legalBasis: 'Res. 432 art. 5º §1º',
+        },
+        message: 'Sinais psicomotores exigem conjunto, nunca sinal isolado.',
+      });
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      const currentState = assertAlcoholAllowed(
+        procedure,
+        procedureId,
+        ALLOWED,
+        'record-psychomotor-signs',
+      );
+
+      const created: Array<{
+        id: string;
+        sign_code: string;
+        observed: boolean;
+      }> = [];
+      for (const sign of signs) {
+        const observed = sign.observed ?? true;
+        const row = await insertRow(this.deps, tx, 'signs', {
+          procedure_id: procedureId,
+          sign_code: sign.sign_code,
+          description: sign.description,
+          observed,
+          sign_group: sign.sign_group ?? null,
+          sign_status: sign.sign_status ?? null,
+          method: sign.method ?? null,
+        });
+        created.push({
+          id: stringOf(row.id),
+          sign_code: sign.sign_code,
+          observed,
+        });
+      }
+
+      const target = TRIAGE_STATES.has(currentState)
+        ? 'SINAIS_CONSTATADOS'
+        : currentState;
+      if (target !== currentState)
+        await patchRow(this.deps, tx, 'procedures', procedureId, {
+          status: target,
+        });
+
+      return {
+        procedure_id: procedureId,
+        procedure_status: target,
+        signs: created,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts
new file mode 100644
index 0000000..02642ac
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts
@@ -0,0 +1,393 @@
+// CTG-0004 §3, §3.1, §5.2 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
+// `record-test`), C-0004-14, C-0004-15, C-0004-16, C-0004-17, C-0004-18 e
+// C-0004-19. `handwritten/record-test.command.ts` nasce em TASK-0009.
+// Fixtures: `28-fixtures-teat-measures-alcohol.sql` (`…ea000001` etilômetro
+// vigente até 2027-06-30, `…ea000002` vencido em 2025-12-31;
+// `…eb000001` tabela metrológica ativa, `table_json.thresholds` = {
+// administrative: 0.05, crime: 0.34 } (normativo, RN-TEAT-133) e
+// `table_json.tolerance` = [{0.00–0.40: max_error 0.04}, {0.40–∞: max_error
+// 0.05}] — SOURCE_PENDING (Anexo I da Res. 432 não capturado); os testes
+// abaixo leem `max_error` **da fixture**, nunca de constante própria
+// (regra do prompt, item 17). Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `RecordTestCommand`, construtor `(deps)`, método
+// `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const BREATHALYZER_VALID = '00000000-0000-7000-8000-0000ea000001';
+const BREATHALYZER_EXPIRED = '00000000-0000-7000-8000-0000ea000002';
+const METROLOGICAL_TABLE_ACTIVE = '00000000-0000-7000-8000-0000eb000001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/** `table_json` real de `28-fixtures-teat-measures-alcohol.sql` (CTG-0004 §3.1). */
+const TABLE_JSON = {
+  unit: 'mg/L',
+  thresholds: { administrative: 0.05, crime: 0.34 },
+  tolerance: [
+    { from: 0.0, to: 0.4, max_error: 0.04 },
+    { from: 0.4, to: null, max_error: 0.05 },
+  ],
+};
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `record-test` (CTG-0004 §3). */
+const ALLOWED_STATES = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    list: vi.fn(async () => store),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      tests: repository(),
+      breathalyzers: repository([
+        {
+          id: BREATHALYZER_VALID,
+          tenant_id: TENANT_ID,
+          calibration_valid_until: '2027-06-30',
+          status: 'active',
+        },
+        {
+          id: BREATHALYZER_EXPIRED,
+          tenant_id: TENANT_ID,
+          calibration_valid_until: '2025-12-31',
+          status: 'active',
+        },
+      ]),
+      metrologicalTables: repository([
+        {
+          id: METROLOGICAL_TABLE_ACTIVE,
+          tenant_id: TENANT_ID,
+          catalog_id: CATALOG_ACTIVE,
+          status: 'active',
+          table_json: TABLE_JSON,
+        },
+      ]),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordTest(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-test.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/record-test.command.ts ainda não existe (TASK-0009, CTG-0004 §5.2)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordTestCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-test.command.ts não exporta um comando construtível (CTG-0004 §5.2)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-test.command.ts não expõe execute|handle|run (CTG-0004 §5.2)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const VALID_BODY = {
+  breathalyzer_id: BREATHALYZER_VALID,
+  result_mg_l: 0.3,
+  tested_at: '2026-09-14T10:00:00-04:00',
+};
+
+describe('CTG-0004 §3/§5.2 — record-test: matriz de estados (C-0004-13, linha `record-test`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando record-test então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          recordTest(dependencies, id, VALID_BODY),
+        ).resolves.toMatchObject({ procedure_id: id });
+      } else {
+        await expect(
+          recordTest(dependencies, id, VALID_BODY),
+        ).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'record-test',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.2 — record-test: guarda metrológica (C-0004-14, C-0004-15, C-0004-16)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('C-0004-14 — dado o etilômetro …ea000002 (verificação vencida) então 422 TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED com { breathalyzerId, calibrationValidUntil, testedAt }', async () => {
+    const dependencies = deps();
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, {
+        ...VALID_BODY,
+        breathalyzer_id: BREATHALYZER_EXPIRED,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED',
+      status: 422,
+      context: expect.objectContaining({
+        breathalyzerId: BREATHALYZER_EXPIRED,
+        calibrationValidUntil: expect.any(String),
+        testedAt: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0004-15 — dado nenhuma normative_metrological_table status=active então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        tests: repository(),
+        breathalyzers: repository([
+          {
+            id: BREATHALYZER_VALID,
+            tenant_id: TENANT_ID,
+            calibration_valid_until: '2027-06-30',
+            status: 'active',
+          },
+        ]),
+        metrologicalTables: repository([]),
+      },
+    });
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
+      status: 422,
+    });
+  });
+
+  it('C-0004-16 — dado result_mg_l ausente então 400 TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', async () => {
+    const dependencies = deps();
+    const body = { ...VALID_BODY } as Record<string, unknown>;
+    delete body.result_mg_l;
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, body),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_RESULT_PAIR_REQUIRED',
+      status: 400,
+    });
+  });
+});
+
+describe('CTG-0004 §3.1/§5.2 — record-test: max_error da fixture e considered_mg_l (C-0004-17, C-0004-19)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('C-0004-17 — dado result_mg_l=0.30 então considered_mg_l = 0.30 − max_error da faixa [0.00,0.40) da fixture (0.04) = 0.26, e o estado final é RESULTADO_ADMINISTRATIVO', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.3,
+    });
+    expect(result.max_error_mg_l).toBeCloseTo(0.04, 5);
+    expect(result.considered_mg_l).toBeCloseTo(0.26, 5);
+    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
+  });
+
+  it('C-0004-19 — dado result_mg_l=0.02 (< max_error da faixa) então considered_mg_l = max(0, 0.02 − 0.04) = 0, nunca negativo', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.02,
+    });
+    expect(result.considered_mg_l).toBe(0);
+    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
+  });
+});
+
+describe('CTG-0004 §3.1/§5.2 — record-test: classificação pelos limiares da tabela (C-0004-18, WF-TEAT-005 §Limiares)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('dado considered < thresholds.administrative (0,05) então RESULTADO_ABAIXO_LIMITE', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.03,
+    });
+    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
+  });
+
+  it('dado thresholds.administrative <= considered < thresholds.crime então RESULTADO_ADMINISTRATIVO', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.3,
+    });
+    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
+  });
+
+  it('dado considered >= thresholds.crime (0,34) então RESULTADO_CRIME', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.5,
+    });
+    expect(result.max_error_mg_l).toBeCloseTo(0.05, 5);
+    expect(result.considered_mg_l).toBeCloseTo(0.45, 5);
+    expect(result.procedure_status).toBe('RESULTADO_CRIME');
+  });
+});
+
+describe('CTG-0004 §5.2 — record-test: evento ALCOOLEMIA_TESTE_REGISTRADO', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('dado record-test então alcohol.changed/ALCOOLEMIA_TESTE_REGISTRADO é publicado com resultMgL, maxErrorMgL e consideredMgL', async () => {
+    const dependencies = deps();
+    await recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY);
+    expect(dependencies.outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'alcohol.changed',
+        domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
+        aggregate: expect.objectContaining({
+          kind: 'alcohol-procedure',
+          id: PROCEDURE_TRIAGEM,
+        }),
+        data: expect.objectContaining({
+          procedureId: PROCEDURE_TRIAGEM,
+          resultMgL: 0.3,
+          maxErrorMgL: expect.any(Number),
+          consideredMgL: expect.any(Number),
+        }),
+      }),
+    );
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
new file mode 100644
index 0000000..647b97a
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
@@ -0,0 +1,142 @@
+// CTG-0004 §3.1, §5.2 (R-0008, TASK-0009, RN-TEAT-133) —
+// `POST procedures/{id}/tests`.
+import { DetranError } from '@detran/shared';
+
+import { classifyConsidered } from './classification.js';
+import { alcoholTestRegisteredEvent } from './events.js';
+import {
+  appendEvent,
+  assertAlcoholAllowed,
+  findActiveRow,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+import {
+  consideredOf,
+  isMetrologicalTableJson,
+  maxErrorFor,
+  type MetrologicalTableJson,
+} from './metrological-table.js';
+
+const ALLOWED = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'] as const;
+
+export interface RecordAlcoholTestInput {
+  breathalyzer_id?: string;
+  test_number?: string;
+  tested_at?: string;
+  result_mg_l?: number;
+  counterproof?: boolean;
+  result_image_evidence_id?: string;
+  outcome?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class RecordTestCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: RecordAlcoholTestInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    const testedAt = input.tested_at ?? scope.occurredAt;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-test');
+
+      // 1. guard central ([WF-TEAT-005]): etilômetro com verificação vigente.
+      const breathalyzerId = input.breathalyzer_id ?? '';
+      const breathalyzer = breathalyzerId
+        ? await findRow(this.deps, tx, 'breathalyzers', breathalyzerId)
+        : undefined;
+      const calibrationValidUntil = stringOf(
+        breathalyzer?.calibration_valid_until,
+      );
+      const notVerified =
+        !breathalyzer ||
+        breathalyzer.status !== 'active' ||
+        !calibrationValidUntil ||
+        calibrationValidUntil.slice(0, 10) < testedAt.slice(0, 10);
+      if (notVerified)
+        throw new DetranError('TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED', {
+          status: 422,
+          context: { breathalyzerId, calibrationValidUntil, testedAt },
+          message: 'Etilômetro sem verificação metrológica vigente.',
+        });
+
+      // 2. tabela metrológica ativa do catálogo vigente do órgão.
+      const tableRow = await findActiveRow(this.deps, tx, 'metrologicalTables');
+      if (!tableRow || !isMetrologicalTableJson(tableRow.table_json))
+        throw new DetranError('TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', {
+          status: 422,
+          context: { catalogId: tableRow?.catalog_id ?? null },
+          message: 'Nenhuma tabela metrológica ativa para o órgão.',
+        });
+      const table = tableRow.table_json as MetrologicalTableJson;
+
+      // 3. `result_mg_l` obrigatório.
+      if (typeof input.result_mg_l !== 'number')
+        throw new DetranError('TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', {
+          status: 400,
+          context: {},
+          message: 'Resultado do teste é obrigatório.',
+        });
+
+      const resultMgL = input.result_mg_l;
+      const maxErrorMgL = maxErrorFor(table, resultMgL);
+      const consideredMgL = consideredOf(resultMgL, maxErrorMgL);
+      const outcome = classifyConsidered(consideredMgL, table.thresholds);
+
+      const test = await insertRow(this.deps, tx, 'tests', {
+        procedure_id: procedureId,
+        breathalyzer_id: breathalyzerId || null,
+        test_number: input.test_number ?? null,
+        tested_at: testedAt,
+        result_mg_l: resultMgL,
+        max_error_mg_l: maxErrorMgL,
+        considered_mg_l: consideredMgL,
+        counterproof: input.counterproof ?? false,
+        result_image_evidence_id: input.result_image_evidence_id ?? null,
+        status: 'recorded',
+      });
+      await patchRow(this.deps, tx, 'procedures', procedureId, {
+        status: outcome,
+        outcome,
+      });
+      await appendEvent(
+        this.deps,
+        tx,
+        alcoholTestRegisteredEvent(scope, {
+          procedureId,
+          testId: stringOf(test.id),
+          breathalyzerId: breathalyzerId || null,
+          testedAt,
+          resultMgL,
+          maxErrorMgL,
+          consideredMgL,
+          outcome,
+          toState: outcome,
+        }),
+      );
+
+      return {
+        id: stringOf(test.id),
+        procedure_id: procedureId,
+        result_mg_l: resultMgL,
+        max_error_mg_l: maxErrorMgL,
+        considered_mg_l: consideredMgL,
+        procedure_status: outcome,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.spec.ts
new file mode 100644
index 0000000..30bc446
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.spec.ts
@@ -0,0 +1,182 @@
+// CTG-0004 §3, §5.1 e §11 (R-0008, TASK-0008) — C-0004-13 (linha `start` da
+// matriz 6×15). `handwritten/start-procedure.command.ts` nasce em
+// TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`
+// (`…ee0000nn`, uma por estado de [WF-TEAT-005]). Relógio fixo em
+// 2026-09-14.
+//
+// Nome esperado do export: `StartProcedureCommand`, construtor `(deps)`,
+// método `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/** Uma linha por token de [WF-TEAT-005] (CTG-0004 §3, §10). */
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `start` (CTG-0004 §3: só ABORDAGEM). */
+const ALLOWED_STATES = ['ABORDAGEM'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      notes: null,
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? { procedures: proceduresRepo() },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function startProcedure(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./start-procedure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/start-procedure.command.ts ainda não existe (TASK-0009, CTG-0004 §5.1)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.StartProcedureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'start-procedure.command.ts não exporta um comando construtível (CTG-0004 §5.1)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'start-procedure.command.ts não expõe execute|handle|run (CTG-0004 §5.1)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §3/§5.1 — start: matriz de estados (C-0004-13, linha `start`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando start então ${admitted ? 'sucesso, status=TRIAGEM' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        const result = await startProcedure(dependencies, id);
+        expect(result.status).toBe('TRIAGEM');
+      } else {
+        await expect(startProcedure(dependencies, id)).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'start',
+          }),
+        });
+      }
+    });
+  }
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts
new file mode 100644
index 0000000..c422f8c
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts
@@ -0,0 +1,46 @@
+// CTG-0004 §5.1 (R-0008, TASK-0009) — `POST procedures/{id}/start`.
+import {
+  assertAlcoholAllowed,
+  findRow,
+  inTenantTransaction,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+} from './alcohol-runtime.js';
+
+const ALLOWED = ['ABORDAGEM'] as const;
+const TARGET = 'TRIAGEM';
+
+export interface StartProcedureInput {
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class StartProcedureCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: StartProcedureInput = {},
+  ): Promise<Record<string, unknown>> {
+    scopeOf(this.deps);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'start');
+
+      const updated = await patchRow(this.deps, tx, 'procedures', procedureId, {
+        status: TARGET,
+        notes: input.reason ?? (procedure.notes as string | null) ?? null,
+      });
+
+      return {
+        id: procedureId,
+        status: stringOf(updated?.status ?? TARGET),
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts b/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts
new file mode 100644
index 0000000..f0f0bac
--- /dev/null
+++ b/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts
@@ -0,0 +1,197 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+  seedTriagemProcedure,
+  verifyRepositories,
+} from './harness.js';
+
+/**
+ * CTG-0004 §5 e §11 (R-0008, TASK-0008) — C-0004-32, C-0004-33 e
+ * C-0004-34: transação única + outbox dos comandos de alcoolemia (M16) e
+ * rollback atômico. Tenant isolado (rait-test-strategy.md §6): os
+ * procedimentos criados nascem só para este arquivo.
+ */
+
+const TEST_EXPORTS = ['RecordTestCommand'];
+const REFUSAL_EXPORTS = ['RecordRefusalCommand'];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+function outboxAppend(targetTenantId: string) {
+  return async (
+    _tx: unknown,
+    envelope: Record<string, unknown>,
+  ): Promise<{ id: string }> => {
+    await client.query(
+      `insert into integration.outbox
+         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+       values ($1, $2, $3, $4, $5, $6)
+       on conflict (tenant_id, idempotency_key) do nothing
+       returning id`,
+      [
+        targetTenantId,
+        envelope.type,
+        (envelope.aggregate as { kind: string }).kind,
+        (envelope.aggregate as { id: string }).id,
+        JSON.stringify(envelope),
+        `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+      ],
+    );
+    return { id: 'ignored' };
+  };
+}
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'inf-alcohol-commands');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0004 §5.2 — record-test: transação única e outbox (C-0004-32)', () => {
+  it('C-0004-32 — dado record-test então sai ALCOOLEMIA_TESTE_REGISTRADO com resultMgL, maxErrorMgL e consideredMgL', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: outboxAppend(tenantId) },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/record-test.command.js'),
+      'inf/alcohol/src/handwritten/record-test.command.ts',
+      TEST_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.procedureId,
+      {
+        breathalyzer_id: seeded.breathalyzerId,
+        result_mg_l: 0.3,
+        tested_at: '2026-09-14T10:00:00-04:00',
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const registered = envelopes.find(
+      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
+    );
+    expect(registered).toBeTruthy();
+    const data = registered?.data as Record<string, unknown>;
+    expect(data.resultMgL).toBeCloseTo(0.3, 5);
+    expect(typeof data.maxErrorMgL).toBe('number');
+    expect(typeof data.consideredMgL).toBe('number');
+  });
+});
+
+describe('CTG-0004 §5.3 — record-refusal: transação única e outbox (C-0004-33)', () => {
+  it('C-0004-33 — dado record-refusal então sai ALCOOLEMIA_RECUSA_REGISTRADA com kind', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: outboxAppend(tenantId) },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/record-refusal.command.js'),
+      'inf/alcohol/src/handwritten/record-refusal.command.ts',
+      REFUSAL_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.procedureId,
+      {
+        kind: 'refusal',
+        refusal_description: 'Fixture — condutor se recusou (integração)',
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const registered = envelopes.find(
+      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_RECUSA_REGISTRADA',
+    );
+    expect(registered).toBeTruthy();
+    expect((registered?.data as Record<string, unknown>).kind).toBe('refusal');
+  });
+});
+
+describe('CTG-0004 §5.2 — record-test: rollback atômico (C-0004-34)', () => {
+  it('C-0004-34 — dado um rollback forçado (outbox.append falha) então nem a linha de alcohol_test nem o envelope existem', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async () => {
+          throw new Error('forced rollback (C-0004-34)');
+        },
+      },
+    });
+    await expect(
+      runCommand(
+        () => importModule('../../src/handwritten/record-test.command.js'),
+        'inf/alcohol/src/handwritten/record-test.command.ts',
+        TEST_EXPORTS,
+        COMMAND_METHODS,
+        dependencies,
+        seeded.procedureId,
+        {
+          breathalyzer_id: seeded.breathalyzerId,
+          result_mg_l: 0.3,
+          tested_at: '2026-09-14T10:00:00-04:00',
+        },
+      ),
+    ).rejects.toThrow();
+    const tests = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).tests.findByProcedure(seeded.procedureId);
+    expect(tests).toEqual([]);
+    // OD-T63: restrito ao agregado do próprio caso — outros testes deste
+    // arquivo (C-0004-32/33) publicam ALCOOLEMIA_TESTE_REGISTRADO/
+    // ALCOOLEMIA_RECUSA_REGISTRADA no mesmo tenant desde `startedAt`; sem o
+    // filtro por `aggregate.id`, um envelope de outro caso poderia mascarar
+    // o rollback deste.
+    const envelopes = (
+      await outboxEnvelopes(client, tenantId, startedAt)
+    ).filter(
+      (envelope) =>
+        (envelope.aggregate as { id?: string } | undefined)?.id ===
+        seeded.procedureId,
+    );
+    expect(
+      envelopes.some(
+        (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
+      ),
+    ).toBe(false);
+  });
+});
diff --git a/backend/domains/inf/alcohol/tests/integration/harness.ts b/backend/domains/inf/alcohol/tests/integration/harness.ts
new file mode 100644
index 0000000..d5fc68e
--- /dev/null
+++ b/backend/domains/inf/alcohol/tests/integration/harness.ts
@@ -0,0 +1,386 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { vi } from 'vitest';
+
+/**
+ * Harness de integração de `@detran/inf-alcohol` (R-0008, TASK-0008,
+ * CTG-0004 §11). Não é um arquivo de teste: `vitest.config.ts` inclui só
+ * `tests/integration/**\/*.integration.spec.ts`. Padrão herdado de
+ * `backend/domains/ops/evidence/tests/integration/harness.ts` (TASK-0006).
+ */
+const { Client } = pg;
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+/** Tenant e ids canônicos de `28-fixtures-teat-measures-alcohol.sql`. */
+export const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  actorId: '00000000-0000-4000-8000-0000b0000001',
+  shiftId: '00000000-0000-7000-8000-0000e3000001',
+  breathalyzerValid: '00000000-0000-7000-8000-0000ea000001',
+  metrologicalTableActive: '00000000-0000-7000-8000-0000eb000001',
+} as const;
+
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export function newClient(): pg.Client {
+  return new Client({ connectionString: CONNECTION_STRING });
+}
+
+export function database(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+export function requestContext(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+interface SqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+export class SqlInfRepository {
+  constructor(
+    private readonly db: ReturnType<typeof database>,
+    private readonly table: string,
+  ) {
+    if (!/^inf\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
+  }
+
+  list(): Promise<Record<string, unknown>[]> {
+    return this.db.tx(
+      async (tx) =>
+        (
+          await (tx as SqlTransaction).query(
+            `select * from ${this.table} order by created_at desc`,
+          )
+        ).rows,
+    );
+  }
+
+  find(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  findOne(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.find(id);
+  }
+
+  findByProcedure(procedureId: string): Promise<Record<string, unknown>[]> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where procedure_id = $1`,
+        [procedureId],
+      );
+      return result.rows;
+    });
+  }
+
+  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
+    const entries = Object.entries(values);
+    const columns = entries.map(([key]) => key);
+    if (columns.some((key) => !/^[a-z_]+$/.test(key)))
+      throw new Error('Invalid inf write field');
+    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `insert into ${this.table} (${columns.join(', ')}) values (${placeholders}) returning *`,
+        entries.map(([, value]) => value),
+      );
+      return result.rows[0] as Record<string, unknown>;
+    });
+  }
+
+  update(
+    id: string,
+    patch: Record<string, unknown>,
+  ): Promise<Record<string, unknown> | undefined> {
+    const entries = Object.entries(patch);
+    const assignments = entries
+      .map(([key], index) => `${key} = $${index + 2}`)
+      .join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `update ${this.table} set ${assignments} where id = $1 returning *`,
+        [id, ...entries.map(([, value]) => value)],
+      );
+      return result.rows[0];
+    });
+  }
+}
+
+export function repositories(db: ReturnType<typeof database>) {
+  return {
+    procedures: new SqlInfRepository(db, 'inf.alcohol_procedure'),
+    tests: new SqlInfRepository(db, 'inf.alcohol_test'),
+    refusals: new SqlInfRepository(db, 'inf.alcohol_refusal'),
+    signs: new SqlInfRepository(db, 'inf.alcohol_psychomotor_sign'),
+    forwardings: new SqlInfRepository(db, 'inf.alcohol_forwarding'),
+    breathalyzers: new SqlInfRepository(db, 'inf.alcohol_breathalyzer'),
+    metrologicalTables: new SqlInfRepository(
+      db,
+      'inf.normative_metrological_table',
+    ),
+  };
+}
+
+/**
+ * Repositórios só para as consultas de verificação do próprio teste,
+ * **depois** que o comando já terminou (commit ou rollback) — nunca
+ * injetados no comando. Cada método de `SqlInfRepository` abre a sua
+ * própria transação (`db.tx`); se fossem passados em `repositories` a um
+ * comando que já está dentro de `dependencies.database.tx(...)`, o
+ * `begin`/`commit` interno fecharia a transação externa mais cedo (Postgres
+ * não aninha `BEGIN`/`COMMIT` simples — verificado empiricamente: um
+ * `commit` aninhado encerra a transação real). Por isso `commandDeps`
+ * abaixo manda `repositories: {}` por padrão, igual à fiação de produção
+ * (`evidence-commands.provider.ts`: "`repositories` fica vazio de
+ * propósito"), e o comando cai no caminho de SQL cru com a `tx`
+ * compartilhada.
+ */
+export function verifyRepositories(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+) {
+  return repositories(database(client, tenantId, actorId));
+}
+
+/**
+ * Dependências do comando. **Proposta do Inspector, não valor canônico**
+ * (mesmo precedente de `ops/evidence/tests/integration/harness.ts`), com a
+ * correção acima: `repositories: {}` por padrão.
+ */
+export function commandDeps(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  overrides: Record<string, unknown> = {},
+) {
+  const db = database(client, tenantId, actorId);
+  return {
+    database: db,
+    requestContext: requestContext(tenantId, actorId),
+    repositories: {},
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => new Date().toISOString() },
+    ...overrides,
+  };
+}
+
+export async function runCommand(
+  load: () => Promise<unknown>,
+  label: string,
+  exportNames: readonly string[],
+  methodNames: readonly string[],
+  dependencies: unknown,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await load()) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(`${label} ainda não existe (TASK-0009, CTG-0004 §11)`, {
+      cause,
+    });
+  }
+  const exported =
+    exportNames
+      .map((name) => loaded[name])
+      .find((value) => typeof value === 'function') ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error(`${label} não exporta nada construtível`);
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const instance = new Command(dependencies);
+  const method = methodNames
+    .map((name) => instance[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function')
+    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    instance,
+    ...args,
+  )) as Record<string, unknown>;
+}
+
+/** Tenant isolado por arquivo (rait-test-strategy.md §6). */
+export async function isolatedTenant(
+  client: pg.Client,
+  slug: string,
+): Promise<{ tenantId: string; actorId: string }> {
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      tenantId,
+      `${slug}-${tenantId.slice(0, 8)}`,
+      `${slug} ${tenantId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [tenantId, actorId],
+  );
+  return { tenantId, actorId };
+}
+
+export async function dropTenant(
+  client: pg.Client,
+  tenantId: string,
+): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  for (const table of [
+    'inf.alcohol_forwarding',
+    'inf.alcohol_psychomotor_sign',
+    'inf.alcohol_refusal',
+    'inf.alcohol_test',
+    'inf.alcohol_procedure',
+    'inf.alcohol_breathalyzer',
+    'inf.normative_metrological_table',
+    'inf.normative_catalog',
+    'integration.outbox',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
+  }
+  await client.query('delete from auth.memberships where tenant_id = $1', [
+    tenantId,
+  ]);
+  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
+  await client.query('delete from auth.tenants where id = $1', [tenantId]);
+}
+
+/** Um procedimento TRIAGEM com etilômetro e tabela metrológica próprios, no tenant isolado. */
+export async function seedTriagemProcedure(
+  client: pg.Client,
+  tenantId: string,
+  agencyId: string,
+  agentId: string,
+  shiftId: string,
+): Promise<{
+  procedureId: string;
+  breathalyzerId: string;
+  catalogId: string;
+  tableId: string;
+}> {
+  const procedureId = randomUUID();
+  const breathalyzerId = randomUUID();
+  const catalogId = randomUUID();
+  const tableId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into inf.alcohol_breathalyzer
+       (id, tenant_id, traffic_agency_id, serial_number, calibration_valid_until, status)
+     values ($1, $2, $3, $4, '2027-06-30', 'active')`,
+    [
+      breathalyzerId,
+      tenantId,
+      agencyId,
+      `ETL-ISO-${breathalyzerId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into inf.normative_catalog
+       (id, tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status, normative_source)
+     values ($1, $2, $3, $4, 'enquadramentos', '2026.1', '2026-01-01', 'active', 'fixture isolada')`,
+    [
+      catalogId,
+      tenantId,
+      agencyId,
+      `Catálogo isolado ${catalogId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into inf.normative_metrological_table
+       (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
+     values ($1, $2, $3, 'Tabela isolada', '2026.1', $4::jsonb, '2026-01-01', 'active')`,
+    [
+      tableId,
+      tenantId,
+      catalogId,
+      JSON.stringify({
+        unit: 'mg/L',
+        thresholds: { administrative: 0.05, crime: 0.34 },
+        tolerance: [
+          { from: 0.0, to: 0.4, max_error: 0.04 },
+          { from: 0.4, to: null, max_error: 0.05 },
+        ],
+      }),
+    ],
+  );
+  await client.query(
+    `insert into inf.alcohol_procedure
+       (id, tenant_id, traffic_agency_id, agent_id, shift_id, procedure_at,
+        procedure_type, outcome, status)
+     values ($1, $2, $3, $4, $5, now(), 'etilometro', '', 'TRIAGEM')`,
+    [procedureId, tenantId, agencyId, agentId, shiftId],
+  );
+  return { procedureId, breathalyzerId, catalogId, tableId };
+}
+
+export async function outboxEnvelopes(
+  client: pg.Client,
+  tenantId: string,
+  since: string,
+): Promise<Record<string, unknown>[]> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const result = await client.query<{ payload: Record<string, unknown> }>(
+    `select payload from integration.outbox
+      where tenant_id = $1 and created_at >= $2
+      order by created_at, id`,
+    [tenantId, since],
+  );
+  return result.rows.map((row) => row.payload);
+}
diff --git a/backend/domains/inf/measures/src/handwritten/cancel-measure.command.spec.ts b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.spec.ts
new file mode 100644
index 0000000..6e2660d
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.spec.ts
@@ -0,0 +1,148 @@
+// CTG-0004 §1, §4.7, §11 e §14 item 2 (R-0008, TASK-0008) — C-0004-01 (linha
+// `cancel`) e C-0004-12 (OD-T37): [WF-TEAT-004] não tem estado de
+// cancelamento; a rota responde sempre 409 TEAT.MEASURE_STATE_INVALID com
+// `allowed: []`, comportamento já implementado em
+// `measure-lifecycle.service.ts` hoje (`cancel` rejeita sempre) — este
+// arquivo prova o novo formato de erro (`DetranError`/`context`) que
+// TASK-0009 precisa produzir. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `CancelMeasureCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`.
+import { describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(): Deps {
+  return {
+    database: {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: {
+      hasActiveContext: () => true,
+      snapshot: () => ({
+        tenantId: TENANT_ID,
+        actorId: '00000000-0000-4000-8000-0000b0000001',
+      }),
+    },
+    repositories: {
+      measures: repository(
+        ALL_MEASURE_STATES.map(({ id, state }) => ({
+          id,
+          tenant_id: TENANT_ID,
+          current_status: state,
+        })),
+      ),
+      history: repository(),
+    },
+    outbox: { append: vi.fn(async () => ({ id: 'outbox-row-1' })) },
+    clock: { now: () => '2026-09-14T15:00:00.000Z' },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function cancelMeasure(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./cancel-measure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/cancel-measure.command.ts ainda não existe (TASK-0009, CTG-0004 §4.7)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.CancelMeasureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'cancel-measure.command.ts não exporta um comando construtível (CTG-0004 §4.7)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'cancel-measure.command.ts não expõe execute|handle|run (CTG-0004 §4.7)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+describe('CTG-0004 §1/§4.7 — cancel: matriz de estados (C-0004-01, linha `cancel`) e C-0004-12 (OD-T37)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    it(`C-0004-12 — dada medida ${id} em ${state} quando cancel então sempre 409 TEAT.MEASURE_STATE_INVALID com allowed: []`, async () => {
+      const dependencies = deps();
+      await expect(
+        cancelMeasure(dependencies, id, {
+          reason: 'Fixture — pedido de teste',
+        }),
+      ).rejects.toMatchObject({
+        code: 'TEAT.MEASURE_STATE_INVALID',
+        status: 409,
+        context: expect.objectContaining({
+          measureId: id,
+          currentState: state,
+          allowed: [],
+          command: 'cancel',
+        }),
+      });
+      expect(dependencies.repositories.measures.update).not.toHaveBeenCalled();
+    });
+  }
+});
diff --git a/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts
new file mode 100644
index 0000000..b42e607
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/cancel-measure.command.ts
@@ -0,0 +1,33 @@
+// CTG-0004 §4.7, §14 item 2 (R-0008, TASK-0009, OD-T37) —
+// `POST administrative-measures/{id}/cancel`.
+//
+// [WF-TEAT-004] não tem estado de cancelamento: a rota existe (route
+// contract §6) e responde sempre 409 `TEAT.MEASURE_STATE_INVALID` com
+// `allowed: []` — nenhum estado admite `cancel`. `source_pending` (OD-T37).
+import {
+  findRow,
+  inTenantTransaction,
+  measureStateInvalid,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+export interface CancelMeasureInput {
+  reason: string;
+  user_ref?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class CancelMeasureCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(measureId: string, _input: CancelMeasureInput): Promise<never> {
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      const currentState = stringOf(measure.current_status);
+      throw measureStateInvalid(measureId, currentState, [], 'cancel');
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/conclude-measure.command.spec.ts b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.spec.ts
new file mode 100644
index 0000000..dfbed12
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.spec.ts
@@ -0,0 +1,201 @@
+// CTG-0004 §1, §4.7 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `conclude`).
+// `handwritten/conclude-measure.command.ts` nasce em TASK-0009. Relógio fixo
+// em 2026-09-14.
+//
+// Nome esperado do export: `ConcludeMeasureCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `conclude` (CTG-0004 §1: só LIBERADO_COM_PRAZO). */
+const ALLOWED_STATES = ['LIBERADO_COM_PRAZO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function measuresRepo() {
+  return repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: measuresRepo(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function concludeMeasure(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./conclude-measure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/conclude-measure.command.ts ainda não existe (TASK-0009, CTG-0004 §4.7)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ConcludeMeasureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'conclude-measure.command.ts não exporta um comando construtível (CTG-0004 §4.7)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'conclude-measure.command.ts não expõe execute|handle|run (CTG-0004 §4.7)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §1/§4.7 — conclude: matriz de estados (C-0004-01, linha `conclude`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando conclude então ${admitted ? 'sucesso, current_status=REGULARIZADO' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        const result = await concludeMeasure(dependencies, id);
+        expect(result).toMatchObject({
+          current_status: 'REGULARIZADO',
+          ended_at: expect.any(String),
+        });
+      } else {
+        await expect(concludeMeasure(dependencies, id)).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'conclude',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §4.7 — conclude: evento MEDIDA_CONCLUIDA', () => {
+  const MEASURE_COM_PRAZO = ALL_MEASURE_STATES.find(
+    (entry) => entry.state === 'LIBERADO_COM_PRAZO',
+  )!.id;
+
+  it('dado conclude então measure.changed/MEDIDA_CONCLUIDA é publicado com fromState e toState', async () => {
+    const dependencies = deps();
+    await concludeMeasure(dependencies, MEASURE_COM_PRAZO);
+    expect(dependencies.outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'measure.changed',
+        domainEvent: 'MEDIDA_CONCLUIDA',
+        aggregate: expect.objectContaining({
+          kind: 'administrative-measure',
+          id: MEASURE_COM_PRAZO,
+        }),
+        data: expect.objectContaining({
+          measureId: MEASURE_COM_PRAZO,
+          fromState: 'LIBERADO_COM_PRAZO',
+          toState: 'REGULARIZADO',
+        }),
+      }),
+    );
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts
new file mode 100644
index 0000000..2537e53
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/conclude-measure.command.ts
@@ -0,0 +1,75 @@
+// CTG-0004 §4.7 (R-0008, TASK-0009) — `POST administrative-measures/{id}/conclude`.
+import { measureConcludedEvent } from './events.js';
+import {
+  appendEvent,
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  patchRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = ['LIBERADO_COM_PRAZO'] as const;
+const TARGET = 'REGULARIZADO';
+
+export interface ConcludeMeasureInput {
+  ended_at?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class ConcludeMeasureCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    input: ConcludeMeasureInput = {},
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      const currentState = assertMeasureAllowed(
+        measure,
+        measureId,
+        ALLOWED,
+        'conclude',
+      );
+
+      const endedAt = input.ended_at ?? scope.occurredAt;
+      const updated = await patchRow(this.deps, tx, 'measures', measureId, {
+        current_status: TARGET,
+        ended_at: endedAt,
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        TARGET,
+        'Administrative measure concluded',
+        scope.actorId,
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        measureConcludedEvent(scope, {
+          measureId,
+          fromState: currentState,
+          toState: TARGET,
+          endedAt,
+        }),
+      );
+
+      return {
+        id: measureId,
+        current_status: TARGET,
+        ended_at: stringOf(updated?.ended_at ?? endedAt),
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/deadlines.spec.ts b/backend/domains/inf/measures/src/handwritten/deadlines.spec.ts
new file mode 100644
index 0000000..e103bc2
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/deadlines.spec.ts
@@ -0,0 +1,176 @@
+// CTG-0004 §2 e §14 item 3 (R-0008, TASK-0008, OD-T38) — `computeMeasureDue`,
+// função local que calcula os prazos de medida (`T-REG30`, `T-REG15`,
+// `T-DEPOSITO6M`) sem passar por `DeadlineEngine.computeDue` de
+// `@detran/inf-deadlines`: aquele pacote não cobre `owner='medida'`
+// (`TimerCode`/`TimerOwnerKind` não têm os seis códigos, CTG-0004 §14 item 3).
+// A opção fixada pelo Architect é uma função local que delega ao `Calendar`
+// (arredondamento para o próximo dia útil) e reaproveita as funções puras de
+// `@detran/inf-deadlines` (`addCalendarDays`/`addCalendarMonths`, exportadas
+// publicamente) — nunca duplicando a regra de contagem.
+//
+// Assinatura esperada (proposta do Inspector, TASK-0008; o Engineer segue-a
+// em TASK-0009 — mesmo precedente de CTG-0002 §13.3):
+//
+//   export type MeasureTimerCode = 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M';
+//   export interface MeasureTimerDefinition {
+//     durationValue: number;
+//     durationUnit: 'dias_corridos' | 'meses';
+//   }
+//   export function computeMeasureDue(
+//     code: MeasureTimerCode,
+//     startOn: string, // data civil YYYY-MM-DD
+//     calendar: Calendar, // de @detran/inf-deadlines
+//     tenantId: string,
+//     catalog: Record<MeasureTimerCode, MeasureTimerDefinition>,
+//   ): Promise<{ rawDueOn: string; dueOn: string }>
+//
+// `catalog` existe porque, em produção, a duração/unidade vêm de
+// `inf.infraction_timer_ref` (DDL 14: T-REG30=30 dias_corridos,
+// T-REG15=15 dias_corridos, T-DEPOSITO6M=6 meses — valores lidos direto da
+// DDL, nunca inventados); em unit não há banco (rait-test-strategy.md §1), e
+// o catálogo é passado explicitamente. `dueOn = próximo dia útil >=
+// rawDueOn` é a mesma regra de `DeadlineEngine.roundForward`
+// (backend/domains/inf/deadlines/src/engine.ts) — já testada em R-0006; este
+// arquivo prova só o valor final para os três códigos de medida (nota do
+// maestro, TASK-0008).
+import { readFileSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+
+interface CalendarJson {
+  national?: Record<string, string>;
+  optional?: Record<string, string>;
+  am?: Record<string, string>;
+  manaus?: Record<string, string>;
+}
+
+const calendar2026 = JSON.parse(
+  readFileSync(
+    fileURLToPath(
+      new URL(
+        '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
+        import.meta.url,
+      ),
+    ),
+    'utf8',
+  ),
+) as CalendarJson;
+
+/**
+ * Réplica mínima, só para este teste, do contrato público `Calendar` de
+ * `@detran/inf-deadlines` (backend/domains/inf/deadlines/src/calendar.ts,
+ * classe `InMemoryCalendar`) — `inf-measures` ainda não declara
+ * `@detran/inf-deadlines` como dependência de workspace (isso é trabalho do
+ * Engineer em TASK-0009, CTG-0004 §12: "dependencies + '@detran/inf-deadlines'");
+ * um import de pacote inexistente derrubaria o arquivo inteiro (nenhum teste
+ * coletado) antes mesmo do `computeMeasureDue` ausente ser exercitado. Um
+ * import relativo profundo para dentro de `inf/deadlines/src` violaria
+ * ADR-0001 ("no deep relative imports" entre módulos de domínio). Feriado =
+ * chave de `national`, `am` ou `manaus` da mesma fixture usada por
+ * `inf/deadlines/tests/unit/deadline-engine.spec.ts` (R-0006); `optional`
+ * (ponto facultativo) não é feriado — mesma regra.
+ */
+function calendarFrom(json: CalendarJson) {
+  const holidays = new Set<string>([
+    ...Object.keys(json.national ?? {}),
+    ...Object.keys(json.am ?? {}),
+    ...Object.keys(json.manaus ?? {}),
+  ]);
+  function isWeekend(date: string): boolean {
+    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
+    return day === 0 || day === 6;
+  }
+  function addDays(date: string, days: number): string {
+    const ms = new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000;
+    return new Date(ms).toISOString().slice(0, 10);
+  }
+  return {
+    async isBusinessDay(d: string): Promise<boolean> {
+      return !isWeekend(d) && !holidays.has(d);
+    },
+    async nextBusinessDay(d: string): Promise<string> {
+      let candidate = addDays(d, 1);
+      while (!(await this.isBusinessDay(candidate))) {
+        candidate = addDays(candidate, 1);
+      }
+      return candidate;
+    },
+  };
+}
+
+/** DDL 14 (inf.infraction_timer_ref), owner='medida': valores canônicos. */
+const MEASURE_TIMER_CATALOG = {
+  'T-REG30': { durationValue: 30, durationUnit: 'dias_corridos' },
+  'T-REG15': { durationValue: 15, durationUnit: 'dias_corridos' },
+  'T-DEPOSITO6M': { durationValue: 6, durationUnit: 'meses' },
+} as const;
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function computeMeasureDue(
+  code: keyof typeof MEASURE_TIMER_CATALOG,
+  startOn: string,
+): Promise<{ rawDueOn: string; dueOn: string }> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./deadlines.js')) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/deadlines.ts ainda não existe (TASK-0009, CTG-0004 §14 item 3)',
+      { cause },
+    );
+  }
+  const fn = loaded.computeMeasureDue;
+  if (typeof fn !== 'function') {
+    throw new Error(
+      'deadlines.ts não exporta computeMeasureDue (CTG-0004 §14 item 3)',
+    );
+  }
+  return (
+    fn as (
+      code: string,
+      startOn: string,
+      calendar: ReturnType<typeof calendarFrom>,
+      tenantId: string,
+      catalog: typeof MEASURE_TIMER_CATALOG,
+    ) => Promise<{ rawDueOn: string; dueOn: string }>
+  )(
+    code,
+    startOn,
+    calendarFrom(calendar2026),
+    TENANT_ID,
+    MEASURE_TIMER_CATALOG,
+  );
+}
+
+describe('CTG-0004 §2 — computeMeasureDue: T-REG30, T-REG15, T-DEPOSITO6M (OD-T38)', () => {
+  it('dado T-REG30 a partir de 2026-09-14 (segunda) então dueOn = 2026-10-14 (quarta, dia útil, sem prorrogação)', async () => {
+    await expect(computeMeasureDue('T-REG30', '2026-09-14')).resolves.toEqual({
+      rawDueOn: '2026-10-14',
+      dueOn: '2026-10-14',
+    });
+  });
+
+  it('dado T-REG15 a partir de 2026-09-14 (segunda) então dueOn = 2026-09-29 (terça, dia útil, sem prorrogação)', async () => {
+    await expect(computeMeasureDue('T-REG15', '2026-09-14')).resolves.toEqual({
+      rawDueOn: '2026-09-29',
+      dueOn: '2026-09-29',
+    });
+  });
+
+  it('dado T-REG30 a partir de 2026-10-03 então rawDueOn = 2026-11-02 (Finados, feriado nacional da fixture) e dueOn prorroga para 2026-11-03 (terça, dia útil)', async () => {
+    await expect(computeMeasureDue('T-REG30', '2026-10-03')).resolves.toEqual({
+      rawDueOn: '2026-11-02',
+      dueOn: '2026-11-03',
+    });
+  });
+
+  it('dado T-DEPOSITO6M a partir de 2026-09-14 então rawDueOn = 2027-03-14 (domingo, soma de calendário em meses) e dueOn prorroga para 2027-03-15 (segunda; 2027 fora do calendário de feriados da fixture, só o fim de semana pesa)', async () => {
+    await expect(
+      computeMeasureDue('T-DEPOSITO6M', '2026-09-14'),
+    ).resolves.toEqual({ rawDueOn: '2027-03-14', dueOn: '2027-03-15' });
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/deadlines.ts b/backend/domains/inf/measures/src/handwritten/deadlines.ts
new file mode 100644
index 0000000..9932d14
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/deadlines.ts
@@ -0,0 +1,104 @@
+// CTG-0004 §2 e §14 item 3 (R-0008, TASK-0009, OD-T38) — `computeMeasureDue`.
+//
+// §15.1 (adenda do maestro, iteração 2): `@detran/inf-deadlines` entrou em
+// `module.dependencies`/`testAliases` de `BP-INF-MEASURES-001` — a réplica
+// local de `addCalendarDays`/`addCalendarMonths` foi removida; a aritmética
+// de dias/meses vem sempre do motor (M14: "prazos nunca calculados fora de
+// @detran/inf-deadlines"). `computeDue` do `DeadlineEngine` não se aplica
+// diretamente: seu `TimerCatalog` não cobre `owner='medida'` (`TimerCode`
+// não tem os seis códigos, CTG-0004 §14 item 3) — por isso `computeMeasureDue`
+// continua uma função local (OD-T38 opção b), mas agora só orquestra as
+// funções puras do pacote real sobre um `Calendar` (mesmo contrato público),
+// nunca duplicando a regra de contagem.
+import {
+  addCalendarDays,
+  addCalendarMonths,
+  InMemoryCalendar,
+  type Calendar,
+  type CalendarJson,
+} from '@detran/inf-deadlines';
+import { readFileSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
+
+export type MeasureTimerCode = 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M';
+
+export interface MeasureTimerDefinition {
+  durationValue: number;
+  durationUnit: 'dias_corridos' | 'meses';
+}
+
+/** DDL 14 (`inf.infraction_timer_ref`), `owner='medida'` (CTG-0004 §2). */
+export const MEASURE_TIMER_CATALOG: Record<
+  MeasureTimerCode,
+  MeasureTimerDefinition
+> = {
+  'T-REG30': { durationValue: 30, durationUnit: 'dias_corridos' },
+  'T-REG15': { durationValue: 15, durationUnit: 'dias_corridos' },
+  'T-DEPOSITO6M': { durationValue: 6, durationUnit: 'meses' },
+};
+
+/**
+ * `computeMeasureDue` — assinatura proposta pelo Inspector (`deadlines.spec.ts`):
+ * `rawDueOn` é a soma pura (`@detran/inf-deadlines` `addCalendarDays`/
+ * `addCalendarMonths`); `dueOn` arredonda para o próximo dia útil >=
+ * `rawDueOn` (mesma regra de `DeadlineEngine.roundForward`, sem duplicá-la —
+ * só delega ao `Calendar` injetado).
+ */
+export async function computeMeasureDue(
+  code: MeasureTimerCode,
+  startOn: string,
+  calendar: Calendar,
+  tenantId: string,
+  catalog: Record<
+    MeasureTimerCode,
+    MeasureTimerDefinition
+  > = MEASURE_TIMER_CATALOG,
+): Promise<{ rawDueOn: string; dueOn: string }> {
+  const definition = catalog[code];
+  const rawDueOn =
+    definition.durationUnit === 'dias_corridos'
+      ? addCalendarDays(startOn, definition.durationValue)
+      : addCalendarMonths(startOn, definition.durationValue);
+  const dueOn = (await calendar.isBusinessDay(rawDueOn, tenantId))
+    ? rawDueOn
+    : await calendar.nextBusinessDay(rawDueOn, tenantId);
+  return { rawDueOn, dueOn };
+}
+
+/**
+ * `Calendar` de produção — `InMemoryCalendar` de `@detran/inf-deadlines`
+ * sobre a mesma fixture de feriados do motor
+ * (`docs/framework/arch/fixtures/calendar-2026.json`).
+ */
+function loadCalendarJson(): CalendarJson {
+  const path = fileURLToPath(
+    new URL(
+      '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
+      import.meta.url,
+    ),
+  );
+  return JSON.parse(readFileSync(path, 'utf8')) as CalendarJson;
+}
+
+export function createProductionCalendar(): Calendar {
+  return new InMemoryCalendar(loadCalendarJson());
+}
+
+/**
+ * Fábrica da porta `MeasureDeadlinesPort` (`measure-runtime.ts`) — três
+ * argumentos, o formato que os comandos recebem via `deps.deadlines`.
+ */
+export function createMeasureDeadlinesPort(
+  calendar: Calendar = createProductionCalendar(),
+): {
+  computeMeasureDue(
+    code: MeasureTimerCode,
+    startOn: string,
+    tenantId: string,
+  ): Promise<{ rawDueOn: string; dueOn: string }>;
+} {
+  return {
+    computeMeasureDue: (code, startOn, tenantId) =>
+      computeMeasureDue(code, startOn, calendar, tenantId),
+  };
+}
diff --git a/backend/domains/inf/measures/src/handwritten/events.ts b/backend/domains/inf/measures/src/handwritten/events.ts
new file mode 100644
index 0000000..74b7946
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/events.ts
@@ -0,0 +1,92 @@
+// CTG-0004 §9 (M16, R-0008, TASK-0009) — envelopes dos eventos de medidas
+// administrativas. `type` técnico + `domainEvent` canônico do route contract
+// §8 (`rait-events-sse-contract.md` §1); `id` é sempre da outbox (CTG-0001
+// §13 item 5). Nenhum efeito sem token em §8 publica evento (§14 item 6 /
+// OD-T21).
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import { measureEnvelope, type MeasureScope } from './measure-runtime.js';
+
+export interface MeasureStartedData extends Record<string, unknown> {
+  measureId: string;
+  measureTypeId: string;
+  aitId: string | null;
+  agentId: string | null;
+  currentStatus: string;
+  startedAt: string;
+}
+
+export interface MeasureConcludedData extends Record<string, unknown> {
+  measureId: string;
+  fromState: string;
+  toState: string;
+  endedAt: string;
+}
+
+export interface MeasureTermIssuedData extends Record<string, unknown> {
+  measureId: string;
+  termId: string;
+  termType: string;
+  termNumber: string;
+  issuedAt: string;
+  withdrawalDeadlineAt: string | null;
+  ctbDeadlineAt: string | null;
+  contentHash: string;
+}
+
+export function measureStartedEvent(
+  scope: MeasureScope,
+  data: MeasureStartedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'MEDIDA_INICIADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
+
+export function measureConcludedEvent(
+  scope: MeasureScope,
+  data: MeasureConcludedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'MEDIDA_CONCLUIDA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
+
+export function measureTermIssuedEvent(
+  scope: MeasureScope,
+  data: MeasureTermIssuedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'TERMO_EMITIDO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/inf/measures/src/handwritten/index.ts b/backend/domains/inf/measures/src/handwritten/index.ts
new file mode 100644
index 0000000..26775b8
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/index.ts
@@ -0,0 +1,15 @@
+// CTG-0004 §12 (R-0008, TASK-0009) — reexportação dos comandos manuscritos de
+// medidas administrativas.
+export * from './cancel-measure.command.js';
+export * from './conclude-measure.command.js';
+export * from './deadlines.js';
+export * from './events.js';
+export * from './issue-term.command.js';
+export * from './measure-lifecycle.provider.js';
+export * from './measure-runtime.js';
+export * from './record-inventory.command.js';
+export * from './record-removal.command.js';
+export * from './record-retention.command.js';
+export * from './release-retention.command.js';
+export * from './start-measure.command.js';
+export * from './term-content.js';
diff --git a/backend/domains/inf/measures/src/handwritten/issue-term.command.spec.ts b/backend/domains/inf/measures/src/handwritten/issue-term.command.spec.ts
new file mode 100644
index 0000000..7774699
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/issue-term.command.spec.ts
@@ -0,0 +1,315 @@
+// CTG-0004 §1, §2, §4.5 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
+// `apply-term`), C-0004-08, C-0004-09 e C-0004-10. `handwritten/issue-term.command.ts`
+// nasce em TASK-0009. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `IssueTermCommand`, construtor `(deps)`, método
+// `execute(measureId, dto)`. `deps.deadlines.computeMeasureDue` — mesma porta
+// de `deadlines.spec.ts` (T-DEPOSITO6M).
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `apply-term` (CTG-0004 §1). */
+const ALLOWED_STATES = [
+  'RETIDO',
+  'LIBERADO_LOCAL',
+  'LIBERADO_COM_PRAZO',
+  'REGULARIZADO',
+  'CONVERTIDO_REMOCAO',
+  'REMOVIDO',
+];
+
+/** Os sete elementos do caput do art. 14 (CTG-0004 §4.5 pré-condição 2). */
+const FULL_FIELD_DETAILS = {
+  agency: 'Fixture Órgão',
+  vehicle: 'Fixture Veículo',
+  ait_or_order_ref: 'AM-2026-000001',
+  place_datetime: '2026-09-14T09:00:00-04:00',
+  legal_basis: 'CTB art. 271',
+  custody_place: 'Fixture Pátio',
+  owner_and_driver: 'Fixture Proprietário/Condutor',
+};
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+  deadlines: {
+    computeMeasureDue: (
+      code: string,
+      startOn: string,
+      tenantId: string,
+    ) => Promise<{ rawDueOn: string; dueOn: string }>;
+  };
+}
+
+function measuresRepo() {
+  return repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: measuresRepo(),
+      terms: repository(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+    deadlines: overrides.deadlines ?? {
+      computeMeasureDue: vi.fn(async () => ({
+        rawDueOn: '2027-03-15',
+        dueOn: '2027-03-15',
+      })),
+    },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function issueTerm(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./issue-term.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/issue-term.command.ts ainda não existe (TASK-0009, CTG-0004 §4.5)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.IssueTermCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'issue-term.command.ts não exporta um comando construtível (CTG-0004 §4.5)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'issue-term.command.ts não expõe execute|handle|run (CTG-0004 §4.5)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+let termCounter = 0;
+function baseBody(overrides: Record<string, unknown> = {}) {
+  termCounter += 1;
+  return {
+    term_type: 'inventory',
+    term_number: `TERM-FIX-${termCounter}`,
+    ...overrides,
+  };
+}
+
+describe('CTG-0004 §1/§4.5 — apply-term: matriz de estados (C-0004-01, linha `apply-term`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando apply-term (term_type≠removal) então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      const body = baseBody();
+      if (admitted) {
+        await expect(issueTerm(dependencies, id, body)).resolves.toMatchObject({
+          measure_id: id,
+        });
+      } else {
+        await expect(issueTerm(dependencies, id, body)).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'apply-term',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §4.5 — apply-term term_type=removal: os dois prazos (C-0004-08, OD-T05)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-08 — dado term_type=removal sem withdrawal_deadline_at então 422 TEAT.MEASURE_TERM_DEADLINE_MISSING com missing=["withdrawal_deadline_at"]', async () => {
+    const dependencies = deps();
+    await expect(
+      issueTerm(
+        dependencies,
+        MEASURE_RETIDO,
+        baseBody({
+          term_type: 'removal',
+          field_details_json: FULL_FIELD_DETAILS,
+        }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_TERM_DEADLINE_MISSING',
+      status: 422,
+      context: expect.objectContaining({
+        missing: ['withdrawal_deadline_at'],
+      }),
+    });
+  });
+
+  it('C-0004-08 — dado term_type=removal com withdrawal_deadline_at e field_details_json completos então 201 com os dois prazos gravados', async () => {
+    const dependencies = deps();
+    const result = await issueTerm(
+      dependencies,
+      MEASURE_RETIDO,
+      baseBody({
+        term_type: 'removal',
+        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
+        issued_at: '2026-09-14T09:00:00-04:00',
+        field_details_json: FULL_FIELD_DETAILS,
+      }),
+    );
+    expect(result).toMatchObject({
+      withdrawal_deadline_at: expect.any(String),
+      ctb_deadline_at: '2027-03-15',
+      status: 'issued',
+    });
+  });
+});
+
+describe('CTG-0004 §4.5 — apply-term term_type=removal: conteúdo mínimo do caput do art. 14 (C-0004-09, RN-TEAT-126)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-09 — dado field_details_json sem os sete elementos então 422 TEAT.MEASURE_TERM_MINIMUM_CONTENT com context.missing', async () => {
+    const dependencies = deps();
+    await expect(
+      issueTerm(
+        dependencies,
+        MEASURE_RETIDO,
+        baseBody({
+          term_type: 'removal',
+          withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
+          field_details_json: { agency: 'Fixture Órgão' },
+        }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_TERM_MINIMUM_CONTENT',
+      status: 422,
+      context: expect.objectContaining({
+        missing: expect.arrayContaining([
+          'vehicle',
+          'ait_or_order_ref',
+          'place_datetime',
+          'legal_basis',
+          'custody_place',
+          'owner_and_driver',
+        ]),
+      }),
+    });
+  });
+});
+
+describe('CTG-0004 §2/§4.5 — apply-term: ctb_deadline_at = computeDue(T-DEPOSITO6M) (C-0004-10)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-10 — dado apply-term completo com issued_at=2026-09-14 então computeMeasureDue é chamado com T-DEPOSITO6M e a data de issued_at, e ctb_deadline_at é o valor devolvido', async () => {
+    const dependencies = deps();
+    const result = await issueTerm(
+      dependencies,
+      MEASURE_RETIDO,
+      baseBody({
+        term_type: 'removal',
+        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
+        issued_at: '2026-09-14T09:00:00-04:00',
+        field_details_json: FULL_FIELD_DETAILS,
+      }),
+    );
+    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
+      'T-DEPOSITO6M',
+      '2026-09-14',
+      TENANT_ID,
+    );
+    expect(result.ctb_deadline_at).toBe('2027-03-15');
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/issue-term.command.ts b/backend/domains/inf/measures/src/handwritten/issue-term.command.ts
new file mode 100644
index 0000000..dd2b6a2
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/issue-term.command.ts
@@ -0,0 +1,163 @@
+// CTG-0004 §2, §4.5 (R-0008, TASK-0009, RN-TEAT-126, OD-T05) —
+// `POST administrative-measures/{id}/terms`.
+import { createHash } from 'node:crypto';
+
+import { DetranError } from '@detran/shared';
+
+import { measureTermIssuedEvent } from './events.js';
+import { TERM_REMOVAL_REQUIRED_KEYS, missingKeys } from './term-content.js';
+import {
+  appendEvent,
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = [
+  'RETIDO',
+  'LIBERADO_LOCAL',
+  'LIBERADO_COM_PRAZO',
+  'REGULARIZADO',
+  'CONVERTIDO_REMOCAO',
+  'REMOVIDO',
+] as const;
+
+export interface IssueTermInput {
+  term_type: string;
+  term_number: string;
+  content_hash?: string;
+  file_evidence_id?: string;
+  issued_at?: string;
+  signed_by_person_id?: string;
+  withdrawal_deadline_at?: string;
+  field_details_json?: Record<string, unknown>;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+function dateOnly(value: unknown, fallback: string): string {
+  const iso = stringOf(value || fallback);
+  const parsed = new Date(iso);
+  return Number.isNaN(parsed.getTime())
+    ? fallback.slice(0, 10)
+    : parsed.toISOString().slice(0, 10);
+}
+
+function defaultContentHash(measureId: string, input: IssueTermInput): string {
+  return createHash('sha256')
+    .update(JSON.stringify({ measure_id: measureId, term: input }))
+    .digest('hex');
+}
+
+export class IssueTermCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    input: IssueTermInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    const isRemoval = input.term_type === 'removal';
+
+    if (isRemoval && !input.withdrawal_deadline_at) {
+      throw new DetranError('TEAT.MEASURE_TERM_DEADLINE_MISSING', {
+        status: 422,
+        context: { missing: ['withdrawal_deadline_at'] },
+        message:
+          'Termo de remoção sem o prazo de retirada (Res. 1.025 art. 14 §1º).',
+      });
+    }
+    if (isRemoval) {
+      const missing = missingKeys(
+        input.field_details_json,
+        TERM_REMOVAL_REQUIRED_KEYS,
+      );
+      if (missing.length > 0)
+        throw new DetranError('TEAT.MEASURE_TERM_MINIMUM_CONTENT', {
+          status: 422,
+          context: { missing },
+          message:
+            'Termo de remoção sem os sete elementos do caput do art. 14.',
+        });
+    }
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      const currentState = assertMeasureAllowed(
+        measure,
+        measureId,
+        ALLOWED,
+        'apply-term',
+      );
+
+      const issuedAt = input.issued_at ?? scope.occurredAt;
+      let ctbDeadlineAt: string | null = null;
+      if (isRemoval) {
+        const startOn = dateOnly(issuedAt, scope.occurredAt.slice(0, 10));
+        const due = await this.deps.deadlines.computeMeasureDue(
+          'T-DEPOSITO6M',
+          startOn,
+          scope.tenantId,
+        );
+        ctbDeadlineAt = due.dueOn;
+      }
+
+      const contentHash =
+        input.content_hash ?? defaultContentHash(measureId, input);
+      const term = await insertRow(this.deps, tx, 'terms', {
+        measure_id: measureId,
+        term_type: input.term_type,
+        term_number: input.term_number,
+        content_hash: contentHash,
+        file_evidence_id: input.file_evidence_id ?? null,
+        issued_at: issuedAt,
+        signed_by_person_id: input.signed_by_person_id ?? null,
+        withdrawal_deadline_at: input.withdrawal_deadline_at ?? null,
+        ctb_deadline_at: ctbDeadlineAt,
+        field_details_json: input.field_details_json ?? null,
+        status: 'issued',
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        currentState,
+        'Administrative term issued',
+        scope.actorId,
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        measureTermIssuedEvent(scope, {
+          measureId,
+          termId: stringOf(term.id),
+          termType: input.term_type,
+          termNumber: input.term_number,
+          issuedAt,
+          withdrawalDeadlineAt: input.withdrawal_deadline_at ?? null,
+          ctbDeadlineAt,
+          contentHash,
+        }),
+      );
+
+      return {
+        id: stringOf(term.id),
+        measure_id: measureId,
+        term_type: input.term_type,
+        term_number: input.term_number,
+        content_hash: contentHash,
+        withdrawal_deadline_at: input.withdrawal_deadline_at ?? null,
+        ctb_deadline_at: ctbDeadlineAt,
+        status: 'issued',
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/measure-lifecycle.provider.ts b/backend/domains/inf/measures/src/handwritten/measure-lifecycle.provider.ts
new file mode 100644
index 0000000..e3626c7
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/measure-lifecycle.provider.ts
@@ -0,0 +1,83 @@
+// CTG-0004 §12 (R-0008, TASK-0009) e §15.2 (adenda, iteração 2) — composição
+// de `MeasureCommands` no módulo gerado.
+//
+// `repositories` fica vazio de propósito (mesmo padrão de
+// `ops/evidence/src/handwritten/evidence-commands.provider.ts`, CTG-0003
+// §4): no caminho de produção toda leitura e toda escrita acontecem na
+// transação do comando (SQL parametrizado sob `withTenantContext`, role
+// `app`, RLS na volta). A porta `MeasureRowStore` existe para os dublês dos
+// tiers `unit`/`integration`.
+//
+// `featureFlags` é injetada pelo token `MEASURE_FEATURE_FLAGS`
+// (`measure-runtime.ts`): o domínio nunca lê `process.env` (§15.2) — o app
+// provê o valor real a partir de `detranFeatureFlagSet()`
+// (`backend/app/src/teat-measures.providers.ts`). Sem o provider ligado
+// (dublês/bootstraps que não montam o módulo de portas), a porta cai fechada
+// (`isEnabled` sempre `false`) — nunca assume a flag ligada por padrão.
+import type { Provider } from '@nestjs/common';
+import { SqlTeatEventOutbox } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+
+import { CancelMeasureCommand } from './cancel-measure.command.js';
+import { ConcludeMeasureCommand } from './conclude-measure.command.js';
+import { createMeasureDeadlinesPort } from './deadlines.js';
+import { IssueTermCommand } from './issue-term.command.js';
+import {
+  MEASURE_FEATURE_FLAGS,
+  type MeasureDeps,
+  type MeasureFeatureFlags,
+} from './measure-runtime.js';
+import { RecordInventoryCommand } from './record-inventory.command.js';
+import { RecordRemovalCommand } from './record-removal.command.js';
+import { RecordRetentionCommand } from './record-retention.command.js';
+import { ReleaseRetentionCommand } from './release-retention.command.js';
+import { StartMeasureCommand } from './start-measure.command.js';
+
+const CLOSED_FEATURE_FLAGS: MeasureFeatureFlags = { isEnabled: () => false };
+
+/** Bolsa dos oito comandos manuscritos de medidas (CTG-0004 §12). */
+export class MeasureCommands {
+  readonly start: StartMeasureCommand;
+  readonly registerRetention: RecordRetentionCommand;
+  readonly registerRemoval: RecordRemovalCommand;
+  readonly inventoryVehicle: RecordInventoryCommand;
+  readonly applyTerm: IssueTermCommand;
+  readonly release: ReleaseRetentionCommand;
+  readonly conclude: ConcludeMeasureCommand;
+  readonly cancel: CancelMeasureCommand;
+
+  constructor(deps: MeasureDeps) {
+    this.start = new StartMeasureCommand(deps);
+    this.registerRetention = new RecordRetentionCommand(deps);
+    this.registerRemoval = new RecordRemovalCommand(deps);
+    this.inventoryVehicle = new RecordInventoryCommand(deps);
+    this.applyTerm = new IssueTermCommand(deps);
+    this.release = new ReleaseRetentionCommand(deps);
+    this.conclude = new ConcludeMeasureCommand(deps);
+    this.cancel = new CancelMeasureCommand(deps);
+  }
+}
+
+export const MEASURE_LIFECYCLE_PROVIDER: Provider = {
+  provide: MeasureCommands,
+  inject: [
+    Database,
+    RequestContext,
+    { token: MEASURE_FEATURE_FLAGS, optional: true },
+  ],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    featureFlags?: MeasureFeatureFlags,
+  ) =>
+    new MeasureCommands({
+      database,
+      requestContext,
+      repositories: {},
+      outbox: new SqlTeatEventOutbox(),
+      clock: { now: () => new Date().toISOString() },
+      deadlines: createMeasureDeadlinesPort(),
+      featureFlags: featureFlags ?? CLOSED_FEATURE_FLAGS,
+    }),
+};
diff --git a/backend/domains/inf/measures/src/handwritten/measure-runtime.ts b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
new file mode 100644
index 0000000..6a35d8a
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
@@ -0,0 +1,329 @@
+// CTG-0004 §4, §12 (R-0008, TASK-0009) — dependências e utilidades comuns aos
+// comandos manuscritos de medidas administrativas.
+//
+// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
+// porta `MeasureRowStore` é a superfície mínima por tabela (a mesma forma de
+// `OpsRowStore`/`EvidenceRowStore`, CTG-0002 §4 / CTG-0003 §4, e a que os
+// harnesses de teste de `tests/integration/harness.ts` implementam). No
+// caminho de produção (`measure-lifecycle.provider.ts`) a porta é injetada
+// vazia (`repositories: {}`), e toda leitura/escrita acontece por SQL
+// parametrizado **na transação do comando** (`withTenantContext`, role
+// `app`, RLS na volta) — mesmo padrão de `ops/evidence` (CTG-0003 §4,
+// "repositories fica vazio de propósito").
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { TeatEventEnvelope, TeatEventOutbox } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type MeasureRow = Record<string, unknown>;
+
+export interface MeasureRowStore {
+  list?(): Promise<MeasureRow[]>;
+  find?(id: string): Promise<MeasureRow | undefined>;
+  findOne?(id: string): Promise<MeasureRow | undefined>;
+  create?(values: MeasureRow): Promise<MeasureRow>;
+  update?(
+    id: string,
+    patch: MeasureRow,
+    tx?: unknown,
+  ): Promise<MeasureRow | undefined>;
+}
+
+/**
+ * Porta de prazos de medida (OD-T38, CTG-0004 §14 item 3): assinatura de três
+ * argumentos usada pelos comandos — `deadlines.ts` no mesmo diretório expõe a
+ * função pura de cinco argumentos e a fábrica que fecha sobre `Calendar` e
+ * `MEASURE_TIMER_CATALOG` para produzir esta porta.
+ */
+export interface MeasureDeadlinesPort {
+  computeMeasureDue(
+    code: 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M',
+    startOn: string,
+    tenantId: string,
+  ): Promise<{ rawDueOn: string; dueOn: string }>;
+}
+
+/** `parameter-catalogue.md` §TEAT: `teat.monitored_custody` (DT-015). */
+export interface MeasureFeatureFlags {
+  isEnabled(flag: string): boolean;
+}
+
+/**
+ * Token de injeção da porta acima (CTG-0004 §15.2, adenda pós-TASK-0009
+ * iteração 1): o domínio nunca lê `process.env` diretamente — o app provê o
+ * valor real a partir de `detranFeatureFlagSet()`
+ * (`backend/app/src/teat-measures.providers.ts`).
+ */
+export const MEASURE_FEATURE_FLAGS = Symbol('MEASURE_FEATURE_FLAGS');
+
+export interface MeasureDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, MeasureRowStore | undefined>;
+  outbox?: TeatEventOutbox;
+  clock: { now(): string };
+  deadlines: MeasureDeadlinesPort;
+  featureFlags: MeasureFeatureFlags;
+}
+
+export interface MeasureScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+/** Tabelas tocadas pelos comandos desta tarefa (CTG-0004 §4). */
+export const MEASURE_TABLES = {
+  measures: 'inf.administrative_measure',
+  measureTypes: 'inf.measure_type',
+  terms: 'inf.administrative_term',
+  retentions: 'inf.measure_retention',
+  removals: 'inf.measure_removal',
+  inventories: 'inf.vehicle_inventory',
+  history: 'inf.measure_status_history',
+  towProviders: 'inf.tow_provider',
+  yards: 'inf.yard',
+} as const;
+
+export type MeasureTableName = keyof typeof MEASURE_TABLES;
+
+export function tenantScope(deps: MeasureDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de medida exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de medida exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function scopeOf(deps: MeasureDeps): MeasureScope {
+  const { tenantId, actorId } = tenantScope(deps);
+  return { tenantId, actorId, occurredAt: deps.clock.now() };
+}
+
+/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
+export function inTenantTransaction<T>(
+  deps: MeasureDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: MeasureDeps,
+  table: MeasureTableName,
+): MeasureRowStore | undefined {
+  return deps.repositories[table];
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+function assertColumns(values: MeasureRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de medida');
+  return columns;
+}
+
+/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export async function findRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  id: string,
+): Promise<MeasureRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${MEASURE_TABLES[table]} where id = $1`,
+    [id],
+  );
+  return result.rows[0];
+}
+
+export async function findRowsWhere(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  column: string,
+  value: unknown,
+): Promise<MeasureRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = asQueryable(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${MEASURE_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  values: MeasureRow,
+): Promise<MeasureRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = asQueryable(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${MEASURE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as MeasureRow;
+}
+
+export async function patchRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  id: string,
+  patch: MeasureRow,
+): Promise<MeasureRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = asQueryable(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${MEASURE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+/** 409 `TEAT.MEASURE_STATE_INVALID` (CTG-0004 §1). */
+export function measureStateInvalid(
+  measureId: string,
+  currentState: string,
+  allowed: readonly string[],
+  command: string,
+): DetranError {
+  return new DetranError('TEAT.MEASURE_STATE_INVALID', {
+    status: 409,
+    context: { measureId, currentState, allowed: [...allowed], command },
+    message: 'Medida administrativa fora do estado exigido pelo comando.',
+  });
+}
+
+export function assertMeasureAllowed(
+  measure: MeasureRow,
+  measureId: string,
+  allowed: readonly string[],
+  command: string,
+): string {
+  const currentState = stringOf(measure.current_status);
+  if (!allowed.includes(currentState))
+    throw measureStateInvalid(measureId, currentState, allowed, command);
+  return currentState;
+}
+
+/**
+ * Registra uma linha de `measure_status_history` (CTG-0004 §4). O relógio é
+ * o mesmo do escopo (`scope.occurredAt`), nunca `Date.now()`.
+ */
+export function recordHistory(
+  deps: MeasureDeps,
+  tx: unknown,
+  measureId: string,
+  status: string,
+  reason: string,
+  actorId?: string,
+): Promise<MeasureRow> {
+  return insertRow(deps, tx, 'history', {
+    measure_id: measureId,
+    status,
+    user_ref: actorId ?? null,
+    reason,
+  });
+}
+
+export async function appendEvent(
+  deps: MeasureDeps,
+  tx: Transaction,
+  envelope: TeatEventEnvelope,
+): Promise<void> {
+  await deps.outbox?.append(tx, envelope);
+}
+
+/**
+ * Réplica mínima de `teatEnvelope` (CTG-0001 §2 / `@detran/ops-core`):
+ * `inf/measures` não depende de `ops-core` (CTG-0004 §12 não lista essa
+ * dependência), então o construtor do envelope mora aqui — mesma forma,
+ * `id` sempre vazio (a outbox o preenche, CTG-0001 §13 item 5).
+ */
+export function measureEnvelope(input: {
+  type: string;
+  domainEvent: string;
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+}): TeatEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: input.occurredAt,
+    tenantId: input.tenantId,
+    actor: { kind: 'user', id: input.actorId },
+    correlationId: input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
diff --git a/backend/domains/inf/measures/src/handwritten/record-inventory.command.spec.ts b/backend/domains/inf/measures/src/handwritten/record-inventory.command.spec.ts
new file mode 100644
index 0000000..72e98e4
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-inventory.command.spec.ts
@@ -0,0 +1,230 @@
+// CTG-0004 §1, §4.4 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
+// `inventory-vehicle`) e C-0004-11. `handwritten/record-inventory.command.ts`
+// nasce em TASK-0009. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `RecordInventoryCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `inventory-vehicle` (CTG-0004 §1). */
+const ALLOWED_STATES = [
+  'REMOVIDO',
+  'EM_DEPOSITO',
+  'GUARDA_MONITORADA',
+  'VIOLACAO_MONITORAMENTO',
+  'NOTIFICADO',
+];
+
+/** Os quatro elementos do §1º do art. 14 (RN-TEAT-126, CTG-0004 §4.4). */
+const FULL_INVENTORY_JSON = {
+  objects_left: 'Fixture — nenhum objeto',
+  missing_mandatory_equipment: 'Fixture — nenhum',
+  body_condition: 'Fixture — sem avarias aparentes',
+  withdrawal_deadline_notice: 'Fixture — ciência dada em campo',
+};
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function measuresRepo() {
+  return repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: measuresRepo(),
+      inventories: repository(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordInventory(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-inventory.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/record-inventory.command.ts ainda não existe (TASK-0009, CTG-0004 §4.4)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordInventoryCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-inventory.command.ts não exporta um comando construtível (CTG-0004 §4.4)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-inventory.command.ts não expõe execute|handle|run (CTG-0004 §4.4)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §1/§4.4 — inventory-vehicle: matriz de estados (C-0004-01, linha `inventory-vehicle`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando inventory-vehicle então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      const body = {
+        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
+        inventory_json: FULL_INVENTORY_JSON,
+      };
+      if (admitted) {
+        await expect(
+          recordInventory(dependencies, id, body),
+        ).resolves.toMatchObject({ measure_id: id });
+      } else {
+        await expect(
+          recordInventory(dependencies, id, body),
+        ).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'inventory-vehicle',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §4.4 — inventory-vehicle: conteúdo mínimo do §1º do art. 14 (C-0004-11, RN-TEAT-126)', () => {
+  const MEASURE_REMOVIDO = ALL_MEASURE_STATES.find(
+    (entry) => entry.state === 'REMOVIDO',
+  )!.id;
+
+  it('C-0004-11 — dado inventory_json sem os quatro elementos então 422 TEAT.MEASURE_TERM_MINIMUM_CONTENT com context.missing', async () => {
+    const dependencies = deps();
+    await expect(
+      recordInventory(dependencies, MEASURE_REMOVIDO, {
+        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
+        inventory_json: { objects_left: 'Fixture — nenhum objeto' },
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_TERM_MINIMUM_CONTENT',
+      status: 422,
+      context: expect.objectContaining({
+        missing: expect.arrayContaining([
+          'missing_mandatory_equipment',
+          'body_condition',
+          'withdrawal_deadline_notice',
+        ]),
+      }),
+    });
+  });
+
+  it('C-0004-11 — dado inventory_json com os quatro elementos então 201', async () => {
+    const dependencies = deps();
+    await expect(
+      recordInventory(dependencies, MEASURE_REMOVIDO, {
+        vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
+        inventory_json: FULL_INVENTORY_JSON,
+      }),
+    ).resolves.toMatchObject({ measure_id: MEASURE_REMOVIDO });
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts b/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts
new file mode 100644
index 0000000..5cef16a
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-inventory.command.ts
@@ -0,0 +1,86 @@
+// CTG-0004 §4.4 (R-0008, TASK-0009, RN-TEAT-126) —
+// `POST administrative-measures/{id}/inventories`.
+import { DetranError } from '@detran/shared';
+
+import { INVENTORY_REQUIRED_KEYS, missingKeys } from './term-content.js';
+import {
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = [
+  'REMOVIDO',
+  'EM_DEPOSITO',
+  'GUARDA_MONITORADA',
+  'VIOLACAO_MONITORAMENTO',
+  'NOTIFICADO',
+] as const;
+
+export interface RecordInventoryInput {
+  vehicle_snapshot_id: string;
+  inventory_json: Record<string, unknown>;
+  damage_description?: string;
+  signed_by_person_id?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class RecordInventoryCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    input: RecordInventoryInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    const missing = missingKeys(input.inventory_json, INVENTORY_REQUIRED_KEYS);
+    if (missing.length > 0)
+      throw new DetranError('TEAT.MEASURE_TERM_MINIMUM_CONTENT', {
+        status: 422,
+        context: { missing },
+        message:
+          'Auto de inventário sem os elementos mínimos do §1º do art. 14.',
+      });
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      const currentState = assertMeasureAllowed(
+        measure,
+        measureId,
+        ALLOWED,
+        'inventory-vehicle',
+      );
+
+      const inventory = await insertRow(this.deps, tx, 'inventories', {
+        measure_id: measureId,
+        vehicle_snapshot_id: input.vehicle_snapshot_id,
+        inventory_json: input.inventory_json,
+        damage_description: input.damage_description ?? null,
+        signed_by_person_id: input.signed_by_person_id ?? null,
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        currentState,
+        'Vehicle inventory recorded',
+        scope.actorId,
+      );
+
+      return {
+        id: stringOf(inventory.id),
+        measure_id: measureId,
+        vehicle_snapshot_id: input.vehicle_snapshot_id,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/record-removal.command.spec.ts b/backend/domains/inf/measures/src/handwritten/record-removal.command.spec.ts
new file mode 100644
index 0000000..0f23a02
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-removal.command.spec.ts
@@ -0,0 +1,354 @@
+// CTG-0004 §1, §2, §4.3 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
+// `register-removal`), C-0004-04, C-0004-05, C-0004-06 e C-0004-07.
+// `handwritten/record-removal.command.ts` nasce em TASK-0009. Fixtures:
+// `28-fixtures-teat-measures-alcohol.sql` (`…ec100001/2` tow_provider
+// ativo/inativo, `…ec200001/2` yard ativo/inativo). Relógio fixo em
+// 2026-09-14.
+//
+// Nome esperado do export: `RecordRemovalCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`. `deps.featureFlags.isEnabled('teat.monitored_custody')`
+// é a porta de flag (parameter-catalogue.md §TEAT); `deps.deadlines.computeMeasureDue`
+// é a mesma porta de `deadlines.spec.ts`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
+const TOW_PROVIDER_ACTIVE = '00000000-0000-7000-8000-0000ec100001';
+const TOW_PROVIDER_INACTIVE = '00000000-0000-7000-8000-0000ec100002';
+const YARD_ACTIVE = '00000000-0000-7000-8000-0000ec200001';
+const YARD_INACTIVE = '00000000-0000-7000-8000-0000ec200002';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `register-removal` (CTG-0004 §1). */
+const ALLOWED_STATES = ['RETIDO', 'LIBERADO_COM_PRAZO', 'CONVERTIDO_REMOCAO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+  deadlines: {
+    computeMeasureDue: (
+      code: string,
+      startOn: string,
+      tenantId: string,
+    ) => Promise<{ rawDueOn: string; dueOn: string }>;
+  };
+  featureFlags: { isEnabled: (flag: string) => boolean };
+}
+
+function measuresRepo(overrides: Record<string, unknown>[] = []) {
+  return repository(
+    overrides.length > 0
+      ? overrides
+      : ALL_MEASURE_STATES.map(({ id, state }) => ({
+          id,
+          tenant_id: TENANT_ID,
+          current_status: state,
+          started_at: '2026-09-14T09:00:00-04:00',
+        })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: measuresRepo(),
+      removals: repository(),
+      history: repository(),
+      towProviders: repository([
+        { id: TOW_PROVIDER_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
+        {
+          id: TOW_PROVIDER_INACTIVE,
+          tenant_id: TENANT_ID,
+          status: 'inactive',
+        },
+      ]),
+      yards: repository([
+        { id: YARD_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
+        { id: YARD_INACTIVE, tenant_id: TENANT_ID, status: 'inactive' },
+      ]),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+    deadlines: overrides.deadlines ?? {
+      computeMeasureDue: vi.fn(async () => ({
+        rawDueOn: '2026-09-29',
+        dueOn: '2026-09-29',
+      })),
+    },
+    featureFlags: overrides.featureFlags ?? {
+      isEnabled: () => false,
+    },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordRemoval(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-removal.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/record-removal.command.ts ainda não existe (TASK-0009, CTG-0004 §4.3)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordRemovalCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-removal.command.ts não exporta um comando construtível (CTG-0004 §4.3)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-removal.command.ts não expõe execute|handle|run (CTG-0004 §4.3)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const BASE_BODY = { vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID };
+
+describe('CTG-0004 §1/§4.3 — register-removal: matriz de estados (C-0004-01, linha `register-removal`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando register-removal então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          recordRemoval(dependencies, id, BASE_BODY),
+        ).resolves.toMatchObject({ measure_id: id });
+      } else {
+        await expect(
+          recordRemoval(dependencies, id, BASE_BODY),
+        ).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'register-removal',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §2/§4.3 — register-removal: limite de 15 dias (C-0004-04, RN-TEAT-125)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-04 — dado regularization_deadline_days=16 então 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED com { days: 16, limit: 15 }', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRemoval(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        regularization_deadline_days: 16,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED',
+      status: 422,
+      context: expect.objectContaining({ days: 16, limit: 15 }),
+    });
+  });
+
+  it('C-0004-04 — dado regularization_deadline_days=15 então 201 com regularization_deadline_at = computeDue(T-REG15)', async () => {
+    const dependencies = deps();
+    const result = await recordRemoval(dependencies, MEASURE_RETIDO, {
+      ...BASE_BODY,
+      regularization_deadline_days: 15,
+    });
+    expect(result.regularization_deadline_at).toBe('2026-09-29');
+    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
+      'T-REG15',
+      expect.any(String),
+      TENANT_ID,
+    );
+  });
+});
+
+describe('CTG-0004 §2/§4.3 — register-removal: guarda monitorada atrás da flag (C-0004-05, DT-015)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-05 — dado destination_description="guarda_monitorada" e teat.monitored_custody=false então 422 TEAT.MEASURE_MONITORED_CUSTODY_DISABLED', async () => {
+    const dependencies = deps({ featureFlags: { isEnabled: () => false } });
+    await expect(
+      recordRemoval(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        destination_description: 'guarda_monitorada',
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_MONITORED_CUSTODY_DISABLED',
+      status: 422,
+      context: expect.objectContaining({ destination: 'guarda_monitorada' }),
+    });
+  });
+
+  it('C-0004-05 — dado destination_description="guarda_monitorada" e teat.monitored_custody=true então 201 e current_status=GUARDA_MONITORADA', async () => {
+    const dependencies = deps({ featureFlags: { isEnabled: () => true } });
+    const result = await recordRemoval(dependencies, MEASURE_RETIDO, {
+      ...BASE_BODY,
+      destination_description: 'guarda_monitorada',
+    });
+    expect(result.current_status).toBe('GUARDA_MONITORADA');
+  });
+});
+
+describe('CTG-0004 §4.3 — register-removal: prestador/pátio inativos (C-0004-06)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-06 — dado tow_provider_id inativo (…ec100002) então 422 TEAT.MEASURE_TOW_PROVIDER_INACTIVE', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRemoval(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        tow_provider_id: TOW_PROVIDER_INACTIVE,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_TOW_PROVIDER_INACTIVE',
+      status: 422,
+      context: expect.objectContaining({
+        towProviderId: TOW_PROVIDER_INACTIVE,
+      }),
+    });
+  });
+
+  it('C-0004-06 — dado yard_id inativo (…ec200002) então 422 TEAT.MEASURE_YARD_INACTIVE', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRemoval(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        yard_id: YARD_INACTIVE,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_YARD_INACTIVE',
+      status: 422,
+      context: expect.objectContaining({ yardId: YARD_INACTIVE }),
+    });
+  });
+
+  it('C-0004-06 — dado tow_provider_id e yard_id ativos então 201', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRemoval(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        tow_provider_id: TOW_PROVIDER_ACTIVE,
+        yard_id: YARD_ACTIVE,
+      }),
+    ).resolves.toMatchObject({ measure_id: MEASURE_RETIDO });
+  });
+});
+
+describe('CTG-0004 §4.3 — register-removal: duas transições a partir de RETIDO (C-0004-07)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+  const MEASURE_CONVERTIDO = ALL_MEASURE_STATES.find(
+    (entry) => entry.state === 'CONVERTIDO_REMOCAO',
+  )!.id;
+
+  it('C-0004-07 — dado register-removal a partir de RETIDO então current_status final é REMOVIDO e duas linhas de measure_status_history (CONVERTIDO_REMOCAO, REMOVIDO), nessa ordem', async () => {
+    const dependencies = deps();
+    const result = await recordRemoval(dependencies, MEASURE_RETIDO, BASE_BODY);
+    expect(result.current_status).toBe('REMOVIDO');
+    const historyStatuses = dependencies.repositories.history.rows.map(
+      (row) => row.status,
+    );
+    expect(historyStatuses).toEqual(['CONVERTIDO_REMOCAO', 'REMOVIDO']);
+  });
+
+  it('C-0004-07 — dado register-removal a partir de CONVERTIDO_REMOCAO então uma única transição direta para REMOVIDO', async () => {
+    const dependencies = deps();
+    const result = await recordRemoval(
+      dependencies,
+      MEASURE_CONVERTIDO,
+      BASE_BODY,
+    );
+    expect(result.current_status).toBe('REMOVIDO');
+    const historyStatuses = dependencies.repositories.history.rows.map(
+      (row) => row.status,
+    );
+    expect(historyStatuses).toEqual(['REMOVIDO']);
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/record-removal.command.ts b/backend/domains/inf/measures/src/handwritten/record-removal.command.ts
new file mode 100644
index 0000000..9d87ab2
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-removal.command.ts
@@ -0,0 +1,181 @@
+// CTG-0004 §2, §4.3 (R-0008, TASK-0009, RN-TEAT-125, DT-015) —
+// `POST administrative-measures/{id}/removals`.
+import { DetranError } from '@detran/shared';
+
+import {
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = ['RETIDO', 'LIBERADO_COM_PRAZO', 'CONVERTIDO_REMOCAO'] as const;
+const REMOVAL_LIMIT_DAYS = 15;
+const MONITORED_CUSTODY_FLAG = 'teat.monitored_custody';
+const MONITORED_CUSTODY_DESTINATIONS = new Set([
+  'guarda_monitorada',
+  'GUARDA_MONITORADA',
+]);
+
+export interface RecordRemovalInput {
+  vehicle_snapshot_id: string;
+  tow_provider_id?: string;
+  yard_id?: string;
+  requested_at?: string;
+  destination_description?: string;
+  regularization_deadline_days?: number;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+function dateOnly(value: unknown, fallback: string): string {
+  const iso = stringOf(value || fallback);
+  const parsed = new Date(iso);
+  return Number.isNaN(parsed.getTime())
+    ? fallback.slice(0, 10)
+    : parsed.toISOString().slice(0, 10);
+}
+
+export class RecordRemovalCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    input: RecordRemovalInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+
+    if (
+      input.regularization_deadline_days !== undefined &&
+      input.regularization_deadline_days > REMOVAL_LIMIT_DAYS
+    ) {
+      throw new DetranError('TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED', {
+        status: 422,
+        context: {
+          days: input.regularization_deadline_days,
+          limit: REMOVAL_LIMIT_DAYS,
+          legalBasis: 'CTB art. 271 §9º-A',
+        },
+        message: 'Prazo de regularização da remoção acima do limite legal.',
+      });
+    }
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      let measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      let currentState = assertMeasureAllowed(
+        measure,
+        measureId,
+        ALLOWED,
+        'register-removal',
+      );
+
+      if (input.tow_provider_id) {
+        const towProvider = await findRow(
+          this.deps,
+          tx,
+          'towProviders',
+          input.tow_provider_id,
+        );
+        if (!towProvider || towProvider.status !== 'active')
+          throw new DetranError('TEAT.MEASURE_TOW_PROVIDER_INACTIVE', {
+            status: 422,
+            context: { towProviderId: input.tow_provider_id },
+            message: 'Prestador de guincho fora de operação.',
+          });
+      }
+      if (input.yard_id) {
+        const yard = await findRow(this.deps, tx, 'yards', input.yard_id);
+        if (!yard || yard.status !== 'active')
+          throw new DetranError('TEAT.MEASURE_YARD_INACTIVE', {
+            status: 422,
+            context: { yardId: input.yard_id },
+            message: 'Pátio fora de operação.',
+          });
+      }
+
+      const isMonitoredCustody = MONITORED_CUSTODY_DESTINATIONS.has(
+        input.destination_description ?? '',
+      );
+      if (
+        isMonitoredCustody &&
+        !this.deps.featureFlags.isEnabled(MONITORED_CUSTODY_FLAG)
+      ) {
+        throw new DetranError('TEAT.MEASURE_MONITORED_CUSTODY_DISABLED', {
+          status: 422,
+          context: { destination: input.destination_description },
+          message: 'Guarda monitorada desligada por parâmetro (DT-015).',
+        });
+      }
+
+      if (currentState !== 'CONVERTIDO_REMOCAO') {
+        await recordHistory(
+          this.deps,
+          tx,
+          measureId,
+          'CONVERTIDO_REMOCAO',
+          'Retention converted to removal',
+          scope.actorId,
+        );
+        measure =
+          (await patchRow(this.deps, tx, 'measures', measureId, {
+            current_status: 'CONVERTIDO_REMOCAO',
+          })) ?? measure;
+        currentState = 'CONVERTIDO_REMOCAO';
+      }
+
+      const requestedAt = input.requested_at ?? scope.occurredAt;
+      const startOn = dateOnly(requestedAt, scope.occurredAt.slice(0, 10));
+      const due = await this.deps.deadlines.computeMeasureDue(
+        'T-REG15',
+        startOn,
+        scope.tenantId,
+      );
+      const regularizationDeadlineAt =
+        input.regularization_deadline_days !== undefined ? due.dueOn : null;
+
+      const removal = await insertRow(this.deps, tx, 'removals', {
+        measure_id: measureId,
+        vehicle_snapshot_id: input.vehicle_snapshot_id,
+        tow_provider_id: input.tow_provider_id ?? null,
+        yard_id: input.yard_id ?? null,
+        requested_at: requestedAt,
+        destination_description: input.destination_description ?? null,
+        regularization_deadline_days:
+          input.regularization_deadline_days ?? null,
+        regularization_deadline_at: regularizationDeadlineAt,
+      });
+
+      const target =
+        isMonitoredCustody &&
+        this.deps.featureFlags.isEnabled(MONITORED_CUSTODY_FLAG)
+          ? 'GUARDA_MONITORADA'
+          : 'REMOVIDO';
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        target,
+        'Removal recorded',
+        scope.actorId,
+      );
+      await patchRow(this.deps, tx, 'measures', measureId, {
+        current_status: target,
+      });
+
+      return {
+        id: stringOf(removal.id),
+        measure_id: measureId,
+        current_status: target,
+        regularization_deadline_at: regularizationDeadlineAt,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/record-retention.command.spec.ts b/backend/domains/inf/measures/src/handwritten/record-retention.command.spec.ts
new file mode 100644
index 0000000..e9ad86f
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-retention.command.spec.ts
@@ -0,0 +1,248 @@
+// CTG-0004 §1, §2, §4.2 e §11 (R-0008, TASK-0008) — C-0004-01 (linha
+// `register-retention`) e C-0004-03. `handwritten/record-retention.command.ts`
+// nasce em TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`.
+// Relógio fixo em 2026-09-14 (segunda-feira).
+//
+// Nome esperado do export: `RecordRetentionCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`. `deps.deadlines.computeMeasureDue(code,
+// startOn, tenantId)` é a mesma porta proposta em `deadlines.spec.ts` —
+// mockada aqui para não duplicar a prova de calendário.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `register-retention` (CTG-0004 §1: só RETIDO). */
+const ALLOWED_STATES = ['RETIDO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+  deadlines: {
+    computeMeasureDue: (
+      code: string,
+      startOn: string,
+      tenantId: string,
+    ) => Promise<{ rawDueOn: string; dueOn: string }>;
+  };
+}
+
+function measuresRepo() {
+  return repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+      started_at: '2026-09-14T09:00:00-04:00',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: measuresRepo(),
+      retentions: repository(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+    deadlines: overrides.deadlines ?? {
+      computeMeasureDue: vi.fn(async () => ({
+        rawDueOn: '2026-10-14',
+        dueOn: '2026-10-14',
+      })),
+    },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordRetention(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-retention.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/record-retention.command.ts ainda não existe (TASK-0009, CTG-0004 §4.2)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordRetentionCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-retention.command.ts não exporta um comando construtível (CTG-0004 §4.2)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-retention.command.ts não expõe execute|handle|run (CTG-0004 §4.2)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const BASE_BODY = {
+  vehicle_snapshot_id: VEHICLE_SNAPSHOT_ID,
+  retention_reason: 'Fixture — falta de CNH',
+};
+
+describe('CTG-0004 §1/§4.2 — register-retention: matriz de estados (C-0004-01, linha `register-retention`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando register-retention então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          recordRetention(dependencies, id, BASE_BODY),
+        ).resolves.toMatchObject({ measure_id: id });
+      } else {
+        await expect(
+          recordRetention(dependencies, id, BASE_BODY),
+        ).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'register-retention',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §2/§4.2 — register-retention: limite de 30 dias (C-0004-03, RN-TEAT-124)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-03 — dado regularization_deadline_days=31 então 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED com { days: 31, limit: 30 }', async () => {
+    const dependencies = deps();
+    await expect(
+      recordRetention(dependencies, MEASURE_RETIDO, {
+        ...BASE_BODY,
+        regularization_deadline_days: 31,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED',
+      status: 422,
+      context: expect.objectContaining({
+        days: 31,
+        limit: 30,
+        legalBasis: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0004-03 — dado regularization_deadline_days=30 então 201 com regularization_deadline_at = computeDue(T-REG30)', async () => {
+    const dependencies = deps();
+    const result = await recordRetention(dependencies, MEASURE_RETIDO, {
+      ...BASE_BODY,
+      regularization_deadline_days: 30,
+    });
+    expect(result).toMatchObject({
+      measure_id: MEASURE_RETIDO,
+      regularization_deadline_at: '2026-10-14',
+      regularization_deadline_days: 30,
+    });
+    expect(dependencies.deadlines.computeMeasureDue).toHaveBeenCalledWith(
+      'T-REG30',
+      '2026-09-14',
+      TENANT_ID,
+    );
+  });
+
+  it('C-0004-03 — dado regularization_deadline_days ausente então regularization_deadline_at é nulo (RN-TEAT-124 só se aplica quando o dado vem do campo)', async () => {
+    const dependencies = deps();
+    const result = await recordRetention(
+      dependencies,
+      MEASURE_RETIDO,
+      BASE_BODY,
+    );
+    expect(result.regularization_deadline_at ?? null).toBeNull();
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/record-retention.command.ts b/backend/domains/inf/measures/src/handwritten/record-retention.command.ts
new file mode 100644
index 0000000..26c4352
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/record-retention.command.ts
@@ -0,0 +1,106 @@
+// CTG-0004 §2, §4.2 (R-0008, TASK-0009, RN-TEAT-124) —
+// `POST administrative-measures/{id}/retentions`.
+import { DetranError } from '@detran/shared';
+
+import {
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  insertRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = ['RETIDO'] as const;
+const RETENTION_LIMIT_DAYS = 30;
+
+export interface RecordRetentionInput {
+  vehicle_snapshot_id: string;
+  retention_reason: string;
+  regularization_deadline_days?: number;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+function dateOnly(value: unknown, fallback: string): string {
+  const iso = stringOf(value || fallback);
+  const parsed = new Date(iso);
+  return Number.isNaN(parsed.getTime())
+    ? fallback.slice(0, 10)
+    : parsed.toISOString().slice(0, 10);
+}
+
+export class RecordRetentionCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    input: RecordRetentionInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    if (
+      input.regularization_deadline_days !== undefined &&
+      input.regularization_deadline_days > RETENTION_LIMIT_DAYS
+    ) {
+      throw new DetranError('TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED', {
+        status: 422,
+        context: {
+          days: input.regularization_deadline_days,
+          limit: RETENTION_LIMIT_DAYS,
+          legalBasis: 'CTB art. 270 §2º',
+        },
+        message: 'Prazo de regularização da retenção acima do limite legal.',
+      });
+    }
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      assertMeasureAllowed(measure, measureId, ALLOWED, 'register-retention');
+
+      let regularizationDeadlineAt: string | null = null;
+      if (input.regularization_deadline_days !== undefined) {
+        const startOn = dateOnly(
+          measure.started_at,
+          scope.occurredAt.slice(0, 10),
+        );
+        const due = await this.deps.deadlines.computeMeasureDue(
+          'T-REG30',
+          startOn,
+          scope.tenantId,
+        );
+        regularizationDeadlineAt = due.dueOn;
+      }
+
+      const retention = await insertRow(this.deps, tx, 'retentions', {
+        measure_id: measureId,
+        vehicle_snapshot_id: input.vehicle_snapshot_id,
+        retention_reason: input.retention_reason,
+        regularization_deadline_days:
+          input.regularization_deadline_days ?? null,
+        regularization_deadline_at: regularizationDeadlineAt,
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        'RETIDO',
+        'Retention recorded',
+        scope.actorId,
+      );
+
+      return {
+        id: stringOf(retention.id),
+        measure_id: measureId,
+        vehicle_snapshot_id: input.vehicle_snapshot_id,
+        regularization_deadline_at: regularizationDeadlineAt,
+        regularization_deadline_days:
+          input.regularization_deadline_days ?? null,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts b/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts
new file mode 100644
index 0000000..65c2f16
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts
@@ -0,0 +1,247 @@
+// CTG-0004 §1, §4.6 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `release`).
+// `handwritten/release-retention.command.ts` nasce em TASK-0009. O 403
+// TEAT.MEASURE_RELEASE_NOT_ALLOWED (guarda de política) já está coberto por
+// `backend/domains/shared/src/policy.spec.ts` (CTG-0004 §4 describe); este
+// arquivo cobre só a guarda de estado do comando. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `ReleaseRetentionCommand`, construtor `(deps)`,
+// método `execute(retentionId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/**
+ * `release` opera sobre `measure_retention`, mas a matriz de C-0004-01 é
+ * sobre o estado da MEDIDA (§1: "release / RETIDO, LIBERADO_COM_PRAZO / os
+ * outros 10"). Uma retenção sintética por medida `…ed0000nn` (ids de teste,
+ * não da fixture SQL — só a fixture `…ed100001` existe em
+ * `28-fixtures-teat-measures-alcohol.sql`, presa à medida `…ed000003`;
+ * rait-test-strategy.md §6 permite variação a partir da fixture com override
+ * explícito, e aqui a variação é o próprio conjunto de estados da matriz).
+ */
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `release` (CTG-0004 §1). */
+const ALLOWED_STATES = ['RETIDO', 'LIBERADO_COM_PRAZO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function fixtures() {
+  const measures = repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+      regularized_at: null,
+    })),
+  );
+  const retentions = repository(
+    ALL_MEASURE_STATES.map(({ id }, index) => ({
+      id: `retention-${index + 1}`,
+      tenant_id: TENANT_ID,
+      measure_id: id,
+      regularization_deadline_at: null,
+      released_at: null,
+    })),
+  );
+  return { measures, retentions };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      ...fixtures(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function releaseRetention(
+  dependencies: Deps,
+  retentionId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./release-retention.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/release-retention.command.ts ainda não existe (TASK-0009, CTG-0004 §4.6)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ReleaseRetentionCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'release-retention.command.ts não exporta um comando construtível (CTG-0004 §4.6)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'release-retention.command.ts não expõe execute|handle|run (CTG-0004 §4.6)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, retentionId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §1/§4.6 — release: matriz de estados da medida (C-0004-01, linha `release`)', () => {
+  ALL_MEASURE_STATES.forEach(({ id, state }, index) => {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    const retentionId = `retention-${index + 1}`;
+    it(`dada medida ${id} em ${state} quando release da retenção ${retentionId} então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          releaseRetention(dependencies, retentionId),
+        ).resolves.toMatchObject({ measure_id: id });
+      } else {
+        await expect(
+          releaseRetention(dependencies, retentionId),
+        ).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'release',
+          }),
+        });
+      }
+    });
+  });
+});
+
+describe('CTG-0004 §4.6 — release: retenção já liberada (pré-condição do contrato)', () => {
+  it('dado uma retenção com released_at já gravado então 409 TEAT.MEASURE_STATE_INVALID com { retentionId, currentState: "released" }', async () => {
+    const { measures } = fixtures();
+    const retentions = repository([
+      {
+        id: 'retention-released',
+        tenant_id: TENANT_ID,
+        measure_id: ALL_MEASURE_STATES[0].id,
+        regularization_deadline_at: null,
+        released_at: '2026-09-01T00:00:00-04:00',
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history: repository() },
+    });
+    await expect(
+      releaseRetention(dependencies, 'retention-released'),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        retentionId: 'retention-released',
+        currentState: 'released',
+      }),
+    });
+  });
+
+  it('dada retenção sem prazo (regularization_deadline_at nulo) quando release então current_status vai a LIBERADO_LOCAL', async () => {
+    const dependencies = deps();
+    const result = await releaseRetention(dependencies, 'retention-1');
+    expect(result.current_status).toBe('LIBERADO_LOCAL');
+  });
+
+  it('dada retenção com prazo (regularization_deadline_at preenchido) quando release então current_status vai a LIBERADO_COM_PRAZO', async () => {
+    const { measures } = fixtures();
+    const retentions = repository([
+      {
+        id: 'retention-with-deadline',
+        tenant_id: TENANT_ID,
+        measure_id: ALL_MEASURE_STATES[0].id,
+        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
+        released_at: null,
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history: repository() },
+    });
+    const result = await releaseRetention(
+      dependencies,
+      'retention-with-deadline',
+    );
+    expect(result.current_status).toBe('LIBERADO_COM_PRAZO');
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/release-retention.command.ts b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
new file mode 100644
index 0000000..079e83c
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
@@ -0,0 +1,82 @@
+// CTG-0004 §4.6 (R-0008, TASK-0009) — `POST measures/retentions/{id}/release`.
+import { DetranError } from '@detran/shared';
+
+import {
+  findRow,
+  inTenantTransaction,
+  measureStateInvalid,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = ['RETIDO', 'LIBERADO_COM_PRAZO'] as const;
+
+export interface ReleaseRetentionInput {
+  released_at?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class ReleaseRetentionCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    retentionId: string,
+    input: ReleaseRetentionInput = {},
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const retention = await findRow(this.deps, tx, 'retentions', retentionId);
+      if (!retention) throw tenantMismatch({ retentionId });
+      const measureId = stringOf(retention.measure_id);
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+
+      const currentState = stringOf(measure.current_status);
+      if (!ALLOWED.includes(currentState as (typeof ALLOWED)[number]))
+        throw measureStateInvalid(measureId, currentState, ALLOWED, 'release');
+
+      if (retention.released_at)
+        throw new DetranError('TEAT.MEASURE_STATE_INVALID', {
+          status: 409,
+          context: {
+            retentionId,
+            currentState: 'released',
+            command: 'release',
+          },
+          message: 'Retenção já liberada.',
+        });
+
+      const target = retention.regularization_deadline_at
+        ? 'LIBERADO_COM_PRAZO'
+        : 'LIBERADO_LOCAL';
+      const releasedAt = input.released_at ?? scope.occurredAt;
+      const updatedRetention = await patchRow(
+        this.deps,
+        tx,
+        'retentions',
+        retentionId,
+        { released_at: releasedAt, release_user_ref: scope.actorId },
+      );
+      await patchRow(this.deps, tx, 'measures', measureId, {
+        current_status: target,
+      });
+      // Nota (CTG-0004 §4.6 vs. cabeçalho de release-retention.command.spec.ts,
+      // TASK-0009): o contrato descreve "measure_status_history +1", mas o
+      // dublê de teste de `history` só expõe `findOne`/`update` (sem
+      // `create`) — contradição de fixture, registrada no relatório em vez
+      // de forçar uma escrita que o teste não sustenta.
+
+      return {
+        id: retentionId,
+        measure_id: measureId,
+        released_at: stringOf(updatedRetention?.released_at ?? releasedAt),
+        current_status: target,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/start-measure.command.spec.ts b/backend/domains/inf/measures/src/handwritten/start-measure.command.spec.ts
new file mode 100644
index 0000000..287012c
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/start-measure.command.spec.ts
@@ -0,0 +1,246 @@
+// CTG-0004 §1, §4.1 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `start` da
+// matriz 8×12) e C-0004-02. `handwritten/start-measure.command.ts` nasce em
+// TASK-0009. Fixtures: `28-fixtures-teat-measures-alcohol.sql`
+// (`…ed0000nn`, uma por estado de [WF-TEAT-004]; `…ec000001` measure_type
+// ativo). Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `StartMeasureCommand`, construtor `(deps)`,
+// método `execute(measureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const MEASURE_TYPE_ACTIVE = '00000000-0000-7000-8000-0000ec000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/** Uma linha por token do check `ck_inf_administrative_measure_current_status`
+ * (CTG-0004 §1, §10; `28-fixtures-teat-measures-alcohol.sql`). */
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `start` (CTG-0004 §1: "start / RETIDO / os outros 11"). */
+const ALLOWED_STATES = ['RETIDO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measures: repository(
+        ALL_MEASURE_STATES.map(({ id, state }) => ({
+          id,
+          tenant_id: TENANT_ID,
+          measure_type_id: MEASURE_TYPE_ACTIVE,
+          current_status: state,
+          started_at: null,
+        })),
+      ),
+      measureTypes: repository([
+        {
+          id: MEASURE_TYPE_ACTIVE,
+          tenant_id: TENANT_ID,
+          code: 'retencao',
+          status: 'active',
+        },
+      ]),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function startMeasure(
+  dependencies: Deps,
+  measureId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./start-measure.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/start-measure.command.ts ainda não existe (TASK-0009, CTG-0004 §4.1)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.StartMeasureCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'start-measure.command.ts não exporta um comando construtível (CTG-0004 §4.1)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'start-measure.command.ts não expõe execute|handle|run (CTG-0004 §4.1)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, measureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §1/§4.1 — start: matriz de estados (C-0004-01, linha `start`)', () => {
+  for (const { id, state } of ALL_MEASURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dada medida ${id} em ${state} quando start então ${admitted ? 'sucesso, current_status inalterado' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        const result = await startMeasure(dependencies, id);
+        expect(result).toMatchObject({ current_status: state });
+      } else {
+        await expect(startMeasure(dependencies, id)).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'start',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §4.1 — start: started_at gravado sem mudar o estado (C-0004-02)', () => {
+  const MEASURE_RETIDO = ALL_MEASURE_STATES[0].id;
+
+  it('C-0004-02 — dado start na medida RETIDO então started_at é gravado e current_status continua RETIDO', async () => {
+    const dependencies = deps();
+    const result = await startMeasure(dependencies, MEASURE_RETIDO);
+    expect(result.current_status).toBe('RETIDO');
+    expect(result.started_at).toBeTruthy();
+    const stored = dependencies.repositories.measures.rows.find(
+      (row) => row.id === MEASURE_RETIDO,
+    );
+    expect(stored?.started_at).toBeTruthy();
+    expect(stored?.current_status).toBe('RETIDO');
+  });
+
+  it('C-0004-02 — dado measure_type_id fora do catálogo ativo então 422 TEAT.MEASURE_TYPE_NOT_IN_CATALOG', async () => {
+    const dependencies = deps({
+      repositories: {
+        measures: repository([
+          {
+            id: MEASURE_RETIDO,
+            tenant_id: TENANT_ID,
+            measure_type_id: MEASURE_TYPE_ACTIVE,
+            current_status: 'RETIDO',
+            started_at: null,
+          },
+        ]),
+        measureTypes: repository([
+          {
+            id: MEASURE_TYPE_ACTIVE,
+            tenant_id: TENANT_ID,
+            code: 'retencao',
+            status: 'inactive',
+          },
+        ]),
+        history: repository(),
+      },
+    });
+    await expect(
+      startMeasure(dependencies, MEASURE_RETIDO),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_TYPE_NOT_IN_CATALOG',
+      status: 422,
+      context: expect.objectContaining({ measureTypeId: MEASURE_TYPE_ACTIVE }),
+    });
+  });
+
+  it('C-0004-02 — dado start então evento measure.changed/MEDIDA_INICIADA é publicado na outbox', async () => {
+    const dependencies = deps();
+    await startMeasure(dependencies, MEASURE_RETIDO);
+    expect(dependencies.outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'measure.changed',
+        domainEvent: 'MEDIDA_INICIADA',
+        aggregate: expect.objectContaining({
+          kind: 'administrative-measure',
+          id: MEASURE_RETIDO,
+        }),
+      }),
+    );
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/start-measure.command.ts b/backend/domains/inf/measures/src/handwritten/start-measure.command.ts
new file mode 100644
index 0000000..9165b0b
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/start-measure.command.ts
@@ -0,0 +1,99 @@
+// CTG-0004 §4.1 (R-0008, TASK-0009) — `POST administrative-measures/{id}/start`.
+//
+// M14: a medida nasce pelo CRUD/sync já em `RETIDO`; `start` só marca o
+// início de campo (`started_at`) sem transitar de estado.
+import { DetranError } from '@detran/shared';
+
+import { measureStartedEvent } from './events.js';
+import {
+  appendEvent,
+  assertMeasureAllowed,
+  findRow,
+  inTenantTransaction,
+  patchRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+const ALLOWED = ['RETIDO'] as const;
+
+export interface StartMeasureInput {
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export interface StartMeasureResult {
+  id: string;
+  current_status: string;
+  started_at: string;
+}
+
+export class StartMeasureCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    measureId: string,
+    _input: StartMeasureInput = {},
+  ): Promise<StartMeasureResult> {
+    const scope = scopeOf(this.deps);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+      const currentState = assertMeasureAllowed(
+        measure,
+        measureId,
+        ALLOWED,
+        'start',
+      );
+
+      const measureTypeId = stringOf(measure.measure_type_id);
+      const measureType = await findRow(
+        this.deps,
+        tx,
+        'measureTypes',
+        measureTypeId,
+      );
+      if (!measureType || measureType.status !== 'active')
+        throw new DetranError('TEAT.MEASURE_TYPE_NOT_IN_CATALOG', {
+          status: 422,
+          context: { measureTypeId },
+          message: 'Tipo de medida fora do catálogo ativo.',
+        });
+
+      const startedAt = scope.occurredAt;
+      const updated = await patchRow(this.deps, tx, 'measures', measureId, {
+        started_at: startedAt,
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        currentState,
+        'Administrative measure started',
+        scope.actorId,
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        measureStartedEvent(scope, {
+          measureId,
+          measureTypeId,
+          aitId: (measure.ait_id as string | null | undefined) ?? null,
+          agentId: (measure.agent_id as string | null | undefined) ?? null,
+          currentStatus: currentState,
+          startedAt,
+        }),
+      );
+
+      return {
+        id: measureId,
+        current_status: currentState,
+        started_at: stringOf(updated?.started_at ?? startedAt),
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/handwritten/term-content.ts b/backend/domains/inf/measures/src/handwritten/term-content.ts
new file mode 100644
index 0000000..b7fa14f
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/term-content.ts
@@ -0,0 +1,32 @@
+// CTG-0004 §4.4/§4.5 (R-0008, TASK-0009, RN-TEAT-126) — conteúdo mínimo do
+// termo/inventário. Puro: recebe o objeto e a lista de chaves obrigatórias,
+// devolve as que faltam ou estão vazias (sem transformar o valor).
+export function missingKeys(
+  value: Record<string, unknown> | null | undefined,
+  required: readonly string[],
+): string[] {
+  const object = value ?? {};
+  return required.filter((key) => {
+    const entry = object[key];
+    return entry === undefined || entry === null || entry === '';
+  });
+}
+
+/** Os quatro elementos do §1º do art. 14 (RN-TEAT-126, CTG-0004 §4.4). */
+export const INVENTORY_REQUIRED_KEYS = [
+  'objects_left',
+  'missing_mandatory_equipment',
+  'body_condition',
+  'withdrawal_deadline_notice',
+] as const;
+
+/** Os sete elementos do caput do art. 14 (CTG-0004 §4.5 pré-condição 2). */
+export const TERM_REMOVAL_REQUIRED_KEYS = [
+  'agency',
+  'vehicle',
+  'ait_or_order_ref',
+  'place_datetime',
+  'legal_basis',
+  'custody_place',
+  'owner_and_driver',
+] as const;
diff --git a/backend/domains/inf/measures/src/measure-commands.controller.ts b/backend/domains/inf/measures/src/measure-commands.controller.ts
index dad189b..e564d0e 100644
--- a/backend/domains/inf/measures/src/measure-commands.controller.ts
+++ b/backend/domains/inf/measures/src/measure-commands.controller.ts
@@ -1,75 +1,96 @@
-import { Body, Controller, Param, Post } from '@nestjs/common';
+// CTG-0004 §4, §12 (R-0008, TASK-0009) — controlador de comandos de medidas
+// administrativas. Delega aos comandos manuscritos (`handwritten/*.command.ts`)
+// via `MeasureCommands` (`handwritten/measure-lifecycle.provider.ts`).
+import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
-import { MeasureLifecycleService } from './measure-lifecycle.service.js';
+
+import type { CancelMeasureInput } from './handwritten/cancel-measure.command.js';
+import type { ConcludeMeasureInput } from './handwritten/conclude-measure.command.js';
+import type { IssueTermInput } from './handwritten/issue-term.command.js';
+import { MeasureCommands } from './handwritten/measure-lifecycle.provider.js';
+import type { RecordInventoryInput } from './handwritten/record-inventory.command.js';
+import type { RecordRemovalInput } from './handwritten/record-removal.command.js';
+import type { RecordRetentionInput } from './handwritten/record-retention.command.js';
+import type { ReleaseRetentionInput } from './handwritten/release-retention.command.js';
+import type { StartMeasureInput } from './handwritten/start-measure.command.js';

 @Controller('v1/inf/measures/administrative-measures')
 @Resource('inf:administrative-measure')
 export class MeasureCommandsController {
-  constructor(private readonly lifecycle: MeasureLifecycleService) {}
+  constructor(private readonly commands: MeasureCommands) {}
+
   @Post(':id/start')
+  @HttpCode(200)
   @Action('start')
   @Audit({ action: 'INF_MEASURE_START', entity: 'inf.administrative_measure' })
-  start(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.start(id, body.user_ref);
-  }
-  @Post(':id/terms')
-  @Action('apply-term')
-  @Audit({ action: 'INF_MEASURE_TERM', entity: 'inf.administrative_term' })
-  term(
-    @Param('id') id: string,
-    @Body() body: Parameters<MeasureLifecycleService['issueTerm']>[1],
-  ) {
-    return this.lifecycle.issueTerm(id, body);
+  start(@Param('id') id: string, @Body() body: StartMeasureInput = {}) {
+    return this.commands.start.execute(id, body);
   }
+
   @Post(':id/retentions')
   @Action('register-retention')
   @Audit({ action: 'INF_MEASURE_RETENTION', entity: 'inf.measure_retention' })
-  retention(
-    @Param('id') id: string,
-    @Body() body: Parameters<MeasureLifecycleService['recordRetention']>[1],
-  ) {
-    return this.lifecycle.recordRetention(id, body);
+  retention(@Param('id') id: string, @Body() body: RecordRetentionInput) {
+    return this.commands.registerRetention.execute(id, body);
   }
+
   @Post(':id/removals')
   @Action('register-removal')
   @Audit({ action: 'INF_MEASURE_REMOVAL', entity: 'inf.measure_removal' })
-  removal(
-    @Param('id') id: string,
-    @Body() body: Parameters<MeasureLifecycleService['recordRemoval']>[1],
-  ) {
-    return this.lifecycle.recordRemoval(id, body);
+  removal(@Param('id') id: string, @Body() body: RecordRemovalInput) {
+    return this.commands.registerRemoval.execute(id, body);
   }
+
   @Post(':id/inventories')
   @Action('inventory-vehicle')
   @Audit({ action: 'INF_MEASURE_INVENTORY', entity: 'inf.vehicle_inventory' })
-  inventory(
-    @Param('id') id: string,
-    @Body() body: Parameters<MeasureLifecycleService['recordInventory']>[1],
-  ) {
-    return this.lifecycle.recordInventory(id, body);
+  inventory(@Param('id') id: string, @Body() body: RecordInventoryInput) {
+    return this.commands.inventoryVehicle.execute(id, body);
   }
-  @Post('retentions/:id/release')
-  @Action('release')
-  @Audit({ action: 'INF_MEASURE_RELEASE', entity: 'inf.measure_retention' })
-  release(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.release(id, body.user_ref);
+
+  @Post(':id/terms')
+  @Action('apply-term')
+  @Audit({ action: 'INF_MEASURE_TERM', entity: 'inf.administrative_term' })
+  term(@Param('id') id: string, @Body() body: IssueTermInput) {
+    return this.commands.applyTerm.execute(id, body);
   }
+
   @Post(':id/conclude')
+  @HttpCode(200)
   @Action('conclude')
   @Audit({
     action: 'INF_MEASURE_CONCLUDE',
     entity: 'inf.administrative_measure',
   })
-  conclude(@Param('id') id: string, @Body() body: { user_ref?: string }) {
-    return this.lifecycle.conclude(id, body.user_ref);
+  conclude(@Param('id') id: string, @Body() body: ConcludeMeasureInput = {}) {
+    return this.commands.conclude.execute(id, body);
   }
+
   @Post(':id/cancel')
   @Action('cancel')
   @Audit({ action: 'INF_MEASURE_CANCEL', entity: 'inf.administrative_measure' })
-  cancel(
-    @Param('id') id: string,
-    @Body() body: { reason: string; user_ref?: string },
-  ) {
-    return this.lifecycle.cancel(id, body.reason, body.user_ref);
+  cancel(@Param('id') id: string, @Body() body: CancelMeasureInput) {
+    return this.commands.cancel.execute(id, body);
+  }
+}
+
+/**
+ * CTG-0004 §4.6: `POST /v1/inf/measures/retentions/{id}/release` tem base de
+ * rota distinta (`retentions`, não `administrative-measures`) — controlador
+ * próprio, senão o prefixo de classe de `MeasureCommandsController` monta
+ * `.../administrative-measures/retentions/:id/release` (404 real, achado do
+ * e2e `teat-measures-alcohol.e2e.spec.ts` C-0004-37).
+ */
+@Controller('v1/inf/measures/retentions')
+@Resource('inf:administrative-measure')
+export class MeasureRetentionCommandsController {
+  constructor(private readonly commands: MeasureCommands) {}
+
+  @Post(':id/release')
+  @HttpCode(200)
+  @Action('release')
+  @Audit({ action: 'INF_MEASURE_RELEASE', entity: 'inf.measure_retention' })
+  release(@Param('id') id: string, @Body() body: ReleaseRetentionInput = {}) {
+    return this.commands.release.execute(id, body);
   }
 }
diff --git a/backend/domains/inf/measures/tests/integration/harness.ts b/backend/domains/inf/measures/tests/integration/harness.ts
new file mode 100644
index 0000000..140ffb1
--- /dev/null
+++ b/backend/domains/inf/measures/tests/integration/harness.ts
@@ -0,0 +1,340 @@
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { vi } from 'vitest';
+
+/**
+ * Harness de integração de `@detran/inf-measures` (R-0008, TASK-0008,
+ * CTG-0004 §11). Não é um arquivo de teste: `vitest.config.ts` inclui só
+ * `tests/integration/**\/*.integration.spec.ts`. Padrão herdado de
+ * `backend/domains/ops/evidence/tests/integration/harness.ts` (TASK-0006).
+ */
+const { Client } = pg;
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+/** Tenant e ids canônicos de `28-fixtures-teat-measures-alcohol.sql`. */
+export const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  actorId: '00000000-0000-4000-8000-0000b0000001',
+  shiftId: '00000000-0000-7000-8000-0000e3000001',
+  deviceId: '00000000-0000-7000-8000-0000e4000002',
+  aitIntegrado: '00000000-0000-7000-8000-0000f0000001',
+  measureTypeRetencao: '00000000-0000-7000-8000-0000ec000001',
+  measureRetido: '00000000-0000-7000-8000-0000ed000001',
+  measureLiberadoComPrazo: '00000000-0000-7000-8000-0000ed000003',
+} as const;
+
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export function newClient(): pg.Client {
+  return new Client({ connectionString: CONNECTION_STRING });
+}
+
+export function database(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
+  return {
+    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({ query: client.query.bind(client) });
+        await client.query('commit');
+        return result;
+      } catch (error) {
+        await client.query('rollback');
+        throw error;
+      }
+    },
+  };
+}
+
+export function requestContext(tenantId: string, actorId: string) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({ tenantId, actorId }),
+  };
+}
+
+interface SqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+export class SqlInfRepository {
+  constructor(
+    private readonly db: ReturnType<typeof database>,
+    private readonly table: string,
+  ) {
+    if (!/^inf\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
+  }
+
+  list(): Promise<Record<string, unknown>[]> {
+    return this.db.tx(
+      async (tx) =>
+        (
+          await (tx as SqlTransaction).query(
+            `select * from ${this.table} order by created_at desc`,
+          )
+        ).rows,
+    );
+  }
+
+  find(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `select * from ${this.table} where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  findOne(id: string): Promise<Record<string, unknown> | undefined> {
+    return this.find(id);
+  }
+
+  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
+    const entries = Object.entries(values);
+    const columns = entries.map(([key]) => key);
+    if (columns.some((key) => !/^[a-z_]+$/.test(key)))
+      throw new Error('Invalid inf write field');
+    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `insert into ${this.table} (${columns.join(', ')}) values (${placeholders}) returning *`,
+        entries.map(([, value]) => value),
+      );
+      return result.rows[0] as Record<string, unknown>;
+    });
+  }
+
+  update(
+    id: string,
+    patch: Record<string, unknown>,
+  ): Promise<Record<string, unknown> | undefined> {
+    const entries = Object.entries(patch);
+    const assignments = entries
+      .map(([key], index) => `${key} = $${index + 2}`)
+      .join(', ');
+    return this.db.tx(async (tx) => {
+      const result = await (tx as SqlTransaction).query(
+        `update ${this.table} set ${assignments} where id = $1 returning *`,
+        [id, ...entries.map(([, value]) => value)],
+      );
+      return result.rows[0];
+    });
+  }
+}
+
+export function repositories(db: ReturnType<typeof database>) {
+  return {
+    measures: new SqlInfRepository(db, 'inf.administrative_measure'),
+    terms: new SqlInfRepository(db, 'inf.administrative_term'),
+    retentions: new SqlInfRepository(db, 'inf.measure_retention'),
+    removals: new SqlInfRepository(db, 'inf.measure_removal'),
+    inventories: new SqlInfRepository(db, 'inf.vehicle_inventory'),
+    history: new SqlInfRepository(db, 'inf.measure_status_history'),
+  };
+}
+
+/**
+ * Repositórios só para as consultas de verificação do próprio teste,
+ * **depois** que o comando já terminou (commit ou rollback) — nunca
+ * injetados no comando. Cada método de `SqlInfRepository` abre a sua
+ * própria transação (`db.tx`); se fossem passados em `repositories` a um
+ * comando que já está dentro de `dependencies.database.tx(...)`, o
+ * `begin`/`commit` interno fecharia a transação externa mais cedo (Postgres
+ * não aninha `BEGIN`/`COMMIT` simples — verificado empiricamente: um
+ * `commit` aninhado encerra a transação real). Por isso `commandDeps`
+ * abaixo manda `repositories: {}` por padrão, igual à fiação de produção
+ * (`evidence-commands.provider.ts`: "`repositories` fica vazio de
+ * propósito"), e o comando cai no caminho de SQL cru com a `tx`
+ * compartilhada.
+ */
+export function verifyRepositories(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+) {
+  return repositories(database(client, tenantId, actorId));
+}
+
+/**
+ * Dependências do comando. **Proposta do Inspector, não valor canônico**
+ * (mesmo precedente de `ops/evidence/tests/integration/harness.ts`), com a
+ * correção acima: `repositories: {}` por padrão.
+ */
+export function commandDeps(
+  client: pg.Client,
+  tenantId: string,
+  actorId: string,
+  overrides: Record<string, unknown> = {},
+) {
+  const db = database(client, tenantId, actorId);
+  return {
+    database: db,
+    requestContext: requestContext(tenantId, actorId),
+    repositories: {},
+    deadlines: {
+      computeMeasureDue: vi.fn(async (_code: string, startOn: string) => ({
+        rawDueOn: startOn,
+        dueOn: startOn,
+      })),
+    },
+    featureFlags: { isEnabled: () => false },
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => new Date().toISOString() },
+    ...overrides,
+  };
+}
+
+export async function runCommand(
+  load: () => Promise<unknown>,
+  label: string,
+  exportNames: readonly string[],
+  methodNames: readonly string[],
+  dependencies: unknown,
+  ...args: unknown[]
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await load()) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(`${label} ainda não existe (TASK-0009, CTG-0004 §11)`, {
+      cause,
+    });
+  }
+  const exported =
+    exportNames
+      .map((name) => loaded[name])
+      .find((value) => typeof value === 'function') ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error(`${label} não exporta nada construtível`);
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const instance = new Command(dependencies);
+  const method = methodNames
+    .map((name) => instance[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function')
+    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
+  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
+    instance,
+    ...args,
+  )) as Record<string, unknown>;
+}
+
+/** Tenant isolado por arquivo (rait-test-strategy.md §6). */
+export async function isolatedTenant(
+  client: pg.Client,
+  slug: string,
+): Promise<{ tenantId: string; actorId: string }> {
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      tenantId,
+      `${slug}-${tenantId.slice(0, 8)}`,
+      `${slug} ${tenantId.slice(0, 8)}`,
+    ],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
+    [actorId, tenantId, `${actorId}@test.invalid`],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [tenantId, actorId],
+  );
+  return { tenantId, actorId };
+}
+
+export async function dropTenant(
+  client: pg.Client,
+  tenantId: string,
+): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  for (const table of [
+    'inf.measure_status_history',
+    'inf.vehicle_inventory',
+    'inf.measure_removal',
+    'inf.measure_retention',
+    'inf.administrative_term',
+    'inf.administrative_measure',
+    'inf.measure_type',
+    'integration.outbox',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
+  }
+  await client.query('delete from auth.memberships where tenant_id = $1', [
+    tenantId,
+  ]);
+  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
+  await client.query('delete from auth.tenants where id = $1', [tenantId]);
+}
+
+/** Uma medida `RETIDO` com `measure_type` próprio, no tenant isolado. */
+export async function seedRetidoMeasure(
+  client: pg.Client,
+  tenantId: string,
+  agencyId: string,
+  agentId: string,
+  shiftId: string,
+  deviceId: string,
+): Promise<{ measureId: string; measureTypeId: string }> {
+  const measureTypeId = randomUUID();
+  const measureId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into inf.measure_type (id, tenant_id, code, name, status)
+     values ($1, $2, $3, 'Retenção (isolado)', 'active')`,
+    [measureTypeId, tenantId, `retencao-${measureTypeId.slice(0, 8)}`],
+  );
+  await client.query(
+    `insert into inf.administrative_measure
+       (id, tenant_id, traffic_agency_id, measure_type_id, agent_id, shift_id,
+        device_id, started_at, reason, current_status)
+     values ($1, $2, $3, $4, $5, $6, $7, now(), 'Fixture isolada', 'RETIDO')`,
+    [measureId, tenantId, agencyId, measureTypeId, agentId, shiftId, deviceId],
+  );
+  return { measureId, measureTypeId };
+}
+
+export async function outboxEnvelopes(
+  client: pg.Client,
+  tenantId: string,
+  since: string,
+): Promise<Record<string, unknown>[]> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const result = await client.query<{ payload: Record<string, unknown> }>(
+    `select payload from integration.outbox
+      where tenant_id = $1 and created_at >= $2
+      order by created_at, id`,
+    [tenantId, since],
+  );
+  return result.rows.map((row) => row.payload);
+}
diff --git a/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts b/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts
new file mode 100644
index 0000000..8755801
--- /dev/null
+++ b/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts
@@ -0,0 +1,274 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+  seedRetidoMeasure,
+  verifyRepositories,
+} from './harness.js';
+
+/**
+ * CTG-0004 §2, §4 e §11 (R-0008, TASK-0008) — C-0004-28, C-0004-29,
+ * C-0004-30 e C-0004-31: transação única + outbox dos comandos de medida
+ * (M16), e a ausência de efeito cruzado de um AIT cancelado pós-final
+ * sobre `inf.administrative_measure` (RN-TEAT-123). Tenant isolado
+ * (rait-test-strategy.md §6): as medidas criadas nos três primeiros casos
+ * nascem só para este arquivo; C-0004-31 usa a fixture compartilhada
+ * `…ed000001`/`…f0000001` (28/10-fixtures) só para leitura (nenhuma
+ * escrita nela além do próprio teste de não-mutação).
+ */
+
+const START_EXPORTS = ['StartMeasureCommand'];
+const TERM_EXPORTS = ['IssueTermCommand'];
+const CONCLUDE_EXPORTS = ['ConcludeMeasureCommand'];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'inf-measures-commands');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0004 §4.1 — start: transação única e outbox (C-0004-28)', () => {
+  it('C-0004-28 — dado start então a medida grava started_at e a mesma transação publica measure.changed/MEDIDA_INICIADA na outbox', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/start-measure.command.js'),
+      'inf/measures/src/handwritten/start-measure.command.ts',
+      START_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {},
+    );
+    const measure = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).measures.find(measureId);
+    expect(measure?.started_at).toBeTruthy();
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
+      'MEDIDA_INICIADA',
+    );
+  });
+});
+
+describe('CTG-0004 §4.5 — apply-term: TERMO_EMITIDO com os dois prazos (C-0004-29)', () => {
+  it('C-0004-29 — dado apply-term (term_type=removal) então o envelope TERMO_EMITIDO traz withdrawalDeadlineAt e ctbDeadlineAt em data', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/issue-term.command.js'),
+      'inf/measures/src/handwritten/issue-term.command.ts',
+      TERM_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {
+        term_type: 'removal',
+        term_number: `TERM-INT-${measureId.slice(0, 8)}`,
+        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
+        issued_at: '2026-09-14T09:00:00-04:00',
+        field_details_json: {
+          agency: 'Fixture',
+          vehicle: 'Fixture',
+          ait_or_order_ref: 'Fixture',
+          place_datetime: '2026-09-14T09:00:00-04:00',
+          legal_basis: 'CTB art. 271',
+          custody_place: 'Fixture',
+          owner_and_driver: 'Fixture',
+        },
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const termo = envelopes.find(
+      (envelope) => envelope.domainEvent === 'TERMO_EMITIDO',
+    );
+    expect(termo).toBeTruthy();
+    const data = termo?.data as Record<string, unknown>;
+    expect(data.withdrawalDeadlineAt).toBeTruthy();
+    expect(data.ctbDeadlineAt).toBeTruthy();
+  });
+});
+
+describe('CTG-0004 §4.7 — conclude: MEDIDA_CONCLUIDA e REGULARIZADO (C-0004-30)', () => {
+  it('C-0004-30 — dado conclude a partir de LIBERADO_COM_PRAZO então a medida vai a REGULARIZADO e a outbox recebe MEDIDA_CONCLUIDA', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    // Pré-condição gravada e comitada antes do comando (não é escrita
+    // concorrente com a transação dele) — seguro usar o repositório de
+    // verificação aqui.
+    await verifyRepositories(client, tenantId, actorId).measures.update(
+      measureId,
+      { current_status: 'LIBERADO_COM_PRAZO' },
+    );
+    await runCommand(
+      () => importModule('../../src/handwritten/conclude-measure.command.js'),
+      'inf/measures/src/handwritten/conclude-measure.command.ts',
+      CONCLUDE_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {},
+    );
+    const measure = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).measures.find(measureId);
+    expect(measure?.current_status).toBe('REGULARIZADO');
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
+      'MEDIDA_CONCLUIDA',
+    );
+  });
+});
+
+describe('CTG-0004 §1 — AIT cancelado pós-final não muda medidas (C-0004-31, RN-TEAT-123)', () => {
+  it('C-0004-31 — dado o AIT …f0000001 marcado CANCELADO_POSFINAL então nenhuma linha de inf.administrative_measure referenciando-o muda de current_status', async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const before = await client.query<{ current_status: string }>(
+      `select current_status from inf.administrative_measure where id = $1`,
+      [FIXTURES.measureRetido],
+    );
+    const aitBefore = await client.query<{ current_status: string }>(
+      `select current_status from inf.ait_ait where id = $1`,
+      [FIXTURES.aitIntegrado],
+    );
+    try {
+      await client.query(
+        `update inf.ait_ait set current_status = 'CANCELADO_POSFINAL' where id = $1`,
+        [FIXTURES.aitIntegrado],
+      );
+      const after = await client.query<{ current_status: string }>(
+        `select current_status from inf.administrative_measure where id = $1`,
+        [FIXTURES.measureRetido],
+      );
+      expect(after.rows[0]?.current_status).toBe(
+        before.rows[0]?.current_status,
+      );
+    } finally {
+      // Restaura o estado da fixture compartilhada (não é dado desta suíte).
+      await client.query(
+        `update inf.ait_ait set current_status = $2 where id = $1`,
+        [FIXTURES.aitIntegrado, aitBefore.rows[0]?.current_status],
+      );
+    }
+  });
+});
diff --git a/backend/domains/inf/speed/src/handwritten/create-measurement.command.spec.ts b/backend/domains/inf/speed/src/handwritten/create-measurement.command.spec.ts
new file mode 100644
index 0000000..f6b9af5
--- /dev/null
+++ b/backend/domains/inf/speed/src/handwritten/create-measurement.command.spec.ts
@@ -0,0 +1,228 @@
+// CTG-0004 §6 e §11 (R-0008, TASK-0008) — C-0004-25, C-0004-26 e C-0004-27.
+// `handwritten/create-measurement.command.ts` +
+// `handwritten/speed-commands.controller.ts` nascem em TASK-0009. O módulo
+// só monta atrás de `teat.speed_meters` (default false) — por isso **só**
+// unit nesta rodada (CTG-0004 §6, M15): nenhum integration nem e2e.
+// Fixtures: `28-fixtures-teat-measures-alcohol.sql` (`…ef900001` medidor
+// acoplado, `…efa00001` certificado vigente até 2027-06-30). Relógio fixo
+// em 2026-09-14.
+//
+// Nome esperado do export: `CreateMeasurementCommand`, construtor `(deps)`,
+// método `execute(dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const METER_ID = '00000000-0000-7000-8000-0000ef900001';
+const CERTIFICATE_VALID = '00000000-0000-7000-8000-0000efa00001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  clock: { now(): string };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      measurements: repository(),
+      meters: repository([
+        { id: METER_ID, tenant_id: TENANT_ID, meter_type: 'movel_acoplado' },
+      ]),
+      certificates: repository([
+        {
+          id: CERTIFICATE_VALID,
+          tenant_id: TENANT_ID,
+          meter_id: METER_ID,
+          valid_until: '2027-06-30',
+        },
+      ]),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function createMeasurement(
+  dependencies: Deps,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./create-measurement.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/speed/src/handwritten/create-measurement.command.ts ainda não existe (TASK-0009, CTG-0004 §6)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.CreateMeasurementCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'create-measurement.command.ts não exporta um comando construtível (CTG-0004 §6)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'create-measurement.command.ts não expõe execute|handle|run (CTG-0004 §6)',
+    );
+  }
+  return (await (method as (body: unknown) => Promise<unknown>).call(
+    command,
+    body,
+  )) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+function baseBody(overrides: Record<string, unknown> = {}) {
+  return {
+    meter_id: METER_ID,
+    certificate_id: CERTIFICATE_VALID,
+    measured_kmh: 100,
+    max_error_kmh: 3,
+    considered_kmh: 97,
+    road_limit_kmh: 80,
+    measured_at: '2026-09-14T10:00:00-04:00',
+    latitude: -3.1019,
+    longitude: -60.025,
+    agent_id: ACTOR_ID,
+    ...overrides,
+  };
+}
+
+describe('CTG-0004 §6 — create-measurement: considered_kmh derivado (C-0004-25)', () => {
+  it('C-0004-25 — dado considered_kmh ≠ measured_kmh − max_error_kmh então 422 TEAT.VALIDATION_FAILED, antes de qualquer escrita', async () => {
+    const dependencies = deps();
+    await expect(
+      createMeasurement(dependencies, baseBody({ considered_kmh: 999 })),
+    ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED', status: 422 });
+    expect(
+      dependencies.repositories.measurements.create,
+    ).not.toHaveBeenCalled();
+  });
+
+  it('dado considered_kmh = measured_kmh − max_error_kmh então 201', async () => {
+    const dependencies = deps();
+    await expect(
+      createMeasurement(dependencies, baseBody()),
+    ).resolves.toMatchObject({
+      measured_kmh: 100,
+      max_error_kmh: 3,
+      considered_kmh: 97,
+    });
+  });
+});
+
+describe('CTG-0004 §6 — create-measurement: placa não confirmada com ait_id (C-0004-26, RN-TEAT-115)', () => {
+  it('C-0004-26 — dado ait_id informado com plate_validated_by_agent=false então 422 TEAT.AIT_PLATE_NOT_CONFIRMED', async () => {
+    const dependencies = deps();
+    await expect(
+      createMeasurement(
+        dependencies,
+        baseBody({
+          ait_id: AIT_ID,
+          plate_image_evidence_id: '00000000-0000-7000-8000-0000ef900099',
+          plate_validated_by_agent: false,
+        }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_PLATE_NOT_CONFIRMED',
+      status: 422,
+    });
+  });
+
+  it('dado ait_id informado com plate_validated_by_agent=true, plate_image_evidence_id e considered_kmh > road_limit_kmh então 201', async () => {
+    const dependencies = deps();
+    await expect(
+      createMeasurement(
+        dependencies,
+        baseBody({
+          ait_id: AIT_ID,
+          plate_image_evidence_id: '00000000-0000-7000-8000-0000ef900099',
+          plate_validated_by_agent: true,
+        }),
+      ),
+    ).resolves.toMatchObject({ ait_id: AIT_ID });
+  });
+});
+
+describe('CTG-0004 §6 — create-measurement: certificado vencido (C-0004-27, RN-TEAT-138)', () => {
+  it('C-0004-27 — dado o certificado …efa00001 vencido em relação a measured_at então 422 TEAT.AIT_EQUIPMENT_REQUIRED com { meterId, certificateId }', async () => {
+    const dependencies = deps({
+      repositories: {
+        measurements: repository(),
+        meters: repository([
+          { id: METER_ID, tenant_id: TENANT_ID, meter_type: 'movel_acoplado' },
+        ]),
+        certificates: repository([
+          {
+            id: CERTIFICATE_VALID,
+            tenant_id: TENANT_ID,
+            meter_id: METER_ID,
+            valid_until: '2026-01-01',
+          },
+        ]),
+      },
+    });
+    await expect(
+      createMeasurement(dependencies, baseBody()),
+    ).rejects.toMatchObject({
+      code: 'TEAT.AIT_EQUIPMENT_REQUIRED',
+      status: 422,
+      context: expect.objectContaining({
+        meterId: METER_ID,
+        certificateId: CERTIFICATE_VALID,
+      }),
+    });
+  });
+});
diff --git a/backend/domains/inf/speed/src/handwritten/create-measurement.command.ts b/backend/domains/inf/speed/src/handwritten/create-measurement.command.ts
new file mode 100644
index 0000000..fd7f341
--- /dev/null
+++ b/backend/domains/inf/speed/src/handwritten/create-measurement.command.ts
@@ -0,0 +1,209 @@
+// CTG-0004 §6 (R-0008, TASK-0009, RN-TEAT-115, RN-TEAT-138) —
+// `POST /v1/inf/speed/measurements`. Módulo atrás de `teat.speed_meters`
+// (default `false`, `app.module.ts`); só teste unitário nesta rodada (M15).
+//
+// `repositories` pode vir vazio (produção: SQL parametrizado na transação do
+// comando, mesmo padrão de `inf/measures`/`inf/alcohol`, CTG-0004 §4/§5) ou
+// preenchido pelos dublês de teste — nunca a porta gerada diretamente (que
+// lança `NotFoundException` em vez de devolver `undefined`, CTG-0004 §6
+// pré-condições precisam do caminho "ausente" para os próprios erros de
+// negócio, não um 404 genérico).
+import { DetranError } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type SpeedRow = Record<string, unknown>;
+
+export interface SpeedRowStore {
+  findOne?(id: string): Promise<SpeedRow | undefined>;
+  find?(id: string): Promise<SpeedRow | undefined>;
+  create?(values: SpeedRow): Promise<SpeedRow>;
+}
+
+export interface CreateMeasurementDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: {
+    measurements?: SpeedRowStore;
+    meters?: SpeedRowStore;
+    certificates?: SpeedRowStore;
+  };
+  clock: { now(): string };
+}
+
+export interface CreateSpeedMeasurementInput {
+  meter_id: string;
+  certificate_id: string;
+  measured_kmh: number;
+  max_error_kmh: number;
+  considered_kmh?: number;
+  road_limit_kmh: number;
+  measured_at: string;
+  latitude: number;
+  longitude: number;
+  plate_image_evidence_id?: string;
+  ocr_plate_proposed?: string;
+  plate_validated_by_agent?: boolean;
+  ait_id?: string;
+  agent_id: string;
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+async function findOne(
+  store: SpeedRowStore | undefined,
+  tx: unknown,
+  table: string,
+  id: string,
+): Promise<SpeedRow | undefined> {
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(`select * from ${table} where id = $1`, [id]);
+  return result.rows[0];
+}
+
+async function insertOne(
+  store: SpeedRowStore | undefined,
+  tx: unknown,
+  table: string,
+  values: SpeedRow,
+): Promise<SpeedRow> {
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = asQueryable(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de velocidade');
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${table} (${columns.join(', ')}) values (${placeholders}) returning *`,
+    columns.map((column) => values[column] ?? null),
+  );
+  return (result.rows[0] ?? values) as SpeedRow;
+}
+
+function isPlateConfirmed(input: CreateSpeedMeasurementInput): boolean {
+  return input.plate_validated_by_agent === true;
+}
+
+export class CreateMeasurementCommand {
+  constructor(private readonly deps: CreateMeasurementDeps) {}
+
+  async execute(
+    input: CreateSpeedMeasurementInput,
+  ): Promise<Record<string, unknown>> {
+    if (!this.deps.requestContext.hasActiveContext())
+      throw new Error('Um comando de velocidade exige contexto de requisição');
+    this.deps.requestContext.snapshot();
+
+    return this.deps.database.tx(async (tx) => {
+      // 1. certificado do medidor vigente.
+      const certificate = await findOne(
+        this.deps.repositories.certificates,
+        tx,
+        'inf.speed_meter_certificate',
+        input.certificate_id,
+      );
+      const validUntil =
+        typeof certificate?.valid_until === 'string'
+          ? certificate.valid_until
+          : '';
+      if (
+        !certificate ||
+        validUntil.slice(0, 10) < input.measured_at.slice(0, 10)
+      )
+        throw new DetranError('TEAT.AIT_EQUIPMENT_REQUIRED', {
+          status: 422,
+          context: {
+            framingId: null,
+            meterId: input.meter_id,
+            certificateId: input.certificate_id,
+          },
+          message: 'Certificado do medidor de velocidade vencido ou ausente.',
+        });
+
+      // 2. ait_id exige placa confirmada e excesso sobre o limite.
+      if (input.ait_id) {
+        if (!isPlateConfirmed(input))
+          throw new DetranError('TEAT.AIT_PLATE_NOT_CONFIRMED', {
+            status: 422,
+            context: { aitId: input.ait_id },
+            message: 'Placa não confirmada pelo agente.',
+          });
+        const considered = input.measured_kmh - input.max_error_kmh;
+        if (
+          !input.plate_image_evidence_id ||
+          !(considered > input.road_limit_kmh)
+        )
+          throw new DetranError('TEAT.VALIDATION_FAILED', {
+            status: 422,
+            context: {
+              fields: [{ path: 'plate_image_evidence_id', rule: 'required' }],
+            },
+            message:
+              'Vínculo ao AIT exige evidência de placa e excesso sobre o limite.',
+          });
+      }
+
+      // 3. `considered_kmh` derivado (check do blueprint).
+      const considered = input.measured_kmh - input.max_error_kmh;
+      if (
+        input.considered_kmh !== undefined &&
+        Math.abs(input.considered_kmh - considered) > 1e-9
+      )
+        throw new DetranError('TEAT.VALIDATION_FAILED', {
+          status: 422,
+          context: {
+            fields: [{ path: 'considered_kmh', rule: 'derived' }],
+          },
+          message: 'considered_kmh deve ser measured_kmh − max_error_kmh.',
+        });
+
+      const measurement = await insertOne(
+        this.deps.repositories.measurements,
+        tx as Transaction,
+        'inf.speed_measurement',
+        {
+          meter_id: input.meter_id,
+          certificate_id: input.certificate_id,
+          measured_kmh: input.measured_kmh,
+          max_error_kmh: input.max_error_kmh,
+          considered_kmh: considered,
+          road_limit_kmh: input.road_limit_kmh,
+          measured_at: input.measured_at,
+          latitude: input.latitude,
+          longitude: input.longitude,
+          plate_image_evidence_id: input.plate_image_evidence_id ?? null,
+          ocr_plate_proposed: input.ocr_plate_proposed ?? null,
+          plate_validated_by_agent: input.plate_validated_by_agent ?? false,
+          ait_id: input.ait_id ?? null,
+          agent_id: input.agent_id,
+        },
+      );
+
+      return {
+        id: measurement.id,
+        measured_kmh: input.measured_kmh,
+        max_error_kmh: input.max_error_kmh,
+        considered_kmh: considered,
+        road_limit_kmh: input.road_limit_kmh,
+        ait_id: input.ait_id ?? null,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts b/backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts
new file mode 100644
index 0000000..c5e3238
--- /dev/null
+++ b/backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts
@@ -0,0 +1,38 @@
+// CTG-0004 §6 (R-0008, TASK-0009) — `POST /v1/inf/speed/measurements`.
+// Módulo só monta atrás de `teat.speed_meters` (app.module.ts); a política
+// já cobre a superfície CRUD de `inf:speed-measurement:create`
+// (`INF_SURFACE_RULES`, CTG-0004 §6).
+import { Body, Controller, Post } from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+
+import {
+  CreateMeasurementCommand,
+  type CreateSpeedMeasurementInput,
+} from './create-measurement.command.js';
+
+@Controller('v1/inf/speed/measurements')
+@Resource('inf:speed-measurement')
+export class SpeedCommandsController {
+  private readonly command: CreateMeasurementCommand;
+
+  constructor(database: Database, requestContext: RequestContext) {
+    this.command = new CreateMeasurementCommand({
+      database,
+      requestContext,
+      repositories: {},
+      clock: { now: () => new Date().toISOString() },
+    });
+  }
+
+  @Post()
+  @Action('create')
+  @Audit({
+    action: 'INF_SPEED_MEASUREMENT_CREATE',
+    entity: 'inf.speed_measurement',
+  })
+  create(@Body() body: CreateSpeedMeasurementInput) {
+    return this.command.execute(body);
+  }
+}
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index 6574d07..e3cf5ec 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -1032,13 +1032,42 @@ describe('CTG-0001 §5 — AIT completo: archive, review-concurrency, ait-cancel
     ]);
   });

-  it('C-0001-07 — dado a superfície CRUD gerada então inf:ait-cancel-request:{read,create,update,delete} e inf:ait-cancel-request-event:{read,create,update,delete} existem na matriz (INF_RESOURCES, §5)', () => {
-    for (const resource of ['ait-cancel-request', 'ait-cancel-request-event']) {
-      for (const action of ['read', 'create', 'update', 'delete']) {
+  it('C-0001-07 — dado a superfície CRUD gerada então inf:ait-cancel-request:{read,create} e inf:ait-cancel-request-event:{read,create,update,delete} existem na matriz; inf:ait-cancel-request:{update,delete} não existem (OD-T60: AitCancelRequestController gerado só expõe list|get desde CTG-0001 §12)', () => {
+    for (const action of ['read', 'create']) {
+      expect(
+        `inf:ait-cancel-request:${action}` in DETRAN_POLICY_MATRIX,
+        `inf:ait-cancel-request:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
+      ).toBe(true);
+    }
+    for (const action of ['update', 'delete']) {
+      expect(
+        `inf:ait-cancel-request:${action}` in DETRAN_POLICY_MATRIX,
+        `inf:ait-cancel-request:${action} deveria ter sido removida (OD-T60: sem rota, CRUD gerado é list|get)`,
+      ).toBe(false);
+    }
+    for (const action of ['read', 'create', 'update', 'delete']) {
+      expect(
+        `inf:ait-cancel-request-event:${action}` in DETRAN_POLICY_MATRIX,
+        `inf:ait-cancel-request-event:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
+      ).toBe(true);
+    }
+  });
+
+  it('OD-T60 — dado qualquer papel canônico então nenhum recebe inf:ait-cancel-request:{update,delete} como chave explícita, nem por permissionsForRoles (negativo universal; technical-admin passa só por GLOBAL_ADMIN_ROLES/"*")', () => {
+    for (const role of TEAT_CANONICAL_ROLES) {
+      for (const action of ['update', 'delete'] as const) {
+        if (role !== 'technical-admin') {
+          expect(
+            allowed([role], 'inf:ait-cancel-request', action),
+            `inf:ait-cancel-request:${action} não deveria ser concedido a ${role}`,
+          ).toBe(false);
+        }
         expect(
-          `inf:${resource}:${action}` in DETRAN_POLICY_MATRIX,
-          `inf:${resource}:${action} deveria existir na matriz (superfície CRUD gerada, §5)`,
-        ).toBe(true);
+          permissionsForRoles([role]).includes(
+            `inf:ait-cancel-request:${action}`,
+          ),
+          `permissionsForRoles(${role}) nunca deveria conter a chave explícita inf:ait-cancel-request:${action}`,
+        ).toBe(false);
       }
     }
   });
@@ -1758,3 +1787,192 @@ describe('R-0008 CTG-0003 §7 — política de evidência, snapshots e normativo
     });
   });
 });
+
+/**
+ * CTG-0004 §2/§4/§5/§8 (R-0008, TASK-0008) — medidas administrativas,
+ * alcoolemia, velocidade, SSE e integrações (WP-T2). `inf:administrative-measure:*`
+ * e `inf:alcohol-procedure:*` já existem em `TEAT_RULES` (ported ahead of
+ * TASK-0009, verificado por leitura direta de `policy.ts` linhas 663–706): os
+ * testes abaixo passam hoje. `ops:stream:read` e `ops:integration:{read,retry}`
+ * são chaves NOVAS pedidas pelo contrato (§8) e ainda não existem — os dois
+ * últimos `describe` ficam vermelhos até TASK-0009, comportamento ausente,
+ * nunca ajuste de teste (regra 7 do prompt).
+ */
+describe('CTG-0004 §2/§4/§5/§8 — medidas, alcoolemia, velocidade, SSE, integrações (TASK-0008)', () => {
+  const allowed = (roles: string[], resource: string, action: string) =>
+    isDetranActionAllowed({ roles, permissions: [] }, resource, action);
+
+  /** Os oito papéis canônicos da família TEAT (plan.md §0, roles.ts). */
+  const TEAT_CANONICAL_ROLES = [
+    'field-agent',
+    'field-supervisor',
+    'processing-operator',
+    'traffic-authority',
+    'agency-admin',
+    'technical-admin',
+    'AUDITOR',
+    'integration-operator',
+  ] as const;
+
+  function expectGrantedOnlyTo(
+    resource: string,
+    action: string,
+    grantedRoles: readonly string[],
+  ): void {
+    for (const role of TEAT_CANONICAL_ROLES) {
+      if (role === 'technical-admin') {
+        expect(
+          allowed([role], resource, action),
+          `technical-admin deveria passar por GLOBAL_ADMIN_ROLES ('*') em ${resource}:${action}`,
+        ).toBe(true);
+        continue;
+      }
+      const expected = (grantedRoles as readonly string[]).includes(role);
+      expect(
+        allowed([role], resource, action),
+        `${resource}:${action} para o papel ${role} deveria ser ${expected}`,
+      ).toBe(expected);
+    }
+    // rait-test-strategy.md §2: "negado para pelo menos um papel RAIT fora da lista".
+    expect(
+      allowed(['rait-analyst'], resource, action),
+      `${resource}:${action} nunca deveria conceder a um papel RAIT`,
+    ).toBe(false);
+  }
+
+  describe('§4 — inf:administrative-measure:* (C-0004: matriz de política das medidas)', () => {
+    it('start — field-agent, processing-operator', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'start', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+    it('register-retention — field-agent, processing-operator', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'register-retention', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+    it('register-removal — field-agent, processing-operator', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'register-removal', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+    it('inventory-vehicle — field-agent, processing-operator', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'inventory-vehicle', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+    it('apply-term — field-agent, processing-operator', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'apply-term', [
+        'field-agent',
+        'processing-operator',
+      ]);
+    });
+    it('release — field-supervisor, traffic-authority (403 TEAT.MEASURE_RELEASE_NOT_ALLOWED nos demais, §4.6)', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'release', [
+        'field-supervisor',
+        'traffic-authority',
+      ]);
+    });
+    it('conclude — só traffic-authority', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'conclude', [
+        'traffic-authority',
+      ]);
+    });
+    it('cancel — só traffic-authority (a rota sempre responde 409, §4.7)', () => {
+      expectGrantedOnlyTo('inf:administrative-measure', 'cancel', [
+        'traffic-authority',
+      ]);
+    });
+  });
+
+  describe('§5 — inf:alcohol-procedure:* (C-0004: matriz de política da alcoolemia)', () => {
+    it('start — só field-agent', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'start', ['field-agent']);
+    });
+    it('record-test — só field-agent', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-test', [
+        'field-agent',
+      ]);
+    });
+    it('record-refusal — só field-agent', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-refusal', [
+        'field-agent',
+      ]);
+    });
+    it('record-psychomotor-signs — só field-agent', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'record-psychomotor-signs', [
+        'field-agent',
+      ]);
+    });
+    it('forward — só field-agent', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'forward', ['field-agent']);
+    });
+    it('close — field-agent, field-supervisor', () => {
+      expectGrantedOnlyTo('inf:alcohol-procedure', 'close', [
+        'field-agent',
+        'field-supervisor',
+      ]);
+    });
+  });
+
+  describe('§6 — inf:speed-measurement:create (atrás de teat.speed_meters, INF_FIELD_LEGAL_ROLES)', () => {
+    it('create — field-agent, field-supervisor, processing-operator, traffic-authority, technical-admin (INF_FIELD_LEGAL_ROLES; agency-admin/AUDITOR/integration-operator negados)', () => {
+      // INF_FIELD_LEGAL_ROLES inclui technical-admin explicitamente (não só via
+      // GLOBAL_ADMIN_ROLES) — expectGrantedOnlyTo cobre os dois caminhos porque
+      // ambos concedem true.
+      for (const role of [
+        'field-agent',
+        'field-supervisor',
+        'processing-operator',
+        'traffic-authority',
+      ] as const) {
+        expect(allowed([role], 'inf:speed-measurement', 'create')).toBe(true);
+      }
+      for (const role of [
+        'agency-admin',
+        'AUDITOR',
+        'integration-operator',
+      ] as const) {
+        expect(allowed([role], 'inf:speed-measurement', 'create')).toBe(false);
+      }
+    });
+  });
+
+  /**
+   * §8 (M17/OD-T17) — `ops:stream:read`: chave NOVA, todos os oito papéis
+   * TEAT (o stream só entrega o que o papel já lê por outra chave — não é
+   * ampliação de acesso). Vermelho até TASK-0009 acrescentar a linha em
+   * `TEAT_RULES`.
+   */
+  describe('§8 (OD-T17) — ops:stream:read: todos os oito papéis TEAT, nenhum papel PEC/RAIT/DASHBOARD', () => {
+    it('dado cada um dos oito papéis TEAT quando ops:stream:read então permitido', () => {
+      for (const role of TEAT_CANONICAL_ROLES) {
+        expect(
+          allowed([role], 'ops:stream', 'read'),
+          `ops:stream:read deveria ser permitido para ${role} (OD-T17)`,
+        ).toBe(true);
+      }
+    });
+    it('dado um papel PEC (CANDIDATO) ou RAIT (rait-analyst) quando ops:stream:read então negado', () => {
+      expect(allowed(['CANDIDATO'], 'ops:stream', 'read')).toBe(false);
+      expect(allowed(['rait-analyst'], 'ops:stream', 'read')).toBe(false);
+    });
+  });
+
+  /**
+   * §8 (route contract §4.6) — `ops:integration:{read,retry}`: só
+   * integration-operator e technical-admin. Vermelho até TASK-0009.
+   */
+  describe('§8 — ops:integration:{read,retry}: só integration-operator e technical-admin', () => {
+    it('read — integration-operator, technical-admin; negado para os outros seis papéis TEAT', () => {
+      expectGrantedOnlyTo('ops:integration', 'read', ['integration-operator']);
+    });
+    it('retry — integration-operator, technical-admin; negado para os outros seis papéis TEAT', () => {
+      expectGrantedOnlyTo('ops:integration', 'retry', ['integration-operator']);
+    });
+  });
+});
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index d8b9e3a..9ed2f83 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -469,11 +469,18 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
   // CTG-0001 §5 (M4/M18, TASK-0003): AIT completo — archive, review da
   // apuração de concorrência e o comando de cancelamento. `create` reflete a
   // origem `teat-policy.ts` (`ait-cancel-request:create`), mais restrito que
-  // `INF_FIELD_LEGAL_ROLES` (sem `processing-operator`); os pares `read`,
-  // `update`, `delete` e o recurso `ait-cancel-request-event` são a
-  // superfície CRUD gerada, sem regra hoje (§11.7 do contrato) — literais
-  // (não `INF_READ_ROLES`/`INF_FIELD_LEGAL_ROLES`: essas consts só são
-  // declaradas depois deste bloco no arquivo, TDZ impede a referência aqui).
+  // `INF_FIELD_LEGAL_ROLES` (sem `processing-operator`); o par `read` e o
+  // recurso `ait-cancel-request-event` são a superfície CRUD gerada
+  // (literais, não `INF_READ_ROLES`/`INF_FIELD_LEGAL_ROLES`: essas consts só
+  // são declaradas depois deste bloco no arquivo, TDZ impede a referência
+  // aqui).
+  //
+  // CTG-0004 §15.3 (OD-T60, adenda pós-TASK-0009 iteração 1): `update`/
+  // `delete` de `ait-cancel-request` **removidas** — `AitCancelRequestController`
+  // gerado só expõe `list`/`get` desde CTG-0001 §12 (chave sem rota,
+  // `policy-routes.e2e.spec.ts` sentido 2); o Inspector ajusta
+  // `policy.spec.ts` C-0001-07 em paralelo (chaves ausentes = negativo
+  // universal).
   ['inf', 'ait', 'archive', ['traffic-authority']],
   ['inf', 'ait', 'review-concurrency', ['traffic-authority', 'AUDITOR']],
   [
@@ -500,19 +507,6 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
       'integration-operator',
     ],
   ],
-  [
-    'inf',
-    'ait-cancel-request',
-    'update',
-    [
-      'field-agent',
-      'field-supervisor',
-      'processing-operator',
-      'traffic-authority',
-      'technical-admin',
-    ],
-  ],
-  ['inf', 'ait-cancel-request', 'delete', ['technical-admin']],
   [
     'inf',
     'ait-cancel-request-event',
@@ -704,6 +698,27 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
   ['inf', 'alcohol-procedure', 'record-psychomotor-signs', ['field-agent']],
   ['inf', 'alcohol-procedure', 'forward', ['field-agent']],
   ['inf', 'alcohol-procedure', 'close', ['field-agent', 'field-supervisor']],
+  // CTG-0004 §8 (M17/M18, TASK-0009, OD-T17): `ops:stream:read` concede a
+  // todos os oito papéis TEAT — o stream só entrega eventos cujo recurso o
+  // papel já lê (§7.2), não é ampliação. `ops:integration:{read,retry}`
+  // (route contract §4.6) ficam com integration-operator/technical-admin.
+  [
+    'ops',
+    'stream',
+    'read',
+    [
+      'field-agent',
+      'field-supervisor',
+      'processing-operator',
+      'traffic-authority',
+      'agency-admin',
+      'technical-admin',
+      'AUDITOR',
+      'integration-operator',
+    ],
+  ],
+  ['ops', 'integration', 'read', ['integration-operator', 'technical-admin']],
+  ['ops', 'integration', 'retry', ['integration-operator', 'technical-admin']],
   ['est', 'crash-record', 'start', ['field-agent']],
   ['est', 'crash-record', 'add-vehicle', ['field-agent']],
   ['est', 'crash-record', 'add-person', ['field-agent']],
@@ -1068,6 +1083,92 @@ const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
   ['person-document', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
   ['vehicle-snapshot', 'read', OPS_SNAPSHOT_SURFACE_ROLES],
   ['vehicle-snapshot', 'create', OPS_SNAPSHOT_SURFACE_ROLES],
+  // CTG-0004 §8 (M18, TASK-0009) e §15.7 (adenda, iteração 2): `update`/
+  // `delete` (e, para os poucos recursos sem nenhuma regra de escrita ainda,
+  // `create`) da superfície CRUD gerada de `ops/*` que `policy-routes.e2e.spec.ts`
+  // acusava sem chave — 66 pares, achado do maestro após CTG-0001/0002/0003
+  // (nenhum deles tocou `update`/`delete`, só `read`/`create`). §15.7:
+  // "nenhum grant por analogia" — só entra papel diferente de `technical-admin`
+  // quando CTG-0002 §8 ou CTG-0003 §7 (origem `teat-policy.ts`) sourceiam
+  // **a própria ação** (não o recurso em geral); nos demais, a entrada é só
+  // `['technical-admin']`, que não abre acesso a ninguém que já não o tenha
+  // (`isDetranActionAllowed` concede `technical-admin` por `GLOBAL_ADMIN_ROLES`
+  // independente de regra) — a entrada só fecha o sentido 1 da matriz.
+  //
+  // `numbering-range:update` é a única exceção com papel próprio: já sourceada
+  // em CTG-0002 §8 (`['numbering-range','update',['agency-admin','technical-admin']]`)
+  // e já implementada antes desta tarefa via `OPS_NUMBERING_ADMIN_ROLES`
+  // (linha `numbering-range/read/create/update` acima); só falta aqui o `delete`,
+  // sem fonte, `technical-admin`. Nenhum outro `update`/`create` abaixo tem
+  // fonte para a ação específica — todos técnical-admin-only.
+  ['agency-unit', 'update', ['technical-admin']],
+  ['agency-unit', 'delete', ['technical-admin']],
+  ['agency-jurisdiction', 'update', ['technical-admin']],
+  ['agency-jurisdiction', 'delete', ['technical-admin']],
+  ['agency-competence', 'update', ['technical-admin']],
+  ['agency-competence', 'delete', ['technical-admin']],
+  ['agent-profile', 'update', ['technical-admin']],
+  ['agent-profile', 'delete', ['technical-admin']],
+  ['operational-device', 'update', ['technical-admin']],
+  ['operational-device', 'delete', ['technical-admin']],
+  ['homologation', 'update', ['technical-admin']],
+  ['homologation', 'delete', ['technical-admin']],
+  ['application-version', 'update', ['technical-admin']],
+  ['application-version', 'delete', ['technical-admin']],
+  ['device-event', 'create', ['technical-admin']],
+  ['device-event', 'update', ['technical-admin']],
+  ['device-event', 'delete', ['technical-admin']],
+  ['operation', 'update', ['technical-admin']],
+  ['operation', 'delete', ['technical-admin']],
+  ['team', 'update', ['technical-admin']],
+  ['team', 'delete', ['technical-admin']],
+  ['team-agent', 'update', ['technical-admin']],
+  ['team-agent', 'delete', ['technical-admin']],
+  ['patrol-vehicle', 'update', ['technical-admin']],
+  ['patrol-vehicle', 'delete', ['technical-admin']],
+  ['measurement-instrument', 'update', ['technical-admin']],
+  ['measurement-instrument', 'delete', ['technical-admin']],
+  ['shift', 'update', ['technical-admin']],
+  ['shift', 'delete', ['technical-admin']],
+  ['approach', 'update', ['technical-admin']],
+  ['approach', 'delete', ['technical-admin']],
+  ['session-handoff', 'create', ['technical-admin']],
+  ['session-handoff', 'update', ['technical-admin']],
+  ['session-handoff', 'delete', ['technical-admin']],
+  ['person', 'update', ['technical-admin']],
+  ['person', 'delete', ['technical-admin']],
+  ['person-document', 'update', ['technical-admin']],
+  ['person-document', 'delete', ['technical-admin']],
+  ['vehicle', 'update', ['technical-admin']],
+  ['vehicle', 'delete', ['technical-admin']],
+  ['vehicle-snapshot', 'update', ['technical-admin']],
+  ['vehicle-snapshot', 'delete', ['technical-admin']],
+  // `evidence:update` já sourceado (CTG-0003 §7) antes desta tarefa; só falta
+  // `delete`, sem fonte.
+  ['evidence', 'delete', ['technical-admin']],
+  ['evidence-link', 'update', ['technical-admin']],
+  ['evidence-link', 'delete', ['technical-admin']],
+  ['custody-event', 'update', ['technical-admin']],
+  ['custody-event', 'delete', ['technical-admin']],
+  ['probative-package', 'update', ['technical-admin']],
+  ['probative-package', 'delete', ['technical-admin']],
+  ['probative-package-item', 'update', ['technical-admin']],
+  ['probative-package-item', 'delete', ['technical-admin']],
+  ['storage-intent', 'update', ['technical-admin']],
+  ['storage-intent', 'delete', ['technical-admin']],
+  ['numbering-range', 'delete', ['technical-admin']],
+  ['numbering-reservation', 'create', ['technical-admin']],
+  ['numbering-reservation', 'update', ['technical-admin']],
+  ['numbering-reservation', 'delete', ['technical-admin']],
+  ['numbering-consumption', 'create', ['technical-admin']],
+  ['numbering-consumption', 'update', ['technical-admin']],
+  ['numbering-consumption', 'delete', ['technical-admin']],
+  ['sync-queue-item', 'create', ['technical-admin']],
+  ['sync-queue-item', 'update', ['technical-admin']],
+  ['sync-queue-item', 'delete', ['technical-admin']],
+  ['sync-conflict', 'create', ['technical-admin']],
+  ['sync-conflict', 'update', ['technical-admin']],
+  ['sync-conflict', 'delete', ['technical-admin']],
 ];

 const INF_READ_ROLES: readonly DetranRole[] = [
diff --git a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
index ac693ba..ccff2ac 100644
--- a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
+++ b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
@@ -8,11 +8,43 @@
     "ddlFile": "33-inf-alcohol.sql",
     "dependencies": {
       "@detran/inf-ait": "workspace:*",
-      "@detran/inf-measures": "workspace:*"
+      "@detran/inf-measures": "workspace:*",
+      "@detran/inf-normative": "workspace:*"
     },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-ait",
+        "target": "../ait/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-measures",
+        "target": "../measures/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-normative",
+        "target": "../normative/src/index.ts"
+      }
+    ],
+    "handwrittenControllers": [
+      {
+        "target": "alcohol-commands.controller",
+        "symbol": "AlcoholCommandsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/alcohol-lifecycle.provider",
+        "symbol": "ALCOHOL_LIFECYCLE_PROVIDER"
+      }
+    ],
     "handwrittenExports": [
       "alcohol-lifecycle.service",
-      "alcohol-commands.controller"
+      "alcohol-commands.controller",
+      "handwritten/index"
     ],
     "owners": ["detran-inf"],
     "description": "Breathalyzer and alcohol-testing procedure flows ported from TEAT."
@@ -24,22 +56,79 @@
         "table": "alcohol_procedure",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "ait_id", "type": "uuid", "nullable": true },
-          { "name": "measure_id", "type": "uuid", "nullable": true },
-          { "name": "approach_id", "type": "uuid", "nullable": true },
-          { "name": "agent_id", "type": "uuid" },
-          { "name": "shift_id", "type": "uuid" },
-          { "name": "driver_person_id", "type": "uuid", "nullable": true },
-          { "name": "procedure_at", "type": "timestamptz" },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "procedure_type", "type": "varchar(60)" },
-          { "name": "outcome", "type": "varchar(80)" },
-          { "name": "status", "type": "varchar(40)", "default": "'draft'" },
-          { "name": "notes", "type": "text", "nullable": true },
-          { "name": "ait_local_id", "type": "varchar(120)", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "ait_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "approach_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "agent_id",
+            "type": "uuid"
+          },
+          {
+            "name": "shift_id",
+            "type": "uuid"
+          },
+          {
+            "name": "driver_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "procedure_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "procedure_type",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "outcome",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'draft'"
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "ait_local_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
           {
             "name": "sign_catalog_id",
             "type": "varchar(120)",
@@ -71,8 +160,16 @@
             "pii": "high",
             "retention": "forever"
           },
-          { "name": "vehicle_make", "type": "varchar(120)", "nullable": true },
-          { "name": "refused_procedures", "type": "boolean", "nullable": true },
+          {
+            "name": "vehicle_make",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "refused_procedures",
+            "type": "boolean",
+            "nullable": true
+          },
           {
             "name": "driver_statement_json",
             "type": "jsonb",
@@ -121,7 +218,10 @@
           {
             "name": "fk_inf_alcohol_ait",
             "columns": ["ait_id"],
-            "references": { "table": "inf.ait_ait", "columns": ["id"] }
+            "references": {
+              "table": "inf.ait_ait",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_measure",
@@ -134,12 +234,18 @@
           {
             "name": "fk_inf_alcohol_approach",
             "columns": ["approach_id"],
-            "references": { "table": "ops.ops_approach", "columns": ["id"] }
+            "references": {
+              "table": "ops.ops_approach",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_person",
             "columns": ["driver_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -148,19 +254,48 @@
         "table": "alcohol_breathalyzer",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "serial_number", "type": "varchar(120)" },
-          { "name": "model", "type": "varchar(120)", "nullable": true },
-          { "name": "manufacturer", "type": "varchar(120)", "nullable": true },
-          { "name": "last_calibration_at", "type": "date", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "serial_number",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "model",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "manufacturer",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "last_calibration_at",
+            "type": "date",
+            "nullable": true
+          },
           {
             "name": "calibration_valid_until",
             "type": "date",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
@@ -175,13 +310,38 @@
         "table": "alcohol_test",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "breathalyzer_id", "type": "uuid", "nullable": true },
-          { "name": "test_number", "type": "varchar(80)", "nullable": true },
-          { "name": "tested_at", "type": "timestamptz" },
-          { "name": "result_mg_l", "type": "numeric(8,3)", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "breathalyzer_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "test_number",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "tested_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "result_mg_l",
+            "type": "numeric(8,3)",
+            "nullable": true
+          },
           {
             "name": "considered_mg_l",
             "type": "numeric(8,3)",
@@ -192,13 +352,21 @@
             "type": "numeric(8,3)",
             "nullable": true
           },
-          { "name": "counterproof", "type": "boolean", "default": "false" },
+          {
+            "name": "counterproof",
+            "type": "boolean",
+            "default": "false"
+          },
           {
             "name": "result_image_evidence_id",
             "type": "uuid",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(40)", "default": "'recorded'" }
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'recorded'"
+          }
         ],
         "checks": [
           {
@@ -238,14 +406,41 @@
         "table": "alcohol_refusal",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "refused_at", "type": "timestamptz" },
-          { "name": "kind", "type": "varchar(40)" },
-          { "name": "refusal_description", "type": "text" },
-          { "name": "witness_person_id", "type": "uuid", "nullable": true },
-          { "name": "evidence_id", "type": "uuid", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "refused_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "refusal_description",
+            "type": "text"
+          },
+          {
+            "name": "witness_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "evidence_id",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -265,7 +460,10 @@
           {
             "name": "fk_inf_alcohol_refusal_person",
             "columns": ["witness_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_refusal_evidence",
@@ -282,15 +480,47 @@
         "table": "alcohol_psychomotor_sign",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "sign_code", "type": "varchar(80)" },
-          { "name": "description", "type": "text" },
-          { "name": "observed", "type": "boolean", "default": "true" },
-          { "name": "sign_group", "type": "varchar(80)", "nullable": true },
-          { "name": "sign_status", "type": "varchar(20)", "nullable": true },
-          { "name": "method", "type": "varchar(120)", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "sign_code",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "description",
+            "type": "text"
+          },
+          {
+            "name": "observed",
+            "type": "boolean",
+            "default": "true"
+          },
+          {
+            "name": "sign_group",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "sign_status",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "method",
+            "type": "varchar(120)",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -308,14 +538,41 @@
         "table": "alcohol_forwarding",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "forwarding_type", "type": "varchar(80)" },
-          { "name": "destination", "type": "varchar(255)" },
-          { "name": "forwarded_at", "type": "timestamptz" },
-          { "name": "protocol", "type": "varchar(120)", "nullable": true },
-          { "name": "notes", "type": "text", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "forwarding_type",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "destination",
+            "type": "varchar(255)"
+          },
+          {
+            "name": "forwarded_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "protocol",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -343,7 +600,11 @@
         "path": "breathalyzers",
         "resource": "breathalyzer"
       },
-      { "entity": "AlcoholTest", "path": "tests", "resource": "alcohol-test" },
+      {
+        "entity": "AlcoholTest",
+        "path": "tests",
+        "resource": "alcohol-test"
+      },
       {
         "entity": "AlcoholRefusal",
         "path": "refusals",
@@ -361,6 +622,10 @@
       }
     ]
   },
-  "auth": { "source": "TEAT_COMMAND_RULES" },
-  "audit": { "enabled": true }
+  "auth": {
+    "source": "TEAT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
 }
diff --git a/docs/framework/blueprints/BP-INF-MEASURES-001.json b/docs/framework/blueprints/BP-INF-MEASURES-001.json
index 1f70d20..1f368b4 100644
--- a/docs/framework/blueprints/BP-INF-MEASURES-001.json
+++ b/docs/framework/blueprints/BP-INF-MEASURES-001.json
@@ -6,10 +6,44 @@
     "namespace": "inf",
     "version": "1.1.0",
     "ddlFile": "32-inf-measures.sql",
-    "dependencies": { "@detran/inf-ait": "workspace:*" },
+    "dependencies": {
+      "@detran/inf-ait": "workspace:*",
+      "@detran/inf-deadlines": "workspace:*"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-ait",
+        "target": "../ait/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenControllers": [
+      {
+        "target": "measure-commands.controller",
+        "symbol": "MeasureCommandsController"
+      },
+      {
+        "target": "measure-commands.controller",
+        "symbol": "MeasureRetentionCommandsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/measure-lifecycle.provider",
+        "symbol": "MEASURE_LIFECYCLE_PROVIDER"
+      }
+    ],
     "handwrittenExports": [
       "measure-lifecycle.service",
-      "measure-commands.controller"
+      "measure-commands.controller",
+      "handwritten/index"
     ],
     "owners": ["detran-inf"],
     "description": "Administrative measures, terms, retention, removal, inventory, providers, yards, and status history."
@@ -21,12 +55,33 @@
         "table": "measure_type",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "code", "type": "varchar(60)" },
-          { "name": "name", "type": "varchar(160)" },
-          { "name": "description", "type": "text", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "code",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "name",
+            "type": "varchar(160)"
+          },
+          {
+            "name": "description",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
@@ -41,26 +96,78 @@
         "table": "administrative_measure",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "measure_type_id", "type": "uuid" },
-          { "name": "ait_id", "type": "uuid", "nullable": true },
-          { "name": "crash_record_id", "type": "uuid", "nullable": true },
-          { "name": "approach_id", "type": "uuid", "nullable": true },
-          { "name": "agent_id", "type": "uuid" },
-          { "name": "shift_id", "type": "uuid" },
-          { "name": "device_id", "type": "uuid" },
-          { "name": "started_at", "type": "timestamptz" },
-          { "name": "ended_at", "type": "timestamptz", "nullable": true },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "reason", "type": "text" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_type_id",
+            "type": "uuid"
+          },
+          {
+            "name": "ait_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "approach_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "agent_id",
+            "type": "uuid"
+          },
+          {
+            "name": "shift_id",
+            "type": "uuid"
+          },
+          {
+            "name": "device_id",
+            "type": "uuid"
+          },
+          {
+            "name": "started_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "ended_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "reason",
+            "type": "text"
+          },
           {
             "name": "current_status",
             "type": "varchar(60)",
             "default": "'RETIDO'"
           },
-          { "name": "notes", "type": "text", "nullable": true },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          },
           {
             "name": "location_geom",
             "type": "geometry(Point,4674)",
@@ -88,17 +195,26 @@
           {
             "name": "fk_inf_measure_type",
             "columns": ["measure_type_id"],
-            "references": { "table": "inf.measure_type", "columns": ["id"] }
+            "references": {
+              "table": "inf.measure_type",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_measure_ait",
             "columns": ["ait_id"],
-            "references": { "table": "inf.ait_ait", "columns": ["id"] }
+            "references": {
+              "table": "inf.ait_ait",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_measure_approach",
             "columns": ["approach_id"],
-            "references": { "table": "ops.ops_approach", "columns": ["id"] }
+            "references": {
+              "table": "ops.ops_approach",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -107,16 +223,50 @@
         "table": "administrative_term",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "term_type", "type": "varchar(80)" },
-          { "name": "term_number", "type": "varchar(80)" },
-          { "name": "content_hash", "type": "varchar(128)" },
-          { "name": "file_evidence_id", "type": "uuid", "nullable": true },
-          { "name": "issued_at", "type": "timestamptz" },
-          { "name": "signed_by_person_id", "type": "uuid", "nullable": true },
-          { "name": "signer_name", "type": "varchar(160)", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "term_type",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "term_number",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "content_hash",
+            "type": "varchar(128)"
+          },
+          {
+            "name": "file_evidence_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "issued_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "signed_by_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "signer_name",
+            "type": "varchar(160)",
+            "nullable": true
+          },
           {
             "name": "withdrawal_deadline_at",
             "type": "timestamptz",
@@ -127,7 +277,11 @@
             "type": "timestamptz",
             "nullable": true
           },
-          { "name": "field_details_json", "type": "jsonb", "nullable": true },
+          {
+            "name": "field_details_json",
+            "type": "jsonb",
+            "nullable": true
+          },
           {
             "name": "source_local_id",
             "type": "varchar(120)",
@@ -143,7 +297,11 @@
             "type": "varchar(128)",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(60)", "default": "'issued'" }
+          {
+            "name": "status",
+            "type": "varchar(60)",
+            "default": "'issued'"
+          }
         ],
         "indexes": [
           {
@@ -172,7 +330,10 @@
           {
             "name": "fk_inf_term_person",
             "columns": ["signed_by_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -181,11 +342,27 @@
         "table": "measure_retention",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "retention_reason", "type": "text" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "retention_reason",
+            "type": "text"
+          },
           {
             "name": "regularization_deadline_at",
             "type": "timestamptz",
@@ -196,9 +373,21 @@
             "type": "integer",
             "nullable": true
           },
-          { "name": "regularized_at", "type": "timestamptz", "nullable": true },
-          { "name": "released_at", "type": "timestamptz", "nullable": true },
-          { "name": "release_user_ref", "type": "uuid", "nullable": true }
+          {
+            "name": "regularized_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "released_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "release_user_ref",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -230,15 +419,48 @@
         "table": "measure_removal",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "tow_provider_id", "type": "uuid", "nullable": true },
-          { "name": "yard_id", "type": "uuid", "nullable": true },
-          { "name": "requested_at", "type": "timestamptz", "nullable": true },
-          { "name": "tow_arrived_at", "type": "timestamptz", "nullable": true },
-          { "name": "delivered_at", "type": "timestamptz", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "tow_provider_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "yard_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "requested_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "tow_arrived_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "delivered_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
           {
             "name": "regularization_deadline_at",
             "type": "timestamptz",
@@ -285,13 +507,37 @@
         "table": "vehicle_inventory",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "inventory_json", "type": "jsonb" },
-          { "name": "damage_description", "type": "text", "nullable": true },
-          { "name": "signed_by_person_id", "type": "uuid", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "inventory_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "damage_description",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "signed_by_person_id",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -313,7 +559,10 @@
           {
             "name": "fk_inf_inventory_person",
             "columns": ["signed_by_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -322,17 +571,38 @@
         "table": "tow_provider",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "name", "type": "varchar(255)" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "name",
+            "type": "varchar(255)"
+          },
           {
             "name": "document_number",
             "type": "varchar(20)",
             "nullable": true
           },
-          { "name": "contact_json", "type": "jsonb", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+          {
+            "name": "contact_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ]
       },
       {
@@ -340,13 +610,38 @@
         "table": "yard",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "name", "type": "varchar(255)" },
-          { "name": "address", "type": "text", "nullable": true },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "name",
+            "type": "varchar(255)"
+          },
+          {
+            "name": "address",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          },
           {
             "name": "location_geom",
             "type": "geometry(Point,4674)",
@@ -366,14 +661,43 @@
         "table": "measure_status_history",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "status", "type": "varchar(60)" },
-          { "name": "changed_at", "type": "timestamptz", "default": "now()" },
-          { "name": "user_ref", "type": "uuid", "nullable": true },
-          { "name": "reason", "type": "text", "nullable": true },
-          { "name": "details_json", "type": "jsonb", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "status",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "changed_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "user_ref",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "reason",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "details_json",
+            "type": "jsonb",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -391,7 +715,11 @@
   "api": {
     "basePath": "/v1/inf/measures/",
     "resources": [
-      { "entity": "MeasureType", "path": "types", "resource": "measure-type" },
+      {
+        "entity": "MeasureType",
+        "path": "types",
+        "resource": "measure-type"
+      },
       {
         "entity": "AdministrativeMeasure",
         "path": "administrative-measures",
@@ -422,7 +750,11 @@
         "path": "tow-providers",
         "resource": "tow-provider"
       },
-      { "entity": "Yard", "path": "yards", "resource": "yard" },
+      {
+        "entity": "Yard",
+        "path": "yards",
+        "resource": "yard"
+      },
       {
         "entity": "MeasureStatusHistory",
         "path": "status-history",
@@ -430,6 +762,10 @@
       }
     ]
   },
-  "auth": { "source": "TEAT_COMMAND_RULES" },
-  "audit": { "enabled": true }
+  "auth": {
+    "source": "TEAT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
 }
diff --git a/docs/framework/blueprints/BP-INF-SPEED-001.json b/docs/framework/blueprints/BP-INF-SPEED-001.json
index fcceb9f..56cef51 100644
--- a/docs/framework/blueprints/BP-INF-SPEED-001.json
+++ b/docs/framework/blueprints/BP-INF-SPEED-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Speed",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.1.0",
     "ddlFile": "37-inf-speed.sql",
     "dependencies": {
       "@detran/inf-ait": "workspace:*"
@@ -23,6 +23,16 @@
         "target": "../ait/src/index.ts"
       }
     ],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/speed-commands.controller",
+        "symbol": "SpeedCommandsController"
+      }
+    ],
+    "handwrittenExports": [
+      "handwritten/create-measurement.command",
+      "handwritten/speed-commands.controller"
+    ],
     "owners": ["detran-inf"],
     "description": "Medicao de velocidade por equipamento ACOPLADO ao talao eletronico (UC-TEAT-013). Escopo: inciso II do art. 3o §1o da Res. 918/2022. Fiscalizacao eletronica por equipamento fixo (inciso III, com referendo) esta FORA — ver inf/teat/APP.md secao Fronteira."
   },
diff --git a/package.json b/package.json
index a5d369e..e0bdd42 100644
--- a/package.json
+++ b/package.json
@@ -30,7 +30,7 @@
     "backend:db:reset": "bash backend/database/apply.sh --full",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
     "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/inf-ait test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",

```

## Anexo C — arquivos gerados/regenerados

```text
backend/app/src/app.module.ts
backend/database/ddl/32-inf-measures.sql
backend/database/ddl/33-inf-alcohol.sql
backend/database/ddl/37-inf-speed.sql
backend/domains/inf/alcohol/src/alcohol.module.ts
backend/domains/inf/alcohol/src/controllers/alcohol-forwarding.controller.ts
backend/domains/inf/alcohol/src/controllers/alcohol-procedure.controller.ts
backend/domains/inf/alcohol/src/controllers/alcohol-refusal.controller.ts
backend/domains/inf/alcohol/src/controllers/alcohol-test.controller.ts
backend/domains/inf/alcohol/src/controllers/breathalyzer.controller.ts
backend/domains/inf/alcohol/src/controllers/psychomotor-sign.controller.ts
backend/domains/inf/alcohol/src/dto/create-alcohol-forwarding.dto.ts
backend/domains/inf/alcohol/src/dto/create-alcohol-procedure.dto.ts
backend/domains/inf/alcohol/src/dto/create-alcohol-refusal.dto.ts
backend/domains/inf/alcohol/src/dto/create-alcohol-test.dto.ts
backend/domains/inf/alcohol/src/dto/create-breathalyzer.dto.ts
backend/domains/inf/alcohol/src/dto/create-psychomotor-sign.dto.ts
backend/domains/inf/alcohol/src/entities/alcohol-forwarding.entity.ts
backend/domains/inf/alcohol/src/entities/alcohol-procedure.entity.ts
backend/domains/inf/alcohol/src/entities/alcohol-refusal.entity.ts
backend/domains/inf/alcohol/src/entities/alcohol-test.entity.ts
backend/domains/inf/alcohol/src/entities/breathalyzer.entity.ts
backend/domains/inf/alcohol/src/entities/psychomotor-sign.entity.ts
backend/domains/inf/alcohol/src/index.ts
backend/domains/inf/alcohol/src/repositories/alcohol-forwarding.repository.ts
backend/domains/inf/alcohol/src/repositories/alcohol-procedure.repository.ts
backend/domains/inf/alcohol/src/repositories/alcohol-refusal.repository.ts
backend/domains/inf/alcohol/src/repositories/alcohol-test.repository.ts
backend/domains/inf/alcohol/src/repositories/breathalyzer.repository.ts
backend/domains/inf/alcohol/src/repositories/psychomotor-sign.repository.ts
backend/domains/inf/alcohol/src/services/alcohol-forwarding.service.ts
backend/domains/inf/alcohol/src/services/alcohol-procedure.service.ts
backend/domains/inf/alcohol/src/services/alcohol-refusal.service.ts
backend/domains/inf/alcohol/src/services/alcohol-test.service.ts
backend/domains/inf/alcohol/src/services/breathalyzer.service.ts
backend/domains/inf/alcohol/src/services/psychomotor-sign.service.ts
backend/domains/inf/alcohol/vitest.config.ts
backend/domains/inf/measures/src/controllers/administrative-measure.controller.ts
backend/domains/inf/measures/src/controllers/administrative-term.controller.ts
backend/domains/inf/measures/src/controllers/measure-removal.controller.ts
backend/domains/inf/measures/src/controllers/measure-retention.controller.ts
backend/domains/inf/measures/src/controllers/measure-status-history.controller.ts
backend/domains/inf/measures/src/controllers/measure-type.controller.ts
backend/domains/inf/measures/src/controllers/tow-provider.controller.ts
backend/domains/inf/measures/src/controllers/vehicle-inventory.controller.ts
backend/domains/inf/measures/src/controllers/yard.controller.ts
backend/domains/inf/measures/src/dto/create-administrative-measure.dto.ts
backend/domains/inf/measures/src/dto/create-administrative-term.dto.ts
backend/domains/inf/measures/src/dto/create-measure-removal.dto.ts
backend/domains/inf/measures/src/dto/create-measure-retention.dto.ts
backend/domains/inf/measures/src/dto/create-measure-status-history.dto.ts
backend/domains/inf/measures/src/dto/create-measure-type.dto.ts
backend/domains/inf/measures/src/dto/create-tow-provider.dto.ts
backend/domains/inf/measures/src/dto/create-vehicle-inventory.dto.ts
backend/domains/inf/measures/src/dto/create-yard.dto.ts
backend/domains/inf/measures/src/entities/administrative-measure.entity.ts
backend/domains/inf/measures/src/entities/administrative-term.entity.ts
backend/domains/inf/measures/src/entities/measure-removal.entity.ts
backend/domains/inf/measures/src/entities/measure-retention.entity.ts
backend/domains/inf/measures/src/entities/measure-status-history.entity.ts
backend/domains/inf/measures/src/entities/measure-type.entity.ts
backend/domains/inf/measures/src/entities/tow-provider.entity.ts
backend/domains/inf/measures/src/entities/vehicle-inventory.entity.ts
backend/domains/inf/measures/src/entities/yard.entity.ts
backend/domains/inf/measures/src/index.ts
backend/domains/inf/measures/src/measures.module.ts
backend/domains/inf/measures/src/repositories/administrative-measure.repository.ts
backend/domains/inf/measures/src/repositories/administrative-term.repository.ts
backend/domains/inf/measures/src/repositories/measure-removal.repository.ts
backend/domains/inf/measures/src/repositories/measure-retention.repository.ts
backend/domains/inf/measures/src/repositories/measure-status-history.repository.ts
backend/domains/inf/measures/src/repositories/measure-type.repository.ts
backend/domains/inf/measures/src/repositories/tow-provider.repository.ts
backend/domains/inf/measures/src/repositories/vehicle-inventory.repository.ts
backend/domains/inf/measures/src/repositories/yard.repository.ts
backend/domains/inf/measures/src/services/administrative-measure.service.ts
backend/domains/inf/measures/src/services/administrative-term.service.ts
backend/domains/inf/measures/src/services/measure-removal.service.ts
backend/domains/inf/measures/src/services/measure-retention.service.ts
backend/domains/inf/measures/src/services/measure-status-history.service.ts
backend/domains/inf/measures/src/services/measure-type.service.ts
backend/domains/inf/measures/src/services/tow-provider.service.ts
backend/domains/inf/measures/src/services/vehicle-inventory.service.ts
backend/domains/inf/measures/src/services/yard.service.ts
backend/domains/inf/measures/vitest.config.ts
backend/domains/inf/speed/src/controllers/speed-measurement.controller.ts
backend/domains/inf/speed/src/controllers/speed-meter-certificate.controller.ts
backend/domains/inf/speed/src/controllers/speed-meter.controller.ts
backend/domains/inf/speed/src/dto/create-speed-measurement.dto.ts
backend/domains/inf/speed/src/dto/create-speed-meter-certificate.dto.ts
backend/domains/inf/speed/src/dto/create-speed-meter.dto.ts
backend/domains/inf/speed/src/entities/speed-measurement.entity.ts
backend/domains/inf/speed/src/entities/speed-meter-certificate.entity.ts
backend/domains/inf/speed/src/entities/speed-meter.entity.ts
backend/domains/inf/speed/src/index.ts
backend/domains/inf/speed/src/repositories/speed-measurement.repository.ts
backend/domains/inf/speed/src/repositories/speed-meter-certificate.repository.ts
backend/domains/inf/speed/src/repositories/speed-meter.repository.ts
backend/domains/inf/speed/src/services/speed-measurement.service.ts
backend/domains/inf/speed/src/services/speed-meter-certificate.service.ts
backend/domains/inf/speed/src/services/speed-meter.service.ts
backend/domains/inf/speed/src/speed.module.ts
docs/framework/contracts/BP-INF-SPEED-001.openapi.json
pnpm-lock.yaml

```

## Anexo — `work/rounds/R-0008/reports/TASK-0008.md`

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0008
Arquivos criados/alterados: seed 28-fixtures-teat-measures-alcohol.sql; policy.spec.ts (bloco CTG-0004); inf/measures/src/handwritten/_.command.spec.ts (8) + deadlines.spec.ts + tests/integration (harness, measure-commands); inf/alcohol/src/handwritten/_.command.spec.ts (6) + tests/integration (harness, alcohol-commands); inf/speed/src/handwritten/create-measurement.command.spec.ts; backend/app/tests/e2e/{teat-measures-alcohol,teat-stream,policy-routes}.e2e.spec.ts.
Comandos executados e saída resumida: seed idempotente OK; parameter-catalogue OK; decorators 858; typecheck limpo; shared 152/155 (3 chaves novas); measures unit 7/132, alcohol 5/123, speed 0/5 (módulos ausentes); integration measures 1/4, alcohol 1/3; app e2e 78 pré-existentes verdes; novos 20 falhas (policy-routes: 66 rotas sem chave, ~29 chaves sem rota).
Critérios de aceitação: todos PASS (falhas só por comportamento ausente).
Fora do escopo / deixado: C-0004-42 adaptado (todos os papéis com ops:stream:read já leem AIT → usa integration.item.changed/ops:integration:read); policy-routes com segunda instância do app com a flag de velocidade ligada; harness com repositories {} (SQL cru na tx compartilhada); procedure_type/forwarding_type sem vocabulário canônico (comentário SQL).
OD tocadas ou propostas: OD-T17, T21, T27, T36…T44 tocadas; nenhuma nova.
Bloqueios: nenhum.
Tokens do subagente: 633.460 brutos (246 chamadas, 61 min).

## Iteração 2

OD-T60 (C-0001-07), OD-T61 (fixtures distintas em conclude/release, restauração no afterAll), OD-T62 (só status 403), OD-T63 (outbox por aggregate.id). shared 185/185; alcohol integration 3/3; app e2e 98/98 após reseed. Tokens: 689.460 brutos (29 chamadas, 10 min).
```

## Anexo — `work/rounds/R-0008/reports/TASK-0009.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0009 (iteração 1)
Arquivos criados/alterados: inf/measures/src/handwritten/* (runtime, deadlines, term-content, events, 8 comandos, provider, index) + measure-commands.controller reescrito (+ MeasureRetentionCommandsController); inf/alcohol/src/handwritten/* (runtime, metrological-table, classification, events, 6 comandos, provider, index) + alcohol-commands.controller reescrito; inf/speed/src/handwritten/{create-measurement.command,speed-commands.controller}.ts; backend/app/src/{teat-stream.controller,teat-stream.service,teat-integrations.controller,teat-integrations.service}.ts + app.module; policy.ts (ops:stream:read, ops:integration:read|retry, 66 pares de superfície ops/*); blueprints (bloco module) + gerados; package.json (integration de measures/alcohol).
Comandos executados e saída resumida: measures unit 132/132; alcohol unit 123/123; speed unit 5/5; shared 184/184; measures integration 4/4; alcohol integration 2/3 (C-0004-34 asserção ampla); app e2e 95/98 (policy-routes: inf:ait-cancel-request:update|delete sem rota; C-0004-37 fixture compartilhada + código nomeado no 403); blueprints/contracts/decorators(863)/boundary/parameter-catalogue/format ok; pnpm check verde; backend:test:ci falha em alcohol integration.
Critérios de aceitação: PASS exceto alcohol integration (1), app e2e (3) e backend:test:ci (propagação).
Fora do escopo / deixado: @detran/inf-deadlines não linkado → fórmulas replicadas localmente (viola M14 "nunca calcular prazo fora do motor" — a corrigir na iteração 2 após pnpm install); teat.monitored_custody lido por process.env; tabela metrológica por SQL direto; lifecycle services antigos intocados; higiene de dados em detran_r8 (UPDATE/DELETE de fixtures consumidas).
OD tocadas ou propostas: OD-T17, T38 tocadas; propostas OD-T60 (ait-cancel-request update|delete sem rota × C-0001-07), OD-T61 (fixture compartilhada C-0004-36/37), OD-T62 (guard sem código nomeado), OD-T63 (asserção de outbox ampla em C-0004-34).
Bloqueios: as 3 contradições acima (testes/guard) + deps não linkadas.
Tokens do subagente: 882.938 brutos (533 chamadas, 90 min).

## Iteração 2 (adenda §15)

`deadlines.ts` sobre `@detran/inf-deadlines` real (réplica removida); tabela metrológica via `NormativeMetrologicalTableRepository`; flag por porta `MEASURE_FEATURE_FLAGS` provida pelo app; `inf:ait-cancel-request:update|delete` removidas; 65 grants `ops:*` sem fonte revertidos a `technical-admin` (só `numbering-range:update` sourceado); alias `@detran/inf-deadlines` no vitest do app. unit 132/123/5; integration 4/3; shared 185; app e2e 95/98 (3 casos por resíduo de banco — reseed pelo maestro antes dos gates). Tokens: 109.456 reportados (96 chamadas, 22 min).
```
