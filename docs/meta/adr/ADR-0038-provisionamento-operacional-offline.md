# ADR-0038 — Provisionamento operacional offline

> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md` em R-0018 (CTG-0001), pela política da
> [ADR-0035](ADR-0035-adr-numbering-policy.md).
> O número ADR-0028 permanece com `ADR-0028-devai-1-5-2-attested-local-rc.md`, que entrou antes na história first-parent de `main` (`0aea746b`, 2026-09-21, contra `b8920457`, 2026-09-22).
> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número
> antigo.

---

# ADR-0028 — Provisionamento operacional offline

- Status: Accepted
- Date: 2026-09-21
- Role: Architect
- Sources: `offline-operational-provisioning.md` (sha256 `a35546abb2161df3396f49f2be40fdda99c536e45512cbd9e334ebdc5a52ade1`); `INV-OFFLINE-001.json` (sha256 `b55a91e0e3de7ada33ec0907579ba7ea285091c53ed85147fc3dd9793f719222`)

## Decision

The monorepo owns operational offline provisioning at `/v1/ops/provisioning/*` through
`BP-OPS-PROVISIONING-001`. This deliberately diverges from the origin's conceptual
`/v1/mobile-provisioning/*` naming; no origin route name is retained as an alias.

The server persists only public device-key material, fingerprint and attestation evidence. Private
device keys never exist server-side. KMS/HSM signing and envelope encryption are ports. At the
time of this ADR, JOSE/COSE, algorithms, key sizes and wire encoding were `source_pending` and
blocked real integration; only explicitly non-production fixture ports could run. The later
Android/GMS820 policy decision below resolves those format choices for R-0013, not the absent
production ports.
For R-0013 Android/Gertec GMS820, the Owner subsequently selected the JOSE/JCS/JWS/JWE profile
and associated trust/enrollment policy in ADR-0032. That selection resolves the policy choice
for this scope; the production ports and cryptographic evidence remain absent and may not be
replaced with the fixture implementation.

Every provisioning aggregate is tenant-scoped and receives forced RLS. The request tenant is
derived from context, never from a payload. Grant issuance links device, authorized agents,
validity, policy, normative package and numbering reservations. `authorized_agents_json` and
`numbering_reservation_ids_json` remain PostgreSQL `jsonb`, but carry validated JSON-schema array
metadata in the blueprint so that generated DTOs, OpenAPI and clients preserve their actual array
shapes. Reconciliation requires every field mandated by `INV-OFFLINE-001`; formalized acts are
never deleted or renumbered after expiry or a subsequently learned revocation.

All provisioning POST commands require a non-decorative `If-Match` and `Idempotency-Key`.
`If-Match` compares the device version for challenge; the challenge/device ETag for key
registration; device readiness for issuance; package version for receipt; and grant version for
revocation and reconciliation. Device-key, grant and package each own a persisted monotonic
version; readiness owns a strong opaque validator over its persisted input vector. The ETag is
obtained from a prior response or from the applicable read/readiness endpoint and is reusable
unchanged as the next `If-Match`. Missing and divergent preconditions return respectively
`TEAT.IF_MATCH_REQUIRED` (428) and `TEAT.VERSION_CONFLICT` (412); successful commands expose an
ETag. Decorative comparison is forbidden.

Each command writes a tenant-scoped idempotency record in the same transaction as its aggregate
and outbox effects: `(tenant_id, command_name, idempotency_key)` is unique and binds a canonical
request digest, persisted success body and response ETag. A retry with the same digest returns the
stored original success response without a second effect; the same key with a different digest is
rejected with 409 `TEAT.IDEMPOTENCY_REPLAY`. The canonical digest, not raw JSON field order, is
the binding input. The transaction locks every affected aggregate/version and commits aggregate
writes, idempotency record, numbering reservation effects and durable outbox record together.

Authorization is two-stage and fail-closed. Static roles only select the narrow matrix in the
Owner amendment; dynamic resolution inside the tenant then proves the required principal,
agency, device and resource bindings before an effect. No omitted role, including `ADMIN`,
`GESTOR_DETRAN` or `SUPORTE`, may bypass that second stage. Challenge accepts `technical-admin`
or `agency-admin`; key registration proves the bound STYNX principal/challenge/device; issue
proves the issuer's same-agency assignment; download proves original issuer; receipt and
reconciliation prove the bound authenticated device; readiness proves the bound agent, same-agency
administrator or technical administrator; revocation proves same-agency administrator or technical
administrator and persists its audited decision.

Readiness is a computed persisted-state projection, never a constant: it reports the device and
the exact blocking resource(s) for absent or unusable key, grant, package, numbering reservation,
normative/catalogue dependency, or known revocation. The online projection is not ready for an
expired/revoked grant or a revoked device. Its success ETag is the strong validator of those
inputs, and issue atomically rechecks that validator under the same locks. The response's typed
`blockers[]` gives Inspector deterministic assertions without inventing a new product error
catalogue.

Package download is a usability decision, not a storage lookup. Before returning the envelope, the
command resolves package, grant and device in the authenticated tenant and rejects with the
contracted 410 `TEAT.VALIDATION_FAILED` when the package is expired, its grant is expired or
revoked, the device is revoked, or the package schema is not supported by the runtime. A package
from another tenant remains indistinguishable from absent data. The envelope is returned only when
its persisted grant/device/digest relationship remains valid. The algorithm and wire format
were `source_pending` at this ADR's adoption; ADR-0032 later selects them for R-0013
Android/GMS820, while the production envelope and verification ports remain unimplemented.

Readiness computes two non-negative persisted budgets: `remaining_acts` is `maximum_acts` minus
all `ops.numbering_consumption` rows bound to a grant reservation, and
`remaining_numbering_count` is the unconsumed capacity of those same tenant/device/agency-bound,
currently usable reservations. A zero value in either budget is a blocker and makes readiness
false. Both values, the contributing reservation identities and consumption snapshot are inputs to
the readiness ETag; issue rechecks them atomically, so a partially consumed or exhausted grant
cannot be issued from a stale readiness response.

Normative usability is resolved through the local owning projection only: package, grant, device
and normative package must share the authenticated tenant and the grant's traffic agency. The
provider verifies the normative package's dependent catalogue/version references are present and
usable before readiness or issue succeeds. It neither calls a national system nor treats an
identifier supplied by the request as authority.

Enrollment is deliberately prior to numbering. Challenge and key registration bind the
authenticated STYNX subject, target device and applicable agency from request context; they do not
require a pre-existing numbering reservation and never manufacture an empty subject. Reservation
membership first becomes mandatory for package issue and remains verified in receipt, readiness
and reconciliation.

The authenticated issuer and the operational recipients are distinct persisted facts. The issuer
is the `RequestContext` principal stored as `issued_by_subject`; an `agency-admin` is valid when
its same-agency assignment is valid and does not need to have an `agent_id` or appear in
`authorized_agents_json`. The latter array exclusively identifies recipient agents allowed to use
the offline grant. In the issue transaction, for every requested reservation, the implementation
must lock and verify this deterministic predicate before any write:

```text
reservation.tenant_id = grant.tenant_id
AND reservation.traffic_agency_id = grant.traffic_agency_id
AND reservation.device_id = grant.device_id
AND reservation.agent_id ∈ persisted(grant.authorized_agents_json.agent_id)
```

The transaction then inserts one append-only `provisioning_grant_reservation_binding` with the
grant, reservation, tenant, agency, device and recipient agent identifiers. The binding is unique
per tenant/reservation and per tenant/grant/reservation. Subsequent readiness, receipt and
reconciliation resolve reservations through this relation, not by trusting a request array.

Download additionally requires exact manifest identity: after resolving package and grant in the
same tenant, it must reject with the contracted 410 when
`package.manifest_digest != grant.manifest_digest`, even when each record is otherwise internally
well-formed. The same transaction/read snapshot verifies package/grant/device identity, expiry,
revocation and supported schema before the envelope is returned.

An expired or revoked grant cannot be renewed until a persisted append-only
`provisioning_reconciliation` record proves reconciliation after the relevant terminal boundary.
The record binds tenant, grant, device, canonical reconciliation digest, actor and counts. Renewal
requires `unresolved_act_count = 0` and a snapshot covering the grant's linked queue and numbering
consumption; a grant with no acts still writes the zero-count record. The same transaction writes
the reconciliation record and outbox effect. This does not alter formalized acts or numbering.

Issue/renewal is a device-history decision, not a selection of an arbitrary prior grant. Under the
same tenant/device lock, it must examine **every** prior grant for that device whose terminal
boundary has passed. `terminal_at` is `valid_until` when not revoked, otherwise the later of
`valid_until` and `revoked_at`. For each such grant, the deterministic obligation query requires
an append-only reconciliation whose tenant, grant and device match, whose `reconciled_at` is
strictly greater than that grant's `terminal_at`, and whose
`unresolved_act_count = 0`; its digest must cover the linked queue and numbering-consumption
snapshot. If any terminal grant lacks that proof, issue is denied. Index position (`grants[0]`),
row ordering and a newer clean grant can never hide an older obligation. This policy uses no
implicit substitution; any future replacement relation requires a new Owner-approved ADR and an
explicit persisted relation with the same proof condition.

## Consequences

- The Engineer implements only the fixed handwritten surface `ProvisioningController`,
  `OPS_PROVISIONING_PROVIDER`, and the exports declared by the blueprint.
- Commands are real state transitions: each parses the contract, resolves the dynamic bindings,
  checks/reuses the persistent ETag and idempotency record, executes one transaction, and records
  the domain outbox effect. `source_pending` crypto, KMS/HSM and attestation ports admit only
  explicitly non-production fixtures; they are not success defaults for a production integration.
- The generated module and DDL are regenerated only from the blueprint; no generated file is
  hand-edited.
- `provisioning_receipt` and `device_revocation` are application append-only after a complete
  `apply.sh` run and after reapplication: `role_app_backend` retains only select/insert there.
- `provisioning_reconciliation` is likewise tenant-scoped and application append-only; it is the
  durable proof required before renewal of a terminated grant.
- `provisioning_grant_reservation_binding` is tenant-scoped and application append-only. It proves
  each reservation's tenant, agency, device and authorized-recipient relationship independently of
  the issue request and never makes an issuer an implicit recipient.
- `source_pending` crypto ports are a hard integration block, not a production default.

## Traceability

| Origin / invariant                     | ADR                                 | Blueprint / data                                   | Contract / proof obligation                                                                        |
| -------------------------------------- | ----------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P0: threat model, schemas, fixtures    | Decision and crypto block           | device key, grant, package, receipt, revocation    | schema, canonicalization, signature and digest vectors; security review                            |
| P1: migrations, RLS, domain            | tenant/RLS decision                 | all five tenant-scoped tables                      | cross-tenant denial; PostgreSQL concurrency, idempotency and restart                               |
| P2: challenge, enrollment, attestation | public-only key decision            | `device_key` attestation and fingerprint           | `key-challenges`, `keys`; real-device signed challenge proof                                       |
| P3: issue, envelope, receipt           | KMS/HSM/envelope port boundary      | grant, package and receipt digests                 | `packages`, `content`, `receipts`; copied/tampered/downgrade/rotation rejection and atomic install |
| P4: reservation and reconciliation     | formalized numbers stay immutable   | grant reservation ids and package numbering policy | `grants/{id}/reconcile`; reserve concurrency, offline acts and crash points                        |
| P5: revocation, wipe, backoffice       | explicit revocation epoch and audit | `device_revocation`, grant revocation state        | `grants/{id}/revoke`; ACK loss, partial/retry/conflict, loss/renewal/audit                         |
| P6: observation and runbooks           | readiness is an explicit boundary   | package/grant/readiness inputs                     | `devices/{deviceId}/readiness`; clean-install no-network homologation and diagnostics              |
| `idempotency key`                      | request invariants                  | receipt and reconciliation idempotency columns     | `OfflineOriginatedAct.idempotency_key`; duplicate/retry proof                                      |
| `reserved numbering context`           | number immutability                 | grant reservation ids, package policy              | `OfflineOriginatedAct.reserved_numbering_context`; concurrent/restart proof                        |
| `local content hash`                   | auditability                        | grant/package/receipt digests                      | `OfflineOriginatedAct.local_content_hash`; tamper/conflict proof                                   |
| `device identity`                      | key binding                         | device key, grant, package, receipt, revocation    | `OfflineOriginatedAct.device_id`; copied-device/cross-tenant proof                                 |
| `agent identity`                       | authorized-agent scope              | grant authorized agents                            | `OfflineOriginatedAct.agent_id`; scope-denial proof                                                |
| `timestamp`                            | validity and audit                  | grant validity and receipt times                   | `OfflineOriginatedAct.occurred_at`; expired/revoked-window proof                                   |
| `location context`                     | offline legal-act audit             | reconciliation payload retained for domain handoff | `OfflineOriginatedAct.location_context`; schema/forensic proof                                     |
| `normative package identifier`         | policy and normative binding        | grant/package normative package id                 | `OfflineOriginatedAct.normative_package_id`; mismatch/downgrade proof                              |
