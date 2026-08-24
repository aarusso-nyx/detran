# backend/domains/ops — Field operations (cross-domain)

Domain packages for field-operations concerns shared by inf/est: agents, devices,
shifts, homologation, evidence custody, offline-sync glue (consuming
@stynx-nyx/offline-sync) and snapshots.

- Populated in Phase 2 (W2.3), ported from teat.
- Each module is a real pnpm workspace package with explicit deps (ADR-0001, ADR-0002).
