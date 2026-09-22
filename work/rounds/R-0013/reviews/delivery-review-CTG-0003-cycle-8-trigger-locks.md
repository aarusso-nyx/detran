# Delivery Review — R-0013 / CTG-0003 / ciclo 8

## Veredito

**FAIL** — um achado `high` bloqueante.

## Achado

A primeira equivalência idempotente não consultava `pg_trigger.tgqual`. Um gatilho com os mesmos
eventos, função, coluna e habilitação, mas com `WHEN (false)`, seria preservado embora nunca
executasse `auth.enforce_tenant_id()`.

## Correção requerida

Rejeitar qualquer condição `WHEN` não nula e substituir o sensor apenas textual por prova
PostgreSQL comportamental de criação quando ausente, preservação do OID válido e rejeição atômica
do gatilho condicionado.

Revisão somente leitura por Reviewer CODEX no papel Auditor, conforme exceção do Owner.
