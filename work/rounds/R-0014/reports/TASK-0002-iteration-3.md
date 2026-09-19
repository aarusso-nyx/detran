Papel: Inspector (Art. 6, constituição DEVAI)
Tarefa: TASK-0002, iteração 3

Arquivos criados/alterados:
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/testing/route-manifest.fixture.ts (A4: entrada `ouvidoria/:manifestationId` perde `serviceKey: 'acompanhar_manifestacao'` — mantém só `entitlementGuard('manifestation')`; `PORTAL_SERVICE_KEYS` perde `acompanhar_manifestacao` e `procuracao`, ficando com as 16 chaves canônicas de `backend/database/seed/70-fixtures-portal.sql` ∪ `junta_medica`, igual à lista agora publicada em `route-manifest.md` §Invariantes)

Nenhum outro arquivo tocado. Verifiquei antes de editar que nenhuma contagem fixa "19" existia em `app.route-manifest.spec.ts`/`app.guards-matrix.spec.ts` — ambos iteram sobre `entry.serviceKey`/`entry.entitlement` com `if`, então a matriz cai para 18 rotas com `serviceKey` (e 2 casos a menos na matriz de guardas) automaticamente pela fixture atualizada, sem precisar editar essas specs nem enfraquecer nenhuma asserção. Nenhum `git`, nenhum `pnpm install`.

Comandos executados e saída resumida:
- `grep -n "acompanhar_manifestacao\|procuracao" apps/portal/web/src/app/app.route-manifest.ts` → sem match (exit 1): o Engineer já tinha aplicado A4 em paralelo, então segui direto para os testes (sem precisar esperar os 3 min).
- `node_modules/.bin/prettier --write apps/portal/web/src/testing/route-manifest.fixture.ts` → "(unchanged)".
- `tsc -p tsconfig.app.json --noEmit` → exit 0.
- `tsc -p tsconfig.spec.json --noEmit` → exit 0 (o erro TS2732 relatado na iteração 2, `resolveJsonModule: false` em `tsconfig.spec.json`, já não aparece — a sobrescrita foi corrigida por fora da minha fronteira).
- `pnpm --filter @detran/portal-web test` → `Test Files 12 passed (12)` / **`Tests 261 passed (261)`** (era 263; -2 pelos dois casos de `serviceKey` que a rota `ouvidoria/:manifestationId` deixou de gerar na matriz de guardas). Avisos não-fatais de jsdom (`HTMLCanvasElement.getContext`), inalterados desde a iteração anterior.
- `pnpm format:check` → "All matched files use Prettier code style!".
- `ps aux | grep -iE "vitest"` → vazio, nenhum processo residual.

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck` → **PASS** (app e spec, 0 erros).
- `pnpm --filter @detran/portal-web test` → **PASS** — novo total **261 passed, 0 failed** (informado, era 263).
- `pnpm format:check` → **PASS**.

Fora do escopo / deixado: nenhum.

OD tocadas ou propostas: nenhuma nova; A4 aplicada como especificado (OD-P19 e o restante do catálogo de 15 serviços seguem como já registrados em `route-manifest.md`/`plan.md`).

Bloqueios: nenhum.
