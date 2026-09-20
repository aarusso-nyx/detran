# Independent final ETag review — CTG-0002 / R-0007

You are the independent Auditor. Work read-only. Read every path in
`work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-3.readset.md`; use
Grep/Glob only to resolve imports and verify claims. The candidate is frozen by
SHA-256. Do not modify files or infer PASS from task status.

The previous valid review returned REVIEW solely because two high ETag defects
remained. Verify both are now closed:

1. `open` selects the session version, confronts the numeric If-Match and
   increments/returns the aggregate version. The real-DB sensor must prove
   `convene-extraordinary` W/1→W/2 followed by `open` accepting W/2 and
   returning W/3.
2. `declare-batch-item-impediment` must increment the parent batch with a
   checked `RETURNING`, then emit that numeric parent version rather than the
   child item's fallback ETag. The real-DB sensor must prove input W/2 and
   output/persisted W/3.

Check that the microcorrection does not regress the previously closed highs:
selective minutes immutability with sign→publish, accept transition plus
T-VOTO/publish T-R2 implementation, server-owned draw artifacts, and numeric
ETag round-trips already accepted by the prior review. The final evidence is
`pnpm backend:test:ci` exit 0 with app E2E 127/127 and upgrade 18/18, followed
by `pnpm check` exit 0; the focused real-DB structural file passed 4/4.

Existing low findings are acknowledged non-structural debt under the OWNER
good-enough direction. They may coexist with PASS. Promote a low only if the
current bytes demonstrate a structural security, integrity, authorization or
evidence gap; do not create a new scope preference as a blocking finding.

Verdict rules:

- PASS only with zero high findings and both residuals closed.
- REVIEW for a bounded issue that must be fixed before closure.
- FAIL for a structural, security, integrity, authorization or evidence gap.
- Low findings may coexist with PASS.

Return only the object required by the supplied JSON schema, with exactly the
keys `mode`, `round`, `verdict`, `findings`, `notes`. `mode` must be
`delivery-review`, `round` must be `R-0007`. Every finding must reference an
existing file and a valid one-based line. No Markdown or prose outside the
object.
