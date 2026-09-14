# @detran/inf-deadlines

Handwritten library (not blueprint-generated) implementing
`docs/framework/arch/rait-deadline-engine.md` for `inf/infraction`,
`inf/notification` and `inf/rait-case` (ADR-0016 §2). No routes, no jobs, no
database access: callers inject `Clock`, `Calendar`, `TimerCatalog` and a
`TimerStore` port. Tests: `pnpm --filter @detran/inf-deadlines test`.
