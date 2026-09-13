# ADR-0019: One shared, versioned parameter store (`ops.parameter`) for every calibration that is not law

## Status

Proposed on 2026-09-13 by the Architect, on the Owner's choice of the same date (closure plan of
the implementation gate). Depends on ADR-0013 (STYNX 1.3.1 target) and complements ADR-0014…0018.

## Context

The definition round left ~84 open decisions. Most are calibrations with a sensible default that
the Owner can change later (alert ladders, WIP limits, thresholds, retention periods, session
fees, feature switches). The build packs modelled them per domain: `rait_parameter`
(`rait-build-pack.md`, `BP-INF-RAIT-ORG-001`, not created), `est.retention.*`
(`boat-build-pack.md`), `sync.concurrency_window_minutes` (`teat-build-pack.md`),
`privacy.public_regime_days` (`portal-build-pack.md`), SRE thresholds (`dashboard-build-pack.md`).
UC-RAIT-043 already defines the editing discipline: `agency-admin` edits with reason, effective
date and versions; legal deadlines are read-only; a value without a source is stored as
"pendente de fonte" and flagged on every screen that uses it.

What exists in code is thinner: `inf.normative_agency_parameter`
(`backend/database/ddl/30-inf-normative.sql:74-90`; temporal `valid_from/valid_to`, generated
CRUD, no `source_pending`, no `legal_readonly`, scoped to `traffic_agency_id`),
`tenancy.tenant_settings` (opaque jsonb, no history) and the reference catalogue
`inf.infraction_timer_ref` whose `status IN ('vigente','a_confirmar','proposta')` already
expresses "decided / to confirm / proposed" for timers. `@stynx-nyx/feature-flags` and
`@stynx-nyx/preferences` ship with STYNX 1.3.1 but are not wired.

Four per-domain stores would mean four CRUDs, four editors, divergent semantics for
"pending" and no single place for the Owner to see what is still a premise.

## Decision

1. **One store, `ops.parameter`**, owned by the `ops` domain, replaces every per-domain
   parameter table planned in the build packs. Columns: `id`, `tenant_id`,
   `traffic_agency_id?`, `scope` (`tenant|agency|surface`), `surface` (`rait|teat|portal|est|
dashboard|shared`), `key varchar(120)`, `value_json jsonb`, `value_type`,
   `status` (`vigente|a_confirmar|proposta`, same vocabulary as `infraction_timer_ref`),
   `source_pending boolean`, `legal_readonly boolean`, `decision_ref varchar(40)` (OD/DT id),
   `legal_basis text?`, `reason text`, `version int`, `effective_from date`,
   `effective_to date?`, `changed_by`, `created_at`. Unique on
   `(tenant_id, coalesce(traffic_agency_id), surface, key, effective_from)`. RLS as in
   `20-rls-policies.sql`.
2. **`ParameterService.get(key, { agencyId?, on?, required? })`** resolves
   surface → agency → tenant → catalogue default; when `required` and the current version is
   `source_pending`, it throws the surface's `PARAMETER_SOURCE_PENDING` error
   (`RAIT.PARAMETER_SOURCE_PENDING`, `BOAT.RETENTION_UNDEFINED`,
   `DASH.CELL_THRESHOLD_UNDEFINED` are aliases of that family). Reads are cached per tenant
   and invalidated by the `PARAMETRO_ALTERADO` event.
3. **Legal deadlines stay out of the store**: `infraction_timer_ref` and the deadline engine
   remain the source for `T-NA`, `T-DEF`, `T-DEC`, `T-JUL-24M`, etc.; the store only carries
   `deadline.<code>.expiry_kind_override` and operational timers (`T-VOTO`, `T-CONV`,
   `T-ASS`, `T-CLAIM`) as `proposta` until decided. `legal_readonly=true` rows are seeded, never
   editable through the API (`PARAMETER_LEGAL_READONLY`).
4. **Boolean switches are feature flags** in `@stynx-nyx/feature-flags` (dependency added in
   WP-0), catalogued next to the parameters with the same `decision_ref`; the store keeps their
   default so the catalogue is complete. `@stynx-nyx/preferences` is reserved for per-user UI
   preferences and never carries a decision.
5. **One editor**: the RAIT `ParameterEditor` + `ImpactSimulator` (`rait-web-frontend.md`) is
   generalised as `@detran/ui` `DetranParameterEditor`, mounted in every console under
   `/admin/parametros` with `permissionGuard('<surface>:parameter:update')`; legal rows show as
   read-only with their basis; `source_pending` rows show the "premissa de desenho — pendente de
   decisão" badge everywhere they are used.
6. **`inf.normative_agency_parameter`** becomes a compatibility view over `ops.parameter`
   (`surface='shared'`) in WP-A and is dropped after the normative module is regenerated.
   `BP-INF-RAIT-ORG-001` references `ops.parameter` instead of defining `rait_parameter`.
7. The catalogue of keys, defaults, status and decision references lives in
   `docs/framework/arch/parameter-catalogue.md` and is the seed of `ops.parameter`
   (`backend/database/seed/05-parameters.sql`, generated from the catalogue by
   `tools/parameters/generate-seed.mjs`).

## Consequences

- New blueprint `BP-OPS-PARAMETER-001` (namespace `ops`), DDL `15-ops-parameter.sql`, seed and
  generator; gate `verify:parameter-catalogue` (every `decision_ref` exists in
  `decision-closure-plan.md`; every key used in code exists in the catalogue).
- Build packs: WP-A (RAIT), WP-T1, WP-P1, WP-B1, WP-D1 drop their parameter tables and depend on
  `BP-OPS-PARAMETER-001`; the deadline engine reads operational timers through
  `ParameterService`.
- Owner decisions become **data changes** (new version with `reason` and `decision_ref`), not
  code changes; the closure plan tracks each `source_pending` row until a decision or a source
  arrives.
- Risk: a single table for five surfaces needs disciplined namespacing (`<surface>.<area>.<name>`)
  and the `surface` column in RLS predicates so a RAIT admin cannot edit TEAT keys.
