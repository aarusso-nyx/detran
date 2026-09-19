# SQL1 corrective prompt-review — restricted low delta

Independent read-only Auditor Fable 5. Inspect the exact frozen inputs in `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL1-CORRECTIVE-DELTA-READSET.md` and the preceding valid PASS plus its two low findings. No shell, editing, DB, generation or runtime claim. This is the one bounded low-fix delta review, **not** SQL2 byte review and not a retry of SQL1 REVIEW.

Assess only:

1. TASK0030 final paragraph unambiguously supersedes the historical nonexistent `sql-review-1.*` filenames with actual `review-sql-1.*` REVIEW artifacts and enumerates three exact future `review-sql-2.*` paths plus TASK0028 DB report. Does it keep start of official generation separate from completion, and remain fail-closed until SQL2 PASS and DB PASS on same hashes? No SQL1 REVIEW may count as PASS.
2. TASK0034/35 governed `acceptance_commands` now use existing `test:unit` script, which explicitly sets `DETRAN_TEST_TIER=unit`, retains `--passWithNoTests=false` and exact unit file, matching intent of the already approved prompts. Did anything broaden writes/roles/iterations/locks? Their RED→GREEN evidence should remain read-only history, not re-reviewed technical delivery.
3. Check active TASK0030 PC/hash and compositions historical preservation, task schema, and that the changed files are precisely the two low-fix surfaces plus metadata. If any high unrelated to these corrections is discovered, report it precisely; do not infer a SQL/DB PASS.

Return only native structured JSON Schema output: `mode="prompt-review"`, `round="R-0007"`, verdict PASS/REVIEW/FAIL, `findings`, `notes`. Each finding has severity high/low, item 1–13, existing relative file and one-based line, concrete claim/fix. PASS has no high. No prose wrapper or invented runtime evidence.
