# TASK-0007 — relatório corretivo da iteração 2

Papel: Architect.

O ciclo autorizado pelo Amendment 2 fechou F-007, F-008 e F-011 no estrato arquitetural e
especificou os comportamentos implementáveis de F-001…F-006 e F-009…F-010.

## Resultado

- `ADR-0028`: bindings A5, ETag por versão persistida, idempotência por hash canônico,
  transação/outbox e blockers de readiness.
- `BP-OPS-PROVISIONING-001` v1.0.1: versões persistidas, registro de idempotência e schemas JSON
  tipados sem mudar o tipo SQL `jsonb`.
- command contract: oito corpos de sucesso tipados e clientes regenerados.
- estado final do banco: DDL 21 reaplicada após DDL 20 para preservar append-only.
- geradores: `jsonSchema` opcional validado e propagado para OpenAPI e tipos TypeScript, mantendo o
  comportamento anterior para `jsonb` sem metadado.

## Gates reproduzidos pelo maestro

- `pnpm blueprints:generate`: PASS.
- `pnpm blueprints:check`: PASS.
- `pnpm contracts:openapi --check`: PASS.
- `pnpm contracts:clients --check`: PASS, 63 clientes.
- `pnpm contracts:check`: PASS, 160 operações.
- `pnpm verify:rls-ddl`: PASS, 243 tabelas tenant / 2 isenções.
- `pnpm --filter @detran/api-clients typecheck`: PASS.
- `git diff --check`: PASS.

Integrações criptográficas reais continuam `source_pending`; apenas ports e fixtures não produtivas
nos perfis autorizados poderão ser usados pelo Engineer.
