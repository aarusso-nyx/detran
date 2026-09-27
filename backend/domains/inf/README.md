# backend/domains/inf — Infrações (RENAINF)

Domain packages for traffic-infraction processing: AIT lifecycle, normative rules,
administrative measures, alcohol procedures, defesas, penalidades, recursos and
julgamento (JARI two-tier boards).

- Each module is a real pnpm workspace package with explicit deps — no deep relative
  imports (ADR-0001, ADR-0002).

## Modules

| Module              | Package                        | Blueprint                     |
| ------------------- | ------------------------------ | ----------------------------- |
| `ait/`              | `@detran/inf-ait`              | `BP-INF-AIT-001`              |
| `alcohol/`          | `@detran/inf-alcohol`          | `BP-INF-ALCOHOL-001`          |
| `collection/`       | `@detran/inf-collection`       | `BP-INF-COLLECTION-001`       |
| `deadlines/`        | `@detran/inf-deadlines`        | —                             |
| `infraction/`       | `@detran/inf-infraction`       | `BP-INF-INFRACTION-001`       |
| `measures/`         | `@detran/inf-measures`         | `BP-INF-MEASURES-001`         |
| `normative/`        | `@detran/inf-normative`        | `BP-INF-NORMATIVE-001`        |
| `notification/`     | `@detran/inf-notification`     | `BP-INF-NOTIFICATION-001`     |
| `rait-case/`        | `@detran/inf-rait-case`        | `BP-INF-RAIT-CASE-001`        |
| `rait-integration/` | `@detran/inf-rait-integration` | `BP-INF-RAIT-INTEGRATION-001` |
| `rait-org/`         | `@detran/inf-rait-org`         | `BP-INF-RAIT-ORG-001`         |
| `rait-session/`     | `@detran/inf-rait-session`     | `BP-INF-RAIT-SESSION-001`     |
| `rait-worklist/`    | `@detran/inf-rait-worklist`    | `BP-INF-RAIT-WORKLIST-001`    |
| `speed/`            | `@detran/inf-speed`            | `BP-INF-SPEED-001`            |
