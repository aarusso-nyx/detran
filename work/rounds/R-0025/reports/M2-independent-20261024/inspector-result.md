# A2 read-only Inspector diagnostic preparation

Article 7 Inspector. No source changes or runtime actuation. Current-main source snapshot `b796e2e0`; preserved S2 candidates are distinct. CodeReview exclusively used for new CI reads. No test, build, install, service, native producer, CI dispatch or Graft refresh executed.

## Proven observations

| Evidence | Source | Population and result |
|---|---|---|
| Older manual stack run39955591719/job120420527767 |924bb52c|42 aggregate rows:38PASS/4FAIL. RAIT,TEAT,CH biometrics backend.healthz unreachable/status0; RAIT proxy HTTP200 empty_json. Diagnostic and cleanup steps succeeded.|
| Later manual stack run39962908062/job120445211986 |9b2a190a|42 aggregate rows:39PASS/3FAIL. Same three phase healthz requests: TypeError / UND_ERR_SOCKET / status0. Subsequent readyz200, RAIT proxy200 and all other rows pass.|
| Original native kernel provisioning integration |924bb52c receipt|3069unitPASS/8TODO;869executed integrationPASS/1FAIL, later tiers NOTEXECUTED. Single readiness-in-fresh-process case reported16035ms; provisioning package693PASS/1FAIL.|

Older complete raw gzip and independent review are preserved under pr211-smoke-diagnostics-20261023. Later CodeReview read is **truncated to120000characters**, but all8 JSON reports (7phases+aggregate), matching text reports, and cleanup are present in this tail and parsed independently. The2populations are not pooled. PEC was not built/covered. A passing M1 source does not establish resolution of these older-source failures.

## Cause visibility and source distinction

Main tools/stack/smoke.mjs27–42 catches both fetch exceptions and JSON parsing; outer catch discards the exception and returns backend_unreachable. Preflight449–455 converts response into boolean. runSmoke then emitsstatus0 without transport cause. PR211head9b2a190a **already** contains narrowly allowlisted error-name/cause-code diagnostics and preserves them in preflight/health/frontend/CH rows. Preserve this existing repair; do not create a duplicate or replace it with arbitrary exception/env logging.

PR211 also already changes the RAIT proxy persona from rait-coordinator to rait-secretary, sets exact approved actor b0000005 and passes that actor into restartFor. Later proxyPASS is source-bound evidence for that qualified fixture, not a reason to change assertions or access policy. Main source snapshot still has older actorless wiring. Reconciliation must retain the exact qualified source repair and its provenance.

## Lifecycle and sequencing

runCli first fetches backendhealthz, applies guarded ephemeral portal fixture, then for each frontend synchronously runs backend-restart with that persona, followed by serial runSmoke requests. CH fixture/probes follow similarly. Every runSmoke starts healthz→readyz, mock health, then frontend root/proxy or CH probe. finally restores default backend roles.

restartFor uses spawnSync and returns only status===0; successful child stdout/stderr and lifecycle identifiers are lost to the caller. tools/detran-stack.sh restart_backend_only573–586 stops the recorded process tree, starts backend, polls **both** healthz andreadyz using fresh curl invocations, and only then returns success. On failure it prints bounded backend-log tail. The parent Node process and its global fetch connection pool persist across these backend restarts. Thus a successful shell readiness poll is not evidence that an earlier parent fetch connection survived a restart.

**Hypotheses only:** a pooled connection made stale by backend restart may fail the next parent fetch; intermittent server/process termination or another socket lifecycle issue can also yield UND_ERR_SOCKET. Three failing first healthz requests followed by successfulreadyz are consistent with a transient request/connection boundary, but no socket reuse identity/PID-timeline trace in retained evidence proves it. Do not add retries, sleeps, Connection:close, threshold changes or classify as harmless based solely on this pattern.

## Provisioning boundary

Current harness.ts191–199 uses execFile(pnpm→tsx eval) with timeout15000ms/maxBuffer1MiB. The child imports readiness, creates pg.Client, connects, sets application role+tenant, executes readiness, writes R13_REPLAY marker, and ends client in finally. Current pg connection/query have no explicit timeout; parent error lacks structured killed/signal/code/elapsed-stage receipt in the old log. Case16035ms is consistent with hitting the15s execFile budget but does not independently prove which stage consumed it. Log prints only command-failed plus npmrc-variable warnings, no concrete SQL/child-cause stack. Package wall549.37s is a separate duration, not the failed-case budget. Current nonunit VitesttestTimeout30000ms/fileParallelismfalse. execFile targets direct child; descendant lifetime/pipes after termination are a hypothesis needing observed PID evidence, not established deadlock or PG root cause. Retained high-load host-after snapshot is temporal context, not causal proof.

## Minimal next owned packets (proposal only)

1. Architect/Owner must bind a clean reconciled candidate and explicitly retain already implemented S2 transport allowlist+qualified RAIT fixture. Existing one-file workflow-print approval grants **no** smoke.mjs or harness edits. Obtain separate bounded authority before runtime/test instrumentation or lifecycle repair.
2. Engineer diagnostic-only packet: exact paths tools/stack/smoke.mjs and its existing test consumer, with tools/detran-stack.sh added only if PID lifecycle data cannot be obtained externally. Emit allowlisted phase/requestordinal/monotonicelapsed and restart outcome+owned PID generation, bounded safe errorname/causecode. No URLs with userinfo, headers, tokens, database URLs, exception stacks or arbitrary body/env dumps. Retain all genuine fail rows and first-attempt verdicts. Establish safe two-server/request-sequencing counterexample before proposing any pool lifecycle repair. Inspector validates no assertion/status/population/budget weakening and then genuine candidate run in allocated window.
3. Separate provisioning diagnostic packet, owned Engineer for harness transport and Inspector for existing test behavior: capture bounded sanitized error.code/killed/signal, elapsed phase, markerpresence, direct/descendant PID custody and connection/query stage boundaries. Never log generated full inputs/credentials. Preserve15s subprocess and30s suite budgets; no automatic retries or widening. Diagnose actual observed stage before any functional fix.
4. Keep original four functional controls and90s/120s bounded modes, 30s performance reference, role sequence, all existing assertions, database restrictions, immutable prior failures and exact-source custody. No S3/C6 action or PR211 merge follows from this plan. Resource window and candidate authorization remain prerequisites for execution; PR226 mergeruntime is parent-owned.

Graft queries jsonRequest/runSmoke/backendPreflight saved approximately82,715 tokens (tool estimate); graph discovery was followed by source-bound read-only Git snapshots, not assumed current graph identity.
