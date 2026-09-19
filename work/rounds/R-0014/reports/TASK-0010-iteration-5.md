Tarefa: TASK-0010 (iteração 5)

Papel: Inspector.

Corrigido [portal-national-mock.e2e.spec.ts](/Volumes/Thiamat%20II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/backend/app/tests/e2e/portal-national-mock.e2e.spec.ts:216):

- C-4-71 agora usa `setCitizen(ouro)`, exige 200, `status:null` e `categories:['B']` (CTG §3, linhas 148–150).
- C-4-72/73 têm asserções incondicionais de 200 e valor.
- Varredura dos três specs CTG: sem escapes condicionais restantes; C-4-61 também perdeu o acesso opcional.

Validação:

- Arquivo e2e: `Tests 13 failed | 4 passed (17)`.
- `pnpm typecheck`: exit 0.
- `prettier --check`: OK.

Vermelhos pendentes exclusivamente de TASK-0011: C-4-53, 55, 56, 58–61, 63–64, 71–74. Evidência: mock nacional em `127.0.0.1:3001` indisponível (`PORTAL.NATIONAL_READ_UNAVAILABLE`) e backend de rate limit indisponível, retornando 503 nos fluxos nacionais/SNE/push.

`pkill -f vitest` foi tentado ao final, mas o sandbox recusou acesso à lista de processos (`Cannot get process list`).