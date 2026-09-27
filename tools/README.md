# tools

Repo-local engineering tooling (not shipped, not a runtime dependency of any app):

- Blueprint generators (`tools/blueprints/`, ported from teat), **regenerable-only** — a CI
  drift check compares generated files to blueprint output; generated files are never
  hand-edited.
- Verification scripts as gates accrete (boundary checks, decorator checks, OpenAPI
  drift), unless a script belongs to a specific workspace package.

Checks with their own entry below (the complete gate chain is the `check` script of the root `package.json`):

- `verify-controller-decorators.ts` — protected routes require `@Resource` and
  `@Action`; mutating routes require structured `@Audit` metadata.
- `check-rls-ddl.ts` — static policy coverage for tables carrying `tenant_id`.
- `check-rls-smoke.ts` — live cross-tenant denial, automatic tenant assignment
  and audit-chain persistence against the `detran` database.
- `verify-senatran-boundary.ts` — scans runtime source for direct national base
  URLs, SENATRAN auth headers and provider hosts outside
  `packages/senatran-adapter` (ADR-0003/ADR-0008).
- `verify-pec-parity.ts` — fail-closed accounting of every reviewed PEC
  acceptance criterion as either executable or explicitly blocked, plus the
  complete legacy-spec disposition ledger.
- `refresh-pec-test-disposition.mjs` — regenerates the 611-row legacy PEC test
  ledger from an explicitly supplied, read-only origin checkout.

Scripts of the root `package.json` that call `tools/`:

| Script                        | Command                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify:decorators`           | `tsx tools/verify-controller-decorators.ts`                                                                                                         |
| `verify:rls-ddl`              | `tsx tools/check-rls-ddl.ts`                                                                                                                        |
| `verify:role-catalog`         | `tsx tools/check-role-catalog.ts`                                                                                                                   |
| `verify:lifecycle-vocabulary` | `tsx tools/check-lifecycle-vocabulary.ts`                                                                                                           |
| `verify:senatran-boundary`    | `tsx tools/verify-senatran-boundary.ts`                                                                                                             |
| `verify:pec-parity`           | `tsx tools/verify-pec-parity.ts`                                                                                                                    |
| `verify:pec-superset`         | `tsx tools/verify-pec-superset.ts`                                                                                                                  |
| `verify:orchestra-bridge`     | `bash tools/orchestra/bridge.test.sh && bash tools/orchestra/worker.test.sh`                                                                        |
| `backend:rls-smoke`           | `tsx tools/check-rls-smoke.ts`                                                                                                                      |
| `ci:backend-full`             | `bash tools/ci/run-backend-kernel.sh`                                                                                                               |
| `ci:backend-kernel:local`     | `node tools/ci/run-backend-kernel-local.mjs`                                                                                                        |
| `devai:rc:prepare`            | `node tools/ci/prepare-local-rc.mjs`                                                                                                                |
| `devai:rc:publish`            | `node tools/ci/publish-local-rc.mjs`                                                                                                                |
| `blueprints:generate`         | `node tools/blueprints/generate.mjs`                                                                                                                |
| `parameters:generate`         | `node tools/parameters/generate-seed.mjs`                                                                                                           |
| `parameters:test`             | `node --test tools/parameters/tests/*.test.mjs`                                                                                                     |
| `verify:parameter-catalogue`  | `node tools/parameters/verify.mjs --check-generated --check-usage`                                                                                  |
| `blueprints:check`            | `node tools/blueprints/check.mjs`                                                                                                                   |
| `contracts:openapi`           | `node tools/contracts/generate-openapi.mjs`                                                                                                         |
| `contracts:check`             | `node tools/contracts/generate-openapi.mjs --check && node tools/contracts/check-commands.mjs && node tools/contracts/generate-clients.mjs --check` |
| `contracts:test`              | `node --test tools/contracts/tests/*.test.mjs`                                                                                                      |
| `contracts:clients`           | `node tools/contracts/generate-clients.mjs`                                                                                                         |
| `docs:kb:check`               | `node tools/docs/kb/check.mjs`                                                                                                                      |
| `docs:kb:cutover-check`       | `node tools/docs/kb/check.mjs --cutover`                                                                                                            |
| `docs:kb:publish-check`       | `node tools/docs/kb/publish-dry-run.mjs`                                                                                                            |
| `verify:state-index`          | `node tools/docs/state-index/check.mjs`                                                                                                             |
| `test:state-index`            | `node --test tools/docs/state-index/tests/*.test.mjs tools/docs/adr/tests/*.test.mjs`                                                               |
| `adr:renumber`                | `node tools/docs/adr/renumber.mjs`                                                                                                                  |

Local stack (`tools/detran-stack*`, `tools/stack/`): pendente R-0017.

Keep entries small and single-purpose; anything platform-generic belongs in stynx or
devai, not here.
