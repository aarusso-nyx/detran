Tarefa: TASK-0010 (iteração 8)

Papel: Inspector (Art. 6).

Alterado somente o `toMatchObject` de C-0002-77 em [portal-routes.e2e.spec.ts](/Volumes/Thiamat%20II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/backend/app/tests/e2e/portal-routes.e2e.spec.ts:596): A20 aplicada com `status: null`, `validUntil: null`, `categories: []`, `restrictions: []` e o comentário exigido. `categories` é vazio pois o mapeador lê exclusivamente `categoriaAtual`, linhas 160–167 de [documents.controller.ts](/Volumes/Thiamat%20II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/backend/domains/portal/projections/src/handwritten/documents.controller.ts:160).

Validação:

- E2E: `Tests 1 failed | 9 passed (10)`. C-0002-77 passou; o único vermelho é externo ao bloco autorizado, linha 627, expectativa de veículos (`items` esperado versus `[]` recebido).
- Typecheck: 0 erros.
- Prettier: OK.

