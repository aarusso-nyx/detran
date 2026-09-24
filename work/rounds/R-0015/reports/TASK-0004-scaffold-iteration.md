# TASK-0004 — iteração restrita do checkpoint de scaffold

Papel: Inspector (Art. 6).

- Alterado somente `apps/boat/mobile/src/lib/navigation/transitions.test.ts`.
- Migração mecânica de `node:test`/`node:assert` para `vitest` (`it`/`expect`).
- Preservadas as sete asserções e a semântica fail-closed; nenhuma produção, configuração,
  documentação ou operação Git foi tocada pelo worker.

## Verificação

- `pnpm --filter @detran/boat-mobile test` — PASS, 1 arquivo e 7/7 testes.
- `pnpm --filter @detran/boat-mobile typecheck` — PASS.

OD tocadas ou propostas: nenhuma.

Bloqueios: nenhum.
