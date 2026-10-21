# C5 source-derived invariant proposal (read-only)

Candidate inspected: DETRAN 73c0b877980ce0e4f20fdd624c2f223a447c0e98. No repository, state, evidence or Git mutation was performed. Architect assessment; the test executions below are supplemental ordinary test runs, not native measurements or chain receipts.

## Decision

Two bounded new declarations are supportable from approved existing contracts, with semantic tests already present. Do not change INV-AUTH-001, any of the seven C6 gate statements, thresholds, runtime behavior, historical contracts or round evidence. A new ADR-0056 should explain the decomposition and taxonomy normalization, distinguish specification presence from execution standing, and preserve historical authority scope. This is additive transcription, not approval of the draft RAIT error catalogue.

## 1. INV-RBAC-001 (new; client domain RBAC; type rbac)

Proposed statement: “For explicitly resource/action-decorated routes, the shared DetranPolicyGuard MUST enforce the existing declared policy matrix: mapped roles are permitted; unmapped roles and absent principals are denied; explicitly public routes retain their declared bypass. It MUST preserve the shared ForbiddenException boundary, including RAIT resources; the application adapter owns any approved RAIT error-envelope translation.”

This scope deliberately does not promise that undecorated routes are denied: the current shared guard permits missing resource/action metadata, and completeness is a separate decorator gate. It creates no grants, role aliases, route permissions or default-deny semantics beyond the approved guard boundary. Existing INV-AUTH-001 remains the independent RAIT/portal policy obligation.

Authority: docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md Decision (one namespaced matrix, decorator enforcement); ADR-0005-unified-backend-kernel.md Decision 3–4 (role identities and policy namespaces); work/rounds/R-0007/contracts/CTG-0001.md lines 868–888 (explicit approved shared guard preservation and app-owned RAIT translation). Earlier conflicting §1 error-envelope text is not silently revived. The R-0007 scoped amendment explicitly preserves permitted/denied decisions and missing-principal denial.

Meaningful producer proposal: new static tools/security/invariants/rbac.config.mjs, root backend/domains/shared, include the COMPLETE src/policy.guard.spec.ts and src/policy.spec.ts populations, name detran-invariant-rbac, existing workspace aliases, passWithNoTests:false, no name filters/skips or service fixtures. New native unit_test task invariant-rbac / population detran-invariant-rbac-v1, exact native runner/reporter/nonce contract consistent with the seven existing producers; fail-closed unconditional CI execution. This is a new binding to existing tests, not a generic unrelated passing task.

Required native ID tuples (encode through the existing test:v1 identity convention, preserving these exact strings):
- [detran-invariant-rbac, backend/domains/shared/src/policy.guard.spec.ts, [DetranPolicyGuard], allows a mapped role]
- same file/suite: denies an unmapped role
- same file/suite: denies a protected route with no principal
- same file/suite: allows explicitly public routes
- same file/suite: dado papel negado em recurso inf:rait-* quando o guard compartilhado avalia então preserva ForbiddenException
- same file/suite: dado papel negado fora de inf:rait-* quando o guard avalia então preserva ForbiddenException sem prefixo RAIT
- same file/suite: dado ausência de principal em recurso inf:rait-* quando o guard avalia então preserva a falha de autenticação vigente
- [detran-invariant-rbac, backend/domains/shared/src/policy.spec.ts, [DETRAN unified policy kit], dado cada regra CTG-0001 quando consultada por todos os papéis então concede somente os papéis canônicos permitidos]
- same policy suite: keeps every policy key domain namespaced
- same policy suite: grants RAIT command and surface rules only to RAIT staff roles

RBAC is absent from the current allowed domain taxonomy. Legitimate supported configuration is ADD RBAC to law/policy/adopter-policy.json domains.client, increment the policy identity, and run official init bind --adopter-policy so the projection declares it. Provider services/adopter-policy.ts merges client names while refusing collisions with immutable core/framework names; RBAC is not such a collision. Do not hand-edit .devai/config/domains.json or relabel AUTH merely to satisfy the sensor. New taxonomy and semantic declaration merit ADR-0056 and independent review.

## 2. INV-API-001 (new; existing core domain API; type error_semantics)

Proposed statement: “The shared DetranError and version helpers MUST preserve the approved CTG-0001 §1 semantics: stable code/status and prefix-derived messageKey; assertIfMatch rejects absent, empty or malformed versions with <PREFIX>.IF_MATCH_REQUIRED/428, rejects a differing version with <PREFIX>.VERSION_CONFLICT/412 and expected version, accepts the approved matching version representations, and etagOf emits a quoted version.”

Scope: backend/domains/shared/src/errors/detran-error.ts and if-match.ts only; applies to helper callers, not every endpoint. No new error codes, status, retry/deadline budgets, PII redaction guarantee, UI behavior, side-effect atomicity claim or exception for claim-next is inferred.

Authority: work/rounds/R-0008/contracts/CTG-0001.md §1 and acceptance C-0001-01..04, backed by work/rounds/R-0008/AUTHORIZATION.md decision GRANTED. CTG defines the exact derivation, 428/412 distinction, expected version, accepted representations and ETag. docs/framework/arch/errors-contract.md remains an index and must cross-reference this accepted scoped source without changing the draft status of rait-error-catalog.md.

Producer proposal: new static tools/security/invariants/errors.config.mjs, root backend/domains/shared, include COMPLETE src/errors/detran-error.spec.ts, name detran-invariant-errors; new native unit_test task invariant-errors/population detran-invariant-errors-v1. Mandatory IDs should cover all 13 existing tests (including the context example only as preservation, not redaction), using the actual nested suites. In particular the eight assertIfMatch cases must remain distinct: absent, empty, malformed, divergent, quoted matching, weak quoted matching, plain matching, RAIT absent; constructor C-0001-01/02 and quoted ETags 7/0 complete the contract. Generate required IDs from the actual collection plan, review the exact population, and persist only native execution with its genuine nonce/custody and correct candidate. Do not hand-author a successful reading.

Severity/change policy: preserve hard-fail and test_weakening_allowed:false conventions; adding the declarations does not lower any configured threshold. Trace each declaration to the specific approved contract anchor and the named actual test files through law/trace.json; use schema-valid provenance and authority_docs, update current catalogue metadata only through its supported process. Do not rewrite historical statements/contracts.

## Bounded implementation surface if approved

New ADR-0056 and its current index; two new law/invariants JSON files plus current invariant catalogue/version only as required; law/trace.json entries for the two new IDs; canonical adopter-policy client taxonomy and invariant_producers bindings; test-tasks.json two exact tasks; two static configs; two unconditional CI producer steps; errors-contract.md scoped source/invariant cross-reference. Native config projections/bindings and evidence only through official registered commands. No runtime, tests, SQL migrations, product permissions, package versions, thresholds, historical evidence or sibling source changes are necessary for this DETRAN work.

## Remaining real gaps and honest effects

- spec_security_coverage currently recognizes RBAC by domain literally, without proving it. An approved, meaningful new RBAC declaration would address that signal; it does NOT prove all route grants, tenant isolation or effective production enforcement.
- The SQL PII registry signal remains absent: no authentic approved INSERT INTO core.pii_map exists in the configured DDL populations. The C3 supplemental JSON PII inventory is not equivalent native SQL evidence. Do not fabricate SQL, assert “no personal data”, or repoint to an unrelated table. Keep SPEC_SECURITY_NO_PII_REGISTRY as REVIEW and separately decide whether a real approved product registry or bounded provider support for authentic JSON inventories is appropriate.
- spec_robustness_targets counts error_semantics presence and the error contract. These declarations could legitimately satisfy that specification sensor after approval and validation; that is not a blanket robustness readiness verdict. Actual native producer standing remains independently required by harness invariant alignment.
- Native execution provider/platform limitations remain explicit until installed repaired provider executes and records the exact candidate. Ordinary tests passing below cannot replace native receipts, nor the factual audit custody.

## Actual supplemental verification

Command: pnpm --filter @detran/shared test src/policy.guard.spec.ts src/errors/detran-error.spec.ts. Exit 0; 2 files, 20 tests passed; Vitest 4.1.11; raw stdout/stderr retained at /tmp/devai-c5-existing-semantic-tests.log. This executes the real existing functions with their present positive/negative examples and does not alter tests or run a native sensor.

Command: pnpm --filter @detran/shared test src/policy.spec.ts. Exit 0; 1 file, all 729 tests passed; Vitest 4.1.11. Raw stdout/stderr: /tmp/devai-c5-existing-policy-tests.log. Combined supplemental total: 3 files / 749 tests passed. No native scorecard or producer-standing claim follows from these ordinary executions.
