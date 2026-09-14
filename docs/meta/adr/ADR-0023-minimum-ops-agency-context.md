# ADR-0023: Minimal `ops/agency` institutional context

## Status

Accepted (Owner steering H.40, 2026-09-13).

## Context

OD-T02 requires a home for institutional context, and OD-013 retains routing by
circumscription while the Owner requests the institutional list of authorities
and circumscriptions. The TEAT mobile bootstrap carries `trafficAgencyId` as
the institutional identifier used by field modules. It must not be conflated
with `tenant_id`, which is obtained from request context and enforced by RLS.

## Decision

Create the minimum `@detran/ops-agency` generated module from
`BP-OPS-AGENCY-001`, with idempotent generated DDL
`13-ops-agency.sql`, ordered before `13-ops-field-operations.sql`.

The present cut contains only tenant-scoped `ops.agency_unit`,
`ops.agency_jurisdiction`, and `ops.agency_competence`. A competence binds a
unit to a jurisdiction under the same `(tenant_id, traffic_agency_id)` scope;
composite foreign keys prevent a cross-tenant or cross-agency binding.
`traffic_agency_id` remains the institutional identifier consumed by field
modules. RLS and tenant triggers are generated for all three tables under
ADR-0002 and ADR-0007.

No closed values are introduced. External identifiers are nullable and remain
source-pending until the requested institutional list is supplied for OD-013.

## Consequences

This is the minimum context authorized by H.40 and allows subsequent routing
by circumscription without asserting a source-less organizational taxonomy.
Commands, controllers, authority assignments, delegation, and the weekly
signing schedule are not part of this decision.

The complete `agency-context` remains deferred: agencies beyond the current
institutional identifier, authorities, delegation, agreements (`convênios`),
their instruments, validity, and audit trail require a later Owner-authorized
cut with source material. In particular, no agreement entity or agreement
relationship is created now.

## References

- Steering H.40 (OD-T02, OD-013).
- `teat-build-pack.md` WP-T1 and OD-T02.
- `teat-route-contract.md` §4.1 (`mobile-bootstrap`).
- ADR-0001, ADR-0002, ADR-0007, and ADR-0022.
