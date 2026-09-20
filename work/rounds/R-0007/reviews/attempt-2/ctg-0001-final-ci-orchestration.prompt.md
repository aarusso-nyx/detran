# Independent delivery delta review — R-0007 / TASK-0022

Role: independent read-only Auditor Fable 5. Prior SQL/harness/catalog
candidate has valid PASS and the directed destructive upgrade suite passed
18/18. The full aggregate failed because that suite restored the dedicated DB
to fresh/one-case before later tests that require 20 legacy fixtures.

Review the frozen manifest and readset. Assess the new mandatory sequence
unit → exact historical baseline plus normal current DDL → ordinary
integration (upgrade file excluded there only) → E2E → directed upgrade
18/18 last. Verify that package scripts and CI environment make the upgrade
inescapable in backend:test:ci, that all URLs/authorization flags target only
the dedicated disposable DB, that the preflight validates 20 cases/current
schema, and that failures after prep cause mandatory fresh restoration without
masking the original error. Review inclusion/exclusion against Vitest config;
flag any weakened test, missing gate, wrong-target destructive path, or hidden
dependency on a database named detran. No shell, file edit, or DB access.
This review is not a runtime PASS; it precedes the final DB run.

Return **only** native structured JSON with five keys: `mode`, `round`,
`verdict`, `findings`, `notes`; mode `prompt-review`, round `R-0007`,
verdict PASS/REVIEW/FAIL. Each finding: high/low severity, item 1–13,
existing relative file, one-based line, concrete claim and fix. PASS has
zero high. No prose wrapper.
