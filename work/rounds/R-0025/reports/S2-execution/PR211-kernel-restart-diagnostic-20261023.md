# PR211 provisioning fresh-process failure — diagnostic packet

Architect,2026-10-23, within Owner goal repairandmerge211. Canonical uninterrupted
kernel at924bb52c exited1 after1435.284s. Executed unit3069PASS/8historicalTODO;
executed integration869PASS/1FAIL. Remaining integration and downstream stages
were not executed. Scope/JW01 separately406PASS. Original raw receipts remain
immutable; a focused diagnostic cannot replace the failed canonical invocation.

Failing sensor: backend/domains/ops/provisioning/tests/integration/
provisioning-behavior.integration.spec.ts, test “dado runtime reiniciado em outro
processo quando lê prontidão então a consulta usa o estado PostgreSQL persistido”.
Existing invokeInFreshProcess in the colocated harness.ts uses execFile pnpm exec
tsx with timeout15000ms covering process startup/imports, PG connection, readiness
and shutdown. Observed test16.035s is compatible with that limit; the terminal log
does not expose code/killed/signal or a causal exception. Parent fixture uses
autocommit and unique device; no parent-held lock is proved.

## Inspector-only observation boundary

After smokeGREEN serial validation, Inspector may run one focused diagnostic of
that unchanged sensor using its existing integration tier, fixture and exclusive
owned disposableDB53343. No competing own test runner; record current host/source
hashes and exclusiveDB state. No source, configuration, threshold, command body,
assertion or production file is changed. An Inspector-owned temporary observer
may wrap Node child_process.execFile through a temporary preload solely to record
elapsed time and native code/killed/signal/exit metadata, stdout marker presence
and executable/argument kinds. Preserve original callback/promisify behavior,
arguments, environment, output and15000ms timeout. Never log the environment,
connection strings, arbitrary command script/input or credentials. Preserve raw
native result separately from observer summaries. Remove only owned temporary
processes/leases and retain diagnostic custody. Do not overwrite earlier reports.

This is diagnosis, not a retry-to-pass policy or acceptance promotion. If the
observer changes behavior, record that limitation and discard causal inference.
Any repair of the harness/runtime/launcher requires a subsequent exact owned-path
amendment grounded in this result, Inspector RED and Engineer/Inspector separation.
No timeout increase, assertion removal, selective final acceptance, new dependency,
proof mutation, sibling edit or S3 runtime is authorized. Canonical acceptance must
ultimately complete after an actual repair; the original FAIL stays retained.
