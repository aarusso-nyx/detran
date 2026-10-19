# S2-R7 — source transaction consistency

Architect, Constitution Articles 6–10/24. Recorded 2026-10-19T23:55:56.998144+00:00, within the Owner delegation ending 2026-10-20T02:39:32Z, earlier on return.

## Question and adopted recommendation

READ COMMITTED tuple locks do not prevent new matching source rows after validation. Adopt the independently reviewed recommendation to realize ADR-0049 same-transaction current-source qualification through ordered relation and parent locks, retaining all receipt and row revision checks. No new operational writer, grant, store, isolation mode or legal rule.

Relation SHARE on ops.parameter and inf.rait_holiday is **table-global**, blocks administrative INSERT/UPDATE/DELETE across tenants until transaction end, and leaves ordinary reads available. This operational cost is accepted for the bounded S2 implementation under the temporary Owner delegation; it must be visible in PR review. Never describe it as tenant-scoped.

The exact supplemental Architect ownership extension is ADR-0055-rait-risk-source-transaction-locks.md plus its rows in docs/meta/adr/README.md and DESIGN-DECISIONS.md. The original packet/manifest remain historical. Engineer stays in already approved handwritten paths. Inspector stays in the owned claim HTTP spec; new real source-phantom sensors are additive, with no reduced assertions, timeout increase or skipped gates.

Acquire relation locks before consumed source reads, then existing pool/member serialization and strongest complete-set parent locks in a fixed UUID order, before child reads. Validate every actual FK edge and existing child tuple lock; parent locks only protect FK insertions that actually check the locked parent. Arbitrary audit/provenance insertions are not frozen by an unrelated parent. Receipt completeness/independent authority remains mandatory; uncovered source windows must fail closed or remain an explicit blocker.

Actual role_app_backend privileges, concurrent writer wait/revalidation, rollback and full unchanged contract regressions must be executed before GREEN. Do not claim deadlock freedom against untraced reverse-order writers. No S2 completion, merge, S3, production activation or legal-policy inference is approved by this decision.

## Historical reviewer clarification

Frozen provenance-format JSON fields bind auth.users.is_active (240–243/473), while its Markdown 282–286 preserves historical reviewer authority and 294–296 requires exact current row binding. A changed is_active can stale an old receipt without retroactively invalidating the original decision. A newly independently admitted receipt may bind current false. No new current-active predicate, self-refresh, exception or history rewrite.
