# @detran/inf-rait-case

Module path: `backend/domains/inf/rait-case`.

## Purpose

Ciclo de vida do caso RAIT (WF-RAIT-001): protocolo multicanal, juizo de admissibilidade, instrucao com diligencia, decisao e comunicacao. Vocabulario de estados canonico da base de conhecimento em docs/framework/product. v1.1.0 acrescenta prioridade legal de tramitacao, unidade de julgamento e versao do caso, mais pendencia de conteudo (UC-RAIT-028), redirecionamento de intake (UC-RAIT-027) e minuta versionada (WF-RAIT-004 secao 4). v1.1.1 declara a dependencia e o alias de teste do motor canonico de prazos para os comandos manuscritos do caso. v1.1.2 acrescenta o snapshot de jurisdicao institucional, reforca a completude estrutural da minuta submetida e a coerencia da assinatura da decisao, e declara as dependencias de leitura do checklist F-J-0. v1.1.5 acrescenta datas civis de recebimento/resposta e relacoes internas de documentos para diligencia, pendencia e atestado de desistência, sem CRUD HTTP. v1.1.6: CTG-0001-C4-OD V3, ADR-0024 e ADR-0025; apuracao inicial e provas internas imutaveis, protocolo handwritten e Clock explicito. v1.1.7 exporta oficialmente a porta same-transaction de transicao do caso exigida por CTG-0002 secao 10.

## Blueprint

`docs/framework/blueprints/BP-INF-RAIT-CASE-001.json`

## DDL

- `backend/database/ddl/34-inf-rait-case.sql`

## Routes and contract

- `docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json`
- `docs/framework/contracts/BP-INF-RAIT-CASE-001.openapi.json`

## Scripts

- `pnpm --filter @detran/inf-rait-case typecheck`
- `pnpm --filter @detran/inf-rait-case build`
- `pnpm --filter @detran/inf-rait-case test`
- `pnpm --filter @detran/inf-rait-case test:unit`
- `pnpm --filter @detran/inf-rait-case test:integration`
- `pnpm --filter @detran/inf-rait-case test:e2e`
- `pnpm --filter @detran/inf-rait-case test:real`

## Tests

- `tests/`
- 1 × `src/**/*.spec.ts`
