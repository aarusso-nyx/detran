Papel: Architect (adenda A6 e triagem); Engineer (correcoes e verificacao)
Tarefa: TASK-0007, complemento do retry 1

Arquivos criados/alterados:
- `work/rounds/R-0017/plan.md`, `contracts/CTG-0002.md` e registro canonico de OD-R17-004: decisao do Owner e fonte historica nao cumprida.
- `tools/stack/portal-fixture.sh`: denuncia sintetica, deterministica e idempotente, so no banco descartavel da stack.
- `tools/detran-stack.sh`: comando `fixture-portal`, build topologico do backend, espera TCP do PostGIS e ambiente minimo do mock SEFAZ.
- `tools/stack/smoke.mjs`: fixture Portal apos preflight, ator de fixture apenas por fase, headers reais de tenant/idempotencia e filtro Dashboard N1 por app.
- `tools/stack/contract.test.mjs`: guarda negativa da fixture Portal.

Comandos e resultados:
- `pnpm test:stack`: PASS, 49/49 apos A6.
- `pnpm stack:start && pnpm stack:smoke; pnpm stack:stop` na mesma sessao: PASS; smoke completo, 42/42 linhas sem falhas, incluindo Portal 200 com ID `00000000-0000-7000-8000-0000c2050001` via proxy, tres CH 503 no adapter e guarda de banco diferente recusada.
- `pnpm check` e `pnpm docs:check` anteriores a A6: PASS; repetir apos A6 antes de delivery-review/commit.
- `pnpm ci:backend-kernel:local`: corretamente BLOCKED em worktree suja; repetir apos commit/push, conforme contrato.

C-02-04: PASS live, PAdES/biometria/conselho chegaram aos adapters desligados.
C-02-05: PASS live conforme A6; a atribuicao antiga ao seed 70 permanece nao cumprida para o closure.
C-02-06: parcial ate checkpoint formal (b) em worktree limpa.
Bloqueios: nenhum de decisao; faltam gates pos-A6, review, commit e checkpoint formal.
