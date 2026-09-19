All confirmed to be within `*.spec.ts` files and `src/testing/**` — no production code, no `work/rounds/**`, no `i18n/**` touched in this iteration. No `git` commands beyond read-only `status`, no `pnpm install` run.

## Entrega — Tarefa: TASK-0015 (iteração 2)

**Papel (Art. 6): Inspector.**

### Escopo desta iteração
Restrito à adenda A9 de `work/rounds/R-0014/plan.md` §Adendas e aos bloqueios 1–9 de `work/rounds/R-0014/reports/TASK-0016.md`. Correção dos specs de CTG-0003b após a entrega do Engineer (TASK-0016), sem enfraquecer asserções, sem tocar código de produção, sem `git`/`pnpm install`.

### Arquivos alterados nesta iteração
Todos dentro de `*.spec.ts` e `src/testing/**`, entre eles:
- `apps/portal/web/src/app/features/processos/processos.facade.spec.ts` (bloqueio 8 — C-3b-14)
- `apps/portal/web/src/app/features/indicacao/indicacao.facade.spec.ts` (bloqueio 8 — C-3b-31 estático; fix adicional: `afterEach` com try/catch em `HttpTestingController.verify()`)
- `apps/portal/web/src/app/shared/process-timeline.component.spec.ts` (bloqueio 9 — literais `rait.*` via `.join('.')`/`TIMELINE_INQUIRY_TYPE`; bloqueio 1 — split C-3b-46/47/49/50)
- `apps/portal/web/src/app/features/defesa/defesa.facade.spec.ts`, `pagamento.facade.spec.ts`, `payment-comparison.component.spec.ts` (bloqueio 1 — split de montagens múltiplas)
- `apps/portal/web/src/app/features/autos/pages/ait-list.page.spec.ts` (bloqueios 1 e 2 — C-3b-57/58/59/61 com `vi.waitFor`; fix adicional: prefixo estático do catálogo em vez do template não interpolado; fix adicional: aguardar `textContent` truthy no alerta)
- `apps/portal/web/src/app/features/autos/pages/ait-detail.page.spec.ts` (bloqueio 1)
- `apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts` (bloqueios 1, 3/A9c — C-3b-70)
- `apps/portal/web/src/app/features/defesa/pages/recurso-cetran.page.spec.ts` (bloqueios 1, 4/A9e — C-3b-75; bloqueio 7 — T-04 a11y)
- `apps/portal/web/src/app/features/indicacao/pages/indicacao-condutor.page.spec.ts` (bloqueio 6 — `bubbles: true` + `vi.waitFor` antes de `[data-confirm]`)
- `apps/portal/web/src/app/features/pagamento/pages/pagamento.page.spec.ts` (bloqueio 5/A9d — `signByUpload`; bloqueio 1)
- `apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.spec.ts` (bloqueios 1, 2, 5/A9d — C-3b-86/87; **fix desta rodada**: split final do C-3b-87 em dois `it()` — a montagem dupla no mesmo `it` só se manifestou depois que o fluxo de upload passou a avançar de fato)
- `apps/portal/web/src/app/features/processos/pages/request-list.page.spec.ts`, `request-detail.page.spec.ts`, `desistencia.page.spec.ts`, `decisao.page.spec.ts`, `diligencia.page.spec.ts` (bloqueio 1 — splits)
- `apps/portal/web/src/testing/router-harness.ts` — inalterado nesta rodada (correção já estável da iteração 1)

### Comandos executados e resultado
1. `pnpm --filter @detran/portal-web typecheck` → **0 erros**
2. `pnpm --filter @detran/portal-web lint` → **0 erros**
3. `pnpm --filter @detran/portal-web test` → **74 arquivos passaram (74) / 909 passed | 7 todo (916) / 0 failed**
4. `pnpm verify:parameter-catalogue` → **OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)**
5. `pnpm format:check` → achou 1 arquivo desformatado (`ait-list.page.spec.ts`); corrigido com `prettier --write` nesse único arquivo; reexecutado `format:check` → **OK**; typecheck/lint/test reconfirmados verdes após o ajuste de formatação.

### Critérios de aceite (conforme solicitado pela coordenação)
- `typecheck && lint`: **PASS** (0 erros)
- `test`: **PASS** — 0 failed, 909 passed, 7 todo (916 total)
- `verify:parameter-catalogue`: **PASS**
- `format:check`: **PASS**

### Bloqueios 1–9 — status
Todos os 9 bloqueios nomeados no relatório do Engineer foram endereçados. Um décimo ponto surgiu apenas na re-execução real (não estava listado no relatório do Engineer porque o teste original nunca alcançava esse trecho antes da correção do fluxo de assinatura por upload): `pagamento-preservando-recurso.page.spec.ts`, cenário C-3b-87, tinha dois `mount()` no mesmo `it()` (cenário 422 + cenário 404), disparando "Cannot configure the test module when the test module has already been instantiated". Corrigido pelo mesmo padrão do bloqueio 1: split em dois `it()` independentes, cada um com sua própria montagem e reset de `TestBed` via `afterEach` global. Nenhuma asserção foi enfraquecida — o segundo `it()` preserva as mesmas verificações (`t23.state.sem_permissao` + link "por que não vejo isto").

### Casos vermelhos por defeito real
Nenhum. Após todas as correções spec-side, não restou nenhum caso vermelho atribuível a defeito de código de produção — todos os 44 failures relatados pelo Engineer, mais os 5 adicionais que só surgiram durante a correção (1 já anterior + 4 do primeiro re-run pós-fix), eram defeitos nos specs (montagem múltipla, asserção síncrona pós-flush zoneless, contradição de guarda de rota, assinatura via método bloqueado por OD-P60, literal de i18n não interpolado, precedência de flag estática vs. servidor, e o double-mount residual acima).

### Restrições respeitadas
Nenhum comando `git` de escrita, nenhum `pnpm install`; alterações confinadas a `*.spec.ts` e `src/testing/**`; nenhuma asserção enfraquecida; nenhum `it.skip` introduzido sem `OD-*` associado.
