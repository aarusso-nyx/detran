Papel: Engineer (Art. 6)  
Tarefa: TASK-0011  
Ambiente conferido: banco `detran_r14`; mock `/health` → `{"status":"ok","db":"up"}`; mock resetado com as fixtures canônicas. Baseline não produziu log no processo em segundo plano do executor.

Arquivos criados/alterados:

- `backend/domains/portal/projections/src/handwritten/documents.controller.ts`
- `backend/domains/portal/inbox/src/handwritten/inbox.controller.ts`
- `backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts`
- `backend/app/src/portal-national-read.providers.ts`
- `.github/workflows/ci.yml`
- Seeds backend: `backend/database/seed/70-fixtures-portal.sql`
- Seeds mock: `senatran-mock/database/seed/20-read.sql`, `80-sne.sql`, `85-cdt.sql`

Comandos executados e saída resumida:

- `curl .../health` → OK.
- `senatran-mock db:reset` → OK, seeds `20-read`, `80-sne`, `85-cdt` aplicadas.
- `pnpm --filter @detran/app typecheck` → PASS.
- `pnpm typecheck` → PASS.
- `pnpm --filter @detran/portal-web typecheck` → PASS.
- `portal-national-mock.e2e.spec.ts` → `Test Files 1 passed (1)`; `Tests 16 passed (16)`.
- `@detran/app test:unit` → `Test Files 14 passed (14)`; `Tests 64 passed (64)`.
- `@detran/app test:integration` → `Test Files 3 passed (3)`; `Tests 11 passed (11)`.
- `@detran/portal-inbox test:unit` → `Test Files 1 passed (1)`; `Tests 13 passed (13)`.
- `@detran/portal-projections test:unit` → `Test Files 5 passed (5)`; `Tests 32 passed | 1 todo (33)`.
- `pnpm verify:senatran-boundary` → PASS, 2288 runtime files.
- `pnpm verify:decorators` → PASS, 960 handlers.
- `pnpm --filter @detran/app test:e2e` → FAIL fora do CTG: `teat-measures-alcohol.e2e.spec.ts`, C-0004-38 e C-0004-39.
- Prettier aplicado aos arquivos TypeScript alterados; `pkill -f vitest` executado.

Critérios de aceitação:

- Typecheck app, repositório e portal-web → PASS.
- E2E CTG-0004 nacional → PASS.
- E2E completa do app → FAIL, por C-0004-38/39 fora da fronteira.
- Unit e integration requeridos → PASS.
- `verify:senatran-boundary` e `verify:decorators` → PASS.
- `blueprints:check`, `contracts:check`, `format:check` → iniciados sem erro reportado pelo executor, mas sem saída final capturada.

Tabela contrato (§) → arquivo → specs verdes:

| § | Arquivo | Specs verdes |
|---|---|---|
| §2–3 | `documents.controller.ts`, `20-read.sql`, `70-fixtures-portal.sql`, `85-cdt.sql` | C-4-53, 55, 60–63, 71–74 |
| §4 | `sne-enrollment.service.ts`, `portal-national-read.providers.ts`, `80-sne.sql` | C-4-56–59 |
| §5 | `inbox.controller.ts` | C-4-59, 64–65 |
| §6 | camadas de apresentação existentes | `portal-payload-lint` preservado |
| §7 | `.github/workflows/ci.yml` | mock antes de `backend:test:e2e` |

Fora do escopo / deixado: não alterei specs, blueprints, arquivos gerados, adapter, contratos, DDL ou `work/rounds/**`. O mock em processo já existia no ambiente; não iniciei processo persistente.

OD tocadas ou propostas: OD-P103, OD-P104, OD-P105, OD-P106, OD-P107 e OD-P108 permanecem conforme contrato.

Bloqueios: a suíte e2e completa permanece vermelha por C-0004-38 e C-0004-39 em `tests/e2e/teat-measures-alcohol.e2e.spec.ts`, fora da fronteira de TASK-0011.