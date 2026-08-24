# packages/senatran-adapter — the sole national-API boundary (placeholder)

**Contract (binding — ADR-0003):** no app or backend domain module ever calls SENATRAN
directly. All national-system traffic flows
`[SENATRAN-REAL]|[SENATRAN-MOCK] ⇄ [SENATRAN-ADAPTER] ⇄ backend ⇄ apps`.

Built in Phase 2 (W2.2). The package will provide:

- **Typed ports per national system**: renainf, renaest, renach, sne, cdt,
  wsdenatran-read (renavam-ready). English domain types mapped from Portuguese wire
  DTOs, generated from
  `senatran-mock/docs/framework/contracts/openapi{,-transactional}.yaml`.
- **`SENATRAN_PROVIDER=mock|real`** config switching (generalising pec's
  `RENACH_PROVIDER` pattern): one client implementation, different base URL and auth
  material per provider.
- **Resilience** via `@stynx-nyx/integration-adapter`: circuit breaker, timeouts,
  retries actually enabled, idempotency keys on writes (pec's deterministic-key +
  `ALREADY_OPEN` recovery), error envelope `{returnCode,message}` mapped to a category
  taxonomy.
- **Test kit**: magic-key/fixture helpers; contract tests run against senatran-mock
  composed in CI. The real target ships behind per-surface feature flags.
- **Boundary enforcement**: a repo check in the style of teat's `.stynxrc.json` +
  `verify-stynx-boundary.ts` fails CI on any direct SENATRAN usage outside this
  package.
