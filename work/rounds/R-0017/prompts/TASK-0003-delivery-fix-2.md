# TASK-0003 — preservar defaults no ambiente isolado

> Frente `local-stack`, R-0017, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Esta e a segunda e
> ultima correcao apos `delivery-review`, escalada a Sol 6. O runner grava
> `work/rounds/R-0017/reports/TASK-0003-delivery-fix-2.md`.

## Papel e leitura fechada

Papel constitucional: **Engineer** (Arts. 6/7); declare `Papel: Engineer`
na primeira linha. Leia `AGENTS.md`, `CODESTYLE.md` secoes Shell/Tests/Git,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/contracts/CTG-0001.md` (contrato de ambiente e Adenda 3),
`work/rounds/R-0017/reviews/delivery-review-CTG-0001-2.json` inteiro,
`tools/detran-stack.sh` (somente validacao e `start_backend`),
`tools/stack/revision.test.mjs` (teste de ambiente do backend),
`backend/app/src/detran-runtime.ts` linhas 300-352,
`packages/senatran-adapter/src/config.ts` linhas 65-90,
`work/rounds/R-0017/reports/TASK-0002-delivery-fix-2.md`.

## Fronteira e correcao

Edite **somente** `tools/detran-stack.sh`. No `start_backend`, preserve
`env -i` e a allowlist, mas construa as entradas opcionais condicionalmente.
Sem valor explicito do operador, `DETRAN_LOCAL_ACTOR_ID`,
`DETRAN_LOCAL_CPF`, `DETRAN_LOCAL_ASSURANCE_LEVEL`,
`SENATRAN_MOCK_CPF_USUARIO` e `SENATRAN_MOCK_CLIENT_CERT_CN` devem ficar
**ausentes** do ambiente filho, nao presentes com string vazia. Assim os
defaults `??` no runtime e adapter continuam eficazes. Quando o operador
definir uma dessas variaveis aceitas, repasse seu valor literalmente, sem
expor em log/config; os defaults obrigatorios da stack continuam presentes.
Nao reintroduza heranca do ambiente amplo nem retire validacoes ou cleanup.
Preserve todos os 42 casos anteriores e passe o sensor novo do Inspector.

Nao edite testes, pacote, contrato, plano, prompt, report, gerado,
`senatran-mock/**`, `CLAUDE.md`, `AGENTS.md`, `record/**`, `.devai/**`,
`law/**`, `docs/meta/adr/**` ou rodadas antigas. Nao execute `git` nem
instale dependencias. Nenhuma integracao externa ou credencial real.
Nao rode `db-reset`/`apply.sh --full` fora do banco descartavel da stack;
nao afrouxe politica, RLS ou tenancy.

## Aceitacao

- `bash -n tools/detran-stack.sh`: exit 0.
- `pnpm test:stack`: todos verdes, sem skip/todo.
- `pnpm -s stack:config`: JSON valido sem segredos.
- `pnpm format:check`: exit 0.

O maestro conclui `pnpm check` e `pnpm docs:check` apos esta correcao.
Nao inicie a stack real; se iniciar algum processo, execute `pnpm stack:stop`
ao fim. Entregue o relatorio no formato padrao: `Papel`, `Tarefa`, `Arquivos
criados/alterados`, `Comandos executados e saida resumida`, `Criterios de
aceitacao`, `Fora do escopo / deixado`, `OD tocadas ou propostas`, `Bloqueios`.
