# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `dashboard-backend` (rodada `R-0011`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-backend-r0011-615f16`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/dashboard-build-pack.md` — apenas a seção do WP `WP-D2 e WP-D3` e o "mapa entregável → definições"
4. `work/rounds/R-0011/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0011/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0011/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0011",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0011/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito** (método §5): avalie **somente** (1) a correção do achado único de
`delivery-review-CTG-0002.json` (item 1: `reports/TASK-0006.md` declara agora só "Architect (transcrição)" — o contrato
de comandos vive em `docs/framework/contracts/`, área do Architect segundo `transcriber-docs.md`), e (2) a integração
de `origin/main` (`b8920457`, PRs #82/#85 de R-0013/R-0012) por `git merge --no-edit` no branch publicado (commit
`46894ecc`): conflitos só em `record/proofs/chain.json` (aceita a cadeia de `main`) e `tools/contracts/tests/check-commands.test.mjs`
`C-5-16` (160 de `main` + 43 do DASHBOARD = **203**, provado por `commands contracts: OK (203 operations)` e
`contracts:test` 58/58); `pnpm install --frozen-lockfile` OK; `@detran/app` typecheck OK; gates pós-merge
(`pnpm check`, tiers do monitor, e2e do app) em execução — anexados ao PR. Um achado novo sobre texto inalterado só é
admitido se for `FAIL` por definição.

Contexto do ciclo 1 (inalterado): Entrega do **CTG-0002** (WP-D2 ciclo do alerta, deveres, frescor, relógio próprio,
exportação, relatórios, auditoria, open-data, SSE; WP-D3 contratos; documentação) da rodada R-0011, aberto pela via
M7/A3 por decisão do Owner (`AUTHORIZATION.md` Emenda 2). Base: `origin/main` `e0763c6c` (PR #83 = CTG-0001). Branch
`orchestra/dashboard-backend` publicado (HEAD = `git rev-parse HEAD`). Tarefas: TASK-0012 (Architect, Opus: blueprint
1.1.0, `escalation_chain_ref`, contrato `contracts/CTG-0002.md`), TASK-0004 ∥ TASK-0014 (Inspectors, Opus: ciclo
C-0002-01…49; superfície C-0002-50…100), TASK-0005 ∥ TASK-0013 (Engineers, Opus: `cycle/**`; `surface/**` + SSE +
wiring), TASK-0006 (transcriber: contrato de comandos 43 operações, 6 schemas de evento, 4 feeds), TASK-0008 → TASK-0009
(Inspector/Engineer: `check-commands.mjs` raízes `dashboard/*` + catálogo `DASH.`), TASK-0007 (transcriber: build pack,
ADR-0020, route contract §7/§8, catálogo de parâmetros, `waves.md`, método §10, backlog). Adendas **A18…A23** em
`plan.md` (cada uma com fonte); relatórios em `reports/TASK-*.md`; 10 ciclos de prompt-review (4/6/8/10 PASS).

Gates (maestro, nesta worktree): `pnpm check` verde após o grupo de código (991 handlers em `verify:decorators`, gate de
fronteiras 1.608 arquivos, `verify:parameter-catalogue` 90 entries) e em reexecução final agora; `@detran/dashboard-monitor`
typecheck limpo, unit 231/231, integração 430/430 (duas execuções consecutivas, `detran_r11`); e2e do app `dashboard-*`
1.275 verdes / 1 `todo` (OD-D58) ×2 consecutivas; `policy-routes` 5/5; `contracts:check` OK (195 operações; clientes 63);
`contracts:test` 52/52; `parameters:test` 43/43; `docs:kb:check` OK (756). O CI `backend-kernel` do PR é o gate de merge.

Pontos que **não** são achados (já registrados, com fonte): (a) M15/A18 — relógio próprio (`dashboard.timer`,
`DashboardClockService`/`Sweeper`) usando `Calendar`/`Clock` de `@detran/inf-deadlines` só em leitura; integração ao
motor de prazos adiada (OD-D28); (b) M16 — sete controllers **manuscritos** em `surface/**` (o CTG-0001 §6 dizia "nenhum
controller manuscrito"; A22 a reescreveu `module-surface.spec.ts`); (c) M17 — `policy.ts` intocado: a matriz
`dashboard:*` de R-0003 cobre todas as rotas; A23 a — `GLOBAL_ADMIN_ROLES` recebem `'*'` por regra de plataforma
(precedente `policy-routes.e2e.spec.ts`, R-0008) e a matriz e2e o codifica; OD-D76 ao Owner; (d) A20/A21 — os
harnesses/specs dos Inspectors fixam as assinaturas que o contrato §14 deixou abertas (`suppress`, `watermarkOf`,
construtores do ciclo); (e) A22 c/A23 d — premissas dos Engineers (OD-D64…D80) aceitas como leitura do contrato;
(f) escritas de plataforma admitidas em "nenhuma rota altera domínio": `integration.idempotency_keys`,
`integration.rate_limit_windows`, `audit.write` (A23 b); (g) segunda instância dos serviços do ciclo no app
(`DashboardSweepModule`) porque o módulo gerado não exporta providers (OD-D77); (h) `zod` nas dependências (A19);
(i) fontes `portal.outbox`/`dashboard` ausentes no seed 81 inseridas pelas suítes (OD-D61); (j) OD-D30/D31 — defaults
com prosa lidos pelo número inicial no código e normalizados no catálogo por TASK-0007 (mesmo valor);
(k) TASK-0007 rodou `pnpm format` no repositório (cosmético; recomendação ao método registrada).

`git diff --stat origin/main..HEAD` (gerados, contratos OpenAPI gerados, clientes, fixtures de teste do checker,
`record/`, `.devai/` e `work/rounds` omitidos do stat; leia o diff completo na worktree):

```text
 AGENTS.md                                                                                |     4 +-
 README.md                                                                                |     2 +-
 apps/rait/web/src/app/core/rait-shell.component.spec.ts                                  |    83 +-
 apps/rait/web/src/app/core/shell-search.spec.ts                                          |    70 -
 apps/rait/web/src/app/core/shell-search.ts                                               |    21 +-
 apps/rait/web/src/app/data/api/case.client.spec.ts                                       |   436 --
 apps/rait/web/src/app/data/api/case.client.ts                                            |   400 --
 apps/rait/web/src/app/data/api/collection.client.spec.ts                                 |   151 -
 apps/rait/web/src/app/data/api/collection.client.ts                                      |   131 -
 apps/rait/web/src/app/data/api/etag-store.spec.ts                                        |    48 -
 apps/rait/web/src/app/data/api/etag-store.ts                                             |    90 -
 apps/rait/web/src/app/data/api/infraction.client.spec.ts                                 |    92 -
 apps/rait/web/src/app/data/api/infraction.client.ts                                      |    73 -
 apps/rait/web/src/app/data/api/integration.client.spec.ts                                |   102 -
 apps/rait/web/src/app/data/api/integration.client.ts                                     |    63 -
 apps/rait/web/src/app/data/api/notification.client.spec.ts                               |    93 -
 apps/rait/web/src/app/data/api/notification.client.ts                                    |    73 -
 apps/rait/web/src/app/data/api/org.client.spec.ts                                        |   217 -
 apps/rait/web/src/app/data/api/org.client.ts                                             |   225 -
 apps/rait/web/src/app/data/api/rait-http.spec.ts                                         |   103 -
 apps/rait/web/src/app/data/api/rait-http.ts                                              |    64 -
 apps/rait/web/src/app/data/api/session.client.spec.ts                                    |   257 -
 apps/rait/web/src/app/data/api/session.client.ts                                         |   254 -
 apps/rait/web/src/app/data/api/worklist.client.spec.ts                                   |   306 --
 apps/rait/web/src/app/data/api/worklist.client.ts                                        |   382 --
 apps/rait/web/src/app/data/clock.ts                                                      |    14 -
 apps/rait/web/src/app/data/facades/archive.facade.spec.ts                                |    92 -
 apps/rait/web/src/app/data/facades/archive.facade.ts                                     |    98 -
 apps/rait/web/src/app/data/facades/audit.facade.spec.ts                                  |    62 -
 apps/rait/web/src/app/data/facades/audit.facade.ts                                       |    57 -
 apps/rait/web/src/app/data/facades/bundles.ts                                            |    76 -
 apps/rait/web/src/app/data/facades/case.facade.spec.ts                                   |   237 -
 apps/rait/web/src/app/data/facades/case.facade.ts                                        |   451 --
 apps/rait/web/src/app/data/facades/command.spec.ts                                       |    42 -
 apps/rait/web/src/app/data/facades/command.ts                                            |    54 -
 apps/rait/web/src/app/data/facades/finance.facade.spec.ts                                |    98 -
 apps/rait/web/src/app/data/facades/finance.facade.ts                                     |   114 -
 apps/rait/web/src/app/data/facades/integration.facade.spec.ts                            |    75 -
 apps/rait/web/src/app/data/facades/integration.facade.ts                                 |    59 -
 apps/rait/web/src/app/data/facades/list.facade.spec.ts                                   |    58 -
 apps/rait/web/src/app/data/facades/list.facade.ts                                        |    71 -
 apps/rait/web/src/app/data/facades/organization.facade.spec.ts                           |    81 -
 apps/rait/web/src/app/data/facades/organization.facade.ts                                |   144 -
 apps/rait/web/src/app/data/facades/protocol.facade.spec.ts                               |   113 -
 apps/rait/web/src/app/data/facades/protocol.facade.ts                                    |   231 -
 apps/rait/web/src/app/data/facades/queue.facade.spec.ts                                  |   104 -
 apps/rait/web/src/app/data/facades/queue.facade.ts                                       |   208 -
 apps/rait/web/src/app/data/facades/radar.facade.spec.ts                                  |   104 -
 apps/rait/web/src/app/data/facades/radar.facade.ts                                       |   196 -
 apps/rait/web/src/app/data/facades/read-store.spec.ts                                    |   150 -
 apps/rait/web/src/app/data/facades/read-store.ts                                         |   149 -
 apps/rait/web/src/app/data/facades/session.facade.spec.ts                                |   163 -
 apps/rait/web/src/app/data/facades/session.facade.ts                                     |   636 ---
 apps/rait/web/src/app/data/facades/signing.facade.spec.ts                                |   149 -
 apps/rait/web/src/app/data/facades/signing.facade.ts                                     |   127 -
 apps/rait/web/src/app/data/facades/stream.ts                                             |    67 -
 apps/rait/web/src/app/data/idempotency-key.spec.ts                                       |    46 -
 apps/rait/web/src/app/data/idempotency-key.ts                                            |    73 -
 apps/rait/web/src/app/data/list-query.spec.ts                                            |   148 -
 apps/rait/web/src/app/data/list-query.ts                                                 |   157 -
 apps/rait/web/src/app/data/models/case.models.ts                                         |    69 -
 apps/rait/web/src/app/data/models/collection.models.ts                                   |    19 -
 apps/rait/web/src/app/data/models/commands.ts                                            |    96 -
 apps/rait/web/src/app/data/models/index.ts                                               |    12 -
 apps/rait/web/src/app/data/models/infraction.models.ts                                   |    17 -
 apps/rait/web/src/app/data/models/integration.models.ts                                  |    11 -
 apps/rait/web/src/app/data/models/list-page.ts                                           |    37 -
 apps/rait/web/src/app/data/models/notification.models.ts                                 |    13 -
 apps/rait/web/src/app/data/models/org.models.ts                                          |    29 -
 apps/rait/web/src/app/data/models/session.models.ts                                      |    32 -
 apps/rait/web/src/app/data/models/tokens.ts                                              |   247 -
 apps/rait/web/src/app/data/models/worklist.models.ts                                     |    55 -
 apps/rait/web/src/app/data/shell-search/case-shell-search.ts                             |    29 -
 apps/rait/web/src/app/i18n/rait.pt-BR.json                                               |    65 -
 apps/rait/web/src/app/shared/admissibility-checklist.component.spec.ts                   |    80 -
 apps/rait/web/src/app/shared/admissibility-checklist.component.ts                        |   212 -
 apps/rait/web/src/app/shared/batch-draw-viewer.component.spec.ts                         |    65 -
 apps/rait/web/src/app/shared/batch-draw-viewer.component.ts                              |   163 -
 apps/rait/web/src/app/shared/case-header.component.spec.ts                               |   143 -
 apps/rait/web/src/app/shared/case-header.component.ts                                    |   137 -
 apps/rait/web/src/app/shared/case-state-badge.component.spec.ts                          |   102 -
 apps/rait/web/src/app/shared/case-state-badge.component.ts                               |    46 -
 apps/rait/web/src/app/shared/clocks-panel.component.spec.ts                              |    63 -
 apps/rait/web/src/app/shared/clocks-panel.component.ts                                   |   102 -
 apps/rait/web/src/app/shared/deadline-chip.component.spec.ts                             |   100 -
 apps/rait/web/src/app/shared/deadline-chip.component.ts                                  |    84 -
 apps/rait/web/src/app/shared/decision-panel.component.spec.ts                            |   138 -
 apps/rait/web/src/app/shared/decision-panel.component.ts                                 |   273 -
 apps/rait/web/src/app/shared/document-uploader.component.spec.ts                         |    67 -
 apps/rait/web/src/app/shared/document-uploader.component.ts                              |   152 -
 apps/rait/web/src/app/shared/dossier-viewer.component.spec.ts                            |   110 -
 apps/rait/web/src/app/shared/dossier-viewer.component.ts                                 |   160 -
 apps/rait/web/src/app/shared/event-timeline.component.spec.ts                            |    81 -
 apps/rait/web/src/app/shared/event-timeline.component.ts                                 |   108 -
 apps/rait/web/src/app/shared/impediment-dialog.component.spec.ts                         |    85 -
 apps/rait/web/src/app/shared/impediment-dialog.component.ts                              |   226 -
 apps/rait/web/src/app/shared/inquiry-card.component.spec.ts                              |   120 -
 apps/rait/web/src/app/shared/inquiry-card.component.ts                                   |   124 -
 apps/rait/web/src/app/shared/inquiry-form.component.spec.ts                              |    69 -
 apps/rait/web/src/app/shared/inquiry-form.component.ts                                   |   168 -
 apps/rait/web/src/app/shared/kpi-tile.component.spec.ts                                  |    63 -
 apps/rait/web/src/app/shared/kpi-tile.component.ts                                       |    65 -
 apps/rait/web/src/app/shared/legal-basis-tooltip.component.spec.ts                       |    55 -
 apps/rait/web/src/app/shared/legal-basis-tooltip.component.ts                            |    75 -
 apps/rait/web/src/app/shared/minuta-editor.component.spec.ts                             |    91 -
 apps/rait/web/src/app/shared/minuta-editor.component.ts                                  |   183 -
 apps/rait/web/src/app/shared/opinion-editor.component.spec.ts                            |    81 -
 apps/rait/web/src/app/shared/opinion-editor.component.ts                                 |   171 -
 apps/rait/web/src/app/shared/page-state.component.spec.ts                                |   119 -
 apps/rait/web/src/app/shared/page-state.component.ts                                     |    82 -
 apps/rait/web/src/app/shared/placeholder-page.component.ts                               |     8 +-
 apps/rait/web/src/app/shared/queue-table.component.spec.ts                               |   200 -
 apps/rait/web/src/app/shared/queue-table.component.ts                                    |   290 -
 apps/rait/web/src/app/shared/quorum-indicator.component.spec.ts                          |    99 -
 apps/rait/web/src/app/shared/quorum-indicator.component.ts                               |   108 -
 apps/rait/web/src/app/shared/risk-flag.component.spec.ts                                 |    82 -
 apps/rait/web/src/app/shared/risk-flag.component.ts                                      |    75 -
 apps/rait/web/src/app/shared/route-screen.ts                                             |    10 -
 apps/rait/web/src/app/shared/schedule-grid.component.spec.ts                             |    53 -
 apps/rait/web/src/app/shared/schedule-grid.component.ts                                  |   100 -
 apps/rait/web/src/app/shared/signature-dialog.component.spec.ts                          |    60 -
 apps/rait/web/src/app/shared/signature-dialog.component.ts                               |    61 -
 apps/rait/web/src/app/shared/stream-status-banner.component.spec.ts                      |    64 -
 apps/rait/web/src/app/shared/stream-status-banner.component.ts                           |    41 -
 apps/rait/web/src/app/shared/table-column.ts                                             |     7 -
 apps/rait/web/src/app/shared/trend-chart.component.spec.ts                               |    59 -
 apps/rait/web/src/app/shared/trend-chart.component.ts                                    |   121 -
 apps/rait/web/src/app/shared/vote-tally.component.spec.ts                                |   101 -
 apps/rait/web/src/app/shared/vote-tally.component.ts                                     |   125 -
 apps/rait/web/src/main.ts                                                                |     4 -
 apps/rait/web/src/testing/clock.stub.ts                                                  |    32 -
 apps/rait/web/src/testing/http-fixtures.ts                                               |   766 ---
 apps/rait/web/src/testing/kb.ts                                                          |    78 -
 apps/rait/web/src/testing/policy.fixture.ts                                              |   192 -
 apps/rait/web/src/testing/stynx-session.stub.ts                                          |    52 +-
 backend/app/package.json                                                                 |     1 -
 backend/app/src/app.module.ts                                                            |   128 +-
 backend/app/src/dashboard-stream.controller.ts                                           |   250 +
 backend/app/src/dashboard-stream.service.ts                                              |   355 ++
 backend/app/src/dashboard-sweep.providers.ts                                             |   235 +
 backend/app/src/generated/parameter-flags.ts                                             |     4 +-
 backend/app/tests/e2e/dashboard-audit.e2e.spec.ts                                        |   381 ++
 backend/app/tests/e2e/dashboard-catalog.e2e.spec.ts                                      |   518 ++
 backend/app/tests/e2e/dashboard-domain-boundary.e2e.spec.ts                              |   479 ++
 backend/app/tests/e2e/dashboard-e2e.support.ts                                           |   853 +++
 backend/app/tests/e2e/dashboard-exports.e2e.spec.ts                                      |   431 ++
 backend/app/tests/e2e/dashboard-layers.e2e.spec.ts                                       |   400 ++
 backend/app/tests/e2e/dashboard-policy.e2e.spec.ts                                       |  1873 +++++++
 backend/app/tests/e2e/dashboard-stream.e2e.spec.ts                                       |   521 ++
 backend/app/tests/e2e/ops-provisioning.e2e.spec.ts                                       |   276 -
 backend/app/tests/e2e/policy-routes.e2e.spec.ts                                          |    17 +-
 backend/app/tests/integration/boat-projections.integration.spec.ts                       |     2 +-
 backend/app/vitest.config.ts                                                             |     3 -
 backend/database/apply.sh                                                                |    28 +-
 backend/database/ddl/11-auth-functions.sql                                               |    49 +-
 backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql                               |    41 +
 backend/database/ddl/21-ops-provisioning.sql                                             |   233 -
 backend/database/ddl/80-dashboard.sql                                                    |    67 +-
 backend/database/seed.sh                                                                 |     2 -
 backend/database/seed/05-parameters.sql                                                  |    13 +-
 backend/database/seed/29-fixtures-ops-provisioning.sql                                   |   135 -
 backend/domains/dashboard/monitor/package.json                                           |     3 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/alert.service.ts                 |  1922 +++++++
 backend/domains/dashboard/monitor/src/handwritten/cycle/clock.service.ts                 |   487 ++
 backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts                 |   246 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/dto.ts                           |    85 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/duty.service.ts                  |  1066 ++++
 backend/domains/dashboard/monitor/src/handwritten/cycle/events.ts                        |   131 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/freshness.service.ts             |   589 +++
 backend/domains/dashboard/monitor/src/handwritten/cycle/if-match.ts                      |    39 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/index.ts                         |   192 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/notifier.ts                      |   439 ++
 backend/domains/dashboard/monitor/src/handwritten/cycle/tokens.ts                        |   276 +
 backend/domains/dashboard/monitor/src/handwritten/cycle/transitions.ts                   |   218 +
 backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts           |   347 ++
 backend/domains/dashboard/monitor/src/handwritten/surface/audit.controller.ts            |   267 +
 backend/domains/dashboard/monitor/src/handwritten/surface/audit.service.ts               |   576 ++
 backend/domains/dashboard/monitor/src/handwritten/surface/catalog.controller.ts          |   651 +++
 backend/domains/dashboard/monitor/src/handwritten/surface/catalog.service.ts             |   810 +++
 backend/domains/dashboard/monitor/src/handwritten/surface/dto.ts                         |   315 ++
 backend/domains/dashboard/monitor/src/handwritten/surface/duties.controller.ts           |   521 ++
 backend/domains/dashboard/monitor/src/handwritten/surface/export.service.ts              |   863 +++
 backend/domains/dashboard/monitor/src/handwritten/surface/exports.controller.ts          |    85 +
 backend/domains/dashboard/monitor/src/handwritten/surface/index.ts                       |   155 +
 backend/domains/dashboard/monitor/src/handwritten/surface/layer-gate.ts                  |   661 +++
 backend/domains/dashboard/monitor/src/handwritten/surface/open-data.controller.ts        |   104 +
 backend/domains/dashboard/monitor/src/handwritten/surface/open-data.service.ts           |   251 +
 backend/domains/dashboard/monitor/src/handwritten/surface/report.service.ts              |   254 +
 backend/domains/dashboard/monitor/src/handwritten/surface/sources.controller.ts          |   194 +
 backend/domains/dashboard/monitor/src/handwritten/surface/suppression.ts                 |   108 +
 backend/domains/dashboard/monitor/src/handwritten/surface/watermark.ts                   |    85 +
 backend/domains/dashboard/monitor/src/index.ts                                           |    14 +-
 backend/domains/dashboard/monitor/src/monitor.module.ts                                  |    52 +-
 backend/domains/dashboard/monitor/tests/fixtures/cycle-fixtures.ts                       |   639 +++
 .../domains/dashboard/monitor/tests/integration/cycle-alert-commands.integration.spec.ts |   638 +++
 .../domains/dashboard/monitor/tests/integration/cycle-alert-matrix.integration.spec.ts   |   645 +++
 backend/domains/dashboard/monitor/tests/integration/cycle-detector.integration.spec.ts   |   753 +++
 backend/domains/dashboard/monitor/tests/integration/cycle-duties.integration.spec.ts     |  1040 ++++
 backend/domains/dashboard/monitor/tests/integration/cycle-events.integration.spec.ts     |   317 ++
 backend/domains/dashboard/monitor/tests/integration/cycle-freshness.integration.spec.ts  |   406 ++
 backend/domains/dashboard/monitor/tests/integration/cycle-sweeper.integration.spec.ts    |   823 +++
 .../domains/dashboard/monitor/tests/integration/surface-access-log.integration.spec.ts   |   143 +
 .../domains/dashboard/monitor/tests/integration/surface-suppression.integration.spec.ts  |   185 +
 .../domains/dashboard/monitor/tests/integration/surface-watermark.integration.spec.ts    |   101 +
 backend/domains/dashboard/monitor/tests/support/cycle-harness.ts                         |   956 ++++
 backend/domains/dashboard/monitor/tests/unit/cycle-clock.spec.ts                         |   226 +
 backend/domains/dashboard/monitor/tests/unit/cycle-duty-rules.spec.ts                    |   169 +
 backend/domains/dashboard/monitor/tests/unit/cycle-freshness.spec.ts                     |   194 +
 backend/domains/dashboard/monitor/tests/unit/cycle-transitions.spec.ts                   |   246 +
 backend/domains/dashboard/monitor/tests/unit/module-surface.spec.ts                      |    67 +-
 backend/domains/dashboard/monitor/tests/unit/surface-dto.spec.ts                         |   354 ++
 backend/domains/dashboard/monitor/tests/unit/surface-layer-gate.spec.ts                  |   129 +
 backend/domains/dashboard/monitor/tests/unit/surface-suppression.spec.ts                 |   190 +
 backend/domains/dashboard/monitor/tests/unit/surface-watermark.spec.ts                   |    77 +
 backend/domains/dashboard/monitor/vitest.config.ts                                       |     6 +
 .../domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts    |    86 +-
 backend/domains/ops/parameter/src/generated/parameter-catalogue.ts                       |    35 +-
 backend/domains/ops/provisioning/package.json                                            |    37 -
 backend/domains/ops/provisioning/src/controllers/device-key.controller.ts                |    25 -
 backend/domains/ops/provisioning/src/controllers/device-revocation.controller.ts         |    25 -
 .../domains/ops/provisioning/src/controllers/offline-authorization-grant.controller.ts   |    25 -
 .../ops/provisioning/src/controllers/provisioning-command-idempotency.controller.ts      |    21 -
 .../provisioning/src/controllers/provisioning-grant-reservation-binding.controller.ts    |    21 -
 backend/domains/ops/provisioning/src/controllers/provisioning-package.controller.ts      |    25 -
 backend/domains/ops/provisioning/src/controllers/provisioning-receipt.controller.ts      |    25 -
 .../domains/ops/provisioning/src/controllers/provisioning-reconciliation.controller.ts   |    19 -
 backend/domains/ops/provisioning/src/dto/create-device-key.dto.ts                        |    13 -
 backend/domains/ops/provisioning/src/dto/create-device-revocation.dto.ts                 |     9 -
 backend/domains/ops/provisioning/src/dto/create-offline-authorization-grant.dto.ts       |    28 -
 backend/domains/ops/provisioning/src/dto/create-provisioning-command-idempotency.dto.ts  |     9 -
 .../ops/provisioning/src/dto/create-provisioning-grant-reservation-binding.dto.ts        |     9 -
 backend/domains/ops/provisioning/src/dto/create-provisioning-package.dto.ts              |    20 -
 backend/domains/ops/provisioning/src/dto/create-provisioning-receipt.dto.ts              |    12 -
 backend/domains/ops/provisioning/src/dto/create-provisioning-reconciliation.dto.ts       |    11 -
 backend/domains/ops/provisioning/src/entities/device-key.entity.ts                       |    17 -
 backend/domains/ops/provisioning/src/entities/device-revocation.entity.ts                |    13 -
 backend/domains/ops/provisioning/src/entities/offline-authorization-grant.entity.ts      |    32 -
 backend/domains/ops/provisioning/src/entities/provisioning-command-idempotency.entity.ts |    13 -
 .../ops/provisioning/src/entities/provisioning-grant-reservation-binding.entity.ts       |    13 -
 backend/domains/ops/provisioning/src/entities/provisioning-package.entity.ts             |    24 -
 backend/domains/ops/provisioning/src/entities/provisioning-receipt.entity.ts             |    16 -
 backend/domains/ops/provisioning/src/entities/provisioning-reconciliation.entity.ts      |    15 -
 backend/domains/ops/provisioning/src/handwritten/create-key-challenge.command.ts         |    14 -
 .../domains/ops/provisioning/src/handwritten/download-provisioning-package.command.ts    |    14 -
 backend/domains/ops/provisioning/src/handwritten/issue-provisioning-package.command.ts   |    14 -
 backend/domains/ops/provisioning/src/handwritten/provisioning.contract.ts                |   199 -
 backend/domains/ops/provisioning/src/handwritten/provisioning.controller.ts              |   213 -
 backend/domains/ops/provisioning/src/handwritten/provisioning.engine.ts                  |  1148 ----
 backend/domains/ops/provisioning/src/handwritten/provisioning.provider.ts                |   172 -
 backend/domains/ops/provisioning/src/handwritten/provisioning.readiness.ts               |     8 -
 backend/domains/ops/provisioning/src/handwritten/provisioning.red.spec.ts                |    43 -
 backend/domains/ops/provisioning/src/handwritten/reconcile-offline-grant.command.ts      |    14 -
 backend/domains/ops/provisioning/src/handwritten/record-provisioning-receipt.command.ts  |    14 -
 backend/domains/ops/provisioning/src/handwritten/register-device-key.command.ts          |    14 -
 backend/domains/ops/provisioning/src/handwritten/revoke-offline-grant.command.ts         |    14 -
 backend/domains/ops/provisioning/src/index.ts                                            |    53 -
 backend/domains/ops/provisioning/src/provisioning.module.ts                              |    62 -
 backend/domains/ops/provisioning/src/repositories/device-key.repository.ts               |   127 -
 backend/domains/ops/provisioning/src/repositories/device-revocation.repository.ts        |   130 -
 .../domains/ops/provisioning/src/repositories/offline-authorization-grant.repository.ts  |   151 -
 .../ops/provisioning/src/repositories/provisioning-command-idempotency.repository.ts     |   141 -
 .../provisioning/src/repositories/provisioning-grant-reservation-binding.repository.ts   |   143 -
 backend/domains/ops/provisioning/src/repositories/provisioning-package.repository.ts     |   142 -
 backend/domains/ops/provisioning/src/repositories/provisioning-receipt.repository.ts     |   134 -
 .../domains/ops/provisioning/src/repositories/provisioning-reconciliation.repository.ts  |   139 -
 backend/domains/ops/provisioning/src/services/device-key.service.ts                      |    25 -
 backend/domains/ops/provisioning/src/services/device-revocation.service.ts               |    28 -
 backend/domains/ops/provisioning/src/services/offline-authorization-grant.service.ts     |    32 -
 .../domains/ops/provisioning/src/services/provisioning-command-idempotency.service.ts    |    32 -
 .../ops/provisioning/src/services/provisioning-grant-reservation-binding.service.ts      |    32 -
 backend/domains/ops/provisioning/src/services/provisioning-package.service.ts            |    28 -
 backend/domains/ops/provisioning/src/services/provisioning-receipt.service.ts            |    28 -
 backend/domains/ops/provisioning/src/services/provisioning-reconciliation.service.ts     |    32 -
 backend/domains/ops/provisioning/tests/e2e/provisioning.e2e.spec.ts                      |   140 -
 backend/domains/ops/provisioning/tests/integration/harness.ts                            |   659 ---
 .../ops/provisioning/tests/integration/provisioning-amendment3.integration.spec.ts       |   690 ---
 .../ops/provisioning/tests/integration/provisioning-amendment4.integration.spec.ts       |   724 ---
 .../domains/ops/provisioning/tests/integration/provisioning-behavior.integration.spec.ts |  1272 -----
 backend/domains/ops/provisioning/tests/integration/provisioning.integration.spec.ts      |   138 -
 backend/domains/ops/provisioning/tests/integration/tsconfig.fresh-process.json           |     9 -
 backend/domains/ops/provisioning/tsconfig.build.json                                     |    11 -
 backend/domains/ops/provisioning/tsconfig.json                                           |    14 -
 backend/domains/ops/provisioning/vitest.config.ts                                        |    26 -
 backend/domains/shared/src/policy.spec.ts                                                |   111 -
 backend/domains/shared/src/policy.ts                                                     |    78 -
 docs/framework/arch/dashboard-build-pack.md                                              |   133 +-
 docs/framework/arch/dashboard-route-contract.md                                          |    30 +-
 docs/framework/arch/parameter-catalogue.md                                               |    37 +-
 docs/framework/arch/rait-build-pack.md                                                   |     2 +-
 docs/framework/blueprints/BP-DASH-MONITOR-001.json                                       |   332 +-
 docs/framework/blueprints/BP-OPS-PROVISIONING-001.json                                   |   423 --
 docs/framework/blueprints/module-blueprint.schema.json                                   |    43 -
 docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json                       | 11606 +++++++++++++++++++++++++++++++++++++++++
 docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json                   |  1475 ------
 docs/framework/contracts/BP-OPS-PROVISIONING-001.openapi.json                            |  1432 -----
 docs/framework/contracts/dashboard-feeds/adapter.md                                      |    91 +
 docs/framework/contracts/dashboard-feeds/pec.md                                          |   103 +
 docs/framework/contracts/dashboard-feeds/portal.md                                       |    97 +
 docs/framework/contracts/dashboard-feeds/teat.md                                         |    99 +
 docs/framework/schemas/README.md                                                         |     6 +
 docs/framework/schemas/events/dashboard.alert.changed.schema.json                        |   148 +
 docs/framework/schemas/events/dashboard.duty.changed.schema.json                         |   100 +
 docs/framework/schemas/events/dashboard.export.registered.schema.json                    |   101 +
 docs/framework/schemas/events/dashboard.indicator-config.changed.schema.json             |    81 +
 docs/framework/schemas/events/dashboard.report.changed.schema.json                       |    94 +
 docs/framework/schemas/events/dashboard.source.freshness.schema.json                     |    97 +
 docs/meta/adr/ADR-0020-read-models-and-projections.md                                    |     2 +
 docs/meta/adr/ADR-0028-devai-1-5-2-attested-local-rc.md                                  |     7 +-
 docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md                            |   172 -
 docs/meta/adr/README.md                                                                  |     1 -
 docs/meta/agents/orchestra/README.md                                                     |    66 +
 docs/meta/agents/orchestra/waves.md                                                      |    64 +-
 docs/meta/knowledge-base/backlog.md                                                      |    24 +-
 docs/start/index.md                                                                      |     2 +-
 package.json                                                                             |    13 +-
 pnpm-lock.yaml                                                                           |    64 +-
 tools/blueprints/generate.mjs                                                            |    32 +-
 tools/blueprints/generated-files.json                                                    |    57 +-
 tools/contracts/check-commands.mjs                                                       |    25 +-
 tools/contracts/generate-openapi.mjs                                                     |     7 +-
 tools/contracts/tests/check-commands.dashboard.test.mjs                                  |   660 +++
 tools/contracts/tests/check-commands.test.mjs                                            |    18 +-
 tools/contracts/tests/provisioning-commands.test.mjs                                     |   160 -
 323 files changed, 40744 insertions(+), 28701 deletions(-)
```

Arquivos a julgar com prioridade: `docs/framework/blueprints/BP-DASH-MONITOR-001.json` (1.1.0),
`backend/database/ddl/19-dashboard-lifecycle-vocabulary.sql` (`escalation_chain_ref`),
`backend/domains/dashboard/monitor/src/handwritten/cycle/**`, `surface/**`, `backend/app/src/dashboard-*.ts`,
`backend/app/src/app.module.ts`, `backend/domains/dashboard/monitor/tests/**` (cycle-_, surface-_),
`backend/app/tests/e2e/dashboard-*`, `docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json`,
`docs/framework/schemas/events/dashboard.*.schema.json`, `docs/framework/contracts/dashboard-feeds/*.md`,
`tools/contracts/check-commands.mjs` (+ `tests/check-commands.dashboard.test.mjs`, `C-5-16` 195),
`docs/framework/arch/{dashboard-build-pack,dashboard-route-contract,parameter-catalogue}.md`,
`backend/database/seed/05-parameters.sql` (gerado por `parameters:generate`), `docs/meta/agents/orchestra/{waves,README}.md`,
`docs/meta/knowledge-base/backlog.md`.
Fontes: `dashboard-route-contract.md` §1–§8; `dashboard-error-catalog.md`; [WF-DASH-001…003]; [RN-DASH-101/151/161/170/171/172];
[WF-RAIT-002] §4.1/§6; `rait-events-sse-contract.md` §1/§3; `parameter-catalogue.md` §DASHBOARD e §Contrato de geração;
steering §H (H.54); `policy.ts` (`DASHBOARD_RULES`, `GLOBAL_ADMIN_ROLES`, `dashboardLayerFor`); `docs/meta/agents/orchestra/README.md`
§4 (itens 3, 4, 5, 8, 13, 14, 16, 17, 18).
