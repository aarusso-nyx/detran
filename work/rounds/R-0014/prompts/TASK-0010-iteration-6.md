# TASK-0010 — iteração 6 (restrita, Codex): C-4-54 em arquivo próprio (A18)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Decisão **A18** (`work/rounds/R-0014/plan.md` §Adendas — leia): em
`backend/app/tests/e2e/portal-national-mock.e2e.spec.ts`, o caso C-4-54 cria um `AppModule`
isolado com `SENATRAN_MOCK_BASE_URL` inválida e o fecha; o `close()` derruba o singleton do rate
limit distribuído (`detranPersistentPipelineStore`, `distributedStrict`) e todos os `POST` seguintes
do arquivo respondem 503 "Distributed rate limit backend unavailable" — C-4-56/58/59/64 caíam por
isso, não por produção.

Correção (só specs): mover C-4-54 para um arquivo novo `backend/app/tests/e2e/portal-national-unavailable.e2e.spec.ts`
com **um único** app (o isolado, `SENATRAN_MOCK_BASE_URL=http://127.0.0.1:1` definido **antes** do
`createPortalApp()` no `beforeAll`, restaurado no `afterAll`), mesmo `beforeAll`/`afterAll` de seed
(`seedLocalTenant`, `seedLocalParameters`, `resetLocalPortalRows`, `subjectIdOf`,
`seedJourneyFixtures`) e mesmas asserções (503 `PORTAL.NATIONAL_READ_UNAVAILABLE`,
`context.cachedAt`, `context.retryAfter`, nunca `skip`). Em `portal-national-mock.e2e.spec.ts`
remova o caso e qualquer manipulação de `process.env.SENATRAN_MOCK_BASE_URL` fora do `beforeAll`.
Nenhuma outra asserção muda.

Rode os dois arquivos (segundo plano + polling) e registre as linhas `Tests`; `typecheck` → 0;
`prettier --check` → OK; `pkill -f vitest` (se o sandbox recusar, registre). Vermelhos remanescentes
esperados em `portal-national-mock`: C-4-53/55/59/60/61/63/64/71/72/73/74 (CDT Prata/Ouro e
idempotência da rota SNE — Engineer) — liste o que observar.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 6)").
