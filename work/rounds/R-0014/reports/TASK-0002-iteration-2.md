Papel: Inspector (Art. 6, constituição DEVAI)
Tarefa: TASK-0002, iteração 2

Arquivos criados/alterados:
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/core/brand.service.spec.ts (A1: flush do caso "sucesso" passa a ser o corpo do contrato `GET brand` — `displayName`, `shortName`, `legalName`, `primaryColor`, `supportUrl`, `privacyUrl`, `accessibilityUrl`, `serviceContact`, `locale`, `timeZone` —, expectativa de `state()` = `{ status:'available', name, supportUrl, privacyUrl, accessibilityUrl, primaryColor }` conforme `core/brand.service.ts`)
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/testing/entitlement-facade.stub.ts (A2: `check: Mock<EntitlementFacade['check']>`, `vi.fn<EntitlementFacade['check']>(...)`)
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/testing/service-catalog-facade.stub.ts (A2: `availability: Mock<ServiceCatalogFacade['availability']>`, `vi.fn<ServiceCatalogFacade['availability']>(...)`)
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/app.guards-matrix.spec.ts (A2: `const entitlement = entry.entitlement; if (entitlement) {...}` antes dos `it`, usando `entitlement.kind` no closure em vez de `entry.entitlement.kind`)
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/i18n/i18n-keys.spec.ts (removida a diretiva `// @ts-expect-error` sobre o import de `./portal.pt-BR.json`)

Nenhuma asserção mudou fora do exigido pelas adendas A1/A2; nenhum `git`, nenhum `pnpm install`, nenhum arquivo fora desta lista tocado (`tsconfig.spec.json`, `parser.mjs`, `verify.mjs`, `angular.json` etc. são de TASK-0003/0004, confirmados intocados via `git status`).

Comandos executados e saída resumida:
- `node_modules/.bin/prettier --write` nos 5 arquivos acima → todos "(unchanged)".
- `tsc -p tsconfig.app.json --noEmit` (dentro de `apps/portal/web`) → exit 0, 0 erros.
- `tsc -p tsconfig.spec.json --noEmit` → exit 2, **1 erro remanescente**: `src/app/i18n/i18n-keys.spec.ts(13,27): error TS2732: Cannot find module './portal.pt-BR.json'. Consider using '--resolveJsonModule'` — `apps/portal/web/tsconfig.spec.json` ainda tem `"resolveJsonModule": false` (a sobrescrita que TASK-0004 deixou só para o `@ts-expect-error`, que acabei de remover). É arquivo do maestro/TASK-0004, fora da minha fronteira — não editei, só relato (ponto 4 do pedido).
- `pnpm --filter @detran/portal-web test` → `Test Files 12 passed (12)` / `Tests 263 passed (263)`. Avisos não-fatais no stderr: `Not implemented: HTMLCanvasElement's getContext()` (jsdom, disparado pelo `axe-core` ao inspecionar contraste de cor; não falha nenhum teste).
- `pnpm format:check` → "All matched files use Prettier code style!".
- `ps aux | grep -iE "vitest|tsc "` → nenhum processo residual meu (o único `tsc` listado pertence a outra worktree, `rait-backend`, não iniciado por mim).

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck` → **PARCIAL**: `tsconfig.app.json` 0 erros; `tsconfig.spec.json` 1 erro (TS2732, `resolveJsonModule: false` em `tsconfig.spec.json`) — não é meu arquivo, relatado conforme instrução do ponto 4, não editado.
- `pnpm --filter @detran/portal-web test` → **PASS** ("Tests 263 passed, 0 failed").
- `pnpm format:check` → **PASS**.

Fora do escopo / deixado:
- `apps/portal/web/tsconfig.spec.json` (`resolveJsonModule: false`): precisa cair (voltar a herdar `true` de `tsconfig.json`) agora que `i18n-keys.spec.ts` não tem mais o `@ts-expect-error`; é ajuste do maestro (arquivo listado como dele/TASK-0004 na fronteira do prompt original), não meu.

OD tocadas ou propostas: nenhuma nova; OD-P47 (logotipo do órgão) permanece proposta por TASK-0004 — o caso "sucesso" do spec não inclui `logoUrl` porque o contrato de `GET brand` não o define (A1).

Bloqueios: nenhum — o único item pendente (tsconfig.spec.json) foi relatado, não bloqueado, conforme instrução explícita de não editar tsconfig.
