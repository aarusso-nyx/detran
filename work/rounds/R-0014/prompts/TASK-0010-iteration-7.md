# TASK-0010 — iteração 7 (restrita, Codex): fronteira nacional nos specs (A19(c))

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca produção,
> nunca `work/rounds/**`. Ninguém responde durante a execução. O Engineer trabalha em paralelo em
> produção/seeds — não toque nada fora dos dois specs abaixo.

Papel: **Inspector** (Art. 6). `pnpm verify:senatran-boundary` (`tools/verify-senatran-boundary.ts`)
proíbe em `backend/**` — specs inclusive — o nome de variável `SENATRAN_MOCK_BASE_URL`; hoje ele
falha em `backend/app/tests/e2e/portal-national-mock.e2e.spec.ts:45` e
`portal-national-unavailable.e2e.spec.ts:35,36,53,55`. Decisão **A19(c)** (`work/rounds/R-0014/plan.md`
§Adendas — leia).

Leitura: `AGENTS.md`; `docs/meta/agents/inspector-tests.md`; `plan.md` A19; `tools/verify-senatran-boundary.ts`;
`packages/senatran-adapter/src/errors.ts` (`SenatranAdapterError(message, category, status, returnCode)`,
exportada por `@detran/senatran-adapter`); `backend/app/tests/e2e/portal-routes.e2e.spec.ts` l. 100–125
(como injetar `PORTAL_NATIONAL_READ_PORTS` em `createPortalApp([{ token, value }])` via `importModule('@detran/portal-projections')`);
`backend/domains/portal/projections/src/handwritten/national-reads.service.ts` (fatias `cdt`/`renach`/`wsdenatranRead` esperadas); os dois specs.

Correções:

1. `portal-national-mock.e2e.spec.ts`: remover a linha que define `process.env.SENATRAN_MOCK_BASE_URL`
   (o ambiente vem do shell/CI — M18); manter `SENATRAN_PROVIDER = 'mock'`.
2. `portal-national-unavailable.e2e.spec.ts`: C-4-54 deixa de manipular a URL; o app isolado é
   criado com `PORTAL_NATIONAL_READ_PORTS` substituído por uma fatia cujas três leituras
   (`getCitizenLicense`, `listCitizenVehicles`, `getPaymentQuote`; `renach`/`wsdenatranRead` idem)
   rejeitam com `new SenatranAdapterError('provider unavailable (C-4-54)', 'PROVIDER', 503, 0)`;
   asserções iguais: 503 `PORTAL.NATIONAL_READ_UNAVAILABLE`, `context.cachedAt` (null), `context.retryAfter`
   presente; comentário citando A19(c) (única porta falsa admitida, só neste arquivo). Nenhuma
   ocorrência de `SENATRAN_` + `BASE_URL` no arquivo.
3. `pnpm verify:senatran-boundary` → OK; `pnpm --filter @detran/app typecheck` → 0; rodar os dois
   arquivos (segundo plano + polling) e registrar `Tests` (o mock file continua com vermelhos de
   §2–§5 até o Engineer terminar); `prettier --check` → OK.

Entrega (última mensagem, formato da TASK-0010, "Tarefa: TASK-0010 (iteração 7)").
