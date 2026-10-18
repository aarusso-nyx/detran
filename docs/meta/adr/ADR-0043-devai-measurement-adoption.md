# ADR-0043: DEVAI 2.6.2 for scorecard measurement remediation

## Status

Accepted by the Architect under the user's 2026-10-18 instructions to resolve
measurement gaps, preserve thresholds, keep product fixes separate, and adopt the
latest published DEVAI.

## Decision

Adopt exactly `@aarusso-nyx/devai@2.6.2`, published as
[v2.6.2](https://github.com/aarusso-nyx/devai/releases/tag/v2.6.2). The registry
tarball SHA-256 is
`24e93439df378ba8b9a619dfb3e1248238b80de24c649935e19d4fc2ddd9036a`, identical
to the release asset. The package's threshold values equal the currently bound
values. Use `init upgrade` and `init bind --adopter-policy`; never edit generated
configuration or installed dependencies directly.

Amend only ADR-0039's DEVAI version selection. Keep STYNX 1.5.3, Constitution
1.0.2, product code, assertions, deadlines, permissions, N/A declarations and
thresholds unchanged. Refresh canonical schemas from the installed package when
required by the corpus gate. Preserve historical proofs and legacy evidence.

Bind adopter-owned sensor inputs through the supported `sensor_inputs` projection.
Use Angular route discovery and exact reviewed task bindings for commands that
need them. Native execution provenance and complete population requirements must
remain enforced. A successful install, task, or diagnostic result cannot confer
execution standing or make an incomplete population fully measured.

R-0036 remediation is measurement work. New product defects become separate
findings. Unsupported native populations and missing approved targets remain
explicit until supported evidence exists; no authored test roster, wrapper,
threshold change or remapping of verdicts may conceal them.

## Validation

Verify package identity, upgrade receipt, doctor, bound input digests, unchanged
threshold/N/A/legacy bytes, affected law and tooling tests, canonical schema
corpus, state indexes and the append-only evidence chain. Rerun the 43-cell
assessment on a new frozen candidate, starting with the 11 blocked cells. Keep
the previous assessment immutable and report measurement progress separately
from PASS counts. Publication, merge and deployment are outside this change.
