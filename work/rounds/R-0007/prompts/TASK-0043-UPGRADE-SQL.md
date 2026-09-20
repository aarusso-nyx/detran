# TASK-0043 — Architect, paridade de upgrade histórico (ciclo final)

Papel Art. 6: Architect `gpt-5.6-sol/medium`. OWNER autorizou uma única
correção material de SQL e revisão independente dos novos bytes para encerrar
TASK-0022. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`,
branch `orchestra/rait-backend`. Um escritor; sem commit/push/PR/merge.

Leia `AGENTS.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/architect-blueprint.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md` §§ upgrade,
`backend/database/apply.sh`,
`backend/database/ddl/19-rait-priority-pre.sql`,
`backend/database/ddl/19-rait-priority-enforce.sql`,
`backend/database/ddl/19-rait-priority-verify.sql`,
`backend/database/ddl/34-inf-rait-case.sql`,
`backend/database/ddl/35-inf-rait-worklist.sql`,
`backend/database/tests/fixtures/rait-priority-upgrade/v1.1.0/SHA256SUMS`,
os cinco snapshots desse diretório, o harness
`backend/database/tests/prepare-rait-priority-v1-baseline.mjs` e o sensor
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`.

Allowlist EXATA de escrita:

- `backend/database/ddl/19-rait-priority-pre.sql`
- `backend/database/ddl/19-rait-priority-verify.sql`, somente se necessário

Objetivo: upgrade **real** do DDL34/35 histórico, preservando integralmente
linhas/valores legados. Comparar por catálogo os snapshots e DDLs atuais,
enumerar todos os deltas em relações existentes e reconciliá-los de forma
idempotente/fail-closed no `pre`, antes da geração oficial. `CREATE TABLE IF
NOT EXISTS` não reconcilia coluna ou constraint em tabela já existente.
Preservar índices, FKs, ACL/RLS, imutabilidade, transação única, locks e
catálogo canônico. Não converter prioridade antiga, NULL, drafts ou dados
factuais; não relaxar trigger, grants, checks de dados novos nem suprimir
equivalência fresh/upgrade. Se um check novo encontra legado inválido,
identifique-o nominalmente; use somente estratégia de compatibilidade que
preserve os bytes legados e seja provadamente segura para novas escritas,
ou STOP com conflito de produto/OWNER.

**Não executar DB apply/seed/create/drop** nesta autoria; os novos bytes
precisam de revisão independente antes do primeiro apply. Validação estática:
inventário, `pnpm verify:rls-ddl`, checks de sintaxe pertinentes, Prettier e
`git diff --check`. Entrega: matriz objeto histórico→delta→SQL→prova esperada,
hashes de SQL/harness/sensor, limites, comandos/resultados. Não editar testes,
fixtures, gerados, `apply.sh`, seeds, `.devai`, record ou reviews. Não pedir
retry informal: uma entrega congelada para review, ou STOP explícito.
