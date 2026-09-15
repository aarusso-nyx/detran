# DETRAN blueprint authoring

Blueprints are versioned, deterministic input to `tools/blueprints/generate.mjs`.
The schema is `module-blueprint.schema.json`; `BP-OPS-EXAMPLE-001.json` is the
deliberately tiny Phase 2 proof. Phase 3 owns real domain blueprints.

Use a unique `BP-...` id and increment `module.version` for every semantic change.
Declare the domain in `module.namespace`, entities and fields under
`database.entities`, and API/auth/audit metadata alongside them. Keep names safe
for SQL identifiers. Generated source is never hand-edited: run `pnpm
blueprints:generate`, inspect the provenance header, and commit the blueprint and
all generated files together.

Every generated file includes the exact SHA-256 of its source blueprint. `pnpm
blueprints:check` regenerates all blueprints into a temporary directory and fails
on any missing, changed, or extra generated file. It runs as part of root
`pnpm check` and the `backend-kernel` CI job.

## Handwritten members and module wiring (since 2026-09-13)

| Key (`module.*`)         | Shape                   | Effect in the generated `<name>.module.ts`                         |
| ------------------------ | ----------------------- | ------------------------------------------------------------------ |
| `handwrittenControllers` | `[{ target, symbol }]`  | `import { symbol } from './target.js'` + `controllers: [...]`      |
| `handwrittenProviders`   | `[{ target, symbol }]`  | idem, `providers: [...]` (symbol may be a factory provider object) |
| `handwrittenExports`     | `['file-basename']`     | `export * from './file-basename.js'` in `index.ts`                 |
| `moduleImports`          | `[{ package, symbol }]` | `import { symbol } from 'package'` + `imports: [...]`              |
| `moduleExports`          | `['Symbol']`            | `exports: [...]`                                                   |

Example: `BP-INF-AIT-001` imports `NormativeModule` from `@detran/inf-normative` and registers
`AitCommandsController` and `AIT_LIFECYCLE_PROVIDER`; `BP-INF-NORMATIVE-001` exports
`NormativeLifecycleService`.

## WP-T1 ops (blueprints e pacotes em 2026-09-14, PR #40; fechamento do WP em 2026-09-15)

Os blueprints `BP-OPS-AGENCY-001`, `BP-OPS-FIELD-001`, `BP-OPS-SNAPSHOTS-001`,
`BP-OPS-EVIDENCE-001` e `BP-OPS-OFFLINE-SYNC-001` foram entregues com pacotes, DDLs e
contratos gerados. `shift.status` permanece `source_pending` até o vocabulário canônico.
