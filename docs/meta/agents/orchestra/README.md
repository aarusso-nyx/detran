# Orquestras de execução — método (meta-orquestração)

**Autoridade:** Architect (Constituição Art. 6). Aplica `AGENTS.md`, a Constituição DEVAI
(`.devai/pin/constitution.md`) e os manuais de `docs/meta/agents/` ao backlog de implementação
descrito nos build packs (`docs/framework/arch/*-build-pack.md`). Não cria governança nova: dá
forma operacional ao que a Constituição já exige (arts. 10, 17, 18, 19, 23, 24, 25, 27, 35, 37).

Lema: **planeje muito para trabalhar pouco.** O custo caro é retrabalho, não planejamento.

## 1. Unidades

| Termo         | Definição                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frente**    | um pacote de trabalho (WP) de um build pack, ou um grupo acoplado de WPs, cujos grupos acoplados declaram, cada um, os upstreams que precisam estar em `main` para o merge (abertura só exige `main` atualizado). Lista em `waves.md`. |
| **Orquestra** | maestro + reviewer + workers dedicados a uma frente. Vive numa sessão nova, sem contexto anterior, iniciada com um único prompt (`prompts/00-maestro.md`).                                                                             |
| **Rodada**    | rodada DEVAI (`R-nnnn`) por frente: `work/rounds/R-nnnn/{plan.md, tasks/, prompts/, compositions.json, reviews/, budget.json}`; evidência e `audit observe` por rodada.                                                                |
| **Worktree**  | `../detran-worktrees/<frente>` sobre o branch `orchestra/<frente>`; a raiz do repositório fica reservada a humanos (Art. 27).                                                                                                          |
| **Tarefa**    | unidade atribuída a um worker: JSON no esquema DEVAI `task.schema.json` (`tasks/TASK-nnnn.json`), com critérios de aceitação executáveis.                                                                                              |

## 2. Papéis e famílias

| Papel        | Quem                                                                      | Responsabilidade                                                                                                  |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Maestro**  | modelo **grande** (GPT-5.6 Sol ou Fable 5.1); é o agente da sessão        | planner: lê, decompõe, escreve os prompts, dispara, verifica, commita, grava evidência, abre e mescla o PR        |
| **Reviewer** | modelo da **outra família** (nível grande ou médio), via ponte de CLI     | avalia os prompts dos workers antes do disparo e o diff de cada tarefa antes do PR; veredito PASS / REVIEW / FAIL |
| **Workers**  | modelos **médio/pequeno da mesma família do maestro**, subagentes nativos | executam uma tarefa cada, dentro da fronteira de escrita do seu papel constitucional; nunca tocam no git          |

Regras fixas: o reviewer nunca é da família do maestro (Art. 18, 23); workers nunca são da outra
família (decisão do Owner, 2026-09-14); duas orquestras ativas por vez, uma com maestro Sol e outra
com maestro Fable, para distribuir o consumo entre as janelas de 5 h de cada família.

Escolha de modelo por tarefa: `model-ladder.md`.

## 3. Ciclo de uma frente (o que o prompt do maestro executa)

```text
bootstrap ─► leitura obrigatória ─► plan.md + tasks/*.json ─► prompts/*.md
   ─► reviewer (prompt-review) ─► disparo dos workers ─► checkpoint (hard gates)
   ─► reviewer (delivery-review) ─► commit + evidência ─► PR ─► CI ─► merge
   ─► devai audit observe ─► round close ─► relatório + budget.json
```

Cada passo tem uma saída obrigatória em `work/rounds/R-nnnn/`; um passo sem saída não aconteceu.
O detalhe está em `maestro-prompt.template.md`.

## 4. Correção formal (não negociável)

1. **Tríade acoplada por comando ou entidade** (Art. 24): Architect define contrato, guardas e
   critérios → Inspector escreve os testes → Engineer implementa até os testes passarem. Uma
   tarefa por papel, mesmo `coupled_task_group`, merge na mesma ordem. Quem define a referência não
   atua sobre ela (Art. 10).
2. **Locks por módulo** (`target_modules`, Art. 25): duas tarefas nunca escrevem no mesmo módulo ao
   mesmo tempo; `backend/domains/shared/src/policy.ts`, `roles.ts` e o DDL são módulos de lock.
3. **Nada inventado**: valor sem fonte vira linha `source_pending` no catálogo de parâmetros
   (`docs/framework/arch/parameter-catalogue.md`) ou questão `OD-*`; nunca constante silenciosa.
4. **Código gerado não se edita** (ADR-0007): muda o blueprint, regenera, commita junto.
5. **Gates nunca se enfraquecem** (Art. 17, 29–31): `pnpm check`, tier de teste do WP,
   `blueprints:check`, `contracts:check`, `verify:*`. Falha é triada (bug / sensor / política /
   lacuna) antes de qualquer correção.
6. **Um PR por frente** (ou por grupo acoplado, quando a frente é grande), pelo template de PR, com
   papel declarado e evidência DEVAI.
7. **Vocabulário canônico**: estados, timers, papéis e erros vêm dos catálogos e workflows; a UI só
   traduz rótulos.
8. **Política prova presença e ausência**: toda matriz de grants tem testes positivos para os
   papéis listados e negativos para todos os papéis canônicos omitidos. Grants derivados por
   analogia são proibidos; qualquer ampliação exige fonte canônica ou decisão do Owner.
9. **Fixtures provadas no CI**: toda rodada que entrega fixtures (`backend/database/seed/*.sql`) prova
   `bash backend/database/seed.sh` em banco limpo **e** o job `backend-kernel` executa `seed.sh` após o
   reset (passo criado em R-0006); um seed novo que não carrega sob `seed.sh` é `plant-bug` da rodada que
   o criou (R-0004: `05-parameters.sql` sem contexto de tenant abortava o seed e o CI não percebia).
10. **Pacote novo montado no `AppModule`** entra também em `backend/app/vitest.config.ts` (alias para
    `src/index.ts`) e em `backend/app/package.json`; a fronteira do Engineer de wiring inclui esses dois
    arquivos (R-0006: o tier e2e do app falhou por resolução de `dist/` inexistente).
11. **`devai audit observe` exige o HEAD exato**: observar o merge logo após `git fetch`, antes de qualquer
    commit novo; ao aceitar a cadeia de `main` num merge, as observações do branch caem e são refeitas
    no fechamento sobre o merge final (R-0006).
12. **Histórico publicado não se reescreve**: rebase é permitido somente antes do primeiro push.
    Depois de publicar o branch, integre avanços do upstream ou de `main` com merge normal, rode de
    novo os gates e faça push sem força. `--force`, `--force-with-lease` e equivalentes são proibidos.
13. **Engineers não editam blueprints** (R-0009, M24): o Architect declara `module.handwritten*` com
    símbolos de nome fixo no blueprint; o Engineer só cria os arquivos; `typecheck` vermelho entre as
    duas tarefas do mesmo CTG é estado esperado. Toda mudança de blueprint de um CTG é agrupada num
    único checkpoint de regeneração (`blueprints:generate` custa 7–20 min por execução).
14. **Testes só do Inspector**: nenhuma tarefa de Engineer ou transcriber entrega o teste do próprio
    artefato (contratos → `contracts:test`; fichas/i18n → teste tela ↔ ficha ↔ rota; verificadores →
    caso negativo). R-0010 teve o prompt-review reprovado por isso.
15. **Transcrição de `docs/` e `i18n` é ato de Architect** (perfil `transcriber-docs`, R-0006), nunca
    "Owner delegado": toda lacuna vira `OD-*`, nunca decisão.
16. **e2e idempotente em banco persistente** (R-0009): cada arquivo limpa no `afterAll` o que criou;
    `DB_NAME` explícito no env da rodada (`work/rounds/R-nnnn/env-detran-rN.sh`); o CI usa banco
    limpo e não acusa.
17. **Chaves i18n não são parâmetros** (OD-P46, fechada): a allowlist vive em
    `parameter-catalogue.md` §Namespaces i18n e é lida por `tools/parameters/verify.mjs`; o
    verificador reconhece somente parâmetros declarados ou esses namespaces. Exclusão por diretório
    é proibida; R-0014 resolveu OD-P46 no primeiro frontend.
18. **Checkpoint de dependências entre tarefas**: pacote de workspace novo → o maestro roda
    `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector;
    contrato novo → `pnpm contracts:clients` antes dos testes que o consomem; o CTG seguinte só
    começa a escrever depois do merge do anterior, ou nasce em branch empilhado (nunca commits novos
    no branch de um PR aberto). Em R-0014: nunca commits em branch de PR aberto; vereditos são
    lidos integralmente; toda tríade declara Architect explícito; `typecheck` é critério do
    Inspector; iterações paralelas exigem fronteiras disjuntas (A12) e regra transversal só muda no
    módulo dono (A12(a)); asserções por conjunto de status e escapes condicionais são vedados
    (A15); um app isolado por arquivo de spec (A18); nomes `SENATRAN_*_BASE_URL` nunca aparecem em
    `backend/**` (A19(c)).

## 5. Parcimônia de tokens

- **Orçamento por janela de 5 h e por família**, declarado no prompt do maestro
  (`{{ORCAMENTO_5H}}`) e contabilizado em `budget.json` (estimativa por tarefa: tokens de leitura,
  tokens de saída, chamadas ao reviewer).
- **Planejamento é a fase cara e única**: o maestro lê o corpus uma vez e transfere para os
  prompts exatamente o que cada worker precisa; workers recebem listas de leitura fechadas, nunca
  "leia o repositório".
- **Workers pequenos por padrão**; médio só para modelagem, guardas de estado e frontend com
  STYNX/Angular; grande nunca como worker.
- **Esforço baixo para transcrição, alto só para decisão**; o reviewer roda uma vez por prompt e
  uma vez por entrega (máximo dois ciclos de REVIEW por item; depois escala ao humano). O primeiro
  ciclo é exaustivo; os seguintes ficam **restritos aos itens corrigidos** (R-0006: sete ciclos de
  prompt-review com achados novos sobre texto inalterado a cada ciclo).
- **Corte por janela**: se o orçamento da janela acabar, o maestro grava `checkpoint` (estado das
  tarefas em `plan.md` §Retomada) e para; a próxima sessão retoma pelo mesmo prompt.
- **Nunca reler o que já está em `plan.md`**: o plano é a memória da orquestra.

## 6. Escalada (Arts. 19 e 23)

| Situação                                              | Ação                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| hard gate falha após a entrega do worker              | triagem; 1 nova tentativa no mesmo nível com o achado no prompt                        |
| segunda falha                                         | 1 tentativa no nível acima da mesma família                                            |
| reviewer FAIL duas vezes no mesmo item                | reviewer da outra família decide entre as versões; se persistir, `escalated` ao humano |
| bloqueio por decisão do Owner (OD) ou por dependência | `checkpoint`; registrar em `plan.md` §Bloqueios; entregar o que não depende            |

Cada escalada é registrada na tarefa (`iteration_trail`).

## 7. Evidência e fechamento

```bash
pnpm exec devai evidence record --kind generic --round R-nnnn --repo-root . --as-role engineer --input work/rounds/R-nnnn/evidence-<tarefa>.json --write --format human
pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human
pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-nnnn --as-role auditor --write --format human   # após o merge
pnpm exec devai round close --round R-nnnn --repo-root . --input work/rounds/R-nnnn/closure.json --as-role architect --write --format human
```

A cadeia governada é `record/proofs/chain.json`; nunca editar à mão.

## 8. Ponte entre famílias

`tools/orchestra/bridge.sh <codex|claude> <modelo> <prompt.md> <saida.json> [<worktree>]` invoca a
CLI da outra família de forma não interativa e somente leitura, grava a saída em
`work/rounds/R-nnnn/reviews/` com o hash do prompt e do resultado. É o único caminho pelo qual o
reviewer entra na orquestra. Antes de calcular o hash, a ponte valida e normaliza o JSON com o
Prettier; saída inválida falha sem criar o registro `.bridge.json`. Sem tokens no repositório: a
autenticação é a da CLI instalada.

## 9. Correções pendentes nos build packs (PR próprio, antes da onda 2)

Gates que citam comandos inexistentes e que os maestros devem substituir pelos reais até a
correção: `ng build` de `apps/rait/web` e `pnpm --filter @detran/rait-web test` (não há pacote;
usar `pnpm --filter @detran/ui build|test` até o app existir), `openapi-typescript` (invocar por
script a criar em WP-C/WP-T3), "`contracts:check` estendido" (o script atual não valida exemplos
de comandos). O build pack do RAIT não tem seção OD própria: as questões vivem em
`docs/meta/knowledge-base/open-decisions-rait.md`.

Numeração de DDL nos build packs colide com arquivos existentes: BOAT cita `40-est-crash.sql`
(`40-ch-clinical-network.sql` existe) e DASHBOARD cita `50-dashboard.sql` (`50-ch-telehealth.sql`
existe); o RAIT diz que os DDL "34…37 já foram incluídos" no `apply.sh`, mas o script aplica
`ddl/*.sql` por ordem lexicográfica. Os planos das rodadas usam `70-est-crash.sql`,
`80-dashboard.sql`, `38/39/57/58-inf-*.sql`, `13/16/17/18/19-ops-*.sql` e `61…64-portal-*.sql`;
a tarefa de documentação de cada rodada corrige o build pack correspondente.

## 10. Histórico — lições e recomendações por rodada

A tabela por rodada (aberturas, merges, tokens) vive em `waves.md` §Histórico; esta seção guarda o
follow-up qualitativo de cada maestro: o que custou tempo, o que funcionou e o que muda no método.

### R-0009 `portal-backend` (Fable 5.1, 2026-09-16, PC-0006 — PRs #54, #56, #57)

**O que custou tempo (e o que evitar)**

1. **Fronteira de escrita do Engineer sobre blueprints.** A rubrica do reviewer (Art. 6/10) derrubou
   o plano duas vezes porque os prompts deixavam o Engineer editar `module.handwritten*` em
   `docs/framework/blueprints`. A solução que passou (`plan.md` M24) — o Architect declara os símbolos
   manuscritos com nomes fixos e o Engineer os cria — funcionou, ao preço de `typecheck` vermelho
   dentro do CTG. `engineer-backend.md` §Pode tocar ainda diz o contrário e precisa ser alinhado.
2. **Contrato escrito em paralelo ao blueprint.** TASK-0001 e TASK-0002 correram juntas para ganhar
   tempo; o preço foi a lista D1–D13 de diferenças DDL × contrato que Inspector e Engineers tiveram de
   reconciliar. Só compensa quando as M-decisões já fixam colunas; caso contrário, serializar.
3. **`main` avançou com o PR aberto e trabalho local não publicado.** Parquear a tarefa seguinte num
   branch temporário, integrar `main`, mesclar e reaplicar funcionou, mas é manual e frágil. Mais
   simples: abrir o PR do CTG só quando o CTG seguinte ainda não começou, ou trabalhá-lo num branch
   empilhado desde o início.
4. **Regeneração cara.** `blueprints:generate` roda o Prettier em todos os blueprints (7–20 min por
   execução); quatro regenerações por ajustes pequenos. Agrupar toda mudança de blueprint num único
   checkpoint por CTG.
5. **Testes não idempotentes em banco persistente.** Três iterações do Inspector foram só limpeza
   entre arquivos e2e (FK em `portal.subject`). O CI usa banco limpo e não acusa; localmente custa
   reseeds. Todo arquivo e2e limpa no `afterAll` o que criou.
6. **Defeito latente fora da frente.** `OpsParameterService` comparava `Date` com string e nunca
   encontrava parâmetro em banco real desde R-0004 — só apareceu quando o Portal leu um parâmetro por
   HTTP. Nenhum teste anterior exercitava o caminho real; vale um teste de integração no dono.
7. **Heurística do verificador de parâmetros × chaves i18n.** `portal.<x>.<y>` é candidato a
   parâmetro; os clientes gerados carregam chaves i18n e ficaram vermelhos. Exclusão estrita aplicada
   (A7), mas o problema volta quando `i18n/portal.pt-BR.json` entrar em código (OD-P46).

**O que funcionou bem**

- **Adendas numeradas (A1–A7)** para reconciliar contrato × código × canônico sem redespachar tarefas
  inteiras; o reviewer as aceitou como base de julgamento.
- **Ciclos restritos** de review (cada ciclo só sobre o que mudou): 3 prompt-reviews e 4
  delivery-reviews, nenhum achado novo sobre texto inalterado.
- **Iterações restritas do Inspector** (Sonnet, 4–14 min cada) para defeitos de spec, em vez de reabrir
  a tarefa.
- **Fakes do Inspector fixando assinaturas** antes dos Engineers (A5(f)): TASK-0007/0008 entregaram
  142/144 e2e de primeira; as duas falhas eram de ambiente/spec.
- **Delegações como porta + `SERVICE_UNAVAILABLE` com motivo** quando o upstream (R-0007) não existe:
  a frente fechou sem esperar e R-0007 só troca o mapa em `portal-delegation.providers.ts`.

**Recomendações ao método**

1. **§4** — adotar M24 como regra: o Architect declara `module.handwritten*` com símbolos fixos no
   blueprint; o Engineer só cria os arquivos; `typecheck` vermelho é estado esperado entre as duas
   tarefas do mesmo CTG. Alinhar `engineer-backend.md` §Pode tocar.
2. **§1/§4** — política de PR: um CTG por PR **e** o CTG seguinte só começa a escrever depois do merge,
   ou nasce num branch empilhado; nunca commits novos no branch de um PR aberto.
3. **`model-ladder.md` §Orçamento** — custo real de R-0009: Opus 240–740 k brutos por tarefa; Sonnet
   80–330 k; uma rodada de 2 CTG e 10 tarefas ≈ 2,1 M únicos / 4,6 M brutos numa janela estendida.
4. **`inspector-tests.md`** — idempotência em banco persistente (limpeza no `afterAll`, `DB_NAME`
   explícito no env da rodada) como critério padrão do tier e2e.
5. **Gate de parâmetros** — decidir OD-P46 antes de R-0014: prefixo reservado para i18n ou allowlist
   declarada no catálogo, em vez de exclusão por diretório.
6. **`blueprints:generate`** — formatar só os blueprints tocados (ou aceitar `--only <BP>`).
7. **Prompt do maestro §5** — distinguir FAIL por contradição canônica (parar e reportar) de FAIL por
   estrutura de fronteira corrigível (ciclo extra permitido, registrado em §Bloqueios); R-0008 e R-0009
   já operaram assim por decisão do Owner.

### R-0014 `portal-pwa` (Fable 5.1 → maestro Opus 5 na janela 4; workers/reviewer Codex a partir de 2026-09-19 — B3; PRs #60…#65)

**O que custou tempo**

1. Prompt-reviews FAIL por estrutura exigiram reescrita antes de disparar workers; B0 é um desvio
   registrado, não autorização para ignorar o veredito.
2. A9/A10 deixaram cobertura inicialmente declarada parcial; o Inspector precisou torná-la integral.
3. A12 tornou explícita a regra transversal: o `ErrorBoundary`, módulo dono, absorve status 0.
4. O Codex trunca comandos acima de 30 s; as suítes precisaram de processo em segundo plano, log e
   polling pelo maestro.
5. O sandbox não disponibiliza `pkill`; o isolamento de processos precisa vir do arquivo de spec.
6. Asserções por conjunto de status e escapes condicionais esconderam casos e foram vedados em A15.
7. O Inspector fez 11 iterações no CTG-0004; isso expôs lacunas de fixtures, não justificou reduzir
   cobertura.
8. A fonte homônima do seed não bastou para o contrato: o Architect precisou ler a fonte do serviço.

**O que funcionou**

1. Tríade com Architect explícito em cada CTG; contrato antes de Inspector e Engineer.
2. O contrato como spec manteve decisões e negativas verificáveis durante as iterações.
3. `tools/orchestra/worker.sh` registrou executor, hashes e a proibição de `git` do worker.
4. A ponte de revisão com fontes, ratificada em A24, evitou alterar enum/OpenAPI por paráfrase.
5. Fronteiras disjuntas permitiram as iterações paralelas de A12 sem corrida de escrita.

**Números e recomendações**

1. `budget.json`: 6.959.875 tokens estimados de entrada e 1.262.818 de saída; janela 4 encerrou
   com aproximadamente 4,93 M únicos acumulados.
2. Reviews: CTG-0001 4, CTG-0002 2, CTG-0003a 2, CTG-0003b 6, CTG-0003c 2 e CTG-0004 3;
   prompt-reviews 12 ciclos (incluindo ciclos restritos).
3. CTG-0004: contrato em 2 iterações, Inspector em 11 e Engineer em 5; delivery-review
   FAIL → FAIL contestado → PASS.
4. Manter Architect explícito, leitura integral do veredito e `typecheck` no critério de Inspector.
5. Para matriz grande, usar Sonnet/médio ou Terra/médio; não reduzir o conjunto de estados.
6. Proibir escapes condicionais e manter um app isolado por arquivo de spec.
7. Registrar variáveis de mock só no shell/CI: `SENATRAN_*_BASE_URL` não entra em `backend/**`.

### R-0011 `dashboard-backend` (Fable 5.1, 2026-09-21 — troca de família Sol → Fable por decisão do Owner; PR #83 CTG-0001, CTG-0002 PR a abrir)

**O que custou tempo**

1. **Grep de produtores antes de declarar upstream em `main`.** O plano §Concorrência registrava
   `rait.clock.flag-changed` e `rait.decision.published` como publicados pelo PR #69 do RAIT; um
   grep de produtores em `backend/domains/**/src` em `08fb84e8` mostrou só
   `rait.case.changed|admitted|received|withdrawn` e `rait.assignment.changed`. Triado como
   `reference-gap` (OD-D17): IND-DASH-101…105 nasceram `connected=false` sem retrabalho, porque M5 já
   previa a regra — mas a linha de §Concorrência precisou ser corrigida. Verificar produtores reais
   antes de escrever "já em `main`" em qualquer plano.
2. **`apply.sh --full` restrito por R-0007.** O banco da rodada (`detran_r11`) não pôde usar
   `--full` (R-0007 o restringiu a `detran_r7_ctg1_a2` com uma variável de autorização); resolvido com
   `create database` uma vez e `apply.sh` incremental de resto.
3. **O gerador emite controllers vazios mesmo com `operations: []`.** Igual ao pacote `crashes` de
   R-0010, o `MonitorModule` registra 20 controllers vazios; a asserção original de "nenhum controller
   registrado" contradizia o gerador (A9/A10). Critérios de "nenhuma rota altera domínio" precisam
   falar de métodos de rota ausentes, nunca de ausência de classe `*Controller`.
4. **Inventário fechado de DDL é literal em outro spec.** `rait-priority-upgrade.integration.spec.ts`
   (lock de R-0007) fixa em um número a lista `ordinary` de `apply.sh`; o CTG-0001 levou essa lista de
   60 para 62, quebrando o CI até o Inspector corrigir o literal (precedente igual em R-0010: 57→60).
   Recomendação: o inventário fechado deveria derivar de `apply.sh` (como
   `prepare-rait-priority-v1-baseline.mjs` já faz), não um número hardcoded.
5. **`export *` de vários `*.projection.ts` com `consumedEvents` colide.** O `index.ts` de um pacote
   que reexporta `export *` de módulos que declaram o mesmo identificador `consumedEvents` gera
   `TS2308` (A13); vale tanto para `portal/projections` quanto para `dashboard/monitor`. Correção: o
   `index.ts` nunca faz `export *` de um `*.projection.ts` — reexporta por nome, e `consumedEvents`
   fica export local do módulo (o gate lê o arquivo, não o índice).
6. **Gate de parâmetros × literais de evento.** `tools/parameters/verify.mjs --check-usage` tratava
   os literais de `export const consumedEvents = [...] as const` (exigidos pelo gate `verify:domain-
boundaries`, M6/ADR-0020) como candidatos a chave de parâmetro desconhecida (A14). Correção: a
   declaração `consumedEvents` literal entra em `isSourceEventDeclaration` — nunca exclusão por
   diretório nem allowlist de chave.
7. **`ci:backend-kernel:local` exige branch publicado e ambiente RC protegido.** Na máquina local, sem
   esse ambiente, o mock SENATRAN encadeou timeouts de 30s no e2e do Portal; o mesmo spec sem mock deu
   9/10 (a falha esperada). O CI é o sinal autoritativo, não a corrida local.

**O que funcionou**

1. **Divisão ciclo × superfície do CTG-0002** (TASK-0004/0005 sobre o ciclo do alerta/deveres/frescor;
   TASK-0013/0014 sobre rotas/política/exportação/SSE — M15…M25, A18): fronteiras disjuntas, sem
   corrida de escrita, no mesmo padrão que a divisão TASK-0002∥0011/TASK-0010∥0003 do CTG-0001.
2. **Iterações restritas curtas** (1–4 min, 14 no total entre os dois CTG) resolveram os achados de
   A7…A23 sem redespachar tarefa inteira.
3. **Adendas numeradas do Architect** (A1…A23) reconciliaram contrato × código × canônico sem parar a
   frente; o reviewer as aceitou como base de julgamento nos ciclos restritos.
4. **`AUTHORIZATION.md` como registro de decisão do Owner** (Emenda 1: prosseguir até a finalização do
   CTG-0001; Emenda 2: abrir o CTG-0002 pela via M7/A3, relógio próprio, sem esperar R-0007 CTG-0003)
   manteve a frente andando sem bloquear na dependência externa.

**Recomendações ao método**

1. **§4** — todo plano que cita um evento como "já publicado em `main`" deve mostrar o grep de
   produtores que sustenta a afirmação, não só o nome do PR.
2. **Gate `verify:domain-boundaries` (ADR-0020)** — dívidas declaradas (`OD-*`) impressas, nunca
   silenciosas; qualquer rodada que generalize um verificador deve rodá-lo sobre o repositório inteiro
   antes de ligá-lo a `pnpm check` e corrigir as violações existentes no mesmo PR.
3. **`tools/domain-boundaries` / `tools/check-lifecycle-vocabulary.ts`** — todo DDL novo de vocabulário
   (`19-*`) precisa atualizar o inventário fechado do spec de prioridade e o próprio verificador de
   vocabulário no mesmo PR.
4. **Blueprints** — manter M24 (o Architect declara `module.handwritten*` com símbolos fixos; o
   Engineer só cria os arquivos; `typecheck` vermelho entre tarefas do mesmo CTG é esperado).
5. **Relógio próprio via M7/A3** — quando uma frente depende de um motor de prazos ainda não mesclado,
   preferir relógio próprio do pacote (`Calendar`/`Clock` como dependência de leitura, nunca editar o
   pacote dono) a bloquear a frente inteira; registrar a integração futura como OD explícita (OD-D28).

### R-0012 `rait-web` (Fable 5.1 → maestro Opus 5; reviewer `codex gpt-5.6-terra`; 2026-09-21/22; PRs #79, #81, #85, #90 + CTG-0002c)

**O que custou tempo**

1. **Contrato grande demais para uma tarefa.** O contrato do CTG-0002b (91 critérios, 50 páginas,
   26 componentes, 8 clientes, 11 facades) excedeu o que um worker entrega com rigor: dividido em
   dois pares com PR próprio (A8) já depois de escrito. O Inspector do par 2 ainda precisou de três
   iterações só para cobrir os 15 módulos. Regra prática: um contrato de CTG cabe em ~40 critérios
   e ~25 arquivos de produção; acima disso, dividir **antes** de escrever os prompts.
2. **Fixtures de teste que não acompanham o contrato.** Três iterações inteiras (A10, A14, A15)
   foram gastas em `stubFacade`/`pageProviders` sem os métodos das facades, harness sem
   `StynxSessionService`, `render()` repetido no mesmo `it` e caminhos errados de leitura de ficha.
   Vale o Architect fixar no contrato a **assinatura do stub** (não só a da produção) e o Inspector
   provar o stub contra a interface real num `it` próprio.
3. **Matriz de autorização por amostra.** O reviewer reprovou duas vezes (A11, A15) matrizes que
   testavam "um papel permitido e um negado" e confirmações de uma só ação por página. A regra
   §4.8 é exaustiva: **todo** papel canônico e **toda** ação com confirmação, geradas por laço
   sobre a fixture de política.
4. **`main` andando em paralelo.** Quatro merges de `main` na rodada (R-0011, R-0013, R-0016,
   DEVAI 1.5.4/1.5.5/1.5.6), dois com conflito na allowlist i18n e na cadeia de evidência, e um PR
   recusado por avanço de `main` entre o CI verde e o merge. A cadeia (`record/proofs/chain.json`)
   resolve-se sempre aceitando `main` e **regravando** a evidência da rodada.
5. **Falha intermitente de CI alheia à frente.** `rait-priority-upgrade.integration.spec.ts`
   (R-0007) falhou em dois PRs só de frontend e passou no rerun; custou ~50 min de espera.

**O que funcionou**

1. **Tarefa de transcrição própria para i18n** (A12, TASK-0016/0017): tirou do Engineer o que o
   método já reserva ao Architect e tornou o catálogo verificável por um `it` de contagem exata.
2. **Adendas numeradas como único canal de reconciliação** (A1…A16): 20 iterações restritas sem
   nenhuma reabertura de tarefa e sem nenhum spec alterado fora de adenda.
3. **Contrato com assinaturas exatas** (arquivo, símbolo, tipo, `operationId`): o Engineer do
   CTG-0002c entregou **verde na primeira iteração** (4434 testes) com 100 critérios.
4. **Pré-condição de despacho explícita no prompt** (SHA do merge do CTG anterior em §Concorrência):
   evitou que um par começasse a escrever sobre árvore desatualizada.

**Recomendações ao método**

1. **§4** — limite de tamanho por CTG (≈40 critérios / ≈25 arquivos de produção); acima disso o
   Architect entrega o contrato já dividido em pares.
2. **§4.13** — o contrato fixa também a **assinatura dos stubs** que o Inspector escreve; um `it`
   prova o stub contra a interface real.
3. **§4.8** — a matriz de autorização é sempre gerada por laço sobre a fixture de política (papéis)
   e sobre a lista de ações com confirmação; amostra é achado `high` na delivery-review.
4. **§9** — quando `main` avança entre o CI verde e o merge, integrar por merge e **reexecutar o
   CI** antes de tentar de novo; falha de CI em teste de outra frente, reproduzível como
   intermitente, é `gh run rerun --failed` (não é triagem da frente).
5. **`model-ladder.md`** — custo real de R-0012: Opus 330–780 k brutos por tarefa de Engineer;
   Sonnet 100–830 k por tarefa de Inspector com matriz grande; rodada de 5 CTG e 17 tarefas
   ≈5,5 M únicos / ≈12 M brutos.

## Arquivos deste método

| Arquivo                                 | Uso                                                                 |
| --------------------------------------- | ------------------------------------------------------------------- |
| `README.md`                             | este método (+ §10 histórico de lições por rodada)                  |
| `model-ladder.md`                       | escada de modelos, esforço e escolha por tipo de tarefa             |
| `waves.md`                              | frentes, dependências, locks, família do maestro, rodadas           |
| `maestro-prompt.template.md`            | prompt único da orquestra (agnóstico de família)                    |
| `reviewer-prompt.template.md`           | prompt do reviewer (modos prompt-review e delivery-review)          |
| `worker-prompt.template.md`             | esqueleto dos prompts de worker, por papel                          |
| `task.template.json`                    | tarefa no esquema DEVAI (`task.schema.json` 2.0.0)                  |
| `../../../../tools/orchestra/bridge.sh` | ponte de CLI para o reviewer                                        |
| `../../../../work/rounds/`              | instâncias por rodada (R-0003…R-0016, uma por frente de `waves.md`) |
