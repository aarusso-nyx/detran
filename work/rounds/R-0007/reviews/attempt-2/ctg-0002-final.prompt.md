# Independent delivery review — CTG-0002 / R-0007

You are the independent Auditor. Work read-only. The candidate has been frozen
by SHA-256 manifest. Read every path in
`work/rounds/R-0007/reviews/attempt-2/ctg-0002-final.readset.md`; use Grep/Glob
only to resolve imports or verify a claim. Do not modify files and do not infer
PASS from task status alone.

Assess these eight items:

1. Exactly 20 nominal commands exist once (8 worklist, 12 session), generated
   write CRUD collisions are suppressed, and oral argument remains disabled.
2. Commands enforce tenant/actor/dynamic association, exact role policy,
   If-Match, idempotency, state and same-transaction case transitions.
3. Clock/deadlines/parameters and outbox/audit are server-owned, atomic and
   fail-closed.
4. Batch and session minutes trust uses server-owned manifests/snapshots,
   specific capabilities and receipt verification; missing external service
   stays fail-closed. Do not demand a live crypto success claim because none is
   made.
5. OWNER decision is implemented: required signers are president plus item
   rapporteurs; formal recorded absence/waiver removes only that absent
   rapporteur; secretary prepares/publishes but is not required by role.
6. SQL is additive, tenant-first and immutable where contracted; historical
   upgrade gets the required composite uniqueness before the deferred FK and
   seeds do not mutate an immutable minutes row after insertion.
7. Frozen tests cover positive/negative policy, transaction rollback, trust,
   route ownership and E2E behavior. Treat historical FAIL task records as an
   honest audit trail when a later bounded task fixes the cited cause.
8. Evidence supports closure: `pnpm backend:test:ci` PASS including upgrade
   18/18 and app E2E 123/123, then tooling-only parameter fixes are covered by
   a later full `pnpm check` PASS. Verify that the report does not pretend the
   earlier backend run covered later tooling bytes.

Verdict rules:

- PASS only with zero high findings and no structural/contract gap.
- REVIEW for a real but bounded issue requiring correction before closure.
- FAIL for a structural, security, integrity, authorization or evidence gap.
- Low findings may coexist with PASS only when genuinely non-structural and do
  not invalidate a closure claim.

Return only the object required by the supplied JSON schema, with exactly the
keys `mode`, `round`, `verdict`, `findings`, `notes`. `mode` must be
`delivery-review`, `round` must be `R-0007`. Every finding must reference an
existing file and valid one-based line. Do not use Markdown or prose outside
the object.
