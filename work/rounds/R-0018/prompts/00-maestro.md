# Prompt do maestro — orquestra `index-state` (rodada `R-0018`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Anthropic — Claude Code com Opus 5.5`
> (Claude Code com Opus 5.5, ou Codex CLI com Sol 6), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/index-state`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.
>
> **Pré-condição:** o Owner autorizou `work/campaigns/C-0002-consolidacao.md` (rev. 2),
> `work/rounds/R-0018/plan.md` e este prompt, e a campanha, a ADR-0034 e a linha dela em
> `docs/meta/adr/README.md` estão em `origin/main`. Sem isso, pare antes do §1 e reporte.

## 0. Identidade e limites

- Você é o maestro da frente **`index-state`**: **ação 3 da campanha C-0002** (índice de ADRs
  racionalizado e índices de estado), definida em `work/campaigns/C-0002-consolidacao.md` §2 e
  detalhada em `work/rounds/R-0018/plan.md`. Esta frente não tem build pack: o plano é a fonte.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt. Papéis estão
  no **Art. 7** da Constituição DEVAI 1.0.0 (o Art. 6 é autoridade por caminho).
- Família dos seus workers: **a sua** (`Anthropic — Claude Code com Opus 5.5`), por subagentes
  nativos da sua CLI (`architect-blueprint` → Opus 5.5; `transcriber-docs`, `inspector-tests`,
  `engineer-backend` → Sonnet 5). Família do reviewer: **a outra** (`codex`), modelo **Sol 6**
  (id confirmado em M1), sempre pela ponte `tools/orchestra/bridge.sh`. Nunca inverta.
- **M1 — ids de CLI, antes de qualquer outra tarefa:** se `work/rounds/R-0017/plan.md` §Decisões do
  maestro (em `origin/main` ou em `origin/orchestra/local-stack`) já registra os ids de Sol 6,
  Terra, Luna e Opus 5.5, confira-os (`codex --help`, `~/.codex/config.toml`, `claude --help`) e
  copie; senão, confirme você mesmo (`codex exec -m <id> "responda ok"`,
  `claude -p --model <id> "responda ok"`) e prove a ponte com um prompt trivial
  (`tools/orchestra/bridge.sh codex <id-sol-6> <p.md> <o.json> <worktree>`). Registre em `plan.md`
  §Decisões do maestro (M1); esses ids são insumo de `model-ladder.md` (Meta 9). Se "Sol 6" não
  existir com esse nome, **pare** e reporte ao Owner (C-0002 §7).
- Orçamento desta janela de 5 h: **frente prevista para 2 janelas; nesta janela, M1 + planejamento
  de maestro + CTG-0001 (TASK-0001 Opus 5.5, TASK-0002/0003/0004 Sonnet 5) com 1 prompt-review e 1
  delivery-review ≈ 600 k tokens de entrada; ao atingir 80 % (≈ 480 k) grave checkpoint e pare**.
  Contabilize em `work/rounds/R-0018/budget.json` (obrigatório; uma linha por tarefa e por chamada
  ao reviewer, com estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9)
  e pare — sem dispensa implícita.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- **`CLAUDE.md` e `AGENTS.md` são autoridade do Owner:** esta rodada só produz patches em
  `work/rounds/R-0018/proposals/`; aplique-os somente com aceite explícito do Owner (OD-R18-003),
  registrado em `plan.md` §Decisões do maestro.
- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado
  (≥ `a92ef731` com a campanha C-0002) — nunca pare por upstream ainda não mesclado. O que depende
  de upstream é o **merge de cada grupo acoplado**: **CTG-0001 (ADR de política, renumeração,
  índices de ADR, `law/adr/`, gate `verify:state-index`, `work/rounds/README.md`): nenhum upstream.
  CTG-0002 (documentos de estado, `model-ladder.md`, `.gitignore`/`.prettierignore`, patches de
  CLAUDE/AGENTS): nenhum upstream; nasce após o merge do CTG-0001 ou empilhado. CTG-0003 (READMEs):
  após o CTG-0002; o item `tools/README.md` cita a stack só se R-0017 `local-stack`
  (`orchestra/local-stack`) já estiver em `main`. Rodadas paralelas da fase A: R-0017 e R-0019
  `law-corpus` (`orchestra/law-corpus`), locks disjuntos — não toque em
  `law/{invariants,policy,schemas,glossary}/**`, `product/**`, `tools/detran-stack*`,
  `tools/stack/**`, `docs/dev/**`, `backend/database/**`. Arquivos partilhados `package.json`,
  `waves.md`, `open-decisions-rait.md`, `work/rounds/README.md` — integre `origin/main` por merge
  antes de cada PR**. No bootstrap, registre em `plan.md` §Concorrência quais upstreams já estão
  em `main` (`git log --oneline -30 origin/main`, `gh pr list --state merged --limit 20`), quais
  grupos estão liberados para merge e quais serão desenvolvidos sobre base empilhada (§1). Grupos
  livres avançam sempre; grupos presos aguardam ou empilham, nunca bloqueiam a rodada inteira.
  Confira também que o número R-0018 continua livre (`ls work/rounds`).

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/index-state já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0018/plan.md   # checkpoint anterior?
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/index-state` remoto sem worktree local →
`git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/index-state" orchestra/index-state`;
(d) PR aberto de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e
trate como upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016; detalhe em `waves.md` §Histórico e na
campanha C-0002 §4):
(1) crie `work/rounds/R-0018/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
este prompt e o `plan.md` — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote
de workspace novo exige `pnpm install` pelo maestro e commit do `pnpm-lock.yaml` antes do push (CI
usa `--frozen-lockfile`); (3) toda edição de `docs/framework/arch/parameter-catalogue.md` é seguida
de `pnpm parameters:generate`, e specs nunca contêm chaves de parâmetro como literal
(`verify:parameter-catalogue`); (4) helper `.mjs` importado por spec TS precisa de `.d.mts` irmão;
(5) pacote novo montado no `AppModule` precisa de alias em `backend/app/vitest.config.ts`;
(6) workers não deixam `pnpm check` rodando em segundo plano — encerre processos perdidos pelo pid
exato antes dos seus gates, nunca por padrão de nome; (7) `git add record/proofs` explícito em cada
commit de evidência; (8) `audit observe` só no HEAD exato integrado; se outra rodada fechar antes,
aceite a cadeia de `main`, observe o HEAD integrado e repita `round close` (o id de fechamento muda);
(9) `seed.sh` faz parte do CI e a rodada dona das fixtures prova as duas execuções (não é esta);
(10) ciclos de revisão a partir do segundo restritos aos itens corrigidos; contradição entre
contrato e código é resolvida pelo Architect por adenda numerada antes de redespachar;
(11) **relatórios versionados:** `git add -f work/rounds/R-0018/reports/` até o CTG-0002 corrigir o
`.gitignore`; depois de cada `git add` de grupo, compare `find <dir> -type f` com
`git ls-files <dir>` antes do push (um `add` que ignora diretório não falha; o mesmo padrão esconde
arquivos do Prettier); (12) **critérios de aceitação não se reescrevem:** mudança só por adenda
numerada em `plan.md` com decisão do Owner; o critério substituído vai ao `closure.json` como
**não cumprido**; (13) **ODs no registro canônico** (`docs/meta/knowledge-base/open-decisions-rait.md`,
seção da rodada) no mesmo PR que as cita; (14) **âncora da prova na cadeia:** cada
`evidence record` precisa aparecer ancorado em `record/proofs/chain.json` antes do fechamento;
conflito em `chain.json` nunca se resolve à mão; (15) **DEVAI 1.5.6** é o pacote instalado
(`package.json`, `.devai/config/project.json`); o pin da Constituição segue 1.0.0; menções a 1.4.5
são drift a corrigir, não instrução; (16) o closure só afirma os 5 checks obrigatórios reais da
proteção de `main` (`evidence-gate`, `foundation`, `senatran-mock`, `senatran-mock-tests`,
`verified-local-rc`); (17) `closed_at` é o instante real do fechamento, nunca sintético;
(18) **caracterização antes de troca:** o gate roda primeiro em modo relatório sobre `main` e a
lista de divergências entra no contrato antes de qualquer correção.
Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/index-state
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai round plan --scaffold --round R-0018 --repo-root . --as-role architect --write --format human
```

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/index-state "/Volumes/Thiamat II/stech/detran-worktrees/index-state" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/index-state`) sem PR para que outras frentes empilhem sobre ele.

**Avanços do `main` durante a rodada.** Outras frentes mesclam enquanto você trabalha. No início de
cada janela, em cada checkpoint (§7) e antes de cada PR (§9): `git fetch -q origin` e
`git log --oneline HEAD..origin/main`; se houver commits novos, use `git rebase origin/main` somente
se o branch nunca foi publicado. Caso contrário, use `git merge --no-edit origin/main`. Nunca use
`--force`, `--force-with-lease` ou equivalente. Depois da integração, rode de novo os gates do
grupo. Ao resolver conflitos: arquivo **gerado** (`backend/domains/**/src/generated`, contratos
`*.openapi.json` gerados, `ddl/*.sql` de blueprint) → nunca edite à mão, aceite qualquer lado e
regenere; `record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl` → aceite a versão de
`main` e rode `devai evidence record` de novo para os seus commits (a cadeia nunca é mesclada à
mão); `pnpm-lock.yaml` → aceite `main` e `pnpm install --frozen-lockfile`;
`work/rounds/README.md`, `DESIGN-DECISIONS.md`, `docs/meta/adr/README.md`, `package.json`,
`waves.md`, `open-decisions-rait.md` → mantenha as linhas das duas partes e rode
`pnpm verify:state-index` (depois do CTG-0001). **Antes de criar ou renumerar uma ADR, confira o
próximo número livre com `ls docs/meta/adr`** (R-0017/R-0019 podem ter criado ADRs). Se o rebase
invalidar um veredito `PASS` do reviewer (diff mudou de forma substantiva), peça nova
`delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CLAUDE.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `work/campaigns/C-0002-consolidacao.md` inteiro; depois os documentos do "mapa entregável →
   definições" do `plan.md`: `DESIGN-DECISIONS.md`, `docs/meta/adr/README.md`, o status de cada
   `docs/meta/adr/ADR-*.md` (`## Status` ou `- Status:`) e
   `law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`, `law/adr/README.md`,
   `work/rounds/README.md`, `record/proofs/compliance/closures/PC-*.json` (campos `round_id`,
   `closed_at`, `merged_as`), `tools/docs/kb/check.mjs` (forma de verificador), `.gitignore` e
   `.prettierignore`
4. `docs/meta/knowledge-base/decision-closure-plan.md`, `docs/meta/knowledge-base/steering.md` §H
   (decisões do Owner já tomadas: não reabra nenhuma); cabeçalho e seções A/F/G de
   `docs/meta/knowledge-base/open-decisions-rait.md` (forma do registro de OD)
5. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`
6. `work/rounds/R-0018/plan.md` (metas e critérios já extraídos para esta frente)

Os insumos da inspeção de 2026-09-25 (`work/campaigns/C-0002-inspecao-2026-09-25/{c-modulos,e-devai,f-rounds-planos,g-documentacao}.md`)
estão versionados com a campanha; os achados necessários já estão no `plan.md`; não
os cite como fonte em artefato versionado.

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0018/plan.md` + `tasks/`

A tabela §Tarefas do `plan.md` é a **proposta autorizada**; converta-a em tarefas no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`) sem mudar escopo,
obedecendo:

- **Tríade por entregável**: `TASK` Architect (contrato, critérios) → `TASK` Inspector (testes que
  codificam os critérios) → `TASK` Engineer (implementação até os testes passarem); mesmo
  `coupled_task_group`, `upstream_task_id` encadeado. Transcrição (índices, READMEs, build packs,
  escada) é tarefa simples de `transcriber-docs`.
- **`target_modules`** com os módulos de lock do `plan.md` (`MOD-*`); duas tarefas com o mesmo lock
  nunca correm juntas.
- **`acceptance_commands`** só com comandos que existem em `package.json` ou arquivos verificáveis;
  os scripts novos (`verify:state-index`, `test:state-index`, `adr:renumber`) só entram em
  `acceptance_commands` de tarefas **posteriores** a TASK-0003. Nunca herde um comando inexistente
  (ver `orchestra/README.md` §9).
- **Tarefas válidas contra `task.schema.json` 2.0.0** (143/260 tarefas históricas são inválidas):
  `target_invariants` só com ids `INV-*` (se R-0019 já tiver publicado `law/invariants/`, use-os;
  senão, lista vazia — nunca WF/RN/ADR/OD em texto livre); `db_isolation` ∈ {`database`,
  `cluster`}; `coupled_task_group`, `coupled_pipeline_position`, `executor` completos. Valide cada
  JSON com
  `pnpm exec devai check --only schema --schema node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/task.schema.json --instance <tarefa> --repo-root .`
  antes do prompt-review.
- **Modelo e esforço** pela escada Claude (C-0002 §4) e `model-ladder.md`; anote no `executor`.
- Ordem topológica e paralelismo possível (sem lock comum e sem dependência, no máximo três por vez).

`plan.md` recebe: metas da frente, tabela de tarefas (id, papel, modelo, lock, depende de,
critérios), mapa entregável → definições, riscos, §Bloqueios (vazio), §Retomada (vazio),
§Leitura.

## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`

Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras:

- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
- Transfira para o prompt os trechos de definição que o worker precisa (lista de ADRs com status e
  classificação, mapa de renumeração, tabela-verdade das rodadas, lista fechada de caminhos vivos ×
  históricos, ids de CLI de M1), em vez de mandar procurar.
- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
  `source_pending` ou abrir `OD-R18-nnn`.
- Proibição explícita em todo prompt: não editar `CLAUDE.md`, `AGENTS.md`, `record/**`,
  `.devai/**`, `work/rounds/R-0001…R-0016/**`, `work/campaigns/**`, o conteúdo normativo de ADR
  aceita, nem os locks de R-0017/R-0019 listados no §0.
- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
  `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).

## 5. Revisão dos prompts (reviewer, outra família)

Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
em modo `prompt-review`, anexando `plan.md` e todos os `prompts/*.md`. Invoque (id de M1):

```bash
tools/orchestra/bridge.sh codex <id-sol-6> work/rounds/R-0018/reviews/prompt-review-1.md work/rounds/R-0018/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/index-state"
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`/Volumes/Thiamat II/stech/detran-worktrees/index-state`. Se a sua CLI não tiver subagentes,
execute você mesmo a tarefa **como se fosse o worker**, obedecendo estritamente ao prompt daquela
tarefa (fronteira de escrita inclusive). Marque `status=in_progress` na tarefa; ao receber o
relatório, grave-o em `reports/TASK-nnnn.md` (versionado, lição 11).

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa e, ao fim de cada grupo acoplado, `pnpm check`,
`pnpm docs:check` e (a partir do CTG-0001) `pnpm verify:state-index`. Checkpoints próprios desta
rodada (`plan.md` §Tarefas): (a) `pnpm adr:renumber` em dry-run, revisão da lista, `--write`,
`git diff --stat` só em caminhos vivos; (b) `find` × `git ls-files` e `pnpm format:check` depois
da correção do `.gitignore`. Falha → triagem em uma linha
(`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md` §Triagem → 1 nova
tentativa com o achado no prompt → se falhar, nível acima da mesma família → se falhar,
`escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado.

## 8. Revisão da entrega (reviewer, outra família)

Para cada grupo acoplado concluído: `git diff --stat` + diff completo + relatórios + critérios em
`reviews/delivery-review-<ctg>.md` (modo `delivery-review`) → ponte (`codex <id-sol-6>`) →
veredito. `PASS` libera o commit; `REVIEW` volta ao worker responsável (máximo 2 ciclos); `FAIL` →
`escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. `git add` só dos caminhos das tarefas (`git add -f` para `reports/` até o CTG-0002); commit por
   `CODESTYLE.md` (`<type>(<scope>): …`, corpo com ADR/OD citados, papel declarado, trailer de
   atribuição da sessão). Um PR por CTG.
2. Evidência: escreva `evidence-<ctg>.json` (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0018 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` e
   confirme que a nova linha de `record/proofs/work/generic/R-0018.jsonl` tem âncora em
   `record/proofs/chain.json`. Commit "chore(devai): …".
3. Confirme que todo upstream do grupo está em `main` e integre (`git rebase origin/main` somente
   se o branch nunca foi publicado; senão `git merge --no-edit origin/main`). Rode novamente os
   gates, faça somente push normal com `git push -u origin orchestra/index-state` e então
   `gh pr create --base main` com o corpo pelo `.github/pull_request_template.md` (papel, fontes, o
   que muda, verificação, OD tocadas, fora de escopo, linha final de atribuição). No PR do
   CTG-0001 peça ao Owner OD-R18-001 (série `law/adr`) e OD-R18-002 (ADR-0022); no do CTG-0002, o
   aceite dos patches de `proposals/` (OD-R18-003).
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0018 --as-role auditor --write --format human`.
6. Fechamento: `closure.json` (esquema `phase-closure`: `id`, `round_id`, `declaring_decision`,
   `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`), com
   critérios renegociados listados como **não cumpridos**, e
   `pnpm exec devai round close --round R-0018 --repo-root . --input work/rounds/R-0018/closure.json --as-role architect --write --format human`;
   em seguida
   `pnpm exec devai round seal --round R-0018 --repo-root . --as-role architect --write --format human`.
   Se o selo recusar por pré-requisito ainda não entregue (registro de decisões e fluxo de selo são
   de R-0020, C-0002 §4), registre a saída em `closure.json` e em §Bloqueios: o selo de R-0018 fica
   para R-0020, que sela R-0003…R-0019. Nunca contorne a recusa.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada),
   `work/rounds/README.md` (linha R-0018 com o PC — o gate `verify:state-index` exige) e
   `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado (80 %); ids de CLI não
confirmados (M1); bloqueio por decisão `OD-*` não coberta pelo steering §H; todos os grupos livres
concluídos e os restantes presos a upstream não mesclado; reviewer `FAIL` após escalada. Um novo
maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; ids de CLI (M1); PRs (número, estado); tarefas (id, papel,
modelo, resultado); ciclos de REVIEW e escaladas; gates executados com saída resumida; evidência
(sequência, âncora e head da cadeia); OD tocadas e onde foram registradas; mapa de renumeração
aplicado; o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que recomenda ao
método (`orchestra/README.md`, `model-ladder.md`).
