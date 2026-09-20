# TASK-0045 — RED corretivo dos seis comandos de worklist

Papel Art. 6: Inspector. Modelo `gpt-5.6-terra`/high; até duas iterações
próprias, sem reiniciar TASK-0006 (2/2). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Leia integralmente
`docs/meta/agents/inspector-tests.md` antes de agir.

Leitura fechada: `AGENTS.md`, `CODESTYLE.md`, `work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`work/rounds/R-0007/reports/CTG-0002-CORRECTIVE-PLAN.md`,
`docs/framework/arch/rait-test-strategy.md`,
`docs/framework/arch/rait-fixtures.md`,
`backend/domains/inf/rait-worklist/tests/**`,
`backend/domains/shared/src/policy.ts`,
`backend/domains/shared/src/roles.ts`,
`backend/domains/inf/rait-worklist/src/handwritten/**`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`.

Pode criar/editar apenas arquivos novos
`backend/domains/inf/rait-worklist/tests/unit/rait-worklist-corrective.spec.ts`,
`backend/domains/inf/rait-worklist/tests/integration/rait-worklist-corrective.integration.spec.ts`,
`backend/domains/shared/src/policy-ctg2-worklist.spec.ts` e
`backend/app/tests/e2e/rait-worklist-corrective.e2e.spec.ts`.
Proibidos runtime, blueprints, gerados, política de produção, testes
congelados anteriores, plano/tarefas/budget, Git, `record/**`, `.devai/**`
e repositórios irmãos. Um escritor global; DB dedicado só com URLs
explícitas, owner/admin separados do papel de aplicação e autorização
vigente. Não resetar DB sem coordenação do Maestro.

Cubra os seis comandos pendentes das linhas 2, 3, 4, 6, 7, 8 da matriz,
sem esquecer regressão draw/reassign. Para cada comando, pelo menos um
sucesso e negativas materiais de papel/vínculo, tenant, estado, If-Match
quando aplicável, idempotência e ausência de escrita/outbox/auditoria de
sucesso após negação. Inclua cobertura de escala/plantão/WIP e sorteio
reproduzível/`T-CLAIM`; use clock e seed determinísticos. A política deve
testar a chave exata `Resource:Action` por papel canônico, inclusive admin
negado quando sem vínculo. Não confundir `rait-batch-item` com `rait-batch`.
Teste executável, não busca de strings. E2E deve coletar rotas comandadas e
expor RED até TASK-0008 remover colisões CRUD/conectar controllers; não
chamar 404, dupla rota ou zero-test de PASS. Não alterar sensor para obter
GREEN. Reporte hashes exatos dos novos arquivos e contagem por comando.

Valide Prettier e typecheck dos pacotes; execute testes focados com
`--passWithNoTests=false`. RED de runtime ausente é esperado e deve ser
classificado; falha de URL/papel/fixture é BLOCKED, não RED funcional.
