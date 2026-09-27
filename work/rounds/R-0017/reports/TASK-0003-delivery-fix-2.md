Papel: Engineer

**Tarefa:** corrigida a passagem das cinco variáveis opcionais em `start_backend`. Elas ficam ausentes do ambiente isolado quando o operador não as define; valores definidos são repassados literalmente.

**Arquivos criados/alterados:** [tools/detran-stack.sh](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/detran-stack.sh:402), apenas.

**Comandos executados e saída resumida:**

- `bash -n tools/detran-stack.sh` — exit 0.
- `pnpm test:stack` — 42/42 verdes, sem skip ou todo.
- `pnpm -s stack:config` — exit 0; JSON válido, sem segredos.
- `pnpm format:check` — exit 0.

**Critérios de aceitação:** atendidos.

**Fora do escopo / deixado:** stack real não iniciada; `pnpm check` e `pnpm docs:check` ficam com o maestro.

**OD tocadas ou propostas:** nenhuma.

**Bloqueios:** nenhum.