# ADR-0039: DEVAI 2.2.0 and STYNX 1.5.3 adoption

## Status

Accepted under the Owner instruction of 2026-10-08 to update DEVAI and STYNX to the latest published versions.

## Decision

Pin DEVAI 2.2.0 and every STYNX dependency to 1.5.3, verified against the authenticated GitHub Packages latest tags. Regenerate blueprint-owned manifests from tools/stynx-version.json. This dependency update does not claim completion of R-0022 or its product migrations.

Use the installed DEVAI binding boundary: establish the 1.6.0 migration baseline, then init upgrade to 2.2.0 with Constitution 1.0.2. The Architect reviewed the constitutional amendments to Article 6 (explicit additive path classes) and Article 18 (optional external mutation hardening). Preserve docs, repository classification and the fail-closed attested RC policy by declaring their existing values in law/policy/adopter-policy.json before rebinding. Regenerate the trusted verifier from the package. Copy the installed canonical schema roster byte for byte into law/schemas and refresh its versioned SHA-256 manifest. Extend the local proof checker to distinguish the historical-gap epoch from generic, require physical-byte anchor identities for it, and leave payload/cutoff validation with the installed verifier in the same required gate.

## Historical gap

The Architect authorizes one historical-gap declaration under upstream ADR-EVI-0002 for exactly the orphaned entries observed at the first cutoff in record/proofs/anchor-baseline.json. Its payload lists each canonical path, physical sequence and SHA-256. The missing direct anchors are acknowledged, never repaired retrospectively; their original cause is not established. Historical proof lines and the legacy evidence chain remain unchanged. The new declaration is recorded only through devai evidence record.

## Validation

Installed package resolution, generated consistency, pnpm check, build, DEVAI doctor and chain verification must be evaluated on this candidate. Failures remain explicit; this decision does not authorize publication or integration into main. Active stacked rounds must merge the resulting dependency update before continuing and rerun their characterization.
