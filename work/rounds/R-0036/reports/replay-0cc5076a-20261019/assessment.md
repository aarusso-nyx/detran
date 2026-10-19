# R-0036 published-provider replay checkpoint

At clean evaluated commit `0cc5076aa89b160c8a3364ed80d30fd4583d6244`,
DEVAI 2.6.3 observed 37 dependency vulnerabilities (5 critical, 15 high,
13 moderate, 4 low), yielding native FAIL. This resolves the observation failure
for that dependency-scan predicate, not the separate product finding BL-0013.

Coverage production failed without a usable report. Inventory regeneration also
failed: the declaration included historical database test fixtures alongside
current DDL, duplicating `auth.role_catalog`. Both failures and the security
reading were persisted through sense record. Their exact canonical reading bytes,
captures, record receipts and criterion references are retained here. The prior
202 proof records remain unchanged and three records were appended.

Subsequent dirty-tree diagnostic probes are explicitly partial, not native
readings or full-suite evidence. Compact patterns retained the 2,574-source
census. Deduplicating 1,132 automatically repeated exclusions to 31 distinct
patterns allowed report generation without a heap abort. The next probe exposed
nine missing BOAT sources: its library tsconfig had been treated as an application
config. Selecting its actual library config restored all 2,574 sources. The final
single-file probe passed its eight assertions and then deliberately failed the
unchanged SENATRAN mock coverage threshold, since that package's suite was not
selected. This verifies a guard; it is not a product failure or monorepo coverage.

The corrected declaration selects `backend/database/ddl` and
`senatran-mock/database/ddl`: 82 current SQL files and 361 CREATE TABLE entries
in a supplemental parser diagnostic. `backend/database/tests/fixtures/` and
seed SQL are excluded from current schema discovery; migration and fixture tests
still execute separately. A fresh clean-commit native replay remains required.
No consolidated 43-cell result or new overall measured count is claimed.
