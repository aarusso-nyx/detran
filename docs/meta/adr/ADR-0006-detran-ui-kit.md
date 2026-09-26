# ADR-0006: Shared DETRAN Angular UI Kit over STYNX

## Status

Accepted for Phase 2 implementation (W2.4, 2026-08-24). Package pins amended by
`law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md` on 2026-08-31.
Angular and STYNX pins superseded by [ADR-0015](ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md) (Angular 22, STYNX 1.3.1; WP-0, 2026-09-13).

## Context

Five frontends need a coherent application frame and Portuguese-first common states,
but each must remain free to express its own routes and domain screens. Reimplementing
STYNX UI primitives in each frontend would fork the platform visual vocabulary.

## Decision

`packages/ui` publishes the workspace library `@detran/ui`, built with Angular 21 and
ng-packagr. It consumes exact registry pins `@stynx-nyx/angular`, `angular-ui`,
`angular-auth`, `angular-tenancy`, and `angular-i18n` at `1.1.1`; the Angular peer
range remains `>=20.3.0 <22` and Node is `>=24 <25`.

The kit owns only DETRAN-specific composition: light/dark custom-property tokens,
an accessible responsive top-bar/side-nav shell and breadcrumbs, a standard
authenticated bootstrap helper, Portuguese-first feedback wrappers, and re-exports
of STYNX table, pagination, empty, loading and toast primitives. The bootstrap helper
uses `provideStynxDefaults`, `provideStynxAuth` for OIDC/session exchange, and STYNX
tenant context and i18n providers.

## Consequences

Apps consume one tested shell and consistent feedback language while keeping their
route trees, business screens, OIDC values, tenant resolver and product catalogs
local. This package must not gain backend/domain logic or direct SENATRAN access.
