Tarefa: TASK-0011 (iteração 5)  
Papel: Engineer (Art. 6)

Alterado: `backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts`

- `PORTAL_SNE_PORT` agora é obrigatório, sem `@Optional()`.
- `enrollCitizen()` é chamado incondicionalmente antes de qualquer leitura/escrita local ou evento de outbox.
- `enrolled !== true` e falhas do adapter preservam os códigos de erro §4 e impedem persistência/publicação.
- Cancelamento permaneceu local (DIVERGE-2/OD-P106).
- Cabeçalho atualizado para A23(a).
- O provider global existente no app já fornece a porta; nenhum arquivo em `backend/app/src` precisou mudar.

Validação:

- `prettier --write` no arquivo tocado: OK
- `pnpm --filter @detran/app typecheck`: OK
- `pnpm --filter @detran/portal-inbox typecheck`: OK
- `pnpm --filter @detran/portal-inbox test:unit`: 2 passed, 11 failed

Tests: as 11 falhas são exclusivamente `src/handwritten/inbox.service.spec.ts`: o harness constrói `PortalSneEnrollmentService` sem `PORTAL_SNE_PORT`. O erro é a ausência do stub obrigatório; registrar para o Inspector injetá-lo. Nenhum spec ou teste foi alterado.