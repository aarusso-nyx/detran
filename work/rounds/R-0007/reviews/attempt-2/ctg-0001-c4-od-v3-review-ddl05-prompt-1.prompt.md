# C4-OD V3 DDL05 — independent prompt review 1

Role: independent Auditor Fable 5, read-only. This is the mandatory first
prompt-review of a new, OWNER-authorized, narrowly scoped DDL05 idempotence
cycle before any worker dispatch. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Read the finite frozen paths in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-PROMPT-READSET.md`
and its exact manifest. The adapter checks every SHA before/after your call.
No shell, code edits, tests, generation, SQL or DB connection; do not claim
independent execution of preflight. Earlier Fable reviews belong to earlier
candidates and do not substitute for this prompt review. Assess the three
proposed tasks and their dependencies, not hypothetical output quality.

Check specifically:

1. OWNER authority is exact: DDL05 updates only if seven canonical fields
   actually differ. Identical rows preserve `updated_at`; divergent rows
   update to existing canonical values; no role/seed/catalog-value change,
   DDL14 edit, frozen TASK0028 sensor edit, workaround restore, or DB apply.
2. Role separation is legal: Architect defines reference; Inspector authors
   tests before fix; Architect owns manual `0x` SQL by its actual manual,
   whereas Engineer-backend lacks DDL authority. One global writer and
   `MOD-role-catalog-ddl` lock, exact enumerated allowlists, valid task schema,
   no cycle or TASK0029 reset. Gate PASS precedes all workers.
3. Test plan can produce a genuine static RED on current DDL05 and static
   GREEN after only intended SQL change, with positive collected counts and
   frozen test hashes; future PostgreSQL sensor covers identical/divergent/
   repeat/missing-row cases with rollback and fail-closed DB identity. No
   current DB execution or dynamic PASS claimed. DB sensor missing URL is
   BLOCKED, not skip/PASS. NULL-in-NOT-NULL fixture is forbidden.
4. Commands exist or are accurately marked future. Review repo module
   resolution for `pg`, Node test naming/execution, static sensor limitations,
   `pnpm verify:role-catalog` scope, and whether SQL review after static GREEN
   and before any DB apply can actually be staged. No test/gate is weakened.
5. Source-grounded precondition for DDL14 divergent legacy is explicit
   without fabricating a policy; ownership risk and role-writer decision of
   the larger C4-OD pipeline remain pending and untouched. Budget window19
   estimate fits 640k checkpoint; no unlimited retry/reservation is implied.

Return **only** native structured output matching supplied JSON Schema:
`mode="prompt-review"`, `round="R-0007"`, verdict PASS/REVIEW/FAIL,
`findings` and `notes`. Each finding: high/low, item integer 1–13, real
relative file, one-based line, concrete claim and actionable fix. PASS has
zero high. No prose outside structured output, JSON string wrapper, invented
runtime evidence or claim that TASK0029 has resumed.
