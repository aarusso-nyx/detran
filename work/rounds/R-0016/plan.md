# R-0016 — frente `dashboard-console` (WP-D4, WP-D5 do DASHBOARD: fichas, formulários, i18n e console)

**Status:** planejado em 2026-09-14 pelo Architect; **aberta em 2026-09-21** pelo maestro Fable 5.1
(`AUTHORIZATION.md`; prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via
`tools/orchestra/bridge.sh codex` (troca de família decidida pelo Owner em 2026-09-21). Base
`origin/main` 08fb84e8 (PR #79). Worktree
`/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`, branch
`orchestra/dashboard-console` (M1).
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — CTG-0001 (18 fichas, i18n — nomes dos 42 indicadores transcritos de [APP-DASHBOARD] §Catálogo, iguais ao seed): nenhum upstream. CTG-0002 (console, formulários): `dashboard-backend` R-0011 (`orchestra/dashboard-backend`) — empilhe nele se ainda não mesclou.
**Janelas previstas:** 3.

## Metas

1. **Fichas** (WP-D4): `docs/framework/product/transversal/dashboard/screens/IU-DASH-D-nn.md` (18;
   os ids D-01…D-18 do build pack são promovidos ao corpus — [IU-DASH-001] não tem códigos), com os
   estados obrigatórios (vazio, carregando, erro, indisponível, desatualizado, bloqueado por decisão)
   e os textos fixos ("ver apuração de incidente"; "sem prazo definido"; "prazo do candidato,
   preclusivo"; "registro manual de ciência"); D-08/D-14 nomeiam os dois conjuntos de deveres (9
   indicadores do bloco B × 14 linhas da tabela-mestra). Baseline do KB sobe em 18.
2. **Formulários e i18n**: `apps/dashboard/web/src/app/forms/*.schema.ts` (9 formulários,
   `dashboard-frontends.md` §7); `docs/framework/arch/i18n/dashboard.pt-BR.json` (M5: estados,
   severidades, blocos, 42 nomes de indicador — transcritos de [APP-DASHBOARD] §Catálogo, a mesma
   fonte do seed de R-0011 —, camadas, erros), copiada ao app no CTG-0002.
3. **Console** (WP-D5): `apps/dashboard/web` (`@detran/dashboard-web`): bootstrap com `@detran/ui`,
   `layerGuard` (consome `dashboardLayerFor` via claims), `freshnessInterceptor`, SSE com fallback,
   18 telas (P-09 com supressão secundária ativa — OD-D02 destravado), componentes §5, gráficos com
   escala única e célula suprimida visível, severidade nunca só por cor. Scripts
   `build|test|lint|typecheck` criados e ligados a `pnpm check`. `apps/dashboard/web/README.md`
   reescrito por blocos A–D e camadas (inconsistência 1 do build pack).
4. Documentação: `dashboard-build-pack.md` §WP-D4/D5 executados (gates reais); `dashboard-frontends.md`
   §9/§10; backlog (ondas por bloco: A no MVP, B/C/D depois).

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                    | Depende de | Entrega                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-r16-route-manifest`, `MOD-parameter-catalogue-doc` | —          | `route-manifest.md` (18 rotas: id D-nn, ficha, path, painel, camada, camada de acesso, chave de política, papéis, módulo §9, slug, UC/JRN, blocos, textos fixos), `contracts/CTG-0001.md` (esquema i18n M5, allowlist `dashboard.*`, critérios do teste tela ↔ ficha ↔ rota ↔ i18n), `contracts/CTG-0002.md` §Decisões (pastas §9, biblioteca de gráficos, forma dos schemas, guardas) |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-dashboard-screens`, `MOD-kb-manifest`      | TASK-0001  | 18 fichas `IU-DASH-D-01`…`D-18` (M4); `artifactIdCount` + 18 no mesmo lote                                                                                                                                                                                                                                                                                                             |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-dashboard-i18n`                                    | TASK-0001  | `docs/framework/arch/i18n/dashboard.pt-BR.json` (M5): estados, frescor, severidades, blocos, camadas, relógios, classificação, 42 nomes de indicador transcritos de [APP-DASHBOARD] §Catálogo, erros `DASH.*`, títulos das 18 telas, textos fixos, 9 formulários                                                                                                                       |
| TASK-0004 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-dashboard-web-tests`                               | TASK-0003  | testes: roteamento por papel × camada (N3 sempre bloqueado), 9 schemas, `freshnessInterceptor`, célula suprimida visível, a11y (severidade por forma); teste tela ↔ ficha ↔ rota (18/18)                                                                                                                                                                                               |
| TASK-0005 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-dashboard-web-app`                                 | TASK-0004  | app completo (18 telas, guardas, SSE, gráficos); `pnpm check` estendido; README; testes verdes                                                                                                                                                                                                                                                                                         |
| TASK-0006 | Engineer             | engineer-frontend   | Sonnet / médio | `MOD-dashboard-web-forms`                               | TASK-0005  | 9 schemas com gates; testes verdes                                                                                                                                                                                                                                                                                                                                                     |
| TASK-0008 | Architect            | architect-blueprint | Opus / alto    | `MOD-r16-contract-ctg2`                                 | TASK-0003  | `contracts/CTG-0002.md` §1–§14 (scaffold, manifesto TS, rotas, guardas, shell, SSE/frescor, error boundary, 18 componentes, 18 páginas L0, i18n, schemas, fixtures, critérios C-02-nn) — A5                                                                                                                                                                                            |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                              | TASK-0006  | build pack, `dashboard-frontends.md`, backlog                                                                                                                                                                                                                                                                                                                                          |

CTG-0001 = 0001/0002/0003 (Architect explícito; 0002 ∥ 0003 com fronteiras disjuntas); CTG-0002 = 0008 → 0004 → 0005 ∥ 0006 (A5); CTG-0003 = 0007. Um PR por CTG (M7).

**Checkpoints de dependências (maestro, Engineer):** (a) após TASK-0001, `pnpm parameters:generate` + `pnpm verify:parameter-catalogue` (allowlist M5) e libera TASK-0002 ∥ TASK-0003; (b) no CTG-0002, o scaffold copiado de `apps/portal/web` + `pnpm install` + lockfile + extensão de `pnpm check` (tripla `pnpm --filter @detran/dashboard-web lint|test|build`) antes de liberar o Inspector (§4.18), como em R-0012 M1.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → `OK (756 artifacts, 446 canonical tokens)` (738 em 08fb84e8 + 18; se `main` avançar com fichas de R-0012/R-0013, o número sobe na integração por merge e o baseline é reconciliado no mesmo commit); `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → OK.
- `pnpm verify:parameter-catalogue` → `OK (… i18n namespaces, 0 errors)` com as linhas `dashboard.*` de M5; `pnpm parameters:generate` sem diff nos gerados (a allowlist não altera seed/TS gerados — conferido no checkpoint de TASK-0001).
- `node -e` sobre `docs/framework/arch/i18n/dashboard.pt-BR.json`: JSON válido, chaves planas, ordenadas, todas com prefixo de um namespace de M5; 42 chaves `dashboard.indicators.ind_dash_nnn` com o texto igual à coluna Nome de [APP-DASHBOARD] §Catálogo; 18 chaves `dashboard.screens.<slug>.title`; nenhum `{{`.
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

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Padrão de app: o primeiro frontend (R-0012, `apps/rait/web`) fixa `package.json` (scripts `build|test|lint|typecheck`), configuração Angular 22/vitest/eslint e a extensão de `pnpm check`; os apps seguintes copiam a estrutura, sem variantes.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): o namespace deste app entra na allowlist de i18n do `parameter-catalogue.md` lida por `tools/parameters/verify.mjs`; se R-0012 ainda não tiver mesclado essa regra, esta rodada a aplica (nunca exclusão por diretório).
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.
- `dashboard.*` já é prefixo de parâmetros vigentes (`dashboard.cell_threshold`): allowlist i18n obrigatória antes de `dashboard.pt-BR.json` entrar em código.

## Decisões do maestro (Architect, 2026-09-21)

- **M1 — Worktree e branch.** Esta sessão nasceu na worktree
  `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49` (padrão do
  app de desktop, o mesmo de R-0011 `dashboard-backend-r0011-615f16`); o branch foi renomeado para
  `orchestra/dashboard-console` a partir de `origin/main` 08fb84e8. Não existe (nem será criada)
  a árvore `detran-worktrees/dashboard-console` citada no prompt; ponte, workers e `devai` recebem
  o caminho real. A raiz do repositório fica reservada a humanos (Art. 27).
- **M2 — Famílias.** Maestro Fable 5.1 (Claude Code); workers por subagentes nativos
  (`architect-blueprint` → Opus, `transcriber-docs`/`inspector-tests` → Sonnet,
  `engineer-frontend` → Opus); reviewer `codex gpt-5.6-terra` pela ponte. Troca Sol → Fable
  decidida pelo Owner em 2026-09-21 (`AUTHORIZATION.md` §1); registrada em `waves.md` por
  TASK-0007.
- **M3 — CTG-0001 sem app.** As fichas e a semente i18n entram antes de `apps/dashboard/web`
  existir; o teste tela ↔ ficha ↔ rota ↔ i18n (18/18) é do Inspector no CTG-0002 (TASK-0004), como
  em R-0012 (c). No CTG-0001 os gates são `docs:kb:check`, `docs:kb:publish-check`,
  `format:check`, `verify:parameter-catalogue` e as verificações de arquivo dos §Critérios; a
  delivery-review do reviewer é o soft gate.
- **M4 — Ids e forma das fichas.** Arquivos
  `docs/framework/product/transversal/dashboard/screens/IU-DASH-D-01.md` … `IU-DASH-D-18.md`, id
  `IU-DASH-D-nn` (promoção dos ids D-01…D-18 do build pack e de `dashboard-frontends.md` §4 ao
  corpus — inconsistência 3 do build pack; `check.mjs` aceita `[A-Z0-9-]+`), `status: draft`,
  `apps: [dashboard]`, `sources` herdadas dos UC/JRN/RN citados, `updated: 2026-09-21`. Esqueleto
  de 12 seções do padrão R-0012 (`IU-RAIT-002`), com a seção Estados obrigatoriamente cobrindo os
  seis estados do WP-D4 — vazio, carregando, erro, indisponível (selo `INDISPONIVEL`, oculta em
  bloco A / marca em B–D), desatualizado (`DESATUALIZADO_MARCADO`), bloqueado por decisão
  (`DASH.PANEL_BLOCKED_BY_DECISION`, placeholder com a decisão e o link) — e os textos fixos onde
  se aplicam: "ver apuração de incidente" (D-01/D-02, alerta em `CRITICO_EXTINCAO` ou
  `INCIDENTE_REGISTRADO`), "sem prazo definido" (D-08/D-09, deveres 204/205/208, [RN-DASH-113]),
  "prazo do candidato, preclusivo" (D-04), "registro manual de ciência" (D-02, ACK `manual`).
  D-08 e D-14 nomeiam os dois conjuntos: "9 indicadores do bloco B" e "14 linhas da tabela-mestra
  ([RN-DASH-120])" (inconsistência 4). D-13 (P-09) é ficha completa com supressão secundária ativa
  (OD-D02/DT-029, `dashboard.cell_threshold=10`), não placeholder; o "bloqueado" residual é
  descrito como estado, não como tela ausente. Nenhuma ficha decide: lacuna vira `OD-D16-nnn`
  proposta no relatório.
- **M5 — i18n.** Semente única `docs/framework/arch/i18n/dashboard.pt-BR.json` (chaves planas,
  ordenadas, placeholders `{x}`), copiada inalterada para `apps/dashboard/web/src/app/i18n/` no
  CTG-0002 (padrão R-0012 M5). Namespaces (allowlist de `parameter-catalogue.md` §Namespaces
  i18n, App `apps/dashboard/web`, Catálogo `docs/framework/arch/i18n/dashboard.pt-BR.json`,
  Decisão `OD-P46`), escolhidos para **não** serem prefixo de chave de parâmetro (fail-closed do
  verificador: `dashboard.export.*`, `dashboard.duty.*`, `dashboard.transparency.*`,
  `dashboard.sre.*`, `dashboard.critical_extinction.*` existem):
  `dashboard.shell`, `dashboard.common`, `dashboard.states`, `dashboard.freshness`,
  `dashboard.alert_states`, `dashboard.duty_states`, `dashboard.severity`, `dashboard.blocks`,
  `dashboard.layers`, `dashboard.clocks`, `dashboard.classification`, `dashboard.indicators`,
  `dashboard.errors`, `dashboard.screens`, `dashboard.forms`, `dashboard.a11y`. Tokens entram em
  minúsculas (`dashboard.freshness.fresco`, `dashboard.alert_states.critico_extincao`,
  `dashboard.errors.alert_state_invalid` — código sem o prefixo `DASH.`, padrão do Portal;
  `dashboard.indicators.ind_dash_101`); o app compõe a chave (`'dashboard.indicators.' +
code.toLowerCase().replace(/-/g, '_')`) e o Inspector prova a cobertura. Os 42 nomes são a
  coluna Nome de [APP-DASHBOARD] §Catálogo, transcritos sem edição (o seed de R-0011 nasce da mesma
  fonte; divergência futura é `plant-bug` de quem divergir). TASK-0001 escreve as 16 linhas da
  allowlist; o maestro roda `pnpm parameters:generate` + `pnpm verify:parameter-catalogue` no
  checkpoint (Engineer, mecânico).
- **M6 — Manifesto de rotas.** `work/rounds/R-0016/route-manifest.md` (TASK-0001) é a única fonte
  de `path` ↔ `IU-DASH-D-nn` ↔ painel ↔ camada (Ação/Vigilância/Contexto/Técnico) ↔ camada de
  acesso exigida (N0/N1/N2) ↔ chave `dashboard:<recurso>:read` de `policy.ts` `DASHBOARD_RULES` ↔
  papéis (presença e ausência, `DASHBOARD_LAYER_BY_ROLE`) ↔ módulo §9 ↔ slug ↔ UC/JRN ↔ blocos.
  `/monitoramento/sem-permissao` e `/monitoramento/auth/callback` entram como rotas auxiliares sem
  ficha (R-0012 A2). N3 nunca é camada de rota: `dashboardLayerAllows(_, 'N3') === false`.
- **M7 — Cadência.** Um PR por CTG. CTG-0002 (`apps/dashboard/web`) exige `orchestra/dashboard-backend`
  (R-0011) para empilhar; em 2026-09-21 esse branch tem só `work/rounds/R-0011` (c639e1e5,
  14a2b924) — nenhum código. Após o merge do CTG-0001: se R-0011 tiver publicado o contrato
  `BP-DASH-MONITOR-001.commands.openapi.json` e o seed, o CTG-0002 nasce empilhado nele; senão,
  `checkpoint` em §Retomada e parada (AUTHORIZATION.md §3). Nunca commits novos no branch de um PR
  aberto.
- **M8 — Gráficos e schemas (decisões a fixar por TASK-0001 em `contracts/CTG-0002.md`).**
  `detran-ui-guide.md` e `packages/ui` não admitem biblioteca de gráficos: o default é SVG inline
  nos componentes de `shared/` (`DistributionChart`, célula suprimida visível, escala única);
  qualquer dependência nova é proposta `OD-D16-nnn`, nunca decisão. Schemas dos 9 formulários na
  forma do Portal (`apps/portal/web/src/app/forms/*.schema.ts`, zod + gates), um arquivo por
  formulário da `dashboard-frontends.md` §7.
- **M9 — Orçamento.** Janela 1: planejamento + TASK-0001 (Opus) + TASK-0002/0003 (Sonnet, em
  paralelo) + 2 prompt-reviews + 2 delivery-reviews ≈ 600 k de entrada; checkpoint a 560 k.

## Concorrência

Verificado em 2026-09-21 (`git log --oneline -30 origin/main`, `gh pr list --state all --limit 30 --search "orchestra/"`):

- Em `main` (08fb84e8): R-0003 (papéis/política `dashboard:*`, `dashboardLayerFor`), R-0006,
  R-0008, R-0009, R-0010, R-0014 (`apps/portal/web`, allowlist OD-P46), R-0012 CTG-0001 (63 fichas
  RAIT, PR #79), R-0013 CTG-0001/0002 (PR #73). Nenhuma rodada anterior tocou
  `docs/framework/product/transversal/dashboard/screens` além de `IU-DASH-001`.
- **CTG-0001 liberado para merge** (nenhum upstream). Locks partilhados com rodadas ativas:
  `docs/meta/knowledge-base/import-manifest.json` (R-0012 lotes seguintes e R-0013 criam fichas):
  integrar `origin/main` por merge antes do PR e reconciliar `artifactIdCount` no mesmo commit.
- **CTG-0002 preso** a R-0011 (`orchestra/dashboard-backend`, aberto em 2026-09-21 pelo maestro
  Fable, sem código ainda). Regra M7.
- Sem PR aberto de outra frente com lock em `apps/dashboard/web`.

Bootstrap (2026-09-21): `pnpm install --frozen-lockfile` OK; `pnpm exec devai doctor` todos `[✓]`
(claude-cli 2.1.236, codex-cli 0.147.0); `devai round plan --scaffold` respondeu
`ROUND_ALREADY_EXISTS` (rodada instanciada pelo PR #31), como em R-0012; `pnpm check` de linha de base
**verde** (exit 0, 19 scripts, ~45 min com a sessão R-0011 em paralelo) sobre 4cd43fa5 + arquivos da rodada.

## Triagem

- 2026-09-22 — TASK-0005 (Engineer, app), tentativa 1: abortada por **API 529 Overloaded** durante
  a leitura dos specs; `git status` confirma que nada foi escrito em `src/app/**` fora de `forms/`
  (TASK-0006). Triagem: falha de infraestrutura, não `plant-bug` nem `sensor-error` — redespacho
  idêntico (mesmo prompt, mesmo `PC-`), sem consumir iteração do §6.
- 2026-09-21 — `delivery-review-CTG-0001` ciclo 1: **FAIL** (4 achados `high`): (1) D-09 `prove`
  "evidência completa" contradiz [UC-DASH-003] AC-DASH-003-1 ("protocolo, captura ou hash") —
  `reference-gap` de transcrição: a fonte do prompt (`dashboard-frontends.md` §7) diverge do
  produto; corrigido pela regra "vale o artefato de produto", OD-D16-011 aberta para alinhar §7 e
  o contrato de rotas; (2) D-02 `incident:read` sem `agency-admin` (policy.ts o concede; A1) —
  `plant-bug` de transcrição; (3) contrato sem critério de matriz por comando — `reference-gap`
  do Architect; C-01-11 acrescentado; (4) C-01-04 dizia 312 e A4 fixa 307 — `sensor-error` do
  contrato; corrigido. Correções mecânicas aplicadas pelo maestro (Architect, dono de `docs/` e
  dos contratos — parcimônia §5, precedente R-0012 M6) em vez de redespachar; gates
  `docs:kb:check`/`format:check` verdes; ciclo 2 restrito.
- 2026-09-21 — CI do PR #80, `backend-kernel` (fallback remoto): 3 falhas em
  `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`
  (hash do `pg_dump --data-only` oscila entre dois valores antes/depois de `apply.sh` abortado;
  suíte de R-0007). O diff do PR não toca dado (só a linha de comentário com o SHA do cabeçalho de
  `05-parameters.sql`, invisível ao `pg_dump`) e a mesma suíte passou em `main` 08fb84e8 duas
  horas antes → `sensor-error` (flake); `gh run rerun --failed` → verde (20 min). Registrar no
  fechamento como recomendação a R-0007 (determinismo do snapshot de dados).

## Adendas

- **A1 — `policy.ts` prevalece (Architect, 2026-09-21, TASK-0001).** Onde `dashboard-frontends.md`
  §3 e `dashboard-route-contract.md` §2–§4 divergem de `DASHBOARD_RULES`/`DASHBOARD_LAYER_BY_ROLE`
  (OD-D16-003/004) e onde o passe global de `GLOBAL_ADMIN_ROLES` alcança `dashboard:*`
  (OD-D16-005), o manifesto adota o que o backend executa; o app espelha (guarda de permissão
  aceita `'*'`, guarda de camada não) e o Inspector prova presença e ausência com esse efeito. As
  divergências são `OD-D16-nnn` (`contracts/CTG-0001.md` §5), levadas a `open-decisions`/build pack
  por TASK-0007 — nunca decididas aqui.
- **A2 — Cobertura ficha ↔ i18n fechada em 312 chaves (Architect, TASK-0001).**
  `contracts/CTG-0001.md` §1.2 fixa as listas por namespace; `dashboard.clocks` só `b`/`c`
  (OD-D16-007); `dashboard.screens` exatamente `title|intro|empty` × 18. Rótulos sem fonte
  (formas de severidade OD-D16-009, finalidades N2 OD-D16-008) entram com valor provisório
  marcado ou ficam omitidos, conforme o contrato.
- **A3 — Referências de seção nos prompts (maestro).** Após o PASS do ciclo 2, `prompts/TASK-0002.md`
  e `TASK-0003.md` tiveram só as referências `§B.1/§B.2/§B.3` trocadas por `§1/§2/§3` (numeração
  real de `contracts/CTG-0001.md`); hashes recalculados em `compositions.json`. Sem mudança de
  conteúdo — não reabre revisão.
- **A4 — Semente com 307 chaves (Architect/maestro, 2026-09-21, TASK-0003).** As 5 chaves
  `dashboard.severity.shape.*` do contrato §1.2 ficam **ausentes** da semente até OD-D16-009
  (vocabulário de formas do `SeverityChip`, decisor Owner); o valor provisório de
  `contracts/CTG-0002.md` §Decisões 2 não é transcrito como rótulo. Critério C-01 do Inspector: a
  cobertura fecha em 307 (312 − 5), e `SeverityChip` prova forma + rótulo por `dashboard.a11y.severity_shape.*`
  só quando a OD fechar; até lá, a forma é provada por atributo de teste, não por texto.
- **A5 — "Prosseguir até a completa finalização" (Owner, 2026-09-21; AUTHORIZATION.md Amendment 1).**
  O corte por janela cai. CTG-0002 nasce **neste branch**, após o merge de #80, sem base empilhada
  (R-0011 sem código): toda tela em nível **L0** (`contracts/CTG-0002.md` §Decisões 6 — "indisponível
  nesta versão", nunca mock silencioso; nenhum `HttpClient` nas features), com roteamento, guardas,
  shell, SSE/frescor, error boundary, 18 componentes §5, 9 schemas, i18n e fixtures provados sem
  backend. Tríade: **TASK-0008** (Architect, Opus — contrato detalhado §1–§14) → TASK-0004
  (Inspector) → TASK-0005 (Engineer, app) **∥** TASK-0006 (Engineer, `forms/` — fronteira
  disjunta; antes dependia de 0005). Checkpoint b do maestro (scaffold de configuração copiado de
  `apps/portal/web`, `pnpm install`, lockfile, `pnpm check` estendido) entre TASK-0008 e TASK-0004.
  Quando R-0011 publicar `BP-DASH-MONITOR-001.commands.openapi.json` e o seed, integra-se por
  merge e as features sobem a L2 num CTG posterior (fora desta rodada se R-0011 não mesclar antes
  do fechamento — registrado em `backlog.md` por TASK-0007).
- **A6 — Ratificações do contrato CTG-0002 (Architect/maestro, 2026-09-21, TASK-0008).**
  (a) OD-D16-018: `DashboardRouteEntry` ganha `parent` (filhas `:id` de D-14/D-16 dentro do
  manifesto, C-01-01 mantido em 18) — ratificado, precedente R-0012 A3. (b) OD-D16-019: no app
  vale a **semente** (M5, cópia inalterada); TASK-0007 alinha `intro`/`empty` das fichas ao
  texto da semente (34/36). (c) OD-D16-012/014/015/016: os provisórios do contrato §14.1 valem
  nesta CTG; nenhuma chave i18n nova, nada em `packages/ui`. (d) Checkpoint b executado pelo
  maestro (f48cf2c6): a linha `check` da raiz já está estendida — TASK-0005 **não** a toca.
  (e) `pnpm check` completo só no checkpoint do grupo (após 0005 e 0006); cada Engineer prova a
  própria fronteira com `pnpm --filter @detran/dashboard-web typecheck` (§14.2 regra 2).

## Bloqueios

- 2026-09-21 — `prompt-review-1` (codex gpt-5.6-terra): **FAIL por estrutura** (3 achados `high`:
  D-13 × DT-066 em TASK-0002; rótulo "relógio {letra}" sem fonte em TASK-0003; contrato de
  cobertura ficha ↔ i18n não fechado entre TASK-0001/0002/0003). Nenhuma contradição canônica
  nem decisão do Owner reaberta: ciclo extra restrito admitido (README §10 R-0009 rec. 7, prática
  de R-0008/R-0009/R-0014 B0). Correções: D-13 só OD-D02/DT-029 (DT-066 fica em D-12); chave de
  relógio só com rótulo canônico, senão omitida + OD; `dashboard.screens.<slug>.{title,intro,empty}`
  exatas (54 chaves), nenhuma chave extra por ficha. Ciclo 2 restrito aos três itens.

## Retomada

**Estado em 2026-09-21 (maestro Fable 5.1) — sem parada:** o Owner instruiu "prosseguir até a
completa finalização" (AUTHORIZATION.md Amendment 1; adenda A5): o corte por janela cai e o
CTG-0002 segue neste branch em nível L0. PR #80 **mesclado** (merge 6a50f026, `audit observe`
EV-ded786c48daa2c5f). O texto abaixo vale como retomada se uma sessão cair.

- **Concluídas:** TASK-0001 (Architect, Opus — manifesto, contratos, allowlist), TASK-0002
  (18 fichas, baseline 756), TASK-0003 (semente i18n, 307 chaves). Reviews: prompt-review 1
  FAIL/2 PASS; delivery-review CTG-0001 1 FAIL/2 PASS. Evidência: generic sequence 1, head
  `511d404d…c71b59`. **PR #80** (`orchestra/dashboard-console` → `main`) aberto; CI e merge
  conforme §9 (merge só com CI verde; depois `audit observe` no SHA do merge e novo checkpoint).
- **Em curso:** TASK-0008 (Architect, Opus — contrato detalhado; prompt-review 3 FAIL → 4 PASS).
- **Pendentes:** checkpoint b (scaffold + `pnpm install`), TASK-0004 (Inspector), TASK-0005 ∥
  TASK-0006 (Engineers), delivery-review CTG-0002, PR, merge, `audit observe`; TASK-0007 (docs),
  PR, merge, `audit observe`, `round close`.
- **Próximos passos (se retomar):** (1) `git fetch` e `git merge --no-edit origin/main` (branch
  publicado, nunca rebase); (2) se `origin/orchestra/dashboard-backend` já tiver contrato e seed,
  integrá-lo por merge e subir as features a L2 (senão, L0 até o fim — A5); (3) seguir a tríade
  de A5 pelos prompts de `prompts/TASK-0004…0006.md` quando existirem, ou compô-los a partir de
  `contracts/CTG-0002.md` §1–§14; (4) TASK-0007 fecha (build pack, `dashboard-frontends.md`
  §7/§9/§10 com OD-D16-011, backlog, `waves.md` com a troca Sol → Fable).

## Leitura

HEAD `4cd43fa5faf2535d8a005eac25dbb5994b5273da` (2026-09-21). Lido pelo maestro, nesta ordem:
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`; `docs/meta/agents/orchestra/README.md`
(§1–§10), `model-ladder.md`, `waves.md` (linhas R-0011/R-0012/R-0016); `docs/framework/arch/dashboard-build-pack.md`
(inteiro) e `dashboard-frontends.md` (inteiro); `dashboard-route-contract.md` §2–§5;
`dashboard-error-catalog.md` §1, §6, §7; `parameter-catalogue.md` §DASHBOARD, §Namespaces i18n e
§Contrato de geração › Namespaces i18n; `tools/parameters/verify.mjs` (regra `isI18nLiteral`);
`docs/meta/knowledge-base/decision-closure-plan.md` (linhas DASHBOARD, OD-P46) e `steering.md` §H
(38–58); manuais `architect-blueprint.md`, `engineer-frontend.md`, `inspector-tests.md`,
`transcriber-docs.md`; `docs/framework/product/transversal/dashboard/screens/IU-DASH-001.md`,
`APP.md` §Catálogo e §KPIs, `WF-DASH-001` §Estados/§Classificação/§Distinção, `WF-DASH-002`
§Estados, `WF-DASH-003` §Estados/§Duas estratégias, `JRN-DASH-001` (amostra);
`backend/domains/shared/src/policy.ts` (bloco DASHBOARD_RULES e `dashboardLayerFor`), `roles.ts`
(`DASHBOARD_ROLES`); `tools/docs/kb/check.mjs` (regras de id, brackets e tokens) e
`import-manifest.json` (bloco `baselines`); padrão de rodada: `work/rounds/R-0012/{plan.md §A1,
tasks/TASK-0002.json, prompts/TASK-0002.md, reviews/prompt-review-1.md, evidence-CTG-0001.json,
budget.json}`; `docs/meta/agents/orchestra/{reviewer-prompt.template.md, task.template.json}`;
`tools/orchestra/bridge.sh`; `docs/framework/product/domains/inf/rait/screens/IU-RAIT-002.md`
(forma da ficha); `apps/portal/web/src/app/i18n/portal.pt-BR.json` e
`docs/framework/arch/i18n/{rait,teat}.pt-BR.json` (forma das chaves).
