# TASK-0033 — correção manual estrita DDL05

Papel Art. 6: **Architect**, modelo `gpt-6-astra/medium`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`; branch
`orchestra/rait-backend`. Declare o papel. Exige prompt-review PASS, contrato
TASK0031 e sensor TASK0032 congelado com RED contratual genuíno. Um escritor
global, lock `MOD-role-catalog-ddl`, limite 1/1. Architect é dono do DDL
manual `0x`; Engineer-backend não recebe permissão SQL por esta tarefa.

## Leitura fechada e precedência

Leia integralmente: `AGENTS.md`, `CODESTYLE.md`,
`.devai/pin/constitution.md`, `docs/meta/agents/architect-blueprint.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/reports/TASK-0029-V3-DDL05-REFERENCE-GAP.md`,
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-CYCLE.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD-V3-DDL05-IDEMPOTENCE.md`,
`backend/database/ddl/05-role-catalog.sql`,
`backend/database/ddl/14-inf-lifecycle-vocabulary.sql`,
`backend/database/apply.sh`, `backend/domains/shared/src/roles.ts`,
`tools/check-role-catalog.ts`,
`backend/database/tests/ddl05-role-catalog.test.mjs`,
`backend/database/tests/ddl05-role-catalog.integration.test.mjs`,
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`.
Somente a decisão OWNER DDL05 e o contrato TASK0031 prevalecem sobre
descrições históricas de replay; DDL14 e sensor0028 são imutáveis.

## Única escrita permitida

- `backend/database/ddl/05-role-catalog.sql`

Acrescente à cláusula `ON CONFLICT ... DO UPDATE` uma guarda null-safe que
compara os sete atributos canônicos existentes com os correspondentes
`EXCLUDED`. `updated_at=clock_timestamp()` ocorre somente se algum difere.
Não tocar lista de 36 roles, valor canônico, `created_at`, constraint, FK,
GRANT, DDL14, checker ou outro arquivo. Não usar snapshot/restore de dados,
não pular DDL05 e não ajustar sensor para verde. Se PostgreSQL não aceitar
a expressão escolhida ou a guarda não representar exatamente os sete
campos, STOP antes de alegar GREEN.

Aceite desta fase: `node --test backend/database/tests/ddl05-role-catalog.test.mjs`
→ coleta positiva e GREEN; `pnpm verify:role-catalog` → PASS;
`pnpm exec prettier --ignore-path /dev/null --check` do sensor/contrato e
`git diff --check -- backend/database/ddl/05-role-catalog.sql` → PASS; sete
SETs e chave preservados. O sensor DB integração é apenas leitura/sintaxe:
**não executar** antes da revisão independente dos bytes SQL e autorização
do ensaio. Não executar `apply.sh`, seed, DB, commit/push/PR/merge. Entrega:
SHA antigo/novo do DDL05, hash sensores inalterados, comandos/resultados,
limites e candidato para delivery-review. Maestro registra evidência.
