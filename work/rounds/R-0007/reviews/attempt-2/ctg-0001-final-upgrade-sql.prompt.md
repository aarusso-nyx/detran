# Independent final-cycle SQL and harness review — R-0007 / CTG-0001

Role: independent read-only Auditor, model Fable 5. This is a **new material
SQL/harness candidate**, not a repetition of the waived intermediate review.
Review the immutable manifest
`work/rounds/R-0007/reviews/attempt-2/ctg-0001-final-upgrade-sql.manifest.json`
and files in
`work/rounds/R-0007/reviews/attempt-2/ctg-0001-final-upgrade-sql.readset.md`.
Do not execute commands, edit files, or connect to a database. Older review
verdicts/waivers remain historical; do not promote them to PASS.

Assess, in particular: (1) the five historical snapshots are authentic and
the test-only preparer cannot touch any DB other than the exact disposable
target; owner, concurrent sessions, flags, hashes and restoration fail closed;
(2) legacy data/NULL/unknown legal priority and other table rows survive,
with the parameter reconciliation disclosed before snapshot rather than
hidden by seed; (3) every DDL34/35 difference on existing relations is
reconciled idempotently, with safe new-write checks and no factual backfill;
(4) SQL executes in the current single-transaction order, preserves grants,
RLS, role boundaries, lock, verify/commit and rollback semantics; (5) the
sensor still proves upgrade from historical schema, injected failure rollback,
fresh-vs-upgrade structure, data preservation, auth and immutability, with no
skips or 0-test PASS; (6) `NOT VALID` and catalog-definition guards are safe
and genuinely fail closed, including a reapply over already-upgraded schema.

High findings block any DB apply. Cite an existing relative file and exact
one-based line for every finding; describe a concrete fix. Do not invent
runtime PASS: only static checks have run on this candidate. Return **only**
native structured JSON with exactly the schema keys `mode`, `round`,
`verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`, verdict PASS/REVIEW/FAIL. A PASS requires zero high
findings. No prose wrapper.
