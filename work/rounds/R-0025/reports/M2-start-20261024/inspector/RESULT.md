# Inspector M2 diagnostic-only validation

Article 7 Inspector. Read-only source inspection; external evidence only.

Static scope **PASS** on main-based HEAD `b796e2e07bbb08c2f3fec25a4efe31e136bfd59e`:
- Exactly one 22-line / 812-byte insertion in `.github/workflows/ci.yml`.
- Inserted block is identical to approved PR211 `9b2a190a` bytes and the Owner-approved packet.
- Removing that block reproduces all original workflow bytes. Existing job condition, smoke commands, nonzero failure propagation, cleanup `always()` condition and timeouts therefore remain unchanged. New diagnostic step has `if: always()` and no continue-on-error.

Current supported-shell syntax/behavior validation **BLOCKED**: host `/bin/bash` is GNU Bash3.2.57, which rejects the approved `[[ -v ]]` syntax (exit2). All supplied existing modern-Bash paths were absent. This is an unsupported local interpreter diagnostic, not evidence of failure on the Ubuntu target. No installation or container was launched.

Exact current shell SHA256 `9b83d4ba4d783acb48ec4b3148d988cbb03a7cfed539f039a1d602e253470673` matches the preserved October23 modern-Bash harness PASS. That historical receipt covers shell syntax, nine unset/empty/explicit state/TMPDIR directory selections, present and missing sanitized reports, suppression of unrelated sentinel files, and simulated independent step exits `[1,0,0]` retaining aggregate failure1. Its runner semantics are simulated, not live CI; these cases were **not rerun today**. Authentic historical files retained byte-for-byte with source paths/hashes.

No build, native test, service, local stack, install, manual CI dispatch, index refresh, source edit, proof append, reset, merge or process intervention was performed. STYNX heavy window respected. Actual manual stack diagnostic remains pending root scheduling/authorization and candidate attribution. No stack-health or feature-completion claim. PR211 remains unmerged and C6 blocked.
