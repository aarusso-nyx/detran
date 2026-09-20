# CTG-0001 — independent SQL pre-parser delta review

Role: independent read-only Auditor Fable 5. Inspect the exact frozen readset
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-PRE-PARSER-DELTA-READSET.md`
and native manifest. This is a narrow review of one PL/pgSQL expression change
after the second dedicated DB rehearsal. Do not execute shell, edit files,
connect to DB, or infer a DB PASS. Return a verdict only for this delta.

Check whether the parentheses around `CASE ... END` resolve the `ELSIF`
parser ambiguity without changing the type comparison, nullable handling,
legacy-column allowlist, DDL ordering, grants, or transaction boundary.
Cross-check the reported first error and limited rolled-back diagnostic.
ADR-0026 waives only the separate SQL2 legacy-queue finding; historical SQL2
JSON stays `REVIEW`. A PASS here allows a new complete dedicated DB rehearsal,
not a claim of successful schema application.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings`, `notes`. Each finding needs severity high/low, item 1–13, an
existing relative file and one-based line, concrete claim and actionable fix.
PASS has zero high. No prose wrapper, invented runtime proof or false SQL2 PASS.
