# Approved finite provenance compatibility — 2026-10-24

Engineer. The Owner approved the exact four-file patch proposed in PR #228 at `9e60f2e71a8f975a15ca405c1394993ef37dffb1`: “Approve the exact four-file patch”. The [complete question and reply](owner-approval.json) supply the bounded extra-path approval required by the original S2 packet. Earlier preparation reports remain historical; this receipt supplements them.

The ADR renumber planner and state-index checker now recognize an exact origin within the initial quoted provenance block, ending at its required separator. This preserves multiple genuine origins while rejecting body-only provenance, malformed boundaries, redirect chains and nonmatching references. Existing assertions are unchanged. This operation does not renumber an ADR or reconcile source histories.

## Source and acceptance evidence

[Source binding](source-binding.json) records base main `1c17bd37ceeb8f13eeae671987d2f0439aadafca`, Inspector test commit `c0964728341936f4cac30484eefc20ee6f75a047`, and validated Engineer source `46234ef9bc405cdc13ca3aaacda816faf4e2f22f`. The four-file zero-context diff is exactly the approved 9,519-byte patch, SHA256 `a82d114e560c3d09a1731ac2c746f603128b69f559479344aafc53350839c2bf`. All four outputs match archived source `68084d5b5d0d5ce9d0b81d6a4f7b618b4b08c871`; no other runtime path changes.

Inspector first retained the exact 18 new vectors against unchanged helpers: 14 PASS and four deliberate RED counterexamples. Engineer then applied the two exact helper changes. Inspector GREEN passed 18/18 focused cases and the entire existing affected three-file suite: 122 PASS, zero failures/skips/cancellations/todos. State-index passed (63 ADRs, six redirects, 45 rounds, 27 closures). Renumber dry-run passed with zero pending and nine REVIEW entries retained. These results validate the named source, not a future S2 candidate or integration commit.

[RED](red-result.json), [GREEN](green-result.json), and the [Engineer receipt](implementation-receipt.json) retain commands, process budgets and source hashes. The lossless validation archive and manifest preserve original logs and handoffs. Commands ran serially, with 128 MiB Node heaps; full validation took 6.24 seconds. Owned temporary fixtures were removed. No heavy build, native run, services, package install or index refresh used STYNX's retained window.

## Released capability and complete goal

The [fresh immutable release qualification](release-qualification.json) reverified official DEVAI 2.7.1 tag, source, registry SRI and downloaded package bytes. It remains **NOT QUALIFIED** for U1/B1: historical divergent-anchor recovery and public canonical selection/staged-bootstrap capabilities are absent. Upstream implementation toward 2.8.0 is preparation until an immutable capable release exists. DETRAN remains pinned to 2.7.0; exact D1-L version, dependency diff and generated effects remain unresolved.

| Goal step | Current standing and remaining gate |
| --- | --- |
| Qualify released U1/B1 | 2.7.1 inspected; capabilities absent. Await an actual capable immutable release and qualify it. |
| Approve exact adoption | Exact D1-L packet and Owner approval remain required. Four-path approval supplies neither. |
| Recover/reconcile and generate catalogue | Held behind qualified release, exact adoption and registered-machine/resource preflight. Preserve all epochs, custody and index bytes. |
| Validate actual S2 candidate | Not performed by helper tests. Fresh reconciled source, native inventory/catalogue, proof/law/doctor, affected checks, review and CI remain required. |
| Explicitly release #211 hold | Not granted; #211 remains unmerged. |
| Integrate/audit S2 | Held behind all preceding gates; PR-only with green required checks. |
| Begin approved S3 runtime | Separate refreshed runtime packet and approval after S2 integration/audit; preparation only today. |

C6 remains blocked with its nine producers inactive. Original acceptance criteria, local/unpublished work, main's 449-record chain, held S2's 169-record chain, original 166-record custody and legacy chain remain preserved. No proof line, catalogue, semantic index, package pin or accepted ADR identity/body is changed. No R-0042/PC-0027 or R-0043/PC-0026 closure is reopened. The full goal remains active.

## Delivery review and preparation checks

The independent [Auditor review](auditor-review.json) and [cross-family delivery review](cross-family-review.json) both PASS the exact validated source. The latter retains one informational diagnostic wording observation; the approved bytes remain unchanged. [Preparation checks](preparation-checks.json) passed KB validation, rounds-index, DEVAI doctor and whitespace checks. Doctor is diagnostic readiness, not native acceptance or recovery authorization. Required exact-head CI and PR integration remain subsequent gates.
