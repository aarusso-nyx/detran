# ADR-0006: Field-Operations Port Scope and Offline-Sync Deferral

## Status

Accepted for Phase 2 W2.3 implementation (2026-08-24).

## Context

TEAT owns field-agent profiles, operational devices, teams, shifts, approaches,
homologation and mobile application versions, along with externally acquired
person/vehicle snapshots and a polymorphic evidence-custody model. Its
repositories bypass the request tenant path and can fall back to memory. Its
offline-sync server is being promoted separately into STYNX.

## Decision

Port the field-operation, snapshot and evidence-custody surfaces as the explicit
workspace packages `@detran/ops-operations`, `@detran/ops-snapshots` and
`@detran/ops-evidence-custody`, sharing only `@detran/ops-core`. All their DDL
lives in `ops.*`; external references remain UUIDs until their owning domains
are ported. Evidence links retain the `entity_type`/`entity_id` polymorphism.

All SQL enters through `withTenantContext` and the app connection. The kernel
installs forced RLS and `enforce_tenant_id` triggers for every new tenant table.
Point locations use the kernel SRID-4674 JSON/GeoJSON helper path.

Do not port offline-sync controllers or tables in this phase. Leave only an
explicit Phase 5 seam which consumes `@stynx-nyx/offline-sync` once the parallel
`feat/p1-mobile-runtime` extraction is published.

## Consequences

- The port has no owner-context controller path and no in-memory repository mode.
- RLS smoke coverage includes an `ops.evidence_evidence` write and geometry to JSON
  round-trip.
- Future `inf` and `est` modules can reference snapshots and evidence without
  importing a TEAT application module.
- Offline behavior is intentionally unavailable until its platform contract,
  rather than a copied TEAT implementation, is ready.
