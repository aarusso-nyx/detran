# TASK-0041 — Inspector, reconciliação do sensor C3 de DI

Papel Art. 6: Inspector `gpt-5.6-terra/high`. OWNER autorizou este ciclo
corretivo para desbloquear TASK-0022, sem repetir revisão intermediária.
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Um escritor, uma execução, sem commit/push/PR/merge.

Leia `AGENTS.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/plan.md`,
`backend/domains/inf/rait-case/tests/unit/rait-case-delivery-c3.spec.ts`,
`backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-operation-clock.ts` e
`backend/domains/inf/rait-case/src/rait-case.module.ts`.

Allowlist EXATA de escrita:
`backend/domains/inf/rait-case/tests/unit/rait-case-delivery-c3.spec.ts`.
O sensor C3 de `design:paramtypes` espera quatro dependências, mas o
contrato C4 congelado já exige cinco, com `RaitOperationClock` em quinto.
Confirme a divergência no código e no sensor C4; reconcilie somente essa
expectativa e o import necessário, preservando as demais asserções,
negativas e fixtures. Não afrouxe o sensor, não use `skip`, não altere
produto, gerados, reviews, SQL ou governança. Caso haja outra divergência
substantiva, STOP e reporte.

Execute o spec C3 dirigido (coleta positiva e todos os casos PASS), o spec
C4 de DI dirigido, todos os unit tests do pacote, typecheck do pacote,
Prettier no arquivo e `git diff --check`. Relate comandos, contagens,
hash final e arquivos alterados. Não declare TASK-0022 PASS: o Architect
reexecutará seus gates integrais depois.
