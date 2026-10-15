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
**Estado verificado na abertura da janela 2 (2026-10-15 15:31Z, maestro Fable 5.1):** PR #182
(base da rodada) **mesclado** em `main` (`57fb8840`, 14:25Z); PR #184 (paridade da fixture,
OD-C3-008 a) **mesclado** (`7b2accbb`, 15:04Z); `origin/main` = `7b2accbb` integrado na branch da
rodada por merge (`77de66ed`; conflitos só em `plan.md` — add/add com a versão proposta do #182,
mantida a da rodada — e na tabela §C-0003 do registro de ODs, mantida a versão da rodada, superset
das linhas de `main`). PR #179 continua **aberto** (CI verde, mergeable desconhecido após os
merges); pin 1.4.0 inalterado (OD-C3-005). PR #181 aberto, `BEHIND`. A base da rodada passa a ser
`main`: o PR da R-0033 pode abrir contra `main` quando o Owner autorizar push/PR.
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

| Onda       | Tarefas em paralelo               | Fronteiras de escrita                                                                                                                                         | Depende de                      |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| O1         | TASK-0001                         | `docs/framework/arch/frontend-{preview-mode,wiring-pattern}.md`, `work/rounds/R-0033/`, registro de ODs                                                       | bootstrap                       |
| O2         | TASK-0002 ∥ TASK-0005             | `apps/<s>/src/**/*.spec.ts` ∥ `work/rounds/R-0033/preview/` (roteiro, scripts)                                                                                | TASK-0001                       |
| O3         | TASK-0003 → TASK-0004 → TASK-0006 | `apps/<s>/angular.json`, `src/main.preview.ts`, `src/app/preview/**`, README do app                                                                           | TASK-0002, TASK-0005            |
| O4         | TASK-0007 (por app) ∥ TASK-0008   | `apps/<outro>/…` ∥ `work/rounds/R-0033/plan.md` §Retomada                                                                                                     | TASK-0003; TASK-0006            |
| O4a/b (A1) | TASK-0009 ∥ TASK-0008 → TASK-0007 | `apps/portal/web/src/app/preview/*.spec.ts` + `inventory-portal-web.md` ∥ §Retomada → `apps/portal/web/{angular.json,src/main.preview.ts,src/app/preview/**}` | TASK-0001; TASK-0006; TASK-0009 |

**Marco M1 (timebox 1–2 dias úteis):** O1 + O2 + TASK-0003 com shell servível. Se o timebox
vencer sem shell servível, checkpoint, relato ao Owner com a causa (nunca relaxar o contrato).

## Adendas do maestro (Architect; não alteram critérios nem decisões do Owner)

**A1 — correções do prompt-review ciclo 1 (Sol 6, `reviews/prompt-review-1.json`, 2026-10-15,
13 achados `high`, todos corrigíveis):**

1. **Tríade por CTG.** CTG-0001 = TASK-0001 (Architect) → TASK-0002 (Inspector) → TASK-0003 e
   TASK-0004 (Engineer); a tabela §Tarefas lia TASK-0003/0004 em CTG-0002 — metadados corrigidos
   em `tasks/*.json`, ordem inalterada. CTG-0002 fica sem tarefa própria nesta rodada.
2. **TASK-0009 (Inspector, CTG-0004, nova)** — specs do modo prévia do `portal-web` e
   `inventory-portal-web.md`, **antes** de TASK-0007 (`upstream_task_id` = TASK-0009; TASK-0001 é
   o Architect do CTG via `frontend-preview-mode.md` §"como estender a outra superfície"). Onda O4
   passa a O4a (TASK-0009 ∥ TASK-0008) → O4b (TASK-0007). Nenhum CTG novo.
3. **JW-01 passos 9–10 × manifesto.** `/casos/:id/decisao` (só `rait-signing-authority`) e
   `/casos/:id/impedimentos` (só `rait-rapporteur`/`rait-chair`) divergem da jornada do analista.
   A prévia não amplia papéis nem contorna guardas: specs, roteiro e capturas tratam os passos
   9–10 sob o papel do manifesto e provam `/sem-permissao` sob `rait-analyst`; TASK-0001 registra
   **OD-C3-007** (recomendação (a): manter o manifesto e reescrever a JW-01).
4. **Cenários tipados por operação.** `applyListScenario` (página vazia tipada por
   `applyListQuery([], query, spec)` em `empty`) e `applyReadScenario` (`empty` não altera leituras
   unitárias; nunca 404 sintético) substituem o `applyScenario<T>` genérico; `empty` numa tela =
   slots de lista em `empty`, entidade principal carregada.
5. **Substituto de `StynxSessionService`** com a superfície pública completa do kit 1.4.0
   (`state`, `active`, `active$`, `snapshot`, `hasAllPermissions`, `hasAnyPermissions`, `login`,
   `loginRedirect`, `completeLogin`, `logout`), como `src/testing/stynx-session.stub.ts`.
6. **Harness dos specs de prévia** próprio do Inspector (`preview.spec-helper.ts`,
   `createPreviewHarness(Array<Provider | EnvironmentProviders>)`); `createRaitRouterHarness`
   não é editado.
7. **Scripts de captura/axe autossuficientes** (`lib.mjs` com servidor estático sobre
   `dist/preview`, `check.mjs` com verificações determinísticas) para que a aceitação de TASK-0006
   execute `capture.mjs`, `axe.mjs` e `check.mjs captures|axe`; `playwright-core@1.63.0` entra
   como devDependency de `apps/rait/web` pelo maestro antes de TASK-0005 (Chrome instalado,
   `channel: 'chrome'`, sem download).
8. **Artefato `dist/preview/` (OD-C3-003).** `dist/` é ignorado pelo Git: TASK-0006 versiona
   `dist-preview.manifest.json` (sha256 por arquivo) e a aceitação confere o manifesto contra o
   build; no fechamento o maestro gera `preview-R-0033.zip` e o anexa ao PR (upload pelo
   Owner/maestro na interface do GitHub), com o sha256 do zip no corpo do PR.
9. **TASK-0008** produz `closure.draft.json` (não o `closure.json` canônico, que exige data e SHA
   do merge) e recebe `work/rounds/R-0033/commits.md` do maestro em vez de executar `git`.
10. **Aceitações executáveis** acrescentadas em `tasks/*.json`: TASK-0005 (`check.mjs resolve`,
    `lib.mjs`/`check.mjs`/`README.md` obrigatórios), TASK-0006 (execução dos scripts, contagem,
    impactos, manifesto), TASK-0007 (gate negativo de production do portal, `index.html` da
    prévia), TASK-0009 (specs + inventário + eslint).

**A2 — correções do prompt-review ciclo 2 (Sol 6, `reviews/prompt-review-2.json`, FAIL: 11 de
13 resolvidos, 2 `high` restantes):**

1. **JW-01 passos 9–10 são lacuna bloqueada**, não jornada concluída sob outro papel (substitui o
   item 3 de A1): a prévia exercita só a prova negativa sob `rait-analyst` (`/sem-permissao`);
   as duas rotas continuam cobertas por C-02 sob os papéis do manifesto, sem rótulo de JW-01;
   C-04 para essas telas é `not run` (bloqueado) até o Owner decidir **OD-C3-007** (registrada
   por TASK-0001; recomendação (a) do Architect: manter o manifesto e reescrever a JW-01).
2. **Prova executável de `ng serve --configuration preview`** (C-01): `smoke.mjs` em
   `work/rounds/R-0033/preview/rait-web/` (TASK-0005; critério de TASK-0003 e TASK-0006) e em
   `work/rounds/R-0033/preview/portal-web/` (TASK-0009; critério de TASK-0007) — sobe o `ng
serve`, espera `200` em `/` com a raiz de prévia, encerra o processo, sai 0/1.

**A3 — decisão do Owner de 2026-10-15 (`AUTHORIZATION.md` Adenda B1):** ciclo 3 do
prompt-review autorizado, restrito aos 2 itens do ciclo 2; **OD-C3-007 decidida (a)** — manifesto
mantido, JW-01 passos 9–10 reescritos. Efeitos nos prompts (v4): TASK-0001 ganha
`docs/framework/arch/rait-web-journeys/JW-01-analista.md` em "Pode tocar" (só passos 9–10 da
tabela e do fluxo Mermaid; SVGs como follow-up) e registra OD-C3-007 como **decidida**; para a
prévia, a JW-01 passa a ter os passos 1–8 (+ prova negativa das duas rotas sob `rait-analyst`);
C-04 cobre as telas dos passos 1–8 — nada fica `not run` por este motivo.

**A4 — fixture com paridade (janela 2, 2026-10-15, pós-merge do PR #184):**
`docs/framework/arch/fixtures/rait-fixtures.json` passou de 33 para **49 coleções** (15 novas:
`raitPools`, `parties`, `documents`, `admissibility`, `assignments`, `caseEvents`, `deadlines`,
`inquiries`, `decisions`, `communications`, `impediments`, `clockAlerts`, `attendance`, `votes`,
`minutes`; campos novos em 15 existentes — `rait-fixtures.md` §10). Onde `prompts/TASK-0003.md`
e `inventory-rait-web.md` dizem "33 coleções" ou listam coleções como **ausentes**, lê-se o
estado atual da JSON: `RaitFixturesJson` tipa as 49 coleções pelo mínimo que os adapters usam e as
telas antes marcadas parciais/vazias por falta de coleção passam a `loaded` com os dados da seed
(ids iguais). Campos sem coluna na seed continuam `source_pending` (D-06/D-07; tabela em
`rait-fixtures.md` §10). Nenhum critério muda; o prompt não é reescrito (PC inalterado) — a nota
vai na mensagem de despacho.

**A5 — divergências spec × contrato × builder apontadas por TASK-0003 (iteração 1, janela 2,
2026-10-15; relatório em `reports/TASK-0003.md`). Decisões do Architect; nenhum critério C-01…C-10
muda, nenhuma decisão do Owner é reaberta:**

1. **B1 — parser do inventário.** `readInventoryRows()` de `preview.spec-helper.ts` lia toda linha
   `| <n> |` do inventário (inclusive §5.1 e §5.2, sem coluna 7). Correção **no helper** (Inspector):
   só as linhas entre `## 3.` e `## 4.` são lidas (74 entradas). O inventário não muda. Não é
   enfraquecimento de teste: é o parser cumprindo o que o próprio comentário do helper prometia.
2. **B2 — `angular.json` × builder Angular 22** (contrato §2 emendado): (i) `assets` da fixture com
   `input: "src/app/preview/fixtures"`, onde `src/app/preview/fixtures` é um **link simbólico
   versionado** para `../../../../../../docs/framework/arch/fixtures` (o builder rejeita asset fora
   da raiz do workspace; o link mantém a fonte única e P-13 byte a byte); (ii) `index: { input:
"src/index.preview.html", output: "index.html" }` (string geraria `index.preview.html`; C-01 e as
   aceitações exigem `dist/preview/index.html`); (iii) `serve.preview.host = "127.0.0.1"` (o
   `smoke.mjs` consulta `127.0.0.1`; o dev-server padrão escuta `localhost` = `::1` no macOS).
   `preview-production-gate.spec.ts` passa a esperar exatamente isso (Inspector).
3. **B3 — `/sem-permissao` sem `data-screen`.** `ForbiddenPageComponent` (`rait-forbidden-page`,
   `core/pages/forbidden.page.ts`) não tem `data-screen` por decisão do app (M14/C-2A-13) e `core/`
   não é tocado pela prévia. Para a entrada `sem-permissao`, P-04/P-06 provam o host
   `rait-forbidden-page` (e o pathname) em vez de `[data-screen]` (Inspector: `preview-coverage`,
   `preview-mark`).
4. **B4 — `empty` em telas sem slot de lista.** Regra 2 do contrato §3 estendida: o seletor de
   `empty` aceita `[data-status="empty"]` em qualquer elemento da página (inclui
   `rait-dossier-viewer`); tela cujas leituras são todas unitárias (painel: `ShiftSummary`, sem
   `emptyWhen`) **não tem** slot a esvaziar — sob `pv_estado=empty` o host fica `data-status="ready"`
   e nenhum `[data-status="empty"]` existe; **medido pelo Inspector:** como `ShiftSummary` soma as
   listas que o cenário esvazia, o painel em `empty` mostra contagens 0 e sem listas curtas — a
   captura `empty` difere da `loaded` (a redação inicial desta adenda dizia "idêntica"; corrigida;
   registrado no roteiro, não escondido). O
   Inspector enumera por tela em `JW01_SCREENS` (lendo o template) quais são os casos.
5. **B5 — A4 nos specs.** `preview-fixture-source.spec.ts` deixa de fixar as 14 leituras como "sem
   coleção" e passa a mapeá-las às coleções novas (`parties`, `documents`, `admissibility`,
   `deadlines`, `inquiries`, `decisions`, `communications`, `caseEvents`, `assignments`,
   `impediments`, `clockAlerts`, `attendance`, `votes`, `minutes`), com asserções derivadas da JSON
   (ids e contagens por caso, nunca valores digitados); D-07 fica restrito a coleção realmente
   ausente — **as 6 leituras de `InfractionClient` e `NotificationClient`** continuam sem coleção na
   JSON (`rait-fixtures.md` §10; fora do mandato do PR #184); a redação inicial "nenhuma" estava
   errada e foi corrigida pelo Inspector. `preview-not-functional.spec.ts` passo 6:
   `inquiries` tem 1 registro do caso 08 (`…-000015000001`) → a prova passa a positiva (um
   `rait-inquiry-card`; "responder"/"prorrogar" acionados registram `rait-case:answer` /
   `rait-case:extend` — as strings M8 de `RAIT_COMMANDS`, `data/models/commands.ts`; a redação
   anterior `rait-inquiry:*` estava errada e foi corrigida pelo Inspector — como não funcionais,
   nunca sucesso). Campos exibidos formatados sem coluna na seed (`attached_at`, `evaluated_at`,
   `decided_at`, `declared_at`, `assigned_at` e, confirmado na iteração 2, `clockAlerts.raised_at`;
   `created_at` nas 14 coleções) ficam `source_pending` (D-06 (5)) — célula vazia é
   lacuna visível, registrada no roteiro e em §Retomada para a fase J. O Engineer (TASK-0003
   iteração 2) liga as 14 leituras e os `get*` correspondentes às coleções novas.
6. **Desvios aceitos (contrato §9):** **D-20** `{ provide: STYNX_AUTH_PROVIDER, useValue: null }`
   em `preview.providers.ts` — o `AuthInterceptor` do kit adia toda requisição em
   `Promise.resolve(getAccessToken())`; sem provedor, `GET assets/**` passa síncrono e sem
   `Authorization` (mesmo efeito de token nulo; a sessão sintética não tem token). **D-01** passa a
   dizer que `setState` também mescla `pv_papel` com o papel corrente. **D-21** `adapters/preview-reader.ts`
   (leitura comum por cenário + `fixtureDateTime`/`sourcePending` de D-06) é acréscimo aceito ao
   layout.
7. **Locks desta iteração.** Inspector (TASK-0002 iteração 2): `apps/rait/web/src/app/preview/*.spec.ts`,
   `preview.spec-helper.ts`, e a coluna "Observação"/expectativas de
   `work/rounds/R-0033/preview/rait-web/roteiro-jw-01.md` só onde contradizem a fixture atual.
   Engineer (TASK-0003 iteração 2): o lock original de TASK-0003. Os dois correm em série
   (Inspector primeiro). `inventory-rait-web.md` §2/§3/§5.1 ("ausente", "sem documentos", "sem
   Inquiry", "lista vazia") é refrescado por TASK-0008 (Architect) no fechamento; até lá, A4 prevalece.
8. **Follow-ups fora do lock (relatório do Engineer):** `src/main.ts` usa `provideHttpClient()` sem
   `withInterceptorsFromDi()` — os interceptors DI do kit (bearer, tenant, request-id) não estão
   ativos em produção, ao contrário do comentário de `rait-http.ts` (relevante para a fase J; vai ao
   backlog por TASK-0008); chaves do kit sem tradução (`ui.confirmDialog.cancel`, `ui.pagination.*`),
   já em produção; **campo `Format: date` exibido com um dia a menos** (`due_on` "2026-09-23" →
   "22/09/2026" no `rait-inquiry-card` e no `rait-deadline-chip`: `stynxIntlDate` lê `AAAA-MM-DD`
   como meia-noite UTC e formata em America/Manaus; provável em produção; a prévia não converte
   `date` em data-hora, D-06 (2) — follow-up da fase J, backlog por TASK-0008).

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

- **B1 (2026-10-15, prompt-review) — resolvido pelo Owner (Adenda B1 de `AUTHORIZATION.md`):**
  ciclos 1 e 2 (Sol 6) FAIL; ciclo 3 **restrito aos 2 itens restantes** autorizado; `FAIL`/`REVIEW`
  no ciclo 3 → parada e relato, sem ciclo 4.
- **OD-C3-007 — decidida (a) pelo Owner em 2026-10-15** (registro canônico §C-0003): manifesto
  mantido; JW-01 passos 9–10 reescritos por TASK-0001 (adenda A3).

- **OD-C3-008 — decidida (a) pelo Owner em 2026-10-15** (`AUTHORIZATION.md` Adenda B2): PR
  próprio de paridade da fixture — **PR #184** (`fix/rait-fixtures-json-parity` sobre
  `origin/main` 51ec27f0, commit `1727bdc8`; worker Inspector FIX-0001, delivery-review Codex
  Sol 6 PASS, `reviews/fix-0001-delivery-review-1.json`; gates locais verdes). TASK-0003 começa
  depois do merge do #184 e da integração de `origin/main` por merge na branch da rodada.

OD-C3-002…006 decididas pelo Owner em 2026-10-14 (registro canônico §C-0003): superfície
`rait-web`/JW-01; canal = URL local + `dist/preview/` no PR; PR #179 decidido fora desta rodada.

## Retomada

**Checkpoint 2026-10-15 ~10:20Z (janela 1, maestro Fable 5.1) — fim da onda O2; HEAD = commit
deste checkpoint sobre `5ad1528b`.** Branch `claude/frontend-preview-5281e3` (empilhada sobre
`claude/detran-r22-handoff-03f872`, PR #182); sem push, sem PR.

| Tarefa                            | Estado        | Commit                     | Aceitação                                                            |
| --------------------------------- | ------------- | -------------------------- | -------------------------------------------------------------------- |
| bootstrap                         | concluído     | `ca2ccbe8`                 | tasks validadas por `devai check --only schema` (M5)                 |
| prompts                           | concluído     | `d4f38d26` → v4 `1d49aec5` | prompt-review 1 FAIL (13) → 2 FAIL (2) → **3 PASS** (`1ee99cf5`)     |
| deps                              | concluído     | `75a87d91`                 | `playwright-core@1.63.0` em `apps/rait/web` (pré-condição TASK-0005) |
| TASK-0001                         | **completed** | `e9daaddf`                 | 7/7 PASS (`reports/TASK-0001.md`)                                    |
| TASK-0002                         | **completed** | `629e1695`                 | 11/11 PASS; specs vermelhos só por módulo ausente (M3)               |
| TASK-0005                         | **completed** | `5ad1528b`                 | 14/14 PASS; execução real fica para TASK-0006                        |
| TASK-0003                         | queued        | —                          | **próxima** (O3, marco M1) — ver OD-C3-008 abaixo                    |
| TASK-0004, 0006, 0009, 0008, 0007 | queued        | —                          | O3 → O4a → O4b                                                       |

- **Último veredito do reviewer:** `reviews/prompt-review-3.json` PASS (Sol 6, ciclo restrito
  autorizado pelo Owner, Adenda B1). Nenhuma delivery-review ainda (OD-C2-005: uma só, no fim).
- **Por que parou aqui:** orçamento da família Claude ≈ 66 % do limite da janela
  (`budget.json`; TASK-0003, grande, cruzaria o limiar de 80 % a meio) **e** OD-C3-008 (proposta
  por TASK-0001) pede decisão do Owner antes de TASK-0003: (a) PR próprio de fixture transcrevendo
  da seed `20-fixtures-rait.sql` para `rait-fixtures.json` as coleções/campos ausentes (partes,
  documentos, admissibilidade, diligências, eventos; `RaitCase.circuit`, `protocolled_at`…), ou
  (b) seguir com a JSON atual (26 telas parciais, 5 vazias em `loaded`; `source_pending`/D-06/D-07).
  O contrato já funciona sob (b); (a) muda a qualidade da prévia da JW-01, não o contrato.
- **Próximo passo do maestro ao retomar (janela 2):** OD-C3-008 decidida (a) e registrada
  (Adenda B2); aguardar o merge do PR de paridade da fixture e integrar `origin/main` por merge; disparar **TASK-0003** (`engineer-frontend`, `claude-opus-5-5`,
  alto; `prompts/TASK-0003.md`, PC em `compositions.json`) e, verde, TASK-0004 → TASK-0006 (M2);
  depois O4a (TASK-0009 ∥ TASK-0008, para o qual o maestro gera `commits.md`) → O4b (TASK-0007);
  sequência final OD-C2-005 (merge de `origin/main`, CI local completo, delivery-review única,
  PR após o merge do #182, `preview-R-0033.zip` anexado ao PR, evidência, `audit observe`,
  `round close`/`seal`).
- **Avisos para TASK-0003 (dos relatórios de O2):** D-01 do contrato (navegação de documento via
  `PREVIEW_DOCUMENT_NAVIGATE`) prevalece sobre o `queryParamsHandling: 'merge'` do layout do
  prompt — os specs seguem o contrato; L0 é placeholder com `data-screen` e
  `rait.states.unavailable_in_version`; `openPreview` dos scripts espera `[data-detran-preview-mark]`
  e depois `[data-screen]`/`h1`/`[role=alert]`/`[role=status]`; `preview-production-gate.spec.ts`
  importa `PREVIEW_CATALOG_CONTRACT` do helper; D-12 fixa a ordem dos builds (`preview` antes de
  `production`, que apaga `dist/`); P-24 (`check.mjs resolve` provando as URLs do inventário)
  não foi implementado por TASK-0005 — decidir se entra em TASK-0006 ou vira adenda.
- **Follow-ups fora do lock (não executar nesta rodada):** `tools/devai/verify-round-tasks.mjs`
  ignora R > 20; `apps/{dashboard,teat}/web/angular.json` `serve` (conferir o defeito de
  `buildTarget`); SVGs `ARCH-RAIT-WEB-j01-*.svg` divergem do Mermaid reescrito (sem gerador);
  `rait-document:attach-official` sem botão para nenhum papel (OD-R12-027/R-14); fixture JSON sem
  diligência (`answer`/`extend` não acionáveis); diretório `graft/` (cache de ferramenta) não
  versionado.
- **Estimativa revisada da fase J:** ainda não produzida (TASK-0008).

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
