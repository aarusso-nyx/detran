# TASK-0001 — iteracao 3, remediation do delivery-review

Papel: **Architect**. Trabalhe somente na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/dash-roles`. Nunca execute `git`.

Leia somente `work/rounds/R-0003/contracts/CTG-0001.md`,
`work/rounds/R-0003/reviews/delivery-review-1.json` e
`docs/framework/arch/dashboard-route-contract.md` §2.

Altere somente `work/rounds/R-0003/contracts/CTG-0001.md`. O reviewer constatou que a ficha
inventou uma ampliacao: `integration-operator` nao aparece na lista canonica de `alert:read`.
Remova a derivacao que concede essa leitura, remova o papel da linha/matriz de
`dashboard:alert:read`, corrija a contagem 10 para 9 e torne explicito no criterio negativo que
`integration-operator` nao pode `alert:read`. Nao altere `alert:ack`, `alert:treat`, `annotate`,
`source:read`, camadas, exportacao ou qualquer outro conjunto.

Ao final, relate arquivo tocado e a correcao. Comandos ficam para o maestro.
