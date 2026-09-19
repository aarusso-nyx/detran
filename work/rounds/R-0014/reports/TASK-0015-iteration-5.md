## Entrega — Tarefa: TASK-0015 (iteração 5)

**Papel (Art. 6): Inspector.**

### Escopo
Único achado do `delivery-review-CTG-0003b-3.json`: blocos "a11y por estado" de T-03/T-04/T-05 sem o caso `unavailable`. Apenas `*.spec.ts`; sem `git`/`pnpm install`.

### Alterado
- `apps/portal/web/src/app/features/defesa/pages/recurso-jari.page.spec.ts` — novo caso "unavailable" (422 `SERVICE_UNAVAILABLE` no `POST requests`, nos moldes de C-3b-71/T-02): flush da origem + `createReq.flush` com erro; assert `portal.screens.t03.state.unavailable`; `expectA11yStateInvariants(root, catalog)` sem `errorBannerFocused`.
- `apps/portal/web/src/app/features/defesa/pages/recurso-cetran.page.spec.ts` — idem, reaproveitando `mount()` (já flusha a origem); assert `portal.screens.t04.state.unavailable`.
- `apps/portal/web/src/app/features/indicacao/pages/indicacao-condutor.page.spec.ts` — idem, via `mountUnflushed()` + flush do AIT + `createReq.flush` com erro; assert `portal.screens.t05.state.unavailable`.

Em todos os três, `errorBannerFocused` foi omitido (não `true`): confirmei em cada `*.page.ts` que `unavailableReason()` deriva de `lastFailure`/`onFailed` (evento `failed` do wizard), renderizado inline — não passa por `facade.error()`/`portal-error-banner` como nos estados `not_found`/`error`/`offline` dessas mesmas telas.

### Comandos e resultado
1. `pnpm --filter @detran/portal-web typecheck` → **0 erros**
2. `pnpm --filter @detran/portal-web lint` → **0 erros**
3. `pnpm --filter @detran/portal-web test` → **74 arquivos (74) / 972 passed | 7 todo (979) / 0 failed** (era 969 antes; +3 dos novos casos)
4. `pnpm format:check` → **OK** (sem necessidade de `prettier --write`)

### Critérios de aceite
- typecheck/lint: **PASS**
- test: **PASS** — 0 failed, 972 passed, 7 todo
- format:check: **PASS**

### Casos vermelhos por defeito real
Nenhum.
