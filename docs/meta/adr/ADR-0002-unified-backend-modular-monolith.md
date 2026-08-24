# ADR-0002: Unified Backend as a Modular Monolith

## Status

Accepted (owner-confirmed Decisions Ledger, 2026-08-23).

## Context

pec and teat each run their own NestJS backend with duplicated infrastructure
(runtime kernel, RBAC, audit, outbox) — and each carries known debt the other fixed
or never had: teat's RLS exists in DDL but every repository bypasses it via
owner-role `withSystemContext`, its repositories silently fall back to in-memory
Maps when the DB is absent, and pec's audit sink is an in-memory array while its
test-only auth bypass sits in production code. Splitting into microservices would
multiply the operational surface of a suite operated by small teams, while keeping
separate backends would force fixing the same debt N times and make transversal
apps (PORTAL, DASHBOARD) integration projects instead of features.

## Decision

The backend is **one NestJS modular monolith, one deployable** (`backend/app` as the
sole composition root), and **one PostgreSQL database with a schema per domain**
(`inf.*`, `est.*`, `ch.*`, `ops.*`) plus shared `auth`/`audit`/`storage`/`integration`
schemas, RLS enforced throughout. SQL-first, no ORM; PostGIS with SRID 4674.

Cross-cutting concerns are solved **once, in the composition root**, fixing the
inherited debt rather than porting it:

- stynx adapter kernel (pec's 8 adapter hooks) with teat's fail-closed runtime
  profiles (dev token verifier throws outside local profiles).
- One policy matrix namespaced `«domain»:«resource»:«action»` with the union of
  roles (pec's 15, teat's 9 staff roles, plus `CIDADAO`), enforced by decorators
  and a CI decorator check.
- Tenancy (UF DETRANs) enforced on the request path via `withTenantContext` —
  never owner-role `withSystemContext`; no optional-DB in-memory fallback (fail
  hard); RLS + entitlement policy + `enforce_tenant_id` triggers + RLS smoke gate.
- Append-only hash-chained `audit.events` with an audit sink that actually
  persists; test-only auth bypasses live in test-only modules.

## Consequences

- One deployment, one migration pipeline, one policy matrix and one audit chain to
  operate and to audit — at the cost of one shared release cadence for the backend.
- Domain modules stay independently testable workspace packages; the monolith
  boundary is the composition root, not the code layout, keeping later extraction
  possible if ever needed.
- Schema-per-domain keeps ownership legible inside the single database and lets
  RLS and entitlement policies be defined per domain against shared auth schemas.
- The unified kernel is the delivery vehicle for fixing inherited debt exactly
  once; ports that try to carry their old kernel/infra with them are rejected.
- A regression in shared infrastructure affects every domain — hence the staged CI
  gates (RLS smoke, decorator check, OpenAPI drift, evidence gate) are required
  checks from the foundation phase on.
