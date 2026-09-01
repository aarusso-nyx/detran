# tools

Repo-local engineering tooling (not shipped, not a runtime dependency of any app):

- Phase 2 (W2.5): teat's blueprint generators, made **regenerable-only** — a CI drift
  check compares generated files to blueprint output; generated files are never
  hand-edited.
- Verification scripts as gates accrete (boundary checks, decorator checks, OpenAPI
  drift), unless a script belongs to a specific workspace package.

Current Phase-2 checks:

- `verify-controller-decorators.ts` — protected routes require `@Resource` and
  `@Action`; mutating routes require structured `@Audit` metadata.
- `check-rls-ddl.ts` — static policy coverage for tables carrying `tenant_id`.
- `check-rls-smoke.ts` — live cross-tenant denial, automatic tenant assignment
  and audit-chain persistence against the `detran` database.
- `verify-senatran-boundary.ts` — scans runtime source for direct national base
  URLs, SENATRAN auth headers and provider hosts outside
  `packages/senatran-adapter` (ADR-0003/ADR-0008).
- `verify-pec-parity.ts` — fail-closed accounting of every reviewed PEC
  acceptance criterion as either executable or explicitly blocked, plus the
  complete legacy-spec disposition ledger.
- `refresh-pec-test-disposition.mjs` — regenerates the 611-row legacy PEC test
  ledger from an explicitly supplied, read-only origin checkout.

Keep entries small and single-purpose; anything platform-generic belongs in stynx or
devai, not here.
