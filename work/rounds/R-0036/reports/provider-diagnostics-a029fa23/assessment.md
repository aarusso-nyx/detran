# R-0036 provider population diagnostics

Candidate a029fa23011f0f39a43fe4df781c34718fef62a6. All observations in this directory use unpublished
provider candidates and remain diagnostic only. No reading from these captures
was recorded as published-provider scorecard evidence.

Source discovery now measures 3079 TypeScript source files, 538 directories,
and the 63 child workspace packages. The nested SENATRAN documentation site
is explicitly outside the package test-coherence population. The source census
selects existing src directories under backend, apps, packages and senatran-mock;
the package roots come from the frozen package inventory. Specification discovery
walks every documentation directory in the governed documentation census, and
PII discovery walks both actual SQL trees. The full selected populations are
retained in population.json and command arguments.

Observed predicates: alignment REVIEW (12.54% reverse claims; threshold 80%),
depth PASS (p95 412 lines; unchanged 500/1000 thresholds), coherence PASS,
test coherence REVIEW (23 packages below the original minimum ratio). Security
and robustness specifications FAIL because the existing registered predicates
found no normalized signals/targets in those explicit populations. This does
not assert that no security or error-handling behavior exists in the product.

The push/main CI population is now verified: 92 runs, 90 successful, 97.83%
success, zero flaky runs. Health and robustness PASS; performance remains FAIL
at median 1684 seconds and p95 2280 seconds. No sample minimum, observation
window or threshold was relaxed, and no successful CI result certifies the
application candidate.

Publication/adoption, exact-candidate replay, coverage provenance, complete
inventory regeneration and 43-row reconciliation remain required.
