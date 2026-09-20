# C4-OD V3 — independent sequence-delta review 1

Role: independent Auditor Fable 5, read-only. This is exactly one OWNER-
authorized substantive review of the documentary dependency correction; it
is **not** the later independent SQL-byte review. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Read the finite frozen paths in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SEQUENCE-DELTA-READSET.md`
and the manifest `ctg-0001-c4-od-v3-review-sequence-delta-1.manifest.json`.
The adapter verifies all hashes before and after the CLI call. You do not
run shell commands, tests, generation, SQL, or database connections; do not
claim you independently recomputed hashes or observed runtime PASS. Prior
review-2 was PASS on its earlier candidate; do not reuse that verdict for
these changed bytes. Findings on unchanged text require a concrete canonical
contradiction caused by this delta.

Evaluate the exact sequence and executability, not just prose consistency:

1. TASK-0028 remains 1/1 checkpoint; current static pre-SQL RED is one real
   FAIL with eight DB tests filtered and zero DB connections, **not** full
   DB RED/PASS. Missing fresh-versus-upgrade and unknown-string legacy
   sensors must be authored before SHA freeze, within the same allowlist and
   without a new iteration. The same sensor must work before and after the
   three real SQL files exist; synthetic SQL is confined to static copy.
2. Only after this delta receives valid PASS, sensor is complete/frozen,
   static RED reproduced and dedicated DB identity/isolation verified may
   Architect Astra/Medium prepare TASK-0029 in its enumerated allowlist.
   Official blueprint generation may produce DDL34 and 85 listed outputs;
   there is **no** DB apply, seed or DB-test PASS in preparation.
3. Freeze actual SQL19/DDL34/apply and consumed DDL hashes. Independent SQL
   review of exact bytes is mandatory **before any DB apply**, including
   a harness subprocess. This current documentary review is not SQL review.
4. Then TASK-0028 runs all DB scenarios on the same reviewed candidate:
   upgrade preservation and repeat, phase/deferred-COMMIT rollback, locks,
   grants, hardening, immutability, unknown legacy string, and fresh structural
   equivalence with upgrade snapshot preserved before destructive `--full`.
   Dedicated disposable `detran_r7_ctg1_a2` is OWNER-authorized; no other DB
   or global role mutation is authorized. SQL-only `SET LOCAL ROLE
role_app_backend` with non-superuser/non-BYPASSRLS checks is not an app
   authentication claim. Flag a deadlock or impossible fixture/clone/restore
   workflow rather than assuming it away.
5. TASK-0030 and later require full nominal DB PASS on exact reviewed SQL
   plus prior V3 gates. `upstream_task_id` alone cannot encode or waive the
   staged acceptance gates. Check task records, compositions, prompt SHAs,
   limits and allowlists match the index, and no cycle or silent reset arises.
   F1–F8 and OWNER legal/Clock decisions remain untouched.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings` array and `notes` array. Each finding requires severity high/low,
item integer 1–13, real relative file and one-based line, concrete claim and
actionable fix. PASS must have zero high findings. State precisely whether
the delta is ready for subsequent sensor completion and eventual preparation,
not that TASK-0029 has been dispatched, SQL exists, DB tests passed, or the
campaign has merged. No prose outside structured output, no JSON string
wrapper, and no fabricated test/DB claims.
