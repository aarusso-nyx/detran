# `@detran/senatran-adapter`

The sole national-API boundary defined by ADR-0003 and ADR-0008. Backend domains
depend on the English types and ports exported by this package. Portuguese wire
DTOs, provider authentication, HTTP paths, resilience and mock/real differences
remain private to this boundary.

## Port inventory

| Export               | National surface         | Domain-facing operations                                                                                                                             |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RenainfPort`        | RENAINF                  | infraction reads and writes, administrative case, defense, appeal, decision and debt                                                                 |
| `RenaestPort`        | RENAEST                  | crash submit/batch/read/protocol lookup/complement/correct                                                                                           |
| `RenachPort`         | RENACH                   | driver lookup/validation and process list/read/open with `ALREADY_OPEN` recovery                                                                     |
| `SnePort`            | SNE                      | vehicle/citizen/agency enrollment and notification send/read/cancel                                                                                  |
| `CdtPort`            | CDT                      | citizen notification/infraction/vehicle/CNH views, payment quote and recognition                                                                     |
| `WsdenatranReadPort` | WSDenatran read contract | exact generated typing for all 60 read operations plus English vehicle/driver conveniences; RENAVAM-ready without building the reserved `vam` domain |

`src/generated/read.ts` and `src/generated/transactional.ts` are generated from
the two in-repo OpenAPI contracts. The generator asserts 60 operations in each
contract before emitting 120 typed operations. `src/wire.ts` exports these types
for adapter mapping work only; ordinary consumers should use the root English
models.

## Provider configuration

`SENATRAN_PROVIDER=mock|real` selects configuration for one `SenatranClient`
implementation.

Mock mode defaults to `http://localhost:3000`, uses
`SENATRAN_MOCK_CPF_USUARIO` and `SENATRAN_MOCK_CLIENT_CERT_CN` (the manifest
fixtures by default), and enables every delivered surface. `renavam` remains
disabled because it is reserved by owner decision.

Real mode requires all of:

- `SENATRAN_REAL_BASE_URL`
- `SENATRAN_REAL_CPF_USUARIO`
- `SENATRAN_REAL_CLIENT_CERT_PATH`
- `SENATRAN_REAL_CLIENT_KEY_PATH`

Optional real TLS inputs are `SENATRAN_REAL_CA_PATH`,
`SENATRAN_REAL_CLIENT_KEY_PASSPHRASE` and `SENATRAN_REAL_TLS_SERVERNAME`. The
client sends the operator CPF and authenticates with real mTLS; it never sends
the mock `x-client-cert-cn` simulation header.

Every real surface defaults off and must be enabled independently after payload
homologation:

```text
SENATRAN_REAL_ENABLE_RENAINF
SENATRAN_REAL_ENABLE_RENAEST
SENATRAN_REAL_ENABLE_RENACH
SENATRAN_REAL_ENABLE_SNE
SENATRAN_REAL_ENABLE_CDT
SENATRAN_REAL_ENABLE_WSDENATRAN_READ
```

There is deliberately no `SENATRAN_REAL_ENABLE_RENAVAM` path to a working port.
The reserved flag stays false until the owner authorizes the `vam` scope.

## Resilience and errors

Every request runs through `@stynx-nyx/integration-adapter@0.5.0` with a 10-second
timeout, three attempts, bounded exponential backoff, telemetry hooks and a
per-provider/surface/tenant circuit key (opens after five failures; 30-second
half-open interval). Only provider/network failures retry. Validation,
authentication, not-found and business outcomes do not.

Writes receive a deterministic SHA-256 `Idempotency-Key` namespaced by surface
and operation. RENACH process opening additionally implements the PEC recovery
rule: a `RENACH.PROCESS.ALREADY_OPEN` business envelope triggers a typed lookup
of the existing active process and returns `openingResult: 'ALREADY_OPEN'`.

The uniform `{returnCode,message}` envelope maps to:
`VALIDATION | AUTH | NOT_FOUND | PROVIDER | BUSINESS`.

## Test kit and verification

`@detran/senatran-adapter/test-kit` exports the manifest-backed auth fixtures,
magic keys, stable seed identifiers, manifest validation/loading helpers and a
mock config factory. The package uses the repository's four tiers:

```sh
pnpm --filter @detran/senatran-adapter test:unit
pnpm --filter @detran/senatran-adapter test:integration
SENATRAN_MOCK_BASE_URL=http://localhost:3000 pnpm --filter @detran/senatran-adapter test:e2e
SENATRAN_REAL_TEST=1 pnpm --filter @detran/senatran-adapter test:real
```

The `backend-kernel` CI job starts the in-repo mock against a separate seeded
database and runs the e2e contract tier. Real tests remain explicitly gated on
credentials and homologation fixtures.

Regenerate and check wire types with:

```sh
pnpm --filter @detran/senatran-adapter contracts:generate
pnpm verify:senatran-contracts
pnpm verify:senatran-boundary
```

The boundary scanner examines runtime code under `apps/`, `backend/` and
`packages/`. Outside this package, direct SENATRAN-family base-URL variables,
SENATRAN auth headers and direct SENATRAN-family HTTP hosts fail `pnpm check`.

## Deferred real-target work

Official payload schemas, certificate-chain details, operator provisioning,
homologation fixtures and per-surface approval remain credential-gated and
low-confidence. Those facts must be confirmed against the real target before a
feature flag is enabled; mappings change here, never in a domain or app.
