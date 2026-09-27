# @detran/portal-identity

Module path: `backend/domains/portal/identity`.

## Purpose

Identidade federada do cidadao (ADR-0019 Decision 1; [WF-PORTAL-002] secao Estados; plan R-0009 M3-M6): guarda so o que o gov.br nao guarda — sujeito por hash de CPF, representacao (procuracao), matriz ato -> nivel de assinatura como dados (portal.act_level_policy) e vinculos (portal.entitlement). Nunca armazena token, credencial nem CPF em claro (RN-PORTAL-112). Nenhuma rota CRUD gerada (M1): as rotas de /v1/portal/* sao manuscritas em src/handwritten e usam os repositorios gerados. Publica NIVEL_ASSINATURA_ELEVADO e REPRESENTACAO_VALIDADA (ADR-0019 Ownership table).

## Blueprint

`docs/framework/blueprints/BP-PORTAL-IDENTITY-001.json`

## DDL

- `backend/database/ddl/61-portal-identity.sql`

## Routes and contract

- `docs/framework/contracts/BP-PORTAL-IDENTITY-001.commands.openapi.json`
- `docs/framework/contracts/BP-PORTAL-IDENTITY-001.openapi.json`

## Scripts

- `pnpm --filter @detran/portal-identity typecheck`
- `pnpm --filter @detran/portal-identity build`
- `pnpm --filter @detran/portal-identity test`
- `pnpm --filter @detran/portal-identity test:unit`
- `pnpm --filter @detran/portal-identity test:integration`
- `pnpm --filter @detran/portal-identity test:e2e`
- `pnpm --filter @detran/portal-identity test:real`

## Tests

- `tests/`
- 3 × `src/**/*.spec.ts`
