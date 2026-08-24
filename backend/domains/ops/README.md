# backend/domains/ops — Field operations (cross-domain)

Domain packages for field-operations concerns shared by inf/est: agents, devices,
shifts, teams, homologation and application-version allowlists; frozen external
lookup snapshots; and polymorphic evidence custody.

- Populated in Phase 2 (W2.3), ported from teat.
- Each module is a real pnpm workspace package with explicit deps (ADR-0001, ADR-0002).
- `@stynx-nyx/offline-sync` is deliberately deferred to Phase 5; its published
  platform contract is the only permitted implementation seam.
- Persistence enters only via `withTenantContext`; no controller uses owner/system
  context and no repository has an in-memory fallback.
