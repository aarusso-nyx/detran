# Revisão de entrega CTG-0001 — R-0010, ciclo válido 1

Papel: Auditor (soft gate). Trabalhe somente em leitura nesta worktree. Modo `delivery-review`. Use a rubrica inteira em `docs/meta/agents/orchestra/reviewer-prompt.template.md`; este é o primeiro veredito válido e deve ser exaustivo. A chamada anterior anexou um diff enorme e sua saída não era JSON válido; não houve veredito aceito. O diagnóstico visível apontou a leitura da coleção de vítimas, agora corrigida e coberta no teste HTTP. Avalie todos os critérios e reporte todos os achados restantes.

Leia, nesta ordem: `docs/meta/agents/orchestra/README.md` §§4–5; `docs/meta/agents/README.md` regras comuns; `docs/framework/arch/boat-build-pack.md` WP-B0/B1 e mapa; `work/rounds/R-0010/plan.md`; `work/rounds/R-0010/contracts/CTG-0001.md`; `work/rounds/R-0010/reports/TASK-0001.md`…`TASK-0004.md`; o diff completo em `work/rounds/R-0010/reviews/delivery-review-CTG-0001.diff`. Inspecione os arquivos tocados conforme necessário.

Corte: CTG-0001 = TASK-0001…0004, WP-B0/B1. CTG-0002 = TASK-0005…0011, WP-B2/B3. A adenda A-2 do CTG-0001 registra C-1-14…17 para TASK-0006/0007. O diff inclui materiais de planejamento e o contrato CTG-0002 da mesma worktree; não confunda com entrega já fechada.

Gates independentes do maestro: `pnpm check` PASS antes da última correção; duas leituras HTTP de vítima (item e coleção) PASS após a última correção, com 400 sem finalidade e 200 + auditoria persistida com finalidade. Uma nova execução de `pnpm check` está em andamento. A resposta deve julgar o código, não a declaração de gates.

`git diff --stat`:

```
 backend/app/package.json                           |    1 +
 backend/app/src/app.module.ts                      |   91 +-
 backend/app/tests/e2e/policy-routes.e2e.spec.ts    |  153 +-
 backend/app/vitest.config.ts                       |    3 +
 .../database/ddl/19-est-lifecycle-vocabulary.sql   |  155 ++
 backend/database/ddl/70-est-crash.sql              |  283 +++
 backend/database/seed/70-fixtures-est-crash.sql    |  134 ++
 backend/domains/est/crash/package.json             |   34 +
 .../src/controllers/crash-damage.controller.ts     |   43 +
 .../crash/src/controllers/crash-link.controller.ts |   19 +
 .../src/controllers/crash-person.controller.ts     |   43 +
 .../src/controllers/crash-record.controller.ts     |   43 +
 .../crash-renaest-submission.controller.ts         |   55 +
 .../src/controllers/crash-scene-duty.controller.ts |   55 +
 .../src/controllers/crash-sketch.controller.ts     |   43 +
 .../crash-subject-request.controller.ts            |   55 +
 .../src/controllers/crash-vehicle.controller.ts    |   43 +
 .../src/controllers/crash-victim.controller.ts     |   43 +
 .../src/controllers/crash-witness.controller.ts    |   43 +
 backend/domains/est/crash/src/crash.module.ts      |   78 +
 .../est/crash/src/dto/create-crash-damage.dto.ts   |    8 +
 .../est/crash/src/dto/create-crash-link.dto.ts     |    7 +
 .../est/crash/src/dto/create-crash-person.dto.ts   |   13 +
 .../est/crash/src/dto/create-crash-record.dto.ts   |   30 +
 .../src/dto/create-crash-renaest-submission.dto.ts |    9 +
 .../crash/src/dto/create-crash-scene-duty.dto.ts   |   10 +
 .../est/crash/src/dto/create-crash-sketch.dto.ts   |    7 +
 .../src/dto/create-crash-subject-request.dto.ts    |    8 +
 .../est/crash/src/dto/create-crash-vehicle.dto.ts  |   10 +
 .../est/crash/src/dto/create-crash-victim.dto.ts   |   11 +
 .../est/crash/src/dto/create-crash-witness.dto.ts  |    8 +
 .../est/crash/src/entities/crash-damage.entity.ts  |   12 +
 .../est/crash/src/entities/crash-link.entity.ts    |   11 +
 .../est/crash/src/entities/crash-person.entity.ts  |   17 +
 .../est/crash/src/entities/crash-record.entity.ts  |   35 +
 .../entities/crash-renaest-submission.entity.ts    |   13 +
 .../crash/src/entities/crash-scene-duty.entity.ts  |   14 +
 .../est/crash/src/entities/crash-sketch.entity.ts  |   11 +
 .../src/entities/crash-subject-request.entity.ts   |   12 +
 .../est/crash/src/entities/crash-vehicle.entity.ts |   14 +
 .../est/crash/src/entities/crash-victim.entity.ts  |   15 +
 .../est/crash/src/entities/crash-witness.entity.ts |   12 +
 .../src/handwritten/boat-commands.controller.ts    |   64 +
 backend/domains/est/crash/src/index.ts             |   58 +
 .../src/repositories/crash-damage.repository.ts    |  122 +
 .../src/repositories/crash-link.repository.ts      |  121 +
 .../src/repositories/crash-person.repository.ts    |  127 +
 .../src/repositories/crash-record.repository.ts    |  144 ++
 .../crash-renaest-submission.repository.ts         |  137 ++
 .../repositories/crash-scene-duty.repository.ts    |  131 +
 .../src/repositories/crash-sketch.repository.ts    |  121 +
 .../crash-subject-request.repository.ts            |  130 +
 .../src/repositories/crash-vehicle.repository.ts   |  126 +
 .../src/repositories/crash-victim.repository.ts    |  125 +
 .../src/repositories/crash-witness.repository.ts   |  124 +
 .../est/crash/src/services/crash-damage.service.ts |   25 +
 .../est/crash/src/services/crash-link.service.ts   |   25 +
 .../est/crash/src/services/crash-person.service.ts |   25 +
 .../est/crash/src/services/crash-record.service.ts |   25 +
 .../services/crash-renaest-submission.service.ts   |   30 +
 .../crash/src/services/crash-scene-duty.service.ts |   28 +
 .../est/crash/src/services/crash-sketch.service.ts |   25 +
 .../src/services/crash-subject-request.service.ts  |   28 +
 .../crash/src/services/crash-vehicle.service.ts    |   28 +
 .../est/crash/src/services/crash-victim.service.ts |   25 +
 .../crash/src/services/crash-witness.service.ts    |   28 +
 .../integration/boat-contract.integration.spec.ts  |  475 ++++
 .../crash/tests/unit/boat-contract.unit.spec.ts    |   42 +
 backend/domains/est/crash/tsconfig.build.json      |   11 +
 backend/domains/est/crash/tsconfig.json            |   14 +
 backend/domains/est/crash/vitest.config.ts         |   20 +
 backend/domains/shared/src/policy.spec.ts          |   95 +
 backend/domains/shared/src/policy.ts               |   74 +
 docs/framework/blueprints/BP-EST-CRASH-001.json    |  625 +++++
 .../contracts/BP-EST-CRASH-001.openapi.json        | 2531 ++++++++++++++++++++
 docs/framework/contracts/renaest-mapping.md        |  133 +
 .../product/domains/est/boat/use-cases/INDEX.md    |   21 +-
 .../domains/est/boat/use-cases/UC-BOAT-013.md      |   75 +
 docs/meta/knowledge-base/import-manifest.json      |    2 +-
 .../api-clients/src/generated/BP-EST-CRASH-001.ts  | 2142 +++++++++++++++++
 pnpm-lock.yaml                                     |   28 +
 tools/blueprints/generated-files.json              |   62 +
 tools/check-lifecycle-vocabulary.ts                |  264 +-
 work/rounds/R-0010/AUTHORIZATION.md                |   15 +
 work/rounds/R-0010/budget.json                     |  204 ++
 work/rounds/R-0010/compositions.json               |   90 +
 work/rounds/R-0010/contracts/CTG-0001.md           |   88 +
 work/rounds/R-0010/contracts/CTG-0002.md           |  129 +
 work/rounds/R-0010/plan.md                         |  129 +-
 work/rounds/R-0010/prompts/TASK-0001.md            |   72 +
 work/rounds/R-0010/prompts/TASK-0002.md            |   79 +
 work/rounds/R-0010/prompts/TASK-0003.md            |  107 +
 work/rounds/R-0010/prompts/TASK-0004.md            |   87 +
 work/rounds/R-0010/prompts/TASK-0005.md            |   70 +
 work/rounds/R-0010/prompts/TASK-0006.md            |   75 +
 work/rounds/R-0010/prompts/TASK-0007.md            |   81 +
 work/rounds/R-0010/prompts/TASK-0008.md            |   72 +
 work/rounds/R-0010/prompts/TASK-0009.md            |   67 +
 work/rounds/R-0010/prompts/TASK-0010.md            |   61 +
 work/rounds/R-0010/prompts/TASK-0011.md            |   58 +
 work/rounds/R-0010/reviews/prompt-review-1.md      |  913 +++++++
 .../R-0010/reviews/prompt-review-2.bridge.json     |   11 +
 work/rounds/R-0010/reviews/prompt-review-2.json    |  176 ++
 work/rounds/R-0010/reviews/prompt-review-2.md      |  986 ++++++++
 work/rounds/R-0010/reviews/prompt-review-3.md      | 1277 ++++++++++
 work/rounds/R-0010/reviews/prompt-review-4.md      | 1273 ++++++++++
 .../R-0010/reviews/prompt-review-5.bridge.json     |   11 +
 work/rounds/R-0010/reviews/prompt-review-5.json    |   21 +
 work/rounds/R-0010/reviews/prompt-review-5.md      | 1092 +++++++++
 .../R-0010/reviews/prompt-review-6.bridge.json     |   11 +
 work/rounds/R-0010/reviews/prompt-review-6.json    |   13 +
 work/rounds/R-0010/reviews/prompt-review-6.md      | 1119 +++++++++
 .../R-0010/reviews/prompt-review-7.bridge.json     |   11 +
 work/rounds/R-0010/reviews/prompt-review-7.json    |   39 +
 work/rounds/R-0010/reviews/prompt-review-7.md      |   27 +
 .../R-0010/reviews/prompt-review-8.bridge.json     |   11 +
 work/rounds/R-0010/reviews/prompt-review-8.json    |   14 +
 work/rounds/R-0010/reviews/prompt-review-8.md      |   18 +
 work/rounds/R-0010/tasks/TASK-0001.json            |   43 +
 work/rounds/R-0010/tasks/TASK-0002.json            |   45 +
 work/rounds/R-0010/tasks/TASK-0003.json            |   48 +
 work/rounds/R-0010/tasks/TASK-0004.json            |   52 +
 work/rounds/R-0010/tasks/TASK-0005.json            |   43 +
 work/rounds/R-0010/tasks/TASK-0006.json            |   44 +
 work/rounds/R-0010/tasks/TASK-0007.json            |   48 +
 work/rounds/R-0010/tasks/TASK-0008.json            |   40 +
 work/rounds/R-0010/tasks/TASK-0009.json            |   44 +
 work/rounds/R-0010/tasks/TASK-0010.json            |   44 +
 work/rounds/R-0010/tasks/TASK-0011.json            |   40 +
 129 files changed, 19084 insertions(+), 54 deletions(-)
```

Responda **somente** um objeto JSON válido compacto, sem Markdown e sem cercas de código. Primeiro byte `{`, último `}`. Chaves obrigatórias: `mode`=`delivery-review`, `round`=`R-0010`, `verdict`=`PASS|REVIEW|FAIL`, `findings` array de objetos `{severity,item,file,line,claim,fix}`, `notes` array. Escape aspas em valores JSON. `PASS` somente sem high, `REVIEW` para high corrigível, `FAIL` apenas para contradição canônica/ADR/Constituição ou violação de fronteira.
