# @detran/app

The sole NestJS composition root for the DETRAN modular monolith. Domain modules
enter as explicit `@detran/*` workspace imports.

`detran-runtime.ts` supplies the eight application adapters required by the
STYNX kernel: token verifier, tenant resolver, entitlement policy, policy
evaluator, persisted audit sink, storage collections, rate-limit/idempotency
configuration, and PostgreSQL health readiness.

Runtime profiles are selected with `DETRAN_RUNTIME_PROFILE`:

- `local-sandbox` and `test` permit the local verifier.
- `staging-like` and `production` require Cognito and distinct
  `STYNX_OWNER_DATABASE_URL`, `STYNX_APP_DATABASE_URL`, and
  `STYNX_READER_DATABASE_URL` identities.

The inbound RENACH acknowledgement route is
`POST /v1/ch/transmissions/callbacks/renach`. The deployment must terminate the
RENACH mTLS channel and inject `DETRAN_RENACH_WEBHOOK_SECRET`. The sender signs
the exact request bytes using HMAC-SHA256 over
`<unix-seconds>.<tenant-uuid>.<event-id>.<raw-body>` and sends the result in
`x-renach-signature` (optionally prefixed with `sha256=`), together with
`x-renach-timestamp`, `x-detran-tenant-id`, and `x-renach-event-id`. The app
rejects signatures older than five minutes and deduplicates authenticated
events in `integration.inbox_receipt`.

Apply the database first, then build and boot:

```sh
pnpm backend:db:reset
pnpm build
pnpm --filter @detran/app start
```
