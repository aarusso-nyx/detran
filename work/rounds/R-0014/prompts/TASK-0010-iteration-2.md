# TASK-0010 — iteração 2 (restrita, Codex): fixtures em teste, um caso por critério, cobertura integral, comandos longos

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`, nunca alterar os specs e2e existentes (só exportações novas em
> `portal-e2e.support.ts`). Nunca deixe processo vivo. Ninguém responde durante a execução.

Papel: **Inspector** (Art. 6). Na iteração 1 (`work/rounds/R-0014/reports/TASK-0010.md`) você
criou `backend/app/tests/e2e/{portal-journeys.support,portal-journeys.e2e.spec,portal-national-mock.e2e.spec,portal-payload-lint.e2e.spec}.ts`
e entregou incompleto: 17 `it` para 74 critérios, C-4-54/66/69 ausentes, e os casos vermelhos por
**falta de setup** (o maestro rodou a suíte: `portal-journeys` 7/11 vermelhos por `404 PORTAL.NOT_FOUND`
no `GET /aits/…` da persona Prata — a linha de `portal.infraction_view` não existe no banco porque o
spec não a insere). O contrato exige vermelhos **só** por comportamento ainda não implementado.

## Leitura obrigatória (lista fechada)

- `AGENTS.md`; `CODESTYLE.md` §Tests; `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0014/contracts/CTG-0004.md` (inteiro); `work/rounds/R-0014/reports/TASK-0010.md` (seu)
- `work/rounds/R-0014/plan.md` §Adendas A13 (M18), A14
- **Padrão de fixtures em teste (copie o mecanismo):** `backend/app/tests/e2e/portal-routes.e2e.spec.ts`
  l. 112–230 (`beforeAll`: `seedLocalTenant`, `seedLocalParameters`, `resetLocalPortalRows`,
  `subjectIdOf`, `asOwner` + `insert into portal.infraction_view/inbox_item/manifestation/…` com
  os ids de `LOCAL`/`AITS` e `cpfHash(CPF.prata)`); `portal-e2e.support.ts` (inteiro — helpers e
  constantes: `AITS`, `CPF`, `LOCAL`, `EXTERNAL`, `SNE_EFFECTS`, `resetGoldenSubjectRows`,
  `auditRows`); `portal-stream.e2e.spec.ts` (padrão SSE: como o teste consome `GET /stream` e
  provoca eventos pelo outbox); `portal-requests.e2e.spec.ts` (drafts, `If-Match`, `submit`)
- `backend/app/src/portal-national-read.providers.ts` (portas reais — **não** substitua o token
  `PORTAL_NATIONAL_READ_PORTS` nos specs deste CTG, exceto no caso C-4-54)
- Os seus quatro arquivos (inteiros)

## Correções

1. **Setup canônico** em `portal-journeys.support.ts`: `seedJourneyFixtures(client, subjects)` que
   insere (com `asOwner`) as linhas que o contrato §1 cita — `portal.infraction_view` dos AITs
   Prata (`…0f0000002/03/05/10`) e Bronze (`…0f0000001`), pedido `…070400009` com decisão, inbox
   SNE `…070c00001`, adesão `…070e00001`, `crash_view`/`exam_view` e entitlements
   (`portal.entitlement`) das personas — mesmos ids/colunas do padrão de `portal-routes.e2e.spec.ts`
   (copie a forma, nunca invente coluna); `beforeAll` de cada spec: `seedLocalTenant` →
   `seedLocalParameters` → `resetLocalPortalRows` → `createPortalApp()` (portas reais) →
   `subjectIdOf` → `seedJourneyFixtures`; `afterAll`: `resetLocalPortalRows` + `app.close()` +
   `client.end()`.
2. **Um `it` por critério** (`C-4-nn — dado … quando … então …`), nas três suítes, cobrindo
   **os 74** (C-4-01…74) — inclusive os que faltam: C-4-54 (app isolado criado com
   `SENATRAN_MOCK_BASE_URL` inválida, ex. `http://127.0.0.1:1` → 503 `PORTAL.NATIONAL_READ_UNAVAILABLE`
   com `context.cachedAt`/`retryAfter`; sem `skip`), C-4-66 (SSE só do sujeito após evento no
   outbox — padrão de `portal-stream.e2e.spec.ts`), C-4-69 (um `it` por parada: M15 ×3 serviços,
   OD-P15, OD-P17 ×3 escopos, OD-P19). Sequências compartilhadas ficam em helpers; asserções por
   critério ficam no `it` do critério.
3. **Lint de payload (C-4-68)**: `it.each` por token proibido do contrato §6 (nome do token no
   título) sobre a serialização de **todas** as rotas listadas, com as personas; exceções só as do §6.
4. **Vermelhos**: após a correção, cada vermelho remanescente é classificado no relatório com
   "critério → comportamento pendente de TASK-0011 (§ do contrato)"; qualquer vermelho por setup/
   tipo/fixture é seu e deve ser eliminado.
5. **Comandos longos (limite do executor ≈ 30 s por comando):** rode a suíte em segundo plano e
   colha o resultado por polling —
   `pnpm --filter @detran/app test:e2e > /tmp/e2e-task-0010.log 2>&1 &` e depois, em comandos
   separados, `sleep 25; tail -5 /tmp/e2e-task-0010.log` até aparecer a linha `Tests`; para os seus
   arquivos: `pnpm --filter @detran/app exec vitest run tests/e2e/portal-journeys.e2e.spec.ts`
   etc. (DETRAN_TEST_TIER=e2e no ambiente). Nunca deixe o vitest vivo ao terminar (`pkill -f vitest`
   ao final). Registre as linhas literais `Test Files`/`Tests`.

Ambiente já carregado no shell que o executa (`env-detran-r14.sh`, mock em `:3001` — confira
`curl -fsS $SENATRAN_MOCK_BASE_URL/health`). O banco está semeado; os specs anteriores (R-0009)
continuam verdes — `teat-measures-alcohol` pode dar 409 em segunda execução no mesmo banco
(estado residual; não é seu; registre se ocorrer).

## Critérios de aceitação

- `pnpm --filter @detran/app typecheck` → 0 erros.
- Suíte e2e: os 12 arquivos anteriores verdes (exceto o 409 residual acima, se ocorrer); os seus três
  arquivos com **74 `it`** no total (+ helpers), vermelhos só por comportamento de TASK-0011.
- `node_modules/.bin/prettier --check` nos arquivos tocados → OK.
- Relatório: matriz "C-4-nn → arquivo → nome do `it`" com as 74 linhas; nenhum `it.skip`.

## Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 2)")
