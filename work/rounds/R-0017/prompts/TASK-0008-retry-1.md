# Correcao restrita - TASK-0008 (`transcriber-docs`)

> R-0017 `local-stack`; worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`.
> O runner grava `work/rounds/R-0017/reports/TASK-0008-retry-1.md`.

Papel constitucional: **Architect (transcricao)**, Art. 6. Declare o papel
primeiro. Leia somente `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/transcriber-docs.md`,
`work/rounds/R-0017/prompts/TASK-0008.md`,
`work/rounds/R-0017/reports/TASK-0008.md`,
`docs/dev/operations/local-stack.md`, `package.json` somente scripts
`stack:logs`/`stack:build`, e `tools/detran-stack.sh` somente `usage` e
`logs_stack`. Nao leia outros arquivos.

Pode tocar **somente** `docs/dev/operations/local-stack.md`. Nao altere
`docs/dev/operations/README.md`, `.env.example`, qualquer arquivo de
codigo, CI, teste, contrato, seed, plano, task, prompt, `record/**`,
`.devai/**`, `law/**`, `docs/meta/adr/**`, `AGENTS.md`, `CLAUDE.md` ou rounds
anteriores. Nao execute git, nao instale pacotes, nao suba stack, nao rode
`db-reset`, nao altere policy/RLS/tenancy nem um gate.

O primeiro runbook passou `docs:check` e `format:check`, mas a lista de
comandos da secao Ciclo seguro usa `pnpm stack:logs` sem argumento; o script
exige exatamente um servico e esse exemplo falha. Troque por um exemplo
executavel, como `pnpm stack:logs backend` (pode explicar que segue logs
ate interrupcao). Na nota de `dist` ignorado, mostre explicitamente os
comandos `pnpm --filter @detran/ui build` e
`pnpm --filter @detran/boat-mobile build` antes de repetir
`pnpm stack:start`. Preserve todo o resto do runbook e o escopo da fixture
sintetica local. Nao invente valores.

Aceitacao: `pnpm exec prettier --check docs/dev/operations/local-stack.md`
exit 0; `pnpm docs:check` exit 0; `pnpm format:check` exit 0; a secao Ciclo
seguro nao contem `stack:logs` sem servico. Relate cada comando e resultado.

```markdown
Papel: Architect (transcricao)
PC: <id em tasks/TASK-0008.json>
Tarefa: TASK-0008 correcao restrita
Arquivos criados/alterados: <lista>
Comandos e resultados: <um por linha>
Critérios: <PASS/FAIL por item>
Fora do escopo: <lista>
Bloqueios: <nenhum ou descricao>
```
