# R-0016 — frente `dashboard-console` (WP-D4, WP-D5 do DASHBOARD: fichas, formulários, i18n e console)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Depende de:** `dashboard-backend` (R-0011) em `main`.
**Janelas previstas:** 3.

## Metas

1. **Fichas** (WP-D4): `docs/framework/product/transversal/dashboard/screens/IU-DASH-D-nn.md` (18;
   os ids D-01…D-18 do build pack são promovidos ao corpus — [IU-DASH-001] não tem códigos), com os
   estados obrigatórios (vazio, carregando, erro, indisponível, desatualizado, bloqueado por decisão)
   e os textos fixos ("ver apuração de incidente"; "sem prazo definido"; "prazo do candidato,
   preclusivo"; "registro manual de ciência"); D-08/D-14 nomeiam os dois conjuntos de deveres (9
   indicadores do bloco B × 14 linhas da tabela-mestra). Baseline do KB sobe em 18.
2. **Formulários e i18n**: `apps/dashboard/web/src/app/forms/*.schema.ts` (9 formulários,
   `dashboard-frontends.md` §7); `i18n/dashboard.pt-BR.json` (estados, severidades, blocos, 42 nomes
   de indicador — do seed de R-0011 —, camadas, erros).
3. **Console** (WP-D5): `apps/dashboard/web` (`@detran/dashboard-web`): bootstrap com `@detran/ui`,
   `layerGuard` (consome `dashboardLayerFor` via claims), `freshnessInterceptor`, SSE com fallback,
   18 telas (P-09 com supressão secundária ativa — OD-D02 destravado), componentes §5, gráficos com
   escala única e célula suprimida visível, severidade nunca só por cor. Scripts
   `build|test|lint|typecheck` criados e ligados a `pnpm check`. `apps/dashboard/web/README.md`
   reescrito por blocos A–D e camadas (inconsistência 1 do build pack).
4. Documentação: `dashboard-build-pack.md` §WP-D4/D5 executados (gates reais); `dashboard-frontends.md`
   §9/§10; backlog (ondas por bloco: A no MVP, B/C/D depois).

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                               | Depende de | Entrega                                                                                                                                               |
| --------- | ------------ | ------------------- | -------------- | -------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | `MOD-dashboard-web-arch`                           | —          | decisões (pastas §9, biblioteca de gráficos permitida pelo `detran-ui-guide.md`, forma dos schemas), lista tela → ficha → rota, critérios             |
| TASK-0002 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-product-dashboard-screens`, `MOD-kb-manifest` | TASK-0001  | 18 fichas (D-01…D-18); manifesto                                                                                                                      |
| TASK-0003 | Engineer     | engineer-frontend   | Luna / baixo   | `MOD-dashboard-i18n`                               | TASK-0001  | `dashboard.pt-BR.json`; teste tela ↔ ficha ↔ rota                                                                                                     |
| TASK-0004 | Inspector    | inspector-tests     | Luna / médio   | `MOD-dashboard-web-tests`                          | TASK-0003  | testes: roteamento por papel × camada (N3 sempre bloqueado), 9 schemas, `freshnessInterceptor`, célula suprimida visível, a11y (severidade por forma) |
| TASK-0005 | Engineer     | engineer-frontend   | Terra / médio  | `MOD-dashboard-web-app`, `MOD-package-json`        | TASK-0004  | app completo (18 telas, guardas, SSE, gráficos); `pnpm check` estendido; README; testes verdes                                                        |
| TASK-0006 | Engineer     | engineer-frontend   | Luna / médio   | `MOD-dashboard-web-forms`                          | TASK-0005  | 9 schemas com gates; testes verdes                                                                                                                    |
| TASK-0007 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                         | TASK-0006  | build pack, `dashboard-frontends.md`, backlog                                                                                                         |

CTG-0001 = 0002/0003; CTG-0002 = 0004…0006. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → baseline + 18 / 446, atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm --filter @detran/dashboard-web typecheck|test|build|lint` → verdes.
- teste tela ↔ ficha ↔ rota: 18/18; roteamento: cada rota × cada papel de `DASHBOARD_ROLES` e gestores
  com a camada esperada, N3 sempre bloqueado; a11y (axe) sem `serious`/`critical`.
- `pnpm check` → verde; `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-DASH-001]; `dashboard-frontends.md` §4–§6; [JRN-DASH-001…007]; `dashboard-build-pack.md` §5 (inconsistências) |
| formulários | `dashboard-frontends.md` §7; [RN-DASH-*]; `dashboard-error-catalog.md`                                            |
| hierarquia  | `dashboard-frontends.md` §1–§3, §8–§10; `detran-ui-guide.md`                                                      |
| camadas     | [RN-DASH-170]/[RN-DASH-171]; `policy.ts` (R-0003)                                                                 |
| supressão   | [RN-DASH-161]; [RN-DASH-172]; OD-D02 (`dashboard.cell_threshold=10`)                                              |
| catálogo    | [APP-DASHBOARD] §Catálogo; seed de R-0011                                                                         |

## Riscos

- Biblioteca de gráficos: só a que o `detran-ui-guide.md`/`packages/ui` já admite; nada novo em
  `packages/ui` sem ADR curta.
- Nomes dos 42 indicadores vêm do seed (R-0011), nunca redigitados.
- P-09: publicar com supressão secundária; se o teste de supressão de R-0011 não existir em `main`, bloquear a tela (não o app).

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
