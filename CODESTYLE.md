# CODESTYLE.md

Style rules for the DETRAN monorepo. Mechanical rules are enforced by Prettier (`pnpm
format:check`), TypeScript strict mode and the `tools/*.ts` gates inside `pnpm check`; the rest
is convention that reviewers and agents enforce. Companion of `AGENTS.md` (governance) and
`docs/framework/arch/rait-build-pack.md` (what to build).

## TypeScript

- **Strict, ESM, TS 6.** `strict: true`; no `any` in `src` (relaxed in tests); ESM specifiers end
  in `.js` even when importing `.ts` sources; `import type` for type-only imports.
- **Prettier**: single quotes, trailing commas, 2-space indent, LF, UTF-8, 80 columns.
- **Naming**: `lowercase-hyphenated` filenames; `PascalCase` types/classes; `camelCase` values;
  `SCREAMING_SNAKE` only for canonical tokens (states, timers, events) and constants.
- **Domain vocabulary is Portuguese** and comes from the workflows: state tokens, timer codes,
  role codes, error codes and i18n keys are copied, never translated or abbreviated. Column and
  API field names are English `snake_case`/`camelCase` (as the generated modules do); enum values
  keep the canonical Portuguese token.
- No unused variables except `^_`; no `console.log` outside tools; no `Date.now()` in domain code
  (inject `Clock`).

## Backend (NestJS, STYNX)

- Generated modules (`Generated from BP-…` header) are **never edited**. Behaviour lives in
  `backend/domains/inf/<module>/src/handwritten/` and is exported through the blueprint's
  `handwrittenExports`.
- Command shape: one file per command with `parse` (zod), `guard` (state + role + preconditions),
  `apply` (writes inside one `Database.tx`), `events` (outbox in the same transaction). Controller
  methods only extract params and call the command.
- Decorators on every route: `@Resource('inf:rait-<resource>')`, `@Action('<verb>')`,
  `@Audit({ action: 'INF_RAIT_<RESOURCE>_<VERB>', entity: 'inf.<table>' })` on mutations
  (`verify:decorators`).
- Errors: `throw new RaitError('RAIT.<CODE>', { status, context })` — the code must exist in
  `docs/framework/arch/rait-error-catalog.md`; `context` carries ids and tokens only.
- Concurrency: `If-Match` on every command (428/412); `Idempotency-Key` on creations.
- Tenant: never in payloads; always from `RequestContext`; RLS is the last line, not the first.
- SQL: parameterized only; `snake_case`; DDL is canonical (`backend/database/ddl/NN-*.sql`,
  applied by `apply.sh`); hand-written DDL only in the `0x`/`1x` ranges; reference tables are
  seeded with `ON CONFLICT … DO UPDATE`.
- National systems: only through `packages/senatran-adapter` (`verify:senatran-boundary`).

## Frontend (Angular 22, `@detran/ui`, STYNX 1.4.0)

- Standalone components, `ChangeDetectionStrategy.OnPush`, signals; no NgModules in app code;
  `inject()` over constructor injection.
- Bootstrap only through `provideDetranAuthenticatedApp`; no custom auth/tenant providers.
- Primitives (table, pagination, toast, banner, spinner, empty state) come from the kit; never
  reimplemented. Domain components live in `shared/` with typed `input()`/`output()`.
- Every visible string goes through the `translate` pipe with a `rait.*` key from
  `docs/framework/arch/i18n/rait.pt-BR.json`.
- No deadline, timeliness or queue-order computation in the browser.
- File layout per feature: `<feature>.routes.ts`, `pages/`, `components/`, `<feature>.facade.ts`,
  `<feature>.client.ts` (generated wrapper).

## Tests

- Tiers and naming: `*.spec.ts` (unit, co-located or `tests/unit`), `*.integration.spec.ts`,
  `*.e2e.spec.ts`, `*.real.spec.ts`; see `docs/framework/arch/rait-test-strategy.md`.
- Test names: "dado <fixture> quando <ação> então <efeito>"; fixtures by canonical id; fixed clock.
- Never `it.skip` without an `OD-nnn`; never lower timeouts or coverage.

## Docs

- Knowledge-base conventions in `docs/meta/knowledge-base/conventions.md` (front-matter, brackets,
  canonical tokens in backticks only when owned by a workflow, `pnpm docs:kb:check`).
- Architecture docs (`docs/framework/arch/`) carry `id`, `title`, `status`, `apps`, `updated`.
- Diagrams: Mermaid source in the document, rendered SVG next to it; regenerate on change.

## Git

- Branch: `<type>/<scope>-<short-desc>` (e.g. `feat/rait-case-admit`). Never push to `main`.
- Commit message (Conventional Commits): `<type>(<scope>): <imperative summary>` — types `feat`,
  `fix`, `docs`, `chore`, `test`, `refactor`, `build`, `ci`; scopes `rait-case`, `rait-worklist`,
  `rait-session`, `infraction`, `rait-web`, `ui`, `shared`, `ddl`, `kb`, `adr`, `devai`. Body
  explains what and why, cites `WF-`/`UC-`/`RN-`/`OD-` ids, ends with the attribution trailer
  agreed for the session and the DEVAI evidence reference when applicable.
- One logical change per PR; generated files committed together with their blueprint; PR body
  follows `.github/pull_request_template.md`.
