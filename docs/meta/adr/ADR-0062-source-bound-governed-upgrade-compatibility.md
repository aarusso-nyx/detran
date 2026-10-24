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
