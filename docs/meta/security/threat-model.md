# DETRAN threat model

Architect assessment for C5, baseline `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c`.
The structured source is [law/security/threat-model.json](../../../law/security/threat-model.json).
This engineering assessment describes threats and existing controls; it is not a production security certification.

## Assets, actors and flows

Tenant-scoped personal and health records, administrative decisions, authentication material,
transaction state and audit/evidence integrity are the protected assets. Browsers, anonymous
clients, citizens, staff, webhook senders, external national providers and contributors cross
different trust boundaries. An authenticated actor can still attempt access outside their
tenant, agency, identity, purpose or assigned case.

The request flow is apps/client → authenticated NestJS composition root → contextual policy →
tenant transaction → domain schema. Callback traffic has a separate raw-body signature boundary.
National integration follows domain → SENATRAN adapter → mock/real provider. Build artifacts and
proof claims cross a separate contributor → CI → protected verifier trust boundary.

## Threats and existing controls

| Boundary    | Threat / negative example                                                    | Existing control and reproducible evidence source                                                                                                                                                         | Remaining limitation                                                                   |
| ----------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TB-HTTP     | Missing principal, forbidden mutation, different tenant/agency/purpose       | [policy guard](../../../backend/domains/shared/src/policy.guard.ts), [policy matrix](../../../backend/domains/shared/src/policy.ts), their adjacent specs and `verify:decorators` / `verify:role-catalog` | Metadata and role census are structural; they do not prove every contextual decision.  |
| TB-DATA     | Cross-tenant read/write, owner-role bypass, partial transaction              | [ADR-0002](../adr/ADR-0002-unified-backend-modular-monolith.md), `INV-DATA-001`, BOAT contract and portal/INF RLS integration suites                                                                      | Named tests have bounded coverage; production DB grants are unobserved.                |
| TB-CALLBACK | Changed body/signature, expired timestamp, invalid tenant or absent secret   | [RenachWebhookGuard](../../../backend/app/src/renach-webhook.guard.ts) and its unit suite; raw body enabled in `backend/app/src/main.ts`                                                                  | Time-window checks alone do not establish persistent deduplication or secret rotation. |
| TB-SENATRAN | Direct bypass, duplicate retry, provider contract drift                      | [ADR-0003](../adr/ADR-0003-senatran-adapter-sole-boundary.md), adapter errors/idempotency/HTTP suites and boundary checker                                                                                | Mock evidence cannot qualify real payloads or operational resilience.                  |
| TB-PROOFS   | Stale claim, forged evidence, untrusted verifier, unrelated run cancellation | Required CI, governed proof verification, protected-tag exact-tree verification and pinned verifier controls                                                                                              | A local model is not remote CI success or production key-custody evidence.             |

## Personal data and unresolved decisions

The system stores personal data; no absence declaration or dummy SQL registry is justified.
[LGPD RAIT](lgpd-rait.md) explicitly retains draft legal findings, DT-052 validation and DT-060
institutional uncertainty. C4 records classification and source gaps; this model does not
ratify a draft, prescribe a legal basis, assign retention, grant access or authorize a product
mitigation. Detailed public-route review and contextual controls belong to the C3 representation.

PII in error/audit/log payloads, nominal export, free-text submissions, callback replay and
privileged infrastructure access remain review surfaces. A mitigation is only verified when
its actual scoped test or operational evidence passes on the candidate. Listed paths are test
references, not fresh execution results; candidate-bound results belong to the active round.

## Measurement compatibility

DEVAI 2.6.3 recognizes the structured `boundaries` record. Its other security signals currently
require `domain: RBAC` and literal `INSERT INTO core.pii_map`; DETRAN's existing AUTH/rbac
invariant and sourced PII metadata must retain their meaning. Until supported representation is
approved, those native gaps remain visible. No invariant domain, schema, threshold or SQL has
been changed to manufacture a positive reading.
