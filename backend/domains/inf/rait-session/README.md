# @detran/inf-rait-session

Module path: `backend/domains/inf/rait-session`.

## Purpose

Rito de sessao colegiada JARI/CETRAN (WF-RAIT-003): pauta, convocacao, quorum, relatoria, votacao, desempate e ata assinada em PAdES+TSA. v1.1.0 acrescenta a modalidade da sessao, o reconhecimento de convocacao curta, o pedido de vista por item e a publicacao da ata (OD-102, OD-103, OD-106 vigentes por steering H.57). v1.2.0 fecha o schema aditivo de composicao institucional, concorrencia otimista e ata confiavel multi-signatario conforme ADR-0027, UC-RAIT-020 e WF-RAIT-003, com dependencias explicitas em case, worklist e deadlines e somente leituras CRUD. v1.2.1 registra oficialmente controller, provider e exports manuscritos dos comandos CTG-0002, sem expor escrita CRUD nem sustentacao oral.

## Blueprint

`docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json`

## DDL

- `backend/database/ddl/36-inf-rait-session.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-RAIT-SESSION-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-RAIT-SESSION-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-rait-session typecheck`
- `pnpm --filter @detran/inf-rait-session build`
- `pnpm --filter @detran/inf-rait-session test`
- `pnpm --filter @detran/inf-rait-session test:unit`
- `pnpm --filter @detran/inf-rait-session test:integration`
- `pnpm --filter @detran/inf-rait-session test:e2e`
- `pnpm --filter @detran/inf-rait-session test:real`

## Tests

- `tests/`
