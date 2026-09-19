# CTG-0002 final corrective review — read set

## Authority, prior verdict and correction record

- `work/rounds/R-0007/contracts/CTG-0002.md`
- `work/rounds/R-0007/reports/CTG-0002-TECHNICAL-CLOSURE-CONTRACT.md`
- `work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`
- `work/rounds/R-0007/reports/CTG-0002-FINAL-CANDIDATE.md`
- `work/rounds/R-0007/reviews/attempt-2/ctg-0002-final.json`
- `work/rounds/R-0007/tasks/TASK-0078.json`
- `work/rounds/R-0007/tasks/TASK-0079.json`
- `work/rounds/R-0007/tasks/TASK-0080.json`

## Corrected runtime and generated contract

- `backend/domains/inf/rait-case/src/handwritten/rait-case-transition.port.ts`
- `backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts`
- `backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts`
- `docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json`
- `backend/database/ddl/35-inf-rait-worklist.sql`
- `backend/database/ddl/36-inf-rait-session.sql`
- `tools/blueprints/generate.mjs`

## Frozen structural proof and regression gates

- `backend/app/tests/e2e/rait-ctg2-final-structural.e2e.spec.ts`
- `backend/domains/inf/rait-worklist/tests/unit/rait-worklist-production-red.spec.ts`
- `backend/domains/inf/rait-worklist/tests/integration/rait-worklist-command-transaction.integration.spec.ts`
- `backend/domains/inf/rait-session/tests/unit/rait-session-deliberation-minutes-red.spec.ts`
- `backend/domains/inf/rait-session/tests/integration/rait-session-command-transaction.integration.spec.ts`
- `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`
- `backend/database/tests/run-backend-ci.mjs`

The frozen manifest covers every changed and untracked candidate file. Grep or
Glob may be used to trace imports, generated outputs, policies and the 20-route
surface when a claim in the read set requires it.
