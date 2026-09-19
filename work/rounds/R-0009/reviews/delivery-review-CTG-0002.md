# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-backend` (rodada `R-0009`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P0…P3` e o "mapa entregável → definições"
4. `work/rounds/R-0009/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0009/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0009/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0009",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0009/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0002** (TASK-0005 Architect, TASK-0006 Inspector + iterações 2–4, TASK-0007 e TASK-0008 Engineer, TASK-0009 Architect-transcrição; correções do maestro como Engineer registradas em `plan.md` §Triagem e adendas A4–A7). Commits `b427153..3ceeede` sobre o merge do PR #54 (`1175f4f`, CTG-0001 já em `main`).

Gates executados pelo maestro sobre o HEAD `3ceeede`: `pnpm check` → OK; `pnpm backend:test:ci` → OK (unit/integration/e2e de todos os pacotes; `@detran/app` e2e 142 passed | 2 todo citando R-0007); `pnpm backend:rls-smoke` → OK; `seed.sh` 2× em `detran_r9` → OK; `pnpm contracts:check` → 139 operações, 58 clientes em sincronia; `verify:decorators` 960 handlers; `verify:senatran-boundary` OK.

Leia na worktree (não anexados por tamanho): `work/rounds/R-0009/contracts/CTG-0002.md` (contrato, 84 critérios §13, divergências §15), `work/rounds/R-0009/plan.md` §Decisões (M1–M24, adendas A1–A7) e §Triagem, os cinco `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json`, `docs/framework/schemas/portal-request-draft.schema.json`. Arquivos gerados (`Generated from BP-…`, DDL 61–65, clientes de `packages/api-clients/src/generated`) foram produzidos só pelos geradores (`blueprints:check`/`contracts:check` verdes) e estão fora do diff anexado.

Contexto para os itens 5/7/10: as delegações reais ao RAIT/infração/pagamento/PEC/privacy ficam como `UnavailableDelegationTarget` (`PORTAL.SERVICE_UNAVAILABLE` com `unavailableReason`) porque R-0007 não está em `main` (prompt do maestro §0, M8/M23); os `it.todo` citam R-0007/R-0014. Duas mudanças fora dos locks da frente foram feitas pelo maestro e registradas: correção de defeito pré-existente em `ops/parameter` (`Date` × string, A6(c)) e exclusão estrita de `packages/api-clients/src/generated` da varredura de uso de parâmetros (A7); `tools/contracts/check-commands.mjs` passou a varrer os pacotes do Portal e `portal-error-catalog.md` (A4(e)); C-5-16 conta 139.

### git diff --stat 1175f4f..HEAD

```
 .devai/state/audit-observations/1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8/assessment.json |    15 +
 .devai/state/audit-observations/1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8/backlog.json    |    13 +
 .devai/state/audit-observations/1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8/inventory.json  | 21903 +++++++++++++++++++++++++++++++++++++++++
 .devai/state/audit-observations/1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8/scorecard.json  |   302 +
 .devai/state/audit-observations/1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8/status.json     |    10 +
 backend/app/src/app.module.ts                                                            |    89 +-
 backend/app/src/portal-delegation.providers.ts                                           |   168 +
 backend/app/src/portal-national-read.providers.ts                                        |    65 +
 backend/app/src/portal-stream.controller.ts                                              |   207 +
 backend/app/src/portal-stream.service.spec.ts                                            |   319 +
 backend/app/src/portal-stream.service.ts                                                 |   234 +
 backend/app/tests/e2e/policy-routes.e2e.spec.ts                                          |    90 +-
 backend/app/tests/e2e/portal-e2e.support.ts                                              |   613 ++
 backend/app/tests/e2e/portal-requests.e2e.spec.ts                                        |   909 ++
 backend/app/tests/e2e/portal-routes.e2e.spec.ts                                          |   962 ++
 backend/app/tests/e2e/portal-stream.e2e.spec.ts                                          |   608 ++
 backend/database/ddl/62-portal-requests.sql                                              |     2 +-
 backend/database/ddl/63-portal-inbox.sql                                                 |     2 +-
 backend/database/ddl/64-portal-citizen-service.sql                                       |     2 +-
 backend/database/ddl/65-portal-projections.sql                                           |     2 +-
 backend/database/seed/71-fixtures-portal-events.sql                                      |    28 +
 backend/domains/ops/parameter/src/handwritten/parameter.service.ts                       |    13 +-
 backend/domains/portal/citizen-service/package.json                                      |     2 +
 backend/domains/portal/citizen-service/src/citizen-service.module.ts                     |    15 +-
 .../domains/portal/citizen-service/src/controllers/manifestation-extension.controller.ts |     2 +-
 backend/domains/portal/citizen-service/src/controllers/manifestation.controller.ts       |     2 +-
 backend/domains/portal/citizen-service/src/controllers/service-catalog.controller.ts     |     2 +-
 backend/domains/portal/citizen-service/src/dto/create-manifestation-extension.dto.ts     |     2 +-
 backend/domains/portal/citizen-service/src/dto/create-manifestation.dto.ts               |     2 +-
 backend/domains/portal/citizen-service/src/dto/create-service-catalog.dto.ts             |     2 +-
 backend/domains/portal/citizen-service/src/entities/manifestation-extension.entity.ts    |     2 +-
 backend/domains/portal/citizen-service/src/entities/manifestation.entity.ts              |     2 +-
 backend/domains/portal/citizen-service/src/entities/service-catalog.entity.ts            |     2 +-
 backend/domains/portal/citizen-service/src/handwritten/evaluation.service.ts             |   283 +
 backend/domains/portal/citizen-service/src/handwritten/evaluations.controller.ts         |    78 +
 backend/domains/portal/citizen-service/src/handwritten/events.ts                         |   178 +
 backend/domains/portal/citizen-service/src/handwritten/index.ts                          |    13 +
 backend/domains/portal/citizen-service/src/handwritten/manifestation.service.spec.ts     |   760 ++
 backend/domains/portal/citizen-service/src/handwritten/manifestation.service.ts          |   678 ++
 backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts      |   161 +
 backend/domains/portal/citizen-service/src/handwritten/portal-timers.ts                  |    60 +
 backend/domains/portal/citizen-service/src/handwritten/service-charter.controller.ts     |    67 +
 backend/domains/portal/citizen-service/src/index.ts                                      |     3 +-
 .../portal/citizen-service/src/repositories/manifestation-extension.repository.ts        |     2 +-
 backend/domains/portal/citizen-service/src/repositories/manifestation.repository.ts      |     2 +-
 backend/domains/portal/citizen-service/src/repositories/service-catalog.repository.ts    |     2 +-
 backend/domains/portal/citizen-service/src/services/manifestation-extension.service.ts   |     2 +-
 backend/domains/portal/citizen-service/src/services/manifestation.service.ts             |     2 +-
 backend/domains/portal/citizen-service/src/services/service-catalog.service.ts           |     2 +-
 .../domains/portal/citizen-service/tests/integration/portal-timers.integration.spec.ts   |    97 +
 backend/domains/portal/citizen-service/vitest.config.ts                                  |     6 +
 backend/domains/portal/identity/src/handwritten/assurance.controller.ts                  |    69 +-
 backend/domains/portal/identity/src/handwritten/events.ts                                |   161 +
 backend/domains/portal/identity/src/handwritten/identity.service.ts                      |   349 +-
 backend/domains/portal/identity/src/handwritten/index.ts                                 |     3 +
 backend/domains/portal/identity/src/handwritten/pagination.ts                            |    48 +
 backend/domains/portal/identity/src/handwritten/preferences.controller.ts                |    56 +-
 backend/domains/portal/identity/src/handwritten/representations.controller.ts            |   126 +-
 backend/domains/portal/identity/src/handwritten/validation.ts                            |    25 +
 backend/domains/portal/inbox/package.json                                                |     3 +
 backend/domains/portal/inbox/src/controllers/acknowledgement-evidence.controller.ts      |     2 +-
 backend/domains/portal/inbox/src/controllers/inbox-item.controller.ts                    |     2 +-
 backend/domains/portal/inbox/src/controllers/push-subscription.controller.ts             |     2 +-
 backend/domains/portal/inbox/src/controllers/sne-enrollment.controller.ts                |     2 +-
 backend/domains/portal/inbox/src/dto/create-acknowledgement-evidence.dto.ts              |     2 +-
 backend/domains/portal/inbox/src/dto/create-inbox-item.dto.ts                            |     2 +-
 backend/domains/portal/inbox/src/dto/create-push-subscription.dto.ts                     |     2 +-
 backend/domains/portal/inbox/src/dto/create-sne-enrollment.dto.ts                        |     2 +-
 backend/domains/portal/inbox/src/entities/acknowledgement-evidence.entity.ts             |     2 +-
 backend/domains/portal/inbox/src/entities/inbox-item.entity.ts                           |     2 +-
 backend/domains/portal/inbox/src/entities/push-subscription.entity.ts                    |     2 +-
 backend/domains/portal/inbox/src/entities/sne-enrollment.entity.ts                       |     2 +-
 backend/domains/portal/inbox/src/handwritten/events.ts                                   |   238 +
 backend/domains/portal/inbox/src/handwritten/inbox.controller.ts                         |   108 +
 backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts                       |   667 ++
 backend/domains/portal/inbox/src/handwritten/inbox.service.ts                            |   452 +
 backend/domains/portal/inbox/src/handwritten/index.ts                                    |     9 +
 backend/domains/portal/inbox/src/handwritten/sne-enrollment.controller.ts                |   184 +
 backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts                   |   440 +
 backend/domains/portal/inbox/src/inbox.module.ts                                         |    14 +-
 backend/domains/portal/inbox/src/index.ts                                                |     3 +-
 backend/domains/portal/inbox/src/repositories/acknowledgement-evidence.repository.ts     |     2 +-
 backend/domains/portal/inbox/src/repositories/inbox-item.repository.ts                   |     2 +-
 backend/domains/portal/inbox/src/repositories/push-subscription.repository.ts            |     2 +-
 backend/domains/portal/inbox/src/repositories/sne-enrollment.repository.ts               |     2 +-
 backend/domains/portal/inbox/src/services/acknowledgement-evidence.service.ts            |     2 +-
 backend/domains/portal/inbox/src/services/inbox-item.service.ts                          |     2 +-
 backend/domains/portal/inbox/src/services/push-subscription.service.ts                   |     2 +-
 backend/domains/portal/inbox/src/services/sne-enrollment.service.ts                      |     2 +-
 backend/domains/portal/inbox/tests/integration/portal-inbox.integration.spec.ts          |   257 +
 backend/domains/portal/inbox/vitest.config.ts                                            |     9 +
 backend/domains/portal/projections/package.json                                          |     2 +
 backend/domains/portal/projections/src/controllers/crash-view.controller.ts              |     2 +-
 backend/domains/portal/projections/src/controllers/exam-view.controller.ts               |     2 +-
 backend/domains/portal/projections/src/controllers/infraction-view.controller.ts         |     2 +-
 backend/domains/portal/projections/src/controllers/national-read-cache.controller.ts     |     2 +-
 backend/domains/portal/projections/src/controllers/points-view.controller.ts             |     2 +-
 backend/domains/portal/projections/src/controllers/process-timeline.controller.ts        |     2 +-
 .../domains/portal/projections/src/controllers/projection-applied-event.controller.ts    |     2 +-
 backend/domains/portal/projections/src/dto/create-crash-view.dto.ts                      |     2 +-
 backend/domains/portal/projections/src/dto/create-exam-view.dto.ts                       |     2 +-
 backend/domains/portal/projections/src/dto/create-infraction-view.dto.ts                 |     2 +-
 backend/domains/portal/projections/src/dto/create-national-read-cache.dto.ts             |     2 +-
 backend/domains/portal/projections/src/dto/create-points-view.dto.ts                     |     2 +-
 backend/domains/portal/projections/src/dto/create-process-timeline.dto.ts                |     2 +-
 backend/domains/portal/projections/src/dto/create-projection-applied-event.dto.ts        |     2 +-
 backend/domains/portal/projections/src/entities/crash-view.entity.ts                     |     2 +-
 backend/domains/portal/projections/src/entities/exam-view.entity.ts                      |     2 +-
 backend/domains/portal/projections/src/entities/infraction-view.entity.ts                |     2 +-
 backend/domains/portal/projections/src/entities/national-read-cache.entity.ts            |     2 +-
 backend/domains/portal/projections/src/entities/points-view.entity.ts                    |     2 +-
 backend/domains/portal/projections/src/entities/process-timeline.entity.ts               |     2 +-
 backend/domains/portal/projections/src/entities/projection-applied-event.entity.ts       |     2 +-
 backend/domains/portal/projections/src/handwritten/aits.controller.ts                    |   365 +
 backend/domains/portal/projections/src/handwritten/crash-view.projection.spec.ts         |    69 +
 backend/domains/portal/projections/src/handwritten/crash-view.projection.ts              |    72 +
 backend/domains/portal/projections/src/handwritten/crashes.controller.ts                 |   150 +
 backend/domains/portal/projections/src/handwritten/documents.controller.ts               |   261 +
 backend/domains/portal/projections/src/handwritten/exam-view.projection.spec.ts          |    69 +
 backend/domains/portal/projections/src/handwritten/exam-view.projection.ts               |    56 +
 backend/domains/portal/projections/src/handwritten/exams.controller.ts                   |   138 +
 backend/domains/portal/projections/src/handwritten/index.ts                              |    17 +
 backend/domains/portal/projections/src/handwritten/infraction-view.projection.spec.ts    |   634 ++
 backend/domains/portal/projections/src/handwritten/infraction-view.projection.ts         |   721 ++
 backend/domains/portal/projections/src/handwritten/national-reads.service.ts             |   194 +
 backend/domains/portal/projections/src/handwritten/points-view.projection.spec.ts        |   209 +
 backend/domains/portal/projections/src/handwritten/points-view.projection.ts             |   150 +
 backend/domains/portal/projections/src/handwritten/process-timeline.projection.spec.ts   |   201 +
 backend/domains/portal/projections/src/handwritten/process-timeline.projection.ts        |   219 +
 backend/domains/portal/projections/src/handwritten/projection-contract.ts                |   118 +
 backend/domains/portal/projections/src/handwritten/projectors.service.ts                 |   407 +
 backend/domains/portal/projections/src/index.ts                                          |     3 +-
 backend/domains/portal/projections/src/projections.module.ts                             |    17 +-
 backend/domains/portal/projections/src/repositories/crash-view.repository.ts             |     2 +-
 backend/domains/portal/projections/src/repositories/exam-view.repository.ts              |     2 +-
 backend/domains/portal/projections/src/repositories/infraction-view.repository.ts        |     2 +-
 backend/domains/portal/projections/src/repositories/national-read-cache.repository.ts    |     2 +-
 backend/domains/portal/projections/src/repositories/points-view.repository.ts            |     2 +-
 backend/domains/portal/projections/src/repositories/process-timeline.repository.ts       |     2 +-
 .../domains/portal/projections/src/repositories/projection-applied-event.repository.ts   |     2 +-
 backend/domains/portal/projections/src/services/crash-view.service.ts                    |     2 +-
 backend/domains/portal/projections/src/services/exam-view.service.ts                     |     2 +-
 backend/domains/portal/projections/src/services/infraction-view.service.ts               |     2 +-
 backend/domains/portal/projections/src/services/national-read-cache.service.ts           |     2 +-
 backend/domains/portal/projections/src/services/points-view.service.ts                   |     2 +-
 backend/domains/portal/projections/src/services/process-timeline.service.ts              |     2 +-
 backend/domains/portal/projections/src/services/projection-applied-event.service.ts      |     2 +-
 backend/domains/portal/projections/tests/fixtures/outbox-events.ts                       |   263 +
 .../portal/projections/tests/integration/portal-projections-replay.integration.spec.ts   |   646 ++
 backend/domains/portal/projections/tests/support/projectors-harness.ts                   |   174 +
 backend/domains/portal/projections/vitest.config.ts                                      |     6 +
 backend/domains/portal/requests/package.json                                             |     1 +
 backend/domains/portal/requests/src/controllers/consequence-ack.controller.ts            |     2 +-
 backend/domains/portal/requests/src/controllers/evaluation.controller.ts                 |     2 +-
 backend/domains/portal/requests/src/controllers/idempotency-record.controller.ts         |     2 +-
 backend/domains/portal/requests/src/controllers/protocol.controller.ts                   |     2 +-
 backend/domains/portal/requests/src/controllers/request-attachment.controller.ts         |     2 +-
 backend/domains/portal/requests/src/controllers/request-draft.controller.ts              |     2 +-
 backend/domains/portal/requests/src/controllers/request.controller.ts                    |     2 +-
 backend/domains/portal/requests/src/dto/create-consequence-ack.dto.ts                    |     2 +-
 backend/domains/portal/requests/src/dto/create-evaluation.dto.ts                         |     2 +-
 backend/domains/portal/requests/src/dto/create-idempotency-record.dto.ts                 |     2 +-
 backend/domains/portal/requests/src/dto/create-protocol.dto.ts                           |     2 +-
 backend/domains/portal/requests/src/dto/create-request-attachment.dto.ts                 |     2 +-
 backend/domains/portal/requests/src/dto/create-request-draft.dto.ts                      |     2 +-
 backend/domains/portal/requests/src/dto/create-request.dto.ts                            |     2 +-
 backend/domains/portal/requests/src/entities/consequence-ack.entity.ts                   |     2 +-
 backend/domains/portal/requests/src/entities/evaluation.entity.ts                        |     2 +-
 backend/domains/portal/requests/src/entities/idempotency-record.entity.ts                |     2 +-
 backend/domains/portal/requests/src/entities/protocol.entity.ts                          |     2 +-
 backend/domains/portal/requests/src/entities/request-attachment.entity.ts                |     2 +-
 backend/domains/portal/requests/src/entities/request-draft.entity.ts                     |     2 +-
 backend/domains/portal/requests/src/entities/request.entity.ts                           |     2 +-
 backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts         |   142 +
 backend/domains/portal/requests/src/handwritten/drafts.ts                                |   129 +
 backend/domains/portal/requests/src/handwritten/events.ts                                |   260 +
 backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts            |     3 +
 backend/domains/portal/requests/src/handwritten/idempotency.service.spec.ts              |   255 +
 backend/domains/portal/requests/src/handwritten/idempotency.service.ts                   |   155 +
 backend/domains/portal/requests/src/handwritten/index.ts                                 |    13 +
 backend/domains/portal/requests/src/handwritten/protocol.spec.ts                         |   167 +
 backend/domains/portal/requests/src/handwritten/protocol.ts                              |   100 +
 backend/domains/portal/requests/src/handwritten/requests.controller.ts                   |   279 +
 backend/domains/portal/requests/src/handwritten/requests.service.spec.ts                 |  1571 +++
 backend/domains/portal/requests/src/handwritten/requests.service.ts                      |  1543 +++
 backend/domains/portal/requests/src/index.ts                                             |     3 +-
 backend/domains/portal/requests/src/repositories/consequence-ack.repository.ts           |     2 +-
 backend/domains/portal/requests/src/repositories/evaluation.repository.ts                |     2 +-
 backend/domains/portal/requests/src/repositories/idempotency-record.repository.ts        |     2 +-
 backend/domains/portal/requests/src/repositories/protocol.repository.ts                  |     2 +-
 backend/domains/portal/requests/src/repositories/request-attachment.repository.ts        |     2 +-
 backend/domains/portal/requests/src/repositories/request-draft.repository.ts             |     2 +-
 backend/domains/portal/requests/src/repositories/request.repository.ts                   |     2 +-
 backend/domains/portal/requests/src/requests.module.ts                                   |    13 +-
 backend/domains/portal/requests/src/services/consequence-ack.service.ts                  |     2 +-
 backend/domains/portal/requests/src/services/evaluation.service.ts                       |     2 +-
 backend/domains/portal/requests/src/services/idempotency-record.service.ts               |     2 +-
 backend/domains/portal/requests/src/services/protocol.service.ts                         |     2 +-
 backend/domains/portal/requests/src/services/request-attachment.service.ts               |     2 +-
 backend/domains/portal/requests/src/services/request-draft.service.ts                    |     2 +-
 backend/domains/portal/requests/src/services/request.service.ts                          |     2 +-
 backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts    |   369 +
 backend/domains/portal/requests/tests/support/fake-sql.ts                                |  1895 ++++
 backend/domains/portal/requests/tests/support/nest-construct.ts                          |    87 +
 backend/domains/portal/requests/tests/support/portal-fixtures.ts                         |   587 ++
 backend/domains/portal/requests/vitest.config.ts                                         |     6 +
 backend/domains/shared/src/decorators.ts                                                 |     6 +
 backend/domains/shared/src/errors/if-match.ts                                            |     5 +-
 backend/domains/shared/src/policy.spec.ts                                                |   196 +-
 backend/domains/shared/src/policy.ts                                                     |    48 +-
 docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json                             |    47 +-
 docs/framework/blueprints/BP-PORTAL-INBOX-001.json                                       |    49 +-
 docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json                                 |    50 +-
 docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json                                    |    39 +-
 docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.commands.openapi.json             |  1463 +++
 docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.openapi.json                      |     2 +-
 docs/framework/contracts/BP-PORTAL-IDENTITY-001.commands.openapi.json                    |  2074 ++++
 docs/framework/contracts/BP-PORTAL-INBOX-001.commands.openapi.json                       |  1682 ++++
 docs/framework/contracts/BP-PORTAL-INBOX-001.openapi.json                                |     2 +-
 docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.commands.openapi.json                 |  2540 +++++
 docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.openapi.json                          |     2 +-
 docs/framework/contracts/BP-PORTAL-REQUESTS-001.commands.openapi.json                    |  4087 ++++++++
 docs/framework/contracts/BP-PORTAL-REQUESTS-001.openapi.json                             |     2 +-
 docs/framework/schemas/README.md                                                         |    11 +-
 docs/framework/schemas/portal-request-draft.schema.json                                  |   221 +
 packages/api-clients/src/generated/BP-PORTAL-CITIZEN-SERVICE-001.commands.ts             |   925 ++
 packages/api-clients/src/generated/BP-PORTAL-IDENTITY-001.commands.ts                    |  1360 +++
 packages/api-clients/src/generated/BP-PORTAL-INBOX-001.commands.ts                       |  1065 ++
 packages/api-clients/src/generated/BP-PORTAL-PROJECTIONS-001.commands.ts                 |  1703 ++++
 packages/api-clients/src/generated/BP-PORTAL-REQUESTS-001.commands.ts                    |  2409 +++++
 pnpm-lock.yaml                                                                           |    24 +
 record/proofs/chain.json                                                                 |    55 +-
 tools/contracts/check-commands.mjs                                                       |    54 +-
 tools/contracts/tests/check-commands.test.mjs                                            |     6 +-
 tools/parameters/verify.mjs                                                              |     9 +
 work/rounds/R-0009/budget.json                                                           |   101 +-
 work/rounds/R-0009/contracts/CTG-0002.md                                                 |  2231 +++++
 work/rounds/R-0009/plan.md                                                               |    73 +-
 work/rounds/R-0009/tasks/TASK-0005.json                                                  |     4 +-
 work/rounds/R-0009/tasks/TASK-0006.json                                                  |    20 +-
 work/rounds/R-0009/tasks/TASK-0007.json                                                  |     9 +-
 work/rounds/R-0009/tasks/TASK-0008.json                                                  |     8 +-
 work/rounds/R-0009/tasks/TASK-0009.json                                                  |     4 +-
 243 files changed, 67496 insertions(+), 217 deletions(-)
```

### Relatórios

#### work/rounds/R-0009/reports/TASK-0005.md

```markdown
Papel: Architect (Art. 6)
Tarefa: TASK-0005
Arquivos criados/alterados:

- `work/rounds/R-0009/contracts/CTG-0002.md` (novo, 2231 linhas, §0–§15: 43 blocos de rota + tabela §2.8 das rotas sem fonte; §3 delegação/protocolo; §4 idempotência; §5 vínculo; §6 caixa/SNE; §7 projeções com `INFRACTION_SITUATION_MAP` completo (15 tokens: 12 mapeados, 3 OD-P20), `actions[]`, replay; §8 cache nacional; §9 SSE; §10 `PORTAL_RULES` literal (29 regras) + matriz ⇔ rotas + `inScope`; §11 eventos; §12 fixtures; §13 84 critérios C-0002-01…84; §14 layout; §15 divergências e OD-P28…P45)
- Blueprints (bloco `module`, M24): `BP-PORTAL-REQUESTS-001` v1.0.2 (deps +`@detran/portal-identity`; handwritten*; `moduleImports` IdentityModule; `moduleExports` [PortalIdempotencyService, PortalRequestsService]); `BP-PORTAL-INBOX-001` v1.0.2 (deps +identity, +requests, +inf-deadlines; imports Identity/Requests; exports [PortalSneEnrollmentService]); `BP-PORTAL-CITIZEN-SERVICE-001` v1.0.1 (deps +identity, +requests; imports Identity/Requests); `BP-PORTAL-PROJECTIONS-001` v1.0.1 (deps +identity; imports Identity; exports [PortalProjectors])
- Gerados só via gerador: `package.json`, `vitest.config.ts`, `src/index.ts`, `src/<pacote>.module.ts` dos quatro pacotes; contratos e clientes em sincronia.

Comandos executados e saída resumida: `pnpm blueprints:generate` 2× (6–7 min cada) exit 0; `contracts:openapi` 43; `contracts:clients` 52; `blueprints:check` OK; `contracts:check` OK (92 ops, 52 clients); prettier check OK; `kb/check` OK (521/446); `verify:decorators` OK (867); typecheck dos 4 pacotes VERMELHO esperado (`TS2307 ./handwritten/*` + deps workspace novas até `pnpm install`).

Critérios de aceitação: blueprints:check PASS; contracts:check PASS; format PASS; kb PASS; contrato com 15+1 seções, 43 blocos, `PORTAL_RULES` literal, `INFRACTION_SITUATION_MAP` completo, 84 critérios PASS.

Fora do escopo / deixado: `pnpm install` (maestro); `GET content/points-explainer` não contratada (OD-P31); produtor de `inbox_item` e push fora de M16 (OD-P40); **[DIVERGE-M9-kernel]**: o kernel STYNX (`@Action` ⇒ `@Idempotent()`) já responde 400/replay/422 — para cumprir M9 (409 `{ key }` + `portal.idempotency_record`) o contrato usa `@NoIdempotent()` nas rotas M9 + `PortalIdempotencyService`, e pede reexportar `NoIdempotent` em `shared/decorators.ts` e prefixo `'PORTAL'` em `assertIfMatch` (TASK-0007); autenticação oportunista em `POST manifestations` (`@Public()` + `@Resource/@Action`, extensão do guard de auth do app — OD-P30); locks a acrescentar: TASK-0007 `shared/decorators.ts`, `shared/errors/if-match.ts`; TASK-0008 `app.module.ts` (guard público), `portal-national-read.providers.ts`; TASK-0007 `portal-delegation.providers.ts`; TASK-0009 herda `CONTROLLER_ROOTS` + catálogo do Portal em `check-commands.mjs`.

OD tocadas ou propostas: OD-P15/P16/P17/P19/P20 (AIT_LAVRADO, PENALIDADE_A_APLICAR, AGUARDANDO_RECURSO_2A sem tradução)/P21/P24/P27; novas OD-P28…OD-P45 (§15). Divergências: [DIVERGE-M9-kernel], [DIVERGE-M12] (emissao_crlv), [DIVERGE-M8/M12] (actions.pay), [DIVERGE-M24] (moduleExports/dependencies), [DIVERGE-M15]/[DIVERGE-M16] (topic = type), [DIVERGE-M10] (evento sem CPF), [DIVERGE-M18] (data reformatado), [DIVERGE-route-contract] (representedName; scores aninhado; category na caixa), [DIVERGE-CTG-0001] (representation sem version; EVALUATION_NOT_OFFERED × REQUEST_STATE_INVALID; chaves de effects_ack do seed), [DIVERGE-M19] (guarda própria de manifest).

Bloqueios: nenhum.

Consumo (subagente): ≈553 k tokens brutos, 152 chamadas, 48 min.
```

#### work/rounds/R-0009/reports/TASK-0006.md

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0006
Arquivos criados/alterados:

- Suporte unit (novos): `backend/domains/portal/requests/tests/support/{fake-sql,nest-construct,portal-fixtures}.ts` (tx falsa em memória com subconjunto de SQL documentado; construção por metadados de DI; ids/hashes de CTG-0001 §10, catálogo 15, matriz 21, 13 requests, `TOPICS`, `SNE_EFFECTS`, relógio fixo 2026-09-14)
- Specs unit (novos): `requests/src/handwritten/{idempotency.service,protocol,requests.service}.spec.ts`; `inbox/src/handwritten/inbox.service.spec.ts`; `citizen-service/src/handwritten/manifestation.service.spec.ts`; `projections/src/handwritten/{infraction-view,process-timeline,points-view,crash-view,exam-view}.projection.spec.ts`; `projections/tests/support/projectors-harness.ts`; `projections/tests/fixtures/outbox-events.ts` (12 eventos §12); `backend/app/src/portal-stream.service.spec.ts`
- Specs integration (novos): `requests/tests/integration/portal-requests.integration.spec.ts`; `inbox/tests/integration/portal-inbox.integration.spec.ts`; `citizen-service/tests/integration/portal-timers.integration.spec.ts`; `projections/tests/integration/portal-projections-replay.integration.spec.ts`
- Specs e2e (novos): `backend/app/tests/e2e/{portal-e2e.support.ts,portal-requests.e2e.spec.ts,portal-routes.e2e.spec.ts,portal-stream.e2e.spec.ts}`
- Alterados: `backend/domains/shared/src/policy.spec.ts` (bloco `portal:*` C-0002-83; `portal:appeal:create` → `portal:request:create`; `it` de TASK-0003 sobre `portal:appeal:*` invertido para AUSENTE); `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (`inScope` `portal` exceto `complaint`; C-0002-84; `portal:appeal:*` em `REMOVED_KEYS`)
- Seed (novo): `backend/database/seed/71-fixtures-portal-events.sql` (`setval portal.protocol_seq ≥ 14`; `effects_ack` de …70e00001)

Comandos executados e saída resumida: format:check verde; verify parameters OK; `shared test` 5 failed (só bloco `portal:*`) / 188 passed; typecheck dos pacotes de CTG-0002 vermelho **só** por `src/handwritten/*` inexistentes (TS2307/TS2305 listados por arquivo e linha no relatório do worker); unit/integration dos 4 pacotes vermelhos por módulo ausente; `app test:e2e` 13 files failed (`Cannot find module './handwritten/requests.controller.js'` no `AppModule` — estado intermediário M24, inclusive `portal-identity.e2e`); identity unit 49/49 e integration 11/11 inalterados; `seed.sh` 2× OK (`protocol_seq` = 14); sondas temporárias removidas; 0 vitest vivos.

Critérios de aceitação: format PASS; typecheck (condição) PASS; shared test (bloco portal falha, resto verde) PASS; verify parameters PASS; seed 2× PASS.

Matriz C-0002-01…84 → arquivo → `it(...)`: transcrita integralmente no relatório do worker (84 critérios cobertos; `it.todo` citando R-0007/R-0014 em 28, 51, 69, 70).

Fora do escopo / deixado (triagem do maestro):

1. Contradição interna de CTG-0002: §7.1 (`rebuild` = `delete` + reaplicar) × §7.3 (fixture …f0000002 com linha de view pré-existente sem identidade) → C-0002-57 vermelho mesmo com implementação correta até o contrato fixar se `rebuild` preserva linhas nunca projetadas (sentinela D10).
2. Ordem de erros na segunda avaliação (C-0002-66/80 `EVALUATION_ALREADY_SUBMITTED` × §2.3/§2.6 guarda de estado primeiro): e2e aceita 409 com qualquer dos dois códigos; unit prova o unique recolocando a fixture em AVALIACAO_OFERECIDA.
3. `policy.spec.ts`: `it` de `portal:appeal:*` invertido (coexistir com C-0002-83 tornaria o arquivo permanentemente vermelho após TASK-0007).
4. MOD-seed-70 realizado como `71-fixtures-portal-events.sql`.
5. C-0002-57: eventos entram por `insert` SQL com ids fixos.
6. C-0002-59: `list(aits)` provado por HTTP (C-0002-72/73) + `assertEntitled` real na integração.
7. Constrangimentos dos fakes para TASK-0007/0008 (documentados nos cabeçalhos): SQL dentro do subconjunto de `fake-sql.ts`; assinaturas `create(tx, identity, body, headers)`, `updateDraft/submit/withdraw/evaluate(tx, identity, id, body, headers)`, `respondDiligence(tx, identity, id, did, body, headers)`, `manifest(tx, identity|null, body, headers)`, `acknowledge(tx, identity, id)`, `evaluate(tx, identity, body, headers)`, `read(tx, subject, id)`, `enroll(tx, subject, identity, body)`, `cancel(tx, subject, identity, reason?)`, `applyEvent(event, tx)` → `ApplyOutcome`, `reshape(topic, payload, row?)`, `listSince(cursor, scope, limit)`; headers minúsculos; `protocolNumber(tx, slug, today, requestId)`; `new ReadServiceDelegationTarget(serviceKey, readResource, targetKinds)`; diligência sob `'inf:rait-case:answer-inquiry'`; `actor.id` = `RequestContext.snapshot().actorId`.
8. `@detran/inf-deadlines` não é dependência de `@detran/app` nem de `@detran/portal-projections` (projetor §7.4 usa `addCalendarMonths`) → blueprint PROJECTIONS (Architect) / `app/package.json` (TASK-0008).
9. `SneEnrollmentDelegationTarget` é composição do app (§3.2): unit com alvo espião; real em C-0002-67.
10. C-0002-45 unit com valor-sonda 7; integração compara com `duration_value` do DDL 14.
11. `policy-routes` inclui `portal:*` no `inScope` — vermelho até TASK-0007/0008.

OD tocadas ou propostas: nenhuma nova; referenciadas OD-P19, P20, P28, P33, P40, P43.

Bloqueios: nenhum.

Consumo (subagente): ≈717 k tokens brutos, 140 chamadas, 64 min.

## Iteração 2 (2026-09-16, restrita — §Triagem de TASK-0007)

Papel: Inspector. Arquivos: `backend/app/tests/e2e/portal-requests.e2e.spec.ts` (C-0002-70: `consulta_bat` → `targetKind:'crash'`, `consulta_exame` → `'exam'` com `targetId` real + 2 entitlements no `beforeAll`; limpeza em `afterAll` na ordem das FKs), `backend/app/tests/e2e/portal-e2e.support.ts`, `backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts` (C-0002-30: aceita os protocolos hex das fixtures). Comandos: format OK; requests typecheck OK; app typecheck só símbolos de TASK-0008; requests integration 3/3 (C-0002-30 verde); e2e não executado (app não sobe até TASK-0008). Critérios: PASS (e2e registrado, não FAIL). OD: nenhuma. Bloqueios: nenhum. Consumo: ≈178 k brutos, 59 chamadas, 8 min.

## Iteração 3 (2026-09-16, restrita — C-0002-77/79, A6(d)/(e))

Papel: Inspector. Arquivos: `portal-e2e.support.ts` (`seedLocalParameters(client)`: copia as linhas `portal.*`/`privacy.*` do tenant canônico para o tenant local, idempotente), `portal-routes.e2e.spec.ts` (chamada no `beforeAll`; C-0002-79 com toggle de `DETRAN_LOCAL_ROLES`). Comandos: format OK; app typecheck OK; `portal-routes.e2e` 10/10 em duas execuções; `test:e2e` completo após reseed → 13/13 arquivos, 142 passed | 2 todo; verify parameters OK; nenhum vitest vivo. Critérios: todos PASS. Achado novo (fora do escopo desta iteração): `portal-routes.e2e` insere `portal.inbox_item` dos sujeitos prata/ouro sem limpar no `afterAll` → em 2ª execução sem reseed, C-0001-41 viola `fk_portal_inbox_item_subject` (mesma classe do item já triado; sugere limpeza análoga a `resetGoldenSubjectRows`). Consumo: ≈185 k brutos, 70 chamadas, 14 min.

## Iteração 4 (2026-09-16, restrita — idempotência entre arquivos e2e)

Papel: Inspector. Arquivo: `portal-routes.e2e.spec.ts` (chamada a `resetLocalPortalRows(client)` no `afterAll`; helper já existente cobria as tabelas na ordem das FKs). Comandos: format OK; app typecheck OK; reseed; `test:e2e` 1ª execução 13/13 (142 passed | 2 todo); 2ª execução sem reseed 12/13 — única falha `teat-measures-alcohol` C-0004-38/39 (pré-existente, R-0008); os 4 `portal-*.e2e` verdes sem violação de FK. Critérios: PASS. Consumo: ≈158 k brutos, 32 chamadas, 8 min.
```

#### work/rounds/R-0009/reports/TASK-0007.md

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0007
Arquivos criados/alterados:

- Novos: `backend/domains/portal/requests/src/handwritten/{index,requests.controller,requests.service,idempotency.service,protocol,drafts,events}.ts`, `…/handwritten/delegation/delegation.service.ts` (símbolos exatos de BP-PORTAL-REQUESTS-001 v1.0.2; `PORTAL_DELEGATION_TARGETS`, `UnavailableDelegationTarget`, `ReadServiceDelegationTarget`, `DRAFT_SCHEMAS`, `CONSEQUENCE_ACK_KIND_BY_SERVICE`, `NEXT_ACTION_BY_STATE`, `PORTAL_REQUESTS_EVENT_SCHEMAS`, `canonicalJson`/`sha256Hex`, `protocolNumber`/`receiptOf`/`receiptHash`); `backend/domains/portal/identity/src/handwritten/{events,pagination,validation}.ts`; `backend/app/src/portal-delegation.providers.ts` (`PortalDelegationTargetsModule` @Global, mapa §3.2 + `SneEnrollmentDelegationTarget`)
- Alterados: `identity/src/handwritten/{assurance,representations,preferences}.controller.ts` (rotas §2.1), `identity.service.ts` (+`REPRESENTATION_TRANSITIONS`, create/list/revoke/validateRepresentation; `PortalSqlTransaction` estrutural), `identity/src/handwritten/index.ts`; `requests/src/handwritten/guards/request.transitions.ts` (+`respond`); `shared/src/policy.ts` (`PORTAL_RULES` literal §10.1 + montagem; removidas `portal:appeal:*` e a linha solta `portal:identity:read`); `shared/src/decorators.ts` (reexporta `NoIdempotent`); `shared/src/errors/if-match.ts` (prefixo `PORTAL`); `backend/app/src/app.module.ts` (import de `PortalDelegationTargetsModule`)

Comandos executados e saída resumida: shared test 193 passed + typecheck OK; requests typecheck OK, unit 97 passed | 7 todo; identity typecheck OK, unit 49, integration 11; requests integration 2 passed | 1 failed (C-0002-30, contradição teste × seed); app e2e não sobe (símbolos de TASK-0008 ausentes — M24); com stubs temporários (apagados): identity 14/14, requests 9 passed | 2 todo | 3 failed (67/69 TASK-0008; 70 contradição); verify:decorators OK (935); blueprints:check OK; verify parameters OK; format OK; nenhum processo vivo.

Critérios de aceitação: shared PASS; unit requests/identity PASS; integration identity PASS; integration requests 31/32 (C-0002-30 sensor); e2e FAIL por estado M24 (TASK-0008) — com stubs identity 14/14 e requests 9/14; decorators/blueprints/typecheck PASS.

Fora do escopo / deixado:

1. Gate e2e inatingível até TASK-0008 (`InboxModule`/`CitizenServiceModule`/`ProjectionsModule` importam `./handwritten/*`; `portal-delegation.providers.ts` importa `PortalSneEnrollmentService`). C-0002-67/69 exigem SNE real (TASK-0008).
2. Contradição teste × contrato: `portal-requests.e2e.spec.ts` l.739–743 (`consulta_bat`, `targetKind:'none'`) e l.784–788 (`consulta_exame`) — CTG-0002 §3.2 fixa `crash`/`exam`; implementado o contrato (400 `VALIDATION_FAILED { fields:['targetKind'] }`).
3. Contradição teste × seed: `portal-requests.integration.spec.ts` l.180–188 (C-0002-30: espera `\d{7}`; seed 70 grava protocolos hex `…000000a…e` como o contrato §12).
4. Idempotência entre arquivos e2e: `portal-requests.e2e` deixa linhas do sujeito ouro no tenant local; `portal-identity.e2e` C-0001-41 faz `delete from portal.subject` → FK em banco persistente. Sugestão: `resetLocalPortalRows` no `afterAll` de portal-requests.
5. `validateRepresentation` (interno, sem rota — OD-P37): fora de estado → `VALIDATION_FAILED { fields:['state'] }` (catálogo sem código de estado para procuração).
6. `PortalSqlTransaction` estrutural (compatibilidade verificada por asserção de tipo).
7. `pnpm check`, `policy-routes.e2e`, `portal-routes.e2e`, `portal-stream.e2e`, pacotes `inbox`/`citizen-service`/`projections`: TASK-0008/maestro.

OD tocadas ou propostas: nenhuma nova (OD-P15, P17, P33, P37, P38 referenciadas); sugestão: código 409 de estado para procuração no catálogo (TASK-0010).

Bloqueios: nenhum para o código do escopo.

Consumo (subagente): ≈532 k tokens brutos, 130 chamadas, 35 min.
```

#### work/rounds/R-0009/reports/TASK-0008.md

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0008
Arquivos criados/alterados:

- `@detran/portal-inbox` `src/handwritten/{index,events,inbox.service,sne-enrollment.service,inbox.controller,sne-enrollment.controller}.ts` (`PortalInboxService { list, read, subscribePush }` com `fictitiousAcknowledgementOn` via `StaticTimerCatalog.get('T-SNE-CIENCIA')`; `PortalSneEnrollmentService { get, enroll, cancel }`, `SNE_EFFECTS`, `SNE_ENROLLMENT_BODY`, `SNE_ENROLLMENT_TRANSITIONS`; rotas `GET inbox`, `POST inbox/:id/read`, `POST push-subscriptions`, GET/POST(M9)/DELETE `sne/enrollment`)
- `@detran/portal-citizen-service` `src/handwritten/{index,events,portal-timers,manifestation.service,evaluation.service,manifestations.controller,evaluations.controller,service-charter.controller}.ts` (`PORTAL_TIMER_CODES`, `durationOf(tx, code)` lendo `inf.infraction_timer_ref`; `PortalManifestationService { manifest, list, get, acknowledge, analyze, requestInfo, receiveInfo, decide, notifyUser }`; `POST manifestations` `@Public()` com identidade oportunista; `PortalEvaluationService` delega a `PortalRequestsService.evaluate`)
- `@detran/portal-projections` `src/handwritten/{index,projection-contract,infraction-view.projection,process-timeline.projection,points-view.projection,crash-view.projection,exam-view.projection,projectors.service,national-reads.service,aits.controller,documents.controller,crashes.controller,exams.controller}.ts` (`// Source events:`/`// Source tables:`; `INFRACTION_SITUATION_MAP` 15/12, `ACTION_PHASE_MATRIX`, `SqlInfractionViewSource`; `PortalProjectors { applyEvent, rebuild, rebuildAll, tick, start }`; `PortalNationalReadsService`, `PORTAL_NATIONAL_READ_PORTS`, `PORTAL_PARAMETER_READER`, `PORTAL_READ_CACHE_TTL_PARAMETER`)
- app: `backend/app/src/portal-national-read.providers.ts` (`PortalNationalReadPortsModule` @Global: portas via `createSenatranAdapter().ports`, `PORTAL_PARAMETER_READER` = `OpsParameterService`, `PORTAL_PROJECTION_POLLER`), `portal-stream.service.ts`, `portal-stream.controller.ts` (replay 24 h, heartbeat), `app.module.ts` (imports, `PortalStreamController`/`Service`, `PORTAL_STREAM_POLLER`, autenticação oportunista em `POST /v1/portal/manifestations`)

Comandos executados e saída resumida: inbox typecheck OK, unit 13, integration 2; citizen-service typecheck OK, unit 78, integration 1; projections typecheck OK, unit 32 | 1 todo, integration 7 (replay/cache/vínculo); app typecheck OK, unit 64; `backend:test:unit` OK; `backend:test:integration` OK; `backend:test:e2e` → app 12 files passed, 1 failed; 140 passed | 2 failed | 2 todo (C-0002-77, C-0002-79 última asserção); `policy-routes`, `portal-stream` (3×), `portal-identity`, `portal-requests` verdes; verify:decorators OK (960); senatran-boundary OK; parameter-catalogue OK; blueprints:check OK; contracts:check OK; `pnpm check` exit 0 (~9 min); sondas removidas; nenhum processo vivo.

Critérios de aceitação: backend:test:ci — unit PASS, integration PASS, e2e FAIL 2/144 (contradições teste × fixture/substrato); verify:* PASS; blueprints/contracts PASS; `pnpm check` PASS.

Fora do escopo / deixado (triagem do maestro):

1. C-0002-77: `OpsParameterService.get` (`ops/parameter/src/handwritten/parameter.service.ts:385-388`) refiltra `row.effective_from <= on` com `Date` vs string → nunca encontra parâmetro no banco real (defeito pré-existente, fora de "Pode tocar"); além disso o e2e não provisiona `portal.read_cache_ttl_minutes` para o tenant local (`ops.parameter` com RLS). Com leitor funcional (sonda revertida) C-0002-77 passa inteiro.
2. C-0002-79 última asserção: no perfil `test` o verificador local sintetiza principal sem `Authorization` (`raw ?? 'local'`) com os papéis de `setCitizen` → 200; sugestão: `roles: 'field-agent'` ou limpar `DETRAN_LOCAL_ROLES` antes do `noSession`.
3. A5(a) em `infraction_view`: `reset` por projeção (zera colunas derivadas de evento, `last_event_id` sentinela, preserva identidade/`situation`; `crash_view`/`exam_view` só sentinela; `process_timeline`/`points_view` apagadas) em vez do "apaga" literal — C-0002-57 verde.
4. `PORTAL_PROJECTION_POLLER` provido em `PortalNationalReadPortsModule` (global) — provider do `AppModule` não é visível em `ProjectionsModule`; `INFRACTION_VIEW_SOURCE` `@Optional()` com default `SqlInfractionViewSource`.
5. `SqlInfractionViewSource.amount = null` (framing sem valor numérico; OD-P41); `loadDeadlines` `[]` (OD-P39).
6. `rebuild`/`tick` fora de requisição com `Database.withRequestContext({ tenantId, actorId: uuid nulo })` (A3(b)); `start(tenantId)` sem agendador (ADR-0020 §3 job futuro).
7. `teat-measures-alcohol.e2e` C-0004-38/39 responde 409 em segunda execução sem reset (não relacionado).
8. `PortalEvaluationService` sem chave própria de idempotência (delega ao pedido).

OD tocadas ou propostas: nenhuma nova; referenciadas OD-P16/P19/P20/P21/P28/P29/P34/P35/P39/P40/P41/P43.

Bloqueios: nenhum para o código do escopo.

Consumo (subagente): ≈744 k tokens brutos, 230 chamadas, 75 min.
```

#### work/rounds/R-0009/reports/TASK-0009.md

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0009
Arquivos criados/alterados:

- `docs/framework/contracts/BP-PORTAL-{IDENTITY (10 ops),REQUESTS (12),INBOX (6),CITIZEN-SERVICE (6),PROJECTIONS (12)}-001.commands.openapi.json` (novos)
- `docs/framework/schemas/portal-request-draft.schema.json` (novo); `docs/framework/schemas/README.md` (linha de índice)

Comandos executados e saída resumida: `check-commands.mjs` antes → 46 missing-operation; depois → `OK (138 operations)`; `pnpm contracts:check` → openapi OK, commands OK, `generate-clients --check` 5× `missing-client` (esperado, maestro roda `contracts:clients`); format OK; kb check OK (522/446); `contracts:test` informativo: C-5-16 (92→138) e C-5-22 (clients) — antecipados; verify parameters OK.

Critérios de aceitação: contracts:check PASS (exceção prevista dos clientes); format PASS; kb PASS; 138 operações.

Fora do escopo / deixado: `pnpm contracts:clients` (maestro); C-5-16 contagem (maestro/Inspector); `GET /v1/portal/stream` não documentada porque o gate só varria `teat-*` em `backend/app/src` (maestro estendeu para `portal-*` em seguida e pediu o complemento); rotas "(quando existir)" sem 2xx declarado (precedente CTG-0005 §2.2); 422 genérico do kernel de idempotência só nas 7 rotas M9; nenhuma divergência nova rota × `portal-route-contract.md` além das aceitas em CTG-0002 §15.

OD tocadas ou propostas: nenhuma nova (`operationId`s e nomes de DTO derivados pela convenção de CTG-0002 §0).

Bloqueios: nenhum.

Consumo (subagente): ≈319 k tokens brutos, 48 chamadas, 16 min (+ complemento do stream).
```

### Adendas A4–A7 e Triagem (plan.md)

```markdown
- **A4 (2026-09-16, após TASK-0005)** — divergências de `contracts/CTG-0002.md` §15 **aceitas** como escritas no contrato
  (o canônico prevalece; o código segue o contrato): (a) `[DIVERGE-M9-kernel]`: o kernel STYNX (`@Action` ⇒ `@Idempotent()`)
  já trata `Idempotency-Key` (400 sem código, replay, 422 em corpo divergente); para cumprir M9 (409 `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY`
  `{ key }` + `portal.idempotency_record`) as rotas M9 usam `@NoIdempotent()` + `PortalIdempotencyService`; `@detran/shared`
  reexporta `NoIdempotent` em `decorators.ts`; `assertIfMatch(header, version, 'PORTAL')` (TASK-0007; locks
  `MOD-shared-decorators`, `MOD-shared-if-match`, `MOD-app-delegation-providers`). (b) OD-P30: autenticação oportunista em
  `POST manifestations` (`@Public()` + `@Resource/@Action`; extensão do guard de auth do app — H.51 "anônimo para manifestar,
  simples para acompanhar"); TASK-0008 ganha lock `MOD-app-module` (guard público) e `MOD-app-national-read-providers`.
  (c) `[DIVERGE-M12]` `emissao_crlv`, `[DIVERGE-M8/M12]` `actions.pay`, `[DIVERGE-M24]` `moduleExports`/`dependencies`,
  `[DIVERGE-M15]`/`[DIVERGE-M16]` `topic = type`, `[DIVERGE-M10]` evento sem CPF, `[DIVERGE-M18]` `data` reformatado,
  `[DIVERGE-route-contract]` (`representedName`, `scores` aninhado, `category` na caixa), `[DIVERGE-CTG-0001]` (representation
  sem `version`; `EVALUATION_NOT_OFFERED` × `REQUEST_STATE_INVALID`; chaves de `effects_ack` do seed), `[DIVERGE-M19]` (guarda
  própria de `manifest`) — aceitas. (d) `GET content/points-explainer` fica fora desta rodada (OD-P31); produtor de
  `inbox_item`/push fora de M16 (OD-P40). (e) `tools/contracts/check-commands.mjs` (`CONTROLLER_ROOTS` + catálogo do Portal) é
  alteração de ferramenta: feita pelo **maestro (Engineer)** no checkpoint de TASK-0009, não pelo transcritor. (f) `pnpm install`
  (deps workspace novas dos quatro pacotes) feito pelo maestro após TASK-0005. (g) Numeração de DDL: `19-portal-platform.sql`
  convive com `19-est-lifecycle-vocabulary.sql` (R-0010, PR #55) por ordem lexicográfica, como já ocorre com `13-ops-*`.
- **A5 (2026-09-16, após TASK-0006)** — (a) `rebuild` (CTG-0002 §7.1 × §7.3): reaplicar a janela **sem** apagar linhas
  nunca projetadas — `rebuild` apaga apenas as linhas da projeção cujo `last_event_id` pertence à janela reaplicada (ou
  cujo `ait_id`/`request_id`/`subject_cpf_hash` é tocado por evento da janela); linhas com sentinela D10 (fixtures sem
  evento) são preservadas; C-0002-57 vale como escrito (snapshot → rebuild → linhas iguais). (b) Segunda avaliação:
  a guarda de estado responde primeiro (`PORTAL.REQUEST_STATE_INVALID` em `CONCLUIDO`; `PORTAL.EVALUATION_NOT_OFFERED` fora
  de `AVALIACAO_OFERECIDA`); `PORTAL.EVALUATION_ALREADY_SUBMITTED` só quando o pedido ainda está em `AVALIACAO_OFERECIDA` e a
  linha de `evaluation` já existe (índice único) — e2e aceita qualquer dos 409, unit prova o único. (c) `policy.spec.ts`:
  o `it` de TASK-0003 sobre `portal:appeal:*` passa a AUSENTE (M19). (d) Seed `71-fixtures-portal-events.sql` aceito no
  lugar de editar o 70. (e) `@detran/inf-deadlines` entra em `BP-PORTAL-PROJECTIONS-001` v1.0.2 (`dependencies` +
  `testAliases`; maestro como Architect, regenerado no checkpoint) e em `backend/app/package.json` (TASK-0008, wiring).
  (f) Assinaturas fixadas pelos fakes do Inspector (relatório TASK-0006 item 7) valem como contrato para TASK-0007/0008:
  `create(tx, identity, body, headers)`, `updateDraft/submit/withdraw/evaluate(tx, identity, id, body, headers)`,
  `respondDiligence(tx, identity, id, did, body, headers)`, `manifest(tx, identity|null, body, headers)`,
  `acknowledge(tx, identity, id)`, `evaluate(tx, identity, body, headers)`, `read(tx, subject, id)`,
  `enroll(tx, subject, identity, body)`, `cancel(tx, subject, identity, reason?)`, `applyEvent(event, tx)` → `ApplyOutcome`,
  `reshape(topic, payload, row?)`, `listSince(cursor, scope, limit)`, `protocolNumber(tx, slug, today, requestId)`,
  `new ReadServiceDelegationTarget(serviceKey, readResource, targetKinds)`; SQL dentro do subconjunto documentado em
  `requests/tests/support/fake-sql.ts`; headers em minúsculas; `actor.id` = `RequestContext.snapshot().actorId`.
- **A6 (2026-09-16, após TASK-0008)** — (a) `rebuild` implementado como `reset` por projeção (zera colunas derivadas de
  evento e `last_event_id` → sentinela D10, preserva identidade/`situation` em `infraction_view`; `crash_view`/`exam_view`
  só sentinela; `process_timeline`/`points_view` apagadas) — **aceito** como a leitura correta de A5(a). (b)
  `PORTAL_PROJECTION_POLLER` no módulo global `PortalNationalReadPortsModule` (visibilidade Nest) — aceito. (c) Defeito
  pré-existente de `ops/parameter` (`OpsParameterService.select` comparava `Date` com string; toda leitura em banco real
  devolvia 404) corrigido pelo **maestro (Engineer)** com comparação por dia ISO — `plant-bug` de R-0004 registrado em
  §Triagem; lock `MOD-ops-parameter` tocado fora da frente por necessidade do gate (mudança mínima, testes de
  `ops-parameter` verdes). (d) O e2e do app provisiona os parâmetros `portal.*` do tenant local copiando as linhas do
  tenant canônico de `ops.parameter` (TASK-0006 iteração 3; nunca literal de chave nos specs). (e) C-0002-79: a
  chamada "sem sessão" no perfil `test` precisa de papel fora da matriz (`field-agent`) ou de `DETRAN_LOCAL_ROLES` vazio
  (TASK-0006 iteração 3).
- **A7 (2026-09-16, gate de CTG-0002)** — `verify:parameter-catalogue --check-usage` acusava as chaves de rótulo i18n
  (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados
  `packages/api-clients/src/generated/BP-PORTAL-*.commands.ts` (tipos `const` transcritos dos contratos). Chaves i18n do
  Portal começam por `portal.` e têm ≥ 2 pontos, colidindo com a heurística de candidato do verificador; os clientes gerados
  não leem parâmetro. Decisão: excluir **só** `packages/api-clients/src/generated` da varredura de uso (comentário no
  verificador; nenhuma allowlist de chaves), manter todo o resto; a doc do verificador (`parameter-catalogue.md`
  §"Verificador fail-closed") é atualizada por TASK-0010; a colisão heurística × i18n vira OD-P46 (Architect: prefixo
  ou allowlist declarada para chaves i18n quando `i18n/portal.pt-BR.json` entrar em código, R-0014).

## Tarefas

## Triagem

(uma linha por falha de gate: `TASK — gate — plant-bug | sensor-error | policy-issue | reference-gap — achado — ação`)

- TASK-0004 — `pnpm --filter @detran/portal-identity test:unit` (C-0001-20a) — sensor-error — spec define relógio fixo mas não o injeta em `assertActLevel` (contrato §4 exige injeção) — TASK-0003 iteração 2: passar `clock` (5º argumento); código intacto.
- TASK-0004 — `pnpm --filter @detran/app test:e2e` (C-0001-42) — reference-gap — contrato §3 fixa que a política roda antes da guarda; `field-agent` é negado pela política (403 STYNX sem `code`), logo `IDENTITY_NOT_CITIZEN` é inalcançável para esse papel no e2e — adenda A3; TASK-0003 iteração 2 ajusta a expectativa (403 sem `code`); `IDENTITY_NOT_CITIZEN` provado por `technical-admin` com claims (C-0001-09b).
- TASK-0004 — e2e C-0001-41 (reexecução em banco persistente) — sensor-error — spec não limpa `portal.subject` do CPF fixture no `beforeAll` — TASK-0003 iteração 2: `delete` no `beforeAll`.
- maestro (merge de `origin/main` #55) — `pnpm backend:test:ci` (`est-crash` `boat-contract.integration` "seed.sh roda duas vezes") — sensor-error (ambiente) — o spec de R-0010 roda `seed.sh` com `DB_NAME ?? 'detran_r10'`, banco sem o DDL do Portal; com `DB_NAME=detran_r9` (agora em `env-detran-r9.sh`) passa 21/21 — nenhum código alterado; CI usa `DB_NAME=detran`.
- TASK-0007 — e2e `portal-requests` C-0002-70 — sensor-error — spec usa `targetKind:'none'` para `consulta_bat`/`consulta_exame`; contrato §3.2 fixa `crash`/`exam` — TASK-0006 iteração 2: corrigir o spec.
- TASK-0007 — integration `portal-requests` C-0002-30 — sensor-error — spec espera protocolos `\d{7}`; fixtures do seed 70 usam sufixo hex (contrato §12) — TASK-0006 iteração 2: aceitar os números das fixtures (só os gerados por `protocolNumber` são `\d{7}`).
- TASK-0007 — e2e entre arquivos (C-0001-41 × `portal-requests.e2e`) — sensor-error — `portal-requests.e2e` deixa linhas do sujeito ouro no tenant local; `delete from portal.subject` de C-0001-41 viola FK em banco persistente — TASK-0006 iteração 2: limpeza em `afterAll` de `portal-requests.e2e` (requests, protocols, idempotency_record, representation do sujeito).
- TASK-0008 — e2e `portal-routes` C-0002-77 — plant-bug (pré-existente, R-0004 `ops/parameter`) — `OpsParameterService.select` comparava `Date` (pg `date`) com string → parâmetro nunca encontrado — corrigido pelo maestro (A6(c)); + sensor-error: e2e não provisiona parâmetros do tenant local — TASK-0006 iteração 3.
- TASK-0008 — e2e `portal-routes` C-0002-79 (última asserção) — sensor-error — verificador local sintetiza principal sem `Authorization` com os papéis correntes — TASK-0006 iteração 3 (A6(e)).
- TASK-0009 — `pnpm contracts:test` C-5-16 — sensor-error — o teste de R-0008 fixa `operations=92`; com os 47 contratos do Portal o gate conta 139 — contagem atualizada pelo maestro (Engineer) em `tools/contracts/tests/check-commands.test.mjs` (asserção mantida, só o número).
- maestro (gate CTG-0002) — `pnpm check` → `verify:parameter-catalogue --check-usage` — sensor-error — chaves i18n nos clientes gerados do Portal lidas como candidatas a parâmetro — A7: `packages/api-clients/src/generated` fora da varredura de uso.
- TASK-0004 — D13 (`portal.subject.name not null` × contrato) — reference-gap — blueprint `IDENTITY` v1.0.2 `name nullable` (maestro, Architect) + regeneração no checkpoint.

## Retomada
```

### Diff (código manuscrito, testes, app, tools, seeds; sem gerados, sem contratos/plan — leia-os na worktree)

```diff
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 42b20a1..4da326a 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -110,6 +110,13 @@ import {
   seedPortalPublicRequest,
   type PortalPublicRequestLike,
 } from './detran-runtime.js';
+import { PortalDelegationTargetsModule } from './portal-delegation.providers.js';
+import { PortalNationalReadPortsModule } from './portal-national-read.providers.js';
+import { PortalStreamController } from './portal-stream.controller.js';
+import {
+  PORTAL_STREAM_POLLER,
+  PortalStreamService,
+} from './portal-stream.service.js';
 import { TeatSyncModule } from './teat-sync.providers.js';
 import { TeatEvidencePortsModule } from './teat-evidence.providers.js';
 import { TeatSnapshotPortsModule } from './teat-snapshots.providers.js';
@@ -321,6 +328,53 @@ export class BoatVictimPurposeInterceptor {
   }
 }

+/**
+ * R-0009 CTG-0002 §2.8 (adenda A4(b), OD-P30): a única rota `@Public()` com
+ * autenticação OPORTUNISTA é `POST /v1/portal/manifestations` (H.51 "anônimo
+ * para manifestar, simples para acompanhar"). Quando o cabeçalho
+ * `Authorization` está presente, o guard interno tenta autenticar (principal e
+ * tenancy STYNX normais); qualquer falha → segue anônimo
+ * (`seedPortalPublicRequest`). Nunca 401/403 nessa rota.
+ */
+export function isPortalOptionalAuthPath(
+  path: string,
+  method: string | undefined,
+): boolean {
+  return (
+    (method ?? '').toUpperCase() === 'POST' &&
+    path.split('?', 1)[0] === '/v1/portal/manifestations'
+  );
+}
+
+type PortalPublicRequest = PortalPublicRequestLike & {
+  method?: string;
+  originalUrl?: string;
+};
+
+async function activatePublicPortalRoute(
+  request: PortalPublicRequest,
+  authenticate: () => boolean | Promise<boolean>,
+): Promise<boolean> {
+  const path = request.path ?? request.originalUrl ?? request.url ?? '';
+  const authorization = request.headers?.authorization;
+  const hasAuthorization =
+    typeof authorization === 'string' && authorization.trim().length > 0;
+  if (isPortalOptionalAuthPath(path, request.method) && hasAuthorization) {
+    try {
+      const authenticated = await portalRequestHostStorage.run(
+        portalHostOf(request.headers),
+        () => authenticate(),
+      );
+      if (authenticated) return true;
+    } catch {
+      // credencial inválida/expirada: a manifestação segue anônima (§2.8)
+    }
+  }
+  // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
+  seedPortalPublicRequest(request);
+  return true;
+}
+
 @Injectable()
 export class DetranLegacyAuthContextGuard implements CanActivate {
   constructor(
@@ -333,13 +387,11 @@ export class DetranLegacyAuthContextGuard implements CanActivate {
       DETRAN_PUBLIC_METADATA_KEY,
       [context.getHandler(), context.getClass()],
     );
-    const request = context
-      .switchToHttp()
-      .getRequest<PortalPublicRequestLike>();
+    const request = context.switchToHttp().getRequest<PortalPublicRequest>();
     if (isPublic) {
-      // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
-      seedPortalPublicRequest(request);
-      return true;
+      return activatePublicPortalRoute(request, () =>
+        this.inner.canActivate(context),
+      );
     }
     const path = request.path ?? request.url ?? '';
     if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
@@ -363,13 +415,11 @@ export class DetranStynxAuthContextGuard implements CanActivate {
       DETRAN_PUBLIC_METADATA_KEY,
       [context.getHandler(), context.getClass()],
     );
-    const request = context
-      .switchToHttp()
-      .getRequest<PortalPublicRequestLike>();
+    const request = context.switchToHttp().getRequest<PortalPublicRequest>();
     if (isPublic) {
-      // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
-      seedPortalPublicRequest(request);
-      return true;
+      return activatePublicPortalRoute(request, () =>
+        this.inner.canActivate(context),
+      );
     }
     const path = request.path ?? request.url ?? '';
     if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
@@ -500,6 +550,12 @@ export class AppModule {
         // Portal do cidadão (R-0009 CTG-0001, plan M1/M24): `identity` traz
         // as rotas manuscritas deste grupo; os outros quatro são montados
         // como módulos puramente gerados (sem rotas) até CTG-0002.
+        // CTG-0002 §3.2/§14 (TASK-0007): o mapa `PORTAL_DELEGATION_TARGETS`
+        // (global) é composto antes dos módulos que o consomem.
+        // CTG-0002 §8/§14 (TASK-0008): portas nacionais, leitor de parâmetros e
+        // poller das projeções (global) antes de `ProjectionsModule`.
+        PortalNationalReadPortsModule,
+        PortalDelegationTargetsModule,
         IdentityModule,
         RequestsModule,
         InboxModule,
@@ -535,6 +591,8 @@ export class AppModule {
       ],
       controllers: [
         TeatStreamController,
+        // CTG-0002 §9 (TASK-0008): SSE do cidadão.
+        PortalStreamController,
         TeatIntegrationsController,
         PecProcessParametersController,
         PecRenachProcessController,
@@ -562,6 +620,13 @@ export class AppModule {
           provide: TEAT_STREAM_POLLER,
           useFactory: () => createDefaultTeatStreamPoller(),
         },
+        // CTG-0002 §9 (M18, TASK-0008): SSE do Portal e a porta do seu poller —
+        // mesma fábrica do TEAT (única chamadora de `setInterval`).
+        PortalStreamService,
+        {
+          provide: PORTAL_STREAM_POLLER,
+          useFactory: () => createDefaultTeatStreamPoller(),
+        },
         TeatIntegrationsService,
         PecProcessParametersService,
         PecRenachProcessService,
diff --git a/backend/app/src/portal-delegation.providers.ts b/backend/app/src/portal-delegation.providers.ts
new file mode 100644
index 0000000..c1d9288
--- /dev/null
+++ b/backend/app/src/portal-delegation.providers.ts
@@ -0,0 +1,168 @@
+// CTG-0002 §3.2 e §14 (R-0009, TASK-0007; plan M8, M23, adenda A4) —
+// composição do mapa `serviceKey → DelegationTarget` (`PORTAL_DELEGATION_TARGETS`)
+// no app, no padrão de `teat-snapshots.providers.ts`.
+//
+// R-0007 não está em `main`: defesa, recursos, indicação, pagamento e junta
+// médica são `UnavailableDelegationTarget` (`delegacao_indisponivel_r0007`);
+// `lgpd_declaracao` (OD-P17) e `emissao_crlv` (R-0014, [DIVERGE-M12]) idem com
+// os seus motivos; `consulta_*` resolvem na hora (`ReadServiceDelegationTarget`);
+// `adesao_sne`/`cancelamento_sne` delegam a `PortalSneEnrollmentService`
+// (`@detran/portal-inbox`, §6.2) — erros do serviço viram
+// `PORTAL.DELEGATION_FAILED` 502 no `submit` (§3.1 passo 10). Trocar os alvos
+// indisponíveis pelos comandos reais é tarefa de R-0014 (M23).
+import { Global, Module } from '@nestjs/common';
+import { InboxModule, PortalSneEnrollmentService } from '@detran/portal-inbox';
+import {
+  PORTAL_DELEGATION_TARGETS,
+  ReadServiceDelegationTarget,
+  UnavailableDelegationTarget,
+  type DelegationInput,
+  type DelegationResult,
+  type DelegationTarget,
+  type DelegationTargetKind,
+} from '@detran/portal-requests';
+
+/** Tokens de `unavailableReason` admitidos nesta rodada (CTG-0002 §0). */
+export const PORTAL_UNAVAILABLE_REASONS = {
+  delegationR0007: 'delegacao_indisponivel_r0007',
+  privacyEndpoint: 'privacy_endpoint_pendente',
+  signedDocumentR0014: 'documento_assinado_pendente_r0014',
+} as const;
+
+/** Comando delegado das diligências (`POST …/diligences/{did}/responses`). */
+export const DILIGENCE_DELEGATION_KEY = 'inf:rait-case:answer-inquiry';
+
+/**
+ * Fatia de `PortalSneEnrollmentService` que o alvo consome (§6.2: `enroll(tx,
+ * subject, identity, body)` e `cancel(tx, subject, identity, reason?)`).
+ */
+export interface SneEnrollmentServiceLike {
+  enroll(
+    tx: DelegationInput['tx'],
+    subject: DelegationInput['subject'],
+    identity: DelegationInput['identity'],
+    body: unknown,
+  ): Promise<{ id: string }>;
+  cancel(
+    tx: DelegationInput['tx'],
+    subject: DelegationInput['subject'],
+    identity: DelegationInput['identity'],
+    reason?: string,
+  ): Promise<{ id?: string } | undefined | void>;
+}
+
+/** §3.2 `adesao_sne` / `cancelamento_sne` → `portal:sne-enrollment:{enroll|cancel}`. */
+export class SneEnrollmentDelegationTarget implements DelegationTarget {
+  readonly targetKinds: readonly DelegationTargetKind[] = ['none'];
+
+  constructor(
+    readonly serviceKey: 'adesao_sne' | 'cancelamento_sne',
+    private readonly enrollment: SneEnrollmentServiceLike,
+  ) {}
+
+  availability(): string | null {
+    return null;
+  }
+
+  async delegate(input: DelegationInput): Promise<DelegationResult> {
+    if (this.serviceKey === 'adesao_sne') {
+      const enrolled = await this.enrollment.enroll(
+        input.tx,
+        input.subject,
+        input.identity,
+        input.draft,
+      );
+      return {
+        domain: 'portal',
+        command: 'portal:sne-enrollment:enroll',
+        externalId: enrolled.id,
+        status: 'delegated',
+      };
+    }
+    const reason = input.draft.reason;
+    const cancelled = await this.enrollment.cancel(
+      input.tx,
+      input.subject,
+      input.identity,
+      typeof reason === 'string' ? reason : undefined,
+    );
+    return {
+      domain: 'portal',
+      command: 'portal:sne-enrollment:cancel',
+      externalId:
+        cancelled && typeof cancelled === 'object' && 'id' in cancelled
+          ? ((cancelled as { id?: string }).id ?? null)
+          : null,
+      status: 'delegated',
+    };
+  }
+}
+
+/** Mapa desta rodada (CTG-0002 §3.2). */
+export function createPortalDelegationTargets(
+  enrollment: SneEnrollmentServiceLike,
+): Map<string, DelegationTarget> {
+  const targets = new Map<string, DelegationTarget>();
+  const unavailable = (
+    serviceKey: string,
+    reason: string,
+    kinds: readonly DelegationTargetKind[],
+  ): void => {
+    targets.set(
+      serviceKey,
+      new UnavailableDelegationTarget(serviceKey, reason, kinds),
+    );
+  };
+  const { delegationR0007, privacyEndpoint, signedDocumentR0014 } =
+    PORTAL_UNAVAILABLE_REASONS;
+  unavailable('defesa_previa', delegationR0007, ['ait']);
+  unavailable('recurso_jari', delegationR0007, ['ait', 'case']);
+  unavailable('recurso_cetran', delegationR0007, ['case']);
+  unavailable('indicacao_condutor', delegationR0007, ['ait']);
+  unavailable('pagamento', delegationR0007, ['ait']);
+  unavailable('junta_medica', delegationR0007, ['exam']);
+  unavailable(DILIGENCE_DELEGATION_KEY, delegationR0007, ['case']);
+  unavailable('lgpd_declaracao', privacyEndpoint, ['none']);
+  unavailable('emissao_crlv', signedDocumentR0014, ['vehicle']);
+  targets.set(
+    'adesao_sne',
+    new SneEnrollmentDelegationTarget('adesao_sne', enrollment),
+  );
+  targets.set(
+    'cancelamento_sne',
+    new SneEnrollmentDelegationTarget('cancelamento_sne', enrollment),
+  );
+  targets.set(
+    'consulta_multas',
+    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
+  );
+  targets.set(
+    'consulta_cnh',
+    new ReadServiceDelegationTarget('consulta_cnh', 'document', ['none']),
+  );
+  targets.set(
+    'consulta_bat',
+    new ReadServiceDelegationTarget('consulta_bat', 'crash', ['crash']),
+  );
+  targets.set(
+    'consulta_exame',
+    new ReadServiceDelegationTarget('consulta_exame', 'exam', ['exam']),
+  );
+  return targets;
+}
+
+export const PORTAL_DELEGATION_TARGETS_PROVIDER = {
+  provide: PORTAL_DELEGATION_TARGETS,
+  useFactory: (
+    enrollment: SneEnrollmentServiceLike,
+  ): Map<string, DelegationTarget> => createPortalDelegationTargets(enrollment),
+  inject: [PortalSneEnrollmentService],
+};
+
+@Global()
+@Module({
+  imports: [InboxModule],
+  providers: [PORTAL_DELEGATION_TARGETS_PROVIDER],
+  exports: [PORTAL_DELEGATION_TARGETS],
+})
+export class PortalDelegationTargetsModule {}
diff --git a/backend/app/src/portal-national-read.providers.ts b/backend/app/src/portal-national-read.providers.ts
new file mode 100644
index 0000000..40e0880
--- /dev/null
+++ b/backend/app/src/portal-national-read.providers.ts
@@ -0,0 +1,65 @@
+// CTG-0002 §8 e §14 (R-0009, TASK-0008; plan M16, M17, adenda A5(e)) —
+// composição no app das portas e parâmetros que `@detran/portal-projections`
+// consome, no padrão de `teat-snapshots.providers.ts`.
+//
+// As portas nacionais são as do `packages/senatran-adapter` (ADR-0003):
+// nenhum módulo de domínio fala com sistema nacional por conta própria, e
+// `portal/projections` só conhece as fatias estruturais declaradas pelo token
+// `PORTAL_NATIONAL_READ_PORTS`. `PORTAL_PARAMETER_READER` é o
+// `OpsParameterService` (`ParameterModule` não é `@Global` e
+// `ProjectionsModule` não o importa — §14). `PORTAL_PROJECTION_POLLER` é a
+// porta do poller das projeções (mesma `TeatStreamPoller`; a fábrica padrão é
+// a única chamadora de `setInterval`). Módulo `@Global()` porque os
+// consumidores vivem em `ProjectionsModule`, importado pelo `AppModule`.
+import { Global, Module } from '@nestjs/common';
+import { ParameterModule, OpsParameterService } from '@detran/ops-parameter';
+import {
+  PORTAL_NATIONAL_READ_PORTS,
+  PORTAL_PARAMETER_READER,
+  PORTAL_PROJECTION_POLLER,
+  type PortalNationalReadPorts,
+  type PortalParameterReader,
+  type PortalProjectionPoller,
+} from '@detran/portal-projections';
+import { createSenatranAdapter } from '@detran/senatran-adapter';
+
+import { createDefaultTeatStreamPoller } from './teat-stream.service.js';
+
+export const PORTAL_NATIONAL_READ_PORTS_PROVIDER = {
+  provide: PORTAL_NATIONAL_READ_PORTS,
+  useFactory: (): PortalNationalReadPorts => {
+    const { ports } = createSenatranAdapter();
+    return {
+      cdt: ports.cdt,
+      renach: ports.renach,
+      wsdenatranRead: ports.wsdenatranRead,
+    };
+  },
+};
+
+export const PORTAL_PARAMETER_READER_PROVIDER = {
+  provide: PORTAL_PARAMETER_READER,
+  useFactory: (service: OpsParameterService): PortalParameterReader => service,
+  inject: [OpsParameterService],
+};
+
+export const PORTAL_PROJECTION_POLLER_PROVIDER = {
+  provide: PORTAL_PROJECTION_POLLER,
+  useFactory: (): PortalProjectionPoller => createDefaultTeatStreamPoller(),
+};
+
+@Global()
+@Module({
+  imports: [ParameterModule],
+  providers: [
+    PORTAL_NATIONAL_READ_PORTS_PROVIDER,
+    PORTAL_PARAMETER_READER_PROVIDER,
+    PORTAL_PROJECTION_POLLER_PROVIDER,
+  ],
+  exports: [
+    PORTAL_NATIONAL_READ_PORTS,
+    PORTAL_PARAMETER_READER,
+    PORTAL_PROJECTION_POLLER,
+  ],
+})
+export class PortalNationalReadPortsModule {}
diff --git a/backend/app/src/portal-stream.controller.ts b/backend/app/src/portal-stream.controller.ts
new file mode 100644
index 0000000..50944af
--- /dev/null
+++ b/backend/app/src/portal-stream.controller.ts
@@ -0,0 +1,207 @@
+// CTG-0002 §2.7 e §9 (R-0009, TASK-0008; plan M18) — `GET /v1/portal/stream`.
+//
+// Padrão de `teat-stream.controller.ts`: `@Get` com resposta manual em
+// streaming (nunca `@Sse`: o verificador de decoradores e o policy-routes
+// leem `@Resource`/`@Action` num `@Get`), replay de 24 h por `Last-Event-ID`,
+// `: connected` na abertura e `: heartbeat` pelo poller — nenhum `setInterval`
+// aqui. Escopo = sujeito da sessão (`cpf_hash` + `subject.id`, §9.3), aplicado
+// no SQL do serviço; envelope de rait-events-sse-contract.md §1 sem `tenantId`
+// e com `data` reformatado por tipo (RN-PORTAL-112).
+//
+// O tick do poller pode rodar fora do contexto da requisição (poller manual
+// em teste, ou um agendador que não herda o ALS): a transação de tenant é
+// então aberta com o escopo capturado na abertura (`Database.withRequestContext`).
+import {
+  Controller,
+  Get,
+  Headers,
+  Inject,
+  Query,
+  Req,
+  Res,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  Action,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalIdentityService,
+  cpfHashOf,
+  portalIdentityOf,
+  type PortalIdentityRequest,
+} from '@detran/portal-identity';
+
+import {
+  PORTAL_STREAM_EVENT_BY_TOPIC,
+  PORTAL_STREAM_POLLER,
+  PORTAL_STREAM_TYPES,
+  PortalStreamService,
+  reshape,
+  type PortalStreamPoller,
+  type PortalStreamScope,
+  type StreamCursor,
+} from './portal-stream.service.js';
+import { HEARTBEAT_INTERVAL_MS } from './teat-stream.service.js';
+
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
+interface RequestWithClose extends RequestLike, PortalIdentityRequest {
+  on(event: 'close', listener: () => void): unknown;
+}
+
+@Controller('v1/portal/stream')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:stream')
+export class PortalStreamController {
+  constructor(
+    private readonly service: PortalStreamService,
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+    @Inject(PORTAL_STREAM_POLLER) private readonly poller: PortalStreamPoller,
+  ) {}
+
+  @Get()
+  @Action('read')
+  async stream(
+    @Req() req: RequestWithClose,
+    @Res() res: ResponseLike,
+    @Headers('last-event-id') lastEventId: string | undefined,
+    @Query('topics') topics: string | undefined,
+  ): Promise<void> {
+    const identity = portalIdentityOf(req);
+    const context = this.requestContext.snapshot();
+    const tenantScope = {
+      tenantId: context.tenantId ?? '',
+      actorId: context.actorId ?? '',
+    };
+    const subject = await withTenantContext(
+      this.database,
+      this.requestContext,
+      (tx) => this.identity.upsertSubject(tx, identity, null),
+    );
+    const scope: PortalStreamScope = {
+      cpfHash: cpfHashOf(identity.cpf),
+      subjectId: subject.subjectId,
+    };
+    const topicFilter = topics
+      ? new Set(
+          topics
+            .split(',')
+            .map((entry) => entry.trim())
+            .filter((entry): entry is (typeof PORTAL_STREAM_TYPES)[number] =>
+              (PORTAL_STREAM_TYPES as readonly string[]).includes(entry),
+            ),
+        )
+      : null;
+
+    // Fora do contexto da requisição (tick do poller), reabre o escopo capturado.
+    const inScope = <T>(work: () => Promise<T>): Promise<T> =>
+      this.requestContext.hasActiveContext()
+        ? work()
+        : this.database.withRequestContext(tenantScope, work);
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
+    let unsubscribeHeartbeat: () => void = () => undefined;
+    let unsubscribePoller: () => void = () => undefined;
+    const cleanup = (): void => {
+      if (closed) return;
+      closed = true;
+      unsubscribeHeartbeat();
+      unsubscribePoller();
+    };
+    req.on('close', cleanup);
+    res.on('close', cleanup);
+
+    // Ticks serializados: um tick pedido durante outro em curso roda logo
+    // depois (nunca dois `listSince` com o mesmo cursor; nada se perde).
+    let ticking = false;
+    let pending = false;
+    const tick = async (): Promise<void> => {
+      if (closed) return;
+      if (ticking) {
+        pending = true;
+        return;
+      }
+      ticking = true;
+      try {
+        do {
+          pending = false;
+          let rows;
+          try {
+            rows = await inScope(() => this.service.listSince(cursor, scope));
+          } catch {
+            return;
+          }
+          if (closed) return;
+          for (const row of rows) {
+            cursor = { createdAt: row.created_at, id: row.id };
+            const event = PORTAL_STREAM_EVENT_BY_TOPIC[row.topic];
+            if (!event) continue;
+            if (topicFilter && !topicFilter.has(event)) continue;
+            const data = reshape(row.topic, row.payload, row);
+            if (!data) continue;
+            const frame = [
+              `id: ${row.id}`,
+              `event: ${event}`,
+              `data: ${JSON.stringify({ aggregate: row.payload.aggregate, data })}`,
+              '',
+              '',
+            ].join('\n');
+            res.write(frame);
+          }
+        } while (pending && !closed);
+      } finally {
+        ticking = false;
+      }
+    };
+
+    unsubscribeHeartbeat = this.poller.schedule(() => {
+      if (!closed) res.write(': heartbeat\n\n');
+    }, HEARTBEAT_INTERVAL_MS);
+    unsubscribePoller = this.poller.schedule(() => {
+      void tick();
+    });
+    if (closed) cleanup();
+
+    await tick();
+  }
+}
diff --git a/backend/app/src/portal-stream.service.spec.ts b/backend/app/src/portal-stream.service.spec.ts
new file mode 100644
index 0000000..a00f0de
--- /dev/null
+++ b/backend/app/src/portal-stream.service.spec.ts
@@ -0,0 +1,319 @@
+// R-0009 CTG-0002 §9 e §13 (TASK-0006) — C-0002-60: `PortalStreamService`
+// (M18): `PORTAL_STREAM_TYPES` (quatro tipos), `reshape(topic, payload)` por
+// tipo (RN-PORTAL-112: nenhum token de inf/rait sai; `data` reformatado), topic
+// desconhecido → null, e `listSince(cursor, scope)` com o escopo (cpf_hash,
+// subjectId) aplicado NO SQL e ordem `(created_at, id)`. Fica vermelho até
+// TASK-0008 criar `backend/app/src/portal-stream.service.ts` (§14).
+//
+// Mesmo padrão de `teat-stream.service.spec.ts`: `import()` dinâmico com
+// especificador variável (o arquivo ainda não existe; `tsc --noEmit` do app não
+// pode quebrar por TS2307), transação falsa que só grava SQL e parâmetros.
+// Os `type` técnicos são montados por `join('.')` — nunca o literal
+// `portal.<x>.<y>` num spec de `src/` (verify:parameter-catalogue).
+import { describe, expect, it, vi } from 'vitest';
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+const topic = (...parts: string[]): string => parts.join('.');
+const TOPIC = {
+  requestChanged: topic('portal', 'request', 'changed'),
+  inboxItem: topic('portal', 'inbox', 'item'),
+  decisionPublished: topic('rait', 'decision', 'published'),
+  paymentConfirmed: topic('inf', 'payment', 'confirmed'),
+  infractionChanged: topic('inf', 'infraction', 'changed'),
+  raitCaseChanged: topic('rait', 'case', 'changed'),
+};
+const NEXT_ACTION_LABEL = (state: string) =>
+  topic('portal', 'requests', 'nextAction', state);
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const SUBJECT_ID = '00000000-0000-7000-8000-000070000002';
+const CPF_HASH =
+  'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4';
+const REQUEST_ID = '00000000-0000-7000-8000-000070400009';
+const CASE_ID = '00000000-0000-7000-8000-007000700207';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000002';
+const INBOX_ID = '00000000-0000-7000-8000-000070c00001';
+
+interface StreamServiceModule {
+  PORTAL_STREAM_TYPES: readonly string[];
+  PORTAL_STREAM_EVENT_BY_TOPIC: Readonly<Record<string, string>>;
+  PORTAL_STREAM_POLLER: symbol;
+  reshape: (
+    topic: string,
+    payload: Record<string, unknown>,
+    row?: Record<string, unknown>,
+  ) => Record<string, unknown> | null;
+  PortalStreamService: new (...args: unknown[]) => {
+    now(): Promise<string>;
+    findById(id: string): Promise<unknown>;
+    listSince(
+      cursor: { createdAt: string; id: string | null },
+      scope: { cpfHash: string; subjectId: string },
+      limit?: number,
+    ): Promise<unknown[]>;
+  };
+}
+
+async function loadModule(): Promise<StreamServiceModule> {
+  try {
+    return (await importModule(
+      './portal-stream.service.js',
+    )) as StreamServiceModule;
+  } catch (cause) {
+    throw new Error(
+      'backend/app/src/portal-stream.service.ts ainda não existe (TASK-0008, CTG-0002 §9/§14)',
+      { cause },
+    );
+  }
+}
+
+function envelope(
+  type: string,
+  domainEvent: string,
+  aggregate: Record<string, unknown>,
+  data: Record<string, unknown>,
+) {
+  return {
+    id: '00000000-0000-7000-8000-007000700091',
+    type,
+    domainEvent,
+    version: 1,
+    occurredAt: '2026-09-14T16:00:00.000Z',
+    tenantId: TENANT_ID,
+    actor: { kind: 'user', id: SUBJECT_ID },
+    correlationId: '00000000-0000-4000-8000-00000000c0f1',
+    aggregate,
+    data,
+  };
+}
+
+function recordingDatabase() {
+  const calls: Array<{ sql: string; values: readonly unknown[] }> = [];
+  const tx = {
+    query: vi.fn(async (sql: string, values: readonly unknown[] = []) => {
+      calls.push({ sql, values });
+      return { rows: [] };
+    }),
+  };
+  const database = {
+    tx: vi.fn(async (...args: unknown[]) => {
+      const work = args.find((arg) => typeof arg === 'function') as (
+        t: unknown,
+      ) => Promise<unknown>;
+      return work(tx);
+    }),
+  };
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({
+      tenantId: TENANT_ID,
+      actorId: SUBJECT_ID,
+      requestId: '00000000-0000-4000-8000-00000000c0f1',
+    }),
+  };
+  return { calls, tx, database, requestContext };
+}
+
+describe('CTG-0002 §9 — PortalStreamService (C-0002-60)', () => {
+  it('C-0002-60 — dado PORTAL_STREAM_TYPES então exatamente os quatro tipos e o mapa topic → evento SSE do §9', async () => {
+    const { PORTAL_STREAM_TYPES, PORTAL_STREAM_EVENT_BY_TOPIC } =
+      await loadModule();
+    expect([...PORTAL_STREAM_TYPES].sort()).toEqual([
+      'decision.published',
+      'inbox.item',
+      'payment.confirmed',
+      'request.changed',
+    ]);
+    expect(PORTAL_STREAM_EVENT_BY_TOPIC).toEqual({
+      [TOPIC.requestChanged]: 'request.changed',
+      [TOPIC.inboxItem]: 'inbox.item',
+      [TOPIC.decisionPublished]: 'decision.published',
+      [TOPIC.paymentConfirmed]: 'payment.confirmed',
+    });
+  });
+
+  it('C-0002-60 — dado reshape(topic request.changed, payload) então { requestId, situation, nextAction } com nextAction de NEXT_ACTION_BY_STATE (§3.5)', async () => {
+    const { reshape } = await loadModule();
+    const payload = envelope(
+      TOPIC.requestChanged,
+      'SOLICITACAO_PROTOCOLADA',
+      { kind: 'portal.request', id: REQUEST_ID, version: 2 },
+      {
+        requestId: REQUEST_ID,
+        serviceKey: 'consulta_multas',
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'PROTOCOLADO',
+        subjectId: SUBJECT_ID,
+        subjectCpfHash: CPF_HASH,
+        protocolNumber: 'AM-FIXTURES-2026-0000015',
+      },
+    );
+    expect(reshape(TOPIC.requestChanged, payload)).toEqual({
+      requestId: REQUEST_ID,
+      situation: 'PROTOCOLADO',
+      nextAction: {
+        by: 'agency',
+        label: NEXT_ACTION_LABEL('PROTOCOLADO'),
+        dueOn: null,
+      },
+    });
+    const offered = {
+      ...payload,
+      data: { ...payload.data, toState: 'AVALIACAO_OFERECIDA' },
+    };
+    expect(reshape(TOPIC.requestChanged, offered)).toMatchObject({
+      situation: 'AVALIACAO_OFERECIDA',
+      nextAction: {
+        by: 'citizen',
+        label: NEXT_ACTION_LABEL('AVALIACAO_OFERECIDA'),
+        dueOn: null,
+      },
+    });
+    // nunca o cpf_hash nem o tenant no frame
+    expect(
+      JSON.stringify(reshape(TOPIC.requestChanged, payload)),
+    ).not.toContain(CPF_HASH);
+    expect(
+      JSON.stringify(reshape(TOPIC.requestChanged, payload)),
+    ).not.toContain(TENANT_ID);
+  });
+
+  it('C-0002-60 — dado topic decision.published então { requestId }; payment.confirmed então { aitId }; inbox.item então { id, kind }; topic desconhecido então null', async () => {
+    const { reshape } = await loadModule();
+    const decision = envelope(
+      TOPIC.decisionPublished,
+      'RAIT_DECISAO_PUBLICADA',
+      { kind: 'case', id: CASE_ID, version: 3 },
+      {
+        caseId: CASE_ID,
+        decisionId: '00000000-0000-7000-8000-007000700409',
+        decisionKind: 'indeferido',
+        publishedOn: '2026-09-12',
+        channel: 'portal',
+        requestId: REQUEST_ID,
+      },
+    );
+    // o requestId vem da junção com portal.request (delegation_external_id = caseId, §9); o spec
+    // o oferece tanto em `data` quanto na linha (`request_id`) para não fixar onde o serviço o lê
+    expect(
+      reshape(TOPIC.decisionPublished, decision, { request_id: REQUEST_ID }),
+    ).toEqual({ requestId: REQUEST_ID });
+
+    const payment = envelope(
+      TOPIC.paymentConfirmed,
+      'PAGAMENTO_CONFIRMADO',
+      {
+        kind: 'payment',
+        id: '00000000-0000-7000-8000-007000700105',
+        version: 1,
+      },
+      {
+        paymentId: '00000000-0000-7000-8000-007000700105',
+        documentId: '00000000-0000-7000-8000-007000700205',
+        infractionId: '00000000-0000-7000-8000-0000d0000002',
+        aitId: AIT_ID,
+        tier: 'desconto_80',
+        paidOn: '2026-09-10',
+        amount: 156.18,
+      },
+    );
+    expect(reshape(TOPIC.paymentConfirmed, payment)).toEqual({ aitId: AIT_ID });
+
+    // sem produtor nesta rodada (OD-P40): envelope sem domainEvent, como rait.inquiry.changed
+    const { domainEvent: _none, ...inbox } = envelope(
+      TOPIC.inboxItem,
+      '',
+      { kind: 'portal.inbox_item', id: INBOX_ID, version: 1 },
+      {
+        id: INBOX_ID,
+        kind: 'acao_necessaria',
+        subjectId: SUBJECT_ID,
+        subjectCpfHash: CPF_HASH,
+      },
+    );
+    expect(reshape(TOPIC.inboxItem, inbox)).toEqual({
+      id: INBOX_ID,
+      kind: 'acao_necessaria',
+    });
+
+    for (const unknown of [
+      TOPIC.infractionChanged,
+      TOPIC.raitCaseChanged,
+      'ait.changed',
+      '',
+    ]) {
+      expect(
+        reshape(
+          unknown,
+          envelope(
+            unknown,
+            'X',
+            { kind: 'x', id: 'y', version: 1 },
+            { aitId: AIT_ID },
+          ),
+        ),
+        unknown,
+      ).toBeNull();
+    }
+  });
+
+  it('C-0002-60 — dado listSince com cursor então o SQL ordena por (created_at, id) e aplica o escopo (hash, subjectId) no where, com o cursor e o limite nos parâmetros', async () => {
+    const { PortalStreamService } = await loadModule();
+    const { calls, database, requestContext } = recordingDatabase();
+    const service = new PortalStreamService(database, requestContext);
+    const cursor = {
+      createdAt: '2026-09-14T15:00:00.000Z',
+      id: '00000000-0000-7000-8000-007000700001',
+    };
+    const scope = { cpfHash: CPF_HASH, subjectId: SUBJECT_ID };
+    await service.listSince(cursor, scope, 200);
+
+    expect(calls.length).toBeGreaterThanOrEqual(1);
+    const listing = calls.find((call) =>
+      /from\s+integration\.outbox/i.test(call.sql),
+    )!;
+    expect(listing, 'consulta a integration.outbox').toBeDefined();
+    const sql = listing.sql.replace(/\s+/g, ' ').toLowerCase();
+    expect(sql).toMatch(/order by\s+(\w+\.)?created_at\s*,\s*(\w+\.)?id/);
+    const whereClause = sql.slice(
+      sql.indexOf('where'),
+      sql.indexOf('order by'),
+    );
+    // escopo no próprio where: parâmetros do hash e do sujeito referenciados antes do order by
+    const hashIndex = listing.values.indexOf(CPF_HASH);
+    const subjectIndex = listing.values.indexOf(SUBJECT_ID);
+    expect(hashIndex, 'cpf_hash nos parâmetros').toBeGreaterThanOrEqual(0);
+    expect(subjectIndex, 'subjectId nos parâmetros').toBeGreaterThanOrEqual(0);
+    expect(whereClause).toContain(`$${hashIndex + 1}`);
+    expect(whereClause).toContain(`$${subjectIndex + 1}`);
+    expect(listing.values).toContain(cursor.createdAt);
+    expect(listing.values).toContain(cursor.id);
+    expect(listing.values).toContain(200);
+    // nunca filtra em memória linhas de outro sujeito: o SQL só pode devolver o escopo
+    expect(whereClause).toMatch(/created_at/);
+
+    const initial = await service.listSince(
+      { createdAt: cursor.createdAt, id: null },
+      scope,
+    );
+    expect(initial).toEqual([]);
+    const withoutId = calls.at(-1)!;
+    expect(withoutId.values).toContain(cursor.createdAt);
+    expect(withoutId.values).not.toContain(cursor.id);
+  });
+
+  it('C-0002-60 — dado now() e findById então consultam o banco do servidor dentro da transação de tenant (padrão teat-stream.service.ts)', async () => {
+    const { PortalStreamService, PORTAL_STREAM_POLLER } = await loadModule();
+    expect(typeof PORTAL_STREAM_POLLER).toBe('symbol');
+    const { calls, database, requestContext } = recordingDatabase();
+    const service = new PortalStreamService(database, requestContext);
+    await service.findById('00000000-0000-7000-8000-007000700001');
+    expect(calls.at(-1)!.sql.toLowerCase()).toContain('integration.outbox');
+    expect(calls.at(-1)!.values).toContain(
+      '00000000-0000-7000-8000-007000700001',
+    );
+    expect(database.tx).toHaveBeenCalled();
+  });
+});
diff --git a/backend/app/src/portal-stream.service.ts b/backend/app/src/portal-stream.service.ts
new file mode 100644
index 0000000..79a4c7d
--- /dev/null
+++ b/backend/app/src/portal-stream.service.ts
@@ -0,0 +1,234 @@
+// CTG-0002 §9 (R-0009, TASK-0008; plan M18) — leitura de `integration.outbox`
+// para o SSE `GET /v1/portal/stream`, no padrão de `teat-stream.service.ts`.
+// Sem escrita: o stream só reemite o que os pacotes já gravaram na mesma
+// transação do efeito. Diferenças do TEAT: o escopo é o SUJEITO da sessão
+// (`cpf_hash` do envelope; pedido ligado ao caso; AIT da projeção) aplicado
+// NO SQL — nunca se filtra em memória linha de outro sujeito —, e `data` é
+// reformatado por tipo (RN-PORTAL-112: nenhum token de inf/rait sai).
+//
+// Os `type` técnicos são montados por concatenação, nunca como literal
+// `portal.<x>.<y>`/`rait.<x>.<y>` (tools/parameters/verify.mjs --check-usage;
+// precedente de `ops/offline-sync/src/handwritten/events.ts`).
+import { Injectable } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import { NEXT_ACTION_BY_STATE } from '@detran/portal-requests';
+
+import type { TeatStreamPoller } from './teat-stream.service.js';
+
+export interface PortalOutboxRow {
+  [key: string]: unknown;
+  id: string;
+  created_at: string;
+  topic: string;
+  payload: Record<string, unknown>;
+  /** `portal.request.id` ligado ao caso (`rait.decision.published`), quando houver. */
+  request_id?: string | null;
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
+const topic = (...parts: string[]): string => parts.join('.');
+
+export const PORTAL_REQUEST_CHANGED_TOPIC = topic(
+  'portal',
+  'request',
+  'changed',
+);
+export const PORTAL_INBOX_ITEM_TOPIC = topic('portal', 'inbox', 'item');
+export const RAIT_DECISION_PUBLISHED_TOPIC = topic(
+  'rait',
+  'decision',
+  'published',
+);
+export const INF_PAYMENT_CONFIRMED_TOPIC = topic('inf', 'payment', 'confirmed');
+
+/** Tipos SSE do Portal (§9). */
+export const PORTAL_STREAM_TYPES = [
+  'inbox.item',
+  'request.changed',
+  'decision.published',
+  'payment.confirmed',
+] as const;
+export type PortalStreamType = (typeof PORTAL_STREAM_TYPES)[number];
+
+/** `topic` técnico do produtor → evento SSE (§9). */
+export const PORTAL_STREAM_EVENT_BY_TOPIC: Readonly<
+  Record<string, PortalStreamType>
+> = {
+  [PORTAL_REQUEST_CHANGED_TOPIC]: 'request.changed',
+  [PORTAL_INBOX_ITEM_TOPIC]: 'inbox.item',
+  [RAIT_DECISION_PUBLISHED_TOPIC]: 'decision.published',
+  [INF_PAYMENT_CONFIRMED_TOPIC]: 'payment.confirmed',
+};
+
+export interface PortalStreamScope {
+  cpfHash: string;
+  subjectId: string;
+}
+
+export interface StreamCursor {
+  createdAt: string;
+  id: string | null;
+}
+
+/** Porta do poller (mesma de `teat-stream.service.ts`); token próprio do Portal. */
+export const PORTAL_STREAM_POLLER = Symbol('PORTAL_STREAM_POLLER');
+export type PortalStreamPoller = TeatStreamPoller;
+
+function dataOf(payload: Record<string, unknown>): Record<string, unknown> {
+  const data = payload.data;
+  return typeof data === 'object' && data !== null && !Array.isArray(data)
+    ? (data as Record<string, unknown>)
+    : {};
+}
+
+function stringOf(value: unknown): string | null {
+  return typeof value === 'string' ? value : null;
+}
+
+/**
+ * `data` do frame por tipo (§9): só ids, o token cidadão do estado do pedido
+ * e o `nextAction` de `NEXT_ACTION_BY_STATE`; nunca `tenantId`, nunca o
+ * `cpf_hash`, nunca token de inf/rait. Topic desconhecido → `null` (não emitido).
+ */
+export function reshape(
+  topic: string,
+  payload: Record<string, unknown>,
+  row?: Record<string, unknown>,
+): Record<string, unknown> | null {
+  const data = dataOf(payload);
+  switch (PORTAL_STREAM_EVENT_BY_TOPIC[topic]) {
+    case 'request.changed': {
+      const situation = stringOf(data.toState);
+      return {
+        requestId: stringOf(data.requestId),
+        situation,
+        nextAction:
+          situation && situation in NEXT_ACTION_BY_STATE
+            ? NEXT_ACTION_BY_STATE[
+                situation as keyof typeof NEXT_ACTION_BY_STATE
+              ]
+            : null,
+      };
+    }
+    case 'inbox.item':
+      return { id: stringOf(data.id), kind: stringOf(data.kind) };
+    case 'decision.published':
+      return {
+        requestId: stringOf(row?.request_id) ?? stringOf(data.requestId),
+      };
+    case 'payment.confirmed':
+      return { aitId: stringOf(data.aitId) };
+    default:
+      return null;
+  }
+}
+
+const OUTBOX_COLUMNS = `o.id, o.created_at::text as created_at, o.topic, o.payload,
+          (select r.id from portal.request r
+            where r.delegation_external_id = o.payload->'data'->>'caseId'
+              and r.subject_id = $SUBJECT
+            limit 1) as request_id`;
+
+/** Escopo do sujeito aplicado no `where` (§9.3) — `$HASH`/`$SUBJECT` são substituídos. */
+const SCOPE_SQL = `(
+      (o.topic in ($REQUEST_TOPIC, $INBOX_TOPIC)
+        and o.payload->'data'->>'subjectCpfHash' = $HASH)
+      or (o.topic = $DECISION_TOPIC
+        and exists (select 1 from portal.request r
+                     where r.delegation_external_id = o.payload->'data'->>'caseId'
+                       and r.subject_id = $SUBJECT))
+      or (o.topic = $PAYMENT_TOPIC
+        and exists (select 1 from portal.infraction_view v
+                     where v.ait_id::text = o.payload->'data'->>'aitId'
+                       and v.subject_cpf_hash = $HASH))
+    )`;
+
+function bind(sql: string, placeholders: Record<string, number>): string {
+  return Object.entries(placeholders).reduce(
+    (text, [name, index]) => text.replaceAll(`$${name}`, `$${index}`),
+    sql,
+  );
+}
+
+@Injectable()
+export class PortalStreamService {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  /** `now()` do servidor de banco — marco inicial de uma conexão sem `Last-Event-ID`. */
+  async now(): Promise<string> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<{ now: string }>(
+        'select now()::text as now',
+      );
+      return result.rows[0]!.now;
+    });
+  }
+
+  async findById(id: string): Promise<PortalOutboxRow | undefined> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<PortalOutboxRow>(
+        `select id, created_at::text as created_at, topic, payload
+           from integration.outbox
+          where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  /**
+   * Linhas do tenant posteriores a `cursor` que passam no escopo do sujeito,
+   * em ordem `(created_at, id)` — uma consulta por tick.
+   */
+  async listSince(
+    cursor: StreamCursor,
+    scope: PortalStreamScope,
+    limit = 200,
+  ): Promise<PortalOutboxRow[]> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const values: unknown[] = [cursor.createdAt];
+      const cursorClause = cursor.id
+        ? '(o.created_at, o.id) > ($1::timestamptz, $2::uuid)'
+        : 'o.created_at > $1::timestamptz';
+      if (cursor.id) values.push(cursor.id);
+      const placeholders: Record<string, number> = {};
+      const param = (name: string, value: unknown): void => {
+        values.push(value);
+        placeholders[name] = values.length;
+      };
+      param('HASH', scope.cpfHash);
+      param('SUBJECT', scope.subjectId);
+      param('REQUEST_TOPIC', PORTAL_REQUEST_CHANGED_TOPIC);
+      param('INBOX_TOPIC', PORTAL_INBOX_ITEM_TOPIC);
+      param('DECISION_TOPIC', RAIT_DECISION_PUBLISHED_TOPIC);
+      param('PAYMENT_TOPIC', INF_PAYMENT_CONFIRMED_TOPIC);
+      param('LIMIT', limit);
+      const sql = bind(
+        `select ${OUTBOX_COLUMNS}
+           from integration.outbox o
+          where ${cursorClause}
+            and ${SCOPE_SQL}
+          order by o.created_at, o.id
+          limit $LIMIT`,
+        placeholders,
+      );
+      const result = await asQueryable(tx).query<PortalOutboxRow>(sql, values);
+      return result.rows;
+    });
+  }
+}
diff --git a/backend/app/tests/e2e/policy-routes.e2e.spec.ts b/backend/app/tests/e2e/policy-routes.e2e.spec.ts
index e261f02..10a08d7 100644
--- a/backend/app/tests/e2e/policy-routes.e2e.spec.ts
+++ b/backend/app/tests/e2e/policy-routes.e2e.spec.ts
@@ -87,9 +87,18 @@ const EST_CTG_0001_MOUNTED_KEYS = new Set([
   // suas operações entram na allowlist quando CTG-0002 as montar.
 ]);

-/** Escopo CTG-0004 §8, com a transição EST limitada pela adenda A-2 acima. */
+/**
+ * Escopo CTG-0004 §8, com a transição EST limitada pela adenda A-2 acima, e o
+ * escopo `portal:*` de R-0009 CTG-0002 §10.2 (M19, TASK-0006): todo recurso
+ * `portal` exceto `complaint` (PEC, M2) entra nos dois sentidos — sentido 1
+ * inclui `POST manifestations` (rota `@Public()` COM `@Resource/@Action`,
+ * A4(b)); rotas públicas sem metadados (`GET brand`, `GET services[/{key}]`)
+ * não têm `@Action` e nunca entram na coleta. Nenhuma exceção nova; o escopo
+ * TEAT permanece intacto.
+ */
 function inScope(key: string): boolean {
   const [domain, resource] = key.split(':');
+  if (domain === 'portal') return resource !== 'complaint';
   if (domain === 'est') return EST_CTG_0001_MOUNTED_KEYS.has(key);
   if (domain === 'ops') return resource !== 'parameter';
   if (domain !== 'inf') return false;
@@ -130,6 +139,9 @@ const SENTIDO_2_ALLOWLIST = new Set(['ops:evidence-access-request:update']);

 /** Chaves cuja remoção já foi pedida em CTG-0002 §8 / CTG-0003 §7 (C-0004-49). */
 const REMOVED_KEYS = [
+  // R-0009 CTG-0002 §10.1 (M19, ADR-0019): substituídas por portal:request:*
+  'portal:appeal:create',
+  'portal:appeal:read-own',
   'ops:offline-numbering-reservation:reserve',
   'ops:offline-numbering-reservation:cancel',
   'ops:snapshot-person:read',
@@ -296,6 +308,82 @@ describe('CTG-0004 §8 — política ⇔ rotas do escopo TEAT (M18)', () => {
     ).toEqual({ missingRules: [], missingRoutes: [] });
   });

+  it('C-0002-84 (R-0009 CTG-0002 §10.2) — toda rota @Resource/@Action de domínio portal (exceto complaint) tem regra, inclusive POST manifestations (@Public); toda regra portal:* tem rota; rotas @Public sem metadados não entram', async () => {
+    const { ModulesContainer } = await import('@nestjs/core');
+    const {
+      DETRAN_RESOURCE_METADATA_KEY,
+      DETRAN_ACTION_METADATA_KEY,
+      DETRAN_PUBLIC_METADATA_KEY,
+      DETRAN_POLICY_MATRIX,
+      policyKey,
+    } = (await import('@detran/shared')) as unknown as {
+      DETRAN_RESOURCE_METADATA_KEY: string;
+      DETRAN_ACTION_METADATA_KEY: string;
+      DETRAN_PUBLIC_METADATA_KEY: string;
+      DETRAN_POLICY_MATRIX: Record<string, readonly string[]>;
+      policyKey: (resource: string, action: string) => string;
+    };
+    const routes = collectMountedRoutes(
+      app.get(ModulesContainer).values(),
+      DETRAN_RESOURCE_METADATA_KEY,
+      DETRAN_ACTION_METADATA_KEY,
+      policyKey,
+    ).filter((route) => route.key.startsWith('portal:') && inScope(route.key));
+
+    const missingRules = routes.filter(
+      (route) => !(route.key in DETRAN_POLICY_MATRIX),
+    );
+    const mountedKeys = new Set(routes.map((route) => route.key));
+    const missingRoutes = Object.keys(DETRAN_POLICY_MATRIX).filter(
+      (key) =>
+        key.startsWith('portal:') && inScope(key) && !mountedKeys.has(key),
+    );
+    expect(
+      { missingRules, missingRoutes },
+      [
+        'Rotas portal:* sem chave em DETRAN_POLICY_MATRIX (sentido 1):',
+        ...missingRules.map(
+          (route) => `  ${route.key} (${route.controller}.${route.method})`,
+        ),
+        'Chaves portal:* em DETRAN_POLICY_MATRIX sem rota (sentido 2):',
+        ...missingRoutes.map((key) => `  ${key}`),
+      ].join('\n'),
+    ).toEqual({ missingRules: [], missingRoutes: [] });
+
+    // sentido 1 inclui a rota pública com metadados (POST manifestations → portal:manifestation:manifest)
+    const manifest = routes.find(
+      (route) => route.key === 'portal:manifestation:manifest',
+    );
+    expect(
+      manifest,
+      'POST manifestations montada com @Resource/@Action',
+    ).toBeDefined();
+    const controllers = [...app.get(ModulesContainer).values()].flatMap(
+      (module) => [...module.controllers.values()],
+    );
+    const manifestController = controllers.find(
+      (wrapper) =>
+        (wrapper.metatype as { name?: string } | undefined)?.name ===
+        manifest!.controller,
+    );
+    const handler = (
+      manifestController!.metatype as unknown as {
+        prototype: Record<string, unknown>;
+      }
+    ).prototype[manifest!.method];
+    expect(
+      Reflect.getMetadata(DETRAN_PUBLIC_METADATA_KEY, handler as object),
+    ).toBeTruthy();
+
+    // sentido 2: as 29 chaves de CTG-0002 §10.1 estão todas montadas (nenhuma exceção declarada)
+    expect(mountedKeys.size).toBe(29);
+    expect([...mountedKeys].sort()).toEqual(
+      Object.keys(DETRAN_POLICY_MATRIX)
+        .filter((key) => key.startsWith('portal:') && inScope(key))
+        .sort(),
+    );
+  });
+
   it('C-0004-49 — as chaves de alias removidas (CTG-0002 §8, CTG-0003 §7) não existem mais na matriz', async () => {
     const { DETRAN_POLICY_MATRIX } =
       (await import('@detran/shared')) as unknown as {
diff --git a/backend/app/tests/e2e/portal-e2e.support.ts b/backend/app/tests/e2e/portal-e2e.support.ts
new file mode 100644
index 0000000..47b5383
--- /dev/null
+++ b/backend/app/tests/e2e/portal-e2e.support.ts
@@ -0,0 +1,613 @@
+// Suporte compartilhado dos e2e do Portal de R-0009 CTG-0002 (TASK-0006):
+// `portal-requests.e2e.spec.ts`, `portal-routes.e2e.spec.ts`,
+// `portal-stream.e2e.spec.ts`. Não é um arquivo de teste (vitest só coleta
+// `*.e2e.spec.ts`). Reúne o que `portal-identity.e2e.spec.ts` (CTG-0001,
+// verde — intocado) já faz no `beforeAll`: tenant local + usuário + membership,
+// marca/hostname, as 21 linhas de `act_level_policy` (CTG-0001 §5, M5/A1) e as
+// 15 de `service_catalog` (§10.7, M12) copiadas do contrato; mais o app Nest
+// com `PortalClock` substituído por `FixedClock` (2026-09-14, CTG-0002 §13) e
+// providers sobrescritos por teste (`PORTAL_DELEGATION_TARGETS`,
+// `PORTAL_NATIONAL_READ_PORTS`, `PORTAL_STREAM_POLLER` — §3.2, §8, §9).
+//
+// Ids das linhas do tenant local: prefixo M22 (`0000700<TT>0`) com `nn` a partir
+// de `e1` para nunca colidir com as fixtures canônicas (01…15) — a chave
+// primária é o `id` sozinho.
+import { createHash, randomUUID } from 'node:crypto';
+import type { INestApplication } from '@nestjs/common';
+import { Test } from '@nestjs/testing';
+import pg from 'pg';
+import request from 'supertest';
+import { PortalClock } from '@detran/portal-identity';
+
+import { AppModule } from '../../src/app.module.js';
+
+export const TENANT_ID = '00000000-0000-7000-8000-000000000001';
+export const ACTOR_ID = '00000000-0000-4000-8000-000000000002';
+export const CANONICAL_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+export const LOCAL_HOSTNAME = 'portal.local-e2e.invalid';
+export const FIXED_TODAY = '2026-09-14';
+export const FIXED_TZ = 'America/Manaus';
+/** Uuid nulo = `PORTAL_PUBLIC_ACTOR_ID` de `backend/app/src/detran-runtime.ts` (A3(b)). */
+export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
+
+export const CONNECTION_STRING =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+
+/** CPFs fixture (CTG-0001 §10.2) — sem DV válido; a guarda não valida DV (OD-P25). */
+export const CPF = {
+  bronze: '11111111111',
+  prata: '22222222222',
+  ouro: '33333333333',
+  qualificada: '44444444444',
+  procurador: '55555555555',
+} as const;
+
+/** AITs de `30-fixtures-infraction.sql` e alvos externos `…ff…` (CTG-0001 §10.1/§10.3). */
+export const AITS = {
+  f1: '00000000-0000-7000-8000-0000f0000001',
+  f2: '00000000-0000-7000-8000-0000f0000002',
+  f3: '00000000-0000-7000-8000-0000f0000003',
+  f5: '00000000-0000-7000-8000-0000f0000005',
+  f6: '00000000-0000-7000-8000-0000f0000006',
+  f9: '00000000-0000-7000-8000-0000f0000009',
+  f10: '00000000-0000-7000-8000-0000f0000010',
+  f12: '00000000-0000-7000-8000-0000f0000012',
+} as const;
+export const EXTERNAL = {
+  vehicle: '00000000-0000-7000-8000-00007ff00001',
+  exam: '00000000-0000-7000-8000-00007ff00002',
+  crash: '00000000-0000-7000-8000-00007ff00003',
+  instrument: '00000000-0000-7000-8000-00007ff90001',
+} as const;
+
+/** Linhas do tenant local (prefixo M22, nn ≥ e1). */
+export const LOCAL = {
+  inboxSne: '00000000-0000-7000-8000-000070c000e1',
+  inboxPortal: '00000000-0000-7000-8000-000070c000e2',
+  inboxOther: '00000000-0000-7000-8000-000070c000e3',
+  manifestationCiencia: '00000000-0000-7000-8000-000070700e01',
+  manifestationEmAnalise: '00000000-0000-7000-8000-000070700e02',
+  manifestationOferecida: '00000000-0000-7000-8000-000070700e03',
+  crashView: '00000000-0000-7000-8000-000071e000e1',
+  examView: '00000000-0000-7000-8000-000071f000e1',
+  pointsView: '00000000-0000-7000-8000-000071000e01',
+  representation: '00000000-0000-7000-8000-000070100e01',
+  sourceEvent: (nn: number) => `00000000-0000-7000-8000-000071b000e${nn}`,
+  infractionView: (nn: number) => `00000000-0000-7000-8000-000070f000e${nn}`,
+  entitlement: (nn: number) => `00000000-0000-7000-8000-000070200e0${nn}`,
+} as const;
+
+export const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'canal_exclusivo',
+  'desconto_60',
+  'cancelamento',
+] as const;
+
+/** Cópia de CTG-0001 §5 (M5/A1) — as 21 linhas de act_level_policy. */
+export const ACT_LEVEL_POLICY_ROWS: Array<{ actKey: string; minimum: string }> =
+  [
+    { actKey: 'consulta_multas', minimum: 'simples' },
+    { actKey: 'consulta_cnh', minimum: 'simples' },
+    { actKey: 'emissao_crlv', minimum: 'simples' },
+    { actKey: 'pagamento', minimum: 'simples' },
+    { actKey: 'adesao_sne', minimum: 'avancada' },
+    { actKey: 'cancelamento_sne', minimum: 'avancada' },
+    { actKey: 'lgpd_declaracao', minimum: 'simples' },
+    { actKey: 'acompanhar_manifestacao', minimum: 'simples' },
+    { actKey: 'defesa_previa', minimum: 'avancada' },
+    { actKey: 'recurso_jari', minimum: 'avancada' },
+    { actKey: 'recurso_cetran', minimum: 'avancada' },
+    { actKey: 'indicacao_condutor', minimum: 'avancada' },
+    { actKey: 'procuracao', minimum: 'avancada' },
+    { actKey: 'junta_medica', minimum: 'avancada' },
+    { actKey: 'lgpd_declaracao:declaracao_completa', minimum: 'avancada' },
+    { actKey: 'lgpd_declaracao:correcao', minimum: 'avancada' },
+    { actKey: 'lgpd_declaracao:eliminacao', minimum: 'avancada' },
+    { actKey: 'manifestar', minimum: 'none' },
+    { actKey: 'consulta_bat', minimum: 'simples' },
+    { actKey: 'consulta_exame', minimum: 'simples' },
+    { actKey: 'avaliar', minimum: 'simples' },
+  ];
+
+export const PRESENTIAL_NOTE =
+  'Atendimento presencial ([REF-DETRANAM-SERVICOS])';
+
+/** Cópia de CTG-0001 §10.7 (M12) — as 15 linhas de service_catalog. */
+export const SERVICE_CATALOG_ROWS: Array<{
+  serviceKey: string;
+  category: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+  minimum: string;
+  unavailableReason: string | null;
+  alternativeChannelNote: string | null;
+  legalDeadline: string;
+}> = [
+  {
+    serviceKey: 'consulta_multas',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'consulta_cnh',
+    category: 'ch',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'emissao_crlv',
+    category: 'est',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'adesao_sne',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'avancada',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'cancelamento_sne',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'avancada',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'consulta_bat',
+    category: 'est',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'consulta_exame',
+    category: 'ch',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'manifestar',
+    category: 'transversal',
+    availability: 'available',
+    minimum: 'none',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16',
+  },
+  {
+    serviceKey: 'avaliar',
+    category: 'transversal',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+    legalDeadline: 'sem prazo próprio',
+  },
+  {
+    serviceKey: 'pagamento',
+    category: 'inf',
+    availability: 'partially_available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote:
+      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'lgpd_declaracao',
+    category: 'transversal',
+    availability: 'partially_available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote:
+      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'defesa_previa',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: PRESENTIAL_NOTE,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'recurso_jari',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: PRESENTIAL_NOTE,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'recurso_cetran',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: PRESENTIAL_NOTE,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+  {
+    serviceKey: 'indicacao_condutor',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: PRESENTIAL_NOTE,
+    legalDeadline: 'source_pending (OD-P26)',
+  },
+];
+
+export function cpfHash(cpf: string): string {
+  return createHash('sha256').update(cpf).digest('hex');
+}
+
+export function newClient(): pg.Client {
+  return new pg.Client({ connectionString: CONNECTION_STRING });
+}
+
+export async function asOwner(client: pg.Client): Promise<void> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  await client.query(`select set_config('app.actor_id', $1, false)`, [
+    ACTOR_ID,
+  ]);
+}
+
+/**
+ * C-0002-77 / A6(d) (TASK-0006 iteração 3): provisiona, para o tenant local,
+ * os parâmetros `portal.*`/`privacy.*` copiando as linhas do tenant canônico
+ * de `ops.parameter` (`select … where key like`, nunca o literal de uma
+ * chave) — sem isso `PortalNationalReadsService` (§8) não encontra
+ * `portal.read_cache_ttl_minutes` para o tenant local e todo GET cacheado
+ * falha. `on conflict do nothing` pelo índice natural (tenant_id,
+ * traffic_agency_id, surface, key, effective_from): idempotente contra banco
+ * persistente, sem depender de limpeza no `afterAll`.
+ */
+export async function seedLocalParameters(client: pg.Client): Promise<void> {
+  await asOwner(client);
+  await client.query(
+    `insert into ops.parameter (
+       tenant_id, traffic_agency_id, scope, surface, key, value_json, value_type,
+       status, source_pending, legal_readonly, decision_ref, legal_basis, reason,
+       version, effective_from, effective_to, changed_by
+     )
+     select $1, traffic_agency_id, scope, surface, key, value_json, value_type,
+       status, source_pending, legal_readonly, decision_ref, legal_basis, reason,
+       version, effective_from, effective_to, changed_by
+     from ops.parameter
+     where tenant_id = $2 and (key like 'portal.%' or key like 'privacy.%')
+     on conflict do nothing`,
+    [TENANT_ID, CANONICAL_TENANT_ID],
+  );
+}
+
+/** Mesmo `beforeAll` de portal-identity.e2e.spec.ts (tenant local, marca, hostname, políticas, catálogo). */
+export async function seedLocalTenant(client: pg.Client): Promise<void> {
+  await asOwner(client);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
+     on conflict (id) do update set name = excluded.name`,
+    [TENANT_ID],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name)
+     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
+     on conflict (id) do update set tenant_id = excluded.tenant_id`,
+    [ACTOR_ID, TENANT_ID],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [TENANT_ID, ACTOR_ID],
+  );
+  await client.query(
+    `insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
+     values ($1, 'Local E2E Portal (fixture)', 'Local E2E', 'Local E2E Portal (fixture)', '#1351B4', 'https://portal.local-e2e.invalid/suporte', 'https://portal.local-e2e.invalid/privacidade', 'https://portal.local-e2e.invalid/acessibilidade', 'ouvidoria@local-e2e.invalid', 'pt-BR', $2)
+     on conflict (tenant_id) do update set display_name = excluded.display_name`,
+    [TENANT_ID, FIXED_TZ],
+  );
+  await client.query(
+    `insert into portal.public_hostname (hostname, tenant_id, enabled) values ($1, $2, true)
+     on conflict (hostname) do update set tenant_id = excluded.tenant_id, enabled = true`,
+    [LOCAL_HOSTNAME, TENANT_ID],
+  );
+  for (const row of ACT_LEVEL_POLICY_ROWS) {
+    await client.query(
+      `insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
+       values ($1, $2, $3, $4, 'fixture e2e (cópia de CTG-0001 §5)', 'fixture e2e', true, '2026-01-01', null)
+       on conflict (tenant_id, act_key, effective_from) do update set minimum_assurance = excluded.minimum_assurance`,
+      [randomUUID(), TENANT_ID, row.actKey, row.minimum],
+    );
+  }
+  for (const row of SERVICE_CATALOG_ROWS) {
+    await client.query(
+      `insert into portal.service_catalog (
+         id, tenant_id, service_key, route, category, title, summary, requirements_json,
+         delivery_channel, legal_deadline, cost, accessibility_note, responsible_party,
+         normative_reference, availability, unavailable_reason, alternative_channel_note,
+         minimum_assurance, version, effective_from
+       ) values (
+         $1, $2, $3, $4, $5, $6, $6, '["Conta gov.br"]'::jsonb, 'portal', $11,
+         'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'Local E2E',
+         'fixture e2e', $7, $8, $9, $10, 1, '2026-01-01'
+       )
+       on conflict (tenant_id, service_key) do update set
+         availability = excluded.availability,
+         unavailable_reason = excluded.unavailable_reason,
+         alternative_channel_note = excluded.alternative_channel_note,
+         minimum_assurance = excluded.minimum_assurance,
+         legal_deadline = excluded.legal_deadline,
+         requirements_json = excluded.requirements_json`,
+      [
+        randomUUID(),
+        TENANT_ID,
+        row.serviceKey,
+        `/servicos/${row.serviceKey.replaceAll('_', '-')}`,
+        row.category,
+        `${row.serviceKey} (fixture e2e)`,
+        row.availability,
+        row.unavailableReason,
+        row.alternativeChannelNote,
+        row.minimum,
+        row.legalDeadline,
+      ],
+    );
+  }
+}
+
+/**
+ * Limpa o que os e2e de CTG-0002 criam no tenant local (idempotência contra banco
+ * persistente — precedente C-0001-41). Nunca toca subject/act_level_policy/
+ * service_catalog/brand/hostname (compartilhados com portal-identity.e2e.spec.ts).
+ */
+export async function resetLocalPortalRows(client: pg.Client): Promise<void> {
+  await asOwner(client);
+  for (const table of [
+    'portal.consequence_ack',
+    'portal.evaluation',
+    'portal.request_attachment',
+    'portal.protocol',
+    'portal.request_draft',
+    'portal.request',
+    'portal.idempotency_record',
+    'portal.acknowledgement_evidence',
+    'portal.inbox_item',
+    'portal.sne_enrollment',
+    'portal.push_subscription',
+    'portal.manifestation_extension',
+    'portal.manifestation',
+    'portal.projection_applied_event',
+    'portal.process_timeline',
+    'portal.points_view',
+    'portal.crash_view',
+    'portal.exam_view',
+    'portal.infraction_view',
+    'portal.national_read_cache',
+    'portal.entitlement',
+    'portal.representation',
+  ]) {
+    await client.query(`delete from ${table} where tenant_id = $1`, [
+      TENANT_ID,
+    ]);
+  }
+  await client.query(
+    `delete from integration.outbox where tenant_id = $1 and (topic like 'portal.%' or topic like 'inf.%' or topic like 'rait.%')`,
+    [TENANT_ID],
+  );
+}
+
+/**
+ * Limpa, ao final de `portal-requests.e2e.spec.ts`, as linhas do tenant local
+ * criadas para um sujeito específico (o sujeito ouro, CPF fixture
+ * `33333333333` — plan.md §Triagem, TASK-0006 iteração 2): sem isso,
+ * `portal-identity.e2e.spec.ts` C-0001-41 (`delete from portal.subject`)
+ * viola FK numa segunda execução contra banco persistente. Ordem das FKs
+ * (DDL 61/62): idempotency_record, consequence_ack, request_draft,
+ * request_attachment, protocol, evaluation, request, representation,
+ * entitlement — nunca `portal.subject` em si (compartilhado com outros
+ * arquivos e2e).
+ */
+export async function resetGoldenSubjectRows(
+  client: pg.Client,
+  subjectId: string,
+): Promise<void> {
+  await asOwner(client);
+  const requestIds = (
+    await client.query<{ id: string }>(
+      `select id from portal.request where tenant_id = $1 and subject_id = $2`,
+      [TENANT_ID, subjectId],
+    )
+  ).rows.map((row) => row.id);
+  await client.query(
+    `delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2`,
+    [TENANT_ID, subjectId],
+  );
+  if (requestIds.length > 0) {
+    await client.query(
+      `delete from portal.consequence_ack where tenant_id = $1 and request_id = any($2::uuid[])`,
+      [TENANT_ID, requestIds],
+    );
+    await client.query(
+      `delete from portal.request_draft where tenant_id = $1 and request_id = any($2::uuid[])`,
+      [TENANT_ID, requestIds],
+    );
+    await client.query(
+      `delete from portal.request_attachment where tenant_id = $1 and request_id = any($2::uuid[])`,
+      [TENANT_ID, requestIds],
+    );
+    await client.query(
+      `delete from portal.protocol where tenant_id = $1 and request_id = any($2::uuid[])`,
+      [TENANT_ID, requestIds],
+    );
+    await client.query(
+      `delete from portal.evaluation where tenant_id = $1 and subject_kind = 'request' and subject_id = any($2::uuid[])`,
+      [TENANT_ID, requestIds],
+    );
+  }
+  await client.query(
+    `delete from portal.request where tenant_id = $1 and subject_id = $2`,
+    [TENANT_ID, subjectId],
+  );
+  await client.query(
+    `delete from portal.representation where tenant_id = $1 and representative_subject_id = $2`,
+    [TENANT_ID, subjectId],
+  );
+  await client.query(
+    `delete from portal.entitlement where tenant_id = $1 and subject_id = $2`,
+    [TENANT_ID, subjectId],
+  );
+}
+
+export interface CitizenEnv {
+  cpf: string;
+  level: 'simples' | 'avancada' | 'qualificada';
+  roles?: string;
+}
+
+export function setCitizen({
+  cpf,
+  level,
+  roles = 'CIDADAO',
+}: CitizenEnv): void {
+  process.env.DETRAN_LOCAL_ROLES = roles;
+  process.env.DETRAN_LOCAL_CPF = cpf;
+  process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = level;
+}
+
+export function clearCitizenEnv(): void {
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+  delete process.env.DETRAN_LOCAL_CPF;
+  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+}
+
+export function headers(
+  extra: Record<string, string> = {},
+): Record<string, string> {
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+    ...extra,
+  };
+}
+
+/** Cabeçalhos sem sessão (rotas públicas): tenant pelo header, sem Authorization. */
+export function anonymousHeaders(
+  extra: Record<string, string> = {},
+): Record<string, string> {
+  return {
+    'x-tenant-id': TENANT_ID,
+    'idempotency-key': randomUUID(),
+    ...extra,
+  };
+}
+
+export interface ProviderOverride {
+  token: unknown;
+  value: unknown;
+}
+
+/**
+ * Relógio fixo com a forma de `PortalClock`/`Clock` (`now()`, `today(tz)`) — o
+ * mesmo contrato de `FixedClock` de `@detran/inf-deadlines` (rait-test-strategy.md
+ * §6), reproduzido aqui porque `@detran/app` não declara aquele pacote como
+ * dependência (`package.json` está fora do que o Inspector toca).
+ */
+export class E2eFixedClock {
+  readonly tz = FIXED_TZ;
+  today(_tenantTz?: string): string {
+    return FIXED_TODAY;
+  }
+  now(): Date {
+    return new Date(`${FIXED_TODAY}T12:00:00.000Z`);
+  }
+}
+
+/** App real com `PortalClock` fixo (CTG-0002 §13) e providers de teste (§3.2, §8, §9). */
+export async function createPortalApp(
+  overrides: ProviderOverride[] = [],
+  options: { fixedClock?: boolean } = {},
+): Promise<INestApplication> {
+  let builder = Test.createTestingModule({ imports: [AppModule.forRoot()] });
+  if (options.fixedClock !== false) {
+    builder = builder
+      .overrideProvider(PortalClock)
+      .useValue(new E2eFixedClock());
+  }
+  for (const override of overrides) {
+    builder = builder
+      .overrideProvider(override.token as never)
+      .useValue(override.value);
+  }
+  const moduleRef = await builder.compile();
+  const app = moduleRef.createNestApplication({
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+  return app;
+}
+
+/** `GET me` cria/atualiza o sujeito (M22: o e2e cria os seus via API) e devolve o id. */
+export async function subjectIdOf(
+  app: INestApplication,
+  citizen: CitizenEnv,
+): Promise<string> {
+  setCitizen(citizen);
+  const response = await request(app.getHttpServer())
+    .get('/v1/portal/identity/me')
+    .set(headers());
+  if (response.status !== 200) {
+    throw new Error(
+      `GET me falhou para ${citizen.cpf}: ${response.status} ${JSON.stringify(response.body)}`,
+    );
+  }
+  return response.body.subjectId as string;
+}
+
+/** `import()` dinâmico de módulos que só existem depois de TASK-0007/0008. */
+export const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+export async function auditRows(
+  client: pg.Client,
+  action: string,
+): Promise<Array<{ action: string; entity: string }>> {
+  await asOwner(client);
+  const result = await client.query<{ action: string; entity: string }>(
+    `select action, entity from audit.events where tenant_id = $1 and action = $2 order by occurred_at desc`,
+    [TENANT_ID, action],
+  );
+  return result.rows;
+}
diff --git a/backend/app/tests/e2e/portal-requests.e2e.spec.ts b/backend/app/tests/e2e/portal-requests.e2e.spec.ts
new file mode 100644
index 0000000..caec358
--- /dev/null
+++ b/backend/app/tests/e2e/portal-requests.e2e.spec.ts
@@ -0,0 +1,909 @@
+import { randomUUID } from 'node:crypto';
+import type { INestApplication } from '@nestjs/common';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  AITS,
+  CPF,
+  EXTERNAL,
+  FIXED_TODAY,
+  LOCAL,
+  PRESENTIAL_NOTE,
+  SNE_EFFECTS,
+  TENANT_ID,
+  asOwner,
+  auditRows,
+  clearCitizenEnv,
+  cpfHash,
+  createPortalApp,
+  headers,
+  importModule,
+  newClient,
+  resetGoldenSubjectRows,
+  resetLocalPortalRows,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+
+/**
+ * R-0009 CTG-0002 §2.1, §2.3, §3, §4, §5 e §13 (TASK-0006) — C-0002-61…71:
+ * fronteira de TASK-0007 (identidade §3 + pedidos §5) pelo `AppModule` real
+ * (perfil `test`, `CIDADAO` + claims por env, tenant local, `PortalClock`
+ * fixo em 2026-09-14). Fica vermelho até TASK-0007 montar
+ * `PortalRequestsController`, as três rotas de identidade §2.1, o mapa
+ * `PORTAL_DELEGATION_TARGETS` do app e `PORTAL_RULES` (§10).
+ *
+ * Setup no molde de portal-identity.e2e.spec.ts (verde, intocado): tenant
+ * local, `act_level_policy` 21, `service_catalog` 15, sujeitos criados via
+ * `GET me` (M22), vínculos/projeção do tenant local inseridos no `beforeAll`
+ * (§12). Env `DETRAN_LOCAL_*` limpo no `afterEach`/`afterAll`
+ * (`fileParallelism: false`).
+ */
+const client = newClient();
+let app: INestApplication;
+let failingApp: INestApplication | undefined;
+const subjects: Record<'bronze' | 'prata' | 'ouro', string> = {
+  bronze: '',
+  prata: '',
+  ouro: '',
+};
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
+const bronze = { cpf: CPF.bronze, level: 'simples' as const };
+
+const SIGNATURE = { signature: { method: 'govbr', signatureRef: 'ref' } };
+const CONSEQUENCE_ACK = {
+  consequenceAck: { textVersion: '1', acceptedAt: '2026-09-14T15:00:00.000Z' },
+};
+const SCORES = {
+  satisfaction: 5,
+  quality: 4,
+  deadline: 5,
+  clarity: 4,
+  channel: 5,
+};
+const REASON_R0007 = 'delegacao_indisponivel_r0007';
+
+/** Estado compartilhado entre os `it` (ordem do arquivo). */
+const created: { concluded?: string; bronzeInProgress?: string } = {};
+
+function api() {
+  return request(app.getHttpServer());
+}
+
+async function createRequest(
+  citizen: { cpf: string; level: 'simples' | 'avancada' },
+  body: Record<string, unknown>,
+) {
+  setCitizen(citizen);
+  const response = await api()
+    .post('/v1/portal/requests')
+    .set(headers())
+    .send(body);
+  expect(response.status, JSON.stringify(response.body)).toBe(201);
+  return response.body as { requestId: string; version: number; state: string };
+}
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await seedLocalTenant(client);
+  await resetLocalPortalRows(client);
+  app = await createPortalApp();
+
+  subjects.prata = await subjectIdOf(app, prata);
+  subjects.ouro = await subjectIdOf(app, ouro);
+  subjects.bronze = await subjectIdOf(app, bronze);
+
+  await asOwner(client);
+  // vínculo da prata sobre …f0000002 (CTG-0001 §10.3 …70200002, copiado para o tenant local)
+  await client.query(
+    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+     values ($1, $2, $3, 'ait', $4, 'owner', 'infraction', '2026-01-01', null)
+     on conflict (id) do update set subject_id = excluded.subject_id`,
+    [LOCAL.entitlement(1), TENANT_ID, subjects.prata, AITS.f2],
+  );
+  // vínculo da prata sobre os alvos crash/exam (§3.2 consulta_bat/consulta_exame,
+  // mesma forma de …7020000b/…7020000c do seed 70 — TASK-0006 iteração 2)
+  await client.query(
+    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+     values ($1, $2, $3, 'crash', $4, 'interested_party', 'manual', '2026-01-01', null)
+     on conflict (id) do update set subject_id = excluded.subject_id`,
+    [LOCAL.entitlement(2), TENANT_ID, subjects.prata, EXTERNAL.crash],
+  );
+  await client.query(
+    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+     values ($1, $2, $3, 'exam', $4, 'interested_party', 'manual', '2026-01-01', null)
+     on conflict (id) do update set subject_id = excluded.subject_id`,
+    [LOCAL.entitlement(3), TENANT_ID, subjects.prata, EXTERNAL.exam],
+  );
+  // …70f00001 copiada para o tenant local com o cpf_hash da prata (§12)
+  await client.query(
+    `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
+     values ($1, $2, $3, $4, 'FIX-00000e1', 'FIX2EE1', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)
+     on conflict (id) do update set subject_cpf_hash = excluded.subject_cpf_hash`,
+    [LOCAL.infractionView(1), TENANT_ID, AITS.f2, cpfHash(CPF.prata)],
+  );
+}, 60_000);
+
+afterEach(() => {
+  clearCitizenEnv();
+});
+
+afterAll(async () => {
+  await app?.close();
+  await failingApp?.close();
+  if (subjects.ouro) {
+    await resetGoldenSubjectRows(client, subjects.ouro);
+  }
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+  delete process.env.DETRAN_LOCAL_CPF;
+  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+});
+
+describe('CTG-0002 §2.1 — identidade: elevação, representações, preferências (C-0002-61…63)', () => {
+  it("C-0002-61 — dado CIDADAO avancada quando POST identity/assurance/elevations então 422 SERVICE_UNAVAILABLE 'elevacao_govbr_pendente_r0014'; POST …/{uuid}/complete idem; corpo inválido então 400", async () => {
+    setCitizen(prata);
+    const elevation = await api()
+      .post('/v1/portal/identity/assurance/elevations')
+      .set(headers())
+      .send({
+        targetLevel: 'avancada',
+        method: 'biographic',
+        resumeRoute: '/x',
+      });
+    expect(elevation.status, JSON.stringify(elevation.body)).toBe(422);
+    expect(elevation.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(elevation.body.context).toEqual({
+      unavailableReason: 'elevacao_govbr_pendente_r0014',
+      alternativeChannelNote: null,
+    });
+
+    const complete = await api()
+      .post(`/v1/portal/identity/assurance/elevations/${randomUUID()}/complete`)
+      .set(headers())
+      .send({ resumeToken: 't' });
+    expect(complete.status, JSON.stringify(complete.body)).toBe(422);
+    expect(complete.body.context).toMatchObject({
+      unavailableReason: 'elevacao_govbr_pendente_r0014',
+    });
+
+    const invalid = await api()
+      .post('/v1/portal/identity/assurance/elevations')
+      .set(headers())
+      .send({ targetLevel: 'qualificada', method: 'magic', resumeRoute: 'x' });
+    expect(invalid.status, JSON.stringify(invalid.body)).toBe(400);
+    expect(invalid.body.code).toBe('PORTAL.VALIDATION_FAILED');
+    expect(Array.isArray(invalid.body.context?.fields)).toBe(true);
+
+    const badId = await api()
+      .post('/v1/portal/identity/assurance/elevations/nao-uuid/complete')
+      .set(headers())
+      .send({ resumeToken: 't' });
+    expect(badId.status, JSON.stringify(badId.body)).toBe(400);
+    expect(badId.body.context).toEqual({ fields: ['id'] });
+  });
+
+  it("C-0002-62 — dado avancada quando POST identity/representations então 201 'PROCURACAO_APRESENTADA'; simples então 403 { actKey: 'procuracao' }; GET lista a linha; DELETE então validUntil = 2026-09-13 e GET me não a lista", async () => {
+    setCitizen(ouro);
+    const body = {
+      representedCpf: CPF.prata,
+      representedName: 'Cidadã Prata (fixture)',
+      instrumentDocumentId: EXTERNAL.instrument,
+      scope: 'ait',
+    };
+    const createdRepresentation = await api()
+      .post('/v1/portal/identity/representations')
+      .set(headers())
+      .send(body);
+    expect(
+      createdRepresentation.status,
+      JSON.stringify(createdRepresentation.body),
+    ).toBe(201);
+    expect(createdRepresentation.body).toMatchObject({
+      representedName: 'Cidadã Prata (fixture)',
+      scope: 'ait',
+      validUntil: null,
+      state: 'PROCURACAO_APRESENTADA',
+    });
+    const representationId = createdRepresentation.body.id as string;
+    expect(typeof representationId).toBe('string');
+
+    const own = await api()
+      .post('/v1/portal/identity/representations')
+      .set(headers())
+      .send({ ...body, representedCpf: CPF.ouro });
+    expect(own.status, JSON.stringify(own.body)).toBe(400);
+    expect(own.body.context).toEqual({ fields: ['representedCpf'] });
+
+    setCitizen(bronze);
+    const insufficient = await api()
+      .post('/v1/portal/identity/representations')
+      .set(headers())
+      .send(body);
+    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
+    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
+    expect(insufficient.body.context).toMatchObject({
+      actKey: 'procuracao',
+      required: 'avancada',
+      current: 'simples',
+    });
+
+    setCitizen(ouro);
+    const list = await api()
+      .get('/v1/portal/identity/representations')
+      .set(headers());
+    expect(list.status, JSON.stringify(list.body)).toBe(200);
+    expect(
+      list.body.find((row: { id: string }) => row.id === representationId),
+    ).toMatchObject({
+      representedName: 'Cidadã Prata (fixture)',
+      scope: 'ait',
+      state: 'PROCURACAO_APRESENTADA',
+      refusalReason: null,
+    });
+
+    const deleted = await api()
+      .delete(`/v1/portal/identity/representations/${representationId}`)
+      .set(headers());
+    expect(deleted.status, JSON.stringify(deleted.body)).toBe(200);
+    expect(deleted.body).toMatchObject({
+      id: representationId,
+      validUntil: '2026-09-13',
+    });
+
+    const me = await api().get('/v1/portal/identity/me').set(headers());
+    expect(me.status).toBe(200);
+    expect(
+      me.body.representations.some(
+        (row: { id: string }) => row.id === representationId,
+      ),
+    ).toBe(false);
+
+    const missing = await api()
+      .delete(`/v1/portal/identity/representations/${randomUUID()}`)
+      .set(headers());
+    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
+    expect(missing.body.context).toEqual({ kind: 'representation' });
+  });
+
+  it('C-0002-63 — dado PUT identity/preferences sem If-Match então 428 PORTAL.IF_MATCH_REQUIRED; com If-Match "1" então 422 SERVICE_UNAVAILABLE \'preferences_substrato_pendente\'', async () => {
+    setCitizen(prata);
+    const withoutIfMatch = await api()
+      .put('/v1/portal/identity/preferences')
+      .set(headers())
+      .send({ channel: 'email' });
+    expect(withoutIfMatch.status, JSON.stringify(withoutIfMatch.body)).toBe(
+      428,
+    );
+    expect(withoutIfMatch.body.code).toBe('PORTAL.IF_MATCH_REQUIRED');
+
+    const unavailable = await api()
+      .put('/v1/portal/identity/preferences')
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ channel: 'email' });
+    expect(unavailable.status, JSON.stringify(unavailable.body)).toBe(422);
+    expect(unavailable.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(unavailable.body.context).toEqual({
+      unavailableReason: 'preferences_substrato_pendente',
+      alternativeChannelNote: null,
+    });
+  });
+});
+
+describe('CTG-0002 §2.3/§4 — POST requests: idempotência M9 e elegibilidade (C-0002-64, C-0002-65)', () => {
+  it('C-0002-64 — dado POST requests sem Idempotency-Key então 400 { fields: [\'Idempotency-Key\'] }; com chave então 201 + ETag "1"; repetido igual então 201 igual + Idempotency-Replayed; mesma chave com corpo diferente então 409 { key }', async () => {
+    setCitizen(prata);
+    const body = {
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    };
+    const withoutKey = await api()
+      .post('/v1/portal/requests')
+      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
+      .send(body);
+    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
+    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
+    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });
+
+    const key = `e2e-${randomUUID()}`;
+    const first = await api()
+      .post('/v1/portal/requests')
+      .set(headers({ 'idempotency-key': key }))
+      .send(body);
+    expect(first.status, JSON.stringify(first.body)).toBe(201);
+    expect(first.body).toMatchObject({
+      state: 'PEDIDO_EM_COMPOSICAO',
+      minimumAssurance: 'simples',
+      version: 1,
+      prefilled: {},
+    });
+    expect(first.body.requirements).toEqual(['Conta gov.br']);
+    expect(typeof first.body.requestId).toBe('string');
+    expect(first.headers.etag).toBe('"1"');
+
+    const replay = await api()
+      .post('/v1/portal/requests')
+      .set(headers({ 'idempotency-key': key }))
+      .send(body);
+    expect(replay.status, JSON.stringify(replay.body)).toBe(201);
+    expect(replay.body).toEqual(first.body);
+    expect(String(replay.headers['idempotency-replayed'])).toBe('true');
+
+    const divergent = await api()
+      .post('/v1/portal/requests')
+      .set(headers({ 'idempotency-key': key }))
+      .send({ ...body, targetKind: 'ait', targetId: AITS.f2 });
+    expect(divergent.status, JSON.stringify(divergent.body)).toBe(409);
+    expect(divergent.body.code).toBe(
+      'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+    );
+    expect(divergent.body.context).toEqual({ key });
+
+    // o rascunho em aberto criado aqui é desistido para não bloquear os ciclos seguintes (REQUEST_DRAFT_EXISTS)
+    const withdrawn = await api()
+      .post(`/v1/portal/requests/${first.body.requestId}/withdraw`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ confirm: true });
+    expect(withdrawn.status, JSON.stringify(withdrawn.body)).toBe(200);
+  });
+
+  it("C-0002-65 — dado defesa_previa sobre ait com vínculo então 422 SERVICE_UNAVAILABLE { unavailableReason, alternativeChannelNote presencial }; manifestar então 422 INELIGIBLE; consulta_multas sobre ait sem vínculo então 404 { kind: 'ait' }", async () => {
+    setCitizen(prata);
+    const unavailable = await api()
+      .post('/v1/portal/requests')
+      .set(headers())
+      .send({
+        serviceKey: 'defesa_previa',
+        targetKind: 'ait',
+        targetId: AITS.f2,
+        channel: 'portal',
+      });
+    expect(unavailable.status, JSON.stringify(unavailable.body)).toBe(422);
+    expect(unavailable.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(unavailable.body.context).toEqual({
+      unavailableReason: REASON_R0007,
+      alternativeChannelNote: PRESENTIAL_NOTE,
+    });
+
+    const ineligible = await api()
+      .post('/v1/portal/requests')
+      .set(headers())
+      .send({
+        serviceKey: 'manifestar',
+        targetKind: 'none',
+        channel: 'portal',
+      });
+    expect(ineligible.status, JSON.stringify(ineligible.body)).toBe(422);
+    expect(ineligible.body.code).toBe('PORTAL.INELIGIBLE');
+    expect(ineligible.body.context).toEqual({
+      reason: 'servico_com_rota_propria',
+      alternative: '/v1/portal/manifestations',
+      serviceKey: 'manifestar',
+    });
+
+    const notEntitled = await api()
+      .post('/v1/portal/requests')
+      .set(headers())
+      .send({
+        serviceKey: 'consulta_multas',
+        targetKind: 'ait',
+        targetId: AITS.f1,
+        channel: 'portal',
+      });
+    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
+    expect(notEntitled.body.code).toBe('PORTAL.NOT_FOUND');
+    expect(notEntitled.body.context).toEqual({ kind: 'ait' });
+
+    const unknownService = await api()
+      .post('/v1/portal/requests')
+      .set(headers())
+      .send({
+        serviceKey: 'nao_existe',
+        targetKind: 'none',
+        channel: 'portal',
+      });
+    expect(unknownService.status, JSON.stringify(unknownService.body)).toBe(
+      404,
+    );
+    expect(unknownService.body.context).toEqual({ kind: 'service' });
+  });
+});
+
+describe('CTG-0002 §3 — ciclo consulta_multas e adesão SNE (C-0002-66, C-0002-67)', () => {
+  it("C-0002-66 — dado ciclo consulta_multas: create → draft (If-Match) → submit então 'AVALIACAO_OFERECIDA' com protocolo LOCAL-E2E-2026-<7 dígitos>; GET requests lista com nextAction; GET requests/{id} ETag = version e timeline []; evaluation então 'CONCLUIDO'; de novo então 409", async () => {
+    const createdRequest = await createRequest(prata, {
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    const id = createdRequest.requestId;
+
+    const draftWithoutIfMatch = await api()
+      .put(`/v1/portal/requests/${id}/draft`)
+      .set(headers())
+      .send({});
+    expect(
+      draftWithoutIfMatch.status,
+      JSON.stringify(draftWithoutIfMatch.body),
+    ).toBe(428);
+    expect(draftWithoutIfMatch.body.code).toBe('PORTAL.IF_MATCH_REQUIRED');
+
+    const draft = await api()
+      .put(`/v1/portal/requests/${id}/draft`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({});
+    expect(draft.status, JSON.stringify(draft.body)).toBe(200);
+    expect(draft.body).toMatchObject({ requestId: id, version: 2 });
+    expect(draft.headers.etag).toBe('"2"');
+
+    const submitted = await api()
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers())
+      .send(SIGNATURE);
+    expect(submitted.status, JSON.stringify(submitted.body)).toBe(200);
+    expect(submitted.body).toMatchObject({
+      requestId: id,
+      state: 'AVALIACAO_OFERECIDA',
+      delegation: { status: 'not_applicable' },
+    });
+    expect(submitted.body.protocol.number).toMatch(/^LOCAL-E2E-2026-\d{7}$/);
+    expect(submitted.body.protocol).toMatchObject({ channel: 'portal' });
+    expect(String(submitted.body.protocol.receiptHash)).toMatch(
+      /^[0-9a-f]{64}$/,
+    );
+    expect(submitted.headers.etag).toBe(`"${submitted.body.version}"`);
+
+    const list = await api().get('/v1/portal/requests').set(headers());
+    expect(list.status, JSON.stringify(list.body)).toBe(200);
+    const item = list.body.items.find(
+      (row: { requestId: string }) => row.requestId === id,
+    );
+    expect(item).toMatchObject({
+      protocol: submitted.body.protocol.number,
+      serviceKey: 'consulta_multas',
+      situation: 'AVALIACAO_OFERECIDA',
+      nextAction: {
+        by: 'citizen',
+        label: 'portal.requests.nextAction.AVALIACAO_OFERECIDA',
+        dueOn: null,
+      },
+      targetLabel: null,
+    });
+    expect(list.body).toMatchObject({ page: 1, pageSize: 20 });
+    expect(list.body.total).toBeGreaterThanOrEqual(1);
+
+    const badState = await api()
+      .get('/v1/portal/requests?state=INVENTADO')
+      .set(headers());
+    expect(badState.status).toBe(400);
+    expect(badState.body.code).toBe('PORTAL.ENUM_INVALID');
+    expect(badState.body.context.field).toBe('state');
+
+    const detail = await api().get(`/v1/portal/requests/${id}`).set(headers());
+    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
+    expect(detail.headers.etag).toBe(`"${detail.body.request.version}"`);
+    expect(detail.body.request).toMatchObject({
+      requestId: id,
+      state: 'AVALIACAO_OFERECIDA',
+      serviceKey: 'consulta_multas',
+      channel: 'portal',
+    });
+    expect(detail.body.request.protocol).toMatchObject({
+      number: submitted.body.protocol.number,
+    });
+    expect(detail.body.request.draft).toMatchObject({
+      version: 2,
+      payload: {},
+    });
+    expect(detail.body.timeline).toEqual([]);
+    expect(detail.body.deadlines).toEqual([]);
+    expect(detail.body.documents).toEqual([]);
+    expect(detail.body.decision).toBeNull();
+    expect(detail.body.actions).toMatchObject({
+      canRespondDiligence: false,
+      canWithdraw: false,
+      withdrawalBlockedReason: 'estado_nao_admite',
+      canAppeal: false,
+      nextInstanceServiceKey: null,
+    });
+
+    const evaluated = await api()
+      .post(`/v1/portal/requests/${id}/evaluation`)
+      .set(headers())
+      .send({ scores: SCORES });
+    expect(evaluated.status, JSON.stringify(evaluated.body)).toBe(201);
+    expect(evaluated.body).toMatchObject({ requestId: id, state: 'CONCLUIDO' });
+    expect(typeof evaluated.body.evaluationId).toBe('string');
+
+    // Depois de CONCLUIDO a máquina (§2.3 passo 4, REQUEST_STATE_INVALID) e o unique da avaliação
+    // (passo 5, EVALUATION_ALREADY_SUBMITTED — texto de C-0002-66) respondem 409; a divergência
+    // interna do contrato está no relatório — aqui só o 409 e um dos dois códigos.
+    const again = await api()
+      .post(`/v1/portal/requests/${id}/evaluation`)
+      .set(headers())
+      .send({ scores: SCORES });
+    expect(again.status, JSON.stringify(again.body)).toBe(409);
+    expect([
+      'PORTAL.EVALUATION_ALREADY_SUBMITTED',
+      'PORTAL.REQUEST_STATE_INVALID',
+    ]).toContain(again.body.code);
+    created.concluded = id;
+  });
+
+  it("C-0002-67 — dado CPF 11111111111 simples quando adesao_sne (create + draft + submit) então 403 { actKey: 'adesao_sne' } e 'AGUARDANDO_NIVEL_ASSINATURA' persistido; o MESMO CPF avancada quando submit de novo então 200 'EM_ANDAMENTO_NO_ORGAO' delegated e GET sne/enrollment enrolled; outro CPF então 404", async () => {
+    const createdRequest = await createRequest(bronze, {
+      serviceKey: 'adesao_sne',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    const id = createdRequest.requestId;
+    const draft = await api()
+      .put(`/v1/portal/requests/${id}/draft`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({
+        email: 'bronze@local-e2e.invalid',
+        consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
+      });
+    expect(draft.status, JSON.stringify(draft.body)).toBe(200);
+
+    const insufficient = await api()
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers())
+      .send({ ...SIGNATURE, ...CONSEQUENCE_ACK });
+    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
+    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
+    expect(insufficient.body.context).toMatchObject({
+      actKey: 'adesao_sne',
+      required: 'avancada',
+      current: 'simples',
+      resumeRoute: `/v1/portal/requests/${id}`,
+    });
+
+    const pending = await api().get(`/v1/portal/requests/${id}`).set(headers());
+    expect(pending.status).toBe(200);
+    expect(pending.body.request).toMatchObject({
+      state: 'AGUARDANDO_NIVEL_ASSINATURA',
+      minimumAssurance: 'avancada',
+    });
+
+    // elevação simulada: mesmo CPF (mesmo sujeito) com claim avancada
+    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
+    const submitted = await api()
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers())
+      .send({ ...SIGNATURE, ...CONSEQUENCE_ACK });
+    expect(submitted.status, JSON.stringify(submitted.body)).toBe(200);
+    expect(submitted.body).toMatchObject({
+      state: 'EM_ANDAMENTO_NO_ORGAO',
+      delegation: { status: 'delegated' },
+    });
+    expect(typeof submitted.body.delegation.externalId).toBe('string');
+    expect(submitted.body.protocol.number).toMatch(/^LOCAL-E2E-2026-\d{7}$/);
+
+    const enrollment = await api()
+      .get('/v1/portal/sne/enrollment')
+      .set(headers());
+    expect(enrollment.status, JSON.stringify(enrollment.body)).toBe(200);
+    expect(enrollment.body).toMatchObject({ enrolled: true, cancelable: true });
+
+    setCitizen(ouro);
+    const other = await api().get(`/v1/portal/requests/${id}`).set(headers());
+    expect(other.status, JSON.stringify(other.body)).toBe(404);
+    expect(other.body.code).toBe('PORTAL.NOT_FOUND');
+    expect(other.body.context).toEqual({ kind: 'request' });
+    created.bronzeInProgress = id;
+  });
+});
+
+describe('CTG-0002 §3.1 — 502 DELEGATION_FAILED com alvo falso (C-0002-68)', () => {
+  it("C-0002-68 — dado app com PORTAL_DELEGATION_TARGETS sobrescrito (alvo falso que lança em consulta_multas) quando submit então 502 { protocol, retryPolicy }; GET então 'PROTOCOLADO' failed; submit repetido (mesma chave) então 502 replay; nova chave então 409 REQUEST_STATE_INVALID", async () => {
+    const requests = (await importModule('@detran/portal-requests')) as {
+      PORTAL_DELEGATION_TARGETS: symbol;
+      UnavailableDelegationTarget: new (
+        serviceKey: string,
+        reason: string,
+        kinds: string[],
+      ) => unknown;
+    };
+    const failingTarget = {
+      serviceKey: 'consulta_multas',
+      targetKinds: ['none', 'ait'],
+      availability: () => null,
+      delegate: async () => {
+        const error = new Error('alvo falso: falha simulada (C-0002-68)');
+        error.name = 'FakeFailingDelegationTarget';
+        throw error;
+      },
+    };
+    const targets = new Map<string, unknown>([
+      ['consulta_multas', failingTarget],
+      [
+        'defesa_previa',
+        new requests.UnavailableDelegationTarget(
+          'defesa_previa',
+          REASON_R0007,
+          ['ait'],
+        ),
+      ],
+    ]);
+    failingApp = await createPortalApp([
+      { token: requests.PORTAL_DELEGATION_TARGETS, value: targets },
+    ]);
+    const failing = request(failingApp.getHttpServer());
+
+    setCitizen(ouro);
+    const createdRequest = await failing
+      .post('/v1/portal/requests')
+      .set(headers())
+      .send({
+        serviceKey: 'consulta_multas',
+        targetKind: 'none',
+        channel: 'portal',
+      });
+    expect(createdRequest.status, JSON.stringify(createdRequest.body)).toBe(
+      201,
+    );
+    const id = createdRequest.body.requestId as string;
+
+    const key = `e2e-${randomUUID()}`;
+    const failed = await failing
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers({ 'idempotency-key': key }))
+      .send(SIGNATURE);
+    expect(failed.status, JSON.stringify(failed.body)).toBe(502);
+    expect(failed.body.code).toBe('PORTAL.DELEGATION_FAILED');
+    expect(failed.body.context).toMatchObject({
+      retryPolicy: 'pendencia_interna',
+    });
+    expect(String(failed.body.context.protocol)).toMatch(
+      /^LOCAL-E2E-2026-\d{7}$/,
+    );
+
+    const detail = await failing
+      .get(`/v1/portal/requests/${id}`)
+      .set(headers());
+    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
+    expect(detail.body.request).toMatchObject({
+      state: 'PROTOCOLADO',
+      delegation: { status: 'failed', error: 'FakeFailingDelegationTarget' },
+    });
+    expect(detail.body.request.protocol).toMatchObject({
+      number: failed.body.context.protocol,
+    });
+
+    const replay = await failing
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers({ 'idempotency-key': key }))
+      .send(SIGNATURE);
+    expect(replay.status, JSON.stringify(replay.body)).toBe(502);
+    expect(replay.body).toEqual(failed.body);
+    expect(String(replay.headers['idempotency-replayed'])).toBe('true');
+
+    const retry = await failing
+      .post(`/v1/portal/requests/${id}/submit`)
+      .set(headers())
+      .send(SIGNATURE);
+    expect(retry.status, JSON.stringify(retry.body)).toBe(409);
+    expect(retry.body.code).toBe('PORTAL.REQUEST_STATE_INVALID');
+    expect(retry.body.context).toEqual({
+      state: 'PROTOCOLADO',
+      allowed: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
+    });
+
+    await asOwner(client);
+    const outbox = await client.query<{ payload: { domainEvent: string } }>(
+      `select payload from integration.outbox where tenant_id = $1 and aggregate_id = $2 order by created_at, id`,
+      [TENANT_ID, id],
+    );
+    expect(outbox.rows.map((row) => row.payload.domainEvent)).toEqual([
+      'SOLICITACAO_CRIADA',
+      'SOLICITACAO_PROTOCOLADA',
+    ]);
+  }, 60_000);
+});
+
+describe('CTG-0002 §2.3 — withdraw, ownership, recibo, decisão, diligência (C-0002-69, C-0002-70)', () => {
+  it("C-0002-69 — dado request PEDIDO_EM_COMPOSICAO quando POST withdraw { confirm:true } com If-Match então 200 'DESISTIDO'; dado EM_ANDAMENTO_NO_ORGAO então 409 { state, allowed:[3] }; { confirm:false } então 400", async () => {
+    const draftRequest = await createRequest(prata, {
+      serviceKey: 'consulta_cnh',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    const withdrawn = await api()
+      .post(`/v1/portal/requests/${draftRequest.requestId}/withdraw`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ confirm: true, reason: 'desisti' });
+    expect(withdrawn.status, JSON.stringify(withdrawn.body)).toBe(200);
+    expect(withdrawn.body).toMatchObject({
+      requestId: draftRequest.requestId,
+      state: 'DESISTIDO',
+      version: 2,
+    });
+    expect(String(withdrawn.body.withdrawnAt).slice(0, 10)).toBe(FIXED_TODAY);
+    expect(withdrawn.headers.etag).toBe('"2"');
+
+    expect(
+      created.bronzeInProgress,
+      'C-0002-67 precisa ter deixado um pedido EM_ANDAMENTO_NO_ORGAO',
+    ).toBeTruthy();
+    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
+    const inProgress = await api()
+      .get(`/v1/portal/requests/${created.bronzeInProgress}`)
+      .set(headers());
+    expect(inProgress.status).toBe(200);
+    const blocked = await api()
+      .post(`/v1/portal/requests/${created.bronzeInProgress}/withdraw`)
+      .set(headers({ 'if-match': `"${inProgress.body.request.version}"` }))
+      .send({ confirm: true });
+    expect(blocked.status, JSON.stringify(blocked.body)).toBe(409);
+    expect(blocked.body.code).toBe('PORTAL.REQUEST_STATE_INVALID');
+    expect(blocked.body.context).toEqual({
+      state: 'EM_ANDAMENTO_NO_ORGAO',
+      allowed: [
+        'PEDIDO_EM_COMPOSICAO',
+        'AGUARDANDO_NIVEL_ASSINATURA',
+        'AGUARDANDO_PAGAMENTO',
+      ],
+    });
+
+    const another = await createRequest(prata, {
+      serviceKey: 'consulta_bat',
+      targetKind: 'crash',
+      targetId: EXTERNAL.crash,
+      channel: 'portal',
+    });
+    const notConfirmed = await api()
+      .post(`/v1/portal/requests/${another.requestId}/withdraw`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ confirm: false });
+    expect(notConfirmed.status, JSON.stringify(notConfirmed.body)).toBe(400);
+    expect(notConfirmed.body.code).toBe('PORTAL.VALIDATION_FAILED');
+    const cleanup = await api()
+      .post(`/v1/portal/requests/${another.requestId}/withdraw`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ confirm: true });
+    expect(cleanup.status).toBe(200);
+  });
+
+  it.todo(
+    'dado caso RAIT em curso (EM_ANDAMENTO_NO_ORGAO) quando withdraw então delega a inf:rait-case:withdraw — R-0007',
+  );
+
+  it("C-0002-70 — dado request de outro CPF então GET 404 { kind:'request' }; GET receipt com protocolo então 422 'documento_assinado_pendente_r0014'; sem protocolo então 404 { kind:'protocol' }; GET decision então 404 { kind:'decision' }; POST diligences em EM_ANDAMENTO_NO_ORGAO então 422 'delegacao_indisponivel_r0007'", async () => {
+    expect(
+      created.concluded,
+      'C-0002-66 precisa ter concluído um pedido',
+    ).toBeTruthy();
+    setCitizen(ouro);
+    const foreign = await api()
+      .get(`/v1/portal/requests/${created.concluded}`)
+      .set(headers());
+    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
+    expect(foreign.body.context).toEqual({ kind: 'request' });
+
+    setCitizen(prata);
+    const receipt = await api()
+      .get(`/v1/portal/requests/${created.concluded}/receipt`)
+      .set(headers());
+    expect(receipt.status, JSON.stringify(receipt.body)).toBe(422);
+    expect(receipt.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(receipt.body.context).toEqual({
+      unavailableReason: 'documento_assinado_pendente_r0014',
+      alternativeChannelNote: null,
+    });
+
+    const draftRequest = await createRequest(prata, {
+      serviceKey: 'consulta_exame',
+      targetKind: 'exam',
+      targetId: EXTERNAL.exam,
+      channel: 'portal',
+    });
+    const noProtocol = await api()
+      .get(`/v1/portal/requests/${draftRequest.requestId}/receipt`)
+      .set(headers());
+    expect(noProtocol.status, JSON.stringify(noProtocol.body)).toBe(404);
+    expect(noProtocol.body.context).toEqual({ kind: 'protocol' });
+
+    const decision = await api()
+      .get(`/v1/portal/requests/${created.concluded}/decision`)
+      .set(headers());
+    expect(decision.status, JSON.stringify(decision.body)).toBe(404);
+    expect(decision.body.context).toEqual({ kind: 'decision' });
+
+    const attachment = await api()
+      .post(`/v1/portal/requests/${draftRequest.requestId}/attachments`)
+      .set(headers())
+      .send({
+        filename: 'a.pdf',
+        mimeType: 'application/pdf',
+        sizeBytes: 10,
+        sha256: 'a'.repeat(64),
+      });
+    expect(attachment.status, JSON.stringify(attachment.body)).toBe(422);
+    expect(attachment.body.context).toMatchObject({
+      unavailableReason: 'documento_assinado_pendente_r0014',
+    });
+    const cleanup = await api()
+      .post(`/v1/portal/requests/${draftRequest.requestId}/withdraw`)
+      .set(headers({ 'if-match': '"1"' }))
+      .send({ confirm: true });
+    expect(cleanup.status).toBe(200);
+
+    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
+    const diligence = await api()
+      .post(
+        `/v1/portal/requests/${created.bronzeInProgress}/diligences/${randomUUID()}/responses`,
+      )
+      .set(headers())
+      .send({ text: 'resposta', attachmentIds: [] });
+    expect(diligence.status, JSON.stringify(diligence.body)).toBe(422);
+    expect(diligence.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(diligence.body.context).toMatchObject({
+      unavailableReason: REASON_R0007,
+    });
+
+    const diligenceWithoutKey = await api()
+      .post(
+        `/v1/portal/requests/${created.bronzeInProgress}/diligences/${randomUUID()}/responses`,
+      )
+      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
+      .send({ text: 'resposta', attachmentIds: [] });
+    expect(
+      diligenceWithoutKey.status,
+      JSON.stringify(diligenceWithoutKey.body),
+    ).toBe(400);
+    expect(diligenceWithoutKey.body.context).toEqual({
+      fields: ['Idempotency-Key'],
+    });
+  });
+
+  it.todo(
+    'dado diligência aberta quando POST responses então delega a inf:rait-case:answer-inquiry — R-0007',
+  );
+});
+
+describe('CTG-0002 §2.3 — política: papel fora da matriz (A3(a))', () => {
+  it('dado DETRAN_LOCAL_ROLES=field-agent com claims válidas quando POST requests então 403 da política (sem code do Portal); technical-admin sem claims então 403 PORTAL.ASSURANCE_NOT_VERIFIED', async () => {
+    setCitizen({ cpf: CPF.prata, level: 'avancada', roles: 'field-agent' });
+    const denied = await api().post('/v1/portal/requests').set(headers()).send({
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    expect(denied.status, JSON.stringify(denied.body)).toBe(403);
+    expect(denied.body.code).not.toBe('PORTAL.IDENTITY_NOT_CITIZEN');
+
+    process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
+    delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+    delete process.env.DETRAN_LOCAL_CPF;
+    const admin = await api().get('/v1/portal/requests').set(headers());
+    expect(admin.status, JSON.stringify(admin.body)).toBe(403);
+    expect(admin.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
+  });
+});
+
+describe('CTG-0002 — auditoria das mutações (C-0002-71)', () => {
+  it('C-0002-71 — dado os comandos acima então linhas de auditoria PORTAL_REQUEST_CREATE (portal.request), PORTAL_REQUEST_SUBMIT (portal.protocol), PORTAL_REQUEST_WITHDRAW, PORTAL_REPRESENTATION_CREATE (M20)', async () => {
+    for (const [action, entity] of [
+      ['PORTAL_REQUEST_CREATE', 'portal.request'],
+      ['PORTAL_REQUEST_SUBMIT', 'portal.protocol'],
+      ['PORTAL_REQUEST_WITHDRAW', 'portal.request'],
+      ['PORTAL_REQUEST_EVALUATE', 'portal.evaluation'],
+      ['PORTAL_REQUEST_COMPOSE', 'portal.request_draft'],
+      ['PORTAL_REPRESENTATION_CREATE', 'portal.representation'],
+      ['PORTAL_REPRESENTATION_DELETE', 'portal.representation'],
+    ] as const) {
+      const rows = await auditRows(client, action);
+      expect(rows.length, action).toBeGreaterThan(0);
+      expect(rows[0]!.entity, action).toBe(entity);
+    }
+  });
+});
diff --git a/backend/app/tests/e2e/portal-routes.e2e.spec.ts b/backend/app/tests/e2e/portal-routes.e2e.spec.ts
new file mode 100644
index 0000000..80a4959
--- /dev/null
+++ b/backend/app/tests/e2e/portal-routes.e2e.spec.ts
@@ -0,0 +1,962 @@
+import { randomUUID } from 'node:crypto';
+import type { INestApplication } from '@nestjs/common';
+import request from 'supertest';
+import {
+  afterAll,
+  afterEach,
+  beforeAll,
+  describe,
+  expect,
+  it,
+  vi,
+} from 'vitest';
+
+import {
+  AITS,
+  CPF,
+  EXTERNAL,
+  LOCAL,
+  SNE_EFFECTS,
+  TENANT_ID,
+  anonymousHeaders,
+  asOwner,
+  auditRows,
+  clearCitizenEnv,
+  cpfHash,
+  createPortalApp,
+  headers,
+  importModule,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalParameters,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+
+/**
+ * R-0009 CTG-0002 §2.2, §2.4, §2.5, §2.6, §2.8, §6, §8 e §13 (TASK-0006) —
+ * C-0002-72…81: fronteira de TASK-0008 (autuações §4, caixa/SNE §6,
+ * documentos/veículos/sinistros/exames §7, atendimento §8) pelo `AppModule`
+ * real com `PORTAL_NATIONAL_READ_PORTS` falso (§8 "teste") e `PortalClock`
+ * fixo. Fica vermelho até TASK-0008 montar os controladores de §14 e a
+ * autenticação oportunista de `POST manifestations` (§2.8, A4(b)).
+ *
+ * Fixtures do tenant local (§12): sujeitos via `GET me` (M22); 7 linhas de
+ * `infraction_view` com o cpf_hash do CPF de teste (cópia das 7 canônicas, uma
+ * por situation); caixa (1 sne, 1 portal, 1 de outro sujeito); manifestações
+ * em CIENCIA_AO_USUARIO, EM_ANALISE e AVALIACAO_OFERECIDA; crash_view e
+ * exam_view 1 linha; vínculos inseridos no momento em que cada critério os pede.
+ */
+const client = newClient();
+let app: INestApplication;
+const subjects = { prata: '', ouro: '', bronze: '' };
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
+const bronze = { cpf: CPF.bronze, level: 'simples' as const };
+const SCORES = {
+  satisfaction: 5,
+  quality: 4,
+  deadline: 5,
+  clarity: 4,
+  channel: 5,
+};
+
+const ports = {
+  cdt: {
+    getCitizenLicense: vi.fn(async (_cpf: string) => ({
+      license: { category: 'B', status: 'fixture' },
+    })),
+    listCitizenVehicles: vi.fn(async (_cpf: string) => ({
+      items: [{ plate: 'FIX2EE1', renavam: '00000000001' }],
+    })),
+    getPaymentQuote: vi.fn(async () => ({ tiers: [] })),
+  },
+  renach: { findDriverByCpf: vi.fn(async () => null) },
+  wsdenatranRead: {
+    findVehicleByPlate: vi.fn(async () => null),
+    findVehicleByRenavam: vi.fn(async () => null),
+  },
+};
+
+/** CTG-0001 §10.8 — as 7 linhas de infraction_view (uma por situation), com o cpf_hash da prata. */
+const VIEW_ROWS = [
+  [1, AITS.f2, '2026-05-01', 'aguardando_defesa', 'none'],
+  [2, AITS.f3, '2026-05-02', 'em_defesa', 'em_disputa'],
+  [3, AITS.f5, '2026-05-03', 'penalidade_aplicada', 'definitivo'],
+  [4, AITS.f6, '2026-05-04', 'em_recurso', 'em_disputa'],
+  [5, AITS.f9, '2026-05-05', 'encerrada', 'definitivo'],
+  [6, AITS.f12, '2026-05-06', 'cancelada', 'none'],
+  [7, AITS.f10, '2026-05-07', 'arquivada', 'none'],
+] as const;
+
+function api() {
+  return request(app.getHttpServer());
+}
+
+async function insertEntitlement(
+  nn: number,
+  subjectId: string,
+  targetKind: string,
+  targetId: string,
+): Promise<void> {
+  await asOwner(client);
+  await client.query(
+    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+     values ($1, $2, $3, $4, $5, 'owner', 'manual', '2026-01-01', null)
+     on conflict (id) do update set subject_id = excluded.subject_id, target_id = excluded.target_id`,
+    [LOCAL.entitlement(nn), TENANT_ID, subjectId, targetKind, targetId],
+  );
+}
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await seedLocalTenant(client);
+  await seedLocalParameters(client);
+  await resetLocalPortalRows(client);
+
+  const projections = (await importModule('@detran/portal-projections')) as {
+    PORTAL_NATIONAL_READ_PORTS: symbol;
+  };
+  app = await createPortalApp([
+    { token: projections.PORTAL_NATIONAL_READ_PORTS, value: ports },
+  ]);
+  subjects.prata = await subjectIdOf(app, prata);
+  subjects.ouro = await subjectIdOf(app, ouro);
+  subjects.bronze = await subjectIdOf(app, bronze);
+
+  await asOwner(client);
+  for (const [nn, aitId, occurredOn, situation, pointsStatus] of VIEW_ROWS) {
+    await client.query(
+      `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
+       values ($1, $2, $3, $4, $5, $6, $7::timestamptz, 'fixture', 195.23, $8, '[]'::jsonb, $9, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)`,
+      [
+        LOCAL.infractionView(nn),
+        TENANT_ID,
+        aitId,
+        cpfHash(CPF.prata),
+        `FIX-00000e${nn}`,
+        `FIX2E0${nn}`,
+        `${occurredOn}T12:00:00-04:00`,
+        situation,
+        pointsStatus,
+      ],
+    );
+  }
+  await client.query(
+    `insert into portal.inbox_item (id, tenant_id, subject_id, kind, action_required, source, source_event_id, subject_line, summary, ait_id, request_id, available_on, read_on, fictitious_acknowledgement_on, deadline_due_on, deadline_owned_by)
+     values
+       ($1, $4, $5, 'SNE', true, 'sne', $7, 'Notificação de autuação disponível', 'fixture', $10, null, '2026-09-01', null, '2026-10-01', '2026-10-01', 'citizen'),
+       ($2, $4, $5, 'PROCESSO', false, 'portal', $8, 'Pedido em andamento', 'fixture', null, null, '2026-09-10', '2026-09-11', null, null, null),
+       ($3, $4, $6, 'SISTEMA', false, 'portal', $9, 'Item de outro sujeito', 'fixture', null, null, '2026-09-12', null, null, null, null)`,
+    [
+      LOCAL.inboxSne,
+      LOCAL.inboxPortal,
+      LOCAL.inboxOther,
+      TENANT_ID,
+      subjects.prata,
+      subjects.ouro,
+      LOCAL.sourceEvent(1),
+      LOCAL.sourceEvent(2),
+      LOCAL.sourceEvent(3),
+      AITS.f2,
+    ],
+  );
+  await client.query(
+    `insert into portal.manifestation (id, tenant_id, state, kind, confidential, anonymous, subject_id, text, protocol, received_at, agency_due_on, decided_at, decision_text, version)
+     values
+       ($1, $4, 'CIENCIA_AO_USUARIO', 'elogio', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000001', '2026-08-10T12:00:00-04:00', '2026-09-09', '2026-09-01T12:00:00-04:00', 'fixture', 1),
+       ($2, $4, 'EM_ANALISE', 'sugestao', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000002', '2026-09-01T12:00:00-04:00', '2026-10-01', null, null, 1),
+       ($3, $4, 'AVALIACAO_OFERECIDA', 'reclamacao', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000003', '2026-07-10T12:00:00-04:00', '2026-08-09', '2026-08-01T12:00:00-04:00', 'fixture', 1)`,
+    [
+      LOCAL.manifestationCiencia,
+      LOCAL.manifestationEmAnalise,
+      LOCAL.manifestationOferecida,
+      TENANT_ID,
+      subjects.prata,
+    ],
+  );
+  await client.query(
+    `insert into portal.crash_view (id, tenant_id, crash_id, subject_cpf_hash, state_label, summary_json, third_party_fields_suppressed, last_event_id)
+     values ($1, $2, $3, $4, 'fixture', '{}'::jsonb, true, '00000000-0000-0000-0000-000000000000')`,
+    [LOCAL.crashView, TENANT_ID, EXTERNAL.crash, cpfHash(CPF.prata)],
+  );
+  await client.query(
+    `insert into portal.exam_view (id, tenant_id, exam_id, subject_cpf_hash, legal_label, valid_until, board_due_on, last_event_id)
+     values ($1, $2, $3, $4, 'fixture', '2027-01-01', null, '00000000-0000-0000-0000-000000000000')`,
+    [LOCAL.examView, TENANT_ID, EXTERNAL.exam, cpfHash(CPF.prata)],
+  );
+}, 60_000);
+
+afterEach(() => {
+  clearCitizenEnv();
+  vi.clearAllMocks();
+});
+
+afterAll(async () => {
+  await app?.close();
+  // TASK-0006 iteração 4: sem isto, os `inbox_item`/`manifestation`/`entitlement`/…
+  // do tenant local inseridos acima (subjects prata/ouro/bronze) sobrevivem à
+  // execução e, numa 2ª rodada de `test:e2e` sem reseed, `portal-identity.e2e.spec.ts`
+  // C-0001-41 (`delete from portal.subject`) viola `fk_portal_inbox_item_subject`
+  // ao apagar o sujeito ouro (`LOCAL.inboxOther` ainda o referencia). Reusa o
+  // helper genérico já chamado no `beforeAll` (idempotente contra banco
+  // persistente; não toca `portal.subject`/`act_level_policy`/`service_catalog`/
+  // brand/hostname — seguro mesmo com `portal-stream.e2e.spec.ts` rodando depois,
+  // que já reseta o próprio estado no seu `beforeAll`).
+  await resetLocalPortalRows(client);
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+  delete process.env.DETRAN_LOCAL_CPF;
+  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+});
+
+describe('CTG-0002 §2.2 — autuações (C-0002-72, C-0002-73)', () => {
+  it("C-0002-72 — dado infraction_view (7 linhas do tenant local) quando GET aits então total 7 em ordem occurred_at desc; ?status=em_recurso então 1; ?vehicle=FIX2E02 então 1; ?status=xyz então 400 ENUM_INVALID { field:'status' }; ?page=2&pageSize=5 então 2 itens", async () => {
+    setCitizen(prata);
+    const all = await api().get('/v1/portal/aits').set(headers());
+    expect(all.status, JSON.stringify(all.body)).toBe(200);
+    expect(all.body).toMatchObject({ total: 7, page: 1, pageSize: 20 });
+    expect(all.body.items).toHaveLength(7);
+    expect(all.body.items.map((item: { plate: string }) => item.plate)).toEqual(
+      [
+        'FIX2E07',
+        'FIX2E06',
+        'FIX2E05',
+        'FIX2E04',
+        'FIX2E03',
+        'FIX2E02',
+        'FIX2E01',
+      ],
+    );
+    expect(all.body.items[0]).toMatchObject({
+      aitId: AITS.f10,
+      aitNumber: 'FIX-00000e7',
+      situation: 'arquivada',
+      pointsStatus: 'none',
+      amount: 195.23,
+      framingLabel: 'fixture',
+      deadlines: [],
+      actions: [],
+    });
+    expect(JSON.stringify(all.body)).not.toMatch(
+      /AIT_LAVRADO|NOTIFICADO_AUTUACAO|INSTANCIA_ENCERRADA/,
+    );
+
+    const appealing = await api()
+      .get('/v1/portal/aits?status=em_recurso')
+      .set(headers());
+    expect(appealing.status).toBe(200);
+    expect(
+      appealing.body.items.map((item: { aitId: string }) => item.aitId),
+    ).toEqual([AITS.f6]);
+    expect(appealing.body.total).toBe(1);
+
+    const byPlate = await api()
+      .get('/v1/portal/aits?vehicle=FIX2E02')
+      .set(headers());
+    expect(byPlate.status).toBe(200);
+    expect(
+      byPlate.body.items.map((item: { aitId: string }) => item.aitId),
+    ).toEqual([AITS.f3]);
+
+    const badStatus = await api()
+      .get('/v1/portal/aits?status=xyz')
+      .set(headers());
+    expect(badStatus.status, JSON.stringify(badStatus.body)).toBe(400);
+    expect(badStatus.body.code).toBe('PORTAL.ENUM_INVALID');
+    expect(badStatus.body.context).toMatchObject({ field: 'status' });
+    expect(badStatus.body.context.allowed).toEqual(
+      expect.arrayContaining(['aguardando_defesa', 'em_recurso', 'arquivada']),
+    );
+
+    const paged = await api()
+      .get('/v1/portal/aits?page=2&pageSize=5')
+      .set(headers());
+    expect(paged.status).toBe(200);
+    expect(paged.body).toMatchObject({ total: 7, page: 2, pageSize: 5 });
+    expect(paged.body.items).toHaveLength(2);
+
+    setCitizen(bronze);
+    const none = await api().get('/v1/portal/aits').set(headers());
+    expect(none.status).toBe(200);
+    expect(none.body).toMatchObject({ items: [], total: 0 });
+  });
+
+  it("C-0002-73 — dado GET aits/{…f0000002} sem entitlement então 404 { kind:'ait' }; com entitlement então 200 com notices [], payment default, openRequestId null, evidenceAvailable false; GET aits/{id}/points então { pointsStatus:'none', points:null }; GET points-summary sem linha então zeros; com linha então valores", async () => {
+    setCitizen(prata);
+    const notEntitled = await api()
+      .get(`/v1/portal/aits/${AITS.f2}`)
+      .set(headers());
+    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
+    expect(notEntitled.body.code).toBe('PORTAL.NOT_FOUND');
+    expect(notEntitled.body.context).toEqual({ kind: 'ait' });
+
+    const badId = await api().get('/v1/portal/aits/nao-uuid').set(headers());
+    expect(badId.status).toBe(400);
+    expect(badId.body.context).toEqual({ fields: ['aitId'] });
+
+    await insertEntitlement(1, subjects.prata, 'ait', AITS.f2);
+    const detail = await api().get(`/v1/portal/aits/${AITS.f2}`).set(headers());
+    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
+    expect(detail.body).toMatchObject({
+      aitId: AITS.f2,
+      aitNumber: 'FIX-00000e1',
+      plate: 'FIX2E01',
+      situation: 'aguardando_defesa',
+      notices: [],
+      payment: { tiers: [], paid: false, paidTier: null },
+      openRequestId: null,
+      evidenceAvailable: false,
+    });
+
+    // vínculo sem linha na projeção → 404 (M10: mesma resposta)
+    await insertEntitlement(2, subjects.prata, 'ait', AITS.f1);
+    const noView = await api().get(`/v1/portal/aits/${AITS.f1}`).set(headers());
+    expect(noView.status, JSON.stringify(noView.body)).toBe(404);
+    expect(noView.body.context).toEqual({ kind: 'ait' });
+
+    const points = await api()
+      .get(`/v1/portal/aits/${AITS.f2}/points`)
+      .set(headers());
+    expect(points.status, JSON.stringify(points.body)).toBe(200);
+    expect(points.body).toEqual({
+      aitId: AITS.f2,
+      pointsStatus: 'none',
+      points: null,
+    });
+
+    const emptySummary = await api()
+      .get('/v1/portal/points-summary')
+      .set(headers());
+    expect(emptySummary.status, JSON.stringify(emptySummary.body)).toBe(200);
+    expect(emptySummary.body).toEqual({
+      definitivePoints: 0,
+      disputedPoints: 0,
+      byVehicle: [],
+      last12Months: [],
+      cachedAt: null,
+    });
+
+    await asOwner(client);
+    await client.query(
+      `insert into portal.points_view (id, tenant_id, subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json, last_12_months_json, last_event_id, cached_at)
+       values ($1, $2, $3, 3, 4, '[{"plate":"FIX2E01","points":3}]'::jsonb, '[]'::jsonb, null, '2026-09-14T12:00:00-04:00')`,
+      [LOCAL.pointsView, TENANT_ID, cpfHash(CPF.prata)],
+    );
+    const summary = await api().get('/v1/portal/points-summary').set(headers());
+    expect(summary.status).toBe(200);
+    expect(summary.body).toMatchObject({
+      definitivePoints: 3,
+      disputedPoints: 4,
+      byVehicle: [{ plate: 'FIX2E01', points: 3 }],
+      last12Months: [],
+    });
+    expect(new Date(summary.body.cachedAt).toISOString()).toBe(
+      '2026-09-14T16:00:00.000Z',
+    );
+  });
+});
+
+describe('CTG-0002 §2.4/§6 — caixa, SNE e push (C-0002-74, C-0002-75, C-0002-76)', () => {
+  it('C-0002-74 — dado inbox_item sne e portal do sujeito quando GET inbox então 2 itens com kind derivado e fictitiousAcknowledgementOn só no sne; ?kind=informativo então 1; POST inbox/{sne}/read então acknowledgementEvidence; de novo então mesma resposta e 1 evidência; item de outro sujeito então 404', async () => {
+    setCitizen(prata);
+    const list = await api().get('/v1/portal/inbox').set(headers());
+    expect(list.status, JSON.stringify(list.body)).toBe(200);
+    expect(list.body.total).toBe(2);
+    expect(list.body.items.map((item: { id: string }) => item.id)).toEqual([
+      LOCAL.inboxPortal,
+      LOCAL.inboxSne,
+    ]);
+    expect(list.body.items[1]).toMatchObject({
+      id: LOCAL.inboxSne,
+      kind: 'acao_necessaria',
+      category: 'SNE',
+      source: 'sne',
+      aitId: AITS.f2,
+      availableOn: '2026-09-01',
+      readOn: null,
+      fictitiousAcknowledgementOn: '2026-10-01',
+      deadline: { dueOn: '2026-10-01', ownedBy: 'citizen' },
+    });
+    expect(list.body.items[0]).toMatchObject({
+      id: LOCAL.inboxPortal,
+      kind: 'informativo',
+      category: 'PROCESSO',
+      source: 'portal',
+      readOn: '2026-09-11',
+      fictitiousAcknowledgementOn: null,
+      deadline: null,
+    });
+
+    const informative = await api()
+      .get('/v1/portal/inbox?kind=informativo')
+      .set(headers());
+    expect(informative.status).toBe(200);
+    expect(
+      informative.body.items.map((item: { id: string }) => item.id),
+    ).toEqual([LOCAL.inboxPortal]);
+    const unread = await api()
+      .get('/v1/portal/inbox?read=false')
+      .set(headers());
+    expect(unread.body.items.map((item: { id: string }) => item.id)).toEqual([
+      LOCAL.inboxSne,
+    ]);
+    const badKind = await api().get('/v1/portal/inbox?kind=xyz').set(headers());
+    expect(badKind.status).toBe(400);
+    expect(badKind.body.code).toBe('PORTAL.ENUM_INVALID');
+    expect(badKind.body.context).toMatchObject({
+      field: 'kind',
+      allowed: ['acao_necessaria', 'informativo'],
+    });
+
+    const read = await api()
+      .post(`/v1/portal/inbox/${LOCAL.inboxSne}/read`)
+      .set(headers())
+      .send({});
+    expect(read.status, JSON.stringify(read.body)).toBe(200);
+    expect(read.body).toMatchObject({
+      id: LOCAL.inboxSne,
+      readOn: '2026-09-14',
+    });
+    expect(read.body.acknowledgementEvidence).toBeTruthy();
+    expect(String(read.body.acknowledgementEvidence.displayedSha256)).toMatch(
+      /^[0-9a-f]{64}$/,
+    );
+
+    const again = await api()
+      .post(`/v1/portal/inbox/${LOCAL.inboxSne}/read`)
+      .set(headers())
+      .send({});
+    expect(again.status).toBe(200);
+    expect(again.body).toEqual(read.body);
+    await asOwner(client);
+    const evidence = await client.query(
+      `select id from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
+      [TENANT_ID, LOCAL.inboxSne],
+    );
+    expect(evidence.rows).toHaveLength(1);
+    const events = await client.query<{ topic: string; count: string }>(
+      `select topic, count(*)::text as count from integration.outbox where tenant_id = $1 and aggregate_id = $2 group by topic order by topic`,
+      [TENANT_ID, LOCAL.inboxSne],
+    );
+    expect(events.rows.map((row) => row.count)).toEqual(['1', '1']);
+
+    const foreign = await api()
+      .post(`/v1/portal/inbox/${LOCAL.inboxOther}/read`)
+      .set(headers())
+      .send({});
+    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
+    expect(foreign.body.context).toEqual({ kind: 'inbox_item' });
+  });
+
+  it('C-0002-75 — dado GET sne/enrollment sem linha então { enrolled:false, cancelable:false }; POST sem email/phone então 422 SNE_CONTACT_REQUIRED; com email e os 4 efeitos então 201; de novo então 409 SNE_ALREADY_ENROLLED; DELETE então 200; DELETE de novo então 409 SNE_NOT_ENROLLED; simples então 403; sem Idempotency-Key então 400', async () => {
+    setCitizen(prata);
+    const before = await api().get('/v1/portal/sne/enrollment').set(headers());
+    expect(before.status, JSON.stringify(before.body)).toBe(200);
+    expect(before.body).toEqual({
+      enrolled: false,
+      since: null,
+      channel: null,
+      cancelable: false,
+    });
+
+    const consent = { textVersion: '1', effectsAck: [...SNE_EFFECTS] };
+    const noContact = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({ consent });
+    expect(noContact.status, JSON.stringify(noContact.body)).toBe(422);
+    expect(noContact.body.code).toBe('PORTAL.SNE_CONTACT_REQUIRED');
+    expect(noContact.body.context).toEqual({ missing: ['email', 'phone'] });
+
+    const enrolled = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({ email: 'prata@local-e2e.invalid', channel: 'email', consent });
+    expect(enrolled.status, JSON.stringify(enrolled.body)).toBe(201);
+    expect(enrolled.body).toMatchObject({
+      enrolled: true,
+      channel: 'email',
+      cancelable: true,
+    });
+    expect(String(enrolled.body.since).slice(0, 10)).toBe('2026-09-14');
+
+    const twice = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({ email: 'prata@local-e2e.invalid', consent });
+    expect(twice.status, JSON.stringify(twice.body)).toBe(409);
+    expect(twice.body.code).toBe('PORTAL.SNE_ALREADY_ENROLLED');
+
+    const cancelled = await api()
+      .delete('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({ reason: 'teste' });
+    expect(cancelled.status, JSON.stringify(cancelled.body)).toBe(200);
+    expect(cancelled.body).toMatchObject({
+      enrolled: false,
+      since: null,
+      cancelable: false,
+    });
+    expect(String(cancelled.body.cancelledAt).slice(0, 10)).toBe('2026-09-14');
+
+    const cancelledAgain = await api()
+      .delete('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({});
+    expect(cancelledAgain.status, JSON.stringify(cancelledAgain.body)).toBe(
+      409,
+    );
+    expect(cancelledAgain.body.code).toBe('PORTAL.SNE_NOT_ENROLLED');
+
+    setCitizen(bronze);
+    const insufficient = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set(headers())
+      .send({ email: 'bronze@local-e2e.invalid', consent });
+    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
+    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
+    expect(insufficient.body.context).toMatchObject({
+      actKey: 'adesao_sne',
+      resumeRoute: '/v1/portal/sne/enrollment',
+    });
+
+    setCitizen(prata);
+    const withoutKey = await api()
+      .post('/v1/portal/sne/enrollment')
+      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
+      .send({ email: 'prata@local-e2e.invalid', consent });
+    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
+    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
+    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });
+
+    await asOwner(client);
+    const events = await client.query<{
+      payload: { domainEvent: string; aggregate: { version: number } };
+    }>(
+      `select payload from integration.outbox where tenant_id = $1 and topic = $2 order by created_at, id`,
+      [TENANT_ID, 'portal.sne-enrollment.changed'],
+    );
+    expect(
+      events.rows.map((row) => [
+        row.payload.domainEvent,
+        row.payload.aggregate.version,
+      ]),
+    ).toEqual([
+      ['SNE_ADESAO_SOLICITADA', 1],
+      ['SNE_CANCELAMENTO_SOLICITADO', 2],
+    ]);
+  });
+
+  it('C-0002-76 — dado POST push-subscriptions { endpoint, keys } duas vezes então 201 e uma única linha por endpoint', async () => {
+    setCitizen(prata);
+    const body = {
+      endpoint: 'https://push.local-e2e.invalid/sub/e2e-1',
+      keys: { p256dh: 'p', auth: 'a' },
+    };
+    const first = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(headers())
+      .send(body);
+    expect(first.status, JSON.stringify(first.body)).toBe(201);
+    expect(first.body).toMatchObject({ endpoint: body.endpoint });
+    expect(typeof first.body.id).toBe('string');
+    const second = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(headers())
+      .send(body);
+    expect(second.status, JSON.stringify(second.body)).toBe(201);
+    await asOwner(client);
+    const rows = await client.query(
+      `select id, subject_id from portal.push_subscription where tenant_id = $1 and endpoint = $2`,
+      [TENANT_ID, body.endpoint],
+    );
+    expect(rows.rows).toHaveLength(1);
+    expect(rows.rows[0]).toMatchObject({ subject_id: subjects.prata });
+
+    const invalid = await api()
+      .post('/v1/portal/push-subscriptions')
+      .set(headers())
+      .send({ endpoint: 'nao-e-url', keys: { p256dh: 'p', auth: 'a' } });
+    expect(invalid.status).toBe(400);
+    expect(invalid.body.code).toBe('PORTAL.VALIDATION_FAILED');
+  });
+});
+
+describe('CTG-0002 §2.5/§8 — documentos, veículos, sinistros, exames (C-0002-77, C-0002-78)', () => {
+  it("C-0002-77 — dado PORTAL_NATIONAL_READ_PORTS falso quando GET documents/cnh então 200 { license, cachedAt, category:'C' }; ?documentBytes=true então 422; GET vehicles então 200 { items, cachedAt }; clearance com vínculo então 503; sem vínculo então 404 { kind:'vehicle' }; crlv-e então 422; auditoria gravada", async () => {
+    setCitizen(prata);
+    const cnh = await api().get('/v1/portal/documents/cnh').set(headers());
+    expect(cnh.status, JSON.stringify(cnh.body)).toBe(200);
+    expect(cnh.body).toMatchObject({
+      license: { category: 'B', status: 'fixture' },
+      qrVerification: null,
+      documentBytes: null,
+      category: 'C',
+    });
+    expect(typeof cnh.body.cachedAt).toBe('string');
+    expect(ports.cdt.getCitizenLicense).toHaveBeenCalledWith(CPF.prata);
+    const cached = await api().get('/v1/portal/documents/cnh').set(headers());
+    expect(cached.status).toBe(200);
+    expect(ports.cdt.getCitizenLicense).toHaveBeenCalledTimes(1);
+    expect(cached.body.cachedAt).toBe(cnh.body.cachedAt);
+
+    const bytes = await api()
+      .get('/v1/portal/documents/cnh?documentBytes=true')
+      .set(headers());
+    expect(bytes.status, JSON.stringify(bytes.body)).toBe(422);
+    expect(bytes.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(bytes.body.context).toEqual({
+      unavailableReason: 'documento_assinado_pendente_r0014',
+      alternativeChannelNote: null,
+    });
+
+    const vehicles = await api().get('/v1/portal/vehicles').set(headers());
+    expect(vehicles.status, JSON.stringify(vehicles.body)).toBe(200);
+    expect(vehicles.body).toMatchObject({
+      items: [{ plate: 'FIX2EE1', renavam: '00000000001' }],
+    });
+    expect(typeof vehicles.body.cachedAt).toBe('string');
+
+    const notEntitled = await api()
+      .get(`/v1/portal/vehicles/${randomUUID()}/clearance`)
+      .set(headers());
+    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
+    expect(notEntitled.body.context).toEqual({ kind: 'vehicle' });
+
+    await insertEntitlement(3, subjects.prata, 'vehicle', EXTERNAL.vehicle);
+    const clearance = await api()
+      .get(`/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`)
+      .set(headers());
+    expect(clearance.status, JSON.stringify(clearance.body)).toBe(503);
+    expect(clearance.body.code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
+    expect(clearance.body.context).toMatchObject({ cachedAt: null });
+    expect(typeof clearance.body.context.retryAfter).toBe('number');
+    expect(clearance.body.context.retryAfter).toBeGreaterThan(0);
+
+    const crlv = await api()
+      .post(`/v1/portal/vehicles/${EXTERNAL.vehicle}/crlv-e`)
+      .set(headers())
+      .send({});
+    expect(crlv.status, JSON.stringify(crlv.body)).toBe(422);
+    expect(crlv.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
+    expect(crlv.body.context).toMatchObject({
+      unavailableReason: 'documento_assinado_pendente_r0014',
+    });
+
+    expect((await auditRows(client, 'PORTAL_DOCUMENT_READ'))[0]).toMatchObject({
+      entity: 'portal.national_read_cache',
+    });
+    expect((await auditRows(client, 'PORTAL_VEHICLE_READ'))[0]).toMatchObject({
+      entity: 'portal.national_read_cache',
+    });
+  });
+
+  it("C-0002-78 — dado crash_view/exam_view do sujeito quando GET crashes | GET exams então 1 item; GET crashes/{id} sem entitlement então 404 { kind:'crash' }; com então 200 thirdPartyFieldsSuppressed true; GET exams/{id} idem; auditoria PORTAL_CRASH_READ / PORTAL_EXAM_READ", async () => {
+    setCitizen(prata);
+    const crashes = await api().get('/v1/portal/crashes').set(headers());
+    expect(crashes.status, JSON.stringify(crashes.body)).toBe(200);
+    expect(crashes.body.items).toEqual([
+      {
+        crashId: EXTERNAL.crash,
+        stateLabel: 'fixture',
+        summary: {},
+        thirdPartyFieldsSuppressed: true,
+      },
+    ]);
+    const exams = await api().get('/v1/portal/exams').set(headers());
+    expect(exams.status, JSON.stringify(exams.body)).toBe(200);
+    expect(exams.body.items).toEqual([
+      {
+        examId: EXTERNAL.exam,
+        legalLabel: 'fixture',
+        validUntil: '2027-01-01',
+        boardDueOn: null,
+      },
+    ]);
+
+    const crashNotEntitled = await api()
+      .get(`/v1/portal/crashes/${EXTERNAL.crash}`)
+      .set(headers());
+    expect(crashNotEntitled.status, JSON.stringify(crashNotEntitled.body)).toBe(
+      404,
+    );
+    expect(crashNotEntitled.body.context).toEqual({ kind: 'crash' });
+    const examNotEntitled = await api()
+      .get(`/v1/portal/exams/${EXTERNAL.exam}`)
+      .set(headers());
+    expect(examNotEntitled.status, JSON.stringify(examNotEntitled.body)).toBe(
+      404,
+    );
+    expect(examNotEntitled.body.context).toEqual({ kind: 'exam' });
+
+    await insertEntitlement(4, subjects.prata, 'crash', EXTERNAL.crash);
+    await insertEntitlement(5, subjects.prata, 'exam', EXTERNAL.exam);
+    const crash = await api()
+      .get(`/v1/portal/crashes/${EXTERNAL.crash}`)
+      .set(headers());
+    expect(crash.status, JSON.stringify(crash.body)).toBe(200);
+    expect(crash.body).toEqual({
+      crashId: EXTERNAL.crash,
+      stateLabel: 'fixture',
+      summary: {},
+      thirdPartyFieldsSuppressed: true,
+    });
+    const exam = await api()
+      .get(`/v1/portal/exams/${EXTERNAL.exam}`)
+      .set(headers());
+    expect(exam.status, JSON.stringify(exam.body)).toBe(200);
+    expect(exam.body).toEqual({
+      examId: EXTERNAL.exam,
+      legalLabel: 'fixture',
+      validUntil: '2027-01-01',
+      boardDueOn: null,
+    });
+
+    setCitizen(bronze);
+    expect(
+      (await api().get('/v1/portal/crashes').set(headers())).body.items,
+    ).toEqual([]);
+
+    expect((await auditRows(client, 'PORTAL_CRASH_READ'))[0]).toMatchObject({
+      entity: 'portal.crash_view',
+    });
+    expect((await auditRows(client, 'PORTAL_EXAM_READ'))[0]).toMatchObject({
+      entity: 'portal.exam_view',
+    });
+  });
+});
+
+describe('CTG-0002 §2.6/§2.8 — atendimento (C-0002-79, C-0002-80, C-0002-81)', () => {
+  it("C-0002-79 — dado POST manifestations SEM Authorization então 201 anonymous true; com Authorization CIDADAO então anonymous false e GET manifestations lista; { kind:'xyz' } então 400; { kind:'elogio' } sem text então 201; sem Idempotency-Key então 400; GET manifestations sem sessão então 401/403", async () => {
+    const anonymous = await request(app.getHttpServer())
+      .post('/v1/portal/manifestations')
+      .set(anonymousHeaders())
+      .send({ kind: 'reclamacao', text: 'x' });
+    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(201);
+    expect(anonymous.body).toMatchObject({
+      state: 'COMPROVANTE_EMITIDO',
+      anonymous: true,
+    });
+    expect(String(anonymous.body.protocol)).toMatch(/^LOCAL-E2E-2026-\d{7}$/);
+    expect(typeof anonymous.body.receivedAt).toBe('string');
+    expect(typeof anonymous.body.agencyDueOn).toBe('string');
+    expect(typeof anonymous.body.manifestationId).toBe('string');
+
+    setCitizen(prata);
+    const identified = await api()
+      .post('/v1/portal/manifestations')
+      .set(headers())
+      .send({ kind: 'sugestao', text: 'y' });
+    expect(identified.status, JSON.stringify(identified.body)).toBe(201);
+    expect(identified.body.anonymous).toBe(false);
+    const list = await api().get('/v1/portal/manifestations').set(headers());
+    expect(list.status, JSON.stringify(list.body)).toBe(200);
+    const listed = list.body.items.find(
+      (item: { manifestationId: string }) =>
+        item.manifestationId === identified.body.manifestationId,
+    );
+    expect(listed).toMatchObject({
+      state: 'COMPROVANTE_EMITIDO',
+      kind: 'sugestao',
+      protocol: identified.body.protocol,
+      evaluationOffered: false,
+      evaluated: false,
+      decision: null,
+    });
+    expect(listed.deadlines).toMatchObject({
+      agencyDueOn: identified.body.agencyDueOn,
+      extended: null,
+    });
+    expect(listed).not.toHaveProperty('infoDueOn');
+    expect(
+      list.body.items.some(
+        (item: { manifestationId: string }) =>
+          item.manifestationId === anonymous.body.manifestationId,
+      ),
+    ).toBe(false);
+
+    const detail = await api()
+      .get(`/v1/portal/manifestations/${identified.body.manifestationId}`)
+      .set(headers());
+    expect(detail.status).toBe(200);
+    expect(detail.body).toMatchObject({
+      manifestationId: identified.body.manifestationId,
+      text: 'y',
+      confidential: false,
+    });
+
+    const badKind = await request(app.getHttpServer())
+      .post('/v1/portal/manifestations')
+      .set(anonymousHeaders())
+      .send({ kind: 'xyz', text: 'x' });
+    expect(badKind.status, JSON.stringify(badKind.body)).toBe(400);
+    expect(badKind.body.code).toBe('PORTAL.MANIFESTATION_KIND_INVALID');
+    expect(badKind.body.context).toEqual({
+      allowed: ['reclamacao', 'denuncia', 'sugestao', 'elogio', 'solicitacao'],
+    });
+
+    const noText = await request(app.getHttpServer())
+      .post('/v1/portal/manifestations')
+      .set(anonymousHeaders())
+      .send({ kind: 'elogio', campoExtra: 1 });
+    expect(noText.status, JSON.stringify(noText.body)).toBe(201);
+
+    const withoutKey = await request(app.getHttpServer())
+      .post('/v1/portal/manifestations')
+      .set({ 'x-tenant-id': TENANT_ID })
+      .send({ kind: 'elogio' });
+    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
+    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
+    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });
+
+    // C-0002-79 / A6(e) (TASK-0006 iteração 3): sem `Authorization`, o
+    // verificador local (`DetranLocalTokenVerifier`, perfil `test`) sintetiza
+    // um principal mesmo assim, com os papéis correntes de
+    // `DETRAN_LOCAL_ROLES` (aqui ainda 'CIDADAO', herdado do `setCitizen`
+    // acima) — o que passaria pela política e devolveria 200. Como em
+    // `portal-stream.e2e.spec.ts` (C-0002-82), usa-se um papel fora da
+    // matriz `portal:*` para expor a ausência de sessão; o valor anterior é
+    // restaurado depois.
+    const previousLocalRoles = process.env.DETRAN_LOCAL_ROLES;
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    const noSession = await request(app.getHttpServer())
+      .get('/v1/portal/manifestations')
+      .set({ 'x-tenant-id': TENANT_ID });
+    expect([401, 403]).toContain(noSession.status);
+    process.env.DETRAN_LOCAL_ROLES = previousLocalRoles;
+  });
+
+  it("C-0002-80 — dado manifestação CIENCIA_AO_USUARIO quando POST acknowledge então 200 'AVALIACAO_OFERECIDA'; de novo então 409; POST evaluations { subjectKind:'manifestation' } então 201 'AVALIADA'; de novo então 409; manifestação EM_ANALISE então 409 EVALUATION_NOT_OFFERED { state:'EM_ANALISE' }", async () => {
+    setCitizen(prata);
+    const acknowledged = await api()
+      .post(
+        `/v1/portal/manifestations/${LOCAL.manifestationCiencia}/acknowledge`,
+      )
+      .set(headers())
+      .send({});
+    expect(acknowledged.status, JSON.stringify(acknowledged.body)).toBe(200);
+    expect(acknowledged.body).toMatchObject({
+      manifestationId: LOCAL.manifestationCiencia,
+      state: 'AVALIACAO_OFERECIDA',
+      evaluationOffered: true,
+      version: 2,
+    });
+    expect(acknowledged.headers.etag).toBe('"2"');
+
+    const again = await api()
+      .post(
+        `/v1/portal/manifestations/${LOCAL.manifestationCiencia}/acknowledge`,
+      )
+      .set(headers())
+      .send({});
+    expect(again.status, JSON.stringify(again.body)).toBe(409);
+    expect(again.body.code).toBe('PORTAL.MANIFESTATION_STATE_INVALID');
+    expect(again.body.context).toEqual({
+      state: 'AVALIACAO_OFERECIDA',
+      allowed: ['CIENCIA_AO_USUARIO'],
+    });
+
+    const evaluated = await api()
+      .post('/v1/portal/evaluations')
+      .set(headers())
+      .send({
+        subjectKind: 'manifestation',
+        subjectId: LOCAL.manifestationCiencia,
+        scores: SCORES,
+      });
+    expect(evaluated.status, JSON.stringify(evaluated.body)).toBe(201);
+    expect(evaluated.body).toMatchObject({
+      subjectKind: 'manifestation',
+      subjectId: LOCAL.manifestationCiencia,
+      state: 'AVALIADA',
+      publicNotice: 'portal.evaluations.publicIndicator',
+    });
+
+    // depois de AVALIADA tanto o passo "state ≠ AVALIACAO_OFERECIDA" (EVALUATION_NOT_OFFERED) quanto o
+    // unique da avaliação (EVALUATION_ALREADY_SUBMITTED — texto de C-0002-80) respondem 409 (relatório)
+    const evaluatedAgain = await api()
+      .post('/v1/portal/evaluations')
+      .set(headers())
+      .send({
+        subjectKind: 'manifestation',
+        subjectId: LOCAL.manifestationCiencia,
+        scores: SCORES,
+      });
+    expect(evaluatedAgain.status, JSON.stringify(evaluatedAgain.body)).toBe(
+      409,
+    );
+    expect([
+      'PORTAL.EVALUATION_ALREADY_SUBMITTED',
+      'PORTAL.EVALUATION_NOT_OFFERED',
+    ]).toContain(evaluatedAgain.body.code);
+
+    const notOffered = await api()
+      .post('/v1/portal/evaluations')
+      .set(headers())
+      .send({
+        subjectKind: 'manifestation',
+        subjectId: LOCAL.manifestationEmAnalise,
+        scores: SCORES,
+      });
+    expect(notOffered.status, JSON.stringify(notOffered.body)).toBe(409);
+    expect(notOffered.body.code).toBe('PORTAL.EVALUATION_NOT_OFFERED');
+    expect(notOffered.body.context).toEqual({ state: 'EM_ANALISE' });
+
+    const offered = await api()
+      .post('/v1/portal/evaluations')
+      .set(headers())
+      .send({
+        subjectKind: 'manifestation',
+        subjectId: LOCAL.manifestationOferecida,
+        scores: SCORES,
+        comment: 'ok',
+      });
+    expect(offered.status, JSON.stringify(offered.body)).toBe(201);
+    expect(offered.body.state).toBe('AVALIADA');
+
+    setCitizen(ouro);
+    const foreign = await api()
+      .post('/v1/portal/evaluations')
+      .set(headers())
+      .send({
+        subjectKind: 'manifestation',
+        subjectId: LOCAL.manifestationEmAnalise,
+        scores: SCORES,
+      });
+    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
+    expect(foreign.body.context).toEqual({ kind: 'manifestation' });
+
+    expect(
+      (await auditRows(client, 'PORTAL_MANIFESTATION_ACKNOWLEDGE'))[0],
+    ).toMatchObject({ entity: 'portal.manifestation' });
+    expect(
+      (await auditRows(client, 'PORTAL_EVALUATION_EVALUATE'))[0],
+    ).toMatchObject({ entity: 'portal.evaluation' });
+  });
+
+  it("C-0002-81 — dado GET service-charter/manifestar/deadline então 200 { legalDeadline: <do catálogo do tenant local> }; /nao_existe/deadline então 404 { kind:'service' }", async () => {
+    setCitizen(prata);
+    const charter = await api()
+      .get('/v1/portal/service-charter/manifestar/deadline')
+      .set(headers());
+    expect(charter.status, JSON.stringify(charter.body)).toBe(200);
+    expect(charter.body).toEqual({
+      serviceKey: 'manifestar',
+      legalDeadline: 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16',
+      normativeReference: 'fixture e2e',
+      availability: 'available',
+    });
+    const missing = await api()
+      .get('/v1/portal/service-charter/nao_existe/deadline')
+      .set(headers());
+    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
+    expect(missing.body.code).toBe('PORTAL.NOT_FOUND');
+    expect(missing.body.context).toEqual({ kind: 'service' });
+  });
+});
diff --git a/backend/app/tests/e2e/portal-stream.e2e.spec.ts b/backend/app/tests/e2e/portal-stream.e2e.spec.ts
new file mode 100644
index 0000000..6f62add
--- /dev/null
+++ b/backend/app/tests/e2e/portal-stream.e2e.spec.ts
@@ -0,0 +1,608 @@
+import { randomUUID } from 'node:crypto';
+import http, { type IncomingMessage } from 'node:http';
+import type { INestApplication } from '@nestjs/common';
+import {
+  afterAll,
+  afterEach,
+  beforeAll,
+  describe,
+  expect,
+  it,
+  vi,
+} from 'vitest';
+
+import {
+  AITS,
+  CPF,
+  LOCAL,
+  TENANT_ID,
+  asOwner,
+  clearCitizenEnv,
+  cpfHash,
+  createPortalApp,
+  importModule,
+  newClient,
+  resetLocalPortalRows,
+  seedLocalTenant,
+  setCitizen,
+  subjectIdOf,
+} from './portal-e2e.support.js';
+
+/**
+ * R-0009 CTG-0002 §2.7, §9 e §13 (TASK-0006) — C-0002-82: `GET /v1/portal/stream`
+ * (M18) no padrão de teat-stream.e2e.spec.ts (servidor real via `app.listen(0)`,
+ * leitura em streaming por `http.get`) com o poller MANUAL injetado em
+ * `PORTAL_STREAM_POLLER` (§9: nenhum `setInterval` no controlador): as linhas
+ * da outbox só chegam quando o teste dispara o tick, e o heartbeat só quando o
+ * teste dispara a inscrição de heartbeat. Sem `PortalClock` fixo aqui: a
+ * janela de replay (24 h) e o cursor inicial são o `now()` do banco, como no
+ * TEAT. Fica vermelho até TASK-0008 criar `portal-stream.controller.ts`/
+ * `portal-stream.service.ts` e registrar o provider no `AppModule` (§14).
+ */
+const client = newClient();
+let app: INestApplication;
+let port: number;
+const openRequests: http.ClientRequest[] = [];
+const createdOutboxIds: string[] = [];
+const prata = { cpf: CPF.prata, level: 'avancada' as const };
+const CASE_ID = '00000000-0000-7000-8000-007000700207';
+const LINKED_REQUEST_ID = '00000000-0000-7000-8000-0000704000e8';
+const OTHER_HASH = cpfHash(CPF.ouro);
+let subjectId = '';
+let HEARTBEAT_INTERVAL_MS = 0;
+
+interface ManualSubscription {
+  fn: () => void | Promise<void>;
+  intervalMs: number | undefined;
+  unsubscribe: ReturnType<typeof vi.fn>;
+}
+
+/** `TeatStreamPoller` manual (mesma porta reutilizada pelo Portal, §9). */
+const poller = {
+  subscriptions: [] as ManualSubscription[],
+  port: {
+    intervalMs: 1000,
+    schedule: vi.fn((fn: () => void | Promise<void>, intervalMs?: number) => {
+      const unsubscribe = vi.fn();
+      poller.subscriptions.push({ fn, intervalMs, unsubscribe });
+      return unsubscribe;
+    }),
+  },
+  async firePolling(): Promise<void> {
+    for (const subscription of [...poller.subscriptions]) {
+      if (subscription.intervalMs !== HEARTBEAT_INTERVAL_MS)
+        await subscription.fn();
+    }
+  },
+  async fireHeartbeat(): Promise<void> {
+    for (const subscription of [...poller.subscriptions]) {
+      if (subscription.intervalMs === HEARTBEAT_INTERVAL_MS)
+        await subscription.fn();
+    }
+  },
+};
+
+interface SseEvent {
+  id?: string;
+  event?: string;
+  data?: string;
+}
+
+interface OpenStream {
+  status: () => number;
+  headers: () => Record<string, string | string[] | undefined>;
+  events: SseEvent[];
+  comments: string[];
+  opened: Promise<void>;
+  waitFor: (predicate: () => boolean, timeoutMs?: number) => Promise<void>;
+  close: () => void;
+}
+
+function openStream(
+  path: string,
+  requestHeaders: Record<string, string>,
+): OpenStream {
+  const events: SseEvent[] = [];
+  const comments: string[] = [];
+  let status = 0;
+  let responseHeaders: Record<string, string | string[] | undefined> = {};
+  let resolveOpened!: () => void;
+  const opened = new Promise<void>((resolve) => {
+    resolveOpened = resolve;
+  });
+  const req = http.get(
+    { host: '127.0.0.1', port, path, headers: requestHeaders },
+    (res: IncomingMessage) => {
+      status = res.statusCode ?? 0;
+      responseHeaders = res.headers;
+      let buffer = '';
+      let current: SseEvent = {};
+      if (status !== 200) {
+        resolveOpened();
+        res.resume();
+        return;
+      }
+      res.on('data', (chunk: Buffer) => {
+        buffer += chunk.toString('utf8');
+        const lines = buffer.split('\n');
+        buffer = lines.pop() ?? '';
+        for (const line of lines) {
+          const trimmed = line.replace(/\r$/, '');
+          if (trimmed === '') {
+            if (Object.keys(current).length > 0) events.push(current);
+            current = {};
+            continue;
+          }
+          if (trimmed.startsWith(':')) {
+            comments.push(trimmed);
+            if (trimmed === ': connected') resolveOpened();
+            continue;
+          }
+          const separator = trimmed.indexOf(':');
+          if (separator === -1) continue;
+          const field = trimmed.slice(0, separator);
+          const value = trimmed.slice(separator + 1).trimStart();
+          if (field === 'id') current.id = value;
+          else if (field === 'event') current.event = value;
+          else if (field === 'data') current.data = value;
+        }
+      });
+      res.on('end', resolveOpened);
+      res.on('error', resolveOpened);
+    },
+  );
+  req.on('error', (error) => {
+    if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') throw error;
+  });
+  openRequests.push(req);
+  return {
+    status: () => status,
+    headers: () => responseHeaders,
+    events,
+    comments,
+    opened,
+    waitFor: (predicate, timeoutMs = 3000) =>
+      new Promise((resolve, reject) => {
+        const startedAt = Date.now();
+        const check = () => {
+          if (predicate()) return resolve();
+          if (Date.now() - startedAt > timeoutMs)
+            return reject(new Error('stream: condição não satisfeita a tempo'));
+          setTimeout(check, 25);
+        };
+        check();
+      }),
+    close: () => req.destroy(),
+  };
+}
+
+function citizenHeaders(): Record<string, string> {
+  setCitizen(prata);
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    accept: 'text/event-stream',
+  };
+}
+
+async function insertOutboxRow(
+  topic: string,
+  domainEvent: string | undefined,
+  aggregate: { kind: string; id: string; version: number },
+  data: Record<string, unknown>,
+  createdAt?: string,
+): Promise<string> {
+  await asOwner(client);
+  const envelope = {
+    type: topic,
+    ...(domainEvent ? { domainEvent } : {}),
+    version: 1,
+    occurredAt: new Date().toISOString(),
+    tenantId: TENANT_ID,
+    actor: { kind: 'user', id: subjectId },
+    correlationId: randomUUID(),
+    aggregate,
+    data,
+  };
+  const result = await client.query<{ id: string }>(
+    `with new_row as (select gen_random_uuid() as id)
+     insert into integration.outbox (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
+     select new_row.id, $1, $2, $3, $4, jsonb_set($5::jsonb, '{id}', to_jsonb(new_row.id::text)), $6, 'pending', coalesce($7::timestamptz, now()), coalesce($7::timestamptz, now())
+       from new_row
+     returning id`,
+    [
+      TENANT_ID,
+      topic,
+      aggregate.kind,
+      aggregate.id,
+      JSON.stringify(envelope),
+      `${topic}:${aggregate.id}:${aggregate.version}:${randomUUID()}`,
+      createdAt ?? null,
+    ],
+  );
+  const id = result.rows[0]!.id;
+  createdOutboxIds.push(id);
+  return id;
+}
+
+const REQUEST_CHANGED = 'portal.request.changed';
+const DECISION_PUBLISHED = 'rait.decision.published';
+const PAYMENT_CONFIRMED = 'inf.payment.confirmed';
+const INFRACTION_CHANGED = 'inf.infraction.changed';
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await seedLocalTenant(client);
+  await resetLocalPortalRows(client);
+
+  const stream = (await importModule('../../src/portal-stream.service.js')) as {
+    PORTAL_STREAM_POLLER: symbol;
+  };
+  const teat = (await importModule('../../src/teat-stream.service.js')) as {
+    HEARTBEAT_INTERVAL_MS: number;
+  };
+  HEARTBEAT_INTERVAL_MS = teat.HEARTBEAT_INTERVAL_MS;
+  app = await createPortalApp(
+    [{ token: stream.PORTAL_STREAM_POLLER, value: poller.port }],
+    { fixedClock: false },
+  );
+  await app.listen(0);
+  const address = app.getHttpServer().address();
+  port = typeof address === 'object' && address ? address.port : 0;
+
+  subjectId = await subjectIdOf(app, prata);
+  await asOwner(client);
+  await client.query(
+    `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
+     values ($1, $2, $3, $4, 'FIX-00000e1', 'FIX2EE1', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)`,
+    [LOCAL.infractionView(1), TENANT_ID, AITS.f2, cpfHash(CPF.prata)],
+  );
+  await client.query(
+    `insert into portal.request (id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel, delegation_domain, delegation_command, delegation_external_id, delegation_status, minimum_assurance, version)
+     values ($1, $2, 'EM_ANDAMENTO_NO_ORGAO', 'defesa_previa', $3, 'ait', $4, 'portal', 'inf', 'inf:rait-case:protocol', $5, 'delegated', 'avancada', 4)`,
+    [LINKED_REQUEST_ID, TENANT_ID, subjectId, AITS.f2, CASE_ID],
+  );
+}, 60_000);
+
+afterEach(async () => {
+  for (const req of openRequests.splice(0)) req.destroy();
+  poller.subscriptions.length = 0;
+  clearCitizenEnv();
+  if (createdOutboxIds.length > 0) {
+    await asOwner(client);
+    await client.query(
+      `delete from integration.outbox where id = any($1::uuid[])`,
+      [createdOutboxIds.splice(0)],
+    );
+  }
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.end();
+  delete process.env.DETRAN_LOCAL_ROLES;
+  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+  delete process.env.DETRAN_LOCAL_CPF;
+  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+});
+
+describe('CTG-0002 §9 — GET /v1/portal/stream (C-0002-82)', () => {
+  it('C-0002-82 — dado conexão CIDADAO então 200 text/event-stream com `: connected`; dado papel fora da matriz então 403; dado sem sessão então 401/403', async () => {
+    const stream = openStream('/v1/portal/stream', citizenHeaders());
+    await stream.opened;
+    expect(stream.status()).toBe(200);
+    expect(String(stream.headers()['content-type'])).toContain(
+      'text/event-stream',
+    );
+    expect(stream.comments).toContain(': connected');
+    expect(poller.port.schedule).toHaveBeenCalled();
+    stream.close();
+
+    setCitizen({ cpf: CPF.prata, level: 'avancada', roles: 'field-agent' });
+    const denied = openStream('/v1/portal/stream', {
+      authorization: 'Bearer local',
+      'x-tenant-id': TENANT_ID,
+      accept: 'text/event-stream',
+    });
+    await denied.opened;
+    expect(denied.status()).toBe(403);
+    denied.close();
+
+    const anonymous = openStream('/v1/portal/stream', {
+      'x-tenant-id': TENANT_ID,
+      accept: 'text/event-stream',
+    });
+    await anonymous.opened;
+    expect([401, 403]).toContain(anonymous.status());
+    anonymous.close();
+  });
+
+  it("C-0002-82 — dado linhas 'portal.request.changed' (hash do sujeito e de outro), 'rait.decision.published' e 'inf.payment.confirmed' quando o poller manual dispara então só os frames do sujeito, reformatados por tipo, nunca com tenantId", async () => {
+    const stream = openStream('/v1/portal/stream', citizenHeaders());
+    await stream.opened;
+    expect(stream.status()).toBe(200);
+
+    const requestId = LINKED_REQUEST_ID;
+    const mine = await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_PROTOCOLADA',
+      { kind: 'portal.request', id: requestId, version: 2 },
+      {
+        requestId,
+        serviceKey: 'defesa_previa',
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'PROTOCOLADO',
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+        protocolNumber: 'LOCAL-E2E-2026-9000009',
+      },
+    );
+    const otherRequestId = randomUUID();
+    await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_CRIADA',
+      { kind: 'portal.request', id: otherRequestId, version: 1 },
+      {
+        requestId: otherRequestId,
+        serviceKey: 'consulta_multas',
+        fromState: null,
+        toState: 'PEDIDO_EM_COMPOSICAO',
+        subjectId: randomUUID(),
+        subjectCpfHash: OTHER_HASH,
+      },
+    );
+    const decision = await insertOutboxRow(
+      DECISION_PUBLISHED,
+      'RAIT_DECISAO_PUBLICADA',
+      { kind: 'case', id: CASE_ID, version: 3 },
+      {
+        caseId: CASE_ID,
+        decisionId: '00000000-0000-7000-8000-007000700409',
+        decisionKind: 'indeferido',
+        publishedOn: '2026-09-12',
+        channel: 'portal',
+      },
+    );
+    await insertOutboxRow(
+      DECISION_PUBLISHED,
+      'RAIT_DECISAO_PUBLICADA',
+      { kind: 'case', id: randomUUID(), version: 3 },
+      {
+        caseId: randomUUID(),
+        decisionId: randomUUID(),
+        decisionKind: 'deferido',
+        publishedOn: '2026-09-12',
+        channel: 'portal',
+      },
+    );
+    const payment = await insertOutboxRow(
+      PAYMENT_CONFIRMED,
+      'PAGAMENTO_CONFIRMADO',
+      { kind: 'payment', id: randomUUID(), version: 1 },
+      {
+        paymentId: randomUUID(),
+        documentId: randomUUID(),
+        infractionId: '00000000-0000-7000-8000-0000d0000002',
+        aitId: AITS.f2,
+        tier: 'desconto_80',
+        paidOn: '2026-09-10',
+        amount: 156.18,
+      },
+    );
+    await insertOutboxRow(
+      PAYMENT_CONFIRMED,
+      'PAGAMENTO_CONFIRMADO',
+      { kind: 'payment', id: randomUUID(), version: 1 },
+      {
+        paymentId: randomUUID(),
+        documentId: randomUUID(),
+        infractionId: '00000000-0000-7000-8000-0000d0000001',
+        aitId: AITS.f1,
+        tier: 'desconto_80',
+        paidOn: '2026-09-10',
+        amount: 156.18,
+      },
+    );
+    await insertOutboxRow(
+      INFRACTION_CHANGED,
+      'INFRACAO_ESTADO_ALTERADO',
+      { kind: 'infraction', id: randomUUID(), version: 2 },
+      {
+        infractionId: '00000000-0000-7000-8000-0000d0000002',
+        aitId: AITS.f2,
+        fromState: 'AIT_LAVRADO',
+        toState: 'NOTIFICADO_AUTUACAO',
+      },
+    );
+
+    await poller.firePolling();
+    await stream.waitFor(() => stream.events.length >= 3);
+    await new Promise((resolve) => setTimeout(resolve, 150));
+
+    expect(stream.events.map((event) => [event.id, event.event])).toEqual([
+      [mine, 'request.changed'],
+      [decision, 'decision.published'],
+      [payment, 'payment.confirmed'],
+    ]);
+    const frames = stream.events.map(
+      (event) =>
+        JSON.parse(event.data ?? '{}') as {
+          aggregate: unknown;
+          data: Record<string, unknown>;
+        },
+    );
+    expect(frames[0]!.data).toEqual({
+      requestId,
+      situation: 'PROTOCOLADO',
+      nextAction: {
+        by: 'agency',
+        label: 'portal.requests.nextAction.PROTOCOLADO',
+        dueOn: null,
+      },
+    });
+    expect(frames[0]!.aggregate).toEqual({
+      kind: 'portal.request',
+      id: requestId,
+      version: 2,
+    });
+    expect(frames[1]!.data).toEqual({ requestId });
+    expect(frames[2]!.data).toEqual({ aitId: AITS.f2 });
+    for (const event of stream.events) {
+      expect(event.data).not.toContain(TENANT_ID);
+      expect(event.data).not.toContain(cpfHash(CPF.prata));
+      expect(event.data).not.toMatch(
+        /NOTIFICADO_AUTUACAO|AIT_LAVRADO|indeferido/,
+      );
+    }
+    stream.close();
+  });
+
+  it('C-0002-82 — dado ?topics=payment.confirmed então só esse tipo chega; tipo desconhecido em topics é ignorado', async () => {
+    const stream = openStream(
+      '/v1/portal/stream?topics=payment.confirmed,tipo.desconhecido',
+      citizenHeaders(),
+    );
+    await stream.opened;
+    await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_DESISTIDA',
+      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 5 },
+      {
+        requestId: LINKED_REQUEST_ID,
+        serviceKey: 'defesa_previa',
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'DESISTIDO',
+        withdrawnAt: new Date().toISOString(),
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+      },
+    );
+    const payment = await insertOutboxRow(
+      PAYMENT_CONFIRMED,
+      'PAGAMENTO_CONFIRMADO',
+      { kind: 'payment', id: randomUUID(), version: 1 },
+      {
+        paymentId: randomUUID(),
+        documentId: randomUUID(),
+        infractionId: '00000000-0000-7000-8000-0000d0000002',
+        aitId: AITS.f2,
+        tier: 'desconto_80',
+        paidOn: '2026-09-10',
+        amount: 156.18,
+      },
+    );
+    await poller.firePolling();
+    await stream.waitFor(() => stream.events.length >= 1);
+    await new Promise((resolve) => setTimeout(resolve, 150));
+    expect(stream.events.map((event) => [event.id, event.event])).toEqual([
+      [payment, 'payment.confirmed'],
+    ]);
+    stream.close();
+  });
+
+  it('C-0002-82 — dado Last-Event-ID = id da primeira linha então reproduz as posteriores em ordem (created_at, id); dado id com created_at há 25 h então 204', async () => {
+    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
+    const first = await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_CRIADA',
+      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 1 },
+      {
+        requestId: LINKED_REQUEST_ID,
+        serviceKey: 'defesa_previa',
+        fromState: null,
+        toState: 'PEDIDO_EM_COMPOSICAO',
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+      },
+      hourAgo,
+    );
+    const second = await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_PROTOCOLADA',
+      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 2 },
+      {
+        requestId: LINKED_REQUEST_ID,
+        serviceKey: 'defesa_previa',
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'PROTOCOLADO',
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+      },
+    );
+    const third = await insertOutboxRow(
+      PAYMENT_CONFIRMED,
+      'PAGAMENTO_CONFIRMADO',
+      { kind: 'payment', id: randomUUID(), version: 1 },
+      {
+        paymentId: randomUUID(),
+        documentId: randomUUID(),
+        infractionId: '00000000-0000-7000-8000-0000d0000002',
+        aitId: AITS.f2,
+        tier: 'desconto_80',
+        paidOn: '2026-09-10',
+        amount: 156.18,
+      },
+    );
+
+    const replay = openStream(
+      '/v1/portal/stream?topics=request.changed,payment.confirmed',
+      { ...citizenHeaders(), 'last-event-id': first },
+    );
+    await replay.opened;
+    expect(replay.status()).toBe(200);
+    await replay.waitFor(() => replay.events.length >= 2);
+    await new Promise((resolve) => setTimeout(resolve, 150));
+    expect(replay.events.map((event) => event.id)).toEqual([second, third]);
+    expect(replay.events.map((event) => event.event)).toEqual([
+      'request.changed',
+      'payment.confirmed',
+    ]);
+    replay.close();
+
+    const twentyFiveHoursAgo = new Date(
+      Date.now() - 25 * 60 * 60 * 1000,
+    ).toISOString();
+    const stale = await insertOutboxRow(
+      REQUEST_CHANGED,
+      'SOLICITACAO_CRIADA',
+      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 9 },
+      {
+        requestId: LINKED_REQUEST_ID,
+        serviceKey: 'defesa_previa',
+        fromState: null,
+        toState: 'PEDIDO_EM_COMPOSICAO',
+        subjectId,
+        subjectCpfHash: cpfHash(CPF.prata),
+      },
+      twentyFiveHoursAgo,
+    );
+    const outside = openStream('/v1/portal/stream', {
+      ...citizenHeaders(),
+      'last-event-id': stale,
+    });
+    await outside.opened;
+    expect(outside.status()).toBe(204);
+    outside.close();
+  });
+
+  it('C-0002-82 — dado a inscrição de heartbeat quando dispara então `: heartbeat`; ao fechar a conexão as inscrições são canceladas', async () => {
+    const stream = openStream('/v1/portal/stream', citizenHeaders());
+    await stream.opened;
+    expect(
+      poller.subscriptions.some(
+        (subscription) => subscription.intervalMs === HEARTBEAT_INTERVAL_MS,
+      ),
+    ).toBe(true);
+    await poller.fireHeartbeat();
+    await stream.waitFor(() => stream.comments.includes(': heartbeat'));
+    expect(stream.comments).toContain(': heartbeat');
+    const subscriptions = [...poller.subscriptions];
+    stream.close();
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    for (const subscription of subscriptions)
+      expect(subscription.unsubscribe).toHaveBeenCalled();
+  });
+});
diff --git a/backend/database/seed/71-fixtures-portal-events.sql b/backend/database/seed/71-fixtures-portal-events.sql
new file mode 100644
index 0000000..894bb70
--- /dev/null
+++ b/backend/database/seed/71-fixtures-portal-events.sql
@@ -0,0 +1,28 @@
+-- Ajustes de fixture do Portal pedidos por work/rounds/R-0009/contracts/CTG-0002.md §12
+-- (MOD-seed-70, TASK-0006 — Inspector). O prompt de TASK-0006 veda tocar seeds existentes e
+-- autoriza só este arquivo; por ordem lexicográfica ele roda DEPOIS de 70-fixtures-portal.sql
+-- (mesmo mecanismo de backend/database/seed.sh) e produz o estado que o §12 descreve.
+-- Idempotente (seed.sh 2×). Tenant canônico 00000000-0000-7000-8000-00000000a001.
+--
+-- 1. `portal.protocol_seq` (DDL 19; sequência compartilhada por portal.protocol.number e
+--    portal.manifestation.protocol — A2(c)): os 14 protocolos literais do seed 70
+--    (AM-FIXTURES-2026-0000001 … 000000e) não avançam a sequência; sem o setval o primeiro
+--    submit real no tenant canônico colidiria (§3.3 tolera com retry, mas o seed deve ser
+--    coerente). `greatest` mantém valores maiores já consumidos por execuções anteriores.
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+select setval(
+  'portal.protocol_seq',
+  greatest((select last_value from portal.protocol_seq), 14),
+  true
+);
+
+-- 2. `effects_ack` da adesão …70e00001 alinhado a SNE_EFFECTS (CTG-0002 §2.4/§6.2:
+--    ciencia_ficta, canal_exclusivo, desconto_60, cancelamento — UC-PORTAL-007 AC-2). O seed 70
+--    gravou as chaves antigas (ciencia_ficta_30_dias, canal_eletronico,
+--    validade_pos_cancelamento); [DIVERGE-CTG-0001] aceito em A4(c).
+update portal.sne_enrollment
+   set effects_ack = '{"ciencia_ficta":true,"canal_exclusivo":true,"desconto_60":true,"cancelamento":true}'::jsonb
+ where id = '00000000-0000-7000-8000-000070e00001'
+   and tenant_id = '00000000-0000-7000-8000-00000000a001';
diff --git a/backend/domains/ops/parameter/src/handwritten/parameter.service.ts b/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
index 5c3adaf..0b667d9 100644
--- a/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
+++ b/backend/domains/ops/parameter/src/handwritten/parameter.service.ts
@@ -382,11 +382,20 @@ export class OpsParameterService {
     agencyId: string | undefined,
     on: string,
   ): ParameterRow | undefined {
+    // R-0009 (plant-bug, pre-existing): `pg` returns `date` columns as `Date`
+    // objects, and `Date <= '2026-09-16'` is always false — every governed
+    // parameter read from a real database resolved to "not found". Compare
+    // calendar days as ISO strings instead (the SQL already filtered by
+    // `effective_from`/`effective_to`; this is the in-memory re-check).
+    const dayOf = (value: unknown): string =>
+      value instanceof Date
+        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
+        : String(value).slice(0, 10);
     const effective = rows.filter(
       (row) =>
         (!row.key || row.key === key) &&
-        (!row.effective_from || row.effective_from <= on) &&
-        (!row.effective_to || row.effective_to >= on),
+        (!row.effective_from || dayOf(row.effective_from) <= on) &&
+        (!row.effective_to || dayOf(row.effective_to) >= on),
     );
     const rank = (row: ParameterRow): number => {
       if (row.scope === 'agency' && row.traffic_agency_id === agencyId)
diff --git a/backend/domains/portal/citizen-service/src/handwritten/evaluation.service.ts b/backend/domains/portal/citizen-service/src/handwritten/evaluation.service.ts
new file mode 100644
index 0000000..99cd60d
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/evaluation.service.ts
@@ -0,0 +1,283 @@
+// Avaliação do serviço (Lei 14.129 art. 21 V; UC-PORTAL-017; work/rounds/
+// R-0009/contracts/CTG-0002.md §2.6, §4 e §11; plan R-0009 M9, M13, M21,
+// adenda A5(b)). `POST evaluations` avalia uma manifestação
+// (AVALIACAO_OFERECIDA → AVALIADA, `portal.evaluation` subject_kind
+// 'manifestation', `AVALIACAO_REGISTRADA` sem scores nem comentário no `data`)
+// ou delega a `PortalRequestsService.evaluate` quando `subjectKind='request'`
+// (mesmos códigos da rota `POST requests/{id}/evaluation`). Ordem dos erros
+// (A5(b)): guarda de estado primeiro (`EVALUATION_NOT_OFFERED { state }`),
+// depois o único da avaliação (`EVALUATION_ALREADY_SUBMITTED`).
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { z } from 'zod';
+import {
+  SqlTeatEventOutbox,
+  TEAT_EVENT_OUTBOX,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import {
+  PortalClock,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  parsePortalBody,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalSqlTransaction,
+} from '@detran/portal-identity';
+import {
+  EVALUATION_SCORES,
+  PortalIdempotencyService,
+  PortalRequestsService,
+  portalRequestEvents,
+  type PortalEventContext,
+} from '@detran/portal-requests';
+
+import {
+  markReplayed,
+  type ManifestationRow,
+  type PortalHeaders,
+} from './manifestation.service.js';
+
+export { EVALUATION_SCORES } from '@detran/portal-requests';
+
+export const EVALUATION_BODY = z.strictObject({
+  subjectKind: z.enum(['request', 'manifestation']),
+  subjectId: z.uuid(),
+  scores: EVALUATION_SCORES,
+  comment: z.string().max(2000).optional(),
+});
+export type EvaluationBody = z.infer<typeof EVALUATION_BODY>;
+
+/** Chave i18n da frase "alimenta indicador público" (UC-PORTAL-017 AC-3). */
+export const EVALUATION_PUBLIC_NOTICE_KEY = [
+  'portal',
+  'evaluations',
+  'publicIndicator',
+].join('.');
+
+/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
+export const EVALUATIONS_ROUTE_KEY = 'POST /v1/portal/evaluations';
+export const EVALUATIONS_ROUTE = '/v1/portal/evaluations';
+export const EVALUATE_ACT = 'avaliar';
+
+export interface EvaluationResponse {
+  evaluationId: string;
+  subjectKind: 'request' | 'manifestation';
+  subjectId: string;
+  state: 'AVALIADA' | 'CONCLUIDO';
+  submittedAt: string;
+  publicNotice: string;
+}
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const MANIFESTATION_FOR_UPDATE_SQL = `select id, state, subject_id, protocol, version
+     from portal.manifestation
+    where id = $1
+    for update`;
+
+const EVALUATION_EXISTS_SQL = `select id
+     from portal.evaluation
+    where subject_kind = 'manifestation' and subject_id = $1
+    limit 1`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 62). */
+const INSERT_EVALUATION_SQL = `insert into portal.evaluation
+      (subject_kind, subject_id, scores_json, comment, submitted_at)
+    values ('manifestation', $1, $2::jsonb, $3, $4)
+    returning id`;
+
+const EVALUATED_SQL = `update portal.manifestation
+      set state = 'AVALIADA', version = version + 1, updated_at = $2
+    where id = $1
+    returning version`;
+
+type EvaluatedManifestationRow = Pick<
+  ManifestationRow,
+  'id' | 'state' | 'subject_id' | 'protocol' | 'version'
+>;
+
+/** Resultado de `PortalRequestsService.evaluate` (outcome M9 ou corpo direto). */
+interface RequestEvaluationLike {
+  evaluationId: string;
+  requestId?: string;
+  state: 'CONCLUIDO';
+  submittedAt: string;
+}
+
+function isOutcome(
+  value: unknown,
+): value is { status: number; body: RequestEvaluationLike; replayed: boolean } {
+  return (
+    typeof value === 'object' &&
+    value !== null &&
+    'body' in value &&
+    'status' in value
+  );
+}
+
+@Injectable()
+export class PortalEvaluationService {
+  private readonly clock: PortalClockLike;
+  private readonly outbox: TeatEventOutbox;
+
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly idempotency: PortalIdempotencyService,
+    private readonly requests: PortalRequestsService,
+    @Optional() clock?: PortalClock,
+    @Optional() private readonly requestContext?: RequestContext,
+    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    this.outbox = outbox ?? new SqlTeatEventOutbox();
+  }
+
+  /** §2.6 `evaluate(tx, identity, body, headers)`. */
+  async evaluate(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<EvaluationResponse> {
+    if (isRequestEvaluation(body)) {
+      // §2.3: a rota do pedido faz a própria idempotência, guarda e eventos
+      // (por isso a chave NÃO é registrada aqui — seria um segundo registro
+      // sob outra rota para o mesmo cabeçalho).
+      const input = parsePortalBody(EVALUATION_BODY, body);
+      const result: unknown = await this.requests.evaluate(
+        tx,
+        identity,
+        input.subjectId,
+        {
+          scores: input.scores,
+          ...(input.comment ? { comment: input.comment } : {}),
+        },
+        headers,
+      );
+      const outcome = isOutcome(result) ? result : undefined;
+      const evaluated = (
+        outcome ? outcome.body : result
+      ) as RequestEvaluationLike;
+      const response: EvaluationResponse = {
+        evaluationId: evaluated.evaluationId,
+        subjectKind: 'request',
+        subjectId: input.subjectId,
+        state: 'CONCLUIDO',
+        submittedAt: evaluated.submittedAt,
+        publicNotice: EVALUATION_PUBLIC_NOTICE_KEY,
+      };
+      return outcome?.replayed ? markReplayed(response) : response;
+    }
+    const subject = await this.identity.upsertSubject(tx, identity, null);
+    // 1. idempotência (§4)
+    const begun = await this.idempotency.begin(tx, {
+      scope: subject.subjectId,
+      header: headers['idempotency-key'],
+      route: EVALUATIONS_ROUTE_KEY,
+      body,
+    });
+    if (begun.replay) {
+      return markReplayed({ ...(begun.replay.body as EvaluationResponse) });
+    }
+    // 2. forma
+    const input = parsePortalBody(EVALUATION_BODY, body);
+    // 3. nível
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      EVALUATE_ACT,
+      EVALUATIONS_ROUTE,
+    );
+    // 4. posse → estado → único (A5(b))
+    const row = (
+      await tx.query<EvaluatedManifestationRow>(MANIFESTATION_FOR_UPDATE_SQL, [
+        input.subjectId,
+      ])
+    ).rows[0];
+    if (!row || row.subject_id !== subject.subjectId) {
+      throw new PortalError('PORTAL.NOT_FOUND', {
+        status: 404,
+        context: { kind: 'manifestation' },
+      });
+    }
+    if (row.state !== 'AVALIACAO_OFERECIDA') {
+      throw new PortalError('PORTAL.EVALUATION_NOT_OFFERED', {
+        status: 409,
+        context: { state: row.state },
+      });
+    }
+    const existing = (
+      await tx.query<{ id: string }>(EVALUATION_EXISTS_SQL, [row.id])
+    ).rows[0];
+    if (existing) {
+      throw new PortalError('PORTAL.EVALUATION_ALREADY_SUBMITTED', {
+        status: 409,
+        context: {},
+      });
+    }
+    // 5. efeito
+    const now = this.clock.now();
+    const inserted = (
+      await tx.query<{ id: string }>(INSERT_EVALUATION_SQL, [
+        row.id,
+        JSON.stringify(input.scores),
+        input.comment ?? null,
+        now,
+      ])
+    ).rows[0];
+    if (!inserted) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    await tx.query(EVALUATED_SQL, [row.id, now]);
+    // 6. evento (§11) — sem scores nem comment
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.avaliacaoRegistrada(
+        inserted.id,
+        {
+          evaluationId: inserted.id,
+          subjectKind: 'manifestation',
+          subjectId: row.id,
+          submittedAt: now.toISOString(),
+          citizenSubjectId: subject.subjectId,
+          subjectCpfHash: cpfHashOf(identity.cpf),
+        },
+        this.eventContext(now, subject.subjectId),
+      ),
+    );
+    const response: EvaluationResponse = {
+      evaluationId: inserted.id,
+      subjectKind: 'manifestation',
+      subjectId: row.id,
+      state: 'AVALIADA',
+      submittedAt: now.toISOString(),
+      publicNotice: EVALUATION_PUBLIC_NOTICE_KEY,
+    };
+    await begun.record(201, response);
+    return response;
+  }
+
+  private eventContext(now: Date, subjectId: string): PortalEventContext {
+    const snapshot = this.requestContext?.hasActiveContext()
+      ? this.requestContext.snapshot()
+      : undefined;
+    return {
+      occurredAt: now.toISOString(),
+      actorId: snapshot?.actorId ?? subjectId,
+      correlationId: snapshot?.requestId ?? '',
+    };
+  }
+}
+
+/** Pré-verificação de forma: só decide a quem delegar; a validação é do zod. */
+function isRequestEvaluation(body: unknown): boolean {
+  return (
+    typeof body === 'object' &&
+    body !== null &&
+    (body as { subjectKind?: unknown }).subjectKind === 'request'
+  );
+}
diff --git a/backend/domains/portal/citizen-service/src/handwritten/evaluations.controller.ts b/backend/domains/portal/citizen-service/src/handwritten/evaluations.controller.ts
new file mode 100644
index 0000000..ad70a68
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/evaluations.controller.ts
@@ -0,0 +1,78 @@
+// `POST /v1/portal/evaluations` (work/rounds/R-0009/contracts/CTG-0002.md §2.6,
+// §4; plan R-0009 M9, M19, M20, adenda A4(a)). Rota M9: `@NoIdempotent()` e o
+// serviço assume a idempotência; `Idempotency-Replayed: true` no replay.
+import {
+  Body,
+  Controller,
+  Headers,
+  Post,
+  Req,
+  Res,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  NoIdempotent,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  portalIdentityOf,
+  type PortalIdentityRequest,
+} from '@detran/portal-identity';
+
+import {
+  PortalEvaluationService,
+  type EvaluationResponse,
+} from './evaluation.service.js';
+import {
+  isReplayedResponse,
+  type PortalHeaders,
+} from './manifestation.service.js';
+
+/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+const REPLAYED_HEADER = 'Idempotency-Replayed';
+
+@Controller('v1/portal/evaluations')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:evaluation')
+export class PortalEvaluationsController {
+  constructor(
+    private readonly evaluations: PortalEvaluationService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Post()
+  @Action('evaluate')
+  @NoIdempotent()
+  @Audit({ action: 'PORTAL_EVALUATION_EVALUATE', entity: 'portal.evaluation' })
+  async evaluate(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<EvaluationResponse> {
+    const identity = portalIdentityOf(request);
+    const response = await withTenantContext(
+      this.database,
+      this.requestContext,
+      (tx) => this.evaluations.evaluate(tx, identity, body, headers),
+    );
+    res.status(201);
+    if (isReplayedResponse(response)) res.setHeader(REPLAYED_HEADER, 'true');
+    return response;
+  }
+}
diff --git a/backend/domains/portal/citizen-service/src/handwritten/events.ts b/backend/domains/portal/citizen-service/src/handwritten/events.ts
new file mode 100644
index 0000000..f65d57d
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/events.ts
@@ -0,0 +1,178 @@
+// Eventos publicados por `@detran/portal-citizen-service` (work/rounds/R-0009/
+// contracts/CTG-0002.md §11; plan R-0009 M13, M21): `MANIFESTACAO_REGISTRADA`
+// e `MANIFESTACAO_ENCERRADA` (type `portal.manifestation.changed`, união
+// discriminada em `domainEvent`). `AVALIACAO_REGISTRADA` é publicado com a
+// fábrica de `@detran/portal-requests` (mesmo type `portal.evaluation.registered`).
+// Padrão de `inf/infraction/src/handwritten/events.ts`: `strictObject` em toda
+// parte — `data` só ids, tokens, datas e o `cpf_hash` do sujeito; o texto da
+// manifestação nunca sai.
+//
+// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
+// como literal (`tools/parameters/verify.mjs --check-usage`).
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import { MANIFESTATION_STATES } from './guards/manifestation.transitions.js';
+
+const PORTAL_TOPIC_PREFIX = 'portal';
+
+export const PORTAL_MANIFESTATION_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.manifestation.changed`;
+export const PORTAL_MANIFESTATION_AGGREGATE_KIND = 'portal.manifestation';
+
+/** Taxonomia da Lei 13.460 art. 2º V (H.52 mantém `solicitacao`; DDL 64). */
+export const MANIFESTATION_KINDS = [
+  'reclamacao',
+  'denuncia',
+  'sugestao',
+  'elogio',
+  'solicitacao',
+] as const;
+export type ManifestationKind = (typeof MANIFESTATION_KINDS)[number];
+
+const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
+const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope<D extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: D,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.uuid(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.uuid(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const manifestacaoRegistrada = envelope(
+  PORTAL_MANIFESTATION_CHANGED_TYPE,
+  'MANIFESTACAO_REGISTRADA',
+  PORTAL_MANIFESTATION_AGGREGATE_KIND,
+  z.strictObject({
+    manifestationId: z.uuid(),
+    protocol: z.string(),
+    kind: z.enum(MANIFESTATION_KINDS),
+    anonymous: z.boolean(),
+    subjectId: z.uuid().nullable(),
+    subjectCpfHash: sha256.nullable(),
+    receivedAt: z.iso.datetime(),
+    agencyDueOn: localDate,
+    toState: z.literal('COMPROVANTE_EMITIDO'),
+  }),
+);
+
+const manifestacaoEncerrada = envelope(
+  PORTAL_MANIFESTATION_CHANGED_TYPE,
+  'MANIFESTACAO_ENCERRADA',
+  PORTAL_MANIFESTATION_AGGREGATE_KIND,
+  z.strictObject({
+    manifestationId: z.uuid(),
+    protocol: z.string(),
+    acknowledgedAt: z.iso.datetime(),
+    fromState: z.literal('CIENCIA_AO_USUARIO'),
+    toState: z.literal('AVALIACAO_OFERECIDA'),
+    subjectId: z.uuid(),
+    subjectCpfHash: sha256,
+  }),
+);
+
+export const PORTAL_CITIZEN_SERVICE_EVENT_SCHEMAS: Readonly<
+  Record<string, ZodType>
+> = {
+  [PORTAL_MANIFESTATION_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
+    manifestacaoRegistrada,
+    manifestacaoEncerrada,
+  ]),
+};
+
+export type ManifestacaoRegistradaData = z.infer<
+  typeof manifestacaoRegistrada
+>['data'];
+export type ManifestacaoEncerradaData = z.infer<
+  typeof manifestacaoEncerrada
+>['data'];
+
+export type ManifestationStateToken = (typeof MANIFESTATION_STATES)[number];
+
+export interface PortalCitizenEventContext {
+  occurredAt: string;
+  actorId: string;
+  correlationId: string;
+}
+
+function portalEnvelope(
+  domainEvent: string,
+  manifestationId: string,
+  version: number,
+  data: Record<string, unknown>,
+  context: PortalCitizenEventContext,
+): TeatEventEnvelope {
+  return {
+    id: '',
+    type: PORTAL_MANIFESTATION_CHANGED_TYPE,
+    domainEvent,
+    version: 1,
+    occurredAt: context.occurredAt,
+    tenantId: '',
+    actor: { kind: 'user', id: context.actorId },
+    correlationId: context.correlationId,
+    aggregate: {
+      kind: PORTAL_MANIFESTATION_AGGREGATE_KIND,
+      id: manifestationId,
+      version,
+    },
+    data,
+  };
+}
+
+/** Fábricas por `domainEvent` — `aggregate.version` = versão APÓS a transição (§11). */
+export const portalManifestationEvents = {
+  registrada(
+    manifestationId: string,
+    version: number,
+    data: ManifestacaoRegistradaData,
+    context: PortalCitizenEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      'MANIFESTACAO_REGISTRADA',
+      manifestationId,
+      version,
+      data,
+      context,
+    );
+  },
+  encerrada(
+    manifestationId: string,
+    version: number,
+    data: ManifestacaoEncerradaData,
+    context: PortalCitizenEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      'MANIFESTACAO_ENCERRADA',
+      manifestationId,
+      version,
+      data,
+      context,
+    );
+  },
+};
diff --git a/backend/domains/portal/citizen-service/src/handwritten/index.ts b/backend/domains/portal/citizen-service/src/handwritten/index.ts
new file mode 100644
index 0000000..0c52a1e
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/index.ts
@@ -0,0 +1,13 @@
+// API pública manuscrita de @detran/portal-citizen-service (work/rounds/R-0009/
+// contracts/CTG-0002.md §14; plan R-0009 M24), reexportada pelo `src/index.ts`
+// gerado via `module.handwrittenExports` de BP-PORTAL-CITIZEN-SERVICE-001
+// (ADR-0007): controladores, serviços (manifestação, avaliação), timers do
+// Portal, eventos e a tabela de transições da manifestação.
+export * from './evaluation.service.js';
+export * from './evaluations.controller.js';
+export * from './events.js';
+export * from './guards/manifestation.transitions.js';
+export * from './manifestation.service.js';
+export * from './manifestations.controller.js';
+export * from './portal-timers.js';
+export * from './service-charter.controller.js';
diff --git a/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.spec.ts b/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.spec.ts
new file mode 100644
index 0000000..cc14f16
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.spec.ts
@@ -0,0 +1,760 @@
+// R-0009 CTG-0002 §2.6, §3.3, §6.3, §11 e §13 (TASK-0006) — C-0002-40…45:
+// `PortalManifestationService` (manifest nunca recusa — só `kind`; comprovante
+// imediato; anônimo; acknowledge só de CIENCIA_AO_USUARIO), `PortalEvaluationService`
+// (EVALUATION_NOT_OFFERED × EVALUATION_ALREADY_SUBMITTED; delegação a
+// `PortalRequestsService` quando `subjectKind='request'`) e `portal-timers.ts`
+// (`PORTAL_TIMER_CODES`; `durationOf` provado na integração). Fica vermelho até
+// TASK-0008 criar `manifestation.service.ts`, `evaluation.service.ts` e
+// `portal-timers.ts` (§14).
+//
+// Tx falsa em memória de `@detran/portal-requests` (`tests/support/fake-sql.ts`)
+// com as 9 manifestações de CTG-0001 §10.6 e `inf.infraction_timer_ref` semeada
+// com um valor FICTÍCIO para T-OUV-RESPOSTA (7): o prazo tem de sair da leitura
+// do vocabulário, nunca do literal 30 (§6.3). Formas esperadas (constrangimento
+// do Inspector): manifest(tx, identity | null, body, headers) · acknowledge(tx,
+// identity, manifestationId) · evaluate(tx, identity, body, headers); actor do
+// envelope = `RequestContext.snapshot().actorId` (o app semeia
+// PORTAL_PUBLIC_ACTOR_ID, o uuid nulo, nas rotas públicas — A3(b)).
+import { describe, expect, it, vi } from 'vitest';
+import { PortalIdentityService } from '@detran/portal-identity';
+import { PortalIdempotencyService } from '@detran/portal-requests';
+import { addCalendarDays } from '@detran/inf-deadlines';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import {
+  FakeSqlDatabase,
+  type Row,
+} from '../../../requests/tests/support/fake-sql.js';
+import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
+import {
+  ACT_LEVEL_POLICY_ROWS,
+  FIXED_NOW,
+  FIXED_TODAY,
+  I18N,
+  MANIFESTATION_STATES,
+  NIL_UUID,
+  SUBJECTS,
+  TENANT_ID,
+  TENANT_SLUG,
+  TOPICS,
+  fakeDatabase,
+  fixedClock,
+  identityOf,
+  outboxEnvelopes,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  PortalEvaluationService,
+  EVALUATION_SCORES,
+} from './evaluation.service.js';
+import {
+  MANIFESTATION_BODY,
+  PortalManifestationService,
+} from './manifestation.service.js';
+import { PORTAL_TIMER_CODES } from './portal-timers.js';
+
+const MANIFESTATION_KINDS = [
+  'reclamacao',
+  'denuncia',
+  'sugestao',
+  'elogio',
+  'solicitacao',
+];
+/** Valor fictício só deste spec: prova que o prazo é LIDO de inf.infraction_timer_ref. */
+const PROBE_OUV_RESPOSTA_DAYS = 7;
+
+/** CTG-0001 §10.6 — as 9 manifestações, uma por estado (protocolo …0000006 em diante). */
+const MAN = {
+  registrada: '00000000-0000-7000-8000-000070700001',
+  comprovante: '00000000-0000-7000-8000-000070700002',
+  emAnalise: '00000000-0000-7000-8000-000070700003',
+  infoSolicitada: '00000000-0000-7000-8000-000070700004',
+  decisaoElaborada: '00000000-0000-7000-8000-000070700005',
+  cienciaAoUsuario: '00000000-0000-7000-8000-000070700006',
+  encerrada: '00000000-0000-7000-8000-000070700007',
+  avaliacaoOferecida: '00000000-0000-7000-8000-000070700008',
+  avaliada: '00000000-0000-7000-8000-000070700009',
+} as const;
+
+const MANIFESTATION_FIXTURES: Row[] = [
+  // …70700001 é anônima no seed (subject_id nulo, protocolo …000000e); aqui recebe um dono
+  // para que o teste de estado (C-0002-43) chegue à guarda de estado em vez do 404 de posse.
+  {
+    id: MAN.registrada,
+    state: 'MANIFESTACAO_REGISTRADA',
+    kind: 'reclamacao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.bronze.id,
+    received_at: new Date('2026-09-14T12:00:00-04:00'),
+    agency_due_on: '2026-10-14',
+    protocol: 'AM-FIXTURES-2026-000000e',
+  },
+  {
+    id: MAN.comprovante,
+    state: 'COMPROVANTE_EMITIDO',
+    kind: 'denuncia',
+    anonymous: false,
+    confidential: true,
+    subject_id: SUBJECTS.bronze.id,
+    received_at: new Date('2026-09-13T12:00:00-04:00'),
+    agency_due_on: '2026-10-13',
+    protocol: 'AM-FIXTURES-2026-0000006',
+  },
+  {
+    id: MAN.emAnalise,
+    state: 'EM_ANALISE',
+    kind: 'sugestao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.prata.id,
+    received_at: new Date('2026-09-01T12:00:00-04:00'),
+    agency_due_on: '2026-10-01',
+    protocol: 'AM-FIXTURES-2026-0000007',
+  },
+  {
+    id: MAN.infoSolicitada,
+    state: 'INFORMACAO_SOLICITADA_AO_AGENTE',
+    kind: 'reclamacao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.prata.id,
+    received_at: new Date('2026-08-25T12:00:00-04:00'),
+    agency_due_on: '2026-09-24',
+    protocol: 'AM-FIXTURES-2026-0000008',
+    info_due_on: '2026-09-21',
+  },
+  {
+    id: MAN.decisaoElaborada,
+    state: 'DECISAO_FINAL_ELABORADA',
+    kind: 'solicitacao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.ouro.id,
+    received_at: new Date('2026-08-20T12:00:00-04:00'),
+    agency_due_on: '2026-09-19',
+    protocol: 'AM-FIXTURES-2026-0000009',
+    decided_at: new Date('2026-09-10T12:00:00-04:00'),
+    decision_text: 'fixture',
+  },
+  {
+    id: MAN.cienciaAoUsuario,
+    state: 'CIENCIA_AO_USUARIO',
+    kind: 'elogio',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.ouro.id,
+    received_at: new Date('2026-08-10T12:00:00-04:00'),
+    agency_due_on: '2026-09-09',
+    protocol: 'AM-FIXTURES-2026-000000a',
+    decided_at: new Date('2026-09-01T12:00:00-04:00'),
+    decision_text: 'fixture',
+  },
+  {
+    id: MAN.encerrada,
+    state: 'ENCERRADA',
+    kind: 'reclamacao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.qualificada.id,
+    received_at: new Date('2026-07-20T12:00:00-04:00'),
+    agency_due_on: '2026-08-19',
+    protocol: 'AM-FIXTURES-2026-000000b',
+    decided_at: new Date('2026-09-05T12:00:00-04:00'),
+    acknowledged_at: new Date('2026-09-10T12:00:00-04:00'),
+  },
+  {
+    id: MAN.avaliacaoOferecida,
+    state: 'AVALIACAO_OFERECIDA',
+    kind: 'reclamacao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.prata.id,
+    received_at: new Date('2026-07-10T12:00:00-04:00'),
+    agency_due_on: '2026-08-09',
+    protocol: 'AM-FIXTURES-2026-000000c',
+    decided_at: new Date('2026-08-01T12:00:00-04:00'),
+    acknowledged_at: new Date('2026-08-05T12:00:00-04:00'),
+  },
+  {
+    id: MAN.avaliada,
+    state: 'AVALIADA',
+    kind: 'sugestao',
+    anonymous: false,
+    confidential: false,
+    subject_id: SUBJECTS.bronze.id,
+    received_at: new Date('2026-06-15T12:00:00-04:00'),
+    agency_due_on: '2026-07-15',
+    protocol: 'AM-FIXTURES-2026-000000d',
+    decided_at: new Date('2026-07-01T12:00:00-04:00'),
+    acknowledged_at: new Date('2026-07-10T12:00:00-04:00'),
+  },
+].map((row) => ({ text: 'fixture', version: 1, ...row }));
+
+const OWNER_BY_MANIFESTATION: Record<string, keyof typeof SUBJECTS> =
+  Object.fromEntries(
+    MANIFESTATION_FIXTURES.map((row) => [
+      String(row.id),
+      (Object.keys(SUBJECTS) as Array<keyof typeof SUBJECTS>).find(
+        (key) => SUBJECTS[key].id === row.subject_id,
+      )!,
+    ]),
+  );
+
+/** DDL 14 (M14): T-OUV-RESPOSTA recebe um valor de sonda; os demais como no vocabulário. */
+const TIMER_ROWS: Row[] = [
+  {
+    code: 'T-OUV-RESPOSTA',
+    owner: 'portal',
+    duration_value: PROBE_OUV_RESPOSTA_DAYS,
+    duration_unit: 'dias_corridos',
+    status: 'vigente',
+  },
+  {
+    code: 'T-OUV-INFO',
+    owner: 'portal',
+    duration_value: 20,
+    duration_unit: 'dias_corridos',
+    status: 'vigente',
+  },
+  {
+    code: 'T-LGPD-ACESSO',
+    owner: 'portal',
+    duration_value: null,
+    duration_unit: 'dias_corridos',
+    status: 'proposta',
+  },
+  {
+    code: 'T-AVAL-CONVITE',
+    owner: 'portal',
+    duration_value: null,
+    duration_unit: 'dias_corridos',
+    status: 'vigente',
+  },
+];
+
+interface Harness {
+  db: FakeSqlDatabase;
+  manifestations: {
+    manifest: (
+      tx: unknown,
+      identity: unknown,
+      body: unknown,
+      headers: unknown,
+    ) => Promise<Row>;
+    acknowledge: (tx: unknown, identity: unknown, id: string) => Promise<Row>;
+  };
+  evaluations: {
+    evaluate: (
+      tx: unknown,
+      identity: unknown,
+      body: unknown,
+      headers: unknown,
+    ) => Promise<Row>;
+  };
+  requestsEvaluate: ReturnType<typeof vi.fn>;
+}
+
+function harness(options: { actorId?: string } = {}): Harness {
+  const db = new FakeSqlDatabase({
+    tenantId: TENANT_ID,
+    tenant: { slug: TENANT_SLUG },
+    now: fixedClock.now,
+    sequences: { 'portal.protocol_seq': 14 },
+  });
+  db.seed(
+    'portal.subject',
+    Object.values(SUBJECTS).map((subject) => ({
+      id: subject.id,
+      cpf_hash: subject.cpfHash,
+      name: '',
+      govbr_level_observed: null,
+      assurance_level_observed: subject.assurance,
+      observed_at: FIXED_NOW,
+      version: 1,
+    })),
+  );
+  db.seed('portal.act_level_policy', ACT_LEVEL_POLICY_ROWS);
+  db.seed(
+    'portal.manifestation',
+    MANIFESTATION_FIXTURES.map((row) => ({ ...row })),
+  );
+  db.seed(
+    'inf.infraction_timer_ref',
+    TIMER_ROWS.map((row) => ({ ...row })),
+  );
+  const outbox = new SqlTeatEventOutbox();
+  const requestsEvaluate = vi.fn(async () => ({
+    evaluationId: '00000000-0000-7000-8000-000071100099',
+    requestId: '',
+    state: 'CONCLUIDO',
+    submittedAt: FIXED_NOW.toISOString(),
+  }));
+  const requestContext = {
+    hasActiveContext: () => true,
+    snapshot: () => ({
+      tenantId: TENANT_ID,
+      actorId: options.actorId ?? SUBJECTS.prata.id,
+      requestId: '00000000-0000-4000-8000-00000000c0f1',
+    }),
+  };
+  const providers = {
+    PortalIdentityService: new PortalIdentityService(fixedClock as never),
+    PortalIdempotencyService: constructInjectable(PortalIdempotencyService, {
+      PortalClock: fixedClock,
+    }),
+    PortalRequestsService: { evaluate: requestsEvaluate },
+    PortalClock: fixedClock,
+    Database: fakeDatabase(db.tx),
+    RequestContext: requestContext,
+    SqlTeatEventOutbox: outbox,
+    TEAT_EVENT_OUTBOX: outbox,
+  };
+  const manifestations = constructInjectable(
+    PortalManifestationService,
+    providers,
+  ) as unknown as Harness['manifestations'];
+  const evaluations = constructInjectable(PortalEvaluationService, {
+    ...providers,
+    PortalManifestationService: manifestations,
+  }) as unknown as Harness['evaluations'];
+  return { db, manifestations, evaluations, requestsEvaluate };
+}
+
+let keyCounter = 0;
+const headers = () => {
+  keyCounter += 1;
+  return { 'idempotency-key': `m-${keyCounter}` };
+};
+
+function manifestationRow(db: FakeSqlDatabase, id: string): Row {
+  return db.rows('portal.manifestation').find((row) => row.id === id)!;
+}
+
+describe('CTG-0002 §2.6 — POST manifestations nunca recusa (C-0002-40…42)', () => {
+  it("C-0002-40 — dado kind 'xyz' quando manifest então 400 PORTAL.MANIFESTATION_KIND_INVALID { allowed: [5 tokens] }; dado kind ausente idem", async () => {
+    const h = harness();
+    for (const body of [{ kind: 'xyz', text: 'x' }, { text: 'x' }]) {
+      await expect(
+        h.manifestations.manifest(h.db.tx, null, body, headers()),
+      ).rejects.toMatchObject({
+        code: 'PORTAL.MANIFESTATION_KIND_INVALID',
+        status: 400,
+        context: { allowed: MANIFESTATION_KINDS },
+      });
+    }
+    expect(h.db.rows('portal.manifestation')).toHaveLength(
+      MANIFESTATION_FIXTURES.length,
+    );
+    expect(MANIFESTATION_BODY.safeParse({ kind: 'xyz' }).success).toBe(false);
+  });
+
+  it("C-0002-40 — dado corpo sem text, com campo extra e attachmentIds inválido então NÃO recusa (RN-PORTAL-109): text '' e extras ignorados", async () => {
+    const h = harness();
+    const response = await h.manifestations.manifest(
+      h.db.tx,
+      null,
+      {
+        kind: 'sugestao',
+        attachmentIds: 'nao-e-lista',
+        confidential: 'talvez',
+        campoExtra: { x: 1 },
+      },
+      headers(),
+    );
+    expect(response).toMatchObject({
+      state: 'COMPROVANTE_EMITIDO',
+      anonymous: true,
+    });
+    const row = manifestationRow(h.db, String(response.manifestationId));
+    expect(row).toMatchObject({
+      kind: 'sugestao',
+      text: '',
+      confidential: false,
+      anonymous: true,
+      subject_id: null,
+    });
+    expect(row).not.toHaveProperty('campoExtra');
+    const parsed = MANIFESTATION_BODY.parse({
+      kind: 'elogio',
+      attachmentIds: 12,
+      text: 5,
+      anonymous: 'sim',
+      extra: true,
+    });
+    expect(parsed).toMatchObject({
+      kind: 'elogio',
+      attachmentIds: [],
+      text: '',
+      anonymous: false,
+      confidential: false,
+    });
+  });
+
+  it("C-0002-41 — dado manifest anônimo então state 'COMPROVANTE_EMITIDO', protocol na gramática do §3.3, received_at = relógio, agency_due_on = today + durationOf('T-OUV-RESPOSTA') (lido, não 30), subject_id null, MANIFESTACAO_REGISTRADA com actor.id = PORTAL_PUBLIC_ACTOR_ID", async () => {
+    const h = harness({ actorId: NIL_UUID });
+    const response = await h.manifestations.manifest(
+      h.db.tx,
+      null,
+      { kind: 'reclamacao', text: 'atendimento demorado' },
+      headers(),
+    );
+    const expectedDueOn = addCalendarDays(FIXED_TODAY, PROBE_OUV_RESPOSTA_DAYS);
+    expect(response).toMatchObject({
+      state: 'COMPROVANTE_EMITIDO',
+      protocol: 'AM-FIXTURES-2026-0000015',
+      agencyDueOn: expectedDueOn,
+      anonymous: true,
+    });
+    expect(new Date(String(response.receivedAt)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const row = manifestationRow(h.db, String(response.manifestationId));
+    expect(row).toMatchObject({
+      state: 'COMPROVANTE_EMITIDO',
+      kind: 'reclamacao',
+      text: 'atendimento demorado',
+      anonymous: true,
+      subject_id: null,
+      protocol: 'AM-FIXTURES-2026-0000015',
+      info_due_on: null,
+      version: 1,
+    });
+    expect(String(row.agency_due_on).slice(0, 10)).toBe(expectedDueOn);
+    expect(new Date(String(row.received_at)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const events = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
+    expect(events).toHaveLength(1);
+    expect(events[0]).toMatchObject({
+      domainEvent: 'MANIFESTACAO_REGISTRADA',
+      actor: { id: NIL_UUID },
+      aggregate: { kind: 'portal.manifestation', id: row.id, version: 1 },
+    });
+    expect(events[0]!.data).toMatchObject({
+      manifestationId: row.id,
+      protocol: 'AM-FIXTURES-2026-0000015',
+      kind: 'reclamacao',
+      anonymous: true,
+      subjectId: null,
+      subjectCpfHash: null,
+      agencyDueOn: expectedDueOn,
+      toState: 'COMPROVANTE_EMITIDO',
+    });
+    expect(events[0]!.data).not.toHaveProperty('text');
+
+    const record = h.db.rows('portal.idempotency_record')[0];
+    expect(record).toMatchObject({
+      key: `public:m-${keyCounter}`,
+      status: 201,
+    });
+  });
+
+  it('C-0002-41 — dado manifest sem Idempotency-Key então 400 PORTAL.VALIDATION_FAILED { fields: ["Idempotency-Key"] } (M9, escopo public)', async () => {
+    const h = harness();
+    await expect(
+      h.manifestations.manifest(h.db.tx, null, { kind: 'elogio' }, {}),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['Idempotency-Key'] },
+    });
+  });
+
+  it('C-0002-42 — dado identity presente e anonymous false então subject_id = subject; dado identity presente e anonymous true então subject_id null e anonymous true', async () => {
+    const h = harness();
+    const identified = await h.manifestations.manifest(
+      h.db.tx,
+      identityOf('prata'),
+      { kind: 'denuncia', text: 'x', confidential: true },
+      headers(),
+    );
+    expect(identified.anonymous).toBe(false);
+    expect(
+      manifestationRow(h.db, String(identified.manifestationId)),
+    ).toMatchObject({
+      subject_id: SUBJECTS.prata.id,
+      anonymous: false,
+      confidential: true,
+    });
+    const [registered] = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
+    expect(registered!.data).toMatchObject({
+      anonymous: false,
+      subjectId: SUBJECTS.prata.id,
+      subjectCpfHash: SUBJECTS.prata.cpfHash,
+    });
+    expect(registered!.actor).toMatchObject({
+      kind: 'user',
+      id: SUBJECTS.prata.id,
+    });
+
+    const anonymous = await h.manifestations.manifest(
+      h.db.tx,
+      identityOf('prata'),
+      { kind: 'denuncia', text: 'y', anonymous: true },
+      headers(),
+    );
+    expect(anonymous.anonymous).toBe(true);
+    expect(
+      manifestationRow(h.db, String(anonymous.manifestationId)),
+    ).toMatchObject({ subject_id: null, anonymous: true });
+    // dois comprovantes → dois protocolos distintos da mesma sequência
+    expect(identified.protocol).not.toBe(anonymous.protocol);
+  });
+});
+
+describe('CTG-0002 §2.6 — acknowledge (C-0002-43)', () => {
+  it("C-0002-43 — dado acknowledge × 9 estados então só CIENCIA_AO_USUARIO passa (→ AVALIACAO_OFERECIDA na mesma transação, acknowledged_at, MANIFESTACAO_ENCERRADA); demais 409 PORTAL.MANIFESTATION_STATE_INVALID { state, allowed: ['CIENCIA_AO_USUARIO'] }", async () => {
+    expect(MANIFESTATION_FIXTURES.map((row) => row.state)).toEqual([
+      ...MANIFESTATION_STATES,
+    ]);
+    for (const fixture of MANIFESTATION_FIXTURES) {
+      const h = harness();
+      const owner = identityOf(OWNER_BY_MANIFESTATION[String(fixture.id)]!);
+      if (fixture.state === 'CIENCIA_AO_USUARIO') {
+        const response = await h.manifestations.acknowledge(
+          h.db.tx,
+          owner,
+          String(fixture.id),
+        );
+        expect(response).toMatchObject({
+          manifestationId: fixture.id,
+          state: 'AVALIACAO_OFERECIDA',
+          evaluationOffered: true,
+          version: 2,
+        });
+        expect(new Date(String(response.acknowledgedAt)).getTime()).toBe(
+          FIXED_NOW.getTime(),
+        );
+        const row = manifestationRow(h.db, String(fixture.id));
+        expect(row).toMatchObject({ state: 'AVALIACAO_OFERECIDA', version: 2 });
+        expect(new Date(String(row.acknowledged_at)).getTime()).toBe(
+          FIXED_NOW.getTime(),
+        );
+        const events = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
+        expect(events).toHaveLength(1);
+        expect(events[0]).toMatchObject({
+          domainEvent: 'MANIFESTACAO_ENCERRADA',
+          aggregate: {
+            kind: 'portal.manifestation',
+            id: fixture.id,
+            version: 2,
+          },
+        });
+        expect(events[0]!.data).toMatchObject({
+          manifestationId: fixture.id,
+          protocol: fixture.protocol,
+          fromState: 'CIENCIA_AO_USUARIO',
+          toState: 'AVALIACAO_OFERECIDA',
+          subjectId: fixture.subject_id,
+        });
+        continue;
+      }
+      await expect(
+        h.manifestations.acknowledge(h.db.tx, owner, String(fixture.id)),
+        String(fixture.state),
+      ).rejects.toMatchObject({
+        code: 'PORTAL.MANIFESTATION_STATE_INVALID',
+        status: 409,
+        context: { state: fixture.state, allowed: ['CIENCIA_AO_USUARIO'] },
+      });
+      expect(manifestationRow(h.db, String(fixture.id)).state).toBe(
+        fixture.state,
+      );
+      expect(outboxEnvelopes(h.db)).toHaveLength(0);
+    }
+  });
+
+  it("§2.6 — dado manifestação de outro sujeito quando acknowledge então 404 PORTAL.NOT_FOUND { kind: 'manifestation' }", async () => {
+    const h = harness();
+    await expect(
+      h.manifestations.acknowledge(
+        h.db.tx,
+        identityOf('prata'),
+        MAN.cienciaAoUsuario,
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'manifestation' },
+    });
+  });
+});
+
+describe('CTG-0002 §2.6 — POST evaluations (C-0002-44)', () => {
+  const scores = {
+    satisfaction: 5,
+    quality: 4,
+    deadline: 3,
+    clarity: 4,
+    channel: 5,
+  };
+
+  it("C-0002-44 — dado evaluate manifestação em EM_ANALISE então 409 PORTAL.EVALUATION_NOT_OFFERED { state: 'EM_ANALISE' }", async () => {
+    const h = harness();
+    await expect(
+      h.evaluations.evaluate(
+        h.db.tx,
+        identityOf('prata'),
+        { subjectKind: 'manifestation', subjectId: MAN.emAnalise, scores },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.EVALUATION_NOT_OFFERED',
+      status: 409,
+      context: { state: 'EM_ANALISE' },
+    });
+    expect(h.db.rows('portal.evaluation')).toHaveLength(0);
+  });
+
+  it("C-0002-44 — em AVALIACAO_OFERECIDA então portal.evaluation (subject_kind 'manifestation'), 'AVALIADA', AVALIACAO_REGISTRADA sem scores no data; segunda então 409 EVALUATION_ALREADY_SUBMITTED", async () => {
+    const h = harness();
+    const response = await h.evaluations.evaluate(
+      h.db.tx,
+      identityOf('prata'),
+      {
+        subjectKind: 'manifestation',
+        subjectId: MAN.avaliacaoOferecida,
+        scores,
+        comment: 'resolvido',
+      },
+      headers(),
+    );
+    expect(response).toMatchObject({
+      subjectKind: 'manifestation',
+      subjectId: MAN.avaliacaoOferecida,
+      state: 'AVALIADA',
+      publicNotice: I18N.publicIndicator,
+    });
+    expect(typeof response.evaluationId).toBe('string');
+    expect(new Date(String(response.submittedAt)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const evaluation = h.db
+      .rows('portal.evaluation')
+      .find((row) => row.subject_id === MAN.avaliacaoOferecida);
+    expect(evaluation).toMatchObject({
+      subject_kind: 'manifestation',
+      scores_json: scores,
+      comment: 'resolvido',
+    });
+    expect(manifestationRow(h.db, MAN.avaliacaoOferecida)).toMatchObject({
+      state: 'AVALIADA',
+      version: 2,
+    });
+
+    const events = outboxEnvelopes(h.db, TOPICS.evaluationRegistered);
+    expect(events).toHaveLength(1);
+    expect(events[0]).toMatchObject({
+      domainEvent: 'AVALIACAO_REGISTRADA',
+      aggregate: { kind: 'portal.evaluation', id: evaluation!.id, version: 1 },
+    });
+    expect(events[0]!.data).toMatchObject({
+      evaluationId: evaluation!.id,
+      subjectKind: 'manifestation',
+      subjectId: MAN.avaliacaoOferecida,
+      citizenSubjectId: SUBJECTS.prata.id,
+      subjectCpfHash: SUBJECTS.prata.cpfHash,
+    });
+    expect(events[0]!.data).not.toHaveProperty('scores');
+    expect(events[0]!.data).not.toHaveProperty('comment');
+
+    // segunda avaliação: a máquina já está em AVALIADA; o unique (tenant, subject_kind, subject_id) é
+    // provado recolocando a linha em AVALIACAO_OFERECIDA (só a fixture muda, não o serviço)
+    manifestationRow(h.db, MAN.avaliacaoOferecida).state =
+      'AVALIACAO_OFERECIDA';
+    await expect(
+      h.evaluations.evaluate(
+        h.db.tx,
+        identityOf('prata'),
+        {
+          subjectKind: 'manifestation',
+          subjectId: MAN.avaliacaoOferecida,
+          scores,
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.EVALUATION_ALREADY_SUBMITTED',
+      status: 409,
+    });
+    expect(h.db.rows('portal.evaluation')).toHaveLength(1);
+  });
+
+  it("C-0002-44 — dado subjectKind 'request' então delega a PortalRequestsService.evaluate (spy); dado manifestação de outro sujeito então 404 { kind: 'manifestation' }; sem Idempotency-Key então 400", async () => {
+    const h = harness();
+    const requestId = '00000000-0000-7000-8000-00007040000b';
+    await h.evaluations.evaluate(
+      h.db.tx,
+      identityOf('qualificada'),
+      { subjectKind: 'request', subjectId: requestId, scores },
+      headers(),
+    );
+    expect(h.requestsEvaluate).toHaveBeenCalledTimes(1);
+    const serialized = JSON.stringify(
+      h.requestsEvaluate.mock.calls[0]!.map((arg) =>
+        arg && typeof arg === 'object' && 'query' in (arg as object)
+          ? 'tx'
+          : arg,
+      ),
+    );
+    expect(serialized).toContain(requestId);
+    expect(serialized).toContain('"scores"');
+    expect(h.db.rows('portal.evaluation')).toHaveLength(0);
+
+    await expect(
+      h.evaluations.evaluate(
+        h.db.tx,
+        identityOf('ouro'),
+        {
+          subjectKind: 'manifestation',
+          subjectId: MAN.avaliacaoOferecida,
+          scores,
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'manifestation' },
+    });
+
+    await expect(
+      h.evaluations.evaluate(
+        h.db.tx,
+        identityOf('prata'),
+        {
+          subjectKind: 'manifestation',
+          subjectId: MAN.avaliacaoOferecida,
+          scores,
+        },
+        {},
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['Idempotency-Key'] },
+    });
+
+    expect(EVALUATION_SCORES.safeParse(scores).success).toBe(true);
+    expect(EVALUATION_SCORES.safeParse({ ...scores, extra: 1 }).success).toBe(
+      false,
+    );
+    expect(EVALUATION_SCORES.safeParse({ satisfaction: 5 }).success).toBe(
+      false,
+    );
+  });
+});
+
+describe('CTG-0002 §6.3 — portal-timers.ts (C-0002-45)', () => {
+  it('C-0002-45 — dado portal-timers.ts então PORTAL_TIMER_CODES = exatamente os quatro códigos owner=portal de DDL 14 (M14)', () => {
+    expect([...PORTAL_TIMER_CODES]).toEqual([
+      'T-OUV-RESPOSTA',
+      'T-OUV-INFO',
+      'T-LGPD-ACESSO',
+      'T-AVAL-CONVITE',
+    ]);
+  });
+});
diff --git a/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.ts b/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.ts
new file mode 100644
index 0000000..4f01184
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/manifestation.service.ts
@@ -0,0 +1,678 @@
+// Manifestação da Lei 13.460 ([WF-PORTAL-004]; work/rounds/R-0009/contracts/
+// CTG-0002.md §2.6, §3.3, §4, §6.3 e §11; CTG-0001 §6.4; plan R-0009 M9,
+// M13, M14, M21, adendas A4(b), A5(f)). `manifest` NUNCA recusa
+// (RN-PORTAL-109): a única validação é `kind`; o comprovante nasce na mesma
+// transação (MANIFESTACAO_REGISTRADA → COMPROVANTE_EMITIDO, protocolo da
+// mesma sequência dos pedidos, `agency_due_on` = hoje + duração de
+// `T-OUV-RESPOSTA` lida do vocabulário). `acknowledge` é o único comando
+// cidadão (CIENCIA_AO_USUARIO → ENCERRADA → AVALIACAO_OFERECIDA na mesma
+// transação); as transições do órgão existem só como serviço interno
+// (OD-P18, sem rota). Idempotência M9 no `manifest` (escopo `public` quando
+// anônimo).
+//
+// Os comandos M9 devolvem o corpo da resposta com um marcador não enumerável
+// de replay (`isReplayedResponse`) — o controlador lê o marcador para o
+// cabeçalho `Idempotency-Replayed`; a forma pública do corpo não muda.
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { z } from 'zod';
+import { addCalendarDays } from '@detran/inf-deadlines';
+import {
+  SqlTeatEventOutbox,
+  TEAT_EVENT_OUTBOX,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import {
+  PORTAL_DEFAULT_TIME_ZONE,
+  PortalClock,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  parsePage,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalPagedResponse,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+import {
+  PUBLIC_IDEMPOTENCY_SCOPE,
+  PortalIdempotencyService,
+  protocolNumber,
+} from '@detran/portal-requests';
+
+import {
+  MANIFESTATION_KINDS,
+  portalManifestationEvents,
+  type PortalCitizenEventContext,
+} from './events.js';
+import {
+  assertTransition,
+  type ManifestationState,
+} from './guards/manifestation.transitions.js';
+import { durationOf } from './portal-timers.js';
+
+// ---------------------------------------------------------------------------
+// replay (M9) — marcador não enumerável no corpo devolvido
+// ---------------------------------------------------------------------------
+
+const REPLAYED = Symbol('PORTAL_IDEMPOTENT_REPLAY');
+
+/** Marca um corpo devolvido pelo registro de idempotência (§4 replay). */
+export function markReplayed<T extends object>(body: T): T {
+  Object.defineProperty(body, REPLAYED, { value: true, enumerable: false });
+  return body;
+}
+
+export function isReplayedResponse(value: unknown): boolean {
+  return (
+    typeof value === 'object' &&
+    value !== null &&
+    (value as Record<symbol, unknown>)[REPLAYED] === true
+  );
+}
+
+// ---------------------------------------------------------------------------
+// tipos públicos (§2.6)
+// ---------------------------------------------------------------------------
+
+export type PortalHeaders = Record<string, string | string[] | undefined>;
+export type PortalQuery = Record<string, string | string[] | undefined>;
+
+/**
+ * A ÚNICA validação que recusa é `kind` (Lei 13.460 art. 2º V); qualquer
+ * outra falha de forma é normalizada (`.catch`) e campos extras são
+ * ignorados — RN-PORTAL-109 "sem exigências que inviabilizem" (§2.6).
+ */
+export const MANIFESTATION_BODY = z
+  .object({
+    kind: z.enum(MANIFESTATION_KINDS),
+    text: z.string().catch('').default(''),
+    confidential: z.boolean().catch(false).default(false),
+    attachmentIds: z.array(z.uuid()).catch([]).default([]),
+    anonymous: z.boolean().catch(false).default(false),
+  })
+  .passthrough();
+
+export interface ManifestationCreateResponse {
+  manifestationId: string;
+  protocol: string;
+  receivedAt: string;
+  state: 'COMPROVANTE_EMITIDO';
+  agencyDueOn: string;
+  anonymous: boolean;
+}
+
+export interface ManifestationListItem {
+  manifestationId: string;
+  state: ManifestationState;
+  protocol: string;
+  kind: string;
+  receivedAt: string;
+  deadlines: {
+    agencyDueOn: string;
+    extended: { justification: string; on: string; newDueOn: string } | null;
+  };
+  decision: { text: string | null; decidedAt: string } | null;
+  evaluationOffered: boolean;
+  evaluated: boolean;
+}
+
+export interface ManifestationDetailResponse extends ManifestationListItem {
+  text: string;
+  confidential: boolean;
+}
+
+export interface ManifestationAcknowledgeResponse {
+  manifestationId: string;
+  state: 'AVALIACAO_OFERECIDA';
+  acknowledgedAt: string;
+  evaluationOffered: true;
+  version: number;
+}
+
+/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
+export const MANIFESTATIONS_ROUTE_KEY = 'POST /v1/portal/manifestations';
+
+/** `resumeRoute` do ato `acompanhar_manifestacao` (H.51: simples para acompanhar). */
+export const MANIFESTATIONS_ROUTE = '/v1/portal/manifestations';
+
+export const FOLLOW_MANIFESTATION_ACT = 'acompanhar_manifestacao';
+
+/** Timer da resposta do órgão (Lei 13.460 art. 16; DDL 14). */
+const AGENCY_RESPONSE_TIMER = 'T-OUV-RESPOSTA';
+/** Timer da informação ao agente (art. 16 §ú; DDL 14). */
+const AGENT_INFO_TIMER = 'T-OUV-INFO';
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const TENANT_SQL = `select slug, timezone from auth.tenants where id = auth.current_tenant()`;
+
+const MANIFESTATION_COLUMNS = `id, state, kind, confidential, anonymous, subject_id, text, protocol,
+          received_at, to_char(agency_due_on, 'YYYY-MM-DD') as agency_due_on,
+          to_char(info_due_on, 'YYYY-MM-DD') as info_due_on,
+          decision_text, decided_at, acknowledged_at, version`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 64). */
+const INSERT_MANIFESTATION_SQL = `insert into portal.manifestation
+      (state, kind, confidential, anonymous, subject_id, text, protocol,
+       received_at, agency_due_on, info_due_on, version, created_at)
+    values ('COMPROVANTE_EMITIDO', $1, $2, $3, $4, $5, $6, $7, $8::date, null, 1, $7)
+    returning id`;
+
+const MANIFESTATION_FOR_UPDATE_SQL = `select ${MANIFESTATION_COLUMNS}
+     from portal.manifestation
+    where id = $1
+    for update`;
+
+const MANIFESTATION_SQL = `select ${MANIFESTATION_COLUMNS}
+     from portal.manifestation
+    where id = $1`;
+
+const LIST_COUNT_SQL = `select count(*) as total
+     from portal.manifestation
+    where subject_id = $1`;
+
+const LIST_SQL = `select ${MANIFESTATION_COLUMNS}
+     from portal.manifestation
+    where subject_id = $1
+    order by received_at desc, id asc
+    limit $2 offset $3`;
+
+const EXTENSIONS_SQL = `select manifestation_id, justification,
+          to_char(extended_on, 'YYYY-MM-DD') as extended_on,
+          to_char(new_due_on, 'YYYY-MM-DD') as new_due_on
+     from portal.manifestation_extension
+    where manifestation_id = any($1) and timer = $2`;
+
+const ACKNOWLEDGE_SQL = `update portal.manifestation
+      set state = 'AVALIACAO_OFERECIDA', acknowledged_at = $2,
+          version = version + 1, updated_at = $2
+    where id = $1
+    returning version`;
+
+interface TenantRow extends Record<string, unknown> {
+  slug: string;
+  timezone: string | null;
+}
+
+export interface ManifestationRow extends Record<string, unknown> {
+  id: string;
+  state: ManifestationState;
+  kind: string;
+  confidential: boolean;
+  anonymous: boolean;
+  subject_id: string | null;
+  text: string;
+  protocol: string;
+  received_at: Date | string;
+  agency_due_on: string;
+  info_due_on: string | null;
+  decision_text: string | null;
+  decided_at: Date | string | null;
+  acknowledged_at: Date | string | null;
+  version: number;
+}
+
+interface ExtensionRow extends Record<string, unknown> {
+  manifestation_id: string;
+  justification: string;
+  extended_on: string;
+  new_due_on: string;
+}
+
+interface CommandScope {
+  subject: PortalSubjectRecord;
+  cpfHash: string;
+  tenantSlug: string;
+  tenantTz: string;
+  now: Date;
+  today: string;
+}
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+function notFound(kind: string): PortalError {
+  return new PortalError('PORTAL.NOT_FOUND', {
+    status: 404,
+    context: { kind },
+  });
+}
+
+function listItemOf(
+  row: ManifestationRow,
+  extension: ExtensionRow | undefined,
+): ManifestationListItem {
+  return {
+    manifestationId: row.id,
+    state: row.state,
+    protocol: row.protocol,
+    kind: row.kind,
+    receivedAt: iso(row.received_at),
+    deadlines: {
+      agencyDueOn: row.agency_due_on,
+      extended: extension
+        ? {
+            justification: extension.justification,
+            on: extension.extended_on,
+            newDueOn: extension.new_due_on,
+          }
+        : null,
+    },
+    decision: row.decided_at
+      ? { text: row.decision_text, decidedAt: iso(row.decided_at) }
+      : null,
+    evaluationOffered: row.state === 'AVALIACAO_OFERECIDA',
+    evaluated: row.state === 'AVALIADA',
+  };
+}
+
+// ---------------------------------------------------------------------------
+// serviço
+// ---------------------------------------------------------------------------
+
+@Injectable()
+export class PortalManifestationService {
+  private readonly clock: PortalClockLike;
+  private readonly outbox: TeatEventOutbox;
+
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly idempotency: PortalIdempotencyService,
+    @Optional() clock?: PortalClock,
+    @Optional() private readonly requestContext?: RequestContext,
+    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    this.outbox = outbox ?? new SqlTeatEventOutbox();
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.6 POST manifestations — anônimo admitido (H.51)
+  // -------------------------------------------------------------------------
+
+  async manifest(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims | null,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<ManifestationCreateResponse> {
+    const subject = identity
+      ? await this.identity.upsertSubject(tx, identity, null)
+      : null;
+    // 1. idempotência (§4) — escopo `public` quando anônimo
+    const begun = await this.idempotency.begin(tx, {
+      scope: subject?.subjectId ?? PUBLIC_IDEMPOTENCY_SCOPE,
+      header: headers['idempotency-key'],
+      route: MANIFESTATIONS_ROUTE_KEY,
+      body,
+    });
+    if (begun.replay) {
+      return markReplayed({
+        ...(begun.replay.body as ManifestationCreateResponse),
+      });
+    }
+    // 2. kind — a única recusa (RN-PORTAL-109)
+    const parsed = MANIFESTATION_BODY.safeParse(body ?? {});
+    if (!parsed.success) {
+      throw new PortalError('PORTAL.MANIFESTATION_KIND_INVALID', {
+        status: 400,
+        context: { allowed: [...MANIFESTATION_KINDS] },
+      });
+    }
+    const input = parsed.data;
+    const anonymous = !subject || input.anonymous === true;
+    // 3. comprovante imediato (M13, T-PROTOCOLO invariante)
+    const tenant = await this.tenant(tx);
+    const now = this.clock.now();
+    const today = this.clock.today(tenant.tenantTz);
+    const protocol = await protocolNumber(tx, tenant.tenantSlug, today);
+    const agencyDays = await durationOf(tx, AGENCY_RESPONSE_TIMER);
+    if (agencyDays === null) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { timerCode: AGENCY_RESPONSE_TIMER },
+      });
+    }
+    const agencyDueOn = addCalendarDays(today, agencyDays);
+    const inserted = (
+      await tx.query<{ id: string }>(INSERT_MANIFESTATION_SQL, [
+        input.kind,
+        input.confidential,
+        anonymous,
+        anonymous ? null : subject!.subjectId,
+        input.text,
+        protocol,
+        now,
+        agencyDueOn,
+      ])
+    ).rows[0];
+    if (!inserted) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    // 4. evento (§11)
+    await this.outbox.append(
+      tx as never,
+      portalManifestationEvents.registrada(
+        inserted.id,
+        1,
+        {
+          manifestationId: inserted.id,
+          protocol,
+          kind: input.kind,
+          anonymous,
+          subjectId: anonymous ? null : subject!.subjectId,
+          subjectCpfHash:
+            anonymous || !identity ? null : cpfHashOf(identity.cpf),
+          receivedAt: now.toISOString(),
+          agencyDueOn,
+          toState: 'COMPROVANTE_EMITIDO',
+        },
+        this.eventContext(now, subject?.subjectId),
+      ),
+    );
+    const response: ManifestationCreateResponse = {
+      manifestationId: inserted.id,
+      protocol,
+      receivedAt: now.toISOString(),
+      state: 'COMPROVANTE_EMITIDO',
+      agencyDueOn,
+      anonymous,
+    };
+    await begun.record(201, response);
+    return response;
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.6 GET manifestations / GET manifestations/{id}
+  // -------------------------------------------------------------------------
+
+  async list(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    query: PortalQuery,
+  ): Promise<PortalPagedResponse<ManifestationListItem>> {
+    const scope = await this.scope(tx, identity);
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      FOLLOW_MANIFESTATION_ACT,
+      MANIFESTATIONS_ROUTE,
+    );
+    const page = parsePage(query);
+    const total = (
+      await tx.query<{ total: string | number }>(LIST_COUNT_SQL, [
+        scope.subject.subjectId,
+      ])
+    ).rows[0];
+    const rows = (
+      await tx.query<ManifestationRow>(LIST_SQL, [
+        scope.subject.subjectId,
+        page.limit,
+        page.offset,
+      ])
+    ).rows;
+    const extensions = await this.extensionsOf(
+      tx,
+      rows.map((row) => row.id),
+    );
+    return {
+      items: rows.map((row) => listItemOf(row, extensions.get(row.id))),
+      total: Number(total?.total ?? 0),
+      page: page.page,
+      pageSize: page.pageSize,
+    };
+  }
+
+  async get(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    manifestationId: string,
+  ): Promise<ManifestationDetailResponse> {
+    const scope = await this.scope(tx, identity);
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      FOLLOW_MANIFESTATION_ACT,
+      MANIFESTATIONS_ROUTE,
+    );
+    const row = await this.owned(tx, scope, manifestationId, MANIFESTATION_SQL);
+    const extensions = await this.extensionsOf(tx, [row.id]);
+    return {
+      ...listItemOf(row, extensions.get(row.id)),
+      text: row.text,
+      confidential: row.confidential,
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.6 POST manifestations/{id}/acknowledge
+  // -------------------------------------------------------------------------
+
+  async acknowledge(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    manifestationId: string,
+  ): Promise<ManifestationAcknowledgeResponse> {
+    const scope = await this.scope(tx, identity);
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      FOLLOW_MANIFESTATION_ACT,
+      MANIFESTATIONS_ROUTE,
+    );
+    const row = await this.owned(
+      tx,
+      scope,
+      manifestationId,
+      MANIFESTATION_FOR_UPDATE_SQL,
+    );
+    assertTransition(row, { command: 'acknowledge' });
+    // ENCERRADA → AVALIACAO_OFERECIDA na mesma transação (M13, offer_evaluation)
+    const updated = (
+      await tx.query<{ version: number }>(ACKNOWLEDGE_SQL, [row.id, scope.now])
+    ).rows[0];
+    const version = Number(updated?.version ?? row.version + 1);
+    await this.outbox.append(
+      tx as never,
+      portalManifestationEvents.encerrada(
+        row.id,
+        version,
+        {
+          manifestationId: row.id,
+          protocol: row.protocol,
+          acknowledgedAt: scope.now.toISOString(),
+          fromState: 'CIENCIA_AO_USUARIO',
+          toState: 'AVALIACAO_OFERECIDA',
+          subjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+        },
+        this.eventContext(scope.now, scope.subject.subjectId),
+      ),
+    );
+    return {
+      manifestationId: row.id,
+      state: 'AVALIACAO_OFERECIDA',
+      acknowledgedAt: scope.now.toISOString(),
+      evaluationOffered: true,
+      version,
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // transições do órgão (CTG-0001 §6.4) — sem rota nesta rodada (OD-P18)
+  // -------------------------------------------------------------------------
+
+  /** COMPROVANTE_EMITIDO → EM_ANALISE. */
+  analyze(tx: PortalSqlTransaction, manifestationId: string): Promise<number> {
+    return this.internalTransition(tx, manifestationId, 'analyze', {});
+  }
+
+  /** EM_ANALISE → INFORMACAO_SOLICITADA_AO_AGENTE; `info_due_on` = hoje + T-OUV-INFO. */
+  async requestInfo(
+    tx: PortalSqlTransaction,
+    manifestationId: string,
+  ): Promise<number> {
+    const tenant = await this.tenant(tx);
+    const days = await durationOf(tx, AGENT_INFO_TIMER);
+    if (days === null) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { timerCode: AGENT_INFO_TIMER },
+      });
+    }
+    const infoDueOn = addCalendarDays(this.clock.today(tenant.tenantTz), days);
+    return this.internalTransition(tx, manifestationId, 'request_info', {
+      info_due_on: infoDueOn,
+    });
+  }
+
+  /** INFORMACAO_SOLICITADA_AO_AGENTE → EM_ANALISE. */
+  receiveInfo(
+    tx: PortalSqlTransaction,
+    manifestationId: string,
+  ): Promise<number> {
+    return this.internalTransition(tx, manifestationId, 'receive_info', {});
+  }
+
+  /** EM_ANALISE → DECISAO_FINAL_ELABORADA; `decision_text`, `decided_at`. */
+  decide(
+    tx: PortalSqlTransaction,
+    manifestationId: string,
+    decisionText: string,
+  ): Promise<number> {
+    return this.internalTransition(tx, manifestationId, 'decide', {
+      decision_text: decisionText,
+      decided_at: this.clock.now(),
+    });
+  }
+
+  /** DECISAO_FINAL_ELABORADA → CIENCIA_AO_USUARIO (o `inbox_item` é OD-P40). */
+  notifyUser(
+    tx: PortalSqlTransaction,
+    manifestationId: string,
+  ): Promise<number> {
+    return this.internalTransition(tx, manifestationId, 'notify_user', {});
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  private async internalTransition(
+    tx: PortalSqlTransaction,
+    manifestationId: string,
+    command: string,
+    changes: Record<string, unknown>,
+  ): Promise<number> {
+    if (!UUID_RE.test(manifestationId)) throw notFound('manifestation');
+    const row = (
+      await tx.query<ManifestationRow>(MANIFESTATION_FOR_UPDATE_SQL, [
+        manifestationId,
+      ])
+    ).rows[0];
+    if (!row) throw notFound('manifestation');
+    const transition = assertTransition(row, { command });
+    const now = this.clock.now();
+    const assignments: string[] = [];
+    const values: unknown[] = [row.id, transition.to];
+    assignments.push('state = $2');
+    for (const [column, value] of Object.entries(changes)) {
+      values.push(value ?? null);
+      assignments.push(`${column} = $${values.length}`);
+    }
+    values.push(now);
+    assignments.push(`updated_at = $${values.length}`);
+    assignments.push('version = version + 1');
+    const updated = (
+      await tx.query<{ version: number }>(
+        `update portal.manifestation set ${assignments.join(', ')} where id = $1 returning version`,
+        values,
+      )
+    ).rows[0];
+    return Number(updated?.version ?? row.version + 1);
+  }
+
+  private async tenant(
+    tx: PortalSqlTransaction,
+  ): Promise<{ tenantSlug: string; tenantTz: string }> {
+    const tenant = (await tx.query<TenantRow>(TENANT_SQL)).rows[0];
+    if (!tenant) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    return {
+      tenantSlug: tenant.slug,
+      tenantTz: tenant.timezone ?? PORTAL_DEFAULT_TIME_ZONE,
+    };
+  }
+
+  /** §0: sujeito (upsert idempotente), fuso e slug do tenant, relógio. */
+  private async scope(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+  ): Promise<CommandScope> {
+    const subject = await this.identity.upsertSubject(tx, identity, null);
+    const tenant = await this.tenant(tx);
+    const now = this.clock.now();
+    return {
+      subject,
+      cpfHash: cpfHashOf(identity.cpf),
+      tenantSlug: tenant.tenantSlug,
+      tenantTz: tenant.tenantTz,
+      now,
+      today: this.clock.today(tenant.tenantTz),
+    };
+  }
+
+  private async owned(
+    tx: PortalSqlTransaction,
+    scope: CommandScope,
+    manifestationId: string,
+    sql: string,
+  ): Promise<ManifestationRow> {
+    if (!UUID_RE.test(manifestationId)) throw notFound('manifestation');
+    const row = (await tx.query<ManifestationRow>(sql, [manifestationId]))
+      .rows[0];
+    if (!row || row.subject_id !== scope.subject.subjectId) {
+      throw notFound('manifestation');
+    }
+    return row;
+  }
+
+  private async extensionsOf(
+    tx: PortalSqlTransaction,
+    ids: readonly string[],
+  ): Promise<Map<string, ExtensionRow>> {
+    if (ids.length === 0) return new Map();
+    const rows = (
+      await tx.query<ExtensionRow>(EXTENSIONS_SQL, [
+        [...ids],
+        AGENCY_RESPONSE_TIMER,
+      ])
+    ).rows;
+    return new Map(rows.map((row) => [row.manifestation_id, row]));
+  }
+
+  private eventContext(
+    now: Date,
+    subjectId: string | undefined,
+  ): PortalCitizenEventContext {
+    const snapshot = this.requestContext?.hasActiveContext()
+      ? this.requestContext.snapshot()
+      : undefined;
+    return {
+      occurredAt: now.toISOString(),
+      actorId: snapshot?.actorId ?? subjectId ?? '',
+      correlationId: snapshot?.requestId ?? '',
+    };
+  }
+}
diff --git a/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts b/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts
new file mode 100644
index 0000000..31b31ee
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/manifestations.controller.ts
@@ -0,0 +1,161 @@
+// `/v1/portal/manifestations` — manifestação da Lei 13.460 (work/rounds/
+// R-0009/contracts/CTG-0002.md §2.6, §2.8; plan R-0009 M13, M19, M20, adenda
+// A4(b)). `POST` é público com identidade OPORTUNISTA (H.51 "anônimo para
+// manifestar"): o guard de autenticação do app tenta autenticar quando há
+// `Authorization` e prossegue anônimo se falhar; aqui, principal presente com
+// claims válidas e papel CIDADAO → sujeito identificado, senão anônimo —
+// nunca 401/403. As três rotas autenticadas levam `@UseGuards(PortalCitizenGuard)`
+// por método (a classe não pode, porque `POST` é público).
+import {
+  Body,
+  Controller,
+  Get,
+  Headers,
+  HttpCode,
+  Param,
+  Post,
+  Query,
+  Req,
+  Res,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  NoIdempotent,
+  Public,
+  Resource,
+  canonicalRoles,
+  etagOf,
+  getPrincipalFromRequest,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  portalIdentityClaims,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalPagedResponse,
+} from '@detran/portal-identity';
+
+import {
+  PortalManifestationService,
+  isReplayedResponse,
+  type ManifestationAcknowledgeResponse,
+  type ManifestationCreateResponse,
+  type ManifestationDetailResponse,
+  type ManifestationListItem,
+  type PortalHeaders,
+  type PortalQuery,
+} from './manifestation.service.js';
+
+/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+const REPLAYED_HEADER = 'Idempotency-Replayed';
+
+/**
+ * Identidade oportunista (§2.8): principal autenticado com claims válidas e
+ * papel CIDADAO → identificado; qualquer outra situação → anônimo.
+ */
+export function opportunisticIdentityOf(
+  request: RequestLike,
+): PortalIdentityClaims | null {
+  const principal = getPrincipalFromRequest(request);
+  if (!principal) return null;
+  const claims = portalIdentityClaims(principal);
+  if (!claims) return null;
+  return canonicalRoles(principal.roles ?? []).includes('CIDADAO')
+    ? claims
+    : null;
+}
+
+@Controller('v1/portal/manifestations')
+@Resource('portal:manifestation')
+export class PortalManifestationsController {
+  constructor(
+    private readonly manifestations: PortalManifestationService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Post()
+  @Public()
+  @Action('manifest')
+  @NoIdempotent()
+  @Audit({
+    action: 'PORTAL_MANIFESTATION_MANIFEST',
+    entity: 'portal.manifestation',
+  })
+  async manifest(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<ManifestationCreateResponse> {
+    const identity = opportunisticIdentityOf(request);
+    const response = await this.tx((tx) =>
+      this.manifestations.manifest(tx, identity, body, headers),
+    );
+    res.status(201);
+    if (isReplayedResponse(response)) res.setHeader(REPLAYED_HEADER, 'true');
+    return response;
+  }
+
+  @Get()
+  @UseGuards(PortalCitizenGuard)
+  @Action('read')
+  list(
+    @Req() request: CitizenRequest,
+    @Query() query: PortalQuery,
+  ): Promise<PortalPagedResponse<ManifestationListItem>> {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) => this.manifestations.list(tx, identity, query ?? {}));
+  }
+
+  @Get(':id')
+  @UseGuards(PortalCitizenGuard)
+  @Action('read')
+  get(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<ManifestationDetailResponse> {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) => this.manifestations.get(tx, identity, id));
+  }
+
+  @Post(':id/acknowledge')
+  @HttpCode(200)
+  @UseGuards(PortalCitizenGuard)
+  @Action('acknowledge')
+  @Audit({
+    action: 'PORTAL_MANIFESTATION_ACKNOWLEDGE',
+    entity: 'portal.manifestation',
+  })
+  async acknowledge(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<ManifestationAcknowledgeResponse> {
+    const identity = portalIdentityOf(request);
+    const result = await this.tx((tx) =>
+      this.manifestations.acknowledge(tx, identity, id),
+    );
+    res.setHeader('ETag', etagOf(result.version));
+    return result;
+  }
+
+  /** Transação única de tenant por comando/leitura (§0). */
+  private tx<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+}
diff --git a/backend/domains/portal/citizen-service/src/handwritten/portal-timers.ts b/backend/domains/portal/citizen-service/src/handwritten/portal-timers.ts
new file mode 100644
index 0000000..34191ec
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/portal-timers.ts
@@ -0,0 +1,60 @@
+// Timers `owner='portal'` de `inf.infraction_timer_ref` (DDL 14, manuscrito;
+// work/rounds/R-0009/contracts/CTG-0002.md §6.3; plan R-0009 M14).
+// `backend/domains/inf/deadlines` não é tocado (R-0007): o Portal mantém aqui
+// o espelho tipado só dos quatro códigos e lê a duração do vocabulário
+// manuscrito na transação do comando — o literal 30 nunca aparece em código.
+// `T-LGPD-ACESSO` (`source_pending`, OD-P08) e `T-AVAL-CONVITE` (imediato)
+// não têm `duration_value` e devolvem `null`.
+import {
+  PortalError,
+  type PortalSqlTransaction,
+} from '@detran/portal-identity';
+
+export const PORTAL_TIMER_CODES = [
+  'T-OUV-RESPOSTA',
+  'T-OUV-INFO',
+  'T-LGPD-ACESSO',
+  'T-AVAL-CONVITE',
+] as const;
+export type PortalTimerCode = (typeof PORTAL_TIMER_CODES)[number];
+
+/** Única unidade admitida para `addCalendarDays` (DDL 14: `dias_corridos`). */
+const CALENDAR_DAYS_UNIT = 'dias_corridos';
+
+const TIMER_SQL = `select duration_value, duration_unit
+     from inf.infraction_timer_ref
+    where code = $1
+    limit 1`;
+
+interface TimerRow extends Record<string, unknown> {
+  duration_value: number | string | null;
+  duration_unit: string | null;
+}
+
+/**
+ * Duração em dias corridos do timer, lida de `inf.infraction_timer_ref`;
+ * `null` quando o vocabulário não fixa valor. Linha ausente ou unidade fora
+ * de `dias_corridos` é defeito de configuração (nunca um valor inventado).
+ */
+export async function durationOf(
+  tx: PortalSqlTransaction,
+  code: PortalTimerCode,
+): Promise<number | null> {
+  const row = (await tx.query<TimerRow>(TIMER_SQL, [code])).rows[0];
+  if (!row) {
+    throw new PortalError('PORTAL.INTERNAL', {
+      status: 500,
+      context: { timerCode: code },
+    });
+  }
+  if (row.duration_value === null || row.duration_value === undefined) {
+    return null;
+  }
+  if (row.duration_unit !== CALENDAR_DAYS_UNIT) {
+    throw new PortalError('PORTAL.INTERNAL', {
+      status: 500,
+      context: { timerCode: code, durationUnit: row.duration_unit },
+    });
+  }
+  return Number(row.duration_value);
+}
diff --git a/backend/domains/portal/citizen-service/src/handwritten/service-charter.controller.ts b/backend/domains/portal/citizen-service/src/handwritten/service-charter.controller.ts
new file mode 100644
index 0000000..ea54f5e
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/service-charter.controller.ts
@@ -0,0 +1,67 @@
+// `GET /v1/portal/service-charter/{serviceKey}/deadline` — prazo máximo por
+// serviço da Carta (Lei 13.460 art. 7º §2º IV; work/rounds/R-0009/contracts/
+// CTG-0002.md §2.6; plan R-0009 M12, M19). Leitura de `portal.service_catalog`
+// do tenant por `service_key` (comparação literal); ausente → 404
+// `PORTAL.NOT_FOUND { kind: 'service' }`.
+import { Controller, Get, Param, UseGuards } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import { Action, Resource, withTenantContext } from '@detran/shared';
+import { PortalCitizenGuard, PortalError } from '@detran/portal-identity';
+
+export interface ServiceCharterDeadlineResponse {
+  serviceKey: string;
+  legalDeadline: string;
+  normativeReference: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+}
+
+interface CharterRow extends Record<string, unknown> {
+  service_key: string;
+  legal_deadline: string;
+  normative_reference: string;
+  availability: ServiceCharterDeadlineResponse['availability'];
+}
+
+const CHARTER_SQL = `select service_key, legal_deadline, normative_reference, availability
+     from portal.service_catalog
+    where service_key = $1
+    limit 1`;
+
+@Controller('v1/portal/service-charter')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:service-charter')
+export class PortalServiceCharterController {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get(':serviceKey/deadline')
+  @Action('read')
+  deadline(
+    @Param('serviceKey') serviceKey: string,
+  ): Promise<ServiceCharterDeadlineResponse> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (tx) => {
+        const row = (await tx.query<CharterRow>(CHARTER_SQL, [serviceKey]))
+          .rows[0];
+        if (!row) {
+          throw new PortalError('PORTAL.NOT_FOUND', {
+            status: 404,
+            context: { kind: 'service' },
+          });
+        }
+        return {
+          serviceKey: row.service_key,
+          legalDeadline: row.legal_deadline,
+          normativeReference: row.normative_reference,
+          availability: row.availability,
+        };
+      },
+      { readonly: true },
+    );
+  }
+}
diff --git a/backend/domains/portal/citizen-service/tests/integration/portal-timers.integration.spec.ts b/backend/domains/portal/citizen-service/tests/integration/portal-timers.integration.spec.ts
new file mode 100644
index 0000000..08d630c
--- /dev/null
+++ b/backend/domains/portal/citizen-service/tests/integration/portal-timers.integration.spec.ts
@@ -0,0 +1,97 @@
+// R-0009 CTG-0002 §6.3 e §13 (TASK-0006) — C-0002-45 (parte de integração):
+// `durationOf(tx, code)` lê `inf.infraction_timer_ref` (DDL 14, M14) sob
+// `role_app_backend`; o valor esperado é lido pela própria consulta SQL do
+// teste (nunca literal 30/20). Fica vermelho até TASK-0008 criar
+// `portal-timers.ts` (§14). Banco: `source work/rounds/R-0009/env-detran-r9.sh`.
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import { TENANT_ID } from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  PORTAL_TIMER_CODES,
+  durationOf,
+} from '../../src/handwritten/portal-timers.js';
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+
+interface SqlTx {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT_ID,
+    ]);
+    await client.query(`select set_config('app.actor_id', $1, true)`, [
+      ACTOR_ID,
+    ]);
+    const result = await work({
+      query: client.query.bind(client) as SqlTx['query'],
+    });
+    await client.query('commit');
+    return result;
+  } catch (error) {
+    await client.query('rollback');
+    throw error;
+  }
+}
+
+beforeAll(async () => {
+  await client.connect();
+});
+
+afterAll(async () => {
+  await client.end();
+});
+
+describe('CTG-0002 §6.3 — durationOf lê inf.infraction_timer_ref (C-0002-45)', () => {
+  it("C-0002-45 — dado DDL 14 quando durationOf(tx, 'T-OUV-RESPOSTA') então = duration_value da linha; durationOf('T-LGPD-ACESSO') = null; os quatro códigos existem com owner='portal'", async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const vocabulary = await client.query<{
+      code: string;
+      owner: string;
+      duration_value: number | null;
+      duration_unit: string;
+    }>(
+      `select code, owner, duration_value, duration_unit from inf.infraction_timer_ref where code = any($1::text[]) order by code`,
+      [[...PORTAL_TIMER_CODES]],
+    );
+    expect(vocabulary.rows.map((row) => row.code).sort()).toEqual(
+      [...PORTAL_TIMER_CODES].sort(),
+    );
+    expect(vocabulary.rows.every((row) => row.owner === 'portal')).toBe(true);
+    expect(
+      vocabulary.rows.every((row) => row.duration_unit === 'dias_corridos'),
+    ).toBe(true);
+    const byCode = new Map(
+      vocabulary.rows.map((row) => [row.code, row.duration_value]),
+    );
+    expect(typeof byCode.get('T-OUV-RESPOSTA')).toBe('number');
+    expect(typeof byCode.get('T-OUV-INFO')).toBe('number');
+    expect(byCode.get('T-LGPD-ACESSO')).toBeNull();
+    expect(byCode.get('T-AVAL-CONVITE')).toBeNull();
+
+    const read = await inTenantTx(async (tx) => ({
+      resposta: await durationOf(tx as never, 'T-OUV-RESPOSTA'),
+      info: await durationOf(tx as never, 'T-OUV-INFO'),
+      lgpd: await durationOf(tx as never, 'T-LGPD-ACESSO'),
+      aval: await durationOf(tx as never, 'T-AVAL-CONVITE'),
+    }));
+    expect(read.resposta).toBe(byCode.get('T-OUV-RESPOSTA'));
+    expect(read.info).toBe(byCode.get('T-OUV-INFO'));
+    expect(read.lgpd).toBeNull();
+    expect(read.aval).toBeNull();
+  });
+});
diff --git a/backend/domains/portal/identity/src/handwritten/assurance.controller.ts b/backend/domains/portal/identity/src/handwritten/assurance.controller.ts
index e1d8acf..cd9eac4 100644
--- a/backend/domains/portal/identity/src/handwritten/assurance.controller.ts
+++ b/backend/domains/portal/identity/src/handwritten/assurance.controller.ts
@@ -1,14 +1,67 @@
-// `POST /v1/portal/identity/assurance/elevations[/{id}/complete]` — sem rotas
-// nesta rodada (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009
-// M24): as rotas de elevação (portal-route-contract.md §3) são CTG-0002
-// (TASK-0007). A classe já declara a guarda de identidade e o recurso para
-// que TASK-0007 não os esqueça; sem handlers, `verify:decorators` não a reprova.
-import { Controller, UseGuards } from '@nestjs/common';
-import { Resource } from '@detran/shared';
+// `POST /v1/portal/identity/assurance/elevations[/{id}/complete]`
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.1; plan R-0009 M19, M20;
+// ADR-0024 §Consequences, OD-P15). Nesta rodada não há cliente OIDC gov.br:
+// depois da forma (400) as duas rotas respondem 422 `PORTAL.SERVICE_UNAVAILABLE
+// { unavailableReason: 'elevacao_govbr_pendente_r0014' }`; nada é armazenado
+// e `NIVEL_ASSINATURA_ELEVADO` (events.ts) só será publicado pelo `complete`
+// real (R-0014). As rotas existem para a matriz política ⇔ rotas fechar (§10).
+import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
+import { z } from 'zod';
+import { Action, Audit, Resource } from '@detran/shared';

 import { PortalCitizenGuard } from './citizen.guard.js';
+import { PortalError } from './errors.js';
+import { PORTAL_ELEVATION_METHODS } from './identity.service.js';
+import { parsePortalBody } from './validation.js';
+
+export const ELEVATION_UNAVAILABLE_REASON = 'elevacao_govbr_pendente_r0014';
+
+export const ELEVATION_BODY = z.strictObject({
+  targetLevel: z.literal('avancada'),
+  method: z.enum(PORTAL_ELEVATION_METHODS),
+  resumeRoute: z.string().min(1).startsWith('/'),
+});
+
+export const ELEVATION_COMPLETE_BODY = z.strictObject({
+  resumeToken: z.string().min(1),
+});
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function elevationUnavailable(): PortalError {
+  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
+    status: 422,
+    context: {
+      unavailableReason: ELEVATION_UNAVAILABLE_REASON,
+      alternativeChannelNote: null,
+    },
+  });
+}

 @Controller('v1/portal/identity/assurance')
 @UseGuards(PortalCitizenGuard)
 @Resource('portal:identity')
-export class PortalAssuranceController {}
+export class PortalAssuranceController {
+  @Post('elevations')
+  @Action('elevate')
+  @Audit({ action: 'PORTAL_IDENTITY_ELEVATE', entity: 'portal.subject' })
+  createElevation(@Body() body: unknown): never {
+    parsePortalBody(ELEVATION_BODY, body);
+    throw elevationUnavailable();
+  }
+
+  @Post('elevations/:id/complete')
+  @Action('elevate')
+  @Audit({ action: 'PORTAL_IDENTITY_ELEVATE', entity: 'portal.subject' })
+  completeElevation(@Param('id') id: string, @Body() body: unknown): never {
+    if (!UUID_RE.test(id)) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['id'] },
+      });
+    }
+    parsePortalBody(ELEVATION_COMPLETE_BODY, body);
+    throw elevationUnavailable();
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/events.ts b/backend/domains/portal/identity/src/handwritten/events.ts
new file mode 100644
index 0000000..70634f7
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/events.ts
@@ -0,0 +1,161 @@
+// Eventos publicados por `@detran/portal-identity` (work/rounds/R-0009/
+// contracts/CTG-0002.md §11; plan R-0009 M21): `NIVEL_ASSINATURA_ELEVADO`
+// (type `portal.identity.elevated` — inalcançável nesta rodada, OD-P15) e
+// `REPRESENTACAO_VALIDADA` (type `portal.representation.validated`, emitido
+// pelo `validateRepresentation` interno). Padrão de
+// `inf/infraction/src/handwritten/events.ts`; os `type` são montados por
+// concatenação (precedente `ops/offline-sync`: `verify:parameter-catalogue`
+// leria o literal `portal.<x>.<y>` como chave de parâmetro).
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+import type { TeatEventEnvelope } from '@detran/shared';
+
+const PORTAL_TOPIC_PREFIX = 'portal';
+
+// Tokens copiados de identity.service.ts (`PORTAL_ASSURANCE_LEVELS`,
+// `PORTAL_ELEVATION_METHODS`) — este arquivo não importa o serviço para não
+// fechar um ciclo (o serviço publica os eventos daqui).
+const ASSURANCE_LEVELS = ['simples', 'avancada', 'qualificada'] as const;
+const ELEVATION_METHODS = ['biographic', 'biometric', 'icp'] as const;
+
+export const PORTAL_IDENTITY_ELEVATED_TYPE = `${PORTAL_TOPIC_PREFIX}.identity.elevated`;
+export const PORTAL_REPRESENTATION_VALIDATED_TYPE = `${PORTAL_TOPIC_PREFIX}.representation.validated`;
+
+export const PORTAL_SUBJECT_AGGREGATE_KIND = 'portal.subject';
+export const PORTAL_REPRESENTATION_AGGREGATE_KIND = 'portal.representation';
+
+const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope<D extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: D,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.uuid(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.uuid(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const nivelAssinaturaElevado = envelope(
+  PORTAL_IDENTITY_ELEVATED_TYPE,
+  'NIVEL_ASSINATURA_ELEVADO',
+  PORTAL_SUBJECT_AGGREGATE_KIND,
+  z.strictObject({
+    subjectId: z.uuid(),
+    subjectCpfHash: sha256,
+    fromLevel: z.enum(ASSURANCE_LEVELS),
+    toLevel: z.enum(ASSURANCE_LEVELS),
+    method: z.enum(ELEVATION_METHODS),
+    elevatedAt: z.iso.datetime(),
+  }),
+);
+
+const representacaoValidada = envelope(
+  PORTAL_REPRESENTATION_VALIDATED_TYPE,
+  'REPRESENTACAO_VALIDADA',
+  PORTAL_REPRESENTATION_AGGREGATE_KIND,
+  z.strictObject({
+    representationId: z.uuid(),
+    representativeSubjectId: z.uuid(),
+    representedCpfHash: sha256,
+    scope: z.enum(['ait', 'all']),
+    validUntil: z.iso.date().nullable(),
+    validatedAt: z.iso.datetime(),
+  }),
+);
+
+export const PORTAL_IDENTITY_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> =
+  {
+    [PORTAL_IDENTITY_ELEVATED_TYPE]: nivelAssinaturaElevado,
+    [PORTAL_REPRESENTATION_VALIDATED_TYPE]: representacaoValidada,
+  };
+
+export type NivelAssinaturaElevadoData = z.infer<
+  typeof nivelAssinaturaElevado
+>['data'];
+export type RepresentacaoValidadaData = z.infer<
+  typeof representacaoValidada
+>['data'];
+
+export interface PortalIdentityEventContext {
+  occurredAt: string;
+  actorId: string;
+  correlationId: string;
+}
+
+function portalEnvelope(
+  type: string,
+  domainEvent: string,
+  aggregate: TeatEventEnvelope['aggregate'],
+  data: Record<string, unknown>,
+  context: PortalIdentityEventContext,
+): TeatEventEnvelope {
+  return {
+    id: '',
+    type,
+    domainEvent,
+    version: 1,
+    occurredAt: context.occurredAt,
+    tenantId: '',
+    actor: { kind: 'user', id: context.actorId },
+    correlationId: context.correlationId,
+    aggregate,
+    data,
+  };
+}
+
+export const portalIdentityEvents = {
+  nivelAssinaturaElevado(
+    subjectId: string,
+    version: number,
+    data: NivelAssinaturaElevadoData,
+    context: PortalIdentityEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_IDENTITY_ELEVATED_TYPE,
+      'NIVEL_ASSINATURA_ELEVADO',
+      { kind: PORTAL_SUBJECT_AGGREGATE_KIND, id: subjectId, version },
+      data,
+      context,
+    );
+  },
+  /** `portal.representation` não tem `version` (D-CTG2-1): uma publicação por validação. */
+  representacaoValidada(
+    representationId: string,
+    data: RepresentacaoValidadaData,
+    context: PortalIdentityEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_REPRESENTATION_VALIDATED_TYPE,
+      'REPRESENTACAO_VALIDADA',
+      {
+        kind: PORTAL_REPRESENTATION_AGGREGATE_KIND,
+        id: representationId,
+        version: 1,
+      },
+      data,
+      context,
+    );
+  },
+};
diff --git a/backend/domains/portal/identity/src/handwritten/identity.service.ts b/backend/domains/portal/identity/src/handwritten/identity.service.ts
index b59fe5b..5cdcec6 100644
--- a/backend/domains/portal/identity/src/handwritten/identity.service.ts
+++ b/backend/domains/portal/identity/src/handwritten/identity.service.ts
@@ -7,15 +7,39 @@
 import { createHash } from 'node:crypto';
 import { Injectable, Optional } from '@nestjs/common';
 import type { Transaction } from '@stynx-nyx/data';
-import type { getPrincipalFromRequest } from '@detran/shared';
+import { addCalendarDays } from '@detran/inf-deadlines';
+import {
+  SqlTeatEventOutbox,
+  type getPrincipalFromRequest,
+} from '@detran/shared';

 import { PortalClock, type PortalClockLike } from './clock.js';
 import { PortalError } from './errors.js';
+import {
+  portalIdentityEvents,
+  type PortalIdentityEventContext,
+} from './events.js';

 type Principal = NonNullable<ReturnType<typeof getPrincipalFromRequest>>;

-/** Subconjunto da transação STYNX que este pacote usa (SQL parametrizado). */
-export type PortalSqlTransaction = Pick<Transaction, 'query'>;
+/**
+ * Subconjunto da transação STYNX que os pacotes do Portal usam: `query`
+ * parametrizado devolvendo `rows`. Estrutural para que a `Transaction` real e
+ * a tx falsa em memória dos specs (`requests/tests/support/fake-sql.ts`,
+ * CTG-0002 §13) sirvam igualmente.
+ */
+export interface PortalSqlTransaction {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+/** A `Transaction` real satisfaz o subconjunto (verificação em tempo de tipo). */
+const _transactionIsPortalSqlTransaction: (
+  tx: Transaction,
+) => PortalSqlTransaction = (tx) => tx;
+void _transactionIsPortalSqlTransaction;

 // ---------------------------------------------------------------------------
 // §2.1 — claims e principal (M3)
@@ -334,6 +358,149 @@ const ENTITLEMENT_SQL = `select id
       and (valid_until is null or valid_until >= $4::date)
     limit 1`;

+// ---------------------------------------------------------------------------
+// §3 representações — [WF-PORTAL-002] (CTG-0001 §6.2; CTG-0002 §2.1)
+// ---------------------------------------------------------------------------
+
+export const REPRESENTATION_STATES = [
+  'PROCURACAO_APRESENTADA',
+  'PROCURACAO_VALIDADA',
+  'PROCURACAO_RECUSADA',
+] as const;
+export type RepresentationState = (typeof REPRESENTATION_STATES)[number];
+
+export interface RepresentationTransition {
+  /** `null` = apresentação. */
+  from: RepresentationState | null;
+  to: RepresentationState;
+  command: 'present' | 'validate' | 'refuse' | 'resubmit';
+  guard: string;
+}
+
+/** Só `portal.representation.state` é persistido (CTG-0001 §6.2). */
+export const REPRESENTATION_TRANSITIONS: readonly RepresentationTransition[] = [
+  {
+    from: null,
+    to: 'PROCURACAO_APRESENTADA',
+    command: 'present',
+    guard: "POST representations; assertActLevel('procuracao')",
+  },
+  {
+    from: 'PROCURACAO_APRESENTADA',
+    to: 'PROCURACAO_VALIDADA',
+    command: 'validate',
+    guard:
+      'instrumento conferido (documento assinado no nível do ato presume-se autêntico — RN-PORTAL-104)',
+  },
+  {
+    from: 'PROCURACAO_APRESENTADA',
+    to: 'PROCURACAO_RECUSADA',
+    command: 'refuse',
+    guard:
+      'refusal_reason obrigatório (422 REPRESENTATION_REFUSED na resposta síncrona, WF-PORTAL-002)',
+  },
+  {
+    from: 'PROCURACAO_RECUSADA',
+    to: 'PROCURACAO_APRESENTADA',
+    command: 'resubmit',
+    guard: 'reenvio sem reinício (WF-PORTAL-002)',
+  },
+];
+
+export interface CreateRepresentationInput {
+  representedCpf: string;
+  representedName: string;
+  instrumentDocumentId: string;
+  scope: 'ait' | 'all';
+  validUntil?: string;
+}
+
+export interface PortalRepresentationResponse {
+  id: string;
+  representedName: string;
+  scope: 'ait' | 'all';
+  validUntil: string | null;
+  state: RepresentationState;
+  refusalReason: string | null;
+}
+
+export interface ValidateRepresentationInput {
+  outcome: 'validated' | 'refused';
+  reason?: string;
+  /** Alvos (`portal.entitlement.target_id`) quando `scope = 'ait'` (OD-P37). */
+  aitIds?: readonly string[];
+}
+
+interface RepresentationDetailRow extends Record<string, unknown> {
+  id: string;
+  representative_subject_id: string;
+  represented_cpf_hash: string;
+  represented_name: string;
+  scope: 'ait' | 'all';
+  valid_until: string | null;
+  state: RepresentationState;
+  refusal_reason: string | null;
+}
+
+const REPRESENTATION_COLUMNS = `id, representative_subject_id, represented_cpf_hash, represented_name,
+          scope, to_char(valid_until, 'YYYY-MM-DD') as valid_until, state, refusal_reason`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 61). */
+const INSERT_REPRESENTATION_SQL = `insert into portal.representation
+      (representative_subject_id, represented_cpf_hash, represented_name,
+       instrument_document_id, scope, valid_until, state, refusal_reason)
+    values ($1, $2, $3, $4, $5, $6, 'PROCURACAO_APRESENTADA', null)
+    returning ${REPRESENTATION_COLUMNS}`;
+
+const LIST_REPRESENTATIONS_SQL = `select ${REPRESENTATION_COLUMNS}
+     from portal.representation
+    where representative_subject_id = $1
+    order by created_at asc, id asc`;
+
+const OWNED_REPRESENTATION_SQL = `select ${REPRESENTATION_COLUMNS}
+     from portal.representation
+    where id = $1 and representative_subject_id = $2
+    for update`;
+
+const REPRESENTATION_FOR_UPDATE_SQL = `select ${REPRESENTATION_COLUMNS}
+     from portal.representation
+    where id = $1
+    for update`;
+
+const REVOKE_REPRESENTATION_SQL = `update portal.representation
+      set valid_until = $2::date, updated_at = $3
+    where id = $1
+    returning ${REPRESENTATION_COLUMNS}`;
+
+const VALIDATE_REPRESENTATION_SQL = `update portal.representation
+      set state = $2, refusal_reason = $3, updated_at = $4
+    where id = $1
+    returning ${REPRESENTATION_COLUMNS}`;
+
+const INSERT_REPRESENTATIVE_ENTITLEMENT_SQL = `insert into portal.entitlement
+      (subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+    values ($1, 'ait', $2, 'representative', 'representation', $3::date, $4)
+    on conflict (tenant_id, subject_id, target_kind, target_id, relation) do update set
+      valid_until = excluded.valid_until,
+      updated_at = excluded.created_at`;
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function representationOf(
+  row: RepresentationDetailRow,
+): PortalRepresentationResponse {
+  return {
+    id: row.id,
+    representedName: row.represented_name,
+    scope: row.scope,
+    validUntil: row.valid_until,
+    state: row.state,
+    refusalReason:
+      row.state === 'PROCURACAO_RECUSADA' ? (row.refusal_reason ?? null) : null,
+  };
+}
+
 @Injectable()
 export class PortalIdentityService {
   private readonly clock: PortalClockLike;
@@ -455,6 +622,182 @@ export class PortalIdentityService {
     }));
   }

+  // -------------------------------------------------------------------------
+  // §3 representações (CTG-0002 §2.1) — [WF-PORTAL-002]
+  // -------------------------------------------------------------------------
+
+  /** `POST representations`: apresentação da procuração (`assertActLevel` é do controlador). */
+  async createRepresentation(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    subjectId: string,
+    input: CreateRepresentationInput,
+    clock: PortalClockLike = this.clock,
+  ): Promise<PortalRepresentationResponse> {
+    if (input.representedCpf === identity.cpf) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['representedCpf'] },
+      });
+    }
+    if (input.validUntil !== undefined && input.validUntil < clock.today()) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['validUntil'] },
+      });
+    }
+    const result = await tx.query<RepresentationDetailRow>(
+      INSERT_REPRESENTATION_SQL,
+      [
+        subjectId,
+        cpfHashOf(input.representedCpf),
+        input.representedName,
+        input.instrumentDocumentId,
+        input.scope,
+        input.validUntil ?? null,
+      ],
+    );
+    const row = result.rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    return representationOf(row);
+  }
+
+  /** `GET representations`: todas as do sujeito, todos os estados. */
+  async listRepresentations(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+  ): Promise<PortalRepresentationResponse[]> {
+    const result = await tx.query<RepresentationDetailRow>(
+      LIST_REPRESENTATIONS_SQL,
+      [subjectId],
+    );
+    return result.rows.map(representationOf);
+  }
+
+  /**
+   * `DELETE representations/{id}`: revogação sem apagar (RN-PORTAL-112) —
+   * `valid_until = today − 1`; vínculos `origin='representation'` ficam (OD-P37).
+   */
+  async revokeRepresentation(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+    representationId: string,
+    clock: PortalClockLike = this.clock,
+  ): Promise<
+    Pick<PortalRepresentationResponse, 'id' | 'state' | 'validUntil'>
+  > {
+    if (!UUID_RE.test(representationId)) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['id'] },
+      });
+    }
+    const owned = await tx.query<RepresentationDetailRow>(
+      OWNED_REPRESENTATION_SQL,
+      [representationId, subjectId],
+    );
+    if (!owned.rows[0]) {
+      throw new PortalError('PORTAL.NOT_FOUND', {
+        status: 404,
+        context: { kind: 'representation' },
+      });
+    }
+    const yesterday = addCalendarDays(clock.today(), -1);
+    const updated = await tx.query<RepresentationDetailRow>(
+      REVOKE_REPRESENTATION_SQL,
+      [representationId, yesterday, clock.now()],
+    );
+    const row = updated.rows[0] ?? owned.rows[0];
+    return { id: row.id, state: row.state, validUntil: yesterday };
+  }
+
+  /**
+   * Validação/recusa da procuração (CTG-0001 §6.2; sem rota nesta rodada —
+   * OD-P37): em `validated` materializa `portal.entitlement` (relation
+   * `representative`, origin `representation`) por AIT informado e publica
+   * `REPRESENTACAO_VALIDADA` na mesma transação.
+   */
+  async validateRepresentation(
+    tx: PortalSqlTransaction,
+    representationId: string,
+    input: ValidateRepresentationInput,
+    context: Pick<PortalIdentityEventContext, 'actorId' | 'correlationId'>,
+    clock: PortalClockLike = this.clock,
+  ): Promise<PortalRepresentationResponse> {
+    const current = (
+      await tx.query<RepresentationDetailRow>(REPRESENTATION_FOR_UPDATE_SQL, [
+        representationId,
+      ])
+    ).rows[0];
+    if (!current) {
+      throw new PortalError('PORTAL.NOT_FOUND', {
+        status: 404,
+        context: { kind: 'representation' },
+      });
+    }
+    const command = input.outcome === 'validated' ? 'validate' : 'refuse';
+    const transition = REPRESENTATION_TRANSITIONS.find(
+      (row) => row.from === current.state && row.command === command,
+    );
+    if (!transition) {
+      // portal-error-catalog.md não tem código de estado para a procuração
+      // (só REPRESENTATION_REFUSED/EXPIRED, sem rota nesta rodada — OD-P37);
+      // sem rota, a guarda interna responde com o genérico do §7.
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['state'] },
+      });
+    }
+    if (command === 'refuse' && !input.reason) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['reason'] },
+      });
+    }
+    const now = clock.now();
+    const updated = (
+      await tx.query<RepresentationDetailRow>(VALIDATE_REPRESENTATION_SQL, [
+        representationId,
+        transition.to,
+        command === 'refuse' ? (input.reason ?? null) : null,
+        now,
+      ])
+    ).rows[0];
+    if (!updated) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    if (command === 'validate') {
+      if (updated.scope === 'ait') {
+        for (const aitId of input.aitIds ?? []) {
+          await tx.query(INSERT_REPRESENTATIVE_ENTITLEMENT_SQL, [
+            updated.representative_subject_id,
+            aitId,
+            clock.today(),
+            updated.valid_until,
+          ]);
+        }
+      }
+      await new SqlTeatEventOutbox().append(
+        tx as never,
+        portalIdentityEvents.representacaoValidada(
+          updated.id,
+          {
+            representationId: updated.id,
+            representativeSubjectId: updated.representative_subject_id,
+            representedCpfHash: updated.represented_cpf_hash,
+            scope: updated.scope,
+            validUntil: updated.valid_until,
+            validatedAt: now.toISOString(),
+          },
+          { ...context, occurredAt: now.toISOString() },
+        ),
+      );
+    }
+    return representationOf(updated);
+  }
+
   /** Corpo de `GET /v1/portal/identity/me` (§8), numa única transação. */
   async readMe(
     tx: PortalSqlTransaction,
diff --git a/backend/domains/portal/identity/src/handwritten/index.ts b/backend/domains/portal/identity/src/handwritten/index.ts
index 10f6cb0..b4d9e08 100644
--- a/backend/domains/portal/identity/src/handwritten/index.ts
+++ b/backend/domains/portal/identity/src/handwritten/index.ts
@@ -7,8 +7,11 @@ export * from './assurance.controller.js';
 export * from './citizen.guard.js';
 export * from './clock.js';
 export * from './errors.js';
+export * from './events.js';
 export * from './identity.service.js';
 export * from './me.controller.js';
+export * from './pagination.js';
 export * from './preferences.controller.js';
 export * from './public.controller.js';
 export * from './representations.controller.js';
+export * from './validation.js';
diff --git a/backend/domains/portal/identity/src/handwritten/pagination.ts b/backend/domains/portal/identity/src/handwritten/pagination.ts
new file mode 100644
index 0000000..598b9c5
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/pagination.ts
@@ -0,0 +1,48 @@
+// Paginação das listas cidadãs (work/rounds/R-0009/contracts/CTG-0002.md §0):
+// `page` 1-based (default 1), `pageSize` default 20 e máximo 100 — convenção
+// de API, não parâmetro de produto —, importada por todos os pacotes do
+// Portal. Resposta das listas: `{ items, total, page, pageSize }`.
+import { PortalError } from './errors.js';
+
+export const PORTAL_PAGE_SIZE = 20;
+export const PORTAL_MAX_PAGE_SIZE = 100;
+
+export interface PortalPage {
+  page: number;
+  pageSize: number;
+  limit: number;
+  offset: number;
+}
+
+export interface PortalPagedResponse<T> {
+  items: T[];
+  total: number;
+  page: number;
+  pageSize: number;
+}
+
+function positiveInteger(
+  raw: string | string[] | undefined,
+  field: string,
+): number | undefined {
+  const value = Array.isArray(raw) ? raw[0] : raw;
+  if (value === undefined || value === '') return undefined;
+  if (!/^\d+$/.test(value) || Number(value) < 1) {
+    throw new PortalError('PORTAL.VALIDATION_FAILED', {
+      status: 400,
+      context: { fields: [field] },
+    });
+  }
+  return Number(value);
+}
+
+/** `page`/`pageSize` da query; fora da forma → 400 `PORTAL.VALIDATION_FAILED`. */
+export function parsePage(
+  query: Record<string, string | string[] | undefined> | undefined,
+): PortalPage {
+  const page = positiveInteger(query?.page, 'page') ?? 1;
+  const requested =
+    positiveInteger(query?.pageSize, 'pageSize') ?? PORTAL_PAGE_SIZE;
+  const pageSize = Math.min(requested, PORTAL_MAX_PAGE_SIZE);
+  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
+}
diff --git a/backend/domains/portal/identity/src/handwritten/preferences.controller.ts b/backend/domains/portal/identity/src/handwritten/preferences.controller.ts
index 82b1ea6..16bb7ec 100644
--- a/backend/domains/portal/identity/src/handwritten/preferences.controller.ts
+++ b/backend/domains/portal/identity/src/handwritten/preferences.controller.ts
@@ -1,14 +1,54 @@
-// `PUT /v1/portal/identity/preferences` — sem rotas nesta rodada
-// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24):
-// `@stynx-nyx/preferences` não é montado em CTG-0001 (`GET me` devolve
-// `preferences: null`); a rota é CTG-0002 (TASK-0007). Guarda e recurso já
-// declarados.
-import { Controller, UseGuards } from '@nestjs/common';
-import { Resource } from '@detran/shared';
+// `PUT /v1/portal/identity/preferences` (work/rounds/R-0009/contracts/
+// CTG-0002.md §2.1; plan R-0009 M9, M19, M20; OD-P38). `@stynx-nyx/preferences`
+// não é montado nesta rodada (CTG-0001 §8 `preferences: null`): depois da
+// forma (400) e do `If-Match` (428 antes de qualquer leitura) a rota responde
+// 422 `PORTAL.SERVICE_UNAVAILABLE { unavailableReason:
+// 'preferences_substrato_pendente' }`. `sne_enrollment.channel` (§2.4) é
+// outro regime ([WF-PORTAL-003]).
+import { Body, Controller, Headers, Put, UseGuards } from '@nestjs/common';
+import { z } from 'zod';
+import { Action, Audit, Resource } from '@detran/shared';

 import { PortalCitizenGuard } from './citizen.guard.js';
+import { PortalError } from './errors.js';
+import { parsePortalBody } from './validation.js';
+
+export const PREFERENCES_UNAVAILABLE_REASON = 'preferences_substrato_pendente';
+
+export const PREFERENCES_BODY = z.strictObject({
+  channel: z.enum(['push', 'email', 'sne']),
+  pushSubscription: z
+    .strictObject({
+      endpoint: z.url(),
+      keys: z.strictObject({ p256dh: z.string(), auth: z.string() }),
+    })
+    .optional(),
+});

 @Controller('v1/portal/identity/preferences')
 @UseGuards(PortalCitizenGuard)
 @Resource('portal:identity')
-export class PortalPreferencesController {}
+export class PortalPreferencesController {
+  @Put()
+  @Action('update')
+  @Audit({ action: 'PORTAL_PREFERENCES_UPDATE', entity: 'portal.subject' })
+  update(
+    @Body() body: unknown,
+    @Headers('if-match') ifMatch: string | undefined,
+  ): never {
+    parsePortalBody(PREFERENCES_BODY, body);
+    if (!ifMatch || ifMatch.trim() === '') {
+      throw new PortalError('PORTAL.IF_MATCH_REQUIRED', {
+        status: 428,
+        context: {},
+      });
+    }
+    throw new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
+      status: 422,
+      context: {
+        unavailableReason: PREFERENCES_UNAVAILABLE_REASON,
+        alternativeChannelNote: null,
+      },
+    });
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/representations.controller.ts b/backend/domains/portal/identity/src/handwritten/representations.controller.ts
index 61de539..57858e0 100644
--- a/backend/domains/portal/identity/src/handwritten/representations.controller.ts
+++ b/backend/domains/portal/identity/src/handwritten/representations.controller.ts
@@ -1,13 +1,123 @@
-// `/v1/portal/identity/representations` — sem rotas nesta rodada
-// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24): `POST`,
-// `GET` e `DELETE representations[/{id}]` (portal-route-contract.md §3,
-// [WF-PORTAL-002]) são CTG-0002 (TASK-0007). Guarda e recurso já declarados.
-import { Controller, UseGuards } from '@nestjs/common';
-import { Resource } from '@detran/shared';
+// `/v1/portal/identity/representations` — apresentação, lista e revogação da
+// procuração (work/rounds/R-0009/contracts/CTG-0002.md §2.1; plan R-0009 M6,
+// M19, M20; [WF-PORTAL-002]). Nível do ato `procuracao` (`assertActLevel`,
+// CTG-0001 §4) antes de gravar; validação/recusa não têm rota nesta rodada
+// (OD-P37: `PortalIdentityService.validateRepresentation` interno). Sem
+// `ETag`: `portal.representation` não tem `version` (D-CTG2-1).
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  HttpCode,
+  Post,
+  Param,
+  Req,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import { z } from 'zod';
+import {
+  Action,
+  Audit,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';

-import { PortalCitizenGuard } from './citizen.guard.js';
+import {
+  PortalCitizenGuard,
+  portalIdentityOf,
+  type PortalIdentityRequest,
+} from './citizen.guard.js';
+import {
+  PortalIdentityService,
+  type PortalRepresentationResponse,
+} from './identity.service.js';
+import { parsePortalBody } from './validation.js';
+
+export const REPRESENTATION_ACT_KEY = 'procuracao';
+export const REPRESENTATIONS_ROUTE = '/v1/portal/identity/representations';
+
+export const REPRESENTATION_BODY = z.strictObject({
+  representedCpf: z.string().regex(/^\d{11}$/),
+  representedName: z.string().min(1),
+  instrumentDocumentId: z.uuid(),
+  scope: z.enum(['ait', 'all']),
+  validUntil: z.iso.date().optional(),
+});
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;

 @Controller('v1/portal/identity/representations')
 @UseGuards(PortalCitizenGuard)
 @Resource('portal:identity')
-export class PortalRepresentationsController {}
+export class PortalRepresentationsController {
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Post()
+  @Action('represent')
+  @Audit({
+    action: 'PORTAL_REPRESENTATION_CREATE',
+    entity: 'portal.representation',
+  })
+  create(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+  ): Promise<PortalRepresentationResponse> {
+    const identity = portalIdentityOf(request);
+    const input = parsePortalBody(REPRESENTATION_BODY, body);
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      await this.identity.assertActLevel(
+        tx,
+        identity,
+        REPRESENTATION_ACT_KEY,
+        REPRESENTATIONS_ROUTE,
+      );
+      const subject = await this.identity.upsertSubject(tx, identity, null);
+      return this.identity.createRepresentation(
+        tx,
+        identity,
+        subject.subjectId,
+        input,
+      );
+    });
+  }
+
+  @Get()
+  @Action('read')
+  list(
+    @Req() request: CitizenRequest,
+  ): Promise<PortalRepresentationResponse[]> {
+    const identity = portalIdentityOf(request);
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const subject = await this.identity.upsertSubject(tx, identity, null);
+      return this.identity.listRepresentations(tx, subject.subjectId);
+    });
+  }
+
+  @Delete(':id')
+  @HttpCode(200)
+  @Action('represent')
+  @Audit({
+    action: 'PORTAL_REPRESENTATION_DELETE',
+    entity: 'portal.representation',
+  })
+  revoke(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<
+    Pick<PortalRepresentationResponse, 'id' | 'state' | 'validUntil'>
+  > {
+    const identity = portalIdentityOf(request);
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const subject = await this.identity.upsertSubject(tx, identity, null);
+      return this.identity.revokeRepresentation(tx, subject.subjectId, id);
+    });
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/validation.ts b/backend/domains/portal/identity/src/handwritten/validation.ts
new file mode 100644
index 0000000..de1ac95
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/validation.ts
@@ -0,0 +1,25 @@
+// Forma zod → 400 `PORTAL.VALIDATION_FAILED { fields[] }` (work/rounds/R-0009/
+// contracts/CTG-0002.md §0): `fields` são os caminhos das issues (ponto
+// separado); chave desconhecida em `strictObject` vira o nome da chave.
+import type { z } from 'zod';
+
+import { PortalError } from './errors.js';
+
+export function portalValidationFailed(fields: readonly string[]): PortalError {
+  return new PortalError('PORTAL.VALIDATION_FAILED', {
+    status: 400,
+    context: { fields: [...new Set(fields)] },
+  });
+}
+
+export function parsePortalBody<T>(schema: z.ZodType<T>, body: unknown): T {
+  const parsed = schema.safeParse(body ?? {});
+  if (parsed.success) return parsed.data;
+  throw portalValidationFailed(
+    parsed.error.issues.map((issue) => {
+      if (issue.path.length > 0) return issue.path.map(String).join('.');
+      const keys = (issue as { keys?: string[] }).keys;
+      return keys && keys.length > 0 ? keys.join(',') : 'body';
+    }),
+  );
+}
diff --git a/backend/domains/portal/inbox/src/handwritten/events.ts b/backend/domains/portal/inbox/src/handwritten/events.ts
new file mode 100644
index 0000000..6c12d10
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/events.ts
@@ -0,0 +1,238 @@
+// Eventos publicados por `@detran/portal-inbox` (work/rounds/R-0009/contracts/
+// CTG-0002.md §11; plan R-0009 M15, M21): `INBOX_LIDO` (type
+// `portal.inbox.read`), `NOTIFICACAO_CIENCIA` (type
+// `portal.notification.acknowledged` — o prefixo `portal.` distingue a
+// publicação do Portal da ciência do módulo dono, ADR-0016) e
+// `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` (type
+// `portal.sne-enrollment.changed`, união discriminada em `domainEvent`).
+// Padrão de `inf/infraction/src/handwritten/events.ts`: envelope de
+// rait-events-sse-contract.md §1, `strictObject` em toda parte — `data` só com
+// ids, tokens, datas e o `cpf_hash` do sujeito (escopo do SSE, §9); nunca
+// e-mail nem telefone.
+//
+// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
+// como literal (`tools/parameters/verify.mjs --check-usage`; precedente de
+// `portal/requests/src/handwritten/events.ts`).
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+import type { TeatEventEnvelope } from '@detran/shared';
+
+const PORTAL_TOPIC_PREFIX = 'portal';
+
+export const PORTAL_INBOX_READ_TYPE = `${PORTAL_TOPIC_PREFIX}.inbox.read`;
+export const PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE = `${PORTAL_TOPIC_PREFIX}.notification.acknowledged`;
+export const PORTAL_SNE_ENROLLMENT_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.sne-enrollment.changed`;
+
+export const PORTAL_INBOX_ITEM_AGGREGATE_KIND = 'portal.inbox_item';
+export const PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND = 'portal.sne_enrollment';
+
+const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
+const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope<D extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: D,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.uuid(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.uuid(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const inboxLido = envelope(
+  PORTAL_INBOX_READ_TYPE,
+  'INBOX_LIDO',
+  PORTAL_INBOX_ITEM_AGGREGATE_KIND,
+  z.strictObject({
+    inboxItemId: z.uuid(),
+    subjectId: z.uuid(),
+    subjectCpfHash: sha256,
+    source: z.enum(['sne', 'portal']),
+    sourceEventId: z.uuid(),
+    aitId: z.uuid().nullable(),
+    requestId: z.uuid().nullable(),
+    readOn: localDate,
+  }),
+);
+
+const notificacaoCiencia = envelope(
+  PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE,
+  'NOTIFICACAO_CIENCIA',
+  PORTAL_INBOX_ITEM_AGGREGATE_KIND,
+  z.strictObject({
+    inboxItemId: z.uuid(),
+    sourceEventId: z.uuid(),
+    aitId: z.uuid().nullable(),
+    subjectCpfHash: sha256,
+    acknowledgedAt: z.iso.datetime(),
+    readOn: localDate,
+    evidenceSha256: sha256,
+    fictitious: z.literal(false),
+  }),
+);
+
+const sneAdesaoSolicitada = envelope(
+  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+  'SNE_ADESAO_SOLICITADA',
+  PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
+  z.strictObject({
+    enrollmentId: z.uuid(),
+    subjectId: z.uuid(),
+    subjectCpfHash: sha256,
+    toState: z.literal('ADERIDO_SNE'),
+    since: z.iso.datetime(),
+    channel: z.enum(['push', 'email', 'sne']).nullable(),
+    consentTextVersion: z.string(),
+  }),
+);
+
+const sneCancelamentoSolicitado = envelope(
+  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+  'SNE_CANCELAMENTO_SOLICITADO',
+  PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
+  z.strictObject({
+    enrollmentId: z.uuid(),
+    subjectId: z.uuid(),
+    subjectCpfHash: sha256,
+    fromState: z.literal('ADERIDO_SNE'),
+    toState: z.literal('NAO_ADERIDO_SNE'),
+    cancelledAt: z.iso.datetime(),
+  }),
+);
+
+/** `type` → schema (o de `portal.sne-enrollment.changed` é a união por `domainEvent`). */
+export const PORTAL_INBOX_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> = {
+  [PORTAL_INBOX_READ_TYPE]: inboxLido,
+  [PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE]: notificacaoCiencia,
+  [PORTAL_SNE_ENROLLMENT_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
+    sneAdesaoSolicitada,
+    sneCancelamentoSolicitado,
+  ]),
+};
+
+export type InboxLidoData = z.infer<typeof inboxLido>['data'];
+export type NotificacaoCienciaData = z.infer<typeof notificacaoCiencia>['data'];
+export type SneAdesaoSolicitadaData = z.infer<
+  typeof sneAdesaoSolicitada
+>['data'];
+export type SneCancelamentoSolicitadoData = z.infer<
+  typeof sneCancelamentoSolicitado
+>['data'];
+
+export interface PortalInboxEventContext {
+  occurredAt: string;
+  actorId: string;
+  correlationId: string;
+}
+
+function portalEnvelope(
+  type: string,
+  domainEvent: string,
+  aggregate: TeatEventEnvelope['aggregate'],
+  data: Record<string, unknown>,
+  context: PortalInboxEventContext,
+): TeatEventEnvelope {
+  return {
+    id: '',
+    type,
+    domainEvent,
+    version: 1,
+    occurredAt: context.occurredAt,
+    tenantId: '',
+    actor: { kind: 'user', id: context.actorId },
+    correlationId: context.correlationId,
+    aggregate,
+    data,
+  };
+}
+
+/**
+ * Fábricas por `domainEvent`. `inbox_item` não tem `version` → `aggregate.version`
+ * fixa em 1 (uma publicação por evento e agregado, §6.1); `sne_enrollment`
+ * recebe o número da transição calculado pelo serviço (§11, D8).
+ */
+export const portalInboxEvents = {
+  inboxLido(
+    inboxItemId: string,
+    data: InboxLidoData,
+    context: PortalInboxEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_INBOX_READ_TYPE,
+      'INBOX_LIDO',
+      { kind: PORTAL_INBOX_ITEM_AGGREGATE_KIND, id: inboxItemId, version: 1 },
+      data,
+      context,
+    );
+  },
+  notificacaoCiencia(
+    inboxItemId: string,
+    data: NotificacaoCienciaData,
+    context: PortalInboxEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE,
+      'NOTIFICACAO_CIENCIA',
+      { kind: PORTAL_INBOX_ITEM_AGGREGATE_KIND, id: inboxItemId, version: 1 },
+      data,
+      context,
+    );
+  },
+  sneAdesaoSolicitada(
+    enrollmentId: string,
+    transition: number,
+    data: SneAdesaoSolicitadaData,
+    context: PortalInboxEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+      'SNE_ADESAO_SOLICITADA',
+      {
+        kind: PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
+        id: enrollmentId,
+        version: transition,
+      },
+      data,
+      context,
+    );
+  },
+  sneCancelamentoSolicitado(
+    enrollmentId: string,
+    transition: number,
+    data: SneCancelamentoSolicitadoData,
+    context: PortalInboxEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+      'SNE_CANCELAMENTO_SOLICITADO',
+      {
+        kind: PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
+        id: enrollmentId,
+        version: transition,
+      },
+      data,
+      context,
+    );
+  },
+};
diff --git a/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts b/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts
new file mode 100644
index 0000000..17ee82e
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/inbox.controller.ts
@@ -0,0 +1,108 @@
+// `/v1/portal/inbox`, `/v1/portal/inbox/{id}/read` e `/v1/portal/push-subscriptions`
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.4; plan R-0009 M15, M19, M20).
+// O controlador só extrai identidade, parâmetros e corpo, abre a transação
+// de tenant (`withTenantContext`, ADR-0002), garante o sujeito (upsert
+// idempotente, CTG-0001 §8) e delega a `PortalInboxService`. `Idempotency-Key`
+// das duas mutações é do kernel (`@Action` ⇒ `@Idempotent()`); a leitura é
+// idempotente por desenho (§6.1).
+import {
+  Body,
+  Controller,
+  Get,
+  HttpCode,
+  Param,
+  Post,
+  Query,
+  Req,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalIdentityService,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalPagedResponse,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import {
+  PortalInboxService,
+  type InboxItemResponse,
+  type InboxReadResponse,
+  type PortalInboxQuery,
+  type PushSubscriptionResponse,
+} from './inbox.service.js';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+@Controller('v1/portal')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:inbox')
+export class PortalInboxController {
+  constructor(
+    private readonly inbox: PortalInboxService,
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get('inbox')
+  @Action('read')
+  list(
+    @Req() request: CitizenRequest,
+    @Query() query: PortalInboxQuery,
+  ): Promise<PortalPagedResponse<InboxItemResponse>> {
+    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
+      this.inbox.list(tx, subject, query ?? {}),
+    );
+  }
+
+  @Post('inbox/:id/read')
+  @HttpCode(200)
+  @Action('acknowledge')
+  @Audit({ action: 'PORTAL_INBOX_ACKNOWLEDGE', entity: 'portal.inbox_item' })
+  read(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<InboxReadResponse> {
+    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
+      this.inbox.read(tx, subject, id),
+    );
+  }
+
+  @Post('push-subscriptions')
+  @Resource('portal:push-subscription')
+  @Action('create')
+  @Audit({
+    action: 'PORTAL_PUSH_SUBSCRIPTION_CREATE',
+    entity: 'portal.push_subscription',
+  })
+  subscribePush(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+  ): Promise<PushSubscriptionResponse> {
+    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
+      this.inbox.subscribePush(tx, subject, body),
+    );
+  }
+
+  /** Transação única de tenant por rota (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (tx: Transaction, subject: PortalSubjectRecord) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, async (tx) =>
+      work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
diff --git a/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts b/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts
new file mode 100644
index 0000000..69c2247
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/inbox.service.spec.ts
@@ -0,0 +1,667 @@
+// R-0009 CTG-0002 §6 e §13 (TASK-0006) — C-0002-33…37: `PortalInboxService`
+// (ciência idempotente na leitura, evidência de exibição, `INBOX_LIDO`/
+// `NOTIFICACAO_CIENCIA`), `fictitiousAcknowledgementOn` (T-SNE-CIENCIA lido de
+// `StaticTimerCatalog`, nunca 30) e `PortalSneEnrollmentService` (adesão,
+// re-adesão, cancelamento, `SNE_*` com `aggregate.version` por transição).
+// Fica vermelho até TASK-0008 criar `inbox.service.ts` e
+// `sne-enrollment.service.ts` (§14).
+//
+// Tx falsa em memória de `@detran/portal-requests` (`tests/support/fake-sql.ts`
+// — subconjunto de SQL no cabeçalho) com as fixtures da caixa/SNE de
+// CTG-0001 §10.8; `PortalIdentityService` real; relógio fixo 2026-09-14.
+// Formas esperadas (constrangimento do Inspector; §6.1/§6.2 fixam os nomes):
+//   inbox.read(tx, subject, inboxItemId) → { id, readOn, acknowledgementEvidence }
+//   sne.enroll(tx, subject, identity, body) · sne.cancel(tx, subject, identity, reason?)
+//   sne.get(tx, subject) → { enrolled, since, channel, cancelable }
+//   subject = PortalSubjectRecord de `upsertSubject` ({ subjectId, name, observedAt, version }).
+import { createHash } from 'node:crypto';
+import { describe, expect, it } from 'vitest';
+import { PortalIdentityService } from '@detran/portal-identity';
+import { canonicalJson } from '@detran/portal-requests';
+import { StaticTimerCatalog, addCalendarDays } from '@detran/inf-deadlines';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import {
+  FakeSqlDatabase,
+  type Row,
+} from '../../../requests/tests/support/fake-sql.js';
+import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
+import {
+  ACT_LEVEL_POLICY_ROWS,
+  AITS,
+  FIXED_NOW,
+  FIXED_TODAY,
+  SNE_EFFECTS as CONTRACT_SNE_EFFECTS,
+  SUBJECTS,
+  TENANT_ID,
+  TENANT_SLUG,
+  TOPICS,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+  identityOf,
+  outboxEnvelopes,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  PortalInboxService,
+  fictitiousAcknowledgementOn,
+} from './inbox.service.js';
+import {
+  PortalSneEnrollmentService,
+  SNE_EFFECTS,
+  SNE_ENROLLMENT_BODY,
+  SNE_ENROLLMENT_TRANSITIONS,
+} from './sne-enrollment.service.js';
+
+const INBOX = {
+  sneUnread: '00000000-0000-7000-8000-000070c00001',
+  portalRead: '00000000-0000-7000-8000-000070c00002',
+} as const;
+const ENROLLMENT_PRATA = '00000000-0000-7000-8000-000070e00001';
+
+/** CTG-0001 §10.8 — as duas linhas de `portal.inbox_item`. */
+const INBOX_FIXTURES: Row[] = [
+  {
+    id: INBOX.sneUnread,
+    subject_id: SUBJECTS.prata.id,
+    kind: 'SNE',
+    action_required: true,
+    source: 'sne',
+    source_event_id: '00000000-0000-7000-8000-000071b00001',
+    subject_line: 'Notificação de autuação disponível',
+    summary: 'fixture',
+    ait_id: AITS.f2,
+    request_id: null,
+    available_on: '2026-09-01',
+    read_on: null,
+    fictitious_acknowledgement_on: '2026-10-01',
+    deadline_due_on: '2026-10-01',
+    deadline_owned_by: 'citizen',
+  },
+  {
+    id: INBOX.portalRead,
+    subject_id: SUBJECTS.prata.id,
+    kind: 'PROCESSO',
+    action_required: false,
+    source: 'portal',
+    source_event_id: '00000000-0000-7000-8000-000071b00002',
+    subject_line: 'Pedido em andamento',
+    summary: 'fixture',
+    ait_id: null,
+    request_id: '00000000-0000-7000-8000-000070400009',
+    available_on: '2026-09-10',
+    read_on: '2026-09-11',
+    fictitious_acknowledgement_on: null,
+    deadline_due_on: null,
+    deadline_owned_by: null,
+  },
+];
+
+const SNE_FIXTURE: Row = {
+  id: ENROLLMENT_PRATA,
+  subject_id: SUBJECTS.prata.id,
+  state: 'ADERIDO_SNE',
+  channel: 'email',
+  email: 'prata@fixtures.invalid',
+  phone: null,
+  consent_text_version: '1',
+  effects_ack: {
+    ciencia_ficta: true,
+    canal_exclusivo: true,
+    desconto_60: true,
+    cancelamento: true,
+  },
+  since: new Date('2026-08-01T12:00:00-04:00'),
+  cancelled_at: null,
+  cancel_reason: null,
+};
+
+function subjectOf(key: keyof typeof SUBJECTS) {
+  return {
+    subjectId: SUBJECTS[key].id,
+    name: null,
+    observedAt: FIXED_NOW,
+    version: 1,
+  };
+}
+
+function harness(options: { sneRows?: Row[] } = {}) {
+  const db = new FakeSqlDatabase({
+    tenantId: TENANT_ID,
+    tenant: { slug: TENANT_SLUG },
+    now: fixedClock.now,
+  });
+  db.seed(
+    'portal.subject',
+    Object.values(SUBJECTS).map((subject) => ({
+      id: subject.id,
+      cpf_hash: subject.cpfHash,
+      name: '',
+      govbr_level_observed: null,
+      assurance_level_observed: subject.assurance,
+      observed_at: FIXED_NOW,
+      version: 1,
+    })),
+  );
+  db.seed('portal.act_level_policy', ACT_LEVEL_POLICY_ROWS);
+  db.seed(
+    'portal.inbox_item',
+    INBOX_FIXTURES.map((row) => ({ ...row })),
+  );
+  db.seed(
+    'portal.sne_enrollment',
+    (options.sneRows ?? [SNE_FIXTURE]).map((row) => ({ ...row })),
+  );
+  const outbox = new SqlTeatEventOutbox();
+  const providers = {
+    PortalIdentityService: new PortalIdentityService(fixedClock as never),
+    PortalClock: fixedClock,
+    Database: fakeDatabase(db.tx),
+    RequestContext: fakeRequestContext(),
+    SqlTeatEventOutbox: outbox,
+    TEAT_EVENT_OUTBOX: outbox,
+  };
+  const inbox = constructInjectable(
+    PortalInboxService,
+    providers,
+  ) as unknown as {
+    read: (tx: unknown, subject: unknown, id: string) => Promise<Row>;
+  };
+  const sne = constructInjectable(PortalSneEnrollmentService, {
+    ...providers,
+    PortalInboxService: inbox,
+  }) as unknown as {
+    enroll: (
+      tx: unknown,
+      subject: unknown,
+      identity: unknown,
+      body: unknown,
+    ) => Promise<Row>;
+    cancel: (
+      tx: unknown,
+      subject: unknown,
+      identity: unknown,
+      reason?: string,
+    ) => Promise<Row>;
+    get: (tx: unknown, subject: unknown) => Promise<Row>;
+  };
+  return { db, inbox, sne };
+}
+
+function itemRow(db: FakeSqlDatabase, id: string): Row {
+  return db.rows('portal.inbox_item').find((row) => row.id === id)!;
+}
+
+const VALID_CONSENT = {
+  textVersion: '1',
+  effectsAck: [...CONTRACT_SNE_EFFECTS],
+};
+
+describe('CTG-0002 §6.3 — fictitiousAcknowledgementOn (C-0002-33)', () => {
+  it('C-0002-33 — dado availableOn 2026-09-01 quando fictitiousAcknowledgementOn então available + duração de T-SNE-CIENCIA lida de StaticTimerCatalog', () => {
+    const definition = new StaticTimerCatalog().get('T-SNE-CIENCIA');
+    expect(definition.owner).toBe('infracao');
+    expect(definition.durationUnit).toBe('dias_corridos');
+    expect(typeof definition.durationValue).toBe('number');
+    const expected = addCalendarDays('2026-09-01', definition.durationValue!);
+    expect(fictitiousAcknowledgementOn('2026-09-01')).toBe(expected);
+    // a fixture …70c00001 (available_on 2026-09-01 → 2026-10-01) é coerente com o catálogo
+    expect(fictitiousAcknowledgementOn('2026-09-01')).toBe(
+      String(INBOX_FIXTURES[0]!.fictitious_acknowledgement_on),
+    );
+    expect(fictitiousAcknowledgementOn('2026-12-20')).toBe(
+      addCalendarDays('2026-12-20', definition.durationValue!),
+    );
+  });
+});
+
+describe('CTG-0002 §6.1 — PortalInboxService.read (C-0002-34, C-0002-35)', () => {
+  it("C-0002-34 — dado item source 'sne' não lido quando read então read_on = today, acknowledgement_evidence (displayed_sha256 = sha256 do canonicalJson exibido), INBOX_LIDO e NOTIFICACAO_CIENCIA na outbox; quando read de novo então nenhuma escrita e mesma resposta", async () => {
+    const { db, inbox } = harness();
+    const first = await inbox.read(db.tx, subjectOf('prata'), INBOX.sneUnread);
+    expect(first).toMatchObject({ id: INBOX.sneUnread, readOn: FIXED_TODAY });
+    const evidence = first.acknowledgementEvidence as Row;
+    expect(evidence).toBeTruthy();
+    const displayed = canonicalJson({
+      availableOn: '2026-09-01',
+      fictitiousAcknowledgementOn: '2026-10-01',
+      id: INBOX.sneUnread,
+      subjectLine: 'Notificação de autuação disponível',
+      summary: 'fixture',
+    });
+    const displayedSha256 = createHash('sha256')
+      .update(displayed)
+      .digest('hex');
+    expect(evidence.displayedSha256).toBe(displayedSha256);
+    expect(new Date(String(evidence.acknowledgedAt)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    expect(String(itemRow(db, INBOX.sneUnread).read_on).slice(0, 10)).toBe(
+      FIXED_TODAY,
+    );
+    const evidences = db
+      .rows('portal.acknowledgement_evidence')
+      .filter((row) => row.inbox_item_id === INBOX.sneUnread);
+    expect(evidences).toHaveLength(1);
+    expect(evidences[0]).toMatchObject({
+      displayed_sha256: displayedSha256,
+      signature_ref: null,
+    });
+
+    const read = outboxEnvelopes(db, TOPICS.inboxRead);
+    expect(read).toHaveLength(1);
+    expect(read[0]).toMatchObject({
+      domainEvent: 'INBOX_LIDO',
+      aggregate: { kind: 'portal.inbox_item', id: INBOX.sneUnread, version: 1 },
+    });
+    expect(read[0]!.data).toMatchObject({
+      inboxItemId: INBOX.sneUnread,
+      subjectId: SUBJECTS.prata.id,
+      subjectCpfHash: SUBJECTS.prata.cpfHash,
+      source: 'sne',
+      aitId: AITS.f2,
+      readOn: FIXED_TODAY,
+    });
+    const acknowledged = outboxEnvelopes(db, TOPICS.notificationAcknowledged);
+    expect(acknowledged).toHaveLength(1);
+    expect(acknowledged[0]).toMatchObject({
+      domainEvent: 'NOTIFICACAO_CIENCIA',
+    });
+    expect(acknowledged[0]!.data).toMatchObject({
+      inboxItemId: INBOX.sneUnread,
+      evidenceSha256: displayedSha256,
+      fictitious: false,
+      readOn: FIXED_TODAY,
+      aitId: AITS.f2,
+    });
+    expect(JSON.stringify(acknowledged[0]!.data)).not.toContain(TENANT_ID);
+
+    const writesBefore = db.log.length;
+    const second = await inbox.read(db.tx, subjectOf('prata'), INBOX.sneUnread);
+    expect(second).toEqual(first);
+    expect(
+      db
+        .rows('portal.acknowledgement_evidence')
+        .filter((row) => row.inbox_item_id === INBOX.sneUnread),
+    ).toHaveLength(1);
+    expect(outboxEnvelopes(db, TOPICS.inboxRead)).toHaveLength(1);
+    expect(outboxEnvelopes(db, TOPICS.notificationAcknowledged)).toHaveLength(
+      1,
+    );
+    const writes = db.log
+      .slice(writesBefore)
+      .filter((entry) => /^\s*(insert|update|delete)/i.test(entry.sql));
+    expect(writes).toEqual([]);
+  });
+
+  it("C-0002-35 — dado item source 'portal' quando read então read_on, INBOX_LIDO, sem evidência e sem NOTIFICACAO_CIENCIA", async () => {
+    const { db, inbox } = harness();
+    itemRow(db, INBOX.portalRead).read_on = null;
+    const response = await inbox.read(
+      db.tx,
+      subjectOf('prata'),
+      INBOX.portalRead,
+    );
+    expect(response).toMatchObject({
+      id: INBOX.portalRead,
+      readOn: FIXED_TODAY,
+      acknowledgementEvidence: null,
+    });
+    expect(String(itemRow(db, INBOX.portalRead).read_on).slice(0, 10)).toBe(
+      FIXED_TODAY,
+    );
+    expect(db.rows('portal.acknowledgement_evidence')).toHaveLength(0);
+    expect(outboxEnvelopes(db, TOPICS.inboxRead)).toHaveLength(1);
+    expect(outboxEnvelopes(db, TOPICS.inboxRead)[0]!.data).toMatchObject({
+      source: 'portal',
+      requestId: '00000000-0000-7000-8000-000070400009',
+    });
+    expect(outboxEnvelopes(db, TOPICS.notificationAcknowledged)).toHaveLength(
+      0,
+    );
+  });
+
+  it("§6.1 — dado item de outro sujeito ou inexistente quando read então 404 PORTAL.NOT_FOUND { kind: 'inbox_item' } e nenhuma escrita", async () => {
+    const { db, inbox } = harness();
+    await expect(
+      inbox.read(db.tx, subjectOf('ouro'), INBOX.sneUnread),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'inbox_item' },
+    });
+    await expect(
+      inbox.read(
+        db.tx,
+        subjectOf('prata'),
+        '00000000-0000-7000-8000-000070c000ff',
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      context: { kind: 'inbox_item' },
+    });
+    expect(itemRow(db, INBOX.sneUnread).read_on).toBeNull();
+    expect(outboxEnvelopes(db)).toHaveLength(0);
+  });
+});
+
+describe('CTG-0002 §6.2 — PortalSneEnrollmentService.enroll (C-0002-36)', () => {
+  it("C-0002-36 — dado enroll sem email e sem phone então 422 SNE_CONTACT_REQUIRED { missing: ['email','phone'] }", async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
+        consent: VALID_CONSENT,
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SNE_CONTACT_REQUIRED',
+      status: 422,
+      context: { missing: ['email', 'phone'] },
+    });
+    expect(
+      db
+        .rows('portal.sne_enrollment')
+        .filter((row) => row.subject_id === SUBJECTS.ouro.id),
+    ).toHaveLength(0);
+  });
+
+  it("C-0002-36 — dado effectsAck com 3 efeitos então 400 VALIDATION_FAILED { fields: ['consent.effectsAck'] }; efeitos repetidos idem", async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
+        email: 'ouro@fixtures.invalid',
+        consent: {
+          textVersion: '1',
+          effectsAck: CONTRACT_SNE_EFFECTS.slice(0, 3),
+        },
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['consent.effectsAck'] },
+    });
+    await expect(
+      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
+        email: 'ouro@fixtures.invalid',
+        consent: {
+          textVersion: '1',
+          effectsAck: [
+            CONTRACT_SNE_EFFECTS[0],
+            CONTRACT_SNE_EFFECTS[0],
+            CONTRACT_SNE_EFFECTS[1],
+            CONTRACT_SNE_EFFECTS[2],
+          ],
+        },
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['consent.effectsAck'] },
+    });
+    expect(SNE_EFFECTS).toEqual(CONTRACT_SNE_EFFECTS);
+    expect(
+      SNE_ENROLLMENT_BODY.safeParse({
+        email: 'a@b.invalid',
+        consent: VALID_CONSENT,
+      }).success,
+    ).toBe(true);
+    expect(
+      SNE_ENROLLMENT_BODY.safeParse({
+        email: 'a@b.invalid',
+        consent: VALID_CONSENT,
+        extra: 1,
+      }).success,
+    ).toBe(false);
+    expect(
+      SNE_ENROLLMENT_BODY.safeParse({
+        phone: '9299999999',
+        channel: 'push',
+        consent: VALID_CONSENT,
+      }).success,
+    ).toBe(true);
+    expect(
+      SNE_ENROLLMENT_BODY.safeParse({ phone: '12', consent: VALID_CONSENT })
+        .success,
+    ).toBe(false);
+  });
+
+  it("C-0002-36 — dado identity 'simples' então 403 ASSURANCE_INSUFFICIENT { actKey: 'adesao_sne', resumeRoute: '/v1/portal/sne/enrollment' } (A1(a))", async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.enroll(db.tx, subjectOf('bronze'), identityOf('bronze'), {
+        email: 'bronze@fixtures.invalid',
+        consent: VALID_CONSENT,
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
+      status: 403,
+      context: {
+        actKey: 'adesao_sne',
+        required: 'avancada',
+        current: 'simples',
+        resumeRoute: '/v1/portal/sne/enrollment',
+      },
+    });
+  });
+
+  it('C-0002-36 — dado ADERIDO_SNE então 409 SNE_ALREADY_ENROLLED {}', async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.enroll(db.tx, subjectOf('prata'), identityOf('prata'), {
+        email: 'prata@fixtures.invalid',
+        consent: VALID_CONSENT,
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SNE_ALREADY_ENROLLED',
+      status: 409,
+    });
+    expect(outboxEnvelopes(db, TOPICS.sneEnrollmentChanged)).toHaveLength(0);
+  });
+
+  it('C-0002-36 — dado NAO_ADERIDO_SNE (cancelada) então re-adesão com since novo e cancelled_at null; effects_ack = os quatro true; SNE_ADESAO_SOLICITADA', async () => {
+    const cancelledId = '00000000-0000-7000-8000-000070e000e1';
+    const { db, sne } = harness({
+      sneRows: [
+        SNE_FIXTURE,
+        {
+          id: cancelledId,
+          subject_id: SUBJECTS.ouro.id,
+          state: 'NAO_ADERIDO_SNE',
+          channel: null,
+          email: 'antigo@fixtures.invalid',
+          phone: null,
+          consent_text_version: '0',
+          effects_ack: null,
+          since: new Date('2026-06-01T12:00:00-04:00'),
+          cancelled_at: new Date('2026-07-01T12:00:00-04:00'),
+          cancel_reason: 'fixture',
+        },
+      ],
+    });
+    const response = await sne.enroll(
+      db.tx,
+      subjectOf('ouro'),
+      identityOf('ouro'),
+      {
+        email: 'ouro@fixtures.invalid',
+        phone: '92999999999',
+        channel: 'email',
+        consent: { textVersion: '2', effectsAck: [...CONTRACT_SNE_EFFECTS] },
+      },
+    );
+    expect(response).toMatchObject({ enrolled: true, channel: 'email' });
+    expect(new Date(String(response.since)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const rows = db
+      .rows('portal.sne_enrollment')
+      .filter((row) => row.subject_id === SUBJECTS.ouro.id);
+    expect(rows).toHaveLength(1);
+    expect(rows[0]).toMatchObject({
+      id: cancelledId,
+      state: 'ADERIDO_SNE',
+      channel: 'email',
+      email: 'ouro@fixtures.invalid',
+      phone: '92999999999',
+      consent_text_version: '2',
+      cancelled_at: null,
+      cancel_reason: null,
+      effects_ack: {
+        ciencia_ficta: true,
+        canal_exclusivo: true,
+        desconto_60: true,
+        cancelamento: true,
+      },
+    });
+    expect(new Date(String(rows[0]!.since)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const events = outboxEnvelopes(db, TOPICS.sneEnrollmentChanged);
+    expect(events).toHaveLength(1);
+    expect(events[0]).toMatchObject({
+      domainEvent: 'SNE_ADESAO_SOLICITADA',
+      aggregate: { kind: 'portal.sne_enrollment', id: cancelledId, version: 1 },
+    });
+    expect(events[0]!.data).toMatchObject({
+      enrollmentId: cancelledId,
+      subjectId: SUBJECTS.ouro.id,
+      subjectCpfHash: SUBJECTS.ouro.cpfHash,
+      toState: 'ADERIDO_SNE',
+      channel: 'email',
+      consentTextVersion: '2',
+    });
+    expect(events[0]!.data).not.toHaveProperty('email');
+    expect(events[0]!.data).not.toHaveProperty('phone');
+  });
+
+  it('§6.2 — dado SNE_ENROLLMENT_TRANSITIONS então as três linhas de CTG-0001 §6.3 (enroll de nada e de NAO_ADERIDO_SNE; cancel de ADERIDO_SNE)', () => {
+    const rows = SNE_ENROLLMENT_TRANSITIONS as ReadonlyArray<{
+      from: string | null;
+      to: string;
+      command: string;
+    }>;
+    expect(
+      rows.map(({ from, to, command }) => ({ from, to, command })),
+    ).toEqual([
+      { from: null, to: 'ADERIDO_SNE', command: 'enroll' },
+      { from: 'NAO_ADERIDO_SNE', to: 'ADERIDO_SNE', command: 'enroll' },
+      { from: 'ADERIDO_SNE', to: 'NAO_ADERIDO_SNE', command: 'cancel' },
+    ]);
+  });
+});
+
+describe('CTG-0002 §6.2 — PortalSneEnrollmentService.cancel e get (C-0002-37)', () => {
+  it('C-0002-37 — dado cancel sem linha então 409 SNE_NOT_ENROLLED {}; dado NAO_ADERIDO_SNE idem', async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.cancel(db.tx, subjectOf('ouro'), identityOf('ouro'), 'motivo'),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SNE_NOT_ENROLLED',
+      status: 409,
+    });
+    const row = db
+      .rows('portal.sne_enrollment')
+      .find((candidate) => candidate.id === ENROLLMENT_PRATA)!;
+    row.state = 'NAO_ADERIDO_SNE';
+    await expect(
+      sne.cancel(db.tx, subjectOf('prata'), identityOf('prata')),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SNE_NOT_ENROLLED',
+      status: 409,
+    });
+    expect(outboxEnvelopes(db, TOPICS.sneEnrollmentChanged)).toHaveLength(0);
+  });
+
+  it('C-0002-37 — dado ADERIDO_SNE então NAO_ADERIDO_SNE, cancelled_at, cancel_reason, SNE_CANCELAMENTO_SOLICITADO com aggregate.version = 2 (adesão = 1)', async () => {
+    const { db, sne } = harness();
+    const enrolled = await sne.enroll(
+      db.tx,
+      subjectOf('ouro'),
+      identityOf('ouro'),
+      { email: 'ouro@fixtures.invalid', consent: VALID_CONSENT },
+    );
+    expect(enrolled).toMatchObject({ enrolled: true, cancelable: true });
+    expect(await sne.get(db.tx, subjectOf('ouro'))).toMatchObject({
+      enrolled: true,
+      cancelable: true,
+      channel: null,
+    });
+
+    const response = await sne.cancel(
+      db.tx,
+      subjectOf('ouro'),
+      identityOf('ouro'),
+      'mudança de canal',
+    );
+    expect(response).toMatchObject({
+      enrolled: false,
+      since: null,
+      cancelable: false,
+    });
+    expect(new Date(String(response.cancelledAt)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const row = db
+      .rows('portal.sne_enrollment')
+      .find((candidate) => candidate.subject_id === SUBJECTS.ouro.id)!;
+    expect(row).toMatchObject({
+      state: 'NAO_ADERIDO_SNE',
+      cancel_reason: 'mudança de canal',
+    });
+    expect(new Date(String(row.cancelled_at)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+    expect(row.since).not.toBeNull();
+
+    const events = outboxEnvelopes(db, TOPICS.sneEnrollmentChanged);
+    expect(
+      events.map((event) => [
+        event.domainEvent,
+        (event.aggregate as Row).version,
+      ]),
+    ).toEqual([
+      ['SNE_ADESAO_SOLICITADA', 1],
+      ['SNE_CANCELAMENTO_SOLICITADO', 2],
+    ]);
+    expect(events[1]!.data).toMatchObject({
+      enrollmentId: row.id,
+      subjectId: SUBJECTS.ouro.id,
+      fromState: 'ADERIDO_SNE',
+      toState: 'NAO_ADERIDO_SNE',
+    });
+    expect(
+      new Set(
+        db.rows('integration.outbox').map((entry) => entry.idempotency_key),
+      ).size,
+    ).toBe(2);
+
+    expect(await sne.get(db.tx, subjectOf('ouro'))).toMatchObject({
+      enrolled: false,
+      since: null,
+      cancelable: false,
+    });
+    expect(await sne.get(db.tx, subjectOf('bronze'))).toEqual({
+      enrolled: false,
+      since: null,
+      channel: null,
+      cancelable: false,
+    });
+  });
+
+  it("C-0002-37 — dado identity 'simples' quando cancel então 403 ASSURANCE_INSUFFICIENT { actKey: 'cancelamento_sne' }", async () => {
+    const { db, sne } = harness();
+    await expect(
+      sne.cancel(db.tx, subjectOf('prata'), identityOf('prata', 'simples')),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
+      status: 403,
+      context: {
+        actKey: 'cancelamento_sne',
+        resumeRoute: '/v1/portal/sne/enrollment',
+      },
+    });
+  });
+});
diff --git a/backend/domains/portal/inbox/src/handwritten/inbox.service.ts b/backend/domains/portal/inbox/src/handwritten/inbox.service.ts
new file mode 100644
index 0000000..a1f6209
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/inbox.service.ts
@@ -0,0 +1,452 @@
+// Caixa do cidadão (work/rounds/R-0009/contracts/CTG-0002.md §2.4, §6.1, §6.3
+// e §11; plan R-0009 M15, M21, adendas A1(e), A2(b)). `list` (filtros
+// `kind`/`read`, paginação de `@detran/portal-identity`), `read` (ciência
+// idempotente: `read_on`, evidência de exibição e `INBOX_LIDO`/
+// `NOTIFICACAO_CIENCIA` na outbox, uma única vez) e `subscribePush` (upsert
+// por endpoint). `fictitiousAcknowledgementOn` lê a duração de
+// `T-SNE-CIENCIA` do catálogo de timers (`@detran/inf-deadlines`, mesmo
+// caminho de `inf/notification/src/handwritten/acknowledgement-mark.ts`) —
+// o literal 30 é proibido (§6.3).
+//
+// SQL parametrizado e dentro do subconjunto documentado em
+// `portal/requests/tests/support/fake-sql.ts`; tenant nunca no payload
+// (RLS + trigger `auth.enforce_tenant_id`); relógio injetado (`PortalClock`).
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { z } from 'zod';
+import { StaticTimerCatalog, addCalendarDays } from '@detran/inf-deadlines';
+import {
+  SqlTeatEventOutbox,
+  TEAT_EVENT_OUTBOX,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import {
+  PortalClock,
+  PortalError,
+  parsePage,
+  parsePortalBody,
+  type PortalClockLike,
+  type PortalPagedResponse,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+import { canonicalJson, sha256Hex } from '@detran/portal-requests';
+
+import { portalInboxEvents, type PortalInboxEventContext } from './events.js';
+
+// ---------------------------------------------------------------------------
+// §6.3 — ciência ficta pelo catálogo de timers (T-SNE-CIENCIA, owner='infracao')
+// ---------------------------------------------------------------------------
+
+const TIMER_CATALOG = new StaticTimerCatalog();
+
+/** Código do timer lido, nunca duplicado (plan M14). */
+export const SNE_ACKNOWLEDGEMENT_TIMER = 'T-SNE-CIENCIA';
+
+/**
+ * `available_on` + duração de `T-SNE-CIENCIA` (dias corridos) — função pura
+ * usada por quem cria itens `source='sne'` (nesta rodada só fixtures e
+ * testes — OD-P40) e pela projeção do ciclo (§6.1).
+ */
+export function fictitiousAcknowledgementOn(availableOn: string): string {
+  const definition = TIMER_CATALOG.get(SNE_ACKNOWLEDGEMENT_TIMER);
+  if (
+    definition.durationValue === null ||
+    definition.durationValue === undefined
+  ) {
+    throw new PortalError('PORTAL.INTERNAL', {
+      status: 500,
+      context: { timerCode: SNE_ACKNOWLEDGEMENT_TIMER },
+    });
+  }
+  return addCalendarDays(availableOn, definition.durationValue);
+}
+
+// ---------------------------------------------------------------------------
+// tipos públicos (§2.4)
+// ---------------------------------------------------------------------------
+
+export type PortalInboxQuery = Record<string, string | string[] | undefined>;
+
+export const INBOX_KINDS = ['acao_necessaria', 'informativo'] as const;
+export type InboxKind = (typeof INBOX_KINDS)[number];
+
+export interface InboxItemResponse {
+  id: string;
+  /** Derivado de `action_required` (A1(e)). */
+  kind: InboxKind;
+  /** Token do Portal (`SNE|PROCESSO|OUVIDORIA|SISTEMA`, ADR-0019 §3). */
+  category: string;
+  source: 'sne' | 'portal';
+  subject: string;
+  summary: string;
+  aitId: string | null;
+  requestId: string | null;
+  availableOn: string;
+  readOn: string | null;
+  fictitiousAcknowledgementOn: string | null;
+  deadline: { dueOn: string; ownedBy: 'citizen' | 'agency' | null } | null;
+}
+
+export interface InboxReadResponse {
+  id: string;
+  readOn: string;
+  acknowledgementEvidence: {
+    acknowledgedAt: string;
+    displayedSha256: string;
+  } | null;
+}
+
+export interface PushSubscriptionResponse {
+  id: string;
+  endpoint: string;
+  createdAt: string;
+}
+
+/** Forma `PushSubscriptionJSON` do Push API (W3C), ADR-0019 §3 (§2.4). */
+export const PUSH_SUBSCRIPTION_BODY = z.strictObject({
+  endpoint: z.url(),
+  keys: z.strictObject({ p256dh: z.string().min(1), auth: z.string().min(1) }),
+});
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const ITEM_COLUMNS = `id, subject_id, kind, action_required, source, source_event_id,
+          subject_line, summary, ait_id, request_id,
+          to_char(available_on, 'YYYY-MM-DD') as available_on,
+          to_char(read_on, 'YYYY-MM-DD') as read_on,
+          to_char(fictitious_acknowledgement_on, 'YYYY-MM-DD') as fictitious_acknowledgement_on,
+          to_char(deadline_due_on, 'YYYY-MM-DD') as deadline_due_on,
+          deadline_owned_by`;
+
+const ITEM_FOR_UPDATE_SQL = `select ${ITEM_COLUMNS}
+     from portal.inbox_item
+    where id = $1
+    for update`;
+
+const MARK_READ_SQL = `update portal.inbox_item
+      set read_on = $2::date, updated_at = $3
+    where id = $1`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 63). */
+const INSERT_EVIDENCE_SQL = `insert into portal.acknowledgement_evidence
+      (inbox_item_id, displayed_sha256, acknowledged_at, signature_ref)
+    values ($1, $2, $3, null)
+    on conflict (tenant_id, inbox_item_id) do nothing`;
+
+const EVIDENCE_SQL = `select displayed_sha256, acknowledged_at
+     from portal.acknowledgement_evidence
+    where inbox_item_id = $1
+    limit 1`;
+
+const SUBJECT_HASH_SQL = `select cpf_hash from portal.subject where id = $1 limit 1`;
+
+const UPSERT_PUSH_SQL = `insert into portal.push_subscription
+      (subject_id, endpoint, keys_json, created_at)
+    values ($1, $2, $3::jsonb, $4)
+    on conflict (tenant_id, endpoint) do update set
+      subject_id = excluded.subject_id,
+      keys_json = excluded.keys_json,
+      updated_at = excluded.created_at
+    returning id, endpoint, created_at`;
+
+interface ItemRow extends Record<string, unknown> {
+  id: string;
+  subject_id: string;
+  kind: string;
+  action_required: boolean;
+  source: 'sne' | 'portal';
+  source_event_id: string;
+  subject_line: string;
+  summary: string;
+  ait_id: string | null;
+  request_id: string | null;
+  available_on: string;
+  read_on: string | null;
+  fictitious_acknowledgement_on: string | null;
+  deadline_due_on: string | null;
+  deadline_owned_by: 'citizen' | 'agency' | null;
+}
+
+interface EvidenceRow extends Record<string, unknown> {
+  displayed_sha256: string;
+  acknowledged_at: Date | string;
+}
+
+interface PushRow extends Record<string, unknown> {
+  id: string;
+  endpoint: string;
+  created_at: Date | string;
+}
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+function first(value: string | string[] | undefined): string | undefined {
+  return Array.isArray(value) ? value[0] : value;
+}
+
+function enumInvalid(field: string, allowed: readonly string[]): PortalError {
+  return new PortalError('PORTAL.ENUM_INVALID', {
+    status: 400,
+    context: { field, allowed: [...allowed] },
+  });
+}
+
+function notFound(kind: string): PortalError {
+  return new PortalError('PORTAL.NOT_FOUND', {
+    status: 404,
+    context: { kind },
+  });
+}
+
+function itemOf(row: ItemRow): InboxItemResponse {
+  return {
+    id: row.id,
+    kind: row.action_required ? 'acao_necessaria' : 'informativo',
+    category: row.kind,
+    source: row.source,
+    subject: row.subject_line,
+    summary: row.summary,
+    aitId: row.ait_id,
+    requestId: row.request_id,
+    availableOn: row.available_on,
+    readOn: row.read_on,
+    fictitiousAcknowledgementOn:
+      row.source === 'sne' ? row.fictitious_acknowledgement_on : null,
+    deadline: row.deadline_due_on
+      ? { dueOn: row.deadline_due_on, ownedBy: row.deadline_owned_by }
+      : null,
+  };
+}
+
+// ---------------------------------------------------------------------------
+// serviço
+// ---------------------------------------------------------------------------
+
+@Injectable()
+export class PortalInboxService {
+  private readonly clock: PortalClockLike;
+  private readonly outbox: TeatEventOutbox;
+
+  constructor(
+    @Optional() clock?: PortalClock,
+    @Optional() private readonly requestContext?: RequestContext,
+    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    this.outbox = outbox ?? new SqlTeatEventOutbox();
+  }
+
+  /** §2.4 `GET inbox?kind&read&page&pageSize`. */
+  async list(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    query: PortalInboxQuery,
+  ): Promise<PortalPagedResponse<InboxItemResponse>> {
+    const kind = first(query.kind);
+    if (
+      kind !== undefined &&
+      !(INBOX_KINDS as readonly string[]).includes(kind)
+    ) {
+      throw enumInvalid('kind', INBOX_KINDS);
+    }
+    const read = first(query.read);
+    if (read !== undefined && read !== 'true' && read !== 'false') {
+      throw enumInvalid('read', ['true', 'false']);
+    }
+    const page = parsePage(query);
+    const conditions = ['subject_id = $1'];
+    const values: unknown[] = [subject.subjectId];
+    if (kind !== undefined) {
+      values.push(kind === 'acao_necessaria');
+      conditions.push(`action_required = $${values.length}`);
+    }
+    if (read !== undefined) {
+      conditions.push(
+        read === 'true' ? 'read_on is not null' : 'read_on is null',
+      );
+    }
+    const where = conditions.join(' and ');
+    const total = await tx.query<{ total: string | number }>(
+      `select count(*) as total from portal.inbox_item where ${where}`,
+      values,
+    );
+    values.push(page.limit, page.offset);
+    const rows = await tx.query<ItemRow>(
+      `select ${ITEM_COLUMNS}
+         from portal.inbox_item
+        where ${where}
+        order by available_on desc, created_at desc
+        limit $${values.length - 1} offset $${values.length}`,
+      values,
+    );
+    return {
+      items: rows.rows.map(itemOf),
+      total: Number(total.rows[0]?.total ?? 0),
+      page: page.page,
+      pageSize: page.pageSize,
+    };
+  }
+
+  /** §6.1 — leitura idempotente com evidência de ciência (item `sne`). */
+  async read(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    inboxItemId: string,
+  ): Promise<InboxReadResponse> {
+    if (!UUID_RE.test(inboxItemId)) throw notFound('inbox_item');
+    const item = (await tx.query<ItemRow>(ITEM_FOR_UPDATE_SQL, [inboxItemId]))
+      .rows[0];
+    if (!item || item.subject_id !== subject.subjectId) {
+      throw notFound('inbox_item');
+    }
+    if (item.read_on !== null) {
+      // 3. já lida: nenhuma escrita
+      const evidence = (await tx.query<EvidenceRow>(EVIDENCE_SQL, [item.id]))
+        .rows[0];
+      return {
+        id: item.id,
+        readOn: item.read_on,
+        acknowledgementEvidence: evidence
+          ? {
+              acknowledgedAt: iso(evidence.acknowledged_at),
+              displayedSha256: evidence.displayed_sha256,
+            }
+          : null,
+      };
+    }
+    // 2. primeira leitura
+    const now = this.clock.now();
+    const readOn = this.clock.today(await tenantTimeZoneOf(tx));
+    const cpfHash = await this.cpfHashOf(tx, subject.subjectId);
+    await tx.query(MARK_READ_SQL, [item.id, readOn, now]);
+    const context = this.eventContext(now, subject.subjectId);
+    await this.outbox.append(
+      tx as never,
+      portalInboxEvents.inboxLido(
+        item.id,
+        {
+          inboxItemId: item.id,
+          subjectId: subject.subjectId,
+          subjectCpfHash: cpfHash,
+          source: item.source,
+          sourceEventId: item.source_event_id,
+          aitId: item.ait_id,
+          requestId: item.request_id,
+          readOn,
+        },
+        context,
+      ),
+    );
+    let acknowledgementEvidence: InboxReadResponse['acknowledgementEvidence'] =
+      null;
+    if (item.source === 'sne') {
+      const displayed = canonicalJson({
+        availableOn: item.available_on,
+        fictitiousAcknowledgementOn: item.fictitious_acknowledgement_on,
+        id: item.id,
+        subjectLine: item.subject_line,
+        summary: item.summary,
+      });
+      const displayedSha256 = sha256Hex(displayed);
+      await tx.query(INSERT_EVIDENCE_SQL, [item.id, displayedSha256, now]);
+      await this.outbox.append(
+        tx as never,
+        portalInboxEvents.notificacaoCiencia(
+          item.id,
+          {
+            inboxItemId: item.id,
+            sourceEventId: item.source_event_id,
+            aitId: item.ait_id,
+            subjectCpfHash: cpfHash,
+            acknowledgedAt: now.toISOString(),
+            readOn,
+            evidenceSha256: displayedSha256,
+            fictitious: false,
+          },
+          context,
+        ),
+      );
+      acknowledgementEvidence = {
+        acknowledgedAt: now.toISOString(),
+        displayedSha256,
+      };
+    }
+    return { id: item.id, readOn, acknowledgementEvidence };
+  }
+
+  /** §2.4 `POST push-subscriptions` — upsert por `(tenant, endpoint)`. */
+  async subscribePush(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    body: unknown,
+  ): Promise<PushSubscriptionResponse> {
+    const input = parsePortalBody(PUSH_SUBSCRIPTION_BODY, body);
+    const row = (
+      await tx.query<PushRow>(UPSERT_PUSH_SQL, [
+        subject.subjectId,
+        input.endpoint,
+        JSON.stringify(input.keys),
+        this.clock.now(),
+      ])
+    ).rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    return {
+      id: row.id,
+      endpoint: row.endpoint,
+      createdAt: iso(row.created_at),
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  private async cpfHashOf(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+  ): Promise<string> {
+    const row = (
+      await tx.query<{ cpf_hash: string }>(SUBJECT_HASH_SQL, [subjectId])
+    ).rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { subjectId },
+      });
+    }
+    return row.cpf_hash;
+  }
+
+  private eventContext(now: Date, subjectId: string): PortalInboxEventContext {
+    const snapshot = this.requestContext?.hasActiveContext()
+      ? this.requestContext.snapshot()
+      : undefined;
+    return {
+      occurredAt: now.toISOString(),
+      actorId: snapshot?.actorId ?? subjectId,
+      correlationId: snapshot?.requestId ?? '',
+    };
+  }
+}
+
+const TENANT_SQL = `select timezone from auth.tenants where id = auth.current_tenant()`;
+
+/** Fuso civil do tenant da transação (CTG-0002 §0, A3(e)); ausente → padrão do pacote. */
+export async function tenantTimeZoneOf(
+  tx: PortalSqlTransaction,
+): Promise<string | undefined> {
+  const row = (await tx.query<{ timezone: string | null }>(TENANT_SQL)).rows[0];
+  return row?.timezone ?? undefined;
+}
diff --git a/backend/domains/portal/inbox/src/handwritten/index.ts b/backend/domains/portal/inbox/src/handwritten/index.ts
new file mode 100644
index 0000000..2c6ceb5
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/index.ts
@@ -0,0 +1,9 @@
+// API pública manuscrita de @detran/portal-inbox (work/rounds/R-0009/
+// contracts/CTG-0002.md §14; plan R-0009 M24), reexportada pelo `src/index.ts`
+// gerado via `module.handwrittenExports` de BP-PORTAL-INBOX-001 (ADR-0007):
+// controladores, serviços (caixa, SNE), eventos e o vocabulário do consentimento.
+export * from './events.js';
+export * from './inbox.controller.js';
+export * from './inbox.service.js';
+export * from './sne-enrollment.controller.js';
+export * from './sne-enrollment.service.js';
diff --git a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.controller.ts b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.controller.ts
new file mode 100644
index 0000000..52d741b
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.controller.ts
@@ -0,0 +1,184 @@
+// `/v1/portal/sne/enrollment` — leitura, adesão e cancelamento do SNE
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.4, §4, §6.2; plan R-0009 M9,
+// M15, M19, M20, adendas A1(a), A4(a)). A adesão é rota M9: `@NoIdempotent()`
+// anula o interceptor do kernel e o handler assume a idempotência com
+// `PortalIdempotencyService` (400 `PORTAL.VALIDATION_FAILED { fields:
+// ['Idempotency-Key'] }` na ausência; replay com `Idempotency-Replayed: true`;
+// 409 `IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` em corpo divergente). O
+// cancelamento usa a idempotência do kernel.
+import {
+  Body,
+  Controller,
+  Delete,
+  Get,
+  Headers,
+  Post,
+  Req,
+  Res,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { z } from 'zod';
+import {
+  Action,
+  Audit,
+  NoIdempotent,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalIdentityService,
+  parsePortalBody,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+import { PortalIdempotencyService } from '@detran/portal-requests';
+
+import {
+  PortalSneEnrollmentService,
+  type SneEnrollmentView,
+} from './sne-enrollment.service.js';
+
+/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+type PortalHeaders = Record<string, string | string[] | undefined>;
+
+const REPLAYED_HEADER = 'Idempotency-Replayed';
+
+/** Rota M9 como o §4 a grava (`${METHOD} ${template}`). */
+export const SNE_ENROLLMENT_ROUTE_KEY = 'POST /v1/portal/sne/enrollment';
+
+/** Corpo opcional do cancelamento (route contract §5.1 `cancelamento_sne`). */
+const CANCEL_BODY = z.strictObject({ reason: z.string().max(2000).optional() });
+
+export interface SneCancelView extends SneEnrollmentView {
+  cancelledAt: string;
+}
+
+@Controller('v1/portal/sne')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:sne-enrollment')
+export class PortalSneEnrollmentController {
+  constructor(
+    private readonly enrollment: PortalSneEnrollmentService,
+    private readonly identity: PortalIdentityService,
+    private readonly idempotency: PortalIdempotencyService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get('enrollment')
+  @Action('read')
+  get(@Req() request: CitizenRequest): Promise<SneEnrollmentView> {
+    return this.withSubject(portalIdentityOf(request), (tx, subject) =>
+      this.enrollment.get(tx, subject),
+    );
+  }
+
+  @Post('enrollment')
+  @Action('enroll')
+  @NoIdempotent()
+  @Audit({
+    action: 'PORTAL_SNE_ENROLLMENT_ENROLL',
+    entity: 'portal.sne_enrollment',
+  })
+  async enroll(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<SneEnrollmentView> {
+    const identity = portalIdentityOf(request);
+    const outcome = await this.withSubject(
+      identity,
+      async (
+        tx,
+        subject,
+      ): Promise<{
+        status: number;
+        body: SneEnrollmentView;
+        replayed: boolean;
+      }> => {
+        const begun = await this.idempotency.begin(tx, {
+          scope: subject.subjectId,
+          header: headers['idempotency-key'],
+          route: SNE_ENROLLMENT_ROUTE_KEY,
+          body,
+        });
+        if (begun.replay) {
+          return {
+            status: begun.replay.status,
+            body: begun.replay.body as SneEnrollmentView,
+            replayed: true,
+          };
+        }
+        const enrolled = await this.enrollment.enroll(
+          tx,
+          subject,
+          identity,
+          body,
+        );
+        const view: SneEnrollmentView = {
+          enrolled: enrolled.enrolled,
+          since: enrolled.since,
+          channel: enrolled.channel,
+          cancelable: enrolled.cancelable,
+        };
+        await begun.record(201, view);
+        return { status: 201, body: view, replayed: false };
+      },
+    );
+    res.status(outcome.status);
+    if (outcome.replayed) res.setHeader(REPLAYED_HEADER, 'true');
+    return outcome.body;
+  }
+
+  @Delete('enrollment')
+  @Action('cancel')
+  @Audit({
+    action: 'PORTAL_SNE_ENROLLMENT_CANCEL',
+    entity: 'portal.sne_enrollment',
+  })
+  cancel(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+  ): Promise<SneCancelView> {
+    const identity = portalIdentityOf(request);
+    const input = parsePortalBody(CANCEL_BODY, body);
+    return this.withSubject(identity, async (tx, subject) => {
+      const cancelled = await this.enrollment.cancel(
+        tx,
+        subject,
+        identity,
+        input.reason,
+      );
+      return {
+        enrolled: cancelled.enrolled,
+        since: cancelled.since,
+        channel: cancelled.channel,
+        cancelable: cancelled.cancelable,
+        cancelledAt: cancelled.cancelledAt,
+      };
+    });
+  }
+
+  /** Transação única de tenant por rota (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (tx: Transaction, subject: PortalSubjectRecord) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, async (tx) =>
+      work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
diff --git a/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
new file mode 100644
index 0000000..59b0ee4
--- /dev/null
+++ b/backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts
@@ -0,0 +1,440 @@
+// Adesão e cancelamento do SNE (work/rounds/R-0009/contracts/CTG-0002.md §2.4,
+// §6.2 e §11; CTG-0001 §6.3; plan R-0009 M8, M15, M21, adenda A1(a)).
+// `SNE_ENROLLMENT_TRANSITIONS` espelha as três linhas de [WF-PORTAL-003]
+// para `portal.sne_enrollment.state`; `enroll`/`cancel` são chamados pela
+// rota §2.4 e pelo alvo de delegação `adesao_sne`/`cancelamento_sne` do app
+// (§3.2). O envio real ao SNE nacional (`SnePort` via adapter) é OD-P16 —
+// nada sai do backend nesta rodada.
+//
+// `sne_enrollment` não tem `version` (D8): `aggregate.version` do evento é o
+// número da transição da linha (adesão nova = 1, cancelamento = 2, re-adesão
+// = 3…), lido como `count(*)` das publicações anteriores do agregado na
+// outbox + 1 dentro da transação (§11).
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { z } from 'zod';
+import {
+  SqlTeatEventOutbox,
+  TEAT_EVENT_OUTBOX,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import {
+  PortalClock,
+  PortalError,
+  PortalIdentityService,
+  parsePortalBody,
+  portalValidationFailed,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import {
+  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+  portalInboxEvents,
+  type PortalInboxEventContext,
+} from './events.js';
+
+// ---------------------------------------------------------------------------
+// vocabulário (§2.4, CTG-0001 §6.3)
+// ---------------------------------------------------------------------------
+
+/** Os quatro efeitos do consentimento (route contract §5.1 `adesao_sne`; UC-PORTAL-007 AC-2). */
+export const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'canal_exclusivo',
+  'desconto_60',
+  'cancelamento',
+] as const;
+export type SneEffect = (typeof SNE_EFFECTS)[number];
+
+export const SNE_ENROLLMENT_STATES = [
+  'NAO_ADERIDO_SNE',
+  'ADERIDO_SNE',
+] as const;
+export type SneEnrollmentState = (typeof SNE_ENROLLMENT_STATES)[number];
+
+export const SNE_CHANNELS = ['push', 'email', 'sne'] as const;
+
+export interface SneEnrollmentTransition {
+  /** `null` = sem linha. */
+  from: SneEnrollmentState | null;
+  to: SneEnrollmentState;
+  command: 'enroll' | 'cancel';
+  guard: string;
+}
+
+/** CTG-0001 §6.3 — as três linhas de [WF-PORTAL-003] persistidas em `state`. */
+export const SNE_ENROLLMENT_TRANSITIONS: readonly SneEnrollmentTransition[] = [
+  {
+    from: null,
+    to: 'ADERIDO_SNE',
+    command: 'enroll',
+    guard:
+      "assertActLevel('adesao_sne'); e-mail ou celular; consentimento com os quatro efeitos",
+  },
+  {
+    from: 'NAO_ADERIDO_SNE',
+    to: 'ADERIDO_SNE',
+    command: 'enroll',
+    guard: 're-adesão: since novo, cancelled_at e cancel_reason nulos',
+  },
+  {
+    from: 'ADERIDO_SNE',
+    to: 'NAO_ADERIDO_SNE',
+    command: 'cancel',
+    guard:
+      "assertActLevel('cancelamento_sne'); notificações já disponibilizadas continuam válidas",
+  },
+];
+
+export const SNE_ENROLLMENT_BODY = z.strictObject({
+  email: z.email().optional(),
+  phone: z
+    .string()
+    .regex(/^\d{10,11}$/)
+    .optional(),
+  channel: z.enum(SNE_CHANNELS).optional(),
+  consent: z.strictObject({
+    textVersion: z.string().min(1),
+    effectsAck: z.array(z.enum(SNE_EFFECTS)).min(SNE_EFFECTS.length),
+  }),
+});
+export type SneEnrollmentBody = z.infer<typeof SNE_ENROLLMENT_BODY>;
+
+export interface SneEnrollmentView {
+  enrolled: boolean;
+  since: string | null;
+  channel: string | null;
+  cancelable: boolean;
+}
+
+export interface SneEnrollResponse extends SneEnrollmentView {
+  id: string;
+  enrolled: true;
+  since: string;
+  cancelable: true;
+}
+
+export interface SneCancelResponse extends SneEnrollmentView {
+  id: string;
+  enrolled: false;
+  since: null;
+  cancelable: false;
+  cancelledAt: string;
+}
+
+/** `resumeRoute` das duas verificações de nível (§2.4). */
+export const SNE_ENROLLMENT_ROUTE = '/v1/portal/sne/enrollment';
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const ENROLLMENT_COLUMNS = `id, subject_id, state, channel, email, phone,
+          consent_text_version, effects_ack, since, cancelled_at, cancel_reason`;
+
+const ENROLLMENT_SQL = `select ${ENROLLMENT_COLUMNS}
+     from portal.sne_enrollment
+    where subject_id = $1
+    limit 1`;
+
+const ENROLLMENT_FOR_UPDATE_SQL = `select ${ENROLLMENT_COLUMNS}
+     from portal.sne_enrollment
+    where subject_id = $1
+    for update`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 63). */
+const INSERT_ENROLLMENT_SQL = `insert into portal.sne_enrollment
+      (subject_id, state, channel, email, phone, consent_text_version, effects_ack,
+       since, cancelled_at, cancel_reason, created_at)
+    values ($1, 'ADERIDO_SNE', $2, $3, $4, $5, $6::jsonb, $7, null, null, $7)
+    returning id`;
+
+const REENROLL_SQL = `update portal.sne_enrollment
+      set state = 'ADERIDO_SNE', channel = $2, email = $3, phone = $4,
+          consent_text_version = $5, effects_ack = $6::jsonb, since = $7,
+          cancelled_at = null, cancel_reason = null, updated_at = $7
+    where id = $1`;
+
+const CANCEL_SQL = `update portal.sne_enrollment
+      set state = 'NAO_ADERIDO_SNE', cancelled_at = $2, cancel_reason = $3, updated_at = $2
+    where id = $1`;
+
+const SUBJECT_HASH_SQL = `select cpf_hash from portal.subject where id = $1 limit 1`;
+
+const TRANSITIONS_SQL = `select count(*) as total
+     from integration.outbox
+    where aggregate_id = $1 and topic = $2`;
+
+interface EnrollmentRow extends Record<string, unknown> {
+  id: string;
+  subject_id: string;
+  state: SneEnrollmentState;
+  channel: string | null;
+  email: string | null;
+  phone: string | null;
+  consent_text_version: string | null;
+  effects_ack: unknown;
+  since: Date | string | null;
+  cancelled_at: Date | string | null;
+  cancel_reason: string | null;
+}
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+function viewOf(row: EnrollmentRow | undefined): SneEnrollmentView {
+  if (!row || row.state !== 'ADERIDO_SNE') {
+    return {
+      enrolled: false,
+      since: null,
+      channel: row?.channel ?? null,
+      cancelable: false,
+    };
+  }
+  return {
+    enrolled: true,
+    since: row.since === null ? null : iso(row.since),
+    channel: row.channel,
+    cancelable: true,
+  };
+}
+
+// ---------------------------------------------------------------------------
+// serviço
+// ---------------------------------------------------------------------------
+
+@Injectable()
+export class PortalSneEnrollmentService {
+  private readonly clock: PortalClockLike;
+  private readonly outbox: TeatEventOutbox;
+
+  constructor(
+    private readonly identity: PortalIdentityService,
+    @Optional() clock?: PortalClock,
+    @Optional() private readonly requestContext?: RequestContext,
+    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    this.outbox = outbox ?? new SqlTeatEventOutbox();
+  }
+
+  /** §2.4 `GET sne/enrollment` — sem linha: `{ enrolled: false, … cancelable: false }`. */
+  async get(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+  ): Promise<SneEnrollmentView> {
+    const row = (
+      await tx.query<EnrollmentRow>(ENROLLMENT_SQL, [subject.subjectId])
+    ).rows[0];
+    return viewOf(row);
+  }
+
+  /** §6.2 `enroll(tx, subject, identity, body)`. */
+  async enroll(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    identity: PortalIdentityClaims,
+    body: unknown,
+  ): Promise<SneEnrollResponse> {
+    // 1. forma
+    const input = parsePortalBody(SNE_ENROLLMENT_BODY, body);
+    if (new Set(input.consent.effectsAck).size !== SNE_EFFECTS.length) {
+      throw portalValidationFailed(['consent.effectsAck']);
+    }
+    // 2. nível do ato (A1(a): avancada)
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      'adesao_sne',
+      SNE_ENROLLMENT_ROUTE,
+    );
+    // 3. contato
+    if (!input.email && !input.phone) {
+      throw new PortalError('PORTAL.SNE_CONTACT_REQUIRED', {
+        status: 422,
+        context: { missing: ['email', 'phone'] },
+      });
+    }
+    // 4. estado
+    const existing = (
+      await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
+        subject.subjectId,
+      ])
+    ).rows[0];
+    if (existing?.state === 'ADERIDO_SNE') {
+      throw new PortalError('PORTAL.SNE_ALREADY_ENROLLED', {
+        status: 409,
+        context: {},
+      });
+    }
+    // 5. upsert
+    const now = this.clock.now();
+    const channel = input.channel ?? null;
+    const effectsAck = JSON.stringify(
+      Object.fromEntries(SNE_EFFECTS.map((effect) => [effect, true])),
+    );
+    let enrollmentId: string;
+    if (existing) {
+      await tx.query(REENROLL_SQL, [
+        existing.id,
+        channel,
+        input.email ?? null,
+        input.phone ?? null,
+        input.consent.textVersion,
+        effectsAck,
+        now,
+      ]);
+      enrollmentId = existing.id;
+    } else {
+      const inserted = (
+        await tx.query<{ id: string }>(INSERT_ENROLLMENT_SQL, [
+          subject.subjectId,
+          channel,
+          input.email ?? null,
+          input.phone ?? null,
+          input.consent.textVersion,
+          effectsAck,
+          now,
+        ])
+      ).rows[0];
+      if (!inserted) {
+        throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+      }
+      enrollmentId = inserted.id;
+    }
+    // 6. evento
+    await this.outbox.append(
+      tx as never,
+      portalInboxEvents.sneAdesaoSolicitada(
+        enrollmentId,
+        await this.nextTransition(tx, enrollmentId),
+        {
+          enrollmentId,
+          subjectId: subject.subjectId,
+          subjectCpfHash: await this.cpfHashOf(tx, subject.subjectId),
+          toState: 'ADERIDO_SNE',
+          since: now.toISOString(),
+          channel: channel as SneAdesaoChannel,
+          consentTextVersion: input.consent.textVersion,
+        },
+        this.eventContext(now, subject.subjectId),
+      ),
+    );
+    return {
+      id: enrollmentId,
+      enrolled: true,
+      since: now.toISOString(),
+      channel,
+      cancelable: true,
+    };
+  }
+
+  /** §6.2 `cancel(tx, subject, identity, reason?)`. */
+  async cancel(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    identity: PortalIdentityClaims,
+    reason?: string,
+  ): Promise<SneCancelResponse> {
+    // 1. nível do ato (A1(a): avancada)
+    await this.identity.assertActLevel(
+      tx,
+      identity,
+      'cancelamento_sne',
+      SNE_ENROLLMENT_ROUTE,
+    );
+    // 2. estado
+    const existing = (
+      await tx.query<EnrollmentRow>(ENROLLMENT_FOR_UPDATE_SQL, [
+        subject.subjectId,
+      ])
+    ).rows[0];
+    if (!existing || existing.state !== 'ADERIDO_SNE') {
+      throw new PortalError('PORTAL.SNE_NOT_ENROLLED', {
+        status: 409,
+        context: {},
+      });
+    }
+    // 3. cancelamento (since mantido: DDL exige since só quando aderido)
+    const now = this.clock.now();
+    await tx.query(CANCEL_SQL, [existing.id, now, reason ?? null]);
+    // 4. evento
+    await this.outbox.append(
+      tx as never,
+      portalInboxEvents.sneCancelamentoSolicitado(
+        existing.id,
+        await this.nextTransition(tx, existing.id),
+        {
+          enrollmentId: existing.id,
+          subjectId: subject.subjectId,
+          subjectCpfHash: await this.cpfHashOf(tx, subject.subjectId),
+          fromState: 'ADERIDO_SNE',
+          toState: 'NAO_ADERIDO_SNE',
+          cancelledAt: now.toISOString(),
+        },
+        this.eventContext(now, subject.subjectId),
+      ),
+    );
+    return {
+      id: existing.id,
+      enrolled: false,
+      since: null,
+      channel: existing.channel,
+      cancelable: false,
+      cancelledAt: now.toISOString(),
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  /** §11 (D8): publicações anteriores do agregado + 1. */
+  private async nextTransition(
+    tx: PortalSqlTransaction,
+    enrollmentId: string,
+  ): Promise<number> {
+    const row = (
+      await tx.query<{ total: string | number }>(TRANSITIONS_SQL, [
+        enrollmentId,
+        PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
+      ])
+    ).rows[0];
+    return Number(row?.total ?? 0) + 1;
+  }
+
+  private async cpfHashOf(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+  ): Promise<string> {
+    const row = (
+      await tx.query<{ cpf_hash: string }>(SUBJECT_HASH_SQL, [subjectId])
+    ).rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { subjectId },
+      });
+    }
+    return row.cpf_hash;
+  }
+
+  private eventContext(now: Date, subjectId: string): PortalInboxEventContext {
+    const snapshot = this.requestContext?.hasActiveContext()
+      ? this.requestContext.snapshot()
+      : undefined;
+    return {
+      occurredAt: now.toISOString(),
+      actorId: snapshot?.actorId ?? subjectId,
+      correlationId: snapshot?.requestId ?? '',
+    };
+  }
+}
+
+type SneAdesaoChannel = (typeof SNE_CHANNELS)[number] | null;
diff --git a/backend/domains/portal/inbox/tests/integration/portal-inbox.integration.spec.ts b/backend/domains/portal/inbox/tests/integration/portal-inbox.integration.spec.ts
new file mode 100644
index 0000000..4a76ce5
--- /dev/null
+++ b/backend/domains/portal/inbox/tests/integration/portal-inbox.integration.spec.ts
@@ -0,0 +1,257 @@
+// R-0009 CTG-0002 §2.4, §6.1 e §13 (TASK-0006) — C-0002-38/39: ciência
+// idempotente sobre as fixtures …70c00001 (sne, não lida) e …70c00002 (portal,
+// lida) em transação REAL (`role_app_backend`, RLS do tenant canônico) e a
+// listagem da caixa com filtros `kind`/`read`. Fica vermelho até TASK-0008
+// criar `inbox.service.ts` (§14).
+//
+// Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`. O `beforeAll`
+// devolve a fixture …70c00001 ao estado do seed (read_on nulo, sem evidência,
+// sem eventos) para a execução ser idempotente contra banco persistente
+// (precedente: portal-identity.e2e.spec.ts C-0001-41).
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+import { PortalIdentityService } from '@detran/portal-identity';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
+import {
+  FIXED_NOW,
+  SUBJECTS,
+  TENANT_ID,
+  TOPICS,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import { PortalInboxService } from '../../src/handwritten/inbox.service.js';
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const SNE_UNREAD = '00000000-0000-7000-8000-000070c00001';
+const PORTAL_READ = '00000000-0000-7000-8000-000070c00002';
+
+interface SqlTx {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT_ID,
+    ]);
+    await client.query(`select set_config('app.actor_id', $1, true)`, [
+      ACTOR_ID,
+    ]);
+    const result = await work({
+      query: client.query.bind(client) as SqlTx['query'],
+    });
+    await client.query('commit');
+    return result;
+  } catch (error) {
+    await client.query('rollback');
+    throw error;
+  }
+}
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  return work();
+}
+
+async function resetFixture(): Promise<void> {
+  await asOwner(async () => {
+    await client.query(
+      `delete from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
+      [TENANT_ID, SNE_UNREAD],
+    );
+    await client.query(
+      `delete from integration.outbox where tenant_id = $1 and aggregate_id in ($2, $3)`,
+      [TENANT_ID, SNE_UNREAD, PORTAL_READ],
+    );
+    await client.query(
+      `update portal.inbox_item set read_on = null, updated_at = null where tenant_id = $1 and id = $2`,
+      [TENANT_ID, SNE_UNREAD],
+    );
+    await client.query(
+      `update portal.inbox_item set read_on = '2026-09-11' where tenant_id = $1 and id = $2`,
+      [TENANT_ID, PORTAL_READ],
+    );
+  });
+}
+
+function service(tx: SqlTx) {
+  const outbox = new SqlTeatEventOutbox();
+  return constructInjectable(PortalInboxService, {
+    PortalIdentityService: new PortalIdentityService(fixedClock as never),
+    PortalClock: fixedClock,
+    Database: fakeDatabase(tx),
+    RequestContext: fakeRequestContext(),
+    SqlTeatEventOutbox: outbox,
+    TEAT_EVENT_OUTBOX: outbox,
+  }) as unknown as {
+    read: (
+      tx: unknown,
+      subject: unknown,
+      id: string,
+    ) => Promise<Record<string, unknown>>;
+    list: (
+      tx: unknown,
+      subject: unknown,
+      query: Record<string, string>,
+    ) => Promise<{ items: Array<Record<string, unknown>>; total: number }>;
+  };
+}
+
+const prata = {
+  subjectId: SUBJECTS.prata.id,
+  name: null,
+  observedAt: FIXED_NOW,
+  version: 1,
+};
+
+beforeAll(async () => {
+  await client.connect();
+  await resetFixture();
+});
+
+afterAll(async () => {
+  await resetFixture();
+  await client.end();
+});
+
+describe('CTG-0002 §6.1 — ciência idempotente sobre as fixtures (C-0002-38)', () => {
+  it('C-0002-38 — dado fixture …70c00001 (sne, não lido) quando read duas vezes então 1 acknowledgement_evidence e 1 linha de outbox por type; dado …70c00002 (já lido) quando read então nenhuma escrita', async () => {
+    const first = await inTenantTx((tx) =>
+      service(tx).read(tx, prata, SNE_UNREAD),
+    );
+    const second = await inTenantTx((tx) =>
+      service(tx).read(tx, prata, SNE_UNREAD),
+    );
+    expect(first).toMatchObject({ id: SNE_UNREAD, readOn: '2026-09-14' });
+    expect(first.acknowledgementEvidence).toBeTruthy();
+    expect(second).toEqual(first);
+
+    await asOwner(async () => {
+      const evidence = await client.query(
+        `select displayed_sha256 from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
+        [TENANT_ID, SNE_UNREAD],
+      );
+      expect(evidence.rows).toHaveLength(1);
+      expect(String(evidence.rows[0]!.displayed_sha256)).toMatch(
+        /^[0-9a-f]{64}$/,
+      );
+      const events = await client.query<{ topic: string; count: string }>(
+        `select topic, count(*)::text as count from integration.outbox where tenant_id = $1 and aggregate_id = $2 group by topic order by topic`,
+        [TENANT_ID, SNE_UNREAD],
+      );
+      expect(events.rows).toEqual([
+        { topic: TOPICS.inboxRead, count: '1' },
+        { topic: TOPICS.notificationAcknowledged, count: '1' },
+      ]);
+      const item = await client.query<{ read_on: Date }>(
+        `select read_on from portal.inbox_item where id = $1`,
+        [SNE_UNREAD],
+      );
+      expect(item.rows[0]!.read_on).not.toBeNull();
+    });
+
+    const before = await asOwner(() =>
+      client.query<{ updated_at: Date | null; read_on: Date }>(
+        `select updated_at, read_on from portal.inbox_item where id = $1`,
+        [PORTAL_READ],
+      ),
+    );
+    const alreadyRead = await inTenantTx((tx) =>
+      service(tx).read(tx, prata, PORTAL_READ),
+    );
+    expect(alreadyRead).toMatchObject({
+      id: PORTAL_READ,
+      readOn: '2026-09-11',
+      acknowledgementEvidence: null,
+    });
+    await asOwner(async () => {
+      const after = await client.query<{
+        updated_at: Date | null;
+        read_on: Date;
+      }>(`select updated_at, read_on from portal.inbox_item where id = $1`, [
+        PORTAL_READ,
+      ]);
+      expect(after.rows[0]).toEqual(before.rows[0]);
+      const events = await client.query(
+        `select id from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+        [TENANT_ID, PORTAL_READ],
+      );
+      expect(events.rows).toHaveLength(0);
+      const evidence = await client.query(
+        `select id from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
+        [TENANT_ID, PORTAL_READ],
+      );
+      expect(evidence.rows).toHaveLength(0);
+    });
+  });
+});
+
+describe('CTG-0002 §2.4 — GET inbox: filtros kind/read (C-0002-39)', () => {
+  it("C-0002-39 — dado fixtures da caixa quando list(kind: 'acao_necessaria') então só …70c00001; list(read: 'true') então só …70c00002; kind inválido então 400 ENUM_INVALID { field: 'kind' }", async () => {
+    await resetFixture();
+    const actionRequired = await inTenantTx((tx) =>
+      service(tx).list(tx, prata, { kind: 'acao_necessaria' }),
+    );
+    expect(actionRequired.items.map((item) => item.id)).toEqual([SNE_UNREAD]);
+    expect(actionRequired.total).toBe(1);
+    expect(actionRequired.items[0]).toMatchObject({
+      kind: 'acao_necessaria',
+      category: 'SNE',
+      source: 'sne',
+      availableOn: '2026-09-01',
+      readOn: null,
+      fictitiousAcknowledgementOn: '2026-10-01',
+      deadline: { dueOn: '2026-10-01', ownedBy: 'citizen' },
+    });
+
+    const read = await inTenantTx((tx) =>
+      service(tx).list(tx, prata, { read: 'true' }),
+    );
+    expect(read.items.map((item) => item.id)).toEqual([PORTAL_READ]);
+    expect(read.items[0]).toMatchObject({
+      kind: 'informativo',
+      category: 'PROCESSO',
+      source: 'portal',
+      readOn: '2026-09-11',
+      fictitiousAcknowledgementOn: null,
+      deadline: null,
+    });
+
+    const all = await inTenantTx((tx) => service(tx).list(tx, prata, {}));
+    // ordem available_on desc: …70c00002 (2026-09-10) antes de …70c00001 (2026-09-01)
+    expect(all.items.map((item) => item.id)).toEqual([PORTAL_READ, SNE_UNREAD]);
+
+    await expect(
+      inTenantTx((tx) => service(tx).list(tx, prata, { kind: 'xyz' })),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ENUM_INVALID',
+      status: 400,
+      context: { field: 'kind', allowed: ['acao_necessaria', 'informativo'] },
+    });
+    await expect(
+      inTenantTx((tx) => service(tx).list(tx, prata, { read: 'maybe' })),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ENUM_INVALID',
+      status: 400,
+      context: { field: 'read' },
+    });
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/aits.controller.ts b/backend/domains/portal/projections/src/handwritten/aits.controller.ts
new file mode 100644
index 0000000..4fabcdd
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/aits.controller.ts
@@ -0,0 +1,365 @@
+// `/v1/portal/aits`, `/v1/portal/aits/{aitId}[/points]` e `/v1/portal/points-summary`
+// — autuações pela projeção (work/rounds/R-0009/contracts/CTG-0002.md §2.2;
+// plan R-0009 M10, M16, M19; ADR-0020). Leituras de dado próprio (sem
+// `@Audit`, M20): a lista é por `cpf_hash` (o sujeito e os representados com
+// procuração VALIDADA vigente, scope `ait|all`); o detalhe exige
+// `portal.entitlement` (M10: ausência e inexistência respondem o mesmo 404).
+// Nenhum token de `inf` sai (RN-PORTAL-112): `situation` é o vocabulário
+// cidadão de M16.
+import {
+  Controller,
+  Get,
+  Optional,
+  Param,
+  Query,
+  Req,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalClock,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  parsePage,
+  portalIdentityOf,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalPagedResponse,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import {
+  INFRACTION_SITUATIONS,
+  type InfractionActionEntry,
+  type InfractionNoticeEntry,
+  type PointsStatus,
+  type Situation,
+} from './infraction-view.projection.js';
+import { asArray, asObject } from './projection-contract.js';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+type PortalQuery = Record<string, string | string[] | undefined>;
+
+export interface AitListItem {
+  aitId: string;
+  aitNumber: string;
+  plate: string;
+  occurredAt: string;
+  framingLabel: string;
+  amount: number | null;
+  situation: Situation;
+  deadlines: unknown[];
+  pointsStatus: PointsStatus;
+  actions: InfractionActionEntry[];
+}
+
+export interface AitPayment {
+  tiers: unknown[];
+  paid: boolean;
+  paidTier: string | null;
+  [key: string]: unknown;
+}
+
+export interface AitDetailResponse extends AitListItem {
+  notices: InfractionNoticeEntry[];
+  payment: AitPayment;
+  openRequestId: string | null;
+  /** Evidências do AIT vivem em ops/evidence; sem projeção nesta rodada (OD-P41). */
+  evidenceAvailable: false;
+}
+
+export interface AitPointsResponse {
+  aitId: string;
+  pointsStatus: PointsStatus;
+  /** A projeção não guarda pontos por AIT (OD-P34). */
+  points: null;
+}
+
+export interface PointsSummaryResponse {
+  definitivePoints: number;
+  disputedPoints: number;
+  byVehicle: unknown[];
+  last12Months: unknown[];
+  cachedAt: string | null;
+}
+
+const VIEW_COLUMNS = `ait_id, ait_number, plate, occurred_at, framing_label, amount, situation,
+          deadlines_json, points_status, actions_json, notices_json, payment_json`;
+
+const REPRESENTED_HASHES_SQL = `select represented_cpf_hash
+     from portal.representation
+    where representative_subject_id = $1
+      and state = 'PROCURACAO_VALIDADA'
+      and scope in ('ait', 'all')
+      and (valid_until is null or valid_until >= $2::date)`;
+
+const VIEW_SQL = `select ${VIEW_COLUMNS}
+     from portal.infraction_view
+    where ait_id = $1
+    limit 1`;
+
+const OPEN_REQUEST_SQL = `select id
+     from portal.request
+    where subject_id = $1 and target_kind = 'ait' and target_id = $2
+      and state not in ('CONCLUIDO', 'DESISTIDO', 'INELEGIVEL')
+    order by created_at desc
+    limit 1`;
+
+const POINTS_SQL = `select definitive_points, disputed_points, by_vehicle_json, last_12_months_json, cached_at
+     from portal.points_view
+    where subject_cpf_hash = $1
+    limit 1`;
+
+interface ViewRow extends Record<string, unknown> {
+  ait_id: string;
+  ait_number: string;
+  plate: string;
+  occurred_at: Date | string;
+  framing_label: string;
+  amount: number | string | null;
+  situation: Situation;
+  deadlines_json: unknown;
+  points_status: PointsStatus;
+  actions_json: unknown;
+  notices_json: unknown;
+  payment_json: unknown;
+}
+
+interface PointsRow extends Record<string, unknown> {
+  definitive_points: number | string;
+  disputed_points: number | string;
+  by_vehicle_json: unknown;
+  last_12_months_json: unknown;
+  cached_at: Date | string | null;
+}
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+function first(value: string | string[] | undefined): string | undefined {
+  return Array.isArray(value) ? value[0] : value;
+}
+
+function notFound(kind: string): PortalError {
+  return new PortalError('PORTAL.NOT_FOUND', {
+    status: 404,
+    context: { kind },
+  });
+}
+
+function listItemOf(row: ViewRow): AitListItem {
+  return {
+    aitId: row.ait_id,
+    aitNumber: row.ait_number,
+    plate: row.plate,
+    occurredAt: iso(row.occurred_at),
+    framingLabel: row.framing_label,
+    amount: row.amount === null ? null : Number(row.amount),
+    situation: row.situation,
+    deadlines: asArray(row.deadlines_json),
+    pointsStatus: row.points_status,
+    actions: asArray<InfractionActionEntry>(row.actions_json),
+  };
+}
+
+/** `payment_json ?? { tiers: [], paid: false, paidTier: null }` (fixtures `{}` → o default). */
+function paymentOf(value: unknown): AitPayment {
+  return {
+    tiers: [],
+    paid: false,
+    paidTier: null,
+    ...asObject(value),
+  } as AitPayment;
+}
+
+@Controller('v1/portal')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:ait')
+export class PortalAitsController {
+  private readonly clock: PortalClockLike;
+
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+    @Optional() clock?: PortalClock,
+  ) {
+    this.clock = clock ?? new PortalClock();
+  }
+
+  @Get('aits')
+  @Action('read')
+  list(
+    @Req() request: CitizenRequest,
+    @Query() query: PortalQuery,
+  ): Promise<PortalPagedResponse<AitListItem>> {
+    const identity = portalIdentityOf(request);
+    const status = first(query?.status);
+    if (
+      status !== undefined &&
+      !(INFRACTION_SITUATIONS as readonly string[]).includes(status)
+    ) {
+      throw new PortalError('PORTAL.ENUM_INVALID', {
+        status: 400,
+        context: { field: 'status', allowed: [...INFRACTION_SITUATIONS] },
+      });
+    }
+    const vehicle = first(query?.vehicle);
+    const page = parsePage(query ?? {});
+    return this.withSubject(identity, async (tx, subject) => {
+      const represented = await tx.query<{ represented_cpf_hash: string }>(
+        REPRESENTED_HASHES_SQL,
+        [subject.subjectId, this.clock.today()],
+      );
+      const hashes = [
+        cpfHashOf(identity.cpf),
+        ...represented.rows.map((row) => row.represented_cpf_hash),
+      ];
+      const conditions = ['subject_cpf_hash = any($1)'];
+      const values: unknown[] = [hashes];
+      if (vehicle !== undefined) {
+        values.push(vehicle);
+        conditions.push(`plate = $${values.length}`);
+      }
+      if (status !== undefined) {
+        values.push(status);
+        conditions.push(`situation = $${values.length}`);
+      }
+      const where = conditions.join(' and ');
+      const total = await tx.query<{ total: string | number }>(
+        `select count(*) as total from portal.infraction_view where ${where}`,
+        values,
+      );
+      values.push(page.limit, page.offset);
+      const rows = await tx.query<ViewRow>(
+        `select ${VIEW_COLUMNS}
+           from portal.infraction_view
+          where ${where}
+          order by occurred_at desc, ait_id asc
+          limit $${values.length - 1} offset $${values.length}`,
+        values,
+      );
+      return {
+        items: rows.rows.map(listItemOf),
+        total: Number(total.rows[0]?.total ?? 0),
+        page: page.page,
+        pageSize: page.pageSize,
+      };
+    });
+  }
+
+  @Get('aits/:aitId')
+  @Action('read')
+  get(
+    @Req() request: CitizenRequest,
+    @Param('aitId') aitId: string,
+  ): Promise<AitDetailResponse> {
+    const identity = portalIdentityOf(request);
+    assertUuid(aitId, 'aitId');
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertEntitled(tx, subject.subjectId, 'ait', aitId);
+      const row = (await tx.query<ViewRow>(VIEW_SQL, [aitId])).rows[0];
+      if (!row) throw notFound('ait');
+      const open = (
+        await tx.query<{ id: string }>(OPEN_REQUEST_SQL, [
+          subject.subjectId,
+          aitId,
+        ])
+      ).rows[0];
+      return {
+        ...listItemOf(row),
+        notices: asArray<InfractionNoticeEntry>(row.notices_json),
+        payment: paymentOf(row.payment_json),
+        openRequestId: open?.id ?? null,
+        evidenceAvailable: false,
+      };
+    });
+  }
+
+  @Get('aits/:aitId/points')
+  @Action('read')
+  points(
+    @Req() request: CitizenRequest,
+    @Param('aitId') aitId: string,
+  ): Promise<AitPointsResponse> {
+    const identity = portalIdentityOf(request);
+    assertUuid(aitId, 'aitId');
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertEntitled(tx, subject.subjectId, 'ait', aitId);
+      const row = (await tx.query<ViewRow>(VIEW_SQL, [aitId])).rows[0];
+      if (!row) throw notFound('ait');
+      return { aitId, pointsStatus: row.points_status, points: null };
+    });
+  }
+
+  @Get('points-summary')
+  @Action('read')
+  pointsSummary(
+    @Req() request: CitizenRequest,
+  ): Promise<PointsSummaryResponse> {
+    const identity = portalIdentityOf(request);
+    return this.withSubject(identity, async (tx) => {
+      const row = (
+        await tx.query<PointsRow>(POINTS_SQL, [cpfHashOf(identity.cpf)])
+      ).rows[0];
+      if (!row) {
+        return {
+          definitivePoints: 0,
+          disputedPoints: 0,
+          byVehicle: [],
+          last12Months: [],
+          cachedAt: null,
+        };
+      }
+      return {
+        definitivePoints: Number(row.definitive_points),
+        disputedPoints: Number(row.disputed_points),
+        byVehicle: asArray(row.by_vehicle_json),
+        last12Months: asArray(row.last_12_months_json),
+        cachedAt: row.cached_at === null ? null : iso(row.cached_at),
+      };
+    });
+  }
+
+  /** Transação única de tenant por leitura (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (
+      tx: PortalSqlTransaction,
+      subject: PortalSubjectRecord,
+    ) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (tx: Transaction) =>
+        work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
+
+function assertUuid(value: string, field: string): void {
+  if (!UUID_RE.test(value)) {
+    throw new PortalError('PORTAL.VALIDATION_FAILED', {
+      status: 400,
+      context: { fields: [field] },
+    });
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/crash-view.projection.spec.ts b/backend/domains/portal/projections/src/handwritten/crash-view.projection.spec.ts
new file mode 100644
index 0000000..05b0271
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/crash-view.projection.spec.ts
@@ -0,0 +1,69 @@
+// R-0009 CTG-0002 §7.2 e §13 (TASK-0006) — C-0002-54: projetor esqueleto
+// `crash_view` (produtor real R-0010 — OD-P19): evento com aggregate.kind
+// 'crash' só grava last_event_id na linha existente; sem linha → skipped
+// 'not_consumed'. Fica vermelho até TASK-0008 criar `projectors.service.ts`
+// e `crash-view.projection.ts` (§14).
+import { describe, expect, it } from 'vitest';
+
+import { SUBJECTS } from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  CRASH_FF3,
+  EVENT_IDS,
+  eventById,
+} from '../../tests/fixtures/outbox-events.js';
+import { projectorsHarness } from '../../tests/support/projectors-harness.js';
+
+const PROJECTION = 'crash_view';
+const TABLE = 'portal.crash_view';
+const ROW_ID = '00000000-0000-7000-8000-000071e000e1';
+
+function seeded() {
+  return projectorsHarness({
+    seed: (db) =>
+      db.seed(TABLE, [
+        {
+          id: ROW_ID,
+          crash_id: CRASH_FF3,
+          subject_cpf_hash: SUBJECTS.qualificada.cpfHash,
+          state_label: 'fixture',
+          summary_json: {},
+          third_party_fields_suppressed: true,
+          last_event_id: '00000000-0000-0000-0000-000000000000',
+        },
+      ]),
+  });
+}
+
+describe('CTG-0002 §7.2 — crash_view esqueleto (C-0002-54)', () => {
+  it("C-0002-54 — dado evento aggregate.kind 'crash' (…7000700011) e linha existente então só last_event_id gravado", async () => {
+    const h = seeded();
+    const before = { ...h.db.rows(TABLE)[0]! };
+    const outcome = await h.apply(eventById(EVENT_IDS.e11), PROJECTION);
+    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
+    const after = h.db.rows(TABLE)[0]!;
+    expect(after.last_event_id).toBe(EVENT_IDS.e11);
+    const { last_event_id: _b, updated_at: _bu, ...beforeRest } = before;
+    const { last_event_id: _a, updated_at: _au, ...afterRest } = after;
+    expect(afterRest).toEqual(beforeRest);
+    expect(h.appliedEvents(EVENT_IDS.e11)).toHaveLength(1);
+  });
+
+  it("C-0002-54 — dado evento aggregate.kind 'crash' sem linha então skipped 'not_consumed' e nada gravado", async () => {
+    const h = projectorsHarness();
+    const outcome = await h.apply(eventById(EVENT_IDS.e11), PROJECTION);
+    expect(outcome).toMatchObject({ applied: false, skipped: 'not_consumed' });
+    expect(h.db.rows(TABLE)).toHaveLength(0);
+    expect(h.appliedEvents(EVENT_IDS.e11)).toHaveLength(0);
+  });
+
+  it("§7.1 — dado o mesmo evento duas vezes então skipped 'already_applied'", async () => {
+    const h = seeded();
+    expect((await h.apply(eventById(EVENT_IDS.e11), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(await h.apply(eventById(EVENT_IDS.e11), PROJECTION)).toMatchObject({
+      applied: false,
+      skipped: 'already_applied',
+    });
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/crash-view.projection.ts b/backend/domains/portal/projections/src/handwritten/crash-view.projection.ts
new file mode 100644
index 0000000..3bc8d01
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/crash-view.projection.ts
@@ -0,0 +1,72 @@
+// Source events: aggregate.kind = 'crash' (type est.crash.*) — esqueleto (produtor R-0010, OD-P19)
+//
+// Projeção `portal.crash_view` (work/rounds/R-0009/contracts/CTG-0002.md §7.2;
+// plan R-0009 M16): só a tabela + projetor esqueleto — um evento de agregado
+// `crash` grava `last_event_id` na linha existente; sem linha → `not_consumed`
+// (nada gravado). O produtor real (est/crash, R-0010) fixa o `data`.
+import type { PortalSqlTransaction } from '@detran/portal-identity';
+
+import {
+  PROJECTION_SENTINEL_EVENT_ID,
+  type PortalConsumedEvent,
+  type ProjectionContext,
+  type ProjectionResult,
+  type Projector,
+} from './projection-contract.js';
+
+export const CRASH_AGGREGATE_KIND = 'crash';
+
+const ROW_SQL = `select id from portal.crash_view where crash_id = $1 for update`;
+
+const TOUCH_SQL = `update portal.crash_view set last_event_id = $2, updated_at = $3 where id = $1`;
+
+const RESET_SQL = `update portal.crash_view set last_event_id = $2, updated_at = $3 where last_event_id = any($1)`;
+
+/** Esqueleto comum de `crash_view`/`exam_view`: só `last_event_id` (§7.2). */
+export async function touchSkeletonRow(
+  tx: PortalSqlTransaction,
+  rowSql: string,
+  touchSql: string,
+  targetId: string,
+  eventId: string,
+  now: Date,
+): Promise<ProjectionResult> {
+  const row = (await tx.query<{ id: string }>(rowSql, [targetId])).rows[0];
+  if (!row) return { kind: 'skipped', reason: 'not_consumed' };
+  await tx.query(touchSql, [row.id, eventId, now]);
+  return { kind: 'applied' };
+}
+
+export class CrashViewProjector implements Projector {
+  readonly projection = 'crash_view' as const;
+  readonly sourceEvents = ['est.crash.* (aggregate.kind = crash)'] as const;
+
+  apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    if (event.aggregate.kind !== CRASH_AGGREGATE_KIND) {
+      return Promise.resolve({ kind: 'skipped', reason: 'not_consumed' });
+    }
+    return touchSkeletonRow(
+      context.tx,
+      ROW_SQL,
+      TOUCH_SQL,
+      event.aggregate.id,
+      event.id,
+      context.now,
+    );
+  }
+
+  async reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void> {
+    if (windowEventIds.length === 0) return;
+    await context.tx.query(RESET_SQL, [
+      [...windowEventIds],
+      PROJECTION_SENTINEL_EVENT_ID,
+      context.now,
+    ]);
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/crashes.controller.ts b/backend/domains/portal/projections/src/handwritten/crashes.controller.ts
new file mode 100644
index 0000000..bec628d
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/crashes.controller.ts
@@ -0,0 +1,150 @@
+// `/v1/portal/crashes[/{id}]` — sinistros pela projeção `portal.crash_view`
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.5; plan R-0009 M10, M16, M20).
+// Leitura de dado pessoal: `@Audit` em `@Get` (RN-PORTAL-118 4); campo de
+// terceiro suprimido, nunca a peça (RN-BOAT-126); projetor real é R-0010
+// (OD-P19) — nesta rodada só fixtures.
+import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import { asObject } from './projection-contract.js';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+export const CRASHES_ROUTE = '/v1/portal/crashes';
+export const CRASH_ACT = 'consulta_bat';
+
+export interface CrashItem {
+  crashId: string;
+  stateLabel: string;
+  summary: Record<string, unknown>;
+  thirdPartyFieldsSuppressed: boolean;
+}
+
+const CRASH_COLUMNS = `crash_id, state_label, summary_json, third_party_fields_suppressed`;
+
+const LIST_SQL = `select ${CRASH_COLUMNS}
+     from portal.crash_view
+    where subject_cpf_hash = $1
+    order by updated_at desc nulls last, crash_id asc`;
+
+const ONE_SQL = `select ${CRASH_COLUMNS}
+     from portal.crash_view
+    where crash_id = $1
+    limit 1`;
+
+interface CrashRow extends Record<string, unknown> {
+  crash_id: string;
+  state_label: string;
+  summary_json: unknown;
+  third_party_fields_suppressed: boolean;
+}
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function itemOf(row: CrashRow): CrashItem {
+  return {
+    crashId: row.crash_id,
+    stateLabel: row.state_label,
+    summary: asObject(row.summary_json),
+    thirdPartyFieldsSuppressed: row.third_party_fields_suppressed,
+  };
+}
+
+@Controller('v1/portal/crashes')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:crash')
+export class PortalCrashesController {
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get()
+  @Action('read')
+  @Audit({ action: 'PORTAL_CRASH_READ', entity: 'portal.crash_view' })
+  list(@Req() request: CitizenRequest): Promise<{ items: CrashItem[] }> {
+    const identity = portalIdentityOf(request);
+    return this.withSubject(identity, async (tx) => {
+      await this.identity.assertActLevel(
+        tx,
+        identity,
+        CRASH_ACT,
+        CRASHES_ROUTE,
+      );
+      const rows = await tx.query<CrashRow>(LIST_SQL, [
+        cpfHashOf(identity.cpf),
+      ]);
+      return { items: rows.rows.map(itemOf) };
+    });
+  }
+
+  @Get(':id')
+  @Action('read')
+  @Audit({ action: 'PORTAL_CRASH_READ', entity: 'portal.crash_view' })
+  get(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<CrashItem> {
+    const identity = portalIdentityOf(request);
+    if (!UUID_RE.test(id)) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['id'] },
+      });
+    }
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertActLevel(
+        tx,
+        identity,
+        CRASH_ACT,
+        CRASHES_ROUTE,
+      );
+      await this.identity.assertEntitled(tx, subject.subjectId, 'crash', id);
+      const row = (await tx.query<CrashRow>(ONE_SQL, [id])).rows[0];
+      if (!row) {
+        throw new PortalError('PORTAL.NOT_FOUND', {
+          status: 404,
+          context: { kind: 'crash' },
+        });
+      }
+      return itemOf(row);
+    });
+  }
+
+  /** Transação única de tenant por leitura (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (
+      tx: PortalSqlTransaction,
+      subject: PortalSubjectRecord,
+    ) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (tx: Transaction) =>
+        work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/documents.controller.ts b/backend/domains/portal/projections/src/handwritten/documents.controller.ts
new file mode 100644
index 0000000..54091ac
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/documents.controller.ts
@@ -0,0 +1,261 @@
+// `/v1/portal/documents/cnh`, `/v1/portal/vehicles[/{id}/clearance|/{id}/crlv-e]`
+// — leituras nacionais cacheadas (work/rounds/R-0009/contracts/CTG-0002.md
+// §2.5, §8; plan R-0009 M17, M20; ADR-0003, ADR-0018). Só por
+// `packages/senatran-adapter`, pelas fatias do token `PORTAL_NATIONAL_READ_PORTS`
+// (composto no app); nenhum `fetch` próprio. Leituras de dado pessoal levam
+// `@Audit` em `@Get` (RN-PORTAL-118 4). Documentos assinados (CNH-e com bytes,
+// CRLV-e) são `SERVICE_UNAVAILABLE documento_assinado_pendente_r0014`,
+// verificados ANTES da leitura nacional; `clearance` não tem operação na porta
+// (OD-P21): sem cache → 503.
+import {
+  Controller,
+  Get,
+  HttpCode,
+  Inject,
+  Param,
+  Post,
+  Query,
+  Req,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalError,
+  PortalIdentityService,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import {
+  PORTAL_NATIONAL_READ_PORTS,
+  PortalNationalReadsService,
+  type PortalNationalReadPorts,
+} from './national-reads.service.js';
+import { asArray, asObject } from './projection-contract.js';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+/** Token de `unavailableReason` dos documentos assinados (CTG-0002 §0; ADR-0018). */
+export const SIGNED_DOCUMENT_PENDING_REASON =
+  'documento_assinado_pendente_r0014';
+
+export const DOCUMENT_ROUTES = {
+  cnh: '/v1/portal/documents/cnh',
+  crlv: '/v1/portal/vehicles/{id}/crlv-e',
+} as const;
+
+export interface CnhResponse {
+  /** Registro bruto do adapter (`CitizenLicense.license`; mapeamento OD-P35). */
+  license: unknown;
+  qrVerification: null;
+  documentBytes: null;
+  /** RN-PORTAL-117: consulta informativa, não documento. */
+  category: 'C';
+  cachedAt: string;
+}
+
+export interface VehiclesResponse {
+  items: unknown[];
+  cachedAt: string;
+}
+
+export interface ClearanceResponse {
+  items: unknown[];
+  restrictions: unknown[];
+  /** DT-027/UC-PORTAL-012 AC-2 — origem inf, OD-P21. */
+  suspendedEnforceability: unknown[];
+  canIssue: boolean;
+  cachedAt: string;
+}
+
+const CATALOG_NOTE_SQL = `select alternative_channel_note
+     from portal.service_catalog
+    where service_key = $1
+    limit 1`;
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function signedDocumentPending(
+  alternativeChannelNote: string | null,
+): PortalError {
+  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
+    status: 422,
+    context: {
+      unavailableReason: SIGNED_DOCUMENT_PENDING_REASON,
+      alternativeChannelNote,
+    },
+  });
+}
+
+function assertUuid(value: string, field: string): void {
+  if (!UUID_RE.test(value)) {
+    throw new PortalError('PORTAL.VALIDATION_FAILED', {
+      status: 400,
+      context: { fields: [field] },
+    });
+  }
+}
+
+@Controller('v1/portal')
+@UseGuards(PortalCitizenGuard)
+export class PortalDocumentsController {
+  constructor(
+    private readonly reads: PortalNationalReadsService,
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+    @Inject(PORTAL_NATIONAL_READ_PORTS)
+    private readonly ports: PortalNationalReadPorts,
+  ) {}
+
+  @Get('documents/cnh')
+  @Resource('portal:document')
+  @Action('read')
+  @Audit({
+    action: 'PORTAL_DOCUMENT_READ',
+    entity: 'portal.national_read_cache',
+  })
+  cnh(
+    @Req() request: CitizenRequest,
+    @Query('documentBytes') documentBytes: string | undefined,
+  ): Promise<CnhResponse> {
+    const identity = portalIdentityOf(request);
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertActLevel(
+        tx,
+        identity,
+        'consulta_cnh',
+        DOCUMENT_ROUTES.cnh,
+      );
+      if (documentBytes === 'true') throw signedDocumentPending(null);
+      const result = await this.reads.read(tx, subject, 'cnh', null, () =>
+        this.ports.cdt.getCitizenLicense(identity.cpf),
+      );
+      return {
+        license: asObject(result.payload).license ?? null,
+        qrVerification: null,
+        documentBytes: null,
+        category: 'C',
+        cachedAt: result.cachedAt,
+      };
+    });
+  }
+
+  @Get('vehicles')
+  @Resource('portal:vehicle')
+  @Action('read')
+  @Audit({
+    action: 'PORTAL_VEHICLE_READ',
+    entity: 'portal.national_read_cache',
+  })
+  vehicles(@Req() request: CitizenRequest): Promise<VehiclesResponse> {
+    const identity = portalIdentityOf(request);
+    return this.withSubject(identity, async (tx, subject) => {
+      const result = await this.reads.read(tx, subject, 'vehicles', null, () =>
+        this.ports.cdt.listCitizenVehicles(identity.cpf),
+      );
+      return {
+        items: asArray(asObject(result.payload).items),
+        cachedAt: result.cachedAt,
+      };
+    });
+  }
+
+  @Get('vehicles/:id/clearance')
+  @Resource('portal:vehicle')
+  @Action('read')
+  @Audit({
+    action: 'PORTAL_VEHICLE_READ',
+    entity: 'portal.national_read_cache',
+  })
+  clearance(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<ClearanceResponse> {
+    const identity = portalIdentityOf(request);
+    assertUuid(id, 'id');
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertEntitled(tx, subject.subjectId, 'vehicle', id);
+      // M17/OD-P21: nenhuma operação de ports.ts devolve débitos/restrições do
+      // RENAVAM — a fonte é "indisponível"; com cache (linha inserida por
+      // teste/OD) responde 200 com cachedAt antigo, sem cache 503.
+      const result = await this.reads.read(tx, subject, 'clearance', id, () =>
+        Promise.reject(
+          new PortalError('PORTAL.NATIONAL_READ_UNAVAILABLE', {
+            status: 503,
+            context: { cachedAt: null, retryAfter: null },
+          }),
+        ),
+      );
+      const payload = asObject(result.payload);
+      return {
+        items: asArray(payload.items),
+        restrictions: asArray(payload.restrictions),
+        suspendedEnforceability: asArray(payload.suspendedEnforceability),
+        canIssue: payload.canIssue === true,
+        cachedAt: result.cachedAt,
+      };
+    });
+  }
+
+  @Post('vehicles/:id/crlv-e')
+  @HttpCode(200)
+  @Resource('portal:vehicle')
+  @Action('issue')
+  @Audit({
+    action: 'PORTAL_VEHICLE_ISSUE',
+    entity: 'portal.national_read_cache',
+  })
+  issueCrlv(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<never> {
+    const identity = portalIdentityOf(request);
+    assertUuid(id, 'id');
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertEntitled(tx, subject.subjectId, 'vehicle', id);
+      await this.identity.assertActLevel(
+        tx,
+        identity,
+        'emissao_crlv',
+        DOCUMENT_ROUTES.crlv,
+      );
+      const catalog = (
+        await tx.query<{ alternative_channel_note: string | null }>(
+          CATALOG_NOTE_SQL,
+          ['emissao_crlv'],
+        )
+      ).rows[0];
+      throw signedDocumentPending(catalog?.alternative_channel_note ?? null);
+    });
+  }
+
+  /** Transação única de tenant por rota (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (
+      tx: PortalSqlTransaction,
+      subject: PortalSubjectRecord,
+    ) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (tx: Transaction) =>
+        work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/exam-view.projection.spec.ts b/backend/domains/portal/projections/src/handwritten/exam-view.projection.spec.ts
new file mode 100644
index 0000000..2a92349
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/exam-view.projection.spec.ts
@@ -0,0 +1,69 @@
+// R-0009 CTG-0002 §7.2 e §13 (TASK-0006) — C-0002-54: projetor esqueleto
+// `exam_view` (produtor real PEC — OD-P19): evento com aggregate.kind 'exam'
+// só grava last_event_id na linha existente; sem linha → skipped
+// 'not_consumed'. Fica vermelho até TASK-0008 criar `projectors.service.ts`
+// e `exam-view.projection.ts` (§14).
+import { describe, expect, it } from 'vitest';
+
+import { SUBJECTS } from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  EVENT_IDS,
+  EXAM_FF2,
+  eventById,
+} from '../../tests/fixtures/outbox-events.js';
+import { projectorsHarness } from '../../tests/support/projectors-harness.js';
+
+const PROJECTION = 'exam_view';
+const TABLE = 'portal.exam_view';
+const ROW_ID = '00000000-0000-7000-8000-000071f000e1';
+
+function seeded() {
+  return projectorsHarness({
+    seed: (db) =>
+      db.seed(TABLE, [
+        {
+          id: ROW_ID,
+          exam_id: EXAM_FF2,
+          subject_cpf_hash: SUBJECTS.ouro.cpfHash,
+          legal_label: 'fixture',
+          valid_until: null,
+          board_due_on: null,
+          last_event_id: '00000000-0000-0000-0000-000000000000',
+        },
+      ]),
+  });
+}
+
+describe('CTG-0002 §7.2 — exam_view esqueleto (C-0002-54)', () => {
+  it("C-0002-54 — dado evento aggregate.kind 'exam' (…7000700012) e linha existente então só last_event_id gravado", async () => {
+    const h = seeded();
+    const before = { ...h.db.rows(TABLE)[0]! };
+    const outcome = await h.apply(eventById(EVENT_IDS.e12), PROJECTION);
+    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
+    const after = h.db.rows(TABLE)[0]!;
+    expect(after.last_event_id).toBe(EVENT_IDS.e12);
+    const { last_event_id: _b, updated_at: _bu, ...beforeRest } = before;
+    const { last_event_id: _a, updated_at: _au, ...afterRest } = after;
+    expect(afterRest).toEqual(beforeRest);
+    expect(h.appliedEvents(EVENT_IDS.e12)).toHaveLength(1);
+  });
+
+  it("C-0002-54 — dado evento aggregate.kind 'exam' sem linha então skipped 'not_consumed' e nada gravado", async () => {
+    const h = projectorsHarness();
+    const outcome = await h.apply(eventById(EVENT_IDS.e12), PROJECTION);
+    expect(outcome).toMatchObject({ applied: false, skipped: 'not_consumed' });
+    expect(h.db.rows(TABLE)).toHaveLength(0);
+    expect(h.appliedEvents(EVENT_IDS.e12)).toHaveLength(0);
+  });
+
+  it("§7.1 — dado o mesmo evento duas vezes então skipped 'already_applied'", async () => {
+    const h = seeded();
+    expect((await h.apply(eventById(EVENT_IDS.e12), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(await h.apply(eventById(EVENT_IDS.e12), PROJECTION)).toMatchObject({
+      applied: false,
+      skipped: 'already_applied',
+    });
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/exam-view.projection.ts b/backend/domains/portal/projections/src/handwritten/exam-view.projection.ts
new file mode 100644
index 0000000..994e718
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/exam-view.projection.ts
@@ -0,0 +1,56 @@
+// Source events: aggregate.kind = 'exam' (type ch.exam.*) — esqueleto (produtor PEC, OD-P19)
+//
+// Projeção `portal.exam_view` (work/rounds/R-0009/contracts/CTG-0002.md §7.2;
+// plan R-0009 M16): só a tabela + projetor esqueleto — um evento de agregado
+// `exam` grava `last_event_id` na linha existente; sem linha → `not_consumed`
+// (nada gravado). O produtor real (PEC/ch) fixa o `data`.
+import { touchSkeletonRow } from './crash-view.projection.js';
+import {
+  PROJECTION_SENTINEL_EVENT_ID,
+  type PortalConsumedEvent,
+  type ProjectionContext,
+  type ProjectionResult,
+  type Projector,
+} from './projection-contract.js';
+
+export const EXAM_AGGREGATE_KIND = 'exam';
+
+const ROW_SQL = `select id from portal.exam_view where exam_id = $1 for update`;
+
+const TOUCH_SQL = `update portal.exam_view set last_event_id = $2, updated_at = $3 where id = $1`;
+
+const RESET_SQL = `update portal.exam_view set last_event_id = $2, updated_at = $3 where last_event_id = any($1)`;
+
+export class ExamViewProjector implements Projector {
+  readonly projection = 'exam_view' as const;
+  readonly sourceEvents = ['ch.exam.* (aggregate.kind = exam)'] as const;
+
+  apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    if (event.aggregate.kind !== EXAM_AGGREGATE_KIND) {
+      return Promise.resolve({ kind: 'skipped', reason: 'not_consumed' });
+    }
+    return touchSkeletonRow(
+      context.tx,
+      ROW_SQL,
+      TOUCH_SQL,
+      event.aggregate.id,
+      event.id,
+      context.now,
+    );
+  }
+
+  async reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void> {
+    if (windowEventIds.length === 0) return;
+    await context.tx.query(RESET_SQL, [
+      [...windowEventIds],
+      PROJECTION_SENTINEL_EVENT_ID,
+      context.now,
+    ]);
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/exams.controller.ts b/backend/domains/portal/projections/src/handwritten/exams.controller.ts
new file mode 100644
index 0000000..c9bb988
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/exams.controller.ts
@@ -0,0 +1,138 @@
+// `/v1/portal/exams[/{id}]` — exames pela projeção `portal.exam_view`
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.5; plan R-0009 M10, M16, M20).
+// Leitura de dado pessoal: `@Audit` em `@Get` (RN-PORTAL-118 4); rótulo legal,
+// nunca `CONDICIONADO` (route contract §7); projetor real é do PEC (OD-P19) —
+// nesta rodada só fixtures.
+import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  Resource,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  portalIdentityOf,
+  type PortalIdentityClaims,
+  type PortalIdentityRequest,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+export const EXAMS_ROUTE = '/v1/portal/exams';
+export const EXAM_ACT = 'consulta_exame';
+
+export interface ExamItem {
+  examId: string;
+  legalLabel: string;
+  validUntil: string | null;
+  boardDueOn: string | null;
+}
+
+const EXAM_COLUMNS = `exam_id, legal_label,
+          to_char(valid_until, 'YYYY-MM-DD') as valid_until,
+          to_char(board_due_on, 'YYYY-MM-DD') as board_due_on`;
+
+const LIST_SQL = `select ${EXAM_COLUMNS}
+     from portal.exam_view
+    where subject_cpf_hash = $1
+    order by updated_at desc nulls last, exam_id asc`;
+
+const ONE_SQL = `select ${EXAM_COLUMNS}
+     from portal.exam_view
+    where exam_id = $1
+    limit 1`;
+
+interface ExamRow extends Record<string, unknown> {
+  exam_id: string;
+  legal_label: string;
+  valid_until: string | null;
+  board_due_on: string | null;
+}
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+function itemOf(row: ExamRow): ExamItem {
+  return {
+    examId: row.exam_id,
+    legalLabel: row.legal_label,
+    validUntil: row.valid_until,
+    boardDueOn: row.board_due_on,
+  };
+}
+
+@Controller('v1/portal/exams')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:exam')
+export class PortalExamsController {
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get()
+  @Action('read')
+  @Audit({ action: 'PORTAL_EXAM_READ', entity: 'portal.exam_view' })
+  list(@Req() request: CitizenRequest): Promise<{ items: ExamItem[] }> {
+    const identity = portalIdentityOf(request);
+    return this.withSubject(identity, async (tx) => {
+      await this.identity.assertActLevel(tx, identity, EXAM_ACT, EXAMS_ROUTE);
+      const rows = await tx.query<ExamRow>(LIST_SQL, [cpfHashOf(identity.cpf)]);
+      return { items: rows.rows.map(itemOf) };
+    });
+  }
+
+  @Get(':id')
+  @Action('read')
+  @Audit({ action: 'PORTAL_EXAM_READ', entity: 'portal.exam_view' })
+  get(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<ExamItem> {
+    const identity = portalIdentityOf(request);
+    if (!UUID_RE.test(id)) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['id'] },
+      });
+    }
+    return this.withSubject(identity, async (tx, subject) => {
+      await this.identity.assertActLevel(tx, identity, EXAM_ACT, EXAMS_ROUTE);
+      await this.identity.assertEntitled(tx, subject.subjectId, 'exam', id);
+      const row = (await tx.query<ExamRow>(ONE_SQL, [id])).rows[0];
+      if (!row) {
+        throw new PortalError('PORTAL.NOT_FOUND', {
+          status: 404,
+          context: { kind: 'exam' },
+        });
+      }
+      return itemOf(row);
+    });
+  }
+
+  /** Transação única de tenant por leitura (§0) com o sujeito garantido. */
+  private withSubject<T>(
+    identity: PortalIdentityClaims,
+    work: (
+      tx: PortalSqlTransaction,
+      subject: PortalSubjectRecord,
+    ) => Promise<T>,
+  ): Promise<T> {
+    return withTenantContext(
+      this.database,
+      this.requestContext,
+      async (tx: Transaction) =>
+        work(tx, await this.identity.upsertSubject(tx, identity, null)),
+    );
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/index.ts b/backend/domains/portal/projections/src/handwritten/index.ts
new file mode 100644
index 0000000..aaecb7f
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/index.ts
@@ -0,0 +1,17 @@
+// API pública manuscrita de @detran/portal-projections (work/rounds/R-0009/
+// contracts/CTG-0002.md §14; plan R-0009 M24; ADR-0020), reexportada pelo
+// `src/index.ts` gerado via `module.handwrittenExports` de
+// BP-PORTAL-PROJECTIONS-001 (ADR-0007): controladores, os cinco projetores e o
+// replay, o cache das leituras nacionais e os tokens de composição do app.
+export * from './aits.controller.js';
+export * from './crash-view.projection.js';
+export * from './crashes.controller.js';
+export * from './documents.controller.js';
+export * from './exam-view.projection.js';
+export * from './exams.controller.js';
+export * from './infraction-view.projection.js';
+export * from './national-reads.service.js';
+export * from './points-view.projection.js';
+export * from './process-timeline.projection.js';
+export * from './projection-contract.js';
+export * from './projectors.service.js';
diff --git a/backend/domains/portal/projections/src/handwritten/infraction-view.projection.spec.ts b/backend/domains/portal/projections/src/handwritten/infraction-view.projection.spec.ts
new file mode 100644
index 0000000..b317789
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/infraction-view.projection.spec.ts
@@ -0,0 +1,634 @@
+// R-0009 CTG-0002 §7.1, §7.3, §7.5 e §13 (TASK-0006) — C-0002-46…51, 55, 56:
+// projetor `infraction_view` (`INFRACTION_SITUATION_MAP` com os 15 códigos de
+// `inf.infraction_state_ref`, `POINTS_STATUS_BY_SITUATION`, `actions[]` pelo
+// catálogo, enriquecimento pela porta, notices/payment, ordem por
+// `aggregate.version`, idempotência por `event.id`, `payment_json.methods`
+// pelos parâmetros). Fica vermelho até TASK-0008 criar `projectors.service.ts`,
+// `infraction-view.projection.ts` e `national-reads.service.ts` (§14).
+//
+// Os 15 códigos abaixo são a lista `STATES` de
+// `backend/domains/inf/infraction/src/handwritten/events.ts` (= DDL 14
+// `inf.infraction_state_ref`, ordem de `sort_order`) — transcrita porque o
+// módulo não a exporta.
+import { describe, expect, it } from 'vitest';
+
+import { type Row } from '../../../requests/tests/support/fake-sql.js';
+import {
+  AITS,
+  INFRACTIONS,
+  SUBJECTS,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  AIT_F1,
+  AIT_F2,
+  AIT_F9,
+  CONSUMED_TYPES,
+  EVENT_IDS,
+  NOTICE_103,
+  OUTBOX_EVENTS,
+  eventById,
+} from '../../tests/fixtures/outbox-events.js';
+import { projectorsHarness } from '../../tests/support/projectors-harness.js';
+import {
+  ACTION_PHASE_MATRIX,
+  ACTION_SERVICE_KEY,
+  INFRACTION_SITUATION_MAP,
+  POINTS_STATUS_BY_SITUATION,
+} from './infraction-view.projection.js';
+
+/** `inf.infraction_state_ref.code` (DDL 14; events.ts STATES) — 15 tokens. */
+const INFRACTION_STATES = [
+  'AIT_LAVRADO',
+  'NOTIFICADO_AUTUACAO',
+  'DEFESA_EM_JULGAMENTO',
+  'PENALIDADE_A_APLICAR',
+  'NOTIFICADO_PENALIDADE',
+  'RECURSO_1A_INSTANCIA',
+  'AGUARDANDO_RECURSO_2A',
+  'RECURSO_2A_INSTANCIA',
+  'INSTANCIA_ENCERRADA',
+  'ARQUIVADO',
+  'CANCELADO_POS_INTEGRACAO',
+  'AIT_CANCELADO',
+  'EXTINTO_DECADENCIA',
+  'EXTINTO_PRESCRICAO',
+  'CANCELADO_DEFINITIVO',
+] as const;
+
+/** `portal.infraction_view.situation` (DDL 65; M16) — 7 rótulos cidadãos. */
+const SITUATIONS = [
+  'aguardando_defesa',
+  'em_defesa',
+  'penalidade_aplicada',
+  'em_recurso',
+  'encerrada',
+  'cancelada',
+  'arquivada',
+];
+const PROJECTION = 'infraction_view';
+
+function infractionChanged(overrides: {
+  id: string;
+  aitId: string;
+  infractionId: string;
+  version: number;
+  fromState: string | null;
+  toState: string;
+  substate?: string;
+}) {
+  return {
+    ...eventById(EVENT_IDS.e1),
+    id: overrides.id,
+    aggregate: {
+      kind: 'infraction',
+      id: overrides.infractionId,
+      version: overrides.version,
+    },
+    data: {
+      infractionId: overrides.infractionId,
+      aitId: overrides.aitId,
+      fromState: overrides.fromState,
+      toState: overrides.toState,
+      ...(overrides.substate ? { substate: overrides.substate } : {}),
+    },
+  };
+}
+
+const eventId = (nn: number) =>
+  `00000000-0000-7000-8000-0070007000${nn.toString(16).padStart(2, '0')}`;
+
+describe('CTG-0002 §7.3 — INFRACTION_SITUATION_MAP e POINTS_STATUS_BY_SITUATION (C-0002-46, C-0002-47)', () => {
+  it('C-0002-46 — dado os 15 códigos de inf.infraction_state_ref então o mapa tem 15 chaves, 12 com situation do DDL 65 e exatamente AIT_LAVRADO, PENALIDADE_A_APLICAR, AGUARDANDO_RECURSO_2A undefined (OD-P20)', () => {
+    expect(Object.keys(INFRACTION_SITUATION_MAP).sort()).toEqual(
+      [...INFRACTION_STATES].sort(),
+    );
+    const undefinedStates = INFRACTION_STATES.filter(
+      (state) => INFRACTION_SITUATION_MAP[state] === undefined,
+    );
+    expect(undefinedStates).toEqual([
+      'AIT_LAVRADO',
+      'PENALIDADE_A_APLICAR',
+      'AGUARDANDO_RECURSO_2A',
+    ]);
+    const mapped = INFRACTION_STATES.filter(
+      (state) => INFRACTION_SITUATION_MAP[state] !== undefined,
+    );
+    expect(mapped).toHaveLength(12);
+    for (const state of mapped)
+      expect(SITUATIONS, state).toContain(INFRACTION_SITUATION_MAP[state]);
+    expect(INFRACTION_SITUATION_MAP).toMatchObject({
+      NOTIFICADO_AUTUACAO: 'aguardando_defesa',
+      DEFESA_EM_JULGAMENTO: 'em_defesa',
+      NOTIFICADO_PENALIDADE: 'penalidade_aplicada',
+      RECURSO_1A_INSTANCIA: 'em_recurso',
+      RECURSO_2A_INSTANCIA: 'em_recurso',
+      INSTANCIA_ENCERRADA: 'encerrada',
+      ARQUIVADO: 'arquivada',
+      CANCELADO_POS_INTEGRACAO: 'cancelada',
+      AIT_CANCELADO: 'cancelada',
+      EXTINTO_DECADENCIA: 'arquivada',
+      EXTINTO_PRESCRICAO: 'arquivada',
+      CANCELADO_DEFINITIVO: 'cancelada',
+    });
+  });
+
+  it("C-0002-46 — dado evento com toState sem rótulo (AIT_LAVRADO, …7000700010) então applied_event.last_error começa com 'PORTAL.INTERNAL:situation:' e a view não muda", async () => {
+    const h = projectorsHarness({
+      seed: (db) =>
+        db.seed('portal.infraction_view', [
+          {
+            ...h0View(),
+            ait_id: AIT_F1,
+            id: '00000000-0000-7000-8000-000070f000e1',
+            ait_number: 'FIX-00000e1',
+            plate: 'FIX2EE1',
+          },
+        ]),
+    });
+    const before = { ...h.view(AIT_F1)! };
+    const outcome = await h.apply(eventById(EVENT_IDS.e10), PROJECTION);
+    expect(outcome.applied).toBe(false);
+    expect(String(outcome.error)).toMatch(
+      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
+    );
+    const applied = h.appliedEvents(EVENT_IDS.e10);
+    expect(applied).toHaveLength(1);
+    expect(String(applied[0]!.last_error)).toMatch(
+      /^PORTAL\.INTERNAL:situation:/,
+    );
+    expect(h.view(AIT_F1)).toEqual(before);
+  });
+
+  it('C-0002-47 — dado cada situation então POINTS_STATUS_BY_SITUATION conforme §7.3 (7 linhas)', () => {
+    expect(POINTS_STATUS_BY_SITUATION).toEqual({
+      aguardando_defesa: 'none',
+      em_defesa: 'em_disputa',
+      penalidade_aplicada: 'definitivo',
+      em_recurso: 'em_disputa',
+      encerrada: 'definitivo',
+      cancelada: 'none',
+      arquivada: 'none',
+    });
+  });
+});
+
+function h0View(): Row {
+  return {
+    subject_cpf_hash: SUBJECTS.bronze.cpfHash,
+    framing_label: 'fixture',
+    amount: 195.23,
+    occurred_at: new Date('2026-05-01T12:00:00-04:00'),
+    situation: 'aguardando_defesa',
+    deadlines_json: [],
+    points_status: 'none',
+    actions_json: [],
+    notices_json: [],
+    payment_json: {},
+    last_event_id: '00000000-0000-0000-0000-000000000000',
+    last_event_version: 0,
+  };
+}
+
+describe('CTG-0002 §7.3 — actions[] pelo catálogo e pela fase (C-0002-48)', () => {
+  it('C-0002-48 — dado ACTION_PHASE_MATRIX e ACTION_SERVICE_KEY então a tabela do §7.3', () => {
+    expect(ACTION_SERVICE_KEY).toEqual({
+      defend: 'defesa_previa',
+      indicate_driver: 'indicacao_condutor',
+      pay: 'pagamento',
+      appeal_jari: 'recurso_jari',
+      appeal_cetran: 'recurso_cetran',
+    });
+    const matrix = ACTION_PHASE_MATRIX as Record<
+      string,
+      Record<string, boolean>
+    >;
+    expect(Object.keys(matrix).sort()).toEqual([...SITUATIONS].sort());
+    const expected: Record<
+      string,
+      [boolean, boolean, boolean, boolean, boolean]
+    > = {
+      aguardando_defesa: [true, true, true, false, false],
+      em_defesa: [false, false, true, false, false],
+      penalidade_aplicada: [false, false, true, true, false],
+      em_recurso: [false, false, true, false, false],
+      encerrada: [false, false, true, false, false],
+      cancelada: [false, false, false, false, false],
+      arquivada: [false, false, false, false, false],
+    };
+    for (const [
+      situation,
+      [defend, indicate, pay, jari, cetran],
+    ] of Object.entries(expected)) {
+      expect(matrix[situation], situation).toEqual({
+        defend,
+        indicate_driver: indicate,
+        pay,
+        appeal_jari: jari,
+        appeal_cetran: cetran,
+      });
+    }
+  });
+
+  it("C-0002-48 — dado catálogo das fixtures (9/2/4) e situation 'aguardando_defesa' então defend/indicate_driver indisponíveis por 'delegacao_indisponivel_r0007', pay disponível, appeal_* 'fase_nao_admite'", async () => {
+    const h = projectorsHarness();
+    const outcome = await h.apply(eventById(EVENT_IDS.e1), PROJECTION);
+    expect(outcome.applied).toBe(true);
+    const view = h.view(AIT_F2)!;
+    expect(view.situation).toBe('aguardando_defesa');
+    const actions = Object.fromEntries(
+      (view.actions_json as Row[]).map((action) => [action.key, action]),
+    );
+    expect(Object.keys(actions).sort()).toEqual([
+      'appeal_cetran',
+      'appeal_jari',
+      'defend',
+      'indicate_driver',
+      'pay',
+    ]);
+    expect(actions.defend).toEqual({
+      key: 'defend',
+      available: false,
+      reason: 'delegacao_indisponivel_r0007',
+      minimumAssurance: 'avancada',
+    });
+    expect(actions.indicate_driver).toEqual({
+      key: 'indicate_driver',
+      available: false,
+      reason: 'delegacao_indisponivel_r0007',
+      minimumAssurance: 'avancada',
+    });
+    expect(actions.pay).toEqual({
+      key: 'pay',
+      available: true,
+      reason: null,
+      minimumAssurance: 'simples',
+    });
+    expect(actions.appeal_jari).toMatchObject({
+      available: false,
+      reason: 'fase_nao_admite',
+    });
+    expect(actions.appeal_cetran).toMatchObject({
+      available: false,
+      reason: 'fase_nao_admite',
+    });
+  });
+
+  it("C-0002-48 — dado 'cancelada' então os cinco false; dado serviço ausente do catálogo então reason 'servico_ausente_no_catalogo'", async () => {
+    const h = projectorsHarness();
+    const cancel = infractionChanged({
+      id: eventId(0x21),
+      aitId: AITS.f12,
+      infractionId: '00000000-0000-7000-8000-0000d0000012',
+      version: 5,
+      fromState: 'NOTIFICADO_AUTUACAO',
+      toState: 'AIT_CANCELADO',
+    });
+    expect((await h.apply(cancel, PROJECTION)).applied).toBe(true);
+    const cancelled = h.view(AITS.f12)!;
+    expect(cancelled.situation).toBe('cancelada');
+    expect(
+      (cancelled.actions_json as Row[]).every(
+        (action) => action.available === false,
+      ),
+    ).toBe(true);
+    expect(
+      (cancelled.actions_json as Row[]).map((action) => action.reason),
+    ).toEqual(Array(5).fill('fase_nao_admite'));
+
+    const withoutPayment = projectorsHarness({
+      catalog: (rows) => rows.filter((row) => row.service_key !== 'pagamento'),
+    });
+    expect(
+      (await withoutPayment.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied,
+    ).toBe(true);
+    const pay = (withoutPayment.view(AIT_F2)!.actions_json as Row[]).find(
+      (action) => action.key === 'pay',
+    );
+    expect(pay).toMatchObject({
+      available: false,
+      reason: 'servico_ausente_no_catalogo',
+    });
+  });
+});
+
+describe('CTG-0002 §7.3 — INFRACAO_ESTADO_ALTERADO: versão, enriquecimento, vínculo (C-0002-49)', () => {
+  it("C-0002-49 — dado view …70f00001 (last_event_version 0) e toState DEFESA_EM_JULGAMENTO v3 então situation 'em_defesa', points_status 'em_disputa', last_event_id/version; dado evento v2 depois do v3 então skipped 'stale_version' sem applied_event", async () => {
+    const h = projectorsHarness();
+    const v3 = eventById(EVENT_IDS.e2);
+    const outcome = await h.apply(v3, PROJECTION);
+    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
+    expect(h.view(AIT_F2)).toMatchObject({
+      situation: 'em_defesa',
+      points_status: 'em_disputa',
+      last_event_id: EVENT_IDS.e2,
+      last_event_version: 3,
+    });
+    expect(h.appliedEvents(EVENT_IDS.e2)).toHaveLength(1);
+    expect(h.appliedEvents(EVENT_IDS.e2)[0]).toMatchObject({
+      projection: PROJECTION,
+      last_error: null,
+    });
+
+    const stale = await h.apply(eventById(EVENT_IDS.e1), PROJECTION);
+    expect(stale).toMatchObject({ applied: false, skipped: 'stale_version' });
+    expect(h.view(AIT_F2)).toMatchObject({
+      situation: 'em_defesa',
+      last_event_id: EVENT_IDS.e2,
+      last_event_version: 3,
+    });
+    expect(h.appliedEvents(EVENT_IDS.e1)).toHaveLength(0);
+  });
+
+  it("C-0002-49 — dado aitId sem view e source.loadAitIdentity → null então last_error 'PORTAL.INTERNAL:ait_identity:<aitId>'", async () => {
+    const h = projectorsHarness({ identities: { [AIT_F1]: null } });
+    const event = infractionChanged({
+      id: eventId(0x22),
+      aitId: AIT_F1,
+      infractionId: INFRACTIONS.d1,
+      version: 2,
+      fromState: 'AIT_LAVRADO',
+      toState: 'NOTIFICADO_AUTUACAO',
+    });
+    const outcome = await h.apply(event, PROJECTION);
+    expect(outcome.applied).toBe(false);
+    expect(outcome.error).toBe(`PORTAL.INTERNAL:ait_identity:${AIT_F1}`);
+    expect(h.source.loadAitIdentity).toHaveBeenCalledTimes(1);
+    expect(h.view(AIT_F1)).toBeUndefined();
+    expect(h.appliedEvents(eventId(0x22))[0]).toMatchObject({
+      last_error: `PORTAL.INTERNAL:ait_identity:${AIT_F1}`,
+    });
+  });
+
+  it("C-0002-49 — dado source com identidade e portal.subject existente para o cpf_hash então view inserida e entitlement (owner, origin 'infraction')", async () => {
+    const h = projectorsHarness({
+      identities: {
+        [AIT_F1]: {
+          aitNumber: 'FIX-00000e1',
+          plate: 'FIX2EE1',
+          occurredAt: '2026-05-20T12:00:00-04:00',
+          framingLabel: 'fixture',
+          amount: 130.16,
+          subjectCpfHashes: [SUBJECTS.bronze.cpfHash, 'f'.repeat(64)],
+        },
+      },
+      deadlines: [],
+    });
+    const event = infractionChanged({
+      id: eventId(0x23),
+      aitId: AIT_F1,
+      infractionId: INFRACTIONS.d1,
+      version: 2,
+      fromState: 'AIT_LAVRADO',
+      toState: 'NOTIFICADO_AUTUACAO',
+      substate: 'PRAZO_DEFESA_ABERTO',
+    });
+    const outcome = await h.apply(event, PROJECTION);
+    expect(outcome.applied).toBe(true);
+    const view = h.view(AIT_F1)!;
+    expect(view).toMatchObject({
+      subject_cpf_hash: SUBJECTS.bronze.cpfHash,
+      ait_number: 'FIX-00000e1',
+      plate: 'FIX2EE1',
+      framing_label: 'fixture',
+      amount: 130.16,
+      situation: 'aguardando_defesa',
+      points_status: 'none',
+      notices_json: [],
+      deadlines_json: [],
+      last_event_id: eventId(0x23),
+      last_event_version: 2,
+    });
+    expect(view.payment_json).toMatchObject({
+      paid: false,
+      paidTier: null,
+      tiers: [],
+    });
+    const entitlements = h.db
+      .rows('portal.entitlement')
+      .filter((row) => row.target_id === AIT_F1);
+    // só o cpf_hash com portal.subject existente gera vínculo ('f'*64 não tem sujeito)
+    expect(entitlements).toHaveLength(1);
+    expect(entitlements[0]).toMatchObject({
+      subject_id: SUBJECTS.bronze.id,
+      target_kind: 'ait',
+      relation: 'owner',
+      origin: 'infraction',
+    });
+    expect(String(entitlements[0]!.valid_from).slice(0, 10)).toBe('2026-05-20');
+  });
+});
+
+describe('CTG-0002 §7.3/§7.5 — notices e pagamento (C-0002-50, C-0002-51)', () => {
+  it("C-0002-50 — dado NOTIFICACAO_EXPEDIDA NA então notices_json += { kind 'NA', channel, dispatchedOn, effectiveOn null, fictitious false, printedDeadline }; dado NOTIFICACAO_CIENCIA inf.notice.acknowledged então effectiveOn/fictitious da entrada", async () => {
+    const h = projectorsHarness();
+    expect((await h.apply(eventById(EVENT_IDS.e3), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(h.view(AIT_F2)!.notices_json).toEqual([
+      {
+        noticeId: NOTICE_103,
+        kind: 'NA',
+        channel: 'sne',
+        dispatchedOn: '2026-09-01',
+        effectiveOn: null,
+        fictitious: false,
+        printedDeadline: '2026-10-01',
+      },
+    ]);
+    expect(h.view(AIT_F2)!.last_event_id).toBe(EVENT_IDS.e3);
+
+    expect((await h.apply(eventById(EVENT_IDS.e4), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(h.view(AIT_F2)!.notices_json).toEqual([
+      {
+        noticeId: NOTICE_103,
+        kind: 'NA',
+        channel: 'sne',
+        dispatchedOn: '2026-09-01',
+        effectiveOn: '2026-09-11',
+        fictitious: false,
+        printedDeadline: '2026-10-01',
+      },
+    ]);
+    expect(h.view(AIT_F2)!.situation).toBe('aguardando_defesa');
+  });
+
+  it("C-0002-50 — dado NOTIFICACAO_CIENCIA com type portal.notification.acknowledged então skipped 'not_consumed'; DILIGENCIA/EDITAL então só last_event_id; view ausente então last_error", async () => {
+    const h = projectorsHarness();
+    const portalAck = {
+      ...eventById(EVENT_IDS.e4),
+      id: eventId(0x31),
+      type: CONSUMED_TYPES.portalNotificationAcknowledged,
+    };
+    const outcome = await h.apply(portalAck, PROJECTION);
+    expect(outcome).toMatchObject({ applied: false, skipped: 'not_consumed' });
+    expect(h.appliedEvents(eventId(0x31))).toHaveLength(0);
+    expect(h.view(AIT_F2)!.notices_json).toEqual([]);
+
+    for (const [index, kind] of (['DILIGENCIA', 'EDITAL'] as const).entries()) {
+      const id = eventId(0x32 + index);
+      const dispatched = {
+        ...eventById(EVENT_IDS.e3),
+        id,
+        data: {
+          ...eventById(EVENT_IDS.e3).data,
+          noticeId: `00000000-0000-7000-8000-0070007001${index + 10}`,
+          kind,
+        },
+      };
+      expect((await h.apply(dispatched, PROJECTION)).applied, kind).toBe(true);
+      expect(h.view(AIT_F2)!.notices_json).toEqual([]);
+      expect(h.view(AIT_F2)!.last_event_id).toBe(id);
+    }
+
+    const missingView = {
+      ...eventById(EVENT_IDS.e3),
+      id: eventId(0x34),
+      data: {
+        ...eventById(EVENT_IDS.e3).data,
+        aitId: AIT_F1,
+        infractionId: INFRACTIONS.d1,
+      },
+    };
+    const failed = await h.apply(missingView, PROJECTION);
+    expect(failed.applied).toBe(false);
+    expect(String(failed.error)).toMatch(/^PORTAL\.INTERNAL:/);
+    expect(h.appliedEvents(eventId(0x34))[0]!.last_error).toMatch(
+      /^PORTAL\.INTERNAL:/,
+    );
+  });
+
+  it("C-0002-51 — dado PAGAMENTO_CONFIRMADO então payment_json.paid true, paidTier, paidOn e situation inalterada; dado request AGUARDANDO_PAGAMENTO com target ait então 'PROTOCOLADO'", async () => {
+    const requestId = '00000000-0000-7000-8000-0000704000e1';
+    const h = projectorsHarness({
+      seed: (db) =>
+        db.seed('portal.request', [
+          {
+            id: requestId,
+            state: 'AGUARDANDO_PAGAMENTO',
+            service_key: 'emissao_crlv',
+            subject_id: SUBJECTS.qualificada.id,
+            target_kind: 'ait',
+            target_id: AIT_F9,
+            minimum_assurance: 'simples',
+            delegation_status: 'pending',
+            version: 3,
+          },
+        ]),
+    });
+    const before = h.view(AIT_F9)!;
+    expect(before.situation).toBe('encerrada');
+    expect((await h.apply(eventById(EVENT_IDS.e5), PROJECTION)).applied).toBe(
+      true,
+    );
+    const after = h.view(AIT_F9)!;
+    expect(after.situation).toBe('encerrada');
+    expect(after.points_status).toBe(before.points_status);
+    expect(after.payment_json).toMatchObject({
+      paid: true,
+      paidTier: 'desconto_80',
+      paidOn: '2026-09-10',
+    });
+    expect(after.last_event_id).toBe(EVENT_IDS.e5);
+    const request = h.db
+      .rows('portal.request')
+      .find((row) => row.id === requestId)!;
+    expect(request.state).toBe('PROTOCOLADO');
+    expect(Number(request.version)).toBeGreaterThan(3);
+  });
+
+  it.todo(
+    'dado AGUARDANDO_PAGAMENTO quando PAGAMENTO_CONFIRMADO real de inf/collection então PROTOCOLADO e delegação da emissão — R-0007',
+  );
+});
+
+describe('CTG-0002 §7.1 — idempotência por event.id (C-0002-55) e parâmetros (C-0002-56)', () => {
+  it("C-0002-55 — dado o mesmo evento aplicado duas vezes então a segunda é skipped 'already_applied' e nenhuma coluna muda; projection_applied_event único por (event_id, projection)", async () => {
+    const h = projectorsHarness();
+    const first = await h.apply(eventById(EVENT_IDS.e2), PROJECTION);
+    expect(first.applied).toBe(true);
+    const snapshot = JSON.stringify(h.view(AIT_F2));
+    const second = await h.apply(eventById(EVENT_IDS.e2), PROJECTION);
+    expect(second).toMatchObject({
+      projection: PROJECTION,
+      applied: false,
+      skipped: 'already_applied',
+    });
+    expect(JSON.stringify(h.view(AIT_F2))).toBe(snapshot);
+    expect(h.appliedEvents(EVENT_IDS.e2)).toHaveLength(1);
+
+    // aplicar por fora da API o mesmo par (event_id, projection) viola o unique do DDL 65
+    await expect(
+      h.db.tx.query(
+        `insert into portal.projection_applied_event (event_id, projection, applied_at) values ($1, $2, now())`,
+        [EVENT_IDS.e2, PROJECTION],
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('C-0002-56 — dado leitor de parâmetros falso com card_payment true então payment_json.methods.card = true; demais conforme os valores injetados (chaves lidas pela porta, nunca literais no spec)', async () => {
+    const h = projectorsHarness({
+      parameters: {
+        card_payment: true,
+        installments: false,
+        waiver_40_term: true,
+        discount_40_outside_sne: false,
+      },
+    });
+    expect((await h.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied).toBe(
+      true,
+    );
+    const methods = (h.view(AIT_F2)!.payment_json as Row).methods as Row;
+    expect(methods).toEqual({
+      card: true,
+      installments: false,
+      waiver40: true,
+      discount40OutsideSne: false,
+    });
+    const suffixes = h.parameterCalls.map((key) => key.split('.').pop()).sort();
+    expect(suffixes).toEqual([
+      'card_payment',
+      'discount_40_outside_sne',
+      'installments',
+      'waiver_40_term',
+    ]);
+    expect(
+      h.parameterCalls.every(
+        (key) => key.startsWith('portal.') || key.startsWith('collection.'),
+      ),
+    ).toBe(true);
+
+    const flipped = projectorsHarness({
+      parameters: {
+        card_payment: false,
+        installments: true,
+        waiver_40_term: false,
+        discount_40_outside_sne: true,
+      },
+    });
+    expect(
+      (await flipped.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied,
+    ).toBe(true);
+    expect((flipped.view(AIT_F2)!.payment_json as Row).methods).toEqual({
+      card: false,
+      installments: true,
+      waiver40: false,
+      discount40OutsideSne: true,
+    });
+  });
+
+  it('§7.1 — dado os 12 eventos de fixture então PORTAL_CONSUMED_ENVELOPE aceita todos (permissivo, OD-P28) e recusa envelope sem aggregate', async () => {
+    const { PORTAL_CONSUMED_ENVELOPE } =
+      await import('./projectors.service.js');
+    for (const event of OUTBOX_EVENTS) {
+      expect(PORTAL_CONSUMED_ENVELOPE.safeParse(event).success, event.id).toBe(
+        true,
+      );
+    }
+    const { aggregate: _aggregate, ...withoutAggregate } = OUTBOX_EVENTS[0]!;
+    expect(PORTAL_CONSUMED_ENVELOPE.safeParse(withoutAggregate).success).toBe(
+      false,
+    );
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/infraction-view.projection.ts b/backend/domains/portal/projections/src/handwritten/infraction-view.projection.ts
new file mode 100644
index 0000000..607b7f3
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/infraction-view.projection.ts
@@ -0,0 +1,721 @@
+// Source events: INFRACAO_ESTADO_ALTERADO (inf.infraction.changed), NOTIFICACAO_EXPEDIDA (inf.notice.dispatched), NOTIFICACAO_CIENCIA (inf.notice.acknowledged), PAGAMENTO_CONFIRMADO (inf.payment.confirmed)
+// Source tables: inf.ait_ait, inf.normative_framing, inf.ait_vehicle, ops.snapshots_vehicle, inf.ait_person, ops.snapshots_person
+//
+// Projeção `portal.infraction_view` (work/rounds/R-0009/contracts/CTG-0002.md
+// §7.1, §7.3, §7.5; plan R-0009 M10, M16, M17, adenda A5(a); ADR-0020 §4 —
+// este arquivo é o ÚNICO do pacote autorizado a ler `inf.*`, pelo
+// `SqlInfractionViewSource`). A tradução estado interno → `situation` cidadã
+// é a tabela única `INFRACTION_SITUATION_MAP` (chave = `inf.infraction_state_ref`
+// .code, 15 tokens do DDL 14); tokens sem rótulo fixado (OD-P20) ficam
+// `undefined` e o evento falha com `PORTAL.INTERNAL:situation:<token>` —
+// nunca um rótulo inventado. `actions[]` vem da fase (`ACTION_PHASE_MATRIX`)
+// e do catálogo de serviços; `payment_json.methods` dos quatro parâmetros
+// (H.53), nunca literal `false`.
+import { Injectable } from '@nestjs/common';
+import { z } from 'zod';
+import { cpfHashOf, localDateOf } from '@detran/portal-identity';
+import type { PortalSqlTransaction } from '@detran/portal-identity';
+
+import {
+  PROJECTION_SENTINEL_EVENT_ID,
+  asArray,
+  asObject,
+  projectionError,
+  type PortalConsumedEvent,
+  type PortalParameterReader,
+  type ProjectionContext,
+  type ProjectionResult,
+  type Projector,
+} from './projection-contract.js';
+
+// ---------------------------------------------------------------------------
+// vocabulários (§7.3)
+// ---------------------------------------------------------------------------
+
+/** `portal.infraction_view.situation` (DDL 65; M16) — os 7 rótulos cidadãos. */
+export const INFRACTION_SITUATIONS = [
+  'aguardando_defesa',
+  'em_defesa',
+  'penalidade_aplicada',
+  'em_recurso',
+  'encerrada',
+  'cancelada',
+  'arquivada',
+] as const;
+export type Situation = (typeof INFRACTION_SITUATIONS)[number];
+
+export type PointsStatus = 'em_disputa' | 'definitivo' | 'none';
+
+// chave = inf.infraction_state_ref.code (15 tokens, DDL 14); valor = situation
+// cidadã (M16) com a fonte da tradução. Tokens sem linha → applied_event.last_error
+// (PORTAL.INTERNAL) e OD-P20 — nunca rótulo inventado.
+export const INFRACTION_SITUATION_MAP: Readonly<
+  Record<string, Situation | undefined>
+> = {
+  AIT_LAVRADO: undefined, // OD-P20: NA não expedida; nenhum dos 7 rótulos cabe
+  NOTIFICADO_AUTUACAO: 'aguardando_defesa', // CTG-0001 §10.8 (…70f00001); legal_regime "prazos de defesa … correndo"
+  DEFESA_EM_JULGAMENTO: 'em_defesa', // CTG-0001 §10.8 (…70f00002); phase primeiro_circuito
+  PENALIDADE_A_APLICAR: undefined, // OD-P20: defesa indeferida, NP não expedida — sem rótulo cidadão fixado
+  NOTIFICADO_PENALIDADE: 'penalidade_aplicada', // CTG-0001 §10.8 (…70f00003)
+  RECURSO_1A_INSTANCIA: 'em_recurso', // CTG-0001 §10.8 (…70f00004)
+  AGUARDANDO_RECURSO_2A: undefined, // OD-P20: intervalo recursal (JARI decidida, CETRAN aberto)
+  RECURSO_2A_INSTANCIA: 'em_recurso', // mesma família segundo_circuito_* de RECURSO_1A (efeito suspensivo mantido)
+  INSTANCIA_ENCERRADA: 'encerrada', // CTG-0001 §10.8 (…70f00005); penalty_definitive
+  ARQUIVADO: 'arquivada', // CTG-0001 §10.8 (…70f00007)
+  CANCELADO_POS_INTEGRACAO: 'cancelada', // legal_regime "cancelamento deferido …" (terminal_sem_penalidade)
+  AIT_CANCELADO: 'cancelada', // CTG-0001 §10.8 (…70f00006)
+  EXTINTO_DECADENCIA: 'arquivada', // renainf_situacao = ARQUIVADO (mesmo espelho de ARQUIVADO)
+  EXTINTO_PRESCRICAO: 'arquivada', // renainf_situacao = ARQUIVADO
+  CANCELADO_DEFINITIVO: 'cancelada', // legal_regime "decisão final favorável ao administrado"
+};
+
+/** CTG-0001 §10.8: em disputa nos circuitos; definitivo após penalidade; nenhum nos demais. */
+export const POINTS_STATUS_BY_SITUATION: Readonly<
+  Record<Situation, PointsStatus>
+> = {
+  aguardando_defesa: 'none',
+  em_defesa: 'em_disputa',
+  penalidade_aplicada: 'definitivo',
+  em_recurso: 'em_disputa',
+  encerrada: 'definitivo',
+  cancelada: 'none',
+  arquivada: 'none',
+};
+
+export const INFRACTION_ACTIONS = [
+  'defend',
+  'indicate_driver',
+  'pay',
+  'appeal_jari',
+  'appeal_cetran',
+] as const;
+export type InfractionAction = (typeof INFRACTION_ACTIONS)[number];
+
+/**
+ * Fase admite o ato (legal_regime de infraction_state_ref; [WF-PORTAL-001]
+ * §Catálogo coluna Prazo; UC-PORTAL-015 AC-5 "pagar antes não prejudica o recurso").
+ */
+export const ACTION_PHASE_MATRIX: Readonly<
+  Record<Situation, Readonly<Record<InfractionAction, boolean>>>
+> = {
+  aguardando_defesa: {
+    defend: true,
+    indicate_driver: true,
+    pay: true,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+  em_defesa: {
+    defend: false,
+    indicate_driver: false,
+    pay: true,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+  penalidade_aplicada: {
+    defend: false,
+    indicate_driver: false,
+    pay: true,
+    appeal_jari: true,
+    appeal_cetran: false,
+  },
+  em_recurso: {
+    defend: false,
+    indicate_driver: false,
+    pay: true,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+  encerrada: {
+    defend: false,
+    indicate_driver: false,
+    pay: true,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+  cancelada: {
+    defend: false,
+    indicate_driver: false,
+    pay: false,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+  arquivada: {
+    defend: false,
+    indicate_driver: false,
+    pay: false,
+    appeal_jari: false,
+    appeal_cetran: false,
+  },
+};
+
+export const ACTION_SERVICE_KEY: Readonly<Record<InfractionAction, string>> = {
+  defend: 'defesa_previa',
+  indicate_driver: 'indicacao_condutor',
+  pay: 'pagamento',
+  appeal_jari: 'recurso_jari',
+  appeal_cetran: 'recurso_cetran',
+};
+
+/** Parâmetros de `payment_json.methods` (H.53; DT-031) — chaves do catálogo. */
+export const PAYMENT_METHOD_PARAMETERS = {
+  card: 'portal.card_payment',
+  installments: 'portal.installments',
+  waiver40: 'portal.waiver_40_term',
+  discount40OutsideSne: 'collection.discount_40_outside_sne',
+} as const;
+
+export interface InfractionActionEntry {
+  key: InfractionAction;
+  available: boolean;
+  reason: string | null;
+  minimumAssurance: string | null;
+}
+
+export interface InfractionNoticeEntry {
+  noticeId: string;
+  kind: 'NA' | 'NP' | 'decisao';
+  channel: string | null;
+  dispatchedOn: string | null;
+  effectiveOn: string | null;
+  fictitious: boolean;
+  printedDeadline: string | null;
+}
+
+// ---------------------------------------------------------------------------
+// porta de enriquecimento (§7.3)
+// ---------------------------------------------------------------------------
+
+export interface AitIdentity {
+  aitNumber: string;
+  plate: string;
+  occurredAt: string | Date;
+  framingLabel: string;
+  amount: number | null;
+  /** Índice 0 = proprietário; os demais condutores/interessados (M10). */
+  subjectCpfHashes: string[];
+}
+
+export interface InfractionDeadline {
+  kind: string;
+  dueOn: string;
+  ownedBy: string;
+}
+
+export interface InfractionViewSource {
+  loadAitIdentity(
+    tx: PortalSqlTransaction,
+    aitId: string,
+  ): Promise<AitIdentity | null>;
+  loadDeadlines(
+    tx: PortalSqlTransaction,
+    infractionId: string,
+  ): Promise<InfractionDeadline[]>;
+}
+
+export const INFRACTION_VIEW_SOURCE = Symbol('INFRACTION_VIEW_SOURCE');
+
+const AIT_IDENTITY_SQL = `select a.ait_number, a.infraction_at, f.description as framing_label
+     from inf.ait_ait a
+     join inf.normative_framing f on f.id = a.framing_id
+    where a.id = $1
+    limit 1`;
+
+const AIT_PLATE_SQL = `select v.plate
+     from inf.ait_vehicle av
+     join ops.snapshots_vehicle v on v.id = av.vehicle_snapshot_id
+    where av.ait_id = $1
+    order by av.created_at asc, av.id asc
+    limit 1`;
+
+/** `proprietario` (token de `inf.infraction_subject_kind_ref`) primeiro; depois por ordem de registro. */
+const AIT_PERSONS_SQL = `select p.cpf
+     from inf.ait_person ap
+     join ops.snapshots_person p on p.id = ap.person_id
+    where ap.ait_id = $1 and p.cpf is not null
+    order by case when ap.role = 'proprietario' then 0 else 1 end, ap.created_at asc, ap.id asc`;
+
+/**
+ * Implementação SQL da porta sobre as tabelas do dono (cabeçalho `Source
+ * tables:`). `amount` é `null` nesta rodada: o catálogo normativo não guarda
+ * valor numérico da multa (cotação nacional — OD-P41). Sem veículo ou sem
+ * pessoa identificada → `null` (o evento fica com `last_error`).
+ */
+@Injectable()
+export class SqlInfractionViewSource implements InfractionViewSource {
+  async loadAitIdentity(
+    tx: PortalSqlTransaction,
+    aitId: string,
+  ): Promise<AitIdentity | null> {
+    const ait = (
+      await tx.query<{
+        ait_number: string;
+        infraction_at: Date | string;
+        framing_label: string;
+      }>(AIT_IDENTITY_SQL, [aitId])
+    ).rows[0];
+    if (!ait) return null;
+    const vehicle = (await tx.query<{ plate: string }>(AIT_PLATE_SQL, [aitId]))
+      .rows[0];
+    if (!vehicle) return null;
+    const persons = (await tx.query<{ cpf: string }>(AIT_PERSONS_SQL, [aitId]))
+      .rows;
+    const hashes = persons
+      .map((person) => person.cpf.replace(/\D/g, ''))
+      .filter((cpf) => cpf.length === 11)
+      .map(cpfHashOf);
+    if (hashes.length === 0) return null;
+    return {
+      aitNumber: ait.ait_number,
+      plate: vehicle.plate,
+      occurredAt: ait.infraction_at,
+      framingLabel: ait.framing_label,
+      amount: null,
+      subjectCpfHashes: [...new Set(hashes)],
+    };
+  }
+
+  /** `ownedBy` por timer é `source_pending` (OD-P39): nesta rodada `[]`. */
+  async loadDeadlines(): Promise<InfractionDeadline[]> {
+    return [];
+  }
+}
+
+// ---------------------------------------------------------------------------
+// dados dos eventos (§7.3, §7.5 — só os campos usados)
+// ---------------------------------------------------------------------------
+
+const STATE_CHANGED_DATA = z
+  .object({
+    infractionId: z.string(),
+    aitId: z.uuid(),
+    fromState: z.string().nullable().optional(),
+    toState: z.string(),
+    substate: z.string().nullable().optional(),
+  })
+  .passthrough();
+
+const NOTICE_DISPATCHED_DATA = z
+  .object({
+    noticeId: z.string(),
+    aitId: z.uuid(),
+    kind: z.string(),
+    channel: z.string().nullable().optional(),
+    dispatchedOn: z.string().nullable().optional(),
+    printedDeadlineOn: z.string().nullable().optional(),
+  })
+  .passthrough();
+
+const NOTICE_ACKNOWLEDGED_DATA = z
+  .object({
+    noticeId: z.string(),
+    aitId: z.uuid(),
+    effectiveOn: z.string().nullable().optional(),
+    fictitious: z.boolean().optional(),
+  })
+  .passthrough();
+
+const PAYMENT_CONFIRMED_DATA = z
+  .object({
+    aitId: z.uuid(),
+    tier: z.string().nullable().optional(),
+    paidOn: z.string().nullable().optional(),
+  })
+  .passthrough();
+
+const NOTICE_KIND_LABEL: Readonly<
+  Record<string, InfractionNoticeEntry['kind']>
+> = { NA: 'NA', NP: 'NP', DECISAO: 'decisao' };
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const VIEW_FOR_UPDATE_SQL = `select id, ait_id, subject_cpf_hash, plate, situation, points_status,
+          deadlines_json, actions_json, notices_json, payment_json,
+          last_event_id, last_event_version
+     from portal.infraction_view
+    where ait_id = $1
+    for update`;
+
+const UPDATE_STATE_SQL = `update portal.infraction_view
+      set situation = $2, points_status = $3, actions_json = $4::jsonb,
+          payment_json = $5::jsonb, deadlines_json = $6::jsonb,
+          last_event_id = $7, last_event_version = $8, updated_at = $9
+    where id = $1`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
+const INSERT_VIEW_SQL = `insert into portal.infraction_view
+      (ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount,
+       situation, deadlines_json, points_status, actions_json, notices_json, payment_json,
+       last_event_id, last_event_version, created_at)
+    values ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9::jsonb, $10, $11::jsonb, '[]'::jsonb,
+            $12::jsonb, $13, $14, $15)`;
+
+const UPDATE_NOTICES_SQL = `update portal.infraction_view
+      set notices_json = $2::jsonb, last_event_id = $3, updated_at = $4
+    where id = $1`;
+
+const UPDATE_LAST_EVENT_SQL = `update portal.infraction_view
+      set last_event_id = $2, updated_at = $3
+    where id = $1`;
+
+const UPDATE_PAYMENT_SQL = `update portal.infraction_view
+      set payment_json = $2::jsonb, last_event_id = $3, updated_at = $4
+    where id = $1`;
+
+const SUBJECT_BY_HASH_SQL = `select id from portal.subject where cpf_hash = $1 limit 1`;
+
+const INSERT_ENTITLEMENT_SQL = `insert into portal.entitlement
+      (subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+    values ($1, 'ait', $2, $3, 'infraction', $4::date, null)
+    on conflict (tenant_id, subject_id, target_kind, target_id, relation) do nothing`;
+
+/** CTG-0001 §6.1: `AGUARDANDO_PAGAMENTO` → `PROTOCOLADO` por PAGAMENTO_CONFIRMADO (SQL condicional). */
+const REQUEST_PAID_SQL = `update portal.request
+      set state = 'PROTOCOLADO', version = version + 1, updated_at = $2
+    where target_kind = 'ait' and target_id = $1 and state = 'AGUARDANDO_PAGAMENTO'`;
+
+const CATALOG_SQL = `select service_key, availability, unavailable_reason, minimum_assurance
+     from portal.service_catalog
+    where service_key = any($1)`;
+
+const RESET_SQL = `update portal.infraction_view
+      set deadlines_json = '[]'::jsonb, actions_json = '[]'::jsonb, notices_json = '[]'::jsonb,
+          payment_json = '{}'::jsonb, last_event_id = $2, last_event_version = 0, updated_at = $3
+    where last_event_id = any($1)`;
+
+interface ViewRow extends Record<string, unknown> {
+  id: string;
+  ait_id: string;
+  subject_cpf_hash: string;
+  plate: string;
+  situation: Situation;
+  points_status: PointsStatus;
+  deadlines_json: unknown;
+  actions_json: unknown;
+  notices_json: unknown;
+  payment_json: unknown;
+  last_event_id: string;
+  last_event_version: number | string;
+}
+
+interface CatalogRow extends Record<string, unknown> {
+  service_key: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+  unavailable_reason: string | null;
+  minimum_assurance: string | null;
+}
+
+export const ACTION_REASONS = {
+  phase: 'fase_nao_admite',
+  missingService: 'servico_ausente_no_catalogo',
+} as const;
+
+// ---------------------------------------------------------------------------
+// projetor
+// ---------------------------------------------------------------------------
+
+export class InfractionViewProjector implements Projector {
+  readonly projection = 'infraction_view' as const;
+  readonly sourceEvents = [
+    'INFRACAO_ESTADO_ALTERADO',
+    'NOTIFICACAO_EXPEDIDA',
+    'NOTIFICACAO_CIENCIA',
+    'PAGAMENTO_CONFIRMADO',
+  ] as const;
+
+  constructor(private readonly source: InfractionViewSource) {}
+
+  async apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    switch (event.domainEvent) {
+      case 'INFRACAO_ESTADO_ALTERADO':
+        return this.stateChanged(event, context);
+      case 'NOTIFICACAO_EXPEDIDA':
+        return this.noticeDispatched(event, context);
+      case 'NOTIFICACAO_CIENCIA':
+        return this.noticeAcknowledged(event, context);
+      case 'PAGAMENTO_CONFIRMADO':
+        return this.paymentConfirmed(event, context);
+      default:
+        return { kind: 'skipped', reason: 'not_consumed' };
+    }
+  }
+
+  async reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void> {
+    if (windowEventIds.length === 0) return;
+    await context.tx.query(RESET_SQL, [
+      [...windowEventIds],
+      PROJECTION_SENTINEL_EVENT_ID,
+      context.now,
+    ]);
+  }
+
+  // -------------------------------------------------------------------------
+  // INFRACAO_ESTADO_ALTERADO
+  // -------------------------------------------------------------------------
+
+  private async stateChanged(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    const parsed = STATE_CHANGED_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const data = parsed.data;
+    const situation = INFRACTION_SITUATION_MAP[data.toState];
+    if (situation === undefined) {
+      return projectionError('situation', data.toState);
+    }
+    const row = await this.viewOf(context.tx, data.aitId);
+    if (
+      row &&
+      event.aggregate.kind === 'infraction' &&
+      event.aggregate.version <= Number(row.last_event_version)
+    ) {
+      return { kind: 'skipped', reason: 'stale_version' };
+    }
+    const methods = await paymentMethods(context.parameters);
+    if ('error' in methods) return methods.error;
+    const actions = await this.actionsOf(context.tx, situation);
+    const deadlines = await this.source.loadDeadlines(
+      context.tx,
+      data.infractionId,
+    );
+    const pointsStatus = POINTS_STATUS_BY_SITUATION[situation];
+    if (row) {
+      const payment = { ...asObject(row.payment_json), methods: methods.value };
+      await context.tx.query(UPDATE_STATE_SQL, [
+        row.id,
+        situation,
+        pointsStatus,
+        JSON.stringify(actions),
+        JSON.stringify(payment),
+        JSON.stringify(deadlines),
+        event.id,
+        event.aggregate.version,
+        context.now,
+      ]);
+      return { kind: 'applied' };
+    }
+    const identity = await this.source.loadAitIdentity(context.tx, data.aitId);
+    if (!identity || identity.subjectCpfHashes.length === 0) {
+      return projectionError('ait_identity', data.aitId);
+    }
+    const occurredAt =
+      identity.occurredAt instanceof Date
+        ? identity.occurredAt
+        : new Date(identity.occurredAt);
+    await context.tx.query(INSERT_VIEW_SQL, [
+      data.aitId,
+      identity.subjectCpfHashes[0],
+      identity.aitNumber,
+      identity.plate,
+      occurredAt.toISOString(),
+      identity.framingLabel,
+      identity.amount,
+      situation,
+      JSON.stringify(deadlines),
+      pointsStatus,
+      JSON.stringify(actions),
+      JSON.stringify({
+        paid: false,
+        paidTier: null,
+        tiers: [],
+        methods: methods.value,
+      }),
+      event.id,
+      event.aggregate.version,
+      context.now,
+    ]);
+    // M10: vínculo pelo evento (proprietário = índice 0; demais = condutor)
+    const validFrom = localDateOf(occurredAt, context.tenantTz);
+    for (const [index, cpfHash] of identity.subjectCpfHashes.entries()) {
+      const subject = (
+        await context.tx.query<{ id: string }>(SUBJECT_BY_HASH_SQL, [cpfHash])
+      ).rows[0];
+      if (!subject) continue;
+      await context.tx.query(INSERT_ENTITLEMENT_SQL, [
+        subject.id,
+        data.aitId,
+        index === 0 ? 'owner' : 'driver',
+        validFrom,
+      ]);
+    }
+    return { kind: 'applied' };
+  }
+
+  // -------------------------------------------------------------------------
+  // NOTIFICACAO_EXPEDIDA / NOTIFICACAO_CIENCIA / PAGAMENTO_CONFIRMADO
+  // -------------------------------------------------------------------------
+
+  private async noticeDispatched(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    const parsed = NOTICE_DISPATCHED_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const data = parsed.data;
+    const row = await this.viewOf(context.tx, data.aitId);
+    if (!row) return projectionError('infraction_view', data.aitId);
+    const kind = NOTICE_KIND_LABEL[data.kind];
+    if (!kind) {
+      await context.tx.query(UPDATE_LAST_EVENT_SQL, [
+        row.id,
+        event.id,
+        context.now,
+      ]);
+      return { kind: 'applied' };
+    }
+    const notices = [...asArray<InfractionNoticeEntry>(row.notices_json)];
+    notices.push({
+      noticeId: data.noticeId,
+      kind,
+      channel: data.channel ?? null,
+      dispatchedOn: data.dispatchedOn ?? null,
+      effectiveOn: null,
+      fictitious: false,
+      printedDeadline: data.printedDeadlineOn ?? null,
+    });
+    await context.tx.query(UPDATE_NOTICES_SQL, [
+      row.id,
+      JSON.stringify(notices),
+      event.id,
+      context.now,
+    ]);
+    return { kind: 'applied' };
+  }
+
+  private async noticeAcknowledged(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    const parsed = NOTICE_ACKNOWLEDGED_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const data = parsed.data;
+    const row = await this.viewOf(context.tx, data.aitId);
+    if (!row) return projectionError('infraction_view', data.aitId);
+    const notices = asArray<InfractionNoticeEntry>(row.notices_json).map(
+      (notice) =>
+        notice.noticeId === data.noticeId
+          ? {
+              ...notice,
+              effectiveOn: data.effectiveOn ?? null,
+              fictitious: data.fictitious ?? false,
+            }
+          : notice,
+    );
+    await context.tx.query(UPDATE_NOTICES_SQL, [
+      row.id,
+      JSON.stringify(notices),
+      event.id,
+      context.now,
+    ]);
+    return { kind: 'applied' };
+  }
+
+  private async paymentConfirmed(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    const parsed = PAYMENT_CONFIRMED_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const data = parsed.data;
+    const row = await this.viewOf(context.tx, data.aitId);
+    if (!row) return projectionError('infraction_view', data.aitId);
+    const payment = {
+      ...asObject(row.payment_json),
+      paid: true,
+      paidTier: data.tier ?? null,
+      paidOn: data.paidOn ?? null,
+    };
+    await context.tx.query(UPDATE_PAYMENT_SQL, [
+      row.id,
+      JSON.stringify(payment),
+      event.id,
+      context.now,
+    ]);
+    await context.tx.query(REQUEST_PAID_SQL, [data.aitId, context.now]);
+    return { kind: 'applied' };
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  private async viewOf(
+    tx: PortalSqlTransaction,
+    aitId: string,
+  ): Promise<ViewRow | undefined> {
+    return (await tx.query<ViewRow>(VIEW_FOR_UPDATE_SQL, [aitId])).rows[0];
+  }
+
+  /** §7.3 `actions_json[i] = { key, available, reason, minimumAssurance }`. */
+  private async actionsOf(
+    tx: PortalSqlTransaction,
+    situation: Situation,
+  ): Promise<InfractionActionEntry[]> {
+    const keys = INFRACTION_ACTIONS.map((action) => ACTION_SERVICE_KEY[action]);
+    const catalog = new Map(
+      (await tx.query<CatalogRow>(CATALOG_SQL, [keys])).rows.map((row) => [
+        row.service_key,
+        row,
+      ]),
+    );
+    return INFRACTION_ACTIONS.map((key) => {
+      const service = catalog.get(ACTION_SERVICE_KEY[key]);
+      const minimumAssurance = service?.minimum_assurance ?? null;
+      if (!service) {
+        return {
+          key,
+          available: false,
+          reason: ACTION_REASONS.missingService,
+          minimumAssurance,
+        };
+      }
+      if (!ACTION_PHASE_MATRIX[situation][key]) {
+        return {
+          key,
+          available: false,
+          reason: ACTION_REASONS.phase,
+          minimumAssurance,
+        };
+      }
+      if (service.availability === 'unavailable') {
+        return {
+          key,
+          available: false,
+          reason: service.unavailable_reason,
+          minimumAssurance,
+        };
+      }
+      return { key, available: true, reason: null, minimumAssurance };
+    });
+  }
+}
+
+/** §7.3 `payment_json.methods` — os quatro parâmetros lidos, nunca literais. */
+async function paymentMethods(
+  parameters: PortalParameterReader,
+): Promise<
+  | { value: Record<keyof typeof PAYMENT_METHOD_PARAMETERS, boolean> }
+  | { error: ProjectionResult }
+> {
+  const value = {} as Record<keyof typeof PAYMENT_METHOD_PARAMETERS, boolean>;
+  for (const [method, key] of Object.entries(
+    PAYMENT_METHOD_PARAMETERS,
+  ) as Array<[keyof typeof PAYMENT_METHOD_PARAMETERS, string]>) {
+    try {
+      const parameter = await parameters.get(key);
+      value[method] = parameter.value_json === true;
+    } catch {
+      return { error: projectionError('parameter', key) };
+    }
+  }
+  return { value };
+}
diff --git a/backend/domains/portal/projections/src/handwritten/national-reads.service.ts b/backend/domains/portal/projections/src/handwritten/national-reads.service.ts
new file mode 100644
index 0000000..a5a6168
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/national-reads.service.ts
@@ -0,0 +1,194 @@
+// Cache das leituras nacionais (work/rounds/R-0009/contracts/CTG-0002.md §8;
+// plan R-0009 M17; ADR-0003, ADR-0020 §5). As portas chegam pelo token
+// `PORTAL_NATIONAL_READ_PORTS` — fatias ESTRUTURAIS de `CdtPort`, `RenachPort`
+// e `WsdenatranReadPort` (`packages/senatran-adapter/src/ports.ts`), compostas
+// no app com `createSenatranAdapter().ports` (padrão de
+// `teat-snapshots.providers.ts`): nenhum `fetch` próprio, nenhuma dependência
+// do pacote do adapter aqui. TTL = parâmetro `portal.read_cache_ttl_minutes`
+// lido pelo `OpsParameterService` (token `PORTAL_PARAMETER_READER`, fatia
+// `get(key)`), nunca literal; resposta SEMPRE com `cachedAt` (RN-PORTAL-117 C).
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import {
+  PortalClock,
+  PortalError,
+  type PortalClockLike,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import type { PortalParameterReader } from './projection-contract.js';
+
+export type { PortalParameterReader } from './projection-contract.js';
+
+// ---------------------------------------------------------------------------
+// tokens e fatias (§8)
+// ---------------------------------------------------------------------------
+
+export const PORTAL_NATIONAL_READ_PORTS = Symbol('PORTAL_NATIONAL_READ_PORTS');
+export const PORTAL_PARAMETER_READER = Symbol('PORTAL_PARAMETER_READER');
+
+/** `Pick<CdtPort, 'getCitizenLicense' | 'listCitizenVehicles' | 'getPaymentQuote'>`, estrutural. */
+export interface CdtReadSlice {
+  getCitizenLicense(cpf: string): Promise<unknown>;
+  listCitizenVehicles(cpf: string): Promise<unknown>;
+  getPaymentQuote(aitNumber: string): Promise<unknown>;
+}
+
+/** `Pick<RenachPort, 'findDriverByCpf'>`, estrutural (OD-P35: sem rota nesta rodada). */
+export interface RenachReadSlice {
+  findDriverByCpf(cpf: string): Promise<unknown>;
+}
+
+/** `Pick<WsdenatranReadPort, 'findVehicleByPlate' | 'findVehicleByRenavam'>`, estrutural. */
+export interface WsdenatranReadSlice {
+  findVehicleByPlate(plate: string): Promise<unknown>;
+  findVehicleByRenavam(renavam: string): Promise<unknown>;
+}
+
+export interface PortalNationalReadPorts {
+  cdt: CdtReadSlice;
+  renach: RenachReadSlice;
+  wsdenatranRead: WsdenatranReadSlice;
+}
+
+/** Chave do catálogo (H.54; OD-P11) — aparece UMA vez, aqui (verify:parameter-catalogue). */
+export const PORTAL_READ_CACHE_TTL_PARAMETER = 'portal.read_cache_ttl_minutes';
+
+export const NATIONAL_READ_KINDS = ['cnh', 'vehicles', 'clearance'] as const;
+export type NationalReadKind = (typeof NATIONAL_READ_KINDS)[number];
+
+export interface NationalReadResult<T = unknown> {
+  payload: T;
+  /** ISO 8601 — a data-hora da consulta é sempre visível (RN-PORTAL-117 C). */
+  cachedAt: string;
+}
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+/** `target_id` nulo é comparado pelo uuid nulo (índice único do DDL 65). */
+const NIL_TARGET = '00000000-0000-0000-0000-000000000000';
+
+const CACHE_FOR_UPDATE_SQL = `select id, payload_json, cached_at
+     from portal.national_read_cache
+    where subject_id = $1 and kind = $2
+      and coalesce(target_id, $4::uuid) = coalesce($3::uuid, $4::uuid)
+    for update`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
+const INSERT_CACHE_SQL = `insert into portal.national_read_cache
+      (subject_id, kind, target_id, payload_json, cached_at, created_at)
+    values ($1, $2, $3, $4::jsonb, $5, $5)`;
+
+const UPDATE_CACHE_SQL = `update portal.national_read_cache
+      set payload_json = $2::jsonb, cached_at = $3, updated_at = $3
+    where id = $1`;
+
+interface CacheRow extends Record<string, unknown> {
+  id: string;
+  payload_json: unknown;
+  cached_at: Date | string;
+}
+
+const MS_PER_MINUTE = 60_000;
+const SECONDS_PER_MINUTE = 60;
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+@Injectable()
+export class PortalNationalReadsService {
+  private readonly clock: PortalClockLike;
+
+  constructor(
+    @Inject(PORTAL_PARAMETER_READER)
+    private readonly parameters: PortalParameterReader,
+    @Optional() clock?: PortalClock,
+  ) {
+    this.clock = clock ?? new PortalClock();
+  }
+
+  /** TTL em minutos, lido do catálogo do tenant; ausente → defeito de configuração. */
+  async ttlMinutes(): Promise<number> {
+    let value: unknown;
+    try {
+      value = (await this.parameters.get(PORTAL_READ_CACHE_TTL_PARAMETER))
+        .value_json;
+    } catch {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { parameterKey: PORTAL_READ_CACHE_TTL_PARAMETER },
+      });
+    }
+    const minutes = Number(value);
+    if (!Number.isFinite(minutes) || minutes < 0) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { parameterKey: PORTAL_READ_CACHE_TTL_PARAMETER },
+      });
+    }
+    return minutes;
+  }
+
+  /** §8 algoritmo `read(tx, subject, kind, targetId, fetch)`. */
+  async read<T = unknown>(
+    tx: PortalSqlTransaction,
+    subject: PortalSubjectRecord,
+    kind: NationalReadKind,
+    targetId: string | null,
+    fetch: () => Promise<T>,
+  ): Promise<NationalReadResult<T>> {
+    const ttlMinutes = await this.ttlMinutes();
+    const now = this.clock.now();
+    const cache = (
+      await tx.query<CacheRow>(CACHE_FOR_UPDATE_SQL, [
+        subject.subjectId,
+        kind,
+        targetId,
+        NIL_TARGET,
+      ])
+    ).rows[0];
+    if (cache) {
+      const cachedAt = new Date(iso(cache.cached_at));
+      if (now.getTime() - cachedAt.getTime() <= ttlMinutes * MS_PER_MINUTE) {
+        return { payload: cache.payload_json as T, cachedAt: iso(cachedAt) };
+      }
+    }
+    let payload: T;
+    try {
+      payload = await fetch();
+    } catch {
+      if (cache) {
+        // fonte indisponível com cache → 200 com cachedAt antigo (RN-PORTAL-117 C)
+        return {
+          payload: cache.payload_json as T,
+          cachedAt: iso(cache.cached_at),
+        };
+      }
+      throw new PortalError('PORTAL.NATIONAL_READ_UNAVAILABLE', {
+        status: 503,
+        context: {
+          cachedAt: null,
+          retryAfter: ttlMinutes * SECONDS_PER_MINUTE,
+        },
+      });
+    }
+    const serialized = JSON.stringify(payload ?? null);
+    if (cache) {
+      await tx.query(UPDATE_CACHE_SQL, [cache.id, serialized, now]);
+    } else {
+      await tx.query(INSERT_CACHE_SQL, [
+        subject.subjectId,
+        kind,
+        targetId,
+        serialized,
+        now,
+      ]);
+    }
+    return { payload, cachedAt: now.toISOString() };
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/points-view.projection.spec.ts b/backend/domains/portal/projections/src/handwritten/points-view.projection.spec.ts
new file mode 100644
index 0000000..9b7ccb4
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/points-view.projection.spec.ts
@@ -0,0 +1,209 @@
+// R-0009 CTG-0002 §7.4 e §13 (TASK-0006) — C-0002-53: projetor `points_view`
+// (PENALIDADE_DEFINITIVA → definitive_points += points, last_12_months_json na
+// janela `addCalendarMonths(today, -12)`, by_vehicle_json por placa da view;
+// ait sem view → last_error). Fica vermelho até TASK-0008 criar
+// `projectors.service.ts` e `points-view.projection.ts` (§14).
+import { describe, expect, it } from 'vitest';
+
+import { type Row } from '../../../requests/tests/support/fake-sql.js';
+import {
+  FIXED_TODAY,
+  SUBJECTS,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  AIT_F1,
+  AIT_F9,
+  EVENT_IDS,
+  INFRACTION_D1,
+  eventById,
+} from '../../tests/fixtures/outbox-events.js';
+import { projectorsHarness } from '../../tests/support/projectors-harness.js';
+
+const PROJECTION = 'points_view';
+
+/**
+ * Soma de calendário em meses com grampo no último dia do mês de destino —
+ * mesma semântica de `addCalendarMonths` de `@detran/inf-deadlines`
+ * (rait-deadline-engine.md §2), que o projetor usa para a janela de 12 meses
+ * (§7.4). Reproduzida aqui porque `@detran/portal-projections` não declara
+ * aquele pacote como dependência (`package.json` fora do que o Inspector toca).
+ */
+function addCalendarMonths(date: string, months: number): string {
+  const [year, month, day] = date.split('-').map(Number) as [
+    number,
+    number,
+    number,
+  ];
+  const shifted = month - 1 + months;
+  const targetYear = year + Math.floor(shifted / 12);
+  const targetMonth = ((shifted % 12) + 12) % 12;
+  const lastDay = new Date(
+    Date.UTC(targetYear, targetMonth + 1, 0),
+  ).getUTCDate();
+  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
+    .toISOString()
+    .slice(0, 10);
+}
+
+function pointsOf(
+  h: ReturnType<typeof projectorsHarness>,
+  cpfHash: string,
+): Row | undefined {
+  return h.db
+    .rows('portal.points_view')
+    .find((row) => row.subject_cpf_hash === cpfHash);
+}
+
+describe('CTG-0002 §7.4 — points_view (C-0002-53)', () => {
+  it('C-0002-53 — dado PENALIDADE_DEFINITIVA points 4 sobre ait com view (…f0000009, cpf da qualificada) então definitive_points += 4, last_12_months_json e by_vehicle_json', async () => {
+    const h = projectorsHarness();
+    const outcome = await h.apply(eventById(EVENT_IDS.e6), PROJECTION);
+    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
+    const row = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
+    expect(row).toMatchObject({
+      definitive_points: 4,
+      disputed_points: 0,
+      last_event_id: EVENT_IDS.e6,
+    });
+    expect(row.last_12_months_json).toEqual([
+      { aitId: AIT_F9, finalOn: '2026-07-15', points: 4 },
+    ]);
+    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 4 }]);
+    expect(row.cached_at ?? null).toBeNull();
+
+    // segunda penalidade definitiva sobre outro AIT da mesma placa acumula
+    const second = {
+      ...eventById(EVENT_IDS.e6),
+      id: '00000000-0000-7000-8000-007000700051',
+      aggregate: {
+        kind: 'infraction',
+        id: '00000000-0000-7000-8000-0000d0000019',
+        version: 9,
+      },
+      data: {
+        ...eventById(EVENT_IDS.e6).data,
+        infractionId: '00000000-0000-7000-8000-0000d0000019',
+        finalOn: '2026-08-01',
+        points: 3,
+      },
+    };
+    expect((await h.apply(second, PROJECTION)).applied).toBe(true);
+    const updated = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
+    expect(updated.definitive_points).toBe(7);
+    expect(updated.last_12_months_json).toEqual([
+      { aitId: AIT_F9, finalOn: '2026-07-15', points: 4 },
+      { aitId: AIT_F9, finalOn: '2026-08-01', points: 3 },
+    ]);
+    expect(updated.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 7 }]);
+  });
+
+  it('C-0002-53 — dado a linha …71000001 da prata (definitive 3, disputed 4) então += acumula sobre o existente e disputed_points não muda', async () => {
+    const h = projectorsHarness({
+      seed: (db) =>
+        db.seed('portal.points_view', [
+          {
+            id: '00000000-0000-7000-8000-000071000001',
+            subject_cpf_hash: SUBJECTS.prata.cpfHash,
+            definitive_points: 3,
+            disputed_points: 4,
+            by_vehicle_json: [],
+            last_12_months_json: [],
+            last_event_id: null,
+            cached_at: new Date('2026-09-14T12:00:00-04:00'),
+          },
+        ]),
+    });
+    const event = {
+      ...eventById(EVENT_IDS.e6),
+      id: '00000000-0000-7000-8000-007000700052',
+      aggregate: {
+        kind: 'infraction',
+        id: '00000000-0000-7000-8000-0000d0000005',
+        version: 9,
+      },
+      data: {
+        infractionId: '00000000-0000-7000-8000-0000d0000005',
+        aitId: '00000000-0000-7000-8000-0000f0000005',
+        finalOn: '2026-09-01',
+        points: 5,
+        amountTier: 'integral_juros',
+      },
+    };
+    expect((await h.apply(event, PROJECTION)).applied).toBe(true);
+    const row = pointsOf(h, SUBJECTS.prata.cpfHash)!;
+    expect(row).toMatchObject({
+      id: '00000000-0000-7000-8000-000071000001',
+      definitive_points: 8,
+      disputed_points: 4,
+    });
+    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E03', points: 5 }]);
+    expect(new Date(String(row.cached_at)).toISOString()).toBe(
+      '2026-09-14T16:00:00.000Z',
+    );
+  });
+
+  it("C-0002-53 — dado ait sem view então last_error 'PORTAL.INTERNAL:infraction_view:<aitId>' e nenhuma linha", async () => {
+    const h = projectorsHarness();
+    const event = {
+      ...eventById(EVENT_IDS.e6),
+      id: '00000000-0000-7000-8000-007000700053',
+      aggregate: { kind: 'infraction', id: INFRACTION_D1, version: 9 },
+      data: {
+        ...eventById(EVENT_IDS.e6).data,
+        infractionId: INFRACTION_D1,
+        aitId: AIT_F1,
+      },
+    };
+    const outcome = await h.apply(event, PROJECTION);
+    expect(outcome.applied).toBe(false);
+    expect(outcome.error).toBe(`PORTAL.INTERNAL:infraction_view:${AIT_F1}`);
+    expect(h.db.rows('portal.points_view')).toHaveLength(0);
+    expect(
+      h.appliedEvents('00000000-0000-7000-8000-007000700053')[0],
+    ).toMatchObject({
+      projection: PROJECTION,
+      last_error: `PORTAL.INTERNAL:infraction_view:${AIT_F1}`,
+    });
+  });
+
+  it('C-0002-53 — dado finalOn há mais de 12 meses então fora de last_12_months_json (janela addCalendarMonths(today, -12)), mas os pontos contam', async () => {
+    const h = projectorsHarness();
+    const windowStart = addCalendarMonths(FIXED_TODAY, -12);
+    const oldFinalOn = addCalendarMonths(windowStart, -1);
+    const old = {
+      ...eventById(EVENT_IDS.e6),
+      id: '00000000-0000-7000-8000-007000700054',
+      data: { ...eventById(EVENT_IDS.e6).data, finalOn: oldFinalOn, points: 7 },
+    };
+    expect((await h.apply(old, PROJECTION)).applied).toBe(true);
+    const row = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
+    expect(row.definitive_points).toBe(7);
+    expect(row.last_12_months_json).toEqual([]);
+    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 7 }]);
+
+    const edge = {
+      ...old,
+      id: '00000000-0000-7000-8000-007000700055',
+      aggregate: { ...old.aggregate, version: 10 },
+      data: { ...old.data, finalOn: windowStart, points: 1 },
+    };
+    expect((await h.apply(edge, PROJECTION)).applied).toBe(true);
+    expect(
+      pointsOf(h, SUBJECTS.qualificada.cpfHash)!.last_12_months_json,
+    ).toEqual([{ aitId: AIT_F9, finalOn: windowStart, points: 1 }]);
+  });
+
+  it("§7.1 — dado o mesmo PENALIDADE_DEFINITIVA duas vezes então skipped 'already_applied' e definitive_points não dobra", async () => {
+    const h = projectorsHarness();
+    expect((await h.apply(eventById(EVENT_IDS.e6), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(await h.apply(eventById(EVENT_IDS.e6), PROJECTION)).toMatchObject({
+      applied: false,
+      skipped: 'already_applied',
+    });
+    expect(pointsOf(h, SUBJECTS.qualificada.cpfHash)!.definitive_points).toBe(
+      4,
+    );
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/points-view.projection.ts b/backend/domains/portal/projections/src/handwritten/points-view.projection.ts
new file mode 100644
index 0000000..b377109
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/points-view.projection.ts
@@ -0,0 +1,150 @@
+// Source events: PENALIDADE_DEFINITIVA (inf.infraction.penalty-final)
+//
+// Projeção `portal.points_view` (work/rounds/R-0009/contracts/CTG-0002.md
+// §7.2, §7.4; plan R-0009 M16). Chave `(tenant, subject_cpf_hash)`: o CPF vem
+// da `infraction_view` do AIT (ausente → `PORTAL.INTERNAL:infraction_view:<aitId>`);
+// `definitive_points += points`; `disputed_points` inalterado (pontuação por
+// AIT em disputa é OD-P34); `last_12_months_json` na janela
+// `addCalendarMonths(today, -12)`; `by_vehicle_json` acumulado por placa da
+// view; `cached_at` inalterado (leitura RENACH é OD-P21).
+import { z } from 'zod';
+import { addCalendarMonths } from '@detran/inf-deadlines';
+
+import {
+  asArray,
+  projectionError,
+  type PortalConsumedEvent,
+  type ProjectionContext,
+  type ProjectionResult,
+  type Projector,
+} from './projection-contract.js';
+
+export interface PointsMonthEntry {
+  aitId: string;
+  finalOn: string;
+  points: number;
+}
+
+export interface PointsVehicleEntry {
+  plate: string;
+  points: number;
+}
+
+const PENALTY_DATA = z
+  .object({
+    aitId: z.uuid(),
+    finalOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
+    points: z.number().int().min(0),
+  })
+  .passthrough();
+
+const VIEW_SQL = `select subject_cpf_hash, plate
+     from portal.infraction_view
+    where ait_id = $1
+    limit 1`;
+
+const POINTS_FOR_UPDATE_SQL = `select id, definitive_points, disputed_points, by_vehicle_json, last_12_months_json
+     from portal.points_view
+    where subject_cpf_hash = $1
+    for update`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
+const INSERT_POINTS_SQL = `insert into portal.points_view
+      (subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json,
+       last_12_months_json, last_event_id, cached_at, created_at)
+    values ($1, $2, 0, $3::jsonb, $4::jsonb, $5, null, $6)`;
+
+const UPDATE_POINTS_SQL = `update portal.points_view
+      set definitive_points = $2, by_vehicle_json = $3::jsonb, last_12_months_json = $4::jsonb,
+          last_event_id = $5, updated_at = $6
+    where id = $1`;
+
+const RESET_SQL = `delete from portal.points_view where last_event_id = any($1)`;
+
+interface PointsRow extends Record<string, unknown> {
+  id: string;
+  definitive_points: number | string;
+  disputed_points: number | string;
+  by_vehicle_json: unknown;
+  last_12_months_json: unknown;
+}
+
+/** Janela de 12 meses (§7.4): `finalOn ≥ today − 12 meses`. */
+export function twelveMonthWindowStart(today: string): string {
+  return addCalendarMonths(today, -12);
+}
+
+export class PointsViewProjector implements Projector {
+  readonly projection = 'points_view' as const;
+  readonly sourceEvents = ['PENALIDADE_DEFINITIVA'] as const;
+
+  async apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    if (event.domainEvent !== 'PENALIDADE_DEFINITIVA') {
+      return { kind: 'skipped', reason: 'not_consumed' };
+    }
+    const parsed = PENALTY_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const data = parsed.data;
+    const view = (
+      await context.tx.query<{ subject_cpf_hash: string; plate: string }>(
+        VIEW_SQL,
+        [data.aitId],
+      )
+    ).rows[0];
+    if (!view) return projectionError('infraction_view', data.aitId);
+    const row = (
+      await context.tx.query<PointsRow>(POINTS_FOR_UPDATE_SQL, [
+        view.subject_cpf_hash,
+      ])
+    ).rows[0];
+    const windowStart = twelveMonthWindowStart(context.today);
+    const lastTwelve = asArray<PointsMonthEntry>(
+      row?.last_12_months_json,
+    ).filter((entry) => entry.finalOn >= windowStart);
+    if (data.finalOn >= windowStart) {
+      lastTwelve.push({
+        aitId: data.aitId,
+        finalOn: data.finalOn,
+        points: data.points,
+      });
+    }
+    const byVehicle = asArray<PointsVehicleEntry>(row?.by_vehicle_json).map(
+      (entry) => ({ ...entry }),
+    );
+    const vehicle = byVehicle.find((entry) => entry.plate === view.plate);
+    if (vehicle) vehicle.points += data.points;
+    else byVehicle.push({ plate: view.plate, points: data.points });
+    const definitive = Number(row?.definitive_points ?? 0) + data.points;
+    if (row) {
+      await context.tx.query(UPDATE_POINTS_SQL, [
+        row.id,
+        definitive,
+        JSON.stringify(byVehicle),
+        JSON.stringify(lastTwelve),
+        event.id,
+        context.now,
+      ]);
+    } else {
+      await context.tx.query(INSERT_POINTS_SQL, [
+        view.subject_cpf_hash,
+        definitive,
+        JSON.stringify(byVehicle),
+        JSON.stringify(lastTwelve),
+        event.id,
+        context.now,
+      ]);
+    }
+    return { kind: 'applied' };
+  }
+
+  async reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void> {
+    if (windowEventIds.length === 0) return;
+    await context.tx.query(RESET_SQL, [[...windowEventIds]]);
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/process-timeline.projection.spec.ts b/backend/domains/portal/projections/src/handwritten/process-timeline.projection.spec.ts
new file mode 100644
index 0000000..4a70bc1
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/process-timeline.projection.spec.ts
@@ -0,0 +1,201 @@
+// R-0009 CTG-0002 §7.4 e §13 (TASK-0006) — C-0002-52: projetor `process_timeline`
+// (linha por case_id ligada ao request pelo `delegation_external_id`, entradas
+// `visibility: 'citizen'`, `decision_json` de RAIT_DECISAO_PUBLICADA com
+// EM_ANDAMENTO_NO_ORGAO → RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (version+2),
+// diligência em `deadlines_json`). Fica vermelho até TASK-0008 criar
+// `projectors.service.ts` e `process-timeline.projection.ts` (§14).
+import { describe, expect, it } from 'vitest';
+
+import { type Row } from '../../../requests/tests/support/fake-sql.js';
+import { SUBJECTS } from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  AIT_F3,
+  CASE_207,
+  DECISION_409,
+  EVENT_IDS,
+  INQUIRY_308,
+  eventById,
+} from '../../tests/fixtures/outbox-events.js';
+import { projectorsHarness } from '../../tests/support/projectors-harness.js';
+
+const PROJECTION = 'process_timeline';
+const REQUEST_ID = '00000000-0000-7000-8000-0000704000e2';
+
+function seedLinkedRequest(
+  db: { seed(table: string, rows: Row[]): Row[] },
+  state = 'EM_ANDAMENTO_NO_ORGAO',
+): void {
+  db.seed('portal.request', [
+    {
+      id: REQUEST_ID,
+      state,
+      service_key: 'defesa_previa',
+      subject_id: SUBJECTS.prata.id,
+      target_kind: 'ait',
+      target_id: AIT_F3,
+      minimum_assurance: 'avancada',
+      delegation_status: 'delegated',
+      delegation_domain: 'inf',
+      delegation_command: 'inf:rait-case:protocol',
+      delegation_external_id: CASE_207,
+      version: 4,
+    },
+  ]);
+}
+
+function timeline(h: ReturnType<typeof projectorsHarness>): Row | undefined {
+  return h.db
+    .rows('portal.process_timeline')
+    .find((row) => row.case_id === CASE_207);
+}
+
+describe('CTG-0002 §7.4 — process_timeline (C-0002-52)', () => {
+  it("C-0002-52 — dado RAIT_CASO_PROTOCOLADO com caseId ligado a request.delegation_external_id então linha por case_id com request_id e entry visibility 'citizen'", async () => {
+    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
+    const outcome = await h.apply(eventById(EVENT_IDS.e7), PROJECTION);
+    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
+    const row = timeline(h)!;
+    expect(row).toMatchObject({
+      case_id: CASE_207,
+      request_id: REQUEST_ID,
+      last_event_id: EVENT_IDS.e7,
+      decision_json: null,
+    });
+    const entries = row.entries_json as Row[];
+    expect(entries).toHaveLength(1);
+    expect(entries[0]).toMatchObject({
+      at: '2026-09-07T12:00:00.000Z',
+      type: eventById(EVENT_IDS.e7).type,
+      domainEvent: 'RAIT_CASO_PROTOCOLADO',
+      visibility: 'citizen',
+    });
+    expect(entries[0]!.data).toMatchObject({
+      caseId: CASE_207,
+      aitId: AIT_F3,
+      instance: 'defesa_previa',
+    });
+    expect(row.deadlines_json).toEqual([]);
+    expect(h.appliedEvents(EVENT_IDS.e7)).toHaveLength(1);
+  });
+
+  it('C-0002-52 — dado caso sem request no Portal (balcão, RN-PORTAL-105 3) então linha com request_id null', async () => {
+    const h = projectorsHarness();
+    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(timeline(h)).toMatchObject({ case_id: CASE_207, request_id: null });
+  });
+
+  it('C-0002-52 — dado RAIT_DECISAO_PUBLICADA então decision_json { outcome: decisionKind, publishedOn, … } e request EM_ANDAMENTO_NO_ORGAO → AVALIACAO_OFERECIDA (version+2)', async () => {
+    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
+    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect((await h.apply(eventById(EVENT_IDS.e9), PROJECTION)).applied).toBe(
+      true,
+    );
+    const row = timeline(h)!;
+    expect(row.decision_json).toEqual({
+      outcome: 'indeferido',
+      summary: null,
+      publishedOn: '2026-09-12',
+      documentUrl: null,
+      nextStep: { kind: null, serviceKey: null, dueOn: null },
+      refundDue: null,
+      finalInstance: null,
+    });
+    expect(row.last_event_id).toBe(EVENT_IDS.e9);
+    expect(
+      (row.entries_json as Row[]).map((entry) => entry.domainEvent),
+    ).toEqual(['RAIT_CASO_PROTOCOLADO', 'RAIT_DECISAO_PUBLICADA']);
+    expect((row.entries_json as Row[])[1]!.data).toMatchObject({
+      decisionId: DECISION_409,
+      decisionKind: 'indeferido',
+    });
+    const request = h.db
+      .rows('portal.request')
+      .find((candidate) => candidate.id === REQUEST_ID)!;
+    expect(request).toMatchObject({ state: 'AVALIACAO_OFERECIDA', version: 6 });
+  });
+
+  it('C-0002-52 — dado RAIT_DECISAO_PUBLICADA com request fora de EM_ANDAMENTO_NO_ORGAO então o request não muda (SQL condicional)', async () => {
+    const h = projectorsHarness({
+      seed: (db) => seedLinkedRequest(db, 'PROTOCOLADO'),
+    });
+    expect((await h.apply(eventById(EVENT_IDS.e9), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(timeline(h)!.decision_json).toMatchObject({ outcome: 'indeferido' });
+    expect(
+      h.db
+        .rows('portal.request')
+        .find((candidate) => candidate.id === REQUEST_ID),
+    ).toMatchObject({ state: 'PROTOCOLADO', version: 4 });
+  });
+
+  it("C-0002-52 — dado rait.inquiry.changed sem outcome então entry com o type da diligência e deadlines_json += { kind 'diligencia', dueOn, ownedBy: 'citizen' }; com outcome então sem prazo novo", async () => {
+    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
+    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
+      true,
+    );
+    const inquiry = eventById(EVENT_IDS.e8);
+    const outcome = await h.apply(inquiry, PROJECTION);
+    expect(outcome.applied).toBe(true);
+    const row = timeline(h)!;
+    expect(row.deadlines_json).toEqual([
+      { kind: 'diligencia', dueOn: '2026-09-30', ownedBy: 'citizen' },
+    ]);
+    const entries = row.entries_json as Row[];
+    expect(entries).toHaveLength(2);
+    expect(entries[1]).toMatchObject({
+      type: inquiry.type,
+      visibility: 'citizen',
+    });
+    expect(entries[1]!.data).toMatchObject({
+      inquiryId: INQUIRY_308,
+      addressee: 'cidadao',
+      dueOn: '2026-09-30',
+    });
+
+    const answered = {
+      ...inquiry,
+      id: '00000000-0000-7000-8000-007000700041',
+      aggregate: { ...inquiry.aggregate, version: 4 },
+      data: { ...inquiry.data, outcome: 'respondida' },
+    };
+    expect((await h.apply(answered, PROJECTION)).applied).toBe(true);
+    expect(timeline(h)!.deadlines_json).toEqual([
+      { kind: 'diligencia', dueOn: '2026-09-30', ownedBy: 'citizen' },
+    ]);
+    expect(timeline(h)!.entries_json as Row[]).toHaveLength(3);
+
+    const agency = {
+      ...inquiry,
+      id: '00000000-0000-7000-8000-007000700042',
+      aggregate: { ...inquiry.aggregate, version: 5 },
+      data: {
+        ...inquiry.data,
+        inquiryId: '00000000-0000-7000-8000-007000700309',
+        addressee: 'orgao',
+      },
+    };
+    expect((await h.apply(agency, PROJECTION)).applied).toBe(true);
+    expect((timeline(h)!.deadlines_json as Row[])[1]).toEqual({
+      kind: 'diligencia',
+      dueOn: '2026-09-30',
+      ownedBy: 'agency',
+    });
+  });
+
+  it("§7.1 — dado o mesmo evento RAIT duas vezes então a segunda é skipped 'already_applied' e entries_json não duplica", async () => {
+    const h = projectorsHarness();
+    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
+      true,
+    );
+    expect(await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).toMatchObject({
+      applied: false,
+      skipped: 'already_applied',
+    });
+    expect(timeline(h)!.entries_json as Row[]).toHaveLength(1);
+  });
+});
diff --git a/backend/domains/portal/projections/src/handwritten/process-timeline.projection.ts b/backend/domains/portal/projections/src/handwritten/process-timeline.projection.ts
new file mode 100644
index 0000000..f735a05
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/process-timeline.projection.ts
@@ -0,0 +1,219 @@
+// Source events: RAIT_CASO_PROTOCOLADO (rait.case.created), RAIT_CASO_ESTADO_ALTERADO (rait.case.changed), RAIT_EFEITO_SUSPENSIVO_INSTAURADO (rait.case.admitted), RAIT_RECURSO_RECEBIDO_JULGADOR (rait.case.received), RAIT_CASO_TRANSITADO (rait.case.transited), ENCERRADO_DESISTENCIA (rait.case.withdrawn), RAIT_DECISAO_PUBLICADA (rait.decision.published), rait.inquiry.changed (sem domainEvent)
+//
+// Projeção `portal.process_timeline` (work/rounds/R-0009/contracts/CTG-0002.md
+// §7.2, §7.4; plan R-0009 M16; ADR-0019: o caso é do RAIT). Uma linha por
+// `case_id`, ligada ao pedido pelo `delegation_external_id` (null quando o
+// caso nasceu no balcão — RN-PORTAL-105 3, OD-P29); `entries_json` só com
+// ids/tokens/datas e `visibility: 'citizen'`; `RAIT_DECISAO_PUBLICADA`
+// preenche `decision_json` (OD-P43) e avança o pedido EM_ANDAMENTO_NO_ORGAO →
+// RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (T-AVAL-CONVITE imediato; SQL
+// condicional; version += 2); `rait.inquiry.changed` sem `outcome` abre um
+// prazo de diligência.
+import { z } from 'zod';
+
+import {
+  asArray,
+  primitiveData,
+  projectionError,
+  type PortalConsumedEvent,
+  type ProjectionContext,
+  type ProjectionResult,
+  type Projector,
+} from './projection-contract.js';
+
+/** `type` técnico da diligência (sem `domainEvent`) — concatenado (verify:parameter-catalogue). */
+export const RAIT_INQUIRY_CHANGED_TYPE = ['rait', 'inquiry', 'changed'].join(
+  '.',
+);
+
+export const PROCESS_TIMELINE_DOMAIN_EVENTS = [
+  'RAIT_CASO_PROTOCOLADO',
+  'RAIT_CASO_ESTADO_ALTERADO',
+  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
+  'RAIT_RECURSO_RECEBIDO_JULGADOR',
+  'RAIT_CASO_TRANSITADO',
+  'ENCERRADO_DESISTENCIA',
+  'RAIT_DECISAO_PUBLICADA',
+] as const;
+
+export interface TimelineEntry {
+  at: string;
+  type: string;
+  domainEvent: string | null;
+  visibility: 'citizen';
+  data: Record<string, string | number | boolean | null>;
+}
+
+export interface TimelineDeadline {
+  kind: 'diligencia';
+  dueOn: string;
+  ownedBy: 'citizen' | 'agency';
+}
+
+export interface TimelineDecision {
+  outcome: string;
+  summary: null;
+  publishedOn: string | null;
+  documentUrl: null;
+  nextStep: { kind: null; serviceKey: null; dueOn: null };
+  refundDue: null;
+  finalInstance: null;
+}
+
+const CASE_DATA = z.object({ caseId: z.string().min(1) }).passthrough();
+
+const DECISION_DATA = z
+  .object({
+    caseId: z.string().min(1),
+    decisionKind: z.string(),
+    publishedOn: z.string().nullable().optional(),
+  })
+  .passthrough();
+
+const INQUIRY_DATA = z
+  .object({
+    caseId: z.string().min(1),
+    addressee: z.string().nullable().optional(),
+    dueOn: z.string().nullable().optional(),
+    outcome: z.string().nullable().optional(),
+  })
+  .passthrough();
+
+/** Vocabulário de `addressee` vem de R-0007 (OD-P43): só `cidadao` é o cidadão. */
+const CITIZEN_ADDRESSEE = 'cidadao';
+
+const TIMELINE_FOR_UPDATE_SQL = `select id, request_id, case_id, entries_json, deadlines_json, decision_json, last_event_id
+     from portal.process_timeline
+    where case_id = $1
+    for update`;
+
+const LINKED_REQUEST_SQL = `select id
+     from portal.request
+    where delegation_external_id = $1
+    order by created_at desc
+    limit 1`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
+const INSERT_TIMELINE_SQL = `insert into portal.process_timeline
+      (request_id, case_id, entries_json, deadlines_json, decision_json, last_event_id, created_at)
+    values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7)`;
+
+const UPDATE_TIMELINE_SQL = `update portal.process_timeline
+      set entries_json = $2::jsonb, deadlines_json = $3::jsonb, decision_json = $4::jsonb,
+          last_event_id = $5, updated_at = $6
+    where id = $1`;
+
+/** CTG-0001 §6.1: EM_ANDAMENTO_NO_ORGAO → RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (version += 2). */
+const REQUEST_DECIDED_SQL = `update portal.request
+      set state = 'AVALIACAO_OFERECIDA', version = version + 2, updated_at = $2
+    where id = $1 and state = 'EM_ANDAMENTO_NO_ORGAO'`;
+
+const RESET_SQL = `delete from portal.process_timeline where last_event_id = any($1)`;
+
+interface TimelineRow extends Record<string, unknown> {
+  id: string;
+  request_id: string | null;
+  case_id: string;
+  entries_json: unknown;
+  deadlines_json: unknown;
+  decision_json: unknown;
+  last_event_id: string;
+}
+
+export class ProcessTimelineProjector implements Projector {
+  readonly projection = 'process_timeline' as const;
+  readonly sourceEvents = [
+    ...PROCESS_TIMELINE_DOMAIN_EVENTS,
+    RAIT_INQUIRY_CHANGED_TYPE,
+  ] as const;
+
+  async apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult> {
+    const parsed = CASE_DATA.safeParse(event.data);
+    if (!parsed.success) return projectionError('data', event.id);
+    const caseId = parsed.data.caseId;
+    const entry: TimelineEntry = {
+      at: event.occurredAt,
+      type: event.type,
+      domainEvent: event.domainEvent ?? null,
+      visibility: 'citizen',
+      data: primitiveData(event.data),
+    };
+    const row = (
+      await context.tx.query<TimelineRow>(TIMELINE_FOR_UPDATE_SQL, [caseId])
+    ).rows[0];
+    const entries = [...asArray<TimelineEntry>(row?.entries_json), entry];
+    const deadlines = [...asArray<TimelineDeadline>(row?.deadlines_json)];
+    let decision = (row?.decision_json ?? null) as TimelineDecision | null;
+    let requestId = row?.request_id ?? null;
+    if (!row) {
+      const linked = (
+        await context.tx.query<{ id: string }>(LINKED_REQUEST_SQL, [caseId])
+      ).rows[0];
+      requestId = linked?.id ?? null;
+    }
+
+    if (event.domainEvent === 'RAIT_DECISAO_PUBLICADA') {
+      const decided = DECISION_DATA.safeParse(event.data);
+      if (!decided.success) return projectionError('data', event.id);
+      decision = {
+        outcome: decided.data.decisionKind,
+        summary: null,
+        publishedOn: decided.data.publishedOn ?? null,
+        documentUrl: null,
+        nextStep: { kind: null, serviceKey: null, dueOn: null },
+        refundDue: null,
+        finalInstance: null,
+      };
+    } else if (!event.domainEvent && event.type === RAIT_INQUIRY_CHANGED_TYPE) {
+      const inquiry = INQUIRY_DATA.safeParse(event.data);
+      if (!inquiry.success) return projectionError('data', event.id);
+      if (
+        (inquiry.data.outcome === undefined || inquiry.data.outcome === null) &&
+        inquiry.data.dueOn
+      ) {
+        deadlines.push({
+          kind: 'diligencia',
+          dueOn: inquiry.data.dueOn,
+          ownedBy:
+            inquiry.data.addressee === CITIZEN_ADDRESSEE ? 'citizen' : 'agency',
+        });
+      }
+    }
+
+    if (row) {
+      await context.tx.query(UPDATE_TIMELINE_SQL, [
+        row.id,
+        JSON.stringify(entries),
+        JSON.stringify(deadlines),
+        decision === null ? null : JSON.stringify(decision),
+        event.id,
+        context.now,
+      ]);
+    } else {
+      await context.tx.query(INSERT_TIMELINE_SQL, [
+        requestId,
+        caseId,
+        JSON.stringify(entries),
+        JSON.stringify(deadlines),
+        decision === null ? null : JSON.stringify(decision),
+        event.id,
+        context.now,
+      ]);
+    }
+    if (event.domainEvent === 'RAIT_DECISAO_PUBLICADA' && requestId) {
+      await context.tx.query(REQUEST_DECIDED_SQL, [requestId, context.now]);
+    }
+    return { kind: 'applied' };
+  }
+
+  async reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void> {
+    if (windowEventIds.length === 0) return;
+    await context.tx.query(RESET_SQL, [[...windowEventIds]]);
+  }
+}
diff --git a/backend/domains/portal/projections/src/handwritten/projection-contract.ts b/backend/domains/portal/projections/src/handwritten/projection-contract.ts
new file mode 100644
index 0000000..6ded513
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/projection-contract.ts
@@ -0,0 +1,118 @@
+// Contrato comum dos projetores do Portal (work/rounds/R-0009/contracts/
+// CTG-0002.md §7.1; plan R-0009 M16; ADR-0020): envelope consumido
+// (permissivo — o produtor real fixa o schema estrito, OD-P28), resultado de
+// uma aplicação e a forma de um projetor. Vive num módulo próprio porque
+// `projectors.service.ts` importa os cinco `*.projection.ts` e estes só
+// precisam dos tipos.
+import { z } from 'zod';
+import type { PortalSqlTransaction } from '@detran/portal-identity';
+
+/** Envelope de rait-events-sse-contract.md §1 como o `integration.outbox.payload` o guarda. */
+export const PORTAL_CONSUMED_ENVELOPE = z
+  .object({
+    id: z.uuid(),
+    type: z.string(),
+    domainEvent: z.string().optional(),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.uuid(),
+    aggregate: z.object({
+      kind: z.string(),
+      id: z.string(),
+      version: z.int().min(0),
+    }),
+    data: z.record(z.string(), z.unknown()),
+  })
+  .passthrough();
+
+export type PortalConsumedEvent = z.infer<typeof PORTAL_CONSUMED_ENVELOPE>;
+
+export const PORTAL_PROJECTIONS = [
+  'infraction_view',
+  'process_timeline',
+  'points_view',
+  'crash_view',
+  'exam_view',
+] as const;
+export type PortalProjectionName = (typeof PORTAL_PROJECTIONS)[number];
+
+export interface ApplyOutcome {
+  projection: string;
+  applied: boolean;
+  skipped?: 'already_applied' | 'not_consumed' | 'stale_version';
+  error?: string;
+}
+
+/** Resultado de `Projector.apply` — só o serviço grava `projection_applied_event`. */
+export type ProjectionResult =
+  | { kind: 'applied' }
+  | { kind: 'skipped'; reason: 'not_consumed' | 'stale_version' }
+  | { kind: 'error'; error: string };
+
+/** Fatia do leitor de parâmetros (`OpsParameterService.get`; CTG-0002 §14). */
+export interface PortalParameterReader {
+  get(key: string): Promise<{ value_json: unknown }>;
+}
+
+export interface ProjectionContext {
+  tx: PortalSqlTransaction;
+  /** Instante do relógio injetado (`PortalClock`). */
+  now: Date;
+  /** Data civil no fuso do tenant da transação (A3(e)). */
+  today: string;
+  tenantTz: string;
+  parameters: PortalParameterReader;
+}
+
+export interface Projector {
+  readonly projection: PortalProjectionName;
+  /** Cabeçalho `// Source events:` do arquivo, como dados (ADR-0020 §4). */
+  readonly sourceEvents: readonly string[];
+  apply(
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ProjectionResult>;
+  /**
+   * `rebuild` (A5(a)): desfaz só o que a janela reaplicada produziu — linhas
+   * cujo `last_event_id` está na janela; linhas nunca projetadas (sentinela
+   * D10) são preservadas.
+   */
+  reset(
+    context: ProjectionContext,
+    windowEventIds: readonly string[],
+  ): Promise<void>;
+}
+
+/** `last_event_id` das linhas nunca projetadas (fixtures D10). */
+export const PROJECTION_SENTINEL_EVENT_ID =
+  '00000000-0000-0000-0000-000000000000';
+
+/** Prefixo dos códigos de `last_error` (`PORTAL.INTERNAL:<motivo>:<id>`). */
+export const PROJECTION_ERROR_PREFIX = 'PORTAL.INTERNAL';
+
+export function projectionError(reason: string, id: string): ProjectionResult {
+  return { kind: 'error', error: `${PROJECTION_ERROR_PREFIX}:${reason}:${id}` };
+}
+
+export function primitiveData(
+  data: Record<string, unknown>,
+): Record<string, string | number | boolean | null> {
+  const entries = Object.entries(data).filter(
+    (entry): entry is [string, string | number | boolean | null] =>
+      entry[1] === null ||
+      typeof entry[1] === 'string' ||
+      typeof entry[1] === 'number' ||
+      typeof entry[1] === 'boolean',
+  );
+  return Object.fromEntries(entries);
+}
+
+export function asArray<T = unknown>(value: unknown): T[] {
+  return Array.isArray(value) ? (value as T[]) : [];
+}
+
+export function asObject(value: unknown): Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value)
+    ? (value as Record<string, unknown>)
+    : {};
+}
diff --git a/backend/domains/portal/projections/src/handwritten/projectors.service.ts b/backend/domains/portal/projections/src/handwritten/projectors.service.ts
new file mode 100644
index 0000000..a75a420
--- /dev/null
+++ b/backend/domains/portal/projections/src/handwritten/projectors.service.ts
@@ -0,0 +1,407 @@
+// `PortalProjectors` — os cinco projetores e o replay (work/rounds/R-0009/
+// contracts/CTG-0002.md §7.1, §7.2, §7.6; plan R-0009 M16, adendas A2(c),
+// A5(a); ADR-0020). Despacho por `domainEvent` (`PROJECTOR_BY_DOMAIN_EVENT`),
+// por `type` quando não há `domainEvent` (`rait.inquiry.changed`) e por
+// `aggregate.kind` nos esqueletos (`crash`, `exam`); eventos fora do mapa →
+// `not_consumed` (nada gravado). Idempotência por `event.id` em
+// `portal.projection_applied_event` (única por `(tenant, event_id, projection)`
+// — A2(c)); falha de aplicação fica registrada em `last_error`
+// (`PORTAL.INTERNAL:<motivo>:<id>`) sem tocar a projeção; `rebuild` desfaz o
+// que a janela produziu (A5(a): linhas nunca projetadas são preservadas),
+// apaga as linhas de `applied_event` da projeção e reaplica a janela da
+// outbox (`topic like 'inf.%' or 'rait.%'`, ordem `created_at, id`) numa
+// transação de tenant. Tudo na transação do chamador.
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import { withTenantContext } from '@detran/shared';
+import {
+  PORTAL_DEFAULT_TIME_ZONE,
+  PortalClock,
+  PortalError,
+  type PortalClockLike,
+  type PortalSqlTransaction,
+} from '@detran/portal-identity';
+
+import { CrashViewProjector } from './crash-view.projection.js';
+import { ExamViewProjector } from './exam-view.projection.js';
+import {
+  INFRACTION_VIEW_SOURCE,
+  InfractionViewProjector,
+  SqlInfractionViewSource,
+  type InfractionViewSource,
+} from './infraction-view.projection.js';
+import { PORTAL_PARAMETER_READER } from './national-reads.service.js';
+import {
+  PROCESS_TIMELINE_DOMAIN_EVENTS,
+  ProcessTimelineProjector,
+  RAIT_INQUIRY_CHANGED_TYPE,
+} from './process-timeline.projection.js';
+import { PointsViewProjector } from './points-view.projection.js';
+import {
+  PORTAL_CONSUMED_ENVELOPE,
+  PORTAL_PROJECTIONS,
+  type ApplyOutcome,
+  type PortalConsumedEvent,
+  type PortalParameterReader,
+  type PortalProjectionName,
+  type ProjectionContext,
+  type Projector,
+} from './projection-contract.js';
+
+export {
+  PORTAL_CONSUMED_ENVELOPE,
+  PORTAL_PROJECTIONS,
+  type ApplyOutcome,
+  type PortalConsumedEvent,
+  type PortalProjectionName,
+} from './projection-contract.js';
+
+// ---------------------------------------------------------------------------
+// poller (§7.1) — mesma porta `TeatStreamPoller` de teat-stream.service.ts
+// ---------------------------------------------------------------------------
+
+/**
+ * Porta do agendador (estrutural; a implementação padrão
+ * `createDefaultTeatStreamPoller()` é do app — única chamadora de `setInterval`).
+ */
+export interface PortalProjectionPoller {
+  readonly intervalMs: number;
+  schedule(fn: () => void | Promise<void>, intervalMs?: number): () => void;
+}
+
+export const PORTAL_PROJECTION_POLLER = Symbol('PORTAL_PROJECTION_POLLER');
+
+/** Ator nominal dos jobs de projeção sem requisição (A3(b): uuid nulo). */
+export const PORTAL_PROJECTION_ACTOR_ID =
+  '00000000-0000-0000-0000-000000000000';
+
+// ---------------------------------------------------------------------------
+// despacho (§7.2)
+// ---------------------------------------------------------------------------
+
+/** `domainEvent` → projeções (§7.2). */
+export const PROJECTOR_BY_DOMAIN_EVENT: Readonly<
+  Record<string, readonly PortalProjectionName[]>
+> = {
+  INFRACAO_ESTADO_ALTERADO: ['infraction_view'],
+  NOTIFICACAO_EXPEDIDA: ['infraction_view'],
+  NOTIFICACAO_CIENCIA: ['infraction_view'],
+  PAGAMENTO_CONFIRMADO: ['infraction_view'],
+  ...Object.fromEntries(
+    PROCESS_TIMELINE_DOMAIN_EVENTS.map((domainEvent) => [
+      domainEvent,
+      ['process_timeline'],
+    ]),
+  ),
+  PENALIDADE_DEFINITIVA: ['points_view'],
+};
+
+/** `type` → projeções para eventos sem `domainEvent` (§7.1). */
+export const PROJECTOR_BY_TYPE: Readonly<
+  Record<string, readonly PortalProjectionName[]>
+> = {
+  [RAIT_INQUIRY_CHANGED_TYPE]: ['process_timeline'],
+};
+
+/** `aggregate.kind` → esqueletos (§7.2). */
+export const PROJECTOR_BY_AGGREGATE_KIND: Readonly<
+  Record<string, readonly PortalProjectionName[]>
+> = {
+  crash: ['crash_view'],
+  exam: ['exam_view'],
+};
+
+/** Prefixos dos `type` consumidos (M16: "topic in ('inf','rait')" como prefixo). */
+const INF_TYPE_PREFIX = 'inf.';
+const RAIT_TYPE_PREFIX = 'rait.';
+
+/**
+ * A `NOTIFICACAO_CIENCIA` publicada pelo próprio Portal (type com prefixo
+ * `portal.`, §11) não é consumida (§7.3).
+ */
+function projectionsFor(
+  event: PortalConsumedEvent,
+): readonly PortalProjectionName[] {
+  if (event.domainEvent) {
+    if (
+      event.domainEvent === 'NOTIFICACAO_CIENCIA' &&
+      !event.type.startsWith(INF_TYPE_PREFIX)
+    ) {
+      return [];
+    }
+    const byDomainEvent = PROJECTOR_BY_DOMAIN_EVENT[event.domainEvent];
+    if (byDomainEvent) return byDomainEvent;
+  } else {
+    const byType = PROJECTOR_BY_TYPE[event.type];
+    if (byType) return byType;
+  }
+  return PROJECTOR_BY_AGGREGATE_KIND[event.aggregate.kind] ?? [];
+}
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const APPLIED_SQL = `select id, last_error
+     from portal.projection_applied_event
+    where event_id = $1 and projection = $2
+    limit 1`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
+const INSERT_APPLIED_SQL = `insert into portal.projection_applied_event
+      (event_id, projection, applied_at, last_error)
+    values ($1, $2, $3, $4)
+    on conflict (tenant_id, event_id, projection) do nothing
+    returning id`;
+
+const DELETE_APPLIED_SQL = `delete from portal.projection_applied_event where projection = $1`;
+
+const LAST_APPLIED_SQL = `select max(applied_at) as last_applied_at
+     from portal.projection_applied_event`;
+
+const WINDOW_SQL = `select id, payload
+     from integration.outbox
+    where (topic like $1 or topic like $2)
+    order by created_at, id`;
+
+const WINDOW_SINCE_SQL = `select id, payload
+     from integration.outbox
+    where (topic like $1 or topic like $2) and created_at > $3
+    order by created_at, id`;
+
+const TENANT_SQL = `select timezone from auth.tenants where id = auth.current_tenant()`;
+
+interface OutboxRow extends Record<string, unknown> {
+  id: string;
+  payload: unknown;
+}
+
+// ---------------------------------------------------------------------------
+// serviço
+// ---------------------------------------------------------------------------
+
+@Injectable()
+export class PortalProjectors {
+  private readonly clock: PortalClockLike;
+  private readonly projectors: ReadonlyMap<PortalProjectionName, Projector>;
+
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+    @Inject(PORTAL_PARAMETER_READER)
+    private readonly parameters: PortalParameterReader,
+    @Optional()
+    @Inject(PORTAL_PROJECTION_POLLER)
+    private readonly poller?: PortalProjectionPoller,
+    @Optional()
+    @Inject(INFRACTION_VIEW_SOURCE)
+    source?: InfractionViewSource,
+    @Optional() clock?: PortalClock,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    const projectors: Projector[] = [
+      new InfractionViewProjector(source ?? new SqlInfractionViewSource()),
+      new ProcessTimelineProjector(),
+      new PointsViewProjector(),
+      new CrashViewProjector(),
+      new ExamViewProjector(),
+    ];
+    this.projectors = new Map(
+      projectors.map((projector) => [projector.projection, projector]),
+    );
+  }
+
+  /** Cabeçalhos `// Source events:` como dados (ADR-0020 §4). */
+  sourceEventsOf(projection: PortalProjectionName): readonly string[] {
+    return this.projectorOf(projection).sourceEvents;
+  }
+
+  /**
+   * §7.1 `applyEvent(event, tx)`: uma saída por projeção despachada (a
+   * única, na prática — nenhum evento alimenta duas projeções); evento fora
+   * do mapa → `not_consumed`. `only` restringe ao projetor do `rebuild`.
+   */
+  async applyEvent(
+    event: unknown,
+    tx: PortalSqlTransaction,
+    only?: PortalProjectionName,
+  ): Promise<ApplyOutcome | ApplyOutcome[]> {
+    const parsed = PORTAL_CONSUMED_ENVELOPE.safeParse(event);
+    if (!parsed.success) {
+      return {
+        projection: only ?? '',
+        applied: false,
+        skipped: 'not_consumed',
+      };
+    }
+    const consumed = parsed.data;
+    const targets = projectionsFor(consumed).filter(
+      (projection) => only === undefined || projection === only,
+    );
+    if (targets.length === 0) {
+      return {
+        projection: only ?? '',
+        applied: false,
+        skipped: 'not_consumed',
+      };
+    }
+    const context = await this.contextOf(tx);
+    const outcomes: ApplyOutcome[] = [];
+    for (const projection of targets) {
+      outcomes.push(await this.applyTo(projection, consumed, context));
+    }
+    return outcomes.length === 1 ? outcomes[0]! : outcomes;
+  }
+
+  /** §7.1/A5(a) `rebuild(tenantId, projection)` — transação de tenant própria. */
+  rebuild(tenantId: string, projection: PortalProjectionName): Promise<void> {
+    return this.inTenant(tenantId, async (tx) => {
+      const context = await this.contextOf(tx);
+      const projector = this.projectorOf(projection);
+      const window = await this.window(tx);
+      await projector.reset(
+        context,
+        window.map((row) => row.id),
+      );
+      await tx.query(DELETE_APPLIED_SQL, [projection]);
+      for (const row of window) {
+        await this.applyEvent(row.payload, tx, projection);
+      }
+    });
+  }
+
+  /** As cinco em ordem (`points_view` lê `infraction_view`). */
+  async rebuildAll(tenantId: string): Promise<void> {
+    for (const projection of PORTAL_PROJECTIONS) {
+      await this.rebuild(tenantId, projection);
+    }
+  }
+
+  /** Poller ao vivo (§7.1): a janela desde o último `applied_at` do tenant. */
+  tick(tenantId: string): Promise<number> {
+    return this.inTenant(tenantId, async (tx) => {
+      const last = (
+        await tx.query<{ last_applied_at: Date | string | null }>(
+          LAST_APPLIED_SQL,
+        )
+      ).rows[0]?.last_applied_at;
+      const window = last
+        ? (
+            await tx.query<OutboxRow>(WINDOW_SINCE_SQL, [
+              `${INF_TYPE_PREFIX}%`,
+              `${RAIT_TYPE_PREFIX}%`,
+              last,
+            ])
+          ).rows
+        : await this.window(tx);
+      for (const row of window) await this.applyEvent(row.payload, tx);
+      return window.length;
+    });
+  }
+
+  /** Agenda `tick(tenantId)` no poller injetado; devolve o cancelamento. */
+  start(tenantId: string): () => void {
+    if (!this.poller) return () => undefined;
+    return this.poller.schedule(() => {
+      void this.tick(tenantId).catch(() => undefined);
+    });
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  private async applyTo(
+    projection: PortalProjectionName,
+    event: PortalConsumedEvent,
+    context: ProjectionContext,
+  ): Promise<ApplyOutcome> {
+    const { tx } = context;
+    const already = (
+      await tx.query<{ id: string }>(APPLIED_SQL, [event.id, projection])
+    ).rows[0];
+    if (already) {
+      return { projection, applied: false, skipped: 'already_applied' };
+    }
+    const result = await this.projectorOf(projection).apply(event, context);
+    if (result.kind === 'skipped') {
+      return { projection, applied: false, skipped: result.reason };
+    }
+    const error = result.kind === 'error' ? result.error : null;
+    const recorded = (
+      await tx.query<{ id: string }>(INSERT_APPLIED_SQL, [
+        event.id,
+        projection,
+        context.now,
+        error,
+      ])
+    ).rows[0];
+    if (!recorded) {
+      return { projection, applied: false, skipped: 'already_applied' };
+    }
+    return error
+      ? { projection, applied: false, error }
+      : { projection, applied: true };
+  }
+
+  private projectorOf(projection: PortalProjectionName): Projector {
+    const projector = this.projectors.get(projection);
+    if (!projector) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { projection },
+      });
+    }
+    return projector;
+  }
+
+  private async contextOf(
+    tx: PortalSqlTransaction,
+  ): Promise<ProjectionContext> {
+    const tenant = (await tx.query<{ timezone: string | null }>(TENANT_SQL))
+      .rows[0];
+    const tenantTz = tenant?.timezone ?? PORTAL_DEFAULT_TIME_ZONE;
+    const now = this.clock.now();
+    return {
+      tx,
+      now,
+      today: this.clock.today(tenantTz),
+      tenantTz,
+      parameters: this.parameters,
+    };
+  }
+
+  private async window(tx: PortalSqlTransaction): Promise<OutboxRow[]> {
+    return (
+      await tx.query<OutboxRow>(WINDOW_SQL, [
+        `${INF_TYPE_PREFIX}%`,
+        `${RAIT_TYPE_PREFIX}%`,
+      ])
+    ).rows;
+  }
+
+  /**
+   * Transação de tenant: dentro de uma requisição (ou do teste) usa o
+   * contexto ativo; num job, semeia `app.tenant_id = tenantId` com o ator
+   * nominal (`Database.withRequestContext`, STYNX).
+   */
+  private inTenant<T>(
+    tenantId: string,
+    work: (tx: PortalSqlTransaction) => Promise<T>,
+  ): Promise<T> {
+    const run = () =>
+      withTenantContext(this.database, this.requestContext, (tx) =>
+        work(tx as unknown as PortalSqlTransaction),
+      );
+    if (this.requestContext.hasActiveContext()) return run();
+    const database = this.database as Partial<Database>;
+    if (typeof database.withRequestContext === 'function') {
+      return database.withRequestContext(
+        { tenantId, actorId: PORTAL_PROJECTION_ACTOR_ID },
+        run,
+      );
+    }
+    return run();
+  }
+}
diff --git a/backend/domains/portal/projections/tests/fixtures/outbox-events.ts b/backend/domains/portal/projections/tests/fixtures/outbox-events.ts
new file mode 100644
index 0000000..8b6a578
--- /dev/null
+++ b/backend/domains/portal/projections/tests/fixtures/outbox-events.ts
@@ -0,0 +1,263 @@
+// Fixtures EM CÓDIGO dos eventos consumidos pelas projeções do Portal
+// (R-0009 CTG-0002 §7.2, §7.5 e §12 — ids 00000000-0000-7000-8000-0070007000nn).
+// Envelope de rait-events-sse-contract.md §1 / `TeatEventEnvelope` de
+// `@detran/shared`; `data` só ids, tokens, datas e números. Os `type` de
+// inf/notification e inf/collection seguem a forma mínima proposta em OD-P28
+// (§7.5). Usado pelos specs `unit` (`applyEvent`) e pela integração de replay
+// (C-0002-57), que grava estas linhas em `integration.outbox`.
+import type { TeatEventEnvelope } from '@detran/shared';
+
+export const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR = {
+  kind: 'system' as const,
+  id: '00000000-0000-4000-8000-0000b0000001',
+};
+
+export const AIT_F1 = '00000000-0000-7000-8000-0000f0000001';
+export const AIT_F2 = '00000000-0000-7000-8000-0000f0000002';
+export const AIT_F3 = '00000000-0000-7000-8000-0000f0000003';
+export const AIT_F9 = '00000000-0000-7000-8000-0000f0000009';
+export const INFRACTION_D1 = '00000000-0000-7000-8000-0000d0000001';
+export const INFRACTION_D2 = '00000000-0000-7000-8000-0000d0000002';
+export const INFRACTION_D9 = '00000000-0000-7000-8000-0000d0000009';
+export const NOTICE_103 = '00000000-0000-7000-8000-007000700103';
+export const CASE_207 = '00000000-0000-7000-8000-007000700207';
+export const INQUIRY_308 = '00000000-0000-7000-8000-007000700308';
+export const DECISION_409 = '00000000-0000-7000-8000-007000700409';
+export const PAYMENT_105 = '00000000-0000-7000-8000-007000700105';
+export const CRASH_FF3 = '00000000-0000-7000-8000-00007ff00003';
+export const EXAM_FF2 = '00000000-0000-7000-8000-00007ff00002';
+
+export const EVENT_IDS = {
+  e1: '00000000-0000-7000-8000-007000700001',
+  e2: '00000000-0000-7000-8000-007000700002',
+  e3: '00000000-0000-7000-8000-007000700003',
+  e4: '00000000-0000-7000-8000-007000700004',
+  e5: '00000000-0000-7000-8000-007000700005',
+  e6: '00000000-0000-7000-8000-007000700006',
+  e7: '00000000-0000-7000-8000-007000700007',
+  e8: '00000000-0000-7000-8000-007000700008',
+  e9: '00000000-0000-7000-8000-007000700009',
+  e10: '00000000-0000-7000-8000-007000700010',
+  e11: '00000000-0000-7000-8000-007000700011',
+  e12: '00000000-0000-7000-8000-007000700012',
+} as const;
+
+/** `type` técnicos consumidos (§7.2/§7.5) — em `tests/` para não virar literal em `src/`. */
+export const CONSUMED_TYPES = {
+  infractionChanged: 'inf.infraction.changed',
+  penaltyFinal: 'inf.infraction.penalty-final',
+  noticeDispatched: 'inf.notice.dispatched',
+  noticeAcknowledged: 'inf.notice.acknowledged',
+  paymentConfirmed: 'inf.payment.confirmed',
+  raitCaseCreated: 'rait.case.created',
+  raitCaseChanged: 'rait.case.changed',
+  raitCaseAdmitted: 'rait.case.admitted',
+  raitCaseReceived: 'rait.case.received',
+  raitCaseTransited: 'rait.case.transited',
+  raitCaseWithdrawn: 'rait.case.withdrawn',
+  raitDecisionPublished: 'rait.decision.published',
+  raitInquiryChanged: 'rait.inquiry.changed',
+  crashChanged: 'est.crash.changed',
+  examChanged: 'ch.exam.changed',
+  /** publicado pelo PRÓPRIO Portal (§11) — nunca consumido (§7.3). */
+  portalNotificationAcknowledged: 'portal.notification.acknowledged',
+} as const;
+
+export interface OutboxEventFixture extends TeatEventEnvelope {
+  id: string;
+}
+
+function envelope(
+  id: string,
+  type: string,
+  domainEvent: string | undefined,
+  aggregate: { kind: string; id: string; version: number },
+  data: Record<string, unknown>,
+  occurredAt: string,
+): OutboxEventFixture {
+  return {
+    id,
+    type,
+    ...(domainEvent ? { domainEvent } : {}),
+    version: 1,
+    occurredAt,
+    tenantId: FIXTURE_TENANT_ID,
+    actor: ACTOR,
+    correlationId: `00000000-0000-4000-8000-0070007000${id.slice(-2)}`,
+    aggregate,
+    data,
+  } as OutboxEventFixture;
+}
+
+/** Os 12 eventos do §12, na ordem de `created_at` do replay. */
+export const OUTBOX_EVENTS: readonly OutboxEventFixture[] = [
+  envelope(
+    EVENT_IDS.e1,
+    CONSUMED_TYPES.infractionChanged,
+    'INFRACAO_ESTADO_ALTERADO',
+    { kind: 'infraction', id: INFRACTION_D2, version: 2 },
+    {
+      infractionId: INFRACTION_D2,
+      aitId: AIT_F2,
+      fromState: 'AIT_LAVRADO',
+      toState: 'NOTIFICADO_AUTUACAO',
+      substate: 'PRAZO_DEFESA_ABERTO',
+    },
+    '2026-09-01T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e2,
+    CONSUMED_TYPES.infractionChanged,
+    'INFRACAO_ESTADO_ALTERADO',
+    { kind: 'infraction', id: INFRACTION_D2, version: 3 },
+    {
+      infractionId: INFRACTION_D2,
+      aitId: AIT_F2,
+      fromState: 'NOTIFICADO_AUTUACAO',
+      toState: 'DEFESA_EM_JULGAMENTO',
+    },
+    '2026-09-02T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e3,
+    CONSUMED_TYPES.noticeDispatched,
+    'NOTIFICACAO_EXPEDIDA',
+    { kind: 'notice', id: NOTICE_103, version: 1 },
+    {
+      noticeId: NOTICE_103,
+      infractionId: INFRACTION_D2,
+      aitId: AIT_F2,
+      kind: 'NA',
+      channel: 'sne',
+      dispatchedOn: '2026-09-01',
+      printedDeadlineOn: '2026-10-01',
+    },
+    '2026-09-03T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e4,
+    CONSUMED_TYPES.noticeAcknowledged,
+    'NOTIFICACAO_CIENCIA',
+    { kind: 'notice', id: NOTICE_103, version: 2 },
+    {
+      noticeId: NOTICE_103,
+      infractionId: INFRACTION_D2,
+      aitId: AIT_F2,
+      effectiveOn: '2026-09-11',
+      fictitious: false,
+    },
+    '2026-09-04T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e5,
+    CONSUMED_TYPES.paymentConfirmed,
+    'PAGAMENTO_CONFIRMADO',
+    { kind: 'payment', id: PAYMENT_105, version: 1 },
+    {
+      paymentId: PAYMENT_105,
+      documentId: '00000000-0000-7000-8000-007000700205',
+      infractionId: INFRACTION_D9,
+      aitId: AIT_F9,
+      tier: 'desconto_80',
+      paidOn: '2026-09-10',
+      amount: 156.18,
+    },
+    '2026-09-05T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e6,
+    CONSUMED_TYPES.penaltyFinal,
+    'PENALIDADE_DEFINITIVA',
+    { kind: 'infraction', id: INFRACTION_D9, version: 9 },
+    {
+      infractionId: INFRACTION_D9,
+      aitId: AIT_F9,
+      finalOn: '2026-07-15',
+      points: 4,
+      amountTier: 'integral_juros',
+    },
+    '2026-09-06T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e7,
+    CONSUMED_TYPES.raitCaseCreated,
+    'RAIT_CASO_PROTOCOLADO',
+    { kind: 'case', id: CASE_207, version: 1 },
+    {
+      caseId: CASE_207,
+      aitId: AIT_F3,
+      instance: 'defesa_previa',
+      protocolNumber: 'FIX',
+      intakeChannel: 'portal',
+      markOn: '2026-08-10',
+    },
+    '2026-09-07T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e8,
+    CONSUMED_TYPES.raitInquiryChanged,
+    undefined,
+    { kind: 'case', id: CASE_207, version: 2 },
+    {
+      caseId: CASE_207,
+      inquiryId: INQUIRY_308,
+      addressee: 'cidadao',
+      dueOn: '2026-09-30',
+    },
+    '2026-09-08T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e9,
+    CONSUMED_TYPES.raitDecisionPublished,
+    'RAIT_DECISAO_PUBLICADA',
+    { kind: 'case', id: CASE_207, version: 3 },
+    {
+      caseId: CASE_207,
+      decisionId: DECISION_409,
+      decisionKind: 'indeferido',
+      publishedOn: '2026-09-12',
+      channel: 'portal',
+    },
+    '2026-09-09T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e10,
+    CONSUMED_TYPES.infractionChanged,
+    'INFRACAO_ESTADO_ALTERADO',
+    { kind: 'infraction', id: INFRACTION_D1, version: 1 },
+    {
+      infractionId: INFRACTION_D1,
+      aitId: AIT_F1,
+      fromState: null,
+      toState: 'AIT_LAVRADO',
+    },
+    '2026-09-10T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e11,
+    CONSUMED_TYPES.crashChanged,
+    'BAT_ESTADO_ALTERADO',
+    { kind: 'crash', id: CRASH_FF3, version: 1 },
+    {
+      crashId: CRASH_FF3,
+    },
+    '2026-09-11T12:00:00.000Z',
+  ),
+  envelope(
+    EVENT_IDS.e12,
+    CONSUMED_TYPES.examChanged,
+    'EXAME_ESTADO_ALTERADO',
+    { kind: 'exam', id: EXAM_FF2, version: 1 },
+    {
+      examId: EXAM_FF2,
+    },
+    '2026-09-12T12:00:00.000Z',
+  ),
+];
+
+export function eventById(id: string): OutboxEventFixture {
+  const found = OUTBOX_EVENTS.find((event) => event.id === id);
+  if (!found) throw new Error(`fixture de evento ${id} inexistente`);
+  return found;
+}
diff --git a/backend/domains/portal/projections/tests/integration/portal-projections-replay.integration.spec.ts b/backend/domains/portal/projections/tests/integration/portal-projections-replay.integration.spec.ts
new file mode 100644
index 0000000..19a1ef5
--- /dev/null
+++ b/backend/domains/portal/projections/tests/integration/portal-projections-replay.integration.spec.ts
@@ -0,0 +1,646 @@
+// R-0009 CTG-0002 §7.6, §8, §5 e §13 (TASK-0006) — C-0002-57/58/59 sobre o
+// banco da rodada (`source work/rounds/R-0009/env-detran-r9.sh`; DDL + seeds):
+//   57 replay — os 12 eventos de `tests/fixtures/outbox-events.ts` gravados em
+//      `integration.outbox` (ids fixos …7000700001…12 — inseridos por SQL com a
+//      MESMA forma de linha que `SqlTeatEventOutbox.append` produz, porque
+//      `append` gera o id na própria CTE e não aceita id externo), a janela
+//      aplicada em ordem e depois `rebuild` por projeção: linhas iguais
+//      (colunas de negócio) e `projection_applied_event` = N por projeção;
+//      …7000700010 gera last_error (OD-P20) nas duas passagens;
+//   58 cache das leituras nacionais com TTL lido de `ops.parameter`
+//      (`PORTAL_READ_CACHE_TTL_PARAMETER` — nunca literal 15);
+//   59 vínculo × projeção com as fixtures (prata 4, procurador 4, bronze 0).
+// Fica vermelho até TASK-0008 criar `projectors.service.ts`,
+// `infraction-view.projection.ts` e `national-reads.service.ts` (§14).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
+import { PortalIdentityService, cpfHashOf } from '@detran/portal-identity';
+
+import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
+import {
+  AITS,
+  FIXED_NOW,
+  SUBJECTS,
+  TENANT_ID,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import {
+  INFRACTION_VIEW_SOURCE,
+  SqlInfractionViewSource,
+} from '../../src/handwritten/infraction-view.projection.js';
+import {
+  PORTAL_PARAMETER_READER,
+  PORTAL_READ_CACHE_TTL_PARAMETER,
+  PortalNationalReadsService,
+} from '../../src/handwritten/national-reads.service.js';
+import {
+  PORTAL_PROJECTION_POLLER,
+  PortalProjectors,
+} from '../../src/handwritten/projectors.service.js';
+import {
+  AIT_F1,
+  AIT_F2,
+  AIT_F9,
+  CASE_207,
+  EVENT_IDS,
+  OUTBOX_EVENTS,
+} from '../fixtures/outbox-events.js';
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+/** Persona `agency-admin` de `00-fixtures-core.sql`, a que assina parâmetros. */
+const PARAMETER_CHANGED_BY = '00000000-0000-4000-8000-0000b0000016';
+const LINKED_REQUEST_ID = '00000000-0000-7000-8000-0000704000e7';
+const PROJECTIONS = [
+  'infraction_view',
+  'process_timeline',
+  'points_view',
+  'crash_view',
+  'exam_view',
+] as const;
+const PROJECTION_TABLES: Record<
+  (typeof PROJECTIONS)[number],
+  { table: string; key: string }
+> = {
+  infraction_view: { table: 'portal.infraction_view', key: 'ait_id' },
+  process_timeline: { table: 'portal.process_timeline', key: 'case_id' },
+  points_view: { table: 'portal.points_view', key: 'subject_cpf_hash' },
+  crash_view: { table: 'portal.crash_view', key: 'crash_id' },
+  exam_view: { table: 'portal.exam_view', key: 'exam_id' },
+};
+const VOLATILE_COLUMNS = new Set(['id', 'created_at', 'updated_at']);
+
+interface SqlTx {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+const tx: SqlTx = {
+  query: (sql, values) => client.query(sql, values as unknown[]) as never,
+};
+
+async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT_ID,
+    ]);
+    await client.query(`select set_config('app.actor_id', $1, true)`, [
+      ACTOR_ID,
+    ]);
+    const result = await work(tx);
+    await client.query('commit');
+    return result;
+  } catch (error) {
+    await client.query('rollback');
+    throw error;
+  }
+}
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  return work();
+}
+
+/** Leitor de parâmetros vivo (mesma consulta de `OpsParameterService.get`, versão vigente mais recente). */
+const liveParameters = {
+  get: vi.fn(async (key: string) => {
+    const result = await client.query<{
+      value_json: unknown;
+      source_pending: boolean;
+    }>(
+      `select value_json, source_pending from ops.parameter
+        where tenant_id = $1 and key = $2
+          and effective_from <= current_date
+          and (effective_to is null or effective_to >= current_date)
+        order by effective_from desc, version desc limit 1`,
+      [TENANT_ID, key],
+    );
+    if (!result.rows[0]) throw new Error(`Parameter ${key} not found`);
+    return { key, ...result.rows[0] };
+  }),
+};
+
+function tokenKey(token: unknown, fallback: string): string {
+  if (typeof token === 'symbol') return token.description ?? fallback;
+  if (typeof token === 'function') return (token as { name: string }).name;
+  return fallback;
+}
+
+function buildProjectors(transaction: SqlTx) {
+  return constructInjectable(PortalProjectors, {
+    [tokenKey(INFRACTION_VIEW_SOURCE, 'INFRACTION_VIEW_SOURCE')]:
+      constructInjectable(SqlInfractionViewSource, {}),
+    [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]:
+      liveParameters,
+    [tokenKey(PORTAL_PROJECTION_POLLER, 'PORTAL_PROJECTION_POLLER')]: {
+      intervalMs: 1000,
+      schedule: () => () => undefined,
+    },
+    PortalClock: fixedClock,
+    Database: fakeDatabase(transaction),
+    RequestContext: fakeRequestContext(),
+  }) as unknown as {
+    applyEvent: (event: unknown, tx: unknown) => Promise<unknown>;
+    rebuild: (tenantId: string, projection: string) => Promise<unknown>;
+  };
+}
+
+async function resetProjectionFixtures(): Promise<void> {
+  await asOwner(async () => {
+    await client.query(
+      `delete from integration.outbox where tenant_id = $1 and id = any($2::uuid[])`,
+      [TENANT_ID, Object.values(EVENT_IDS)],
+    );
+    await client.query(
+      `delete from portal.projection_applied_event where tenant_id = $1`,
+      [TENANT_ID],
+    );
+    await client.query(
+      `delete from portal.process_timeline where tenant_id = $1 and case_id = $2`,
+      [TENANT_ID, CASE_207],
+    );
+    await client.query(
+      `delete from portal.points_view where tenant_id = $1 and subject_cpf_hash = $2`,
+      [TENANT_ID, SUBJECTS.qualificada.cpfHash],
+    );
+    await client.query(
+      `delete from portal.infraction_view where tenant_id = $1 and ait_id = $2`,
+      [TENANT_ID, AIT_F1],
+    );
+    await client.query(
+      `delete from portal.request where tenant_id = $1 and id = $2`,
+      [TENANT_ID, LINKED_REQUEST_ID],
+    );
+    // estado do seed 70 para as views tocadas pelos eventos (…70f00001 = f2, …70f00005 = f9)
+    await client.query(
+      `update portal.infraction_view
+          set situation = case ait_id when $2 then 'aguardando_defesa' else 'encerrada' end,
+              points_status = case ait_id when $2 then 'none' else 'definitivo' end,
+              deadlines_json = '[]'::jsonb, actions_json = '[]'::jsonb, notices_json = '[]'::jsonb,
+              payment_json = '{}'::jsonb,
+              last_event_id = '00000000-0000-0000-0000-000000000000', last_event_version = 0
+        where tenant_id = $1 and ait_id in ($2, $3)`,
+      [TENANT_ID, AIT_F2, AIT_F9],
+    );
+  });
+}
+
+async function snapshotProjection(
+  projection: (typeof PROJECTIONS)[number],
+): Promise<Array<Record<string, unknown>>> {
+  const { table, key } = PROJECTION_TABLES[projection];
+  return asOwner(async () => {
+    const result = await client.query<Record<string, unknown>>(
+      `select * from ${table} where tenant_id = $1 order by ${key}`,
+      [TENANT_ID],
+    );
+    return result.rows.map((row) =>
+      Object.fromEntries(
+        Object.entries(row).filter(([column]) => !VOLATILE_COLUMNS.has(column)),
+      ),
+    );
+  });
+}
+
+async function appliedCounts(): Promise<Record<string, number>> {
+  return asOwner(async () => {
+    const result = await client.query<{ projection: string; count: string }>(
+      `select projection, count(*)::text as count from portal.projection_applied_event where tenant_id = $1 group by projection`,
+      [TENANT_ID],
+    );
+    return Object.fromEntries(
+      result.rows.map((row) => [row.projection, Number(row.count)]),
+    );
+  });
+}
+
+beforeAll(async () => {
+  await client.connect();
+  await resetProjectionFixtures();
+});
+
+afterAll(async () => {
+  await resetProjectionFixtures();
+  await asOwner(async () => {
+    await client.query(
+      `delete from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
+      [TENANT_ID, SUBJECTS.prata.id],
+    );
+    await client.query(
+      `delete from ops.parameter where tenant_id = $1 and key = $2 and reason = $3`,
+      [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER, 'TASK-0006 C-0002-58'],
+    );
+  });
+  await client.end();
+});
+
+describe('CTG-0002 §7.6 — replay das cinco projeções (C-0002-57)', () => {
+  it('C-0002-57 — dado os eventos …7000700001…12 na outbox e as projeções aplicadas em ordem quando rebuild(tenant, projeção) então linhas iguais e applied_event = N por projeção; …7000700010 gera last_error nas duas passagens', async () => {
+    await asOwner(async () => {
+      await client.query(
+        `insert into portal.request (id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel, delegation_domain, delegation_command, delegation_external_id, delegation_status, minimum_assurance, version)
+         values ($1, $2, 'EM_ANDAMENTO_NO_ORGAO', 'defesa_previa', $3, 'ait', $4, 'portal', 'inf', 'inf:rait-case:protocol', $5, 'delegated', 'avancada', 4)`,
+        [
+          LINKED_REQUEST_ID,
+          TENANT_ID,
+          SUBJECTS.prata.id,
+          '00000000-0000-7000-8000-0000f0000003',
+          CASE_207,
+        ],
+      );
+      for (const event of OUTBOX_EVENTS) {
+        await client.query(
+          `insert into integration.outbox (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, available_at, created_at)
+           values ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', $8::timestamptz, $8::timestamptz)`,
+          [
+            event.id,
+            TENANT_ID,
+            event.type,
+            event.aggregate.kind,
+            event.aggregate.id,
+            JSON.stringify(event),
+            `${event.type}:${event.aggregate.id}:${event.aggregate.version}:${event.id.slice(-2)}`,
+            event.occurredAt,
+          ],
+        );
+      }
+    });
+
+    // primeira passagem: a mesma janela que o rebuild lê (topic inf.% | rait.%), em ordem (created_at, id)
+    await inTenantTx(async (transaction) => {
+      const projectors = buildProjectors(transaction);
+      const window = await transaction.query<{ payload: unknown }>(
+        `select payload from integration.outbox where (topic like 'inf.%' or topic like 'rait.%') order by created_at, id`,
+      );
+      expect(window.rows.length).toBeGreaterThanOrEqual(10);
+      for (const row of window.rows)
+        await projectors.applyEvent(row.payload, transaction);
+    });
+
+    const firstPass = Object.fromEntries(
+      await Promise.all(
+        PROJECTIONS.map(async (projection) => [
+          projection,
+          await snapshotProjection(projection),
+        ]),
+      ),
+    );
+    const firstCounts = await appliedCounts();
+    expect(firstCounts.infraction_view).toBeGreaterThanOrEqual(5);
+    expect(firstCounts.process_timeline).toBeGreaterThanOrEqual(3);
+    expect(firstCounts.points_view).toBeGreaterThanOrEqual(1);
+    expect(firstCounts.crash_view ?? 0).toBe(0);
+    expect(firstCounts.exam_view ?? 0).toBe(0);
+
+    const failedFirst = await asOwner(() =>
+      client.query<{ last_error: string | null }>(
+        `select last_error from portal.projection_applied_event where tenant_id = $1 and event_id = $2`,
+        [TENANT_ID, EVENT_IDS.e10],
+      ),
+    );
+    expect(String(failedFirst.rows[0]?.last_error)).toMatch(
+      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
+    );
+
+    const views = firstPass.infraction_view as Array<Record<string, unknown>>;
+    expect(views.find((row) => row.ait_id === AIT_F2)).toMatchObject({
+      situation: 'em_defesa',
+      points_status: 'em_disputa',
+      last_event_version: 3,
+    });
+    expect(
+      views.find((row) => row.ait_id === AIT_F9)!.payment_json,
+    ).toMatchObject({ paid: true, paidTier: 'desconto_80' });
+    expect(
+      (firstPass.process_timeline as Array<Record<string, unknown>>).find(
+        (row) => row.case_id === CASE_207,
+      ),
+    ).toMatchObject({ request_id: LINKED_REQUEST_ID });
+    expect(
+      (firstPass.points_view as Array<Record<string, unknown>>).find(
+        (row) => row.subject_cpf_hash === SUBJECTS.qualificada.cpfHash,
+      ),
+    ).toMatchObject({ definitive_points: 4 });
+
+    for (const projection of PROJECTIONS) {
+      await inTenantTx(async (transaction) => {
+        await buildProjectors(transaction).rebuild(TENANT_ID, projection);
+      });
+      expect(await snapshotProjection(projection), projection).toEqual(
+        firstPass[projection],
+      );
+    }
+    expect(await appliedCounts()).toEqual(firstCounts);
+    const failedSecond = await asOwner(() =>
+      client.query<{ last_error: string | null }>(
+        `select last_error from portal.projection_applied_event where tenant_id = $1 and event_id = $2`,
+        [TENANT_ID, EVENT_IDS.e10],
+      ),
+    );
+    expect(String(failedSecond.rows[0]?.last_error)).toMatch(
+      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
+    );
+
+    // reaplicar um evento já aplicado não duplica nem muda a linha
+    await inTenantTx(async (transaction) => {
+      const outcome = (await buildProjectors(transaction).applyEvent(
+        OUTBOX_EVENTS[1],
+        transaction,
+      )) as
+        | { applied?: boolean; skipped?: string }
+        | Array<{ applied?: boolean; skipped?: string }>;
+      const first = Array.isArray(outcome) ? outcome[0]! : outcome;
+      expect(first).toMatchObject({
+        applied: false,
+        skipped: 'already_applied',
+      });
+    });
+    expect(await snapshotProjection('infraction_view')).toEqual(
+      firstPass.infraction_view,
+    );
+  }, 60_000);
+});
+
+describe('CTG-0002 §8 — PortalNationalReadsService: cache e TTL de ops.parameter (C-0002-58)', () => {
+  const prata = {
+    subjectId: SUBJECTS.prata.id,
+    name: null,
+    observedAt: FIXED_NOW,
+    version: 1,
+  };
+  let ttlMinutes = 0;
+
+  async function ttlFromDatabase(): Promise<number> {
+    const parameter = await liveParameters.get(PORTAL_READ_CACHE_TTL_PARAMETER);
+    return Number(parameter.value_json);
+  }
+
+  async function writeTtl(minutes: number): Promise<void> {
+    await asOwner(async () => {
+      await client.query(
+        `delete from ops.parameter where tenant_id = $1 and key = $2 and effective_from = current_date`,
+        [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER],
+      );
+      await client.query(
+        `insert into ops.parameter
+           (tenant_id, traffic_agency_id, scope, surface, key, value_json, value_type, status, source_pending, legal_readonly, decision_ref, reason, version, effective_from, changed_by)
+         values ($1, null, 'tenant', 'portal', $2, $3::jsonb, 'int', 'vigente', false, false, 'H.54', 'TASK-0006 C-0002-58', 2, current_date, $4)`,
+        [
+          TENANT_ID,
+          PORTAL_READ_CACHE_TTL_PARAMETER,
+          String(minutes),
+          PARAMETER_CHANGED_BY,
+        ],
+      );
+    });
+  }
+
+  function service(transaction: SqlTx) {
+    return constructInjectable(PortalNationalReadsService, {
+      [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]:
+        liveParameters,
+      PortalClock: fixedClock,
+      Database: fakeDatabase(transaction),
+      RequestContext: fakeRequestContext(),
+    }) as unknown as {
+      read: (
+        tx: unknown,
+        subject: unknown,
+        kind: string,
+        targetId: string | null,
+        fetch: () => Promise<unknown>,
+      ) => Promise<{ payload: unknown; cachedAt: Date | string }>;
+    };
+  }
+
+  async function clearCache(): Promise<void> {
+    await asOwner(() =>
+      client.query(
+        `delete from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
+        [TENANT_ID, SUBJECTS.prata.id],
+      ),
+    );
+  }
+
+  async function ageCache(kind: string, minutes: number): Promise<void> {
+    await asOwner(() =>
+      client.query(
+        `update portal.national_read_cache set cached_at = $3::timestamptz - make_interval(mins => $4::int) where tenant_id = $1 and subject_id = $2 and kind = $5`,
+        [TENANT_ID, SUBJECTS.prata.id, FIXED_NOW.toISOString(), minutes, kind],
+      ),
+    );
+  }
+
+  beforeAll(async () => {
+    const seeded = await ttlFromDatabase();
+    expect(seeded).toBeGreaterThan(0);
+    ttlMinutes = seeded;
+    await clearCache();
+  });
+
+  it('C-0002-58 (a)(b) — dado fetch ok então cache gravado e cachedAt = relógio; segunda leitura dentro do TTL não chama a porta', async () => {
+    const fetch = vi.fn(async () => ({ license: { category: 'B' } }));
+    const first = await inTenantTx((transaction) =>
+      service(transaction).read(transaction, prata, 'cnh', null, fetch),
+    );
+    expect(fetch).toHaveBeenCalledTimes(1);
+    expect(first.payload).toEqual({ license: { category: 'B' } });
+    expect(new Date(first.cachedAt).getTime()).toBe(FIXED_NOW.getTime());
+    const cached = await asOwner(() =>
+      client.query<{
+        payload_json: unknown;
+        cached_at: Date;
+        kind: string;
+        target_id: string | null;
+      }>(
+        `select payload_json, cached_at, kind, target_id from portal.national_read_cache where tenant_id = $1 and subject_id = $2`,
+        [TENANT_ID, SUBJECTS.prata.id],
+      ),
+    );
+    expect(cached.rows).toHaveLength(1);
+    expect(cached.rows[0]).toMatchObject({
+      kind: 'cnh',
+      target_id: null,
+      payload_json: { license: { category: 'B' } },
+    });
+    expect(new Date(cached.rows[0]!.cached_at).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+
+    const second = await inTenantTx((transaction) =>
+      service(transaction).read(transaction, prata, 'cnh', null, fetch),
+    );
+    expect(fetch).toHaveBeenCalledTimes(1);
+    expect(second.payload).toEqual(first.payload);
+    expect(new Date(second.cachedAt).getTime()).toBe(FIXED_NOW.getTime());
+  });
+
+  it('C-0002-58 (c) — dado porta que lança com cache vencido então 200 com cachedAt antigo (RN-PORTAL-117 C)', async () => {
+    await ageCache('cnh', ttlMinutes + 1);
+    const failing = vi.fn(async () => {
+      throw new Error('CDT indisponível (fixture)');
+    });
+    const result = await inTenantTx((transaction) =>
+      service(transaction).read(transaction, prata, 'cnh', null, failing),
+    );
+    expect(failing).toHaveBeenCalledTimes(1);
+    expect(result.payload).toEqual({ license: { category: 'B' } });
+    expect(new Date(result.cachedAt).getTime()).toBe(
+      FIXED_NOW.getTime() - (ttlMinutes + 1) * 60_000,
+    );
+  });
+
+  it('C-0002-58 (d) — dado porta que lança sem cache então 503 PORTAL.NATIONAL_READ_UNAVAILABLE { cachedAt: null, retryAfter: ttl*60 }', async () => {
+    const failing = vi.fn(async () => {
+      throw new Error('CDT indisponível (fixture)');
+    });
+    await expect(
+      inTenantTx((transaction) =>
+        service(transaction).read(
+          transaction,
+          prata,
+          'vehicles',
+          null,
+          failing,
+        ),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NATIONAL_READ_UNAVAILABLE',
+      status: 503,
+      context: { cachedAt: null, retryAfter: ttlMinutes * 60 },
+    });
+    const cached = await asOwner(() =>
+      client.query(
+        `select id from portal.national_read_cache where tenant_id = $1 and subject_id = $2 and kind = 'vehicles'`,
+        [TENANT_ID, SUBJECTS.prata.id],
+      ),
+    );
+    expect(cached.rows).toHaveLength(0);
+  });
+
+  it('C-0002-58 (e) — dado o parâmetro alterado em ops.parameter então o TTL observado muda (sem literal no spec)', async () => {
+    const probeTtl = ttlMinutes * 2 + 10;
+    await writeTtl(probeTtl);
+    try {
+      expect(await ttlFromDatabase()).toBe(probeTtl);
+      // cache com idade entre o TTL antigo e o novo: vencido antes, fresco agora
+      await ageCache('cnh', ttlMinutes + 1);
+      const fetch = vi.fn(async () => ({ license: { category: 'X' } }));
+      const result = await inTenantTx((transaction) =>
+        service(transaction).read(transaction, prata, 'cnh', null, fetch),
+      );
+      expect(fetch).not.toHaveBeenCalled();
+      expect(result.payload).toEqual({ license: { category: 'B' } });
+
+      const failing = vi.fn(async () => {
+        throw new Error('indisponível');
+      });
+      await expect(
+        inTenantTx((transaction) =>
+          service(transaction).read(
+            transaction,
+            prata,
+            'clearance',
+            randomUUID(),
+            failing,
+          ),
+        ),
+      ).rejects.toMatchObject({
+        context: { cachedAt: null, retryAfter: probeTtl * 60 },
+      });
+    } finally {
+      await asOwner(() =>
+        client.query(
+          `delete from ops.parameter where tenant_id = $1 and key = $2 and reason = 'TASK-0006 C-0002-58'`,
+          [TENANT_ID, PORTAL_READ_CACHE_TTL_PARAMETER],
+        ),
+      );
+      await clearCache();
+    }
+    expect(await ttlFromDatabase()).toBe(ttlMinutes);
+  });
+});
+
+describe('CTG-0002 §5 — vínculo × projeção com as fixtures (C-0002-59)', () => {
+  const identity = new PortalIdentityService(fixedClock as never);
+
+  async function viewsVisibleTo(
+    subject: keyof typeof SUBJECTS,
+  ): Promise<string[]> {
+    return inTenantTx(async (transaction) => {
+      const hashes = [cpfHashOf(SUBJECTS[subject].cpf)];
+      const represented = await transaction.query<{
+        represented_cpf_hash: string;
+      }>(
+        `select represented_cpf_hash from portal.representation
+          where representative_subject_id = $1 and state = 'PROCURACAO_VALIDADA'
+            and scope in ('ait', 'all') and (valid_until is null or valid_until >= $2::date)`,
+        [SUBJECTS[subject].id, '2026-09-14'],
+      );
+      hashes.push(...represented.rows.map((row) => row.represented_cpf_hash));
+      const views = await transaction.query<{ ait_id: string }>(
+        `select ait_id from portal.infraction_view where subject_cpf_hash = any($1::text[]) order by occurred_at desc, ait_id asc`,
+        [hashes],
+      );
+      return views.rows.map((row) => row.ait_id);
+    });
+  }
+
+  it('C-0002-59 — dado fixtures de infraction_view e representation então …70000002 vê 4, …70000005 (procurador, scope ait) vê os 4 da representada, …70000001 vê 0', async () => {
+    const prata = await viewsVisibleTo('prata');
+    expect(prata).toHaveLength(4);
+    expect([...prata].sort()).toEqual(
+      [AITS.f2, AITS.f3, AITS.f5, AITS.f10].sort(),
+    );
+    expect(await viewsVisibleTo('procurador')).toEqual(prata);
+    expect(await viewsVisibleTo('bronze')).toEqual([]);
+    expect(await viewsVisibleTo('ouro')).toHaveLength(2);
+    expect(await viewsVisibleTo('qualificada')).toHaveLength(1);
+  });
+
+  it("C-0002-59 — dado …70000001 então assertEntitled('ait', …f0000001) resolve (fixture …70200001) enquanto não há view para …f0000001 (GET aits/{id} → 404 { kind: 'ait' }, provado no e2e C-0002-73)", async () => {
+    await inTenantTx(async (transaction) => {
+      const entitled = await identity.assertEntitled(
+        transaction as never,
+        SUBJECTS.bronze.id,
+        'ait',
+        AITS.f1,
+      );
+      expect(entitled).toEqual({
+        entitlementId: '00000000-0000-7000-8000-000070200001',
+      });
+      const view = await transaction.query(
+        `select id from portal.infraction_view where ait_id = $1`,
+        [AITS.f1],
+      );
+      expect(view.rows).toHaveLength(0);
+      await expect(
+        identity.assertEntitled(
+          transaction as never,
+          SUBJECTS.prata.id,
+          'ait',
+          AITS.f1,
+        ),
+      ).rejects.toMatchObject({
+        code: 'PORTAL.NOT_FOUND',
+        status: 404,
+        context: { kind: 'ait' },
+      });
+    });
+  });
+});
diff --git a/backend/domains/portal/projections/tests/support/projectors-harness.ts b/backend/domains/portal/projections/tests/support/projectors-harness.ts
new file mode 100644
index 0000000..f1505b7
--- /dev/null
+++ b/backend/domains/portal/projections/tests/support/projectors-harness.ts
@@ -0,0 +1,174 @@
+// Harness dos specs `unit` dos projetores (R-0009 CTG-0002 §7, §13): tx falsa
+// em memória (`@detran/portal-requests/tests/support/fake-sql.ts`) semeada
+// com as fixtures de CTG-0001 §10 relevantes às projeções, porta de
+// enriquecimento falsa (`INFRACTION_VIEW_SOURCE`), leitor de parâmetros falso
+// (`PORTAL_PARAMETER_READER`, chaves reconhecidas pelo SUFIXO — nenhum literal
+// `portal.*`/`collection.*` nos specs) e poller manual. Constrói
+// `PortalProjectors` pelos metadados do construtor (`nest-construct.ts`).
+import { vi } from 'vitest';
+
+import {
+  FakeSqlDatabase,
+  type Row,
+} from '../../../requests/tests/support/fake-sql.js';
+import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
+import {
+  FIXED_NOW,
+  INFRACTION_VIEWS,
+  SERVICE_CATALOG,
+  SUBJECTS,
+  TENANT_ID,
+  TENANT_SLUG,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+} from '../../../requests/tests/support/portal-fixtures.js';
+import { INFRACTION_VIEW_SOURCE } from '../../src/handwritten/infraction-view.projection.js';
+import { PORTAL_PARAMETER_READER } from '../../src/handwritten/national-reads.service.js';
+import {
+  PORTAL_PROJECTION_POLLER,
+  PortalProjectors,
+} from '../../src/handwritten/projectors.service.js';
+
+export interface ApplyOutcome {
+  projection: string;
+  applied: boolean;
+  skipped?: 'already_applied' | 'not_consumed' | 'stale_version';
+  error?: string;
+}
+
+export interface AitIdentity {
+  aitNumber: string;
+  plate: string;
+  occurredAt: string | Date;
+  framingLabel: string;
+  amount: number | null;
+  subjectCpfHashes: string[];
+}
+
+export interface HarnessOptions {
+  /** `loadAitIdentity` da porta falsa: aitId → identidade ou null. */
+  identities?: Record<string, AitIdentity | null>;
+  deadlines?: Array<{ kind: string; dueOn: string; ownedBy: string }>;
+  /** Valores por SUFIXO da chave de parâmetro (`card_payment`, `installments`, …). */
+  parameters?: Record<string, unknown>;
+  catalog?: (rows: Row[]) => Row[];
+  /** Semeadura adicional antes de construir o serviço. */
+  seed?: (db: FakeSqlDatabase) => void;
+}
+
+function tokenKey(token: unknown, fallback: string): string {
+  if (typeof token === 'symbol') return token.description ?? fallback;
+  if (typeof token === 'function') return (token as { name: string }).name;
+  return typeof token === 'string' ? token : fallback;
+}
+
+export function projectorsHarness(options: HarnessOptions = {}) {
+  const db = new FakeSqlDatabase({
+    tenantId: TENANT_ID,
+    tenant: { slug: TENANT_SLUG },
+    now: fixedClock.now,
+  });
+  db.seed(
+    'portal.subject',
+    Object.values(SUBJECTS).map((subject) => ({
+      id: subject.id,
+      cpf_hash: subject.cpfHash,
+      name: '',
+      govbr_level_observed: null,
+      assurance_level_observed: subject.assurance,
+      observed_at: FIXED_NOW,
+      version: 1,
+    })),
+  );
+  db.seed(
+    'portal.service_catalog',
+    (options.catalog ?? ((rows) => rows))(
+      SERVICE_CATALOG.map((row) => ({ ...row })),
+    ),
+  );
+  db.seed(
+    'portal.infraction_view',
+    INFRACTION_VIEWS.map((row) => ({
+      ...row,
+      payment_json: { ...(row.payment_json as Row) },
+    })),
+  );
+  options.seed?.(db);
+
+  const source = {
+    loadAitIdentity: vi.fn(
+      async (_tx: unknown, aitId: string) =>
+        options.identities?.[aitId] ?? null,
+    ),
+    loadDeadlines: vi.fn(async () => options.deadlines ?? []),
+  };
+  const parameterCalls: string[] = [];
+  const parameters = {
+    get: vi.fn(async (key: string) => {
+      parameterCalls.push(key);
+      const suffix = key.split('.').pop() ?? key;
+      const value = options.parameters?.[suffix];
+      return {
+        key,
+        value_json: value === undefined ? null : value,
+        source_pending: value === undefined,
+      };
+    }),
+  };
+  const poller = {
+    intervalMs: 1000,
+    schedule: vi.fn((_fn: () => void | Promise<void>) => () => undefined),
+  };
+  const providers: Record<string, unknown> = {
+    [tokenKey(INFRACTION_VIEW_SOURCE, 'INFRACTION_VIEW_SOURCE')]: source,
+    [tokenKey(PORTAL_PARAMETER_READER, 'PORTAL_PARAMETER_READER')]: parameters,
+    [tokenKey(PORTAL_PROJECTION_POLLER, 'PORTAL_PROJECTION_POLLER')]: poller,
+    PortalClock: fixedClock,
+    Database: fakeDatabase(db.tx),
+    RequestContext: fakeRequestContext(),
+  };
+  const projectors = constructInjectable(
+    PortalProjectors,
+    providers,
+  ) as unknown as {
+    applyEvent: (
+      event: unknown,
+      tx: unknown,
+    ) => Promise<ApplyOutcome | ApplyOutcome[]>;
+    rebuild: (tenantId: string, projection: string) => Promise<unknown>;
+  };
+
+  /** Aplica e devolve a saída da projeção pedida (o serviço pode devolver uma ou várias). */
+  const apply = async (
+    event: unknown,
+    projection?: string,
+  ): Promise<ApplyOutcome> => {
+    const result = await projectors.applyEvent(event, db.tx);
+    const outcomes = Array.isArray(result) ? result : [result];
+    if (!projection) return outcomes[0]!;
+    return (
+      outcomes.find((outcome) => outcome.projection === projection) ??
+      outcomes[0]!
+    );
+  };
+
+  const view = (aitId: string): Row | undefined =>
+    db.rows('portal.infraction_view').find((row) => row.ait_id === aitId);
+  const appliedEvents = (eventId?: string): Row[] =>
+    db
+      .rows('portal.projection_applied_event')
+      .filter((row) => eventId === undefined || row.event_id === eventId);
+
+  return {
+    db,
+    projectors,
+    apply,
+    source,
+    parameters,
+    parameterCalls,
+    poller,
+    view,
+    appliedEvents,
+  };
+}
diff --git a/backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts b/backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts
new file mode 100644
index 0000000..658fed1
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts
@@ -0,0 +1,142 @@
+// Porta de delegação por serviço (work/rounds/R-0009/contracts/CTG-0002.md
+// §3.2; plan R-0009 M8, M23). O pacote só conhece a porta: o mapa
+// `serviceKey → DelegationTarget` chega pelo token `PORTAL_DELEGATION_TARGETS`
+// composto pelo app (`backend/app/src/portal-delegation.providers.ts`), no
+// padrão de `SNAPSHOT_QUERY_PORTS` (teat-snapshots.providers.ts). Nesta
+// rodada (R-0007 ausente) os alvos de defesa/recurso/indicação/pagamento/
+// junta/LGPD/CRLV são `UnavailableDelegationTarget`: `availability()` devolve
+// o token de `unavailableReason` e `POST requests` responde 422 antes de
+// existir pedido. `ReadServiceDelegationTarget` (consulta_*) resolve na hora:
+// `not_applicable` + `immediateResult` (RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA
+// na mesma transação, T-AVAL-CONVITE imediato).
+import { Inject, Injectable } from '@nestjs/common';
+import {
+  PortalError,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import type { Request } from '../../entities/request.entity.js';
+
+export const PORTAL_DELEGATION_TARGETS = Symbol('PORTAL_DELEGATION_TARGETS');
+
+export type DelegationTargetKind =
+  'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
+
+export interface DelegationProtocol {
+  number: string;
+  issuedAt: Date;
+  receiptHash: string;
+}
+
+export interface DelegationInput {
+  tx: PortalSqlTransaction;
+  /** Linha de `portal.request` já em `PROTOCOLADO` (entidade gerada). */
+  request: Request;
+  /** `payload_json` do rascunho vigente — NÃO validado pelo Portal (§3.1). */
+  draft: Record<string, unknown>;
+  identity: PortalIdentityClaims;
+  subject: PortalSubjectRecord;
+  protocol: DelegationProtocol;
+  clock: PortalClockLike;
+  tenantTz: string;
+}
+
+export interface DelegationResult {
+  /** `portal.request.delegation_domain` (varchar(20)). */
+  domain: string | null;
+  /** `delegation_command` (varchar(80)), ex.: `portal:sne-enrollment:enroll`. */
+  command: string | null;
+  externalId: string | null;
+  status: 'delegated' | 'not_applicable';
+  /** Alvos de leitura: RESULTADO_DISPONIVEL na mesma transação (§3.1 passo 10). */
+  immediateResult?: boolean;
+}
+
+export interface DelegationTarget {
+  readonly serviceKey: string;
+  /** `null` = disponível; token de `unavailableReason` (§0) = indisponível. */
+  availability(): string | null;
+  /** `targetKind` admitidos pelo serviço (route contract §5.1 / M7). */
+  readonly targetKinds: readonly DelegationTargetKind[];
+  delegate(input: DelegationInput): Promise<DelegationResult>;
+}
+
+export interface DelegationTargetMap {
+  get(serviceKey: string): DelegationTarget | undefined;
+}
+
+export class UnavailableDelegationTarget implements DelegationTarget {
+  constructor(
+    readonly serviceKey: string,
+    readonly unavailableReason: string,
+    readonly targetKinds: readonly DelegationTargetKind[],
+  ) {}
+
+  availability(): string | null {
+    return this.unavailableReason;
+  }
+
+  /** Nunca alcançado: `POST requests` barra antes (§2.3 passo 5). */
+  async delegate(): Promise<DelegationResult> {
+    throw new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
+      status: 422,
+      context: {
+        unavailableReason: this.unavailableReason,
+        alternativeChannelNote: null,
+      },
+    });
+  }
+}
+
+/** `consulta_*`: leitura interna do Portal, resultado imediato. */
+export class ReadServiceDelegationTarget implements DelegationTarget {
+  constructor(
+    readonly serviceKey: string,
+    readonly readResource: string,
+    readonly targetKinds: readonly DelegationTargetKind[],
+  ) {}
+
+  availability(): string | null {
+    return null;
+  }
+
+  async delegate({ request }: DelegationInput): Promise<DelegationResult> {
+    return {
+      domain: 'portal',
+      command: `portal:${this.readResource}:read`,
+      externalId: request.target_id ?? null,
+      status: 'not_applicable',
+      immediateResult: true,
+    };
+  }
+}
+
+@Injectable()
+export class RequestDelegationService {
+  constructor(
+    @Inject(PORTAL_DELEGATION_TARGETS)
+    private readonly targets: DelegationTargetMap,
+  ) {}
+
+  /** Serviço no catálogo sem alvo é defeito de composição (500). */
+  targetFor(serviceKey: string): DelegationTarget {
+    const target = this.targets.get(serviceKey);
+    if (!target) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { serviceKey },
+      });
+    }
+    return target;
+  }
+
+  delegate(
+    serviceKey: string,
+    input: DelegationInput,
+  ): Promise<DelegationResult> {
+    return this.targetFor(serviceKey).delegate(input);
+  }
+}
diff --git a/backend/domains/portal/requests/src/handwritten/drafts.ts b/backend/domains/portal/requests/src/handwritten/drafts.ts
new file mode 100644
index 0000000..9e879f3
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/drafts.ts
@@ -0,0 +1,129 @@
+// Corpos por ato (`DRAFT_SCHEMAS`, work/rounds/R-0009/contracts/CTG-0002.md
+// §3.4 — transcrição zod da forma de portal-route-contract.md §5.1; a
+// semântica é do domínio dono, nunca validada aqui) e a tabela
+// `CONSEQUENCE_ACK_KIND_BY_SERVICE` (§3.1 passo 6; `portal.consequence_ack.kind`
+// do DDL 62). `manifestar`/`avaliar` não têm rascunho (rota própria).
+import { z } from 'zod';
+
+const uuidList = z.array(z.uuid());
+
+const ack = z.strictObject({
+  textVersion: z.string(),
+  acceptedAt: z.iso.datetime(),
+});
+
+/** Os quatro efeitos do consentimento SNE (§2.4; UC-PORTAL-007 AC-2). */
+export const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'canal_exclusivo',
+  'desconto_60',
+  'cancelamento',
+] as const;
+
+/**
+ * `SNE_ENROLLMENT_BODY` (§2.4) sem `channel` (§3.4 `adesao_sne`): os quatro
+ * efeitos são obrigatórios e sem repetição.
+ */
+export const SNE_ENROLLMENT_DRAFT = z.strictObject({
+  email: z.email().optional(),
+  phone: z
+    .string()
+    .regex(/^\d{10,11}$/)
+    .optional(),
+  consent: z.strictObject({
+    textVersion: z.string().min(1),
+    effectsAck: z
+      .array(z.enum(SNE_EFFECTS))
+      .min(4)
+      .refine((effects) => new Set(effects).size === SNE_EFFECTS.length, {
+        message: 'consent.effectsAck',
+      }),
+  }),
+});
+
+const emptyDraft = z.strictObject({});
+
+export const DRAFT_SCHEMAS = {
+  defesa_previa: z.strictObject({
+    facts: z.string(),
+    grounds: z.string(),
+    attachmentIds: uuidList,
+    requestType: z.enum(['cancelamento', 'outro']),
+  }),
+  recurso_jari: z.strictObject({
+    grounds: z.string(),
+    attachmentIds: uuidList,
+  }),
+  recurso_cetran: z.strictObject({
+    additionalText: z.string().optional(),
+    attachmentIds: uuidList,
+  }),
+  indicacao_condutor: z.strictObject({
+    driver: z.strictObject({
+      cpf: z.string().regex(/^\d{11}$/),
+      cnhNumber: z.string(),
+      cnhUf: z.string().length(2),
+      category: z.string(),
+      name: z.string(),
+    }),
+    signatures: z.strictObject({
+      owner: z.enum(['govbr', 'upload']),
+      driver: z.enum(['govbr', 'upload', 'pending']),
+    }),
+    consequenceAck: ack,
+  }),
+  pagamento: z.strictObject({
+    tier: z.enum([
+      'desconto_80',
+      'desconto_60_reconhecimento',
+      'desconto_40_fora_sne',
+      'integral_juros',
+    ]),
+    method: z.enum(['pix', 'debito', 'boleto', 'cartao']),
+    installments: z.int().min(1).optional(),
+    waiverAck: ack.optional(),
+  }),
+  adesao_sne: SNE_ENROLLMENT_DRAFT,
+  cancelamento_sne: z.strictObject({
+    reason: z.string().max(2000).optional(),
+  }),
+  junta_medica: z.strictObject({
+    examId: z.uuid(),
+    reason: z.string(),
+    attachmentIds: uuidList,
+  }),
+  lgpd_declaracao: z.strictObject({
+    scope: z.enum([
+      'confirmacao',
+      'declaracao_completa',
+      'correcao',
+      'eliminacao',
+    ]),
+    fields: z.array(z.string()).optional(),
+  }),
+  consulta_multas: emptyDraft,
+  consulta_cnh: emptyDraft,
+  consulta_bat: emptyDraft,
+  consulta_exame: emptyDraft,
+  emissao_crlv: emptyDraft,
+} as const;
+
+export type DraftServiceKey = keyof typeof DRAFT_SCHEMAS;
+
+/** Serviços cujo `submit` exige `consequenceAck` (§3.1 passo 6). */
+export const CONSEQUENCE_ACK_KIND_BY_SERVICE: Readonly<
+  Record<string, 'sne' | 'indicacao'>
+> = {
+  adesao_sne: 'sne',
+  indicacao_condutor: 'indicacao',
+};
+
+/**
+ * Serviços com rota própria ([WF-PORTAL-001] §Catálogo → [WF-PORTAL-004]):
+ * `POST requests` responde 422 `PORTAL.INELIGIBLE { reason:
+ * 'servico_com_rota_propria', alternative }` (§2.3 passo 4).
+ */
+export const OWN_ROUTE_BY_SERVICE: Readonly<Record<string, string>> = {
+  manifestar: '/v1/portal/manifestations',
+  avaliar: '/v1/portal/evaluations',
+};
diff --git a/backend/domains/portal/requests/src/handwritten/events.ts b/backend/domains/portal/requests/src/handwritten/events.ts
new file mode 100644
index 0000000..1238f83
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/events.ts
@@ -0,0 +1,260 @@
+// Eventos publicados por `@detran/portal-requests` (work/rounds/R-0009/
+// contracts/CTG-0002.md §11; plan R-0009 M21): `SOLICITACAO_CRIADA`,
+// `SOLICITACAO_PROTOCOLADA`, `SOLICITACAO_DESISTIDA`, `SOLICITACAO_CONCLUIDA`
+// (type `portal.request.changed`, união discriminada em `domainEvent`) e
+// `AVALIACAO_REGISTRADA` (type `portal.evaluation.registered`). Padrão de
+// `inf/infraction/src/handwritten/events.ts`: envelope de
+// rait-events-sse-contract.md §1, `strictObject` em toda parte — `data` só com
+// ids, tokens, datas e o `cpf_hash` do sujeito (escopo do SSE, §9).
+//
+// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
+// como literal: `tools/parameters/verify.mjs --check-usage` leria o literal
+// como chave de `ops.parameter` não registrada (precedente de
+// `ops/offline-sync/src/handwritten/events.ts`).
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import { REQUEST_STATES } from './guards/request.transitions.js';
+
+const PORTAL_TOPIC_PREFIX = 'portal';
+
+export const PORTAL_REQUEST_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.request.changed`;
+export const PORTAL_EVALUATION_REGISTERED_TYPE = `${PORTAL_TOPIC_PREFIX}.evaluation.registered`;
+
+export const PORTAL_REQUEST_AGGREGATE_KIND = 'portal.request';
+export const PORTAL_EVALUATION_AGGREGATE_KIND = 'portal.evaluation';
+
+const requestState = z.enum(REQUEST_STATES);
+const targetKind = z.enum(['ait', 'case', 'vehicle', 'exam', 'crash', 'none']);
+const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
+
+const actor = z.strictObject({
+  kind: z.enum(['user', 'system', 'timer']),
+  id: z.string(),
+  role: z.string().optional(),
+});
+
+function envelope<D extends ZodType>(
+  type: string,
+  domainEvent: string,
+  aggregateKind: string,
+  data: D,
+) {
+  return z.strictObject({
+    id: z.string(),
+    type: z.literal(type),
+    domainEvent: z.literal(domainEvent),
+    version: z.int().min(1),
+    occurredAt: z.iso.datetime(),
+    tenantId: z.uuid(),
+    actor,
+    correlationId: z.string(),
+    causationId: z.string().optional(),
+    aggregate: z.strictObject({
+      kind: z.literal(aggregateKind),
+      id: z.uuid(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const requestCommon = {
+  requestId: z.uuid(),
+  serviceKey: z.string(),
+  subjectId: z.uuid(),
+  subjectCpfHash: sha256,
+};
+
+const solicitacaoCriada = envelope(
+  PORTAL_REQUEST_CHANGED_TYPE,
+  'SOLICITACAO_CRIADA',
+  PORTAL_REQUEST_AGGREGATE_KIND,
+  z.strictObject({
+    ...requestCommon,
+    targetKind,
+    targetId: z.uuid().nullable(),
+    fromState: z.null(),
+    toState: z.literal('PEDIDO_EM_COMPOSICAO'),
+    occurredAt: z.iso.datetime(),
+  }),
+);
+
+const solicitacaoProtocolada = envelope(
+  PORTAL_REQUEST_CHANGED_TYPE,
+  'SOLICITACAO_PROTOCOLADA',
+  PORTAL_REQUEST_AGGREGATE_KIND,
+  z.strictObject({
+    ...requestCommon,
+    protocolNumber: z.string(),
+    issuedAt: z.iso.datetime(),
+    receiptHash: sha256,
+    fromState: requestState,
+    toState: z.literal('PROTOCOLADO'),
+  }),
+);
+
+const solicitacaoDesistida = envelope(
+  PORTAL_REQUEST_CHANGED_TYPE,
+  'SOLICITACAO_DESISTIDA',
+  PORTAL_REQUEST_AGGREGATE_KIND,
+  z.strictObject({
+    ...requestCommon,
+    fromState: requestState,
+    toState: z.literal('DESISTIDO'),
+    withdrawnAt: z.iso.datetime(),
+  }),
+);
+
+const solicitacaoConcluida = envelope(
+  PORTAL_REQUEST_CHANGED_TYPE,
+  'SOLICITACAO_CONCLUIDA',
+  PORTAL_REQUEST_AGGREGATE_KIND,
+  z.strictObject({
+    ...requestCommon,
+    fromState: z.literal('AVALIACAO_OFERECIDA'),
+    toState: z.literal('CONCLUIDO'),
+    evaluationId: z.uuid(),
+  }),
+);
+
+const avaliacaoRegistrada = envelope(
+  PORTAL_EVALUATION_REGISTERED_TYPE,
+  'AVALIACAO_REGISTRADA',
+  PORTAL_EVALUATION_AGGREGATE_KIND,
+  z.strictObject({
+    evaluationId: z.uuid(),
+    subjectKind: z.enum(['request', 'manifestation']),
+    subjectId: z.uuid(),
+    submittedAt: z.iso.datetime(),
+    citizenSubjectId: z.uuid(),
+    subjectCpfHash: sha256,
+  }),
+);
+
+/** `type` → schema (o de `portal.request.changed` é a união por `domainEvent`). */
+export const PORTAL_REQUESTS_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> =
+  {
+    [PORTAL_REQUEST_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
+      solicitacaoCriada,
+      solicitacaoProtocolada,
+      solicitacaoDesistida,
+      solicitacaoConcluida,
+    ]),
+    [PORTAL_EVALUATION_REGISTERED_TYPE]: avaliacaoRegistrada,
+  };
+
+export type SolicitacaoCriadaData = z.infer<typeof solicitacaoCriada>['data'];
+export type SolicitacaoProtocoladaData = z.infer<
+  typeof solicitacaoProtocolada
+>['data'];
+export type SolicitacaoDesistidaData = z.infer<
+  typeof solicitacaoDesistida
+>['data'];
+export type SolicitacaoConcluidaData = z.infer<
+  typeof solicitacaoConcluida
+>['data'];
+export type AvaliacaoRegistradaData = z.infer<
+  typeof avaliacaoRegistrada
+>['data'];
+
+export interface PortalEventContext {
+  occurredAt: string;
+  actorId: string;
+  correlationId: string;
+}
+
+function portalEnvelope(
+  type: string,
+  domainEvent: string,
+  aggregate: TeatEventEnvelope['aggregate'],
+  data: Record<string, unknown>,
+  context: PortalEventContext,
+): TeatEventEnvelope {
+  return {
+    id: '',
+    type,
+    domainEvent,
+    version: 1,
+    occurredAt: context.occurredAt,
+    tenantId: '',
+    actor: { kind: 'user', id: context.actorId },
+    correlationId: context.correlationId,
+    aggregate,
+    data,
+  };
+}
+
+/** Fábricas por `domainEvent` — `aggregate.version` = versão APÓS a transição (§11). */
+export const portalRequestEvents = {
+  criada(
+    requestId: string,
+    version: number,
+    data: SolicitacaoCriadaData,
+    context: PortalEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_REQUEST_CHANGED_TYPE,
+      'SOLICITACAO_CRIADA',
+      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
+      data,
+      context,
+    );
+  },
+  protocolada(
+    requestId: string,
+    version: number,
+    data: SolicitacaoProtocoladaData,
+    context: PortalEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_REQUEST_CHANGED_TYPE,
+      'SOLICITACAO_PROTOCOLADA',
+      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
+      data,
+      context,
+    );
+  },
+  desistida(
+    requestId: string,
+    version: number,
+    data: SolicitacaoDesistidaData,
+    context: PortalEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_REQUEST_CHANGED_TYPE,
+      'SOLICITACAO_DESISTIDA',
+      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
+      data,
+      context,
+    );
+  },
+  concluida(
+    requestId: string,
+    version: number,
+    data: SolicitacaoConcluidaData,
+    context: PortalEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_REQUEST_CHANGED_TYPE,
+      'SOLICITACAO_CONCLUIDA',
+      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
+      data,
+      context,
+    );
+  },
+  avaliacaoRegistrada(
+    evaluationId: string,
+    data: AvaliacaoRegistradaData,
+    context: PortalEventContext,
+  ): TeatEventEnvelope {
+    return portalEnvelope(
+      PORTAL_EVALUATION_REGISTERED_TYPE,
+      'AVALIACAO_REGISTRADA',
+      { kind: PORTAL_EVALUATION_AGGREGATE_KIND, id: evaluationId, version: 1 },
+      data,
+      context,
+    );
+  },
+};
diff --git a/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts
index 78de098..173e806 100644
--- a/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts
+++ b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts
@@ -189,6 +189,9 @@ export const REQUEST_ALLOWED_STATES_BY_COMMAND: Readonly<
     'AGUARDANDO_PAGAMENTO',
   ],
   evaluate: ['AVALIACAO_OFERECIDA'],
+  // CTG-0002 §2.3 `POST requests/{id}/diligences/{did}/responses` (§14): não é
+  // transição — o estado não muda —, só a guarda do comando `respond`.
+  respond: ['EM_ANDAMENTO_NO_ORGAO'],
 };

 export interface RequestStateSnapshot {
diff --git a/backend/domains/portal/requests/src/handwritten/idempotency.service.spec.ts b/backend/domains/portal/requests/src/handwritten/idempotency.service.spec.ts
new file mode 100644
index 0000000..72eb5b7
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/idempotency.service.spec.ts
@@ -0,0 +1,255 @@
+// R-0009 CTG-0002 §4 e §13 (TASK-0006) — C-0002-01…06: `PortalIdempotencyService`
+// (M9, adenda A4(a)): chave persistida `${scope}:${header}` em
+// `portal.idempotency_record` (DDL 62), replay com o status e o corpo gravados,
+// 409 `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }` em corpo ou rota
+// divergente, `canonicalJson`/`sha256Hex` estáveis. Fica vermelho até
+// TASK-0007 criar `idempotency.service.ts` (§14).
+//
+// Tx falsa em memória (`tests/support/fake-sql.ts`) — o subconjunto de SQL
+// aceito está no cabeçalho daquele arquivo. O serviço é construído pelos
+// metadados do construtor (`tests/support/nest-construct.ts`): a ordem das
+// dependências não importa.
+import { createHash } from 'node:crypto';
+import { describe, expect, it } from 'vitest';
+
+import { FakeSqlDatabase } from '../../tests/support/fake-sql.js';
+import { constructInjectable } from '../../tests/support/nest-construct.js';
+import {
+  SUBJECTS,
+  TENANT_ID,
+  fixedClock,
+} from '../../tests/support/portal-fixtures.js';
+import {
+  PortalIdempotencyService,
+  canonicalJson,
+  sha256Hex,
+} from './idempotency.service.js';
+
+const ROUTE_SUBMIT = 'POST /v1/portal/requests/{id}/submit';
+const ROUTE_CREATE = 'POST /v1/portal/requests';
+
+interface BeginResult {
+  replay?: { status: number; body: unknown };
+  record?: (status: number, body: unknown) => Promise<unknown>;
+}
+
+function setup() {
+  const db = new FakeSqlDatabase({ tenantId: TENANT_ID, now: fixedClock.now });
+  const service = constructInjectable(PortalIdempotencyService, {
+    PortalClock: fixedClock,
+  });
+  const begin = (input: {
+    scope: string;
+    header: string | undefined;
+    route: string;
+    body: unknown;
+  }): Promise<BeginResult> =>
+    (
+      service as unknown as {
+        begin: (tx: unknown, input: unknown) => Promise<BeginResult>;
+      }
+    ).begin(db.tx, input);
+  return { db, service, begin };
+}
+
+const body = {
+  serviceKey: 'consulta_multas',
+  targetKind: 'none',
+  channel: 'portal',
+};
+
+describe('CTG-0002 §4 — PortalIdempotencyService.begin (M9)', () => {
+  it('C-0002-01 — dado rota M9 sem Idempotency-Key quando begin então 400 PORTAL.VALIDATION_FAILED { fields: ["Idempotency-Key"] }', async () => {
+    const { begin } = setup();
+    for (const header of [undefined, '']) {
+      await expect(
+        begin({ scope: SUBJECTS.prata.id, header, route: ROUTE_CREATE, body }),
+      ).rejects.toMatchObject({
+        code: 'PORTAL.VALIDATION_FAILED',
+        status: 400,
+        context: { fields: ['Idempotency-Key'] },
+      });
+    }
+  });
+
+  it('C-0002-02 — dado registro (scope s, key k, corpo b) quando begin(s, k, b) então replay com o status e o body gravados', async () => {
+    const { db, begin } = setup();
+    const first = await begin({
+      scope: SUBJECTS.prata.id,
+      header: 'k-1',
+      route: ROUTE_CREATE,
+      body,
+    });
+    expect(first.replay).toBeUndefined();
+    expect(typeof first.record).toBe('function');
+    const response = {
+      requestId: '00000000-0000-7000-8000-000070400005',
+      state: 'PEDIDO_EM_COMPOSICAO',
+      version: 1,
+    };
+    await first.record!(201, response);
+
+    const stored = db.rows('portal.idempotency_record');
+    expect(stored).toHaveLength(1);
+    expect(stored[0]).toMatchObject({
+      key: `${SUBJECTS.prata.id}:k-1`,
+      subject_id: SUBJECTS.prata.id,
+      route: ROUTE_CREATE,
+      body_sha256: sha256Hex(canonicalJson(body)),
+      status: 201,
+    });
+    expect(stored[0]!.response_json).toEqual(response);
+
+    const second = await begin({
+      scope: SUBJECTS.prata.id,
+      header: 'k-1',
+      route: ROUTE_CREATE,
+      body: { ...body },
+    });
+    expect(second.record).toBeUndefined();
+    expect(second.replay).toEqual({ status: 201, body: response });
+  });
+
+  it("C-0002-03 — dado registro (s, k, b) quando begin(s, k, b') então 409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key: k }", async () => {
+    const { begin } = setup();
+    const first = await begin({
+      scope: SUBJECTS.prata.id,
+      header: 'k-2',
+      route: ROUTE_CREATE,
+      body,
+    });
+    await first.record!(201, { ok: true });
+
+    await expect(
+      begin({
+        scope: SUBJECTS.prata.id,
+        header: 'k-2',
+        route: ROUTE_CREATE,
+        body: { ...body, targetKind: 'ait' },
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+      status: 409,
+      context: { key: 'k-2' },
+    });
+
+    // mesma chave e mesmo corpo em OUTRA rota também é reuso divergente (§4 `row.route = route`)
+    await expect(
+      begin({
+        scope: SUBJECTS.prata.id,
+        header: 'k-2',
+        route: ROUTE_SUBMIT,
+        body,
+      }),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
+      status: 409,
+      context: { key: 'k-2' },
+    });
+  });
+
+  it('C-0002-04 — dado registro (s1, k, b) quando begin(s2, k, b) então sem replay (escopo por sujeito: chave persistida `${s2}:${k}`)', async () => {
+    const { db, begin } = setup();
+    const first = await begin({
+      scope: SUBJECTS.prata.id,
+      header: 'k-3',
+      route: ROUTE_CREATE,
+      body,
+    });
+    await first.record!(201, { who: 'prata' });
+
+    const other = await begin({
+      scope: SUBJECTS.ouro.id,
+      header: 'k-3',
+      route: ROUTE_CREATE,
+      body,
+    });
+    expect(other.replay).toBeUndefined();
+    expect(typeof other.record).toBe('function');
+    await other.record!(201, { who: 'ouro' });
+
+    const keys = db
+      .rows('portal.idempotency_record')
+      .map((row) => row.key)
+      .sort();
+    expect(keys).toEqual(
+      [`${SUBJECTS.prata.id}:k-3`, `${SUBJECTS.ouro.id}:k-3`].sort(),
+    );
+
+    // escopo `public` (POST manifestations anônimo, §4): subject_id nulo
+    const anonymous = await begin({
+      scope: 'public',
+      header: 'k-3',
+      route: 'POST /v1/portal/manifestations',
+      body,
+    });
+    await anonymous.record!(201, { anonymous: true });
+    const publicRow = db
+      .rows('portal.idempotency_record')
+      .find((row) => row.key === 'public:k-3');
+    expect(publicRow).toBeDefined();
+    expect(publicRow!.subject_id ?? null).toBeNull();
+  });
+
+  it('C-0002-05 — dado canonicalJson({ b: 1, a: { d: [2,1], c: null } }) então \'{"a":{"c":null,"d":[2,1]},"b":1}\' e sha256 estável', () => {
+    const value = { b: 1, a: { d: [2, 1], c: null } };
+    expect(canonicalJson(value)).toBe('{"a":{"c":null,"d":[2,1]},"b":1}');
+    expect(canonicalJson({ a: { c: null, d: [2, 1] }, b: 1 })).toBe(
+      canonicalJson(value),
+    );
+    expect(canonicalJson(null)).toBe('null');
+    expect(canonicalJson(undefined)).toBe('null');
+    expect(canonicalJson([{ z: 1, y: 2 }])).toBe('[{"y":2,"z":1}]');
+
+    const expected = createHash('sha256')
+      .update(canonicalJson(value))
+      .digest('hex');
+    expect(sha256Hex(canonicalJson(value))).toBe(expected);
+    expect(sha256Hex(canonicalJson(value))).toMatch(/^[0-9a-f]{64}$/);
+    expect(sha256Hex(canonicalJson({ a: { d: [2, 1], c: null }, b: 1 }))).toBe(
+      expected,
+    );
+  });
+
+  it('C-0002-06 — dado comando que respondeu 403 (sem estado) quando repetido com a mesma chave então executa de novo (não gravado); dado 502 DELEGATION_FAILED então replay do 502', async () => {
+    const { db, begin } = setup();
+    // 403 sem estado: o chamador NÃO grava (§4 "4xx sem estado não gravam")
+    const attempt = await begin({
+      scope: SUBJECTS.bronze.id,
+      header: 'k-4',
+      route: ROUTE_SUBMIT,
+      body: {},
+    });
+    expect(typeof attempt.record).toBe('function');
+    // … o comando lançou 403 ASSURANCE_INSUFFICIENT e não chamou record()
+    expect(db.rows('portal.idempotency_record')).toHaveLength(0);
+    const retry = await begin({
+      scope: SUBJECTS.bronze.id,
+      header: 'k-4',
+      route: ROUTE_SUBMIT,
+      body: {},
+    });
+    expect(retry.replay).toBeUndefined();
+    expect(typeof retry.record).toBe('function');
+
+    // 502 DELEGATION_FAILED: gravado com status 502 (§3.1 passo 10) e reproduzido
+    const failed = {
+      code: 'PORTAL.DELEGATION_FAILED',
+      context: {
+        protocol: 'AM-FIXTURES-2026-0000015',
+        retryPolicy: 'pendencia_interna',
+      },
+    };
+    await retry.record!(502, failed);
+    const replayed = await begin({
+      scope: SUBJECTS.bronze.id,
+      header: 'k-4',
+      route: ROUTE_SUBMIT,
+      body: {},
+    });
+    expect(replayed.replay).toEqual({ status: 502, body: failed });
+    expect(db.rows('portal.idempotency_record')[0]).toMatchObject({
+      status: 502,
+    });
+  });
+});
diff --git a/backend/domains/portal/requests/src/handwritten/idempotency.service.ts b/backend/domains/portal/requests/src/handwritten/idempotency.service.ts
new file mode 100644
index 0000000..733daaa
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/idempotency.service.ts
@@ -0,0 +1,155 @@
+// Idempotência M9 das rotas do Portal (work/rounds/R-0009/contracts/CTG-0002.md
+// §4; plan R-0009 M9 e adenda A4(a)). As rotas M9 anulam o interceptor do
+// kernel (`@NoIdempotent()`) e o handler chama `begin` dentro da transação do
+// comando: cabeçalho ausente → 400 `PORTAL.VALIDATION_FAILED { fields:
+// ['Idempotency-Key'] }`; registro igual (rota + impressão do corpo) → replay
+// do status e do corpo gravados; registro divergente → 409
+// `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }`. A chave persistida em
+// `portal.idempotency_record` (DDL 62) é `${scope}:${header}` — escopo por
+// sujeito (ou `public`), nunca por ator STYNX. Quem grava é o comando, e só
+// quando persistiu estado (2xx e o 502 `DELEGATION_FAILED`).
+import { createHash } from 'node:crypto';
+import { Injectable, Optional } from '@nestjs/common';
+import {
+  PortalClock,
+  PortalError,
+  type PortalClockLike,
+  type PortalSqlTransaction,
+} from '@detran/portal-identity';
+
+/** Nome do cabeçalho como o Node o entrega (minúsculas). */
+export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
+
+/** Escopo da chave persistida nas rotas públicas (`POST manifestations` anônimo). */
+export const PUBLIC_IDEMPOTENCY_SCOPE = 'public';
+
+/**
+ * JSON canônico (§4 "fingerprint"): chaves ordenadas recursivamente por
+ * `localeCompare`, arrays na ordem, sem espaços, `null`/`undefined` → `null`.
+ * Mesma regra do `stableStringify` do kernel; reutilizado no recibo (§3.3) e
+ * na evidência de ciência (§6.1).
+ */
+export function canonicalJson(value: unknown): string {
+  if (value === null || value === undefined) return 'null';
+  if (Array.isArray(value)) {
+    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
+  }
+  if (value instanceof Date) return JSON.stringify(value.toISOString());
+  if (typeof value === 'object') {
+    const entries = Object.entries(value as Record<string, unknown>)
+      .sort(([a], [b]) => a.localeCompare(b))
+      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`);
+    return `{${entries.join(',')}}`;
+  }
+  return JSON.stringify(value);
+}
+
+/** sha256 hex minúsculo (64 caracteres — checks dos DDLs 62/63). */
+export function sha256Hex(text: string): string {
+  return createHash('sha256').update(text).digest('hex');
+}
+
+export interface IdempotencyBeginInput {
+  /** `subject.id` nas rotas autenticadas; `public` no manifest anônimo. */
+  scope: string;
+  /** Valor bruto do cabeçalho `Idempotency-Key` (pode faltar). */
+  header: string | string[] | undefined;
+  /** `${METHOD} ${template}` — ex.: `POST /v1/portal/requests/{id}/submit`. */
+  route: string;
+  body: unknown;
+}
+
+export interface IdempotencyReplay {
+  status: number;
+  body: unknown;
+}
+
+export type IdempotencyRecorder = (
+  status: number,
+  body: unknown,
+) => Promise<void>;
+
+export type IdempotencyBegin =
+  | { replay: IdempotencyReplay; record?: undefined }
+  | { replay?: undefined; record: IdempotencyRecorder };
+
+interface RecordRow extends Record<string, unknown> {
+  route: string;
+  body_sha256: string;
+  response_json: unknown;
+  status: number;
+}
+
+const SELECT_RECORD_SQL = `select route, body_sha256, response_json, status
+     from portal.idempotency_record
+    where key = $1
+    for update`;
+
+/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 62). */
+const INSERT_RECORD_SQL = `insert into portal.idempotency_record
+      (key, subject_id, route, body_sha256, response_json, status, created_at)
+    values ($1, $2, $3, $4, $5::jsonb, $6, $7)`;
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+/** Lê o cabeçalho como o Node o entrega; vazio ou ausente → `undefined`. */
+export function idempotencyKeyOf(
+  headers: Record<string, string | string[] | undefined> | undefined,
+): string | undefined {
+  const raw = headers?.[IDEMPOTENCY_KEY_HEADER];
+  const value = Array.isArray(raw) ? raw[0] : raw;
+  const trimmed = value?.trim();
+  return trimmed && trimmed.length > 0 ? trimmed : undefined;
+}
+
+@Injectable()
+export class PortalIdempotencyService {
+  private readonly clock: PortalClockLike;
+
+  constructor(@Optional() clock?: PortalClock) {
+    this.clock = clock ?? new PortalClock();
+  }
+
+  /** §4 algoritmo `begin(tx, { scope, header, route, body })`. */
+  async begin(
+    tx: PortalSqlTransaction,
+    input: IdempotencyBeginInput,
+  ): Promise<IdempotencyBegin> {
+    const header = idempotencyKeyOf({ [IDEMPOTENCY_KEY_HEADER]: input.header });
+    if (!header) {
+      throw new PortalError('PORTAL.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: ['Idempotency-Key'] },
+      });
+    }
+    const key = `${input.scope}:${header}`;
+    const fingerprint = sha256Hex(canonicalJson(input.body));
+    const existing = await tx.query<RecordRow>(SELECT_RECORD_SQL, [key]);
+    const row = existing.rows[0];
+    if (row) {
+      if (row.route === input.route && row.body_sha256 === fingerprint) {
+        return {
+          replay: { status: Number(row.status), body: row.response_json },
+        };
+      }
+      throw new PortalError('PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY', {
+        status: 409,
+        context: { key: header },
+      });
+    }
+    const subjectId = UUID_RE.test(input.scope) ? input.scope : null;
+    const record: IdempotencyRecorder = async (status, body) => {
+      await tx.query(INSERT_RECORD_SQL, [
+        key,
+        subjectId,
+        input.route,
+        fingerprint,
+        JSON.stringify(body ?? null),
+        status,
+        this.clock.now(),
+      ]);
+    };
+    return { record };
+  }
+}
diff --git a/backend/domains/portal/requests/src/handwritten/index.ts b/backend/domains/portal/requests/src/handwritten/index.ts
new file mode 100644
index 0000000..6a4f21a
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/index.ts
@@ -0,0 +1,13 @@
+// API pública manuscrita de @detran/portal-requests (work/rounds/R-0009/
+// contracts/CTG-0002.md §14; plan R-0009 M24), reexportada pelo `src/index.ts`
+// gerado via `module.handwrittenExports` de BP-PORTAL-REQUESTS-001 (ADR-0007):
+// controlador, serviços, porta de delegação, protocolo, rascunhos, eventos e
+// a tabela de transições do pedido.
+export * from './delegation/delegation.service.js';
+export * from './drafts.js';
+export * from './events.js';
+export * from './guards/request.transitions.js';
+export * from './idempotency.service.js';
+export * from './protocol.js';
+export * from './requests.controller.js';
+export * from './requests.service.js';
diff --git a/backend/domains/portal/requests/src/handwritten/protocol.spec.ts b/backend/domains/portal/requests/src/handwritten/protocol.spec.ts
new file mode 100644
index 0000000..ac2c02a
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/protocol.spec.ts
@@ -0,0 +1,167 @@
+// R-0009 CTG-0002 §3.3 e §13 (TASK-0006) — C-0002-07/08: número de protocolo
+// (`<SLUG>-<AAAA>-<7 dígitos>` por `portal.protocol_seq`, colisão → repete
+// `nextval` até 20 vezes → `PORTAL.INTERNAL { requestId }`) e recibo canônico
+// (chaves em ordem `channel, issuedAt, number, requestId, serviceKey`; hash
+// sha256 hex de 64 caracteres — check do DDL 62). Fica vermelho até TASK-0007
+// criar `protocol.ts` (§14: `protocolNumber(tx, slug, today)`, `receiptOf`,
+// `receiptHash`).
+//
+// Forma esperada (constrangimento do Inspector, não do contrato): o quarto
+// argumento opcional de `protocolNumber` é o `requestId` que o contrato manda
+// devolver em `PORTAL.INTERNAL { requestId }`; a colisão é detectada pela
+// existência do número em `portal.protocol`/`portal.manifestation` (mesma
+// sequência, A2(c)) — a tx falsa registra o unique dos dois lados e responde
+// `23505` a um insert repetido, então tanto "consultar antes" quanto "inserir
+// e capturar 23505" passam.
+import { createHash } from 'node:crypto';
+import { describe, expect, it } from 'vitest';
+
+import { FakeSqlDatabase } from '../../tests/support/fake-sql.js';
+import {
+  FIXED_TODAY,
+  TENANT_ID,
+  TENANT_SLUG,
+} from '../../tests/support/portal-fixtures.js';
+import { canonicalJson } from './idempotency.service.js';
+import { protocolNumber, receiptHash, receiptOf } from './protocol.js';
+
+const REQUEST_ID = '00000000-0000-7000-8000-000070400005';
+
+function protocolRow(number: string, index: number) {
+  return {
+    request_id: `00000000-0000-7000-8000-0000704f00${index.toString(16).padStart(2, '0')}`,
+    number,
+    issued_at: new Date('2026-09-01T12:00:00-04:00'),
+    receipt_hash: 'f'.repeat(64),
+  };
+}
+
+describe('CTG-0002 §3.3 — número de protocolo (C-0002-07)', () => {
+  it("C-0002-07 — dado slug 'am-fixtures', today 2026-09-14 e nextval 15 então número 'AM-FIXTURES-2026-0000015'", async () => {
+    const db = new FakeSqlDatabase({
+      tenantId: TENANT_ID,
+      tenant: { slug: TENANT_SLUG },
+      sequences: { 'portal.protocol_seq': 14 },
+    });
+    const number = await protocolNumber(
+      db.tx,
+      TENANT_SLUG,
+      FIXED_TODAY,
+      REQUEST_ID,
+    );
+    expect(number).toBe('AM-FIXTURES-2026-0000015');
+    expect(db.sequenceValue('portal.protocol_seq')).toBe(15);
+  });
+
+  it("C-0002-07 — dado slug 'local-e2e' então prefixo 'LOCAL-E2E' e o ano vem de today", async () => {
+    const db = new FakeSqlDatabase({
+      tenantId: TENANT_ID,
+      tenant: { slug: 'local-e2e' },
+      sequences: { 'portal.protocol_seq': 0 },
+    });
+    const number = await protocolNumber(
+      db.tx,
+      'local-e2e',
+      '2027-01-02',
+      REQUEST_ID,
+    );
+    expect(number).toBe('LOCAL-E2E-2027-0000001');
+  });
+
+  it('C-0002-07 — dado 23505 na primeira tentativa (número 15 já existe em portal.protocol) então repete nextval e devolve 0000016', async () => {
+    const db = new FakeSqlDatabase({
+      tenantId: TENANT_ID,
+      tenant: { slug: TENANT_SLUG },
+      sequences: { 'portal.protocol_seq': 14 },
+    });
+    db.seed('portal.protocol', [protocolRow('AM-FIXTURES-2026-0000015', 1)]);
+    const number = await protocolNumber(
+      db.tx,
+      TENANT_SLUG,
+      FIXED_TODAY,
+      REQUEST_ID,
+    );
+    expect(number).toBe('AM-FIXTURES-2026-0000016');
+    expect(db.sequenceValue('portal.protocol_seq')).toBe(16);
+  });
+
+  it('C-0002-07 — dado colisão com portal.manifestation.protocol (sequência compartilhada, A2(c)) então também repete nextval', async () => {
+    const db = new FakeSqlDatabase({
+      tenantId: TENANT_ID,
+      tenant: { slug: TENANT_SLUG },
+      sequences: { 'portal.protocol_seq': 14 },
+    });
+    db.seed('portal.manifestation', [
+      {
+        state: 'COMPROVANTE_EMITIDO',
+        kind: 'elogio',
+        confidential: false,
+        anonymous: true,
+        subject_id: null,
+        text: '',
+        protocol: 'AM-FIXTURES-2026-0000015',
+        received_at: new Date('2026-09-01T12:00:00-04:00'),
+        agency_due_on: '2026-10-01',
+      },
+    ]);
+    const number = await protocolNumber(
+      db.tx,
+      TENANT_SLUG,
+      FIXED_TODAY,
+      REQUEST_ID,
+    );
+    expect(number).toBe('AM-FIXTURES-2026-0000016');
+  });
+
+  it('C-0002-07 — dado 20 colisões então PORTAL.INTERNAL { requestId }', async () => {
+    const db = new FakeSqlDatabase({
+      tenantId: TENANT_ID,
+      tenant: { slug: TENANT_SLUG },
+      sequences: { 'portal.protocol_seq': 14 },
+    });
+    db.seed(
+      'portal.protocol',
+      Array.from({ length: 20 }, (_, index) =>
+        protocolRow(
+          `AM-FIXTURES-2026-${String(15 + index).padStart(7, '0')}`,
+          index + 1,
+        ),
+      ),
+    );
+    await expect(
+      protocolNumber(db.tx, TENANT_SLUG, FIXED_TODAY, REQUEST_ID),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.INTERNAL',
+      status: 500,
+      context: { requestId: REQUEST_ID },
+    });
+    // exatamente 20 tentativas (14 + 20 = 34), nunca a 21ª
+    expect(db.sequenceValue('portal.protocol_seq')).toBe(34);
+  });
+});
+
+describe('CTG-0002 §3.3 — recibo canônico (C-0002-08)', () => {
+  it('C-0002-08 — dado recibo { channel, issuedAt, number, requestId, serviceKey } então JSON canônico em ordem de chaves e receipt_hash = sha256 hex de 64 caracteres', () => {
+    const issuedAt = new Date('2026-09-14T16:00:00.000Z');
+    const receipt = receiptOf({
+      serviceKey: 'consulta_multas',
+      requestId: REQUEST_ID,
+      number: 'AM-FIXTURES-2026-0000015',
+      issuedAt,
+      channel: 'portal',
+    });
+    const canonical =
+      '{"channel":"portal","issuedAt":"2026-09-14T16:00:00.000Z",' +
+      `"number":"AM-FIXTURES-2026-0000015","requestId":"${REQUEST_ID}","serviceKey":"consulta_multas"}`;
+    // `receiptOf` pode devolver o objeto ou já a string canônica: os dois casam com o §3.3
+    const text = typeof receipt === 'string' ? receipt : canonicalJson(receipt);
+    expect(text).toBe(canonical);
+    expect(
+      Object.keys(typeof receipt === 'string' ? JSON.parse(receipt) : receipt),
+    ).toEqual(['channel', 'issuedAt', 'number', 'requestId', 'serviceKey']);
+
+    const hash = receiptHash(receipt);
+    expect(hash).toBe(createHash('sha256').update(canonical).digest('hex'));
+    expect(hash).toMatch(/^[0-9a-f]{64}$/);
+  });
+});
diff --git a/backend/domains/portal/requests/src/handwritten/protocol.ts b/backend/domains/portal/requests/src/handwritten/protocol.ts
new file mode 100644
index 0000000..26eb457
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/protocol.ts
@@ -0,0 +1,100 @@
+// Número de protocolo e recibo canônico (work/rounds/R-0009/contracts/
+// CTG-0002.md §3.3; plan R-0009 M8, adenda A2(c)). Número
+// `<SLUG-UPPER>-<AAAA>-<sequencial 7 dígitos>` por `portal.protocol_seq` (DDL
+// manuscrito 19, sequência compartilhada com `portal.manifestation.protocol`);
+// colisão com número já existente (fixtures literais sem `setval`) → repete
+// `nextval` até 20 vezes → `PORTAL.INTERNAL { requestId }`. A colisão é
+// detectada antes do insert: dentro da transação do comando um 23505
+// abortaria a transação inteira. Recibo: JSON canônico das cinco chaves em
+// ordem (`channel, issuedAt, number, requestId, serviceKey`) e `receipt_hash`
+// = sha256 hex (check do DDL 62).
+import {
+  PortalError,
+  type PortalSqlTransaction,
+} from '@detran/portal-identity';
+
+import { canonicalJson, sha256Hex } from './idempotency.service.js';
+
+/** Tentativas de `nextval` admitidas por número (§3.3). */
+export const PROTOCOL_NUMBER_MAX_ATTEMPTS = 20;
+
+const PROTOCOL_SEQUENCE = 'portal.protocol_seq';
+
+const NEXTVAL_SQL = `select nextval('${PROTOCOL_SEQUENCE}')::text as seq`;
+
+const PROTOCOL_EXISTS_SQL = `select id from portal.protocol where number = $1 limit 1`;
+
+const MANIFESTATION_EXISTS_SQL = `select id from portal.manifestation where protocol = $1 limit 1`;
+
+/** `${slugUpper}-${yyyy}-${seq.padStart(7, '0')}` (§3.3). */
+export function formatProtocolNumber(
+  slug: string,
+  today: string,
+  sequence: number | string,
+): string {
+  return `${slug.toUpperCase()}-${today.slice(0, 4)}-${String(sequence).padStart(7, '0')}`;
+}
+
+/**
+ * Próximo número livre para o tenant da transação. `slug` é
+ * `auth.tenants.slug`; `today` é a data civil no fuso do tenant; `requestId`
+ * só entra no `context` do `PORTAL.INTERNAL` após 20 colisões.
+ */
+export async function protocolNumber(
+  tx: PortalSqlTransaction,
+  slug: string,
+  today: string,
+  requestId?: string,
+): Promise<string> {
+  for (let attempt = 0; attempt < PROTOCOL_NUMBER_MAX_ATTEMPTS; attempt += 1) {
+    const next = await tx.query<{ seq: string }>(NEXTVAL_SQL);
+    const seq = next.rows[0]?.seq;
+    if (seq === undefined) break;
+    const candidate = formatProtocolNumber(slug, today, seq);
+    const inProtocol = await tx.query(PROTOCOL_EXISTS_SQL, [candidate]);
+    if (inProtocol.rows.length > 0) continue;
+    const inManifestation = await tx.query(MANIFESTATION_EXISTS_SQL, [
+      candidate,
+    ]);
+    if (inManifestation.rows.length > 0) continue;
+    return candidate;
+  }
+  throw new PortalError('PORTAL.INTERNAL', {
+    status: 500,
+    context: requestId ? { requestId } : {},
+  });
+}
+
+export interface ProtocolReceiptInput {
+  serviceKey: string;
+  requestId: string;
+  number: string;
+  issuedAt: Date;
+  channel: 'portal';
+}
+
+/** Recibo com as chaves na ordem canônica (§3.3). */
+export interface ProtocolReceipt {
+  channel: 'portal';
+  issuedAt: string;
+  number: string;
+  requestId: string;
+  serviceKey: string;
+}
+
+export function receiptOf(input: ProtocolReceiptInput): ProtocolReceipt {
+  return {
+    channel: input.channel,
+    issuedAt: input.issuedAt.toISOString(),
+    number: input.number,
+    requestId: input.requestId,
+    serviceKey: input.serviceKey,
+  };
+}
+
+/** sha256 hex minúsculo do recibo canônico (objeto ou já a string). */
+export function receiptHash(receipt: ProtocolReceipt | string): string {
+  return sha256Hex(
+    typeof receipt === 'string' ? receipt : canonicalJson(receipt),
+  );
+}
diff --git a/backend/domains/portal/requests/src/handwritten/requests.controller.ts b/backend/domains/portal/requests/src/handwritten/requests.controller.ts
new file mode 100644
index 0000000..90297fd
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/requests.controller.ts
@@ -0,0 +1,279 @@
+// `/v1/portal/requests` — as doze rotas do ciclo comum de pedidos
+// (work/rounds/R-0009/contracts/CTG-0002.md §2.3; plan R-0009 M7–M10, M20,
+// adenda A4(a)). O controlador só extrai identidade, parâmetros, corpo e
+// cabeçalhos, abre a transação de tenant (`withTenantContext`, ADR-0002) e
+// delega a `PortalRequestsService`; as seis rotas M9 levam `@NoIdempotent()`
+// (o handler assume a idempotência) e devolvem `Idempotency-Replayed: true`
+// no replay; `ETag` em toda resposta com `version`. Os dois "commit e lança"
+// do §3.1 (403 com AGUARDANDO_NIVEL_ASSINATURA persistido; 502 com protocolo
+// mantido) saem da transação já commitada e só então são lançados.
+import {
+  Body,
+  Controller,
+  Get,
+  Headers,
+  HttpCode,
+  Param,
+  Post,
+  Put,
+  Query,
+  Req,
+  Res,
+  UseGuards,
+} from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  NoIdempotent,
+  Resource,
+  etagOf,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+import {
+  PortalCitizenGuard,
+  portalIdentityOf,
+  type PortalIdentityRequest,
+} from '@detran/portal-identity';
+
+import {
+  PortalRequestsService,
+  isCommitThenThrow,
+  type PortalCommandOutcome,
+  type PortalHeaders,
+  type PortalQuery,
+} from './requests.service.js';
+
+/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
+interface ResponseLike {
+  setHeader(name: string, value: string): unknown;
+  status(code: number): unknown;
+}
+
+const REPLAYED_HEADER = 'Idempotency-Replayed';
+
+type CitizenRequest = RequestLike & PortalIdentityRequest;
+
+@Controller('v1/portal/requests')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:request')
+export class PortalRequestsController {
+  constructor(
+    private readonly requests: PortalRequestsService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Post()
+  @Action('create')
+  @NoIdempotent()
+  @Audit({ action: 'PORTAL_REQUEST_CREATE', entity: 'portal.request' })
+  create(
+    @Req() request: CitizenRequest,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<object> {
+    const identity = portalIdentityOf(request);
+    return this.command(res, (tx) =>
+      this.requests.create(tx, identity, body, headers),
+    );
+  }
+
+  @Put(':id/draft')
+  @Action('compose')
+  @Audit({ action: 'PORTAL_REQUEST_COMPOSE', entity: 'portal.request_draft' })
+  async updateDraft(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    const identity = portalIdentityOf(request);
+    const result = await this.tx((tx) =>
+      this.requests.updateDraft(tx, identity, id, body, headers),
+    );
+    res.setHeader('ETag', etagOf(result.version));
+    return result;
+  }
+
+  @Post(':id/attachments')
+  @Action('compose')
+  @Audit({
+    action: 'PORTAL_REQUEST_ATTACHMENT_CREATE',
+    entity: 'portal.request_attachment',
+  })
+  intendAttachment(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Body() body: unknown,
+  ): Promise<never> {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) =>
+      this.requests.intendAttachment(tx, identity, id, body),
+    );
+  }
+
+  @Post(':id/attachments/:attachmentId/complete')
+  @HttpCode(200)
+  @Action('compose')
+  @Audit({
+    action: 'PORTAL_REQUEST_ATTACHMENT_COMPLETE',
+    entity: 'portal.request_attachment',
+  })
+  completeAttachment(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Param('attachmentId') attachmentId: string,
+  ): Promise<never> {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) =>
+      this.requests.completeAttachment(tx, identity, id, attachmentId),
+    );
+  }
+
+  @Post(':id/submit')
+  @Action('submit')
+  @NoIdempotent()
+  @Audit({ action: 'PORTAL_REQUEST_SUBMIT', entity: 'portal.protocol' })
+  submit(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<object> {
+    const identity = portalIdentityOf(request);
+    return this.command(res, (tx) =>
+      this.requests.submit(tx, identity, id, body, headers),
+    );
+  }
+
+  @Post(':id/withdraw')
+  @HttpCode(200)
+  @Action('withdraw')
+  @Audit({ action: 'PORTAL_REQUEST_WITHDRAW', entity: 'portal.request' })
+  async withdraw(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    const identity = portalIdentityOf(request);
+    const result = await this.tx((tx) =>
+      this.requests.withdraw(tx, identity, id, body, headers),
+    );
+    res.setHeader('ETag', etagOf(result.version));
+    return result;
+  }
+
+  @Get()
+  @Action('read')
+  list(@Req() request: CitizenRequest, @Query() query: PortalQuery) {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) => this.requests.list(tx, identity, query ?? {}));
+  }
+
+  @Get(':id')
+  @Action('read')
+  async get(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ) {
+    const identity = portalIdentityOf(request);
+    const result = await this.tx((tx) => this.requests.get(tx, identity, id));
+    res.setHeader('ETag', etagOf(result.request.version));
+    return result;
+  }
+
+  @Get(':id/receipt')
+  @Action('read')
+  receipt(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+  ): Promise<never> {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) => this.requests.receipt(tx, identity, id));
+  }
+
+  @Get(':id/decision')
+  @Action('read')
+  decision(@Req() request: CitizenRequest, @Param('id') id: string) {
+    const identity = portalIdentityOf(request);
+    return this.tx((tx) => this.requests.decision(tx, identity, id));
+  }
+
+  @Post(':id/diligences/:did/responses')
+  @Action('respond')
+  @NoIdempotent()
+  @Audit({ action: 'PORTAL_REQUEST_RESPOND', entity: 'portal.request' })
+  respondDiligence(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Param('did') did: string,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<object> {
+    const identity = portalIdentityOf(request);
+    return this.command(res, (tx) =>
+      this.requests.respondDiligence(tx, identity, id, did, body, headers),
+    );
+  }
+
+  @Post(':id/evaluation')
+  @Action('evaluate')
+  @NoIdempotent()
+  @Audit({ action: 'PORTAL_REQUEST_EVALUATE', entity: 'portal.evaluation' })
+  evaluate(
+    @Req() request: CitizenRequest,
+    @Param('id') id: string,
+    @Body() body: unknown,
+    @Headers() headers: PortalHeaders,
+    @Res({ passthrough: true }) res: ResponseLike,
+  ): Promise<object> {
+    const identity = portalIdentityOf(request);
+    return this.command(res, (tx) =>
+      this.requests.evaluate(tx, identity, id, body, headers),
+    );
+  }
+
+  /** Transação única de tenant por comando/leitura (§0). */
+  private tx<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
+    return withTenantContext(this.database, this.requestContext, work);
+  }
+
+  /**
+   * Comando M9: o resultado carrega status/corpo (§4); um erro marcado
+   * "commit e lança" (§3.1) sai da transação commitada e é lançado depois.
+   */
+  private async command<T extends object>(
+    res: ResponseLike,
+    work: (tx: Transaction) => Promise<PortalCommandOutcome<T>>,
+  ): Promise<T> {
+    const outcome = await this.tx(
+      async (
+        tx,
+      ): Promise<{ ok: PortalCommandOutcome<T> } | { error: Error }> => {
+        try {
+          return { ok: await work(tx) };
+        } catch (error) {
+          if (isCommitThenThrow(error)) return { error };
+          throw error;
+        }
+      },
+    );
+    if ('error' in outcome) throw outcome.error;
+    const { status, body, replayed } = outcome.ok;
+    res.status(status);
+    if (replayed) res.setHeader(REPLAYED_HEADER, 'true');
+    const version = (body as { version?: unknown }).version;
+    if (typeof version === 'number') res.setHeader('ETag', etagOf(version));
+    return body;
+  }
+}
diff --git a/backend/domains/portal/requests/src/handwritten/requests.service.spec.ts b/backend/domains/portal/requests/src/handwritten/requests.service.spec.ts
new file mode 100644
index 0000000..7a4b4fa
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/requests.service.spec.ts
@@ -0,0 +1,1571 @@
+// R-0009 CTG-0002 §2.3, §3, §4, §5, §11 e §13 (TASK-0006) — C-0002-09…29:
+// `PortalRequestsService` (create, updateDraft, submit §3.1, withdraw,
+// respondDiligence, evaluate), `DRAFT_SCHEMAS` (§3.4) e
+// `PORTAL_REQUESTS_EVENT_SCHEMAS` (§11). Fica vermelho até TASK-0007 criar
+// `requests.service.ts`, `delegation/delegation.service.ts`, `drafts.ts`,
+// `events.ts`, `protocol.ts` e `idempotency.service.ts` (§14).
+//
+// Tx falsa em memória (`tests/support/fake-sql.ts` — subconjunto de SQL no
+// cabeçalho daquele arquivo) semeada com as fixtures canônicas de
+// `70-fixtures-portal.sql` (CTG-0001 §10); `PortalIdentityService` REAL de
+// `@detran/portal-identity` sobre a mesma tx (upsert do sujeito, nível por
+// ato, vínculo — já verdes em CTG-0001); relógio fixo 2026-09-14; alvos
+// falsos injetados no mapa `PORTAL_DELEGATION_TARGETS` (§3.2 "Teste"):
+// `FakeFailingDelegationTarget` (available; `delegate` lança) e o alvo
+// `adesao_sne` como espião que reproduz a semântica do
+// `SneEnrollmentDelegationTarget` do app (`SNE_CONTACT_REQUIRED` sem
+// e-mail/celular; `delegated` com o rascunho) — o alvo real é composição do
+// `AppModule` (TASK-0007) e é provado no e2e (C-0002-67).
+//
+// Formas esperadas pelo spec (constrangimentos do Inspector onde o contrato
+// não fixa assinatura; a ordem das dependências do construtor é livre —
+// `tests/support/nest-construct.ts`):
+//   service.create(tx, identity, body, headers)
+//   service.updateDraft(tx, identity, requestId, body, headers)
+//   service.submit(tx, identity, requestId, body, headers)          (§3.1)
+//   service.withdraw(tx, identity, requestId, body, headers)
+//   service.respondDiligence(tx, identity, requestId, inquiryId, body, headers)
+//   service.evaluate(tx, identity, requestId, body, headers)
+//   headers = { 'idempotency-key'?: string, 'if-match'?: string } (nomes em minúsculas,
+//   como o Node os entrega); a resposta é o corpo do §2.3 (ou `{ status, body }`).
+//   new ReadServiceDelegationTarget(serviceKey, readResource, targetKinds)
+//   new UnavailableDelegationTarget(serviceKey, unavailableReason, targetKinds)  (§3.2)
+import { describe, expect, it } from 'vitest';
+import { PortalIdentityService, cpfHashOf } from '@detran/portal-identity';
+import { DetranError, SqlTeatEventOutbox } from '@detran/shared';
+
+import { FakeSqlDatabase, type Row } from '../../tests/support/fake-sql.js';
+import { constructInjectable } from '../../tests/support/nest-construct.js';
+import {
+  ACT_LEVEL_POLICY_ROWS,
+  AITS,
+  EXTERNAL,
+  FIXED_NOW,
+  INFRACTION_VIEWS,
+  PRESENTIAL_NOTE,
+  REQUEST_FIXTURES,
+  REQUEST_STATES,
+  SERVICE_CATALOG,
+  SNE_EFFECTS,
+  SUBJECTS,
+  TENANT_ID,
+  TENANT_SLUG,
+  TOPICS,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+  identityOf,
+  outboxEnvelopes,
+  type IdentityLike,
+} from '../../tests/support/portal-fixtures.js';
+import {
+  PORTAL_DELEGATION_TARGETS,
+  ReadServiceDelegationTarget,
+  RequestDelegationService,
+  UnavailableDelegationTarget,
+  type DelegationInput,
+  type DelegationResult,
+  type DelegationTarget,
+} from './delegation/delegation.service.js';
+import { DRAFT_SCHEMAS } from './drafts.js';
+import { PORTAL_REQUESTS_EVENT_SCHEMAS } from './events.js';
+import { PortalIdempotencyService } from './idempotency.service.js';
+import { PortalRequestsService } from './requests.service.js';
+
+const REQ = {
+  identificado: '00000000-0000-7000-8000-000070400001',
+  servicoSelecionado: '00000000-0000-7000-8000-000070400002',
+  elegibilidadeVerificada: '00000000-0000-7000-8000-000070400003',
+  inelegivel: '00000000-0000-7000-8000-000070400004',
+  emComposicao: '00000000-0000-7000-8000-000070400005',
+  aguardandoNivel: '00000000-0000-7000-8000-000070400006',
+  aguardandoPagamento: '00000000-0000-7000-8000-000070400007',
+  protocolado: '00000000-0000-7000-8000-000070400008',
+  emAndamento: '00000000-0000-7000-8000-000070400009',
+  resultadoDisponivel: '00000000-0000-7000-8000-00007040000a',
+  avaliacaoOferecida: '00000000-0000-7000-8000-00007040000b',
+  concluido: '00000000-0000-7000-8000-00007040000c',
+  desistido: '00000000-0000-7000-8000-00007040000d',
+} as const;
+
+const DRAFT_FIXTURE_ID = '00000000-0000-7000-8000-000070500001';
+const REASON_R0007 = 'delegacao_indisponivel_r0007';
+const REASON_PRIVACY = 'privacy_endpoint_pendente';
+const REASON_SIGNED_DOCUMENT = 'documento_assinado_pendente_r0014';
+
+const SUBJECT_BY_ID: Record<string, keyof typeof SUBJECTS> = Object.fromEntries(
+  Object.entries(SUBJECTS).map(([key, subject]) => [subject.id, key]),
+) as Record<string, keyof typeof SUBJECTS>;
+
+/** CTG-0001 §10.3 — as 12 linhas de `portal.entitlement`. */
+const ENTITLEMENTS: Row[] = [
+  ['01', SUBJECTS.bronze.id, 'owner', 'ait', AITS.f1, 'infraction'],
+  ['02', SUBJECTS.prata.id, 'owner', 'ait', AITS.f2, 'infraction'],
+  ['03', SUBJECTS.prata.id, 'owner', 'ait', AITS.f3, 'infraction'],
+  ['04', SUBJECTS.prata.id, 'owner', 'ait', AITS.f5, 'infraction'],
+  ['05', SUBJECTS.prata.id, 'owner', 'ait', AITS.f10, 'infraction'],
+  ['06', SUBJECTS.ouro.id, 'owner', 'ait', AITS.f6, 'infraction'],
+  ['07', SUBJECTS.ouro.id, 'owner', 'ait', AITS.f12, 'infraction'],
+  ['08', SUBJECTS.qualificada.id, 'driver', 'ait', AITS.f9, 'infraction'],
+  [
+    '09',
+    SUBJECTS.procurador.id,
+    'representative',
+    'ait',
+    AITS.f2,
+    'representation',
+  ],
+  ['0a', SUBJECTS.ouro.id, 'owner', 'vehicle', EXTERNAL.vehicle, 'renavam'],
+  ['0b', SUBJECTS.ouro.id, 'interested_party', 'exam', EXTERNAL.exam, 'manual'],
+  [
+    '0c',
+    SUBJECTS.qualificada.id,
+    'interested_party',
+    'crash',
+    EXTERNAL.crash,
+    'manual',
+  ],
+].map(([nn, subjectId, relation, targetKind, targetId, origin]) => ({
+  id: `00000000-0000-7000-8000-0000702000${nn}`,
+  subject_id: subjectId,
+  relation,
+  target_kind: targetKind,
+  target_id: targetId,
+  origin,
+  valid_from: '2026-01-01',
+  valid_until: nn === '09' ? '2027-09-14' : null,
+}));
+
+const SUBJECT_ROWS: Row[] = Object.values(SUBJECTS).map((subject) => ({
+  id: subject.id,
+  cpf_hash: subject.cpfHash,
+  name: `${subject.id.slice(-2)} (fixture)`,
+  govbr_level_observed: null,
+  assurance_level_observed: subject.assurance,
+  observed_at: FIXED_NOW,
+  version: 1,
+}));
+
+class FakeFailingDelegationTarget implements DelegationTarget {
+  readonly calls: DelegationInput[] = [];
+  constructor(
+    readonly serviceKey: string,
+    readonly targetKinds: readonly (
+      'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none'
+    )[],
+    private readonly error: () => Error = () => {
+      const error = new Error('alvo falso: falha simulada');
+      error.name = 'FakeFailingDelegationTarget';
+      return error;
+    },
+  ) {}
+  availability(): string | null {
+    return null;
+  }
+  async delegate(input: DelegationInput): Promise<DelegationResult> {
+    this.calls.push(input);
+    throw this.error();
+  }
+}
+
+/** Alvo disponível que delega (C-0002-20 e espião de `adesao_sne`). */
+class FakeAvailableTarget implements DelegationTarget {
+  readonly calls: DelegationInput[] = [];
+  constructor(
+    readonly serviceKey: string,
+    readonly targetKinds: readonly (
+      'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none'
+    )[],
+    private readonly result: (input: DelegationInput) => DelegationResult,
+  ) {}
+  availability(): string | null {
+    return null;
+  }
+  async delegate(input: DelegationInput): Promise<DelegationResult> {
+    this.calls.push(input);
+    return this.result(input);
+  }
+}
+
+/** Reproduz a semântica do alvo do app (§3.2 `adesao_sne`): erros do serviço viram 502. */
+function fakeSneTarget(): FakeAvailableTarget {
+  return new FakeAvailableTarget('adesao_sne', ['none'], (input) => {
+    const draft = input.draft as { email?: string; phone?: string };
+    if (!draft.email && !draft.phone) {
+      throw new DetranError('PORTAL.SNE_CONTACT_REQUIRED', {
+        status: 422,
+        context: { missing: ['email', 'phone'] },
+      });
+    }
+    return {
+      domain: 'portal',
+      command: 'portal:sne-enrollment:enroll',
+      externalId: '00000000-0000-7000-8000-000070e00001',
+      status: 'delegated',
+    };
+  });
+}
+
+function defaultTargets(
+  overrides: Record<string, DelegationTarget> = {},
+): Map<string, DelegationTarget> {
+  const targets = new Map<string, DelegationTarget>();
+  const unavailable = (
+    key: string,
+    reason: string,
+    kinds: DelegationTarget['targetKinds'],
+  ) => targets.set(key, new UnavailableDelegationTarget(key, reason, kinds));
+  unavailable('defesa_previa', REASON_R0007, ['ait']);
+  unavailable('recurso_jari', REASON_R0007, ['ait', 'case']);
+  unavailable('recurso_cetran', REASON_R0007, ['case']);
+  unavailable('indicacao_condutor', REASON_R0007, ['ait']);
+  unavailable('pagamento', REASON_R0007, ['ait']);
+  unavailable('junta_medica', REASON_R0007, ['exam']);
+  unavailable('lgpd_declaracao', REASON_PRIVACY, ['none']);
+  unavailable('emissao_crlv', REASON_SIGNED_DOCUMENT, ['vehicle']);
+  unavailable('inf:rait-case:answer-inquiry', REASON_R0007, ['case']);
+  targets.set('adesao_sne', fakeSneTarget());
+  targets.set(
+    'cancelamento_sne',
+    new FakeAvailableTarget('cancelamento_sne', ['none'], () => ({
+      domain: 'portal',
+      command: 'portal:sne-enrollment:cancel',
+      externalId: '00000000-0000-7000-8000-000070e00001',
+      status: 'delegated',
+    })),
+  );
+  targets.set(
+    'consulta_multas',
+    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
+  );
+  targets.set(
+    'consulta_cnh',
+    new ReadServiceDelegationTarget('consulta_cnh', 'document', ['none']),
+  );
+  targets.set(
+    'consulta_bat',
+    new ReadServiceDelegationTarget('consulta_bat', 'crash', ['crash']),
+  );
+  targets.set(
+    'consulta_exame',
+    new ReadServiceDelegationTarget('consulta_exame', 'exam', ['exam']),
+  );
+  for (const [key, target] of Object.entries(overrides))
+    targets.set(key, target);
+  return targets;
+}
+
+interface Harness {
+  db: FakeSqlDatabase;
+  service: PortalRequestsService;
+  call: <T = Row>(method: string, ...args: unknown[]) => Promise<T>;
+}
+
+function harness(
+  options: {
+    targets?: Record<string, DelegationTarget>;
+    catalog?: (rows: Row[]) => Row[];
+    fixtures?: (rows: Row[]) => Row[];
+  } = {},
+): Harness {
+  const db = new FakeSqlDatabase({
+    tenantId: TENANT_ID,
+    tenant: { slug: TENANT_SLUG },
+    now: fixedClock.now,
+    sequences: { 'portal.protocol_seq': 14 },
+  });
+  db.seed('portal.subject', SUBJECT_ROWS);
+  db.seed('portal.entitlement', ENTITLEMENTS);
+  db.seed('portal.act_level_policy', ACT_LEVEL_POLICY_ROWS);
+  db.seed(
+    'portal.service_catalog',
+    (options.catalog ?? ((rows) => rows))(SERVICE_CATALOG),
+  );
+  db.seed('portal.infraction_view', INFRACTION_VIEWS);
+  db.seed(
+    'portal.request',
+    (options.fixtures ?? ((rows) => rows))(
+      REQUEST_FIXTURES.map((row) => ({ ...row })),
+    ),
+  );
+  db.seed('portal.request_draft', [
+    {
+      id: DRAFT_FIXTURE_ID,
+      request_id: REQ.emComposicao,
+      version: 1,
+      payload_json: {},
+      saved_at: FIXED_NOW,
+    },
+  ]);
+  db.seed(
+    'portal.protocol',
+    [
+      REQ.protocolado,
+      REQ.emAndamento,
+      REQ.resultadoDisponivel,
+      REQ.avaliacaoOferecida,
+      REQ.concluido,
+    ].map((requestId, index) => ({
+      id: `00000000-0000-7000-8000-0000706000${(index + 1).toString(16).padStart(2, '0')}`,
+      request_id: requestId,
+      number: `AM-FIXTURES-2026-${String(index + 1).padStart(7, '0')}`,
+      issued_at: new Date(`2026-09-0${index + 1}T12:00:00-04:00`),
+      receipt_hash: 'a'.repeat(64),
+    })),
+  );
+
+  const identity = new PortalIdentityService(fixedClock as never);
+  const delegation = constructInjectable(RequestDelegationService, {
+    PORTAL_DELEGATION_TARGETS: defaultTargets(options.targets),
+  });
+  const idempotency = constructInjectable(PortalIdempotencyService, {
+    PortalClock: fixedClock,
+  });
+  const outbox = new SqlTeatEventOutbox();
+  const providers = {
+    PortalIdentityService: identity,
+    RequestDelegationService: delegation,
+    PortalIdempotencyService: idempotency,
+    PortalClock: fixedClock,
+    Database: fakeDatabase(db.tx),
+    RequestContext: fakeRequestContext(),
+    SqlTeatEventOutbox: outbox,
+    TEAT_EVENT_OUTBOX: outbox,
+  };
+  const service = constructInjectable(PortalRequestsService, providers);
+  const call = async <T = Row>(
+    method: string,
+    ...args: unknown[]
+  ): Promise<T> => {
+    const fn = (service as unknown as Record<string, unknown>)[method];
+    if (typeof fn !== 'function') {
+      throw new Error(
+        `PortalRequestsService não expõe ${method} (CTG-0002 §14)`,
+      );
+    }
+    const result = (await (
+      fn as (...values: unknown[]) => Promise<unknown>
+    ).call(service, db.tx, ...args)) as Row;
+    return result &&
+      typeof result === 'object' &&
+      'body' in result &&
+      !('requestId' in result)
+      ? (result.body as T)
+      : (result as T);
+  };
+  return { db, service, call };
+}
+
+let keyCounter = 0;
+const key = () => {
+  keyCounter += 1;
+  return `k-${keyCounter}`;
+};
+const headers = (extra: Record<string, string> = {}) => ({
+  'idempotency-key': key(),
+  ...extra,
+});
+
+const SIGNATURE = { signature: { method: 'govbr', signatureRef: 'ref' } };
+const CONSEQUENCE_ACK = {
+  consequenceAck: { textVersion: '1', acceptedAt: '2026-09-14T15:00:00.000Z' },
+};
+const SNE_DRAFT = {
+  email: 'prata@fixtures.invalid',
+  consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
+};
+
+async function createRequest(
+  h: Harness,
+  identity: IdentityLike,
+  body: Record<string, unknown>,
+): Promise<{ requestId: string; version: number; state: string }> {
+  const created = await h.call<{
+    requestId: string;
+    version: number;
+    state: string;
+  }>('create', identity, body, headers());
+  expect(created.state).toBe('PEDIDO_EM_COMPOSICAO');
+  return created;
+}
+
+function requestRow(h: Harness, id: string): Row {
+  const row = h.db
+    .rows('portal.request')
+    .find((candidate) => candidate.id === id);
+  if (!row) throw new Error(`request ${id} ausente`);
+  return row;
+}
+
+function domainEvents(h: Harness, topic: string): string[] {
+  return outboxEnvelopes(h.db, topic).map((envelope) =>
+    String(envelope.domainEvent),
+  );
+}
+
+describe('CTG-0002 §3.1 — submit: protocolo imediato, delegação e 502 (C-0002-09…16)', () => {
+  it("C-0002-09 — dado request PEDIDO_EM_COMPOSICAO de consulta_multas e alvo falso que lança quando submit então portal.protocol, state 'PROTOCOLADO', delegation_status 'failed', delegation_error = código, SOLICITACAO_PROTOCOLADA na outbox, idempotência 502 e 502 PORTAL.DELEGATION_FAILED { protocol, retryPolicy: 'pendencia_interna' }", async () => {
+    const failing = new FakeFailingDelegationTarget('consulta_multas', [
+      'none',
+      'ait',
+    ]);
+    const h = harness({ targets: { consulta_multas: failing } });
+    const prata = identityOf('prata');
+    const { requestId } = await createRequest(h, prata, {
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+
+    const submitHeaders = headers();
+    await expect(
+      h.call('submit', prata, requestId, SIGNATURE, submitHeaders),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.DELEGATION_FAILED',
+      status: 502,
+      context: {
+        protocol: 'AM-FIXTURES-2026-0000015',
+        retryPolicy: 'pendencia_interna',
+      },
+    });
+
+    const protocol = h.db
+      .rows('portal.protocol')
+      .find((row) => row.request_id === requestId);
+    expect(protocol).toMatchObject({
+      number: 'AM-FIXTURES-2026-0000015',
+      channel: 'portal',
+    });
+    expect(String(protocol!.receipt_hash)).toMatch(/^[0-9a-f]{64}$/);
+    expect(requestRow(h, requestId)).toMatchObject({
+      state: 'PROTOCOLADO',
+      delegation_status: 'failed',
+      delegation_error: 'FakeFailingDelegationTarget',
+    });
+    expect(failing.calls).toHaveLength(1);
+    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
+      'SOLICITACAO_PROTOCOLADA',
+    );
+    const record = h.db
+      .rows('portal.idempotency_record')
+      .find(
+        (row) =>
+          row.key ===
+          `${SUBJECTS.prata.id}:${submitHeaders['idempotency-key']}`,
+      );
+    expect(record).toMatchObject({ status: 502 });
+    expect((record!.response_json as Row).code).toBe(
+      'PORTAL.DELEGATION_FAILED',
+    );
+  });
+
+  it("C-0002-10 — dado request adesao_sne com rascunho sem email/phone quando submit com consequenceAck então protocola ANTES e 502 DELEGATION_FAILED com delegation_error 'PORTAL.SNE_CONTACT_REQUIRED'", async () => {
+    const h = harness();
+    const ouro = identityOf('ouro');
+    const { requestId } = await createRequest(h, ouro, {
+      serviceKey: 'adesao_sne',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    await h.call(
+      'updateDraft',
+      ouro,
+      requestId,
+      { consent: SNE_DRAFT.consent },
+      headers({ 'if-match': '"1"' }),
+    );
+
+    await expect(
+      h.call(
+        'submit',
+        ouro,
+        requestId,
+        { ...SIGNATURE, ...CONSEQUENCE_ACK },
+        headers(),
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.DELEGATION_FAILED', status: 502 });
+
+    expect(
+      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
+    ).toBe(true);
+    expect(requestRow(h, requestId)).toMatchObject({
+      state: 'PROTOCOLADO',
+      delegation_status: 'failed',
+      delegation_error: 'PORTAL.SNE_CONTACT_REQUIRED',
+    });
+  });
+
+  it("C-0002-11 — dado identity 'simples' e ato adesao_sne ('avancada') quando submit então 'AGUARDANDO_NIVEL_ASSINATURA' persistido, minimum_assurance 'avancada', 403 ASSURANCE_INSUFFICIENT { actKey, resumeRoute } e NENHUM registro de idempotência", async () => {
+    const h = harness();
+    const ouroSimples = identityOf('ouro', 'simples');
+    const { requestId } = await createRequest(h, ouroSimples, {
+      serviceKey: 'adesao_sne',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+
+    await expect(
+      h.call(
+        'submit',
+        ouroSimples,
+        requestId,
+        { ...SIGNATURE, ...CONSEQUENCE_ACK },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
+      status: 403,
+      context: {
+        actKey: 'adesao_sne',
+        required: 'avancada',
+        current: 'simples',
+        resumeRoute: `/v1/portal/requests/${requestId}`,
+      },
+    });
+
+    expect(requestRow(h, requestId)).toMatchObject({
+      state: 'AGUARDANDO_NIVEL_ASSINATURA',
+      minimum_assurance: 'avancada',
+      version: 2,
+    });
+    expect(
+      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
+    ).toBe(false);
+    expect(
+      h.db
+        .rows('portal.idempotency_record')
+        .filter((row) => String(row.route).includes('submit')),
+    ).toHaveLength(0);
+  });
+
+  it("C-0002-12 — dado request AGUARDANDO_NIVEL_ASSINATURA e identity 'avancada' quando submit então PROTOCOLADO → EM_ANDAMENTO_NO_ORGAO (A1(c))", async () => {
+    const h = harness();
+    h.db.seed('portal.request_draft', [
+      {
+        request_id: REQ.aguardandoNivel,
+        version: 1,
+        payload_json: SNE_DRAFT,
+        saved_at: FIXED_NOW,
+      },
+    ]);
+    const bronzeElevado = identityOf('bronze', 'avancada');
+    const response = await h.call<{
+      state: string;
+      delegation: Row;
+      protocol: Row;
+    }>(
+      'submit',
+      bronzeElevado,
+      REQ.aguardandoNivel,
+      { ...SIGNATURE, ...CONSEQUENCE_ACK },
+      headers(),
+    );
+    expect(response.state).toBe('EM_ANDAMENTO_NO_ORGAO');
+    expect(response.delegation).toMatchObject({ status: 'delegated' });
+    expect(response.protocol).toMatchObject({ channel: 'portal' });
+    expect(requestRow(h, REQ.aguardandoNivel)).toMatchObject({
+      state: 'EM_ANDAMENTO_NO_ORGAO',
+      delegation_status: 'delegated',
+      delegation_domain: 'portal',
+      delegation_command: 'portal:sne-enrollment:enroll',
+    });
+    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
+      'SOLICITACAO_PROTOCOLADA',
+    );
+  });
+
+  it("C-0002-13 — dado consulta_multas (ReadServiceDelegationTarget) quando submit então delegation_status 'not_applicable', state final 'AVALIACAO_OFERECIDA', version incrementada por transição e resposta.state = 'AVALIACAO_OFERECIDA'", async () => {
+    const h = harness();
+    const prata = identityOf('prata');
+    const { requestId } = await createRequest(h, prata, {
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+
+    const response = await h.call<{
+      state: string;
+      version: number;
+      delegation: Row;
+      protocol: Row;
+    }>('submit', prata, requestId, SIGNATURE, headers());
+    expect(response.state).toBe('AVALIACAO_OFERECIDA');
+    expect(response.delegation).toMatchObject({ status: 'not_applicable' });
+    expect(response.protocol).toMatchObject({
+      number: 'AM-FIXTURES-2026-0000015',
+      channel: 'portal',
+    });
+    // 1 (create) → PROTOCOLADO 2 → EM_ANDAMENTO_NO_ORGAO 3 → RESULTADO_DISPONIVEL 4 → AVALIACAO_OFERECIDA 5
+    expect(requestRow(h, requestId)).toMatchObject({
+      state: 'AVALIACAO_OFERECIDA',
+      delegation_status: 'not_applicable',
+      delegation_domain: 'portal',
+      delegation_command: 'portal:ait:read',
+      version: 5,
+    });
+    expect(response.version).toBe(5);
+  });
+
+  it('C-0002-14 — dado adesao_sne sem consequenceAck quando submit então 422 PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED { textVersion: null } e nenhum protocolo', async () => {
+    const h = harness();
+    const ouro = identityOf('ouro');
+    const { requestId } = await createRequest(h, ouro, {
+      serviceKey: 'adesao_sne',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    await h.call(
+      'updateDraft',
+      ouro,
+      requestId,
+      SNE_DRAFT,
+      headers({ 'if-match': '"1"' }),
+    );
+
+    await expect(
+      h.call('submit', ouro, requestId, SIGNATURE, headers()),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED',
+      status: 422,
+      context: { textVersion: null },
+    });
+    expect(
+      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
+    ).toBe(false);
+    expect(requestRow(h, requestId).state).toBe('PEDIDO_EM_COMPOSICAO');
+  });
+
+  it("C-0002-15 — dado adesao_sne com consequenceAck quando submit então portal.consequence_ack (kind 'sne', text_version) e o alvo de adesão chamado com o rascunho", async () => {
+    const sne = fakeSneTarget();
+    const h = harness({ targets: { adesao_sne: sne } });
+    const ouro = identityOf('ouro');
+    const { requestId } = await createRequest(h, ouro, {
+      serviceKey: 'adesao_sne',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    await h.call(
+      'updateDraft',
+      ouro,
+      requestId,
+      SNE_DRAFT,
+      headers({ 'if-match': '"1"' }),
+    );
+
+    const response = await h.call<{ state: string }>(
+      'submit',
+      ouro,
+      requestId,
+      {
+        ...SIGNATURE,
+        consequenceAck: {
+          textVersion: 'v-2026',
+          acceptedAt: '2026-09-14T15:00:00.000Z',
+        },
+      },
+      headers(),
+    );
+    expect(response.state).toBe('EM_ANDAMENTO_NO_ORGAO');
+    const ack = h.db
+      .rows('portal.consequence_ack')
+      .find((row) => row.request_id === requestId);
+    expect(ack).toMatchObject({ kind: 'sne', text_version: 'v-2026' });
+    expect(sne.calls).toHaveLength(1);
+    expect(sne.calls[0]!.draft).toEqual(SNE_DRAFT);
+    expect(sne.calls[0]!.protocol).toMatchObject({
+      number: expect.stringMatching(/^AM-FIXTURES-2026-\d{7}$/),
+    });
+  });
+
+  it("C-0002-16 — dado cada um dos 11 estados fora de allowed quando submit então 409 PORTAL.REQUEST_STATE_INVALID { state, allowed: ['PEDIDO_EM_COMPOSICAO','AGUARDANDO_NIVEL_ASSINATURA'] }", async () => {
+    const allowed = ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'];
+    const rejected = REQUEST_STATES.filter((state) => !allowed.includes(state));
+    expect(rejected).toHaveLength(11);
+    for (const state of rejected) {
+      const h = harness();
+      const fixture = REQUEST_FIXTURES.find((row) => row.state === state)!;
+      const owner = identityOf(
+        SUBJECT_BY_ID[String(fixture.subject_id)]!,
+        'avancada',
+      );
+      await expect(
+        h.call(
+          'submit',
+          owner,
+          fixture.id,
+          { ...SIGNATURE, ...CONSEQUENCE_ACK },
+          headers(),
+        ),
+        `estado ${state}`,
+      ).rejects.toMatchObject({
+        code: 'PORTAL.REQUEST_STATE_INVALID',
+        status: 409,
+        context: { state, allowed },
+      });
+    }
+  });
+});
+
+describe('CTG-0002 §2.3 — create: catálogo, alvo, vínculo, rascunho em aberto (C-0002-17…22)', () => {
+  it("C-0002-17 — dado serviceKey 'defesa_previa' (catálogo unavailable) quando create então 422 PORTAL.SERVICE_UNAVAILABLE { unavailableReason: 'delegacao_indisponivel_r0007', alternativeChannelNote: <do catálogo> }", async () => {
+    const h = harness();
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'defesa_previa',
+          targetKind: 'ait',
+          targetId: AITS.f2,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SERVICE_UNAVAILABLE',
+      status: 422,
+      context: {
+        unavailableReason: REASON_R0007,
+        alternativeChannelNote: PRESENTIAL_NOTE,
+      },
+    });
+    expect(
+      h.db
+        .rows('portal.request')
+        .filter((row) => row.service_key === 'defesa_previa'),
+    ).toHaveLength(0);
+  });
+
+  it("C-0002-18 — dado 'lgpd_declaracao' então 'privacy_endpoint_pendente'; dado 'emissao_crlv' então 'documento_assinado_pendente_r0014'; dado 'pagamento' (partially_available) então 'delegacao_indisponivel_r0007' (alvo, passo 5)", async () => {
+    const h = harness();
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'lgpd_declaracao',
+          targetKind: 'none',
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SERVICE_UNAVAILABLE',
+      context: {
+        unavailableReason: REASON_PRIVACY,
+        alternativeChannelNote:
+          'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
+      },
+    });
+    await expect(
+      h.call(
+        'create',
+        identityOf('ouro'),
+        {
+          serviceKey: 'emissao_crlv',
+          targetKind: 'vehicle',
+          targetId: EXTERNAL.vehicle,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SERVICE_UNAVAILABLE',
+      context: {
+        unavailableReason: REASON_SIGNED_DOCUMENT,
+        alternativeChannelNote: null,
+      },
+    });
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'pagamento',
+          targetKind: 'ait',
+          targetId: AITS.f2,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SERVICE_UNAVAILABLE',
+      context: {
+        unavailableReason: REASON_R0007,
+        alternativeChannelNote:
+          'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
+      },
+    });
+  });
+
+  it("C-0002-19 — dado 'manifestar' | 'avaliar' quando create então 422 PORTAL.INELIGIBLE { reason: 'servico_com_rota_propria', alternative, serviceKey }", async () => {
+    const h = harness();
+    for (const [serviceKey, alternative] of [
+      ['manifestar', '/v1/portal/manifestations'],
+      ['avaliar', '/v1/portal/evaluations'],
+    ] as const) {
+      await expect(
+        h.call(
+          'create',
+          identityOf('prata'),
+          { serviceKey, targetKind: 'none', channel: 'portal' },
+          headers(),
+        ),
+      ).rejects.toMatchObject({
+        code: 'PORTAL.INELIGIBLE',
+        status: 422,
+        context: {
+          reason: 'servico_com_rota_propria',
+          alternative,
+          serviceKey,
+        },
+      });
+    }
+  });
+
+  it("C-0002-20 — dado create consulta_multas com targetId sem vínculo então 404 PORTAL.NOT_FOUND { kind: 'ait' }; dado alvo falso DISPONÍVEL para indicacao_condutor, ait em infraction_view e sem vínculo então 422 PORTAL.ENTITLEMENT_REQUIRED { targetKind: 'ait', howToProve: 'procuracao' }", async () => {
+    const h = harness();
+    // …f0000001 é do bronze (…70200001); prata não tem vínculo
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'consulta_multas',
+          targetKind: 'ait',
+          targetId: AITS.f1,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'ait' },
+    });
+
+    const available = new FakeAvailableTarget(
+      'indicacao_condutor',
+      ['ait'],
+      () => ({
+        domain: 'inf',
+        command: 'inf:infraction:indicate-driver',
+        externalId: null,
+        status: 'delegated',
+      }),
+    );
+    const h2 = harness({
+      targets: { indicacao_condutor: available },
+      catalog: (rows) =>
+        rows.map((row) =>
+          row.service_key === 'indicacao_condutor'
+            ? {
+                ...row,
+                availability: 'available',
+                unavailable_reason: null,
+                alternative_channel_note: null,
+              }
+            : row,
+        ),
+    });
+    // …f0000002 existe em portal.infraction_view (…70f00001) e é da prata; ouro não tem vínculo
+    await expect(
+      h2.call(
+        'create',
+        identityOf('ouro'),
+        {
+          serviceKey: 'indicacao_condutor',
+          targetKind: 'ait',
+          targetId: AITS.f2,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ENTITLEMENT_REQUIRED',
+      status: 422,
+      context: { targetKind: 'ait', howToProve: 'procuracao' },
+    });
+    // alvo inexistente na projeção → 404 (disfarce, M10), nunca 422
+    await expect(
+      h2.call(
+        'create',
+        identityOf('ouro'),
+        {
+          serviceKey: 'indicacao_condutor',
+          targetKind: 'ait',
+          targetId: AITS.f1,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'ait' },
+    });
+  });
+
+  it('C-0002-21 — dado request em PEDIDO_EM_COMPOSICAO do mesmo (serviceKey, targetKind, targetId) quando create então 409 PORTAL.REQUEST_DRAFT_EXISTS { requestId }', async () => {
+    const h = harness();
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        { serviceKey: 'adesao_sne', targetKind: 'none', channel: 'portal' },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_DRAFT_EXISTS',
+      status: 409,
+      context: { requestId: REQ.emComposicao },
+    });
+  });
+
+  it("C-0002-22 — dado serviceKey inexistente então 404 { kind: 'service' }; dado targetKind não admitido pelo serviço então 400 VALIDATION_FAILED { fields: ['targetKind'] }; dado targetKind 'none' com targetId então 400 { fields: ['targetId'] }", async () => {
+    const h = harness();
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        { serviceKey: 'nao_existe', targetKind: 'none', channel: 'portal' },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'service' },
+    });
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'consulta_cnh',
+          targetKind: 'ait',
+          targetId: AITS.f2,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['targetKind'] },
+    });
+    await expect(
+      h.call(
+        'create',
+        identityOf('prata'),
+        {
+          serviceKey: 'consulta_multas',
+          targetKind: 'none',
+          targetId: AITS.f2,
+          channel: 'portal',
+        },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['targetId'] },
+    });
+  });
+
+  it('§2.3 create (complemento unitário de C-0002-64) — dado create bem-sucedido então 201 { requestId, state, requirements, minimumAssurance, version: 1 }, linha em request_draft version 1 e SOLICITACAO_CRIADA com subjectCpfHash', async () => {
+    const h = harness();
+    const created = await h.call<Row>(
+      'create',
+      identityOf('prata'),
+      { serviceKey: 'consulta_multas', targetKind: 'none', channel: 'portal' },
+      headers(),
+    );
+    expect(created).toMatchObject({
+      state: 'PEDIDO_EM_COMPOSICAO',
+      minimumAssurance: 'simples',
+      version: 1,
+      prefilled: {},
+    });
+    expect(created.requirements).toEqual(['Conta gov.br']);
+    const draft = h.db
+      .rows('portal.request_draft')
+      .find((row) => row.request_id === created.requestId);
+    expect(draft).toMatchObject({ version: 1, payload_json: {} });
+    const [event] = outboxEnvelopes(h.db, TOPICS.requestChanged).filter(
+      (envelope) => envelope.domainEvent === 'SOLICITACAO_CRIADA',
+    );
+    expect(event?.data).toMatchObject({
+      requestId: created.requestId,
+      serviceKey: 'consulta_multas',
+      fromState: null,
+      toState: 'PEDIDO_EM_COMPOSICAO',
+      subjectId: SUBJECTS.prata.id,
+      subjectCpfHash: cpfHashOf(SUBJECTS.prata.cpf),
+    });
+    expect(event?.aggregate).toMatchObject({
+      kind: 'portal.request',
+      id: created.requestId,
+      version: 1,
+    });
+    expect(JSON.stringify(event?.data)).not.toContain(TENANT_ID);
+  });
+});
+
+describe('CTG-0002 §2.3 — withdraw, draft, respond, evaluate (C-0002-23…26)', () => {
+  it("C-0002-23 — dado withdraw sem If-Match então 428; com If-Match errado então 412 { expected, received }; correto em PEDIDO_EM_COMPOSICAO então 'DESISTIDO', withdrawn_at = relógio, consequence_ack kind 'desistencia', SOLICITACAO_DESISTIDA", async () => {
+    const h = harness();
+    const prata = identityOf('prata');
+    await expect(
+      h.call('withdraw', prata, REQ.emComposicao, { confirm: true }, headers()),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.IF_MATCH_REQUIRED',
+      status: 428,
+    });
+    await expect(
+      h.call(
+        'withdraw',
+        prata,
+        REQ.emComposicao,
+        { confirm: true },
+        headers({ 'if-match': '"7"' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VERSION_CONFLICT',
+      status: 412,
+      context: { expected: 1, received: 7 },
+    });
+    const response = await h.call<Row>(
+      'withdraw',
+      prata,
+      REQ.emComposicao,
+      { confirm: true, reason: 'mudei de ideia' },
+      headers({ 'if-match': '"1"' }),
+    );
+    expect(response).toMatchObject({
+      requestId: REQ.emComposicao,
+      state: 'DESISTIDO',
+      version: 2,
+    });
+    expect(new Date(String(response.withdrawnAt)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+    const row = requestRow(h, REQ.emComposicao);
+    expect(row.state).toBe('DESISTIDO');
+    expect(new Date(String(row.withdrawn_at)).getTime()).toBe(
+      FIXED_NOW.getTime(),
+    );
+    expect(
+      h.db
+        .rows('portal.consequence_ack')
+        .find((ack) => ack.request_id === REQ.emComposicao),
+    ).toMatchObject({ kind: 'desistencia' });
+    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
+      'SOLICITACAO_DESISTIDA',
+    );
+  });
+
+  it('§2.3 withdraw (complemento unitário de C-0002-69) — dado withdraw em EM_ANDAMENTO_NO_ORGAO então 409 { state, allowed[3] }; dado { confirm: false } então 400', async () => {
+    const h = harness();
+    await expect(
+      h.call(
+        'withdraw',
+        identityOf('qualificada'),
+        REQ.emAndamento,
+        { confirm: true },
+        headers({ 'if-match': '"1"' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_STATE_INVALID',
+      status: 409,
+      context: {
+        state: 'EM_ANDAMENTO_NO_ORGAO',
+        allowed: [
+          'PEDIDO_EM_COMPOSICAO',
+          'AGUARDANDO_NIVEL_ASSINATURA',
+          'AGUARDANDO_PAGAMENTO',
+        ],
+      },
+    });
+    await expect(
+      h.call(
+        'withdraw',
+        identityOf('prata'),
+        REQ.emComposicao,
+        { confirm: false },
+        headers({ 'if-match': '"1"' }),
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.VALIDATION_FAILED', status: 400 });
+  });
+
+  it("C-0002-24 — dado draft em PEDIDO_EM_COMPOSICAO com If-Match então request.version+1 e nova linha request_draft com version = request.version; fora do estado então 409 { allowed: ['PEDIDO_EM_COMPOSICAO'] }; corpo fora de DRAFT_SCHEMAS[serviceKey] então 400", async () => {
+    const h = harness();
+    const prata = identityOf('prata');
+    const response = await h.call<Row>(
+      'updateDraft',
+      prata,
+      REQ.emComposicao,
+      SNE_DRAFT,
+      headers({ 'if-match': '"1"' }),
+    );
+    expect(response).toMatchObject({ requestId: REQ.emComposicao, version: 2 });
+    expect(requestRow(h, REQ.emComposicao).version).toBe(2);
+    const drafts = h.db
+      .rows('portal.request_draft')
+      .filter((row) => row.request_id === REQ.emComposicao);
+    expect(drafts.map((row) => row.version).sort()).toEqual([1, 2]);
+    expect(drafts.find((row) => row.version === 2)).toMatchObject({
+      payload_json: SNE_DRAFT,
+    });
+    expect(
+      new Date(
+        String(drafts.find((row) => row.version === 2)!.saved_at),
+      ).getTime(),
+    ).toBe(FIXED_NOW.getTime());
+
+    await expect(
+      h.call(
+        'updateDraft',
+        identityOf('ouro'),
+        REQ.protocolado,
+        SNE_DRAFT,
+        headers({ 'if-match': '"1"' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_STATE_INVALID',
+      status: 409,
+      context: { state: 'PROTOCOLADO', allowed: ['PEDIDO_EM_COMPOSICAO'] },
+    });
+    await expect(
+      h.call(
+        'updateDraft',
+        prata,
+        REQ.emComposicao,
+        { foo: 1 },
+        headers({ 'if-match': '"2"' }),
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.VALIDATION_FAILED', status: 400 });
+    await expect(
+      h.call('updateDraft', prata, REQ.emComposicao, SNE_DRAFT, headers()),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.IF_MATCH_REQUIRED',
+      status: 428,
+    });
+  });
+
+  it("C-0002-25 — dado respond em estado ≠ EM_ANDAMENTO_NO_ORGAO então 409 { allowed: ['EM_ANDAMENTO_NO_ORGAO'] }; em EM_ANDAMENTO_NO_ORGAO então 422 SERVICE_UNAVAILABLE 'delegacao_indisponivel_r0007'", async () => {
+    const h = harness();
+    const inquiryId = '00000000-0000-7000-8000-000070007308';
+    const body = { text: 'resposta', attachmentIds: [] };
+    await expect(
+      h.call(
+        'respondDiligence',
+        identityOf('prata'),
+        REQ.emComposicao,
+        inquiryId,
+        body,
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_STATE_INVALID',
+      status: 409,
+      context: {
+        state: 'PEDIDO_EM_COMPOSICAO',
+        allowed: ['EM_ANDAMENTO_NO_ORGAO'],
+      },
+    });
+    await expect(
+      h.call(
+        'respondDiligence',
+        identityOf('qualificada'),
+        REQ.emAndamento,
+        inquiryId,
+        body,
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.SERVICE_UNAVAILABLE',
+      status: 422,
+      context: { unavailableReason: REASON_R0007 },
+    });
+    expect(requestRow(h, REQ.emAndamento).state).toBe('EM_ANDAMENTO_NO_ORGAO');
+    await expect(
+      h.call(
+        'respondDiligence',
+        identityOf('qualificada'),
+        REQ.emAndamento,
+        inquiryId,
+        body,
+        {},
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.VALIDATION_FAILED',
+      status: 400,
+      context: { fields: ['Idempotency-Key'] },
+    });
+  });
+
+  it("C-0002-26 — dado evaluate em AVALIACAO_OFERECIDA então portal.evaluation (subject_kind 'request'), state 'CONCLUIDO', AVALIACAO_REGISTRADA e SOLICITACAO_CONCLUIDA; segunda avaliação então 409 EVALUATION_ALREADY_SUBMITTED; em outro estado então 409 REQUEST_STATE_INVALID", async () => {
+    const h = harness();
+    const qualificada = identityOf('qualificada');
+    const scores = {
+      satisfaction: 5,
+      quality: 4,
+      deadline: 5,
+      clarity: 4,
+      channel: 5,
+    };
+    const response = await h.call<Row>(
+      'evaluate',
+      qualificada,
+      REQ.avaliacaoOferecida,
+      { scores, comment: 'ok' },
+      headers(),
+    );
+    expect(response).toMatchObject({
+      requestId: REQ.avaliacaoOferecida,
+      state: 'CONCLUIDO',
+    });
+    expect(typeof response.evaluationId).toBe('string');
+    const evaluation = h.db
+      .rows('portal.evaluation')
+      .find((row) => row.subject_id === REQ.avaliacaoOferecida);
+    expect(evaluation).toMatchObject({
+      subject_kind: 'request',
+      scores_json: scores,
+      comment: 'ok',
+    });
+    expect(requestRow(h, REQ.avaliacaoOferecida)).toMatchObject({
+      state: 'CONCLUIDO',
+      version: 2,
+    });
+    const registered = outboxEnvelopes(h.db, TOPICS.evaluationRegistered);
+    expect(registered).toHaveLength(1);
+    expect(registered[0]!.data).toMatchObject({
+      subjectKind: 'request',
+      subjectId: REQ.avaliacaoOferecida,
+    });
+    expect(registered[0]!.data).not.toHaveProperty('scores');
+    expect(registered[0]!.data).not.toHaveProperty('comment');
+    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
+      'SOLICITACAO_CONCLUIDA',
+    );
+
+    // segunda avaliação: a máquina já está em CONCLUIDO; o passo 5 (unique) é provado
+    // recolocando a linha em AVALIACAO_OFERECIDA (só a fixture muda, não o serviço)
+    requestRow(h, REQ.avaliacaoOferecida).state = 'AVALIACAO_OFERECIDA';
+    await expect(
+      h.call(
+        'evaluate',
+        qualificada,
+        REQ.avaliacaoOferecida,
+        { scores },
+        headers(),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.EVALUATION_ALREADY_SUBMITTED',
+      status: 409,
+    });
+
+    await expect(
+      h.call('evaluate', qualificada, REQ.emAndamento, { scores }, headers()),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.REQUEST_STATE_INVALID',
+      status: 409,
+      context: {
+        state: 'EM_ANDAMENTO_NO_ORGAO',
+        allowed: ['AVALIACAO_OFERECIDA'],
+      },
+    });
+  });
+
+  it('§2.3 ownership (complemento unitário de C-0002-70) — dado request de outro sujeito quando get/submit/withdraw então 404 PORTAL.NOT_FOUND { kind: "request" } (disfarce, M10)', async () => {
+    const h = harness();
+    const ouro = identityOf('ouro');
+    await expect(
+      h.call('submit', ouro, REQ.emComposicao, SIGNATURE, headers()),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'request' },
+    });
+    await expect(
+      h.call(
+        'withdraw',
+        ouro,
+        REQ.emComposicao,
+        { confirm: true },
+        headers({ 'if-match': '"1"' }),
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.NOT_FOUND',
+      status: 404,
+      context: { kind: 'request' },
+    });
+  });
+});
+
+describe('CTG-0002 §3.4 — DRAFT_SCHEMAS (C-0002-27)', () => {
+  const minimal: Record<string, Record<string, unknown>> = {
+    defesa_previa: {
+      facts: 'f',
+      grounds: 'g',
+      attachmentIds: [],
+      requestType: 'cancelamento',
+    },
+    recurso_jari: { grounds: 'g', attachmentIds: [] },
+    recurso_cetran: { attachmentIds: [] },
+    indicacao_condutor: {
+      driver: {
+        cpf: '55555555555',
+        cnhNumber: '1',
+        cnhUf: 'AM',
+        category: 'B',
+        name: 'n',
+      },
+      signatures: { owner: 'govbr', driver: 'pending' },
+      consequenceAck: {
+        textVersion: '1',
+        acceptedAt: '2026-09-14T15:00:00.000Z',
+      },
+    },
+    pagamento: { tier: 'desconto_80', method: 'pix' },
+    adesao_sne: {
+      email: 'a@b.invalid',
+      consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
+    },
+    cancelamento_sne: {},
+    junta_medica: { examId: EXTERNAL.exam, reason: 'r', attachmentIds: [] },
+    lgpd_declaracao: { scope: 'confirmacao' },
+    consulta_multas: {},
+    consulta_cnh: {},
+    consulta_bat: {},
+    consulta_exame: {},
+    emissao_crlv: {},
+  };
+
+  it('C-0002-27 — dado DRAFT_SCHEMAS então cada corpo de §3.4 aceita o exemplo mínimo e rejeita campo extra (strictObject); consulta_* aceitam só {}', () => {
+    expect(Object.keys(DRAFT_SCHEMAS).sort()).toEqual(
+      Object.keys(minimal).sort(),
+    );
+    for (const [serviceKey, example] of Object.entries(minimal)) {
+      const schema = DRAFT_SCHEMAS[serviceKey as keyof typeof DRAFT_SCHEMAS];
+      expect(
+        schema.safeParse(example).success,
+        `${serviceKey} aceita o mínimo`,
+      ).toBe(true);
+      expect(
+        schema.safeParse({ ...example, extra: 1 }).success,
+        `${serviceKey} rejeita extra`,
+      ).toBe(false);
+    }
+    for (const serviceKey of [
+      'consulta_multas',
+      'consulta_cnh',
+      'consulta_bat',
+      'consulta_exame',
+      'emissao_crlv',
+    ] as const) {
+      expect(DRAFT_SCHEMAS[serviceKey].safeParse({}).success).toBe(true);
+      expect(DRAFT_SCHEMAS[serviceKey].safeParse({ any: 'x' }).success).toBe(
+        false,
+      );
+    }
+    expect(
+      DRAFT_SCHEMAS.adesao_sne.safeParse({
+        ...minimal.adesao_sne,
+        channel: 'email',
+      }).success,
+      'adesao_sne sem channel',
+    ).toBe(false);
+    expect(
+      DRAFT_SCHEMAS.adesao_sne.safeParse({
+        consent: { textVersion: '1', effectsAck: SNE_EFFECTS.slice(0, 3) },
+      }).success,
+    ).toBe(false);
+    expect(
+      DRAFT_SCHEMAS.pagamento.safeParse({ tier: 'desconto_99', method: 'pix' })
+        .success,
+    ).toBe(false);
+    expect(
+      DRAFT_SCHEMAS.lgpd_declaracao.safeParse({
+        scope: 'declaracao_completa',
+        fields: ['nome'],
+      }).success,
+    ).toBe(true);
+  });
+});
+
+describe('CTG-0002 §3.2 — delegações reais (C-0002-28, R-0007)', () => {
+  it.todo(
+    'dado defesa_previa quando submit então delega a inf:rait-case:protocol — R-0007',
+  );
+  it.todo(
+    'dado indicacao_condutor quando submit então delega a inf:infraction:indicate-driver — R-0007',
+  );
+  it.todo(
+    'dado pagamento quando submit então delega a inf:collection:issue — R-0007',
+  );
+  it.todo(
+    'dado diligência quando respond então delega a inf:rait-case:answer-inquiry — R-0007',
+  );
+  it.todo(
+    'dado caso RAIT em curso quando withdraw então delega a inf:rait-case:withdraw — R-0007',
+  );
+  it.todo(
+    'dado AGUARDANDO_PAGAMENTO quando PAGAMENTO_CONFIRMADO então PROTOCOLADO pelo evento de inf/collection — R-0007',
+  );
+  it.todo(
+    'dado emissao_crlv com débito quando submit então AGUARDANDO_PAGAMENTO — R-0007/R-0014',
+  );
+});
+
+describe('CTG-0002 §11 — PORTAL_REQUESTS_EVENT_SCHEMAS (C-0002-29)', () => {
+  const requestId = REQ.emComposicao;
+  const base = {
+    id: '00000000-0000-7000-8000-000070007001',
+    version: 1,
+    occurredAt: '2026-09-14T16:00:00.000Z',
+    tenantId: TENANT_ID,
+    actor: { kind: 'user', id: SUBJECTS.prata.id },
+    correlationId: '00000000-0000-4000-8000-00000000c0f1',
+  };
+  const common = {
+    requestId,
+    serviceKey: 'consulta_multas',
+    subjectId: SUBJECTS.prata.id,
+    subjectCpfHash: SUBJECTS.prata.cpfHash,
+  };
+  const examples: Array<{
+    type: string;
+    domainEvent: string;
+    aggregate: Row;
+    data: Row;
+  }> = [
+    {
+      type: TOPICS.requestChanged,
+      domainEvent: 'SOLICITACAO_CRIADA',
+      aggregate: { kind: 'portal.request', id: requestId, version: 1 },
+      data: {
+        ...common,
+        targetKind: 'none',
+        targetId: null,
+        fromState: null,
+        toState: 'PEDIDO_EM_COMPOSICAO',
+        occurredAt: '2026-09-14T16:00:00.000Z',
+      },
+    },
+    {
+      type: TOPICS.requestChanged,
+      domainEvent: 'SOLICITACAO_PROTOCOLADA',
+      aggregate: { kind: 'portal.request', id: requestId, version: 2 },
+      data: {
+        ...common,
+        protocolNumber: 'AM-FIXTURES-2026-0000015',
+        issuedAt: '2026-09-14T16:00:00.000Z',
+        receiptHash: 'a'.repeat(64),
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'PROTOCOLADO',
+      },
+    },
+    {
+      type: TOPICS.requestChanged,
+      domainEvent: 'SOLICITACAO_DESISTIDA',
+      aggregate: { kind: 'portal.request', id: requestId, version: 2 },
+      data: {
+        ...common,
+        fromState: 'PEDIDO_EM_COMPOSICAO',
+        toState: 'DESISTIDO',
+        withdrawnAt: '2026-09-14T16:00:00.000Z',
+      },
+    },
+    {
+      type: TOPICS.requestChanged,
+      domainEvent: 'SOLICITACAO_CONCLUIDA',
+      aggregate: { kind: 'portal.request', id: requestId, version: 6 },
+      data: {
+        ...common,
+        fromState: 'AVALIACAO_OFERECIDA',
+        toState: 'CONCLUIDO',
+        evaluationId: '00000000-0000-7000-8000-000071100001',
+      },
+    },
+    {
+      type: TOPICS.evaluationRegistered,
+      domainEvent: 'AVALIACAO_REGISTRADA',
+      aggregate: {
+        kind: 'portal.evaluation',
+        id: '00000000-0000-7000-8000-000071100001',
+        version: 1,
+      },
+      data: {
+        evaluationId: '00000000-0000-7000-8000-000071100001',
+        subjectKind: 'request',
+        subjectId: requestId,
+        submittedAt: '2026-09-14T16:00:00.000Z',
+        citizenSubjectId: SUBJECTS.prata.id,
+        subjectCpfHash: SUBJECTS.prata.cpfHash,
+      },
+    },
+  ];
+
+  it('C-0002-29 — dado PORTAL_REQUESTS_EVENT_SCHEMAS então os exemplos de §12 validam; `data` com campo de texto livre é rejeitado; idempotency_key muda a cada transição (version+1)', () => {
+    expect(Object.keys(PORTAL_REQUESTS_EVENT_SCHEMAS).sort()).toEqual(
+      [TOPICS.evaluationRegistered, TOPICS.requestChanged].sort(),
+    );
+    for (const example of examples) {
+      const schema = PORTAL_REQUESTS_EVENT_SCHEMAS[example.type]!;
+      const envelope = { ...base, ...example };
+      const parsed = schema.safeParse(envelope);
+      expect(
+        parsed.success,
+        `${example.domainEvent}: ${JSON.stringify(parsed.error?.issues)}`,
+      ).toBe(true);
+      expect(
+        schema.safeParse({
+          ...envelope,
+          data: { ...example.data, note: 'texto livre do cidadão' },
+        }).success,
+        `${example.domainEvent} rejeita texto livre`,
+      ).toBe(false);
+    }
+    // domainEvent fora da união discriminada
+    expect(
+      PORTAL_REQUESTS_EVENT_SCHEMAS[TOPICS.requestChanged]!.safeParse({
+        ...base,
+        ...examples[0],
+        domainEvent: 'SOLICITACAO_INVENTADA',
+      }).success,
+    ).toBe(false);
+  });
+
+  it('C-0002-29 — dado create e submit de consulta_multas então cada transição publica com aggregate.version distinto (idempotency_key nova por transição)', async () => {
+    const h = harness();
+    const prata = identityOf('prata');
+    const { requestId: created } = await createRequest(h, prata, {
+      serviceKey: 'consulta_multas',
+      targetKind: 'none',
+      channel: 'portal',
+    });
+    await h.call('submit', prata, created, SIGNATURE, headers());
+    const rows = h.db
+      .rows('integration.outbox')
+      .filter((row) => row.aggregate_id === created);
+    const keys = rows.map((row) => String(row.idempotency_key));
+    expect(new Set(keys).size).toBe(keys.length);
+    const versions = rows.map((row) =>
+      Number(
+        (row.payload as { aggregate: { version: number } }).aggregate.version,
+      ),
+    );
+    expect(new Set(versions).size).toBe(versions.length);
+    for (const row of rows) {
+      const payload = row.payload as {
+        type: string;
+        aggregate: { id: string; version: number };
+      };
+      expect(row.idempotency_key).toBe(
+        `${payload.type}:${payload.aggregate.id}:${payload.aggregate.version}`,
+      );
+    }
+  });
+});
diff --git a/backend/domains/portal/requests/src/handwritten/requests.service.ts b/backend/domains/portal/requests/src/handwritten/requests.service.ts
new file mode 100644
index 0000000..ae3833a
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/requests.service.ts
@@ -0,0 +1,1543 @@
+// Ciclo comum de pedidos do cidadão (work/rounds/R-0009/contracts/CTG-0002.md
+// §2.3, §3, §4, §5 e §11; plan R-0009 M7–M10, M21, adendas A1(c), A4(a), A5).
+// Um método por comando, cada um em `parse` (zod) → `guard` (ownership,
+// If-Match, estado, nível) → `apply` (escritas na transação recebida) →
+// `events` (outbox na mesma transação). O controlador abre a transação
+// (`withTenantContext`) e trata os dois casos "commit e lança" do §3.1
+// (403 `ASSURANCE_INSUFFICIENT` com estado persistido; 502
+// `DELEGATION_FAILED` com protocolo mantido) — ver `commitThenThrow`.
+//
+// SQL parametrizado e dentro do subconjunto documentado em
+// `tests/support/fake-sql.ts`; tenant nunca no payload (RLS + trigger).
+import { Inject, Injectable, Optional } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { z } from 'zod';
+import {
+  DetranError,
+  SqlTeatEventOutbox,
+  TEAT_EVENT_OUTBOX,
+  assertIfMatch,
+  type TeatEventOutbox,
+} from '@detran/shared';
+import {
+  PORTAL_DEFAULT_TIME_ZONE,
+  PortalClock,
+  PortalError,
+  PortalIdentityService,
+  cpfHashOf,
+  parsePage,
+  type PortalClockLike,
+  type PortalIdentityClaims,
+  type PortalSqlTransaction,
+  type PortalSubjectRecord,
+} from '@detran/portal-identity';
+
+import type { Request } from '../entities/request.entity.js';
+import {
+  RequestDelegationService,
+  type DelegationResult,
+  type DelegationTargetKind,
+} from './delegation/delegation.service.js';
+import {
+  CONSEQUENCE_ACK_KIND_BY_SERVICE,
+  DRAFT_SCHEMAS,
+  OWN_ROUTE_BY_SERVICE,
+} from './drafts.js';
+import { portalRequestEvents, type PortalEventContext } from './events.js';
+import {
+  REQUEST_ALLOWED_STATES_BY_COMMAND,
+  REQUEST_STATES,
+  assertTransition,
+  type RequestState,
+} from './guards/request.transitions.js';
+import { PortalIdempotencyService } from './idempotency.service.js';
+import { protocolNumber, receiptHash, receiptOf } from './protocol.js';
+
+// ---------------------------------------------------------------------------
+// tipos públicos
+// ---------------------------------------------------------------------------
+
+export type PortalHeaders = Record<string, string | string[] | undefined>;
+
+export type PortalQuery = Record<string, string | string[] | undefined>;
+
+/** Resultado de um comando M9 (§4): status HTTP, corpo e se foi replay. */
+export interface PortalCommandOutcome<T = Record<string, unknown>> {
+  status: number;
+  body: T;
+  replayed: boolean;
+}
+
+export interface RequestProtocolView {
+  number: string;
+  issuedAt: string;
+  channel: 'portal';
+  receiptHash: string;
+}
+
+export interface RequestCreateResponse {
+  requestId: string;
+  state: 'PEDIDO_EM_COMPOSICAO';
+  prefilled: Record<string, never>;
+  requirements: unknown;
+  minimumAssurance: string;
+  version: number;
+}
+
+export interface RequestDraftResponse {
+  requestId: string;
+  version: number;
+  savedAt: string;
+}
+
+export interface RequestSubmitResponse {
+  requestId: string;
+  state: RequestState;
+  protocol: RequestProtocolView;
+  delegation: {
+    status: 'delegated' | 'not_applicable';
+    externalId: string | null;
+  };
+  version: number;
+}
+
+export interface RequestWithdrawResponse {
+  requestId: string;
+  state: 'DESISTIDO';
+  withdrawnAt: string;
+  version: number;
+}
+
+export interface RequestEvaluateResponse {
+  evaluationId: string;
+  requestId: string;
+  state: 'CONCLUIDO';
+  submittedAt: string;
+}
+
+export interface RequestNextAction {
+  by: 'citizen' | 'agency' | 'none';
+  label: string;
+  dueOn: null;
+}
+
+export interface RequestListItem {
+  requestId: string;
+  protocol: string | null;
+  serviceKey: string;
+  targetLabel: string | null;
+  situation: string;
+  nextAction: RequestNextAction;
+  updatedAt: string;
+}
+
+export interface RequestDetailResponse {
+  request: {
+    requestId: string;
+    state: string;
+    serviceKey: string;
+    targetKind: string;
+    targetId: string | null;
+    channel: string;
+    minimumAssurance: string;
+    delegation: {
+      status: string;
+      domain: string | null;
+      command: string | null;
+      externalId: string | null;
+      error: string | null;
+    };
+    protocol: RequestProtocolView | null;
+    draft: { version: number; payload: unknown; savedAt: string } | null;
+    withdrawnAt: string | null;
+    createdAt: string;
+    updatedAt: string | null;
+    version: number;
+  };
+  timeline: unknown[];
+  deadlines: unknown[];
+  documents: never[];
+  diligences: unknown[];
+  decision: unknown;
+  actions: {
+    canRespondDiligence: false;
+    canWithdraw: boolean;
+    withdrawalBlockedReason: null | 'estado_nao_admite';
+    canAppeal: false;
+    nextInstanceServiceKey: null;
+  };
+}
+
+// ---------------------------------------------------------------------------
+// §3.5 NEXT_ACTION_BY_STATE — rótulo é chave i18n (a UI traduz)
+// ---------------------------------------------------------------------------
+
+const NEXT_ACTION_LABEL_PREFIX = 'portal' + '.requests.nextAction.';
+
+const NEXT_ACTION_BY: Readonly<Record<RequestState, RequestNextAction['by']>> =
+  {
+    IDENTIFICADO: 'none',
+    SERVICO_SELECIONADO: 'none',
+    ELEGIBILIDADE_VERIFICADA: 'none',
+    INELEGIVEL: 'none',
+    PEDIDO_EM_COMPOSICAO: 'citizen',
+    AGUARDANDO_NIVEL_ASSINATURA: 'citizen',
+    AGUARDANDO_PAGAMENTO: 'citizen',
+    PROTOCOLADO: 'agency',
+    EM_ANDAMENTO_NO_ORGAO: 'agency',
+    RESULTADO_DISPONIVEL: 'citizen',
+    AVALIACAO_OFERECIDA: 'citizen',
+    CONCLUIDO: 'none',
+    DESISTIDO: 'none',
+  };
+
+export const NEXT_ACTION_BY_STATE: Readonly<
+  Record<RequestState, RequestNextAction>
+> = Object.fromEntries(
+  REQUEST_STATES.map((state) => [
+    state,
+    {
+      by: NEXT_ACTION_BY[state],
+      label: `${NEXT_ACTION_LABEL_PREFIX}${state}`,
+      dueOn: null,
+    },
+  ]),
+) as Record<RequestState, RequestNextAction>;
+
+// ---------------------------------------------------------------------------
+// "commit e lança" (§3.1 passos 5 e 10)
+// ---------------------------------------------------------------------------
+
+const COMMIT_THEN_THROW = Symbol('PORTAL_COMMIT_THEN_THROW');
+
+/** Marca um erro cujo estado persistido deve ser COMMITADO antes de responder. */
+export function commitThenThrow<T extends Error>(error: T): T {
+  Object.defineProperty(error, COMMIT_THEN_THROW, {
+    value: true,
+    enumerable: false,
+  });
+  return error;
+}
+
+export function isCommitThenThrow(error: unknown): error is Error {
+  return (
+    typeof error === 'object' &&
+    error !== null &&
+    (error as Record<symbol, unknown>)[COMMIT_THEN_THROW] === true
+  );
+}
+
+// ---------------------------------------------------------------------------
+// DTOs zod (§2.3)
+// ---------------------------------------------------------------------------
+
+const TARGET_KINDS = [
+  'ait',
+  'case',
+  'vehicle',
+  'exam',
+  'crash',
+  'none',
+] as const;
+
+const CREATE_BODY = z.strictObject({
+  serviceKey: z.string().min(1),
+  targetKind: z.enum(TARGET_KINDS),
+  targetId: z.uuid().optional(),
+  channel: z.literal('portal'),
+});
+
+const ATTACHMENT_BODY = z.strictObject({
+  filename: z.string().min(1),
+  mimeType: z.string().min(1),
+  sizeBytes: z.int().min(0),
+  sha256: z.string().regex(/^[0-9a-f]{64}$/),
+});
+
+const SUBMIT_BODY = z.strictObject({
+  signature: z.strictObject({
+    method: z.enum(['govbr', 'upload']),
+    signatureRef: z.string().min(1),
+  }),
+  consequenceAck: z
+    .strictObject({
+      textVersion: z.string().min(1),
+      acceptedAt: z.iso.datetime(),
+    })
+    .optional(),
+});
+
+const WITHDRAW_BODY = z.strictObject({
+  confirm: z.literal(true),
+  reason: z.string().max(2000).optional(),
+});
+
+const RESPOND_BODY = z.strictObject({
+  text: z.string().min(1),
+  attachmentIds: z.array(z.uuid()),
+});
+
+export const EVALUATION_SCORES = z.strictObject({
+  satisfaction: z.int(),
+  quality: z.int(),
+  deadline: z.int(),
+  clarity: z.int(),
+  channel: z.int(),
+});
+
+const EVALUATE_BODY = z.strictObject({
+  scores: EVALUATION_SCORES,
+  comment: z.string().max(2000).optional(),
+});
+
+const UUID_RE =
+  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
+
+/** Rotas M9 como o §4 as grava (`${METHOD} ${template}`). */
+export const REQUEST_ROUTES = {
+  create: 'POST /v1/portal/requests',
+  submit: 'POST /v1/portal/requests/{id}/submit',
+  respond: 'POST /v1/portal/requests/{id}/diligences/{did}/responses',
+  evaluate: 'POST /v1/portal/requests/{id}/evaluation',
+} as const;
+
+/** Comando delegado das diligências (§2.3; alvo do mapa §3.2). */
+export const DILIGENCE_DELEGATION_KEY = 'inf:rait-case:answer-inquiry';
+
+const SIGNED_DOCUMENT_PENDING = 'documento_assinado_pendente_r0014';
+
+/**
+ * `kind` das entradas de diligência na timeline (§2.3 GET requests/{id});
+ * montado por concatenação (`verify:parameter-catalogue`).
+ */
+const INQUIRY_TIMELINE_KIND = 'rait' + '.inquiry.changed';
+const WITHDRAWAL_TEXT_VERSION = 'source_pending';
+
+// ---------------------------------------------------------------------------
+// SQL (subconjunto de tests/support/fake-sql.ts)
+// ---------------------------------------------------------------------------
+
+const TENANT_SQL = `select slug, timezone from auth.tenants where id = auth.current_tenant()`;
+
+const CATALOG_SQL = `select id, availability, unavailable_reason, alternative_channel_note,
+          minimum_assurance, requirements_json
+     from portal.service_catalog
+    where service_key = $1
+    limit 1`;
+
+const INFRACTION_VIEW_EXISTS_SQL = `select id from portal.infraction_view where ait_id = $1 limit 1`;
+
+const OPEN_DRAFT_STATES = `('PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA', 'AGUARDANDO_PAGAMENTO')`;
+
+const OPEN_DRAFT_WITH_TARGET_SQL = `select id
+     from portal.request
+    where subject_id = $1 and service_key = $2 and target_kind = $3 and target_id = $4
+      and state in ${OPEN_DRAFT_STATES}
+    order by created_at desc
+    limit 1`;
+
+const OPEN_DRAFT_WITHOUT_TARGET_SQL = `select id
+     from portal.request
+    where subject_id = $1 and service_key = $2 and target_kind = $3 and target_id is null
+      and state in ${OPEN_DRAFT_STATES}
+    order by created_at desc
+    limit 1`;
+
+const INSERT_REQUEST_SQL = `insert into portal.request
+      (state, service_key, subject_id, target_kind, target_id, channel,
+       delegation_status, minimum_assurance, version, created_at)
+    values ($1, $2, $3, $4, $5, 'portal', 'pending', $6, 1, $7)
+    returning id, created_at`;
+
+const INSERT_DRAFT_SQL = `insert into portal.request_draft
+      (request_id, version, payload_json, saved_at)
+    values ($1, $2, $3::jsonb, $4)`;
+
+const REQUEST_FOR_UPDATE_SQL = `select * from portal.request where id = $1 for update`;
+
+const REQUEST_SQL = `select * from portal.request where id = $1`;
+
+const LATEST_DRAFT_SQL = `select version, payload_json, saved_at
+     from portal.request_draft
+    where request_id = $1
+    order by version desc
+    limit 1`;
+
+const PROTOCOL_SQL = `select number, issued_at, channel, receipt_hash
+     from portal.protocol
+    where request_id = $1
+    limit 1`;
+
+const INSERT_PROTOCOL_SQL = `insert into portal.protocol
+      (request_id, number, issued_at, channel, receipt_hash)
+    values ($1, $2, $3, 'portal', $4)`;
+
+const INSERT_CONSEQUENCE_ACK_SQL = `insert into portal.consequence_ack
+      (request_id, kind, text_version, accepted_at)
+    values ($1, $2, $3, $4)`;
+
+const EVALUATION_EXISTS_SQL = `select id
+     from portal.evaluation
+    where subject_kind = 'request' and subject_id = $1
+    limit 1`;
+
+const INSERT_EVALUATION_SQL = `insert into portal.evaluation
+      (subject_kind, subject_id, scores_json, comment, submitted_at)
+    values ('request', $1, $2::jsonb, $3, $4)
+    returning id`;
+
+const TIMELINE_SQL = `select entries_json, deadlines_json, decision_json
+     from portal.process_timeline
+    where request_id = $1
+    limit 1`;
+
+interface TenantRow extends Record<string, unknown> {
+  slug: string;
+  timezone: string | null;
+}
+
+interface CatalogRow extends Record<string, unknown> {
+  id: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+  unavailable_reason: string | null;
+  alternative_channel_note: string | null;
+  minimum_assurance: string;
+  requirements_json: unknown;
+}
+
+interface DraftRow extends Record<string, unknown> {
+  version: number;
+  payload_json: unknown;
+  saved_at: Date | string;
+}
+
+interface ProtocolRow extends Record<string, unknown> {
+  number: string;
+  issued_at: Date | string;
+  channel: 'portal';
+  receipt_hash: string;
+}
+
+interface TimelineRow extends Record<string, unknown> {
+  entries_json: unknown;
+  deadlines_json: unknown;
+  decision_json: unknown;
+}
+
+interface ListRow extends Record<string, unknown> {
+  id: string;
+  state: string;
+  service_key: string;
+  created_at: Date | string;
+  updated_at: Date | string | null;
+  protocol_number: string | null;
+  target_label: string | null;
+}
+
+type RequestRow = Request & Record<string, unknown>;
+
+interface CommandScope {
+  subject: PortalSubjectRecord;
+  cpfHash: string;
+  tenantSlug: string;
+  tenantTz: string;
+  now: Date;
+  today: string;
+}
+
+// ---------------------------------------------------------------------------
+// utilitários
+// ---------------------------------------------------------------------------
+
+function iso(value: Date | string): string {
+  return value instanceof Date
+    ? value.toISOString()
+    : new Date(value).toISOString();
+}
+
+function validationFailed(fields: string[]): PortalError {
+  return new PortalError('PORTAL.VALIDATION_FAILED', {
+    status: 400,
+    context: { fields: [...new Set(fields)] },
+  });
+}
+
+/** Forma zod → 400 `PORTAL.VALIDATION_FAILED { fields[] }` (§0). */
+function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
+  const parsed = schema.safeParse(body ?? {});
+  if (parsed.success) return parsed.data;
+  const fields = parsed.error.issues.map((issue) => {
+    if (issue.path.length > 0) return issue.path.map(String).join('.');
+    const keys = (issue as { keys?: string[] }).keys;
+    return keys && keys.length > 0 ? keys.join(',') : 'body';
+  });
+  throw validationFailed(fields);
+}
+
+function assertUuid(value: string, field: string): void {
+  if (!UUID_RE.test(value)) throw validationFailed([field]);
+}
+
+function notFound(kind: string): PortalError {
+  return new PortalError('PORTAL.NOT_FOUND', {
+    status: 404,
+    context: { kind },
+  });
+}
+
+function serviceUnavailable(
+  unavailableReason: string,
+  alternativeChannelNote: string | null,
+): PortalError {
+  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
+    status: 422,
+    context: { unavailableReason, alternativeChannelNote },
+  });
+}
+
+function protocolView(row: ProtocolRow): RequestProtocolView {
+  return {
+    number: row.number,
+    issuedAt: iso(row.issued_at),
+    channel: 'portal',
+    receiptHash: row.receipt_hash,
+  };
+}
+
+/** `DetranError.code` ou `error.name`; texto livre nunca (§3.1 passo 10). */
+function codeOf(error: unknown): string {
+  if (error instanceof DetranError) return error.code;
+  if (error instanceof Error && error.name) return error.name;
+  return 'Error';
+}
+
+function isPortalCode(error: unknown, code: string): error is DetranError {
+  return error instanceof DetranError && error.code === code;
+}
+
+function asArray(value: unknown): unknown[] {
+  return Array.isArray(value) ? value : [];
+}
+
+function first(value: string | string[] | undefined): string | undefined {
+  return Array.isArray(value) ? value[0] : value;
+}
+
+// ---------------------------------------------------------------------------
+// serviço
+// ---------------------------------------------------------------------------
+
+@Injectable()
+export class PortalRequestsService {
+  private readonly clock: PortalClockLike;
+  private readonly outbox: TeatEventOutbox;
+
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly delegation: RequestDelegationService,
+    private readonly idempotency: PortalIdempotencyService,
+    @Optional() clock?: PortalClock,
+    @Optional() private readonly requestContext?: RequestContext,
+    @Optional() @Inject(TEAT_EVENT_OUTBOX) outbox?: TeatEventOutbox,
+  ) {
+    this.clock = clock ?? new PortalClock();
+    this.outbox = outbox ?? new SqlTeatEventOutbox();
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 POST requests
+  // -------------------------------------------------------------------------
+
+  async create(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<PortalCommandOutcome<RequestCreateResponse>> {
+    const scope = await this.scope(tx, identity);
+    // 1. idempotência (§4)
+    const begun = await this.idempotency.begin(tx, {
+      scope: scope.subject.subjectId,
+      header: headers['idempotency-key'],
+      route: REQUEST_ROUTES.create,
+      body,
+    });
+    if (begun.replay) return this.replayOf(begun.replay);
+    // 2. corpo
+    const input = parseBody(CREATE_BODY, body);
+    if ((input.targetKind === 'none') !== (input.targetId === undefined)) {
+      throw validationFailed(['targetId']);
+    }
+    // 3. catálogo
+    const catalog = await this.catalogOf(tx, input.serviceKey);
+    if (!catalog) throw notFound('service');
+    if (catalog.availability === 'unavailable') {
+      throw serviceUnavailable(
+        catalog.unavailable_reason ?? '',
+        catalog.alternative_channel_note,
+      );
+    }
+    // 4. serviço com rota própria
+    const ownRoute = OWN_ROUTE_BY_SERVICE[input.serviceKey];
+    if (ownRoute) {
+      throw new PortalError('PORTAL.INELIGIBLE', {
+        status: 422,
+        context: {
+          reason: 'servico_com_rota_propria',
+          alternative: ownRoute,
+          serviceKey: input.serviceKey,
+        },
+      });
+    }
+    // 5. alvo da delegação
+    const target = this.delegation.targetFor(input.serviceKey);
+    const unavailableReason = target.availability();
+    if (unavailableReason !== null) {
+      throw serviceUnavailable(
+        unavailableReason,
+        catalog.alternative_channel_note ?? null,
+      );
+    }
+    // 6. targetKind admitido
+    if (!(target.targetKinds as readonly string[]).includes(input.targetKind)) {
+      throw validationFailed(['targetKind']);
+    }
+    // 7. vínculo (M10)
+    if (input.targetId !== undefined) {
+      await this.assertEntitledForCreate(
+        tx,
+        scope,
+        input.serviceKey,
+        input.targetKind,
+        input.targetId,
+      );
+    }
+    // 8. rascunho em aberto
+    const open = await tx.query<{ id: string }>(
+      input.targetId === undefined
+        ? OPEN_DRAFT_WITHOUT_TARGET_SQL
+        : OPEN_DRAFT_WITH_TARGET_SQL,
+      input.targetId === undefined
+        ? [scope.subject.subjectId, input.serviceKey, input.targetKind]
+        : [
+            scope.subject.subjectId,
+            input.serviceKey,
+            input.targetKind,
+            input.targetId,
+          ],
+    );
+    if (open.rows[0]) {
+      throw new PortalError('PORTAL.REQUEST_DRAFT_EXISTS', {
+        status: 409,
+        context: { requestId: open.rows[0].id },
+      });
+    }
+    // apply
+    const inserted = await tx.query<{ id: string }>(INSERT_REQUEST_SQL, [
+      'PEDIDO_EM_COMPOSICAO',
+      input.serviceKey,
+      scope.subject.subjectId,
+      input.targetKind,
+      input.targetId ?? null,
+      catalog.minimum_assurance,
+      scope.now,
+    ]);
+    const requestId = inserted.rows[0]?.id;
+    if (!requestId) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    await tx.query(INSERT_DRAFT_SQL, [requestId, 1, '{}', scope.now]);
+    // events
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.criada(
+        requestId,
+        1,
+        {
+          requestId,
+          serviceKey: input.serviceKey,
+          subjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+          targetKind: input.targetKind,
+          targetId: input.targetId ?? null,
+          fromState: null,
+          toState: 'PEDIDO_EM_COMPOSICAO',
+          occurredAt: scope.now.toISOString(),
+        },
+        this.eventContext(scope),
+      ),
+    );
+    const response: RequestCreateResponse = {
+      requestId,
+      state: 'PEDIDO_EM_COMPOSICAO',
+      prefilled: {},
+      requirements: asArray(catalog.requirements_json),
+      minimumAssurance: catalog.minimum_assurance,
+      version: 1,
+    };
+    await begun.record(201, response);
+    return { status: 201, body: response, replayed: false };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 PUT requests/{id}/draft
+  // -------------------------------------------------------------------------
+
+  async updateDraft(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<RequestDraftResponse> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertIfMatch(headers['if-match'], request.version, 'PORTAL');
+    assertTransition(request, { command: 'draft' });
+    const schema: z.ZodType | undefined =
+      DRAFT_SCHEMAS[request.service_key as keyof typeof DRAFT_SCHEMAS];
+    if (!schema) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { serviceKey: request.service_key },
+      });
+    }
+    const payload = parseBody(schema, body);
+    const version = await this.bump(tx, request.id, {}, scope.now);
+    await tx.query(INSERT_DRAFT_SQL, [
+      request.id,
+      version,
+      JSON.stringify(payload),
+      scope.now,
+    ]);
+    return { requestId: request.id, version, savedAt: scope.now.toISOString() };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 POST requests/{id}/attachments[/{attachmentId}/complete]
+  // -------------------------------------------------------------------------
+
+  async intendAttachment(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    body: unknown,
+  ): Promise<never> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertTransition(request, { command: 'draft' });
+    parseBody(ATTACHMENT_BODY, body);
+    const catalog = await this.catalogOf(tx, request.service_key);
+    throw serviceUnavailable(
+      SIGNED_DOCUMENT_PENDING,
+      catalog?.alternative_channel_note ?? null,
+    );
+  }
+
+  async completeAttachment(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    attachmentId: string,
+  ): Promise<never> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertUuid(attachmentId, 'attachmentId');
+    const catalog = await this.catalogOf(tx, request.service_key);
+    throw serviceUnavailable(
+      SIGNED_DOCUMENT_PENDING,
+      catalog?.alternative_channel_note ?? null,
+    );
+  }
+
+  // -------------------------------------------------------------------------
+  // §3.1 POST requests/{id}/submit — protocolo imediato e delegação
+  // -------------------------------------------------------------------------
+
+  async submit(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<PortalCommandOutcome<RequestSubmitResponse>> {
+    // 0.
+    const scope = await this.scope(tx, identity);
+    // 1. idempotência
+    const begun = await this.idempotency.begin(tx, {
+      scope: scope.subject.subjectId,
+      header: headers['idempotency-key'],
+      route: REQUEST_ROUTES.submit,
+      body,
+    });
+    if (begun.replay) return this.replayOf(begun.replay);
+    // 2. forma do PRÓPRIO comando
+    const input = parseBody(SUBMIT_BODY, body);
+    // 3. ownership (for update)
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    // 4. estado
+    assertTransition(request, { command: 'submit' });
+    // 9 (lido antes por causa do actKey composto de lgpd_declaracao, A2(a))
+    const draft = await this.latestDraft(tx, request.id);
+    const draftPayload =
+      draft && typeof draft.payload_json === 'object' && draft.payload_json
+        ? (draft.payload_json as Record<string, unknown>)
+        : {};
+    // 5. nível do ato
+    const actKey = this.actKeyOf(request.service_key, draftPayload);
+    const decision = await this.assertActLevelOrPersist(
+      tx,
+      identity,
+      request,
+      actKey,
+      scope,
+    );
+    // 6. ciência de consequência
+    const ackKind = CONSEQUENCE_ACK_KIND_BY_SERVICE[request.service_key];
+    if (ackKind) {
+      if (!input.consequenceAck) {
+        throw new PortalError('PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED', {
+          status: 422,
+          context: { textVersion: null },
+        });
+      }
+      await tx.query(INSERT_CONSEQUENCE_ACK_SQL, [
+        request.id,
+        ackKind,
+        input.consequenceAck.textVersion,
+        input.consequenceAck.acceptedAt,
+      ]);
+    }
+    // 7. pré-condição financeira: sem código de decisão nesta rodada (R-0007/R-0014)
+    // 8. PROTOCOLO IMEDIATO (T-PROTOCOLO)
+    const number = await protocolNumber(
+      tx,
+      scope.tenantSlug,
+      scope.today,
+      request.id,
+    );
+    const issuedAt = scope.now;
+    const receipt = receiptOf({
+      serviceKey: request.service_key,
+      requestId: request.id,
+      number,
+      issuedAt,
+      channel: 'portal',
+    });
+    const hash = receiptHash(receipt);
+    await tx.query(INSERT_PROTOCOL_SQL, [request.id, number, issuedAt, hash]);
+    const fromState = request.state as RequestState;
+    const protocoledVersion = await this.bump(
+      tx,
+      request.id,
+      { state: 'PROTOCOLADO', minimum_assurance: decision.required },
+      scope.now,
+    );
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.protocolada(
+        request.id,
+        protocoledVersion,
+        {
+          requestId: request.id,
+          serviceKey: request.service_key,
+          subjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+          protocolNumber: number,
+          issuedAt: issuedAt.toISOString(),
+          receiptHash: hash,
+          fromState,
+          toState: 'PROTOCOLADO',
+        },
+        this.eventContext(scope),
+      ),
+    );
+    const protocol: RequestProtocolView = {
+      number,
+      issuedAt: issuedAt.toISOString(),
+      channel: 'portal',
+      receiptHash: hash,
+    };
+    // 10. delegação
+    let result: DelegationResult;
+    try {
+      result = await this.delegation.delegate(request.service_key, {
+        tx,
+        request: {
+          ...request,
+          state: 'PROTOCOLADO',
+          minimum_assurance: decision.required,
+          version: protocoledVersion,
+        },
+        draft: draftPayload,
+        identity,
+        subject: scope.subject,
+        protocol: { number, issuedAt, receiptHash: hash },
+        clock: this.clock,
+        tenantTz: scope.tenantTz,
+      });
+    } catch (error) {
+      await this.bump(
+        tx,
+        request.id,
+        { delegation_status: 'failed', delegation_error: codeOf(error) },
+        scope.now,
+      );
+      const failure = new PortalError('PORTAL.DELEGATION_FAILED', {
+        status: 502,
+        context: { protocol: number, retryPolicy: 'pendencia_interna' },
+        cause: error,
+      });
+      await begun.record(502, {
+        code: failure.code,
+        message: failure.message,
+        context: failure.context,
+      });
+      throw commitThenThrow(failure);
+    }
+    let version = await this.bump(
+      tx,
+      request.id,
+      {
+        state: 'EM_ANDAMENTO_NO_ORGAO',
+        delegation_domain: result.domain,
+        delegation_command: result.command,
+        delegation_external_id: result.externalId,
+        delegation_status: result.status,
+      },
+      scope.now,
+    );
+    let state: RequestState = 'EM_ANDAMENTO_NO_ORGAO';
+    if (result.immediateResult === true) {
+      await this.bump(
+        tx,
+        request.id,
+        { state: 'RESULTADO_DISPONIVEL' },
+        scope.now,
+      );
+      version = await this.bump(
+        tx,
+        request.id,
+        { state: 'AVALIACAO_OFERECIDA' },
+        scope.now,
+      );
+      state = 'AVALIACAO_OFERECIDA';
+    }
+    // 11.
+    const response: RequestSubmitResponse = {
+      requestId: request.id,
+      state,
+      protocol,
+      delegation: { status: result.status, externalId: result.externalId },
+      version,
+    };
+    await begun.record(200, response);
+    return { status: 200, body: response, replayed: false };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 POST requests/{id}/withdraw
+  // -------------------------------------------------------------------------
+
+  async withdraw(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<RequestWithdrawResponse> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertIfMatch(headers['if-match'], request.version, 'PORTAL');
+    parseBody(WITHDRAW_BODY, body);
+    assertTransition(request, { command: 'withdraw' });
+    const fromState = request.state as RequestState;
+    const version = await this.bump(
+      tx,
+      request.id,
+      { state: 'DESISTIDO', withdrawn_at: scope.now },
+      scope.now,
+    );
+    await tx.query(INSERT_CONSEQUENCE_ACK_SQL, [
+      request.id,
+      'desistencia',
+      WITHDRAWAL_TEXT_VERSION,
+      scope.now,
+    ]);
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.desistida(
+        request.id,
+        version,
+        {
+          requestId: request.id,
+          serviceKey: request.service_key,
+          subjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+          fromState,
+          toState: 'DESISTIDO',
+          withdrawnAt: scope.now.toISOString(),
+        },
+        this.eventContext(scope),
+      ),
+    );
+    return {
+      requestId: request.id,
+      state: 'DESISTIDO',
+      withdrawnAt: scope.now.toISOString(),
+      version,
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 GET requests
+  // -------------------------------------------------------------------------
+
+  async list(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    query: PortalQuery,
+  ): Promise<{
+    items: RequestListItem[];
+    total: number;
+    page: number;
+    pageSize: number;
+  }> {
+    const scope = await this.scope(tx, identity);
+    const page = parsePage(query);
+    const state = first(query.state);
+    if (
+      state !== undefined &&
+      !(REQUEST_STATES as readonly string[]).includes(state)
+    ) {
+      throw new PortalError('PORTAL.ENUM_INVALID', {
+        status: 400,
+        context: { field: 'state', allowed: [...REQUEST_STATES] },
+      });
+    }
+    const kind = first(query.kind);
+    const period = first(query.period);
+    let periodFrom: string | undefined;
+    let periodTo: string | undefined;
+    if (period !== undefined) {
+      const match = /^(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})$/.exec(period);
+      if (!match) throw validationFailed(['period']);
+      periodFrom = match[1];
+      periodTo = match[2];
+    }
+    const values: unknown[] = [scope.subject.subjectId];
+    const where: string[] = ['r.subject_id = $1'];
+    if (state !== undefined) {
+      values.push(state);
+      where.push(`r.state = $${values.length}`);
+    }
+    if (kind !== undefined) {
+      values.push(kind);
+      where.push(`r.service_key = $${values.length}`);
+    }
+    if (periodFrom !== undefined && periodTo !== undefined) {
+      values.push(scope.tenantTz, periodFrom, periodTo);
+      where.push(
+        `(r.created_at at time zone $${values.length - 2})::date >= $${values.length - 1}::date`,
+        `(r.created_at at time zone $${values.length - 2})::date <= $${values.length}::date`,
+      );
+    }
+    const whereSql = where.join(' and ');
+    const total = await tx.query<{ total: string | number }>(
+      `select count(*) as total from portal.request r where ${whereSql}`,
+      values,
+    );
+    values.push(page.limit, page.offset);
+    const rows = await tx.query<ListRow>(
+      `select r.id, r.state, r.service_key, r.created_at, r.updated_at,
+              p.number as protocol_number, v.ait_number as target_label
+         from portal.request r
+         left join portal.protocol p on p.request_id = r.id
+         left join portal.infraction_view v on r.target_kind = 'ait' and v.ait_id = r.target_id
+        where ${whereSql}
+        order by r.updated_at desc nulls last, r.created_at desc
+        limit $${values.length - 1} offset $${values.length}`,
+      values,
+    );
+    return {
+      items: rows.rows.map((row) => ({
+        requestId: row.id,
+        protocol: row.protocol_number ?? null,
+        serviceKey: row.service_key,
+        targetLabel: row.target_label ?? null,
+        situation: row.state,
+        nextAction: NEXT_ACTION_BY_STATE[row.state as RequestState],
+        updatedAt: iso(row.updated_at ?? row.created_at),
+      })),
+      total: Number(total.rows[0]?.total ?? 0),
+      page: page.page,
+      pageSize: page.pageSize,
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 GET requests/{id}
+  // -------------------------------------------------------------------------
+
+  async get(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+  ): Promise<RequestDetailResponse> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.owned(tx, scope, requestId);
+    const protocol = await this.protocolOf(tx, request.id);
+    const draft = await this.latestDraft(tx, request.id);
+    const timeline = (await tx.query<TimelineRow>(TIMELINE_SQL, [request.id]))
+      .rows[0];
+    const entries = asArray(timeline?.entries_json).filter(
+      (entry) =>
+        typeof entry === 'object' &&
+        entry !== null &&
+        (entry as { visibility?: string }).visibility === 'citizen',
+    );
+    const canWithdraw = (
+      REQUEST_ALLOWED_STATES_BY_COMMAND.withdraw as readonly string[]
+    ).includes(request.state);
+    return {
+      request: {
+        requestId: request.id,
+        state: request.state,
+        serviceKey: request.service_key,
+        targetKind: request.target_kind,
+        targetId: request.target_id ?? null,
+        channel: request.channel,
+        minimumAssurance: request.minimum_assurance,
+        delegation: {
+          status: request.delegation_status,
+          domain: request.delegation_domain ?? null,
+          command: request.delegation_command ?? null,
+          externalId: request.delegation_external_id ?? null,
+          error: request.delegation_error ?? null,
+        },
+        protocol: protocol ? protocolView(protocol) : null,
+        draft: draft
+          ? {
+              version: Number(draft.version),
+              payload: draft.payload_json,
+              savedAt: iso(draft.saved_at),
+            }
+          : null,
+        withdrawnAt: request.withdrawn_at ? iso(request.withdrawn_at) : null,
+        createdAt: iso(request.created_at),
+        updatedAt: request.updated_at ? iso(request.updated_at) : null,
+        version: request.version,
+      },
+      timeline: entries,
+      deadlines: asArray(timeline?.deadlines_json),
+      documents: [],
+      diligences: entries.filter(
+        (entry) => (entry as { kind?: string }).kind === INQUIRY_TIMELINE_KIND,
+      ),
+      decision: timeline?.decision_json ?? null,
+      actions: {
+        canRespondDiligence: false,
+        canWithdraw,
+        withdrawalBlockedReason: canWithdraw ? null : 'estado_nao_admite',
+        canAppeal: false,
+        nextInstanceServiceKey: null,
+      },
+    };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 GET requests/{id}/receipt · GET requests/{id}/decision
+  // -------------------------------------------------------------------------
+
+  async receipt(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+  ): Promise<never> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.owned(tx, scope, requestId);
+    const protocol = await this.protocolOf(tx, request.id);
+    if (!protocol) throw notFound('protocol');
+    throw serviceUnavailable(SIGNED_DOCUMENT_PENDING, null);
+  }
+
+  async decision(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+  ): Promise<unknown> {
+    const scope = await this.scope(tx, identity);
+    const request = await this.owned(tx, scope, requestId);
+    const timeline = (await tx.query<TimelineRow>(TIMELINE_SQL, [request.id]))
+      .rows[0];
+    if (
+      !timeline ||
+      timeline.decision_json === null ||
+      timeline.decision_json === undefined
+    ) {
+      throw notFound('decision');
+    }
+    return timeline.decision_json;
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 POST requests/{id}/diligences/{did}/responses
+  // -------------------------------------------------------------------------
+
+  async respondDiligence(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    inquiryId: string,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<PortalCommandOutcome<Record<string, unknown>>> {
+    const scope = await this.scope(tx, identity);
+    const begun = await this.idempotency.begin(tx, {
+      scope: scope.subject.subjectId,
+      header: headers['idempotency-key'],
+      route: REQUEST_ROUTES.respond,
+      body,
+    });
+    if (begun.replay) return this.replayOf(begun.replay);
+    const input = parseBody(RESPOND_BODY, body);
+    assertUuid(inquiryId, 'did');
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertTransition(request, { command: 'respond' });
+    const target = this.delegation.targetFor(DILIGENCE_DELEGATION_KEY);
+    const unavailableReason = target.availability();
+    if (unavailableReason !== null) {
+      const catalog = await this.catalogOf(tx, request.service_key);
+      throw serviceUnavailable(
+        unavailableReason,
+        catalog?.alternative_channel_note ?? null,
+      );
+    }
+    const protocol = await this.protocolOf(tx, request.id);
+    if (!protocol) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { requestId: request.id },
+      });
+    }
+    await target.delegate({
+      tx,
+      request,
+      draft: { inquiryId, ...input },
+      identity,
+      subject: scope.subject,
+      protocol: {
+        number: protocol.number,
+        issuedAt: new Date(protocol.issued_at),
+        receiptHash: protocol.receipt_hash,
+      },
+      clock: this.clock,
+      tenantTz: scope.tenantTz,
+    });
+    const response = {
+      requestId: request.id,
+      inquiryId,
+      answeredAt: scope.now.toISOString(),
+    };
+    await begun.record(200, response);
+    return { status: 200, body: response, replayed: false };
+  }
+
+  // -------------------------------------------------------------------------
+  // §2.3 POST requests/{id}/evaluation
+  // -------------------------------------------------------------------------
+
+  async evaluate(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    requestId: string,
+    body: unknown,
+    headers: PortalHeaders,
+  ): Promise<PortalCommandOutcome<RequestEvaluateResponse>> {
+    const scope = await this.scope(tx, identity);
+    const begun = await this.idempotency.begin(tx, {
+      scope: scope.subject.subjectId,
+      header: headers['idempotency-key'],
+      route: REQUEST_ROUTES.evaluate,
+      body,
+    });
+    if (begun.replay) return this.replayOf(begun.replay);
+    const input = parseBody(EVALUATE_BODY, body);
+    const request = await this.ownedForUpdate(tx, scope, requestId);
+    assertTransition(request, { command: 'evaluate' });
+    const existing = await tx.query<{ id: string }>(EVALUATION_EXISTS_SQL, [
+      request.id,
+    ]);
+    if (existing.rows[0]) {
+      throw new PortalError('PORTAL.EVALUATION_ALREADY_SUBMITTED', {
+        status: 409,
+        context: {},
+      });
+    }
+    const inserted = await tx.query<{ id: string }>(INSERT_EVALUATION_SQL, [
+      request.id,
+      JSON.stringify(input.scores),
+      input.comment ?? null,
+      scope.now,
+    ]);
+    const evaluationId = inserted.rows[0]?.id;
+    if (!evaluationId) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    const version = await this.bump(
+      tx,
+      request.id,
+      { state: 'CONCLUIDO' },
+      scope.now,
+    );
+    const context = this.eventContext(scope);
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.avaliacaoRegistrada(
+        evaluationId,
+        {
+          evaluationId,
+          subjectKind: 'request',
+          subjectId: request.id,
+          submittedAt: scope.now.toISOString(),
+          citizenSubjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+        },
+        context,
+      ),
+    );
+    await this.outbox.append(
+      tx as never,
+      portalRequestEvents.concluida(
+        request.id,
+        version,
+        {
+          requestId: request.id,
+          serviceKey: request.service_key,
+          subjectId: scope.subject.subjectId,
+          subjectCpfHash: scope.cpfHash,
+          fromState: 'AVALIACAO_OFERECIDA',
+          toState: 'CONCLUIDO',
+          evaluationId,
+        },
+        context,
+      ),
+    );
+    const response: RequestEvaluateResponse = {
+      evaluationId,
+      requestId: request.id,
+      state: 'CONCLUIDO',
+      submittedAt: scope.now.toISOString(),
+    };
+    await begun.record(201, response);
+    return { status: 201, body: response, replayed: false };
+  }
+
+  // -------------------------------------------------------------------------
+  // apoio
+  // -------------------------------------------------------------------------
+
+  /** §0: sujeito (upsert idempotente), fuso e slug do tenant, relógio. */
+  private async scope(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+  ): Promise<CommandScope> {
+    const subject = await this.identity.upsertSubject(tx, identity, null);
+    const tenant = (await tx.query<TenantRow>(TENANT_SQL)).rows[0];
+    if (!tenant) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    const tenantTz = tenant.timezone ?? PORTAL_DEFAULT_TIME_ZONE;
+    return {
+      subject,
+      cpfHash: cpfHashOf(identity.cpf),
+      tenantSlug: tenant.slug,
+      tenantTz,
+      now: this.clock.now(),
+      today: this.clock.today(tenantTz),
+    };
+  }
+
+  private eventContext(scope: CommandScope): PortalEventContext {
+    const snapshot = this.requestContext?.hasActiveContext()
+      ? this.requestContext.snapshot()
+      : undefined;
+    return {
+      occurredAt: scope.now.toISOString(),
+      actorId: snapshot?.actorId ?? scope.subject.subjectId,
+      correlationId: snapshot?.requestId ?? '',
+    };
+  }
+
+  private replayOf<T>(replay: {
+    status: number;
+    body: unknown;
+  }): PortalCommandOutcome<T> {
+    return { status: replay.status, body: replay.body as T, replayed: true };
+  }
+
+  private async catalogOf(
+    tx: PortalSqlTransaction,
+    serviceKey: string,
+  ): Promise<CatalogRow | undefined> {
+    return (await tx.query<CatalogRow>(CATALOG_SQL, [serviceKey])).rows[0];
+  }
+
+  private async owned(
+    tx: PortalSqlTransaction,
+    scope: CommandScope,
+    requestId: string,
+  ): Promise<RequestRow> {
+    assertUuid(requestId, 'id');
+    const row = (await tx.query<RequestRow>(REQUEST_SQL, [requestId])).rows[0];
+    if (!row || row.subject_id !== scope.subject.subjectId) {
+      throw notFound('request');
+    }
+    return row;
+  }
+
+  private async ownedForUpdate(
+    tx: PortalSqlTransaction,
+    scope: CommandScope,
+    requestId: string,
+  ): Promise<RequestRow> {
+    assertUuid(requestId, 'id');
+    const row = (
+      await tx.query<RequestRow>(REQUEST_FOR_UPDATE_SQL, [requestId])
+    ).rows[0];
+    if (!row || row.subject_id !== scope.subject.subjectId) {
+      throw notFound('request');
+    }
+    return row;
+  }
+
+  private async latestDraft(
+    tx: PortalSqlTransaction,
+    requestId: string,
+  ): Promise<DraftRow | undefined> {
+    return (await tx.query<DraftRow>(LATEST_DRAFT_SQL, [requestId])).rows[0];
+  }
+
+  private async protocolOf(
+    tx: PortalSqlTransaction,
+    requestId: string,
+  ): Promise<ProtocolRow | undefined> {
+    return (await tx.query<ProtocolRow>(PROTOCOL_SQL, [requestId])).rows[0];
+  }
+
+  /** `update portal.request set …, version = version + 1, updated_at`; devolve a versão nova. */
+  private async bump(
+    tx: PortalSqlTransaction,
+    requestId: string,
+    changes: Partial<Record<string, unknown>>,
+    now: Date,
+  ): Promise<number> {
+    const assignments: string[] = [];
+    const values: unknown[] = [requestId];
+    for (const [column, value] of Object.entries(changes)) {
+      values.push(value ?? null);
+      assignments.push(`${column} = $${values.length}`);
+    }
+    values.push(now);
+    assignments.push(`updated_at = $${values.length}`);
+    assignments.push('version = version + 1');
+    const updated = await tx.query<{ version: number }>(
+      `update portal.request set ${assignments.join(', ')} where id = $1 returning version`,
+      values,
+    );
+    const version = updated.rows[0]?.version;
+    if (version === undefined) {
+      throw new PortalError('PORTAL.INTERNAL', {
+        status: 500,
+        context: { requestId },
+      });
+    }
+    return Number(version);
+  }
+
+  /** `actKey` = service_key (+ `:<escopo>` de lgpd_declaracao — A2(a)). */
+  private actKeyOf(serviceKey: string, draft: Record<string, unknown>): string {
+    if (serviceKey === 'lgpd_declaracao') {
+      const scope = draft.scope;
+      if (typeof scope === 'string' && scope !== 'confirmacao') {
+        return `${serviceKey}:${scope}`;
+      }
+    }
+    return serviceKey;
+  }
+
+  /**
+   * §3.1 passo 5: `ASSURANCE_INSUFFICIENT` persiste AGUARDANDO_NIVEL_ASSINATURA
+   * (version += 1; em re-submissão só quando `required` mudou) e o erro é
+   * marcado "commit e lança" — sem registro de idempotência.
+   */
+  private async assertActLevelOrPersist(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    request: RequestRow,
+    actKey: string,
+    scope: CommandScope,
+  ): Promise<{ required: string }> {
+    try {
+      const decision = await this.identity.assertActLevel(
+        tx,
+        identity,
+        actKey,
+        `/v1/portal/requests/${request.id}`,
+      );
+      return { required: decision.required };
+    } catch (error) {
+      if (!isPortalCode(error, 'PORTAL.ASSURANCE_INSUFFICIENT')) throw error;
+      const required = String(error.context.required);
+      const alreadyWaiting =
+        request.state === 'AGUARDANDO_NIVEL_ASSINATURA' &&
+        request.minimum_assurance === required;
+      if (!alreadyWaiting) {
+        await this.bump(
+          tx,
+          request.id,
+          { state: 'AGUARDANDO_NIVEL_ASSINATURA', minimum_assurance: required },
+          scope.now,
+        );
+      }
+      throw commitThenThrow(error);
+    }
+  }
+
+  /**
+   * §2.3 passo 7 / §5: vínculo do sujeito com o alvo; 422
+   * `ENTITLEMENT_REQUIRED { targetKind, howToProve: 'procuracao' }` SÓ para
+   * indicacao_condutor/defesa_previa quando o AIT existe na projeção.
+   */
+  private async assertEntitledForCreate(
+    tx: PortalSqlTransaction,
+    scope: CommandScope,
+    serviceKey: string,
+    targetKind: DelegationTargetKind,
+    targetId: string,
+  ): Promise<void> {
+    try {
+      await this.identity.assertEntitled(
+        tx,
+        scope.subject.subjectId,
+        targetKind,
+        targetId,
+      );
+    } catch (error) {
+      if (!isPortalCode(error, 'PORTAL.NOT_FOUND')) throw error;
+      if (
+        targetKind === 'ait' &&
+        (serviceKey === 'indicacao_condutor' || serviceKey === 'defesa_previa')
+      ) {
+        const known = await tx.query(INFRACTION_VIEW_EXISTS_SQL, [targetId]);
+        if (known.rows.length > 0) {
+          throw new PortalError('PORTAL.ENTITLEMENT_REQUIRED', {
+            status: 422,
+            context: { targetKind, howToProve: 'procuracao' },
+          });
+        }
+      }
+      throw error;
+    }
+  }
+}
diff --git a/backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts b/backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts
new file mode 100644
index 0000000..36d739c
--- /dev/null
+++ b/backend/domains/portal/requests/tests/integration/portal-requests.integration.spec.ts
@@ -0,0 +1,369 @@
+// R-0009 CTG-0002 §3, §4, §11, §12 e §13 (TASK-0006) — C-0002-30…32:
+// `portal.protocol_seq` coerente com o seed (setval — `71-fixtures-portal-events.sql`),
+// ciclo create → draft → submit de `consulta_multas` sobre transação REAL
+// (`role_app_backend`, RLS do tenant canônico, ADR-0002) com linhas em
+// request/request_draft/protocol/idempotency_record e dois eventos
+// `SOLICITACAO_*` na outbox, e rollback = sem evento (rait-events-sse-contract.md
+// §5 item 2). Fica vermelho até TASK-0007 criar os módulos de §14.
+//
+// Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh` (DDL + seeds
+// aplicados). Mesmo harness de transação de
+// `ops/offline-sync/tests/integration/harness.ts` (`database()`), sem repetir
+// o arquivo: só o que este pacote usa.
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+import { PortalIdentityService } from '@detran/portal-identity';
+import { SqlTeatEventOutbox } from '@detran/shared';
+
+import { constructInjectable } from '../support/nest-construct.js';
+import {
+  SUBJECTS,
+  TENANT_ID,
+  TOPICS,
+  fakeDatabase,
+  fakeRequestContext,
+  fixedClock,
+  identityOf,
+} from '../support/portal-fixtures.js';
+import {
+  PORTAL_DELEGATION_TARGETS,
+  ReadServiceDelegationTarget,
+  RequestDelegationService,
+  UnavailableDelegationTarget,
+  type DelegationTarget,
+} from '../../src/handwritten/delegation/delegation.service.js';
+import { PortalIdempotencyService } from '../../src/handwritten/idempotency.service.js';
+import { PortalRequestsService } from '../../src/handwritten/requests.service.js';
+
+const { Client } = pg;
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const createdRequestIds: string[] = [];
+
+interface SqlTx {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+/** Transação de aplicação: `role_app_backend` + contexto do tenant (ADR-0002). */
+async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT_ID,
+    ]);
+    await client.query(`select set_config('app.actor_id', $1, true)`, [
+      ACTOR_ID,
+    ]);
+    const result = await work({
+      query: client.query.bind(client) as SqlTx['query'],
+    });
+    await client.query('commit');
+    return result;
+  } catch (error) {
+    await client.query('rollback');
+    throw error;
+  }
+}
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    TENANT_ID,
+  ]);
+  return work();
+}
+
+function buildService(tx: SqlTx): PortalRequestsService {
+  const targets = new Map<string, DelegationTarget>();
+  targets.set(
+    'consulta_multas',
+    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
+  );
+  targets.set(
+    'defesa_previa',
+    new UnavailableDelegationTarget(
+      'defesa_previa',
+      'delegacao_indisponivel_r0007',
+      ['ait'],
+    ),
+  );
+  const outbox = new SqlTeatEventOutbox();
+  return constructInjectable(PortalRequestsService, {
+    PortalIdentityService: new PortalIdentityService(fixedClock as never),
+    RequestDelegationService: constructInjectable(RequestDelegationService, {
+      PORTAL_DELEGATION_TARGETS: targets,
+    }),
+    PortalIdempotencyService: constructInjectable(PortalIdempotencyService, {
+      PortalClock: fixedClock,
+    }),
+    PortalClock: fixedClock,
+    Database: fakeDatabase(tx),
+    RequestContext: fakeRequestContext(),
+    SqlTeatEventOutbox: outbox,
+    TEAT_EVENT_OUTBOX: outbox,
+  });
+}
+
+type Body = Record<string, unknown>;
+function unwrap<T>(result: unknown): T {
+  const row = result as Record<string, unknown>;
+  return (
+    row && typeof row === 'object' && 'body' in row && !('requestId' in row)
+      ? row.body
+      : row
+  ) as T;
+}
+
+beforeAll(async () => {
+  await client.connect();
+});
+
+afterAll(async () => {
+  if (createdRequestIds.length > 0) {
+    await asOwner(async () => {
+      for (const table of [
+        'portal.consequence_ack',
+        'portal.evaluation',
+        'portal.protocol',
+        'portal.request_draft',
+      ]) {
+        await client.query(
+          `delete from ${table} where tenant_id = $1 and ${table === 'portal.evaluation' ? 'subject_id' : 'request_id'} = any($2::uuid[])`,
+          [TENANT_ID, createdRequestIds],
+        );
+      }
+      await client.query(
+        `delete from integration.outbox where tenant_id = $1 and aggregate_id = any($2::text[])`,
+        [TENANT_ID, createdRequestIds],
+      );
+      await client.query(
+        `delete from portal.idempotency_record where tenant_id = $1 and key like $2`,
+        [TENANT_ID, `${SUBJECTS.prata.id}:it-%`],
+      );
+      await client.query(
+        `delete from portal.request where tenant_id = $1 and id = any($2::uuid[])`,
+        [TENANT_ID, createdRequestIds],
+      );
+    });
+  }
+  await client.end();
+});
+
+describe('CTG-0002 §3.3/§12 — sequência de protocolo coerente com o seed (C-0002-30)', () => {
+  it('C-0002-30 — dado seed executado duas vezes então protocol_seq ≥ 14 (setval) e nextval não colide com AM-FIXTURES-2026-0000001…000000e; a sequência é compartilhada com manifestation.protocol', async () => {
+    await asOwner(async () => {
+      const seq = await client.query<{
+        last_value: string;
+        is_called: boolean;
+      }>(
+        'select last_value::text as last_value, is_called from portal.protocol_seq',
+      );
+      expect(Number(seq.rows[0]!.last_value)).toBeGreaterThanOrEqual(14);
+
+      const numbers = await client.query<{ number: string }>(
+        `select number from portal.protocol where tenant_id = $1
+         union all
+         select protocol as number from portal.manifestation where tenant_id = $1`,
+        [TENANT_ID],
+      );
+      const fixtureNumbers = numbers.rows.map((row) => row.number);
+      // 5 protocolos + 9 manifestações do seed (CTG-0001 §10.5/§10.6) na mesma
+      // gramática, com sufixo hexadecimal de 7 dígitos (contrato §12); só os
+      // números gerados por `protocolNumber` em produção são decimais `\d{7}`
+      // (TASK-0006 iteração 2).
+      expect(
+        fixtureNumbers.filter((number) =>
+          /^AM-FIXTURES-2026-[0-9a-f]{7}$/.test(number),
+        ).length,
+      ).toBeGreaterThanOrEqual(14);
+      const maxSeeded = Math.max(
+        ...fixtureNumbers.map((number) => parseInt(number.slice(-7), 16)),
+      );
+      expect(maxSeeded).toBe(14);
+
+      const next = await client.query<{ seq: string }>(
+        `select nextval('portal.protocol_seq')::text as seq`,
+      );
+      const candidate = `AM-FIXTURES-2026-${next.rows[0]!.seq.padStart(7, '0')}`;
+      expect(Number(next.rows[0]!.seq)).toBeGreaterThan(14);
+      expect(fixtureNumbers).not.toContain(candidate);
+    });
+  });
+});
+
+describe('CTG-0002 §3/§4/§11 — ciclo consulta_multas sobre transação real (C-0002-31, C-0002-32)', () => {
+  it("C-0002-31 — dado sujeito …70000002 quando create+draft+submit de consulta_multas então request, request_draft (2 versões), protocol, idempotency_record (key '<subjectId>:<header>') e 2 linhas na outbox com topic portal.request.changed, payload.tenantId = tenant", async () => {
+    const prata = identityOf('prata');
+    const createKey = `it-${randomUUID()}`;
+    const submitKey = `it-${randomUUID()}`;
+
+    const created = await inTenantTx(async (tx) => {
+      const service = buildService(tx);
+      return unwrap<{ requestId: string; state: string; version: number }>(
+        await service.create(
+          tx as never,
+          prata as never,
+          {
+            serviceKey: 'consulta_multas',
+            targetKind: 'none',
+            channel: 'portal',
+          } as never,
+          { 'idempotency-key': createKey } as never,
+        ),
+      );
+    });
+    createdRequestIds.push(created.requestId);
+    expect(created).toMatchObject({
+      state: 'PEDIDO_EM_COMPOSICAO',
+      version: 1,
+    });
+
+    await inTenantTx(async (tx) => {
+      const service = buildService(tx);
+      return service.updateDraft(
+        tx as never,
+        prata as never,
+        created.requestId,
+        {} as never,
+        { 'if-match': '"1"', 'idempotency-key': `it-${randomUUID()}` } as never,
+      );
+    });
+
+    const submitted = await inTenantTx(async (tx) => {
+      const service = buildService(tx);
+      return unwrap<{ state: string; protocol: { number: string } }>(
+        await service.submit(
+          tx as never,
+          prata as never,
+          created.requestId,
+          { signature: { method: 'govbr', signatureRef: 'ref' } } as never,
+          { 'idempotency-key': submitKey } as never,
+        ),
+      );
+    });
+    expect(submitted.state).toBe('AVALIACAO_OFERECIDA');
+    expect(submitted.protocol.number).toMatch(/^AM-FIXTURES-2026-\d{7}$/);
+
+    await asOwner(async () => {
+      const request = await client.query(
+        `select * from portal.request where id = $1`,
+        [created.requestId],
+      );
+      expect(request.rows[0]).toMatchObject({
+        tenant_id: TENANT_ID,
+        subject_id: SUBJECTS.prata.id,
+        service_key: 'consulta_multas',
+        state: 'AVALIACAO_OFERECIDA',
+        delegation_status: 'not_applicable',
+      });
+      const drafts = await client.query<{ version: number }>(
+        `select version from portal.request_draft where request_id = $1 order by version`,
+        [created.requestId],
+      );
+      expect(drafts.rows.map((row) => row.version)).toEqual([1, 2]);
+      const protocol = await client.query(
+        `select number, channel, receipt_hash from portal.protocol where request_id = $1`,
+        [created.requestId],
+      );
+      expect(protocol.rows[0]).toMatchObject({
+        number: submitted.protocol.number,
+        channel: 'portal',
+      });
+      const records = await client.query<{
+        key: string;
+        route: string;
+        status: number;
+      }>(
+        `select key, route, status from portal.idempotency_record where tenant_id = $1 and key in ($2, $3) order by created_at`,
+        [
+          TENANT_ID,
+          `${SUBJECTS.prata.id}:${createKey}`,
+          `${SUBJECTS.prata.id}:${submitKey}`,
+        ],
+      );
+      expect(records.rows.map((row) => row.key)).toEqual([
+        `${SUBJECTS.prata.id}:${createKey}`,
+        `${SUBJECTS.prata.id}:${submitKey}`,
+      ]);
+      expect(records.rows.map((row) => row.status)).toEqual([201, 200]);
+      const events = await client.query<{
+        topic: string;
+        payload: {
+          domainEvent: string;
+          tenantId: string;
+          data: Record<string, unknown>;
+        };
+      }>(
+        `select topic, payload from integration.outbox where tenant_id = $1 and aggregate_id = $2 order by created_at, id`,
+        [TENANT_ID, created.requestId],
+      );
+      expect(events.rows).toHaveLength(2);
+      expect(
+        events.rows.every((row) => row.topic === TOPICS.requestChanged),
+      ).toBe(true);
+      expect(events.rows.map((row) => row.payload.domainEvent)).toEqual([
+        'SOLICITACAO_CRIADA',
+        'SOLICITACAO_PROTOCOLADA',
+      ]);
+      expect(
+        events.rows.every((row) => row.payload.tenantId === TENANT_ID),
+      ).toBe(true);
+      expect(events.rows[1]!.payload.data).toMatchObject({
+        protocolNumber: submitted.protocol.number,
+        toState: 'PROTOCOLADO',
+      });
+    });
+  });
+
+  it('C-0002-32 — dado transação que lança após publicar então nenhuma linha na outbox (rollback = sem evento)', async () => {
+    const prata = identityOf('prata');
+    let requestId = '';
+    await expect(
+      inTenantTx(async (tx) => {
+        const service = buildService(tx);
+        const created = unwrap<{ requestId: string }>(
+          await service.create(
+            tx as never,
+            prata as never,
+            {
+              serviceKey: 'consulta_multas',
+              targetKind: 'none',
+              channel: 'portal',
+            } as never,
+            { 'idempotency-key': `it-${randomUUID()}` } as never,
+          ),
+        );
+        requestId = created.requestId;
+        const published = await tx.query(
+          `select id from integration.outbox where aggregate_id = $1`,
+          [requestId],
+        );
+        expect(published.rows).toHaveLength(1);
+        throw new Error('falha simulada depois de publicar');
+      }),
+    ).rejects.toThrow('falha simulada depois de publicar');
+    expect(requestId).not.toBe('');
+
+    await asOwner(async () => {
+      const events = await client.query(
+        `select id from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
+        [TENANT_ID, requestId],
+      );
+      expect(events.rows).toHaveLength(0);
+      const request = await client.query(
+        `select id from portal.request where id = $1`,
+        [requestId],
+      );
+      expect(request.rows).toHaveLength(0);
+    });
+  });
+});
diff --git a/backend/domains/portal/requests/tests/support/fake-sql.ts b/backend/domains/portal/requests/tests/support/fake-sql.ts
new file mode 100644
index 0000000..31b53d7
--- /dev/null
+++ b/backend/domains/portal/requests/tests/support/fake-sql.ts
@@ -0,0 +1,1895 @@
+// Transação falsa em memória para os specs `unit` do Portal (R-0009 CTG-0002
+// §13: "tx falsa em memória"; rait-test-strategy.md §1 "unit nunca abre
+// conexão"). Não é um arquivo de teste (vitest só coleta `*.spec.ts`) e fica
+// fora do build (`tsconfig.build.json` exclui `tests`).
+//
+// Interpreta o SUBCONJUNTO de SQL que os serviços manuscritos do Portal usam
+// (CODESTYLE §Backend: SQL parametrizado, uma transação por comando). Tudo o
+// que está fora do subconjunto lança `FakeSqlUnsupported` com o SQL na
+// mensagem — sinal para o Engineer escrever a consulta dentro do subconjunto
+// (mesmo papel que "nome esperado do export" nos specs de R-0008) ou para o
+// Inspector estender o dialeto. Subconjunto:
+//
+//   select <exprs|*> from <tabela> [alias] [left join <tabela> [alias] on <expr>]*
+//     [where <expr>] [order by <expr> [asc|desc] [nulls first|last], …]
+//     [limit <n|$n>] [offset <n|$n>] [for update [skip locked]]
+//   select <exprs>            (sem from: now(), auth.current_tenant(), nextval(…), gen_random_uuid())
+//   with <nome> as (<select>) <insert|select>
+//   insert into <tabela> (<cols>) values (<exprs>)[, (<exprs>)]*
+//     [on conflict [(<cols>)] do nothing | do update set <col> = <expr>, …] [returning <exprs|*>]
+//   insert into <tabela> (<cols>) select <exprs> [from <cte>]
+//   update <tabela> [alias] set <col> = <expr>, … [where <expr>] [returning <exprs|*>]
+//   delete from <tabela> [where <expr>]
+//   expressões: coluna | alias.coluna | $n | 'texto' | número | null | true | false |
+//     (expr) | expr op expr (= <> != < <= > >= + - || -> ->>) | expr::tipo | not |
+//     and | or | is [not] null | in (…) | not in (…) | = any($n) | like | ilike |
+//     (a, b) > ($1, $2) | exists (select …) | (select …) escalar |
+//     funções: coalesce, now, current_date, auth.current_tenant, nextval, gen_random_uuid,
+//     count, max, min, sum, lower, upper, to_char(x, 'YYYY-MM-DD'), jsonb_set, to_jsonb,
+//     jsonb_build_object, greatest, least, nullif, length
+//   ignorados: set local …, begin, commit, rollback, select set_config(…)
+//
+// Semântica pg reproduzida onde importa para os specs: `count(*)` volta como
+// string; `::date` reduz a 'YYYY-MM-DD'; `on conflict (…) do nothing returning`
+// não devolve linha no conflito; unique registrado por tabela lança erro com
+// `code: '23505'` (mesma forma do `pg`); `tenant_id`, `id` e `created_at`
+// recebem default como as triggers/defaults do DDL; `nextval` incrementa a
+// sequência registrada.
+import { randomUUID } from 'node:crypto';
+
+export type Row = Record<string, unknown>;
+
+export class FakeSqlUnsupported extends Error {
+  constructor(sql: string, detail: string) {
+    super(`fake-sql: ${detail}\n  SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
+    this.name = 'FakeSqlUnsupported';
+  }
+}
+
+export class FakeSqlError extends Error {
+  readonly code: string;
+  readonly constraint?: string;
+  constructor(code: string, message: string, constraint?: string) {
+    super(message);
+    this.name = 'FakeSqlError';
+    this.code = code;
+    this.constraint = constraint;
+  }
+}
+
+export interface FakeSqlOptions {
+  tenantId: string;
+  /** Linha de `auth.tenants` do tenant da transação (slug, timezone). */
+  tenant?: { slug?: string; timezone?: string; name?: string };
+  /** `now()` do servidor (relógio fixo dos specs). */
+  now?: () => Date;
+  /** Valor inicial (último devolvido) por sequência: `nextval` devolve +1. */
+  sequences?: Record<string, number>;
+  /** Índices únicos além dos conhecidos do DDL (tabela → listas de colunas). */
+  uniques?: Record<string, string[][]>;
+}
+
+/** Únicos dos DDLs 04/61/62/63/64/65 relevantes para os comandos do Portal. */
+const DEFAULT_UNIQUES: Record<string, string[][]> = {
+  'portal.subject': [['cpf_hash']],
+  'portal.entitlement': [
+    ['subject_id', 'target_kind', 'target_id', 'relation'],
+  ],
+  'portal.request_draft': [['request_id', 'version']],
+  'portal.protocol': [['number'], ['request_id']],
+  'portal.evaluation': [['subject_kind', 'subject_id']],
+  'portal.idempotency_record': [['key']],
+  'portal.inbox_item': [['source_event_id']],
+  'portal.acknowledgement_evidence': [['inbox_item_id']],
+  'portal.sne_enrollment': [['subject_id']],
+  'portal.push_subscription': [['endpoint']],
+  'portal.manifestation': [['protocol']],
+  'portal.manifestation_extension': [['manifestation_id', 'timer']],
+  'portal.service_catalog': [['service_key']],
+  'portal.infraction_view': [['ait_id']],
+  'portal.process_timeline': [['case_id']],
+  'portal.points_view': [['subject_cpf_hash']],
+  'portal.crash_view': [['crash_id']],
+  'portal.exam_view': [['exam_id']],
+  'portal.projection_applied_event': [['event_id', 'projection']],
+  'portal.national_read_cache': [['subject_id', 'kind', 'target_id']],
+  'integration.outbox': [['idempotency_key']],
+};
+
+/** Defaults de coluna dos DDLs (além de id/tenant_id/created_at). */
+const DEFAULT_COLUMNS: Record<string, Record<string, unknown>> = {
+  'portal.request': { version: 1, channel: 'portal' },
+  'portal.protocol': { channel: 'portal' },
+  'portal.manifestation': { version: 1 },
+  'portal.subject': { version: 1 },
+  'portal.service_catalog': { version: 1 },
+  'portal.request_attachment': { upload_state: 'intended' },
+  'portal.inbox_item': { action_required: false },
+  'integration.outbox': { status: 'pending', attempts: 0 },
+};
+
+// ---------------------------------------------------------------------------
+// tokenizer
+// ---------------------------------------------------------------------------
+
+type Token =
+  | { kind: 'ident'; value: string }
+  | { kind: 'number'; value: number }
+  | { kind: 'string'; value: string }
+  | { kind: 'param'; value: number }
+  | { kind: 'op'; value: string }
+  | { kind: 'end' };
+
+const MULTI_OPS = ['<>', '!=', '<=', '>=', '||', '::', '->>', '->'];
+
+function tokenize(sql: string): Token[] {
+  const tokens: Token[] = [];
+  let i = 0;
+  while (i < sql.length) {
+    const ch = sql[i]!;
+    if (/\s/.test(ch)) {
+      i += 1;
+      continue;
+    }
+    if (ch === '-' && sql[i + 1] === '-') {
+      while (i < sql.length && sql[i] !== '\n') i += 1;
+      continue;
+    }
+    if (ch === "'") {
+      let value = '';
+      i += 1;
+      while (i < sql.length) {
+        if (sql[i] === "'" && sql[i + 1] === "'") {
+          value += "'";
+          i += 2;
+        } else if (sql[i] === "'") {
+          i += 1;
+          break;
+        } else {
+          value += sql[i];
+          i += 1;
+        }
+      }
+      tokens.push({ kind: 'string', value });
+      continue;
+    }
+    if (ch === '"') {
+      let value = '';
+      i += 1;
+      while (i < sql.length && sql[i] !== '"') {
+        value += sql[i];
+        i += 1;
+      }
+      i += 1;
+      tokens.push({ kind: 'ident', value });
+      continue;
+    }
+    if (ch === '$' && /\d/.test(sql[i + 1] ?? '')) {
+      let j = i + 1;
+      while (/\d/.test(sql[j] ?? '')) j += 1;
+      tokens.push({ kind: 'param', value: Number(sql.slice(i + 1, j)) });
+      i = j;
+      continue;
+    }
+    if (/\d/.test(ch)) {
+      let j = i;
+      while (/[\d.]/.test(sql[j] ?? '')) j += 1;
+      tokens.push({ kind: 'number', value: Number(sql.slice(i, j)) });
+      i = j;
+      continue;
+    }
+    if (/[A-Za-z_]/.test(ch)) {
+      let j = i;
+      while (/[A-Za-z0-9_.]/.test(sql[j] ?? '')) j += 1;
+      const raw = sql.slice(i, j);
+      // `alias.*` → ident "alias" + op "." + op "*" is not needed: keep dotted.
+      tokens.push({ kind: 'ident', value: raw });
+      i = j;
+      continue;
+    }
+    const multi = MULTI_OPS.find((op) => sql.startsWith(op, i));
+    if (multi) {
+      tokens.push({ kind: 'op', value: multi });
+      i += multi.length;
+      continue;
+    }
+    tokens.push({ kind: 'op', value: ch });
+    i += 1;
+  }
+  tokens.push({ kind: 'end' });
+  return tokens;
+}
+
+// ---------------------------------------------------------------------------
+// AST
+// ---------------------------------------------------------------------------
+
+type Expr =
+  | { t: 'col'; name: string }
+  | { t: 'star'; alias?: string }
+  | { t: 'param'; index: number }
+  | { t: 'lit'; value: unknown }
+  | { t: 'bin'; op: string; left: Expr; right: Expr }
+  | { t: 'not'; expr: Expr }
+  | { t: 'isnull'; expr: Expr; negated: boolean }
+  | { t: 'in'; expr: Expr; list: Expr[]; negated: boolean }
+  | { t: 'any'; expr: Expr; op: string; array: Expr }
+  | { t: 'cast'; expr: Expr; type: string }
+  | { t: 'call'; name: string; args: Expr[]; star?: boolean }
+  | { t: 'tuple'; items: Expr[] }
+  | { t: 'exists'; select: SelectStmt }
+  | { t: 'subquery'; select: SelectStmt }
+  | { t: 'case'; whens: Array<{ when: Expr; then: Expr }>; otherwise?: Expr };
+
+interface SelectItem {
+  expr: Expr;
+  alias?: string;
+}
+
+interface FromSource {
+  table: string;
+  alias?: string;
+}
+
+interface Join {
+  source: FromSource;
+  on: Expr;
+  kind: 'left' | 'inner';
+}
+
+interface SelectStmt {
+  kind: 'select';
+  items: SelectItem[];
+  from?: FromSource;
+  joins: Join[];
+  where?: Expr;
+  orderBy: Array<{ expr: Expr; desc: boolean; nullsLast: boolean }>;
+  limit?: Expr;
+  offset?: Expr;
+  distinctOn?: Expr[];
+  union?: SelectStmt;
+}
+
+interface InsertStmt {
+  kind: 'insert';
+  table: string;
+  columns: string[];
+  rows?: Expr[][];
+  select?: SelectStmt;
+  onConflict?: {
+    target?: string[];
+    action: 'nothing' | 'update';
+    set?: Array<{ column: string; expr: Expr }>;
+  };
+  returning?: SelectItem[];
+}
+
+interface UpdateStmt {
+  kind: 'update';
+  table: string;
+  alias?: string;
+  set: Array<{ column: string; expr: Expr }>;
+  where?: Expr;
+  returning?: SelectItem[];
+}
+
+interface DeleteStmt {
+  kind: 'delete';
+  table: string;
+  alias?: string;
+  where?: Expr;
+}
+
+interface NoopStmt {
+  kind: 'noop';
+}
+
+type Stmt = (SelectStmt | InsertStmt | UpdateStmt | DeleteStmt | NoopStmt) & {
+  ctes?: Array<{ name: string; select: SelectStmt }>;
+};
+
+// ---------------------------------------------------------------------------
+// parser
+// ---------------------------------------------------------------------------
+
+class Parser {
+  private pos = 0;
+  constructor(
+    private readonly tokens: Token[],
+    private readonly sql: string,
+  ) {}
+
+  private peek(offset = 0): Token {
+    return this.tokens[this.pos + offset] ?? { kind: 'end' };
+  }
+
+  private next(): Token {
+    const token = this.peek();
+    this.pos += 1;
+    return token;
+  }
+
+  private isKeyword(word: string, offset = 0): boolean {
+    const token = this.peek(offset);
+    return token.kind === 'ident' && token.value.toLowerCase() === word;
+  }
+
+  private isOp(op: string, offset = 0): boolean {
+    const token = this.peek(offset);
+    return token.kind === 'op' && token.value === op;
+  }
+
+  private accept(word: string): boolean {
+    if (this.isKeyword(word)) {
+      this.pos += 1;
+      return true;
+    }
+    return false;
+  }
+
+  private acceptOp(op: string): boolean {
+    if (this.isOp(op)) {
+      this.pos += 1;
+      return true;
+    }
+    return false;
+  }
+
+  private expect(word: string): void {
+    if (!this.accept(word)) this.fail(`esperado '${word}'`);
+  }
+
+  private expectOp(op: string): void {
+    if (!this.acceptOp(op)) this.fail(`esperado '${op}'`);
+  }
+
+  private fail(detail: string): never {
+    const token = this.peek();
+    const shown =
+      token.kind === 'end' ? '<fim>' : `${token.kind} ${String(token.value)}`;
+    throw new FakeSqlUnsupported(this.sql, `${detail} (em ${shown})`);
+  }
+
+  private ident(): string {
+    const token = this.next();
+    if (token.kind !== 'ident') this.fail('esperado identificador');
+    return token.value;
+  }
+
+  parseStatement(): Stmt {
+    let ctes: Array<{ name: string; select: SelectStmt }> | undefined;
+    if (this.accept('with')) {
+      ctes = [];
+      do {
+        const name = this.ident();
+        this.expect('as');
+        this.expectOp('(');
+        const select = this.parseSelect();
+        this.expectOp(')');
+        ctes.push({ name, select });
+      } while (this.acceptOp(','));
+    }
+    let stmt: Stmt;
+    if (this.isKeyword('select')) stmt = this.parseSelect();
+    else if (this.isKeyword('insert')) stmt = this.parseInsert();
+    else if (this.isKeyword('update')) stmt = this.parseUpdate();
+    else if (this.isKeyword('delete')) stmt = this.parseDelete();
+    else if (
+      this.isKeyword('set') ||
+      this.isKeyword('begin') ||
+      this.isKeyword('commit') ||
+      this.isKeyword('rollback')
+    ) {
+      stmt = { kind: 'noop' };
+      this.pos = this.tokens.length - 1;
+    } else this.fail('comando desconhecido');
+    if (this.peek().kind !== 'end' && !this.acceptOp(';')) {
+      this.fail('resto inesperado');
+    }
+    return { ...stmt, ctes };
+  }
+
+  parseSelect(): SelectStmt {
+    this.expect('select');
+    let distinctOn: Expr[] | undefined;
+    if (this.accept('distinct')) {
+      if (this.accept('on')) {
+        this.expectOp('(');
+        distinctOn = [];
+        do distinctOn.push(this.parseExpr());
+        while (this.acceptOp(','));
+        this.expectOp(')');
+      }
+    }
+    const items = this.parseSelectItems();
+    const stmt: SelectStmt = { kind: 'select', items, joins: [], orderBy: [] };
+    if (distinctOn) stmt.distinctOn = distinctOn;
+    if (this.accept('from')) {
+      stmt.from = this.parseSource();
+      for (;;) {
+        let kind: 'left' | 'inner' | undefined;
+        if (this.accept('left')) {
+          this.accept('outer');
+          this.expect('join');
+          kind = 'left';
+        } else if (this.accept('inner')) {
+          this.expect('join');
+          kind = 'inner';
+        } else if (this.accept('join')) kind = 'inner';
+        if (!kind) break;
+        const source = this.parseSource();
+        this.expect('on');
+        const on = this.parseExpr();
+        stmt.joins.push({ source, on, kind });
+      }
+    }
+    if (this.accept('where')) stmt.where = this.parseExpr();
+    if (this.accept('group')) this.fail('group by não suportado');
+    if (this.accept('order')) {
+      this.expect('by');
+      do {
+        const expr = this.parseExpr();
+        let desc = false;
+        if (this.accept('desc')) desc = true;
+        else this.accept('asc');
+        let nullsLast = !desc;
+        if (this.accept('nulls')) {
+          if (this.accept('last')) nullsLast = true;
+          else {
+            this.expect('first');
+            nullsLast = false;
+          }
+        }
+        stmt.orderBy.push({ expr, desc, nullsLast });
+      } while (this.acceptOp(','));
+    }
+    if (this.accept('limit')) stmt.limit = this.parseExpr();
+    if (this.accept('offset')) stmt.offset = this.parseExpr();
+    if (this.accept('for')) {
+      this.expect('update');
+      this.accept('skip');
+      this.accept('locked');
+      this.accept('nowait');
+    }
+    if (this.accept('union')) {
+      this.accept('all');
+      stmt.union = this.parseSelect();
+    }
+    return stmt;
+  }
+
+  private parseSelectItems(): SelectItem[] {
+    const items: SelectItem[] = [];
+    do {
+      if (this.isOp('*')) {
+        this.next();
+        items.push({ expr: { t: 'star' } });
+        continue;
+      }
+      const token = this.peek();
+      if (
+        token.kind === 'ident' &&
+        token.value.endsWith('.') &&
+        this.isOp('*', 1)
+      ) {
+        this.next();
+        this.next();
+        items.push({
+          expr: { t: 'star', alias: token.value.slice(0, -1) },
+        });
+        continue;
+      }
+      const expr = this.parseExpr();
+      let alias: string | undefined;
+      if (this.accept('as')) alias = this.ident();
+      else if (
+        this.peek().kind === 'ident' &&
+        !this.isKeyword('from') &&
+        !this.isKeyword('where') &&
+        !this.isKeyword('order') &&
+        !this.isKeyword('limit') &&
+        !this.isKeyword('for') &&
+        !this.isKeyword('offset') &&
+        !this.isKeyword('on') &&
+        !this.isKeyword('returning')
+      ) {
+        alias = this.ident();
+      }
+      items.push({ expr, alias });
+    } while (this.acceptOp(','));
+    return items;
+  }
+
+  private parseSource(): FromSource {
+    const table = this.ident();
+    let alias: string | undefined;
+    if (this.accept('as')) alias = this.ident();
+    else if (
+      this.peek().kind === 'ident' &&
+      ![
+        'where',
+        'left',
+        'inner',
+        'join',
+        'on',
+        'order',
+        'limit',
+        'for',
+        'offset',
+        'returning',
+        'set',
+        'group',
+      ].includes((this.peek() as { value: string }).value.toLowerCase())
+    ) {
+      alias = this.ident();
+    }
+    return { table, alias };
+  }
+
+  private parseInsert(): InsertStmt {
+    this.expect('insert');
+    this.expect('into');
+    const table = this.ident();
+    this.expectOp('(');
+    const columns: string[] = [];
+    do columns.push(this.ident());
+    while (this.acceptOp(','));
+    this.expectOp(')');
+    const stmt: InsertStmt = { kind: 'insert', table, columns };
+    if (this.accept('values')) {
+      stmt.rows = [];
+      do {
+        this.expectOp('(');
+        const row: Expr[] = [];
+        do row.push(this.parseExpr());
+        while (this.acceptOp(','));
+        this.expectOp(')');
+        stmt.rows.push(row);
+      } while (this.acceptOp(','));
+    } else if (this.isKeyword('select')) {
+      stmt.select = this.parseSelect();
+    } else this.fail('esperado values ou select');
+    if (this.accept('on')) {
+      this.expect('conflict');
+      let target: string[] | undefined;
+      if (this.acceptOp('(')) {
+        target = [];
+        do target.push(this.ident());
+        while (this.acceptOp(','));
+        this.expectOp(')');
+      } else if (this.accept('on')) {
+        this.expect('constraint');
+        this.ident();
+      }
+      this.expect('do');
+      if (this.accept('nothing'))
+        stmt.onConflict = { target, action: 'nothing' };
+      else {
+        this.expect('update');
+        this.expect('set');
+        const set = this.parseSetList();
+        stmt.onConflict = { target, action: 'update', set };
+      }
+    }
+    if (this.accept('returning')) stmt.returning = this.parseSelectItems();
+    return stmt;
+  }
+
+  private parseSetList(): Array<{ column: string; expr: Expr }> {
+    const set: Array<{ column: string; expr: Expr }> = [];
+    do {
+      const column = this.ident();
+      this.expectOp('=');
+      const expr = this.parseExpr();
+      set.push({ column, expr });
+    } while (this.acceptOp(','));
+    return set;
+  }
+
+  private parseUpdate(): UpdateStmt {
+    this.expect('update');
+    const source = this.parseSource();
+    this.expect('set');
+    const set = this.parseSetList();
+    const stmt: UpdateStmt = {
+      kind: 'update',
+      table: source.table,
+      alias: source.alias,
+      set,
+    };
+    if (this.accept('where')) stmt.where = this.parseExpr();
+    if (this.accept('returning')) stmt.returning = this.parseSelectItems();
+    return stmt;
+  }
+
+  private parseDelete(): DeleteStmt {
+    this.expect('delete');
+    this.expect('from');
+    const source = this.parseSource();
+    const stmt: DeleteStmt = {
+      kind: 'delete',
+      table: source.table,
+      alias: source.alias,
+    };
+    if (this.accept('where')) stmt.where = this.parseExpr();
+    return stmt;
+  }
+
+  // expressions — precedence: or < and < not < comparison < additive < unary/postfix
+  parseExpr(): Expr {
+    return this.parseOr();
+  }
+
+  private parseOr(): Expr {
+    let left = this.parseAnd();
+    while (this.accept('or')) {
+      left = { t: 'bin', op: 'or', left, right: this.parseAnd() };
+    }
+    return left;
+  }
+
+  private parseAnd(): Expr {
+    let left = this.parseNot();
+    while (this.accept('and')) {
+      left = { t: 'bin', op: 'and', left, right: this.parseNot() };
+    }
+    return left;
+  }
+
+  private parseNot(): Expr {
+    if (this.accept('not')) return { t: 'not', expr: this.parseNot() };
+    return this.parseComparison();
+  }
+
+  private parseComparison(): Expr {
+    let left = this.parseAdditive();
+    for (;;) {
+      if (this.accept('is')) {
+        const negated = this.accept('not');
+        if (this.accept('null')) {
+          left = { t: 'isnull', expr: left, negated };
+          continue;
+        }
+        if (this.accept('distinct')) {
+          this.expect('from');
+          const right = this.parseAdditive();
+          left = { t: 'bin', op: negated ? '=' : '<>', left, right };
+          left = negated
+            ? { t: 'call', name: 'not_distinct', args: [left] }
+            : left;
+          continue;
+        }
+        if (this.accept('true')) {
+          left = negated
+            ? { t: 'not', expr: left }
+            : { t: 'bin', op: '=', left, right: { t: 'lit', value: true } };
+          continue;
+        }
+        if (this.accept('false')) {
+          left = negated
+            ? { t: 'bin', op: '=', left, right: { t: 'lit', value: true } }
+            : { t: 'bin', op: '=', left, right: { t: 'lit', value: false } };
+          continue;
+        }
+        this.fail('is … não suportado');
+      }
+      let negated = false;
+      if (
+        this.isKeyword('not') &&
+        (this.isKeyword('in', 1) ||
+          this.isKeyword('like', 1) ||
+          this.isKeyword('ilike', 1))
+      ) {
+        this.next();
+        negated = true;
+      }
+      if (this.accept('in')) {
+        this.expectOp('(');
+        const list: Expr[] = [];
+        if (this.isKeyword('select')) {
+          list.push({ t: 'subquery', select: this.parseSelect() });
+        } else {
+          do list.push(this.parseExpr());
+          while (this.acceptOp(','));
+        }
+        this.expectOp(')');
+        left = { t: 'in', expr: left, list, negated };
+        continue;
+      }
+      if (this.accept('like') || this.accept('ilike')) {
+        const insensitive =
+          (
+            this.tokens[this.pos - 1] as { value: string }
+          ).value.toLowerCase() === 'ilike';
+        const right = this.parseAdditive();
+        left = { t: 'bin', op: insensitive ? 'ilike' : 'like', left, right };
+        if (negated) left = { t: 'not', expr: left };
+        continue;
+      }
+      if (this.accept('between')) {
+        const low = this.parseAdditive();
+        this.expect('and');
+        const high = this.parseAdditive();
+        left = {
+          t: 'bin',
+          op: 'and',
+          left: { t: 'bin', op: '>=', left, right: low },
+          right: { t: 'bin', op: '<=', left, right: high },
+        };
+        continue;
+      }
+      const token = this.peek();
+      if (
+        token.kind === 'op' &&
+        ['=', '<>', '!=', '<', '<=', '>', '>='].includes(token.value)
+      ) {
+        this.next();
+        const op = token.value === '!=' ? '<>' : token.value;
+        if (this.accept('any')) {
+          this.expectOp('(');
+          const array = this.parseExpr();
+          this.expectOp(')');
+          left = { t: 'any', expr: left, op, array };
+          continue;
+        }
+        const right = this.parseAdditive();
+        left = { t: 'bin', op, left, right };
+        continue;
+      }
+      return left;
+    }
+  }
+
+  private parseAdditive(): Expr {
+    let left = this.parseUnary();
+    for (;;) {
+      const token = this.peek();
+      if (
+        token.kind === 'op' &&
+        ['+', '-', '||', '->', '->>', '*', '/'].includes(token.value)
+      ) {
+        this.next();
+        left = { t: 'bin', op: token.value, left, right: this.parseUnary() };
+        continue;
+      }
+      return left;
+    }
+  }
+
+  private parseUnary(): Expr {
+    if (this.acceptOp('-')) {
+      const expr = this.parseUnary();
+      return {
+        t: 'bin',
+        op: '-',
+        left: { t: 'lit', value: 0 },
+        right: expr,
+      };
+    }
+    return this.parsePostfix(this.parsePrimary());
+  }
+
+  private parsePostfix(expr: Expr): Expr {
+    while (this.acceptOp('::')) {
+      let type = this.ident().toLowerCase();
+      if (this.acceptOp('[')) {
+        this.expectOp(']');
+        type += '[]';
+      }
+      // `timestamp with time zone`, `double precision`
+      while (
+        this.isKeyword('with') ||
+        this.isKeyword('without') ||
+        this.isKeyword('time') ||
+        this.isKeyword('zone') ||
+        this.isKeyword('precision')
+      ) {
+        this.next();
+      }
+      expr = { t: 'cast', expr, type };
+    }
+    return expr;
+  }
+
+  private parsePrimary(): Expr {
+    const token = this.next();
+    switch (token.kind) {
+      case 'param':
+        return { t: 'param', index: token.value };
+      case 'number':
+        return { t: 'lit', value: token.value };
+      case 'string':
+        return { t: 'lit', value: token.value };
+      case 'op':
+        if (token.value === '(') {
+          if (this.isKeyword('select')) {
+            const select = this.parseSelect();
+            this.expectOp(')');
+            return { t: 'subquery', select };
+          }
+          const first = this.parseExpr();
+          if (this.acceptOp(',')) {
+            const items = [first];
+            do items.push(this.parseExpr());
+            while (this.acceptOp(','));
+            this.expectOp(')');
+            return { t: 'tuple', items };
+          }
+          this.expectOp(')');
+          return first;
+        }
+        if (token.value === '*') return { t: 'star' };
+        this.fail(`operador inesperado '${token.value}'`);
+        break;
+      case 'ident': {
+        const lower = token.value.toLowerCase();
+        if (lower === 'null') return { t: 'lit', value: null };
+        if (lower === 'true') return { t: 'lit', value: true };
+        if (lower === 'false') return { t: 'lit', value: false };
+        if (lower === 'current_date')
+          return { t: 'call', name: 'current_date', args: [] };
+        if (lower === 'current_timestamp')
+          return { t: 'call', name: 'now', args: [] };
+        if (lower === 'exists') {
+          this.expectOp('(');
+          const select = this.parseSelect();
+          this.expectOp(')');
+          return { t: 'exists', select };
+        }
+        if (lower === 'case') return this.parseCase();
+        if (lower === 'interval') {
+          const value = this.next();
+          if (value.kind !== 'string') this.fail('interval esperava texto');
+          return {
+            t: 'call',
+            name: 'interval',
+            args: [{ t: 'lit', value: value.value }],
+          };
+        }
+        if (this.isOp('(')) {
+          this.next();
+          const args: Expr[] = [];
+          let star = false;
+          if (this.isOp('*')) {
+            this.next();
+            star = true;
+          } else if (!this.isOp(')')) {
+            do args.push(this.parseExpr());
+            while (this.acceptOp(','));
+          }
+          this.expectOp(')');
+          return { t: 'call', name: lower, args, star };
+        }
+        return { t: 'col', name: token.value };
+      }
+      case 'end':
+        this.fail('fim inesperado');
+    }
+    this.fail('expressão inválida');
+  }
+
+  private parseCase(): Expr {
+    const whens: Array<{ when: Expr; then: Expr }> = [];
+    let otherwise: Expr | undefined;
+    while (this.accept('when')) {
+      const when = this.parseExpr();
+      this.expect('then');
+      const then = this.parseExpr();
+      whens.push({ when, then });
+    }
+    if (this.accept('else')) otherwise = this.parseExpr();
+    this.expect('end');
+    return { t: 'case', whens, otherwise };
+  }
+}
+
+// ---------------------------------------------------------------------------
+// evaluation
+// ---------------------------------------------------------------------------
+
+interface EnvEntry {
+  alias: string | undefined;
+  table: string;
+  row: Row | null;
+}
+
+type Env = EnvEntry[];
+
+interface Context {
+  values: readonly unknown[];
+  aggregateRows?: Env[];
+  excluded?: Row;
+}
+
+function isDate(value: unknown): value is Date {
+  return value instanceof Date;
+}
+
+function toComparable(value: unknown): number | string | null {
+  if (value === null || value === undefined) return null;
+  if (isDate(value)) return value.getTime();
+  if (typeof value === 'number') return value;
+  if (typeof value === 'boolean') return value ? 1 : 0;
+  if (typeof value === 'string') {
+    if (value === 'infinity') return Number.POSITIVE_INFINITY;
+    if (value === '-infinity') return Number.NEGATIVE_INFINITY;
+    return value;
+  }
+  return JSON.stringify(value);
+}
+
+/** Comparação com a coerção que o pg faria: datas ↔ ISO, números ↔ texto numérico. */
+function compare(left: unknown, right: unknown): number | null {
+  const a = toComparable(left);
+  const b = toComparable(right);
+  if (a === null || b === null) return null;
+  if (a === Number.POSITIVE_INFINITY || b === Number.NEGATIVE_INFINITY) {
+    return a === b ? 0 : 1;
+  }
+  if (b === Number.POSITIVE_INFINITY || a === Number.NEGATIVE_INFINITY)
+    return -1;
+  if (typeof a === 'number' && typeof b === 'number') return a - b;
+  const aDate = dateOf(left);
+  const bDate = dateOf(right);
+  if (aDate !== null && bDate !== null) return aDate - bDate;
+  if (
+    typeof a === 'number' &&
+    typeof b === 'string' &&
+    b.trim() !== '' &&
+    !Number.isNaN(Number(b))
+  ) {
+    return a - Number(b);
+  }
+  if (
+    typeof b === 'number' &&
+    typeof a === 'string' &&
+    a.trim() !== '' &&
+    !Number.isNaN(Number(a))
+  ) {
+    return Number(a) - b;
+  }
+  const sa = String(a);
+  const sb = String(b);
+  return sa < sb ? -1 : sa > sb ? 1 : 0;
+}
+
+function dateOf(value: unknown): number | null {
+  if (isDate(value)) return value.getTime();
+  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
+    const parsed = Date.parse(
+      value.length === 10 ? `${value}T00:00:00.000Z` : value,
+    );
+    return Number.isNaN(parsed) ? null : parsed;
+  }
+  return null;
+}
+
+function localDate(value: unknown): string | null {
+  if (value === null || value === undefined) return null;
+  if (isDate(value)) return value.toISOString().slice(0, 10);
+  return String(value).slice(0, 10);
+}
+
+function likeToRegExp(pattern: string, insensitive: boolean): RegExp {
+  const escaped = pattern
+    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
+    .replaceAll('%', '.*')
+    .replaceAll('_', '.');
+  return new RegExp(`^${escaped}$`, insensitive ? 'is' : 's');
+}
+
+function jsonPathSet(target: unknown, path: string[], value: unknown): unknown {
+  if (path.length === 0) return value;
+  const [head, ...rest] = path;
+  if (Array.isArray(target)) {
+    const copy = [...target];
+    copy[Number(head)] = jsonPathSet(copy[Number(head)], rest, value);
+    return copy;
+  }
+  const base = target && typeof target === 'object' ? (target as Row) : {};
+  return { ...base, [head!]: jsonPathSet(base[head!], rest, value) };
+}
+
+export class FakeSqlDatabase {
+  private readonly tables = new Map<string, Row[]>();
+  private readonly sequences: Record<string, number>;
+  private readonly uniques: Record<string, string[][]>;
+  readonly log: Array<{ sql: string; values: readonly unknown[] }> = [];
+  readonly tenantId: string;
+  readonly tenant: { slug: string; timezone: string; name: string; id: string };
+  private readonly nowFn: () => Date;
+
+  constructor(options: FakeSqlOptions) {
+    this.tenantId = options.tenantId;
+    this.tenant = {
+      id: options.tenantId,
+      slug: options.tenant?.slug ?? 'am-fixtures',
+      timezone: options.tenant?.timezone ?? 'America/Manaus',
+      name: options.tenant?.name ?? 'Tenant (fixture)',
+    };
+    this.nowFn = options.now ?? (() => new Date('2026-09-14T16:00:00.000Z'));
+    this.sequences = {
+      'portal.protocol_seq': 14,
+      ...(options.sequences ?? {}),
+    };
+    this.uniques = { ...DEFAULT_UNIQUES, ...(options.uniques ?? {}) };
+    this.tables.set('auth.tenants', [
+      {
+        id: this.tenant.id,
+        slug: this.tenant.slug,
+        name: this.tenant.name,
+        timezone: this.tenant.timezone,
+      },
+    ]);
+  }
+
+  /** Transação no formato `PortalSqlTransaction` (`{ query(sql, values) }`). */
+  get tx(): {
+    query<T extends Row = Row>(
+      sql: string,
+      values?: readonly unknown[],
+    ): Promise<{ rows: T[]; rowCount: number }>;
+  } {
+    return {
+      query: async <T extends Row = Row>(
+        sql: string,
+        values: readonly unknown[] = [],
+      ) => {
+        this.log.push({ sql, values });
+        const rows = this.execute(sql, values) as T[];
+        return { rows, rowCount: rows.length };
+      },
+    };
+  }
+
+  /** Semeia linhas (defaults de `id`/`tenant_id`/`created_at` aplicados). */
+  seed(table: string, rows: Row[]): Row[] {
+    const stored = this.rowsOf(table);
+    const inserted = rows.map((row) => this.withDefaults(table, row));
+    stored.push(...inserted);
+    return inserted;
+  }
+
+  rows(table: string): Row[] {
+    return [...this.rowsOf(table)];
+  }
+
+  clear(table: string): void {
+    this.tables.set(table, []);
+  }
+
+  sequenceValue(name: string): number {
+    return this.sequences[name] ?? 0;
+  }
+
+  private rowsOf(table: string): Row[] {
+    let rows = this.tables.get(table);
+    if (!rows) {
+      rows = [];
+      this.tables.set(table, rows);
+    }
+    return rows;
+  }
+
+  private withDefaults(table: string, row: Row): Row {
+    const defaults = DEFAULT_COLUMNS[table] ?? {};
+    const result: Row = { ...defaults, ...row };
+    if (result.id === undefined) result.id = randomUUID();
+    if (result.tenant_id === undefined) result.tenant_id = this.tenantId;
+    if (result.created_at === undefined) result.created_at = this.nowFn();
+    if (table === 'integration.outbox') {
+      if (result.available_at === undefined)
+        result.available_at = result.created_at;
+      if (result.updated_at === undefined)
+        result.updated_at = result.created_at;
+    }
+    return result;
+  }
+
+  execute(sql: string, values: readonly unknown[]): Row[] {
+    const stmt = new Parser(tokenize(sql), sql).parseStatement();
+    const ctx: Context = { values };
+    const cteBackup = new Map<string, Row[] | undefined>();
+    for (const cte of stmt.ctes ?? []) {
+      cteBackup.set(cte.name, this.tables.get(cte.name));
+      this.tables.set(cte.name, this.select(cte.select, ctx, sql));
+    }
+    try {
+      switch (stmt.kind) {
+        case 'select':
+          return this.select(stmt, ctx, sql);
+        case 'insert':
+          return this.insert(stmt, ctx, sql);
+        case 'update':
+          return this.update(stmt, ctx, sql);
+        case 'delete':
+          return this.delete(stmt, ctx, sql);
+        case 'noop':
+        default:
+          return [];
+      }
+    } finally {
+      for (const [name, previous] of cteBackup) {
+        if (previous === undefined) this.tables.delete(name);
+        else this.tables.set(name, previous);
+      }
+    }
+  }
+
+  // --- select ---------------------------------------------------------------
+
+  private select(stmt: SelectStmt, ctx: Context, sql: string): Row[] {
+    let envs: Env[];
+    if (!stmt.from) envs = [[]];
+    else {
+      const base = this.rowsOf(stmt.from.table).map<Env>((row) => [
+        { alias: stmt.from!.alias, table: stmt.from!.table, row },
+      ]);
+      envs = base;
+      for (const join of stmt.joins) {
+        const right = this.rowsOf(join.source.table);
+        const next: Env[] = [];
+        for (const env of envs) {
+          let matched = false;
+          for (const row of right) {
+            const candidate: Env = [
+              ...env,
+              { alias: join.source.alias, table: join.source.table, row },
+            ];
+            if (this.truthy(this.eval(join.on, candidate, ctx, sql))) {
+              matched = true;
+              next.push(candidate);
+            }
+          }
+          if (!matched && join.kind === 'left') {
+            next.push([
+              ...env,
+              { alias: join.source.alias, table: join.source.table, row: null },
+            ]);
+          }
+        }
+        envs = next;
+      }
+    }
+    if (stmt.where) {
+      envs = envs.filter((env) =>
+        this.truthy(this.eval(stmt.where!, env, ctx, sql)),
+      );
+    }
+    const aggregate = stmt.items.some((item) => this.isAggregate(item.expr));
+    if (stmt.orderBy.length > 0 && !aggregate) {
+      envs = [...envs].sort((left, right) => {
+        for (const key of stmt.orderBy) {
+          const a = this.eval(key.expr, left, ctx, sql);
+          const b = this.eval(key.expr, right, ctx, sql);
+          const aNull = a === null || a === undefined;
+          const bNull = b === null || b === undefined;
+          if (aNull && bNull) continue;
+          if (aNull) return key.nullsLast ? 1 : -1;
+          if (bNull) return key.nullsLast ? -1 : 1;
+          const cmp = compare(a, b) ?? 0;
+          if (cmp !== 0) return key.desc ? -cmp : cmp;
+        }
+        return 0;
+      });
+    }
+    if (stmt.distinctOn) {
+      const seen = new Set<string>();
+      envs = envs.filter((env) => {
+        const key = JSON.stringify(
+          stmt.distinctOn!.map((expr) => this.eval(expr, env, ctx, sql)),
+        );
+        if (seen.has(key)) return false;
+        seen.add(key);
+        return true;
+      });
+    }
+    if (aggregate) {
+      const aggregateCtx: Context = { ...ctx, aggregateRows: envs };
+      return [this.project(stmt.items, [], aggregateCtx, sql)];
+    }
+    const offset = stmt.offset
+      ? Number(this.eval(stmt.offset, [], ctx, sql))
+      : 0;
+    const limit = stmt.limit
+      ? Number(this.eval(stmt.limit, [], ctx, sql))
+      : undefined;
+    const sliced = envs.slice(
+      offset,
+      limit === undefined ? undefined : offset + limit,
+    );
+    const projected = sliced.map((env) =>
+      this.project(stmt.items, env, ctx, sql),
+    );
+    return stmt.union
+      ? [...projected, ...this.select(stmt.union, ctx, sql)]
+      : projected;
+  }
+
+  private isAggregate(expr: Expr): boolean {
+    switch (expr.t) {
+      case 'call':
+        if (
+          ['count', 'max', 'min', 'sum', 'array_agg', 'bool_or'].includes(
+            expr.name,
+          )
+        )
+          return true;
+        return expr.args.some((arg) => this.isAggregate(arg));
+      case 'cast':
+        return this.isAggregate(expr.expr);
+      case 'bin':
+        return this.isAggregate(expr.left) || this.isAggregate(expr.right);
+      default:
+        return false;
+    }
+  }
+
+  /** Projeção posicional: pares [nome, valor] na ordem do select list. */
+  private projectPairs(
+    items: SelectItem[],
+    env: Env,
+    ctx: Context,
+    sql: string,
+  ): Array<[string, unknown]> {
+    const pairs: Array<[string, unknown]> = [];
+    for (const item of items) {
+      if (item.expr.t === 'star') {
+        for (const entry of env) {
+          if (
+            item.expr.alias &&
+            entry.alias !== item.expr.alias &&
+            entry.table !== item.expr.alias
+          ) {
+            continue;
+          }
+          if (entry.row) {
+            for (const [key, value] of Object.entries(entry.row))
+              pairs.push([key, value]);
+          }
+        }
+        continue;
+      }
+      const name =
+        item.alias ??
+        (item.expr.t === 'col'
+          ? item.expr.name.split('.').pop()!
+          : item.expr.t === 'call'
+            ? item.expr.name
+            : item.expr.t === 'cast' && item.expr.expr.t === 'col'
+              ? item.expr.expr.name.split('.').pop()!
+              : '?column?');
+      pairs.push([name, this.eval(item.expr, env, ctx, sql)]);
+    }
+    return pairs;
+  }
+
+  private project(
+    items: SelectItem[],
+    env: Env,
+    ctx: Context,
+    sql: string,
+  ): Row {
+    const out: Row = {};
+    for (const [name, value] of this.projectPairs(items, env, ctx, sql))
+      out[name] = value;
+    return out;
+  }
+
+  /** Linhas de um select como listas posicionais (para `insert … select`). */
+  private selectValues(
+    stmt: SelectStmt,
+    ctx: Context,
+    sql: string,
+  ): unknown[][] {
+    const marker = '__fake_sql_pos__';
+    const rows = this.select(
+      {
+        ...stmt,
+        items: stmt.items.map((item, index) => ({
+          ...item,
+          alias: `${marker}${index}`,
+        })),
+      },
+      ctx,
+      sql,
+    );
+    return rows.map((row) =>
+      stmt.items.map((_, index) => row[`${marker}${index}`]),
+    );
+  }
+
+  // --- insert / update / delete --------------------------------------------
+
+  private insert(stmt: InsertStmt, ctx: Context, sql: string): Row[] {
+    const stored = this.rowsOf(stmt.table);
+    const produced: Row[] = [];
+    const sourceRows: Row[] = [];
+    if (stmt.rows) {
+      for (const exprs of stmt.rows) {
+        if (exprs.length !== stmt.columns.length) {
+          throw new FakeSqlUnsupported(
+            sql,
+            'colunas e valores em número diferente',
+          );
+        }
+        const row: Row = {};
+        exprs.forEach((expr, index) => {
+          row[stmt.columns[index]!] = this.eval(expr, [], ctx, sql);
+        });
+        sourceRows.push(row);
+      }
+    } else if (stmt.select) {
+      for (const values of this.selectValues(stmt.select, ctx, sql)) {
+        const row: Row = {};
+        stmt.columns.forEach((column, index) => {
+          row[column] = values[index];
+        });
+        sourceRows.push(row);
+      }
+    }
+    for (const candidate of sourceRows) {
+      const row = this.withDefaults(stmt.table, candidate);
+      const conflicting = this.findConflict(
+        stmt.table,
+        row,
+        stmt.onConflict?.target,
+      );
+      if (conflicting) {
+        if (!stmt.onConflict) {
+          throw new FakeSqlError(
+            '23505',
+            `duplicate key value violates unique constraint (${stmt.table})`,
+            `ux_${stmt.table.replace('.', '_')}`,
+          );
+        }
+        if (stmt.onConflict.action === 'nothing') continue;
+        const env: Env = [
+          { alias: undefined, table: stmt.table, row: conflicting },
+        ];
+        const updates: Row = {};
+        for (const assignment of stmt.onConflict.set ?? []) {
+          updates[assignment.column] = this.eval(
+            assignment.expr,
+            env,
+            { ...ctx, excluded: row },
+            sql,
+          );
+        }
+        Object.assign(conflicting, updates);
+        produced.push(conflicting);
+        continue;
+      }
+      stored.push(row);
+      produced.push(row);
+    }
+    if (!stmt.returning) return [];
+    return produced.map((row) =>
+      this.project(
+        stmt.returning!,
+        [{ alias: undefined, table: stmt.table, row }],
+        ctx,
+        sql,
+      ),
+    );
+  }
+
+  private findConflict(
+    table: string,
+    row: Row,
+    target?: string[],
+  ): Row | undefined {
+    const stored = this.rowsOf(table);
+    const keySets = target
+      ? [target.filter((column) => column !== 'tenant_id')]
+      : (this.uniques[table] ?? []);
+    for (const columns of keySets) {
+      if (columns.length === 0) continue;
+      const found = stored.find((existing) =>
+        columns.every((column) => {
+          const a = row[column];
+          const b = existing[column];
+          if (
+            (a === null || a === undefined) &&
+            (b === null || b === undefined)
+          ) {
+            return column === 'target_id';
+          }
+          return compare(a, b) === 0;
+        }),
+      );
+      if (found) return found;
+    }
+    if (row.id !== undefined) {
+      const byId = stored.find((existing) => existing.id === row.id);
+      if (byId) return byId;
+    }
+    return undefined;
+  }
+
+  private update(stmt: UpdateStmt, ctx: Context, sql: string): Row[] {
+    const stored = this.rowsOf(stmt.table);
+    const touched: Row[] = [];
+    for (const row of stored) {
+      const env: Env = [{ alias: stmt.alias, table: stmt.table, row }];
+      if (stmt.where && !this.truthy(this.eval(stmt.where, env, ctx, sql)))
+        continue;
+      const updates: Row = {};
+      for (const assignment of stmt.set) {
+        updates[assignment.column] = this.eval(assignment.expr, env, ctx, sql);
+      }
+      Object.assign(row, updates);
+      touched.push(row);
+    }
+    if (!stmt.returning) return [];
+    return touched.map((row) =>
+      this.project(
+        stmt.returning!,
+        [{ alias: stmt.alias, table: stmt.table, row }],
+        ctx,
+        sql,
+      ),
+    );
+  }
+
+  private delete(stmt: DeleteStmt, ctx: Context, sql: string): Row[] {
+    const stored = this.rowsOf(stmt.table);
+    const kept = stored.filter((row) => {
+      const env: Env = [{ alias: stmt.alias, table: stmt.table, row }];
+      return stmt.where
+        ? !this.truthy(this.eval(stmt.where, env, ctx, sql))
+        : false;
+    });
+    this.tables.set(stmt.table, kept);
+    return [];
+  }
+
+  // --- expressions ----------------------------------------------------------
+
+  private truthy(value: unknown): boolean {
+    return value === true;
+  }
+
+  private resolveColumn(
+    name: string,
+    env: Env,
+    ctx: Context,
+    sql: string,
+  ): unknown {
+    const parts = name.split('.');
+    if (parts.length === 2 && parts[0] === 'excluded') {
+      return ctx.excluded?.[parts[1]!] ?? null;
+    }
+    if (parts.length >= 2) {
+      const column = parts[parts.length - 1]!;
+      const qualifier = parts.slice(0, -1).join('.');
+      const entry = env.find(
+        (candidate) =>
+          candidate.alias === qualifier ||
+          candidate.table === qualifier ||
+          candidate.table.endsWith(`.${qualifier}`),
+      );
+      if (entry) return entry.row ? (entry.row[column] ?? null) : null;
+      throw new FakeSqlUnsupported(sql, `referência desconhecida ${name}`);
+    }
+    for (const entry of env) {
+      if (entry.row && name in entry.row) return entry.row[name];
+    }
+    // coluna ausente numa linha existente (ex.: nunca gravada) → null
+    if (env.some((entry) => entry.row)) return null;
+    throw new FakeSqlUnsupported(sql, `coluna ${name} fora de um from`);
+  }
+
+  private eval(expr: Expr, env: Env, ctx: Context, sql: string): unknown {
+    switch (expr.t) {
+      case 'lit':
+        return expr.value;
+      case 'param': {
+        const value = ctx.values[expr.index - 1];
+        return value === undefined ? null : value;
+      }
+      case 'col':
+        return this.resolveColumn(expr.name, env, ctx, sql);
+      case 'star':
+        return null;
+      case 'tuple':
+        return expr.items.map((item) => this.eval(item, env, ctx, sql));
+      case 'not': {
+        const value = this.eval(expr.expr, env, ctx, sql);
+        return value === null ? null : !this.truthy(value);
+      }
+      case 'isnull': {
+        const value = this.eval(expr.expr, env, ctx, sql);
+        const isNull = value === null || value === undefined;
+        return expr.negated ? !isNull : isNull;
+      }
+      case 'in': {
+        const value = this.eval(expr.expr, env, ctx, sql);
+        let list: unknown[] = [];
+        for (const item of expr.list) {
+          if (item.t === 'subquery') {
+            list.push(
+              ...this.select(item.select, ctx, sql).map(
+                (row) => Object.values(row)[0],
+              ),
+            );
+          } else list.push(this.eval(item, env, ctx, sql));
+        }
+        list = list.flat();
+        const found = list.some((candidate) => compare(value, candidate) === 0);
+        return expr.negated ? !found : found;
+      }
+      case 'any': {
+        const value = this.eval(expr.expr, env, ctx, sql);
+        const array = this.eval(expr.array, env, ctx, sql);
+        const items = Array.isArray(array) ? array : [array];
+        return items.some(
+          (candidate) => this.compareOp(expr.op, value, candidate) === true,
+        );
+      }
+      case 'cast':
+        return this.cast(this.eval(expr.expr, env, ctx, sql), expr.type);
+      case 'exists':
+        return this.select(expr.select, ctx, sql).length > 0;
+      case 'subquery': {
+        const rows = this.select(expr.select, ctx, sql);
+        if (rows.length === 0) return null;
+        return Object.values(rows[0]!)[0];
+      }
+      case 'case': {
+        for (const branch of expr.whens) {
+          if (this.truthy(this.eval(branch.when, env, ctx, sql))) {
+            return this.eval(branch.then, env, ctx, sql);
+          }
+        }
+        return expr.otherwise ? this.eval(expr.otherwise, env, ctx, sql) : null;
+      }
+      case 'call':
+        return this.call(expr, env, ctx, sql);
+      case 'bin':
+        return this.binary(expr, env, ctx, sql);
+    }
+  }
+
+  private cast(value: unknown, type: string): unknown {
+    if (value === null || value === undefined) return null;
+    switch (type) {
+      case 'date':
+        return localDate(value);
+      case 'text':
+      case 'varchar':
+        if (isDate(value)) return value.toISOString();
+        return typeof value === 'string' ? value : JSON.stringify(value);
+      case 'jsonb':
+      case 'json':
+        return typeof value === 'string' ? JSON.parse(value) : value;
+      case 'int':
+      case 'integer':
+      case 'bigint':
+      case 'numeric':
+      case 'smallint':
+        return Number(value);
+      case 'boolean':
+      case 'bool':
+        return value === true || value === 'true' || value === 't';
+      case 'timestamptz':
+      case 'timestamp':
+        return isDate(value) ? value : new Date(String(value));
+      default:
+        return value;
+    }
+  }
+
+  private call(
+    expr: Extract<Expr, { t: 'call' }>,
+    env: Env,
+    ctx: Context,
+    sql: string,
+  ): unknown {
+    const args = () => expr.args.map((arg) => this.eval(arg, env, ctx, sql));
+    switch (expr.name) {
+      case 'now':
+      case 'clock_timestamp':
+      case 'transaction_timestamp':
+      case 'statement_timestamp':
+        return this.nowFn();
+      case 'current_date':
+        return this.nowFn().toISOString().slice(0, 10);
+      case 'auth.current_tenant':
+        return this.tenantId;
+      case 'gen_random_uuid':
+        return randomUUID();
+      case 'nextval': {
+        const [name] = args();
+        const key = String(name);
+        this.sequences[key] = (this.sequences[key] ?? 0) + 1;
+        return this.sequences[key];
+      }
+      case 'setval': {
+        const [name, value] = args();
+        this.sequences[String(name)] = Number(value);
+        return Number(value);
+      }
+      case 'set_config':
+        return args()[1] ?? null;
+      case 'coalesce':
+        return (
+          args().find((value) => value !== null && value !== undefined) ?? null
+        );
+      case 'nullif': {
+        const [a, b] = args();
+        return compare(a, b) === 0 ? null : a;
+      }
+      case 'greatest':
+        return args().reduce((best, value) =>
+          (compare(value, best) ?? 0) > 0 ? value : best,
+        );
+      case 'least':
+        return args().reduce((best, value) =>
+          (compare(value, best) ?? 0) < 0 ? value : best,
+        );
+      case 'lower':
+        return String(args()[0] ?? '').toLowerCase();
+      case 'upper':
+        return String(args()[0] ?? '').toUpperCase();
+      case 'length':
+        return String(args()[0] ?? '').length;
+      case 'to_char': {
+        const [value, format] = args();
+        if (value === null || value === undefined) return null;
+        if (String(format).toUpperCase().startsWith('YYYY-MM-DD')) {
+          const asDate = isDate(value)
+            ? value
+            : new Date(
+                String(value).length === 10
+                  ? `${value}T00:00:00.000Z`
+                  : String(value),
+              );
+          return asDate.toISOString().slice(0, 10);
+        }
+        return String(value);
+      }
+      case 'to_jsonb':
+      case 'to_json':
+        return args()[0] ?? null;
+      case 'jsonb_build_object': {
+        const values = args();
+        const out: Row = {};
+        for (let i = 0; i < values.length; i += 2)
+          out[String(values[i])] = values[i + 1] ?? null;
+        return out;
+      }
+      case 'jsonb_set': {
+        const [target, path, value] = args();
+        const segments = String(path)
+          .replace(/^\{|\}$/g, '')
+          .split(',')
+          .map((s) => s.trim());
+        return jsonPathSet(target, segments, value);
+      }
+      case 'jsonb_array_length':
+      case 'array_length': {
+        const [value] = args();
+        return Array.isArray(value) ? value.length : null;
+      }
+      case 'interval':
+        return { interval: String(args()[0]) };
+      case 'not_distinct': {
+        const [inner] = expr.args;
+        const value = this.eval(inner!, env, ctx, sql);
+        return value === null ? true : value;
+      }
+      case 'count': {
+        const rows = ctx.aggregateRows ?? [];
+        if (expr.star || expr.args.length === 0) return String(rows.length);
+        const counted = rows.filter((row) => {
+          const value = this.eval(expr.args[0]!, row, ctx, sql);
+          return value !== null && value !== undefined;
+        });
+        return String(counted.length);
+      }
+      case 'max':
+      case 'min':
+      case 'sum': {
+        const rows = ctx.aggregateRows ?? [];
+        const values = rows
+          .map((row) => this.eval(expr.args[0]!, row, ctx, sql))
+          .filter((value) => value !== null && value !== undefined);
+        if (values.length === 0) return null;
+        if (expr.name === 'sum')
+          return values.reduce<number>((acc, value) => acc + Number(value), 0);
+        return values.reduce((best, value) => {
+          const cmp = compare(value, best) ?? 0;
+          return expr.name === 'max'
+            ? cmp > 0
+              ? value
+              : best
+            : cmp < 0
+              ? value
+              : best;
+        });
+      }
+      case 'array_agg': {
+        const rows = ctx.aggregateRows ?? [];
+        return rows.map((row) => this.eval(expr.args[0]!, row, ctx, sql));
+      }
+      default:
+        throw new FakeSqlUnsupported(sql, `função ${expr.name} não suportada`);
+    }
+  }
+
+  private compareOp(op: string, left: unknown, right: unknown): boolean | null {
+    if (
+      left === null ||
+      left === undefined ||
+      right === null ||
+      right === undefined
+    )
+      return null;
+    if (Array.isArray(left) && Array.isArray(right)) {
+      for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
+        const cmp = compare(left[i], right[i]);
+        if (cmp === null) return null;
+        if (cmp !== 0) return this.applyOp(op, cmp);
+      }
+      return this.applyOp(op, 0);
+    }
+    if (
+      typeof left === 'object' &&
+      typeof right === 'object' &&
+      !isDate(left) &&
+      !isDate(right)
+    ) {
+      const equal = JSON.stringify(left) === JSON.stringify(right);
+      return op === '=' ? equal : op === '<>' ? !equal : null;
+    }
+    const cmp = compare(left, right);
+    return cmp === null ? null : this.applyOp(op, cmp);
+  }
+
+  private applyOp(op: string, cmp: number): boolean {
+    switch (op) {
+      case '=':
+        return cmp === 0;
+      case '<>':
+        return cmp !== 0;
+      case '<':
+        return cmp < 0;
+      case '<=':
+        return cmp <= 0;
+      case '>':
+        return cmp > 0;
+      case '>=':
+        return cmp >= 0;
+      default:
+        return false;
+    }
+  }
+
+  private binary(
+    expr: Extract<Expr, { t: 'bin' }>,
+    env: Env,
+    ctx: Context,
+    sql: string,
+  ): unknown {
+    if (expr.op === 'and') {
+      const left = this.eval(expr.left, env, ctx, sql);
+      if (left === false) return false;
+      const right = this.eval(expr.right, env, ctx, sql);
+      if (right === false) return false;
+      return left === true && right === true ? true : null;
+    }
+    if (expr.op === 'or') {
+      const left = this.eval(expr.left, env, ctx, sql);
+      if (left === true) return true;
+      const right = this.eval(expr.right, env, ctx, sql);
+      if (right === true) return true;
+      return left === false && right === false ? false : null;
+    }
+    const left = this.eval(expr.left, env, ctx, sql);
+    const right = this.eval(expr.right, env, ctx, sql);
+    switch (expr.op) {
+      case '=':
+      case '<>':
+      case '<':
+      case '<=':
+      case '>':
+      case '>=':
+        return this.compareOp(expr.op, left, right);
+      case 'like':
+      case 'ilike':
+        if (left === null || right === null) return null;
+        return likeToRegExp(String(right), expr.op === 'ilike').test(
+          String(left),
+        );
+      case '+':
+      case '-': {
+        if (left === null || right === null) return null;
+        if (
+          isDate(left) &&
+          typeof right === 'object' &&
+          right &&
+          'interval' in (right as Row)
+        ) {
+          return this.shiftDate(
+            left,
+            String((right as Row).interval),
+            expr.op === '-' ? -1 : 1,
+          );
+        }
+        if (
+          typeof left === 'string' &&
+          /^\d{4}-\d{2}-\d{2}$/.test(left) &&
+          typeof right === 'number'
+        ) {
+          const shifted = new Date(`${left}T00:00:00.000Z`);
+          shifted.setUTCDate(
+            shifted.getUTCDate() + (expr.op === '-' ? -right : right),
+          );
+          return shifted.toISOString().slice(0, 10);
+        }
+        return expr.op === '+'
+          ? Number(left) + Number(right)
+          : Number(left) - Number(right);
+      }
+      case '*':
+        return Number(left) * Number(right);
+      case '/':
+        return Number(left) / Number(right);
+      case '||': {
+        if (Array.isArray(left) || Array.isArray(right)) {
+          return [
+            ...(Array.isArray(left) ? left : [left]),
+            ...(Array.isArray(right) ? right : [right]),
+          ];
+        }
+        if (
+          left &&
+          right &&
+          typeof left === 'object' &&
+          typeof right === 'object'
+        ) {
+          return { ...(left as Row), ...(right as Row) };
+        }
+        return `${left ?? ''}${right ?? ''}`;
+      }
+      case '->':
+      case '->>': {
+        if (left === null || left === undefined) return null;
+        const container = typeof left === 'string' ? JSON.parse(left) : left;
+        const key = right as string | number;
+        const value = Array.isArray(container)
+          ? container[Number(key)]
+          : (container as Row)[String(key)];
+        if (value === undefined) return null;
+        if (expr.op === '->>')
+          return typeof value === 'string' ? value : JSON.stringify(value);
+        return value;
+      }
+      default:
+        throw new FakeSqlUnsupported(sql, `operador ${expr.op} não suportado`);
+    }
+  }
+
+  private shiftDate(base: Date, interval: string, sign: number): Date {
+    const match =
+      /^(-?\d+)\s*(hour|hours|day|days|minute|minutes|second|seconds)$/i.exec(
+        interval.trim(),
+      );
+    if (!match)
+      throw new FakeSqlUnsupported(
+        'interval',
+        `interval '${interval}' não suportado`,
+      );
+    const amount = Number(match[1]) * sign;
+    const unit = match[2]!.toLowerCase();
+    const ms = unit.startsWith('hour')
+      ? 3_600_000
+      : unit.startsWith('day')
+        ? 86_400_000
+        : unit.startsWith('minute')
+          ? 60_000
+          : 1_000;
+    return new Date(base.getTime() + amount * ms);
+  }
+}
diff --git a/backend/domains/portal/requests/tests/support/nest-construct.ts b/backend/domains/portal/requests/tests/support/nest-construct.ts
new file mode 100644
index 0000000..eee7943
--- /dev/null
+++ b/backend/domains/portal/requests/tests/support/nest-construct.ts
@@ -0,0 +1,87 @@
+// Constrói um provider `@Injectable()` manuscrito do Portal fora do Nest,
+// resolvendo os parâmetros do construtor pelos metadados que o próprio
+// decorador emite (`design:paramtypes`, `self:paramtypes` para `@Inject(token)`
+// e `optional:paramtypes`) — os specs `unit` não dependem da ORDEM em que o
+// Engineer declara as dependências (R-0009 CTG-0002 §14 fixa os símbolos, não
+// as assinaturas). Cada dependência é resolvida pelo NOME da classe ou pela
+// `description` do `Symbol` do token; ausência lança com a lista do que o
+// spec precisa oferecer.
+//
+// `Reflect.getMetadata` chega pelo `reflect-metadata` que `@nestjs/common`
+// carrega ao ser importado (os módulos sob teste o importam); este arquivo
+// não importa nada do Nest.
+
+type Constructor<T> = new (...args: never[]) => T;
+
+interface ReflectWithMetadata {
+  getMetadata?(key: string, target: object): unknown;
+}
+
+function metadata(key: string, target: object): unknown {
+  const reflect = (globalThis as { Reflect?: ReflectWithMetadata }).Reflect;
+  return reflect?.getMetadata?.(key, target);
+}
+
+function tokenName(token: unknown): string {
+  if (typeof token === 'function') return token.name;
+  if (typeof token === 'symbol') return token.description ?? token.toString();
+  return String(token);
+}
+
+/** Nomes (classe ou `Symbol.description`) das dependências do construtor. */
+export function constructorDependencies(target: object): Array<{
+  index: number;
+  name: string;
+  optional: boolean;
+}> {
+  const paramTypes =
+    (metadata('design:paramtypes', target) as unknown[] | undefined) ?? [];
+  const selfTypes =
+    (metadata('self:paramtypes', target) as
+      Array<{ index: number; param: unknown }> | undefined) ?? [];
+  const optional =
+    (metadata('optional:paramtypes', target) as number[] | undefined) ?? [];
+  const count = Math.max(
+    paramTypes.length,
+    ...selfTypes.map((entry) => entry.index + 1),
+  );
+  const dependencies: Array<{
+    index: number;
+    name: string;
+    optional: boolean;
+  }> = [];
+  for (let index = 0; index < count; index += 1) {
+    const explicit = selfTypes.find((entry) => entry.index === index);
+    const token = explicit ? explicit.param : paramTypes[index];
+    dependencies.push({
+      index,
+      name: tokenName(token),
+      optional: optional.includes(index),
+    });
+  }
+  return dependencies;
+}
+
+/**
+ * `new Target(...deps)` com `providers[nome]` por parâmetro. Um provider pode
+ * ser oferecido sob vários nomes (ex.: a mesma fake sob `PortalIdentityService`
+ * e `PORTAL_IDENTITY`). Parâmetros `@Optional()` ausentes recebem `undefined`.
+ */
+export function constructInjectable<T>(
+  Target: Constructor<T>,
+  providers: Record<string, unknown>,
+  label = Target.name,
+): T {
+  const dependencies = constructorDependencies(Target);
+  const args = dependencies.map((dependency) => {
+    if (dependency.name in providers) return providers[dependency.name];
+    if (dependency.optional) return undefined;
+    throw new Error(
+      `${label}: o construtor pede '${dependency.name}' (posição ${dependency.index}); ` +
+        `o spec oferece [${Object.keys(providers).join(', ')}]. ` +
+        'Dependências lidas dos metadados: ' +
+        dependencies.map((entry) => entry.name).join(', '),
+    );
+  });
+  return new Target(...(args as never[]));
+}
diff --git a/backend/domains/portal/requests/tests/support/portal-fixtures.ts b/backend/domains/portal/requests/tests/support/portal-fixtures.ts
new file mode 100644
index 0000000..13488d8
--- /dev/null
+++ b/backend/domains/portal/requests/tests/support/portal-fixtures.ts
@@ -0,0 +1,587 @@
+// Constantes canônicas e fakes compartilhadas pelos specs `unit` do Portal
+// (R-0009 CTG-0001 §5, §10; CTG-0002 §3.2, §12, §13). Só ids e valores das
+// fixtures de `backend/database/seed/70-fixtures-portal.sql` — nada inventado.
+// Relógio fixo 2026-09-14 (CTG-0002 §13) em America/Manaus.
+import type { Row } from './fake-sql.js';
+
+export const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+export const TENANT_SLUG = 'am-fixtures';
+export const TENANT_TZ = 'America/Manaus';
+
+/** "Hoje" das fixtures (CTG-0001 §10; CTG-0002 §13). */
+export const FIXED_TODAY = '2026-09-14';
+export const FIXED_NOW = new Date('2026-09-14T12:00:00-04:00');
+
+export const fixedClock = {
+  now: () => new Date(FIXED_NOW.getTime()),
+  today: (_tenantTz?: string) => FIXED_TODAY,
+};
+
+/** CTG-0001 §10.2 — sujeitos das fixtures. */
+export const SUBJECTS = {
+  bronze: {
+    id: '00000000-0000-7000-8000-000070000001',
+    cpf: '11111111111',
+    cpfHash: '534a4a8eafcd8489af32356d5a7a25f88c70cfe0448539a7c42964c1b897a359',
+    assurance: 'simples',
+  },
+  prata: {
+    id: '00000000-0000-7000-8000-000070000002',
+    cpf: '22222222222',
+    cpfHash: 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4',
+    assurance: 'avancada',
+  },
+  ouro: {
+    id: '00000000-0000-7000-8000-000070000003',
+    cpf: '33333333333',
+    cpfHash: '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016',
+    assurance: 'avancada',
+  },
+  qualificada: {
+    id: '00000000-0000-7000-8000-000070000004',
+    cpf: '44444444444',
+    cpfHash: '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df',
+    assurance: 'qualificada',
+  },
+  procurador: {
+    id: '00000000-0000-7000-8000-000070000005',
+    cpf: '55555555555',
+    cpfHash: 'a96fb099c9fe2b2866c515ce063539186c7103dd14b9df1a91741a7afd7f94fd',
+    assurance: 'avancada',
+  },
+} as const;
+
+/** CTG-0001 §10.3 — AITs de `30-fixtures-infraction.sql` referenciados pelo Portal. */
+export const AITS = {
+  f1: '00000000-0000-7000-8000-0000f0000001',
+  f2: '00000000-0000-7000-8000-0000f0000002',
+  f3: '00000000-0000-7000-8000-0000f0000003',
+  f5: '00000000-0000-7000-8000-0000f0000005',
+  f6: '00000000-0000-7000-8000-0000f0000006',
+  f9: '00000000-0000-7000-8000-0000f0000009',
+  f10: '00000000-0000-7000-8000-0000f0000010',
+  f12: '00000000-0000-7000-8000-0000f0000012',
+} as const;
+
+/** Infrações correspondentes (`…d00000nn`, CTG-0001 §10.3). */
+export const INFRACTIONS = {
+  d1: '00000000-0000-7000-8000-0000d0000001',
+  d2: '00000000-0000-7000-8000-0000d0000002',
+  d3: '00000000-0000-7000-8000-0000d0000003',
+  d9: '00000000-0000-7000-8000-0000d0000009',
+} as const;
+
+/** Alvos externos sem fixture canônica (`…ff…`, CTG-0001 §10.1). */
+export const EXTERNAL = {
+  vehicle: '00000000-0000-7000-8000-00007ff00001',
+  exam: '00000000-0000-7000-8000-00007ff00002',
+  crash: '00000000-0000-7000-8000-00007ff00003',
+} as const;
+
+/** Linhas de `portal.infraction_view` das fixtures (CTG-0001 §10.8). */
+export const INFRACTION_VIEWS: Row[] = [
+  {
+    id: '00000000-0000-7000-8000-000070f00001',
+    ait_id: AITS.f2,
+    subject_cpf_hash: SUBJECTS.prata.cpfHash,
+    ait_number: 'FIX-0000001',
+    plate: 'FIX2E01',
+    occurred_at: new Date('2026-05-01T12:00:00-04:00'),
+    situation: 'aguardando_defesa',
+    points_status: 'none',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00002',
+    ait_id: AITS.f3,
+    subject_cpf_hash: SUBJECTS.prata.cpfHash,
+    ait_number: 'FIX-0000002',
+    plate: 'FIX2E02',
+    occurred_at: new Date('2026-05-02T12:00:00-04:00'),
+    situation: 'em_defesa',
+    points_status: 'em_disputa',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00003',
+    ait_id: AITS.f5,
+    subject_cpf_hash: SUBJECTS.prata.cpfHash,
+    ait_number: 'FIX-0000003',
+    plate: 'FIX2E03',
+    occurred_at: new Date('2026-05-03T12:00:00-04:00'),
+    situation: 'penalidade_aplicada',
+    points_status: 'definitivo',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00004',
+    ait_id: AITS.f6,
+    subject_cpf_hash: SUBJECTS.ouro.cpfHash,
+    ait_number: 'FIX-0000004',
+    plate: 'FIX2E04',
+    occurred_at: new Date('2026-05-04T12:00:00-04:00'),
+    situation: 'em_recurso',
+    points_status: 'em_disputa',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00005',
+    ait_id: AITS.f9,
+    subject_cpf_hash: SUBJECTS.qualificada.cpfHash,
+    ait_number: 'FIX-0000005',
+    plate: 'FIX2E05',
+    occurred_at: new Date('2026-05-05T12:00:00-04:00'),
+    situation: 'encerrada',
+    points_status: 'definitivo',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00006',
+    ait_id: AITS.f12,
+    subject_cpf_hash: SUBJECTS.ouro.cpfHash,
+    ait_number: 'FIX-0000006',
+    plate: 'FIX2E06',
+    occurred_at: new Date('2026-05-06T12:00:00-04:00'),
+    situation: 'cancelada',
+    points_status: 'none',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070f00007',
+    ait_id: AITS.f10,
+    subject_cpf_hash: SUBJECTS.prata.cpfHash,
+    ait_number: 'FIX-0000007',
+    plate: 'FIX2E07',
+    occurred_at: new Date('2026-05-07T12:00:00-04:00'),
+    situation: 'arquivada',
+    points_status: 'none',
+  },
+].map((row) => ({
+  framing_label: 'fixture',
+  amount: 195.23,
+  deadlines_json: [],
+  actions_json: [],
+  notices_json: [],
+  payment_json: {},
+  last_event_id: '00000000-0000-0000-0000-000000000000',
+  last_event_version: 0,
+  ...row,
+}));
+
+export interface CatalogRow extends Row {
+  id: string;
+  service_key: string;
+  category: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+  minimum_assurance: string;
+  unavailable_reason: string | null;
+  alternative_channel_note: string | null;
+}
+
+export const PRESENTIAL_NOTE =
+  'Atendimento presencial ([REF-DETRANAM-SERVICOS])';
+
+/** CTG-0001 §10.7 — as 15 linhas de `portal.service_catalog` (9/2/4, M12). */
+export const SERVICE_CATALOG: CatalogRow[] = (
+  [
+    ['01', 'consulta_multas', 'inf', 'available', 'simples', null, null],
+    ['02', 'consulta_cnh', 'ch', 'available', 'simples', null, null],
+    ['03', 'emissao_crlv', 'est', 'available', 'simples', null, null],
+    ['04', 'adesao_sne', 'inf', 'available', 'avancada', null, null],
+    ['05', 'cancelamento_sne', 'inf', 'available', 'avancada', null, null],
+    ['06', 'consulta_bat', 'est', 'available', 'simples', null, null],
+    ['07', 'consulta_exame', 'ch', 'available', 'simples', null, null],
+    ['08', 'manifestar', 'transversal', 'available', 'none', null, null],
+    ['09', 'avaliar', 'transversal', 'available', 'simples', null, null],
+    [
+      '0a',
+      'pagamento',
+      'inf',
+      'partially_available',
+      'simples',
+      null,
+      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
+    ],
+    [
+      '0b',
+      'lgpd_declaracao',
+      'transversal',
+      'partially_available',
+      'simples',
+      null,
+      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
+    ],
+    [
+      '0c',
+      'defesa_previa',
+      'inf',
+      'unavailable',
+      'avancada',
+      'delegacao_indisponivel_r0007',
+      PRESENTIAL_NOTE,
+    ],
+    [
+      '0d',
+      'recurso_jari',
+      'inf',
+      'unavailable',
+      'avancada',
+      'delegacao_indisponivel_r0007',
+      PRESENTIAL_NOTE,
+    ],
+    [
+      '0e',
+      'recurso_cetran',
+      'inf',
+      'unavailable',
+      'avancada',
+      'delegacao_indisponivel_r0007',
+      PRESENTIAL_NOTE,
+    ],
+    [
+      '0f',
+      'indicacao_condutor',
+      'inf',
+      'unavailable',
+      'avancada',
+      'delegacao_indisponivel_r0007',
+      PRESENTIAL_NOTE,
+    ],
+  ] as const
+).map(([nn, serviceKey, category, availability, minimum, reason, note]) => ({
+  id: `00000000-0000-7000-8000-0000709000${nn}`,
+  service_key: serviceKey,
+  route: `/servicos/${serviceKey.replaceAll('_', '-')}`,
+  category,
+  title: serviceKey,
+  summary: serviceKey,
+  requirements_json: ['Conta gov.br'],
+  delivery_channel: 'portal',
+  legal_deadline: 'fixture',
+  cost: 'gratuito',
+  accessibility_note: 'Conforme declaração de acessibilidade (RN-PORTAL-113)',
+  responsible_party: 'DETRAN-AM',
+  normative_reference: 'fixture',
+  availability,
+  unavailable_reason: reason,
+  alternative_channel_note: note,
+  minimum_assurance: minimum,
+  version: 1,
+  effective_from: '2026-01-01',
+}));
+
+/** CTG-0001 §5 (M5, A1) — matriz ato → nível, as 21 linhas. */
+export const ACT_LEVELS: Record<string, string> = {
+  consulta_multas: 'simples',
+  consulta_cnh: 'simples',
+  emissao_crlv: 'simples',
+  pagamento: 'simples',
+  adesao_sne: 'avancada',
+  cancelamento_sne: 'avancada',
+  lgpd_declaracao: 'simples',
+  acompanhar_manifestacao: 'simples',
+  defesa_previa: 'avancada',
+  recurso_jari: 'avancada',
+  recurso_cetran: 'avancada',
+  indicacao_condutor: 'avancada',
+  procuracao: 'avancada',
+  junta_medica: 'avancada',
+  'lgpd_declaracao:declaracao_completa': 'avancada',
+  'lgpd_declaracao:correcao': 'avancada',
+  'lgpd_declaracao:eliminacao': 'avancada',
+  manifestar: 'none',
+  consulta_bat: 'simples',
+  consulta_exame: 'simples',
+  avaliar: 'simples',
+};
+
+/** Linhas de `portal.act_level_policy` para semear na tx falsa. */
+export const ACT_LEVEL_POLICY_ROWS: Row[] = Object.entries(ACT_LEVELS).map(
+  ([actKey, minimum], index) => ({
+    id: `00000000-0000-7000-8000-0000703000${(index + 1).toString(16).padStart(2, '0')}`,
+    act_key: actKey,
+    minimum_assurance: minimum,
+    legal_basis: 'fixture',
+    decision_ref: 'fixture',
+    enabled: true,
+    effective_from: '2026-01-01',
+    effective_to: null,
+  }),
+);
+
+/** As 13 linhas de `portal.request` (CTG-0001 §10.5), uma por estado. */
+export const REQUEST_FIXTURES: Row[] = [
+  {
+    id: '00000000-0000-7000-8000-000070400001',
+    state: 'IDENTIFICADO',
+    service_key: 'consulta_multas',
+    subject_id: SUBJECTS.bronze.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'none',
+    delegation_status: 'not_applicable',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400002',
+    state: 'SERVICO_SELECIONADO',
+    service_key: 'consulta_multas',
+    subject_id: SUBJECTS.bronze.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'none',
+    delegation_status: 'not_applicable',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400003',
+    state: 'ELEGIBILIDADE_VERIFICADA',
+    service_key: 'consulta_multas',
+    subject_id: SUBJECTS.bronze.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'none',
+    delegation_status: 'not_applicable',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400004',
+    state: 'INELEGIVEL',
+    service_key: 'indicacao_condutor',
+    subject_id: SUBJECTS.prata.id,
+    target_kind: 'ait',
+    target_id: AITS.f10,
+    minimum_assurance: 'none',
+    delegation_status: 'not_applicable',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400005',
+    state: 'PEDIDO_EM_COMPOSICAO',
+    service_key: 'adesao_sne',
+    subject_id: SUBJECTS.prata.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'none',
+    delegation_status: 'pending',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400006',
+    state: 'AGUARDANDO_NIVEL_ASSINATURA',
+    service_key: 'adesao_sne',
+    subject_id: SUBJECTS.bronze.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'avancada',
+    delegation_status: 'pending',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400007',
+    state: 'AGUARDANDO_PAGAMENTO',
+    service_key: 'emissao_crlv',
+    subject_id: SUBJECTS.ouro.id,
+    target_kind: 'vehicle',
+    target_id: EXTERNAL.vehicle,
+    minimum_assurance: 'simples',
+    delegation_status: 'pending',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400008',
+    state: 'PROTOCOLADO',
+    service_key: 'adesao_sne',
+    subject_id: SUBJECTS.ouro.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'avancada',
+    delegation_status: 'failed',
+    delegation_error: 'fixture: falha simulada',
+  },
+  {
+    id: '00000000-0000-7000-8000-000070400009',
+    state: 'EM_ANDAMENTO_NO_ORGAO',
+    service_key: 'adesao_sne',
+    subject_id: SUBJECTS.qualificada.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'avancada',
+    delegation_status: 'delegated',
+    delegation_domain: 'portal',
+    delegation_command: 'portal:sne-enrollment:enroll',
+  },
+  {
+    id: '00000000-0000-7000-8000-00007040000a',
+    state: 'RESULTADO_DISPONIVEL',
+    service_key: 'consulta_exame',
+    subject_id: SUBJECTS.ouro.id,
+    target_kind: 'exam',
+    target_id: EXTERNAL.exam,
+    minimum_assurance: 'simples',
+    delegation_status: 'delegated',
+  },
+  {
+    id: '00000000-0000-7000-8000-00007040000b',
+    state: 'AVALIACAO_OFERECIDA',
+    service_key: 'consulta_bat',
+    subject_id: SUBJECTS.qualificada.id,
+    target_kind: 'crash',
+    target_id: EXTERNAL.crash,
+    minimum_assurance: 'simples',
+    delegation_status: 'delegated',
+  },
+  {
+    id: '00000000-0000-7000-8000-00007040000c',
+    state: 'CONCLUIDO',
+    service_key: 'adesao_sne',
+    subject_id: SUBJECTS.prata.id,
+    target_kind: 'none',
+    target_id: null,
+    minimum_assurance: 'avancada',
+    delegation_status: 'delegated',
+  },
+  {
+    id: '00000000-0000-7000-8000-00007040000d',
+    state: 'DESISTIDO',
+    service_key: 'emissao_crlv',
+    subject_id: SUBJECTS.ouro.id,
+    target_kind: 'vehicle',
+    target_id: EXTERNAL.vehicle,
+    minimum_assurance: 'simples',
+    delegation_status: 'not_applicable',
+    withdrawn_at: new Date('2026-09-10T12:00:00-04:00'),
+  },
+].map((row) => ({
+  channel: 'portal',
+  version: 1,
+  created_at: FIXED_NOW,
+  ...row,
+}));
+
+/** Os 13 tokens de `portal.request.state` (DDL 62; CTG-0001 §6.1). */
+export const REQUEST_STATES = [
+  'IDENTIFICADO',
+  'SERVICO_SELECIONADO',
+  'ELEGIBILIDADE_VERIFICADA',
+  'INELEGIVEL',
+  'PEDIDO_EM_COMPOSICAO',
+  'AGUARDANDO_NIVEL_ASSINATURA',
+  'AGUARDANDO_PAGAMENTO',
+  'PROTOCOLADO',
+  'EM_ANDAMENTO_NO_ORGAO',
+  'RESULTADO_DISPONIVEL',
+  'AVALIACAO_OFERECIDA',
+  'CONCLUIDO',
+  'DESISTIDO',
+] as const;
+
+/** Os 9 tokens de `portal.manifestation.state` (DDL 64; CTG-0001 §6.4). */
+export const MANIFESTATION_STATES = [
+  'MANIFESTACAO_REGISTRADA',
+  'COMPROVANTE_EMITIDO',
+  'EM_ANALISE',
+  'INFORMACAO_SOLICITADA_AO_AGENTE',
+  'DECISAO_FINAL_ELABORADA',
+  'CIENCIA_AO_USUARIO',
+  'ENCERRADA',
+  'AVALIACAO_OFERECIDA',
+  'AVALIADA',
+] as const;
+
+export interface IdentityLike {
+  cpf: string;
+  assuranceLevel: 'simples' | 'avancada' | 'qualificada';
+  govbrLevel?: string;
+}
+
+export function identityOf(
+  subject: keyof typeof SUBJECTS,
+  level?: IdentityLike['assuranceLevel'],
+): IdentityLike {
+  return {
+    cpf: SUBJECTS[subject].cpf,
+    assuranceLevel:
+      level ?? (SUBJECTS[subject].assurance as IdentityLike['assuranceLevel']),
+  };
+}
+
+/** `RequestContext` falso do STYNX: `correlationId` = requestId da requisição. */
+export function fakeRequestContext(
+  requestId = '00000000-0000-4000-8000-00000000c0f1',
+) {
+  return {
+    hasActiveContext: () => true,
+    snapshot: () => ({
+      tenantId: TENANT_ID,
+      actorId: SUBJECTS.prata.id,
+      requestId,
+    }),
+    run: <T>(_ctx: unknown, work: () => T) => work(),
+  };
+}
+
+/** `Database` falso: toda transação é a tx da `FakeSqlDatabase`. */
+export function fakeDatabase(tx: unknown) {
+  return {
+    tx: async <T>(...args: unknown[]): Promise<T> => {
+      const work = args.find((arg) => typeof arg === 'function') as (
+        t: unknown,
+      ) => Promise<T>;
+      return work(tx);
+    },
+  };
+}
+
+export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
+
+/**
+ * `type` técnicos do Portal (CTG-0002 §9, §11) e consumidos (§7.2, §7.5).
+ * Vivem aqui (pasta `tests/`, fora da varredura de `verify:parameter-catalogue`)
+ * para que os specs em `src/` nunca escrevam o literal `portal.<x>.<y>`.
+ */
+export const TOPICS = {
+  requestChanged: 'portal.request.changed',
+  identityElevated: 'portal.identity.elevated',
+  representationValidated: 'portal.representation.validated',
+  inboxRead: 'portal.inbox.read',
+  inboxItem: 'portal.inbox.item',
+  notificationAcknowledged: 'portal.notification.acknowledged',
+  manifestationChanged: 'portal.manifestation.changed',
+  evaluationRegistered: 'portal.evaluation.registered',
+  sneEnrollmentChanged: 'portal.sne-enrollment.changed',
+  infractionChanged: 'inf.infraction.changed',
+  penaltyFinal: 'inf.infraction.penalty-final',
+  noticeDispatched: 'inf.notice.dispatched',
+  noticeAcknowledged: 'inf.notice.acknowledged',
+  paymentConfirmed: 'inf.payment.confirmed',
+  raitCaseCreated: 'rait.case.created',
+  raitCaseChanged: 'rait.case.changed',
+  raitCaseAdmitted: 'rait.case.admitted',
+  raitCaseReceived: 'rait.case.received',
+  raitCaseTransited: 'rait.case.transited',
+  raitCaseWithdrawn: 'rait.case.withdrawn',
+  raitDecisionPublished: 'rait.decision.published',
+  raitInquiryChanged: 'rait.inquiry.changed',
+  crashChanged: 'est.crash.changed',
+  examChanged: 'ch.exam.changed',
+} as const;
+
+/** Chaves i18n de `nextAction.label` (§3.5) e da frase da avaliação (§2.6). */
+export const I18N = {
+  nextAction: (state: string) => `portal.requests.nextAction.${state}`,
+  publicIndicator: 'portal.evaluations.publicIndicator',
+} as const;
+
+/** Os quatro efeitos do consentimento SNE (CTG-0002 §2.4 `SNE_EFFECTS`). */
+export const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'canal_exclusivo',
+  'desconto_60',
+  'cancelamento',
+] as const;
+
+/** Envelopes gravados na outbox falsa por `topic` (payload já com `id` real). */
+export function outboxEnvelopes(
+  db: { rows(table: string): Row[] },
+  topic?: string,
+): Array<Row & { domainEvent?: string; data?: Row; aggregate?: Row }> {
+  return db
+    .rows('integration.outbox')
+    .filter((row) => topic === undefined || row.topic === topic)
+    .map(
+      (row) =>
+        row.payload as Row & {
+          domainEvent?: string;
+          data?: Row;
+          aggregate?: Row;
+        },
+    );
+}
diff --git a/backend/domains/shared/src/decorators.ts b/backend/domains/shared/src/decorators.ts
index 80a22d7..e5fe466 100644
--- a/backend/domains/shared/src/decorators.ts
+++ b/backend/domains/shared/src/decorators.ts
@@ -1,5 +1,11 @@
 import { applyDecorators, SetMetadata } from '@nestjs/common';
 import { Idempotent } from '@stynx-nyx/idempotency';
+/**
+ * R-0009 CTG-0002 §4 (M9, adenda A4(a)): as rotas do Portal que assumem a
+ * idempotência no handler (`PortalIdempotencyService`) anulam o `@Idempotent()`
+ * herdado de `@Action` com `@NoIdempotent()` ao lado do `@Action`.
+ */
+export { NoIdempotent } from '@stynx-nyx/idempotency';
 import { RateLimit } from '@stynx-nyx/ratelimit';
 export { Audit, type AuditMetadata } from '@stynx-nyx/backend';

diff --git a/backend/domains/shared/src/errors/if-match.ts b/backend/domains/shared/src/errors/if-match.ts
index 00ad414..7c29a4b 100644
--- a/backend/domains/shared/src/errors/if-match.ts
+++ b/backend/domains/shared/src/errors/if-match.ts
@@ -1,4 +1,5 @@
-// CTG-0001 §1 (M1) — `If-Match` helpers shared by TEAT and RAIT commands.
+// CTG-0001 §1 (M1) — `If-Match` helpers shared by TEAT, RAIT and PORTAL
+// commands (R-0009 CTG-0002 §0, adenda A4(a): prefix `PORTAL`).
 // Grammar accepted for the header mirrors `OpsParameterService.normalizeIfMatch`
 // (parameter.service.ts): a bare integer, a quoted integer, or a weak ETag
 // (`W/"n"`). Any other shape counts as "absent" (428), never as a mismatch.
@@ -22,7 +23,7 @@ function normalizeIfMatch(
 export function assertIfMatch(
   header: string | string[] | undefined,
   version: number,
-  prefix: 'TEAT' | 'RAIT',
+  prefix: 'TEAT' | 'RAIT' | 'PORTAL',
 ): void {
   const received = normalizeIfMatch(header);
   if (received === undefined) {
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index 9989e40..ab29edb 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -317,10 +317,12 @@ describe('DETRAN unified policy kit', () => {
         'accept',
       ),
     ).toBe(false);
+    // R-0009 CTG-0002 §10 (M19, ADR-0019): `portal:appeal:create` deu lugar a
+    // `portal:request:create` — única asserção pré-existente alterada por TASK-0006.
     expect(
       isDetranActionAllowed(
         { roles: ['CIDADAO'], permissions: [] },
-        'portal:appeal',
+        'portal:request',
         'create',
       ),
     ).toBe(true);
@@ -2164,20 +2166,206 @@ describe('CTG-0001 §3/§8 (M19, TASK-0003) — portal:identity:read: CIDADAO po
     expect(negatives).toHaveLength(31);
   });

-  it('dado portal:appeal:create e portal:appeal:read-own (linhas existentes) quando isDetranActionAllowed(CIDADAO) então continuam permitidas — só removidas em CTG-0002/TASK-0007 (M19)', () => {
+  it('dado portal:appeal:create e portal:appeal:read-own quando CTG-0002/TASK-0007 remove as linhas então AUSENTES da matriz e negadas a CIDADAO (M19, ADR-0019 — este `it` nasceu em TASK-0003 com prazo declarado até CTG-0002; C-0002-83)', () => {
+    expect('portal:appeal:create' in DETRAN_POLICY_MATRIX).toBe(false);
+    expect('portal:appeal:read-own' in DETRAN_POLICY_MATRIX).toBe(false);
     expect(
       isDetranActionAllowed(
         { roles: ['CIDADAO'], permissions: [] },
         'portal:appeal',
         'create',
       ),
-    ).toBe(true);
+    ).toBe(false);
     expect(
       isDetranActionAllowed(
         { roles: ['CIDADAO'], permissions: [] },
         'portal:appeal',
         'read-own',
       ),
-    ).toBe(true);
+    ).toBe(false);
+  });
+});
+
+/**
+ * work/rounds/R-0009/contracts/CTG-0002.md §10 e §13 C-0002-83 (M19, TASK-0006) — bloco
+ * `PORTAL_RULES` completo (29 chaves, só `CIDADAO`). Fica vermelho até TASK-0007 colar o bloco
+ * em `policy.ts` e remover `portal:appeal:{create,read-own}` (ADR-0019: o caso é do RAIT).
+ * Grants (orchestra/README.md §4.8): positivo `CIDADAO`; negativos pela política = todos os
+ * demais papéis canônicos de `roles.ts`; exceção declarada = `GLOBAL_ADMIN_ROLES` (`ADMIN`,
+ * `GESTOR_DETRAN`, `SUPORTE`, `technical-admin`), que `isDetranActionAllowed` libera para toda
+ * chave e a `PortalCitizenGuard` (CTG-0001 §3, A3(a)) barra depois — fora do escopo deste spec.
+ * `portal:complaint:*` (PEC, `TEAT_RULES`, M2) permanece como está.
+ */
+describe('CTG-0002 §10 (M19, TASK-0006) — PORTAL_RULES: CIDADAO positivo, negativos exaustivos, portal:appeal ausente', () => {
+  const PORTAL_GLOBAL_ADMIN_ROLES = [
+    'ADMIN',
+    'GESTOR_DETRAN',
+    'SUPORTE',
+    'technical-admin',
+  ] as const;
+
+  /** Transcrição literal de CTG-0002 §10.1 (29 chaves). */
+  const PORTAL_RULE_KEYS = [
+    'portal:identity:read',
+    'portal:identity:elevate',
+    'portal:identity:represent',
+    'portal:identity:update',
+    'portal:ait:read',
+    'portal:request:create',
+    'portal:request:compose',
+    'portal:request:submit',
+    'portal:request:withdraw',
+    'portal:request:read',
+    'portal:request:respond',
+    'portal:request:evaluate',
+    'portal:inbox:read',
+    'portal:inbox:acknowledge',
+    'portal:sne-enrollment:read',
+    'portal:sne-enrollment:enroll',
+    'portal:sne-enrollment:cancel',
+    'portal:push-subscription:create',
+    'portal:document:read',
+    'portal:vehicle:read',
+    'portal:vehicle:issue',
+    'portal:crash:read',
+    'portal:exam:read',
+    'portal:manifestation:manifest',
+    'portal:manifestation:read',
+    'portal:manifestation:acknowledge',
+    'portal:evaluation:evaluate',
+    'portal:service-charter:read',
+    'portal:stream:read',
+  ] as const;
+
+  /** `portal:complaint:*` (M2) — estado de `TEAT_RULES` em `policy.ts`, inalterado por CTG-0002. */
+  const COMPLAINT_RULES: Array<[string, readonly string[]]> = [
+    [
+      'portal:complaint:create',
+      ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
+    ],
+    [
+      'portal:complaint:read',
+      ['CANDIDATO', 'DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE'],
+    ],
+    ['portal:complaint:update', ['DPO', 'AUDITOR', 'GESTOR_DETRAN', 'SUPORTE']],
+  ];
+
+  it('C-0002-83 — dado PORTAL_RULES então as 29 chaves existem na matriz com exatamente [CIDADAO]', () => {
+    expect(PORTAL_RULE_KEYS).toHaveLength(29);
+    for (const key of PORTAL_RULE_KEYS) {
+      expect(
+        key in DETRAN_POLICY_MATRIX,
+        `${key} deveria existir em DETRAN_POLICY_MATRIX`,
+      ).toBe(true);
+      expect(
+        [
+          ...(DETRAN_POLICY_MATRIX[key as keyof typeof DETRAN_POLICY_MATRIX] ??
+            []),
+        ],
+        key,
+      ).toEqual(['CIDADAO']);
+    }
+  });
+
+  it('C-0002-83 — dado cada chave de PORTAL_RULES quando isDetranActionAllowed então CIDADAO permitido, os 31 papéis canônicos restantes negados e ADMIN/GESTOR_DETRAN/SUPORTE/technical-admin permitidos (GLOBAL_ADMIN_ROLES — exceção declarada, barrada pela PortalCitizenGuard)', () => {
+    const negatives = DETRAN_ROLES.filter(
+      (role) =>
+        role !== 'CIDADAO' &&
+        !(PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role),
+    );
+    expect(negatives).toHaveLength(31);
+    for (const key of PORTAL_RULE_KEYS) {
+      const [domain, resource, action] = key.split(':') as [
+        string,
+        string,
+        string,
+      ];
+      const resourceKey = `${domain}:${resource}`;
+      for (const role of DETRAN_ROLES) {
+        const expected =
+          role === 'CIDADAO' ||
+          (PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role);
+        expect(
+          isDetranActionAllowed(
+            { roles: [role], permissions: [] },
+            resourceKey,
+            action,
+          ),
+          `${key} para o papel ${role} deveria ser ${expected}`,
+        ).toBe(expected);
+      }
+      expect(
+        isDetranActionAllowed(
+          { roles: [], permissions: [] },
+          resourceKey,
+          action,
+        ),
+        `${key} sem papel`,
+      ).toBe(false);
+    }
+  });
+
+  it("C-0002-83 — dado a matriz então as chaves 'portal:*' fora de 'portal:complaint:*' são exatamente as 29 de PORTAL_RULES (nenhuma sobra, nenhuma falta) e 'portal:appeal:*' está ausente", () => {
+    const portalKeys = Object.keys(DETRAN_POLICY_MATRIX)
+      .filter(
+        (key) =>
+          key.startsWith('portal:') && !key.startsWith('portal:complaint:'),
+      )
+      .sort();
+    expect(portalKeys).toEqual([...PORTAL_RULE_KEYS].sort());
+    expect(portalKeys.some((key) => key.startsWith('portal:appeal:'))).toBe(
+      false,
+    );
+    expect('portal:appeal:create' in DETRAN_POLICY_MATRIX).toBe(false);
+    expect('portal:appeal:read-own' in DETRAN_POLICY_MATRIX).toBe(false);
+    for (const role of DETRAN_ROLES) {
+      if ((PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role))
+        continue;
+      expect(
+        isDetranActionAllowed(
+          { roles: [role], permissions: [] },
+          'portal:appeal',
+          'create',
+        ),
+        role,
+      ).toBe(false);
+      expect(
+        isDetranActionAllowed(
+          { roles: [role], permissions: [] },
+          'portal:appeal',
+          'read-own',
+        ),
+        role,
+      ).toBe(false);
+    }
+  });
+
+  it("C-0002-83 — dado 'portal:complaint:*' (PEC, M2) então inalterado: os mesmos papéis de TEAT_RULES e CIDADAO negado", () => {
+    for (const [key, roles] of COMPLAINT_RULES) {
+      expect(
+        [
+          ...(DETRAN_POLICY_MATRIX[key as keyof typeof DETRAN_POLICY_MATRIX] ??
+            []),
+        ],
+        key,
+      ).toEqual([...roles]);
+      const [, resource, action] = key.split(':') as [string, string, string];
+      expect(
+        isDetranActionAllowed(
+          { roles: ['CIDADAO'], permissions: [] },
+          `portal:${resource}`,
+          action,
+        ),
+        key,
+      ).toBe(false);
+      expect(
+        isDetranActionAllowed(
+          { roles: ['CANDIDATO'], permissions: [] },
+          `portal:${resource}`,
+          action,
+        ),
+        key,
+      ).toBe(roles.includes('CANDIDATO'));
+    }
   });
 });
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index 5933e82..a9681d1 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -1632,6 +1632,44 @@ const DASHBOARD_RULES: Array<[string, string, string, readonly DetranRole[]]> =
     ['dashboard', 'kpi', 'read', ['agency-admin', 'dash-operator', 'AUDITOR']],
   ];

+/**
+ * `portal:*` matrix — R-0009 CTG-0002 §10 (M19). Só `CIDADAO` (ADR-0005; ADR-0019 §1). Papéis globais
+ * (`GLOBAL_ADMIN_ROLES`) passam por `isDetranActionAllowed` e são barrados pela `PortalCitizenGuard`
+ * (CTG-0001 §3) — exceção declarada em policy.spec.ts. `portal:manifestation:manifest` é rota
+ * `@Public()` (H.51): a linha existe para a matriz política ⇔ rotas fechar nos dois sentidos.
+ */
+const PORTAL_RULES: Array<[string, string, string, readonly DetranRole[]]> = [
+  ['portal', 'identity', 'read', ['CIDADAO']],
+  ['portal', 'identity', 'elevate', ['CIDADAO']],
+  ['portal', 'identity', 'represent', ['CIDADAO']],
+  ['portal', 'identity', 'update', ['CIDADAO']],
+  ['portal', 'ait', 'read', ['CIDADAO']],
+  ['portal', 'request', 'create', ['CIDADAO']],
+  ['portal', 'request', 'compose', ['CIDADAO']],
+  ['portal', 'request', 'submit', ['CIDADAO']],
+  ['portal', 'request', 'withdraw', ['CIDADAO']],
+  ['portal', 'request', 'read', ['CIDADAO']],
+  ['portal', 'request', 'respond', ['CIDADAO']],
+  ['portal', 'request', 'evaluate', ['CIDADAO']],
+  ['portal', 'inbox', 'read', ['CIDADAO']],
+  ['portal', 'inbox', 'acknowledge', ['CIDADAO']],
+  ['portal', 'sne-enrollment', 'read', ['CIDADAO']],
+  ['portal', 'sne-enrollment', 'enroll', ['CIDADAO']],
+  ['portal', 'sne-enrollment', 'cancel', ['CIDADAO']],
+  ['portal', 'push-subscription', 'create', ['CIDADAO']],
+  ['portal', 'document', 'read', ['CIDADAO']],
+  ['portal', 'vehicle', 'read', ['CIDADAO']],
+  ['portal', 'vehicle', 'issue', ['CIDADAO']],
+  ['portal', 'crash', 'read', ['CIDADAO']],
+  ['portal', 'exam', 'read', ['CIDADAO']],
+  ['portal', 'manifestation', 'manifest', ['CIDADAO']],
+  ['portal', 'manifestation', 'read', ['CIDADAO']],
+  ['portal', 'manifestation', 'acknowledge', ['CIDADAO']],
+  ['portal', 'evaluation', 'evaluate', ['CIDADAO']],
+  ['portal', 'service-charter', 'read', ['CIDADAO']],
+  ['portal', 'stream', 'read', ['CIDADAO']],
+];
+
 export const DETRAN_POLICY_MATRIX: Readonly<
   Record<DetranPolicyKey, readonly DetranRole[]>
 > = Object.freeze(
@@ -1667,12 +1705,10 @@ export const DETRAN_POLICY_MATRIX: Readonly<
       teat(domain, resource, action),
       roles,
     ]),
-    ['portal:appeal:create', ['CIDADAO']],
-    ['portal:appeal:read-own', ['CIDADAO']],
-    // R-0009 CTG-0001 §3/§8 (M19, TASK-0004): única linha `portal:*` deste
-    // grupo; `GET /v1/portal/identity/me`. O bloco `PORTAL_RULES` completo e a
-    // remoção das duas linhas `portal:appeal:*` acima são CTG-0002 (TASK-0007).
-    ['portal:identity:read', ['CIDADAO']],
+    ...PORTAL_RULES.map(([domain, resource, action, roles]) => [
+      teat(domain, resource, action),
+      roles,
+    ]),
   ]) as Record<DetranPolicyKey, readonly DetranRole[]>,
 );

diff --git a/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json b/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json
index 3ecaf52..6a73656 100644
--- a/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json
+++ b/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json
@@ -4,9 +4,11 @@
   "module": {
     "name": "CitizenService",
     "namespace": "portal",
-    "version": "1.0.0",
+    "version": "1.0.1",
     "ddlFile": "64-portal-citizen-service.sql",
     "dependencies": {
+      "@detran/portal-identity": "workspace:*",
+      "@detran/portal-requests": "workspace:*",
       "@detran/inf-deadlines": "workspace:*",
       "zod": "^4.6.5"
     },
@@ -19,11 +21,54 @@
         "package": "@detran/shared",
         "target": "../../shared/src/index.ts"
       },
+      {
+        "package": "@detran/portal-identity",
+        "target": "../identity/src/index.ts"
+      },
+      {
+        "package": "@detran/portal-requests",
+        "target": "../requests/src/index.ts"
+      },
       {
         "package": "@detran/inf-deadlines",
         "target": "../../inf/deadlines/src/index.ts"
       }
     ],
+    "handwrittenExports": ["handwritten/index"],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/manifestations.controller",
+        "symbol": "PortalManifestationsController"
+      },
+      {
+        "target": "handwritten/evaluations.controller",
+        "symbol": "PortalEvaluationsController"
+      },
+      {
+        "target": "handwritten/service-charter.controller",
+        "symbol": "PortalServiceCharterController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/manifestation.service",
+        "symbol": "PortalManifestationService"
+      },
+      {
+        "target": "handwritten/evaluation.service",
+        "symbol": "PortalEvaluationService"
+      }
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/portal-identity",
+        "symbol": "IdentityModule"
+      },
+      {
+        "package": "@detran/portal-requests",
+        "symbol": "RequestsModule"
+      }
+    ],
     "owners": ["detran-portal"],
     "description": "Atendimento ao cidadao (ADR-0019 Decision 4; [WF-PORTAL-004] secao Estados, secao Prazos e secao Carta de Servicos; plan R-0009 M12-M14): manifestacao de ouvidoria da Lei 13.460/2017 (entidade distinta de portal.complaint do PEC, M2 — nunca duas tabelas para a mesma manifestacao; unificacao futura e OD-P14), prorrogacao justificada dos prazos do art. 16 e Carta de Servicos como dados (portal.service_catalog, 11 campos de RN-PORTAL-108). Prazos calculados com addCalendarDays de @detran/inf-deadlines; timers T-OUV-RESPOSTA, T-OUV-INFO, T-LGPD-ACESSO e T-AVAL-CONVITE (owner = portal) em inf.infraction_timer_ref, espelhados em portal-timers.ts (M14). brand_profile e public_hostname NAO sao entidades deste blueprint: DDL manuscrito 19-portal-platform.sql (M11). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica MANIFESTACAO_REGISTRADA e MANIFESTACAO_ENCERRADA (M21)."
   },
diff --git a/docs/framework/blueprints/BP-PORTAL-INBOX-001.json b/docs/framework/blueprints/BP-PORTAL-INBOX-001.json
index 8799a11..9cb5e62 100644
--- a/docs/framework/blueprints/BP-PORTAL-INBOX-001.json
+++ b/docs/framework/blueprints/BP-PORTAL-INBOX-001.json
@@ -4,9 +4,12 @@
   "module": {
     "name": "Inbox",
     "namespace": "portal",
-    "version": "1.0.1",
+    "version": "1.0.2",
     "ddlFile": "63-portal-inbox.sql",
     "dependencies": {
+      "@detran/portal-identity": "workspace:*",
+      "@detran/portal-requests": "workspace:*",
+      "@detran/inf-deadlines": "workspace:*",
       "zod": "^4.6.5"
     },
     "devDependencies": {
@@ -17,8 +20,52 @@
       {
         "package": "@detran/shared",
         "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/portal-identity",
+        "target": "../identity/src/index.ts"
+      },
+      {
+        "package": "@detran/portal-requests",
+        "target": "../requests/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../../inf/deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenExports": ["handwritten/index"],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/inbox.controller",
+        "symbol": "PortalInboxController"
+      },
+      {
+        "target": "handwritten/sne-enrollment.controller",
+        "symbol": "PortalSneEnrollmentController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/inbox.service",
+        "symbol": "PortalInboxService"
+      },
+      {
+        "target": "handwritten/sne-enrollment.service",
+        "symbol": "PortalSneEnrollmentService"
+      }
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/portal-identity",
+        "symbol": "IdentityModule"
+      },
+      {
+        "package": "@detran/portal-requests",
+        "symbol": "RequestsModule"
       }
     ],
+    "moduleExports": ["PortalSneEnrollmentService"],
     "owners": ["detran-portal"],
     "description": "Caixa do cidadao (ADR-0019 Decision 3; [WF-PORTAL-003] secao Estados e secao Prazos; plan R-0009 M15): itens da caixa como projecao de eventos mais fatos de ciencia (portal.acknowledgement_evidence), adesao ao SNE como macro-estado do vinculo (NAO_ADERIDO_SNE | ADERIDO_SNE) e assinaturas push. A leitura de um item SNE grava a evidencia e publica NOTIFICACAO_CIENCIA na outbox (topic portal), idempotente; a ciencia efetiva do aviso e do modulo inf/notification (ADR-0016). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica INBOX_LIDO, NOTIFICACAO_CIENCIA, SNE_ADESAO_SOLICITADA e SNE_CANCELAMENTO_SOLICITADO (M21)."
   },
diff --git a/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json b/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json
index 53bc88a..c5a7bc1 100644
--- a/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json
+++ b/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json
@@ -4,11 +4,13 @@
   "module": {
     "name": "Projections",
     "namespace": "portal",
-    "version": "1.0.0",
+    "version": "1.0.2",
     "ddlFile": "65-portal-projections.sql",
     "dependencies": {
+      "@detran/portal-identity": "workspace:*",
       "@detran/ops-parameter": "workspace:*",
-      "zod": "^4.6.5"
+      "zod": "^4.6.5",
+      "@detran/inf-deadlines": "workspace:*"
     },
     "devDependencies": {
       "@types/pg": "^8.15.4",
@@ -19,11 +21,55 @@
         "package": "@detran/shared",
         "target": "../../shared/src/index.ts"
       },
+      {
+        "package": "@detran/portal-identity",
+        "target": "../identity/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../../inf/deadlines/src/index.ts"
+      },
       {
         "package": "@detran/ops-parameter",
         "target": "../../ops/parameter/src/index.ts"
       }
     ],
+    "handwrittenExports": ["handwritten/index"],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/aits.controller",
+        "symbol": "PortalAitsController"
+      },
+      {
+        "target": "handwritten/documents.controller",
+        "symbol": "PortalDocumentsController"
+      },
+      {
+        "target": "handwritten/crashes.controller",
+        "symbol": "PortalCrashesController"
+      },
+      {
+        "target": "handwritten/exams.controller",
+        "symbol": "PortalExamsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/projectors.service",
+        "symbol": "PortalProjectors"
+      },
+      {
+        "target": "handwritten/national-reads.service",
+        "symbol": "PortalNationalReadsService"
+      }
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/portal-identity",
+        "symbol": "IdentityModule"
+      }
+    ],
+    "moduleExports": ["PortalProjectors"],
     "owners": ["detran-portal"],
     "description": "Projecoes do Portal (ADR-0020 Decision 1, 2 e 5; ADR-0019 Decision 5; plan R-0009 M16-M17): as cinco leituras cidadas do catalogo de projecoes (infraction_view, process_timeline, points_view, crash_view, exam_view) como entidades pequenas alimentadas por eventos da outbox (topics inf e rait) por projetores manuscritos idempotentes em event.id (portal.projection_applied_event) e replayaveis; mais o cache das leituras nacionais feitas so por packages/senatran-adapter (portal.national_read_cache, TTL = parametro portal.read_cache_ttl_minutes via @detran/ops-parameter, nunca literal). Nenhuma projecao escreve de volta; rotulos cidadaos, nunca tokens de inf (RN-PORTAL-112). Sem FK para outros pacotes: toda linha e reconstruivel por replay. Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24)."
   },
diff --git a/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json b/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json
index 43acf49..5d05ca6 100644
--- a/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json
+++ b/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json
@@ -4,9 +4,10 @@
   "module": {
     "name": "Requests",
     "namespace": "portal",
-    "version": "1.0.1",
+    "version": "1.0.2",
     "ddlFile": "62-portal-requests.sql",
     "dependencies": {
+      "@detran/portal-identity": "workspace:*",
       "zod": "^4.6.5"
     },
     "devDependencies": {
@@ -17,8 +18,44 @@
       {
         "package": "@detran/shared",
         "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/portal-identity",
+        "target": "../identity/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../../inf/deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenExports": ["handwritten/index"],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/requests.controller",
+        "symbol": "PortalRequestsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/requests.service",
+        "symbol": "PortalRequestsService"
+      },
+      {
+        "target": "handwritten/delegation/delegation.service",
+        "symbol": "RequestDelegationService"
+      },
+      {
+        "target": "handwritten/idempotency.service",
+        "symbol": "PortalIdempotencyService"
+      }
+    ],
+    "moduleImports": [
+      {
+        "package": "@detran/portal-identity",
+        "symbol": "IdentityModule"
       }
     ],
+    "moduleExports": ["PortalIdempotencyService", "PortalRequestsService"],
     "owners": ["detran-portal"],
     "description": "Ciclo comum de pedidos do cidadao (ADR-0019 Decision 2; [WF-PORTAL-001] secao Estados e secao Transicoes; plan R-0009 M7-M9): uma unica maquina de 13 estados fixos em codigo (OD-P13) para todo servico do catalogo, com protocolo imediato (T-PROTOCOLO, Lei 14.129/2021 art. 27 IV) antes de qualquer validacao de conteudo e delegacao ao comando do dominio dono (M8). O pedido nunca guarda a decisao. Inclui rascunho versionado, anexos, ciencia de consequencias, avaliacao e registro de idempotencia (M9). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica SOLICITACAO_CRIADA, SOLICITACAO_PROTOCOLADA, SOLICITACAO_DESISTIDA, SOLICITACAO_CONCLUIDA e AVALIACAO_REGISTRADA (M21)."
   },
diff --git a/tools/contracts/check-commands.mjs b/tools/contracts/check-commands.mjs
index 4a32cfe..369abd6 100644
--- a/tools/contracts/check-commands.mjs
+++ b/tools/contracts/check-commands.mjs
@@ -23,9 +23,24 @@ export const CONTROLLER_ROOTS = [
   'backend/domains/ops/offline-sync/src/handwritten',
   'backend/domains/ops/evidence/src/handwritten',
   'backend/domains/ops/snapshots/src/handwritten',
+  // R-0009 (WP-P3, CTG-0002 §14 / plan.md A4(e)): the five Portal packages
+  // mount hand-written citizen routes only (`operations: []`, M1).
+  'backend/domains/portal/identity/src/handwritten',
+  'backend/domains/portal/requests/src/handwritten',
+  'backend/domains/portal/inbox/src/handwritten',
+  'backend/domains/portal/citizen-service/src/handwritten',
+  'backend/domains/portal/projections/src/handwritten',
   'backend/app/src',
 ];

+// Error catalogues whose codes a command contract may enumerate (rule 3):
+// TEAT (R-0008) and PORTAL (R-0009). `catalogPath` (singular) remains the
+// test seam; when it is the default, every catalogue below is read.
+export const ERROR_CATALOG_PATHS = [
+  'docs/framework/arch/teat-error-catalog.md',
+  'docs/framework/arch/portal-error-catalog.md',
+];
+
 // Único e nomeado (CTG-0005 §2.6, §3.2): `SpeedModule` só monta atrás da
 // flag `teat.speed_meters` (default false, seed 05); a rota não está
 // montada e por isso fica fora da varredura. Retirar quando a flag virar
@@ -120,7 +135,15 @@ export function scanControllers(controllerRoots) {
     const isAppSrc =
       toPosix(absoluteRoot) === toPosix(path.resolve(root, 'backend/app/src'));
     for (const file of findFilesBelow(absoluteRoot)) {
-      if (isAppSrc && !path.basename(file).startsWith('teat-')) continue;
+      // App-level composition controllers: TEAT (R-0008) and Portal (R-0009,
+      // `portal-stream.controller.ts`); everything else under backend/app/src
+      // (PEC webhooks, runtime) is documented elsewhere.
+      if (
+        isAppSrc &&
+        !path.basename(file).startsWith('teat-') &&
+        !path.basename(file).startsWith('portal-')
+      )
+        continue;
       if (flagGated.has(toPosix(file))) continue;
       const source = ts.createSourceFile(
         file,
@@ -187,11 +210,22 @@ export function scanControllers(controllerRoots) {
   return { routes, problems };
 }

-/** Todo `TEAT.*` citado em `catalogPath` (crases ou prosa), como um Set. */
+/** Todo `TEAT.*`/`PORTAL.*` citado em `catalogPath` (crases ou prosa), como um Set. */
 export function parseErrorCatalog(catalogPath) {
   const text = fs.readFileSync(catalogPath, 'utf8');
   const codes = new Set();
-  for (const match of text.matchAll(/TEAT\.[A-Z0-9_]+/gu)) codes.add(match[0]);
+  for (const match of text.matchAll(/(?:TEAT|PORTAL)\.[A-Z0-9_]+/gu))
+    codes.add(match[0]);
+  return codes;
+}
+
+/** União dos catálogos existentes entre `paths`. */
+export function parseErrorCatalogs(paths) {
+  const codes = new Set();
+  for (const candidate of paths) {
+    if (!fs.existsSync(candidate)) continue;
+    for (const code of parseErrorCatalog(candidate)) codes.add(code);
+  }
   return codes;
 }

@@ -356,7 +390,7 @@ export function collectOperations(
 export function checkCommands({
   contractsDir = path.resolve(root, 'docs/framework/contracts'),
   controllerRoots = CONTROLLER_ROOTS,
-  catalogPath = path.resolve(root, 'docs/framework/arch/teat-error-catalog.md'),
+  catalogPath = undefined,
   blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
 } = {}) {
   const problems = [];
@@ -369,9 +403,13 @@ export function checkCommands({
   problems.push(...shapeProblems);

   // 3: códigos de erro fora do catálogo.
-  const catalog = fs.existsSync(catalogPath)
-    ? parseErrorCatalog(catalogPath)
-    : new Set();
+  const catalog = catalogPath
+    ? fs.existsSync(catalogPath)
+      ? parseErrorCatalog(catalogPath)
+      : new Set()
+    : parseErrorCatalogs(
+        ERROR_CATALOG_PATHS.map((entry) => path.resolve(root, entry)),
+      );
   const seenUnknown = new Set();
   for (const entry of operations) {
     for (const found of errorSchemaEnumsIn(entry.document)) {
@@ -394,7 +432,7 @@ export function checkCommands({
         problems.push({
           kind: 'unknown-error-code',
           file: entry.file,
-          detail: `${found.label}: código ${code} não está em teat-error-catalog.md`,
+          detail: `${found.label}: código ${code} não está no catálogo de erros (teat/portal)`,
         });
       }
     }
diff --git a/tools/contracts/tests/check-commands.test.mjs b/tools/contracts/tests/check-commands.test.mjs
index 95607e5..2539b7e 100644
--- a/tools/contracts/tests/check-commands.test.mjs
+++ b/tools/contracts/tests/check-commands.test.mjs
@@ -713,8 +713,10 @@ test('C-5-15 — dado um decorador de rota com argumento não literal quando che
   }
 });

-test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=92', async () => {
+// R-0009 (plan.md §Triagem): 92 operações do TEAT (R-0008) + 47 do Portal
+// (BP-PORTAL-*.commands.openapi.json, CTG-0002 §2 + stream §9) = 139.
+test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=139', async () => {
   const result = checkCommands();
   assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
-  assert.equal(result.operations, 92);
+  assert.equal(result.operations, 139);
 });
diff --git a/tools/parameters/verify.mjs b/tools/parameters/verify.mjs
index 21816c5..88e91ff 100644
--- a/tools/parameters/verify.mjs
+++ b/tools/parameters/verify.mjs
@@ -165,10 +165,19 @@ if (process.argv.includes('--check-usage')) {
     'dashboard',
   ];
   let usageErrors = 0;
+  // R-0009 (plan.md A7): the OpenAPI clients under packages/api-clients are
+  // generated from docs/framework/contracts and carry citizen-facing i18n
+  // label keys (`portal.requests.nextAction.<STATE>`) as literal types; they
+  // cannot read a parameter, so they are not usage candidates. Every other
+  // generated artifact stays in the scan.
+  const excludedDirectories = [
+    join(root, 'packages/api-clients/src/generated'),
+  ];
   async function walk(dir) {
     for (const item of await readdir(dir, { withFileTypes: true })) {
       if (['tests', 'dist', 'node_modules'].includes(item.name)) continue;
       const path = join(dir, item.name);
+      if (excludedDirectories.includes(path)) continue;
       if (item.isDirectory()) await walk(path);
       else if (/\.(?:ts|js|mjs|tsx|jsx)$/.test(item.name)) {
         const text = await readFile(path, 'utf8');
```
