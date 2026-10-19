# R-0036 coverage enablement checkpoint

This directory preserves diagnostic observations, not a consolidated scorecard.
No capture here was recorded as a native published-provider reading.

The isolated RAIT prototype passed 4,498 tests, retained 139 TODOs and one
skipped test file, and reported all 191 sources in its explicitly narrower
prototype population. Its observed line coverage was 91.07%. This result does
not represent the monorepo. A separate live reporter probe checked the actual
Vitest lifecycle and produced an exact-commit, full-population digest binding.

The first complete workspace attempt at `4f01e1193d488f7cc8031ec76a6432d062353dab`
exposed two collector regressions: source-inspection tests inherited repository
CWD instead of their standalone package CWD, and retaining all Angular compiler
programs exhausted Node's heap. Its complete transcript and original collector
sources are preserved. These observations are not assigned to product fixes.

The corrected executor supplies package CWD in isolated forks and limits the
compiler-program cache to two entries. The seven existing TEAT mobile production
chrome tests then passed unchanged. Nine collector controls passed, including
rejection of moved candidates, incomplete source populations, filtered runs and
failed package thresholds. A complete replay is still required to validate the
memory repair and collect a usable monorepo report.

The unit census discovers 62 existing Vitest configurations and 569 declared
test files across 56 nonempty package populations. The prior unit wrapper omitted
one nonempty population: `@detran/ops-core` (one file; its script is `test`, not
`test:unit`). The new unit command composes all existing configurations with
coverage explicitly disabled, preserving its separation from the coverage metric.
The package without a test configuration, `packages/api-clients`, still contributes
its implementation sources to the coverage denominator.

Integration and E2E each declare 51 package commands; 30 integration populations
(90 files) and five E2E populations (54 files) are nonempty. Every nonempty
population is already selected by the existing isolated fixture wrappers. Empty
suite commands remain documented as empty, not successful test coverage.

ADR-0045 defines the local source population and its limitations. Existing
package and scorecard thresholds remain unchanged. The source census excludes
six frontend test-setup files in addition to test/spec/declaration files; it
includes generated implementation sources. The declaration and sidecar use
literal exclusion paths admitted by the installed schema, not globs.

DEVAI repair PRs #413 and #415 are integrated. #416 supersedes #414 with the same
population repair plus 2.6.3 release preparation, and is integrated after all
mandatory green checks. The exact release candidate is
`ee085038d16696a0c56822a0530232b598c99e86`; certification remains in progress.
DETRAN still uses published DEVAI 2.6.2 at this checkpoint. Publication, verified
adoption, exact-candidate replay, inventory regeneration and 43-row reconciliation
remain open. No new measured-cell count is claimed.
