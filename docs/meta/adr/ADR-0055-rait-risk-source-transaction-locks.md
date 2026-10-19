# ADR-0055: RAIT risk source transaction locks

## Status

Accepted by Architect on 2026-10-19 under the bounded Owner delegation and S2-R7. Supplements ADR-0049; implementation and real acceptance remain pending.

## Context

S2 resolves every candidate from current qualified sources inside the claim transaction. READ COMMITTED row FOR SHARE protects updates to existing rows but cannot alone exclude newly inserted matching parameters, holidays, events or timers between qualification and claim. A second read alone leaves a final insertion window.

## Decision

Acquire relation SHARE locks on ops.parameter and then inf.rait_holiday before consumed source reads. Retain existing pool/member serialization. Lock the complete consumed case set FOR UPDATE, then distinct consumed AITs, infractions and clocks FOR UPDATE, each set in stable UUID order. Acquire strongest needed modes before child qualification rather than upgrading shared parent locks during candidate iteration. Apply consistent ordering to the public risk/context/claim read paths. Retain existing source child row locks and exact current-row independently admitted provenance checks.

Verify actual FK edges: infraction to AIT, timer/event to infraction, clock/event/qualification to case and alert to clock. Parent FOR UPDATE blocks newly checked FK references; it does not replace locks on existing child fields or freeze arbitrary audit/provenance insertions. Review each consumed source relationship explicitly. Missing coverage is a failure or a reported blocker, never assumed freshness. No new source writer/store, grant, owner-role request context or isolation mode is authorized.

These two relation locks are table-global. They block INSERT/UPDATE/DELETE across all tenants, including unrelated administration, until transaction completion. Ordinary reads continue. This contention cost is accepted for bounded S2 review and must be measured through real concurrent application-role tests. It is not a tenant-scoped lock or a production throughput approval. Keep transactions short and acquire the same strongest modes in a fixed order. Reverse-order external writers can still deadlock; do not claim universal deadlock freedom or alter unrelated writer paths.

## Verification and limits

Prove actual role_app_backend ACLs without grant expansion; real competing parameter/holiday and FK-child insert waits, stable same-transaction outcome or safe revalidation, and full rollback/no partial effects. Preserve existing same-pool/member/WIP serialization, complete candidate qualification, pagination, source revisions, replay, ordered stages and exact outbox/audit tests. No skipped assertion, raised timeout or degraded rejection may stand in for acceptance.

S2-R6 remains binding: qualified D RESET and authentic production provenance remain source-blocked. Current-source locking does not establish legal authority, activate a parameter or make a digest a receipt. No S2/P4 closure, S3 dispatch, production change or implementation merge is authorized here.
