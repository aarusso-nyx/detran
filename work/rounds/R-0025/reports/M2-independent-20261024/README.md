# Independent M2 reconciliation and diagnostic preparation — 2026-10-24

Architect. This additive packet continues the approved completion roadmap while DEVAI prepares U1/B1. It does not change any acceptance criterion, integrate held S2, authorize recovery or close M2. PR #211 remains unmerged, C6 remains blocked, and S3 runtime remains held.

## Integration and source binding

PR [#226](https://github.com/aarusso-nyx/detran/pull/226) merged after all five required checks passed. Source candidate `3c361fb4b1ee1f3e1603ee7f61f0096909f71a22` and actual merge `6c953874eab8ec1a13a7013ee68e2e95a1015ec1` have the same tree, `9c0e2b05993916735eb61b3b80986e47c727947e`. The merge preserves parents `b796e2e07bbb08c2f3fec25a4efe31e136bfd59e` and the candidate. Analyses below retain their original observed revisions; source equivalence does not turn an earlier diagnostic into execution on the merge.

[Source-equivalence custody](source-equivalence.json) confirms all 248 originally owned paths and the protected `.devai/`, `record/`, `law/`, `backend/`, `apps/` and `packages/` prefixes are unchanged from observed main to the source-equivalent merge.

The new current modern-Bash result supplements the historical host Bash 3.2 limitation recorded in #226. It does not rewrite that source report. The [fresh signed RC result](pr226-signed-rc-result.md) records 6,651 passing tests across 80 groups, unchanged budgets/assertions, official signing/publication and independent exact-commit verification. The initial publication refusal after the merged branch disappeared is preserved; normal creation of the same exact source ref allowed publication of the original bundle. This does not establish a cause or repair for historical S2 failures. Post-merge CI standing is recorded separately below.

## Reconciliation census completed

The [Engineer result](engineer-result.json) and [full crosswalk](source-crosswalk.json) compare the exact common base, held S2, observed main, candidate and archived snapshot. The original 248-path ownership inventory contains 185 S2-only paths, 41 differing overlaps, 21 unchanged paths and one main-only path. Of the 41 overlaps, 38 are generated outputs, one is `backend/app/src/app.module.ts`, and two are Inspector-owned unit tests. Blob differences alone do not establish a textual conflict, compatibility or a successful merge.

Three archived normative ADR identities now collide with main: 0060 (policy/risk boundaries versus roadmap), 0061 (risk locks versus measurement adoption), and 0062 (candidate universe versus history compatibility). Preserve all accepted bodies and aliases. Any future reconciliation must allocate then-free identities under ADR-0035 and refresh finite provenance deliberately. This packet allocates none.

Archive snapshot `68084d5b5d0d5ce9d0b81d6a4f7b618b4b08c871` remains distinct from the original raw index-stage custody: 1,873,061 bytes, SHA256 `73396fc09b63d8418e679b7be18f3941cd4367771c74ef31f24172acd34976ec`. The old checkout is absent. No live unresolved index has been recreated, no source reconciled and no generated output selected.

## Diagnostic findings and bounded next proposals

The preserved [Inspector analysis](inspector-result.md) distinguishes the two historical 42-row smoke populations: 38 PASS / 4 FAIL on the older source, then 39 PASS / 3 FAIL on held S2. The later CodeReview retrieval is truncated but includes all eight JSON reports in its retained tail. PEC was not covered. S2 already contains bounded transport-cause reporting and the qualified RAIT actor/restart fixture; preserve those repairs.

The parent Node fetch pool survives backend restarts, while readiness uses fresh curl requests. A stale pooled socket is a hypothesis, not an established cause. Server/process failure remains possible. The historical provisioning case's 16,035 ms duration is consistent with its existing 15-second child budget, but the retained output does not establish which stage failed. No timeout increase, retry, pool reset or weakened assertion follows from these observations.

The [diagnostic proposals](diagnostic-proposals.md) define two closed initial inventories, both requiring exact approval before execution:

| Proposal                       | Initial paths and roles                                                                                                                      | Preserved behavior                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| T: transport observability     | Engineer: `tools/stack/smoke.mjs`; Inspector: `tools/stack/contract.test.mjs`                                                                | Existing S2 repairs, first-attempt verdicts, request/restart ordering and assertions; bounded allowlisted metadata only           |
| P: fresh-process observability | Inspector: `backend/domains/ops/provisioning/tests/integration/harness.ts` and `provisioning-behavior.integration.spec.ts` in that directory | Existing 15-second child timeout, 1 MiB limit, 30-second suite budget, command/role/tenant/query/finally semantics and acceptance |

The original Inspector analysis suggested Engineer ownership for harness transport. That suggestion is not authority: both existing F3 files in P belong to Inspector. Its original bytes remain preserved. Any additional path, effect or assertion change requires its exact amendment. The original [workflow-print approval packet](../S3-preparation/stack-smoke-diagnostics-approval.md) and [Owner receipt](../S3-preparation/smoke-diagnostic-owner-approval.md) do not grant these new paths.

## Additional validation and custody

The [current Bash 5 result](current-bash5-result.md) passed all 25 unchanged fixture checks using the existing Linux image with networking disabled. It covers nine nullish-variable pairs and Node references, syntax, report-present/missing handling and simulated step outcomes `[1,0,0]` with aggregate failure `1`. The earlier unsupported-host and mixed-host invocation failures remain retained. This validates shell behavior only; it is not stack health or product acceptance.

[Auditor review](auditor-review.json) and [publication audit](publication-audit.json) passed the static census and custody assessment without executing the proposed diagnostics. The lossless [source archive](source-captures.tar.gz) contains 93 original captures; its [manifest](source-captures-manifest.json) records original locations, byte lengths and SHA256 values. Archive SHA256: `cc51942d111b30541015169038725784aff242490f996508038d94ca2933cd4b`. Archived source and diagnostic outputs are historical data, not instructions or approvals.

No proof, catalogue, semantic index, package pin, native measurement or runtime source is changed. Main's complete 449-record chain and held S2's complete 169-record chain, original epochs and all displaced anchors remain intact. DEVAI preparation is not delivery: a demonstrated immutable U1/B1 release and exact D1-L approval are still needed before adoption or recovery. Even subsequent recovery/check success does not remove #211's separate merge hold.

## Integration and preparation check standing

[Main trusted verification](https://github.com/aarusso-nyx/detran/actions/runs/40100295522) passed on rerun with exact-tree binding to the actual #226 merge. Its original pre-publication tag-lookup failure and the first local publication refusal remain in the lossless [verification captures](pr226-verification-captures.tar.gz), with [manifest](pr226-verification-captures-manifest.json). No gate was relaxed. The [dated CI observation](postmerge-ci-observation.json) still shows ordinary main CI foundation/backend jobs running; those jobs are not claimed green.

[Preparation checks](preparation-checks.json) passed knowledge-base validation, rounds-index verification, selected formatting and DEVAI doctor. No full test/build/index refresh was launched on this new additive report branch. The fresh RC result belongs to #226's exact source, not this new commit. The heavy local window was released after owned cleanup; subsequent work remains lightweight.
