# S2 exact HTTP sensor corrections

Inspector, Constitution Article 7. TASK-0040; parent owns Git and DB lease remains with Engineer. You are not alone; preserve all other edits. Work only in the existing HTTP Inspector checkout.

Own only backend/app/tests/e2e/rait-p402-claim.e2e.spec.ts and scoped inspector-http-sensor-correction reports. No runtime, source, fixture, timeouts, skipped tests, thresholds, DB or Git changes. Preserve the historical frozen99 hashes/results and explicitly capture the amended sensor hashes.

Classified sensor-errors: (1) C movement SQL uses reserved bare alias day. Use AS "day" preserving the exact result key and assertion. (2) exactClaimPersistence outbox selector includes a pre-existing admission self-transition ADMITIDO→ADMITIDO; actual claim delta/state/stages/outbox checks passed but broad historical filter counts that unrelated event. Independently inspect source and genuine debug evidence before choosing the narrow exact claim key/transition-pair filter. Retain exact event payload, count, topic, idempotency-key uniqueness, no duplicate/no unrelated new event assertions and all rollback/race controls. Do not modify admission runtime, approve a self-transition or weaken expected cardinality. Record before/after source basis and hashes, reach for graft first and trace callers before altering helper.

Read /tmp/detran-s2-backend-http-debug5.log and current Engineer runtime read-only. If evidence suggests an actual implementation bug rather than sensor-error, report and leave that assertion unchanged. Author syntax/filter corrections only, run source/type checks as feasible without DB, clearly label prerequisite failures. Full unchanged amended99 GREEN requires later exclusive DB transfer; no filtered/debug run is full acceptance.
