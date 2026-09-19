Tarefa: TASK-0010 (iteração 6)

Papel: Inspector (Art. 6).

Alterado somente specs:

- Criado `backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts` com C-4-54 em app isolado; URL inválida definida antes de `createPortalApp()` e restaurada no `afterAll`.
- Removido C-4-54 e a alteração dinâmica de `SENATRAN_MOCK_BASE_URL` de `portal-national-mock.e2e.spec.ts`.

Validação:

- `Tests  10 failed | 7 passed (17)` — `portal-national-unavailable` passou (C-4-54); `portal-national-mock` teve 10 falhas.
- Vermelhos observados: C-4-53, C-4-55, C-4-59, C-4-60, C-4-61, C-4-64, C-4-71, C-4-72, C-4-73, C-4-74.
- C-4-63 passou, diferindo da lista esperada.
- `pnpm --filter @detran/app typecheck` → 0.
- `prettier --check` dos dois arquivos → OK.
- `pkill -f vitest` recusado pelo sandbox: `pkill: Cannot get process list`.