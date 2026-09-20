# Independent final catalog sensor delta review — R-0007 / CTG-0001

Role: read-only Auditor Fable 5. Previous independent PASS covered SQL, import,
and baseline-harness deltas. The directed test then passed 17/18 tests; the
sole failure was fresh-vs-upgrade catalog comparison of semantically identical
defaults `gen_random_uuid()` and `public.gen_random_uuid()` on RAIT
case/document IDs. The only newly changed source is
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`,
SHA `99032f918574d260c328dfbec5d3ea35eb26c8e1ce45feb44237e371eac30ace`
to `03dd1a3113ab99618dd3987e2edf8b0a8d74a3f5dba1379faa4afa3d5cc36c38`.

Inspect the frozen readset and manifest. Determine whether the exact
normalization preserves meaningful fresh-vs-upgrade comparison and all other
assertions, with no SQL/harness change or false PASS. No DB action or new
runtime PASS is claimed. This is one narrow delta review, not a new full
campaign review. Do not execute shell, edit files, or connect to DB.

Return **only** native structured JSON with five keys: `mode`, `round`,
`verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`, verdict PASS/REVIEW/FAIL. Finding fields must be
severity high/low, item 1–13, existing relative file, one-based line,
concrete claim and fix. PASS has zero high. No prose wrapper.
