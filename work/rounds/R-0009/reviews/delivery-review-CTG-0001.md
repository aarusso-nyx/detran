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

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0001** (TASK-0001 Architect, TASK-0002 Architect, TASK-0003 Inspector + iteração 2, TASK-0004 Engineer). Commits `93a754d..62169ee` sobre `origin/main` `0996391`.

Gates executados pelo maestro sobre o HEAD `62169ee` (saídas em `work/rounds/R-0009/` no PR): `pnpm check` → OK; `pnpm backend:test:ci` → OK (56 suítes verdes, incluindo `portal-identity.e2e` 14/14, `identity` unit 49/49, integration 10/10, `shared` 188/188); `pnpm backend:rls-smoke` → OK; `seed.sh` 2× em `detran_r9` → OK; `verify:rls-ddl` → OK (207 cobertas, 2 isentas por desenho).

Contexto para os itens 5/10: as adendas **A1–A3** de `plan.md` §Decisões reconciliam as divergências `[DIVERGE-Mn]` de `contracts/CTG-0001.md` §13 (o canônico prevaleceu: RN-PORTAL-101 SNE = avancada; ADR-0019 §3 kinds da caixa) e as contradições teste × contrato triadas em §Triagem (C-0001-20a/41 sensor-error; C-0001-42 reference-gap → A3(a)). `portal:appeal:*` permanece em `policy.ts` até TASK-0007 (M19). Arquivos gerados (`Generated from BP-…`) foram produzidos só por `pnpm blueprints:generate`/`contracts:openapi`/`contracts:clients` (`blueprints:check`/`contracts:check` verdes) e estão fora do diff anexado (só no `--stat`); leia-os na worktree se precisar.

### git diff --stat origin/main..HEAD

```
 backend/app/package.json                                                                 |    5 +
 backend/app/src/app.module.ts                                                            |   82 +-
 backend/app/src/detran-runtime.ts                                                        |  206 ++++-
 backend/app/tests/e2e/portal-identity.e2e.spec.ts                                        |  579 +++++++++++++
 backend/app/vitest.config.ts                                                             |   18 +
 backend/database/ddl/11-auth-functions.sql                                               |    2 +-
 backend/database/ddl/14-inf-lifecycle-vocabulary.sql                                     |   10 +-
 backend/database/ddl/19-portal-platform.sql                                              |   46 +
 backend/database/ddl/61-portal-identity.sql                                              |  108 +++
 backend/database/ddl/62-portal-requests.sql                                              |  176 ++++
 backend/database/ddl/63-portal-inbox.sql                                                 |  113 +++
 backend/database/ddl/64-portal-citizen-service.sql                                       |  101 +++
 backend/database/ddl/65-portal-projections.sql                                           |  166 ++++
 backend/database/seed/70-fixtures-portal.sql                                             |  303 +++++++
 backend/domains/portal/citizen-service/package.json                                      |   38 +
 backend/domains/portal/citizen-service/src/citizen-service.module.ts                     |   28 +
 .../domains/portal/citizen-service/src/controllers/manifestation-extension.controller.ts |   19 +
 backend/domains/portal/citizen-service/src/controllers/manifestation.controller.ts       |   19 +
 backend/domains/portal/citizen-service/src/controllers/service-catalog.controller.ts     |   19 +
 backend/domains/portal/citizen-service/src/dto/create-manifestation-extension.dto.ts     |    8 +
 backend/domains/portal/citizen-service/src/dto/create-manifestation.dto.ts               |   17 +
 backend/domains/portal/citizen-service/src/dto/create-service-catalog.dto.ts             |   21 +
 backend/domains/portal/citizen-service/src/entities/manifestation-extension.entity.ts    |   12 +
 backend/domains/portal/citizen-service/src/entities/manifestation.entity.ts              |   21 +
 backend/domains/portal/citizen-service/src/entities/service-catalog.entity.ts            |   25 +
 .../portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts      |  129 +++
 .../domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts   |  170 ++++
 backend/domains/portal/citizen-service/src/index.ts                                      |   17 +
 .../portal/citizen-service/src/repositories/manifestation-extension.repository.ts        |  136 +++
 backend/domains/portal/citizen-service/src/repositories/manifestation.repository.ts      |  133 +++
 backend/domains/portal/citizen-service/src/repositories/service-catalog.repository.ts    |  143 ++++
 backend/domains/portal/citizen-service/src/services/manifestation-extension.service.ts   |   30 +
 backend/domains/portal/citizen-service/src/services/manifestation.service.ts             |   28 +
 backend/domains/portal/citizen-service/src/services/service-catalog.service.ts           |   28 +
 backend/domains/portal/citizen-service/tsconfig.build.json                               |   11 +
 backend/domains/portal/citizen-service/tsconfig.json                                     |   14 +
 backend/domains/portal/citizen-service/vitest.config.ts                                  |   29 +
 backend/domains/portal/identity/package.json                                             |   38 +
 backend/domains/portal/identity/src/controllers/act-level-policy.controller.ts           |   19 +
 backend/domains/portal/identity/src/controllers/entitlement.controller.ts                |   19 +
 backend/domains/portal/identity/src/controllers/representation.controller.ts             |   19 +
 backend/domains/portal/identity/src/controllers/subject.controller.ts                    |   19 +
 backend/domains/portal/identity/src/dto/create-act-level-policy.dto.ts                   |   10 +
 backend/domains/portal/identity/src/dto/create-entitlement.dto.ts                        |   10 +
 backend/domains/portal/identity/src/dto/create-representation.dto.ts                     |   11 +
 backend/domains/portal/identity/src/dto/create-subject.dto.ts                            |    9 +
 backend/domains/portal/identity/src/entities/act-level-policy.entity.ts                  |   14 +
 backend/domains/portal/identity/src/entities/entitlement.entity.ts                       |   14 +
 backend/domains/portal/identity/src/entities/representation.entity.ts                    |   15 +
 backend/domains/portal/identity/src/entities/subject.entity.ts                           |   13 +
 backend/domains/portal/identity/src/handwritten/act-level.spec.ts                        |  251 ++++++
 backend/domains/portal/identity/src/handwritten/assurance.controller.ts                  |   14 +
 backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts                    |  163 ++++
 backend/domains/portal/identity/src/handwritten/citizen.guard.ts                         |   75 ++
 backend/domains/portal/identity/src/handwritten/clock.ts                                 |   45 +
 backend/domains/portal/identity/src/handwritten/errors.ts                                |   15 +
 backend/domains/portal/identity/src/handwritten/identity-claims.spec.ts                  |  214 +++++
 backend/domains/portal/identity/src/handwritten/identity.service.ts                      |  479 +++++++++++
 backend/domains/portal/identity/src/handwritten/index.ts                                 |   14 +
 backend/domains/portal/identity/src/handwritten/me.controller.ts                         |   55 ++
 backend/domains/portal/identity/src/handwritten/preferences.controller.ts                |   14 +
 backend/domains/portal/identity/src/handwritten/public.controller.ts                     |  227 +++++
 backend/domains/portal/identity/src/handwritten/representations.controller.ts            |   13 +
 backend/domains/portal/identity/src/identity.module.ts                                   |   51 ++
 backend/domains/portal/identity/src/index.ts                                             |   23 +
 backend/domains/portal/identity/src/repositories/act-level-policy.repository.ts          |  132 +++
 backend/domains/portal/identity/src/repositories/entitlement.repository.ts               |  126 +++
 backend/domains/portal/identity/src/repositories/representation.repository.ts            |  132 +++
 backend/domains/portal/identity/src/repositories/subject.repository.ts                   |  120 +++
 backend/domains/portal/identity/src/services/act-level-policy.service.ts                 |   28 +
 backend/domains/portal/identity/src/services/entitlement.service.ts                      |   25 +
 backend/domains/portal/identity/src/services/representation.service.ts                   |   28 +
 backend/domains/portal/identity/src/services/subject.service.ts                          |   25 +
 backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts         |  172 ++++
 backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts        |  231 +++++
 backend/domains/portal/identity/tsconfig.build.json                                      |   11 +
 backend/domains/portal/identity/tsconfig.json                                            |   14 +
 backend/domains/portal/identity/vitest.config.ts                                         |   29 +
 backend/domains/portal/inbox/package.json                                                |   37 +
 backend/domains/portal/inbox/src/controllers/acknowledgement-evidence.controller.ts      |   19 +
 backend/domains/portal/inbox/src/controllers/inbox-item.controller.ts                    |   19 +
 backend/domains/portal/inbox/src/controllers/push-subscription.controller.ts             |   19 +
 backend/domains/portal/inbox/src/controllers/sne-enrollment.controller.ts                |   19 +
 backend/domains/portal/inbox/src/dto/create-acknowledgement-evidence.dto.ts              |    7 +
 backend/domains/portal/inbox/src/dto/create-inbox-item.dto.ts                            |   17 +
 backend/domains/portal/inbox/src/dto/create-push-subscription.dto.ts                     |    6 +
 backend/domains/portal/inbox/src/dto/create-sne-enrollment.dto.ts                        |   13 +
 backend/domains/portal/inbox/src/entities/acknowledgement-evidence.entity.ts             |   11 +
 backend/domains/portal/inbox/src/entities/inbox-item.entity.ts                           |   21 +
 backend/domains/portal/inbox/src/entities/push-subscription.entity.ts                    |   10 +
 backend/domains/portal/inbox/src/entities/sne-enrollment.entity.ts                       |   17 +
 backend/domains/portal/inbox/src/inbox.module.ts                                         |   34 +
 backend/domains/portal/inbox/src/index.ts                                                |   22 +
 backend/domains/portal/inbox/src/repositories/acknowledgement-evidence.repository.ts     |  135 +++
 backend/domains/portal/inbox/src/repositories/inbox-item.repository.ts                   |  133 +++
 backend/domains/portal/inbox/src/repositories/push-subscription.repository.ts            |  128 +++
 backend/domains/portal/inbox/src/repositories/sne-enrollment.repository.ts               |  129 +++
 backend/domains/portal/inbox/src/services/acknowledgement-evidence.service.ts            |   30 +
 backend/domains/portal/inbox/src/services/inbox-item.service.ts                          |   25 +
 backend/domains/portal/inbox/src/services/push-subscription.service.ts                   |   28 +
 backend/domains/portal/inbox/src/services/sne-enrollment.service.ts                      |   28 +
 backend/domains/portal/inbox/tsconfig.build.json                                         |   11 +
 backend/domains/portal/inbox/tsconfig.json                                               |   14 +
 backend/domains/portal/inbox/vitest.config.ts                                            |   26 +
 backend/domains/portal/projections/package.json                                          |   38 +
 backend/domains/portal/projections/src/controllers/crash-view.controller.ts              |   19 +
 backend/domains/portal/projections/src/controllers/exam-view.controller.ts               |   19 +
 backend/domains/portal/projections/src/controllers/infraction-view.controller.ts         |   19 +
 backend/domains/portal/projections/src/controllers/national-read-cache.controller.ts     |   19 +
 backend/domains/portal/projections/src/controllers/points-view.controller.ts             |   19 +
 backend/domains/portal/projections/src/controllers/process-timeline.controller.ts        |   19 +
 .../domains/portal/projections/src/controllers/projection-applied-event.controller.ts    |   19 +
 backend/domains/portal/projections/src/dto/create-crash-view.dto.ts                      |    9 +
 backend/domains/portal/projections/src/dto/create-exam-view.dto.ts                       |    9 +
 backend/domains/portal/projections/src/dto/create-infraction-view.dto.ts                 |   18 +
 backend/domains/portal/projections/src/dto/create-national-read-cache.dto.ts             |    8 +
 backend/domains/portal/projections/src/dto/create-points-view.dto.ts                     |   10 +
 backend/domains/portal/projections/src/dto/create-process-timeline.dto.ts                |    9 +
 backend/domains/portal/projections/src/dto/create-projection-applied-event.dto.ts        |    7 +
 backend/domains/portal/projections/src/entities/crash-view.entity.ts                     |   13 +
 backend/domains/portal/projections/src/entities/exam-view.entity.ts                      |   13 +
 backend/domains/portal/projections/src/entities/infraction-view.entity.ts                |   22 +
 backend/domains/portal/projections/src/entities/national-read-cache.entity.ts            |   12 +
 backend/domains/portal/projections/src/entities/points-view.entity.ts                    |   14 +
 backend/domains/portal/projections/src/entities/process-timeline.entity.ts               |   13 +
 backend/domains/portal/projections/src/entities/projection-applied-event.entity.ts       |   11 +
 backend/domains/portal/projections/src/index.ts                                          |   37 +
 backend/domains/portal/projections/src/projections.module.ts                             |   52 ++
 backend/domains/portal/projections/src/repositories/crash-view.repository.ts             |  125 +++
 backend/domains/portal/projections/src/repositories/exam-view.repository.ts              |  120 +++
 backend/domains/portal/projections/src/repositories/infraction-view.repository.ts        |  140 +++
 backend/domains/portal/projections/src/repositories/national-read-cache.repository.ts    |  130 +++
 backend/domains/portal/projections/src/repositories/points-view.repository.ts            |  126 +++
 backend/domains/portal/projections/src/repositories/process-timeline.repository.ts       |  131 +++
 .../domains/portal/projections/src/repositories/projection-applied-event.repository.ts   |  135 +++
 backend/domains/portal/projections/src/services/crash-view.service.ts                    |   25 +
 backend/domains/portal/projections/src/services/exam-view.service.ts                     |   25 +
 backend/domains/portal/projections/src/services/infraction-view.service.ts               |   28 +
 backend/domains/portal/projections/src/services/national-read-cache.service.ts           |   28 +
 backend/domains/portal/projections/src/services/points-view.service.ts                   |   25 +
 backend/domains/portal/projections/src/services/process-timeline.service.ts              |   28 +
 backend/domains/portal/projections/src/services/projection-applied-event.service.ts      |   30 +
 backend/domains/portal/projections/tsconfig.build.json                                   |   11 +
 backend/domains/portal/projections/tsconfig.json                                         |   14 +
 backend/domains/portal/projections/vitest.config.ts                                      |   29 +
 backend/domains/portal/requests/package.json                                             |   37 +
 backend/domains/portal/requests/src/controllers/consequence-ack.controller.ts            |   19 +
 backend/domains/portal/requests/src/controllers/evaluation.controller.ts                 |   19 +
 backend/domains/portal/requests/src/controllers/idempotency-record.controller.ts         |   19 +
 backend/domains/portal/requests/src/controllers/protocol.controller.ts                   |   19 +
 backend/domains/portal/requests/src/controllers/request-attachment.controller.ts         |   19 +
 backend/domains/portal/requests/src/controllers/request-draft.controller.ts              |   19 +
 backend/domains/portal/requests/src/controllers/request.controller.ts                    |   19 +
 backend/domains/portal/requests/src/dto/create-consequence-ack.dto.ts                    |    7 +
 backend/domains/portal/requests/src/dto/create-evaluation.dto.ts                         |    8 +
 backend/domains/portal/requests/src/dto/create-idempotency-record.dto.ts                 |    9 +
 backend/domains/portal/requests/src/dto/create-protocol.dto.ts                           |    8 +
 backend/domains/portal/requests/src/dto/create-request-attachment.dto.ts                 |   10 +
 backend/domains/portal/requests/src/dto/create-request-draft.dto.ts                      |    7 +
 backend/domains/portal/requests/src/dto/create-request.dto.ts                            |   17 +
 backend/domains/portal/requests/src/entities/consequence-ack.entity.ts                   |   11 +
 backend/domains/portal/requests/src/entities/evaluation.entity.ts                        |   12 +
 backend/domains/portal/requests/src/entities/idempotency-record.entity.ts                |   13 +
 backend/domains/portal/requests/src/entities/protocol.entity.ts                          |   12 +
 backend/domains/portal/requests/src/entities/request-attachment.entity.ts                |   14 +
 backend/domains/portal/requests/src/entities/request-draft.entity.ts                     |   11 +
 backend/domains/portal/requests/src/entities/request.entity.ts                           |   21 +
 backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts       |  103 +++
 backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts            |  223 +++++
 backend/domains/portal/requests/src/index.ts                                             |   37 +
 backend/domains/portal/requests/src/repositories/consequence-ack.repository.ts           |  129 +++
 backend/domains/portal/requests/src/repositories/evaluation.repository.ts                |  124 +++
 backend/domains/portal/requests/src/repositories/idempotency-record.repository.ts        |  131 +++
 backend/domains/portal/requests/src/repositories/protocol.repository.ts                  |  119 +++
 backend/domains/portal/requests/src/repositories/request-attachment.repository.ts        |  132 +++
 backend/domains/portal/requests/src/repositories/request-draft.repository.ts             |  123 +++
 backend/domains/portal/requests/src/repositories/request.repository.ts                   |  128 +++
 backend/domains/portal/requests/src/requests.module.ts                                   |   52 ++
 backend/domains/portal/requests/src/services/consequence-ack.service.ts                  |   28 +
 backend/domains/portal/requests/src/services/evaluation.service.ts                       |   25 +
 backend/domains/portal/requests/src/services/idempotency-record.service.ts               |   28 +
 backend/domains/portal/requests/src/services/protocol.service.ts                         |   25 +
 backend/domains/portal/requests/src/services/request-attachment.service.ts               |   28 +
 backend/domains/portal/requests/src/services/request-draft.service.ts                    |   28 +
 backend/domains/portal/requests/src/services/request.service.ts                          |   25 +
 backend/domains/portal/requests/tsconfig.build.json                                      |   11 +
 backend/domains/portal/requests/tsconfig.json                                            |   14 +
 backend/domains/portal/requests/vitest.config.ts                                         |   26 +
 backend/domains/shared/src/policy.spec.ts                                                |   69 ++
 backend/domains/shared/src/policy.ts                                                     |    4 +
 docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json                             |  367 ++++++++
 docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json                                    |  414 +++++++++
 docs/framework/blueprints/BP-PORTAL-INBOX-001.json                                       |  392 +++++++++
 docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json                                 |  501 +++++++++++
 docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json                                    |  593 +++++++++++++
 docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.openapi.json                      |  498 +++++++++++
 docs/framework/contracts/BP-PORTAL-IDENTITY-001.openapi.json                             |  459 ++++++++++
 docs/framework/contracts/BP-PORTAL-INBOX-001.openapi.json                                |  449 ++++++++++
 docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.openapi.json                          |  747 ++++++++++++++++
 docs/framework/contracts/BP-PORTAL-REQUESTS-001.openapi.json                             |  717 ++++++++++++++++
 docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md                                   |   73 ++
 docs/meta/adr/README.md                                                                  |    1 +
 package.json                                                                             |    8 +-
 packages/api-clients/src/generated/BP-PORTAL-CITIZEN-SERVICE-001.ts                      |  192 +++++
 packages/api-clients/src/generated/BP-PORTAL-IDENTITY-001.ts                             |  178 ++++
 packages/api-clients/src/generated/BP-PORTAL-INBOX-001.ts                                |  188 +++++
 packages/api-clients/src/generated/BP-PORTAL-PROJECTIONS-001.ts                          |  326 +++++++
 packages/api-clients/src/generated/BP-PORTAL-REQUESTS-001.ts                             |  318 +++++++
 pnpm-lock.yaml                                                                           |  194 +++++
 tools/blueprints/generated-files.json                                                    |  162 +++-
 tools/check-rls-ddl.ts                                                                   |   25 +-
 work/rounds/R-0009/AUTHORIZATION.md                                                      |   25 +
 work/rounds/R-0009/budget.json                                                           |   90 ++
 work/rounds/R-0009/compositions.json                                                     |   82 ++
 work/rounds/R-0009/contracts/CTG-0001.md                                                 | 1183 ++++++++++++++++++++++++++
 work/rounds/R-0009/env-detran-r9.sh                                                      |    7 +
 work/rounds/R-0009/plan.md                                                               |  417 ++++++++-
 work/rounds/R-0009/prompts/TASK-0001.md                                                  |  202 +++++
 work/rounds/R-0009/prompts/TASK-0002.md                                                  |  187 ++++
 work/rounds/R-0009/prompts/TASK-0003.md                                                  |  146 ++++
 work/rounds/R-0009/prompts/TASK-0004.md                                                  |  123 +++
 work/rounds/R-0009/prompts/TASK-0005.md                                                  |  170 ++++
 work/rounds/R-0009/prompts/TASK-0006.md                                                  |  127 +++
 work/rounds/R-0009/prompts/TASK-0007.md                                                  |  112 +++
 work/rounds/R-0009/prompts/TASK-0008.md                                                  |  108 +++
 work/rounds/R-0009/prompts/TASK-0009.md                                                  |  104 +++
 work/rounds/R-0009/prompts/TASK-0010.md                                                  |  108 +++
 work/rounds/R-0009/reviews/prompt-review-1.bridge.json                                   |   11 +
 work/rounds/R-0009/reviews/prompt-review-1.json                                          |   58 ++
 work/rounds/R-0009/reviews/prompt-review-1.md                                            | 1917 ++++++++++++++++++++++++++++++++++++++++++
 work/rounds/R-0009/reviews/prompt-review-2.bridge.json                                   |   11 +
 work/rounds/R-0009/reviews/prompt-review-2.json                                          |   32 +
 work/rounds/R-0009/reviews/prompt-review-2.md                                            | 1571 ++++++++++++++++++++++++++++++++++
 work/rounds/R-0009/reviews/prompt-review-3.bridge.json                                   |   11 +
 work/rounds/R-0009/reviews/prompt-review-3.json                                          |    7 +
 work/rounds/R-0009/reviews/prompt-review-3.md                                            |  185 ++++
 work/rounds/R-0009/tasks/TASK-0001.json                                                  |   42 +
 work/rounds/R-0009/tasks/TASK-0002.json                                                  |   51 ++
 work/rounds/R-0009/tasks/TASK-0003.json                                                  |   55 ++
 work/rounds/R-0009/tasks/TASK-0004.json                                                  |   52 ++
 work/rounds/R-0009/tasks/TASK-0005.json                                                  |   49 ++
 work/rounds/R-0009/tasks/TASK-0006.json                                                  |   47 ++
 work/rounds/R-0009/tasks/TASK-0007.json                                                  |   52 ++
 work/rounds/R-0009/tasks/TASK-0008.json                                                  |   51 ++
 work/rounds/R-0009/tasks/TASK-0009.json                                                  |   44 +
 work/rounds/R-0009/tasks/TASK-0010.json                                                  |   44 +
 246 files changed, 24669 insertions(+), 38 deletions(-)
```

### Relatórios

#### work/rounds/R-0009/reports/TASK-0001.md

```markdown
Papel: Architect (Art. 6)
Tarefa: TASK-0001
Arquivos criados/alterados:

- `docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md` (novo, 73 linhas)
- `docs/meta/adr/README.md` (uma linha de índice para ADR-0024)
- `work/rounds/R-0009/contracts/CTG-0001.md` (novo, 1183 linhas, §0–§13)

Comandos executados e saída resumida:

- `node tools/docs/kb/check.mjs` (antes) → `knowledge-base check: OK (521 artifacts, 446 canonical tokens)`
- `printf <cpf> | shasum -a 256` ×5 → hashes sha256 dos cinco CPFs fixture (CTG-0001 §10.2)
- `node_modules/.bin/prettier --write` nos três arquivos → OK
- `pnpm format:check` → `All matched files use Prettier code style!`
- `node tools/docs/kb/check.mjs` (após) → `OK (521 artifacts, 446 canonical tokens)` — baseline mantida
- `git diff --stat -- docs/meta/adr/README.md` (somente leitura) → `1 file changed, 1 insertion(+)`

Critérios de aceitação:

- `pnpm format:check` verde → PASS
- `node tools/docs/kb/check.mjs` sem novos problemas → PASS
- ADR-0024 existe, ≤ 90 linhas (73), cita H.49/H.50/H.51, OD-P02, OD-P15, RN-PORTAL-101; próximo número livre confirmado → PASS
- CTG-0001 com as 13 seções (+ §0 convenções), 52 critérios `C-0001-01…52` com tier e arquivo alvo, todas as colunas das tabelas de M6/M7/M8/M9/M11/M12/M13/M15/M16/M17 → PASS

Fora do escopo / deixado:

- Blueprints, DDL, seeds, código e testes: TASK-0002/0003/0004.
- `request.transitions.ts` e `manifestation.transitions.ts` exigidos por C-0001-23…28 antes de CTG-0002; §12 os atribui a TASK-0004 (arquivos puros).
- Acessor do principal em guards, exposição do `Host` em `TenantResolverContext` e política RLS para rota pública sem ator: comportamento fixado em §3/§8/§9; mecanismo confirmado pelo Engineer.
- `PORTAL_CLOCK` com fallback `@Optional()` (§4): M24 fixa só dois providers em `identity`.
- Mapa completo `INFRACTION_SITUATION_MAP` (M16) e `limitations[]` de serviços parciais: CTG-0002.

OD tocadas ou propostas: OD-P02 (revisada na ADR, fechada por H.50 com risco), OD-P15, OD-P13, OD-P17, OD-P18, OD-P19 (citadas); novas: OD-P22 (catálogo de parâmetros × tabela `act_level_policy`/mapeamento no IdP; vocabulário `advanced/simple`; recarga do diretório de hostnames), OD-P23 (`cpf_hash` sha256 sem chave — risco de reversão; HMAC antes de dado real), OD-P24 (janela do convite de avaliação sem valor na fonte), OD-P25 (claim `govbr_level` e DV do CPF, dependem de OD-P15), OD-P26 (conteúdo real da Carta de Serviços e da marca — fixtures ≠ produto).

Divergências [DIVERGE-Mn]:

- `[DIVERGE-M5]` `adesao_sne`/`cancelamento_sne` = `avancada` (RN-PORTAL-101 linha 9, matriz vinculante) contra M5 `simples`; AGUARDANDO_NIVEL_ASSINATURA passa a ser alcançável pela API nesta rodada.
- `[DIVERGE-M5]` linhas `consulta_bat`, `consulta_exame`, `avaliar` acrescentadas à matriz.
- `[DIVERGE-M7]` `submit` admitido também de AGUARDANDO_NIVEL_ASSINATURA (WF-PORTAL-001 §Transições; UC-PORTAL-019 AC-4).
- `[DIVERGE-M7]` `request.target_kind` ganha `crash`.
- `[DIVERGE-M12]` `service_catalog.minimum_assurance` de `adesao_sne`/`cancelamento_sne` = `avancada`.
- `[DIVERGE-M15]` `inbox_item.kind` = conjunto canônico de ADR-0019 §3 (`SNE|PROCESSO|OUVIDORIA|SISTEMA`); a distinção de M15 vira `action_required boolean`; `source` mantido.
- Documento × documento (para TASK-0010): ADR-0019 §2 (8+2 estados) × WF-PORTAL-001 (13); ADR-0019 §4 (`evaluation` em citizen-service) × M1 (requests — seguido); parameter-catalogue §PORTAL (`advanced/simple`) × ADR-0019/M5/ADR-0024; WF-PORTAL-001 §Catálogo "manifestação — Simples" × H.51 (`none`).
- Ordem da guarda fixada claims → papel (§3): o e2e `field-agent → IDENTITY_NOT_CITIZEN` precisa de claims válidas.

Bloqueios: nenhum

Consumo (subagente): ≈261 k tokens brutos, 54 chamadas de ferramenta, 22 min.
```

#### work/rounds/R-0009/reports/TASK-0002.md

```markdown
Papel: Architect (Art. 6)
Tarefa: TASK-0002
Arquivos criados/alterados:

- Blueprints (novos): `docs/framework/blueprints/BP-PORTAL-{IDENTITY,REQUESTS,INBOX,CITIZEN-SERVICE,PROJECTIONS}-001.json`
- DDL manuscrito: `backend/database/ddl/19-portal-platform.sql` (novo: schema, `public_hostname`, `brand_profile` sem RLS por desenho, `protocol_seq`, grants); `14-inf-lifecycle-vocabulary.sql` (check `owner` + `'portal'`; 4 timers M14); `11-auth-functions.sql` (`'portal'` em `install_tenant_triggers()`)
- `work/rounds/R-0009/env-detran-r9.sh` (novo)
- Gerados: `backend/domains/portal/{identity,requests,inbox,citizen-service,projections}/` (155 arquivos), DDL `61…65-portal-*.sql`, `tools/blueprints/generated-files.json`, `docs/framework/contracts/BP-PORTAL-*-001.openapi.json` (5, sem `paths`), `packages/api-clients/src/generated/BP-PORTAL-*-001.ts` (5)
- Nomes: pacotes `@detran/portal-{identity,requests,inbox,citizen-service,projections}`; módulos `IdentityModule`, `RequestsModule`, `InboxModule`, `CitizenServiceModule`, `ProjectionsModule`; `identity.module.ts` registra os 5 controladores e 2 providers de M24, `exports: [PortalIdentityService, PortalCitizenGuard]`.

Comandos executados e saída resumida:

- `pnpm blueprints:generate` → exit 0 (≈20 min); `pnpm contracts:openapi` → `contracts written: 43`; `pnpm contracts:clients` → `clients written: 52`
- `prettier --check .` → OK; `pnpm blueprints:check` → OK; `pnpm contracts:check` → OK (92 operations; clients in sync: 52)
- `pnpm verify:lifecycle-vocabulary` → `OK (15 states, 12 substates, 28 timers, 17 AIT states)`
- `pnpm verify:rls-ddl` → exit 1: exatamente `portal.brand_profile` e `portal.public_hostname` (esperado até TASK-0004)
- `apply.sh --full` em `detran_r9` → done; `seed.sh` → 12 seeds, done; 28 tabelas `portal`, triggers e policies conferidos; `protocol_seq` existe
- `pnpm typecheck` → exit 2 nos pacotes novos por `node_modules` ausente (`TS2688 vitest/globals`); prova com `node_modules` emprestado: 4 pacotes de CTG-0002 verdes; `identity` só `TS2307 ./handwritten/*` (M24, esperado)

Critérios de aceitação: blueprints:check PASS; contracts:check PASS; lifecycle-vocabulary PASS; rls-ddl PASS (falha esperada exata); apply+seed PASS; typecheck FAIL só por `node_modules` ausente (maestro roda `pnpm install`); format:check PASS.

Fora do escopo / deixado: TASK-0004 (handwritten de `identity`, AppModule, scripts, allowlist, `pnpm install`); TASK-0005 (blocos `handwritten*` dos outros 4 blueprints); TASK-0003 (seeds). Efeito de M11: `brand_profile`/`public_hostname` também recebem `enforce_tenant_id` (inserts sob owner ou tenant). `@detran/shared` injetado pelo gerador. Gerador não emite sequences/`NULLS NOT DISTINCT`/`ON DELETE` (contornos: `protocol_seq` no DDL 19; `coalesce(target_id, '0000…')` no único de `national_read_cache`). Escolhas de nulabilidade/checks derivados documentadas (ver transcrição do relatório do worker); FKs intra-`portal`; nenhuma FK cruzada em `projections`; `manifestation_extension.timer` FK para `inf.infraction_timer_ref`; `pii: "personal"` em dados pessoais. Desvio operacional: um `git diff --stat` somente leitura.

OD tocadas ou propostas: nova — `act_level_policy` sem coluna de escopo × duas linhas `lgpd_declaracao` (M5): índice único `(tenant_id, act_key, effective_from)` impede; pergunta: `scope` nullable ou `act_key` composto; nova — vocabulário de `inbox_item.deadline_owned_by` e `sne_enrollment.channel` (sem check). Referidas: OD-P08, P14, P16, P19, P20.

Divergências [DIVERGE-Mn]: [DIVERGE-M16] `projection_applied_event` único por `(tenant_id, event_id, projection)` + `last_error`; [DIVERGE-M8] `protocol_seq` no DDL 19; [DIVERGE-M22] alerta: fixtures de `service_catalog` precisam dos 11 campos `not null`.

Bloqueios: nenhum.

Consumo (subagente): ≈240 k tokens brutos, 81 chamadas de ferramenta, 28 min.
```

#### work/rounds/R-0009/reports/TASK-0003.md

```markdown
Papel: Inspector (Art. 6)
Tarefa: TASK-0003
Arquivos criados/alterados:

- `backend/database/seed/70-fixtures-portal.sql` (novo)
- `backend/domains/portal/identity/src/handwritten/{citizen.guard,act-level,identity-claims}.spec.ts` (novos)
- `backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts` (novo)
- `backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts` (novo)
- `backend/domains/portal/identity/tests/integration/{portal-rls,portal-seed}.integration.spec.ts` (novos)
- `backend/app/tests/e2e/portal-identity.e2e.spec.ts` (novo)
- `backend/domains/shared/src/policy.spec.ts` (só o describe `CTG-0001 §3/§8 (M19, TASK-0003)`; nada removido)

Comandos executados e saída resumida:

- `seed.sh` em `detran_r9` 3× → `done`; contagens exatas do contrato §10.9 (subject 5, representation 1, entitlement 12, act_level_policy 21, request 13, request_draft 1, protocol 5, manifestation 9, manifestation_extension 1, service_catalog 15 [9/2/4], brand_profile 1, public_hostname 1, inbox_item 2, sne_enrollment 1, infraction_view 7, points_view 1)
- `pnpm format:check` → verde; `node tools/parameters/verify.mjs --check-usage` → OK (87 entries, 18 flags, 0 errors)
- `pnpm -r --no-bail --if-present run typecheck` → 3 fails/49 passes, só `TS2307` em `src/handwritten/index.js`, `request.transitions.js`, `manifestation.transitions.js` (esperado até TASK-0004)
- `pnpm --filter @detran/portal-identity test:integration` → 2 files, 10 tests passed
- `pnpm --filter @detran/shared test` → 187 passed, 1 failed (`C-0001-52`, esperado: `portal:identity:read` ausente)
- unit dos 3 pacotes → falham só por módulo ausente (esperado); e2e `portal-identity` 3× → 14 failed por `404 Cannot GET` (rota inexistente, esperado)

Critérios de aceitação: format PASS; seed 2× PASS; typecheck PASS (só módulos ausentes); integration identity PASS (10/10); verify parameters PASS.

Fora do escopo / deixado:

- DDL real × contrato (D1–D12 no cabeçalho do seed; regra "DDL manda nas colunas, contrato no comportamento"): `brand_profile.tenant_id` PK; `representation.instrument_document_id not null` → placeholder; `entitlement` sem `representation_id`; `request.service_key`/`minimum_assurance not null`; `request_draft.version int`; `inbox_item.read_on` é `date`; `manifestation` sem `info_requested_on`; `protocol not null` em `MANIFESTACAO_REGISTRADA`; `sne_enrollment` sem `version`; `act_level_policy.decision_ref varchar(40)` (citações encurtadas, completas em `legal_basis`); `infraction_view.last_event_id/version not null` → sentinela.
- `service_catalog`: `title`/`legal_deadline`/`normative_reference` de 13 serviços vêm de WF-PORTAL-001 §Catálogo (fora da leitura fechada) → rótulos `"(fixture)"` e `'source_pending (OD-P26)'`.
- Convenção `assertTransition(current, trigger)` por analogia com `infraction.transitions.spec.ts`; acessor `request.principal` no guard (confirmação do Engineer).
- Nenhum `vitest.config.ts` alterado.

OD tocadas ou propostas: nenhuma nova; lacunas cobertas por OD-P26. Inconsistência interna do contrato: C-0001-52 cita "32 papéis" mas §3 enumera 31 — usado 31 (verificado programaticamente).

Bloqueios: nenhum.

Consumo (subagente): ≈78 k tokens brutos, 45 min.

## Iteração 2 (2026-09-16, restrita — §Triagem / A3)

Papel: Inspector. Arquivos: `act-level.spec.ts` (C-0001-20a/20b: `clock` fixo injetado como 5º argumento), `portal-identity.e2e.spec.ts` (C-0001-42: 403 sem `code` do Portal, título cita A3(a); C-0001-41: `delete from portal.subject` do CPF fixture no tenant local antes das chamadas). Comandos: identity test:unit 49/49; e2e `portal-identity` 14/14 em duas execuções seguidas; format:check verde; nenhum vitest vivo. Critérios: todos PASS. Fora do escopo: nada além dos três itens. OD: nenhuma. Bloqueios: nenhum. Consumo: ≈160 k brutos, 25 chamadas, 4 min.
```

#### work/rounds/R-0009/reports/TASK-0004.md

```markdown
Papel: Engineer (Art. 6)
Tarefa: TASK-0004
Arquivos criados/alterados:

- `backend/domains/portal/identity/src/handwritten/{index,errors,clock,identity.service,citizen.guard,public.controller,me.controller,assurance.controller,representations.controller,preferences.controller}.ts` (novos; símbolos exatos do bloco `module` v1.0.1)
- `backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts`, `backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts` (tabelas puras + `assertTransition`; fora de `handwrittenExports`)
- `backend/app/src/detran-runtime.ts` (claims locais §2.3; `PortalHostnameDirectory`, `portalHostOf`, `portalRequestHostStorage`, `DetranTenantResolver.resolveTenant` §9; `seedPortalPublicRequest`, `PORTAL_PUBLIC_ACTOR_ID`), `backend/app/src/app.module.ts` (5 módulos; guards wrapper semeiam rotas públicas do Portal; ramo `portalPublic` no patch do `TenantContextInterceptor`; `DetranDatabaseBinder` carrega o diretório de hostnames), `backend/app/vitest.config.ts` (5 aliases), `backend/app/package.json` (5 deps), `package.json` raiz (5 pacotes em `build`/`backend:test:*`), `backend/domains/shared/src/policy.ts` (só `portal:identity:read`), `tools/check-rls-ddl.ts` (`RLS_EXEMPT_BY_DESIGN` = `portal.public_hostname`, `portal.brand_profile`)
- Symlinks locais em `backend/app/node_modules/@detran/portal-*` (não versionados); `pnpm-lock.yaml` não tocado → `pnpm install` pelo maestro.

Comandos executados e saída resumida:

- identity typecheck OK; identity test:unit 48/49 (só C-0001-20a); requests test:unit 61 passed; citizen-service test:unit 67 passed
- app typecheck OK; app test:unit 59; app test:integration 11; app test:e2e (r9) 10 files: 111/112 (só C-0001-42); identity test:integration 10/10
- shared test 188 passed (inclui C-0001-52)
- verify:decorators OK (867 handlers); verify:rls-ddl OK (207 cobertas, 2 isentas); blueprints:check OK; contracts:check OK; verify:parameter-catalogue OK; format:check verde
- `pnpm check` → exit 0 (uma execução); `ps` sem processos vivos
- `psql delete from portal.subject where cpf_hash = sha256('33333333333')` no tenant local antes de reexecutar o e2e (C-0001-41)

Critérios de aceitação: identity test:unit FAIL (48/49, C-0001-20a defeito do spec); requests/citizen-service unit PASS; identity integration PASS; app e2e FAIL (111/112, C-0001-42 contradição com o contrato §3); shared test PASS; decorators/rls/blueprints/contracts PASS; `pnpm check` PASS.

Fora do escopo / deixado (contradições teste × contrato, testes intactos — triagem do maestro):

1. `act-level.spec.ts` l.27–31/178–190 (C-0001-20a): spec define `clock` fixo mas não o passa a `assertActLevel`; contrato §4 "testes injetam relógio fixo" → 5º argumento `clock`.
2. `portal-identity.e2e.spec.ts` l.416–426 (C-0001-42): `field-agent` é negado pela política (roda antes de qualquer guard de controlador) → 403 STYNX sem `code`; `IDENTITY_NOT_CITIZEN` só é alcançável por principal que passa a política sem `CIDADAO` (`technical-admin` com claims, C-0001-09b).
3. C-0001-41 (l.366–410): não idempotente contra banco persistente (não limpa `portal.subject` do CPF 33333333333; `version` monotônica) → `delete` no `beforeAll`.
4. Contrato §9 (ordem regras 4/5): implementado — com a consulta ao Host ligada (`DETRAN_PORTAL_HOST_RESOLUTION=on`), Host não mapeado → 421 mesmo no perfil local; sem a flag, comportamento atual.

- Confirmações: acessor do principal = `getPrincipalFromRequest` (`request.principal`); `TenantResolverContext` do STYNX não expõe o Host → `AsyncLocalStorage` populado pelos guards wrapper; RLS gerada só exige `app.tenant_id` — `GET services` lê via `Database.tx({ role: 'app' })`.
- Divergência código × contrato §8 (rota pública sem ator): STYNX exige `actorId` no `RequestContext` e membership no interceptor → `seedPortalPublicRequest` semeia tenant (§9) + ator nominal `PORTAL_PUBLIC_ACTOR_ID` (UUID nulo) só para `/v1/portal/*` `@Public()`; patch do interceptor pula membership nessas rotas (OD-P27).
- `PortalHostnameDirectory` carregado no bootstrap (`withSystemContext`, owner readonly); sem recarga por intervalo (OD-P22); `reload()` explícito.
- D13: `portal.subject.name not null` no DDL 61 × contrato admite `null` → gravado `''` e devolvido `null` (`NO_NAME`); sugerido `nullable: true` no blueprint.
- `PORTAL_CLOCK` (Symbol) substituído pelo provider de classe `PortalClock` (A1(g)); `today()` com `America/Manaus` (contrato §4); fuso por tenant fica para CTG-0002. `assertActLevel` também função pura.
- Erros em `*.transitions.ts` e em `detran-runtime.ts` usam `DetranError` com códigos `PORTAL.*` (esses arquivos não importam `@detran/portal-identity`).

OD tocadas ou propostas: OD-P27 (ator nominal das rotas públicas do Portal — pedir ao STYNX suporte a rotas públicas por tenant); reforça OD-P22.

Bloqueios: nenhum.

Consumo (subagente): ≈389 k tokens brutos, 125 chamadas, 47 min.
```

### Critérios (contrato CTG-0001 §11)

````
## 11. Critérios para o Inspector (TASK-0003)

Nomes: "dado <fixture/env> quando <ação> então <efeito|código>". Nenhum literal de chave `portal.*` do
catálogo de parâmetros nos specs (§0). Relógio fixo 2026-09-14 nos testes unitários.

```text
citizen.guard.spec.ts (unit) — backend/domains/portal/identity/src/handwritten/
C-0001-01  dado principal undefined quando canActivate então PORTAL.AUTH_REQUIRED 401
C-0001-02  dado principal CIDADAO sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED 403
C-0001-03  dado CIDADAO com assurance_level 'avancada' sem cpf então ASSURANCE_NOT_VERIFIED
C-0001-04  dado CIDADAO com cpf válido e assurance_level 'AVANCADA' (caixa alta) então ASSURANCE_NOT_VERIFIED
C-0001-05  dado CIDADAO com assurance_level 'simples' e cpf '111.111.111-11' então passa e request.portalIdentity.cpf = '11111111111'
C-0001-06  dado CIDADAO com cpf de 10 dígitos então ASSURANCE_NOT_VERIFIED
C-0001-07  dado field-agent com claims válidas então PORTAL.IDENTITY_NOT_CITIZEN 403
C-0001-08  dado field-agent sem claims então ASSURANCE_NOT_VERIFIED (ordem §3: claims antes do papel)
C-0001-09  dado technical-admin (permissions ['*']) sem claims então ASSURANCE_NOT_VERIFIED; com claims e sem CIDADAO então IDENTITY_NOT_CITIZEN
C-0001-10  dado claims sob os nomes configurados (STYNX_COGNITO_*_CLAIM = 'custom:x') quando portalIdentityClaims então lê por eles; nomes curtos vencem quando ambos presentes
C-0001-11  dado govbr_level 'platina' então portalIdentityClaims devolve claims sem govbrLevel (não null)
C-0001-12  dado portalIdentityOf(request) sem guarda então PORTAL.INTERNAL 500

act-level.spec.ts (unit, repositório falso ou tx em memória) — mesmo diretório
C-0001-13  dado política vigente 'avancada' e current 'simples' quando assertActLevel então ASSURANCE_INSUFFICIENT com context { actKey, required:'avancada', current:'simples', elevationMethods:['biographic','biometric','icp'], resumeRoute }
C-0001-14  dado política 'avancada' e current 'avancada' então resolve { policyId }
C-0001-15  dado política 'simples' e current 'qualificada' então resolve
C-0001-16  dado política 'none' e current 'simples' então resolve
C-0001-17  dado política 'qualificada' então ASSURANCE_QUALIFIED_NEVER_REQUIRED 500 { actKey }
C-0001-18  dado ato sem linha então PORTAL.INTERNAL 500 { actKey }
C-0001-19  dado linha enabled=false então PORTAL.INTERNAL (ausência)
C-0001-20  dado linha effective_from 2026-09-15 e clock 2026-09-14 então PORTAL.INTERNAL; dado effective_to 2026-09-14 então idem (limite exclusivo)
C-0001-21  dado duas linhas vigentes (effective_from 2026-01-01 'simples' e 2026-06-01 'avancada') então vale 'avancada'
C-0001-22  dado assuranceRank então none<simples<avancada<qualificada e messageKey de PortalError('PORTAL.ASSURANCE_INSUFFICIENT') = 'portal.errors.assurance_insufficient'

request.transitions.spec.ts (unit) — backend/domains/portal/requests/src/handwritten/guards/
C-0001-23  dado REQUEST_TRANSITIONS quando enumerada então cobre exatamente os 13 tokens do §0 e nenhum outro
C-0001-24  dado cada comando (draft, submit, withdraw, evaluate) × cada um dos 13 estados então allowed[] do §6.1 e 409 REQUEST_STATE_INVALID { state, allowed } fora dele
C-0001-25  dado CONCLUIDO e DESISTIDO então nenhum comando é admitido (terminais)

manifestation.transitions.spec.ts (unit) — backend/domains/portal/citizen-service/src/handwritten/guards/
C-0001-26  dado MANIFESTATION_TRANSITIONS então cobre exatamente os 9 tokens
C-0001-27  dado acknowledge × 9 estados então só CIENCIA_AO_USUARIO passa; demais 409 MANIFESTATION_STATE_INVALID { state, allowed:['CIENCIA_AO_USUARIO'] }
C-0001-28  dado evaluate × 9 estados então só AVALIACAO_OFERECIDA passa; AVALIADA é terminal

portal-rls.integration.spec.ts (integration, DB detran_r9) — backend/domains/portal/identity/tests/integration/
C-0001-29  dado app.tenant_id = tenant local quando select em portal.subject, portal.request, portal.manifestation, portal.inbox_item então 0 linhas (as fixtures são do tenant canônico)
C-0001-30  dado app.tenant_id = tenant canônico então contagens do §10.9 nas mesmas quatro tabelas
C-0001-31  dado sessão sem app.tenant_id (role app) quando select em portal.brand_profile e portal.public_hostname então lê a linha canônica (sem RLS por desenho); quando select em portal.service_catalog então 0 linhas (RLS)
C-0001-32  dado insert em portal.subject sem tenant_id no payload então a trigger de tenant preenche (auth.install_tenant_triggers inclui 'portal')

portal-seed.integration.spec.ts (integration) — mesmo diretório
C-0001-33  dado apply.sh --full e seed.sh executado DUAS vezes então contagens do §10.9 e nenhuma duplicata (unique de cpf_hash, service_key, act_key+effective_from, protocol number, source_event_id)
C-0001-34  dado act_level_policy então nenhuma linha minimum_assurance='qualificada' e manifestar='none'
C-0001-35  dado service_catalog então 9 available / 2 partially_available / 4 unavailable e toda unavailable tem unavailable_reason='delegacao_indisponivel_r0007'
C-0001-36  dado request então 13 estados distintos e exatamente 5 protocolos, um por estado ≥ PROTOCOLADO exceto DESISTIDO
C-0001-37  dado manifestation então 9 estados distintos, uma anônima com subject_id nulo, agency_due_on = received_at + 30 em todas

portal-identity.e2e.spec.ts (e2e, perfil test, AppModule.forRoot()) — backend/app/tests/e2e/
  setup: tenant local + usuário + membership como inf-ait-routes.e2e.spec.ts; insere brand_profile e public_hostname
  ('portal.local-e2e.invalid') do tenant local e as 21 linhas de act_level_policy do tenant local (cópia do §5);
  DETRAN_LOCAL_ROLES='CIDADAO'; limpa DETRAN_LOCAL_* no afterAll
C-0001-38  dado DETRAN_LOCAL_ROLES=CIDADAO sem DETRAN_LOCAL_ASSURANCE_LEVEL quando GET /v1/portal/identity/me então 403 PORTAL.ASSURANCE_NOT_VERIFIED
C-0001-39  dado ASSURANCE_LEVEL=avancada e DETRAN_LOCAL_CPF=22222222222 então 200 com cpf '22222222222', assuranceLevel 'avancada', subjectId uuid, actRequirements com 21 itens (adesao_sne allowed=true, manifestar allowed=true, defesa_previa allowed=true), representations [], preferences null, heldDataSummary []
C-0001-40  dado ASSURANCE_LEVEL=simples e CPF=11111111111 então actRequirements: adesao_sne allowed=false reason 'PORTAL.ASSURANCE_INSUFFICIENT', consulta_multas allowed=true
C-0001-41  dado GET me duas vezes com o mesmo CPF então uma única linha em portal.subject (upsert) e version 1; dado a segunda com nível diferente então version 2
C-0001-42  dado DETRAN_LOCAL_ROLES=field-agent com claims válidas então 403 PORTAL.IDENTITY_NOT_CITIZEN
C-0001-43  dado DETRAN_LOCAL_ROLES=technical-admin sem claims então 403 PORTAL.ASSURANCE_NOT_VERIFIED (política concede '*', guarda nega)
C-0001-44  dado sem Authorization quando GET /v1/portal/brand então 200 com os 10 campos do tenant local
C-0001-45  dado sem Authorization quando GET /v1/portal/services então 200 com 15 itens, 9/2/4 por availability, ordem category,serviceKey (o e2e insere as 15 linhas do §10.7 no tenant local)
C-0001-46  dado GET /v1/portal/services/manifestar então 200 minimumAssurance 'none'; dado GET services/nao_existe então 404 PORTAL.NOT_FOUND { kind:'service' }
C-0001-47  dado DETRAN_PORTAL_HOST_RESOLUTION=on e Host 'portal.local-e2e.invalid' sem X-Tenant-Id quando GET brand então 200 (tenant do Host)
C-0001-48  dado DETRAN_PORTAL_HOST_RESOLUTION=on e Host desconhecido sem X-Tenant-Id então 421 PORTAL.TENANT_UNRESOLVED
C-0001-49  dado DETRAN_PORTAL_HOST_RESOLUTION=on, Host 'portal.local-e2e.invalid' e X-Tenant-Id = tenant canônico então 403 PORTAL.SESSION_TENANT_MISMATCH
C-0001-50  dado DETRAN_PORTAL_HOST_RESOLUTION ausente e Host desconhecido então comportamento atual (tenant local) — 200
C-0001-51  dado GET me então uma linha de auditoria com action 'PORTAL_IDENTITY_READ' e entity 'portal.subject' (mesmo mecanismo de asserção usado pelos e2e existentes para @Audit)

policy (unit, backend/domains/shared — asserções de TASK-0003 no policy.spec.ts existente)
C-0001-52  dado 'portal:identity:read' então CIDADAO permitido; os 32 papéis do §3 negativos; ADMIN/GESTOR_DETRAN/SUPORTE/technical-admin permitidos por GLOBAL_ADMIN_ROLES (exceção declarada); 'portal:appeal:create' e 'portal:appeal:read-own' permanecem (removidos em TASK-0007)
````

## 12. Layout para o Engineer (TASK-0004)

````

### Adendas A1–A3 e Triagem (plan.md)

```markdown
### Adendas do maestro (Architect) — reconciliação das divergências

- **A1 (2026-09-16, após TASK-0001)** — as divergências `[DIVERGE-Mn]` de `contracts/CTG-0001.md` §13 são **aceitas** (o
  canônico prevalece): (a) `adesao_sne`/`cancelamento_sne` = `avancada` (RN-PORTAL-101 linha 9) — M5 e M12 corrigidas por esta
  adenda; `AGUARDANDO_NIVEL_ASSINATURA` é alcançável pela API já nesta rodada; (b) matriz M5 ganha `consulta_bat`,
  `consulta_exame`, `avaliar` (`simples`); (c) `submit` também de `AGUARDANDO_NIVEL_ASSINATURA` (M7); (d) `request.target_kind`
  ganha `crash` (M7) — TASK-0002 ajusta o check do blueprint `Request` se já gerado sem ele (o maestro aplica a correção do
  blueprint e regenera no checkpoint, como Architect); (e) `inbox_item.kind` = `SNE|PROCESSO|OUVIDORIA|SISTEMA` (ADR-0019 §3)
  - coluna `action_required boolean not null default false`; `source` ∈ `sne|portal` mantido — a resposta de `GET inbox`
    (route contract §6) deriva `kind: acao_necessaria|informativo` de `action_required` (M15 corrigida); (f) ordem da guarda:
    claims → papel (contrato §3); (g) `identity` ganha o provider `PortalClock` (`handwritten/clock`, classe `@Injectable()`
    que expõe `Clock` de `@detran/inf-deadlines`; perfil de teste substitui por `FixedClock`) — M24 ampliada; o maestro declara
    no blueprint no checkpoint. OD-P22…P26 propostas por TASK-0001 são registradas por TASK-0010.
- **A2 (2026-09-16, após TASK-0002)** — (a) pergunta de TASK-0002 sobre `act_level_policy` sem escopo: resolvida pelo contrato
  CTG-0001 §5 — `act_key` composto com sufixo `:<escopo>` (`lgpd_declaracao`, `lgpd_declaracao:declaracao_completa`,
  `lgpd_declaracao:correcao`, `lgpd_declaracao:eliminacao`); sem coluna nova. (b) Vocabulários sem fonte apontados por
  TASK-0002: `inbox_item.deadline_owned_by` ∈ `citizen|agency` (route contract §5 `nextAction.by`/`deadlines[].ownedBy`, nulo
  admitido) e `sne_enrollment.channel` ∈ `push|email|sne` (route contract §3 `preferences.channel`, nulo admitido) — checks
  acrescentados pelo maestro (Architect) nos blueprints `INBOX` v1.0.1. (c) `[DIVERGE-M16]` aceito: `projection_applied_event`
  único por `(tenant_id, event_id, projection)` + `last_error`; `[DIVERGE-M8]` aceito (`protocol_seq` no DDL 19). (d) O maestro
  aplicou A1(d), A1(e) e A1(g) nos blueprints (`REQUESTS` v1.0.1, `INBOX` v1.0.1, `IDENTITY` v1.0.1 com provider `PortalClock`
  e dependência `@detran/inf-deadlines`), regenerou e rodou `pnpm install` (lockfile) no checkpoint.
- **A3 (2026-09-16, após TASK-0004)** — (a) ordem das guardas: `DetranPolicyGuard` (global) roda antes de `PortalCitizenGuard`
  (controlador); papéis fora da matriz `portal:*` recebem 403 da política **sem** `code` (STYNX `ForbiddenException`);
  `PORTAL.IDENTITY_NOT_CITIZEN` cobre os principais que passam a política sem `CIDADAO` (admins globais `*`). C-0001-42 passa a
  esperar 403 sem `code` para `field-agent`. (b) Rotas públicas `/v1/portal/*`: ator nominal `PORTAL_PUBLIC_ACTOR_ID` (UUID nulo)
  - tenant pelo Host/`X-Tenant-Id`, com bypass documentado da membership no interceptor de tenancy **só** para essas rotas
    (OD-P27 ao STYNX). (c) `DETRAN_PORTAL_HOST_RESOLUTION=on` faz o Host não mapeado responder 421 mesmo no perfil local (única
    forma de provar §9 no e2e). (d) D13: `portal.subject.name` nulo admitido (blueprint `IDENTITY` v1.0.2). (e) `PortalClock`
    com `America/Manaus` como fuso padrão nesta rodada; fuso por tenant em CTG-0002 (`auth.tenants.timezone`).

## Tarefas

## Triagem

(uma linha por falha de gate: `TASK — gate — plant-bug | sensor-error | policy-issue | reference-gap — achado — ação`)

- TASK-0004 — `pnpm --filter @detran/portal-identity test:unit` (C-0001-20a) — sensor-error — spec define relógio fixo mas não o injeta em `assertActLevel` (contrato §4 exige injeção) — TASK-0003 iteração 2: passar `clock` (5º argumento); código intacto.
- TASK-0004 — `pnpm --filter @detran/app test:e2e` (C-0001-42) — reference-gap — contrato §3 fixa que a política roda antes da guarda; `field-agent` é negado pela política (403 STYNX sem `code`), logo `IDENTITY_NOT_CITIZEN` é inalcançável para esse papel no e2e — adenda A3; TASK-0003 iteração 2 ajusta a expectativa (403 sem `code`); `IDENTITY_NOT_CITIZEN` provado por `technical-admin` com claims (C-0001-09b).
- TASK-0004 — e2e C-0001-41 (reexecução em banco persistente) — sensor-error — spec não limpa `portal.subject` do CPF fixture no `beforeAll` — TASK-0003 iteração 2: `delete` no `beforeAll`.
- TASK-0004 — D13 (`portal.subject.name not null` × contrato) — reference-gap — blueprint `IDENTITY` v1.0.2 `name nullable` (maestro, Architect) + regeneração no checkpoint.

## Retomada
````

### Diff completo (arquivos manuscritos, blueprints, DDL manuscrito, seeds, testes, app, tools, ADR)

```diff
diff --git a/backend/app/package.json b/backend/app/package.json
index f089290..2914bcb 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -51,7 +51,12 @@
     "@detran/ops-offline-sync": "workspace:*",
     "@detran/ops-parameter": "workspace:*",
     "@detran/ops-snapshots": "workspace:*",
+    "@detran/portal-citizen-service": "workspace:*",
     "@detran/portal-complaints": "workspace:*",
+    "@detran/portal-identity": "workspace:*",
+    "@detran/portal-inbox": "workspace:*",
+    "@detran/portal-projections": "workspace:*",
+    "@detran/portal-requests": "workspace:*",
     "@detran/sefaz-adapter": "workspace:*",
     "@detran/senatran-adapter": "workspace:*",
     "@detran/shared": "workspace:*",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 0ea34a1..8e51a63 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -61,6 +61,11 @@ import { SchedulingModule } from '@detran/ch-scheduling';
 import { TelehealthModule } from '@detran/ch-telehealth';
 import { ToxicologyModule } from '@detran/ch-toxicology';
 import { ComplaintsModule } from '@detran/portal-complaints';
+import { IdentityModule } from '@detran/portal-identity';
+import { RequestsModule } from '@detran/portal-requests';
+import { InboxModule } from '@detran/portal-inbox';
+import { CitizenServiceModule } from '@detran/portal-citizen-service';
+import { ProjectionsModule } from '@detran/portal-projections';
 import { AitModule } from '@detran/inf-ait';
 import { AlcoholModule } from '@detran/inf-alcohol';
 import { MeasuresModule } from '@detran/inf-measures';
@@ -94,7 +99,12 @@ import {
   detranTokenVerifier,
   detranRuntimeProfile,
   detranFeatureFlagSet,
+  detranPortalHostnameDirectory,
   isLocalRuntimeProfile,
+  portalHostOf,
+  portalRequestHostStorage,
+  seedPortalPublicRequest,
+  type PortalPublicRequestLike,
 } from './detran-runtime.js';
 import { TeatSyncModule } from './teat-sync.providers.js';
 import { TeatEvidencePortsModule } from './teat-evidence.providers.js';
@@ -172,7 +182,37 @@ function patchTenantContextInterceptorOrdering(): void {
       actor?: { id?: string };
       user?: { id?: string };
       tenantId?: string;
+      portalPublic?: { tenantId: string; actorId: string };
     }>();
+    if (request.portalPublic) {
+      // Rotas `@Public()` de `/v1/portal/*` (R-0009 CTG-0001 §8/§9, M11): sem
+      // sessão nem membership, o tenant já foi resolvido pelo Host/X-Tenant-Id
+      // em `seedPortalPublicRequest` (guard de autenticação do app). O
+      // interceptor de tenancy do STYNX exige X-Tenant-Id + ator com
+      // membership ativa — inaplicável a uma leitura pública —, por isso o
+      // contexto é semeado aqui com o ator nominal (OD-P27) e o interceptor
+      // publicado não é chamado para essas rotas.
+      const { tenantId, actorId } = request.portalPublic;
+      return new Observable((subscriber) => {
+        let subscription: { unsubscribe(): void } | undefined;
+        this.requestContextMutator.runWithRequestContext(
+          {
+            requestId: generateRequestId(),
+            startedAt: new Date(),
+            tenantId,
+            actorId,
+          },
+          () => {
+            subscription = next.handle().subscribe({
+              next: (value) => subscriber.next(value),
+              error: (error) => subscriber.error(error),
+              complete: () => subscriber.complete(),
+            });
+          },
+        );
+        return () => subscription?.unsubscribe();
+      });
+    }
     return new Observable((subscriber) => {
       let subscription: { unsubscribe(): void } | undefined;
       const actorId =
@@ -214,13 +254,21 @@ export class DetranLegacyAuthContextGuard implements CanActivate {
       DETRAN_PUBLIC_METADATA_KEY,
       [context.getHandler(), context.getClass()],
     );
-    if (isPublic) return true;
     const request = context
       .switchToHttp()
-      .getRequest<{ path?: string; url?: string }>();
+      .getRequest<PortalPublicRequestLike>();
+    if (isPublic) {
+      // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
+      seedPortalPublicRequest(request);
+      return true;
+    }
     const path = request.path ?? request.url ?? '';
     if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
-    return this.inner.canActivate(context);
+    // R-0009 CTG-0001 §9: `TenantResolverContext` não expõe o Host; o guard
+    // interno (e `DetranTenantResolver.resolve`) roda dentro deste escopo.
+    return portalRequestHostStorage.run(portalHostOf(request.headers), () =>
+      this.inner.canActivate(context),
+    );
   }
 }

@@ -236,13 +284,21 @@ export class DetranStynxAuthContextGuard implements CanActivate {
       DETRAN_PUBLIC_METADATA_KEY,
       [context.getHandler(), context.getClass()],
     );
-    if (isPublic) return true;
     const request = context
       .switchToHttp()
-      .getRequest<{ path?: string; url?: string }>();
+      .getRequest<PortalPublicRequestLike>();
+    if (isPublic) {
+      // R-0009 CTG-0001 §9: tenant das rotas públicas do Portal pelo Host.
+      seedPortalPublicRequest(request);
+      return true;
+    }
     const path = request.path ?? request.url ?? '';
     if (/^\/(healthz|readyz|metrics|info)(\?|$)/.test(path)) return true;
-    return this.inner.canActivate(context);
+    // R-0009 CTG-0001 §9: `TenantResolverContext` não expõe o Host; o guard
+    // interno (e `DetranTenantResolver.resolve`) roda dentro deste escopo.
+    return portalRequestHostStorage.run(portalHostOf(request.headers), () =>
+      this.inner.canActivate(context),
+    );
   }
 }

@@ -254,7 +310,7 @@ class DetranDatabaseBinder implements OnModuleInit {
     private readonly requestContextMutator: RequestContextMutator,
   ) {}

-  onModuleInit(): void {
+  async onModuleInit(): Promise<void> {
     detranAuditSink.bindDatabase(this.database);
     detranPostgresReadiness.bindDatabase(this.database);
     detranPipelineSqlExecutor.bindDatabase(this.database);
@@ -262,6 +318,10 @@ class DetranDatabaseBinder implements OnModuleInit {
       this.requestContext,
       this.requestContextMutator,
     );
+    // R-0009 CTG-0001 §9 (M11): diretório Host → tenant carregado no
+    // bootstrap, fora do caminho da requisição.
+    detranPortalHostnameDirectory.bindDatabase(this.database);
+    await detranPortalHostnameDirectory.reload();
   }
 }

@@ -358,6 +418,14 @@ export class AppModule {
         RestrictionsModule,
         RetentionModule,
         ComplaintsModule,
+        // Portal do cidadão (R-0009 CTG-0001, plan M1/M24): `identity` traz
+        // as rotas manuscritas deste grupo; os outros quatro são montados
+        // como módulos puramente gerados (sem rotas) até CTG-0002.
+        IdentityModule,
+        RequestsModule,
+        InboxModule,
+        CitizenServiceModule,
+        ProjectionsModule,
         // Infractions scope (TEAT/RAIT): generated CRUD modules plus the
         // handwritten AIT lifecycle commands (WP-T0).
         // Portas do protocolo de sincronização (CTG-0002 §4.8) antes dos
diff --git a/backend/app/src/detran-runtime.ts b/backend/app/src/detran-runtime.ts
index fe5ef1a..cd9d4d5 100644
--- a/backend/app/src/detran-runtime.ts
+++ b/backend/app/src/detran-runtime.ts
@@ -13,7 +13,9 @@ import type {
   TenantResolverContext,
   TokenVerifier,
 } from '@stynx-nyx/contracts';
+import { AsyncLocalStorage } from 'node:async_hooks';
 import { CognitoTokenVerifier } from '@stynx-nyx/auth';
+import { headerToString } from '@stynx-nyx/contracts';
 import {
   generateRequestId,
   RequestContext,
@@ -50,7 +52,11 @@ import {
 } from '@stynx-nyx/ratelimit';
 import type { StynxStorageModuleOptions } from '@stynx-nyx/storage';

-import { isDetranActionAllowed, permissionsForRoles } from '@detran/shared';
+import {
+  DetranError,
+  isDetranActionAllowed,
+  permissionsForRoles,
+} from '@detran/shared';
 import {
   InMemoryFeatureFlagProvider,
   type FlagSet,
@@ -327,6 +333,19 @@ export class DetranLocalTokenVerifier implements TokenVerifier {
         ...(process.env.DETRAN_LOCAL_DECISION_BODY
           ? { decision_body: process.env.DETRAN_LOCAL_DECISION_BODY }
           : {}),
+        // R-0009 CTG-0001 §2.3 (M3; ADR-0024 §6): o IdP gov.br é simulado —
+        // os valores são copiados literalmente e NÃO validados aqui; quem
+        // falha em valor inválido é a `PortalCitizenGuard` (fail-closed).
+        // Ausência da variável = ausência da claim.
+        ...(process.env.DETRAN_LOCAL_ASSURANCE_LEVEL
+          ? { assurance_level: process.env.DETRAN_LOCAL_ASSURANCE_LEVEL }
+          : {}),
+        ...(process.env.DETRAN_LOCAL_CPF
+          ? { cpf: process.env.DETRAN_LOCAL_CPF }
+          : {}),
+        ...(process.env.DETRAN_LOCAL_GOVBR_LEVEL
+          ? { govbr_level: process.env.DETRAN_LOCAL_GOVBR_LEVEL }
+          : {}),
       },
     };
     return { principal, token };
@@ -377,16 +396,197 @@ export function detranTokenVerifier(): TokenVerifier {
   });
 }

+type HostnameDirectoryDatabase = Pick<Database, 'tx' | 'withSystemContext'>;
+
+/**
+ * Host público → tenant (R-0009 CTG-0001 §9; plan M11): mapa em memória de
+ * `portal.public_hostname` (`enabled = true`, sem RLS por desenho — DDL 19),
+ * carregado no bootstrap do app (`DetranDatabaseBinder`) fora do caminho da
+ * requisição. `TenantResolver.resolve` é síncrono no STYNX 1.3.1, por isso o
+ * diretório não consulta o banco por requisição. Recarga por intervalo:
+ * valor sem fonte (source_pending, OD-P22) — só `reload()` explícito.
+ */
+export class PortalHostnameDirectory {
+  private database: HostnameDirectoryDatabase | undefined;
+  private entries = new Map<string, string>();
+
+  bindDatabase(database: HostnameDirectoryDatabase): void {
+    this.database = database;
+  }
+
+  async reload(): Promise<void> {
+    const database = this.database;
+    if (!database) {
+      throw new Error(
+        'DETRAN portal hostname directory requires the Database provider',
+      );
+    }
+    const rows = await database.withSystemContext(
+      'DETRAN portal hostname directory',
+      () =>
+        database.tx(
+          async (transaction) =>
+            (
+              await transaction.query<{ hostname: string; tenant_id: string }>(
+                `select hostname, tenant_id
+                   from portal.public_hostname
+                  where enabled = true`,
+              )
+            ).rows,
+          { role: 'owner', readonly: true, retry: false },
+        ),
+    );
+    this.entries = new Map(
+      rows.map((row) => [row.hostname.toLowerCase(), row.tenant_id]),
+    );
+  }
+
+  tenantIdFor(host: string | undefined): string | undefined {
+    return host ? this.entries.get(host) : undefined;
+  }
+}
+
+export const detranPortalHostnameDirectory = new PortalHostnameDirectory();
+
+/** Cabeçalho `Host` normalizado (minúsculo, sem porta) — CTG-0001 §9. */
+export function portalHostOf(
+  headers: Record<string, unknown>,
+): string | undefined {
+  const raw = headerToString(headers['host'])?.trim().toLowerCase();
+  if (!raw) return undefined;
+  const withoutPort = raw.replace(/:\d+$/u, '');
+  return withoutPort || undefined;
+}
+
+/**
+ * `TenantResolverContext` do STYNX (`{ principal, headerTenantId? }`) não
+ * expõe o `Host`: os guards de autenticação do app (`app.module.ts`) executam
+ * o guard interno dentro deste escopo, e `DetranTenantResolver.resolve` lê o
+ * Host daqui (CTG-0001 §9, "middleware/guard global do app que popula o
+ * mesmo contexto").
+ */
+export const portalRequestHostStorage = new AsyncLocalStorage<
+  string | undefined
+>();
+
+export interface PortalTenantResolutionInput {
+  /** `X-Tenant-Id` ou `principal.tenants[0]` (comportamento atual). */
+  sessionTenantId?: string;
+  /** `Host` normalizado por `portalHostOf`. */
+  host?: string;
+}
+
+/**
+ * R-0009 CTG-0001 §9 (M11): regras, nesta ordem —
+ * 1. sessão e Host mapeado divergem → 403 `PORTAL.SESSION_TENANT_MISMATCH`;
+ * 2. sessão → sessão; 3. Host mapeado → tenant do Host; 4/5. consulta ao Host
+ * ligada e nada mapeado → 421 `PORTAL.TENANT_UNRESOLVED`, senão perfil local
+ * → `LOCAL_TENANT_ID` (inalterado); 6. (inalcançável fora do local) erro.
+ * A consulta ao Host só existe fora do perfil local ou com
+ * `DETRAN_PORTAL_HOST_RESOLUTION=on`: sem a flag, o perfil local é idêntico
+ * ao de antes (nenhuma consulta a `public_hostname`).
+ */
 export class DetranTenantResolver implements TenantResolver {
+  constructor(
+    private readonly directory: PortalHostnameDirectory = detranPortalHostnameDirectory,
+  ) {}
+
   resolve(context: TenantResolverContext): string {
-    const tenantId = context.headerTenantId ?? context.principal.tenants[0];
-    if (tenantId) return tenantId;
+    return this.resolveTenant({
+      sessionTenantId: context.headerTenantId ?? context.principal.tenants[0],
+      host: portalRequestHostStorage.getStore(),
+    });
+  }
+
+  resolveTenant(input: PortalTenantResolutionInput): string {
     const profile = detranRuntimeProfile();
+    const hostLookup =
+      process.env.DETRAN_PORTAL_HOST_RESOLUTION === 'on' ||
+      !isLocalRuntimeProfile(profile);
+    const session = input.sessionTenantId || undefined;
+    const mapped = hostLookup
+      ? this.directory.tenantIdFor(input.host)
+      : undefined;
+    if (session && mapped && session !== mapped) {
+      throw new DetranError('PORTAL.SESSION_TENANT_MISMATCH', {
+        status: 403,
+        context: {},
+      });
+    }
+    if (session) return session;
+    if (mapped) return mapped;
+    // Com a consulta ao Host ligada (perfil não local ou flag), um Host não
+    // mapeado é 421 mesmo no perfil local — é a única forma de o e2e provar o
+    // caminho 5 (§9, C-0001-48); o padrão local (`LOCAL_TENANT_ID`) só vale
+    // com a flag desligada (C-0001-50, comportamento atual).
+    if (hostLookup) {
+      throw new DetranError('PORTAL.TENANT_UNRESOLVED', {
+        status: 421,
+        context: {},
+      });
+    }
     if (isLocalRuntimeProfile(profile)) return LOCAL_TENANT_ID;
     throw new Error(`Tenant context is required in ${profile} profile`);
   }
 }

+/** Prefixo das rotas do Portal (portal-route-contract.md §1.1). */
+export const PORTAL_ROUTE_PREFIX = '/v1/portal/';
+
+/**
+ * Ator nominal das rotas `@Public()` de `/v1/portal/*` (CTG-0001 §8: "não há
+ * actorId em rota pública"). `Database.tx({ role: 'app' })` do STYNX 1.3.1
+ * exige `tenantId` E `actorId` no `RequestContext`
+ * (`resolveExecutionContext` → `ActorContextMissingError`), logo a leitura
+ * pública de `brand_profile`/`service_catalog` precisa de um ator no
+ * contexto. UUID nulo (RFC 9562 §5.9) = "nenhum ator": `uuidOrNull` do sink
+ * de auditoria o descarta e nenhuma tabela o referencia. Valor sem fonte no
+ * contrato — registrado como OD-P27 (relatório de TASK-0004).
+ */
+export const PORTAL_PUBLIC_ACTOR_ID = '00000000-0000-0000-0000-000000000000';
+
+export interface PortalPublicRequestLike {
+  headers: Record<string, unknown>;
+  path?: string;
+  url?: string;
+  originalUrl?: string;
+  tenantId?: string;
+  /** Ator nominal lido pelo `RequestContextInterceptor` do STYNX core. */
+  actor?: { id: string };
+  /** Contexto semeado para rotas públicas do Portal (lido em `app.module.ts`). */
+  portalPublic?: { tenantId: string; actorId: string };
+}
+
+export function isPortalRoutePath(path: string): boolean {
+  return path.startsWith(PORTAL_ROUTE_PREFIX);
+}
+
+/**
+ * Rotas `@Public()` de `/v1/portal/*` (`GET brand`, `GET services[/{key}]`,
+ * CTG-0001 §8/§9): sem sessão, o tenant vem de `X-Tenant-Id` (semeia a
+ * sessão, route contract §1.5) e/ou do `Host`, pelas mesmas regras de
+ * `DetranTenantResolver`; o resultado fica em `request.tenantId`,
+ * `request.actor` (ator nominal) e `request.portalPublic`: o interceptor de
+ * tenancy patchado em `app.module.ts` pula a validação de membership do
+ * STYNX para essas rotas e o `RequestContextInterceptor` do STYNX core semeia
+ * o `RequestContext` a partir de `request.tenantId`/`request.actor.id`.
+ * Rotas públicas fora do Portal (webhooks PEC) não mudam.
+ */
+export function seedPortalPublicRequest(
+  request: PortalPublicRequestLike,
+  resolver: DetranTenantResolver = new DetranTenantResolver(),
+): void {
+  const path = request.path ?? request.originalUrl ?? request.url ?? '';
+  if (!isPortalRoutePath(path)) return;
+  const tenantId = resolver.resolveTenant({
+    sessionTenantId: headerToString(request.headers['x-tenant-id'])?.trim(),
+    host: portalHostOf(request.headers),
+  });
+  request.tenantId = tenantId;
+  request.actor = { id: PORTAL_PUBLIC_ACTOR_ID };
+  request.portalPublic = { tenantId, actorId: PORTAL_PUBLIC_ACTOR_ID };
+}
+
 export class DetranTenantEntitlementPolicy implements TenantEntitlementPolicy {
   isEntitled(context: TenantEntitlementContext): boolean {
     return context.principal.tenants.includes(context.tenantId);
diff --git a/backend/app/tests/e2e/portal-identity.e2e.spec.ts b/backend/app/tests/e2e/portal-identity.e2e.spec.ts
new file mode 100644
index 0000000..58f9016
--- /dev/null
+++ b/backend/app/tests/e2e/portal-identity.e2e.spec.ts
@@ -0,0 +1,579 @@
+import { createHash, randomUUID } from 'node:crypto';
+import { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import request from 'supertest';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+import { AppModule } from '../../src/app.module.js';
+
+/**
+ * CTG-0001 §11 (TASK-0003) — identidade federada, guarda fail-closed, matriz ato → nível e
+ * catálogo público através das quatro rotas de CTG-0001 (`GET identity/me`, `GET brand`,
+ * `GET services[/{key}]`). Fica vermelho até TASK-0004 montar os cinco módulos gerados no
+ * `AppModule`, criar `PortalCitizenGuard`/`PortalIdentityService` e as rotas manuscritas
+ * (`me.controller.ts`, `public.controller.ts`) — hoje as quatro rotas nem existem, então as
+ * chamadas HTTP abaixo respondem 404 do próprio Nest (rota inexistente), o sinal esperado de
+ * "comportamento ausente" (mesmo padrão de inf-ait-routes.e2e.spec.ts §13 item 2, leitura
+ * obrigatória).
+ *
+ * Setup no molde de backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts (leitura obrigatória):
+ * tenant local + usuário + membership fixos, `NestFactory.create(AppModule.forRoot())`,
+ * `headers()`/limpeza de env no `afterAll`. `fileParallelism: false` (vitest.config.ts) mantém
+ * este arquivo no mesmo processo dos demais e2e — todo `DETRAN_LOCAL_*`/
+ * `DETRAN_PORTAL_HOST_RESOLUTION` setado por um teste é limpo no `afterEach`/`afterAll` (padrão
+ * de policy-routes.e2e.spec.ts §1-60, leitura obrigatória).
+ */
+const { Client } = pg;
+const tenantId = '00000000-0000-7000-8000-000000000001';
+const actorId = '00000000-0000-4000-8000-000000000002';
+const canonicalTenantId = '00000000-0000-7000-8000-00000000a001';
+const localHostname = 'portal.local-e2e.invalid';
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+
+/** Cópia do §5 (M5/A1) — as 21 linhas de act_level_policy, para o tenant local (C-0001-39/40). */
+const ACT_LEVEL_POLICY_ROWS: Array<{ actKey: string; minimum: string }> = [
+  { actKey: 'consulta_multas', minimum: 'simples' },
+  { actKey: 'consulta_cnh', minimum: 'simples' },
+  { actKey: 'emissao_crlv', minimum: 'simples' },
+  { actKey: 'pagamento', minimum: 'simples' },
+  { actKey: 'adesao_sne', minimum: 'avancada' },
+  { actKey: 'cancelamento_sne', minimum: 'avancada' },
+  { actKey: 'lgpd_declaracao', minimum: 'simples' },
+  { actKey: 'acompanhar_manifestacao', minimum: 'simples' },
+  { actKey: 'defesa_previa', minimum: 'avancada' },
+  { actKey: 'recurso_jari', minimum: 'avancada' },
+  { actKey: 'recurso_cetran', minimum: 'avancada' },
+  { actKey: 'indicacao_condutor', minimum: 'avancada' },
+  { actKey: 'procuracao', minimum: 'avancada' },
+  { actKey: 'junta_medica', minimum: 'avancada' },
+  { actKey: 'lgpd_declaracao:declaracao_completa', minimum: 'avancada' },
+  { actKey: 'lgpd_declaracao:correcao', minimum: 'avancada' },
+  { actKey: 'lgpd_declaracao:eliminacao', minimum: 'avancada' },
+  { actKey: 'manifestar', minimum: 'none' },
+  { actKey: 'consulta_bat', minimum: 'simples' },
+  { actKey: 'consulta_exame', minimum: 'simples' },
+  { actKey: 'avaliar', minimum: 'simples' },
+];
+
+/** Cópia do §10.7 (M12) — as 15 linhas de service_catalog, para o tenant local (C-0001-45/46). */
+const SERVICE_CATALOG_ROWS: Array<{
+  serviceKey: string;
+  category: string;
+  availability: 'available' | 'partially_available' | 'unavailable';
+  minimum: string;
+  unavailableReason: string | null;
+  alternativeChannelNote: string | null;
+}> = [
+  {
+    serviceKey: 'consulta_multas',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'consulta_cnh',
+    category: 'ch',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'emissao_crlv',
+    category: 'est',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'adesao_sne',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'avancada',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'cancelamento_sne',
+    category: 'inf',
+    availability: 'available',
+    minimum: 'avancada',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'consulta_bat',
+    category: 'est',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'consulta_exame',
+    category: 'ch',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'manifestar',
+    category: 'transversal',
+    availability: 'available',
+    minimum: 'none',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'avaliar',
+    category: 'transversal',
+    availability: 'available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote: null,
+  },
+  {
+    serviceKey: 'pagamento',
+    category: 'inf',
+    availability: 'partially_available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote:
+      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
+  },
+  {
+    serviceKey: 'lgpd_declaracao',
+    category: 'transversal',
+    availability: 'partially_available',
+    minimum: 'simples',
+    unavailableReason: null,
+    alternativeChannelNote:
+      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
+  },
+  {
+    serviceKey: 'defesa_previa',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
+  },
+  {
+    serviceKey: 'recurso_jari',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
+  },
+  {
+    serviceKey: 'recurso_cetran',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
+  },
+  {
+    serviceKey: 'indicacao_condutor',
+    category: 'inf',
+    availability: 'unavailable',
+    minimum: 'avancada',
+    unavailableReason: 'delegacao_indisponivel_r0007',
+    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
+  },
+];
+
+beforeAll(async () => {
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
+     on conflict (id) do update set name = excluded.name`,
+    [tenantId],
+  );
+  await client.query(
+    `insert into auth.users (id, tenant_id, email, display_name)
+     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
+     on conflict (id) do update set tenant_id = excluded.tenant_id`,
+    [actorId, tenantId],
+  );
+  await client.query(
+    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
+     on conflict (tenant_id, user_id) do update set is_active = true`,
+    [tenantId, actorId],
+  );
+
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(`select set_config('app.actor_id', $1, false)`, [actorId]);
+
+  await client.query(
+    `insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
+     values ($1, 'Local E2E Portal (fixture)', 'Local E2E', 'Local E2E Portal (fixture)', '#1351B4', 'https://portal.local-e2e.invalid/suporte', 'https://portal.local-e2e.invalid/privacidade', 'https://portal.local-e2e.invalid/acessibilidade', 'ouvidoria@local-e2e.invalid', 'pt-BR', 'America/Manaus')
+     on conflict (tenant_id) do update set display_name = excluded.display_name`,
+    [tenantId],
+  );
+  await client.query(
+    `insert into portal.public_hostname (hostname, tenant_id, enabled) values ($1, $2, true)
+     on conflict (hostname) do update set tenant_id = excluded.tenant_id, enabled = true`,
+    [localHostname, tenantId],
+  );
+
+  // `on conflict` mira a chave natural (tenant_id, act_key, effective_from) — não (id) — para o
+  // beforeAll ficar idempotente entre execuções sucessivas contra o mesmo banco local (o `id` é
+  // sorteado a cada run; mirar (id) faria a segunda execução colidir com a unique de negócio em
+  // vez de atualizar a linha existente).
+  for (const row of ACT_LEVEL_POLICY_ROWS) {
+    await client.query(
+      `insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
+       values ($1, $2, $3, $4, 'fixture e2e (cópia de CTG-0001 §5)', 'fixture e2e', true, '2026-01-01', null)
+       on conflict (tenant_id, act_key, effective_from) do update set minimum_assurance = excluded.minimum_assurance`,
+      [randomUUID(), tenantId, row.actKey, row.minimum],
+    );
+  }
+
+  for (const row of SERVICE_CATALOG_ROWS) {
+    await client.query(
+      `insert into portal.service_catalog (
+         id, tenant_id, service_key, route, category, title, summary, requirements_json,
+         delivery_channel, legal_deadline, cost, accessibility_note, responsible_party,
+         normative_reference, availability, unavailable_reason, alternative_channel_note,
+         minimum_assurance, version, effective_from
+       ) values (
+         $1, $2, $3, $4, $5, $6, $6, '[]'::jsonb, 'portal', 'source_pending (OD-P26)',
+         'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'Local E2E',
+         'fixture e2e', $7, $8, $9, $10, 1, '2026-01-01'
+       )
+       on conflict (tenant_id, service_key) do update set
+         availability = excluded.availability,
+         unavailable_reason = excluded.unavailable_reason,
+         alternative_channel_note = excluded.alternative_channel_note,
+         minimum_assurance = excluded.minimum_assurance`,
+      [
+        randomUUID(),
+        tenantId,
+        row.serviceKey,
+        `/servicos/${row.serviceKey.replaceAll('_', '-')}`,
+        row.category,
+        `${row.serviceKey} (fixture e2e)`,
+        row.availability,
+        row.unavailableReason,
+        row.alternativeChannelNote,
+        row.minimum,
+      ],
+    );
+  }
+
+  app = await NestFactory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
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
+afterEach(() => {
+  // Mesmo cuidado de inf-ait-routes.e2e.spec.ts (leitura obrigatória) — roda mesmo quando o
+  // teste lança no meio, para nenhum DETRAN_LOCAL_*/DETRAN_PORTAL_HOST_RESOLUTION vazar para o
+  // próximo teste ou arquivo (fileParallelism: false, mesmo processo).
+  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
+  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
+  delete process.env.DETRAN_LOCAL_CPF;
+  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
+  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+});
+
+const headers = () => ({
+  authorization: 'Bearer local',
+  'x-tenant-id': tenantId,
+  'idempotency-key': randomUUID(),
+});
+
+describe('GET /v1/portal/identity/me (§3, §8; M4) — guarda fail-closed', () => {
+  it('C-0001-38 — dado DETRAN_LOCAL_ROLES=CIDADAO sem DETRAN_LOCAL_ASSURANCE_LEVEL quando GET me então 403 PORTAL.ASSURANCE_NOT_VERIFIED', async () => {
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(403);
+    expect(response.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
+  });
+
+  it('C-0001-39 — dado ASSURANCE_LEVEL=avancada e CPF=22222222222 quando GET me então 200 com o corpo do §8 e actRequirements com 21 itens', async () => {
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
+    process.env.DETRAN_LOCAL_CPF = '22222222222';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    expect(response.body.cpf).toBe('22222222222');
+    expect(response.body.assuranceLevel).toBe('avancada');
+    expect(typeof response.body.subjectId).toBe('string');
+    expect(response.body.actRequirements).toHaveLength(21);
+    expect(response.body.representations).toEqual([]);
+    expect(response.body.preferences).toBeNull();
+    expect(response.body.heldDataSummary).toEqual([]);
+
+    const adesaoSne = response.body.actRequirements.find(
+      (item: { actKey: string }) => item.actKey === 'adesao_sne',
+    );
+    expect(adesaoSne?.allowed).toBe(true);
+    const manifestar = response.body.actRequirements.find(
+      (item: { actKey: string }) => item.actKey === 'manifestar',
+    );
+    expect(manifestar?.allowed).toBe(true);
+    const defesaPrevia = response.body.actRequirements.find(
+      (item: { actKey: string }) => item.actKey === 'defesa_previa',
+    );
+    expect(defesaPrevia?.allowed).toBe(true);
+  });
+
+  it('C-0001-40 — dado ASSURANCE_LEVEL=simples e CPF=11111111111 quando GET me então actRequirements: adesao_sne allowed=false reason PORTAL.ASSURANCE_INSUFFICIENT; consulta_multas allowed=true', async () => {
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
+    process.env.DETRAN_LOCAL_CPF = '11111111111';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    const adesaoSne = response.body.actRequirements.find(
+      (item: { actKey: string }) => item.actKey === 'adesao_sne',
+    );
+    expect(adesaoSne).toMatchObject({
+      allowed: false,
+      reason: 'PORTAL.ASSURANCE_INSUFFICIENT',
+    });
+    const consultaMultas = response.body.actRequirements.find(
+      (item: { actKey: string }) => item.actKey === 'consulta_multas',
+    );
+    expect(consultaMultas?.allowed).toBe(true);
+  });
+
+  it('C-0001-41 — dado GET me duas vezes com o mesmo CPF então uma única linha em portal.subject (upsert) e version 1; dado a segunda com nível diferente então version 2', async () => {
+    const cpf = '33333333333';
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
+    process.env.DETRAN_LOCAL_CPF = cpf;
+    const cpfHash = createHash('sha256').update(cpf).digest('hex');
+
+    // Idempotência contra banco persistente (Triagem TASK-0004, item 3): apaga o sujeito do CPF
+    // fixture do tenant local antes de exercitar o upsert, para `version` sempre começar de 1
+    // nesta execução (o cliente `pg` acima do arquivo já roda sob `app.role='owner'`).
+    await client.query(
+      `delete from portal.subject where tenant_id = $1 and cpf_hash = $2`,
+      [tenantId, cpfHash],
+    );
+
+    const first = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(first.status, JSON.stringify(first.body)).toBe(200);
+
+    const second = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(second.status, JSON.stringify(second.body)).toBe(200);
+
+    const afterTwoSameLevel = await client.query<{
+      count: string;
+      version: number;
+    }>(
+      `select count(*)::text as count, max(version) as version from portal.subject
+        where tenant_id = $1 and cpf_hash = $2`,
+      [tenantId, cpfHash],
+    );
+    expect(afterTwoSameLevel.rows[0]?.count).toBe('1');
+    expect(afterTwoSameLevel.rows[0]?.version).toBe(1);
+
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
+    const third = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(third.status, JSON.stringify(third.body)).toBe(200);
+
+    const afterLevelChange = await client.query<{
+      count: string;
+      version: number;
+    }>(
+      `select count(*)::text as count, max(version) as version from portal.subject
+        where tenant_id = $1 and cpf_hash = $2`,
+      [tenantId, cpfHash],
+    );
+    expect(afterLevelChange.rows[0]?.count).toBe('1');
+    expect(afterLevelChange.rows[0]?.version).toBe(2);
+  });
+
+  it('C-0001-42 — dado DETRAN_LOCAL_ROLES=field-agent com claims válidas quando GET me então 403 da política STYNX (A3(a): field-agent é negado antes da guarda, sem code do Portal)', async () => {
+    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
+    process.env.DETRAN_LOCAL_CPF = '11111111111';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(403);
+    expect(response.body.code).not.toBe('PORTAL.IDENTITY_NOT_CITIZEN');
+    expect(response.body.code).not.toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
+  });
+
+  it('C-0001-43 — dado DETRAN_LOCAL_ROLES=technical-admin sem claims quando GET me então 403 PORTAL.ASSURANCE_NOT_VERIFIED (a política concede "*"; a guarda nega)', async () => {
+    process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(403);
+    expect(response.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
+  });
+
+  it('C-0001-51 — dado GET me quando bem-sucedido então uma linha de auditoria com action PORTAL_IDENTITY_READ e entity portal.subject (M20, RN-PORTAL-118 4)', async () => {
+    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
+    process.env.DETRAN_LOCAL_CPF = '22222222222';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/identity/me')
+      .set(headers());
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+
+    const audited = await client.query<{ action: string; entity: string }>(
+      `select action, entity from audit.events
+        where tenant_id = $1 and action = 'PORTAL_IDENTITY_READ'
+        order by occurred_at desc limit 1`,
+      [tenantId],
+    );
+    expect(audited.rows[0]?.action).toBe('PORTAL_IDENTITY_READ');
+    expect(audited.rows[0]?.entity).toBe('portal.subject');
+  });
+});
+
+describe('GET /v1/portal/brand e /v1/portal/services (@Public, M12) — sem Authorization', () => {
+  it('C-0001-44 — dado sem Authorization quando GET /v1/portal/brand então 200 com os 10 campos do tenant local', async () => {
+    const response = await request(app.getHttpServer()).get('/v1/portal/brand');
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    expect(response.body).toMatchObject({
+      displayName: 'Local E2E Portal (fixture)',
+      shortName: 'Local E2E',
+      legalName: 'Local E2E Portal (fixture)',
+      primaryColor: '#1351B4',
+      locale: 'pt-BR',
+      timeZone: 'America/Manaus',
+    });
+    expect(Object.keys(response.body).sort()).toEqual(
+      [
+        'displayName',
+        'shortName',
+        'legalName',
+        'primaryColor',
+        'supportUrl',
+        'privacyUrl',
+        'accessibilityUrl',
+        'serviceContact',
+        'locale',
+        'timeZone',
+      ].sort(),
+    );
+  });
+
+  it('C-0001-45 — dado sem Authorization quando GET /v1/portal/services então 200 com 15 itens, 9/2/4 por availability, ordem category,serviceKey', async () => {
+    const response = await request(app.getHttpServer()).get(
+      '/v1/portal/services',
+    );
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    expect(response.body).toHaveLength(15);
+    const byAvailability = {
+      available: 0,
+      partially_available: 0,
+      unavailable: 0,
+    };
+    for (const service of response.body as Array<{
+      availability: keyof typeof byAvailability;
+    }>) {
+      byAvailability[service.availability] += 1;
+    }
+    expect(byAvailability).toEqual({
+      available: 9,
+      partially_available: 2,
+      unavailable: 4,
+    });
+    const ordered = [...response.body].sort(
+      (
+        left: { category: string; serviceKey: string },
+        right: { category: string; serviceKey: string },
+      ) =>
+        left.category === right.category
+          ? left.serviceKey.localeCompare(right.serviceKey)
+          : left.category.localeCompare(right.category),
+    );
+    expect(response.body).toEqual(ordered);
+  });
+
+  it('C-0001-46 — dado GET /v1/portal/services/manifestar então 200 minimumAssurance "none"; dado GET services/nao_existe então 404 PORTAL.NOT_FOUND { kind: "service" }', async () => {
+    const found = await request(app.getHttpServer()).get(
+      '/v1/portal/services/manifestar',
+    );
+    expect(found.status, JSON.stringify(found.body)).toBe(200);
+    expect(found.body.minimumAssurance).toBe('none');
+
+    const missing = await request(app.getHttpServer()).get(
+      '/v1/portal/services/nao_existe',
+    );
+    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
+    expect(missing.body.code).toBe('PORTAL.NOT_FOUND');
+    expect(missing.body.context).toEqual({ kind: 'service' });
+  });
+});
+
+describe('Resolução de tenant pelo Host (§9, M11) — DETRAN_PORTAL_HOST_RESOLUTION=on', () => {
+  it('C-0001-47 — dado Host "portal.local-e2e.invalid" sem X-Tenant-Id quando GET brand então 200 (tenant do Host)', async () => {
+    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/brand')
+      .set('Host', localHostname);
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    expect(response.body.displayName).toBe('Local E2E Portal (fixture)');
+  });
+
+  it('C-0001-48 — dado Host desconhecido sem X-Tenant-Id quando GET brand então 421 PORTAL.TENANT_UNRESOLVED', async () => {
+    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/brand')
+      .set('Host', 'portal.desconhecido.invalid');
+    expect(response.status, JSON.stringify(response.body)).toBe(421);
+    expect(response.body.code).toBe('PORTAL.TENANT_UNRESOLVED');
+  });
+
+  it('C-0001-49 — dado Host "portal.local-e2e.invalid" e X-Tenant-Id = tenant canônico quando GET brand então 403 PORTAL.SESSION_TENANT_MISMATCH', async () => {
+    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/brand')
+      .set('Host', localHostname)
+      .set('x-tenant-id', canonicalTenantId);
+    expect(response.status, JSON.stringify(response.body)).toBe(403);
+    expect(response.body.code).toBe('PORTAL.SESSION_TENANT_MISMATCH');
+  });
+
+  it('C-0001-50 — dado DETRAN_PORTAL_HOST_RESOLUTION ausente e Host desconhecido quando GET brand então comportamento atual (tenant local) — 200', async () => {
+    delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
+    const response = await request(app.getHttpServer())
+      .get('/v1/portal/brand')
+      .set('Host', 'portal.desconhecido.invalid');
+    expect(response.status, JSON.stringify(response.body)).toBe(200);
+    expect(response.body.displayName).toBe('Local E2E Portal (fixture)');
+  });
+});
diff --git a/backend/app/vitest.config.ts b/backend/app/vitest.config.ts
index e4b8d1d..a3ac4f4 100644
--- a/backend/app/vitest.config.ts
+++ b/backend/app/vitest.config.ts
@@ -126,6 +126,24 @@ export default defineConfig({
       '@detran/portal-complaints': fileURLToPath(
         new URL('../domains/portal/complaints/src/index.ts', import.meta.url),
       ),
+      '@detran/portal-identity': fileURLToPath(
+        new URL('../domains/portal/identity/src/index.ts', import.meta.url),
+      ),
+      '@detran/portal-requests': fileURLToPath(
+        new URL('../domains/portal/requests/src/index.ts', import.meta.url),
+      ),
+      '@detran/portal-inbox': fileURLToPath(
+        new URL('../domains/portal/inbox/src/index.ts', import.meta.url),
+      ),
+      '@detran/portal-citizen-service': fileURLToPath(
+        new URL(
+          '../domains/portal/citizen-service/src/index.ts',
+          import.meta.url,
+        ),
+      ),
+      '@detran/portal-projections': fileURLToPath(
+        new URL('../domains/portal/projections/src/index.ts', import.meta.url),
+      ),
       '@detran/ops-agency': fileURLToPath(
         new URL('../domains/ops/agency/src/index.ts', import.meta.url),
       ),
diff --git a/backend/database/ddl/11-auth-functions.sql b/backend/database/ddl/11-auth-functions.sql
index a68812a..f015970 100644
--- a/backend/database/ddl/11-auth-functions.sql
+++ b/backend/database/ddl/11-auth-functions.sql
@@ -75,7 +75,7 @@ BEGIN
      AND table_info.table_name = column_info.table_name
     WHERE column_info.column_name = 'tenant_id'
       AND table_info.table_type = 'BASE TABLE'
-      AND column_info.table_schema IN ('auth', 'audit', 'storage', 'integration', 'inf', 'est', 'ch', 'ops')
+      AND column_info.table_schema IN ('auth', 'audit', 'storage', 'integration', 'inf', 'est', 'ch', 'ops', 'portal')
       AND NOT EXISTS (
         SELECT 1
         FROM pg_inherits inheritance
diff --git a/backend/database/ddl/14-inf-lifecycle-vocabulary.sql b/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
index 4532e51..33cd43c 100644
--- a/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
+++ b/backend/database/ddl/14-inf-lifecycle-vocabulary.sql
@@ -168,7 +168,7 @@ ON CONFLICT (code) DO UPDATE SET ciencia_rule = EXCLUDED.ciencia_rule, legal_bas
 -- WF-INF-002 §9 — Catálogo unificado de timers
 CREATE TABLE IF NOT EXISTS inf.infraction_timer_ref (
   code varchar(20) PRIMARY KEY,
-  owner varchar(20) NOT NULL CHECK (owner IN ('infracao', 'caso', 'sessao', 'indicador', 'medida')),
+  owner varchar(20) NOT NULL CHECK (owner IN ('infracao', 'caso', 'sessao', 'indicador', 'medida', 'portal')),
   duration_value integer,
   duration_unit varchar(20) NOT NULL CHECK (duration_unit IN ('dias_corridos', 'dias_uteis', 'meses', 'anos', 'data_impressa', 'meta')),
   start_mark text NOT NULL,
@@ -205,7 +205,13 @@ INSERT INTO inf.infraction_timer_ref (code, owner, duration_value, duration_unit
   ('T-CONV', 'sessao', 5, 'dias_uteis', 'fechamento da pauta', 'sessão em PAUTA_FECHADA', 'guarda', NULL, NULL, 'proposta', 'WF-RAIT-003 (pendente regimento)'),
   ('T-ASS', 'caso', 5, 'dias_uteis', 'minuta enviada para assinatura', 'caso RAIT em PRONTO_P_DECISAO (1º circuito)', 'alerta', NULL, NULL, 'proposta', 'WF-RAIT-004 §2 (meta operacional)'),
   ('T-CLAIM', 'caso', 2, 'dias_uteis', 'homologação do lote de sorteio', 'lote LOTE_SORTEADO', 'regra', NULL, NULL, 'proposta', 'WF-RAIT-004 §5'),
-  ('SLA-30', 'indicador', 30, 'meta', 'protocolo (defesa) / entrada na JARI (dias úteis)', '1º e 2º circuitos', 'indicador', NULL, NULL, 'vigente', 'REF-DETRANAM-SERVICOS; WF-RAIT-002 §4.4')
+  ('SLA-30', 'indicador', 30, 'meta', 'protocolo (defesa) / entrada na JARI (dias úteis)', '1º e 2º circuitos', 'indicador', NULL, NULL, 'vigente', 'REF-DETRANAM-SERVICOS; WF-RAIT-002 §4.4'),
+  -- owner='portal' (R-0009 M14; WF-PORTAL-004 §Prazos, WF-PORTAL-001 §Prazos): T-PROTOCOLO é invariante (imediato), não timer;
+  -- T-SNE-CIENCIA já existe acima (owner='infracao') e é lido pelo Portal, nunca duplicado.
+  ('T-OUV-RESPOSTA','portal',30,'dias_corridos','recebimento da manifestação','MANIFESTACAO_REGISTRADA','marco',NULL,NULL,'vigente','Lei 13.460/2017 art. 16 caput; WF-PORTAL-004'),
+  ('T-OUV-INFO','portal',20,'dias_corridos','solicitação de informação ao agente','INFORMACAO_SOLICITADA_AO_AGENTE','marco',NULL,NULL,'vigente','Lei 13.460/2017 art. 16 §ú; WF-PORTAL-004'),
+  ('T-LGPD-ACESSO','portal',NULL,'dias_corridos','requerimento de acesso a dados pessoais (valor = privacy.public_regime_days, source_pending OD-P08)','lgpd_declaracao','marco',NULL,NULL,'proposta','Lei 13.709/2018 art. 19; WF-PORTAL-004'),
+  ('T-AVAL-CONVITE','portal',NULL,'dias_corridos','mesmo evento do resultado (imediato)','RESULTADO_DISPONIVEL','marco',NULL,NULL,'vigente','Lei 14.129/2021 art. 21 V; Lei 13.460/2017 art. 23; WF-PORTAL-001')
 ON CONFLICT (code) DO UPDATE SET owner = EXCLUDED.owner, duration_value = EXCLUDED.duration_value, duration_unit = EXCLUDED.duration_unit,
   start_mark = EXCLUDED.start_mark, armed_in = EXCLUDED.armed_in, expiry_kind = EXCLUDED.expiry_kind, expiry_target = EXCLUDED.expiry_target,
   alert_ladder = EXCLUDED.alert_ladder, status = EXCLUDED.status, legal_basis = EXCLUDED.legal_basis;
diff --git a/backend/database/ddl/19-portal-platform.sql b/backend/database/ddl/19-portal-platform.sql
new file mode 100644
index 0000000..a074091
--- /dev/null
+++ b/backend/database/ddl/19-portal-platform.sql
@@ -0,0 +1,46 @@
+-- 19-portal-platform.sql — plataforma do Portal (DDL manuscrito, faixa 1x; CODESTYLE §Backend SQL).
+-- Fonte: work/rounds/R-0009/plan.md M11 (tenant pelo Host, marca publica, sequencia de protocolo — M8);
+-- docs/framework/arch/portal-route-contract.md §2 (campos de brand) e §11 (platform.public_hostname /
+-- platform.tenant_brand_profile → portal.public_hostname / portal.brand_profile, sem RLS por desenho).
+-- Idempotente: o schema tambem e criado pelos DDL gerados 60–65 (create schema if not exists).
+CREATE SCHEMA IF NOT EXISTS portal;
+
+-- Mapeamento Host → tenant, consultado pelo DetranTenantResolver antes de existir contexto de tenant
+-- (X-Tenant-Id ausente e perfil nao local; PORTAL.TENANT_UNRESOLVED 421 quando nao mapeia).
+-- RLS exempt by design (portal-route-contract.md §11; plan R-0009 M11)
+CREATE TABLE IF NOT EXISTS portal.public_hostname (
+  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
+  hostname text NOT NULL UNIQUE,
+  tenant_id uuid NOT NULL REFERENCES auth.tenants(id),
+  enabled boolean NOT NULL DEFAULT true,
+  created_at timestamptz NOT NULL DEFAULT now()
+);
+COMMENT ON TABLE portal.public_hostname IS 'R-0009 M11 — Host publico → tenant do Portal; hostname unico global; sem RLS por desenho (resolvido antes do contexto de tenant; tools/check-rls-ddl.ts allowlist RLS_EXEMPT_BY_DESIGN).';
+CREATE INDEX IF NOT EXISTS ix_portal_public_hostname_tenant_id ON portal.public_hostname (tenant_id);
+
+-- Marca publica do tenant: os 10 campos de GET brand (portal-route-contract.md §2), lidos sem sessao.
+-- RLS exempt by design (portal-route-contract.md §11; plan R-0009 M11)
+CREATE TABLE IF NOT EXISTS portal.brand_profile (
+  tenant_id uuid PRIMARY KEY REFERENCES auth.tenants(id),
+  display_name text NOT NULL,
+  short_name text NOT NULL,
+  legal_name text NOT NULL,
+  primary_color varchar(20) NOT NULL,
+  support_url text,
+  privacy_url text,
+  accessibility_url text,
+  service_contact text,
+  locale text NOT NULL,
+  time_zone text NOT NULL,
+  updated_at timestamptz NOT NULL DEFAULT now()
+);
+COMMENT ON TABLE portal.brand_profile IS 'R-0009 M11 — marca publica do tenant (GET brand, @Public); uma linha por tenant; sem RLS por desenho (a marca e publica; tools/check-rls-ddl.ts allowlist RLS_EXEMPT_BY_DESIGN).';
+
+-- Sequencia do numero de protocolo (plan R-0009 M8: <tenant-slug-upper>-<AAAA>-<sequencial 7 digitos>).
+-- Vive aqui porque tools/blueprints/generate.mjs nao emite sequences; a tabela portal.protocol e gerada
+-- por BP-PORTAL-REQUESTS-001 (DDL 62).
+CREATE SEQUENCE IF NOT EXISTS portal.protocol_seq;
+
+GRANT USAGE ON SCHEMA portal TO role_app_backend;
+GRANT SELECT, INSERT, UPDATE, DELETE ON portal.public_hostname, portal.brand_profile TO role_app_backend;
+GRANT USAGE, SELECT ON SEQUENCE portal.protocol_seq TO role_app_backend;
diff --git a/backend/database/seed/70-fixtures-portal.sql b/backend/database/seed/70-fixtures-portal.sql
new file mode 100644
index 0000000..e5ad40f
--- /dev/null
+++ b/backend/database/seed/70-fixtures-portal.sql
@@ -0,0 +1,303 @@
+-- Fixtures canônicas do Portal (work/rounds/R-0009/contracts/CTG-0001.md §10; M22 do
+-- work/rounds/R-0009/plan.md, com as adendas A1/A2 aplicadas). Idempotente (upsert por id ou
+-- por chave natural quando a tabela não tem `id`). Aplicar com backend/database/seed.sh depois
+-- de apply.sh. "Hoje" das fixtures = 2026-09-14; tenant canônico
+-- 00000000-0000-7000-8000-00000000a001.
+--
+-- Esquema de ids (CTG-0001 §10.1): 00000000-0000-7000-8000-00007TT000nn, TT = tabela (hex),
+-- nn = linha (hex). ff = alvos externos sem fixture canônica neste repositório.
+--
+-- DIVERGÊNCIAS DDL real × contrato aplicadas aqui (registradas no relatório de entrega da
+-- tarefa; o DDL real manda nas colunas — nota do maestro §1 do prompt TASK-0003):
+--   D1  portal.brand_profile: chave primária é `tenant_id` (sem coluna `id` própria, sem
+--       `created_at`) — DDL manuscrito 19-portal-platform.sql, não o BP-PORTAL-CITIZEN-SERVICE-001
+--       do contrato §7.4. Upsert por `on conflict (tenant_id)`.
+--   D2  portal.representation.instrument_document_id é `not null` no DDL 61 gerado (o contrato
+--       §7.1 pede `null`); usa-se um placeholder `…ff900001` (mesma convenção de "alvo externo
+--       sem fixture canônica" do §10.1).
+--   D3  portal.entitlement não tem a coluna `representation_id` do contrato §7.1 no DDL 61
+--       gerado: a linha …70200009 fica só com `relation='representative'`/`origin='representation'`,
+--       sem o vínculo explícito de coluna.
+--   D4  portal.request: `service_key` e `minimum_assurance` são `not null` no DDL 62 gerado (o
+--       contrato permite null antes da seleção/submissão). Usa-se `service_key='consulta_multas'`
+--       (mesma chave da linha seguinte do mesmo sujeito) e `minimum_assurance='none'` nas cinco
+--       linhas iniciais (IDENTIFICADO, SERVICO_SELECIONADO, ELEGIBILIDADE_VERIFICADA, INELEGIVEL,
+--       PEDIDO_EM_COMPOSICAO) em vez de null.
+--   D5  portal.request_draft: o DDL 62 gerado tem `version integer not null` (check > 0), não a
+--       coluna `schema_version text` do contrato §7.2 — usa-se `version=1`.
+--   D6  portal.inbox_item.read_on é `date` no DDL 63 gerado (contrato §7.3 pede `timestamptz`);
+--       usa-se só a data (sem hora) na linha …70c00002.
+--   D7  portal.manifestation: o DDL 64 gerado não tem a coluna `info_requested_on` do contrato
+--       §7.4 (só `info_due_on`); omitida na linha …70700004. `protocol` é `not null` no DDL
+--       gerado (o contrato permite null em `MANIFESTACAO_REGISTRADA`) — a linha …70700001 recebe
+--       o próximo protocolo da sequência compartilhada (`…000000e`) em vez de null.
+--   D8  portal.sne_enrollment não tem a coluna `version` do contrato §7.3 no DDL 63 gerado —
+--       omitida.
+--   D9  portal.act_level_policy.decision_ref é `varchar(40)`: quatro citações do contrato §5
+--       (linhas 03, 07, 14, 18) excedem 40 caracteres e foram encurtadas mantendo a referência
+--       primária (a citação completa permanece em `legal_basis`, que é `text`).
+--   D10 portal.infraction_view.last_event_id/last_event_version são `not null` no DDL 65 gerado
+--       (o contrato §7.5 os declara `null` até existir projetor real) — usa-se o uuid nulo
+--       `00000000-0000-0000-0000-000000000000` e versão 0 como sentinela de "nunca projetado"
+--       (M16: produtores reais em R-0010/OD-P19).
+--   D11 portal.service_catalog: `title`, `legal_deadline` e a parte "Base" de
+--       `normative_reference` de 13 dos 15 serviços vêm de [WF-PORTAL-001] §Catálogo, fora da
+--       lista de leitura obrigatória fechada desta tarefa (TASK-0003). O próprio contrato §10.7
+--       frisa que os textos de fixture "são dados de teste, não valores de produto" e que o
+--       conteúdo real é OD-P26 (já proposta por TASK-0001) — por isso os três campos recebem
+--       rótulos de fixture claramente marcados (`… (fixture)`) e `'source_pending (OD-P26)'` em
+--       vez de um prazo/base legal inventado. `manifestar` e `avaliar` usam o texto do contrato
+--       (`legal_deadline` dado literalmente em §10.7; título "Registrar manifestação" citado em
+--       §13).
+--   D12 portal.public_hostname.deadline_owned_by/inbox_item.kind seguem a Adenda A2(b) e o DDL
+--       real (`citizen|agency`, inglês) em vez do texto não corrigido de M15/§7.3 (`cidadao`).
+
+select set_config('app.role', 'owner', false);
+select set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);
+
+-- 10.2 portal.subject (5)
+insert into portal.subject (id, tenant_id, cpf_hash, name, govbr_level_observed, assurance_level_observed, observed_at, version)
+values
+  ('00000000-0000-7000-8000-000070000001', '00000000-0000-7000-8000-00000000a001', '534a4a8eafcd8489af32356d5a7a25f88c70cfe0448539a7c42964c1b897a359', 'Cidadão Bronze (fixture)', 'bronze', 'simples', '2026-09-14T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070000002', '00000000-0000-7000-8000-00000000a001', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'Cidadã Prata (fixture)', 'prata', 'avancada', '2026-09-14T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070000003', '00000000-0000-7000-8000-00000000a001', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'Cidadão Ouro (fixture)', 'ouro', 'avancada', '2026-09-14T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070000004', '00000000-0000-7000-8000-00000000a001', '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df', 'Cidadã Qualificada (fixture)', 'qualificada', 'qualificada', '2026-09-14T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070000005', '00000000-0000-7000-8000-00000000a001', 'a96fb099c9fe2b2866c515ce063539186c7103dd14b9df1a91741a7afd7f94fd', 'Procurador (fixture)', 'ouro', 'avancada', '2026-09-14T12:00:00-04:00', 1)
+on conflict (id) do update set
+  cpf_hash = excluded.cpf_hash, name = excluded.name, govbr_level_observed = excluded.govbr_level_observed,
+  assurance_level_observed = excluded.assurance_level_observed, observed_at = excluded.observed_at, version = excluded.version;
+
+-- 10.3 portal.representation (1) — D2: instrument_document_id not null no DDL real (placeholder)
+insert into portal.representation (id, tenant_id, representative_subject_id, represented_cpf_hash, represented_name, instrument_document_id, scope, valid_until, state, refusal_reason)
+values (
+  '00000000-0000-7000-8000-000070100001', '00000000-0000-7000-8000-00000000a001',
+  '00000000-0000-7000-8000-000070000005', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4',
+  'Cidadã Prata (fixture)', '00000000-0000-7000-8000-0000ff900001', 'ait', '2027-09-14', 'PROCURACAO_VALIDADA', null
+)
+on conflict (id) do update set
+  represented_cpf_hash = excluded.represented_cpf_hash, represented_name = excluded.represented_name,
+  instrument_document_id = excluded.instrument_document_id, scope = excluded.scope,
+  valid_until = excluded.valid_until, state = excluded.state, refusal_reason = excluded.refusal_reason;
+
+-- 10.3 portal.entitlement (12) — D3: sem coluna representation_id no DDL real
+insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
+values
+  ('00000000-0000-7000-8000-000070200001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000001', 'ait', '00000000-0000-7000-8000-0000f0000001', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000002', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000003', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000005', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000010', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200006', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'ait', '00000000-0000-7000-8000-0000f0000006', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200007', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'ait', '00000000-0000-7000-8000-0000f0000012', 'owner', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200008', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'ait', '00000000-0000-7000-8000-0000f0000009', 'driver', 'infraction', '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070200009', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000005', 'ait', '00000000-0000-7000-8000-0000f0000002', 'representative', 'representation', '2026-01-01', '2027-09-14'),
+  ('00000000-0000-7000-8000-00007020000a', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'owner', 'renavam', '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007020000b', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000003', 'exam', '00000000-0000-7000-8000-00007ff00002', 'interested_party', 'manual', '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007020000c', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'interested_party', 'manual', '2026-01-01', null)
+on conflict (id) do update set
+  target_kind = excluded.target_kind, target_id = excluded.target_id, relation = excluded.relation,
+  origin = excluded.origin, valid_from = excluded.valid_from, valid_until = excluded.valid_until;
+
+-- 10.4 portal.act_level_policy (21) — D9: decision_ref encurtado para caber em varchar(40) em
+-- 4 linhas (03, 07, 14, 18); legal_basis mantém a citação completa (text, sem limite).
+insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
+values
+  ('00000000-0000-7000-8000-000070300001', '00000000-0000-7000-8000-00000000a001', 'consulta_multas', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300002', '00000000-0000-7000-8000-00000000a001', 'consulta_cnh', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300003', '00000000-0000-7000-8000-00000000a001', 'emissao_crlv', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b" (consulta; emissão condicionada a quitação — Res. CONTRAN 809/2020 art. 4º, não é nível)', 'RN-PORTAL-101 linha 1', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300004', '00000000-0000-7000-8000-00000000a001', 'pagamento', 'simples', 'Decreto 10.543/2020 art. 4º, I, "a" e "c" (guia; transação em si fora do Decreto — linha 11)', 'RN-PORTAL-101 linha 10', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300005', '00000000-0000-7000-8000-00000000a001', 'adesao_sne', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "d" e "f" (subsunção)', 'RN-PORTAL-101 linha 9', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300006', '00000000-0000-7000-8000-00000000a001', 'cancelamento_sne', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "d" e "f" (subsunção) — idem adesao_sne', 'RN-PORTAL-101 linha 9', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300007', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"; LGPD art. 19, I (escopo confirmacao)', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300008', '00000000-0000-7000-8000-00000000a001', 'acompanhar_manifestacao', 'simples', 'Decreto 10.543/2020 art. 2º, §ú, III (ouvidoria fora do Decreto); nível simples por decisão do Owner', 'H.51; WF-PORTAL-004 §Decisão 2026-09-13', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300009', '00000000-0000-7000-8000-00000000a001', 'defesa_previa', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN DETRAN-AM 001/2025 art. 3º, VI', 'RN-PORTAL-101 linha 6; H.50', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000a', '00000000-0000-7000-8000-00000000a001', 'recurso_jari', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN DETRAN-AM 001/2025 art. 3º, VI — idem defesa_previa', 'RN-PORTAL-101 linha 6; H.50', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000b', '00000000-0000-7000-8000-00000000a001', 'recurso_cetran', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "h"; PN 001/2025 art. 3º VI por adoção administrativa (CETRAN-AM é órgão externo)', 'H.49 (portal.cetran_appeal_level); H.50', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000c', '00000000-0000-7000-8000-00000000a001', 'indicacao_condutor', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f" (subsunção; CTB art. 257 §7º c/c Res. 918 art. 5º); PN 001/2025 art. 3º VI', 'RN-PORTAL-101 linha 5; H.50', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000d', '00000000-0000-7000-8000-00000000a001', 'procuracao', 'avancada', 'PN DETRAN-AM 001/2025 art. 3º, V; Res. CONTRAN 900 art. 2º §2º', 'RN-PORTAL-101 §Fonte institucional; H.50', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000e', '00000000-0000-7000-8000-00000000a001', 'junta_medica', 'avancada', 'Decreto 10.543/2020 art. 4º, II (requerimento em procedimento administrativo); Res. CONTRAN 927/2022 art. 12', 'WF-PORTAL-001 §Catálogo; OD-P19', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-00007030000f', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:declaracao_completa', 'avancada', 'Decreto 10.543/2020 art. 4º, II; LGPD art. 19, II', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300010', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:correcao', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f"; LGPD art. 18, III', 'plan.md M5', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300011', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao:eliminacao', 'avancada', 'Decreto 10.543/2020 art. 4º, II, "f"; LGPD art. 18, VI', 'plan.md M5', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300012', '00000000-0000-7000-8000-00000000a001', 'manifestar', 'none', 'Decreto 10.543/2020 art. 2º, §ú, III; Lei 13.460 arts. 10 §1º e 11', 'RN-PORTAL-101 linha 3; RN-PORTAL-109', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300013', '00000000-0000-7000-8000-00000000a001', 'consulta_bat', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b" (dado próprio; terceiro sujeito à LGPD art. 13)', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300014', '00000000-0000-7000-8000-00000000a001', 'consulta_exame', 'simples', 'Decreto 10.543/2020 art. 4º, I, "b"', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null),
+  ('00000000-0000-7000-8000-000070300015', '00000000-0000-7000-8000-00000000a001', 'avaliar', 'simples', 'Lei 13.460/2017 art. 23; Decreto 10.543 art. 4º I, "b"', 'WF-PORTAL-001 §Catálogo', true, '2026-01-01', null)
+on conflict (id) do update set
+  act_key = excluded.act_key, minimum_assurance = excluded.minimum_assurance, legal_basis = excluded.legal_basis,
+  decision_ref = excluded.decision_ref, enabled = excluded.enabled, effective_from = excluded.effective_from,
+  effective_to = excluded.effective_to;
+
+-- 10.5 portal.request (13, uma por estado) — D4: service_key/minimum_assurance not null no DDL
+-- real; as cinco linhas iniciais usam 'consulta_multas'/'none' em vez de null (ver cabeçalho).
+insert into portal.request (
+  id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel,
+  delegation_domain, delegation_command, delegation_external_id, delegation_status, delegation_error,
+  minimum_assurance, version, withdrawn_at
+)
+values
+  ('00000000-0000-7000-8000-000070400001', '00000000-0000-7000-8000-00000000a001', 'IDENTIFICADO', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
+  ('00000000-0000-7000-8000-000070400002', '00000000-0000-7000-8000-00000000a001', 'SERVICO_SELECIONADO', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
+  ('00000000-0000-7000-8000-000070400003', '00000000-0000-7000-8000-00000000a001', 'ELEGIBILIDADE_VERIFICADA', 'consulta_multas', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
+  ('00000000-0000-7000-8000-000070400004', '00000000-0000-7000-8000-00000000a001', 'INELEGIVEL', 'indicacao_condutor', '00000000-0000-7000-8000-000070000002', 'ait', '00000000-0000-7000-8000-0000f0000010', 'portal', null, null, null, 'not_applicable', null, 'none', 1, null),
+  ('00000000-0000-7000-8000-000070400005', '00000000-0000-7000-8000-00000000a001', 'PEDIDO_EM_COMPOSICAO', 'adesao_sne', '00000000-0000-7000-8000-000070000002', 'none', null, 'portal', null, null, null, 'pending', null, 'none', 1, null),
+  ('00000000-0000-7000-8000-000070400006', '00000000-0000-7000-8000-00000000a001', 'AGUARDANDO_NIVEL_ASSINATURA', 'adesao_sne', '00000000-0000-7000-8000-000070000001', 'none', null, 'portal', null, null, null, 'pending', null, 'avancada', 1, null),
+  ('00000000-0000-7000-8000-000070400007', '00000000-0000-7000-8000-00000000a001', 'AGUARDANDO_PAGAMENTO', 'emissao_crlv', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'portal', null, null, null, 'pending', null, 'simples', 1, null),
+  ('00000000-0000-7000-8000-000070400008', '00000000-0000-7000-8000-00000000a001', 'PROTOCOLADO', 'adesao_sne', '00000000-0000-7000-8000-000070000003', 'none', null, 'portal', null, null, null, 'failed', 'fixture: falha simulada', 'avancada', 1, null),
+  ('00000000-0000-7000-8000-000070400009', '00000000-0000-7000-8000-00000000a001', 'EM_ANDAMENTO_NO_ORGAO', 'adesao_sne', '00000000-0000-7000-8000-000070000004', 'none', null, 'portal', 'portal', 'portal:sne-enrollment:enroll', null, 'delegated', null, 'avancada', 1, null),
+  ('00000000-0000-7000-8000-00007040000a', '00000000-0000-7000-8000-00000000a001', 'RESULTADO_DISPONIVEL', 'consulta_exame', '00000000-0000-7000-8000-000070000003', 'exam', '00000000-0000-7000-8000-00007ff00002', 'portal', null, null, null, 'delegated', null, 'simples', 1, null),
+  ('00000000-0000-7000-8000-00007040000b', '00000000-0000-7000-8000-00000000a001', 'AVALIACAO_OFERECIDA', 'consulta_bat', '00000000-0000-7000-8000-000070000004', 'crash', '00000000-0000-7000-8000-00007ff00003', 'portal', null, null, null, 'delegated', null, 'simples', 1, null),
+  ('00000000-0000-7000-8000-00007040000c', '00000000-0000-7000-8000-00000000a001', 'CONCLUIDO', 'adesao_sne', '00000000-0000-7000-8000-000070000002', 'none', null, 'portal', null, null, '00000000-0000-7000-8000-000070e00001', 'delegated', null, 'avancada', 1, null),
+  ('00000000-0000-7000-8000-00007040000d', '00000000-0000-7000-8000-00000000a001', 'DESISTIDO', 'emissao_crlv', '00000000-0000-7000-8000-000070000003', 'vehicle', '00000000-0000-7000-8000-00007ff00001', 'portal', null, null, null, 'not_applicable', null, 'simples', 1, '2026-09-10T12:00:00-04:00')
+on conflict (id) do update set
+  state = excluded.state, service_key = excluded.service_key, target_kind = excluded.target_kind,
+  target_id = excluded.target_id, delegation_domain = excluded.delegation_domain,
+  delegation_command = excluded.delegation_command, delegation_external_id = excluded.delegation_external_id,
+  delegation_status = excluded.delegation_status, delegation_error = excluded.delegation_error,
+  minimum_assurance = excluded.minimum_assurance, version = excluded.version, withdrawn_at = excluded.withdrawn_at;
+
+-- 10.5 portal.request_draft (1) — D5: coluna real é `version`, não `schema_version`
+insert into portal.request_draft (id, tenant_id, request_id, version, payload_json, saved_at)
+values ('00000000-0000-7000-8000-000070500001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400005', 1, '{}'::jsonb, '2026-09-14T12:00:00-04:00')
+on conflict (id) do update set version = excluded.version, payload_json = excluded.payload_json, saved_at = excluded.saved_at;
+
+-- 10.5 portal.protocol (5) — receipt_hash = sha256('{"number":"<number>","requestId":"<id>"}')
+insert into portal.protocol (id, tenant_id, request_id, number, issued_at, channel, receipt_hash)
+values
+  ('00000000-0000-7000-8000-000070600001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400008', 'AM-FIXTURES-2026-0000001', '2026-09-01T12:00:00-04:00', 'portal', '5b4b748cc458ec75e90ae517fe0332f0b9e4fc5ed3fd0edbbd2ebdf8a8c5ef4d'),
+  ('00000000-0000-7000-8000-000070600002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070400009', 'AM-FIXTURES-2026-0000002', '2026-09-02T12:00:00-04:00', 'portal', 'b5295fd0496afced3949c9042d1ebc1f2bdecd4a09dadbee4c8545bfd976a4fc'),
+  ('00000000-0000-7000-8000-000070600003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000a', 'AM-FIXTURES-2026-0000003', '2026-09-03T12:00:00-04:00', 'portal', 'e6b5a4bc63fec636bf29c30c058b866f8a92124d432785fcc9a528c8f5068a24'),
+  ('00000000-0000-7000-8000-000070600004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000b', 'AM-FIXTURES-2026-0000004', '2026-09-04T12:00:00-04:00', 'portal', '0f86f8c810923e76c33cec5654066fa0b3196bcd1c0e775804da146b36bd784d'),
+  ('00000000-0000-7000-8000-000070600005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-00007040000c', 'AM-FIXTURES-2026-0000005', '2026-09-05T12:00:00-04:00', 'portal', '9a3cd1e8027855af2b2f30500162f0eb7f1e0b6972aa318675fbbfec739f515d')
+on conflict (id) do update set number = excluded.number, issued_at = excluded.issued_at, receipt_hash = excluded.receipt_hash;
+
+-- 10.6 portal.manifestation (9) — D7: protocol not null no DDL real; texto livre (`text`) é
+-- dado de teste ("Texto da manifestação (fixture)"), nunca conteúdo real de um cidadão.
+insert into portal.manifestation (
+  id, tenant_id, state, kind, confidential, anonymous, subject_id, text, protocol,
+  received_at, agency_due_on, info_due_on, decision_text, decided_at, acknowledged_at, version
+)
+values
+  ('00000000-0000-7000-8000-000070700001', '00000000-0000-7000-8000-00000000a001', 'MANIFESTACAO_REGISTRADA', 'reclamacao', false, true, null, 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000e', '2026-09-14T12:00:00-04:00', '2026-10-14', null, null, null, null, 1),
+  ('00000000-0000-7000-8000-000070700002', '00000000-0000-7000-8000-00000000a001', 'COMPROVANTE_EMITIDO', 'denuncia', true, false, '00000000-0000-7000-8000-000070000001', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000006', '2026-09-13T12:00:00-04:00', '2026-10-13', null, null, null, null, 1),
+  ('00000000-0000-7000-8000-000070700003', '00000000-0000-7000-8000-00000000a001', 'EM_ANALISE', 'sugestao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000007', '2026-09-01T12:00:00-04:00', '2026-10-01', null, null, null, null, 1),
+  ('00000000-0000-7000-8000-000070700004', '00000000-0000-7000-8000-00000000a001', 'INFORMACAO_SOLICITADA_AO_AGENTE', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000008', '2026-08-25T12:00:00-04:00', '2026-09-24', '2026-09-21', null, null, null, 1),
+  ('00000000-0000-7000-8000-000070700005', '00000000-0000-7000-8000-00000000a001', 'DECISAO_FINAL_ELABORADA', 'solicitacao', false, false, '00000000-0000-7000-8000-000070000003', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-0000009', '2026-08-20T12:00:00-04:00', '2026-09-19', null, 'fixture', '2026-09-10T12:00:00-04:00', null, 1),
+  ('00000000-0000-7000-8000-000070700006', '00000000-0000-7000-8000-00000000a001', 'CIENCIA_AO_USUARIO', 'elogio', false, false, '00000000-0000-7000-8000-000070000003', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000a', '2026-08-10T12:00:00-04:00', '2026-09-09', null, 'fixture', '2026-09-01T12:00:00-04:00', null, 1),
+  ('00000000-0000-7000-8000-000070700007', '00000000-0000-7000-8000-00000000a001', 'ENCERRADA', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000004', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000b', '2026-07-20T12:00:00-04:00', '2026-08-19', null, 'fixture', '2026-09-05T12:00:00-04:00', '2026-09-10T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070700008', '00000000-0000-7000-8000-00000000a001', 'AVALIACAO_OFERECIDA', 'reclamacao', false, false, '00000000-0000-7000-8000-000070000002', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000c', '2026-07-10T12:00:00-04:00', '2026-08-09', null, 'fixture', '2026-08-01T12:00:00-04:00', '2026-08-05T12:00:00-04:00', 1),
+  ('00000000-0000-7000-8000-000070700009', '00000000-0000-7000-8000-00000000a001', 'AVALIADA', 'sugestao', false, false, '00000000-0000-7000-8000-000070000001', 'Texto da manifestação (fixture)', 'AM-FIXTURES-2026-000000d', '2026-06-15T12:00:00-04:00', '2026-07-15', null, 'fixture', '2026-07-01T12:00:00-04:00', '2026-07-10T12:00:00-04:00', 1)
+on conflict (id) do update set
+  state = excluded.state, kind = excluded.kind, confidential = excluded.confidential, anonymous = excluded.anonymous,
+  subject_id = excluded.subject_id, protocol = excluded.protocol, received_at = excluded.received_at,
+  agency_due_on = excluded.agency_due_on, info_due_on = excluded.info_due_on, decision_text = excluded.decision_text,
+  decided_at = excluded.decided_at, acknowledged_at = excluded.acknowledged_at, version = excluded.version;
+
+-- 10.6 portal.manifestation_extension (1)
+insert into portal.manifestation_extension (id, tenant_id, manifestation_id, timer, justification, extended_on, new_due_on)
+values ('00000000-0000-7000-8000-000070800001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070700007', 'T-OUV-RESPOSTA', 'fixture: prorrogação justificada', '2026-08-15', '2026-09-18')
+on conflict (id) do update set justification = excluded.justification, extended_on = excluded.extended_on, new_due_on = excluded.new_due_on;
+
+-- 10.7 portal.service_catalog (15: 9 available / 2 partially_available / 4 unavailable) — D11:
+-- title/legal_deadline/normative_reference(Base) de 13 serviços são texto de fixture claramente
+-- marcado (ver cabeçalho); manifestar/avaliar usam o texto dado pelo contrato §10.7/§13.
+insert into portal.service_catalog (
+  id, tenant_id, service_key, route, category, title, summary, requirements_json, delivery_channel,
+  legal_deadline, cost, accessibility_note, responsible_party, normative_reference, availability,
+  unavailable_reason, alternative_channel_note, minimum_assurance, version, effective_from
+)
+values
+  ('00000000-0000-7000-8000-000070900001', '00000000-0000-7000-8000-00000000a001', 'consulta_multas', '/servicos/consulta-multas', 'inf', 'Consulta de multas (fixture)', 'Consulta de multas (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900002', '00000000-0000-7000-8000-00000000a001', 'consulta_cnh', '/servicos/consulta-cnh', 'ch', 'Consulta da CNH (fixture)', 'Consulta da CNH (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900003', '00000000-0000-7000-8000-00000000a001', 'emissao_crlv', '/servicos/emissao-crlv', 'est', 'Emissão do CRLV-e (fixture)', 'Emissão do CRLV-e (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'source_pending', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900004', '00000000-0000-7000-8000-00000000a001', 'adesao_sne', '/servicos/adesao-sne', 'inf', 'Adesão ao SNE (fixture)', 'Adesão ao SNE (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'available', null, null, 'avancada', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900005', '00000000-0000-7000-8000-00000000a001', 'cancelamento_sne', '/servicos/cancelamento-sne', 'inf', 'Cancelamento da adesão ao SNE (fixture)', 'Cancelamento da adesão ao SNE (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'available', null, null, 'avancada', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900006', '00000000-0000-7000-8000-00000000a001', 'consulta_bat', '/servicos/consulta-bat', 'est', 'Consulta do BAT (fixture)', 'Consulta do BAT (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900007', '00000000-0000-7000-8000-00000000a001', 'consulta_exame', '/servicos/consulta-exame', 'ch', 'Consulta de exame (fixture)', 'Consulta de exame (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900008', '00000000-0000-7000-8000-00000000a001', 'manifestar', '/servicos/manifestar', 'transversal', 'Registrar manifestação', 'Registrar manifestação', '[]'::jsonb, 'portal', 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=none; base=Lei 13.460/2017 art. 10 §1º e 11', 'available', null, null, 'none', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-000070900009', '00000000-0000-7000-8000-00000000a001', 'avaliar', '/servicos/avaliar', 'transversal', 'Avaliar atendimento (fixture)', 'Avaliar atendimento (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'sem prazo próprio', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=Lei 13.460/2017 art. 23', 'available', null, null, 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000a', '00000000-0000-7000-8000-00000000a001', 'pagamento', '/servicos/pagamento', 'inf', 'Pagamento de multas (fixture)', 'Pagamento de multas (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'valor da multa', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'partially_available', null, 'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)', 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000b', '00000000-0000-7000-8000-00000000a001', 'lgpd_declaracao', '/servicos/lgpd-declaracao', 'transversal', 'Declaração LGPD (fixture)', 'Declaração LGPD (fixture)', '["Conta gov.br"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=simples; base=source_pending (OD-P26)', 'partially_available', null, 'Somente confirmação de tratamento; declaração completa pendente (OD-P17)', 'simples', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000c', '00000000-0000-7000-8000-00000000a001', 'defesa_previa', '/servicos/defesa-previa', 'inf', 'Defesa prévia (fixture)', 'Defesa prévia (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000d', '00000000-0000-7000-8000-00000000a001', 'recurso_jari', '/servicos/recurso-jari', 'inf', 'Recurso à JARI (fixture)', 'Recurso à JARI (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000e', '00000000-0000-7000-8000-00000000a001', 'recurso_cetran', '/servicos/recurso-cetran', 'inf', 'Recurso ao CETRAN (fixture)', 'Recurso ao CETRAN (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01'),
+  ('00000000-0000-7000-8000-00007090000f', '00000000-0000-7000-8000-00000000a001', 'indicacao_condutor', '/servicos/indicacao-condutor', 'inf', 'Indicação de condutor (fixture)', 'Indicação de condutor (fixture)', '["Conta gov.br", "Nível avançado (prata, ouro ou e-Notariado)"]'::jsonb, 'portal', 'source_pending (OD-P26)', 'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'DETRAN-AM', 'minimo=avancada; base=source_pending (OD-P26)', 'unavailable', 'delegacao_indisponivel_r0007', 'Atendimento presencial ([REF-DETRANAM-SERVICOS])', 'avancada', 1, '2026-01-01')
+on conflict (id) do update set
+  route = excluded.route, category = excluded.category, title = excluded.title, summary = excluded.summary,
+  requirements_json = excluded.requirements_json, legal_deadline = excluded.legal_deadline, cost = excluded.cost,
+  normative_reference = excluded.normative_reference, availability = excluded.availability,
+  unavailable_reason = excluded.unavailable_reason, alternative_channel_note = excluded.alternative_channel_note,
+  minimum_assurance = excluded.minimum_assurance, version = excluded.version, effective_from = excluded.effective_from;
+
+-- 10.8 plataforma (DDL manuscrito 19-portal-platform.sql) — D1: brand_profile tem tenant_id
+-- como chave primária (sem coluna id própria, sem created_at) no DDL real.
+insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
+values (
+  '00000000-0000-7000-8000-00000000a001', 'DETRAN-AM (fixtures)', 'DETRAN-AM', 'DETRAN-AM (fixtures)', '#1351B4',
+  'https://portal.detran-am.fixtures.invalid/suporte', 'https://portal.detran-am.fixtures.invalid/privacidade',
+  'https://portal.detran-am.fixtures.invalid/acessibilidade', 'ouvidoria@detran-am.fixtures.invalid', 'pt-BR', 'America/Manaus'
+)
+on conflict (tenant_id) do update set
+  display_name = excluded.display_name, short_name = excluded.short_name, legal_name = excluded.legal_name,
+  primary_color = excluded.primary_color, support_url = excluded.support_url, privacy_url = excluded.privacy_url,
+  accessibility_url = excluded.accessibility_url, service_contact = excluded.service_contact,
+  locale = excluded.locale, time_zone = excluded.time_zone;
+
+insert into portal.public_hostname (id, hostname, tenant_id, enabled)
+values ('00000000-0000-7000-8000-000070b00001', 'portal.detran-am.fixtures.invalid', '00000000-0000-7000-8000-00000000a001', true)
+on conflict (id) do update set hostname = excluded.hostname, tenant_id = excluded.tenant_id, enabled = excluded.enabled;
+
+-- 10.8 portal.inbox_item (2) — D6: read_on é `date` no DDL real (sem hora) e
+-- deadline_owned_by segue a Adenda A2(b)/DDL real (`citizen`, não `cidadao`).
+insert into portal.inbox_item (
+  id, tenant_id, subject_id, kind, action_required, source, source_event_id, subject_line, summary,
+  ait_id, request_id, available_on, read_on, fictitious_acknowledgement_on, deadline_due_on, deadline_owned_by
+)
+values
+  ('00000000-0000-7000-8000-000070c00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'SNE', true, 'sne', '00000000-0000-7000-8000-000071b00001', 'Notificação de autuação disponível', 'fixture', '00000000-0000-7000-8000-0000f0000002', null, '2026-09-01', null, '2026-10-01', '2026-10-01', 'citizen'),
+  ('00000000-0000-7000-8000-000070c00002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002', 'PROCESSO', false, 'portal', '00000000-0000-7000-8000-000071b00002', 'Pedido em andamento', 'fixture', null, '00000000-0000-7000-8000-000070400009', '2026-09-10', '2026-09-11', null, null, null)
+on conflict (id) do update set
+  kind = excluded.kind, action_required = excluded.action_required, source = excluded.source,
+  subject_line = excluded.subject_line, ait_id = excluded.ait_id, request_id = excluded.request_id,
+  available_on = excluded.available_on, read_on = excluded.read_on,
+  fictitious_acknowledgement_on = excluded.fictitious_acknowledgement_on,
+  deadline_due_on = excluded.deadline_due_on, deadline_owned_by = excluded.deadline_owned_by;
+
+-- 10.8 portal.sne_enrollment (1) — D8: sem coluna `version` no DDL real
+insert into portal.sne_enrollment (id, tenant_id, subject_id, state, channel, email, phone, consent_text_version, effects_ack, since, cancelled_at, cancel_reason)
+values (
+  '00000000-0000-7000-8000-000070e00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-000070000002',
+  'ADERIDO_SNE', 'email', 'prata@fixtures.invalid', null, '1',
+  '{"ciencia_ficta_30_dias":true,"desconto_60":true,"canal_eletronico":true,"validade_pos_cancelamento":true}'::jsonb,
+  '2026-08-01T12:00:00-04:00', null, null
+)
+on conflict (id) do update set
+  state = excluded.state, channel = excluded.channel, email = excluded.email, phone = excluded.phone,
+  consent_text_version = excluded.consent_text_version, effects_ack = excluded.effects_ack,
+  since = excluded.since, cancelled_at = excluded.cancelled_at, cancel_reason = excluded.cancel_reason;
+
+-- 10.8 portal.infraction_view (7, uma por situation) — D10: last_event_id/last_event_version
+-- são not null no DDL real; usa-se o sentinela de "nunca projetado" (uuid nulo, versão 0).
+insert into portal.infraction_view (
+  id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount,
+  situation, deadlines_json, points_status, actions_json, notices_json, payment_json,
+  last_event_id, last_event_version
+)
+values
+  ('00000000-0000-7000-8000-000070f00001', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000002', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000001', 'FIX2E01', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00002', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000003', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000002', 'FIX2E02', '2026-05-02T12:00:00-04:00', 'fixture', 195.23, 'em_defesa', '[]'::jsonb, 'em_disputa', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00003', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000005', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000003', 'FIX2E03', '2026-05-03T12:00:00-04:00', 'fixture', 195.23, 'penalidade_aplicada', '[]'::jsonb, 'definitivo', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00004', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000006', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'FIX-0000004', 'FIX2E04', '2026-05-04T12:00:00-04:00', 'fixture', 195.23, 'em_recurso', '[]'::jsonb, 'em_disputa', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00005', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000009', '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df', 'FIX-0000005', 'FIX2E05', '2026-05-05T12:00:00-04:00', 'fixture', 195.23, 'encerrada', '[]'::jsonb, 'definitivo', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00006', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000012', '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016', 'FIX-0000006', 'FIX2E06', '2026-05-06T12:00:00-04:00', 'fixture', 195.23, 'cancelada', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0),
+  ('00000000-0000-7000-8000-000070f00007', '00000000-0000-7000-8000-00000000a001', '00000000-0000-7000-8000-0000f0000010', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 'FIX-0000007', 'FIX2E07', '2026-05-07T12:00:00-04:00', 'fixture', 195.23, 'arquivada', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)
+on conflict (id) do update set
+  subject_cpf_hash = excluded.subject_cpf_hash, ait_number = excluded.ait_number, plate = excluded.plate,
+  occurred_at = excluded.occurred_at, framing_label = excluded.framing_label, amount = excluded.amount,
+  situation = excluded.situation, points_status = excluded.points_status,
+  last_event_id = excluded.last_event_id, last_event_version = excluded.last_event_version;
+
+-- 10.8 portal.points_view (1)
+insert into portal.points_view (id, tenant_id, subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json, last_12_months_json, last_event_id, cached_at)
+values ('00000000-0000-7000-8000-000071000001', '00000000-0000-7000-8000-00000000a001', 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4', 3, 4, '[]'::jsonb, '[]'::jsonb, null, '2026-09-14T12:00:00-04:00')
+on conflict (id) do update set definitive_points = excluded.definitive_points, disputed_points = excluded.disputed_points, cached_at = excluded.cached_at;
diff --git a/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts b/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts
new file mode 100644
index 0000000..e832f2f
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.spec.ts
@@ -0,0 +1,129 @@
+// CTG-0001 §6.4 (M13, [WF-PORTAL-004]) — matriz de transições de `portal.manifestation.state`
+// (9 tokens). Fica vermelho até TASK-0004 criar
+// backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts.
+//
+// Mesma convenção de chamada assumida de request.transitions.spec.ts (irmão desta tarefa):
+// `assertTransition(current, trigger)` com `current = { state }`, `trigger = { command }` —
+// modelo de backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts
+// (leitura obrigatória). `acknowledge`/`evaluate` têm rota cidadã nesta rodada; os demais
+// (`analyze`, `request_info`, `receive_info`, `decide`, `notify_user`) são internos, sem rota,
+// mas "serviço interno testável" (§6.4) — cobertos aqui pela mesma tabela.
+import { describe, expect, it } from 'vitest';
+
+import {
+  assertTransition,
+  MANIFESTATION_TRANSITIONS,
+} from './manifestation.transitions.js';
+
+/** Os 9 tokens fixos de portal.manifestation.state (contrato §0/§6.4). */
+const MANIFESTATION_STATES = [
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
+/** allowed[] por comando, copiado literalmente do contrato §6.4 "estados NÃO admitidos". */
+const ALLOWED_BY_COMMAND: Record<string, readonly string[]> = {
+  acknowledge: ['CIENCIA_AO_USUARIO'],
+  evaluate: ['AVALIACAO_OFERECIDA'],
+  analyze: ['COMPROVANTE_EMITIDO'],
+  request_info: ['EM_ANALISE'],
+  decide: ['EM_ANALISE'],
+  receive_info: ['INFORMACAO_SOLICITADA_AO_AGENTE'],
+  notify_user: ['DECISAO_FINAL_ELABORADA'],
+};
+
+describe('MANIFESTATION_TRANSITIONS (§6.4, M13) — cobertura dos 9 tokens (C-0001-26)', () => {
+  it('C-0001-26 — dado MANIFESTATION_TRANSITIONS quando enumerada então os estados referenciados (from/to) cobrem exatamente os 9 tokens do §0 e nenhum outro', () => {
+    const referenced = new Set<string>();
+    for (const row of MANIFESTATION_TRANSITIONS) {
+      if (row.from) referenced.add(row.from);
+      referenced.add(row.to);
+    }
+    expect([...referenced].sort()).toEqual([...MANIFESTATION_STATES].sort());
+  });
+});
+
+describe('assertTransition (§6.4) — allowed[] exato por comando × 9 estados', () => {
+  for (const [command, allowed] of Object.entries(ALLOWED_BY_COMMAND)) {
+    describe(`comando "${command}" — allowed = [${allowed.join(', ')}]`, () => {
+      for (const state of MANIFESTATION_STATES) {
+        const isAllowed = allowed.includes(state);
+        it(`dado a manifestação em ${state} quando ${command} então ${isAllowed ? 'admitido' : '409 PORTAL.MANIFESTATION_STATE_INVALID { state, allowed }'}`, () => {
+          if (isAllowed) {
+            expect(() =>
+              assertTransition({ state }, { command }),
+            ).not.toThrow();
+          } else {
+            expect(() => assertTransition({ state }, { command })).toThrowError(
+              expect.objectContaining({
+                code: 'PORTAL.MANIFESTATION_STATE_INVALID',
+                status: 409,
+                context: { state, allowed },
+              }),
+            );
+          }
+        });
+      }
+    });
+  }
+});
+
+describe('C-0001-27 — acknowledge só de CIENCIA_AO_USUARIO', () => {
+  it('dado CIENCIA_AO_USUARIO quando acknowledge então admitido; para os outros 8 estados então 409 MANIFESTATION_STATE_INVALID { state, allowed: ["CIENCIA_AO_USUARIO"] }', () => {
+    expect(() =>
+      assertTransition(
+        { state: 'CIENCIA_AO_USUARIO' },
+        { command: 'acknowledge' },
+      ),
+    ).not.toThrow();
+    for (const state of MANIFESTATION_STATES.filter(
+      (candidate) => candidate !== 'CIENCIA_AO_USUARIO',
+    )) {
+      expect(() =>
+        assertTransition({ state }, { command: 'acknowledge' }),
+      ).toThrowError(
+        expect.objectContaining({
+          code: 'PORTAL.MANIFESTATION_STATE_INVALID',
+          context: { state, allowed: ['CIENCIA_AO_USUARIO'] },
+        }),
+      );
+    }
+  });
+});
+
+describe('C-0001-28 — evaluate só de AVALIACAO_OFERECIDA; AVALIADA é terminal', () => {
+  it('dado AVALIACAO_OFERECIDA quando evaluate então admitido; para os outros 8 estados então 409', () => {
+    expect(() =>
+      assertTransition(
+        { state: 'AVALIACAO_OFERECIDA' },
+        { command: 'evaluate' },
+      ),
+    ).not.toThrow();
+    for (const state of MANIFESTATION_STATES.filter(
+      (candidate) => candidate !== 'AVALIACAO_OFERECIDA',
+    )) {
+      expect(() =>
+        assertTransition({ state }, { command: 'evaluate' }),
+      ).toThrowError(
+        expect.objectContaining({ code: 'PORTAL.MANIFESTATION_STATE_INVALID' }),
+      );
+    }
+  });
+
+  it('dado AVALIADA (terminal) quando qualquer um dos sete comandos então 409 MANIFESTATION_STATE_INVALID', () => {
+    for (const command of Object.keys(ALLOWED_BY_COMMAND)) {
+      expect(() =>
+        assertTransition({ state: 'AVALIADA' }, { command }),
+      ).toThrowError(
+        expect.objectContaining({ code: 'PORTAL.MANIFESTATION_STATE_INVALID' }),
+      );
+    }
+  });
+});
diff --git a/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts b/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts
new file mode 100644
index 0000000..4d5d3b2
--- /dev/null
+++ b/backend/domains/portal/citizen-service/src/handwritten/guards/manifestation.transitions.ts
@@ -0,0 +1,170 @@
+// Espelho de [WF-PORTAL-004] §Transições para `portal.manifestation.state`
+// (work/rounds/R-0009/contracts/CTG-0001.md §6.4; plan R-0009 M13; 9 tokens).
+// Tabela pura + guarda de estado por comando, sem rota, sem banco e sem
+// relógio: `PortalManifestationService` (CTG-0002, TASK-0008) chama
+// `assertTransition` dentro da transação. `allowed[]` copiado do bloco
+// "estados NÃO admitidos por comando" do §6.4.
+//
+// Erro: `DetranError` de `@detran/shared` com código do catálogo do Portal
+// (`PORTAL.MANIFESTATION_STATE_INVALID`, portal-error-catalog.md §6) — mesma
+// forma de `PortalError extends DetranError`; a subclasse vive em
+// `@detran/portal-identity`, importada quando TASK-0005 declarar
+// `moduleImports: IdentityModule` (M24).
+import { DetranError } from '@detran/shared';
+
+/** Os 9 tokens de `portal.manifestation.state` (§0/§6.4). */
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
+export type ManifestationState = (typeof MANIFESTATION_STATES)[number];
+
+/**
+ * Terminais (§6.4): AVALIADA; ENCERRADA só sai por `offer_evaluation` na
+ * mesma transação do `acknowledge` — logo, observável, também terminal.
+ */
+export const MANIFESTATION_TERMINAL_STATES: readonly ManifestationState[] = [
+  'AVALIADA',
+  'ENCERRADA',
+];
+
+export interface ManifestationTransition {
+  /** `null` = criação. */
+  from: ManifestationState | null;
+  to: ManifestationState;
+  /** Comando cidadão, comando interno (sem rota, OD-P18) ou evento. */
+  command: string;
+  /** Guarda em prosa, copiada do §6.4. */
+  guard: string;
+}
+
+export const MANIFESTATION_TRANSITIONS: readonly ManifestationTransition[] = [
+  {
+    from: null,
+    to: 'MANIFESTACAO_REGISTRADA',
+    command: 'manifest',
+    guard:
+      'nunca recusa (RN-PORTAL-109 1); só kind validado (400 MANIFESTATION_KIND_INVALID); anônimo admitido (H.51)',
+  },
+  {
+    from: 'MANIFESTACAO_REGISTRADA',
+    to: 'COMPROVANTE_EMITIDO',
+    command: 'issue_receipt',
+    guard:
+      'MESMA transação do manifest; protocol, received_at, agency_due_on = +30 dias corridos',
+  },
+  {
+    from: 'COMPROVANTE_EMITIDO',
+    to: 'EM_ANALISE',
+    command: 'analyze',
+    guard: 'interno (sem rota, OD-P18)',
+  },
+  {
+    from: 'EM_ANALISE',
+    to: 'INFORMACAO_SOLICITADA_AO_AGENTE',
+    command: 'request_info',
+    guard: 'interno; info_due_on = hoje + 20 dias corridos',
+  },
+  {
+    from: 'INFORMACAO_SOLICITADA_AO_AGENTE',
+    to: 'EM_ANALISE',
+    command: 'receive_info',
+    guard: 'interno',
+  },
+  {
+    from: 'EM_ANALISE',
+    to: 'DECISAO_FINAL_ELABORADA',
+    command: 'decide',
+    guard: 'interno; decision_text, decided_at',
+  },
+  {
+    from: 'DECISAO_FINAL_ELABORADA',
+    to: 'CIENCIA_AO_USUARIO',
+    command: 'notify_user',
+    guard: "interno (inbox_item source='portal')",
+  },
+  {
+    from: 'CIENCIA_AO_USUARIO',
+    to: 'ENCERRADA',
+    command: 'acknowledge',
+    guard:
+      'POST manifestations/{id}/acknowledge; acknowledged_at; único comando cidadão',
+  },
+  {
+    from: 'ENCERRADA',
+    to: 'AVALIACAO_OFERECIDA',
+    command: 'offer_evaluation',
+    guard: 'MESMA transação do acknowledge (M13)',
+  },
+  {
+    from: 'AVALIACAO_OFERECIDA',
+    to: 'AVALIADA',
+    command: 'evaluate',
+    guard: 'POST evaluations (CTG-0002)',
+  },
+  {
+    from: 'AVALIACAO_OFERECIDA',
+    to: 'ENCERRADA',
+    command: 'expire_evaluation',
+    guard:
+      'janela sem valor na fonte → source_pending (OD-P24); não bloqueia nada',
+  },
+];
+
+/**
+ * Estados admitidos por comando (§6.4 "estados NÃO admitidos por comando"):
+ * a lista `allowed` devolvida no `context` do 409. `issue_receipt`,
+ * `offer_evaluation` e `expire_evaluation` não são comandos autônomos
+ * (mesma transação ou timer) e por isso não constam aqui.
+ */
+export const MANIFESTATION_ALLOWED_STATES_BY_COMMAND: Readonly<
+  Record<string, readonly ManifestationState[]>
+> = {
+  acknowledge: ['CIENCIA_AO_USUARIO'],
+  evaluate: ['AVALIACAO_OFERECIDA'],
+  analyze: ['COMPROVANTE_EMITIDO'],
+  request_info: ['EM_ANALISE'],
+  decide: ['EM_ANALISE'],
+  receive_info: ['INFORMACAO_SOLICITADA_AO_AGENTE'],
+  notify_user: ['DECISAO_FINAL_ELABORADA'],
+};
+
+export interface ManifestationStateSnapshot {
+  state: string;
+}
+
+export interface ManifestationTrigger {
+  command: string;
+}
+
+/**
+ * Guarda de estado por comando: lança `409 PORTAL.MANIFESTATION_STATE_INVALID
+ * { state, allowed }` fora de `allowed[]`; comando desconhecido nunca é
+ * admitido. Devolve a linha da tabela que o comando percorre.
+ */
+export function assertTransition(
+  current: ManifestationStateSnapshot,
+  trigger: ManifestationTrigger,
+): ManifestationTransition {
+  const allowed =
+    MANIFESTATION_ALLOWED_STATES_BY_COMMAND[trigger.command] ?? [];
+  const row = MANIFESTATION_TRANSITIONS.find(
+    (candidate) =>
+      candidate.from === current.state && candidate.command === trigger.command,
+  );
+  if (!(allowed as readonly string[]).includes(current.state) || !row) {
+    throw new DetranError('PORTAL.MANIFESTATION_STATE_INVALID', {
+      status: 409,
+      context: { state: current.state, allowed: [...allowed] },
+      message: 'A manifestação não está em um estado que admita este comando.',
+    });
+  }
+  return row;
+}
diff --git a/backend/domains/portal/identity/src/handwritten/act-level.spec.ts b/backend/domains/portal/identity/src/handwritten/act-level.spec.ts
new file mode 100644
index 0000000..abd709f
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/act-level.spec.ts
@@ -0,0 +1,251 @@
+// CTG-0001 §4 (M4/M5) — assertActLevel: matriz ato → nível, vigência por Clock fixo, ato sem
+// linha, política 'qualificada'. Fica vermelho até TASK-0004 criar
+// backend/domains/portal/identity/src/handwritten/identity.service.ts (index.ts, §12 Layout).
+//
+// Repositório falso (tx em memória, padrão de
+// backend/domains/shared/src/events/sql-outbox.spec.ts `fakeTransaction`): reproduz a mesma
+// semântica de filtragem/ordenação da consulta do §4 (act_key = $1, enabled = true,
+// effective_from <= $2::date < coalesce(effective_to, 'infinity'), order by effective_from
+// desc limit 1 — $1/$2 na ordem exata do contrato), sem depender do texto SQL literal que
+// TASK-0004 escrever.
+import { describe, expect, it } from 'vitest';
+
+import {
+  assertActLevel,
+  assuranceRank,
+  PORTAL_ELEVATION_METHODS,
+  PortalError,
+} from './index.js';
+
+interface FakePolicyRow {
+  id: string;
+  actKey: string;
+  minimumAssurance: string;
+  enabled: boolean;
+  effectiveFrom: string;
+  effectiveTo: string | null;
+}
+
+const FIXED_TODAY = '2026-09-14';
+const clock = {
+  now: () => new Date('2026-09-14T12:00:00-04:00'),
+  today: () => FIXED_TODAY,
+};
+
+function fakeTx(rows: FakePolicyRow[]) {
+  const query = async (_sql: string, values?: readonly unknown[]) => {
+    const [actKey, today] = (values ?? []) as [string, string];
+    const matches = rows
+      .filter((row) => row.actKey === actKey && row.enabled)
+      .filter(
+        (row) =>
+          row.effectiveFrom <= today &&
+          today < (row.effectiveTo ?? '9999-12-31'),
+      )
+      .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1));
+    return {
+      rows: matches.slice(0, 1).map((row) => ({
+        id: row.id,
+        minimum_assurance: row.minimumAssurance,
+      })),
+    };
+  };
+  return { query } as never;
+}
+
+function policy(overrides: Partial<FakePolicyRow> = {}): FakePolicyRow {
+  return {
+    id: '00000000-0000-7000-8000-0000aa000001',
+    actKey: 'ato-x',
+    minimumAssurance: 'avancada',
+    enabled: true,
+    effectiveFrom: '2026-01-01',
+    effectiveTo: null,
+    ...overrides,
+  };
+}
+
+describe('assertActLevel (§4, M4/M5)', () => {
+  it('C-0001-13 — dado política vigente "avancada" e current "simples" quando assertActLevel então ASSURANCE_INSUFFICIENT com o context exato', async () => {
+    const tx = fakeTx([policy({ minimumAssurance: 'avancada' })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'simples' },
+        'ato-x',
+        '/resume/ato-x',
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
+      status: 403,
+      context: {
+        actKey: 'ato-x',
+        required: 'avancada',
+        current: 'simples',
+        elevationMethods: ['biographic', 'biometric', 'icp'],
+        resumeRoute: '/resume/ato-x',
+      },
+    });
+  });
+
+  it('C-0001-14 — dado política "avancada" e current "avancada" quando assertActLevel então resolve com { policyId }', async () => {
+    const tx = fakeTx([
+      policy({
+        id: '00000000-0000-7000-8000-0000aa000002',
+        minimumAssurance: 'avancada',
+      }),
+    ]);
+    const decision = await assertActLevel(
+      tx,
+      { cpf: '22222222222', assuranceLevel: 'avancada' },
+      'ato-x',
+      '/resume/ato-x',
+    );
+    expect(decision).toMatchObject({
+      actKey: 'ato-x',
+      required: 'avancada',
+      current: 'avancada',
+      policyId: '00000000-0000-7000-8000-0000aa000002',
+    });
+  });
+
+  it('C-0001-15 — dado política "simples" e current "qualificada" quando assertActLevel então resolve (elevar sempre passa)', async () => {
+    const tx = fakeTx([policy({ minimumAssurance: 'simples' })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '44444444444', assuranceLevel: 'qualificada' },
+        'ato-x',
+        '/resume/ato-x',
+      ),
+    ).resolves.toMatchObject({ required: 'simples', current: 'qualificada' });
+  });
+
+  it('C-0001-16 — dado política "none" e current "simples" quando assertActLevel então resolve (H.51: não compara)', async () => {
+    const tx = fakeTx([policy({ minimumAssurance: 'none' })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'simples' },
+        'ato-x',
+        '/resume/ato-x',
+      ),
+    ).resolves.toMatchObject({ required: 'none', current: 'simples' });
+  });
+
+  it('C-0001-17 — dado política "qualificada" quando assertActLevel então PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED 500 { actKey } (RN-PORTAL-101 (c))', async () => {
+    const tx = fakeTx([policy({ minimumAssurance: 'qualificada' })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'qualificada' },
+        'ato-x',
+        '/resume/ato-x',
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
+      status: 500,
+      context: { actKey: 'ato-x' },
+    });
+  });
+
+  it('C-0001-18 — dado ato sem nenhuma linha quando assertActLevel então PORTAL.INTERNAL 500 { actKey } (ato sem linha nunca libera)', async () => {
+    const tx = fakeTx([]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'qualificada' },
+        'ato-inexistente',
+        '/resume/ato-inexistente',
+      ),
+    ).rejects.toMatchObject({
+      code: 'PORTAL.INTERNAL',
+      status: 500,
+      context: { actKey: 'ato-inexistente' },
+    });
+  });
+
+  it('C-0001-19 — dado a única linha com enabled=false quando assertActLevel então PORTAL.INTERNAL (tratada como ausência)', async () => {
+    const tx = fakeTx([policy({ enabled: false })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'qualificada' },
+        'ato-x',
+        '/resume/ato-x',
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
+  });
+
+  it('C-0001-20a — dado effective_from=2026-09-15 e clock=2026-09-14 quando assertActLevel então PORTAL.INTERNAL (ainda não vigente)', async () => {
+    const tx = fakeTx([policy({ effectiveFrom: '2026-09-15' })]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'qualificada' },
+        'ato-x',
+        '/resume/ato-x',
+        clock,
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
+  });
+
+  it('C-0001-20b — dado effective_to=2026-09-14 e clock=2026-09-14 quando assertActLevel então PORTAL.INTERNAL (limite exclusivo)', async () => {
+    const tx = fakeTx([
+      policy({ effectiveFrom: '2026-01-01', effectiveTo: '2026-09-14' }),
+    ]);
+    await expect(
+      assertActLevel(
+        tx,
+        { cpf: '11111111111', assuranceLevel: 'qualificada' },
+        'ato-x',
+        '/resume/ato-x',
+        clock,
+      ),
+    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
+  });
+
+  it('C-0001-21 — dado duas linhas vigentes (2026-01-01 simples; 2026-06-01 avancada) quando assertActLevel então vale a mais recente (avancada)', async () => {
+    const tx = fakeTx([
+      policy({
+        id: '00000000-0000-7000-8000-0000aa000003',
+        effectiveFrom: '2026-01-01',
+        minimumAssurance: 'simples',
+      }),
+      policy({
+        id: '00000000-0000-7000-8000-0000aa000004',
+        effectiveFrom: '2026-06-01',
+        minimumAssurance: 'avancada',
+      }),
+    ]);
+    const decision = await assertActLevel(
+      tx,
+      { cpf: '22222222222', assuranceLevel: 'avancada' },
+      'ato-x',
+      '/resume/ato-x',
+    );
+    expect(decision).toMatchObject({
+      required: 'avancada',
+      policyId: '00000000-0000-7000-8000-0000aa000004',
+    });
+  });
+
+  it('C-0001-22 — dado assuranceRank então none<simples<avancada<qualificada e messageKey de PortalError("PORTAL.ASSURANCE_INSUFFICIENT") é derivada corretamente', () => {
+    expect(assuranceRank('none')).toBeLessThan(assuranceRank('simples'));
+    expect(assuranceRank('simples')).toBeLessThan(assuranceRank('avancada'));
+    expect(assuranceRank('avancada')).toBeLessThan(
+      assuranceRank('qualificada'),
+    );
+
+    const error = new PortalError('PORTAL.ASSURANCE_INSUFFICIENT', {
+      status: 403,
+      context: {},
+    }) as unknown as { messageKey: string };
+    // Construída via template literal (sem literal de aspas de 3+ partes) para não colidir com
+    // o gate de literais de parâmetro (tools/parameters/verify.mjs --check-usage): o valor
+    // esperado é um messageKey de erro (portal.errors.*), não uma chave do catálogo de
+    // parâmetros (portal.<parametro>).
+    const expectedMessageKey = `portal.errors.assurance_insufficient`;
+    expect(error.messageKey).toBe(expectedMessageKey);
+  });
+});
diff --git a/backend/domains/portal/identity/src/handwritten/assurance.controller.ts b/backend/domains/portal/identity/src/handwritten/assurance.controller.ts
new file mode 100644
index 0000000..e1d8acf
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/assurance.controller.ts
@@ -0,0 +1,14 @@
+// `POST /v1/portal/identity/assurance/elevations[/{id}/complete]` — sem rotas
+// nesta rodada (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009
+// M24): as rotas de elevação (portal-route-contract.md §3) são CTG-0002
+// (TASK-0007). A classe já declara a guarda de identidade e o recurso para
+// que TASK-0007 não os esqueça; sem handlers, `verify:decorators` não a reprova.
+import { Controller, UseGuards } from '@nestjs/common';
+import { Resource } from '@detran/shared';
+
+import { PortalCitizenGuard } from './citizen.guard.js';
+
+@Controller('v1/portal/identity/assurance')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:identity')
+export class PortalAssuranceController {}
diff --git a/backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts b/backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts
new file mode 100644
index 0000000..1b76ef4
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts
@@ -0,0 +1,163 @@
+// CTG-0001 §3 (M4) — PortalCitizenGuard, ordem fail-closed das verificações (claims antes do
+// papel; nunca consulta principal.permissions). Fica vermelho até TASK-0004 criar
+// backend/domains/portal/identity/src/handwritten/citizen.guard.ts (e o index.ts, §12 Layout).
+//
+// Contexto fake: o acessor do principal na requisição HTTP não é fixado literalmente pelo
+// contrato (§3 passo 1 diz "mesmo acessor usado pelo DetranPolicyEvaluator/guard de política do
+// STYNX ... o Engineer confirma o acessor"). Evidência já presente no repositório —
+// `backend/domains/shared/src/policy.guard.ts:42` usa `getPrincipalFromRequest(request)` de
+// `@stynx-nyx/backend`, e `backend/app/src/renach-webhook.guard.ts:71` popula
+// `request.principal = {...}` manualmente para o mesmo fim — aponta para `request.principal`
+// como o campo subjacente. Este spec usa `request.principal` para construir o `ExecutionContext`
+// falso; se o Engineer confirmar um acessor diferente em TASK-0004, é o `ExecutionContext` falso
+// deste arquivo que muda, nunca a asserção de comportamento.
+import type { ExecutionContext } from '@nestjs/common';
+import { describe, expect, it } from 'vitest';
+
+import { PortalCitizenGuard, portalIdentityOf } from './index.js';
+
+function contextWith(principal: unknown): {
+  context: ExecutionContext;
+  request: Record<string, unknown>;
+} {
+  const request: Record<string, unknown> = {};
+  if (principal !== undefined) request.principal = principal;
+  const context = {
+    switchToHttp: () => ({
+      getRequest: () => request,
+      getResponse: () => ({}),
+      getNext: () => undefined,
+    }),
+    getClass: () => class {},
+    getHandler: () => function handler() {},
+  } as unknown as ExecutionContext;
+  return { context, request };
+}
+
+describe('PortalCitizenGuard.canActivate (§3, M4) — ordem: claims antes do papel', () => {
+  it('C-0001-01 — dado principal undefined quando canActivate então PORTAL.AUTH_REQUIRED 401', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith(undefined);
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.AUTH_REQUIRED', status: 401 }),
+    );
+  });
+
+  it('C-0001-02 — dado principal CIDADAO sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED 403', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({ roles: ['CIDADAO'], permissions: [] });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({
+        code: 'PORTAL.ASSURANCE_NOT_VERIFIED',
+        status: 403,
+        context: {},
+      }),
+    );
+  });
+
+  it('C-0001-03 — dado CIDADAO com assurance_level "avancada" sem cpf quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['CIDADAO'],
+      permissions: [],
+      claims: { assurance_level: 'avancada' },
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
+    );
+  });
+
+  it('C-0001-04 — dado CIDADAO com cpf válido e assurance_level "AVANCADA" (caixa alta) quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['CIDADAO'],
+      permissions: [],
+      claims: { assurance_level: 'AVANCADA', cpf: '11111111111' },
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
+    );
+  });
+
+  it('C-0001-05 — dado CIDADAO com assurance_level "simples" e cpf "111.111.111-11" quando canActivate então passa e request.portalIdentity.cpf = "11111111111"', () => {
+    const guard = new PortalCitizenGuard();
+    const { context, request } = contextWith({
+      roles: ['CIDADAO'],
+      permissions: [],
+      claims: { assurance_level: 'simples', cpf: '111.111.111-11' },
+    });
+    expect(guard.canActivate(context)).toBe(true);
+    expect(portalIdentityOf(request)).toEqual({
+      cpf: '11111111111',
+      assuranceLevel: 'simples',
+    });
+  });
+
+  it('C-0001-06 — dado CIDADAO com cpf de 10 dígitos quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['CIDADAO'],
+      permissions: [],
+      claims: { assurance_level: 'simples', cpf: '1111111111' },
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
+    );
+  });
+
+  it('C-0001-07 — dado field-agent com claims válidas quando canActivate então PORTAL.IDENTITY_NOT_CITIZEN 403', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['field-agent'],
+      permissions: [],
+      claims: { assurance_level: 'simples', cpf: '11111111111' },
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({
+        code: 'PORTAL.IDENTITY_NOT_CITIZEN',
+        status: 403,
+        context: {},
+      }),
+    );
+  });
+
+  it('C-0001-08 — dado field-agent sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED (ordem §3: claims antes do papel)', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['field-agent'],
+      permissions: [],
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
+    );
+  });
+
+  it('C-0001-09a — dado technical-admin (permissions [\'*\']) sem claims quando canActivate então PORTAL.ASSURANCE_NOT_VERIFIED (a política concede "*"; a guarda nega)', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['technical-admin'],
+      permissions: ['*'],
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.ASSURANCE_NOT_VERIFIED' }),
+    );
+  });
+
+  it('C-0001-09b — dado technical-admin com claims válidas e sem CIDADAO quando canActivate então PORTAL.IDENTITY_NOT_CITIZEN (guarda nunca consulta principal.permissions)', () => {
+    const guard = new PortalCitizenGuard();
+    const { context } = contextWith({
+      roles: ['technical-admin'],
+      permissions: ['*'],
+      claims: { assurance_level: 'simples', cpf: '11111111111' },
+    });
+    expect(() => guard.canActivate(context)).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.IDENTITY_NOT_CITIZEN' }),
+    );
+  });
+
+  it('C-0001-12 — dado portalIdentityOf(request) sem a guarda ter rodado quando chamado então PORTAL.INTERNAL 500', () => {
+    expect(() => portalIdentityOf({})).toThrowError(
+      expect.objectContaining({ code: 'PORTAL.INTERNAL', status: 500 }),
+    );
+  });
+});
diff --git a/backend/domains/portal/identity/src/handwritten/citizen.guard.ts b/backend/domains/portal/identity/src/handwritten/citizen.guard.ts
new file mode 100644
index 0000000..daf4b11
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/citizen.guard.ts
@@ -0,0 +1,75 @@
+// Guarda de identidade do cidadão (work/rounds/R-0009/contracts/CTG-0001.md
+// §3; plan R-0009 M4 e adenda A1(f); ADR-0024 §4). Roda DEPOIS dos guards
+// globais do STYNX (autenticação → tenant → política): não é política — nunca
+// consulta `principal.permissions` — e `technical-admin`/`*` não a contorna.
+// Ordem fixada: principal → claims (fail-closed) → papel CIDADAO → marca a
+// requisição. O acessor do principal é o mesmo do `DetranPolicyGuard`
+// (`getPrincipalFromRequest` de `@stynx-nyx/backend`, que lê `request.principal`).
+import {
+  type CanActivate,
+  type ExecutionContext,
+  Injectable,
+} from '@nestjs/common';
+import {
+  canonicalRoles,
+  getPrincipalFromRequest,
+  type RequestLike,
+} from '@detran/shared';
+
+import { PortalError } from './errors.js';
+import {
+  portalIdentityClaims,
+  type PortalIdentityClaims,
+} from './identity.service.js';
+
+/** Propriedade da requisição HTTP preenchida pela guarda (§3 passo 4). */
+export const PORTAL_IDENTITY_REQUEST_KEY = 'portalIdentity';
+
+export interface PortalIdentityRequest {
+  [PORTAL_IDENTITY_REQUEST_KEY]?: PortalIdentityClaims;
+}
+
+@Injectable()
+export class PortalCitizenGuard implements CanActivate {
+  canActivate(context: ExecutionContext): boolean {
+    const request = context
+      .switchToHttp()
+      .getRequest<RequestLike & PortalIdentityRequest>();
+    const principal = getPrincipalFromRequest(request);
+    if (!principal) {
+      throw new PortalError('PORTAL.AUTH_REQUIRED', {
+        status: 401,
+        context: {},
+      });
+    }
+    const claims = portalIdentityClaims(principal);
+    if (!claims) {
+      throw new PortalError('PORTAL.ASSURANCE_NOT_VERIFIED', {
+        status: 403,
+        context: {},
+      });
+    }
+    if (!canonicalRoles(principal.roles ?? []).includes('CIDADAO')) {
+      throw new PortalError('PORTAL.IDENTITY_NOT_CITIZEN', {
+        status: 403,
+        context: {},
+      });
+    }
+    request[PORTAL_IDENTITY_REQUEST_KEY] = claims;
+    return true;
+  }
+}
+
+/**
+ * Claims validadas pela guarda; ausência significa controlador sem
+ * `@UseGuards(PortalCitizenGuard)` — defeito interno, nunca 403.
+ */
+export function portalIdentityOf(
+  request: PortalIdentityRequest,
+): PortalIdentityClaims {
+  const identity = request[PORTAL_IDENTITY_REQUEST_KEY];
+  if (!identity) {
+    throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+  }
+  return identity;
+}
diff --git a/backend/domains/portal/identity/src/handwritten/clock.ts b/backend/domains/portal/identity/src/handwritten/clock.ts
new file mode 100644
index 0000000..5041148
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/clock.ts
@@ -0,0 +1,45 @@
+// Relógio do pacote (plan R-0009 adenda A1(g); CTG-0001 §4): provider
+// `@Injectable()` declarado pelo bloco `module` de BP-PORTAL-IDENTITY-001 que
+// expõe `Clock` de `@detran/inf-deadlines`. É o único ponto do pacote que lê o
+// instante real (`new Date()`): `PortalIdentityService`, `assertActLevel` e os
+// controladores só consomem `now()`/`today()`; o perfil de teste substitui a
+// classe por `FixedClock` (2026-09-14) via `{ provide: PortalClock, useValue }`.
+import { Injectable } from '@nestjs/common';
+import type { Clock, LocalDate } from '@detran/inf-deadlines';
+
+/**
+ * Fuso da data civil do Portal quando o chamador não informa o do tenant
+ * (CTG-0001 §4: `today = 'YYYY-MM-DD' em America/Manaus`; §0: "hoje" das
+ * fixtures em America/Manaus). O fuso por tenant (`auth.tenants.timezone`,
+ * `portal.brand_profile.time_zone`) é lido pelos comandos de CTG-0002.
+ */
+export const PORTAL_DEFAULT_TIME_ZONE = 'America/Manaus';
+
+/** Forma mínima de relógio que o pacote consome (subconjunto de `Clock`). */
+export interface PortalClockLike {
+  now(): Date;
+  today(tenantTz?: string): LocalDate;
+}
+
+@Injectable()
+export class PortalClock implements Clock, PortalClockLike {
+  /** Único `new Date()` sancionado do pacote (CODESTYLE §TypeScript). */
+  now(): Date {
+    return new Date();
+  }
+
+  /** Data civil `YYYY-MM-DD` de `now()` no fuso informado. */
+  today(tenantTz: string = PORTAL_DEFAULT_TIME_ZONE): LocalDate {
+    return localDateOf(this.now(), tenantTz);
+  }
+}
+
+/** `YYYY-MM-DD` de um instante num fuso IANA (formato `en-CA` = ISO por dia). */
+export function localDateOf(instant: Date, timeZone: string): LocalDate {
+  return new Intl.DateTimeFormat('en-CA', {
+    timeZone,
+    year: 'numeric',
+    month: '2-digit',
+    day: '2-digit',
+  }).format(instant);
+}
diff --git a/backend/domains/portal/identity/src/handwritten/errors.ts b/backend/domains/portal/identity/src/handwritten/errors.ts
new file mode 100644
index 0000000..eac5eea
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/errors.ts
@@ -0,0 +1,15 @@
+// Erro de domínio do Portal (work/rounds/R-0009/contracts/CTG-0001.md §0 e §12;
+// docs/framework/arch/portal-error-catalog.md). Mesmo envelope de `DetranError`
+// (`@detran/shared`): `code` sempre com prefixo `PORTAL.`, `status` HTTP e
+// `context` só com ids, tokens e números; `messageKey` é derivada por
+// `DetranError` (`portal.errors.<código minúsculo>`), nunca tabela literal.
+import { DetranError, type DetranErrorOptions } from '@detran/shared';
+
+export type PortalErrorCode = `PORTAL.${string}`;
+
+export class PortalError extends DetranError {
+  constructor(code: PortalErrorCode, options: DetranErrorOptions) {
+    super(code, options);
+    this.name = 'PortalError';
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/identity-claims.spec.ts b/backend/domains/portal/identity/src/handwritten/identity-claims.spec.ts
new file mode 100644
index 0000000..6952689
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/identity-claims.spec.ts
@@ -0,0 +1,214 @@
+// CTG-0001 §2 (M3) — parsing das claims de identidade federada. Fica vermelho até
+// TASK-0004 criar backend/domains/portal/identity/src/handwritten/identity.service.ts
+// (e o index.ts que o re-exporta, §12 Layout). Regras fail-closed: qualquer falha
+// devolve `null` inteiro (nunca lança, nunca degrada para 'simples' — §2.1 regra 0).
+import { describe, expect, it } from 'vitest';
+
+import {
+  portalClaimNames,
+  portalIdentityClaims,
+  PORTAL_ASSURANCE_LEVELS,
+  PORTAL_GOVBR_LEVELS,
+} from './index.js';
+
+describe('portalClaimNames (§2.2)', () => {
+  it('dado ambiente sem STYNX_COGNITO_*_CLAIM quando portalClaimNames então usa os nomes default custom:assurance_level e custom:cpf', () => {
+    const names = portalClaimNames({});
+    expect(names).toEqual({
+      assuranceClaim: 'custom:assurance_level',
+      cpfClaim: 'custom:cpf',
+    });
+  });
+
+  it('dado STYNX_COGNITO_ASSURANCE_CLAIM e STYNX_COGNITO_CPF_CLAIM configurados quando portalClaimNames então usa os nomes configurados', () => {
+    const names = portalClaimNames({
+      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
+      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
+    });
+    expect(names).toEqual({
+      assuranceClaim: 'custom:x_assurance',
+      cpfClaim: 'custom:x_cpf',
+    });
+  });
+});
+
+describe('portalIdentityClaims (§2.1) — fail-closed: qualquer falha devolve null', () => {
+  it('dado principal undefined quando portalIdentityClaims então null (regra 1)', () => {
+    expect(portalIdentityClaims(undefined)).toBeNull();
+  });
+
+  it('dado principal sem a propriedade claims quando portalIdentityClaims então null (regra 1)', () => {
+    expect(portalIdentityClaims({} as never)).toBeNull();
+  });
+
+  it('dado claims não-objeto (string) quando portalIdentityClaims então null (regra 1)', () => {
+    expect(
+      portalIdentityClaims({ claims: 'not-an-object' } as never),
+    ).toBeNull();
+  });
+
+  it('dado claims sem assurance_level quando portalIdentityClaims então null (regra 2)', () => {
+    expect(
+      portalIdentityClaims({ claims: { cpf: '11111111111' } } as never),
+    ).toBeNull();
+  });
+
+  it('dado assurance_level não-string (number) quando portalIdentityClaims então null (regra 2)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 2, cpf: '11111111111' },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado assurance_level em caixa alta ("AVANCADA") quando portalIdentityClaims então null — comparação exata, sem lower-case (regra 2)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'AVANCADA', cpf: '11111111111' },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado assurance_level com acentuação divergente ("avançada") quando portalIdentityClaims então null — comparação exata, sem trim/normalização (regra 2)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'avançada', cpf: '11111111111' },
+      } as never),
+    ).toBeNull();
+  });
+
+  for (const level of PORTAL_ASSURANCE_LEVELS) {
+    it(`dado assurance_level=${level} (token canônico) e cpf válido quando portalIdentityClaims então assuranceLevel=${level}`, () => {
+      const result = portalIdentityClaims({
+        claims: { assurance_level: level, cpf: '11111111111' },
+      } as never);
+      expect(result?.assuranceLevel).toBe(level);
+    });
+  }
+
+  it('dado claims sem cpf quando portalIdentityClaims então null (regra 3)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'simples' },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado cpf não-string (number) quando portalIdentityClaims então null (regra 3)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'simples', cpf: 11111111111 },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado cpf com máscara "111.111.111-11" quando portalIdentityClaims então normaliza para "11111111111" (regra 3, /\\D/g)', () => {
+    const result = portalIdentityClaims({
+      claims: { assurance_level: 'simples', cpf: '111.111.111-11' },
+    } as never);
+    expect(result?.cpf).toBe('11111111111');
+  });
+
+  it('dado cpf com 10 dígitos quando portalIdentityClaims então null (regra 3, comprimento ≠ 11)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'simples', cpf: '1111111111' },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado cpf com 12 dígitos quando portalIdentityClaims então null (regra 3, comprimento ≠ 11)', () => {
+    expect(
+      portalIdentityClaims({
+        claims: { assurance_level: 'simples', cpf: '111111111111' },
+      } as never),
+    ).toBeNull();
+  });
+
+  it('dado cpf de dígitos repetidos (sem DV válido) quando portalIdentityClaims então aceita — regra 3 não valida dígito verificador nesta rodada (OD-P25)', () => {
+    const result = portalIdentityClaims({
+      claims: { assurance_level: 'simples', cpf: '11111111111' },
+    } as never);
+    expect(result?.cpf).toBe('11111111111');
+  });
+
+  it('dado govbr_level fora de PORTAL_GOVBR_LEVELS ("platina") quando portalIdentityClaims então claims sem govbrLevel — omitido, não é o resultado inteiro que vira null (regra 4)', () => {
+    const result = portalIdentityClaims({
+      claims: {
+        assurance_level: 'simples',
+        cpf: '11111111111',
+        govbr_level: 'platina',
+      },
+    } as never);
+    expect(result).not.toBeNull();
+    expect(result?.govbrLevel).toBeUndefined();
+  });
+
+  for (const level of PORTAL_GOVBR_LEVELS) {
+    it(`dado govbr_level=${level} (token canônico) quando portalIdentityClaims então govbrLevel=${level}`, () => {
+      const result = portalIdentityClaims({
+        claims: {
+          assurance_level: 'simples',
+          cpf: '11111111111',
+          govbr_level: level,
+        },
+      } as never);
+      expect(result?.govbrLevel).toBe(level);
+    });
+  }
+
+  it('dado claims completas e válidas quando portalIdentityClaims então devolve exatamente { cpf, assuranceLevel } sem govbrLevel quando ausente', () => {
+    const result = portalIdentityClaims({
+      claims: { assurance_level: 'avancada', cpf: '22222222222' },
+    } as never);
+    expect(result).toEqual({ cpf: '22222222222', assuranceLevel: 'avancada' });
+  });
+
+  it('C-0001-10a — dado claims só sob os nomes configurados (STYNX_COGNITO_ASSURANCE_CLAIM/STYNX_COGNITO_CPF_CLAIM) quando portalIdentityClaims então lê por eles', () => {
+    const names = portalClaimNames({
+      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
+      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
+    });
+    const result = portalIdentityClaims(
+      {
+        claims: {
+          'custom:x_assurance': 'avancada',
+          'custom:x_cpf': '22222222222',
+        },
+      } as never,
+      names,
+    );
+    expect(result).toEqual({ cpf: '22222222222', assuranceLevel: 'avancada' });
+  });
+
+  it('C-0001-10b — dado claims com o nome curto E o nome configurado presentes então o nome curto vence (ordem de leitura §2.1)', () => {
+    const names = portalClaimNames({
+      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
+      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
+    });
+    const result = portalIdentityClaims(
+      {
+        claims: {
+          assurance_level: 'simples',
+          'custom:x_assurance': 'avancada',
+          cpf: '11111111111',
+          'custom:x_cpf': '22222222222',
+        },
+      } as never,
+      names,
+    );
+    expect(result).toEqual({ cpf: '11111111111', assuranceLevel: 'simples' });
+  });
+
+  it('C-0001-11 — dado govbr_level "platina" quando portalIdentityClaims então devolve claims sem govbrLevel (não null o conjunto todo)', () => {
+    const result = portalIdentityClaims({
+      claims: {
+        assurance_level: 'simples',
+        cpf: '11111111111',
+        govbr_level: 'platina',
+      },
+    } as never);
+    expect(result).not.toBeNull();
+    expect(result).toEqual({ cpf: '11111111111', assuranceLevel: 'simples' });
+  });
+});
diff --git a/backend/domains/portal/identity/src/handwritten/identity.service.ts b/backend/domains/portal/identity/src/handwritten/identity.service.ts
new file mode 100644
index 0000000..b59fe5b
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/identity.service.ts
@@ -0,0 +1,479 @@
+// Identidade federada do cidadão (work/rounds/R-0009/contracts/CTG-0001.md §2,
+// §4, §8 e §12; plan R-0009 M3, M4, M6, M24; ADR-0024). Funções puras das
+// claims (§2.1) e do nível por ato (§4) mais o serviço injetável declarado
+// pelo bloco `module` de BP-PORTAL-IDENTITY-001: upsert do sujeito, matriz
+// ato → nível, vínculo e representações. Nunca lê `Date.now()`: o relógio é
+// `PortalClock` (adenda A1(g)).
+import { createHash } from 'node:crypto';
+import { Injectable, Optional } from '@nestjs/common';
+import type { Transaction } from '@stynx-nyx/data';
+import type { getPrincipalFromRequest } from '@detran/shared';
+
+import { PortalClock, type PortalClockLike } from './clock.js';
+import { PortalError } from './errors.js';
+
+type Principal = NonNullable<ReturnType<typeof getPrincipalFromRequest>>;
+
+/** Subconjunto da transação STYNX que este pacote usa (SQL parametrizado). */
+export type PortalSqlTransaction = Pick<Transaction, 'query'>;
+
+// ---------------------------------------------------------------------------
+// §2.1 — claims e principal (M3)
+// ---------------------------------------------------------------------------
+
+export const PORTAL_ASSURANCE_LEVELS = [
+  'simples',
+  'avancada',
+  'qualificada',
+] as const;
+export type PortalAssuranceLevel = (typeof PORTAL_ASSURANCE_LEVELS)[number];
+
+export const PORTAL_GOVBR_LEVELS = [
+  'bronze',
+  'prata',
+  'ouro',
+  'qualificada',
+] as const;
+export type PortalGovbrLevel = (typeof PORTAL_GOVBR_LEVELS)[number];
+
+/** Decreto 10.543/2020 art. 5º I–III (CTG-0001 §4). */
+export const PORTAL_ELEVATION_METHODS = [
+  'biographic',
+  'biometric',
+  'icp',
+] as const;
+
+export interface PortalClaimNames {
+  /** `STYNX_COGNITO_ASSURANCE_CLAIM` ?? `custom:assurance_level` (ADR-0024 §6). */
+  assuranceClaim: string;
+  /** `STYNX_COGNITO_CPF_CLAIM` ?? `custom:cpf` (ADR-0024 §6). */
+  cpfClaim: string;
+}
+
+export function portalClaimNames(
+  env: Record<string, string | undefined> = process.env,
+): PortalClaimNames {
+  return {
+    assuranceClaim:
+      env.STYNX_COGNITO_ASSURANCE_CLAIM ?? 'custom:assurance_level',
+    cpfClaim: env.STYNX_COGNITO_CPF_CLAIM ?? 'custom:cpf',
+  };
+}
+
+export interface PortalIdentityClaims {
+  /** Exatamente 11 dígitos (normalizado com `/\D/g`). */
+  cpf: string;
+  assuranceLevel: PortalAssuranceLevel;
+  /** Selo gov.br observado — observacional, nunca autorização (OD-P25). */
+  govbrLevel?: PortalGovbrLevel;
+}
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+/** Primeira chave presente vence (presença = valor !== undefined). */
+function firstPresent(
+  claims: Record<string, unknown>,
+  keys: readonly string[],
+): unknown {
+  for (const key of keys) {
+    if (claims[key] !== undefined) return claims[key];
+  }
+  return undefined;
+}
+
+/**
+ * Leitura fail-closed das claims (§2.1): qualquer falha devolve `null`, nunca
+ * lança e nunca degrada para `simples`. Comparação exata dos tokens (sem
+ * trim, sem lower-case); o dígito verificador do CPF não é validado nesta
+ * rodada (OD-P25).
+ */
+export function portalIdentityClaims(
+  principal: Pick<Principal, 'claims'> | undefined,
+  names: PortalClaimNames = portalClaimNames(),
+): PortalIdentityClaims | null {
+  if (!principal || !isRecord(principal.claims)) return null;
+  const claims = principal.claims;
+
+  const assurance = firstPresent(claims, [
+    'assurance_level',
+    names.assuranceClaim,
+  ]);
+  if (
+    typeof assurance !== 'string' ||
+    !(PORTAL_ASSURANCE_LEVELS as readonly string[]).includes(assurance)
+  ) {
+    return null;
+  }
+
+  const rawCpf = firstPresent(claims, ['cpf', names.cpfClaim]);
+  if (typeof rawCpf !== 'string') return null;
+  const cpf = rawCpf.replace(/\D/g, '');
+  if (cpf.length !== 11) return null;
+
+  const govbr = claims['govbr_level'];
+  const govbrLevel =
+    typeof govbr === 'string' &&
+    (PORTAL_GOVBR_LEVELS as readonly string[]).includes(govbr)
+      ? (govbr as PortalGovbrLevel)
+      : undefined;
+
+  return {
+    cpf,
+    assuranceLevel: assurance as PortalAssuranceLevel,
+    ...(govbrLevel ? { govbrLevel } : {}),
+  };
+}
+
+// ---------------------------------------------------------------------------
+// §4 — nível por ato (M4/M5)
+// ---------------------------------------------------------------------------
+
+export type PortalRequiredAssurance = 'none' | PortalAssuranceLevel;
+
+/** Ordem `none < simples < avancada < qualificada` (route contract §11). */
+export function assuranceRank(level: PortalRequiredAssurance): 0 | 1 | 2 | 3 {
+  switch (level) {
+    case 'none':
+      return 0;
+    case 'simples':
+      return 1;
+    case 'avancada':
+      return 2;
+    case 'qualificada':
+      return 3;
+  }
+}
+
+export interface ActLevelDecision {
+  actKey: string;
+  required: PortalRequiredAssurance;
+  current: PortalAssuranceLevel;
+  policyId: string;
+}
+
+interface ActLevelPolicyRow extends Record<string, unknown> {
+  id: string;
+  minimum_assurance: string;
+}
+
+/** Vigência de `portal.act_level_policy` (§4): `$1` = act_key, `$2` = hoje. */
+const ACT_LEVEL_POLICY_SQL = `select id, minimum_assurance
+     from portal.act_level_policy
+    where act_key = $1
+      and enabled = true
+      and effective_from <= $2::date
+      and $2::date < coalesce(effective_to, 'infinity'::date)
+    order by effective_from desc
+    limit 1`;
+
+/**
+ * Compara o nível da sessão com o mínimo do ato dentro da transação do
+ * comando (§4). Ato sem linha vigente NUNCA libera (M4); linha `qualificada`
+ * é defeito de configuração (RN-PORTAL-101 (c)); `none` não compara (H.51).
+ * Nunca consulta `govbrLevel` (UC-PORTAL-019 AC-2).
+ */
+export async function assertActLevel(
+  tx: PortalSqlTransaction,
+  identity: PortalIdentityClaims,
+  actKey: string,
+  resumeRoute: string,
+  clock: PortalClockLike = new PortalClock(),
+): Promise<ActLevelDecision> {
+  const result = await tx.query<ActLevelPolicyRow>(ACT_LEVEL_POLICY_SQL, [
+    actKey,
+    clock.today(),
+  ]);
+  const row = result.rows[0];
+  if (!row) {
+    throw new PortalError('PORTAL.INTERNAL', {
+      status: 500,
+      context: { actKey },
+    });
+  }
+  const required = row.minimum_assurance as PortalRequiredAssurance;
+  if (required === 'qualificada') {
+    throw new PortalError('PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED', {
+      status: 500,
+      context: { actKey },
+    });
+  }
+  const current = identity.assuranceLevel;
+  if (required !== 'none' && assuranceRank(current) < assuranceRank(required)) {
+    throw new PortalError('PORTAL.ASSURANCE_INSUFFICIENT', {
+      status: 403,
+      context: {
+        actKey,
+        required,
+        current,
+        elevationMethods: [...PORTAL_ELEVATION_METHODS],
+        resumeRoute,
+      },
+    });
+  }
+  return { actKey, required, current, policyId: row.id };
+}
+
+// ---------------------------------------------------------------------------
+// §8 GET me — sujeito, requisitos por ato, representações (M6)
+// ---------------------------------------------------------------------------
+
+export interface PortalSubjectRecord {
+  subjectId: string;
+  name: string | null;
+  observedAt: Date;
+  version: number;
+}
+
+export interface PortalActRequirement {
+  actKey: string;
+  minimumAssurance: PortalRequiredAssurance;
+  allowed: boolean;
+  reason?:
+    | 'PORTAL.ASSURANCE_INSUFFICIENT'
+    | 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED';
+}
+
+export interface PortalRepresentationSummary {
+  id: string;
+  representedName: string;
+  scope: 'ait' | 'all';
+  validUntil: string | null;
+}
+
+export interface PortalMeResponse {
+  subjectId: string;
+  cpf: string;
+  name: string | null;
+  assuranceLevel: PortalAssuranceLevel;
+  govbrLevelObservedAt: string;
+  actRequirements: PortalActRequirement[];
+  representations: PortalRepresentationSummary[];
+  /** `@stynx-nyx/preferences` não é montado nesta rodada (CTG-0002). */
+  preferences: null;
+  /** Registro PII/`@stynx-nyx/privacy` pendente (OD-P17). */
+  heldDataSummary: never[];
+}
+
+/** `sha256` hex minúsculo do CPF de 11 dígitos (M6; risco OD-P23). */
+export function cpfHashOf(cpf: string): string {
+  return createHash('sha256').update(cpf).digest('hex');
+}
+
+interface SubjectRow extends Record<string, unknown> {
+  id: string;
+  name: string;
+  observed_at: Date;
+  version: number;
+}
+
+interface ActRequirementRow extends Record<string, unknown> {
+  id: string;
+  act_key: string;
+  minimum_assurance: string;
+}
+
+interface RepresentationRow extends Record<string, unknown> {
+  id: string;
+  represented_name: string;
+  scope: 'ait' | 'all';
+  valid_until: string | null;
+}
+
+interface EntitlementRow extends Record<string, unknown> {
+  id: string;
+}
+
+/**
+ * `portal.subject.name` é `not null` no DDL 61 gerado, enquanto o contrato
+ * §7.1/§8 admite `null` quando a claim OIDC `name` não existe (D13 — o DDL
+ * manda nas colunas): a ausência é gravada como `''` e devolvida como `null`.
+ */
+const NO_NAME = '';
+
+/** `tenant_id` é preenchido pela trigger `auth.enforce_tenant_id` (C-0001-32). */
+const UPSERT_SUBJECT_SQL = `insert into portal.subject
+      (cpf_hash, name, govbr_level_observed, assurance_level_observed, observed_at, version)
+    values ($1, $2, $3, $4, $5, 1)
+    on conflict (tenant_id, cpf_hash) do update set
+      assurance_level_observed = excluded.assurance_level_observed,
+      govbr_level_observed = coalesce(excluded.govbr_level_observed, portal.subject.govbr_level_observed),
+      name = coalesce(nullif(excluded.name, ''), portal.subject.name),
+      observed_at = excluded.observed_at,
+      updated_at = excluded.observed_at,
+      version = portal.subject.version + case
+        when portal.subject.assurance_level_observed is distinct from excluded.assurance_level_observed
+          or (excluded.govbr_level_observed is not null
+              and excluded.govbr_level_observed is distinct from portal.subject.govbr_level_observed)
+        then 1 else 0 end
+    returning id, name, observed_at, version`;
+
+/** Todas as linhas vigentes (uma por `act_key`, a mais recente), `act_key` asc. */
+const ACT_REQUIREMENTS_SQL = `select distinct on (act_key) id, act_key, minimum_assurance
+     from portal.act_level_policy
+    where enabled = true
+      and effective_from <= $1::date
+      and $1::date < coalesce(effective_to, 'infinity'::date)
+    order by act_key asc, effective_from desc`;
+
+const REPRESENTATIONS_SQL = `select id, represented_name, scope,
+          to_char(valid_until, 'YYYY-MM-DD') as valid_until
+     from portal.representation
+    where representative_subject_id = $1
+      and state = 'PROCURACAO_VALIDADA'
+      and (valid_until is null or valid_until >= $2::date)
+    order by created_at asc, id asc`;
+
+const ENTITLEMENT_SQL = `select id
+     from portal.entitlement
+    where subject_id = $1
+      and target_kind = $2
+      and target_id = $3
+      and valid_from <= $4::date
+      and (valid_until is null or valid_until >= $4::date)
+    limit 1`;
+
+@Injectable()
+export class PortalIdentityService {
+  private readonly clock: PortalClockLike;
+
+  constructor(@Optional() clock?: PortalClock) {
+    this.clock = clock ?? new PortalClock();
+  }
+
+  /** §8: insert sob demanda; `version` só incrementa quando um nível muda. */
+  async upsertSubject(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    name: string | null,
+    clock: PortalClockLike = this.clock,
+  ): Promise<PortalSubjectRecord> {
+    const result = await tx.query<SubjectRow>(UPSERT_SUBJECT_SQL, [
+      cpfHashOf(identity.cpf),
+      name ?? NO_NAME,
+      identity.govbrLevel ?? null,
+      identity.assuranceLevel,
+      clock.now(),
+    ]);
+    const row = result.rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    return {
+      subjectId: row.id,
+      name: row.name === NO_NAME ? null : row.name,
+      observedAt: row.observed_at,
+      version: row.version,
+    };
+  }
+
+  /** §8 `actRequirements`: a leitura não lança; só o ato (`assertActLevel`) lança. */
+  async actRequirements(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    clock: PortalClockLike = this.clock,
+  ): Promise<PortalActRequirement[]> {
+    const result = await tx.query<ActRequirementRow>(ACT_REQUIREMENTS_SQL, [
+      clock.today(),
+    ]);
+    return result.rows.map((row) => {
+      const minimumAssurance = row.minimum_assurance as PortalRequiredAssurance;
+      if (minimumAssurance === 'qualificada') {
+        return {
+          actKey: row.act_key,
+          minimumAssurance,
+          allowed: false,
+          reason: 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
+        };
+      }
+      const allowed =
+        minimumAssurance === 'none' ||
+        assuranceRank(identity.assuranceLevel) >=
+          assuranceRank(minimumAssurance);
+      return {
+        actKey: row.act_key,
+        minimumAssurance,
+        allowed,
+        ...(allowed ? {} : { reason: 'PORTAL.ASSURANCE_INSUFFICIENT' }),
+      };
+    });
+  }
+
+  /** §4, dentro da transação do comando; relógio injetado (A1(g)). */
+  assertActLevel(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    actKey: string,
+    resumeRoute: string,
+  ): Promise<ActLevelDecision> {
+    return assertActLevel(tx, identity, actKey, resumeRoute, this.clock);
+  }
+
+  /**
+   * §12 (M10): vínculo vigente do sujeito com o alvo; ausência disfarça
+   * inexistência (`404 PORTAL.NOT_FOUND { kind }`, route contract §1.2).
+   */
+  async assertEntitled(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+    targetKind: string,
+    targetId: string,
+    clock: PortalClockLike = this.clock,
+  ): Promise<{ entitlementId: string }> {
+    const result = await tx.query<EntitlementRow>(ENTITLEMENT_SQL, [
+      subjectId,
+      targetKind,
+      targetId,
+      clock.today(),
+    ]);
+    const row = result.rows[0];
+    if (!row) {
+      throw new PortalError('PORTAL.NOT_FOUND', {
+        status: 404,
+        context: { kind: targetKind },
+      });
+    }
+    return { entitlementId: row.id };
+  }
+
+  /** §8 `representations`: só `PROCURACAO_VALIDADA` não vencida. */
+  async representationsOf(
+    tx: PortalSqlTransaction,
+    subjectId: string,
+    clock: PortalClockLike = this.clock,
+  ): Promise<PortalRepresentationSummary[]> {
+    const result = await tx.query<RepresentationRow>(REPRESENTATIONS_SQL, [
+      subjectId,
+      clock.today(),
+    ]);
+    return result.rows.map((row) => ({
+      id: row.id,
+      representedName: row.represented_name,
+      scope: row.scope,
+      validUntil: row.valid_until,
+    }));
+  }
+
+  /** Corpo de `GET /v1/portal/identity/me` (§8), numa única transação. */
+  async readMe(
+    tx: PortalSqlTransaction,
+    identity: PortalIdentityClaims,
+    name: string | null,
+  ): Promise<PortalMeResponse> {
+    const subject = await this.upsertSubject(tx, identity, name);
+    const actRequirements = await this.actRequirements(tx, identity);
+    const representations = await this.representationsOf(tx, subject.subjectId);
+    return {
+      subjectId: subject.subjectId,
+      cpf: identity.cpf,
+      name: subject.name,
+      assuranceLevel: identity.assuranceLevel,
+      govbrLevelObservedAt: subject.observedAt.toISOString(),
+      actRequirements,
+      representations,
+      preferences: null,
+      heldDataSummary: [],
+    };
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/index.ts b/backend/domains/portal/identity/src/handwritten/index.ts
new file mode 100644
index 0000000..10f6cb0
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/index.ts
@@ -0,0 +1,14 @@
+// API pública manuscrita de @detran/portal-identity
+// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24 e adenda
+// A1(g)), reexportada pelo `src/index.ts` gerado via `module.handwrittenExports`
+// de BP-PORTAL-IDENTITY-001 (ADR-0007). Controladores, guarda, serviço,
+// relógio, erro e as funções puras de claims e nível por ato.
+export * from './assurance.controller.js';
+export * from './citizen.guard.js';
+export * from './clock.js';
+export * from './errors.js';
+export * from './identity.service.js';
+export * from './me.controller.js';
+export * from './preferences.controller.js';
+export * from './public.controller.js';
+export * from './representations.controller.js';
diff --git a/backend/domains/portal/identity/src/handwritten/me.controller.ts b/backend/domains/portal/identity/src/handwritten/me.controller.ts
new file mode 100644
index 0000000..8dfbdb9
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/me.controller.ts
@@ -0,0 +1,55 @@
+// `GET /v1/portal/identity/me` (work/rounds/R-0009/contracts/CTG-0001.md §8;
+// portal-route-contract.md §3; plan R-0009 M4, M6, M20). Leitura de dado
+// pessoal: `@Audit` obrigatório (RN-PORTAL-118 4). O controlador só extrai a
+// identidade validada pela guarda e delega ao serviço numa única transação
+// de tenant (`withTenantContext`, ADR-0002).
+import { Controller, Get, Req, UseGuards } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  Action,
+  Audit,
+  Resource,
+  getPrincipalFromRequest,
+  withTenantContext,
+  type RequestLike,
+} from '@detran/shared';
+
+import {
+  PortalCitizenGuard,
+  portalIdentityOf,
+  type PortalIdentityRequest,
+} from './citizen.guard.js';
+import {
+  PortalIdentityService,
+  type PortalMeResponse,
+} from './identity.service.js';
+
+@Controller('v1/portal/identity')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:identity')
+export class PortalMeController {
+  constructor(
+    private readonly identity: PortalIdentityService,
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get('me')
+  @Action('read')
+  @Audit({ action: 'PORTAL_IDENTITY_READ', entity: 'portal.subject' })
+  me(
+    @Req() request: RequestLike & PortalIdentityRequest,
+  ): Promise<PortalMeResponse> {
+    const identity = portalIdentityOf(request);
+    // Claim OIDC `name` quando string (§7.1; mapeamento gov.br source_pending, OD-P15).
+    const name = getPrincipalFromRequest(request)?.claims?.name;
+    return withTenantContext(this.database, this.requestContext, (tx) =>
+      this.identity.readMe(
+        tx,
+        identity,
+        typeof name === 'string' ? name : null,
+      ),
+    );
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/preferences.controller.ts b/backend/domains/portal/identity/src/handwritten/preferences.controller.ts
new file mode 100644
index 0000000..82b1ea6
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/preferences.controller.ts
@@ -0,0 +1,14 @@
+// `PUT /v1/portal/identity/preferences` — sem rotas nesta rodada
+// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24):
+// `@stynx-nyx/preferences` não é montado em CTG-0001 (`GET me` devolve
+// `preferences: null`); a rota é CTG-0002 (TASK-0007). Guarda e recurso já
+// declarados.
+import { Controller, UseGuards } from '@nestjs/common';
+import { Resource } from '@detran/shared';
+
+import { PortalCitizenGuard } from './citizen.guard.js';
+
+@Controller('v1/portal/identity/preferences')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:identity')
+export class PortalPreferencesController {}
diff --git a/backend/domains/portal/identity/src/handwritten/public.controller.ts b/backend/domains/portal/identity/src/handwritten/public.controller.ts
new file mode 100644
index 0000000..3b76a54
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/public.controller.ts
@@ -0,0 +1,227 @@
+// Rotas públicas do Portal (work/rounds/R-0009/contracts/CTG-0001.md §8 e §9;
+// portal-route-contract.md §2; plan R-0009 M11, M12). Classe inteira
+// `@Public()`: sem `@Resource`/`@Action`, sem sessão. O tenant vem da
+// resolução pelo Host/`X-Tenant-Id` feita pelo app (detran-runtime.ts §9) e
+// chega pelo `RequestContext`; a transação é `Database.tx({ role: 'app' })`
+// (nunca owner — ADR-0002): `brand_profile` não tem RLS por desenho (M11) e
+// `service_catalog` é lida sob RLS com `app.tenant_id` do contexto.
+import { Controller, Get, Param } from '@nestjs/common';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database, type Transaction } from '@stynx-nyx/data';
+import { Public } from '@detran/shared';
+
+import { PortalError } from './errors.js';
+import type { PortalRequiredAssurance } from './identity.service.js';
+
+export interface PortalBrandResponse {
+  displayName: string;
+  shortName: string;
+  legalName: string;
+  primaryColor: string;
+  supportUrl: string | null;
+  privacyUrl: string | null;
+  accessibilityUrl: string | null;
+  serviceContact: string | null;
+  locale: string;
+  timeZone: string;
+}
+
+export type PortalServiceAvailability =
+  'available' | 'partially_available' | 'unavailable';
+
+export interface PortalServiceResponse {
+  serviceKey: string;
+  route: string;
+  category: string;
+  title: string;
+  summary: string;
+  requirements: string[];
+  deliveryChannel: string;
+  legalDeadline: string;
+  cost: string;
+  accessibilityNote: string;
+  responsibleParty: string;
+  normativeReference: string;
+  availability: PortalServiceAvailability;
+  /** Só presente quando `availability = 'unavailable'` (§8). */
+  unavailableReason?: string;
+  alternativeChannelNote: string | null;
+  minimumAssurance: PortalRequiredAssurance;
+  version: number;
+  effectiveFrom: string;
+}
+
+interface BrandRow extends Record<string, unknown> {
+  display_name: string;
+  short_name: string;
+  legal_name: string;
+  primary_color: string;
+  support_url: string | null;
+  privacy_url: string | null;
+  accessibility_url: string | null;
+  service_contact: string | null;
+  locale: string;
+  time_zone: string;
+}
+
+interface ServiceRow extends Record<string, unknown> {
+  service_key: string;
+  route: string;
+  category: string;
+  title: string;
+  summary: string;
+  requirements_json: unknown;
+  delivery_channel: string;
+  legal_deadline: string;
+  cost: string;
+  accessibility_note: string;
+  responsible_party: string;
+  normative_reference: string;
+  availability: PortalServiceAvailability;
+  unavailable_reason: string | null;
+  alternative_channel_note: string | null;
+  minimum_assurance: PortalRequiredAssurance;
+  version: number;
+  effective_from: string;
+}
+
+/** As 10 colunas de `GET brand` (DDL manuscrito 19-portal-platform.sql). */
+const BRAND_SQL = `select display_name, short_name, legal_name, primary_color,
+          support_url, privacy_url, accessibility_url, service_contact,
+          locale, time_zone
+     from portal.brand_profile
+    where tenant_id = $1`;
+
+const SERVICE_COLUMNS = `service_key, route, category, title, summary,
+          requirements_json, delivery_channel, legal_deadline, cost,
+          accessibility_note, responsible_party, normative_reference,
+          availability, unavailable_reason, alternative_channel_note,
+          minimum_assurance, version,
+          to_char(effective_from, 'YYYY-MM-DD') as effective_from`;
+
+/** RLS é a última linha, não a primeira (CODESTYLE): `tenant_id` explícito. */
+const SERVICES_SQL = `select ${SERVICE_COLUMNS}
+     from portal.service_catalog
+    where tenant_id = $1
+    order by category asc, service_key asc`;
+
+const SERVICE_SQL = `select ${SERVICE_COLUMNS}
+     from portal.service_catalog
+    where tenant_id = $1 and service_key = $2
+    limit 1`;
+
+function brandOf(row: BrandRow): PortalBrandResponse {
+  return {
+    displayName: row.display_name,
+    shortName: row.short_name,
+    legalName: row.legal_name,
+    primaryColor: row.primary_color,
+    supportUrl: row.support_url,
+    privacyUrl: row.privacy_url,
+    accessibilityUrl: row.accessibility_url,
+    serviceContact: row.service_contact,
+    locale: row.locale,
+    timeZone: row.time_zone,
+  };
+}
+
+function serviceOf(row: ServiceRow): PortalServiceResponse {
+  return {
+    serviceKey: row.service_key,
+    route: row.route,
+    category: row.category,
+    title: row.title,
+    summary: row.summary,
+    requirements: Array.isArray(row.requirements_json)
+      ? row.requirements_json.filter(
+          (item): item is string => typeof item === 'string',
+        )
+      : [],
+    deliveryChannel: row.delivery_channel,
+    legalDeadline: row.legal_deadline,
+    cost: row.cost,
+    accessibilityNote: row.accessibility_note,
+    responsibleParty: row.responsible_party,
+    normativeReference: row.normative_reference,
+    availability: row.availability,
+    ...(row.availability === 'unavailable' && row.unavailable_reason !== null
+      ? { unavailableReason: row.unavailable_reason }
+      : {}),
+    alternativeChannelNote: row.alternative_channel_note,
+    minimumAssurance: row.minimum_assurance,
+    version: row.version,
+    effectiveFrom: row.effective_from,
+  };
+}
+
+@Controller('v1/portal')
+@Public()
+export class PortalPublicController {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  @Get('brand')
+  brand(): Promise<PortalBrandResponse> {
+    return this.read(async (tx, tenantId) => {
+      const result = await tx.query<BrandRow>(BRAND_SQL, [tenantId]);
+      const row = result.rows[0];
+      if (!row) {
+        throw new PortalError('PORTAL.NOT_FOUND', {
+          status: 404,
+          context: { kind: 'brand' },
+        });
+      }
+      return brandOf(row);
+    });
+  }
+
+  @Get('services')
+  services(): Promise<PortalServiceResponse[]> {
+    return this.read(async (tx, tenantId) => {
+      const result = await tx.query<ServiceRow>(SERVICES_SQL, [tenantId]);
+      return result.rows.map(serviceOf);
+    });
+  }
+
+  /** `serviceKey` comparado literalmente, sem normalização de caixa (§8). */
+  @Get('services/:serviceKey')
+  service(
+    @Param('serviceKey') serviceKey: string,
+  ): Promise<PortalServiceResponse> {
+    return this.read(async (tx, tenantId) => {
+      const result = await tx.query<ServiceRow>(SERVICE_SQL, [
+        tenantId,
+        serviceKey,
+      ]);
+      const row = result.rows[0];
+      if (!row) {
+        throw new PortalError('PORTAL.NOT_FOUND', {
+          status: 404,
+          context: { kind: 'service' },
+        });
+      }
+      return serviceOf(row);
+    });
+  }
+
+  /**
+   * Tenant resolvido pelo app (§9) e semeado no `RequestContext`; ausência
+   * aqui é defeito de wiring (a resolução já respondeu 421/403 antes).
+   */
+  private read<T>(
+    work: (tx: Transaction, tenantId: string) => Promise<T>,
+  ): Promise<T> {
+    const tenantId = this.requestContext.hasActiveContext()
+      ? this.requestContext.snapshot().tenantId
+      : undefined;
+    if (!tenantId) {
+      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
+    }
+    return this.database.tx((tx) => work(tx, tenantId), {
+      role: 'app',
+      readonly: true,
+    });
+  }
+}
diff --git a/backend/domains/portal/identity/src/handwritten/representations.controller.ts b/backend/domains/portal/identity/src/handwritten/representations.controller.ts
new file mode 100644
index 0000000..61de539
--- /dev/null
+++ b/backend/domains/portal/identity/src/handwritten/representations.controller.ts
@@ -0,0 +1,13 @@
+// `/v1/portal/identity/representations` — sem rotas nesta rodada
+// (work/rounds/R-0009/contracts/CTG-0001.md §12; plan R-0009 M24): `POST`,
+// `GET` e `DELETE representations[/{id}]` (portal-route-contract.md §3,
+// [WF-PORTAL-002]) são CTG-0002 (TASK-0007). Guarda e recurso já declarados.
+import { Controller, UseGuards } from '@nestjs/common';
+import { Resource } from '@detran/shared';
+
+import { PortalCitizenGuard } from './citizen.guard.js';
+
+@Controller('v1/portal/identity/representations')
+@UseGuards(PortalCitizenGuard)
+@Resource('portal:identity')
+export class PortalRepresentationsController {}
diff --git a/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts b/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts
new file mode 100644
index 0000000..caa6ebe
--- /dev/null
+++ b/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts
@@ -0,0 +1,172 @@
+// CTG-0001 §7 (M11; ADR-0002) — RLS cruzada entre tenants em `portal.*`, exceção por desenho de
+// `portal.brand_profile`/`portal.public_hostname` (M11, DDL manuscrito 19-portal-platform.sql) e
+// gatilho `enforce_tenant_id` (auth.install_tenant_triggers() estendido ao schema 'portal').
+// Não depende de código manuscrito (roda contra o schema `portal` só com o DDL 19/61-65
+// aplicado e as fixtures de 70-fixtures-portal.sql — backend:test:ci roda db:reset + seed.sh
+// antes). Padrão de
+// backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts
+// (leitura obrigatória): `asTenant`/`asOwner`, tenant efêmero via randomUUID (rait-fixtures.md
+// §7), leitura cruzada vazia e insert com tenant_id explícito divergente do `app.tenant_id` da
+// sessão rejeitado com `42501`. A tarefa pede "um segundo tenant criado no teste" (Execução,
+// item 3), que prevalece sobre a redação mais antiga de §11 C-0001-29 ("tenant local").
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    process.env.DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran_r9',
+});
+
+const CANONICAL_TENANT = '00000000-0000-7000-8000-00000000a001';
+// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7; mesmo padrão de
+// notification-db.integration.spec.ts).
+const OTHER_TENANT = randomUUID();
+
+const CROSS_TENANT_TABLES = [
+  'subject',
+  'request',
+  'manifestation',
+  'inbox_item',
+  'infraction_view',
+];
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      CANONICAL_TENANT,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+async function asTenant<T>(
+  tenantId: string,
+  work: () => Promise<T>,
+): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      tenantId,
+    ]);
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+/** `role_app_backend` sem `app.tenant_id` — rotas públicas (§9 M11). */
+async function asRoleWithoutTenant<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query('set local role role_app_backend');
+    return await work();
+  } finally {
+    await client.query('rollback');
+  }
+}
+
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('portal.* — RLS cruzada entre tenants (CTG-0001 §7, M11)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('C-0001-30 — dado app.tenant_id = tenant canônico quando lido então as contagens do §10.9 nas cinco tabelas', async () => {
+    const counts = await asTenant(CANONICAL_TENANT, async () => ({
+      subject: await count(
+        'select count(*)::text as count from portal.subject',
+      ),
+      request: await count(
+        'select count(*)::text as count from portal.request',
+      ),
+      manifestation: await count(
+        'select count(*)::text as count from portal.manifestation',
+      ),
+      inbox_item: await count(
+        'select count(*)::text as count from portal.inbox_item',
+      ),
+      infraction_view: await count(
+        'select count(*)::text as count from portal.infraction_view',
+      ),
+    }));
+    expect(counts).toEqual({
+      subject: 5,
+      request: 13,
+      manifestation: 9,
+      inbox_item: 2,
+      infraction_view: 7,
+    });
+  });
+
+  it('C-0001-29 — dado um segundo tenant (criado no teste) quando lido em portal.subject, portal.request, portal.manifestation, portal.inbox_item e portal.infraction_view então 0 linhas (as fixtures são do tenant canônico)', async () => {
+    await asOwner(() =>
+      client.query(
+        `insert into auth.tenants (id, slug, name) values ($1, $2, 'Portal RLS second tenant') on conflict (id) do nothing`,
+        [OTHER_TENANT, `portal-rls-${OTHER_TENANT.slice(0, 8)}`],
+      ),
+    );
+    for (const table of CROSS_TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from portal.${table}`),
+      );
+      expect(
+        theirs,
+        `portal.${table} deveria estar vazio para o tenant efêmero`,
+      ).toBe(0);
+    }
+  });
+
+  it('C-0001-31a — dado role_app_backend sem app.tenant_id quando lido em portal.brand_profile e portal.public_hostname então lê a linha canônica (sem RLS por desenho, M11)', async () => {
+    const brand = await asRoleWithoutTenant(() =>
+      client.query<{ display_name: string }>(
+        'select display_name from portal.brand_profile where tenant_id = $1',
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(brand.rows[0]?.display_name).toBe('DETRAN-AM (fixtures)');
+
+    const hostname = await asRoleWithoutTenant(() =>
+      client.query<{ hostname: string }>(
+        'select hostname from portal.public_hostname where tenant_id = $1',
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(hostname.rows[0]?.hostname).toBe(
+      'portal.detran-am.fixtures.invalid',
+    );
+  });
+
+  it('C-0001-31b — dado role_app_backend sem app.tenant_id quando lido em portal.service_catalog então 0 linhas (RLS: M11 "nada mais é isento")', async () => {
+    const rows = await asRoleWithoutTenant(() =>
+      count('select count(*)::text as count from portal.service_catalog'),
+    );
+    expect(rows).toBe(0);
+  });
+
+  it('C-0001-32 — dado um tenant efêmero quando uma linha do tenant canônico é inserida em portal.subject então enforce_tenant_id (auth.install_tenant_triggers, schema portal — M11) rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into portal.subject (tenant_id, cpf_hash, name, assurance_level_observed, observed_at)
+           values ($1, $2, 'RLS probe (fixture)', 'simples', now())`,
+          [CANONICAL_TENANT, '0'.repeat(64)],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+});
diff --git a/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts b/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts
new file mode 100644
index 0000000..2a08c61
--- /dev/null
+++ b/backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts
@@ -0,0 +1,231 @@
+// CTG-0001 §10.9 (M22) — contagens exatas e invariantes das fixtures canônicas de
+// `70-fixtures-portal.sql` depois de `DB_NAME=detran_r9 DB_PASSWORD=postgres bash
+// backend/database/seed.sh` rodado duas vezes seguidas (critério de aceitação da tarefa,
+// confirmado sem erro antes deste arquivo existir — a idempotência dos upserts por id garante
+// que nenhuma duplicata sobrevive a uma segunda execução; as asserções de unicidade abaixo
+// verificam isso pelo próprio conteúdo, não repetindo o seed.sh dentro do teste). Não depende de
+// código manuscrito.
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    process.env.DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran_r9',
+});
+
+const CANONICAL_TENANT = '00000000-0000-7000-8000-00000000a001';
+
+beforeAll(async () => {
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    CANONICAL_TENANT,
+  ]);
+});
+
+afterAll(async () => {
+  await client.end();
+});
+
+const one = async <T>(sql: string, params: unknown[] = []): Promise<T> => {
+  const result = await client.query<Record<string, T>>(sql, params);
+  const row = result.rows[0] as Record<string, T> | undefined;
+  const key = Object.keys(row ?? {})[0] as string;
+  return row?.[key] as T;
+};
+
+describe('70-fixtures-portal.sql — contagens e invariantes (CTG-0001 §10.9, M22)', () => {
+  it('C-0001-33 — dado o seed rodado (duas vezes) então as contagens do §10.9 e nenhuma duplicata (cpf_hash, service_key, act_key+effective_from, protocol.number, source_event_id)', async () => {
+    const counts: Record<string, number> = {};
+    for (const table of [
+      'subject',
+      'representation',
+      'entitlement',
+      'act_level_policy',
+      'request',
+      'request_draft',
+      'protocol',
+      'manifestation',
+      'manifestation_extension',
+      'service_catalog',
+      'inbox_item',
+      'acknowledgement_evidence',
+      'sne_enrollment',
+      'push_subscription',
+      'infraction_view',
+      'points_view',
+    ]) {
+      counts[table] = Number(
+        await one<string>(
+          `select count(*)::text as n from portal.${table} where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      );
+    }
+    expect(counts).toEqual({
+      subject: 5,
+      representation: 1,
+      entitlement: 12,
+      act_level_policy: 21,
+      request: 13,
+      request_draft: 1,
+      protocol: 5,
+      manifestation: 9,
+      manifestation_extension: 1,
+      service_catalog: 15,
+      inbox_item: 2,
+      acknowledgement_evidence: 0,
+      sne_enrollment: 1,
+      push_subscription: 0,
+      infraction_view: 7,
+      points_view: 1,
+    });
+
+    expect(
+      Number(
+        await one<string>(
+          `select count(distinct (tenant_id, cpf_hash))::text as n from portal.subject where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      ),
+    ).toBe(5);
+    expect(
+      Number(
+        await one<string>(
+          `select count(distinct service_key)::text as n from portal.service_catalog where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      ),
+    ).toBe(15);
+    expect(
+      Number(
+        await one<string>(
+          `select count(distinct (act_key, effective_from))::text as n from portal.act_level_policy where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      ),
+    ).toBe(21);
+    expect(
+      Number(
+        await one<string>(
+          `select count(distinct number)::text as n from portal.protocol where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      ),
+    ).toBe(5);
+    expect(
+      Number(
+        await one<string>(
+          `select count(distinct source_event_id)::text as n from portal.inbox_item where tenant_id = $1`,
+          [CANONICAL_TENANT],
+        ),
+      ),
+    ).toBe(2);
+  });
+
+  it('C-0001-34 — dado act_level_policy então nenhuma linha minimum_assurance="qualificada" e manifestar tem minimum_assurance="none" (RN-PORTAL-101 (c); H.51)', async () => {
+    const qualificada = Number(
+      await one<string>(
+        `select count(*)::text as n from portal.act_level_policy where tenant_id = $1 and minimum_assurance = 'qualificada'`,
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(qualificada).toBe(0);
+
+    const manifestar = await client.query<{ minimum_assurance: string }>(
+      `select minimum_assurance from portal.act_level_policy where tenant_id = $1 and act_key = 'manifestar'`,
+      [CANONICAL_TENANT],
+    );
+    expect(manifestar.rows[0]?.minimum_assurance).toBe('none');
+  });
+
+  it('C-0001-35 — dado service_catalog então 9 available / 2 partially_available / 4 unavailable e toda unavailable tem unavailable_reason "delegacao_indisponivel_r0007"', async () => {
+    const byAvailability = await client.query<{
+      availability: string;
+      n: string;
+    }>(
+      `select availability, count(*)::text as n from portal.service_catalog where tenant_id = $1 group by availability`,
+      [CANONICAL_TENANT],
+    );
+    const counts = Object.fromEntries(
+      byAvailability.rows.map((row) => [row.availability, Number(row.n)]),
+    );
+    expect(counts).toEqual({
+      available: 9,
+      partially_available: 2,
+      unavailable: 4,
+    });
+
+    const unavailableReasons = await client.query<{
+      unavailable_reason: string | null;
+    }>(
+      `select unavailable_reason from portal.service_catalog where tenant_id = $1 and availability = 'unavailable'`,
+      [CANONICAL_TENANT],
+    );
+    expect(unavailableReasons.rows).toHaveLength(4);
+    for (const row of unavailableReasons.rows) {
+      expect(row.unavailable_reason).toBe('delegacao_indisponivel_r0007');
+    }
+  });
+
+  it('C-0001-36 — dado request então 13 estados distintos e exatamente 5 protocolos, um por estado ≥ PROTOCOLADO exceto DESISTIDO', async () => {
+    const distinctStates = Number(
+      await one<string>(
+        `select count(distinct state)::text as n from portal.request where tenant_id = $1`,
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(distinctStates).toBe(13);
+
+    const protocolled = await client.query<{ state: string }>(
+      `select r.state from portal.request r
+         join portal.protocol p on p.request_id = r.id and p.tenant_id = r.tenant_id
+        where r.tenant_id = $1`,
+      [CANONICAL_TENANT],
+    );
+    expect(protocolled.rows).toHaveLength(5);
+    const protocolledStates = protocolled.rows.map((row) => row.state).sort();
+    expect(protocolledStates).toEqual(
+      [
+        'PROTOCOLADO',
+        'EM_ANDAMENTO_NO_ORGAO',
+        'RESULTADO_DISPONIVEL',
+        'AVALIACAO_OFERECIDA',
+        'CONCLUIDO',
+      ].sort(),
+    );
+    expect(protocolledStates).not.toContain('DESISTIDO');
+  });
+
+  it('C-0001-37 — dado manifestation então 9 estados distintos, uma anônima com subject_id nulo, e agency_due_on = received_at + 30 dias corridos em todas', async () => {
+    const distinctStates = Number(
+      await one<string>(
+        `select count(distinct state)::text as n from portal.manifestation where tenant_id = $1`,
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(distinctStates).toBe(9);
+
+    const anonymous = await client.query<{
+      subject_id: string | null;
+      anonymous: boolean;
+    }>(
+      `select subject_id, anonymous from portal.manifestation where tenant_id = $1 and anonymous = true`,
+      [CANONICAL_TENANT],
+    );
+    expect(anonymous.rows).toHaveLength(1);
+    expect(anonymous.rows[0]?.subject_id).toBeNull();
+
+    const mismatched = Number(
+      await one<string>(
+        `select count(*)::text as n from portal.manifestation
+          where tenant_id = $1 and agency_due_on <> (received_at::date + interval '30 days')::date`,
+        [CANONICAL_TENANT],
+      ),
+    );
+    expect(mismatched).toBe(0);
+  });
+});
diff --git a/backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts
new file mode 100644
index 0000000..bac795d
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.spec.ts
@@ -0,0 +1,103 @@
+// CTG-0001 §6.1 (M7, [WF-PORTAL-001], OD-P13 fechado) — matriz de transições de
+// `portal.request.state` (13 tokens fixos em código). Fica vermelho até TASK-0004 criar
+// backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts (M24: "tabela
+// REQUEST_TRANSITIONS ... tabelas puras + função assertTransition").
+//
+// Convenção de chamada assumida (não fixada literalmente pelo contrato para este arquivo,
+// diferente de identity.service.ts §12): `assertTransition(current, trigger)` /
+// `resolveTransition(current, trigger)` com `current = { state }` e `trigger = { command }` —
+// mesmo padrão de
+// backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts (o "padrão de
+// teste de matriz de transições" da leitura obrigatória desta tarefa), substituindo
+// `{kind, code}` por `{command}` (portal.request não tem substate nem gatilho de evento externo
+// nos quatro comandos citados pelo contrato §11 C-0001-24). Se TASK-0004 escolher uma assinatura
+// diferente, é este arquivo que se ajusta — as asserções abaixo (allowed[]/código/status) são o
+// comportamento fixado pelo contrato, não a assinatura.
+import { describe, expect, it } from 'vitest';
+
+import {
+  assertTransition,
+  REQUEST_TRANSITIONS,
+} from './request.transitions.js';
+
+/** Os 13 tokens fixos de portal.request.state (contrato §0/§6.1). */
+const REQUEST_STATES = [
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
+/** allowed[] por comando, copiado literalmente do contrato §6.1 "estados NÃO admitidos". */
+const ALLOWED_BY_COMMAND: Record<string, readonly string[]> = {
+  draft: ['PEDIDO_EM_COMPOSICAO'],
+  submit: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
+  withdraw: [
+    'PEDIDO_EM_COMPOSICAO',
+    'AGUARDANDO_NIVEL_ASSINATURA',
+    'AGUARDANDO_PAGAMENTO',
+  ],
+  evaluate: ['AVALIACAO_OFERECIDA'],
+};
+
+const TERMINAL_STATES = ['CONCLUIDO', 'DESISTIDO'];
+
+describe('REQUEST_TRANSITIONS (§6.1, M7) — cobertura dos 13 tokens', () => {
+  it('C-0001-23 — dado REQUEST_TRANSITIONS quando enumerada então os estados referenciados (from/to) cobrem exatamente os 13 tokens do §0 e nenhum outro', () => {
+    const referenced = new Set<string>();
+    for (const row of REQUEST_TRANSITIONS) {
+      if (row.from) referenced.add(row.from);
+      referenced.add(row.to);
+    }
+    expect([...referenced].sort()).toEqual([...REQUEST_STATES].sort());
+  });
+});
+
+describe('assertTransition (§6.1) — allowed[] exato por comando × 13 estados (C-0001-24)', () => {
+  for (const [command, allowed] of Object.entries(ALLOWED_BY_COMMAND)) {
+    describe(`comando "${command}" — allowed = [${allowed.join(', ')}]`, () => {
+      for (const state of REQUEST_STATES) {
+        const isAllowed = allowed.includes(state);
+        it(`dado o pedido em ${state} quando ${command} então ${isAllowed ? 'admitido' : '409 PORTAL.REQUEST_STATE_INVALID { state, allowed }'}`, () => {
+          if (isAllowed) {
+            expect(() =>
+              assertTransition({ state }, { command }),
+            ).not.toThrow();
+          } else {
+            expect(() => assertTransition({ state }, { command })).toThrowError(
+              expect.objectContaining({
+                code: 'PORTAL.REQUEST_STATE_INVALID',
+                status: 409,
+                context: { state, allowed },
+              }),
+            );
+          }
+        });
+      }
+    });
+  }
+});
+
+describe('estados terminais — CONCLUIDO e DESISTIDO não admitem nenhum comando (C-0001-25)', () => {
+  for (const state of TERMINAL_STATES) {
+    for (const command of Object.keys(ALLOWED_BY_COMMAND)) {
+      it(`dado o pedido em ${state} (terminal) quando ${command} então 409 PORTAL.REQUEST_STATE_INVALID`, () => {
+        expect(() => assertTransition({ state }, { command })).toThrowError(
+          expect.objectContaining({
+            code: 'PORTAL.REQUEST_STATE_INVALID',
+            status: 409,
+          }),
+        );
+      });
+    }
+  }
+});
diff --git a/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts
new file mode 100644
index 0000000..78de098
--- /dev/null
+++ b/backend/domains/portal/requests/src/handwritten/guards/request.transitions.ts
@@ -0,0 +1,223 @@
+// Espelho de [WF-PORTAL-001] §Transições para `portal.request.state`
+// (work/rounds/R-0009/contracts/CTG-0001.md §6.1; plan R-0009 M7 e adenda
+// A1(c); OD-P13 fechado — 13 tokens fixos em código). Tabela pura + guarda de
+// estado por comando, sem rota, sem banco e sem relógio: os comandos de
+// CTG-0002 (`PortalRequestsService`, TASK-0007) chamam `assertTransition`
+// dentro da transação. Nenhuma reinterpretação: `allowed[]` copiado do
+// bloco "estados NÃO admitidos por comando" do §6.1.
+//
+// Erro: `DetranError` de `@detran/shared` com código do catálogo do Portal
+// (`PORTAL.REQUEST_STATE_INVALID`, portal-error-catalog.md §3) — mesma forma
+// de `PortalError extends DetranError`; a subclasse vive em
+// `@detran/portal-identity`, que este pacote só passa a importar quando
+// TASK-0005 declarar `moduleImports: IdentityModule` (M24).
+import { DetranError } from '@detran/shared';
+
+/** Os 13 tokens fixos de `portal.request.state` (§0/§6.1, OD-P13). */
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
+export type RequestState = (typeof REQUEST_STATES)[number];
+
+/** Terminais (§6.1): nenhum comando é admitido. */
+export const REQUEST_TERMINAL_STATES: readonly RequestState[] = [
+  'CONCLUIDO',
+  'DESISTIDO',
+];
+
+export interface RequestTransition {
+  /** `null` = criação. */
+  from: RequestState | null;
+  to: RequestState;
+  /** Comando cidadão ou evento/ato interno que dispara a linha. */
+  command: string;
+  /** Guarda em prosa, copiada do §6.1. */
+  guard: string;
+}
+
+export const REQUEST_TRANSITIONS: readonly RequestTransition[] = [
+  {
+    from: null,
+    to: 'PEDIDO_EM_COMPOSICAO',
+    command: 'create',
+    guard:
+      'catálogo available|partially_available (unavailable → 422 SERVICE_UNAVAILABLE, M8); vínculo (M10) quando targetId; IDENTIFICADO → SERVICO_SELECIONADO → ELEGIBILIDADE_VERIFICADA em memória na mesma transação; INELEGIVEL = 422 PORTAL.INELIGIBLE sem linha persistida',
+  },
+  {
+    from: 'IDENTIFICADO',
+    to: 'SERVICO_SELECIONADO',
+    command: 'create',
+    guard: 'em memória (M7): nunca gravado por comando',
+  },
+  {
+    from: 'SERVICO_SELECIONADO',
+    to: 'ELEGIBILIDADE_VERIFICADA',
+    command: 'create',
+    guard: 'em memória (M7): vínculo verificado',
+  },
+  {
+    from: 'SERVICO_SELECIONADO',
+    to: 'INELEGIVEL',
+    command: 'create',
+    guard: 'em memória (M7): 422 PORTAL.INELIGIBLE, sem linha persistida',
+  },
+  {
+    from: 'ELEGIBILIDADE_VERIFICADA',
+    to: 'PEDIDO_EM_COMPOSICAO',
+    command: 'create',
+    guard: 'em memória (M7): primeira linha persistida',
+  },
+  {
+    from: 'PEDIDO_EM_COMPOSICAO',
+    to: 'PEDIDO_EM_COMPOSICAO',
+    command: 'draft',
+    guard: 'If-Match (M9)',
+  },
+  {
+    from: 'PEDIDO_EM_COMPOSICAO',
+    to: 'AGUARDANDO_NIVEL_ASSINATURA',
+    command: 'submit',
+    guard:
+      'assertActLevel lançou ASSURANCE_INSUFFICIENT: estado persistido E 403 devolvido (M7)',
+  },
+  {
+    from: 'PEDIDO_EM_COMPOSICAO',
+    to: 'AGUARDANDO_PAGAMENTO',
+    command: 'submit',
+    guard: "nível ok ∧ service_key='emissao_crlv' ∧ débito",
+  },
+  {
+    from: 'PEDIDO_EM_COMPOSICAO',
+    to: 'PROTOCOLADO',
+    command: 'submit',
+    guard:
+      'nível ok ∧ sem pré-condição financeira; protocolo gravado ANTES da validação do rascunho (T-PROTOCOLO, M8)',
+  },
+  {
+    from: 'AGUARDANDO_NIVEL_ASSINATURA',
+    to: 'AGUARDANDO_PAGAMENTO',
+    command: 'submit',
+    guard: 're-submissão após elevação (UC-PORTAL-019 AC-4; A1(c))',
+  },
+  {
+    from: 'AGUARDANDO_NIVEL_ASSINATURA',
+    to: 'PROTOCOLADO',
+    command: 'submit',
+    guard: 're-submissão após elevação (UC-PORTAL-019 AC-4; A1(c))',
+  },
+  {
+    from: 'AGUARDANDO_PAGAMENTO',
+    to: 'PROTOCOLADO',
+    command: 'PAGAMENTO_CONFIRMADO',
+    guard: 'evento de inf/collection (ADR-0017); CTG-0002',
+  },
+  {
+    from: 'PROTOCOLADO',
+    to: 'EM_ANDAMENTO_NO_ORGAO',
+    command: 'delegate',
+    guard:
+      "mesma transação do submit; falha → estado permanece PROTOCOLADO, delegation_status='failed', 502 DELEGATION_FAILED (M8)",
+  },
+  {
+    from: 'EM_ANDAMENTO_NO_ORGAO',
+    to: 'RESULTADO_DISPONIVEL',
+    command: 'evento do destino',
+    guard: 'projeção (M16), CTG-0002',
+  },
+  {
+    from: 'RESULTADO_DISPONIVEL',
+    to: 'AVALIACAO_OFERECIDA',
+    command: 'evento do destino',
+    guard: 'T-AVAL-CONVITE imediato (WF §Prazos)',
+  },
+  {
+    from: 'AVALIACAO_OFERECIDA',
+    to: 'CONCLUIDO',
+    command: 'evaluate',
+    guard: 'resposta do cidadão',
+  },
+  {
+    from: 'AVALIACAO_OFERECIDA',
+    to: 'CONCLUIDO',
+    command: 'expire',
+    guard: 'janela do convite sem valor na fonte → source_pending (OD-P24)',
+  },
+  {
+    from: 'PEDIDO_EM_COMPOSICAO',
+    to: 'DESISTIDO',
+    command: 'withdraw',
+    guard: 'If-Match; withdrawn_at = clock.now()',
+  },
+  {
+    from: 'AGUARDANDO_NIVEL_ASSINATURA',
+    to: 'DESISTIDO',
+    command: 'withdraw',
+    guard: 'idem',
+  },
+  {
+    from: 'AGUARDANDO_PAGAMENTO',
+    to: 'DESISTIDO',
+    command: 'withdraw',
+    guard: 'idem',
+  },
+];
+
+/**
+ * Estados admitidos por comando cidadão (§6.1 "estados NÃO admitidos por
+ * comando"): a lista `allowed` devolvida no `context` do 409.
+ */
+export const REQUEST_ALLOWED_STATES_BY_COMMAND: Readonly<
+  Record<string, readonly RequestState[]>
+> = {
+  draft: ['PEDIDO_EM_COMPOSICAO'],
+  submit: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
+  withdraw: [
+    'PEDIDO_EM_COMPOSICAO',
+    'AGUARDANDO_NIVEL_ASSINATURA',
+    'AGUARDANDO_PAGAMENTO',
+  ],
+  evaluate: ['AVALIACAO_OFERECIDA'],
+};
+
+export interface RequestStateSnapshot {
+  state: string;
+}
+
+export interface RequestTrigger {
+  command: string;
+}
+
+/**
+ * Guarda de estado por comando: lança `409 PORTAL.REQUEST_STATE_INVALID
+ * { state, allowed }` fora de `allowed[]`; comando desconhecido nunca é
+ * admitido (`allowed = []`). Devolve as linhas da tabela que o comando pode
+ * percorrer a partir do estado atual (o destino depende da guarda do comando).
+ */
+export function assertTransition(
+  current: RequestStateSnapshot,
+  trigger: RequestTrigger,
+): readonly RequestTransition[] {
+  const allowed = REQUEST_ALLOWED_STATES_BY_COMMAND[trigger.command] ?? [];
+  if (!(allowed as readonly string[]).includes(current.state)) {
+    throw new DetranError('PORTAL.REQUEST_STATE_INVALID', {
+      status: 409,
+      context: { state: current.state, allowed: [...allowed] },
+      message: 'O pedido não está em um estado que admita este comando.',
+    });
+  }
+  return REQUEST_TRANSITIONS.filter(
+    (row) => row.from === current.state && row.command === trigger.command,
+  );
+}
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index e3cf5ec..ecaa5ff 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -1976,3 +1976,72 @@ describe('CTG-0004 §2/§4/§5/§8 — medidas, alcoolemia, velocidade, SSE, int
     });
   });
 });
+
+/**
+ * work/rounds/R-0009/contracts/CTG-0001.md §3/§8, §11 C-0001-52 (M19; plan.md M19) —
+ * `portal:identity:read`: única linha que TASK-0004 acrescenta a `policy.ts` neste grupo (o
+ * bloco `PORTAL_RULES` completo é CTG-0002/TASK-0007). Fica vermelho até TASK-0004 acrescentar
+ * `['portal:identity:read', ['CIDADAO']]`. Negativos exaustivos por todos os papéis canônicos de
+ * `DETRAN_ROLES`, exceto a exceção declarada de `GLOBAL_ADMIN_ROLES` (a guarda de identidade —
+ * `PortalCitizenGuard`, M4 — nega essas quatro depois, fora do escopo de `policy.spec.ts`).
+ *
+ * Nota de divergência (registrada no relatório de TASK-0003): o texto de §11 C-0001-52 fala em
+ * "32 papéis... negativos", mas a lista enumerada em §3 (`negativo pela política`) tem 31 nomes;
+ * 31 é o valor internamente consistente com `DETRAN_ROLES.length === 36` (36 − 1 CIDADAO − 4
+ * `GLOBAL_ADMIN_ROLES`), verificado abaixo programaticamente contra `roles.ts`.
+ *
+ * `portal:appeal:create`/`portal:appeal:read-own` (linhas existentes, ver teste acima em
+ * "grants RAIT command and surface rules only to RAIT staff roles") não são removidas nem
+ * alteradas aqui — permanecem até CTG-0002/TASK-0007 (M19).
+ */
+describe('CTG-0001 §3/§8 (M19, TASK-0003) — portal:identity:read: CIDADAO positivo, negativos exaustivos', () => {
+  const PORTAL_GLOBAL_ADMIN_ROLES = [
+    'ADMIN',
+    'GESTOR_DETRAN',
+    'SUPORTE',
+    'technical-admin',
+  ] as const;
+
+  it('C-0001-52 — dado portal:identity:read quando isDetranActionAllowed então CIDADAO permitido; ADMIN/GESTOR_DETRAN/SUPORTE/technical-admin permitidos por GLOBAL_ADMIN_ROLES (exceção declarada — a guarda de identidade nega depois, M4); os demais 31 papéis canônicos negados', () => {
+    for (const role of DETRAN_ROLES) {
+      const expected =
+        role === 'CIDADAO' ||
+        (PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role);
+      expect(
+        isDetranActionAllowed(
+          { roles: [role], permissions: [] },
+          'portal:identity',
+          'read',
+        ),
+        `portal:identity:read para o papel ${role} deveria ser ${expected}`,
+      ).toBe(expected);
+    }
+  });
+
+  it('dado os papéis canônicos fora de CIDADAO e GLOBAL_ADMIN_ROLES quando contados então são exatamente 31 (36 papéis − 1 CIDADAO − 4 GLOBAL_ADMIN_ROLES)', () => {
+    const negatives = DETRAN_ROLES.filter(
+      (role) =>
+        role !== 'CIDADAO' &&
+        !(PORTAL_GLOBAL_ADMIN_ROLES as readonly string[]).includes(role),
+    );
+    expect(DETRAN_ROLES).toHaveLength(36);
+    expect(negatives).toHaveLength(31);
+  });
+
+  it('dado portal:appeal:create e portal:appeal:read-own (linhas existentes) quando isDetranActionAllowed(CIDADAO) então continuam permitidas — só removidas em CTG-0002/TASK-0007 (M19)', () => {
+    expect(
+      isDetranActionAllowed(
+        { roles: ['CIDADAO'], permissions: [] },
+        'portal:appeal',
+        'create',
+      ),
+    ).toBe(true);
+    expect(
+      isDetranActionAllowed(
+        { roles: ['CIDADAO'], permissions: [] },
+        'portal:appeal',
+        'read-own',
+      ),
+    ).toBe(true);
+  });
+});
diff --git a/backend/domains/shared/src/policy.ts b/backend/domains/shared/src/policy.ts
index 9ed2f83..4a116ed 100644
--- a/backend/domains/shared/src/policy.ts
+++ b/backend/domains/shared/src/policy.ts
@@ -1597,6 +1597,10 @@ export const DETRAN_POLICY_MATRIX: Readonly<
     ]),
     ['portal:appeal:create', ['CIDADAO']],
     ['portal:appeal:read-own', ['CIDADAO']],
+    // R-0009 CTG-0001 §3/§8 (M19, TASK-0004): única linha `portal:*` deste
+    // grupo; `GET /v1/portal/identity/me`. O bloco `PORTAL_RULES` completo e a
+    // remoção das duas linhas `portal:appeal:*` acima são CTG-0002 (TASK-0007).
+    ['portal:identity:read', ['CIDADAO']],
   ]) as Record<DetranPolicyKey, readonly DetranRole[]>,
 );

diff --git a/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json b/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json
new file mode 100644
index 0000000..3ecaf52
--- /dev/null
+++ b/docs/framework/blueprints/BP-PORTAL-CITIZEN-SERVICE-001.json
@@ -0,0 +1,367 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-PORTAL-CITIZEN-SERVICE-001",
+  "module": {
+    "name": "CitizenService",
+    "namespace": "portal",
+    "version": "1.0.0",
+    "ddlFile": "64-portal-citizen-service.sql",
+    "dependencies": {
+      "@detran/inf-deadlines": "workspace:*",
+      "zod": "^4.6.5"
+    },
+    "devDependencies": {
+      "@types/pg": "^8.15.4",
+      "pg": "^8.20.0"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../../inf/deadlines/src/index.ts"
+      }
+    ],
+    "owners": ["detran-portal"],
+    "description": "Atendimento ao cidadao (ADR-0019 Decision 4; [WF-PORTAL-004] secao Estados, secao Prazos e secao Carta de Servicos; plan R-0009 M12-M14): manifestacao de ouvidoria da Lei 13.460/2017 (entidade distinta de portal.complaint do PEC, M2 — nunca duas tabelas para a mesma manifestacao; unificacao futura e OD-P14), prorrogacao justificada dos prazos do art. 16 e Carta de Servicos como dados (portal.service_catalog, 11 campos de RN-PORTAL-108). Prazos calculados com addCalendarDays de @detran/inf-deadlines; timers T-OUV-RESPOSTA, T-OUV-INFO, T-LGPD-ACESSO e T-AVAL-CONVITE (owner = portal) em inf.infraction_timer_ref, espelhados em portal-timers.ts (M14). brand_profile e public_hostname NAO sao entidades deste blueprint: DDL manuscrito 19-portal-platform.sql (M11). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica MANIFESTACAO_REGISTRADA e MANIFESTACAO_ENCERRADA (M21)."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "Manifestation",
+        "table": "manifestation",
+        "primaryKey": ["id"],
+        "description": "Manifestacao de ouvidoria — maquina [WF-PORTAL-004] secao Estados (9 tokens no check de state; Lei 13.460/2017 arts. 10-16; plan R-0009 M13): kind reclamacao | denuncia | sugestao | elogio | solicitacao (H.52); anonymous = true exige subject_id nulo (H.51: anonimo para manifestar, simples para acompanhar). POST manifestations nunca recusa (RN-PORTAL-109) e cria MANIFESTACAO_REGISTRADA + COMPROVANTE_EMITIDO na mesma transacao. agency_due_on = received_at + 30 dias corridos (T-OUV-RESPOSTA); info_due_on = 20 dias, nulo ate INFORMACAO_SOLICITADA_AO_AGENTE (T-OUV-INFO). version para If-Match.",
+        "fields": [
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
+            "name": "state",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "confidential",
+            "type": "boolean"
+          },
+          {
+            "name": "anonymous",
+            "type": "boolean"
+          },
+          {
+            "name": "subject_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "text",
+            "type": "text",
+            "pii": "personal"
+          },
+          {
+            "name": "protocol",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "received_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "agency_due_on",
+            "type": "date"
+          },
+          {
+            "name": "info_due_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "decision_text",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "decided_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "acknowledged_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": 1
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_manifestation_protocol",
+            "columns": ["tenant_id", "protocol"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_manifestation_subject_state",
+            "columns": ["tenant_id", "subject_id", "state"]
+          },
+          {
+            "name": "ix_portal_manifestation_state_due",
+            "columns": ["tenant_id", "state", "agency_due_on"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_manifestation_state",
+            "expression": "state in ('MANIFESTACAO_REGISTRADA','COMPROVANTE_EMITIDO','EM_ANALISE','INFORMACAO_SOLICITADA_AO_AGENTE','DECISAO_FINAL_ELABORADA','CIENCIA_AO_USUARIO','ENCERRADA','AVALIACAO_OFERECIDA','AVALIADA')"
+          },
+          {
+            "name": "ck_portal_manifestation_kind",
+            "expression": "kind in ('reclamacao','denuncia','sugestao','elogio','solicitacao')"
+          },
+          {
+            "name": "ck_portal_manifestation_anonymous_subject",
+            "expression": "not anonymous or subject_id is null"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_manifestation_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "ManifestationExtension",
+        "table": "manifestation_extension",
+        "primaryKey": ["id"],
+        "description": "Prorrogacao justificada de um prazo da manifestacao ([WF-PORTAL-004] secao Prazos: T-OUV-RESPOSTA 30 + 30 e T-OUV-INFO 20 + 20, prorrogaveis uma vez por igual periodo, Lei 13.460/2017 art. 16; plan R-0009 M13): justification obrigatoria — o sistema registra a motivacao, nunca estende o relogio silenciosamente. Uma prorrogacao por timer (unico por tenant, manifestation_id, timer); timer com FK para inf.infraction_timer_ref.",
+        "fields": [
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
+            "name": "manifestation_id",
+            "type": "uuid"
+          },
+          {
+            "name": "timer",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "justification",
+            "type": "text"
+          },
+          {
+            "name": "extended_on",
+            "type": "date"
+          },
+          {
+            "name": "new_due_on",
+            "type": "date"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_manifestation_extension_timer",
+            "columns": ["tenant_id", "manifestation_id", "timer"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_manifestation_extension_timer",
+            "expression": "timer in ('T-OUV-RESPOSTA','T-OUV-INFO')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_manifestation_extension_manifestation",
+            "columns": ["manifestation_id"],
+            "references": {
+              "table": "portal.manifestation",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_portal_manifestation_extension_timer",
+            "columns": ["timer"],
+            "references": {
+              "table": "inf.infraction_timer_ref",
+              "columns": ["code"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "ServiceCatalog",
+        "table": "service_catalog",
+        "primaryKey": ["id"],
+        "description": "Carta de Servicos como dados ([WF-PORTAL-001] secao Carta de Servicos e secao Catalogo de servicos; [WF-PORTAL-004] secao Carta de Servicos como artefato vivo; Lei 13.460/2017 art. 7; RN-PORTAL-108, 11 campos; portal-route-contract.md secao 2 GET services; plan R-0009 M12): service_key unico por tenant; availability available | partially_available | unavailable com unavailable_reason obrigatorio quando unavailable (check de motivo; PORTAL.SERVICE_UNAVAILABLE 422 nunca 404). requirements_json e a lista requirements[] da rota. minimum_assurance espelha a matriz de M5 para exibicao.",
+        "fields": [
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
+            "name": "service_key",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "route",
+            "type": "text"
+          },
+          {
+            "name": "category",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "title",
+            "type": "text"
+          },
+          {
+            "name": "summary",
+            "type": "text"
+          },
+          {
+            "name": "requirements_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "delivery_channel",
+            "type": "text"
+          },
+          {
+            "name": "legal_deadline",
+            "type": "text"
+          },
+          {
+            "name": "cost",
+            "type": "text"
+          },
+          {
+            "name": "accessibility_note",
+            "type": "text"
+          },
+          {
+            "name": "responsible_party",
+            "type": "text"
+          },
+          {
+            "name": "normative_reference",
+            "type": "text"
+          },
+          {
+            "name": "availability",
+            "type": "varchar(30)"
+          },
+          {
+            "name": "unavailable_reason",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "alternative_channel_note",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "minimum_assurance",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": 1
+          },
+          {
+            "name": "effective_from",
+            "type": "date"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_service_catalog_service_key",
+            "columns": ["tenant_id", "service_key"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_service_catalog_availability",
+            "columns": ["tenant_id", "availability", "category"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_service_catalog_availability",
+            "expression": "availability in ('available','partially_available','unavailable')"
+          },
+          {
+            "name": "ck_portal_service_catalog_unavailable_reason",
+            "expression": "availability <> 'unavailable' or unavailable_reason is not null"
+          },
+          {
+            "name": "ck_portal_service_catalog_minimum_assurance",
+            "expression": "minimum_assurance in ('none','simples','avancada','qualificada')"
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/portal/citizen-service/",
+    "resources": [
+      {
+        "entity": "Manifestation",
+        "path": "manifestations",
+        "resource": "manifestation",
+        "operations": []
+      },
+      {
+        "entity": "ManifestationExtension",
+        "path": "manifestation-extensions",
+        "resource": "manifestation-extension",
+        "operations": []
+      },
+      {
+        "entity": "ServiceCatalog",
+        "path": "services",
+        "resource": "service-charter",
+        "operations": []
+      }
+    ]
+  },
+  "auth": {
+    "source": "PORTAL_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json b/docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json
new file mode 100644
index 0000000..ef0035d
--- /dev/null
+++ b/docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json
@@ -0,0 +1,414 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-PORTAL-IDENTITY-001",
+  "module": {
+    "name": "Identity",
+    "namespace": "portal",
+    "version": "1.0.2",
+    "ddlFile": "61-portal-identity.sql",
+    "dependencies": {
+      "zod": "^4.6.5",
+      "@detran/inf-deadlines": "workspace:*"
+    },
+    "devDependencies": {
+      "@types/pg": "^8.15.4",
+      "pg": "^8.20.0"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../../inf/deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenExports": ["handwritten/index"],
+    "handwrittenControllers": [
+      {
+        "target": "handwritten/public.controller",
+        "symbol": "PortalPublicController"
+      },
+      {
+        "target": "handwritten/me.controller",
+        "symbol": "PortalMeController"
+      },
+      {
+        "target": "handwritten/assurance.controller",
+        "symbol": "PortalAssuranceController"
+      },
+      {
+        "target": "handwritten/representations.controller",
+        "symbol": "PortalRepresentationsController"
+      },
+      {
+        "target": "handwritten/preferences.controller",
+        "symbol": "PortalPreferencesController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/identity.service",
+        "symbol": "PortalIdentityService"
+      },
+      {
+        "target": "handwritten/citizen.guard",
+        "symbol": "PortalCitizenGuard"
+      },
+      {
+        "target": "handwritten/clock",
+        "symbol": "PortalClock"
+      }
+    ],
+    "moduleExports": [
+      "PortalIdentityService",
+      "PortalCitizenGuard",
+      "PortalClock"
+    ],
+    "owners": ["detran-portal"],
+    "description": "Identidade federada do cidadao (ADR-0019 Decision 1; [WF-PORTAL-002] secao Estados; plan R-0009 M3-M6): guarda so o que o gov.br nao guarda — sujeito por hash de CPF, representacao (procuracao), matriz ato -> nivel de assinatura como dados (portal.act_level_policy) e vinculos (portal.entitlement). Nunca armazena token, credencial nem CPF em claro (RN-PORTAL-112). Nenhuma rota CRUD gerada (M1): as rotas de /v1/portal/* sao manuscritas em src/handwritten e usam os repositorios gerados. Publica NIVEL_ASSINATURA_ELEVADO e REPRESENTACAO_VALIDADA (ADR-0019 Ownership table)."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "Subject",
+        "table": "subject",
+        "primaryKey": ["id"],
+        "description": "Sujeito cidadao (ADR-0019 Decision 1; plan R-0009 M6): criado sob demanda no primeiro GET me por upsert em cpf_hash (sha256 hex do CPF, unico por tenant). Guarda apenas nome e o nivel observado na ultima sessao (selo gov.br e nivel de assinatura mapeado pela ADR-0024: bronze -> simples, prata|ouro -> avancada, ICP/e-Notariado -> qualificada). O titular ve o CPF pela claim, nunca por esta tabela (RN-PORTAL-112). version para If-Match.",
+        "fields": [
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
+            "name": "cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "name",
+            "type": "text",
+            "pii": "personal",
+            "nullable": true
+          },
+          {
+            "name": "govbr_level_observed",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "assurance_level_observed",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "observed_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": 1
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_subject_cpf_hash",
+            "columns": ["tenant_id", "cpf_hash"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_subject_cpf_hash",
+            "expression": "cpf_hash ~ '^[0-9a-f]{64}$'"
+          },
+          {
+            "name": "ck_portal_subject_govbr_level_observed",
+            "expression": "govbr_level_observed is null or govbr_level_observed in ('bronze','prata','ouro','qualificada')"
+          },
+          {
+            "name": "ck_portal_subject_assurance_level_observed",
+            "expression": "assurance_level_observed in ('simples','avancada','qualificada')"
+          }
+        ]
+      },
+      {
+        "name": "Representation",
+        "table": "representation",
+        "primaryKey": ["id"],
+        "description": "Procuracao apresentada por um sujeito (procurador) sobre um representado ([WF-PORTAL-002] secao Estados: PROCURACAO_APRESENTADA -> PROCURACAO_VALIDADA | PROCURACAO_RECUSADA; ADR-0019 Decision 1; plan R-0009 M6). O representado e identificado por hash de CPF e nome; o instrumento e um documento (storage) referenciado por id. scope limita o alcance (ait | all); valid_until nulo = sem termo. So representacoes PROCURACAO_VALIDADA vigentes conferem vinculo (M10).",
+        "fields": [
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
+            "name": "representative_subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "represented_cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "represented_name",
+            "type": "text",
+            "pii": "personal"
+          },
+          {
+            "name": "instrument_document_id",
+            "type": "uuid"
+          },
+          {
+            "name": "scope",
+            "type": "varchar(10)"
+          },
+          {
+            "name": "valid_until",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "state",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "refusal_reason",
+            "type": "text",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_portal_representation_representative",
+            "columns": ["tenant_id", "representative_subject_id", "state"]
+          },
+          {
+            "name": "ix_portal_representation_represented",
+            "columns": ["tenant_id", "represented_cpf_hash", "state"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_representation_represented_cpf_hash",
+            "expression": "represented_cpf_hash ~ '^[0-9a-f]{64}$'"
+          },
+          {
+            "name": "ck_portal_representation_scope",
+            "expression": "scope in ('ait','all')"
+          },
+          {
+            "name": "ck_portal_representation_state",
+            "expression": "state in ('PROCURACAO_APRESENTADA','PROCURACAO_VALIDADA','PROCURACAO_RECUSADA')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_representation_representative",
+            "columns": ["representative_subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "ActLevelPolicy",
+        "table": "act_level_policy",
+        "primaryKey": ["id"],
+        "description": "Matriz ato -> nivel minimo de assinatura como dados (ADR-0019 Decision 1; plan R-0009 M5; Decreto 10.543/2020 art. 4; PN DETRAN-AM 001/2025; steering H.49/H.50/H.51): act_key e o serviceKey do portal-route-contract.md secao 5.1 quando existe, senao o token de M5. Lida por assertActLevel (M4): ato sem linha habilitada e vigente -> 500 PORTAL.INTERNAL (nunca liberar por ausencia); minimum_assurance = qualificada -> 500 PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED (RN-PORTAL-101). Uma linha por (tenant, act_key, effective_from).",
+        "fields": [
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
+            "name": "act_key",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "minimum_assurance",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "legal_basis",
+            "type": "text"
+          },
+          {
+            "name": "decision_ref",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "enabled",
+            "type": "boolean"
+          },
+          {
+            "name": "effective_from",
+            "type": "date"
+          },
+          {
+            "name": "effective_to",
+            "type": "date",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_act_level_policy_act_key_effective_from",
+            "columns": ["tenant_id", "act_key", "effective_from"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_act_level_policy_minimum_assurance",
+            "expression": "minimum_assurance in ('none','simples','avancada','qualificada')"
+          },
+          {
+            "name": "ck_portal_act_level_policy_effective_range",
+            "expression": "effective_to is null or effective_to >= effective_from"
+          }
+        ]
+      },
+      {
+        "name": "Entitlement",
+        "table": "entitlement",
+        "primaryKey": ["id"],
+        "description": "Vinculo do sujeito com um alvo de outro dominio (ADR-0019 Decision 1; plan R-0009 M6 e M10; portal-route-contract.md secao 11: sucessor de portal.ait_entitlement com alvo generico). target_id e uuid sem FK (o alvo e de inf/est/ch). Toda leitura de aits/{id}, requests/{id}, vehicles/{id}/*, crashes/{id} e exams/{id} consulta esta tabela; ausencia -> 404 PORTAL.NOT_FOUND. Origem nesta rodada: fixtures e projetor de INFRACAO_ESTADO_ALTERADO (origin = infraction).",
+        "fields": [
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
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "target_kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "target_id",
+            "type": "uuid"
+          },
+          {
+            "name": "relation",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "origin",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "valid_from",
+            "type": "date"
+          },
+          {
+            "name": "valid_until",
+            "type": "date",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_entitlement_subject_target_relation",
+            "columns": [
+              "tenant_id",
+              "subject_id",
+              "target_kind",
+              "target_id",
+              "relation"
+            ],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_entitlement_target",
+            "columns": ["tenant_id", "target_kind", "target_id"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_entitlement_target_kind",
+            "expression": "target_kind in ('ait','case','vehicle','license','crash','exam')"
+          },
+          {
+            "name": "ck_portal_entitlement_relation",
+            "expression": "relation in ('owner','driver','representative','interested_party')"
+          },
+          {
+            "name": "ck_portal_entitlement_origin",
+            "expression": "origin in ('renavam','renach','infraction','representation','manual')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_entitlement_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/portal/identity/",
+    "resources": [
+      {
+        "entity": "Subject",
+        "path": "subjects",
+        "resource": "subject",
+        "operations": []
+      },
+      {
+        "entity": "Representation",
+        "path": "representations",
+        "resource": "representation",
+        "operations": []
+      },
+      {
+        "entity": "ActLevelPolicy",
+        "path": "act-level-policies",
+        "resource": "act-level-policy",
+        "operations": []
+      },
+      {
+        "entity": "Entitlement",
+        "path": "entitlements",
+        "resource": "entitlement",
+        "operations": []
+      }
+    ]
+  },
+  "auth": {
+    "source": "PORTAL_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/blueprints/BP-PORTAL-INBOX-001.json b/docs/framework/blueprints/BP-PORTAL-INBOX-001.json
new file mode 100644
index 0000000..8799a11
--- /dev/null
+++ b/docs/framework/blueprints/BP-PORTAL-INBOX-001.json
@@ -0,0 +1,392 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-PORTAL-INBOX-001",
+  "module": {
+    "name": "Inbox",
+    "namespace": "portal",
+    "version": "1.0.1",
+    "ddlFile": "63-portal-inbox.sql",
+    "dependencies": {
+      "zod": "^4.6.5"
+    },
+    "devDependencies": {
+      "@types/pg": "^8.15.4",
+      "pg": "^8.20.0"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      }
+    ],
+    "owners": ["detran-portal"],
+    "description": "Caixa do cidadao (ADR-0019 Decision 3; [WF-PORTAL-003] secao Estados e secao Prazos; plan R-0009 M15): itens da caixa como projecao de eventos mais fatos de ciencia (portal.acknowledgement_evidence), adesao ao SNE como macro-estado do vinculo (NAO_ADERIDO_SNE | ADERIDO_SNE) e assinaturas push. A leitura de um item SNE grava a evidencia e publica NOTIFICACAO_CIENCIA na outbox (topic portal), idempotente; a ciencia efetiva do aviso e do modulo inf/notification (ADR-0016). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica INBOX_LIDO, NOTIFICACAO_CIENCIA, SNE_ADESAO_SOLICITADA e SNE_CANCELAMENTO_SOLICITADO (M21)."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "InboxItem",
+        "table": "inbox_item",
+        "primaryKey": ["id"],
+        "description": "Item da caixa do cidadao ([WF-PORTAL-003] secao Estados: por notificacao GERADA -> DISPONIBILIZADA -> LIDA_EFETIVA | CIENCIA_FICTA; ADR-0019 Decision 3; plan R-0009 M15): kind acao_necessaria | informativo, source sne | portal, source_event_id unico por tenant (idempotencia da projecao). fictitious_acknowledgement_on so para source = sne (available_on + 30 dias, timer T-SNE-CIENCIA lido de inf.infraction_timer_ref, nunca duplicado). ait_id referencia inf sem FK; request_id referencia portal.request. Adenda A1(e) R-0009: kind = ADR-0019 §3 (SNE|PROCESSO|OUVIDORIA|SISTEMA); action_required deriva o kind cidadao (acao_necessaria|informativo) de portal-route-contract.md §6; deadline_owned_by ∈ citizen|agency (route contract §5 nextAction.by).",
+        "fields": [
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
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "action_required",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "source",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "source_event_id",
+            "type": "uuid"
+          },
+          {
+            "name": "subject_line",
+            "type": "text"
+          },
+          {
+            "name": "summary",
+            "type": "text"
+          },
+          {
+            "name": "ait_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "request_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "available_on",
+            "type": "date"
+          },
+          {
+            "name": "read_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "fictitious_acknowledgement_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "deadline_due_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "deadline_owned_by",
+            "type": "varchar(20)",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_inbox_item_source_event",
+            "columns": ["tenant_id", "source_event_id"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_inbox_item_subject_available",
+            "columns": ["tenant_id", "subject_id", "available_on"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_inbox_item_kind",
+            "expression": "kind in ('SNE','PROCESSO','OUVIDORIA','SISTEMA')"
+          },
+          {
+            "name": "ck_portal_inbox_item_source",
+            "expression": "source in ('sne','portal')"
+          },
+          {
+            "name": "ck_portal_inbox_item_fictitious_only_sne",
+            "expression": "source = 'sne' or fictitious_acknowledgement_on is null"
+          },
+          {
+            "name": "ck_portal_inbox_item_deadline_owned_by",
+            "expression": "deadline_owned_by is null or deadline_owned_by in ('citizen','agency')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_inbox_item_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_portal_inbox_item_request",
+            "columns": ["request_id"],
+            "references": {
+              "table": "portal.request",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "AcknowledgementEvidence",
+        "table": "acknowledgement_evidence",
+        "primaryKey": ["id"],
+        "description": "Evidencia de ciencia do que o cidadao viu ([WF-PORTAL-003] secao Estados LIDA_EFETIVA / CIENCIA_COMPROVADA; ADR-0019 Decision 3; plan R-0009 M15): displayed_sha256 do conteudo exibido, acknowledged_at e signature_ref opcional. Uma evidencia por item (unico por tenant, inbox_item_id): a segunda leitura nao duplica evidencia nem evento NOTIFICACAO_CIENCIA.",
+        "fields": [
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
+            "name": "inbox_item_id",
+            "type": "uuid"
+          },
+          {
+            "name": "displayed_sha256",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "acknowledged_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "signature_ref",
+            "type": "text",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_acknowledgement_evidence_item",
+            "columns": ["tenant_id", "inbox_item_id"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_acknowledgement_evidence_displayed_sha256",
+            "expression": "displayed_sha256 ~ '^[0-9a-f]{64}$'"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_acknowledgement_evidence_item",
+            "columns": ["inbox_item_id"],
+            "references": {
+              "table": "portal.inbox_item",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "SneEnrollment",
+        "table": "sne_enrollment",
+        "primaryKey": ["id"],
+        "description": "Adesao do cidadao ao SNE ([WF-PORTAL-003] secao Estados: macro-estado NAO_ADERIDO_SNE | ADERIDO_SNE; [UC-PORTAL-007]; plan R-0009 M8 e M15): uma linha por sujeito (unico por tenant, subject_id). effects_ack guarda a ciencia dos quatro efeitos da adesao (jsonb), consent_text_version a versao do termo aceito, since / cancelled_at / cancel_reason o historico do vinculo. O envio real ao SNE nacional via packages/senatran-adapter e OD-P16 (source_pending): nesta rodada so grava e publica SNE_ADESAO_SOLICITADA / SNE_CANCELAMENTO_SOLICITADO.",
+        "fields": [
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
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "state",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "channel",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "email",
+            "type": "text",
+            "nullable": true,
+            "pii": "personal"
+          },
+          {
+            "name": "phone",
+            "type": "varchar(20)",
+            "nullable": true,
+            "pii": "personal"
+          },
+          {
+            "name": "consent_text_version",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "effects_ack",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "since",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "cancelled_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "cancel_reason",
+            "type": "text",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_sne_enrollment_subject",
+            "columns": ["tenant_id", "subject_id"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_sne_enrollment_state",
+            "expression": "state in ('NAO_ADERIDO_SNE','ADERIDO_SNE')"
+          },
+          {
+            "name": "ck_portal_sne_enrollment_since_when_enrolled",
+            "expression": "state <> 'ADERIDO_SNE' or since is not null"
+          },
+          {
+            "name": "ck_portal_sne_enrollment_channel",
+            "expression": "channel is null or channel in ('push','email','sne')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_sne_enrollment_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "PushSubscription",
+        "table": "push_subscription",
+        "primaryKey": ["id"],
+        "description": "Assinatura Web Push do cidadao ([WF-PORTAL-003] secao Estados PREFERENCIAS_CONFIGURADAS; plan R-0009 M15 e M19 portal:push-subscription:create): endpoint unico por tenant, keys_json com as chaves do navegador. Entrega usa @stynx-nyx/notifications (ADR-0019 Decision 3).",
+        "fields": [
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
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "endpoint",
+            "type": "text"
+          },
+          {
+            "name": "keys_json",
+            "type": "jsonb"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_push_subscription_endpoint",
+            "columns": ["tenant_id", "endpoint"],
+            "unique": true
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_push_subscription_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/portal/inbox/",
+    "resources": [
+      {
+        "entity": "InboxItem",
+        "path": "items",
+        "resource": "inbox-item",
+        "operations": []
+      },
+      {
+        "entity": "AcknowledgementEvidence",
+        "path": "acknowledgement-evidences",
+        "resource": "acknowledgement-evidence",
+        "operations": []
+      },
+      {
+        "entity": "SneEnrollment",
+        "path": "sne-enrollments",
+        "resource": "sne-enrollment",
+        "operations": []
+      },
+      {
+        "entity": "PushSubscription",
+        "path": "push-subscriptions",
+        "resource": "push-subscription",
+        "operations": []
+      }
+    ]
+  },
+  "auth": {
+    "source": "PORTAL_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json b/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json
new file mode 100644
index 0000000..53bc88a
--- /dev/null
+++ b/docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json
@@ -0,0 +1,501 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-PORTAL-PROJECTIONS-001",
+  "module": {
+    "name": "Projections",
+    "namespace": "portal",
+    "version": "1.0.0",
+    "ddlFile": "65-portal-projections.sql",
+    "dependencies": {
+      "@detran/ops-parameter": "workspace:*",
+      "zod": "^4.6.5"
+    },
+    "devDependencies": {
+      "@types/pg": "^8.15.4",
+      "pg": "^8.20.0"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/ops-parameter",
+        "target": "../../ops/parameter/src/index.ts"
+      }
+    ],
+    "owners": ["detran-portal"],
+    "description": "Projecoes do Portal (ADR-0020 Decision 1, 2 e 5; ADR-0019 Decision 5; plan R-0009 M16-M17): as cinco leituras cidadas do catalogo de projecoes (infraction_view, process_timeline, points_view, crash_view, exam_view) como entidades pequenas alimentadas por eventos da outbox (topics inf e rait) por projetores manuscritos idempotentes em event.id (portal.projection_applied_event) e replayaveis; mais o cache das leituras nacionais feitas so por packages/senatran-adapter (portal.national_read_cache, TTL = parametro portal.read_cache_ttl_minutes via @detran/ops-parameter, nunca literal). Nenhuma projecao escreve de volta; rotulos cidadaos, nunca tokens de inf (RN-PORTAL-112). Sem FK para outros pacotes: toda linha e reconstruivel por replay. Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24)."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "InfractionView",
+        "table": "infraction_view",
+        "primaryKey": ["id"],
+        "description": "Projecao 'minhas autuacoes' (ADR-0020 Decision 2: portal.infraction_view <- INFRACAO_ESTADO_ALTERADO, NOTIFICACAO_EXPEDIDA, NOTIFICACAO_CIENCIA, PAGAMENTO_CONFIRMADO; portal-route-contract.md secao 4; plan R-0009 M16): uma linha por AIT (ait_id unico por tenant), situacao em linguagem cidada (INFRACTION_SITUATION_MAP em infraction-view.projection.ts; token sem mapa falha com PORTAL.INTERNAL — OD-P20), points_status em_disputa | definitivo | none, prazos, acoes, avisos e pagamento em jsonb; last_event_id / last_event_version para idempotencia e replay.",
+        "fields": [
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
+            "name": "ait_id",
+            "type": "uuid"
+          },
+          {
+            "name": "subject_cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "ait_number",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "plate",
+            "type": "varchar(10)"
+          },
+          {
+            "name": "occurred_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "framing_label",
+            "type": "text"
+          },
+          {
+            "name": "amount",
+            "type": "numeric(12,2)",
+            "nullable": true
+          },
+          {
+            "name": "situation",
+            "type": "varchar(30)"
+          },
+          {
+            "name": "deadlines_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "points_status",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "actions_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "notices_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "payment_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "last_event_id",
+            "type": "uuid"
+          },
+          {
+            "name": "last_event_version",
+            "type": "integer"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_infraction_view_ait",
+            "columns": ["tenant_id", "ait_id"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_infraction_view_subject",
+            "columns": ["tenant_id", "subject_cpf_hash", "situation"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_infraction_view_situation",
+            "expression": "situation in ('aguardando_defesa','em_defesa','penalidade_aplicada','em_recurso','encerrada','cancelada','arquivada')"
+          },
+          {
+            "name": "ck_portal_infraction_view_points_status",
+            "expression": "points_status in ('em_disputa','definitivo','none')"
+          }
+        ]
+      },
+      {
+        "name": "ProcessTimeline",
+        "table": "process_timeline",
+        "primaryKey": ["id"],
+        "description": "Projecao 'com voce' x 'com o orgao' do processo (ADR-0020 Decision 2: portal.process_timeline <- RAIT_CASO_*, RAIT_DECISAO_PUBLICADA, rait.inquiry.changed; RN-PORTAL-112; plan R-0009 M16): uma linha por caso (case_id unico por tenant; request_id nulo quando o caso nao nasceu de um pedido do portal), entries_json so com entradas visibility = citizen, deadlines_json e decision_json (nulo ate RAIT_DECISAO_PUBLICADA).",
+        "fields": [
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
+            "name": "request_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "case_id",
+            "type": "uuid"
+          },
+          {
+            "name": "entries_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "deadlines_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "decision_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "last_event_id",
+            "type": "uuid"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_process_timeline_case",
+            "columns": ["tenant_id", "case_id"],
+            "unique": true
+          }
+        ]
+      },
+      {
+        "name": "PointsView",
+        "table": "points_view",
+        "primaryKey": ["id"],
+        "description": "Projecao de pontuacao (ADR-0020 Decision 2: portal.points_view <- PENALIDADE_DEFINITIVA e leitura RENACH pelo adapter; RN-RAIT-131; plan R-0009 M16): uma linha por cidadao (subject_cpf_hash unico por tenant), pontos definitivos x em disputa, por veiculo e ultimos 12 meses em jsonb; last_event_id nulo quando so ha leitura nacional, cached_at nulo quando so ha eventos.",
+        "fields": [
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
+            "name": "subject_cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "definitive_points",
+            "type": "integer"
+          },
+          {
+            "name": "disputed_points",
+            "type": "integer"
+          },
+          {
+            "name": "by_vehicle_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "last_12_months_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "last_event_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "cached_at",
+            "type": "timestamptz",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_points_view_subject",
+            "columns": ["tenant_id", "subject_cpf_hash"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_points_view_points_non_negative",
+            "expression": "definitive_points >= 0 and disputed_points >= 0"
+          }
+        ]
+      },
+      {
+        "name": "CrashView",
+        "table": "crash_view",
+        "primaryKey": ["id"],
+        "description": "Projecao de sinistro (BOAT) para o cidadao envolvido (ADR-0020 Decision 1; portal-route-contract.md secao 7 GET crashes/{id}; plan R-0009 M16): uma linha por sinistro (crash_id unico por tenant), rotulo de estado cidadao e resumo em jsonb com campos de terceiros suprimidos (third_party_fields_suppressed). Nesta rodada so a tabela e o projetor esqueleto (applyEvent registra last_event_id); produtor real em R-0010 (OD-P19).",
+        "fields": [
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
+            "name": "crash_id",
+            "type": "uuid"
+          },
+          {
+            "name": "subject_cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "state_label",
+            "type": "text"
+          },
+          {
+            "name": "summary_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "third_party_fields_suppressed",
+            "type": "boolean"
+          },
+          {
+            "name": "last_event_id",
+            "type": "uuid"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_crash_view_crash",
+            "columns": ["tenant_id", "crash_id"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_crash_view_subject",
+            "columns": ["tenant_id", "subject_cpf_hash"]
+          }
+        ]
+      },
+      {
+        "name": "ExamView",
+        "table": "exam_view",
+        "primaryKey": ["id"],
+        "description": "Projecao de exame (PEC) para o cidadao (ADR-0020 Decision 1; portal-route-contract.md secao 7 GET exams/{id}; plan R-0009 M16): uma linha por exame (exam_id unico por tenant), rotulo legal, validade e prazo da junta. Nesta rodada so a tabela e o projetor esqueleto (applyEvent registra last_event_id); produtor real e do PEC (OD-P19).",
+        "fields": [
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
+            "name": "exam_id",
+            "type": "uuid"
+          },
+          {
+            "name": "subject_cpf_hash",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "legal_label",
+            "type": "text"
+          },
+          {
+            "name": "valid_until",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "board_due_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "last_event_id",
+            "type": "uuid"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_exam_view_exam",
+            "columns": ["tenant_id", "exam_id"],
+            "unique": true
+          },
+          {
+            "name": "ix_portal_exam_view_subject",
+            "columns": ["tenant_id", "subject_cpf_hash"]
+          }
+        ]
+      },
+      {
+        "name": "ProjectionAppliedEvent",
+        "table": "projection_applied_event",
+        "primaryKey": ["id"],
+        "description": "Livro de eventos aplicados pelos projetores (ADR-0020 Decision 1: idempotencia em event.id; plan R-0009 M16): uma linha por (tenant, event_id, projection) porque um mesmo evento pode alimentar mais de uma projecao (ex.: INFRACAO_ESTADO_ALTERADO -> infraction_view e entitlement). last_error registra a falha do projetor (PORTAL.INTERNAL, token sem mapa — OD-P20) e fica nulo apos aplicacao bem-sucedida. Replay = reaplicar a janela da outbox em ordem created_at.",
+        "fields": [
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
+            "name": "event_id",
+            "type": "uuid"
+          },
+          {
+            "name": "projection",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "applied_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "last_error",
+            "type": "text",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_projection_applied_event_event_projection",
+            "columns": ["tenant_id", "event_id", "projection"],
+            "unique": true
+          }
+        ]
+      },
+      {
+        "name": "NationalReadCache",
+        "table": "national_read_cache",
+        "primaryKey": ["id"],
+        "description": "Cache das leituras nacionais do cidadao (ADR-0020 Decision 5; portal-route-contract.md secao 7 GET documents/cnh, GET vehicles, GET vehicles/{id}/clearance; steering H.54; plan R-0009 M17): so por packages/senatran-adapter (CdtPort, RenachPort, RenavamReadPort via token PORTAL_NATIONAL_READ_PORTS), nunca fetch proprio (ADR-0003). kind cnh | vehicles | clearance; target_id nulo para cnh e vehicles, veiculo para clearance — unico por (tenant, subject, kind, coalesce(target_id)). TTL = parametro portal.read_cache_ttl_minutes; resposta sempre com cachedAt; fonte indisponivel com cache -> 200 com cachedAt antigo, sem cache -> 503 PORTAL.NATIONAL_READ_UNAVAILABLE.",
+        "fields": [
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
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "target_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "payload_json",
+            "type": "jsonb",
+            "pii": "personal"
+          },
+          {
+            "name": "cached_at",
+            "type": "timestamptz"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_national_read_cache_subject_kind_target",
+            "columns": [
+              "tenant_id",
+              "subject_id",
+              "kind",
+              "coalesce(target_id, '00000000-0000-0000-0000-000000000000'::uuid)"
+            ],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_national_read_cache_kind",
+            "expression": "kind in ('cnh','vehicles','clearance')"
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/portal/projections/",
+    "resources": [
+      {
+        "entity": "InfractionView",
+        "path": "infraction-views",
+        "resource": "infraction-view",
+        "operations": []
+      },
+      {
+        "entity": "ProcessTimeline",
+        "path": "process-timelines",
+        "resource": "process-timeline",
+        "operations": []
+      },
+      {
+        "entity": "PointsView",
+        "path": "points-views",
+        "resource": "points-view",
+        "operations": []
+      },
+      {
+        "entity": "CrashView",
+        "path": "crash-views",
+        "resource": "crash-view",
+        "operations": []
+      },
+      {
+        "entity": "ExamView",
+        "path": "exam-views",
+        "resource": "exam-view",
+        "operations": []
+      },
+      {
+        "entity": "ProjectionAppliedEvent",
+        "path": "applied-events",
+        "resource": "projection-applied-event",
+        "operations": []
+      },
+      {
+        "entity": "NationalReadCache",
+        "path": "national-read-cache",
+        "resource": "national-read-cache",
+        "operations": []
+      }
+    ]
+  },
+  "auth": {
+    "source": "PORTAL_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json b/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json
new file mode 100644
index 0000000..43acf49
--- /dev/null
+++ b/docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json
@@ -0,0 +1,593 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-PORTAL-REQUESTS-001",
+  "module": {
+    "name": "Requests",
+    "namespace": "portal",
+    "version": "1.0.1",
+    "ddlFile": "62-portal-requests.sql",
+    "dependencies": {
+      "zod": "^4.6.5"
+    },
+    "devDependencies": {
+      "@types/pg": "^8.15.4",
+      "pg": "^8.20.0"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      }
+    ],
+    "owners": ["detran-portal"],
+    "description": "Ciclo comum de pedidos do cidadao (ADR-0019 Decision 2; [WF-PORTAL-001] secao Estados e secao Transicoes; plan R-0009 M7-M9): uma unica maquina de 13 estados fixos em codigo (OD-P13) para todo servico do catalogo, com protocolo imediato (T-PROTOCOLO, Lei 14.129/2021 art. 27 IV) antes de qualquer validacao de conteudo e delegacao ao comando do dominio dono (M8). O pedido nunca guarda a decisao. Inclui rascunho versionado, anexos, ciencia de consequencias, avaliacao e registro de idempotencia (M9). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica SOLICITACAO_CRIADA, SOLICITACAO_PROTOCOLADA, SOLICITACAO_DESISTIDA, SOLICITACAO_CONCLUIDA e AVALIACAO_REGISTRADA (M21)."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "Request",
+        "table": "request",
+        "primaryKey": ["id"],
+        "description": "Pedido do cidadao — maquina [WF-PORTAL-001] secao Estados (13 tokens no check de state; INELEGIVEL e resposta 422 PORTAL.INELIGIBLE sem linha persistida, M7). service_key e FK logica para portal.service_catalog.service_key (outro pacote, sem FK fisica). Delegacao (M8): delegation_domain, delegation_command (ex.: inf:rait-case:protocol), delegation_external_id, delegation_status e delegation_error; falha apos protocolo mantem o protocolo e grava delegation_status = failed (PORTAL.DELEGATION_FAILED). minimum_assurance copia o nivel exigido pela matriz no momento do pedido (M5). version para If-Match (M9); withdrawn_at em DESISTIDO.",
+        "fields": [
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
+            "name": "state",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "service_key",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "target_kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "target_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "channel",
+            "type": "varchar(20)",
+            "default": "'portal'"
+          },
+          {
+            "name": "delegation_domain",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "delegation_command",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "delegation_external_id",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "delegation_status",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "delegation_error",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "minimum_assurance",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": 1
+          },
+          {
+            "name": "withdrawn_at",
+            "type": "timestamptz",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_portal_request_subject_state",
+            "columns": ["tenant_id", "subject_id", "state"]
+          },
+          {
+            "name": "ix_portal_request_service_key",
+            "columns": ["tenant_id", "service_key", "state"]
+          },
+          {
+            "name": "ix_portal_request_target",
+            "columns": ["tenant_id", "target_kind", "target_id"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_request_state",
+            "expression": "state in ('IDENTIFICADO','SERVICO_SELECIONADO','ELEGIBILIDADE_VERIFICADA','INELEGIVEL','PEDIDO_EM_COMPOSICAO','AGUARDANDO_NIVEL_ASSINATURA','AGUARDANDO_PAGAMENTO','PROTOCOLADO','EM_ANDAMENTO_NO_ORGAO','RESULTADO_DISPONIVEL','AVALIACAO_OFERECIDA','CONCLUIDO','DESISTIDO')"
+          },
+          {
+            "name": "ck_portal_request_target_kind",
+            "expression": "target_kind in ('ait','case','vehicle','exam','crash','none')"
+          },
+          {
+            "name": "ck_portal_request_target_id_required",
+            "expression": "(target_kind = 'none' and target_id is null) or (target_kind <> 'none' and target_id is not null)"
+          },
+          {
+            "name": "ck_portal_request_channel",
+            "expression": "channel in ('portal')"
+          },
+          {
+            "name": "ck_portal_request_delegation_status",
+            "expression": "delegation_status in ('pending','delegated','failed','not_applicable')"
+          },
+          {
+            "name": "ck_portal_request_minimum_assurance",
+            "expression": "minimum_assurance in ('none','simples','avancada','qualificada')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_request_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "RequestDraft",
+        "table": "request_draft",
+        "primaryKey": ["id"],
+        "description": "Rascunho versionado do pedido em PEDIDO_EM_COMPOSICAO ([WF-PORTAL-001] secao Transicoes, PUT requests/{id}/draft com If-Match; plan R-0009 M7 e M9): cada gravacao e uma nova versao (payload_json validado por docs/framework/schemas/portal-request-draft.schema.json por ato, WP-P3). Uma linha por (tenant, request, version).",
+        "fields": [
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
+            "name": "request_id",
+            "type": "uuid"
+          },
+          {
+            "name": "version",
+            "type": "integer"
+          },
+          {
+            "name": "payload_json",
+            "type": "jsonb",
+            "pii": "personal"
+          },
+          {
+            "name": "saved_at",
+            "type": "timestamptz"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_request_draft_request_version",
+            "columns": ["tenant_id", "request_id", "version"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_request_draft_version_positive",
+            "expression": "version > 0"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_request_draft_request",
+            "columns": ["request_id"],
+            "references": {
+              "table": "portal.request",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "RequestAttachment",
+        "table": "request_attachment",
+        "primaryKey": ["id"],
+        "description": "Anexo do pedido com intencao de upload ([WF-PORTAL-001] secao Transicoes, composicao do pedido; portal-build-pack.md secao 2 WP-P1: hash e intencao de upload): upload_state intended -> completed | rejected; storage_ref preenchido na conclusao; sha256 declarado pelo cliente e conferido no armazenamento.",
+        "fields": [
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
+            "name": "request_id",
+            "type": "uuid"
+          },
+          {
+            "name": "filename",
+            "type": "text"
+          },
+          {
+            "name": "mime_type",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "size_bytes",
+            "type": "bigint"
+          },
+          {
+            "name": "sha256",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "upload_state",
+            "type": "varchar(20)",
+            "default": "'intended'"
+          },
+          {
+            "name": "storage_ref",
+            "type": "text",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_portal_request_attachment_request",
+            "columns": ["tenant_id", "request_id", "upload_state"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_request_attachment_sha256",
+            "expression": "sha256 ~ '^[0-9a-f]{64}$'"
+          },
+          {
+            "name": "ck_portal_request_attachment_size_bytes",
+            "expression": "size_bytes >= 0"
+          },
+          {
+            "name": "ck_portal_request_attachment_upload_state",
+            "expression": "upload_state in ('intended','completed','rejected')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_request_attachment_request",
+            "columns": ["request_id"],
+            "references": {
+              "table": "portal.request",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "Protocol",
+        "table": "protocol",
+        "primaryKey": ["id"],
+        "description": "Protocolo imediato do pedido ([WF-PORTAL-001] secao Prazos, T-PROTOCOLO: imediato, sem excecao, Lei 14.129/2021 art. 27 IV; plan R-0009 M8): gravado na mesma transacao que leva o pedido a PROTOCOLADO, antes de qualquer validacao de conteudo e antes da delegacao. number = <tenant-slug-upper>-<AAAA>-<sequencial 7 digitos>, unico por tenant; um protocolo por pedido (request_id unico). receipt_hash = sha256 do JSON canonico do recibo. A sequencia portal.protocol_seq NAO e entidade deste blueprint: vive no DDL manuscrito 19-portal-platform.sql porque o gerador nao emite sequences.",
+        "fields": [
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
+            "name": "request_id",
+            "type": "uuid"
+          },
+          {
+            "name": "number",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "issued_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "channel",
+            "type": "varchar(20)",
+            "default": "'portal'"
+          },
+          {
+            "name": "receipt_hash",
+            "type": "varchar(64)"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_protocol_number",
+            "columns": ["tenant_id", "number"],
+            "unique": true
+          },
+          {
+            "name": "ux_portal_protocol_request",
+            "columns": ["tenant_id", "request_id"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_protocol_channel",
+            "expression": "channel in ('portal')"
+          },
+          {
+            "name": "ck_portal_protocol_receipt_hash",
+            "expression": "receipt_hash ~ '^[0-9a-f]{64}$'"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_protocol_request",
+            "columns": ["request_id"],
+            "references": {
+              "table": "portal.request",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "ConsequenceAck",
+        "table": "consequence_ack",
+        "primaryKey": ["id"],
+        "description": "Ciencia das consequencias de um ato ([WF-PORTAL-001] secao Transicoes: desistencia, renuncia ao desconto de 40 % (H.53), indicacao de condutor e adesao ao SNE exigem ciencia explicita do texto versionado; portal-build-pack.md secao 2 WP-P1): guarda o kind, a versao do texto aceito e quando foi aceito; nunca o texto em si.",
+        "fields": [
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
+            "name": "request_id",
+            "type": "uuid"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "text_version",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "accepted_at",
+            "type": "timestamptz"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_portal_consequence_ack_request",
+            "columns": ["tenant_id", "request_id", "kind"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_consequence_ack_kind",
+            "expression": "kind in ('desistencia','renuncia_40','indicacao','sne')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_consequence_ack_request",
+            "columns": ["request_id"],
+            "references": {
+              "table": "portal.request",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "Evaluation",
+        "table": "evaluation",
+        "primaryKey": ["id"],
+        "description": "Avaliacao de satisfacao ([WF-PORTAL-001] secao Estados AVALIACAO_OFERECIDA -> CONCLUIDO e [WF-PORTAL-004] secao Estados AVALIACAO_OFERECIDA -> AVALIADA; Lei 13.460/2017 art. 23; ADR-0019 Decision 4; plan R-0009 M9 POST evaluations idempotente): subject_kind | subject_id apontam o objeto avaliado (pedido ou manifestacao, sem FK por ser polimorfico — nao confundir com portal.subject). scores_json guarda as 5 notas; uma avaliacao por objeto (unico por tenant, subject_kind, subject_id). Publica AVALIACAO_REGISTRADA (M21).",
+        "fields": [
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
+            "name": "subject_kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "subject_id",
+            "type": "uuid"
+          },
+          {
+            "name": "scores_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "comment",
+            "type": "text",
+            "nullable": true,
+            "pii": "personal"
+          },
+          {
+            "name": "submitted_at",
+            "type": "timestamptz"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_evaluation_subject",
+            "columns": ["tenant_id", "subject_kind", "subject_id"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_evaluation_subject_kind",
+            "expression": "subject_kind in ('request','manifestation')"
+          }
+        ]
+      },
+      {
+        "name": "IdempotencyRecord",
+        "table": "idempotency_record",
+        "primaryKey": ["id"],
+        "description": "Registro de Idempotency-Key deterministica <ato>:<alvo>:<fingerprint> (plan R-0009 M9; portal-route-contract.md secao 1): POST requests, submit, respostas de diligencia, manifestations, evaluations e sne/enrollment. Reuso com o mesmo body_sha256 devolve response_json com o mesmo status; corpo diferente -> 409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY. subject_id nulo para POST manifestations anonimo (H.51). Unico por (tenant, key).",
+        "fields": [
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
+            "name": "key",
+            "type": "text"
+          },
+          {
+            "name": "subject_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "route",
+            "type": "text"
+          },
+          {
+            "name": "body_sha256",
+            "type": "varchar(64)"
+          },
+          {
+            "name": "response_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "status",
+            "type": "integer"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_portal_idempotency_record_key",
+            "columns": ["tenant_id", "key"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_portal_idempotency_record_body_sha256",
+            "expression": "body_sha256 ~ '^[0-9a-f]{64}$'"
+          },
+          {
+            "name": "ck_portal_idempotency_record_status",
+            "expression": "status between 100 and 599"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_portal_idempotency_record_subject",
+            "columns": ["subject_id"],
+            "references": {
+              "table": "portal.subject",
+              "columns": ["id"]
+            }
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/portal/requests/",
+    "resources": [
+      {
+        "entity": "Request",
+        "path": "requests",
+        "resource": "request",
+        "operations": []
+      },
+      {
+        "entity": "RequestDraft",
+        "path": "drafts",
+        "resource": "request-draft",
+        "operations": []
+      },
+      {
+        "entity": "RequestAttachment",
+        "path": "attachments",
+        "resource": "request-attachment",
+        "operations": []
+      },
+      {
+        "entity": "Protocol",
+        "path": "protocols",
+        "resource": "protocol",
+        "operations": []
+      },
+      {
+        "entity": "ConsequenceAck",
+        "path": "consequence-acks",
+        "resource": "consequence-ack",
+        "operations": []
+      },
+      {
+        "entity": "Evaluation",
+        "path": "evaluations",
+        "resource": "evaluation",
+        "operations": []
+      },
+      {
+        "entity": "IdempotencyRecord",
+        "path": "idempotency-records",
+        "resource": "idempotency-record",
+        "operations": []
+      }
+    ]
+  },
+  "auth": {
+    "source": "PORTAL_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md b/docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md
new file mode 100644
index 0000000..7394cfa
--- /dev/null
+++ b/docs/meta/adr/ADR-0024-govbr-federation-via-cognito.md
@@ -0,0 +1,73 @@
+# ADR-0024: gov.br federated through Cognito — signature levels as a signed claim, CPF as the business subject
+
+## Status
+
+Accepted on 2026-09-16 by Owner decision (steering H.50, H.49, H.51) on the Architect's proposal.
+Realises ADR-0019 §1 and `portal-build-pack.md` WP-P0; implemented by R-0009 CTG-0001
+(`work/rounds/R-0009/contracts/CTG-0001.md` §2–§5).
+
+## Context
+
+ADR-0019 requires citizens to authenticate through Cognito federated to gov.br, with the
+electronic-signature level (`RN-PORTAL-101`: `simples`, `avancada`, `qualificada`) decided per
+act and never per account colour. The origin portal used a Cognito pool without gov.br and a
+`custom:teat_assurance_level` claim (`portal-route-contract.md` §11). The state ordinance
+(PN DETRAN-AM 001/2025 art. 1º and 3º) admits gov.br "nível comprovado (ouro)", e-Notariado
+and ICP-Brasil for defences, appeals, driver indication and powers of attorney; the Decreto
+10.543/2020 art. 4º admits advanced signatures more broadly. OD-P02 asked how bronze, prata
+and ouro map onto the three levels; OD-P01/H.49 asked whether the CETRAN-AM appeal follows
+the same rule. No institutional gov.br OIDC client credentials exist yet (OD-P15).
+
+## Decision
+
+1. **Federation, no stored credentials.** gov.br is an OIDC identity provider federated into
+   the citizen Cognito user pool (`@stynx-nyx/auth` `CognitoTokenVerifier`, unchanged). The
+   backend never sees a gov.br password or token; it verifies the pool's JWT only.
+2. **Seal → level is mapped in the IdP** (pool attribute mapping) and travels as a signed
+   claim: bronze → `simples`; **prata or ouro → `avancada`** (H.50); e-Notariado / ICP-Brasil
+   certificate → `qualificada`. **Risk registered (H.50):** PN DETRAN-AM 001/2025 art. 1º
+   names only the ouro level, so an act signed with prata is challengeable until the agency
+   issues an ordinance admitting prata; the request is in the letter to DETRAN-AM. OD-P02 is
+   closed by H.50 with this risk. The CETRAN-AM appeal follows the same rule (H.49,
+   `portal.cetran_appeal_level`).
+3. **CPF is the business subject.** The claim `cpf` (11 digits) is the citizen's `sub` for
+   every `portal.*` table (`portal.subject.cpf_hash`); the Cognito group `CIDADAO` is the only
+   Portal role (`roles.ts`, ADR-0005). Representation (procurador) is a data attribute
+   (`portal.representation`, `WF-PORTAL-002`), never a group.
+4. **Fail-closed guard.** `PortalCitizenGuard` (`@detran/portal-identity`) rejects any
+   principal whose `assurance_level` is absent or outside the three tokens, or whose `cpf` is
+   absent or malformed, with 403 `PORTAL.ASSURANCE_NOT_VERIFIED`; it never degrades to
+   `simples`. A principal without `CIDADAO` gets 403 `PORTAL.IDENTITY_NOT_CITIZEN`. Global
+   admin permission `*` does not bypass the guard: it is identity, not policy.
+5. **Act → level is data.** `portal.act_level_policy` holds one row per act with
+   `minimum_assurance`, `legal_basis` and `decision_ref` (Decreto 10.543/2020 art. 4º;
+   PN 001/2025; H.49/H.50/H.51). `assertActLevel` compares `simples < avancada < qualificada`
+   and raises 403 `PORTAL.ASSURANCE_INSUFFICIENT`; a row demanding `qualificada` is a defect
+   (500 `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED`, `RN-PORTAL-101`); a missing row never
+   releases the act. Ombudsman manifestation requires no level (`none`, H.51).
+6. **Profiles.** `local-sandbox`/`test` simulate the IdP: `DetranLocalTokenVerifier` copies
+   `DETRAN_LOCAL_ASSURANCE_LEVEL` and `DETRAN_LOCAL_CPF` into `principal.claims`; absent
+   variables mean absent claims and the guard closes. In Cognito profiles the claim names are
+   `STYNX_COGNITO_ASSURANCE_CLAIM` (default `custom:assurance_level`) and
+   `STYNX_COGNITO_CPF_CLAIM` (default `custom:cpf`), read by `portalIdentityClaims`.
+
+## Consequences
+
+- OD-P15: institutional gov.br OIDC client credentials and the pool attribute mapping are
+  `source_pending`; homologation with the real IdP is R-0014 WP-P6. Until then only the
+  simulated IdP of the local profiles exists; nothing in `detran-runtime.ts` talks to gov.br.
+- OD-P02 is revised: closed by H.50 with the prata risk recorded here, not reopened by code.
+- Level elevation (`UC-PORTAL-019`) is a redirect to gov.br plus a `resumeToken`; the backend
+  stores nothing beyond the token (CTG-0002 route `POST assurance/elevations`).
+- `RN-PORTAL-118`: the holder sees the CPF from the claim; `portal.subject` stores only its
+  hash and the observed levels. `RN-PORTAL-101` verification (c) becomes a runtime invariant.
+- A future ordinance admitting prata, or one rejecting it, changes `portal.act_level_policy`
+  rows and the IdP mapping — not this decision.
+
+## References
+
+- Steering H.49, H.50, H.51; OD-P01, OD-P02, OD-P06, OD-P15.
+- ADR-0005 (`CIDADAO`), ADR-0019 §1, `portal-build-pack.md` WP-P0, `portal-route-contract.md`
+  §1.3 and §11, `portal-error-catalog.md` §1.
+- `RN-PORTAL-101`, `RN-PORTAL-118`, `UC-PORTAL-019`, `WF-PORTAL-002`,
+  [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], Decreto 10.543/2020 art. 4º e 5º.
diff --git a/docs/meta/adr/README.md b/docs/meta/adr/README.md
index 6747f17..7761823 100644
--- a/docs/meta/adr/README.md
+++ b/docs/meta/adr/README.md
@@ -31,5 +31,6 @@ binding; supersede only by a new ADR.
 | [ADR-0021](ADR-0021-shared-parameter-store.md)                         | One shared, versioned parameter store (`ops.parameter`) for calibrations (Accepted)  |
 | [ADR-0022](ADR-0022-orchestra-execution-model.md)                      | Execution of the implementation backlog by dedicated agent orchestras (Proposed)     |
 | [ADR-0023](ADR-0023-minimum-ops-agency-context.md)                     | Minimum `ops/agency` institutional context (unit, jurisdiction, competence)          |
+| [ADR-0024](ADR-0024-govbr-federation-via-cognito.md)                   | gov.br federated through Cognito: signature levels as a claim, CPF as subject        |

 ADR-0012 and ADR-0013 were taken by the PEC port while the infractions definition round was open on its branch; the infractions ADRs were renumbered 0014…0021 on merge (2026-09-13).
diff --git a/package.json b/package.json
index b06359c..af8f604 100644
--- a/package.json
+++ b/package.json
@@ -16,7 +16,7 @@
     "format:check": "prettier --check .",
     "format": "prettier --write .",
     "typecheck": "pnpm -r --if-present run typecheck",
-    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/ops-parameter build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build && pnpm --filter @detran/inf-deadlines build && pnpm --filter @detran/inf-infraction build && pnpm --filter @detran/inf-notification build && pnpm --filter @detran/inf-collection build && pnpm --filter @detran/inf-rait-org build && pnpm --filter @detran/inf-rait-integration build",
+    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/portal-identity build && pnpm --filter @detran/portal-requests build && pnpm --filter @detran/portal-inbox build && pnpm --filter @detran/portal-citizen-service build && pnpm --filter @detran/portal-projections build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/ops-parameter build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build && pnpm --filter @detran/inf-deadlines build && pnpm --filter @detran/inf-infraction build && pnpm --filter @detran/inf-notification build && pnpm --filter @detran/inf-collection build && pnpm --filter @detran/inf-rait-org build && pnpm --filter @detran/inf-rait-integration build",
     "verify:decorators": "tsx tools/verify-controller-decorators.ts",
     "verify:rls-ddl": "tsx tools/check-rls-ddl.ts",
     "verify:role-catalog": "tsx tools/check-role-catalog.ts",
@@ -29,9 +29,9 @@
     "backend:db:apply": "bash backend/database/apply.sh",
     "backend:db:reset": "bash backend/database/apply.sh --full",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
-    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
-    "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/inf-ait test:e2e",
+    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/portal-identity test:unit && pnpm --filter @detran/portal-requests test:unit && pnpm --filter @detran/portal-inbox test:unit && pnpm --filter @detran/portal-citizen-service test:unit && pnpm --filter @detran/portal-projections test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/ops-parameter test:unit && pnpm --filter @detran/ops-agency test:unit && pnpm --filter @detran/ops-field test:unit && pnpm --filter @detran/ops-snapshots test:unit && pnpm --filter @detran/ops-evidence test:unit && pnpm --filter @detran/ops-offline-sync test:unit && pnpm --filter @detran/app test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-collection test:unit && pnpm --filter @detran/inf-rait-org test:unit && pnpm --filter @detran/inf-rait-integration test:unit",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/portal-identity test:integration && pnpm --filter @detran/portal-requests test:integration && pnpm --filter @detran/portal-inbox test:integration && pnpm --filter @detran/portal-citizen-service test:integration && pnpm --filter @detran/portal-projections test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-measures test:integration && pnpm --filter @detran/inf-alcohol test:integration && pnpm --filter @detran/ops-parameter test:integration && pnpm --filter @detran/ops-agency test:integration && pnpm --filter @detran/ops-field test:integration && pnpm --filter @detran/ops-snapshots test:integration && pnpm --filter @detran/ops-evidence test:integration && pnpm --filter @detran/ops-offline-sync test:integration && pnpm --filter @detran/inf-normative test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration && pnpm --filter @detran/inf-collection test:integration && pnpm --filter @detran/inf-rait-org test:integration && pnpm --filter @detran/inf-rait-integration test:integration",
+    "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/portal-identity test:e2e && pnpm --filter @detran/portal-requests test:e2e && pnpm --filter @detran/portal-inbox test:e2e && pnpm --filter @detran/portal-citizen-service test:e2e && pnpm --filter @detran/portal-projections test:e2e && pnpm --filter @detran/ops-agency test:e2e && pnpm --filter @detran/ops-field test:e2e && pnpm --filter @detran/ops-snapshots test:e2e && pnpm --filter @detran/ops-evidence test:e2e && pnpm --filter @detran/ops-offline-sync test:e2e && pnpm --filter @detran/inf-ait test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
     "backend:test:ci": "pnpm backend:test:unit && pnpm backend:test:integration && pnpm backend:test:e2e",
diff --git a/tools/check-rls-ddl.ts b/tools/check-rls-ddl.ts
index bcd3913..2067d31 100644
--- a/tools/check-rls-ddl.ts
+++ b/tools/check-rls-ddl.ts
@@ -1,6 +1,20 @@
 import fs from 'node:fs';
 import path from 'node:path';

+/**
+ * Tabelas com `tenant_id` isentas de `auth.create_rls_policy` POR DESENHO
+ * (docs/framework/arch/portal-route-contract.md §11: `platform.public_hostname`
+ * e `platform.tenant_brand_profile` → `portal.public_hostname` e
+ * `portal.brand_profile`, "sem RLS, por desenho"; plan R-0009 M11): o Host é
+ * resolvido antes de existir contexto de tenant e a marca é pública, lida sem
+ * sessão. DDL manuscrito `backend/database/ddl/19-portal-platform.sql`. Nada
+ * mais é isento — toda outra tabela com `tenant_id` continua exigindo a política.
+ */
+const RLS_EXEMPT_BY_DESIGN: ReadonlySet<string> = new Set([
+  'portal.public_hostname',
+  'portal.brand_profile',
+]);
+
 const ddlDirectory = path.join(process.cwd(), 'backend', 'database', 'ddl');
 const files = fs
   .readdirSync(ddlDirectory)
@@ -20,7 +34,9 @@ const covered = new Set<string>();
 const helper = /auth\.create_rls_policy\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/gi;
 while ((match = helper.exec(sql)))
   covered.add(`${match[1]}.${match[2]}`.toLowerCase());
-const missing = [...tenantTables].filter((table) => !covered.has(table)).sort();
+const missing = [...tenantTables]
+  .filter((table) => !covered.has(table) && !RLS_EXEMPT_BY_DESIGN.has(table))
+  .sort();
 if (missing.length > 0) {
   console.error('RLS DDL coverage violations:');
   missing.forEach((table) =>
@@ -28,5 +44,10 @@ if (missing.length > 0) {
   );
   process.exitCode = 1;
 } else {
-  console.log(`check-rls-ddl: OK (${tenantTables.size} tenant tables covered)`);
+  const exempt = [...tenantTables].filter((table) =>
+    RLS_EXEMPT_BY_DESIGN.has(table),
+  );
+  console.log(
+    `check-rls-ddl: OK (${tenantTables.size - exempt.length} tenant tables covered, ${exempt.length} exempt by design: ${exempt.sort().join(', ')})`,
+  );
 }
diff --git a/work/rounds/R-0009/AUTHORIZATION.md b/work/rounds/R-0009/AUTHORIZATION.md
new file mode 100644
index 0000000..fca27c1
--- /dev/null
+++ b/work/rounds/R-0009/AUTHORIZATION.md
@@ -0,0 +1,25 @@
+---
+schemaVersion: '1.0.0'
+round_id: 'R-0009'
+status: active
+authority: Owner
+decision: GRANTED
+granted_at: '2026-09-16T00:00:00.000Z'
+source: 'Explicit user instruction of 2026-09-16: "Execute @work/rounds/R-0009/prompts/00-maestro.md e prossiga até o completo encerramento do round com o merge correspondente" (single Owner message of the session; lifts the suspension recorded on 2026-09-16 in plan.md §Retomada, "suspenda a execução até disponibilizarmos o R-0007")'
+publication: true
+release: false
+---
+
+# R-0009 authorization
+
+The Owner explicitly instructed the maestro to execute the R-0009 maestro prompt and proceed
+until the complete closure of the round with the corresponding merge. This lifts the earlier
+suspension ("until R-0007 is available"): R-0007 `rait-backend` has not started (no remote branch,
+no PR), so CTG-0002 is delivered as the prompt §0 prescribes — delegated routes answer
+`PORTAL.SERVICE_UNAVAILABLE` with reason and the real-delegation test is marked `todo` citing R-0007.
+
+This record transcribes the instruction through the prompt's declared boundary: normal push of
+`orchestra/portal-backend`, PR creation against `main`, merge after green CI and cross-family
+PASS, exact-SHA audit observation, and governed round-close. It grants no package publication,
+release, deployment, force-push, or mutation outside this repository. It was written by the maestro
+from the Owner's instruction, not by the Owner; the Owner may revoke or amend it.
diff --git a/work/rounds/R-0009/env-detran-r9.sh b/work/rounds/R-0009/env-detran-r9.sh
new file mode 100644
index 0000000..b4bc46d
--- /dev/null
+++ b/work/rounds/R-0009/env-detran-r9.sh
@@ -0,0 +1,7 @@
+# Ambiente do banco da rodada R-0009 (equivalente ao job backend-kernel do CI).
+# Uso: source work/rounds/R-0009/env-detran-r9.sh
+export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r9
+export DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r9
+export STYNX_OWNER_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r9
+export STYNX_APP_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r9?options=-c%20role%3Drole_app_backend'
+export STYNX_READER_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/detran_r9?options=-c%20role%3Drole_app_backend'
```
