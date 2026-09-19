Papel: Engineer (Art. 6)  
Tarefa: TASK-0011  
Ambiente conferido: banco `detran_r14`; mock `/health` → `{"status":"ok","db":"up"}`; baseline nacional → `Test Files 1 failed (1)`, `Tests 10 failed | 6 passed (16)`.

Arquivos criados/alterados:

- `backend/domains/portal/projections/src/handwritten/documents.controller.ts`
- `backend/domains/portal/inbox/src/handwritten/sne-enrollment.service.ts`
- `backend/app/src/portal-national-read.providers.ts`
- `.github/workflows/ci.yml`
- Seeds separados: `senatran-mock/database/seed/80-sne.sql`, `senatran-mock/database/seed/85-cdt.sql`

Comandos executados e saída resumida:

- `curl .../health` → OK.
- `@detran/app typecheck` → PASS.
- `@detran/portal-inbox typecheck` e `@detran/portal-projections typecheck` → PASS.
- `@detran/portal-inbox test:unit` → `Test Files 1 passed`, `Tests 13 passed`.
- `@detran/portal-projections test:unit` → `Test Files 5 passed`, `Tests 32 passed | 1 todo`.
- `@detran/app test:unit` → `Test Files 14 passed`, `Tests 64 passed`.
- `@detran/app test:integration` → `Test Files 3 passed`, `Tests 11 passed`.
- `@detran/portal-web typecheck` → PASS.
- `verify:decorators` → OK, 960 handlers.
- `verify:senatran-boundary` → FAIL por violações preexistentes nos specs proibidos.
- `portal-national-mock.e2e.spec.ts` → `Test Files 1 failed`, `Tests 10 failed | 6 passed`.
- `pkill -f vitest` → sandbox não permite consultar processos; Vitest já havia terminado.

Critérios de aceitação:

- Typechecks locais/app/Portal → PASS.
- Unit e integration requeridos → PASS.
- E2E → FAIL.
- `verify:senatran-boundary` → FAIL preexistente nos specs.
- `verify:controller-decorators` → comando inexistente; equivalente `verify:decorators` PASS.
- `blueprints:check`, `contracts:check`, `format:check` completo → não concluídos antes do bloqueio.

Tabela contrato (§) → arquivo → specs verdes:

| § | Arquivo | Specs verdes |
|---|---|---|
| §3 | `documents.controller.ts` | Não: fixture CNH/veículo depende de `20-read.sql`, fora da fronteira de escrita |
| §4 | `sne-enrollment.service.ts`, `portal-national-read.providers.ts` | Parciais: unidade verde; e2e depende da seed do mock em processo |
| §5 | `inbox.service.ts` existente | Não: pipeline STYNX retorna 422 para reuso divergente de chave |
| §7 | `.github/workflows/ci.yml` | Implementado: mock sobe e passa `SENATRAN_PROVIDER=mock` antes de `backend:test:e2e` |

Fora do escopo / deixado: não alterei specs, gerados, blueprints, `20-read.sql`, nem o pipeline STYNX de idempotência.

OD tocadas ou propostas: OD-P103, OD-P104, OD-P105, OD-P107, OD-P108 permanecem pendentes.

Bloqueios:

1. CTG-0004 §2/§9 exige CNH e veículo Prata/Ouro em `senatran-mock/database/seed/20-read.sql`, mas a fronteira de escrita autoriza somente `80-sne.sql`, `85-cdt.sql` e `88-detran.sql`. Sem a seed `20-read.sql`, o adapter devolve 503 e C-4-53/55/60/61/71–74 não podem passar.
2. C-4-59 exige `409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY` para push divergente, mas o pipeline STYNX anterior ao controller devolve 422 sem código `PORTAL.*`. A correção exige alterar camada fora da fronteira autorizada.
3. `verify:senatran-boundary` falha exclusivamente por `SENATRAN_MOCK_BASE_URL` nos specs proibidos `portal-national-mock` e `portal-national-unavailable`; não os alterei.