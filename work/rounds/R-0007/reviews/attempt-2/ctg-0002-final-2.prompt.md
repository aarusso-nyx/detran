# Independent final corrective review — CTG-0002 / R-0007

You are the independent Auditor. Work read-only. Read every path in
`work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-2.readset.md`; use
Grep/Glob to resolve imports and verify claims. The candidate is frozen by a
SHA-256 manifest. Do not modify files and do not infer PASS from task status.

The prior independent review is authoritative historical input and found four
high issues. Decide whether the current candidate closes each one:

1. The minutes immutability mechanism must protect identity/content while the
   real-DB positive sign→publish lifecycle persists only the authorized
   lifecycle fields; tampering must still fail.
2. accept-batch-item must transition DISTRIBUIDO→EM_INSTRUCAO and arm T-VOTO,
   while publish must arm T-R2 where contracted, in the same transaction.
3. draw must originate server-owned seed, canonical snapshot, assignments,
   T-CLAIM and minutes manifest; approval cannot depend only on seeded rows.
4. The emitted ETag must round-trip as the next If-Match token in both worklist
   and session services.

Also check that these changes do not regress the eight original review items:
exactly 20 commands, strict authorization and tenant/actor binding,
server-owned clock/audit/outbox, fail-closed trust, OWNER signers decision,
additive tenant-first SQL, executable coverage, and honest closure evidence.
The recorded final evidence is `pnpm backend:test:ci` exit 0 with app E2E
125/125 and upgrade 18/18, followed by `pnpm check` exit 0. The dedicated
structural real-DB sensor passed 2/2.

The six low findings from the prior review are acknowledged, non-structural
debt under the OWNER good-enough direction. They may remain low and may coexist
with PASS; promote one to high only if the current code shows that it actually
invalidates security, integrity, authorization, the four corrections above or
the closure evidence.

Verdict rules:

- PASS only with zero high findings and all four prior highs closed.
- REVIEW for a real bounded issue that must be corrected before closure.
- FAIL for a structural, security, integrity, authorization or evidence gap.
- Low findings may coexist with PASS when genuinely non-structural.

Return only the object required by the supplied JSON schema, with exactly the
keys `mode`, `round`, `verdict`, `findings`, `notes`. `mode` must be
`delivery-review`, `round` must be `R-0007`. Every finding must reference an
existing file and a valid one-based line. Do not emit Markdown or prose outside
the object.
