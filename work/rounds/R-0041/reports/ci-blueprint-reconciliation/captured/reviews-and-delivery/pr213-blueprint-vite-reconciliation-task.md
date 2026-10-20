# TASK proposal: reconcile canonical blueprint test-toolchain metadata

Status: proposal only; independent TASK review and parent dispatch required before edits/generation. Existing Owner C2–C8 correction authority applies. No new Owner choice, product correction, native activation, threshold or evidence waiver is proposed.

## Authentic trigger

PR213 run39364579555 job118438492903 completed FAILURE at head `b3b66c6df1c8153f1bc5427c3cd14c9e98c4e0ab`, tree `620e3b1b5c4e135aa964867200807340928a3d3e`. Full222,062-byte job log and run/job/PR APIs are retained in `/Users/aarusso/.config/devai/evidence/detran/pr213-backend-kernel-ht1q4foz`. Log2644–2652: `pnpm blueprints:check` reports five generated package.json drifts, then exit1. DDL/seed, decorator verification1010handlers and RLS smoke passed. The fail-fast backend harness stopped before unit/integration/E2E tiers, so no backend test count/results were produced; do not infer product test failures. The verified-local-rc publisher actually created failure check118442843807, then correctly enforced the failure conclusion.

This is a campaign wiring/source-of-truth reconciliation defect: commit2daa0012 added existing exact Vite7.3.6 peer dependencies to five generated manifests without the matching canonical blueprint declarations. Main c582 and currentPR use the identical generator and identical five blueprint bytes. No product/runtime defect has been demonstrated.

## Exact canonical source scope

Architect adds only `module.devDependencies.vite: "7.3.6"`, preserving every other canonical field, to:

- `docs/framework/blueprints/BP-CH-ENCOUNTERS-001.json`
- `docs/framework/blueprints/BP-EST-CRASH-001.json`
- `docs/framework/blueprints/BP-INF-AIT-001.json`
- `docs/framework/blueprints/BP-OPS-FIELD-001.json`
- `docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json`

The unchanged official generator recognizes `module.devDependencies` at tools/blueprints/generate.mjs503–507. Existing module-blueprint.schema.json does not declare that property explicitly but permits additional module properties; pg devDependencies already use this supported generator convention. No schema change is required or authorized. Do not edit generator/defaults, remove existing Vite pins, add a global override or change any dependency version/lockfile.

The prior extra preference for five manifest bytes is narrowed solely to allow generator-produced JSON key ordering: default Vitest is inserted before the module dependency spread, whereas current manifests put Vite before Vitest. Parent recommends preserving the unchanged generator and proving deep equality of every parsed package value, including all scripts/exports/dependencies and exact Vite7.3.6. Only devDependencies key order/associated formatting may differ. This is not relaxation of a user threshold or CI control. Current five manifest hashes are listed in the roster; all other parsed values must remain identical.

## Provenance coupling and preview gate

Raw blueprint SHA256 is embedded by generator68/126 in generated TS/DDL headers. Static inspection finds230affected provenance-header paths: CH13, EST63, INF48, OPS68, PORTAL38 (43entities total). Add five generated manifests, five canonical BPs and two source registries: potential242paths, plus new additive diagnostic reports only. The exact static path list and hashes are in `/Users/aarusso/.config/devai/evidence/detran/pr213-backend-kernel-ht1q4foz/static-provenance-roster.json` (SHA256 `1d2fc56fab4be1f0fb049693b16ba3980c0970f337ecad0ccfdae88d1f8cc3d7`). This is not a generated preview PASS. `tools/blueprints/generated-files.json` must remain byte-exact because the target population is unchanged.

After TASK approval, Engineer first generates with the unchanged `tools/blueprints/generate.mjs` into a fresh external `BLUEPRINTS_OUTPUT` directory, retaining complete commands/streams/exit and per-file diff hashes. No source output is applied until parent/independent review confirms: only the five package key-order changes, and only first-line blueprint-SHA header changes in the230TS/SQL outputs. Strip only the exact first generated header for comparison; every remaining byte must match, including SQL/RLS, tenant context, decorators/routes/DTOs, implementation bodies and tests. Any other generated delta, path, deletion or target-roster change is STOP, not an incidental fix. Then apply exclusively the reviewed official generated outputs; never hand-edit package or provenance hashes.

Two live source registries consume these exact hashes: authorization has43affected controller-source hashes; PII has all five BP hashes and five affected generated SQL hashes. `tools/security/check-security-exports.mjs67–73` validates all source hashes even `--snapshots-only`. Neither registry references these five package manifests. Conditional Architect/Engineer ownership includes only `law/security/authorization.json` and `law/security/pii-registry.json` refreshed by the existing exporters, with authentic inputs and verified current source anchors. Do not manually patch hash fields or change checkers. Native inventory inputs must be actual supported outputs, not fabricated or relabelled as fresh execution; if only older artifacts can be reused, verify every source coordinate/hash, label their old producer subject and supplemental scope, and obtain parent review rather than claim native standing. Stop if the legitimate source refresh cannot satisfy current provenance.

Preserve authorization population1139 =1004conditional+6public+121mock+8fixtures; Resource/Action stays conditional, all endpoint/control/permission semantics unchanged. Preserve PII211union=158source-classified+53heuristic-only (=70native+141additional,17overlap), all211purpose/legal-basis pending, existing retention/classification declarations and gaps, every row/source pointer and SQL identity. Preserve fields/endpoint bodies exactly apart from authentic changed source hashes and explicitly reviewed new producer-input provenance. No legal facts, permissions, dummy table or false no-PII claim. R0039 sealed historical source/registry copies and every old report remain byte-exact. Do not regenerate or replace history.

## Inspector acceptance and gates

Inspector owns independent source/generated comparison tests only if needed; do not modify product tests, existing assertions, suite selection, timeouts or workload population. Prove canonical-source delta exactly five Vite entries; five manifest deep equality with only devDependencies key order changed; all230nonheader bodies exact; all other generated paths/index exact. Retain the genuine remote RED without replaying it as a fabricated result.

After reviewed application, run affected schema validation using the actual complete schema resolver; blueprint parity with no suppression; existing source export checks/tests and snapshot check; contract generation checks if their inputs change; stack/pins checks, scoped formatting, frozen dependency install only if needed (require unchangedlock+physical Vitest/Vite/Angular versions), original CI isolation11tests, law checks/doctor as applicable. Parent controls fresh full required CI/backend execution on the final clean candidate; earlier backend tiers were unexecuted. Do not reuse old readings as current.

Stop on dependency/runtime/DDL/RLS behavior change, unrelated generated output, source hash inconsistency, altered211/1139populations or legal gaps, original seven task/profile/threshold/NAs/history/backlog delta, newly required sealed transition, unsupported native custody, failed check or review. No broad C6 activation/protocol review retry, DB/fixture bypass, fabricated native nonce/reading, gate weakening, history rewrite or product fix. All nine ordinary CI suites/services/commands stay intact; C6 remains blocked and R0041 active. Root owns Git/PR/publication/evidence.

## Ownership and execution boundary

You are not alone: preserve concurrent ops-perf/task work. Architect owns the five canonical BP metadata edits and current source-registry provenance refresh; Engineer owns external preview and reviewed generated output application; Inspector independently verifies exact semantic/body preservation; root controls freeze/commit/CI and review. No implementation, generator, test, DB, Docker, source or remote mutation occurred while preparing this packet.


### Closed CI source/config pin intersection

Read-only comparison of the exact current CI contract's nine complete source-file SHA pins and nine config SHA pins against all230potential generated header paths finds an empty intersection. The pinned sources are handwritten specs; the generator produces no matching spec/config path. Therefore this blueprint provenance-only task authorizes no CI-test pin edits. Separate ops-perf work may legitimately alter its own helper/config pins; Inspector ownership and any actual pin refresh remain coordinated by root under that separate reviewed task. No concurrent edits to tools/devai/tests/ci-isolation.test.mjs are proposed here.
