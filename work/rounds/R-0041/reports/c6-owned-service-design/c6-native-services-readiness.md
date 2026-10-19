# C6 native service readiness — read-only

DETRAN clean candidate inspected: 62043cc5 (parent 73c0b877). Provider candidate source: abab8b2f783259a6d34a6037a9412884e384d530; this is source inspection, not a claim of published/adopted 2.6.4 or completed native measurements. No repository, Git, policy, state or proof changes were made.

| Task | Complete cases | Real requirements | Native readiness |
| --- | ---: | --- | --- |
| invariant-ch | 11 | Existing unit fixtures | Eligible for exact native attempt after provider adoption; no service declared |
| invariant-dash | 729 | Existing unit policy suite | Same; no service declared |
| invariant-inf | 7 | Existing unit lifecycle suite | Same; no service declared |
| invariant-rbac | 736 | Whole guard + policy suites | Same; 729 policy cases overlap DASH |
| invariant-errors | 13 | Whole shared helper suite | Same; no service declared |
| invariant-est | 21 | Real PostGIS database, roles/RLS, fixtures; seed.sh invoked twice inside a test | Blocked by missing owned service backend AND unimplemented finite shell/psql child recipe |
| invariant-ops-queue | 8 | Real PostgreSQL fixture rows, tenant transaction and cleanup | Blocked by missing owned service backend |
| invariant-ops-perf | 3 | Dedicated detran_r7_ctg1_a2 PostGIS fixtures, owner/app URLs, role_app_backend assertion; actual Nest/Supertest loopback HTTP | Blocked by missing owned service backend and authentic owned HTTP transport |
| invariant-portal | 3 | Real PostgreSQL owner fixture setup + app-role tenant transactions/outbox | Blocked by missing owned service backend |

Nine descriptors currently have no serviceProfile, dependencies:[], toolchainKeys:[node,pnpm], direct native transport. Only the four DB tasks allowlist DB/runtime/provider/log environment keys. Allowlisting supplies hashed environment inputs, not db:write, network transport, cluster ownership or fixture custody. task-selection.ts adds db:write only for migration_check, not these integration_test tasks. The unprofiled native process binding grants no owned-service authority. Supplying a host DATABASE_URL, precreating a database or using CI's disposable service cannot establish native profile standing.

Concrete provider refusals:
- commands/sense/native-service-plan.ts resolveNativeServiceSelection validates a profile then unconditionally throws SENSE_NATIVE_SERVICE_BACKEND_UNIMPLEMENTED.
- law/policy/native-service-backends.json is candidate with records:[]; no approved backend exists.
- native-linux-task-supervisor.ts superviseNativeLinuxTask unconditionally refuses PROCESS_CREATION_WITNESS_UNIMPLEMENTED. Its diagnostic route always returns diagnostic-zero-origin, standing:false, complete:false, retaining NATIVE_LINUX_PROCESS_CREATION_WITNESS_UNIMPLEMENTED even after a successful child/replay.
- native-service-supervisor.ts has a real older host-oriented lifecycle/provisioner implementation, but it is not integrated/admitted as the required same-Linux backend; using it instead would evade ADR-SCR-0020.
- native-input-provenance.ts explicitly refuses exec/execSync/execFile/execFileSync/spawnSync (lines1576–1577); EST's two real execFileSync('bash',['backend/database/seed.sh']) calls cannot be fixed by environment wiring.
- native-service-profile.schema.json currently admits only postgres:16-alpine@sha256:... for the PostgreSQL artifact. DETRAN DDL requires postgis plus pgcrypto, uuid-ossp and citext; its real CI image is PostGIS. A plain postgres image is insufficient, and no install during measurement is allowed.

Supported current path: retain the five non-DB exact native attempts with genuine failures/results, run the four complete DB populations through the existing ordinary isolated CI job as supplemental evidence, and keep their effective native obligations blocked. This is not completion of their native standing. No current supported profile/precursor shortcut discharges the DB obligations. Detailed correction scope: /tmp/c6-owned-postgres-repair-packet.md.

Ordinary CI already applies full DDL, seed and legacy preparation with explicit disposable authorization before nine bare-Vitest steps. That confirms an existing execution recipe; it does not make that job's un-nonced reporter output a native receipt. The native reporter repair, internal link metadata and Rollup pin do not implement service custody.

Graft was queried first; its active graph returned DETRAN lexical hits for the provider query, so exact provider files/policies were inspected directly. No indexing/completeness claim is made. Graft estimated1525 tokens saved for this task.
