# CTG-0001 — independent SQL enforce-parser delta review

Role: independent read-only Auditor Fable 5. Inspect only the frozen readset
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-ENFORCE-PARSER-DELTA-READSET.md`
and native manifest. Do not execute shell, edit files, or connect to DB.

Check that exactly the two CASE expressions in PL/pgSQL IF conditions flagged
by the previous independent PASS are parenthesized, resolving parser ambiguity
without changing evidence ranking, authorization, RLS, grants, or apply order.
Assess whether any other unparenthesized CASE at IF/ELSIF condition depth zero
in this file poses the same failure. This is a narrow delta review, not DB PASS
or a conversion of historical SQL2 REVIEW to PASS.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings`, `notes`. Each finding needs severity high/low, item 1–13, an
existing relative file and one-based line, concrete claim and actionable fix.
PASS has zero high. No prose wrapper or invented runtime proof.
