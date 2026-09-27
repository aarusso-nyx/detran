# @detran/inf-collection

Module path: `backend/domains/inf/collection`.

## Purpose

Modulo de arrecadacao (ADR-0017 Decision 1): unico escritor do documento de arrecadacao (UC-RAIT-032), do pagamento conciliado do retorno bancario (UC-RAIT-035), da ordem de restituicao corrigida (UC-RAIT-033) e do encaminhamento do credito a Fazenda (UC-RAIT-034). Dinheiro nunca muda estado direto: o agregado da infracao decide (ADR-0017 Decision 2; [WF-INF-003] secao 2 linhas 12 a 16 e 29). O banco e adapter interno do modulo em ports/bank, mock-first (ADR-0017 Decision 4); cartao e parcelamento estao fora de escopo (DT-031).

## Blueprint

`docs/framework/blueprints/BP-INF-COLLECTION-001.json`

## DDL

- `backend/database/ddl/57-inf-collection.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-COLLECTION-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-COLLECTION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-collection typecheck`
- `pnpm --filter @detran/inf-collection build`
- `pnpm --filter @detran/inf-collection test`
- `pnpm --filter @detran/inf-collection test:unit`
- `pnpm --filter @detran/inf-collection test:integration`
- `pnpm --filter @detran/inf-collection test:e2e`
- `pnpm --filter @detran/inf-collection test:real`

## Tests

- `tests/`
