# A1 — S2 integration inventory, 2026-10-23

Architect; read-only comparison. No runtime, tests, proof or security output changed.

Compared main `a97e6def6cc4b80d65c5ab0ee9579241f0b33446` with preserved
PR211 `cd2b6740d41676d000fd0f30ba6049ff3d8073cc`; merge base
`1115f58960679291744e93a3fb59feb35d849cbb`.
`git merge-tree --write-tree` returned1: exactly one mechanical conflict.

| Path / family | Disposition |
| --- | --- |
| `record/proofs/chain.json` | Machine-only binary merge conflict. Main203 records/head `ecf0222fc337db75f34a9d24c010bfbd96780e9bee64ad28b446bfc2e34d9af7`; S2 169/head `5ad7ef9ab8220f58a320747cf0ce92d973aa304f3a7f7dd73d7ec3fee779f4f8`. Preserve both chains byte-for-byte. No manual JSON/hash merge, choosing one side, or merge-driver override. |
| `law/security/authorization.json` | Only other path changed on both branches; automatic merge. Retain S2 census/provenance and main's updated Portal route sensor hash. R8 already permits deterministic accepted-exporter refresh against exact merged sources with policy/classification/thresholds frozen. Automatic Git merge is not semantic validation. |
| `law/security/pii-registry.json` | S2-only change; preserve and verify R8 source consistency. No scorecard readings or reference policy changes. |
| `docs/site/package.json`, `docs/site/package-lock.json` | Main-only changes remain. S2 changes no package manifest or lockfile. |
| ADR0055–57 RAIT redirects and0058–60 | Intentional nonnormative redirects recorded by S2 commit98b2e7dd under ADR0035. Preserve main's distinct0055–57 security/scorecard ADRs. No renumbering needed. |
| Runtime, tests, contracts | No mechanical conflict. Existing S2 ownership/extensions govern any later source reconciliation. Retain Inspector references and rerun justified acceptance on the exact reconciled candidate. |

The machine-only conflict prevents publishing a truthful reconciled S2 candidate
with the installed recovery capability. Do not manufacture a merge commit with
only one chain. Upstream DEVAI #420 delivered ADR-EVI-0006, not implementation;
latest observed GitHub release remainsv2.6.3. A released recovery implementation,
its upstream tests and an exact DETRAN adoption approval are still needed.
No additional broad source reconciliation grant is identified by this inventory.

The two branches' scope355/JW-01-51 checks and uninterrupted canonical kernel remain
pending. Existing claim126-pass receipts remain historical at their source SHA.
A local preflight on2026-10-23 found load43.52/24.68/24.51 and concurrent Node test
workers; no expensive S2 validation was started and no other process was stopped.
A later quiet preflight may resume existing approved checks without reapproval.

Preserved source: `S2-execution/S2-R8-http-sensor-and-security-regeneration.md`
at the pinned S2 head. All earlier amendments and90s/120s limits retain authority;
30s remains a performance reference. Primary local and scorecard work are untouched.

Repeated preflight2026-10-23T04:34:29Z found six Vitest processes, including
workers at74.7%,78.0% and126.8% CPU. This is actual competing test execution,
not merely an idle tool-server marker. S2 resource-dependent validation remains
pending; this observation grants no performance PASS or new timeout budget.
