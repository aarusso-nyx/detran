# C5–C8 Architect worker delivery

Role: Architect. Baseline: `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c`.
Scope and orchestration authority: parent R-0041 authorization. No Git mutation,
proof emission, historical correction, threshold change or product implementation.

## Delivered

- C5: structured threat model with five actual trust boundaries, assets, controls,
  existing negative-test paths and explicit operational/legal coverage gaps.
- C5: error/concurrency/idempotency source index. Existing RAIT catalog remains draft;
  its scoped approved amendments retain their scope. No new error code or retry target.
- C6: canonical constitution reading-order body with the same pin/version/hash.
  The displaced legacy-genesis sentence is preserved in the additive C8 map.
- C7: CI checkout/setup-node use the exact v7 SHAs already used by the protected
  generated verifier. Workflow/ref group is explicit, superseding cancellation stays
  true. Generated verifier and its separate serialized cancellation policy are untouched.
- C8: additive historical finding/compatibility map with exact frozen capture hashes,
  authentic finding texts, design constraints and unresolved provider support.

## Native readings on the uncommitted worktree

These diagnostics were not persisted and are not candidate-bound final evidence.
Raw stdout/stderr and normalized summary are in `/tmp/c5-c8-worker-sensors/`.

| Sensor | Result | Interpretation |
| --- | --- | --- |
| spec_security_coverage | REVIEW | Threat model recognized, 1/3 signals. Existing AUTH/rbac invariant and PII source metadata do not satisfy native domain-RBAC / literal SQL registry predicates. |
| spec_robustness_targets | REVIEW | One error-contract recognized; zero error_semantics invariants. File discovery does not prove all robustness targets exist. |
| docs_drift | PASS | Zero drift; canonical entrypoint, immutable binding unchanged. |
| harness_coherence | REVIEW | Action drift 0; one remaining concurrency observation requires reviewed workflow/candidate projection reconciliation. |
| harness_idiomaticity | REVIEW | Cache exists; no composite/reusable workflow. No gratuitous abstraction introduced for score. |
| harness_invariant_alignment | FAIL | Seven absent measurable_via entries remain until meaningful registered producer IDs, exact CI invocations and fresh candidate evidence are supplied by parent. |

## C6 producer proposal for parent Inspector

All tests already exist; no new assertion or product change was authored here.

| Invariant | Exact existing producer from repository root | Relevant intent |
| --- | --- | --- |
| INV-CH-001 | `pnpm --filter @detran/ch-encounters test:unit tests/unit/encounter-lifecycle.service.spec.ts` | AC-PEC-002-1 checked-in prerequisite and scoped exception. |
| INV-DASH-001 | `pnpm --filter @detran/shared test src/policy.spec.ts` | DASH auditor/DPO readonly, forbidden mutations. |
| INV-EST-001 | `pnpm --filter @detran/est-crash test:integration tests/integration/boat-contract.integration.spec.ts` | Persistent contract and tenant-local transaction/RLS. |
| INV-INF-001 | `pnpm --filter @detran/inf-ait test:unit src/ait-lifecycle.service.spec.ts` | Explicit local finalization lifecycle. |
| INV-OPS-001 | `pnpm --filter @detran/ops-field test:integration tests/integration/shift-lifecycle.integration.spec.ts` | Pending queue rejection and explicitly justified close path, C-0002-36. |
| INV-OPS-002 | `pnpm --filter @detran/app exec vitest run --config vitest.performance.config.ts tests/performance/backend-baseline.perf.spec.ts` | Three exact ADR-0044 scenarios, dedicated DB/app role, existing unchanged assertions. |
| INV-PORTAL-001 | `pnpm --filter @detran/portal-requests test:integration tests/integration/portal-requests.integration.spec.ts` | Protocol seed sequence, lifecycle persistence and rollback, C-0002-30/31/32. |

Integration/performance execution requires parent's disposable fixture environment;
missing DB or stale results must remain FAIL/gaps. Native alignment checks facade action
IDs, real CI execution and fresh exact-candidate evidence. A generic `check` or unrelated
passing sensor would not establish these seven intents. No invariant edits yet.

## Provider boundaries

- Security discovery recognizes invariant `domain == RBAC`, not existing `AUTH/type=rbac`;
  PII discovery demands literal `INSERT INTO core.pii_map` unless falsely declaring no
  personal data. Preserve existing meaning and report unsupported representation.
- Harness workflow effect assessment consumes bound reviewed occurrences from candidate
  audit projection. Uncommitted edits differ from candidate and can yield a REVIEW even
  when root concurrency expressions are correct. Re-evaluate after official binding/freeze.
- Historical compatibility map is additive documentation, not an installed provider
  migration. Native missing/frontmatter/archive verdicts are retained. No legacy exemption.

## Validation performed

- `pnpm law:test`: 56 tests PASS.
- `pnpm verify:law-corpus`: PASS.
- `pnpm docs:kb:check`: PASS, 773 artifacts / 446 canonical tokens.
- `pnpm docs:kb:publish-check`: PASS, 201 publishable files; internal/raw excluded.
- `pnpm devai:doctor`: PASS, constitution 1.0.2 digest unchanged; host authority remains
  explicitly cli-only (not a claim that arbitrary external tools are enforced).
- Threat-model source/test path resolution and local Markdown links: PASS.
- Formatter applied only to owned paths.
- `/tmp/c5-c8-worker-preservation.json` hashes 1,073 protected historical/control paths.
  No source history was edited by this worker. Parent owns final equality verification.

Parent must supply the new ADR, independent review, Inspector results, action registration,
measurement binding, official evidence/round closure and remote CI verification. This worker
has not committed, pushed, integrated, recorded readings or emitted proofs.
