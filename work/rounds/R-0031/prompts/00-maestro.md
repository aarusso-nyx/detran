# Prompt do maestro — orquestra `pec-web` (rodada `R-0031`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `OpenAI — Codex CLI com Sol 6`
> (Claude Code com Opus 5.5, ou Codex CLI com Sol 6), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/pec-web`.
> Você é o **maestro** desta orquestra. Tudo o que você precisa saber está nos arquivos citados;
> não há contexto anterior a recuperar.
>
> **Pré-condição:** o Owner autorizou `work/campaigns/C-0002-consolidacao.md` e
> `work/rounds/R-0031/plan.md`. Sem essa autorização registrada, pare antes do §1 e reporte.

## OD-C2-005 — fluxo contínuo (prevalece)

Decisão do Owner de 2026-09-27 (`work/campaigns/C-0002-consolidacao.md` §12). Prevalece sobre
qualquer trecho deste prompt que mande abrir PR, rodar CI remoto, gravar evidência, observar
auditoria ou pedir delivery-review por CTG.

- **Branch única** `orchestra/pec-web`. Faça um commit por tarefa ou por CTG, seguindo
  `CODESTYLE.md` e a autoria por caminho (OD-R20-003). Só você commita, em série.
- **Nada intermediário:** entre CTGs não há PR, CI remoto, merge em `main`,
  `devai evidence record`, `devai audit observe`, `pnpm check` completo nem delivery-review.
- **Mantidos:**
  - os `acceptance_commands` de cada tarefa e a triagem por tarefa (§7);
  - **um** ciclo de prompt-review (§5) no bootstrap, sobre `plan.md` e os prompts de TASK-0001…0019.
- **Ondas.** Siga `plan.md` §Execução OD-C2-005 (O1…O14): até 3 workers simultâneos, com
  fronteiras de escrita disjuntas.
- **Push sem PR** ao fim de cada onda: `git push -u origin orchestra/pec-web`.
  - O push da O3 publica o CTG-0001 (contratos), sobre o qual R-0032 abre empilhada.
  - O push da O6 publica o CTG-0002 (fixtures e personas).
  - Antes desses dois pushes, confira `route-manifest.md` e as personas contra o §Mapa de R-0032.
- **Abertura empilhada:**
  - Abra sobre `origin/main` com R-0024, ou empilhada em `origin/orchestra/stynx-dedup`.
  - Integre com `git merge --no-edit` os branches publicados de R-0023, R-0022 e, para a O13,
    `origin/orchestra/user-docs` (CTG-0001 e CTG-0003 de R-0030 no branch), quando as ondas
    chegarem a eles.
  - O PR final espera R-0022, R-0023, R-0024 e R-0030 em `main`, com STYNX 1.5.0 final.
- **Sequência final,** executada uma vez:
  1. `git fetch -q origin && git merge --no-edit origin/main`.
  2. CI local: os comandos de `plan.md` §Execução OD-C2-005 (`pnpm check`, `contracts:check`,
     `contracts:test`, `verify:*`, `seed.sh` duas vezes, `pnpm backend:test:integration`,
     `pnpm backend:test:ci`, `parameters:*`, tripla de `@detran/pec-web`, `docs:*`,
     `format:check`, `stack:start` e `stack:smoke`) e `pnpm devai:rc:prepare`, quando aplicável.
  3. Uma delivery-review (§8) do diff inteiro.
  4. Um PR (§9.3).
  5. CI remoto e merge (§9.4–5).
  6. Evidência única `evidence-R-0031.json` com os 6 CTGs, `audit observe` no SHA do merge,
     `round close` e `round seal` (§9.2, §9.5–7).

## 0. Identidade e limites

- Você é o maestro da frente **`pec-web`**: **ação 8 da campanha C-0002**, fase F, decisão do Owner
  OD-C2-002 e `docs/meta/adr/ADR-0034-pec-web-frontend.md` (vinculante), detalhada em
  `work/rounds/R-0031/plan.md`. **OD-PW-001 foi decidida pelo Owner em 2026-09-26: plano completo
  em R-0032.** A superfície C (P-01…P-07 no Portal) é da rodada **R-0032 `portal-pec`**, que
  consome os contratos (CTG-0001) e as fixtures (CTG-0002) desta rodada; você não toca
  `apps/portal/web`, `backend/domains/portal` nem `portal-web.availability.json`. O build pack do PEC (`docs/framework/arch/pec-build-pack.md`)
  nasce nesta rodada (TASK-0001); até lá, o plano é a fonte.
- Declare, na primeira linha da sua primeira resposta, o papel constitucional em que atua em cada
  fase: **Architect** ao planejar e revisar, **Engineer** ao commitar código, **Auditor** nunca
  (o reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- Família dos seus workers: **a sua** (`OpenAI — Codex CLI com Sol 6`), por subagentes nativos da sua CLI
  (Sol 6 grande, Terra médio, Luna pequeno, com os nomes e ids vigentes em
  `docs/meta/agents/orchestra/model-ladder.md` após R-0018; confirme com `codex --help` e anote em
  `plan.md` §Decisões do maestro).
  Família do reviewer: **a outra** (`claude`), modelo **Opus 5.5** (id confirmado com
  `claude --help` no bootstrap), sempre pela ponte `tools/orchestra/bridge.sh`. Nunca inverta.
- Orçamento desta janela de 5 h: **frente prevista para 5 janelas; nesta janela, planejamento de maestro + CTG-0001 (TASK-0001 Sol 6, TASK-0002 e TASK-0003 Terra) com 1 ciclo de prompt-review (até 2 rodadas de REVIEW; delivery-review só no fim, OD-C2-005) ≈ 700 k tokens de entrada; ao atingir 80 % (≈ 560 k) grave checkpoint e pare**. Contabilize em
  `work/rounds/R-0031/budget.json` (obrigatório; uma linha por tarefa e por chamada ao reviewer, com
  estimativas de tokens de entrada e saída). Se esgotar, grave `checkpoint` (§9) e pare — sem
  dispensa implícita.
- Você é o único que executa `git`. Workers não commitam, não fazem push, não abrem PR.
- Concorrência (regra de `waves.md`): para **abrir** esta frente basta `origin/main` com R-0024
  `stynx-dedup` mesclado, ou empilhado em `origin/orchestra/stynx-dedup` (OD-C2-005; confira
  `docs/framework/arch/frontend-wiring-pattern.md`); R-0030
  `user-docs` pode estar aberta em paralelo. O que depende de upstream é o **PR final** (OD-C2-005); por
  grupo, vale a presença no branch (em `main` ou empilhado): **CTG-0001 (contratos PEC) e CTG-0002 (fixtures, integração, tiers): R-0023 `authz-unification` em `main`; CTG-0003 (frontends, fichas, i18n): nenhum além do CTG-0001; CTG-0004/CTG-0005 (app A e B): R-0022 `stynx-sse-tenancy` e R-0024 em `main`, mais CTG-0002 e CTG-0003 desta rodada; CTG-0006 (stack, manifesto, manual): R-0017 `local-stack` e os CTG-0001 e CTG-0003 de R-0030 em `main`, com a TASK-0017 serializada com a TASK-0011 de R-0032 (`MOD-local-stack`). Consumidora a jusante: R-0032 `portal-pec` (`orchestra/portal-pec`) abre empilhada em `origin/orchestra/pec-web` após o seu CTG-0001 existir no branch publicado e avança o CTG de backend dela após o seu CTG-0002 existir no branch; o PR final de R-0032 espera o merge desta rodada — publique esses dois CTGs cedo (pushes das ondas O3 e O6) e não altere sem adenda as operações `ch` e as personas que o `plan.md` de R-0032 lista. Locks partilhados: `MOD-shared-policy` (serialize com a frente que o detiver), `package.json`, `parameter-catalogue.md`, `import-manifest.json`, `tools/detran-stack.sh`, `waves.md` — integre `origin/main` por merge antes do PR final**. No bootstrap, registre em `plan.md`
  §Concorrência quais upstreams já estão em `main` (`git log --oneline -30 origin/main`,
  `gh pr list --state merged --limit 20`), quais grupos estão liberados para merge e quais serão
  desenvolvidos sobre base empilhada (§1). Grupos livres avançam sempre; grupos presos aguardam ou
  empilham, nunca bloqueiam a rodada inteira. Confira que o número R-0031 continua livre para esta
  frente (`ls work/rounds`).

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/pec-web já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0031/plan.md   # checkpoint anterior?
```

Regras: (a) worktree e branch existentes → reutilize-os, nunca recrie; (b) `plan.md` §Retomada
preenchido → você está **retomando**: continue do checkpoint, não replaneje; (c) branch
`orchestra/pec-web` remoto sem worktree local → `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/pec-web" orchestra/pec-web`; (d) PR aberto
de outra frente com lock comum ao seu grupo → registre em `plan.md` §Concorrência e trate como
upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016 e campanha C-0002 §4; detalhe em
`waves.md` §Histórico):
(1) crie `work/rounds/R-0031/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou
este prompt e o `plan.md` — sem ele `devai round close` responde `TASK_ROUND_INACTIVE`; (2) pacote de workspace
novo (`@detran/pec-web`) exige `pnpm install` pelo maestro e commit do `pnpm-lock.yaml` antes do push (CI usa
`--frozen-lockfile`); (3) toda edição de `docs/framework/arch/parameter-catalogue.md` é seguida de
`pnpm parameters:generate`, e specs nunca contêm chaves de parâmetro como literal
(`verify:parameter-catalogue`); (4) helper `.mjs` importado por spec TS precisa de `.d.mts` irmão;
(5) pacote novo montado no `AppModule` precisa de alias em `backend/app/vitest.config.ts`;
(6) workers não deixam `pnpm check` rodando em segundo plano — encerre processos perdidos pelo pid
exato antes dos seus gates, nunca por padrão de nome; (7) `git add record/proofs` explícito em cada
commit de evidência; (8) `audit observe` só no HEAD exato integrado; se outra rodada fechar antes,
aceite a cadeia de `main`, observe o HEAD integrado e repita `round close` (o id de fechamento muda);
(9) `seed.sh` faz parte do CI e esta rodada, dona das fixtures `ch`, prova as duas execuções;
(10) ciclos de revisão a partir do segundo restritos aos itens corrigidos; contradição entre
contrato e código é resolvida pelo Architect por adenda numerada antes de redespachar;
(11) **relatórios versionados** em `work/rounds/R-0031/reports/` (`git add -f` se o `.gitignore`
ainda os ignorar); depois de cada `git add` de grupo, compare `find <dir> -type f` com
`git ls-files <dir>` antes do push; (12) **critérios de aceitação não se reescrevem:** mudança só
por adenda numerada em `plan.md` com decisão do Owner; o critério substituído vai ao
`closure.json` como **não cumprido** (proibido repetir as trocas de R-0013/R-0014 e o waiver SQL2
de R-0007); (13) **ODs no registro canônico** (`docs/framework/arch/pec-build-pack.md` §Questões
abertas) no mesmo PR que as cita; OD que vive só em `contracts/` não conta; (14) **âncora da prova
na cadeia:** cada `evidence record` ancorado em `record/proofs/chain.json` antes do fechamento;
conflito em `chain.json` nunca se resolve à mão; (15) **DEVAI 1.5.6**; pin da Constituição 1.0.0;
(16) **caracterização antes de troca:** erros PEC e tiers de teste só mudam depois da suíte de
caracterização verde (TASK-0002); a matriz papel × rota e os negativos de RLS/tenancy são gerados e
versionados antes e depois, e divergência é FAIL; (17) nenhuma integração externa real
(PAdES/TSA, biometria, RENACH, SEFAZ): porta, mock ou fail-closed; (18) nenhum valor normativo
inventado (`source_pending` ou OD); (19) papel novo só por OD; (20) `closed_at` é o instante real.
Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/pec-web
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai round plan --scaffold --round R-0031 --repo-root . --as-role architect --write --format human
ls -d backend/domains/ch/*/ | wc -l   # contagem de módulos medida (17 em a92ef731); anote em plan.md
```

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/pec-web "/Volumes/Thiamat II/stech/detran-worktrees/pec-web" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):
num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>` (ou
crie a worktree já a partir desse upstream). Depois do primeiro push, nunca reescreva o histórico:
integre novas revisões do upstream com `git merge --no-edit origin/orchestra/<upstream>`. Quando o
upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte. O PR contra `main` só abre
depois de o upstream estar em `main`; um branch empilhado pode ser enviado
(`git push -u origin orchestra/pec-web`) sem PR para que outras frentes empilhem sobre ele.

**Avanços do `main` durante a rodada.** No início de cada janela, em cada checkpoint (§7) e antes
do PR final (§9): `git fetch -q origin` e `git log --oneline HEAD..origin/main`; se houver commits
novos, use `git rebase origin/main` somente se o branch nunca foi publicado. Caso contrário, use
`git merge --no-edit origin/main`. Nunca use `--force`, `--force-with-lease` ou equivalente. Depois
da integração, rode de novo os gates do grupo. Ao resolver conflitos: arquivo **gerado**
(`backend/domains/**/src/generated`, contratos `*.openapi.json` gerados, `packages/api-clients/src/generated`,
`ddl/*.sql` de blueprint) → nunca edite à mão, aceite qualquer lado e regenere
(`pnpm blueprints:generate`, `pnpm contracts:openapi`, `pnpm contracts:clients`);
`record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl` → aceite a versão de `main` e
rode `devai evidence record` de novo para os seus commits; `policy.ts`/`roles.ts` → mantenha os dois
blocos e rode `pnpm --filter @detran/shared test`; `pnpm-lock.yaml` → aceite `main` e
`pnpm install --frozen-lockfile`, ou `pnpm install` num commit `chore(deps)` próprio. Antes de
criar a semente `ch`, confira o número livre com `ls backend/database/seed`; antes de criar uma
ADR, confira o próximo número em `docs/meta/adr/README.md`. Se a integração invalidar um veredito
`PASS` do reviewer, peça nova `delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`
3. `work/campaigns/C-0002-consolidacao.md`; `docs/meta/adr/ADR-0034-pec-web-frontend.md`;
   `work/rounds/R-0031/plan.md` inteiro; `work/rounds/R-0032/plan.md` §Mapa tela → rota → backend
   (as operações `ch` e as personas que a consumidora espera)
4. `docs/framework/product/domains/ch/pec/screens/IU-PEC-001.md` inteiro;
   `docs/framework/product/domains/ch/pec/APP.md` (§Atores, §Vocabulário de resultado,
   §Residual); `docs/meta/decisions/pec.md`; `docs/meta/knowledge-base/open-issues.md` linhas
   DT-021…DT-024
5. ADRs de fronteira: `ADR-0003-senatran-adapter-sole-boundary.md`,
   `ADR-0009-generated-openapi-contracts.md`, `ADR-0012-pec-kernel-and-integration-mapping.md`,
   `ADR-0018-documents-and-signature-substrate.md`
6. Código-âncora: `backend/domains/shared/src/roles.ts`, as linhas `ch`/`candidate-dossier` de
   `backend/domains/shared/src/policy.ts`, `tools/contracts/check-commands.mjs` (cabeçalho e
   `CONTROLLER_ROOTS`), `backend/database/seed.sh`, `docs/framework/arch/frontend-wiring-pattern.md`
   (R-0024)
7. `docs/framework/arch/parameter-catalogue.md` (§Namespaces i18n e §Superfície, chave e valores
   de linha); `docs/meta/knowledge-base/decision-closure-plan.md`,
   `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma)
8. Convenção herdada: `docs/framework/arch/user-docs-convention.md` e
   `work/rounds/R-0030/availability-manifest.schema.md` (se a convenção não estiver em `main` nem em
   `origin/orchestra/user-docs`, leia só o anexo e adie o CTG-0006)
9. Os manuais de papel que usará: `docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso; o que faltar, os workers leem com listas fechadas (as do §Mapa entregável → definições do
`plan.md`, por tarefa).

## 3. Plano de decomposição (Architect) → `work/rounds/R-0031/plan.md` + `tasks/`

A tabela de tarefas do `plan.md` (TASK-0001…TASK-0019, CTG-0001…CTG-0006) é a decomposição
autorizada. Derive `tasks/TASK-nnnn.json` no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`), obedecendo:

- **Tríades** Architect → Inspector → Engineer por grupo (contratos; fixtures e integração;
  exceção de namespace; console A; console B). A tríade do Portal saiu para R-0032. Fichas, i18n, manual e manifesto são tarefas
  de `transcriber-docs`, testadas pelo Inspector ou pelos gates de R-0030, nunca pelo próprio
  transcriber.
- **Contratos antes das telas** (ADR-0034 §3): nenhuma tarefa de tela é despachada antes de o
  CTG-0001 estar concluído na branch; nenhuma tela consome rota fora de `route-manifest.md`.
- **`target_modules`** com os locks da tabela; duas tarefas com o mesmo lock nunca correm juntas;
  no máximo três workers simultâneos.
- **`acceptance_commands`** só com comandos que existem em `package.json` (ou nos `package.json`
  dos pacotes) ou que a própria tríade entrega; cada comando com o resultado esperado em `plan.md`.
- **Modelo e esforço** conforme a tabela; anote no `executor`.

Complete no `plan.md` apenas §Decisões do maestro, §Concorrência e §Leitura. Metas, tarefas e
critérios não mudam sem adenda do Owner.

## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`

Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`
(variante do papel), preenchendo **todas** as seções: papel, contexto da frente, leitura
obrigatória fechada (caminhos exatos), pode/não pode tocar (diretórios exatos), tarefa (o quê),
critérios de aceitação (comandos + resultado), proibições, entrega (formato fixo). Regras:

- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
- Transfira para o prompt os trechos de definição que o worker precisa: as tabelas A/B/C e os
  requisitos §D e §E de [IU-PEC-001]; o vocabulário legal e a separação das trilhas
  ([RN-PEC-105], `APP.md` §Vocabulário); a regra do titular sem máscara ([RN-PEC-153]); a proibição
  de escolha de clínica ([RN-PEC-113]); o nível de assinatura ([RN-PEC-142]); as ODs OD-PW-* com o
  padrão vigente.
- Todo prompt de tela e de manual carrega: "nada de `CONDICIONADO`/`PENDENTE` visível ao candidato";
  "assinatura sem provedor ⇒ falha fechada e estado explícito"; "biometria só pela porta, com a
  implementação de homologação rotulada"; "RENACH nunca é chamado pelo frontend".
- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
  `source_pending` ou abrir `OD-PW-*`.
- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
  `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).

## 5. Revisão dos prompts (reviewer, outra família)

Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
em modo `prompt-review`, anexando `plan.md` e os `prompts/*.md` de todas as tarefas (ciclo único, OD-C2-005). Invoque:

```bash
tools/orchestra/bridge.sh claude <id-Opus-5.5> work/rounds/R-0031/reviews/prompt-review-1.md work/rounds/R-0031/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/pec-web"
```

Leia o veredito. `REVIEW` → corrija os prompts apontados e repita (máximo 2 ciclos). `FAIL` ou
terceiro ciclo → pare, registre em `plan.md` §Bloqueios e reporte ao humano. Só dispare workers
com `PASS`. Esta frente muda contrato, política e fixtures: o reviewer é sempre de nível grande.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas, lock livre): dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, modelo e esforço do `executor`, worktree
`/Volumes/Thiamat II/stech/detran-worktrees/pec-web`. Se a sua CLI não tiver subagentes, execute você mesmo a tarefa **como se fosse o
worker**, obedecendo estritamente ao prompt daquela tarefa (fronteira de escrita inclusive).
Marque `status=in_progress` na tarefa; ao receber o relatório, grave-o em
`reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa (que incluem os checkpoints locais de `plan.md`
§Checkpoints, como a caracterização nas duas pontas do CTG-0001). `pnpm check` completo e os tiers
(`seed.sh` duas vezes, `pnpm backend:test:integration`, `pnpm backend:test:ci`, a tripla do app)
rodam uma vez, na sequência final (§OD-C2-005). Falha → triagem em uma linha
(`plant-bug | sensor-error | policy-issue | reference-gap`) em `plan.md` §Triagem → 1 nova
tentativa com o achado no prompt → se falhar, nível acima da mesma família → se falhar,
`escalated`. Nunca ajuste um teste para passar; nunca edite arquivo gerado; nunca afrouxe um
estado "bloqueado por decisão" para a tela parecer pronta.

## 8. Revisão da entrega (reviewer, outra família)

Uma vez, no fim da rodada (OD-C2-005), depois do CI local: `git diff --stat origin/main...HEAD` +
diff completo + relatórios + critérios em `reviews/delivery-review-R-0031.md` (modo
`delivery-review`) → ponte → veredito. Anexe a lista de personas das fixtures (CTG-0002) para o
reviewer confirmar que nenhum dado é real. `PASS` libera o PR; `REVIEW` → correções restritas aos
itens apontados, pelo worker responsável (máximo 2 ciclos); `FAIL` → `escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. `git add` só dos caminhos das tarefas (mais `reports/`); commit por `CODESTYLE.md`
   (`<type>(<scope>): …`, corpo com UC/RN/WF/ADR/OD citados, papel declarado, trailer de
   atribuição da sessão). Commits por CTG na branch única; um PR no fim (OD-C2-005).
2. Evidência — só na publicação final, depois do merge (OD-C2-005): escreva `evidence-R-0031.json`
   com todos os CTGs (ação, commits, artefatos com sha256, gates) e rode
   `pnpm exec devai evidence record --kind generic --round R-0031 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   depois `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` e
   confirme que a nova linha de `record/proofs/work/generic/R-0031.jsonl` tem âncora em
   `record/proofs/chain.json`. Commit "chore(devai): …".
3. PR único, depois do CI local e do `PASS` da delivery-review final: confirme que todo upstream
   da rodada está em `main` e rebaseie (`git rebase origin/main`;
   somente se o branch nunca foi publicado); em branch publicado, use
   `git merge --no-edit origin/main`. Rode novamente os gates, faça somente push normal com
   `git push -u origin orchestra/pec-web` e então `gh pr create --base main` com o corpo pelo
   `.github/pull_request_template.md` (papel, fontes, o que muda, verificação, OD tocadas,
   fora de escopo, linha final de atribuição), mais a tabela CTG → tarefas → commits e o
   resultado dos gates. No PR, peça ao Owner decisão sobre OD-PW-002 (consumida também por R-0032); OD-PW-001 já está decidida (R-0032).
4. Acompanhe o CI (`gh pr checks <n>`); falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge, e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0031 --as-role auditor --write --format human`.
6. Fechamento: `closure.json` (esquema `phase-closure`: `id`, `round_id`, `declaring_decision`,
   `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`), com
   critérios renegociados listados como **não cumpridos**, e
   `pnpm exec devai round close --round R-0031 --repo-root . --input work/rounds/R-0031/closure.json --as-role architect --write --format human`;
   depois `pnpm exec devai round seal --round R-0031 --repo-root . --as-role architect --write --format human`.
7. Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da rodada, com os modelos
   confirmados), `work/rounds/README.md`, `docs/meta/knowledge-base/backlog.md` e o estado da
   ADR-0034 no índice de ADRs, se R-0018 tiver fixado esse campo; commit final; apague o branch
   remoto após o merge.

**Condições de parada** (grave `checkpoint` em `plan.md` §Retomada: tarefas concluídas, em curso,
pendentes; último veredito; próximos passos): orçamento da janela esgotado (80 %); bloqueio por
decisão `OD-*` não coberta pelo steering §H nem pelos padrões do `plan.md`; todos os grupos livres concluídos e os restantes presos a upstream não mesclado;
reviewer `FAIL` após escalada. Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

Papel declarado; frente e rodada; PRs (número, estado); tarefas (id, papel, modelo, resultado);
ciclos de REVIEW e escaladas; gates executados com saída resumida (contratos, integração por
módulo, app, `docs:availability:check`, `docs:user:check`); evidência (sequência, âncora e
head da cadeia); OD tocadas e onde foram registradas; telas que ficaram em "bloqueado por decisão"
e por qual DT/OD; o que ficou fora e por quê; consumo estimado (`budget.json`); ajustes que
recomenda ao método (`orchestra/README.md`, `model-ladder.md`) e à convenção de manuais.
