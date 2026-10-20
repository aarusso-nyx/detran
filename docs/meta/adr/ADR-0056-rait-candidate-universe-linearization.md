# ADR-0056: RAIT candidate universe linearization

## Status

Accepted by Architect on 2026-10-19 under Owner delegation, S2-R10. Supplements ADR-0045/0049/0055 for the approved defense slice. Real acceptance remains required.

## Context

READ COMMITTED locking reads cannot predicate-lock future admissions. Admission does not acquire claim's pool advisory lock. A second complete locking pass can append newly visible parents after earlier source lock acquisition, undermining the intended fixed full-set order. Complete-set selection requires a defined point and an explicit changed-universe disposition.

## Decision

Freeze and lock the initial complete potential CASE universe and its consumed source parents in ADR-0055 order. Qualify that universe. After all source waits and qualification, perform one fresh non-locking complete-universe SQL statement, comparing exact identities, state/version and routing/eligibility inputs with the frozen universe. Do not absorb newly visible parents into an already acquired lock sequence.

A mismatch means the mandatory same-current snapshot cannot be qualified. Abort the transaction with existing RAIT.RISK_SOURCE_UNAVAILABLE503, without candidate/person disclosure or any command effect/ledger. New GET error contexts remain empty. No automatic retry/backoff policy or new error/status is introduced. A caller may explicitly retry from a fresh transaction; unstable attempts never produce a degraded queue success. This explicit technical-source disposition is not a legal outcome.

When equal and every consumed predicate/source inventory is actually protected, the final statement's snapshot is the selector's linearization point. New admissions committed after that point are concurrent later arrivals. This does not promise an unchanged queue until commit, serializable isolation or universal deadlock freedom. Exact named immutable audit bindings are not invalidated merely by unrelated appends; qualification depending on a complete/latest/unique competing inventory must separately prove that inventory's concurrency and authority.

## Required evidence and limits

Use the existing narrow independently admitted provenance port only as a test pause point. Prove a real new eligible arrival committed before the final fence yields503/noeffects, and a fresh qualified operation includes the complete resulting universe. Retain actual app role, source insert/update wait/revalidation, member/WIP, complete51 off-page blockers, ordering, replay, ordered stages/outbox and rollback. No fake SQL source factory, timeout increase, skipped tests or reduced population.

No admission writer change, global CASE/audit lock, new privilege/store, production qualification, legal RESET policy, S3, implementation merge or S2/P4 closure. S2-R6 and authentic production provenance remain blocked. Any uncovered relevant source inventory remains explicit rather than promoted to current-source GREEN.
