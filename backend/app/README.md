# @detran/app

The sole NestJS composition root for the DETRAN modular monolith. It currently
contains no domain modules; Phase 3+ modules enter as explicit `@detran/*`
workspace imports.

`detran-runtime.ts` supplies the eight application adapters required by the
STYNX kernel: token verifier, tenant resolver, entitlement policy, policy
evaluator, persisted audit sink, storage collections, rate-limit/idempotency
configuration, and PostgreSQL health readiness.

Runtime profiles are selected with `DETRAN_RUNTIME_PROFILE`:

- `local-sandbox` and `test` permit the local verifier.
- `staging-like` and `production` require Cognito and distinct
  `STYNX_OWNER_DATABASE_URL`, `STYNX_APP_DATABASE_URL`, and
  `STYNX_READER_DATABASE_URL` identities.

Apply the database first, then build and boot:

```sh
pnpm backend:db:reset
pnpm build
pnpm --filter @detran/app start
```
