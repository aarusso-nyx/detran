# backend/domains/dashboard — Monitoring read-models (transversal)

Domain packages backing DASHBOARD: read-models for worklist metrics, outbox health,
adapter telemetry, offline-sync queues, and per-phase panel-sets.

- Skeleton in Phase 3 (W3.6); accretes panels every phase thereafter.
- Transversal: read-models only, no domain writes (ADR-0001).
