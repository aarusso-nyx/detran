# Error, concurrency and idempotency contract map

Architect engineering index for C5. This document locates existing contracts and executable
examples; it introduces no error code, retry budget, timeout, deadline or state transition.

## Source precedence and status

The [RAIT error catalog](rait-error-catalog.md) remains **draft**, including its historical
STYNX-version wording. Its explicitly approved scoped amendments retain only their recorded
scope. [ADR-0045](../../meta/adr/ADR-0045-rait-claim-selector-contract.md),
[ADR-0046](../../meta/adr/ADR-0046-rait-case-scope-and-claim-replay.md) and subsequent approved
claim decisions take precedence in their own scope; this index does not ratify the rest of
the catalog or assert implementation from a document alone. Runtime observations below
are descriptive and can expose drift from specifications; they are not substitute authority.

## Existing executable semantics

| Concern                    | Existing source                                                                                                                                 | Evidence / boundary                                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared error envelope      | `backend/domains/shared/src/errors/detran-error.ts` extends `StynxError` with stable code, status, message key, context and optional request ID | `detran-error.spec.ts` beside the source. The implementation's broad context type does not prove PII redaction.                                                                                                         |
| Versioned commands         | `backend/domains/shared/src/errors/if-match.ts`                                                                                                 | Adjacent `detran-error.spec.ts` covers matching version, absent/malformed header and conflict. Missing/malformed becomes 428; differing version becomes 412. This is scoped to callers of that helper, not every route. |
| Portal idempotency         | `backend/domains/portal/requests/src/handwritten/idempotency.service.ts`                                                                        | Adjacent `idempotency.service.spec.ts` checks missing key, stored response replay and changed request behavior. Preserve request scope; do not reuse keys for different actors or actions.                              |
| RAIT claim and replay      | Approved amendments in the [catalog](rait-error-catalog.md), ADR-0045/0046 and their successor provenance decisions                             | The claim selector has its own If-Match exclusion and same-attempt replay semantics. Generic versioned-command behavior must not override that exception.                                                               |
| Upstream failure and retry | [ADR-0003](../../meta/adr/ADR-0003-senatran-adapter-sole-boundary.md), `packages/senatran-adapter/src/errors.spec.ts` and `idempotency.spec.ts` | Error taxonomy and deterministic key tests are separate from operational proof of timeout/circuit/retry configuration. No new retry target is inferred.                                                                 |
| Invalid callbacks          | `backend/app/src/renach-webhook.guard.ts` and adjacent spec                                                                                     | Invalid signature and expired replay fail closed; this does not prove permanent duplicate-event suppression.                                                                                                            |

## Negative cases and remaining gaps

The cited suites permit independent checks for missing key/header, stale version, altered
request under the same key, invalid signature and expired callback. Their successful execution
must be captured at the evaluated candidate; a source reference is not a passing observation.

The draft catalog's UI refresh, legal-context and internal-error behavior requires its own
approved source and implementation coverage before readiness can be claimed. No blanket
retry of rejected writes, automatic legal outcome or invented robustness limit follows from
this index. The sensor may recognize this error contract file while still reporting absent
`error_semantics` invariants; preserve that distinction in the round assessment.
