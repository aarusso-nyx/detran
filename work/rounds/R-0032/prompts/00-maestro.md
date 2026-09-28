# Prompt do maestro — orquestra `portal-pec` (rodada `R-0032`)

> Cole este prompt inteiro numa sessão **nova e sem contexto** da CLI da família `Anthropic — Claude Code com Opus 5.5`
> (Claude Code com Opus 5.5, ou Codex CLI com Sol 6), aberta na worktree `/Volumes/Thiamat II/stech/detran-worktrees/portal-pec`.
> Você é o **maestro** desta orquestra. Tudo o que precisa saber está nos arquivos citados; não há
> contexto anterior a recuperar.
>
> **Pré-condição:** o Owner autorizou `work/campaigns/C-0002-consolidacao.md` e
> `work/rounds/R-0032/plan.md`. Sem essa autorização registrada, pare antes do §1 e reporte.

## OD-C2-005 — fluxo contínuo (prevalece)

Decisão do Owner de 2026-09-27 (`work/campaigns/C-0002-consolidacao.md` §12). Prevalece sobre
qualquer trecho deste prompt que mande abrir PR, rodar CI remoto, gravar evidência, observar
auditoria ou pedir delivery-review por CTG.

- **Branch única** `orchestra/portal-pec`. Faça um commit por tarefa ou por CTG, seguindo
  `CODESTYLE.md` e a autoria por caminho (OD-R20-003). Só você commita, em série.
- **Nada intermediário:** entre CTGs não há PR, CI remoto, merge em `main`,
  `devai evidence record`, `devai audit observe`, `pnpm check` completo nem delivery-review.
- **Mantidos:**
  - os `acceptance_commands` de cada tarefa e a triagem por tarefa (§7);
  - **um** ciclo de prompt-review (§5) no bootstrap, sobre `plan.md` e os prompts de TASK-0001…0014.
- **Ondas.** Siga `plan.md` §Execução OD-C2-005 (O1…O12): até 3 workers simultâneos, com
  fronteiras de escrita disjuntas. O paralelismo real está na O2.
- **Push sem PR** ao fim de cada onda: `git push -u origin orchestra/portal-pec`.
- **Abertura empilhada.** Crie a worktree sobre `origin/orchestra/pec-web` quando o CTG-0001 de
  R-0031 existir nesse branch
  (`git cat-file -e origin/orchestra/pec-web:docs/framework/arch/pec-error-catalog.md`). Integre
  por `git merge --no-edit`:
  - `origin/orchestra/pec-web` antes da O3 (CTG-0002 de R-0031: fixtures `ch`);
  - `origin/orchestra/portal-delegations` antes da O5, se R-0027 não estiver em `main`;
  - `origin/orchestra/user-docs` antes da O7 (CTG-0004 de R-0030) e da O11 (CTG-0001/0003).

  O PR final espera o merge de R-0031, de R-0027 e de R-0030 (e de R-0022/R-0023/R-0024, com STYNX
  1.5.0 final em `main`).

- **Sequência final,** executada uma vez:
  1. `git fetch -q origin && git merge --no-edit origin/main`.
  2. CI local: os comandos de `plan.md` §Execução OD-C2-005 (`pnpm check`, `blueprints:check`,
     `contracts:*`, `verify:*`, `node tools/domain-boundaries/verify.mjs`, testes de pacote,
     `seed.sh` duas vezes, `pnpm backend:test:integration`, `pnpm backend:test:e2e`,
     `pnpm backend:test:ci`, tripla de `@detran/portal-web`, `docs:*`, `format:check`,
     `stack:start` e `stack:smoke`) e `pnpm devai:rc:prepare`, quando aplicável.
  3. Uma delivery-review (§8) do diff inteiro.
  4. Um PR (§9.3).
  5. CI remoto e merge (§9.4–5).
  6. Evidência única `evidence-R-0032.json` com os 5 CTGs, `audit observe` no SHA do merge,
     `round close` e `round seal` (§9.2, §9.5–7).

## 0. Identidade e limites

- Você é o maestro da frente **`portal-pec`**:
  - **ação 8 da campanha C-0002**, fase F;
  - executa a decisão do Owner **OD-PW-001** (2026-09-26: "plano completo do módulo do
    cidadão/PEC disponível no portal");
  - segue `docs/meta/adr/ADR-0034-pec-web-frontend.md` §Decisão 2–6, que é vinculante;
  - o detalhe está em `work/rounds/R-0032/plan.md`.

  O build pack de referência é `docs/framework/arch/portal-build-pack.md`, registro canônico das
  OD-R32. O `pec-build-pack.md`, criado por R-0031, só recebe remissão.

- Declare, na primeira linha da sua primeira resposta, o papel constitucional de cada fase:
  **Architect** ao planejar e revisar, **Engineer** ao commitar código e **Auditor** nunca (o
  reviewer é a outra família). Os workers declaram o papel deles no próprio prompt.
- **Família dos workers: a sua** (`Anthropic — Claude Code com Opus 5.5`), por subagentes nativos
  da sua CLI. A escada é Opus 5.5 grande e médio e Sonnet 5 pequeno, com os nomes e ids vigentes
  em `docs/meta/agents/orchestra/model-ladder.md` após R-0018. Confirme com `claude --help` e anote
  em `plan.md` §Decisões do maestro.
- **Família do reviewer: a outra** (`codex`), modelo **Sol 6** (id confirmado com `codex --help`
  no bootstrap), sempre pela ponte `tools/orchestra/bridge.sh`. Nunca inverta. A alternância com
  R-0031, cujo maestro é Sol 6, segue OD-C2-003.
- **Orçamento desta janela de 5 h:** a frente está prevista para **4 janelas**. Nesta janela: o
  planejamento do maestro, a O1 (TASK-0001, Opus 5.5 alto) e, com o CTG-0001 de R-0031 no
  branch (OD-R32-001 já decidida = (C)), a O2 do `plan.md` §Execução OD-C2-005 (TASK-0002 Sonnet
  5, TASK-0003 e TASK-0008). Cabe 1 ciclo de prompt-review sobre todas as tarefas (até 2 rodadas de
  REVIEW; delivery-review só no fim, OD-C2-005), somando ≈ 700 k tokens de entrada.
  - Ao atingir 80 % (≈ 560 k), grave checkpoint e pare.
  - Contabilize em `work/rounds/R-0032/budget.json`, que é obrigatório: uma linha por tarefa e por
    chamada ao reviewer, com estimativas de tokens de entrada e saída.
  - Se o orçamento esgotar, grave `checkpoint` (§9) e pare, sem dispensa implícita.
- Você é o único que executa `git`. Workers não commitam, não fazem push e não abrem PR.
- **Concorrência** (regra de `waves.md`):
  - **Abertura.** Basta o **CTG-0001 de R-0031** (`pec-web`, contratos PEC) em
    `origin/orchestra/pec-web` (empilhar) ou em `origin/main`; o PR final espera o merge de R-0031. Confira que existem `docs/framework/contracts/BP-CH-JUNTAS-001.commands.openapi.json`
    e `docs/framework/arch/pec-error-catalog.md`. R-0031 pode continuar aberta em paralelo.
  - **Upstreams por grupo** (presença no branch basta para trabalhar; merge em `main` só para o
    PR final, OD-C2-005):
    - CTG-0001 (arquitetura, fichas, ODs): R-0031 CTG-0001 em `main`.
    - CTG-0002 (vínculo, eventos, projeções, porta do dossiê): R-0031 CTG-0002 (fixtures e
      integração `ch`), R-0023 `authz-unification` em `main` (OD-R32-001 = (C), decidida pelo Owner em 2026-09-26).
    - CTG-0003 (comandos cidadãos): R-0027 `portal-delegations` em `main` (OD-R27-001 = (a) ator técnico
      `portal-delegation`; OD-R27-002 = (b): `junta_medica` é entregue nesta rodada).
    - CTG-0004 (telas): R-0022, R-0024 (confira `docs/framework/arch/frontend-wiring-pattern.md`)
      e o CTG-0004 de R-0030 (`orchestra/user-docs`, ajuda contextual no Portal) — empilhe ou
      espere.
    - CTG-0005 (stack, manifesto, manual): R-0017 `local-stack` e os CTG-0001 e CTG-0003 de
      R-0030 em `main`. A TASK-0011 é serializada com o CTG-0006 de R-0031 (`MOD-local-stack`).
  - **Locks partilhados:** `MOD-shared-policy` (serialize com a frente que o detiver),
    `package.json`, `import-manifest.json`, `apps/portal/web`,
    `backend/app/src/portal-delegation.providers.ts`, `backend/database/seed/70-fixtures-portal.sql`,
    `docs/framework/arch/availability/portal-web.availability.json`, `portal-build-pack.md` e
    `waves.md`. Integre `origin/main` por merge antes do PR final.

  No bootstrap, registre em `plan.md` §Concorrência quais upstreams já estão em `main`
  (`git log --oneline -30 origin/main`, `gh pr list --state merged --limit 20`), quais grupos estão
  liberados para merge e quais serão desenvolvidos sobre base empilhada (§1). Grupos livres avançam
  sempre; grupos presos aguardam ou empilham, e nunca bloqueiam a rodada inteira. Confira que o
  número R-0032 continua livre para esta frente (`ls work/rounds`).

## 1. Bootstrap (Engineer)

**Descoberta de estado — antes de criar qualquer coisa.** Outra sessão pode ter começado esta
frente ou uma vizinha; nunca duplique worktree, branch ou rodada.

```bash
git -C "$(git rev-parse --show-toplevel)" fetch -q origin --prune
git worktree list                                   # worktree /Volumes/Thiamat II/stech/detran-worktrees/portal-pec já existe?
git branch -a --list '*orchestra/*'                # branches locais e remotos das frentes
gh pr list --state all --limit 30 --search "orchestra/" # PRs abertos/mesclados por frente
sed -n '/^## Retomada/,/^## Leitura/p' work/rounds/R-0032/plan.md   # checkpoint anterior?
```

Regras:

- **(a)** Worktree e branch existentes: reutilize-os, nunca recrie.
- **(b)** `plan.md` §Retomada preenchido: você está **retomando**. Continue do checkpoint, sem
  replanejar.
- **(c)** Branch `orchestra/portal-pec` remoto sem worktree local:
  `git worktree add "/Volumes/Thiamat II/stech/detran-worktrees/portal-pec" orchestra/portal-pec`.
- **(d)** PR aberto de outra frente com lock comum ao seu grupo (em especial `orchestra/pec-web`,
  `orchestra/portal-delegations`, `orchestra/user-docs`): registre em `plan.md` §Concorrência e
  trate como upstream (base empilhada ou espera).

**Lições obrigatórias das rodadas fechadas** (R-0003…R-0016 e campanha C-0002 §4; detalhe em
`waves.md` §Histórico):

1. Crie `work/rounds/R-0032/AUTHORIZATION.md` no bootstrap, registrando que o Owner autorizou este
   prompt e o `plan.md`. Sem ele, `devai round close` responde `TASK_ROUND_INACTIVE`.
2. Esta rodada não cria pacote de workspace. Se algum surgir por adenda, `pnpm install` é do
   maestro e o `pnpm-lock.yaml` entra no commit.
3. Esta rodada **não** edita `docs/framework/arch/parameter-catalogue.md`: as chaves ficam em
   namespaces `portal.*` já admitidos. Se uma adenda exigir, `pnpm parameters:generate` vem logo
   depois. Specs nunca contêm chaves de parâmetro como literal.
4. Helper `.mjs` importado por spec TS precisa de `.d.mts` irmão.
5. Pacote novo montado no `AppModule` precisa de alias em `backend/app/vitest.config.ts`.
6. Workers não deixam `pnpm check` rodando em segundo plano. Encerre processos perdidos pelo pid
   exato antes dos seus gates, nunca por padrão de nome.
7. `git add record/proofs` explícito em cada commit de evidência.
8. `audit observe` só no HEAD exato integrado. Se outra rodada fechar antes, aceite a cadeia de
   `main`, observe o HEAD integrado e repita `round close` (o id de fechamento muda).
9. `seed.sh` faz parte do CI. Esta rodada altera `70-fixtures-portal.sql` e prova as duas
   execuções.
10. A partir do segundo ciclo, a revisão se restringe aos itens corrigidos. Contradição entre
    contrato e código é resolvida pelo Architect por adenda numerada antes de redespachar.
11. **Relatórios versionados** em `work/rounds/R-0032/reports/` (`git add -f` se o `.gitignore`
    ainda os ignorar). Depois de cada `git add` de grupo, compare `find <dir> -type f` com
    `git ls-files <dir>` antes do push.
12. **Critérios de aceitação não se reescrevem.** Mudança só por adenda numerada em `plan.md`, com
    decisão do Owner. O critério substituído vai ao `closure.json` como **não cumprido**; em
    especial, Lighthouse (B1) nunca é trocado por axe. É proibido repetir as trocas de
    R-0013/R-0014 e o waiver SQL2 de R-0007.
13. **ODs no registro canônico** (`portal-build-pack.md` §4) no mesmo PR que as cita. OD que vive
    só em `contracts/` não conta.
14. **Âncora da prova na cadeia.** Cada `evidence record` é ancorado em `record/proofs/chain.json`
    antes do fechamento. Conflito em `chain.json` nunca se resolve à mão.
15. **DEVAI 1.5.6**; pin da Constituição 1.0.0.
16. **Caracterização antes de troca.** `v1/portal/exams`, a matriz papel × rota e os negativos de
    RLS e tenancy são gerados e versionados antes e depois (TASK-0003). Divergência é FAIL.
17. Nenhuma integração externa real (gov.br, RENACH, PAdES/TSA, laboratório): porta, mock ou falha
    fechada.
18. Nenhum valor normativo inventado (`source_pending` ou OD). Nenhum prazo é calculado no cliente.
19. Papel novo só por OD. Esta rodada **não** cria papel e **não** concede `CANDIDATO` à sessão.
20. `closed_at` é o instante real.

Só então rode o bootstrap:

```bash
export NODE_AUTH_TOKEN="$(gh auth token)"
git -C "$(git rev-parse --show-toplevel)" fetch -q origin
git status --short | wc -l            # deve ser 0
git branch --show-current             # deve ser orchestra/portal-pec
pnpm install --frozen-lockfile
pnpm check                            # linha de base verde; se falhar, pare e reporte
pnpm exec devai doctor --repo-root . --format human
pnpm exec devai round plan --scaffold --round R-0032 --repo-root . --as-role architect --write --format human
test -f docs/framework/arch/pec-error-catalog.md && ls docs/framework/contracts | grep -c 'BP-CH-.*commands'   # contratos de R-0031
```

Se a worktree ou o branch não existirem, crie-os a partir de `origin/main`:
`git worktree add -b orchestra/portal-pec "/Volumes/Thiamat II/stech/detran-worktrees/portal-pec" origin/main`.

**Base empilhada** (só para grupos que precisam de código de um upstream ainda não mesclado):

- Num branch ainda não publicado, `git fetch origin && git rebase origin/orchestra/<upstream>`,
  ou crie a worktree já a partir desse upstream.
- Depois do primeiro push, nunca reescreva o histórico: integre novas revisões do upstream com
  `git merge --no-edit origin/orchestra/<upstream>`.
- Quando o upstream mesclar, integre `origin/main` pela regra do parágrafo seguinte.
- O PR contra `main` só abre depois de o upstream estar em `main`. Um branch empilhado pode ser
  enviado (`git push -u origin orchestra/portal-pec`) sem PR, para que outras frentes empilhem
  sobre ele.

**Avanços do `main` durante a rodada.** No início de cada janela, em cada checkpoint (§7) e antes
do PR final (§9):

- `git fetch -q origin` e `git log --oneline HEAD..origin/main`.
- Se houver commits novos: `git rebase origin/main` somente se o branch nunca foi publicado; caso
  contrário, `git merge --no-edit origin/main`. Nunca use `--force`, `--force-with-lease` ou
  equivalente.
- Depois da integração, rode de novo os gates do grupo.

Ao resolver conflitos:

- **Arquivo gerado** (`backend/domains/**/src/generated`, contratos `*.openapi.json` gerados,
  `packages/api-clients/src/generated`, `ddl/*.sql` de blueprint): nunca edite à mão. Aceite
  qualquer lado e regenere (`pnpm blueprints:generate`, `pnpm contracts:openapi`,
  `pnpm contracts:clients`).
- **`record/proofs/chain.json` ou `record/proofs/work/generic/*.jsonl`:** aceite a versão de `main`
  e rode `devai evidence record` de novo para os seus commits.
- **`policy.ts`/`roles.ts`:** mantenha os dois blocos e rode `pnpm --filter @detran/shared test`.
- **`pnpm-lock.yaml`:** aceite `main` e rode `pnpm install --frozen-lockfile`, ou `pnpm install`
  num commit `chore(deps)` próprio.
- **`portal-delegation.providers.ts` e `70-fixtures-portal.sql`:** preserve as linhas de R-0027 e
  acrescente as suas.

Antes de criar a ADR, confira o próximo número livre em `docs/meta/adr/README.md`. Se a integração
invalidar um veredito `PASS` do reviewer, peça nova `delivery-review`.

## 2. Leitura obrigatória (Architect) — nesta ordem, uma vez

1. `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`.
2. `docs/meta/agents/orchestra/README.md`, `model-ladder.md`, `waves.md`.
3. `work/campaigns/C-0002-consolidacao.md`; `docs/meta/adr/ADR-0034-pec-web-frontend.md`;
   `work/rounds/R-0032/plan.md` inteiro; `work/rounds/R-0031/plan.md` §Metas e §ODs (contratos,
   fixtures e OD-PW-002/004 que você consome).
4. `docs/framework/product/domains/ch/pec/screens/IU-PEC-001.md` inteiro;
   `docs/framework/product/domains/ch/pec/APP.md` (§Atores, §Vocabulário de resultado);
   UC-PEC-004, 010, 011, 012, 013 e 014; RN-PEC-105, 112, 113, 142, 150, 151 e 153;
   `docs/meta/decisions/pec.md`; `docs/meta/knowledge-base/open-issues.md`, linhas DT-021…DT-024.
5. ADRs de identidade e leitura: `ADR-0005-unified-backend-kernel.md`,
   `ADR-0019-citizen-identity-and-request-lifecycle.md`,
   `ADR-0020-read-models-and-projections.md`, `ADR-0024-govbr-federation-via-cognito.md`.
6. Código-âncora:
   - `backend/domains/shared/src/roles.ts`;
   - as linhas `candidate-dossier`, `junta` e `PORTAL_RULES` de `backend/domains/shared/src/policy.ts`;
   - `backend/domains/portal/identity/src/handwritten/{citizen.guard,identity.service}.ts`;
   - `backend/domains/portal/projections/src/handwritten/{exams.controller,exam-view.projection}.ts`;
   - `backend/domains/ch/clinical-reports/src/candidate-dossier.service.ts`;
   - `backend/app/src/portal-delegation.providers.ts`;
   - `apps/portal/web/src/app/app.route-manifest.ts`;
   - `docs/framework/arch/frontend-wiring-pattern.md` (R-0024).
7. `docs/framework/arch/portal-build-pack.md` §4 (OD-P17, OD-P19, OD-P23, OD-R27-*);
   `docs/meta/knowledge-base/steering.md` §H (decisões do Owner já tomadas: não reabra nenhuma).
8. Convenção herdada: `docs/framework/arch/user-docs-convention.md` e
   `work/rounds/R-0030/availability-manifest.schema.md`. Se a convenção não estiver em `main` nem em
   `origin/orchestra/user-docs`, leia só o anexo e adie o CTG-0005.
9. Os manuais de papel que usará:
   `docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`.

Anote em `plan.md` §Leitura o hash (`git rev-parse HEAD`) e a lista do que leu. Não leia além
disso. O que faltar, os workers leem com listas fechadas: as do §Mapa entregável → definições do
`plan.md`, por tarefa.

## 3. Plano de decomposição (Architect) → `work/rounds/R-0032/plan.md` + `tasks/`

A tabela de tarefas do `plan.md` (TASK-0001…TASK-0014, CTG-0001…CTG-0005) é a decomposição
autorizada. Derive `tasks/TASK-nnnn.json` no esquema DEVAI
(`docs/meta/agents/orchestra/task.template.json`), obedecendo:

- **Tríades** Architect → Inspector → Engineer por grupo:
  - vínculo e leituras: TASK-0001 → TASK-0003 → TASK-0004/0005;
  - comandos: TASK-0001 → TASK-0006 → TASK-0007;
  - telas: TASK-0001 → TASK-0009 → TASK-0010.

  Fichas, i18n, manual e manifesto são tarefas de `transcriber-docs`, testadas pelo Inspector ou
  pelos gates de R-0030, nunca pelo próprio transcriber.

- **Identidade decidida antes do código.** O Owner decidiu OD-R32-001 = (C) em
  2026-09-26; as TASK-0003…0005 seguem o desenho (C) sem adenda.
- **Contratos antes das telas** (ADR-0034 §3): nenhuma tarefa de tela é despachada antes de o
  CTG-0003 estar concluído na branch, e nenhuma tela consome rota fora de `route-manifest.md`. O frontend só chama
  `v1/portal/*`.
- **`target_modules`** com os locks da tabela. Duas tarefas com o mesmo lock nunca correm juntas,
  e há no máximo três workers simultâneos.
- **`acceptance_commands`** só com comandos que existem em `package.json` (ou nos `package.json`
  dos pacotes), com `node tools/domain-boundaries/verify.mjs`, ou com o que a própria tríade
  entrega. Cada comando tem o resultado esperado em `plan.md`.
- **Modelo e esforço** conforme a tabela, anotados no `executor`.

Complete no `plan.md` apenas §Decisões do maestro, §Concorrência e §Leitura. Metas, tarefas e
critérios não mudam sem adenda do Owner.

## 4. Prompts dos workers (Architect) → `prompts/TASK-nnnn.md`

Componha cada prompt a partir de `docs/meta/agents/orchestra/worker-prompt.template.md`, na
variante do papel. Preencha **todas** as seções: papel, contexto da frente, leitura obrigatória
fechada (caminhos exatos), o que pode e não pode tocar (diretórios exatos), tarefa (o quê),
critérios de aceitação (comandos + resultado), proibições e entrega (formato fixo). Regras:

- O prompt tem de bastar: o worker não conhece esta conversa nem o resto do repositório.
- Transfira para o prompt os trechos de definição de que o worker precisa:
  - a tabela §C e os requisitos §D e §E de [IU-PEC-001];
  - a §Decisão de identidade e o §Mapa tela → rota → backend do `plan.md`;
  - o vocabulário legal e a separação das trilhas ([RN-PEC-105], `APP.md` §Vocabulário);
  - a regra do titular sem máscara ([RN-PEC-153]);
  - a proibição de escolha de clínica ([RN-PEC-113]);
  - a escada de prazos com termo inicial ([RN-PEC-112]);
  - o nível de assinatura ([RN-PEC-142]);
  - as OD-R32-* e as ODs herdadas, com o padrão vigente.
- Todo prompt de tela e de manual carrega estas frases:
  - "nada de `CONDICIONADO`/`PENDENTE` visível ao cidadão";
  - "o titular vê o próprio dossiê sem máscara; `SUPORTE` continua mascarado";
  - "nenhum seletor de clínica ou perito";
  - "prazo vem do servidor e aparece como 'até quando você pode agir'";
  - "o frontend nunca chama `v1/ch/*`".
- Todo prompt de backend carrega estas frases:
  - "nenhum conteúdo clínico em `portal.*`";
  - "vínculo só por `subjectCpfHash` emitido pelo dono";
  - "nenhum papel novo e nenhum `CANDIDATO` na sessão";
  - "prazos em dias úteis pelo calendário de `@detran/inf-deadlines`, no dono".
- Nada de valor inventado: onde a definição não fixa um valor, o prompt manda usar
  `source_pending` ou abrir `OD-R32-*`.
- Calcule `prompt_composition_id` = `PC-` + 16 hex do sha256 do prompt final e grave em
  `compositions.json` (`{task_id, prompt_path, sha256, pc_id, model, effort}`).

## 5. Revisão dos prompts (reviewer, outra família)

Monte `reviews/prompt-review-<n>.md` com `docs/meta/agents/orchestra/reviewer-prompt.template.md`
em modo `prompt-review`, anexando `plan.md` e os `prompts/*.md` de todas as tarefas (ciclo único, OD-C2-005). Invoque:

```bash
tools/orchestra/bridge.sh codex <id-Sol-6> work/rounds/R-0032/reviews/prompt-review-1.md work/rounds/R-0032/reviews/prompt-review-1.json "/Volumes/Thiamat II/stech/detran-worktrees/portal-pec"
```

Leia o veredito:

- `REVIEW`: corrija os prompts apontados e repita, no máximo 2 ciclos.
- `FAIL` ou terceiro ciclo: pare, registre em `plan.md` §Bloqueios e reporte ao humano.
- Só dispare workers com `PASS`.

Esta frente muda identidade, política, projeções e acesso a dado sensível: o reviewer é sempre de
nível grande.

## 6. Disparo dos workers (mesma família)

Para cada tarefa pronta (dependências concluídas e lock livre), dispare um subagente da sua CLI
com o conteúdo de `prompts/TASK-nnnn.md`, o modelo e o esforço do `executor`, na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/portal-pec`. Se a sua CLI não tiver subagentes,
execute você mesmo a tarefa **como se fosse o worker**, obedecendo estritamente ao prompt daquela
tarefa, fronteira de escrita inclusive. Marque `status=in_progress` na tarefa e, ao receber o
relatório, grave-o em `reports/TASK-nnnn.md`.

## 7. Checkpoint por tarefa (Engineer) — hard gates

Rode os `acceptance_commands` da tarefa, que incluem os checkpoints locais de `plan.md`
§Checkpoints. `pnpm check` completo e os tiers abaixo rodam uma vez, na sequência final
(§OD-C2-005):

- CTG-0002: caracterização antes e depois, `pnpm blueprints:generate` sem edição manual,
  `node tools/domain-boundaries/verify.mjs` e `pnpm backend:test:integration`;
- CTG-0003: `seed.sh` duas vezes, `pnpm backend:test:e2e` e `pnpm contracts:check`;
- fim dos CTGs de backend: `pnpm backend:test:ci`;
- CTG-0004: a tripla do Portal;
- CTG-0005: stack, smoke e `docs:*`.

Falha → triagem em uma linha (`plant-bug | sensor-error | policy-issue | reference-gap`) em
`plan.md` §Triagem → 1 nova tentativa com o achado no prompt → se falhar, nível acima da mesma
família → se falhar, `escalated`. Nunca:

- ajuste um teste para passar;
- edite arquivo gerado;
- afrouxe um estado "bloqueado por decisão" para a tela parecer pronta;
- mascare o dossiê do titular;
- copie conteúdo clínico para `portal.*`.

## 8. Revisão da entrega (reviewer, outra família)

Uma vez, no fim da rodada (OD-C2-005) e depois do CI local, monte
`reviews/delivery-review-R-0032.md` (modo `delivery-review`) com `git diff --stat origin/main...HEAD`,
o diff completo, os relatórios e os critérios, e passe pela ponte para obter o veredito. Anexe também:

- **CTG-0002:** a lista de colunas das views `portal.pec_*` e o esquema dos eventos, para o
  reviewer confirmar que nenhum dado clínico sai do `ch`, e os negativos de máscara, terceiro e
  tenant.
- **CTG-0003:** a persona e o CPF sintético, para o reviewer confirmar que nenhum dado é real.

`PASS` libera o PR. `REVIEW` → correções restritas aos itens apontados, pelo worker responsável
(máximo 2 ciclos). `FAIL` → `escalated`.

## 9. Commit, evidência, PR, merge, fechamento (Engineer; Architect no fechamento)

1. **Commit.** `git add` só dos caminhos das tarefas, mais `reports/`. Commit por `CODESTYLE.md`
   (`<type>(<scope>): …`), com corpo citando UC/RN/WF/ADR/OD, o papel declarado e o trailer de
   atribuição da sessão. Commits por CTG na branch única; um PR no fim (OD-C2-005).
2. **Evidência** — só na publicação final, depois do merge (OD-C2-005). Escreva
   `evidence-R-0032.json` com todos os CTGs (ação, commits, artefatos com sha256, gates) e rode:
   - `pnpm exec devai evidence record --kind generic --round R-0032 --repo-root . --as-role engineer --input <arquivo> --write --format human`;
   - `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human`.

   Confirme que a nova linha de `record/proofs/work/generic/R-0032.jsonl` tem âncora em
   `record/proofs/chain.json`. Commit "chore(devai): …".

3. **PR** único, depois do CI local e do `PASS` da delivery-review final.
   - Confirme que todo upstream da rodada está em `main` e integre: `git rebase origin/main`
     somente se o branch nunca foi publicado; em branch publicado, `git merge --no-edit
origin/main`.
   - Rode novamente os gates, faça somente push normal com `git push -u origin
orchestra/portal-pec` e então `gh pr create --base main`, com o corpo pelo
     `.github/pull_request_template.md` (papel, fontes, o que muda, verificação, OD tocadas, fora
     de escopo, linha final de atribuição), mais a tabela CTG → tarefas → commits e o resultado
     dos gates.
   - No PR, registre OD-R32-001 = (C) (decidida) e peça ao Owner
     decisão sobre OD-R32-002…005; até lá seguem o padrão do `plan.md`.
4. **CI.** Acompanhe com `gh pr checks <n>`. Falha de infraestrutura (pull do Docker, registro) →
   `gh run rerun <id> --failed`; falha de código → volte ao §7 na tarefa certa.
5. **Merge** somente com CI verde **e** `PASS` do reviewer na última entrega:
   `gh pr merge <n> --merge`. Depois: `git fetch`, sha do merge e
   `pnpm exec devai audit observe --repo-root . --at <sha-40> --round R-0032 --as-role auditor --write --format human`.
6. **Fechamento.**
   - `closure.json` no esquema `phase-closure` (`id`, `round_id`, `declaring_decision`,
     `closing_decision`, `batches`, `gates`, `validation_criteria`, `closed_at`, `merged_as`), com
     os critérios renegociados e o Lighthouse (B1) listados como **não cumpridos**.
   - `pnpm exec devai round close --round R-0032 --repo-root . --input work/rounds/R-0032/closure.json --as-role architect --write --format human`.
   - Depois, `pnpm exec devai round seal --round R-0032 --repo-root . --as-role architect --write --format human`.
7. **Documentação final.** Atualize `docs/meta/agents/orchestra/waves.md` §Histórico (linha da
   rodada, com os modelos confirmados), `work/rounds/README.md`,
   `docs/meta/knowledge-base/backlog.md` e o estado da ADR nova no índice de ADRs, se R-0018 tiver
   fixado esse campo. Faça o commit final e apague o branch remoto após o merge.

**Condições de parada.** Grave `checkpoint` em `plan.md` §Retomada (tarefas concluídas, em curso e
pendentes; último veredito; próximos passos) quando:

- o orçamento da janela esgotar (80 %);
- houver bloqueio por decisão `OD-*` não coberta pelo steering §H nem pelos padrões do `plan.md`
  (OD-R32-001 já decidida);
- todos os grupos livres estiverem concluídos e os restantes presos a upstream não mesclado
  (R-0031, R-0027, R-0030, R-0024);
- o reviewer der `FAIL` após escalada.

Um novo maestro retoma pelo mesmo prompt e pelo `plan.md`.

## 10. Relatório final (última mensagem da sessão)

- Papel declarado; frente e rodada.
- PRs (número, estado).
- Tarefas (id, papel, modelo, resultado); ciclos de REVIEW e escaladas.
- Gates executados, com saída resumida: vínculo e projeções, porta do dossiê, negativos de máscara,
  terceiro e tenant, jornadas e2e, Portal, `docs:availability:check`, `docs:user:check`, stack.
- Evidência: sequência, âncora e head da cadeia.
- OD tocadas e onde foram registradas; opção de identidade aplicada e número da ADR.
- Telas que ficaram `parcial` ou `bloqueado_por_decisao`, e por qual DT/OD.
- O que ficou fora e por quê; estado do Lighthouse (B1).
- Consumo estimado (`budget.json`).
- Ajustes que recomenda ao método (`orchestra/README.md`, `model-ladder.md`) e à convenção de
  manuais.
