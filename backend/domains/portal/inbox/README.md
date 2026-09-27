# @detran/portal-inbox

Module path: `backend/domains/portal/inbox`.

## Purpose

Caixa do cidadao (ADR-0019 Decision 3; [WF-PORTAL-003] secao Estados e secao Prazos; plan R-0009 M15): itens da caixa como projecao de eventos mais fatos de ciencia (portal.acknowledgement_evidence), adesao ao SNE como macro-estado do vinculo (NAO_ADERIDO_SNE | ADERIDO_SNE) e assinaturas push. A leitura de um item SNE grava a evidencia e publica NOTIFICACAO_CIENCIA na outbox (topic portal), idempotente; a ciencia efetiva do aviso e do modulo inf/notification (ADR-0016). Nenhuma rota CRUD gerada (M1); wiring manuscrito declarado por TASK-0005 (M24). Publica INBOX_LIDO, NOTIFICACAO_CIENCIA, SNE_ADESAO_SOLICITADA e SNE_CANCELAMENTO_SOLICITADO (M21).

## Blueprint

`docs/framework/blueprints/BP-PORTAL-INBOX-001.json`

## DDL

- `backend/database/ddl/63-portal-inbox.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-INBOX-001.commands.openapi.json`
- `docs/framework/contracts/BP-PORTAL-INBOX-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-inbox typecheck`
- `pnpm --filter @detran/portal-inbox build`
- `pnpm --filter @detran/portal-inbox test`
- `pnpm --filter @detran/portal-inbox test:unit`
- `pnpm --filter @detran/portal-inbox test:integration`
- `pnpm --filter @detran/portal-inbox test:e2e`
- `pnpm --filter @detran/portal-inbox test:real`

## Tests

- `tests/`
- 1 × `src/**/*.spec.ts`
