# ADR-0013: Adopt STYNX 1.3.1 (Angular 22, DEVAI 1.4.5) and extend the canonical role catalogue with the RAIT family

## Status

Accepted on 2026-09-12 by Owner decision (steering G.34–G.36). Extends ADR-0004
(STYNX substrate), ADR-0005 (unified backend kernel and policy matrix) and
ADR-0006 (shared Angular UI kit); does not alter ADR-0001…0012.

## Context

The repository pins `@stynx-nyx/*@1.1.1`, Angular `21.2.x` (peer `>=20.3 <22`
in `@detran/ui`) and `@aarusso-nyx/devai@1.4.5`. The frontend specification
of the RAIT console (`docs/framework/arch/rait-web-frontend.md`) was written
against that substrate. Before the console is built by a multi-agent
orchestration, the Owner decided to adopt the latest STYNX release so that the
build targets one platform version for its whole lifetime.

Facts established on 2026-09-12 against the private registry:

| Package family              | 1.1.1 (pinned)     | 1.3.1 (`latest`)                               |
| --------------------------- | ------------------ | ---------------------------------------------- |
| `@stynx-nyx/angular*`       | Angular peer 20–21 | Angular peer `>=22.0.0 <23` (workspace 22.1.6) |
| `@stynx-nyx/core            | backend            | …`                                             | NestJS `^11.1` | NestJS `^11.1.19` (unchanged major) |
| DEVAI pinned by STYNX 1.3.1 | —                  | `@aarusso-nyx/devai@1.4.5` (same as here)      |
| TypeScript in STYNX 1.3.1   | —                  | `^6.0.3` (same as this workspace)              |

Every STYNX symbol imported by this repository (`provideStynxDefaults`,
`provideStynxAuth`, `StynxAngularAuthModuleOptions`,
`StynxToastContainerComponent`, `CognitoTokenVerifier`,
`getPrincipalFromRequest`, `Principal`, `AuditEventEnvelope`,
`generateRequestId`, `RequestContext`, `Database`, `Transaction`,
`TxOptions`, `StynxHealthModule`, `StynxLoggingModule`, `StynxStorageModule`,
`IntegrationContext`, `StynxI18nModule`) is still exported by the 1.3.1
typings. The only breaking edge is Angular 21 → 22 for `@detran/ui` and every
frontend app. STYNX 1.3.1 also documents the canonical error envelope
(`StynxError`: `code`, `status`, `messageKey`, `context`) that the RAIT error
catalogue adopts.

The same modelling round showed that the canonical role catalogue
(`backend/domains/shared/src/roles.ts`, 24 codes) had no RAIT role, so no RAIT
user could pass the policy guard of the generated RAIT modules, and that the
infraction lifecycle vocabulary of `WF-INF-003` existed only in Markdown.

## Decision

1. **Platform target.** The DETRAN suite targets STYNX **1.3.1** for backend
   and frontend packages, Angular **22.x** (the STYNX 1.3.1 peer range) and
   DEVAI **1.4.5** (unchanged, the version the STYNX 1.3.1 workspace itself
   pins). `docs/framework/arch/rait-web-frontend.md` §1 is rewritten against
   this target. The workspace pins migrate in one dedicated Engineer change
   (work package WP-0 of `docs/framework/arch/rait-build-pack.md`): bump every
   `@stynx-nyx/*` pin to `1.3.1`, `@detran/ui` peer range to `>=22 <23` with
   Angular/ng-packagr 22 dev pins, refresh `pnpm-lock.yaml`, run `pnpm check`,
   `pnpm backend:test:ci` and `pnpm --filter @detran/ui test`. Until that
   change merges, `package.json` files still resolve 1.1.1; `AGENTS.md`,
   `README.md` and `docs/start` state both the target and the current pin.
2. **RAIT role family.** Ten codes join `DETRAN_ROLES`: `rait-analyst`,
   `rait-coordinator`, `rait-secretary`, `rait-signing-authority`,
   `rait-central-authority`, `rait-rapporteur`, `rait-chair`, `rait-manager`,
   `rait-hr`, `rait-finance`. The policy matrix gains read/create/update/delete
   rules for the 21 generated RAIT resources and the command surface of the
   frontend specification §7 (`inf:rait-<resource>:<action>`). Existing
   transversal roles keep their meaning (`AUDITOR` read-only, `agency-admin`
   parameters, `integration-operator` integrations, `DPO` mass exports).
3. **Role catalogue persisted.** `backend/database/ddl/05-role-catalog.sql`
   creates `auth.role_catalog` seeded one-to-one with `DETRAN_ROLES` and adds a
   foreign key from `auth.roles.key` to it, so tenants cannot create roles
   outside the canonical set. `pnpm verify:role-catalog` (in `pnpm check`)
   fails on drift between `roles.ts`, the seed and `shared/actors.md`.
4. **Lifecycle vocabulary persisted.**
   `backend/database/ddl/14-inf-lifecycle-vocabulary.sql` creates global
   reference tables under `inf` (`infraction_state_ref`, `infraction_substate_ref`,
   `infraction_closure_motive_ref`, `infraction_subject_kind_ref`,
   `infraction_payment_tier_ref`, `notification_channel_ref`,
   `infraction_timer_ref`, `infraction_event_ref`, `infraction_transition_ref`)
   seeded from `WF-INF-003` §1–§6 and `WF-INF-002` §9.2. The future infraction
   blueprint (`BP-INF-INFRACTION-001`, ADR-0012) references these codes by
   foreign key and repeats them in its generated check constraint.
   `pnpm verify:lifecycle-vocabulary` (in `pnpm check`) fails when the seed and
   the workflows diverge.

## Consequences

- **Angular 22 is a build prerequisite** for `apps/rait/web`; no frontend code
  is written against Angular 21 from now on. `ng-packagr`, `@angular/*` dev
  pins and the `@detran/ui` peer range change together in WP-0.
- **No behaviour change in 1.3.1 for the backend kernel** is assumed until WP-0
  proves it with the existing test tiers; the ADR records the export-level
  compatibility evidence, not a runtime guarantee.
- **RAIT users can now be authorised** by the shared policy guard; the
  generated CRUD controllers keep their `@Resource('inf:rait-*')` decorators
  and become reachable by the RAIT family. Command endpoints (state-guarded)
  remain to be built (frontend specification §11; build pack WP-B).
- **`apply.sh` gains two files** (`05-role-catalog`, `14-inf-lifecycle-vocabulary`)
  and, since 2026-09-13, also lists the generated `34…37` files; `seed.sh` applies
  the canonical fixtures (`rait-fixtures.md`).
- Reference tables are global (no `tenant_id`), so `verify:rls-ddl` does not
  require RLS on them; they are read-only for `role_app_backend`.

**Migration record.** WP-0 executed on 2026-09-13 on branch `build/stynx-1-3-1` (Owner decision, steering H.41): every `@stynx-nyx/*` pin 1.1.1 → 1.3.1 (14 manifests + blueprint generator), `@detran/ui` to Angular 22.1.6 / ng-packagr 22.1.1 / TypeScript 6.0.3 with peer `>=22.0.0 <23`, `@stynx-nyx/feature-flags` added to the backend app (ADR-0019). Adjustments found are recorded in `docs/framework/arch/wp0-stynx-1-3-1-migration.md` §7.
