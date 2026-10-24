# Proposed four-path provenance compatibility packet

Architect. **Proposed; no execution approval recorded.** The original [S2 packet](../P4-02-S2-approval-packet.md) says: "A required extra path stops for explicit bounded approval before editing." The source/test inventory below is outside the original S2 inventory. The continuing M2 request supports this concrete preparation and lightweight external qualification; it does not silently expand that source grant.

## Closed proposed source inventory

| Role      | Path                                         | Exact proposed effect                                                                                                                       |
| --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Engineer  | `tools/docs/adr/renumber.mjs`                | Port the archived finite initial-block provenance lookup; retain direct target and already-applied source checks                            |
| Engineer  | `tools/docs/state-index/check.mjs`           | Port the same finite lookup while retaining exact source/target/alias and state-index checks                                                |
| Inspector | `tools/docs/adr/tests/renumber.test.mjs`     | Retain all original assertions and the nine exact archived additional cases, including byte preservation and zero-pending positive behavior |
| Inspector | `tools/docs/state-index/tests/gate.test.mjs` | Retain all original assertions and the nine exact archived positive/refusal cases                                                           |

[Source hashes and original deltas](engineer-finite-provenance-compatibility.json) bind candidate `5dec824a` and archive `68084d5b`. The [review patch](proposed-provenance-source.patch) is a zero-context rendering of those exact four-file differences, with [binding](proposed-provenance-patch-binding.json); it has not been applied. The complete original patch and all source/test bytes remain in the source archive. Before any implementation, rebind actual current main and verify all four source hashes; a changed source or required additional path/effect returns for its exact amendment. No then-free ADR number or future normative file is invented here.

## Preserved invariants

Accept only an exact backtick-terminated source prefix inside the initial quoted provenance block, starting on the expected first provenance line and ending at the first separator. Every preceding block line must be blank or quoted. Do not search original body text, accept forged source suffixes, follow redirect chains, weaken alias uniqueness or normalize accepted bodies. Reject missing/wrong origins, missing separator, ordinary prose, provenance after a prose boundary and wrong first provenance line. A second genuine origin can coexist only inside that finite leading block.

The Inspector's unchanged vectors demonstrate current-tool 14 PASS / 4 deliberate RED and archived-tool 18 PASS. This is external parser qualification, not permission to edit, proof of whole-source compatibility or final acceptance. Any implementation still needs source-bound review, the existing full affected gate suites and required CI on the actual candidate. Heavy validation remains held until STYNX explicitly releases the window.

## Exclusions

This proposed four-path scope does not grant ADR numbering/moves/stubs/live-index changes, historical-reference rewriting, package/pin/config changes, machine index/catalogue/proof materialization, U1/B1 recovery, T/P diagnostics, C6 activation, S3 runtime or #211 integration. Those retain their separate exact packets and approvals. This proposal changes no original acceptance criterion, timeout, population or authority boundary.
