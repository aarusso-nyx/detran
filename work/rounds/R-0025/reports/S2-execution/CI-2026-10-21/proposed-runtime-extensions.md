# Architect — two exact CI repair proposals, awaiting Owner

## TEAT backlog replay (four paths)

Exact packet teat-repair-approval-packet.json and proposed two-path runtime diff
teat-topic-before-limit-proposed.patch. Existing optional topic filter must apply
before SQL LIMIT; keep tuple cursor, ordering, RLS, request policy,24h horizon,
200-row default,1s polling,20s heartbeat and2000ms test budget. Two runtime paths:
backend/app/src/teat-stream.{service,controller}.ts. Inspector paths:
backend/app/tests/e2e/teat-stream.e2e.spec.ts and existing service.spec.ts.
Inspector first proves backlog601 with actual HTTP/Postgres, preserving original
eight controls; Engineer changes only after genuine RED; independent GREEN and
full kernel afterward. Default no-topic behavior unchanged. No schema/index/grant
or new endpoint. Needed because S2 original inventory excludes these four paths.

## Complete51 incident physical batching (three paths)

Exact incident51-batching-approval-packet.json defines fixed discovery SQL, row
projections and equivalence rules. Runtime only backend/app/src/rait-risk.providers.ts;
Inspector only existing claim.e2e and claim.fixture. Group repeated one-case clock,
timer, parameter, alert and incident discovery/projection SELECTs in the same
transaction. Keep every independent qualification/re-read/dependency verification.
No cache, skipped sources, reader result reuse, type/date/JSON conversions, grant,
writer, schema/index, policy, semantic ordering or frontend change. Freeze current
RED and instrument query counts first, prove scalar-vs-bulk exact typed semantics
and all positive/negative/concurrency controls; full124 and kernel required.
No guarantee of performance improvement; fail closed if under30s cannot be proved.
R14 explicitly excluded provider inventory optimization, so this needs a separate
bounded Owner amendment. Population51, complete controls, deadlines30s and existing
assertions remain unchanged. Production qualification/F3/DRESET/review and evidence
chain blockers are unaffected. No renewed blanket Owner delegation is requested.
