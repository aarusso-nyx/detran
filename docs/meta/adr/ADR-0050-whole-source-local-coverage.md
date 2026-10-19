# ADR-0050: Whole-source local coverage for the scorecard

> **Proveniência.** Renumerada de `docs/meta/adr/ADR-0045-whole-source-local-coverage.md` em R-0036 (PR #202), pela política da
> [ADR-0035](ADR-0035-adr-numbering-policy.md).
> ADR-0045 permanece com o contrato RAIT já integrado à main (a006b039). Esta renumeração pertence à reconciliação de R-0036 / PR #202.
> O texto abaixo da linha horizontal é o original, byte a byte, inclusive o título com o número
> antigo.

---

# ADR-0045: Whole-source local coverage for the scorecard

## Status

Accepted by the Architect under R-0036's authorized measurement-enablement scope.
This is an operational measurement contract, not a product or release gate change.

## Decision

Use DEVAI's governed local coverage producer interface for a declared `local`
population. Compose the existing unit/default Vitest configurations of every
workspace package, discovered from `pnpm-workspace.yaml`. Retain their setup,
aliases, assertions and test timeouts. A package without a test configuration
still contributes its implementation sources to the coverage denominator.

The source population includes TypeScript implementation files under all actual
workspace source roots, including the SENATRAN mock's app and domain roots.
Specification/test files, declarations and the six frontend test-setup files are
excluded explicitly. Generated implementation sources remain included. Unexecuted
implementation files must appear in the report with their observed zero coverage;
silently omitted or unexpectedly added files invalidate the population binding.

The database-backed integration, E2E, real and in-house suites remain separate
measurements. Root/tooling tests also remain separate from this product-source
population. The sidecar names these exclusions. A complete local run is never
represented as RC coverage, exhaustive test execution or production readiness.
Historical reports retain their original populations and are not rewritten.

Preserve all existing scorecard thresholds. Preserve existing package coverage
thresholds independently over their original include/exclude populations, so a
high aggregate cannot conceal a package threshold failure. The SENATRAN mock's
70/60/70/70 limits therefore remain enforced; the native scorecard retains its
own installed 80/50 line-coverage verdict boundaries.

For Angular sources, apply the existing JIT transformation through TypeScript's
emitter and retain its map to original source positions. This affects only the
coverage test configuration. Ordinary app configuration and product behavior
remain unchanged. Limit collector workers to two without increasing test timeouts.

Bind a valid sidecar to the exact evaluated commit, actual test-file population,
complete source census and report digest. Filters, shards and incomplete execution
must be identified as partial. Failed tests, missing files, report-generation
errors or failed package thresholds must never produce an accepted full binding.
Emit exact per-file line counters (`l`) using Istanbul's `getLineCoverage`, while
preserving the original V8 report and statement counters. This is an admitted
sensor input format: without `l`, DEVAI approximates lines with statement hits.
Bind the normalized report digest and retain the original report digest, library
version and method in the sidecar. Existing package gates still use their original
Istanbul summaries. No threshold or verdict is rewritten.
Native verdicts are emitted and persisted only through the installed DEVAI actions.

## Evidence and follow-up

The isolated RAIT prototype passed 4,498 existing tests and retained its skips and
TODOs. Its report contained all 191 sources in that narrower prototype population,
with original instruction positions checked. It is diagnostic evidence for the
collector, not a monorepo coverage reading. The complete workspace collector has
separate negative controls for omitted sources, partial runs and package thresholds.
Adoption, exact-candidate execution and evidence recording remain required.
