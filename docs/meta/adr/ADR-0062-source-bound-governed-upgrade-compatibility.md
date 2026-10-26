---
id: ADR-0062
title: Preserve historical seals across one source-bound governed upgrade
type: adr
status: active
date: '2026-10-23'
authority: Architect
supersedes: []
superseded_by: null
---

# ADR-0062: Source-bound governed-upgrade compatibility

## Status

Accepted by the Architect on 2026-10-23 under the Owner-authorized milestone 1
completion request. Required-green integration and actual delivery validation
remain separate gates; this status supplies no native execution PASS.

## Context and authority

The Owner authorized completion of milestone 1, including governed DEVAI adoption,
while preserving histories, holding PR #211 unmerged and C6 blocked. ADR-0061 and
the authentic registered upgrade implemented that adoption in published commit
`74b9eec83cd10d981f5ec5923c0f82ad7b2c13b5`, parent
`cac88d518bdf430f58575e74309bbcd1658ab6c2`.

PR #224's unchanged historical gate refused `SEALED_BYTES_CHANGED` for
`.devai/config/project.json`. Of the original 1,073 sealed reference paths, exactly
that live configuration and `.devai/pin/constitution.md` changed in this upgrade.
The original snapshot is an authentic historical observation; rewriting its hashes
would lose that history. The registered upgrade also must retain its authentic new
configuration. ADR-0055 remains intact and all its historical findings remain.

## Decision

Add a separate, versioned, finite forward map for this exact published transition.
Keep the original v1 manifest, 1,073-entry preservation reference and baseline Git
objects byte-identical. Validate every original baseline hash, including these two
paths. Only a current mismatch at one of those exact two paths may invoke the new
transition verifier. Every other sealed path keeps the existing strict comparison.

The verifier requires a code-pinned supplemental-manifest identity/digest, the
exact adoption commit and its parent, authentic Git blob identities and SHA256s,
the original baseline and pre-adoption bytes, and the registered upgrade receipt.
Bind all six generated current files to the exact approved adoption Git objects;
verify the receipt's target hashes and provider/constitution transition identities.
Bind ADR-0061 and the Owner decision through their authentic immutable adoption
Git objects rather than accepting a caller's authority string; later legitimate
prose additions do not rewrite those source objects. The current DEVAI dependency
version and constitution pin identity must match the approved transition. Bind the
original package/lock before-and-after Git objects for provenance without sealing
unrelated current dependency metadata.
Reject omitted, duplicate, substituted or unknown entries, forged hashes/identities,
changed current bytes and unregistered future upgrades. There is no caller-provided
waiver, wildcard exception, CLI override or threshold change.

This supplements the historical source-custody check only. It supplies no native
reading, native PASS, retroactive authority, historical repair or C6 activation.
Both proof histories, historical native verdicts, missing-record findings and the
known R-0017 mutation remain untouched. The native verifier still validates new
proof-chain tails. A later legitimate upgrade needs its own reviewed finite map.

In addition to the two original reference paths, activating this finite map binds
these eight current paths that were outside the original reference:

- `.devai/config/adopter-policy-binding.json`
- `.devai/config/authority-policy.json`
- `.devai/constitution.md`
- `.devai/config/upgrade-receipt.json`
- `law/policy/adopter-policy.json`
- `.devai/config/invariant-producers.json`
- `.devai/config/sensor-inputs.json`
- `.devai/config/thresholds.json`

An edit to any of these eight paths, including an eventual separately authorized
C6 activation or new sensor inputs, requires a new reviewed versioned map. This is
an explicit finite scope, not permission to treat those changes as historical
mutation or to approve them automatically.

Integrate this adoption and its supplement with a **merge commit**, never squash
or rebase. The source-bound verifier requires the authentic before/adoption Git
objects to remain reachable in fresh clones. Its full-history checkout requirement
remains the existing historical gate contract; a shallow source cannot supply a
passing custody claim. Preserve both original commits and their ancestry.

## Validation and delivery

Preserve the original CI refusal. Inspector owns tests: retain every existing
assertion, extend fixture input materialization where the new strict verifier needs
authentic sources, and add adversarial tests for omitted/swapped paths, before/after
tampering, forged authority/receipt, and unknown future mutations. No product test
or assertion is changed. Run the full historical/security checks, affected law/ADR
and formatting checks, doctor and required CI. Cross-family review is required.

Implementation occurs in an isolated worktree while the Inspector completes the
separate measurement epoch at `74b9eec8`. No fix, rebase or dependency change enters
that frozen epoch. Its results retain their own source identity; later delivery
commits cannot inherit those results as measurements of a different source tree.

## Addendum — D1-L Gate A, DEVAI 2.8.0 (2026-10-25)

The Owner explicitly approved Gate A scope SHA256
`2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5`
in Codex chat `01a175a6-8a1b-7003-8915-c315e359dca6`. The literal decision is
appended to `docs/meta/decisions/rait.md`; this addendum preserves the original
accepted decision above. Gate B remains held; #211 stays unmerged, C6 blocked
and S3 held. No acceptance criterion, historical result or local work is replaced.

The sole new transition starts at
`7abe89cd3e7049fdcf38b33411d38a3442a0e1e1` in the isolated target
`/Volumes/Development/.codex/worktrees/d1l-devai280-binding/detran`. It applies
the exact approved dependency patch SHA256
`6660c9c905b4c71ee467dc9a92beaaa01bf149c0f4a2b4f4248386e2daad6595`
and the published registered `init upgrade --constitution --as-role architect
--write --format json` transaction. The source is DEVAI 2.8.0 commit
`82ae9d9000d2ed71a7c38f4b3aa8f06bc2eabb2b`, tree
`c12b34faf9f7e1bb0db5d33046c817bd63605f3e`, package SHA256
`d63d2da92427ef8f5e947ca2fd72e14b393caaf6623275e7bffa0b89be15ec59`.
The transition is 2.7.0 to 2.8.0 and Constitution 1.1.0 to 1.2.0. Five planned
updates and the sixth registered receipt are the entire binding effect set.
The authentic command result belongs at
`work/rounds/R-0025/reports/D1-L-280/upgrade-write.json`. No generated binding
output is hand-edited. Any additional effect or proof-record requirement stops
execution; Gate A's proof-record allowlist is empty.

A separate code-pinned v3 manifest at
`docs/meta/security/governed-upgrade-compatibility-v3.json` binds the authentic
adoption commit, its exact parent, all six generated blobs and receipt hashes,
the complete approved package/lock before-and-after objects, and the immutable
Owner, Architect and registered command-result objects. The adoption identity
and v3 digest are derived from actual outputs, never invented fixture values.
The adoption commit must remain reachable through ordinary merge ancestry;
no squash or rebase may replace it.

Verification first validates all original baseline hashes and the authentic v2
transition, including its source objects, authority, receipt and preserved
policy objects. With v3 selected, v2 is an immutable historical link: its old
2.7.0 current-byte assertions become source-object checks, and the finite v3
after-objects alone govern current 2.8.0 bytes. With v3 absent, every original
v2-only acceptance and refusal remains effective. The v1 and v2 manifests, all
original baseline objects, thresholds, sensor inputs and empty C6 bindings remain
byte-identical. Unknown, missing, duplicate or substituted paths, forged
authority or receipts, wrong parents, altered current bytes and missing history
fail closed. There is no caller-selected waiver, override or wildcard.

Only the five reviewed compatibility paths may implement this addition: this
ADR, the v3 manifest, `tools/security/governed-upgrade-compatibility.mjs`, and
the historical and dedicated governed-upgrade test files. Architect, Engineer
and Inspector changes use distinct role sessions. Original v2-only tests and
assertions are retained; new positive and adversarial v3 tests supplement them.
Required affected checks, doctor, historical and security gates retain their
actual outcomes and source identities. Full required CI and cross-family review
remain delivery gates, never implied by this decision or by local checks.

Gate A authorizes no proof-chain or epoch mutation, reconciliation host
provisioning, canonical selection, recovery, proof-index CAS, diagnostic
publication, #211 merge, C6 activation or S3 runtime. Gate B requires a separate
exact Owner decision bound to authentic future target, host, parents, manifests,
index and chain-head identities.

## Addendum — approved schema-corpus amendment (2026-10-25)

The Owner approved schema-only amendment SHA256
`7d1e22ce043959fe99b6a20bf8b57c4947255becfacb70800a46e5020cadace1`
in Codex chat `01a175a6-8a1b-7003-8915-c315e359dca6`, starting from
`12b87fa6833ea19db75f146b80d5e681d2384dd4`. The exact approval is appended to
`docs/meta/decisions/rait.md`.

The first required law-corpus verification after the approved 2.8.0 dependency
change failed with 19 findings. Read-only comparison confirmed the unchanged
local 121-schema corpus matched retained installed DEVAI 2.7.0 exactly; the
published 2.8.0 runtime has 127 schemas, with three changed and six new bodies.
This was an introduced schema-mirror mismatch, not a pre-existing failure. The
original failed observation remains retained; no check or threshold was relaxed.

The approved correction copies the nine enumerated schema bodies byte-for-byte
from the exact published package already bound above and updates only
`law/schemas/manifest.json` to version 2.8.0 and the sorted full 127-schema
SHA256 roster. The three updates are `action-registry.schema.json`,
`authority-policy.schema.json` and `evidence.schema.json`. The six additions are
`evidence-reconciliation-plan.schema.json`,
`reconciliation-inventory-result.schema.json`,
`reconciliation-materialize-result.schema.json`,
`reconciliation-owner-action.schema.json`, `reconciliation-owner.schema.json`
and `reconciliation-proof-index-result.schema.json`. All reside in `law/schemas/`.
The resulting manifest SHA256 is
`788af86f8812e7a2e02523569ceefaf89e7bc1164a61357722212e7bfd5ea86f`.

All ten extra paths are outside the original 1,073 sealed reference paths. The
authentic adoption commit, v1/v2/v3 manifests, code-pinned transition, generated
binding outputs, proof histories and epochs remain unchanged. This adds no
sealed-path exception or handwritten schema semantics. Schema validity grants
no reconciliation capability. Retained required checks and bounded available
shared-control regressions resume without waivers; any further path or effect
requires its own exact review. Gate B remains held, #211 unmerged, C6 blocked
and S3 held. No database or reconciliation-host provisioning, proof-record,
recovery, proof-index CAS, diagnostic, merge or cross-family review authority is
conveyed by this amendment.
