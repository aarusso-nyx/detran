# ADR-0009: API contracts are generated from blueprints

## Status

Accepted for the RAIT spec-hardening round (2026-08-26).

## Context

ADR-0007 made `docs/framework/blueprints/*.json` the sole authority for generated module
scaffolds and DDL. `docs/framework/contracts/` stayed a stub, so the REST surface those
blueprints produce had no published description — a consumer (PORTAL, DASHBOARD, an app
team, an integrator) had to read generated TypeScript to learn it.

Two things the blueprint knows are lost entirely in the generated DTOs: the closed value
sets carried by check constraints, and the `pii`/`retention` annotations on fields. For
RAIT this is not cosmetic — the case state machine, the appeal instances, the risk flags
and the vote values are all legally anchored vocabularies, and shipping them to consumers
as free-form strings invites exactly the divergence the KB round had to reconcile.

## Decision

`tools/contracts/generate-openapi.mjs` derives one OpenAPI 3.1 document per blueprint that
declares `api.resources`, mirroring the controller surface `tools/blueprints/generate.mjs`
emits. Output is regenerable-only, like the scaffolds. `pnpm contracts:check` runs inside
`pnpm check` and fails on content drift, a missing document, or an orphan document whose
blueprint no longer exists.

Two blueprint facts are promoted into the contract:

- a check constraint of the form `field in ('a','b')` becomes an `enum` on the property;
- `pii` and `retention` become `x-pii` and `x-retention`.

## Consequences

The contract cannot drift from the blueprint, and the blueprint cannot drift from the code
(ADR-0007) — so the published contract cannot drift from the code. Adding a value to a
domain vocabulary is a blueprint edit that shows up in the contract diff of the same PR.

The generator describes the _generated_ surface only. Handwritten command controllers
(`*-commands.controller.ts`) are outside it; when RAIT gains its lifecycle command surface,
either those endpoints are described by a separate hand-maintained document or the
generator grows a declaration for them in the blueprint. The latter is preferred, and this
ADR should be revisited then rather than allowing a hand-edited file into this directory.
