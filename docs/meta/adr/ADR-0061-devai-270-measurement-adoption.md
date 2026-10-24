---
id: ADR-0061
title: Adopt published DEVAI 2.7.0 for milestone 1 measurement
type: adr
status: active
date: '2026-10-23'
authority: Architect
supersedes: []
superseded_by: null
---

# ADR-0061: Adopt published DEVAI 2.7.0 for milestone 1 measurement

## Status

Accepted by the Architect under the Owner's express request to finish milestone 1
attestation, governed DEVAI adoption and reassessment, retaining PR #211 unmerged,
C6 blocked and histories preserved. Registered binding and final acceptance require
the actual receipts and validation below; this decision supplies no execution PASS.

## Release and amendment review

Adopt exact registry package 2.7.0, integrity
`sha512-nRLnRarjaaPzmq3zJKIEwOPcuAW6F915wGG/Od3dhdHK+M7WWVmOctDLfamHQpBGgra7eLEQUEaSDF7/ooDR7A==`,
from published source ff8accd83c912d02d17df80eccbe147aafd082e3, containing #424's
5034e0ccc7a0af573c3d0af068c6c2b263d71ffe ancestry. Engineer's metadata diff changes
only DEVAI's exact package/lock identity; all non-DEVAI lock nodes and snapshots
remain unchanged. No source checkout dependency or unreleased 2.6.4 installation.
The 2.6.4 identity migration is a cumulative entry shipped in the released 2.7.0.

The Architect reviewed the complete package Constitution 1.1.0 against pinned 1.0.2:
Article 6's test-path row/extension and Articles 7/10 introduce only the bounded
Engineer focused-regression verb. It may add tests targeting a source changed in
the same task and modify tests that task added; no existing assertion change,
test deletion or lowered threshold is permitted. Independent-assurance withholds
that verb. All other constitutional content is unchanged except version metadata.
The installed constitution SHA256 is
`8353c3b81d38e0f9b913cbeb6762bc149605989c1b16f52d2c63ba9892f71270`.
This satisfies the manifest's required Architect review before registered binding.
Inspector remains the sole test-execution/reading owner for this reassessment;
no Engineer test editing or assertion/threshold change is commissioned here.

## Registered migration boundary

The official `init upgrade --constitution` dry plan is ready with no refusals,
retired keys or replaced defaults. Execute `devai init upgrade --target .
--constitution --as-role architect --write` only through the published CLI. The
five planned materializations are `.devai/pin/constitution.md`,
`.devai/constitution.md`, `.devai/config/project.json`,
`.devai/config/adopter-policy-binding.json` and `.devai/config/authority-policy.json`.
The sixth expected tracked effect is the machine-written
`.devai/config/upgrade-receipt.json`. Preserve its authentic bytes and capture
CLI stdout/stderr outside the repository. The binding journal is transient: on
success `.devai/config/adopter-policy-binding.journal.json` and staged temporary
files must be gone. A remaining journal/staged file is an interrupted bind; stop
and diagnose without copying or hand-authoring it. Compare all six tracked
effects against this boundary. No
canonical adopter policy, sensor input, task descriptor or threshold change is
expected or authorized. Unexpected effects stop dependent execution for diagnosis.

DEVAI 2.7.0's native reporter identity/configuration fixes do not grant C6 service
custody, U1/B1 recovery, a new proof-chain/index boundary or #211 merge authority.
Keep all nine C6 bindings empty under ADR-0057. Native capture runs only under its
existing exact actual runtime; RC remains under Node 24.15.0/pnpm 9.15.0. Do not
substitute identities, modify guards, replace the native dependency graph or
change the trusted verifier to make either run.

## Measurement and preservation

Continue R-0042/BL-0024 through supported verbs. Freeze/publish an exact clean
candidate after allowed adoption/configuration; validate and record every sensor
emission immediately, including required second passes, then compose the native
scorecard. Preserve the complete populations, original seven task descriptors,
all thresholds, F1:T1/F4:T5 N/A, both proof histories and closed-round bytes.
The existing raw wrapper logs may retain the ignored historical R-0036 path as
already allowed in R-0042's plan. Any diagnostic or receipt copied from that
historical path must identify its actual origin; it does not reopen R-0036. All
new runtime records belong to active R-0042.
Do not invoke the old evaluator hardcoded to closed R-0036 or mix source SHAs.

Supply the 43-applicable-cell register/two N/A, native scorecard, input/reading/
receipt manifest, baseline comparison, actual limitations and separate remediation
backlog. Existing FAIL/REVIEW and measured negative results are valid outcomes;
missing evidence remains a gap. No product repair, legal fact, permission expansion,
C6 retry/activation, closed-round reopening, upstream write/release or operational
readiness is inferred. Adoption and reassessment use PR-only integration with
required-green checks and independent review.

## Adopter-owned schema-copy compatibility

The post-bind law-corpus check found copied campaign/task schemas still at the
prior package bytes. This is separate from the successful six-file registered
migration; no unexpected generated write occurred. The Architect reviewed the
package diffs: only optional boolean independent_assurance declarations were added
to campaign/wave and task, withholding the focused-regression verb when true.
Existing records remain valid and no task/campaign instance or assertion is changed.

Under the existing Architect-owned law-schema copy contract, synchronize exactly
`law/schemas/campaign.schema.json` and `law/schemas/task.schema.json` byte-for-byte
from the verified installed package. Refresh the same-roster `law/schemas/manifest.json`
version/hashes to 2.7.0; no schema is authored or relaxed locally, no roster member
added/dropped, and no generated record/config/pin is manually changed. Verify the
complete law corpus and independent delivery review before freezing. Preserve the
original mismatch log as an observed compatibility gap.
