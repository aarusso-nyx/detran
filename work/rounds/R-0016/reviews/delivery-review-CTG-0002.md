# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `dashboard-console` (rodada `R-0016`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/dashboard-build-pack.md` — apenas a seção do WP `WP-D4, WP-D5` e o "mapa entregável → definições"
4. `work/rounds/R-0016/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0016/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0016/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0016",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0016/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo — exaustivo.** Entrega do **CTG-0002** de R-0016 (`dashboard-console`, WP-D5): o
console `apps/dashboard/web` (`@detran/dashboard-web`) em **nível L0**, construído contra
`work/rounds/R-0016/contracts/CTG-0002.md` §Decisões e §1–§14 (Architect, TASK-0008), com os 94
critérios `C-02-01…94` do §13 codificados pelo Inspector (TASK-0004) **antes** dos Engineers
(TASK-0005 app, TASK-0006 `forms/`), tríade da adenda A5.

Estado medido pelo maestro **depois** de integrar `origin/main` por merge (114 commits; conflitos
de `package.json` — as três triplas de app coexistem — e de `record/proofs/chain.json` — aceita a
versão de `main`, evidência regravada):

- `pnpm --filter @detran/dashboard-web test` → **2042/2042 verdes**; `tsc -p tsconfig.app.json` e
  `-p tsconfig.spec.json` → 0 erros; `lint` → 0; `build` → OK (dist/, orçamentos respeitados).
- `pnpm check` (raiz, 22 scripts incluindo as três triplas de app) → **verde** antes do merge de
  `main`; reexecutando após o merge (resultado no PR).
- i18n do app = semente byte a byte (307 chaves); `verify:parameter-catalogue` → `OK (… 43 i18n
namespaces, 0 errors)`.

O que **não** é achado (registrado em `plan.md`): (a) **nível L0** por A5/§Decisões 6 — nenhuma
feature usa `HttpClient`, nenhuma página renderiza dado de backend; as 18 telas mostram título,
`intro` e `dashboard.states.unavailable_in_version` citando R-0011, e os seis estados são
provados por um `ScreenState` de entrada. R-0011 mesclou **enquanto esta CTG era revisada** (o
merge de `main` acima já traz `BP-DASH-MONITOR-001.commands.openapi.json`, os clientes gerados e o
seed dos 42): a subida a L2 é o CTG seguinte desta mesma rodada, não um buraco desta entrega.
(b) **Adendas A7 e A8** — contradições entre critérios (dedup de SSE, `reconnecting`×`polling`,
`export:create`×AUDITOR, `duty-cycle:archive`×`dash-duty-owner`, `{decision}` renderizado,
`completeLogin`) resolvidas pelo Architect **antes** da iteração 2 do Inspector, com `policy.ts`
prevalecendo (A1); o agregador `forms/index.ts` isento da regra de folha que vale para os 9
schemas; dois comentários de produção reescritos para não colidirem com os sensores literais
C-02-24/C-02-75. (c) **Alternativas pré-autorizadas** do contrato §4/§14.2 aplicadas e declaradas:
`*dashCan` no lugar de `*stynxHasPermission` (OD-D16-015), `authGuard` local (stub do kit sem
`snapshot()`), menu no slot `[detran-sidenav-footer]` (OD-D16-014). (d) `forms/` é folha: os
`PURPOSE_TOKENS` passaram a viver em `forms/form-gate.ts` (correção do maestro como Engineer,
§Triagem). (e) OD-D16-012…026 propostas, nenhuma decidida.

Relatórios: `work/rounds/R-0016/reports/TASK-0008.md`, `TASK-0004.md`, `TASK-0004-iteration-2.md`,
`TASK-0005.md`, `TASK-0006.md`. Plano: `work/rounds/R-0016/plan.md` (M1–M9, A1–A8, §Triagem).

### `git diff origin/main --stat -- apps/dashboard/web package.json`

```text
 apps/dashboard/web/README.md                       | 117 +++-
 apps/dashboard/web/angular.json                    |  78 +++
 apps/dashboard/web/eslint.config.js                |  51 ++
 apps/dashboard/web/package.json                    |  48 ++
 apps/dashboard/web/public/runtime-config.js        |   8 +
 .../web/src/app/app.command-matrix.spec.ts         |  46 ++
 apps/dashboard/web/src/app/app.component.ts        |  11 +
 .../web/src/app/app.guards-matrix.absence.spec.ts  |  46 ++
 .../src/app/app.guards-matrix.anonymous.spec.ts    |  41 ++
 .../web/src/app/app.guards-matrix.presence.spec.ts |  46 ++
 .../web/src/app/app.guards-matrix.session.spec.ts  |  96 +++
 .../web/src/app/app.route-manifest.spec.ts         | 268 ++++++++
 apps/dashboard/web/src/app/app.route-manifest.ts   | 703 ++++++++++++++++++++
 apps/dashboard/web/src/app/app.routes.spec.ts      | 162 +++++
 apps/dashboard/web/src/app/app.routes.ts           | 109 ++++
 apps/dashboard/web/src/app/app.scaffold.spec.ts    | 162 +++++
 apps/dashboard/web/src/app/core/can.directive.ts   |  39 ++
 apps/dashboard/web/src/app/core/command-notice.ts  |  29 +
 .../src/app/core/dashboard-shell.component.spec.ts | 301 +++++++++
 .../web/src/app/core/dashboard-shell.component.ts  | 206 ++++++
 .../web/src/app/core/error-banner.component.ts     |  62 ++
 .../web/src/app/core/error-boundary.spec.ts        | 299 +++++++++
 apps/dashboard/web/src/app/core/error-boundary.ts  | 310 +++++++++
 apps/dashboard/web/src/app/core/error-codes.ts     |  75 +++
 apps/dashboard/web/src/app/core/freshness.store.ts | 109 ++++
 apps/dashboard/web/src/app/core/guards.spec.ts     | 195 ++++++
 .../web/src/app/core/guards/auth.guard.ts          |  22 +
 apps/dashboard/web/src/app/core/guards/index.ts    |   8 +
 .../web/src/app/core/guards/layer.guard.ts         |  31 +
 .../web/src/app/core/guards/permission.guard.ts    |  36 ++
 apps/dashboard/web/src/app/core/i18n-fallback.ts   |  46 ++
 apps/dashboard/web/src/app/core/i18n-token-key.ts  |  20 +
 .../interceptors/freshness.interceptor.spec.ts     | 166 +++++
 .../app/core/interceptors/freshness.interceptor.ts |  81 +++
 .../dashboard/web/src/app/core/layer-table.spec.ts |  80 +++
 apps/dashboard/web/src/app/core/layer-table.ts     |  67 ++
 apps/dashboard/web/src/app/core/manifest-routes.ts |  97 +++
 .../src/app/core/pages/auth-callback.page.spec.ts  |  95 +++
 .../web/src/app/core/pages/auth-callback.page.ts   |  62 ++
 .../web/src/app/core/pages/forbidden.page.spec.ts  |  56 ++
 .../web/src/app/core/pages/forbidden.page.ts       |  43 ++
 .../web/src/app/core/pages/unavailable.page.ts     |  27 +
 apps/dashboard/web/src/app/core/runtime-config.ts  |  38 ++
 .../web/src/app/core/screen-frame.component.ts     | 178 ++++++
 .../web/src/app/core/session.facade.spec.ts        |  94 +++
 apps/dashboard/web/src/app/core/session.facade.ts  | 110 ++++
 .../web/src/app/core/sse/sse.service.spec.ts       | 293 +++++++++
 apps/dashboard/web/src/app/core/sse/sse.service.ts | 343 ++++++++++
 .../web/src/app/core/sse/stream-transport.ts       | 146 +++++
 apps/dashboard/web/src/app/core/title.strategy.ts  |  20 +
 .../web/src/app/features/audit/audit.routes.ts     |   8 +
 .../features/audit/pages/auditoria.page.spec.ts    | 148 +++++
 .../src/app/features/audit/pages/auditoria.page.ts | 136 ++++
 .../src/app/features/catalogue/catalogue.routes.ts |  15 +
 .../features/catalogue/pages/frescor.page.spec.ts  |  84 +++
 .../app/features/catalogue/pages/frescor.page.ts   |  48 ++
 .../catalogue/pages/indicadores.page.spec.ts       | 126 ++++
 .../features/catalogue/pages/indicadores.page.ts   | 152 +++++
 .../app/features/catalogue/pages/kpis.page.spec.ts |  83 +++
 .../src/app/features/catalogue/pages/kpis.page.ts  |  65 ++
 .../app/features/comparison/comparison.routes.ts   |   8 +
 .../comparison/pages/comparativo.page.spec.ts      | 143 +++++
 .../features/comparison/pages/comparativo.page.ts  | 141 ++++
 .../web/src/app/features/crashes/crashes.routes.ts |   8 +
 .../features/crashes/pages/sinistros.page.spec.ts  |  92 +++
 .../app/features/crashes/pages/sinistros.page.ts   |  66 ++
 .../web/src/app/features/duties/duties.routes.ts   |  12 +
 .../pages/deveres-id-ciclos-period.page.spec.ts    | 132 ++++
 .../duties/pages/deveres-id-ciclos-period.page.ts  | 133 ++++
 .../app/features/duties/pages/deveres.page.spec.ts |  88 +++
 .../src/app/features/duties/pages/deveres.page.ts  |  84 +++
 .../features/integrations/integrations.routes.ts   |  12 +
 .../pages/integracoes-system.page.spec.ts          | 117 ++++
 .../integrations/pages/integracoes-system.page.ts  | 123 ++++
 .../integrations/pages/integracoes.page.spec.ts    |  78 +++
 .../integrations/pages/integracoes.page.ts         |  78 +++
 .../features/radar/pages/radar-pec.page.spec.ts    | 133 ++++
 .../src/app/features/radar/pages/radar-pec.page.ts | 104 +++
 .../features/radar/pages/radar-rait.page.spec.ts   | 104 +++
 .../app/features/radar/pages/radar-rait.page.ts    |  94 +++
 .../features/radar/pages/radar-teat.page.spec.ts   |  91 +++
 .../app/features/radar/pages/radar-teat.page.ts    |  89 +++
 .../web/src/app/features/radar/radar.routes.ts     |  12 +
 .../transparency/pages/transparencia.page.spec.ts  | 142 ++++
 .../transparency/pages/transparencia.page.ts       | 105 +++
 .../features/transparency/transparency.routes.ts   |  10 +
 .../features/triage/pages/alertas-id.page.spec.ts  | 220 +++++++
 .../app/features/triage/pages/alertas-id.page.ts   | 152 +++++
 .../app/features/triage/pages/triagem.page.spec.ts | 163 +++++
 .../src/app/features/triage/pages/triagem.page.ts  |  59 ++
 .../web/src/app/features/triage/triage.routes.ts   |  10 +
 .../web/src/app/forms/ack-alerta.schema.spec.ts    |  31 +
 .../web/src/app/forms/ack-alerta.schema.ts         |  30 +
 .../forms/auditoria-transparencia.schema.spec.ts   |  36 ++
 .../app/forms/auditoria-transparencia.schema.ts    |  28 +
 .../web/src/app/forms/avancar-ciclo.schema.spec.ts | 104 +++
 .../web/src/app/forms/avancar-ciclo.schema.ts      | 142 ++++
 .../web/src/app/forms/causa-raiz.schema.spec.ts    |  25 +
 .../web/src/app/forms/causa-raiz.schema.ts         |  22 +
 .../app/forms/configurar-indicador.schema.spec.ts  |  63 ++
 .../src/app/forms/configurar-indicador.schema.ts   |  42 ++
 .../src/app/forms/encerrar-alerta.schema.spec.ts   |  24 +
 .../web/src/app/forms/encerrar-alerta.schema.ts    |  23 +
 .../web/src/app/forms/exportar.schema.spec.ts      |  78 +++
 .../dashboard/web/src/app/forms/exportar.schema.ts |  30 +
 .../web/src/app/forms/finalidade-n2.schema.spec.ts |  34 +
 .../web/src/app/forms/finalidade-n2.schema.ts      |  30 +
 apps/dashboard/web/src/app/forms/form-gate.ts      |  65 ++
 apps/dashboard/web/src/app/forms/index.ts          |  49 ++
 .../web/src/app/forms/schemas-matrix.spec.ts       | 123 ++++
 .../app/forms/solicitar-relatorio.schema.spec.ts   |  23 +
 .../src/app/forms/solicitar-relatorio.schema.ts    |  23 +
 .../web/src/app/i18n/dashboard.pt-BR.json          | 309 +++++++++
 apps/dashboard/web/src/app/i18n/i18n.spec.ts       | 247 +++++++
 apps/dashboard/web/src/app/screens/screens.spec.ts |  78 +++
 .../src/app/shared/alert-card.component.spec.ts    | 155 +++++
 .../web/src/app/shared/alert-card.component.ts     | 115 ++++
 .../app/shared/alert-lifecycle.component.spec.ts   | 110 ++++
 .../src/app/shared/alert-lifecycle.component.ts    | 103 +++
 .../shared/classification-badge.component.spec.ts  |  70 ++
 .../app/shared/classification-badge.component.ts   |  33 +
 .../shared/clock-governor-badge.component.spec.ts  |  66 ++
 .../app/shared/clock-governor-badge.component.ts   |  35 +
 .../app/shared/deep-link-button.component.spec.ts  |  64 ++
 .../src/app/shared/deep-link-button.component.ts   |  39 ++
 .../shared/distribution-chart.component.spec.ts    | 112 ++++
 .../src/app/shared/distribution-chart.component.ts | 150 +++++
 .../src/app/shared/duty-calendar.component.spec.ts | 157 +++++
 .../web/src/app/shared/duty-calendar.component.ts  | 167 +++++
 .../shared/duty-cycle-stepper.component.spec.ts    |  99 +++
 .../src/app/shared/duty-cycle-stepper.component.ts | 103 +++
 .../app/shared/evidence-attach.component.spec.ts   | 153 +++++
 .../src/app/shared/evidence-attach.component.ts    | 123 ++++
 .../src/app/shared/export-dialog.component.spec.ts | 164 +++++
 .../web/src/app/shared/export-dialog.component.ts  | 238 +++++++
 .../app/shared/freshness-seal.component.spec.ts    | 178 ++++++
 .../web/src/app/shared/freshness-seal.component.ts | 104 +++
 .../src/app/shared/layer-gate.component.spec.ts    | 144 +++++
 .../web/src/app/shared/layer-gate.component.ts     | 125 ++++
 .../app/shared/legal-basis-tag.component.spec.ts   |  36 ++
 .../src/app/shared/legal-basis-tag.component.ts    |  13 +
 apps/dashboard/web/src/app/shared/models.ts        | 261 ++++++++
 apps/dashboard/web/src/app/shared/screen-state.ts  |  48 ++
 .../src/app/shared/severity-chip.component.spec.ts |  94 +++
 .../web/src/app/shared/severity-chip.component.ts  |  91 +++
 .../shared/source-status-table.component.spec.ts   | 107 ++++
 .../app/shared/source-status-table.component.ts    |  88 +++
 .../app/shared/suppressed-cell.component.spec.ts   |  78 +++
 .../src/app/shared/suppressed-cell.component.ts    |  42 ++
 .../app/shared/target-vs-ceiling.component.spec.ts | 140 ++++
 .../src/app/shared/target-vs-ceiling.component.ts  |  72 +++
 apps/dashboard/web/src/index.html                  |  17 +
 apps/dashboard/web/src/main.ts                     |  50 ++
 apps/dashboard/web/src/styles.css                  |  17 +
 apps/dashboard/web/src/test-setup.ts               |  14 +
 .../web/src/testing/a11y-state.spec-helper.ts      |  74 +++
 .../web/src/testing/command-matrix.fixture.ts      |  77 +++
 .../dashboard/web/src/testing/i18n-test-catalog.ts |  35 +
 apps/dashboard/web/src/testing/kb.ts               | 165 +++++
 .../web/src/testing/layer-table.fixture.ts         |  68 ++
 apps/dashboard/web/src/testing/roles.fixture.ts    |  90 +++
 .../web/src/testing/route-manifest.fixture.ts      | 712 +++++++++++++++++++++
 apps/dashboard/web/src/testing/router-harness.ts   |  95 +++
 .../web/src/testing/stream-transport.stub.ts       |  39 ++
 .../web/src/testing/stynx-session.stub.ts          | 111 ++++
 apps/dashboard/web/tsconfig.app.json               |  14 +
 apps/dashboard/web/tsconfig.json                   |  25 +
 apps/dashboard/web/tsconfig.spec.json              |  12 +
 apps/dashboard/web/vitest.config.ts                |  71 ++
 package.json                                       |   2 +-
 170 files changed, 16659 insertions(+), 9 deletions(-)
```

O diff completo tem ~670 KB (170 arquivos, +16 659 linhas) e **não** é anexado inline: leia os
arquivos na worktree. Roteiro sugerido, por risco: `apps/dashboard/web/src/main.ts`;
`src/app/{app.route-manifest.ts,app.routes.ts}`; `src/app/core/{session.facade.ts,layer-table.ts,can.directive.ts}`
e `core/guards/*.ts` (matriz de política × camada, passe global); `core/interceptors/freshness.interceptor.ts`
e `core/sse/sse.service.ts`; `core/error-boundary.ts`; `src/app/shared/{severity-chip,suppressed-cell,freshness-seal,distribution-chart,target-vs-ceiling}.component.ts`;
duas páginas quaisquer de `src/app/features/*/pages/`; `src/app/forms/{form-gate.ts,avancar-ciclo.schema.ts,exportar.schema.ts}`;
e, do lado do Inspector, `src/testing/{route-manifest.fixture.ts,command-matrix.fixture.ts,layer-table.fixture.ts}`,
`src/app/app.guards-matrix.*.spec.ts`, `src/app/app.command-matrix.spec.ts`, `src/app/screens/screens.spec.ts`,
`src/app/i18n/i18n.spec.ts`.

Fontes para conferir valores: `work/rounds/R-0016/{route-manifest.md,contracts/CTG-0001.md,contracts/CTG-0002.md}`;
`backend/domains/shared/src/policy.ts` (1508–1630, 1715–1730, 1790–1840, 1866–1921) e `roles.ts`;
`docs/framework/arch/{dashboard-frontends.md,dashboard-route-contract.md,dashboard-error-catalog.md,detran-ui-guide.md}`;
`docs/framework/arch/i18n/dashboard.pt-BR.json`; as 18 fichas `IU-DASH-D-01…D-18`;
`docs/meta/agents/engineer-frontend.md` §Padrão de app.
