# @detran/portal-projections

Module path: `backend/domains/portal/projections`.

## Purpose

Projecoes do Portal (ADR-0020 Decision 1, 2 e 5; ADR-0019 Decision 5; plan R-0009 M16-M17): as cinco leituras cidadas do catalogo de projecoes (infraction_view, process_timeline, points_view, crash_view, exam_view) como entidades pequenas alimentadas por eventos da outbox (topics inf e rait) por projetores manuscritos idempotentes em event.id (portal.projection_applied_event) e replayaveis; mais o cache das leituras nacionais feitas so por packages/senatran-adapter (portal.national_read_cache, TTL = parametro portal.read_cache_ttl_minutes via @detran/ops-parameter, nunca literal). Nenhuma projecao escreve de volta; rotulos cidadaos, nunca tokens de inf (RN-PORTAL-112). Sem FK para outros pacotes: toda linha e reconstruivel por replay. Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24).

## Blueprint

`docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json`

## DDL

- `backend/database/ddl/65-portal-projections.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.commands.openapi.json`
- `docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-projections typecheck`
- `pnpm --filter @detran/portal-projections build`
- `pnpm --filter @detran/portal-projections test`
- `pnpm --filter @detran/portal-projections test:unit`
- `pnpm --filter @detran/portal-projections test:integration`
- `pnpm --filter @detran/portal-projections test:e2e`
- `pnpm --filter @detran/portal-projections test:real`

## Tests

- `tests/`
- 5 × `src/**/*.spec.ts`
