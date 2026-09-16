# Contracts

OpenAPI 3.1 documents, one per module blueprint that declares `api.resources`.

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

## `*.commands.openapi.json` — hand-written command contracts (WP-T3, CTG-0005)

A `*.openapi.json` file **with** the `.commands` suffix is the opposite of everything above:
it is hand-written, never generated, and documents the handwritten command controllers under
`src/handwritten/` (and the few `backend/app/src/teat-*.controller.ts` ones) rather than a
blueprint's CRUD surface. `tools/contracts/generate-openapi.mjs` ignores these files in its
orphan scan; `tools/contracts/check-commands.mjs` is their gate instead — it cross-checks every
route the document declares against the AST of the mounted controllers (both directions), every
`code` in a 4xx/5xx response or an `error_code` enum against `docs/framework/arch/teat-error-catalog.md`,
`operationId` uniqueness across all nine files, and that `info.x-blueprint` resolves to a real
file in `docs/framework/blueprints/` (by `x-blueprint`, never by filename — see
`BP-OPS-BOOTSTRAP-001.commands.openapi.json` below). `pnpm contracts:check` runs the CRUD
generator's `--check` first, then this gate; both are part of `pnpm check`.

Nine files today, one per TEAT command surface:

```text
BP-INF-AIT-001.commands.openapi.json            BP-INF-NORMATIVE-001.commands.openapi.json
BP-INF-MEASURES-001.commands.openapi.json       BP-INF-ALCOHOL-001.commands.openapi.json
BP-OPS-FIELD-001.commands.openapi.json          BP-OPS-OFFLINE-SYNC-001.commands.openapi.json
BP-OPS-EVIDENCE-001.commands.openapi.json       BP-OPS-SNAPSHOTS-001.commands.openapi.json
BP-OPS-BOOTSTRAP-001.commands.openapi.json      (bootstrap/turno/handoff/stream/integrações;
                                                  x-blueprint: BP-OPS-FIELD-001 — no blueprint
                                                  of its own)
```

**Rotas manuscritas vencem o CRUD gerado.** Sixteen (route, method) pairs are declared by both
a generated blueprint contract and one of the `.commands` files above — for example
`POST /v1/ops/offline-sync/sync-batches`, `GET`/`POST /v1/ops/snapshots/external-queries`, and
`GET /v1/ops/evidence/evidence(/{id})`. In every one of these, the handwritten controller is
registered before the generated CRUD controller and is the one that actually answers; the
`.commands` document is the source of truth for that path, and the generated document is stale
for it (CTG-0005 §8.6). `GET`/`POST /v1/ops/field/app-versions` does **not** shadow anything: the
generated CRUD for that entity mounts at `/v1/ops/field/application-versions`, a different path
for the same resource (tracked as OD-T68).

Generate the TypeScript clients for both kinds of contract (generated and `.commands`) with:

```bash
pnpm contracts:clients
```

which writes `packages/api-clients/src/generated/<name>.ts` (see that package's own layout);
unlike `contracts:openapi`, this generator has no `--check` mode and does not run inside
`pnpm check` — `pnpm --filter @detran/api-clients typecheck` (part of `pnpm typecheck`) is what
keeps the committed output honest (CTG-0005 §4.2, §8.9).
