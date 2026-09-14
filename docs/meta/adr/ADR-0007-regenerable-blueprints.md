# ADR-0007: Blueprint output is regenerable-only

## Status

Accepted for W2.5 (2026-08-24).

## Decision

`docs/framework/blueprints/*.json` is the sole authority for generated backend
module scaffolds and numbered domain DDL. `tools/blueprints/generate.mjs` emits
entities, DTOs, controllers, services, repositories, module wiring and DDL.
Every output carries the blueprint id, version and source SHA-256. `pnpm
blueprints:check` regenerates every blueprint in a temporary directory and fails
for any content drift, missing output or extra output. Generated files are never
hand-edited; domain-specific behavior is added in separate non-generated files.

The generated repository surface is fail-closed: it requires a database and
request context and uses `withTenantContext`/the `app` role. It does not emit
`withSystemContext` or an in-memory fallback. DDL creates the domain schema and
installs the kernel RLS policy helper.

## Consequences

Blueprint changes and generated output are one reviewable change. Divergence like
teat's independently edited generated copies becomes a blocking CI failure.

**Amendment 2026-09-13 (WP-T0).** The blueprint `module` block accepts `handwrittenControllers`, `handwrittenProviders` (symbol + target file, emitted into the generated Nest module), `moduleImports` (`{ package, symbol }`, emitted as `imports: [...]`) and `moduleExports` (emitted as `exports: [...]`). Handwritten providers whose constructor is not injectable are declared through a factory provider object (for example `AIT_LIFECYCLE_PROVIDER`). This keeps generated modules regenerable while letting them mount handwritten behaviour and depend on sibling modules.
