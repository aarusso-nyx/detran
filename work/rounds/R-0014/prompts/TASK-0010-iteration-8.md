# TASK-0010 — iteração 8 (restrita, Codex): C-0002-77 substituído pela forma normalizada (A20)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Após TASK-0011, a suíte e2e do app está `Tests 1 failed | 240 passed`
— o único vermelho é `backend/app/tests/e2e/portal-routes.e2e.spec.ts` C-0002-77 (l. 596–601), que
afirmava o repasse bruto de `license` da porta falsa. Decisão **A20** (`work/rounds/R-0014/plan.md`
§Adendas — leia): a asserção é **substituída** pela forma normalizada do contrato CTG-0004 §3.

Leitura: `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `plan.md` A20; `contracts/CTG-0004.md`
§3 (tabela de normalização); `backend/domains/portal/projections/src/handwritten/documents.controller.ts`
(o mapeador real — só leitura); `portal-routes.e2e.spec.ts` l. 60–80 (porta falsa) e l. 592–612.

Correção (só `portal-routes.e2e.spec.ts`, só o bloco `toMatchObject` de C-0002-77): afirmar
`license` **exatamente** como o mapeador §3 produz para a entrada da porta falsa
`{ category:'B', status:'fixture' }` (esperado: `status: null`, `validUntil: null`,
`categories: []` ou `['B']` conforme o mapeador ler `categoriaAtual`/`category` — verifique no
código e cite a linha; `restrictions: []`), mantendo `qrVerification`, `documentBytes`,
`category:'C'`, `cachedAt` e todas as demais asserções do caso. Comentário: "A20: forma normalizada
(CTG-0004 §3) substitui o repasse bruto de R-0009". Nada mais muda.

Validação: `DETRAN_TEST_TIER=e2e pnpm --filter @detran/app exec vitest run tests/e2e/portal-routes.e2e.spec.ts`
(segundo plano + polling) → registre `Tests`; `typecheck` → 0; `prettier --check` → OK.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 8)").
