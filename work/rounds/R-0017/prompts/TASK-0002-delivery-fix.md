# TASK-0002 — correcao de sensores do delivery-review CTG-0001

> Frente `local-stack`, R-0017, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. A Adenda 2 do
> Architect autoriza esta correcao apos TASK-0003. Execute somente os testes
> sob `MOD-stack-tests`. O runner grava
> `work/rounds/R-0017/reports/TASK-0002-delivery-fix.md`.

## Papel e leitura fechada

Papel constitucional: **Inspector** (Arts. 6/7); declare `Papel: Inspector`
na primeira linha. Leia somente `AGENTS.md`, `CODESTYLE.md` §Tests,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0017/contracts/CTG-0001.md` inteiro (Adendas 1 e 2),
`work/rounds/R-0017/reviews/delivery-review-CTG-0001.json` inteiro,
`work/rounds/R-0017/plan.md` §Adendas/§Triagem,
`tools/stack/characterization.test.mjs`, `tools/stack/revision.test.mjs`,
`tools/detran-stack.sh`, `tools/stack/senatran-mock.compose.yml`,
`backend/database/apply.sh` ate o `case --full`, `package.json` somente
scripts `stack:*`/`test:stack`, `senatran-mock/docker-compose.yml` somente
servico `app` e portas, `backend/domains/shared/src/roles.ts` somente
catalogos de papeis, `.github/workflows/ci.yml` somente digest PostGIS.

## Fronteira

Pode editar **somente** `tools/stack/characterization.test.mjs` e
`tools/stack/revision.test.mjs`. Nao edite producao, `package.json`, contrato,
plano, prompt, report, gerado, `senatran-mock/**`, `CLAUDE.md`, `AGENTS.md`,
`record/**`, `.devai/**`, `law/**`, `docs/meta/adr/**` ou rodadas antigas.
Nao execute `git` nem instale dependencias. O Engineer nao altera testes.

## Correcao requerida

Preserve todos os casos existentes; adicione assercoes/casos para os achados
altos 7 e 8 e os baixos de teste do review, sem afrouxar nada:

1. Em C-01-03 (`db-reset` com `unsafe_db`), assira sobre `result.calls`
   que nenhum stub `pnpm`/`psql` rodou e que Docker, se chamado, foi no
   maximo `info`. A recusa deve ocorrer antes de DDL/conexao, nao apenas
   exibir a palavra `restricted` em stderr.
2. Teste os **campos aninhados** do esquema fechado de `config`: banco,
   `services.backend`, `services.senatran_mock`, os seis
   `services.frontends`, timeouts e cada provider do contrato. Injete senhas
   e variaveis sensiveis falsas e prove que nao aparecem no JSON. As
   sobreposicoes proibidas `DETRAN_DB_IMAGE`, `DB_HOST`, `DB_PORT`, `DB_USER`
   e `DETRAN_BACKEND_PORT` devem falhar ou ser inequivocamente ignoradas sem
   alcancar backend/container; teste cada uma com stubs. Perfis diferentes
   de `local-sandbox`, `SENATRAN_PROVIDER` diferente de `mock` e
   `SENATRAN_MOCK_BASE_URL` fora de loopback ou com userinfo devem falhar.
3. Teste que `start --no-mock` desliga o mock em estado persistido: apos
   invocacao com stubs e falha controlada, `config` reporta
   `senatran_mock.state=disabled` e `health` nao chama `:3000/health`.
   `stop` limpa o modo. Nao inicie servicos reais.
4. Teste o guard de Compose com stub retornando `version --short` 2.24.3
   e 2.24.4: a versao antiga falha **antes** de `compose ... up`; a minima
   passa pelo guard. Preserve o teste existente de `docker compose config
--format json` real, que e offline e nao usa daemon.
5. Teste `start` com `curl` stub que falha: timeout configurado, erro
   diferente de zero, nome/log do servico culpado e nenhum PID/processo
   local deixado. Para falha do mock, confira no stub Docker que o log
   pedido e do servico Compose `app`, nao `senatran-mock`.
6. Fortaleca C-01-12: cada um dos cinco papeis default pertence ao conjunto
   real `DETRAN_ROLES`, inclusive os catalogos RAIT e DASHBOARD, nao apenas
   a existencia dos spreads no arquivo.

Os casos novos de violacao devem **falhar** na implementacao atual; os
existentes que ja passaram continuam verdes. Para testar processo/ambiente,
use stubs temporarios de Docker/pnpm/psql/curl e estado temporario por teste;
o prefixo de PATH nao pode ser sobrescrito por `env.PATH`. Stub de `pnpm`
pode capturar o ambiente para provar que `*_TOKEN`, `*_SECRET`, `*_KEY`,
`*_CERT`, Cognito e externos clinicos nao passam ao backend. Nao exponha
nenhuma credencial real; use apenas valores falsos. Nunca rode Docker daemon,
Postgres, `db-reset` ou `apply.sh --full` reais.

## Aceitacao

- `node --test tools/stack/characterization.test.mjs`: verde e offline.
- `node --test tools/stack/revision.test.mjs`: vermelhos novos correspondem
  exatamente as violacoes descritas no review; nenhum `skip`/`todo`.
- `pnpm format:check`: exit 0.

Se um caso de comportamento nao puder ser observado sem tocar um servico real,
pare e relate o limite; nao substitua por regex tautologica nem enfraqueca o
criterio. Formate os dois arquivos tocados antes da entrega.

## Entrega

```markdown
Papel: Inspector
Tarefa: TASK-0002 (correcao delivery-review)
Arquivos criados/alterados: <lista>
Comandos executados e saida resumida: <um por linha>
Criterios de aceitacao: <PASS/FAIL por criterio>
Fora do escopo / deixado: <o que e por que>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descricao>
```
