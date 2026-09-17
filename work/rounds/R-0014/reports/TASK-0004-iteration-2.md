Papel: Engineer (Constitution Art. 6) — perfil engineer-frontend
Tarefa: TASK-0004 (iteração 2 — adenda A3)
Arquivos criados/alterados:
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/ngsw-config.json — `dataGroups` (grupo `documentos-offline`, `maxAge` fixo) removido por completo; fica só `assetGroups` (`app` prefetch sem `runtime-config.js`, `assets` lazy).
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/core/service-catalog.facade.ts — constante `SERVICE_NOT_CATALOGUED` e token `servico_nao_catalogado` removidos; `NOT_CATALOGUED` = `{ status: 'unavailable' }` sem `reason`; cabeçalho de comentário ajustado (A3).
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/README.md — duas menções ao `dataGroup` reescritas: `ngsw-config.json` só com `assetGroups`; cache offline de CNH-e/CRLV-e no CTG-0003 (`OfflineDocumentStore`), forma do `dataGroup`, se houver, em OD-P51.
Nenhum spec, stub, `package.json`, `vitest.config.ts`, `tsconfig.json` ou `test-setup.ts` tocado; sem `git`, sem `pnpm install`.

Comandos executados e saída resumida:
- `grep -rn -e servico_nao_catalogado -e SERVICE_NOT_CATALOGUED -e dataGroup apps/portal/web` (sem node_modules/dist) → 0 ocorrências de código/config; a única linha é a frase explicativa do README que aponta OD-P51.
- `grep -c dataGroups apps/portal/web/ngsw-config.json` → 0.
- `pnpm --filter @detran/portal-web typecheck` → exit 0 (app e spec; A1/A2 já aplicadas pelo Inspector).
- `pnpm --filter @detran/portal-web lint` → exit 0, 0 avisos.
- `pnpm --filter @detran/portal-web test` → `Test Files 12 passed (12)`, `Tests 263 passed (263)`.
- `pnpm --filter @detran/portal-web build` → "Application bundle generation complete"; `dist/browser/ngsw.json` gerado com `dataGroups` = 0 entradas; `manifest.webmanifest` presente.
- `pnpm verify:parameter-catalogue` → OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors).
- `node_modules/.bin/prettier --write` nos 3 arquivos tocados; `prettier --check apps/portal/web package.json` → OK.
- `pnpm format:check` → FAIL por um único arquivo fora da minha fronteira: `work/rounds/R-0014/reviews/delivery-review-CTG-0001.md` (do reviewer/maestro; `work/rounds/**` é "Não pode tocar"). Todo o restante do repositório está formatado.
- `ps` → nenhum `vitest`/`ng` residual.

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck && lint && test && build` verdes (263/263) → **PASS**.
- `pnpm format:check` → **FAIL** somente por `work/rounds/R-0014/reviews/delivery-review-CTG-0001.md` (fora da fronteira de escrita; um `prettier --write` nele pelo maestro resolve); minha fronteira (`apps/portal/web`, `package.json`) → PASS.
- `grep -rn servico_nao_catalogado apps/portal/web` → 0 → **PASS**.
- `grep -c dataGroups apps/portal/web/ngsw-config.json` → 0 → **PASS**.

Tabela rota → componente → guardas: inalterada em relação à iteração 1 (38 entradas de `src/app/app.route-manifest.ts` → `PORTAL_ROUTES` via `core/manifest-routes.ts`; mesmas exceções ao placeholder: `''`, `auth/callback`, `vinculo/por-que-nao-vejo`, `servico-indisponivel/:serviceKey`, `**`).

Fora do escopo / deixado:
- A tela `/servico-indisponivel/:serviceKey` já cobria o caso sem motivo (`data-token` só quando o catálogo dá `unavailableReason`; texto `portal.states.service_unavailable`) — nenhuma mudança necessária nela.
- Formatação de `work/rounds/R-0014/reviews/delivery-review-CTG-0001.md` (fora da fronteira).
- Demais itens da iteração 1 permanecem (alias `paths` `@detran/api-clients/generated/*` até a reexportação no índice, `resolveJsonModule: false` em `tsconfig.spec.json` até o Inspector remover o `@ts-expect-error`).

OD tocadas ou propostas: OD-P51 referenciada no README (cache offline / `dataGroup`); nenhuma nova.

Bloqueios: nenhum.
