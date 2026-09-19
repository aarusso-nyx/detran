Tarefa: TASK-0010 (iteração 11)

Papel: Inspector (Art. 6).

Implementado somente em specs:

- C-4-56/57/59/61: adesão observável, falha PROVIDER isolada sem persistência/outbox, replay e divergência SNE/push, UUIDv5 canônico.
- C-4-66/67: SSE real para Prata/Ouro, entrega exclusiva e varredura completa de tokens proibidos no `data`.
- C-4-70 removido do spec; os três typechecks são gate do maestro.
- Unitários do inbox agora injetam stub obrigatório de `PORTAL_SNE_PORT`.

Validação:

- Specs tocados: `4 files passed`, `51 tests passed`.
- `pnpm --filter @detran/portal-inbox test:unit`: `1 file passed`, `13 tests passed`.
- Typecheck app, portal-web e repositório: exit 0.
- Prettier: OK.

Suíte e2e completa: `16 files passed`, `238 tests passed`; `2` vermelhos externos em `teat-measures-alcohol.e2e.spec.ts` (C-0004-38 e C-0004-39, ambos recebem 409 onde esperam 201/200). Não dependem da porta SNE obrigatória e não foram alterados.

`pkill -f vitest` foi tentado ao final, mas o sandbox recusou acesso à lista de processos (`sysmond service not found`).