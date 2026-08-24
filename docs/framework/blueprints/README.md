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
