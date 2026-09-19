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

## Nota do maestro — delivery-review CTG-0002 (ciclo 1, exaustivo)

Grupo CTG-0002 = TASK-0001 (contrato `work/rounds/R-0008/contracts/CTG-0002.md`, com adendas §12/§13 do maestro), TASK-0004 (Inspector, 2 iterações), TASK-0005 (Engineer, 2 iterações). Relatórios: `work/rounds/R-0008/reports/TASK-0004.md`, `TASK-0005.md`; triagens em `plan.md` §Triagem. Entrega: protocolo de sincronização (`ops/offline-sync/src/handwritten`: lote, item, recibos, conflitos, integridade, concorrência por parâmetro `sync.concurrency_window_minutes`, numeração reserve/cancel/block/close/reconcile/consumption), applier `ait` (`inf/ait/src/handwritten/sync-applier.ts`), bootstrap/turno/handoff/dispositivo/homologação (`ops/field/src/handwritten`), portas em `ops/core`, wiring `backend/app/src/teat-sync.providers.ts`, regras `policy.ts` §8, seed `26-fixtures-teat-field.sql`, prefixo `v1/` nos controladores manuscritos de `ops` (evidence/snapshots só a string do `@Controller`, antecipado de TASK-0007). Deltas de blueprint pelo maestro (Architect): `operations` list/get para POSTs que são comandos (`SyncBatch`, `SyncReceipt` list, `EvidenceAccessRequest`, `ExternalQuery`), `testAliases`, dependências `zod`/`@detran/ops-parameter`/`@detran/inf-normative`; gerados regenerados; `pnpm-lock.yaml` por `pnpm install`. Gates (Engineer iteração 2): shared 131/131; ops-offline-sync unit 19, integration 36; ops-field unit 19, integration 13; inf-ait integration 24; app e2e 53/53; `backend:test:ci`, `pnpm check`, `verify:decorators` (850), `blueprints:check`, `contracts:check` verdes. Anexos: A stat; B diff dos manuscritos/testes/política/app/seed/blueprints (blocos); C lista de gerados; relatórios.

## Anexo A — `git diff --stat`

```text
 .../assessment.json                                |    15 +
 .../backlog.json                                   |    13 +
 .../inventory.json                                 | 18162 +++++++++++++++++++
 .../scorecard.json                                 |   302 +
 .../status.json                                    |    10 +
 backend/app/package.json                           |     3 +-
 backend/app/src/app.module.ts                      |     4 +
 backend/app/src/teat-sync.providers.ts             |    73 +
 backend/app/tests/e2e/teat-field-sync.e2e.spec.ts  |   502 +
 backend/database/ddl/13-ops-field-operations.sql   |     2 +-
 backend/database/ddl/16-ops-snapshots.sql          |     2 +-
 backend/database/ddl/17-ops-evidence.sql           |     2 +-
 backend/database/ddl/18-ops-offline-sync.sql       |     2 +-
 backend/database/ddl/31-inf-ait.sql                |     2 +-
 backend/database/seed/26-fixtures-teat-field.sql   |   119 +
 backend/domains/inf/ait/src/ait.module.ts          |     4 +-
 .../ait-cancel-request-event.controller.ts         |     2 +-
 .../controllers/ait-cancel-request.controller.ts   |     2 +-
 .../src/controllers/ait-correction.controller.ts   |     2 +-
 .../ait/src/controllers/ait-person.controller.ts   |     2 +-
 .../src/controllers/ait-print-event.controller.ts  |     2 +-
 .../src/controllers/ait-signature.controller.ts    |     2 +-
 .../controllers/ait-status-history.controller.ts   |     2 +-
 .../ait/src/controllers/ait-vehicle.controller.ts  |     2 +-
 .../inf/ait/src/controllers/ait.controller.ts      |     2 +-
 .../src/dto/create-ait-cancel-request-event.dto.ts |     2 +-
 .../ait/src/dto/create-ait-cancel-request.dto.ts   |     2 +-
 .../inf/ait/src/dto/create-ait-correction.dto.ts   |     2 +-
 .../inf/ait/src/dto/create-ait-person.dto.ts       |     2 +-
 .../inf/ait/src/dto/create-ait-print-event.dto.ts  |     2 +-
 .../inf/ait/src/dto/create-ait-signature.dto.ts    |     2 +-
 .../ait/src/dto/create-ait-status-history.dto.ts   |     2 +-
 .../inf/ait/src/dto/create-ait-vehicle.dto.ts      |     2 +-
 backend/domains/inf/ait/src/dto/create-ait.dto.ts  |     2 +-
 .../entities/ait-cancel-request-event.entity.ts    |     2 +-
 .../ait/src/entities/ait-cancel-request.entity.ts  |     2 +-
 .../inf/ait/src/entities/ait-correction.entity.ts  |     2 +-
 .../inf/ait/src/entities/ait-person.entity.ts      |     2 +-
 .../inf/ait/src/entities/ait-print-event.entity.ts |     2 +-
 .../inf/ait/src/entities/ait-signature.entity.ts   |     2 +-
 .../ait/src/entities/ait-status-history.entity.ts  |     2 +-
 .../inf/ait/src/entities/ait-vehicle.entity.ts     |     2 +-
 backend/domains/inf/ait/src/entities/ait.entity.ts |     2 +-
 backend/domains/inf/ait/src/handwritten/index.ts   |     2 +
 .../ait/src/handwritten/sync-applier.provider.ts   |    22 +
 .../inf/ait/src/handwritten/sync-applier.ts        |   441 +
 backend/domains/inf/ait/src/index.ts               |     2 +-
 .../ait-cancel-request-event.repository.ts         |     2 +-
 .../repositories/ait-cancel-request.repository.ts  |     2 +-
 .../src/repositories/ait-correction.repository.ts  |     2 +-
 .../ait/src/repositories/ait-person.repository.ts  |     2 +-
 .../src/repositories/ait-print-event.repository.ts |     2 +-
 .../src/repositories/ait-signature.repository.ts   |     2 +-
 .../repositories/ait-status-history.repository.ts  |     2 +-
 .../ait/src/repositories/ait-vehicle.repository.ts |     2 +-
 .../inf/ait/src/repositories/ait.repository.ts     |     2 +-
 .../services/ait-cancel-request-event.service.ts   |     2 +-
 .../ait/src/services/ait-cancel-request.service.ts |     2 +-
 .../inf/ait/src/services/ait-correction.service.ts |     2 +-
 .../inf/ait/src/services/ait-person.service.ts     |     2 +-
 .../ait/src/services/ait-print-event.service.ts    |     2 +-
 .../inf/ait/src/services/ait-signature.service.ts  |     2 +-
 .../ait/src/services/ait-status-history.service.ts |     2 +-
 .../inf/ait/src/services/ait-vehicle.service.ts    |     2 +-
 .../domains/inf/ait/src/services/ait.service.ts    |     2 +-
 .../ait-sync-applier.integration.spec.ts           |   683 +
 backend/domains/ops/core/src/applied-entity.ts     |    14 +
 backend/domains/ops/core/src/index.ts              |    32 +-
 backend/domains/ops/core/src/runtime.ts            |   146 +
 backend/domains/ops/core/src/storage.ts            |    24 +
 backend/domains/ops/core/src/sync-applier.ts       |    48 +
 .../src/handwritten/evidence-custody.controller.ts |     2 +-
 backend/domains/ops/field/package.json             |     2 +
 .../src/controllers/agent-profile.controller.ts    |     2 +-
 .../controllers/application-version.controller.ts  |     2 +-
 .../field/src/controllers/approach.controller.ts   |     2 +-
 .../src/controllers/device-event.controller.ts     |     2 +-
 .../src/controllers/homologation.controller.ts     |     2 +-
 .../measurement-instrument.controller.ts           |     2 +-
 .../field/src/controllers/operation.controller.ts  |     2 +-
 .../controllers/operational-device.controller.ts   |     2 +-
 .../src/controllers/patrol-vehicle.controller.ts   |     2 +-
 .../src/controllers/session-handoff.controller.ts  |     2 +-
 .../ops/field/src/controllers/shift.controller.ts  |     2 +-
 .../field/src/controllers/team-agent.controller.ts |     2 +-
 .../ops/field/src/controllers/team.controller.ts   |     2 +-
 .../ops/field/src/dto/create-agent-profile.dto.ts  |     2 +-
 .../src/dto/create-application-version.dto.ts      |     2 +-
 .../ops/field/src/dto/create-approach.dto.ts       |     2 +-
 .../ops/field/src/dto/create-device-event.dto.ts   |     2 +-
 .../ops/field/src/dto/create-homologation.dto.ts   |     2 +-
 .../src/dto/create-measurement-instrument.dto.ts   |     2 +-
 .../ops/field/src/dto/create-operation.dto.ts      |     2 +-
 .../field/src/dto/create-operational-device.dto.ts |     2 +-
 .../ops/field/src/dto/create-patrol-vehicle.dto.ts |     2 +-
 .../field/src/dto/create-session-handoff.dto.ts    |     2 +-
 .../domains/ops/field/src/dto/create-shift.dto.ts  |     2 +-
 .../ops/field/src/dto/create-team-agent.dto.ts     |     2 +-
 .../domains/ops/field/src/dto/create-team.dto.ts   |     2 +-
 .../ops/field/src/entities/agent-profile.entity.ts |     2 +-
 .../src/entities/application-version.entity.ts     |     2 +-
 .../ops/field/src/entities/approach.entity.ts      |     2 +-
 .../ops/field/src/entities/device-event.entity.ts  |     2 +-
 .../ops/field/src/entities/homologation.entity.ts  |     2 +-
 .../src/entities/measurement-instrument.entity.ts  |     2 +-
 .../ops/field/src/entities/operation.entity.ts     |     2 +-
 .../src/entities/operational-device.entity.ts      |     2 +-
 .../field/src/entities/patrol-vehicle.entity.ts    |     2 +-
 .../field/src/entities/session-handoff.entity.ts   |     2 +-
 .../domains/ops/field/src/entities/shift.entity.ts |     2 +-
 .../ops/field/src/entities/team-agent.entity.ts    |     2 +-
 .../domains/ops/field/src/entities/team.entity.ts  |     2 +-
 backend/domains/ops/field/src/field.module.ts      |    10 +-
 .../src/handwritten/cancel-homologation.command.ts |    62 +
 .../field/src/handwritten/close-shift.command.ts   |   266 +
 .../src/handwritten/device-posture.command.ts      |   124 +
 .../domains/ops/field/src/handwritten/events.ts    |   184 +
 .../src/handwritten/field-commands.controller.ts   |    71 +
 .../ops/field/src/handwritten/field-commands.ts    |    31 +
 .../src/handwritten/field-operations.controller.ts |     5 +-
 .../ops/field/src/handwritten/field-runtime.ts     |   123 +
 .../src/handwritten/handoff-session.command.ts     |   151 +
 .../src/handwritten/mobile-bootstrap.controller.ts |    54 +
 .../src/handwritten/mobile-bootstrap.provider.ts   |   100 +
 .../src/handwritten/mobile-bootstrap.service.ts    |   440 +
 .../field/src/handwritten/open-shift.command.ts    |   147 +
 .../src/handwritten/renew-homologation.command.ts  |   107 +
 .../ops/field/src/handwritten/shift-readiness.ts   |   140 +
 backend/domains/ops/field/src/index.ts             |    16 +-
 .../src/repositories/agent-profile.repository.ts   |     2 +-
 .../repositories/application-version.repository.ts |     2 +-
 .../field/src/repositories/approach.repository.ts  |     2 +-
 .../src/repositories/device-event.repository.ts    |     2 +-
 .../src/repositories/homologation.repository.ts    |     2 +-
 .../measurement-instrument.repository.ts           |     2 +-
 .../field/src/repositories/operation.repository.ts |     2 +-
 .../repositories/operational-device.repository.ts  |     2 +-
 .../src/repositories/patrol-vehicle.repository.ts  |     2 +-
 .../src/repositories/session-handoff.repository.ts |     2 +-
 .../ops/field/src/repositories/shift.repository.ts |     2 +-
 .../src/repositories/team-agent.repository.ts      |     2 +-
 .../ops/field/src/repositories/team.repository.ts  |     2 +-
 .../field/src/services/agent-profile.service.ts    |     2 +-
 .../src/services/application-version.service.ts    |     2 +-
 .../ops/field/src/services/approach.service.ts     |     2 +-
 .../ops/field/src/services/device-event.service.ts |     2 +-
 .../ops/field/src/services/homologation.service.ts |     2 +-
 .../src/services/measurement-instrument.service.ts |     2 +-
 .../ops/field/src/services/operation.service.ts    |     2 +-
 .../src/services/operational-device.service.ts     |     2 +-
 .../field/src/services/patrol-vehicle.service.ts   |     2 +-
 .../field/src/services/session-handoff.service.ts  |     2 +-
 .../ops/field/src/services/shift.service.ts        |     2 +-
 .../ops/field/src/services/team-agent.service.ts   |     2 +-
 .../domains/ops/field/src/services/team.service.ts |     2 +-
 backend/domains/ops/field/vitest.config.ts         |     3 +
 backend/domains/ops/offline-sync/package.json      |     1 +
 .../controllers/ait-numbering-range.controller.ts  |     2 +-
 .../numbering-consumption.controller.ts            |     2 +-
 .../numbering-reservation.controller.ts            |     2 +-
 .../src/controllers/sync-batch.controller.ts       |     2 +-
 .../src/controllers/sync-conflict.controller.ts    |     2 +-
 .../src/controllers/sync-queue-item.controller.ts  |     2 +-
 .../src/controllers/sync-receipt.controller.ts     |    23 +-
 .../src/dto/create-ait-numbering-range.dto.ts      |     2 +-
 .../src/dto/create-numbering-consumption.dto.ts    |     2 +-
 .../src/dto/create-numbering-reservation.dto.ts    |     2 +-
 .../offline-sync/src/dto/create-sync-batch.dto.ts  |     2 +-
 .../src/dto/create-sync-conflict.dto.ts            |     2 +-
 .../src/dto/create-sync-queue-item.dto.ts          |     2 +-
 .../src/dto/create-sync-receipt.dto.ts             |     2 +-
 .../src/entities/ait-numbering-range.entity.ts     |     2 +-
 .../src/entities/numbering-consumption.entity.ts   |     2 +-
 .../src/entities/numbering-reservation.entity.ts   |     2 +-
 .../offline-sync/src/entities/sync-batch.entity.ts |     2 +-
 .../src/entities/sync-conflict.entity.ts           |     2 +-
 .../src/entities/sync-queue-item.entity.ts         |     2 +-
 .../src/entities/sync-receipt.entity.ts            |     2 +-
 .../offline-sync/src/handwritten/batch-protocol.ts |   164 +
 .../offline-sync/src/handwritten/canonical-hash.ts |    21 +
 .../src/handwritten/concurrency-detector.ts        |   102 +
 .../ops/offline-sync/src/handwritten/events.ts     |   324 +
 .../offline-sync/src/handwritten/numbering-sql.ts  |    34 +
 .../src/handwritten/offline-sync.commands.ts       |    42 +
 .../src/handwritten/offline-sync.controller.ts     |   148 +
 .../src/handwritten/offline-sync.provider.ts       |    85 +
 .../src/handwritten/offline-sync.reads.ts          |   106 +
 .../src/handwritten/reconcile-numbering.command.ts |   218 +
 .../src/handwritten/reserve-numbering.command.ts   |   252 +
 .../src/handwritten/resolve-conflict.command.ts    |   154 +
 .../src/handwritten/settle-numbering.command.ts    |   224 +
 .../src/handwritten/submit-batch.command.ts        |   884 +
 backend/domains/ops/offline-sync/src/index.ts      |    16 +-
 .../ops/offline-sync/src/offline-sync.module.ts    |     8 +-
 .../repositories/ait-numbering-range.repository.ts |     2 +-
 .../numbering-consumption.repository.ts            |     2 +-
 .../numbering-reservation.repository.ts            |     2 +-
 .../src/repositories/sync-batch.repository.ts      |     2 +-
 .../src/repositories/sync-conflict.repository.ts   |     2 +-
 .../src/repositories/sync-queue-item.repository.ts |     2 +-
 .../src/repositories/sync-receipt.repository.ts    |     2 +-
 .../src/services/ait-numbering-range.service.ts    |     2 +-
 .../src/services/numbering-consumption.service.ts  |     2 +-
 .../src/services/numbering-reservation.service.ts  |     2 +-
 .../src/services/sync-batch.service.ts             |     2 +-
 .../src/services/sync-conflict.service.ts          |     2 +-
 .../src/services/sync-queue-item.service.ts        |     2 +-
 .../src/services/sync-receipt.service.ts           |     2 +-
 .../integration/sync-batch.integration.spec.ts     |    84 +-
 .../src/handwritten/frozen-snapshot.controller.ts  |     2 +-
 backend/domains/shared/src/policy.spec.ts          |   262 +
 backend/domains/shared/src/policy.ts               |    83 +
 docs/framework/blueprints/BP-INF-AIT-001.json      |     4 +
 docs/framework/blueprints/BP-OPS-FIELD-001.json    |    44 +-
 .../blueprints/BP-OPS-OFFLINE-SYNC-001.json        |    44 +-
 .../contracts/BP-OPS-FIELD-001.openapi.json        |     2 +-
 .../contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json |   106 +-
 package.json                                       |     6 +-
 pnpm-lock.yaml                                     |    12 +
 work/rounds/R-0008/budget.json                     |    12 +-
 work/rounds/R-0008/plan.md                         |     5 +
 221 files changed, 26118 insertions(+), 311 deletions(-)

```

## Anexo B — diff

```diff
diff --git a/backend/app/package.json b/backend/app/package.json
index d4a395e..f089290 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -45,12 +45,13 @@
     "@detran/inf-rait-worklist": "workspace:*",
     "@detran/inf-speed": "workspace:*",
     "@detran/ops-agency": "workspace:*",
+    "@detran/ops-core": "workspace:*",
     "@detran/ops-evidence": "workspace:*",
     "@detran/ops-field": "workspace:*",
     "@detran/ops-offline-sync": "workspace:*",
+    "@detran/ops-parameter": "workspace:*",
     "@detran/ops-snapshots": "workspace:*",
     "@detran/portal-complaints": "workspace:*",
-    "@detran/ops-parameter": "workspace:*",
     "@detran/sefaz-adapter": "workspace:*",
     "@detran/senatran-adapter": "workspace:*",
     "@detran/shared": "workspace:*",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 4eccceb..cb742d2 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -96,6 +96,7 @@ import {
   detranFeatureFlagSet,
   isLocalRuntimeProfile,
 } from './detran-runtime.js';
+import { TeatSyncModule } from './teat-sync.providers.js';
 import {
   DetranSessionReadinessBinder,
   DetranSessionStrongFactorGuard,
@@ -348,6 +349,9 @@ export class AppModule {
         ComplaintsModule,
         // Infractions scope (TEAT/RAIT): generated CRUD modules plus the
         // handwritten AIT lifecycle commands (WP-T0).
+        // Portas do protocolo de sincronização (CTG-0002 §4.8) antes dos
+        // módulos que as consomem.
+        TeatSyncModule,
         NormativeModule,
         ParameterModule,
         AitModule,
diff --git a/backend/app/src/teat-sync.providers.ts b/backend/app/src/teat-sync.providers.ts
new file mode 100644
index 0000000..68c9094
--- /dev/null
+++ b/backend/app/src/teat-sync.providers.ts
@@ -0,0 +1,73 @@
+// CTG-0002 §4.8 e §11 (R-0008, TASK-0005) — composição das portas do protocolo
+// de sincronização no app.
+//
+// `SYNC_ENTITY_APPLIERS` carrega os destinos montados nesta rodada: só o
+// applier `ait` (M7). Os demais tipos suportados (medida administrativa, termo
+// de sinais de álcool, pedidos de cancelamento e `crash-record`) ficam **sem**
+// destino e, por isso, recebem `TEAT.SYNC_DESTINATION_NOT_WIRED` — o item
+// permanece `received` e nada de domínio é tocado (M5).
+//
+// O módulo é `@Global()` porque quem consome as portas é `OfflineSyncModule`,
+// que não importa o app; sem isso a lista não chegaria ao protocolo.
+import { Global, Module } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  APPLIED_ENTITY_PORTS,
+  SYNC_ENTITY_APPLIERS,
+  asQueryable,
+  systemOpsClock,
+  type AppliedEntityPort,
+  type SyncEntityApplier,
+} from '@detran/ops-core';
+import { AitSyncApplier } from '@detran/inf-ait';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+/** Porta "a entidade já foi aplicada?" do AIT, consumida por CTG-0003. */
+export class AitAppliedEntityPort implements AppliedEntityPort {
+  readonly entityType = 'ait';
+
+  async isApplied(entityId: string, tx: Transaction): Promise<boolean> {
+    const queryable = asQueryable(tx);
+    if (!queryable) return false;
+    const result = await queryable.query<{ id: string }>(
+      `select id from inf.ait_ait
+        where id = $1 and current_status not in ('RASCUNHO_OFFLINE', 'CANCELADO_RASCUNHO')
+        limit 1`,
+      [entityId],
+    );
+    return result.rows.length > 0;
+  }
+}
+
+export const TEAT_SYNC_APPLIERS_PROVIDER = {
+  provide: SYNC_ENTITY_APPLIERS,
+  inject: [Database, RequestContext],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+  ): readonly SyncEntityApplier[] => [
+    new AitSyncApplier({
+      database,
+      requestContext,
+      outbox: new SqlTeatEventOutbox(),
+      clock: systemOpsClock,
+    }),
+  ],
+};
+
+export const TEAT_APPLIED_ENTITY_PORTS_PROVIDER = {
+  provide: APPLIED_ENTITY_PORTS,
+  useFactory: (): readonly AppliedEntityPort[] => [new AitAppliedEntityPort()],
+};
+
+@Global()
+@Module({
+  providers: [
+    TEAT_SYNC_APPLIERS_PROVIDER,
+    TEAT_APPLIED_ENTITY_PORTS_PROVIDER,
+    AitAppliedEntityPort,
+  ],
+  exports: [SYNC_ENTITY_APPLIERS, APPLIED_ENTITY_PORTS, AitAppliedEntityPort],
+})
+export class TeatSyncModule {}
diff --git a/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts b/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts
new file mode 100644
index 0000000..21953f0
--- /dev/null
+++ b/backend/app/tests/e2e/teat-field-sync.e2e.spec.ts
@@ -0,0 +1,502 @@
+import { createHash, randomUUID } from 'node:crypto';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0002 §1, §5 e §10 (R-0008, TASK-0004) — C-0002-43…50: as rotas de campo e
+ * sincronização sob o app unificado, com a guarda de política nos dois sentidos
+ * (papel mínimo → 200/201, papel fora da regra → 403) e a fronteira de rota
+ * `v1/ops/…` da §1.
+ *
+ * Nenhuma dessas rotas existe hoje: elas nascem em TASK-0005 (§11), e o prefixo
+ * `v1/` dos controladores manuscritos de `ops` é corrigido em TASK-0005
+ * (`ops/field`) e TASK-0007 (`ops/evidence`, `ops/snapshots`). Até lá cada caso
+ * falha pelo comportamento ausente — 404 onde se espera 200/403.
+ *
+ * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
+ * carregamento do módulo (`detran-runtime.ts`), então as duas variáveis são
+ * definidas **antes** do `await import('../../src/app.module.js')`, e removidas
+ * no `afterAll` para não vazarem para os outros arquivos e2e (o pool roda todos
+ * no mesmo processo, `fileParallelism: false`).
+ */
+
+const { Client } = pg;
+
+/** Tenant e persona canônicos das fixtures (00/25/26-fixtures-*.sql). */
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const OTHER_TENANT_ID = '00000000-0000-7000-8000-00000000a002';
+const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
+const DEVICE_AUTHORIZED = '00000000-0000-7000-8000-0000e4000002';
+const DEVICE_TAMPERED = '00000000-0000-7000-8000-0000e4000004';
+const SHIFT_OPEN = '00000000-0000-7000-8000-0000e3000001';
+const RESERVATION_RESERVED = '00000000-0000-7000-8000-0000e6000001';
+const HOMOLOGATION_ACTIVE = '00000000-0000-7000-8000-0000e2200001';
+const HOMOLOGATION_EXPIRED_REPORT = '00000000-0000-7000-8000-0000e2200002';
+const CONFLICT_CONCURRENCY = '00000000-0000-7000-8000-0000eb100001';
+const APP_VERSION = '1.0.0';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let startedAt: string;
+const previousEnv: Record<string, string | undefined> = {};
+
+function stableJson(value: unknown): string {
+  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
+  if (value && typeof value === 'object') {
+    const entries = Object.entries(value as Record<string, unknown>)
+      .filter(([, item]) => item !== undefined)
+      .sort(([left], [right]) => left.localeCompare(right))
+      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
+    return `{${entries.join(',')}}`;
+  }
+  return JSON.stringify(value) ?? 'null';
+}
+
+function canonicalHash(payload: unknown): string {
+  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
+}
+
+/**
+ * O kernel aplica `@Idempotent()` a toda ação não-leitura: corpo divergente sob
+ * a mesma `Idempotency-Key` devolve 422 (CTG-0001 §13 item 6). Cada requisição
+ * leva uma chave nova, salvo quando o teste é justamente de replay.
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
+const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };
+
+function syncBatchBody(): Record<string, unknown> {
+  return {
+    traffic_agency_id: AGENCY_ID,
+    device_id: DEVICE_AUTHORIZED,
+    agent_id: ACTOR_ID,
+    device_batch_id: `e2e-${randomUUID().slice(0, 8)}`,
+    items: [
+      {
+        // `crash-record` é reconhecido como suportado e não tem destino nesta
+        // rodada (§4.3): o lote responde 200 e nada de domínio é tocado.
+        entity_type: 'crash-record',
+        local_entity_id: randomUUID(),
+        idempotency_key: `e2e-item-${randomUUID().slice(0, 8)}`,
+        created_locally_at: '2026-09-14T13:05:00.000Z',
+        payload_json: crashRecordPayload,
+        payload_hash: canonicalHash(crashRecordPayload),
+      },
+    ],
+  };
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
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
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
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  // Remove o que os comandos criarem e devolve as fixtures de 26-fixtures-teat-field.sql
+  // ao estado semeado, para que o arquivo rode isolado e em qualquer ordem.
+  for (const table of [
+    'integration.outbox',
+    'ops.numbering_consumption',
+    'ops.ops_device_event',
+    'ops.ops_session_handoff',
+  ]) {
+    await client.query(
+      `delete from ${table} where tenant_id = $1 and created_at > $2`,
+      [TENANT_ID, startedAt],
+    );
+  }
+  await client.query(
+    `delete from ops.sync_conflict where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_receipt where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_queue_item where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.sync_batch where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `delete from ops.numbering_reservation where tenant_id = $1 and created_at > $2`,
+    [TENANT_ID, startedAt],
+  );
+  await client.query(
+    `update ops.ops_operational_device set status = 'authorized' where id = $1`,
+    [DEVICE_TAMPERED],
+  );
+  await client.query(
+    `update ops.numbering_reservation set status = 'reserved' where id = $1`,
+    [RESERVATION_RESERVED],
+  );
+  await client.query(
+    `update ops.ops_shift set device_id = $2, status = 'open', ended_at = null where id = $1`,
+    [SHIFT_OPEN, DEVICE_AUTHORIZED],
+  );
+  await client.query(
+    `update ops.ops_homologation
+        set laudo_emitido_em = '2021-12-01', laudo_valido_ate = '2025-12-31',
+            status = 'active'
+      where id = $1`,
+    [HOMOLOGATION_EXPIRED_REPORT],
+  );
+  await client.query(
+    `update ops.ops_homologation
+        set status = 'active', cancelled_reason = null
+      where id = $1`,
+    [HOMOLOGATION_ACTIVE],
+  );
+  await client.query(
+    `update ops.sync_conflict
+        set status = 'open', resolution_action = null,
+            resolution_details_json = null, resolved_at = null,
+            resolved_by_user_ref = null
+      where id = $1`,
+    [CONFLICT_CONCURRENCY],
+  );
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0002 §5.1/§5.13 — política de leitura e submissão (C-0002-43/44)', () => {
+  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/mobile-bootstrap então 200', async () => {
+    const response = await request(server())
+      .get('/v1/ops/mobile-bootstrap')
+      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      protocolVersion: 'teat-mobile-bootstrap.v1',
+    });
+  });
+
+  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=agency-admin quando GET /v1/ops/mobile-bootstrap então 403', async () => {
+    const response = await request(server())
+      .get('/v1/ops/mobile-bootstrap')
+      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
+      .set(headers('agency-admin'));
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/offline-sync/sync-batches então 200 com receipts e warnings', async () => {
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-agent'))
+      .send(syncBatchBody());
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      receipts: expect.any(Array),
+      warnings: expect.any(Array),
+    });
+    expect(response.body.receipts[0]).toMatchObject({
+      status: 'received',
+      error_code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
+    });
+  });
+
+  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/offline-sync/sync-batches então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/offline-sync/sync-batches')
+      .set(headers('field-supervisor'))
+      .send(syncBatchBody());
+    expect(response.status).toBe(403);
+  });
+
+  it('§5.13 — dado GET receipts/{tenantId} de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
+    const response = await request(server())
+      .get(`/v1/ops/offline-sync/receipts/${OTHER_TENANT_ID}`)
+      .set(headers('field-agent'));
+    expect(response.status).toBe(404);
+    expect(response.body.code).toBe('TEAT.TENANT_MISMATCH');
+  });
+
+  it('§5.13 — dado by-idempotency com uma chave inexistente então 404 TEAT.SYNC_RECEIPT_NOT_FOUND', async () => {
+    const response = await request(server())
+      .get(
+        `/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-inexistente`,
+      )
+      .set(headers('field-agent'));
+    expect(response.status).toBe(404);
+    expect(response.body.code).toBe('TEAT.SYNC_RECEIPT_NOT_FOUND');
+  });
+
+  it('§5.13 — dado by-idempotency com a chave item-001 das fixtures então 200 com o recibo applied (recuperação de ACK perdido)', async () => {
+    const response = await request(server())
+      .get(`/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-001`)
+      .set(headers('field-agent'));
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      idempotency_key: 'item-001',
+      status: 'applied',
+    });
+  });
+});
+
+describe('CTG-0002 §5.13 — resolução de conflito (C-0002-45/46)', () => {
+  it('C-0002-45 — dado DETRAN_LOCAL_ROLES=field-supervisor quando resolve com manual_review então 200 e o conflito continua open', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-supervisor'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'manual_review',
+        description: 'Encaminhado à autoridade de trânsito para apuração',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: CONFLICT_CONCURRENCY,
+      status: 'open',
+      resolution_action: 'manual_review',
+    });
+    const row = await client.query<{ status: string }>(
+      'select status from ops.sync_conflict where id = $1',
+      [CONFLICT_CONCURRENCY],
+    );
+    expect(row.rows[0]?.status).toBe('open');
+  });
+
+  it('C-0002-46 — dado um conflito concurrency quando resolve com accept_server então 409 TEAT.SYNC_ITEM_CONFLICT com context.conflictType concurrency', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-supervisor'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'accept_server',
+      });
+    expect(response.status).toBe(409);
+    expect(response.body).toMatchObject({
+      code: 'TEAT.SYNC_ITEM_CONFLICT',
+      context: expect.objectContaining({ conflictType: 'concurrency' }),
+    });
+  });
+
+  it('§5.13 — dado DETRAN_LOCAL_ROLES=field-agent quando resolve então 403 (a resolução é do supervisor/operador)', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
+      )
+      .set(headers('field-agent'))
+      .send({
+        resolved_by_user_ref: ACTOR_ID,
+        resolution_action: 'manual_review',
+      });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0002 §5.7/§5.9 — postura de dispositivo e homologação (C-0002-47/48)', () => {
+  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/field/devices/{id}/block então 200', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
+      .set(headers('technical-admin'))
+      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: DEVICE_TAMPERED,
+      status: 'blocked',
+    });
+  });
+
+  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/devices/{id}/block então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
+      .set(headers('field-supervisor'))
+      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/renew então 200 com laudo_valido_ate quadrienal', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
+      .set(headers('agency-admin'))
+      .send({
+        laudo_emitido_em: '2026-09-14',
+        emissor_independente: 'Instituto Independente de Ensaios',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: HOMOLOGATION_EXPIRED_REPORT,
+      status: 'active',
+      laudo_emitido_em: '2026-09-14',
+      laudo_valido_ate: '2030-09-14',
+    });
+  });
+
+  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/field/homologations/{id}/renew então 403', async () => {
+    const response = await request(server())
+      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
+      .set(headers('traffic-authority'))
+      .send({
+        laudo_emitido_em: '2026-09-14',
+        emissor_independente: 'Instituto Independente de Ensaios',
+      });
+    expect(response.status).toBe(403);
+  });
+
+  it('§5.8 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 200 com status cancelled e cancelled_reason', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
+      )
+      .set(headers('agency-admin'))
+      .send({
+        reason: 'Auditoria constatou desvio de escopo da homologação',
+        audit_reference: 'AUD-2026-0001',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      id: HOMOLOGATION_ACTIVE,
+      status: 'cancelled',
+      cancelled_reason: 'Auditoria constatou desvio de escopo da homologação',
+    });
+  });
+
+  it('§5.8 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 403', async () => {
+    const response = await request(server())
+      .post(
+        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
+      )
+      .set(headers('field-supervisor'))
+      .send({ reason: 'Auditoria constatou desvio de escopo da homologação' });
+    expect(response.status).toBe(403);
+  });
+});
+
+describe('CTG-0002 §5.6 — handoff de sessão (C-0002-49)', () => {
+  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 403', async () => {
+    const response = await request(server())
+      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
+      .set(headers('processing-operator'))
+      .send({
+        failed_device_id: DEVICE_AUTHORIZED,
+        reason: 'Falha de bateria do coletor em campo',
+      });
+    expect(response.status).toBe(403);
+  });
+
+  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 200 com handoff_id e cancelled_reservations', async () => {
+    const response = await request(server())
+      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
+      .set(headers('field-agent'))
+      .send({
+        failed_device_id: DEVICE_AUTHORIZED,
+        reason: 'Falha de bateria do coletor em campo',
+      });
+    expect(response.status).toBe(200);
+    expect(response.body).toMatchObject({
+      shift_id: SHIFT_OPEN,
+      failed_device_id: DEVICE_AUTHORIZED,
+      cancelled_reservations: expect.arrayContaining([RESERVATION_RESERVED]),
+    });
+  });
+});
+
+describe('CTG-0002 §1 — fronteira de rota dos controladores manuscritos de ops (C-0002-50)', () => {
+  /**
+   * Enumera o roteador do Express montado pelo Nest. A forma da propriedade
+   * mudou entre versões (`router` em Express 5, `_router` em Express 4), então
+   * as duas são aceitas; se nenhuma estiver acessível, o caso cai na sonda HTTP
+   * do teste seguinte, que já é suficiente para o critério.
+   */
+  function mountedPaths(): string[] {
+    const instance = app.getHttpAdapter().getInstance() as {
+      router?: { stack?: { route?: { path?: string } }[] };
+      _router?: { stack?: { route?: { path?: string } }[] };
+    };
+    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
+    return stack
+      .map((layer) => layer.route?.path)
+      .filter((path): path is string => typeof path === 'string');
+  }
+
+  it('C-0002-50 — dado o app montado quando as rotas de ops são enumeradas então todas começam por /v1/ops/ (§1: os controladores manuscritos ainda montam em /ops)', () => {
+    const offending = mountedPaths().filter(
+      (path) => path.startsWith('/ops/') || path === '/ops',
+    );
+    expect(
+      offending,
+      `rotas manuscritas de ops fora de /v1/ops/ (§1; correção em TASK-0005 para ops/field e TASK-0007 para ops/evidence e ops/snapshots): ${offending.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('C-0002-50 — dado o app montado quando as rotas legadas /ops/... são consultadas então nenhuma responde (404)', async () => {
+    for (const path of [
+      '/ops/agents',
+      '/ops/devices',
+      '/ops/teams',
+      '/ops/homologations',
+      '/ops/app-versions',
+      '/ops/evidence/evidence',
+      '/ops/snapshots/people',
+    ]) {
+      const response = await request(server())
+        .get(path)
+        .set(headers('technical-admin'));
+      expect(response.status, `${path} ainda responde fora de /v1/ops/`).toBe(
+        404,
+      );
+    }
+  });
+
+  it('§1 — dado o app montado quando /v1/ops/field/agents é consultado então a rota manuscrita responde no prefixo correto', async () => {
+    const response = await request(server())
+      .get('/v1/ops/field/agents')
+      .set(headers('technical-admin'));
+    expect(response.status).toBe(200);
+  });
+});
diff --git a/backend/database/seed/26-fixtures-teat-field.sql b/backend/database/seed/26-fixtures-teat-field.sql
new file mode 100644
index 0000000..f4b6c52
--- /dev/null
+++ b/backend/database/seed/26-fixtures-teat-field.sql
@@ -0,0 +1,119 @@
+-- TASK-0004 (R-0008, CTG-0002 §9 / M20): fixtures de campo, turno, handoff e
+-- sincronização do TEAT. Determinísticas e idempotentes (`on conflict (id) do update`),
+-- no tenant canônico 00000000-0000-7000-8000-00000000a001 e no órgão
+-- 00000000-0000-7000-8000-0000e2000001. "Hoje" das fixtures = 2026-09-14
+-- (00-fixtures-core.sql), fuso -04:00 (America/Manaus).
+--
+-- Reutiliza sem copiar o que 25-fixtures-teat.sql já semeia: os dispositivos
+-- …e4000002 (authorized), …e4000003 (blocked) e …e4000004 (tamper), a faixa
+-- …e5000001, as reservas …e6000001…e6000004 e o pacote normativo …e7000001.
+-- O dispositivo …e4000001 (10-fixtures-inf-ait.sql) continua **sem** linha em
+-- ops.ops_operational_device de propósito: é o caso negativo canônico de
+-- TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH (CTG-0002 §9).
+--
+-- Tokens de estado: ops_shift open|closed e ops_homologation active vêm do
+-- blueprint; numbering_consumption 'aplicado' é do route contract §4.3
+-- (CTG-0002 §3). Nada aqui inventa token: onde a fonte não fixa valor a coluna
+-- recebe 'source_pending', como já faz 25-fixtures-teat.sql em `usage_mode`.
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+-- Unidade operacional do órgão (BP-OPS-AGENCY-001): destino de
+-- ops_agent_profile.operational_unit_id e de catalog.operationalUnits[] no bootstrap.
+insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name, external_code)
+values ('00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Unidade Operacional Centro','UOP-CENTRO')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, external_code=excluded.external_code;
+
+-- Perfis funcionais. O id do agente apto é o mesmo uuid da persona de
+-- 00-fixtures-core.sql (M20): id = user_ref = …b0000001, de modo que
+-- DETRAN_LOCAL_ACTOR_ID case com ops_agent_profile.user_ref sem tradução.
+-- As matrículas diferem porque ux_ops_agent_profile_… é único por
+-- (tenant_id, traffic_agency_id, registration_number).
+insert into ops.ops_agent_profile (id, tenant_id, traffic_agency_id, user_ref, operational_unit_id, registration_number, credential_number, functional_status, credential_valid_until, trained_at)
+values
+ ('00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e2100001','MAT-000001','CRED-000001','active','2027-12-31','2026-01-15T09:00:00-04:00'),
+ ('00000000-0000-4000-8000-0000b0000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000002','00000000-0000-7000-8000-0000e2100001','MAT-000002','CRED-000002','inactive','2027-12-31','2026-01-15T09:00:00-04:00')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, user_ref=excluded.user_ref, operational_unit_id=excluded.operational_unit_id, registration_number=excluded.registration_number, credential_number=excluded.credential_number, functional_status=excluded.functional_status, credential_valid_until=excluded.credential_valid_until, trained_at=excluded.trained_at;
+
+-- Homologações: uma vigente e uma com laudo vencido. A vencida continua
+-- status='active' de propósito — com teat.homologation.expired_behavior='warn'
+-- (H.55, 05-parameters.sql) ela produz o aviso HOMOLOGATION_RENEWAL_DUE e
+-- nunca o bloqueador DEVICE_NOT_HOMOLOGATED (CTG-0002 §5.3).
+insert into ops.ops_homologation (id, tenant_id, traffic_agency_id, homologation_number, scope, issued_at, valid_until, document_uri, status, laudo_emitido_em, laudo_valido_ate, emissor_independente, descricao_publicada_em, descricao_publicacao_local, senatran_notificado_em)
+values
+ ('00000000-0000-7000-8000-0000e2200001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','HOM-2025-0001','Talão eletrônico — emissão de AIT em campo','2025-12-01','2029-12-31','https://fixtures.invalid/teat/homologacao/2025-0001','active','2025-12-01','2029-12-31','Instituto Independente de Ensaios','2025-12-10','Diário Oficial do Estado','2025-12-15'),
+ ('00000000-0000-7000-8000-0000e2200002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','HOM-2021-0002','Talão eletrônico — laudo quadrienal vencido','2021-12-01','2029-12-31','https://fixtures.invalid/teat/homologacao/2021-0002','active','2021-12-01','2025-12-31','Instituto Independente de Ensaios','2021-12-10','Diário Oficial do Estado','2021-12-15')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, homologation_number=excluded.homologation_number, scope=excluded.scope, issued_at=excluded.issued_at, valid_until=excluded.valid_until, document_uri=excluded.document_uri, status=excluded.status, laudo_emitido_em=excluded.laudo_emitido_em, laudo_valido_ate=excluded.laudo_valido_ate, emissor_independente=excluded.emissor_independente, descricao_publicada_em=excluded.descricao_publicada_em, descricao_publicacao_local=excluded.descricao_publicacao_local, senatran_notificado_em=excluded.senatran_notificado_em;
+
+-- Versão de aplicativo permitida: 1.0.0, a mesma que ops_operational_device
+-- …e4000002 declara em 25-fixtures-teat.sql. valid_to nulo = sem vencimento.
+insert into ops.ops_application_version (id, tenant_id, app_type, version, build_number, status, homologation_id, altera_funcionalidade, valid_from, valid_to)
+values ('00000000-0000-7000-8000-0000e2300001','00000000-0000-7000-8000-00000000a001','mobile','1.0.0','1000','active','00000000-0000-7000-8000-0000e2200001',false,'2026-01-01',null)
+on conflict (id) do update set tenant_id=excluded.tenant_id, app_type=excluded.app_type, version=excluded.version, build_number=excluded.build_number, status=excluded.status, homologation_id=excluded.homologation_id, altera_funcionalidade=excluded.altera_funcionalidade, valid_from=excluded.valid_from, valid_to=excluded.valid_to;
+
+-- Catálogo do bootstrap (CTG-0002 §6): equipe, viatura, operação e instrumento.
+insert into ops.ops_team (id, tenant_id, traffic_agency_id, operational_unit_id, name, supervisor_agent_id, status)
+values ('00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e2100001','Equipe Alfa',null,'active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, operational_unit_id=excluded.operational_unit_id, name=excluded.name, supervisor_agent_id=excluded.supervisor_agent_id, status=excluded.status;
+
+insert into ops.ops_patrol_vehicle (id, tenant_id, traffic_agency_id, prefix, plate, vehicle_type, status)
+values ('00000000-0000-7000-8000-0000e2500001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','VTR-0001','BRA2E19','automovel','active')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, prefix=excluded.prefix, plate=excluded.plate, vehicle_type=excluded.vehicle_type, status=excluded.status;
+
+insert into ops.ops_operation (id, tenant_id, traffic_agency_id, name, operation_type, description, planned_start_at, planned_end_at, status, objectives)
+values ('00000000-0000-7000-8000-0000e2600001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','Operação Lei Seca — Centro','fiscalizacao','Operação planejada das fixtures','2026-09-20T18:00:00-04:00','2026-09-20T23:00:00-04:00','planned','Fiscalização de alcoolemia')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, name=excluded.name, operation_type=excluded.operation_type, description=excluded.description, planned_start_at=excluded.planned_start_at, planned_end_at=excluded.planned_end_at, status=excluded.status, objectives=excluded.objectives;
+
+insert into ops.ops_measurement_instrument (id, tenant_id, traffic_agency_id, instrument_type, serial_number, brand, model, inmetro_model_approval, verification_certificate_number, initial_verification_at, last_verification_at, verification_valid_until, status)
+values ('00000000-0000-7000-8000-0000e2700001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','etilometro','ETL-000001','Fixtures','MOD-1','INMETRO-0001','CERT-0001','2026-06-30','2026-06-30','2027-06-30','approved')
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, instrument_type=excluded.instrument_type, serial_number=excluded.serial_number, brand=excluded.brand, model=excluded.model, inmetro_model_approval=excluded.inmetro_model_approval, verification_certificate_number=excluded.verification_certificate_number, initial_verification_at=excluded.initial_verification_at, last_verification_at=excluded.last_verification_at, verification_valid_until=excluded.verification_valid_until, status=excluded.status;
+
+-- Turnos: …e3000001 aberto no dispositivo …e4000002 (é o shift_id que as
+-- reservas …e6000001…e6000004 de 25-fixtures-teat.sql já apontam) e
+-- …e3000002 fechado.
+insert into ops.ops_shift (id, tenant_id, traffic_agency_id, agent_id, device_id, operational_unit_id, team_id, patrol_vehicle_id, operation_id, started_at, ended_at, start_location_json, end_location_json, status, offline_periods_count)
+values
+ ('00000000-0000-7000-8000-0000e3000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-0000e2500001','00000000-0000-7000-8000-0000e2600001','2026-09-14T08:00:00-04:00',null,'{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,null,'open',0),
+ ('00000000-0000-7000-8000-0000e3000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-7000-8000-0000e2100001','00000000-0000-7000-8000-0000e2400001','00000000-0000-7000-8000-0000e2500001',null,'2026-09-13T08:00:00-04:00','2026-09-13T17:00:00-04:00','{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,'{"latitude":-3.1019,"longitude":-60.0250,"accuracy_m":8}'::jsonb,'closed',0)
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, device_id=excluded.device_id, operational_unit_id=excluded.operational_unit_id, team_id=excluded.team_id, patrol_vehicle_id=excluded.patrol_vehicle_id, operation_id=excluded.operation_id, started_at=excluded.started_at, ended_at=excluded.ended_at, start_location_json=excluded.start_location_json, end_location_json=excluded.end_location_json, status=excluded.status, offline_periods_count=excluded.offline_periods_count;
+
+-- Declaração de incidente de dispositivo (AC-TEAT-012-4): é o que distingue
+-- handoff autorizado de sessão concorrente anômala em CTG-0002 §4.7 e §5.3.
+insert into ops.ops_session_handoff (id, tenant_id, shift_id, from_agent_id, to_agent_id, handed_off_at, details_json)
+values ('00000000-0000-7000-8000-0000e3100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e3000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-4000-8000-0000b0000001','2026-09-14T12:00:00-04:00','{"failed_device_id":"00000000-0000-7000-8000-0000e4000003","reason":"Falha de bateria do coletor em campo","new_device_id":"00000000-0000-7000-8000-0000e4000002"}'::jsonb)
+on conflict (id) do update set tenant_id=excluded.tenant_id, shift_id=excluded.shift_id, from_agent_id=excluded.from_agent_id, to_agent_id=excluded.to_agent_id, handed_off_at=excluded.handed_off_at, details_json=excluded.details_json;
+
+-- Lote aceito com sequência 1: é o "último aceito" que fixa
+-- expectedSequence = 2 nos casos SYNC_BATCH_SEQUENCE_REPLAYED/GAP (§4.1).
+insert into ops.sync_batch (id, tenant_id, traffic_agency_id, agent_id, device_id, device_batch_id, batch_sequence, submitted_at, accepted_items, receipts_json)
+values ('00000000-0000-7000-8000-0000e8000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-4000-8000-0000b0000001','00000000-0000-7000-8000-0000e4000002','batch-001',1,'2026-09-14T11:00:00-04:00',1,'{"item_ids":["00000000-0000-7000-8000-0000e9000001"]}'::jsonb)
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, agent_id=excluded.agent_id, device_id=excluded.device_id, device_batch_id=excluded.device_batch_id, batch_sequence=excluded.batch_sequence, submitted_at=excluded.submitted_at, accepted_items=excluded.accepted_items, receipts_json=excluded.receipts_json;
+
+-- Itens da fila: um aplicado (chave 'item-001') e um legado sem chave estável
+-- (chave derivada `legacy:<device_id>:<local_entity_id>`, §4.2), que nunca é
+-- aplicado e carrega TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED.
+insert into ops.sync_queue_item (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type, local_entity_id, server_entity_id, status, attempts, created_locally_at, sent_at, received_at, idempotency_key, payload_hash, payload_json, error_code, error_message)
+values
+ ('00000000-0000-7000-8000-0000e9000001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-4000-8000-0000b0000001','ait','00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-0000f8000060','applied',1,'2026-09-14T10:30:00-04:00','2026-09-14T11:00:00-04:00','2026-09-14T11:00:01-04:00','item-001','sha256:teat-item-001','{"ait":{"ait_number":"2026000002"}}'::jsonb,null,null),
+ ('00000000-0000-7000-8000-0000e9000002','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e2000001','00000000-0000-7000-8000-0000e4000002','00000000-0000-4000-8000-0000b0000001','ait','00000000-0000-7000-8000-0000ed000002',null,'received',1,'2026-09-14T10:45:00-04:00','2026-09-14T11:00:00-04:00','2026-09-14T11:00:01-04:00','legacy:00000000-0000-7000-8000-0000e4000002:00000000-0000-7000-8000-0000ed000002','sha256:teat-item-002','{"ait":{"ait_number":"2026000005"}}'::jsonb,'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',null)
+on conflict (id) do update set tenant_id=excluded.tenant_id, traffic_agency_id=excluded.traffic_agency_id, device_id=excluded.device_id, agent_id=excluded.agent_id, entity_type=excluded.entity_type, local_entity_id=excluded.local_entity_id, server_entity_id=excluded.server_entity_id, status=excluded.status, attempts=excluded.attempts, created_locally_at=excluded.created_locally_at, sent_at=excluded.sent_at, received_at=excluded.received_at, idempotency_key=excluded.idempotency_key, payload_hash=excluded.payload_hash, payload_json=excluded.payload_json, error_code=excluded.error_code, error_message=excluded.error_message;
+
+-- Recibo `applied` do item 'item-001': é o alvo de
+-- GET receipts/{tenantId}/by-idempotency/{key} (recuperação de ACK perdido, §5.13).
+insert into ops.sync_receipt (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type, local_entity_id, server_entity_id, accepted_hash, status, reason_code, applied_at, details_json)
+values ('00000000-0000-7000-8000-0000ea100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e9000001','item-001','ait','00000000-0000-7000-8000-0000ed000001','00000000-0000-7000-8000-0000f8000060','sha256:teat-item-001','applied',null,'2026-09-14T11:00:01-04:00',null)
+on conflict (id) do update set tenant_id=excluded.tenant_id, sync_queue_item_id=excluded.sync_queue_item_id, idempotency_key=excluded.idempotency_key, entity_type=excluded.entity_type, local_entity_id=excluded.local_entity_id, server_entity_id=excluded.server_entity_id, accepted_hash=excluded.accepted_hash, status=excluded.status, reason_code=excluded.reason_code, applied_at=excluded.applied_at, details_json=excluded.details_json;
+
+-- Conflito de concorrência aberto: allowed_resolution_actions = ['manual_review']
+-- apenas (§4.7 e §5.13) — accept_server/reject/retry_after_correction em
+-- sync-conflicts/{id}/resolve devolvem 409 TEAT.SYNC_ITEM_CONFLICT.
+insert into ops.sync_conflict (id, tenant_id, sync_queue_item_id, conflict_type, reason_code, local_hash, server_hash, retryable, allowed_resolution_actions, description, status)
+values ('00000000-0000-7000-8000-0000eb100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e9000002','concurrency','TEAT.SYNC_CONCURRENCY_SUSPECT',null,null,false,'["manual_review"]'::jsonb,'Mesmo agente em dispositivos distintos dentro da janela (RN-TEAT-111).','open')
+on conflict (id) do update set tenant_id=excluded.tenant_id, sync_queue_item_id=excluded.sync_queue_item_id, conflict_type=excluded.conflict_type, reason_code=excluded.reason_code, local_hash=excluded.local_hash, server_hash=excluded.server_hash, retryable=excluded.retryable, allowed_resolution_actions=excluded.allowed_resolution_actions, description=excluded.description, status=excluded.status;
+
+-- Consumo aplicado do número 2026000002, o da reserva `consumed` …e6000002:
+-- prova de que um número aplicado nunca é reatribuído
+-- (TEAT.NUMBERING_NUMBER_ALREADY_APPLIED, §4.6 passo 4).
+insert into ops.numbering_consumption (id, tenant_id, reservation_id, range_id, number, local_entity_id, idempotency_key, server_entity_id, finalized_at, reconciled_at, status, details_json)
+values ('00000000-0000-7000-8000-0000ec100001','00000000-0000-7000-8000-00000000a001','00000000-0000-7000-8000-0000e6000002','00000000-0000-7000-8000-0000e5000001',2026000002,'00000000-0000-7000-8000-0000ed000001','item-001','00000000-0000-7000-8000-0000f8000060','2026-09-14T10:30:00-04:00','2026-09-14T11:00:01-04:00','aplicado',null)
+on conflict (id) do update set tenant_id=excluded.tenant_id, reservation_id=excluded.reservation_id, range_id=excluded.range_id, number=excluded.number, local_entity_id=excluded.local_entity_id, idempotency_key=excluded.idempotency_key, server_entity_id=excluded.server_entity_id, finalized_at=excluded.finalized_at, reconciled_at=excluded.reconciled_at, status=excluded.status, details_json=excluded.details_json;
diff --git a/backend/domains/inf/ait/src/handwritten/index.ts b/backend/domains/inf/ait/src/handwritten/index.ts
index 70390f6..8dbcb54 100644
--- a/backend/domains/inf/ait/src/handwritten/index.ts
+++ b/backend/domains/inf/ait/src/handwritten/index.ts
@@ -1,4 +1,6 @@
 export * from './ait-cancel-requests.controller.js';
 export * from './ait-cancel-requests.provider.js';
 export * from './events.js';
+export * from './sync-applier.js';
+export * from './sync-applier.provider.js';
 export * from './transitions.js';
diff --git a/backend/domains/inf/ait/src/handwritten/sync-applier.provider.ts b/backend/domains/inf/ait/src/handwritten/sync-applier.provider.ts
new file mode 100644
index 0000000..6a742d5
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/sync-applier.provider.ts
@@ -0,0 +1,22 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — o applier `ait` como provider do próprio
+// `AitModule`; a lista `SYNC_ENTITY_APPLIERS` é montada pelo app
+// (`backend/app/src/teat-sync.providers.ts`).
+import type { Provider } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import { systemOpsClock } from '@detran/ops-core';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import { AitSyncApplier } from './sync-applier.js';
+
+export const AIT_SYNC_APPLIER_PROVIDER: Provider = {
+  provide: AitSyncApplier,
+  inject: [Database, RequestContext],
+  useFactory: (database: Database, requestContext: RequestContext) =>
+    new AitSyncApplier({
+      database,
+      requestContext,
+      outbox: new SqlTeatEventOutbox(),
+      clock: systemOpsClock,
+    }),
+};
diff --git a/backend/domains/inf/ait/src/handwritten/sync-applier.ts b/backend/domains/inf/ait/src/handwritten/sync-applier.ts
new file mode 100644
index 0000000..6fdf48d
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/sync-applier.ts
@@ -0,0 +1,441 @@
+// CTG-0002 §4.5 e §4.6 (M7, R-0008, TASK-0005) — applier `ait` do protocolo de
+// sincronização. Grava o estado direto na transação do item (M2): não chama a
+// rota `receive-protocol` e não fala com SENATRAN (ADR-0003).
+import {
+  asQueryable,
+  teatEnvelope,
+  teatEventSink,
+  type SqlQueryable,
+  type SyncApplierRejection,
+  type SyncEntityApplier,
+  type SyncEntityApplierItem,
+} from '@detran/ops-core';
+import { DetranError, type TeatEventOutbox } from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+import { z } from 'zod';
+
+/** §4.5 — payload canônico do `ait`, espelho das DTOs geradas menos `tenant_id`. */
+const aitSyncPayload = z.strictObject({
+  ait: z.strictObject({
+    traffic_agency_id: z.uuid(),
+    executing_agency_id: z.uuid().nullish(),
+    ait_number: z.string().max(80),
+    series: z.string().max(40).default(''),
+    agent_id: z.uuid(),
+    shift_id: z.uuid(),
+    operation_id: z.uuid().nullish(),
+    device_id: z.uuid(),
+    framing_id: z.uuid(),
+    catalog_id: z.uuid(),
+    infraction_at: z.iso.datetime(),
+    issued_at: z.iso.datetime(),
+    issuance_mode: z.string().max(40),
+    constatation_type: z.string().max(80),
+    had_approach: z.boolean().default(false),
+    no_approach_reason: z.string().nullish(),
+    location_description: z.string(),
+    location_json: z.record(z.string(), z.unknown()).nullish(),
+    gps_accuracy_m: z.number().nullish(),
+    municipality_code: z.string().max(20).nullish(),
+    uf: z.string().length(2),
+    road: z.string().max(40).nullish(),
+    km: z.number().nullish(),
+    direction: z.string().max(60).nullish(),
+    mandatory_observation: z.string().nullish(),
+    complementary_observation: z.string().nullish(),
+    content_hash: z.string().max(128),
+    system_signature_ref: z.string().nullish(),
+    speed_measurement_id: z.uuid().nullish(),
+  }),
+  vehicles: z
+    .array(
+      z.strictObject({
+        vehicle_snapshot_id: z.uuid(),
+        role: z.string().max(60),
+        visually_confirmed_by_agent: z.boolean().default(false),
+        observed_divergence: z.string().nullish(),
+      }),
+    )
+    .default([]),
+  people: z
+    .array(
+      z.strictObject({
+        person_id: z.uuid(),
+        role: z.string().max(60),
+        identified_by: z.string().max(80),
+        external_query_id: z.uuid().nullish(),
+        signed: z.boolean().default(false),
+        refused_signature: z.boolean().default(false),
+        notes: z.string().nullish(),
+      }),
+    )
+    .default([]),
+  signatures: z
+    .array(
+      z.strictObject({
+        person_id: z.uuid().nullish(),
+        signature_type: z.enum(['signed', 'refused', 'impossibility']),
+        signature_evidence_id: z.uuid().nullish(),
+        signed_at: z.iso.datetime().optional(),
+        location_json: z.record(z.string(), z.unknown()).nullish(),
+        refusal_or_impossibility_reason: z.string().nullish(),
+      }),
+    )
+    .default([]),
+  print_events: z
+    .array(
+      z.strictObject({
+        event_type: z.string().max(60),
+        device_id: z.uuid().nullish(),
+        printer_identifier: z.string().max(120).nullish(),
+        receipt_hash: z.string().max(128).nullish(),
+        failure_reason: z.string().nullish(),
+      }),
+    )
+    .default([]),
+});
+
+type AitSyncPayload = z.infer<typeof aitSyncPayload>;
+
+interface Clock {
+  now(): string;
+}
+
+export interface AitSyncApplierDeps {
+  database?: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext?: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId?: string; actorId?: string };
+  };
+  outbox?: TeatEventOutbox;
+  clock?: Clock;
+}
+
+interface ReservationRow extends Record<string, unknown> {
+  id: string;
+  range_id: string;
+  shift_id: string | null;
+  status: string;
+  valid_until: string;
+}
+
+/** `fields[]` do recibo: caminho do payload, nunca a mensagem do zod (§4.5). */
+function fieldsOf(error: z.ZodError): string[] {
+  return error.issues.flatMap((issue) => {
+    const path = issue.path.map((part) => String(part));
+    if (issue.code === 'unrecognized_keys')
+      return (issue as unknown as { keys: string[] }).keys.map((key) =>
+        [...path, key].join('.'),
+      );
+    return [path.join('.')];
+  });
+}
+
+export class AitSyncApplier implements SyncEntityApplier {
+  readonly entityType = 'ait';
+
+  constructor(private readonly deps: AitSyncApplierDeps = {}) {}
+
+  validate(payload: unknown): SyncApplierRejection | null {
+    const parsed = aitSyncPayload.safeParse(payload);
+    if (parsed.success) return null;
+    return {
+      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
+      fields: fieldsOf(parsed.error),
+    };
+  }
+
+  async apply(
+    item: SyncEntityApplierItem,
+    tx: Transaction,
+  ): Promise<{ serverEntityId: string }> {
+    const queryable = asQueryable(tx);
+    if (!queryable)
+      throw new Error('The ait sync applier requires a SQL transaction');
+    const payload = await this.payloadOf(queryable, item);
+    const ait = payload.ait;
+    const number = Number(ait.ait_number);
+    const reservation = await this.guardNumbering(queryable, item, ait, number);
+    const serverEntityId = await this.insertAit(queryable, item, payload);
+    await this.insertSatellites(queryable, serverEntityId, payload);
+    await this.insertHistory(queryable, item, serverEntityId, ait);
+    await queryable.query(
+      `insert into ops.numbering_consumption
+         (reservation_id, range_id, number, local_entity_id, idempotency_key,
+          server_entity_id, finalized_at, status, reconciled_at)
+       values ($1, $2, $3, $4, $5, $6, $7, 'aplicado', now())
+       on conflict (tenant_id, range_id, number)
+       do update set local_entity_id = excluded.local_entity_id,
+                     idempotency_key = excluded.idempotency_key,
+                     server_entity_id = excluded.server_entity_id,
+                     finalized_at = excluded.finalized_at,
+                     status = 'aplicado', updated_at = now()`,
+      [
+        reservation.id,
+        reservation.range_id,
+        number,
+        item.localEntityId,
+        item.idempotencyKey,
+        serverEntityId,
+        ait.issued_at,
+      ],
+    );
+    await this.publish(tx, item, serverEntityId);
+    return { serverEntityId };
+  }
+
+  private async payloadOf(
+    queryable: SqlQueryable,
+    item: SyncEntityApplierItem,
+  ): Promise<AitSyncPayload> {
+    const result = await queryable.query<{ payload_json: unknown }>(
+      'select payload_json from ops.sync_queue_item where id = $1',
+      [item.id],
+    );
+    const parsed = aitSyncPayload.safeParse(result.rows[0]?.payload_json);
+    if (!parsed.success)
+      throw new DetranError('TEAT.SYNC_INVALID_CANONICAL_AIT', {
+        status: 422,
+        context: { fields: fieldsOf(parsed.error) },
+        message: 'Payload canônico do AIT inválido.',
+      });
+    return parsed.data;
+  }
+
+  /** §4.6 — guarda de numeração, nesta ordem. */
+  private async guardNumbering(
+    queryable: SqlQueryable,
+    item: SyncEntityApplierItem,
+    ait: AitSyncPayload['ait'],
+    number: number,
+  ): Promise<ReservationRow> {
+    const found = await queryable.query<ReservationRow>(
+      `select id, range_id, shift_id, status, valid_until
+         from ops.numbering_reservation
+        where tenant_id = $1 and device_id = $2
+          and $3::bigint between start_number and end_number
+        order by reserved_at desc
+        limit 1`,
+      [item.tenantId, item.deviceId, number],
+    );
+    const reservation = found.rows[0];
+    if (!reservation)
+      throw new DetranError('TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT', {
+        status: 422,
+        context: { reservationId: null, shiftId: ait.shift_id },
+        message: 'Número fora de qualquer reserva do dispositivo.',
+      });
+    if (String(reservation.shift_id ?? '') !== String(ait.shift_id))
+      throw new DetranError('TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT', {
+        status: 422,
+        context: { reservationId: reservation.id, shiftId: ait.shift_id },
+        message: 'Reserva pertence a outro turno.',
+      });
+    const expiredStatus = ['expired', 'cancelled', 'blocked'].includes(
+      String(reservation.status),
+    );
+    const expiredByTime =
+      new Date(String(reservation.valid_until)).getTime() <
+      new Date(item.createdLocallyAt).getTime();
+    if (expiredStatus || expiredByTime)
+      throw new DetranError('TEAT.NUMBERING_RESERVATION_EXPIRED', {
+        status: 422,
+        context: { reservationId: reservation.id, number },
+        message: 'Reserva de numeração sem vigência para o ato.',
+      });
+    const applied = await queryable.query<{ server_entity_id: string | null }>(
+      `select server_entity_id from ops.numbering_consumption
+        where tenant_id = $1 and range_id = $2 and number = $3
+          and status = 'aplicado'
+        limit 1`,
+      [item.tenantId, reservation.range_id, number],
+    );
+    if (applied.rows[0])
+      throw new DetranError('TEAT.NUMBERING_NUMBER_ALREADY_APPLIED', {
+        status: 422,
+        context: { number, aitId: applied.rows[0].server_entity_id },
+        message: 'Número já consumido por AIT aplicado.',
+      });
+    return reservation;
+  }
+
+  private async insertAit(
+    queryable: SqlQueryable,
+    item: SyncEntityApplierItem,
+    payload: AitSyncPayload,
+  ): Promise<string> {
+    const ait = payload.ait;
+    const status = item.concurrencySuspect
+      ? 'SUSPEITO_CONCORRENCIA'
+      : 'RECEBIDO';
+    const inserted = await queryable.query<{ id: string }>(
+      `insert into inf.ait_ait
+         (traffic_agency_id, executing_agency_id, ait_number, series, agent_id,
+          shift_id, operation_id, device_id, framing_id, catalog_id,
+          infraction_at, issued_at, issuance_mode, constatation_type,
+          had_approach, no_approach_reason, location_description, location_json,
+          gps_accuracy_m, municipality_code, uf, road, km, direction,
+          mandatory_observation, complementary_observation, current_status,
+          version, speed_measurement_id, content_hash, system_signature_ref,
+          receipt_protocol)
+       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
+               $15, $16, $17, $18::jsonb, $19, $20, $21, $22, $23, $24, $25,
+               $26, $27, 1, $28, $29, $30, $31)
+       returning id`,
+      [
+        ait.traffic_agency_id,
+        ait.executing_agency_id ?? null,
+        ait.ait_number,
+        ait.series,
+        ait.agent_id,
+        ait.shift_id,
+        ait.operation_id ?? null,
+        ait.device_id,
+        ait.framing_id,
+        ait.catalog_id,
+        ait.infraction_at,
+        ait.issued_at,
+        ait.issuance_mode,
+        ait.constatation_type,
+        ait.had_approach,
+        ait.no_approach_reason ?? null,
+        ait.location_description,
+        ait.location_json ? JSON.stringify(ait.location_json) : null,
+        ait.gps_accuracy_m ?? null,
+        ait.municipality_code ?? null,
+        ait.uf,
+        ait.road ?? null,
+        ait.km ?? null,
+        ait.direction ?? null,
+        ait.mandatory_observation ?? null,
+        ait.complementary_observation ?? null,
+        status,
+        ait.speed_measurement_id ?? null,
+        ait.content_hash,
+        ait.system_signature_ref ?? null,
+        item.receiptId,
+      ],
+    );
+    return inserted.rows[0]!.id;
+  }
+
+  private async insertSatellites(
+    queryable: SqlQueryable,
+    aitId: string,
+    payload: AitSyncPayload,
+  ): Promise<void> {
+    for (const vehicle of payload.vehicles)
+      await queryable.query(
+        `insert into inf.ait_vehicle
+           (ait_id, vehicle_snapshot_id, role, visually_confirmed_by_agent,
+            observed_divergence)
+         values ($1, $2, $3, $4, $5)`,
+        [
+          aitId,
+          vehicle.vehicle_snapshot_id,
+          vehicle.role,
+          vehicle.visually_confirmed_by_agent,
+          vehicle.observed_divergence ?? null,
+        ],
+      );
+    for (const person of payload.people)
+      await queryable.query(
+        `insert into inf.ait_person
+           (ait_id, person_id, role, identified_by, external_query_id, signed,
+            refused_signature, notes)
+         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
+        [
+          aitId,
+          person.person_id,
+          person.role,
+          person.identified_by,
+          person.external_query_id ?? null,
+          person.signed,
+          person.refused_signature,
+          person.notes ?? null,
+        ],
+      );
+    for (const signature of payload.signatures)
+      await queryable.query(
+        `insert into inf.ait_signature
+           (ait_id, person_id, signature_type, signature_evidence_id, signed_at,
+            location_json, refusal_or_impossibility_reason)
+         values ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
+        [
+          aitId,
+          signature.person_id ?? null,
+          signature.signature_type,
+          signature.signature_evidence_id ?? null,
+          signature.signed_at ?? null,
+          signature.location_json
+            ? JSON.stringify(signature.location_json)
+            : null,
+          signature.refusal_or_impossibility_reason ?? null,
+        ],
+      );
+    for (const print of payload.print_events)
+      await queryable.query(
+        `insert into inf.ait_print_event
+           (ait_id, event_type, device_id, printer_identifier, receipt_hash,
+            failure_reason)
+         values ($1, $2, $3, $4, $5, $6)`,
+        [
+          aitId,
+          print.event_type,
+          print.device_id ?? null,
+          print.printer_identifier ?? null,
+          print.receipt_hash ?? null,
+          print.failure_reason ?? null,
+        ],
+      );
+  }
+
+  private async insertHistory(
+    queryable: SqlQueryable,
+    item: SyncEntityApplierItem,
+    aitId: string,
+    ait: AitSyncPayload['ait'],
+  ): Promise<void> {
+    const receivedAt = this.deps.clock?.now() ?? ait.issued_at;
+    const status = item.concurrencySuspect
+      ? 'SUSPEITO_CONCORRENCIA'
+      : 'RECEBIDO';
+    for (const [token, changedAt] of [
+      ['TRANSMITIDO', item.createdLocallyAt],
+      [status, receivedAt],
+    ] as const)
+      await queryable.query(
+        `insert into inf.ait_status_history
+           (ait_id, status, changed_at, user_ref, system_name)
+         values ($1, $2, $3, $4, 'detran-backend')`,
+        [aitId, token, changedAt, ait.agent_id],
+      );
+  }
+
+  private async publish(
+    tx: Transaction,
+    item: SyncEntityApplierItem,
+    aitId: string,
+  ): Promise<void> {
+    if (item.concurrencySuspect) return;
+    const occurredAt = this.deps.clock?.now() ?? new Date().toISOString();
+    await teatEventSink(this.deps.outbox).append(
+      tx,
+      teatEnvelope({
+        type: 'ait.changed',
+        domainEvent: 'AIT_RECEBIDO',
+        tenantId: item.tenantId,
+        actorId: item.agentId,
+        occurredAt,
+        aggregate: { kind: 'ait', id: aitId, version: 1 },
+        data: {
+          aitId,
+          fromState: 'TRANSMITIDO',
+          toState: 'RECEBIDO',
+          receiptProtocol: item.receiptId,
+          receivedAt: occurredAt,
+        },
+      }),
+    );
+  }
+}
diff --git a/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts b/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts
new file mode 100644
index 0000000..5dbbcee
--- /dev/null
+++ b/backend/domains/inf/ait/tests/integration/ait-sync-applier.integration.spec.ts
@@ -0,0 +1,683 @@
+import { createHash, randomUUID } from 'node:crypto';
+import pg from 'pg';
+import {
+  afterAll,
+  beforeAll,
+  beforeEach,
+  describe,
+  expect,
+  it,
+  vi,
+} from 'vitest';
+
+/**
+ * CTG-0002 §4.5, §4.6 e §10 (R-0008, TASK-0004) — C-0002-39…42: o applier `ait`
+ * (M7). Guarda de numeração na ordem da §4.6 (reserva do device → turno →
+ * validade → número já aplicado), efeito de domínio (`RECEBIDO`,
+ * `receipt_protocol`, `numbering_consumption('aplicado')`, duas linhas de
+ * `ait_status_history`) e o evento `AIT_RECEBIDO`.
+ *
+ * `backend/domains/inf/ait/src/handwritten/sync-applier.ts` nasce em TASK-0005
+ * (CTG-0002 §11): o módulo é carregado por `import()` dinâmico dentro de cada
+ * teste, para que o arquivo colete e cada caso falhe isolado, pelo
+ * comportamento ausente.
+ *
+ * O contrato **fixa** a porta (`SyncEntityApplier` em `@detran/ops-core`,
+ * §4.8): `entityType`, `validate(payload)` e `apply(item, tx)` com
+ * `SyncEntityApplierItem { id, tenantId, trafficAgencyId, deviceId, agentId,
+ * entityType, localEntityId, idempotencyKey, payloadHash, createdLocallyAt,
+ * concurrencySuspect, receiptId }`. Como o item **não** carrega o payload, o
+ * applier o lê de `ops.sync_queue_item.payload_json` pela transação — por isso
+ * cada teste grava a linha da fila e o recibo antes de chamar `apply`.
+ * Proposta do Inspector, não valor canônico: só o nome do símbolo exportado e
+ * a forma do objeto de dependências do construtor.
+ */
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+/** Fixtures canônicas (25/26-fixtures-teat*.sql, 10-fixtures-inf-ait.sql). */
+const FIXTURES = {
+  tenantId: '00000000-0000-7000-8000-00000000a001',
+  agencyId: '00000000-0000-7000-8000-0000e2000001',
+  agentId: '00000000-0000-4000-8000-0000b0000001',
+  deviceId: '00000000-0000-7000-8000-0000e4000002',
+  shiftOpen: '00000000-0000-7000-8000-0000e3000001',
+  shiftClosed: '00000000-0000-7000-8000-0000e3000002',
+  rangeId: '00000000-0000-7000-8000-0000e5000001',
+  reservationReserved: '00000000-0000-7000-8000-0000e6000001',
+  reservationConsumed: '00000000-0000-7000-8000-0000e6000002',
+  reservationExpired: '00000000-0000-7000-8000-0000e6000003',
+  aitReceived: '00000000-0000-7000-8000-0000f8000060',
+  framingId: '00000000-0000-7000-8000-0000e1000001',
+  catalogId: '00000000-0000-7000-8000-0000e0000001',
+} as const;
+
+const CREATED_LOCALLY_AT = '2026-09-14T13:05:00.000Z';
+
+let isolated: { tenantId: string; actorId: string };
+let isolatedField: {
+  agencyId: string;
+  unitId: string;
+  agentId: string;
+  deviceId: string;
+  shiftId: string;
+  rangeId: string;
+  reservationId: string;
+};
+
+function stableJson(value: unknown): string {
+  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
+  if (value && typeof value === 'object') {
+    const entries = Object.entries(value as Record<string, unknown>)
+      .filter(([, item]) => item !== undefined)
+      .sort(([left], [right]) => left.localeCompare(right))
+      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
+    return `{${entries.join(',')}}`;
+  }
+  return JSON.stringify(value) ?? 'null';
+}
+
+function canonicalHash(payload: unknown): string {
+  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
+}
+
+/** Payload canônico do `ait` (CTG-0002 §4.5). */
+function aitPayload(
+  overrides: Record<string, unknown> = {},
+): Record<string, unknown> {
+  return {
+    ait: {
+      traffic_agency_id: FIXTURES.agencyId,
+      ait_number: '2026000001',
+      series: 'F',
+      agent_id: FIXTURES.agentId,
+      shift_id: FIXTURES.shiftOpen,
+      device_id: FIXTURES.deviceId,
+      framing_id: FIXTURES.framingId,
+      catalog_id: FIXTURES.catalogId,
+      infraction_at: '2026-09-14T13:00:00.000Z',
+      issued_at: CREATED_LOCALLY_AT,
+      issuance_mode: 'eletronico',
+      constatation_type: 'abordagem',
+      had_approach: true,
+      location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
+      uf: 'AM',
+      municipality_code: '1302603',
+      content_hash: 'sha256:canonical-applier',
+      ...overrides,
+    },
+    vehicles: [],
+    people: [],
+    signatures: [],
+    print_events: [],
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
+function database(tenantId: string, actorId: string) {
+  return {
+    async tx<T>(work: (transaction: SqlTransaction) => Promise<T>): Promise<T> {
+      await client.query('begin');
+      try {
+        await client.query('set local role role_app_backend');
+        await client.query(`select set_config('app.tenant_id', $1, true)`, [
+          tenantId,
+        ]);
+        await client.query(`select set_config('app.actor_id', $1, true)`, [
+          actorId,
+        ]);
+        const result = await work({
+          query: client.query.bind(client),
+        } as SqlTransaction);
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
+function deps(tenantId: string, actorId: string) {
+  const db = database(tenantId, actorId);
+  return {
+    database: db,
+    requestContext: {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId, actorId }),
+    },
+    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
+    clock: { now: () => '2026-09-14T18:00:00.000Z' },
+  };
+}
+
+/**
+ * `import()` com especificador **variável** de propósito: o módulo só nasce em
+ * TASK-0005 e um literal faria `tsc --noEmit` (e portanto `pnpm check`) quebrar
+ * com TS2307 antes de o Engineer criar o arquivo. Com a variável, a resolução
+ * acontece em tempo de execução, relativa a este arquivo, e a ausência aparece
+ * como falha do teste — que é o que o tier pede.
+ */
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+const APPLIER_EXPORTS = [
+  'AitSyncApplier',
+  'AitSyncEntityApplier',
+  'SyncApplier',
+] as const;
+
+async function loadApplier(
+  tenantId: string,
+  actorId: string,
+): Promise<{
+  entityType: string;
+  validate(payload: unknown): { code: string; fields: string[] } | null;
+  apply(
+    item: Record<string, unknown>,
+    tx: SqlTransaction,
+  ): Promise<{ serverEntityId: string }>;
+}> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule(
+      '../../src/handwritten/sync-applier.js',
+    )) as Record<string, unknown>;
+  } catch (cause) {
+    throw new Error(
+      'inf/ait/src/handwritten/sync-applier.ts ainda não existe (TASK-0005, CTG-0002 §11)',
+      { cause },
+    );
+  }
+  const exported =
+    APPLIER_EXPORTS.map((name) => loaded[name]).find(
+      (value) => typeof value === 'function',
+    ) ?? Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function')
+    throw new Error('sync-applier.ts não exporta um applier construtível');
+  const Applier = exported as new (dependencies: unknown) => {
+    entityType: string;
+    validate(payload: unknown): { code: string; fields: string[] } | null;
+    apply(
+      item: Record<string, unknown>,
+      tx: SqlTransaction,
+    ): Promise<{ serverEntityId: string }>;
+  };
+  return new Applier(deps(tenantId, actorId));
+}
+
+/**
+ * Grava a linha da fila e o recibo `received` que o applier consome, e devolve
+ * o `SyncEntityApplierItem` da §4.8.
+ */
+async function queueItem(
+  scope: {
+    tenantId: string;
+    agencyId: string;
+    deviceId: string;
+    agentId: string;
+  },
+  payload: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  const id = randomUUID();
+  const localEntityId = randomUUID();
+  const idempotencyKey = `applier-${id.slice(0, 8)}`;
+  const payloadHash = canonicalHash(payload);
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  // `auth.enforce_tenant_id()` compara a linha com `app.tenant_id`: sem fixar
+  // o tenant do alvo, o insert herda o do último `set_config` e falha.
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    scope.tenantId,
+  ]);
+  await client.query(
+    `insert into ops.sync_queue_item
+       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
+        local_entity_id, status, created_locally_at, idempotency_key,
+        payload_hash, payload_json)
+     values ($1, $2, $3, $4, $5, 'ait', $6, 'received', $7, $8, $9, $10)`,
+    [
+      id,
+      scope.tenantId,
+      scope.agencyId,
+      scope.deviceId,
+      scope.agentId,
+      localEntityId,
+      CREATED_LOCALLY_AT,
+      idempotencyKey,
+      payloadHash,
+      JSON.stringify(payload),
+    ],
+  );
+  const receiptId = randomUUID();
+  await client.query(
+    `insert into ops.sync_receipt
+       (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
+        local_entity_id, accepted_hash, status)
+     values ($1, $2, $3, $4, 'ait', $5, $6, 'received')`,
+    [receiptId, scope.tenantId, id, idempotencyKey, localEntityId, payloadHash],
+  );
+  return {
+    id,
+    tenantId: scope.tenantId,
+    trafficAgencyId: scope.agencyId,
+    deviceId: scope.deviceId,
+    agentId: scope.agentId,
+    entityType: 'ait',
+    localEntityId,
+    idempotencyKey,
+    payloadHash,
+    createdLocallyAt: CREATED_LOCALLY_AT,
+    concurrencySuspect: false,
+    receiptId,
+  };
+}
+
+async function applyItem(
+  tenantId: string,
+  actorId: string,
+  item: Record<string, unknown>,
+): Promise<{ serverEntityId: string }> {
+  const applier = await loadApplier(tenantId, actorId);
+  return database(tenantId, actorId).tx((tx) => applier.apply(item, tx));
+}
+
+beforeAll(async () => {
+  await client.connect();
+  // Tenant isolado só para o caso de sucesso, que escreve (rait-test-strategy
+  // §6 admite `randomUUID` para isolamento de tenant em integration); os casos
+  // negativos usam as fixtures canônicas sem mutá-las.
+  const tenantId = randomUUID();
+  const actorId = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [tenantId, `applier-${tenantId.slice(0, 8)}`, 'AIT sync applier'],
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
+  isolated = { tenantId, actorId };
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  const agencyId = randomUUID();
+  const unitId = randomUUID();
+  const agentId = randomUUID();
+  const deviceId = randomUUID();
+  const shiftId = randomUUID();
+  const rangeId = randomUUID();
+  const reservationId = randomUUID();
+  await client.query(
+    `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name)
+     values ($1, $2, $3, 'Unidade Operacional Centro')`,
+    [unitId, tenantId, agencyId],
+  );
+  await client.query(
+    `insert into ops.ops_agent_profile
+       (id, tenant_id, traffic_agency_id, user_ref, operational_unit_id,
+        registration_number, functional_status, credential_valid_until)
+     values ($1, $2, $3, $4, $5, 'MAT-000001', 'active', '2027-12-31')`,
+    [agentId, tenantId, agencyId, actorId, unitId],
+  );
+  await client.query(
+    `insert into ops.ops_operational_device
+       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
+        status, app_version, tamper_flag)
+     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
+    [deviceId, tenantId, agencyId, `sha256:applier-${deviceId.slice(0, 8)}`],
+  );
+  await client.query(
+    `insert into ops.ops_shift
+       (id, tenant_id, traffic_agency_id, agent_id, device_id,
+        operational_unit_id, started_at, status)
+     values ($1, $2, $3, $4, $5, $6, '2026-09-14T08:00:00-04:00', 'open')`,
+    [shiftId, tenantId, agencyId, agentId, deviceId, unitId],
+  );
+  await client.query(
+    `insert into ops.ait_numbering_range
+       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
+        next_number, status, usage_mode)
+     values ($1, $2, $3, 'F', 2026000001, 2026001000, 2026000002, 'active',
+             'source_pending')`,
+    [rangeId, tenantId, agencyId],
+  );
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, 'applier-reserved', 2026000001,
+             2026000001, '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [reservationId, tenantId, rangeId, agencyId, agentId, deviceId, shiftId],
+  );
+  isolatedField = {
+    agencyId,
+    unitId,
+    agentId,
+    deviceId,
+    shiftId,
+    rangeId,
+    reservationId,
+  };
+});
+
+afterAll(async () => {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  for (const table of [
+    'inf.ait_status_history',
+    'inf.ait_ait',
+    'ops.numbering_consumption',
+    'ops.sync_receipt',
+    'ops.sync_queue_item',
+    'ops.numbering_reservation',
+    'ops.ait_numbering_range',
+    'ops.ops_shift',
+    'ops.ops_operational_device',
+    'ops.ops_agent_profile',
+    'ops.agency_unit',
+    'integration.outbox',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [
+      isolated.tenantId,
+    ]);
+  }
+  await client.query('delete from auth.memberships where tenant_id = $1', [
+    isolated.tenantId,
+  ]);
+  await client.query('delete from auth.users where tenant_id = $1', [
+    isolated.tenantId,
+  ]);
+  await client.query('delete from auth.tenants where id = $1', [
+    isolated.tenantId,
+  ]);
+  await client.end();
+});
+
+/**
+ * A limpeza é restrita às linhas **deste** arquivo (`idempotency_key like
+ * 'applier-%'`): o tenant canônico é compartilhado, e apagar `ops.sync_receipt`
+ * inteiro derrubaria o recibo `…ea100001` de `26-fixtures-teat-field.sql`, do
+ * qual dependem C-0002-30 (`by-idempotency/item-001`) e o e2e quando as suítes
+ * rodam encadeadas. O recibo sai antes do item por causa da FK
+ * `fk_ops_sync_receipt_queue_item`.
+ */
+beforeEach(async () => {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `delete from ops.sync_receipt
+      where tenant_id = $1 and idempotency_key like 'applier-%'`,
+    [FIXTURES.tenantId],
+  );
+  await client.query(
+    `delete from ops.sync_queue_item
+      where tenant_id = $1 and idempotency_key like 'applier-%'`,
+    [FIXTURES.tenantId],
+  );
+});
+
+describe('CTG-0002 §4.6 — guarda de numeração do applier ait (C-0002-39…41)', () => {
+  it('C-0002-39 — dado um item ait cujo ait_number está numa reserva de outro turno então TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT com reservationId e shiftId (recibo rejected, §4.4)', async () => {
+    const payload = aitPayload({
+      ait_number: '2026000001',
+      shift_id: FIXTURES.shiftClosed,
+    });
+    const item = await queueItem(
+      {
+        tenantId: FIXTURES.tenantId,
+        agencyId: FIXTURES.agencyId,
+        deviceId: FIXTURES.deviceId,
+        agentId: FIXTURES.agentId,
+      },
+      payload,
+    );
+    await expect(
+      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
+    ).rejects.toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
+      context: expect.objectContaining({
+        reservationId: FIXTURES.reservationReserved,
+        shiftId: FIXTURES.shiftClosed,
+      }),
+    });
+  });
+
+  it('§4.6 passo 1 — dado um ait_number fora de qualquer reserva do device então o mesmo TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT com reservationId null', async () => {
+    const payload = aitPayload({ ait_number: '2026000900' });
+    const item = await queueItem(
+      {
+        tenantId: FIXTURES.tenantId,
+        agencyId: FIXTURES.agencyId,
+        deviceId: FIXTURES.deviceId,
+        agentId: FIXTURES.agentId,
+      },
+      payload,
+    );
+    await expect(
+      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
+    ).rejects.toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT',
+      context: expect.objectContaining({
+        reservationId: null,
+        shiftId: FIXTURES.shiftOpen,
+      }),
+    });
+  });
+
+  it('C-0002-40 — dado um item cujo número está na reserva …e6000003 (expired) então TEAT.NUMBERING_RESERVATION_EXPIRED com reservationId e number (recibo conflict) e nenhum AIT criado', async () => {
+    const payload = aitPayload({ ait_number: '2026000003' });
+    const item = await queueItem(
+      {
+        tenantId: FIXTURES.tenantId,
+        agencyId: FIXTURES.agencyId,
+        deviceId: FIXTURES.deviceId,
+        agentId: FIXTURES.agentId,
+      },
+      payload,
+    );
+    await expect(
+      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
+    ).rejects.toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
+      context: expect.objectContaining({
+        reservationId: FIXTURES.reservationExpired,
+        number: 2026000003,
+      }),
+    });
+    const created = await client.query<{ count: string }>(
+      `select count(*)::text as count from inf.ait_ait
+        where tenant_id = $1 and ait_number = '2026000003'`,
+      [FIXTURES.tenantId],
+    );
+    expect(Number(created.rows[0]!.count)).toBe(0);
+  });
+
+  it('§4.6 passo 3 — dado um item cujo número está na reserva …e6000004 (cancelled) então o mesmo TEAT.NUMBERING_RESERVATION_EXPIRED', async () => {
+    const payload = aitPayload({ ait_number: '2026000004' });
+    const item = await queueItem(
+      {
+        tenantId: FIXTURES.tenantId,
+        agencyId: FIXTURES.agencyId,
+        deviceId: FIXTURES.deviceId,
+        agentId: FIXTURES.agentId,
+      },
+      payload,
+    );
+    await expect(
+      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
+    ).rejects.toMatchObject({
+      code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
+    });
+  });
+
+  it('C-0002-41 — dado o número 2026000002, com numbering_consumption aplicado nas fixtures, então TEAT.NUMBERING_NUMBER_ALREADY_APPLIED com number e aitId — o número nunca é reatribuído', async () => {
+    const payload = aitPayload({ ait_number: '2026000002' });
+    const item = await queueItem(
+      {
+        tenantId: FIXTURES.tenantId,
+        agencyId: FIXTURES.agencyId,
+        deviceId: FIXTURES.deviceId,
+        agentId: FIXTURES.agentId,
+      },
+      payload,
+    );
+    await expect(
+      applyItem(FIXTURES.tenantId, FIXTURES.agentId, item),
+    ).rejects.toMatchObject({
+      code: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
+      context: expect.objectContaining({
+        number: 2026000002,
+        aitId: FIXTURES.aitReceived,
+      }),
+    });
+  });
+
+  it('§4.5 — dado um payload sem content_hash então validate devolve TEAT.SYNC_INVALID_CANONICAL_AIT com fields contendo ait.content_hash', async () => {
+    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
+    const payload = aitPayload();
+    delete (payload.ait as Record<string, unknown>).content_hash;
+    expect(applier.entityType).toBe('ait');
+    expect(applier.validate(payload)).toMatchObject({
+      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
+      fields: expect.arrayContaining(['ait.content_hash']),
+    });
+  });
+
+  it('§4.5 — dado um payload com tenant_id (proibido pelo strictObject) então validate devolve TEAT.SYNC_INVALID_CANONICAL_AIT com fields contendo ait.tenant_id', async () => {
+    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
+    const payload = aitPayload({ tenant_id: FIXTURES.tenantId });
+    expect(applier.validate(payload)).toMatchObject({
+      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
+      fields: expect.arrayContaining(['ait.tenant_id']),
+    });
+  });
+
+  it('§4.5 — dado o payload canônico completo então validate devolve null', async () => {
+    const applier = await loadApplier(FIXTURES.tenantId, FIXTURES.agentId);
+    expect(applier.validate(aitPayload())).toBeNull();
+  });
+});
+
+describe('CTG-0002 §4.6 — efeito de domínio do applier ait (C-0002-42)', () => {
+  it('C-0002-42 — dado um item ait válido então o AIT nasce em RECEBIDO com receipt_protocol = id do sync_receipt, duas linhas de ait_status_history (TRANSMITIDO, RECEBIDO), numbering_consumption aplicado e o evento AIT_RECEBIDO', async () => {
+    const payload = aitPayload({
+      traffic_agency_id: isolatedField.agencyId,
+      ait_number: '2026000001',
+      agent_id: isolatedField.agentId,
+      shift_id: isolatedField.shiftId,
+      device_id: isolatedField.deviceId,
+    });
+    const item = await queueItem(
+      {
+        tenantId: isolated.tenantId,
+        agencyId: isolatedField.agencyId,
+        deviceId: isolatedField.deviceId,
+        agentId: isolatedField.agentId,
+      },
+      payload,
+    );
+    const applier = await loadApplier(isolated.tenantId, isolated.actorId);
+    const result = await database(isolated.tenantId, isolated.actorId).tx(
+      (tx) => applier.apply(item, tx),
+    );
+    expect(result.serverEntityId).toEqual(expect.any(String));
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const ait = await client.query<{
+      current_status: string;
+      receipt_protocol: string;
+      version: number;
+    }>(
+      `select current_status, receipt_protocol, version from inf.ait_ait where id = $1`,
+      [result.serverEntityId],
+    );
+    expect(ait.rows[0]).toMatchObject({
+      current_status: 'RECEBIDO',
+      receipt_protocol: item.receiptId,
+      version: 1,
+    });
+    const history = await client.query<{ status: string }>(
+      `select status from inf.ait_status_history where ait_id = $1 order by changed_at, created_at`,
+      [result.serverEntityId],
+    );
+    expect(history.rows.map((row) => row.status)).toEqual([
+      'TRANSMITIDO',
+      'RECEBIDO',
+    ]);
+    const consumption = await client.query<{
+      status: string;
+      server_entity_id: string;
+      number: string;
+    }>(
+      `select status, server_entity_id, number::text from ops.numbering_consumption
+        where tenant_id = $1 and reservation_id = $2`,
+      [isolated.tenantId, isolatedField.reservationId],
+    );
+    expect(consumption.rows[0]).toMatchObject({
+      status: 'aplicado',
+      server_entity_id: result.serverEntityId,
+      number: '2026000001',
+    });
+  });
+
+  it('§4.6/§4.7 — dado o mesmo item com concurrencySuspect true então o AIT nasce em SUSPEITO_CONCORRENCIA, não em RECEBIDO (AC-TEAT-012-2: bloqueio, não alerta)', async () => {
+    const payload = aitPayload({
+      traffic_agency_id: isolatedField.agencyId,
+      ait_number: '2026000005',
+      agent_id: isolatedField.agentId,
+      shift_id: isolatedField.shiftId,
+      device_id: isolatedField.deviceId,
+    });
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(
+      `insert into ops.numbering_reservation
+         (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+          idempotency_key, start_number, end_number, valid_until, status)
+       values ($1, $2, $3, $4, $5, $6, $7, 'applier-reserved-5', 2026000005,
+               2026000005, '2026-12-31T23:59:59-04:00', 'reserved')`,
+      [
+        randomUUID(),
+        isolated.tenantId,
+        isolatedField.rangeId,
+        isolatedField.agencyId,
+        isolatedField.agentId,
+        isolatedField.deviceId,
+        isolatedField.shiftId,
+      ],
+    );
+    const item = await queueItem(
+      {
+        tenantId: isolated.tenantId,
+        agencyId: isolatedField.agencyId,
+        deviceId: isolatedField.deviceId,
+        agentId: isolatedField.agentId,
+      },
+      payload,
+    );
+    item.concurrencySuspect = true;
+    const applier = await loadApplier(isolated.tenantId, isolated.actorId);
+    const result = await database(isolated.tenantId, isolated.actorId).tx(
+      (tx) => applier.apply(item, tx),
+    );
+    const ait = await client.query<{ current_status: string }>(
+      `select current_status from inf.ait_ait where id = $1`,
+      [result.serverEntityId],
+    );
+    expect(ait.rows[0]?.current_status).toBe('SUSPEITO_CONCORRENCIA');
+  });
+});
diff --git a/backend/domains/ops/core/src/applied-entity.ts b/backend/domains/ops/core/src/applied-entity.ts
new file mode 100644
index 0000000..95c3940
--- /dev/null
+++ b/backend/domains/ops/core/src/applied-entity.ts
@@ -0,0 +1,14 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — porta "a entidade já foi aplicada no
+// servidor?", consumida por CTG-0003 (evidência) e definida aqui porque é do
+// núcleo `ops`.
+import type { Transaction } from '@stynx-nyx/data';
+
+export interface AppliedEntityPort {
+  /** `'ait'`, `'administrative-measure'`, … */
+  readonly entityType: string;
+  isApplied(entityId: string, tx: Transaction): Promise<boolean>;
+}
+
+export const APPLIED_ENTITY_PORTS: unique symbol = Symbol(
+  'APPLIED_ENTITY_PORTS',
+);
diff --git a/backend/domains/ops/core/src/index.ts b/backend/domains/ops/core/src/index.ts
index f63ff5f..840cc7b 100644
--- a/backend/domains/ops/core/src/index.ts
+++ b/backend/domains/ops/core/src/index.ts
@@ -3,6 +3,10 @@ import type { Database, Transaction } from '@stynx-nyx/data';

 import { withTenantContext } from '@detran/shared';

+export * from './sync-applier.js';
+export * from './applied-entity.js';
+export * from './storage.js';
+export * from './runtime.js';
 export {
   SqlSyncConflictPort,
   type ResolveSyncConflictOptions,
@@ -47,6 +51,27 @@ export class OpsTenantRepository {
     );
   }

+  update(
+    id: string,
+    patch: Record<string, unknown>,
+  ): Promise<Record<string, unknown> | undefined> {
+    const entries = Object.entries(patch);
+    if (entries.length === 0) throw new Error('An ops patch requires values');
+    const columns = entries.map(([key]) => key);
+    if (columns.some((key) => !/^[a-z_]+$/.test(key) || key === 'tenant_id'))
+      throw new Error('Invalid ops write field');
+    const assignments = columns
+      .map((column, index) => `${column} = $${index + 2}`)
+      .join(', ');
+    return this.inTenant(async (tx) => {
+      const result = await tx.query(
+        `update ${this.table} set ${assignments}, updated_at = now() where id = $1 returning *`,
+        [id, ...entries.map(([, value]) => value)],
+      );
+      return result.rows[0];
+    });
+  }
+
   create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
     const entries = Object.entries(values);
     if (entries.length === 0) throw new Error('An ops record requires values');
@@ -70,8 +95,5 @@ export class OpsTenantRepository {
   }
 }

-/** Phase 5 integration seam; this domain must consume the promoted STYNX runtime. */
-export interface OfflineSyncPort {
-  // TODO(Phase 5): bind @stynx-nyx/offline-sync after feat/p1-mobile-runtime publishes.
-  submitBatch(): never;
-}
+// O placeholder `OfflineSyncPort` desta fase foi substituído pelas portas
+// reais do protocolo (`SyncEntityApplier`, `AppliedEntityPort`) — CTG-0002 §1.
diff --git a/backend/domains/ops/core/src/runtime.ts b/backend/domains/ops/core/src/runtime.ts
new file mode 100644
index 0000000..51db951
--- /dev/null
+++ b/backend/domains/ops/core/src/runtime.ts
@@ -0,0 +1,146 @@
+// CTG-0002 §4 e §5 (R-0008, TASK-0005) — utilidades compartilhadas pelos
+// comandos manuscritos de `ops`: a superfície mínima de repositório por
+// tabela, o acesso SQL dentro de uma transação já aberta, o relógio injetado
+// (CODESTYLE: nunca `Date.now()` em domínio) e o sumidouro de eventos.
+import {
+  SqlTeatEventOutbox,
+  type TeatEventEnvelope,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+
+export type OpsRow = Record<string, unknown>;
+
+/**
+ * Superfície mínima de uma tabela de `ops` usada pelos comandos: é a de
+ * `OpsTenantRepository` (SQL sob RLS, ADR-0002) e a mesma que os harnesses de
+ * teste implementam. Nenhum comando escreve SQL de tabela fora de uma
+ * transação de domínio; tudo o mais passa por aqui.
+ */
+export interface OpsRowStore {
+  list(): Promise<OpsRow[]>;
+  find(id: string): Promise<OpsRow | undefined>;
+  create(values: OpsRow): Promise<OpsRow>;
+  update(id: string, patch: OpsRow): Promise<OpsRow | undefined>;
+}
+
+export interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+/**
+ * `Transaction` real do kernel sempre expõe `.query`; dublês de unidade que só
+ * provam a guarda, não. Quem chama decide o que fazer sem SQL — nunca lança.
+ */
+export function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+/**
+ * Escreve uma linha pela porta de repositório.
+ *
+ * Valores de coluna `jsonb` que são **listas** não têm forma única na porta: um
+ * repositório SQL sobre `node-postgres` converte um array JS em literal de
+ * array do Postgres (`{"x"}`), que `jsonb` recusa, enquanto um repositório
+ * que entende JSON guarda a lista como está. A escrita tenta a forma
+ * estruturada e, se a porta a recusar, repete uma vez com as listas
+ * serializadas em texto JSON.
+ */
+export async function createOpsRow(
+  store: OpsRowStore,
+  values: OpsRow,
+): Promise<OpsRow> {
+  try {
+    return await store.create(values);
+  } catch (cause) {
+    const serialized = Object.fromEntries(
+      Object.entries(values).map(([key, value]) => [
+        key,
+        Array.isArray(value) ? JSON.stringify(value) : value,
+      ]),
+    );
+    if (stableKeys(serialized) === stableKeys(values)) throw cause;
+    return store.create(serialized);
+  }
+}
+
+function stableKeys(values: OpsRow): string {
+  return Object.entries(values)
+    .map(([key, value]) => `${key}:${typeof value}:${Array.isArray(value)}`)
+    .join('|');
+}
+
+export interface OpsClock {
+  now(): string;
+  today?(): string;
+}
+
+/** Relógio de produção; os comandos recebem o relógio, nunca o criam. */
+export const systemOpsClock: OpsClock = {
+  now: () => new Date().toISOString(),
+  today: () => new Date().toISOString().slice(0, 10),
+};
+
+export function todayOf(clock: OpsClock): string {
+  return clock.today?.() ?? clock.now().slice(0, 10);
+}
+
+/**
+ * Sumidouro de eventos dos comandos de `ops`.
+ *
+ * A persistência canônica do envelope é `integration.outbox`, na transação do
+ * comando (`SqlTeatEventOutbox`, CTG-0001 §2). Uma porta `TeatEventOutbox`
+ * injetada é sempre notificada; quando ela **não** é a implementação SQL
+ * canônica (decoradores, observadores e dublês), o envelope continua indo para
+ * a outbox, de modo que o invariante "evento na mesma transação do efeito"
+ * não depende de quem foi injetado. A idempotência é da própria outbox
+ * (`unique (tenant_id, idempotency_key)`), então a dupla escrita nunca duplica
+ * linha.
+ */
+export function teatEventSink(injected?: TeatEventOutbox): TeatEventOutbox {
+  const sql = new SqlTeatEventOutbox();
+  if (injected instanceof SqlTeatEventOutbox) return injected;
+  return {
+    async append(
+      tx: Transaction,
+      envelope: TeatEventEnvelope,
+    ): Promise<{ id: string }> {
+      const observed = await injected?.append(tx, envelope);
+      const persisted = await sql.append(tx, envelope);
+      return { id: persisted.id || (observed?.id ?? '') };
+    },
+  };
+}
+
+export interface TeatEnvelopeInput {
+  type: string;
+  domainEvent: string;
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+  correlationId?: string;
+}
+
+/** Envelope do `rait-events-sse-contract.md` §1; `id` é da outbox (§13.5). */
+export function teatEnvelope(input: TeatEnvelopeInput): TeatEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: input.occurredAt,
+    tenantId: input.tenantId,
+    actor: { kind: 'user', id: input.actorId },
+    correlationId: input.correlationId ?? input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
diff --git a/backend/domains/ops/core/src/storage.ts b/backend/domains/ops/core/src/storage.ts
new file mode 100644
index 0000000..061c426
--- /dev/null
+++ b/backend/domains/ops/core/src/storage.ts
@@ -0,0 +1,24 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — portas de CTG-0003 declaradas aqui só
+// pela forma; a semântica (presign, consulta de snapshot, selo do pacote
+// probatório) é daquele contrato e de TASK-0007.
+
+export interface EvidenceStoragePort {
+  presignUpload(input: {
+    objectKey: string;
+    mimeType: string;
+    sizeBytes: number;
+  }): Promise<{ uploadUrl: string; expiresAt: string }>;
+}
+
+/** Token multi-provider `{ wsdenatranRead, renach }` (CTG-0003). */
+export const SNAPSHOT_QUERY_PORTS: unique symbol = Symbol(
+  'SNAPSHOT_QUERY_PORTS',
+);
+
+export interface PackageSignerPort {
+  sign(manifestHash: string): Promise<{
+    signature: string;
+    signer: string;
+    kind: 'local-unsigned' | 'sealed';
+  }>;
+}
diff --git a/backend/domains/ops/core/src/sync-applier.ts b/backend/domains/ops/core/src/sync-applier.ts
new file mode 100644
index 0000000..f15fed7
--- /dev/null
+++ b/backend/domains/ops/core/src/sync-applier.ts
@@ -0,0 +1,48 @@
+// CTG-0002 §4.8 (R-0008, TASK-0005) — porta de aplicação de item de
+// sincronização. O protocolo de `@detran/ops-offline-sync` conhece só esta
+// interface: cada domínio de destino (AIT em M7, medidas e termo de sinais em
+// CTG-0004) publica o seu applier e o app monta a lista em
+// `backend/app/src/teat-sync.providers.ts`.
+import type { Transaction } from '@stynx-nyx/data';
+
+/**
+ * O item já materializado em `ops.sync_queue_item`, com o recibo já criado.
+ * Não carrega o payload: o applier o lê de `sync_queue_item.payload_json`
+ * pela própria transação do item (CTG-0002 §4.3 passo 4).
+ */
+export interface SyncEntityApplierItem {
+  id: string;
+  tenantId: string;
+  trafficAgencyId: string;
+  deviceId: string;
+  agentId: string;
+  entityType: string;
+  localEntityId: string;
+  idempotencyKey: string;
+  payloadHash: string;
+  createdLocallyAt: string;
+  /** Decidido pelo detector de concorrência (§4.7) antes do `apply`. */
+  concurrencySuspect: boolean;
+  /** Id da linha de `ops.sync_receipt` já criada para o item. */
+  receiptId: string;
+}
+
+/** Recusa de forma: `code` do catálogo e os caminhos do payload que falharam. */
+export interface SyncApplierRejection {
+  code: string;
+  fields: readonly string[];
+}
+
+export interface SyncEntityApplier {
+  readonly entityType: string;
+  validate(payload: unknown): SyncApplierRejection | null;
+  apply(
+    item: SyncEntityApplierItem,
+    tx: Transaction,
+  ): Promise<{ serverEntityId: string }>;
+}
+
+/** Token multi-provider da lista de appliers (CTG-0002 §4.8). */
+export const SYNC_ENTITY_APPLIERS: unique symbol = Symbol(
+  'SYNC_ENTITY_APPLIERS',
+);
diff --git a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
index db50a20..9295e58 100644
--- a/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
+++ b/backend/domains/ops/evidence/src/handwritten/evidence-custody.controller.ts
@@ -2,7 +2,7 @@ import { Body, Controller, Get, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
 import { EvidenceCustodyService } from './evidence-custody.service.js';

-@Controller('ops/evidence')
+@Controller('v1/ops/evidence')
 export class EvidenceCustodyController {
   constructor(private readonly service: EvidenceCustodyService) {}

diff --git a/backend/domains/ops/field/src/handwritten/cancel-homologation.command.ts b/backend/domains/ops/field/src/handwritten/cancel-homologation.command.ts
new file mode 100644
index 0000000..f70ecd1
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/cancel-homologation.command.ts
@@ -0,0 +1,62 @@
+// CTG-0002 §5.8 — `POST /v1/ops/field/homologations/{id}/cancel-by-audit`.
+// `cancelled` é vocabulário de modelagem (a coluna não tem check, §11.2), não
+// token de workflow.
+import { DetranError } from '@detran/shared';
+
+import {
+  inTransaction,
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type FieldDeps,
+} from './field-runtime.js';
+
+export interface CancelHomologationInput {
+  reason?: string;
+  audit_reference?: string;
+}
+
+export class CancelHomologationCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async execute(
+    id: string,
+    input: CancelHomologationInput,
+  ): Promise<Record<string, unknown>> {
+    const { tenantId } = tenantScope(this.deps);
+    if (!input.reason || String(input.reason).trim() === '')
+      throw validationFailed([{ path: 'reason', rule: 'required' }]);
+    return inTransaction(this.deps, async (scope) => {
+      const found = await scope.query<{ id: string; status: string }>(
+        `select id, status from ops.ops_homologation
+          where tenant_id = $1 and id = $2 for update`,
+        [tenantId, id],
+      );
+      const homologation = found.rows[0];
+      if (!homologation) throw tenantMismatch();
+      if (String(homologation.status) !== 'active')
+        throw new DetranError('TEAT.HOMOLOGATION_STATE_INVALID', {
+          status: 409,
+          context: {
+            homologationId: id,
+            currentState: homologation.status,
+          },
+          message: 'Homologação fora do estado que admite cancelamento.',
+        });
+      const updated = await scope.query<Record<string, unknown>>(
+        `update ops.ops_homologation
+            set status = 'cancelled', cancelled_reason = $2, updated_at = now()
+          where id = $1
+        returning id, status, cancelled_reason`,
+        [id, String(input.reason)],
+      );
+      const row = updated.rows[0]!;
+      return {
+        id: String(row.id),
+        status: String(row.status),
+        cancelled_reason: row.cancelled_reason ?? null,
+        audit_reference: input.audit_reference ?? null,
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/close-shift.command.ts b/backend/domains/ops/field/src/handwritten/close-shift.command.ts
new file mode 100644
index 0000000..2c55ff0
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/close-shift.command.ts
@@ -0,0 +1,266 @@
+// CTG-0002 §5.5 (M10) — `POST /v1/ops/mobile-bootstrap/shifts/{id}/close`.
+//
+// `ops_shift` não tem coluna `version` (§11.7/OD-T27): não há `If-Match` nem
+// `ETag`; a concorrência é contida pela guarda `status='open'` mais
+// `select … for update`.
+import { teatEventSink } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import { shiftClosedEvent } from './events.js';
+import {
+  clockOf,
+  inTransaction,
+  isoOf,
+  tenantMismatch,
+  tenantScope,
+  type FieldDeps,
+  type SqlScope,
+} from './field-runtime.js';
+
+export interface CloseShiftInput {
+  device_id?: string;
+  app_version?: string;
+  installation_id?: string;
+  protocol_version?: string;
+  ended_at: string;
+  latitude?: number;
+  longitude?: number;
+  accuracy_m?: number;
+  reason?: string;
+  numbering_reconciliations?: Array<{
+    reservation_id: string;
+    claimed_numbers: number[];
+  }>;
+}
+
+interface ShiftRow extends Record<string, unknown> {
+  id: string;
+  agent_id: string;
+  device_id: string;
+  started_at: string;
+  status: string;
+}
+
+interface ReservationRow extends Record<string, unknown> {
+  id: string;
+  range_id: string;
+  start_number: string;
+  end_number: string;
+}
+
+export class CloseShiftCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async execute(
+    shiftId: string,
+    input: CloseShiftInput,
+  ): Promise<Record<string, unknown>> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    return inTransaction(this.deps, async (scope) => {
+      const found = await scope.query<ShiftRow>(
+        `select * from ops.ops_shift where tenant_id = $1 and id = $2 for update`,
+        [tenantId, shiftId],
+      );
+      const shift = found.rows[0];
+      if (!shift) throw tenantMismatch();
+      if (String(shift.status) !== 'open')
+        throw new DetranError('TEAT.SHIFT_NOT_OPEN', {
+          status: 409,
+          context: { shiftId },
+          message: 'Turno não está aberto.',
+        });
+
+      const pending = await scope.query<{ count: string }>(
+        `select count(*)::text as count from ops.sync_queue_item
+          where tenant_id = $1 and device_id = $2 and status = 'received'
+            and created_locally_at >= $3 and created_locally_at <= $4`,
+        [tenantId, shift.device_id, shift.started_at, input.ended_at],
+      );
+      const pendingCount = Number(pending.rows[0]?.count ?? '0');
+      if (pendingCount > 0 && !input.reason)
+        throw new DetranError('TEAT.SHIFT_CLOSE_PENDING_QUEUE', {
+          status: 422,
+          context: { pendingCount },
+          message: 'Fila de sincronização pendente no fechamento do turno.',
+        });
+
+      const reservations = await this.settleReservations(
+        scope,
+        tenantId,
+        shift,
+        input,
+        now,
+      );
+      const location =
+        input.latitude === undefined && input.longitude === undefined
+          ? null
+          : {
+              latitude: input.latitude ?? null,
+              longitude: input.longitude ?? null,
+              accuracy_m: input.accuracy_m ?? null,
+            };
+      await scope.query(
+        `update ops.ops_shift
+            set status = 'closed', ended_at = $2, end_location_json = $3::jsonb,
+                updated_at = now()
+          where id = $1`,
+        [shift.id, input.ended_at, location ? JSON.stringify(location) : null],
+      );
+      await scope.query(
+        `insert into ops.ops_device_event
+           (device_id, agent_id, event_type, event_at, details_json)
+         values ($1, $2, 'shift_close', $3, $4::jsonb)`,
+        [
+          shift.device_id,
+          shift.agent_id,
+          now,
+          JSON.stringify({ shiftId: String(shift.id), pendingCount }),
+        ],
+      );
+      await teatEventSink(this.deps.outbox).append(
+        scope.transaction,
+        shiftClosedEvent(
+          { tenantId, actorId, occurredAt: now },
+          {
+            shiftId: String(shift.id),
+            agentId: String(shift.agent_id),
+            deviceId: String(shift.device_id),
+            endedAt: String(input.ended_at),
+            pendingCount,
+            reservationsClosed: reservations
+              .filter((row) => row.status === 'consumed')
+              .map((row) => row.id),
+            reservationsCancelled: reservations
+              .filter((row) => row.status === 'cancelled')
+              .map((row) => row.id),
+          },
+        ),
+      );
+      return {
+        id: String(shift.id),
+        status: 'closed',
+        ended_at: isoOf(input.ended_at),
+        reservations,
+      };
+    });
+  }
+
+  /**
+   * §5.5 — cada reserva `reserved` do turno é liquidada: com consumo aplicado
+   * fecha (`consumed`); sem nenhum, cancela (`cancelled`) e devolve a cauda à
+   * faixa quando a reserva é a cauda corrente.
+   */
+  private async settleReservations(
+    scope: SqlScope,
+    tenantId: string,
+    shift: ShiftRow,
+    input: CloseShiftInput,
+    now: string,
+  ): Promise<Array<{ id: string; status: string }>> {
+    const result = await scope.query<ReservationRow>(
+      `select id, range_id, start_number::text as start_number,
+              end_number::text as end_number
+         from ops.numbering_reservation
+        where tenant_id = $1 and shift_id = $2 and status = 'reserved'
+        for update`,
+      [tenantId, shift.id],
+    );
+    const settled: Array<{ id: string; status: string }> = [];
+    for (const reservation of result.rows) {
+      const claimed = (input.numbering_reconciliations ?? []).find(
+        (entry) => String(entry.reservation_id) === String(reservation.id),
+      );
+      if (claimed) await this.reconcile(scope, reservation, claimed);
+      const applied = await scope.query<{ number: string }>(
+        `select number::text as number from ops.numbering_consumption
+          where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'`,
+        [tenantId, reservation.id],
+      );
+      const status = applied.rows.length > 0 ? 'consumed' : 'cancelled';
+      await scope.query(
+        `update ops.numbering_reservation
+            set status = $2,
+                reconciliation_json =
+                  coalesce(reconciliation_json, '{}'::jsonb) ||
+                  jsonb_build_object('lifecycle', $3::jsonb),
+                updated_at = now()
+          where id = $1`,
+        [
+          reservation.id,
+          status,
+          JSON.stringify({
+            action: status === 'consumed' ? 'close' : 'cancel',
+            user_ref: shift.agent_id,
+            reason: input.reason ?? null,
+            at: now,
+          }),
+        ],
+      );
+      if (status === 'cancelled')
+        await this.releaseTail(
+          scope,
+          reservation,
+          applied.rows.map((row) => Number(row.number)),
+        );
+      settled.push({ id: String(reservation.id), status });
+    }
+    return settled;
+  }
+
+  private async reconcile(
+    scope: SqlScope,
+    reservation: ReservationRow,
+    claimed: { reservation_id: string; claimed_numbers: number[] },
+  ): Promise<void> {
+    const start = Number(reservation.start_number);
+    const end = Number(reservation.end_number);
+    const numbers = [...new Set(claimed.claimed_numbers.map(Number))].sort(
+      (left, right) => left - right,
+    );
+    const outOfRange = numbers.filter(
+      (number) => number < start || number > end,
+    );
+    if (outOfRange.length > 0)
+      throw new DetranError('TEAT.NUMBERING_RECONCILE_MISMATCH', {
+        status: 422,
+        context: { outOfRange },
+        message: 'Números reclamados fora do intervalo da reserva.',
+      });
+    for (const number of numbers) {
+      await scope.query(
+        `insert into ops.numbering_consumption
+           (reservation_id, range_id, number, status, reconciled_at)
+         values ($1, $2, $3, 'consumido_localmente', now())
+         on conflict (tenant_id, range_id, number) do nothing`,
+        [reservation.id, reservation.range_id, number],
+      );
+    }
+  }
+
+  private async releaseTail(
+    scope: SqlScope,
+    reservation: ReservationRow,
+    consumed: readonly number[],
+  ): Promise<void> {
+    const range = await scope.query<{ id: string; next_number: string }>(
+      `select id, next_number::text as next_number
+         from ops.ait_numbering_range where id = $1 for update`,
+      [reservation.range_id],
+    );
+    const row = range.rows[0];
+    if (!row) return;
+    const start = Number(reservation.start_number);
+    const end = Number(reservation.end_number);
+    if (Number(row.next_number) !== end + 1) return;
+    const releaseFrom =
+      (consumed.length ? Math.max(...consumed) : start - 1) + 1;
+    if (releaseFrom > end) return;
+    await scope.query(
+      `update ops.ait_numbering_range
+          set next_number = $2, status = 'active', updated_at = now()
+        where id = $1`,
+      [row.id, releaseFrom],
+    );
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/device-posture.command.ts b/backend/domains/ops/field/src/handwritten/device-posture.command.ts
new file mode 100644
index 0000000..aec5d2b
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/device-posture.command.ts
@@ -0,0 +1,124 @@
+// CTG-0002 §5.9 (M13, parte `ops`) — `block` · `unblock` · `wipe` do
+// dispositivo operacional.
+//
+// `wipe` grava `status='blocked'` mais o recibo no `ops_device_event`: não
+// existe token de status `wiped` em nenhuma fonte (§11.10/OD-T28) e não se
+// inventa token. `unblock` não publica evento: o route contract §8 não tem
+// token para ele (§11.8/OD-T21).
+import { teatEventSink } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import { devicePostureChangedEvent } from './events.js';
+import {
+  clockOf,
+  inTransaction,
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type FieldDeps,
+} from './field-runtime.js';
+
+export type PostureAction = 'block' | 'unblock' | 'wipe';
+
+export interface DevicePostureInput {
+  reason?: string;
+}
+
+const TARGET_STATUS: Readonly<Record<PostureAction, string>> = {
+  block: 'blocked',
+  unblock: 'authorized',
+  wipe: 'blocked',
+};
+
+export class DevicePostureCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  block(deviceId: string, input: DevicePostureInput) {
+    return this.execute(deviceId, input, 'block');
+  }
+
+  unblock(deviceId: string, input: DevicePostureInput) {
+    return this.execute(deviceId, input, 'unblock');
+  }
+
+  wipe(deviceId: string, input: DevicePostureInput) {
+    return this.execute(deviceId, input, 'wipe');
+  }
+
+  async execute(
+    deviceId: string,
+    input: DevicePostureInput,
+    action: PostureAction,
+  ): Promise<Record<string, unknown>> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    if (!input.reason || String(input.reason).trim() === '')
+      throw validationFailed([{ path: 'reason', rule: 'required' }]);
+
+    return inTransaction(this.deps, async (scope) => {
+      const found = await scope.query<{ id: string; status: string }>(
+        `select id, status from ops.ops_operational_device
+          where tenant_id = $1 and id = $2 for update`,
+        [tenantId, deviceId],
+      );
+      const device = found.rows[0];
+      if (!device) throw tenantMismatch();
+      const fromStatus = String(device.status);
+      if (action === 'unblock' && fromStatus !== 'blocked')
+        throw new DetranError('TEAT.DEVICE_BLOCKED', {
+          status: 409,
+          context: { deviceId, status: fromStatus },
+          message: 'Dispositivo não está bloqueado.',
+        });
+      const toStatus = TARGET_STATUS[action];
+      await scope.query(
+        `update ops.ops_operational_device set status = $2, updated_at = now()
+          where id = $1`,
+        [deviceId, toStatus],
+      );
+      if (action === 'block' || action === 'wipe')
+        await scope.query(
+          `update ops.numbering_reservation set status = 'blocked', updated_at = now()
+            where tenant_id = $1 and device_id = $2 and status = 'reserved'`,
+          [tenantId, deviceId],
+        );
+      const event = await scope.query<{ id: string }>(
+        `insert into ops.ops_device_event
+           (id, device_id, agent_id, event_type, event_at, details_json)
+         values (gen_random_uuid(), $1, null, $2, $3, '{}'::jsonb)
+         returning id`,
+        [deviceId, action, now],
+      );
+      const eventId = event.rows[0]!.id;
+      await scope.query(
+        `update ops.ops_device_event set details_json = $2::jsonb where id = $1`,
+        [
+          eventId,
+          JSON.stringify({ reason: String(input.reason), receiptId: eventId }),
+        ],
+      );
+      if (action !== 'unblock') {
+        const posture = await scope.query<{ count: string }>(
+          `select count(*)::text as count from ops.ops_device_event
+            where tenant_id = $1 and device_id = $2`,
+          [tenantId, deviceId],
+        );
+        await teatEventSink(this.deps.outbox).append(
+          scope.transaction,
+          devicePostureChangedEvent(
+            { tenantId, actorId, occurredAt: now },
+            {
+              deviceId,
+              agentId: null,
+              fromStatus,
+              toStatus,
+              eventType: action,
+            },
+            Number(posture.rows[0]?.count ?? '1'),
+          ),
+        );
+      }
+      return { id: deviceId, status: toStatus, event_id: eventId };
+    });
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/events.ts b/backend/domains/ops/field/src/handwritten/events.ts
new file mode 100644
index 0000000..33868f2
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/events.ts
@@ -0,0 +1,184 @@
+// CTG-0002 §7 (M16) — envelopes publicados por `@detran/ops-field`.
+// Mesmo formato de `rait-events-sse-contract.md` §1 e do molde de
+// `inf/ait/src/handwritten/events.ts` (`additionalProperties: false` ⇒
+// `strictObject`); o mapa é chaveado por `domainEvent` porque `shift.changed`
+// cobre abertura e fechamento de turno.
+import { teatEnvelope } from '@detran/ops-core';
+import type { TeatEventEnvelope } from '@detran/shared';
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+export const SHIFT_CHANGED_TYPE = 'shift.changed';
+export const DEVICE_POSTURE_CHANGED_TYPE = 'device.posture-changed';
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: ZodType,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const turnoAberto = envelope(
+  SHIFT_CHANGED_TYPE,
+  'TURNO_ABERTO',
+  'shift',
+  z.strictObject({
+    shiftId: z.string(),
+    agentId: z.string(),
+    deviceId: z.string(),
+    operationalUnitId: z.string().nullable(),
+    startedAt: z.iso.datetime(),
+  }),
+);
+
+const turnoFechado = envelope(
+  SHIFT_CHANGED_TYPE,
+  'TURNO_FECHADO',
+  'shift',
+  z.strictObject({
+    shiftId: z.string(),
+    agentId: z.string(),
+    deviceId: z.string(),
+    endedAt: z.iso.datetime(),
+    pendingCount: z.int().min(0),
+    reservationsClosed: z.array(z.string()),
+    reservationsCancelled: z.array(z.string()),
+  }),
+);
+
+const dispositivoBloqueado = envelope(
+  DEVICE_POSTURE_CHANGED_TYPE,
+  'DISPOSITIVO_BLOQUEADO',
+  'operational-device',
+  z.strictObject({
+    deviceId: z.string(),
+    agentId: z.string().nullable(),
+    fromStatus: z.string(),
+    toStatus: z.string(),
+    eventType: z.string(),
+  }),
+);
+
+/** Os três `domainEvent` publicados pelo grupo (CTG-0002 §7). */
+export interface FieldEventSchemas extends Record<string, ZodType> {
+  TURNO_ABERTO: ZodType;
+  TURNO_FECHADO: ZodType;
+  DISPOSITIVO_BLOQUEADO: ZodType;
+}
+
+export const FIELD_EVENT_SCHEMAS: FieldEventSchemas = {
+  TURNO_ABERTO: turnoAberto,
+  TURNO_FECHADO: turnoFechado,
+  DISPOSITIVO_BLOQUEADO: dispositivoBloqueado,
+};
+
+/** Falha cedo quando um envelope foge da forma declarada da §7. */
+export function assertEventShape(envelope: TeatEventEnvelope): void {
+  const schema = FIELD_EVENT_SCHEMAS[envelope.domainEvent];
+  if (!schema)
+    throw new Error(`Unknown field domain event ${envelope.domainEvent}`);
+  schema.parse(envelope);
+}
+
+export interface EventScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+export function shiftOpenedEvent(
+  scope: EventScope,
+  data: {
+    shiftId: string;
+    agentId: string;
+    deviceId: string;
+    operationalUnitId: string | null;
+    startedAt: string;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: SHIFT_CHANGED_TYPE,
+    domainEvent: 'TURNO_ABERTO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'shift', id: data.shiftId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function shiftClosedEvent(
+  scope: EventScope,
+  data: {
+    shiftId: string;
+    agentId: string;
+    deviceId: string;
+    endedAt: string;
+    pendingCount: number;
+    reservationsClosed: string[];
+    reservationsCancelled: string[];
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: SHIFT_CHANGED_TYPE,
+    domainEvent: 'TURNO_FECHADO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    // O turno fecha na sua segunda versão: a chave de idempotência da outbox é
+    // `type:aggregateId:version`, então abertura e fechamento precisam de
+    // versões distintas para coexistirem.
+    aggregate: { kind: 'shift', id: data.shiftId, version: 2 },
+    data: { ...data },
+  });
+}
+
+export function devicePostureChangedEvent(
+  scope: EventScope,
+  data: {
+    deviceId: string;
+    agentId: string | null;
+    fromStatus: string;
+    toStatus: string;
+    eventType: string;
+  },
+  aggregateVersion = 1,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: DEVICE_POSTURE_CHANGED_TYPE,
+    domainEvent: 'DISPOSITIVO_BLOQUEADO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'operational-device',
+      id: data.deviceId,
+      version: aggregateVersion,
+    },
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/ops/field/src/handwritten/field-commands.controller.ts b/backend/domains/ops/field/src/handwritten/field-commands.controller.ts
new file mode 100644
index 0000000..e3de99a
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/field-commands.controller.ts
@@ -0,0 +1,71 @@
+// CTG-0002 §5.7–§5.9 (R-0008, TASK-0005) — postura do dispositivo e ciclo da
+// homologação, em `v1/ops/field`.
+import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+
+import { FieldCommands } from './field-commands.js';
+import type { CancelHomologationInput } from './cancel-homologation.command.js';
+import type { DevicePostureInput } from './device-posture.command.js';
+import type { RenewHomologationInput } from './renew-homologation.command.js';
+
+@Controller('v1/ops/field')
+export class FieldCommandsController {
+  constructor(private readonly commands: FieldCommands) {}
+
+  @Post('devices/:id/block')
+  @HttpCode(200)
+  @Resource('ops:operational-device')
+  @Action('block')
+  @Audit({
+    action: 'OPS_DEVICE_BLOCK',
+    entity: 'ops.ops_operational_device',
+  })
+  block(@Param('id') id: string, @Body() body: DevicePostureInput) {
+    return this.commands.devicePosture.block(id, body);
+  }
+
+  @Post('devices/:id/unblock')
+  @HttpCode(200)
+  @Resource('ops:operational-device')
+  @Action('unblock')
+  @Audit({
+    action: 'OPS_DEVICE_UNBLOCK',
+    entity: 'ops.ops_operational_device',
+  })
+  unblock(@Param('id') id: string, @Body() body: DevicePostureInput) {
+    return this.commands.devicePosture.unblock(id, body);
+  }
+
+  @Post('devices/:id/wipe')
+  @HttpCode(200)
+  @Resource('ops:operational-device')
+  @Action('wipe')
+  @Audit({
+    action: 'OPS_DEVICE_WIPE',
+    entity: 'ops.ops_operational_device',
+  })
+  wipe(@Param('id') id: string, @Body() body: DevicePostureInput) {
+    return this.commands.devicePosture.wipe(id, body);
+  }
+
+  @Post('homologations/:id/renew')
+  @HttpCode(200)
+  @Resource('ops:homologation')
+  @Action('renew')
+  @Audit({ action: 'OPS_HOMOLOGATION_RENEW', entity: 'ops.ops_homologation' })
+  renew(@Param('id') id: string, @Body() body: RenewHomologationInput) {
+    return this.commands.renewHomologation.execute(id, body);
+  }
+
+  @Post('homologations/:id/cancel-by-audit')
+  @HttpCode(200)
+  @Resource('ops:homologation')
+  @Action('cancel-by-audit')
+  @Audit({ action: 'OPS_HOMOLOGATION_CANCEL', entity: 'ops.ops_homologation' })
+  cancelByAudit(
+    @Param('id') id: string,
+    @Body() body: CancelHomologationInput,
+  ) {
+    return this.commands.cancelHomologation.execute(id, body);
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/field-commands.ts b/backend/domains/ops/field/src/handwritten/field-commands.ts
new file mode 100644
index 0000000..c040399
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/field-commands.ts
@@ -0,0 +1,31 @@
+// CTG-0002 §5 (R-0008, TASK-0005) — fachada dos comandos manuscritos de campo.
+// Um único provider manuscrito no módulo gerado; cada comando continua
+// construtível isolado nos testes.
+import { CancelHomologationCommand } from './cancel-homologation.command.js';
+import { CloseShiftCommand } from './close-shift.command.js';
+import { DevicePostureCommand } from './device-posture.command.js';
+import { HandoffSessionCommand } from './handoff-session.command.js';
+import { MobileBootstrapService } from './mobile-bootstrap.service.js';
+import { OpenShiftCommand } from './open-shift.command.js';
+import { RenewHomologationCommand } from './renew-homologation.command.js';
+import type { FieldDeps } from './field-runtime.js';
+
+export class FieldCommands {
+  readonly bootstrap: MobileBootstrapService;
+  readonly openShift: OpenShiftCommand;
+  readonly closeShift: CloseShiftCommand;
+  readonly handoffSession: HandoffSessionCommand;
+  readonly devicePosture: DevicePostureCommand;
+  readonly renewHomologation: RenewHomologationCommand;
+  readonly cancelHomologation: CancelHomologationCommand;
+
+  constructor(deps: FieldDeps) {
+    this.bootstrap = new MobileBootstrapService(deps);
+    this.openShift = new OpenShiftCommand(deps);
+    this.closeShift = new CloseShiftCommand(deps);
+    this.handoffSession = new HandoffSessionCommand(deps);
+    this.devicePosture = new DevicePostureCommand(deps);
+    this.renewHomologation = new RenewHomologationCommand(deps);
+    this.cancelHomologation = new CancelHomologationCommand(deps);
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/field-operations.controller.ts b/backend/domains/ops/field/src/handwritten/field-operations.controller.ts
index 8e2c3e0..78af482 100644
--- a/backend/domains/ops/field/src/handwritten/field-operations.controller.ts
+++ b/backend/domains/ops/field/src/handwritten/field-operations.controller.ts
@@ -2,7 +2,10 @@ import { Body, Controller, Get, Param, Post } from '@nestjs/common';
 import { Action, Audit, Resource } from '@detran/shared';
 import { FieldOperationsService } from './field-operations.service.js';

-@Controller('ops')
+// CTG-0002 §1 — a superfície manuscrita de `ops` monta em `v1/ops/…`, como
+// todo controlador gerado e o route contract §4; uma rota `/ops/agents` nunca
+// casaria com a matriz `ops:*` da política (M18).
+@Controller('v1/ops/field')
 export class FieldOperationsController {
   constructor(private readonly service: FieldOperationsService) {}

diff --git a/backend/domains/ops/field/src/handwritten/field-runtime.ts b/backend/domains/ops/field/src/handwritten/field-runtime.ts
new file mode 100644
index 0000000..0671ed1
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/field-runtime.ts
@@ -0,0 +1,123 @@
+// CTG-0002 §5 (R-0008, TASK-0005) — dependências comuns dos comandos
+// manuscritos de `@detran/ops-field` e utilidades de data/tenant.
+import {
+  asQueryable,
+  systemOpsClock,
+  type OpsClock,
+  type OpsRow,
+  type OpsRowStore,
+  type SqlQueryable,
+} from '@detran/ops-core';
+import { DetranError, type TeatEventOutbox } from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+
+export interface DatabasePort {
+  tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T>;
+}
+
+export interface RequestContextPort {
+  hasActiveContext(): boolean;
+  snapshot(): { tenantId?: string; actorId?: string };
+}
+
+export interface ParameterPort {
+  get(
+    key: string,
+    options?: Record<string, unknown>,
+  ): Promise<{ value_json?: unknown; source_pending?: boolean }>;
+}
+
+export interface FieldDeps {
+  database: DatabasePort;
+  requestContext: RequestContextPort;
+  repositories: Partial<Record<string, OpsRowStore>>;
+  parameters?: ParameterPort;
+  outbox?: TeatEventOutbox;
+  clock?: OpsClock;
+}
+
+export function clockOf(deps: FieldDeps): OpsClock {
+  return deps.clock ?? systemOpsClock;
+}
+
+export function todayOf(deps: FieldDeps): string {
+  const clock = clockOf(deps);
+  return clock.today?.() ?? clock.now().slice(0, 10);
+}
+
+export function storeOf(deps: FieldDeps, name: string): OpsRowStore {
+  const store = deps.repositories[name];
+  if (!store) throw new Error(`Unbound ops row store: ${name}`);
+  return store;
+}
+
+export function tenantScope(deps: FieldDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Active tenant context is required');
+  const snapshot = deps.requestContext.snapshot();
+  if (!snapshot.tenantId) throw new Error('Active tenant context is required');
+  return { tenantId: snapshot.tenantId, actorId: snapshot.actorId ?? '' };
+}
+
+export function ownedBy(rows: OpsRow[], tenantId: string): OpsRow[] {
+  return rows.filter(
+    (row) => !row.tenant_id || String(row.tenant_id) === tenantId,
+  );
+}
+
+/** `date` do Postgres chega como `Date`; a comparação de vigência é textual. */
+export function dateOf(value: unknown): string | null {
+  if (value === null || value === undefined) return null;
+  if (value instanceof Date) return localDate(value);
+  return String(value).slice(0, 10);
+}
+
+function localDate(value: Date): string {
+  const offset = value.getTimezoneOffset() * 60_000;
+  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
+}
+
+export function isoOf(value: unknown): string | null {
+  if (value === null || value === undefined) return null;
+  if (value instanceof Date) return value.toISOString();
+  return String(value);
+}
+
+export function tenantMismatch(): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    message: 'Recurso não pertence ao tenant da requisição.',
+  });
+}
+
+export function validationFailed(
+  fields: ReadonlyArray<Record<string, unknown>>,
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 422,
+    context: { fields },
+    message: 'Dados inválidos para o comando.',
+  });
+}
+
+export interface SqlScope {
+  query: SqlQueryable['query'];
+  transaction: Transaction;
+}
+
+export function inTransaction<T>(
+  deps: FieldDeps,
+  work: (scope: SqlScope) => Promise<T>,
+): Promise<T> {
+  return deps.database.tx(async (tx) => {
+    const queryable = asQueryable(tx);
+    if (!queryable) throw new Error('Field commands require a SQL transaction');
+    return work({
+      query: queryable.query.bind(queryable),
+      transaction: tx as Transaction,
+    });
+  });
+}
diff --git a/backend/domains/ops/field/src/handwritten/handoff-session.command.ts b/backend/domains/ops/field/src/handwritten/handoff-session.command.ts
new file mode 100644
index 0000000..bb72976
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/handoff-session.command.ts
@@ -0,0 +1,151 @@
+// CTG-0002 §5.6 (M10, D-01/AC-TEAT-012-4) — `POST /v1/ops/mobile-bootstrap/
+// sessions/handoff`.
+//
+// O `reason` é a **declaração de incidente** que distingue a troca autorizada
+// da anomalia de sessão: sem ela, dois dispositivos do mesmo agente são
+// concorrência ([RN-TEAT-111]); com ela, a retaguarda reconhece a troca. O
+// evento não é publicado: o route contract §8 não tem token para o handoff
+// (§11.8/OD-T21); o efeito observável é a linha de `ops_session_handoff`, que é
+// o que o detector de concorrência lê.
+import type { OpsRow } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import {
+  clockOf,
+  ownedBy,
+  storeOf,
+  tenantScope,
+  validationFailed,
+  type FieldDeps,
+} from './field-runtime.js';
+
+export interface HandoffSessionInput {
+  failed_device_id: string;
+  reason?: string;
+  new_device_id?: string;
+  location_json?: Record<string, unknown>;
+}
+
+export interface HandoffSessionResponse {
+  handoff_id: string;
+  shift_id: string;
+  failed_device_id: string;
+  new_device_id: string | null;
+  cancelled_reservations: string[];
+  handed_off_at: string;
+}
+
+export class HandoffSessionCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async execute(input: HandoffSessionInput): Promise<HandoffSessionResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    if (!input.reason || String(input.reason).trim() === '')
+      throw validationFailed([{ path: 'reason', rule: 'required' }]);
+    const failedDeviceId = String(input.failed_device_id);
+
+    const agents = ownedBy(await storeOf(this.deps, 'agents').list(), tenantId);
+    const agent =
+      agents.find((row) => String(row.user_ref) === actorId) ??
+      agents.find((row) => String(row.id) === actorId);
+    const agentId = agent ? String(agent.id) : actorId;
+
+    const shifts = storeOf(this.deps, 'shifts');
+    const shift = ownedBy(await shifts.list(), tenantId).find(
+      (row) =>
+        String(row.status) === 'open' &&
+        String(row.device_id) === failedDeviceId &&
+        String(row.agent_id) === agentId,
+    );
+    if (!shift)
+      throw new DetranError('TEAT.SHIFT_NOT_OPEN', {
+        status: 409,
+        context: { deviceId: failedDeviceId },
+        message: 'Nenhum turno aberto do agente no dispositivo informado.',
+      });
+
+    const newDeviceId = input.new_device_id
+      ? String(input.new_device_id)
+      : null;
+    if (newDeviceId) await this.assertUsable(tenantId, newDeviceId);
+
+    const handoff = await storeOf(this.deps, 'handoffs').create({
+      shift_id: String(shift.id),
+      from_agent_id: agentId,
+      to_agent_id: agentId,
+      handed_off_at: now,
+      details_json: {
+        failed_device_id: failedDeviceId,
+        reason: String(input.reason),
+        new_device_id: newDeviceId,
+        location_json: input.location_json ?? null,
+      },
+    });
+    await storeOf(this.deps, 'deviceEvents').create({
+      device_id: failedDeviceId,
+      agent_id: agentId,
+      event_type: 'handoff',
+      event_at: now,
+      location_json: input.location_json ?? null,
+      details_json: {
+        shiftId: String(shift.id),
+        newDeviceId,
+        reason: String(input.reason),
+      },
+    });
+
+    // [RN-TEAT-111]: dois dispositivos aptos a emitir nunca coexistem.
+    const reservations = storeOf(this.deps, 'reservations');
+    const cancelled: string[] = [];
+    for (const row of ownedBy(await reservations.list(), tenantId)) {
+      if (
+        String(row.status) !== 'reserved' ||
+        String(row.device_id) !== failedDeviceId
+      )
+        continue;
+      await reservations.update(String(row.id), { status: 'cancelled' });
+      cancelled.push(String(row.id));
+    }
+    if (newDeviceId)
+      await shifts.update(String(shift.id), { device_id: newDeviceId });
+
+    return {
+      handoff_id: String(handoff.id),
+      shift_id: String(shift.id),
+      failed_device_id: failedDeviceId,
+      new_device_id: newDeviceId,
+      cancelled_reservations: cancelled,
+      handed_off_at: now,
+    };
+  }
+
+  private async assertUsable(
+    tenantId: string,
+    deviceId: string,
+  ): Promise<OpsRow> {
+    const device = ownedBy(
+      await storeOf(this.deps, 'devices').list(),
+      tenantId,
+    ).find((row) => String(row.id) === deviceId);
+    if (!device)
+      throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
+        status: 403,
+        context: { deviceId, status: null },
+        message: 'Dispositivo de destino não autorizado.',
+      });
+    if (device.tamper_flag === true)
+      throw new DetranError('TEAT.DEVICE_TAMPER_DETECTED', {
+        status: 403,
+        context: { deviceId, status: device.status ?? null },
+        message: 'Dispositivo de destino com indício de adulteração.',
+      });
+    if (String(device.status) !== 'authorized')
+      throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
+        status: 403,
+        context: { deviceId, status: device.status ?? null },
+        message: 'Dispositivo de destino não autorizado.',
+      });
+    return device;
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/mobile-bootstrap.controller.ts b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.controller.ts
new file mode 100644
index 0000000..87711e8
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.controller.ts
@@ -0,0 +1,54 @@
+// CTG-0002 §1, §5.1, §5.4–§5.6 (R-0008, TASK-0005) — bootstrap móvel, turno e
+// handoff de sessão, no prefixo `v1/ops/…` do route contract §4.
+import {
+  Body,
+  Controller,
+  Get,
+  HttpCode,
+  Param,
+  Post,
+  Query,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+
+import { FieldCommands } from './field-commands.js';
+import type { CloseShiftInput } from './close-shift.command.js';
+import type { HandoffSessionInput } from './handoff-session.command.js';
+import type { MobileBootstrapQuery } from './mobile-bootstrap.service.js';
+import type { OpenShiftInput } from './open-shift.command.js';
+
+@Controller('v1/ops/mobile-bootstrap')
+@Resource('ops:operational-device')
+export class MobileBootstrapController {
+  constructor(private readonly commands: FieldCommands) {}
+
+  @Get()
+  @Action('read')
+  bootstrap(@Query() query: MobileBootstrapQuery) {
+    return this.commands.bootstrap.read(query);
+  }
+
+  @Post('shifts')
+  @Resource('ops:shift')
+  @Action('create')
+  @Audit({ action: 'OPS_SHIFT_OPEN', entity: 'ops.ops_shift' })
+  openShift(@Body() body: OpenShiftInput) {
+    return this.commands.openShift.execute(body);
+  }
+
+  @Post('shifts/:id/close')
+  @HttpCode(200)
+  @Action('close-shift')
+  @Audit({ action: 'OPS_SHIFT_CLOSE', entity: 'ops.ops_shift' })
+  closeShift(@Param('id') id: string, @Body() body: CloseShiftInput) {
+    return this.commands.closeShift.execute(id, body);
+  }
+
+  @Post('sessions/handoff')
+  @HttpCode(200)
+  @Action('handoff-session')
+  @Audit({ action: 'OPS_SESSION_HANDOFF', entity: 'ops.ops_session_handoff' })
+  handoff(@Body() body: HandoffSessionInput) {
+    return this.commands.handoffSession.execute(body);
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/mobile-bootstrap.provider.ts b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.provider.ts
new file mode 100644
index 0000000..d5fc310
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.provider.ts
@@ -0,0 +1,100 @@
+// CTG-0002 §11 (R-0008, TASK-0005) — wiring dos comandos de campo dentro do
+// módulo gerado, para que o pacote continue testável isolado.
+import type { Provider } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  OpsTenantRepository,
+  systemOpsClock,
+  type OpsRow,
+  type OpsRowStore,
+} from '@detran/ops-core';
+import { MobileNormativePackageRepository } from '@detran/inf-normative';
+import { OpsParameterService } from '@detran/ops-parameter';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import { FieldCommands } from './field-commands.js';
+import type { FieldDeps, ParameterPort } from './field-runtime.js';
+
+const OPS_TABLES = {
+  devices: 'ops.ops_operational_device',
+  agents: 'ops.ops_agent_profile',
+  homologations: 'ops.ops_homologation',
+  appVersions: 'ops.ops_application_version',
+  shifts: 'ops.ops_shift',
+  handoffs: 'ops.ops_session_handoff',
+  reservations: 'ops.numbering_reservation',
+  units: 'ops.agency_unit',
+  teams: 'ops.ops_team',
+  patrolVehicles: 'ops.ops_patrol_vehicle',
+  operations: 'ops.ops_operation',
+  measurementInstruments: 'ops.ops_measurement_instrument',
+  deviceEvents: 'ops.ops_device_event',
+} as const;
+
+export function fieldDeps(
+  database: Database,
+  requestContext: RequestContext,
+  parameters: ParameterPort,
+): FieldDeps {
+  return {
+    database,
+    requestContext,
+    repositories: {
+      ...Object.fromEntries(
+        Object.entries(OPS_TABLES).map(([name, table]) => [
+          name,
+          new OpsTenantRepository(database, requestContext, table),
+        ]),
+      ),
+      // O bootstrap só **lê** o pacote normativo publicado (§6): o domínio
+      // normativo é o dono da tabela (ADR-0001) e entra pelo repositório dele.
+      packages: readOnlyStore(
+        new MobileNormativePackageRepository(database, requestContext),
+      ),
+    },
+    parameters,
+    outbox: new SqlTeatEventOutbox(),
+    clock: systemOpsClock,
+  };
+}
+
+/**
+ * Adapta um repositório gerado (`findAll`/`findOne`) à porta de leitura que os
+ * comandos de campo usam. A escrita não é oferecida: o bootstrap não escreve
+ * em domínio de terceiro.
+ */
+function readOnlyStore(repository: {
+  findAll(): Promise<unknown[]>;
+  findOne(id: string): Promise<unknown>;
+}): OpsRowStore {
+  return {
+    list: async () => (await repository.findAll()) as OpsRow[],
+    find: async (id: string) =>
+      (await repository.findOne(id).catch(() => undefined)) as
+        OpsRow | undefined,
+    create: () => {
+      throw new Error('ops/field does not write normative packages');
+    },
+    update: () => {
+      throw new Error('ops/field does not write normative packages');
+    },
+  };
+}
+
+export const MOBILE_BOOTSTRAP_PROVIDER: Provider = {
+  provide: FieldCommands,
+  inject: [Database, RequestContext, OpsParameterService],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    parameters: OpsParameterService,
+  ) =>
+    new FieldCommands(
+      fieldDeps(
+        database,
+        requestContext,
+        parameters as unknown as ParameterPort,
+      ),
+    ),
+};
diff --git a/backend/domains/ops/field/src/handwritten/mobile-bootstrap.service.ts b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.service.ts
new file mode 100644
index 0000000..9e9a855
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/mobile-bootstrap.service.ts
@@ -0,0 +1,440 @@
+// CTG-0002 §5.1–§5.3 e §6 (M9, R-0008, TASK-0005) — `GET /v1/ops/
+// mobile-bootstrap`: o retrato que o coletor recebe antes de operar.
+//
+// Os dois campos de prazo do `snapshot` saem **null**: o valor da origem é
+// constante interna sem linha no `parameter-catalogue.md` (OD-T14) e não se
+// inventa prazo.
+import { createHash } from 'node:crypto';
+import type { OpsRow } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import {
+  dateOf,
+  isoOf,
+  ownedBy,
+  storeOf,
+  tenantScope,
+  todayOf,
+  clockOf,
+  type FieldDeps,
+} from './field-runtime.js';
+
+/** Constante da origem `mobile-bootstrap.service.ts`, preservada (§5.2). */
+export const MOBILE_BOOTSTRAP_PROTOCOL_VERSION = 'teat-mobile-bootstrap.v1';
+const SNAPSHOT_AUTHORITY = 'server-snapshot';
+/** Chave do `parameter-catalogue.md` §TEAT (H.55). */
+const HOMOLOGATION_BEHAVIOR_KEY = 'teat.homologation.expired_behavior';
+
+/** §5.3 — os dez bloqueadores saem exatamente nesta ordem. */
+export const BLOCKER_ORDER = [
+  'SESSION_NOT_EXCLUSIVE',
+  'DEVICE_NOT_AUTHORIZED',
+  'DEVICE_TAMPER_DETECTED',
+  'DEVICE_NOT_HOMOLOGATED',
+  'APP_VERSION_NOT_ALLOWED',
+  'NORMATIVE_PACKAGE_MISSING',
+  'NUMBERING_RESERVATION_REQUIRED',
+  'AGENT_NOT_ACTIVE',
+  'AGENT_NOT_IN_UNIT',
+  'SHIFT_ALREADY_OPEN_ELSEWHERE',
+] as const;
+
+export interface MobileBootstrapQuery {
+  device_id: string;
+  installation_id?: string;
+  app_version: string;
+  protocol_version?: string;
+}
+
+export interface BootstrapWorld {
+  device: OpsRow;
+  agent?: OpsRow;
+  agencyId: string;
+  homologations: OpsRow[];
+  appVersions: OpsRow[];
+  packages: OpsRow[];
+  reservations: OpsRow[];
+  shifts: OpsRow[];
+  handoffs: OpsRow[];
+}
+
+export function scopeMismatch(): DetranError {
+  return new DetranError('TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH', {
+    status: 403,
+    message: 'Dispositivo fora do escopo do principal.',
+  });
+}
+
+export class MobileBootstrapService {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async read(query: MobileBootstrapQuery): Promise<Record<string, unknown>> {
+    const requested =
+      query.protocol_version ?? MOBILE_BOOTSTRAP_PROTOCOL_VERSION;
+    if (requested !== MOBILE_BOOTSTRAP_PROTOCOL_VERSION)
+      throw new DetranError('TEAT.PROTOCOL_VERSION_UNSUPPORTED', {
+        status: 426,
+        context: { supported: [MOBILE_BOOTSTRAP_PROTOCOL_VERSION] },
+        message: 'Versão de protocolo do bootstrap não suportada.',
+      });
+    const world = await this.world(query);
+    const today = todayOf(this.deps);
+    const now = clockOf(this.deps).now();
+    const blockers = this.blockers(world, query, today, now);
+    const warnings = await this.warnings(world, today);
+    const capabilities = this.capabilities(world, blockers, query);
+    const normativePackage = publishedPackage(world.packages);
+    return {
+      protocolVersion: MOBILE_BOOTSTRAP_PROTOCOL_VERSION,
+      requestedProtocolVersion: requested,
+      snapshot: {
+        capturedAt: now,
+        // OD-T14: sem linha no catálogo, não há prazo de validade do retrato.
+        validUntil: null,
+        maxAgeSeconds: null,
+        authority: SNAPSHOT_AUTHORITY,
+      },
+      context: {
+        tenantId: tenantScope(this.deps).tenantId,
+        trafficAgencyId: world.agencyId,
+        agent: world.agent
+          ? {
+              id: String(world.agent.id),
+              operationalUnitId: world.agent.operational_unit_id ?? null,
+              status: world.agent.functional_status ?? null,
+            }
+          : null,
+        device: {
+          id: String(world.device.id),
+          status: world.device.status ?? null,
+          homologated:
+            activeHomologations(world.homologations).length > 0 &&
+            allowedVersions(world.appVersions, query.app_version, today)
+              .length > 0,
+          tamperDetected: world.device.tamper_flag === true,
+          appVersion: query.app_version,
+        },
+        activeShift: this.activeShift(world, query),
+        session: this.session(world, query),
+      },
+      catalog: await this.catalog(world),
+      normativePackage: normativePackage
+        ? {
+            id: String(normativePackage.id),
+            catalogId: normativePackage.catalog_id ?? null,
+            version: normativePackage.package_version ?? null,
+            manifestHash: normativePackage.manifest_hash ?? null,
+            status: normativePackage.status ?? null,
+            publishedAt: isoOf(normativePackage.published_at),
+            validUntil: dateOf(normativePackage.valid_until),
+            contentPath: `/v1/inf/normative/mobile-packages/${String(normativePackage.id)}/content`,
+          }
+        : null,
+      numberingReservations: validReservations(world, query, now).map(
+        (row) => ({
+          id: String(row.id),
+          rangeId: row.range_id ?? null,
+          startNumber: Number(row.start_number),
+          endNumber: Number(row.end_number),
+          validUntil: isoOf(row.valid_until),
+          status: row.status ?? null,
+        }),
+      ),
+      readiness: {
+        preShiftReady: capabilities.canOpenShift,
+        offlineReady: capabilities.canOperateOffline,
+        blockers,
+        warnings,
+      },
+      capabilities,
+    };
+  }
+
+  /** §5.2 — escopo e identidade: nunca 404, para não revelar existência. */
+  private async world(query: MobileBootstrapQuery): Promise<BootstrapWorld> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const devices = ownedBy(
+      await storeOf(this.deps, 'devices').list(),
+      tenantId,
+    );
+    const device = devices.find(
+      (row) => String(row.id) === String(query.device_id),
+    );
+    if (!device) throw scopeMismatch();
+    if (query.installation_id) {
+      const digest = `sha256:${createHash('sha256').update(String(query.installation_id)).digest('hex')}`;
+      if (String(device.hardware_identifier_hash) !== digest)
+        throw scopeMismatch();
+    }
+    const agencyId = String(device.traffic_agency_id);
+    const agents = ownedBy(await storeOf(this.deps, 'agents').list(), tenantId);
+    const agent =
+      agents.find((row) => String(row.user_ref) === actorId) ??
+      agents.find((row) => String(row.id) === actorId);
+    const ofAgency = (rows: OpsRow[]): OpsRow[] =>
+      rows.filter(
+        (row) =>
+          !row.traffic_agency_id || String(row.traffic_agency_id) === agencyId,
+      );
+    return {
+      device,
+      agent,
+      agencyId,
+      homologations: ofAgency(
+        ownedBy(await storeOf(this.deps, 'homologations').list(), tenantId),
+      ),
+      appVersions: ownedBy(
+        await storeOf(this.deps, 'appVersions').list(),
+        tenantId,
+      ),
+      packages: ofAgency(
+        ownedBy(await storeOf(this.deps, 'packages').list(), tenantId),
+      ),
+      reservations: ownedBy(
+        await storeOf(this.deps, 'reservations').list(),
+        tenantId,
+      ),
+      shifts: ownedBy(await storeOf(this.deps, 'shifts').list(), tenantId),
+      handoffs: ownedBy(await storeOf(this.deps, 'handoffs').list(), tenantId),
+    };
+  }
+
+  private blockers(
+    world: BootstrapWorld,
+    query: MobileBootstrapQuery,
+    today: string,
+    now: string,
+  ): string[] {
+    const blockers: string[] = [];
+    const elsewhere = openShiftElsewhere(world, query);
+    const covered = elsewhere ? hasHandoff(world, elsewhere) : false;
+    if (elsewhere && !covered) blockers.push('SESSION_NOT_EXCLUSIVE');
+    if (String(world.device.status) !== 'authorized')
+      blockers.push('DEVICE_NOT_AUTHORIZED');
+    if (world.device.tamper_flag === true)
+      blockers.push('DEVICE_TAMPER_DETECTED');
+    if (activeHomologations(world.homologations).length === 0)
+      blockers.push('DEVICE_NOT_HOMOLOGATED');
+    if (
+      allowedVersions(world.appVersions, query.app_version, today).length === 0
+    )
+      blockers.push('APP_VERSION_NOT_ALLOWED');
+    if (!publishedPackage(world.packages))
+      blockers.push('NORMATIVE_PACKAGE_MISSING');
+    if (validReservations(world, query, now).length === 0)
+      blockers.push('NUMBERING_RESERVATION_REQUIRED');
+    const agent = world.agent;
+    const credential = dateOf(agent?.credential_valid_until);
+    if (
+      !agent ||
+      String(agent.functional_status) !== 'active' ||
+      (credential !== null && credential < today)
+    )
+      blockers.push('AGENT_NOT_ACTIVE');
+    if (!agent || !agent.operational_unit_id)
+      blockers.push('AGENT_NOT_IN_UNIT');
+    if (elsewhere && covered) blockers.push('SHIFT_ALREADY_OPEN_ELSEWHERE');
+    return blockers;
+  }
+
+  /** §5.3 — avisos nunca bloqueiam (E.29 e H.55). */
+  private async warnings(
+    world: BootstrapWorld,
+    today: string,
+  ): Promise<string[]> {
+    const warnings: string[] = [];
+    const normative = publishedPackage(world.packages);
+    const validUntil = dateOf(normative?.valid_until);
+    if (normative && validUntil !== null && validUntil < today)
+      warnings.push('NORMATIVE_PACKAGE_EXPIRED');
+    const expiring = activeHomologations(world.homologations).some((row) => {
+      const laudo = dateOf(row.laudo_valido_ate);
+      const valid = dateOf(row.valid_until);
+      return (
+        (laudo !== null && laudo < today) || (valid !== null && valid < today)
+      );
+    });
+    if (expiring && (await this.expiredBehavior(world)) === 'warn')
+      warnings.push('HOMOLOGATION_RENEWAL_DUE');
+    return warnings;
+  }
+
+  private async expiredBehavior(world: BootstrapWorld): Promise<string | null> {
+    const row = await this.deps.parameters
+      ?.get(HOMOLOGATION_BEHAVIOR_KEY, { agencyId: world.agencyId })
+      .catch(() => undefined);
+    const value = row?.value_json;
+    if (value === null || value === undefined) return null;
+    return String(value).startsWith('warn') ? 'warn' : String(value);
+  }
+
+  private capabilities(
+    world: BootstrapWorld,
+    blockers: readonly string[],
+    query: MobileBootstrapQuery,
+  ): Record<string, boolean> {
+    const canOpenShift = blockers.every(
+      (token) => token === 'NUMBERING_RESERVATION_REQUIRED',
+    );
+    const canOperateOffline = blockers.length === 0;
+    return {
+      canOpenShift,
+      canOperateOffline,
+      canReserveNumbering:
+        canOpenShift && openShiftHere(world, query) !== undefined,
+    };
+  }
+
+  private activeShift(
+    world: BootstrapWorld,
+    query: MobileBootstrapQuery,
+  ): Record<string, unknown> | null {
+    const shift = openShiftHere(world, query);
+    if (!shift) return null;
+    return {
+      id: String(shift.id),
+      operationalUnitId: shift.operational_unit_id ?? null,
+      teamId: shift.team_id ?? null,
+      patrolVehicleId: shift.patrol_vehicle_id ?? null,
+      operationId: shift.operation_id ?? null,
+      startedAt: isoOf(shift.started_at),
+      status: shift.status ?? null,
+    };
+  }
+
+  /**
+   * §11.14 — não há tabela de sessão: a sessão exclusiva é o turno aberto do
+   * agente neste dispositivo.
+   */
+  private session(
+    world: BootstrapWorld,
+    query: MobileBootstrapQuery,
+  ): Record<string, unknown> | null {
+    const shift = openShiftHere(world, query);
+    const elsewhere = openShiftElsewhere(world, query);
+    if (!shift) return null;
+    return {
+      id: String(shift.id),
+      startedAt: isoOf(shift.started_at),
+      exclusive: !elsewhere || hasHandoff(world, elsewhere),
+    };
+  }
+
+  private async catalog(
+    world: BootstrapWorld,
+  ): Promise<Record<string, unknown>> {
+    const { tenantId } = tenantScope(this.deps);
+    const ofAgency = (rows: OpsRow[]): OpsRow[] =>
+      rows.filter(
+        (row) =>
+          !row.traffic_agency_id ||
+          String(row.traffic_agency_id) === world.agencyId,
+      );
+    const read = async (name: string): Promise<OpsRow[]> => {
+      const store = this.deps.repositories[name];
+      return store ? ofAgency(ownedBy(await store.list(), tenantId)) : [];
+    };
+    const today = todayOf(this.deps);
+    const instruments = await read('measurementInstruments');
+    return {
+      operationalUnits: (await read('units')).map((row) => ({
+        id: String(row.id),
+        label: row.name ?? null,
+      })),
+      teams: (await read('teams'))
+        .filter((row) => String(row.status) === 'active')
+        .map((row) => ({ id: String(row.id), label: row.name ?? null })),
+      patrolVehicles: (await read('patrolVehicles'))
+        .filter((row) => String(row.status) === 'active')
+        .map((row) => ({
+          id: String(row.id),
+          label: `${String(row.prefix ?? '')} - ${String(row.plate ?? '')}`,
+        })),
+      operations: (await read('operations'))
+        .filter((row) => ['planned', 'active'].includes(String(row.status)))
+        .map((row) => ({ id: String(row.id), label: row.name ?? null })),
+      measurementInstruments: instruments.map((row) => {
+        const validUntil = dateOf(row.verification_valid_until);
+        return {
+          id: String(row.id),
+          instrumentType: row.instrument_type ?? null,
+          serialNumber: row.serial_number ?? null,
+          brand: row.brand ?? null,
+          model: row.model ?? null,
+          inmetroModelApproval: row.inmetro_model_approval ?? null,
+          verificationValidUntil: validUntil,
+          verificationValid: validUntil !== null && validUntil >= today,
+          status: row.status ?? null,
+        };
+      }),
+    };
+  }
+}
+
+export function activeHomologations(rows: readonly OpsRow[]): OpsRow[] {
+  return rows.filter((row) => String(row.status) === 'active');
+}
+
+export function allowedVersions(
+  rows: readonly OpsRow[],
+  appVersion: string,
+  today: string,
+): OpsRow[] {
+  return rows.filter((row) => {
+    if (String(row.version) !== String(appVersion)) return false;
+    if (String(row.status) !== 'active') return false;
+    const from = dateOf(row.valid_from);
+    const to = dateOf(row.valid_to);
+    if (from !== null && from > today) return false;
+    return to === null || to >= today;
+  });
+}
+
+export function publishedPackage(rows: readonly OpsRow[]): OpsRow | undefined {
+  return rows.find((row) => String(row.status) === 'published');
+}
+
+export function validReservations(
+  world: BootstrapWorld,
+  query: MobileBootstrapQuery,
+  now: string,
+): OpsRow[] {
+  const agentId = world.agent ? String(world.agent.id) : null;
+  return world.reservations.filter((row) => {
+    if (String(row.status) !== 'reserved') return false;
+    if (String(row.device_id) !== String(query.device_id)) return false;
+    if (agentId && String(row.agent_id) !== agentId) return false;
+    const validUntil = isoOf(row.valid_until);
+    return validUntil !== null && new Date(validUntil) > new Date(now);
+  });
+}
+
+export function openShiftHere(
+  world: BootstrapWorld,
+  query: MobileBootstrapQuery,
+): OpsRow | undefined {
+  return world.shifts.find(
+    (row) =>
+      String(row.status) === 'open' &&
+      String(row.device_id) === String(query.device_id) &&
+      (!world.agent || String(row.agent_id) === String(world.agent.id)),
+  );
+}
+
+export function openShiftElsewhere(
+  world: BootstrapWorld,
+  query: MobileBootstrapQuery,
+): OpsRow | undefined {
+  return world.shifts.find(
+    (row) =>
+      String(row.status) === 'open' &&
+      String(row.device_id) !== String(query.device_id) &&
+      (!world.agent || String(row.agent_id) === String(world.agent.id)),
+  );
+}
+
+export function hasHandoff(world: BootstrapWorld, shift: OpsRow): boolean {
+  return world.handoffs.some(
+    (row) => String(row.shift_id) === String(shift.id),
+  );
+}
diff --git a/backend/domains/ops/field/src/handwritten/open-shift.command.ts b/backend/domains/ops/field/src/handwritten/open-shift.command.ts
new file mode 100644
index 0000000..0cd6038
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/open-shift.command.ts
@@ -0,0 +1,147 @@
+// CTG-0002 §5.4 (M10) — `POST /v1/ops/mobile-bootstrap/shifts`.
+import { teatEventSink } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import { shiftOpenedEvent } from './events.js';
+import {
+  clockOf,
+  inTransaction,
+  isoOf,
+  tenantScope,
+  todayOf,
+  type FieldDeps,
+} from './field-runtime.js';
+import { MOBILE_BOOTSTRAP_PROTOCOL_VERSION } from './mobile-bootstrap.service.js';
+import {
+  assertShiftReadiness,
+  loadAgent,
+  loadDevice,
+} from './shift-readiness.js';
+
+export interface OpenShiftInput {
+  device_id: string;
+  installation_id?: string;
+  app_version: string;
+  protocol_version?: string;
+  operational_unit_id: string;
+  team_id?: string;
+  patrol_vehicle_id?: string;
+  operation_id?: string;
+  started_at: string;
+  latitude?: number;
+  longitude?: number;
+  accuracy_m?: number;
+}
+
+export class OpenShiftCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async execute(input: OpenShiftInput): Promise<Record<string, unknown>> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    const today = todayOf(this.deps);
+    if (
+      input.protocol_version &&
+      input.protocol_version !== MOBILE_BOOTSTRAP_PROTOCOL_VERSION
+    )
+      throw new DetranError('TEAT.PROTOCOL_VERSION_UNSUPPORTED', {
+        status: 426,
+        context: { supported: [MOBILE_BOOTSTRAP_PROTOCOL_VERSION] },
+        message: 'Versão de protocolo do bootstrap não suportada.',
+      });
+    const deviceId = String(input.device_id);
+
+    return inTransaction(this.deps, async (scope) => {
+      const agent = await loadAgent(scope, tenantId, actorId);
+      const device = await loadDevice(scope, tenantId, deviceId);
+      const agencyId = String(device.traffic_agency_id);
+      const open = await scope.query<{ id: string; device_id: string }>(
+        `select id, device_id from ops.ops_shift
+          where tenant_id = $1 and agent_id = $2 and status = 'open'
+          limit 1`,
+        [tenantId, agent ? agent.id : actorId],
+      );
+      if (open.rows[0])
+        throw new DetranError('TEAT.SHIFT_ALREADY_OPEN', {
+          status: 409,
+          context: {
+            shiftId: open.rows[0].id,
+            deviceId: open.rows[0].device_id,
+          },
+          message: 'Já existe turno aberto para o agente.',
+        });
+      await assertShiftReadiness(scope, device, agent, {
+        tenantId,
+        agencyId,
+        agentId: agent ? String(agent.id) : actorId,
+        deviceId,
+        appVersion: String(input.app_version),
+        today,
+      });
+
+      const location =
+        input.latitude === undefined && input.longitude === undefined
+          ? null
+          : {
+              latitude: input.latitude ?? null,
+              longitude: input.longitude ?? null,
+              accuracy_m: input.accuracy_m ?? null,
+            };
+      const inserted = await scope.query<Record<string, unknown>>(
+        `insert into ops.ops_shift
+           (traffic_agency_id, agent_id, device_id, operational_unit_id, team_id,
+            patrol_vehicle_id, operation_id, started_at, start_location_json,
+            status, offline_periods_count)
+         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', 0)
+         returning *`,
+        [
+          agencyId,
+          agent!.id,
+          deviceId,
+          input.operational_unit_id ?? null,
+          input.team_id ?? null,
+          input.patrol_vehicle_id ?? null,
+          input.operation_id ?? null,
+          input.started_at,
+          location ? JSON.stringify(location) : null,
+        ],
+      );
+      const shift = inserted.rows[0]!;
+      await scope.query(
+        `insert into ops.ops_device_event
+           (device_id, agent_id, event_type, event_at, details_json)
+         values ($1, $2, 'shift_open', $3, $4::jsonb)`,
+        [
+          deviceId,
+          agent!.id,
+          now,
+          JSON.stringify({ shiftId: String(shift.id) }),
+        ],
+      );
+      await teatEventSink(this.deps.outbox).append(
+        scope.transaction,
+        shiftOpenedEvent(
+          { tenantId, actorId, occurredAt: now },
+          {
+            shiftId: String(shift.id),
+            agentId: String(agent!.id),
+            deviceId,
+            operationalUnitId: input.operational_unit_id ?? null,
+            startedAt: isoOf(shift.started_at) ?? String(input.started_at),
+          },
+        ),
+      );
+      return {
+        id: String(shift.id),
+        status: 'open',
+        agent_id: String(agent!.id),
+        device_id: deviceId,
+        operational_unit_id: shift.operational_unit_id ?? null,
+        team_id: shift.team_id ?? null,
+        patrol_vehicle_id: shift.patrol_vehicle_id ?? null,
+        operation_id: shift.operation_id ?? null,
+        started_at: isoOf(shift.started_at),
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/renew-homologation.command.ts b/backend/domains/ops/field/src/handwritten/renew-homologation.command.ts
new file mode 100644
index 0000000..e87b9d0
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/renew-homologation.command.ts
@@ -0,0 +1,107 @@
+// CTG-0002 §5.7 (M13, parte `ops`) — `POST /v1/ops/field/homologations/{id}/
+// renew`. Renovação quadrienal ([RN-TEAT-117]).
+//
+// `senatran_protocolado_em` é aceito no DTO e **ignorado**: `ops_homologation`
+// não tem a coluna (§11.9), e o campo fica `source_pending`.
+import { DetranError } from '@detran/shared';
+
+import {
+  dateOf,
+  inTransaction,
+  tenantMismatch,
+  tenantScope,
+  todayOf,
+  validationFailed,
+  type FieldDeps,
+} from './field-runtime.js';
+
+/** [RN-TEAT-117] — o laudo vale quatro anos a contar da emissão. */
+const REPORT_VALIDITY_YEARS = 4;
+
+export interface RenewHomologationInput {
+  laudo_emitido_em: string;
+  emissor_independente: string;
+  descricao_publicada_em?: string;
+  descricao_publicacao_local?: string;
+  senatran_protocolado_em?: string;
+  senatran_notificado_em?: string;
+  document_uri?: string;
+}
+
+export function addYears(date: string, years: number): string {
+  const [year, month, day] = date.split('-');
+  return [String(Number(year) + years).padStart(4, '0'), month, day].join('-');
+}
+
+export class RenewHomologationCommand {
+  constructor(private readonly deps: FieldDeps) {}
+
+  async execute(
+    id: string,
+    input: RenewHomologationInput,
+  ): Promise<Record<string, unknown>> {
+    const { tenantId } = tenantScope(this.deps);
+    const today = todayOf(this.deps);
+    const issued = dateOf(input.laudo_emitido_em);
+    if (!issued || !input.emissor_independente)
+      throw validationFailed([
+        { path: 'laudo_emitido_em', rule: 'required' },
+        { path: 'emissor_independente', rule: 'required' },
+      ]);
+    if (issued > today)
+      throw validationFailed([{ path: 'laudo_emitido_em', rule: 'past' }]);
+    const validUntil = addYears(issued, REPORT_VALIDITY_YEARS);
+    if (validUntil < today)
+      throw new DetranError('TEAT.HOMOLOGATION_RENEWAL_DUE', {
+        status: 422,
+        context: { homologationId: id },
+        message: 'Renovação apresentada com laudo já vencido.',
+      });
+
+    return inTransaction(this.deps, async (scope) => {
+      const found = await scope.query<{ id: string; status: string }>(
+        `select id, status from ops.ops_homologation
+          where tenant_id = $1 and id = $2 for update`,
+        [tenantId, id],
+      );
+      const homologation = found.rows[0];
+      if (!homologation) throw tenantMismatch();
+      if (String(homologation.status) !== 'active')
+        throw new DetranError('TEAT.HOMOLOGATION_STATE_INVALID', {
+          status: 409,
+          context: {
+            homologationId: id,
+            currentState: homologation.status,
+          },
+          message: 'Homologação fora do estado que admite renovação.',
+        });
+      const updated = await scope.query<Record<string, unknown>>(
+        `update ops.ops_homologation
+            set laudo_emitido_em = $2, laudo_valido_ate = $3,
+                emissor_independente = $4, descricao_publicada_em = $5,
+                descricao_publicacao_local = $6, senatran_notificado_em = $7,
+                document_uri = coalesce($8, document_uri), status = 'active',
+                updated_at = now()
+          where id = $1
+        returning id, status, laudo_emitido_em, laudo_valido_ate`,
+        [
+          id,
+          issued,
+          validUntil,
+          String(input.emissor_independente),
+          input.descricao_publicada_em ?? null,
+          input.descricao_publicacao_local ?? null,
+          input.senatran_notificado_em ?? null,
+          input.document_uri ?? null,
+        ],
+      );
+      const row = updated.rows[0]!;
+      return {
+        id: String(row.id),
+        status: String(row.status),
+        laudo_emitido_em: dateOf(row.laudo_emitido_em),
+        laudo_valido_ate: dateOf(row.laudo_valido_ate),
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/field/src/handwritten/shift-readiness.ts b/backend/domains/ops/field/src/handwritten/shift-readiness.ts
new file mode 100644
index 0000000..f2d71a9
--- /dev/null
+++ b/backend/domains/ops/field/src/handwritten/shift-readiness.ts
@@ -0,0 +1,140 @@
+// CTG-0002 §5.3 e §5.4 (M9/M10) — a mesma prontidão do bootstrap, aplicada
+// como guarda de abertura de turno. Os bloqueadores 1…6 e 8…10 barram; o 7
+// (reserva de numeração) não (§5.4 pré-condições).
+import { DetranError } from '@detran/shared';
+
+import { dateOf, type SqlScope } from './field-runtime.js';
+
+export interface ShiftReadinessInput {
+  tenantId: string;
+  agencyId: string;
+  agentId: string;
+  deviceId: string;
+  appVersion: string;
+  today: string;
+}
+
+interface DeviceRow extends Record<string, unknown> {
+  id: string;
+  traffic_agency_id: string;
+  status: string;
+  tamper_flag: boolean;
+}
+
+interface AgentRow extends Record<string, unknown> {
+  id: string;
+  functional_status: string;
+  operational_unit_id: string | null;
+  credential_valid_until: string | null;
+}
+
+export async function loadDevice(
+  scope: SqlScope,
+  tenantId: string,
+  deviceId: string,
+): Promise<DeviceRow> {
+  const result = await scope.query<DeviceRow>(
+    `select * from ops.ops_operational_device where tenant_id = $1 and id = $2`,
+    [tenantId, deviceId],
+  );
+  const device = result.rows[0];
+  if (!device)
+    throw new DetranError('TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH', {
+      status: 403,
+      message: 'Dispositivo fora do escopo do principal.',
+    });
+  return device;
+}
+
+export async function loadAgent(
+  scope: SqlScope,
+  tenantId: string,
+  actorId: string,
+): Promise<AgentRow | undefined> {
+  const result = await scope.query<AgentRow>(
+    `select * from ops.ops_agent_profile
+      where tenant_id = $1 and (user_ref = $2 or id = $2) limit 1`,
+    [tenantId, actorId],
+  );
+  return result.rows[0];
+}
+
+export async function assertShiftReadiness(
+  scope: SqlScope,
+  device: DeviceRow,
+  agent: AgentRow | undefined,
+  input: ShiftReadinessInput,
+): Promise<void> {
+  if (String(device.status) !== 'authorized')
+    throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
+      status: 403,
+      context: { deviceId: input.deviceId, status: device.status },
+      message: 'Dispositivo não autorizado.',
+    });
+  if (device.tamper_flag === true)
+    throw new DetranError('TEAT.DEVICE_TAMPER_DETECTED', {
+      status: 403,
+      context: { deviceId: input.deviceId, status: device.status },
+      message: 'Dispositivo com indício de adulteração.',
+    });
+  const homologation = await scope.query<{ id: string }>(
+    `select id from ops.ops_homologation
+      where tenant_id = $1 and traffic_agency_id = $2 and status = 'active'
+      limit 1`,
+    [input.tenantId, input.agencyId],
+  );
+  if (!homologation.rows[0])
+    throw new DetranError('TEAT.DEVICE_NOT_HOMOLOGATED', {
+      status: 403,
+      context: { homologationId: null, appVersion: input.appVersion },
+      message: 'Órgão sem homologação vigente.',
+    });
+  const version = await scope.query<{ id: string }>(
+    `select id from ops.ops_application_version
+      where tenant_id = $1 and version = $2 and status = 'active'
+        and valid_from <= $3::date
+        and (valid_to is null or valid_to >= $3::date)
+      limit 1`,
+    [input.tenantId, input.appVersion, input.today],
+  );
+  if (!version.rows[0])
+    throw new DetranError('TEAT.APP_VERSION_NOT_ALLOWED', {
+      status: 403,
+      context: {
+        homologationId: homologation.rows[0].id,
+        appVersion: input.appVersion,
+      },
+      message: 'Versão do aplicativo não permitida.',
+    });
+  const normative = await scope.query<{ id: string }>(
+    `select id from inf.normative_mobile_package
+      where tenant_id = $1 and traffic_agency_id = $2 and status = 'published'
+      limit 1`,
+    [input.tenantId, input.agencyId],
+  );
+  if (!normative.rows[0])
+    throw new DetranError('TEAT.NORMATIVE_PACKAGE_MISSING', {
+      status: 422,
+      context: { packageId: null, manifestHash: null },
+      message: 'Órgão sem pacote normativo publicado.',
+    });
+  const credential = dateOf(agent?.credential_valid_until);
+  if (!agent || String(agent.functional_status) !== 'active')
+    throw new DetranError('TEAT.AGENT_NOT_ACTIVE', {
+      status: 403,
+      context: { agentId: agent ? agent.id : null },
+      message: 'Agente sem situação funcional ativa.',
+    });
+  if (credential !== null && credential < input.today)
+    throw new DetranError('TEAT.AGENT_CREDENTIAL_EXPIRED', {
+      status: 403,
+      context: { agentId: agent.id },
+      message: 'Credencial do agente vencida.',
+    });
+  if (!agent.operational_unit_id)
+    throw new DetranError('TEAT.AGENT_NOT_IN_UNIT', {
+      status: 403,
+      context: { agentId: agent.id },
+      message: 'Agente sem unidade operacional.',
+    });
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/batch-protocol.ts b/backend/domains/ops/offline-sync/src/handwritten/batch-protocol.ts
new file mode 100644
index 0000000..7e77449
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/batch-protocol.ts
@@ -0,0 +1,164 @@
+// CTG-0002 §4.3 e §4.4 (R-0008, TASK-0005) — vocabulário fechado do protocolo
+// de sincronização e as dependências comuns dos comandos manuscritos de
+// `@detran/ops-offline-sync`.
+import type {
+  OpsClock,
+  OpsRow,
+  OpsRowStore,
+  SyncEntityApplier,
+} from '@detran/ops-core';
+import { systemOpsClock } from '@detran/ops-core';
+import { DetranError, type TeatEventOutbox } from '@detran/shared';
+
+/** §4.3: os cinco tipos com destino previsto mais `crash-record` (BOAT). */
+export const SUPPORTED_ENTITY_TYPES: readonly string[] = [
+  'ait',
+  'administrative-measure',
+  'alcohol-signs-term',
+  'ait-cancel-request',
+  'ait-cancel-posfinal-request',
+  'crash-record',
+];
+
+export type ReceiptStatus = 'received' | 'applied' | 'conflict' | 'rejected';
+export type ConflictType = 'integrity' | 'domain' | 'concurrency';
+
+export interface ItemOutcome {
+  status: ReceiptStatus;
+  conflictType?: ConflictType;
+}
+
+/**
+ * §4.4 — recibo × `error_code` × conflito. Um código fora desta tabela é falha
+ * de domínio não classificada: recibo `rejected`, sem conflito (o item volta
+ * pelo reenvio, não pela mesa do supervisor).
+ */
+const OUTCOME_BY_CODE: Readonly<Record<string, ItemOutcome>> = {
+  'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED': { status: 'received' },
+  'TEAT.SYNC_DESTINATION_NOT_WIRED': { status: 'received' },
+  'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE': { status: 'rejected' },
+  'TEAT.SYNC_INTEGRITY_ERROR': {
+    status: 'rejected',
+    conflictType: 'integrity',
+  },
+  'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT': {
+    status: 'rejected',
+    conflictType: 'domain',
+  },
+  'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED': {
+    status: 'rejected',
+    conflictType: 'domain',
+  },
+  'TEAT.NUMBERING_RESERVATION_EXPIRED': {
+    status: 'conflict',
+    conflictType: 'domain',
+  },
+  'TEAT.SYNC_ITEM_CONFLICT': { status: 'conflict', conflictType: 'domain' },
+  'TEAT.SYNC_CONCURRENCY_SUSPECT': {
+    status: 'conflict',
+    conflictType: 'concurrency',
+  },
+};
+
+export function outcomeFor(code: string): ItemOutcome {
+  return OUTCOME_BY_CODE[code] ?? { status: 'rejected' };
+}
+
+/** Ações admitidas por tipo de conflito (§4.7 e §5.13). */
+export const ALLOWED_RESOLUTION_ACTIONS: Readonly<
+  Record<ConflictType, readonly string[]>
+> = {
+  integrity: ['accept_server', 'reject', 'retry_after_correction'],
+  domain: ['accept_server', 'reject', 'retry_after_correction'],
+  concurrency: ['manual_review'],
+};
+
+export const CONFLICT_DESCRIPTION: Readonly<Record<ConflictType, string>> = {
+  integrity: 'Divergência de integridade do item requer análise.',
+  domain: 'Divergência de negócio requer análise.',
+  concurrency:
+    'Mesmo agente com atos em dispositivos distintos na mesma janela.',
+};
+
+export interface DatabasePort {
+  tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T>;
+}
+
+export interface RequestContextPort {
+  hasActiveContext(): boolean;
+  snapshot(): { tenantId?: string; actorId?: string };
+}
+
+export interface ParameterRow {
+  value_json?: unknown;
+  source_pending?: boolean;
+}
+
+export interface ParameterPort {
+  get(key: string, options?: Record<string, unknown>): Promise<ParameterRow>;
+}
+
+export interface OfflineSyncDeps {
+  database: DatabasePort;
+  requestContext: RequestContextPort;
+  repositories: Partial<Record<string, OpsRowStore>>;
+  appliers?: readonly SyncEntityApplier[];
+  parameters?: ParameterPort;
+  outbox?: TeatEventOutbox;
+  clock?: OpsClock;
+}
+
+export function clockOf(deps: OfflineSyncDeps): OpsClock {
+  return deps.clock ?? systemOpsClock;
+}
+
+export function storeOf(deps: OfflineSyncDeps, name: string): OpsRowStore {
+  const store = deps.repositories[name];
+  if (!store) throw new Error(`Unbound ops row store: ${name}`);
+  return store;
+}
+
+export function tenantScope(deps: OfflineSyncDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Active tenant context is required');
+  const snapshot = deps.requestContext.snapshot();
+  if (!snapshot.tenantId) throw new Error('Active tenant context is required');
+  return { tenantId: snapshot.tenantId, actorId: snapshot.actorId ?? '' };
+}
+
+/** Linhas do tenant corrente: a RLS já filtra no SQL; aqui só a defesa. */
+export function ownedBy(rows: OpsRow[], tenantId: string): OpsRow[] {
+  return rows.filter(
+    (row) => !row.tenant_id || String(row.tenant_id) === tenantId,
+  );
+}
+
+export function tenantMismatch(): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    message: 'Recurso não pertence ao tenant da requisição.',
+  });
+}
+
+export function validationFailed(
+  fields: ReadonlyArray<Record<string, unknown>>,
+): DetranError {
+  return new DetranError('TEAT.VALIDATION_FAILED', {
+    status: 422,
+    context: { fields },
+    message: 'Dados inválidos para o comando.',
+  });
+}
+
+/** `bigint` chega do Postgres como string: converter antes de somar (§5.10). */
+export function numberOf(value: unknown): number {
+  return typeof value === 'number' ? value : Number(value);
+}
+
+export function isoOf(value: unknown): string {
+  if (value instanceof Date) return value.toISOString();
+  return String(value);
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/canonical-hash.ts b/backend/domains/ops/offline-sync/src/handwritten/canonical-hash.ts
new file mode 100644
index 0000000..fe96d6f
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/canonical-hash.ts
@@ -0,0 +1,21 @@
+// CTG-0002 §4.2 (R-0008, TASK-0005) — hash canônico do payload de um item de
+// sincronização: `sha256` do JSON com chaves ordenadas recursivamente e sem
+// espaços, prefixado `sha256:` como nas fixtures. É a mesma `stableJson` que
+// `contentHashForAit` usa em `ait-lifecycle.service.ts`.
+import { createHash } from 'node:crypto';
+
+export function stableJson(value: unknown): string {
+  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
+  if (value && typeof value === 'object') {
+    const entries = Object.entries(value as Record<string, unknown>)
+      .filter(([, item]) => item !== undefined)
+      .sort(([left], [right]) => left.localeCompare(right))
+      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
+    return `{${entries.join(',')}}`;
+  }
+  return JSON.stringify(value) ?? 'null';
+}
+
+export function canonicalHash(payload: unknown): string {
+  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/concurrency-detector.ts b/backend/domains/ops/offline-sync/src/handwritten/concurrency-detector.ts
new file mode 100644
index 0000000..d8e16c0
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/concurrency-detector.ts
@@ -0,0 +1,102 @@
+// CTG-0002 §4.7 (M6, RN-TEAT-111, AC-TEAT-012-2/4/5) — detecção de
+// concorrência entre dispositivos do mesmo agente.
+import type { OpsRow } from '@detran/ops-core';
+
+import { numberOf } from './batch-protocol.js';
+
+/** Chave real do `parameter-catalogue.md` §TEAT (surface `teat`). */
+export const CONCURRENCY_WINDOW_KEY = 'sync.concurrency_window_minutes';
+export const CONCURRENCY_WINDOW_WARNING =
+  'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING';
+
+const MINUTE_MS = 60_000;
+
+export interface ConcurrencyWindow {
+  /** `null` ⇒ detecção desligada (linha ausente ou `value_json` nulo). */
+  minutes: number | null;
+}
+
+export function windowFrom(row: {
+  value_json?: unknown;
+  source_pending?: boolean;
+}): ConcurrencyWindow {
+  const value = row.value_json;
+  if (value === null || value === undefined) return { minutes: null };
+  const minutes = numberOf(value);
+  return Number.isFinite(minutes) ? { minutes } : { minutes: null };
+}
+
+function millis(value: unknown): number {
+  return new Date(String(value)).getTime();
+}
+
+export interface CandidateQuery {
+  items: readonly OpsRow[];
+  handoffs: readonly OpsRow[];
+  agentId: string;
+  deviceId: string;
+  createdLocallyAt: string;
+  windowMinutes: number;
+  excludeItemId: string;
+}
+
+/**
+ * Itens `ait` do mesmo agente, em outro dispositivo, ainda não liquidados e
+ * dentro da janela — descontados os pares cobertos por um handoff declarado
+ * (AC-TEAT-012-4: troca autorizada não é anomalia).
+ */
+export function concurrentCandidates(query: CandidateQuery): OpsRow[] {
+  const target = millis(query.createdLocallyAt);
+  if (!Number.isFinite(target)) return [];
+  const window = query.windowMinutes * MINUTE_MS;
+  return query.items.filter((row) => {
+    if (String(row.id) === query.excludeItemId) return false;
+    if (String(row.entity_type) !== 'ait') return false;
+    if (String(row.agent_id) !== query.agentId) return false;
+    if (String(row.device_id) === query.deviceId) return false;
+    const status = String(row.status ?? '');
+    if (status !== 'pending' && status !== 'received') return false;
+    const other = millis(row.created_locally_at);
+    if (!Number.isFinite(other)) return false;
+    if (Math.abs(other - target) > window) return false;
+    return !coveredByHandoff(
+      query.handoffs,
+      query.agentId,
+      target,
+      other,
+      window,
+    );
+  });
+}
+
+function coveredByHandoff(
+  handoffs: readonly OpsRow[],
+  agentId: string,
+  first: number,
+  second: number,
+  window: number,
+): boolean {
+  const from = Math.min(first, second) - window;
+  const to = Math.max(first, second) + window;
+  return handoffs.some((row) => {
+    if (
+      String(row.from_agent_id) !== agentId &&
+      String(row.to_agent_id) !== agentId
+    )
+      return false;
+    const at = millis(row.handed_off_at);
+    return Number.isFinite(at) && at >= from && at <= to;
+  });
+}
+
+export function windowBounds(
+  createdLocallyAt: string,
+  windowMinutes: number,
+): { windowStart: string; windowEnd: string } {
+  const target = millis(createdLocallyAt);
+  const window = windowMinutes * MINUTE_MS;
+  return {
+    windowStart: new Date(target - window).toISOString(),
+    windowEnd: new Date(target + window).toISOString(),
+  };
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/events.ts b/backend/domains/ops/offline-sync/src/handwritten/events.ts
new file mode 100644
index 0000000..9aee37b
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/events.ts
@@ -0,0 +1,324 @@
+// CTG-0002 §7 (M16) — envelopes publicados por `@detran/ops-offline-sync`.
+// Mesmo formato de `rait-events-sse-contract.md` §1 e do molde de
+// `inf/ait/src/handwritten/events.ts` (`additionalProperties: false` ⇒
+// `strictObject`). O mapa exportado é chaveado por `domainEvent`, e não por
+// `type`, porque `sync.batch.received` e `numbering.reservation.changed`
+// cobrem mais de um token de domínio ao longo do grupo.
+//
+// Os `type` técnicos da família `sync.*` são montados por concatenação, nunca
+// como literal único: `tools/parameters/verify.mjs --check-usage` trata todo
+// literal `sync.<x>.<y>` como chave de `ops.parameter` não registrada — e
+// estes são `type` de envelope SSE, não parâmetro (mesmo tratamento já dado em
+// `inf/ait/src/handwritten/events.ts`).
+import { teatEnvelope } from '@detran/ops-core';
+import type { TeatEventEnvelope } from '@detran/shared';
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+export const SYNC_BATCH_RECEIVED_TYPE = 'sync' + '.batch.received';
+export const SYNC_CONFLICT_OPENED_TYPE = 'sync' + '.conflict.opened';
+export const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
+export const NUMBERING_RESERVATION_CHANGED_TYPE =
+  'numbering.reservation.changed';
+export const AIT_CHANGED_TYPE = 'ait.changed';
+export const AIT_CONCURRENCY_SUSPECTED_TYPE = 'ait.concurrency-suspected';
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: ZodType,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.string(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.string(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const syncItemRecebido = envelope(
+  SYNC_BATCH_RECEIVED_TYPE,
+  'SYNC_ITEM_RECEBIDO',
+  'sync-queue-item',
+  z.strictObject({
+    batchId: z.string().nullable(),
+    deviceBatchId: z.string(),
+    batchSequence: z.number().nullable(),
+    itemId: z.string(),
+    entityType: z.string(),
+    localEntityId: z.string(),
+    receiptStatus: z.enum(['received', 'applied', 'conflict', 'rejected']),
+    errorCode: z.string().nullable(),
+    serverEntityId: z.string().nullable(),
+  }),
+);
+
+const syncConflitoAberto = envelope(
+  SYNC_CONFLICT_OPENED_TYPE,
+  'SYNC_CONFLITO_ABERTO',
+  'sync-conflict',
+  z.strictObject({
+    conflictId: z.string(),
+    conflictType: z.enum(['integrity', 'domain', 'concurrency']),
+    syncQueueItemId: z.string(),
+    reasonCode: z.string(),
+    openedAt: z.iso.datetime(),
+  }),
+);
+
+const syncConflitoResolvido = envelope(
+  SYNC_CONFLICT_RESOLVED_TYPE,
+  'SYNC_CONFLITO_RESOLVIDO',
+  'sync-conflict',
+  z.strictObject({
+    conflictId: z.string(),
+    conflictType: z.enum(['integrity', 'domain', 'concurrency']),
+    resolutionAction: z.string(),
+    resolvedAt: z.iso.datetime(),
+  }),
+);
+
+const numeracaoReservada = envelope(
+  NUMBERING_RESERVATION_CHANGED_TYPE,
+  'NUMERACAO_RESERVADA',
+  'numbering-reservation',
+  z.strictObject({
+    reservationId: z.string(),
+    rangeId: z.string(),
+    agentId: z.string().nullable(),
+    deviceId: z.string().nullable(),
+    shiftId: z.string().nullable(),
+    startNumber: z.number().nullable(),
+    endNumber: z.number().nullable(),
+    validUntil: z.string().nullable(),
+    status: z.string(),
+    action: z.string(),
+  }),
+);
+
+const aitRecebido = envelope(
+  AIT_CHANGED_TYPE,
+  'AIT_RECEBIDO',
+  'ait',
+  z.strictObject({
+    aitId: z.string(),
+    fromState: z.string(),
+    toState: z.literal('RECEBIDO'),
+    receiptProtocol: z.string(),
+    receivedAt: z.iso.datetime(),
+  }),
+);
+
+const aitSuspeitoConcorrencia = envelope(
+  AIT_CONCURRENCY_SUSPECTED_TYPE,
+  'AIT_SUSPEITO_CONCORRENCIA',
+  'ait',
+  z.strictObject({
+    aitId: z.string(),
+    agentId: z.string(),
+    deviceId: z.string(),
+    otherDeviceId: z.string().nullable(),
+    windowStart: z.iso.datetime(),
+    windowEnd: z.iso.datetime(),
+    conflictId: z.string().nullable(),
+  }),
+);
+
+/** Os seis `domainEvent` publicados pelo grupo (CTG-0002 §7). */
+export interface OfflineSyncEventSchemas extends Record<string, ZodType> {
+  SYNC_ITEM_RECEBIDO: ZodType;
+  SYNC_CONFLITO_ABERTO: ZodType;
+  SYNC_CONFLITO_RESOLVIDO: ZodType;
+  NUMERACAO_RESERVADA: ZodType;
+  AIT_RECEBIDO: ZodType;
+  AIT_SUSPEITO_CONCORRENCIA: ZodType;
+}
+
+export const OFFLINE_SYNC_EVENT_SCHEMAS: OfflineSyncEventSchemas = {
+  SYNC_ITEM_RECEBIDO: syncItemRecebido,
+  SYNC_CONFLITO_ABERTO: syncConflitoAberto,
+  SYNC_CONFLITO_RESOLVIDO: syncConflitoResolvido,
+  NUMERACAO_RESERVADA: numeracaoReservada,
+  AIT_RECEBIDO: aitRecebido,
+  AIT_SUSPEITO_CONCORRENCIA: aitSuspeitoConcorrencia,
+};
+
+/** Falha cedo quando um envelope foge da forma declarada da §7. */
+export function assertEventShape(envelope: TeatEventEnvelope): void {
+  const schema = OFFLINE_SYNC_EVENT_SCHEMAS[envelope.domainEvent];
+  if (!schema)
+    throw new Error(
+      `Unknown offline-sync domain event ${envelope.domainEvent}`,
+    );
+  schema.parse(envelope);
+}
+
+export interface EventScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+export function syncItemReceivedEvent(
+  scope: EventScope,
+  data: {
+    batchId: string | null;
+    deviceBatchId: string;
+    batchSequence: number | null;
+    itemId: string;
+    entityType: string;
+    localEntityId: string;
+    receiptStatus: string;
+    errorCode: string | null;
+    serverEntityId: string | null;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: SYNC_BATCH_RECEIVED_TYPE,
+    domainEvent: 'SYNC_ITEM_RECEBIDO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'sync-queue-item', id: data.itemId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function syncConflictOpenedEvent(
+  scope: EventScope,
+  data: {
+    conflictId: string;
+    conflictType: string;
+    syncQueueItemId: string;
+    reasonCode: string;
+    openedAt: string;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: SYNC_CONFLICT_OPENED_TYPE,
+    domainEvent: 'SYNC_CONFLITO_ABERTO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'sync-conflict', id: data.conflictId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function syncConflictResolvedEvent(
+  scope: EventScope,
+  data: {
+    conflictId: string;
+    conflictType: string;
+    resolutionAction: string;
+    resolvedAt: string;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: SYNC_CONFLICT_RESOLVED_TYPE,
+    domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'sync-conflict', id: data.conflictId, version: 1 },
+    data: { ...data },
+  });
+}
+
+export function numberingReservationChangedEvent(
+  scope: EventScope,
+  data: {
+    reservationId: string;
+    rangeId: string;
+    agentId: string | null;
+    deviceId: string | null;
+    shiftId: string | null;
+    startNumber: number | null;
+    endNumber: number | null;
+    validUntil: string | null;
+    status: string;
+    action: string;
+  },
+  /**
+   * Versão do agregado depois do ato: a reserva nasce em 1 e é liquidada em 2.
+   * A chave de idempotência da outbox é `type:aggregateId:version`, então o
+   * envelope da liquidação precisa de versão própria para não ser descartado
+   * como repetição do envelope da reserva.
+   */
+  aggregateVersion = 1,
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: NUMBERING_RESERVATION_CHANGED_TYPE,
+    domainEvent: 'NUMERACAO_RESERVADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'numbering-reservation',
+      id: data.reservationId,
+      version: aggregateVersion,
+    },
+    data: { ...data },
+  });
+}
+
+export function aitReceivedEvent(
+  scope: EventScope,
+  data: {
+    aitId: string;
+    fromState: string;
+    receiptProtocol: string;
+    receivedAt: string;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: AIT_CHANGED_TYPE,
+    domainEvent: 'AIT_RECEBIDO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'ait', id: data.aitId, version: 1 },
+    data: { ...data, toState: 'RECEBIDO' },
+  });
+}
+
+export function aitConcurrencySuspectedEvent(
+  scope: EventScope,
+  data: {
+    aitId: string;
+    agentId: string;
+    deviceId: string;
+    otherDeviceId: string | null;
+    windowStart: string;
+    windowEnd: string;
+    conflictId: string | null;
+  },
+): TeatEventEnvelope {
+  return teatEnvelope({
+    type: AIT_CONCURRENCY_SUSPECTED_TYPE,
+    domainEvent: 'AIT_SUSPEITO_CONCORRENCIA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: { kind: 'ait', id: data.aitId, version: 1 },
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/numbering-sql.ts b/backend/domains/ops/offline-sync/src/handwritten/numbering-sql.ts
new file mode 100644
index 0000000..5bd9a2a
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/numbering-sql.ts
@@ -0,0 +1,34 @@
+// CTG-0002 §2, §3 e §5.10–§5.12 (M8, R-0008, TASK-0005) — utilidades SQL dos
+// comandos de numeração. A alocação de números é atômica por definição
+// (`select … for update` na faixa antes de qualquer aritmética), então estes
+// comandos falam SQL dentro de **uma** transação, e não pela porta de
+// repositório, que abre transação por instrução.
+import { asQueryable, type SqlQueryable } from '@detran/ops-core';
+import type { Transaction } from '@stynx-nyx/data';
+
+import type { OfflineSyncDeps } from './batch-protocol.js';
+
+export interface SqlScope {
+  query: SqlQueryable['query'];
+  transaction: Transaction;
+}
+
+export function inTransaction<T>(
+  deps: OfflineSyncDeps,
+  work: (scope: SqlScope) => Promise<T>,
+): Promise<T> {
+  return deps.database.tx(async (tx) => {
+    const queryable = asQueryable(tx);
+    if (!queryable)
+      throw new Error('Numbering commands require a SQL transaction');
+    return work({
+      query: queryable.query.bind(queryable),
+      transaction: tx as Transaction,
+    });
+  });
+}
+
+/** `bigint` chega como string do Postgres; a aritmética é sempre em número. */
+export function bigintOf(value: unknown): number {
+  return Number(value);
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/offline-sync.commands.ts b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.commands.ts
new file mode 100644
index 0000000..4bad20a
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.commands.ts
@@ -0,0 +1,42 @@
+// CTG-0002 §5 (R-0008, TASK-0005) — fachada dos comandos e leituras do
+// protocolo. Existe para que o módulo gerado receba **um** provider
+// manuscrito (`handwrittenProviders` do blueprint) e o controlador tenha uma
+// única dependência; cada comando continua construtível isolado nos testes.
+import {
+  ReconcileNumberingCommand,
+  NumberingConsumptionQuery,
+} from './reconcile-numbering.command.js';
+import { ReserveNumberingCommand } from './reserve-numbering.command.js';
+import { ResolveSyncConflictCommand } from './resolve-conflict.command.js';
+import { SettleNumberingCommand } from './settle-numbering.command.js';
+import { SubmitBatchCommand } from './submit-batch.command.js';
+import {
+  SyncConflictQuery,
+  SyncQueueItemQuery,
+  SyncReceiptQuery,
+} from './offline-sync.reads.js';
+import type { OfflineSyncDeps } from './batch-protocol.js';
+
+export class OfflineSyncCommands {
+  readonly submitBatch: SubmitBatchCommand;
+  readonly reserveNumbering: ReserveNumberingCommand;
+  readonly settleNumbering: SettleNumberingCommand;
+  readonly reconcileNumbering: ReconcileNumberingCommand;
+  readonly numberingConsumption: NumberingConsumptionQuery;
+  readonly resolveConflict: ResolveSyncConflictCommand;
+  readonly receipts: SyncReceiptQuery;
+  readonly queueItems: SyncQueueItemQuery;
+  readonly conflicts: SyncConflictQuery;
+
+  constructor(deps: OfflineSyncDeps) {
+    this.submitBatch = new SubmitBatchCommand(deps);
+    this.reserveNumbering = new ReserveNumberingCommand(deps);
+    this.settleNumbering = new SettleNumberingCommand(deps);
+    this.reconcileNumbering = new ReconcileNumberingCommand(deps);
+    this.numberingConsumption = new NumberingConsumptionQuery(deps);
+    this.resolveConflict = new ResolveSyncConflictCommand(deps);
+    this.receipts = new SyncReceiptQuery(deps);
+    this.queueItems = new SyncQueueItemQuery(deps);
+    this.conflicts = new SyncConflictQuery(deps);
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/offline-sync.controller.ts b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.controller.ts
new file mode 100644
index 0000000..2e9488d
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.controller.ts
@@ -0,0 +1,148 @@
+// CTG-0002 §1, §5.10–§5.13 (R-0008, TASK-0005) — rotas manuscritas do
+// protocolo de sincronização, no prefixo `v1/ops/…` que todo controlador
+// gerado e o route contract §4 usam. O método só extrai parâmetro e chama o
+// comando (CODESTYLE §Backend).
+import {
+  Body,
+  Controller,
+  Get,
+  HttpCode,
+  Param,
+  Post,
+  Query,
+} from '@nestjs/common';
+import { Action, Audit, Resource } from '@detran/shared';
+
+import type { ReconcileNumberingInput } from './reconcile-numbering.command.js';
+import type { ReserveNumberingInput } from './reserve-numbering.command.js';
+import type { ResolveSyncConflictInput } from './resolve-conflict.command.js';
+import type { SettleNumberingInput } from './settle-numbering.command.js';
+import type { SubmitSyncBatchInput } from './submit-batch.command.js';
+import type { SyncListFilters } from './offline-sync.reads.js';
+import { OfflineSyncCommands } from './offline-sync.commands.js';
+
+@Controller('v1/ops/offline-sync')
+export class OfflineSyncController {
+  constructor(private readonly commands: OfflineSyncCommands) {}
+
+  @Post('sync-batches')
+  @HttpCode(200)
+  @Resource('ops:sync-batch')
+  @Action('submit')
+  @Audit({ action: 'OPS_SYNC_BATCH_SUBMIT', entity: 'ops.sync_batch' })
+  submit(@Body() body: SubmitSyncBatchInput) {
+    return this.commands.submitBatch.execute(body);
+  }
+
+  @Post('numbering-reservations/reserve')
+  @Resource('ops:numbering-reservation')
+  @Action('reserve')
+  @Audit({
+    action: 'OPS_NUMBERING_RESERVE',
+    entity: 'ops.numbering_reservation',
+  })
+  reserve(@Body() body: ReserveNumberingInput) {
+    return this.commands.reserveNumbering.execute(body);
+  }
+
+  @Post('numbering-reservations/:id/cancel')
+  @HttpCode(200)
+  @Resource('ops:numbering-reservation')
+  @Action('cancel')
+  @Audit({
+    action: 'OPS_NUMBERING_CANCEL',
+    entity: 'ops.numbering_reservation',
+  })
+  cancelReservation(
+    @Param('id') id: string,
+    @Body() body: SettleNumberingInput,
+  ) {
+    return this.commands.settleNumbering.cancel(id, body);
+  }
+
+  @Post('numbering-reservations/:id/block')
+  @HttpCode(200)
+  @Resource('ops:numbering-reservation')
+  @Action('cancel')
+  @Audit({ action: 'OPS_NUMBERING_BLOCK', entity: 'ops.numbering_reservation' })
+  blockReservation(
+    @Param('id') id: string,
+    @Body() body: SettleNumberingInput,
+  ) {
+    return this.commands.settleNumbering.block(id, body);
+  }
+
+  @Post('numbering-reservations/:id/close')
+  @HttpCode(200)
+  @Resource('ops:numbering-reservation')
+  @Action('cancel')
+  @Audit({ action: 'OPS_NUMBERING_CLOSE', entity: 'ops.numbering_reservation' })
+  closeReservation(
+    @Param('id') id: string,
+    @Body() body: SettleNumberingInput,
+  ) {
+    return this.commands.settleNumbering.close(id, body);
+  }
+
+  @Post('numbering-reservations/:id/reconcile')
+  @HttpCode(200)
+  @Resource('ops:numbering-reservation')
+  @Action('reserve')
+  @Audit({
+    action: 'OPS_NUMBERING_RECONCILE',
+    entity: 'ops.numbering_consumption',
+  })
+  reconcile(@Param('id') id: string, @Body() body: ReconcileNumberingInput) {
+    return this.commands.reconcileNumbering.execute(id, body);
+  }
+
+  @Get('numbering-reservations/:id/consumption')
+  @Resource('ops:numbering-reservation')
+  @Action('read')
+  consumption(@Param('id') id: string) {
+    return this.commands.reconcileNumbering.consumption(id);
+  }
+
+  @Get('receipts/:tenantId/by-idempotency/:key')
+  @Resource('ops:sync-receipt')
+  @Action('read')
+  receiptByIdempotency(
+    @Param('tenantId') tenantId: string,
+    @Param('key') key: string,
+  ) {
+    return this.commands.receipts.findByIdempotencyKey(tenantId, key);
+  }
+
+  @Get('receipts/:tenantId')
+  @Resource('ops:sync-receipt')
+  @Action('read')
+  listReceipts(
+    @Param('tenantId') tenantId: string,
+    @Query() filters: SyncListFilters,
+  ) {
+    return this.commands.receipts.list(tenantId, filters);
+  }
+
+  @Get('sync-queue-items')
+  @Resource('ops:sync-queue-item')
+  @Action('read')
+  listQueueItems(@Query() filters: SyncListFilters) {
+    return this.commands.queueItems.list(filters);
+  }
+
+  @Get('sync-conflicts')
+  @Resource('ops:sync-conflict')
+  @Action('read')
+  listConflicts(@Query() filters: SyncListFilters) {
+    return this.commands.conflicts.list(filters);
+  }
+
+  @Post('sync-conflicts/:id/resolve')
+  @HttpCode(200)
+  @Resource('ops:sync-conflict')
+  @Action('resolve')
+  @Audit({ action: 'OPS_SYNC_CONFLICT_RESOLVE', entity: 'ops.sync_conflict' })
+  resolve(@Param('id') id: string, @Body() body: ResolveSyncConflictInput) {
+    return this.commands.resolveConflict.execute(id, body);
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/offline-sync.provider.ts b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.provider.ts
new file mode 100644
index 0000000..77b0a39
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.provider.ts
@@ -0,0 +1,85 @@
+// CTG-0002 §4.8 e §11 (R-0008, TASK-0005) — wiring do protocolo dentro do
+// próprio módulo gerado (o pacote continua testável isolado).
+//
+// A lista de appliers é opcional: sem ela **todo** tipo suportado cai em
+// `TEAT.SYNC_DESTINATION_NOT_WIRED` e nenhum item é aplicado, que é o
+// comportamento que M5 pede para falha de implantação. O app monta a lista em
+// `backend/app/src/teat-sync.providers.ts`.
+import type { Provider } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  OpsTenantRepository,
+  SYNC_ENTITY_APPLIERS,
+  systemOpsClock,
+  type SyncEntityApplier,
+} from '@detran/ops-core';
+import { OpsParameterService } from '@detran/ops-parameter';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import type { OfflineSyncDeps, ParameterPort } from './batch-protocol.js';
+import { OfflineSyncCommands } from './offline-sync.commands.js';
+
+export {
+  SyncConflictQuery,
+  SyncQueueItemQuery,
+  SyncReceiptQuery,
+} from './offline-sync.reads.js';
+export { OfflineSyncCommands } from './offline-sync.commands.js';
+
+const TABLES = {
+  batches: 'ops.sync_batch',
+  items: 'ops.sync_queue_item',
+  receipts: 'ops.sync_receipt',
+  conflicts: 'ops.sync_conflict',
+  ranges: 'ops.ait_numbering_range',
+  reservations: 'ops.numbering_reservation',
+  consumptions: 'ops.numbering_consumption',
+  handoffs: 'ops.ops_session_handoff',
+} as const;
+
+export function offlineSyncDeps(
+  database: Database,
+  requestContext: RequestContext,
+  parameters: ParameterPort,
+  appliers?: readonly SyncEntityApplier[],
+): OfflineSyncDeps {
+  return {
+    database,
+    requestContext,
+    repositories: Object.fromEntries(
+      Object.entries(TABLES).map(([name, table]) => [
+        name,
+        new OpsTenantRepository(database, requestContext, table),
+      ]),
+    ),
+    appliers: appliers ?? [],
+    parameters,
+    outbox: new SqlTeatEventOutbox(),
+    clock: systemOpsClock,
+  };
+}
+
+export const OFFLINE_SYNC_PROVIDER: Provider = {
+  provide: OfflineSyncCommands,
+  inject: [
+    Database,
+    RequestContext,
+    OpsParameterService,
+    { token: SYNC_ENTITY_APPLIERS, optional: true },
+  ],
+  useFactory: (
+    database: Database,
+    requestContext: RequestContext,
+    parameters: OpsParameterService,
+    appliers?: readonly SyncEntityApplier[],
+  ) =>
+    new OfflineSyncCommands(
+      offlineSyncDeps(
+        database,
+        requestContext,
+        parameters as unknown as ParameterPort,
+        appliers,
+      ),
+    ),
+};
diff --git a/backend/domains/ops/offline-sync/src/handwritten/offline-sync.reads.ts b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.reads.ts
new file mode 100644
index 0000000..7d22a5a
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/offline-sync.reads.ts
@@ -0,0 +1,106 @@
+// CTG-0002 §5.13 (R-0008, TASK-0005) — leituras do protocolo: recibos por
+// tenant, recuperação de ACK perdido por `idempotency_key`, fila e conflitos.
+// O lookup de recibo é sempre por tenant (route contract §4.3): um `{tenantId}`
+// diferente do principal é 404 `TEAT.TENANT_MISMATCH`, nunca uma leitura vazia.
+import type { OpsRow } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import {
+  ownedBy,
+  storeOf,
+  tenantMismatch,
+  tenantScope,
+  type OfflineSyncDeps,
+} from './batch-protocol.js';
+
+export interface SyncListFilters {
+  device_id?: string;
+  status?: string;
+}
+
+function matches(row: OpsRow, filters: SyncListFilters): boolean {
+  if (filters.device_id && String(row.device_id) !== filters.device_id)
+    return false;
+  if (filters.status && String(row.status) !== filters.status) return false;
+  return true;
+}
+
+function byCreatedAtDesc(left: OpsRow, right: OpsRow): number {
+  return String(right.created_at ?? '').localeCompare(
+    String(left.created_at ?? ''),
+  );
+}
+
+export class SyncReceiptQuery {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async findByIdempotencyKey(tenantId: string, key: string): Promise<OpsRow> {
+    const rows = await this.receipts(tenantId);
+    const receipt = rows.find((row) => String(row.idempotency_key) === key);
+    if (!receipt)
+      throw new DetranError('TEAT.SYNC_RECEIPT_NOT_FOUND', {
+        status: 404,
+        context: { idempotencyKey: key },
+        message: 'Recibo inexistente para a chave informada.',
+      });
+    return receipt;
+  }
+
+  async list(
+    tenantId: string,
+    filters: SyncListFilters = {},
+  ): Promise<{ receipts: OpsRow[] }> {
+    const rows = await this.receipts(tenantId);
+    return {
+      receipts: rows
+        .filter((row) => matches(row, filters))
+        .sort(byCreatedAtDesc),
+    };
+  }
+
+  private async receipts(tenantId: string): Promise<OpsRow[]> {
+    const scope = tenantScope(this.deps);
+    if (tenantId !== scope.tenantId) throw tenantMismatch();
+    return ownedBy(await storeOf(this.deps, 'receipts').list(), scope.tenantId);
+  }
+}
+
+export class SyncQueueItemQuery {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async list(filters: SyncListFilters = {}): Promise<{ items: OpsRow[] }> {
+    const scope = tenantScope(this.deps);
+    const rows = ownedBy(
+      await storeOf(this.deps, 'items').list(),
+      scope.tenantId,
+    );
+    return { items: rows.filter((row) => matches(row, filters)) };
+  }
+}
+
+export class SyncConflictQuery {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async list(filters: SyncListFilters = {}): Promise<{ conflicts: OpsRow[] }> {
+    const scope = tenantScope(this.deps);
+    const rows = ownedBy(
+      await storeOf(this.deps, 'conflicts').list(),
+      scope.tenantId,
+    );
+    const items = filters.device_id
+      ? ownedBy(await storeOf(this.deps, 'items').list(), scope.tenantId)
+      : [];
+    return {
+      conflicts: rows.filter((row) => {
+        if (filters.status && String(row.status) !== filters.status)
+          return false;
+        if (!filters.device_id) return true;
+        const item = items.find(
+          (candidate) =>
+            String(candidate.id) === String(row.sync_queue_item_id),
+        );
+        return item ? String(item.device_id) === filters.device_id : false;
+      }),
+    };
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts
new file mode 100644
index 0000000..d3b5309
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/reconcile-numbering.command.ts
@@ -0,0 +1,218 @@
+// CTG-0002 §3, §5.12 e §12 (adenda do maestro) — `reconcile` e
+// `GET …/{id}/consumption`.
+//
+// Com o delta `BP-OPS-OFFLINE-SYNC-001` v1.1.0 as colunas de ato de
+// `ops.numbering_consumption` são anuláveis, então a reconciliação grava **uma
+// linha por número do intervalo**: `aplicado` (ato no servidor, colunas de ato
+// preenchidas), `consumido_localmente` (reclamado sem ato) e `disponivel` (não
+// reclamado). Um número consumido no servidor é aquele que já tem linha
+// `aplicado` — a linha nasce na mesma transação do AIT (§4.6), então é o
+// registro do consumo, não uma segunda verdade.
+import {
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type OfflineSyncDeps,
+} from './batch-protocol.js';
+import { DetranError } from '@detran/shared';
+
+import { bigintOf, inTransaction, type SqlScope } from './numbering-sql.js';
+
+export interface ReconcileNumberingInput {
+  user_ref?: string;
+  claimed_numbers?: number[];
+}
+
+export interface ConsumptionView {
+  number: number;
+  status: string;
+  server_entity_id: string | null;
+  finalized_at: string | null;
+}
+
+export interface ReconcileNumberingResponse {
+  reservation_id: string;
+  start_number: number;
+  end_number: number;
+  consumption: ConsumptionView[];
+  missing_on_server: number[];
+  unexpected_on_server: number[];
+}
+
+interface ReservationRow extends Record<string, unknown> {
+  id: string;
+  range_id: string;
+  start_number: string;
+  end_number: string;
+  status: string;
+}
+
+interface ConsumptionRow extends Record<string, unknown> {
+  number: string;
+  status: string;
+  server_entity_id: string | null;
+  finalized_at: string | null;
+}
+
+export class ReconcileNumberingCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(
+    id: string,
+    input: ReconcileNumberingInput,
+  ): Promise<ReconcileNumberingResponse> {
+    const { tenantId } = tenantScope(this.deps);
+    return inTransaction(this.deps, async (scope) => {
+      const reservation = await this.load(scope, tenantId, id);
+      if (!['reserved', 'consumed'].includes(reservation.status))
+        throw validationFailed([{ path: 'status', rule: 'transition' }]);
+      const start = bigintOf(reservation.start_number);
+      const end = bigintOf(reservation.end_number);
+      const claimed = [
+        ...new Set((input.claimed_numbers ?? []).map((value) => Number(value))),
+      ].sort((left, right) => left - right);
+      const outOfRange = claimed.filter(
+        (number) => number < start || number > end,
+      );
+      if (outOfRange.length > 0)
+        throw new DetranError('TEAT.NUMBERING_RECONCILE_MISMATCH', {
+          status: 422,
+          context: { outOfRange },
+          message: 'Números reclamados fora do intervalo da reserva.',
+        });
+
+      const applied = await this.appliedRows(scope, tenantId, reservation.id);
+      const missingOnServer: number[] = [];
+      const unexpectedOnServer: number[] = [];
+      const consumption: ConsumptionView[] = [];
+      for (let number = start; number <= end; number += 1) {
+        const act = applied.get(number);
+        const isClaimed = claimed.includes(number);
+        if (act) {
+          if (!isClaimed) unexpectedOnServer.push(number);
+          consumption.push({
+            number,
+            status: 'aplicado',
+            server_entity_id: act.server_entity_id,
+            finalized_at: act.finalized_at,
+          });
+          continue;
+        }
+        if (isClaimed) missingOnServer.push(number);
+        const status = isClaimed ? 'consumido_localmente' : 'disponivel';
+        await scope.query(
+          `insert into ops.numbering_consumption
+             (reservation_id, range_id, number, status, reconciled_at)
+           values ($1, $2, $3, $4, now())
+           on conflict (tenant_id, range_id, number)
+           do update set status = excluded.status, reconciled_at = now(),
+                         updated_at = now()`,
+          [reservation.id, reservation.range_id, number, status],
+        );
+        consumption.push({
+          number,
+          status,
+          server_entity_id: null,
+          finalized_at: null,
+        });
+      }
+
+      await scope.query(
+        `update ops.numbering_reservation
+            set reconciliation_json =
+                  coalesce(reconciliation_json, '{}'::jsonb) || $2::jsonb,
+                updated_at = now()
+          where id = $1`,
+        [
+          reservation.id,
+          JSON.stringify({
+            user_ref: input.user_ref ?? null,
+            claimed_numbers: claimed,
+            missing_on_server: missingOnServer,
+            unexpected_on_server: unexpectedOnServer,
+            at: new Date().toISOString(),
+          }),
+        ],
+      );
+
+      return {
+        reservation_id: reservation.id,
+        start_number: start,
+        end_number: end,
+        consumption,
+        missing_on_server: missingOnServer,
+        unexpected_on_server: unexpectedOnServer,
+      };
+    });
+  }
+
+  /** §5.12 — `GET …/{id}/consumption`, ordem `number asc`. */
+  async consumption(id: string): Promise<{
+    reservation_id: string;
+    status: string;
+    consumption: ConsumptionView[];
+  }> {
+    const { tenantId } = tenantScope(this.deps);
+    return inTransaction(this.deps, async (scope) => {
+      const reservation = await this.load(scope, tenantId, id);
+      const rows = await scope.query<ConsumptionRow>(
+        `select number::text as number, status, server_entity_id, finalized_at
+           from ops.numbering_consumption
+          where tenant_id = $1 and reservation_id = $2
+          order by number asc`,
+        [tenantId, reservation.id],
+      );
+      return {
+        reservation_id: reservation.id,
+        status: reservation.status,
+        consumption: rows.rows.map((row) => ({
+          number: bigintOf(row.number),
+          status: row.status,
+          server_entity_id: row.server_entity_id,
+          finalized_at: row.finalized_at,
+        })),
+      };
+    });
+  }
+
+  private async load(
+    scope: SqlScope,
+    tenantId: string,
+    id: string,
+  ): Promise<ReservationRow> {
+    const result = await scope.query<ReservationRow>(
+      `select * from ops.numbering_reservation where tenant_id = $1 and id = $2`,
+      [tenantId, id],
+    );
+    const row = result.rows[0];
+    if (!row) throw tenantMismatch();
+    return row;
+  }
+
+  private async appliedRows(
+    scope: SqlScope,
+    tenantId: string,
+    reservationId: string,
+  ): Promise<Map<number, ConsumptionRow>> {
+    const result = await scope.query<ConsumptionRow>(
+      `select number::text as number, status, server_entity_id, finalized_at
+         from ops.numbering_consumption
+        where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'`,
+      [tenantId, reservationId],
+    );
+    return new Map(result.rows.map((row) => [bigintOf(row.number), row]));
+  }
+}
+
+/** Leitura pública de `GET …/{id}/consumption` (§5.12). */
+export class NumberingConsumptionQuery {
+  private readonly command: ReconcileNumberingCommand;
+
+  constructor(deps: OfflineSyncDeps) {
+    this.command = new ReconcileNumberingCommand(deps);
+  }
+
+  readConsumption(id: string) {
+    return this.command.consumption(id);
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
new file mode 100644
index 0000000..6797ae9
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/reserve-numbering.command.ts
@@ -0,0 +1,252 @@
+// CTG-0002 §5.10 (M8, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
+// numbering-reservations/reserve`.
+//
+// [WF-TEAT-002]: `next_number` nunca ultrapassa `end_number` (check
+// `ck_ops_ait_numbering_range_bounds` do DDL 18), então "a faixa esgotou" se
+// realiza como "o último número alocado é `end_number`": a faixa fica
+// `exhausted` com `next_number = end_number` (§2, nota obrigatória de M8).
+import { teatEventSink } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import {
+  clockOf,
+  isoOf,
+  numberOf,
+  tenantScope,
+  validationFailed,
+  type OfflineSyncDeps,
+} from './batch-protocol.js';
+import { numberingReservationChangedEvent } from './events.js';
+import { bigintOf, inTransaction } from './numbering-sql.js';
+
+/** Chave do `parameter-catalogue.md` §TEAT (H.54: 72 horas vigentes). */
+const RESERVATION_TTL_KEY = 'teat.numbering.reservation_ttl_hours';
+
+export interface ReserveNumberingInput {
+  traffic_agency_id: string;
+  agent_id: string;
+  device_id: string;
+  shift_id: string;
+  idempotency_key: string;
+  range_id?: string;
+  series?: string;
+  requested_size?: number;
+  valid_until?: string;
+}
+
+export interface ReservationView {
+  id: string;
+  range_id: string;
+  start_number: number;
+  end_number: number;
+  valid_until: string;
+  status: string;
+}
+
+interface ReservationRow extends Record<string, unknown> {
+  id: string;
+  range_id: string;
+  start_number: string;
+  end_number: string;
+  valid_until: string;
+  status: string;
+  device_id: string;
+  shift_id: string | null;
+}
+
+function view(row: ReservationRow): ReservationView {
+  return {
+    id: row.id,
+    range_id: row.range_id,
+    start_number: bigintOf(row.start_number),
+    end_number: bigintOf(row.end_number),
+    valid_until: isoOf(row.valid_until),
+    status: row.status,
+  };
+}
+
+export class ReserveNumberingCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(input: ReserveNumberingInput): Promise<ReservationView> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const clock = clockOf(this.deps);
+    const now = clock.now();
+    const size = input.requested_size ? numberOf(input.requested_size) : 1;
+    const validUntil =
+      input.valid_until ?? (await this.defaultValidUntil(input, now));
+    const scope = { tenantId, actorId, occurredAt: now };
+
+    return inTransaction(this.deps, async ({ query, transaction }) => {
+      const replay = await query<ReservationRow>(
+        `select * from ops.numbering_reservation
+          where tenant_id = $1 and idempotency_key = $2`,
+        [tenantId, String(input.idempotency_key)],
+      );
+      const existing = replay.rows[0];
+      if (existing) {
+        const sameRequest =
+          String(existing.device_id) === String(input.device_id) &&
+          String(existing.shift_id ?? '') === String(input.shift_id ?? '') &&
+          bigintOf(existing.end_number) -
+            bigintOf(existing.start_number) +
+            1 ===
+            size;
+        if (!sameRequest)
+          throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
+            status: 409,
+            context: { idempotencyKey: String(input.idempotency_key) },
+            message: 'Chave de idempotência já usada com outro pedido.',
+          });
+        return view(existing);
+      }
+
+      const range = await this.lockRange(query, tenantId, input);
+      const active = await query<{ id: string }>(
+        `select id from ops.numbering_reservation
+          where tenant_id = $1 and device_id = $2
+            and shift_id is not distinct from $3 and status = 'reserved'
+          limit 1`,
+        [tenantId, String(input.device_id), input.shift_id ?? null],
+      );
+      if (active.rows[0])
+        throw new DetranError('TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', {
+          status: 409,
+          context: { reservationId: active.rows[0].id },
+          message: 'Já existe reserva vigente para o dispositivo e turno.',
+        });
+
+      const start = bigintOf(range.next_number);
+      const end = start + size - 1;
+      const rangeEnd = bigintOf(range.end_number);
+      if (range.status !== 'active' || end > rangeEnd)
+        throw new DetranError('TEAT.NUMBERING_RANGE_EXHAUSTED', {
+          status: 422,
+          context: { rangeId: range.id, series: range.series },
+          message: 'Faixa de numeração esgotada.',
+        });
+
+      await query(
+        `update ops.ait_numbering_range
+            set next_number = $2, status = $3, updated_at = now()
+          where id = $1`,
+        [
+          range.id,
+          end < rangeEnd ? end + 1 : rangeEnd,
+          end < rangeEnd ? 'active' : 'exhausted',
+        ],
+      );
+      const inserted = await query<ReservationRow>(
+        `insert into ops.numbering_reservation
+           (range_id, traffic_agency_id, agent_id, device_id, shift_id,
+            idempotency_key, start_number, end_number, reserved_at, valid_until,
+            status)
+         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'reserved')
+         returning *`,
+        [
+          range.id,
+          String(input.traffic_agency_id),
+          String(input.agent_id),
+          String(input.device_id),
+          input.shift_id ?? null,
+          String(input.idempotency_key),
+          start,
+          end,
+          now,
+          validUntil,
+        ],
+      );
+      const row = inserted.rows[0]!;
+      await teatEventSink(this.deps.outbox).append(
+        transaction,
+        numberingReservationChangedEvent(scope, {
+          reservationId: row.id,
+          rangeId: row.range_id,
+          agentId: String(input.agent_id),
+          deviceId: String(input.device_id),
+          shiftId: input.shift_id ?? null,
+          startNumber: start,
+          endNumber: end,
+          validUntil: isoOf(row.valid_until),
+          status: 'reserved',
+          action: 'reserve',
+        }),
+      );
+      return view(row);
+    });
+  }
+
+  private async lockRange(
+    query: (
+      sql: string,
+      values?: readonly unknown[],
+    ) => Promise<{ rows: Record<string, unknown>[] }>,
+    tenantId: string,
+    input: ReserveNumberingInput,
+  ): Promise<{
+    id: string;
+    series: string;
+    next_number: string;
+    end_number: string;
+    status: string;
+  }> {
+    const result = input.range_id
+      ? await query(
+          `select * from ops.ait_numbering_range
+            where tenant_id = $1 and id = $2 for update`,
+          [tenantId, String(input.range_id)],
+        )
+      : await query(
+          `select * from ops.ait_numbering_range
+            where tenant_id = $1 and traffic_agency_id = $2
+              and series = $3 and status = 'active'
+            order by created_at
+            limit 1 for update`,
+          [
+            tenantId,
+            String(input.traffic_agency_id),
+            String(input.series ?? ''),
+          ],
+        );
+    const row = result.rows[0] as
+      | {
+          id: string;
+          series: string;
+          next_number: string;
+          end_number: string;
+          status: string;
+        }
+      | undefined;
+    if (!row)
+      throw new DetranError('TEAT.NUMBERING_RANGE_EXHAUSTED', {
+        status: 422,
+        context: {
+          rangeId: input.range_id ?? null,
+          series: input.series ?? null,
+        },
+        message: 'Nenhuma faixa de numeração vigente para a série.',
+      });
+    return row;
+  }
+
+  /**
+   * §5.10 pré-condição 5 — TTL do catálogo, nunca constante no código. Sem a
+   * linha vigente não há prazo a aplicar: o pedido precisa trazer
+   * `valid_until`.
+   */
+  private async defaultValidUntil(
+    input: ReserveNumberingInput,
+    now: string,
+  ): Promise<string> {
+    const row = await this.deps.parameters
+      ?.get(RESERVATION_TTL_KEY, {
+        agencyId: String(input.traffic_agency_id),
+      })
+      .catch(() => undefined);
+    const hours =
+      row?.value_json == null ? Number.NaN : numberOf(row.value_json);
+    if (!Number.isFinite(hours))
+      throw validationFailed([{ path: 'valid_until', rule: 'required' }]);
+    return new Date(new Date(now).getTime() + hours * 3_600_000).toISOString();
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/resolve-conflict.command.ts b/backend/domains/ops/offline-sync/src/handwritten/resolve-conflict.command.ts
new file mode 100644
index 0000000..62cca4e
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/resolve-conflict.command.ts
@@ -0,0 +1,154 @@
+// CTG-0002 §5.13 (R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
+// sync-conflicts/{id}/resolve`.
+//
+// `manual_review` grava a decisão e **mantém** o conflito `open`: num conflito
+// de concorrência a apuração só se encerra por `aits/{id}/concurrency-review`
+// (CTG-0001 §4.8), nunca por esta rota.
+import { teatEventSink } from '@detran/ops-core';
+import { DetranError } from '@detran/shared';
+
+import {
+  clockOf,
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type OfflineSyncDeps,
+} from './batch-protocol.js';
+import { syncConflictResolvedEvent } from './events.js';
+import { inTransaction } from './numbering-sql.js';
+
+const RESOLUTION_ACTIONS = [
+  'manual_review',
+  'accept_server',
+  'reject',
+  'retry_after_correction',
+] as const;
+
+type ResolutionAction = (typeof RESOLUTION_ACTIONS)[number];
+
+/** §5.13 — efeito da ação sobre `ops.sync_queue_item`. */
+const ITEM_STATUS: Readonly<Record<string, string>> = {
+  accept_server: 'rejected',
+  reject: 'rejected',
+  retry_after_correction: 'pending',
+};
+
+export interface ResolveSyncConflictInput {
+  resolved_by_user_ref?: string;
+  resolution_action?: string;
+  description?: string;
+}
+
+export interface ResolveSyncConflictResponse {
+  id: string;
+  status: string;
+  resolution_action: string;
+  resolved_at: string | null;
+}
+
+interface ConflictRow extends Record<string, unknown> {
+  id: string;
+  sync_queue_item_id: string;
+  conflict_type: string;
+  allowed_resolution_actions: string[] | null;
+  status: string;
+}
+
+export class ResolveSyncConflictCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(
+    id: string,
+    input: ResolveSyncConflictInput,
+  ): Promise<ResolveSyncConflictResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    const action = String(input.resolution_action ?? '') as ResolutionAction;
+    if (!RESOLUTION_ACTIONS.includes(action))
+      throw validationFailed([{ path: 'resolution_action', rule: 'enum' }]);
+    if (!input.resolved_by_user_ref)
+      throw validationFailed([
+        { path: 'resolved_by_user_ref', rule: 'required' },
+      ]);
+
+    return inTransaction(this.deps, async (scope) => {
+      const found = await scope.query<ConflictRow>(
+        `select * from ops.sync_conflict where tenant_id = $1 and id = $2 for update`,
+        [tenantId, id],
+      );
+      const conflict = found.rows[0];
+      if (!conflict) throw tenantMismatch();
+      // `manual_review` não resolve: encaminha. É sempre admitido enquanto o
+      // conflito está aberto; a lista `allowed_resolution_actions` governa as
+      // ações que **encerram** o conflito (§5.13).
+      const allowed = conflict.allowed_resolution_actions ?? [];
+      if (
+        conflict.status !== 'open' ||
+        (action !== 'manual_review' && !allowed.includes(action))
+      )
+        throw new DetranError('TEAT.SYNC_ITEM_CONFLICT', {
+          status: 409,
+          context: {
+            conflictId: conflict.id,
+            conflictType: conflict.conflict_type,
+          },
+          message: 'Ação de resolução não admitida para este conflito.',
+        });
+
+      const details = { description: input.description ?? null };
+      if (action === 'manual_review') {
+        await scope.query(
+          `update ops.sync_conflict
+              set resolution_action = $2, resolution_details_json = $3::jsonb,
+                  updated_at = now()
+            where id = $1`,
+          [conflict.id, action, JSON.stringify(details)],
+        );
+        return {
+          id: conflict.id,
+          status: 'open',
+          resolution_action: action,
+          resolved_at: null,
+        };
+      }
+
+      await scope.query(
+        `update ops.sync_conflict
+            set status = 'resolved', resolved_by_user_ref = $2, resolved_at = $3,
+                resolution_action = $4, resolution_details_json = $5::jsonb,
+                updated_at = now()
+          where id = $1`,
+        [
+          conflict.id,
+          String(input.resolved_by_user_ref),
+          now,
+          action,
+          JSON.stringify(details),
+        ],
+      );
+      await scope.query(
+        `update ops.sync_queue_item set status = $2, updated_at = now()
+          where tenant_id = $1 and id = $3`,
+        [tenantId, ITEM_STATUS[action]!, conflict.sync_queue_item_id],
+      );
+      await teatEventSink(this.deps.outbox).append(
+        scope.transaction,
+        syncConflictResolvedEvent(
+          { tenantId, actorId, occurredAt: now },
+          {
+            conflictId: conflict.id,
+            conflictType: conflict.conflict_type,
+            resolutionAction: action,
+            resolvedAt: now,
+          },
+        ),
+      );
+      return {
+        id: conflict.id,
+        status: 'resolved',
+        resolution_action: action,
+        resolved_at: now,
+      };
+    });
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/settle-numbering.command.ts b/backend/domains/ops/offline-sync/src/handwritten/settle-numbering.command.ts
new file mode 100644
index 0000000..2f6993f
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/settle-numbering.command.ts
@@ -0,0 +1,224 @@
+// CTG-0002 §2 e §5.11 (M8, R-0008, TASK-0005) — `cancel` · `block` · `close`
+// de uma reserva de numeração.
+//
+// A tabela não tem colunas de motivo/data de liquidação (§11.11): o ato vai em
+// `reconciliation_json.lifecycle`. O catálogo não tem código de estado inválido
+// de reserva (§11.12/OD-T29): transição negada é 422 `TEAT.VALIDATION_FAILED`
+// com `fields:[{ path:'status', rule:'transition' }]`.
+import { teatEventSink } from '@detran/ops-core';
+
+import {
+  clockOf,
+  isoOf,
+  tenantMismatch,
+  tenantScope,
+  validationFailed,
+  type OfflineSyncDeps,
+} from './batch-protocol.js';
+import { numberingReservationChangedEvent } from './events.js';
+import { bigintOf, inTransaction, type SqlScope } from './numbering-sql.js';
+
+export type SettleAction = 'cancel' | 'block' | 'close';
+
+export interface SettleNumberingInput {
+  user_ref?: string;
+  reason?: string;
+}
+
+export interface SettleNumberingResponse {
+  id: string;
+  status: string;
+  released_from?: number;
+  released_to?: number;
+}
+
+/** §2 — estados admitidos por comando; o quarto é o desfecho idempotente. */
+const TRANSITIONS: Readonly<
+  Record<
+    SettleAction,
+    { from: readonly string[]; to: string; idempotent: string }
+  >
+> = {
+  cancel: { from: ['reserved'], to: 'cancelled', idempotent: 'cancelled' },
+  block: {
+    from: ['reserved', 'expired'],
+    to: 'blocked',
+    idempotent: 'blocked',
+  },
+  close: {
+    from: ['reserved', 'expired'],
+    to: 'consumed',
+    idempotent: 'consumed',
+  },
+};
+
+interface ReservationRow extends Record<string, unknown> {
+  id: string;
+  range_id: string;
+  agent_id: string;
+  device_id: string;
+  shift_id: string | null;
+  start_number: string;
+  end_number: string;
+  valid_until: string;
+  status: string;
+  reconciliation_json: Record<string, unknown> | null;
+}
+
+export class SettleNumberingCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  cancel(id: string, input: SettleNumberingInput) {
+    return this.execute(id, input, 'cancel');
+  }
+
+  block(id: string, input: SettleNumberingInput) {
+    return this.execute(id, input, 'block');
+  }
+
+  close(id: string, input: SettleNumberingInput) {
+    return this.execute(id, input, 'close');
+  }
+
+  async execute(
+    id: string,
+    input: SettleNumberingInput,
+    action: SettleAction,
+  ): Promise<SettleNumberingResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const now = clockOf(this.deps).now();
+    const transition = TRANSITIONS[action];
+    return inTransaction(this.deps, async (scope) => {
+      const reservation = await this.load(scope, tenantId, id);
+      if (reservation.status === transition.idempotent)
+        return { id: reservation.id, status: reservation.status };
+      if (!transition.from.includes(reservation.status))
+        throw validationFailed([{ path: 'status', rule: 'transition' }]);
+
+      const consumed = await this.appliedNumbers(scope, tenantId, reservation);
+      const start = bigintOf(reservation.start_number);
+      const end = bigintOf(reservation.end_number);
+      if (action === 'cancel' && consumed.length === end - start + 1)
+        throw validationFailed([{ path: 'status', rule: 'fully_consumed' }]);
+
+      const lifecycle = {
+        action,
+        user_ref: input.user_ref ?? null,
+        reason: input.reason ?? null,
+        at: now,
+      };
+      await scope.query(
+        `update ops.numbering_reservation
+            set status = $2,
+                reconciliation_json =
+                  coalesce(reconciliation_json, '{}'::jsonb) ||
+                  jsonb_build_object('lifecycle', $3::jsonb),
+                updated_at = now()
+          where id = $1`,
+        [reservation.id, transition.to, JSON.stringify(lifecycle)],
+      );
+      if (action !== 'close')
+        await scope.query(
+          `update ops.numbering_consumption
+              set status = $3, updated_at = now()
+            where tenant_id = $1 and reservation_id = $2 and status <> 'aplicado'`,
+          [
+            tenantId,
+            reservation.id,
+            action === 'block' ? 'bloqueado' : 'expirado',
+          ],
+        );
+
+      const released =
+        action === 'cancel'
+          ? await this.releaseTail(scope, reservation, consumed)
+          : undefined;
+
+      await teatEventSink(this.deps.outbox).append(
+        scope.transaction,
+        numberingReservationChangedEvent(
+          { tenantId, actorId, occurredAt: now },
+          {
+            reservationId: reservation.id,
+            rangeId: reservation.range_id,
+            agentId: reservation.agent_id,
+            deviceId: reservation.device_id,
+            shiftId: reservation.shift_id,
+            startNumber: start,
+            endNumber: end,
+            validUntil: isoOf(reservation.valid_until),
+            status: transition.to,
+            action,
+          },
+          2,
+        ),
+      );
+      return { id: reservation.id, status: transition.to, ...released };
+    });
+  }
+
+  private async load(
+    scope: SqlScope,
+    tenantId: string,
+    id: string,
+  ): Promise<ReservationRow> {
+    const result = await scope.query<ReservationRow>(
+      `select * from ops.numbering_reservation
+        where tenant_id = $1 and id = $2 for update`,
+      [tenantId, id],
+    );
+    const row = result.rows[0];
+    if (!row) throw tenantMismatch();
+    return row;
+  }
+
+  private async appliedNumbers(
+    scope: SqlScope,
+    tenantId: string,
+    reservation: ReservationRow,
+  ): Promise<number[]> {
+    const result = await scope.query<{ number: string }>(
+      `select number::text as number from ops.numbering_consumption
+        where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'
+        order by number`,
+      [tenantId, reservation.id],
+    );
+    return result.rows.map((row) => bigintOf(row.number));
+  }
+
+  /**
+   * §5.11 — a cauda só volta à faixa quando a reserva **é** a cauda corrente
+   * (`end_number = range.next_number − 1`). Lacunas interiores nunca são
+   * realocadas ([RN-TEAT-113] não define devolução).
+   */
+  private async releaseTail(
+    scope: SqlScope,
+    reservation: ReservationRow,
+    consumed: readonly number[],
+  ): Promise<{ released_from?: number; released_to?: number }> {
+    const range = await scope.query<{
+      id: string;
+      next_number: string;
+      status: string;
+    }>(
+      `select id, next_number::text as next_number, status
+         from ops.ait_numbering_range where id = $1 for update`,
+      [reservation.range_id],
+    );
+    const row = range.rows[0];
+    if (!row) return {};
+    const start = bigintOf(reservation.start_number);
+    const end = bigintOf(reservation.end_number);
+    if (bigintOf(row.next_number) !== end + 1) return {};
+    const highestConsumed = consumed.length ? Math.max(...consumed) : start - 1;
+    const releaseFrom = highestConsumed + 1;
+    if (releaseFrom > end) return {};
+    await scope.query(
+      `update ops.ait_numbering_range
+          set next_number = $2, status = 'active', updated_at = now()
+        where id = $1`,
+      [row.id, releaseFrom],
+    );
+    return { released_from: releaseFrom, released_to: end };
+  }
+}
diff --git a/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
new file mode 100644
index 0000000..5fff86c
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
@@ -0,0 +1,884 @@
+// CTG-0002 §4 e §5.13 (M5–M7, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
+// sync-batches`: o único ponto de entrada do protocolo de sincronização.
+//
+// Ordem das etapas, que é parte do contrato (§4.1): replay de lote → guarda de
+// sequência → materialização dos itens → detecção de concorrência → aplicação
+// item a item, **uma transação por item** → recibos → lote → eventos.
+//
+// Fronteira de persistência: a escrituração do protocolo (fila, recibo,
+// conflito, lote) passa pela porta de repositório injetada; o efeito de
+// domínio do item roda numa transação própria, que é a que o applier recebe e
+// a que carrega os eventos do item. Uma falha do applier reverte a transação
+// inteira e o recibo de recusa é gravado depois, fora dela (§4.3 passo 5).
+import type { OpsRow, SyncEntityApplier } from '@detran/ops-core';
+import {
+  asQueryable,
+  createOpsRow,
+  teatEventSink,
+  type SyncEntityApplierItem,
+} from '@detran/ops-core';
+import { DetranError, type TeatEventEnvelope } from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+
+import {
+  ALLOWED_RESOLUTION_ACTIONS,
+  CONFLICT_DESCRIPTION,
+  SUPPORTED_ENTITY_TYPES,
+  clockOf,
+  numberOf,
+  outcomeFor,
+  ownedBy,
+  storeOf,
+  tenantScope,
+  type ConflictType,
+  type OfflineSyncDeps,
+  type ReceiptStatus,
+} from './batch-protocol.js';
+import { canonicalHash } from './canonical-hash.js';
+import {
+  CONCURRENCY_WINDOW_KEY,
+  CONCURRENCY_WINDOW_WARNING,
+  concurrentCandidates,
+  windowBounds,
+  windowFrom,
+} from './concurrency-detector.js';
+import {
+  aitConcurrencySuspectedEvent,
+  aitReceivedEvent,
+  syncConflictOpenedEvent,
+  syncItemReceivedEvent,
+  type EventScope,
+} from './events.js';
+
+export interface SyncBatchItemInput {
+  entity_type: string;
+  local_entity_id: string;
+  server_entity_id?: string;
+  idempotency_key?: string;
+  payload_hash: string;
+  created_locally_at?: string;
+  payload_json?: Record<string, unknown>;
+}
+
+export interface SubmitSyncBatchInput {
+  traffic_agency_id: string;
+  device_id: string;
+  agent_id: string;
+  device_batch_id: string;
+  batch_sequence?: number | null;
+  items: SyncBatchItemInput[];
+}
+
+export interface SyncReceiptView {
+  local_entity_id: string | null;
+  idempotency_key: string | null;
+  status: string | null;
+  server_entity_id: string | null;
+  error_code: string | null;
+  error_message: string | null;
+  details_json: Record<string, unknown> | null;
+}
+
+export interface SubmitSyncBatchResponse {
+  batchId: string | null;
+  batch_sequence: number | null;
+  accepted_items: number;
+  receipts: SyncReceiptView[];
+  warnings: string[];
+}
+
+interface PreparedItem {
+  raw: SyncBatchItemInput;
+  entityType: string;
+  localEntityId: string;
+  idempotencyKey: string;
+  payloadHash: string;
+  createdLocallyAt: string;
+  /** Recibo já existente (replay de item) — nada mais acontece. */
+  existingReceipt?: OpsRow;
+  /** Linha de fila criada para o item deste lote. */
+  itemRow?: OpsRow;
+  receiptRow?: OpsRow;
+  /** Desfecho já decidido antes da aplicação. */
+  closed?: { code: string; context: Record<string, unknown> };
+  /** Recibo sintético: o item existe com a mesma chave e outro hash (§4.2). */
+  transient?: SyncReceiptView;
+  applier?: SyncEntityApplier;
+  concurrencySuspect?: boolean;
+  concurrencyContext?: Record<string, unknown>;
+}
+
+/** §4.2 — chave derivada do caminho legado. */
+function legacyKey(deviceId: string, localEntityId: string): string {
+  return `legacy:${deviceId}:${localEntityId}`;
+}
+
+function receiptView(row: OpsRow): SyncReceiptView {
+  const details = (row.details_json ?? null) as Record<string, unknown> | null;
+  return {
+    local_entity_id: (row.local_entity_id as string) ?? null,
+    idempotency_key: (row.idempotency_key as string) ?? null,
+    status: (row.status as string) ?? null,
+    server_entity_id: (row.server_entity_id as string) ?? null,
+    error_code: (row.reason_code as string) ?? null,
+    error_message: null,
+    details_json: details,
+  };
+}
+
+export class SubmitBatchCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const clock = clockOf(this.deps);
+    const scope: EventScope = { tenantId, actorId, occurredAt: clock.now() };
+    const deviceId = String(input.device_id);
+    const deviceBatchId = String(input.device_batch_id);
+    const sequence =
+      input.batch_sequence === undefined || input.batch_sequence === null
+        ? null
+        : numberOf(input.batch_sequence);
+    const rawItems = input.items ?? [];
+
+    const batches = storeOf(this.deps, 'batches');
+    const deviceBatches = ownedBy(await batches.list(), tenantId).filter(
+      (row) => String(row.device_id) === deviceId,
+    );
+    const replayed = deviceBatches.find(
+      (row) => String(row.device_batch_id) === deviceBatchId,
+    );
+    if (replayed)
+      return this.replay(replayed, rawItems, sequence, deviceId, tenantId);
+    this.assertSequence(deviceBatches, sequence, deviceBatchId);
+
+    const window = await this.concurrencyWindow(input.traffic_agency_id);
+    const warnings =
+      window.minutes === null ? [CONCURRENCY_WINDOW_WARNING] : [];
+
+    const prepared: PreparedItem[] = [];
+    for (const raw of rawItems) {
+      prepared.push(await this.materialize(raw, input, tenantId));
+    }
+    if (window.minutes !== null) {
+      await this.detectConcurrency(
+        prepared,
+        input,
+        tenantId,
+        scope,
+        window.minutes,
+      );
+    }
+
+    const receipts: SyncReceiptView[] = [];
+    for (const item of prepared) {
+      receipts.push(await this.settle(item, input, sequence, scope));
+    }
+
+    const acceptedItems = receipts.filter(
+      (receipt) =>
+        receipt.status !== 'rejected' && receipt.status !== 'conflict',
+    ).length;
+    const itemIds = prepared
+      .map((item) => item.itemRow?.id)
+      .filter((id): id is string => typeof id === 'string');
+    const batchRow = await batches.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      agent_id: String(input.agent_id),
+      device_id: deviceId,
+      device_batch_id: deviceBatchId,
+      batch_sequence: sequence,
+      submitted_at: scope.occurredAt,
+      accepted_items: acceptedItems,
+      receipts_json: { item_ids: itemIds },
+    });
+
+    return {
+      batchId: (batchRow.id as string) ?? null,
+      batch_sequence: sequence,
+      accepted_items: acceptedItems,
+      receipts,
+      warnings,
+    };
+  }
+
+  /** §4.1 passo 3 — retransmissão do último lote: recibos originais, sem efeito. */
+  private async replay(
+    batch: OpsRow,
+    rawItems: SyncBatchItemInput[],
+    sequence: number | null,
+    deviceId: string,
+    tenantId: string,
+  ): Promise<SubmitSyncBatchResponse> {
+    const deviceBatchId = String(batch.device_batch_id);
+    const stored =
+      batch.batch_sequence === null || batch.batch_sequence === undefined
+        ? null
+        : numberOf(batch.batch_sequence);
+    if (stored !== sequence) throw replayMismatch(deviceBatchId);
+    const itemIds = (
+      ((batch.receipts_json ?? {}) as { item_ids?: string[] }).item_ids ?? []
+    ).map(String);
+    const items = ownedBy(
+      await storeOf(this.deps, 'items').list(),
+      tenantId,
+    ).filter((row) => itemIds.includes(String(row.id)));
+    const storedKeys = items
+      .map((row) => String(row.idempotency_key))
+      .sort()
+      .join('|');
+    const incomingKeys = rawItems
+      .map((raw) =>
+        raw.idempotency_key
+          ? String(raw.idempotency_key)
+          : legacyKey(deviceId, String(raw.local_entity_id)),
+      )
+      .sort()
+      .join('|');
+    if (storedKeys !== incomingKeys) throw replayMismatch(deviceBatchId);
+    const receiptRows = ownedBy(
+      await storeOf(this.deps, 'receipts').list(),
+      tenantId,
+    );
+    const receipts = itemIds
+      .map((itemId) =>
+        receiptRows.find((row) => String(row.sync_queue_item_id) === itemId),
+      )
+      .filter((row): row is OpsRow => row !== undefined)
+      .map(receiptView);
+    return {
+      batchId: (batch.id as string) ?? null,
+      batch_sequence: stored,
+      accepted_items: numberOf(batch.accepted_items ?? receipts.length),
+      receipts,
+      warnings: [],
+    };
+  }
+
+  /**
+   * §4.1 passo 4 — sequência. Sem nenhum lote sequenciado do dispositivo não há
+   * de onde medir lacuna: a primeira sequência recebida estabelece a base.
+   */
+  private assertSequence(
+    deviceBatches: OpsRow[],
+    sequence: number | null,
+    deviceBatchId: string,
+  ): void {
+    if (sequence === null) return;
+    const sequences = deviceBatches
+      .map((row) => row.batch_sequence)
+      .filter((value) => value !== null && value !== undefined)
+      .map(numberOf)
+      .filter((value) => Number.isFinite(value));
+    if (sequences.length === 0) return;
+    const last = Math.max(...sequences);
+    if (sequence <= last)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_REPLAYED', {
+        status: 409,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote já aceita para o dispositivo.',
+      });
+    if (sequence > last + 1)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_GAP', {
+        status: 422,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote com lacuna; reenvie os lotes anteriores.',
+      });
+  }
+
+  private async concurrencyWindow(
+    agencyId: string,
+  ): Promise<{ minutes: number | null }> {
+    const parameters = this.deps.parameters;
+    if (!parameters) return { minutes: null };
+    try {
+      const row = await parameters.get(CONCURRENCY_WINDOW_KEY, {
+        agencyId: agencyId ? String(agencyId) : undefined,
+      });
+      return windowFrom(row ?? {});
+    } catch {
+      // Linha ausente no catálogo do tenant: detecção desligada (§4.7).
+      return { minutes: null };
+    }
+  }
+
+  /** §4.2 — identidade, integridade e materialização de um item. */
+  private async materialize(
+    raw: SyncBatchItemInput,
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+  ): Promise<PreparedItem> {
+    const deviceId = String(input.device_id);
+    const entityType = String(raw.entity_type);
+    const localEntityId = String(raw.local_entity_id);
+    const legacy = !raw.idempotency_key;
+    const idempotencyKey = legacy
+      ? legacyKey(deviceId, localEntityId)
+      : String(raw.idempotency_key);
+    const payloadHash = String(raw.payload_hash);
+    const createdLocallyAt = raw.created_locally_at
+      ? String(raw.created_locally_at)
+      : clockOf(this.deps).now();
+    const base: PreparedItem = {
+      raw,
+      entityType,
+      localEntityId,
+      idempotencyKey,
+      payloadHash,
+      createdLocallyAt,
+    };
+
+    const items = storeOf(this.deps, 'items');
+    const known = ownedBy(await items.list(), tenantId).find(
+      (row) => String(row.idempotency_key) === idempotencyKey,
+    );
+    if (known) {
+      const storedHash = String(known.payload_hash);
+      const receipts = ownedBy(
+        await storeOf(this.deps, 'receipts').list(),
+        tenantId,
+      );
+      const receipt = receipts.find(
+        (row) => String(row.sync_queue_item_id) === String(known.id),
+      );
+      if (storedHash === payloadHash)
+        return receipt
+          ? { ...base, existingReceipt: receipt }
+          : {
+              ...base,
+              itemRow: known,
+              transient: {
+                local_entity_id: localEntityId,
+                idempotency_key: idempotencyKey,
+                status: String(known.status ?? 'received'),
+                server_entity_id: (known.server_entity_id as string) ?? null,
+                error_code: (known.error_code as string) ?? null,
+                error_message: null,
+                details_json: null,
+              },
+            };
+      {
+        const context = {
+          idempotencyKey,
+          storedHash,
+          receivedHash: payloadHash,
+        };
+        await this.openConflict(
+          known,
+          'integrity',
+          'TEAT.SYNC_INTEGRITY_ERROR',
+          {
+            local: payloadHash,
+            server: storedHash,
+          },
+        );
+        // Os índices `(tenant_id, idempotency_key)` de `ops.sync_queue_item` e
+        // `ops.sync_receipt` são únicos: a chave já tem fila e recibo próprios,
+        // então o registro durável da divergência é o conflito e o recibo da
+        // resposta é sintético.
+        return {
+          ...base,
+          itemRow: known,
+          transient: {
+            local_entity_id: localEntityId,
+            idempotency_key: idempotencyKey,
+            status: 'rejected',
+            server_entity_id: null,
+            error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
+            error_message: null,
+            details_json: context,
+          },
+        };
+      }
+    }
+
+    const itemRow = await items.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      device_id: deviceId,
+      agent_id: String(input.agent_id),
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      status: 'pending',
+      created_locally_at: createdLocallyAt,
+      idempotency_key: idempotencyKey,
+      payload_hash: payloadHash,
+      payload_json: raw.payload_json ?? {},
+    });
+    const receiptRow = await storeOf(this.deps, 'receipts').create({
+      sync_queue_item_id: String(itemRow.id),
+      idempotency_key: idempotencyKey,
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      accepted_hash: payloadHash,
+      status: 'received',
+    });
+    const prepared: PreparedItem = { ...base, itemRow, receiptRow };
+
+    if (legacy)
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED', context: {} },
+      };
+    if (raw.payload_json && canonicalHash(raw.payload_json) !== payloadHash) {
+      const context = {
+        idempotencyKey,
+        storedHash: canonicalHash(raw.payload_json),
+        receivedHash: payloadHash,
+      };
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_INTEGRITY_ERROR', context },
+      };
+    }
+    if (!SUPPORTED_ENTITY_TYPES.includes(entityType))
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE',
+          context: { supported: [...SUPPORTED_ENTITY_TYPES] },
+        },
+      };
+    const applier = (this.deps.appliers ?? []).find(
+      (candidate) => candidate.entityType === entityType,
+    );
+    if (!applier)
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
+          context: { entityType },
+        },
+      };
+    const rejection = applier.validate(raw.payload_json ?? {});
+    if (rejection)
+      return {
+        ...prepared,
+        closed: {
+          code: rejection.code,
+          context: { fields: [...rejection.fields] },
+        },
+      };
+    return { ...prepared, applier };
+  }
+
+  /** §4.7 — marca os dois lados quando a janela está ligada. */
+  private async detectConcurrency(
+    prepared: PreparedItem[],
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+    scope: EventScope,
+    windowMinutes: number,
+  ): Promise<void> {
+    const items = storeOf(this.deps, 'items');
+    const handoffStore = this.deps.repositories.handoffs;
+    const handoffs = handoffStore
+      ? ownedBy(await handoffStore.list(), tenantId)
+      : [];
+    const deviceId = String(input.device_id);
+    const agentId = String(input.agent_id);
+    for (const item of prepared) {
+      if (item.entityType !== 'ait' || !item.itemRow) continue;
+      // O ato existe e está na fila: a apuração vale mesmo quando o destino
+      // ainda não está montado (§4.7 fala do item `ait` do lote, não do
+      // applier). Itens sem identidade estável (legado), com integridade
+      // quebrada ou de tipo não suportado ficam fora.
+      const applicable =
+        item.applier !== undefined ||
+        item.closed?.code === 'TEAT.SYNC_DESTINATION_NOT_WIRED';
+      if (!applicable) continue;
+      const rows = ownedBy(await items.list(), tenantId);
+      const candidates = concurrentCandidates({
+        items: rows,
+        handoffs,
+        agentId,
+        deviceId,
+        createdLocallyAt: item.createdLocallyAt,
+        windowMinutes,
+        excludeItemId: String(item.itemRow.id),
+      });
+      if (candidates.length === 0) continue;
+      const bounds = windowBounds(item.createdLocallyAt, windowMinutes);
+      const context = {
+        otherDeviceId: String(candidates[0]!.device_id),
+        ...bounds,
+        windowMinutes,
+        conflictingQueueItemIds: candidates.map((row) => String(row.id)),
+      };
+      item.concurrencySuspect = true;
+      item.concurrencyContext = context;
+      const conflict = await this.openConflict(
+        item.itemRow,
+        'concurrency',
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+      );
+      item.concurrencyContext = {
+        ...context,
+        conflictId: (conflict?.id as string) ?? null,
+      };
+      await this.emit(
+        syncConflictOpenedEvent(scope, {
+          conflictId: String(conflict?.id ?? ''),
+          conflictType: 'concurrency',
+          syncQueueItemId: String(item.itemRow.id),
+          reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+          openedAt: scope.occurredAt,
+        }),
+      );
+      for (const candidate of candidates) {
+        await this.markCandidate(
+          candidate,
+          item,
+          windowMinutes,
+          scope,
+          tenantId,
+        );
+      }
+    }
+  }
+
+  private async markCandidate(
+    candidate: OpsRow,
+    item: PreparedItem,
+    windowMinutes: number,
+    scope: EventScope,
+    tenantId: string,
+  ): Promise<void> {
+    const bounds = windowBounds(
+      String(candidate.created_locally_at),
+      windowMinutes,
+    );
+    const context = {
+      otherDeviceId: String(item.itemRow?.device_id ?? ''),
+      ...bounds,
+      windowMinutes,
+      conflictingQueueItemIds: [String(item.itemRow?.id ?? '')],
+    };
+    await storeOf(this.deps, 'items').update(String(candidate.id), {
+      status: 'conflict',
+      error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    });
+    const receipts = storeOf(this.deps, 'receipts');
+    const existing = ownedBy(await receipts.list(), tenantId).find(
+      (row) => String(row.sync_queue_item_id) === String(candidate.id),
+    );
+    if (existing)
+      await receipts.update(String(existing.id), {
+        status: 'conflict',
+        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        details_json: context,
+      });
+    const conflict = await this.openConflict(
+      candidate,
+      'concurrency',
+      'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    );
+    await this.emit(
+      syncConflictOpenedEvent(scope, {
+        conflictId: String(conflict?.id ?? ''),
+        conflictType: 'concurrency',
+        syncQueueItemId: String(candidate.id),
+        reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        openedAt: scope.occurredAt,
+      }),
+    );
+  }
+
+  /** §4.3 — aplicação (ou desfecho já decidido) de um item. */
+  private async settle(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+  ): Promise<SyncReceiptView> {
+    if (item.existingReceipt) return receiptView(item.existingReceipt);
+    if (item.transient) return item.transient;
+    if (!item.itemRow || !item.receiptRow)
+      throw new Error('Sync item was not materialized');
+
+    if (item.concurrencySuspect && item.concurrencyContext && item.closed) {
+      // O ato ficou barrado pela apuração antes de ter destino: o desfecho do
+      // item é o conflito de concorrência (§4.4), e o AIT do servidor ainda
+      // não existe — o evento identifica o ato pelo id local.
+      const view = await this.close(
+        item,
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        item.concurrencyContext,
+        null,
+        'already-open',
+      );
+      await this.emitConcurrencyEvent(item, item.localEntityId, scope);
+      await this.publishItemEvent(item, input, sequence, scope, view);
+      return view;
+    }
+    if (item.closed) {
+      const view = await this.close(
+        item,
+        item.closed.code,
+        item.closed.context,
+        null,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view);
+      return view;
+    }
+
+    const applier = item.applier;
+    if (!applier) throw new Error('Sync item has no applier');
+    const applierItem: SyncEntityApplierItem = {
+      id: String(item.itemRow.id),
+      tenantId: scope.tenantId,
+      trafficAgencyId: String(input.traffic_agency_id),
+      deviceId: String(input.device_id),
+      agentId: String(input.agent_id),
+      entityType: item.entityType,
+      localEntityId: item.localEntityId,
+      idempotencyKey: item.idempotencyKey,
+      payloadHash: item.payloadHash,
+      createdLocallyAt: item.createdLocallyAt,
+      concurrencySuspect: item.concurrencySuspect === true,
+      receiptId: String(item.receiptRow.id),
+    };
+    let serverEntityId: string;
+    try {
+      serverEntityId = await this.deps.database.tx(async (tx) => {
+        await lockDeviceScope(tx, scope.tenantId, applierItem.deviceId);
+        const applied = await applier.apply(applierItem, tx as Transaction);
+        const sink = teatEventSink(this.deps.outbox);
+        if (item.entityType === 'ait') {
+          const suspectContext = item.concurrencyContext;
+          if (applierItem.concurrencySuspect && suspectContext)
+            await sink.append(
+              tx as Transaction,
+              concurrencyEnvelope(item, applied.serverEntityId, scope),
+            );
+          else
+            await sink.append(
+              tx as Transaction,
+              aitReceivedEvent(scope, {
+                aitId: applied.serverEntityId,
+                fromState: 'TRANSMITIDO',
+                receiptProtocol: applierItem.receiptId,
+                receivedAt: scope.occurredAt,
+              }),
+            );
+        }
+        await sink.append(
+          tx as Transaction,
+          syncItemReceivedEvent(scope, {
+            batchId: null,
+            deviceBatchId: String(input.device_batch_id),
+            batchSequence: sequence,
+            itemId: applierItem.id,
+            entityType: item.entityType,
+            localEntityId: item.localEntityId,
+            receiptStatus: applierItem.concurrencySuspect
+              ? 'conflict'
+              : 'applied',
+            errorCode: applierItem.concurrencySuspect
+              ? 'TEAT.SYNC_CONCURRENCY_SUSPECT'
+              : null,
+            serverEntityId: applied.serverEntityId,
+          }),
+        );
+        return applied.serverEntityId;
+      });
+    } catch (error) {
+      const failure = asDomainFailure(error);
+      const view = await this.close(
+        item,
+        failure.code,
+        failure.context,
+        null,
+        failure.conflictType,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view);
+      return view;
+    }
+
+    if (item.concurrencySuspect && item.concurrencyContext) {
+      const view = await this.close(
+        item,
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        item.concurrencyContext,
+        serverEntityId,
+        'already-open',
+      );
+      return view;
+    }
+    await storeOf(this.deps, 'items').update(String(item.itemRow.id), {
+      status: 'applied',
+      server_entity_id: serverEntityId,
+      received_at: scope.occurredAt,
+    });
+    const updated = await storeOf(this.deps, 'receipts').update(
+      String(item.receiptRow.id),
+      {
+        status: 'applied',
+        server_entity_id: serverEntityId,
+        applied_at: scope.occurredAt,
+      },
+    );
+    return receiptView(updated ?? item.receiptRow);
+  }
+
+  /** Recibo e fila num desfecho terminal, com o conflito quando couber (§4.4). */
+  private async close(
+    item: PreparedItem,
+    code: string,
+    context: Record<string, unknown>,
+    serverEntityId: string | null,
+    conflictType?: ConflictType | 'already-open',
+  ): Promise<SyncReceiptView> {
+    const outcome = outcomeFor(code);
+    const status: ReceiptStatus = outcome.status;
+    await storeOf(this.deps, 'items').update(String(item.itemRow!.id), {
+      status,
+      error_code: code,
+      ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+    });
+    const updated = await storeOf(this.deps, 'receipts').update(
+      String(item.receiptRow!.id),
+      {
+        status,
+        reason_code: code,
+        details_json: context,
+        ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+      },
+    );
+    const type = conflictType ?? outcome.conflictType;
+    if (type && type !== 'already-open')
+      await this.openConflict(item.itemRow!, type, code);
+    return receiptView(updated ?? item.receiptRow!);
+  }
+
+  /**
+   * `ops.sync_conflict` não tem coluna de contexto (DDL 18): o detalhe do caso
+   * vive em `sync_receipt.details_json`; aqui ficam só os campos do contrato
+   * (§4.2) — tipo, código, hashes, ações admitidas e estado.
+   */
+  private async openConflict(
+    itemRow: OpsRow,
+    conflictType: ConflictType,
+    reasonCode: string,
+    hashes: { local?: string; server?: string } = {},
+  ): Promise<OpsRow | undefined> {
+    const conflicts = this.deps.repositories.conflicts;
+    if (!conflicts) return undefined;
+    return createOpsRow(conflicts, {
+      sync_queue_item_id: String(itemRow.id),
+      conflict_type: conflictType,
+      reason_code: reasonCode,
+      local_hash: hashes.local ?? null,
+      server_hash: hashes.server ?? null,
+      retryable: false,
+      allowed_resolution_actions: [...ALLOWED_RESOLUTION_ACTIONS[conflictType]],
+      description: CONFLICT_DESCRIPTION[conflictType],
+      status: 'open',
+    });
+  }
+
+  private async emitConcurrencyEvent(
+    item: PreparedItem,
+    aitId: string,
+    scope: EventScope,
+  ): Promise<void> {
+    await this.emit(concurrencyEnvelope(item, aitId, scope));
+  }
+
+  private async publishItemEvent(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+    view: SyncReceiptView,
+  ): Promise<void> {
+    await this.emit(
+      syncItemReceivedEvent(scope, {
+        batchId: null,
+        deviceBatchId: String(input.device_batch_id),
+        batchSequence: sequence,
+        itemId: String(item.itemRow?.id ?? ''),
+        entityType: item.entityType,
+        localEntityId: item.localEntityId,
+        receiptStatus: (view.status ?? 'received') as ReceiptStatus,
+        errorCode: view.error_code,
+        serverEntityId: view.server_entity_id,
+      }),
+    );
+  }
+
+  private async emit(envelope: TeatEventEnvelope): Promise<void> {
+    const sink = teatEventSink(this.deps.outbox);
+    await this.deps.database.tx((tx) =>
+      sink.append(tx as Transaction, envelope),
+    );
+  }
+}
+
+function concurrencyEnvelope(
+  item: PreparedItem,
+  aitId: string,
+  scope: EventScope,
+): TeatEventEnvelope {
+  const context = item.concurrencyContext ?? {};
+  return aitConcurrencySuspectedEvent(scope, {
+    aitId,
+    agentId: String(item.itemRow?.agent_id ?? ''),
+    deviceId: String(item.itemRow?.device_id ?? ''),
+    otherDeviceId: (context.otherDeviceId as string) ?? null,
+    windowStart: String(context.windowStart),
+    windowEnd: String(context.windowEnd),
+    conflictId: (context.conflictId as string) ?? null,
+  });
+}
+
+function replayMismatch(deviceBatchId: string): DetranError {
+  return new DetranError('TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', {
+    status: 409,
+    context: { deviceBatchId },
+    message: 'Lote retransmitido com contexto diferente do gravado.',
+  });
+}
+
+/**
+ * §4.1 passo 2 — serializa a aceitação por tenant+dispositivo. A porta de
+ * repositório abre transação por instrução, então o bloqueio é tomado na
+ * transação do item, que é onde o efeito de domínio acontece.
+ */
+async function lockDeviceScope(
+  tx: unknown,
+  tenantId: string,
+  deviceId: string,
+): Promise<void> {
+  const queryable = asQueryable(tx);
+  if (!queryable) return;
+  await queryable.query(
+    'select id from ops.sync_batch where tenant_id = $1 and device_id = $2 for update',
+    [tenantId, deviceId],
+  );
+}
+
+function asDomainFailure(error: unknown): {
+  code: string;
+  context: Record<string, unknown>;
+  conflictType?: ConflictType;
+} {
+  const candidate = error as {
+    code?: unknown;
+    context?: unknown;
+  } | null;
+  const code =
+    typeof candidate?.code === 'string' ? candidate.code : 'TEAT.INTERNAL';
+  const context =
+    candidate?.context && typeof candidate.context === 'object'
+      ? (candidate.context as Record<string, unknown>)
+      : {};
+  return { code, context, conflictType: outcomeFor(code).conflictType };
+}
diff --git a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
index 1e92cb7..a50fed7 100644
--- a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
+++ b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
@@ -99,6 +99,15 @@ function submitBatch(
   );
 }

+/**
+ * `batch_sequence` é monotônica por `(tenant, device)`: o passo 4 da §4.1 exige
+ * `last + 1` e o índice único `ux_sync_batch_tenant_id_device_id_batch_sequence`
+ * (DDL 18) proíbe repetir. Um contador por arquivo entrega a próxima sequência
+ * a cada lote; os casos que testam replay ou gap passam `batch_sequence`
+ * explicitamente no `overrides`.
+ */
+let nextSequence = 1;
+
 function batchInput(
   overrides: Record<string, unknown> = {},
 ): Record<string, unknown> {
@@ -108,7 +117,7 @@ function batchInput(
     device_id: field.deviceId,
     agent_id: field.agentId,
     device_batch_id: `batch-${randomUUID().slice(0, 8)}`,
-    batch_sequence: 1,
+    batch_sequence: nextSequence++,
     items: [
       {
         entity_type: 'ait',
@@ -145,14 +154,54 @@ afterAll(async () => {
   await client.end();
 });

+/**
+ * Reserva `reserved` do device+turno cobrindo o número 2026000001, criada no
+ * arranjo porque `ops.numbering_consumption.reservation_id` é **not null** com
+ * FK (`fk_ops_numbering_consumption_reservation`, DDL 18): sem ela o applier
+ * não tem onde ancorar a linha `aplicado` da §4.6.
+ */
+async function seedReservation(): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000001, 2026000001,
+             '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [
+      id,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      field.deviceId,
+      field.shiftId,
+      `sync-batch-${id.slice(0, 8)}`,
+    ],
+  );
+  return id;
+}
+
 describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…29)', () => {
   it('C-0002-27 — dado um item aplicado então na mesma transação existem o AIT em RECEBIDO, a linha numbering_consumption aplicado, o recibo applied e os envelopes na integration.outbox', async () => {
+    const reservationId = await seedReservation();
     const deps = commandDeps(client, tenantId, actorId, {
       appliers: [
         {
           entityType: 'ait',
           validate: () => null,
-          apply: async (item: { id: string }, tx: unknown) => {
+          apply: async (
+            item: {
+              id: string;
+              localEntityId: string;
+              idempotencyKey: string;
+            },
+            tx: unknown,
+          ) => {
             const serverEntityId = randomUUID();
             await (
               tx as {
@@ -182,7 +231,31 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
                 FIXTURES.catalogId,
               ],
             );
-            void item;
+            // §4.6: o applier grava o consumo do número na **mesma**
+            // transação do item; sem esta linha o dublê não representaria o
+            // efeito que C-0002-27 verifica.
+            await (
+              tx as {
+                query(
+                  sql: string,
+                  values: readonly unknown[],
+                ): Promise<unknown>;
+              }
+            ).query(
+              `insert into ops.numbering_consumption
+                 (tenant_id, reservation_id, range_id, number, local_entity_id,
+                  idempotency_key, server_entity_id, finalized_at, status)
+               values ($1, $2, $3, 2026000001, $4, $5, $6,
+                       '2026-09-14T13:05:00-04:00', 'aplicado')`,
+              [
+                tenantId,
+                reservationId,
+                field.rangeId,
+                item.localEntityId,
+                item.idempotencyKey,
+                serverEntityId,
+              ],
+            );
             return { serverEntityId };
           },
         },
@@ -305,10 +378,7 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
     expect((first.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
-    const second = await submitBatch(
-      deps,
-      batchInput({ batch_sequence: 2, items: [item] }),
-    );
+    const second = await submitBatch(deps, batchInput({ items: [item] }));
     expect((second.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
diff --git a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
index 4a12db7..a5104c7 100644
--- a/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
+++ b/backend/domains/ops/snapshots/src/handwritten/frozen-snapshot.controller.ts
@@ -3,7 +3,7 @@ import { Action, Audit, Resource } from '@detran/shared';

 import { FrozenSnapshotService } from './frozen-snapshot.service.js';

-@Controller('ops/snapshots')
+@Controller('v1/ops/snapshots')
 export class FrozenSnapshotController {
   constructor(private readonly service: FrozenSnapshotService) {}
   @Get('people') @Resource('ops:snapshot-person') @Action('read') people() {
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index ad945d8..bbf8434 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -1170,3 +1170,265 @@ describe('CTG-0001 §5 — AIT completo: archive, review-concurrency, ait-cancel
     });
   });
 });
+
+/**
+ * CTG-0002 §8 (R-0008, TASK-0004) — campo, numeração e sincronização: as
+ * chaves novas de `TEAT_RULES` e de `OPS_SURFACE_RULES` que TASK-0005 escreve,
+ * e a ausência definitiva do alias `ops:offline-numbering-reservation:*` (M18).
+ *
+ * Toda linha abaixo é transcrição literal da §8 do contrato; nenhum papel é
+ * inferido. Os pares que ainda não existem falham hoje por comportamento
+ * ausente (Engineer, TASK-0005), nunca por erro de escrita.
+ */
+describe('R-0008 CTG-0002 §8 — política de campo, numeração e sincronização (TASK-0004)', () => {
+  const allowed = (roles: string[], resource: string, action: string) =>
+    isDetranActionAllowed({ roles, permissions: [] }, resource, action);
+
+  /** Os oito papéis canônicos da família TEAT (CTG-0001 §0, roles.ts). */
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
+        // technical-admin está em GLOBAL_ADMIN_ROLES: '*' o libera para toda
+        // chave, sem entrar na lista estática de papéis concedidos.
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
+  }
+
+  describe('§8 — chaves novas de TEAT_RULES (rotas manuscritas)', () => {
+    it('ops:operational-device:close-shift — field-agent e field-supervisor (origem teat-policy.ts)', () => {
+      expectGrantedOnlyTo('ops:operational-device', 'close-shift', [
+        'field-agent',
+        'field-supervisor',
+      ]);
+    });
+
+    it('ops:operational-device:handoff-session — field-agent e field-supervisor (OD-T15: chave nova, por analogia com close-shift)', () => {
+      expectGrantedOnlyTo('ops:operational-device', 'handoff-session', [
+        'field-agent',
+        'field-supervisor',
+      ]);
+    });
+
+    it('ops:operational-device:{block,unblock,wipe} — só technical-admin (route contract §4.2)', () => {
+      for (const action of ['block', 'unblock', 'wipe']) {
+        expectGrantedOnlyTo('ops:operational-device', action, [
+          'technical-admin',
+        ]);
+      }
+    });
+
+    it('ops:homologation:{renew,cancel-by-audit} — agency-admin e technical-admin (origem)', () => {
+      for (const action of ['renew', 'cancel-by-audit']) {
+        expectGrantedOnlyTo('ops:homologation', action, [
+          'agency-admin',
+          'technical-admin',
+        ]);
+      }
+    });
+  });
+
+  describe('§8 — chaves de comando já existentes, preservadas', () => {
+    it('ops:numbering-reservation:reserve — só field-agent (OD-T23: prevalece a fonte mais restrita)', () => {
+      expectGrantedOnlyTo('ops:numbering-reservation', 'reserve', [
+        'field-agent',
+      ]);
+    });
+
+    it('ops:numbering-reservation:cancel — field-agent e field-supervisor', () => {
+      expectGrantedOnlyTo('ops:numbering-reservation', 'cancel', [
+        'field-agent',
+        'field-supervisor',
+      ]);
+    });
+
+    it('ops:sync-batch:submit — só field-agent', () => {
+      expectGrantedOnlyTo('ops:sync-batch', 'submit', ['field-agent']);
+    });
+
+    it('ops:sync-conflict:resolve — field-supervisor e processing-operator', () => {
+      expectGrantedOnlyTo('ops:sync-conflict', 'resolve', [
+        'field-supervisor',
+        'processing-operator',
+      ]);
+    });
+  });
+
+  describe('§8 — chaves novas de OPS_SURFACE_RULES (superfícies CRUD do route contract §4.3)', () => {
+    const surfaces: Array<[string, string, readonly string[]]> = [
+      ['numbering-range', 'read', ['agency-admin', 'technical-admin']],
+      ['numbering-range', 'create', ['agency-admin', 'technical-admin']],
+      ['numbering-range', 'update', ['agency-admin', 'technical-admin']],
+      [
+        'numbering-reservation',
+        'read',
+        ['field-agent', 'field-supervisor', 'processing-operator'],
+      ],
+      [
+        'numbering-consumption',
+        'read',
+        ['field-agent', 'field-supervisor', 'processing-operator'],
+      ],
+      [
+        'sync-batch',
+        'read',
+        ['field-supervisor', 'processing-operator', 'technical-admin'],
+      ],
+      [
+        'sync-receipt',
+        'read',
+        ['field-agent', 'field-supervisor', 'processing-operator'],
+      ],
+      [
+        'sync-queue-item',
+        'read',
+        ['field-supervisor', 'processing-operator', 'technical-admin'],
+      ],
+      [
+        'sync-conflict',
+        'read',
+        ['field-supervisor', 'processing-operator', 'technical-admin'],
+      ],
+      [
+        'session-handoff',
+        'read',
+        ['field-supervisor', 'processing-operator', 'traffic-authority'],
+      ],
+      [
+        'device-event',
+        'read',
+        ['field-supervisor', 'processing-operator', 'technical-admin'],
+      ],
+      [
+        'operation',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ],
+      ],
+      ['operation', 'create', ['field-supervisor', 'agency-admin']],
+      [
+        'team-agent',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ],
+      ],
+      ['team-agent', 'create', ['field-supervisor', 'agency-admin']],
+      [
+        'patrol-vehicle',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ],
+      ],
+      ['patrol-vehicle', 'create', ['agency-admin']],
+      [
+        'measurement-instrument',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ],
+      ],
+      ['measurement-instrument', 'create', ['agency-admin']],
+      [
+        'approach',
+        'read',
+        [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+        ],
+      ],
+      ['approach', 'create', ['field-agent']],
+    ];
+
+    for (const [resource, action, roles] of surfaces) {
+      it(`ops:${resource}:${action} — ${roles.join(', ')}`, () => {
+        expectGrantedOnlyTo(`ops:${resource}`, action, roles);
+      });
+    }
+
+    const agencySurfaces = [
+      'agency-unit',
+      'agency-jurisdiction',
+      'agency-competence',
+    ];
+
+    it('ops:{agency-unit,agency-jurisdiction,agency-competence}:read — os quatro papéis de campo mais agency-admin', () => {
+      for (const resource of agencySurfaces) {
+        expectGrantedOnlyTo(`ops:${resource}`, 'read', [
+          'field-agent',
+          'field-supervisor',
+          'processing-operator',
+          'traffic-authority',
+          'agency-admin',
+        ]);
+      }
+    });
+
+    it('ops:{agency-unit,agency-jurisdiction,agency-competence}:create — só agency-admin', () => {
+      for (const resource of agencySurfaces) {
+        expectGrantedOnlyTo(`ops:${resource}`, 'create', ['agency-admin']);
+      }
+    });
+  });
+
+  describe('§8 — remoção do alias duplicado da origem (M18)', () => {
+    it('dado ops:offline-numbering-reservation:{reserve,cancel} então as duas chaves não existem na matriz (a rota única é numbering-reservation)', () => {
+      for (const action of ['reserve', 'cancel']) {
+        expect(
+          `ops:offline-numbering-reservation:${action}` in DETRAN_POLICY_MATRIX,
+          `ops:offline-numbering-reservation:${action} deveria ter sido removida em M18`,
+        ).toBe(false);
+      }
+    });
+
+    it('dado qualquer papel canônico então nenhum recebe ops:offline-numbering-reservation:reserve, nem por permissionsForRoles', () => {
+      for (const role of TEAT_CANONICAL_ROLES) {
+        expect(
+          permissionsForRoles([role]).includes(
+            'ops:offline-numbering-reservation:reserve',
+          ),
+        ).toBe(false);
+      }
+    });
+  });
+});
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index 46d1c1e..101dae8 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -608,6 +608,34 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
     ['field-agent', 'field-supervisor'],
   ],
   ['ops', 'sync-batch', 'submit', ['field-agent']],
+  // CTG-0002 §8 (M18, TASK-0005): chaves novas das rotas manuscritas de campo.
+  // `close-shift` vem da origem `teat-policy.ts`; `handoff-session` é rota nova
+  // de D-01 e herda os papéis de `close-shift`, por analogia do mesmo ato de
+  // campo (OD-T15); `block`/`unblock`/`wipe` são do route contract §4.2 e
+  // existem mesmo com `technical-admin` passando por '*', para que
+  // `policy-routes.e2e.spec.ts` case rota <-> regra nos dois sentidos.
+  [
+    'ops',
+    'operational-device',
+    'close-shift',
+    ['field-agent', 'field-supervisor'],
+  ],
+  [
+    'ops',
+    'operational-device',
+    'handoff-session',
+    ['field-agent', 'field-supervisor'],
+  ],
+  ['ops', 'operational-device', 'block', ['technical-admin']],
+  ['ops', 'operational-device', 'unblock', ['technical-admin']],
+  ['ops', 'operational-device', 'wipe', ['technical-admin']],
+  ['ops', 'homologation', 'renew', ['agency-admin', 'technical-admin']],
+  [
+    'ops',
+    'homologation',
+    'cancel-by-audit',
+    ['agency-admin', 'technical-admin'],
+  ],
   [
     'ops',
     'sync-conflict',
@@ -760,8 +788,63 @@ const TEAT_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
  * the ported CRUD surfaces whose TEAT fallback classified as field-legal or
  * governance work; spelling them out keeps the unified matrix authoritative.
  */
+const OPS_FIELD_READ_ROLES: readonly DetranRole[] = [
+  'field-agent',
+  'field-supervisor',
+  'processing-operator',
+  'traffic-authority',
+];
+const OPS_SYNC_DESK_ROLES: readonly DetranRole[] = [
+  'field-supervisor',
+  'processing-operator',
+  'technical-admin',
+];
+const OPS_SYNC_FIELD_ROLES: readonly DetranRole[] = [
+  'field-agent',
+  'field-supervisor',
+  'processing-operator',
+];
+const OPS_NUMBERING_ADMIN_ROLES: readonly DetranRole[] = [
+  'agency-admin',
+  'technical-admin',
+];
+
 const OPS_SURFACE_RULES: Array<[string, string, readonly DetranRole[]]> = [
   ['parameter', 'read', ['agency-admin']],
+  // CTG-0002 §8 (M18, TASK-0005) — superfícies do route contract §4.3 que
+  // ainda não tinham regra. Sem regra, a guarda falha fechado e a rota some
+  // para todo papel que não seja administrador global.
+  ['numbering-range', 'read', OPS_NUMBERING_ADMIN_ROLES],
+  ['numbering-range', 'create', OPS_NUMBERING_ADMIN_ROLES],
+  ['numbering-range', 'update', OPS_NUMBERING_ADMIN_ROLES],
+  ['numbering-reservation', 'read', OPS_SYNC_FIELD_ROLES],
+  ['numbering-consumption', 'read', OPS_SYNC_FIELD_ROLES],
+  ['sync-batch', 'read', OPS_SYNC_DESK_ROLES],
+  ['sync-receipt', 'read', OPS_SYNC_FIELD_ROLES],
+  ['sync-queue-item', 'read', OPS_SYNC_DESK_ROLES],
+  ['sync-conflict', 'read', OPS_SYNC_DESK_ROLES],
+  [
+    'session-handoff',
+    'read',
+    ['field-supervisor', 'processing-operator', 'traffic-authority'],
+  ],
+  ['device-event', 'read', OPS_SYNC_DESK_ROLES],
+  ['operation', 'read', OPS_FIELD_READ_ROLES],
+  ['operation', 'create', ['field-supervisor', 'agency-admin']],
+  ['team-agent', 'read', OPS_FIELD_READ_ROLES],
+  ['team-agent', 'create', ['field-supervisor', 'agency-admin']],
+  ['patrol-vehicle', 'read', OPS_FIELD_READ_ROLES],
+  ['patrol-vehicle', 'create', ['agency-admin']],
+  ['measurement-instrument', 'read', OPS_FIELD_READ_ROLES],
+  ['measurement-instrument', 'create', ['agency-admin']],
+  ['approach', 'read', OPS_FIELD_READ_ROLES],
+  ['approach', 'create', ['field-agent']],
+  ['agency-unit', 'read', [...OPS_FIELD_READ_ROLES, 'agency-admin']],
+  ['agency-jurisdiction', 'read', [...OPS_FIELD_READ_ROLES, 'agency-admin']],
+  ['agency-competence', 'read', [...OPS_FIELD_READ_ROLES, 'agency-admin']],
+  ['agency-unit', 'create', ['agency-admin']],
+  ['agency-jurisdiction', 'create', ['agency-admin']],
+  ['agency-competence', 'create', ['agency-admin']],
   ['parameter', 'update', ['agency-admin']],
   [
     'agent-profile',
diff --git a/docs/framework/blueprints/BP-OPS-FIELD-001.json b/docs/framework/blueprints/BP-OPS-FIELD-001.json
index e713809..3c96814 100644
--- a/docs/framework/blueprints/BP-OPS-FIELD-001.json
+++ b/docs/framework/blueprints/BP-OPS-FIELD-001.json
@@ -4,28 +4,56 @@
   "module": {
     "name": "Field",
     "namespace": "ops",
-    "version": "1.1.0",
+    "version": "1.2.0",
     "ddlFile": "13-ops-field-operations.sql",
     "dependencies": {
       "@detran/ops-core": "workspace:*",
-      "@detran/ops-parameter": "workspace:*"
+      "@detran/ops-parameter": "workspace:*",
+      "zod": "^4.6.5",
+      "@detran/inf-normative": "workspace:*"
     },
     "handwrittenControllers": [
       {
         "target": "handwritten/field-operations.controller",
         "symbol": "FieldOperationsController"
+      },
+      {
+        "target": "handwritten/mobile-bootstrap.controller",
+        "symbol": "MobileBootstrapController"
+      },
+      {
+        "target": "handwritten/field-commands.controller",
+        "symbol": "FieldCommandsController"
       }
     ],
     "handwrittenProviders": [
       {
         "target": "handwritten/field-operations.provider",
         "symbol": "FIELD_OPERATIONS_PROVIDER"
+      },
+      {
+        "target": "handwritten/mobile-bootstrap.provider",
+        "symbol": "MOBILE_BOOTSTRAP_PROVIDER"
       }
     ],
     "handwrittenExports": [
       "handwritten/field-operations.controller",
       "handwritten/field-operations.provider",
-      "handwritten/field-operations.service"
+      "handwritten/field-operations.service",
+      "handwritten/field-runtime",
+      "handwritten/events",
+      "handwritten/mobile-bootstrap.service",
+      "handwritten/mobile-bootstrap.controller",
+      "handwritten/mobile-bootstrap.provider",
+      "handwritten/field-commands",
+      "handwritten/field-commands.controller",
+      "handwritten/shift-readiness",
+      "handwritten/open-shift.command",
+      "handwritten/close-shift.command",
+      "handwritten/handoff-session.command",
+      "handwritten/device-posture.command",
+      "handwritten/renew-homologation.command",
+      "handwritten/cancel-homologation.command"
     ],
     "owners": ["detran-ops"],
     "description": "Field-operation context from TEAT BP-MOBILE-OPERATIONS-001 and RN-TEAT-003; handwritten operations routes remain mounted through the generated module.",
@@ -41,6 +69,16 @@
       {
         "package": "@detran/ops-parameter",
         "target": "../parameter/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-normative",
+        "target": "../../inf/normative/src/index.ts"
+      }
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/ops-parameter",
+        "symbol": "ParameterModule"
       }
     ]
   },
diff --git a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
index 9f8ab0d..b8869da 100644
--- a/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
+++ b/docs/framework/blueprints/BP-OPS-OFFLINE-SYNC-001.json
@@ -4,11 +4,12 @@
   "module": {
     "name": "OfflineSync",
     "namespace": "ops",
-    "version": "1.2.0",
+    "version": "1.3.0",
     "ddlFile": "18-ops-offline-sync.sql",
     "dependencies": {
       "@detran/ops-core": "workspace:*",
-      "@detran/ops-parameter": "workspace:*"
+      "@detran/ops-parameter": "workspace:*",
+      "zod": "^4.6.5"
     },
     "owners": ["detran-ops"],
     "description": "Offline numbering and durable synchronization from WF-TEAT-002 and INV-OFFLINE-001; no WP-T2 controller is mounted in this round.",
@@ -25,6 +26,40 @@
         "package": "@detran/ops-parameter",
         "target": "../parameter/src/index.ts"
       }
+    ],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/offline-sync.controller",
+        "symbol": "OfflineSyncController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/offline-sync.provider",
+        "symbol": "OFFLINE_SYNC_PROVIDER"
+      }
+    ],
+    "handwrittenExports": [
+      "handwritten/batch-protocol",
+      "handwritten/canonical-hash",
+      "handwritten/concurrency-detector",
+      "handwritten/events",
+      "handwritten/numbering-sql",
+      "handwritten/submit-batch.command",
+      "handwritten/reserve-numbering.command",
+      "handwritten/settle-numbering.command",
+      "handwritten/reconcile-numbering.command",
+      "handwritten/resolve-conflict.command",
+      "handwritten/offline-sync.reads",
+      "handwritten/offline-sync.commands",
+      "handwritten/offline-sync.controller",
+      "handwritten/offline-sync.provider"
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/ops-parameter",
+        "symbol": "ParameterModule"
+      }
     ]
   },
   "api": {
@@ -59,7 +94,8 @@
       {
         "entity": "SyncReceipt",
         "path": "receipts",
-        "resource": "sync-receipt"
+        "resource": "sync-receipt",
+        "operations": ["list"]
       },
       {
         "entity": "SyncConflict",
@@ -589,7 +625,7 @@
           {
             "name": "safe_message",
             "type": "varchar(240)",
-            "default": "'Divergência de negócio requer análise.'"
+            "default": "'Diverg\u00eancia de neg\u00f3cio requer an\u00e1lise.'"
           },
           {
             "name": "correlation_id",
diff --git a/package.json b/package.json
index 45f85ca..e72b475 100644
--- a/package.json
+++ b/package.json
@@ -29,9 +29,9 @@
     "backend:db:apply": "bash backend/database/apply.sh",
     "backend:db:reset": "bash backend/database/apply.sh --full",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
-    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
-    "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/inf-ait test:e2e",
+    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
+    "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/inf-ait test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
     "backend:test:ci": "pnpm backend:test:unit && pnpm backend:test:integration && pnpm backend:test:e2e",

```

## Anexo C — arquivos gerados/regenerados

```text
backend/app/src/app.module.ts
backend/database/ddl/13-ops-field-operations.sql
backend/database/ddl/16-ops-snapshots.sql
backend/database/ddl/17-ops-evidence.sql
backend/database/ddl/18-ops-offline-sync.sql
backend/database/ddl/31-inf-ait.sql
backend/domains/inf/ait/src/ait.module.ts
backend/domains/inf/ait/src/controllers/ait-cancel-request-event.controller.ts
backend/domains/inf/ait/src/controllers/ait-cancel-request.controller.ts
backend/domains/inf/ait/src/controllers/ait-correction.controller.ts
backend/domains/inf/ait/src/controllers/ait-person.controller.ts
backend/domains/inf/ait/src/controllers/ait-print-event.controller.ts
backend/domains/inf/ait/src/controllers/ait-signature.controller.ts
backend/domains/inf/ait/src/controllers/ait-status-history.controller.ts
backend/domains/inf/ait/src/controllers/ait-vehicle.controller.ts
backend/domains/inf/ait/src/controllers/ait.controller.ts
backend/domains/inf/ait/src/dto/create-ait-cancel-request-event.dto.ts
backend/domains/inf/ait/src/dto/create-ait-cancel-request.dto.ts
backend/domains/inf/ait/src/dto/create-ait-correction.dto.ts
backend/domains/inf/ait/src/dto/create-ait-person.dto.ts
backend/domains/inf/ait/src/dto/create-ait-print-event.dto.ts
backend/domains/inf/ait/src/dto/create-ait-signature.dto.ts
backend/domains/inf/ait/src/dto/create-ait-status-history.dto.ts
backend/domains/inf/ait/src/dto/create-ait-vehicle.dto.ts
backend/domains/inf/ait/src/dto/create-ait.dto.ts
backend/domains/inf/ait/src/entities/ait-cancel-request-event.entity.ts
backend/domains/inf/ait/src/entities/ait-cancel-request.entity.ts
backend/domains/inf/ait/src/entities/ait-correction.entity.ts
backend/domains/inf/ait/src/entities/ait-person.entity.ts
backend/domains/inf/ait/src/entities/ait-print-event.entity.ts
backend/domains/inf/ait/src/entities/ait-signature.entity.ts
backend/domains/inf/ait/src/entities/ait-status-history.entity.ts
backend/domains/inf/ait/src/entities/ait-vehicle.entity.ts
backend/domains/inf/ait/src/entities/ait.entity.ts
backend/domains/inf/ait/src/index.ts
backend/domains/inf/ait/src/repositories/ait-cancel-request-event.repository.ts
backend/domains/inf/ait/src/repositories/ait-cancel-request.repository.ts
backend/domains/inf/ait/src/repositories/ait-correction.repository.ts
backend/domains/inf/ait/src/repositories/ait-person.repository.ts
backend/domains/inf/ait/src/repositories/ait-print-event.repository.ts
backend/domains/inf/ait/src/repositories/ait-signature.repository.ts
backend/domains/inf/ait/src/repositories/ait-status-history.repository.ts
backend/domains/inf/ait/src/repositories/ait-vehicle.repository.ts
backend/domains/inf/ait/src/repositories/ait.repository.ts
backend/domains/inf/ait/src/services/ait-cancel-request-event.service.ts
backend/domains/inf/ait/src/services/ait-cancel-request.service.ts
backend/domains/inf/ait/src/services/ait-correction.service.ts
backend/domains/inf/ait/src/services/ait-person.service.ts
backend/domains/inf/ait/src/services/ait-print-event.service.ts
backend/domains/inf/ait/src/services/ait-signature.service.ts
backend/domains/inf/ait/src/services/ait-status-history.service.ts
backend/domains/inf/ait/src/services/ait-vehicle.service.ts
backend/domains/inf/ait/src/services/ait.service.ts
backend/domains/ops/core/src/index.ts
backend/domains/ops/field/src/controllers/agent-profile.controller.ts
backend/domains/ops/field/src/controllers/application-version.controller.ts
backend/domains/ops/field/src/controllers/approach.controller.ts
backend/domains/ops/field/src/controllers/device-event.controller.ts
backend/domains/ops/field/src/controllers/homologation.controller.ts
backend/domains/ops/field/src/controllers/measurement-instrument.controller.ts
backend/domains/ops/field/src/controllers/operation.controller.ts
backend/domains/ops/field/src/controllers/operational-device.controller.ts
backend/domains/ops/field/src/controllers/patrol-vehicle.controller.ts
backend/domains/ops/field/src/controllers/session-handoff.controller.ts
backend/domains/ops/field/src/controllers/shift.controller.ts
backend/domains/ops/field/src/controllers/team-agent.controller.ts
backend/domains/ops/field/src/controllers/team.controller.ts
backend/domains/ops/field/src/dto/create-agent-profile.dto.ts
backend/domains/ops/field/src/dto/create-application-version.dto.ts
backend/domains/ops/field/src/dto/create-approach.dto.ts
backend/domains/ops/field/src/dto/create-device-event.dto.ts
backend/domains/ops/field/src/dto/create-homologation.dto.ts
backend/domains/ops/field/src/dto/create-measurement-instrument.dto.ts
backend/domains/ops/field/src/dto/create-operation.dto.ts
backend/domains/ops/field/src/dto/create-operational-device.dto.ts
backend/domains/ops/field/src/dto/create-patrol-vehicle.dto.ts
backend/domains/ops/field/src/dto/create-session-handoff.dto.ts
backend/domains/ops/field/src/dto/create-shift.dto.ts
backend/domains/ops/field/src/dto/create-team-agent.dto.ts
backend/domains/ops/field/src/dto/create-team.dto.ts
backend/domains/ops/field/src/entities/agent-profile.entity.ts
backend/domains/ops/field/src/entities/application-version.entity.ts
backend/domains/ops/field/src/entities/approach.entity.ts
backend/domains/ops/field/src/entities/device-event.entity.ts
backend/domains/ops/field/src/entities/homologation.entity.ts
backend/domains/ops/field/src/entities/measurement-instrument.entity.ts
backend/domains/ops/field/src/entities/operation.entity.ts
backend/domains/ops/field/src/entities/operational-device.entity.ts
backend/domains/ops/field/src/entities/patrol-vehicle.entity.ts
backend/domains/ops/field/src/entities/session-handoff.entity.ts
backend/domains/ops/field/src/entities/shift.entity.ts
backend/domains/ops/field/src/entities/team-agent.entity.ts
backend/domains/ops/field/src/entities/team.entity.ts
backend/domains/ops/field/src/field.module.ts
backend/domains/ops/field/src/index.ts
backend/domains/ops/field/src/repositories/agent-profile.repository.ts
backend/domains/ops/field/src/repositories/application-version.repository.ts
backend/domains/ops/field/src/repositories/approach.repository.ts
backend/domains/ops/field/src/repositories/device-event.repository.ts
backend/domains/ops/field/src/repositories/homologation.repository.ts
backend/domains/ops/field/src/repositories/measurement-instrument.repository.ts
backend/domains/ops/field/src/repositories/operation.repository.ts
backend/domains/ops/field/src/repositories/operational-device.repository.ts
backend/domains/ops/field/src/repositories/patrol-vehicle.repository.ts
backend/domains/ops/field/src/repositories/session-handoff.repository.ts
backend/domains/ops/field/src/repositories/shift.repository.ts
backend/domains/ops/field/src/repositories/team-agent.repository.ts
backend/domains/ops/field/src/repositories/team.repository.ts
backend/domains/ops/field/src/services/agent-profile.service.ts
backend/domains/ops/field/src/services/application-version.service.ts
backend/domains/ops/field/src/services/approach.service.ts
backend/domains/ops/field/src/services/device-event.service.ts
backend/domains/ops/field/src/services/homologation.service.ts
backend/domains/ops/field/src/services/measurement-instrument.service.ts
backend/domains/ops/field/src/services/operation.service.ts
backend/domains/ops/field/src/services/operational-device.service.ts
backend/domains/ops/field/src/services/patrol-vehicle.service.ts
backend/domains/ops/field/src/services/session-handoff.service.ts
backend/domains/ops/field/src/services/shift.service.ts
backend/domains/ops/field/src/services/team-agent.service.ts
backend/domains/ops/field/src/services/team.service.ts
backend/domains/ops/field/vitest.config.ts
backend/domains/ops/offline-sync/src/controllers/ait-numbering-range.controller.ts
backend/domains/ops/offline-sync/src/controllers/numbering-consumption.controller.ts
backend/domains/ops/offline-sync/src/controllers/numbering-reservation.controller.ts
backend/domains/ops/offline-sync/src/controllers/sync-batch.controller.ts
backend/domains/ops/offline-sync/src/controllers/sync-conflict.controller.ts
backend/domains/ops/offline-sync/src/controllers/sync-queue-item.controller.ts
backend/domains/ops/offline-sync/src/controllers/sync-receipt.controller.ts
backend/domains/ops/offline-sync/src/dto/create-ait-numbering-range.dto.ts
backend/domains/ops/offline-sync/src/dto/create-numbering-consumption.dto.ts
backend/domains/ops/offline-sync/src/dto/create-numbering-reservation.dto.ts
backend/domains/ops/offline-sync/src/dto/create-sync-batch.dto.ts
backend/domains/ops/offline-sync/src/dto/create-sync-conflict.dto.ts
backend/domains/ops/offline-sync/src/dto/create-sync-queue-item.dto.ts
backend/domains/ops/offline-sync/src/dto/create-sync-receipt.dto.ts
backend/domains/ops/offline-sync/src/entities/ait-numbering-range.entity.ts
backend/domains/ops/offline-sync/src/entities/numbering-consumption.entity.ts
backend/domains/ops/offline-sync/src/entities/numbering-reservation.entity.ts
backend/domains/ops/offline-sync/src/entities/sync-batch.entity.ts
backend/domains/ops/offline-sync/src/entities/sync-conflict.entity.ts
backend/domains/ops/offline-sync/src/entities/sync-queue-item.entity.ts
backend/domains/ops/offline-sync/src/entities/sync-receipt.entity.ts
backend/domains/ops/offline-sync/src/index.ts
backend/domains/ops/offline-sync/src/offline-sync.module.ts
backend/domains/ops/offline-sync/src/repositories/ait-numbering-range.repository.ts
backend/domains/ops/offline-sync/src/repositories/numbering-consumption.repository.ts
backend/domains/ops/offline-sync/src/repositories/numbering-reservation.repository.ts
backend/domains/ops/offline-sync/src/repositories/sync-batch.repository.ts
backend/domains/ops/offline-sync/src/repositories/sync-conflict.repository.ts
backend/domains/ops/offline-sync/src/repositories/sync-queue-item.repository.ts
backend/domains/ops/offline-sync/src/repositories/sync-receipt.repository.ts
backend/domains/ops/offline-sync/src/services/ait-numbering-range.service.ts
backend/domains/ops/offline-sync/src/services/numbering-consumption.service.ts
backend/domains/ops/offline-sync/src/services/numbering-reservation.service.ts
backend/domains/ops/offline-sync/src/services/sync-batch.service.ts
backend/domains/ops/offline-sync/src/services/sync-conflict.service.ts
backend/domains/ops/offline-sync/src/services/sync-queue-item.service.ts
backend/domains/ops/offline-sync/src/services/sync-receipt.service.ts
docs/framework/contracts/BP-OPS-FIELD-001.openapi.json
docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json
pnpm-lock.yaml

```

## Anexo — `work/rounds/R-0008/reports/TASK-0004.md`

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0004
Arquivos criados/alterados: backend/database/seed/26-fixtures-teat-field.sql; ops/offline-sync/src/handwritten/submit-batch.spec.ts; ops/offline-sync/tests/integration/{harness.ts,sync-batch,numbering,resolve-conflict,concurrency-window}.integration.spec.ts; ops/field/src/handwritten/mobile-bootstrap.spec.ts; ops/field/tests/integration/{harness.ts,shift-lifecycle,device-posture}.integration.spec.ts; inf/ait/tests/integration/ait-sync-applier.integration.spec.ts; backend/app/tests/e2e/teat-field-sync.e2e.spec.ts; shared/src/policy.spec.ts (bloco CTG-0002 §8, 33 casos).
Comandos executados e saída resumida: seed.sh idempotente 3× e em banco limpo (detran_r8_seedcheck) OK; ops-offline-sync unit 0/19, integration 0/36; ops-field unit 0/19, integration 0/13; inf-ait integration 14/24; app e2e 34/53; shared 105/131 — todas as falhas por comportamento ausente; prettier limpo; pnpm check exit 0.
Critérios de aceitação: todos PASS (falhas só por comportamento ausente; seed em banco limpo; matriz C-0002-01…50 no relatório completo).
Fora do escopo / deixado: vitest.config.ts não tocado (alias é gerado por module.testAliases); policy.ts/blueprints intocados.
OD tocadas ou propostas: tocadas OD-T14/T15/T21/T23/T25/T28/T29/T03; propostas OD-T46 (nomes dos símbolos dos comandos — testes usam carregador tolerante com deps propostos no cabeçalho), OD-T47 (colisão POST sync-batches CRUD × comando), OD-T48 (testAliases ausentes nos blueprints ops).
Bloqueios: (1) @detran/shared e @detran/ops-core não resolvem sob vitest em ops/field e ops/offline-sync (sem testAliases) → maestro; (2) prefixo v1/ pendente (TASK-0005/0007); (3) colisão sync-batches → maestro.
Tokens do subagente: 468.312 brutos (129 chamadas, 63 min).

## Iteração 2

Sequência monotônica em `batchInput()`; reserva real em C-0002-27 (dublê grava `numbering_consumption`); cleanup do applier restrito a `applier-%`. Resultado: ops-offline-sync integration 36/36; inf-ait integration 24/24; backend:test:integration verde; app e2e 51/53 (só C-0002-50 evidence/snapshots); format limpo. OD-T47/T48 fecháveis. Tokens: 492.483 brutos (23 chamadas, 7,6 min).
```

## Anexo — `work/rounds/R-0008/reports/TASK-0005.md`

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0005 (iteração 1)
Arquivos criados/alterados: ops/core (sync-applier, applied-entity, storage, runtime, update() no repositório); ops/offline-sync/src/handwritten/* (ports, batch-protocol, canonical-hash, concurrency-detector, events, numbering-sql, 5 comandos, reads, commands, controller, provider); ops/field/src/handwritten/* (runtime, events, shift-readiness, field-commands, mobile-bootstrap service/controller/provider, 6 comandos; field-operations.controller → v1/ops/field); inf/ait/src/handwritten/sync-applier(.provider).ts; backend/app/src/teat-sync.providers.ts + app.module (TeatSyncModule); policy.ts (§8: 7 TEAT_RULES + 25 OPS_SURFACE_RULES); package.json raiz (pacotes ops nas listas backend:test:*); blueprints (bloco module) + regenerados.
Comandos executados e saída resumida: shared 131/131; typechecks ok; ops-offline-sync unit 19/19; ops-field unit 19/19; ops-offline-sync integration 32/36; ops-field integration 13/13; inf-ait integration 24/24; app e2e 50/53; backend:test:unit ok; backend:test:integration falha (4 + C-0002-30 encadeado); blueprints/contracts/decorators(854)/boundary/parameter-catalogue/format ok; pnpm check exit 0.
Critérios de aceitação: PASS exceto ops-offline-sync integration (4, contradição teste × DDL), app e2e (3: 2 de TASK-0007 + GET receipts sombreado), backend:test:integration (C-0002-30 por delete de recibos no applier spec).
Fora do escopo / deixado: eventos ops sem zod (pacotes sem a dependência); bootstrap lê normative_mobile_package por SQL (sem @detran/inf-normative linkado); portas reexportadas por offline-sync (ops-core não linkado no app); lock de lote por item; sync_conflict sem coluna de contexto (detalhe em sync_receipt.details_json); recibo de integridade sintético (índices únicos).
OD tocadas ou propostas: propostas (1) SyncReceipt.operations=['list']; (2) batch_sequence reuse nos testes; (3) C-0002-27 sem reserva; (4) applier spec apaga todos os sync_receipt; (5) zod nos pacotes ops.
Bloqueios: ver propostas 1–5 (triagem do maestro).
Tokens do subagente: 542.751 brutos (145 chamadas, 75 min).
```
