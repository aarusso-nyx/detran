# ADR-0046: DEVAI 2.6.3 measurement repairs

## Status

Accepted by the Architect under the Owner's explicit authorization to integrate
the DEVAI measurement repairs after green checks, publish 2.6.3 and adopt it here.
Supersedes only ADR-0043's DEVAI version selection.

## Decision

Adopt exactly `@aarusso-nyx/devai@2.6.3`. Its registry tarball matches the
[canonical release](https://github.com/aarusso-nyx/devai/releases/tag/v2.6.3)
and the protected rehearsal byte for byte, with SHA-256
`a4187cec8003f539354fdc257f31e3d40e3c288eb73c692cacf0baf5032e6c21`.
The release source is `ee085038d16696a0c56822a0530232b598c99e86`.

DEVAI #413 supplies declared SQL migration roots and complete audit output;
#415 verifies observed push-branch identity; #416 supersedes #414 with the
monorepo population repair and release preparation. Mandatory PR checks passed.
[Rehearsal 39190575668](https://github.com/aarusso-nyx/devai/actions/runs/39190575668)
passed, including fresh Linux adoption, before the annotated tag was signed.
[Publication 39191295262](https://github.com/aarusso-nyx/devai/actions/runs/39191295262)
promoted the retained assets and verified the registry mirror. The trusted
verifier stayed at 2.4.0 and the approved process-control commit stayed unchanged.
Pages deployment was disabled.

Use registered `init upgrade` and `init bind --adopter-policy` operations. Bind
explicit actual source, package, specification, SQL and test roots from the
workspace census. Refresh the canonical schema corpus from the installed package.
ADR-0045 defines the whole-source local coverage population; it does not claim RC
coverage. ADR-0044 retains the separately authorized initial performance baseline.

Keep STYNX 1.5.3, Constitution 1.0.2, thresholds, N/A entries, assertions,
timeouts, public APIs, tenant/RLS behavior and product code unchanged. Preserve
historical observations, the governed proof prefix and the legacy evidence chain.
Framework adoption and successful commands do not establish measurement adequacy
or readiness. Native FAIL remains a valid result when supported by complete evidence.

## Validation

Verify package identity, registered upgrade/bind receipts, input/schema digests,
doctor, affected checks and preserved control hashes. Freeze a new evaluation
commit after configuration, execute and persist both measurement passes, then
reconcile all 43 applicable coordinates plus the two existing N/A entries.
Report actual measured items separately from blockers and product findings.
