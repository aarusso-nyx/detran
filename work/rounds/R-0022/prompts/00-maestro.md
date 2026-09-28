# Prompt do maestro — orquestra `stynx-sse-tenancy` (rodada `R-0022`)

> **Adenda de leitura A1 — 2026-09-27:** este prompt não inicia R-0022. Quando a rodada for autorizada, aplicar primeiro a adenda A1 de seu `plan.md` e a spec upstream §8.1; elas prevalecem sobre os pressupostos históricos abaixo.

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Anthropic — Claude Code com Opus 5.5`
> (id exato do modelo confirmado com `claude --help` no bootstrap), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.

## OD-C2-005 — fluxo contínuo (prevalece)

Decisão do Owner de 2026-09-27 (C-0002 §12; detalhe em `plan.md` §Execução OD-C2-005). Prevalece
sobre qualquer instrução deste prompt que mande abrir PR, mesclar, registrar evidência ou pedir
delivery-review por CTG.

- **Branch única** `orchestra/stynx-sse-tenancy`, com um commit por tarefa ou por CTG (`CODESTYLE.md`,
  autoria por caminho).
- **Entre CTGs não há** PR, CI remoto, merge, `devai evidence record`, `devai audit observe`,
  `pnpm check` completo nem delivery-review. Os `acceptance_commands` de cada tarefa continuam sendo
  a definição de pronto, com a triagem de falha por tarefa. `pnpm backend:rls-smoke` segue comparado à
  linha de base depois de cada CTG de O5 e O6.
- **Uma** prompt-review no bootstrap (§5), sobre `plan.md` e os prompts de **todos** os CTGs.
- **Ondas** conforme `plan.md` §Execução OD-C2-005: O1 CTG-0001 (TASK-0001); O2 TASK-0002 ∥ TASK-0003;
  O3 CTG-0002 (TASK-0004); O4 TASK-0005; O5 TASK-0006 ∥ TASK-0008; O6 TASK-0007 ∥ TASK-0009; O7 TASK-0010.
  No máximo 3 workers simultâneos, com fronteiras de escrita disjuntas. Você serializa os commits.
  Ao fim de cada onda, faça `git push -u origin orchestra/stynx-sse-tenancy`, sem PR: R-0023 e R-0024
  empilham sobre esse branch.
- **Caracterização commitada antes de qualquer troca:** o commit do CTG-0001 precede o de TASK-0004,
  e a caracterização é reexecutada verde depois do bump, antes de O5.
- **Abertura empilhada:** se R-0021 não estiver em `main`, abra sobre
  `origin/orchestra/stynx-canonical` e integre as revisões dela por `git merge --no-edit`. A rodada
  inteira pode avançar; do CTG-0002 em diante, sobre `1.5.0-rc.N` (OD-S15-01). Só o PR final espera
  R-0021 em `main` e a 1.5.0 **final** com o pin trocado.
- **Sequência final**, uma vez:
  1. `git merge --no-edit origin/main`; caracterização sobre `main` na worktree temporária destacada
     (`plan.md`); pin final e lockfile, se houve RC.
  2. CI local: `pnpm check`, `pnpm backend:test:ci`, `pnpm --filter @detran/app test:e2e`,
     `pnpm backend:rls-smoke`, `pnpm verify:rls-ddl`, `pnpm verify:stynx-pin`,
     `pnpm verify:decorators`, `pnpm verify:role-catalog`,
     `pnpm --filter @detran/{rait,dashboard,portal,teat}-web test|typecheck|lint|build`,
     `pnpm contracts:check`, `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`,
     as verificações de arquivo do plano e `pnpm devai:rc:prepare` quando aplicável.
  3. **Uma** delivery-review de Sol 6 sobre o diff inteiro (§8).
  4. **Um** PR (§9.3), com a tabela CTG → tarefas → commits e os gates no corpo.
  5. CI remoto, depois o merge (§9.4–9.5).
  6. Publicação única: `evidence-R-0022.json` com todos os CTGs, `evidence record`/`verify`,
     `audit observe` no sha do merge, `closure.json`, `round close`, `round seal`, `waves.md` e
     `backlog.md` (§9).

- Você é o maestro da frente **`stynx-sse-tenancy`**: ação **7c** da campanha C-0002 (pin STYNX
  1.5.0, SSE com fonte única no backend e nos apps RAIT/PORTAL/DASHBOARD/TEAT web, fim do
  _monkey-patch_ de tenancy, assinatura final), definida em `work/campaigns/C-0002-consolidacao.md`,
  `work/campaigns/C-0002-stynx-upstream-spec.md` e `work/rounds/R-0022/plan.md`.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- Família dos seus workers: **a sua** (`claude`: Opus 5.5 grande e médio, Sonnet 5 pequeno, conforme
  `model-ladder.md` e C-0002 §4), por subagentes nativos da sua CLI.
  Família do reviewer: **a outra** (`codex`), modelo **Sol 6** (id confirmado com `codex --help` no
  bootstrap), sempre pela ponte `tools/orchestra/bridge.sh`, nível grande em toda revisão desta
  rodada (tenancy, RLS e contrato de fio). Nunca inverta.
- Orçamento desta janela de 5 h: **frente prevista para 3 janelas; nesta janela, um planejamento de
  maestro + até 6 tarefas de worker (Opus 5.5/Sonnet 5) com revisões — ≈ 700 k tokens de entrada; ao
  atingir 80 % grave checkpoint**. Contabilize em
  `work/rounds/R-0022/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
  estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- Concorrência (regra de `waves.md`; OD-C2-005, que subsume a adenda A-C2-11): a rodada **abre e
  trabalha** empilhada em `origin/orchestra/stynx-canonical` (R-0021) enquanto R-0021 não estiver em
  `main`. O **PR final** só abre com R-0021 em `main`, com a caracterização executada de novo sobre
  `main` (regras em `plan.md` §Execução OD-C2-005 e §Adendas). O que depende de upstream por CTG:
  **CTG-0001 (caracterização de tenancy/RLS e de SSE sobre 1.4.0): nenhum upstream além do branch de
  R-0021. CTG-0002 (pin 1.5.0) e todos os seguintes: STYNX 1.5.0 no registry pela rodada S-1.5 do
  repositório STYNX (esta campanha não a abre), em RC para desenvolver e final para o PR final
  (OD-S15-01), e tabela de conformidade §7 da spec devolvida. CTG-0003 (tenancy) → CTG-0004 (SSE
  backend) em série; CTG-0005 (SSE Angular) em paralelo ao CTG-0003 e ao CTG-0004. CTG-0006 (assinatura final)
  condicional a UPS-SIG publicada. CTG-0007 (docs) no fim**. No bootstrap, registre em `plan.md`
  §Concorrência quais upstreams já estão em `main` (`git log --oneline -30 origin/main`,
  `gh pr list --state merged --limit 20`), se a 1.5.0 está publicada
  (`npm view @stynx-nyx/tenancy@1.5.0 version`) e sobre qual base a rodada abre (§1). Grupos livres
  avançam sempre; grupos presos aguardam ou empilham, nunca bloqueiam a rodada inteira.

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada. Confirme também que `R-0022`
ainda está livre (`ls work/rounds`; C-0002 §2).

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0022/plan.md   # checkpoint anterior?
claude --help | head -40; codex --help | head -40  # ids de modelo Opus 5.5 / Sol 6
npm view @stynx-nyx/tenancy@1.5.0 version          # 1.5.0 publicada? (sem ela: só CTG-0001)
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/stynx-sse-tenancy` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy" orchestra/stynx-sse-tenancy`; (d) PR aberto
de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016; detalhe em `waves.md` §Histórico):
(1) crie `work/rounds/R-0022/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
este prompt — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote de workspace
novo ou troca de pin exige `pnpm install` pelo maestro e commit do `pnpm-lock.yaml` antes do push (CI
usa `--frozen-lockfile`); (3) toda edição de `docs/framework/arch/parameter-catalogue.md` é seguida de
`pnpm parameters:generate`, e specs nunca contêm chaves de parâmetro como literal
(`verify:parameter-catalogue`); (4) helper `.mjs` importado por spec TS precisa de `.d.mts` irmão;
(5) pacote ou subpath novo montado no `AppModule` precisa de alias em `backend/app/vitest.config.ts`;
(6) workers não deixam `pnpm check` rodando em segundo plano — encerre processos perdidos pelo pid
exato antes dos seus gates, nunca por padrão de nome; (7) `git add record/proofs` explícito em cada
commit de evidência; (8) `audit observe` só no HEAD exato integrado; se outra rodada fechar antes,
aceite a cadeia de `main`, observe o HEAD integrado e repita `round close` (o id de fechamento muda);
(9) `seed.sh` faz parte do CI e a rodada dona das fixtures prova as duas execuções; (10) ciclos de
revisão a partir do segundo restritos aos itens corrigidos; contradição entre contrato e código é
resolvida pelo Architect por adenda numerada antes de redespachar.
**Lições da C-0001 (C-0002 §4):** (11) relatórios em `work/rounds/R-0022/reports/` versionados com
`git add -f` até R-0018 corrigir o `.gitignore`; depois de todo `git add`, compare
`find <dir> -type f` com `git ls-files <dir>` (R-0016); (12) critérios de aceitação imutáveis —
mudança só por adenda numerada com decisão do Owner; critério substituído aparece no closure como
**não cumprido**; proibido repetir as trocas de R-0013/R-0014 e o waiver SQL2 de R-0007 — achado de
tenancy/RLS não tem via de dispensa; (13) toda OD nova no registro canônico
`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 no mesmo PR; (14) caracterização de
tenancy/RLS (`pnpm backend:rls-smoke` e negativos) e de SSE provada verde **antes** de toda remoção e
repetida depois; divergência é FAIL; (15) contratos só a partir dos `.d.ts` **publicados** de 1.5.0,
nunca da proposta; MUST ausente → checkpoint (OD-R22-02), nunca _shim_ novo; (16) nenhuma integração
externa real; `tmp/` não existe na worktree. Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/stynx-sse-tenancy
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm backend:rls-smoke                # linha de base de RLS, guardada no relatório de TASK-0002
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai round plan --scaffold --round R-0022 --repo-root . --as-role architect --write --format human
```

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/stynx-sse-tenancy "/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/stynx-sse-tenancy`) sem PR para que outras frentes empilhem sobre ele.

**Avanços do `main` durante a rodada.** Outras frentes mesclam enquanto você trabalha. No início de
cada janela, em cada checkpoint (§7) e antes do PR final (§9): `git fetch -q origin` e
`git log --oneline HEAD..origin/main`; se houver commits novos, use `git rebase origin/main` somente
se o branch nunca foi publicado. Caso contrário, use `git merge --no-edit origin/main`. Nunca use
`--force`, `--force-with-lease` ou equivalente. Depois da integração, rode de novo os gates do
grupo. Ao resolver conflitos: arquivo **gerado** (`backend/domains/**/src/generated`,
contratos `*.openapi.json` gerados, `ddl/*.sql` de blueprint) → nunca edite à mão, aceite qualquer
lado, formate o blueprint com prettier e `pnpm blueprints:generate` + `pnpm contracts:openapi`;
`record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl` → aceite a versão de `main` e
rode `devai evidence record` de novo para os seus commits (a cadeia nunca é mesclada à mão);
`policy.ts`/`roles.ts` → mantenha os dois blocos, rode `pnpm --filter @detran/shared test`;
`pnpm-lock.yaml` → aceite `main` e `pnpm install --frozen-lockfile`, ou `pnpm install` num commit
`chore(deps)` próprio. Antes de criar uma ADR, confira o próximo número em `docs/meta/adr/README.md`.
Se o rebase invalidar um veredito `PASS` do reviewer (diff mudou de forma substantiva), peça nova
`delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `work/campaigns/C-0002-consolidacao.md` inteiro; `work/campaigns/C-0002-stynx-upstream-spec.md`
   §1–§4, §6.6, §6.11, §6.12, §7, §8 (com a tabela de conformidade devolvida por S-1.5); depois o
   "mapa entregável → definições" do `plan.md`: `docs/meta/adr/ADR-0005-unified-backend-kernel.md`
   (§8), `ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md`,
   `ADR-0018-documents-and-signature-substrate.md`, a ADR de divisão STYNX × DETRAN e
   `work/rounds/R-0021/contracts/CTG-0003.md` (criados por R-0021),
   `docs/framework/arch/rait-events-sse-contract.md`, `docs/framework/arch/detran-ui-guide.md`,
   `docs/framework/arch/portal-build-pack.md` (linhas OD-P27 e OD-P30)
4. `docs/framework/arch/parameter-catalogue.md`, `docs/meta/knowledge-base/decision-closure-plan.md`,
   `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
5. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`
6. `work/rounds/R-0022/plan.md` (metas, tarefas e critérios já extraídos para esta frente)
7. Código alvo, somente leitura nesta fase: `backend/app/src/app.module.ts:195-290`,
   `backend/app/src/detran-runtime.ts:460-600`, os 8 arquivos `*-stream.{controller,service}.ts` e os
   4 serviços SSE dos apps listados no `plan.md` §Metas 5–6; após o bump, os `.d.ts` instalados de
   `@stynx-nyx/{tenancy,core,contracts,backend,angular}` 1.5.0

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0022/plan.md` + `tasks/`

Para cada entregável escreva **tarefas** no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`), obedecendo:

- **Tríade**: `TASK` Architect (contrato, critérios) → `TASK` Inspector (testes de caracterização que
  codificam os critérios) → `TASK` Engineer (troca até os testes passarem sem edição); mesmo
  `coupled_task_group`, `upstream_task_id` encadeado. Transcrição (ADR, emendas, contrato SSE comum)
  é tarefa simples de `transcriber-docs`.
- **`target_modules`** com os locks do `plan.md` (`MOD-r22-contracts`, `MOD-app-tests-tenancy`,
  `MOD-app-tests-sse`, `MOD-web-tests-sse`, `MOD-deps-stynx-pin`, `MOD-app-module`,
  `MOD-app-sse-backend`, `MOD-<app>-web-sse`…); duas tarefas com o mesmo lock nunca correm juntas.
- **`acceptance_commands`** só com comandos que existem em `package.json` ou arquivos verificáveis
  (ver `orchestra/README.md` §9).
- **Modelo e esforço** por `model-ladder.md` (família Claude); anote no `executor`.
- Ordem topológica e paralelismo possível (no máximo três tarefas por vez).

`plan.md` já traz metas, tabela de tarefas (TASK-0001…0010), critérios, mapa, riscos e ODs; ajuste só
por adenda numerada. Mantenha §Bloqueios, §Retomada e §Leitura.

## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`

Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras:

- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
- Transfira para o prompt os trechos de definição que o worker precisa (assinaturas publicadas de
  1.5.0, a tabela de divergências dos 4 fluxos e das 4 costuras, os parâmetros de polling/backoff de
  cada app, os negativos de tenancy), em vez de mandar procurar.
- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
  `source_pending` ou abrir `OD-*`.
- Os prompts de Engineer proíbem editar teste de caracterização; a única exceção prevista é a
  inversão do `it.fails` do TEAT web (C-05-nn) e a retirada da _flag_ de teste do _shim_ (C-03-nn).
- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
  `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).

## 5. Revisão dos prompts (reviewer, outra família)

Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
em modo `prompt-review`, anexando `plan.md` e todos os `prompts/*.md`. Invoque:

```bash
tools/orchestra/bridge.sh codex <id-sol-6> work/rounds/R-0022/reviews/prompt-review-1.md work/rounds/R-0022/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy"
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`/Volumes/Thiamat II/stech/detran-worktrees/stynx-sse-tenancy`. Se a sua CLI não tiver subagentes,
execute você mesmo a tarefa **como se fosse o worker**, obedecendo estritamente ao prompt daquela
tarefa (fronteira de escrita inclusive). Marque `status=in_progress` na tarefa; ao receber o
relatório, grave-o em `reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa e, ao fim de cada CTG de O5 e O6, `pnpm backend:rls-smoke`
(saída comparada à linha de base do CTG-0001). `pnpm check` e `pnpm backend:test:ci` rodam uma vez,
na sequência final (OD-C2-005).
Falha → triagem em uma linha (`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md`
§Triagem → 1 nova tentativa com o achado no prompt → se falhar, nível acima da mesma família → se
falhar, `escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado. Vazamento entre
tenants → `FAIL` imediato e parada da rodada.

## 8. Revisão da entrega (reviewer, outra família)

Uma vez, na sequência final (OD-C2-005), depois do CI local: `git diff --stat` + diff completo da
rodada contra `origin/main` + relatórios + critérios em `reviews/delivery-review-R-0022.md` (modo
`delivery-review`) → ponte → veredito. `PASS` libera o PR; `REVIEW` volta ao worker responsável
(máximo 2 ciclos, restritos aos itens apontados); `FAIL` → `escalated`. A rodada (com CTG-0003 e
CTG-0004) só mescla com `PASS`, sem dispensa.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. Durante a rodada: `git add` só dos caminhos das tarefas; um commit por tarefa ou por CTG, por
   `CODESTYLE.md` (`<type>(<scope>): …`, corpo com ADR/OD citados, trailer de atribuição da sessão);
   push sem PR ao fim de cada onda. Os itens 2 a 7 formam a sequência final (OD-C2-005) e rodam uma vez.
2. Evidência (item 6 da sequência final, depois do merge): escreva `evidence-R-0022.json` com todos os
   CTGs (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0022 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `evidence verify`. Commit "chore(devai): …".
3. Confirme que todo upstream da rodada está em `main` (R-0021 e a 1.5.0 final publicada) e
   rebaseie (`git rebase origin/main`; somente se o branch nunca foi publicado); em branch publicado,
   use `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
   `git push -u origin orchestra/stynx-sse-tenancy` e então `gh pr create --base main` com o corpo pelo
   `.github/pull_request_template.md` (papel, ação e fontes, o que muda, verificação, OD tocadas,
   fora de escopo, linha final de atribuição).
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0022 --as-role auditor --write --format human`.
6. Fechamento (DEVAI 1.5.6): `closure.json` (esquema `phase-closure`: `id`, `round_id`,
   `declaring_decision`, `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`,
   `merged_as`; critério não cumprido aparece como tal) e
   `pnpm exec devai round close --round R-0022 --repo-root . --input work/rounds/R-0022/closure.json --as-role architect --write --format human`;
   em seguida `pnpm exec devai round seal --round R-0022 --repo-root . --as-role architect --write --format human`;
   nenhuma prova sem âncora na cadeia.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada) e
   `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado; 1.5.0 não publicada após
o CTG-0001; item MUST ausente da 1.5.0 (OD-R22-02); bloqueio por decisão `OD-*` não coberta pelo
steering §H; todos os grupos livres concluídos e os restantes presos a upstream não mesclado;
reviewer `FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; PRs (número, estado); tarefas (id, papel, modelo, resultado);
ciclos de REVIEW e escaladas; gates executados com saída resumida (inclusive `backend:rls-smoke` antes
e depois); evidência (sequência e head da cadeia); OD tocadas; conformidade real da 1.5.0 (ids UPS
consumidos e ausentes); o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que
recomenda ao método (`orchestra/README.md`, `model-ladder.md`).

## 11. Adenda A1 — entrada após o escopo revisto de R-0021 (2026-09-27)

Antes do bootstrap, ler `work/rounds/R-0022/plan.md` §Adendas A1,
`work/campaigns/C-0002-consolidacao.md` §11/A11 e
`work/campaigns/C-0002-stynx-upstream-spec.md` §8.1/A1. A transferência foi aprovada pelo Owner,
mas **não abre R-0022** nem autoriza ações no repositório STYNX.

- Conferir os PRs, relatórios e fechamento reais de R-0021: caracterização, pin 1.4.0 e gate de
  versões; migrações de assinatura, outbox e offline-sync inteiras transferidas, critérios
  históricos não cumpridos e fechamento sem selo autorizado. Não exigir selo de R-0021 como
  pré-requisito e não registrar migrações parciais como entregues.
- Redecompor a assinatura (antiga TASK-0009/CTG-0006) e adicionar tríades de outbox e
  offline-sync antes de revisar prompts. Registrar dependências com tenancy/SSE e locks de
  app, armazenamento, testes, instalação e banco. Preservar ids históricos; tarefas novas
  recebem ids seguintes livres no bootstrap. Recalibrar prazo/orçamento sem iniciar trabalho
  antes da autorização da rodada.
- Contratos partem dos artefatos publicados e dos testes de R-0021; não pressupor fachada,
  despacho RENACH ou deduplicação já migrados, nem o contrato CTG-0003 cancelado de R-0021.
  `contracts/CTG-0001.md`, relatórios e fechamento são a entrada real. A ADR de operações é
  ADR-0036. O pin usa `tools/stynx-version.json` e descoberta dinâmica de manifestos.
- UPS-SIG-01…04, UPS-OBX-01…02 e UPS-OFS-01…04, incluindo compatibilidade offline da spec A1,
  são MUST para a migração consumidora. Item ausente bloqueia esse CTG; a antiga alternativa
  de implementar novo contorno local não está autorizada. Preservar prova antes/depois com
  RLS e HTTP reais, incluindo TEAT/BOAT, rollback e replay. Notificações aguardam OD-P40.
- OD-S15-01 permanece fechada: RC publicada permite desenvolvimento/teste, nunca merge;
  merge exige 1.5.0 final conforme. A RC.2 não altera os arquivos próprios dos três pacotes;
  árvore local da RC.3 não vale como prova. Verificar a release efetivamente consumida.

Esta adenda não muda os critérios de selo de R-0022 nem transfere a ela automaticamente o
orçamento ampliado ou a autorização operacional concedidos a R-0021.
