# R-0036 measurement remediation

**Authority:** user continuation, 2026-10-18; BL-0012. Architect for measurement
contracts and adoption, Engineer for tooling, Inspector for tests, Auditor for
observations. ADR-0041 admits verified DEVAI 2.6.2. Product fixes are separate.

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

## Remaining provider boundaries to verify

- Data-model discovery still reads only migrations/db/database conventions; the
  supported input schema has no data-model roots. DETRAN DDL remains canonical at
  backend/database/ddl. Do not mirror it into a conventional directory to disguise
  this limitation.
- The vulnerability sensor's bounded process output can fail on the complete
  dependency audit. Do not omit dependencies or advisories to shrink it.
- Coverage requires an exact-candidate producer binding. Do not label an authored
  aggregate as the package-owned producer or weaken its provenance checks.
- Missing approved performance targets and unsupported native transformations
  remain explicit until evidence or authorized provider changes resolve them.

The user explicitly authorized DEVAI measurement fixes in a separate branch and PR
on 2026-10-18. That exception does not authorize a package release or product fixes.
Other sibling repositories remain read-only. The previous scorecard, reports,
readings and proof prefix are immutable.
