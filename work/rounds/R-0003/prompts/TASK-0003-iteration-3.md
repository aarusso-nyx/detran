# TASK-0003 — iteracao 3, remediation do delivery-review

Papel: **Engineer**. Trabalhe somente na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/dash-roles`. Nunca execute `git`.

Leia somente `work/rounds/R-0003/contracts/CTG-0001.md`,
`work/rounds/R-0003/reviews/delivery-review-1.json` e o bloco DASHBOARD de
`backend/domains/shared/src/policy.ts`.

Altere somente `backend/domains/shared/src/policy.ts`. Remova `integration-operator` apenas da
regra `dashboard:alert:read`. Nao altere `alert:ack`, `alert:treat`, `alert:annotate`,
`source:read`, camadas, exportacao ou qualquer outra regra.

Ao final, relate arquivo tocado e a correcao. Comandos ficam para o maestro.
