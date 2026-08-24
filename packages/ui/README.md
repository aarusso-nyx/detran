# packages/ui — shared Angular kit (placeholder)

Shared Angular UI kit for all DETRAN frontends, built **on top of
`@stynx-nyx/angular-ui`** (and the other `@stynx-nyx` Angular packages — making teat's
seven declared-but-unused Angular packages actually used).

Built in Phase 2 (W2.4). Consumers: apps/rait/web, apps/portal/{web,mobile},
apps/dashboard/web, apps/teat/{web,mobile}, apps/boat/mobile.

Contract: app-agnostic presentational components, layout shells, form controls and
theming only — no domain logic, no HTTP clients (those live in the apps and in
backend/domains contracts).
