# Iteracao corretiva de entrega — TASK-0007 (`engineer-backend`)

> Worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`, R-0017.
> O runner grava `work/rounds/R-0017/reports/TASK-0007-delivery-fix.md`.
> Nao execute git, nao instale pacotes, nao rode `stack:db-reset`.

Papel constitucional: **Engineer** (Art. 7 e autoridade por caminho do
Art. 6). Declare `Papel: Engineer` primeiro. Leia `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/contracts/CTG-0002.md` (C-02-02, C-02-04...06 e A6),
`work/rounds/R-0017/plan.md` Adenda A7 (autoridade da identidade local),
`work/rounds/R-0017/reviews/delivery-review-CTG-0002.json`,
`work/rounds/R-0017/reports/TASK-0007-retry-1.md`,
`work/rounds/R-0017/reports/TASK-0007-maestro-adenda.md`,
`work/rounds/R-0017/prompts/TASK-0011.md` e o relatorio TASK-0011 se ja
existir. Leia os testes do Inspector para entender os sensores, sem
edita-los. Consulte os controllers/DTOs e a implementacao de
`packages/sefaz-adapter` apenas como referencia. Para a identidade,
consulte `backend/database/ddl/02-auth.sql`,
`backend/database/seed/00-fixtures-core.sql` (linhas de membership) e
`backend/app/src/detran-runtime.ts` (DetranLocalTokenVerifier),
`backend/app/src/app.module.ts` (tenancy interceptor) e o modulo
`@stynx-nyx/*` de membership/tenancy em `node_modules`, somente leitura.

Pode alterar **somente** `tools/detran-stack.sh`, `tools/stack/smoke.mjs`,
`tools/stack/portal-fixture.sh`, `tools/stack/sefaz-adapter-smoke.mjs` e
`tools/stack/mocks/sefaz-mock.mjs` (entrypoint, lifecycle e erros).
Se `tools/stack/ch-fixture.sh` precisar mudar por dependencia do ator
default, reporte `BLOCKED` com arquivo/linha; nao contorne na CLI.
Nao altere testes, seed, DDL, backend, frontend, packages, `package.json`,
contratos, planos, docs, CI, record, law, `.devai` ou rounds anteriores.
O Inspector e dono exclusivo dos sensores. Nao afrouxe asserts para obter
verde.

## Objetivo

Assuma e ratifique, sob este PC, as mudancas de producao que o maestro
fez apos TASK-0007 retry 1: linha `portal.complaint` local,
`fixture-portal`, ordem de build, `pg_isready -h 127.0.0.1`, `env -i`
do mock SEFAZ, headers reais de tenant/idempotencia, filtro Dashboard N1
por app e ator por fase na CLI de smoke. Corrija o que for
necessario; registre explicitamente no relatorio quais mudancas foram
ratificadas, corrigidas ou revertidas. A denuncia Portal e **sintetica e
exclusiva da stack local** (OD-R17-004); nenhuma fixture dos perfis
canonicos muda.

1. `restartFor` deve **remover** do env filho todos os `DETRAN_LOCAL_*`
   herdados da shell-pai, exceto `DETRAN_LOCAL_ROLES` da fase e
   `DETRAN_LOCAL_ACTOR_ID` apenas para PAdES. Em particular, remova
   `DETRAN_LOCAL_ACTOR_ID` nas
   quatro fases frontend e na restauracao final, ainda que a shell-pai o
   tenha definido. Assim o runtime usa o ator default
   `00000000-0000-4000-8000-000000000002`. O ator especial da fixture
   CH so pode ser passado para a sonda PAdES que o declara. A fixture
   Portal local deve prover `auth.users` e **uma** `auth.memberships` ativa
   para o ator default no tenant `...a001`, com IDs deterministicos e
   e-mail globalmente unico `.invalid`. A linha `auth.users` deve usar
   `ON CONFLICT (id) DO UPDATE SET is_active=true`; membership deve usar
   `ON CONFLICT (tenant_id,user_id) DO UPDATE SET is_active=true`, como a
   base fresh, de modo que reaplicacao reative ambas.
   Nao insira membership roles, grupos ou permissoes; o token local ja
   fornece os roles. Cite no relatorio arquivo/linha do runtime/STYNX
   que prova que membership ativa sem membership_roles basta; se nao
   puder demonstrar, reporte `BLOCKED`, sem inserir roles. Informe ao
   maestro a lacuna de sensor Inspector para users/membership. Nao
   altere policy/RLS nem crie bypass. Aplique apos
   a guarda DB_NAME e antes do primeiro backend-restart, de modo que as
   quatro leituras frontend e as sondas CH sem ator explicito usem a
   identidade default. Cite A7 no relatorio. Tanto sucesso quanto falha
   restauram explicitamente os cinco roles default em
   `DETRAN_LOCAL_ROLES`, removendo ACTOR_ID e outros overrides herdados,
   para recuperar o ator default.
2. O comando literal `node tools/stack/sefaz-adapter-smoke.mjs` deve rodar
   com exit 0 (o import TS exige registro do loader `tsx` pelo proprio
   script ou alternativa que preserve esse comando). Exercite seis
   operacoes positivas com asserts de DTOs e eco de `requestId`, inclusive
   `requestId` deterministico gerado para GET sem body, identificado como
   dado de teste sem segredo. Para referencia desconhecida e body invalido,
   confira envelope `{requestId,error:{category,code,message,retryable,
providerStatus}}`, categorias `NOT_FOUND`/`BUSINESS_ERROR` e
   `retryable=false`, `providerStatus=404` para NOT_FOUND e
   `providerStatus=400` para BUSINESS_ERROR. Unknown reference, refund e
   body JSON semanticamente invalido devem atravessar o adapter e
   resultar em instancia `SefazAdapterError` normalizada (body invalido:
   BUSINESS_ERROR, retryable=false, providerStatus 400). Para o metodo
   405/Allow, use `fetch` cru, pois o verbo do adapter e fixo; confira
   status 405, header `Allow` e envelope completo com `retryable=false` e
   `providerStatus=405`. Um segundo `fetch` cru pode testar JSON
   sintaticamente malformado, com envelope BUSINESS_ERROR/400. Confira
   listener somente IPv4 loopback. Imprima os marcadores literais
   `lookupDebt`, `issueGuide`, `getPaymentStatus`,
   `submitRectification`, `submitRefundRequest`, `getRefundStatus`,
   `NOT_FOUND`, `invalid_body`, `method_405` e
   `SEFAZ adapter smoke passed` so **apos** seus asserts passarem. O sensor
   Inspector atual nao prova o erro de body via adapter: relate essa
   lacuna ao maestro, sem editar testes. Um
   import dinamico de `src/index.ts` apos `register()` de `tsx/esm/api`
   permite preservar o comando literal. Mock sempre fechado em `finally`.
3. Preserve o ciclo de vida deterministico de SEFAZ mock na stack: start,
   status, stop, cleanup apos timeout e nenhum processo sobrando. O mock
   nao pode depender do working directory nem do ambiente com secrets.
   O `cd "$ROOT_DIR"` atual no subshell ja fixa o cwd; preserve o argv
   relativo literal `tools/stack/mocks/sefaz-mock.mjs` exigido pelo stub
   Inspector. A robustez de entrypoint e interna ao mock, sem mudar a
   invocacao.
   Corrija problemas reais encontrados pelos sensores novos do Inspector.
4. Mantenha preflight sem fixture com backend parado; guardas de DB_NAME
   antes de SQL; smoke por proxies reais, IDs e tenant concretos, tres
   503 CH apos adapter, evidencias sem segredo; restaure o backend em
   `finally`. Em arrays de Portal/RAIT/TEAT, verifique tenant quando o
   payload o expuser. Registre precondicoes CH observadas via fixture/IDs
   ou inferidas explicitamente pela mensagem exata do adapter, nunca como
   texto literal presumido. Nao deixe o smoke negativo apagar o positivo:
   preserve relatorios por nome/sufixo ou copia explicita e documente
   como ambos serao recolhidos. A condicao PEC deve refletir a existencia
   de `apps/pec/web/angular.json`, nao estado hardcoded.
5. Use uma checagem de entrypoint robusta para caminho com espacos e
   symlinks em `smoke.mjs` e no mock. Preserve o registro de
   `pids/sefaz-mock.pid`; se o stub Inspector travar, reporte a linha do
   teste, sem altera-lo. Em shell macOS, use `tail -n`, e
   `backend-restart` deve aguardar `/readyz` alem de `/healthz`. Se o
   build sempre executado continuar necessario, justifique o efeito de
   ciclo de vida no relatorio; caso contrario restaure o comportamento
   restrito, sem deixar JS desatualizado.

Rode primeiro `pnpm test:stack`, depois
`node tools/stack/sefaz-adapter-smoke.mjs`, `pnpm format:check` e os
sensores offline direcionados. O `docker compose config` de C-01 e
somente leitura e permitido; ele nao inicia stack. Informe resultados
separados de `contract.test.mjs` e `revision.test.mjs`, sem chamar run
parcial de PASS. Se `test:stack` precisar de Docker alem de `compose
config`, pare e reporte teste/linha. Nao inicie a stack persistente nem rode
smoke live; o maestro fara a medicao integrada, `pnpm check` e o
checkpoint (b). Liste no relatorio as correcoes sem sensor Inspector:
`readyz`, `tail -n`, preservacao de relatorios positivo/negativo, estado
PEC, entrypoint, identity/membership e body invalido via adapter. O
maestro encaminhara uma iteracao Inspector antes do delivery-review. Se
algum sensor falhar por problema de teste fora da sua fronteira, cite
teste/linha e resultado sem edita-lo. Nao declare C-02
PASS por uma falha mascarada.

```markdown
Papel: Engineer
PC: <prompt_composition_id de tasks/TASK-0007.json>
Tarefa: TASK-0007 iteracao corretiva de entrega
Arquivos criados/alterados: <lista>
Mudancas ratificadas/corrigidas/revertidas: <lista e justificativa>
Comandos e resultados: <um por linha>
C-02-02/04/05/06: <estado offline; live pendente do maestro>
Processos ao final: <PIDs ou nenhum>
Bloqueios: <nenhum ou descricao>
```
