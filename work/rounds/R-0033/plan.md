# R-0033 — frente `frontend-preview` (fase P da C-0003 — prévia honesta de frontend baseada em fixtures)

**Status:** **ativa — autorizada pelo Owner em 2026-10-15** (`AUTHORIZATION.md`: texto literal
"R-0003 authorized. proceed ith ir work while wait for ci", lido como R-0033). Planejada em
2026-10-14 pelo Architect (`work/campaigns/C-0003-produto-primeiro.md` §4, fase P). **Execução
(desvio registrado em `AUTHORIZATION.md` §Desvios):** maestro **Fable 5.1** (Claude Code), workers
da família Claude (`claude-opus-5-5` / `claude-sonnet-5`, `model-ladder.md`), reviewer **Sol 6**
(`gpt-6-sol`, Codex CLI 0.162.1) pela ponte `tools/orchestra/bridge.sh codex` (OD-C2-003; ids
confirmados no bootstrap com `codex --help`/`~/.codex/config.toml` e `claude --version` 2.1.292).
Worktree `.claude/worktrees/frontend-preview-5281e3`, branch `claude/frontend-preview-5281e3`,
base **`claude/detran-r22-handoff-03f872`** (PR #182, abertura empilhada — o PR da rodada só abre
depois do merge do #182). Sem issue: TASK-0001 redige a issue da frente em
`work/rounds/R-0033/issue-frontend-preview.md` (não abre issue no GitHub nesta janela).
`AUTHORIZATION.md`, `tasks/`, `budget.json` e `compositions.json` criados no bootstrap de 2026-10-15.
**Concorrência:** nenhum upstream. Locks exclusivos em `apps/<superfície>/` (configuração
`preview`, `src/main.preview.ts`, `src/app/preview/`), `docs/framework/arch/frontend-preview-mode.md`,
`docs/framework/arch/frontend-wiring-pattern.md` (v0) e `work/rounds/R-0033/`. Lock partilhado
`packages/ui` (só adições). Não toca `backend/`, `packages/senatran-adapter`, gerados,
`tools/stynx-version.json`, `.github/workflows/`, `.devai/`, `record/`, `law/register`, `policy.ts`.
Se o PR #179 mesclar durante a rodada, integrar `origin/main` por merge e rebuildar; o pin do
STYNX não é escolhido por esta rodada (OD-C3-005).
**Estado verificado no bootstrap (2026-10-15 06:40Z):** `origin/main` = `897f01991a17e20253721ecf7c8592f2123a37f0`
(merge do PR #177, igual ao esperado por C-0003 §1). PR #179 (`codex/platform-latest`, DEVAI 2.2.0 +
STYNX 1.5.3) **aberto**, `MERGEABLE`, CI verde — não mesclado; o pin de `main` continua 1.4.0 e esta
rodada não o altera (OD-C3-005). PR #182 (`claude/detran-r22-handoff-03f872`, registro da parada
da R-0022) **aberto**, CI em curso (`foundation`/`backend-kernel` em execução, demais verdes).
Nenhum branch `orchestra/*` nem worktree `detran-worktrees/frontend-preview` existente. Instalação
`pnpm install --frozen-lockfile` sem alteração do lockfile; `pnpm --filter @detran/ui build` e
`pnpm --filter @detran/rait-web build` verdes (bundle completo em 8,2 s); `pnpm devai:doctor`
`ok: true` (DEVAI 1.5.6; nota não bloqueante: constituição instalada 1.0.1 à frente do pin 1.0.0).
**Defeito pré-existente observado (não é da rodada):** `apps/rait/web/angular.json` `serve` aponta
`buildTarget` para `portal-web:build:*` — `ng serve` do rait-web nunca funcionou; a configuração
`preview` de TASK-0003 corrige o alvo (`rait-web:build:*`) porque C-01 exige `ng serve
--configuration preview`. **Quirk local:** `pnpm test:stack` falha nesta máquina por espaço no
caminho (`%20`, corrigido em PR #181); não é defeito desta rodada e `pnpm check` completo só é
exigido no fechamento.
**Janelas previstas:** 2 (1 = bootstrap + prompt-review + O1/O2 — marco M1, timebox 1–2 dias úteis;
1 = O3/O4 + fechamento — marco M2). Recalibradas no bootstrap.

## Objetivo

Entregar uma **prévia executável, honesta e baseada em fixtures** da superfície classificada pelo
Owner (OD-C3-002 **decidida: `rait-web`, jornada JW-01**), para revisão UI/UX em paralelo ao
desenvolvimento, sem expor dado real, sem contornar RLS e sem tocar backend, pin ou política.

Entregáveis:

1. `docs/framework/arch/frontend-preview-mode.md` — contrato do modo prévia (§Contrato).
2. Configuração de build `preview` no app classificado (`angular.json`, `src/main.preview.ts`),
   com adapters de fixture na fronteira `data/api` e interceptor que **bloqueia rede**.
3. Shell, navegação, mapa de rotas e estados representativos (carregado, vazio, carregando, erro,
   acesso negado) em todas as rotas do manifesto do app, sob `preview`.
4. Prévia da **jornada classificada** (telas da JW-nn), com capturas responsivas (360/768/1280),
   verificação a11y (axe, `serious`/`critical` = 0) e marca visível "PRÉVIA — DADOS FICTÍCIOS".
5. Artefato estático `dist/preview/` e URL local (`pnpm stack:start` ou `ng serve --configuration
preview`) — canal definitivo por OD-C3-003.
6. `docs/framework/arch/frontend-wiring-pattern.md` **v0**: lista das costuras que as rodadas J
   usam (cliente gerado, If-Match/Idempotency-Key, mapeamento de erros, estados de tela, SSE local,
   guardas), descrevendo o código de `main`, sem variantes.
7. Shell + estados representativos das demais superfícies (`portal-web`, `dashboard-web`,
   `teat-web`) sob `preview`, **se o orçamento permitir** (O4); senão, checkpoint com o que falta.
8. Estimativa revisada da fase J a partir das lacunas reais rota × API, em §Retomada.

## Contrato do modo prévia (normativo para esta rodada; vira `frontend-preview-mode.md`)

- **Configuração própria.** `preview` é uma configuração de build e de serve ao lado de
  `production`/`development`, com entrada `src/main.preview.ts`, como o `homologation` do TEAT
  web (ADR-0033). Os bundles `production` e `development` **não** contêm módulo de prévia (gate:
  `grep -r "DETRAN_PREVIEW_MARK" dist/browser` vazio para `production`).
- **Rede bloqueada.** Interceptor de prévia rejeita toda requisição que não seja `GET` de
  `assets/` (mesma regra de `webHomologationHttpBlockInterceptor`); nenhuma rota chama `/v1`.
- **Fixtures canônicas, nunca inventadas.** Fontes, nesta ordem: `docs/framework/arch/fixtures/`
  (`rait-fixtures.json`, `calendar-2026.json`), `@example` dos contratos gerados em
  `packages/api-clients/src/generated`, ids das seeds (`backend/database/seed/*.sql`). Valor que
  exigiria decisão normativa/jurídica → texto `source_pending` visível na tela.
- **Marca visível.** Faixa fixa "PRÉVIA — DADOS FICTÍCIOS" em todas as páginas; toda ação que não
  executa comando real exibe estado "não funcional na prévia" ao ser acionada (nunca sucesso
  simulado). Sem "mock silencioso" (`rait-web-frontend.md` §11).
- **Estados representativos por rota.** A fixture escolhe, por parâmetro de rota ou por seletor
  no shell de prévia, entre `loaded`, `empty`, `loading`, `error`, `forbidden` (acesso negado),
  cobrindo os códigos do catálogo de erros do app.
- **Sessão e papéis de prévia.** Sessão sintética com os papéis do manifesto (`RAIT_ALL_ROLES`,
  etc.), trocável no shell de prévia; guardas do app continuam ativas (a prévia prova as rotas
  por papel, não as contorna). Tenant fixo das fixtures (`00000000-0000-7000-8000-00000000a001`).
- **Sem alteração de contrato.** Nenhum tipo de `@detran/api-clients` é editado; os adapters
  implementam as mesmas interfaces dos clientes/facades (`data/api/*.client.ts`,
  `data/facades/*.facade.ts`).
- **Manifesto de disponibilidade intacto.** A prévia não altera selos nem
  `docs/framework/arch/availability/`; a disponibilidade descreve o código ligado, não a prévia.

## Tarefas

| Tarefa    | CTG      | Papel     | Conteúdo                                                                                                                                                                                                  | Depende de           | Nível   |
| --------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------- |
| TASK-0001 | CTG-0001 | Architect | Inventário rota × fixture × estado da superfície classificada (e das demais, resumido); `frontend-preview-mode.md`; `frontend-wiring-pattern.md` v0; issue da frente; ODs novas no registro               | bootstrap            | grande  |
| TASK-0002 | CTG-0001 | Inspector | Specs do modo prévia: cobertura de rotas sem rede (toda entrada `page` do manifesto renderiza sob `preview` sem HTTP), gate de ausência de marca no `production`, marca visível, ação não funcional, a11y | TASK-0001            | médio   |
| TASK-0003 | CTG-0002 | Engineer  | Configuração `preview`, `main.preview.ts`, interceptor, sessão sintética, seletor de estado/papel no shell de prévia; adapters de fixture para os clientes/facades da superfície                          | TASK-0002            | grande  |
| TASK-0004 | CTG-0002 | Engineer  | Estados representativos em todas as rotas do manifesto (reaproveitando os componentes de estado existentes em `@detran/ui` e `core/`), responsivo básico                                                  | TASK-0003            | médio   |
| TASK-0005 | CTG-0003 | Inspector | Roteiro de revisão da jornada JW-nn: telas, estados, papéis, capturas esperadas; script de captura (360/768/1280) e de axe                                                                                | TASK-0001, OD-C3-002 | médio   |
| TASK-0006 | CTG-0003 | Engineer  | Prévia da jornada JW-nn completa; capturas em `work/rounds/R-0033/preview/<surface>/`; artefato `dist/preview/`; instruções de execução no README do app                                                  | TASK-0004, TASK-0005 | grande  |
| TASK-0007 | CTG-0004 | Engineer  | Shell + estados representativos das demais superfícies sob `preview` (uma tarefa por app, se orçamento)                                                                                                   | TASK-0003            | médio   |
| TASK-0008 | CTG-0005 | Architect | Estimativa revisada da fase J (lacunas rota × API por jornada); §Retomada; delta de docs; fechamento                                                                                                      | TASK-0006            | pequeno |

## Execução OD-C2-005

Branch única `orchestra/frontend-preview`, até 3 workers na mesma worktree, fronteiras disjuntas,
push sem PR ao fim de cada onda, **um** prompt-review no bootstrap, `acceptance_commands` por
tarefa, CI local completo + uma delivery-review + um PR no fim.

| Onda | Tarefas em paralelo               | Fronteiras de escrita                                                                                   | Depende de           |
| ---- | --------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| O1   | TASK-0001                         | `docs/framework/arch/frontend-{preview-mode,wiring-pattern}.md`, `work/rounds/R-0033/`, registro de ODs | bootstrap            |
| O2   | TASK-0002 ∥ TASK-0005             | `apps/<s>/src/**/*.spec.ts` ∥ `work/rounds/R-0033/preview/` (roteiro, scripts)                          | TASK-0001            |
| O3   | TASK-0003 → TASK-0004 → TASK-0006 | `apps/<s>/angular.json`, `src/main.preview.ts`, `src/app/preview/**`, README do app                     | TASK-0002, TASK-0005 |
| O4   | TASK-0007 (por app) ∥ TASK-0008   | `apps/<outro>/…` ∥ `work/rounds/R-0033/plan.md` §Retomada                                               | TASK-0003; TASK-0006 |

**Marco M1 (timebox 1–2 dias úteis):** O1 + O2 + TASK-0003 com shell servível. Se o timebox
vencer sem shell servível, checkpoint, relato ao Owner com a causa (nunca relaxar o contrato).

## Critérios de aceitação (imutáveis; mudança só por adenda com decisão do Owner)

| Critério | Verificação                                                                                                                                                                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01     | `pnpm --filter @detran/<s> build --configuration preview` gera `dist/preview/` e `ng serve --configuration preview` sobe sem backend; `pnpm --filter @detran/<s> build` (production) continua verde e **sem** `DETRAN_PREVIEW_MARK` no `dist/browser` |
| C-02     | Spec de cobertura: toda entrada `page` do manifesto renderiza sob `preview` com interceptor de rede bloqueando `/v1` (0 requisições) e sem erro no console                                                                                            |
| C-03     | Faixa "PRÉVIA — DADOS FICTÍCIOS" presente em 100 % das páginas; toda ação de comando exibe "não funcional na prévia" ao ser acionada (spec por ação do catálogo da jornada)                                                                           |
| C-04     | Jornada JW-nn: cada tela do roteiro de TASK-0005 capturada em 360/768/1280 nos estados `loaded`/`empty`/`error`/`forbidden`; capturas versionadas em `work/rounds/R-0033/preview/`                                                                    |
| C-05     | axe-core 4.13.0 sobre as telas da jornada sob `preview`: 0 violações `serious`/`critical`; demais listadas no relatório, não escondidas                                                                                                               |
| C-06     | Nenhum valor normativo inventado: fixture rastreável a `docs/framework/arch/fixtures/`, `@example` gerado ou seed; `source_pending` visível onde faltar                                                                                               |
| C-07     | `pnpm --filter @detran/<s> lint`, `test`, `typecheck`, `build` verdes; testes existentes **não editados** salvo adição; `pnpm check` verde no fim                                                                                                     |
| C-08     | `git diff origin/main...HEAD --name-only` sem `backend/`, `packages/senatran-adapter`, gerados, `tools/stynx-version.json`, `.github/workflows/`, `.devai/`, `record/`, `law/register`, `policy.ts`                                                   |
| C-09     | `frontend-preview-mode.md` e `frontend-wiring-pattern.md` v0 publicados; `work/rounds/README.md`, `waves.md`, `backlog.md` atualizados; ODs no registro canônico                                                                                      |
| C-10     | Delivery-review PASS (Opus 5.5); evidência `evidence-R-0033.json`; `round close` + `round seal`                                                                                                                                                       |

## Mapa deliverable → definições

| Entregável                   | Definição de origem                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Rotas e níveis               | `apps/rait/web/src/app/app.route-manifest.ts` (74), `rait-web-frontend.md` §4; equivalentes dos outros apps             |
| Jornadas                     | `docs/framework/arch/rait-web-journeys/JW-01…12.md`; `portal-frontends.md` §4; `teat-web-contract.md`                   |
| Fixtures                     | `docs/framework/arch/rait-fixtures.md` + `fixtures/rait-fixtures.json`; `apps/portal/web/src/testing/http-fixtures*.ts` |
| Erros e estados              | `rait-error-catalog.md`, `portal-error-catalog.md`, `dashboard-error-catalog.md`, `teat-error-catalog.md`               |
| Kit de UI                    | `docs/framework/arch/detran-ui-guide.md`, `packages/ui`                                                                 |
| Precedente de build sem rede | `apps/teat/web/src/main.homologation.ts`, `shared/homologation-http.interceptor.ts` (ADR-0033)                          |
| Stack local                  | `tools/detran-stack.sh` (portas 4200…4203, proxy `/v1`)                                                                 |

## Riscos

- Fixture canônica insuficiente para algumas telas L2 (ex.: financeiro, integrações) → estado
  `empty` ou `source_pending` visível; registrar lacuna para a rodada J.
- Guardas dependentes de sessão STYNX real → sessão sintética deve satisfazer as mesmas interfaces
  (`stynx-session.stub.ts` como referência); se exigir mudança no `core/`, adenda.
- `packages/ui` sem componente de faixa/estado → adição em `@detran/ui` (lock partilhado, só adição).
- Merge do PR #179 durante a rodada → rebuild sobre o novo pin; nenhum código de prévia depende de
  API STYNX nova.

## Bloqueios

Nenhum. OD-C3-002…006 decididas pelo Owner em 2026-10-14 (registro canônico §C-0003): superfície
`rait-web`/JW-01; canal = URL local + `dist/preview/` no PR; PR #179 decidido fora desta rodada.

## Retomada

(vazio — preenchido pelo maestro no checkpoint)

## Leitura

`AGENTS.md`; `work/campaigns/C-0003-produto-primeiro.md`; `work/campaigns/C-0002-consolidacao.md`
§12 e §14; `docs/meta/agents/orchestra/README.md`; `docs/framework/arch/rait-web-frontend.md`;
`rait-web-journeys/README.md`; `rait-fixtures.md`; `detran-ui-guide.md`;
`apps/teat/web/src/main.homologation.ts`; `work/rounds/R-0030/availability-manifest.schema.md`
(para **não** alterar manifestos de disponibilidade); `work/rounds/R-0025/plan.md` e
`command-gap-analysis.md` (lacunas que a prévia deve mostrar como "não funcional", não esconder).

**Lido pelo maestro no bootstrap (Architect, 2026-10-15, HEAD `101753a4`):** `AGENTS.md`;
`work/campaigns/C-0003-produto-primeiro.md` (inteira); `docs/meta/agents/orchestra/README.md`,
`maestro-prompt.template.md`, `worker-prompt.template.md`, `reviewer-prompt.template.md`,
`task.template.json`, `model-ladder.md`; `work/rounds/R-0022/AUTHORIZATION.md`, `tasks/TASK-0001.json`,
`compositions.json`, `budget.json` (modelos de bootstrap); `law/schemas/task.schema.json`;
`tools/devai/verify-round-tasks.mjs`; `tools/orchestra/bridge.sh`; `docs/framework/arch/rait-web-frontend.md`
§1, §4, §10, §11, §13, §14; `rait-web-journeys/README.md`, `JW-01-analista.md`; `rait-fixtures.md`
§1–§7 e a forma de `fixtures/rait-fixtures.json` (33 coleções); `detran-ui-guide.md` §1–§2;
`work/rounds/R-0025/command-gap-analysis.md` §3–§4; `apps/teat/web/src/main.homologation.ts`,
`shared/homologation-http.interceptor.ts`, `angular.json` (configuração `homologation`);
`apps/rait/web/{angular.json,package.json,README.md,vitest.config.ts,eslint.config.js,eslint/local-rules.js}`,
`src/{main.ts,index.html,test-setup.ts}`, `public/runtime-config.js`, `src/app/{app.routes.ts,
app.route-manifest.ts (cabeçalho), app.scaffold.spec.ts}`, `core/{manifest-routes,session.facade,
runtime-config,rait-shell.component,stream-transport,sse.service,error-codes,i18n-fallback}.ts`,
`core/guards/{auth,role}.guard.ts`, `data/api/{rait-http,case.client}.ts`, `data/facades/{read-store,
command,bundles}.ts`, `shared/page-state.component.ts`, `features/{page-support.ts,static-gates.spec.ts,
painel/pages/resume-tray.page.ts}`, `src/testing/{stynx-session.stub,session.stub,facade.stub,axe.spec-helper,
a11y-state.spec-helper,kb}.ts`, `src/app/i18n/{i18n.spec.ts (asserções de contagem),rait.pt-BR.json (rait.states.*, rait.shell.*)}`;
`docs/meta/knowledge-base/open-decisions-rait.md` §C-0003; `work/rounds/README.md`;
`docs/meta/agents/{engineer-frontend,inspector-tests,architect-blueprint}.md`; `.gitignore`
(`reports/` com exceção `work/rounds/*/reports/`). **Não lido** (fica para os workers, com listas
fechadas): `rait-web-frontend.md` §5–§9 e §12, `rait-error-catalog.md`, `rait-web-journeys/JW-02…12`,
`portal-frontends.md`, `teat-web-contract.md`, `R-0030/availability-manifest.schema.md` (só o
princípio "não alterar manifestos" foi levado aos prompts — nota: `docs/framework/arch/availability/`
ainda não existe em `main`).

**Decisões do maestro no bootstrap (Architect; derivadas das leituras acima, não de valores novos):**

- **M1 — i18n da prévia por sobreposição.** `apps/rait/web/src/app/app.scaffold.spec.ts` (C-2A-60)
  fixa em 14 os namespaces `rait.*` de `parameter-catalogue.md` e `src/app/i18n/i18n.spec.ts` fixa
  contagens do catálogo semente; logo a prévia **não** cria namespace novo nem edita
  `rait.pt-BR.json`/`parameter-catalogue.md`. Os textos da prévia vivem em
  `src/app/preview/preview.pt-BR.json`, sob namespaces já declarados (`rait.states.preview_*`,
  `rait.shell.preview_*`), e são sobrepostos ao catálogo do app em `main.preview.ts`
  (`loadCatalog` = catálogo do app + sobreposição). Nenhum teste existente é editado.
- **M2 — fronteira de fixtures na camada `data/`.** Os adapters de prévia substituem por
  `useClass`/`useValue` os clientes `data/api/*.client.ts` (classes `@Injectable`), o
  `RaitStreamTransport` (SSE: transporte de prévia que emite só heartbeat), `RaitSessionFacade`
  (sessão sintética) e `RaitClock` (`today` das fixtures, 2026-09-14) — nunca as facades nem as
  páginas; `RaitHttp` fica inalcançável porque o interceptor bloqueia tudo que não seja `GET
  assets/`. Comandos continuam `RaitCommandUnavailableError` (M8) → a UI já mostra
  "indisponível" (`kind 'unavailable'`); a prévia **acrescenta** a marcação "não funcional na
  prévia" (C-03) sem simular sucesso.
- **M3 — `typecheck` vermelho entre TASK-0002 e TASK-0003 é estado esperado** (método §4.13, R-0009
  M24): os specs do Inspector importam módulos de `src/app/preview/**` que só o Engineer cria;
  por isso `typecheck`/`test` do app são critérios de TASK-0003, e TASK-0002 prova existência,
  Prettier e lint restrito aos arquivos novos.
- **M4 — gate de marca.** Positivo: `grep -rl "DETRAN_PREVIEW_MARK" dist/preview` não vazio;
  negativo: `grep -r "DETRAN_PREVIEW_MARK" dist/browser` vazio após `pnpm --filter @detran/rait-web
  build` (production). A string `DETRAN_PREVIEW_MARK` aparece no DOM como valor do atributo
  `data-detran-preview-mark` da faixa (sobrevive à minificação); o texto visível vem de
  `rait.states.preview_mark` = "PRÉVIA — DADOS FICTÍCIOS".
- **M5 — `verify:round-tasks` não cobre R-0033.** `tools/devai/verify-round-tasks.mjs` só valida
  rodadas R-0003…R-0020 (`roundNumber > 20` é ignorado); as tarefas desta rodada são validadas
  diretamente com `pnpm exec devai check --only schema --schema law/schemas/task.schema.json
  --instance work/rounds/R-0033/tasks/TASK-000n.json` no bootstrap. A ampliação do verificador é
  follow-up fora do lock desta rodada (registrado em §Retomada).
