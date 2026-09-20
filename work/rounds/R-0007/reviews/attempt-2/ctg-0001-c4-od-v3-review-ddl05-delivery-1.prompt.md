# C4-OD V3 DDL05 — independent delivery review 1

Role: independent Auditor Fable 5, read-only. Review the OWNER-authorized
DDL05 idempotence correction, not the entire C4-OD implementation. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Read every path in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-DELIVERY-READSET.md`
at the exact frozen SHA-256 in the native manifest. The adapter verifies
candidate bytes before and after your call. No shell, code edit, DB connection,
test execution, generation or Git action. The prompt-review PASS is a separate
earlier candidate, not approval of this delivery.

Evaluate specifically:

1. DDL05 SQL syntax and semantics: the sole added `WHERE ROW(...) IS DISTINCT
FROM ROW(...)` compares exactly seven canonical attributes in matching
   order, is null-safe, preserves equal-row `updated_at`, and updates divergent
   rows to existing canonical values. No `created_at`, timestamp, role key,
   other field or catalog-value change causes a write. PostgreSQL target
   relation reference and `EXCLUDED` are valid in this `ON CONFLICT DO UPDATE`.
2. DDL05 original 36 role keys/values, SET assignments, grants, other statements
   and missing-key insertion remain intact. DDL14, role checker, shared roles,
   frozen TASK0028 sensor and both TASK0032 sensors remain unchanged. Check
   whether the static sensor truly exercises the precise intended guard rather
   than a superficial string and whether it is immutable relative to the
   pre-fix RED evidence (4 collected, 3 pass/1 fail, 0 skip; after fix 4/4).
3. Future DB integration sensor meaningfully tests equal, divergent,
   reapplied and missing-row cases; fail-closed exact DB identity and explicit
   authorization; rollback; positive assertions; safe fixture or BLOCKED.
   Distinguish static GREEN from unexecuted PostgreSQL proof. Do not claim
   integration PASS, upgrade PASS or SQL19 review. Identify real defects in
   the sensor that would make its future execution incapable of proving the
   contract. Source-ground DDL14 divergent-baseline limitation.
4. Governance: distinct Architect/Inspector roles, exact one-file DDL
   mutation, owner-authorized tests/ extension, one writer, iteration counts,
   TASK0029 still checkpoint 1/1, no DB apply/seed or retry. The three low
   prompt-review clarifications are operational, not retroactively attributed
   to frozen prompts. Review the candidate rather than optional refactoring.
5. Static preflight evidence is coordinator-reported, not independently
   executed by you: `node --test` 4/4 GREEN, `pnpm verify:role-catalog`
   36 roles PASS, `git diff --check` PASS, hashes in records. Verify whether
   the files themselves support those claims. The SQL delivery PASS would
   permit TASK0029 resumption only under a later dispatch; DB sensor execution,
   SQL19 review and DB upgrade gates remain separately pending.

Return **only** native structured output matching the supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, verdict PASS/REVIEW/FAIL, `findings`
and `notes`. Each finding has high/low severity, item integer 1–13, an
existing relative file, one-based line, concrete claim and actionable fix.
PASS requires zero high findings. No prose outside structured output, JSON
string wrapper, invented DB evidence or claim that TASK0029 resumed.
The schema's fixed `mode` literal is a transport label; this remains a
delivery review of the corrected bytes.
