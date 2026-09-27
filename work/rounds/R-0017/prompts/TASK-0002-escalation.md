# Escalada Inspector — TASK-0002 (`inspector-tests`)

> Frente `local-stack`, rodada `R-0017`, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Duas tentativas Luna
> deixaram sensores incorretos; esta escalada usa Terra na mesma familia,
> conforme `prompts/00-maestro.md` §7. Nao inicie Docker daemon, Postgres,
> stack, frontend, backend nem integracao externa. O runner grava o relatorio
> em `work/rounds/R-0017/reports/TASK-0002-escalation.md`.

## Papel e fontes fechadas

Papel constitucional: **Inspector** (Arts. 6/7); declare `Papel: Inspector`
na primeira linha da resposta. Leia somente:

- `AGENTS.md`, `CODESTYLE.md` §Tests,
  `docs/meta/agents/inspector-tests.md`.
- `work/rounds/R-0017/plan.md` §Metas, §Criterios, §Triagem, §Adendas e
  §Retomada; `work/rounds/R-0017/contracts/CTG-0001.md` inteiro,
  especialmente Adenda 1 e C-01-01…13.
- `work/rounds/R-0017/prompts/TASK-0002.md` e
  `work/rounds/R-0017/prompts/TASK-0002-retry-1.md`;
  `work/rounds/R-0017/reports/TASK-0002.md` e
  `work/rounds/R-0017/reports/TASK-0002-retry-1.md`.
- `tools/stack/characterization.test.mjs`, `tools/stack/revision.test.mjs`,
  `tools/detran-stack.sh`, `tools/detran-stack.proxy.json`; `package.json`
  somente scripts `stack:*` e `check`.
- `backend/database/apply.sh` ate o `case --full`;
  `senatran-mock/docker-compose.yml`; `.github/workflows/ci.yml` somente
  PostGIS; `backend/domains/shared/src/roles.ts` somente `DETRAN_ROLES`;
  os quatro `apps/{portal,rait,dashboard,teat}/web/angular.json` somente
  `projects` e `serve`; `apps/pec/web/README.md`.

## Fronteira

Pode editar **somente** `tools/stack/characterization.test.mjs` e
`tools/stack/revision.test.mjs`. Nao edite producao, contrato, plano, prompts,
reports, outros testes, artefatos gerados, `senatran-mock/**`, `CLAUDE.md`,
`AGENTS.md`, `record/**`, `.devai/**`, `law/**`, `docs/meta/adr/**`,
`work/rounds/R-0001…R-0016/**` ou `package.json`. Nao execute `git` nem
instale dependencias.

## Diagnostico vinculante

O ultimo retry deixou 13/13 caracterizacao verde, mas estes sensores ainda
sao incorretos e devem ser corrigidos antes do Engineer:

1. `revision.test.mjs` testa autorizacao positiva do **banco antigo**
   `detran_r7_ctg1_a2` com `DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED`. C-01-05
   exige testar o banco **novo** `detran_local_stack` e a flag
   `DETRAN_LOCAL_STACK_FULL_AUTHORIZED=1`, com `psql` stubbed. Preserve tambem
   os negativos dos dois casos antigos, sem escrever o literal do banco
   `detran_r13` em `tools/**`.
2. O contrato fixa `config.services.frontends` como array de seis entradas;
   o teste RAIT usa `config.services.rait`. Teste a entrada `name === 'rait'`
   no array, `project` e o comando completo contendo
   `--build-target rait-web:build:development`. Teste as quatro portas,
   nomes/projetos, backend 3001, mock 3000 e PEC 4204 inativo contra o JSON.
3. O helper `run()` pode receber `env.PATH` que sobrescreve o prefixo dos
   stubs. Mescle stubs e env de modo que **nenhum** teste possa escapar para
   `docker`, `pnpm` ou `psql` reais. Cada comando usa estado temporario isolado
   e so remove o que criou. `docker compose ... config --format json` e a
   unica excecao: e analise offline sem daemon e deve parsear a composicao
   efetiva; nao substitua sua saida pelo JSON esperado. Aceite `published`
   string ou numero convertendo para numero/string antes de comparar.
4. A caracterizacao usa regex estrutural `with_mock=1...--no-mock`, fragil
   apos revisao. Teste a aceitacao de `start --no-mock` por execucao com
   stubs que abortem antes de qualquer efeito real, verificando que **nao**
   houve erro de argumento desconhecido. `start --unexpected-option` deve
   continuar recusado. Nunca ligue runtime real.
5. A revisao cobre health/timeout sobretudo com regex do script, nao com
   comportamento. Use stubs de HTTP/`curl` (ou helper local equivalente) para
   verificar endpoints ativos `/healthz`, `/readyz`, mock `/health` e `/` dos
   quatro frontends, ausencia de SEFAZ em CTG-0001, timeout configurado e
   diagnostico do servico culpado sem rede externa. Um C-01-nn pode combinar
   observacao executavel com inspecao estatica para o que ainda nao existe;
   nao crie assercoes impossiveis de satisfazer pelo contrato.
6. O retry prompt errou dois pontos: usou caminhos curtos que nao existem
   (todos estao sob `work/rounds/R-0017/`) e exigiu ausencia de
   `detran_r13` **antes** da revisao. Essa verificacao so vale **apos**
   TASK-0003; o script verbatim deve ainda conter o literal no checkpoint
   (a). Nao trate esses erros de prompt como bloqueio desta tarefa.

## Aceitacao

- `node --test tools/stack/characterization.test.mjs`: todos PASS sobre os
  bytes verbatim, sem chamadas reais de Docker, pnpm, psql ou rede externa.
- `node --test tools/stack/revision.test.mjs`: falhas esperadas **somente**
  por funcionalidade ainda ausente ate TASK-0003; liste os IDs de C-01-nn
  representados pelos casos vermelhos. Nenhum `skip`/`todo`.
- `pnpm format:check`: exit 0.
- Tests futuros devem poder ficar verdes com implementacao fiel ao
  `CTG-0001.md` e Adenda 1, sem novo ajuste de assercao.

`pnpm format:check` e permitido como gate; stubs de `pnpm` sao obrigatorios
apenas dentro dos testes de comandos da stack. Nao execute `db-reset` nem
`apply.sh --full` contra banco real. Nenhuma
credencial real, integracao externa real ou processo em background. Formate
somente os dois arquivos tocados antes de entregar.

## Entrega

```markdown
Papel: Inspector
Tarefa: TASK-0002 (escalada)
Arquivos criados/alterados: <lista>
Comandos executados e saida resumida: <um por linha>
Criterios de aceitacao: <PASS/FAIL por criterio>
Fora do escopo / deixado: <o que e por que>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descricao>
```
