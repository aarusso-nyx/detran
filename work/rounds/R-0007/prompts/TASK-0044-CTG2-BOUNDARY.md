# TASK-0044 — contrato corretivo e propriedade de rotas CTG-0002

Papel Art. 6: Architect. Modelo `gpt-5.6-sol`/medium. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Uma iteração.
Declare o papel e leia integralmente `docs/meta/agents/architect-blueprint.md`.

Leitura fechada: `AGENTS.md`, `CODESTYLE.md`,
`work/rounds/R-0007/plan.md`, `work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-CORRECTIVE-PLAN.md`,
`work/rounds/R-0007/prompts/TASK-0008.md`,
`docs/framework/product/domains/inf/rait/workflows/WF-RAIT-003.md`,
`docs/framework/product/domains/inf/rait/workflows/WF-RAIT-004.md`,
`docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`,
`docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json`,
`tools/blueprints/generate.mjs`, `backend/domains/shared/src/policy.ts`,
os controllers gerados de schedule, batch, vote, minutes, oral argument e
os controllers manuscritos de worklist/session.

Pode alterar somente `work/rounds/R-0007/contracts/CTG-0002.md` e criar
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`. Proibidos
blueprints, gerados, runtime, testes, política, plano, tarefa, budget, Git,
`record/**`, `.devai/**` e repositórios irmãos.

Entregue matriz dos 20 comandos (4 já implementados, 16 faltantes) com rota,
recurso/ação exatos, dono do controller, classe de efeito, estado/guarda,
evento e sensor futuro. Identifique os quatro conflitos POST exatos e todos
os bypasses CRUD `create/update/delete` relevantes, inclusive oral argument.
Especifique operações `api.resources[].operations` que TASK-0008 deverá
retirar por blueprint versionado e como testes HTTP provarão ausência de
rota duplicada/atalho. Não altere o blueprint nesta tarefa nem antecipe
implementação. Não mude decisões H.54/H.57, prioridade legal, tenant ou RLS.

Valide `test -s` dos dois artefatos, Prettier nos dois e
`pnpm contracts:check`. STOP se alguma rota exigir decisão de produto não
existente; registre precisamente. Entrega: papel, arquivos, comandos/resultado,
matriz completa, gaps e status. Nenhum PASS de runtime/CTG é inferido.
