# PEC external-provider and in-house environment contract

Status: **defined, not yet evidenced in a live environment**

This contract makes the remaining PEC dependencies searchable and mockable. Repository tests can
prove request, response and fail-closed behavior. Only an explicitly enabled run against the
named in-house or provider environment is deployment evidence.

## Opt-in suites

Run both Dashboard and real-environment checks with:

```text
DETRAN_IN_HOUSE=1 pnpm backend:test:in-house
```

`DETRAN_IN_HOUSE=1` requires all of the following:

| Variable                                    | Required value                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DETRAN_IN_HOUSE_API_BASE_URL`              | HTTPS URL of the deployed DETRAN API                                                             |
| `DETRAN_IN_HOUSE_COGNITO_ACCESS_TOKEN`      | short-lived Cognito access token whose configured strong-factor claim contains an accepted value |
| `DETRAN_IN_HOUSE_CLINICAL_TRUST_HEALTH_URL` | HTTPS capability endpoint for the actual clinical trust provider                                 |
| `DETRAN_IN_HOUSE_CLINICAL_TRUST_TOKEN`      | short-lived/secret-injected bearer credential for that endpoint                                  |
| `DETRAN_IN_HOUSE_READER_DATABASE_URL`       | PostgreSQL URL for a non-`postgres`, non-owner reader role                                       |
| `DETRAN_IN_HOUSE_TENANT_ID`                 | tenant UUID authorized for the token and seeded in the environment                               |

Without the opt-in flag the suites are skipped and produce no live-evidence claim. With it, the
configuration loader fails before testing if a value is absent, a service URL is not HTTPS, the
database URL is not PostgreSQL, the role is `postgres`, or the tenant is not a UUID.

The Dashboard suite opens a read-only transaction, binds the tenant context, and checks only
canonical CH facts: report hashes/signature validation, unsourced Junta Especial deadlines,
toxicology suspension lineage, and a source-freshness watermark. It does not introduce a CH
write API or let Dashboard perform a domain action.

The real-environment suite checks PostGIS and forced RLS through a non-owner role; exchanges a
strong-factor Cognito token at `POST /sessions`; loads every generated `BP-CH-*.openapi.json`
contract as OpenAPI 3.1; sweeps generated collection `GET` paths while rejecting server errors;
probes real trust capabilities; and calls `POST /sessions/logout` in teardown.

## Provider inventory and mock contracts

### PostgreSQL/PostGIS and RLS

Search for `STYNX_OWNER_DATABASE_URL`, `STYNX_APP_DATABASE_URL`,
`STYNX_READER_DATABASE_URL`, `auth.current_tenant_id()` and `auth.create_rls_policy`. The target
must accept the checked-in raw SQL migrations, expose `postgis_version()`, use distinct owner/app/
reader identities, and have neither superuser nor `BYPASSRLS` on the reader. Mocking is
insufficient for this boundary; use an ephemeral real PostgreSQL/PostGIS instance for CI and an
in-house instance for promotion evidence.

### Cognito, STYNX sessions, Redis and signing keys

Search for `STYNX_COGNITO_ISSUER`, `STYNX_COGNITO_AUDIENCE`,
`STYNX_COGNITO_JWKS_URI`, `STYNX_SESSION_ISSUER`, `STYNX_SESSION_AUDIENCE`,
`STYNX_SESSION_JWKS_URI`, `STYNX_REDIS_URL`, and `STYNX_SESSION_SIGNING_SECRET_ID`. Non-local
profiles require HTTPS OIDC/JWKS endpoints, a TLS Redis URL, and an external RSA key set loaded
through the STYNX secret loader; inline production keys are prohibited. Session creation is
`POST /sessions` with `{ "cognitoToken": "...", "deviceMeta": {...} }` plus `x-tenant-id`.
The expected bundle contains `sid`, `accessToken`, expiry fields and a refresh token. Mock cases:
valid strong-factor exchange; missing/invalid `amr`; tenant mismatch; Redis outage; empty JWKS;
key rotation; concurrent same-user/tenant creation; revoked/expired token; refresh reuse; logout.

### Clinical PDF/A, PAdES, TSA and long-term preservation

Search for `DETRAN_CLINICAL_SIGNING_URL`, `DETRAN_CLINICAL_SIGNING_HEALTH_URL`,
`DETRAN_CLINICAL_SIGNING_TOKEN` and `PadesSigningHttpAdapter`. The capability endpoint must return
`pades: true`, `tsa: true`, `lta: true` and `certificateValidation` containing `OCSP` or `CRL`.
The signing endpoint accepts `documentType`, a lowercase SHA-256 content hash, structured content,
signer identity/council, and minimum level `ADVANCED` or `QUALIFIED`. Its receipt must echo the
content hash and provide a storage document id, artifact SHA-256, `PAdES-TSA`, signing/TSA times,
`OCSP` or `CRL`, status `GOOD`, and validation time. Mock cases: healthy; LTA absent; no revocation
source; malformed receipt; hash mismatch; revoked/bad certificate; HTTP failure; timeout. A mock
never authorizes deletion: only real-provider preservation evidence can clear `PADES_LTA`.

### Biometric verification processor

Search for `DETRAN_BIOMETRIC_VERIFICATION_URL`, `DETRAN_BIOMETRIC_VERIFICATION_TOKEN`,
`DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID` and `BiometricVerificationHttpAdapter`. The HTTPS `POST`
includes bearer auth and processing-contract/legal-basis/purpose headers. Input identifies
provider, station, device-certificate fingerprint, capture reference, modality, examination kind,
and a patient or professional reference. The receipt contains `passed`, 0–100 or null score/LFD
score, evidence document id, lowercase SHA-256, and nullable reason. Mock wrong-purpose, missing
contract, invalid scores/hash, liveness failure, timeout and provider error; never persist raw
biometric material.

### Professional-council verification

Search for `DETRAN_COUNCIL_VERIFICATION_URL`, `DETRAN_COUNCIL_VERIFICATION_TOKEN` and
`CouncilVerificationHttpAdapter`. The bearer-authenticated `POST` sends council type `CRM`/`CRP`,
number, two-letter state and professional name. The provider response supplies boolean `active`,
optional status/name/check time; DETRAN normalizes it to `ACTIVE`, `INACTIVE` or `SUSPENDED` and
hashes the raw response. Mock active, inactive, suspended, name mismatch, malformed JSON, invalid
time, timeout and HTTP error.

### STYNX document storage/KMS

Search for `STYNX_STORAGE_REGION`, `STYNX_STORAGE_BUCKET`, `STYNX_KMS_ALIAS` and the
`@stynx-nyx/storage` composition. The provider must offer tenant-scoped object custody,
cryptographic integrity metadata, encryption through the selected KMS key and controlled
presigned transfers. Mock not-found, hash mismatch, access denial, unavailable KMS and expired
presign; use an actual object/KMS provider for preservation evidence.

### SENATRAN/RENACH

Search `packages/senatran-adapter`, `SENATRAN_PROVIDER`, `SENATRAN_REAL_*` and
`DETRAN_RENACH_WEBHOOK_SECRET`. Real mode requires a homologation base URL, CPF identity, mTLS
certificate/key (optional CA, passphrase and TLS server name), and an explicit per-surface enable
flag. Outbound retry/circuit behavior is centralized in the adapter. Inbound RENACH events use
event-id/timestamp/signature headers over the raw body and must reject replay, stale timestamps,
bad signatures and malformed events. The in-repo SENATRAN mock and seed manifest cover local
contract behavior; only the homologation suite may prove a real surface.

### SEFAZ-AM

Search `packages/sefaz-adapter`, `DETRAN_SEFAZ_PROVIDER`, `DETRAN_SEFAZ_MOCK_BASE_URL`,
`DETRAN_SEFAZ_REAL_BASE_URL` and `DETRAN_SEFAZ_TIMEOUT_MS`. The target adapter preserves the full
legacy interface and is composed into `POST /v1/ch/integrations/sefaz/payment/validate`:

| Operation             | Wire shape under configurable prefix                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| debt lookup           | `POST /sefaz/payments/lookup`; optional CPF, RENACH/process/clinic/tax identifiers; returns debt items, active-debt flag and request id           |
| issue guide           | `POST /sefaz/guides`; debt id plus optional identity/amount; returns guide/reference, amount, expiry, status, optional barcode/PIX and request id |
| payment status        | `GET /sefaz/payments/{reference}`; returns canonical status, optional payment/receipt/provider facts and request id                               |
| rectification         | `POST /sefaz/rectifications`; reference, reason and original payment; returns id/status/request id                                                |
| refund request/status | `POST /sefaz/refunds` and `GET /sefaz/refunds/{id}`; returns id/status, optional decision times and request id                                    |

Canonical statuses are `OPEN`, `ISSUED`, `PENDING`, `PAID`, `PARTIALLY_PAID`, `CANCELLED`,
`EXPIRED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, and `NOT_FOUND`. The adapter keeps the origin's
10-second default timeout and two retries after the first attempt. Unit tests cover all six paths,
encoded references, paid/partial/expired/not-found normalization, non-retryable envelopes,
retryable 503, transport failure and timeout. Local mode defaults to the explicit mock provider;
non-local mode defaults to `real` and fails startup without `DETRAN_SEFAZ_REAL_BASE_URL`.

Repository parity does not assert an official endpoint or credential scheme that the origin did
not contain. A real deployment must supply the authorized SEFAZ-AM endpoint, its authentication
and certificate material through the deployment secret mechanism, named homologation authority,
test identities and captured provider receipts. Those are environment prerequisites, not deferred
source behavior.

## Evidence boundary

Repository evidence proves schema, contract generation, fail-closed validation and mock behavior.
Deployment evidence must name the environment, provider, endpoint identities (without secrets),
candidate commit, time, tenant/test fixtures and captured result. In particular, a green skipped
suite, local fake, or capability-shaped response is not proof of PAdES-LTA preservation.
