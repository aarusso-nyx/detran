# ADR-0001: Domain-First Monorepo Layout

## Status

Accepted (owner-confirmed Decisions Ledger, 2026-08-23).

## Context

The DETRAN suite grew as separate application repositories: pec (driver-applicant
health, backend-only, 29 domain modules), teat (field-agent ticketing: backend + web +
mobile) and senatran (mock of the national traffic API). Each repo organised code
around its own application, so closely-related traffic-domain logic (infractions,
appeals, crash records, licensing) is scattered across app-shaped silos, and four new
applications (RAIT, PORTAL, BOAT, DASHBOARD) would each have forced yet another silo
or an arbitrary home. The national systems themselves (RENAINF, RENAEST, RENACH,
RENAVAM) provide a stable, externally-defined decomposition of the problem space.

## Decision

The `detran` monorepo is organised **domain-first around the national systems**, not
around applications:

- `inf` — RENAINF (infrações), `est` — RENAEST (sinistros), `ch` — RENACH
  (condutor/habilitação), `vam` — RENAVAM (**reserved, not built**).
- `ops` — an added cross-domain field-operations domain (agents, devices, shifts,
  evidence custody, offline sync).
- Transversal elements: `portal` and `dashboard` backend domains (aggregates and
  read-models across domains), `senatran-mock` and `packages/senatran-adapter`.
- `integration` is a limited physical home for a consumer projection whose logical
  owner is an adapter. It is currently authorised only for
  `backend/domains/integration/renaest-mirror`: the package owns
  `integration.renaest_mirror` as a rebuildable read model under ADR-0020, while
  `packages/senatran-adapter` retains exclusive ownership of every SENATRAN call.
- Top-level `backend/` (composition root + domain packages + DDL) is a sibling of
  `apps/`, which holds **frontends only**; each app actually builds with its own
  package.json. `apps/pec/web` is a reserved slot (pec is backend-only today).
- Domain modules are real pnpm workspace packages with explicit dependencies — no
  deep relative imports across package boundaries.

## Consequences

- New features land in the domain they belong to, regardless of which app surfaces
  them; apps become thin frontends over shared domains.
- RAIT, PORTAL, BOAT and DASHBOARD need no new repos or silos: they slot into
  `apps/` plus their domain modules.
- The `vam` slot documents the deliberate non-goal: RENAVAM build-out is deferred by
  decision and must not be started without an owner decision.
- Cross-domain code has exactly two general sanctioned homes —
  `backend/domains/shared` (thin, detran-specific) and the stynx platform
  (generic). The limited `integration.renaest_mirror` exception above is a physical
  adapter-owned projection package, not a third general cross-domain utility home;
  it may receive canonical BOAT events and receipts but may not call SENATRAN or
  write back to `est.*`.
- Package-boundary discipline (explicit deps) is enforceable in CI and is a
  precondition for the module-by-module migration of ADR-0004.
