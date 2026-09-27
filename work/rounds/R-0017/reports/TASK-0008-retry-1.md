Papel: Architect (transcrição)  
PC: não disponível nos arquivos autorizados  
Tarefa: TASK-0008 correção restrita  
Arquivos criados/alterados: [docs/dev/operations/local-stack.md](/Users/aarusso/.codex/worktrees/local-stack/detran/docs/dev/operations/local-stack.md)

Comandos e resultados:
- `pnpm exec prettier --check docs/dev/operations/local-stack.md` — PASS.
- `pnpm docs:check` — PASS.
- `pnpm format:check` — PASS.
- Verificação da seção Ciclo seguro — PASS; usa `pnpm stack:logs backend`.

Critérios:
- Prettier — PASS.
- `docs:check` — PASS.
- `format:check` — PASS.
- `stack:logs` sem serviço — PASS; corrigido para `backend`.

Fora do escopo: todos os demais arquivos, stack, banco, código e gates.

Bloqueios: nenhum.