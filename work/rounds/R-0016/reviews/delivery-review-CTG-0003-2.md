# Prompt do reviewer — modo `delivery-review`

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

**Segundo ciclo — restrito** aos dois achados de
`work/rounds/R-0016/reviews/delivery-review-CTG-0003.json`. Achado novo sobre texto inalterado só
se for FAIL por definição.

1. **Achado 1 (§1, `backend/domains/dashboard`)**: a célula passou a registrar o CTG-0002 de R-0011
   como **mesclado em `main`** (PR #87, `3bb94351`; rodada fechada como **PC-0009**), preservando os
   detalhes técnicos. A mesma frase "PR a abrir" aparecia nos cabeçalhos de **§WP-D2 e §WP-D3** e
   recebeu a mesma correção, com a mesma tripla de dados (fonte: `waves.md` §Histórico, linha
   R-0011) — `grep "PR a abrir"` no arquivo agora é vazio.
2. **Achado 2 (§WP-D5, P-09/D-13)**: a afirmação de supressão "ativa" saiu. O texto agora diz que
   **D-13 é rota real** (ao contrário do texto original do WP, que a previa como placeholder), com
   o componente `SuppressedCell` e os critérios da ficha `IU-DASH-D-13` **preparados e provados em
   teste de componente**, e que a supressão primária **e** secundária **sobre dado real**, com o
   teste ponta a ponta, pertence à subida a **L2** já registrada no backlog; OD-D02/DT-029
   (`dashboard.cell_threshold=10`) permanece citada como a decisão que destravou a tela.

Gates reverificados pelo maestro após a correção: `node tools/docs/kb/check.mjs` →
`OK (756 artifacts, 446 canonical tokens)`; `pnpm docs:kb:publish-check` → OK; `pnpm format:check`
→ OK. O CI do PR #103 fechou **verde nos sete checks** no commit anterior a estes de documentação
(`43694534`: foundation 23m16s, backend-kernel 26m9s); o CI final roda sobre o push que inclui a
documentação.

### Diff das correções deste ciclo (`git diff 6e6947ca -- docs`)

```diff
diff --git a/docs/framework/arch/dashboard-build-pack.md b/docs/framework/arch/dashboard-build-pack.md
index 1ab62d0c..74c8f8cd 100644
--- a/docs/framework/arch/dashboard-build-pack.md
+++ b/docs/framework/arch/dashboard-build-pack.md
@@ -17,15 +17,15 @@ origem: `BP-BI-REPORTING-001`, grupo `bi` da matriz web do TEAT (`UX-WEB-090…0

 ## 1. Estado de partida (verificado em 2026-09-22)

-| Item                        | Situação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
-| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| `backend/domains/dashboard` | `BP-DASH-MONITOR-001` mesclado em `main` (R-0011 CTG-0001, PR #83, `e0763c6c`): estado próprio (`alert`, `duty` ×15, `duty_cycle`, `indicator` ×42, `indicator_config`, `bi_panel`, `generated_report`, `export_log`, `source`, `transparency_audit`, `dataset`), oito projetores manuscritos + `dashboard.crashes` (reaproveitada de R-0010) e DDL `19-dashboard-lifecycle-vocabulary.sql`/`80-dashboard.sql` (o texto original cita `50`, ocupado por `50-ch-telehealth.sql`); CTG-0002 (blueprint 1.1.0, ciclo do alerta, deveres, frescor, relógio próprio via M7/A3 até OD-D28, exportação, relatórios, auditoria, open-data, SSE, sete controllers manuscritos) pronto nesta worktree — PR a abrir (R-0011 CTG-0002) |
-| `apps/dashboard/web`        | `@detran/dashboard-web` entregue por R-0016 CTG-0002 (PR #103) em nível **L0**: 22 rotas no manifesto (20 + 2 filhas) sob `/monitoramento`, guardas `authGuard → permissionGuard(policy) → layerGuard(access)`, `core/layer-table.ts` como transcrição de `policy.ts` até OD-D16-006, shell com menu por camada (`navigationFor`), `freshnessInterceptor`, SSE com `Last-Event-ID` e polling de 30 s, `ErrorBoundary` único, 17 componentes de `shared/`, 18 páginas, 9 schemas de formulário e 2042 testes; as telas exibem `dashboard.states.unavailable_in_version` até a subida a L2 (facades e clientes gerados de `BP-DASH-MONITOR-001`), registrada como frente seguinte em `docs/meta/knowledge-base/backlog.md`   |
-| Política                    | `policy.ts` bloco `DASHBOARD_RULES` (R-0003, PR #32): 27 regras + 5 da origem, cobrindo alertas, deveres, fontes, exportação, trilha e os três recursos de origem; provado presença **e** ausência por `dashboard-policy.e2e.spec.ts` (R-0011 CTG-0002, TASK-0014/A23); `GLOBAL_ADMIN_ROLES` concede `'*'` por regra de plataforma (OD-D76)                                                                                                                                                                                                                                                                                                                                                                                |
-| Papéis                      | `dash-operator`, `dash-duty-owner` (R-0003, PR #32; ouvidor e financeiro recebem `dash-duty-owner`, H.38), `bi-analyst`, `agency-admin`, `technical-admin`, `integration-operator`, `AUDITOR` existem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
-| Eventos de origem           | RAIT: só `rait.case.changed\|admitted\|received\|withdrawn` e `rait.assignment.changed` têm produtor em `main` (`08fb84e8`); `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` **sem produtor** (OD-D17) — IND-DASH-101…105 nascem `connected = false`; PEC, TEAT, PORTAL sem contrato publicado (OD-D20/D21/D23); BOAT conectado via `dashboard.crashes` (R-0010, PR #71, `SINISTRO_*`)                                                                                                                                                                                                                                                                                                          |
-| Corpus                      | APP, WF-001…003, UC-001/002/003/004/006/008 `approved`; UC-005/007 `reviewed`; IU `reviewed`; 31 regras e 7 jornadas `draft`; DT-030 fechou 9 calibrações                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
-| Bloqueios                   | P-09 (DT-029) destravado com supressão secundária, mas `@detran/dashboard-crashes` ainda lê `CELL_THRESHOLD = 10` literal em vez de `dashboard.cell_threshold` (OD-D49, handoff a R-0010); parte de P-08 (DT-066); IND-DASH-204 nunca chega a `SUBMETIDO_PUBLICADO` enquanto a lacuna normativa persistir                                                                                                                                                                                                                                                                                                                                                                                                                  |
+| Item                        | Situação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
+| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| `backend/domains/dashboard` | `BP-DASH-MONITOR-001` mesclado em `main` (R-0011 CTG-0001, PR #83, `e0763c6c`): estado próprio (`alert`, `duty` ×15, `duty_cycle`, `indicator` ×42, `indicator_config`, `bi_panel`, `generated_report`, `export_log`, `source`, `transparency_audit`, `dataset`), oito projetores manuscritos + `dashboard.crashes` (reaproveitada de R-0010) e DDL `19-dashboard-lifecycle-vocabulary.sql`/`80-dashboard.sql` (o texto original cita `50`, ocupado por `50-ch-telehealth.sql`); CTG-0002 (blueprint 1.1.0, ciclo do alerta, deveres, frescor, relógio próprio via M7/A3 até OD-D28, exportação, relatórios, auditoria, open-data, SSE, sete controllers manuscritos) mesclado em `main` (R-0011 CTG-0002, PR #87, `3bb94351`; rodada fechada como PC-0009) |
+| `apps/dashboard/web`        | `@detran/dashboard-web` entregue por R-0016 CTG-0002 (PR #103) em nível **L0**: 22 rotas no manifesto (20 + 2 filhas) sob `/monitoramento`, guardas `authGuard → permissionGuard(policy) → layerGuard(access)`, `core/layer-table.ts` como transcrição de `policy.ts` até OD-D16-006, shell com menu por camada (`navigationFor`), `freshnessInterceptor`, SSE com `Last-Event-ID` e polling de 30 s, `ErrorBoundary` único, 17 componentes de `shared/`, 18 páginas, 9 schemas de formulário e 2042 testes; as telas exibem `dashboard.states.unavailable_in_version` até a subida a L2 (facades e clientes gerados de `BP-DASH-MONITOR-001`), registrada como frente seguinte em `docs/meta/knowledge-base/backlog.md`                                    |
+| Política                    | `policy.ts` bloco `DASHBOARD_RULES` (R-0003, PR #32): 27 regras + 5 da origem, cobrindo alertas, deveres, fontes, exportação, trilha e os três recursos de origem; provado presença **e** ausência por `dashboard-policy.e2e.spec.ts` (R-0011 CTG-0002, TASK-0014/A23); `GLOBAL_ADMIN_ROLES` concede `'*'` por regra de plataforma (OD-D76)                                                                                                                                                                                                                                                                                                                                                                                                                 |
+| Papéis                      | `dash-operator`, `dash-duty-owner` (R-0003, PR #32; ouvidor e financeiro recebem `dash-duty-owner`, H.38), `bi-analyst`, `agency-admin`, `technical-admin`, `integration-operator`, `AUDITOR` existem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
+| Eventos de origem           | RAIT: só `rait.case.changed\|admitted\|received\|withdrawn` e `rait.assignment.changed` têm produtor em `main` (`08fb84e8`); `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` **sem produtor** (OD-D17) — IND-DASH-101…105 nascem `connected = false`; PEC, TEAT, PORTAL sem contrato publicado (OD-D20/D21/D23); BOAT conectado via `dashboard.crashes` (R-0010, PR #71, `SINISTRO_*`)                                                                                                                                                                                                                                                                                                                                           |
+| Corpus                      | APP, WF-001…003, UC-001/002/003/004/006/008 `approved`; UC-005/007 `reviewed`; IU `reviewed`; 31 regras e 7 jornadas `draft`; DT-030 fechou 9 calibrações                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
+| Bloqueios                   | P-09 (DT-029) destravado com supressão secundária, mas `@detran/dashboard-crashes` ainda lê `CELL_THRESHOLD = 10` literal em vez de `dashboard.cell_threshold` (OD-D49, handoff a R-0010); parte de P-08 (DT-066); IND-DASH-204 nunca chega a `SUBMETIDO_PUBLICADO` enquanto a lacuna normativa persistir                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

 ## 2. Pacotes de trabalho

@@ -59,7 +59,7 @@ frescor, exportação pendente de aprovação. Gate: `blueprints:check`, `verify
 `verify:domain-boundaries` (nenhuma leitura de `inf.*`, `est.*`, `ch.*`, `portal.*` fora de
 `*.projection.ts`), seeds em banco limpo; DDL `50-dashboard.sql` em `apply.sh`.

-### WP-D2 — Ciclo do alerta, deveres, frescor e exportação (Engineer-backend) — **executado nesta worktree** (`R-0011` CTG-0002, PR a abrir)
+### WP-D2 — Ciclo do alerta, deveres, frescor e exportação (Engineer-backend) — **executado** (`R-0011` CTG-0002, PR #87, `3bb94351`, mesclado em `main`; rodada fechada como PC-0009)

 Executado com estas diferenças em relação ao texto abaixo: o motor de prazos com `owner='dashboard'` citado no §WP-D1 original **não** foi tocado (R-0007 CTG-0003 ainda não mesclou `main`); por decisão do Owner (Emenda 2 de `AUTHORIZATION.md`, via M7/A3), o pacote mantém **relógio próprio** (`DashboardClockService`/`DashboardClockSweeper`, entidade `dashboard.timer`) usando `Calendar`/`Clock` de `@detran/inf-deadlines` só como dependência de leitura; a integração ao motor de prazos fica para depois de R-0007 CTG-0003 (OD-D28). Sete controllers manuscritos (`DashboardAlertsController`, `DashboardDutiesController`, `DashboardCatalogController`, `DashboardSourcesController`, `DashboardExportsController`, `DashboardAuditController`, `DashboardOpenDataController`) e SSE (`backend/app/src/dashboard-stream.{service,controller}.ts`) no padrão `portal-stream`.

@@ -73,7 +73,7 @@ de [RN-DASH-172] e supressão de célula primária e secundária ([RN-DASH-161])
 com marca d'água; SSE. Gate: matriz de transições de WF-DASH-001/002/003, teste "nenhuma rota
 altera domínio", teste de camada (N3 sempre 403), teste de supressão secundária, e2e de escalonamento.

-### WP-D3 — Payloads e contratos (Transcriber-docs) — **executado nesta worktree** (`R-0011` CTG-0002, TASK-0006, PR a abrir)
+### WP-D3 — Payloads e contratos (Transcriber-docs) — **executado** (`R-0011` CTG-0002, TASK-0006, PR #87, `3bb94351`, mesclado em `main`; rodada fechada como PC-0009)

 Executado como descrito: `BP-DASH-MONITOR-001.commands.openapi.json` (43 operações), um schema por `type` publicado em `docs/framework/schemas/events/` para os seis eventos do DASHBOARD, e as quatro propostas em `docs/framework/contracts/dashboard-feeds/{pec,teat,portal,adapter}.md` com exemplos de fixtures.

@@ -115,11 +115,14 @@ blocos, 42 nomes de indicador, camadas, erros). Gate: `docs:kb:check`, teste tel
 Executado com estas diferenças em relação ao texto abaixo: as 18 telas sobem em nível **L0**
 (A5/`AUTHORIZATION.md` Amendment 1 — sem contrato/seed de `dashboard-backend` R-0011 no início do
 CTG-0002; nenhum `<feature>.client.ts`, nenhum `HttpClient` em `features/`; páginas renderizam
-`dashboard.states.unavailable_in_version`); **P-09 (D-13) não é placeholder**: é rota real
-(`/monitoramento/sinistros`) construída com **supressão primária e secundária ativa** (OD-D02/DT-029,
-`dashboard.cell_threshold=10`), e a subida a **L2** (facades e `<feature>.client.ts` sobre os
-clientes gerados de `BP-DASH-MONITOR-001`, dados reais nas 18 telas) é a frente seguinte, registrada
-em `docs/meta/knowledge-base/backlog.md`. Gráficos: nenhuma biblioteca — SVG inline nos componentes
+`dashboard.states.unavailable_in_version`); **P-09 (D-13) não é placeholder** (ao contrário do texto
+original deste WP): é rota real (`/monitoramento/sinistros`) com o componente de célula suprimida
+(`SuppressedCell`) e os critérios de supressão transcritos na ficha `IU-DASH-D-13`, **preparados e
+provados em teste de componente**; a supressão primária **e** secundária sobre dado real, com o
+teste ponta a ponta, pertence à subida a **L2** (facades e `<feature>.client.ts` sobre os clientes
+gerados de `BP-DASH-MONITOR-001`, dados reais nas 18 telas), já registrada como frente em
+`docs/meta/knowledge-base/backlog.md`. A decisão OD-D02/DT-029 (`dashboard.cell_threshold=10`) é o
+que destravou a tela. Gráficos: nenhuma biblioteca — SVG inline nos componentes
 de `shared/` (`DistributionChart`; M8 do plano da rodada), não uma decisão em aberto. Gates reais
 executados no lugar de `ng build` isolado e de "teste tela ↔ ficha ↔ rota" sem app (o texto abaixo
 pressupõe um app que ainda não existia): `pnpm --filter @detran/dashboard-web lint|test|build|typecheck`
```
