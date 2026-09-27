# @detran/portal-requests

Module path: `backend/domains/portal/requests`.

## Purpose

Ciclo comum de pedidos do cidadao (ADR-0019 Decision 2; [WF-PORTAL-001] secao Estados e secao Transicoes; plan R-0009 M7-M9): uma unica maquina de 13 estados fixos em codigo (OD-P13) para todo servico do catalogo, com protocolo imediato (T-PROTOCOLO, Lei 14.129/2021 art. 27 IV) antes de qualquer validacao de conteudo e delegacao ao comando do dominio dono (M8). O pedido nunca guarda a decisao. Inclui rascunho versionado, anexos, ciencia de consequencias, avaliacao e registro de idempotencia (M9). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica SOLICITACAO_CRIADA, SOLICITACAO_PROTOCOLADA, SOLICITACAO_DESISTIDA, SOLICITACAO_CONCLUIDA e AVALIACAO_REGISTRADA (M21).

## Blueprint

`docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json`

## DDL

- `backend/database/ddl/19-portal-platform.sql`
- `backend/database/ddl/62-portal-requests.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-REQUESTS-001.commands.openapi.json`
- `docs/framework/contracts/BP-PORTAL-REQUESTS-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-requests typecheck`
- `pnpm --filter @detran/portal-requests build`
- `pnpm --filter @detran/portal-requests test`
- `pnpm --filter @detran/portal-requests test:unit`
- `pnpm --filter @detran/portal-requests test:integration`
- `pnpm --filter @detran/portal-requests test:e2e`
- `pnpm --filter @detran/portal-requests test:real`

## Tests

- `tests/`
- 4 × `src/**/*.spec.ts`
