# @detran/inf-infraction

Module path: `backend/domains/inf/infraction`.

## Purpose

Agregado da infracao (ADR-0016 Decision 1; [WF-INF-003] secoes 1-6): unico escritor de state/substate, sujeito passivo, efeito suspensivo, pagamento, pontuacao e motivo de encerramento, dos relogios legais (secao 3) e da trilha de eventos (secao 6). O vocabulario canonico (15 estados, 12 sub-estados, 46 transicoes, 18 timers) vive em 14-inf-lifecycle-vocabulary.sql e e referenciado por FK.

## Blueprint

`docs/framework/blueprints/BP-INF-INFRACTION-001.json`

## DDL

- `backend/database/ddl/14-inf-lifecycle-vocabulary.sql`
- `backend/database/ddl/38-inf-infraction.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-INFRACTION-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-INFRACTION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-infraction typecheck`
- `pnpm --filter @detran/inf-infraction build`
- `pnpm --filter @detran/inf-infraction test`
- `pnpm --filter @detran/inf-infraction test:unit`
- `pnpm --filter @detran/inf-infraction test:integration`
- `pnpm --filter @detran/inf-infraction test:e2e`
- `pnpm --filter @detran/inf-infraction test:real`

## Tests

- `tests/`
