# ADR-0005: Unified Backend Kernel Contract

## Status

Accepted for Phase 2 implementation (W2.1, derived from the owner-confirmed
Decisions Ledger and ADR-0002; 2026-08-24).

## Context

The unified backend must consume the renamed `@stynx-nyx/*` registry packages,
preserve PEC and TEAT authorization authority, and fix two inherited failures:
TEAT request repositories bypass RLS through owner system context, while PEC can
buffer audit events in memory when no database is bound. The GitHub Packages
registry currently has a stale `latest` tag at 0.5.0 even though newer,
package-specific 1.0.x artifacts are published. PEC itself pins the retired
`@aarusso-nyx/stynx-*` namespace at 0.6.0, so its literal dependency names cannot
be copied into this repository.

## Decision

1. The composition root pins the exact, registry-served package-specific builds
   resolved by W2.1: audit/auth/backend/ratelimit 1.0.4; contracts/idempotency/
   storage/tenancy 1.0.3; core/data/health/logging 1.0.2. Exact pins prevent the
   stale dist-tag from silently downgrading the kernel and retain a reproducible
   lockfile integrity record.
2. `DETRAN_RUNTIME_PROFILE` is exactly `local-sandbox`, `test`, `staging-like`,
   or `production`. Local token verification exists only in the first two.
   Staging-like and production require Cognito plus distinct owner/app/reader
   database principals; the app principal cannot be `postgres`.
3. The role union contains PEC's 15 codes, TEAT's nine staff codes and
   `CIDADAO`. Only TEAT `auditor` maps to PEC `AUDITOR`; this case-only duplicate
   is the same authority. All other TEAT roles remain distinct, including
   `field-supervisor` versus PEC `SUPERVISOR`, so no role is widened by a guessed
   semantic equivalence. The resulting canonical union contains 24 roles.
4. Policy keys are always `domain:resource:action`. PEC rules are under `ch:*`;
   TEAT rules are assigned to `inf`, `est`, `ops`, `integration`, `shared`, or
   `dashboard` according to their owned domain; citizen rules are under
   `portal:*`.
5. STYNX's tenancy interceptor resolves and validates tenant membership before
   the handler. Domain code enters SQL through `@detran/shared`'s
   `withTenantContext`, which asserts active tenant+actor request context and
   forces the `app` role. Domain controllers never invoke owner-role
   `withSystemContext`; owner context remains limited to platform administration
   and infrastructure readiness.
6. The audit adapter has no in-memory path. An unbound database or an event
   without tenant identity is an error. `audit.write` persists every envelope to
   the partitioned chain and takes a transaction-scoped per-tenant advisory lock
   before selecting the predecessor, preventing concurrent chain forks.
7. CI adds a separate `backend-kernel` job with PostGIS PostgreSQL, DDL reset,
   decorator verification, live RLS smoke, and unit/integration/e2e tiers. The
   four existing job names remain unchanged. After the orchestrator verifies it
   on the PR, `backend-kernel` should become a required branch-protection check.
8. `@stynx-nyx/tenancy` 1.0.3 can order its global interceptor before the core
   request-context interceptor. The composition root applies a narrow shim that
   creates an outer CLS request scope only when none exists, then delegates to
   the published interceptor. W1.6 owns the platform fix; DETRAN removes the shim
   after adopting that release.

## Consequences

- Consumers get exact package provenance even while registry dist-tags lag.
- Non-local boot fails before serving when Cognito or database-role separation
  is missing.
- Origin RBAC remains auditable without conflating clinical and field roles.
- Request SQL is RLS-scoped by construction; explicit system work remains easy
  to identify in review.
- Audit availability is part of write-path availability: a failed persistence
  attempt is surfaced instead of buffered in process memory.
- The temporary interceptor-order shim is explicit platform debt, protected by
  an HTTP-pipeline E2E rather than an unobserved monkey patch.
