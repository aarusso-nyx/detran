# Prompt do maestro — orquestra `boat-wiring` (rodada `R-0028`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Claude Code com Opus 5.5`
> (C-0002 §4: Codex CLI com Sol 6 ou Claude Code com Opus 5.5; ids de CLI confirmados no bootstrap com `codex --help` / `claude --help` e registrados em `plan.md` §Decisões do maestro), aberta na worktree `"/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring"`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.

## OD-C2-005 — fluxo contínuo (prevalece)

Decisão do Owner de 2026-09-27 (`work/campaigns/C-0002-consolidacao.md` §12). Prevalece sobre
qualquer trecho deste prompt que mande abrir PR, rodar CI remoto, gravar evidência, observar
auditoria ou pedir delivery-review por CTG.

- **Branch única** `orchestra/boat-wiring`. Faça um commit por tarefa ou por CTG, seguindo
  `CODESTYLE.md` e a autoria por caminho (OD-R20-003). Só você commita, em série.
- **Nada intermediário:** entre CTGs não há PR, CI remoto, merge em `main`,
  `devai evidence record`, `devai audit observe`, `pnpm check` completo nem delivery-review.
- **Mantidos:**
  - os `acceptance_commands` de cada tarefa e a triagem por tarefa (§7);
  - **um** ciclo de prompt-review (§5) no bootstrap, sobre `plan.md` e os prompts de TASK-0001…0011.
- **Ondas.** Siga `plan.md` §Execução OD-C2-005 (O1…O7): até 3 workers simultâneos, com
  fronteiras de escrita disjuntas.
- **Push sem PR** ao fim de cada onda: `git push -u origin orchestra/boat-wiring`. O push da O4
  publica o CTG-0004 (web), sobre o qual R-0029 empilha.
- **Abertura empilhada.** Sem R-0024 em `main`, abra sobre `origin/orchestra/stynx-dedup` se
  `git cat-file -e origin/orchestra/stynx-dedup:docs/framework/arch/frontend-wiring-pattern.md`
  passar. Integre as revisões do upstream com `git merge --no-edit`. Só o PR final espera o merge
  de R-0024, com STYNX 1.5.0 final em `main` (nenhum PR com pin de RC).
- **Sequência final,** executada uma vez:
  1. `git fetch -q origin && git merge --no-edit origin/main`.
  2. CI local: os comandos de `plan.md` §Execução OD-C2-005 (`pnpm check`,
     `pnpm test:boat-transitions`, triplas de `@detran/boat-mobile`, `@detran/teat-web` e
     `@detran/teat-mobile`, `@detran/est-crash`, `pnpm --filter @detran/app test:e2e`,
     `pnpm backend:test:ci`, `pnpm contracts:check`, `docs:kb:*`, `format:check`) e
     `pnpm devai:rc:prepare`, quando aplicável.
  3. Uma delivery-review (§8) do diff inteiro.
  4. Um PR (§9.3).
  5. CI remoto e merge (§9.4–5).
  6. Evidência única `evidence-R-0028.json` com os 5 CTGs, `audit observe` no SHA do merge,
     `round close` e `round seal` (§9.2, §9.5–7).

## 0. Identidade e limites

- Você é o maestro da frente **`boat-wiring`**: pacotes de trabalho **WP-B4/WP-B5 — handoff de ligação de campos, formulários, comandos e portas deixado por R-0015 (ação 6 da C-0002)** de `docs/framework/arch/boat-build-pack.md`.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- Família dos seus workers: **a sua** (`Claude Code com Opus 5.5`), por subagentes nativos da sua CLI.
  Família do reviewer: **a outra** (`codex`), modelo `<id-sol-6>`, sempre
  pela ponte `tools/orchestra/bridge.sh`. Nunca inverta.
- Orçamento desta janela de 5 h: **frente prevista para 3 janela(s); nesta janela, um planejamento de maestro + até 7 tarefas de worker (Opus 5.5/Sonnet 5) com revisões — ≈ 700 k tokens de entrada; ao atingir 80 % grave checkpoint. `<id-sol-6>` é o id de Sol 6 na Codex CLI: confirme com `codex --help` no bootstrap, substitua em todos os comandos da ponte e registre em §Decisões do maestro**. Contabilize em
  `work/rounds/R-0028/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
  estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado
  **e o upstream de abertura da campanha mesclado** (R-0024 `stynx-dedup` em `main` e `docs/framework/arch/frontend-wiring-pattern.md` presente, ou empilhado em `origin/orchestra/stynx-dedup` com o padrão presente — OD-C2-005) — fora isso, nunca pare por upstream ainda não mesclado. O que depende de upstream é o
  **PR final** (OD-C2-005); por grupo, vale a presença no branch: **CTG-0001 (matriz, ODs): nenhum upstream. CTG-0002 (portas) e CTG-0003 (telas mobile, gateway, boundaries em `apps/teat/mobile/src/app/features/sinistro/`): nenhum upstream além de R-0024. CTG-0004 (telas web em `apps/teat/web/src/app/features/sinistros/`, lock `MOD-teat-web-sinistros`): nenhum upstream, mas **é publicado no branch** (push da O4) antes de R-0029 `teat-web-wiring` (`orchestra/teat-web-wiring`, empilhada sobre `origin/orchestra/boat-wiring`) alterar o shell do TEAT web (`MOD-teat-web-shell`: `app.routes.ts`, `app.config.ts`, `core/`), e esta rodada mescla antes de R-0029 — esta rodada não toca o shell; se R-0029 já tiver PR aberto no shell, registre em §Concorrência e combine a ordem (este primeiro). CTG-0005 (smoke, delta, docs): CTG-0003 e CTG-0004 concluídos no branch, stack local de R-0017 (`pnpm stack:start`) e esquema `work/rounds/R-0030/availability-manifest.schema.md` em `main` ou empilhado em `orchestra/user-docs`**. No bootstrap, registre em `plan.md`
  §Concorrência quais upstreams já estão em `main` (`git log --oneline -30 origin/main`,
  `gh pr list --state merged --limit 20`), quais grupos estão liberados para merge e quais serão
  desenvolvidos sobre base empilhada (§1). Grupos livres avançam sempre; grupos presos aguardam ou
  empilham, nunca bloqueiam a rodada inteira.

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree "/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring" já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0028/plan.md   # checkpoint anterior?
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/boat-wiring` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring" orchestra/boat-wiring`; (d) PR aberto
de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0008; detalhe em `waves.md` §Histórico):
(1) crie `work/rounds/R-0028/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
este prompt — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote de workspace
novo exige `pnpm install` pelo maestro e commit do `pnpm-lock.yaml` antes do push (CI usa
`--frozen-lockfile`); (3) toda edição de `docs/framework/arch/parameter-catalogue.md` é seguida de
`pnpm parameters:generate`, e specs nunca contêm chaves de parâmetro como literal
(`verify:parameter-catalogue`); (4) helper `.mjs` importado por spec TS precisa de `.d.mts` irmão;
(5) pacote novo montado no `AppModule` precisa de alias em `backend/app/vitest.config.ts`;
(6) workers não deixam `pnpm check` rodando em segundo plano — encerre processos perdidos pelo pid
exato antes dos seus gates, nunca por padrão de nome; (7) `git add record/proofs` explícito em cada
commit de evidência; (8) `audit observe` só no HEAD exato integrado; se outra rodada fechar antes,
aceite a cadeia de `main`, observe o HEAD integrado e repita `round close` (o id de fechamento muda);
(9) `seed.sh` faz parte do CI e a rodada dona das fixtures prova as duas execuções; (10) ciclos de
revisão a partir do segundo restritos aos itens corrigidos; contradição entre contrato e código é
resolvida pelo Architect por adenda numerada antes de redespachar.

**Lições obrigatórias da C-0001** (C-0002 §4; `work/campaigns/C-0002-consolidacao.md`):
(11) relatórios de worker em `work/rounds/R-0028/reports/` são versionados — `git add -f` enquanto o
`.gitignore` de R-0018 não estiver em `main`; depois de cada `git add`, compare `find <dir> -type f`
com `git ls-files <dir>` (R-0007 perdeu 24 relatórios; R-0016 perdeu um módulo inteiro);
(12) critérios de aceitação imutáveis: mudança só por adenda numerada com decisão do Owner; critério
substituído entra no closure como **não cumprido** — vetadas as trocas de R-0013/R-0014 (Lighthouse →
axe; suíte integral → testes focais) e o waiver SQL2 de R-0007; (13) toda OD nova vai ao registro
canônico (`docs/framework/arch/boat-build-pack.md` §4; as OD-R15-003…006, hoje só em `work/rounds/R-0015/route-manifest.md`, migram para lá em TASK-0002) no mesmo PR — OD só em `contracts/` não conta; (14) âncora da prova:
`evidence record`/`verify` (uma vez, com todos os CTGs — OD-C2-005), `audit observe` no SHA exato do merge, `round close` **e**
`round seal` (DEVAI 1.5.6); nenhuma rodada fecha com prova sem âncora; (15) `budget.json`
obrigatório — a 80 % da janela, checkpoint e parada, sem dispensa implícita; (16) testes de
caracterização antes de toda troca de implementação; (17) nenhuma integração externa real
(C-0002 §4: SENATRAN, gov.br, SNE, banco, PAdES/TSA, RENAEST, VAPID, biometria só por mock ou
porta), nenhum valor normativo inventado (`source_pending`), nenhum `--force`, nenhum arquivo gerado
editado; (18) padrão de ligação único: `docs/framework/arch/frontend-wiring-pattern.md` (R-0024) sem
variantes; (19) a rodada entrega só o **delta** `docs/framework/arch/availability/boat.availability.json` no esquema
`work/rounds/R-0030/availability-manifest.schema.md`, nunca manuais (C-0002 §3.5).
(20) específicas desta frente: nada de Capacitor/Android (#109) nem RENAEST real (#120); portas têm implementação web/homologação atrás do token, e a atestação nunca devolve sucesso silencioso (ADR-0033 §3); OD-R28-001 = (a), decidida pelo Owner em 2026-09-26 (caminho real atrás do gateway, homologação como padrão, selo `homologacao`); os hosts TEAT continuam em homologação por padrão até o Owner decidir OD-R28-001; as 13 chaves `source_pending:OD-R15-004` nunca são exibidas enquanto #119 estiver aberta; S-06/W-05 ficam fail-closed sob DT-049; R-0015 é o contraexemplo de critério reescrito — não repita.

Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/boat-wiring
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai --version               # deve ser 1.5.6 (C-0002 §4); outra versão → pare e reporte
test -f docs/framework/arch/frontend-wiring-pattern.md || echo 'R-0024 ausente: não abra a rodada'
gh issue view 118 --json state,title; gh issue view 119 --json state,title   # estado dos textos/ids
pnpm --filter @detran/boat-mobile test    # linha de base; anote a contagem em §Leitura
pnpm --filter @detran/teat-web test
pnpm exec devai round plan --scaffold --round R-0028 --repo-root . --as-role architect --write --format human
```

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/boat-wiring "/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/boat-wiring`) sem PR para que outras frentes empilhem sobre ele.

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
`chore(deps)` próprio. Antes de criar um DDL novo, confira o número livre com `ls backend/database/ddl`
(a numeração do plano pode ter sido ocupada por outra frente); antes de criar uma ADR, confira o
próximo número em `docs/meta/adr/README.md`. Se o rebase invalidar um veredito `PASS` do reviewer
(diff mudou de forma substantiva), peça nova `delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`; `work/campaigns/C-0002-consolidacao.md` §2–§5
3. `docs/framework/arch/boat-build-pack.md` inteiro; `docs/framework/arch/boat-frontends.md`; `docs/framework/arch/boat-route-contract.md`; `docs/framework/arch/boat-error-catalog.md`
4. `docs/meta/adr/ADR-0033-teat-ui-workflow-homologation-scope.md`; `docs/framework/arch/teat-build-pack.md` §Adenda R-0013 (linhas 11-30)
5. `work/rounds/R-0015/plan.md` (adenda A5, OD-R15-*), `work/rounds/R-0015/route-manifest.md`, `work/rounds/R-0015/closure.json`
6. `docs/framework/arch/frontend-wiring-pattern.md` (R-0024) e `work/rounds/R-0030/availability-manifest.schema.md` (R-0030)
7. Código: `apps/boat/mobile/src/lib/{ports.ts,boat-extension.ts,pages/boat-pages.ts,shared/,forms/,navigation/transitions.ts}`; `apps/teat/mobile/src/app/features/sinistro/sinistro.routes.ts`; `apps/teat/web/src/app/features/sinistros/`; contratos `docs/framework/contracts/BP-EST-CRASH-001{,.commands}.openapi.json`
8. `docs/meta/knowledge-base/steering.md` §H (não reabra decisões do Owner); `docs/framework/arch/parameter-catalogue.md` (namespaces i18n `boat.*`)
9. Os manuais de papel: `docs/meta/agents/{architect-blueprint,engineer-frontend,inspector-tests,transcriber-docs}.md`
10. `work/rounds/R-0028/plan.md` (metas, tarefas, critérios e ODs já extraídos)

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0028/plan.md` + `tasks/`

Para cada entregável do WP escreva **tarefas** no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`), obedecendo:

- **Tríade por comando/entidade**: `TASK` Architect (contrato, DDL/blueprint, guardas, critérios)
  → `TASK` Inspector (testes que codificam os critérios) → `TASK` Engineer (implementação até os
  testes passarem); mesmo `coupled_task_group`, `upstream_task_id` encadeado. Tarefas de
  transcrição (fichas, i18n, contratos de payload) são tarefas simples de `transcriber-docs`.
- **`target_modules`** com os módulos de lock (ex.: `MOD-shared-policy`, `MOD-ddl-05`,
  `MOD-ops-parameter`); duas tarefas com o mesmo lock nunca correm juntas.
- **`acceptance_commands`** só com comandos que existem em `package.json` ou arquivos verificáveis;
  cada comando com o resultado esperado descrito em `plan.md`. Nunca herde dos build packs um
  comando inexistente (ver `orchestra/README.md` §9).
- **Modelo e esforço** por `model-ladder.md`; anote no `executor`.
- Ordem topológica e paralelismo possível (tarefas sem lock comum e sem dependência podem correr
  em paralelo, no máximo três por vez).

`plan.md` recebe: metas da frente, tabela de tarefas (id, papel, modelo, lock, depende de,
critérios), mapa entregável → definições, riscos, §Bloqueios (vazio), §Retomada (vazio),
§Leitura.

## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`

Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras:

- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
- Transfira para o prompt os trechos de definição que o worker precisa (tabelas de estados,
  regras, nomes de erro), em vez de mandar procurar.
- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
  `source_pending` ou abrir `OD-*`.
- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
  `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).

## 5. Revisão dos prompts (reviewer, outra família)

Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
em modo `prompt-review`, anexando `plan.md` e todos os `prompts/*.md`. Invoque:

```bash
tools/orchestra/bridge.sh codex <id-sol-6> work/rounds/R-0028/reviews/prompt-review-1.md work/rounds/R-0028/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring"
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`"/Volumes/Thiamat II/stech/detran-worktrees/boat-wiring"`. Se a sua CLI não tiver subagentes, execute você mesmo a tarefa **como se fosse o
worker**, obedecendo estritamente ao prompt daquela tarefa (fronteira de escrita inclusive).
Marque `status=in_progress` na tarefa; ao receber o relatório, grave-o em
`reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa. `pnpm check` e os tiers de teste (`pnpm backend:test:ci`
e os dos apps) rodam uma vez, na sequência final (§OD-C2-005). Falha → triagem em uma linha
(`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md` §Triagem → 1 nova
tentativa com o achado no prompt → se falhar, nível acima da mesma família → se falhar,
`escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado.

## 8. Revisão da entrega (reviewer, outra família)

Uma vez, no fim da rodada (OD-C2-005), depois do CI local: `git diff --stat origin/main...HEAD` +
diff completo + relatórios + critérios em `reviews/delivery-review-R-0028.md` (modo
`delivery-review`) → ponte → veredito. `PASS` libera o PR; `REVIEW` → correções restritas aos
itens apontados, pelo worker responsável (máximo 2 ciclos); `FAIL` → `escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. `git add` só dos caminhos das tarefas; commit por `CODESTYLE.md` (`<type>(<scope>): …`,
   corpo com WF/UC/RN/OD citados, trailer de atribuição da sessão). Um commit por tarefa ou por
   CTG na branch única; nenhum PR antes da sequência final (OD-C2-005).
2. Evidência — só na publicação final, depois do merge (OD-C2-005): escreva `evidence-R-0028.json`
   com todos os CTGs (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0028 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `evidence verify`. Commit "chore(devai): …".
3. PR único, depois do CI local e do `PASS` da delivery-review final: confirme que todo upstream
   da rodada está em `main` e rebaseie (`git rebase origin/main`;
   somente se o branch nunca foi publicado); em branch publicado, use
   `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
   `git push -u origin orchestra/boat-wiring` e então `gh pr create --base main` com o corpo pelo
   `.github/pull_request_template.md` (papel, WP e fontes, o que muda, verificação, OD tocadas,
   fora de escopo, linha final de atribuição), mais a tabela CTG → tarefas → commits e o
   resultado dos gates.
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0028 --as-role auditor --write --format human`.
6. Fechamento: `closure.json` (esquema `phase-closure`: `id`, `round_id`, `declaring_decision`,
   `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`) e
   `pnpm exec devai round close --round R-0028 --repo-root . --input work/rounds/R-0028/closure.json --as-role architect --write --format human`
   e, em seguida, `pnpm exec devai round seal --round R-0028 --repo-root . --as-role architect --write --format human`
   (confirme a sintaxe com `pnpm exec devai round seal --help`); a âncora da prova tem de constar da cadeia.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada) e
   `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado; bloqueio por decisão
`OD-*` não coberta pelo steering §H; todos os grupos livres concluídos e os restantes presos a
umpstream não mesclado; reviewer
`FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; PR (número, estado); tarefas (id, papel, modelo, resultado);
ciclos de REVIEW e escaladas; gates executados com saída resumida; evidência (sequência e head da
cadeia); OD tocadas; o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que
recomenda ao método (`orchestra/README.md`, `model-ladder.md`).
