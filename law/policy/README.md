# Policy

**Authority:** Architect (Constitution Article 6).

## Adopter policy

[`adopter-policy.json`](./adopter-policy.json) proposes the six client domains
defined in R-0019 contract CTG-0001. The maestro binds it with DEVAI; the
generated binding and resolved configuration are maintained through that
command.

## Current policy sources

- Local release candidate environment: [`devai-local-rc-environment.json`](./devai-local-rc-environment.json).
- Local release candidate toolchain: [`devai-local-rc-toolchain.json`](./devai-local-rc-toolchain.json).
- Local release candidate trust store: [`devai-local-rc-trust-store.json`](./devai-local-rc-trust-store.json).
- Mutation evidence requirements: [`mutation-strength.json`](./mutation-strength.json).
- The normative authorization matrix is implemented in
  `backend/domains/shared/src/policy.ts`.
- Tenant isolation is enforced by the RLS DDL in
  `backend/database/ddl/20-rls-policies.sql`.
- SENATRAN access is bounded by `packages/senatran-adapter` and
  `tools/verify-senatran-boundary.ts`.

These code and database sources remain authoritative for their respective
controls; this index does not restate their rules.

**Gate:** DEVAI member `schemas` validates `adopter-policy.json` when the
maestro binds it to the project with `devai init bind --adopter-policy`.
