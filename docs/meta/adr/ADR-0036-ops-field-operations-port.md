# ADR-0036: Field-Operations Port Scope and Offline-Sync Deferral

> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0006-ops-field-operations-port.md` em R-0018 (CTG-0001), pela política da
> [ADR-0035](ADR-0035-adr-numbering-policy.md).
> O número ADR-0006 permanece com `ADR-0006-detran-ui-kit.md`, que entrou antes na história first-parent de `main` (`6915a9e1`, 2026-08-24 07:43, contra `902ba190`, 07:50).
> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número
> antigo.

---

# ADR-0006: Field-Operations Port Scope and Offline-Sync Deferral

## Status

Accepted for Phase 2 W2.3 implementation (2026-08-24).

**Amended 2026-09-14 (R-0005/WP-T1).** The regenerable package boundaries are
`@detran/ops-field`, `@detran/ops-snapshots` and `@detran/ops-evidence`; the
old `ops-operations` and `ops-evidence-custody` names are superseded. WP-T1 now
introduces `@detran/ops-offline-sync` as the generated persistence and CRUD
boundary, while its handwritten WP-T2 protocol/command controllers remain
deferred. The field/device and evidence SRID-4674 geometry columns and GiST
coverage remain mandatory.

## Context

TEAT owns field-agent profiles, operational devices, teams, shifts, approaches,
homologation and mobile application versions, along with externally acquired
person/vehicle snapshots and a polymorphic evidence-custody model. Its
repositories bypass the request tenant path and can fall back to memory. Its
offline-sync server is being promoted separately into STYNX.

## Decision

Port the field-operation, snapshot and evidence-custody surfaces as the explicit
workspace packages `@detran/ops-field`, `@detran/ops-snapshots` and
`@detran/ops-evidence`, sharing only `@detran/ops-core`. All their DDL
lives in `ops.*`; external references remain UUIDs until their owning domains
are ported. Evidence links retain the `entity_type`/`entity_id` polymorphism.

All SQL enters through `withTenantContext` and the app connection. The kernel
installs forced RLS and `enforce_tenant_id` triggers for every new tenant table.
Point locations use the kernel SRID-4674 JSON/GeoJSON helper path.

WP-T1 ports the generated offline numbering and durable sync tables and CRUD
controllers as `@detran/ops-offline-sync`; do not port its handwritten protocol
and command controllers in this phase. Those commands remain an explicit Phase
5 seam consuming `@stynx-nyx/offline-sync` once the parallel
`feat/p1-mobile-runtime` extraction is published.

## Consequences

- The port has no owner-context controller path and no in-memory repository mode.
- RLS smoke coverage includes an `ops.evidence_evidence` write and geometry to JSON
  round-trip.
- Future `inf` and `est` modules can reference snapshots and evidence without
  importing a TEAT application module.
- Offline behavior is intentionally unavailable until its platform contract,
  rather than a copied TEAT implementation, is ready.
