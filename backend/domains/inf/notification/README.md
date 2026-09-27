# @detran/inf-notification

Module path: `backend/domains/inf/notification`.

## Purpose

Modulo de notificacao (ADR-0016 Decision 1 e 3; [WF-INF-002] secao 2 P2 Notificar): unico escritor de avisos (NA, NP, decisao, diligencia, edital), da ciencia efetiva ou ficta e das tentativas de entrega. Publica NOTIFICACAO_EXPEDIDA e NOTIFICACAO_CIENCIA; nunca decide nada sobre a infracao. Marco por canal em inf.notification_channel_ref ([RN-RAIT-104]).

## Blueprint

`docs/framework/blueprints/BP-INF-NOTIFICATION-001.json`

## DDL

- `backend/database/ddl/59-inf-notification.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-NOTIFICATION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-notification typecheck`
- `pnpm --filter @detran/inf-notification build`
- `pnpm --filter @detran/inf-notification test`
- `pnpm --filter @detran/inf-notification test:unit`
- `pnpm --filter @detran/inf-notification test:integration`
- `pnpm --filter @detran/inf-notification test:e2e`
- `pnpm --filter @detran/inf-notification test:real`

## Tests

- `tests/`
