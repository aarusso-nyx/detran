# CTG-0002 final delivery — read set

## Authority and closure

- `work/rounds/R-0007/contracts/CTG-0002.md`
- `work/rounds/R-0007/reports/CTG-0002-TECHNICAL-CLOSURE-CONTRACT.md`
- `work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`
- `work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`
- `work/rounds/R-0007/reports/CTG-0002-FINAL-CANDIDATE.md`
- `work/rounds/R-0007/tasks/TASK-0065.json`
- `work/rounds/R-0007/tasks/TASK-0066.json`
- `work/rounds/R-0007/tasks/TASK-0067.json`
- `work/rounds/R-0007/tasks/TASK-0068.json`
- `work/rounds/R-0007/tasks/TASK-0069.json`
- `work/rounds/R-0007/tasks/TASK-0070.json`
- `work/rounds/R-0007/tasks/TASK-0071.json`
- `work/rounds/R-0007/tasks/TASK-0072.json`
- `work/rounds/R-0007/tasks/TASK-0073.json`
- `work/rounds/R-0007/tasks/TASK-0074.json`
- `work/rounds/R-0007/tasks/TASK-0075.json`
- `work/rounds/R-0007/tasks/TASK-0076.json`
- `work/rounds/R-0007/tasks/TASK-0077.json`

## Blueprint, SQL and composition

- `docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`
- `docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json`
- `backend/database/ddl/35-inf-rait-worklist.sql`
- `backend/database/ddl/36-inf-rait-session.sql`
- `backend/database/tests/fixtures/rait-priority-upgrade/v1.1.0/ddl/36-inf-rait-session.sql`
- `backend/database/seed/20-fixtures-rait.sql`
- `backend/app/src/app.module.ts`
- `backend/app/src/detran-runtime.ts`

## Product runtime and trust

- `backend/domains/inf/rait-case/src/handwritten/rait-case-transition.port.ts`
- `backend/domains/inf/rait-case/src/handwritten/rait-document-trust.verifier.ts`
- `backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts`
- `backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-commands.controller.ts`
- `backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts`
- `backend/domains/inf/rait-session/src/handwritten/rait-session-commands.controller.ts`
- `backend/domains/shared/src/documents/document-trust.ts`
- `backend/domains/shared/src/documents/document-trust.http-adapter.ts`
- `backend/domains/shared/src/documents/documents-facade.ts`
- `backend/domains/shared/src/policy.ts`

## Frozen sensors and final coverage

- `backend/domains/inf/rait-worklist/tests/unit/rait-worklist-production-red.spec.ts`
- `backend/domains/inf/rait-worklist/tests/integration/rait-worklist-production-red.integration.spec.ts`
- `backend/domains/inf/rait-worklist/tests/integration/rait-worklist-command-transaction.integration.spec.ts`
- `backend/domains/inf/rait-session/tests/unit/rait-session-agenda-production-red.spec.ts`
- `backend/domains/inf/rait-session/tests/unit/rait-session-deliberation-minutes-red.spec.ts`
- `backend/domains/inf/rait-session/tests/integration/rait-session-command-transaction.integration.spec.ts`
- `backend/domains/shared/src/documents/document-trust-session-minutes.spec.ts`
- `backend/app/tests/e2e/rait-worklist-production.e2e.spec.ts`
- `backend/app/tests/e2e/rait-session-agenda-production.e2e.spec.ts`
- `backend/app/tests/e2e/rait-session-deliberation-minutes-production.e2e.spec.ts`
- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`
- `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`
- `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts`
- `tools/parameters/tests/generator.test.mjs`
- `tools/parameters/verify.mjs`
