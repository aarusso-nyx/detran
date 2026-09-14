# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-model` (rodada `R-0006`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-A` e o "mapa entregável → definições"
4. `work/rounds/R-0006/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0006/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0006/reports/*.md`, o diff anexado abaixo e os
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

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0006",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0006/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

### Grupo acoplado CTG-0001 (TASK-0001 Architect → TASK-0002 Inspector → TASK-0003 Engineer)

Entrega: `BP-INF-INFRACTION-001` e `BP-INF-NOTIFICATION-001` v1.1.0 (módulos gerados, DDL 38/59, OpenAPI), esquemas JSON dos cinco eventos publicados, contrato `contracts/CTG-0001.md`, biblioteca manuscrita `@detran/inf-deadlines`, guardas/eventos manuscritos da infração, regra de ciência da notificação, fixtures `30-fixtures-infraction.sql`, testes (18 + 84 + 7 unit; 7 + 7 integration; sensor `inf-rls` 52 → 58), wiring no `AppModule` e scripts. Base: `origin/main` d8fe83a; commit de planejamento f27f6e5; o diff abaixo é o staging completo do grupo (ainda não commitado: o PASS libera o commit).

Decisões do maestro que valem como premissa: `work/rounds/R-0006/plan.md` §Decisões M1–M12, §Triagem e §Bloqueios (lacunas §9 do contrato registradas, não bloqueantes). Gates do maestro em execução em paralelo (`pnpm check`, `backend:test:ci`, `rls-smoke`); os gates por tarefa constam dos relatórios.

### Critérios de aceitação (plan.md)

(comandos → resultado)

- `pnpm format:check` → sem diferenças. `pnpm blueprints:check` → "committed generated tree matches
  every blueprint". `pnpm contracts:check` → sincronizado.
- `pnpm verify:rls-ddl` → OK com o novo total de tabelas de tenant (134 na base); `pnpm verify:lifecycle-vocabulary` →
  OK (15 estados, 12 sub-estados, 18 timers — inalterado); `pnpm verify:decorators` → OK.
- `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
  `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/seed.sh` duas vezes → `seed.sh: done`, sem erro;
  `DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r6 pnpm backend:rls-smoke` → OK.
- `pnpm --filter @detran/inf-deadlines test` → verde (pacote criado nesta rodada, script `test` obrigatório);
  `pnpm --filter @detran/inf-infraction test:unit` e `test:integration` → verdes; idem `@detran/inf-notification`;
  `pnpm --filter @detran/inf-ait test:integration` → verde com a contagem de tabelas atualizada.
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → sem erro (baseline
  atual: 521 artefatos / 446 publicáveis; mudança só com explicação no PR).

### `git diff --cached --stat`

```
 backend/app/package.json                           |    3 +
 backend/app/src/app.module.ts                      |    7 +
 backend/database/ddl/38-inf-infraction.sql         |  140 +++
 backend/database/ddl/59-inf-notification.sql       |   98 ++
 backend/database/seed/30-fixtures-infraction.sql   |  268 +++++
 .../tests/integration/inf-rls.integration.spec.ts  |    8 +-
 backend/domains/inf/deadlines/src/calendar.ts      |   36 +
 backend/domains/inf/deadlines/src/clock.ts         |   31 +
 backend/domains/inf/deadlines/src/engine.ts        |  374 +++++++
 backend/domains/inf/deadlines/src/errors.ts        |   34 +
 backend/domains/inf/deadlines/src/index.ts         |   48 +-
 backend/domains/inf/deadlines/src/local-date.ts    |   81 ++
 backend/domains/inf/deadlines/src/timer-catalog.ts |  282 +++++
 backend/domains/inf/deadlines/src/timer-store.ts   |   85 ++
 backend/domains/inf/deadlines/src/types.ts         |  195 ++++
 .../deadlines/tests/unit/deadline-engine.spec.ts   |  502 +++++++++
 backend/domains/inf/infraction/package.json        |   39 +
 .../src/controllers/infraction-event.controller.ts |   55 +
 .../src/controllers/infraction-timer.controller.ts |   55 +
 .../src/controllers/infraction.controller.ts       |   43 +
 .../src/dto/create-infraction-event.dto.ts         |   18 +
 .../src/dto/create-infraction-timer.dto.ts         |   20 +
 .../infraction/src/dto/create-infraction.dto.ts    |   19 +
 .../src/entities/infraction-event.entity.ts        |   22 +
 .../src/entities/infraction-timer.entity.ts        |   24 +
 .../infraction/src/entities/infraction.entity.ts   |   23 +
 .../inf/infraction/src/handwritten/errors.ts       |   35 +
 .../inf/infraction/src/handwritten/events.ts       |  225 ++++
 .../src/handwritten/guards/infraction.guard.ts     |  128 +++
 .../handwritten/guards/infraction.transitions.ts   |  647 ++++++++++++
 .../inf/infraction/src/handwritten/index.ts        |   27 +
 backend/domains/inf/infraction/src/index.ts        |   18 +
 .../inf/infraction/src/infraction.module.ts        |   28 +
 .../repositories/infraction-event.repository.ts    |  139 +++
 .../repositories/infraction-timer.repository.ts    |  141 +++
 .../src/repositories/infraction.repository.ts      |  133 +++
 .../src/services/infraction-event.service.ts       |   28 +
 .../src/services/infraction-timer.service.ts       |   28 +
 .../infraction/src/services/infraction.service.ts  |   25 +
 .../integration/infraction-db.integration.spec.ts  |  222 ++++
 .../infraction/tests/unit/events.schema.spec.ts    |  253 +++++
 .../unit/infraction-transitions.matrix.spec.ts     |  374 +++++++
 backend/domains/inf/infraction/tsconfig.build.json |   11 +
 backend/domains/inf/infraction/tsconfig.json       |   14 +
 backend/domains/inf/infraction/vitest.config.ts    |   32 +
 backend/domains/inf/notification/package.json      |   39 +
 .../notice-acknowledgement.controller.ts           |   55 +
 .../notice-delivery-attempt.controller.ts          |   55 +
 .../src/controllers/notice.controller.ts           |   43 +
 .../src/dto/create-notice-acknowledgement.dto.ts   |    9 +
 .../src/dto/create-notice-delivery-attempt.dto.ts  |   10 +
 .../inf/notification/src/dto/create-notice.dto.ts  |   16 +
 .../src/entities/notice-acknowledgement.entity.ts  |   13 +
 .../src/entities/notice-delivery-attempt.entity.ts |   14 +
 .../inf/notification/src/entities/notice.entity.ts |   20 +
 .../src/handwritten/acknowledgement-mark.ts        |  131 +++
 .../inf/notification/src/handwritten/index.ts      |   11 +
 backend/domains/inf/notification/src/index.ts      |   18 +
 .../inf/notification/src/notification.module.ts    |   28 +
 .../notice-acknowledgement.repository.ts           |  131 +++
 .../notice-delivery-attempt.repository.ts          |  132 +++
 .../src/repositories/notice.repository.ts          |  127 +++
 .../src/services/notice-acknowledgement.service.ts |   28 +
 .../services/notice-delivery-attempt.service.ts    |   28 +
 .../notification/src/services/notice.service.ts    |   25 +
 .../notification-db.integration.spec.ts            |  219 ++++
 .../tests/unit/acknowledgement-mark.spec.ts        |   75 ++
 .../domains/inf/notification/tsconfig.build.json   |   11 +
 backend/domains/inf/notification/tsconfig.json     |   14 +
 backend/domains/inf/notification/vitest.config.ts  |   32 +
 .../blueprints/BP-INF-INFRACTION-001.json          |  572 ++++++++++
 .../blueprints/BP-INF-NOTIFICATION-001.json        |  355 +++++++
 .../contracts/BP-INF-INFRACTION-001.openapi.json   | 1106 +++++++++++++++++++
 .../contracts/BP-INF-NOTIFICATION-001.openapi.json |  802 ++++++++++++++
 docs/framework/schemas/README.md                   |    3 +
 .../events/inf.infraction.changed.schema.json      |  199 ++++
 .../inf.infraction.penalty-final.schema.json       |  126 +++
 .../events/inf.infraction.refund-due.schema.json   |  114 ++
 .../schemas/events/inf.timer.expired.schema.json   |  149 +++
 .../events/inf.timer.rescheduled.schema.json       |  155 +++
 package.json                                       |    6 +-
 pnpm-lock.yaml                                     |  108 +-
 tools/blueprints/generated-files.json              |   44 +
 work/rounds/R-0006/budget.json                     |   27 +-
 work/rounds/R-0006/contracts/CTG-0001.md           | 1112 ++++++++++++++++++++
 work/rounds/R-0006/plan.md                         |   25 +-
 work/rounds/R-0006/tasks/TASK-0001.json            |    4 +-
 work/rounds/R-0006/tasks/TASK-0002.json            |    4 +-
 work/rounds/R-0006/tasks/TASK-0003.json            |    2 +-
 89 files changed, 11186 insertions(+), 29 deletions(-)
```

### Arquivos gerados (fora do diff inline; regeneráveis; verificados por `blueprints:check`/`contracts:check`; leia na worktree se precisar)

- `backend/database/ddl/38-inf-infraction.sql`
- `backend/database/ddl/59-inf-notification.sql`
- `backend/domains/inf/infraction/package.json`
- `backend/domains/inf/infraction/src/controllers/infraction-event.controller.ts`
- `backend/domains/inf/infraction/src/controllers/infraction-timer.controller.ts`
- `backend/domains/inf/infraction/src/controllers/infraction.controller.ts`
- `backend/domains/inf/infraction/src/dto/create-infraction-event.dto.ts`
- `backend/domains/inf/infraction/src/dto/create-infraction-timer.dto.ts`
- `backend/domains/inf/infraction/src/dto/create-infraction.dto.ts`
- `backend/domains/inf/infraction/src/entities/infraction-event.entity.ts`
- `backend/domains/inf/infraction/src/entities/infraction-timer.entity.ts`
- `backend/domains/inf/infraction/src/entities/infraction.entity.ts`
- `backend/domains/inf/infraction/src/index.ts`
- `backend/domains/inf/infraction/src/infraction.module.ts`
- `backend/domains/inf/infraction/src/repositories/infraction-event.repository.ts`
- `backend/domains/inf/infraction/src/repositories/infraction-timer.repository.ts`
- `backend/domains/inf/infraction/src/repositories/infraction.repository.ts`
- `backend/domains/inf/infraction/src/services/infraction-event.service.ts`
- `backend/domains/inf/infraction/src/services/infraction-timer.service.ts`
- `backend/domains/inf/infraction/src/services/infraction.service.ts`
- `backend/domains/inf/infraction/tsconfig.build.json`
- `backend/domains/inf/infraction/tsconfig.json`
- `backend/domains/inf/infraction/vitest.config.ts`
- `backend/domains/inf/notification/package.json`
- `backend/domains/inf/notification/src/controllers/notice-acknowledgement.controller.ts`
- `backend/domains/inf/notification/src/controllers/notice-delivery-attempt.controller.ts`
- `backend/domains/inf/notification/src/controllers/notice.controller.ts`
- `backend/domains/inf/notification/src/dto/create-notice-acknowledgement.dto.ts`
- `backend/domains/inf/notification/src/dto/create-notice-delivery-attempt.dto.ts`
- `backend/domains/inf/notification/src/dto/create-notice.dto.ts`
- `backend/domains/inf/notification/src/entities/notice-acknowledgement.entity.ts`
- `backend/domains/inf/notification/src/entities/notice-delivery-attempt.entity.ts`
- `backend/domains/inf/notification/src/entities/notice.entity.ts`
- `backend/domains/inf/notification/src/index.ts`
- `backend/domains/inf/notification/src/notification.module.ts`
- `backend/domains/inf/notification/src/repositories/notice-acknowledgement.repository.ts`
- `backend/domains/inf/notification/src/repositories/notice-delivery-attempt.repository.ts`
- `backend/domains/inf/notification/src/repositories/notice.repository.ts`
- `backend/domains/inf/notification/src/services/notice-acknowledgement.service.ts`
- `backend/domains/inf/notification/src/services/notice-delivery-attempt.service.ts`
- `backend/domains/inf/notification/src/services/notice.service.ts`
- `backend/domains/inf/notification/tsconfig.build.json`
- `backend/domains/inf/notification/tsconfig.json`
- `backend/domains/inf/notification/vitest.config.ts`
- `docs/framework/contracts/BP-INF-INFRACTION-001.openapi.json`
- `docs/framework/contracts/BP-INF-NOTIFICATION-001.openapi.json`
- `pnpm-lock.yaml`
- `tools/blueprints/generated-files.json`

### Arquivos grandes fora do diff inline (leia na worktree)

- `backend/database/seed/30-fixtures-infraction.sql`
- `work/rounds/R-0006/budget.json`
- `work/rounds/R-0006/contracts/CTG-0001.md`
- `work/rounds/R-0006/plan.md`
- `work/rounds/R-0006/tasks/TASK-0001.json`
- `work/rounds/R-0006/tasks/TASK-0002.json`
- `work/rounds/R-0006/tasks/TASK-0003.json`

### Relatórios

#### `work/rounds/R-0006/reports/TASK-0001.md`

Papel: Architect (Constituição Art. 6)
Tarefa: TASK-0001
Arquivos criados/alterados: `docs/framework/blueprints/BP-INF-INFRACTION-001.json`, `docs/framework/blueprints/BP-INF-NOTIFICATION-001.json`, `docs/framework/schemas/events/{inf.infraction.changed,inf.infraction.penalty-final,inf.infraction.refund-due,inf.timer.expired,inf.timer.rescheduled}.schema.json`, `docs/framework/schemas/README.md`, `work/rounds/R-0006/contracts/CTG-0001.md` (1076 linhas); gerados: `backend/database/ddl/38-inf-infraction.sql`, `59-inf-notification.sql`, `backend/domains/inf/{infraction,notification}/**` (21 arquivos cada), `docs/framework/contracts/BP-INF-{INFRACTION,NOTIFICATION}-001.openapi.json`, `tools/blueprints/generated-files.json` (manifesto do gerador).
Comandos executados e saída resumida: prettier --write blueprints antes de gerar; `pnpm blueprints:generate` exit 0; `pnpm contracts:openapi` exit 0; `prettier --check` (blueprints, schemas, contracts) OK; `pnpm blueprints:check` passed; `pnpm contracts:check` in sync; `pnpm verify:rls-ddl` OK (140 tenant tables); `pnpm verify:lifecycle-vocabulary` OK (15/12/18); `pnpm verify:decorators` OK (532 handlers); `apply.sh --full` detran_r6a done; `seed.sh` detran_r6a done; `\d inf.infraction` mostra FKs ait_ait, state/substate/subject_kind/payment_tier/closure_motive/transition refs, RLS forçada + enforce_tenant_id; `pnpm docs:kb:check` OK (521/446); `pnpm format:check` OK; calendário conferido contra casos 1,2,3,4,7,9,13 do §7.
Critérios de aceitação: prettier PASS; blueprints:check PASS; contracts:check PASS; verify:rls-ddl (140) PASS; verify:lifecycle-vocabulary PASS; apply.sh PASS; seed.sh PASS; \d inf.infraction PASS; CTG-0001.md (§3 46 linhas, §3.1 guardas/efeitos/timers, §4 matriz de erro, §5 API do motor + 18 casos, §6 API manuscrita, §7 fixtures) PASS; 5 esquemas PASS; typecheck dos pacotes novos não avaliado (M7).
Fora do escopo / deixado: `handwrittenExports` não declarado (export para arquivo inexistente quebraria typecheck; §9.6 do contrato); `@detran/inf-deadlines` não declarado como dependência dos blueprints (§9.7); fixtures SQL são do Inspector (M6) — especificação completa em §7 (15 infrações, 80 linhas de timer); correções de `rait-error-catalog.md` §3.9 (falta `T-PAR-3A` em SUSPENSION_LEGAL_TIMER) e `rait-deadline-engine.md` §1 → TASK-0008; nenhuma fixture com marco SNE (ciência ficta joga marcos para o futuro; §7.3); sem código manuscrito, testes, install ou git.
OD tocadas ou propostas: premissas OD-301, OD-303, OD-304, OD-305, OD-019 (§8 do contrato). Propostas (§9): (1) `TIMER_REPROGRAMADO` ausente de `inf.infraction_event_ref` — não pode ser gravado em `infraction_event` com a FK; (2) entrada em `INSTANCIA_ENCERRADA` com `paid=true` cai em `PENDENTE_PAGAMENTO` pela tabela sem caminho para `QUITADA`; (3) assimetria da admissão em 2ª instância (linha 32 única entrada em `EM_JULGAMENTO_CETRAN`); (4) fixture 0014 (`EXTINTO_PRESCRICAO`) exige `committed_on` em 2024 sobre AIT `AM-2026-000014`.
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0002.md`

Papel: Inspector (Constituição Art. 6)
Tarefa: TASK-0002
Arquivos criados/alterados: `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts` (18 casos §7); `backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts` (63 casos; lê o bloco INSERT do DDL 14); `backend/domains/inf/infraction/tests/unit/events.schema.spec.ts` (21 casos); `backend/domains/inf/infraction/tests/integration/infraction-db.integration.spec.ts` (7); `backend/domains/inf/notification/tests/unit/acknowledgement-mark.spec.ts` (7, um por canal); `backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts` (7); `backend/database/seed/30-fixtures-infraction.sql` (15 infrações, 91 timers, 19 avisos, 19 ciências, 19 tentativas, 69 eventos); `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts` (sensor 52 → 58).
Comandos executados e saída resumida: prettier --check OK; `pnpm format:check` OK; `apply.sh --full` detran_r6 done; `seed.sh` ×2 done (idempotente); `count(*) inf.infraction` = 15; `inf-ait test:integration` 2 passed; `inf-infraction test:integration` 7 passed; `inf-notification test:integration` 7 passed; `inf-deadlines test` 18 failed (FixedClock ausente — TASK-0003); `inf-infraction test:unit` 2 arquivos vermelhos (módulo `src/handwritten/index.js` ausente; 84 casos); `inf-notification test:unit` 1 arquivo vermelho (7 casos); `verify:lifecycle-vocabulary` OK; `verify:rls-ddl` OK (140); typecheck dos três pacotes falha só por módulo/export ausente.
Critérios de aceitação: prettier PASS; apply PASS; seed ×2 PASS; count 15 PASS; inf-ait integration (58) PASS; infraction integration PASS; notification integration PASS; deadlines vermelho 18 PASS; unit vermelhos PASS; matriz 46 linhas PASS. `pnpm check` FAIL por construção (typecheck compila `tests/**` que importam a API de TASK-0003).
Matriz transição → teste → resultado: 46 linhas cobertas em `infraction-transitions.matrix.spec.ts` (§ linhas vigentes: 1–26, 28–37, 39, 40, 42–46; § a_confirmar 27 e 38 → `resolveTransition` devolve `null`, alerta, OD-301; linha 41 → `RAIT.INFRACTION_CLOSED_NO_REVISION`); negativos exaustivos: 8 `it` de `RAIT.INFRACTION_STATE_INVALID` por estado não terminal, 6 `it` de `RAIT.INFRACTION_TERMINAL`, 1 `it` de `RAIT.INFRACTION_CLOSED_NO_REVISION` (21 gatilhos). Qualifiers adotados: 13 `NP`, 14 `reconhecimento`, 15 sem qualifier, 18 `reconhecimento`, 25 `provido`, 33 `negado`, 36 `provido`, 21/22/23/24/34/35 `prazo_aberto`|`prazo_vencido`, 4 `NA`, 7 `defesa_previa`, 16 `jari`, 30 `cetran`, 9 `acolhida`, 10 `indeferida`.
Fora do escopo / deixado: fixture de NA por SNE com ciência ficta excluída pelo contrato §7.3 (coberta pelos casos 7/8 e acknowledgement-mark); publicação de `TIMER_REPROGRAMADO` (sem porta de eventos na API §5; lacuna 1) — teste assere os dados do envelope; `ajv` ausente → comparação estrutural dos JSON Schemas; gerador do seed ficou no scratchpad (fora de `tools/**`); sem git/install/src/DDL/blueprints.
OD tocadas ou propostas: carregadas OD-301, OD-303, OD-304, OD-305. Propostas (sem id): (1) caso 6 — piso de 30 dias validado por `arm` nesta rodada (asserção sobre `arm`, 422 `RAIT.INFRACTION_NOTICE_DEADLINE_SHORT`); (2) `acknowledgementMark` síncrona sem motor injetado (teste segue a tabela); (3) contrato §3.3 diz 42 linhas vigentes, DDL dá 43; (4) qualifier por linha não enumerado — ambiguidade genuína entre linhas 22 e 25 (`from_substate` nulo em ambas) resolvida por `prazo_vencido` × `provido`; (5) `points`/`amount` de exemplo nos limites do esquema, ids nulos para pagamento/ato; (6) data da transição 9 da infração 0012 derivada de T-DEF; (7) convenções de instante (`satisfied_at`, `expired_at`, `cancel_reason`, `actor_kind`) documentadas no cabeçalho do seed. Aceito `committed_on` 2024 na fixture 0014.
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0003.md`

Papel: Engineer (Constituição Art. 6)
Tarefa: TASK-0003
Arquivos criados/alterados: `@detran/inf-deadlines` (`src/{types,errors,local-date,clock,calendar,timer-catalog,timer-store,engine,index}.ts`); infração manuscrita (`src/handwritten/{errors,events,index}.ts`, `guards/infraction.transitions.ts`, `guards/infraction.guard.ts`); notificação manuscrita (`src/handwritten/{acknowledgement-mark,index}.ts`); blueprints `BP-INF-INFRACTION-001`/`BP-INF-NOTIFICATION-001` (`handwrittenExports: ["handwritten/index"]`) e regeneração (módulos, DDL 38/59, OpenAPI, manifesto); `backend/app/src/app.module.ts` (InfractionModule, NotificationModule); `backend/app/package.json` (3 deps workspace); `package.json` raiz (`build`, `backend:test:unit`, `backend:test:integration`). Não tocados: testes, DDL manuscrito, seeds, contratos, lockfile.
Comandos executados e saída resumida: prettier OK; `inf-deadlines test` 18 passed; `inf-infraction test:unit` 84 passed; `inf-notification test:unit` 7 passed; `blueprints:generate`/`contracts:openapi` OK; `blueprints:check` passed; `contracts:check` in sync; typecheck dos 3 pacotes OK; `@detran/app typecheck` OK após symlinks manuais de workspace (artefato de verificação; `pnpm install` do maestro os recria); `pnpm typecheck` exit 0; integration infraction 7 / notification 7 / ait 2 passed; `verify:decorators` OK (532); `verify:senatran-boundary` OK (1006 arquivos); `verify:rls-ddl` OK (140); `verify:lifecycle-vocabulary` OK; `format:check` OK; `backend:test:unit` verde (inclui app 49); `build` dos três pacotes OK. Um `git status --porcelain` executado (leitura pura, contra a regra; registrado).
Critérios de aceitação: 11/11 PASS (critério 7 — typecheck de `@detran/app` — dependente do `pnpm install` do maestro).
Fora do escopo / deixado: bump dos blueprints para v1.1.0 (Architect); sem `handwrittenProviders`; `extension_count` sem verbo de prorrogação (R-0007); `TIMER_REPROGRAMADO` sem porta de eventos (lacuna 1 do contrato); varredura/rotas/persistência (R-0007); extensões aditivas da API (`addCalendarDays/Months/Years`, `isWeekend`, `weekdayOf`, `INFRACTION_TIMER_DEFINITIONS`, `DeadlineEngineDeps.tenantTz?`, `DeadlineError.messageKey`, `INFRACTION_TERMINAL_STATES`, `INFRACTION_CLOSED_TRIGGERS`, `INFRACTION_TRANSITION_QUALIFIERS`, índice `Record<string, ZodType>`); `RAIT.INTERNAL` (500) para defeitos de chamada (catálogo §1 regra 7); `RaitError extends StynxError` (`@stynx-nyx/core` exporta); `DeadlineError extends Error`.
OD tocadas ou propostas: premissas OD-301, OD-303, OD-304, OD-305, OD-019. Propostas: (1) `acknowledgementMark` síncrona sem prorrogação ao dia útil (prorrogação vem de `computeDue('T-SNE-CIENCIA')` na expedição); (2) qualificadores por linha — linha 25 aceita `provido`/`negado` (não `nao_conhecido`, que é 21/22); 33 = `negado`/`nao_conhecido`, 36 = `provido` (não expressa "recurso da autoridade"); (3) piso de 30 dias validado em `arm` (exigido pelo teste); (4) contrato §3.3 diz 42 linhas vigentes, DDL tem 43.
Bloqueios: nenhum técnico; pendências do maestro: `pnpm install` + `chore(deps)`; bump v1.1.0 dos blueprints.

### Diff completo dos arquivos manuscritos (34 arquivos)

```diff
diff --git a/backend/app/package.json b/backend/app/package.json
index 6554609..f3c3e82 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -38,7 +38,10 @@
     "@detran/ch-toxicology": "workspace:*",
     "@detran/inf-ait": "workspace:*",
     "@detran/inf-alcohol": "workspace:*",
+    "@detran/inf-deadlines": "workspace:*",
+    "@detran/inf-infraction": "workspace:*",
     "@detran/inf-measures": "workspace:*",
+    "@detran/inf-notification": "workspace:*",
     "@detran/inf-normative": "workspace:*",
     "@detran/inf-rait-case": "workspace:*",
     "@detran/inf-rait-session": "workspace:*",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index d9d4a93..01a7a39 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -63,7 +63,9 @@ import { ToxicologyModule } from '@detran/ch-toxicology';
 import { ComplaintsModule } from '@detran/portal-complaints';
 import { AitModule } from '@detran/inf-ait';
 import { AlcoholModule } from '@detran/inf-alcohol';
+import { InfractionModule } from '@detran/inf-infraction';
 import { MeasuresModule } from '@detran/inf-measures';
+import { NotificationModule } from '@detran/inf-notification';
 import { NormativeModule } from '@detran/inf-normative';
 import { RaitCaseModule } from '@detran/inf-rait-case';
 import { RaitSessionModule } from '@detran/inf-rait-session';
@@ -349,6 +351,11 @@ export class AppModule {
         RaitCaseModule,
         RaitWorklistModule,
         RaitSessionModule,
+        // Infraction aggregate, notices and the deadline engine library
+        // (CTG-0001, ADR-0016): pure guards and event schemas in this round —
+        // routes and the sweep job land in R-0007.
+        InfractionModule,
+        NotificationModule,
         // Speed meters stay behind the `teat.speed_meters` flag (steering H.54:
         // the agency does not operate meters today).
         ...(detranFeatureFlagSet().flags['teat.speed_meters']?.default === true
diff --git a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
index 56f0b40..995c6e9 100644
--- a/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
+++ b/backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts
@@ -38,11 +38,13 @@ describe('inf database contract', () => {
         order by tables.table_name`,
     );
     // Tenant tables: ait (9), normative (6), measures (9), alcohol (6), rait case/worklist/session (21),
-    // speed (3) — 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`),
-    // which must never carry tenant RLS and must be the only unprotected tables in the schema.
+    // speed (3), infraction (3: infraction, infraction_timer, infraction_event — DDL 38) and
+    // notification (3: notice, notice_acknowledgement, notice_delivery_attempt — DDL 59) —
+    // 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`), which must
+    // never carry tenant RLS and must be the only unprotected tables in the schema.
     const tenantTables = result.rows.filter((row) => row.has_tenant_id);
     const referenceTables = result.rows.filter((row) => !row.has_tenant_id);
-    expect(tenantTables).toHaveLength(52);
+    expect(tenantTables).toHaveLength(58);
     expect(referenceTables).toHaveLength(9);
     expect(
       tenantTables.every(
diff --git a/backend/domains/inf/deadlines/src/calendar.ts b/backend/domains/inf/deadlines/src/calendar.ts
new file mode 100644
index 0000000..4088a24
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/calendar.ts
@@ -0,0 +1,36 @@
+// Calendário em memória a partir de
+// docs/framework/arch/fixtures/calendar-2026.json. Feriado = chave de
+// `national`, `am` ou `manaus`; `optional` (ponto facultativo) **não** é feriado
+// (CTG-0001 §5 nota 3). Dia útil = seg–sex fora dessa lista
+// (rait-deadline-engine.md §2).
+import { addCalendarDays, isWeekend } from './local-date.js';
+import type { Calendar, CalendarJson, LocalDate } from './types.js';
+
+export class InMemoryCalendar implements Calendar {
+  private readonly holidays: ReadonlySet<LocalDate>;
+
+  constructor(calendarJson: CalendarJson) {
+    this.holidays = new Set([
+      ...Object.keys(calendarJson.national ?? {}),
+      ...Object.keys(calendarJson.am ?? {}),
+      ...Object.keys(calendarJson.manaus ?? {}),
+    ]);
+  }
+
+  /**
+   * O calendário da fixture é o do órgão (nacional + AM + Manaus); o argumento
+   * `tenantId` existe para a implementação que lê `rait_holiday` por tenant.
+   */
+  async isBusinessDay(d: LocalDate, _tenantId: string): Promise<boolean> {
+    return !isWeekend(d) && !this.holidays.has(d);
+  }
+
+  /** Primeiro dia útil **depois** de `d` (nunca `d`). */
+  async nextBusinessDay(d: LocalDate, tenantId: string): Promise<LocalDate> {
+    let candidate = addCalendarDays(d, 1);
+    while (!(await this.isBusinessDay(candidate, tenantId))) {
+      candidate = addCalendarDays(candidate, 1);
+    }
+    return candidate;
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/clock.ts b/backend/domains/inf/deadlines/src/clock.ts
new file mode 100644
index 0000000..e6013a0
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/clock.ts
@@ -0,0 +1,31 @@
+// Relógio fixo dos testes e das fixtures (rait-test-strategy.md §6). O motor
+// nunca chama `Date.now()`: o relógio é sempre injetado (CODESTYLE §TypeScript).
+import type { Clock, LocalDate } from './types.js';
+
+export class FixedClock implements Clock {
+  /** Fuso do tenant em que `fixedToday` é a data civil (`auth.tenants.timezone`). */
+  readonly tz: string;
+  private readonly fixedToday: LocalDate;
+
+  constructor(today: LocalDate, tz: string) {
+    this.fixedToday = today;
+    this.tz = tz;
+  }
+
+  /**
+   * A data fixa. O argumento existe para a implementação de produção (que lê o
+   * fuso do tenant); aqui o fuso já está no construtor.
+   */
+  today(_tenantTz: string): LocalDate {
+    return this.fixedToday;
+  }
+
+  /**
+   * Instante determinístico do dia fixo (meio-dia UTC): o motor só usa `now()`
+   * para `satisfied_at`/`expired_at`, e a varredura compara datas, não
+   * instantes (rait-deadline-engine.md §5).
+   */
+  now(): Date {
+    return new Date(`${this.fixedToday}T12:00:00.000Z`);
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/engine.ts b/backend/domains/inf/deadlines/src/engine.ts
new file mode 100644
index 0000000..c7cf81c
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/engine.ts
@@ -0,0 +1,374 @@
+// Motor de prazos: ciclo de vida de um timer (rait-deadline-engine.md §3),
+// contagem da §2 e varredura da §5, sobre as portas `Clock`, `Calendar`,
+// `TimerCatalog` e `TimerStore` (CTG-0001 §5). Sem rota, sem job, sem banco e
+// sem `Date.now()`.
+import { randomUUID } from 'node:crypto';
+
+import { DeadlineError } from './errors.js';
+import {
+  addCalendarDays,
+  addCalendarMonths,
+  addCalendarYears,
+} from './local-date.js';
+import type {
+  ArmInput,
+  Calendar,
+  Clock,
+  Deadline,
+  DeadlineEngine,
+  ExpiryEffect,
+  ExpiryKind,
+  LocalDate,
+  SuspensionAct,
+  SweepReport,
+  TimelinessInput,
+  TimelinessResult,
+  TimerCatalog,
+  TimerCode,
+  TimerDefinition,
+  TimerStore,
+} from './types.js';
+
+/**
+ * Piso legal da data-limite impressa de NA/NP: 30 dias corridos da expedição /
+ * ciência (`inf.infraction_timer_ref.start_mark` de T-DEF e T-NP-VENC, "piso 30
+ * dias"; CTB arts. 281-A e 282 §4º; RN-RAIT-101, RN-RAIT-102).
+ */
+const NOTICE_MINIMUM_DAYS = 30;
+
+/** Lote padrão da varredura (rait-deadline-engine.md §5). */
+const SWEEP_LIMIT = 500;
+
+/**
+ * Timers de extinção: a suspensão por ato é vedada sobre eles
+ * (rait-deadline-engine.md §2, "Suspensão"; CTG-0001 §4 e §5 nota 5).
+ */
+const SUSPENSION_FORBIDDEN: ReadonlySet<TimerCode> = new Set([
+  'T-DEC',
+  'T-JUL-24M',
+  'T-PAR-3A',
+  'T-PRESC-5A',
+]);
+
+export interface DeadlineEngineDeps {
+  clock: Clock;
+  calendar: Calendar;
+  catalog: TimerCatalog;
+  store: TimerStore;
+  /**
+   * Fuso do tenant para `clock.today()` (`auth.tenants.timezone`,
+   * rait-deadline-engine.md §5). Omitido, o relógio injetado responde com o seu
+   * próprio fuso (é o caso de `FixedClock`).
+   */
+  tenantTz?: string;
+}
+
+function internal(message: string, context: Record<string, unknown>) {
+  return new DeadlineError('RAIT.INTERNAL', { status: 500, context, message });
+}
+
+/** `expiry_kind` efetivo: `a_confirmar` vence como alerta (H.46, OD-301/304). */
+function effectiveExpiryKind(definition: TimerDefinition): ExpiryKind {
+  return definition.status === 'a_confirmar' ? 'alerta' : definition.expiryKind;
+}
+
+function isObservableEffect(kind: ExpiryKind): kind is ExpiryEffect {
+  return (
+    kind === 'transicao' ||
+    kind === 'alerta' ||
+    kind === 'marco' ||
+    kind === 'regra'
+  );
+}
+
+class Engine implements DeadlineEngine {
+  private readonly clock: Clock;
+  private readonly calendar: Calendar;
+  private readonly catalog: TimerCatalog;
+  private readonly store: TimerStore;
+  private readonly tenantTz: string;
+
+  constructor(deps: DeadlineEngineDeps) {
+    this.clock = deps.clock;
+    this.calendar = deps.calendar;
+    this.catalog = deps.catalog;
+    this.store = deps.store;
+    this.tenantTz = deps.tenantTz ?? '';
+  }
+
+  /** Soma `days` dias úteis ao marco (o dia do marco não conta). */
+  private async addBusinessDays(
+    startOn: LocalDate,
+    days: number,
+    tenantId: string,
+  ): Promise<LocalDate> {
+    let cursor = startOn;
+    for (let counted = 0; counted < days; counted += 1) {
+      cursor = await this.calendar.nextBusinessDay(cursor, tenantId);
+    }
+    return cursor;
+  }
+
+  /** `due_on = próximo dia útil >= raw_due_on` (nunca antecipa). */
+  private async roundForward(
+    rawDueOn: LocalDate,
+    tenantId: string,
+  ): Promise<LocalDate> {
+    return (await this.calendar.isBusinessDay(rawDueOn, tenantId))
+      ? rawDueOn
+      : this.calendar.nextBusinessDay(rawDueOn, tenantId);
+  }
+
+  private async rawDueFor(
+    definition: TimerDefinition,
+    startOn: LocalDate,
+    duration: number,
+    tenantId: string,
+  ): Promise<LocalDate> {
+    switch (definition.durationUnit) {
+      case 'dias_corridos':
+        return addCalendarDays(startOn, duration);
+      // SLA-30 é meta operacional contada em dias úteis
+      // (`start_mark`: "protocolo (defesa) / entrada na JARI (dias úteis)").
+      case 'dias_uteis':
+      case 'meta':
+        return this.addBusinessDays(startOn, duration, tenantId);
+      case 'meses':
+        return addCalendarMonths(startOn, duration);
+      case 'anos':
+        return addCalendarYears(startOn, duration);
+      default:
+        throw internal('Unidade de prazo sem regra de contagem.', {
+          timerCode: definition.code,
+          durationUnit: definition.durationUnit,
+        });
+    }
+  }
+
+  async computeDue(
+    code: TimerCode,
+    startOn: LocalDate,
+    tenantId: string,
+    printedDeadline?: LocalDate,
+  ): Promise<{ rawDueOn: LocalDate; dueOn: LocalDate }> {
+    const definition = this.catalog.get(code);
+    // Data impressa (T-DEF, T-NP-VENC): o vencimento é a data da NA/NP e o
+    // motor nunca a substitui por cálculo próprio (CTG-0001 §5 nota 4).
+    if (definition.durationUnit === 'data_impressa') {
+      if (!printedDeadline) {
+        throw internal('Timer de data impressa exige printedDeadline.', {
+          timerCode: code,
+        });
+      }
+      return { rawDueOn: printedDeadline, dueOn: printedDeadline };
+    }
+    if (definition.durationValue === null) {
+      throw internal('Timer sem duração em inf.infraction_timer_ref.', {
+        timerCode: code,
+      });
+    }
+    const rawDueOn = await this.rawDueFor(
+      definition,
+      startOn,
+      definition.durationValue,
+      tenantId,
+    );
+    return { rawDueOn, dueOn: await this.roundForward(rawDueOn, tenantId) };
+  }
+
+  async arm(input: ArmInput): Promise<Deadline> {
+    const definition = this.catalog.get(input.code);
+    if (definition.durationUnit === 'data_impressa') {
+      this.assertPrintedDeadline(input);
+    }
+    // Idempotência por (owner_id, código, started_on) — é
+    // `ux_inf_infraction_timer_arm` (rait-deadline-engine.md §3).
+    const existing = await this.store.findByArm(
+      input.tenantId,
+      input.ownerId,
+      input.code,
+      input.startOn,
+    );
+    if (existing) return existing;
+
+    const { rawDueOn, dueOn } = await this.computeDue(
+      input.code,
+      input.startOn,
+      input.tenantId,
+      input.printedDeadline,
+    );
+    return this.store.insert({
+      id: randomUUID(),
+      tenantId: input.tenantId,
+      ownerKind: input.ownerKind,
+      ownerId: input.ownerId,
+      code: input.code,
+      instance: input.instance ?? null,
+      startBasis: input.startBasis,
+      startedOn: input.startOn,
+      rawDueOn,
+      dueOn,
+      ceilingOn: null,
+      businessDays: definition.durationUnit === 'dias_uteis',
+      status: 'armado',
+      satisfiedAt: null,
+      expiredAt: null,
+      cancelReason: null,
+      suspendedByActId: null,
+      suspendedDays: 0,
+      extensionCount: 0,
+      legalBasis: input.legalBasis,
+    });
+  }
+
+  /** Piso de 30 dias corridos da data-limite impressa (CTG-0001 §4). */
+  private assertPrintedDeadline(input: ArmInput): void {
+    if (!input.printedDeadline) {
+      throw internal('Timer de data impressa exige printedDeadline.', {
+        timerCode: input.code,
+      });
+    }
+    const minimum = addCalendarDays(input.startOn, NOTICE_MINIMUM_DAYS);
+    if (input.printedDeadline < minimum) {
+      throw new DeadlineError('RAIT.INFRACTION_NOTICE_DEADLINE_SHORT', {
+        status: 422,
+        context: { printedDeadline: input.printedDeadline, minimum },
+        message:
+          'A data-limite impressa é menor que o piso de 30 dias da ciência.',
+      });
+    }
+  }
+
+  private async open(id: string): Promise<Deadline> {
+    const deadline = await this.store.findById(id);
+    if (!deadline) {
+      throw internal('Timer inexistente.', { deadlineId: id });
+    }
+    return deadline;
+  }
+
+  /**
+   * `satisfazer(id, evento)`: o timer sai da varredura e nunca é apagado. O
+   * motivo vive no envelope do evento, não em coluna de `inf.infraction_timer`
+   * (CTG-0001 §1.2).
+   */
+  async satisfy(id: string, _reason: string): Promise<void> {
+    const deadline = await this.open(id);
+    if (deadline.status !== 'armado') return;
+    await this.store.update({
+      ...deadline,
+      status: 'satisfeito',
+      satisfiedAt: this.clock.now(),
+    });
+  }
+
+  async cancel(id: string, reason: string): Promise<void> {
+    const deadline = await this.open(id);
+    if (deadline.status !== 'armado') return;
+    await this.store.update({
+      ...deadline,
+      status: 'cancelado',
+      cancelReason: reason,
+    });
+  }
+
+  async reschedule(id: string, act: SuspensionAct): Promise<Deadline> {
+    const deadline = await this.open(id);
+    if (SUSPENSION_FORBIDDEN.has(deadline.code)) {
+      throw new DeadlineError('RAIT.SUSPENSION_LEGAL_TIMER', {
+        status: 422,
+        context: { timerCode: deadline.code },
+        message: 'A suspensão é vedada sobre prazos de extinção.',
+      });
+    }
+    if (deadline.status !== 'armado') {
+      throw internal('Só um timer armado pode ser reprogramado.', {
+        deadlineId: id,
+        status: deadline.status,
+      });
+    }
+    const definition = this.catalog.get(deadline.code);
+    const suspendedDays = deadline.suspendedDays + act.days;
+    // Reprograma somando os dias suspensos na mesma unidade do timer
+    // (rait-deadline-engine.md §2; CTG-0001 §5 nota 5). Em timer de data
+    // impressa a data da NA/NP permanece como `raw_due_on`.
+    const rawDueOn =
+      definition.durationUnit === 'data_impressa'
+        ? deadline.rawDueOn
+        : await this.rawDueFor(
+            definition,
+            deadline.startedOn,
+            (definition.durationValue ?? 0) + suspendedDays,
+            deadline.tenantId,
+          );
+    const base =
+      definition.durationUnit === 'data_impressa'
+        ? addCalendarDays(rawDueOn, suspendedDays)
+        : rawDueOn;
+    return this.store.update({
+      ...deadline,
+      rawDueOn,
+      dueOn: await this.roundForward(base, deadline.tenantId),
+      suspendedDays,
+      suspendedByActId: act.id,
+    });
+  }
+
+  async timeliness(input: TimelinessInput): Promise<TimelinessResult> {
+    const deadline = await this.store.findOpen(
+      input.tenantId,
+      input.ownerId,
+      input.code,
+    );
+    if (!deadline) {
+      throw internal('Nenhum timer aberto para comparar a tempestividade.', {
+        timerCode: input.code,
+        ownerId: input.ownerId,
+      });
+    }
+    // `marco_da_peça <= due_on` do timer aberto (rait-deadline-engine.md §2).
+    return {
+      timely: input.pieceMarkOn <= deadline.dueOn,
+      dueOn: deadline.dueOn,
+      basis: deadline.legalBasis,
+    };
+  }
+
+  async sweep(tenantId: string, limit = SWEEP_LIMIT): Promise<SweepReport> {
+    const today = this.clock.today(this.tenantTz);
+    // A comparação é por data: vence quem tem `due_on < hoje` no fuso do tenant.
+    const due = await this.store.listDue(
+      tenantId,
+      addCalendarDays(today, -1),
+      limit,
+    );
+    const expired: Array<SweepReport['expired'][number]> = [];
+    let skipped = 0;
+    for (const deadline of due) {
+      const kind = effectiveExpiryKind(this.catalog.get(deadline.code));
+      // `guarda` e `indicador` não vencem (rait-deadline-engine.md §3).
+      if (!isObservableEffect(kind)) {
+        skipped += 1;
+        continue;
+      }
+      await this.store.update({
+        ...deadline,
+        status: 'vencido',
+        expiredAt: this.clock.now(),
+      });
+      expired.push({
+        id: deadline.id,
+        code: deadline.code,
+        ownerKind: deadline.ownerKind,
+        ownerId: deadline.ownerId,
+        dueOn: deadline.dueOn,
+        effect: kind,
+      });
+    }
+    return { tenantId, scanned: due.length, expired, skipped };
+  }
+}
+
+export function createDeadlineEngine(deps: DeadlineEngineDeps): DeadlineEngine {
+  return new Engine(deps);
+}
diff --git a/backend/domains/inf/deadlines/src/errors.ts b/backend/domains/inf/deadlines/src/errors.ts
new file mode 100644
index 0000000..0516234
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/errors.ts
@@ -0,0 +1,34 @@
+// Erro do motor de prazos. O `code` vem de
+// docs/framework/arch/rait-error-catalog.md (§3.9 e §3.12) e o envelope segue as
+// regras da §1: `code`, `status`, `messageKey` e `context` só com ids, tokens e
+// números. O pacote é uma biblioteca sem dependências (ADR-0016 §2), por isso
+// estende `Error` e não `StynxError` — quem serializa é o módulo que a consome
+// (CTG-0001 §5).
+
+/** Deriva `rait.errors.<motivo>` de `RAIT.<MOTIVO>` (catálogo §1 regra 3). */
+function messageKeyOf(code: string): string {
+  return `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
+}
+
+export interface DeadlineErrorOptions {
+  status: number;
+  context?: Record<string, unknown>;
+  message?: string;
+  cause?: unknown;
+}
+
+export class DeadlineError extends Error {
+  readonly code: string;
+  readonly status: number;
+  readonly context: Record<string, unknown>;
+  readonly messageKey: string;
+
+  constructor(code: string, options: DeadlineErrorOptions) {
+    super(options.message ?? code, { cause: options.cause });
+    this.name = 'DeadlineError';
+    this.code = code;
+    this.status = options.status;
+    this.context = options.context ?? {};
+    this.messageKey = messageKeyOf(code);
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/index.ts b/backend/domains/inf/deadlines/src/index.ts
index 8c736de..71821ae 100644
--- a/backend/domains/inf/deadlines/src/index.ts
+++ b/backend/domains/inf/deadlines/src/index.ts
@@ -1,4 +1,44 @@
-// @detran/inf-deadlines — deadline engine library (ADR-0016 §2).
-// Public API is fixed by work/rounds/R-0006/contracts/CTG-0001.md §d and is
-// implemented in TASK-0003; this skeleton only reserves the workspace package.
-export {};
+// @detran/inf-deadlines — motor de prazos como biblioteca (ADR-0016 §2,
+// docs/framework/arch/rait-deadline-engine.md). API pública fixada em
+// work/rounds/R-0006/contracts/CTG-0001.md §5. Sem rotas, sem job e sem acesso a
+// banco: quem consome injeta `Clock`, `Calendar`, `TimerCatalog` e `TimerStore`.
+export { InMemoryCalendar } from './calendar.js';
+export { FixedClock } from './clock.js';
+export { createDeadlineEngine } from './engine.js';
+export type { DeadlineEngineDeps } from './engine.js';
+export { DeadlineError } from './errors.js';
+export type { DeadlineErrorOptions } from './errors.js';
+export {
+  addCalendarDays,
+  addCalendarMonths,
+  addCalendarYears,
+  isWeekend,
+  weekdayOf,
+} from './local-date.js';
+export {
+  INFRACTION_TIMER_DEFINITIONS,
+  StaticTimerCatalog,
+} from './timer-catalog.js';
+export { InMemoryTimerStore } from './timer-store.js';
+export type {
+  ArmInput,
+  Calendar,
+  CalendarJson,
+  Clock,
+  Deadline,
+  DeadlineEngine,
+  ExpiryEffect,
+  ExpiryKind,
+  LocalDate,
+  SuspensionAct,
+  SweepReport,
+  TimelinessInput,
+  TimelinessResult,
+  TimerCatalog,
+  TimerCode,
+  TimerDefinition,
+  TimerDurationUnit,
+  TimerOwnerKind,
+  TimerStatus,
+  TimerStore,
+} from './types.js';
diff --git a/backend/domains/inf/deadlines/src/local-date.ts b/backend/domains/inf/deadlines/src/local-date.ts
new file mode 100644
index 0000000..c1f3056
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/local-date.ts
@@ -0,0 +1,81 @@
+// Aritmética de data civil do motor (rait-deadline-engine.md §2). É o único
+// lugar que soma prazo: dias corridos excluem o dia do marco e incluem o do
+// vencimento (`raw_due_on = start_on + n`); meses e anos são soma de calendário
+// com o mesmo grampo de fim de mês do Postgres (`date + interval 'n months'`).
+// Sem `Date.now()`: todas as funções são puras.
+import { DeadlineError } from './errors.js';
+import type { LocalDate } from './types.js';
+
+const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
+const MS_PER_DAY = 86_400_000;
+
+interface Parts {
+  year: number;
+  month: number;
+  day: number;
+}
+
+function parts(date: LocalDate): Parts {
+  const match = LOCAL_DATE.exec(date);
+  if (!match) {
+    throw new DeadlineError('RAIT.INTERNAL', {
+      status: 500,
+      context: { date },
+      message: 'Data civil inválida: esperado YYYY-MM-DD.',
+    });
+  }
+  return {
+    year: Number(match[1]),
+    month: Number(match[2]),
+    day: Number(match[3]),
+  };
+}
+
+function format(utc: number): LocalDate {
+  return new Date(utc).toISOString().slice(0, 10);
+}
+
+function utcOf(date: LocalDate): number {
+  const { year, month, day } = parts(date);
+  return Date.UTC(year, month - 1, day);
+}
+
+/** Dias civis somados ao marco (`n` negativo anda para trás). */
+export function addCalendarDays(date: LocalDate, days: number): LocalDate {
+  return format(utcOf(date) + days * MS_PER_DAY);
+}
+
+/** Último dia do mês (base do grampo de fim de mês). */
+function lastDayOfMonth(year: number, month: number): number {
+  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
+}
+
+/**
+ * Soma de calendário em meses, com grampo no último dia do mês de destino —
+ * é o comportamento de `date + interval 'n months'` do Postgres
+ * (rait-deadline-engine.md §2).
+ */
+export function addCalendarMonths(date: LocalDate, months: number): LocalDate {
+  const { year, month, day } = parts(date);
+  const shifted = month - 1 + months;
+  const targetYear = year + Math.floor(shifted / 12);
+  const targetMonth = ((shifted % 12) + 12) % 12;
+  const clamped = Math.min(day, lastDayOfMonth(targetYear, targetMonth));
+  return format(Date.UTC(targetYear, targetMonth, clamped));
+}
+
+/** Soma de calendário em anos (12 meses cada). */
+export function addCalendarYears(date: LocalDate, years: number): LocalDate {
+  return addCalendarMonths(date, years * 12);
+}
+
+/** 0 = domingo … 6 = sábado. */
+export function weekdayOf(date: LocalDate): number {
+  return new Date(utcOf(date)).getUTCDay();
+}
+
+/** Sábado e domingo nunca são dias úteis (rait-deadline-engine.md §2). */
+export function isWeekend(date: LocalDate): boolean {
+  const weekday = weekdayOf(date);
+  return weekday === 0 || weekday === 6;
+}
diff --git a/backend/domains/inf/deadlines/src/timer-catalog.ts b/backend/domains/inf/deadlines/src/timer-catalog.ts
new file mode 100644
index 0000000..086290c
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/timer-catalog.ts
@@ -0,0 +1,282 @@
+// Espelho tipado de `inf.infraction_timer_ref` — os 18 timers do bloco INSERT de
+// backend/database/ddl/14-inf-lifecycle-vocabulary.sql, na mesma ordem e com os
+// mesmos valores (CTG-0001 §5 nota 2). Nenhum prazo é definido aqui: este
+// arquivo só transcreve o vocabulário canônico.
+import { DeadlineError } from './errors.js';
+import type { TimerCatalog, TimerCode, TimerDefinition } from './types.js';
+
+export const INFRACTION_TIMER_DEFINITIONS: readonly TimerDefinition[] = [
+  {
+    code: 'T-NA',
+    owner: 'infracao',
+    durationValue: 30,
+    durationUnit: 'dias_corridos',
+    startMark:
+      'cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)',
+    armedIn: 'AIT_LAVRADO',
+    expiryKind: 'transicao',
+    expiryTarget: 'ARQUIVADO',
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 4º §1º; CTB art. 281 §1º II',
+  },
+  {
+    code: 'T-SNE-CIENCIA',
+    owner: 'infracao',
+    durationValue: 30,
+    durationUnit: 'dias_corridos',
+    startMark: 'disponibilização no SNE + envio da mensagem',
+    armedIn: 'qualquer notificação por SNE',
+    expiryKind: 'marco',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
+  },
+  {
+    code: 'T-DEF',
+    owner: 'infracao',
+    durationValue: null,
+    durationUnit: 'data_impressa',
+    startMark: 'expedição da NA / ciência conforme canal (piso 30 dias)',
+    armedIn: 'NOTIFICADO_AUTUACAO',
+    expiryKind: 'transicao',
+    expiryTarget: 'PENALIDADE_A_APLICAR',
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
+  },
+  {
+    code: 'T-IND',
+    owner: 'infracao',
+    durationValue: 30,
+    durationUnit: 'dias_corridos',
+    startMark: 'notificação da autuação',
+    armedIn: 'NOTIFICADO_AUTUACAO',
+    expiryKind: 'regra',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'CTB art. 257 §§7º-8º',
+  },
+  {
+    code: 'T-NA-IND',
+    owner: 'infracao',
+    durationValue: 30,
+    durationUnit: 'dias_corridos',
+    startMark: 'protocolo da indicação de condutor',
+    armedIn: 'INDICACAO_EM_PROCESSAMENTO',
+    expiryKind: 'transicao',
+    expiryTarget: 'ARQUIVADO',
+    alertLadder: null,
+    status: 'a_confirmar',
+    legalBasis: 'Res. 918/2022 art. 5º §3º',
+  },
+  {
+    code: 'T-DEC',
+    owner: 'infracao',
+    durationValue: 180,
+    durationUnit: 'dias_corridos',
+    startMark: 'cometimento; 360 dias se defesa tempestiva',
+    armedIn: 'AIT_LAVRADO … PENALIDADE_A_APLICAR',
+    expiryKind: 'transicao',
+    expiryTarget: 'EXTINTO_DECADENCIA',
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis:
+      'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
+  },
+  {
+    code: 'T-NP-VENC',
+    owner: 'infracao',
+    durationValue: null,
+    durationUnit: 'data_impressa',
+    startMark:
+      'notificação da penalidade (ciência conforme canal; piso 30 dias)',
+    armedIn: 'NOTIFICADO_PENALIDADE',
+    expiryKind: 'transicao',
+    expiryTarget: 'INSTANCIA_ENCERRADA',
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
+  },
+  {
+    code: 'T-REM10',
+    owner: 'infracao',
+    durationValue: 10,
+    durationUnit: 'dias_corridos',
+    startMark: 'interposição do recurso à JARI',
+    armedIn: 'EM_REMESSA_JARI',
+    expiryKind: 'alerta',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'CTB art. 285 §2º; RN-RAIT-107',
+  },
+  {
+    code: 'T-JUL-24M',
+    owner: 'infracao',
+    durationValue: 24,
+    durationUnit: 'meses',
+    startMark:
+      'recebimento do recurso pelo órgão julgador (um relógio por instância)',
+    armedIn: 'EM_JULGAMENTO_JARI; EM_JULGAMENTO_CETRAN',
+    expiryKind: 'transicao',
+    expiryTarget: 'EXTINTO_PRESCRICAO',
+    alertLadder: '12/18/21/23 meses (WF-RAIT-002 §4.1)',
+    status: 'vigente',
+    legalBasis: 'CTB arts. 285 §6º, 289, 289-A; RN-RAIT-110…112',
+  },
+  {
+    code: 'T-DIL',
+    owner: 'caso',
+    durationValue: 15,
+    durationUnit: 'dias_uteis',
+    startMark: 'abertura da diligência (prorrogável uma vez)',
+    armedIn: 'caso RAIT em DILIGENCIA',
+    expiryKind: 'transicao',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
+  },
+  {
+    code: 'T-R2',
+    owner: 'infracao',
+    durationValue: 30,
+    durationUnit: 'dias_corridos',
+    startMark: 'publicação da decisão da JARI (Owner C.24)',
+    armedIn: 'AGUARDANDO_RECURSO_2A',
+    expiryKind: 'transicao',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'CTB art. 288; RN-RAIT-103, RN-RAIT-130',
+  },
+  {
+    code: 'T-PAR-3A',
+    owner: 'infracao',
+    durationValue: 3,
+    durationUnit: 'anos',
+    startMark: 'último ato registrado (reinicia a cada movimentação)',
+    armedIn: 'qualquer estado pendente de julgamento',
+    expiryKind: 'transicao',
+    expiryTarget: 'EXTINTO_PRESCRICAO',
+    alertLadder: null,
+    status: 'a_confirmar',
+    legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
+  },
+  {
+    code: 'T-PRESC-5A',
+    owner: 'infracao',
+    durationValue: 5,
+    durationUnit: 'anos',
+    startMark:
+      'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)',
+    armedIn: 'todo o ciclo até o encerramento',
+    expiryKind: 'transicao',
+    expiryTarget: 'EXTINTO_PRESCRICAO',
+    alertLadder: '30/45/54/60 meses',
+    status: 'a_confirmar',
+    legalBasis:
+      'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113',
+  },
+  {
+    code: 'T-VOTO',
+    owner: 'caso',
+    durationValue: 20,
+    durationUnit: 'dias_corridos',
+    startMark: 'distribuição ao relator (aceite do lote)',
+    armedIn: 'caso RAIT em EM_INSTRUCAO (2º circuito)',
+    expiryKind: 'alerta',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'proposta',
+    legalBasis: 'WF-RAIT-003 (pendente regimento)',
+  },
+  {
+    code: 'T-CONV',
+    owner: 'sessao',
+    durationValue: 5,
+    durationUnit: 'dias_uteis',
+    startMark: 'fechamento da pauta',
+    armedIn: 'sessão em PAUTA_FECHADA',
+    expiryKind: 'guarda',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'proposta',
+    legalBasis: 'WF-RAIT-003 (pendente regimento)',
+  },
+  {
+    code: 'T-ASS',
+    owner: 'caso',
+    durationValue: 5,
+    durationUnit: 'dias_uteis',
+    startMark: 'minuta enviada para assinatura',
+    armedIn: 'caso RAIT em PRONTO_P_DECISAO (1º circuito)',
+    expiryKind: 'alerta',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'proposta',
+    legalBasis: 'WF-RAIT-004 §2 (meta operacional)',
+  },
+  {
+    code: 'T-CLAIM',
+    owner: 'caso',
+    durationValue: 2,
+    durationUnit: 'dias_uteis',
+    startMark: 'homologação do lote de sorteio',
+    armedIn: 'lote LOTE_SORTEADO',
+    expiryKind: 'regra',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'proposta',
+    legalBasis: 'WF-RAIT-004 §5',
+  },
+  {
+    code: 'SLA-30',
+    owner: 'indicador',
+    durationValue: 30,
+    durationUnit: 'meta',
+    startMark: 'protocolo (defesa) / entrada na JARI (dias úteis)',
+    armedIn: '1º e 2º circuitos',
+    expiryKind: 'indicador',
+    expiryTarget: null,
+    alertLadder: null,
+    status: 'vigente',
+    legalBasis: 'REF-DETRANAM-SERVICOS; WF-RAIT-002 §4.4',
+  },
+];
+
+/**
+ * Catálogo estático: sem argumento é o espelho do DDL 14; com `definitions` as
+ * entradas informadas sobrescrevem o espelho por `code` — é o gancho de
+ * `deadline.<codigo>.expiry_kind_override` e dos testes (CTG-0001 §5 nota 2).
+ */
+export class StaticTimerCatalog implements TimerCatalog {
+  private readonly byCode: Map<TimerCode, TimerDefinition>;
+
+  constructor(definitions?: readonly TimerDefinition[]) {
+    this.byCode = new Map(
+      INFRACTION_TIMER_DEFINITIONS.map((definition) => [
+        definition.code,
+        definition,
+      ]),
+    );
+    for (const definition of definitions ?? []) {
+      this.byCode.set(definition.code, definition);
+    }
+  }
+
+  get(code: TimerCode): TimerDefinition {
+    const definition = this.byCode.get(code);
+    if (!definition) {
+      throw new DeadlineError('RAIT.INTERNAL', {
+        status: 500,
+        context: { timerCode: code },
+        message: 'Timer fora de inf.infraction_timer_ref.',
+      });
+    }
+    return definition;
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/timer-store.ts b/backend/domains/inf/deadlines/src/timer-store.ts
new file mode 100644
index 0000000..c822b40
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/timer-store.ts
@@ -0,0 +1,85 @@
+// Porta `TimerStore` em memória (ADR-0016 §2: sem acesso a banco nesta rodada;
+// a persistência em `inf.infraction_timer` é de R-0007). A unicidade de
+// `(tenant_id, owner_id, code, started_on)` espelha
+// `ux_inf_infraction_timer_arm`.
+import type { Deadline, LocalDate, TimerCode, TimerStore } from './types.js';
+
+const OPEN: Deadline['status'] = 'armado';
+
+export class InMemoryTimerStore implements TimerStore {
+  private readonly rows = new Map<string, Deadline>();
+
+  async insert(deadline: Deadline): Promise<Deadline> {
+    this.rows.set(deadline.id, { ...deadline });
+    return { ...deadline };
+  }
+
+  async findById(id: string): Promise<Deadline | null> {
+    const row = this.rows.get(id);
+    return row ? { ...row } : null;
+  }
+
+  async findOpen(
+    tenantId: string,
+    ownerId: string,
+    code: TimerCode,
+  ): Promise<Deadline | null> {
+    for (const row of this.rows.values()) {
+      if (
+        row.tenantId === tenantId &&
+        row.ownerId === ownerId &&
+        row.code === code &&
+        row.status === OPEN
+      ) {
+        return { ...row };
+      }
+    }
+    return null;
+  }
+
+  async findByArm(
+    tenantId: string,
+    ownerId: string,
+    code: TimerCode,
+    startedOn: LocalDate,
+  ): Promise<Deadline | null> {
+    for (const row of this.rows.values()) {
+      if (
+        row.tenantId === tenantId &&
+        row.ownerId === ownerId &&
+        row.code === code &&
+        row.startedOn === startedOn
+      ) {
+        return { ...row };
+      }
+    }
+    return null;
+  }
+
+  /** Predicado da varredura: `status='armado'` e `due_on <= onOrBefore`. */
+  async listDue(
+    tenantId: string,
+    onOrBefore: LocalDate,
+    limit: number,
+  ): Promise<Deadline[]> {
+    return [...this.rows.values()]
+      .filter(
+        (row) =>
+          row.tenantId === tenantId &&
+          row.status === OPEN &&
+          row.dueOn <= onOrBefore,
+      )
+      .sort((left, right) =>
+        left.dueOn === right.dueOn
+          ? left.id.localeCompare(right.id)
+          : left.dueOn.localeCompare(right.dueOn),
+      )
+      .slice(0, limit)
+      .map((row) => ({ ...row }));
+  }
+
+  async update(deadline: Deadline): Promise<Deadline> {
+    this.rows.set(deadline.id, { ...deadline });
+    return { ...deadline };
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/types.ts b/backend/domains/inf/deadlines/src/types.ts
new file mode 100644
index 0000000..2a38fde
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/types.ts
@@ -0,0 +1,195 @@
+// Tipos públicos do motor de prazos — assinaturas de
+// docs/framework/arch/rait-deadline-engine.md §6, com `tx: Transaction`
+// substituído pela porta `TimerStore` (work/rounds/R-0006/contracts/CTG-0001.md
+// §5). Vocabulários (`TimerCode`, `TimerStatus`, `ExpiryKind`, `owner`,
+// `durationUnit`) são espelho de `inf.infraction_timer_ref`
+// (backend/database/ddl/14-inf-lifecycle-vocabulary.sql).
+
+/** Data civil `YYYY-MM-DD`, sem hora (rait-deadline-engine.md §6). */
+export type LocalDate = string;
+
+/** Os 18 códigos de `inf.infraction_timer_ref`. */
+export type TimerCode =
+  | 'T-NA'
+  | 'T-SNE-CIENCIA'
+  | 'T-DEF'
+  | 'T-IND'
+  | 'T-NA-IND'
+  | 'T-DEC'
+  | 'T-NP-VENC'
+  | 'T-REM10'
+  | 'T-JUL-24M'
+  | 'T-DIL'
+  | 'T-R2'
+  | 'T-PAR-3A'
+  | 'T-PRESC-5A'
+  | 'T-VOTO'
+  | 'T-CONV'
+  | 'T-ASS'
+  | 'T-CLAIM'
+  | 'SLA-30';
+
+export type TimerOwnerKind = 'case' | 'infraction' | 'session';
+
+/** `infraction_timer.status` (M12, derivado de rait-deadline-engine.md §3). */
+export type TimerStatus = 'armado' | 'satisfeito' | 'cancelado' | 'vencido';
+
+/** `inf.infraction_timer_ref.expiry_kind`. */
+export type ExpiryKind =
+  'transicao' | 'alerta' | 'marco' | 'regra' | 'guarda' | 'indicador';
+
+/** Efeito observável de um vencimento (`guarda`/`indicador` nunca vencem). */
+export type ExpiryEffect = 'transicao' | 'alerta' | 'marco' | 'regra';
+
+export type TimerDurationUnit =
+  'dias_corridos' | 'dias_uteis' | 'meses' | 'anos' | 'data_impressa' | 'meta';
+
+export interface Clock {
+  today(tenantTz: string): LocalDate;
+  now(): Date;
+}
+
+export interface Calendar {
+  isBusinessDay(d: LocalDate, tenantId: string): Promise<boolean>;
+  nextBusinessDay(d: LocalDate, tenantId: string): Promise<LocalDate>;
+}
+
+export interface TimerDefinition {
+  code: TimerCode;
+  owner: 'infracao' | 'caso' | 'sessao' | 'indicador';
+  durationValue: number | null;
+  durationUnit: TimerDurationUnit;
+  startMark: string;
+  armedIn: string;
+  expiryKind: ExpiryKind;
+  /** Código de `inf.infraction_state_ref`. */
+  expiryTarget: string | null;
+  alertLadder: string | null;
+  status: 'vigente' | 'a_confirmar' | 'proposta';
+  legalBasis: string;
+}
+
+export interface TimerCatalog {
+  get(code: TimerCode): TimerDefinition;
+}
+
+export interface Deadline {
+  id: string;
+  tenantId: string;
+  ownerKind: TimerOwnerKind;
+  ownerId: string;
+  code: TimerCode;
+  instance: 'jari' | 'cetran' | null;
+  startBasis: string;
+  startedOn: LocalDate;
+  rawDueOn: LocalDate;
+  dueOn: LocalDate;
+  ceilingOn: LocalDate | null;
+  businessDays: boolean;
+  status: TimerStatus;
+  satisfiedAt: Date | null;
+  expiredAt: Date | null;
+  cancelReason: string | null;
+  suspendedByActId: string | null;
+  suspendedDays: number;
+  extensionCount: number;
+  legalBasis: string;
+}
+
+export interface SuspensionAct {
+  id: string;
+  days: number;
+  evidenceRef: string;
+  signedAt: Date;
+}
+
+export interface SweepReport {
+  tenantId: string;
+  scanned: number;
+  expired: ReadonlyArray<{
+    id: string;
+    code: TimerCode;
+    ownerKind: TimerOwnerKind;
+    ownerId: string;
+    dueOn: LocalDate;
+    effect: ExpiryEffect;
+  }>;
+  skipped: number;
+}
+
+export interface TimerStore {
+  insert(deadline: Deadline): Promise<Deadline>;
+  findById(id: string): Promise<Deadline | null>;
+  findOpen(
+    tenantId: string,
+    ownerId: string,
+    code: TimerCode,
+  ): Promise<Deadline | null>;
+  findByArm(
+    tenantId: string,
+    ownerId: string,
+    code: TimerCode,
+    startedOn: LocalDate,
+  ): Promise<Deadline | null>;
+  listDue(
+    tenantId: string,
+    onOrBefore: LocalDate,
+    limit: number,
+  ): Promise<Deadline[]>;
+  update(deadline: Deadline): Promise<Deadline>;
+}
+
+export interface ArmInput {
+  ownerKind: TimerOwnerKind;
+  ownerId: string;
+  code: TimerCode;
+  startOn: LocalDate;
+  startBasis: string;
+  legalBasis: string;
+  tenantId: string;
+  instance?: 'jari' | 'cetran';
+  printedDeadline?: LocalDate;
+}
+
+export interface TimelinessInput {
+  code: TimerCode;
+  ownerId: string;
+  tenantId: string;
+  pieceMarkOn: LocalDate;
+}
+
+export interface TimelinessResult {
+  timely: boolean;
+  dueOn: LocalDate;
+  basis: string;
+}
+
+export interface DeadlineEngine {
+  arm(input: ArmInput): Promise<Deadline>;
+  satisfy(id: string, reason: string): Promise<void>;
+  cancel(id: string, reason: string): Promise<void>;
+  reschedule(id: string, act: SuspensionAct): Promise<Deadline>;
+  computeDue(
+    code: TimerCode,
+    startOn: LocalDate,
+    tenantId: string,
+    printedDeadline?: LocalDate,
+  ): Promise<{ rawDueOn: LocalDate; dueOn: LocalDate }>;
+  sweep(tenantId: string, limit?: number): Promise<SweepReport>;
+  timeliness(input: TimelinessInput): Promise<TimelinessResult>;
+}
+
+/**
+ * Forma de `docs/framework/arch/fixtures/calendar-2026.json`: feriados são as
+ * chaves de `national`, `am` e `manaus`; `optional` (ponto facultativo) não é
+ * feriado (CTG-0001 §5 nota 3, `deadline.optional_day_policy =
+ * business_day_for_citizen`).
+ */
+export interface CalendarJson {
+  year: number;
+  note?: string;
+  national?: Record<string, string>;
+  optional?: Record<string, string>;
+  am?: Record<string, string>;
+  manaus?: Record<string, string>;
+}
diff --git a/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts b/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts
new file mode 100644
index 0000000..5dac36c
--- /dev/null
+++ b/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts
@@ -0,0 +1,502 @@
+// Os 18 casos obrigatórios de docs/framework/arch/rait-deadline-engine.md §7,
+// pela API pública fixada em work/rounds/R-0006/contracts/CTG-0001.md §5 e §5.1.
+// Relógio fixo em 2026-09-14 (segunda-feira), fuso America/Manaus
+// (rait-test-strategy.md §6); calendário docs/framework/arch/fixtures/calendar-2026.json;
+// catálogo = espelho de inf.infraction_timer_ref; portas em memória.
+// Erros verificados pelo `code` de rait-error-catalog.md §3.9 e §3.12.
+import { readFileSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import {
+  createDeadlineEngine,
+  DeadlineError,
+  FixedClock,
+  InMemoryCalendar,
+  InMemoryTimerStore,
+  StaticTimerCatalog,
+} from '../../src/index.js';
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
+);
+
+// Fixtures canônicas (rait-fixtures.md §1, CTG-0001 §7): tenant `am-fixtures`,
+// infrações `…0000d000NNNN`, caso RAIT 08 (`T-DIL` em dias úteis).
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const TENANT_TZ = 'America/Manaus';
+const TODAY = '2026-09-14';
+const infraction = (nnnn: string) => `00000000-0000-7000-8000-0000d000${nnnn}`;
+const CASE_08 = '00000000-0000-7000-8000-000010000008';
+// `inf.rait_suspension_act` nasce no DDL 39 (fora do CTG-0001) e o contrato §7
+// não fixa prefixo de id para atos de suspensão: uuid nulo como marcador
+// explícito de pendência, nunca um id canônico inventado.
+const SUSPENSION_ACT_ID = '00000000-0000-0000-0000-000000000000';
+
+function makeEngine(today: string = TODAY) {
+  const clock = new FixedClock(today, TENANT_TZ);
+  const calendar = new InMemoryCalendar(calendar2026);
+  const catalog = new StaticTimerCatalog();
+  const store = new InMemoryTimerStore();
+  return {
+    clock,
+    calendar,
+    catalog,
+    store,
+    engine: createDeadlineEngine({ clock, calendar, catalog, store }),
+  };
+}
+
+// A escada de risco de WF-RAIT-002 §4.1 vive em TimerDefinition.alertLadder
+// ('12/18/21/23 meses'); o caso 9 verifica as datas que o motor calcula sobre
+// `startedOn`, não a escrita da bandeira (CTG-0001 §5.1 nota do caso 9).
+function addMonths(date: string, months: number): string {
+  const [year, month, day] = date.split('-').map(Number);
+  const shifted = new Date(Date.UTC(year, month - 1 + months, day));
+  return shifted.toISOString().slice(0, 10);
+}
+
+describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
+  it('dado T-REM10 com marco 2026-09-14 quando computeDue então raw_due_on e due_on são 2026-09-24 (caso 1)', async () => {
+    const { engine } = makeEngine();
+
+    await expect(
+      engine.computeDue('T-REM10', '2026-09-14', TENANT),
+    ).resolves.toEqual({ rawDueOn: '2026-09-24', dueOn: '2026-09-24' });
+  });
+
+  it('dado T-R2 com marco 2026-09-14 quando computeDue então due_on é 2026-10-14 (caso 2)', async () => {
+    const { engine } = makeEngine();
+
+    const due = await engine.computeDue('T-R2', '2026-09-14', TENANT);
+
+    expect(due).toEqual({ rawDueOn: '2026-10-14', dueOn: '2026-10-14' });
+  });
+
+  it('dado T-R2 com marco 2026-09-10 quando o vencimento cai em sábado então due_on prorroga para 2026-10-13 (caso 3)', async () => {
+    const { engine } = makeEngine();
+
+    const due = await engine.computeDue('T-R2', '2026-09-10', TENANT);
+
+    // 2026-10-10 é sábado e 2026-10-12 é feriado nacional (Aparecida).
+    expect(due).toEqual({ rawDueOn: '2026-10-10', dueOn: '2026-10-13' });
+  });
+
+  it('dado T-DIL em dias úteis com marco 2026-11-13 quando computeDue então due_on é 2026-12-07 (caso 4)', async () => {
+    const { engine } = makeEngine();
+
+    const due = await engine.computeDue('T-DIL', '2026-11-13', TENANT);
+
+    expect(due.dueOn).toBe('2026-12-07');
+  });
+
+  it('dado T-DEF com data impressa 2026-10-30 e expedição 2026-09-14 quando arm então due_on é a data impressa sem erro (caso 5)', async () => {
+    const { engine } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0002'),
+      code: 'T-DEF',
+      startOn: '2026-09-14',
+      startBasis: 'expedição da NA',
+      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
+      tenantId: TENANT,
+      printedDeadline: '2026-10-30',
+    });
+
+    expect(deadline.rawDueOn).toBe('2026-10-30');
+    expect(deadline.dueOn).toBe('2026-10-30');
+  });
+
+  it('dado T-DEF com data impressa 2026-10-01 e expedição 2026-09-14 quando arm então RAIT.INFRACTION_NOTICE_DEADLINE_SHORT 422 (caso 6)', async () => {
+    const { engine } = makeEngine();
+
+    // A data impressa é o piso de 30 dias da expedição (RN-RAIT-101/102;
+    // CTG-0001 §4). O caso 5 fixa `arm` como a chamada que não erra com
+    // 2026-10-30; o caso 6 é o seu par com a data curta.
+    const armShortDeadline = engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0002'),
+      code: 'T-DEF',
+      startOn: '2026-09-14',
+      startBasis: 'expedição da NA',
+      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
+      tenantId: TENANT,
+      printedDeadline: '2026-10-01',
+    });
+
+    await expect(armShortDeadline).rejects.toBeInstanceOf(DeadlineError);
+    await expect(armShortDeadline).rejects.toMatchObject({
+      code: 'RAIT.INFRACTION_NOTICE_DEADLINE_SHORT',
+      status: 422,
+    });
+  });
+
+  it('dada NA por SNE disponibilizada 2026-09-14 sem leitura quando a varredura alcança T-SNE-CIENCIA então a ciência ficta é 2026-10-14 com efeito marco e T-DEF conta dela (caso 7)', async () => {
+    const { engine, store, clock, calendar, catalog } = makeEngine();
+
+    const ficta = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0002'),
+      code: 'T-SNE-CIENCIA',
+      startOn: '2026-09-14',
+      startBasis: 'disponibilização no SNE + envio da mensagem',
+      legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
+      tenantId: TENANT,
+    });
+
+    expect(ficta.dueOn).toBe('2026-10-14');
+    expect(clock.today(TENANT_TZ)).toBe(TODAY);
+
+    // A varredura compara datas (`due_on < hoje`, rait-deadline-engine.md §5):
+    // o vencimento da ficta só é observável com o relógio fixo no dia seguinte.
+    const sweepEngine = createDeadlineEngine({
+      clock: new FixedClock('2026-10-15', TENANT_TZ),
+      calendar,
+      catalog,
+      store,
+    });
+    const report = await sweepEngine.sweep(TENANT);
+
+    expect(report.expired).toHaveLength(1);
+    expect(report.expired[0]).toMatchObject({
+      code: 'T-SNE-CIENCIA',
+      dueOn: '2026-10-14',
+      effect: 'marco',
+    });
+
+    const defesa = await sweepEngine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0002'),
+      code: 'T-DEF',
+      startOn: ficta.dueOn,
+      startBasis: 'ciência ficta no SNE',
+      legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
+      tenantId: TENANT,
+      // piso de 30 dias corridos sobre a ciência (RN-RAIT-101; CTG-0001 §4)
+      printedDeadline: '2026-11-13',
+    });
+
+    expect(defesa.startedOn).toBe('2026-10-14');
+    expect(defesa.dueOn).toBe('2026-11-13');
+  });
+
+  it('dada NA por SNE lida em 2026-09-20 quando a leitura é registrada então a ciência é 2026-09-20 e T-SNE-CIENCIA fica satisfeito (caso 8)', async () => {
+    const { engine, store } = makeEngine();
+
+    const ficta = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0005'),
+      code: 'T-SNE-CIENCIA',
+      startOn: '2026-09-14',
+      startBasis: 'disponibilização no SNE + envio da mensagem',
+      legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
+      tenantId: TENANT,
+    });
+
+    // min(leitura, disponibilização + 30): a leitura precede a ficta.
+    expect('2026-09-20' < ficta.dueOn).toBe(true);
+
+    await engine.satisfy(ficta.id, 'leitura registrada em 2026-09-20');
+
+    const satisfied = await store.findById(ficta.id);
+    expect(satisfied?.status).toBe('satisfeito');
+    expect(satisfied?.satisfiedAt).not.toBeNull();
+  });
+
+  it('dado T-JUL-24M recebido pelo julgador em 2026-09-14 quando arm então due_on é 2028-09-14 e a escada cai em 2027-09-14, 2028-03-14, 2028-06-14 e 2028-08-14 (caso 9)', async () => {
+    const { engine, catalog } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0007'),
+      code: 'T-JUL-24M',
+      startOn: '2026-09-14',
+      startBasis: 'recebimento do recurso pelo órgão julgador',
+      legalBasis: 'CTB arts. 285 §6º, 289, 289-A; RN-RAIT-110…112',
+      tenantId: TENANT,
+      instance: 'jari',
+    });
+
+    expect(deadline.dueOn).toBe('2028-09-14');
+    expect(deadline.instance).toBe('jari');
+
+    const ladder = catalog.get('T-JUL-24M').alertLadder ?? '';
+    expect(ladder).toContain('12/18/21/23');
+    const months = [...ladder.matchAll(/\d+/g)].slice(0, 4).map(Number);
+    expect(months).toEqual([12, 18, 21, 23]);
+    expect(months.map((month) => addMonths(deadline.startedOn, month))).toEqual(
+      ['2027-09-14', '2028-03-14', '2028-06-14', '2028-08-14'],
+    );
+  });
+
+  it('dado T-DIL armado em 2026-11-13 quando um ato de suspensão de 10 dias o reprograma então due_on soma 10 dias úteis e suspended_by_act_id fica gravado (caso 10)', async () => {
+    const { engine } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'case',
+      ownerId: CASE_08,
+      code: 'T-DIL',
+      startOn: '2026-11-13',
+      startBasis: 'abertura da diligência',
+      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
+      tenantId: TENANT,
+    });
+    expect(deadline.dueOn).toBe('2026-12-07');
+
+    const rescheduled = await engine.reschedule(deadline.id, {
+      id: SUSPENSION_ACT_ID,
+      days: 10,
+      evidenceRef: 'ato de suspensão por força maior (fixture)',
+      signedAt: new Date('2026-11-20T12:00:00-04:00'),
+    });
+
+    // 25 dias úteis de 2026-11-13 (15 do catálogo + 10 do ato), com 20/11
+    // (Consciência Negra) e 08/12 (Manaus) fora da contagem.
+    expect(rescheduled.dueOn).toBe('2026-12-22');
+    expect(rescheduled.suspendedDays).toBe(10);
+    expect(rescheduled.suspendedByActId).toBe(SUSPENSION_ACT_ID);
+    // O par (dueOn antigo, dueOn novo) é o `data` de inf.timer.rescheduled
+    // (TIMER_REPROGRAMADO); a publicação do envelope não é da API desta rodada.
+    expect(rescheduled.dueOn).not.toBe(deadline.dueOn);
+  });
+
+  it('dado T-DEC armado quando um ato de suspensão tenta reprogramá-lo então RAIT.SUSPENSION_LEGAL_TIMER 422 (caso 11)', async () => {
+    const { engine } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0001'),
+      code: 'T-DEC',
+      startOn: '2026-09-01',
+      startBasis: 'cometimento; 360 dias se defesa tempestiva',
+      legalBasis:
+        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
+      tenantId: TENANT,
+    });
+
+    const rescheduling = engine.reschedule(deadline.id, {
+      id: SUSPENSION_ACT_ID,
+      days: 10,
+      evidenceRef: 'ato de suspensão por força maior (fixture)',
+      signedAt: new Date('2026-09-10T12:00:00-04:00'),
+    });
+
+    await expect(rescheduling).rejects.toBeInstanceOf(DeadlineError);
+    await expect(rescheduling).rejects.toMatchObject({
+      code: 'RAIT.SUSPENSION_LEGAL_TIMER',
+      status: 422,
+    });
+  });
+
+  it('dado T-NA da infração …0010 vencido em 2026-08-05 quando a varredura roda duas vezes então há uma transição e um TIMER_VENCIDO (caso 12)', async () => {
+    const { engine, store } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0010'),
+      code: 'T-NA',
+      startOn: '2026-07-06',
+      startBasis:
+        'cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)',
+      legalBasis: 'Res. 918/2022 art. 4º §1º; CTB art. 281 §1º II',
+      tenantId: TENANT,
+    });
+    expect(deadline.dueOn).toBe('2026-08-05');
+
+    const first = await engine.sweep(TENANT);
+    expect(first.expired).toHaveLength(1);
+    expect(first.expired[0]).toMatchObject({
+      code: 'T-NA',
+      ownerKind: 'infraction',
+      ownerId: infraction('0010'),
+      dueOn: '2026-08-05',
+      effect: 'transicao',
+    });
+
+    const expiredOnce = await store.findById(deadline.id);
+    expect(expiredOnce?.status).toBe('vencido');
+
+    const second = await engine.sweep(TENANT);
+    expect(second.expired).toHaveLength(0);
+
+    const expiredTwice = await store.findById(deadline.id);
+    expect(expiredTwice?.expiredAt).toEqual(expiredOnce?.expiredAt);
+  });
+
+  it('dado T-PAR-3A armado em 2026-06-18 quando há movimentação em 2027-01-10 então o relógio reinicia com due_on 2030-01-10 (caso 13)', async () => {
+    const { engine } = makeEngine();
+
+    const armed = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0007'),
+      code: 'T-PAR-3A',
+      startOn: '2026-06-18',
+      startBasis: 'último ato registrado (reinicia a cada movimentação)',
+      legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
+      tenantId: TENANT,
+    });
+    expect(armed.dueOn).toBe('2029-06-18');
+
+    const restarted = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0007'),
+      code: 'T-PAR-3A',
+      startOn: '2027-01-10',
+      startBasis: 'último ato registrado (reinicia a cada movimentação)',
+      legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
+      tenantId: TENANT,
+    });
+
+    expect(restarted.startedOn).toBe('2027-01-10');
+    expect(restarted.dueOn).toBe('2030-01-10');
+  });
+
+  it('dado T-PRESC-5A armado quando a NP é expedida então não há reinício (OD-305)', async () => {
+    const { engine, store } = makeEngine();
+
+    const prescricao = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0005'),
+      code: 'T-PRESC-5A',
+      startOn: '2026-03-02',
+      startBasis:
+        'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)',
+      legalBasis:
+        'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113',
+      tenantId: TENANT,
+    });
+
+    // A expedição da NP arma T-NP-VENC (CTG-0001 §7.2, infração …0005) e não
+    // toca T-PRESC-5A: só as hipóteses do art. 2º da Lei 9.873 interrompem.
+    await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0005'),
+      code: 'T-NP-VENC',
+      startOn: '2026-08-17',
+      startBasis:
+        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
+      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
+      tenantId: TENANT,
+      printedDeadline: '2026-10-20',
+    });
+
+    const afterNotice = await store.findById(prescricao.id);
+    expect(afterNotice?.startedOn).toBe('2026-03-02');
+    expect(afterNotice?.rawDueOn).toBe(prescricao.rawDueOn);
+    expect(afterNotice?.dueOn).toBe(prescricao.dueOn);
+    expect(afterNotice?.suspendedDays).toBe(0);
+  });
+
+  it('dada peça postada em 2026-10-14 com T-NP-VENC vencendo 2026-10-14 quando timeliness então é tempestiva (caso 15)', async () => {
+    const { engine } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0005'),
+      code: 'T-NP-VENC',
+      startOn: '2026-09-14',
+      startBasis:
+        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
+      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
+      tenantId: TENANT,
+      // data impressa da NP (override nomeado sobre a fixture …0005)
+      printedDeadline: '2026-10-14',
+    });
+    expect(deadline.dueOn).toBe('2026-10-14');
+
+    const result = await engine.timeliness({
+      code: 'T-NP-VENC',
+      ownerId: infraction('0005'),
+      tenantId: TENANT,
+      pieceMarkOn: '2026-10-14',
+    });
+
+    expect(result.timely).toBe(true);
+    expect(result.dueOn).toBe('2026-10-14');
+  });
+
+  it('dada peça protocolada em 2026-10-15 com T-NP-VENC vencendo 2026-10-14 quando timeliness então é intempestiva (caso 16)', async () => {
+    const { engine } = makeEngine();
+
+    await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0005'),
+      code: 'T-NP-VENC',
+      startOn: '2026-09-14',
+      startBasis:
+        'notificação da penalidade (ciência conforme canal; piso 30 dias)',
+      legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
+      tenantId: TENANT,
+      printedDeadline: '2026-10-14',
+    });
+
+    const result = await engine.timeliness({
+      code: 'T-NP-VENC',
+      ownerId: infraction('0005'),
+      tenantId: TENANT,
+      pieceMarkOn: '2026-10-15',
+    });
+
+    expect(result.timely).toBe(false);
+    expect(result.dueOn).toBe('2026-10-14');
+  });
+
+  it('dado T-DEC de 180 dias sobre o cometimento 2026-06-15 quando a defesa é admitida tempestiva então due_on passa para 360 dias do cometimento (caso 17)', async () => {
+    const { engine, clock, calendar, store, catalog } = makeEngine();
+
+    const at180 = await engine.computeDue('T-DEC', '2026-06-15', TENANT);
+    expect(at180).toEqual({ rawDueOn: '2026-12-12', dueOn: '2026-12-14' });
+
+    // "360 dias se defesa tempestiva" é o próprio catálogo de timers
+    // (inf.infraction_timer_ref.start_mark de T-DEC; §3.1 linha 7): mesmo
+    // started_on, sem suspensão.
+    const extendedCatalog = new StaticTimerCatalog([
+      { ...catalog.get('T-DEC'), durationValue: 360 },
+    ]);
+    const extended = createDeadlineEngine({
+      clock,
+      calendar,
+      catalog: extendedCatalog,
+      store,
+    });
+
+    const at360 = await extended.computeDue('T-DEC', '2026-06-15', TENANT);
+
+    expect(at360).toEqual({ rawDueOn: '2027-06-10', dueOn: '2027-06-10' });
+    expect(at360.dueOn).not.toBe(at180.dueOn);
+  });
+
+  it('dado T-DEC de 180 dias quando a defesa não é conhecida por intempestividade então o prazo permanece em 180 dias (caso 18)', async () => {
+    const { engine, store } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0004'),
+      code: 'T-DEC',
+      startOn: '2026-05-04',
+      startBasis: 'cometimento; 360 dias se defesa tempestiva',
+      legalBasis:
+        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
+      tenantId: TENANT,
+    });
+
+    // 180 dias de 2026-05-04 (CTG-0001 §7.2, infração …0004).
+    expect(deadline.rawDueOn).toBe('2026-10-31');
+    expect(deadline.dueOn).toBe('2026-11-03');
+
+    // A defesa não conhecida por intempestividade não estende T-DEC
+    // (WF-INF-003 §5 invariante 3): nenhuma recontagem.
+    const unchanged = await store.findById(deadline.id);
+    expect(unchanged?.rawDueOn).toBe('2026-10-31');
+    expect(unchanged?.dueOn).toBe('2026-11-03');
+  });
+});
diff --git a/backend/domains/inf/infraction/src/handwritten/errors.ts b/backend/domains/inf/infraction/src/handwritten/errors.ts
new file mode 100644
index 0000000..9a0937d
--- /dev/null
+++ b/backend/domains/inf/infraction/src/handwritten/errors.ts
@@ -0,0 +1,35 @@
+// Erro de domínio do agregado da infração. `code` existe em
+// docs/framework/arch/rait-error-catalog.md (§3.9 e §3.12), `status` segue a
+// família da §2 e `context` carrega só ids, tokens canônicos e números (§1 regra
+// 4; CODESTYLE §Backend). `StynxError` é exportado por `@stynx-nyx/core` 1.3.1
+// (`dist/core/src/errors.d.ts`), então o envelope do `StynxErrorFilter` do
+// kernel serializa `RaitError` sem código novo.
+import { StynxError } from '@stynx-nyx/core';
+
+/** `rait.errors.<motivo>` a partir de `RAIT.<MOTIVO>` (catálogo §1 regra 3). */
+function messageKeyOf(code: string): string {
+  return `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
+}
+
+export interface RaitErrorOptions {
+  status: number;
+  context?: Record<string, unknown>;
+  /** Texto de fallback em pt-BR (catálogo §1 regra 3). */
+  message?: string;
+  cause?: unknown;
+}
+
+export class RaitError extends StynxError {
+  declare readonly context: Record<string, unknown>;
+
+  constructor(code: string, options: RaitErrorOptions) {
+    super(options.message ?? code, {
+      code,
+      status: options.status,
+      context: options.context ?? {},
+      messageKey: messageKeyOf(code),
+      cause: options.cause,
+    });
+    this.name = 'RaitError';
+  }
+}
diff --git a/backend/domains/inf/infraction/src/handwritten/events.ts b/backend/domains/inf/infraction/src/handwritten/events.ts
new file mode 100644
index 0000000..99d77ca
--- /dev/null
+++ b/backend/domains/inf/infraction/src/handwritten/events.ts
@@ -0,0 +1,225 @@
+// Esquemas zod dos cinco eventos publicados do agregado
+// (docs/framework/arch/rait-events-sse-contract.md §1 envelope e §2.4 catálogo;
+// work/rounds/R-0006/contracts/CTG-0001.md §6.1). Cada schema é a tradução
+// literal do JSON Schema de docs/framework/schemas/events/<type>.schema.json:
+// mesmos campos, mesmos enums e `additionalProperties: false` ⇒ `strictObject`.
+// Os vocabulários são os códigos de 14-inf-lifecycle-vocabulary.sql.
+import { z } from 'zod';
+import type { ZodType } from 'zod';
+
+/** `inf.infraction_state_ref.code` (15 estados, ordem de `sort_order`). */
+const STATES = [
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
+/** `inf.infraction_substate_ref.code` (12 sub-estados). */
+const SUBSTATES = [
+  'PRAZO_DEFESA_ABERTO',
+  'INDICACAO_EM_PROCESSAMENTO',
+  'EM_ADMISSIBILIDADE_1A',
+  'EM_REMESSA_JARI',
+  'EM_JULGAMENTO_JARI',
+  'PROVIDO_1A',
+  'NEGADO_1A',
+  'EM_ADMISSIBILIDADE_2A',
+  'EM_JULGAMENTO_CETRAN',
+  'PENDENTE_PAGAMENTO',
+  'QUITADA',
+  'EM_COBRANCA',
+] as const;
+
+/** `inf.infraction_closure_motive_ref.code` (8 motivos). */
+const CLOSURE_MOTIVES = [
+  'nao_interposicao_1a',
+  'nao_interposicao_2a',
+  'julgamento_2a',
+  'reconhecimento',
+  'desistencia',
+  'nao_conhecimento_intempestivo',
+  'na_nao_expedida',
+  'insubsistente',
+] as const;
+
+/** `inf.infraction_payment_tier_ref.code` (6 faixas). */
+const PAYMENT_TIERS = [
+  'nenhum',
+  'desconto_80',
+  'desconto_60_reconhecimento',
+  'desconto_40_fora_sne',
+  'integral_juros',
+  'restituido',
+] as const;
+
+/** `inf.infraction_timer_ref.code` (18 timers). */
+const TIMER_CODES = [
+  'T-NA',
+  'T-SNE-CIENCIA',
+  'T-DEF',
+  'T-IND',
+  'T-NA-IND',
+  'T-DEC',
+  'T-NP-VENC',
+  'T-REM10',
+  'T-JUL-24M',
+  'T-DIL',
+  'T-R2',
+  'T-PAR-3A',
+  'T-PRESC-5A',
+  'T-VOTO',
+  'T-CONV',
+  'T-ASS',
+  'T-CLAIM',
+  'SLA-30',
+] as const;
+
+/** `inf.infraction_transition_ref.trigger_kind`. */
+const TRIGGER_KINDS = ['evento', 'timer', 'ato', 'sistema'] as const;
+
+/** `expiry_kind` efetivo: `guarda` e `indicador` nunca vencem. */
+const EXPIRY_EFFECTS = ['transicao', 'alerta', 'marco', 'regra'] as const;
+
+const OWNER_KINDS = ['case', 'infraction', 'session'] as const;
+
+/** `aggregate.kind` dos eventos de timer (esquemas §2.4). */
+const TIMER_AGGREGATE_KINDS = [
+  'case',
+  'infraction',
+  'session',
+  'batch',
+  'clock',
+  'assignment',
+  'agenda-item',
+  'outbox',
+] as const;
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
+  aggregateKind: ZodType,
+  data: ZodType,
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
+      kind: aggregateKind,
+      id: z.uuid(),
+      version: z.int().min(1),
+    }),
+    data,
+  });
+}
+
+const infractionChanged = envelope(
+  'inf.infraction.changed',
+  'INFRACAO_ESTADO_ALTERADO',
+  z.literal('infraction'),
+  z.strictObject({
+    infractionId: z.uuid(),
+    aitId: z.uuid(),
+    // null na criação do agregado (linha 1 do DDL 14, from_state IS NULL).
+    fromState: z.enum(STATES).nullable(),
+    toState: z.enum(STATES),
+    substate: z.enum(SUBSTATES).optional(),
+    closureMotive: z.enum(CLOSURE_MOTIVES).optional(),
+    triggerKind: z.enum(TRIGGER_KINDS),
+    triggerCode: z.string(),
+    ruleRef: z.int().min(1),
+  }),
+);
+
+const penaltyFinal = envelope(
+  'inf.infraction.penalty-final',
+  'PENALIDADE_DEFINITIVA',
+  z.literal('infraction'),
+  z.strictObject({
+    infractionId: z.uuid(),
+    aitId: z.uuid(),
+    finalOn: z.iso.date(),
+    points: z.int().min(0),
+    amountTier: z.enum(PAYMENT_TIERS),
+  }),
+);
+
+const refundDue = envelope(
+  'inf.infraction.refund-due',
+  'RESTITUICAO_DEVIDA',
+  z.literal('infraction'),
+  z.strictObject({
+    infractionId: z.uuid(),
+    paymentId: z.uuid(),
+    amount: z.number().gt(0),
+    reason: z.string(),
+  }),
+);
+
+const timerExpired = envelope(
+  'inf.timer.expired',
+  'TIMER_VENCIDO',
+  z.enum(TIMER_AGGREGATE_KINDS),
+  z.strictObject({
+    ownerKind: z.enum(OWNER_KINDS),
+    ownerId: z.uuid(),
+    timerCode: z.enum(TIMER_CODES),
+    dueOn: z.iso.date(),
+    effect: z.enum(EXPIRY_EFFECTS),
+  }),
+);
+
+const timerRescheduled = envelope(
+  'inf.timer.rescheduled',
+  'TIMER_REPROGRAMADO',
+  z.enum(TIMER_AGGREGATE_KINDS),
+  z.strictObject({
+    ownerId: z.uuid(),
+    timerCode: z.enum(TIMER_CODES),
+    oldDueOn: z.iso.date(),
+    newDueOn: z.iso.date(),
+    // inf.rait_suspension_act (DDL 39); referência sem FK (M5).
+    suspensionActId: z.uuid(),
+  }),
+);
+
+/** Os cinco `type` publicados de rait-events-sse-contract.md §2.4. */
+export interface InfractionEventSchemas extends Record<string, ZodType> {
+  'inf.infraction.changed': ZodType;
+  'inf.infraction.penalty-final': ZodType;
+  'inf.infraction.refund-due': ZodType;
+  'inf.timer.expired': ZodType;
+  'inf.timer.rescheduled': ZodType;
+}
+
+export const INFRACTION_EVENT_SCHEMAS: InfractionEventSchemas = {
+  'inf.infraction.changed': infractionChanged,
+  'inf.infraction.penalty-final': penaltyFinal,
+  'inf.infraction.refund-due': refundDue,
+  'inf.timer.expired': timerExpired,
+  'inf.timer.rescheduled': timerRescheduled,
+};
diff --git a/backend/domains/inf/infraction/src/handwritten/guards/infraction.guard.ts b/backend/domains/inf/infraction/src/handwritten/guards/infraction.guard.ts
new file mode 100644
index 0000000..5bd4313
--- /dev/null
+++ b/backend/domains/inf/infraction/src/handwritten/guards/infraction.guard.ts
@@ -0,0 +1,128 @@
+// Guarda de transição do agregado da infração: código puro, sem rota, sem banco
+// e sem relógio (work/rounds/R-0006/contracts/CTG-0001.md §3.1 e §4; decisão M8
+// do plano de R-0006). `resolveTransition` casa a linha de
+// `inf.infraction_transition_ref`; `assertTransition` aplica a matriz de erro da
+// §4 na ordem de precedência declarada.
+import { RaitError } from '../errors.js';
+import {
+  INFRACTION_CLOSED_TRIGGERS,
+  INFRACTION_TERMINAL_STATES,
+  INFRACTION_TRANSITION_QUALIFIERS,
+  INFRACTION_TRANSITIONS,
+} from './infraction.transitions.js';
+import type {
+  InfractionTransition,
+  InfractionTriggerKind,
+} from './infraction.transitions.js';
+
+const CLOSED_STATE = 'INSTANCIA_ENCERRADA';
+
+export interface InfractionStateSnapshot {
+  state: string;
+  substate: string | null;
+}
+
+export interface InfractionTrigger {
+  kind: InfractionTriggerKind;
+  /** Token canônico do evento, timer ou ato (sem o qualificador). */
+  code: string;
+  /** Discriminante entre linhas de mesmo `(from, trigger)` (§6.1). */
+  qualifier?: string;
+}
+
+/**
+ * Gatilhos modelados por uma linha: o token principal de `trigger_code` e os
+ * alternativos que a mesma linha lista ("RAIT_DECISAO_PUBLICADA(nao_conhecido) |
+ * ENCERRADO_DESISTENCIA"), sem os qualificadores entre parênteses (§3).
+ */
+function modelledCodes(triggerCode: string): string[] {
+  const withoutQualifiers = triggerCode.replace(/\([^)]*\)/g, ' ');
+  return [...withoutQualifiers.matchAll(/[A-Z0-9][A-Z0-9_-]{2,}/g)].map(
+    (match) => match[0],
+  );
+}
+
+function matches(
+  row: InfractionTransition,
+  current: InfractionStateSnapshot,
+  trigger: InfractionTrigger,
+): boolean {
+  // Nulo na linha de referência = "qualquer" (§3.1).
+  if (row.fromState !== null && row.fromState !== current.state) return false;
+  if (row.fromSubstate !== null && row.fromSubstate !== current.substate) {
+    return false;
+  }
+  if (row.triggerKind !== trigger.kind) return false;
+  return modelledCodes(row.triggerCode).includes(trigger.code);
+}
+
+function qualifiersOf(row: InfractionTransition): readonly string[] {
+  return INFRACTION_TRANSITION_QUALIFIERS[row.id] ?? [];
+}
+
+/**
+ * Devolve a linha `vigente` que casa `(state, substate, gatilho, qualifier)`, ou
+ * `null`. Nunca devolve linha com `status !== 'vigente'`: 27 e 38 vencem como
+ * alerta no motor de prazos e 41 é irrecebível (§3.2).
+ */
+export function resolveTransition(
+  current: InfractionStateSnapshot,
+  trigger: InfractionTrigger,
+): InfractionTransition | null {
+  const candidates = INFRACTION_TRANSITIONS.filter(
+    (row) => row.status === 'vigente' && matches(row, current, trigger),
+  );
+  if (candidates.length === 0) return null;
+  if (trigger.qualifier !== undefined) {
+    return (
+      candidates.find((row) =>
+        qualifiersOf(row).includes(trigger.qualifier as string),
+      ) ?? null
+    );
+  }
+  return candidates.find((row) => qualifiersOf(row).length === 0) ?? null;
+}
+
+/**
+ * Mesma resolução, com a matriz de erro da §4 na precedência: terminal →
+ * encerrada sem revisão → estado inválido.
+ */
+export function assertTransition(
+  current: InfractionStateSnapshot,
+  trigger: InfractionTrigger,
+): InfractionTransition {
+  if (
+    current.state !== CLOSED_STATE &&
+    INFRACTION_TERMINAL_STATES.includes(current.state)
+  ) {
+    throw new RaitError('RAIT.INFRACTION_TERMINAL', {
+      status: 409,
+      context: { infractionState: current.state },
+      message: 'A infração está em estado terminal e não admite novos atos.',
+    });
+  }
+  if (
+    current.state === CLOSED_STATE &&
+    !INFRACTION_CLOSED_TRIGGERS.includes(trigger.code)
+  ) {
+    throw new RaitError('RAIT.INFRACTION_CLOSED_NO_REVISION', {
+      status: 409,
+      context: { infractionState: current.state },
+      message:
+        'Não há canal de revisão após o encerramento da instância: só pagamento e cobrança.',
+    });
+  }
+  const resolved = resolveTransition(current, trigger);
+  if (!resolved) {
+    throw new RaitError('RAIT.INFRACTION_STATE_INVALID', {
+      status: 409,
+      context: {
+        currentState: current.state,
+        currentSubstate: current.substate,
+        trigger: trigger.code,
+      },
+      message: 'A infração não está em um estado que admita este gatilho.',
+    });
+  }
+  return resolved;
+}
diff --git a/backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts b/backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts
new file mode 100644
index 0000000..8e959a6
--- /dev/null
+++ b/backend/domains/inf/infraction/src/handwritten/guards/infraction.transitions.ts
@@ -0,0 +1,647 @@
+// Espelho tipado das 46 linhas de `inf.infraction_transition_ref`
+// (backend/database/ddl/14-inf-lifecycle-vocabulary.sql, bloco INSERT), na ordem
+// do `id` e com os mesmos valores — nenhuma reinterpretação
+// (work/rounds/R-0006/contracts/CTG-0001.md §3). As linhas `a_confirmar` (27, 38)
+// e a linha `nao_modelada` (41) ficam na tabela para que a matriz seja auditável
+// contra o DDL; a resolução as filtra (§3.2).
+/** `inf.infraction_transition_ref.trigger_kind`. */
+export type InfractionTriggerKind = 'evento' | 'timer' | 'ato' | 'sistema';
+
+export interface InfractionTransition {
+  /** `inf.infraction_transition_ref.id` (1..46). */
+  id: number;
+  /** `rule_ref` = número da linha de [WF-INF-003] §2 (1..31). */
+  ruleRef: number;
+  fromState: string | null;
+  fromSubstate: string | null;
+  toState: string;
+  toSubstate: string | null;
+  triggerKind: InfractionTriggerKind;
+  triggerCode: string;
+  status: 'vigente' | 'a_confirmar' | 'nao_modelada';
+  legalBasis: string;
+}
+
+export const INFRACTION_TRANSITIONS: readonly InfractionTransition[] = [
+  {
+    id: 1,
+    ruleRef: 1,
+    fromState: null,
+    fromSubstate: null,
+    toState: 'AIT_LAVRADO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_INTEGRADO',
+    status: 'vigente',
+    legalBasis: 'CTB art. 281',
+  },
+  {
+    id: 2,
+    ruleRef: 2,
+    fromState: 'AIT_LAVRADO',
+    fromSubstate: null,
+    toState: 'ARQUIVADO',
+    toSubstate: null,
+    triggerKind: 'ato',
+    triggerCode: 'AUTORIDADE_JULGA_INSUBSISTENTE',
+    status: 'vigente',
+    legalBasis: 'CTB art. 281 §1º I',
+  },
+  {
+    id: 3,
+    ruleRef: 3,
+    fromState: 'AIT_LAVRADO',
+    fromSubstate: null,
+    toState: 'ARQUIVADO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-NA',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 4º §1º',
+  },
+  {
+    id: 4,
+    ruleRef: 4,
+    fromState: 'AIT_LAVRADO',
+    fromSubstate: null,
+    toState: 'NOTIFICADO_AUTUACAO',
+    toSubstate: 'PRAZO_DEFESA_ABERTO',
+    triggerKind: 'evento',
+    triggerCode: 'NOTIFICACAO_EXPEDIDA(NA)',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 arts. 3º §5º, 4º',
+  },
+  {
+    id: 5,
+    ruleRef: 5,
+    fromState: 'NOTIFICADO_AUTUACAO',
+    fromSubstate: 'PRAZO_DEFESA_ABERTO',
+    toState: 'NOTIFICADO_AUTUACAO',
+    toSubstate: 'INDICACAO_EM_PROCESSAMENTO',
+    triggerKind: 'evento',
+    triggerCode: 'CONDUTOR_INDICADO',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 5º',
+  },
+  {
+    id: 6,
+    ruleRef: 5,
+    fromState: 'NOTIFICADO_AUTUACAO',
+    fromSubstate: 'INDICACAO_EM_PROCESSAMENTO',
+    toState: 'NOTIFICADO_AUTUACAO',
+    toSubstate: 'PRAZO_DEFESA_ABERTO',
+    triggerKind: 'sistema',
+    triggerCode: 'INDICACAO_VALIDADA',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 arts. 5º-6º',
+  },
+  {
+    id: 7,
+    ruleRef: 6,
+    fromState: 'NOTIFICADO_AUTUACAO',
+    fromSubstate: null,
+    toState: 'DEFESA_EM_JULGAMENTO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_CASO_PROTOCOLADO(defesa_previa)',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 9º',
+  },
+  {
+    id: 8,
+    ruleRef: 7,
+    fromState: 'NOTIFICADO_AUTUACAO',
+    fromSubstate: null,
+    toState: 'PENALIDADE_A_APLICAR',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-DEF',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 9º §2º; CTB art. 257 §8º',
+  },
+  {
+    id: 9,
+    ruleRef: 8,
+    fromState: 'DEFESA_EM_JULGAMENTO',
+    fromSubstate: null,
+    toState: 'AIT_CANCELADO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_DECISAO_PUBLICADA(acolhida)',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 9º §1º',
+  },
+  {
+    id: 10,
+    ruleRef: 9,
+    fromState: 'DEFESA_EM_JULGAMENTO',
+    fromSubstate: null,
+    toState: 'PENALIDADE_A_APLICAR',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode:
+      'RAIT_DECISAO_PUBLICADA(indeferida|nao_conhecido) | ENCERRADO_DESISTENCIA',
+    status: 'vigente',
+    legalBasis: 'Res. 918/2022 art. 9º §2º; Res. 900/2022 art. 11',
+  },
+  {
+    id: 11,
+    ruleRef: 10,
+    fromState: 'DEFESA_EM_JULGAMENTO',
+    fromSubstate: null,
+    toState: 'EXTINTO_DECADENCIA',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-DEC',
+    status: 'vigente',
+    legalBasis: 'CTB art. 282 §7º',
+  },
+  {
+    id: 12,
+    ruleRef: 10,
+    fromState: 'PENALIDADE_A_APLICAR',
+    fromSubstate: null,
+    toState: 'EXTINTO_DECADENCIA',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-DEC',
+    status: 'vigente',
+    legalBasis: 'CTB art. 282 §7º',
+  },
+  {
+    id: 13,
+    ruleRef: 11,
+    fromState: 'PENALIDADE_A_APLICAR',
+    fromSubstate: null,
+    toState: 'NOTIFICADO_PENALIDADE',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'NOTIFICACAO_EXPEDIDA(NP)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 282; Res. 918/2022 art. 12',
+  },
+  {
+    id: 14,
+    ruleRef: 12,
+    fromState: 'PENALIDADE_A_APLICAR',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'QUITADA',
+    triggerKind: 'evento',
+    triggerCode: 'NOTIFICACAO_EXPEDIDA(NP, reconhecimento=true)',
+    status: 'vigente',
+    legalBasis: 'CTB arts. 284 §1º, 290 III',
+  },
+  {
+    id: 15,
+    ruleRef: 13,
+    fromState: 'NOTIFICADO_PENALIDADE',
+    fromSubstate: null,
+    toState: 'NOTIFICADO_PENALIDADE',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'PAGAMENTO_CONFIRMADO',
+    status: 'vigente',
+    legalBasis: 'CTB art. 284 §2º',
+  },
+  {
+    id: 16,
+    ruleRef: 14,
+    fromState: 'NOTIFICADO_PENALIDADE',
+    fromSubstate: null,
+    toState: 'RECURSO_1A_INSTANCIA',
+    toSubstate: 'EM_ADMISSIBILIDADE_1A',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_CASO_PROTOCOLADO(jari)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 285',
+  },
+  {
+    id: 17,
+    ruleRef: 15,
+    fromState: 'NOTIFICADO_PENALIDADE',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'timer',
+    triggerCode: 'T-NP-VENC',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290 II',
+  },
+  {
+    id: 18,
+    ruleRef: 16,
+    fromState: 'NOTIFICADO_PENALIDADE',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'QUITADA',
+    triggerKind: 'evento',
+    triggerCode:
+      'PAGAMENTO_CONFIRMADO(reconhecimento) + REQUERIMENTO_ENCERRAMENTO',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290 III',
+  },
+  {
+    id: 19,
+    ruleRef: 17,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: 'EM_ADMISSIBILIDADE_1A',
+    toState: 'RECURSO_1A_INSTANCIA',
+    toSubstate: 'EM_REMESSA_JARI',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
+    status: 'vigente',
+    legalBasis: 'CTB art. 285 caput e §1º; RN-RAIT-108',
+  },
+  {
+    id: 20,
+    ruleRef: 18,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: 'EM_REMESSA_JARI',
+    toState: 'RECURSO_1A_INSTANCIA',
+    toSubstate: 'EM_JULGAMENTO_JARI',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_RECURSO_RECEBIDO_JULGADOR',
+    status: 'vigente',
+    legalBasis: 'CTB art. 285 §§2º, 6º',
+  },
+  {
+    id: 21,
+    ruleRef: 19,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'NOTIFICADO_PENALIDADE',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_DECISAO_PUBLICADA(nao_conhecido) na triagem',
+    status: 'vigente',
+    legalBasis: 'CTB art. 285 §5º',
+  },
+  {
+    id: 22,
+    ruleRef: 19,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_DECISAO_PUBLICADA(nao_conhecido) na triagem',
+    status: 'vigente',
+    legalBasis: 'CTB arts. 285 §5º, 290 II',
+  },
+  {
+    id: 23,
+    ruleRef: 20,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'NOTIFICADO_PENALIDADE',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'ENCERRADO_DESISTENCIA',
+    status: 'vigente',
+    legalBasis: 'RN-RAIT-123',
+  },
+  {
+    id: 24,
+    ruleRef: 20,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'evento',
+    triggerCode: 'ENCERRADO_DESISTENCIA',
+    status: 'vigente',
+    legalBasis: 'RN-RAIT-123; CTB art. 290 II',
+  },
+  {
+    id: 25,
+    ruleRef: 21,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'AGUARDANDO_RECURSO_2A',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_DECISAO_PUBLICADA (JARI)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 288',
+  },
+  {
+    id: 26,
+    ruleRef: 22,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'EXTINTO_PRESCRICAO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-JUL-24M',
+    status: 'vigente',
+    legalBasis: 'CTB art. 289-A',
+  },
+  {
+    id: 27,
+    ruleRef: 22,
+    fromState: 'RECURSO_1A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'EXTINTO_PRESCRICAO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-PAR-3A',
+    status: 'a_confirmar',
+    legalBasis: 'Lei 9.873/1999 art. 1º §1º',
+  },
+  {
+    id: 28,
+    ruleRef: 23,
+    fromState: 'AGUARDANDO_RECURSO_2A',
+    fromSubstate: 'PROVIDO_1A',
+    toState: 'RECURSO_2A_INSTANCIA',
+    toSubstate: 'EM_JULGAMENTO_CETRAN',
+    triggerKind: 'ato',
+    triggerCode: 'RECURSO_AUTORIDADE',
+    status: 'vigente',
+    legalBasis: 'CTB art. 288 §1º; RN-RAIT-130',
+  },
+  {
+    id: 29,
+    ruleRef: 24,
+    fromState: 'AGUARDANDO_RECURSO_2A',
+    fromSubstate: 'PROVIDO_1A',
+    toState: 'CANCELADO_DEFINITIVO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-R2',
+    status: 'vigente',
+    legalBasis: 'CTB arts. 286 §2º, 288',
+  },
+  {
+    id: 30,
+    ruleRef: 25,
+    fromState: 'AGUARDANDO_RECURSO_2A',
+    fromSubstate: 'NEGADO_1A',
+    toState: 'RECURSO_2A_INSTANCIA',
+    toSubstate: 'EM_ADMISSIBILIDADE_2A',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_CASO_PROTOCOLADO(cetran)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 288 caput',
+  },
+  {
+    id: 31,
+    ruleRef: 26,
+    fromState: 'AGUARDANDO_RECURSO_2A',
+    fromSubstate: 'NEGADO_1A',
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'timer',
+    triggerCode: 'T-R2',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290 II',
+  },
+  {
+    id: 32,
+    ruleRef: 18,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: 'EM_ADMISSIBILIDADE_2A',
+    toState: 'RECURSO_2A_INSTANCIA',
+    toSubstate: 'EM_JULGAMENTO_CETRAN',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_RECURSO_RECEBIDO_JULGADOR',
+    status: 'vigente',
+    legalBasis: 'CTB art. 289; RN-RAIT-111',
+  },
+  {
+    id: 33,
+    ruleRef: 27,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_CASO_TRANSITADO (penalidade mantida)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290 I',
+  },
+  {
+    id: 34,
+    ruleRef: 27,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'AGUARDANDO_RECURSO_2A',
+    toSubstate: 'NEGADO_1A',
+    triggerKind: 'evento',
+    triggerCode:
+      'RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA',
+    status: 'vigente',
+    legalBasis: 'CTB art. 288',
+  },
+  {
+    id: 35,
+    ruleRef: 27,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'PENDENTE_PAGAMENTO',
+    triggerKind: 'evento',
+    triggerCode:
+      'RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290 II',
+  },
+  {
+    id: 36,
+    ruleRef: 28,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'CANCELADO_DEFINITIVO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'RAIT_CASO_TRANSITADO (favorável)',
+    status: 'vigente',
+    legalBasis: 'CTB art. 286 §2º',
+  },
+  {
+    id: 37,
+    ruleRef: 22,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'EXTINTO_PRESCRICAO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-JUL-24M',
+    status: 'vigente',
+    legalBasis: 'CTB art. 289-A',
+  },
+  {
+    id: 38,
+    ruleRef: 22,
+    fromState: 'RECURSO_2A_INSTANCIA',
+    fromSubstate: null,
+    toState: 'EXTINTO_PRESCRICAO',
+    toSubstate: null,
+    triggerKind: 'timer',
+    triggerCode: 'T-PAR-3A',
+    status: 'a_confirmar',
+    legalBasis: 'Lei 9.873/1999 art. 1º §1º',
+  },
+  {
+    id: 39,
+    ruleRef: 29,
+    fromState: 'INSTANCIA_ENCERRADA',
+    fromSubstate: 'PENDENTE_PAGAMENTO',
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'QUITADA',
+    triggerKind: 'evento',
+    triggerCode: 'PAGAMENTO_CONFIRMADO',
+    status: 'vigente',
+    legalBasis: 'CTB art. 290; Res. 918/2022 arts. 18, 23',
+  },
+  {
+    id: 40,
+    ruleRef: 29,
+    fromState: 'INSTANCIA_ENCERRADA',
+    fromSubstate: 'PENDENTE_PAGAMENTO',
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: 'EM_COBRANCA',
+    triggerKind: 'sistema',
+    triggerCode: 'HANDOFF_DIVIDA_ATIVA',
+    status: 'vigente',
+    legalBasis: 'UC-RAIT-034',
+  },
+  {
+    id: 41,
+    ruleRef: 30,
+    fromState: 'INSTANCIA_ENCERRADA',
+    fromSubstate: null,
+    toState: 'INSTANCIA_ENCERRADA',
+    toSubstate: null,
+    triggerKind: 'ato',
+    triggerCode: 'REVISAO_POS_ENCERRAMENTO',
+    status: 'nao_modelada',
+    legalBasis: 'Owner C.22',
+  },
+  {
+    id: 42,
+    ruleRef: 31,
+    fromState: 'AIT_LAVRADO',
+    fromSubstate: null,
+    toState: 'CANCELADO_POS_INTEGRACAO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_CANCELADO_POSFINAL',
+    status: 'vigente',
+    legalBasis: 'RN-TEAT-121',
+  },
+  {
+    id: 43,
+    ruleRef: 31,
+    fromState: 'NOTIFICADO_AUTUACAO',
+    fromSubstate: null,
+    toState: 'CANCELADO_POS_INTEGRACAO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_CANCELADO_POSFINAL',
+    status: 'vigente',
+    legalBasis: 'RN-TEAT-121',
+  },
+  {
+    id: 44,
+    ruleRef: 31,
+    fromState: 'DEFESA_EM_JULGAMENTO',
+    fromSubstate: null,
+    toState: 'CANCELADO_POS_INTEGRACAO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_CANCELADO_POSFINAL',
+    status: 'vigente',
+    legalBasis: 'RN-TEAT-121',
+  },
+  {
+    id: 45,
+    ruleRef: 31,
+    fromState: 'PENALIDADE_A_APLICAR',
+    fromSubstate: null,
+    toState: 'CANCELADO_POS_INTEGRACAO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_CANCELADO_POSFINAL',
+    status: 'vigente',
+    legalBasis: 'RN-TEAT-121',
+  },
+  {
+    id: 46,
+    ruleRef: 31,
+    fromState: 'NOTIFICADO_PENALIDADE',
+    fromSubstate: null,
+    toState: 'CANCELADO_POS_INTEGRACAO',
+    toSubstate: null,
+    triggerKind: 'evento',
+    triggerCode: 'AIT_CANCELADO_POSFINAL',
+    status: 'vigente',
+    legalBasis: 'RN-TEAT-121',
+  },
+];
+
+/**
+ * Estados com `inf.infraction_state_ref.is_terminal = true` (DDL 14): nenhum
+ * gatilho é admitido sobre eles (CTG-0001 §4, precedência 1).
+ */
+export const INFRACTION_TERMINAL_STATES: readonly string[] = [
+  'INSTANCIA_ENCERRADA',
+  'ARQUIVADO',
+  'CANCELADO_POS_INTEGRACAO',
+  'AIT_CANCELADO',
+  'EXTINTO_DECADENCIA',
+  'EXTINTO_PRESCRICAO',
+  'CANCELADO_DEFINITIVO',
+];
+
+/**
+ * Únicos gatilhos admitidos em `INSTANCIA_ENCERRADA` — as linhas 39 e 40; todo
+ * o resto é `RAIT.INFRACTION_CLOSED_NO_REVISION` (Owner C.22; CTG-0001 §4).
+ */
+export const INFRACTION_CLOSED_TRIGGERS: readonly string[] = [
+  'PAGAMENTO_CONFIRMADO',
+  'HANDOFF_DIVIDA_ATIVA',
+];
+
+/**
+ * Discriminantes por linha, quando `(from_state, from_substate, trigger_kind,
+ * trigger_code)` não basta. Os tokens vêm do próprio `trigger_code` do DDL 14
+ * (o que está entre parênteses) e de CTG-0001 §3.1/§6.1:
+ *
+ * - `kind` do aviso: `NA` (4), `NP` (13) e `reconhecimento` (14, "NP,
+ *   reconhecimento=true");
+ * - `instance` do caso: `defesa_previa` (7), `jari` (16), `cetran` (30);
+ * - `decisionKind`: `acolhida` (9), `indeferida`/`nao_conhecido` (10),
+ *   `provido`/`negado` (25, sub-estado PROVIDO_1A|NEGADO_1A conforme o
+ *   resultado), `negado`/`nao_conhecido` (33) e `provido` (36);
+ * - `reconhecimento` (18, "PAGAMENTO_CONFIRMADO(reconhecimento) +
+ *   REQUERIMENTO_ENCERRAMENTO"), ausente na linha 15;
+ * - estado do prazo nas duplas 21/22, 23/24 e 34/35 — `prazo_aberto` |
+ *   `prazo_vencido` —, que não é derivável de `(state, substate, trigger)` e o
+ *   chamador determina com `timeliness` do motor de prazos (§6.1).
+ *
+ * Linha sem entrada aqui casa qualquer gatilho sem `qualifier`.
+ */
+export const INFRACTION_TRANSITION_QUALIFIERS: Readonly<
+  Record<number, readonly string[]>
+> = {
+  4: ['NA'],
+  7: ['defesa_previa'],
+  9: ['acolhida'],
+  10: ['indeferida', 'nao_conhecido'],
+  13: ['NP'],
+  14: ['reconhecimento'],
+  16: ['jari'],
+  18: ['reconhecimento'],
+  21: ['prazo_aberto'],
+  22: ['prazo_vencido'],
+  23: ['prazo_aberto'],
+  24: ['prazo_vencido'],
+  25: ['provido', 'negado'],
+  30: ['cetran'],
+  33: ['negado', 'nao_conhecido'],
+  34: ['prazo_aberto'],
+  35: ['prazo_vencido'],
+  36: ['provido'],
+};
diff --git a/backend/domains/inf/infraction/src/handwritten/index.ts b/backend/domains/inf/infraction/src/handwritten/index.ts
new file mode 100644
index 0000000..f4f3deb
--- /dev/null
+++ b/backend/domains/inf/infraction/src/handwritten/index.ts
@@ -0,0 +1,27 @@
+// API pública manuscrita de @detran/inf-infraction
+// (work/rounds/R-0006/contracts/CTG-0001.md §6.1), reexportada pelo `src/index.ts`
+// gerado via `module.handwrittenExports` do BP-INF-INFRACTION-001 (ADR-0007:
+// código gerado não se edita). Nesta rodada só há código puro — nenhuma rota,
+// nenhum job, nenhum acesso a banco (rotas e varredura são de R-0007).
+export { RaitError } from './errors.js';
+export type { RaitErrorOptions } from './errors.js';
+export { INFRACTION_EVENT_SCHEMAS } from './events.js';
+export type { InfractionEventSchemas } from './events.js';
+export {
+  assertTransition,
+  resolveTransition,
+} from './guards/infraction.guard.js';
+export type {
+  InfractionStateSnapshot,
+  InfractionTrigger,
+} from './guards/infraction.guard.js';
+export {
+  INFRACTION_CLOSED_TRIGGERS,
+  INFRACTION_TERMINAL_STATES,
+  INFRACTION_TRANSITION_QUALIFIERS,
+  INFRACTION_TRANSITIONS,
+} from './guards/infraction.transitions.js';
+export type {
+  InfractionTransition,
+  InfractionTriggerKind,
+} from './guards/infraction.transitions.js';
diff --git a/backend/domains/inf/infraction/tests/integration/infraction-db.integration.spec.ts b/backend/domains/inf/infraction/tests/integration/infraction-db.integration.spec.ts
new file mode 100644
index 0000000..293d385
--- /dev/null
+++ b/backend/domains/inf/infraction/tests/integration/infraction-db.integration.spec.ts
@@ -0,0 +1,222 @@
+// Contrato de banco do agregado da infração (backend/database/ddl/38-inf-infraction.sql):
+// RLS forçada e gatilho enforce_tenant_id em todas as tabelas de tenant, leitura
+// cruzada entre tenants vazia (rait-test-strategy.md §4), checks de invariante,
+// FK do catálogo de timers, unicidade da infração por AIT e presença das
+// fixtures de backend/database/seed/30-fixtures-infraction.sql (CTG-0001 §7).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7): entidades de
+// domínio nunca usam randomUUID().
+const OTHER_TENANT = randomUUID();
+const TENANT_TABLES = ['infraction', 'infraction_timer', 'infraction_event'];
+const INFRACTION_0001 = '00000000-0000-7000-8000-0000d0000001';
+const AIT_0001 = '00000000-0000-7000-8000-0000f0000001';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
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
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.infraction — contrato de banco (DDL 38)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as tabelas de tenant do DDL 38 quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.infraction'),
+    );
+    expect(mine).toBe(15);
+
+    for (const table of TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.infraction (tenant_id, ait_id, committed_on, flagrant, state_changed_at)
+           values ($1, $2, '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
+          [TENANT, AIT_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.infraction_timer (tenant_id, infraction_id, timer_code, start_basis, started_on, raw_due_on, due_on, status, legal_basis)
+           values ($1, $2, 'T-NA', 'cometimento', '2026-09-01', '2026-10-01', '2026-10-01', 'armado', 'Res. 918/2022 art. 4º §1º')`,
+          [TENANT, INFRACTION_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.infraction_event (tenant_id, infraction_id, trigger_kind, trigger_code, event_code, occurred_at, actor_kind, payload)
+           values ($1, $2, 'evento', 'AIT_INTEGRADO', 'INFRACAO_ESTADO_ALTERADO', '2026-09-01T12:00:00-04:00', 'system', '{}'::jsonb)`,
+          [TENANT, INFRACTION_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dado um estado fora de infraction_state_ref quando a infração é inserida então ck_inf_infraction_state rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.infraction (tenant_id, ait_id, state, committed_on, flagrant, state_changed_at)
+           values ($1, $2, 'ESTADO_INEXISTENTE', '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
+          [TENANT, '00000000-0000-7000-8000-0000f0000016'],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um timer_code fora de infraction_timer_ref quando o timer é inserido então a integridade do catálogo rejeita', async () => {
+    const constraint = await client.query<{ conname: string }>(
+      `select conname from pg_constraint
+        where conrelid = 'inf.infraction_timer'::regclass
+          and conname = 'fk_inf_infraction_timer_code'`,
+    );
+    expect(constraint.rows).toHaveLength(1);
+
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.infraction_timer (tenant_id, infraction_id, timer_code, start_basis, started_on, raw_due_on, due_on, status, legal_basis)
+           values ($1, $2, 'T-INEXISTENTE', 'cometimento', '2026-09-01', '2026-10-01', '2026-10-01', 'armado', 'fixture')`,
+          [TENANT, INFRACTION_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
+  });
+
+  it('dado o AIT …0000f0000001 já com infração quando uma segunda infração do mesmo AIT é inserida então ux_inf_infraction_ait rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.infraction (tenant_id, ait_id, committed_on, flagrant, state_changed_at)
+           values ($1, $2, '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
+          [TENANT, AIT_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dadas as fixtures 30-fixtures-infraction.sql quando contadas então há 15 infrações, uma por estado, com 91 timers e 69 eventos', async () => {
+    expect(
+      await count(
+        `select count(distinct state)::text as count from inf.infraction where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(15);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.infraction where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(15);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.infraction_timer where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(91);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.infraction_event where tenant_id = $1`,
+        [TENANT],
+      ),
+    ).toBe(69);
+
+    const missing = await client.query<{ code: string }>(
+      `select reference.code
+         from inf.infraction_state_ref reference
+        where not exists (
+                select 1 from inf.infraction where tenant_id = $1 and state = reference.code)`,
+      [TENANT],
+    );
+    expect(missing.rows.map((row) => row.code)).toEqual([]);
+  });
+});
diff --git a/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts b/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts
new file mode 100644
index 0000000..57627b2
--- /dev/null
+++ b/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts
@@ -0,0 +1,253 @@
+// Esquemas dos cinco eventos publicados do agregado
+// (rait-events-sse-contract.md §1 envelope e §2.4 catálogo;
+// work/rounds/R-0006/contracts/CTG-0001.md §6.1): cada
+// INFRACTION_EVENT_SCHEMAS[type] aceita um envelope válido com ids de fixture,
+// rejeita payload sem campo obrigatório e rejeita token fora do vocabulário.
+// O mesmo exemplo é conferido contra docs/framework/schemas/events/*.schema.json
+// (`ajv` não está em node_modules deste pacote: a conferência compara chaves
+// obrigatórias, `const` e `enum` lendo o JSON, como manda a tarefa).
+import { readFileSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import { INFRACTION_EVENT_SCHEMAS } from '../../src/handwritten/index.js';
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+const infraction = (nnnn: string) => `00000000-0000-7000-8000-0000d000${nnnn}`;
+const ait = (nnnn: string) => `00000000-0000-7000-8000-0000f000${nnnn}`;
+const TIMER_0014_JUL = '00000000-0000-7000-8000-0000d1000079';
+const CASE_08 = '00000000-0000-7000-8000-000010000008';
+const SECRETARY = '00000000-0000-4000-8000-0000b0000005';
+// `inf.payment` (BP-INF-COLLECTION-001) e `inf.rait_suspension_act` (DDL 39)
+// nascem fora do CTG-0001 e não têm prefixo de id fixado no §7: uuid nulo como
+// marcador explícito de pendência, nunca um id canônico inventado.
+const PENDING_ID = '00000000-0000-0000-0000-000000000000';
+
+interface JsonSchema {
+  required?: string[];
+  properties?: Record<string, JsonSchema>;
+  const?: unknown;
+  enum?: unknown[];
+  type?: string | string[];
+}
+
+function jsonSchema(type: string): JsonSchema {
+  return JSON.parse(
+    readFileSync(
+      fileURLToPath(
+        new URL(
+          `../../../../../../docs/framework/schemas/events/${type}.schema.json`,
+          import.meta.url,
+        ),
+      ),
+      'utf8',
+    ),
+  ) as JsonSchema;
+}
+
+// Conferência do exemplo contra o JSON Schema, sem ajv: presença de todo
+// `required`, igualdade de todo `const`, pertinência a todo `enum` e ausência de
+// chave fora de `properties` (additionalProperties: false ⇒ .strict()).
+function schemaProblems(
+  schema: JsonSchema,
+  value: unknown,
+  path = '',
+): string[] {
+  const problems: string[] = [];
+  if (schema.const !== undefined && value !== schema.const) {
+    problems.push(`${path}: const ${String(schema.const)} != ${String(value)}`);
+  }
+  if (schema.enum && !schema.enum.includes(value as never)) {
+    problems.push(`${path}: ${String(value)} fora do enum`);
+  }
+  if (schema.properties && typeof value === 'object' && value !== null) {
+    const record = value as Record<string, unknown>;
+    for (const key of schema.required ?? []) {
+      if (!(key in record))
+        problems.push(`${path}/${key}: obrigatório ausente`);
+    }
+    for (const key of Object.keys(record)) {
+      const child = schema.properties[key];
+      if (!child) {
+        problems.push(`${path}/${key}: chave fora de properties`);
+        continue;
+      }
+      problems.push(...schemaProblems(child, record[key], `${path}/${key}`));
+    }
+  }
+  return problems;
+}
+
+let envelopeSeq = 0;
+const envelope = (
+  type: string,
+  domainEvent: string,
+  aggregate: { kind: string; id: string; version: number },
+  actor: { kind: string; id: string; role?: string },
+  data: Record<string, unknown>,
+) => ({
+  id: `01J8ZK000000000000000${(envelopeSeq += 1).toString().padStart(5, '0')}`,
+  type,
+  domainEvent,
+  version: 1,
+  occurredAt: '2026-09-10T16:00:00.000Z',
+  tenantId: TENANT,
+  actor,
+  correlationId: '01J8ZK0000000000000000REQ0',
+  aggregate,
+  data,
+});
+
+// Um exemplo válido por evento, com as fixtures do CTG-0001 §7 e os tokens das
+// linhas de inf.infraction_transition_ref / inf.infraction_timer_ref.
+const EXAMPLES: Record<
+  string,
+  {
+    example: ReturnType<typeof envelope>;
+    missing: string;
+    outOfVocabulary: [string, unknown];
+  }
+> = {
+  // Infração 0006 entrando em RECURSO_1A_INSTANCIA pela linha 16 do DDL 14.
+  'inf.infraction.changed': {
+    example: envelope(
+      'inf.infraction.changed',
+      'INFRACAO_ESTADO_ALTERADO',
+      { kind: 'infraction', id: infraction('0006'), version: 1 },
+      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
+      {
+        infractionId: infraction('0006'),
+        aitId: ait('0006'),
+        fromState: 'NOTIFICADO_PENALIDADE',
+        toState: 'RECURSO_1A_INSTANCIA',
+        substate: 'EM_ADMISSIBILIDADE_1A',
+        triggerKind: 'evento',
+        triggerCode: 'RAIT_CASO_PROTOCOLADO(jari)',
+        ruleRef: 14,
+      },
+    ),
+    missing: 'toState',
+    outOfVocabulary: ['toState', 'RECURSO_3A_INSTANCIA'],
+  },
+  // Infração 0009 (INSTANCIA_ENCERRADA, points_registered=true, linha 17);
+  // `finalOn` = due_on de T-NP-VENC (§7.2). `points` não tem fonte na lista
+  // fechada desta tarefa: 0 é o mínimo do esquema e só a forma é exercitada.
+  'inf.infraction.penalty-final': {
+    example: envelope(
+      'inf.infraction.penalty-final',
+      'PENALIDADE_DEFINITIVA',
+      { kind: 'infraction', id: infraction('0009'), version: 1 },
+      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
+      {
+        infractionId: infraction('0009'),
+        aitId: ait('0009'),
+        finalOn: '2026-07-15',
+        points: 0,
+        amountTier: 'nenhum',
+      },
+    ),
+    missing: 'amountTier',
+    outOfVocabulary: ['amountTier', 'desconto_50'],
+  },
+  // Infração 0015 (CANCELADO_DEFINITIVO com paid=true, payment_tier
+  // 'restituido', linha 29). `amount` não tem fonte canônica (nenhuma fixture
+  // carrega valor de multa): o exemplo usa o limite do esquema.
+  'inf.infraction.refund-due': {
+    example: envelope(
+      'inf.infraction.refund-due',
+      'RESTITUICAO_DEVIDA',
+      { kind: 'infraction', id: infraction('0015'), version: 1 },
+      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
+      {
+        infractionId: infraction('0015'),
+        paymentId: PENDING_ID,
+        amount: 1,
+        reason: 'CANCELADO_DEFINITIVO',
+      },
+    ),
+    missing: 'paymentId',
+    outOfVocabulary: ['amount', 0],
+  },
+  // T-JUL-24M da infração 0014, vencido em 2026-09-10 (§7.2), expiry_kind
+  // 'transicao' no catálogo de timers.
+  'inf.timer.expired': {
+    example: envelope(
+      'inf.timer.expired',
+      'TIMER_VENCIDO',
+      { kind: 'infraction', id: infraction('0014'), version: 1 },
+      { kind: 'timer', id: TIMER_0014_JUL },
+      {
+        ownerKind: 'infraction',
+        ownerId: infraction('0014'),
+        timerCode: 'T-JUL-24M',
+        dueOn: '2026-09-10',
+        effect: 'transicao',
+      },
+    ),
+    missing: 'timerCode',
+    outOfVocabulary: ['effect', 'indicador'],
+  },
+  // Caso 10 de CTG-0001 §5.1: T-DIL do caso RAIT 08 reprogramado por ato de
+  // suspensão de 10 dias úteis (2026-12-07 → 2026-12-22).
+  'inf.timer.rescheduled': {
+    example: envelope(
+      'inf.timer.rescheduled',
+      'TIMER_REPROGRAMADO',
+      { kind: 'case', id: CASE_08, version: 1 },
+      { kind: 'user', id: SECRETARY, role: 'rait-secretary' },
+      {
+        ownerId: CASE_08,
+        timerCode: 'T-DIL',
+        oldDueOn: '2026-12-07',
+        newDueOn: '2026-12-22',
+        suspensionActId: PENDING_ID,
+      },
+    ),
+    missing: 'newDueOn',
+    outOfVocabulary: ['timerCode', 'T-DIL-30'],
+  },
+};
+
+describe('esquemas dos eventos publicados do agregado (§2.4)', () => {
+  it('dado o catálogo §2.4 quando INFRACTION_EVENT_SCHEMAS é lido então tem exatamente os cinco tipos publicados', () => {
+    expect(Object.keys(INFRACTION_EVENT_SCHEMAS).sort()).toEqual(
+      Object.keys(EXAMPLES).sort(),
+    );
+  });
+
+  for (const [type, { example, missing, outOfVocabulary }] of Object.entries(
+    EXAMPLES,
+  )) {
+    describe(type, () => {
+      it(`dado um envelope de ${type} com ids de fixture quando parse então é aceito`, () => {
+        expect(() =>
+          INFRACTION_EVENT_SCHEMAS[type].parse(example),
+        ).not.toThrow();
+      });
+
+      it(`dado um envelope de ${type} sem o campo obrigatório ${missing} quando parse então é rejeitado`, () => {
+        const data = { ...(example.data as Record<string, unknown>) };
+        delete data[missing];
+
+        expect(() =>
+          INFRACTION_EVENT_SCHEMAS[type].parse({ ...example, data }),
+        ).toThrow();
+      });
+
+      it(`dado um envelope de ${type} com ${outOfVocabulary[0]} fora do vocabulário quando parse então é rejeitado`, () => {
+        const data = {
+          ...(example.data as Record<string, unknown>),
+          [outOfVocabulary[0]]: outOfVocabulary[1],
+        };
+
+        expect(() =>
+          INFRACTION_EVENT_SCHEMAS[type].parse({ ...example, data }),
+        ).toThrow();
+      });
+
+      it(`dado o mesmo envelope de ${type} quando conferido contra ${type}.schema.json então não há divergência de obrigatórios, const e enums`, () => {
+        expect(schemaProblems(jsonSchema(type), example)).toEqual([]);
+      });
+    });
+  }
+});
diff --git a/backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts b/backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts
new file mode 100644
index 0000000..c4a91ac
--- /dev/null
+++ b/backend/domains/inf/infraction/tests/unit/infraction-transitions.matrix.spec.ts
@@ -0,0 +1,374 @@
+// Matriz de transições do agregado da infração: as 46 linhas de
+// inf.infraction_transition_ref são lidas do bloco INSERT de
+// backend/database/ddl/14-inf-lifecycle-vocabulary.sql (o DDL é a fonte, como em
+// tools/check-lifecycle-vocabulary.ts) e cada `id` recebe um teste
+// (rait-test-strategy.md §3; work/rounds/R-0006/contracts/CTG-0001.md §3.3).
+// Guardas, gatilhos e qualificadores vêm de CTG-0001 §3 e §3.1; os códigos de
+// erro e a precedência, de §4 (rait-error-catalog.md §3.12).
+import { readFileSync } from 'node:fs';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import {
+  assertTransition,
+  INFRACTION_TRANSITIONS,
+  resolveTransition,
+} from '../../src/handwritten/index.js';
+
+type TriggerKind = 'evento' | 'timer' | 'ato' | 'sistema';
+
+interface DdlTransition {
+  id: number;
+  ruleRef: number;
+  fromState: string | null;
+  fromSubstate: string | null;
+  toState: string;
+  toSubstate: string | null;
+  triggerKind: TriggerKind;
+  triggerCode: string;
+  status: 'vigente' | 'a_confirmar' | 'nao_modelada';
+}
+
+const ddl = readFileSync(
+  fileURLToPath(
+    new URL(
+      '../../../../../database/ddl/14-inf-lifecycle-vocabulary.sql',
+      import.meta.url,
+    ),
+  ),
+  'utf8',
+);
+
+function insertBlock(table: string, terminator: string): string {
+  const start = ddl.indexOf(`INSERT INTO ${table}`);
+  const end = ddl.indexOf(terminator, start);
+  return ddl.slice(start, end);
+}
+
+function ddlTransitions(): DdlTransition[] {
+  const unquote = (value: string) =>
+    value === 'NULL' ? null : value.slice(1, -1).replace(/''/g, "'");
+  const rows: DdlTransition[] = [];
+  for (const line of insertBlock(
+    'inf.infraction_transition_ref (id,',
+    'ON CONFLICT (id)',
+  ).split('\n')) {
+    const match =
+      /^\s*\((\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(NULL|'[^']*'),\s*'([^']+)',\s*'((?:[^']|'')*)',\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'([a-z_]+)'/.exec(
+        line,
+      );
+    if (!match) continue;
+    rows.push({
+      id: Number(match[1]),
+      ruleRef: Number(match[2]),
+      fromState: unquote(match[3] as string),
+      fromSubstate: unquote(match[4] as string),
+      toState: match[5] as string,
+      toSubstate: unquote(match[6] as string),
+      triggerKind: match[7] as TriggerKind,
+      triggerCode: (match[8] as string).replace(/''/g, "'"),
+      status: match[9] as DdlTransition['status'],
+    });
+  }
+  return rows;
+}
+
+function ddlStates(): { code: string; sortOrder: number; terminal: boolean }[] {
+  const rows: { code: string; sortOrder: number; terminal: boolean }[] = [];
+  for (const line of insertBlock(
+    'inf.infraction_state_ref',
+    'ON CONFLICT (code)',
+  ).split('\n')) {
+    const match =
+      /^\s*\('([A-Z_0-9]+)',\s*(\d+),\s*'[^']*',\s*(true|false),/.exec(line);
+    if (!match) continue;
+    rows.push({
+      code: match[1] as string,
+      sortOrder: Number(match[2]),
+      terminal: match[3] === 'true',
+    });
+  }
+  return rows.sort((left, right) => left.sortOrder - right.sortOrder);
+}
+
+const DDL_TRANSITIONS = ddlTransitions();
+const DDL_STATES = ddlStates();
+
+// Gatilho verificável por `id`, transcrito de CTG-0001 §3 (colunas kind e
+// trigger_code) e §3.1 (guarda adicional). `qualifier` é o discriminante da
+// §6.1: decisionKind, instance, kind do aviso, `reconhecimento` e, nas duplas
+// 21/22, 23/24 e 34/35, o estado do prazo ('prazo_aberto' | 'prazo_vencido').
+// `state`/`substate` são os da própria linha; onde `from_state` é nulo a linha
+// casa qualquer estado (§3.1) e o teste usa o `to_state` como representante.
+const TRIGGER_BY_ID: Record<number, { qualifier?: string }> = {
+  1: {},
+  2: {},
+  3: {},
+  4: { qualifier: 'NA' },
+  5: {},
+  6: {},
+  7: { qualifier: 'defesa_previa' },
+  8: {},
+  9: { qualifier: 'acolhida' },
+  10: { qualifier: 'indeferida' },
+  11: {},
+  12: {},
+  13: { qualifier: 'NP' },
+  14: { qualifier: 'reconhecimento' },
+  15: {},
+  16: { qualifier: 'jari' },
+  17: {},
+  18: { qualifier: 'reconhecimento' },
+  19: {},
+  20: {},
+  21: { qualifier: 'prazo_aberto' },
+  22: { qualifier: 'prazo_vencido' },
+  23: { qualifier: 'prazo_aberto' },
+  24: { qualifier: 'prazo_vencido' },
+  25: { qualifier: 'provido' },
+  26: {},
+  27: {},
+  28: {},
+  29: {},
+  30: { qualifier: 'cetran' },
+  31: {},
+  32: {},
+  33: { qualifier: 'negado' },
+  34: { qualifier: 'prazo_aberto' },
+  35: { qualifier: 'prazo_vencido' },
+  36: { qualifier: 'provido' },
+  37: {},
+  38: {},
+  39: {},
+  40: {},
+  41: {},
+  42: {},
+  43: {},
+  44: {},
+  45: {},
+  46: {},
+};
+
+// O `trigger_code` da tabela carrega o qualificador entre parênteses e, em
+// algumas linhas, prosa da guarda ("na triagem", "(penalidade mantida)"): o
+// gatilho canônico é o token do evento/timer/ato, e o discriminante vai em
+// `qualifier` (§6.1).
+function canonicalCode(triggerCode: string): string {
+  const token = /^[A-Z0-9_-]+/.exec(triggerCode);
+  return token ? token[0] : triggerCode;
+}
+
+// Linhas como 10 e 34/35 listam gatilhos alternativos
+// ("RAIT_DECISAO_PUBLICADA(nao_conhecido) | ENCERRADO_DESISTENCIA"): todos são
+// modelados naquele estado e nenhum deles é um negativo.
+function modelledCodes(triggerCode: string): string[] {
+  const withoutQualifiers = triggerCode.replace(/\([^)]*\)/g, ' ');
+  return [...withoutQualifiers.matchAll(/[A-Z0-9][A-Z0-9_-]{2,}/g)].map(
+    (match) => match[0],
+  );
+}
+
+const currentOf = (row: DdlTransition) => ({
+  state: row.fromState ?? row.toState,
+  substate: row.fromSubstate,
+});
+const triggerOf = (row: DdlTransition) => ({
+  kind: row.triggerKind,
+  code: canonicalCode(row.triggerCode),
+  ...(TRIGGER_BY_ID[row.id]?.qualifier
+    ? { qualifier: TRIGGER_BY_ID[row.id]?.qualifier }
+    : {}),
+});
+
+const TERMINAL_STATES = DDL_STATES.filter((state) => state.terminal).map(
+  (state) => state.code,
+);
+const CLOSED_TRIGGERS = ['PAGAMENTO_CONFIRMADO', 'HANDOFF_DIVIDA_ATIVA'];
+const DISTINCT_TRIGGERS = [
+  ...new Map(
+    DDL_TRANSITIONS.map((row) => [
+      canonicalCode(row.triggerCode),
+      { kind: row.triggerKind, code: canonicalCode(row.triggerCode) },
+    ]),
+  ).values(),
+];
+
+// (estado, gatilho) já modelados por alguma linha — inclusive as linhas
+// `a_confirmar` (27, 38: o vencimento de T-PAR-3A é alerta do motor, §3.2) e a
+// linha `nao_modelada` 41, que têm desfecho próprio e não são negativos.
+const MODELLED = new Set(
+  DDL_TRANSITIONS.flatMap((row) => {
+    const states = row.fromState
+      ? [row.fromState]
+      : DDL_STATES.map((state) => state.code);
+    return states.flatMap((state) =>
+      modelledCodes(row.triggerCode).map((code) => `${state}|${code}`),
+    );
+  }),
+);
+
+describe('inf.infraction_transition_ref — matriz de transições', () => {
+  it('dado o bloco INSERT do DDL 14 quando comparado a INFRACTION_TRANSITIONS então são as mesmas 46 linhas com os mesmos ids', () => {
+    expect(DDL_TRANSITIONS).toHaveLength(46);
+    expect(INFRACTION_TRANSITIONS).toHaveLength(DDL_TRANSITIONS.length);
+    expect(INFRACTION_TRANSITIONS.map((row) => row.id)).toEqual(
+      DDL_TRANSITIONS.map((row) => row.id),
+    );
+    expect(
+      INFRACTION_TRANSITIONS.map((row) => ({
+        id: row.id,
+        ruleRef: row.ruleRef,
+        fromState: row.fromState,
+        fromSubstate: row.fromSubstate,
+        toState: row.toState,
+        toSubstate: row.toSubstate,
+        triggerKind: row.triggerKind,
+        triggerCode: row.triggerCode,
+        status: row.status,
+      })),
+    ).toEqual(
+      DDL_TRANSITIONS.map((row) => ({
+        id: row.id,
+        ruleRef: row.ruleRef,
+        fromState: row.fromState,
+        fromSubstate: row.fromSubstate,
+        toState: row.toState,
+        toSubstate: row.toSubstate,
+        triggerKind: row.triggerKind,
+        triggerCode: row.triggerCode,
+        status: row.status,
+      })),
+    );
+  });
+
+  describe('linhas vigentes — resolveTransition devolve a linha', () => {
+    for (const row of DDL_TRANSITIONS.filter(
+      (candidate) => candidate.status === 'vigente',
+    )) {
+      const current = currentOf(row);
+      it(`dado ${current.state}${current.substate ? `/${current.substate}` : ''} quando ${triggerOf(row).kind} ${triggerOf(row).code}${TRIGGER_BY_ID[row.id]?.qualifier ? `(${TRIGGER_BY_ID[row.id]?.qualifier})` : ''} então a transição ${row.id} leva a ${row.toState}${row.toSubstate ? `/${row.toSubstate}` : ''}`, () => {
+        const resolved = resolveTransition(current, triggerOf(row));
+
+        expect(resolved).not.toBeNull();
+        expect(resolved).toMatchObject({
+          id: row.id,
+          toState: row.toState,
+          toSubstate: row.toSubstate,
+        });
+        expect(assertTransition(current, triggerOf(row)).id).toBe(row.id);
+      });
+    }
+  });
+
+  describe('linhas a_confirmar — alerta, não transição (OD-301)', () => {
+    for (const row of DDL_TRANSITIONS.filter(
+      (candidate) => candidate.status === 'a_confirmar',
+    )) {
+      it(`dado ${row.fromState} quando o timer ${row.triggerCode} vence então a linha ${row.id} não transiciona (alerta; OD-301, CTG-0001 §3.2)`, () => {
+        expect(resolveTransition(currentOf(row), triggerOf(row))).toBeNull();
+        // A linha continua no espelho para a matriz ser auditável (§3.2).
+        expect(
+          INFRACTION_TRANSITIONS.find((entry) => entry.id === row.id)?.status,
+        ).toBe('a_confirmar');
+      });
+    }
+  });
+
+  it('dado INSTANCIA_ENCERRADA quando REVISAO_POS_ENCERRAMENTO (linha 41, nao_modelada) então RAIT.INFRACTION_CLOSED_NO_REVISION 409', () => {
+    const row = DDL_TRANSITIONS.find((candidate) => candidate.id === 41);
+    expect(row?.status).toBe('nao_modelada');
+
+    expect(
+      resolveTransition(
+        currentOf(row as DdlTransition),
+        triggerOf(row as DdlTransition),
+      ),
+    ).toBeNull();
+    expect(() =>
+      assertTransition(
+        currentOf(row as DdlTransition),
+        triggerOf(row as DdlTransition),
+      ),
+    ).toThrowError(
+      expect.objectContaining({
+        code: 'RAIT.INFRACTION_CLOSED_NO_REVISION',
+        status: 409,
+      }),
+    );
+  });
+
+  describe('negativos exaustivos — estado × gatilho sem linha correspondente', () => {
+    for (const state of DDL_STATES.filter((candidate) => !candidate.terminal)) {
+      const missing = DISTINCT_TRIGGERS.filter(
+        (trigger) => !MODELLED.has(`${state.code}|${trigger.code}`),
+      );
+      it(`dado ${state.code} quando um dos ${missing.length} gatilhos sem linha então RAIT.INFRACTION_STATE_INVALID 409`, () => {
+        expect(missing.length).toBeGreaterThan(0);
+        for (const trigger of missing) {
+          expect(() =>
+            assertTransition({ state: state.code, substate: null }, trigger),
+          ).toThrowError(
+            expect.objectContaining({
+              code: 'RAIT.INFRACTION_STATE_INVALID',
+              status: 409,
+            }),
+          );
+        }
+      });
+    }
+  });
+
+  describe('estados terminais — RAIT.INFRACTION_TERMINAL antes de qualquer gatilho (§4 precedência 1)', () => {
+    for (const state of TERMINAL_STATES.filter(
+      (code) => code !== 'INSTANCIA_ENCERRADA',
+    )) {
+      it(`dado ${state} (is_terminal=true) quando qualquer gatilho então RAIT.INFRACTION_TERMINAL 409`, () => {
+        for (const trigger of DISTINCT_TRIGGERS) {
+          expect(() =>
+            assertTransition({ state, substate: null }, trigger),
+          ).toThrowError(
+            expect.objectContaining({
+              code: 'RAIT.INFRACTION_TERMINAL',
+              status: 409,
+            }),
+          );
+        }
+      });
+    }
+
+    it('dado INSTANCIA_ENCERRADA quando gatilho fora de pagamento e cobrança então RAIT.INFRACTION_CLOSED_NO_REVISION 409 (§4 precedência 2)', () => {
+      const revisionTriggers = DISTINCT_TRIGGERS.filter(
+        (trigger) => !CLOSED_TRIGGERS.includes(trigger.code),
+      );
+      expect(revisionTriggers.length).toBeGreaterThan(0);
+      for (const trigger of revisionTriggers) {
+        expect(() =>
+          assertTransition(
+            { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
+            trigger,
+          ),
+        ).toThrowError(
+          expect.objectContaining({
+            code: 'RAIT.INFRACTION_CLOSED_NO_REVISION',
+            status: 409,
+          }),
+        );
+      }
+    });
+
+    it('dado INSTANCIA_ENCERRADA/PENDENTE_PAGAMENTO quando PAGAMENTO_CONFIRMADO ou HANDOFF_DIVIDA_ATIVA então as linhas 39 e 40 são admitidas', () => {
+      expect(
+        resolveTransition(
+          { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
+          { kind: 'evento', code: 'PAGAMENTO_CONFIRMADO' },
+        ),
+      ).toMatchObject({ id: 39, toSubstate: 'QUITADA' });
+      expect(
+        resolveTransition(
+          { state: 'INSTANCIA_ENCERRADA', substate: 'PENDENTE_PAGAMENTO' },
+          { kind: 'sistema', code: 'HANDOFF_DIVIDA_ATIVA' },
+        ),
+      ).toMatchObject({ id: 40, toSubstate: 'EM_COBRANCA' });
+    });
+  });
+});
diff --git a/backend/domains/inf/notification/src/handwritten/acknowledgement-mark.ts b/backend/domains/inf/notification/src/handwritten/acknowledgement-mark.ts
new file mode 100644
index 0000000..e18e024
--- /dev/null
+++ b/backend/domains/inf/notification/src/handwritten/acknowledgement-mark.ts
@@ -0,0 +1,131 @@
+// Marco de ciência por canal (RN-RAIT-104,
+// `inf.notification_channel_ref.ciencia_rule` de
+// backend/database/ddl/14-inf-lifecycle-vocabulary.sql;
+// work/rounds/R-0006/contracts/CTG-0001.md §6.2). A função não conta prazo por
+// conta própria: o número de dias e a unidade da ciência ficta do SNE vêm de
+// `T-SNE-CIENCIA` no catálogo de timers e a soma usa a aritmética de
+// `@detran/inf-deadlines` (rait-deadline-engine.md §1: é o único lugar do
+// sistema que sabe contar prazo).
+import { addCalendarDays, StaticTimerCatalog } from '@detran/inf-deadlines';
+import type { LocalDate } from '@detran/inf-deadlines';
+
+/** `inf.notification_channel_ref.code` (6 canais). */
+export type NoticeChannel =
+  'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
+
+/** `inf.notice_acknowledgement.evidence_kind` (M12, um por canal com marco). */
+export type AcknowledgementEvidenceKind =
+  | 'ar_postal'
+  | 'recibo_sne'
+  | 'publicacao_edital'
+  | 'assinatura'
+  | 'registro_balcao';
+
+export interface AcknowledgementMarks {
+  /** postal: entrega à ECT (Res. 918/2022 art. 30 I). */
+  dispatchedOn?: LocalDate;
+  /** sne: disponibilização (Res. 931/2022 art. 5º). */
+  availableOn?: LocalDate;
+  /** sne: leitura, quando houver. */
+  readOn?: LocalDate;
+  /** edital: publicação. */
+  publishedOn?: LocalDate;
+  /** pessoal: assinatura. */
+  signedOn?: LocalDate;
+  /** balcao: protocolo presencial. */
+  protocolledOn?: LocalDate;
+}
+
+export interface AcknowledgementMark {
+  /** `null` = o canal não conta prazo legal. */
+  effectiveOn: LocalDate | null;
+  fictitious: boolean;
+  evidenceKind: AcknowledgementEvidenceKind | null;
+  /** Base legal do marco (`notification_channel_ref.legal_basis`). */
+  basis: string;
+}
+
+/** `legal_basis` de `inf.notification_channel_ref`, por canal. */
+const CHANNEL_BASIS: Readonly<Record<NoticeChannel, string>> = {
+  sne: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
+  postal: 'CTB art. 282 §1º; Res. 918/2022 art. 4º',
+  pessoal: 'Res. 918/2022 art. 3º §5º',
+  edital: 'CTB art. 282 §1º; Res. 918/2022 art. 4º §3º',
+  portal: 'WF-PORTAL-001',
+  balcao: 'Res. 900/2022 art. 6º',
+};
+
+const CATALOG = new StaticTimerCatalog();
+
+/** Ciência ficta do SNE: `availableOn` + `T-SNE-CIENCIA` (30 dias corridos). */
+function fictitiousSneMark(availableOn: LocalDate): LocalDate {
+  const definition = CATALOG.get('T-SNE-CIENCIA');
+  return addCalendarDays(availableOn, definition.durationValue ?? 0);
+}
+
+function markOf(
+  channel: NoticeChannel,
+  marks: AcknowledgementMarks,
+): Pick<AcknowledgementMark, 'effectiveOn' | 'fictitious' | 'evidenceKind'> {
+  switch (channel) {
+    // Expedição = data de postagem.
+    case 'postal':
+      return {
+        effectiveOn: marks.dispatchedOn ?? null,
+        fictitious: false,
+        evidenceKind: 'ar_postal',
+      };
+    // Leitura ou ficta em 30 dias da disponibilização, o que vier antes.
+    case 'sne': {
+      const ficta = marks.availableOn
+        ? fictitiousSneMark(marks.availableOn)
+        : null;
+      if (marks.readOn && (!ficta || marks.readOn <= ficta)) {
+        return {
+          effectiveOn: marks.readOn,
+          fictitious: false,
+          evidenceKind: 'recibo_sne',
+        };
+      }
+      return {
+        effectiveOn: ficta,
+        fictitious: ficta !== null,
+        evidenceKind: 'recibo_sne',
+      };
+    }
+    case 'edital':
+      return {
+        effectiveOn: marks.publishedOn ?? null,
+        fictitious: false,
+        evidenceKind: 'publicacao_edital',
+      };
+    // AIT assinado vale como NA (Res. 918/2022 art. 3º §5º).
+    case 'pessoal':
+      return {
+        effectiveOn: marks.signedOn ?? null,
+        fictitious: false,
+        evidenceKind: 'assinatura',
+      };
+    case 'balcao':
+      return {
+        effectiveOn: marks.protocolledOn ?? null,
+        fictitious: false,
+        evidenceKind: 'registro_balcao',
+      };
+    // O Portal não substitui SNE/postal para o prazo legal (RN-RAIT-104).
+    case 'portal':
+      return { effectiveOn: null, fictitious: false, evidenceKind: null };
+  }
+}
+
+/**
+ * Marco de ciência de um aviso, por canal. Devolve o marco e a prova; quem
+ * arma o timer a partir dele é o comando de expedição, sempre pelo
+ * `DeadlineEngine` (CTG-0001 §6.2).
+ */
+export function acknowledgementMark(
+  channel: NoticeChannel,
+  marks: AcknowledgementMarks,
+): AcknowledgementMark {
+  return { ...markOf(channel, marks), basis: CHANNEL_BASIS[channel] };
+}
diff --git a/backend/domains/inf/notification/src/handwritten/index.ts b/backend/domains/inf/notification/src/handwritten/index.ts
new file mode 100644
index 0000000..1e4d0cc
--- /dev/null
+++ b/backend/domains/inf/notification/src/handwritten/index.ts
@@ -0,0 +1,11 @@
+// API pública manuscrita de @detran/inf-notification
+// (work/rounds/R-0006/contracts/CTG-0001.md §6.2), reexportada pelo `src/index.ts`
+// gerado via `module.handwrittenExports` do BP-INF-NOTIFICATION-001 (ADR-0007).
+// Nesta rodada só a regra de ciência: nenhuma rota, nenhum acesso a banco.
+export { acknowledgementMark } from './acknowledgement-mark.js';
+export type {
+  AcknowledgementEvidenceKind,
+  AcknowledgementMark,
+  AcknowledgementMarks,
+  NoticeChannel,
+} from './acknowledgement-mark.js';
diff --git a/backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts b/backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts
new file mode 100644
index 0000000..72a0ab4
--- /dev/null
+++ b/backend/domains/inf/notification/tests/integration/notification-db.integration.spec.ts
@@ -0,0 +1,219 @@
+// Contrato de banco do módulo de notificação (backend/database/ddl/59-inf-notification.sql):
+// RLS forçada e gatilho enforce_tenant_id em todas as tabelas de tenant, leitura
+// cruzada entre tenants vazia (rait-test-strategy.md §4), check da data-limite
+// impressa da NA/NP (RN-RAIT-101/102), unicidade de uma ciência por aviso e
+// presença das fixtures de backend/database/seed/30-fixtures-infraction.sql (§7.3).
+import { randomUUID } from 'node:crypto';
+import pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+const { Client } = pg;
+const client = new Client({
+  connectionString:
+    process.env.DETRAN_TEST_DATABASE_URL ??
+    'postgresql://postgres:postgres@localhost:5432/detran',
+});
+
+const TENANT = '00000000-0000-7000-8000-00000000a001';
+// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7).
+const OTHER_TENANT = randomUUID();
+const TENANT_TABLES = [
+  'notice',
+  'notice_acknowledgement',
+  'notice_delivery_attempt',
+];
+const INFRACTION_0002 = '00000000-0000-7000-8000-0000d0000002';
+const NOTICE_0001 = '00000000-0000-7000-8000-0000d3000001';
+
+async function asOwner<T>(work: () => Promise<T>): Promise<T> {
+  await client.query('begin');
+  try {
+    await client.query(`select set_config('app.role', 'owner', true)`);
+    await client.query(`select set_config('app.tenant_id', $1, true)`, [
+      TENANT,
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
+const count = async (sql: string, params: unknown[] = []) => {
+  const result = await client.query<{ count: string }>(sql, params);
+  return Number(result.rows[0]?.count ?? -1);
+};
+
+describe('inf.notice — contrato de banco (DDL 59)', () => {
+  beforeAll(() => client.connect());
+  afterAll(async () => {
+    await client.query('reset role');
+    await client.end();
+  });
+
+  it('dadas as tabelas de tenant do DDL 59 quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
+    const result = await client.query<{
+      table_name: string;
+      relrowsecurity: boolean;
+      relforcerowsecurity: boolean;
+      policy_count: string;
+      trigger_count: string;
+    }>(
+      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
+              count(distinct policies.policyname)::text as policy_count,
+              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
+         from pg_class classes
+         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
+         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
+         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
+        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
+        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
+        order by classes.relname`,
+      [TENANT_TABLES],
+    );
+
+    expect(result.rows.map((row) => row.table_name)).toEqual(
+      [...TENANT_TABLES].sort(),
+    );
+    for (const row of result.rows) {
+      expect(row.relrowsecurity).toBe(true);
+      expect(row.relforcerowsecurity).toBe(true);
+      expect(row.policy_count).toBe('1');
+      expect(row.trigger_count).toBe('1');
+    }
+  });
+
+  it('dados os avisos do tenant am-fixtures quando lidos por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
+    const mine = await asTenant(TENANT, () =>
+      count('select count(*)::text as count from inf.notice'),
+    );
+    expect(mine).toBe(19);
+
+    for (const table of TENANT_TABLES) {
+      const theirs = await asTenant(OTHER_TENANT, () =>
+        count(`select count(*)::text as count from inf.${table}`),
+      );
+      expect(theirs).toBe(0);
+    }
+  });
+
+  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, printed_deadline_on, status)
+           values ($1, $2, 'NA', 'proprietario', 'postal', '2026-09-01T12:00:00-04:00', '2026-10-15', 'eficaz')`,
+          [TENANT, INFRACTION_0002],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.notice_acknowledgement (tenant_id, notice_id, effective_on, fictitious, evidence_kind, registered_at)
+           values ($1, $2, '2026-09-01', false, 'ar_postal', '2026-09-01T12:00:00-04:00')`,
+          [TENANT, NOTICE_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+
+    await expect(
+      asTenant(OTHER_TENANT, () =>
+        client.query(
+          `insert into inf.notice_delivery_attempt (tenant_id, notice_id, channel, attempted_at, outcome)
+           values ($1, $2, 'postal', '2026-09-01T12:00:00-04:00', 'entregue')`,
+          [TENANT, NOTICE_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '42501' });
+  });
+
+  it('dada uma NA expedida sem data-limite impressa quando inserida então ck_inf_notice_printed_deadline_required rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, status)
+           values ($1, $2, 'NA', 'proprietario', 'postal', '2026-09-01T12:00:00-04:00', 'expedida')`,
+          [TENANT, INFRACTION_0002],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23514' });
+  });
+
+  it('dado um canal fora de notification_channel_ref quando o aviso é inserido então a integridade do catálogo de canais rejeita', async () => {
+    const constraint = await client.query<{ conname: string }>(
+      `select conname from pg_constraint
+        where conrelid = 'inf.notice'::regclass
+          and conname = 'fk_inf_notice_channel'`,
+    );
+    expect(constraint.rows).toHaveLength(1);
+
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, printed_deadline_on, status)
+           values ($1, $2, 'NA', 'proprietario', 'telegrama', '2026-09-01T12:00:00-04:00', '2026-10-15', 'eficaz')`,
+          [TENANT, INFRACTION_0002],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
+  });
+
+  it('dado um aviso que já tem ciência quando uma segunda ciência é inserida então ux_inf_notice_acknowledgement_notice rejeita', async () => {
+    await expect(
+      asOwner(() =>
+        client.query(
+          `insert into inf.notice_acknowledgement (tenant_id, notice_id, effective_on, fictitious, evidence_kind, registered_at)
+           values ($1, $2, '2026-09-01', false, 'ar_postal', '2026-09-01T12:00:00-04:00')`,
+          [TENANT, NOTICE_0001],
+        ),
+      ),
+    ).rejects.toMatchObject({ code: '23505' });
+  });
+
+  it('dadas as fixtures 30-fixtures-infraction.sql quando contadas então há 19 avisos NA/NP postais eficazes, 19 ciências por AR e 19 tentativas entregues', async () => {
+    expect(
+      await count(
+        `select count(*)::text as count from inf.notice where tenant_id = $1 and channel = 'postal' and status = 'eficaz' and kind in ('NA','NP')`,
+        [TENANT],
+      ),
+    ).toBe(19);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.notice_acknowledgement where tenant_id = $1 and fictitious = false and evidence_kind = 'ar_postal'`,
+        [TENANT],
+      ),
+    ).toBe(19);
+    expect(
+      await count(
+        `select count(*)::text as count from inf.notice_delivery_attempt where tenant_id = $1 and outcome = 'entregue'`,
+        [TENANT],
+      ),
+    ).toBe(19);
+
+    // Todo aviso NA/NP eficaz carrega a data-limite impressa e o marco postal.
+    expect(
+      await count(
+        `select count(*)::text as count from inf.notice
+          where tenant_id = $1 and (printed_deadline_on is null or dispatched_on is null)`,
+        [TENANT],
+      ),
+    ).toBe(0);
+  });
+});
diff --git a/backend/domains/inf/notification/tests/unit/acknowledgement-mark.spec.ts b/backend/domains/inf/notification/tests/unit/acknowledgement-mark.spec.ts
new file mode 100644
index 0000000..6055958
--- /dev/null
+++ b/backend/domains/inf/notification/tests/unit/acknowledgement-mark.spec.ts
@@ -0,0 +1,75 @@
+// Marco de ciência por canal (RN-RAIT-104, inf.notification_channel_ref.ciencia_rule;
+// work/rounds/R-0006/contracts/CTG-0001.md §6.2). Relógio das fixtures: hoje =
+// 2026-09-14, fuso America/Manaus (rait-test-strategy.md §6); a função é pura e
+// não consulta relógio — recebe os marcos e devolve o marco de ciência.
+import { describe, expect, it } from 'vitest';
+
+import { acknowledgementMark } from '../../src/handwritten/index.js';
+
+describe('acknowledgementMark — marco de ciência por canal (RN-RAIT-104)', () => {
+  it('dado o canal postal quando a NA é expedida em 2026-09-14 então o marco é a expedição com AR postal e sem ficção', () => {
+    const mark = acknowledgementMark('postal', { dispatchedOn: '2026-09-14' });
+
+    expect(mark.effectiveOn).toBe('2026-09-14');
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBe('ar_postal');
+    expect(mark.basis.length).toBeGreaterThan(0);
+  });
+
+  it('dado o canal sne disponibilizado em 2026-09-14 sem leitura quando o marco é calculado então a ciência é ficta em 2026-10-14 (caso 7 do §7)', () => {
+    const mark = acknowledgementMark('sne', { availableOn: '2026-09-14' });
+
+    // disponibilização + 30 dias corridos (T-SNE-CIENCIA); 2026-10-14 é dia útil.
+    expect(mark.effectiveOn).toBe('2026-10-14');
+    expect(mark.fictitious).toBe(true);
+    expect(mark.evidenceKind).toBe('recibo_sne');
+  });
+
+  it('dado o canal sne disponibilizado em 2026-09-14 e lido em 2026-09-20 quando o marco é calculado então a ciência é a leitura (caso 8 do §7)', () => {
+    const mark = acknowledgementMark('sne', {
+      availableOn: '2026-09-14',
+      readOn: '2026-09-20',
+    });
+
+    // min(leitura, disponibilização + 30): a leitura vem antes da ficta.
+    expect(mark.effectiveOn).toBe('2026-09-20');
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBe('recibo_sne');
+  });
+
+  it('dado o canal edital quando o edital é publicado em 2026-09-14 então o marco é a publicação', () => {
+    const mark = acknowledgementMark('edital', { publishedOn: '2026-09-14' });
+
+    expect(mark.effectiveOn).toBe('2026-09-14');
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBe('publicacao_edital');
+  });
+
+  it('dado o canal pessoal quando a entrega é assinada em 2026-09-14 então o marco é a assinatura', () => {
+    const mark = acknowledgementMark('pessoal', { signedOn: '2026-09-14' });
+
+    expect(mark.effectiveOn).toBe('2026-09-14');
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBe('assinatura');
+  });
+
+  it('dado o canal balcao quando a ciência é protocolada em 2026-09-14 então o marco é o protocolo de balcão', () => {
+    const mark = acknowledgementMark('balcao', {
+      protocolledOn: '2026-09-14',
+    });
+
+    expect(mark.effectiveOn).toBe('2026-09-14');
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBe('registro_balcao');
+  });
+
+  it('dado o canal portal quando a notificação é disponibilizada então não há marco de prazo legal', () => {
+    const mark = acknowledgementMark('portal', {
+      availableOn: '2026-09-14',
+    });
+
+    expect(mark.effectiveOn).toBeNull();
+    expect(mark.fictitious).toBe(false);
+    expect(mark.evidenceKind).toBeNull();
+  });
+});
diff --git a/docs/framework/blueprints/BP-INF-INFRACTION-001.json b/docs/framework/blueprints/BP-INF-INFRACTION-001.json
new file mode 100644
index 0000000..29d2f17
--- /dev/null
+++ b/docs/framework/blueprints/BP-INF-INFRACTION-001.json
@@ -0,0 +1,572 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-INF-INFRACTION-001",
+  "module": {
+    "name": "Infraction",
+    "namespace": "inf",
+    "version": "1.1.0",
+    "ddlFile": "38-inf-infraction.sql",
+    "dependencies": {
+      "@detran/inf-ait": "workspace:*",
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
+        "package": "@detran/inf-ait",
+        "target": "../ait/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenExports": ["handwritten/index"],
+    "owners": ["detran-inf"],
+    "description": "Agregado da infracao (ADR-0016 Decision 1; [WF-INF-003] secoes 1-6): unico escritor de state/substate, sujeito passivo, efeito suspensivo, pagamento, pontuacao e motivo de encerramento, dos relogios legais (secao 3) e da trilha de eventos (secao 6). O vocabulario canonico (15 estados, 12 sub-estados, 46 transicoes, 18 timers) vive em 14-inf-lifecycle-vocabulary.sql e e referenciado por FK."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "Infraction",
+        "table": "infraction",
+        "primaryKey": ["id"],
+        "description": "Agregado da infracao — unico escritor do estado legal (ADR-0016 Decision 1; [WF-INF-003] secao 1 estados, secao 4 atributos ortogonais, secao 5 invariantes). Uma infracao por AIT integrado; state e substate por FK ao vocabulario de 14-inf-lifecycle-vocabulary.sql.",
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
+            "name": "state",
+            "type": "varchar(40)",
+            "default": "'AIT_LAVRADO'"
+          },
+          {
+            "name": "substate",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "subject_kind",
+            "type": "varchar(40)",
+            "default": "'proprietario'"
+          },
+          {
+            "name": "suspensive_effect",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "paid",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "payment_tier",
+            "type": "varchar(40)",
+            "default": "'nenhum'"
+          },
+          {
+            "name": "points_registered",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "closure_motive",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "risk_flag",
+            "type": "varchar(30)",
+            "default": "'SEM_RISCO'"
+          },
+          {
+            "name": "committed_on",
+            "type": "date"
+          },
+          {
+            "name": "flagrant",
+            "type": "boolean"
+          },
+          {
+            "name": "known_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "state_changed_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "last_transition_id",
+            "type": "smallint",
+            "nullable": true
+          },
+          {
+            "name": "version",
+            "type": "integer",
+            "default": "1"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_inf_infraction_ait",
+            "columns": ["tenant_id", "ait_id"],
+            "unique": true
+          },
+          {
+            "name": "ix_inf_infraction_state",
+            "columns": ["tenant_id", "state", "substate"]
+          },
+          {
+            "name": "ix_inf_infraction_risk_flag",
+            "columns": ["tenant_id", "risk_flag"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_infraction_state",
+            "expression": "state in ('AIT_LAVRADO','NOTIFICADO_AUTUACAO','DEFESA_EM_JULGAMENTO','PENALIDADE_A_APLICAR','NOTIFICADO_PENALIDADE','RECURSO_1A_INSTANCIA','AGUARDANDO_RECURSO_2A','RECURSO_2A_INSTANCIA','INSTANCIA_ENCERRADA','ARQUIVADO','CANCELADO_POS_INTEGRACAO','AIT_CANCELADO','EXTINTO_DECADENCIA','EXTINTO_PRESCRICAO','CANCELADO_DEFINITIVO')"
+          },
+          {
+            "name": "ck_inf_infraction_substate",
+            "expression": "substate is null or substate in ('PRAZO_DEFESA_ABERTO','INDICACAO_EM_PROCESSAMENTO','EM_ADMISSIBILIDADE_1A','EM_REMESSA_JARI','EM_JULGAMENTO_JARI','PROVIDO_1A','NEGADO_1A','EM_ADMISSIBILIDADE_2A','EM_JULGAMENTO_CETRAN','PENDENTE_PAGAMENTO','QUITADA','EM_COBRANCA')"
+          },
+          {
+            "name": "ck_inf_infraction_subject_kind",
+            "expression": "subject_kind in ('proprietario','principal_condutor','condutor_identificado','possuidor_equiparado','embarcador','transportador')"
+          },
+          {
+            "name": "ck_inf_infraction_payment_tier",
+            "expression": "payment_tier in ('nenhum','desconto_80','desconto_60_reconhecimento','desconto_40_fora_sne','integral_juros','restituido')"
+          },
+          {
+            "name": "ck_inf_infraction_closure_motive",
+            "expression": "closure_motive is null or closure_motive in ('nao_interposicao_1a','nao_interposicao_2a','julgamento_2a','reconhecimento','desistencia','nao_conhecimento_intempestivo','na_nao_expedida','insubsistente')"
+          },
+          {
+            "name": "ck_inf_infraction_risk_flag",
+            "expression": "risk_flag in ('SEM_RISCO','ALERTA_N1','ALERTA_N2','ALERTA_N3','CRITICO','PRESCRITO_OPERACIONAL')"
+          },
+          {
+            "name": "ck_inf_infraction_suspensive_effect_instance",
+            "expression": "suspensive_effect = false or state in ('RECURSO_1A_INSTANCIA','RECURSO_2A_INSTANCIA')"
+          },
+          {
+            "name": "ck_inf_infraction_points_only_closed",
+            "expression": "points_registered = false or state = 'INSTANCIA_ENCERRADA'"
+          },
+          {
+            "name": "ck_inf_infraction_closure_motive_state",
+            "expression": "closure_motive is null or state in ('INSTANCIA_ENCERRADA','ARQUIVADO')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_infraction_ait",
+            "columns": ["ait_id"],
+            "references": {
+              "table": "inf.ait_ait",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_state",
+            "columns": ["state"],
+            "references": {
+              "table": "inf.infraction_state_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_substate",
+            "columns": ["substate"],
+            "references": {
+              "table": "inf.infraction_substate_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_subject_kind",
+            "columns": ["subject_kind"],
+            "references": {
+              "table": "inf.infraction_subject_kind_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_payment_tier",
+            "columns": ["payment_tier"],
+            "references": {
+              "table": "inf.infraction_payment_tier_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_closure_motive",
+            "columns": ["closure_motive"],
+            "references": {
+              "table": "inf.infraction_closure_motive_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_last_transition",
+            "columns": ["last_transition_id"],
+            "references": {
+              "table": "inf.infraction_transition_ref",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "InfractionTimer",
+        "table": "infraction_timer",
+        "primaryKey": ["id"],
+        "description": "Relogio legal da infracao ([WF-INF-003] secao 3; [WF-INF-002] secao 9.2). due_on ja vem prorrogado ao 1o dia util e nunca antecipa (rait-deadline-engine secao 2). Um relogio T-JUL-24M por instance (jari|cetran). suspended_by_act_id referencia inf.rait_suspension_act (DDL 39) sem FK — ordem lexicografica de apply.sh, como rait_deadline.",
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
+            "name": "infraction_id",
+            "type": "uuid"
+          },
+          {
+            "name": "timer_code",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "instance",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "start_basis",
+            "type": "text"
+          },
+          {
+            "name": "started_on",
+            "type": "date"
+          },
+          {
+            "name": "raw_due_on",
+            "type": "date"
+          },
+          {
+            "name": "due_on",
+            "type": "date"
+          },
+          {
+            "name": "ceiling_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "business_days",
+            "type": "boolean",
+            "default": "false"
+          },
+          {
+            "name": "status",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "satisfied_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "expired_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "cancel_reason",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "suspended_by_act_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "suspended_days",
+            "type": "integer",
+            "default": "0"
+          },
+          {
+            "name": "extension_count",
+            "type": "integer",
+            "default": "0"
+          },
+          {
+            "name": "legal_basis",
+            "type": "text"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_inf_infraction_timer_arm",
+            "columns": [
+              "tenant_id",
+              "infraction_id",
+              "timer_code",
+              "started_on"
+            ],
+            "unique": true
+          },
+          {
+            "name": "ix_inf_infraction_timer_due",
+            "columns": ["tenant_id", "due_on"],
+            "where": "status = 'armado'"
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_infraction_timer_code",
+            "expression": "timer_code in ('T-NA','T-SNE-CIENCIA','T-DEF','T-IND','T-NA-IND','T-DEC','T-NP-VENC','T-REM10','T-JUL-24M','T-DIL','T-R2','T-PAR-3A','T-PRESC-5A','T-VOTO','T-CONV','T-ASS','T-CLAIM','SLA-30')"
+          },
+          {
+            "name": "ck_inf_infraction_timer_instance",
+            "expression": "instance is null or instance in ('jari','cetran')"
+          },
+          {
+            "name": "ck_inf_infraction_timer_status",
+            "expression": "status in ('armado','satisfeito','cancelado','vencido')"
+          },
+          {
+            "name": "ck_inf_infraction_timer_rounding_forward",
+            "expression": "due_on >= raw_due_on"
+          },
+          {
+            "name": "ck_inf_infraction_timer_due_not_before_start",
+            "expression": "due_on >= started_on"
+          },
+          {
+            "name": "ck_inf_infraction_timer_single_extension",
+            "expression": "extension_count <= 1"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_infraction_timer_infraction",
+            "columns": ["infraction_id"],
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_timer_code",
+            "columns": ["timer_code"],
+            "references": {
+              "table": "inf.infraction_timer_ref",
+              "columns": ["code"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "InfractionEvent",
+        "table": "infraction_event",
+        "primaryKey": ["id"],
+        "description": "Trilha append-only de transicoes e eventos publicados ([WF-INF-003] secao 6; rait-events-sse-contract secao 2.4). Nunca atualizada: updated_at existe por construcao do gerador e nao tem semantica. transition_id/rule_ref ligam a linha a inf.infraction_transition_ref; outbox_id liga ao envelope da integration.outbox.",
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
+            "name": "infraction_id",
+            "type": "uuid"
+          },
+          {
+            "name": "transition_id",
+            "type": "smallint",
+            "nullable": true
+          },
+          {
+            "name": "rule_ref",
+            "type": "smallint",
+            "nullable": true
+          },
+          {
+            "name": "from_state",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "to_state",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "from_substate",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "to_substate",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "trigger_kind",
+            "type": "varchar(10)"
+          },
+          {
+            "name": "trigger_code",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "event_code",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "occurred_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "actor_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "actor_kind",
+            "type": "varchar(10)"
+          },
+          {
+            "name": "payload",
+            "type": "jsonb"
+          },
+          {
+            "name": "outbox_id",
+            "type": "uuid",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_inf_infraction_event_infraction",
+            "columns": ["tenant_id", "infraction_id", "occurred_at"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_infraction_event_trigger_kind",
+            "expression": "trigger_kind in ('evento','timer','ato','sistema')"
+          },
+          {
+            "name": "ck_inf_infraction_event_actor_kind",
+            "expression": "actor_kind in ('user','system')"
+          },
+          {
+            "name": "ck_inf_infraction_event_code",
+            "expression": "event_code in ('INFRACAO_ESTADO_ALTERADO','PENALIDADE_DEFINITIVA','RESTITUICAO_DEVIDA','TIMER_VENCIDO','RISCO_PRESCRICAO_ALTERADO')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_infraction_event_infraction",
+            "columns": ["infraction_id"],
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_event_transition",
+            "columns": ["transition_id"],
+            "references": {
+              "table": "inf.infraction_transition_ref",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_event_from_state",
+            "columns": ["from_state"],
+            "references": {
+              "table": "inf.infraction_state_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_event_to_state",
+            "columns": ["to_state"],
+            "references": {
+              "table": "inf.infraction_state_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_infraction_event_code",
+            "columns": ["event_code"],
+            "references": {
+              "table": "inf.infraction_event_ref",
+              "columns": ["code"]
+            }
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/inf/infraction/",
+    "resources": [
+      {
+        "entity": "Infraction",
+        "path": "infractions",
+        "resource": "infraction"
+      },
+      {
+        "entity": "InfractionTimer",
+        "path": "timers",
+        "resource": "infraction-timer"
+      },
+      {
+        "entity": "InfractionEvent",
+        "path": "events",
+        "resource": "infraction-event"
+      }
+    ]
+  },
+  "auth": {
+    "source": "RAIT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/blueprints/BP-INF-NOTIFICATION-001.json b/docs/framework/blueprints/BP-INF-NOTIFICATION-001.json
new file mode 100644
index 0000000..859089d
--- /dev/null
+++ b/docs/framework/blueprints/BP-INF-NOTIFICATION-001.json
@@ -0,0 +1,355 @@
+{
+  "schemaVersion": "1.0.0",
+  "id": "BP-INF-NOTIFICATION-001",
+  "module": {
+    "name": "Notification",
+    "namespace": "inf",
+    "version": "1.1.0",
+    "ddlFile": "59-inf-notification.sql",
+    "dependencies": {
+      "@detran/inf-infraction": "workspace:*",
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
+        "package": "@detran/inf-infraction",
+        "target": "../infraction/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenExports": ["handwritten/index"],
+    "owners": ["detran-inf"],
+    "description": "Modulo de notificacao (ADR-0016 Decision 1 e 3; [WF-INF-002] secao 2 P2 Notificar): unico escritor de avisos (NA, NP, decisao, diligencia, edital), da ciencia efetiva ou ficta e das tentativas de entrega. Publica NOTIFICACAO_EXPEDIDA e NOTIFICACAO_CIENCIA; nunca decide nada sobre a infracao. Marco por canal em inf.notification_channel_ref ([RN-RAIT-104])."
+  },
+  "database": {
+    "entities": [
+      {
+        "name": "Notice",
+        "table": "notice",
+        "primaryKey": ["id"],
+        "description": "Aviso expedido pelo orgao — NA, NP, decisao, diligencia ou edital (ADR-0016 Decision 1; [WF-INF-002] secao 2 P2 Notificar). Dois marcos sempre separados: expedicao (dispatched_at/dispatched_on, prazo do orgao) e ciencia (inf.notice_acknowledgement, prazo do administrado). case_id referencia inf.rait_case sem FK — outro modulo. addressee_ref e referencia opaca, sem PII.",
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
+            "name": "infraction_id",
+            "type": "uuid"
+          },
+          {
+            "name": "case_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "kind",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "addressee_kind",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "addressee_ref",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "channel",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "issued_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "dispatched_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "dispatched_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "printed_deadline_on",
+            "type": "date",
+            "nullable": true
+          },
+          {
+            "name": "document_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "supersedes_notice_id",
+            "type": "uuid",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_inf_notice_infraction",
+            "columns": ["tenant_id", "infraction_id", "kind", "issued_at"]
+          },
+          {
+            "name": "ix_inf_notice_status",
+            "columns": ["tenant_id", "status"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_notice_kind",
+            "expression": "kind in ('NA','NP','DECISAO','DILIGENCIA','EDITAL')"
+          },
+          {
+            "name": "ck_inf_notice_addressee_kind",
+            "expression": "addressee_kind in ('proprietario','principal_condutor','condutor_identificado','possuidor_equiparado','embarcador','transportador')"
+          },
+          {
+            "name": "ck_inf_notice_channel",
+            "expression": "channel in ('sne','postal','pessoal','edital','portal','balcao')"
+          },
+          {
+            "name": "ck_inf_notice_status",
+            "expression": "status in ('solicitada','expedida','publicada','devolvida','falha','eficaz')"
+          },
+          {
+            "name": "ck_inf_notice_printed_deadline_required",
+            "expression": "kind not in ('NA','NP') or status = 'solicitada' or printed_deadline_on is not null"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_notice_infraction",
+            "columns": ["infraction_id"],
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_notice_addressee_kind",
+            "columns": ["addressee_kind"],
+            "references": {
+              "table": "inf.infraction_subject_kind_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_notice_channel",
+            "columns": ["channel"],
+            "references": {
+              "table": "inf.notification_channel_ref",
+              "columns": ["code"]
+            }
+          },
+          {
+            "name": "fk_inf_notice_supersedes",
+            "columns": ["supersedes_notice_id"],
+            "references": {
+              "table": "inf.notice",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "NoticeAcknowledgement",
+        "table": "notice_acknowledgement",
+        "primaryKey": ["id"],
+        "description": "Ciencia efetiva ou ficta de um aviso (ADR-0016 Decision 1; [RN-RAIT-104]; inf.notification_channel_ref). Uma por aviso: effective_on e o marco a partir do qual correm os prazos do administrado (T-DEF, T-NP-VENC). fictitious=true no SNE quando vale a disponibilizacao + 30 dias (T-SNE-CIENCIA).",
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
+            "name": "notice_id",
+            "type": "uuid"
+          },
+          {
+            "name": "effective_on",
+            "type": "date"
+          },
+          {
+            "name": "fictitious",
+            "type": "boolean"
+          },
+          {
+            "name": "evidence_kind",
+            "type": "varchar(30)"
+          },
+          {
+            "name": "evidence_ref",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "registered_at",
+            "type": "timestamptz"
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ux_inf_notice_acknowledgement_notice",
+            "columns": ["tenant_id", "notice_id"],
+            "unique": true
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_notice_acknowledgement_evidence_kind",
+            "expression": "evidence_kind in ('ar_postal','recibo_sne','publicacao_edital','assinatura','registro_balcao')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_notice_acknowledgement_notice",
+            "columns": ["notice_id"],
+            "references": {
+              "table": "inf.notice",
+              "columns": ["id"]
+            }
+          }
+        ]
+      },
+      {
+        "name": "NoticeDeliveryAttempt",
+        "table": "notice_delivery_attempt",
+        "primaryKey": ["id"],
+        "description": "Tentativa de entrega de um aviso por canal (ADR-0016 Decision 1 e 3; [WF-INF-002] secao 2: retorno da remessa entregue | devolvida | falha). Refazimento do ato gera novo aviso com supersedes_notice_id, nunca reescreve a tentativa. outbox_id liga a entrega ao envelope da integration.outbox.",
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
+            "name": "notice_id",
+            "type": "uuid"
+          },
+          {
+            "name": "channel",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "attempted_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "outcome",
+            "type": "varchar(20)"
+          },
+          {
+            "name": "provider_ref",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "error_code",
+            "type": "varchar(60)",
+            "nullable": true
+          },
+          {
+            "name": "outbox_id",
+            "type": "uuid",
+            "nullable": true
+          }
+        ],
+        "indexes": [
+          {
+            "name": "ix_inf_notice_delivery_attempt_notice",
+            "columns": ["tenant_id", "notice_id", "attempted_at"]
+          }
+        ],
+        "checks": [
+          {
+            "name": "ck_inf_notice_delivery_attempt_channel",
+            "expression": "channel in ('sne','postal','pessoal','edital','portal','balcao')"
+          },
+          {
+            "name": "ck_inf_notice_delivery_attempt_outcome",
+            "expression": "outcome in ('entregue','devolvida','falha')"
+          }
+        ],
+        "foreignKeys": [
+          {
+            "name": "fk_inf_notice_delivery_attempt_notice",
+            "columns": ["notice_id"],
+            "references": {
+              "table": "inf.notice",
+              "columns": ["id"]
+            }
+          },
+          {
+            "name": "fk_inf_notice_delivery_attempt_channel",
+            "columns": ["channel"],
+            "references": {
+              "table": "inf.notification_channel_ref",
+              "columns": ["code"]
+            }
+          }
+        ]
+      }
+    ]
+  },
+  "api": {
+    "basePath": "/v1/inf/notification/",
+    "resources": [
+      {
+        "entity": "Notice",
+        "path": "notices",
+        "resource": "notice"
+      },
+      {
+        "entity": "NoticeAcknowledgement",
+        "path": "acknowledgements",
+        "resource": "notice-acknowledgement"
+      },
+      {
+        "entity": "NoticeDeliveryAttempt",
+        "path": "delivery-attempts",
+        "resource": "notice-delivery-attempt"
+      }
+    ]
+  },
+  "auth": {
+    "source": "RAIT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
+}
diff --git a/docs/framework/schemas/README.md b/docs/framework/schemas/README.md
index c0bf48c..00117e8 100644
--- a/docs/framework/schemas/README.md
+++ b/docs/framework/schemas/README.md
@@ -2,3 +2,6 @@

 Stub — JSON Schemas and machine-readable contracts land here as domains are
 ported (blueprint schemas, invariant records, policy matrix schema).
+
+`events/` holds one JSON Schema (draft 2020-12) per published domain event, named
+`<type>.schema.json` after the `type` column of `rait-events-sse-contract.md` §2.4.
diff --git a/docs/framework/schemas/events/inf.infraction.changed.schema.json b/docs/framework/schemas/events/inf.infraction.changed.schema.json
new file mode 100644
index 0000000..7889342
--- /dev/null
+++ b/docs/framework/schemas/events/inf.infraction.changed.schema.json
@@ -0,0 +1,199 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/events/inf.infraction.changed.schema.json",
+  "title": "inf.infraction.changed",
+  "description": "Transicao de estado do agregado da infracao — publicado a cada transicao ([WF-INF-003] secao 6; rait-events-sse-contract secao 2.4). Consumidores: portal, dashboard, senatran-adapter (RENAINF).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "id",
+    "type",
+    "domainEvent",
+    "version",
+    "occurredAt",
+    "tenantId",
+    "actor",
+    "correlationId",
+    "aggregate",
+    "data"
+  ],
+  "properties": {
+    "id": {
+      "type": "string",
+      "description": "ULID do envelope; ordena por tempo dentro do tenant (rait-events-sse-contract secao 1)."
+    },
+    "type": {
+      "const": "inf.infraction.changed"
+    },
+    "domainEvent": {
+      "const": "INFRACAO_ESTADO_ALTERADO",
+      "description": "Token canonico de inf.infraction_event_ref (14-inf-lifecycle-vocabulary.sql)."
+    },
+    "version": {
+      "type": "integer",
+      "minimum": 1
+    },
+    "occurredAt": {
+      "type": "string",
+      "format": "date-time"
+    },
+    "tenantId": {
+      "type": "string",
+      "format": "uuid",
+      "description": "Usado para roteamento; nunca exposto no SSE."
+    },
+    "actor": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": ["user", "system", "timer"]
+        },
+        "id": {
+          "type": "string"
+        },
+        "role": {
+          "type": "string"
+        }
+      }
+    },
+    "correlationId": {
+      "type": "string",
+      "description": "requestId do comando que gerou o evento."
+    },
+    "causationId": {
+      "type": "string",
+      "description": "id do evento que causou este; ausente no evento raiz."
+    },
+    "aggregate": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id", "version"],
+      "properties": {
+        "kind": {
+          "const": "infraction"
+        },
+        "id": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "version": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "ETag pos-transicao (inf.infraction.version)."
+        }
+      }
+    },
+    "data": {
+      "type": "object",
+      "description": "Codigos de estado, sub-estado e motivo restritos aos conjuntos de inf.infraction_state_ref, inf.infraction_substate_ref e inf.infraction_closure_motive_ref.",
+      "additionalProperties": false,
+      "required": [
+        "infractionId",
+        "aitId",
+        "fromState",
+        "toState",
+        "triggerKind",
+        "triggerCode",
+        "ruleRef"
+      ],
+      "properties": {
+        "infractionId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "aitId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "fromState": {
+          "type": ["string", "null"],
+          "enum": [
+            "AIT_LAVRADO",
+            "NOTIFICADO_AUTUACAO",
+            "DEFESA_EM_JULGAMENTO",
+            "PENALIDADE_A_APLICAR",
+            "NOTIFICADO_PENALIDADE",
+            "RECURSO_1A_INSTANCIA",
+            "AGUARDANDO_RECURSO_2A",
+            "RECURSO_2A_INSTANCIA",
+            "INSTANCIA_ENCERRADA",
+            "ARQUIVADO",
+            "CANCELADO_POS_INTEGRACAO",
+            "AIT_CANCELADO",
+            "EXTINTO_DECADENCIA",
+            "EXTINTO_PRESCRICAO",
+            "CANCELADO_DEFINITIVO",
+            null
+          ],
+          "description": "null na criacao do agregado (inf.infraction_transition_ref id 1, from_state IS NULL)."
+        },
+        "toState": {
+          "type": "string",
+          "enum": [
+            "AIT_LAVRADO",
+            "NOTIFICADO_AUTUACAO",
+            "DEFESA_EM_JULGAMENTO",
+            "PENALIDADE_A_APLICAR",
+            "NOTIFICADO_PENALIDADE",
+            "RECURSO_1A_INSTANCIA",
+            "AGUARDANDO_RECURSO_2A",
+            "RECURSO_2A_INSTANCIA",
+            "INSTANCIA_ENCERRADA",
+            "ARQUIVADO",
+            "CANCELADO_POS_INTEGRACAO",
+            "AIT_CANCELADO",
+            "EXTINTO_DECADENCIA",
+            "EXTINTO_PRESCRICAO",
+            "CANCELADO_DEFINITIVO"
+          ]
+        },
+        "substate": {
+          "type": "string",
+          "enum": [
+            "PRAZO_DEFESA_ABERTO",
+            "INDICACAO_EM_PROCESSAMENTO",
+            "EM_ADMISSIBILIDADE_1A",
+            "EM_REMESSA_JARI",
+            "EM_JULGAMENTO_JARI",
+            "PROVIDO_1A",
+            "NEGADO_1A",
+            "EM_ADMISSIBILIDADE_2A",
+            "EM_JULGAMENTO_CETRAN",
+            "PENDENTE_PAGAMENTO",
+            "QUITADA",
+            "EM_COBRANCA"
+          ]
+        },
+        "closureMotive": {
+          "type": "string",
+          "enum": [
+            "nao_interposicao_1a",
+            "nao_interposicao_2a",
+            "julgamento_2a",
+            "reconhecimento",
+            "desistencia",
+            "nao_conhecimento_intempestivo",
+            "na_nao_expedida",
+            "insubsistente"
+          ]
+        },
+        "triggerKind": {
+          "type": "string",
+          "enum": ["evento", "timer", "ato", "sistema"]
+        },
+        "triggerCode": {
+          "type": "string",
+          "description": "inf.infraction_transition_ref.trigger_code da linha aplicada."
+        },
+        "ruleRef": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "inf.infraction_transition_ref.rule_ref (numero da linha de [WF-INF-003] secao 2)."
+        }
+      }
+    }
+  }
+}
diff --git a/docs/framework/schemas/events/inf.infraction.penalty-final.schema.json b/docs/framework/schemas/events/inf.infraction.penalty-final.schema.json
new file mode 100644
index 0000000..5bcb32e
--- /dev/null
+++ b/docs/framework/schemas/events/inf.infraction.penalty-final.schema.json
@@ -0,0 +1,126 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/events/inf.infraction.penalty-final.schema.json",
+  "title": "inf.infraction.penalty-final",
+  "description": "Penalidade definitiva — pontuacao no RENACH via senatran-adapter (rait-events-sse-contract secao 2.4; [REF-CONTRAN-918] art. 18).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "id",
+    "type",
+    "domainEvent",
+    "version",
+    "occurredAt",
+    "tenantId",
+    "actor",
+    "correlationId",
+    "aggregate",
+    "data"
+  ],
+  "properties": {
+    "id": {
+      "type": "string",
+      "description": "ULID do envelope; ordena por tempo dentro do tenant (rait-events-sse-contract secao 1)."
+    },
+    "type": {
+      "const": "inf.infraction.penalty-final"
+    },
+    "domainEvent": {
+      "const": "PENALIDADE_DEFINITIVA",
+      "description": "Token canonico de inf.infraction_event_ref (14-inf-lifecycle-vocabulary.sql)."
+    },
+    "version": {
+      "type": "integer",
+      "minimum": 1
+    },
+    "occurredAt": {
+      "type": "string",
+      "format": "date-time"
+    },
+    "tenantId": {
+      "type": "string",
+      "format": "uuid",
+      "description": "Usado para roteamento; nunca exposto no SSE."
+    },
+    "actor": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": ["user", "system", "timer"]
+        },
+        "id": {
+          "type": "string"
+        },
+        "role": {
+          "type": "string"
+        }
+      }
+    },
+    "correlationId": {
+      "type": "string",
+      "description": "requestId do comando que gerou o evento."
+    },
+    "causationId": {
+      "type": "string",
+      "description": "id do evento que causou este; ausente no evento raiz."
+    },
+    "aggregate": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id", "version"],
+      "properties": {
+        "kind": {
+          "const": "infraction"
+        },
+        "id": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "version": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "ETag pos-transicao (inf.infraction.version)."
+        }
+      }
+    },
+    "data": {
+      "type": "object",
+      "description": "Emitido na entrada de INSTANCIA_ENCERRADA ([WF-INF-003] secao 5 invariante 2).",
+      "additionalProperties": false,
+      "required": ["infractionId", "aitId", "finalOn", "points", "amountTier"],
+      "properties": {
+        "infractionId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "aitId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "finalOn": {
+          "type": "string",
+          "format": "date"
+        },
+        "points": {
+          "type": "integer",
+          "minimum": 0
+        },
+        "amountTier": {
+          "type": "string",
+          "enum": [
+            "nenhum",
+            "desconto_80",
+            "desconto_60_reconhecimento",
+            "desconto_40_fora_sne",
+            "integral_juros",
+            "restituido"
+          ],
+          "description": "inf.infraction_payment_tier_ref.code."
+        }
+      }
+    }
+  }
+}
diff --git a/docs/framework/schemas/events/inf.infraction.refund-due.schema.json b/docs/framework/schemas/events/inf.infraction.refund-due.schema.json
new file mode 100644
index 0000000..2d3f0ea
--- /dev/null
+++ b/docs/framework/schemas/events/inf.infraction.refund-due.schema.json
@@ -0,0 +1,114 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/events/inf.infraction.refund-due.schema.json",
+  "title": "inf.infraction.refund-due",
+  "description": "Restituicao devida ao administrado — consumido pelo financeiro (rait-events-sse-contract secao 2.4; CTB art. 286 par. 2o).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "id",
+    "type",
+    "domainEvent",
+    "version",
+    "occurredAt",
+    "tenantId",
+    "actor",
+    "correlationId",
+    "aggregate",
+    "data"
+  ],
+  "properties": {
+    "id": {
+      "type": "string",
+      "description": "ULID do envelope; ordena por tempo dentro do tenant (rait-events-sse-contract secao 1)."
+    },
+    "type": {
+      "const": "inf.infraction.refund-due"
+    },
+    "domainEvent": {
+      "const": "RESTITUICAO_DEVIDA",
+      "description": "Token canonico de inf.infraction_event_ref (14-inf-lifecycle-vocabulary.sql)."
+    },
+    "version": {
+      "type": "integer",
+      "minimum": 1
+    },
+    "occurredAt": {
+      "type": "string",
+      "format": "date-time"
+    },
+    "tenantId": {
+      "type": "string",
+      "format": "uuid",
+      "description": "Usado para roteamento; nunca exposto no SSE."
+    },
+    "actor": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": ["user", "system", "timer"]
+        },
+        "id": {
+          "type": "string"
+        },
+        "role": {
+          "type": "string"
+        }
+      }
+    },
+    "correlationId": {
+      "type": "string",
+      "description": "requestId do comando que gerou o evento."
+    },
+    "causationId": {
+      "type": "string",
+      "description": "id do evento que causou este; ausente no evento raiz."
+    },
+    "aggregate": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id", "version"],
+      "properties": {
+        "kind": {
+          "const": "infraction"
+        },
+        "id": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "version": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "ETag pos-transicao (inf.infraction.version)."
+        }
+      }
+    },
+    "data": {
+      "type": "object",
+      "description": "Emitido em CANCELADO_DEFINITIVO ou extincao com paid=true ([WF-INF-003] secao 5 invariante 8).",
+      "additionalProperties": false,
+      "required": ["infractionId", "paymentId", "amount", "reason"],
+      "properties": {
+        "infractionId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "paymentId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "amount": {
+          "type": "number",
+          "exclusiveMinimum": 0
+        },
+        "reason": {
+          "type": "string",
+          "description": "Motivo textual curto do estorno; sem dados de terceiros."
+        }
+      }
+    }
+  }
+}
diff --git a/docs/framework/schemas/events/inf.timer.expired.schema.json b/docs/framework/schemas/events/inf.timer.expired.schema.json
new file mode 100644
index 0000000..84bd102
--- /dev/null
+++ b/docs/framework/schemas/events/inf.timer.expired.schema.json
@@ -0,0 +1,149 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/events/inf.timer.expired.schema.json",
+  "title": "inf.timer.expired",
+  "description": "Vencimento de relogio legal — consumido pela auditoria (rait-events-sse-contract secao 2.4; [WF-INF-002] secao 9).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "id",
+    "type",
+    "domainEvent",
+    "version",
+    "occurredAt",
+    "tenantId",
+    "actor",
+    "correlationId",
+    "aggregate",
+    "data"
+  ],
+  "properties": {
+    "id": {
+      "type": "string",
+      "description": "ULID do envelope; ordena por tempo dentro do tenant (rait-events-sse-contract secao 1)."
+    },
+    "type": {
+      "const": "inf.timer.expired"
+    },
+    "domainEvent": {
+      "const": "TIMER_VENCIDO",
+      "description": "Token canonico de inf.infraction_event_ref (14-inf-lifecycle-vocabulary.sql)."
+    },
+    "version": {
+      "type": "integer",
+      "minimum": 1
+    },
+    "occurredAt": {
+      "type": "string",
+      "format": "date-time"
+    },
+    "tenantId": {
+      "type": "string",
+      "format": "uuid",
+      "description": "Usado para roteamento; nunca exposto no SSE."
+    },
+    "actor": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": ["user", "system", "timer"]
+        },
+        "id": {
+          "type": "string"
+        },
+        "role": {
+          "type": "string"
+        }
+      }
+    },
+    "correlationId": {
+      "type": "string",
+      "description": "requestId do comando que gerou o evento."
+    },
+    "causationId": {
+      "type": "string",
+      "description": "id do evento que causou este; ausente no evento raiz."
+    },
+    "aggregate": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id", "version"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": [
+            "case",
+            "infraction",
+            "session",
+            "batch",
+            "clock",
+            "assignment",
+            "agenda-item",
+            "outbox"
+          ]
+        },
+        "id": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "version": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "ETag pos-transicao (inf.infraction.version)."
+        }
+      }
+    },
+    "data": {
+      "type": "object",
+      "description": "Emitido uma vez por timer vencido — a varredura e idempotente (rait-deadline-engine secao 5).",
+      "additionalProperties": false,
+      "required": ["ownerKind", "ownerId", "timerCode", "dueOn", "effect"],
+      "properties": {
+        "ownerKind": {
+          "type": "string",
+          "enum": ["case", "infraction", "session"]
+        },
+        "ownerId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "timerCode": {
+          "type": "string",
+          "enum": [
+            "T-NA",
+            "T-SNE-CIENCIA",
+            "T-DEF",
+            "T-IND",
+            "T-NA-IND",
+            "T-DEC",
+            "T-NP-VENC",
+            "T-REM10",
+            "T-JUL-24M",
+            "T-DIL",
+            "T-R2",
+            "T-PAR-3A",
+            "T-PRESC-5A",
+            "T-VOTO",
+            "T-CONV",
+            "T-ASS",
+            "T-CLAIM",
+            "SLA-30"
+          ],
+          "description": "inf.infraction_timer_ref.code."
+        },
+        "dueOn": {
+          "type": "string",
+          "format": "date"
+        },
+        "effect": {
+          "type": "string",
+          "enum": ["transicao", "alerta", "marco", "regra"],
+          "description": "expiry_kind efetivo do catalogo; guarda e indicador nunca vencem (rait-deadline-engine secao 3). Timers a_confirmar (T-NA-IND, T-PAR-3A, T-PRESC-5A) vencem como alerta ate deadline.<codigo>.expiry_kind_override (H.46, OD-301/OD-304)."
+        }
+      }
+    }
+  }
+}
diff --git a/docs/framework/schemas/events/inf.timer.rescheduled.schema.json b/docs/framework/schemas/events/inf.timer.rescheduled.schema.json
new file mode 100644
index 0000000..ce5fa42
--- /dev/null
+++ b/docs/framework/schemas/events/inf.timer.rescheduled.schema.json
@@ -0,0 +1,155 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/events/inf.timer.rescheduled.schema.json",
+  "title": "inf.timer.rescheduled",
+  "description": "Reprogramacao de relogio por ato de suspensao — consumido pela auditoria e pelo SSE (rait-events-sse-contract secao 2.4; rait-deadline-engine secao 3). TIMER_REPROGRAMADO ainda nao existe em inf.infraction_event_ref (lacuna reportada, ver work/rounds/R-0006/contracts/CTG-0001.md).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "id",
+    "type",
+    "domainEvent",
+    "version",
+    "occurredAt",
+    "tenantId",
+    "actor",
+    "correlationId",
+    "aggregate",
+    "data"
+  ],
+  "properties": {
+    "id": {
+      "type": "string",
+      "description": "ULID do envelope; ordena por tempo dentro do tenant (rait-events-sse-contract secao 1)."
+    },
+    "type": {
+      "const": "inf.timer.rescheduled"
+    },
+    "domainEvent": {
+      "const": "TIMER_REPROGRAMADO",
+      "description": "Token canonico de inf.infraction_event_ref (14-inf-lifecycle-vocabulary.sql)."
+    },
+    "version": {
+      "type": "integer",
+      "minimum": 1
+    },
+    "occurredAt": {
+      "type": "string",
+      "format": "date-time"
+    },
+    "tenantId": {
+      "type": "string",
+      "format": "uuid",
+      "description": "Usado para roteamento; nunca exposto no SSE."
+    },
+    "actor": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": ["user", "system", "timer"]
+        },
+        "id": {
+          "type": "string"
+        },
+        "role": {
+          "type": "string"
+        }
+      }
+    },
+    "correlationId": {
+      "type": "string",
+      "description": "requestId do comando que gerou o evento."
+    },
+    "causationId": {
+      "type": "string",
+      "description": "id do evento que causou este; ausente no evento raiz."
+    },
+    "aggregate": {
+      "type": "object",
+      "additionalProperties": false,
+      "required": ["kind", "id", "version"],
+      "properties": {
+        "kind": {
+          "type": "string",
+          "enum": [
+            "case",
+            "infraction",
+            "session",
+            "batch",
+            "clock",
+            "assignment",
+            "agenda-item",
+            "outbox"
+          ]
+        },
+        "id": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "version": {
+          "type": "integer",
+          "minimum": 1,
+          "description": "ETag pos-transicao (inf.infraction.version)."
+        }
+      }
+    },
+    "data": {
+      "type": "object",
+      "description": "Suspensao nunca e automatica: so ato motivado e auditado ([RN-RAIT-105]); vedada sobre T-DEC, T-JUL-24M, T-PAR-3A e T-PRESC-5A (RAIT.SUSPENSION_LEGAL_TIMER).",
+      "additionalProperties": false,
+      "required": [
+        "ownerId",
+        "timerCode",
+        "oldDueOn",
+        "newDueOn",
+        "suspensionActId"
+      ],
+      "properties": {
+        "ownerId": {
+          "type": "string",
+          "format": "uuid"
+        },
+        "timerCode": {
+          "type": "string",
+          "enum": [
+            "T-NA",
+            "T-SNE-CIENCIA",
+            "T-DEF",
+            "T-IND",
+            "T-NA-IND",
+            "T-DEC",
+            "T-NP-VENC",
+            "T-REM10",
+            "T-JUL-24M",
+            "T-DIL",
+            "T-R2",
+            "T-PAR-3A",
+            "T-PRESC-5A",
+            "T-VOTO",
+            "T-CONV",
+            "T-ASS",
+            "T-CLAIM",
+            "SLA-30"
+          ],
+          "description": "inf.infraction_timer_ref.code."
+        },
+        "oldDueOn": {
+          "type": "string",
+          "format": "date"
+        },
+        "newDueOn": {
+          "type": "string",
+          "format": "date"
+        },
+        "suspensionActId": {
+          "type": "string",
+          "format": "uuid",
+          "description": "inf.rait_suspension_act (DDL 39); referencia sem FK."
+        }
+      }
+    }
+  }
+}
diff --git a/package.json b/package.json
index 9c6583a..e790690 100644
--- a/package.json
+++ b/package.json
@@ -16,7 +16,7 @@
     "format:check": "prettier --check .",
     "format": "prettier --write .",
     "typecheck": "pnpm -r --if-present run typecheck",
-    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build",
+    "build": "pnpm --filter @detran/shared build && pnpm --filter @detran/senatran-adapter build && pnpm --filter @detran/sefaz-adapter build && pnpm --filter @detran/portal-complaints build && pnpm --filter @detran/ch-clinical-network build && pnpm --filter @detran/ch-patients build && pnpm --filter @detran/ch-encounters build && pnpm --filter @detran/ch-biometrics build && pnpm --filter @detran/ch-exams build && pnpm --filter @detran/ch-clinical-controls build && pnpm --filter @detran/ch-inconsistencies build && pnpm --filter @detran/ch-operational-controls build && pnpm --filter @detran/ch-clinical-reports build && pnpm --filter @detran/ch-process-blocks build && pnpm --filter @detran/ch-telehealth build && pnpm --filter @detran/ch-billing build && pnpm --filter @detran/ch-scheduling build && pnpm --filter @detran/ch-restrictions build && pnpm --filter @detran/ch-retention build && pnpm --filter @detran/ch-juntas build && pnpm --filter @detran/ch-toxicology build && pnpm --filter @detran/inf-normative build && pnpm --filter @detran/inf-ait build && pnpm --filter @detran/inf-measures build && pnpm --filter @detran/inf-alcohol build && pnpm --filter @detran/inf-rait-case build && pnpm --filter @detran/inf-rait-worklist build && pnpm --filter @detran/inf-rait-session build && pnpm --filter @detran/inf-deadlines build && pnpm --filter @detran/inf-infraction build && pnpm --filter @detran/inf-notification build && pnpm --filter @detran/inf-speed build && pnpm --filter @detran/app build && pnpm --filter @detran/ui build",
     "verify:decorators": "tsx tools/verify-controller-decorators.ts",
     "verify:rls-ddl": "tsx tools/check-rls-ddl.ts",
     "verify:role-catalog": "tsx tools/check-role-catalog.ts",
@@ -29,8 +29,8 @@
     "backend:db:apply": "bash backend/database/apply.sh",
     "backend:db:reset": "bash backend/database/apply.sh --full",
     "backend:rls-smoke": "tsx tools/check-rls-smoke.ts",
-    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/app test:unit",
-    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration",
+    "backend:test:unit": "pnpm --filter @detran/shared test && pnpm --filter @detran/sefaz-adapter test:unit && pnpm --filter @detran/portal-complaints test:unit && pnpm --filter @detran/ch-clinical-network test:unit && pnpm --filter @detran/ch-patients test:unit && pnpm --filter @detran/ch-encounters test:unit && pnpm --filter @detran/ch-biometrics test:unit && pnpm --filter @detran/ch-exams test:unit && pnpm --filter @detran/ch-clinical-controls test:unit && pnpm --filter @detran/ch-inconsistencies test:unit && pnpm --filter @detran/ch-operational-controls test:unit && pnpm --filter @detran/ch-clinical-reports test:unit && pnpm --filter @detran/ch-process-blocks test:unit && pnpm --filter @detran/ch-telehealth test:unit && pnpm --filter @detran/ch-billing test:unit && pnpm --filter @detran/ch-scheduling test:unit && pnpm --filter @detran/ch-restrictions test:unit && pnpm --filter @detran/ch-retention test:unit && pnpm --filter @detran/inf-normative test:unit && pnpm --filter @detran/inf-ait test:unit && pnpm --filter @detran/inf-measures test:unit && pnpm --filter @detran/inf-alcohol test:unit && pnpm --filter @detran/inf-rait-case test:unit && pnpm --filter @detran/inf-rait-worklist test:unit && pnpm --filter @detran/inf-rait-session test:unit && pnpm --filter @detran/inf-deadlines test && pnpm --filter @detran/inf-infraction test:unit && pnpm --filter @detran/inf-notification test:unit && pnpm --filter @detran/inf-speed test:unit && pnpm --filter @detran/app test:unit",
+    "backend:test:integration": "pnpm --filter @detran/app test:integration && pnpm --filter @detran/inf-ait test:integration && pnpm --filter @detran/inf-infraction test:integration && pnpm --filter @detran/inf-notification test:integration",
     "backend:test:e2e": "pnpm --filter @detran/app test:e2e && pnpm --filter @detran/inf-ait test:e2e",
     "backend:test:real": "pnpm --filter @detran/app test:real",
     "backend:test:in-house": "pnpm --filter @detran/app test:in-house",
```

### Nota do maestro

Responda apenas com o JSON do §Saída.
