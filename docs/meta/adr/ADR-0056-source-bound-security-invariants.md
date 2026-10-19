# ADR-0056: Source-bound RBAC and error-semantics invariants

## Status

Accepted by Architect on 2026-10-19 under R-0041 OD-C4-008, the orchestrator recommendation adopted within the Owner's express delegation. This records no new human response.

## Context

C5 has approved shared authorization and error-helper contracts with existing executable examples, but no invariant with domain `RBAC` and no invariant of type `error_semantics`. The native specification sensors distinguish those declarations from threat/error documentation. Presence alone cannot establish executable compliance. ADR-0055 requires source-backed normalization and genuine producer custody without ratifying draft domain decisions.

## Decision

Add `INV-RBAC-001` for the shared guard's existing decisions on explicitly resource/action-decorated routes, explicit public-route handling and preserved shared `ForbiddenException` boundary. Authority is ADR-0002/0005 and the approved [R-0007 CTG-0001 §10.10](../../../work/rounds/R-0007/contracts/CTG-0001.md#1010-terceiro-ciclo-autorizado-pelo-owner): the application adapter owns RAIT envelope translation while the shared guard and its allow/deny/missing-principal decisions remain unchanged. This does not promise default denial for routes without metadata, introduce permissions or alter `INV-AUTH-001`.

Declare `RBAC` additively in the canonical adopter policy's client-domain taxonomy and materialize it through the registered binding. Core/framework domains remain unchanged. This governance classification does not introduce a deployable domain module or alter policy resource namespaces.

Add `INV-API-001`, type `error_semantics`, for `DetranError`, `assertIfMatch` and `etagOf` only, transcribing [R-0008 CTG-0001 §1](../../../work/rounds/R-0008/contracts/CTG-0001.md#1-detranerror-e-helpers-m1-backenddomainssharedsrcerrors) and acceptance C-0001-01–04. R-0008's existing authorization is `GRANTED`. Stable code/status, prefix-derived message keys, the approved 428/412 distinction and matching version forms are existing obligations. This applies to helper callers; it does not impose If-Match on claim-next or every endpoint, promise PII redaction, establish retry budgets or ratify the draft RAIT catalogue.

## Execution and evidence

Use two dedicated static native producers with complete existing populations: `invariant-rbac` / `detran-invariant-rbac-v1` executes all 736 shared guard/policy tests; `invariant-errors` / `detran-invariant-errors-v1` executes all 13 existing error-helper tests. Required semantic IDs must match the actual collection plan, including complete nested suite identity. Preserve all seven previous producers and their exact obligations. RBAC overlaps the 729 policy cases already in DASH: these are additional observations, never 729 additional distinct cases. No tests or runtime code change for this transcription.

The canonical producer bindings, complete result populations, execution nonce, raw results, exact candidate, native receipts and governed readings must agree. Run the two producers unconditionally in CI without replacing required checks or hiding failures. No generic passing action, synthetic result or ordinary test log substitutes for native standing. Source/schema/trace validation and independent review precede any readiness claim; generated projections and evidence are emitted only through official commands.

## Residual gaps

The missing native SQL PII registry remains `REVIEW`: no `INSERT INTO core.pii_map`, legal basis, SQL migration or no-personal-data assertion is invented. The supplemental C3 JSON inventory is not equivalent native SQL evidence. Unknown CI effects and provider/platform custody limitations remain named gaps until genuinely resolved. Specification presence is distinct from runtime security/robustness or production readiness.

Thresholds, existing invariant statements, source contracts, product permissions and behavior, R-0036/R-0037 closure, both evidence histories and the separated product backlog remain unchanged. This additive declaration supersedes no earlier decision.
