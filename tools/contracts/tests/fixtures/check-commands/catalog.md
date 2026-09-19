# Fixture error catalog (Inspector, TASK-0012, `tools/contracts/tests`)

Molde reduzido de `docs/framework/arch/teat-error-catalog.md` — só os códigos usados pelas
fixtures de `tools/contracts/tests/fixtures/check-commands/`. Nunca é lido pelo gate real.

| Código                         | Status | Quando                               |
| ------------------------------ | ------ | ------------------------------------ |
| `TEAT.DEMO_ITEM_STATE_INVALID` | 409    | fixture: estado do item incompatível |

## Genéricos (copiados de `teat-error-catalog.md` §9)

`TEAT.AUTH_REQUIRED` 401, `TEAT.FORBIDDEN_ACTION` 403, `TEAT.TENANT_MISMATCH` 404,
`TEAT.VALIDATION_FAILED` 400, `TEAT.ENUM_INVALID` 400, `TEAT.IF_MATCH_REQUIRED` 428,
`TEAT.VERSION_CONFLICT` 412, `TEAT.IDEMPOTENCY_REPLAY` 409, `TEAT.INTERNAL` 500.
