# CTG-0001 — independent apply/search_path delta review

Role: independent read-only Auditor Fable 5. Inspect the exact frozen readset
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-APPLY-SEARCHPATH-DELTA-READSET.md`
and native manifest. This is a narrow review of one `backend/database/apply.sh`
line after the first dedicated DB rehearsal. Do not execute shell, edit files,
connect to DB, or infer a DB PASS. Return a verdict only for this delta.

Check whether:

1. The one-line `SET LOCAL search_path = public, pg_catalog` is after the
   existing canonical/owner/role preflight and before DDL00, in the same
   `psql -X -v ON_ERROR_STOP=1 --single-transaction` invocation. Confirm it
   fixes PostgreSQL 18 fresh `pgcrypto` schema resolution without moving
   canonical checks, introducing a commit, changing DDL order, or weakening
   security.
2. The reported RED is real but limited: 18 collected, 8 pass/10 fail,
   first product error `pgcrypto` collision; downstream missing objects are
   secondary, not independent PASS/FAIL of the intake. The rolled-back
   diagnostic is not a successful schema apply.
3. ADR-0026 waives only the _different_ SQL2 legacy-queue finding. The SQL2
   review JSON remains `REVIEW`, and the new apply bytes do not inherit an
   independent SQL2 PASS. A PASS here allows a repeat dedicated DB rehearsal
   of the search_path delta with all original TASK-0028 tests; it does not
   waive tests, grant changes or the residual queue risk.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings`, `notes`. Each finding needs severity high/low, item 1–13, an
existing relative file and one-based line, concrete claim and actionable fix.
PASS has zero high. No prose wrapper, invented runtime proof or false SQL2 PASS.
