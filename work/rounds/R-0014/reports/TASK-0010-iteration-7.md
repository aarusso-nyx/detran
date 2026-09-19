Tarefa: TASK-0010 (iteração 7)

Papel: Inspector (Art. 6)

Alterações, limitadas aos dois specs:

- `portal-national-mock.e2e.spec.ts`: removida a definição de URL do mock; `SENATRAN_PROVIDER='mock'` preservado.
- `portal-national-unavailable.e2e.spec.ts`: C-4-54 agora injeta `PORTAL_NATIONAL_READ_PORTS` com as seis leituras rejeitando `SenatranAdapterError(..., 'PROVIDER', 503, 0)`, com comentário A19(c). Confirma `cachedAt: null` e `retryAfter`.

Validações:

- `pnpm verify:senatran-boundary` — OK (2.288 arquivos).
- `pnpm --filter @detran/app typecheck` — OK.
- `prettier --check` nos dois specs — OK.
- Sem ocorrência de variável `SENATRAN_*BASE_URL` no spec C-4-54.

Tests:

- Execução direta dos dois specs, com polling: 9 passed / 8 failed.
- `portal-national-unavailable.e2e.spec.ts`: C-4-54 passou.
- Os 8 vermelhos restantes pertencem ao spec do mock, todos por 503 `PORTAL.NATIONAL_READ_UNAVAILABLE` no ambiente sem mock disponível, conforme esperado até a conclusão do Engineer.

