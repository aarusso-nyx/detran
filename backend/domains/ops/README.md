# backend/domains/ops — Field operations (cross-domain)

Domain packages for field-operations concerns shared by inf/est: agents, devices,
shifts, teams, homologation and application-version allowlists; frozen external
lookup snapshots; and polymorphic evidence custody.

- Populated in WP-T1 (2026-09-14, PR #40), ported from teat; generated packages cover agency, field,
  snapshots, evidence and offline-sync.
- Each module is a real pnpm workspace package with explicit deps (ADR-0001, ADR-0002).
- `@stynx-nyx/offline-sync` is deliberately deferred to Phase 5; its published
  platform contract is the only permitted implementation seam.
- Persistence enters only via `withTenantContext`; no controller uses owner/system
  context and no repository has an in-memory fallback.

The minimum `ops/agency` cut contains `agency_unit`, `agency_jurisdiction` and
`agency_competence`; agreements are outside this delivery. `shift.status` remains
`source_pending` until the canonical source vocabulary is published.

## Modules

| Module          | Package                    | Blueprint                 |
| --------------- | -------------------------- | ------------------------- |
| `agency/`       | `@detran/ops-agency`       | `BP-OPS-AGENCY-001`       |
| `core/`         | `@detran/ops-core`         | —                         |
| `evidence/`     | `@detran/ops-evidence`     | `BP-OPS-EVIDENCE-001`     |
| `example/`      | `@detran/ops-example`      | `BP-OPS-EXAMPLE-001`      |
| `field/`        | `@detran/ops-field`        | `BP-OPS-FIELD-001`        |
| `offline-sync/` | `@detran/ops-offline-sync` | `BP-OPS-OFFLINE-SYNC-001` |
| `parameter/`    | `@detran/ops-parameter`    | `BP-OPS-PARAMETER-001`    |
| `provisioning/` | `@detran/ops-provisioning` | `BP-OPS-PROVISIONING-001` |
| `snapshots/`    | `@detran/ops-snapshots`    | `BP-OPS-SNAPSHOTS-001`    |
