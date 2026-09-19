# Contracts

OpenAPI 3.1 documents. Root-level `BP-*.openapi.json` files are generated,
one per module blueprint that declares `api.resources`. Architect-authored
command contracts live separately in [`manual/`](manual/README.md).

**Generated — never hand-edited.** `tools/contracts/generate-openapi.mjs` derives each
document from `docs/framework/blueprints/BP-*.json`, mirroring exactly the controller
surface that `tools/blueprints/generate.mjs` emits (list, create, get, update, delete per
resource). `pnpm contracts:check` runs in `pnpm check` and fails on any drift, on a missing
document, or on an orphan document whose blueprint is gone — the same fail-closed contract
as ADR-0007.

Two things the blueprint knows and the TypeScript DTOs cannot express survive into the
contract, which is most of the point of publishing it:

- **Closed value sets.** A check constraint of the form `field in ('a','b')` becomes an
  `enum` on the property. The RAIT case state machine, the appeal instances, the risk flags
  and the vote values all reach API consumers as enumerations rather than free strings.
- **Data-protection annotations.** `pii` and `retention` on a blueprint field become
  `x-pii` and `x-retention` on the property, so a consumer can see which fields carry
  personal data without reading the DDL.

Regenerate with:

```bash
pnpm contracts:openapi
```

The generated checker remains unchanged: it scans root-level `*.openapi.json`
and rejects drift, missing outputs and orphans. Its PASS covers generated
documents only. Manual contracts require the executable validation and positive
surface checks in [the manual contract guide](manual/README.md), in addition to
`pnpm contracts:check`. Neither gate substitutes for the other.

The planned RAIT intake contract is
`docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`.
It is not created by this documentary delta and has no validation PASS yet.
