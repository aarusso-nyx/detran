# Independent import-resolution delta review — R-0007 / CTG-0001

Role: read-only Auditor Fable 5. The prior valid independent PASS covered
candidate `ba3f2aeb8751059fc3b2378fa14e94fa28c54dc3bcf878b7462ce31fe5f4025f`.
The only changed reviewed source is
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`,
old SHA `63c419bb2edde6b5eb62dd9ec22e4a54c43a558ae32abc4124ea7ed386f6b00e`,
new SHA `99032f918574d260c328dfbec5d3ea35eb26c8e1ce45feb44237e371eac30ace`.
The change is the `legacyBaselineHarness()` dynamic import, now using an
absolute URL derived from `import.meta.url`; no SQL/harness bytes changed.

Inspect the frozen readset and new manifest
`work/rounds/R-0007/reviews/attempt-2/ctg-0001-final-upgrade-import-delta.manifest.json`.
Verify the URL resolves to the actual test-only module under `backend/database/tests`
in Vitest, that no assertions or gates have been weakened, and that unchanged
SQL/harness still match the prior PASS manifest. This review is limited to
the import delta and does not re-review the older intermediate gate. No DB
operation has run; no runtime PASS is claimed. Do not execute shell, edit
files, or connect to DB.

Return **only** native structured JSON with the five schema keys: `mode`,
`round`, `verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`, verdict PASS/REVIEW/FAIL. Finding fields must be
severity high/low, item 1–13, existing relative file, one-based line,
concrete claim and fix. PASS has zero high. No prose wrapper.
