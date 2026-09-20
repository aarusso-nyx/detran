# Manual command contracts

Architect-authored OpenAPI 3.1 command contracts belong in this directory.
Generated blueprint contracts remain in the parent directory and are never
hand-edited. The generator and its root-level orphan detection stay unchanged.

The exact future RAIT intake contract is
`docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`.
TASK-0029 authors it under the C4-OD V3 contract; this documentary delta creates
only this guide. The JSON does not yet exist and has no validation PASS.

## Mandatory executable validation

Run from the repository root, after the
authorized TASK-0029 creates the contract. The installed `openapi-typescript`
CLI uses OpenAPI parsing and reference resolution; derive the absolute input
path from the repository root because `pnpm --filter ... exec` changes the working directory.
Output is discarded so this check generates no tracked types or other files.

```bash
set -e
export RAIT_MANUAL_CONTRACT="$PWD/docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json"
test -s "$RAIT_MANUAL_CONTRACT"
pnpm --filter @detran/senatran-adapter exec openapi-typescript "$RAIT_MANUAL_CONTRACT" > /dev/null
pnpm --filter @detran/senatran-adapter exec node --input-type=module <<'NODE'
import { createRequire } from 'node:module';
const { createConfig, lint } = createRequire(import.meta.resolve('openapi-typescript'))('@redocly/openapi-core');
const config = await createConfig({ rules: { struct: 'error', 'no-unresolved-refs': 'error' } });
const problems = await lint({
  ref: process.env.RAIT_MANUAL_CONTRACT,
  config,
});
for (const problem of problems) console.error(problem.ruleId, problem.message);
if (problems.length > 0) process.exit(1);
console.log('Manual OpenAPI structure/reference PASS');
NODE
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import fs from 'node:fs';
const file = process.env.RAIT_MANUAL_CONTRACT;
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.match(document.openapi, /^3\.1\.\d+$/);
assert.ok(document.paths && Object.keys(document.paths).length > 0, 'No paths');
const methods = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
let count = 0;
for (const [path, item] of Object.entries(document.paths)) {
  assert.ok(path.startsWith('/'), 'Invalid path');
  let operations = 0;
  for (const [method, operation] of Object.entries(item)) {
    if (!methods.has(method)) continue;
    operations++;
    count++;
    assert.ok(typeof operation.operationId === 'string' && operation.operationId.trim(), 'Missing operationId');
    const responses = Object.keys(operation.responses ?? {});
    assert.ok(responses.length > 0, 'No responses');
    assert.ok(responses.some((status) => /^2(?:\d\d|XX)$/.test(status)), 'No success response');
  }
  assert.ok(operations > 0, 'Path has no executable operation');
}
assert.ok(count > 0, 'No operations');
assert.ok(document.paths['/v1/inf/rait/cases']?.post, 'Missing intake POST');
console.log(`Manual OpenAPI surface PASS: ${Object.keys(document.paths).length} paths, ${count} operations`);
NODE
pnpm contracts:check
```

Every command must exit zero; absence, empty input, structural validation or
parse/resolution failure,
missing intake POST, zero paths/operations/responses or missing success response
blocks completion. No `|| true`, missing-file skip or generated-only PASS can
satisfy this gate. Record the exact path, SHA-256, commands, exit codes and
positive counts. Parsing and these minimum checks do not establish behavioral
parity: review the POST request/response against C4-OD, including existing intake,
proofs, authenticated actor/tenant, Idempotency-Key, command envelope and ETag,
with no If-Match requirement for creation and no new qualification endpoint.

The Redocly API is resolved through the installed `openapi-typescript` package,
without a pnpm-store path or new dependency. Its `struct` and
`no-unresolved-refs` rules are mandatory for the new manual document; the CLI
alone is insufficient for structural validation. Do not apply these new rules
to the legacy generated population or change its checker to hide findings.

## Consumers and acceptance

The binding specification is
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`, with sequencing in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md` and
`work/rounds/R-0007/prompts/C4-OD-V3-INDEX.md`.
`work/rounds/R-0007/prompts/TASK-0029.md` is the authoring consumer;
`work/rounds/R-0007/prompts/TASK-0020-V3.md` and
`work/rounds/R-0007/prompts/TASK-0021-V3.md` consume the exact JSON as the
sensor and implementation reference; regeneration/verification in
`work/rounds/R-0007/prompts/TASK-0022-V3.md` and delivery review must preserve
and revalidate it. The coordinator reconciles these consumers, task allowlists
and readset hashes before the independent documentary review and any resumption.

Manual validation and unchanged `pnpm contracts:check` must both PASS before
TASK-0029 preparation completes and at each subsequent acceptance gate,
including SQL review, DB rehearsal acceptance, TASK-0030, TASK-0024, TASK-0025,
preflight, TASK-0020/0021, TASK-0022 and delivery review. Revalidate current bytes;
a changed hash invalidates prior validation. Missing input or evidence blocks.
This adds no tooling write permission, worker dispatch, DB authority or claim
that a future contract passed. SQL-byte review before apply and full DB PASS
before TASK-0030 remain separate mandatory gates.
