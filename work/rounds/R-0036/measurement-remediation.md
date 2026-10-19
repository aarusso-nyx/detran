# R-0036 measurement remediation

**Authority:** user continuation, 2026-10-18; BL-0012. Architect for measurement
contracts and adoption, Engineer for tooling, Inspector for tests, Auditor for
observations. ADR-0043 admits verified DEVAI 2.6.2. Product fixes are separate.

## Sequence

1. Upgrade through registered verbs, refresh canonical schemas, and bind the
   complete sensor input source. Verify original threshold, N/A and legacy bytes.
2. Resolve blocked command measurements with exact reviewed task bindings. Compose
   existing app lint configurations without relaxing their rules. Preserve all
   original suite configs, assertions and timeout values. Fixture tasks create
   their own loopback-only PostGIS and mock, and remove them in `finally`.
3. Freeze the measurement configuration. Regenerate inventory, execute the
   canonical sweep and required write-capable members, record both passes, and
   compare all 43 cells against the immutable first assessment.
4. Native measurement adequacy must be established by the actual population and
   provenance, not merely a new non-UNKNOWN verdict. Capture measurement errors
   separately from genuine product/test failures.

## Provider boundaries and current validation state

- DEVAI #413 adds declared SQL migration roots and complete vulnerability output;
  #415 verifies the observed push branch; #416 supersedes #414 with explicit
  monorepo populations and 2.6.3 release preparation. All were integrated only
  after mandatory green checks. Their published-provider replay remains required.
  DETRAN DDL stays at its canonical paths; no mirrored population is introduced.
- Coverage requires an exact-candidate producer binding. ADR-0045 declares the
  whole-source local unit population, including untested implementation files,
  while integration and E2E remain separate measurements. This changes the
  original proposed RC population explicitly; it does not establish RC coverage.
  Existing package thresholds and native scorecard thresholds remain unchanged.
  The first full collector attempt failed; the repaired collector still needs
  complete replay. Diagnostic evidence is retained in
  `reports/coverage-enablement-20261018/` and is not a native reading.
- The user authorized defining generous performance targets and a suite.
  ADR-0044 records the request-path baseline. Replay on the final evaluated
  commit remains required; a previous run is not current-candidate evidence.

The user explicitly authorized DEVAI measurement fixes in a separate branch and PR
on 2026-10-18, then authorized integration of #413/#414/#415 after required green
checks, publication of 2.6.3 with those repairs, and adoption in DETRAN. #416
preserves #414's repair on current main without a force-push or merge commit.
This narrow sibling exception does not authorize product fixes or Pages deployment.
The release must pass the complete protected rehearsal before tagging, publication
and registry identity verification. Until those finish, DETRAN stays on 2.6.2.
Other sibling repositories remain read-only. The previous scorecard, reports,
readings and proof prefix are immutable.
