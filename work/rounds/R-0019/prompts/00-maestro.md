# Prompt do maestro — orquestra `law-corpus` (rodada `R-0019`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `OpenAI — Codex CLI com Sol 6`
> (Codex CLI com Sol 6; o reviewer é Opus 5.5 no Claude Code), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/law-corpus`.
> Status: **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Não abra a rodada sem o
> `AUTHORIZATION.md` que o Owner concede a este prompt.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.

## 0. Identidade e limites

- Você é o maestro da frente **`law-corpus`**: pacotes de trabalho **ação 2 da campanha C-0002 (corpus de `law/` e `product/`)** de `work/campaigns/C-0002-consolidacao.md`.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- Família dos seus workers: **a sua** (`OpenAI — Codex CLI com Sol 6`), por subagentes nativos da sua CLI.
  Família do reviewer: **a outra** (`claude`), modelo `<ID_OPUS_5_5>`, sempre
  pela ponte `tools/orchestra/bridge.sh`. Nunca inverta. Escada dos workers (`model-ladder.md`,
  C-0002 §4): Sol 6 grande, Terra médio, Luna pequeno. Os ids exatos de CLI (`<ID_SOL_6>`,
  `<ID_TERRA>`, `<ID_LUNA>` via `codex --help`; `<ID_OPUS_5_5>` via `claude --help`) são
  confirmados no bootstrap e gravados em `plan.md` §Decisões do maestro (M1) antes de qualquer
  disparo; nenhum id é adivinhado.
- Orçamento desta janela de 5 h: **frente prevista para 2 janelas; nesta janela, um planejamento de
  maestro + até 6 tarefas de worker (Terra/Luna) + 2 prompt-reviews + 2 delivery-reviews — ≈ 650 k
  tokens de entrada; ao atingir 80 % grave checkpoint**. Contabilize em
  `work/rounds/R-0019/budget.json` (uma linha por tarefa e por chamada ao reviewer, com
  estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` atualizado
  (≥ a92ef731, PR #117) — nunca pare por upstream ainda não mesclado. O que depende de upstream é o
  **merge de cada grupo acoplado**: **fase A da C-0002, em paralelo a R-0017 (`local-stack`) e
  R-0018 (`index-state`). CTG-0001 (`law/invariants`, `law/trace.json`, `law/policy`,
  `law/schemas`, gate `verify:law-corpus`): nenhum upstream. CTG-0002 (`law/glossary`, `product/`):
  nasce depois do merge do CTG-0001 e só mescla com aceite explícito do Owner (proposta). CTG-0003
  (docs): após CTG-0002 ou checkpoint dele. Locks partilhados: `package.json` e `.prettierignore`
  (R-0017, R-0018), `work/rounds/README.md` (só a linha de R-0019) e `open-decisions-rait.md` (uma seção
  por rodada) — integre `origin/main` por merge e
  reconcilie no mesmo commit. Nunca toque `law/adr/**` (R-0018) nem `law/policy/adr-validation.json`
  (R-0018/R-0020), `law/register/**`, `law/policy/forbidden-action-authorizations.json`,
  `.devai/config/project.json` nem CI (R-0020)**. No bootstrap, registre em `plan.md`
  §Concorrência quais upstreams já estão em `main` (`git log --oneline -30 origin/main`,
  `gh pr list --state merged --limit 20`), quais grupos estão liberados para merge e quais serão
  desenvolvidos sobre base empilhada (§1). Grupos livres avançam sempre; grupos presos aguardam ou
  empilham, nunca bloqueiam a rodada inteira.

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/law-corpus já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0019/plan.md   # checkpoint anterior?
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/law-corpus` remoto sem worktree local → `git worktree add /Volumes/Thiamat II/stech/detran-worktrees/law-corpus orchestra/law-corpus`; (d) PR aberto
de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0008; detalhe em `waves.md` §Histórico):
(1) crie `work/rounds/R-0019/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
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

**Lições obrigatórias da C-0001** (C-0002 §4): (11) relatórios de worker em `reports/` são
versionados — até R-0018 corrigir o `.gitignore`, `git add -f work/rounds/R-0019/reports/`, e depois
de todo `git add` compare `find <dir> -type f` com `git ls-files <dir>`; (12) critérios de aceitação
imutáveis: mudança só por adenda numerada em `plan.md` com decisão do Owner, e critério substituído
aparece no closure como não cumprido, nunca como PASS; (13) toda OD nova vai para o registro
canônico no mesmo PR (seção da rodada em `docs/meta/knowledge-base/open-decisions-rait.md`); OD que
vive só em `contracts/` não conta; (14) âncora da prova: depois de cada `evidence record`, confira
que a nova linha de `record/proofs/work/generic/R-0019.jsonl` tem âncora em
`record/proofs/chain.json` (nota `proof_sequence`); nenhuma rodada fecha com prova sem âncora e a
cadeia nunca é resolvida à mão; (15) `budget.json` obrigatório — ao estourar, checkpoint e parada,
sem dispensa implícita; (16) nada de valor normativo inventado (`source_pending`/OD), nenhuma
integração externa real, nenhum `--force`, nenhuma edição de arquivo gerado (inclusive
`.devai/config/*`: só por `devai init bind`). **Específicas desta frente:** (17) `law/` e `product/`
destilam e referenciam o corpus de `docs/framework/**`, nunca o copiam nem o editam; (18)
`authority_docs.anchor` só com slug de cabeçalho Markdown existente (confira com `grep -n '^#'`);
(19) commits segregados por autoridade de caminho (`plan.md` M5) — nunca misture `law/`,
`product/`, `record/` e código no mesmo commit; (20) `product/` e `law/glossary/` são **proposta
para aceite do Owner**: o PR do CTG-0002 diz isso no título e no corpo, e o merge espera o aceite.
Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/law-corpus
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai --version             # deve ser devai/1.5.6 (C-0002 §4); outra versão → pare e reporte
pnpm exec devai round plan --scaffold --round R-0019 --repo-root . --as-role architect --write --format human
codex --help; claude --help           # confirme os ids de CLI (M1)
```

Depois do bootstrap, **remeça a linha de base** de `plan.md` (§Linha de base medida) no HEAD atual,
com os mesmos comandos, e registre as diferenças em §Concorrência: os critérios comparam contra a
medição da abertura, não contra a de 2026-09-26.

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/law-corpus /Volumes/Thiamat II/stech/detran-worktrees/law-corpus origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/law-corpus`) sem PR para que outras frentes empilhem sobre ele.

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
próximo número em `docs/meta/adr/README.md`. Se o rebase invalidar um veredito `PASS` do reviewer
(diff mudou de forma substantiva), peça nova `delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `work/campaigns/C-0002-consolidacao.md` inteiro
4. `.devai/pin/constitution.md` Art. 6 (autoridade por caminho), Art. 7 (papéis), Art. 11–13
   (invariantes, jornadas, trace) e Art. 41 (evidência)
5. Esquemas DEVAI em `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/`:
   `invariant`, `trace`, `glossary-entry`, `journey`, `use-cases`, `adopter-policy`, `common-defs`
   (só as `$defs` citadas)
6. `docs/framework/product/README.md`, `docs/framework/glossary/domain.md`,
   `docs/framework/schemas/README.md`, `docs/framework/blueprints/README.md`, e os seis `APP.md`
   (`find docs/framework/product -name APP.md`) — o resto do corpus, os workers leem por listas
   fechadas
7. `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
8. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`
9. `work/rounds/R-0019/plan.md` (metas, linha de base e critérios já extraídos para esta frente)

Diagnóstico de apoio, versionado com a campanha, somente leitura:
`work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md` §4.4, §4.9 e §5 (NC-M1,
NC-M2). O `plan.md` já transcreve o que é necessário; não bloqueie se ele não estiver acessível.

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0019/plan.md` + `tasks/`

Para cada entregável do WP escreva **tarefas** no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`, `tasks/TASK-nnnn.json`), obedecendo:

- **Tríade por comando/entidade**: `TASK` Architect (contrato, DDL/blueprint, guardas, critérios)
  → `TASK` Inspector (testes que codificam os critérios) → `TASK` Engineer (implementação até os
  testes passarem); mesmo `coupled_task_group`, `upstream_task_id` encadeado. Tarefas de
  transcrição (fichas, i18n, contratos de payload) são tarefas simples de `transcriber-docs`.
  O `plan.md` já traz a decomposição (11 tarefas, 3 CTGs); refine, não replaneje.
- **Tarefas válidas contra `task.schema.json` 2.0.0** (143/260 das rodadas anteriores não eram):
  `target_invariants` só com ids `INV-*` que existam em `law/invariants/` (antes do CTG-0001, vazio;
  referências WF/RN/ADR/OD vão em `tags` como `ref:<id>`); `db_isolation` ∈ {`database`,
  `cluster`}; `coupled_task_group` `CTG-nnnn`; `executor` completo. Valide cada arquivo com o `ajv`
  do próprio DEVAI antes do prompt-review e registre o resultado em §Leitura.
- **`target_modules`** com os módulos de lock (ex.: `MOD-law-invariants`, `MOD-product`,
  `MOD-root-package-json`); duas tarefas com o mesmo lock nunca correm juntas.
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
tools/orchestra/bridge.sh claude <ID_OPUS_5_5> work/rounds/R-0019/reviews/prompt-review-1.md work/rounds/R-0019/reviews/prompt-review-1.json /Volumes/Thiamat II/stech/detran-worktrees/law-corpus
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`/Volumes/Thiamat II/stech/detran-worktrees/law-corpus`. Se a sua CLI não tiver subagentes, execute você mesmo a tarefa **como se fosse o
worker**, obedecendo estritamente ao prompt daquela tarefa (fronteira de escrita inclusive).
Marque `status=in_progress` na tarefa; ao receber o relatório, grave-o em
`reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa e, ao fim de cada grupo acoplado, `pnpm check` e os
membros `devai check --only …` de `plan.md` §Critérios (com `git status --porcelain` antes e depois;
se mudar algo, rode em clone descartável e registre). Esta frente não toca código de backend: o
tier `pnpm backend:test:ci` não é exigido. Falha → triagem em uma linha
(`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md` §Triagem → 1 nova
tentativa com o achado no prompt → se falhar, nível acima da mesma família → se falhar,
`escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado.

## 8. Revisão da entrega (reviewer, outra família)

Para cada grupo acoplado concluído: `git diff --stat` + diff completo + relatórios + critérios em
`reviews/delivery-review-<ctg>.md` (modo `delivery-review`) → ponte → veredito. `PASS` libera o
commit; `REVIEW` volta ao worker responsável (máximo 2 ciclos); `FAIL` → `escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. `git add` só dos caminhos das tarefas; commit por `CODESTYLE.md` (`<type>(<scope>): …`,
   corpo com WF/UC/RN/OD citados, papel declarado — Art. 7 —, trailer de atribuição da sessão).
   Segregação por autoridade de caminho (M5, lição 19). O binding de `adopter-policy` é um commit
   `chore(devai)` próprio com a saída de `devai init bind`.
2. Evidência: escreva `evidence-<ctg>.json` (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0019 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `evidence verify`. Commit "chore(devai): …".
3. Confirme que todo upstream do grupo está em `main` e rebaseie (`git rebase origin/main`;
   somente se o branch nunca foi publicado); em branch publicado, use
   `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
   `git push -u origin orchestra/law-corpus` e então `gh pr create --base main` com o corpo pelo
   `.github/pull_request_template.md` (papel, WP e fontes, o que muda, verificação, OD tocadas,
   fora de escopo, linha final de atribuição).
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0019 --as-role auditor --write --format human`.
6. Fechamento: `closure.json` (esquema `phase-closure`: `id`, `round_id`, `declaring_decision`,
   `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`) e
   `pnpm exec devai round close --round R-0019 --repo-root . --input work/rounds/R-0019/closure.json --as-role architect --write --format human`.
   `declaring_decision`/`closing_decision` seguem o padrão `D-n|DII-n` do esquema; até R-0020
   registrar as decisões (`law/register/`), use `D-1` (autorização do Owner em `AUTHORIZATION.md`) e
   `D-2` (julgamento de fechamento do maestro após merge e PASS do reviewer) e descreva esse
   significado no corpo do closure. **`devai round seal` desta rodada é feito por R-0020** (C-0002
   §4: seal obrigatório a partir de R-0020); não crie `record.md`, `close-state.jsonl` nem
   `law/register/` aqui. Critério substituído entra no closure como não cumprido.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada) e
   `docs/meta/knowledge-base/backlog.md` (TASK-0011); commit final; apague o branch remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado; bloqueio por decisão
`OD-*` não coberta pelo steering §H; CTG-0002 aguardando aceite do Owner; todos os grupos livres
concluídos e os restantes presos a upstream não mesclado; reviewer
`FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; PR (número, estado); tarefas (id, papel, modelo, resultado);
ciclos de REVIEW e escaladas; gates executados com saída resumida; linha de base × resultado de cada
membro `devai check` do plano; evidência (sequência, head da cadeia, âncoras conferidas); aceite do
Owner no CTG-0002 (sim/não); OD tocadas; o que ficou fora e por quê; consumo estimado
(`budget.json`); o que R-0020 herda (catálogo INV, trace, commits a receber recibo); ajustes que
recomenda ao método (`orchestra/README.md`, `model-ladder.md`).
