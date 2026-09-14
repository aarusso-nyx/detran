# TASK-0002 — iteracao 3, remediation do delivery-review

Papel: **Inspector**. Trabalhe somente na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/dash-roles`. Nunca execute `git`.

Leia somente `work/rounds/R-0003/contracts/CTG-0001.md`,
`work/rounds/R-0003/reviews/delivery-review-1.json` e
`backend/domains/shared/src/policy.spec.ts` no bloco DASHBOARD.

Altere somente `backend/domains/shared/src/policy.spec.ts`. Remova `integration-operator` do
conjunto esperado de `dashboard:alert:read` e acrescente uma assercao negativa explicita para
esse par no teste de negativos do papel. Nao altere nenhuma outra permissao, teste ou expectativa.
A implementacao ainda deve ficar vermelha ate TASK-0003.

Ao final, relate arquivo tocado e a correcao. Comandos ficam para o maestro.
