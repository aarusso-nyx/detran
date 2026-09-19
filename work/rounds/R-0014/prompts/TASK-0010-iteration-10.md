# TASK-0010 — iteração 10 (restrita, Codex): contagem de `portal.entitlement` em C-0001-33 (A22)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção/seeds,
> nunca `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Decisão **A22** (`work/rounds/R-0014/plan.md` §Adendas — leia):
TASK-0011 acrescentou a 13.ª linha de `portal.entitlement` em `backend/database/seed/70-fixtures-portal.sql`
(entitlement `vehicle` da Prata com o UUIDv5 do chassi, contrato CTG-0004 §3). O spec de R-0009
`backend/domains/portal/identity/tests/integration/portal-seed.integration.spec.ts` C-0001-33
(l. ≈71) conta `entitlement: 12` e falha com 13.

Correção (só essa linha do spec): `entitlement: 13`, com comentário "A22 (R-0014 CTG-0004 §3):
entitlement vehicle da Prata (UUIDv5 do chassi)". Nada mais.

Validação: `source work/rounds/R-0014/env-detran-r14.sh` já carregado; rode
`pnpm --filter @detran/portal-identity test:integration` (segundo plano + polling) e registre a linha
`Tests`; `prettier --check` no arquivo → OK.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 10)").
