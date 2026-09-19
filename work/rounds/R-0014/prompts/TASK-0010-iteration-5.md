# TASK-0010 — iteração 5 (restrita, Codex): C-4-71 com a persona Ouro (A17); C-4-72/73 sem escape

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. `pkill -f vitest` ao final. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). O Engineer (TASK-0011) parou: em
`backend/app/tests/e2e/portal-national-mock.e2e.spec.ts`, C-4-60 (Prata, `situacaoCnh:'A'` →
`status:'valida'`) e C-4-71 (`status:null`) leem a **mesma** rota com a **mesma** persona — contradição
do spec. Decisão **A17** (`work/rounds/R-0014/plan.md` §Adendas; `contracts/CTG-0004.md` §2
[DIVERGE-1] e §8 C-4-71 emendados): a fixture `situacaoCnh:'B'` é da persona **Ouro**
(`CPF.ouro` = `33333333333`), sem veículo.

Leitura: `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `plan.md` A17; `CTG-0004.md` §2
([DIVERGE-1]) e §8 (C-4-60, C-4-71…74); o seu `portal-national-mock.e2e.spec.ts` e
`portal-e2e.support.ts` (`CPF`, `setCitizen`, `subjectIdOf`).

Correções (só `portal-national-mock.e2e.spec.ts` e, se precisar de sujeito/entitlement Ouro,
`portal-journeys.support.ts`):

1. C-4-71: `setCitizen(ouro)` antes do `GET /documents/cnh`; afirma 200 e `license.status === null`
   (e `categories` `['B']` conforme §3 — cite a linha).
2. C-4-72 e C-4-73: remover os `if (r.status === 200)` — asserções incondicionais (200 + valor).
3. Varrer os três specs do CTG por qualquer outro escape condicional (`if (…status…)`,
   `?.`-guardas que engolem asserção, `.catch(() => …)`) e eliminá-lo.
4. Rodar o arquivo (segundo plano + polling) e registrar a linha `Tests`; `typecheck` → 0;
   `prettier --check` → OK. Vermelhos remanescentes: só os pendentes de TASK-0011 (liste).

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 5)").
