# Independent final harness delta review — R-0007 / CTG-0001

Role: read-only Auditor Fable 5. Prior independent PASS covered the SQL
candidate `ba3f2aeb8751059fc3b2378fa14e94fa28c54dc3bcf878b7462ce31fe5f4025f`
and import-only delta `8735042658ae7337139ccd9d6a21cdf2b0200d9f943364e93dfff2d51187bbd0`.
The only newly changed reviewed source is
`backend/database/tests/prepare-rait-priority-v1-baseline.mjs`, from SHA
`b85c5ecf57f36a98f9e2fddb008f131780b1b4638cf0942628992fe30034024e`
to SHA `cf408da4f766d7433c28c5a7f2a7e8fc6e7c7ad5c1f5c3d48fa6580fb1dbaaa5`.
The failed directed run stopped before upgrade SQL, after resetting only the
authorized disposable `detran_r7_ctg1_a2` DB to historical baseline.
The parameter update rolled back because JSONB key order differed from
JavaScript object insertion order. No upgrade PASS is claimed.

Inspect frozen readset and manifest. Assess semantic JSONB comparison,
explicit restore authorization before reset, reset marker timing, mandatory
restore after any post-reset failure, error preservation, and whether new
behavior can cause unauthorized or wrong-target destructive action. Confirm
sensor and SQL hashes unchanged from prior PASS. This is a targeted delta
review, not a repetition of the older intermediate gate. Do not execute shell,
edit files, or connect to DB.

Return **only** native structured JSON with the five schema keys: `mode`,
`round`, `verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`, verdict PASS/REVIEW/FAIL. Finding fields must be
severity high/low, item 1–13, existing relative file, one-based line,
concrete claim and fix. PASS has zero high. No prose wrapper.
