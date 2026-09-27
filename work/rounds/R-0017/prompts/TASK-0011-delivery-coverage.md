# Iteracao 2 — TASK-0011 (`inspector-tests`)

> Worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`, R-0017.
> O runner grava `work/rounds/R-0017/reports/TASK-0011-delivery-coverage.md`.
> Nao execute git, nao instale pacotes, nao inicie a stack persistente.
> O unico banco permitido e PostGIS descartavel criado para o spec RAIT,
> sem volume nem conexao a banco compartilhado.

Papel constitucional: **Inspector**. Declare `Papel: Inspector` primeiro.
Leia `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0017/contracts/CTG-0002.md`,
`work/rounds/R-0017/reviews/delivery-review-CTG-0002.json`,
`work/rounds/R-0017/reports/TASK-0011.md`,
`work/rounds/R-0017/reports/TASK-0007-delivery-fix.md` (se existente),
`tools/stack/{contract,revision}.test.mjs`,
`tools/stack/{smoke,sefaz-adapter-smoke}.mjs`,
`tools/stack/{portal-fixture,ch-fixture}.sh`, `tools/detran-stack.sh`,
`backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`,
`backend/database/seed.sh` e os dois SQL `*-fresh-local-stack.sql`.
Consulte DDL auth/RAIT e os guards de runtime apenas para construir
assercoes corretas.

Pode alterar **somente** `tools/stack/contract.test.mjs`,
`tools/stack/revision.test.mjs` e
`backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`.
Nao altere producao, fixtures, pacote, contrato, plano, docs, law, record,
`.devai`, CI ou rounds anteriores. Nao enfraqueca asserts.

## Sensores pendentes

1. No sensor filho `tsx` de `contract.test.mjs` (inicio por volta da linha
   129), faca o erro `invalid_body` atravessar `adapter.lookupDebt({})` e
   confira instancia/nome `SefazAdapterError`, `BUSINESS_ERROR`, 400 e
   retryable=false; nao use so `fetch` cru para esse caso. Confira ali
   envelope completo para 400/404/405, `Allow` no 405, requestId gerado
   para GET sem body, listener IPv4 loopback e seis DTOs positivos, em
   porta efemera. O sensor do comando literal permanece com marcadores e
   exit code; ele nao pode inspecionar objetos internos do processo filho.
2. Na fixture Portal, confira SQL de `auth.users` e `auth.memberships`
   para o ator default/tenant a001, usuario ativo, e-mail `.invalid`,
   membership ativa, idempotencia por conflito e **ausencia** de insert
   em roles/grupos. Confirme que a CLI prepara a fixture apos o preflight
   e antes das quatro fases frontend; o negativo DB_NAME chama zero
   `docker` e zero `psql`. O stub CLI deve registrar em sequencia todos
   os subcomandos (`fixture-portal`, `backend-restart`, etc.) e provar
   que a fixture vem antes do primeiro restart frontend. Para o
   preflight, o preload de `fetch` e o stub bash escrevem no mesmo log
   sequencial, provando `/healthz` antes de `fixture-portal`; no negativo
   com preflight falho ha zero chamadas bash.
3. Na CLI e stack, cubra restauracao explicita dos cinco roles e ausencia
   de overrides `DETRAN_LOCAL_*` herdados. Injete no pai
   `DETRAN_LOCAL_ACTOR_ID=poison`, outro caso com ACTOR_ID vazio,
   `DETRAN_LOCAL_TENANT_ID`, `DETRAN_LOCAL_CPF` e
   `DETRAN_LOCAL_ASSURANCE_LEVEL`; o stub registra todas as chaves
   `DETRAN_LOCAL_*`. Somente ROLES deve chegar nos sete restarts
   nao-MEDICO, e ACTOR_ID da fixture apenas em MEDICO. O ator especial
   so aparece em
   PAdES. Acrescente sensores offline para `/readyz` apos restart, `tail -n`
   compativel com macOS, preservacao simultanea dos relatorios positivo e
   negativo, PEC condicional por `apps/pec/web/angular.json` e entrypoint
   robusto em caminho com espacos/symlink. Mantenha `start/stop/status`
   SEFAZ e `sefaz-mock.pid`; troque o loop sem limite do node stub por
   no maximo 50 tentativas de `/bin/sleep 0.1` (nao o `sleep` do PATH
   stub), com erro stderr citando `sefaz-mock.pid`, falha do teste e
   cleanup do PID criado antes do exit, sem listener real. Corrija o sensor
   de restart que chama `trim()` antes de analisar o campo vazio final:
   separe linhas sem remover campos finais. `actorState` deve ser
   **exatamente `absent`** nas seis fases nao-MEDICO e na restauracao;
   variavel presente, mesmo vazia, falha. Apenas MEDICO tem
   `actorState=present` com ator da fixture `...b0000002`.
   Para PEC e entrypoint em caminho com espacos/symlink, use copia de
   `smoke.mjs` numa arvore temporaria; crie `apps/pec/web/angular.json`
   e o symlink somente nessa arvore, e remova tudo no `finally`. Nao
   escreva no slot PEC real da worktree.
4. No spec RAIT, cubra aplicacao `fresh-local-stack` em scratch **separado**
   do perfil `fresh`, segunda aplicacao idempotente, zero FK orfa, IDs
   legados ausentes nas tabelas RAIT relevantes e no texto da fixture.
   Para `legacy-upgrade`, mantenha a prova de recusa sem os 20 casos e a
   comparacao do manifesto. So rode o positivo se existir baseline
   legitimo que satisfaca a guarda de DDL19; nao desative triggers, nao
   use `session_replication_role`, nao insira diretamente em
   `rait_priority_assessment` e nao edite fixtures historicas. Consulte
   `backend/database/tests/fixtures/rait-priority-upgrade/v1.1.0` como
   candidato de leitura, usando-o apenas se seu caminho/autorizacoes
   couberem no scratch `_legacy`. Se nao houver baseline legitimo,
   registre positivo nao medido e C-02-01
   pendente, sem fingir que a recusa equivale a sucesso. Nao rode
   `--full` fora de scratch descartavel. Use nomes distintos e exclusivos
   por perfil (`detran_r17_task0011_fresh`, `..._local`, `..._legacy`),
   nunca `detran_local_stack`. Derive as tres URLs por clonagem de
   `DETRAN_SEED_ADMIN_DATABASE_URL` **explicita** apontando a `/postgres`,
   substituindo somente o pathname pelos nomes literais; valide host,
   user e nome exato em cada URL, sem fallback. Parametrize `runRunner` e
   `commandEnvironment` pelo nome do scratch. Cada `beforeAll` recusa
   banco preexistente e cada `afterAll` remove somente o scratch que
   criou. Pode executar
   `vitest run` direcionado em PostGIS temporario
   `postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5`,
   `--platform linux/amd64`, sem volume, porta loopback livre distinta
   da stack, container `detran-r17-task0011-scratch` com `--rm`, URLs
   explicitas admin `/postgres` e scratch dedicado. Antes do Vitest,
   crie **somente nesse cluster efemero** os roles globais
   `role_app_backend NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS` e
   `role_auditor_min NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS` como
   precondicao ambiental de `apply.sh` sem `--full`; nunca crie roles
   no banco persistente. Confirme com `docker ps -a` e filtro pelo nome
   exato que o container sumiu depois. Se
   nao puder executar, entregue o spec como nao medido e C-02-01
   pendente para o maestro; nunca declare verde com spec nao executado.
   Timeout por emulacao `linux/amd64` e bloqueio ambiental, nao vermelho
   de producao; ajuste timeouts apenas no spec se uma medicao justificar.
   Registre risco residual se `DETRAN_SEED_SCRATCH_DATABASE_URL` deixar
   de ser usado no CI/local.

Rode `pnpm format:check`, `node --check` nos JS alterados e os testes
offline direcionados. `docker compose config` somente leitura e permitido;
se o suite chamar outros comandos Docker, use stubs e reporte o limite.
Rode `pnpm test:stack` somente se puder garantir ausencia de servico
persistente real; do contrario, reporte os testes isolados por arquivo.
Nao mude producao para consertar teste. Diferencie verde real, vermelho
de producao e bloqueio ambiental por sensor/linha.

```markdown
Papel: Inspector
PC: <prompt_composition_id de tasks/TASK-0011.json>
Tarefa: TASK-0011 iteracao 2
Arquivos alterados: <lista>
Sensores novos/corrigidos: <teste, criterio, resultado>
Comandos e resultados: <um por linha>
Vermelhos de producao: <lista ou nenhum>
Bloqueios e risco residual: <lista ou nenhum>
```
