# backend/domains/portal — Citizen-facing aggregates (transversal)

Domain packages backing PORTAL: citizen-facing aggregates over inf/est/ch (tickets,
points, CNH via the senatran-adapter CDT port), appeal intake into the RAIT worklist,
notifications (SNE semantics), LGPD via @stynx-nyx/privacy.

- Transversal: reads across domains but owns only its own aggregates (ADR-0001).

## Modules

| Module             | Package                          | Blueprint                       |
| ------------------ | -------------------------------- | ------------------------------- |
| `citizen-service/` | `@detran/portal-citizen-service` | `BP-PORTAL-CITIZEN-SERVICE-001` |
| `complaints/`      | `@detran/portal-complaints`      | `BP-PORTAL-COMPLAINTS-001`      |
| `identity/`        | `@detran/portal-identity`        | `BP-PORTAL-IDENTITY-001`        |
| `inbox/`           | `@detran/portal-inbox`           | `BP-PORTAL-INBOX-001`           |
| `projections/`     | `@detran/portal-projections`     | `BP-PORTAL-PROJECTIONS-001`     |
| `requests/`        | `@detran/portal-requests`        | `BP-PORTAL-REQUESTS-001`        |
