# TASK-0020 — Inspector 13/13, observação GREEN

Papel Art. 6: Inspector `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. OWNER autorizou esta última observação sem reset.
Esta tarefa é **read-only**: não editar código, sensores, governança, banco
fora de execução normal de testes, nem criar relatório. Sem commit/push/PR/merge.

Leia `AGENTS.md`, `.devai/pin/constitution.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/prompts/TASK-0021-V3-7-AUDIT.md`,
`backend/app/src/rait-transactional-audit.interceptor.ts`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`backend/app/tests/shared/rait-case-command.fixture.ts` e
`backend/app/src/rait-transactional-audit.interceptor.spec.ts`.

Confirme hashes exatos: E2E
`2ceab4fb6f5fa4468fd6fd8ed3096a9455f7c467c7c57aef72ff7c655fd0a0fa`,
fixture `992c09b78e320b35f7391f7754f39fe739681b87eae557099a23d3bd886af519`,
interceptor `684fc7130425d739218cfec40f6043f618e81c9b2830cceb82cc05e69a3bd028`.
Leia o checkpoint 11 para os outros sensores congelados.

Execute independentemente teste unitário do interceptor, app typecheck e
suíte RAIT E2E integral (`98` casos esperados) no banco dedicado descartável
`detran_r7_ctg1_a2`, owner
`postgresql://aarusso@localhost/detran_r7_ctg1_a2`, app/DATABASE URL com
papel efetivo `role_app_backend` não-superuser/sem BYPASSRLS e
`DETRAN_TEST_TIER=e2e`. Confirme que o protocolo grava apenas uma auditoria,
que não há RED mascarado por 0 coleta e que os hashes de produto/sensores
permanecem iguais. Se GREEN, reporte `TASK-0020 13/13 observado GREEN` e
elegibilidade da TASK-0022; se não, reporte BLOCKED com comando/falha.
Nenhum review intermediário deve ser repetido.
