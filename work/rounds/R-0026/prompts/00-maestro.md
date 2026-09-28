# Prompt do maestro — orquestra `dashboard-wiring` (rodada `R-0026`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Anthropic — Claude Code com Opus 5.5`
> (Claude Code com Opus 5.5; o reviewer é Sol 6 pelo Codex CLI, via ponte), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.
>
> **Pré-condição:** o Owner autorizou `work/campaigns/C-0002-consolidacao.md` (rev. 2) e
> `work/rounds/R-0026/plan.md`. Sem essa autorização registrada, pare antes do §1 e reporte.

## OD-C2-005 — fluxo contínuo (prevalece)

Decisão do Owner de 2026-09-27 (`work/campaigns/C-0002-consolidacao.md` §12). Esta seção prevalece
sobre o que §0–§9 dizem sobre PR, merge, evidência ou delivery-review por CTG.

- **Branch única** `orchestra/dashboard-wiring`, com um commit por tarefa ou por CTG, conforme
  `CODESTYLE.md` e a autoria por caminho. Você serializa os commits.
- **Entre CTGs não há** PR, CI remoto, merge em `main`, `devai evidence record`,
  `devai audit observe`, `pnpm check` completo nem delivery-review.
- **Mantidos:** os `acceptance_commands` de cada tarefa, que são a definição de pronto do worker; a
  triagem de falha por tarefa (§7); os checkpoints (b)–(d) de `plan.md` como gates de tarefa,
  inclusive `bash backend/database/seed.sh` duas vezes depois de TASK-0008.
- **Um** ciclo de prompt-review no bootstrap (§5), sobre `plan.md` e os prompts de **todos** os
  CTGs, antes de disparar a O1.
- **Ondas:** siga a tabela O1…O4 de `plan.md` §Execução OD-C2-005, com até 3 workers simultâneos e
  fronteiras de escrita disjuntas. TASK-0007 só começa depois de TASK-0004, porque as duas usam
  `MOD-dashboard-monitor-tests`. TASK-0013 espera TASK-0012 e TASK-0008.
- **Push sem PR** ao fim de cada onda: `git push -u origin orchestra/dashboard-wiring`. R-0027
  pode empilhar sobre ele para consumir `rait.decision.published`.
- **Abertura empilhada:** se R-0024 ainda não estiver em `main`, crie a worktree a partir de
  `origin/orchestra/stynx-dedup` (R-0024):
  `git worktree add -b orchestra/dashboard-wiring "/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring" origin/orchestra/stynx-dedup`.
  Integre novas revisões com `git merge --no-edit origin/orchestra/stynx-dedup`. Só o PR final
  espera R-0024 em `main`, com R-0022/R-0023 e STYNX 1.5.0 final por transitividade.
- **Lock `MOD-shared-policy` partilhado** com R-0025 (CTG-0002/0003) e R-0027 (CTG-0003):
  - não espere as outras rodadas; edite `policy.ts` e `backend/domains/inf/rait-*` no seu branch;
  - se outra rodada mesclar antes, no passo 1 mantenha os dois blocos e rode de novo
    `pnpm --filter @detran/shared test` e `pnpm backend:test:e2e` (`policy-routes.e2e`);
  - a ordem de merge recomendada é R-0025 → R-0026 → R-0027, e ela não bloqueia nenhuma rodada.
- **Sequência final**, uma vez e na ordem:
  1. `git fetch -q origin && git merge --no-edit origin/main`, com R-0024 em `main`.
  2. CI local:
     - `pnpm check`;
     - `pnpm contracts:check`, `pnpm blueprints:check` e `pnpm contracts:test`;
     - `pnpm --filter @detran/shared test`;
     - `pnpm --filter @detran/dashboard-monitor test`;
     - `pnpm backend:test:ci` e `pnpm backend:test:e2e`;
     - `pnpm --filter @detran/app test:e2e`;
     - `bash backend/database/seed.sh` duas vezes;
     - `pnpm --filter @detran/dashboard-web typecheck`, `lint`, `test` e `build`;
     - `pnpm verify:parameter-catalogue`;
     - `pnpm docs:kb:check` e `pnpm docs:kb:publish-check`;
     - `pnpm format:check`;
     - `pnpm stack:start` + `pnpm stack:smoke`;
     - `pnpm devai:rc:prepare`, quando aplicável.
  3. **Uma** delivery-review do diff inteiro (`git diff origin/main...HEAD`). Com `REVIEW`, no
     máximo 2 ciclos.
  4. **Um** PR com a tabela CTG → tarefas → commits e os gates.
  5. CI remoto; o merge só acontece com CI verde e `PASS`.
  6. Publicação final (§9):
     - `evidence-R-0026.json` com todos os CTGs;
     - `evidence record`/`verify`;
     - `audit observe` no SHA do merge;
     - `closure.json`, `round close` + `round seal`;
     - `waves.md` e `backlog.md` atualizados.

## 0. Identidade e limites

- Você é o maestro da frente **`dashboard-wiring`**: **ação 6 da campanha C-0002** para o DASHBOARD
  (`work/campaigns/C-0002-consolidacao.md` §2, fase D) — console L0 → L2 sobre `BP-DASH-MONITOR-001`,
  sequência do WP-D5 de `docs/framework/arch/dashboard-build-pack.md` — detalhada em
  `work/rounds/R-0026/plan.md`. Rastreio: #123, #124, #96, #97, #98, #99, #100.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- Família dos seus workers: **a sua** (`Anthropic — Claude Code com Opus 5.5`), por subagentes nativos da sua CLI.
  Workers pela escada Claude: Opus 5.5 (grande e médio), Sonnet 5 (pequeno), por subagentes
  (`architect-blueprint`, `inspector-tests`, `engineer-frontend`, `engineer-backend` → Opus 5.5;
  `transcriber-docs` → Sonnet 5), conforme `plan.md` §Tarefas. Família do reviewer: **a outra**
  (`codex`), modelo **Sol 6** (id confirmado com `codex --help` no bootstrap, guardado em
  `REVIEWER_MODEL`), sempre pela ponte `tools/orchestra/bridge.sh`. Nunca inverta.
- Orçamento desta janela de 5 h: **frente prevista para ≈ 3 janelas (OD-C2-005); nesta janela, planejamento do maestro (leitura + prompts de
  todos os CTGs) + 1 prompt-review + O1 (TASK-0001, TASK-0002, TASK-0003, TASK-0006, TASK-0009) ≈ 650 k tokens de entrada; ao atingir 80 % (≈ 520 k) grave checkpoint e pare**. Contabilize em
  `work/rounds/R-0026/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
  estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado
  e **R-0024 `stynx-dedup` mesclada ou publicada em `origin/orchestra/stynx-dedup`** (padrão de ligação;
  abertura empilhada, seção OD-C2-005) — fora isso, nunca pare por upstream ainda não mesclado. O que depende de upstream é o
  **PR final** (seção OD-C2-005). As notas abaixo dizem só a ordem interna dos grupos: **CTG-0001 (mapas de leitura e comando, triagem OD-D16, decisões OD-D33/35/58): nenhum upstream além
  de R-0024. CTG-0002 (backend DASHBOARD: códigos, guarda, job, rotas de leitura decididas): livre, salvo se
  criar chave em `policy.ts`, caso em que vale a regra de convivência da seção OD-C2-005. CTG-0003 (produtores RAIT, #96):
  é incondicional (OD-R26-001 = (a), decidida pelo Owner em 2026-09-26); **lock compartilhado** (regra de convivência da seção OD-C2-005, sem fila de PR) com o CTG-0002 de
  R-0025 `rait-web-wiring` (`orchestra/rait-web-wiring`) e com os CTGs backend de R-0027
  `portal-delegations` (`orchestra/portal-delegations`). CTG-0004 (console L0 → L2): depende do commit
  de TASK-0005 na branch só nas telas que usem rota nova; stack local de R-0017 em `main` para o smoke. CTG-0005 (docs
  e delta): esquema `work/rounds/R-0030/availability-manifest.schema.md` em `main`**. No bootstrap, registre em `plan.md`
  §Concorrência quais upstreams já estão em `main` (`git log --oneline -30 origin/main`,
  `gh pr list --state merged --limit 20`), quais grupos estão liberados para merge e quais serão
  desenvolvidos sobre base empilhada (§1). Grupos livres avançam sempre; grupos presos aguardam ou
  empilham, nunca bloqueiam a rodada inteira.

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0026/plan.md   # checkpoint anterior?
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/dashboard-wiring` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring" orchestra/dashboard-wiring`; (d) PR aberto
de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016 e C-0001; detalhe em `waves.md` §Histórico e em
`work/campaigns/C-0002-consolidacao.md` §4):
(1) crie `work/rounds/R-0026/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
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
resolvida pelo Architect por adenda numerada antes de redespachar;
(11) **relatórios versionados:** `git add -f work/rounds/R-0026/reports/` enquanto o `.gitignore`
(`reports/`) casar com o diretório; depois de cada `git add` de grupo, compare `find <dir> -type f` com
`git ls-files <dir>` antes do push (R-0016; R-0007 perdeu 24 relatórios); (12) **critérios de aceitação
não se reescrevem:** mudança só por adenda numerada em `plan.md` com decisão do Owner; o critério
substituído vai ao `closure.json` como **não cumprido** — proibido repetir R-0013/R-0014 (Lighthouse →
axe; suíte integral → testes focais) e o waiver SQL2 de R-0007; (13) **ODs no registro canônico**
(`docs/meta/knowledge-base/open-decisions-rait.md` ou o build pack do app) no mesmo PR que as cria — OD
que vive só em `contracts/` não conta; (14) **âncora da prova:** `evidence record` + `evidence verify` por
CTG, `audit observe` no SHA exato do merge, `round close` + `round seal`; nenhuma rodada fecha com prova
sem âncora em `record/proofs/chain.json`; conflito na cadeia nunca se resolve à mão; (15) **DEVAI 1.5.6**
é o pacote instalado (Constituição pinada 1.0.0); menção a 1.4.5 é drift, não instrução; (16) o closure
só afirma os checks obrigatórios reais da proteção de `main` (confira com
`gh api repos/{owner}/{repo}/branches/main/protection`); `closed_at` é o instante real; (17) **orçamento:**
`budget.json` obrigatório; a 80 % grave checkpoint e pare, sem dispensa implícita; (18) **padrão de ligação
único:** `docs/framework/arch/frontend-wiring-pattern.md` (R-0024) é aplicado sem variantes — nenhum
cliente, interceptor, serviço SSE ou guarda local novo; divergência entre o padrão e o app é adenda
numerada ou OD, nunca variante; (19) **caracterização antes de troca:** a matriz papel × rota do app
(`app.guards-matrix.*.spec.ts`) é gerada e versionada antes e depois; divergência não declarada é FAIL;
(20) **nenhuma integração externa real** (SENATRAN, gov.br, SNE, banco, PAdES/TSA, RENAEST, VAPID,
biometria) — só mock ou porta (#125, #126); nenhum valor normativo inventado (`source_pending`).
(21) **seed no CI:** `bash backend/database/seed.sh` duas vezes seguidas depois de qualquer mudança em
`backend/database/seed/80-fixtures-dashboard-catalog.sql`; `connected=true` sem replay verde é proibido;
(22) o `.gitignore` tem negação para `apps/*/*/src/app/features/reports/**` (R-0016): confira que o módulo
`features/reports/` entra no commit.
Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/dashboard-wiring
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai round plan --scaffold --round R-0026 --repo-root . --as-role architect --write --format human
codex --help | head -40; claude --help | head -40   # ids de CLI de Sol 6 e Opus 5.5 (C-0002 §4)
ls work/rounds                                     # R-0026 ainda livre?
test -f docs/framework/arch/frontend-wiring-pattern.md || echo 'PARE: R-0024 não mesclada'
test -f work/rounds/R-0030/availability-manifest.schema.md || echo 'aviso: anexo do manifesto de disponibilidade ausente (CTG de docs espera)'
grep -rn '"@stynx-nyx/' backend/app/package.json apps/dashboard/web/package.json   # pin vigente; @stynx-nyx/jobs?
```

Fixe `REVIEWER_MODEL` com o id confirmado (Sol 6 no Codex CLI) e registre-o, com o id dos seus
workers, em `plan.md` §Decisões do maestro. **Leia `docs/framework/arch/frontend-wiring-pattern.md`
inteiro já no bootstrap**: ele é o contrato de ligação desta rodada (cliente de comando gerado, If-Match e
Idempotency-Key, mapeamento de erros, estados de tela, SSE canônico, guardas por política). Se o arquivo
não existir na base (`origin/main` ou `origin/orchestra/stynx-dedup`), pare antes do §3 e grave checkpoint (upstream R-0024 não mesclado).
Remeça as contagens de `plan.md` §Estado de partida e registre divergências em §Leitura.
**OD-R26-001 foi decidida pelo Owner em 2026-09-26: opção (a); o CTG-0003 é incondicional.** Registre a decisão no registro canônico no commit do CTG-0001 (recomendação original
do Architect: opção (a)); sem decisão, o CTG-0003 fica em §Bloqueios e os demais avançam.

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main` (ou de
`origin/orchestra/stynx-dedup`, se R-0024 ainda não estiver em `main`; seção OD-C2-005):
`git worktree add -b orchestra/dashboard-wiring "/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/dashboard-wiring`) sem PR para que outras frentes empilhem sobre ele.

**Avanços do `main` durante a rodada.** Outras frentes mesclam enquanto você trabalha. No início de
cada janela, em cada checkpoint (§7) e antes de cada PR (§9): `git fetch -q origin` e
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
próximo número livre com `ls docs/meta/adr` (o índice pode estar atrasado). Conflito em `backend/domains/shared/src/policy.ts` ou em `backend/domains/inf/rait-*` com
R-0025/R-0027 → mantenha os dois blocos, no formato de dados de R-0023, e rode
`pnpm --filter @detran/shared test` e `pnpm backend:test:ci`. Se o rebase invalidar um veredito `PASS` do reviewer
(diff mudou de forma substantiva), peça nova `delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `work/campaigns/C-0002-consolidacao.md` inteiro (§3.5 lock compartilhado e delta; §4 convenções)
4. `docs/framework/arch/frontend-wiring-pattern.md` (entregável de R-0024 — já lido no bootstrap)
5. `docs/framework/arch/dashboard-build-pack.md` inteiro (§4: OD-D01…D80); `docs/framework/arch/dashboard-frontends.md`;
   `docs/framework/arch/dashboard-route-contract.md`; `docs/framework/arch/dashboard-error-catalog.md`
6. `docs/meta/knowledge-base/backlog.md`, seção DASHBOARD (OD-D16-001…019 e a frente L0 → L2)
7. Para o CTG-0003: `docs/framework/arch/rait-events-sse-contract.md` §1–§2, `docs/framework/arch/rait-deadline-engine.md`
   §4–§5, `docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md` §4
8. `docs/framework/arch/parameter-catalogue.md` (allowlist i18n `dashboard.*`, `dashboard.cell_threshold`),
   `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
9. Os manuais de papel: `docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`
10. `work/rounds/R-0016/plan.md` §Decisões do maestro (M1…M9) e `work/rounds/R-0016/route-manifest.md` §F
11. `work/rounds/R-0026/plan.md` (metas, tarefas, critérios imutáveis, ODs propostas)
12. `work/rounds/R-0030/availability-manifest.schema.md` §1–§7 (superfície `dashboard-web`; caminho canônico do §1 — OD-R26-005)

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0026/plan.md` + `tasks/`

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
- **Modelo e esforço** por `model-ladder.md` (atualizado em R-0018) e pela tabela de `plan.md`; anote no `executor`.
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
tools/orchestra/bridge.sh codex "$REVIEWER_MODEL" work/rounds/R-0026/reviews/prompt-review-1.md work/rounds/R-0026/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring"
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`"/Volumes/Thiamat II/stech/detran-worktrees/dashboard-wiring"`. Se a sua CLI não tiver subagentes, execute você mesmo a tarefa **como se fosse o
worker**, obedecendo estritamente ao prompt daquela tarefa (fronteira de escrita inclusive).
Marque `status=in_progress` na tarefa; ao receber o relatório, grave-o em
`reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa e os checkpoints (b)–(d) de `plan.md` que ela dispara.
`pnpm check` e os tiers completos rodam uma vez, na sequência final (OD-C2-005). Falha → triagem em uma linha
(`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md` §Triagem → 1 nova
tentativa com o achado no prompt → se falhar, nível acima da mesma família → se falhar,
`escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado.

## 8. Revisão da entrega (reviewer, outra família)

**Uma vez, no passo 3 da sequência final (OD-C2-005):** `git diff --stat` + diff completo da rodada

- relatórios + critérios em `reviews/delivery-review-R-0026.md` (modo `delivery-review`) → ponte →
  veredito. `PASS` libera o PR; `REVIEW` volta ao worker responsável (máximo 2 ciclos); `FAIL` → `escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

Durante as ondas, só o passo 1 (commit por tarefa/CTG) e o push sem PR. Os passos 2–7 rodam uma
vez, na sequência final (OD-C2-005).

1. `git add` só dos caminhos das tarefas; commit por `CODESTYLE.md` (`<type>(<scope>): …`,
   corpo com WF/UC/RN/OD citados, trailer de atribuição da sessão).
2. Evidência (depois do merge): escreva `evidence-R-0026.json` com todos os CTGs (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0026 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `evidence verify`. Commit "chore(devai): …".
3. Confirme que todo upstream da rodada está em `main` e rebaseie (`git rebase origin/main`;
   somente se o branch nunca foi publicado); em branch publicado, use
   `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
   `git push -u origin orchestra/dashboard-wiring` e então `gh pr create --base main` com o corpo pelo
   `.github/pull_request_template.md` (papel, WP e fontes, o que muda, verificação, OD tocadas,
   fora de escopo, linha final de atribuição).
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0026 --as-role auditor --write --format human`.
6. Fechamento: `closure.json` (esquema `phase-closure`: `id`, `round_id`, `declaring_decision`,
   `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`), com
   critérios substituídos listados como **não cumpridos** e `closed_at` real, e
   `pnpm exec devai round close --round R-0026 --repo-root . --input work/rounds/R-0026/closure.json --as-role architect --write --format human`;
   depois `pnpm exec devai round seal --round R-0026 --repo-root . --as-role architect --write --format human`
   (DEVAI 1.5.6; obrigatório desde R-0020). Confirme a âncora da prova em `record/proofs/chain.json`.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada),
   `work/rounds/README.md` (linha da rodada, gate de índice de R-0018) e
   `docs/meta/knowledge-base/backlog.md`; commit final; apague o branch remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado; bloqueio por decisão
`OD-*` não coberta pelo steering §H; todos os grupos livres concluídos e os restantes presos a
upstream não mesclado (só o PR final espera; o lock compartilhado não para a rodada); reviewer
`FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; PR (número, estado); tarefas (id, papel, modelo, resultado);
ciclos de REVIEW e escaladas; gates executados com saída resumida; evidência (sequência e head da
cadeia); OD tocadas; o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que
recomenda ao método (`orchestra/README.md`, `model-ladder.md`).

Inclua no relatório final: a decisão do Owner sobre OD-R26-001…005; o bloco A (`legal-ceiling`)
antes/depois (x/11); o nível de cada uma das 22 rotas com a OD das que não chegaram a L2; o destino de
cada issue (#96…#100, #123, #124); e o caminho do manifesto entregue (`docs/framework/arch/availability/dashboard-web.availability.json`).
