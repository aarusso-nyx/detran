# R-0042 measurement package

**Partial delivery: two of seven target gaps now measured; five remain blocked by the required DEVAI gate and pending security disposition.** R-0042 and BL-0024 remain active/open. C6 remains blocked.

- [Assessment](assessment.md) and [seven-cell register](seven-gap-register.json).
- [Exact-head partial native scorecard](raw/partial-scorecard-body.json): F3:T1 FAIL, F3:T2 REVIEW, 41 UNKNOWN, two unchanged N/A entries; overall FAIL. This is not a new complete43-cell assessment.
- [Coverage custody](coverage-custody/manifest.json), [task stream custody](task-artifact-manifest.json), [four official emissions and immediate recordings](native/execution-ledger.json).
- [Separate, unimplemented product follow-ups](separate-product-followups.json): two SENATRAN mock assertions failed; cause not yet attributed.
- [Provider gate summary](raw/provider-validation-summary.json) and [local-only upstream evidence manifest](raw/provider-local-evidence-manifest.json). The upstream patch and full traces remain local; no source publication through an alternate route or provider PR/release is claimed.
- [Unimplemented safe review proposal](raw/safe-provider-unblock-proposal.md): a bounded human security review of the Node-loader observation issue, distinct from the withheld C6 prototype. No native security implementation or review retry occurred.
- [Post-record schema checks](validation/schema-validation.json), [preservation](validation/preservation-current.json), [chain verification](validation/chain-after-generic.stdout.log), [native artifact resolution](validation/native-chain-artifact-custody.json), [official generic proof receipt](recording/record-generic.stdout.json).

The original [evidence manifest](evidence-manifest.json) freezes156 payload files and is anchored by the generic proof. [The complete delivery manifest](delivery-artifact-manifest.json) additionally covers later recording/check/index files and excludes itself. Earlier failures, resource interruptions, diagnostics and the previous complete0e26c795 assessment remain preserved. Counts are never combined across source commits.
