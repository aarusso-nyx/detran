# Native producer custody — bounded feasibility and repair proposal

Role: Architect. Read-only provider assessment plus one expressly authorized diagnostic performance execution against the parent's existing disposable fixture. No sibling source, task configuration, state, evidence chain, nonce, threshold, timeout or product code was changed. No new native reading is asserted.

## Findings that change the execution decision

The current four DB-bearing invariant tasks are **not blocked by the unimplemented service-profile backend**. Every one of the seven current `test-tasks.json` invariant result populations omits `serviceProfile`. `invariant-est`, `invariant-ops-queue`, `invariant-ops-perf` and `invariant-portal` declare their DB environment allowlists. The other three require no such DB environment in their descriptor.

DEVAI's `packages/cli/src/commands/sense/task-binding.ts:204–205` calls `resolveNativeServiceSelection` only when `resultPopulation.serviceProfile` is present. The unimplemented function in `native-service-plan.ts` therefore is not selected by these actual task declarations. ADR-SCR-0020 explicitly states that absence preserves existing native semantics. A prior diagnostic assumption that all four tasks must hit `SENSE_NATIVE_SERVICE_BACKEND_UNIMPLEMENTED` was incorrect; an actual clean-candidate native attempt is necessary.

There is a separate, now demonstrated performance transport defect: the real test execution succeeds but application logger bytes precede the final native JSON report. Direct transport currently requires the entire stdout to be that single JSON document. This needs a small package-owned reporter repair, not a database-backend implementation or arbitrary log trimming.

## Actual authorized performance execution

Executed the unchanged `invariant-ops-perf` argv through the installed alias recorded in `/tmp/c6-parent-native-alias.json`. Its physical Vitest entrypoint SHA-256 was verified against that receipt. Fixture values came programmatically from `/tmp/c6-fixture.json`, filtered to the task's declared DB environment keys; credentials were not printed. No `DEVAI_NATIVE_*` context was supplied or fabricated.

| Observation | Result |
| --- | --- |
| Existing fixture | `detran-c6-invariants-23009`, disposable parent-owned fixture |
| Configuration SHA-256 | `d7994027c07dd52f97fdfa9591b3637b46d1581ab920fc3b03bf49a2f137b34e` |
| Process exit / duration | 0 / 45.673 seconds |
| Final report population | Three passed, zero failed, zero pending |
| Raw stdout | 26,641 bytes; SHA-256 `2c6420adf54b811f138e4bca66ffa81eebca5cc9faf0e48ed4956a6bae9dd486` |
| Raw stderr | 290 bytes; SHA-256 `a17ba84ef78c8576e92863ce151af8a4684e454db8b77b124100869f2656d590` |
| Entire stdout parses as JSON | No; the stream starts with actual pino INFO request logs |
| Diagnostic content | 630 logger lines precede the final JSON report; stderr retains the pg deprecation warning |
| Collection nonce | Absent, as expected for a diagnostic invocation |

The full untrimmed streams and metadata are retained beside this report as `provider-native-custody-perf-diagnostic.stdout.log`, `.stderr.log` and `.json`. The final report was inspected only to diagnose the transport; it was not extracted and re-recorded as an official result. The diagnostic demonstrates real execution and the stdout boundary defect, not native current-candidate standing.

The earlier captured `c6-producers/raw/ops-perf.stdout.gz` was a different execution: a single valid JSON report, a 60-second beforeAll timeout and three pending assertions. Its nonce was also absent. That failure remains preserved and must not be conflated with this later successful diagnostic. No timeout or assertion was relaxed between these observations.

## Existing external fixtures versus package-owned native services

There is no separate `external-service-lifecycle` enum or sanctioned configuration mode in `native-service-profile.schema.json`. Its closed profiles are PostgreSQL/HTTP, PostgreSQL/HTTP/S3, PostgreSQL/Redis/HTTP/S3/KMS and Playwright/Chromium/web, each requiring an owned Linux backend. `law/policy/native-service-backends.json` has candidate status and zero active records. `native-service-plan.ts` validates an explicit request, then refuses it unconditionally as unimplemented.

Nevertheless, **omitting that opt-in** is the existing supported native-test route, not a fabricated “external service profile.” The declaration/environment planner can pass the already-allowlisted synthetic DB coordinates to the real tests. The native configuration/collection/input checks still apply, and the actual native command must determine whether any additional input, loader or runtime behavior is supported. The source does not establish a blanket network prohibition merely because `serviceProfile` is absent.

Treat the fixture provenance separately and accurately:

- Record the actual fixture creator/owner, immutable image identity, instance/container ID, allocated port, database bootstrap and migrations, request-path application role, readiness and eventual cleanup from real commands.
- Let the official native route generate the private collection nonce and candidate/input/runner identities. `task-binding.ts:442–443` creates the nonce with `randomBytes`; externally authored reports cannot stand in for this run.
- Claim native test collection/execution only after its actual public CLI invocation validates it. Do not relabel the external fixture as package-owned, independently replayed Linux service custody.
- Keep service lifecycle gaps and mutable database state limitations explicit. A passing DB test against a known disposable fixture is not proof that DEVAI provisioned or confined that service.

Recommended order: retain the actual external fixture evidence; freeze the clean candidate; run the real native producers without adding `serviceProfile`; inspect their actual refusals. Do not introduce an unsupported profile solely to make the declaration look more complete.

## Smallest safe transport repair

Current exact-JSON consumers are:

1. `packages/cli/src/commands/sense/native-test-results.ts` — direct transport sets `plan = stdout.trim()` and parses that entire document. Turbo has a separate explicit physical-line prefix rule, not permission to extract arbitrary JSON from mixed output.
2. `packages/cli/src/commands/sense/native-input-provenance.ts` — parses stdout as the final report while reconstructing collection and source custody.
3. `packages/cli/src/commands/sense/native-output-custody.ts:24` — also parses stdout as the report and validates same-execution output roots.

Changing only the first parser to “find the last JSON” would leave the other two broken and would weaken ambiguity/replay protections. Neither swallowing logs nor rewriting captured output is acceptable. `task-binding.ts` already retains whole stdout/stderr and hashes; keep those semantics and its 64 MiB fail-closed limit.

### Recommended package-owned reporter change

Scope the DEVAI PR first to `packages/cli/src/native-test-reporter.ts` and independent reporter/transport tests. No new service profile, schema, adopter override or threshold is required for this repair.

Vitest 4.1.11's actual implementation establishes a useful narrow seam:

- `Logger` constructs a `Console` bound to the original stdout/stderr streams in `cli-api.CnMVyzaz.js:1883–1891`.
- `ForksPoolWorker` takes raw child stdout from `options.project.vitest.logger.outputStream` at line 3136; threads use the same property at line 3213. Raw child stdout is then piped into that selected stream.
- The native `JsonReporter.writeReport` uses `ctx.logger.log(report)`, whose console remains bound to the original output sink.

The package-owned `DevaiVitestReporter.onInit` can therefore select the error stream as the worker diagnostic `logger.outputStream` **before worker creation**, while keeping the final JSON writer's original stdout sink. This must be validated against the exact pinned Vitest implementation and both supported pools. Fail closed if the expected stream interface or initialization order is incompatible; do not broaden the accepted Vitest/Vite versions or mutate product logger behavior.

Also implement explicit forwarding of the custom reporter's `onUserConsoleLog` event to stderr with the full original content. The current custom reporter does not forward that hook. Vitest's `onConsoleLog` configuration is invoked through `BaseReporter.shouldLog`; the custom native reporter does not use that path. Thus adding `onConsoleLog` to the DETRAN config would neither demonstrate custody of the raw pino stream nor reliably preserve console logs. Application `process.stdout.write`/pino output is not a console event in any case.

Retain every diagnostic byte and warning, including the existing performance metrics console event; no `silent: true`, no error suppression, no logger severity changes, no new JSON extraction heuristics, no fake reporter nonce, no caller-controlled result file. The final stdout still must be a complete single native JSON document accepted by all three unchanged consumers.

If actual tests disprove the initialization-order seam, stop this small patch. A separate dedicated package-owned result channel is a larger alternative requiring custody/transport design across all three consumers, strict single-result identity, complete raw stream preservation and replay/ambiguity tests. It should not be improvised inside this patch.

### Inspector acceptance and exact tests

Add a focused test such as `packages/cli/tests/unit/native-test-reporter-transport.test.ts`, with actual Vitest 4.1.11 subprocess integration rather than only a mocked stream:

- A passing test writes raw worker stdout, raw worker stderr, `console.log`, `console.error`, warning and JSON-shaped diagnostic text. Each original content appears in retained diagnostics; stdout is one complete final report.
- Repeat for forks and threads with real child output, including fragmented writes and Unicode; ensure no truncation and no duplicated or missing diagnostics.
- A failing assertion and failed beforeAll remain fail/pending as originally emitted; preserved diagnostics do not turn failures into PASS.
- Full file/test ID populations and counters remain unchanged. Extra project/test, skipped test, wrong source path, duplicate IDs and fake/foreign nonce remain rejected.
- Positive official-route custody uses a nonce generated by the real CLI; diagnostic reporter tests with absent nonce are not treated as standing. Cache replay markers remain visible to the existing reader and fail closed.
- Ordinary quiet direct JSON remains compatible. Output over the existing cap still refuses; a worker or premature config write that contaminates final stdout is not silently discarded.

Re-run `packages/cli/tests/unit/native-test-results.test.ts`, `native-output-custody.test.ts`, `native-coverage-provenance.test.ts`, native scope/runner tests and existing native public declarations. Use the real raw pino fixture or the actual DETRAN performance suite as an additional integration demonstration after package tests. Preserve both original contaminated capture and new full-stream capture.

## Owned-service backend work is a separate, larger packet

Do **not** remove the unconditional refusal in `native-service-plan.ts` and return a fabricated selection. A real implementation would need active package-owned backend records, exact Linux runtime/artifact/engine identity, private whole-plan construction, confined provisioning and sockets, real readiness and terminal cleanup, namespace membership, parent/child lifecycle transcripts and independent replay under ADR-SCR-0020.

Relevant paths, if such a packet becomes necessary, include `native-service-plan.ts`, `native-linux-plan.ts`/replay modules, `native-service-docker-broker.ts`, `native-service-supervisor.ts`, `native-service-fixtures-kernel.ts`, `native-service-replay.ts`, configuration/capability readers and the package-owned policy/schema catalogue. Tests must extend `native-service-fixtures.test.ts`, `native-service-replay.test.ts`, `native-linux-plan.test.ts` and hostile public-route lifecycle tests. Missing active records, wrong image, host-as-Linux relabel, arbitrary endpoint/command, stale service, changed socket, forged readiness, pending child activity and missing cleanup must still refuse.

DETRAN's actual fixture uses a digest-bound PostGIS image. The existing request schema accepts a digest-bound `postgres:16-alpine` image, not arbitrary PostGIS. Replacing the fixture with plain PostgreSQL to fit that schema could omit required DDL capability. Supporting a new real image family requires its own reviewed catalogue/schema and real positive/adversarial evidence; it is not a one-line configuration fix.

## Engineering risk and release boundary

| Work | Concrete risk and effort assessment |
| --- | --- |
| Existing external fixture + actual frozen native attempt | Low source-change risk: no new service API. Environment/bootstrap or traced runtime may still fail; preserve the actual failure. Runtime execution and fixture evidence are prerequisites, not assumed results. |
| Reporter-owned diagnostic routing | Moderate, bounded risk: one production reporter source plus tests; exact Vitest logger/pool initialization order is the main compatibility risk. A focused engineering/review session is plausible; full CI/release and fresh adopter execution remain additional gates. No elapsed-time promise is made. |
| Dedicated new result channel | Higher custody risk: at least reporter, runner, all three readers and replay/transport contract must change together. Do not take this fallback without a separate reviewable design. |
| Activating owned Linux/PostGIS service backend | High implementation/security risk: lifecycle, network containment, artifact approval and independent replay are not implemented merely by having schemas. This is a multi-day feature and acceptance effort, not a small repair for the current descriptors or a safe five-hour assumption. |

Provider mutations require a separately scoped DEVAI round/branch/PR, its applicable AGENTS/authority instructions, independent Inspector and cross-family review, package build/contract/CLI tests and all required GitHub checks. Publish only through the official release flow using a verified unused next version; do not assume a version number from this report. Adopt the released package in DETRAN separately through the official binding/materialization flow, preserve thresholds and historical bytes, freeze the new candidate, then execute fresh official native measurements.

Current recommendation: **do not implement the unsupported service backend for these descriptors. Repair the demonstrated reporter transport in a bounded provider PR, then perform the actual native fixture-backed runs and report their real custody limits.** The local performance config remains unchanged because no supported local-only fix was demonstrated.

Graft discovery for this packet saved approximately 3,640 tokens.
