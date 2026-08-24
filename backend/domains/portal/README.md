# backend/domains/portal — Citizen-facing aggregates (transversal)

Domain packages backing PORTAL: citizen-facing aggregates over inf/est/ch (tickets,
points, CNH via the senatran-adapter CDT port), appeal intake into the RAIT worklist,
notifications (SNE semantics), LGPD via @stynx-nyx/privacy.

- Populated in Phase 4 (W4.3).
- Transversal: reads across domains but owns only its own aggregates (ADR-0001).
