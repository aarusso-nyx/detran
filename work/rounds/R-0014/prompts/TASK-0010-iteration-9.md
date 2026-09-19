# TASK-0010 — iteração 9 (restrita, Codex): bloco de veículos de C-0002-77 (A20, complemento)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Na iteração 8 você substituiu o bloco `license` de C-0002-77
(`backend/app/tests/e2e/portal-routes.e2e.spec.ts`); o mesmo caso ainda falha na l. 627
(`items` esperado `[{ plate:'FIX2EE1', renavam:'00000000001' }]`, recebido `[]`). **A20 complemento**
(`work/rounds/R-0014/plan.md` §Adendas — leia): a porta falsa não fornece `chassi`; pelo mapeador
§3 (`vehicleId` = UUIDv5 do chassi; item sem chassi não é projetado) o resultado canônico é
`items: []`.

Leitura: `plan.md` A20; `contracts/CTG-0004.md` §3 (linhas de `Vehicle`); `documents.controller.ts`
(`normalizeVehicles`, só leitura); `portal-routes.e2e.spec.ts` l. 60–80 e l. 618–640.

Correção (só o bloco `vehicles` de C-0002-77): `expect(vehicles.body).toMatchObject({ items: [] })`,
`cachedAt` string mantido, e acrescentar `expect(JSON.stringify(vehicles.body)).not.toContain('renavam')`
(RENAVAM nunca sai do backend — A14(d)); comentário "A20: item sem chassi não é projetado (CTG-0004 §3)".
Nada mais muda.

Validação: rodar `portal-routes.e2e.spec.ts` (segundo plano + polling) → `Tests 10 passed (10)`
esperado; `typecheck` → 0; `prettier --check` → OK.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 9)").
