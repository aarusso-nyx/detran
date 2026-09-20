# Independent post-GREEN delivery review — R-0007 CTG-0001 / TASK-0022

You are an independent Auditor Fable 5. Read only the frozen files in
`ctg-0001-final-delivery.readset.md`. Do not execute shell, alter files,
connect to the database, or infer a merge. The report records observed
commands and counts; this review cannot independently reproduce runtime.

Assess whether the delivered candidate satisfies the TASK-0022 gate and
CTG-0001 contract, taking into account prior valid PASS reviews of the SQL,
harness, orchestration, and fixture deltas. Specifically scrutinize the final
ordinary-test isolation, mandatory upgrade-last gate, guarded disposable DB
scope, CI configuration, no weakened tests, current six Clock providers,
immutability and priority rules, and whether the report distinguishes
runtime evidence from review. Distinguish structural blockers from minor
non-structural issues. Do not assess CTG-0002 through CTG-0004 as delivered.

Return only native structured JSON with exactly five keys `mode`, `round`,
`verdict`, `findings`, `notes`: mode `prompt-review`, round `R-0007`, verdict
PASS/REVIEW/FAIL. Findings have severity high/low, item 1–13, an existing
relative file and one-based line, concrete claim and fix. PASS must have zero
high. No prose wrapper.
