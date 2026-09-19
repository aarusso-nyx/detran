Papel: Engineer (Constitution Art. 6) — perfil engineer-frontend
Tarefa: TASK-0004 (iteração 3 — adenda A4)
Arquivos criados/alterados:
- /Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/app.route-manifest.ts — entrada `ouvidoria/:manifestationId` (T-22) perde `serviceKey: 'acompanhar_manifestacao'`; mantém `entitlement: { kind: 'manifestation', param: 'manifestationId' }`, `access: 'simples'`, módulo `atendimento`, `journeys: ['JRN-PORTAL-009']`. Única mudança (1 linha removida).
Não tocados: specs, stubs, fixture (`src/testing/route-manifest.fixture.ts`, ajustado pelo Inspector em paralelo), `src/app/i18n/portal.pt-BR.json`, README (não cita "19 rotas com serviceKey" — a contagem só aparece no relatório do Inspector), comentários (nenhum cita a contagem). Sem `git`, sem `pnpm install`.

Comandos executados e saída resumida:
- `grep -c acompanhar_manifestacao src/app/app.route-manifest.ts` → 0.
- `grep -rn "19" README.md src/app/{app.route-manifest,app.routes}.ts src/app/core/manifest-routes.ts` filtrado por "serviceKey/rotas" → nenhuma ocorrência a ajustar.
- `pnpm --filter @detran/portal-web typecheck` → exit 0 (app e spec).
- `pnpm --filter @detran/portal-web lint` → exit 0.
- `prettier --check` no arquivo tocado → OK; `pnpm format:check` → "All matched files use Prettier code style!" (o review `.md` da iteração 2 já está formatado).
- `grep -c "serviceKey: 'acompanhar_manifestacao'" src/testing/route-manifest.fixture.ts` → 0 (fixture do Inspector já sem o serviceKey; a chave permanece só na lista `PORTAL_SERVICE_KEYS`, o que não afeta o teste).
- `pnpm --filter @detran/portal-web test -- src/app/app.route-manifest.spec.ts` → `Test Files 1 passed (1)`, `Tests 7 passed (7)` (38 entradas path a path, screen/sheet/module/access/entitlement/serviceKey iguais à fixture, 27 telas, 14 módulos, nenhum `qualificada`, entitlement em toda rota de vínculo, serviceKey ⊆ catálogo).
- Suíte completa não executada (instrução do maestro); `ps` → nenhum `vitest` residual.

Critérios de aceitação:
- `pnpm --filter @detran/portal-web typecheck && lint` verdes → **PASS**.
- `grep -c acompanhar_manifestacao src/app/app.route-manifest.ts` → 0 → **PASS**.
- `pnpm format:check` → **PASS**.
- (Adicional pedido) `app.route-manifest.spec.ts` após conferir o fixture → **PASS** (7/7).

Tabela rota → componente → guardas: inalterada exceto a linha 32 — `ouvidoria/:manifestationId` → `PlaceholderPageComponent` (`data-screen="T-22"`) → `portalAuthGuard`, `assuranceGuard('simples')`, `entitlementGuard('manifestation')` (sem `serviceAvailabilityGuard`). Rotas com `serviceKey`: 18 (era 19); a derivação em `core/manifest-routes.ts` já omite o guarda de disponibilidade quando `serviceKey` está ausente, sem mudança de código.

Fora do escopo / deixado:
- Efeito na matriz de guardas (`app.guards-matrix.spec.ts`): os dois casos "serviceKey indisponível/parcial" de T-22 deixam de ser gerados pela fixture; validação da suíte completa fica para o maestro após o Inspector concluir o fixture.
- `PORTAL_SERVICE_KEYS` do fixture ainda lista `acompanhar_manifestacao` (arquivo do Inspector; inofensivo para os testes).
- Itens pendentes das iterações anteriores permanecem (alias `paths` `@detran/api-clients/generated/*`; `resolveJsonModule: false` em `tsconfig.spec.json` até o Inspector remover o `@ts-expect-error`).

OD tocadas ou propostas: nenhuma (A4 já cita OD-P19/OD-P55).

Bloqueios: nenhum.
