# backend/domains/dashboard — Monitoring read-models (transversal)

Domain packages backing DASHBOARD: read-models for worklist metrics, outbox health,
adapter telemetry, offline-sync queues, and per-phase panel-sets.

- Transversal: read-models only, no domain writes (ADR-0001).

## Modules

| Module     | Package                     | Blueprint                  |
| ---------- | --------------------------- | -------------------------- |
| `crashes/` | `@detran/dashboard-crashes` | `BP-DASHBOARD-CRASHES-001` |
| `monitor/` | `@detran/dashboard-monitor` | `BP-DASH-MONITOR-001`      |
