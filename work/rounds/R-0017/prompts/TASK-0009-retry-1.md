# Correcao restrita - TASK-0009 (`engineer-backend`)

> R-0017 `local-stack`; worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> O runner grava `work/rounds/R-0017/reports/TASK-0009-retry-1.md`.

Papel constitucional: **Engineer**, Art. 6. Declare `Papel: Engineer`
primeiro. Leia somente `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/prompts/TASK-0009.md`,
`work/rounds/R-0017/reports/TASK-0009.md`,
`.github/workflows/ci.yml` somente o job `stack-smoke`, `package.json`
somente `stack:config` e `tools/detran-stack.sh` somente `config_stack`.

Pode tocar **somente** `.github/workflows/ci.yml` dentro do job
`stack-smoke` criado na tentativa anterior. Nao altere jobs existentes,
gatilhos, protecao de branch, `tools/**`, `backend/**`, `apps/**`,
`packages/**`, `package.json`, `senatran-mock/**`, `.devai/**`,
`record/**`, `law/**`, `docs/**`, `work/rounds/R-0001` ate `R-0016`,
testes ou gerados. Nao execute git, nao instale pacotes, nao rode stack,
`db-reset` ou servicos reais, nao afrouxe policy/RLS/tenancy.

O job adicionou uma verificacao de digest com
`pnpm stack:config | jq -e ...`. Esse comando **falha** (exit 5): o alias
pnpm imprime banner `> detran@... stack:config` em stdout antes do JSON,
logo `jq` acusa `Invalid numeric literal` e gera EPIPE. O maestro mediu
isso com `set -o pipefail`. Corrija o passo usando a CLI direta que emite
somente JSON, por exemplo `bash tools/detran-stack.sh config | jq -e
--arg expected "$expected" '.database.image == $expected'`. Preserve o
digest pinado e a condicao `workflow_dispatch`; nenhuma outra mudanca de
comportamento e autorizada. O codigo de saida dessa prova deve ser 0
com o digest exato e diferente de zero com digest deliberadamente errado.

Aceitacao: rode os dois comandos de prova `bash ... config | jq` com
`set -o pipefail`, positivo e negativo; `pnpm exec prettier --check
.github/workflows/ci.yml` exit 0; `pnpm format:check` exit 0. O maestro
repetira `pnpm check` apos o grupo; se o ja iniciado pelo primeiro worker
terminar verde, reporte-o separadamente. Nao declare o job live PASS sem
workflow_dispatch real.

```markdown
Papel: Engineer
Tarefa: TASK-0009 correcao restrita
Arquivos criados/alterados: <lista>
Comandos e resultados: <um por linha>
Criterios: <PASS/FAIL por item>
Fora do escopo: <lista>
Bloqueios: <nenhum ou descricao>
```
