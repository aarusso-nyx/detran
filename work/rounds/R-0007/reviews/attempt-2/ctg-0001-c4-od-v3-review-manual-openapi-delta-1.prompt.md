# C4-OD V3 — independent manual OpenAPI boundary review 1

Role: independent Auditor Fable 5, read-only. This is the single OWNER-authorized
review of the documentary manual OpenAPI path/validation delta, **not** review
of SQL bytes, generated code, database behavior or a future JSON that does not
yet exist. Worktree: `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Read the finite frozen paths in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-MANUAL-OPENAPI-DELTA-READSET.md`
and the matching manifest. The adapter verifies input hashes before and after
the CLI call. You do not run shell, tests, generation, SQL or DB connections;
do not claim independent execution of preflight. Prior PASS decisions belong
to their earlier candidates; unchanged text should receive a new finding
only when this delta creates a concrete contradiction.

Evaluate executable feasibility and the **global active reference graph**:

1. Does the future manual contract have one exact path,
   `docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`,
   outside the generated root-level population, without editing or weakening
   `tools/contracts/generate-openapi.mjs` or `pnpm contracts:check`? Historical
   mentions of the rejected root path must be identified as history, not
   active instructions or writable allowlists.
2. Does the README provide an installed, copy-paste executable, fail-closed
   OpenAPI 3.1 validation that rejects absent/empty/malformed documents,
   structural violations, unresolved refs and missing intake POST/success
   response, returns nonzero on failure, records positive counts and SHA, and
   keeps generated `pnpm contracts:check` as a separate mandatory gate?
   `openapi-typescript` alone or JSON.parse alone is insufficient. Examine
   whether module resolution and cwd/path assumptions are real.
3. Are C4-OD and plan final sections, index, TASK-0029 prompt/planned_files,
   generated allowlist, consumer prompts 0020/21/22/24/25/30, task records,
   compositions and SHA-derived PCs consistent with the new path and gate?
   Future JSON absence must be BLOCKED at dispatch, not a false current PASS.
   There must be no hidden additional tooling permission or arbitrary scope
   expansion.
4. Preserve TASK-0028 and TASK-0029 at checkpoint 1/1, frozen sensor hash,
   role-writer OWNER exception precisely limited, unresolved ownership risk,
   independent review of actual SQL bytes before any apply and full nominal
   TASK-0028 DB PASS before TASK-0030. No worker is dispatched by this review.
   Legal/Clock decisions, F1–F8 and prior sequence-delta PASS are not reopened
   by a path change.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, `verdict` PASS/REVIEW/FAIL,
`findings` array and `notes` array. Each finding requires severity high/low,
item integer 1–13, real relative file and one-based line, concrete claim and
actionable fix. PASS requires zero high findings. Say exactly whether the
documentary boundary is ready for later TASK-0029 resumption, not that the
future contract, SQL or DB tests passed. No prose outside structured output,
no JSON string wrapper and no fabricated runtime evidence.
