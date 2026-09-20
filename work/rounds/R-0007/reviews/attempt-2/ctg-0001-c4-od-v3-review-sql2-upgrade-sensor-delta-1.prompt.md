# CTG-0001 — independent upgrade sensor delta review

Role: independent read-only Auditor Fable 5. Inspect the frozen readset
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-UPGRADE-SENSOR-DELTA-READSET.md`
and native manifest. Do not execute shell, edit files, or connect to DB.

Check that normalizedDump sorts only complete COPY row blocks, retaining every
row and non-COPY directive; that structuralCatalog still compares the relevant
priority tables and indexes, constraints, RLS policies, app/writer ACL entries,
triggers and functions while excluding only nonsemantic physical ordering,
internal RI trigger names and unrelated RAIT objects; and that no assertion
for rollback, data preservation, positive/negative protocol, authorization or
immutability was removed. Assess whether the 18/18 reported PASS is a valid
dedicated rehearsal on the final test and SQL hashes, not production proof.
The SQL2 historical REVIEW remains OWNER-ACCEPTED-WITH-WAIVER only for the
legacy queue high; this review cannot turn it into independent PASS.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings`, `notes`. Each finding needs severity high/low, item 1–13, an
existing relative file and one-based line, concrete claim and actionable fix.
PASS has zero high. No prose wrapper or invented external proof.
