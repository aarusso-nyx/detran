# @detran/inf-rait-worklist

Module path: `backend/domains/inf/rait-worklist`.

## Purpose

Distribuicao por pools e escada de SLA anti-prescricao (WF-RAIT-002): quatro relogios de extincao com bandeiras e cadeia de escalonamento. v1.1.0 acrescenta a organizacao do trabalho de WF-RAIT-004 secoes 3, 5, 6, 7 e 10: unidades de julgamento, escalas e plantao, lotes de sorteio, plantao de suplencia e bancas de sessao. v1.1.1 acrescenta a autoridade signataria e sua jurisdicao institucional canonicamente identificada. v1.2.0 persiste snapshot, manifestacao e recibo verificavel da ata de distribuicao de WF-RAIT-004 secao 5. v1.3.0 fecha o schema aditivo e a superficie de leitura da worklist para os comandos de escala e lote de CTG-0002 secoes 4, 9 e 10. v1.4.0 acrescenta a identidade institucional CETRAN verificavel exigida por RN-RAIT-142 e WF-RAIT-004 secoes 5 e 6, sem promover a projecao legada de paridade a prova. v1.4.1 registra oficialmente controller, provider e exports manuscritos dos comandos CTG-0002, preservando a superficie CRUD somente de leitura.

## Blueprint

`docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`

## DDL

- `backend/database/ddl/35-inf-rait-worklist.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-rait-worklist typecheck`
- `pnpm --filter @detran/inf-rait-worklist build`
- `pnpm --filter @detran/inf-rait-worklist test`
- `pnpm --filter @detran/inf-rait-worklist test:unit`
- `pnpm --filter @detran/inf-rait-worklist test:integration`
- `pnpm --filter @detran/inf-rait-worklist test:e2e`
- `pnpm --filter @detran/inf-rait-worklist test:real`

## Tests

- `tests/`
