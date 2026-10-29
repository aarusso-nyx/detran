# M2 ADR and release-entry readiness — 2026-10-24

Architect. This additive preparation continues the approved M2 roadmap after the reconciliation census in #227. It preserves #211's merge hold, C6 blocked, S3 runtime held and all original acceptance criteria and histories. No ADR is allocated, no historical citation rewritten and no recovered anchor or native output produced.

## Exact source standing

The Engineer's original data labels `5dec824a5b3d099c71d05b8ef2699f8ecfb9918b` as `main`: that label denotes the #227 candidate analyzed, not an assertion that it was already live main. Actual observed main during preparation was `6c953874eab8ec1a13a7013ee68e2e95a1015ec1`. Held S2 remains `9b2a190aa1276f4b15469b7079ed0d7c4c8c4c99`; the archived snapshot remains `68084d5b5d0d5ce9d0b81d6a4f7b618b4b08c871`. The [actual integration binding](pr227-integration-binding.json) records #227 merged at `1c17bd37ceeb8f13eeae671987d2f0439aadafca`, with tree `bcc2c1b00103e884f9c88fe26115a50885e08f3c` equal to candidate `5dec824a`. All 65 observed-main proof/history source hashes and all four provenance tool/test source hashes remain unchanged. The original source identities below are retained. Source equivalence is not a new execution on that merge.

## ADR references and concrete compatibility gap

The [Engineer result](engineer-RESULT.json) records **2,174 lexical matching lines across 381 source/file pairs**: 286/94 for the candidate, 921/134 for held S2 and 967/153 for the archive. These are candidates for interpretation, not 2,174 approved edits. The full original references, raw Git text results, file hashes, accepted bodies and source snapshots are retained in the lossless [source archive](adr-source-captures.tar.gz) and its [manifest](adr-source-captures-manifest.json).

[Verified semantic consumers](engineer-verified-semantic-consumers.json) are separate from lexical matches. The current default renumber configuration has eight closed live paths and no target ADR 0055–0062 matches there. The historical reconciliation configuration's two structural indexes, `DESIGN-DECISIONS.md` and `docs/meta/adr/README.md`, do require a future exact refresh. This does not turn historical/out-of-lock references into live rewrite authority. Bare numbers cannot safely distinguish the different main and S2 meanings; preserve slug/source context and finite aliases.

The three archived normative identities 0060/0061/0062 collide with main's roadmap/adoption/history-compatibility ADRs. Under ADR-0035, first-parent main precedence and then-free numbering govern any later reconciliation. Preserve all accepted bodies and prior provenance bytes as exact suffixes under any additive header. Existing S2 aliases 0055/0058, 0056/0059 and 0057 must eventually resolve directly to the final normative targets; redirect chains are rejected. This packet assigns no target numbers.

The [finite compatibility comparison](engineer-finite-provenance-compatibility.json) identifies a specific tooling gap: current gate and renumber helpers expect each source provenance prefix on line 3. Preserved archive work supports exact multiple origins only in the initial quoted block before its separator. It does not search arbitrary body text or waive direct aliases. The preserved four-path delta is **preparation only**:

| Discipline | Existing path                                | Standing                                                                                          |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Engineer   | `tools/docs/adr/renumber.mjs`                | Archived finite provenance helper; requires a fresh exact reconciliation packet before adaptation |
| Engineer   | `tools/docs/state-index/check.mjs`           | Archived finite provenance helper; preserve alias/target/source checks                            |
| Inspector  | `tools/docs/adr/tests/renumber.test.mjs`     | Nine archived cases; retain original assertions and byte-preservation coverage                    |
| Inspector  | `tools/docs/state-index/tests/gate.test.mjs` | Nine archived cases; retain refusal and direct-alias coverage                                     |

No runtime or test delta was applied to the repository. The later external fixture qualification below executed the original archived vectors against isolated source copies. Current main's historical authorities 0055/0062 and frozen adoption 0061 retain their distinct meanings and source hashes. The [source bindings](engineer-source-bindings.json) retain the older renumber configuration's dated statement that 0060 did not collide; it is historical, not the current finding.

## No-loss recovery inputs and release entry

[Proof-source custody](proof-source-custody.json) independently hashes every tracked proof file and the legacy chain at the three original refs. Observed main retains all 449 records, head `089ded9c3e634acab61400461d5f69bac369c106cc8b9bf24be8e6778c129fa7`, and whole-chain SHA256 `03945961b9c82dac7d94db73661d24fa3d707f9aba1691634043d8deae6a171a`. Held S2 retains all 169 records. The original 166-record receipt and 1,873,061-byte raw stage-entry bundle retain their original hashes. Physical-line hashes include their newline bytes; they are not native anchor digests. No canonical side, native orphan set, new head or append count is derived by this custody inventory.

[Release-entry readiness](release-entry-readiness.json) binds six unchanged original packets. Unknown future version, integrity, protocol, migration, output and approval fields remain null. Old 335-record/1,141-operation/DEVAI 2.6.3 examples remain dated inputs; installed declaration is 2.7.0 and constitution is 1.1.0. A newer version alone is not U1/B1 qualification. DEVAI's separate session was observed preparing an authority planner/materializer proposal, not delivering a release.

Any later DETRAN fixture/native execution still requires exact D1-L approval and resource preflight under original REC-D1. No install, bind, package/lock edit, pin/config materialization, recovery, catalogue production, T/P instrumentation, C6 activation, S3 runtime or #211 merge is granted here. The explicit STYNX heavy-work hold remains in force until release.

## Limits and validation

The census scans tracked Git text with explicit patterns; binary/compressed content, dynamic concatenation, compact unexpanded ranges, ignored/untracked sources and external worktrees are not a semantically complete closure. Thirty unresolved relative-link occurrences are ten copied historical R-0041 links repeated across three refs, not current canonical link failures. [Link-resolution limits](engineer-lexical-link-resolution-limits.json) retain those details.

Archive members were re-opened and verified against exact byte lengths and SHA256 values. The initial source census and custody audit ran no tests, builds, installs, services, native actions or index refresh. The separate later fixture qualification is bounded below. Static [source-custody audit](externalarchitect-audit.json), [initial publication audit](externalpublication-audit.json), actual integration binding and applicable lightweight publication checks are recorded separately; no passing native acceptance is transferred to this report commit.

## Bounded Inspector qualification

The [Inspector result](inspector-RESULT.md) records the original 18 added vectors, unchanged, against both exact tool sources: **current candidate 14 PASS / 4 deliberate RED; archived tools 18 PASS**. Each command selected exactly nine vectors with zero skipped/cancelled/TODO cases, for 36 authentic executions across four sequential commands. Both current helpers reject genuine secondary provenance and accept a missing leading-block separator; the archived helpers pass those positive and strict-negative boundaries. These deliberate counterexamples are not CI failures or a failed delivery.

Qualification used Node 24.15.0 builtins in disposable external fixtures, a parent awaiting at most one CLI child, 128 MiB heap per process and no concurrent workloads. Total wall time was 2.053 seconds under the 30-second cap. Temporary fixture roots were removed and source hashes remained identical. No database, service, build, install, native action, index refresh, RC or source write occurred. STYNX's heavy-work window remains held.

[Full captures](fixture-qualification-captures.tar.gz), [manifest](fixture-qualification-manifest.json), [preflight](inspector-STATIC-PREFLIGHT.json) and [process-shape clarification](inspector-authority-clarification.json) preserve the actual method and outcomes. Archived PASS establishes only this fixture behavior; it does not approve integration or replace a final candidate's full gates. The exact [four-path proposal](provenance-compatibility-proposal.md) is reviewable preparation, not an executable approval.

## Publication checks and current-main boundary

[Preparation checks](preparation-checks.json) passed selected formatting, knowledge-base validation, rounds-index verification and DEVAI doctor on the actual #227 merge plus these additive files. No native acceptance or fresh signed RC is claimed for this new report commit.

The prior main `6c953874` completed ordinary CI and trusted exact-tree verification. #227 itself merged only after all five required contexts passed on `5dec824a`, including the supported remote backend fallback. New-main CI run 40103993144 was newly triggered at `1c17bd37`; it is not claimed complete here. New trusted run 40103993113 failed its tree-tag lookup before a fresh signed bundle existed, with secondary missing-summary errors. Its [original full log](m227-initial-trusted-failure.json.gz) is retained losslessly with [custody](m227-trusted-failure-custody.json). A genuine new local RC remains held until STYNX explicitly releases the heavy window; no signature is transplanted from the earlier tree and no check is weakened. Later outcomes remain separate dated receipts.
